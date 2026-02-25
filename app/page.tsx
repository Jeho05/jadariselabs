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
} from '@/components/icons';

export default function Home() {
  const modules = [
    {
      icon: IconPalette,
      title: 'Génération d\'images',
      description: 'Transformez vos idées en images époustouflantes. Portraits, logos, art digital et plus encore.',
      tag: 'FLUX / SDXL',
      color: 'terracotta',
    },
    {
      icon: IconChat,
      title: 'Chat IA',
      description: 'Assistant intelligent pour le copywriting, la traduction, l\'aide à la rédaction et bien plus.',
      tag: 'LLaMA 3.3 70B',
      color: 'savanna',
    },
    {
      icon: IconVideo,
      title: 'Génération vidéo',
      description: 'Créez des courtes vidéos à partir de texte. Idéal pour le contenu social et marketing.',
      tag: 'Wan 2.1',
      color: 'gold',
    },
    {
      icon: IconEnhance,
      title: 'Amélioration image',
      description: 'Augmentez la résolution, supprimez les arrière-plans. Rendez vos images parfaites.',
      tag: 'Upscale AI',
      color: 'earth',
    },
    {
      icon: IconMusic,
      title: 'Génération audio',
      description: 'Musique, voix off, jingles. Créez du contenu audio professionnel avec l\'IA.',
      tag: 'Suno AI / Bark',
      color: 'terracotta',
    },
    {
      icon: IconCode,
      title: 'Code assistant',
      description: 'Aide au développement, débogage, refactoring. Votre copilote code IA.',
      tag: 'CodeLlama',
      color: 'savanna',
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

  return (
    <div className="min-h-screen bg-[var(--color-cream)] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-gold)]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-[var(--color-terracotta)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[var(--color-savanna)]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-lg shadow-[var(--color-earth)]/20">
            <IconFlask size={24} className="text-white" />
          </div>
          <span className="font-[var(--font-heading)] font-bold text-xl text-[var(--color-text-primary)]">
            JadaRiseLabs
          </span>
        </div>
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
        <div className="flex items-center gap-3">
          <a href="/login" className="btn-secondary text-sm py-2.5 px-5">
            Connexion
          </a>
          <a href="/signup" className="btn-primary text-sm py-2.5 px-5">
            Commencer gratuitement
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-16 md:px-12 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-gold)]/10 to-[var(--color-terracotta)]/10 border border-[var(--color-gold)]/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
                <IconSparkle size={16} className="text-[var(--color-gold)]" />
                <span className="text-[var(--color-gold-dark)] text-sm font-semibold">
                  Laboratoire IA Tout-en-1
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="text-gradient">L&apos;intelligence artificielle</span>
                <br />
                <span className="text-[var(--color-text-primary)]">accessible à tous</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Générez des images, chattez avec l&apos;IA, créez des vidéos et bien plus.
                Conçu pour l&apos;Afrique de l&apos;Ouest et le grand public.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
                <a href="/signup" className="btn-primary text-lg px-8 py-4 group">
                  <span>Commencer gratuitement</span>
                  <IconZap size={18} className="ml-2 group-hover:animate-pulse" />
                </a>
                <a href="#modules" className="btn-secondary text-lg px-8 py-4">
                  Découvrir les modules
                </a>
              </div>
              
              <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center lg:justify-start gap-2">
                <IconCheck size={16} className="text-[var(--color-savanna)]" />
                50 crédits gratuits • Aucune carte requise
              </p>
            </div>
            
            {/* Right Visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[var(--color-earth)]/10 border border-white/50 overflow-hidden">
                  {/* Decorative top bar */}
                  <div className="h-2 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-terracotta)] to-[var(--color-savanna)]" />
                  
                  <div className="p-8">
                    {/* Mock UI Elements */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)]" />
                      <div className="flex-1">
                        <div className="h-3 w-24 bg-[var(--color-text-primary)]/20 rounded-full mb-1" />
                        <div className="h-2 w-16 bg-[var(--color-text-muted)]/20 rounded-full" />
                      </div>
                    </div>
                    
                    {/* Mock Chat */}
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-savanna)]/20 flex-shrink-0" />
                        <div className="flex-1 bg-[var(--color-cream)]/50 rounded-2xl rounded-tl-sm p-3">
                          <div className="h-2 w-full bg-[var(--color-text-secondary)]/20 rounded-full mb-2" />
                          <div className="h-2 w-3/4 bg-[var(--color-text-secondary)]/20 rounded-full" />
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-earth-light)] rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                          <div className="h-2 w-full bg-white/30 rounded-full mb-2" />
                          <div className="h-2 w-2/3 bg-white/30 rounded-full" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/20 flex-shrink-0" />
                      </div>
                    </div>
                    
                    {/* Mock Generated Image */}
                    <div className="mt-6 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--color-terracotta)]/20 via-[var(--color-gold)]/20 to-[var(--color-savanna)]/20 aspect-video flex items-center justify-center">
                      <IconPalette size={48} className="text-[var(--color-earth)]/40" />
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/80 backdrop-blur rounded-2xl shadow-lg flex items-center justify-center animate-float">
                  <IconSparkle size={32} className="text-[var(--color-gold)]" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/80 backdrop-blur rounded-2xl shadow-lg flex items-center justify-center animate-float-delayed">
                  <IconVideo size={28} className="text-[var(--color-terracotta)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules IA */}
      <section id="modules" className="relative z-10 px-6 py-20 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Vos outils <span className="text-gradient">IA puissants</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Accédez aux meilleurs modèles d&apos;IA du marché, en un clic.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className="module-card-premium group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`module-icon-premium ${module.color}`}>
                  <module.icon size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-earth)] transition-colors">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3">
                    {module.description}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full tag-${module.color}`}>
                    {module.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-20 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Des <span className="text-gradient">tarifs simples</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Commencez gratuitement, upgradez quand vous voulez. Paiement Mobile Money.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.pro ? 'pro' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <IconStar size={14} />
                    POPULAIRE
                  </div>
                )}
                {plan.pro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-earth-light)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <IconCrown size={14} />
                    PRO
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold mb-2 text-[var(--color-text-primary)]">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-[var(--color-text-primary)]">{plan.price}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <IconCheck size={18} className="text-[var(--color-savanna)] flex-shrink-0" />
                      ) : (
                        <span className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center text-[var(--color-text-muted)]">✗</span>
                      )}
                      <span className={feature.included ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <a
                  href="/signup"
                  className={`w-full ${plan.popular || plan.pro ? 'btn-primary' : 'btn-secondary'} py-3 text-center`}
                >
                  Choisir {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-6 py-20 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Questions <span className="text-gradient">fréquentes</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <details key={i} className="faq-card group">
                <summary className="cursor-pointer font-semibold text-[var(--color-text-primary)] flex items-center justify-between p-5">
                  <span>{item.q}</span>
                  <div className="w-6 h-6 rounded-full bg-[var(--color-earth)]/10 flex items-center justify-center group-open:bg-[var(--color-earth)] transition-colors">
                    <span className="text-[var(--color-earth)] group-open:text-white group-open:rotate-180 transition-all text-sm">▾</span>
                  </div>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 md:px-12 border-t border-[var(--color-border)] bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-md">
              <IconFlask size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--color-text-primary)]">JadaRiseLabs</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-[var(--color-text-secondary)]">
            <a href="/legal/terms" className="hover:text-[var(--color-earth)] transition-colors">
              CGU
            </a>
            <a href="/legal/privacy" className="hover:text-[var(--color-earth)] transition-colors">
              Confidentialité
            </a>
            <a href="mailto:contact@jadarise.labs" className="hover:text-[var(--color-earth)] transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            © 2025 JadaRiseLabs. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
