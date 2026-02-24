'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="verify-container">
            <div className="verify-card">
                {/* Glass Card */}
                <div className="glass-card text-center">
                    {/* Email icon */}
                    <div className="verify-icon">
                        <svg
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

                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
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

                    <div className="verify-info">
                        <p>📧 Cliquez sur le lien dans l&apos;email pour activer votre compte.</p>
                        <p>⏱️ Le lien expire dans 24 heures.</p>
                        <p>📁 Vérifiez aussi vos spams si vous ne trouvez pas l&apos;email.</p>
                    </div>

                    <div className="space-y-3 mt-6">
                        <Link href="/login" className="btn-auth">
                            Retour à la connexion
                        </Link>
                        <Link
                            href="/"
                            className="text-sm text-text-secondary hover:text-earth transition-colors inline-block mt-2"
                        >
                            ← Retour à l&apos;accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="verify-container">
                    <div className="skeleton w-[440px] h-[400px] rounded-xl" />
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}
