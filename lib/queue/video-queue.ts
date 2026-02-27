/**
 * Video Generation Queue - Enterprise Grade
 * BullMQ queue with priority, retry logic, and monitoring
 */

import { Queue, Worker, Job, QueueEvents, QueueBaseOptions } from 'bullmq';
import { redis, redisSubscriber } from './redis';
import { QUEUE_CONFIG, QUEUE_NAMES, JOB_PRIORITIES, WORKER_CONFIG } from '../config/queue';
import type { VideoJobData, VideoJobResult, VideoProgress } from '../types/video';

class VideoQueueManager {
  private queue: Queue<VideoJobData, VideoJobResult>;
  private worker: Worker<VideoJobData, VideoJobResult> | null = null;
  private queueEvents: QueueEvents | null = null;

  constructor() {
    // BullMQ connection options
    const connectionOptions = {
      host: QUEUE_CONFIG.redis.host,
      port: QUEUE_CONFIG.redis.port,
      password: QUEUE_CONFIG.redis.password,
      db: QUEUE_CONFIG.redis.db,
    };

    this.queue = new Queue<VideoJobData, VideoJobResult>(QUEUE_NAMES.VIDEO_GENERATION, {
      connection: connectionOptions,
      defaultJobOptions: QUEUE_CONFIG.defaultJobOptions,
    });

    this.setupQueueEvents(connectionOptions);
  }

  private setupQueueEvents(connectionOptions: any): void {
    this.queueEvents = new QueueEvents(QUEUE_NAMES.VIDEO_GENERATION, {
      connection: connectionOptions,
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`[Queue] Job ${jobId} completed:`, returnvalue);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`[Queue] Job ${jobId} failed:`, failedReason);
    });

    this.queueEvents.on('progress', ({ jobId, data }) => {
      console.log(`[Queue] Job ${jobId} progress:`, data);
    });

    this.queueEvents.on('stalled', ({ jobId }) => {
      console.warn(`[Queue] Job ${jobId} stalled`);
    });
  }

  async addJob(
    userId: string,
    generationId: string,
    config: VideoJobData['config'],
    userPlan: string
  ): Promise<Job<VideoJobData, VideoJobResult>> {
    const priority = this.getPriority(userPlan);
    const traceId = this.generateTraceId();

    const jobData: VideoJobData = {
      userId,
      generationId,
      config,
      priority,
      traceId,
      retryCount: 0,
      createdAt: new Date(),
    };

    const job = await this.queue.add('generate-video', jobData, {
      jobId: generationId,
      priority,
      attempts: QUEUE_CONFIG.defaultJobOptions.attempts,
      backoff: QUEUE_CONFIG.defaultJobOptions.backoff,
    });

    console.log(`[Queue] Job ${job.id} added to queue (priority: ${priority})`);

    return job;
  }

  startWorker(processor: (job: Job<VideoJobData>) => Promise<VideoJobResult>): void {
    if (this.worker) {
      console.warn('[Queue] Worker already running');
      return;
    }

    // BullMQ connection options
    const connectionOptions = {
      host: QUEUE_CONFIG.redis.host,
      port: QUEUE_CONFIG.redis.port,
      password: QUEUE_CONFIG.redis.password,
      db: QUEUE_CONFIG.redis.db,
    };

    this.worker = new Worker<VideoJobData, VideoJobResult>(
      QUEUE_NAMES.VIDEO_GENERATION,
      processor,
      {
        connection: connectionOptions,
        concurrency: WORKER_CONFIG.concurrency,
        limiter: WORKER_CONFIG.limiter,
        ...QUEUE_CONFIG.settings,
      }
    );

    this.worker.on('completed', (job: Job<VideoJobData>, result: VideoJobResult) => {
      console.log(`[Worker] Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job: Job<VideoJobData> | undefined, error: Error) => {
      console.error(`[Worker] Job ${job?.id} failed:`, error.message);
    });

    this.worker.on('error', (error: Error) => {
      console.error('[Worker] Error:', error.message);
    });

    this.worker.on('stalled', (jobId: string) => {
      console.warn(`[Worker] Job ${jobId} stalled`);
    });

    console.log(`[Worker] Started with concurrency: ${WORKER_CONFIG.concurrency}`);
  }

  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
      console.log('[Worker] Stopped');
    }
  }

  async getJob(jobId: string): Promise<Job<VideoJobData, VideoJobResult> | undefined> {
    return this.queue.getJob(jobId);
  }

  async getJobStatus(jobId: string): Promise<{
    status: string;
    progress: number;
    returnValue?: VideoJobResult;
    failedReason?: string;
  } | null> {
    const job = await this.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = typeof job.progress === 'number' ? job.progress : 0;

    return {
      status: state,
      progress,
      returnValue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);
    
    const isPaused = await this.queue.isPaused();

    return { 
      waiting, 
      active, 
      completed, 
      failed, 
      delayed, 
      paused: isPaused ? 1 : 0 
    };
  }

  async getUserJobs(userId: string): Promise<Job<VideoJobData, VideoJobResult>[]> {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'completed', 'failed']);
    return jobs.filter(job => job.data.userId === userId);
  }

  async getQueuePosition(jobId: string): Promise<number> {
    const waiting = await this.queue.getWaiting();
    const position = waiting.findIndex(job => job.id === jobId);
    return position >= 0 ? position + 1 : 0;
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job) return false;

    try {
      await job.remove();
      console.log(`[Queue] Job ${jobId} cancelled`);
      return true;
    } catch (error) {
      console.error(`[Queue] Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    console.log('[Queue] Paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    console.log('[Queue] Resumed');
  }

  async drainQueue(): Promise<void> {
    await this.queue.drain();
    console.log('[Queue] Drained');
  }

  async close(): Promise<void> {
    await this.stopWorker();
    if (this.queueEvents) {
      await this.queueEvents.close();
    }
    await this.queue.close();
    console.log('[Queue] Closed');
  }

  private getPriority(userPlan: string): number {
    switch (userPlan) {
      case 'pro':
        return JOB_PRIORITIES.PRO;
      case 'starter':
        return JOB_PRIORITIES.STARTER;
      default:
        return JOB_PRIORITIES.FREE;
    }
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  getQueue(): Queue<VideoJobData, VideoJobResult> {
    return this.queue;
  }
}

// Export singleton instance
export const videoQueue = new VideoQueueManager();
export default VideoQueueManager;
