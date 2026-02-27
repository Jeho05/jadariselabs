/**
 * Video Generation Worker Entry Point
 * Run this as a separate process to process video generation jobs
 */

import { videoQueue } from '../queue/video-queue';
import { processVideoJob } from './video-worker';
import { redisManager } from '../queue/redis';
import { logger } from '../monitoring/metrics';
import type { Job } from 'bullmq';
import type { VideoJobData, VideoJobResult } from '../types/video';

async function startWorker() {
  try {
    logger.info('Starting Video Generation Worker...');

    // Check Redis connection
    const health = await redisManager.healthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`Redis unhealthy: ${health.error}`);
    }
    logger.info(`Redis connected (latency: ${health.latency}ms)`);

    // Start processing jobs
    videoQueue.startWorker(async (job: Job<VideoJobData>): Promise<VideoJobResult> => {
      logger.info(`Processing job ${job.id}`, {
        generationId: job.data.generationId,
        userId: job.data.userId,
        traceId: job.data.traceId,
      });

      try {
        const result = await processVideoJob(job);
        logger.info(`Job ${job.id} completed`, { result });
        return result;
      } catch (error) {
        logger.error(`Job ${job.id} failed`, { error });
        throw error;
      }
    });

    logger.info('Worker started successfully');

    // Handle shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      await videoQueue.close();
      await redisManager.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Keep process alive
    process.stdin.resume();

  } catch (error) {
    logger.error('Failed to start worker', { error });
    process.exit(1);
  }
}

// Start the worker
startWorker();
