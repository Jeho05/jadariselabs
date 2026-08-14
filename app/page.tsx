import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import SplitText from '@/components/SplitText';
import CountUp from '@/components/CountUp';
import SpotlightCard from '@/components/SpotlightCard';
import Magnet from '@/components/Magnet';
import StarBorder from '@/components/StarBorder';
import ShinyText from '@/components/ShinyText';
import RotatingText from '@/components/RotatingText';
import BlurText from '@/components/BlurText';
import GradientText from '@/components/GradientText';
import AnimatedContent from '@/components/AnimatedContent';
import FadeContent from '@/components/FadeContent';
import ScrollVelocity from '@/components/ScrollVelocity';
import { ImageStreamHero } from '@/components/ui/image-stream-hero';
import {
  IconPalette,
  IconChat,
  IconVideo,
  IconEnhance,
  IconMusic,
  IconCode,
  IconRocket,
  IconSparkle,
  IconStar,
  IconCheck,
  IconCrown,
  IconUsers,
  IconArrowRight,
  IconPlay,
  IconMail,
  IconHelpCircle,
  IconChevronDown,
} from '@/components/icons';

const U = 'https://images.unsplash.com';

const HERO_IMAGES = [
  { src: `${U}/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80`, alt: 'Portrait masculin à la lumière chaude' },
  { src: `${U}/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80`, alt: 'Circuit imprimé électronique' },
  { src: `${U}/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80`, alt: 'Portrait féminin souriant' },
  { src: `${U}/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80`, alt: 'Main robotique d’intelligence artificielle' },
  { src: `${U}/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80`, alt: 'Portrait masculin posant' },
  { src: `${U}/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80`, alt: 'Abstraction visuelle générée par IA' },
  { src: `${U}/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80`, alt: 'Portrait féminin élégant' },
  { src: `${U}/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80`, alt: 'Cybersécurité et réseaux lumineux' },
  { src: `${U}/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80`, alt: 'Portrait féminin en noir et blanc' },
  { src: `${U}/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80`, alt: 'Réseau mondial technologique' },
  { src: `${U}/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80`, alt: 'Portrait féminin studio' },
  { src: `${U}/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80`, alt: 'Rendu 3D abstrait organique' },
];

