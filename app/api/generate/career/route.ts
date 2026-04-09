import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';
import { getTemplatesByType, buildCareerPrompt } from '@/lib/prompts/career-templates';

/**
 * POST /api/generate/career — Générateur de CV et lettres de motivation
 * Streaming SSE response
 *
 * Body: {
 *   documentType: 'cv' | 'cover-letter',
 *   templateId: string,
 *   formData: {
 *     name, email, phone, jobTitle, companyName, sector, experienceLevel,
 *     experiences, education, skills, achievements, motivation, strengths...
 *   }
 * }
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

const CREDITS_CV = 3;
const CREDITS_COVER_LETTER = 2;
const CREDITS_PACK = 4; // CV + Lettre

function calculateCredits(documentType: string, isPack: boolean): number {
    if (isPack) return CREDITS_PACK;
    return documentType === 'cv' ? CREDITS_CV : CREDITS_COVER_LETTER;
}

// Logic moved to lib/prompts/career-templates.ts

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
            temperature: 0.4, // Low temp for strict JSON adherence
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
    const traceId = `car_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
            documentType,
            templateId,
            formData,
            generateBoth = false,
        } = body;

        // 3. Validation
        if (!documentType || !['cv', 'cover-letter'].includes(documentType)) {
            return NextResponse.json({ error: 'Type de document invalide', trace_id: traceId }, { status: 400 });
        }

        if (!formData || typeof formData !== 'object') {
            return NextResponse.json({ error: 'Données du formulaire manquantes', trace_id: traceId }, { status: 400 });
        }

        const requiredFields = ['name', 'email', 'jobTitle'];
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                return NextResponse.json({
                    error: 'Champs requis manquants',
                    details: `Le champ ${field} est obligatoire`,
                    trace_id: traceId,
                }, { status: 400 });
            }
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

        const creditsRequired = calculateCredits(documentType, generateBoth);

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Cette génération nécessite ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 5. Build prompts
        let systemPrompt = '';
        let finalPrompt = '';

        // JSON enforcement prefix for CV generation
        const JSON_ENFORCEMENT = `RÈGLE ABSOLUE ET NON-NÉGOCIABLE:
- Tu DOIS répondre UNIQUEMENT avec du JSON brut valide.
- AUCUN texte avant le JSON. AUCUN texte après le JSON.
- PAS de \`\`\`json ni de \`\`\`. PAS de "Voici le CV". PAS d'explication.
- Ta réponse COMMENCE par { et SE TERMINE par }.
- Si tu ajoutes quoi que ce soit d'autre que du JSON pur, la réponse sera rejetée.`;

        if (generateBoth) {
            const cvTemplates = getTemplatesByType('cv');
            const clTemplates = getTemplatesByType('cover-letter');
            const cvTpl = cvTemplates.find(t => t.id === templateId) || cvTemplates[0];
            const clTpl = clTemplates[0];

            systemPrompt = `${JSON_ENFORCEMENT}\n\n${cvTpl.systemPrompt}\n\nTu dois générer UN SEUL objet JSON contenant deux clés: "cv" (objet JSON du CV) et "coverLetter" (string markdown de la lettre).`;
            const cvPrompt = buildCareerPrompt(cvTpl, formData);
            const clPrompt = buildCareerPrompt(clTpl, formData);
            
            finalPrompt = `Génère les deux documents. RETOURNE UNIQUEMENT LE JSON, rien d'autre.\n\nCV requis:\n${cvPrompt}\n\nLettre requise:\n${clPrompt}`;
        } else if (documentType === 'cv') {
            const templates = getTemplatesByType('cv');
            const tpl = templates.find(t => t.id === templateId) || templates[0];
            systemPrompt = `${JSON_ENFORCEMENT}\n\n${tpl.systemPrompt}`;
            finalPrompt = buildCareerPrompt(tpl, formData);
        } else {
            // Cover letter: no JSON enforcement needed, just text
            const templates = getTemplatesByType('cover-letter');
            const tpl = templates.find(t => t.id === templateId) || templates[0];
            systemPrompt = tpl.systemPrompt;
            finalPrompt = buildCareerPrompt(tpl, formData);
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: finalPrompt },
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
        const maxTokens = generateBoth ? 6144 : 4096;

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
        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'career' });
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
            type: 'career',
            prompt: `Document: ${documentType} pour ${formData.jobTitle}`,
            result_url: null,
            metadata: {
                document_type: documentType,
                template_id: templateId,
                job_title: formData.jobTitle,
                company_name: formData.companyName,
                sector: formData.sector,
                generate_both: generateBoth,
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
                    document_type: documentType,
                    generate_both: generateBoth,
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
        console.error('[CareerAPI] Error:', error);
        
        return NextResponse.json({
            error: 'Erreur du service IA',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 502 });
    }
}
