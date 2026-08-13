import type { ReactNode } from 'react';

interface SectionHeadingProps {
    eyebrow?: string;
    eyebrowTone?: 'savanna' | 'gold' | 'terracotta' | 'earth';
    title: ReactNode;
    subtitle?: ReactNode;
    align?: 'center' | 'left';
    dark?: boolean;
    className?: string;
}

const eyebrowTones = {
    savanna: 'bg-[var(--color-savanna)]/10 border-[var(--color-savanna)]/20 text-[var(--color-savanna-dark)]',
    gold: 'bg-[var(--color-gold)]/10 border-[var(--color-gold)]/25 text-[var(--color-gold-dark)]',
    terracotta: 'bg-[var(--color-terracotta)]/10 border-[var(--color-terracotta)]/25 text-[var(--color-terracotta-dark)]',
    earth: 'bg-[var(--color-earth)]/10 border-[var(--color-earth)]/20 text-[var(--color-earth-dark)]',
};

export function SectionHeading({
    eyebrow,
    eyebrowTone = 'savanna',
    title,
    subtitle,
    align = 'center',
    dark = false,
    className = '',
}: SectionHeadingProps) {
    const centered = align === 'center';
    return (
        <div className={`${centered ? 'text-center mx-auto' : 'text-left'} max-w-2xl ${className}`}>
            {eyebrow && (
                <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold mb-5 ${eyebrowTones[eyebrowTone]}`}
                >
                    {eyebrow}
                </div>
            )}
            <h2
                className={`text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight mb-4 ${
                    dark ? 'text-white' : 'text-[var(--color-text-primary)]'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
            >
                {title}
            </h2>
            {subtitle && (
                <p className={`text-base sm:text-lg leading-relaxed ${dark ? 'text-white/70' : 'text-[var(--color-text-secondary)]'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}