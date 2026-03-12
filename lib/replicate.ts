/**
 * Replicate Video Synthesis Client
 * GÃ©nÃ©ration de vidÃ©o via l'API Replicate (Wan 2.1)
 */


import type { VideoModel, VideoQuality } from '@/lib/types/video';
import { VIDEO_MODELS } from '@/lib/types/video';

export type ReplicateVideoModel = 'wan-video/wan-2.1-1.3b';

export interface VideoGenerationOptions {
    model?: ReplicateVideoModel;
    aspect_ratio?: string;
}

export interface ReplicatePrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output?: string;
    error?: string;
}

/**
 * DÃ©marre une gÃ©nÃ©ration de vidÃ©o sur Replicate
 */
export async function generateReplicateVideo(
    prompt: string,
    options: { model?: ReplicateVideoModel } = {}
): Promise<{ predictionId: string }> {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    const model = options.model || 'wan-video/wan-2.1-1.3b';

    if (!apiKey) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Le prompt ne peut pas Ãªtre vide');
    }

    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: {
                prompt: prompt
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Replicate Video: ${errorText.substring(0, 200)}`);
    }

    const prediction = await response.json();
    return {
        predictionId: prediction.id,
    };
}

/**
 * VÃ©rifie le statut d'une prÃ©diction
 */
export async function checkReplicatePrediction(predictionId: string): Promise<ReplicatePrediction> {
    const apiKey = process.env.REPLICATE_API_TOKEN;

    if (!apiKey) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Replicate Status: ${errorText.substring(0, 200)}`);
    }

    const prediction = await response.json();
    return {
        id: prediction.id,
        status: prediction.status,
        output: Array.isArray(prediction.output) ? prediction.output[0] : prediction.output,
        error: prediction.error,
    };
}

/**
 * Calcule les crédits nécessaires (approximatif basé sur le coût)
 */
export function calculateVideoCredits(
    model: VideoModel,
    durationSeconds: number,
    quality: VideoQuality = 'standard'
): number {
    const modelInfo = VIDEO_MODELS[model];
    const safeDuration = Number.isFinite(durationSeconds) && durationSeconds > 0
        ? Math.min(durationSeconds, modelInfo?.maxDuration ?? durationSeconds)
        : (modelInfo?.maxDuration ?? 5);

    const baseCredits = (modelInfo?.creditsPerSecond ?? 2) * safeDuration;
    const qualityMultiplier = quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1;

    return Math.ceil(baseCredits * qualityMultiplier);
}

