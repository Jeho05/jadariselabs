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

    const passwordsMatch = password === confirmPassword;
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
        <div className="min-h-screen bg-cream flex flex-col">
            {/* Header minimal */}
            <div className="p-4 sm:p-6">
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

            {/* Form container */}
            <div className="flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-[420px]">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Créer un compte 🚀
                        </h1>
                        <p className="text-text-secondary">
                            Rejoignez JadaRiseLabs et accédez à l&apos;IA gratuitement
                        </p>
                    </div>

                    {/* Card */}
                    <div className="card p-6 sm:p-8">
                        {/* Error messages */}
                        <AuthError message={error} />
                        {error && <div className="h-4" />}

                        {/* Google OAuth */}
                        <OAuthButtons loading={loading} />

                        <AuthDivider />

                        {/* Signup Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-text-primary mb-1.5"
                                >
                                    Pseudo
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                        @
                                    </span>
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
                                        className={`w-full pl-9 pr-4 py-3 border-2 rounded-xl bg-white
                               text-text-primary placeholder:text-text-muted
                               focus:outline-none focus:ring-1 transition-all duration-200 min-h-[48px]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${username && !usernameValid
                                                ? 'border-terracotta focus:border-terracotta focus:ring-terracotta/20'
                                                : username && usernameValid
                                                    ? 'border-savanna focus:border-savanna focus:ring-savanna/20'
                                                    : 'border-border focus:border-earth focus:ring-earth/20'
                                            }`}
                                    />
                                </div>
                                {username && !usernameValid && (
                                    <p className="text-xs text-terracotta mt-1">
                                        Min. 3 caractères : lettres, chiffres, underscore uniquement
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-text-primary mb-1.5"
                                >
                                    Email
                                </label>
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
                                    className="w-full px-4 py-3 border-2 border-border rounded-xl bg-white
                             text-text-primary placeholder:text-text-muted
                             focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth/20
                             transition-all duration-200 min-h-[48px]
                             disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-text-primary mb-1.5"
                                >
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
                                />
                                <PasswordStrengthMeter password={password} />
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-text-primary mb-1.5"
                                >
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
                                />
                                {confirmPassword && !passwordsMatch && (
                                    <p className="text-xs text-terracotta mt-1">
                                        Les mots de passe ne correspondent pas
                                    </p>
                                )}
                            </div>

                            {/* Language */}
                            <div>
                                <label
                                    htmlFor="lang"
                                    className="block text-sm font-medium text-text-primary mb-1.5"
                                >
                                    Langue préférée
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferredLang('fr')}
                                        disabled={loading}
                                        className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-200
                               ${preferredLang === 'fr'
                                                ? 'border-earth bg-earth/5 text-earth'
                                                : 'border-border text-text-secondary hover:border-earth/30'
                                            } disabled:opacity-50`}
                                    >
                                        🇫🇷 Français
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreferredLang('en')}
                                        disabled={loading}
                                        className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-200
                               ${preferredLang === 'en'
                                                ? 'border-earth bg-earth/5 text-earth'
                                                : 'border-border text-text-secondary hover:border-earth/30'
                                            } disabled:opacity-50`}
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    disabled={loading}
                                    className="mt-1 w-4 h-4 rounded border-border text-earth focus:ring-earth/20
                             cursor-pointer disabled:opacity-50"
                                />
                                <label htmlFor="terms" className="text-xs text-text-secondary leading-relaxed cursor-pointer">
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
                                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:transform-none disabled:shadow-none"
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
                            <p className="text-center text-xs text-text-muted">
                                ✨ 50 crédits offerts • Aucune carte bancaire requise
                            </p>
                        </form>
                    </div>

                    {/* Login link */}
                    <p className="text-center mt-6 text-sm text-text-secondary">
                        Déjà un compte ?{' '}
                        <Link
                            href="/login"
                            className="text-earth font-semibold hover:text-earth-light transition-colors"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
