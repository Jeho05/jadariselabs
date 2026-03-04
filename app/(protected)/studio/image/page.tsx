'use client';

import { useState, useEffect } from 'react';
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
    { id: 'flux-schnell', name: 'FLUX.1 Schnell', desc: 'Rapide — idéal pour l\'exploration' },
    { id: 'sdxl', name: 'Stable Diffusion XL', desc: 'Haute qualité — détails fins' },
    { id: 'sd35-medium', name: 'SD 3.5 Medium', desc: 'Nouvelle génération — excellente adhérence', badge: 'NOUVEAU' },
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
    '🖼️ Art abstrait coloré inspiré de l\'Afrique',
    '📸 Photo réaliste d\'architecture',
    '🎭 Illustration digitale fantastique',
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
            <div className="image-studio">
                <div className="image-studio-loading">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="image-studio">
            {/* Background */}
            <div className="image-studio-bg">
                <div className="image-studio-bg-orb orb-1" />
                <div className="image-studio-bg-orb orb-2" />
                <div className="image-studio-bg-orb orb-3" />
            </div>

            <div className="image-studio-content">
                {/* Header */}
                <div className="image-studio-header">
                    <div className="image-studio-header-left">
                        <div className="module-icon-premium terracotta">
                            <IconPalette size={28} />
                        </div>
                        <div>
                            <h1>Studio Image</h1>
                            <p>Transformez vos idées en images époustouflantes</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="image-studio-credits">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                {/* Step indicator */}
                <div className="studio-steps">
                    <div className={`studio-step ${!prompt ? 'active' : ''}`}>
                        <div className="studio-step-dot" />
                        1. Décrivez
                    </div>
                    <div className="studio-step-connector" />
                    <div className={`studio-step ${prompt && !generating && !resultUrl ? 'active' : ''}`}>
                        <div className="studio-step-dot" />
                        2. Configurez
                    </div>
                    <div className="studio-step-connector" />
                    <div className={`studio-step ${generating || resultUrl ? 'active' : ''}`}>
                        <div className="studio-step-dot" />
                        3. Générez
                    </div>
                </div>

                <div className="image-studio-grid">
                    {/* Left — Controls */}
                    <div className="image-studio-controls">
                        {/* Prompt */}
                        <div className="image-studio-section">
                            <label className="image-studio-label">
                                <IconSparkles size={16} />
                                Décrivez votre image
                            </label>
                            <textarea
                                className="image-studio-textarea"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ex: Un portrait stylisé d'une femme africaine avec des motifs géométriques dorés..."
                                rows={4}
                                maxLength={2000}
                                disabled={generating}
                            />
                            <div className="image-studio-char-count">
                                {prompt.length}/2000
                            </div>
                        </div>

                        {/* Suggestions */}
                        {!prompt && !resultUrl && (
                            <div className="image-studio-suggestions">
                                {STYLE_SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        className="image-studio-suggestion-btn"
                                        onClick={() => setPrompt(s.replace(/^[^\s]+\s/, ''))}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Model Selection */}
                        <div className="image-studio-section">
                            <label className="image-studio-label">Modèle IA</label>
                            <div className="image-studio-model-grid">
                                {MODELS.map((m) => (
                                    <button
                                        key={m.id}
                                        className={`image-studio-model-btn ${model === m.id ? 'active' : ''}`}
                                        onClick={() => setModel(m.id)}
                                        disabled={generating}
                                    >
                                        <span className="image-studio-model-name">
                                            {m.name}
                                            {m.badge && <span className="image-studio-model-badge">{m.badge}</span>}
                                        </span>
                                        <span className="image-studio-model-desc">{m.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="image-studio-section">
                            <label className="image-studio-label">Taille</label>
                            <div className="image-studio-size-grid">
                                {SIZES.map((s) => (
                                    <button
                                        key={s.id}
                                        className={`image-studio-size-btn ${size === s.id ? 'active' : ''}`}
                                        onClick={() => setSize(s.id)}
                                        disabled={generating}
                                    >
                                        {s.label}
                                        {s.id === '1024x1024' && profile?.plan === 'free' && (
                                            <span className="image-studio-hd-badge">PRO</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {isHD && profile?.plan === 'free' && (
                                <p className="image-studio-hd-warning">
                                    ⚠️ La taille HD nécessite un plan Starter ou Pro.
                                    <Link href="/dashboard" className="image-studio-upgrade-link">Mettre à niveau →</Link>
                                </p>
                            )}
                        </div>

                        {/* Negative Prompt (collapsible) */}
                        <div className="image-studio-section">
                            <button
                                className="image-studio-toggle"
                                onClick={() => setShowNegative(!showNegative)}
                            >
                                {showNegative ? '▼' : '▶'} Prompt négatif (optionnel)
                            </button>
                            {showNegative && (
                                <textarea
                                    className="image-studio-textarea small"
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
                            className="image-studio-generate-btn"
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
                                    <span className="image-studio-credit-cost">
                                        {estimatedCredits} crédit{estimatedCredits > 1 ? 's' : ''}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Error */}
                        {error && (
                            <div className="image-studio-error">
                                <IconAlertCircle size={18} />
                                <span>{error}</span>
                                <button onClick={() => setError(null)}>✕</button>
                            </div>
                        )}
                    </div>

                    {/* Right — Result */}
                    <div className="image-studio-result-panel">
                        {generating ? (
                            <div className="image-studio-generating">
                                <div className="image-studio-generating-animation">
                                    <div className="image-studio-generating-ring" />
                                    <IconPalette size={40} className="image-studio-generating-icon" />
                                </div>
                                <h3>Magie en cours ✨</h3>
                                <p>Votre image est en train d&apos;être générée par l&apos;IA...</p>
                                <p className="image-studio-generating-tip">
                                    Modèle : {MODELS.find(m => m.id === model)?.name}
                                </p>
                            </div>
                        ) : resultUrl ? (
                            <div className="image-studio-result">
                                <div className="image-studio-result-image-wrapper">
                                    <img
                                        src={resultUrl}
                                        alt={prompt}
                                        className="image-studio-result-image"
                                    />
                                </div>
                                <div className="image-studio-result-actions">
                                    <button className="image-studio-action-btn primary" onClick={handleDownload}>
                                        <IconDownload size={18} />
                                        Télécharger
                                    </button>
                                    <button
                                        className="image-studio-action-btn secondary"
                                        onClick={() => { setResultUrl(null); setError(null); }}
                                    >
                                        <IconRefresh size={18} />
                                        Régénérer
                                    </button>
                                </div>
                                <div className="image-studio-result-share">
                                    <ShareButtons
                                        title={`Image générée par JadaRiseLabs : "${prompt.substring(0, 60)}"`}
                                        url={resultUrl.startsWith('data:') ? (typeof window !== 'undefined' ? window.location.href : '') : resultUrl}
                                    />
                                </div>
                                <div className="image-studio-result-meta">
                                    <span>Modèle : {MODELS.find(m => m.id === model)?.name}</span>
                                    <span>Taille : {size}</span>
                                    <span>Crédits : {creditsUsed}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="image-studio-empty">
                                <div className="image-studio-empty-icon">
                                    <IconPalette size={56} />
                                </div>
                                <h3>Prêt à créer</h3>
                                <p>Décrivez votre image et cliquez sur &quot;Générer&quot; pour commencer.</p>
                                <div className="image-studio-empty-features">
                                    <div className="image-studio-empty-feature">
                                        <div className="dot savanna" />
                                        <span>FLUX, SDXL et SD 3.5</span>
                                    </div>
                                    <div className="image-studio-empty-feature">
                                        <div className="dot terracotta" />
                                        <span>Résolutions jusqu&apos;à 1024px</span>
                                    </div>
                                    <div className="image-studio-empty-feature">
                                        <div className="dot gold" />
                                        <span>Téléchargement + partage</span>
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
