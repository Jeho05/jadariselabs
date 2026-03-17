'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconPalette,
    IconSparkles,
    IconZap,
    IconDownload,
    IconRefresh,
    IconLoader2,
    IconAlertCircle,
} from '@/components/icons';
import ShareButtons from '@/components/share-buttons';
import Link from 'next/link';

type ImageModel = 'flux-schnell' | 'sdxl' | 'sd35-medium';
type ImageSize = '512x512' | '768x768' | '1024x1024';

const MODELS: { id: ImageModel; name: string; desc: string; badge?: string }[] = [
    { id: 'flux-schnell', name: 'FLUX.1 Schnell', desc: 'Rapide — exploration' },
    { id: 'sdxl', name: 'Stable Diffusion XL', desc: 'Haute qualité' },
    { id: 'sd35-medium', name: 'SD 3.5 Medium', desc: 'Nouvelle génération', badge: 'NOUVEAU' },
];

const SIZES: { id: ImageSize; label: string }[] = [
    { id: '512x512', label: '512 × 512' },
    { id: '768x768', label: '768 × 768' },
    { id: '1024x1024', label: '1024 × 1024 (HD)' },
];

const STYLE_SUGGESTIONS = [
    '🎨 Portrait style africain moderne',
    '🌅 Paysage de savane au coucher du soleil',
    '✨ Logo minimaliste doré',
    '🖼️ Art abstrait coloré',
    '📸 Photo réaliste architecture',
    '🎭 Illustration fantastique',
];

