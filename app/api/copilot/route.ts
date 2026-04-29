import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runProviderChain, ProviderError } from '@/lib/provider-router';
import type { ProviderTask } from '@/lib/provider-router';

/**
 * POST /api/copilot — Copilote Administratif IA
 * Streaming SSE response
 *
 * Body: FormData with:
 *   - file?: File (PDF, image, text) — optional if rawText provided
 *   - rawText?: string — direct text input
 *   - action: 'analyze' | 'email' | 'invoice' | 'tasks'
 *   - context?: string — additional context
 *   - emailTone?: 'formal' | 'friendly' | 'urgent'
 *   - invoiceData?: JSON string with {client, items, currency}
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : null;

type CopilotAction = 'analyze' | 'email' | 'invoice' | 'tasks';

function calculateCredits(action: CopilotAction, wordCount: number): number {
    const base = wordCount < 1000 ? 1 : wordCount < 5000 ? 2 : 3;
    switch (action) {
        case 'analyze': return base + 1;
        case 'email': return base;
        case 'invoice': return base;
        case 'tasks': return base;
        default: return base + 1;
    }
}

function buildCopilotPrompt(
    content: string,
    action: CopilotAction,
    context?: string,
    emailTone?: string,
    invoiceData?: string
): string {
    const baseContext = context ? `\nCONTEXTE ADDITIONNEL: ${context}` : '';

    switch (action) {
        case 'analyze':
            return `Tu es un copilote administratif IA expert. Analyse le document suivant et fournis une réponse structurée.
${baseContext}

DOCUMENT:
---
${content.substring(0, 15000)}
---

Fournis ta réponse dans ce format EXACT (en Markdown) :

## 📋 Résumé exécutif
[Résumé clair et concis en 3-5 phrases]

## ✅ Actions identifiées
[Liste numérotée des actions à réaliser, avec deadline si détectable]

## 👥 Contacts / Parties mentionnées
[Noms, rôles, coordonnées détectés]

## 📊 Chiffres clés
[Montants, dates, pourcentages importants]

## ⚠️ Points d'attention
[Risques, urgences, éléments à surveiller]

Sois précis, factuel et professionnel. Réponds en français.`;

        case 'email':
            return `Tu es un assistant de rédaction professionnelle. À partir du contenu suivant, génère un email professionnel.
${baseContext}

CONTENU SOURCE:
---
${content.substring(0, 10000)}
---

TON DEMANDÉ: ${emailTone || 'professionnel'}

Génère un email complet avec:

**Objet:** [Objet percutant]

**Corps de l'email:**
[Salutation adaptée au ton]

[Corps structuré en paragraphes clairs]

[Formule de politesse adaptée au ton]

[Signature]

L'email doit être en français, clair et actionnable. Adapte le ton selon la demande (${emailTone || 'professionnel'}).`;

        case 'invoice': {
            let invoiceContext = '';
            if (invoiceData) {
                try {
                    const parsed = JSON.parse(invoiceData);
                    invoiceContext = `\nINFOS FACTURE:\n- Client: ${parsed.client || 'Non spécifié'}\n- Devise: ${parsed.currency || 'FCFA'}\n- Articles: ${JSON.stringify(parsed.items || [])}`;
                } catch {
                    // ignore parse errors
                }
            }
            return `Tu es un expert comptable. À partir du contenu suivant, génère un devis/facture structuré.
${baseContext}${invoiceContext}

CONTENU SOURCE:
---
${content.substring(0, 10000)}
---

Génère une facture/devis en format Markdown avec:

## 🧾 FACTURE / DEVIS

**Émetteur:** [À remplir]
**Client:** [Détecté ou à remplir]
**Date:** ${new Date().toLocaleDateString('fr-FR')}
**N° Facture:** FAC-${Date.now().toString(36).toUpperCase()}

---

| # | Description | Qté | Prix Unit. | Total |
|---|-------------|-----|-----------|-------|
| 1 | [Service/Produit] | 1 | [Prix] | [Total] |

---

**Sous-total:** [Montant]
**TVA (18%):** [Montant]
**TOTAL TTC:** [Montant]

---

**Conditions de paiement:** [30 jours]
**Méthode:** Mobile Money / Virement

Détecte les montants et éléments du document source. Utilise le FCFA par défaut. Sois précis.`;
        }

        case 'tasks':
            return `Tu es un gestionnaire de projet expert. Extrait toutes les tâches et actions du document suivant.
${baseContext}

DOCUMENT:
---
${content.substring(0, 15000)}
---

Fournis une liste structurée de tâches en Markdown:

## 📋 Plan d'action

| # | Tâche | Priorité | Deadline | Responsable | Statut |
|---|-------|----------|----------|-------------|--------|
| 1 | [Description] | 🔴 Haute / 🟡 Moyenne / 🟢 Basse | [Date] | [Nom] | ⬜ À faire |

## 📅 Timeline suggérée
[Suggestions d'ordonnancement]

## 💡 Recommandations
[Conseils pour l'exécution]

Sois exhaustif. Extrait TOUTES les actions implicites et explicites. Réponds en français.`;

        default:
            return content;
    }
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
    const traceId = `cop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const rawText = formData.get('rawText') as string | null;
        const action = (formData.get('action') as CopilotAction) || 'analyze';
        const context = (formData.get('context') as string) || undefined;
        const emailTone = (formData.get('emailTone') as string) || undefined;
        const invoiceData = (formData.get('invoiceData') as string) || undefined;

        if (!file && !rawText) {
            return NextResponse.json({
                error: 'Contenu requis',
                details: 'Fournissez un fichier ou du texte à analyser',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 3. Extract text content
        let extractedText = '';

        if (rawText) {
            extractedText = rawText;
        } else if (file) {
            // Validate file type
            const supportedTypes = [
                'application/pdf', 'image/png', 'image/jpeg',
                'image/jpg', 'image/webp', 'text/plain',
            ];
            if (!supportedTypes.includes(file.type)) {
                return NextResponse.json({
                    error: 'Type de fichier non supporté',
                    details: 'Formats acceptés: PDF, PNG, JPG, WEBP, TXT',
                    trace_id: traceId,
                }, { status: 400 });
            }

            if (file.type === 'text/plain') {
                extractedText = await file.text();
            } else {
                // Use existing OCR API for PDF/images
                const ocrFormData = new FormData();
                ocrFormData.append('file', file);

                const ocrResponse = await fetch(`${request.nextUrl.origin}/api/generate/ocr`, {
                    method: 'POST',
                    body: ocrFormData,
                    headers: { 'Cookie': request.headers.get('cookie') || '' },
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
        }

        if (!extractedText || extractedText.length < 10) {
            return NextResponse.json({
                error: 'Contenu insuffisant',
                details: 'Le texte extrait est trop court pour être analysé',
                trace_id: traceId,
            }, { status: 400 });
        }

        // 4. Calculate credits
        const wordCount = extractedText.split(/\s+/).length;
        const creditsRequired = calculateCredits(action, wordCount);

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

        // 6. Build prompt
        const prompt = buildCopilotPrompt(extractedText, action, context, emailTone, invoiceData);
        const messages = [
            {
                role: 'system',
                content: 'Tu es le Copilote Administratif de JadaRiseLabs, un assistant IA ultra-efficace spécialisé dans le traitement administratif pour l\'Afrique de l\'Ouest. Tu fournis des réponses structurées, précises et actionnables en français. Tu utilises le FCFA comme devise par défaut.'
            },
            { role: 'user', content: prompt },
        ];

        // 7. Build provider chain
        const groqApiKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!groqApiKey && !geminiApiKey) {
            return NextResponse.json({
                error: 'Configuration manquante',
                details: 'Aucun fournisseur IA configuré',
                trace_id: traceId,
            }, { status: 503 });
        }

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
                    maxTokens: 8192,
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
                    maxTokens: 4096,
                }),
                canFallback: (err: ProviderError) => err.status === 429 || (err.status ?? 0) >= 500,
            });
        }

        const providerResult = await runProviderChain<Response>(tasks, { purpose: 'copilot' });
        const response = providerResult.result;

        // 8. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 9. Record generation
        await supabase.from('generations').insert({
            user_id: user.id,
            type: 'copilot',
            prompt: `Copilote [${action}]: ${(file?.name || rawText?.substring(0, 100) || 'texte').substring(0, 200)}`,
            result_url: null,
            metadata: {
                action,
                filename: file?.name || null,
                file_type: file?.type || 'text',
                word_count: wordCount,
                email_tone: emailTone || null,
                provider: providerResult.provider,
                router: {
                    provider: providerResult.provider,
                    attempts: providerResult.attempts,
                    duration_ms: providerResult.latency_ms,
                },
            },
            credits_used: creditsRequired,
        });

        // 10. Stream response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) { controller.close(); return; }
                const encoder = new TextEncoder();

                // Send metadata first
                const meta = {
                    trace_id: traceId,
                    credits_used: creditsRequired,
                    remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
                    provider: providerResult.provider,
                    word_count: wordCount,
                    action,
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
        console.error('[CopilotAPI] Error:', error);

        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json({
                error: 'Trop de requêtes',
                details: 'Limite atteinte. Patientez quelques secondes.',
                trace_id: traceId,
            }, { status: 429 });
        }

        return NextResponse.json({
            error: 'Erreur du service IA',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 502 });
    }
}
