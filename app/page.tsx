import Image from 'next/image';
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
  IconFlask,
  IconZap,
  IconCrown,
  IconUsers,
  IconImage,
  IconMessage,
  IconArrowRight,
  IconPlay,
  IconHeart,
} from '@/components/icons';

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <span className="inline-flex items-center counter-animated">
      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-animated">{value}</span>
      {suffix && <span className="text-lg md:text-xl text-[var(--color-text-secondary)] ml-1">{suffix}</span>}
    </span>
  );
}

export default function Home() {
  const modules = [
    {
      icon: IconChat,
      title: 'Chat IA & Raisonnement',
      description: 'Llama 3.3 70B pour la vitesse (300 t/s) et DeepSeek R1 pour la logique experte (niveau o1).',
      tag: 'Zero-cost Premium API',
      color: 'savanna',
      image: null,
    },
    {
      icon: IconPalette,
      title: 'Génération d\'images',
      description: 'Qualité photoréaliste open-weight avec FLUX.1 (Hugging Face) & précision sémantique avec CogView-4.',
      tag: 'Photorealism',
      color: 'terracotta',
      image: '/module-image-gen.jpg',
    },
    {
      icon: IconVideo,
      title: 'Génération vidéo',
      description: 'Stabilité visuelle exceptionnelle pour des clips HD via Hailuo 2.3 et 02 Pro (MiniMax).',
      tag: 'Cinematic 1080P',
      color: 'gold',
      image: '/module-video.jpg',
    },
    {
      icon: IconCode,
      title: 'Agentic Coding',
      description: 'Votre copilote pour l\'exécution de tâches complexes avec l\'architecture optimisée de Zhipu AI GLM-5.',
      tag: 'MoE Architecture',
      color: 'savanna',
      image: null,
    },
    {
      icon: IconEnhance,
      title: 'Vision & OCR Documentaire',
      description: 'Pipeline end-to-end avec Mistral OCR (vitesse) et Chandra Qwen-VL (tableaux/complexité spatiale).',
      tag: '1M Token Context',
      color: 'earth',
      image: null,
    },
    {
      icon: IconMusic,
      title: 'Audio & Voice Cloning',
      description: 'Synthèse multilingue (Bark) et clonage vocal instantané à partir de 10s (MiniMax Audio T2A).',
      tag: '17+ Langues',
      color: 'terracotta',
      image: null,
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
      description: 'Images, chat, vidéo, audio... Sélectionnez l\'outil adapté à votre besoin.',
      icon: IconSparkle,
    },
    {
      title: 'Créez sans limites',
      description: 'Laissez libre cours à votre créativité avec la puissance de l\'IA.',
      icon: IconRocket,
    },
  ];

  const testimonials = [
    {
      name: 'Amadou D.',
      role: 'Designer freelance',
      content: 'JadaRiseLabs a transformé ma façon de travailler. Je crée des visuels pour mes clients en quelques minutes au lieu de plusieurs heures.',
      avatar: 'A',
    },
    {
      name: 'Fatou M.',
      role: 'Entrepreneuse',
      content: 'Le chat IA m\'aide à rédiger mes propositions commerciales et mes posts LinkedIn. Un gain de temps considérable !',
      avatar: 'F',
    },
    {
      name: 'Ibrahim K.',
      role: 'Développeur',
      content: 'L\'assistant code est incroyable. Il m\'aide à déboguer et optimiser mon code plus rapidement.',
      avatar: 'I',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] overflow-x-hidden selection:bg-[var(--color-gold)]/30">
      {/* Background Orbs effect - simplified and tasteful */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-gold)] blur-[120px] opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[45%] rounded-full bg-[var(--color-terracotta)] blur-[150px] opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-[var(--color-savanna)] blur-[130px] opacity-15 animate-float"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 lg:px-16">
        <a href="/" className="flex items-center group">
          <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-12 sm:h-16 w-auto" priority />
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#modules" className="nav-link">
            Modules IA
          </a>
          <a href="#pricing" className="nav-link">
            Tarifs
          </a>
          <a href="#faq" className="nav-link">
            FAQ
          </a>
          <a href="/legal/privacy" className="nav-link">
            Confidentialité
          </a>
        </nav>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a href="/login" className="btn-secondary text-sm py-2 px-4 sm:py-2.5 sm:px-5 hover-lift">
            Connexion
          </a>
          <a href="/signup" className="btn-primary text-sm py-2 px-4 sm:py-2.5 sm:px-5 btn-ripple hover-lift animate-pulse-glow">
            Commencer gratuitement
          </a>
        </div>
      </header>

      {/* Hero Section - Clean & Modern */}
      <section className="relative z-10 px-6 py-12 md:px-12 lg:px-16 pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0 stagger-container-fast relative z-20">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[var(--color-gold)]/20 rounded-full px-4 py-2 mb-8 shadow-sm text-[var(--color-gold-dark)] text-sm font-semibold tracking-wide uppercase">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-gold)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-gold)]"></span>
                </span>
                Laboratoire IA Tout-en-1
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-[var(--color-text-primary)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                L&apos;IA premium, 
                <span className="block text-gradient mt-2 pb-2 text-transparent bg-clip-text">accessible à tous.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed max-w-xl font-medium">
                Infrastructure multimodale zéro-budget associant Groq, DeepSeek et FLUX. <span className="text-[var(--color-earth)]">Conçu pour la qualité maximale en Afrique.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <a href="/signup" className="w-full sm:w-auto btn-primary text-base px-8 py-3.5 shadow-lg shadow-[var(--color-earth)]/20 group hover:-translate-y-1 transition-transform">
                  <span>Commencer gratuitement</span>
                  <IconArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#modules" className="w-full sm:w-auto bg-white/50 backdrop-blur-sm border-2 border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold rounded-xl text-base px-8 py-3.5 hover:border-[var(--color-earth-light)] hover:bg-white transition-all flex items-center justify-center gap-2">
                  <IconPlay size={18} className="text-[var(--color-earth)] opacity-80" />
                  <span>Voir les modules</span>
                </a>
              </div>

              {/* Trust Features */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 mt-10">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <IconCheck size={12} />
                  </div>
                  50 crédits offerts
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <IconCheck size={12} />
                  </div>
                  Aucune carte requise
                </div>
              </div>
            </div>

            {/* Right Visual - HD Image */}
            <div className="relative animate-fade-in lg:ml-auto w-full max-w-[600px] mx-auto z-10">
              <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] xl:aspect-square w-full">
                {/* Main Hero Image */}
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-[var(--color-earth)]/20 border justify-center border-white/50 ring-1 ring-black/5">
                  <Image
                    src="/hero-jadariselabs.png"
                    alt="JadaRiseLabs - Premium Multimodal AI interface"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={95}
                    className="object-cover object-center scale-[1.02]"
                    priority
                  />
                  {/* Subtle vignette rather than heavy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-earth-dark)]/40 via-transparent to-transparent mix-blend-multiply opacity-60" />
                </div>

                {/* Floating Cards — desktop only */}
                <div className="hidden lg:flex absolute -left-8 -bottom-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-black/5 border border-white items-center gap-4 animate-float">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-savanna)]/10 flex items-center justify-center">
                    <IconZap size={24} className="text-[var(--color-savanna)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Vitesse Groq</p>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">300+ Tokens/sec</p>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="hidden xl:flex absolute top-12 -right-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-black/5 border border-white items-center gap-4 animate-float-delayed">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center">
                    <IconStar size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Qualité Multimodale</p>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">FLUX & Hailuo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-8 md:px-12 lg:px-16 -mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="stagger-container">
                <AnimatedCounter value="2,500" suffix="+" />
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Utilisateurs actifs</p>
              </div>
              <div className="stagger-container">
                <AnimatedCounter value="50K" suffix="+" />
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Créations générées</p>
              </div>
              <div className="stagger-container">
                <AnimatedCounter value="6" />
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Modules IA</p>
              </div>
              <div className="stagger-container">
                <AnimatedCounter value="99" suffix="%" />
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Comment ça <span className="text-gradient-animated">fonctionne</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg">
              Commencez à créer en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative group"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`, opacity: 0 }}
              >
                {/* Connector Line */} {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[var(--color-gold)]/50 to-transparent" />
                )}

                <div className="glass-card-premium rounded-2xl p-8 hover-lift">
                  {/* Step Number */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-white text-2xl font-bold">{index + 1}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-cream)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-gold)]/10 transition-colors">
                    <step.icon size={24} className="text-[var(--color-earth)]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules IA */}
      <section id="modules" className="relative z-10 px-6 py-20 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[var(--color-savanna)]/10 border border-[var(--color-savanna)]/20 rounded-full px-4 py-2 mb-6">
              <IconSparkle size={16} className="text-[var(--color-savanna)]" />
              <span className="text-[var(--color-savanna-dark)] text-sm font-semibold">
                6 Modules Disponibles
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Vos outils <span className="text-gradient-animated">IA puissants</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg">
              Accédez aux meilleurs modèles d&apos;IA du marché, en un clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-container">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className="gradient-border-card group hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-[calc(1.25rem-2px)] p-6 h-full">
                  {/* No Image - Using abstract pattern instead */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm bg-${module.color}-50 text-white font-bold text-lg bg-gradient-to-br from-[var(--color-${module.color})] text-white shadow-md mb-6`}>
                     <module.icon size={28} className="text-white drop-shadow-sm" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`module-icon-premium ${module.color} group-hover:scale-110 transition-transform`}>
                      <module.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-earth)] transition-colors mb-2">
                        {module.title}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
                        {module.description}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full tag-${module.color}`}>
                        {module.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Cleaner */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Ils nous <span className="text-gradient">font confiance</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Découvrez ce que les innovateurs africains réalisent avec JadaRiseLabs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow relative"
              >
                <div className="absolute top-6 left-6 text-[var(--color-gold)] opacity-20 font-serif text-6xl leading-none">&quot;</div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6 pt-6 relative z-10 font-medium">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[var(--color-border)]/50">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-earth-dark)] font-bold text-lg border-2 border-white shadow-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)]">{testimonial.name}</p>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Cleaner Layout */}
      <section id="pricing" className="relative z-10 px-6 py-20 md:px-12 lg:px-16 bg-[var(--color-cream-dark)]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--color-gold)]/20 rounded-full px-4 py-2 mb-6 shadow-sm">
              <IconCrown size={16} className="text-[var(--color-gold)]" />
              <span className="text-[var(--color-text-secondary)] text-sm font-semibold">
                Paiement Mobile Money Sécurisé
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Des tarifs <span className="text-gradient">simples</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg">
              Commencez gratuitement, upgradez quand vous avez besoin de plus de puissance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-8 transition-transform hover:-translate-y-2 duration-300 ${
                  plan.popular 
                    ? 'shadow-xl shadow-[var(--color-earth)]/10 ring-2 ring-[var(--color-earth)] scale-100 md:scale-105 z-10' 
                    : 'shadow-lg shadow-black/5 border border-[var(--color-border)]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[var(--color-earth)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    <IconStar size={14} />
                    POPULAIRE
                  </div>
                )} 
                {plan.pro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[var(--color-text-primary)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    <IconCrown size={14} />
                    PRO
                  </div>
                )}

                <div className="text-center mb-8 pt-4">
                  <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">{plan.price}</span>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <div className="w-5 h-5 mt-0.5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <IconCheck size={12} className="text-green-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 mt-0.5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-gray-400 text-xs font-bold">−</span>
                        </div>
                      )}
                      <span className={feature.included ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)]'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className={`w-full py-3.5 rounded-xl font-semibold text-center flex items-center justify-center gap-2 transition-all ${
                    plan.popular 
                      ? 'bg-[var(--color-earth)] text-white hover:bg-[var(--color-earth-dark)] shadow-md hover:shadow-lg' 
                      : plan.pro
                        ? 'bg-[var(--color-text-primary)] text-white hover:bg-black shadow-md hover:shadow-lg'
                        : 'bg-white border-2 border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-earth)]'
                  }`}
                >
                  <span>Choisir {plan.name}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-6 py-20 md:px-12 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Questions <span className="text-gradient-animated">fréquentes</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Tout ce que vous devez savoir sur JadaRiseLabs
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="cursor-pointer font-semibold text-[var(--color-text-primary)] flex items-center justify-between p-6 hover:bg-[var(--color-cream)]/50 transition-colors">
                  <span className="pr-4">{item.q}</span>
                  <div className="w-8 h-8 rounded-full bg-[var(--color-cream-dark)] flex items-center justify-center group-open:rotate-180 transition-transform duration-300 flex-shrink-0">
                    <span className="text-[var(--color-earth-dark)] text-sm">▾</span>
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-[var(--color-text-secondary)] leading-relaxed pl-0">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="relative z-10 px-6 py-16 md:px-12 lg:px-16 mb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-[var(--color-earth-dark)] rounded-[2rem] p-10 md:p-16 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundSize: '150px' }} />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Prêt à rejoindre la révolution IA ?
              </h2>
              <p className="text-white/80 text-lg mb-10 leading-relaxed font-medium">
                Créez votre compte gratuitement aujourd&apos;hui et recevez 50 crédits pour tester tous nos modèles premium.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/signup" className="btn-primary !bg-[var(--color-gold)] !text-[var(--color-earth-dark)] !shadow-[var(--color-gold)]/20 px-10 py-4 group">
                  <span>Créer un compte gratuit</span>
                  <IconArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Cleaner */}
      <footer className="relative z-10 border-t border-[var(--color-border)] bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-12 w-auto grayscale mix-blend-multiply opacity-80" />
                </div>
              </div>
              <p className="text-[var(--color-text-secondary)] max-w-sm mb-6 leading-relaxed">
                Le premier laboratoire d&apos;intelligence artificielle complet pensé pour les créateurs et développeurs en Afrique de l&apos;Ouest.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] mb-6 uppercase tracking-wider text-sm">Produit</h4>
              <ul className="space-y-4">
                <li><a href="#modules" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Modules IA</a></li>
                <li><a href="#pricing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Tarifs</a></li>
                <li><a href="/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Connexion</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] mb-6 uppercase tracking-wider text-sm">Légal</h4>
              <ul className="space-y-4">
                <li><a href="/legal/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">CGU</a></li>
                <li><a href="/legal/privacy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Confidentialité</a></li>
                <li><a href="mailto:contact@jadarise.labs" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--color-text-muted)] text-sm">
              © {new Date().getFullYear()} JadaRiseLabs. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              Fait avec <IconHeart size={14} className="text-red-500 fill-current" /> en Afrique
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
