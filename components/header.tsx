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
} from '@/components/icons';

/**
 * Modern Header/Navbar with African Identity
 * - Unauthenticated: shows Login/Signup buttons
 * - Authenticated: shows credits, avatar dropdown, logout
 * - Mobile: hamburger menu with glassmorphism
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

    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <header className="header-modern">
            <div className="header-inner">
                {/* Logo */}
                <Link href={isAuthenticated ? '/dashboard' : '/'} className="header-logo">
                    <IconFlask className="header-logo-icon" size={28} />
                    <span className="header-logo-text" style={{ fontFamily: 'var(--font-heading)' }}>
                        {t('header.logo')}
                    </span>
                </Link>

                {/* Desktop Nav — only visible when authenticated */}
                {isAuthenticated && (
                    <nav className="header-nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`header-nav-link ${isActive(link.href) ? 'active' : ''}`}
                            >
                                <link.icon size={18} />
                                {link.label}
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
                                <div className="header-credits">
                                    <IconZap size={16} />
                                    <span>
                                        {profile.credits === -1 ? (
                                            <IconInfinity size={16} />
                                        ) : (
                                            profile.credits
                                        )}{' '}
                                        {t('nav.credits')}
                                    </span>
                                </div>
                            )}

                            {/* Profile dropdown */}
                            <div className="header-profile" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="header-profile-btn"
                                    aria-expanded={profileDropdownOpen}
                                >
                                    <div className="header-avatar">
                                        {profile?.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={profile.avatar_url}
                                                alt=""
                                            />
                                        ) : (
                                            profile?.username?.[0]?.toUpperCase() || '?'
                                        )}
                                    </div>
                                    <IconChevronDown className="header-dropdown-arrow" size={16} />
                                </button>

                                {/* Dropdown menu */}
                                {profileDropdownOpen && (
                                    <div className="header-dropdown">
                                        {/* Profile info */}
                                        <div className="header-dropdown-header">
                                            <p className="header-dropdown-username">
                                                @{profile?.username || 'user'}
                                            </p>
                                            <p className="header-dropdown-plan">
                                                {profile?.plan === 'free' ? t('plan.free') : profile?.plan === 'starter' ? t('plan.starter') : t('plan.pro')}
                                            </p>
                                            <div className="header-dropdown-credits">
                                                <IconZap size={14} />
                                                <span>{profile?.credits === -1 ? t('nav.unlimited') : `${profile?.credits} ${t('nav.credits')}`}</span>
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div>
                                            <Link
                                                href="/dashboard"
                                                className="header-dropdown-item"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <IconChart size={18} />
                                                {t('nav.dashboard')}
                                            </Link>
                                            <Link
                                                href="/dashboard/profile"
                                                className="header-dropdown-item"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <IconUser size={18} />
                                                {t('nav.profile')}
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="header-dropdown-divider" />
                                        <button
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                            className="header-dropdown-item logout"
                                        >
                                            <IconLogout size={18} />
                                            {loggingOut ? `${t('nav.logout')}...` : t('nav.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="header-mobile-btn"
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
                        <div className="header-auth-buttons">
                            <Link href="/login" className="btn-secondary">
                                {t('nav.login')}
                            </Link>
                            <Link href="/signup" className="btn-primary">
                                {t('nav.signup')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && isAuthenticated && (
                <div className="header-mobile-menu">
                    <div className="header-mobile-inner">
                        {/* Profile info mobile */}
                        <div className="header-mobile-profile">
                            <div className="header-mobile-avatar">
                                {profile?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="header-mobile-info">
                                <p className="header-mobile-username">@{profile?.username || 'user'}</p>
                                <p className="header-mobile-meta">
                                    {profile?.credits === -1 ? (
                                        <IconInfinity size={12} />
                                    ) : (
                                        profile?.credits
                                    )}{' '}
                                    {t('nav.credits')} •{' '}
                                    {profile?.plan === 'free' ? t('plan.free') : profile?.plan === 'starter' ? t('plan.starter') : t('plan.pro')}
                                </p>
                            </div>
                        </div>

                        {/* Nav links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`header-mobile-link ${isActive(link.href) ? 'active' : ''}`}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        ))}

                        <Link
                            href="/dashboard/profile"
                            className="header-mobile-link"
                        >
                            <IconUser size={20} />
                            {t('nav.profile')}
                        </Link>

                        {/* Logout */}
                        <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="header-mobile-link logout"
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
