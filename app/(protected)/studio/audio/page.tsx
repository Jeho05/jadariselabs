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
    "L'intelligence artificielle transforme nos idées en réalité.",
    'Découvrez la puissance de la synthèse vocale.',
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

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        setLoading(true);
        fetchProfile();
    }, [supabase]);

    const handleGenerate = async () => {
        if (!text.trim() || generating) return;
        setGenerating(true);
        setError(null);
        setResultUrl(null);

        try {
            const res = await fetch('/api/generate/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), voice }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }
            setResultUrl(data.audio_url);
            setDuration(data.duration);
            setCreditsUsed(data.credits_charged);
            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: data.remaining_credits });
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setGenerating(false);
        }
    };

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

    const estimatedCredits = 2 + Math.floor(text.length / 200);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-[15%] left-[-8%] w-[35%] h-[35%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[25%] h-[30%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.10] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark, #A68A3C))' }}>
                            <IconMusic size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Studio Audio</h1>
                            <p className="text-gray-500 text-sm mt-1">Synthèse vocale IA multilingue</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-gold)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left — Controls */}
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-6 border border-white/80 shadow-sm space-y-6">
                            {/* Text Input */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 flex items-center gap-2">
                                    <IconSparkles size={16} /> Texte à convertir
                                </label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none text-[15px] leading-relaxed text-gray-800 placeholder-gray-400"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Entrez le texte à convertir en voix..."
                                    rows={5}
                                    maxLength={500}
                                    disabled={generating}
                                />
                                <div className="text-right text-[11px] text-gray-400 mt-1">{text.length}/500 caractères</div>
                            </div>

                            {/* Example texts */}
                            {!text && !resultUrl && (
                                <div className="space-y-2">
                                    <p className="text-[12px] text-gray-400 font-medium">Exemples :</p>
                                    {EXAMPLE_TEXTS.map((ex, i) => (
                                        <button
                                            key={i}
                                            className="block w-full text-left px-3 py-2 text-[13px] rounded-xl bg-gray-50 hover:bg-[rgba(201,168,76,0.1)] hover:text-[var(--color-gold-dark,#A68A3C)] transition-colors text-gray-600 border border-gray-100 hover:border-[rgba(201,168,76,0.3)]"
                                            onClick={() => setText(ex)}
                                        >
                                            {ex.substring(0, 60)}...
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Voice Selection */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 block">Voix / Langue</label>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {VOICES.map((v) => (
                                        <button
                                            key={v.id}
                                            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                                                voice === v.id
                                                    ? 'border-[var(--color-gold)] bg-white shadow-md'
                                                    : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                                            }`}
                                            onClick={() => setVoice(v.id)}
                                            disabled={generating}
                                        >
                                            <span className="text-xl">{v.flag}</span>
                                            <span className={`text-[10px] font-medium ${voice === v.id ? 'text-[var(--color-gold-dark,#A68A3C)]' : 'text-gray-500'}`}>{v.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark, #A68A3C) 100%)',
                                    boxShadow: '0 8px 16px -4px rgba(201, 168, 76, 0.4)',
                                }}
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
                                        <span className="text-[12px] bg-white/20 px-2 py-0.5 rounded-full ml-1">~{estimatedCredits} crédits</span>
                                    </>
                                )}
                            </button>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-3 text-sm text-[var(--color-terracotta-dark,#C25A3C)] bg-[rgba(231,111,81,0.08)] border border-[rgba(231,111,81,0.2)] p-4 rounded-xl">
                                    <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span className="flex-1 leading-snug">{error}</span>
                                    <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right — Result */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/80 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        {generating ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-t-[var(--color-gold)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <IconMusic size={28} className="text-[var(--color-gold)]" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Synthèse vocale en cours 🎵</h3>
                                <p className="text-sm text-gray-500">Conversion du texte en audio...</p>
                                <p className="text-xs text-gray-400">Voix : {VOICES.find(v => v.id === voice)?.name}</p>
                            </div>
                        ) : resultUrl ? (
                            <div className="flex-1 flex flex-col p-6 gap-6">
                                <div className="bg-gradient-to-br from-[rgba(201,168,76,0.05)] to-[rgba(123,79,46,0.05)] rounded-2xl p-6 border border-[rgba(201,168,76,0.15)]">
                                    <audio
                                        src={resultUrl}
                                        controls
                                        className="w-full mb-4"
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                    {/* Wave animation */}
                                    <div className="flex items-end justify-center gap-[3px] h-12">
                                        {[...Array(24)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-[3px] rounded-full transition-all duration-150"
                                                style={{
                                                    height: isPlaying ? `${Math.random() * 100}%` : '20%',
                                                    background: `linear-gradient(to top, var(--color-gold), var(--color-earth))`,
                                                    opacity: isPlaying ? 0.8 : 0.3,
                                                    animationDelay: `${i * 50}ms`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                                        style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark, #A68A3C))' }}
                                        onClick={handleDownload}
                                    >
                                        <IconDownload size={18} /> Télécharger WAV
                                    </button>
                                    <button
                                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                        onClick={() => { setResultUrl(null); setError(null); }}
                                    >
                                        <IconRefresh size={18} /> Nouveau
                                    </button>
                                </div>
                                <div className="flex gap-4 text-[12px] text-gray-400">
                                    <span>Voix : {VOICES.find(v => v.id === voice)?.name}</span>
                                    <span>Durée : ~{duration}s</span>
                                    <span>Crédits : {creditsUsed}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-[rgba(201,168,76,0.08)] flex items-center justify-center">
                                    <IconMusic size={36} className="text-[var(--color-gold)]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Prêt à créer</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Entrez un texte et choisissez une voix pour générer de l&apos;audio.</p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" /> Synthèse multilingue
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-terracotta)]" /> Voix naturelles
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)]" /> Téléchargement WAV
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
