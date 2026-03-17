'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconCode,
    IconZap,
    IconLoader2,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type CodeMode = 'agentic' | 'speed' | 'long';

const CODE_MODES: Array<{ id: CodeMode; label: string; model: string; hint: string }> = [
    { id: 'agentic', label: 'Agentique', model: 'Zhipu GLM', hint: 'Planification' },
    { id: 'speed', label: 'Rapide', model: 'Groq LLaMA 3.3', hint: 'Faible latence' },
    { id: 'long', label: 'Contexte long', model: 'Gemini 2.5 Flash', hint: 'Grand contexte' },
];

type CodeMessage = { role: 'user' | 'assistant'; content: string };

export default function CodeStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<CodeMode>('agentic');
    const [input, setInput] = useState('');
    const [systemInstruction, setSystemInstruction] = useState('');
    const [output, setOutput] = useState('');
    const [history, setHistory] = useState<CodeMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [output]);

    const handleGenerate = async () => {
        if (!input.trim() || isStreaming) return;
        setIsStreaming(true);
        setError(null);
        setOutput('');

        const userMessage = { role: 'user' as const, content: input.trim() };
        const historyPayload = history.slice(-6);

        try {
            const res = await fetch('/api/generate/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    mode,
                    history: historyPayload,
                    systemInstruction: systemInstruction.trim() || undefined,
                }),
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

            setHistory((prev) => [...prev, userMessage, { role: 'assistant', content: fullContent }]);
            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: profile.credits - 1 });
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

    const modeConfig = CODE_MODES.find((m) => m.id === mode) || CODE_MODES[0];

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            
            {/* Ambient glows behind cards */}
            <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.15] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.15] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col h-screen max-h-screen overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium earth shadow-lg">
                            <IconCode size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Assistant Code
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Planification, débogage et refactoring assistés par IA.
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

                <div className="grid lg:grid-cols-5 gap-6 gap-y-8 flex-1 overflow-hidden min-h-0 pb-8">
                    {/* Colonne de gauche (2/5) : Contrôles */}
                    <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-y-auto hide-scrollbar pb-6">
                        <div className="glass-card-premium rounded-[20px] p-6 space-y-7 shadow-sm border border-white/60">
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-3 block">
                                    Modèle & Stratégie
                                </label>
                                <div className="space-y-3">
                                    {CODE_MODES.map((m) => (
                                        <button
                                            key={m.id}
                                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-1.5 ${
                                                mode === m.id
                                                    ? 'border-[var(--color-earth)] bg-white shadow-md transform -translate-y-[2px]'
                                                    : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                                            }`}
                                            onClick={() => setMode(m.id)}
                                            disabled={isStreaming}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className={`font-bold text-[15px] ${mode === m.id ? 'text-[var(--color-earth-dark)]' : 'text-gray-800'}`}>
                                                    {m.label}
                                                </span>
                                                {mode === m.id && <div className="w-2 h-2 rounded-full bg-[var(--color-earth)]" />}
                                            </div>
                                            <span className="text-[13px] text-[var(--color-text-muted)] font-medium">
                                                {m.model} • {m.hint}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
                                    Instructions système
                                    <span className="text-[10px] font-normal normal-case tracking-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                                </label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border-2 border-transparent bg-white/50 shadow-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none text-[14px] leading-relaxed text-gray-700 placeholder-gray-400"
                                    value={systemInstruction}
                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                    placeholder="Ex: Tu es un expert React/TypeScript. Réponds toujours en français. Utilise les bonnes pratiques..."
                                    rows={3}
                                    maxLength={1000}
                                    disabled={isStreaming}
                                />
                                <div className="text-right text-[11px] text-gray-400 mt-1">{systemInstruction.length}/1000</div>
                            </div>

                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-3 block">
                                    Vos instructions
                                </label>
                                <div className="relative">
                                    <textarea
                                        className="w-full p-4 pb-10 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[var(--color-earth)] transition-colors resize-none text-[15px] leading-relaxed text-gray-800 placeholder-gray-400"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ex: Crée un composant React de datatable avec pagination TailwindCSS et Zustand..."
                                        rows={6}
                                        maxLength={6000}
                                        disabled={isStreaming}
                                    />
                                    <div className="absolute bottom-3 right-4 text-[11px] font-medium text-gray-400">
                                        {input.length}/6000
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1"
                                style={{ 
                                    background: 'linear-gradient(135deg, var(--color-earth) 0%, var(--color-earth-dark) 100%)',
                                    boxShadow: '0 8px 16px -4px rgba(123, 79, 46, 0.4)'
                                }}
                                onClick={handleGenerate}
                                disabled={!input.trim() || isStreaming}
                            >
                                {isStreaming ? (
                                    <>
                                        <IconLoader2 size={20} className="animate-spin" />
                                        <span>Génération {modeConfig.label}...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconCode size={20} />
                                        <span>Générer le code</span>
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="flex items-start gap-3 mt-4 text-sm text-[var(--color-terracotta-dark)] bg-[rgba(231,111,81,0.1)] border border-[rgba(231,111,81,0.2)] p-4 rounded-xl">
                                    <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne de droite (3/5) : Résultat */}
                    <div className="lg:col-span-3 flex flex-col h-full bg-[#1E1E1E] rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-[#333]">
                        {/* Header de l'éditeur */}
                        <div className="bg-[#2D2D2D] px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-[#3A3A3A]">
                            <div className="flex flex-col">
                                <span className="text-white font-medium text-[14px]">{(output || isStreaming) ? 'Résultat de la génération' : 'Terminal en attente'}</span>
                                {(output || isStreaming) && (
                                    <span className="text-[#A0A0A0] text-[11px] mt-0.5">{modeConfig.model}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    className="p-2.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A] transition-colors" 
                                    onClick={handleCopy}
                                    title="Copier tout le format markdown"
                                >
                                    <IconCopy size={16} />
                                </button>
                                <button
                                    className="p-2.5 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A] transition-colors flex items-center gap-2 text-sm font-medium"
                                    onClick={() => {
                                        setOutput('');
                                        setInput('');
                                        setError(null);
                                    }}
                                >
                                    <IconRefresh size={16} />
                                    <span className="hidden sm:inline">Effacer</span>
                                </button>
                            </div>
                        </div>

                        {/* Corps de l'éditeur */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar scroll-smooth">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#888]">
                                    <IconLoader2 size={32} className="animate-spin text-[var(--color-gold)]" />
                                    <p className="text-[15px] font-medium animate-pulse text-[#BBB]">Le modèle analyse votre demande...</p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-invert prose-pre:bg-[#151515] prose-pre:border prose-pre:border-[#333] max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#555]">
                                    <div className="w-16 h-16 rounded-full border border-[#444] bg-[#252525] flex items-center justify-center">
                                        <IconCode size={28} className="text-[#666]" />
                                    </div>
                                    <p className="text-[15px] font-medium text-[#777]">Le résultat de votre requête s&apos;affichera ici.</p>
                                    <p className="text-[13px] text-[#555] max-w-sm text-center mt-2">
                                        Le code sera formaté avec coloration syntaxique.
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
