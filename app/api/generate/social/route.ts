import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/generate/social — Générateur de posts social media
 * Streaming SSE response
 *
 * Body: {
 *   platform: 'tiktok' | 'facebook' | 'whatsapp' | 'linkedin' | 'instagram',
 *   templateId: string,
 *   topic: string,
 *   context?: string,
 *   tone?: string,
 *   sector?: string,
 *   multiVariant?: boolean
 * }
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

const CREDITS_PER_POST = 1;
const CREDITS_PER_PACK = 2; // 3 variantes

// Configuration des plateformes
const PLATFORM_CONFIG: Record<string, { maxChars: number; style: string; bestTimes: string }> = {
    tiktok: {
        maxChars: 2200,
        style: 'authentique, viral, court',
        bestTimes: '12h, 19h, 21h',
    },
    facebook: {
        maxChars: 5000,
        style: 'communautaire, engageant',
        bestTimes: '9h, 13h, 15h',
    },
    whatsapp: {
        maxChars: 1000,
        style: 'professionnel mais chaleureux, sans hashtags',
        bestTimes: '9h, 12h, 17h',
    },
    linkedin: {
        maxChars: 3000,
        style: 'professionnel, expert mais accessible',
        bestTimes: '8h, 12h, 17h',
    },
    instagram: {
        maxChars: 2200,
        style: 'visuel, storytelling, hashtags',
        bestTimes: '11h, 14h, 19h',
    },
};

function getSystemPrompt(platform: string): string {
    const basePrompt = `Tu es SocialGen, expert en marketing digital pour l'Afrique de l'Ouest.
Tu connais parfaitement les codes culturels et les tendances du Bénin, Togo, Côte d'Ivoire, Sénégal.
`;

    const platformSpecific: Record<string, string> = {
        tiktok: `${basePrompt}
Spécialité TikTok:
- Hook immédiat (3 premières secondes cruciales)
- Ton authentique, "proche de la rue"
- Rythme rapide, phrases courtes
- Références culturelles locales quand pertinent
- Appel à l'action viral (like, follow, commente)
- JAMAIS de hashtags dans le script vidéo`,

        facebook: `${basePrompt}
Spécialité Facebook:
- Communauté avant vente
- Storytelling personnel
- Questions engageantes
- Preuve sociale (témoignages)
- 2-3 hashtags maximum en fin de post`,

        whatsapp: `${basePrompt}
Spécialité WhatsApp Business:
- Messages courts et directs
- Professionnel mais chaleureux
- Emojis pertinents (max 3-4)
- Question ouverte en fin
- JAMAIS de hashtags
- Format mobile-friendly`,

        linkedin: `${basePrompt}
Spécialité LinkedIn Afrique:
- Paragraphes très courts (1-2 phrases max)
- Espacement entre paragraphes obligatoire
- Insight professionnel ou leçon de vie
- Storytelling authentique
- 3-5 hashtags professionnels ciblés`,

        instagram: `${basePrompt}
Spécialité Instagram:
- Première ligne accrocheuse (sinon tronquée)
- Corps: storytelling ou valeur ajoutée
- CTA clair (lien en bio, commente, tag)
- Emojis stratégiques
- Hashtags variés en fin (5-10)`,
    };

    return platformSpecific[platform] || basePrompt;
}

