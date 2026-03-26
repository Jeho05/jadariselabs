'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    IconSparkles,
    IconDownload,
    IconRefresh,
    IconLoader2,
    IconAlertCircle,
} from '@/components/icons';
import ShareButtons from '@/components/share-buttons';

type PuterModelDef = {
    id: string;
    name: string;
    desc: string;
    badge?: string;
    quality?: string;
};

// Puter.js model definitions with quality metadata
const PUTER_MODELS: PuterModelDef[] = [
    { id: 'gpt-image-1', name: 'GPT Image 1', desc: 'Meilleur rendu typographique', badge: 'TOP', quality: 'medium' },
    { id: 'dall-e-3', name: 'DALL-E 3', desc: 'Design commercial HD', quality: 'hd' },
    { id: 'gemini-2.5-flash-image-preview', name: 'Gemini Flash', desc: 'Photoréalisme rapide' },
    { id: 'google/imagen-4.0-fast', name: 'Imagen 4.0 Fast', desc: 'Dernière génération Google', badge: 'NEW' },
    { id: 'black-forest-labs/FLUX.1-schnell', name: 'FLUX.1 Schnell', desc: 'Qualité/vitesse optimal' },
    { id: 'ByteDance-Seed/Seedream-4.0', name: 'Seedream 4.0', desc: 'Style artistique avancé', badge: 'NEW' },
];

type PuterModel = string;

// Declare puter global type
declare global {
    interface Window {
        puter?: {
            ai: {
                txt2img: (prompt: string, options?: { model?: string; quality?: string }) => Promise<HTMLImageElement>;
            };
        };
    }
}

interface PuterImageGeneratorProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
}

