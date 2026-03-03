/**
 * Background Removal API
 * POST /api/enhance/remove-bg
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeBackground, calculateRemoveBgCredits } from '@/lib/removebg';

export async function POST(request: NextRequest) {
    const traceId = `removebg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
        const creditsRequired = calculateRemoveBgCredits();
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                success: false,
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédit. Vous avez ${profile.credits} crédits.`,
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

        // 6. Remove background
        let resultBuffer: Buffer;
        let provider: string;
        try {
            const result = await removeBackground(imageBuffer);
            resultBuffer = result.image;
            provider = result.provider;
        } catch (removeError) {
            console.error('[RemoveBgAPI] Error:', removeError);
            return NextResponse.json({
                success: false,
                error: 'Erreur de traitement',
                details: removeError instanceof Error ? removeError.message : 'Impossible de supprimer l\'arrière-plan',
                trace_id: traceId,
            }, { status: 500 });
        }

        // 7. Upload to Supabase Storage
        const fileName = `${user.id}/nobg/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
        const { error: uploadError } = await supabase
            .storage
            .from('generations')
            .upload(fileName, resultBuffer, {
                contentType: 'image/png',
                upsert: false,
            });

        let publicUrl = '';
        if (uploadError) {
            console.error('[RemoveBgAPI] Upload error:', uploadError);
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
                type: 'remove-bg',
                prompt: 'Background removed',
                result_url: publicUrl.startsWith('data:') ? null : publicUrl,
                metadata: {
                    provider,
                    original_size: imageFile.size,
                    credits: creditsRequired,
                },
                credits_used: creditsRequired,
            });

        return NextResponse.json({
            success: true,
            image_url: publicUrl,
            provider,
            credits_charged: creditsRequired,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
            trace_id: traceId,
        });

    } catch (error) {
        console.error('[RemoveBgAPI] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 500 });
    }
}
