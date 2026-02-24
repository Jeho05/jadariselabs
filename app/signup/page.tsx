'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

    const canSubmit =
        email &&
        passwordIsStrong &&
        passwordsMatch &&
        usernameValid &&
        acceptTerms &&
        !loading;

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

    return (
        <div className="auth-container">
            {/* Left Panel — Visual */}
            <div className="auth-visual">
                {/* African Pattern Background */}
                <div className="african-pattern" />
                
                {/* Floating shapes */}
                <div className="auth-shapes">
                    <div className="auth-shape" />
                    <div className="auth-shape" />
                    <div className="auth-shape" />
                    <div className="auth-shape" />
                </div>

                {/* Content */}
                <div className="auth-visual-content">
                    {/* Logo */}
                    <div className="auth-visual-logo">
                        <div className="auth-visual-logo-icon">🧪</div>
                        <span style={{ fontFamily: 'var(--font-heading)' }}>JadaRiseLabs</span>
                    </div>

                    {/* Title */}
                    <h2 className="auth-visual-title">
                        Rejoignez la<br />
                        Révolution IA Africaine
                    </h2>

                    <p className="auth-visual-subtitle">
                        Créez votre compte gratuit et accédez à des outils IA puissants 
                        conçus pour les créateurs africains.
                    </p>

                    {/* Features */}
                    <div className="auth-visual-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">✨</div>
                            <span className="auth-feature-text">50 crédits gratuits à l&apos;inscription</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🚀</div>
                            <span className="auth-feature-text">Accès immédiat à tous les modules</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🌍</div>
                            <span className="auth-feature-text">Support en français et anglais</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="auth-form-panel">
                {/* Mobile Header */}
                <div className="auth-form-header lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <span className="text-2xl">🧪</span>
                        <span
                            className="font-bold text-earth text-lg group-hover:text-earth-light transition-colors"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            JadaRiseLabs
                        </span>
                    </Link>
                </div>

                {/* Form Container */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        {/* Title */}
                        <div className="auth-title">
                            <h1 style={{ fontFamily: 'var(--font-heading)' }}>
                                Créer un compte 🚀
                            </h1>
                            <p>Rejoignez JadaRiseLabs et accédez à l&apos;IA gratuitement</p>
                        </div>

                        {/* Card */}
                        <div className="glass-card stagger-children">
                            {/* Error messages */}
                            <AuthError message={error} />
                            {error && <div className="h-4" />}

                            {/* Google OAuth */}
                            <OAuthButtons loading={loading} />

                            <AuthDivider />

                            {/* Signup Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Username */}
                                <div className="input-group">
                                    <label htmlFor="username">Pseudo</label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-text-muted text-sm">@</span>
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
                                            className={`input-field pl-14 ${username && !usernameValid ? 'invalid' : username && usernameValid ? 'valid' : ''}`}
                                        />
                                    </div>
                                    {username && !usernameValid && (
                                        <p className="text-xs text-terracotta mt-1">
                                            Min. 3 caractères : lettres, chiffres, underscore uniquement
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="input-group">
                                    <label htmlFor="email">Email</label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <label htmlFor="password">Mot de passe</label>
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
                                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
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
                                        <p className="text-xs text-terracotta mt-1">
                                            Les mots de passe ne correspondent pas
                                        </p>
                                    )}
                                </div>

                                {/* Language */}
                                <div className="input-group">
                                    <label>Langue préférée</label>
                                    <div className="lang-selector">
                                        <button
                                            type="button"
                                            onClick={() => setPreferredLang('fr')}
                                            disabled={loading}
                                            className={`lang-btn ${preferredLang === 'fr' ? 'active' : ''}`}
                                        >
                                            🇫🇷 Français
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreferredLang('en')}
                                            disabled={loading}
                                            className={`lang-btn ${preferredLang === 'en' ? 'active' : ''}`}
                                        >
                                            🇬🇧 English
                                        </button>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="checkbox-wrapper mt-2">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label htmlFor="terms">
                                        J&apos;accepte les{' '}
                                        <Link
                                            href="/legal/terms"
                                            className="text-earth underline hover:text-earth-light"
                                            target="_blank"
                                        >
                                            conditions d&apos;utilisation
                                        </Link>{' '}
                                        et la{' '}
                                        <Link
                                            href="/legal/privacy"
                                            className="text-earth underline hover:text-earth-light"
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
                                    className="btn-auth mt-4"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size={18} />
                                            Création en cours...
                                        </>
                                    ) : (
                                        'Créer mon compte gratuit'
                                    )}
                                </button>

                                {/* Free plan info */}
                                <p className="text-center text-xs text-text-muted mt-3">
                                    ✨ 50 crédits offerts • Aucune carte bancaire requise
                                </p>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="auth-footer">
                            Déjà un compte ?{' '}
                            <Link href="/login">Se connecter</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
