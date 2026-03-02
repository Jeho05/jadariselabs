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
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

/**
 * Chat IA Studio — Interface ChatGPT-like
 * Features:
 * - Sidebar with conversation history
 * - Streaming AI responses
 * - Auto-scroll to bottom
 * - Real-time credit counter
 * - Responsive mobile (sidebar toggle)
 */
export default function ChatStudioPage() {
    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data
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

            // Fetch conversations
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
                // Silent fail — conversations list not critical
            }

            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    // Auto-scroll to bottom when new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversation messages
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

    // Create new conversation
    const handleNewConversation = () => {
        setActiveConversationId(null);
        setMessages([]);
        setError(null);
        setSidebarOpen(false);
        inputRef.current?.focus();
    };

    // Delete conversation
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

    // Send message
    const handleSend = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isStreaming) return;

        setError(null);
        setInputValue('');
        setIsStreaming(true);

        // Add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: trimmed,
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Add placeholder for assistant
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
                // Remove empty assistant message
                setMessages(updatedMessages);
                setIsStreaming(false);
                return;
            }

            // Read SSE stream
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

            // Final messages with complete content
            const finalMessages: ChatMessage[] = [
                ...updatedMessages,
                {
                    role: 'assistant',
                    content: fullContent,
                    timestamp: new Date().toISOString(),
                },
            ];
            setMessages(finalMessages);

            // Update credits locally
            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: profile.credits - 1 });
            }

            // Save conversation
            const title =
                trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : '');

            if (activeConversationId) {
                // Update existing conversation
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
                        c.id === activeConversationId
                            ? { ...c, updated_at: new Date().toISOString() }
                            : c
                    )
                );
            } else {
                // Create new conversation
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

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Format timestamp
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="chat-container">
                <div className="chat-main">
                    <div className="chat-empty">
                        <div className="skeleton h-16 w-16 rounded-full mb-4" />
                        <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                        <div className="skeleton h-4 w-64 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            {/* Sidebar */}
            <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="chat-sidebar-header">
                    <h2 style={{ fontFamily: 'var(--font-heading)' }}>Conversations</h2>
                    <button
                        className="chat-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <IconClose size={20} />
                    </button>
                </div>

                <button className="chat-new-btn" onClick={handleNewConversation}>
                    <IconNewChat size={18} />
                    Nouvelle conversation
                </button>

                <div className="chat-conversations-list">
                    {conversations.length === 0 ? (
                        <p className="chat-no-conversations">
                            Aucune conversation pour le moment
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`chat-conversation-item ${activeConversationId === conv.id ? 'active' : ''
                                    }`}
                                onClick={() => loadConversation(conv.id)}
                            >
                                <IconChat size={16} />
                                <span className="chat-conversation-title">
                                    {conv.title}
                                </span>
                                <button
                                    className="chat-conversation-delete"
                                    onClick={(e) =>
                                        handleDeleteConversation(conv.id, e)
                                    }
                                    title="Supprimer"
                                >
                                    <IconTrash size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Credits in sidebar */}
                {profile && (
                    <div className="chat-sidebar-footer">
                        <IconZap size={16} />
                        <span>
                            {profile.credits === -1
                                ? '∞ Illimité'
                                : `${profile.credits} crédits`}
                        </span>
                    </div>
                )}
            </aside>

            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="chat-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main chat area */}
            <div className="chat-main">
                {/* Chat header */}
                <div className="chat-header">
                    <button
                        className="chat-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <IconMenu size={20} />
                    </button>
                    <div className="chat-header-info">
                        <h3 style={{ fontFamily: 'var(--font-heading)' }}>
                            JadaBot
                        </h3>
                        <span className="chat-header-model">LLaMA 3.3 · 70B</span>
                    </div>
                    {profile && (
                        <div className="chat-header-credits">
                            <IconZap size={14} />
                            {profile.credits === -1
                                ? '∞'
                                : profile.credits}
                        </div>
                    )}
                </div>

                {/* Messages area */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="chat-empty">
                            <div className="chat-empty-icon">
                                <IconSparkles size={48} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-heading)' }}>
                                Bienvenue sur JadaBot !
                            </h2>
                            <p>
                                Votre assistant IA intelligent. Posez-moi une question,
                                demandez de l&apos;aide pour écrire, traduire, coder, ou
                                juste discuter.
                            </p>
                            <div className="chat-suggestions">
                                {[
                                    '💡 Aide-moi à écrire un texte marketing',
                                    '🌍 Traduis ce texte en anglais',
                                    '💻 Explique-moi comment créer un site web',
                                    '📝 Résume cet article pour moi',
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        className="chat-suggestion-btn"
                                        onClick={() => {
                                            setInputValue(
                                                suggestion.replace(/^[^\s]+\s/, '')
                                            );
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
                            <div
                                key={i}
                                className={`chat-bubble ${msg.role}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="chat-bubble-avatar">
                                        <IconSparkles size={16} />
                                    </div>
                                )}
                                <div className="chat-bubble-content">
                                    {msg.content ? (
                                        <ChatMessageContent
                                            content={msg.content}
                                            isUser={msg.role === 'user'}
                                        />
                                    ) : (
                                        <div className="chat-typing-indicator">
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    )}
                                    {msg.timestamp && msg.content && (
                                        <span className="chat-bubble-time">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Error */}
                {error && (
                    <div className="chat-error">
                        ⚠️ {error}
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {/* Input area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                isStreaming
                                    ? 'JadaBot réfléchit...'
                                    : 'Écrivez votre message...'
                            }
                            disabled={isStreaming}
                            rows={1}
                            style={{
                                height: 'auto',
                                minHeight: '48px',
                                maxHeight: '150px',
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height =
                                    Math.min(target.scrollHeight, 150) + 'px';
                            }}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isStreaming}
                            title="Envoyer (Enter)"
                        >
                            {isStreaming ? (
                                <div className="chat-send-loading" />
                            ) : (
                                <IconSend size={18} />
                            )}
                        </button>
                    </div>
                    <p className="chat-disclaimer">
                        JadaBot utilise LLaMA 3.3 via Groq. Les réponses peuvent
                        contenir des erreurs. 1 crédit par message.
                    </p>
                </div>
            </div>
        </div>
    );
}
