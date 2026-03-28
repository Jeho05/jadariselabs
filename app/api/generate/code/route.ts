import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

export const runtime = 'nodejs';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL;
const ZHIPU_MODEL = process.env.ZHIPU_MODEL || 'glm-5';

const CREDITS_PER_MESSAGE = 1;

type CodeMode = 'speed' | 'agentic' | 'long';

const SYSTEM_PROMPT = `Tu es JadaCode, un assistant de programmation expert pour JadaRiseLabs.

RÃ¨gles:
- RÃ©ponds en franÃ§ais par dÃ©faut (anglais si demandÃ©).
- Donne des rÃ©ponses actionnables, structurÃ©es et concises.
- Utilise des blocs de code Markdown avec le langage indiquÃ©.
- Si la demande est ambiguÃ«, pose 1-2 questions de clarification avant de rÃ©pondre.
- Ne prÃ©tends pas avoir exÃ©cutÃ© du code.
- Si une solution comporte des risques, signale-les clairement.`;

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
    provider: 'groq' | 'gemini' | 'deepseek' | 'zhipu';
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
            temperature: 0.2,
            max_tokens: 4096,
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifiÃ©' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
    }

    const { message, history, mode } = body as {
        message: string;
        history?: Array<{ role: string; content: string }>;
        mode?: CodeMode;
    };

    const selectedMode: CodeMode = mode === 'agentic' || mode === 'long' || mode === 'speed' ? mode : 'agentic';

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json({ error: 'Le message ne peut pas Ãªtre vide' }, { status: 400 });
    }

    if (message.length > 6000) {
        return NextResponse.json({ error: 'Le message est trop long (max 6000 caractÃ¨res)' }, { status: 400 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits, plan')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Profil non trouvÃ©' }, { status: 404 });
    }

    if (profile.credits !== -1 && profile.credits < CREDITS_PER_MESSAGE) {
        return NextResponse.json({
            error: 'CrÃ©dits insuffisants',
            details: `Il vous faut ${CREDITS_PER_MESSAGE} crÃ©dit(s). CrÃ©dits restants : ${profile.credits}`,
        }, { status: 402 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const zhipuApiKey = process.env.ZHIPU_API_KEY;

    if (selectedMode === 'agentic' && !zhipuApiKey) {
        return NextResponse.json({
            error: 'Configuration manquante',
            details: 'ZHIPU_API_KEY non configurÃ©e. Ajoutez-la dans .env.local pour activer le mode agentique.',
        }, { status: 503 });
    }

    if (selectedMode === 'long' && !geminiApiKey) {
        return NextResponse.json({
            error: 'Configuration manquante',
            details: 'GEMINI_API_KEY non configurÃ©e. Ajoutez-la dans .env.local pour activer le contexte long.',
        }, { status: 503 });
    }

    if (selectedMode === 'speed' && !groqApiKey) {
        return NextResponse.json({
            error: 'Configuration manquante',
            details: 'GROQ_API_KEY non configurÃ©e. Ajoutez-la dans .env.local pour activer le mode rapide.',
        }, { status: 503 });
    }

    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    if (history && Array.isArray(history)) {
        const recentHistory = history.slice(-12);
        for (const msg of recentHistory) {
            if (msg.role && msg.content && ['user', 'assistant'].includes(msg.role)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
    }

    messages.push({ role: 'user', content: message.trim() });

    try {
        const tasks: ProviderTask<Response>[] = [];

        const buildTask = (
            name: 'groq' | 'gemini' | 'deepseek' | 'zhipu',
            baseUrl: string,
            apiKey: string,
            model: string
        ) => ({
            name,
            run: () => runOpenAICompatibleChat({ provider: name, baseUrl, apiKey, model, messages }),
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });

        if (selectedMode === 'agentic') {
            if (zhipuApiKey) {
                tasks.push(buildTask('zhipu', ZHIPU_API_BASE, zhipuApiKey, ZHIPU_MODEL));
            }
            if (deepseekApiKey && DEEPSEEK_API_BASE && DEEPSEEK_MODEL) {
                tasks.push(buildTask('deepseek', DEEPSEEK_API_BASE, deepseekApiKey, DEEPSEEK_MODEL));
            }
            if (geminiApiKey) {
                tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
            }
        }

        if (selectedMode === 'speed') {
            if (groqApiKey) {
                tasks.push(buildTask('groq', GROQ_API_BASE, groqApiKey, GROQ_MODEL));
            }
            if (geminiApiKey) {
                tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
            }
        }

        if (selectedMode === 'long') {
            if (geminiApiKey) {
                tasks.push(buildTask('gemini', GEMINI_API_BASE, geminiApiKey, GEMINI_MODEL));
            }
            if (groqApiKey) {
                tasks.push(buildTask('groq', GROQ_API_BASE, groqApiKey, GROQ_MODEL));
            }
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'code' });

        const modelByProvider: Record<string, string> = {
            groq: GROQ_MODEL,
            gemini: GEMINI_MODEL,
            deepseek: DEEPSEEK_MODEL || 'unknown',
            zhipu: ZHIPU_MODEL,
        };
        const usedModel = modelByProvider[providerResult.provider] || GROQ_MODEL;
        const routerMeta = {
            provider: providerResult.provider,
            attempts: providerResult.attempts,
            duration_ms: providerResult.latency_ms,
            mode: selectedMode,
        };

        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - CREDITS_PER_MESSAGE })
                .eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'code',
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
                error: 'Trop de requÃªtes',
                details: 'Limite atteinte sur tous les services. Veuillez patienter.',
            }, { status: 429 });
        }

        console.error('Code API error:', error);
        return NextResponse.json({
            error: 'Erreur du service IA',
            details: 'Le service de code est temporairement indisponible.',
        }, { status: 502 });
    }
}
