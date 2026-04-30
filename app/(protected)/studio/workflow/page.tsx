'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconWand2, IconArrowRight, IconTrash, IconPlus
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type StepType = 'summarize' | 'translate_en' | 'translate_fr' | 'email' | 'action_items';

const AVAILABLE_STEPS: { id: StepType; label: string; icon: string; desc: string }[] = [
    { id: 'summarize', label: 'Résumé', icon: '📝', desc: 'Résumer le texte' },
    { id: 'translate_en', label: 'Traduction (Anglais)', icon: '🇬🇧', desc: 'Traduire vers l\'Anglais' },
    { id: 'translate_fr', label: 'Traduction (Français)', icon: '🇫🇷', desc: 'Traduire vers le Français' },
    { id: 'email', label: 'Brouillon Email', icon: '📧', desc: 'Rédiger un email formel' },
    { id: 'action_items', label: 'Actions à faire', icon: '✅', desc: 'Extraire les tâches' },
];

export default function WorkflowStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [inputText, setInputText] = useState('');
    const [workflowSteps, setWorkflowSteps] = useState<StepType[]>(['summarize', 'translate_en']);
    
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

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

    const handleAddStep = (step: StepType) => {
        if (workflowSteps.length >= 5) {
            setError("Maximum 5 étapes autorisées par workflow.");
            return;
        }
        setWorkflowSteps([...workflowSteps, step]);
        setError(null);
    };

    const handleRemoveStep = (index: number) => {
        setWorkflowSteps(workflowSteps.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!inputText.trim() || workflowSteps.length === 0 || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');
        setCurrentStepIndex(0);

        try {
            const res = await fetch('/api/workflow', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: inputText, steps: workflowSteps })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.details || data.error || 'Une erreur est survenue');
                setIsStreaming(false);
                setCurrentStepIndex(null);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

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
                                if (parsed.type === 'meta' && profile) {
                                    setProfile({ ...profile, credits: parsed.remaining_credits });
                                } else if (parsed.type === 'progress') {
                                    setCurrentStepIndex(parsed.stepIndex);
                                    if (parsed.status === 'done') {
                                        setOutput(parsed.result); // Show intermediate result
                                    }
                                } else if (parsed.type === 'done') {
                                    setOutput(parsed.finalResult);
                                    setCurrentStepIndex(null);
                                } else if (parsed.type === 'error') {
                                    setError(parsed.message);
                                    setCurrentStepIndex(null);
                                }
                            } catch { /* skip */ }
                        }
                    }
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion.');
            setCurrentStepIndex(null);
        } finally {
            setIsStreaming(false);
            setCurrentStepIndex(null);
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

    const isFormValid = inputText.trim().length > 0 && workflowSteps.length > 0;
    const creditsRequired = workflowSteps.length;

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-fuchsia-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                            <IconWand2 size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Mini-Workflows
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Enchaînez plusieurs actions IA automatiquement.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-purple-600" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
                    {/* Left Panel - Workflow Builder */}
                    <div className="space-y-5">
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconWand2 size={16} className="text-purple-600" />
                                Construire la séquence
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Texte de départ *</label>
                                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Collez ici le texte source (ex: un long email, un article)..." rows={4} disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Séquence ({workflowSteps.length}/5)</label>
                                    
                                    <div className="flex flex-col gap-2 mb-4 bg-purple-50/50 p-3 rounded-xl border border-purple-100 min-h-[100px]">
                                        {workflowSteps.length === 0 && (
                                            <div className="text-sm text-purple-400 text-center py-4 italic">Aucune étape. Ajoutez-en une ci-dessous.</div>
                                        )}
                                        {workflowSteps.map((stepId, index) => {
                                            const step = AVAILABLE_STEPS.find(s => s.id === stepId)!;
                                            return (
                                                <div key={index} className={`flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm transition-all ${currentStepIndex === index ? 'border-purple-500 shadow-purple-100 ring-1 ring-purple-500' : 'border-gray-200'}`}>
                                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-xl">{step.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-gray-800">{step.label}</div>
                                                    </div>
                                                    {currentStepIndex === index ? (
                                                        <IconLoader2 size={16} className="text-purple-500 animate-spin" />
                                                    ) : (
                                                        <button onClick={() => handleRemoveStep(index)} disabled={isStreaming} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30">
                                                            <IconTrash size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {AVAILABLE_STEPS.map(step => (
                                            <button key={step.id} onClick={() => handleAddStep(step.id)} disabled={isStreaming || workflowSteps.length >= 5}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50 group text-center">
                                                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{step.icon}</span>
                                                <span className="text-xs font-semibold text-gray-700">{step.label}</span>
                                            </button>
                                        ))}
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

                        <button onClick={handleGenerate} disabled={!isFormValid || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                                boxShadow: '0 8px 16px -4px rgba(168, 85, 247, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Exécution du workflow...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>Lancer la séquence ({creditsRequired} crédit{creditsRequired > 1 ? 's' : ''})</span></>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className="text-purple-600" />
                                <span className="text-gray-700 font-semibold text-sm">
                                    {isStreaming && currentStepIndex !== null ? `Étape ${currentStepIndex + 1}/${workflowSteps.length} en cours...` : 'Résultat final'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && !isStreaming && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center border-2 border-dashed border-purple-200">
                                        <IconWand2 size={32} className="text-purple-300" />
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Prêt à exécuter</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Le résultat de chaque étape deviendra l&apos;entrée de l&apos;étape suivante. Le résultat final apparaîtra ici.
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
