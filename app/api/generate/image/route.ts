/**
 * Image Generation API — Hugging Face (FLUX / SDXL)
 * POST /api/generate/image
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateImage, calculateImageCredits, IMAGE_MODELS } from '@/lib/huggingface';
import type { ImageModel } from '@/lib/huggingface';

// Watermark via sharp
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
    const sharp = (await import('sharp')).default;

    const svgText = `
    <svg width="250" height="30">
      <text x="5" y="20" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="rgba(255,255,255,0.6)" font-weight="600">
        Created with JadaRiseLabs
      </text>
    </svg>
  `;

    const watermark = Buffer.from(svgText);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    return await sharp(imageBuffer)
        .composite([{
            input: watermark,
            gravity: 'southeast',
        }])
        .png()
        .toBuffer();
}

// Parse size string to width/height
function parseSize(size?: string): { width: number; height: number } {
    if (!size) return { width: 512, height: 512 };
    const [w, h] = size.split('x').map(Number);
    return { width: w || 512, height: h || 512 };
}

export async function POST(request: NextRequest) {
    const traceId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
        }

        // 2. Parse body
        let body: { prompt?: string; model?: ImageModel; size?: string; negative_prompt?: string; hd?: boolean };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ success: false, error: 'Requête invalide', trace_id: traceId }, { status: 400 });
        }

        // 3. Validate prompt
        if (!body.prompt || body.prompt.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Le prompt ne peut pas être vide', trace_id: traceId }, { status: 400 });
        }
        if (body.prompt.length > 2000) {
            return NextResponse.json({ success: false, error: 'Le prompt est trop long (max 2000 caractères)', trace_id: traceId }, { status: 400 });
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

        // 5. Validate model
        const model: ImageModel = body.model && (body.model in IMAGE_MODELS) ? body.model : 'flux-schnell';

        // 6. HD check — only starter/pro can generate HD
        const isHD = body.hd === true;
        if (isHD && profile.plan === 'free') {
            return NextResponse.json({
                success: false,
                error: 'Plan insuffisant',
                details: 'La génération HD nécessite un plan Starter ou Pro.',
                trace_id: traceId,
            }, { status: 403 });
        }

        // 7. Calculate credits
        const creditsRequired = calculateImageCredits(model, isHD);

        // 8. Check credits
        if (profile.credits !== -1 && profile.credits < creditsRequired) {
            return NextResponse.json({
                success: false,
                error: 'Crédits insuffisants',
                details: `Il vous faut ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
                trace_id: traceId,
            }, { status: 402 });
        }

        // 9. Parse size
        const { width, height } = parseSize(body.size);

        // 10. Generate image
        let imageBuffer: Buffer;
        try {
            imageBuffer = await generateImage(body.prompt.trim(), model, {
                width,
                height,
                negative_prompt: body.negative_prompt,
            });
        } catch (hfError) {
            console.error('[ImageAPI] Hugging Face error:', hfError);
            return NextResponse.json({
                success: false,
                error: 'Erreur de génération',
                details: hfError instanceof Error ? hfError.message : 'Impossible de générer l\'image. Réessayez.',
                trace_id: traceId,
            }, { status: 500 });
        }

        // 11. Add watermark for free plan
        if (profile.plan === 'free') {
            try {
                imageBuffer = await addWatermark(imageBuffer);
            } catch (wmError) {
                console.error('[ImageAPI] Watermark error (non-bloquant):', wmError);
                // Continue sans watermark si erreur
            }
        }

        // 12. Upload to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
        const { error: uploadError } = await supabase
            .storage
            .from('generations')
            .upload(fileName, imageBuffer, {
                contentType: 'image/png',
                upsert: false,
            });

        let publicUrl = '';
        if (uploadError) {
            console.error('[ImageAPI] Upload error:', uploadError);
            // Fallback: return base64 if upload fails
            publicUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        } else {
            const { data: urlData } = supabase
                .storage
                .from('generations')
                .getPublicUrl(fileName);
            publicUrl = urlData.publicUrl;
        }

        // 13. Deduct credits
        if (profile.credits !== -1) {
            await supabase
                .from('profiles')
                .update({ credits: profile.credits - creditsRequired })
                .eq('id', user.id);
        }

        // 14. Record generation
        await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                type: 'image',
                prompt: body.prompt.trim(),
                result_url: publicUrl.startsWith('data:') ? null : publicUrl,
                metadata: {
                    model,
                    size: `${width}x${height}`,
                    hd: isHD,
                    negative_prompt: body.negative_prompt || null,
                },
                credits_used: creditsRequired,
            });

        return NextResponse.json({
            success: true,
            image_url: publicUrl,
            model_used: model,
            credits_charged: creditsRequired,
            remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
            trace_id: traceId,
        });

    } catch (error) {
        console.error('[ImageAPI] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            trace_id: traceId,
        }, { status: 500 });
    }
}
