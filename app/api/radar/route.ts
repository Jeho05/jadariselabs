import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/radar — Radar d'opportunités
 * Streaming SSE response
 *
 * Body: JSON with:
 *   - sector: string
 *   - country: string
 *   - skills: string[]
 *   - educationLevel: string
 *   - queryType: 'jobs' | 'scholarships' | 'tenders' | 'all'
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

const CREDITS_PER_RADAR_SEARCH = 3; // Search + LLM analysis is more expensive

function buildRadarSearchQuery(sector: string, country: string, queryType: string): string {
    const year = new Date().getFullYear();
    switch (queryType) {
        case 'jobs': return `offres d'emploi recrutement ${sector} ${country} ${year} site:linkedin.com OR site:glassdoor.com OR site:indeed.com`;
        case 'scholarships': return `bourses d'études scholarships "afrique" ${country} ${sector} ${year} ${year+1}`;
        case 'tenders': return `appels d'offres tenders ${sector} ${country} ${year}`;
        case 'all':
        default:
            return `opportunités (emplois OR bourses OR appels d'offres) ${sector} ${country} ${year}`;
    }
}

function buildRadarStructuringPrompt(
    searchResults: any[],
    sector: string,
    country: string,
    skills: string[],
    educationLevel: string
): string {
    const resultsText = searchResults.map((r, i) => `[${i+1}] TITRE: ${r.title}\nURL: ${r.url}\nSNIPPET: ${r.snippet || ''}`).join('\n\n');

    return `Tu es un expert en orientation professionnelle et veille stratégique pour l'Afrique.
Voici les résultats bruts d'une recherche web concernant des opportunités (emplois, bourses, appels d'offres) pour le profil suivant :

PROFIL DE L'UTILISATEUR:
- Secteur: ${sector}
- Pays cible: ${country}
- Niveau d'études: ${educationLevel}
- Compétences clés: ${skills.join(', ') || 'Non spécifiées'}

RÉSULTATS DE RECHERCHE:
---
${resultsText.substring(0, 15000)}
---

MISSION:
Analyse ces résultats et extrais uniquement les opportunités réelles et pertinentes. Structure ta réponse au format Markdown strict avec :

1. **🎯 Opportunités identifiées :** Une liste des meilleures opportunités (avec le lien URL correspondant), un résumé de ce que c'est, et pourquoi ça correspond au profil.
2. **⚠️ Points de vigilance :** Dates limites (si détectées), exigences spécifiques, ou avertissements sur la fiabilité.
3. **💡 Conseils d'action :** Ce que l'utilisateur doit faire concrètement pour postuler ou saisir ces opportunités.

Si aucune opportunité pertinente n'est trouvée, explique-le clairement et suggère d'autres mots-clés ou secteurs connexes. Réponds en français de manière très professionnelle et structurée.`;
}

