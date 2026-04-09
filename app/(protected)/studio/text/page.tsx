'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconText,
    IconZap,
    IconLoader2,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
    IconSparkles,
    IconRocket,
    IconSettings2,
    IconFileText,
    IconLightbulb,
    IconTarget,
    IconFilm,
    IconBriefcase,
    IconChevronDown,
    IconCheck,
    IconWand2,
    IconRepeat,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import {
    TEXT_TEMPLATES,
    TEXT_CATEGORIES,
    TONE_OPTIONS,
    LENGTH_OPTIONS,
    AUDIENCE_OPTIONS,
    type TextTemplate,
} from '@/lib/prompts/text-templates';

type GenerationMode = 'quick' | 'expert';
type OutputFormat = 'single' | 'multi';

const MODE_CONFIG: Record<GenerationMode, { label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    quick: {
        label: 'Mode rapide',
        description: 'Résultat immédiat sans configuration',
        icon: IconRocket,
    },
    expert: {
        label: 'Mode expert',
        description: 'Contrôle total des paramètres',
        icon: IconSettings2,
    },
};

export default function TextStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Mode & generation state
    const [mode, setMode] = useState<GenerationMode>('quick');
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('single');
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Template selection
    const [selectedTemplate, setSelectedTemplate] = useState<TextTemplate | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    // Input fields
    const [topic, setTopic] = useState('');
    const [context, setContext] = useState('');
    const [tone, setTone] = useState('professionnel');
    const [length, setLength] = useState('moyen');
    const [audience, setAudience] = useState('grand public');
    
    // History
    const [history, setHistory] = useState<Array<{ topic: string; output: string; date: string }>>([]);

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
        if (!output) return;
        const container = outputRef.current?.parentElement;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, [output]);

    const calculateCredits = () => {
        const baseCredits = length === 'long' ? 2 : 1;
        return outputFormat === 'multi' ? baseCredits * 3 : baseCredits;
    };

    const handleGenerate = async () => {
        if (!topic.trim() || isStreaming) return;
        
        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Il vous faut ${creditsNeeded} crédit(s).`);
            return;
        }

        setIsStreaming(true);
        setError(null);
        setOutput('');

        try {
            const res = await fetch('/api/generate/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: selectedTemplate?.id || null,
                    topic: topic.trim(),
                    context: context.trim(),
                    tone,
                    length,
                    audience,
                    mode,
                    multiOutput: outputFormat === 'multi',
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
            let metaData: { credits_used?: number; remaining_credits?: number } | null = null;

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
                                    metaData = parsed.meta;
                                    if (profile && metaData?.remaining_credits !== undefined) {
                                        setProfile({ ...profile, credits: metaData.remaining_credits });
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

            // Save to history
            setHistory(prev => [{
                topic: topic.trim(),
                output: fullContent,
                date: new Date().toLocaleDateString('fr-FR'),
            }, ...prev].slice(0, 10));

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

    const handleClear = () => {
        setOutput('');
        setError(null);
        setTopic('');
        setContext('');
    };

    const selectTemplate = (template: TextTemplate) => {
        setSelectedTemplate(template);
        setTone(template.defaultParams.tone);
        setLength(template.defaultParams.length);
        setAudience(template.defaultParams.audience);
    };

    const getCategoryIcon = (categoryId: string) => {
        switch (categoryId) {
            case 'writing': return IconFileText;
            case 'marketing': return IconTarget;
            case 'ideas': return IconLightbulb;
            case 'scripts': return IconFilm;
            case 'professional': return IconBriefcase;
            default: return IconText;
        }
    };

    const filteredTemplates = selectedCategory === 'all' 
        ? TEXT_TEMPLATES 
        : TEXT_TEMPLATES.filter(t => t.category === selectedCategory);

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
            <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-savanna)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium savanna shadow-lg">
                            <IconText size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Générateur universel
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Textes pour tous usages avec mode expert
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-savanna)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits restants</span>
                        </div>
                    )}
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 mb-6">
                    {(Object.keys(MODE_CONFIG) as GenerationMode[]).map((m) => {
                        const config = MODE_CONFIG[m];
                        const Icon = config.icon;
                        return (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                disabled={isStreaming}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                    mode === m
                                        ? 'bg-[var(--color-savanna)] text-white shadow-md'
                                        : 'bg-white/50 text-gray-600 hover:bg-white'
                                }`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{config.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Panel - Inputs */}
                    <div className="space-y-6">
                        {/* Template Selection (Expert Mode) */}
                        {mode === 'expert' && (
                            <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <IconWand2 size={18} className="text-[var(--color-savanna)]" />
                                    <h3 className="font-bold text-gray-800">Template (optionnel)</h3>
                                </div>
                                
                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            selectedCategory === 'all'
                                                ? 'bg-[var(--color-savanna)] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Tous
                                    </button>
                                    {TEXT_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                selectedCategory === cat.id
                                                    ? 'bg-[var(--color-savanna)] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Templates Grid */}
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto hide-scrollbar">
                                    {filteredTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => selectTemplate(template)}
                                            className={`p-3 rounded-xl text-left transition-all ${
                                                selectedTemplate?.id === template.id
                                                    ? 'bg-[var(--color-savanna)]/10 border-2 border-[var(--color-savanna)]'
                                                    : 'bg-white/50 border-2 border-transparent hover:border-gray-200'
                                            }`}
                                        >
                                            <p className="font-medium text-sm text-gray-800">{template.name}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{template.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Input Card */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <div className="space-y-5">
                                {/* Topic Input */}
                                <div>
                                    <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                                        {selectedTemplate ? selectedTemplate.name : 'Votre sujet'}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder={selectedTemplate 
                                            ? `Décrivez ce que vous voulez générer...`
                                            : "Décrivez ce dont vous avez besoin (email, article, idées, script...)"
                                        }
                                        rows={4}
                                        maxLength={2000}
                                        disabled={isStreaming}
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:outline-none focus:border-[var(--color-savanna)] focus:ring-4 focus:ring-[var(--color-savanna)]/10 transition-all resize-none text-[15px] leading-relaxed"
                                    />
                                    <div className="text-right text-xs text-gray-400 mt-1">
                                        {topic.length}/2000
                                    </div>
                                </div>

                                {/* Context (Expert Mode) */}
                                {mode === 'expert' && (
                                    <div>
                                        <label className="text-[13px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                                            Contexte additionnel
                                            <span className="text-[10px] font-normal normal-case tracking-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                                        </label>
                                        <textarea
                                            value={context}
                                            onChange={(e) => setContext(e.target.value)}
                                            placeholder="Ajoutez des détails importants : nom du produit, contraintes, exemples de ce que vous aimez..."
                                            rows={3}
                                            maxLength={1000}
                                            disabled={isStreaming}
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white/50 focus:outline-none focus:border-[var(--color-savanna)] transition-all resize-none text-[14px]"
                                        />
                                    </div>
                                )}

                                {/* Expert Options */}
                                {mode === 'expert' && (
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        {/* Tone */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">Ton</label>
                                            <div className="relative">
                                                <select
                                                    value={tone}
                                                    onChange={(e) => setTone(e.target.value)}
                                                    disabled={isStreaming}
                                                    className="w-full p-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[var(--color-savanna)]"
                                                >
                                                    {TONE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Length */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">Longueur</label>
                                            <div className="relative">
                                                <select
                                                    value={length}
                                                    onChange={(e) => setLength(e.target.value)}
                                                    disabled={isStreaming}
                                                    className="w-full p-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[var(--color-savanna)]"
                                                >
                                                    {LENGTH_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label} ({opt.credits} crédit{opt.credits > 1 ? 's' : ''})
                                                        </option>
                                                    ))}
                                                </select>
                                                <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Audience */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">Public</label>
                                            <div className="relative">
                                                <select
                                                    value={audience}
                                                    onChange={(e) => setAudience(e.target.value)}
                                                    disabled={isStreaming}
                                                    className="w-full p-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[var(--color-savanna)]"
                                                >
                                                    {AUDIENCE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Output Format */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Format de sortie</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setOutputFormat('single')}
                                            disabled={isStreaming}
                                            className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                                                outputFormat === 'single'
                                                    ? 'border-[var(--color-savanna)] bg-[var(--color-savanna)]/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <p className="font-medium text-sm">Une version</p>
                                            <p className="text-xs text-gray-500">{creditsNeeded === calculateCredits() ? calculateCredits() : calculateCredits() / 3} crédit</p>
                                        </button>
                                        <button
                                            onClick={() => setOutputFormat('multi')}
                                            disabled={isStreaming}
                                            className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                                                outputFormat === 'multi'
                                                    ? 'border-[var(--color-savanna)] bg-[var(--color-savanna)]/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <IconRepeat size={14} />
                                                <p className="font-medium text-sm">3 variantes</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{calculateCredits()} crédits</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!topic.trim() || isStreaming}
                                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-savanna) 0%, var(--color-savanna-dark) 100%)',
                                        boxShadow: '0 8px 16px -4px rgba(45, 106, 79, 0.4)',
                                    }}
                                >
                                    {isStreaming ? (
                                        <>
                                            <IconLoader2 size={20} className="animate-spin" />
                                            <span>Génération en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconSparkles size={20} />
                                            <span>Générer ({calculateCredits()} crédit{calculateCredits() > 1 ? 's' : ''})</span>
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl">
                                        <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Suggestions (Quick Mode) */}
                        {mode === 'quick' && (
                            <div className="glass-card-premium rounded-[20px] p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <IconLightbulb size={18} className="text-[var(--color-gold)]" />
                                    Suggestions rapides
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Email de relance client',
                                        'Post LinkedIn sur la productivité',
                                        'Script TikTok humoristique',
                                        'Idées de noms pour startup',
                                        'Article sur l\'entrepreneuriat africain',
                                        'Lettre de motivation stage',
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setTopic(suggestion)}
                                            disabled={isStreaming}
                                            className="px-4 py-2 bg-white/50 hover:bg-white border border-gray-200 hover:border-[var(--color-savanna)] rounded-full text-sm text-gray-600 hover:text-gray-800 transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[500px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconFileText size={18} className="text-gray-400" />
                                <span className="text-gray-700 font-medium text-sm">
                                    {output || isStreaming ? 'Résultat' : 'Aperçu'}
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
                                    onClick={handleClear}
                                    disabled={!output && !topic}
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
                                    <IconLoader2 size={32} className="animate-spin text-[var(--color-savanna)]" />
                                    <p className="text-sm font-medium">L&apos;IA rédige votre contenu...</p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                                        <IconText size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Le résultat s&apos;affichera ici</p>
                                    <p className="text-xs text-gray-400 max-w-xs text-center">
                                        Décrivez votre besoin et cliquez sur Générer
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* History (if any) */}
                {history.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <IconRepeat size={18} className="text-[var(--color-earth)]" />
                            Générations récentes
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {history.slice(0, 6).map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setTopic(item.topic);
                                        setOutput(item.output);
                                    }}
                                    className="p-4 bg-white/50 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 text-left transition-all"
                                >
                                    <p className="font-medium text-sm text-gray-800 line-clamp-1">{item.topic}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
