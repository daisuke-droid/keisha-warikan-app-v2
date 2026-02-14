'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { eventRepository } from '@/lib/repository';
import { WarikanEvent, Participant, ROLE_RANKS, RoleRank } from '@/types';

// 役職ごとのデフォルト係数
const RANK_WEIGHTS: Record<RoleRank, number> = {
    [ROLE_RANKS.BOSS]: 1.5,
    [ROLE_RANKS.SENIOR]: 1.2,
    [ROLE_RANKS.PEER]: 1.0,
    [ROLE_RANKS.JUNIOR]: 0.8,
    [ROLE_RANKS.CUSTOM]: 1.0,
};

// 役職の表示名
const RANK_LABELS: Record<RoleRank, string> = {
    [ROLE_RANKS.BOSS]: '上司 (x1.5)',
    [ROLE_RANKS.SENIOR]: '先輩 (x1.2)',
    [ROLE_RANKS.PEER]: '同僚 (x1.0)',
    [ROLE_RANKS.JUNIOR]: '後輩 (x0.8)',
    [ROLE_RANKS.CUSTOM]: 'カスタム',
};

export default function ParticipantsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [event, setEvent] = useState<WarikanEvent | null>(null);
    const [newName, setNewName] = useState('');
    const [selectedRank, setSelectedRank] = useState<RoleRank>(ROLE_RANKS.PEER);

    useEffect(() => {
        if (id) {
            const data = eventRepository.getById(id);
            if (data) {
                setEvent(data);
            } else {
                // イベントが見つからない場合
                router.push('/');
            }
        }
    }, [id, router]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !event) return;

        const newParticipant: Participant = {
            id: uuidv4(),
            name: newName.trim(),
            rank: selectedRank,
            weight: RANK_WEIGHTS[selectedRank],
        };

        const updatedEvent = {
            ...event,
            participants: [...event.participants, newParticipant],
            updatedAt: Date.now(),
        };

        eventRepository.save(updatedEvent);
        setEvent(updatedEvent);
        setNewName('');
        // 連続入力をしやすくするため、rankはリセットしない
    };

    const handleRemove = (pid: string) => {
        if (!event) return;
        const updatedEvent = {
            ...event,
            participants: event.participants.filter(p => p.id !== pid),
            updatedAt: Date.now(),
        };
        eventRepository.save(updatedEvent);
        setEvent(updatedEvent);
    };

    const handleNext = () => {
        if (!event || event.participants.length === 0) return;
        router.push(`/event/${id}/result`);
    };

    if (!event) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="flex flex-col gap-md pb-20">
            <h1 className="text-center font-bold" style={{ fontSize: '1.25rem' }}>
                参加者を追加 ({event.participants.length}人)
            </h1>
            <p className="text-center text-muted">合計: {event.totalAmount.toLocaleString()}円</p>

            {/* 参加者リスト */}
            <div className="flex flex-col gap-sm">
                {event.participants.map(p => (
                    <Card key={p.id} className="flex justify-between items-center" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                        <div>
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-muted">{RANK_LABELS[p.rank]}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(p.id)}>
                            ✕
                        </Button>
                    </Card>
                ))}
                {event.participants.length === 0 && (
                    <div className="text-center text-muted py-4">
                        まだ参加者がいません
                    </div>
                )}
            </div>

            {/* 追加フォーム */}
            <Card className="mt-4">
                <form onSubmit={handleAdd} className="flex flex-col gap-sm">
                    <Input
                        placeholder="名前 (例: 佐藤さん)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {(Object.keys(RANK_LABELS) as RoleRank[]).map(rank => (
                            <button
                                key={rank}
                                type="button"
                                onClick={() => setSelectedRank(rank)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '16px',
                                    border: `1px solid ${selectedRank === rank ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: selectedRank === rank ? 'var(--color-primary)' : 'transparent',
                                    color: selectedRank === rank ? 'white' : 'var(--color-text-sub)',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                }}
                            >
                                {RANK_LABELS[rank]}
                            </button>
                        ))}
                    </div>
                    <Button type="submit" disabled={!newName.trim()}>
                        追加
                    </Button>
                </form>
            </Card>

            {/* フッターアクション: 固定表示 */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--spacing-md)',
                background: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div className="container">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleNext}
                        disabled={event.participants.length === 0}
                    >
                        計算結果を見る
                    </Button>
                </div>
            </div>
        </div>
    );
}
