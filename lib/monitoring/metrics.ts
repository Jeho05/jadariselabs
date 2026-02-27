/**
 * Monitoring & Metrics - Enterprise Grade
 * Prometheus metrics collection and structured logging
 */

import client from 'prom-client';
import winston from 'winston';

// Initialize Prometheus registry
const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// ============================================
// Custom Metrics
// ============================================

// Queue metrics
export const queueMetrics = {
  length: new client.Gauge({
    name: 'video_queue_length',
    help: 'Current number of jobs in the video queue',
    labelNames: ['priority', 'status'],
    registers: [register],
  }),

  processingTime: new client.Histogram({
    name: 'video_queue_processing_time_seconds',
    help: 'Time spent processing video jobs',
    labelNames: ['model', 'quality', 'status'],
    buckets: [10, 30, 60, 120, 300, 600], // seconds
    registers: [register],
  }),

  jobsTotal: new client.Counter({
    name: 'video_queue_jobs_total',
    help: 'Total number of video jobs processed',
    labelNames: ['status', 'model', 'plan'],
    registers: [register],
  }),

  retries: new client.Counter({
    name: 'video_queue_retries_total',
    help: 'Total number of job retries',
    labelNames: ['model'],
    registers: [register],
  }),
};

// API metrics
export const apiMetrics = {
  requestsTotal: new client.Counter({
    name: 'video_api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'endpoint', 'status'],
    registers: [register],
  }),

  requestDuration: new client.Histogram({
    name: 'video_api_request_duration_seconds',
    help: 'API request duration in seconds',
    labelNames: ['method', 'endpoint', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
  }),

  activeRequests: new client.Gauge({
    name: 'video_api_active_requests',
    help: 'Number of active API requests',
    labelNames: ['endpoint'],
    registers: [register],
  }),
};

// Replicate API metrics
export const replicateMetrics = {
  apiCalls: new client.Counter({
    name: 'replicate_api_calls_total',
    help: 'Total Replicate API calls',
    labelNames: ['model', 'status'],
    registers: [register],
  }),

  apiLatency: new client.Histogram({
    name: 'replicate_api_latency_seconds',
    help: 'Replicate API latency in seconds',
    labelNames: ['model', 'operation'],
    buckets: [0.5, 1, 2, 5, 10, 30, 60],
    registers: [register],
  }),

  cacheHits: new client.Counter({
    name: 'replicate_cache_hits_total',
    help: 'Total cache hits for Replicate predictions',
    labelNames: ['cache_level'],
    registers: [register],
  }),

  rateLimitHits: new client.Counter({
    name: 'replicate_rate_limit_hits_total',
    help: 'Total rate limit hits',
    registers: [register],
  }),
};

// Business metrics
export const businessMetrics = {
  generationsTotal: new client.Counter({
    name: 'video_generations_total',
    help: 'Total video generations',
    labelNames: ['plan', 'model', 'duration_bucket'],
    registers: [register],
  }),

  creditsConsumed: new client.Counter({
    name: 'video_credits_consumed_total',
    help: 'Total credits consumed for video generation',
    labelNames: ['plan', 'model'],
    registers: [register],
  }),

  revenue: new client.Counter({
    name: 'video_revenue_cfa_total',
    help: 'Total revenue from video generation in CFA',
    labelNames: ['plan'],
    registers: [register],
  }),

  userSignups: new client.Counter({
    name: 'video_user_signups_total',
    help: 'Total user signups attributed to video feature',
    registers: [register],
  }),
};

// Cache metrics
export const cacheMetrics = {
  hits: new client.Counter({
    name: 'cache_hits_total',
    help: 'Total cache hits',
    labelNames: ['cache_level', 'key_type'],
    registers: [register],
  }),

  misses: new client.Counter({
    name: 'cache_misses_total',
    help: 'Total cache misses',
    labelNames: ['cache_level', 'key_type'],
    registers: [register],
  }),

  evictions: new client.Counter({
    name: 'cache_evictions_total',
    help: 'Total cache evictions',
    labelNames: ['cache_level'],
    registers: [register],
  }),
};

// WebSocket metrics
export const websocketMetrics = {
  connections: new client.Gauge({
    name: 'websocket_connections_active',
    help: 'Active WebSocket connections',
    registers: [register],
  }),

  messages: new client.Counter({
    name: 'websocket_messages_total',
    help: 'Total WebSocket messages',
    labelNames: ['event', 'direction'],
    registers: [register],
  }),

  errors: new client.Counter({
    name: 'websocket_errors_total',
    help: 'Total WebSocket errors',
    labelNames: ['type'],
    registers: [register],
  }),
};

// ============================================
// Structured Logging
// ============================================

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'video-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

// ============================================
// Helper Functions
// ============================================

export function trackApiRequest(
  method: string,
  endpoint: string,
  status: number,
  duration: number
): void {
  apiMetrics.requestsTotal.inc({ method, endpoint, status: status.toString() });
  apiMetrics.requestDuration.observe({ method, endpoint, status: status.toString() }, duration / 1000);
}

export function trackJobProcessing(
  model: string,
  quality: string,
  status: 'success' | 'failed',
  duration: number,
  plan: string
): void {
  queueMetrics.jobsTotal.inc({ status, model, plan });
  queueMetrics.processingTime.observe({ model, quality, status }, duration);
}

export function trackCacheHit(level: 'memory' | 'redis', keyType: string): void {
  cacheMetrics.hits.inc({ cache_level: level, key_type: keyType });
}

export function trackCacheMiss(level: 'memory' | 'redis', keyType: string): void {
  cacheMetrics.misses.inc({ cache_level: level, key_type: keyType });
}

export function trackGeneration(plan: string, model: string, duration: number, credits: number): void {
  const durationBucket = duration <= 5 ? 'short' : duration <= 10 ? 'medium' : 'long';
  businessMetrics.generationsTotal.inc({ plan, model, duration_bucket: durationBucket });
  businessMetrics.creditsConsumed.inc({ plan, model }, credits);
}

// ============================================
// Metrics Endpoint
// ============================================

export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

export { register };
