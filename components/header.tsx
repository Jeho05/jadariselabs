'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import {
    IconFlask,
    IconChart,
    IconPalette,
    ImageIcon,
    IconZap,
    IconUser,
    IconLogout,
    IconMenu,
    IconClose,
    IconChevronDown,
    IconInfinity,
    IconSparkle,
    IconCrown,
} from '@/components/icons';

/**
 * Premium Header/Navbar — Redesigned
 * - Glassmorphism with smooth scroll transition
 * - Responsive: clean mobile slide-down menu
 * - Profile dropdown with avatar, credits, plan badge
 * - Unauthenticated: Login/Signup CTA
 */
export default function Header() {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Handle scroll for progressive blur
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch auth state + profile
    useEffect(() => {
        const fetchSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (profileData) setProfile(profileData);
            } else {
                setIsAuthenticated(false);
                setProfile(null);
            }
        };
        fetchSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                fetchSession();
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setProfile(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        setLoggingOut(true);
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navLinks = [
        { href: '/dashboard', label: t('nav.dashboard'), icon: IconChart },
        { href: '/studio/image', label: t('nav.studio'), icon: IconPalette },
        { href: '/gallery', label: t('nav.gallery'), icon: ImageIcon },
    ];

    const isActive = (href: string) => {
        if (href === '/studio/image') return pathname.startsWith('/studio');
        return pathname === href || pathname.startsWith(href + '/');
    };

    // Avatar component to avoid repetition
    const Avatar = ({ size = 36, className = '' }: { size?: number; className?: string }) => (
        <div
            className={`relative rounded-full overflow-hidden flex-shrink-0 ${profile?.plan === 'pro' ? 'ring-2 ring-[var(--color-gold)] ring-offset-1 ring-offset-white' : ''} ${className}`}
            style={{ width: size, height: size }}
        >
            {profile?.avatar_url ? (
                <Image
                    src={profile.avatar_url}
                    alt=""
                    fill
                    sizes={`${size}px`}
                    className="object-cover"
                    unoptimized
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white font-bold"
                    style={{ fontSize: size * 0.4 }}>
                    {profile?.username?.[0]?.toUpperCase() || '?'}
                </div>
            )}
            {profile?.plan === 'pro' && size >= 36 && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-gold)] flex items-center justify-center border-2 border-white">
                    <IconCrown size={8} className="text-white" />
                </div>
            )}
        </div>
    );

    // Credits badge component
    const CreditsBadge = ({ compact = false }: { compact?: boolean }) => {
        if (!profile) return null;
        const isLow = profile.credits !== -1 && profile.credits < 5;
        return (
            <div className={`inline-flex items-center gap-1.5 font-medium transition-all
                ${compact ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'}
                ${isLow
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-[var(--color-gold)]/8 text-[var(--color-earth)] border border-[var(--color-gold)]/15'
                }
                rounded-full`}
            >
                <IconZap size={compact ? 12 : 14} className={isLow ? 'text-red-500' : 'text-[var(--color-gold)]'} />
                {profile.credits === -1 ? (
                    <IconInfinity size={compact ? 12 : 14} className="text-[var(--color-savanna)]" />
                ) : (
                    <span className="font-bold">{profile.credits}</span>
                )}
                {!compact && <span className="text-[var(--color-text-muted)]">{t('nav.credits')}</span>}
            </div>
        );
    };

    // Plan badge component
    const PlanBadge = () => {
        if (!profile) return null;
        const planConfig = {
            pro: { bg: 'bg-[var(--color-gold)]/10', text: 'text-[var(--color-gold)]', label: t('plan.pro') },
            starter: { bg: 'bg-[var(--color-savanna)]/10', text: 'text-[var(--color-savanna)]', label: t('plan.starter') },
            free: { bg: 'bg-gray-100', text: 'text-gray-500', label: t('plan.free') },
        };
        const config = planConfig[profile.plan as keyof typeof planConfig] || planConfig.free;
        return (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
                    scrolled
                        ? 'py-1 bg-white/75 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] border-b border-black/[0.04]'
                        : 'py-2 bg-white/40 backdrop-blur-md'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">

                        {/* ── Logo ── */}
                        <Link
                            href={isAuthenticated ? '/dashboard' : '/'}
                            className="flex items-center gap-2.5 group flex-shrink-0"
                        >
                            <div className="relative">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] shadow-md shadow-[var(--color-earth)]/15 group-hover:shadow-lg group-hover:shadow-[var(--color-gold)]/20 group-hover:scale-105`}>
                                    <IconFlask size={20} className="text-white" />
                                </div>
                            </div>
                            <span
                                className="hidden sm:inline font-bold text-lg tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-earth)] transition-colors"
                                style={{ fontFamily: 'var(--font-heading)' }}
                            >
                                {t('header.logo')}
                            </span>
                        </Link>

                        {/* ── Desktop Nav (center) — only authenticated ── */}
                        {isAuthenticated && (
                            <nav className="hidden lg:flex items-center gap-1 bg-black/[0.03] rounded-2xl p-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isActive(link.href)
                                                ? 'bg-white text-[var(--color-earth)] shadow-sm'
                                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/60'
                                            }`}
                                    >
                                        <link.icon size={16} />
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        )}

                        {/* ── Right section ── */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {isAuthenticated ? (
                                <>
                                    {/* Credits — visible from sm up */}
                                    <div className="hidden sm:block">
                                        <CreditsBadge />
                                    </div>

                                    {/* Profile dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                            className={`flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full transition-all duration-200 ${
                                                profileDropdownOpen
                                                    ? 'bg-[var(--color-earth)]/5 ring-2 ring-[var(--color-earth)]/10'
                                                    : 'hover:bg-black/[0.04]'
                                            }`}
                                            aria-expanded={profileDropdownOpen}
                                        >
                                            <Avatar size={34} />
                                            <IconChevronDown
                                                size={14}
                                                className={`hidden sm:block text-[var(--color-text-muted)] transition-transform duration-200 ${
                                                    profileDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        {/* Dropdown */}
                                        {profileDropdownOpen && (
                                            <div
                                                className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-black/[0.06] bg-white/95 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden"
                                                style={{ animation: 'fadeInDown 0.2s ease-out' }}
                                            >
                                                {/* Profile header */}
                                                <div className="px-4 py-4 bg-gradient-to-b from-[var(--color-cream)]/60 to-transparent">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar size={44} />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-[var(--color-text-primary)] truncate">
                                                                @{profile?.username || 'user'}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <PlanBadge />
                                                                <CreditsBadge compact />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Links */}
                                                <div className="px-2 py-1.5">
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)]/80 transition-all"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <IconChart size={16} />
                                                        {t('nav.dashboard')}
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/profile"
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)]/80 transition-all"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <IconUser size={16} />
                                                        {t('nav.profile')}
                                                    </Link>
                                                </div>

                                                {/* Logout */}
                                                <div className="px-2 pb-2 pt-1 border-t border-black/[0.04] mx-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        disabled={loggingOut}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all mt-1"
                                                    >
                                                        <IconLogout size={16} />
                                                        {loggingOut ? `${t('nav.logout')}...` : t('nav.logout')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile menu button */}
                                    <button
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="lg:hidden p-2 rounded-xl text-[var(--color-text-primary)] hover:bg-black/[0.04] transition-all"
                                        aria-label="Menu"
                                    >
                                        {mobileMenuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
                                    </button>
                                </>
                            ) : (
                                /* Not authenticated */
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Link
                                        href="/login"
                                        className="px-3 sm:px-4 py-2 rounded-xl font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-black/[0.03] transition-all"
                                    >
                                        {t('nav.login')}
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-earth-dark)] text-white shadow-md shadow-[var(--color-earth)]/20 hover:shadow-lg hover:shadow-[var(--color-earth)]/25 hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <span>{t('nav.signup')}</span>
                                        <IconSparkle size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile Menu Overlay ── */}
            {mobileMenuOpen && isAuthenticated && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />

                    {/* Menu Panel */}
                    <div
                        ref={mobileMenuRef}
                        className="fixed top-[56px] sm:top-[64px] left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-b border-black/[0.06] shadow-xl shadow-black/5 max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto"
                        style={{ animation: 'slideDown 0.25s ease-out' }}
                    >
                        <div className="max-w-lg mx-auto px-5 py-5">

                            {/* Profile card */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-cream)]/60 mb-4">
                                <Avatar size={48} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-[var(--color-text-primary)] truncate">
                                        @{profile?.username || 'user'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <PlanBadge />
                                        <CreditsBadge compact />
                                    </div>
                                </div>
                            </div>

                            {/* Nav links */}
                            <div className="space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                            isActive(link.href)
                                                ? 'text-[var(--color-earth)] bg-[var(--color-earth)]/[0.06]'
                                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)]/60'
                                        }`}
                                    >
                                        <link.icon size={20} />
                                        {link.label}
                                        {isActive(link.href) && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-earth)]" />
                                        )}
                                    </Link>
                                ))}
                                <Link
                                    href="/dashboard/profile"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive('/dashboard/profile')
                                            ? 'text-[var(--color-earth)] bg-[var(--color-earth)]/[0.06]'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)]/60'
                                    }`}
                                >
                                    <IconUser size={20} />
                                    {t('nav.profile')}
                                    {isActive('/dashboard/profile') && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-earth)]" />
                                    )}
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="mt-3 pt-3 border-t border-black/[0.06]">
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <IconLogout size={20} />
                                    {loggingOut ? `${t('nav.logout')}...` : t('nav.logout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* CSS animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
