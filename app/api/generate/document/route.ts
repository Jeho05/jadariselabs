import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/generate/document — Résumé et analyse de documents
 * Streaming SSE response
 *
 * Body: FormData with:
 *   - file: File (PDF, image, text)
 *   - format: 'summary' | 'bullets' | 'mindmap' | 'key-points'
 *   - detail: 'short' | 'medium' | 'detailed'
 *   - focus?: string (sujet particulier)
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

// Calculer les crédits selon la taille
function calculateCredits(wordCount: number): number {
    if (wordCount < 1000) return 2;
    if (wordCount < 5000) return 5;
    return 10;
}

// Construire le prompt de résumé
function buildSummaryPrompt(
    content: string,
    format: string,
    detail: string,
    focus?: string
): string {
    const formatDescriptions: Record<string, string> = {
        'summary': 'un résumé textuel fluide et cohérent en français',
        'bullets': 'une liste de points clés avec puces (•)',
        'mindmap': 'une structure hiérarchique type carte mentale avec niveaux (─, ├, └)',
        'key-points': 'les points essentiels numérotés avec citations du texte',
    };
    
    const detailLevels: Record<string, string> = {
        'short': 'court (10-15% du texte original)',
        'medium': 'moyen (20-25% du texte original)',
        'detailed': 'détaillé (30-40% du texte original)',
    };
    
    return `Tu es un expert en analyse et synthèse de documents.

MISSION: Rédige ${formatDescriptions[format]}
NIVEAU: ${detailLevels[detail]}
${focus ? `FOCUS: Mets en avant les aspects liés à "${focus}"` : ''}

DOCUMENT À ANALYSER:
---
${content}
---

RÈGLES:
1. Respecte strictement le niveau de détail demandé
2. Garde les informations factuelles importantes
3. Présente les idées dans un ordre logique
4. Utilise du français professionnel
5. ${format === 'mindmap' ? 'Structure avec indentation claire' : 'Sois concis mais complet'}

Réponds DIRECTEMENT avec le résumé, sans introduction ni conclusion.`;
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
            temperature: 0.5, // Plus bas pour plus de cohérence
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
    const traceId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const format = (formData.get('format') as string) || 'summary';
        const detail = (formData.get('detail') as string) || 'medium';
        const focus = (formData.get('focus') as string) || undefined;

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni', trace_id: traceId }, { status: 400 });
        }

        // 3. Validate file type
        const supportedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
            'text/plain',
        ];
        
        if (!supportedTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Type de fichier non supporté',
                details: 'Formats acceptés: PDF, PNG, JPG, WEBP, TXT',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 4. Extract text from file
        let extractedText = '';
        
        if (file.type === 'text/plain') {
            extractedText = await file.text();
        } else {
            // Pour PDF et images, on passe par l'OCR
            // Note: En production, il faudrait un vrai parser PDF côté serveur
            const ocrFormData = new FormData();
            ocrFormData.append('file', file);
            
            // Appel interne à l'API OCR
            const ocrResponse = await fetch(`${request.nextUrl.origin}/api/generate/ocr`, {
                method: 'POST',
                body: ocrFormData,
                headers: {
                    'Cookie': request.headers.get('cookie') || '',
                },
            });
            
            if (!ocrResponse.ok) {
                const errorData = await ocrResponse.json().catch(() => ({}));
                return NextResponse.json({
                    error: 'Erreur d\'extraction',
                    details: errorData.error || 'Impossible d\'extraire le texte du document',
                    trace_id: traceId,
                }, { status: 500 });
            }
            
            const ocrData = await ocrResponse.json();
            extractedText = ocrData.text || ocrData.markdown || '';
        }

        if (!extractedText || extractedText.length < 10) {
            return NextResponse.json({
                error: 'Document vide',
                details: 'Aucun texte n\'a pu être extrait du document',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 5. Calculate credits based on length
        const wordCount = extractedText.split(/\s+/).length;
        const creditsRequired = calculateCredits(wordCount);

        // 6. Check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Ce document nécessite ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 7. Truncate if too long
        const maxChars = 15000; // ~3000-4000 tokens
        const truncatedText = extractedText.length > maxChars 
            ? extractedText.substring(0, maxChars) + '\n\n[... Document tronqué pour traitement]'
            : extractedText;

        // 8. Build prompt and run generation
        const prompt = buildSummaryPrompt(truncatedText, format, detail, focus);
        const messages = [
            { role: 'system', content: 'Tu es un expert en synthèse documentaire. Tu résumes des documents de façon claire et structurée.' },
            { role: 'user', content: prompt },
        ];

        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!groqApiKey && !geminiApiKey) {
            return NextResponse.json({
                error: 'Configuration manquante',
                details: 'Aucun fournisseur IA configuré',
                trace_id: traceId,
            }, { status: 503 });
        }

        // Build provider chain
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
                    maxTokens: detail === 'detailed' ? 8192 : 4096,
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
                    maxTokens: detail === 'detailed' ? 4096 : 2048,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'document' });
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
            type: 'document',
            prompt: `Document: ${file.name} (${wordCount} mots)`,
            result_url: null,
            metadata: {
                filename: file.name,
                file_type: file.type,
                file_size: file.size,
                word_count: wordCount,
                format,
                detail,
                focus: focus || null,
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
                    word_count: wordCount,
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
        console.error('[DocumentAPI] Error:', error);
        
        return NextResponse.json({
            error: 'Erreur du service IA',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 502 });
    }
}
