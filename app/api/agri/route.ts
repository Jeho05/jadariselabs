import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/agri — Assistant Agriculture (Vision)
 * Analyse d'images de plantes pour le diagnostic
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GEMINI_MODEL = 'gemini-2.5-flash';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `agri_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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

        const { imageBase64, question, location } = body;
        if (!imageBase64) {
            return NextResponse.json({ error: 'Image requise', trace_id: traceId }, { status: 400 });
        }

        const creditsRequired = 2; // Vision costs more

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

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Clé API Gemini non configurée', trace_id: traceId }, { status: 503 });
        }

        // Clean base64 string
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const promptText = `Tu es un expert agricole spécialiste des cultures d'Afrique de l'Ouest (Bénin, Togo, etc.).
Analyse cette image de plante/culture.
Localisation/Région (si fournie) : ${location || 'Non spécifiée'}
Question de l'agriculteur : ${question || 'Identifie cette plante et dis-moi si elle est en bonne santé.'}

Réponds au format Markdown avec :
1. Identification de la plante (nom commun et scientifique).
2. Diagnostic de santé (maladies, parasites, carences visibles).
3. Conseils de traitement pratiques et accessibles (bio si possible).
4. Recommandations pour la culture dans cette région.`;

        // OpenAI Vision format for Gemini
        const messages = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: promptText },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
                ]
            }
        ];

        const response = await fetch(`${GEMINI_API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GEMINI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GEMINI_MODEL,
                messages,
                stream: true,
                temperature: 0.4,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini Vision Error:', errorText);
            return NextResponse.json({ error: 'Erreur d\'analyse d\'image par l\'IA', trace_id: traceId }, { status: 502 });
        }

        if (profile.credits !== -1) {
            await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'agriculture',
            prompt: question || 'Analyse d\'image',
            metadata: { location, provider: 'gemini-vision' },
            credits_used: creditsRequired,
        });

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
                    provider: 'gemini',
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
        console.error('[AgriAPI] Error:', error);
        return NextResponse.json({ error: 'Erreur du service', details: error instanceof Error ? error.message : 'Erreur inconnue', trace_id: traceId }, { status: 502 });
    }
}
