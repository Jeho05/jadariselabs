'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconGraduationCap, IconUpload, IconPen, IconFileText, IconHelpCircle
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type CoachAction = 'quiz' | 'fiches' | 'correction';

export default function CoachStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [action, setAction] = useState<CoachAction>('quiz');
    const [subject, setSubject] = useState('Mathématiques');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [inputText, setInputText] = useState('');
    
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('Le fichier est trop volumineux (max 10MB).');
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleGenerate = async () => {
        if ((!selectedFile && !inputText.trim()) || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');

        const formData = new FormData();
        if (selectedFile) formData.append('file', selectedFile);
        if (inputText.trim()) formData.append('text', inputText);
        formData.append('action', action);
        formData.append('subject', subject);

        try {
            const res = await fetch('/api/coach', { 
                method: 'POST', 
                body: formData
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
                                if (parsed.meta && profile && parsed.meta.remaining_credits !== undefined) {
                                    setProfile({ ...profile, credits: parsed.meta.remaining_credits });
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
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-violet-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                            <IconGraduationCap size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Coach Scolaire
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Transformez vos documents en quiz et fiches de révision, ou corrigez vos devoirs.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-indigo-600" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                    {/* Left Panel */}
                    <div className="space-y-5">
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconGraduationCap size={16} className="text-indigo-600" />
                                Configuration
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 bg-indigo-50/50 p-1.5 rounded-xl border border-indigo-100">
                                    <button onClick={() => setAction('quiz')}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold transition-all ${action === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                                        <IconHelpCircle size={20} /> Quiz
                                    </button>
                                    <button onClick={() => setAction('fiches')}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold transition-all ${action === 'fiches' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                                        <IconFileText size={20} /> Fiches
                                    </button>
                                    <button onClick={() => setAction('correction')}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold transition-all ${action === 'correction' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                                        <IconPen size={20} /> Correction
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Matière</label>
                                    <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm appearance-none cursor-pointer">
                                        <option value="Mathématiques">Mathématiques</option>
                                        <option value="Physique-Chimie">Physique-Chimie</option>
                                        <option value="SVT">SVT / Biologie</option>
                                        <option value="Histoire-Géo">Histoire-Géo</option>
                                        <option value="Français">Français</option>
                                        <option value="Philosophie">Philosophie</option>
                                        <option value="Anglais">Anglais</option>
                                        <option value="Informatique">Informatique</option>
                                        <option value="Économie">Économie / Droit</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Fichier (PDF ou Image)</label>
                                    {!selectedFile ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-32 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <IconUpload size={20} />
                                            </div>
                                            <p className="text-sm font-medium text-indigo-800">Uploader un cours</p>
                                        </div>
                                    ) : (
                                        <div className="w-full p-4 border border-indigo-200 rounded-xl bg-indigo-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <IconFileText size={24} className="text-indigo-500 shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-indigo-900 truncate">{selectedFile.name}</p>
                                                    <p className="text-xs text-indigo-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedFile(null)}
                                                className="p-2 text-indigo-400 hover:text-red-500 transition-colors"
                                                disabled={isStreaming}
                                            >
                                                <IconRefresh size={18} />
                                            </button>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        accept=".pdf,image/jpeg,image/png,image/webp" 
                                        className="hidden" 
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">OU Coller le texte</label>
                                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Collez vos notes, votre cours, ou votre dissertation ici..." 
                                        rows={4} disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm resize-none" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                                <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button onClick={handleGenerate} disabled={(!selectedFile && !inputText.trim()) || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                                boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Analyse en cours...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>{action === 'quiz' ? 'Générer le Quiz' : action === 'fiches' ? 'Créer les Fiches' : 'Corriger le travail'} (1 crédit)</span></>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className="text-indigo-600" />
                                <span className="text-gray-700 font-semibold text-sm">Résultat du Coach</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-indigo-500 animate-spin" />
                                    <p className="text-sm font-medium text-indigo-600">Lecture et analyse...</p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-dashed border-indigo-200">
                                        <IconGraduationCap size={32} className="text-indigo-300" />
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Prêt pour l&apos;analyse</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Importez un cours (PDF, image) ou collez votre texte pour que l&apos;IA génère des ressources sur-mesure.
                                        </p>
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
