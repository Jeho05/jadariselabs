'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useMemo, useCallback } from 'react';

// ============================================
// Auth Shared Components
// ============================================

/**
 * Google OAuth button
 */
export function OAuthButtons({ loading }: { loading?: boolean }) {
    const [oauthLoading, setOauthLoading] = useState(false);
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setOauthLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) {
                console.error('OAuth error:', error.message);
                setOauthLoading(false);
            }
        } catch {
            setOauthLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 
                 bg-white border-2 border-border rounded-xl font-medium text-text-primary
                 hover:bg-cream-dark hover:border-earth/20 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
            {oauthLoading ? (
                <Spinner size={20} />
            ) : (
                <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continuer avec Google
                </>
            )}
        </button>
    );
}

/**
 * Visual divider "ou"
 */
export function AuthDivider() {
    return (
        <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-text-muted font-medium">ou</span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

/**
 * Password input with visibility toggle
 */
export function PasswordInput({
    id,
    name,
    value,
    onChange,
    placeholder = 'Mot de passe',
    autoComplete = 'current-password',
    required = true,
    minLength,
    disabled,
}: {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    minLength?: number;
    disabled?: boolean;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                minLength={minLength}
                disabled={disabled}
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-white
                   text-text-primary placeholder:text-text-muted
                   focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth/20
                   transition-all duration-200 pr-12 min-h-[48px]
                   disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
                type="button"
                onClick={() => setVisible(!visible)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted 
                   hover:text-text-primary transition-colors"
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
                {visible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}

/**
 * Password strength analysis
 */
export interface PasswordCheck {
    label: string;
    met: boolean;
}

export function usePasswordStrength(password: string) {
    const checks: PasswordCheck[] = useMemo(
        () => [
            { label: '8 caractères minimum', met: password.length >= 8 },
            { label: 'Une lettre majuscule', met: /[A-Z]/.test(password) },
            { label: 'Un chiffre', met: /[0-9]/.test(password) },
            { label: 'Un caractère spécial (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
        ],
        [password]
    );

    const score = useMemo(() => checks.filter((c) => c.met).length, [checks]);

    const strength = useMemo(() => {
        if (score === 0) return { label: '', color: '', width: '0%' };
        if (score === 1) return { label: 'Faible', color: 'bg-red-500', width: '25%' };
        if (score === 2) return { label: 'Moyen', color: 'bg-orange-500', width: '50%' };
        if (score === 3) return { label: 'Bon', color: 'bg-yellow-500', width: '75%' };
        return { label: 'Fort', color: 'bg-savanna', width: '100%' };
    }, [score]);

    const isValid = score >= 3;

    return { checks, score, strength, isValid };
}

/**
 * Password strength meter component
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
    const { checks, strength } = usePasswordStrength(password);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                    />
                </div>
                <span className="text-xs font-medium text-text-secondary min-w-[40px]">
                    {strength.label}
                </span>
            </div>

            {/* Checklist */}
            <ul className="grid grid-cols-2 gap-1">
                {checks.map((check) => (
                    <li
                        key={check.label}
                        className={`text-xs flex items-center gap-1.5 ${check.met ? 'text-savanna' : 'text-text-muted'
                            }`}
                    >
                        {check.met ? (
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="4" opacity="0.3" />
                            </svg>
                        )}
                        {check.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Spinner component
 */
export function Spinner({ size = 20 }: { size?: number }) {
    return (
        <svg
            className="animate-spin"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

/**
 * Auth error message display
 */
export function AuthError({ message }: { message: string | null }) {
    if (!message) return null;

    return (
        <div className="bg-terracotta/10 border border-terracotta/30 text-terracotta-dark rounded-xl px-4 py-3 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                />
            </svg>
            <span>{message}</span>
        </div>
    );
}

/**
 * Map Supabase auth error codes to user-friendly French messages
 */
export function getAuthErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email ou mot de passe incorrect.',
        'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
        'User already registered': 'Un compte existe déjà avec cet email.',
        'Password should be at least 6 characters':
            'Le mot de passe doit contenir au moins 6 caractères.',
        'Signup requires a valid password': 'Veuillez entrer un mot de passe valide.',
        'Email rate limit exceeded':
            'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
        'For security purposes, you can only request this after 60 seconds.':
            'Pour des raisons de sécurité, veuillez attendre 60 secondes.',
        auth_callback_failed:
            "Erreur lors de l'authentification. Veuillez réessayer.",
    };

    for (const [key, value] of Object.entries(errorMap)) {
        if (error.includes(key)) return value;
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Custom hook for debounced validation
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    const updateValue = useCallback(
        (val: T) => {
            const handler = setTimeout(() => setDebouncedValue(val), delay);
            return () => clearTimeout(handler);
        },
        [delay]
    );

    // Using useCallback pattern to avoid needing useEffect
    useMemo(() => {
        const cleanup = updateValue(value);
        return cleanup;
    }, [value, updateValue]);

    return debouncedValue;
}
