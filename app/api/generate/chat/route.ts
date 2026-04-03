import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';
import { runSiliconFlowChat } from '@/lib/siliconflow';
import { runIFlytekChat } from '@/lib/iflytek';

/**
 * POST /api/generate/chat — Chat IA multi-modèles (Groq/Gemini/DeepSeek)
 * Streaming SSE response
 *
 * Body: { message: string, conversationId?: string }
 * Returns: ReadableStream (SSE) or JSON error
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const SILICONFLOW_API_BASE = 'https://api.siliconflow.com/v1';
const IFLYTEK_API_BASE = 'https://spark-api-open.xf-yun.com/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const SILICONFLOW_MODEL = 'Qwen/Qwen3-8B';
const IFLYTEK_MODEL = 'generalv3.5';
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL;
const CREDITS_PER_MESSAGE = 1;

type ChatMode = 'speed' | 'reasoning' | 'long';

const SYSTEM_PROMPT = `Tu es JadaBot, l'assistant IA de JadaRiseLabs — une plateforme de créativité IA conçue pour l'Afrique de l'Ouest et le grand public.

Tes caractéristiques :
- Tu es amical, professionnel et culturellement sensible
- Tu réponds en français par défaut, mais tu peux répondre en anglais si l'utilisateur le demande
- Tu es expert en technologie, créativité, business et culture africaine
- Tu peux aider avec : écriture, traduction, brainstorming, code, marketing, éducation
- Tu es concis mais complet dans tes réponses
- Tu utilises des émojis avec modération pour rendre la conversation agréable
- Tu es honnête quand tu ne sais pas quelque chose

Note : Tu ne peux PAS générer d'images, de vidéos ou d'audio directement. Redirige l'utilisateur vers les modules appropriés de JadaRiseLabs pour ces fonctions.`;

const OPENAI_CHAT_PATH = '/chat/completions';

function buildOpenAIUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/$/, '')}${OPENAI_CHAT_PATH}`;
}

async function runOpenAICompatibleChat({
    provider,
    baseUrl,
    apiKey,
    model,
    messages,
}: {
    provider: 'groq' | 'gemini' | 'deepseek' | 'siliconflow' | 'iflytek';
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
}): Promise<Response> {
    const response = await fetch(buildOpenAIUrl(baseUrl), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
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
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Parse body
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
    }

    const { message, history, mode } = body as {
        message: string;
        history?: Array<{ role: string; content: string }>;
        mode?: ChatMode;
    };

    const selectedMode: ChatMode =
        mode === 'reasoning' || mode === 'long' || mode === 'speed' ? mode : 'speed';

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json({ error: 'Le message ne peut pas être vide' }, { status: 400 });
    }

    if (message.length > 4000) {
        return NextResponse.json(
            { error: 'Le message est trop long (max 4000 caractères)' },
            { status: 400 }
        );
    }

    // Vérifier les crédits
    const { data: profile } = await supabase
        .from('profiles')
        .select('credits, plan')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // -1 = illimité (plan Pro)
    if (profile.credits !== -1 && profile.credits < CREDITS_PER_MESSAGE) {
        return NextResponse.json(
            {
                error: 'Crédits insuffisants',
                details: `Il vous faut ${CREDITS_PER_MESSAGE} crédit(s) pour envoyer un message. Crédits restants : ${profile.credits}`,
            },
            { status: 402 }
        );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const siliconflowApiKey = process.env.SILICONFLOW_API_KEY;
    const iflytekApiKey = process.env.IFLYTEK_API_KEY;
    const iflytekApiSecret = process.env.IFLYTEK_API_SECRET;

    // Au moins un provider doit être configuré
    const hasAnyProvider = groqApiKey || geminiApiKey || siliconflowApiKey || iflytekApiKey;
    if (!hasAnyProvider) {
        return NextResponse.json(
            {
                error: 'Configuration manquante',
                details:
                    'Aucun fournisseur chat configuré. Ajoutez au moins une clé API dans .env.local.',
            },
            { status: 503 }
        );
    }


    // Construire les messages pour Groq
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    // Ajouter l'historique si fourni (max 20 derniers messages)
    if (history && Array.isArray(history)) {
        const recentHistory = history.slice(-20);
        for (const msg of recentHistory) {
            if (
                msg.role &&
                msg.content &&
                ['user', 'assistant'].includes(msg.role)
            ) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
    }

    messages.push({ role: 'user', content: message.trim() });

    try {
        const tasks: ProviderTask<Response>[] = [];

        const buildTask = (
            name: 'groq' | 'gemini' | 'deepseek' | 'siliconflow' | 'iflytek',
            baseUrl: string,
            apiKey: string,
            model: string
        ) => ({
            name,
            run: () => runOpenAICompatibleChat({ provider: name, baseUrl, apiKey, model, messages }),
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });

        // Helper to add SiliconFlow + iFlytek as fallbacks
        const addFreeFallbacks = () => {
            if (siliconflowApiKey) {
                tasks.push(buildTask('siliconflow', SILICONFLOW_API_BASE, siliconflowApiKey, SILICONFLOW_MODEL));
            }
            if (iflytekApiKey && iflytekApiSecret) {
                tasks.push(buildTask('iflytek', IFLYTEK_API_BASE, `${iflytekApiKey}:${iflytekApiSecret}`, IFLYTEK_MODEL));
            }
        };

        if (selectedMode === 'speed') {
            if (groqApiKey) {
                tasks.push(buildTask('groq', GROQ_API_BASE, groqApiKey, GROQ_MODEL));
            }
            if (geminiApiKey) {
                tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
            }
            addFreeFallbacks();
        }

        if (selectedMode === 'long') {
            if (geminiApiKey) {
                tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
            }
            if (groqApiKey) {
                tasks.push(buildTask('groq', GROQ_API_BASE, groqApiKey, GROQ_MODEL));
            }
            addFreeFallbacks();
        }

        if (selectedMode === 'reasoning') {
            // SiliconFlow DeepSeek-R1 en premier pour le reasoning (gratuit)
            if (siliconflowApiKey) {
                tasks.push(buildTask('siliconflow', SILICONFLOW_API_BASE, siliconflowApiKey, 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'));
            }
            if (deepseekApiKey && DEEPSEEK_API_BASE && DEEPSEEK_MODEL) {
                tasks.push(buildTask('deepseek', DEEPSEEK_API_BASE, deepseekApiKey, DEEPSEEK_MODEL));
            }
            if (geminiApiKey) {
                tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
            }
            if (groqApiKey) {
                tasks.push(buildTask('groq', GROQ_API_BASE, groqApiKey, GROQ_MODEL));
            }
            if (iflytekApiKey && iflytekApiSecret) {
                tasks.push(buildTask('iflytek', IFLYTEK_API_BASE, `${iflytekApiKey}:${iflytekApiSecret}`, IFLYTEK_MODEL));
            }
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'chat' });

        const response = providerResult.result;
        const modelByProvider: Record<string, string> = {
            groq: GROQ_MODEL,
            gemini: GEMINI_MODEL,
            deepseek: DEEPSEEK_MODEL || 'unknown',
            siliconflow: SILICONFLOW_MODEL,
            iflytek: IFLYTEK_MODEL,
        };
        const usedModel = modelByProvider[providerResult.provider] || GROQ_MODEL;
        const routerMeta = {
            provider: providerResult.provider,
            attempts: providerResult.attempts,
            duration_ms: providerResult.latency_ms,
            mode: selectedMode,
        };

        // Déduire les crédits AVANT le streaming
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - CREDITS_PER_MESSAGE })
                .eq('id', user.id);
        }

        // Enregistrer la génération
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'chat',
            prompt: message.trim().substring(0, 500),
            result_url: null,
            metadata: {
                model: usedModel,
                mode: selectedMode,
                provider: routerMeta.provider,
                streaming: true,
                fallback_used: routerMeta.attempts.length > 1,
                router: routerMeta,
            },
            credits_used: CREDITS_PER_MESSAGE,
        });

        // Streaming SSE
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }

                const encoder = new TextEncoder();

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
                                    const content =
                                        parsed.choices?.[0]?.delta?.content;
                                    if (content) {
                                        controller.enqueue(
                                            encoder.encode(
                                                `data: ${JSON.stringify({ content })}\n\n`
                                            )
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
        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json(
                {
                    error: 'Trop de requêtes',
                    details:
                        'Limite de requêtes atteinte sur tous les services. Veuillez patienter quelques secondes.',
                },
                { status: 429 }
            );
        }

        console.error('Chat API error:', error);
        return NextResponse.json(
            {
                error: 'Erreur du service IA',
                details: 'Le service de chat IA est temporairement indisponible.',
            },
            { status: 502 }
        );
    }
}
