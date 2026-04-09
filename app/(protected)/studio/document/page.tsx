'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconFileText,
    IconZap,
    IconLoader2,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
    IconUpload,
    IconCheck,
    IconX,
    IconDocument,
    IconSparkles,
    IconFile,
    IconImage,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import { isSupportedDocument, calculateDocumentCredits } from '@/lib/document-processor';

type OutputFormat = 'summary' | 'bullets' | 'mindmap' | 'key-points';
type DetailLevel = 'short' | 'medium' | 'detailed';

const FORMAT_OPTIONS: Array<{ id: OutputFormat; label: string; description: string }> = [
    { id: 'summary', label: 'Résumé', description: 'Texte fluide et cohérent' },
    { id: 'bullets', label: 'Points clés', description: 'Liste avec puces' },
    { id: 'mindmap', label: 'Carte mentale', description: 'Structure hiérarchique' },
    { id: 'key-points', label: 'Points essentiels', description: 'Numérotés avec citations' },
];

const DETAIL_OPTIONS: Array<{ id: DetailLevel; label: string; description: string; credits: number }> = [
    { id: 'short', label: 'Court', description: '10-15% du texte', credits: 2 },
    { id: 'medium', label: 'Moyen', description: '20-25% du texte', credits: 5 },
    { id: 'detailed', label: 'Détaillé', description: '30-40% du texte', credits: 10 },
];

export default function DocumentStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // File state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Options
    const [format, setFormat] = useState<OutputFormat>('summary');
    const [detail, setDetail] = useState<DetailLevel>('medium');
    const [focus, setFocus] = useState('');
    
    // Generation state
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState<number>(0);

    // Load profile
    useState(() => {
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
    });

    const handleFileSelect = useCallback((file: File) => {
        if (!isSupportedDocument(file)) {
            setError('Format non supporté. Utilisez: PDF, PNG, JPG, WEBP, TXT');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB max
            setError('Fichier trop volumineux (max 10MB)');
            return;
        }
        setSelectedFile(file);
        setError(null);
        setOutput('');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeFile = () => {
        setSelectedFile(null);
        setOutput('');
        setWordCount(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const calculateCredits = () => {
        // Estimation: 500 mots = 1 page pour un PDF
        const estimatedWords = selectedFile ? Math.ceil(selectedFile.size / 1024) * 100 : 0;
        return calculateDocumentCredits(estimatedWords);
    };

    const handleGenerate = async () => {
        if (!selectedFile || isStreaming) return;

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Ce document nécessite environ ${creditsNeeded} crédits.`);
            return;
        }

        setIsStreaming(true);
        setError(null);
        setOutput('');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('format', format);
        formData.append('detail', detail);
        if (focus.trim()) formData.append('focus', focus.trim());

        try {
            const res = await fetch('/api/generate/document', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.details || data.error || 'Une erreur est survenue');
                setIsStreaming(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.meta) {
                                    setWordCount(parsed.meta.word_count || 0);
                                    if (profile && parsed.meta.remaining_credits !== undefined) {
                                        setProfile({ ...profile, credits: parsed.meta.remaining_credits });
                                    }
                                }
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setOutput(fullContent);
                                }
                            } catch {
                                // ignore malformed chunk
                            }
                        }
                    }
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setIsStreaming(false);
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
        } catch {
            // no-op
        }
    };

    const getFileIcon = () => {
        if (!selectedFile) return IconDocument;
        if (selectedFile.type.startsWith('image/')) return IconImage;
        return IconFile;
    };

    const getFileColor = () => {
        if (!selectedFile) return 'text-gray-400';
        if (selectedFile.type === 'application/pdf') return 'text-red-500';
        if (selectedFile.type.startsWith('image/')) return 'text-blue-500';
        return 'text-gray-600';
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

    const creditsNeeded = calculateCredits();

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-[var(--color-savanna)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium earth shadow-lg">
                            <IconFileText size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Documents IA
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Résumé et analyse intelligente de vos documents
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-earth)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits restants</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Panel - Upload & Options */}
                    <div className="space-y-6">
                        {/* Upload Zone */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconUpload size={18} className="text-[var(--color-earth)]" />
                                Votre document
                            </h3>
                            
                            {!selectedFile ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                        isDragging
                                            ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5'
                                            : 'border-gray-300 hover:border-[var(--color-earth)] hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <IconUpload size={28} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium mb-2">
                                        Glissez-déposez ou cliquez
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        PDF, PNG, JPG, WEBP, TXT (max 10MB)
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl">
                                    <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${getFileColor()}`}>
                                        {(() => {
                                            const Icon = getFileIcon();
                                            return <Icon size={24} />;
                                        })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                            {wordCount > 0 && ` • ${wordCount} mots détectés`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={removeFile}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <IconX size={18} />
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-3 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl">
                                    <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconSparkles size={18} className="text-[var(--color-gold)]" />
                                Options de résumé
                            </h3>

                            {/* Format */}
                            <div className="mb-5">
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">
                                    Format de sortie
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {FORMAT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormat(opt.id)}
                                            disabled={isStreaming}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                                format === opt.id
                                                    ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                                            <p className="text-xs text-gray-500">{opt.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Detail Level */}
                            <div className="mb-5">
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">
                                    Niveau de détail
                                </label>
                                <div className="space-y-2">
                                    {DETAIL_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setDetail(opt.id)}
                                            disabled={isStreaming}
                                            className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                                                detail === opt.id
                                                    ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="text-left">
                                                <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                                                <p className="text-xs text-gray-500">{opt.description}</p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                detail === opt.id
                                                    ? 'bg-[var(--color-earth)] text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                ~{opt.credits} crédits
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Focus (optional) */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider flex items-center gap-2">
                                    Focus particulier
                                    <span className="text-[10px] font-normal normal-case tracking-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                                </label>
                                <input
                                    type="text"
                                    value={focus}
                                    onChange={(e) => setFocus(e.target.value)}
                                    placeholder="Ex: aspects financiers, recommandations, conclusions..."
                                    disabled={isStreaming}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedFile || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-earth) 0%, var(--color-earth-dark) 100%)',
                                boxShadow: '0 8px 16px -4px rgba(123, 79, 46, 0.4)',
                            }}
                        >
                            {isStreaming ? (
                                <>
                                    <IconLoader2 size={20} className="animate-spin" />
                                    <span>Analyse en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconSparkles size={20} />
                                    <span>Résumer le document ({creditsNeeded} crédits)</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconDocument size={18} className="text-gray-400" />
                                <span className="text-gray-700 font-medium text-sm">
                                    {output || isStreaming ? 'Résumé' : 'Résultat'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {output && (
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                        title="Copier"
                                    >
                                        <IconCopy size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => { setOutput(''); setWordCount(0); }}
                                    disabled={!output}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    title="Effacer"
                                >
                                    <IconRefresh size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <IconLoader2 size={32} className="animate-spin text-[var(--color-earth)]" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Analyse du document en cours...</p>
                                        <p className="text-xs text-gray-400 mt-1">Cela peut prendre quelques secondes</p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                                        <IconFileText size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Le résumé s&apos;affichera ici</p>
                                    <p className="text-xs text-gray-400 max-w-xs text-center">
                                        Uploadez un document et configurez les options pour obtenir un résumé intelligent
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
