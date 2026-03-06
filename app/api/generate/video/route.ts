/**
 * Video Generation API - 100% Free Zero-Budget Version
 * Direct Hugging Face Inference API calls with Supabase storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VIDEO_MODELS } from '@/lib/types/video';
import type { VideoGenerationRequest } from '@/lib/types/video';
import { generateHFVideo, calculateVideoCredits, type HFVideoModel } from '@/lib/hf-video';

// POST - Create video generation
export async function POST(request: NextRequest) {
  const traceId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    // Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
    }

    // Parse body
    let body: VideoGenerationRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Requête invalide', trace_id: traceId }, { status: 400 });
    }

    // Validate prompt
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Le prompt ne peut pas être vide', trace_id: traceId }, { status: 400 });
    }
    if (body.prompt.length > 500) {
      return NextResponse.json({ success: false, error: 'Le prompt est trop long (max 500 caractères)', trace_id: traceId }, { status: 400 });
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, plan, credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profil non trouvé', trace_id: traceId }, { status: 404 });
    }

    // Select model
    const model: HFVideoModel = (body.model as HFVideoModel) || 'text-to-video-ms';
    const modelInfo = VIDEO_MODELS[model as keyof typeof VIDEO_MODELS];
    if (!modelInfo) {
      return NextResponse.json({ success: false, error: 'Modèle invalide', trace_id: traceId }, { status: 400 });
    }

    // Calculate credits
    const creditsRequired = calculateVideoCredits(model);

    // Check credits
    if (profile.credits !== -1 && profile.credits < creditsRequired) {
      return NextResponse.json({
        success: false,
        error: 'Crédits insuffisants',
        details: `Il vous faut ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
        trace_id: traceId
      }, { status: 402 });
    }

    // Create generation record - let Supabase generate UUID
    const { data: generationData, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        type: 'video',
        prompt: body.prompt.trim(),
        status: 'processing',
        metadata: {
          model,
          credits: creditsRequired
        },
      })
      .select('id')
      .single();

    if (insertError || !generationData) {
      console.error('[VideoAPI] Insert error:', JSON.stringify(insertError, null, 2));
      console.error('[VideoAPI] Insert error details - code:', insertError.code, 'message:', insertError.message, 'details:', insertError.details);
      
      // Provide more specific error message based on error code
      let errorMessage = 'Erreur lors de la création';
      if (insertError.code === '42P01') {
        errorMessage = 'La table "generations" n\'existe pas. Veuillez exécuter les migrations.';
      } else if (insertError.code === '42703') {
        errorMessage = 'Une colonne requise est manquante dans la table "generations".';
      } else if (insertError.code === '23505') {
        errorMessage = 'Cette génération existe déjà.';
      } else if (insertError.code === '23503') {
        errorMessage = 'Erreur de référence - le profil utilisateur n\'existe pas.';
      } else if (insertError.message?.includes('permission')) {
        errorMessage = 'Permissions insuffisantes pour créer une génération.';
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage, 
        details: insertError.message || 'Erreur inconnue',
        code: insertError.code,
        trace_id: traceId 
      }, { status: 500 });
    }

    // Deduct credits temporarily (held)
    if (profile.credits !== -1) {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - creditsRequired })
        .eq('id', user.id);
    }

    // Call Hugging Face API
    let videoBuffer: Buffer;
    try {
      const result = await generateHFVideo(body.prompt.trim(), { model });
      videoBuffer = result.video;
    } catch (hfError) {
      // Refund credits on failure
      if (profile.credits !== -1) {
        await supabase
          .from('profiles')
          .update({ credits: profile.credits })
          .eq('id', user.id);
      }

      // Update generation status
      await supabase
        .from('generations')
        .update({ status: 'failed', error: hfError instanceof Error ? hfError.message : String(hfError) })
        .eq('id', generationData.id);

      console.error('[VideoAPI] Hugging Face error:', hfError);
      return NextResponse.json({
        success: false,
        error: 'Erreur de génération',
        details: hfError instanceof Error ? hfError.message : 'Impossible de créer la vidéo. Veuillez réessayer.',
        trace_id: traceId
      }, { status: 500 });
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/video/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
    const { error: uploadError } = await supabase
      .storage
      .from('generations')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4', // Usually HF returns mp4
        upsert: false,
      });

    let publicUrl = '';
    if (uploadError) {
      console.error('[VideoAPI] Upload error:', uploadError);
      // Fallback: data uri
      publicUrl = `data:video/mp4;base64,${videoBuffer.toString('base64')}`;
    } else {
      const { data: urlData } = supabase
        .storage
        .from('generations')
        .getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
    }

    // Note: Video generation is fast enough now due to small models to return synchronously
    await supabase
      .from('generations')
      .update({
        status: 'completed',
        result_url: publicUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationData.id);

    return NextResponse.json({
      success: true,
      generation_id: generationData.id,
      video_url: publicUrl,
      model_used: model,
      credits_charged: creditsRequired,
      remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
      trace_id: traceId,
    });

  } catch (error) {
    console.error('[VideoAPI] Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne', trace_id: traceId }, { status: 500 });
  }
}

// GET - Get generation status
export async function GET(request: NextRequest) {
  const traceId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get('generation_id');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
    }

    if (generationId) {
      // Get specific generation
      const { data: generation, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user.id)
        .single();

      if (error || !generation) {
        return NextResponse.json({ success: false, error: 'Génération non trouvée', trace_id: traceId }, { status: 404 });
      }

      // HF Generation is synchronous, so if it's in the DB, it's either completed or failed already.
      return NextResponse.json({ success: true, generation, trace_id: traceId });
    }

    // List generations
    const { data: generations, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'video')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ success: false, error: 'Erreur lors de la récupération', trace_id: traceId }, { status: 500 });
    }

    return NextResponse.json({ success: true, generations, trace_id: traceId });

  } catch (error) {
    console.error('[VideoAPI] GET error:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne', trace_id: traceId }, { status: 500 });
  }
}

// DELETE - Cancel generation
export async function DELETE(request: NextRequest) {
  const traceId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get('generation_id');

  if (!generationId) {
    return NextResponse.json({ success: false, error: 'generation_id requis', trace_id: traceId }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié', trace_id: traceId }, { status: 401 });
    }

    const { data: generation, error: findError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single();

    if (findError || !generation) {
      return NextResponse.json({ success: false, error: 'Génération non trouvée', trace_id: traceId }, { status: 404 });
    }

    if (!['queued', 'processing'].includes(generation.status)) {
      return NextResponse.json({ success: false, error: 'Impossible d\'annuler une génération terminée', trace_id: traceId }, { status: 400 });
    }

    // Update status
    await supabase
      .from('generations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', generationId);

    return NextResponse.json({ success: true, message: 'Génération annulée', trace_id: traceId });

  } catch (error) {
    console.error('[VideoAPI] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne', trace_id: traceId }, { status: 500 });
  }
}
