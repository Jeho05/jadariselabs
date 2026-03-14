'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconMusic,
    IconZap,
    IconDownload,
    IconRefresh,
    IconLoader2,
    IconAlertCircle,
    IconSparkles,
} from '@/components/icons';
import Link from 'next/link';

type BarkVoice = 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'zh';

const VOICES: { id: BarkVoice; name: string; flag: string }[] = [
    { id: 'fr', name: 'Français', flag: '🇫🇷' },
    { id: 'en', name: 'Anglais', flag: '🇬🇧' },
    { id: 'de', name: 'Allemand', flag: '🇩🇪' },
    { id: 'es', name: 'Espagnol', flag: '🇪🇸' },
    { id: 'it', name: 'Italien', flag: '🇮🇹' },
    { id: 'pt', name: 'Portugais', flag: '🇵🇹' },
    { id: 'zh', name: 'Chinois', flag: '🇨🇳' },
];

const EXAMPLE_TEXTS = [
    'Bienvenue sur JadaRiseLabs, votre laboratoire IA créatif.',
    'L\'intelligence artificielle transforme nos idées en réalité.',
    'Découvrez la puissance de la synthèse vocale avec Bark.',
];

export default function AudioStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [text, setText] = useState('');
    const [voice, setVoice] = useState<BarkVoice>('fr');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [creditsUsed, setCreditsUsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        setLoading(true);
        fetchProfile();
    }, [supabase]);

    // Handle generate
    const handleGenerate = async () => {
        if (!text.trim() || generating) return;

        setGenerating(true);
        setError(null);
        setResultUrl(null);

        try {
            const res = await fetch('/api/generate/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text.trim(),
                    voice,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }

            setResultUrl(data.audio_url);
            setDuration(data.duration);
            setCreditsUsed(data.credits_charged);

            // Update credits locally
            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: data.remaining_credits });
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setGenerating(false);
        }
    };

    // Handle download
    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `jadarise-audio-${Date.now()}.wav`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Estimate credits
    const estimatedCredits = 2 + Math.floor(text.length / 200);

    if (loading) {
        return (
            <div className="audio-studio">
                <div className="audio-studio-loading">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="audio-studio">
            {/* Background */}
            <div className="audio-studio-bg">
                <div className="audio-studio-bg-orb orb-1" />
                <div className="audio-studio-bg-orb orb-2" />
            </div>

            <div className="audio-studio-content">
                {/* Header */}
                <div className="audio-studio-header">
                    <div className="audio-studio-header-left">
                        <div className="module-icon-premium gold">
                            <IconMusic size={28} />
                        </div>
                        <div>
                            <h1>Studio Audio</h1>
                            <p>Synthèse vocale IA avec Bark</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="audio-studio-credits">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="audio-studio-grid">
                    {/* Left — Controls */}
                    <div className="audio-studio-controls">
                        {/* Text Input */}
                        <div className="audio-studio-section">
                            <label className="audio-studio-label">
                                <IconSparkles size={16} />
                                Texte à convertir
                            </label>
                            <textarea
                                className="audio-studio-textarea"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Entrez le texte à convertir en voix..."
                                rows={5}
                                maxLength={500}
                                disabled={generating}
                            />
                            <div className="audio-studio-char-count">
                                {text.length}/500 caractères
                            </div>
                        </div>

                        {/* Example texts */} {!text && !resultUrl && (
                            <div className="audio-studio-examples">
                                <p className="audio-studio-examples-label">Exemples :</p>
                                {EXAMPLE_TEXTS.map((ex, i) => (
                                    <button
                                        key={i}
                                        className="audio-studio-example-btn"
                                        onClick={() => setText(ex)}
                                    >
                                        {ex.substring(0, 40)}...
                                    </button>
                                ))}
                            </div>
                        )} {/* Voice Selection */}
                        <div className="audio-studio-section">
                            <label className="audio-studio-label">Voix / Langue</label>
                            <div className="audio-studio-voice-grid">
                                {VOICES.map((v) => (
                                    <button
                                        key={v.id}
                                        className={`audio-studio-voice-btn ${voice === v.id ? 'active' : ''}`}
                                        onClick={() => setVoice(v.id)}
                                        disabled={generating}
                                    >
                                        <span className="audio-studio-voice-flag">{v.flag}</span>
                                        <span className="audio-studio-voice-name">{v.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            className="audio-studio-generate-btn"
                            onClick={handleGenerate}
                            disabled={!text.trim() || generating}
                        >
                            {generating ? (
                                <>
                                    <IconLoader2 size={20} className="animate-spin" />
                                    <span>Génération en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconMusic size={20} />
                                    <span>Générer l&apos;audio</span>
                                    <span className="audio-studio-credit-cost">
                                        ~{estimatedCredits} crédits
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Error */} {error && (
                            <div className="audio-studio-error">
                                <IconAlertCircle size={18} />
                                <span>{error}</span>
                                <button onClick={() => setError(null)}>✕</button>
                            </div>
                        )}
                    </div>

                    {/* Right — Result */}
                    <div className="audio-studio-result-panel">
                        {generating ? (
                            <div className="audio-studio-generating">
                                <div className="audio-studio-generating-animation">
                                    <div className="audio-studio-generating-ring" />
                                    <IconMusic size={40} className="audio-studio-generating-icon" />
                                </div>
                                <h3>Synthèse vocale en cours 🎵</h3>
                                <p>Conversion du texte en audio...</p>
                                <p className="audio-studio-generating-tip">
                                    Voix : {VOICES.find(v => v.id === voice)?.name}
                                </p>
                            </div>
                        ) : resultUrl ? (
                            <div className="audio-studio-result">
                                <div className="audio-studio-result-player">
                                    <audio
                                        src={resultUrl}
                                        controls
                                        className="audio-studio-audio-element"
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                    <div className="audio-studio-player-visual">
                                        <div className={`audio-studio-wave ${isPlaying ? 'playing' : ''}`}>
                                            {[...Array(20)].map((_, i) => (
                                                <div key={i} className="audio-studio-wave-bar" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="audio-studio-result-actions">
                                    <button className="audio-studio-action-btn primary" onClick={handleDownload}>
                                        <IconDownload size={18} />
                                        Télécharger WAV
                                    </button>
                                    <button
                                        className="audio-studio-action-btn secondary"
                                        onClick={() => { setResultUrl(null); setError(null); }}
                                    >
                                        <IconRefresh size={18} />
                                        Nouveau texte
                                    </button>
                                </div>
                                <div className="audio-studio-result-meta">
                                    <span>Voix : {VOICES.find(v => v.id === voice)?.name}</span>
                                    <span>Durée : ~{duration}s</span>
                                    <span>Crédits : {creditsUsed}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="audio-studio-empty">
                                <div className="audio-studio-empty-icon">
                                    <IconMusic size={56} />
                                </div>
                                <h3>Prêt à créer</h3>
                                <p>Entrez un texte et choisissez une voix pour générer de l&apos;audio.</p>
                                <div className="audio-studio-empty-features">
                                    <div className="audio-studio-empty-feature">
                                        <div className="dot gold" />
                                        <span>Synthèse vocale multilingue</span>
                                    </div>
                                    <div className="audio-studio-empty-feature">
                                        <div className="dot terracotta" />
                                        <span>Voix naturelles (Bark)</span>
                                    </div>
                                    <div className="audio-studio-empty-feature">
                                        <div className="dot savanna" />
                                        <span>Téléchargement WAV</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