async function runOpenAICompatibleChat({
    provider,
    baseUrl,
    apiKey,
    model,
    messages,
    maxTokens = 4096,
}: {
    provider: 'groq' | 'gemini';
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
}): Promise<Response> {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: 0.4,
            max_tokens: maxTokens,
            top_p: 0.9,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(provider, errorText.substring(0, 200), response.status);
    }

    return response;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `radar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse JSON body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Requête invalide', trace_id: traceId }, { status: 400 });
        }

        const { sector, country, skills = [], educationLevel, queryType = 'all' } = body;

        if (!sector || !country) {
            return NextResponse.json({
                error: 'Secteur et pays requis',
                details: 'Veuillez renseigner votre secteur et votre pays',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 3. Check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        if (profile.credits !== -1 && profile.credits < CREDITS_PER_RADAR_SEARCH) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Cette action nécessite ${CREDITS_PER_RADAR_SEARCH} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 4. Perform Web Search using internal API
        const searchQuery = buildRadarSearchQuery(sector, country, queryType);
        
        const searchResponse = await fetch(`${request.nextUrl.origin}/api/generate/search`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || '' 
            },
            body: JSON.stringify({
                query: searchQuery,
                maxResults: 8,
                includeAnswer: false
            }),
        });

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            return NextResponse.json({
                error: 'Erreur de recherche web',
                details: errorData.error || 'Impossible de récupérer des résultats du web',
                trace_id: traceId,
            }, { status: 502 });
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.results || [];

        if (searchResults.length === 0) {
            return NextResponse.json({
                error: 'Aucun résultat',
                details: 'La recherche web n\'a retourné aucune opportunité récente pour ces critères.',
                trace_id: traceId,
            }, { status: 404 });
        }

        // 5. Structure the results with LLM
        const prompt = buildRadarStructuringPrompt(searchResults, sector, country, skills, educationLevel);
        const messages = [
            {
                role: 'system',
                content: 'Tu es le Radar d\'opportunités de JadaRiseLabs, un assistant expert en veille stratégique pour l\'Afrique.'
            },
            { role: 'user', content: prompt },
        ];

        // 6. Build provider chain
        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!groqApiKey && !geminiApiKey) {
            return NextResponse.json({
                error: 'Configuration manquante',
                details: 'Aucun fournisseur IA configuré',
                trace_id: traceId,
            }, { status: 503 });
        }

        const tasks: ProviderTask<Response>[] = [];

        if (geminiApiKey && GEMINI_MODEL) {
            tasks.push({
                name: 'gemini',
                run: () => runOpenAICompatibleChat({
                    provider: 'gemini',
                    baseUrl: GEMINI_API_BASE,
                    apiKey: geminiApiKey,
                    model: GEMINI_MODEL,
                    messages,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        if (groqApiKey) {
            tasks.push({
                name: 'groq',
                run: () => runOpenAICompatibleChat({
                    provider: 'groq',
                    baseUrl: GROQ_API_BASE,
                    apiKey: groqApiKey,
                    model: GROQ_MODEL,
                    messages,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'radar' });
        const response = providerResult.result;

        // 7. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - CREDITS_PER_RADAR_SEARCH })
                .eq('id', user.id);
        }

        // 8. Update Radar Profile implicitly (if we want to save user preferences)
        // Check if table exists using a safe approach (try/catch on insert)
        try {
            await supabase.from('radar_profiles').upsert({
                user_id: user.id,
                skills,
                sector,
                country,
                education_level: educationLevel,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        } catch {
            // Ignore if table doesn't exist yet
        }

        // 9. Record generation
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'radar',
            prompt: `Radar: ${sector} en ${country} [${queryType}]`,
            result_url: null,
            metadata: {
                sector,
                country,
                query_type: queryType,
                search_query: searchQuery,
                results_found: searchResults.length,
                provider: providerResult.provider,
                router: {
                    provider: providerResult.provider,
                    attempts: providerResult.attempts,
                    duration_ms: providerResult.latency_ms,
                },
            },
            credits_used: CREDITS_PER_RADAR_SEARCH,
        });

        // 10. Stream response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) { controller.close(); return; }
                const encoder = new TextEncoder();

                // Send metadata first
                const meta = {
                    trace_id: traceId,
                    credits_used: CREDITS_PER_RADAR_SEARCH,
                    remaining_credits: profile.credits === -1 ? -1 : profile.credits - CREDITS_PER_RADAR_SEARCH,
                    provider: providerResult.provider,
                    search_results_count: searchResults.length,
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta })}\n\n`));

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');

                        for (let line of lines) {
                            line = line.trim();
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6).trim();
                                if (data === '[DONE]') {
                                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                                    continue;
                                }
                                try {
                                    const parsed = JSON.parse(data);
                                    const content = parsed.choices?.[0]?.delta?.content;
                                    if (content) {
                                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                    }
                                } catch {
                                    // skip malformed
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });

    } catch (error) {
        console.error('[RadarAPI] Error:', error);

        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json({
                error: 'Trop de requêtes',
                details: 'Limite atteinte. Patientez quelques secondes.',
                trace_id: traceId,
            }, { status: 429 });
        }

        return NextResponse.json({
            error: 'Erreur du service IA',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 502 });
    }
}
