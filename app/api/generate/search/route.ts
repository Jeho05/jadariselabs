import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProviderError, runProviderChain } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

export const runtime = 'nodejs';

const CREDITS_PER_SEARCH = 1;

type SearchProvider = 'tavily' | 'exa' | 'brave' | 'firecrawl';

type SearchResult = {
    title: string;
    url: string;
    snippet?: string;
    source: SearchProvider;
    score?: number;
    published?: string;
};

type ProviderResponse = {
    results: SearchResult[];
    answer?: string;
};

function truncate(text: string | undefined, max = 1200): string | undefined {
    if (!text) return undefined;
    return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function searchTavily(query: string, maxResults: number, includeAnswer: boolean): Promise<ProviderResponse> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        throw new ProviderError('tavily', 'TAVILY_API_KEY manquante', 503);
    }

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'basic',
            max_results: maxResults,
            include_answer: includeAnswer,
            include_raw_content: false,
            include_images: false,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError('tavily', errorText.substring(0, 200), response.status);
    }

    const payload = await response.json();
    const results = (payload.results || []).map((item: { title: string; url: string; content?: string; score?: number }) => ({
        title: item.title,
        url: item.url,
        snippet: truncate(item.content),
        score: item.score,
        source: 'tavily' as const,
    }));

    return {
        results,
        answer: payload.answer,
    };
}

async function searchExa(query: string, maxResults: number): Promise<ProviderResponse> {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
        throw new ProviderError('exa', 'EXA_API_KEY manquante', 503);
    }

    const response = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({
            query,
            type: 'auto',
            numResults: maxResults,
            contents: { text: true },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError('exa', errorText.substring(0, 200), response.status);
    }

    const payload = await response.json();
    const results = (payload.results || []).map((item: { title?: string; url: string; text?: string; score?: number }) => ({
        title: item.title || item.url,
        url: item.url,
        snippet: truncate(item.text),
        score: item.score,
        source: 'exa' as const,
    }));

    return { results };
}

