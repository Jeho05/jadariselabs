import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'earth' | 'gold' | 'savanna' | 'terracotta' | 'neutral';

const toneClasses: Record<Tone, string> = {
    earth: 'bg-[var(--color-earth)]/10 text-[var(--color-earth-dark)] border-[var(--color-earth)]/20',
    gold: 'bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] border-[var(--color-gold)]/25',
    savanna: 'bg-[var(--color-savanna)]/10 text-[var(--color-savanna-dark)] border-[var(--color-savanna)]/20',
    terracotta: 'bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta-dark)] border-[var(--color-terracotta)]/25',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
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