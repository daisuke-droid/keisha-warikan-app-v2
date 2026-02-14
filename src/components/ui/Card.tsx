import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    title?: string;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    title,
    style
}) => {
    const classes = [
        styles.card,
        onClick ? styles.clickable : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} style={style}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {children}
        </div>
    );
};
