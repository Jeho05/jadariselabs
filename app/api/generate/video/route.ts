/**
 * Video Generation API - Enterprise Grade
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VIDEO_MODELS, VIDEO_RATE_LIMITS } from '@/lib/types/video';
import type { VideoGenerationRequest, VideoModel } from '@/lib/types/video';
import { PLANS } from '@/lib/types';

// Rate limiter
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'video_min',
  points: VIDEO_RATE_LIMITS.perMinute.maxRequests,
  duration: Math.floor(VIDEO_RATE_LIMITS.perMinute.windowMs / 1000),
});

// POST - Create video generation job
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

    // Validate
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Le prompt ne peut pas être vide', trace_id: traceId }, { status: 400 });
    }
    if (body.prompt.length > 1000) {
      return NextResponse.json({ success: false, error: 'Le prompt est trop long', trace_id: traceId }, { status: 400 });
    }
    const duration = body.duration || 5;
    if (![3, 5, 15].includes(duration)) {
      return NextResponse.json({ success: false, error: 'Durée invalide', trace_id: traceId }, { status: 400 });
    }

    // Rate limit
    try {
      await rateLimiter.consume(user.id);
    } catch {
      return NextResponse.json({ success: false, error: 'Limite de requêtes atteinte', trace_id: traceId }, { status: 429 });
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

    // Check plan
    if (profile.plan === 'free') {
      return NextResponse.json({ success: false, error: 'Plan insuffisant', details: 'La génération vidéo n\'est pas disponible pour le plan Gratuit.', trace_id: traceId }, { status: 403 });
    }
    if (profile.plan === 'starter' && duration > 5) {
      return NextResponse.json({ success: false, error: 'Durée non autorisée', details: 'Le plan Starter permet uniquement des vidéos de 5 secondes maximum.', trace_id: traceId }, { status: 403 });
    }

    // Select model
    const model: VideoModel = body.model || 'wan2';
    const modelInfo = VIDEO_MODELS[model];
    if (!modelInfo) {
      return NextResponse.json({ success: false, error: 'Modèle invalide', trace_id: traceId }, { status: 400 });
    }

    // Calculate credits
    const quality = body.quality || 'standard';
    const qualityMultiplier = quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1;
    const creditsRequired = Math.ceil(modelInfo.creditsPerSecond * duration * qualityMultiplier);

    // Check credits
    if (profile.credits !== -1 && profile.credits < creditsRequired) {
      return NextResponse.json({ success: false, error: 'Crédits insuffisants', details: `Il vous faut ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`, trace_id: traceId }, { status: 402 });
    }

    // Create generation record
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const { error: insertError } = await supabase
      .from('generations')
      .insert({
        id: generationId,
        user_id: user.id,
        type: 'video',
        prompt: body.prompt.trim(),
        status: 'queued',
        metadata: { model, duration, quality, style: body.style, credits: creditsRequired },
        created_at: new Date().toISOString(),
      });
    if (insertError) {
      console.error('[VideoAPI] Insert error:', insertError);
      return NextResponse.json({ success: false, error: 'Erreur lors de la création', trace_id: traceId }, { status: 500 });
    }

    // Deduct credits
    if (profile.credits !== -1) {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - creditsRequired })
        .eq('id', user.id);
    }

    // Return success
    return NextResponse.json({
      success: true,
      generation_id: generationId,
      model_used: model,
      credits_charged: creditsRequired,
      remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
      estimated_time_seconds: duration * 30,
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
      const { data: generation, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user.id)
        .single();
      
      if (error || !generation) {
        return NextResponse.json({ success: false, error: 'Génération non trouvée', trace_id: traceId }, { status: 404 });
      }

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
      return NextResponse.json({ success: false, error: 'Impossible d\'annuler', trace_id: traceId }, { status: 400 });
    }

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
