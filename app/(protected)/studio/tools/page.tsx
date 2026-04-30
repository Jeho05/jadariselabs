'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconSettings2, IconLightbulb, IconPen
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type ToolId = 'calculator' | 'rewrite' | 'summarize' | 'ideation';

const TOOLS: { id: ToolId; title: string; icon: string; promptPrefix: string; placeholder: string }[] = [
    { 
        id: 'calculator', 
        title: 'Calculatrice IA', 
        icon: '🧮', 
        promptPrefix: 'Résous le problème mathématique ou financier suivant de manière claire et détaillée : ', 
        placeholder: 'Ex: Calcule la TVA à 18% sur 25000 FCFA et donne le TTC...' 
    },
    { 
        id: 'rewrite', 
        title: 'Reformulation', 
        icon: '✏️', 
        promptPrefix: 'Reformule le texte suivant pour qu\'il soit plus professionnel et fluide : ', 
        placeholder: 'Collez le texte à reformuler...' 
    },
    { 
        id: 'summarize', 
        title: 'Résumé Rapide', 
        icon: '📝', 
        promptPrefix: 'Fais un résumé très concis et direct de ce texte : ', 
        placeholder: 'Collez un long texte à résumer en 3 lignes...' 
    },
    { 
        id: 'ideation', 
        title: 'Boîte à Idées', 
        icon: '💡', 
        promptPrefix: 'Génère 5 bonnes idées innovantes pour ce sujet : ', 
        placeholder: 'Ex: Nom d\'une application de livraison à Dakar...' 
    },
];

export default function MicroToolsStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTool, setActiveTool] = useState<ToolId>('rewrite');
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

    const handleGenerate = async () => {
        if (!inputText.trim() || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');

        const tool = TOOLS.find(t => t.id === activeTool)!;
        const fullPrompt = `${tool.promptPrefix}\n\n${inputText}`;

        try {
            // We use the existing generate text API
            const res = await fetch('/api/generate/text', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt })
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

    const currentTool = TOOLS.find(t => t.id === activeTool)!;

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-yellow-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center shadow-lg">
                            <IconSettings2 size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Hub Micro-Outils
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Des mini-outils IA pour vos tâches rapides du quotidien.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-orange-600" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {TOOLS.map((tool) => (
                        <button key={tool.id} onClick={() => { setActiveTool(tool.id); setOutput(''); setInputText(''); }}
                            className={`flex flex-col items-center justify-center p-4 rounded-[20px] transition-all border ${
                                activeTool === tool.id 
                                    ? 'bg-white border-orange-500 shadow-md ring-2 ring-orange-500/20' 
                                    : 'bg-white/60 border-transparent hover:bg-white hover:shadow-sm'
                            }`}>
                            <span className="text-3xl mb-2">{tool.icon}</span>
                            <span className={`text-sm font-bold ${activeTool === tool.id ? 'text-orange-600' : 'text-gray-600'}`}>
                                {tool.title}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="glass-card-premium rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{currentTool.icon}</span>
                        <h3 className="font-bold text-gray-800 text-lg">{currentTool.title}</h3>
                    </div>

                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                        placeholder={currentTool.placeholder} rows={5} disabled={isStreaming}
                        className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:outline-none focus:border-orange-500 transition-all text-base resize-none" />

                    {error && (
                        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                            <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button onClick={handleGenerate} disabled={!inputText.trim() || isStreaming}
                            className="flex items-center gap-2.5 px-8 py-3.5 rounded-[16px] font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Exécution...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>Exécuter (1 crédit)</span></>
                            )}
                        </button>
                    </div>
                </div>

                {output && (
                    <div className="mt-6 bg-white rounded-[24px] shadow-sm border border-orange-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-orange-50/50 px-5 py-3.5 flex items-center justify-between border-b border-orange-100">
                            <span className="text-orange-800 font-bold text-sm flex items-center gap-2">
                                <IconCheck size={16} /> Résultat
                            </span>
                            <button onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-700 hover:bg-orange-100 transition-all">
                                {copied ? 'Copié!' : 'Copier'}
                            </button>
                        </div>
                        <div className="p-6 prose prose-sm sm:prose-base max-w-none">
                            <ChatMessageContent content={output} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
