'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconCamera, IconUpload, IconTrash
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import Image from 'next/image';

export default function AgriStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [question, setQuestion] = useState('');
    const [location, setLocation] = useState('Bénin');
    
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

        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('L\'image est trop volumineuse (max 5MB).');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!selectedImage || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');

        try {
            const res = await fetch('/api/agri', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: selectedImage, question, location })
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

    const isFormValid = selectedImage !== null;

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-green-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-emerald-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg">
                            <IconCamera size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Assistant Agriculture
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Identifiez les maladies de vos cultures via IA et obtenez des conseils.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-green-600" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                    {/* Left Panel */}
                    <div className="space-y-5">
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconCamera size={16} className="text-green-600" />
                                Analyser une culture
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Photo de la plante *</label>
                                    {!selectedImage ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-48 border-2 border-dashed border-green-300 rounded-xl bg-green-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors group"
                                        >
                                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <IconUpload size={24} />
                                            </div>
                                            <p className="text-sm font-medium text-green-800">Cliquez pour importer une image</p>
                                            <p className="text-xs text-green-600/70 mt-1">JPG, PNG (Max 5MB)</p>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                                            <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                            <button 
                                                onClick={() => setSelectedImage(null)}
                                                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-red-500 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                                                disabled={isStreaming}
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        accept="image/jpeg,image/png,image/webp" 
                                        className="hidden" 
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Lieu / Pays (Optionnel)</label>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Ex: Bénin, Nord Togo..." disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Symptômes ou question</label>
                                    <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Ex: Les feuilles jaunissent, que faire ?" rows={3} disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm resize-none" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                                <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button onClick={handleGenerate} disabled={!isFormValid || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Analyse en cours...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>Lancer le diagnostic (2 crédits)</span></>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className="text-green-600" />
                                <span className="text-gray-700 font-semibold text-sm">Diagnostic IA</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                                <button onClick={() => setOutput('')} disabled={!output}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30">
                                    <IconRefresh size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-green-500 animate-spin" />
                                    <p className="text-sm font-medium text-green-600">L&apos;IA analyse votre plante...</p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center border-2 border-dashed border-green-200">
                                        <IconCamera size={32} className="text-green-300" />
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Prêt pour le diagnostic</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Importez une photo nette de votre plante ou du problème (feuilles, tiges) pour obtenir une analyse complète et des conseils de traitement.
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
