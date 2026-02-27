/**
 * Queue Configuration - Enterprise Grade
 * BullMQ + Redis configuration with production settings
 */

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  retryStrategy: (times: number) => number | null;
}

export interface QueueConfig {
  redis: RedisConfig;
  defaultJobOptions: {
    removeOnComplete: number;
    removeOnFail: number;
    attempts: number;
    backoff: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    timeout: number;
  };
  settings: {
    maxStalledCount: number;
    stalledInterval: number;
    lockDuration: number;
  };
}

export const QUEUE_CONFIG: QueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    retryStrategy: (times: number) => {
      if (times > 10) {
        console.error('Redis connection failed after 10 retries');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000); // Exponential backoff
    },
  },
  
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    timeout: 300000, // 5 minutes
  },
  
  settings: {
    maxStalledCount: 1, // Max times a job can be stalled before failing
    stalledInterval: 30000, // Check for stalled jobs every 30s
    lockDuration: 300000, // Lock duration for jobs
  },
};

// Queue names
export const QUEUE_NAMES = {
  VIDEO_GENERATION: 'video-generation',
  IMAGE_GENERATION: 'image-generation',
  NOTIFICATION: 'notification',
  WEBHOOK: 'webhook',
} as const;

// Job priorities based on user plan
export const JOB_PRIORITIES = {
  PRO: 1, // Highest priority
  STARTER: 5,
  FREE: 10, // Lowest priority
} as const;

// Worker configuration
export const WORKER_CONFIG = {
  concurrency: parseInt(process.env.QUEUE_MAX_CONCURRENT || '3'),
  limiter: {
    max: 10, // Max jobs per duration
    duration: 60000, // Per minute
  },
};

export default QUEUE_CONFIG;
