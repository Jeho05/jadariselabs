'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="card max-w-md w-full text-center py-12 px-8">
                {/* Email icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-savanna/10 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-savanna"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    Vérifiez votre email
                </h1>

                <p className="text-text-secondary mb-2">
                    Un email de confirmation a été envoyé à
                </p>

                {email && (
                    <p className="font-semibold text-earth mb-6 break-all">
                        {email}
                    </p>
                )}

                <div className="bg-cream rounded-xl p-4 mb-8 text-sm text-text-secondary space-y-2">
                    <p>📧 Cliquez sur le lien dans l&apos;email pour activer votre compte.</p>
                    <p>⏱️ Le lien expire dans 24 heures.</p>
                    <p>📁 Vérifiez aussi vos spams si vous ne trouvez pas l&apos;email.</p>
                </div>

                <div className="space-y-3">
                    <Link href="/login" className="btn-primary w-full block text-center">
                        Retour à la connexion
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-text-secondary hover:text-earth transition-colors inline-block"
                    >
                        ← Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-cream flex items-center justify-center">
                    <div className="skeleton w-96 h-96 rounded-xl" />
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}
