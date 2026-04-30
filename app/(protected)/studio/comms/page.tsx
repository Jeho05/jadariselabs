'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconMessageCircle, IconEdit
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type CommsAction = 'generate' | 'rewrite';

export default function CommsStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [action, setAction] = useState<CommsAction>('generate');
    const [inputText, setInputText] = useState('');
    const [tone, setTone] = useState('Professionnel');
    const [format, setFormat] = useState('Email formel');
    const [language, setLanguage] = useState('Français');
    
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

    const handleGenerate = async () => {
        if (!inputText.trim() || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');

        try {
            const res = await fetch('/api/comms', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, input: inputText, tone, format, language })
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
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-pink-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-rose-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <IconMessageCircle size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Copilote Communication
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Rédigez et reformulez vos emails et messages pros.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-pink-600" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mb-6">
                    <button onClick={() => setAction('generate')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-[16px] font-semibold transition-all ${action === 'generate' ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <IconSparkles size={20} /> Nouvelle rédaction
                    </button>
                    <button onClick={() => setAction('rewrite')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-[16px] font-semibold transition-all ${action === 'rewrite' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <IconEdit size={20} /> Reformulation
                    </button>
                </div>

                <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                    {/* Left Panel */}
                    <div className="space-y-5">
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                {action === 'generate' ? <IconSparkles size={16} className="text-pink-500" /> : <IconEdit size={16} className="text-rose-500" />}
                                {action === 'generate' ? 'Contexte du message' : 'Texte à améliorer'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                                        placeholder={action === 'generate' ? "De quoi voulez-vous parler ? (ex: demande de congé à mon manager)" : "Collez le texte brouillon ici..."} 
                                        rows={6} disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Format</label>
                                        <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm appearance-none cursor-pointer">
                                            <option value="Email formel">Email formel</option>
                                            <option value="Email interne">Email interne court</option>
                                            <option value="Message WhatsApp Pro">WhatsApp Pro</option>
                                            <option value="Post LinkedIn">Post LinkedIn</option>
                                            <option value="Même que l&apos;origine">Même que l&apos;origine</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Ton</label>
                                        <select value={tone} onChange={(e) => setTone(e.target.value)} disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm appearance-none cursor-pointer">
                                            <option value="Professionnel">Professionnel</option>
                                            <option value="Direct et concis">Direct et concis</option>
                                            <option value="Chaleureux">Chaleureux</option>
                                            <option value="Persuasif">Persuasif</option>
                                            <option value="Excuses">Excuses / Diplomate</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                                <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button onClick={handleGenerate} disabled={!inputText.trim() || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: action === 'generate' ? 'linear-gradient(135deg, #ec4899 0%, #e11d48 100%)' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                                boxShadow: `0 8px 16px -4px ${action === 'generate' ? 'rgba(236, 72, 153, 0.4)' : 'rgba(225, 29, 72, 0.4)'}`,
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>En cours...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>{action === 'generate' ? 'Rédiger' : 'Améliorer'} (1 crédit)</span></>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[500px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className="text-pink-600" />
                                <span className="text-gray-700 font-semibold text-sm">Texte Final</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-pink-500 animate-spin" />
                                    <p className="text-sm font-medium text-pink-600">
                                        {action === 'generate' ? 'L\'IA rédige votre message...' : 'L\'IA perfectionne votre texte...'}
                                    </p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-gray-800">
                                    {output}
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-20 h-20 rounded-2xl bg-pink-50 flex items-center justify-center border-2 border-dashed border-pink-200">
                                        {action === 'generate' ? <IconSparkles size={32} className="text-pink-300" /> : <IconEdit size={32} className="text-rose-300" />}
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Prêt</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {action === 'generate' ? 'Remplissez le contexte à gauche pour obtenir un message parfait en quelques secondes.' : 'Collez votre brouillon à gauche et laissez l\'IA l\'améliorer sans en changer le sens.'}
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
