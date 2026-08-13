import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string | null;
    hint?: string;
    icon?: ReactNode;
}

export function Field({ label, id, error, hint, icon, className = '', ...props }: FieldProps) {
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    return (
        <div className="input-group">
            <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                {label}
            </label>
            <div className="input-wrapper group">
                {icon && (
                    <span className="input-icon w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-earth)] transition-colors flex-shrink-0">
                        {icon}
                    </span>
                )}
                <input
                    id={id}
                    name={id}
                    className={`input-field ${icon ? 'pl-10' : ''} ${error ? '!border-[var(--color-terracotta)]' : ''} ${className}`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    {...props}
                />
            </div>
            {error ? (
                <p id={`${id}-error`} role="alert" className="text-xs text-[var(--color-terracotta)] mt-1.5 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="text-xs text-[var(--color-text-muted)] mt-1.5">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}