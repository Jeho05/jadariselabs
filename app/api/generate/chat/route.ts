import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/generate/chat — Chat IA via Groq (LLaMA 3.3 70B)
 * Streaming SSE response
 *
 * Body: { message: string, conversationId?: string }
 * Returns: ReadableStream (SSE) or JSON error
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const CREDITS_PER_MESSAGE = 1;

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

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier la clé API Groq
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        return NextResponse.json(
            {
                error: 'Configuration manquante',
                details:
                    'GROQ_API_KEY non configurée. Ajoutez-la dans .env.local pour activer le Chat IA.',
            },
            { status: 503 }
        );
    }

    // Parse body
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
    }

    const { message, history } = body as {
        message: string;
        history?: Array<{ role: string; content: string }>;
    };

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
        // Appel Groq API avec streaming
        const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 0.9,
            }),
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('Groq API error:', groqResponse.status, errorText);

            if (groqResponse.status === 429) {
                return NextResponse.json(
                    {
                        error: 'Trop de requêtes',
                        details:
                            'Limite de requêtes atteinte. Veuillez patienter quelques secondes et réessayer.',
                    },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Erreur du service IA',
                    details: 'Le service de chat IA est temporairement indisponible.',
                },
                { status: 502 }
            );
        }

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
            metadata: { model: GROQ_MODEL, streaming: true },
            credits_used: CREDITS_PER_MESSAGE,
        });

        // Streaming SSE
        const reader = groqResponse.body?.getReader();
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

                        for (const line of lines) {
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
        console.error('Chat API error:', error);
        return NextResponse.json(
            {
                error: 'Erreur interne',
                details: 'Une erreur inattendue est survenue.',
            },
            { status: 500 }
        );
    }
}
