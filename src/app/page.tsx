'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { eventRepository } from '@/lib/repository';
import { WarikanEvent } from '@/types';

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<WarikanEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEvents(eventRepository.getAll());
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-md pb-24">
      <section className="text-center" style={{ margin: 'var(--spacing-xl) 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>
          飲み会の割り勘を、<br />もっとスマートに。
        </h1>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
          役職や飲酒量に合わせて、<br />いい感じに傾斜をつけた割り勘計算ができます。
        </p>
        <Link href="/create">
          <Button size="lg">イベントを作成する</Button>
        </Link>
      </section>

      <section>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)' }}>履歴</h2>
        <div className="flex flex-col gap-sm">
          {events.length === 0 ? (
            <Card className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
              <p>履歴はまだありません</p>
            </Card>
          ) : (
            events.map(event => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/event/${event.id}/participants`)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-lg">{event.name}</h3>
                  <span className="text-sm text-muted">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-muted text-sm">
                    {event.participants.length}人参加
                  </div>
                  <div className="font-bold text-primary">
                    {event.totalAmount.toLocaleString()}円
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
