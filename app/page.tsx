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
      icon: IconPalette,
      title: 'Génération d\'images',
      description: 'Transformez vos idées en images époustouflantes. Portraits, logos, art digital et plus encore.',
      tag: 'FLUX / SDXL',
      color: 'terracotta',
      image: '/module-image-gen.jpg',
    },
    {
      icon: IconChat,
      title: 'Chat IA',
      description: 'Assistant intelligent pour le copywriting, la traduction, l\'aide à la rédaction et bien plus.',
      tag: 'LLaMA 3.3 70B',
      color: 'savanna',
      image: null,
    },
    {
      icon: IconVideo,
      title: 'Génération vidéo',
      description: 'Créez des courtes vidéos à partir de texte. Idéal pour le contenu social et marketing.',
      tag: 'Wan 2.1',
      color: 'gold',
      image: '/module-video.jpg',
    },
    {
      icon: IconEnhance,
      title: 'Amélioration image',
      description: 'Augmentez la résolution, supprimez les arrière-plans. Rendez vos images parfaites.',
      tag: 'Upscale AI',
      color: 'earth',
      image: null,
    },
    {
      icon: IconMusic,
      title: 'Génération audio',
      description: 'Musique, voix off, jingles. Créez du contenu audio professionnel avec l\'IA.',
      tag: 'Suno AI / Bark',
      color: 'terracotta',
      image: null,
    },
    {
      icon: IconCode,
      title: 'Code assistant',
      description: 'Aide au développement, débogage, refactoring. Votre copilote code IA.',
      tag: 'CodeLlama',
      color: 'savanna',
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
    <div className="min-h-screen bg-[var(--color-cream)] overflow-hidden">
      {/* Animated African Pattern Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: 'url(/pattern-african.svg)', 
          backgroundRepeat: 'repeat',
          animation: 'parallax-float 20s linear infinite'
        }}
      />
      
      {/* Premium Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-gold w-96 h-96 -top-48 -right-48" />
        <div className="orb orb-terracotta w-80 h-80 top-1/3 -left-40" />
        <div className="orb orb-savanna w-64 h-64 bottom-1/4 right-1/3" />
        <div className="orb orb-earth w-48 h-48 bottom-20 left-1/4" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 lg:px-16">
        <a href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-lg shadow-[var(--color-earth)]/20 group-hover:shadow-[var(--color-gold)]/30 transition-all duration-300 group-hover:scale-105">
            <IconFlask size={24} className="text-white" />
          </div>
          <span className="font-[var(--font-heading)] font-bold text-xl text-[var(--color-text-primary)] group-hover:text-[var(--color-earth)] transition-colors">
            JadaRiseLabs
          </span>
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

      {/* Hero Section - Immersive */}
      <section className="relative z-10 px-6 py-16 md:px-12 lg:px-16 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left stagger-container">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 glass-card-premium !rounded-full !px-4 !py-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)] animate-pulse" />
                <IconSparkle size={16} className="text-[var(--color-gold)]" />
                <span className="text-[var(--color-gold-dark)] text-sm font-semibold">
                  Laboratoire IA Tout-en-1
                </span>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 animate-fade-in-up" style={{ fontFamily: 'var(--font-heading)', animationDelay: '0.2s' }}>
                <span className="text-gradient-animated">L&apos;intelligence artificielle</span>
                <br />
                <span className="text-[var(--color-text-primary)]">accessible à tous</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                Générez des images, chattez avec l&apos;IA, créez des vidéos et bien plus.
                <span className="text-[var(--color-earth)] font-semibold"> Conçu pour l&apos;Afrique de l&apos;Ouest.</span>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <a href="/signup" className="btn-cta-premium group">
                  <span>Commencer gratuitement</span>
                  <IconZap size={20} className="ml-2 group-hover:animate-bounce" />
                </a>
                <a href="#modules" className="btn-secondary text-lg px-8 py-4 hover-lift flex items-center gap-2">
                  <IconPlay size={18} />
                  <span>Découvrir</span>
                </a>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <IconCheck size={16} className="text-[var(--color-savanna)]" />
                  <span>50 crédits gratuits</span>
                </div>
                <div className="w-px h-4 bg-[var(--color-border)]" />
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <IconCheck size={16} className="text-[var(--color-savanna)]" />
                  <span>Aucune carte requise</span>
                </div>
              </div>
            </div>
            
            {/* Right Visual - Immersive */}
            <div className="hidden lg:block relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-lg mx-auto">
                {/* Main Hero Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-premium-lg hover-lift transition-all duration-500">
                  <Image
                    src="/hero-ai-tech.jpg"
                    alt="JadaRiseLabs - Intelligence Artificielle pour l'Afrique"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-earth)]/80 via-[var(--color-earth)]/20 to-transparent" />
                  {/* Content Overlay */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white text-xl font-bold drop-shadow-lg mb-1">
                      L&apos;IA au service de la créativité africaine
                    </p>
                    <p className="text-white/80 text-sm drop-shadow">
                      Génère. Crée. Innove.
                    </p>
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                </div>
                
                {/* Floating Cards */}
                <div className="hidden xl:block absolute -top-6 -right-6 glass-card-premium !rounded-2xl !p-4 animate-float shadow-premium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center">
                      <IconSparkle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">IA Générative</p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">6 Modules</p>
                    </div>
                  </div>
                </div>
                
                <div className="hidden xl:block absolute -bottom-4 -left-4 glass-card-premium !rounded-2xl !p-4 animate-float-delayed shadow-premium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-savanna)] to-[var(--color-savanna-light)] flex items-center justify-center">
                      <IconImage size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">HD Ready</p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">Qualité Pro</p>
                    </div>
                  </div>
                </div>

                {/* Stats Mini Card */}
                <div className="hidden xl:block absolute top-1/2 -right-8 glass-card-premium !rounded-2xl !p-3 animate-float shadow-premium" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-earth-light)] flex items-center justify-center">
                      <IconUsers size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">2K+</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Utilisateurs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-12 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card-premium rounded-3xl p-8 md:p-12">
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
                {/* Connector Line */}
                {index < steps.length - 1 && (
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
                  {/* Module Image */}
                  {module.image && (
                    <div className="relative w-full h-40 mb-5 rounded-xl overflow-hidden -mx-6 -mt-6 px-6 pt-6">
                      <Image
                        src={module.image}
                        alt={module.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                    </div>
                  )}
                  
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

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-16 bg-gradient-to-b from-transparent via-[var(--color-cream-dark)]/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Ils nous <span className="text-gradient-animated">font confiance</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Découvrez ce que nos utilisateurs disent de JadaRiseLabs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 stagger-container">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name} 
                className="testimonial-card hover-lift"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6 pl-8">
                  {testimonial.content}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-20 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 rounded-full px-4 py-2 mb-6">
              <IconCrown size={16} className="text-[var(--color-gold)]" />
              <span className="text-[var(--color-gold-dark)] text-sm font-semibold">
                Paiement Mobile Money
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Des <span className="text-gradient-animated">tarifs simples</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg">
              Commencez gratuitement, upgradez quand vous voulez.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 stagger-container">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.pro ? 'pro' : ''} hover-lift`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse-glow">
                    <IconStar size={14} />
                    POPULAIRE
                  </div>
                )}
                {plan.pro && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-earth-light)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <IconCrown size={14} />
                    PRO
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gradient">{plan.price}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-savanna)]/10 flex items-center justify-center">
                          <IconCheck size={14} className="text-[var(--color-savanna)]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-border)] flex items-center justify-center">
                          <span className="text-[var(--color-text-muted)] text-xs">✗</span>
                        </div>
                      )}
                      <span className={feature.included ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <a
                  href="/signup"
                  className={`w-full ${plan.popular || plan.pro ? 'btn-cta-premium' : 'btn-secondary'} py-4 text-center flex items-center justify-center gap-2 group`}
                >
                  <span>Choisir {plan.name}</span>
                  <IconArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
          
          <div className="space-y-4 stagger-container">
            {faqs.map((item, i) => (
              <details key={i} className="faq-card group" style={{ animationDelay: `${i * 0.1}s` }}>
                <summary className="cursor-pointer font-semibold text-[var(--color-text-primary)] flex items-center justify-between p-6 hover:bg-[var(--color-cream)]/50 transition-colors rounded-xl">
                  <span className="pr-4">{item.q}</span>
                  <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center group-open:rotate-180 transition-transform duration-300 flex-shrink-0">
                    <span className="text-white text-sm">▾</span>
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

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card-premium rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-[var(--color-gold)]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-[var(--color-terracotta)]/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                Prêt à <span className="text-gradient-animated">créer</span> ?
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg mb-8">
                Rejoignez des milliers de créateurs africains qui utilisent JadaRiseLabs pour donner vie à leurs idées.
              </p>
              <a href="/signup" className="btn-cta-premium text-lg px-10 py-5 group">
                <span>Commencer gratuitement</span>
                <IconRocket size={20} className="ml-2 group-hover:animate-bounce" />
              </a>
              <p className="text-sm text-[var(--color-text-muted)] mt-4 flex items-center justify-center gap-2">
                <IconCheck size={14} className="text-[var(--color-savanna)]" />
                Aucune carte requise • 50 crédits offerts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 md:px-12 lg:px-16 border-t border-[var(--color-border)] bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-md">
                <IconFlask size={20} className="text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--color-text-primary)]">JadaRiseLabs</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-[var(--color-text-secondary)]">
              <a href="/legal/terms" className="hover:text-[var(--color-earth)] transition-colors relative group">
                CGU
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-earth)] group-hover:w-full transition-all" />
              </a>
              <a href="/legal/privacy" className="hover:text-[var(--color-earth)] transition-colors relative group">
                Confidentialité
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-earth)] group-hover:w-full transition-all" />
              </a>
              <a href="mailto:contact@jadarise.labs" className="hover:text-[var(--color-earth)] transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-earth)] group-hover:w-full transition-all" />
              </a>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              © 2025 JadaRiseLabs. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}