import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/workflow — Mini-Workflows (MVP)
 * Exécution séquentielle de tâches d'IA simples.
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

async function runStep(stepType: string, input: string, apiKeyGroq: string, apiKeyGemini: string | undefined): Promise<string> {
    let prompt = '';
    switch (stepType) {
        case 'summarize':
            prompt = `Fais un résumé concis et professionnel du texte suivant :\n\n${input}`;
            break;
        case 'translate_en':
            prompt = `Traduis le texte suivant en anglais professionnel :\n\n${input}`;
            break;
        case 'translate_fr':
            prompt = `Traduis le texte suivant en français professionnel :\n\n${input}`;
            break;
        case 'email':
            prompt = `Rédige un email formel basé sur les informations suivantes :\n\n${input}`;
            break;
        case 'action_items':
            prompt = `Extrais une liste claire de tâches à faire (action items) à partir de ce texte. Présente-les sous forme de liste à puces :\n\n${input}`;
            break;
        default:
            prompt = `Traite le texte suivant selon l'action "${stepType}" :\n\n${input}`;
    }

    const messages = [
        { role: 'system', content: 'Tu es un assistant expert et précis. Réponds directement au prompt sans introduction.' },
        { role: 'user', content: prompt }
    ];

    const tasks: ProviderTask<string>[] = [];
    if (apiKeyGroq) {
        tasks.push({
            name: 'groq',
            run: async () => {
                const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${apiKeyGroq}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.3 })
                });
                if (!res.ok) throw new ProviderError('groq', await res.text(), res.status);
                const data = await res.json();
                return data.choices[0].message.content as string;
            },
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });
    }
    
    if (apiKeyGemini && GEMINI_MODEL) {
        tasks.push({
            name: 'gemini',
            run: async () => {
                const res = await fetch(`${GEMINI_API_BASE}/chat/completions`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${apiKeyGemini}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: GEMINI_MODEL, messages, temperature: 0.3 })
                });
                if (!res.ok) throw new ProviderError('gemini', await res.text(), res.status);
                const data = await res.json();
                return data.choices[0].message.content as string;
            },
            canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
        });
    }

    if (tasks.length === 0) throw new Error("Aucun provider configuré");

    const result = await runProviderChain<string>(tasks, { purpose: 'workflow_step' });
    return result.result;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        const body = await request.json();
        const { input, steps } = body as { input: string; steps: string[] };

        if (!input || !steps || !Array.isArray(steps) || steps.length === 0) {
            return NextResponse.json({ error: 'Input et steps requis', trace_id: traceId }, { status: 400 });
        }

        const creditsRequired = steps.length;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({ error: 'Crédits insuffisants', details: `Requis: ${creditsRequired}` }, { status: 402 });
        }

        const groqApiKey = process.env.GROQ_API_KEY || '';
        const geminiApiKey = process.env.GEMINI_API_KEY;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'meta', remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired })}\n\n`));

                let currentInput = input;
                try {
                    for (let i = 0; i < steps.length; i++) {
                        const step = steps[i];
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', stepIndex: i, stepName: step, status: 'running' })}\n\n`));
                        
                        currentInput = await runStep(step, currentInput, groqApiKey, geminiApiKey);
                        
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', stepIndex: i, stepName: step, status: 'done', result: currentInput })}\n\n`));
                    }
                    
                    if (profile.credits !== -1) {
                        await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
                    }
                    
                    await supabase.from('generations').insert({
                        user_id: user.id,
                        type: 'workflow',
                        prompt: `Steps: ${steps.join(' -> ')}`,
                        metadata: { steps, originalInput: input.substring(0, 100) },
                        credits_used: creditsRequired,
                    });

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', finalResult: currentInput })}\n\n`));
                } catch (error) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Erreur interne' })}\n\n`));
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
