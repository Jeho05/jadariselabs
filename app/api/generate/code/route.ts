import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';
import {
    CODE_TEMPLATES,
    buildCodePrompt,
    calculateCodeCredits,
    type CodeComplexity,
    type CodeDeliverable,
} from '@/lib/prompts/code-templates';

export const runtime = 'nodejs';

// === PROVIDER ENDPOINTS ===
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
const SILICONFLOW_API_BASE = 'https://api.siliconflow.com/v1';
const IFLYTEK_API_BASE = 'https://spark-api-open.xf-yun.com/v1';
const DMX_API_BASE = 'https://api.dmxapi.com/v1';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const COHERE_API_BASE = 'https://api.cohere.ai/compatibility/v1';

// === MODELS ===
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL;
const ZHIPU_MODEL = process.env.ZHIPU_MODEL || 'glm-5';
const SILICONFLOW_MODEL = 'Qwen/Qwen3-8B';
const IFLYTEK_MODEL = 'generalv3.5';
const DMX_MODEL = 'gpt-4o-mini';
const OPENROUTER_MODEL = 'google/gemini-2.5-flash-preview';
const COHERE_MODEL = 'command-a-03-2025';

// === SYSTEM PROMPTS ===
const BASE_SYSTEM_PROMPT = `Tu es JadaCode Pro, le studio de génération professionnel de JadaRiseLabs.
Tu es un expert polyvalent : développeur senior, architecte solution, chef de projet, consultant business, et technical writer.

Règles ABSOLUES :
- Réponds en français par défaut (anglais si demandé)
- Donne des réponses COMPLÈTES, DÉTAILLÉES et ACTIONNABLES
- Utilise du Markdown riche : titres, listes, tableaux, blocs de code avec langage, diagrammes mermaid
- Le code généré doit être FONCTIONNEL et suivre les MEILLEURES PRATIQUES
- Ne mets JAMAIS de placeholder "TODO" ou "à compléter" — tout doit être implémenté
- Si la demande est ambiguë, fais des hypothèses raisonnables et explicite-les
- Adapte le niveau de détail à la complexité demandée
- Structure toujours tes réponses avec des sections claires`;

const OPENAI_CHAT_PATH = '/chat/completions';

function buildOpenAIUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/$/, '')}${OPENAI_CHAT_PATH}`;
}

type CompatibleProvider =
    | 'groq'
    | 'gemini'
    | 'deepseek'
    | 'zhipu'
    | 'siliconflow'
    | 'iflytek'
    | 'dmx'
    | 'openrouter'
    | 'cohere';

async function runOpenAICompatibleChat({
    provider,
    baseUrl,
    apiKey,
    model,
    messages,
    maxTokens,
    extraHeaders,
}: {
    provider: CompatibleProvider;
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    extraHeaders?: Record<string, string>;
}): Promise<Response> {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...extraHeaders,
    };

    const response = await fetch(buildOpenAIUrl(baseUrl), {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: 0.3,
            max_tokens: maxTokens,
            top_p: 0.95,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(provider, errorText.substring(0, 300), response.status);
    }

    return response;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
    }

    const {
        message,
        history,
        templateId,
        stack,
        complexity,
        context,
        systemInstruction,
    } = body as {
        message: string;
        history?: Array<{ role: string; content: string }>;
        templateId?: string;
        stack?: string;
        complexity?: CodeComplexity;
        context?: string;
        systemInstruction?: string;
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json({ error: 'Le message ne peut pas être vide' }, { status: 400 });
    }

    if (message.length > 8000) {
        return NextResponse.json({ error: 'Le message est trop long (max 8000 caractères)' }, { status: 400 });
    }

    // Find template if specified
    const template = templateId ? CODE_TEMPLATES.find((t) => t.id === templateId) || null : null;
    const selectedComplexity: CodeComplexity = complexity || template?.defaultComplexity || 'standard';

    // Calculate credits
    const creditsNeeded = calculateCodeCredits(template, selectedComplexity);

    // Check user credits
    const { data: profile } = await supabase
        .from('profiles')
        .select('credits, plan')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    if (profile.credits !== -1 && profile.credits < creditsNeeded) {
        return NextResponse.json({
            error: 'Crédits insuffisants',
            details: `Il vous faut ${creditsNeeded} crédit(s). Crédits restants : ${profile.credits}`,
        }, { status: 402 });
    }

    // === BUILD THE PROMPT ===
    let userContent: string;

    if (template) {
        // Mode Projet : utiliser le template avec les paramètres
        userContent = buildCodePrompt(template, {
            topic: message.trim(),
            context: context?.trim() || undefined,
            stack: stack?.trim() || undefined,
            complexity: selectedComplexity,
        });
    } else {
        // Mode Rapide : prompt direct
        userContent = message.trim();
    }

    // Build system prompt
    let systemPrompt = BASE_SYSTEM_PROMPT;
    if (systemInstruction?.trim()) {
        systemPrompt += `\n\nINSTRUCTIONS ADDITIONNELLES DE L'UTILISATEUR :\n${systemInstruction.trim()}`;
    }
    if (template) {
        systemPrompt += `\n\nTYPE DE LIVRABLE DEMANDÉ : ${template.name} (${template.description})`;
        systemPrompt += `\nCOMPLEXITÉ : ${selectedComplexity}`;
        if (stack) systemPrompt += `\nSTACK TECHNIQUE : ${stack}`;
    }

    // Build messages array
    const messages = [{ role: 'system', content: systemPrompt }];

    if (history && Array.isArray(history)) {
        const recentHistory = history.slice(-12);
        for (const msg of recentHistory) {
            if (msg.role && msg.content && ['user', 'assistant'].includes(msg.role)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
    }

    messages.push({ role: 'user', content: userContent });

    // === DETERMINE MAX TOKENS ===
    // Complex deliverables get more tokens
    const isLongDeliverable =
        template &&
        ['app', 'cahier', 'architecture', 'audit'].includes(template.category);
    const maxTokens = isLongDeliverable
        ? selectedComplexity === 'advanced'
            ? 16384
            : 8192
        : 4096;

    // === API KEYS ===
    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const zhipuApiKey = process.env.ZHIPU_API_KEY;
    const siliconflowApiKey = process.env.SILICONFLOW_API_KEY;
    const iflytekApiKey = process.env.IFLYTEK_API_KEY;
    const iflytekApiSecret = process.env.IFLYTEK_API_SECRET;
    const dmxApiKey = process.env.DMX_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    const cohereApiKey = process.env.COHERE_API_KEY;

    // At least one provider must be configured
    const hasAnyProvider =
        groqApiKey || geminiApiKey || siliconflowApiKey || dmxApiKey || openrouterApiKey || cohereApiKey;
    if (!hasAnyProvider) {
        return NextResponse.json({
            error: 'Configuration manquante',
            details: 'Aucun fournisseur IA configuré. Ajoutez au moins une clé API.',
        }, { status: 503 });
    }

    try {
        const tasks: ProviderTask<Response>[] = [];

        const buildTask = (
            name: CompatibleProvider,
            baseUrl: string,
            apiKey: string,
            model: string,
            extraHeaders?: Record<string, string>
        ) => ({
            name,
            run: () =>
                runOpenAICompatibleChat({
                    provider: name,
                    baseUrl,
                    apiKey,
                    model,
                    messages,
                    maxTokens,
                    extraHeaders,
                }),
            canFallback: (err: ProviderError) =>
                err.status === 429 || (err.status ?? 0) >= 500,
        });

        // === PROVIDER CHAIN ===
        // Priority order: Best quality (Gemini) → Fast (Groq) → Powerful (OpenRouter) →
        // DMX → Cohere → Zhipu → SiliconFlow → iFlytek
        // This maximizes result quality with robust fallback

        // 1. Gemini 2.5 Flash — Best for long, structured output
        if (geminiApiKey) {
            tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
        }

        // 2. OpenRouter — Access to top models (Gemini, Claude, etc.)
        if (openrouterApiKey) {
            tasks.push(
                buildTask('openrouter', OPENROUTER_API_BASE, openrouterApiKey, OPENROUTER_MODEL, {
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://jadariselabs.vercel.app',
                    'X-Title': 'JadaRiseLabs Studio Code',
                })
            );
        }

        // 3. Groq — Ultra-fast LLaMA 3.3 70B
        if (groqApiKey) {
            tasks.push(buildTask('groq', GROQ_API_BASE, groqApiKey, GROQ_MODEL));
        }

        // 4. DMX API — GPT-4o-mini compatible
        if (dmxApiKey) {
            tasks.push(buildTask('dmx', DMX_API_BASE, dmxApiKey, DMX_MODEL));
        }

        // 5. Cohere — Command A model
        if (cohereApiKey) {
            tasks.push(buildTask('cohere', COHERE_API_BASE, cohereApiKey, COHERE_MODEL));
        }

        // 6. Zhipu GLM
        if (zhipuApiKey) {
            tasks.push(buildTask('zhipu', ZHIPU_API_BASE, zhipuApiKey, ZHIPU_MODEL));
        }

        // 7. SiliconFlow — Free Qwen fallback
        if (siliconflowApiKey) {
            tasks.push(buildTask('siliconflow', SILICONFLOW_API_BASE, siliconflowApiKey, SILICONFLOW_MODEL));
        }

        // 8. DeepSeek (if configured)
        if (deepseekApiKey && DEEPSEEK_API_BASE && DEEPSEEK_MODEL) {
            tasks.push(buildTask('deepseek', DEEPSEEK_API_BASE, deepseekApiKey, DEEPSEEK_MODEL));
        }

        // 9. iFlytek Spark — Last fallback
        if (iflytekApiKey && iflytekApiSecret) {
            tasks.push(
                buildTask('iflytek', IFLYTEK_API_BASE, `${iflytekApiKey}:${iflytekApiSecret}`, IFLYTEK_MODEL)
            );
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'code-studio' });

        const modelByProvider: Record<string, string> = {
            groq: GROQ_MODEL,
            gemini: GEMINI_MODEL,
            deepseek: DEEPSEEK_MODEL || 'unknown',
            zhipu: ZHIPU_MODEL,
            siliconflow: SILICONFLOW_MODEL,
            iflytek: IFLYTEK_MODEL,
            dmx: DMX_MODEL,
            openrouter: OPENROUTER_MODEL,
            cohere: COHERE_MODEL,
        };
        const usedModel = modelByProvider[providerResult.provider] || 'unknown';
        const routerMeta = {
            provider: providerResult.provider,
            attempts: providerResult.attempts,
            duration_ms: providerResult.latency_ms,
            template: templateId || null,
        };

        // Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsNeeded })
                .eq('id', user.id);
        }

        // Log generation
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'code',
            prompt: message.trim().substring(0, 500),
            result_url: null,
            metadata: {
                model: usedModel,
                template: templateId || 'free',
                complexity: selectedComplexity,
                stack: stack || null,
                provider: routerMeta.provider,
                streaming: true,
                fallback_used: routerMeta.attempts.length > 1,
                router: routerMeta,
                max_tokens: maxTokens,
            },
            credits_used: creditsNeeded,
        });

        // === STREAMING RESPONSE ===
        const response = providerResult.result;
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }

                const encoder = new TextEncoder();

                // Send metadata as first event
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({
                            meta: {
                                provider: providerResult.provider,
                                model: usedModel,
                                credits_used: creditsNeeded,
                                remaining_credits:
                                    profile.credits === -1
                                        ? -1
                                        : profile.credits - creditsNeeded,
                            },
                        })}\n\n`
                    )
                );

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
                    console.error('Code stream error:', error);
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
            return NextResponse.json({
                error: 'Trop de requêtes',
                details: 'Limite atteinte sur tous les services. Veuillez patienter.',
            }, { status: 429 });
        }

        console.error('Code Studio API error:', error);
        return NextResponse.json({
            error: 'Erreur du service IA',
            details: 'Le Studio Code est temporairement indisponible. Veuillez réessayer.',
        }, { status: 502 });
    }
}
