/**
 * Audio Generation API - Bark (Suno)
 * POST /api/generate/audio
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAudio, calculateAudioCredits } from '@/lib/bark';
import type { BarkVoice } from '@/lib/bark';

export async function POST(request: NextRequest) {
    const traceId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse body
        let body: { text?: string; voice?: BarkVoice };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ success: false, error: 'Requête invalide', trace_id: traceId }, { status: 400 });
        }

        // 3. Validate text
        if (!body.text || body.text.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Le texte ne peut pas être vide', trace_id: traceId }, { status: 400 });
        }
        if (body.text.length > 500) {
            return NextResponse.json({ success: false, error: 'Le texte est trop long (max 500 caractères)', trace_id: traceId }, { status: 400 });
        }

        // 4. Get profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ success: false, error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        // 5. Validate voice
        const voice: BarkVoice = body.voice || 'fr';

        // 6. Calculate credits
        const creditsRequired = calculateAudioCredits(voice, body.text.length);

        // 7. Check credits
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                success: false,
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 8. Generate audio
        let audioBuffer: Buffer;
        let duration: number;
        let providerUsed: string | undefined;
        let routerMeta: { provider: string; attempts: unknown[]; duration_ms: number } | undefined;
        try {
            const result = await generateAudio(body.text.trim(), { voice });
            audioBuffer = result.audio;
            duration = result.duration;
            providerUsed = result.provider;
            routerMeta = result.router;
        } catch (genError) {
            console.error('[AudioAPI] Generation error:', genError);
            return NextResponse.json({
                success: false,
                error: 'Erreur de génération',
                details: genError instanceof Error ? genError.message : 'Impossible de générer l\'audio',
                trace_id: traceId,
            }, { status: 500 });
        }

        // 9. Upload to Supabase Storage
        const fileName = `${user.id}/audio/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;
        const { error: uploadError } = await supabase
            .storage
            .from('generations')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/wav',
                upsert: false,
            });

        let publicUrl = '';
        if (uploadError) {
            console.error('[AudioAPI] Upload error:', uploadError);
            // Fallback: return base64
            publicUrl = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
        } else {
            const { data: urlData } = supabase
                .storage
                .from('generations')
                .getPublicUrl(fileName);
            publicUrl = urlData.publicUrl;
        }

        // 10. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 11. Record generation
        await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                type: 'audio',
                prompt: body.text.trim(),
                result_url: publicUrl.startsWith('data:') ? null : publicUrl,
                metadata: {
                    voice,
                    duration,
                    credits: creditsRequired,
                    provider: providerUsed || null,
                    router: routerMeta || null,
                },
                credits_used: creditsRequired,
            });

        return NextResponse.json({
            success: true,
            audio_url: publicUrl,
            voice,
            duration,
            credits_charged: creditsRequired,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
            trace_id: traceId,
        });

    } catch (error) {
        console.error('[AudioAPI] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 500 });
    }
}
