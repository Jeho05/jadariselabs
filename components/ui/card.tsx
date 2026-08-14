import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
    className?: string;
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
    return (
        <div
            className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-card transition-all duration-200 ${
                hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}