'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconSparkles, IconCheck, IconBriefcase, IconGlobe, IconTarget
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type QueryType = 'jobs' | 'scholarships' | 'tenders' | 'all';

const QUERY_TYPES: Array<{ id: QueryType; label: string; desc: string; icon: string }> = [
    { id: 'all', label: 'Tout explorer', desc: 'Une veille globale', icon: '🌍' },
    { id: 'jobs', label: 'Emplois', desc: 'Offres & recrutement', icon: '💼' },
    { id: 'scholarships', label: 'Bourses', desc: 'Études & financements', icon: '🎓' },
    { id: 'tenders', label: 'Appels d\'offres', desc: 'Marchés publics/privés', icon: '📄' },
];

const AFRICAN_COUNTRIES = [
    'Bénin', 'Burkina Faso', 'Cameroun', 'Côte d\'Ivoire', 'Gabon', 
    'Mali', 'Niger', 'Sénégal', 'Togo', 'RDC', 'Congo', 'Maroc', 'Tunisie', 'Algérie'
];

export default function RadarStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Radar Profile State
    const [sector, setSector] = useState('');
    const [country, setCountry] = useState('Bénin');
    const [educationLevel, setEducationLevel] = useState('Licence');
    const [skillsText, setSkillsText] = useState('');
    const [queryType, setQueryType] = useState<QueryType>('all');

    // Output state
    const [isStreaming, setIsStreaming] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [resultsCount, setResultsCount] = useState(0);

    // Load profile & saved radar profile
    useEffect(() => {
        const fetchProfiles = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (userProfile) setProfile(userProfile);

                // Try to load saved radar profile
                try {
                    const { data: radarProfile } = await supabase
                        .from('radar_profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
                    
                    if (radarProfile) {
                        if (radarProfile.sector) setSector(radarProfile.sector);
                        if (radarProfile.country) setCountry(radarProfile.country);
                        if (radarProfile.education_level) setEducationLevel(radarProfile.education_level);
                        if (radarProfile.skills && Array.isArray(radarProfile.skills)) {
                            setSkillsText(radarProfile.skills.join(', '));
                        }
                    }
                } catch {
                    // Ignore if table doesn't exist or no profile found
                }
            }
            setLoading(false);
        };
        fetchProfiles();
    }, [supabase]);

    const handleGenerate = async () => {
        if (!sector || !country || isStreaming) return;

        setIsStreaming(true);
        setIsSearching(true);
        setError(null);
        setOutput('');
        setResultsCount(0);

        const payload = {
            sector,
            country,
            educationLevel,
            skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
            queryType
        };

        try {
            const res = await fetch('/api/radar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.details || data.error || 'Une erreur est survenue');
                setIsStreaming(false);
                setIsSearching(false);
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
                                    setIsSearching(false); // Stop searching animation, start writing
                                    if (parsed.meta.search_results_count) {
                                        setResultsCount(parsed.meta.search_results_count);
                                    }
                                    if (profile && parsed.meta.remaining_credits !== undefined) {
                                        setProfile({ ...profile, credits: parsed.meta.remaining_credits });
                                    }
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
            setIsSearching(false);
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

    const isFormValid = sector.trim() && country.trim();

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-earth-dark)] flex items-center justify-center shadow-lg">
                            <IconTarget size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Radar d&apos;opportunités
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Votre veille stratégique IA pour les emplois, bourses et marchés.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-earth)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                    {/* ── Left Panel ── */}
                    <div className="space-y-5">
                        
                        {/* Profile Setup */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconBriefcase size={16} className="text-[var(--color-earth)]" />
                                Votre Profil Cible
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Secteur d&apos;activité</label>
                                    <input type="text" value={sector} onChange={(e) => setSector(e.target.value)}
                                        placeholder="Ex: Agritech, Cybersécurité, BTP..."
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] focus:ring-1 focus:ring-[var(--color-earth)] transition-all text-sm" />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Pays / Région</label>
                                    <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] focus:ring-1 focus:ring-[var(--color-earth)] transition-all text-sm appearance-none cursor-pointer">
                                        <option value="Afrique de l'Ouest">Afrique de l&apos;Ouest (Global)</option>
                                        <option value="Afrique Francophone">Afrique Francophone</option>
                                        <option value="International">International (Remote)</option>
                                        <optgroup label="Pays spécifiques">
                                            {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Niveau</label>
                                        <input type="text" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}
                                            placeholder="Ex: Master 2, Junior, Senior"
                                            disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] focus:ring-1 focus:ring-[var(--color-earth)] transition-all text-sm" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Compétences</label>
                                        <input type="text" value={skillsText} onChange={(e) => setSkillsText(e.target.value)}
                                            placeholder="Ex: React, Python, Marketing"
                                            disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] focus:ring-1 focus:ring-[var(--color-earth)] transition-all text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Focus */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                                <IconGlobe size={16} className="text-[var(--color-gold)]" />
                                Type d&apos;opportunités
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {QUERY_TYPES.map((qt) => (
                                    <button key={qt.id} onClick={() => setQueryType(qt.id)} disabled={isStreaming}
                                        className={`p-3 rounded-xl border-2 text-left transition-all group ${queryType === qt.id
                                            ? `border-[var(--color-earth)] bg-[var(--color-earth)]/5`
                                            : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{qt.icon}</span>
                                            <span className="font-semibold text-sm text-gray-800">{qt.label}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-snug">{qt.desc}</p>
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                                    <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <button onClick={handleGenerate} disabled={!isFormValid || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-earth) 0%, var(--color-gold) 100%)',
                                boxShadow: '0 8px 16px -4px rgba(123, 79, 46, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>{isSearching ? 'Balayage du web...' : 'Analyse des opportunités...'}</span></>
                            ) : (
                                <><IconTarget size={20} /><span>Lancer le Radar</span></>
                            )}
                        </button>
                    </div>

                    {/* ── Right Panel — Output ── */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Output Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className="text-[var(--color-earth)]" />
                                <span className="text-gray-700 font-semibold text-sm">
                                    Opportunités détectées
                                </span>
                                {resultsCount > 0 && <span className="text-xs text-white bg-[var(--color-gold)] px-2 py-0.5 rounded-full ml-2 font-medium">{resultsCount} sources analysées</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {output && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-[var(--color-earth)] hover:bg-[var(--color-cream)] transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                                <button onClick={() => { setOutput(''); setResultsCount(0); }} disabled={!output}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30">
                                    <IconRefresh size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Output Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-[3px] border-[var(--color-cream-dark)] border-t-[var(--color-gold)] animate-spin flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full border-[3px] border-[var(--color-cream-dark)] border-b-[var(--color-earth)] animate-spin animation-reverse flex items-center justify-center">
                                                <IconTarget size={20} className="text-[var(--color-earth)] animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-[var(--color-earth)]">
                                            {isSearching ? 'Recherche sur le web en cours...' : 'Structuration par IA...'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Le radar scrute les meilleures plateformes pour l&apos;Afrique</p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed prose-a:text-[var(--color-earth)] prose-a:font-semibold hover:prose-a:text-[var(--color-gold)]">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-earth)]/10 to-[var(--color-gold)]/10 flex items-center justify-center border-2 border-dashed border-[var(--color-border)]">
                                            <IconTarget size={32} className="text-[var(--color-earth)]/40" />
                                        </div>
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Le Radar est en attente</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Renseignez votre profil, choisissez ce que vous cherchez, et laissez l&apos;IA balayer le web pour vous trouver les meilleures opportunités.
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
