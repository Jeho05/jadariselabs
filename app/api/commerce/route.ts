import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/commerce — Assistant Commerce
 * Streaming SSE response
 *
 * Body: {
 *   action: 'message' | 'invoice' | 'catalog',
 *   data: any // depends on action
 * }
 */

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
}: {
    provider: 'groq' | 'gemini';
    baseUrl: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
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
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(provider, errorText.substring(0, 200), response.status);
    }

    return response;
}

function buildCommercePrompt(action: string, data: any): string {
    if (action === 'message') {
        return `Tu es un assistant commercial expert pour les PME en Afrique.
Objectif : Rédiger un message WhatsApp ou Email clair, professionnel et engageant pour un client.

Données du client et de la requête :
- Nom du client : ${data.clientName || 'Non spécifié'}
- Contexte/Sujet : ${data.context}
- Ton souhaité : ${data.tone || 'Professionnel mais chaleureux'}
- Langue : ${data.language || 'Français'}

Instructions :
Rédige le message prêt à être envoyé. S'il s'agit d'un message WhatsApp, utilise quelques emojis pertinents. Ne mets pas de commentaires, donne uniquement le texte du message.`;
    } 
    
    if (action === 'invoice') {
        const items = data.items.map((i: any) => `- ${i.desc} : ${i.qty} x ${i.price} = ${i.qty * i.price}`).join('\n');
        return `Tu es un assistant comptable pour une PME africaine.
Objectif : Rédiger le corps d'une facture ou d'un devis au format texte clair et structuré.

Détails :
- Client : ${data.clientName}
- Articles :
${items}
- Devise : ${data.currency || 'FCFA'}
- Total estimé : ${data.total}
- Notes additionnelles : ${data.notes || 'Aucune'}

Instructions :
Génère un joli document texte (Markdown) avec :
1. En-tête (Facture / Devis)
2. Coordonnées (à remplir) et Date
3. Tableau récapitulatif propre
4. Total clairement visible
5. Message de remerciement professionnel à la fin.`;
    }

    return `Tu es un assistant commercial. Réponds à la requête suivante : ${JSON.stringify(data)}`;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `com_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Body JSON invalide', trace_id: traceId }, { status: 400 });
        }

        const { action, data } = body;
        if (!action || !data) {
            return NextResponse.json({ error: 'Action et data requis', trace_id: traceId }, { status: 400 });
        }

        const creditsRequired = action === 'invoice' ? 2 : 1;

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
                details: `Cette action nécessite ${creditsRequired} crédit(s).`,
                trace_id: traceId,
            }, { status: 402 });
        }

        const prompt = buildCommercePrompt(action, data);
        const messages = [
            { role: 'system', content: 'Tu es l\'Assistant Commerce de JadaRiseLabs, expert en relation client et vente.' },
            { role: 'user', content: prompt }
        ];

        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!groqApiKey && !geminiApiKey) {
            return NextResponse.json({ error: 'Configuration manquante', trace_id: traceId }, { status: 503 });
        }

        const tasks: ProviderTask<Response>[] = [];

        if (geminiApiKey && GEMINI_MODEL) {
            tasks.push({
                name: 'gemini',
                run: () => runOpenAICompatibleChat({ provider: 'gemini', baseUrl: GEMINI_API_BASE, apiKey: geminiApiKey, model: GEMINI_MODEL, messages }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        if (groqApiKey) {
            tasks.push({
                name: 'groq',
                run: () => runOpenAICompatibleChat({ provider: 'groq', baseUrl: GROQ_API_BASE, apiKey: groqApiKey, model: GROQ_MODEL, messages }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'commerce' });
        const response = providerResult.result;

        if (profile.credits !== -1) {
            await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'commerce',
            prompt: `Action: ${action}`,
            metadata: { action, provider: providerResult.provider },
            credits_used: creditsRequired,
        });

        // Stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) { controller.close(); return; }
                const encoder = new TextEncoder();
                
                const meta = {
                    trace_id: traceId,
                    credits_used: creditsRequired,
                    remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
                    provider: providerResult.provider,
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
                                const chunkData = line.slice(6).trim();
                                if (chunkData === '[DONE]') {
                                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                                    continue;
                                }
                                try {
                                    const parsed = JSON.parse(chunkData);
                                    const content = parsed.choices?.[0]?.delta?.content;
                                    if (content) {
                                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                    }
                                } catch { /* skip */ }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
    } catch (error) {
        console.error('[CommerceAPI] Error:', error);
        return NextResponse.json({ error: 'Erreur du service', details: error instanceof Error ? error.message : 'Erreur inconnue', trace_id: traceId }, { status: 502 });
    }
}
