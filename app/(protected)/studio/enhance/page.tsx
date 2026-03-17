'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconWand,
    IconZap,
    IconDownload,
    IconRefresh,
    IconLoader2,
    IconAlertCircle,
    IconUpload,
    IconEnhance,
    IconUser,
    IconSparkles,
} from '@/components/icons';
import Link from 'next/link';

type EnhanceMode = 'upscale' | 'remove-bg';

const MODES: { id: EnhanceMode; name: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; credits: number }[] = [
    { id: 'upscale', name: 'Upscaling x4', desc: "Agrandir l'image en haute qualité", icon: IconEnhance, credits: 2 },
    { id: 'remove-bg', name: 'Suppression fond', desc: "Retirer l'arrière-plan automatiquement", icon: IconUser, credits: 1 },
];

export default function EnhanceStudioPage() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [mode, setMode] = useState<EnhanceMode>('upscale');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creditsUsed, setCreditsUsed] = useState(0);
    const [provider, setProvider] = useState<string | null>(null);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Veuillez sélectionner une image'); return; }
        if (file.size > 10 * 1024 * 1024) { setError('Image trop volumineuse (max 10MB)'); return; }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResultUrl(null);
        setError(null);
        setProvider(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Veuillez sélectionner une image'); return; }
        if (file.size > 10 * 1024 * 1024) { setError('Image trop volumineuse (max 10MB)'); return; }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResultUrl(null);
        setError(null);
        setProvider(null);
    };

    const handleProcess = async () => {
        if (!selectedFile || processing) return;
        setProcessing(true);
        setError(null);
        setResultUrl(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            const endpoint = mode === 'upscale' ? '/api/enhance/upscale' : '/api/enhance/remove-bg';
            const res = await fetch(endpoint, { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }
            setResultUrl(data.image_url);
            setCreditsUsed(data.credits_charged);
            if (data.provider) setProvider(data.provider);
            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: data.remaining_credits });
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `jadarise-enhanced-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setError(null);
        setProvider(null);
        setCreditsUsed(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const currentMode = MODES.find(m => m.id === mode)!;

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
            <div className="absolute top-[15%] left-[-8%] w-[35%] h-[35%] bg-[var(--color-savanna)] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[25%] h-[30%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.10] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-savanna), var(--color-savanna-dark, #1A5E3F))' }}>
                            <IconWand size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Amélioration d&apos;images</h1>
                            <p className="text-gray-500 text-sm mt-1">Upscaling et suppression d&apos;arrière-plan</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-savanna)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left — Controls */}
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-6 border border-white/80 shadow-sm space-y-6">
                            {/* Mode Selection */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 block">Mode de traitement</label>
                                <div className="space-y-2">
                                    {MODES.map((m) => {
                                        const Icon = m.icon;
                                        return (
                                            <button
                                                key={m.id}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                                                    mode === m.id
                                                        ? 'border-[var(--color-savanna)] bg-white shadow-md'
                                                        : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                                                }`}
                                                onClick={() => { setMode(m.id); setResultUrl(null); setProvider(null); }}
                                                disabled={processing}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === m.id ? 'bg-[rgba(45,106,79,0.1)] text-[var(--color-savanna)]' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className={`block font-bold text-[14px] ${mode === m.id ? 'text-[var(--color-savanna-dark,#1A5E3F)]' : 'text-gray-800'}`}>{m.name}</span>
                                                    <span className="text-[12px] text-gray-500">{m.desc}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-400">{m.credits} cr.</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-gray-500 mb-3 block">Image source</label>
                                <div
                                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                                        selectedFile ? 'border-[var(--color-savanna)] bg-white' : 'border-gray-300 hover:border-[var(--color-savanna)] bg-gray-50 hover:bg-white'
                                    }`}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Preview" width={800} height={600} className="w-full h-auto max-h-[300px] object-contain" unoptimized />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <IconUpload size={36} className="text-gray-400" />
                                            <p className="text-[14px] text-gray-600 font-medium">Glissez une image ici ou cliquez</p>
                                            <span className="text-[12px] text-gray-400">PNG, JPG, WebP — max 10MB</span>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                </div>
                                {selectedFile && (
                                    <p className="text-[12px] text-gray-400 mt-2">📁 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
                                )}
                            </div>

                            {/* Process Button */}
                            <button
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-savanna) 0%, var(--color-savanna-dark, #1A5E3F) 100%)',
                                    boxShadow: '0 8px 16px -4px rgba(45, 106, 79, 0.4)',
                                }}
                                onClick={handleProcess}
                                disabled={!selectedFile || processing}
                            >
                                {processing ? (
                                    <>
                                        <IconLoader2 size={20} className="animate-spin" />
                                        <span>Traitement en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconSparkles size={20} />
                                        <span>Traiter l&apos;image</span>
                                        <span className="text-[12px] bg-white/20 px-2 py-0.5 rounded-full ml-1">{currentMode.credits} crédit{currentMode.credits > 1 ? 's' : ''}</span>
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
                        {processing ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-t-[var(--color-savanna)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <IconWand size={28} className="text-[var(--color-savanna)]" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Amélioration en cours ✨</h3>
                                <p className="text-sm text-gray-500">{mode === 'upscale' ? 'Agrandissement x4 en cours...' : "Suppression de l'arrière-plan..."}</p>
                            </div>
                        ) : resultUrl ? (
                            <div className="flex flex-col">
                                <div className="relative">
                                    <Image src={resultUrl} alt="Result" width={1200} height={900} className="w-full h-auto" unoptimized />
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex gap-3">
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                                            style={{ background: 'linear-gradient(135deg, var(--color-savanna), var(--color-savanna-dark, #1A5E3F))' }}
                                            onClick={handleDownload}
                                        >
                                            <IconDownload size={18} /> Télécharger
                                        </button>
                                        <button
                                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                            onClick={handleReset}
                                        >
                                            <IconRefresh size={18} /> Nouvelle image
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-[12px] text-gray-400">
                                        <span>Mode : {currentMode.name}</span>
                                        {provider && <span>Provider : {provider}</span>}
                                        <span>Crédits : {creditsUsed}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-[rgba(45,106,79,0.08)] flex items-center justify-center">
                                    <IconWand size={36} className="text-[var(--color-savanna)]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Prêt à améliorer</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Sélectionnez une image et choisissez un mode de traitement.</p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-terracotta)]" /> Upscaling x4 (Real-ESRGAN)
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)]" /> Suppression fond (RMBG)
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" /> Téléchargement HD
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
