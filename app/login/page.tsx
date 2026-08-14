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
import { IconPalette, IconChat, IconVideo, IconSparkle, IconArrowRight, IconCheck } from '@/components/icons';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for callback errors / messages
    const callbackError = searchParams.get('error');
    const callbackMessage = searchParams.get('message');

    const successMessages: Record<string, string> = {
        'email-confirmed': 'Votre email est confirmé. Connectez-vous pour commencer !',
        'password-reset': 'Mot de passe réinitialisé avec succès. Connectez-vous !',
    };

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
        <div className="split-screen-auth min-h-screen bg-[var(--color-background)]">
            {/* Left Panel — Visual */}
            <div className="split-screen-visual relative overflow-hidden bg-[var(--color-surface)]">
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
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-[var(--color-earth)]/40 backdrop-blur-sm" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 justify-center">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center mb-12 group">
                        <div className="relative transition-transform group-hover:scale-[1.02]">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-20 sm:h-28 w-auto drop-shadow-lg" />
                        </div>
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

                    {/* Social Proof */}
                    <div className="mt-12 pt-8 border-t border-white/10 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        {/* New feature */}
                        <div className="flex items-center gap-3 text-white/70 text-sm">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs font-bold">
                                <IconSparkle size={11} />
                                Nouveau
                            </span>
                            <span>Clonage vocal en 17+ langues africaines</span>
                        </div>

                        {/* Testimonial */}
                        <div className="glass-card-premium !rounded-xl !p-4 !bg-[var(--color-surface-2)]/70 !border-[var(--color-gold)]/20">
                            <p className="text-white/80 text-sm italic mb-2">
                                &ldquo;Je crée les visuels de mes clients en quelques minutes. Un vrai game changer pour mon activité.&rdquo;
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-earth-dark)] flex items-center justify-center text-white text-xs font-bold">
                                    A
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">Amadou D.</p>
                                    <p className="text-white/60 text-xs">Designer freelance · Dakar</p>
                                </div>
                            </div>
                        </div>

                        {/* Blog link */}
                        <a href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)] hover:text-white transition-colors">
                            Lire notre guide « L&apos;IA pour les créateurs africains »
                            <IconArrowRight size={14} />
                        </a>
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
                    <Link href="/" className="inline-flex items-center group">
                        <div className="relative transition-transform group-hover:scale-[1.02]">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={200} height={133} className="object-contain h-16 w-auto drop-shadow-sm" />
                        </div>
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-[var(--color-savanna)]/10 border border-[var(--color-savanna)]/20 rounded-full px-4 py-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)] animate-pulse" />
                            <span className="text-[var(--color-savanna-light)] text-sm font-medium">
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
                        {/* Success notice */}
                        {callbackMessage && successMessages[callbackMessage] && (
                            <div
                                role="status"
                                className="flex items-center gap-3 rounded-xl border border-[var(--color-savanna)]/25 bg-[var(--color-savanna)]/10 px-4 py-3 mb-4"
                                style={{ animation: 'slideDown 0.3s ease-out' }}
                            >
                                <IconCheck size={18} className="text-[var(--color-savanna)] flex-shrink-0" />
                                <p className="text-sm text-[var(--color-savanna-light)] font-medium">
                                    {successMessages[callbackMessage]}
                                </p>
                            </div>
                        )}

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
                                    <svg className="input-icon w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-gold-light)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className="text-xs text-[var(--color-gold-light)] hover:text-[var(--color-gold)] transition-colors font-medium"
                                        onClick={() => router.push('/auth/forgot-password')}
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
                            <Link href="/signup" className="text-[var(--color-gold-light)] font-semibold hover:text-[var(--color-gold)] transition-colors">
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
                <div className="split-screen-auth min-h-screen bg-[var(--color-background)]">
                    <div className="split-screen-visual" />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="glass-card-premium rounded-2xl p-8 w-full max-w-md">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-[var(--color-surface-2)] rounded-lg w-3/4 mx-auto" />
                                <div className="h-12 bg-[var(--color-surface-2)] rounded-xl" />
                                <div className="h-12 bg-[var(--color-surface-2)] rounded-xl" />
                                <div className="h-12 bg-[var(--color-surface-2)] rounded-xl" />
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
