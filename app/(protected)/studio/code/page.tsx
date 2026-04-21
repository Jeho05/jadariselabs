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
    IconSparkles,
    IconRocket,
    IconLightbulb,
    IconFileText,
    IconCheck,
    IconChevronDown,
    IconDownload,
    IconFolder,
    IconGlobe,
    IconEdit,
    IconShield,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import {
    CODE_TEMPLATES,
    CODE_CATEGORIES,
    STACK_OPTIONS,
    COMPLEXITY_OPTIONS,
    QUICK_SUGGESTIONS,
    calculateCodeCredits,
    type CodeDeliverable,
    type CodeComplexity,
    type CodeTemplate,
} from '@/lib/prompts/code-templates';

type StudioMode = 'quick' | 'project';
type CodeMessage = { role: 'user' | 'assistant'; content: string };

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    app: IconCode,
    cahier: IconFileText,
    plan: IconFolder,
    ideas: IconLightbulb,
    architecture: IconShield,
    docs: IconEdit,
    audit: IconGlobe,
};

export default function CodeStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    // Core state
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<StudioMode>('quick');

    // Template & config state
    const [selectedCategory, setSelectedCategory] = useState<CodeDeliverable | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
    const [stack, setStack] = useState('');
    const [complexity, setComplexity] = useState<CodeComplexity>('standard');
    const [context, setContext] = useState('');
    const [systemInstruction, setSystemInstruction] = useState('');

    // Input/output state
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [history, setHistory] = useState<CodeMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Metadata from server
    const [genMeta, setGenMeta] = useState<{
        provider?: string;
        model?: string;
        credits_used?: number;
        remaining_credits?: number;
    } | null>(null);

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
        fetchProfile();
    }, [supabase]);

    // Auto-scroll output
    useEffect(() => {
        if (!output) return;
        const container = outputRef.current?.parentElement;
        if (!container) return;
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
        if (isNearBottom) {
            outputRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [output]);

    // Credits calculation
    const creditsNeeded = mode === 'project'
        ? calculateCodeCredits(selectedTemplate, complexity)
        : 1;

    // Filtered templates
    const filteredTemplates = selectedCategory
        ? CODE_TEMPLATES.filter((t) => t.category === selectedCategory)
        : CODE_TEMPLATES;

    // === GENERATE ===
    const handleGenerate = async () => {
        if (!input.trim() || isStreaming) return;

        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Il vous faut ${creditsNeeded} crédit(s).`);
            return;
        }

        setIsStreaming(true);
        setError(null);
        setOutput('');
        setGenMeta(null);

        const userMessage = { role: 'user' as const, content: input.trim() };
        const historyPayload = history.slice(-6);

        try {
            const res = await fetch('/api/generate/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: historyPayload,
                    templateId: mode === 'project' ? selectedTemplate?.id : undefined,
                    stack: mode === 'project' ? stack : undefined,
                    complexity: mode === 'project' ? complexity : undefined,
                    context: mode === 'project' ? context.trim() || undefined : undefined,
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
                                if (parsed.meta) {
                                    setGenMeta(parsed.meta);
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

            setHistory((prev) => [...prev, userMessage, { role: 'assistant', content: fullContent }]);
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setIsStreaming(false);
        }
    };

    // === ACTIONS ===
    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // no-op
        }
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedTemplate
            ? `${selectedTemplate.id}-${Date.now()}.md`
            : `jadacode-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setOutput('');
        setInput('');
        setError(null);
        setGenMeta(null);
    };

    const handleNewSession = () => {
        handleClear();
        setHistory([]);
        setSelectedCategory(null);
        setSelectedTemplate(null);
        setStack('');
        setComplexity('standard');
        setContext('');
        setSystemInstruction('');
    };

    const selectTemplate = (template: CodeTemplate) => {
        setSelectedTemplate(template);
        setStack(template.defaultStack);
        setComplexity(template.defaultComplexity);
    };

    // === LOADING STATE ===
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
        <div className="min-h-screen bg-gradient-to-b from-[var(--color-cream)] via-[var(--color-cream)] to-white relative overflow-hidden">
            {/* Background */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            <div className="absolute top-[12%] left-[-12%] w-[42%] h-[42%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.10] pointer-events-none" />
            <div className="absolute bottom-[2%] right-[-10%] w-[38%] h-[48%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.09] pointer-events-none" />
            <div className="absolute top-[52%] left-[52%] w-[22%] h-[22%] bg-[var(--color-savanna)] rounded-full blur-[100px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* === HEADER === */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium earth shadow-lg" style={{
                            background: 'linear-gradient(135deg, var(--color-earth) 0%, #A0714D 50%, var(--color-gold) 100%)',
                        }}>
                            <IconCode size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Studio Code Pro
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-0.5 leading-snug">
                                Apps, cahiers des charges, plans d&apos;action, architecture et plus
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {profile && (
                            <div className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-[14px] bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                                <IconZap size={18} className="text-[var(--color-earth)]" />
                                <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* === MODE SELECTOR === */}
                <div className="mb-6">
                    <div className="inline-flex rounded-2xl bg-white/55 backdrop-blur-md border border-white/70 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={() => setMode('quick')}
                        disabled={isStreaming}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] font-semibold text-sm transition-all ${
                            mode === 'quick'
                                ? 'bg-[var(--color-earth)] text-white shadow-[0_10px_24px_rgba(123,79,46,0.25)]'
                                : 'text-gray-700 hover:bg-white/70'
                        }`}
                    >
                        <IconRocket size={18} />
                        <span>Mode rapide</span>
                    </button>
                    <button
                        onClick={() => setMode('project')}
                        disabled={isStreaming}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] font-semibold text-sm transition-all ${
                            mode === 'project'
                                ? 'bg-[var(--color-earth)] text-white shadow-[0_10px_24px_rgba(123,79,46,0.25)]'
                                : 'text-gray-700 hover:bg-white/70'
                        }`}
                    >
                        <IconSparkles size={18} />
                        <span>Mode projet</span>
                    </button>
                    </div>
                </div>

                {/* === MAIN GRID === */}
                <div className="grid lg:grid-cols-5 gap-6 gap-y-8">
                    {/* === LEFT PANEL (2/5) === */}
                    <div className="lg:col-span-2 flex flex-col gap-5 lg:max-h-[calc(100vh-220px)] overflow-y-auto hide-scrollbar pb-6">

                        {/* Category Selection (Project Mode) */}
                        {mode === 'project' && (
                            <div className="glass-card-premium rounded-[22px] p-5 shadow-sm border border-white/70">
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-3 block">
                                    Type de livrable
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CODE_CATEGORIES.map((cat) => {
                                        const CatIcon = CATEGORY_ICONS[cat.id] || IconCode;
                                        const isSelected = selectedCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setSelectedCategory(isSelected ? null : cat.id);
                                                    if (!isSelected) setSelectedTemplate(null);
                                                }}
                                                disabled={isStreaming}
                                                className={`p-3.5 rounded-2xl text-left transition-all flex items-start gap-2.5 ${
                                                    isSelected
                                                        ? 'bg-[var(--color-earth)]/10 border-2 border-[var(--color-earth)] shadow-sm'
                                                        : 'bg-white/50 border-2 border-transparent hover:bg-white/80 hover:border-gray-200'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-[var(--color-earth)]/20' : 'bg-gray-100'
                                                }`}>
                                                    <CatIcon size={16} className={isSelected ? 'text-[var(--color-earth-dark)]' : 'text-gray-500'} />
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-[13px] leading-tight ${isSelected ? 'text-[var(--color-earth-dark)]' : 'text-gray-800'}`}>
                                                        {cat.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{cat.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Template Selection (Project Mode + Category Selected) */}
                        {mode === 'project' && selectedCategory && (
                            <div className="glass-card-premium rounded-[22px] p-5 shadow-sm border border-white/70">
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-3 block">
                                    Template
                                </label>
                                <div className="space-y-2 max-h-44 overflow-y-auto hide-scrollbar">
                                    {filteredTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => selectTemplate(template)}
                                            disabled={isStreaming}
                                            className={`w-full text-left p-3.5 rounded-2xl transition-all ${
                                                selectedTemplate?.id === template.id
                                                    ? 'bg-[var(--color-earth)]/10 border-2 border-[var(--color-earth)]'
                                                    : 'bg-white/50 border-2 border-transparent hover:bg-white/80 hover:border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className={`font-bold text-sm ${selectedTemplate?.id === template.id ? 'text-[var(--color-earth-dark)]' : 'text-gray-800'}`}>
                                                    {template.name}
                                                </p>
                                                <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                                                    {template.creditsBase}+ cr.
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Configuration (Project Mode + Template Selected) */}
                        {mode === 'project' && selectedTemplate && (
                            <div className="glass-card-premium rounded-[22px] p-5 shadow-sm border border-white/70 space-y-4">
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] block">
                                    Configuration
                                </label>

                                {/* Stack */}
                                {['app', 'architecture', 'audit'].includes(selectedTemplate.category) && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                                            Stack technique
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={stack}
                                                onChange={(e) => setStack(e.target.value)}
                                                disabled={isStreaming}
                                                className="w-full p-3 pr-8 rounded-2xl border border-gray-200/80 bg-white/80 text-sm appearance-none focus:outline-none focus:border-[var(--color-earth)] focus:ring-4 focus:ring-[var(--color-earth)]/10 transition"
                                            >
                                                {STACK_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {/* Complexity */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                                        Complexité
                                    </label>
                                    <div className="flex gap-2">
                                        {COMPLEXITY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setComplexity(opt.value)}
                                                disabled={isStreaming}
                                                className={`flex-1 p-2.5 rounded-2xl text-center transition-all border-2 ${
                                                    complexity === opt.value
                                                        ? 'border-[var(--color-earth)] bg-[var(--color-earth)]/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <p className="font-bold text-xs">{opt.label}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{opt.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Context */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-2">
                                        Contexte additionnel
                                        <span className="text-[10px] font-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                                    </label>
                                    <textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        placeholder="Détails importants : contraintes, références, cible, budget..."
                                        rows={3}
                                        maxLength={2000}
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-2xl border border-gray-200/80 bg-white/60 focus:outline-none focus:border-[var(--color-earth)] focus:ring-4 focus:ring-[var(--color-earth)]/10 transition resize-none text-[13px]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* === MAIN INPUT === */}
                        <div className="glass-card-premium rounded-[22px] p-5 shadow-sm border border-white/70 space-y-4">
                            {/* System instruction */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                                    Instructions système
                                    <span className="text-[10px] font-normal normal-case tracking-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-2xl border border-gray-200/80 bg-white/60 focus:outline-none focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[var(--color-gold)]/10 transition-colors resize-none text-[13px] leading-relaxed text-gray-700 placeholder-gray-400"
                                    value={systemInstruction}
                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                    placeholder="Ex: Utilise les conventions du projet existant. Commente en français..."
                                    rows={2}
                                    maxLength={1000}
                                    disabled={isStreaming}
                                />
                            </div>

                            {/* Main prompt */}
                            <div>
                                <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-2 block">
                                    {mode === 'project' && selectedTemplate
                                        ? `Décrivez votre ${selectedTemplate.name.toLowerCase()}`
                                        : 'Votre demande'}
                                </label>
                                <div className="relative">
                                    <textarea
                                        className="w-full p-4 pb-10 rounded-[22px] border-2 border-gray-100/80 bg-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[var(--color-earth)] focus:ring-4 focus:ring-[var(--color-earth)]/10 transition-all resize-none text-[15px] leading-relaxed text-gray-800 placeholder-gray-400"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleGenerate();
                                            }
                                        }}
                                        placeholder={
                                            mode === 'project' && selectedTemplate
                                                ? `Décrivez en détail votre projet pour générer un(e) ${selectedTemplate.name.toLowerCase()}...`
                                                : 'Décrivez ce que vous voulez : une app, un cahier des charges, un plan, des idées...'
                                        }
                                        rows={5}
                                        maxLength={8000}
                                        disabled={isStreaming}
                                    />
                                    <div className="absolute bottom-3 right-4 text-[11px] font-medium text-gray-400">
                                        {input.length}/8000
                                    </div>
                                </div>
                            </div>

                            {/* Generate button */}
                            <button
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[18px] font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-earth) 0%, #5a3520 50%, var(--color-gold) 100%)',
                                    boxShadow: '0 8px 20px -4px rgba(123, 79, 46, 0.5)',
                                }}
                                onClick={handleGenerate}
                                disabled={!input.trim() || isStreaming}
                            >
                                {isStreaming ? (
                                    <>
                                        <IconLoader2 size={20} className="animate-spin" />
                                        <span>Génération en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconSparkles size={20} />
                                        <span>
                                            Générer
                                            {creditsNeeded > 1 ? ` (${creditsNeeded} crédits)` : ' (1 crédit)'}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-3 text-sm text-[var(--color-terracotta-dark)] bg-[rgba(231,111,81,0.1)] border border-[rgba(231,111,81,0.2)] p-4 rounded-xl">
                                    <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <span className="leading-snug">{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Suggestions (Quick Mode Only) */}
                        {mode === 'quick' && !output && !isStreaming && (
                            <div className="glass-card-premium rounded-[22px] p-5 shadow-sm border border-white/70">
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                                    <IconLightbulb size={16} className="text-[var(--color-gold)]" />
                                    Suggestions rapides
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInput(suggestion)}
                                            disabled={isStreaming}
                                            className="px-3 py-2 bg-white/60 hover:bg-white/90 border border-gray-200/80 hover:border-[var(--color-earth)] rounded-2xl text-xs text-gray-700 hover:text-gray-900 transition-all leading-snug"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* === RIGHT PANEL (3/5) — Output === */}
                    <div className="lg:col-span-3 flex flex-col min-h-[450px] lg:h-[calc(100vh-220px)] bg-[#0B1020] rounded-[24px] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.65)] overflow-hidden border border-white/10">
                        {/* Editor Header */}
                        <div className="bg-[#0A0F1E] px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-white/10">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                                        <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
                                        <div className="w-3 h-3 rounded-full bg-[#6BCB77]" />
                                    </div>
                                    <span className="text-white/90 font-medium text-[13px]">
                                        {output || isStreaming
                                            ? selectedTemplate
                                                ? selectedTemplate.name
                                                : 'Résultat'
                                            : 'Studio Code Pro'}
                                    </span>
                                </div>
                                {genMeta && (
                                    <span className="text-[11px] text-white/40 mt-1 ml-[54px]">
                                        {genMeta.model} • via {genMeta.provider}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    className={`p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5 ${
                                        copied
                                            ? 'text-[#6BCB77] bg-[#6BCB77]/10'
                                            : 'text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                                    onClick={handleCopy}
                                    title="Copier tout"
                                    disabled={!output}
                                >
                                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                    <span className="hidden sm:inline text-xs">{copied ? 'Copié !' : 'Copier'}</span>
                                </button>
                                <button
                                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                                    onClick={handleDownload}
                                    title="Télécharger en .md"
                                    disabled={!output}
                                >
                                    <IconDownload size={14} />
                                    <span className="hidden sm:inline text-xs">.md</span>
                                </button>
                                <div className="w-px h-5 bg-white/10 mx-1" />
                                <button
                                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                                    onClick={handleClear}
                                >
                                    <IconRefresh size={14} />
                                    <span className="hidden sm:inline text-xs">Effacer</span>
                                </button>
                                <button
                                    className="p-2 rounded-lg text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors flex items-center gap-1.5"
                                    onClick={handleNewSession}
                                    title="Nouvelle session"
                                >
                                    <IconRocket size={14} />
                                    <span className="hidden sm:inline text-xs">Nouveau</span>
                                </button>
                            </div>
                        </div>

                        {/* Editor Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar scroll-smooth">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-[var(--color-gold)]/30 flex items-center justify-center">
                                            <IconLoader2 size={28} className="animate-spin text-[var(--color-gold)]" />
                                        </div>
                                        <div className="absolute -inset-3 rounded-full border border-[var(--color-gold)]/10 animate-ping" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[15px] font-medium text-white/70">
                                            {selectedTemplate
                                                ? `Génération : ${selectedTemplate.name}...`
                                                : 'L\'IA analyse votre demande...'}
                                        </p>
                                        <p className="text-[12px] text-white/30 mt-1">
                                            Multi-provider intelligent • Meilleur résultat possible
                                        </p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="prose prose-invert prose-pre:bg-[#070B18] prose-pre:border prose-pre:border-white/10 max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5">
                                    <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                                        <IconCode size={36} className="text-white/20" />
                                    </div>
                                    <div className="text-center max-w-md">
                                        <p className="text-[16px] font-bold text-white/60 mb-2">
                                            Bienvenue dans le Studio Code Pro
                                        </p>
                                        <p className="text-[13px] text-white/30 leading-relaxed">
                                            Générez des applications complètes, cahiers des charges, plans d&apos;action,
                                            architecture technique, documentation et plus — le tout propulsé par les meilleurs modèles IA.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2 justify-center max-w-md">
                                        {['Application', 'Cahier des charges', 'Plan d\'action', 'Architecture', 'Brainstorming'].map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 rounded-full bg-white/5 text-white/40 text-[11px] font-medium border border-white/10"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Editor Footer — Provider info */}
                        {(output || isStreaming) && (
                            <div className="bg-[#0A0F1E] px-5 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/30 shrink-0">
                                <div className="flex items-center gap-3">
                                    {isStreaming && (
                                        <span className="flex items-center gap-1.5 text-[var(--color-gold)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] animate-pulse" />
                                            Streaming…
                                        </span>
                                    )}
                                    {genMeta?.credits_used && (
                                        <span>{genMeta.credits_used} crédit{genMeta.credits_used > 1 ? 's' : ''} utilisé{genMeta.credits_used > 1 ? 's' : ''}</span>
                                    )}
                                </div>
                                <span>JadaRiseLabs • Studio Code Pro</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