export default function ImageStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [model, setModel] = useState<ImageModel>('flux-schnell');
    const [size, setSize] = useState<ImageSize>('512x512');
    const [showNegative, setShowNegative] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [creditsUsed, setCreditsUsed] = useState(0);

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
        if (!prompt.trim() || generating) return;
        setGenerating(true);
        setError(null);
        setResultUrl(null);

        try {
            const isHD = size === '1024x1024';
            const res = await fetch('/api/generate/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    model,
                    size,
                    hd: isHD,
                    negative_prompt: negativePrompt.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }
            setResultUrl(data.image_url);
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
        link.download = `jadarise-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isHD = size === '1024x1024';
    const estimatedCredits = model === 'flux-schnell' ? (isHD ? 2 : 1) : (isHD ? 3 : 2);

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
            <div className="absolute top-[15%] left-[-8%] w-[35%] h-[35%] bg-[var(--color-terracotta)] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[35%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-terracotta), var(--color-terracotta-dark, #C25A3C))' }}>
                            <IconPalette size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Studio Image</h1>
                            <p className="text-gray-500 text-sm mt-1">Transformez vos idées en images époustouflantes</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-terracotta)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left — Controls */}
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-6 border border-white/80 shadow-sm space-y-6">
                            {/* Prompt */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 flex items-center gap-2">
                                    <IconSparkles size={16} /> Décrivez votre image
                                </label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[var(--color-terracotta)] transition-colors resize-none text-[15px] leading-relaxed text-gray-800 placeholder-gray-400"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ex: Un portrait stylisé d'une femme africaine avec des motifs géométriques dorés..."
                                    rows={4}
                                    maxLength={2000}
                                    disabled={generating}
                                />
                                <div className="text-right text-[11px] text-gray-400 mt-1">{prompt.length}/2000</div>
                            </div>

                            {/* Suggestions */}
                            {!prompt && !resultUrl && (
                                <div className="flex flex-wrap gap-2">
                                    {STYLE_SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            className="px-3 py-1.5 text-[13px] rounded-full bg-gray-100 hover:bg-[rgba(231,111,81,0.1)] hover:text-[var(--color-terracotta)] transition-colors text-gray-600 border border-gray-200 hover:border-[rgba(231,111,81,0.3)]"
                                            onClick={() => setPrompt(s.replace(/^[^\s]+\s/, ''))}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Model Selection */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 block">Modèle IA</label>
                                <div className="space-y-2">
                                    {MODELS.map((m) => (
                                        <button
                                            key={m.id}
                                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                                                model === m.id
                                                    ? 'border-[var(--color-terracotta)] bg-white shadow-md'
                                                    : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                                            }`}
                                            onClick={() => setModel(m.id)}
                                            disabled={generating}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-[14px] ${model === m.id ? 'text-[var(--color-terracotta-dark,#C25A3C)]' : 'text-gray-800'}`}>
                                                    {m.name}
                                                </span>
                                                <span className="text-[12px] text-gray-500">{m.desc}</span>
                                            </div>
                                            {m.badge && <span className="text-[10px] font-bold bg-[var(--color-gold)] text-white px-2 py-0.5 rounded-full">{m.badge}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 block">Taille</label>
                                <div className="flex gap-2">
                                    {SIZES.map((s) => (
                                        <button
                                            key={s.id}
                                            className={`flex-1 py-2.5 text-[13px] font-medium rounded-xl border-2 transition-all ${
                                                size === s.id
                                                    ? 'border-[var(--color-terracotta)] bg-white shadow-sm text-[var(--color-terracotta-dark,#C25A3C)]'
                                                    : 'border-transparent bg-white/50 text-gray-600 hover:bg-white'
                                            }`}
                                            onClick={() => setSize(s.id)}
                                            disabled={generating}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                                {isHD && profile?.plan === 'free' && (
                                    <p className="text-[12px] text-[var(--color-terracotta)] mt-2">
                                        ⚠️ La taille HD nécessite un plan Starter ou Pro.{' '}
                                        <Link href="/pricing" className="underline font-medium">Mettre à niveau →</Link>
                                    </p>
                                )}
                            </div>

                            {/* Negative Prompt */}
                            <div>
                                <button
                                    className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-medium"
                                    onClick={() => setShowNegative(!showNegative)}
                                >
                                    {showNegative ? '▼' : '▶'} Prompt négatif (optionnel)
                                </button>
                                {showNegative && (
                                    <textarea
                                        className="w-full mt-2 p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-terracotta)] text-[14px] text-gray-700 placeholder-gray-400 resize-none"
                                        value={negativePrompt}
                                        onChange={(e) => setNegativePrompt(e.target.value)}
                                        placeholder="Éléments à éviter : flou, déformé, texte, watermark..."
                                        rows={2}
                                        disabled={generating}
                                    />
                                )}
                            </div>

                            {/* Generate Button */}
                            <button
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-terracotta) 0%, var(--color-terracotta-dark, #C25A3C) 100%)',
                                    boxShadow: '0 8px 16px -4px rgba(231, 111, 81, 0.4)',
                                }}
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || generating || (isHD && profile?.plan === 'free')}
                            >
                                {generating ? (
                                    <>
                                        <IconLoader2 size={20} className="animate-spin" />
                                        <span>Génération en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconSparkles size={20} />
                                        <span>Générer l&apos;image</span>
                                        <span className="text-[12px] bg-white/20 px-2 py-0.5 rounded-full ml-1">{estimatedCredits} crédit{estimatedCredits > 1 ? 's' : ''}</span>
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
                                    <div className="w-20 h-20 rounded-full border-4 border-t-[var(--color-terracotta)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <IconPalette size={28} className="text-[var(--color-terracotta)]" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Magie en cours ✨</h3>
                                <p className="text-sm text-gray-500">Votre image est en train d&apos;être générée par l&apos;IA...</p>
                                <p className="text-xs text-gray-400">Modèle : {MODELS.find(m => m.id === model)?.name}</p>
                            </div>
                        ) : resultUrl ? (
                            <div className="flex flex-col">
                                <div className="relative">
                                    <Image
                                        src={resultUrl}
                                        alt={prompt}
                                        width={1024}
                                        height={1024}
                                        sizes="(max-width: 768px) 90vw, 600px"
                                        className="w-full h-auto"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex gap-3">
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                                            style={{ background: 'linear-gradient(135deg, var(--color-terracotta), var(--color-terracotta-dark, #C25A3C))' }}
                                            onClick={handleDownload}
                                        >
                                            <IconDownload size={18} /> Télécharger
                                        </button>
                                        <button
                                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                            onClick={() => { setResultUrl(null); setError(null); }}
                                        >
                                            <IconRefresh size={18} /> Nouveau
                                        </button>
                                    </div>
                                    <ShareButtons
                                        title={`Image générée par JadaRiseLabs : "${prompt.substring(0, 60)}"`}
                                        url={resultUrl.startsWith('data:') ? (typeof window !== 'undefined' ? window.location.href : '') : resultUrl}
                                    />
                                    <div className="flex gap-4 text-[12px] text-gray-400">
                                        <span>Modèle : {MODELS.find(m => m.id === model)?.name}</span>
                                        <span>Taille : {size}</span>
                                        <span>Crédits : {creditsUsed}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-[rgba(231,111,81,0.08)] flex items-center justify-center">
                                    <IconPalette size={36} className="text-[var(--color-terracotta)]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Prêt à créer</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Décrivez votre image et cliquez sur &quot;Générer&quot; pour commencer.</p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)]" /> FLUX, SDXL et SD 3.5
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-terracotta)]" /> Résolutions HD
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" /> Téléchargement + Partage
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
