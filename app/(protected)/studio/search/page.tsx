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
    { id: 'auto', label: 'Auto', hint: 'Tavily â†’ Exa â†’ Brave â†’ Firecrawl' },
    { id: 'tavily', label: 'Tavily', hint: 'RÃ©sultats + rÃ©ponse synthÃ©tique' },
    { id: 'exa', label: 'Exa', hint: 'Recherche sÃ©mantique' },
    { id: 'brave', label: 'Brave', hint: 'Index indÃ©pendant' },
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
            setError('Erreur rÃ©seau. VÃ©rifiez votre connexion et rÃ©essayez.');
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
            <div className="search-studio">
                <div className="search-studio-loading">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="search-studio">
            <div className="search-studio-bg">
                <div className="search-studio-bg-orb orb-1" />
                <div className="search-studio-bg-orb orb-2" />
                <div className="search-studio-bg-orb orb-3" />
            </div>

            <div className="search-studio-content">
                <div className="search-studio-header">
                    <div className="search-studio-header-left">
                        <div className="module-icon-premium savanna">
                            <IconSearch size={28} />
                        </div>
                        <div>
                            <h1>Recherche Web</h1>
                            <p>Obtenez des sources Ã  jour pour vos analyses.</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="search-studio-credits">
                            <IconZap size={16} />
                            <span>{profile.credits === -1 ? 'âˆž' : profile.credits} crÃ©dits</span>
                        </div>
                    )}
                </div>

                <div className="search-studio-grid">
                    <div className="search-studio-controls">
                        <div className="search-studio-section">
                            <label className="search-studio-label">
                                <IconSparkles size={16} />
                                Sujet Ã  rechercher
                            </label>
                            <textarea
                                className="search-studio-textarea"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ex: Derniers chiffres sur l'adoption du mobile money en Afrique de l'Ouest"
                                rows={4}
                                maxLength={500}
                                disabled={searching}
                            />
                            <div className="search-studio-char-count">{query.length}/500</div>
                        </div>

                        <div className="search-studio-section">
                            <label className="search-studio-label">Fournisseur</label>
                            <div className="search-studio-provider-grid">
                                {PROVIDERS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        className={`search-studio-provider-btn ${provider === opt.id ? 'active' : ''}`}
                                        onClick={() => setProvider(opt.id)}
                                        disabled={searching}
                                    >
                                        <span className="search-studio-provider-name">{opt.label}</span>
                                        <span className="search-studio-provider-hint">{opt.hint}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="search-studio-section">
                            <label className="search-studio-label">Nombre de rÃ©sultats</label>
                            <div className="search-studio-results-grid">
                                {MAX_RESULTS_OPTIONS.map((value) => (
                                    <button
                                        key={value}
                                        className={`search-studio-results-btn ${maxResults === value ? 'active' : ''}`}
                                        onClick={() => setMaxResults(value)}
                                        disabled={searching}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="search-studio-generate-btn"
                            onClick={handleSearch}
                            disabled={!query.trim() || searching}
                        >
                            {searching ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    Recherche en cours...
                                </>
                            ) : (
                                <>
                                    <IconSearch size={18} />
                                    Lancer la recherche
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="search-studio-error">
                                <IconAlertCircle size={18} />
                                <span>{error}</span>
                                <button onClick={() => setError(null)}>âœ•</button>
                            </div>
                        )}
                    </div>

                    <div className="search-studio-results-panel">
                        {searching ? (
                            <div className="search-studio-empty">
                                <IconLoader2 size={28} className="animate-spin" />
                                <p>Recherche en cours...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <>
                                <div className="search-studio-meta">
                                    <span>Provider : {providerUsed || 'auto'}</span>
                                    <span>CrÃ©dits : {creditsUsed}</span>
                                </div>
                                {answer && (
                                    <div className="search-studio-answer">
                                        <h3>RÃ©ponse synthÃ©tique</h3>
                                        <p>{answer}</p>
                                    </div>
                                )}
                                <div className="search-studio-results-list">
                                    {results.map((result, idx) => (
                                        <a
                                            key={`${result.url}-${idx}`}
                                            href={result.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="search-studio-result-card"
                                        >
                                            <div className="search-studio-result-title">{result.title}</div>
                                            {result.snippet && (
                                                <div className="search-studio-result-snippet">{result.snippet}</div>
                                            )}
                                            <div className="search-studio-result-meta">
                                                <span>{result.source}</span>
                                                {result.published && <span>{result.published}</span>}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <div className="search-studio-actions">
                                    {resultUrl && (
                                        <button className="btn-primary" onClick={handleDownload}>
                                            <IconDownload size={16} />
                                            TÃ©lÃ©charger JSON
                                        </button>
                                    )}
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setResults([]);
                                            setAnswer(null);
                                            setProviderUsed(null);
                                            setResultUrl(null);
                                            setCreditsUsed(0);
                                        }}
                                    >
                                        <IconRefresh size={16} />
                                        Nouvelle recherche
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="search-studio-empty">
                                <IconSearch size={28} />
                                <p>Entrez une requÃªte pour afficher des sources.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
