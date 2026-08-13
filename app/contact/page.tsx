'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import {
  IconMail,
  IconMapPin,
  IconHelpCircle,
  IconMessage,
  IconBriefcase,
  IconTag,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconInstagram,
  IconLinkedin,
  IconFacebook,
  IconTikTok,
} from '@/components/icons';

const CONTACT_CHANNELS = [
  {
    icon: IconMail,
    title: 'Support & questions',
    description: 'Une question sur un module, votre compte ou vos crédits ?',
    email: 'contact@jadariselabs.com',
    label: 'Écrire au support',
  },
  {
    icon: IconBriefcase,
    title: 'Partenariats & presse',
    description: 'Institutions, médias, écoles ou collaborations créatives.',
    email: 'contact@jadariselabs.com',
    label: 'Écrire aux partenariats',
  },
  {
    icon: IconTag,
    title: 'Facturation & paiement',
    description: 'Un souci Mobile Money ou carte ? Nous répondons en 24h.',
    email: 'contact@jadariselabs.com',
    label: 'Écrire à la facturation',
  },
];

const SOCIALS = [
  { icon: IconInstagram, label: 'Instagram', href: 'https://instagram.com/jadariselabs' },
  { icon: IconTikTok, label: 'TikTok', href: 'https://tiktok.com/@jadariselabs' },
  { icon: IconLinkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/jadariselabs' },
  { icon: IconFacebook, label: 'Facebook', href: 'https://facebook.com/jadariselabs' },
];

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'Question générale' },
  { value: 'support', label: 'Support technique' },
  { value: 'billing', label: 'Facturation / paiement' },
  { value: 'partnership', label: 'Partenariat / presse' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.error || 'Une erreur est survenue. Réessayez.');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: 'general', message: '' });
    } catch {
      setStatus('error');
      setErrorMessage('Erreur réseau. Réessayez dans un instant.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-cream)]">
      <SiteHeader />

      <main className="flex-1 pt-28 md:pt-32">
        {/* Hero */}
        <section className="relative z-10 px-6 md:px-12 lg:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge tone="gold">On vous répond en 24h</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Parlons de votre <span className="text-gradient-animated">prochain projet</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Une question, une idée, un retour ? Notre équipe est à votre écoute —
              et on adore recevoir vos créations réalisées avec JadaRiseLabs.
            </p>
          </div>
        </section>

        {/* Form + channels */}
        <section className="relative z-10 px-6 py-14 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 gradient-border-card">
              <div className="bg-white rounded-[calc(1.25rem-2px)] p-8 md:p-10 h-full">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  Envoyez-nous un message
                </h2>

                {status === 'success' ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <IconCheck size={28} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Message bien reçu !</h3>
                    <p className="text-sm text-green-600">
                      Merci pour votre message. Nous vous répondrons sous 24h ouvrées
                      à l&apos;adresse indiquée.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold mb-1.5 text-[var(--color-text-primary)]">
                          Votre nom
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Ex : Awa Diop"
                          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-[var(--color-text-primary)]">
                          Votre email
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="vous@exemple.com"
                          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold mb-1.5 text-[var(--color-text-primary)]">
                        Sujet
                      </label>
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all"
                      >
                        {SUBJECT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold mb-1.5 text-[var(--color-text-primary)]">
                        Votre message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Dites-nous tout (10 caractères minimum)…"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all resize-y"
                      />
                    </div>

                    {status === 'error' && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                        <IconAlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full py-3.5 rounded-xl font-semibold bg-[var(--color-earth)] text-white hover:bg-[var(--color-earth-dark)] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === 'sending' ? (
                        <>
                          <IconLoader2 size={18} className="animate-spin" />
                          Envoi en cours…
                        </>
                      ) : (
                        <>
                          <IconMessage size={18} />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Channels */}
            <div className="lg:col-span-2 space-y-4">
              {CONTACT_CHANNELS.map((channel) => (
                <div key={channel.title} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-cream-dark)] flex items-center justify-center flex-shrink-0">
                      <channel.icon size={22} className="text-[var(--color-earth)]" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{channel.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-2">{channel.description}</p>
                      <a
                        href={`mailto:${channel.email}?subject=${encodeURIComponent(channel.title)}`}
                        className="text-sm font-semibold text-[var(--color-earth)] hover:text-[var(--color-earth-dark)] underline underline-offset-2"
                      >
                        {channel.label}
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
                <h3 className="font-bold mb-4">Suivez-nous</h3>
                <div className="grid grid-cols-2 gap-3">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-cream-dark)]/50 hover:bg-[var(--color-cream-dark)] transition-colors font-semibold text-sm"
                    >
                      <social.icon size={18} className="text-[var(--color-earth)]" />
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-cream-dark)] flex items-center justify-center flex-shrink-0">
                    <IconMapPin size={22} className="text-[var(--color-earth)]" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Basés en Afrique de l&apos;Ouest</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Présents au Sénégal, en Côte d&apos;Ivoire et au Burkina Faso,
                      au service de toute la francophonie africaine.
                    </p>
                  </div>
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