function buildPrompt(
    platform: string,
    topic: string,
    context: string,
    tone: string,
    multiVariant: boolean
): string {
    const config = PLATFORM_CONFIG[platform];
    
    let prompt = `Crée un post ${platform.toUpperCase()} pour: "${topic}"

CONTEXTE: ${context || 'Non spécifié'}
TON: ${tone}
STYLE: ${config.style}
MEILLEURS HORAIRES: ${config.bestTimes}

`;

    // Spécificités par plateforme
    if (platform === 'tiktok') {
        prompt += `FORMAT SCRIPT TIKTOK:
[HOOK 0-3s] Accroche viral
[PROBLÈME] Pain point
[SOLUTION] Réponse
[PREUVE] Exemple concret
[CTA] Like + follow + commente

Indique les [PAUSES] et les moments [ZOOM]`;
    } else if (platform === 'facebook') {
        prompt += `FORMAT POST FACEBOOK:
Accroche personnelle ou question
Story/contexte (2-3 phrases max)
Présentation subtile de l'offre
Bénéfices (pas features)
Preuve sociale
CTA conversationnel
2-3 hashtags max`;
    } else if (platform === 'whatsapp') {
        prompt += `FORMAT MESSAGE WHATSAPP:
Salutation courte
Valeur en 1 phrase
Bénéfice clé
Offre/prix si applicable
Question engageante
JAMAIS de hashtags`;
    } else if (platform === 'linkedin') {
        prompt += `FORMAT POST LINKEDIN:
Accroche personnelle
Leçon/insight partagé
Conseil actionnable
CTA qui génère des commentaires
3-5 hashtags professionnels en fin`;
    } else if (platform === 'instagram') {
        prompt += `FORMAT CAPTION INSTAGRAM:
Hook première ligne
Story ou valeur
CTA précis
Emojis stratégiques
5-10 hashtags en fin`;
    }

    if (multiVariant) {
        prompt += `\n\nGÉNÈRE 3 VARIANTES du même post:
- Variante 1: Version standard
- Variante 2: Version plus directe/punchy  
- Variante 3: Version storytelling émotionnel
\nSépare clairement chaque variante avec ---`;
    }

    prompt += `\n\nRéponds en français (adapté au contexte ouest-africain si pertinent).`;

    return prompt;
}

async function runOpenAICompatibleChat({
    provider,
    baseUrl,
    apiKey,
    model,
    messages,
    maxTokens = 2048,
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
            temperature: 0.8, // Plus créatif pour le social media
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
    const traceId = `soc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
            platform,
            topic,
            context = '',
            tone = 'professionnel',
            sector = 'general',
            multiVariant = false,
        } = body;

        // 3. Validation
        if (!platform || !['tiktok', 'facebook', 'whatsapp', 'linkedin', 'instagram'].includes(platform)) {
            return NextResponse.json({ error: 'Plateforme invalide', trace_id: traceId }, { status: 400 });
        }

        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            return NextResponse.json({ error: 'Le sujet ne peut pas être vide', trace_id: traceId }, { status: 400 });
        }

        // 4. Check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        const creditsRequired = multiVariant ? CREDITS_PER_PACK : CREDITS_PER_POST;

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédit(s). Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 5. Build prompt
        const systemPrompt = getSystemPrompt(platform);
        const userPrompt = buildPrompt(platform, topic.trim(), context, tone, multiVariant);

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        // 6. Configure providers
        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        const hasAnyProvider = groqApiKey || geminiApiKey;
        if (!hasAnyProvider) {
            return NextResponse.json({
                error: 'Configuration manquante',
                details: 'Aucun fournisseur IA configuré.',
                trace_id: traceId,
            }, { status: 503 });
        }

        // 7. Build provider chain
        const tasks: ProviderTask<Response>[] = [];
        const maxTokens = multiVariant ? 3072 : 2048;

        if (geminiApiKey && GEMINI_MODEL) {
            tasks.push({
                name: 'gemini',
                run: () => runOpenAICompatibleChat({
                    provider: 'gemini',
                    baseUrl: GEMINI_API_BASE,
                    apiKey: geminiApiKey,
                    model: GEMINI_MODEL,
                    messages,
                    maxTokens,
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
                    maxTokens,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        // 8. Execute generation
        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'social' });
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
            type: 'social',
            prompt: topic.trim().substring(0, 500),
            result_url: null,
            metadata: {
                platform,
                tone,
                sector,
                multi_variant: multiVariant,
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
                    platform,
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
        console.error('[SocialAPI] Error:', error);
        
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
