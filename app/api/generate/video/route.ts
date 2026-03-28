/**
 * Video Generation API - Replicate
 * Replicate API calls with Supabase storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VIDEO_MODELS } from '@/lib/types/video';
import type { VideoGenerationRequest, VideoModel } from '@/lib/types/video';
import { generateReplicateVideo, checkReplicatePrediction, calculateVideoCredits } from '@/lib/replicate';
import type { ReplicateVideoModel } from '@/lib/replicate';
import { generateFalVideo, checkFalPrediction } from '@/lib/fal';
import { createMinimaxVideoTask, getMinimaxVideoTask, retrieveMinimaxFile } from '@/lib/minimax';
import { runProviderChain } from '@/lib/provider-router';
import { generateGradioVideo } from '@/lib/gradio';
import { generateVeoVideo } from '@/lib/veo';
import { enhanceVideoPrompt } from '@/lib/gemini-enhancer';

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
  const requestedModel: VideoModel = (body.model as VideoModel) || 'wan-video/wan-2.1-1.3b';
  const modelInfo = VIDEO_MODELS[requestedModel];
  if (!modelInfo) {
    return NextResponse.json({ success: false, error: 'Modele invalide', trace_id: traceId }, { status: 400 });
  }

  const replicateModel: ReplicateVideoModel = 'wan-video/wan-2.1-1.3b';

  const duration = Number(body.duration);
  if (!Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json({
      success: false,
      error: 'Duree invalide',
      details: 'La duree doit etre un nombre positif.',
      trace_id: traceId,
    }, { status: 400 });
  }

  if (duration > modelInfo.maxDuration) {
    return NextResponse.json({
      success: false,
      error: 'Duree trop longue',
      details: 'Duree maximale pour ' + modelInfo.displayName + ' : ' + modelInfo.maxDuration + 's',
      trace_id: traceId,
    }, { status: 400 });
  }

  const quality = (body.quality || 'standard') as typeof modelInfo.qualityLevels[number];
  if (!modelInfo.qualityLevels.includes(quality)) {
    return NextResponse.json({
      success: false,
      error: 'Qualite invalide',
      details: 'Qualites disponibles : ' + modelInfo.qualityLevels.join(', '),
      trace_id: traceId,
    }, { status: 400 });
  }

  const style = body.style || 'cinematic';
  const aspectRatio = body.aspectRatio || '16:9';

  // Calculate credits
  const creditsRequired = calculateVideoCredits(requestedModel, duration, quality);
  const resolution = quality === 'high' || quality === 'ultra' ? '1080P' : '720P';

  const baseMetadata = {
    model: requestedModel,
    credits: creditsRequired,
    duration,
    quality,
    style,
    aspect_ratio: aspectRatio,
    resolution,
  };


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
        metadata: baseMetadata,
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

    // Prompt Rewriting Logic
    let finalPrompt = body.prompt.trim();
    try {
      if (process.env.GEMINI_API_KEY) {
        finalPrompt = await enhanceVideoPrompt(finalPrompt);
      }
    } catch (e) {
      console.warn('[VideoAPI] Prompt enhancement failed, using original', e);
    }

    // Arbitrage: Gradio -> Veo -> MiniMax (Hailuo) -> Fal.ai -> Replicate
    let predictionId: string | undefined = undefined;
    let providerUsed: 'gradio' | 'veo' | 'minimax' | 'fal' | 'replicate' | undefined = undefined;
    let modelUsed: VideoModel | undefined = undefined;
    let providerModel: string | undefined = undefined;
    let routerMeta: { provider: string; attempts: unknown[]; duration_ms: number } | undefined;

    try {
      type VideoProviderResult = { predictionId: string; modelUsed: VideoModel; providerModel?: string };
      const providers: Array<{ name: 'gradio' | 'veo' | 'minimax' | 'fal' | 'replicate'; run: () => Promise<VideoProviderResult> }> = [];

      // 1. Hugging Face ZeroGPU (Gratuit)
      if (process.env.HUGGINGFACE_API_KEY && requestedModel === 'wan-video/wan-2.1-1.3b') {
        providers.push({
          name: 'gradio',
          run: async () => {
            const { predictionId, url } = await generateGradioVideo({ prompt: finalPrompt, model: 'Wan-AI/Wan2.1' });
            return { predictionId: url || predictionId, modelUsed: requestedModel, providerModel: 'Wan-AI/Wan2.1' };
          },
        });
      }

      // 2. Google Veo 3.1 (Google AI Studio Free Tier) 
      if (process.env.GEMINI_API_KEY && requestedModel === 'google/veo-3.1') {
        providers.push({
          name: 'veo',
          run: async () => {
            const { predictionId, url } = await generateVeoVideo({ prompt: finalPrompt, quality: quality, aspectRatio: aspectRatio });
            return { predictionId: url || predictionId, modelUsed: requestedModel, providerModel: 'veo-3.1' };
          },
        });
      }

      if (process.env.MINIMAX_API_KEY && requestedModel === 'minimax/video-01') {
        const minimaxModel = process.env.MINIMAX_MODEL || 'video-01';
        providers.push({
          name: 'minimax',
          run: async () => {
            const task = await createMinimaxVideoTask({
              prompt: body.prompt.trim(),
              model: minimaxModel,
              duration,
              resolution,
            });
            return { predictionId: task.taskId, modelUsed: requestedModel, providerModel: minimaxModel };
          },
        });
      }

      // Fal.ai — prioritaire (free tier disponible)
      if (process.env.FAL_KEY) {
        providers.push({
          name: 'fal',
          run: async () => {
            const { predictionId } = await generateFalVideo(body.prompt.trim());
            return { predictionId, modelUsed: replicateModel, providerModel: replicateModel };
          },
        });
      }

      // Replicate — fallback (nécessite des crédits payants)
      if (process.env.REPLICATE_API_TOKEN) {
        providers.push({
          name: 'replicate',
          run: async () => {
            const { predictionId } = await generateReplicateVideo(body.prompt.trim(), { model: replicateModel });
            return { predictionId, modelUsed: replicateModel, providerModel: replicateModel };
          },
        });
      }

      if (providers.length === 0) {
        throw new Error(
          'Aucun fournisseur vidéo configuré. ' +
          'Ajoutez FAL_KEY (fal.ai, free tier) ou REPLICATE_API_TOKEN (replicate.com, payant) dans .env.local'
        );
      }

      const providerResult = await runProviderChain<VideoProviderResult>(providers, { purpose: 'video' });

      predictionId = providerResult.result.predictionId;
      providerUsed = providerResult.provider as 'gradio' | 'veo' | 'minimax' | 'fal' | 'replicate';
      modelUsed = providerResult.result.modelUsed;
      providerModel = providerResult.result.providerModel;
      routerMeta = {
        provider: providerResult.provider,
        attempts: providerResult.attempts,
        duration_ms: providerResult.latency_ms,
      };
    } catch (apiError) {
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
        .update({ status: 'failed', error: apiError instanceof Error ? apiError.message : String(apiError) })
        .eq('id', generationData.id);

      console.error('[VideoAPI] Generation error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Erreur de création vidéo',
        details: apiError instanceof Error ? apiError.message : 'Impossible de démarrer la création de la vidéo.',
        trace_id: traceId
      }, { status: 500 });
    }

    // Update DB with prediction ID and provider
    await supabase
      .from('generations')
      .update({
        metadata: {
          ...baseMetadata,
          model: modelUsed || requestedModel,
          requested_model: requestedModel,
          provider_model: providerModel || null,
          predictionId,
          provider: providerUsed,
          router: routerMeta || null,
        },
      })
      .eq('id', generationData.id);

    // Return the response so that the client can start polling
    return NextResponse.json({
      success: true,
      generation_id: generationData.id,
      model_used: modelUsed || requestedModel,
      credits_charged: creditsRequired,
      remaining_credits: profile.credits === -1 ? -1 : profile.credits - creditsRequired,
      estimated_time_seconds: modelInfo.avgGenerationTime * duration,
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

      // Check provider status if it's still processing
      if (generation.status === 'processing' && generation.metadata?.predictionId) {
        try {
          const provider = generation.metadata?.provider || 'replicate';
          const predictionId = generation.metadata.predictionId as string;

          if (provider === 'gradio' || provider === 'veo') {
             // Gradio et Veo sont gérés de manière synchrone dans notre implémentation
             // La predictionId est en fait l'URL complétée
             if (predictionId.startsWith('http')) {
               await supabase
                 .from('generations')
                 .update({
                   status: 'completed',
                   result_url: predictionId,
                   completed_at: new Date().toISOString(),
                 })
                 .eq('id', generation.id);

               generation.status = 'completed';
               generation.result_url = predictionId;
             }
          } else if (provider === 'minimax') {
            const task = await getMinimaxVideoTask(predictionId);
            if (task.status === 'Success' && task.file_id) {
              const fileInfo = await retrieveMinimaxFile(task.file_id);
              const fileRes = await fetch(fileInfo.download_url);
              const arrayBuffer = await fileRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              const fileName = `${user.id}/video/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
              const { error: uploadError } = await supabase
                .storage
                .from('generations')
                .upload(fileName, buffer, {
                  contentType: 'video/mp4',
                  upsert: false,
                });

              let publicUrl = fileInfo.download_url;
              if (!uploadError) {
                const { data: urlData } = supabase
                  .storage
                  .from('generations')
                  .getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
              }

              await supabase
                .from('generations')
                .update({
                  status: 'completed',
                  result_url: publicUrl,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', generation.id);

              generation.status = 'completed';
              generation.result_url = publicUrl;
            } else if (task.status === 'Fail') {
              await supabase
                .from('generations')
                .update({
                  status: 'failed',
                  error: task.error || task.message || 'Statut MiniMax inconnu',
                })
                .eq('id', generation.id);

              generation.status = 'failed';
              generation.error = task.error || task.message || 'Statut inconnu';

              // Refund credits
              const profile = await supabase.from('profiles').select('credits').eq('id', user.id).single();
              if (profile.data && profile.data.credits !== -1) {
                await supabase
                  .from('profiles')
                  .update({ credits: profile.data.credits + (generation.metadata?.credits || 0) })
                  .eq('id', user.id);
              }
            }
          } else {
            const prediction =
              provider === 'fal'
                ? await checkFalPrediction(predictionId)
                : await checkReplicatePrediction(predictionId);

            if (prediction.status === 'succeeded' && prediction.output) {
              // Providers offer a temporary URL, let's download it and upload to Supabase
              const fileRes = await fetch(prediction.output);
              const arrayBuffer = await fileRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              const fileName = `${user.id}/video/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
              const { error: uploadError } = await supabase
                .storage
                .from('generations')
                .upload(fileName, buffer, {
                  contentType: 'video/mp4',
                  upsert: false,
                });

              let publicUrl = prediction.output; // Default to Provider URL
              if (!uploadError) {
                const { data: urlData } = supabase
                  .storage
                  .from('generations')
                  .getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
              }

              await supabase
                .from('generations')
                .update({
                  status: 'completed',
                  result_url: publicUrl,
                  completed_at: new Date().toISOString(),
                })
                .eq('id', generation.id);

              generation.status = 'completed';
              generation.result_url = publicUrl;

            } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
              await supabase
                .from('generations')
                .update({
                  status: 'failed',
                  error: prediction.error || 'Statut Replicate inconnu',
                })
                .eq('id', generation.id);

              generation.status = 'failed';
              generation.error = prediction.error || 'Statut inconnu';

              // Refund credits
              const profile = await supabase.from('profiles').select('credits').eq('id', user.id).single();
              if (profile.data && profile.data.credits !== -1) {
                await supabase
                  .from('profiles')
                  .update({ credits: profile.data.credits + (generation.metadata?.credits || 0) })
                  .eq('id', user.id);
              }
            }
          }
        } catch (pollError) {
          console.error('[VideoAPI] Polling error:', pollError);
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


