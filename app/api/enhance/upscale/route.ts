/**
 * Image Upscaling API
 * POST /api/enhance/upscale
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upscaleImage, calculateEnhanceCredits } from '@/lib/enhance';

export async function POST(request: NextRequest) {
    const traceId = `upscale_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Get profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ success: false, error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
        }

        // 3. Check credits
        const creditsRequired = calculateEnhanceCredits('real-esrgan');
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                success: false,
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 4. Get image from request
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;

        if (!imageFile) {
            return NextResponse.json({ success: false, error: 'Image requise', trace_id: traceId }, { status: 400 });
        }

        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
            return NextResponse.json({ success: false, error: 'Fichier invalide (image requise)', trace_id: traceId }, { status: 400 });
        }

        // Validate file size (max 10MB)
        if (imageFile.size > 10 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: 'Image trop volumineuse (max 10MB)', trace_id: traceId }, { status: 400 });
        }

        // 5. Convert to buffer
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

        // 6. Upscale image
        let resultBuffer: Buffer;
        try {
            const result = await upscaleImage(imageBuffer);
            resultBuffer = result.image;
        } catch (upscaleError) {
            console.error('[UpscaleAPI] Error:', upscaleError);
            return NextResponse.json({
                success: false,
                error: 'Erreur de traitement',
                details: upscaleError instanceof Error ? upscaleError.message : 'Impossible d\'agrandir l\'image',
                trace_id: traceId,
            }, { status: 500 });
        }

        // 7. Upload to Supabase Storage
        const fileName = `${user.id}/upscaled/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
        const { error: uploadError } = await supabase
            .storage
            .from('generations')
            .upload(fileName, resultBuffer, {
                contentType: 'image/png',
                upsert: false,
            });

        let publicUrl = '';
        if (uploadError) {
            console.error('[UpscaleAPI] Upload error:', uploadError);
            // Fallback: return base64
            publicUrl = `data:image/png;base64,${resultBuffer.toString('base64')}`;
        } else {
            const { data: urlData } = supabase
                .storage
                .from('generations')
                .getPublicUrl(fileName);
            publicUrl = urlData.publicUrl;
        }

        // 8. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 9. Record generation
        await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                type: 'upscale',
                prompt: 'Image upscaled x4',
                result_url: publicUrl.startsWith('data:') ? null : publicUrl,
                metadata: {
                    model: 'real-esrgan',
                    original_size: imageFile.size,
                    credits: creditsRequired,
                },
                credits_used: creditsRequired,
            });

        return NextResponse.json({
            success: true,
            image_url: publicUrl,
            credits_charged: creditsRequired,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
            trace_id: traceId,
        });

    } catch (error) {
        console.error('[UpscaleAPI] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 500 });
    }
}
