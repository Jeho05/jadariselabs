'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconUpload, IconX, IconFile, IconImage, IconDocument,
    IconSparkles, IconMail, IconBriefcase, IconCheck,
    IconFileText, IconArrowRight,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import { isSupportedDocument } from '@/lib/document-processor';

type CopilotAction = 'analyze' | 'email' | 'invoice' | 'tasks';
type InputMode = 'file' | 'text';
type EmailTone = 'formal' | 'friendly' | 'urgent';

const ACTIONS: Array<{ id: CopilotAction; label: string; desc: string; icon: string; color: string }> = [
    { id: 'analyze', label: 'Analyse complète', desc: 'Résumé + actions + contacts + chiffres', icon: '📋', color: 'earth' },
    { id: 'tasks', label: 'Extraction de tâches', desc: 'Plan d\'action structuré avec priorités', icon: '✅', color: 'savanna' },
    { id: 'email', label: 'Générer un email', desc: 'Email professionnel à partir du contenu', icon: '✉️', color: 'gold' },
    { id: 'invoice', label: 'Devis / Facture', desc: 'Générer un devis ou facture structuré', icon: '🧾', color: 'terracotta' },
];

const EMAIL_TONES: Array<{ id: EmailTone; label: string }> = [
    { id: 'formal', label: '🎩 Formel' },
    { id: 'friendly', label: '😊 Amical' },
    { id: 'urgent', label: '🔴 Urgent' },
];

