import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/comms — Copilote Communication
 * Rédaction et reformulation d'emails et messages professionnels.
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `comms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        const body = await request.json();
        const { action, input, tone, format, language } = body as {
            action: 'generate' | 'rewrite';
            input: string;
            tone?: string;
            format?: string;
            language?: string;
        };

        if (!input) return NextResponse.json({ error: 'Texte d\'entrée requis' }, { status: 400 });

        const creditsRequired = 1;
        const { data: profile, error: profileError } = await supabase.from('profiles').select('id, credits').eq('id', user.id).single();

        if (profileError || !profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({ error: 'Crédits insuffisants', details: `Requis: ${creditsRequired}` }, { status: 402 });
        }

        let prompt = '';
        if (action === 'generate') {
            prompt = `Tu es un expert en communication professionnelle.
Rédige un texte clair et impactant basé sur les indications suivantes :

Contexte / Sujet : ${input}
Format souhaité : ${format || 'Email formel'}
Ton de la voix : ${tone || 'Professionnel et cordial'}
Langue : ${language || 'Français'}

Instructions : Ne donne que le texte final, sans commentaires ni formules d'introduction de l'IA.`;
        } else {
            prompt = `Tu es un expert en communication professionnelle.
Reformule et améliore le texte suivant pour qu'il soit parfait :

Texte d'origine :
"${input}"

Format cible : ${format || 'Même que l\'origine'}
Ton cible : ${tone || 'Professionnel'}
Langue : ${language || 'Français'}

Instructions : Améliore la grammaire, la clarté et le style. Ne donne que le texte final.`;
        }

        const messages = [
            { role: 'system', content: 'Tu es le Copilote Communication de JadaRiseLabs.' },
            { role: 'user', content: prompt }
        ];

        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!groqApiKey && !geminiApiKey) return NextResponse.json({ error: 'Configuration manquante' }, { status: 503 });

        const tasks: ProviderTask<Response>[] = [];

        if (groqApiKey) {
            tasks.push({
                name: 'groq',
                run: async () => {
                    const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model: GROQ_MODEL, messages, stream: true, temperature: action === 'generate' ? 0.7 : 0.3 })
                    });
                    if (!res.ok) throw new ProviderError('groq', await res.text(), res.status);
                    return res;
                },
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }
        
        if (geminiApiKey && GEMINI_MODEL) {
            tasks.push({
                name: 'gemini',
                run: async () => {
                    const res = await fetch(`${GEMINI_API_BASE}/chat/completions`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${geminiApiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model: GEMINI_MODEL, messages, stream: true, temperature: action === 'generate' ? 0.7 : 0.3 })
                    });
                    if (!res.ok) throw new ProviderError('gemini', await res.text(), res.status);
                    return res;
                },
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'comms' });
        const response = providerResult.result;

        if (profile.credits !== -1) {
            await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'comms',
            prompt: `Action: ${action}`,
            metadata: { action, format, tone, provider: providerResult.provider },
            credits_used: creditsRequired,
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) { controller.close(); return; }
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ meta: { remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired } })}\n\n`));

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
                                    if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
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

        return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
    }
}
