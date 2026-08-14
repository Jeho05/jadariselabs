'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    PasswordInput,
    Spinner,
    AuthError,
} from '@/components/auth-form';
import { IconLock, IconArrowRight, IconCheck } from '@/components/icons';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const isStrong = password.length >= 8;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token || !email) return;
        setError(null);

        if (!passwordsMatch) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!isStrong) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, newPassword: password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue. Réessayez.');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                router.push('/login?message=password-reset');
                router.refresh();
            }, 1800);
        } catch {
            setError('Une erreur réseau est survenue. Vérifiez votre connexion.');
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
                <div className="glass-card-premium rounded-2xl p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-terracotta)]/10 flex items-center justify-center mx-auto mb-4">
                        <IconLock size={28} className="text-[var(--color-terracotta)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        Lien invalide
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        Ce lien de réinitialisation est invalide ou incomplet. Demandez un nouveau lien.
                    </p>
                    <Link href="/auth/forgot-password" className="btn-cta-premium w-full">
                        Demander un nouveau lien
                    </Link>
                </div>
            </div>
        );
    }

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
                            Presque terminé,<br />
                            <span className="text-[var(--color-gold)]">choisissez un nouveau mot de passe</span>
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-md">
                            Un mot de passe robuste protège vos créations et vos crédits IA.
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
                                Sécurité du compte
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Nouveau mot de passe
                        </h1>
                        <p className="text-[var(--color-text-secondary)] break-all">
                            Pour <strong className="text-[var(--color-gold-light)]">{email}</strong>
                        </p>
                    </div>

                    <div className="glass-card-premium rounded-2xl p-6 lg:p-8">
                        {success ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-savanna)]/10 flex items-center justify-center mx-auto mb-4">
                                    <IconCheck size={28} className="text-[var(--color-savanna)]" />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Mot de passe réinitialisé !
                                </h2>
                                <p className="text-[var(--color-text-secondary)]">
                                    Redirection vers la connexion...
                                </p>
                            </div>
                        ) : (
                            <>
                                <AuthError message={error} />
                                {error ? <div className="h-4" /> : null}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="input-group">
                                        <label htmlFor="new-password" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                            Nouveau mot de passe
                                        </label>
                                        <PasswordInput
                                            id="new-password"
                                            name="newPassword"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Au moins 8 caractères"
                                            autoComplete="new-password"
                                            disabled={loading}
                                        />
                                        {password.length > 0 && (
                                            <p className={`text-xs mt-1.5 font-medium ${isStrong ? 'text-[var(--color-savanna)]' : 'text-[var(--color-terracotta)]'}`}>
                                                {isStrong ? '✓ Mot de passe assez robuste' : 'Au moins 8 caractères requis'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="confirm-password" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                            Confirmer le mot de passe
                                        </label>
                                        <PasswordInput
                                            id="confirm-password"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-saisissez votre mot de passe"
                                            autoComplete="new-password"
                                            disabled={loading}
                                        />
                                        {confirmPassword.length > 0 && !passwordsMatch && (
                                            <p className="text-xs mt-1.5 font-medium text-[var(--color-terracotta)]">
                                                ⚠ Les mots de passe ne correspondent pas
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !password || !confirmPassword}
                                        className="btn-cta-premium w-full mt-2 group"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size={18} />
                                                <span>Réinitialisation...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Réinitialiser le mot de passe</span>
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
                            <Link href="/login" className="text-[var(--color-gold-light)] font-semibold hover:text-[var(--color-gold)] transition-colors">
                                Retour à la connexion
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
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
            <ResetPasswordForm />
        </Suspense>
    );
}