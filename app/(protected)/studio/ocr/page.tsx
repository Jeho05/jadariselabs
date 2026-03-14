'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconFile,
    IconZap,
    IconUpload,
    IconLoader2,
    IconDownload,
    IconAlertCircle,
    IconSparkles,
    IconRefresh,
} from '@/components/icons';

type OcrFormat = 'text' | 'markdown' | 'json';
type OcrLanguage = 'fra' | 'eng' | 'fra+eng';

const FORMAT_OPTIONS: Array<{ id: OcrFormat; label: string; hint: string }> = [
    { id: 'text', label: 'Texte brut', hint: 'Extraction simple' },
    { id: 'markdown', label: 'Markdown', hint: 'Structure lisible' },
    { id: 'json', label: 'JSON', hint: 'Structure machine' },
];

const LANGUAGE_OPTIONS: Array<{ id: OcrLanguage; label: string }> = [
    { id: 'fra', label: 'Français' },
    { id: 'eng', label: 'Anglais' },
    { id: 'fra+eng', label: 'Français + Anglais' },
];

export default function OcrStudioPage() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [format, setFormat] = useState<OcrFormat>('markdown');
    const [language, setLanguage] = useState<OcrLanguage>('fra');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultText, setResultText] = useState<string>('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [creditsUsed, setCreditsUsed] = useState<number>(0);
    const [provider, setProvider] = useState<string | null>(null);
    const [pages, setPages] = useState<number | null>(null);

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
        fetchProfile();
    }, [supabase]);

    const handleFileSelect = (file: File | null) => {
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage) {
            setError('Format non supporte (PDF ou image)');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            setError('Fichier trop volumineux (max 15MB)');
            return;
        }

        setSelectedFile(file);
        setResultText('');
        setResultUrl(null);
        setProvider(null);
        setPages(null);
        setError(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0] ?? null;
        handleFileSelect(file);
    };

    const handleProcess = async () => {
        if (!selectedFile || processing) return;

        setProcessing(true);
        setError(null);
        setResultText('');
        setResultUrl(null);
        setProvider(null);
        setPages(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('format', format);
            formData.append('language', language);

            const res = await fetch('/api/generate/ocr', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }

            setResultText(data.text || '');
            setResultUrl(data.result_url || null);
            setCreditsUsed(data.credits_charged || 0);
            setProvider(data.provider || null);
            setPages(typeof data.pages === 'number' ? data.pages : null);

            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: data.remaining_credits });
            }
        } catch {
            setError('Erreur reseau. Verifiez votre connexion et reessayez.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `jadarise-ocr-${Date.now()}.${format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt'}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopy = async () => {
        if (!resultText) return;
        try {
            await navigator.clipboard.writeText(resultText);
        } catch {
            // no-op
        }
    };

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
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium earth">
                            <IconFile size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                                Vision & OCR Documentaire
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                                Extraction intelligente depuis PDF et images.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl bg-white/70 border border-[var(--color-border)]">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? '∞' : profile.credits} credits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="glass-card-premium rounded-2xl p-6 space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                Document source
                            </label>
                            <div
                                className={`mt-3 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                                    selectedFile ? 'bg-white' : 'bg-white/70'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {selectedFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <IconFile size={40} />
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                        <button
                                            type="button"
                                            className="text-xs text-[var(--color-earth)] underline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                                setSelectedFile(null);
                                            }}
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]">
                                        <IconUpload size={40} />
                                        <p>Glissez un PDF ou une image ici</p>
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            PDF, PNG, JPG, WebP — max 15MB
                                        </span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                    Format de sortie
                                </label>
                                <div className="mt-2 space-y-2">
                                    {FORMAT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                                                format === opt.id
                                                    ? 'border-[var(--color-earth)] bg-[var(--color-cream)]'
                                                    : 'border-[var(--color-border)] bg-white'
                                            }`}
                                            onClick={() => setFormat(opt.id)}
                                        >
                                            <div className="text-sm font-semibold">{opt.label}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{opt.hint}</div>
                                        </button>
                                    ))}
                                </div>
                                {format !== 'text' && (
                                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                                        Les formats structures necessitent GEMINI_API_KEY.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                    Langue OCR
                                </label>
                                <div className="mt-2 space-y-2">
                                    {LANGUAGE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                                                language === opt.id
                                                    ? 'border-[var(--color-earth)] bg-[var(--color-cream)]'
                                                    : 'border-[var(--color-border)] bg-white'
                                            }`}
                                            onClick={() => setLanguage(opt.id)}
                                        >
                                            <div className="text-sm font-semibold">{opt.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                            onClick={handleProcess}
                            disabled={!selectedFile || processing}
                        >
                            {processing ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    <span>Analyse en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconSparkles size={18} />
                                    <span>Lancer l&apos;OCR</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-terracotta)] bg-white/70 border border-[var(--color-terracotta)]/30 px-3 py-2 rounded-xl">
                                <IconAlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="glass-card-premium rounded-2xl p-6 flex flex-col gap-4">
                        {processing ? (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] flex items-center justify-center">
                                    <IconLoader2 size={28} className="animate-spin" />
                                </div>
                                <h3 className="font-semibold">Extraction en cours...</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Nous analysons votre document.
                                </p>
                            </div>
                        ) : resultText ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                    {provider && <span>Provider : {provider}</span>}
                                    {pages ? <span>Pages : {pages}</span> : null}
                                    <span>Credits : {creditsUsed}</span>
                                </div>
                                <pre className="flex-1 whitespace-pre-wrap text-sm bg-white rounded-xl p-4 border border-[var(--color-border)] overflow-auto max-h-[420px]">
                                    {resultText}
                                </pre>
                                <div className="flex flex-wrap gap-2">
                                    <button className="btn-secondary flex items-center gap-2" onClick={handleCopy}>
                                        Copier
                                    </button>
                                    {resultUrl && (
                                        <button className="btn-primary flex items-center gap-2" onClick={handleDownload}>
                                            <IconDownload size={16} />
                                            Telecharger
                                        </button>
                                    )}
                                    <button
                                        className="btn-secondary flex items-center gap-2"
                                        onClick={() => {
                                            setResultText('');
                                            setResultUrl(null);
                                            setProvider(null);
                                            setPages(null);
                                            setCreditsUsed(0);
                                        }}
                                    >
                                        <IconRefresh size={16} />
                                        Nouveau
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] flex items-center justify-center">
                                    <IconFile size={28} />
                                </div>
                                <h3 className="font-semibold">Pret pour l&apos;OCR</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Importez un document pour extraire son contenu.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
