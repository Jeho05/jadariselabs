/**
 * Replicate Client - Simplified for Vercel Serverless
 * Direct API calls without queue or external workers
 */

import { VIDEO_MODELS } from './types/video';
import type { VideoModel } from './types/video';

// Replicate API configuration
const REPLICATE_API_URL = 'https://api.replicate.com/v1';

// Model IDs for video generation
const MODEL_IDS: Record<VideoModel, string> = {
  wan2: 'minimax/video-01',
  gen2: 'runway-gen2/gen2',
  sora: 'openai/sora',
};

interface PredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  output: string | null;
  error: string | null;
  logs: string;
  metrics: {
    predict_time?: number;
  };
}

interface CreatePredictionParams {
  prompt: string;
  model: VideoModel;
  duration: number;
  style?: string;
  quality?: string;
  webhook?: string;
}

/**
 * Create a video prediction on Replicate
 */
export async function createVideoPrediction(params: CreatePredictionParams): Promise<PredictionResponse> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  const modelConfig = VIDEO_MODELS[params.model];
  if (!modelConfig) {
    throw new Error(`Unknown model: ${params.model}`);
  }

  const modelId = MODEL_IDS[params.model];
  
  // Build input based on model
  const input: Record<string, unknown> = {
    prompt: params.prompt,
  };

  // Model-specific parameters
  if (params.model === 'wan2') {
    input.duration = params.duration;
    if (params.style) input.style = params.style;
  } else if (params.model === 'gen2') {
    input.motion_bucket_id = 127; // Default motion
    input.cond_aug = 0.02;
    input.video_length = params.duration;
  } else if (params.model === 'sora') {
    input.duration = params.duration;
    input.quality = params.quality || 'standard';
  }

  // Create prediction
  const response = await fetch(`${REPLICATE_API_URL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait', // Wait for completion (up to 60s)
    },
    body: JSON.stringify({
      version: modelId,
      input,
      webhook: params.webhook,
      webhook_events_filter: ['completed', 'failed'],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get prediction status
 */
export async function getPrediction(predictionId: string): Promise<PredictionResponse> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get prediction: ${response.status}`);
  }

  return response.json();
}

/**
 * Cancel a prediction
 */
export async function cancelPrediction(predictionId: string): Promise<void> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel prediction: ${response.status}`);
  }
}

/**
 * Calculate credits for a generation
 */
export function calculateCredits(model: VideoModel, duration: number, quality?: string): number {
  const modelConfig = VIDEO_MODELS[model];
  if (!modelConfig) return 10; // Default

  const baseCredits = modelConfig.creditsPerSecond * duration;
  const qualityMultiplier = quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1;
  
  return Math.ceil(baseCredits * qualityMultiplier);
}

/**
 * Estimate generation time in seconds
 */
export function estimateGenerationTime(model: VideoModel, duration: number): number {
  const baseTimes: Record<VideoModel, number> = {
    wan2: 30,
    gen2: 45,
    sora: 60,
  };
  
  return (baseTimes[model] || 30) * duration;
}

export const replicateClient = {
  createPrediction: createVideoPrediction,
  getPrediction,
  cancelPrediction,
  calculateCredits,
  estimateGenerationTime,
};