export default function PuterImageGenerator({ prompt, onPromptChange }: PuterImageGeneratorProps) {
    const [puterReady, setPuterReady] = useState(false);
    const [model, setModel] = useState<PuterModel>('dall-e-3');
    const [generating, setGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scriptLoadedRef = useRef(false);

    // Load Puter.js script dynamically
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        // Check if already loaded
        if (window.puter) {
            setPuterReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.async = true;
        script.onload = () => {
            // Puter.js initializes asynchronously after script load
            const checkReady = setInterval(() => {
                if (window.puter) {
                    setPuterReady(true);
                    clearInterval(checkReady);
                }
            }, 200);
            // Timeout after 10s
            setTimeout(() => clearInterval(checkReady), 10000);
        };
        script.onerror = () => {
            setError('Impossible de charger Puter.js. Vérifiez votre connexion internet.');
        };
        document.head.appendChild(script);
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || generating || !window.puter) return;

        setGenerating(true);
        setError(null);
        setResultUrl(null);

        try {
            const selectedModel = PUTER_MODELS.find(m => m.id === model);
            const options: { model: string; quality?: string } = { model };
            
            // Add quality setting for supported models
            if (selectedModel && 'quality' in selectedModel && selectedModel.quality) {
                options.quality = selectedModel.quality;
            }

            const imgElement = await window.puter.ai.txt2img(prompt.trim(), options);
            
            // Extract the image src from the returned <img> element
            if (imgElement && imgElement.src) {
                setResultUrl(imgElement.src);
            } else {
                throw new Error('L\'image n\'a pas été générée correctement');
            }
        } catch (err) {
            console.error('[PuterImage] Error:', err);
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            
            if (message.includes('sign') || message.includes('auth') || message.includes('login')) {
                setError('Veuillez vous connecter à Puter.com pour utiliser ce mode. Une popup devrait apparaître automatiquement.');
            } else {
                setError(`Erreur de génération Puter: ${message}`);
            }
        } finally {
            setGenerating(false);
        }
    }, [prompt, model, generating]);

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `jadarise-puter-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedModelInfo = PUTER_MODELS.find(m => m.id === model);

    return (
        <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-6 border border-white/80 shadow-sm space-y-6">
                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-[rgba(231,111,81,0.06)] to-[rgba(212,163,115,0.06)] border border-[rgba(231,111,81,0.15)]">
                    <span className="text-xl">⚡</span>
                    <div>
                        <p className="text-[13px] font-bold text-gray-800">Mode Pro Gratuit — Via Puter.com</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                            Accédez à GPT Image, DALL-E 3, Imagen 4 et 30+ modèles premium sans utiliser vos crédits JadaRiseLabs. 
                            Les coûts sont sur votre quota Puter gratuit.
                        </p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap">0 CRÉDIT</span>
                </div>

                {/* Prompt */}
                <div>
                    <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 flex items-center gap-2">
                        <IconSparkles size={16} /> Décrivez votre image
                    </label>
                    <textarea
                        className="w-full p-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[var(--color-terracotta)] transition-colors resize-none text-[15px] leading-relaxed text-gray-800 placeholder-gray-400"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Ex: A photorealistic portrait of an African woman with golden geometric patterns..."
                        rows={4}
                        maxLength={2000}
                        disabled={generating}
                    />
                    <div className="text-right text-[11px] text-gray-400 mt-1">{prompt.length}/2000</div>
                </div>

                {/* Model Selection */}
                <div>
                    <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 block">
                        Modèle Premium
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PUTER_MODELS.map((m) => (
                            <button
                                key={m.id}
                                className={`text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                                    model === m.id
                                        ? 'border-[var(--color-terracotta)] bg-white shadow-md'
                                        : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                                }`}
                                onClick={() => setModel(m.id)}
                                disabled={generating}
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className={`font-bold text-[13px] truncate ${model === m.id ? 'text-[var(--color-terracotta-dark,#C25A3C)]' : 'text-gray-800'}`}>
                                        {m.name}
                                    </span>
                                    <span className="text-[11px] text-gray-500 truncate">{m.desc}</span>
                                </div>
                                {m.badge && <span className="text-[9px] font-bold bg-[var(--color-gold)] text-white px-1.5 py-0.5 rounded-full ml-2 shrink-0">{m.badge}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                    style={{
                        background: 'linear-gradient(135deg, #FF6B35 0%, #E85D26 100%)',
                        boxShadow: '0 8px 16px -4px rgba(255, 107, 53, 0.4)',
                    }}
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || generating || !puterReady}
                >
                    {!puterReady ? (
                        <>
                            <IconLoader2 size={20} className="animate-spin" />
                            <span>Chargement de Puter.js...</span>
                        </>
                    ) : generating ? (
                        <>
                            <IconLoader2 size={20} className="animate-spin" />
                            <span>Génération en cours...</span>
                        </>
                    ) : (
                        <>
                            <IconSparkles size={20} />
                            <span>Générer via Puter</span>
                            <span className="text-[12px] bg-white/20 px-2 py-0.5 rounded-full ml-1">0 crédit</span>
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

            {/* Result Area */}
            <div className="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/80 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                {generating ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-t-[#FF6B35] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl">⚡</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Génération Pro en cours ✨</h3>
                        <p className="text-sm text-gray-500">Modèle : {selectedModelInfo?.name}</p>
                        <p className="text-xs text-gray-400">Via Puter.com — 0 crédit JadaRiseLabs</p>
                    </div>
                ) : resultUrl ? (
                    <div className="flex flex-col">
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resultUrl}
                                alt={prompt}
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                                    style={{ background: 'linear-gradient(135deg, #FF6B35, #E85D26)' }}
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
                                url={typeof window !== 'undefined' ? window.location.href : ''}
                            />
                            <div className="flex gap-4 text-[12px] text-gray-400">
                                <span>Modèle : {selectedModelInfo?.name}</span>
                                <span>Via : Puter.com</span>
                                <span className="text-emerald-600 font-medium">0 crédit utilisé</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-[rgba(255,107,53,0.08)] flex items-center justify-center">
                            <span className="text-4xl">⚡</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Mode Pro Gratuit</h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Accédez à GPT Image, DALL-E 3, Imagen 4.0 et plus encore — sans utiliser vos crédits.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 justify-center">
                            <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-[#FF6B35]" /> 30+ modèles premium
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> 0 crédit JadaRiseLabs
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" /> Qualité maximum
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
