'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { eventRepository } from '@/lib/repository';
import { WarikanEvent, ROUNDING_UNITS, ROUNDING_METHODS, ADJUSTMENT_PRIORITIES } from '@/types';

export default function CreateEventPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('イベント名を入力してください');
            return;
        }

        const amount = parseInt(totalAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            setError('有効な合計金額を入力してください');
            return;
        }

        // デフォルト値でイベント作成
        const newEvent: WarikanEvent = {
            id: uuidv4(),
            name: name.trim(),
            totalAmount: amount,
            participants: [],
            roundingUnit: ROUNDING_UNITS.HUNDRED, // デフォルト100円
            roundingMethod: ROUNDING_METHODS.CEIL,  // デフォルト切り上げ
            adjustmentPriority: ADJUSTMENT_PRIORITIES.PAY_MORE, // デフォルト: 多く払う人
            memo: memo.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        eventRepository.save(newEvent);
        router.push(`/event/${newEvent.id}/participants`);
    };

    return (
        <div className="flex flex-col gap-md" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1 className="text-center font-bold" style={{ fontSize: '1.5rem', margin: 'var(--spacing-md) 0' }}>
                新しいイベント
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <Input
                    label="イベント名"
                    placeholder="例: 2/14 営業チーム飲み会"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <Input
                    label="合計金額 (円)"
                    type="number"
                    placeholder="15000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    required
                    inputMode="numeric"
                />

                <Input
                    label="メモ (店名など)"
                    placeholder="例: 鳥貴族 新宿店"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />

                {error && <p className="text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>}

                <Button type="submit" size="lg" fullWidth style={{ marginTop: 'var(--spacing-sm)' }}>
                    次へ: 参加者入力
                </Button>
            </form>
        </div>
    );
}