async function searchBrave(query: string, maxResults: number): Promise<ProviderResponse> {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
        throw new ProviderError('brave', 'BRAVE_SEARCH_API_KEY manquante', 503);
    }

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`, {
        headers: {
            'X-Subscription-Token': apiKey,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError('brave', errorText.substring(0, 200), response.status);
    }

    const payload = await response.json();
    const results = (payload?.web?.results || []).map((item: { title: string; url: string; description?: string; age?: string }) => ({
        title: item.title,
        url: item.url,
        snippet: truncate(item.description),
        published: item.age,
        source: 'brave' as const,
    }));

    return { results };
}

async function searchFirecrawl(query: string, maxResults: number): Promise<ProviderResponse> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        throw new ProviderError('firecrawl', 'FIRECRAWL_API_KEY manquante', 503);
    }

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            limit: maxResults,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError('firecrawl', errorText.substring(0, 200), response.status);
    }

    const payload = await response.json();
    const results = (payload?.data || []).map((item: { title?: string; url: string; description?: string; content?: string }) => ({
        title: item.title || item.url,
        url: item.url,
        snippet: truncate(item.description || item.content),
        source: 'firecrawl' as const,
    }));

    return { results };
}

export async function POST(request: NextRequest) {
    const traceId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        let body: { query?: string; provider?: SearchProvider | 'auto'; maxResults?: number; includeAnswer?: boolean };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ success: false, error: 'Requête invalide', trace_id: traceId }, { status: 400 });
        }

        const query = body.query?.trim();
        if (!query) {
            return NextResponse.json({ success: false, error: 'La requête est vide', trace_id: traceId }, { status: 400 });
        }
        if (query.length > 500) {
            return NextResponse.json({ success: false, error: 'Requête trop longue (max 500 caractères)', trace_id: traceId }, { status: 400 });
        }

        const maxResults = Math.min(Math.max(body.maxResults || 6, 1), 10);
        const includeAnswer = body.includeAnswer !== false;

        const { data: profile } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        if (profile.credits !== -1 && profile.credits < CREDITS_PER_SEARCH) {
            return NextResponse.json({
                success: false,
                error: 'Crédits insuffisants',
                details: `Il vous faut ${CREDITS_PER_SEARCH} crédit(s). Crédits restants : ${profile.credits}`,
                trace_id: traceId,
            }, { status: 402 });
        }

        const requestedProvider = body.provider || 'auto';
        const tasks: ProviderTask<ProviderResponse>[] = [];

        const addTask = (name: SearchProvider, run: () => Promise<ProviderResponse>) => {
            tasks.push({
                name,
                run,
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        };

        if (requestedProvider === 'tavily' || requestedProvider === 'auto') {
            if (process.env.TAVILY_API_KEY) {
                addTask('tavily', () => searchTavily(query, maxResults, includeAnswer));
            } else if (requestedProvider === 'tavily') {
                return NextResponse.json({ success: false, error: 'TAVILY_API_KEY manquante', trace_id: traceId }, { status: 503 });
            }
        }

        if (requestedProvider === 'exa' || requestedProvider === 'auto') {
            if (process.env.EXA_API_KEY) {
                addTask('exa', () => searchExa(query, maxResults));
            } else if (requestedProvider === 'exa') {
                return NextResponse.json({ success: false, error: 'EXA_API_KEY manquante', trace_id: traceId }, { status: 503 });
            }
        }

        if (requestedProvider === 'brave' || requestedProvider === 'auto') {
            if (process.env.BRAVE_SEARCH_API_KEY) {
                addTask('brave', () => searchBrave(query, maxResults));
            } else if (requestedProvider === 'brave') {
                return NextResponse.json({ success: false, error: 'BRAVE_SEARCH_API_KEY manquante', trace_id: traceId }, { status: 503 });
            }
        }

        if (requestedProvider === 'firecrawl' || requestedProvider === 'auto') {
            if (process.env.FIRECRAWL_API_KEY) {
                addTask('firecrawl', () => searchFirecrawl(query, maxResults));
            } else if (requestedProvider === 'firecrawl') {
                return NextResponse.json({ success: false, error: 'FIRECRAWL_API_KEY manquante', trace_id: traceId }, { status: 503 });
            }
        }

        if (tasks.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Aucun fournisseur de recherche configuré',
                details: 'Ajoutez au moins une clé API de recherche dans .env.local : TAVILY_API_KEY (tavily.com), EXA_API_KEY (exa.ai), BRAVE_SEARCH_API_KEY (brave.com/search/api), ou FIRECRAWL_API_KEY (firecrawl.dev)',
                trace_id: traceId,
            }, { status: 503 });
        }

        const providerResult = await runProviderChain<ProviderResponse>(tasks, { purpose: 'search' });

        const output = {
            query,
            provider: providerResult.provider,
            answer: providerResult.result.answer,
            results: providerResult.result.results,
        };

        const storagePath = `${user.id}/search/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`;
        const { error: uploadError } = await supabase.storage.from('generations').upload(
            storagePath,
            Buffer.from(JSON.stringify(output, null, 2), 'utf-8'),
            { contentType: 'application/json', upsert: false }
        );

        let resultUrl: string | null = null;
        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('generations').getPublicUrl(storagePath);
            resultUrl = urlData.publicUrl;
        }

        if (profile.credits !== -1) {
            await supabase.from('profiles').update({ credits: profile.credits - CREDITS_PER_SEARCH }).eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'search',
            prompt: query.substring(0, 500),
            result_url: resultUrl,
            metadata: {
                provider: providerResult.provider,
                format: 'json',
                results_count: providerResult.result.results.length,
                answer: providerResult.result.answer || null,
                router: {
                    provider: providerResult.provider,
                    attempts: providerResult.attempts,
                    duration_ms: providerResult.latency_ms,
                },
            },
            credits_used: CREDITS_PER_SEARCH,
        });

        return NextResponse.json({
            success: true,
            query,
            provider: providerResult.provider,
            answer: providerResult.result.answer,
            results: providerResult.result.results,
            result_url: resultUrl,
            credits_charged: CREDITS_PER_SEARCH,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - CREDITS_PER_SEARCH,
            trace_id: traceId,
        });
    } catch (error) {
        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json({ success: false, error: 'Trop de requêtes', trace_id: traceId }, { status: 429 });
        }

        console.error('[SearchAPI] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur de recherche',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 500 });
    }
}
