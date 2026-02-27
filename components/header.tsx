'use client';

import { useState, useEffect, useRef } from 'react';
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
 * Premium Header/Navbar with African Identity
 * - Unauthenticated: shows Login/Signup buttons
 * - Authenticated: shows credits, avatar dropdown, logout
 * - Mobile: hamburger menu with glassmorphism
 * - Progressive blur on scroll
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

    // Handle scroll for progressive blur
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch auth state + profile
    useEffect(() => {
        const fetchSession = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setIsAuthenticated(true);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setProfile(profileData);
                }
            } else {
                setIsAuthenticated(false);
                setProfile(null);
            }
        };

        fetchSession();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
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

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-black/5'
                : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link
                        href={isAuthenticated ? '/dashboard' : '/'}
                        className="flex items-center gap-3 group"
                    >
                        <div className="relative">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${scrolled
                                    ? 'bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] shadow-lg'
                                    : 'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)]'
                                } group-hover:scale-105 group-hover:rotate-3`}>
                                <IconFlask size={24} className="text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-savanna)] animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span
                            className={`font-bold text-lg lg:text-xl transition-colors ${scrolled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-earth)]'
                                }`}
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            {t('header.logo')}
                        </span>
                    </Link>

                    {/* Desktop Nav — only visible when authenticated */}
                    {isAuthenticated && (
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive(link.href)
                                            ? 'text-[var(--color-earth)] bg-[var(--color-earth)]/5'
                                            : scrolled
                                                ? 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream-dark)]'
                                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-white/50'
                                        }`}
                                >
                                    <link.icon size={18} />
                                    {link.label}
                                    {isActive(link.href) && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-[var(--color-earth)] to-[var(--color-gold)]" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Credits badge */}
                                {profile && (
                                    <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${profile.credits !== -1 && profile.credits < 5
                                            ? 'bg-red-50 border border-red-200 text-red-600 animate-pulse'
                                            : scrolled
                                                ? 'bg-gradient-to-r from-[var(--color-gold)]/10 to-[var(--color-terracotta)]/10 border border-[var(--color-gold)]/20 text-[var(--color-earth)]'
                                                : 'bg-white/60 backdrop-blur-sm border border-white/20 text-[var(--color-earth)]'
                                        }`}>
                                        <div className="relative">
                                            <IconZap size={16} className={profile.credits !== -1 && profile.credits < 5 ? "text-red-500" : "text-[var(--color-gold)]"} />
                                            <div className="absolute inset-0 animate-ping opacity-30">
                                                <IconZap size={16} className={profile.credits !== -1 && profile.credits < 5 ? "text-red-500" : "text-[var(--color-gold)]"} />
                                            </div>
                                        </div>
                                        <span>
                                            {profile.credits === -1 ? (
                                                <IconInfinity size={16} className="text-[var(--color-savanna)]" />
                                            ) : (
                                                <span className="font-bold">{profile.credits}</span>
                                            )}{' '}
                                            {t('nav.credits')}
                                        </span>
                                    </div>
                                )}

                                {/* Profile dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${scrolled
                                                ? 'hover:bg-[var(--color-cream-dark)]'
                                                : 'hover:bg-white/50'
                                            }`}
                                        aria-expanded={profileDropdownOpen}
                                    >
                                        <div className={`relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden transition-all ${profile?.plan === 'pro'
                                                ? 'ring-2 ring-[var(--color-gold)] ring-offset-2 ring-offset-white'
                                                : ''
                                            }`}>
                                            {profile?.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={profile.avatar_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white font-bold text-sm">
                                                    {profile?.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            {profile?.plan === 'pro' && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-gold)] flex items-center justify-center border-2 border-white">
                                                    <IconCrown size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <IconChevronDown
                                            size={16}
                                            className={`text-[var(--color-text-muted)] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Dropdown menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-72 glass-card-premium rounded-2xl p-2 animate-fade-in-down">
                                            {/* Profile info */}
                                            <div className="px-4 py-3 border-b border-[var(--color-border)] mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl overflow-hidden ${profile?.plan === 'pro'
                                                            ? 'ring-2 ring-[var(--color-gold)]'
                                                            : ''
                                                        }`}>
                                                        {profile?.avatar_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white font-bold">
                                                                {profile?.username?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--color-text-primary)]">
                                                            @{profile?.username || 'user'}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${profile?.plan === 'pro'
                                                                    ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                                                                    : profile?.plan === 'starter'
                                                                        ? 'bg-[var(--color-savanna)]/10 text-[var(--color-savanna)]'
                                                                        : 'bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]'
                                                                }`}>
                                                                {profile?.plan === 'free' ? t('plan.free') : profile?.plan === 'starter' ? t('plan.starter') : t('plan.pro')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 text-sm text-[var(--color-text-secondary)]">
                                                    <IconZap size={14} className="text-[var(--color-gold)]" />
                                                    <span>{profile?.credits === -1 ? t('nav.unlimited') : `${profile?.credits} ${t('nav.credits')}`}</span>
                                                </div>
                                            </div>

                                            {/* Links */}
                                            <div className="space-y-1">
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream-dark)] transition-all"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <IconChart size={18} />
                                                    {t('nav.dashboard')}
                                                </Link>
                                                <Link
                                                    href="/dashboard/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream-dark)] transition-all"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <IconUser size={18} />
                                                    {t('nav.profile')}
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={loggingOut}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)]/10 transition-all"
                                                >
                                                    <IconLogout size={18} />
                                                    {loggingOut ? `${t('nav.logout')}...` : t('nav.logout')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className={`lg:hidden p-2 rounded-xl transition-all ${scrolled
                                            ? 'hover:bg-[var(--color-cream-dark)] text-[var(--color-text-primary)]'
                                            : 'hover:bg-white/50 text-[var(--color-earth)]'
                                        }`}
                                    aria-label="Menu"
                                >
                                    {mobileMenuOpen ? (
                                        <IconClose size={24} />
                                    ) : (
                                        <IconMenu size={24} />
                                    )}
                                </button>
                            </>
                        ) : (
                            /* Not authenticated — Login/Signup buttons */
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${scrolled
                                            ? 'text-[var(--color-earth)] hover:bg-[var(--color-cream-dark)]'
                                            : 'text-[var(--color-earth)] hover:bg-white/50'
                                        }`}
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href="/signup"
                                    className="btn-cta-premium !px-5 !py-2.5 !text-sm group"
                                >
                                    <span>{t('nav.signup')}</span>
                                    <IconSparkle size={14} className="ml-1.5 group-hover:animate-spin" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && isAuthenticated && (
                <div className="lg:hidden absolute top-full left-0 right-0 glass-card-premium !rounded-none !rounded-b-3xl border-t border-[var(--color-border)] animate-fade-in-down">
                    <div className="max-w-lg mx-auto p-6">
                        {/* Profile info mobile */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
                            <div className={`w-14 h-14 rounded-xl overflow-hidden ${profile?.plan === 'pro' ? 'ring-2 ring-[var(--color-gold)]' : ''
                                }`}>
                                {profile?.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white font-bold text-xl">
                                        {profile?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-lg text-[var(--color-text-primary)]">@{profile?.username || 'user'}</p>
                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                    {profile?.credits === -1 ? (
                                        <IconInfinity size={14} className="text-[var(--color-savanna)]" />
                                    ) : (
                                        <span className="font-semibold">{profile?.credits}</span>
                                    )}{' '}
                                    {t('nav.credits')} •{' '}
                                    <span className={`font-medium ${profile?.plan === 'pro' ? 'text-[var(--color-gold)]' : ''
                                        }`}>
                                        {profile?.plan === 'free' ? t('plan.free') : profile?.plan === 'starter' ? t('plan.starter') : t('plan.pro')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Nav links */}
                        <div className="space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(link.href)
                                            ? 'text-[var(--color-earth)] bg-[var(--color-earth)]/5'
                                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream-dark)]'
                                        }`}
                                >
                                    <link.icon size={20} />
                                    {link.label}
                                </Link>
                            ))}

                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-earth)] hover:bg-[var(--color-cream-dark)] font-medium transition-all"
                            >
                                <IconUser size={20} />
                                {t('nav.profile')}
                            </Link>
                        </div>

                        {/* Logout */}
                        <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)]/10 font-medium transition-all"
                            >
                                <IconLogout size={20} />
                                {loggingOut ? `${t('nav.logout')}...` : t('nav.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
