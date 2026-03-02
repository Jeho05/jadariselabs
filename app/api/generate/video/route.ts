/**
 * Video Generation API - Simplified for Vercel Serverless
 * Direct Replicate API calls with Supabase storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VIDEO_MODELS } from '@/lib/types/video';
import type { VideoGenerationRequest, VideoModel } from '@/lib/types/video';
import { createVideoPrediction, getPrediction, calculateCredits } from '@/lib/replicate';

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
    if (body.prompt.length > 1000) {
      return NextResponse.json({ success: false, error: 'Le prompt est trop long (max 1000 caractères)', trace_id: traceId }, { status: 400 });
    }

    // Validate duration
    const duration = body.duration || 5;
    if (![3, 5, 15].includes(duration)) {
      return NextResponse.json({ success: false, error: 'Durée invalide (3, 5 ou 15 secondes)', trace_id: traceId }, { status: 400 });
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
      return NextResponse.json({ 
        success: false, 
        error: 'Plan insuffisant', 
        details: 'La génération vidéo nécessite un plan Starter ou Pro.',
        trace_id: traceId 
      }, { status: 403 });
    }
    if (profile.plan === 'starter' && duration > 5) {
      return NextResponse.json({ 
        success: false, 
        error: 'Durée non autorisée', 
        details: 'Le plan Starter permet uniquement des vidéos de 5 secondes maximum.',
        trace_id: traceId 
      }, { status: 403 });
    }

    // Select model
    const model: VideoModel = body.model || 'wan2';
    const modelInfo = VIDEO_MODELS[model];
    if (!modelInfo) {
      return NextResponse.json({ success: false, error: 'Modèle invalide', trace_id: traceId }, { status: 400 });
    }

    // Calculate credits
    const creditsRequired = calculateCredits(model, duration, body.quality);

    // Check credits
    if (profile.credits !== -1 && profile.credits < creditsRequired) {
      return NextResponse.json({ 
        success: false, 
        error: 'Crédits insuffisants', 
        details: `Il vous faut ${creditsRequired} crédits. Vous avez ${profile.credits} crédits.`,
        trace_id: traceId 
      }, { status: 402 });
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
        status: 'processing',
        metadata: { 
          model, 
          duration, 
          quality: body.quality || 'standard', 
          style: body.style,
          credits: creditsRequired 
        },
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

    // Call Replicate API
    let prediction;
    try {
      prediction = await createVideoPrediction({
        prompt: body.prompt.trim(),
        model,
        duration,
        style: body.style,
        quality: body.quality,
      });
    } catch (replicateError) {
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
        .update({ status: 'failed', error: String(replicateError) })
        .eq('id', generationId);

      console.error('[VideoAPI] Replicate error:', replicateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur Replicate', 
        details: 'Impossible de créer la vidéo. Veuillez réessayer.',
        trace_id: traceId 
      }, { status: 500 });
    }

    // Update generation with prediction ID
    await supabase
      .from('generations')
      .update({ 
        metadata: { 
          model, 
          duration, 
          quality: body.quality || 'standard', 
          style: body.style,
          credits: creditsRequired,
          predictionId: prediction.id,
        }
      })
      .eq('id', generationId);

    // If prediction succeeded immediately (short video)
    if (prediction.status === 'succeeded' && prediction.output) {
      // Download and store video in Supabase Storage
      const videoUrl = prediction.output;
      
      await supabase
        .from('generations')
        .update({ 
          status: 'completed',
          result_url: videoUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      return NextResponse.json({
        success: true,
        generation_id: generationId,
        video_url: videoUrl,
        model_used: model,
        credits_charged: creditsRequired,
        remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
        trace_id: traceId,
      });
    }

    // Return processing status for long-running predictions
    return NextResponse.json({
      success: true,
      generation_id: generationId,
      prediction_id: prediction.id,
      status: 'processing',
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

      // If still processing, check Replicate status
      if (generation.status === 'processing') {
        const metadata = generation.metadata as Record<string, unknown>;
        const predictionId = metadata?.predictionId as string | undefined;
        
        if (predictionId) {
          try {
            const prediction = await getPrediction(predictionId);
            
            if (prediction.status === 'succeeded' && prediction.output) {
              // Update generation
              await supabase
                .from('generations')
                .update({ 
                  status: 'completed',
                  result_url: prediction.output,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', generationId);
              
              generation.status = 'completed';
              generation.result_url = prediction.output;
            } else if (prediction.status === 'failed') {
              await supabase
                .from('generations')
                .update({ 
                  status: 'failed',
                  error: prediction.error || 'Generation failed',
                })
                .eq('id', generationId);
              
              generation.status = 'failed';
            }
          } catch (e) {
            console.error('[VideoAPI] Error checking prediction:', e);
          }
        }
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
