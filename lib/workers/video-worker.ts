/**
 * Video Generation Worker - Enterprise Grade
 * Processes video generation jobs with robust error handling and progress tracking
 */

import { Job } from 'bullmq';
import { createClient } from '@/lib/supabase/server';
import { replicateClient } from '../replicate/client';
import type { VideoJobData, VideoJobResult, VideoProgress, VideoProgressStage } from '../types/video';

export interface WorkerProgress {
  percent: number;
  stage: VideoProgressStage;
  message: string;
}

export async function processVideoJob(
  job: Job<VideoJobData>
): Promise<VideoJobResult> {
  const { userId, generationId, config, traceId } = job.data;
  const startTime = Date.now();

  console.log(`[Worker] Processing job ${generationId} (trace: ${traceId})`);

  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Stage 1: Update status to processing
    await updateProgress(job, 5, 'processing', 'Starting video generation');
    await updateGenerationStatus(supabase, generationId, 'processing');

    // Stage 2: Validate and enhance prompt (if premium)
    let enhancedConfig = { ...config };
    
    if (config.enhancePrompt) {
      await updateProgress(job, 10, 'enhancing-prompt', 'Enhancing prompt with AI');
      enhancedConfig.prompt = await enhancePrompt(config.prompt, userId);
    }

    // Stage 3: Validate configuration
    await updateProgress(job, 15, 'validating', 'Validating configuration');
    replicateClient.validateConfig(enhancedConfig);

    // Stage 4: Create Replicate prediction
    await updateProgress(job, 20, 'creating-prediction', 'Creating AI prediction');
    
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/video/${generationId}`;
    const prediction = await replicateClient.createPrediction({
      ...enhancedConfig,
      webhook: webhookUrl,
    });

    // Update generation with prediction ID
    await supabase
      .from('generations')
      .update({
        prediction_id: prediction.id,
        metadata: {
          ...enhancedConfig,
          model: config.model || 'wan2',
          prediction_id: prediction.id,
        },
      })
      .eq('id', generationId);

    // Stage 5: Poll for completion
    await updateProgress(job, 30, 'generating', 'Generating video with AI');

    const result = await replicateClient.pollPrediction(prediction.id, {
      timeout: 300000, // 5 minutes
      interval: 3000, // 3 seconds
      onProgress: async (progress) => {
        // Map Replicate progress to our stages (30-80%)
        const mappedProgress = 30 + (progress * 0.5);
        await updateProgress(
          job,
          mappedProgress,
          'generating',
          `Generating video... ${Math.round(progress)}%`
        );
      },
    });

    // Stage 6: Upload video to storage
    await updateProgress(job, 85, 'uploading', 'Uploading video to storage');

    if (!result.output || result.output.length === 0) {
      throw new Error('No video output from Replicate');
    }

    const videoUrl = await uploadVideoToStorage(
      supabase,
      userId,
      generationId,
      result.output[0]
    );

    // Stage 7: Finalize generation
    await updateProgress(job, 95, 'finalizing', 'Finalizing generation');

    const generationTime = Date.now() - startTime;
    const metadata = {
      model: config.model || 'wan2',
      duration: config.duration,
      quality: config.quality || 'standard',
      style: config.style,
      prediction_id: prediction.id,
      generation_time_ms: generationTime,
      predict_time: result.metrics?.predict_time,
      file_size: await getFileSize(videoUrl),
    };

    await supabase
      .from('generations')
      .update({
        status: 'completed',
        result_url: videoUrl,
        completed_at: new Date().toISOString(),
        metadata,
      })
      .eq('id', generationId);

    // Deduct credits
    await deductCredits(supabase, userId, config);

    // Stage 8: Complete
    await updateProgress(job, 100, 'completed', 'Video generation completed');

    console.log(`[Worker] Job ${generationId} completed in ${generationTime}ms`);

    return {
      success: true,
      videoUrl,
      predictionId: prediction.id,
      metadata: metadata as any,
    };

  } catch (error) {
    console.error(`[Worker] Job ${generationId} failed:`, error);

    // Update generation status
    const supabase = await createClient();
    await supabase
      .from('generations')
      .update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId);

    // Determine if we should retry
    const shouldRetry = shouldRetryJob(error, job.data.retryCount);

    if (shouldRetry && job.data.retryCount < 3) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryIn: 5000, // Retry in 5 seconds
      };
    }

    throw error;
  }
}

// Helper functions

async function updateProgress(
  job: Job<VideoJobData>,
  percent: number,
  stage: VideoProgressStage,
  message: string
): Promise<void> {
  await job.updateProgress({ percent, stage, message });
  console.log(`[Worker] Job ${job.id} progress: ${percent}% - ${message}`);
}

async function updateGenerationStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  generationId: string,
  status: string
): Promise<void> {
  await supabase
    .from('generations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', generationId);
}

async function enhancePrompt(prompt: string, userId: string): Promise<string> {
  try {
    // Call prompt enhancement API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/enhance/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: 'video_generation',
        userId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.enhanced_prompt || prompt;
    }
  } catch (error) {
    console.warn('[Worker] Prompt enhancement failed:', error);
  }

  return prompt;
}

async function uploadVideoToStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  generationId: string,
  videoUrl: string
): Promise<string> {
  try {
    // Download video from Replicate
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBuffer = await response.arrayBuffer();

    // Upload to Supabase Storage
    const fileName = `videos/${userId}/${generationId}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generations')
      .getPublicUrl(fileName);

    return publicUrl;

  } catch (error) {
    console.error('[Worker] Video upload failed:', error);
    // Fallback to Replicate URL
    return videoUrl;
  }
}

async function deductCredits(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  config: VideoJobData['config']
): Promise<void> {
  const creditsRequired = replicateClient.calculateCredits(
    config.model || 'wan2',
    config.duration,
    config.quality
  );

  // Get current credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Don't deduct if unlimited (-1)
  if (profile.credits === -1) {
    return;
  }

  // Deduct credits
  const newCredits = Math.max(0, profile.credits - creditsRequired);
  await supabase
    .from('profiles')
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

async function getFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch {
    return 0;
  }
}

function shouldRetryJob(error: unknown, retryCount: number): boolean {
  if (retryCount >= 3) {
    return false;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Retry on network/timeout errors
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      return true;
    }

    // Retry on Replicate processing errors
    if (message.includes('replicate') && !message.includes('invalid')) {
      return true;
    }
  }

  return false;
}

export default processVideoJob;
