'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { eventRepository } from '@/lib/repository';
import { WarikanEvent, Participant } from '@/types';
import { calculateAllocation } from '@/lib/calculator';

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [event, setEvent] = useState<WarikanEvent | null>(null);
    const [results, setResults] = useState<Participant[]>([]);
    const [copySuccess, setCopySuccess] = useState(false);

    const [diff, setDiff] = useState(0);

    useEffect(() => {
        if (id) {
            const data = eventRepository.getById(id);
            if (data) {
                setEvent(data);
                // 初回計算
                const allocation = calculateAllocation(
                    data.totalAmount,
                    data.participants,
                    data.roundingUnit,
                    data.roundingMethod,
                    data.adjustmentPriority
                );
                setResults(allocation);
            } else {
                router.push('/');
            }
        }
    }, [id, router]);

    // diffを計算するuseEffect
    useEffect(() => {
        if (event && results.length > 0) {
            const currentSum = results.reduce((sum, p) => sum + (p.calculatedAmount || 0), 0);
            setDiff(event.totalAmount - currentSum);
        }
    }, [results, event]);

    // 金額手動調整
    const handleAdjust = (index: number, direction: 'up' | 'down') => {
        if (!event) return;
        const unit = event.roundingUnit;
        const newResults = [...results];
        const amount = newResults[index].calculatedAmount || 0;

        if (direction === 'up') {
            newResults[index].calculatedAmount = amount + unit;
            // setDiff(prev => prev - unit); // 支払額が増えた -> 不足金(diff)が減る... ではなく、 total - currentSum = diff なので
            // total - (currentSum + unit) = diff - unit. つまり diff は減る (負の方向に進む=払いすぎ状態)
        } else {
            if (amount - unit < 0) return; // 0円未満防止
            newResults[index].calculatedAmount = amount - unit;
            // setDiff(prev => prev + unit); // 支払額が減った -> 不足金(diff)が増える
        }
        setResults(newResults); // setResultsが呼ばれると、上記のdiff計算useEffectが発火する
    };

    const handleCopy = async () => {
        if (!event || results.length === 0) return;

        const lines = [
            `イベント: ${event.name}`,
            `合計: ${event.totalAmount.toLocaleString()}円`,
            '------------------',
        ];

        results.forEach(p => {
            lines.push(`${p.name} (${p.weight}x): ${p.calculatedAmount?.toLocaleString()}円`);
        });

        // 調整中にコピーする場合の注釈を入れるか、もしくはボタンをDisableにするか。
        // ここではコピー自体は許可しつつ、差額がある場合は注釈を入れる
        if (diff !== 0) {
            lines.push(`※調整残額: ${diff.toLocaleString()}円`);
        }

        lines.push('------------------');
        lines.push('傾斜割り勘アプリ「Keisha Warikan」で計算');

        const text = lines.join('\n');

        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleBack = () => {
        router.push(`/event/${id}/participants`);
    };

    if (!event) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="flex flex-col gap-md pb-32"> {/* Footer height adjusted */}
            <div className="relative mb-6 text-center">
                <h1 className="font-bold inline-block" style={{ fontSize: '1.5rem' }}>
                    計算結果
                </h1>
                <button
                    onClick={() => router.push(`/event/${id}/settings`)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-primary font-bold px-2 py-1"
                    style={{ transform: 'translateY(-50%)', top: '50%', right: '0' }}
                >
                    設定変更
                </button>
            </div>

            <div className="text-center mb-2">
                <div className="text-lg text-muted">合計</div>
                <div className="text-3xl font-bold">{event.totalAmount.toLocaleString()}<span className="text-sm">円</span></div>
            </div>

            {diff !== 0 && (
                <div className="text-center p-2 bg-warning rounded-md text-sm font-bold animate-pulse" style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-warning)' }}>
                    {diff > 0 ? `あと ${diff.toLocaleString()} 円 足りません` : `${Math.abs(diff).toLocaleString()} 円 集めすぎです`}
                    <br /><span className="text-xs font-normal">誰かの支払額を調整してください</span>
                </div>
            )}

            <div className="flex flex-col gap-sm">
                {results.map((p, index) => (
                    <Card key={p.id} className="flex justify-between items-center animate-fade-in" style={{ padding: 'var(--spacing-md)' }}>
                        <div>
                            <div className="font-bold text-lg">{p.name}</div>
                            <div className="text-xs text-muted">係数: {p.weight}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-xl font-bold text-primary">
                                {p.calculatedAmount?.toLocaleString()}<span className="text-xs text-muted">円</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAdjust(index, 'down')}
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xl hover:bg-surface-hover"
                                    style={{ width: '32px', height: '32px' }}
                                >
                                    -
                                </button>
                                <div className="text-xs text-muted w-12 text-center">調整</div>
                                <button
                                    onClick={() => handleAdjust(index, 'up')}
                                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xl hover:bg-surface-hover"
                                    style={{ width: '32px', height: '32px' }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border flex flex-col gap-sm shadow-lg" style={{ backgroundColor: 'var(--color-surface)', zIndex: 10 }}>
                <div className="container flex flex-col gap-sm">
                    <Button
                        variant={diff === 0 ? "primary" : "ghost"}
                        style={diff !== 0 ? { backgroundColor: 'var(--color-text-muted)', color: 'white', opacity: 0.8 } : {}}
                        size="lg"
                        fullWidth
                        onClick={handleCopy}
                        disabled={results.length === 0}
                    >
                        {copySuccess ? 'コピーしました！' : (diff === 0 ? 'テキストをコピー' : '調整完了していません')}
                    </Button>
                    <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onClick={handleBack}
                    >
                        戻って修正する
                    </Button>
                </div>
            </div>
        </div>
    );
}
