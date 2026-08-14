import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconChat,
  IconPalette,
  IconVideo,
  IconCode,
  IconEnhance,
  IconMusic,
  IconCheck,
  IconArrowRight,
  IconUsers,
  IconStar,
} from '@/components/icons';

export const metadata: Metadata = {
  title: 'Fonctionnalités — JadaRiseLabs',
  description:
    'Découvrez les modules IA de JadaRiseLabs : chat & raisonnement, génération d\'images, vidéo, coding agentique, OCR documentaire et audio — pensés pour l\'Afrique de l\'Ouest.',
};

const FEATURE_GROUPS = [
  {
    category: 'Création visuelle',
    color: 'terracotta',
    features: [
      {
        icon: IconPalette,
        title: 'Génération d\'images',
        description:
          'Créez des visuels photoréalistes en une phrase : logos, affiches, illustrations pour vos réseaux sociaux.',
        benefit: 'Des visuels professionnels en quelques secondes, sans designer ni budget.',
        image: '/module-image-gen.jpg',
        alt: 'Aperçu d\'une image générée par l\'IA',
        quote: 'Je crée les visuels de mes clients en quelques minutes au lieu de plusieurs heures.',
        quoteAuthor: 'Amadou D., designer freelance à Dakar',
      },
      {
        icon: IconVideo,
        title: 'Génération vidéo',
        description:
          'Transformez une description en clips HD stables : publicités, teasers, contenus TikTok et YouTube.',
        benefit: 'Produisez des vidéos de qualité studio pour capter l\'attention de votre audience.',
        image: '/module-video.jpg',
        alt: 'Aperçu d\'une vidéo générée par l\'IA',
        quote: 'Mes teasers TikTok ont doublé mon trafic en un mois.',
        quoteAuthor: 'Ibrahim K., créateur de contenu à Ouagadougou',
      },
    ],
  },
  {
    category: 'Intelligence & productivité',
    color: 'savanna',
    features: [
      {
        icon: IconChat,
        title: 'Chat IA & raisonnement',
        description:
          'Un assistant à la vitesse et à la logique expertes : rédaction, traduction, brainstorming, analyse.',
        benefit: 'Gagnez des heures par jour sur la rédaction, la recherche et la réflexion.',
        image: null,
        alt: '',
        quote: 'L\'IA rédige mes propositions commerciales et mes posts LinkedIn. J\'ai triplé ma production de contenu.',
        quoteAuthor: 'Fatou M., entrepreneuse à Abidjan',
      },
      {
        icon: IconCode,
        title: 'Agentic Coding',
        description:
          'Un copilote qui exécute des tâches complexes : débogage, refactoring, génération de code.',
        benefit: 'Livrez plus vite, avec un code plus propre et moins de bugs.',
        image: null,
        alt: '',
        quote: 'Il m\'aide à déboguer et optimiser mon code plus rapidement. Un gain énorme.',
        quoteAuthor: 'Ibrahim K., développeur à Ouagadougou',
      },
    ],
  },
  {
    category: 'Données & voix',
    color: 'earth',
    features: [
      {
        icon: IconEnhance,
        title: 'Vision & OCR documentaire',
        description:
          'Extrayez texte, tableaux et données de vos documents scannés ou photos en un instant.',
        benefit: 'Numérisez et exploitez vos archives papier sans ressaisie manuelle.',
        image: null,
        alt: '',
        quote: 'J\'ai numérisé tout mon dossier clients en une journée.',
        quoteAuthor: 'Awa S., gérante de PME à Dakar',
      },
      {
        icon: IconMusic,
        title: 'Audio & clonage vocal',
        description:
          'Générez de la voix off dans 17+ langues et clonez une voix à partir de 10 secondes d\'audio.',
        benefit: 'Des voix off professionnelles pour vos vidéos et podcasts, sans studio.',
        image: null,
        alt: '',
        quote: 'Mes podcasts ont maintenant une voix off professionnelle, sans studio ni micro coûteux.',
        quoteAuthor: 'Moussa T., podcasteur à Bamako',
      },
    ],
  },
];

