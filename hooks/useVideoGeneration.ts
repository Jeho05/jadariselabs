/**
 * Video Generation Hook - Polling Only (No Realtime)
 * Simple polling-based status updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { VIDEO_MODELS } from '@/lib/types/video';
import type { VideoModel } from '@/lib/types/video';

interface Generation {
  id: string;
  user_id: string;
  type: string;
  prompt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result_url: string | null;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

interface VideoGenerationState {
  isGenerating: boolean;
  generationId: string | null;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  videoUrl: string | null;
  error: string | null;
  estimatedTime: number;
}

interface UseVideoGenerationOptions {
  onCompleted?: (videoUrl: string) => void;
  onFailed?: (error: string) => void;
  onCancelled?: () => void;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const [state, setState] = useState<VideoGenerationState>({
    isGenerating: false,
    generationId: null,
    status: 'idle',
    progress: 0,
    videoUrl: null,
    error: null,
    estimatedTime: 0,
  });

  // Poll for updates
  useEffect(() => {
    if (!state.generationId || !state.isGenerating) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/video?generation_id=${state.generationId}`);
        const data = await response.json();
        
        if (data.success && data.generation) {
          const generation = data.generation as Generation;
          
          // Update progress based on time elapsed
          const elapsed = Date.now() - new Date(generation.created_at).getTime();
          const estimatedMs = state.estimatedTime * 1000;
          const progressPercent = Math.min(Math.floor((elapsed / estimatedMs) * 100), 90);
          
          if (generation.status === 'completed') {
            setState(prev => ({
              ...prev,
              isGenerating: false,
              status: 'completed',
              progress: 100,
              videoUrl: generation.result_url,
            }));
            options.onCompleted?.(generation.result_url || '');
            clearInterval(pollInterval);
            
          } else if (generation.status === 'failed') {
            setState(prev => ({
              ...prev,
              isGenerating: false,
              status: 'failed',
              error: generation.error || 'Generation failed',
            }));
            options.onFailed?.(generation.error || 'Generation failed');
            clearInterval(pollInterval);
            
          } else if (generation.status === 'cancelled') {
            setState(prev => ({
              ...prev,
              isGenerating: false,
              status: 'cancelled',
            }));
            options.onCancelled?.();
            clearInterval(pollInterval);
            
          } else if (generation.status === 'processing') {
            setState(prev => ({
              ...prev,
              status: 'processing',
              progress: progressPercent,
            }));
          }
        }
      } catch (error) {
        console.error('[VideoHook] Poll error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [state.generationId, state.isGenerating, state.estimatedTime, options]);

  // Start generation
  const generate = useCallback(async (
    prompt: string,
    duration: number,
    model: VideoModel = 'wan2',
    quality: string = 'standard',
    style?: string
  ) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      status: 'processing',
      progress: 0,
      videoUrl: null,
      error: null,
    }));

    try {
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, model, quality, style }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          status: 'failed',
          error: data.details || data.error || 'Generation failed',
        }));
        return null;
      }

      // If video is already complete (short videos)
      if (data.video_url) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          status: 'completed',
          progress: 100,
          videoUrl: data.video_url,
        }));
        options.onCompleted?.(data.video_url);
        return data.video_url;
      }

      // Set generation ID for polling
      setState(prev => ({
        ...prev,
        generationId: data.generation_id,
        estimatedTime: data.estimated_time_seconds || duration * 30,
      }));

      return data.generation_id;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        status: 'failed',
        error: 'Network error. Please try again.',
      }));
      return null;
    }
  }, [options]);

  // Cancel generation
  const cancel = useCallback(async () => {
    if (!state.generationId) return;

    try {
      await fetch(`/api/generate/video?generation_id=${state.generationId}`, {
        method: 'DELETE',
      });

      setState(prev => ({
        ...prev,
        isGenerating: false,
        status: 'cancelled',
      }));
      options.onCancelled?.();

    } catch (error) {
      console.error('[VideoHook] Cancel error:', error);
    }
  }, [state.generationId, options]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      generationId: null,
      status: 'idle',
      progress: 0,
      videoUrl: null,
      error: null,
      estimatedTime: 0,
    });
  }, []);

  return {
    ...state,
    generate,
    cancel,
    reset,
  };
}

// Calculate required credits
export function calculateRequiredCredits(
  model: VideoModel,
  duration: number,
  quality: string = 'standard'
): number {
  const modelConfig = VIDEO_MODELS[model];
  if (!modelConfig) return 10;

  const baseCredits = modelConfig.creditsPerSecond * duration;
  const qualityMultiplier = quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1;
  
  return Math.ceil(baseCredits * qualityMultiplier);
}
