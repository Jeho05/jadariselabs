import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';
import { DocumentProcessor } from '@/lib/document-processor';

/**
 * POST /api/coach — Coach Scolaire
 * Analyse de documents (PDF, images, texte) pour générer des quiz, fiches de révision ou corrections.
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

function getSystemPrompt(action: string): string {
    if (action === 'fiches') {
        return `Tu es un professeur expert. Crée des fiches de révision claires et concises basées sur le document fourni.
Format obligatoire :
## 📌 Concept 1 : [titre du concept]
**Définition** : [...]
**Points clés** : 
- [...]
- [...]
**Exemple** : [...]
**Astuce mémo** : [mnémotechnique ou phrase clé courte]
---
(Répéter pour chaque concept majeur trouvé dans le texte)`;
    } else if (action === 'correction') {
        return `Tu es un professeur correcteur bienveillant mais exigeant.
Analyse le texte suivant fourni par un élève et fournis une correction détaillée.
Format obligatoire :
## 📊 Note estimée globale : [X/20] (à titre indicatif)
## ✅ Points forts
- [...]
## ⚠️ Points à améliorer
- [...]
## 📝 Corrections détaillées
(Cite le passage original avec une erreur → correction → explication claire)
## 💡 Conseils pour progresser`;
    } else {
        // default to quiz
        return `Tu es un professeur expert. Génère un QCM (Quiz) de 10 questions pertinent basé sur ce contenu pour tester les connaissances.
Format obligatoire pour chaque question :
### Question [N]
**Énoncé** : [Ta question claire]
- A) [option 1]
- B) [option 2]  
- C) [option 3]
- D) [option 4]
**Réponse** : [Lettre correcte] — [Explication courte de la bonne réponse]`;
    }
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `coach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const textInput = formData.get('text') as string | null;
        const action = (formData.get('action') as string) || 'quiz';
        const subject = (formData.get('subject') as string) || '';

        if (!file && !textInput) {
            return NextResponse.json({ error: 'Un fichier ou du texte est requis' }, { status: 400 });
        }

        const creditsRequired = 1;
        const { data: profile, error: profileError } = await supabase.from('profiles').select('id, credits').eq('id', user.id).single();

        if (profileError || !profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({ error: 'Crédits insuffisants', details: `Requis: ${creditsRequired}` }, { status: 402 });
        }

        let content = textInput || '';
        if (file) {
            const processor = new DocumentProcessor();
            const buffer = Buffer.from(await file.arrayBuffer());
            content = await processor.extractText(buffer, file.type);
        }

        const systemPrompt = getSystemPrompt(action);
        const userPrompt = `${subject ? `Matière : ${subject}\n\n` : ''}Contenu de l'étudiant/cours :\n${content}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
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
                        body: JSON.stringify({ model: GROQ_MODEL, messages, stream: true, temperature: 0.7 })
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
                        body: JSON.stringify({ model: GEMINI_MODEL, messages, stream: true, temperature: 0.7 })
                    });
                    if (!res.ok) throw new ProviderError('gemini', await res.text(), res.status);
                    return res;
                },
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'coach' });
        const response = providerResult.result;

        if (profile.credits !== -1) {
            await supabase.from('profiles').update({ credits: profile.credits - creditsRequired }).eq('id', user.id);
        }

        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'coach',
            prompt: `Action: ${action} | Sujet: ${subject}`,
            metadata: { action, subject, provider: providerResult.provider, hasFile: !!file },
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
        console.error('Coach Error:', error);
        return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
    }
}
