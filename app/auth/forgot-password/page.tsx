'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Spinner, AuthError } from '@/components/auth-form';
import { IconArrowRight, IconCheck, IconMail } from '@/components/icons';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue. Réessayez.');
                setLoading(false);
                return;
            }

            setSent(true);
            setLoading(false);
        } catch {
            setError('Une erreur réseau est survenue. Vérifiez votre connexion.');
            setLoading(false);
        }
    };

    return (
        <div className="split-screen-auth min-h-screen bg-[var(--color-background)]">
            {/* Left Panel — Visual */}
            <div className="split-screen-visual relative overflow-hidden bg-[var(--color-surface)]">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'url(/pattern-african.svg)',
                        backgroundRepeat: 'repeat',
                        animation: 'parallax-float 20s linear infinite',
                    }}
                />
                <div className="absolute inset-0 pointer-events-none">
                    <div className="orb orb-gold w-64 h-64 -top-32 -right-32 opacity-30" />
                    <div className="orb orb-terracotta w-48 h-48 bottom-1/4 -left-24 opacity-20" />
                </div>
                <div className="absolute inset-0">
                    <Image
                        src="/hero-ai-tech.jpg"
                        alt="JadaRiseLabs - Intelligence Artificielle"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-[var(--color-earth)]/40 backdrop-blur-sm" />
                </div>
                <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 justify-center">
                    <Link href="/" className="inline-flex items-center mb-12 group">
                        <div className="relative transition-transform group-hover:scale-[1.02]">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-20 sm:h-28 w-auto drop-shadow-lg" />
                        </div>
                    </Link>
                    <div className="animate-fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Pas de panique,<br />
                            <span className="text-[var(--color-gold)]">on s&apos;occupe de tout</span>
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-md">
                            Recevez un lien sécurisé par email pour retrouver l&apos;accès à votre espace IA.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="orb orb-savanna w-48 h-48 -bottom-24 -right-24 opacity-20" />
                    <div className="orb orb-gold w-32 h-32 top-1/4 left-0 opacity-15" />
                </div>

                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="inline-flex items-center group">
                        <div className="relative transition-transform group-hover:scale-[1.02]">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={200} height={133} className="object-contain h-16 w-auto drop-shadow-sm" />
                        </div>
                    </Link>
                </div>

                <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-[var(--color-savanna)]/10 border border-[var(--color-savanna)]/20 rounded-full px-4 py-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)] animate-pulse" />
                            <span className="text-[var(--color-savanna-light)] text-sm font-medium">
                                Récupération sécurisée
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Mot de passe oublié ?
                        </h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Entrez votre email et nous vous enverrons un lien de réinitialisation
                        </p>
                    </div>

                    <div className="glass-card-premium rounded-2xl p-6 lg:p-8">
                        {sent ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-savanna)]/10 flex items-center justify-center mx-auto mb-4">
                                    <IconCheck size={28} className="text-[var(--color-savanna)]" />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Email envoyé !
                                </h2>
                                <p className="text-[var(--color-text-secondary)] mb-2">
                                    Si un compte existe pour <strong className="text-[var(--color-gold-light)]">{email.trim()}</strong>, vous recevrez un lien de réinitialisation.
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mb-6">
                                    Le lien expire dans 1 heure. Pensez à vérifier vos spams.
                                </p>
                                <Link
                                    href="/login"
                                    className="btn-cta-premium w-full group"
                                >
                                    <span>Retour à la connexion</span>
                                    <IconArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ) : (
                            <>
                                <AuthError message={error} />
                                {error ? <div className="h-4" /> : null}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="input-group">
                                        <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                            Email
                                        </label>
                                        <div className="input-wrapper group">
                                            <IconMail size={20} className="input-icon w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-gold-light)] transition-colors" />
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

                                    <button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="btn-cta-premium w-full mt-2 group"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size={18} />
                                                <span>Envoi en cours...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Envoyer le lien</span>
                                                <IconArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            Vous vous souvenez de votre mot de passe ?{' '}
                            <Link href="/login" className="text-[var(--color-gold-light)] font-semibold hover:text-[var(--color-gold)] transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="split-screen-auth min-h-screen bg-[var(--color-background)]">
                    <div className="split-screen-visual" />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="glass-card-premium rounded-2xl p-8 w-full max-w-md">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-[var(--color-surface-2)] rounded-lg w-3/4 mx-auto" />
                                <div className="h-12 bg-[var(--color-surface-2)] rounded-xl" />
                                <div className="h-12 bg-[var(--color-surface-2)] rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <ForgotPasswordForm />
        </Suspense>
    );
}