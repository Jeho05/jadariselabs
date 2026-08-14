import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none whitespace-nowrap';

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] shadow-md shadow-[var(--color-gold)]/25 hover:shadow-lg hover:shadow-[var(--color-gold)]/45 hover:-translate-y-0.5',
    secondary:
        'bg-transparent text-[var(--color-gold-light)] border border-[var(--color-gold)]/40 hover:bg-[var(--color-gold)]/[0.12] hover:border-[var(--color-gold)]',
    gold: 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] shadow-md shadow-[var(--color-gold)]/25 hover:shadow-lg hover:-translate-y-0.5',
    ghost: 'bg-[var(--color-gold)]/[0.06] text-[var(--color-text-secondary)] hover:bg-[var(--color-gold)]/[0.12] hover:text-[var(--color-gold-light)]',
    danger: 'bg-[var(--color-terracotta)] text-white hover:bg-[var(--color-terracotta-dark)] shadow-md shadow-[var(--color-terracotta)]/20',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3.5 py-2 text-sm min-h-[40px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-7 py-3.5 text-base min-h-[48px]',
};

interface ButtonBaseProps {
    variant?: Variant;
    size?: Size;
    className?: string;
    children: ReactNode;
}

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonLinkProps = ButtonBaseProps &
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function classes(variant: Variant, size: Size, className?: string) {
    return [baseClasses, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ');
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
    return (
        <button className={classes(variant, size, className)} {...props}>
            {children}
        </button>
    );
}

export function ButtonLink({ variant = 'primary', size = 'md', className, children, href, ...props }: ButtonLinkProps) {
    return (
        <Link href={href} className={classes(variant, size, className)} {...props}>
            {children}
        </Link>
    );
}