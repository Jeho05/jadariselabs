'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, FormEvent } from 'react';
import Image from 'next/image';
import { IconSparkle, IconClock, IconRefresh, IconCheck, IconMail } from '@/components/icons';
import { Spinner } from '@/components/auth-form';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [resendError, setResendError] = useState<string | null>(null);

    const handleResend = async (e: FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setResending(true);
        setResendError(null);

        try {
            const res = await fetch('/api/auth/resend-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) {
                setResendError(data.error || 'Une erreur est survenue. Réessayez.');
                setResending(false);
                return;
            }

            setResent(true);
            setResending(false);
        } catch {
            setResendError('Une erreur réseau est survenue. Vérifiez votre connexion.');
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />

            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-gold)]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-[var(--color-savanna)]/5 rounded-full blur-3xl" />
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="module-card-premium flex-col items-center text-center p-8">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center mb-8 group">
                        <div className="relative transition-transform group-hover:scale-[1.02]">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-14 w-auto drop-shadow-sm" />
                        </div>
                    </Link>

                    {/* Email Icon */}
                    <div className="module-icon-premium gold mb-6 animate-float">
                        <IconMail size={32} />
                    </div>

                    <h1
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        {resent ? 'Email renvoyé !' : 'Vérifiez votre email'}
                    </h1>

                    <p className="text-[var(--color-text-secondary)] mb-2">
                        {resent
                            ? 'Un nouveau lien de confirmation a été envoyé à'
                            : 'Un email de confirmation a été envoyé à'}
                    </p>

                    {email && (
                        <p className="font-semibold text-[var(--color-gold-light)] mb-6 break-all bg-[var(--color-surface-2)] border border-[var(--color-gold)]/25 px-4 py-2 rounded-lg">
                            {email}
                        </p>
                    )}

                    {/* Success message */}
                    {resent && (
                        <div
                            role="status"
                            className="w-full mb-6 flex items-center gap-3 p-3 bg-[var(--color-savanna)]/10 border border-[var(--color-savanna)]/20 rounded-lg"
                            style={{ animation: 'fadeInDown 0.3s ease-out' }}
                        >
                            <IconCheck size={20} className="text-[var(--color-savanna)] flex-shrink-0" />
                            <p className="text-sm text-[var(--color-savanna-light)] font-medium text-left">
                                Si le compte existe, vous recevrez le lien dans quelques minutes.
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {resendError && (
                        <div
                            role="alert"
                            className="w-full mb-6 flex items-center gap-3 p-3 bg-[var(--color-terracotta)]/10 border border-[var(--color-terracotta)]/25 rounded-lg"
                        >
                            <p className="text-sm text-[var(--color-terracotta-light)] font-medium text-left">
                                {resendError}
                            </p>
                        </div>
                    )}

                    {/* Info Cards */}
                    <div className="w-full space-y-3 mb-6">
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-savanna)]/5 rounded-lg">
                            <IconSparkle size={20} className="text-[var(--color-gold)] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-left">Cliquez sur le lien dans l&apos;email pour activer votre compte.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-terracotta)]/5 rounded-lg">
                            <IconClock size={20} className="text-[var(--color-terracotta)] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-left">Le lien expire dans 24 heures.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-gold)]/5 rounded-lg">
                            <svg className="w-5 h-5 text-[var(--color-gold-light)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-left">Vérifiez aussi vos spams si vous ne trouvez pas l&apos;email.</p>
                        </div>
                    </div>

                    {/* Resend button */}
                    {email && (
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-gold)]/30 text-[var(--color-gold-light)] font-semibold text-sm hover:bg-[var(--color-gold)]/[0.1] hover:border-[var(--color-gold)]/50 transition-all disabled:opacity-50"
                        >
                            {resending ? (
                                <>
                                    <Spinner size={16} />
                                    <span>Envoi en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconRefresh size={16} />
                                    <span>Renvoyer l&apos;email</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Back Link */}
                    <Link
                        href="/login"
                        className="text-sm text-[var(--color-gold-light)] hover:text-[var(--color-gold)] transition-colors font-medium"
                    >
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
                <div className="skeleton w-[400px] h-[400px] rounded-xl" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}