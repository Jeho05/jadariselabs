'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { IconFlask, IconSparkle, IconClock } from '@/components/icons';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4 relative overflow-hidden">
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
                    <Link href="/" className="flex items-center gap-2 mb-8 group">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-lg">
                            <IconFlask size={24} className="text-white" />
                        </div>
                        <span 
                            className="font-bold text-xl group-hover:text-[var(--color-earth-light)] transition-colors"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            JadaRiseLabs
                        </span>
                    </Link>

                    {/* Email Icon */}
                    <div className="module-icon-premium gold mb-6 animate-float">
                        <IconSparkle size={32} />
                    </div>

                    <h1 
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Vérifiez votre email
                    </h1>

                    <p className="text-[var(--color-text-secondary)] mb-2">
                        Un email de confirmation a été envoyé à
                    </p>

                    {email && (
                        <p className="font-semibold text-[var(--color-earth)] mb-6 break-all bg-[var(--color-cream)] px-4 py-2 rounded-lg">
                            {email}
                        </p>
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
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-earth)]/5 rounded-lg">
                            <svg className="w-5 h-5 text-[var(--color-earth)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-left">Vérifiez aussi vos spams si vous ne trouvez pas l&apos;email.</p>
                        </div>
                    </div>

                    {/* Back Link */}
                    <Link 
                        href="/login" 
                        className="text-sm text-[var(--color-earth)] hover:text-[var(--color-earth-light)] transition-colors font-medium"
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
            <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
                <div className="skeleton w-[400px] h-[400px] rounded-xl" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
