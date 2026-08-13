import Image from 'next/image';
import Link from 'next/link';
import { IconHeart, IconInstagram, IconLinkedin, IconFacebook, IconTikTok, IconMail } from '@/components/icons';

const SOCIALS = [
    { href: 'https://www.instagram.com/jadariselabs', label: 'Instagram', icon: IconInstagram },
    { href: 'https://www.linkedin.com/company/jadariselabs', label: 'LinkedIn', icon: IconLinkedin },
    { href: 'https://www.facebook.com/jadariselabs', label: 'Facebook', icon: IconFacebook },
    { href: 'https://www.tiktok.com/@jadariselabs', label: 'TikTok', icon: IconTikTok },
];

export function SiteFooter() {
    return (
        <footer className="relative z-10 border-t border-[var(--color-border)] bg-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">
                    {/* Brand */}
                    <div className="sm:col-span-2">
                        <Link href="/" className="inline-flex items-center mb-5" aria-label="JadaRiseLabs — Accueil">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-12 w-auto grayscale mix-blend-multiply opacity-80" />
                        </Link>
                        <p className="text-[var(--color-text-secondary)] max-w-sm mb-6 leading-relaxed">
                            Le premier laboratoire d&apos;intelligence artificielle complet pensé pour les créateurs et développeurs en Afrique de l&apos;Ouest.
                        </p>
                        <div className="flex items-center gap-2">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-white hover:bg-[var(--color-earth)] hover:border-[var(--color-earth)] transition-all duration-200"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Produit */}
                    <div>
                        <h4 className="font-bold text-[var(--color-text-primary)] mb-5 uppercase tracking-wider text-sm">Produit</h4>
                        <ul className="space-y-3.5">
                            <li><Link href="/features" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Modules IA</Link></li>
                            <li><Link href="/pricing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Tarifs</Link></li>
                            <li><Link href="/blog" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Blog</Link></li>
                            <li><Link href="/about" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">À propos</Link></li>
                        </ul>
                    </div>

                    {/* Légal & Contact */}
                    <div>
                        <h4 className="font-bold text-[var(--color-text-primary)] mb-5 uppercase tracking-wider text-sm">Légal & Aide</h4>
                        <ul className="space-y-3.5">
                            <li><Link href="/legal/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">CGU</Link></li>
                            <li><Link href="/legal/privacy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Confidentialité</Link></li>
                            <li><Link href="/legal/privacy#cookies" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Cookies</Link></li>
                            <li>
                                <a href="mailto:contact@jadariselabs.com" className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">
                                    <IconMail size={14} />
                                    contact@jadariselabs.com
                                </a>
                            </li>
                            <li><Link href="/contact" className="text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] transition-colors">Nous contacter</Link></li>
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
    );
}