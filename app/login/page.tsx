'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
    OAuthButtons,
    AuthDivider,
    PasswordInput,
    AuthError,
    Spinner,
    getAuthErrorMessage,
} from '@/components/auth-form';
import { IconFlask, IconPalette, IconChat, IconVideo, IconSparkle, IconArrowRight, IconCheck } from '@/components/icons';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for callback errors
    const callbackError = searchParams.get('error');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (authError) {
                setError(getAuthErrorMessage(authError.message));
                setLoading(false);
                return;
            }

            // Success — redirect to dashboard
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('Une erreur réseau est survenue. Vérifiez votre connexion.');
            setLoading(false);
        }
    };

    const features = [
        { icon: IconPalette, text: 'Génération d\'images IA', color: 'terracotta' },
        { icon: IconChat, text: 'Assistant conversationnel', color: 'savanna' },
        { icon: IconVideo, text: 'Création de vidéos', color: 'gold' },
    ];

    return (
        <div className="split-screen-auth min-h-screen bg-[var(--color-cream)]">
            {/* Left Panel — Visual */}
            <div className="split-screen-visual relative overflow-hidden bg-[var(--color-earth)]">
                {/* Animated Pattern Background */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ 
                        backgroundImage: 'url(/pattern-african.svg)', 
                        backgroundRepeat: 'repeat',
                        animation: 'parallax-float 20s linear infinite'
                    }}
                />
                
                {/* Premium Floating Orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="orb orb-gold w-64 h-64 -top-32 -right-32 opacity-30" />
                    <div className="orb orb-terracotta w-48 h-48 bottom-1/4 -left-24 opacity-20" />
                </div>

                {/* Hero Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/hero-ai-tech.jpg"
                        alt="JadaRiseLabs - Intelligence Artificielle"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-earth)]/95 via-[var(--color-earth)]/80 to-[var(--color-gold)]/40" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 justify-center">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <IconFlask size={26} className="text-white" />
                        </div>
                        <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                            JadaRiseLabs
                        </span>
                    </Link>

                    {/* Title */}
                    <div className="animate-fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            L&apos;Intelligence Artificielle<br />
                            <span className="text-[var(--color-gold)]">au service de l&apos;Afrique</span>
                        </h2>

                        <p className="text-white/80 text-lg mb-8 max-w-md">
                            Générez des images, des vidéos et des conversations IA. 
                            Rejoignez des milliers de créateurs africains.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-4 group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                    feature.color === 'terracotta' ? 'bg-[var(--color-terracotta)]/20' :
                                    feature.color === 'savanna' ? 'bg-[var(--color-savanna)]/20' :
                                    'bg-[var(--color-gold)]/20'
                                }`}>
                                    <feature.icon size={22} className={
                                        feature.color === 'terracotta' ? 'text-[var(--color-terracotta)]' :
                                        feature.color === 'savanna' ? 'text-[var(--color-savanna)]' :
                                        'text-[var(--color-gold)]'
                                    } />
                                </div>
                                <span className="text-white/90 font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-3 text-white/60 text-sm">
                            <IconCheck size={16} className="text-[var(--color-savanna)]" />
                            <span>50 crédits gratuits à l&apos;inscription</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="orb orb-savanna w-48 h-48 -bottom-24 -right-24 opacity-20" />
                    <div className="orb orb-gold w-32 h-32 top-1/4 left-0 opacity-15" />
                </div>

                {/* Mobile Header */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <IconFlask size={20} className="text-white" />
                        </div>
                        <span
                            className="font-bold text-[var(--color-earth)] text-lg group-hover:text-[var(--color-gold)] transition-colors"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            JadaRiseLabs
                        </span>
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-[var(--color-savanna)]/10 border border-[var(--color-savanna)]/20 rounded-full px-4 py-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)] animate-pulse" />
                            <span className="text-[var(--color-savanna-dark)] text-sm font-medium">
                                Connexion sécurisée
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Bon retour ! <IconSparkle size={28} className="inline text-[var(--color-gold)]" />
                        </h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Connectez-vous pour accéder à votre espace IA
                        </p>
                    </div>

                    {/* Card */}
                    <div className="glass-card-premium rounded-2xl p-6 lg:p-8">
                        {/* Error messages */}
                        <AuthError
                            message={
                                error ||
                                (callbackError ? getAuthErrorMessage(callbackError) : null)
                            }
                        />

                        {error || callbackError ? <div className="h-4" /> : null}

                        {/* Google OAuth */}
                        <OAuthButtons loading={loading} />

                        <AuthDivider />

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="input-group">
                                <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                    Email
                                </label>
                                <div className="input-wrapper group">
                                    <svg className="input-icon w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-earth)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="vous@example.com"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Mot de passe
                                    </label>
                                    <button
                                        type="button"
                                        className="text-xs text-[var(--color-earth)] hover:text-[var(--color-gold)] transition-colors font-medium"
                                        onClick={() => {
                                            // TODO: Password reset functionality
                                            alert('Fonctionnalité à venir');
                                        }}
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Votre mot de passe"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className="btn-cta-premium w-full mt-2 group"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size={18} />
                                        <span>Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <IconArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            Pas encore de compte ?{' '}
                            <Link href="/signup" className="text-[var(--color-earth)] font-semibold hover:text-[var(--color-gold)] transition-colors">
                                Créer un compte gratuitement
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="split-screen-auth min-h-screen bg-[var(--color-cream)]">
                    <div className="split-screen-visual" />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="glass-card-premium rounded-2xl p-8 w-full max-w-md">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-[var(--color-cream-dark)] rounded-lg w-3/4 mx-auto" />
                                <div className="h-12 bg-[var(--color-cream-dark)] rounded-xl" />
                                <div className="h-12 bg-[var(--color-cream-dark)] rounded-xl" />
                                <div className="h-12 bg-[var(--color-cream-dark)] rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
