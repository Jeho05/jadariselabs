'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, ChatConversation, Profile } from '@/lib/types';
import {
    IconSend,
    IconNewChat,
    IconTrash,
    IconChat,
    IconZap,
    IconMenu,
    IconClose,
    IconSparkles,
    IconAlertCircle,
    IconLoader2,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type ChatMode = 'speed' | 'reasoning' | 'long';

const CHAT_MODES: Array<{ id: ChatMode; label: string; model: string; hint: string }> = [
    { id: 'speed', label: 'Rapide', model: 'Groq · LLaMA 3.3', hint: '300 t/s' },
    { id: 'reasoning', label: 'Raisonnement', model: 'DeepSeek R1', hint: 'Logique' },
    { id: 'long', label: 'Contexte long', model: 'Gemini 2.5 Flash', hint: '1M+ tokens' },
];

export default function ChatStudioPage() {
    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [mode, setMode] = useState<ChatMode>('speed');
    const [inputValue, setInputValue] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) setProfile(profileData);
            }

            try {
                const res = await fetch('/api/chat/conversations');
                if (res.ok) {
                    const data = await res.json();
                    const fetchedConversations = data.conversations || [];
                    setConversations(fetchedConversations);

                    if (fetchedConversations.length > 0 && user) {
                        setActiveConversationId(fetchedConversations[0].id);
                        const { data: convData } = await supabase
                            .from('chat_conversations')
                            .select('*')
                            .eq('id', fetchedConversations[0].id)
                            .eq('user_id', user.id)
                            .single();

                        if (convData) {
                            setMessages(convData.messages || []);
                        }
                    }
                }
            } catch {
                // Silent fail
            }

            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversation = useCallback(
        async (conversationId: string) => {
            setActiveConversationId(conversationId);
            setSidebarOpen(false);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await supabase
                .from('chat_conversations')
                .select('*')
                .eq('id', conversationId)
                .eq('user_id', user.id)
                .single();

            if (data) {
                setMessages(data.messages || []);
            }
        },
        [supabase]
    );

    const handleNewConversation = () => {
        setActiveConversationId(null);
        setMessages([]);
        setError(null);
        setSidebarOpen(false);
        inputRef.current?.focus();
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const res = await fetch(`/api/chat/conversations?id=${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeConversationId === id) {
                handleNewConversation();
            }
        }
    };

    const handleSend = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isStreaming) return;

        setError(null);
        setInputValue('');
        setIsStreaming(true);

        const userMessage: ChatMessage = {
            role: 'user',
            content: trimmed,
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
        };
        setMessages([...updatedMessages, assistantMessage]);

        try {
            const res = await fetch('/api/generate/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmed,
                    mode,
                    history: updatedMessages
                        .filter((m) => m.role !== 'system')
                        .map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(
                    errorData.details || errorData.error || 'Une erreur est survenue'
                );
                setMessages(updatedMessages);
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
                                    setMessages((prev) => {
                                        const updated = [...prev];
                                        updated[updated.length - 1] = {
                                            ...updated[updated.length - 1],
                                            content: fullContent,
                                        };
                                        return updated;
                                    });
                                }
                            } catch {
                                // Skip malformed JSON
                            }
                        }
                    }
                }
            }

            const finalMessages: ChatMessage[] = [
                ...updatedMessages,
                {
                    role: 'assistant',
                    content: fullContent,
                    timestamp: new Date().toISOString(),
                },
            ];
            setMessages(finalMessages);

            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: profile.credits - 1 });
            }

            const title =
                trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : '');

            if (activeConversationId) {
                await fetch(
                    `/api/chat/conversations?id=${activeConversationId}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: finalMessages }),
                    }
                );

                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === activeConversationId ? { ...c, updated_at: new Date().toISOString() }
                            : c
                    )
                );
            } else {
                const createRes = await fetch('/api/chat/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        messages: finalMessages,
                    }),
                });

                if (createRes.ok) {
                    const createData = await createRes.json();
                    setActiveConversationId(createData.conversation.id);
                    setConversations((prev) => [createData.conversation, ...prev]);
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
            setMessages(updatedMessages);
        }

        setIsStreaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const modeConfig = CHAT_MODES.find((m) => m.id === mode) || CHAT_MODES[0];

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
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden flex flex-col h-screen max-h-screen">
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            
            {/* Ambient glows behind cards */}
            <div className="absolute top-[10%] left-[-10%] w-[30%] h-[40%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

            <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 bg-white rounded-xl border border-[var(--color-border)] shadow-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <IconMenu size={20} className="text-[var(--color-earth-dark)]" />
                        </button>
                        <div className="module-icon-premium earth shadow-sm w-12 h-12">
                            <IconChat size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                JadaBot
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">
                                Votre assistant de conversation intelligent.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-[12px] bg-white/60 backdrop-blur-md border border-[var(--color-border)] shadow-sm">
                            <IconZap size={16} className="text-[var(--color-earth)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} <span className="hidden sm:inline">crédits restants</span></span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-0 bg-white shadow-lg rounded-[24px] border border-gray-100 p-2">
                    {/* Sidebar */}
                    <div className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-80 bg-white p-4 shadow-2xl transition-transform translate-x-0' : 'hidden'} lg:relative lg:block lg:col-span-1 lg:bg-transparent lg:p-0 lg:shadow-none lg:translate-x-0 h-full overflow-hidden flex flex-col border-r border-[var(--color-border)]`}>
                        <div className="p-4 flex flex-col h-full bg-[var(--color-cream)] rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-800 text-sm tracking-widest uppercase">Historique</h2>
                                {sidebarOpen && (
                                    <button className="lg:hidden p-1 text-gray-500 hover:text-gray-800" onClick={() => setSidebarOpen(false)}>
                                        <IconClose size={20} />
                                    </button>
                                )}
                            </div>

                            <button 
                                className="w-full btn-primary py-3 mb-4 rounded-[12px] flex items-center justify-center gap-2 text-sm"
                                onClick={handleNewConversation}
                            >
                                <IconNewChat size={18} /> Nouvelle discussion
                            </button>

                            <div className="flex-1 overflow-y-auto space-y-1 hide-scrollbar pr-1">
                                {conversations.length === 0 ? (
                                    <p className="text-sm text-center text-gray-500 mt-4 italic">Vide</p>
                                ) : (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-sm ${activeConversationId === conv.id ? 'bg-[var(--color-earth)] text-white font-medium shadow-sm' : 'hover:bg-white/60 text-gray-700'}`}
                                            onClick={() => loadConversation(conv.id)}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <IconChat size={16} className={activeConversationId === conv.id ? 'text-white/80' : 'text-gray-400'} />
                                                <span className="truncate">{conv.title}</span>
                                            </div>
                                            <button
                                                className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${activeConversationId === conv.id ? 'hover:bg-black/20 text-white' : 'hover:bg-red-50 hover:text-red-500 text-gray-400'}`}
                                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                                title="Supprimer"
                                            >
                                                <IconTrash size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="lg:col-span-3 flex flex-col h-full w-full relative">
                        {/* Mode Selectors */}
                        <div className="px-4 py-3 border-b border-[var(--color-border)] hidden sm:flex justify-center gap-2 shrink-0">
                            {CHAT_MODES.map((m) => (
                                <button
                                    key={m.id}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${mode === m.id ? 'bg-[var(--color-earth)] text-white border-[var(--color-earth)] shadow-sm' : 'bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    onClick={() => setMode(m.id)}
                                    disabled={isStreaming}
                                    type="button"
                                >
                                    <span>{m.label}</span>
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${mode === m.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{m.model.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-0 animate-[fade-in_0.5s_ease-out_forwards]">
                                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white shadow-xl shadow-[var(--color-earth)]/20 mb-6">
                                        <IconSparkles size={36} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                        Comment puis-je vous aider ?
                                    </h2>
                                    <p className="text-gray-500 text-center max-w-md mb-8">
                                        Votre assistant IA est prêt. Posez une question ou demandez de l&apos;aide pour générer, analyser ou traduire du contenu.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                                        {[
                                            '💡 Aide-moi à écrire un titre accrocheur',
                                            '🌍 Traduis ce texte en anglais',
                                            "💻 Propose une structure d'application web",
                                            '📝 Comment améliorer ma productivité ?',
                                        ].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                className="p-4 text-sm text-left bg-white border border-gray-100 hover:border-[var(--color-earth)] hover:shadow-md transition-all rounded-[16px] text-gray-700 font-medium"
                                                onClick={() => {
                                                    setInputValue(suggestion.replace(/^[^\s]+\s/, ''));
                                                    inputRef.current?.focus();
                                                }}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-10 h-10 shrink-0 rounded-[14px] bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center text-white shadow-md">
                                                    <IconSparkles size={20} />
                                                </div>
                                            )}
                                            
                                            <div className={`p-4 sm:p-5 rounded-[20px] shadow-sm ${msg.role === 'user' ? 'bg-[var(--color-earth)] text-white rounded-br-[4px]' : 'bg-[#F9FAFB] border border-gray-100 rounded-bl-[4px] text-gray-800'}`}>
                                                {msg.content ? (
                                                    <div className={msg.role === 'user' ? 'text-[15px] leading-relaxed whitespace-pre-wrap' : 'prose prose-sm sm:prose-base prose-p:leading-relaxed max-w-none text-[15px]'}>
                                                        <ChatMessageContent content={msg.content} isUser={msg.role === 'user'} />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 h-6">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                )}
                                                {msg.timestamp && msg.content && (
                                                    <div className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                                                        {formatTime(msg.timestamp)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-[var(--color-border)] shrink-0">
                            {error && (
                                <div className="mb-3 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl flex items-center justify-between border border-red-100">
                                    <span className="flex items-center gap-2"><IconAlertCircle size={16} /> {error}</span>
                                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700"><IconClose size={16} /></button>
                                </div>
                            )}
                            
                            <div className="relative flex items-end gap-2 bg-[#F3F4F6] p-2 rounded-[24px]">
                                <textarea
                                    ref={inputRef}
                                    className="w-full bg-transparent border-none py-3 px-4 focus:outline-none resize-none hide-scrollbar text-[15px] text-gray-800 placeholder-gray-500"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isStreaming ? 'Génération en cours...' : 'Envoyer un message à JadaBot...'}
                                    disabled={isStreaming}
                                    rows={1}
                                    style={{ minHeight: '48px', maxHeight: '150px' }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                                    }}
                                />
                                <button
                                    className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-[20px] transition-all ${!inputValue.trim() || isStreaming ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[var(--color-earth)] text-white hover:bg-[var(--color-earth-dark)] shadow-md hover:-translate-y-0.5'}`}
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isStreaming}
                                >
                                    {isStreaming ? <IconLoader2 size={20} className="animate-spin" /> : <IconSend size={20} className={inputValue.trim() ? "translate-x-0.5" : ""} />}
                                </button>
                            </div>
                            <div className="text-center mt-2 pb-1">
                                <span className="text-[10px] text-gray-400 font-medium tracking-wide">JADARLSELABS • JADABOT EST PROPULSÉ PAR L&apos;INTELLIGENCE ARTIFICIELLE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
