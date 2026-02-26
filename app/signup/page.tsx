'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
    OAuthButtons,
    AuthDivider,
    PasswordInput,
    PasswordStrengthMeter,
    AuthError,
    Spinner,
    getAuthErrorMessage,
    usePasswordStrength,
} from '@/components/auth-form';
import type { SupportedLang } from '@/lib/types';
import { IconFlask, IconSparkle, IconRocket, IconGlobe, IconCheck, IconArrowRight, IconUser, IconMail, IconLock, IconShield } from '@/components/icons';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [preferredLang, setPreferredLang] = useState<SupportedLang>('fr');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const { isValid: passwordIsStrong } = usePasswordStrength(password);

    const passwordsMatch = password === confirmPassword && confirmPassword !== '';
    const usernameValid = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(email.trim());

    const canSubmit =
        emailValid &&
        passwordIsStrong &&
        passwordsMatch &&
        usernameValid &&
        acceptTerms &&
        !loading;

    // Progress steps
    const steps = [
        { id: 'account', label: 'Compte', icon: IconUser, completed: usernameValid && email.length > 0 },
        { id: 'security', label: 'Sécurité', icon: IconLock, completed: passwordIsStrong && passwordsMatch },
        { id: 'confirm', label: 'Confirmation', icon: IconShield, completed: acceptTerms },
    ];

    const currentStep = !usernameValid || !email ? 0 : !passwordIsStrong || !passwordsMatch ? 1 : 2;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!usernameValid) {
            setError('Le pseudo doit contenir au moins 3 caractères (lettres, chiffres, underscore).');
            return;
        }

        if (!passwordIsStrong) {
            setError('Le mot de passe ne respecte pas les critères de sécurité.');
            return;
        }

        if (!passwordsMatch) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (!acceptTerms) {
            setError('Vous devez accepter les conditions d\'utilisation.');
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        username: username.trim(),
                        preferred_lang: preferredLang,
                    },
                },
            });

            if (authError) {
                setError(getAuthErrorMessage(authError.message));
                setLoading(false);
                return;
            }

            // Success — redirect to verification page
            router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}`);
        } catch {
            setError('Une erreur réseau est survenue. Vérifiez votre connexion.');
            setLoading(false);
        }
    };

    const features = [
        { icon: IconSparkle, text: '50 crédits gratuits à l\'inscription', color: 'gold' },
        { icon: IconRocket, text: 'Accès immédiat à tous les modules', color: 'terracotta' },
        { icon: IconGlobe, text: 'Support en français et anglais', color: 'savanna' },
    ];

    const testimonials = [
        {
            text: 'JadaRiseLabs m\'a permis de créer des visuels professionnels en quelques minutes.',
            author: 'Amina K.',
            role: 'Marketeuse'
        },
        {
            text: 'Le chat IA m\'aide quotidiennement pour mes projets de développement.',
            author: 'Ousmane D.',
            role: 'Développeur'
        },
    ];

    return (
        <div className="split-screen-auth min-h-screen bg-[var(--color-cream)]">
            {/* Left Panel — Visual */}
            <div className="split-screen-visual relative overflow-hidden bg-gradient-to-br from-[var(--color-terracotta)] via-[var(--color-earth)] to-[var(--color-gold)]">
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
                    <div className="orb orb-gold w-72 h-72 -top-36 -left-36 opacity-40" />
                    <div className="orb orb-terracotta w-56 h-56 bottom-1/3 right-0 opacity-30" />
                </div>

                {/* Hero Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/african-tech.jpg"
                        alt="JadaRiseLabs - Créateurs Africains"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-terracotta)]/95 via-[var(--color-earth)]/80 to-[var(--color-gold)]/40" />
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
                            Rejoignez la<br />
                            <span className="text-[var(--color-gold)]">Révolution IA Africaine</span>
                        </h2>

                        <p className="text-white/80 text-lg mb-8 max-w-md">
                            Créez votre compte gratuit et accédez à des outils IA puissants 
                            conçus pour les créateurs africains.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-4 group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                    feature.color === 'gold' ? 'bg-[var(--color-gold)]/20' :
                                    feature.color === 'terracotta' ? 'bg-[var(--color-terracotta)]/20' :
                                    'bg-[var(--color-savanna)]/20'
                                }`}>
                                    <feature.icon size={22} className={
                                        feature.color === 'gold' ? 'text-[var(--color-gold)]' :
                                        feature.color === 'terracotta' ? 'text-[var(--color-terracotta)]' :
                                        'text-[var(--color-savanna)]'
                                    } />
                                </div>
                                <span className="text-white/90 font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonials */}
                    <div className="mt-12 pt-8 border-t border-white/10 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="glass-card-premium !rounded-xl !p-4 !bg-white/5">
                                <p className="text-white/80 text-sm italic mb-2">&ldquo;{testimonial.text}&rdquo;</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center text-white text-xs font-bold">
                                        {testimonial.author[0]}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{testimonial.author}</p>
                                        <p className="text-white/60 text-xs">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="orb orb-earth w-48 h-48 -bottom-24 -left-24 opacity-20" />
                    <div className="orb orb-gold w-32 h-32 top-1/3 right-0 opacity-15" />
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
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center gap-2 ${index <= currentStep ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        step.completed 
                                            ? 'bg-[var(--color-savanna)] text-white' 
                                            : index === currentStep
                                                ? 'bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] text-white'
                                                : 'bg-[var(--color-cream-dark)] text-[var(--color-text-muted)]'
                                    }`}>
                                        {step.completed ? <IconCheck size={18} /> : <step.icon size={18} />}
                                    </div>
                                    <span className={`text-sm font-medium hidden sm:block ${index === currentStep ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-0.5 mx-2 ${index < currentStep ? 'bg-[var(--color-savanna)]' : 'bg-[var(--color-border)]'} transition-colors`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-[var(--color-terracotta)]/10 border border-[var(--color-terracotta)]/20 rounded-full px-4 py-2 mb-4">
                            <IconRocket size={16} className="text-[var(--color-terracotta)]" />
                            <span className="text-[var(--color-terracotta-dark)] text-sm font-medium">
                                Inscription gratuite
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Créer un compte
                        </h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Rejoignez JadaRiseLabs et accédez à l&apos;IA gratuitement
                        </p>
                    </div>

                    {/* Card */}
                    <div className="glass-card-premium rounded-2xl p-6 lg:p-8">
                        {/* Error messages */}
                        <AuthError message={error} />
                        {error && <div className="h-4" />}

                        {/* Google OAuth */}
                        <OAuthButtons loading={loading} />

                        <AuthDivider />

                        {/* Signup Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div className="input-group">
                                <label htmlFor="username" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                    Pseudo
                                </label>
                                <div className="input-wrapper group">
                                    <svg className="input-icon w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-earth)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">@</span>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                                        placeholder="votre_pseudo"
                                        autoComplete="username"
                                        required
                                        minLength={3}
                                        maxLength={30}
                                        disabled={loading}
                                        className={`input-field pl-14 ${username && !usernameValid ? '!border-[var(--color-terracotta)]' : username && usernameValid ? '!border-[var(--color-savanna)]' : ''}`}
                                    />
                                </div>
                                {username && !usernameValid && (
                                    <p className="text-xs text-[var(--color-terracotta)] mt-1.5 flex items-center gap-1">
                                        <span>⚠</span> Min. 3 caractères : lettres, chiffres, underscore uniquement
                                    </p>
                                )}
                            </div>

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
                                        className={`input-field ${email && !emailValid ? '!border-[var(--color-terracotta)]' : email && emailValid ? '!border-[var(--color-savanna)]' : ''}`}
                                    />
                                </div>
                                {email && !emailValid && (
                                    <p className="text-xs text-[var(--color-terracotta)] mt-1.5 flex items-center gap-1">
                                        <span>⚠</span> Format d&apos;email invalide
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                    Mot de passe
                                </label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Créer un mot de passe fort"
                                    autoComplete="new-password"
                                    minLength={8}
                                    disabled={loading}
                                    isValid={password ? passwordIsStrong : null}
                                />
                                <PasswordStrengthMeter password={password} />
                            </div>

                            {/* Confirm password */}
                            <div className="input-group">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                    Confirmer le mot de passe
                                </label>
                                <PasswordInput
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Retapez votre mot de passe"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    isValid={confirmPassword ? passwordsMatch : null}
                                />
                                {confirmPassword && !passwordsMatch && (
                                    <p className="text-xs text-[var(--color-terracotta)] mt-1.5 flex items-center gap-1">
                                        <span>⚠</span> Les mots de passe ne correspondent pas
                                    </p>
                                )}
                            </div>

                            {/* Language */}
                            <div className="input-group">
                                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                                    Langue préférée
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferredLang('fr')}
                                        disabled={loading}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                            preferredLang === 'fr' 
                                                ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5 text-[var(--color-earth)]' 
                                                : 'border-[var(--color-border)] hover:border-[var(--color-earth)]/50 text-[var(--color-text-secondary)]'
                                        }`}
                                    >
                                        <span>🇫🇷</span>
                                        <span className="font-medium">Français</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreferredLang('en')}
                                        disabled={loading}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                            preferredLang === 'en' 
                                                ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5 text-[var(--color-earth)]' 
                                                : 'border-[var(--color-border)] hover:border-[var(--color-earth)]/50 text-[var(--color-text-secondary)]'
                                        }`}
                                    >
                                        <span>🇬🇧</span>
                                        <span className="font-medium">English</span>
                                    </button>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 mt-2">
                                <div className="relative mt-0.5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        disabled={loading}
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 rounded border-2 border-[var(--color-border)] peer-checked:bg-[var(--color-savanna)] peer-checked:border-[var(--color-savanna)] transition-all flex items-center justify-center cursor-pointer">
                                        {acceptTerms && <IconCheck size={14} className="text-white" />}
                                    </div>
                                </div>
                                <label htmlFor="terms" className="text-sm text-[var(--color-text-secondary)] cursor-pointer">
                                    J&apos;accepte les{' '}
                                    <Link
                                        href="/legal/terms"
                                        className="text-[var(--color-earth)] hover:text-[var(--color-gold)] transition-colors underline"
                                        target="_blank"
                                    >
                                        conditions d&apos;utilisation
                                    </Link>{' '}
                                    et la{' '}
                                    <Link
                                        href="/legal/privacy"
                                        className="text-[var(--color-earth)] hover:text-[var(--color-gold)] transition-colors underline"
                                        target="_blank"
                                    >
                                        politique de confidentialité
                                    </Link>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="btn-cta-premium w-full mt-4 group"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size={18} />
                                        <span>Création en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Créer mon compte gratuit</span>
                                        <IconArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* Free plan info */}
                            <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] mt-3">
                                <IconSparkle size={14} className="text-[var(--color-gold)]" />
                                <span>50 crédits offerts • Aucune carte bancaire requise</span>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-[var(--color-earth)] font-semibold hover:text-[var(--color-gold)] transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