export default function Home() {
  const modules = [
    {
      icon: IconChat,
      title: 'Chat IA & Raisonnement',
      description: 'Llama 3.3 70B pour la vitesse (300 t/s) et DeepSeek R1 pour la logique experte (niveau o1).',
      tag: 'Zero-cost Premium API',
    },
    {
      icon: IconPalette,
      title: "Génération d'images",
      description: 'Qualité photoréaliste open-weight avec FLUX.1 (Hugging Face) & précision sémantique avec CogView-4.',
      tag: 'Photorealism',
    },
    {
      icon: IconVideo,
      title: 'Génération vidéo',
      description: 'Stabilité visuelle exceptionnelle pour des clips HD via Hailuo 2.3 et 02 Pro (MiniMax).',
      tag: 'Cinematic 1080P',
    },
    {
      icon: IconCode,
      title: 'Agentic Coding',
      description: "Votre copilote pour l'exécution de tâches complexes avec l'architecture optimisée de Zhipu AI GLM-5.",
      tag: 'MoE Architecture',
    },
    {
      icon: IconEnhance,
      title: 'Vision & OCR Documentaire',
      description: 'Pipeline end-to-end avec Mistral OCR (vitesse) et Chandra Qwen-VL (tableaux/complexité spatiale).',
      tag: '1M Token Context',
    },
    {
      icon: IconMusic,
      title: 'Audio & Voice Cloning',
      description: 'Synthèse multilingue (Bark) et clonage vocal instantané à partir de 10s (MiniMax Audio T2A).',
      tag: '17+ Langues',
    },
  ];

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'pour toujours',
      features: [
        { text: '50 crédits/mois', included: true },
        { text: 'Chat IA illimité', included: true },
        { text: 'Images HD', included: false },
        { text: 'Vidéo', included: false },
        { text: 'Audio', included: false },
        { text: 'Watermark sur créations', included: true },
      ],
      popular: false,
      pro: false,
    },
    {
      name: 'Starter',
      price: '500',
      period: 'F CFA/mois',
      features: [
        { text: '200 crédits/mois', included: true },
        { text: 'Chat IA illimité', included: true },
        { text: 'Images HD', included: true },
        { text: 'Vidéo (5s)', included: true },
        { text: 'Audio', included: true },
        { text: 'Sans watermark', included: true },
      ],
      popular: true,
      pro: false,
    },
    {
      name: 'Pro',
      price: '1500',
      period: 'F CFA/mois',
      features: [
        { text: 'Crédits illimités', included: true },
        { text: 'Chat IA illimité', included: true },
        { text: 'Images HD', included: true },
        { text: 'Vidéo (15s)', included: true },
        { text: 'Audio', included: true },
        { text: 'Sans watermark', included: true },
      ],
      popular: false,
      pro: true,
    },
  ];

  const faqs = [
    {
      q: "Qu'est-ce que JadaRiseLabs ?",
      a: "JadaRiseLabs est une plateforme web tout-en-un qui vous donne accès aux meilleures IA génératives du marché : génération d'images, chat IA, vidéo, audio et aide au code.",
    },
    {
      q: 'Comment fonctionnent les crédits ?',
      a: "Chaque génération consomme un certain nombre de crédits. Le plan gratuit offre 50 crédits/mois. Les plans payants offrent plus de crédits et des fonctionnalités premium comme la HD et la vidéo.",
    },
    {
      q: 'Quels moyens de paiement acceptez-vous ?',
      a: 'Nous acceptons Orange Money, Wave, MTN Mobile Money, Moov Money et les cartes Visa/Mastercard via CinetPay.',
    },
    {
      q: 'Mes créations sont-elles privées ?',
      a: "Oui, toutes vos créations sont stockées dans votre galerie personnelle. Vous seul y avez accès. Vous pouvez les partager sur les réseaux sociaux si vous le souhaitez.",
    },
    {
      q: 'Puis-je utiliser JadaRiseLabs sur mobile ?',
      a: "Absolument ! JadaRiseLabs est optimisé pour le mobile. Vous pouvez l'utiliser sur n'importe quel smartphone avec un navigateur web.",
    },
  ];

  const steps = [
    {
      title: 'Créez votre compte',
      description: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise.',
      icon: IconUsers,
    },
    {
      title: 'Choisissez un module',
      description: "Images, chat, vidéo, audio... Sélectionnez l'outil adapté à votre besoin.",
      icon: IconSparkle,
    },
    {
      title: 'Créez sans limites',
      description: "Laissez libre cours à votre créativité avec la puissance de l'IA.",
      icon: IconRocket,
    },
  ];

  const testimonials = [
    {
      name: 'Amadou Diallo',
      role: 'Designer freelance',
      company: 'Dakar, Sénégal',
      content: 'JadaRiseLabs a transformé ma façon de travailler. Je crée des visuels pour mes clients en quelques minutes au lieu de plusieurs heures. Un gain de temps énorme.',
      avatar: 'A',
      rating: 5,
    },
    {
      name: 'Fatou Mbaye',
      role: 'Entrepreneuse',
      company: "Abidjan, Côte d'Ivoire",
      content: "Le chat IA m'aide à rédiger mes propositions commerciales et mes posts LinkedIn. J'ai triplé ma production de contenu sans embaucher personne.",
      avatar: 'F',
      rating: 5,
    },
    {
      name: 'Ibrahim Koné',
      role: 'Développeur',
      company: 'Ouagadougou, Burkina Faso',
      content: "L'assistant code est incroyable. Il m'aide à déboguer et optimiser mon code plus rapidement. Le rapport qualité-prix est imbattable en Afrique.",
      avatar: 'I',
      rating: 4,
    },
  ];

  const marqueeItems =
    'Groq ✦ DeepSeek R1 ✦ FLUX.1 ✦ MiniMax Hailuo ✦ Mistral OCR ✦ Llama 3.3 ✦ Hugging Face ✦ CogView-4 ✦ Bark ✦ GLM-5';

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] overflow-x-hidden bg-grain">
      {/* ===================== HEADER ===================== */}
      <SiteHeader />

      {/* ===================== HERO — CORRIDOR IMAGE STREAM ===================== */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <ImageStreamHero
          images={HERO_IMAGES}
          cards={10}
          speed={22}
          axis={58}
          className="absolute inset-0 z-0"
        >
          {/* Voiles de lisibilité */}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,transparent_0%,rgba(14,11,9,0.6)_100%)]" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[var(--color-background)]/75 via-transparent to-[var(--color-background)]" />

          {/* Contenu */}
          <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-gold)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-gold)]"></span>
              </span>
              <ShinyText
                text="Laboratoire IA Tout-en-1 pour l'Afrique"
                speed={3}
                color="#B3A692"
                shineColor="#E8CD80"
                className="text-sm font-semibold tracking-wide uppercase"
              />
            </div>

            {/* Headline animée */}
            <SplitText
              text="L'IA premium, accessible à tous."
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-[var(--color-text-primary)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              delay={40}
              duration={0.9}
              splitType="words"
              tag="h1"
              textAlign="center"
            />

            {/* Accent doré animé */}
            <div className="mt-5">
              <GradientText
                colors={['#D4AF37', '#E8CD80', '#C08552', '#D4AF37']}
                animationSpeed={7}
                className="text-2xl md:text-3xl font-bold"
              >
                La puissance de l&apos;IA, à portée de main.
              </GradientText>
            </div>

            {/* Rotating capabilities */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <span className="text-lg md:text-xl text-[var(--color-text-secondary)] font-medium">Créez</span>
              <RotatingText
                texts={['des images HD', 'des vidéos IA', "de l'audio", 'du code', 'sans limites']}
                mainClassName="inline-flex overflow-hidden"
                splitLevelClassName="overflow-hidden"
                elementLevelClassName="text-[var(--color-gold-light)] font-bold text-lg md:text-xl"
                rotationInterval={2600}
                splitBy="characters"
              />
            </div>

            {/* Sous-titre */}
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mt-6 leading-relaxed max-w-xl font-medium">
              Infrastructure multimodale zéro-budget associant Groq, DeepSeek et FLUX.{' '}
              <span className="text-[var(--color-gold-light)]">Conçu pour la qualité maximale en Afrique.</span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-5 mt-10 w-full sm:w-auto">
              <Magnet magnetStrength={2} padding={40} wrapperClassName="inline-flex" innerClassName="inline-flex">
                <a
                  href="/signup"
                  className="btn-primary text-base px-8 py-4 group relative overflow-hidden"
                >
                  <span className="relative z-10">Commencer gratuitement</span>
                  <IconArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </a>
              </Magnet>
              <Magnet magnetStrength={1.2} padding={40} wrapperClassName="inline-flex" innerClassName="inline-flex">
                <a href="#modules" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                  <IconPlay size={18} />
                  Voir les modules
                </a>
              </Magnet>
            </div>

            {/* Confiance */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold)]">
                  <IconCheck size={12} />
                </div>
                50 crédits offerts
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold)]">
                  <IconCheck size={12} />
                </div>
                Aucune carte requise
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold)]">
                  <IconCheck size={12} />
                </div>
                Payez en Mobile Money
              </div>
            </div>

            {/* Indicateur de scroll */}
            <a
              href="#modules"
              aria-label="Défiler vers les modules"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-gold-light)] transition-colors"
            >
              <IconChevronDown size={26} className="animate-bounce" />
            </a>
          </div>
        </ImageStreamHero>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <section className="relative z-10 py-6 border-y border-[var(--color-border)] bg-[var(--color-background-2)]/60">
        <ScrollVelocity
          texts={[marqueeItems]}
          velocity={60}
          damping={40}
          stiffness={300}
          className="text-[var(--color-gold)]/50 font-semibold text-2xl md:text-3xl"
          numCopies={4}
        />
      </section>

      {/* ===================== STATS ===================== */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="glass-dark rounded-3xl px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <FadeContent distance={30} delay={0}>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <CountUp to={2500} separator=" " className="text-4xl md:text-5xl font-extrabold gold-gradient-text" />
                  <span className="text-4xl md:text-5xl font-extrabold gold-gradient-text">+</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-3">Utilisateurs actifs</p>
              </div>
            </FadeContent>
            <FadeContent distance={30} delay={0.1}>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <CountUp to={50} className="text-4xl md:text-5xl font-extrabold gold-gradient-text" />
                  <span className="text-4xl md:text-5xl font-extrabold gold-gradient-text">K+</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-3">Créations générées</p>
              </div>
            </FadeContent>
            <FadeContent distance={30} delay={0.2}>
              <div>
                <CountUp to={6} className="text-4xl md:text-5xl font-extrabold gold-gradient-text" />
                <p className="text-sm text-[var(--color-text-muted)] mt-3">Modules IA</p>
              </div>
            </FadeContent>
            <FadeContent distance={30} delay={0.3}>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <CountUp to={99} className="text-4xl md:text-5xl font-extrabold gold-gradient-text" />
                  <span className="text-4xl md:text-5xl font-extrabold gold-gradient-text">%</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-3">Satisfaction</p>
              </div>
            </FadeContent>
          </div>
        </div>
      </section>

      {/* ===================== COMMENT ÇA MARCHE ===================== */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-3 flex-wrap">
              <BlurText
                text="Comment ça"
                animateBy="words"
                delay={70}
                className="text-[var(--color-text-primary)] text-3xl md:text-4xl lg:text-5xl font-bold"
              />
              <GradientText
                colors={['#D4AF37', '#E8CD80', '#C08552']}
                animationSpeed={6}
                className="text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                fonctionne
              </GradientText>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg mt-4">
              Commencez à créer en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {steps.map((step, index) => (
              <AnimatedContent
                key={step.title}
                distance={60}
                direction="vertical"
                delay={index * 0.15}
                duration={0.7}
              >
                <div className="glass-dark rounded-3xl p-8 relative overflow-hidden h-full gold-border-hover group">
                  {/* Numéro */}
                  <div className="absolute -top-6 -right-2 text-[6rem] font-extrabold leading-none text-[var(--color-gold)]/10 group-hover:text-[var(--color-gold)]/20 transition-colors select-none">
                    {index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-gold)]/20 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <span className="text-white text-2xl font-bold">{index + 1}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-5">
                    <step.icon size={24} className="text-[var(--color-gold-light)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{step.title}</h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">{step.description}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MODULES ===================== */}
      <section id="modules" className="relative z-10 scroll-mt-24 px-6 md:px-12 lg:px-16 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 rounded-full px-5 py-2 mb-6">
              <IconSparkle size={16} className="text-[var(--color-gold)]" />
              <span className="text-[var(--color-gold-light)] text-sm font-semibold">6 Modules Disponibles</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-3 flex-wrap">
              <BlurText
                text="Vos outils"
                animateBy="words"
                delay={70}
                className="text-[var(--color-text-primary)] text-3xl md:text-4xl lg:text-5xl font-bold"
              />
              <GradientText
                colors={['#D4AF37', '#E8CD80', '#C08552']}
                animationSpeed={6}
                className="text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                IA puissants
              </GradientText>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg mt-4">
              Accédez aux meilleurs modèles d&apos;IA du marché, en un clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {modules.map((module, index) => (
              <FadeContent key={module.title} distance={50} delay={index * 0.08} className="h-full">
                <SpotlightCard
                  spotlightColor="rgba(212, 175, 55, 0.16)"
                  className="!bg-[var(--color-surface)] !border-[var(--color-border)] h-full group !p-0 overflow-hidden rounded-3xl"
                >
                  <div className="p-7 h-full flex flex-col relative">
                    {/* Glow d'icône */}
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[var(--color-gold)]/8 blur-[60px] pointer-events-none" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-terracotta)]/10 border border-[var(--color-gold)]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <module.icon size={26} className="text-[var(--color-gold-light)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-gold-light)] transition-colors mb-2">
                      {module.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-5 flex-1">
                      {module.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold-light)] border border-[var(--color-gold)]/25 self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] animate-pulse" />
                      {module.tag}
                    </span>
                  </div>
                </SpotlightCard>
              </FadeContent>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TÉMOIGNAGES ===================== */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-3 flex-wrap">
              <BlurText
                text="Ils nous"
                animateBy="words"
                delay={70}
                className="text-[var(--color-text-primary)] text-3xl md:text-4xl lg:text-5xl font-bold"
              />
              <GradientText
                colors={['#D4AF37', '#E8CD80', '#C08552']}
                animationSpeed={6}
                className="text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                font confiance
              </GradientText>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mt-4">
              Découvrez ce que les innovateurs africains réalisent avec JadaRiseLabs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeContent key={testimonial.name} distance={50} delay={index * 0.12} className="h-full">
                <div className="glass-dark rounded-3xl p-8 h-full flex flex-col gold-border-hover relative overflow-hidden">
                  <div className="absolute top-6 right-7 text-[var(--color-gold)]/15 font-serif text-7xl leading-none select-none">&quot;</div>
                  {/* Étoiles */}
                  <div className="flex items-center gap-1 mb-5" aria-label={`Note : ${testimonial.rating} sur 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconStar
                        key={star}
                        size={16}
                        className={star <= testimonial.rating ? 'text-[var(--color-gold)] fill-current' : 'text-[var(--color-border)] fill-current'}
                      />
                    ))}
                  </div>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8 relative z-10 font-medium flex-1">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center gap-4 mt-auto pt-5 border-t border-[var(--color-border)]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold-dark)] flex items-center justify-center text-white font-bold text-lg border-2 border-[var(--color-gold)]/30 shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-text-primary)]">{testimonial.name}</p>
                      <p className="text-sm font-medium text-[var(--color-text-muted)]">
                        {testimonial.role} — {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeContent>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TARIFS ===================== */}
      <section id="pricing" className="relative z-10 scroll-mt-24 px-6 md:px-12 lg:px-16 py-20 lg:py-28 bg-[var(--color-background-2)]/50 border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2 mb-6">
              <IconCrown size={16} className="text-[var(--color-gold)]" />
              <span className="text-[var(--color-gold-light)] text-sm font-semibold">
                Paiement Mobile Money Sécurisé
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-3 flex-wrap">
              <BlurText
                text="Des tarifs"
                animateBy="words"
                delay={70}
                className="text-[var(--color-text-primary)] text-3xl md:text-4xl lg:text-5xl font-bold"
              />
              <GradientText
                colors={['#D4AF37', '#E8CD80', '#C08552']}
                animationSpeed={6}
                className="text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                simples
              </GradientText>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg mt-4">
              Commencez gratuitement, upgradez quand vous avez besoin de plus de puissance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan) =>
              plan.popular ? (
                <FadeContent key={plan.name} distance={50} className="h-full" delay={0.1}>
                  <StarBorder as="div" color="#D4AF37" speed="5s" thickness={1} className="rounded-[26px] h-full">
                    <div className="relative h-full bg-gradient-to-b from-[#171108] to-[#1E1812] p-8 flex flex-col">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[var(--color-gold)]/40">
                        <IconStar size={14} />
                        POPULAIRE
                      </div>
                      <div className="text-center mb-8 pt-6">
                        <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">{plan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-extrabold gold-gradient-text">{plan.price}</span>
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{plan.period}</span>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            {feature.included ? (
                              <div className="w-5 h-5 mt-0.5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                                <IconCheck size={12} className="text-[var(--color-gold)]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 mt-0.5 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                                <span className="text-[var(--color-text-muted)] text-xs font-bold">−</span>
                              </div>
                            )}
                            <span className={feature.included ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)]'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={`/signup?plan=${plan.name.toLowerCase()}`}
                        className="w-full py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] shadow-lg shadow-[var(--color-gold)]/30 hover:shadow-[var(--color-gold)]/50 hover:-translate-y-0.5"
                      >
                        <span>Choisir {plan.name}</span>
                      </a>
                    </div>
                  </StarBorder>
                </FadeContent>
              ) : (
                <FadeContent key={plan.name} distance={50} className="h-full" delay={0.15}>
                  <div className={`glass-dark rounded-3xl p-8 h-full flex flex-col gold-border-hover ${plan.pro ? '!border-[var(--color-earth)]/40' : ''}`}>
                    {plan.pro && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[var(--color-text-primary)] text-[#1A1206] text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                        <IconCrown size={14} />
                        PRO
                      </div>
                    )}
                    <div className="text-center mb-8 pt-6">
                      <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-extrabold text-[var(--color-text-primary)]">{plan.price}</span>
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <div className="w-5 h-5 mt-0.5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                              <IconCheck size={12} className="text-[var(--color-gold)]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 mt-0.5 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                              <span className="text-[var(--color-text-muted)] text-xs font-bold">−</span>
                            </div>
                          )}
                          <span className={feature.included ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)]'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`/signup?plan=${plan.name.toLowerCase()}`}
                      className={`w-full py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all ${
                        plan.pro
                          ? 'bg-[var(--color-text-primary)] text-[#1A1206] hover:bg-white hover:-translate-y-0.5'
                          : 'border-2 border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold-light)]'
                      }`}
                    >
                      <span>Choisir {plan.name}</span>
                    </a>
                  </div>
                </FadeContent>
              )
            )}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="faq" className="relative z-10 px-6 md:px-12 lg:px-16 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-3 flex-wrap">
              <BlurText
                text="Questions"
                animateBy="words"
                delay={70}
                className="text-[var(--color-text-primary)] text-3xl md:text-4xl lg:text-5xl font-bold"
              />
              <GradientText
                colors={['#D4AF37', '#E8CD80', '#C08552']}
                animationSpeed={6}
                className="text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                fréquentes
              </GradientText>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mt-4">
              Tout ce que vous devez savoir sur JadaRiseLabs
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, i) => (
              <FadeContent key={i} distance={30} delay={i * 0.05}>
                <details className="group glass-dark rounded-2xl overflow-hidden gold-border-hover">
                  <summary className="cursor-pointer font-semibold text-[var(--color-text-primary)] flex items-center justify-between p-6 hover:bg-[var(--color-surface-2)]/60 transition-colors focus-visible:outline-none">
                    <span className="pr-4">{item.q}</span>
                    <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 flex items-center justify-center group-open:rotate-180 transition-transform duration-300 flex-shrink-0">
                      <span className="text-[var(--color-gold)] text-sm">▾</span>
                    </div>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{item.a}</p>
                  </div>
                </details>
              </FadeContent>
            ))}
          </div>

          {/* Contact */}
          <FadeContent distance={30} delay={0.2}>
            <div className="mt-12 text-center">
              <p className="text-[var(--color-text-secondary)] mb-5">Vous ne trouvez pas votre réponse ?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Magnet magnetStrength={1} padding={30} wrapperClassName="inline-flex" innerClassName="inline-flex">
                  <a href="/contact" className="btn-primary px-5 py-2.5 text-sm">
                    <IconHelpCircle size={16} />
                    Nous contacter
                  </a>
                </Magnet>
                <Magnet magnetStrength={1} padding={30} wrapperClassName="inline-flex" innerClassName="inline-flex">
                  <a href="mailto:contact@jadariselabs.com" className="btn-secondary px-5 py-2.5 text-sm">
                    <IconMail size={16} />
                    Écrire au support
                  </a>
                </Magnet>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16 md:py-24 mb-20">
        <div className="max-w-5xl mx-auto">
          <StarBorder as="div" color="#D4AF37" speed="4s" thickness={1.5} className="rounded-[2.5rem]">
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#171108] via-[#1B1510] to-[#241A10] p-12 md:p-20 text-center overflow-hidden">
              {/* Halos dorés */}
              <div className="gold-orb w-[400px] h-[400px] -top-32 -left-32" />
              <div className="gold-orb w-[400px] h-[400px] -bottom-32 -right-32" />
              <div className="hairline-gold absolute top-8 left-1/2 -translate-x-1/2 w-2/3" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[var(--color-text-primary)]">
                  <BlurText
                    text="Prêt à rejoindre la révolution IA ?"
                    animateBy="words"
                    delay={90}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)]"
                  />
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-12 leading-relaxed font-medium">
                  Créez votre compte gratuitement aujourd&apos;hui et recevez 50 crédits pour tester tous nos modèles premium.
                </p>
                <Magnet magnetStrength={2} padding={50} wrapperClassName="inline-flex" innerClassName="inline-flex">
                  <a href="/signup" className="btn-primary px-10 py-4 text-lg group">
                    <span>Créer un compte gratuit</span>
                    <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </Magnet>
              </div>
            </div>
          </StarBorder>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <SiteFooter />
    </div>
  );
}
