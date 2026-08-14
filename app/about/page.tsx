import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconRocket,
  IconUsers,
  IconTarget,
  IconHeart,
  IconGraduationCap,
  IconAward,
  IconArrowRight,
} from '@/components/icons';

export const metadata: Metadata = {
  title: 'À propos — JadaRiseLabs',
  description:
    'L\'histoire, la mission et l\'équipe derrière JadaRiseLabs, le premier laboratoire d\'IA complet pensé pour l\'Afrique de l\'Ouest.',
};

const VALUES = [
  {
    icon: IconTarget,
    title: 'L\'IA pour tous',
    description:
      'Des outils premium accessibles au prix d\'un crédit de téléphone, pas au prix d\'un abonnement occidental.',
  },
  {
    icon: IconHeart,
    title: 'Fiers de nos racines',
    description:
      'Un design et des usages pensés pour l\'Afrique de l\'Ouest, avec nos langues, nos réalités et notre créativité.',
  },
  {
    icon: IconGraduationCap,
    title: 'Apprendre en créant',
    description:
      'Chaque création est une occasion de progresser. Nous aidons créateurs et développeurs à monter en compétences.',
  },
  {
    icon: IconUsers,
    title: 'Communauté d\'abord',
    description:
      'Nos utilisateurs façonnent le produit : chaque module est nourri par leurs retours et leurs créations.',
  },
];

const TEAM = [
  {
    name: 'Jada',
    role: 'Fondateur & CEO',
    bio: 'Visionnaire de la tech ouest-africaine, Jada a fondé JadaRiseLabs pour démontrer que l\'Afrique peut être créatrice, et non simple consommatrice, d\'IA.',
    initials: 'J',
  },
  {
    name: 'Awa',
    role: 'Design & Expérience',
    bio: 'Awa traduit la puissance de l\'IA en interfaces simples et chaleureuses, pensées pour les créateurs du continent.',
    initials: 'A',
  },
  {
    name: 'Moussa',
    role: 'Ingénierie IA',
    bio: 'Moussa assemble et optimise les modèles open-weight qui propulsent nos 6 modules, avec une exigence de qualité locale.',
    initials: 'M',
  },
];

const MILESTONES = [
  { year: '2025', text: 'Lancement de la plateforme avec 6 modules IA complets' },
  { year: '2025', text: 'Paiement Mobile Money (Orange Money, Wave, MTN MoMo) activé' },
  { year: '2026', text: 'Plus de 2 500 créateurs et développeurs actifs dans 12 pays' },
  { year: '2026', text: 'Nouveau studio vidéo et clonage vocal multilingue' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32">
        {/* Hero */}
        <section className="relative z-10 px-6 md:px-12 lg:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge tone="gold">Depuis 2025 · Afrique de l&apos;Ouest</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              L&apos;IA, <span className="gold-gradient-text">faite pour nous, par nous</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
              JadaRiseLabs est né d&apos;un constat simple : les meilleurs outils d&apos;IA
              étaient conçus ailleurs, coûtaient en dollars, et ignoraient nos réalités.
              Nous avons décidé de bâtir le laboratoire que l&apos;Afrique de l&apos;Ouest mérite.
            </p>
          </div>
        </section>

        {/* Origin story */}
        <section className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="glass-dark rounded-3xl p-8 md:p-12 gold-border-hover">
              <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                Notre histoire
              </h2>
              <div className="space-y-4 text-[var(--color-text-secondary)] leading-relaxed">
                <p>
                  Tout a commencé à Dakar, devant un écran qui refusait de nous laisser
                  payer un abonnement sans carte internationale. Le potentiel était là —
                  la porte d&apos;entrée, non.
                </p>
                <p>
                  Nous avons donc construit JadaRiseLabs autour d&apos;une conviction :
                  un créateur à Abidjan doit avoir accès aux mêmes superpouvoirs d&apos;IA
                  qu&apos;un studio à San Francisco, à un prix accessible en F CFA et
                  payable en Mobile Money.
                </p>
                <p>
                  Aujourd&apos;hui, des milliers de designers, développeurs, entrepreneurs
                  et artistes créent chaque jour avec nos modules — en français, en
                  wolof, en dioula, en bambara — et prouvent que l&apos;IA africaine
                  n&apos;est pas un slogan, c&apos;est une réalité.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-heading)' }}>
              Ce qui nous <span className="gold-gradient-text">anime</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((value) => (
                <div key={value.title} className="glass-dark rounded-2xl p-6 gold-border-hover">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 flex items-center justify-center mb-4">
                    <value.icon size={24} className="text-[var(--color-gold-light)]" />
                  </div>
                  <h3 className="font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-heading)' }}>
              Notre <span className="gold-gradient-text">parcours</span>
            </h2>
            <div className="relative border-l-2 border-[var(--color-gold)]/30 ml-4 space-y-8">
              {MILESTONES.map((milestone, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--color-gold)] ring-4 ring-[var(--color-surface-2)] shadow-lg shadow-[var(--color-gold)]/40" />
                  <div className="glass-dark rounded-2xl p-5 gold-border-hover">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-gold-light)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 px-3 py-1 rounded-full mb-2">
                      <IconAward size={12} />
                      {milestone.year}
                    </span>
                    <p className="font-medium text-[var(--color-text-primary)]">{milestone.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              L&apos;équipe <span className="gold-gradient-text">derrière le lab</span>
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto">
              Une petite équipe soudée, obsédée par la qualité et fière de ses racines.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEAM.map((member) => (
                <div key={member.name} className="glass-dark rounded-2xl p-8 text-center gold-border-hover">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 ring-4 ring-[var(--color-surface-2)]">
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm font-semibold text-[var(--color-gold-light)] mb-3">{member.role}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <p className="text-[var(--color-text-secondary)] mb-4">
                Envie de rejoindre l&apos;aventure ?
              </p>
              <ButtonLink href="/contact" variant="ghost">
                Écrivez-nous
                <IconArrowRight size={16} className="ml-2" />
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 px-6 py-16 md:px-12 lg:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="relative glass-dark rounded-[2rem] p-10 md:p-16 text-center overflow-hidden gold-border-hover">
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundSize: '150px' }} />
              <div className="gold-orb w-[400px] h-[400px] -top-32 -right-32 opacity-60" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <IconRocket size={24} className="text-[var(--color-gold)]" />
                  <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                    Rejoignez l&apos;aventure
                  </h2>
                </div>
                <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed font-medium">
                  Créez votre premier visuel avec l&apos;IA africaine dès aujourd&apos;hui —
                  50 crédits offerts, sans carte bancaire.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="/signup" className="btn-primary !bg-[var(--color-gold)] !text-[#1A1206] px-10 py-4 group">
                    <span>Créer un compte gratuit</span>
                    <IconArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="/features" className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold border border-[var(--color-gold)]/40 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.12] transition-all">
                    Découvrir les modules
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}