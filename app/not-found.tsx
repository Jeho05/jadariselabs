import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ButtonLink } from '@/components/ui/button';
import { IconArrowRight, IconGlobe, IconSearch, IconMail } from '@/components/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Link href="/" aria-label="Retour à l'accueil">
              <Image
                src="/logo-lion.png"
                alt="JadaRiseLabs"
                width={240}
                height={160}
                className="object-contain h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Illustration */}
          <div className="relative inline-flex items-center justify-center mb-8" aria-hidden="true">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] opacity-20 blur-2xl absolute" />
            <div className="relative w-24 h-24 rounded-3xl glass-dark border border-[var(--color-gold)]/30 shadow-lg flex items-center justify-center rotate-3">
              <span className="text-4xl font-bold text-gradient-animated" style={{ fontFamily: 'var(--font-heading)' }}>
                404
              </span>
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center">
              <IconSearch size={18} className="text-[#1A1206]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Oups ! Cette page s&apos;est perdue
          </h1>

          {/* Description */}
          <p className="text-[var(--color-text-secondary)] text-lg mb-10 leading-relaxed">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
            Pas de panique, l&apos;IA est là pour vous aider à retrouver votre chemin.
          </p>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <ButtonLink href="/" variant="primary" size="lg">
              <IconGlobe size={18} className="mr-2" />
              Retour à l&apos;accueil
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg">
              Nous contacter
              <IconArrowRight size={18} className="ml-2" />
            </ButtonLink>
          </div>

          {/* Suggested pages */}
          <div className="glass-dark rounded-2xl p-6 gold-border-hover">
            <h2 className="font-bold text-[var(--color-text-primary)] mb-4">
              Pages populaires
            </h2>
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-3" aria-label="Pages suggérées">
              {[
                { href: '/features', label: 'Fonctionnalités' },
                { href: '/pricing', label: 'Tarifs' },
                { href: '/blog', label: 'Blog' },
                { href: '/login', label: 'Connexion' },
                { href: '/signup', label: 'Inscription' },
                { href: '/legal/privacy', label: 'Confidentialité' },
              ].map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-[var(--color-gold-light)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:bg-[var(--color-gold)]/[0.08] transition-colors"
                >
                  {page.label}
                </Link>
              ))}
            </nav>
            <p className="text-sm text-[var(--color-text-muted)] mt-5 flex items-center justify-center gap-2">
              <IconMail size={14} />
              Un problème ? Écrivez-nous à{' '}
              <a href="mailto:contact@jadariselabs.com" className="text-[var(--color-gold-light)] underline underline-offset-2 hover:text-[var(--color-gold)]">
                contact@jadariselabs.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}