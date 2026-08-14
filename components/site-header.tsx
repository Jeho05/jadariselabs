'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconMenu, IconClose, IconArrowRight } from '@/components/icons';

const NAV_LINKS = [
    { href: '/features', label: 'Modules' },
    { href: '/pricing', label: 'Tarifs' },
    { href: '/about', label: 'À propos' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled || menuOpen
                        ? 'glass-dark !rounded-none border-b border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                        : 'bg-transparent border-b border-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group flex-shrink-0" aria-label="JadaRiseLabs — Accueil">
                            <Image
                                src="/logo-lion.png"
                                alt="JadaRiseLabs"
                                width={240}
                                height={160}
                                className="object-contain h-12 sm:h-14 w-auto drop-shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                                priority
                            />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive(link.href)
                                            ? 'text-[var(--color-gold-light)] bg-[var(--color-gold)]/[0.12] border border-[var(--color-gold)]/20'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.06]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex px-4 py-2 rounded-xl font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.06] transition-all"
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/signup"
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] shadow-lg shadow-[var(--color-gold)]/25 hover:shadow-[var(--color-gold)]/45 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Commencer gratuitement
                                <IconArrowRight size={14} />
                            </Link>

                            {/* Mobile toggle */}
                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-gold)]/[0.08] transition-all"
                                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                                aria-expanded={menuOpen}
                            >
                                {menuOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            {menuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setMenuOpen(false)}
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />
                    <div
                        className="fixed top-16 sm:top-20 left-0 right-0 z-50 md:hidden bg-[#14100C]/95 backdrop-blur-xl border-b border-[var(--color-border)] shadow-2xl shadow-black/50 max-h-[calc(100vh-4rem)] overflow-y-auto"
                        style={{ animation: 'slideDown 0.25s ease-out' }}
                    >
                        <div className="px-5 py-6 space-y-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                        isActive(link.href)
                                            ? 'text-[var(--color-gold-light)] bg-[var(--color-gold)]/[0.12]'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.06]'
                                    }`}
                                >
                                    {link.label}
                                    <IconArrowRight size={16} className="opacity-40" />
                                </Link>
                            ))}
                            <div className="pt-4 mt-2 border-t border-[var(--color-border)] space-y-2">
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm border border-[var(--color-gold)]/35 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.1] transition-all"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/signup"
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] shadow-lg shadow-[var(--color-gold)]/25 transition-all"
                                >
                                    Commencer gratuitement
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}