const COLOR_GRADIENT: Record<string, string> = {
  terracotta: 'from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)]',
  savanna: 'from-[var(--color-savanna)] to-[var(--color-savanna-dark)]',
  earth: 'from-[var(--color-earth)] to-[var(--color-earth-dark)]',
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32">
        {/* Hero */}
        <section className="relative z-10 px-6 md:px-12 lg:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge tone="gold">6 modules IA · 1 plateforme</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Tout ce qu&apos;il faut pour <span className="gold-gradient-text">créer sans limites</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              De l&apos;idée au produit fini : images, vidéos, code, documents et voix —
              chaque module est pensé pour les créateurs et développeurs d&apos;Afrique de l&apos;Ouest.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ButtonLink href="/signup" variant="primary" size="lg">
                Essayer gratuitement
                <IconArrowRight size={18} className="ml-2" />
              </ButtonLink>
              <ButtonLink href="/pricing" variant="ghost" size="lg">
                Voir les tarifs
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Feature groups */}
        {FEATURE_GROUPS.map((group, groupIndex) => (
          <section key={group.category} className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <span className={`h-px w-12 bg-gradient-to-r ${COLOR_GRADIENT[group.color]}`} />
                <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {group.category}
                </h2>
              </div>

              <div className="space-y-8">
                {group.features.map((feature, i) => (
                  <article
                    key={feature.title}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}
                  >
                    {/* Visual */}
                    <div className="relative [direction:ltr]">
                      <div className="gradient-border-card group">
                        <div className="bg-[var(--color-surface)] rounded-[calc(1.25rem-2px)] p-3">
                          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
                            {feature.image ? (
                              <Image
                                src={feature.image}
                                alt={feature.alt}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${COLOR_GRADIENT[group.color]} opacity-20`} />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)]/95 backdrop-blur-sm shadow-lg flex items-center justify-center border border-[var(--color-gold)]/25">
                                <feature.icon size={32} className="text-[var(--color-gold-light)]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Copy */}
                    <div className="[direction:ltr]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${COLOR_GRADIENT[group.color]}`}>
                          <feature.icon size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <p className="flex items-start gap-2 text-sm font-semibold text-[var(--color-gold-light)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 rounded-xl px-4 py-3 mb-6">
                        <IconCheck size={18} className="flex-shrink-0 mt-0.5" />
                        {feature.benefit}
                      </p>

                      {/* Social proof per feature */}
                      <blockquote className="border-l-4 border-[var(--color-gold)] pl-4">
                        <p className="text-[var(--color-text-secondary)] italic text-sm leading-relaxed mb-2">
                          « {feature.quote} »
                        </p>
                        <footer className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                          <IconUsers size={14} />
                          {feature.quoteAuthor}
                          <span className="flex items-center gap-0.5 text-[var(--color-gold)]">
                            <IconStar size={12} className="fill-current" />
                            <IconStar size={12} className="fill-current" />
                            <IconStar size={12} className="fill-current" />
                            <IconStar size={12} className="fill-current" />
                            <IconStar size={12} className="fill-current" />
                          </span>
                        </footer>
                      </blockquote>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Inline CTA */}
        <section className="relative z-10 px-6 py-16 md:px-12 lg:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="relative glass-dark rounded-[2rem] p-10 md:p-16 text-center overflow-hidden gold-border-hover">
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundSize: '150px' }} />
              <div className="gold-orb w-[400px] h-[400px] -top-32 -right-32 opacity-60" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Prêt à tester ces modules ?
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed font-medium">
                  Créez votre compte gratuitement et recevez 50 crédits pour essayer
                  tous les modèles premium.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="/signup" className="btn-primary !bg-[var(--color-gold)] !text-[#1A1206] px-10 py-4 group">
                    <span>Créer un compte gratuit</span>
                    <IconArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="/pricing" className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold border border-[var(--color-gold)]/40 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.12] transition-all">
                    Comparer les plans
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