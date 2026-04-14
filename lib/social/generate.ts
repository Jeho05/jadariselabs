import { ProviderError, runProviderChain, type ProviderTask } from '@/lib/provider-router';
import { buildSocialPrompt, getTemplatesByPlatform, type ContentType, type PlatformType } from '@/lib/prompts/social-templates';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

async function runOpenAICompatibleChat({
    provider,
    baseUrl,
    apiKey,
    model,
    messages,
    maxTokens = 2048,
    stream,
}: {
    provider: 'groq' | 'gemini';
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    stream: boolean;
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
            stream,
            temperature: 0.8,
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

export type SocialGenerateInput = {
    platform: PlatformType;
    contentType?: ContentType;
    templateId?: string;
    topic: string;
    context?: string;
    tone?: string;
    sector?: string;
    multiVariant?: boolean;
};

export function getCreditsRequired(input: SocialGenerateInput): number {
    return input.multiVariant ? 2 : 1;
}

function pickTemplate(platform: PlatformType, contentType?: ContentType, templateId?: string) {
    const templates = getTemplatesByPlatform(platform);

    if (templateId) {
        const byId = templates.find((t) => t.id === templateId);
        if (byId) return byId;
    }

    if (contentType) {
        const byType = templates.find((t) => t.contentType === contentType);
        if (byType) return byType;
    }

    return templates[0];
}

export async function generateSocial({
    input,
    stream,
}: {
    input: SocialGenerateInput;
    stream: boolean;
}): Promise<{ response: Response; provider: string; templateId?: string } > {
    const platform = input.platform;

    const template = pickTemplate(platform, input.contentType, input.templateId);

    const userPrompt = buildSocialPrompt(template, {
        topic: input.topic,
        context: input.context,
        tone: input.tone,
    });

    const messages = [
        { role: 'system', content: template.systemPrompt },
        { role: 'user', content: userPrompt },
    ];

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const hasAnyProvider = groqApiKey || geminiApiKey;
    if (!hasAnyProvider) {
        throw new ProviderError('router', 'Aucun fournisseur IA configuré.', 503);
    }

    const tasks: ProviderTask<Response>[] = [];
    const maxTokens = input.multiVariant ? 3072 : 2048;

    if (geminiApiKey && GEMINI_MODEL) {
        tasks.push({
            name: 'gemini',
            run: () =>
                runOpenAICompatibleChat({
                    provider: 'gemini',
                    baseUrl: GEMINI_API_BASE,
                    apiKey: geminiApiKey,
                    model: GEMINI_MODEL,
                    messages,
                    maxTokens,
                    stream,
                }),
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });
    }

    if (groqApiKey) {
        tasks.push({
            name: 'groq',
            run: () =>
                runOpenAICompatibleChat({
                    provider: 'groq',
                    baseUrl: GROQ_API_BASE,
                    apiKey: groqApiKey,
                    model: GROQ_MODEL,
                    messages,
                    maxTokens,
                    stream,
                }),
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });
    }

    const providerResult = await runProviderChain<Response>(tasks, { purpose: 'social' });

    return {
        response: providerResult.result,
        provider: providerResult.provider,
        templateId: template?.id,
    };
}

export async function readStreamedContent(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) return '';

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullContent += content;
            } catch {
                // ignore
            }
        }
    }

    return fullContent;
}
