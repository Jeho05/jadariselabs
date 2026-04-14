import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProviderError } from '@/lib/provider-router';
import {
    generateSocial,
    getCreditsRequired,
    type SocialGenerateInput,
} from '@/lib/social/generate';

/**
 * POST /api/generate/social — Générateur de posts social media
 * Streaming SSE response
 *
 * Body: {
 *   platform: 'tiktok' | 'facebook' | 'whatsapp' | 'linkedin' | 'instagram',
 *   templateId: string,
 *   topic: string,
 *   context?: string,
 *   tone?: string,
 *   sector?: string,
 *   multiVariant?: boolean
 * }
 */

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const traceId = `soc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Body JSON invalide', trace_id: traceId }, { status: 400 });
        }

        const {
            platform,
            contentType,
            templateId,
            topic,
            context = '',
            tone = 'professionnel',
            sector = 'general',
            multiVariant = false,
        } = body;

        // 3. Validation
        if (!platform || !['tiktok', 'facebook', 'whatsapp', 'linkedin', 'instagram'].includes(platform)) {
            return NextResponse.json({ error: 'Plateforme invalide', trace_id: traceId }, { status: 400 });
        }

        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            return NextResponse.json({ error: 'Le sujet ne peut pas être vide', trace_id: traceId }, { status: 400 });
        }

        // 4. Check credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        const creditsRequired = getCreditsRequired({
            platform,
            contentType,
            templateId,
            topic,
            context,
            tone,
            sector,
            multiVariant,
        } as SocialGenerateInput);

        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédit(s). Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 5. Execute generation
        const generation = await generateSocial({
            input: {
                platform,
                contentType,
                templateId,
                topic: topic.trim(),
                context,
                tone,
                sector,
                multiVariant,
            } as SocialGenerateInput,
            stream: true,
        });
        const response = generation.response;

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
            type: 'social',
            prompt: topic.trim().substring(0, 500),
            result_url: null,
            metadata: {
                platform,
                content_type: contentType,
                template_id: templateId,
                tone,
                sector,
                multi_variant: multiVariant,
                provider: generation.provider,
                router: {
                    provider: generation.provider,
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
                    provider: generation.provider,
                    platform,
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
        console.error('[SocialAPI] Error:', error);
        
        if (error instanceof ProviderError && error.status === 429) {
            return NextResponse.json({
                error: 'Trop de requêtes',
                details: 'Limite atteinte sur tous les services. Patientez quelques secondes.',
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
