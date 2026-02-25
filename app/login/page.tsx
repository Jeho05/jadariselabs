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
        <div className="auth-container">
            {/* Left Panel — Visual */}
            <div className="auth-visual">
                {/* African Pattern Background */}
                <div className="african-pattern" />
                
                {/* Floating shapes */}
                <div className="auth-shapes">
                    <div className="auth-shape" />
                    <div className="auth-shape" />
                    <div className="auth-shape" />
                    <div className="auth-shape" />
                </div>

                {/* Content */}
                <div className="auth-visual-content">
                    {/* Logo */}
                    <div className="auth-visual-logo">
                        <div className="auth-visual-logo-icon">🧪</div>
                        <span style={{ fontFamily: 'var(--font-heading)' }}>JadaRiseLabs</span>
                    </div>

                    {/* Title */}
                    <h2 className="auth-visual-title">
                        L&apos;Intelligence Artificielle<br />
                        au service de l&apos;Afrique
                    </h2>

                    <p className="auth-visual-subtitle">
                        Générez des images, des vidéos et des conversations IA. 
                        Rejoignez des milliers de créateurs africains.
                    </p>

                    {/* Features */}
                    <div className="auth-visual-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🎨</div>
                            <span className="auth-feature-text">Génération d&apos;images IA</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">💬</div>
                            <span className="auth-feature-text">Assistant conversationnel</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🎬</div>
                            <span className="auth-feature-text">Création de vidéos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="auth-form-panel">
                {/* Mobile Header */}
                <div className="auth-form-header lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <span className="text-2xl">🧪</span>
                        <span
                            className="font-bold text-earth text-lg group-hover:text-earth-light transition-colors"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            JadaRiseLabs
                        </span>
                    </Link>
                </div>

                {/* Form Container */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        {/* Title */}
                        <div className="auth-title">
                            <h1 style={{ fontFamily: 'var(--font-heading)' }}>
                                Bon retour ! 👋
                            </h1>
                            <p>Connectez-vous pour accéder à votre espace IA</p>
                        </div>

                        {/* Card */}
                        <div className="glass-card stagger-children">
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
                            <form onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className="input-group">
                                    <label htmlFor="email">Email</label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
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
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="input-group">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password">Mot de passe</label>
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
                                    className="btn-auth mt-2"
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

                        {/* Footer */}
                        <div className="auth-footer">
                            Pas encore de compte ?{' '}
                            <Link href="/signup">Créer un compte gratuitement</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="auth-container">
                    <div className="auth-visual" />
                    <div className="auth-form-panel">
                        <div className="auth-form-container">
                            <div className="skeleton w-[420px] h-[500px] rounded-xl" />
                        </div>
                    </div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
