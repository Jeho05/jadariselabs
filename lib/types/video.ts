/**
 * Video Generation Types - Enterprise Grade
 * Complete type definitions for video generation pipeline
 */

// PlanType is defined locally to avoid import issues
export type PlanType = 'free' | 'starter' | 'pro';

// Video generation models
export type VideoModel = 'wan2' | 'gen2' | 'sora';

export type VideoQuality = 'standard' | 'high' | 'ultra';

export type VideoStyle = 
  | 'cinematic'
  | 'anime'
  | 'realistic'
  | 'artistic'
  | 'documentary'
  | 'commercial'
  | 'social-media'
  | 'custom';

export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export type GenerationStatus = 
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Video generation configuration
export interface VideoGenerationConfig {
  prompt: string;
  duration: number;
  model?: VideoModel;
  quality?: VideoQuality;
  style?: VideoStyle;
  aspectRatio?: VideoAspectRatio;
  negativePrompt?: string;
  seed?: number;
  enhancePrompt?: boolean;
  webhook?: string;
}

// Video job data for queue
export interface VideoJobData {
  userId: string;
  generationId: string;
  config: VideoGenerationConfig;
  priority: number;
  traceId: string;
  retryCount: number;
  createdAt: Date;
}

// Video job result
export interface VideoJobResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  predictionId?: string;
  metadata?: VideoMetadata;
  error?: string;
  retryIn?: number;
}

// Video metadata
export interface VideoMetadata {
  model: VideoModel;
  duration: number;
  quality: VideoQuality;
  style: VideoStyle;
  aspectRatio: VideoAspectRatio;
  fileSize: number;
  resolution: string;
  fps: number;
  codec: string;
  bitrate: number;
  generationTime: number;
  creditsUsed: number;
}

// Replicate prediction
export interface ReplicatePrediction {
  id: string;
  version: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: Record<string, unknown>;
  output?: string[];
  error?: string;
  logs?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    cancel: string;
    get: string;
  };
  metrics?: {
    predict_time?: number;
  };
}

// Model information
export interface VideoModelInfo {
  name: string;
  version: string;
  displayName: string;
  description: string;
  creditsPerSecond: number;
  maxDuration: number;
  supportedFeatures: string[];
  qualityLevels: VideoQuality[];
  aspectRatios: VideoAspectRatio[];
  avgGenerationTime: number; // seconds per second of video
}

// Available models
export const VIDEO_MODELS: Record<VideoModel, VideoModelInfo> = {
  wan2: {
    name: 'lucataco/wan2.1',
    version: 'wan2.1-t2v-1.3b',
    displayName: 'Wan 2.1',
    description: 'Fast text-to-video generation with good quality',
    creditsPerSecond: 1,
    maxDuration: 15,
    supportedFeatures: ['text-to-video', 'style-transfer'],
    qualityLevels: ['standard', 'high'],
    aspectRatios: ['16:9', '9:16', '1:1'],
    avgGenerationTime: 30, // 30s per second of video
  },
  gen2: {
    name: 'runwayml/gen-2',
    version: 'gen2-t2v',
    displayName: 'Gen-2',
    description: 'High quality text-to-video with motion control',
    creditsPerSecond: 2,
    maxDuration: 10,
    supportedFeatures: ['text-to-video', 'image-to-video', 'motion-brush'],
    qualityLevels: ['standard', 'high', 'ultra'],
    aspectRatios: ['16:9', '9:16'],
    avgGenerationTime: 45,
  },
  sora: {
    name: 'openai/sora',
    version: 'sora-1.0',
    displayName: 'Sora',
    description: 'State-of-the-art video generation with physics simulation',
    creditsPerSecond: 3,
    maxDuration: 30,
    supportedFeatures: ['text-to-video', 'physics-simulation', '4k-output', 'long-form'],
    qualityLevels: ['high', 'ultra'],
    aspectRatios: ['16:9', '9:16', '1:1'],
    avgGenerationTime: 60,
  },
};

// Progress tracking
export interface VideoProgress {
  generationId: string;
  status: GenerationStatus;
  progress: number; // 0-100
  stage: VideoProgressStage;
  message: string;
  estimatedTimeRemaining?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export type VideoProgressStage = 
  | 'queued'
  | 'processing'
  | 'validating'
  | 'enhancing-prompt'
  | 'creating-prediction'
  | 'generating'
  | 'uploading'
  | 'finalizing'
  | 'completed'
  | 'failed';

// WebSocket events
export interface VideoWebSocketEvents {
  // Client -> Server
  'subscribe': { generationId: string };
  'unsubscribe': { generationId: string };
  'cancel': { generationId: string };
  
  // Server -> Client
  'job:queued': { generationId: string; position: number };
  'job:started': { generationId: string; workerId: string };
  'job:progress': VideoProgress;
  'job:completed': { generationId: string; videoUrl: string };
  'job:failed': { generationId: string; error: string; retryIn?: number };
  'job:cancelled': { generationId: string };
}

// Cache keys
export interface VideoCacheKeys {
  promptHash: (prompt: string) => string;
  userQuota: (userId: string) => string;
  modelStatus: (model: VideoModel) => string;
  trending: () => string;
  generation: (generationId: string) => string;
}

export const VIDEO_CACHE_KEYS: VideoCacheKeys = {
  promptHash: (prompt: string) => `video:prompt:${hashPrompt(prompt)}`,
  userQuota: (userId: string) => `video:quota:${userId}`,
  modelStatus: (model: VideoModel) => `video:model:${model}:status`,
  trending: () => `video:trending:${new Date().toISOString().split('T')[0]}`,
  generation: (generationId: string) => `video:gen:${generationId}`,
};

// Helper function to hash prompt
function hashPrompt(prompt: string): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(prompt.trim().toLowerCase())
    .digest('hex')
    .substring(0, 16);
}

// API request/response types
export interface VideoGenerationRequest {
  prompt: string;
  duration: number;
  model?: VideoModel;
  quality?: VideoQuality;
  style?: VideoStyle;
  aspectRatio?: VideoAspectRatio;
  negativePrompt?: string;
  seed?: number;
  enhancePrompt?: boolean;
}

export interface VideoGenerationResponse {
  success: boolean;
  generation_id: string;
  job_id: string;
  estimated_time_seconds: number;
  queue_position: number;
  model_used: VideoModel;
  credits_charged: number;
  remaining_credits: number;
  trace_id: string;
}

export interface VideoGenerationErrorResponse {
  success: false;
  error: string;
  details?: string;
  trace_id: string;
  retry_after?: number;
}

// Rate limiting
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipFailedRequests: boolean;
  keyGenerator?: (userId: string) => string;
}

export const VIDEO_RATE_LIMITS: Record<string, RateLimitConfig> = {
  perMinute: {
    windowMs: 60000,
    maxRequests: 10,
    skipFailedRequests: false,
  },
  perHour: {
    windowMs: 3600000,
    maxRequests: 100,
    skipFailedRequests: true,
  },
  perDay: {
    windowMs: 86400000,
    maxRequests: 500,
    skipFailedRequests: true,
  },
};

export default VideoGenerationConfig;
