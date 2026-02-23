export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <span className="font-[var(--font-heading)] font-bold text-xl text-[var(--color-text-primary)]">
            JadaRiseLabs
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#modules" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors text-sm font-medium">
            Modules IA
          </a>
          <a href="#pricing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors text-sm font-medium">
            Tarifs
          </a>
          <a href="#faq" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors text-sm font-medium">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="/login" className="btn-secondary text-sm py-2 px-4">
            Connexion
          </a>
          <a href="/signup" className="btn-primary text-sm py-2 px-4">
            Commencer gratuitement
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:px-12 md:py-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 rounded-full px-4 py-1 mb-8">
          <span className="text-[var(--color-gold-dark)] text-sm font-medium">
            🚀 Laboratoire IA Tout-en-1
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className="text-gradient">L&apos;intelligence artificielle</span>
          <br />
          <span className="text-[var(--color-text-primary)]">accessible à tous</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Générez des images, chattez avec l&apos;IA, créez des vidéos et bien plus.
          Conçu pour l&apos;Afrique de l&apos;Ouest et le grand public.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/signup" className="btn-primary text-lg px-8 py-4">
            Commencer gratuitement →
          </a>
          <a href="#modules" className="btn-secondary text-lg px-8 py-4">
            Découvrir les modules
          </a>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-4">
          50 crédits gratuits • Aucune carte requise
        </p>
      </section>

      {/* Modules IA */}
      <section id="modules" className="px-6 py-20 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Vos outils <span className="text-gradient">IA puissants</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-center mb-12 max-w-xl mx-auto">
            Accédez aux meilleurs modèles d&apos;IA du marché, en un clic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Génération d'images */}
            <div className="card group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-terracotta)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Génération d&apos;images</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Transformez vos idées en images époustouflantes. Portraits, logos, art digital et plus encore.
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-savanna)] bg-[var(--color-savanna)]/10 px-3 py-1 rounded-full">
                FLUX / SDXL
              </span>
            </div>
            {/* Chat IA */}
            <div className="card group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-savanna)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Chat IA</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Assistant intelligent pour le copywriting, la traduction, l&apos;aide à la rédaction et bien plus.
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-savanna)] bg-[var(--color-savanna)]/10 px-3 py-1 rounded-full">
                LLaMA 3.3 70B
              </span>
            </div>
            {/* Génération vidéo */}
            <div className="card group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Génération vidéo</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Créez des courtes vidéos à partir de texte. Idéal pour le contenu social et marketing.
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-gold-dark)] bg-[var(--color-gold)]/10 px-3 py-1 rounded-full">
                Wan 2.1
              </span>
            </div>
            {/* Amélioration image */}
            <div className="card group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-earth)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Amélioration image</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Augmentez la résolution, supprimez les arrière-plans. Rendez vos images parfaites.
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-earth)] bg-[var(--color-earth)]/10 px-3 py-1 rounded-full">
                Upscale AI
              </span>
            </div>
            {/* Génération audio */}
            <div className="card group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-terracotta)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Génération audio</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Musique, voix off, jingles. Créez du contenu audio professionnel avec l&apos;IA.
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10 px-3 py-1 rounded-full">
                Suno AI / Bark
              </span>
            </div>
            {/* Code assistant */}
            <div className="card group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-savanna)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Code assistant</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Aide au développement, débogage, refactoring. Votre copilote code IA.
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-[var(--color-savanna)] bg-[var(--color-savanna)]/10 px-3 py-1 rounded-full">
                CodeLlama
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Des <span className="text-gradient">tarifs simples</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-center mb-12 max-w-xl mx-auto">
            Commencez gratuitement, upgradez quand vous voulez. Paiement Mobile Money.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gratuit */}
            <div className="card text-center">
              <h3 className="text-lg font-bold mb-2">Gratuit</h3>
              <div className="text-4xl font-bold text-[var(--color-text-primary)] mb-1">0 <span className="text-lg font-normal text-[var(--color-text-secondary)]">F CFA</span></div>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">pour toujours</p>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> 50 crédits/mois</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Chat IA illimité</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-text-muted)]">✗</span> Images HD</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-text-muted)]">✗</span> Vidéo</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-text-muted)]">✗</span> Audio</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Watermark sur créations</li>
              </ul>
              <a href="/signup" className="btn-secondary w-full">Commencer</a>
            </div>
            {/* Starter */}
            <div className="card text-center border-2 border-[var(--color-gold)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-gold)] text-white text-xs font-bold px-4 py-1 rounded-full">
                POPULAIRE
              </div>
              <h3 className="text-lg font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold text-[var(--color-text-primary)] mb-1">500 <span className="text-lg font-normal text-[var(--color-text-secondary)]">F CFA/mois</span></div>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">facturé mensuellement</p>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> 200 crédits/mois</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Chat IA illimité</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Images HD</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Vidéo (5s)</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Audio</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Sans watermark</li>
              </ul>
              <a href="/signup" className="btn-primary w-full">Choisir Starter</a>
            </div>
            {/* Pro */}
            <div className="card text-center">
              <h3 className="text-lg font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold text-[var(--color-text-primary)] mb-1">1500 <span className="text-lg font-normal text-[var(--color-text-secondary)]">F CFA/mois</span></div>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">facturé mensuellement</p>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Crédits illimités</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Chat IA illimité</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Images HD</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Vidéo (15s)</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Audio</li>
                <li className="flex items-center gap-2"><span className="text-[var(--color-savanna)]">✓</span> Sans watermark</li>
              </ul>
              <a href="/signup" className="btn-primary w-full">Choisir Pro</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Questions <span className="text-gradient">fréquentes</span>
          </h2>
          <div className="space-y-4">
            {[
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
            ].map((item, i) => (
              <details key={i} className="card group">
                <summary className="cursor-pointer font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                  {item.q}
                  <span className="text-[var(--color-text-muted)] group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 md:px-12 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="font-bold text-sm text-[var(--color-text-primary)]">JadaRiseLabs</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
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
