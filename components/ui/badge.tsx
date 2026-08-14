import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'earth' | 'gold' | 'savanna' | 'terracotta' | 'neutral';

const toneClasses: Record<Tone, string> = {
    earth: 'bg-[var(--color-earth)]/12 text-[var(--color-earth-light)] border-[var(--color-earth)]/25',
    gold: 'bg-[var(--color-gold)]/12 text-[var(--color-gold-light)] border-[var(--color-gold)]/30',
    savanna: 'bg-[var(--color-savanna)]/12 text-[var(--color-savanna-light)] border-[var(--color-savanna)]/25',
    terracotta: 'bg-[var(--color-terracotta)]/12 text-[var(--color-terracotta-light)] border-[var(--color-terracotta)]/30',
    neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    tone?: Tone;
    className?: string;
}

export function Badge({ children, tone = 'earth', className = '', ...props }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}