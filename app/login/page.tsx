'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
    OAuthButtons,
    AuthDivider,
    PasswordInput,
    AuthError,
    Spinner,
    getAuthErrorMessage,
} from '@/components/auth-form';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for callback errors
    const callbackError = searchParams.get('error');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (authError) {
                setError(getAuthErrorMessage(authError.message));
                setLoading(false);
                return;
            }

            // Success — redirect to dashboard
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('Une erreur réseau est survenue. Vérifiez votre connexion.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            {/* Header minimal */}
            <div className="p-4 sm:p-6">
                <Link href="/" className="inline-flex items-center gap-2 group">
                    <span className="text-2xl">🧪</span>
                    <span className="font-bold text-earth text-lg group-hover:text-earth-light transition-colors"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                        JadaRiseLabs
                    </span>
                </Link>
            </div>

            {/* Form container */}
            <div className="flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-[420px]">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Bon retour ! 👋
                        </h1>
                        <p className="text-text-secondary">
                            Connectez-vous pour accéder à votre espace IA
                        </p>
                    </div>

                    {/* Card */}
                    <div className="card p-6 sm:p-8">
                        {/* Error messages */}
                        <AuthError
                            message={
                                error ||
                                (callbackError ? getAuthErrorMessage(callbackError) : null)
                            }
                        />

                        {error || callbackError ? <div className="h-4" /> : null}

                        {/* Google OAuth */}
                        <OAuthButtons loading={loading} />

                        <AuthDivider />

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-text-primary mb-1.5"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vous@example.com"
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 border-2 border-border rounded-xl bg-white
                             text-text-primary placeholder:text-text-muted
                             focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth/20
                             transition-all duration-200 min-h-[48px]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-text-primary"
                                    >
                                        Mot de passe
                                    </label>
                                    <button
                                        type="button"
                                        className="text-xs text-earth hover:text-earth-light transition-colors font-medium"
                                        onClick={() => {
                                            // TODO: Password reset functionality
                                            alert('Fonctionnalité à venir');
                                        }}
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Votre mot de passe"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:transform-none disabled:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size={18} />
                                        Connexion en cours...
                                    </>
                                ) : (
                                    'Se connecter'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Signup link */}
                    <p className="text-center mt-6 text-sm text-text-secondary">
                        Pas encore de compte ?{' '}
                        <Link
                            href="/signup"
                            className="text-earth font-semibold hover:text-earth-light transition-colors"
                        >
                            Créer un compte gratuitement
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-cream flex items-center justify-center">
                    <div className="skeleton w-[420px] h-[500px] rounded-xl" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
