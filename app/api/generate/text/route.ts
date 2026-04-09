import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/generate/text — Générateur universel de texte
 * Streaming SSE response
 *
 * Body: {
 *   templateId: string,
 *   topic: string,
 *   context?: string,
 *   tone?: string,
 *   length?: string,
 *   audience?: string,
 *   mode: 'quick' | 'expert',
 *   multiOutput?: boolean
 * }
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const SILICONFLOW_API_BASE = 'https://api.siliconflow.com/v1';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const SILICONFLOW_MODEL = 'Qwen/Qwen3-8B';

type GenerationMode = 'quick' | 'expert';

function calculateCredits(length: string, multiOutput: boolean): number {
    const baseCredits = length === 'long' ? 2 : 1;
    return multiOutput ? baseCredits * 3 : baseCredits;
}

function buildSystemPrompt(mode: GenerationMode): string {
    const basePrompt = `Tu es JadaWriter, l'assistant rédaction IA de JadaRiseLabs — une plateforme conçue pour l'Afrique de l'Ouest.

Tes caractéristiques :
- Tu maîtrises le français professionnel et les nuances culturelles ouest-africaines
- Tu produis des contenus adaptés au contexte local (Bénin, Togo, Côte d'Ivoire, Sénégal, etc.)
- Tu es concis mais complet, avec une structure claire
- Tu utilises des émojis avec parcimonie quand c'est pertinent`;

    if (mode === 'quick') {
        return `${basePrompt}
- Mode RAPIDE : réponses directes, sans préambule, focus sur l'essentiel`;
    }

    return `${basePrompt}
- Mode EXPERT : analyses approfondies, options multiples, conseils stratégiques`;
}

async function runOpenAICompatibleChat({
    provider,
    baseUrl,
    apiKey,
    model,
    messages,
    temperature = 0.7,
    maxTokens = 2048,
}: {
    provider: 'groq' | 'gemini' | 'siliconflow';
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
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
            temperature,
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
    const traceId = `txt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Body JSON invalide', trace_id: traceId }, { status: 400 });
        }

        const {
            templateId,
            topic,
            context = '',
            tone = 'professionnel',
            length = 'moyen',
            audience = 'grand public',
            mode = 'quick',
            multiOutput = false,
            customPrompt,
        } = body;

        // 3. Validation
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            return NextResponse.json({ error: 'Le sujet ne peut pas être vide', trace_id: traceId }, { status: 400 });
        }

        if (topic.length > 2000) {
            return NextResponse.json({ error: 'Le sujet est trop long (max 2000 caractères)', trace_id: traceId }, { status: 400 });
        }

        // 4. Get profile and check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        const creditsRequired = calculateCredits(length, multiOutput);

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédit(s). Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 5. Build prompt
        const systemPrompt = buildSystemPrompt(mode as GenerationMode);
        
        let userPrompt: string;
        if (customPrompt) {
            userPrompt = customPrompt;
        } else {
            userPrompt = `Rédige un contenu pour le sujet suivant : "${topic.trim()}"

Paramètres :
- Ton : ${tone}
- Longueur : ${length}
- Public cible : ${audience}
${context ? `- Contexte additionnel : ${context}` : ''}

Instructions supplémentaires :
${mode === 'expert' ? '- Propose plusieurs approches ou variantes si pertinent\n- Inclus des conseils d\'utilisation pratiques' : '- Sois direct et efficace, sans préambule inutile'}
${multiOutput ? '- Génère 3 variantes différentes du même contenu, numérotées 1, 2, 3' : ''}`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        // 6. Configure providers
        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const siliconflowApiKey = process.env.SILICONFLOW_API_KEY;

        const hasAnyProvider = groqApiKey || geminiApiKey || siliconflowApiKey;
        if (!hasAnyProvider) {
            return NextResponse.json({
                error: 'Configuration manquante',
                details: 'Aucun fournisseur IA configuré.',
                trace_id: traceId,
            }, { status: 503 });
        }

        // 7. Build provider chain
        const tasks: ProviderTask<Response>[] = [];
        const maxTokens = length === 'long' ? 4096 : multiOutput ? 3072 : 2048;

        if (groqApiKey) {
            tasks.push({
                name: 'groq',
                run: () => runOpenAICompatibleChat({
                    provider: 'groq',
                    baseUrl: GROQ_API_BASE,
                    apiKey: groqApiKey,
                    model: GROQ_MODEL,
                    messages,
                    maxTokens,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        if (geminiApiKey) {
            tasks.push({
                name: 'gemini',
                run: () => runOpenAICompatibleChat({
                    provider: 'gemini',
                    baseUrl: GEMINI_API_BASE,
                    apiKey: geminiApiKey,
                    model: GEMINI_MODEL,
                    messages,
                    maxTokens: maxTokens * 1.5, // Gemini gère mieux les longs contextes
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        if (siliconflowApiKey) {
            tasks.push({
                name: 'siliconflow',
                run: () => runOpenAICompatibleChat({
                    provider: 'siliconflow',
                    baseUrl: SILICONFLOW_API_BASE,
                    apiKey: siliconflowApiKey,
                    model: SILICONFLOW_MODEL,
                    messages,
                    maxTokens,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        // 8. Execute generation
        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'text' });
        const response = providerResult.result;

        // 9. Deduct credits before streaming
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 10. Record generation
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'text',
            prompt: topic.trim().substring(0, 500),
            result_url: null,
            metadata: {
                template_id: templateId || null,
                mode,
                tone,
                length,
                audience,
                multi_output: multiOutput,
                provider: providerResult.provider,
                router: {
                    provider: providerResult.provider,
                    attempts: providerResult.attempts,
                    duration_ms: providerResult.latency_ms,
                },
            },
            credits_used: creditsRequired,
        });

        // 11. Stream response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }

                const encoder = new TextEncoder();

                // Send metadata first
                const meta = {
                    trace_id: traceId,
                    credits_used: creditsRequired,
                    remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
                    provider: providerResult.provider,
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta })}

`));

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
                                        controller.enqueue(
                                            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                                        );
                                    }
                                } catch {
                                    // Skip malformed JSON chunks
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
        console.error('[TextAPI] Error:', error);
        
        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json({
                error: 'Trop de requêtes',
                details: 'Limite atteinte sur tous les services. Patientez quelques secondes.',
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
