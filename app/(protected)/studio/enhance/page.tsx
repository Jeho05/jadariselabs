'use client';

import { useState, useEffect, useRef } from 'react';
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
    IconArrowRight,
    IconEnhance,
    IconUser,
    IconSparkles,
} from '@/components/icons';
import Link from 'next/link';

type EnhanceMode = 'upscale' | 'remove-bg';

const MODES: { id: EnhanceMode; name: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; credits: number }[] = [
    { id: 'upscale', name: 'Upscaling x4', desc: 'Agrandir l\'image en haute qualité', icon: IconEnhance, credits: 2 },
    { id: 'remove-bg', name: 'Suppression fond', desc: 'Retirer l\'arrière-plan automatiquement', icon: IconUser, credits: 1 },
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

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image trop volumineuse (max 10MB)');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResultUrl(null);
        setError(null);
        setProvider(null);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image trop volumineuse (max 10MB)');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResultUrl(null);
        setError(null);
        setProvider(null);
    };

    // Handle process
    const handleProcess = async () => {
        if (!selectedFile || processing) return;

        setProcessing(true);
        setError(null);
        setResultUrl(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const endpoint = mode === 'upscale' ? '/api/enhance/upscale' : '/api/enhance/remove-bg';
            const res = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }

            setResultUrl(data.image_url);
            setCreditsUsed(data.credits_charged);
            if (data.provider) setProvider(data.provider);

            // Update credits locally
            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: data.remaining_credits });
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setProcessing(false);
        }
    };

    // Handle download
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

    // Reset
    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setError(null);
        setProvider(null);
        setCreditsUsed(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const currentMode = MODES.find(m => m.id === mode)!;

    if (loading) {
        return (
            <div className="enhance-studio">
                <div className="enhance-studio-loading">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="enhance-studio">
            {/* Background */}
            <div className="enhance-studio-bg">
                <div className="enhance-studio-bg-orb orb-1" />
                <div className="enhance-studio-bg-orb orb-2" />
            </div>

            <div className="enhance-studio-content">
                {/* Header */}
                <div className="enhance-studio-header">
                    <div className="enhance-studio-header-left">
                        <div className="module-icon-premium savanna">
                            <IconWand size={28} />
                        </div>
                        <div>
                            <h1>Amélioration d&apos;images</h1>
                            <p>Upscaling et suppression d&apos;arrière-plan</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="enhance-studio-credits">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="enhance-studio-grid">
                    {/* Left — Controls */}
                    <div className="enhance-studio-controls">
                        {/* Mode Selection */}
                        <div className="enhance-studio-section">
                            <label className="enhance-studio-label">Mode de traitement</label>
                            <div className="enhance-studio-mode-grid">
                                {MODES.map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <button
                                            key={m.id}
                                            className={`enhance-studio-mode-btn ${mode === m.id ? 'active' : ''}`}
                                            onClick={() => { setMode(m.id); setResultUrl(null); setProvider(null); }}
                                            disabled={processing}
                                        >
                                            <Icon size={24} />
                                            <span className="enhance-studio-mode-name">{m.name}</span>
                                            <span className="enhance-studio-mode-desc">{m.desc}</span>
                                            <span className="enhance-studio-mode-credits">{m.credits} crédit{m.credits > 1 ? 's' : ''}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="enhance-studio-section">
                            <label className="enhance-studio-label">Image source</label>
                            <div
                                className={`enhance-studio-dropzone ${selectedFile ? 'has-file' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="enhance-studio-preview" />
                                ) : (
                                    <div className="enhance-studio-dropzone-content">
                                        <IconUpload size={40} />
                                        <p>Glissez une image ici ou cliquez pour sélectionner</p>
                                        <span className="enhance-studio-dropzone-hint">PNG, JPG, WebP — max 10MB</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                            {selectedFile && (
                                <p className="enhance-studio-file-info">
                                    📁 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>

                        {/* Process Button */}
                        <button
                            className="enhance-studio-process-btn"
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
                                    <span className="enhance-studio-credit-cost">
                                        {currentMode.credits} crédit{currentMode.credits > 1 ? 's' : ''}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Error */}
                        {error && (
                            <div className="enhance-studio-error">
                                <IconAlertCircle size={18} />
                                <span>{error}</span>
                                <button onClick={() => setError(null)}>✕</button>
                            </div>
                        )}
                    </div>

                    {/* Right — Result */}
                    <div className="enhance-studio-result-panel">
                        {processing ? (
                            <div className="enhance-studio-processing">
                                <div className="enhance-studio-processing-animation">
                                    <div className="enhance-studio-processing-ring" />
                                    <IconWand size={40} className="enhance-studio-processing-icon" />
                                </div>
                                <h3>Amélioration en cours ✨</h3>
                                <p>{mode === 'upscale' ? 'Agrandissement x4 en cours...' : 'Suppression de l\'arrière-plan...'}</p>
                            </div>
                        ) : resultUrl ? (
                            <div className="enhance-studio-result">
                                <div className="enhance-studio-result-image-wrapper">
                                    <img
                                        src={resultUrl}
                                        alt="Result"
                                        className="enhance-studio-result-image"
                                    />
                                </div>
                                <div className="enhance-studio-result-actions">
                                    <button className="enhance-studio-action-btn primary" onClick={handleDownload}>
                                        <IconDownload size={18} />
                                        Télécharger
                                    </button>
                                    <button
                                        className="enhance-studio-action-btn secondary"
                                        onClick={handleReset}
                                    >
                                        <IconRefresh size={18} />
                                        Nouvelle image
                                    </button>
                                </div>
                                <div className="enhance-studio-result-meta">
                                    <span>Mode : {currentMode.name}</span>
                                    {provider && <span>Provider : {provider}</span>}
                                    <span>Crédits : {creditsUsed}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="enhance-studio-empty">
                                <div className="enhance-studio-empty-icon">
                                    <IconWand size={56} />
                                </div>
                                <h3>Prêt à améliorer</h3>
                                <p>Sélectionnez une image et choisissez un mode de traitement.</p>
                                <div className="enhance-studio-empty-features">
                                    <div className="enhance-studio-empty-feature">
                                        <div className="dot terracotta" />
                                        <span>Upscaling x4 (Real-ESRGAN)</span>
                                    </div>
                                    <div className="enhance-studio-empty-feature">
                                        <div className="dot savanna" />
                                        <span>Suppression fond (RMBG)</span>
                                    </div>
                                    <div className="enhance-studio-empty-feature">
                                        <div className="dot gold" />
                                        <span>Téléchargement HD</span>
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
