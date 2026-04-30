'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconBriefcase, IconMessageCircle, IconFileText, IconPlus, IconTrash
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type Tab = 'message' | 'invoice';

interface InvoiceItem {
    id: string;
    desc: string;
    qty: number;
    price: number;
}

export default function CommerceStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<Tab>('message');

    // Message State
    const [clientName, setClientName] = useState('');
    const [context, setContext] = useState('');
    const [tone, setTone] = useState('Professionnel');

    // Invoice State
    const [currency, setCurrency] = useState('FCFA');
    const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', desc: '', qty: 1, price: 0 }]);
    const [notes, setNotes] = useState('');

    // Output state
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

    const handleAddItem = () => {
        setItems([...items, { id: Math.random().toString(), desc: '', qty: 1, price: 0 }]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const totalInvoice = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);

    const handleGenerate = async () => {
        if (activeTab === 'message' && !context.trim()) return;
        if (activeTab === 'invoice' && (!clientName.trim() || items.length === 0)) return;

        setIsStreaming(true);
        setError(null);
        setOutput('');

        const payload = activeTab === 'message' 
            ? { action: 'message', data: { clientName, context, tone } }
            : { action: 'invoice', data: { clientName, items, currency, total: totalInvoice, notes } };

        try {
            const res = await fetch('/api/commerce', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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

    const isFormValid = activeTab === 'message' ? context.trim().length > 0 : (clientName.trim() && items.some(i => i.desc.trim()));

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-indigo-500 rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                            <IconBriefcase size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Assistant Commerce
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Générez des messages clients et des devis professionnels en un clic.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-blue-600" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setActiveTab('message')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-[16px] font-semibold transition-all ${activeTab === 'message' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <IconMessageCircle size={20} /> Messages WhatsApp
                    </button>
                    <button onClick={() => setActiveTab('invoice')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-[16px] font-semibold transition-all ${activeTab === 'invoice' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <IconFileText size={20} /> Devis & Factures
                    </button>
                </div>

                <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                    {/* Left Panel */}
                    <div className="space-y-5">
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconBriefcase size={16} className={activeTab === 'message' ? 'text-blue-500' : 'text-indigo-500'} />
                                {activeTab === 'message' ? 'Détails du message' : 'Détails de la facture'}
                            </h3>
                            
                            <div className="space-y-4">
                                {activeTab === 'message' ? (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Nom du client (Optionnel)</label>
                                            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)}
                                                placeholder="Ex: M. Dupont" disabled={isStreaming}
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Contexte / Sujet</label>
                                            <textarea value={context} onChange={(e) => setContext(e.target.value)}
                                                placeholder="De quoi voulez-vous parler ? (ex: Relance pour un devis non signé)" rows={4} disabled={isStreaming}
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm resize-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Ton</label>
                                            <select value={tone} onChange={(e) => setTone(e.target.value)} disabled={isStreaming}
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer">
                                                <option value="Professionnel">Professionnel</option>
                                                <option value="Chaleureux et amical">Chaleureux et amical</option>
                                                <option value="Direct et formel">Direct et formel</option>
                                                <option value="Commercial et persuasif">Commercial et persuasif</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Nom du client *</label>
                                                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)}
                                                    placeholder="Ex: Entreprise XYZ" disabled={isStreaming}
                                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Devise</label>
                                                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={isStreaming}
                                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-center font-semibold" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Articles</label>
                                                <button onClick={handleAddItem} disabled={isStreaming} className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800">
                                                    <IconPlus size={14} /> Ajouter
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {items.map((item, index) => (
                                                    <div key={item.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                        <input type="text" placeholder="Description" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} disabled={isStreaming}
                                                            className="flex-1 p-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500" />
                                                        <input type="number" placeholder="Qté" value={item.qty} min="1" onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 1)} disabled={isStreaming}
                                                            className="w-16 p-2 bg-white rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-indigo-500" />
                                                        <input type="number" placeholder="Prix" value={item.price} min="0" onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} disabled={isStreaming}
                                                            className="w-24 p-2 bg-white rounded-lg border border-gray-200 text-sm text-right focus:outline-none focus:border-indigo-500" />
                                                        <button onClick={() => handleRemoveItem(item.id)} disabled={isStreaming || items.length === 1} className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30">
                                                            <IconTrash size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-right text-sm font-bold text-gray-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                                Total estimé : {totalInvoice.toLocaleString()} {currency}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Notes additionnelles</label>
                                            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Ex: Paiement sous 30 jours" disabled={isStreaming}
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
                                        </div>
                                    </>
                                )}
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
                                background: activeTab === 'message' ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                boxShadow: `0 8px 16px -4px ${activeTab === 'message' ? 'rgba(37, 99, 235, 0.4)' : 'rgba(79, 70, 229, 0.4)'}`,
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Génération en cours...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>{activeTab === 'message' ? 'Générer le message (1 crédit)' : 'Générer le document (2 crédits)'}</span></>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className={activeTab === 'message' ? 'text-blue-500' : 'text-indigo-500'} />
                                <span className="text-gray-700 font-semibold text-sm">Résultat généré</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
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
                                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin" />
                                    <p className="text-sm font-medium text-blue-600">L&apos;assistant rédige votre document...</p>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed ${activeTab === 'message' ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'}`}>
                                        <IconBriefcase size={32} className={activeTab === 'message' ? 'text-blue-300' : 'text-indigo-300'} />
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Prêt à générer</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {activeTab === 'message' ? 'Remplissez le contexte à gauche et laissez l\'IA rédiger le message parfait pour votre client.' : 'Ajoutez vos articles et montants, l\'IA s\'occupe de formater un beau devis texte.'}
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
