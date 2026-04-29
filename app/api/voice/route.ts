import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/voice — Assistant Vocal Multilingue
 * 
 * Flow:
 * 1. Receives audio file via FormData
 * 2. Transcribes audio using Groq Whisper API
 * 3. Structures the transcription using LLM via SSE
 *
 * Body: FormData with:
 *   - audio: File (webm, ogg, mp3, m4a, wav)
 *   - language: 'auto' | 'fr' | 'en' | etc.
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;
const WHISPER_MODEL = 'whisper-large-v3'; // Or whisper-large-v3-turbo

function calculateCredits(audioSize: number): number {
    // Basic estimation based on file size (e.g., 1MB = ~1 min = 1 credit)
    const mbSize = audioSize / (1024 * 1024);
    if (mbSize < 1) return 1;
    if (mbSize < 5) return 2;
    if (mbSize < 10) return 3;
    return 5;
}

function buildStructuringPrompt(transcription: string): string {
    return `Tu es l'Assistant Vocal de JadaRiseLabs, expert en structuration de mémos vocaux et requêtes orales (notamment en Afrique de l'Ouest).
Voici la transcription textuelle d'un message audio de l'utilisateur :

TRANSCRIPTION BRUTE:
---
${transcription}
---

MISSION :
Analyse cette transcription et structure-la au format Markdown. Fournis une réponse claire et actionnable comprenant :

1. **📝 Résumé du Message :** Un court résumé de l'intention principale.
2. **✅ Actions / Tâches :** Liste des tâches ou actions à effectuer (si applicable).
3. **💡 Réponse Suggérée :** Une suggestion de réponse professionnelle ou la réponse directe à la question posée dans l'audio.

Adapte ton ton pour être poli, professionnel et concis. Réponds en français.`;
}

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
            temperature: 0.4,
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
    const traceId = `voc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;
        const language = (formData.get('language') as string) || 'auto';

        if (!audioFile) {
            return NextResponse.json({
                error: 'Contenu requis',
                details: 'Fournissez un fichier audio à transcrire',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 3. Validate audio file
        const supportedTypes = [
            'audio/webm', 'audio/ogg', 'audio/mp3', 'audio/mpeg',
            'audio/m4a', 'audio/wav', 'audio/mp4', 'video/webm'
        ];
        
        // Some browsers send audio/mp4 for m4a, video/webm for webm audio.
        // We will be permissive here and rely on the Groq API to reject invalid formats.
        if (audioFile.size > 25 * 1024 * 1024) { // Groq Whisper limit is 25MB
            return NextResponse.json({
                error: 'Fichier trop volumineux',
                details: 'La taille maximale autorisée est de 25 MB',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 4. Calculate credits
        const creditsRequired = calculateCredits(audioFile.size);

        // 5. Check credits
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
                details: `Cette action nécessite ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 6. Transcribe using Groq Whisper API
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
             return NextResponse.json({
                error: 'Configuration manquante',
                details: 'Clé API Groq non configurée',
                trace_id: traceId,
            }, { status: 503 });
        }

        const whisperFormData = new FormData();
        whisperFormData.append('file', audioFile);
        whisperFormData.append('model', WHISPER_MODEL);
        if (language && language !== 'auto') {
            whisperFormData.append('language', language);
        }

        const whisperResponse = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
            },
            body: whisperFormData,
        });

        if (!whisperResponse.ok) {
             const errorData = await whisperResponse.json().catch(() => ({}));
             return NextResponse.json({
                error: 'Erreur de transcription',
                details: errorData.error?.message || 'Impossible de transcrire l\'audio',
                trace_id: traceId,
             }, { status: whisperResponse.status });
        }

        const whisperResult = await whisperResponse.json();
        const transcription = whisperResult.text;

        if (!transcription || transcription.trim().length === 0) {
            return NextResponse.json({
                error: 'Audio vide ou inaudible',
                details: 'Aucun texte n\'a pu être extrait de l\'enregistrement',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 7. Structure the text with LLM
        const prompt = buildStructuringPrompt(transcription);
        const messages = [
            {
                role: 'system',
                content: 'Tu es un assistant IA spécialisé dans la compréhension et la structuration de la parole.'
            },
            { role: 'user', content: prompt },
        ];

        // 8. Build provider chain for structuring
        const geminiApiKey = process.env.GEMINI_API_KEY;

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
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        tasks.push({
            name: 'groq',
            run: () => runOpenAICompatibleChat({
                provider: 'groq',
                baseUrl: GROQ_API_BASE,
                apiKey: groqApiKey,
                model: GROQ_MODEL,
                messages,
            }),
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'voice_structuring' });
        const response = providerResult.result;

        // 9. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 10. Record generation
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'voice',
            prompt: `Audio transcription: ${transcription.substring(0, 200)}...`,
            result_url: null,
            metadata: {
                filename: audioFile.name,
                file_size: audioFile.size,
                file_type: audioFile.type,
                transcription: transcription,
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
                if (!reader) { controller.close(); return; }
                const encoder = new TextEncoder();

                // Send metadata and raw transcription first
                const meta = {
                    trace_id: traceId,
                    credits_used: creditsRequired,
                    remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
                    provider: providerResult.provider,
                    transcription: transcription
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
                                    // skip malformed
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
        console.error('[VoiceAPI] Error:', error);

        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json({
                error: 'Trop de requêtes',
                details: 'Limite atteinte. Patientez quelques secondes.',
                trace_id: traceId,
            }, { status: 429 });
        }

        return NextResponse.json({
            error: 'Erreur du service',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 502 });
    }
}
