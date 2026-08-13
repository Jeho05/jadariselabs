'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconCheck,
  IconSparkle,
  IconShield,
  IconZap,
  IconCrown,
  IconRocket,
  IconRepeat,
} from '@/components/icons';

const MONTHLY_PRICES = { free: 0, starter: 500, pro: 1500 } as const;
const ANNUAL_DISCOUNT = 0.2; // -20 % sur l'abonnement annuel

const PLANS = [
  {
    key: 'free',
    name: 'Gratuit',
    tagline: 'Pour découvrir la puissance de l\u2019IA',
    features: [
      '50 crédits / mois',
      'Génération d\u2019images SD',
      'Chat IA illimité (1 crédit / message)',
      'Galerie personnelle',
      'Watermark sur les créations',
    ],
    icon: IconRocket,
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Pour les créateurs réguliers',
    features: [
      '200 crédits / mois',
      'Images HD (1024×1024)',
      'Vidéos courtes (5 s)',
      'Génération audio',
      'Sans watermark',
      'Téléchargement HD',
    ],
    icon: IconZap,
    popular: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'Créativité sans limites',
    features: [
      'Crédits illimités',
      'Images HD (1024×1024)',
      'Vidéos longues (15 s)',
      'Tous les modèles IA',
      'Sans watermark',
      'Téléchargement HD',
      'Support prioritaire',
    ],
    icon: IconCrown,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-cream)]">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32">
        {/* Hero */}
        <section className="relative z-10 px-6 md:px-12 lg:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge tone="gold">Paiement Mobile Money accepté</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Des tarifs <span className="text-gradient-animated">simples et accessibles</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Commencez gratuitement, évoluez quand vous voulez. Sans engagement,
              annulable à tout moment — dès 500 F CFA/mois.
            </p>
          </div>

          {/* Billing frequency toggle */}
          <div
            className="mt-10 inline-flex items-center gap-1 rounded-full bg-white border border-[var(--color-border)] p-1.5 shadow-sm"
            role="group"
            aria-label="Fréquence de facturation"
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                !annual
                  ? 'bg-[var(--color-earth)] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)]'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2 ${
                annual
                  ? 'bg-[var(--color-earth)] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)]'
              }`}
            >
              Annuel
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${annual ? 'bg-white/20' : 'bg-[var(--color-cream-dark)] text-[var(--color-earth)]'}`}>
                -20%
              </span>
            </button>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {PLANS.map((plan) => {
              const monthly = MONTHLY_PRICES[plan.key as keyof typeof MONTHLY_PRICES];
              const isFree = monthly === 0;
              const perMonth = annual ? Math.round(monthly * (1 - ANNUAL_DISCOUNT)) : monthly;
              const billedNote = annual
                ? `Facturé ${(perMonth * 12).toLocaleString('fr-FR')} F CFA/an (2 mois offerts)`
                : 'Facturé mensuellement, annulable à tout moment';

              return (
                <div
                  key={plan.key}
                  className={`relative gradient-border-card ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  <div className={`bg-white rounded-[calc(1.25rem-2px)] p-8 h-full flex flex-col ${plan.popular ? 'shadow-xl' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-[-2px]">
                        <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-b-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-terracotta)] shadow-lg">
                          <IconSparkle size={12} /> POPULAIRE
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)]' : 'bg-[var(--color-cream-dark)]'}`}>
                        <plan.icon size={22} className={plan.popular ? 'text-white' : 'text-[var(--color-earth)]'} />
                      </div>
                      <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                        {plan.name}
                      </h2>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-2 flex items-baseline gap-2">
                      {isFree ? (
                        <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                          0 F CFA
                        </span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                            {perMonth.toLocaleString('fr-FR')} F CFA
                          </span>
                          <span className="text-sm text-[var(--color-text-secondary)]">/ mois</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                      {isFree ? 'pour toujours, sans carte bancaire' : billedNote}
                    </p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-[var(--color-text-primary)]">
                          <IconCheck size={18} className="text-[var(--color-earth)] flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <ButtonLink
                      href={isFree ? '/signup' : `/signup?plan=${plan.key}`}
                      variant={plan.popular ? 'primary' : plan.key === 'pro' ? 'secondary' : 'ghost'}
                      className="w-full"
                      size="md"
                    >
                      {isFree ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
                    </ButtonLink>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security + refund */}
          <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <IconShield size={22} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Paiement 100% sécurisé</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Transactions chiffrées via CinetPay : Orange Money, Wave, MTN MoMo,
                  Moov Money, Visa et Mastercard.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-cream-dark)] flex items-center justify-center flex-shrink-0">
                <IconRepeat size={22} className="text-[var(--color-earth)]" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Satisfait ou remboursé</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Remboursement intégral sous 14 jours si le service ne vous convient pas.
                  Annulation à tout moment.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-cream-dark)] flex items-center justify-center flex-shrink-0">
                <IconRocket size={22} className="text-[var(--color-earth)]" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Essai gratuit inclus</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  50 crédits offerts dès l&apos;inscription pour tester tous les modules.
                  Passez au payant uniquement si ça vous plaît.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}