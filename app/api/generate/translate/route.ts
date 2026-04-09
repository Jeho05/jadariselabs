import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';
import {
    type SupportedLanguage,
    TRANSLATION_PAIRS,
    LANGUAGE_CONFIG,
    buildTranslationPrompt,
    simpleTranslate,
    getPhonetic,
    calculateTranslationCredits,
} from '@/lib/translation/providers';

/**
 * POST /api/generate/translate — Traduction locale (Fon, Yoruba)
 * Streaming SSE response
 *
 * Body: {
 *   text: string,
 *   from: SupportedLanguage,
 *   to: SupportedLanguage,
 *   includePhonetic?: boolean,
 *   useDictionary?: boolean,
 * }
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : null;
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

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
            temperature: 0.3, // Plus conservateur pour traduction
            max_tokens: maxTokens,
            top_p: 0.95,
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
    const traceId = `trl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
            text,
            from,
            to,
            includePhonetic = false,
            useDictionary = true,
        } = body as {
            text: string;
            from: SupportedLanguage;
            to: SupportedLanguage;
            includePhonetic?: boolean;
            useDictionary?: boolean;
        };

        // 3. Validation
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'Le texte est requis', trace_id: traceId }, { status: 400 });
        }

        if (text.length > 5000) {
            return NextResponse.json({ error: 'Texte trop long (max 5000 caractères)', trace_id: traceId }, { status: 400 });
        }

        const validPairs = TRANSLATION_PAIRS.map(p => `${p.from}-${p.to}`);
        if (!validPairs.includes(`${from}-${to}`)) {
            return NextResponse.json({
                error: 'Paire de langues non supportée',
                validPairs: TRANSLATION_PAIRS.map(p => p.label),
                trace_id: traceId,
            }, { status: 400 });
        }

        const translationPair = TRANSLATION_PAIRS.find(p => p.from === from && p.to === to)!;

        // 4. Check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        const creditsRequired = calculateTranslationCredits(text.length, includePhonetic, translationPair);

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Cette traduction nécessite ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 5. Try dictionary-based translation first for simple phrases
        let finalResult = '';
        let methodUsed: 'gemini' | 'dictionary' | 'hybrid' = 'gemini';
        let confidence = 0;

        // Pour les langues locales avec support limité sur Gemini
        const needsSpecialHandling = (from === 'fon' || to === 'fon' || from === 'yoruba' || to === 'yoruba');

        if (needsSpecialHandling && useDictionary) {
            // Essayer d'abord le dictionnaire
            const dictResult = simpleTranslate(text, from, to);
            
            if (dictResult.confidence > 70) {
                // Si le dictionnaire est confiant, l'utiliser
                finalResult = dictResult.translation;
                methodUsed = 'dictionary';
                confidence = dictResult.confidence;
            } else {
                // Sinon, passer par Gemini avec un prompt enrichi
                methodUsed = 'hybrid';
            }
        }

        // 6. If not using dictionary or hybrid needed, use AI
        if (methodUsed !== 'dictionary') {
            const groqApiKey = process.env.GROQ_API_KEY;
            const geminiApiKey = process.env.GEMINI_API_KEY;

            if (!groqApiKey && !geminiApiKey) {
                return NextResponse.json({
                    error: 'Configuration manquante',
                    details: 'Aucun service de traduction disponible',
                    trace_id: traceId,
                }, { status: 503 });
            }

            // Construire le prompt
            const prompt = buildTranslationPrompt(text.trim(), from, to, includePhonetic);
            const systemPrompt = `Tu es un traducteur expert spécialisé dans les langues africaines.
Tu maîtrises parfaitement le Français, le Fon (Fɔ̀ngbè) et le Yoruba (Yorùbá).

RÈGLES DE TRADUCTION:
- Traduction fidèle mais naturelle
- Préservation du ton et du contexte
- Adaptation culturelle quand nécessaire
- Pour les langues tonales (Fon, Yoruba), respecte les marques tonales`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ];

            // Build provider chain
            const tasks: ProviderTask<Response>[] = [];

            // Gemini marche mieux pour les langues africaines
            if (geminiApiKey && GEMINI_MODEL) {
                tasks.push({
                    name: 'gemini',
                    run: () => runOpenAICompatibleChat({
                        provider: 'gemini',
                        baseUrl: GEMINI_API_BASE,
                        apiKey: geminiApiKey,
                        model: GEMINI_MODEL,
                        messages,
                        maxTokens: includePhonetic ? 3072 : 2048,
                    }),
                    canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
                });
            }

            if (groqApiKey && GROQ_MODEL) {
                tasks.push({
                    name: 'groq',
                    run: () => runOpenAICompatibleChat({
                        provider: 'groq',
                        baseUrl: GROQ_API_BASE,
                        apiKey: groqApiKey,
                        model: GROQ_MODEL,
                        messages,
                        maxTokens: includePhonetic ? 3072 : 2048,
                    }),
                    canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
                });
            }

            const providerResult = await runProviderChain<Response>(tasks, { purpose: 'translate' });
            const response = providerResult.result;

            // Extract content from stream
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let aiContent = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    aiContent += content;
                                }
                            } catch {
                                // ignore
                            }
                        }
                    }
                }
                finalResult = aiContent;
            }

            confidence = translationPair.estimatedAccuracy;
        }

        // 7. Get phonetic if requested
        let phoneticGuide: string | null = null;
        if (includePhonetic && LANGUAGE_CONFIG[to].phoneticAvailable) {
            phoneticGuide = getPhonetic(finalResult, to);
        }

        // 8. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 9. Record generation
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'translate',
            prompt: text.substring(0, 200),
            result_url: null,
            metadata: {
                from,
                to,
                original_length: text.length,
                method: methodUsed,
                confidence,
                include_phonetic: includePhonetic,
                provider: methodUsed === 'dictionary' ? 'dictionary' : 'gemini',
            },
            credits_used: creditsRequired,
        });

        // 10. Return result (not streaming for translation - on veut le résultat complet)
        return NextResponse.json({
            success: true,
            translation: finalResult,
            phonetic: phoneticGuide,
            from,
            to,
            method: methodUsed,
            confidence,
            credits_used: creditsRequired,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
            trace_id: traceId,
        });

    } catch (error) {
        console.error('[TranslateAPI] Error:', error);
        
        return NextResponse.json({
            error: 'Erreur du service de traduction',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 502 });
    }
}
