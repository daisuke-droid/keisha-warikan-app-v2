'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { eventRepository } from '@/lib/repository';
import { WarikanEvent, ROUNDING_UNITS, ROUNDING_METHODS, ADJUSTMENT_PRIORITIES, RoundingUnit, RoundingMethod, AdjustmentPriority } from '@/types';

// 型をMapキーにするためのキャスト
const UNIT_KEYS = Object.values(ROUNDING_UNITS) as number[];
const METHOD_KEYS = Object.values(ROUNDING_METHODS) as string[];
const PRIORITY_KEYS = Object.values(ADJUSTMENT_PRIORITIES) as string[];

export default function SettingsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [event, setEvent] = useState<WarikanEvent | null>(null);

    // Local state for form
    const [roundingUnit, setRoundingUnit] = useState<RoundingUnit>(ROUNDING_UNITS.HUNDRED);
    const [roundingMethod, setRoundingMethod] = useState<RoundingMethod>(ROUNDING_METHODS.CEIL);
    const [adjustmentPriority, setAdjustmentPriority] = useState<AdjustmentPriority>(ADJUSTMENT_PRIORITIES.PAY_MORE);

    useEffect(() => {
        if (id) {
            const data = eventRepository.getById(id);
            if (data) {
                setEvent(data);
                setRoundingUnit(data.roundingUnit);
                setRoundingMethod(data.roundingMethod);
                setAdjustmentPriority(data.adjustmentPriority);
            } else {
                router.push('/');
            }
        }
    }, [id, router]);

    const handleSave = () => {
        if (!event) return;

        // 値を更新して保存
        const updatedEvent: WarikanEvent = {
            ...event,
            roundingUnit,
            roundingMethod,
            adjustmentPriority,
            updatedAt: Date.now(),
        };

        eventRepository.save(updatedEvent);
        router.push(`/event/${id}/result`);
    };

    const handleBack = () => {
        router.push(`/event/${id}/result`);
    };

    if (!event) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="flex flex-col gap-md pb-32">
            <h1 className="text-center font-bold" style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>
                計算設定
            </h1>

            <Card title="端数処理">
                <p className="text-sm text-muted mb-2">丸め方を指定してください</p>
                <div className="flex flex-col gap-sm">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                        <input
                            type="radio"
                            name="roundingMethod"
                            value={ROUNDING_METHODS.CEIL}
                            checked={roundingMethod === ROUNDING_METHODS.CEIL}
                            onChange={() => setRoundingMethod(ROUNDING_METHODS.CEIL)}
                            className="accent-primary"
                        />
                        <span>切り上げ (多めに集める)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                        <input
                            type="radio"
                            name="roundingMethod"
                            value={ROUNDING_METHODS.ROUND}
                            checked={roundingMethod === ROUNDING_METHODS.ROUND}
                            onChange={() => setRoundingMethod(ROUNDING_METHODS.ROUND)}
                            className="accent-primary"
                        />
                        <span>四捨五入</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                        <input
                            type="radio"
                            name="roundingMethod"
                            value={ROUNDING_METHODS.FLOOR}
                            checked={roundingMethod === ROUNDING_METHODS.FLOOR}
                            onChange={() => setRoundingMethod(ROUNDING_METHODS.FLOOR)}
                            className="accent-primary"
                        />
                        <span>切り捨て (安く済ませる)</span>
                    </label>
                </div>
            </Card>

            <Card title="丸め単位">
                <p className="text-sm text-muted mb-2">最小通貨単位</p>
                <div className="flex flex-wrap gap-2">
                    {UNIT_KEYS.map((unit) => (
                        <button
                            key={unit}
                            onClick={() => setRoundingUnit(unit as RoundingUnit)}
                            style={{
                                backgroundColor: roundingUnit === unit ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: roundingUnit === unit ? 'white' : 'var(--color-text-main)',
                                border: `1px solid ${roundingUnit === unit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            {unit}円
                        </button>
                    ))}
                </div>
            </Card>

            <Card title="端数調整">
                <p className="text-sm text-muted mb-2">合計と合わない場合の差分負担</p>
                <div className="flex flex-col gap-sm">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                        <input
                            type="radio"
                            name="adjustmentPriority"
                            value={ADJUSTMENT_PRIORITIES.PAY_MORE}
                            checked={adjustmentPriority === ADJUSTMENT_PRIORITIES.PAY_MORE}
                            onChange={() => setAdjustmentPriority(ADJUSTMENT_PRIORITIES.PAY_MORE)}
                            className="accent-primary"
                        />
                        <span>多く払う人 (上司など) に寄せる</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                        <input
                            type="radio"
                            name="adjustmentPriority"
                            value={ADJUSTMENT_PRIORITIES.EVEN}
                            checked={adjustmentPriority === ADJUSTMENT_PRIORITIES.EVEN}
                            onChange={() => setAdjustmentPriority(ADJUSTMENT_PRIORITIES.EVEN)}
                            className="accent-primary"
                        />
                        <span>均等にばらす</span>
                    </label>
                </div>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border flex flex-col gap-sm shadow-lg" style={{ backgroundColor: 'var(--color-surface)', zIndex: 10 }}>
                <div className="container flex flex-col gap-sm">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleSave}
                    >
                        設定を保存して再計算
                    </Button>
                    <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        onClick={handleBack}
                    >
                        キャンセル
                    </Button>
                </div>
            </div>
        </div>
    );
}
