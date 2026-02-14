import {
    Participant,
    WarikanEvent,
    RoundingUnit,
    RoundingMethod,
    AdjustmentPriority,
    ADJUSTMENT_PRIORITIES,
    ROUNDING_METHODS
} from '../types/index';

/**
 * 金額を丸める
 */
const roundAmount = (amount: number, unit: RoundingUnit, method: RoundingMethod): number => {
    switch (method) {
        case ROUNDING_METHODS.ROUND:
            return Math.round(amount / unit) * unit;
        case ROUNDING_METHODS.CEIL:
            return Math.ceil(amount / unit) * unit;
        case ROUNDING_METHODS.FLOOR:
            return Math.floor(amount / unit) * unit;
        default:
            return Math.round(amount / unit) * unit;
    }
};

/**
 * 割り勘計算のメインロジック
 * 1. 固定額のある人を先に引く
 * 2. 残額を係数（weight）に従って配分
 * 3. 指定単位で丸める
 * 4. 合計との差分を調整ルールに従って配布
 */
export const calculateAllocation = (
    totalAmount: number,
    participants: Participant[],
    roundingUnit: RoundingUnit,
    roundingMethod: RoundingMethod,
    adjustmentPriority: AdjustmentPriority
): Participant[] => {
    if (participants.length === 0) return [];

    // 1. 各参加者の初期状態コピー
    let results = participants.map(p => ({ ...p, calculatedAmount: 0 }));

    // 2. 固定額の処理
    let remainingTotal = totalAmount;
    let weightSum = 0;
    const weightedParticipantsIndices: number[] = [];

    results.forEach((p, index) => {
        if (p.fixedAmount !== undefined && p.fixedAmount !== null) {
            p.calculatedAmount = p.fixedAmount;
            remainingTotal -= p.fixedAmount;
        } else {
            weightSum += p.weight;
            weightedParticipantsIndices.push(index);
        }
    });

    // もし固定額だけで合計を超えていたら、そこまでで計算終了（バリデーションエラーはUI側でハンドリング想定）
    // ここでは負にならないようにクリップするか、そのまま計算してマイナスを許容するか...
    // MVPとしては、一旦計算自体は行う。

    // 3. 傾斜配分 & 丸め
    if (weightSum > 0) {
        weightedParticipantsIndices.forEach(index => {
            // 厳密な配分額
            const rawShare = remainingTotal * (results[index].weight / weightSum);
            // 丸め実行
            results[index].calculatedAmount = roundAmount(rawShare, roundingUnit, roundingMethod);
        });
    } else if (weightedParticipantsIndices.length > 0) {
        // 係数合計が0の場合（全員weight=0など）、均等割り
        const equalShare = remainingTotal / weightedParticipantsIndices.length;
        weightedParticipantsIndices.forEach(index => {
            results[index].calculatedAmount = roundAmount(equalShare, roundingUnit, roundingMethod);
        });
    }

    // 4. 合計差分の調整
    const currentTotal = results.reduce((sum, p) => sum + (p.calculatedAmount || 0), 0);
    let diff = totalAmount - currentTotal;

    if (diff === 0) return results;

    // 調整が必要な場合
    // diff > 0 : お金が足りない -> 誰かが多く払う
    // diff < 0 : お金が余りすぎ -> 誰かが安くなる

    // 調整対象のソート（優先順位決め）
    // 調整対象は「固定額設定されていない人」を基本とするが、全員固定なら全員対象にする等のフォールバックも本来必要
    let targets = weightedParticipantsIndices.length > 0
        ? [...weightedParticipantsIndices]
        : results.map((_, i) => i); // 全員対象

    // ソートロジック
    // PAY_MORE (多く払う人): weightが大きい順、同値ならランダム or インデックス順
    // EVEN (均等): ランダム or インデックス順
    // ORGANIZER: 特定の役職（幹事）優先だが、今は役職ランクで簡易判定するなら 'boss' とか 'junior'
    // ※ MVPでは「係数が大きい人＝金持ち＝調整を被る」とするのが一般的
    // ※ ここではシンプルに AdjustmentPriority に従う

    targets.sort((a, b) => {
        const pA = results[a];
        const pB = results[b];

        // 優先度：多く払う人に寄せる
        if (adjustmentPriority === ADJUSTMENT_PRIORITIES.PAY_MORE) {
            // 足りない(diff > 0) -> 金持ち(weight大)に足す -> weight降順
            if (diff > 0) return pB.weight - pA.weight;
            // 余ってる(diff < 0) -> 金持ち(weight大)から引く？ 
            // いや、余ってるなら「安くしてあげる」ので、
            // 「多く払う人」を優先して安くするのか、「少なく払う人」をさらに安くするのか？
            // 通常、端数処理で「多く」なってしまった分を削るのが自然。
            // 端数切り上げ等の場合、全員高くなりがち。
            // ここは「weightが大きい順」に操作を行う、と統一する。
            return pB.weight - pA.weight;
        }

        // 優先度：均等（インデックス順＝登録順などで散らす）
        if (adjustmentPriority === ADJUSTMENT_PRIORITIES.EVEN) {
            return 0; // 実装依存（安定ソートならインデックス順）
        }

        // 優先度：幹事（ここでは簡易的に、weightが最も大きい人を幹事役とみなすか、あるいはロジック未定のためweight順）
        return pB.weight - pA.weight;
    });

    // 差分がなくなるまで unit ずつ調整
    let i = 0;
    while (diff !== 0) {
        const targetIndex = targets[i % targets.length];

        if (diff > 0) {
            results[targetIndex].calculatedAmount! += roundingUnit;
            diff -= roundingUnit;
        } else {
            // 0円未満にならないようにチェックが必要ならここで
            if (results[targetIndex].calculatedAmount! - roundingUnit >= 0) {
                results[targetIndex].calculatedAmount! -= roundingUnit;
                diff += roundingUnit;
            } else {
                // これ以上引けない場合はスキップ（次の人へ）
                // 全員0円でまだ引く必要がある場合は...負債になるが、割り勘アプリとしては0で止める
                // 無限ループ防止
                let allZero = true;
                for (const tid of targets) {
                    if (results[tid].calculatedAmount! > 0) {
                        allZero = false;
                        break;
                    }
                }
                if (allZero) break; // 全員0なら諦める
            }
        }
        i++;

        // 安全装置（無限ループ防止）
        if (i > 1000) break;
    }

    return results;
};
