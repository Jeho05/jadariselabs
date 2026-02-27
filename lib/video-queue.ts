/**
 * Advanced Video Generation Queue System
 * Handles async video generation with BullMQ and Redis
 * Includes priority queuing, retry logic, and monitoring
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { createClient } from '@/lib/supabase/server';
import { replicateClient, type VideoGenerationConfig } from './replicate';
import type { ReplicatePrediction } from './replicate';

export interface VideoGenerationJob {
  userId: string;
  generationId: string;
  config: VideoGenerationConfig;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
};

// Queue configuration
const VIDEO_QUEUE_NAME = 'video-generation';
const QUEUE_CONCURRENCY = 3; // Max concurrent jobs

// Create queue instance
export const videoQueue = new Queue<VideoGenerationJob>(VIDEO_QUEUE_NAME, {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    delay: 0,
  },
});

// Queue events for monitoring
export const queueEvents = new QueueEvents(VIDEO_QUEUE_NAME, {
  connection: redisConfig,
});

// Worker for processing video generation jobs
export const videoWorker = new Worker<VideoGenerationJob>(
  VIDEO_QUEUE_NAME,
  async (job: Job<VideoGenerationJob>) => {
    const { userId, generationId, config } = job.data;
    
    try {
      console.log(`Processing video generation job ${generationId} for user ${userId}`);
      
      // Update job status in database
      await updateGenerationStatus(generationId, 'processing');
      
      // Enhance prompt if user has premium plan
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();

      let enhancedConfig = { ...config };
      
      if (profile?.plan && ['starter', 'pro'].includes(profile.plan)) {
        enhancedConfig.prompt = await replicateClient.enhancePrompt(config.prompt);
      }

      // Validate prompt
      const validation = replicateClient.validatePrompt(enhancedConfig.prompt);
      if (!validation.valid) {
        throw new Error(`Invalid prompt: ${validation.issues.join(', ')}`);
      }

      // Create prediction with Replicate
      const prediction = await replicateClient.createPrediction(enhancedConfig);
      
      // Update generation with prediction ID
      await updateGenerationWithPrediction(generationId, prediction.id);
      
      // Poll for completion
      const result = await pollPredictionCompletion(prediction.id, job);
      
      if (result.status === 'succeeded' && result.output) {
        // Upload video to Supabase Storage
        const videoUrl = await uploadVideoToStorage(userId, generationId, result.output[0]);
        
        // Update generation with final result
        await updateGenerationComplete(generationId, videoUrl, result);
        
        console.log(`Video generation completed successfully: ${generationId}`);
        return { success: true, videoUrl, predictionId: prediction.id };
      } else {
        throw new Error(result.error || 'Video generation failed');
      }
      
    } catch (error) {
      console.error(`Video generation failed for job ${generationId}:`, error);
      
      // Update generation status to failed
      await updateGenerationStatus(generationId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      
      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: QUEUE_CONCURRENCY,
  }
);

// Poll prediction completion with timeout
async function pollPredictionCompletion(
  predictionId: string, 
  job: Job<VideoGenerationJob>,
  timeout = 300000 // 5 minutes
): Promise<ReplicatePrediction> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds
  
  while (Date.now() - startTime < timeout) {
    try {
      const prediction = await replicateClient.getPrediction(predictionId);
      
      // Update progress
      const progress = calculateProgress(prediction);
      await job.updateProgress(progress);
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }
      
      // Check if job is being cancelled
      if (await job.isActive() === false) {
        await replicateClient.cancelPrediction(predictionId);
        throw new Error('Job was cancelled');
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error(`Error polling prediction ${predictionId}:`, error);
      throw error;
    }
  }
  
  throw new Error(`Prediction ${predictionId} timed out after ${timeout}ms`);
}

// Calculate progress based on prediction status
function calculateProgress(prediction: ReplicatePrediction): number {
  switch (prediction.status) {
    case 'starting':
      return 10;
    case 'processing':
      return 50;
    case 'succeeded':
      return 100;
    case 'failed':
      return 0;
    default:
      return 0;
  }
}

// Upload video to Supabase Storage
async function uploadVideoToStorage(
  userId: string, 
  generationId: string, 
  videoUrl: string
): Promise<string> {
  const supabase = await createClient();
  
  try {
    // Download video from Replicate
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }
    
    const videoBuffer = await response.arrayBuffer();
    
    // Upload to Supabase Storage
    const fileName = `videos/${userId}/${generationId}.mp4`;
    const { data, error } = await supabase.storage
      .from('generations')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generations')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading video to storage:', error);
    throw error;
  }
}

// Database update functions
async function updateGenerationStatus(
  generationId: string, 
  status: string, 
  error?: string
): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('generations')
    .update({ 
      status,
      ...(error && { error }),
      updated_at: new Date().toISOString()
    })
    .eq('id', generationId);
}

async function updateGenerationWithPrediction(
  generationId: string, 
  predictionId: string
): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('generations')
    .update({ 
      prediction_id: predictionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', generationId);
}

async function updateGenerationComplete(
  generationId: string, 
  videoUrl: string, 
  prediction: ReplicatePrediction
): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('generations')
    .update({ 
      status: 'completed',
      result_url: videoUrl,
      completed_at: prediction.completed_at || new Date().toISOString(),
      metadata: {
        prediction_id: prediction.id,
        predict_time: prediction.metrics?.predict_time,
        model: prediction.logs?.includes('wan2') ? 'wan2' : 'gen2',
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', generationId);
}

// Queue management functions
export async function addVideoGenerationJob(
  userId: string,
  generationId: string,
  config: VideoGenerationConfig,
  priority = 0
): Promise<Job<VideoGenerationJob>> {
  const jobData: VideoGenerationJob = {
    userId,
    generationId,
    config,
    priority,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
  };
  
  return await videoQueue.add('generate-video', jobData, {
    priority,
    delay: 0,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

export async function getQueueStats(): Promise<QueueStats> {
  const waiting = await videoQueue.getWaiting();
  const active = await videoQueue.getActive();
  const completed = await videoQueue.getCompleted();
  const failed = await videoQueue.getFailed();
  const delayed = await videoQueue.getDelayed();
  const isPaused = await videoQueue.isPaused();
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
    paused: isPaused ? 1 : 0,
  };
}

export async function getUserJobs(userId: string): Promise<Job<VideoGenerationJob>[]> {
  const jobs = await videoQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  return jobs.filter(job => job.data.userId === userId);
}

export async function cancelGenerationJob(generationId: string): Promise<boolean> {
  const jobs = await videoQueue.getJobs(['waiting', 'active']);
  const job = jobs.find(j => j.data.generationId === generationId);
  
  if (job) {
    await job.remove();
    
    // Cancel Replicate prediction if it exists
    const supabase = await createClient();
    const { data: generation } = await supabase
      .from('generations')
      .select('prediction_id')
      .eq('id', generationId)
      .single();
    
    if (generation?.prediction_id) {
      try {
        await replicateClient.cancelPrediction(generation.prediction_id);
      } catch (error) {
        console.error('Failed to cancel Replicate prediction:', error);
      }
    }
    
    await updateGenerationStatus(generationId, 'cancelled');
    return true;
  }
  
  return false;
}

// Queue events monitoring
queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed with result:`, returnvalue);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed:`, failedReason);
});

queueEvents.on('progress', ({ jobId, data }) => {
  console.log(`Job ${jobId} progress:`, data);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down video queue worker...');
  await videoWorker.close();
  await videoQueue.close();
  await queueEvents.close();
  process.exit(0);
});

export default videoQueue;
