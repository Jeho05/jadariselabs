'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

/**
 * Dynamic Header/Navbar
 * - Unauthenticated: shows Login/Signup buttons
 * - Authenticated: shows credits, avatar dropdown, logout
 * - Mobile: hamburger menu
 */
export default function Header() {
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
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/studio/image', label: 'Studio IA', icon: '🎨' },
        { href: '/gallery', label: 'Galerie', icon: '🖼️' },
    ];

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
                        <span className="text-xl">🧪</span>
                        <span
                            className="font-bold text-earth text-lg group-hover:text-earth-light transition-colors hidden sm:block"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            JadaRiseLabs
                        </span>
                    </Link>

                    {/* Desktop Nav — only visible when authenticated */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                             ${isActive(link.href)
                                            ? 'bg-earth/10 text-earth'
                                            : 'text-text-secondary hover:bg-cream hover:text-text-primary'
                                        }`}
                                >
                                    <span className="mr-1.5">{link.icon}</span>
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
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 text-gold-dark text-sm font-medium">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                        </svg>
                                        <span>
                                            {profile.credits === -1 ? '∞' : profile.credits} crédits
                                        </span>
                                    </div>
                                )}

                                {/* Profile dropdown */}
                                <div className="relative hidden md:block" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-cream transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-earth/10 flex items-center justify-center text-sm font-semibold text-earth">
                                            {profile?.username?.[0]?.toUpperCase() || profile?.avatar_url ? (
                                                profile?.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    profile.username?.[0]?.toUpperCase()
                                                )
                                            ) : (
                                                '?'
                                            )}
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-border/50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* Profile info */}
                                            <div className="px-4 py-3 border-b border-border/50">
                                                <p className="font-semibold text-sm text-text-primary truncate">
                                                    @{profile?.username || 'utilisateur'}
                                                </p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    Plan {profile?.plan === 'free' ? 'Gratuit' : profile?.plan === 'starter' ? 'Starter' : 'Pro'}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gold-dark">
                                                    <span>⚡</span>
                                                    <span>{profile?.credits === -1 ? 'Illimité' : `${profile?.credits} crédits`}</span>
                                                </div>
                                            </div>

                                            {/* Links */}
                                            <div className="py-1">
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-cream hover:text-text-primary transition-colors"
                                                >
                                                    <span>📊</span> Dashboard
                                                </Link>
                                                <Link
                                                    href="/dashboard/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-cream hover:text-text-primary transition-colors"
                                                >
                                                    <span>👤</span> Mon profil
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-border/50 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={loggingOut}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-terracotta hover:bg-terracotta/5 w-full text-left transition-colors disabled:opacity-50"
                                                >
                                                    <span>🚪</span>
                                                    {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg hover:bg-cream transition-colors"
                                    aria-label="Menu"
                                >
                                    {mobileMenuOpen ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </>
                        ) : (
                            /* Not authenticated — Login/Signup buttons */
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                                    Connexion
                                </Link>
                                <Link href="/signup" className="btn-primary text-sm py-2 px-4">
                                    S&apos;inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && isAuthenticated && (
                <div className="md:hidden border-t border-border/50 bg-white">
                    <div className="px-4 py-4 space-y-1">
                        {/* Profile info mobile */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-cream rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-earth/10 flex items-center justify-center text-sm font-semibold text-earth">
                                {profile?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">@{profile?.username || 'utilisateur'}</p>
                                <p className="text-xs text-text-muted">
                                    {profile?.credits === -1 ? '∞' : profile?.credits} crédits •{' '}
                                    {profile?.plan === 'free' ? 'Gratuit' : profile?.plan === 'starter' ? 'Starter' : 'Pro'}
                                </p>
                            </div>
                        </div>

                        {/* Nav links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                           ${isActive(link.href)
                                        ? 'bg-earth/10 text-earth'
                                        : 'text-text-secondary hover:bg-cream'
                                    }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}

                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-cream"
                        >
                            <span className="text-lg">👤</span>
                            Mon profil
                        </Link>

                        {/* Logout */}
                        <div className="pt-2 border-t border-border/50 mt-2">
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-terracotta hover:bg-terracotta/5 w-full disabled:opacity-50"
                            >
                                <span className="text-lg">🚪</span>
                                {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
