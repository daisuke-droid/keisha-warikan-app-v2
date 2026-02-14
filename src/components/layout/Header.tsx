import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
    return (
        <header style={{
            padding: 'var(--spacing-md) 0',
            marginBottom: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--color-border)'
        }}>
            <div className="container flex items-center justify-between">
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    🍷 Keisha Warikan
                </Link>
            </div>
        </header>
    );
};
