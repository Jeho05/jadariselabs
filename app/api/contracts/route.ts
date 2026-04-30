import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';
import { extractDocumentContent } from '@/lib/document-processor';

/**
 * POST /api/contracts — Lecteur de Contrats
 * Analyse juridique simplifiée
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `contract_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        
        if (!file) {
            return NextResponse.json({ error: 'Fichier requis', trace_id: traceId }, { status: 400 });
        }

        const creditsRequired = 3;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({ error: 'Crédits insuffisants', details: `Requis: ${creditsRequired}` }, { status: 402 });
        }

        // Extraction
        const extracted = await extractDocumentContent(file);
        const extractedText = extracted?.text || '';
        if (!extractedText || extractedText.length < 50) {
            return NextResponse.json({ error: 'Texte insuffisant ou illisible' }, { status: 400 });
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) return NextResponse.json({ error: 'API Key manquante' }, { status: 503 });

        const prompt = `Tu es un juriste spécialisé en droit des affaires et contrats.
Analyse le contrat suivant et structure ta réponse ainsi en Markdown :

### 📋 Résumé du Contrat
[Bref résumé des parties et de l'objet]

### ⚖️ Obligations principales
- [Liste à puces des obligations clés]

### ⚠️ Risques identifiés (Important)
- [Liste à puces des clauses dangereuses, ambiguës ou manquantes]

### 💡 Recommandations
- [Conseils avant de signer]

Voici le texte du contrat :
---
${extractedText.substring(0, 20000)}
---`;

        const messages = [
            { role: 'system', content: 'Tu es un assistant juridique expert.' },
            { role: 'user', content: prompt }
        ];

        const tasks: ProviderTask<Response>[] = [
            {
                name: 'groq',
                run: async () => {
                    const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model: GROQ_MODEL, messages, stream: true, temperature: 0.2 })
                    });
                    if (!res.ok) throw new ProviderError('groq', await res.text(), res.status);
                    return res;
                },
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            }
        ];

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'contracts' });
        const response = providerResult.result;

        if (profile.credits !== -1) {
            await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'contract',
            prompt: `Analyse de ${file.name}`,
            metadata: { filename: file.name, provider: providerResult.provider },
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
