'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconSearch,
    IconZap,
    IconLoader2,
    IconDownload,
    IconAlertCircle,
    IconRefresh,
    IconSparkles,
} from '@/components/icons';

type ProviderOption = 'auto' | 'tavily' | 'exa' | 'brave' | 'firecrawl';

type SearchResult = {
    title: string;
    url: string;
    snippet?: string;
    source: string;
    score?: number;
    published?: string;
};

const PROVIDERS: Array<{ id: ProviderOption; label: string; hint: string }> = [
    { id: 'auto', label: 'Auto', hint: 'Tavily -> Exa -> Brave' },
    { id: 'tavily', label: 'Tavily', hint: 'Résultats + synthèse' },
    { id: 'exa', label: 'Exa', hint: 'Recherche sémantique' },
    { id: 'brave', label: 'Brave', hint: 'Index indépendant' },
    { id: 'firecrawl', label: 'Firecrawl', hint: 'Recherche + scraping' },
];

const MAX_RESULTS_OPTIONS = [5, 8, 10];

export default function SearchStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [provider, setProvider] = useState<ProviderOption>('auto');
    const [maxResults, setMaxResults] = useState<number>(8);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [answer, setAnswer] = useState<string | null>(null);
    const [providerUsed, setProviderUsed] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [creditsUsed, setCreditsUsed] = useState(0);
    const [searching, setSearching] = useState(false);
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

    const handleSearch = async () => {
        if (!query.trim() || searching) return;

        setSearching(true);
        setError(null);
        setResults([]);
        setAnswer(null);
        setProviderUsed(null);
        setResultUrl(null);

        try {
            const res = await fetch('/api/generate/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query.trim(),
                    provider,
                    maxResults,
                    includeAnswer: true,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.details || data.error || 'Une erreur est survenue');
                return;
            }

            setResults(data.results || []);
            setAnswer(data.answer || null);
            setProviderUsed(data.provider || null);
            setResultUrl(data.result_url || null);
            setCreditsUsed(data.credits_charged || 0);

            if (profile && profile.credits !== -1) {
                setProfile({ ...profile, credits: data.remaining_credits });
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setSearching(false);
        }
    };

    const handleDownload = () => {
        if (!resultUrl) return;
        const link = document.createElement('a');
        link.href = resultUrl;
        link.download = `jadarise-search-${Date.now()}.json`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium savanna">
                            <IconSearch size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                                Recherche Web
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                                Obtenez des sources à jour pour vos analyses.
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl bg-white/70 border border-[var(--color-border)]">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="glass-card-premium rounded-2xl p-6 space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-2">
                                <IconSparkles size={16} /> Sujet à rechercher
                            </label>
                            <textarea
                                className="w-full mt-2 p-4 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-colors resize-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ex: Derniers chiffres sur l'adoption du mobile money en Afrique de l'Ouest"
                                rows={4}
                                maxLength={500}
                                disabled={searching}
                            />
                            <div className="text-right text-xs text-[var(--color-text-muted)] mt-1">
                                {query.length}/500
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                Fournisseur
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {PROVIDERS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        className={`p-2 text-left rounded-xl border transition-all ${
                                            provider === opt.id
                                                ? 'border-[var(--color-savanna)] bg-[rgba(45,106,79,0.05)]'
                                                : 'border-[var(--color-border)] bg-white hover:border-[var(--color-savanna-light)]'
                                        }`}
                                        onClick={() => setProvider(opt.id)}
                                        disabled={searching}
                                    >
                                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{opt.label}</div>
                                        <div className="text-[10px] text-[var(--color-text-muted)] truncate">{opt.hint}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                Nombre de résultats
                            </label>
                            <div className="flex gap-2 mt-2">
                                {MAX_RESULTS_OPTIONS.map((value) => (
                                    <button
                                        key={value}
                                        className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                                            maxResults === value
                                                ? 'border-[var(--color-savanna)] bg-[var(--color-savanna)] text-white'
                                                : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:border-[var(--color-savanna-light)]'
                                        }`}
                                        onClick={() => setMaxResults(value)}
                                        disabled={searching}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                            style={ { background: 'linear-gradient(135deg, var(--color-savanna) 0%, var(--color-savanna-dark) 100%)' } }
                            onClick={handleSearch}
                            disabled={!query.trim() || searching}
                        >
                            {searching ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    <span>Recherche en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconSearch size={18} />
                                    <span>Lancer la recherche</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-terracotta)] bg-white/70 border border-[var(--color-terracotta)]/30 px-3 py-2 rounded-xl">
                                <IconAlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="glass-card-premium rounded-2xl p-6 flex flex-col gap-4 overflow-hidden h-[600px]">
                        {searching ? (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] flex items-center justify-center">
                                    <IconLoader2 size={28} className="animate-spin text-[var(--color-savanna)]" />
                                </div>
                                <h3 className="font-semibold text-lg">Recherche en cours...</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">Analyse du web en temps réel.</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="flex flex-col h-full opacity-0 animate-[fade-in_0.5s_ease-out_forwards]">
                                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4">
                                    <span>Fournisseur : <strong className="text-[var(--color-savanna)]">{providerUsed || 'auto'}</strong></span>
                                    <span>Crédits utilisés : <strong>{creditsUsed}</strong></span>
                                </div>
                                <div className="overflow-y-auto pr-2 flex-col space-y-4 pb-12 hide-scrollbar flex-1">
                                    {answer && (
                                        <div className="bg-white p-4 rounded-xl border border-[var(--color-savanna)]/30 shadow-sm relative overflow-hidden">
                                           <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-savanna)]"></div>
                                            <h3 className="font-semibold text-sm mb-2 text-[var(--color-savanna-dark)] flex items-center gap-2">
                                                <IconSparkles size={14} /> Synthèse IA
                                            </h3>
                                            <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">{answer}</p>
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        {results.map((result, idx) => (
                                            <a
                                                key={`${result.url}-${idx}`}
                                                href={result.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block bg-white p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-savanna-light)] hover:shadow-md transition-all group"
                                            >
                                                <div className="font-semibold text-[var(--color-savanna-dark)] group-hover:text-[var(--color-savanna)] mb-1 leading-tight">{result.title}</div>
                                                {result.snippet && (
                                                    <div className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">{result.snippet}</div>
                                                )}
                                                <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                                                    <span className="truncate max-w-[200px]">{result.source}</span>
                                                    {result.published && <span>• {result.published}</span>}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)] bg-[rgba(255,255,255,0.5)]">
                                    {resultUrl && (
                                        <button className="flex-1 btn-primary py-2 text-sm" style={ { background: 'linear-gradient(135deg, var(--color-savanna) 0%, var(--color-savanna-dark) 100%)' } } onClick={handleDownload}>
                                            <IconDownload size={16} /> JSON
                                        </button>
                                    )}
                                    <button
                                        className="flex-1 btn-secondary py-2 text-sm"
                                        onClick={() => {
                                            setResults([]);
                                            setAnswer(null);
                                            setProviderUsed(null);
                                            setResultUrl(null);
                                            setCreditsUsed(0);
                                            setQuery('');
                                        }}
                                    >
                                        <IconRefresh size={16} /> Nouvelle recherche
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] flex items-center justify-center opacity-70">
                                    <IconSearch size={28} className="text-[var(--color-savanna)]" />
                                </div>
                                <h3 className="font-semibold text-lg">Prêt à chercher</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Entrez une requête pour obtenir des résultats et une synthèse IA.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
