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
            setError('Erreur rÃ©seau. VÃ©rifiez votre connexion et rÃ©essayez.');
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
            <div className="code-studio">
                <div className="code-studio-loading">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    const modeConfig = CODE_MODES.find((m) => m.id === mode) || CODE_MODES[0];

    return (
        <div className="code-studio">
            <div className="code-studio-bg">
                <div className="code-studio-bg-orb orb-1" />
                <div className="code-studio-bg-orb orb-2" />
            </div>

            <div className="code-studio-content">
                <div className="code-studio-header">
                    <div className="code-studio-header-left">
                        <div className="module-icon-premium savanna">
                            <IconCode size={28} />
                        </div>
                        <div>
                            <h1>Assistant Code</h1>
                            <p>Planification, dÃ©bogage et refactoring assistÃ©s.</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="code-studio-credits">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? 'âˆž' : profile.credits} crÃ©dits</span>
                        </div>
                    )}
                </div>

                <div className="code-studio-grid">
                    <div className="code-studio-controls">
                        <div className="code-studio-section">
                            <label className="code-studio-label">Mode</label>
                            <div className="code-studio-mode-grid">
                                {CODE_MODES.map((m) => (
                                    <button
                                        key={m.id}
                                        className={`code-studio-mode-btn ${mode === m.id ? 'active' : ''}`}
                                        onClick={() => setMode(m.id)}
                                        disabled={isStreaming}
                                    >
                                        <span className="code-studio-mode-label">{m.label}</span>
                                        <span className="code-studio-mode-hint">{m.model} â€¢ {m.hint}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="code-studio-section">
                            <label className="code-studio-label">Votre demande</label>
                            <textarea
                                className="code-studio-textarea"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ex: CrÃ©e une API Next.js avec un endpoint POST /tasks et validation Zod."
                                rows={6}
                                maxLength={6000}
                                disabled={isStreaming}
                            />
                            <div className="code-studio-char-count">{input.length}/6000</div>
                        </div>

                        <button
                            className="code-studio-generate-btn"
                            onClick={handleGenerate}
                            disabled={!input.trim() || isStreaming}
                        >
                            {isStreaming ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    {modeConfig.label} en cours...
                                </>
                            ) : (
                                <>
                                    <IconCode size={18} />
                                    GÃ©nÃ©rer une rÃ©ponse
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="code-studio-error">
                                <IconAlertCircle size={18} />
                                <span>{error}</span>
                                <button onClick={() => setError(null)}>âœ•</button>
                            </div>
                        )}
                    </div>

                    <div className="code-studio-output-panel">
                        {isStreaming && !output ? (
                            <div className="code-studio-empty">
                                <IconLoader2 size={24} className="animate-spin" />
                                <p>RÃ©ponse en cours...</p>
                            </div>
                        ) : output ? (
                            <>
                                <div className="code-studio-output-header">
                                    <span>{modeConfig.label} â€¢ {modeConfig.model}</span>
                                    <div className="code-studio-output-actions">
                                        <button className="btn-secondary" onClick={handleCopy}>
                                            <IconCopy size={16} />
                                            Copier
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={() => {
                                                setOutput('');
                                                setInput('');
                                                setError(null);
                                            }}
                                        >
                                            <IconRefresh size={16} />
                                            Nouveau
                                        </button>
                                    </div>
                                </div>
                                <div className="code-studio-output-body">
                                    <ChatMessageContent content={output} />
                                </div>
                            </>
                        ) : (
                            <div className="code-studio-empty">
                                <IconCode size={24} />
                                <p>Le rÃ©sultat apparaÃ®tra ici.</p>
                            </div>
                        )}
                        <div ref={outputRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
