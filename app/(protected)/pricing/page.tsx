'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, PlanType } from '@/lib/types';
import { PLANS } from '@/lib/types';
import Link from 'next/link';
import {
    IconZap,
    IconCrown,
    IconCheck,
    IconClose,
    IconRocket,
    IconSparkle,
    IconLoader2,
    IconAlertCircle,
    IconArrowRight,
} from '@/components/icons';
import Image from 'next/image';

const PLAN_FEATURES: Record<PlanType, { label: string; description: string; features: string[]; color: string; gradient: string }> = {
    free: {
        label: 'Gratuit',
        description: 'Découvrez la puissance de l\'IA',
        features: [
            '50 crédits / mois',
            'Génération d\'images SD',
            'Chat IA illimité (1 cr/msg)',
            'Galerie personnelle',
            'Watermark sur les créations',
        ],
        color: 'var(--color-text-secondary)',
        gradient: 'from-gray-400 to-gray-500',
    },
    starter: {
        label: 'Starter',
        description: 'Pour les créateurs réguliers',
        features: [
            '200 crédits / mois',
            'Images HD (1024×1024)',
            'Vidéos courtes (5s)',
            'Chat IA illimité',
            'Sans watermark',
            'Téléchargement HD',
        ],
        color: 'var(--color-gold)',
        gradient: 'from-[var(--color-gold)] to-[var(--color-terracotta)]',
    },
    pro: {
        label: 'Pro',
        description: 'Créativité sans limites',
        features: [
            'Crédits illimités',
            'Images HD (1024×1024)',
            'Vidéos longues (15s)',
            'Tous les modèles IA',
            'Sans watermark',
            'Téléchargement HD',
            'Support prioritaire',
        ],
        color: 'var(--color-terracotta)',
        gradient: 'from-[var(--color-terracotta)] to-[var(--color-earth)]',
    },
};

export default function PricingPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data);
            }
            setLoading(false);
        }
        fetchProfile();

        // Check URL params for payment success
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setSuccessMessage(`Paiement réussi ! Votre plan ${params.get('plan') || ''} est maintenant actif.`);
        }
    }, [supabase]);

    const handleUpgrade = async (plan: 'starter' | 'pro') => {
        setUpgrading(plan);
        setError(null);

        try {
            const response = await fetch(`/api/payment?plan=${plan}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.details || data.error || 'Erreur lors de l\'initiation du paiement');
                setUpgrading(null);
                return;
            }

            // Redirect to CinetPay payment page
            window.location.href = data.payment_url;

        } catch {
            setError('Erreur réseau. Veuillez réessayer.');
            setUpgrading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <IconLoader2 size={40} className="animate-spin text-[var(--color-gold)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-4">
                        <Image src="/logo-lion.png" alt="JadaRiseLabs" width={64} height={64} className="object-contain" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                        Choisissez votre plan
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-lg max-w-lg mx-auto">
                        Débloquez tout le potentiel de l&apos;IA avec nos plans accessibles via Mobile Money
                    </p>
                </div>

                {/* Success/Error Messages */} {successMessage && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-3">
                        <IconCheck size={20} />
                        <span>{successMessage}</span>
                    </div>
                )} {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3">
                        <IconAlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )} {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
                    {(['free', 'starter', 'pro'] as PlanType[]).map((planKey) => {
                        const plan = PLANS[planKey];
                        const info = PLAN_FEATURES[planKey];
                        const isCurrentPlan = profile?.plan === planKey;
                        const isPopular = planKey === 'starter';

                        return (
                            <div
                                key={planKey}
                                className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${isPopular ?
                                     'ring-2 ring-[var(--color-gold)] shadow-xl scale-[1.02]'
                                    : 'shadow-md hover:shadow-lg'
                                    }`}
                                style={{
                                    background: 'white',
                                }}
                            >
                                {/* Popular badge */} {isPopular && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-terracotta)]" />
                                )} {isPopular && (
                                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-0">
                                        <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-b-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-terracotta)] shadow-lg">
                                            <IconSparkle size={12} /> POPULAIRE
                                        </span>
                                    </div>
                                )}

                                <div className="p-6 pt-10">
                                    {/* Plan name */}
                                    <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                                        {info.label}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">{info.description}</p>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold" style={{ color: info.color }}>
                                            {plan.price_cfa === 0 ? '0' : plan.price_cfa.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-[var(--color-text-secondary)] ml-1">
                                            F CFA/mois
                                        </span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8">
                                        {info.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <IconCheck size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-savanna)]" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */} {isCurrentPlan ? (
                                        <div className="w-full py-3 rounded-xl border-2 border-[var(--color-savanna)] text-center font-semibold text-[var(--color-savanna)]">
                                            ✓ Plan actuel
                                        </div>
                                    ) : planKey === 'free' ? (
                                        <div className="w-full py-3 rounded-xl bg-gray-100 text-center text-sm text-[var(--color-text-muted)]">
                                            Plan de base
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(planKey as 'starter' | 'pro')}
                                            disabled={upgrading !== null}
                                            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${upgrading === planKey ? 'opacity-70' : 'hover:opacity-90 hover:scale-[1.02]'
                                                } bg-gradient-to-r ${info.gradient}`}
                                        >
                                            {upgrading === planKey ? (
                                                <>
                                                    <IconLoader2 size={18} className="animate-spin" />
                                                    Redirection...
                                                </>
                                            ) : (
                                                <>
                                                    <IconRocket size={18} />
                                                    Passer à {info.label}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Payment Methods */}
                <div className="text-center mb-12">
                    <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                        Moyens de paiement acceptés
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--color-text-secondary)]">
                        {['🟠 Orange Money', '🔵 Wave', '🟡 MTN MoMo', '🟢 Moov Money', '💳 Visa/MC'].map((method) => (
                            <span
                                key={method}
                                className="px-4 py-2 rounded-full bg-white shadow-sm border border-[var(--color-cream-dark)]"
                            >
                                {method}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Comparison table */}
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="text-xs text-[var(--color-text-muted)] mb-2 sm:hidden">← Scroll pour voir →</div>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-[var(--color-cream-dark)]">
                                <th className="text-left py-3 px-4 font-semibold">Fonctionnalité</th>
                                <th className="text-center py-3 px-4 font-semibold">Gratuit</th>
                                <th className="text-center py-3 px-4 font-semibold text-[var(--color-gold)]">Starter</th>
                                <th className="text-center py-3 px-4 font-semibold text-[var(--color-terracotta)]">Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Crédits / mois', '50', '200', '∞'],
                                ['Images HD', '✗', '✓', '✓'],
                                ['Vidéo', '✗', '5s max', '15s max'],
                                ['Audio', '✗', '✓', '✓'],
                                ['Watermark', 'Oui', 'Non', 'Non'],
                                ['Chat IA', '✓', '✓', '✓'],
                                ['Téléchargement HD', '✗', '✓', '✓'],
                                ['Support prioritaire', '✗', '✗', '✓'],
                            ].map(([feature, free, starter, pro], i) => (
                                <tr key={i} className="border-b border-[var(--color-cream-dark)]">
                                    <td className="py-3 px-4">{feature}</td>
                                    <td className="text-center py-3 px-4">{free}</td>
                                    <td className="text-center py-3 px-4">{starter}</td>
                                    <td className="text-center py-3 px-4">{pro}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Back link */}
                <div className="text-center mt-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-[var(--color-earth)] hover:text-[var(--color-earth-light)] font-medium"
                    >
                        <IconArrowRight size={16} className="rotate-180" />
                        Retour au Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
