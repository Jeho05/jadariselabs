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
                        ? 'bg-white/85 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] border-b border-black/[0.04]'
                        : 'bg-white/40 backdrop-blur-md'
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
                                className="object-contain h-12 sm:h-14 w-auto drop-shadow-sm"
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
                                            ? 'text-[var(--color-earth)] bg-[var(--color-earth)]/[0.06]'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-black/[0.03]'
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
                                className="hidden sm:inline-flex px-4 py-2 rounded-xl font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-black/[0.03] transition-all"
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/signup"
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-earth-dark)] text-white shadow-md shadow-[var(--color-earth)]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Commencer gratuitement
                                <IconArrowRight size={14} />
                            </Link>

                            {/* Mobile toggle */}
                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 rounded-xl text-[var(--color-text-primary)] hover:bg-black/[0.04] transition-all"
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
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                        onClick={() => setMenuOpen(false)}
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />
                    <div
                        className="fixed top-16 sm:top-20 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-b border-black/[0.06] shadow-xl shadow-black/5 max-h-[calc(100vh-4rem)] overflow-y-auto"
                        style={{ animation: 'slideDown 0.25s ease-out' }}
                    >
                        <div className="px-5 py-6 space-y-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                        isActive(link.href)
                                            ? 'text-[var(--color-earth)] bg-[var(--color-earth)]/[0.06]'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)]/60'
                                    }`}
                                >
                                    {link.label}
                                    <IconArrowRight size={16} className="opacity-40" />
                                </Link>
                            ))}
                            <div className="pt-4 mt-2 border-t border-black/[0.06] space-y-2">
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm border-2 border-[var(--color-earth)] text-[var(--color-earth)] hover:bg-[var(--color-earth)] hover:text-white transition-all"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/signup"
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-earth-dark)] text-white shadow-md transition-all"
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