export default function CopilotStudioPage() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Input state
    const [inputMode, setInputMode] = useState<InputMode>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [rawText, setRawText] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Options
    const [action, setAction] = useState<CopilotAction>('analyze');
    const [context, setContext] = useState('');
    const [emailTone, setEmailTone] = useState<EmailTone>('formal');

    // Output state
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [usedAction, setUsedAction] = useState<CopilotAction | null>(null);

    // Load profile
    useState(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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
        if (file.size > 10 * 1024 * 1024) {
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

    const removeFile = () => {
        setSelectedFile(null);
        setOutput('');
        setWordCount(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const hasInput = inputMode === 'file' ? !!selectedFile : rawText.trim().length > 10;

    const handleGenerate = async () => {
        if (!hasInput || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');
        setUsedAction(action);

        const formData = new FormData();
        formData.append('action', action);
        if (context.trim()) formData.append('context', context.trim());
        if (action === 'email') formData.append('emailTone', emailTone);

        if (inputMode === 'file' && selectedFile) {
            formData.append('file', selectedFile);
        } else if (inputMode === 'text') {
            formData.append('rawText', rawText);
        }

        try {
            const res = await fetch('/api/copilot', { method: 'POST', body: formData });

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
                            } catch { /* skip */ }
                        }
                    }
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion.');
        } finally {
            setIsStreaming(false);
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* no-op */ }
    };

    const getFileIcon = () => {
        if (!selectedFile) return IconDocument;
        if (selectedFile.type.startsWith('image/')) return IconImage;
        return IconFile;
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
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[15%] left-[-8%] w-[35%] h-[35%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[35%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-earth)] flex items-center justify-center shadow-lg">
                            <IconSparkles size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Copilote Administratif
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Upload → Résumé → Actions → Email → Facture
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-gold)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
                    {/* ── Left Panel ── */}
                    <div className="space-y-5">
                        {/* Input Mode Toggle */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <div className="flex rounded-xl bg-[var(--color-cream-dark)]/50 p-1 mb-5">
                                <button onClick={() => setInputMode('file')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${inputMode === 'file' ? 'bg-white shadow-sm text-[var(--color-earth)]' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <IconUpload size={16} /> Fichier
                                </button>
                                <button onClick={() => setInputMode('text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${inputMode === 'text' ? 'bg-white shadow-sm text-[var(--color-earth)]' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <IconFileText size={16} /> Texte
                                </button>
                            </div>

                            {inputMode === 'file' ? (
                                !selectedFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5' : 'border-gray-300 hover:border-[var(--color-earth)] hover:bg-gray-50'}`}
                                    >
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-earth)]/20 flex items-center justify-center">
                                            <IconUpload size={24} className="text-[var(--color-earth)]" />
                                        </div>
                                        <p className="text-gray-600 font-semibold mb-1">Glissez-déposez ou cliquez</p>
                                        <p className="text-xs text-gray-400">PDF, PNG, JPG, WEBP, TXT (max 10MB)</p>
                                        <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-[var(--color-border)]">
                                        <div className="w-11 h-11 rounded-xl bg-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-earth)]">
                                            {(() => { const Icon = getFileIcon(); return <Icon size={22} />; })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate text-sm">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={removeFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <IconX size={16} />
                                        </button>
                                    </div>
                                )
                            ) : (
                                <textarea
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder="Collez ici le texte de votre document, email, contrat, note..."
                                    rows={6}
                                    disabled={isStreaming}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] transition-all text-sm leading-relaxed resize-none"
                                />
                            )}

                            {error && (
                                <div className="flex items-start gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                                    <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Selector */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconSparkles size={16} className="text-[var(--color-gold)]" />
                                Que voulez-vous faire ?
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {ACTIONS.map((act) => (
                                    <button key={act.id} onClick={() => setAction(act.id)} disabled={isStreaming}
                                        className={`p-3 rounded-xl border-2 text-left transition-all group ${action === act.id
                                            ? `border-[var(--color-${act.color})] bg-[var(--color-${act.color})]/5`
                                            : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{act.icon}</span>
                                            <span className="font-semibold text-sm text-gray-800">{act.label}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-snug">{act.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email tone (conditional) */}
                        {action === 'email' && (
                            <div className="glass-card-premium rounded-[20px] p-5 shadow-sm animate-fade-in-up">
                                <h3 className="font-bold text-gray-800 mb-3 text-sm">Ton de l&apos;email</h3>
                                <div className="flex gap-2">
                                    {EMAIL_TONES.map((t) => (
                                        <button key={t.id} onClick={() => setEmailTone(t.id)} disabled={isStreaming}
                                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${emailTone === t.id
                                                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5 text-[var(--color-earth)]'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Context */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider flex items-center gap-2">
                                Contexte additionnel
                                <span className="text-[10px] font-normal normal-case tracking-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                            </label>
                            <input type="text" value={context} onChange={(e) => setContext(e.target.value)}
                                placeholder="Ex: C'est un contrat de prestation IT..."
                                disabled={isStreaming}
                                className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] transition-all text-sm" />
                        </div>

                        {/* Generate Button */}
                        <button onClick={handleGenerate} disabled={!hasInput || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-earth) 0%, var(--color-earth-dark) 100%)',
                                boxShadow: '0 8px 16px -4px rgba(123, 79, 46, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Analyse en cours...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>Lancer le copilote</span><IconArrowRight size={16} /></>
                            )}
                        </button>
                    </div>

                    {/* ── Right Panel — Output ── */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Output Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                {usedAction && <span className="text-lg">{ACTIONS.find(a => a.id === usedAction)?.icon || '📋'}</span>}
                                <span className="text-gray-700 font-semibold text-sm">
                                    {usedAction ? ACTIONS.find(a => a.id === usedAction)?.label : 'Résultat'}
                                </span>
                                {wordCount > 0 && <span className="text-xs text-gray-400 ml-2">({wordCount} mots analysés)</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)] transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                                <button onClick={() => { setOutput(''); setWordCount(0); setUsedAction(null); }} disabled={!output}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30">
                                    <IconRefresh size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Output Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-earth)]/20 flex items-center justify-center">
                                            <IconLoader2 size={28} className="animate-spin text-[var(--color-earth)]" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-gold)] rounded-full flex items-center justify-center animate-pulse">
                                            <IconSparkles size={10} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-600">Le copilote analyse votre document...</p>
                                        <p className="text-xs text-gray-400 mt-1">Cela peut prendre quelques secondes</p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-gold)]/10 to-[var(--color-earth)]/10 flex items-center justify-center border-2 border-dashed border-[var(--color-border)]">
                                            <IconSparkles size={32} className="text-[var(--color-earth)]/30" />
                                        </div>
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Votre copilote est prêt</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Uploadez un document ou collez du texte, choisissez une action, et laissez l&apos;IA structurer tout pour vous.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                                        {['Résumé PDF', 'Email pro', 'Facture', 'Plan d\'action'].map((ex) => (
                                            <span key={ex} className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[var(--color-cream-dark)]/50 text-gray-500 border border-[var(--color-border)]">
                                                {ex}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
