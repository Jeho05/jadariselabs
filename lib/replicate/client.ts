/**
 * Replicate Enterprise Client
 * Advanced client with caching, rate limiting, retry logic, and monitoring
 */

import NodeCache from 'node-cache';
import { redis } from '../queue/redis';
import type { 
  VideoGenerationConfig, 
  ReplicatePrediction,
  VideoModel,
  VideoQuality 
} from '../types/video';
import { VIDEO_MODELS } from '../types/video';

// Cache configuration
const memoryCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check for expired every 10 min
  maxKeys: 1000,
});

// Rate limiting configuration
interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

class ReplicateClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.replicate.com/v1';
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private timeout: number = 300000; // 5 minutes
  
  // Rate limiting
  private rateLimitStates: Map<string, RateLimitState> = new Map();
  private readonly rateLimitConfig = {
    maxTokens: 100,
    refillRate: 10, // tokens per second
  };

  constructor() {
    const key = process.env.REPLICATE_API_TOKEN;
    if (!key) {
      console.warn('[Replicate] API token not configured - using mock mode');
      this.apiKey = 'mock';
    } else {
      this.apiKey = key;
    }
  }

  /**
   * Create a video prediction with Replicate
   */
  async createPrediction(config: VideoGenerationConfig): Promise<ReplicatePrediction> {
    const traceId = this.generateTraceId();
    const startTime = Date.now();

    try {
      // 1. Validate configuration
      this.validateConfig(config);

      // 2. Check cache
      const cacheKey = this.getCacheKey(config);
      const cached = await this.getCachedResult(cacheKey);
      if (cached) {
        console.log(`[Replicate] Cache hit for prediction`);
        return cached;
      }

      // 3. Rate limiting
      await this.checkRateLimit('global');

      // 4. Get model version
      const modelInfo = VIDEO_MODELS[config.model || 'wan2'];

      // 5. Prepare request payload
      const payload = this.buildPayload(config, modelInfo);

      // 6. Make API request with retry
      const prediction = await this.retryRequest<ReplicatePrediction>(() =>
        this.makeRequest('/predictions', 'POST', payload)
      );

      // 7. Cache result
      await this.cacheResult(cacheKey, prediction);

      // 8. Log metrics
      const duration = Date.now() - startTime;
      console.log(`[Replicate] Prediction created in ${duration}ms (trace: ${traceId})`);

      return prediction;

    } catch (error) {
      console.error(`[Replicate] Prediction failed (trace: ${traceId}):`, error);
      throw this.handleError(error, traceId);
    }
  }

  /**
   * Get prediction status
   */
  async getPrediction(predictionId: string): Promise<ReplicatePrediction> {
    const traceId = this.generateTraceId();

    try {
      await this.checkRateLimit('global');

      const prediction = await this.retryRequest<ReplicatePrediction>(() =>
        this.makeRequest(`/predictions/${predictionId}`, 'GET')
      );

      return prediction;

    } catch (error) {
      console.error(`[Replicate] Get prediction failed (trace: ${traceId}):`, error);
      throw this.handleError(error, traceId);
    }
  }

  /**
   * Cancel a prediction
   */
  async cancelPrediction(predictionId: string): Promise<ReplicatePrediction> {
    const traceId = this.generateTraceId();

    try {
      const prediction = await this.retryRequest<ReplicatePrediction>(() =>
        this.makeRequest(`/predictions/${predictionId}/cancel`, 'POST')
      );

      console.log(`[Replicate] Prediction ${predictionId} cancelled`);
      return prediction;

    } catch (error) {
      console.error(`[Replicate] Cancel prediction failed (trace: ${traceId}):`, error);
      throw this.handleError(error, traceId);
    }
  }

  /**
   * Poll prediction until completion
   */
  async pollPrediction(
    predictionId: string,
    options: {
      timeout?: number;
      interval?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<ReplicatePrediction> {
    const timeout = options.timeout || this.timeout;
    const interval = options.interval || 3000; // 3 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const prediction = await this.getPrediction(predictionId);

      // Calculate progress
      const progress = this.calculateProgress(prediction);
      if (options.onProgress) {
        options.onProgress(progress);
      }

      if (prediction.status === 'succeeded') {
        return prediction;
      }

      if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Prediction failed');
      }

      if (prediction.status === 'canceled') {
        throw new Error('Prediction was cancelled');
      }

      // Wait before next poll
      await this.sleep(interval);
    }

    throw new Error(`Prediction polling timed out after ${timeout}ms`);
  }

  /**
   * Calculate credits for video generation
   */
  calculateCredits(
    model: VideoModel,
    duration: number,
    quality?: VideoQuality
  ): number {
    const modelInfo = VIDEO_MODELS[model];
    if (!modelInfo) {
      throw new Error(`Unknown model: ${model}`);
    }

    // Base credits
    const baseCredits = modelInfo.creditsPerSecond * duration;

    // Quality multiplier
    const qualityMultiplier = this.getQualityMultiplier(quality || 'standard');

    return Math.ceil(baseCredits * qualityMultiplier);
  }

  /**
   * Estimate generation time
   */
  estimateGenerationTime(model: VideoModel, duration: number): number {
    const modelInfo = VIDEO_MODELS[model];
    return modelInfo.avgGenerationTime * duration;
  }

  /**
   * Validate video generation config
   */
  validateConfig(config: VideoGenerationConfig): void {
    if (!config.prompt || config.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (config.prompt.length > 1000) {
      throw new Error('Prompt too long (max 1000 characters)');
    }

    const modelInfo = VIDEO_MODELS[config.model || 'wan2'];
    if (config.duration > modelInfo.maxDuration) {
      throw new Error(`Duration ${config.duration}s exceeds max ${modelInfo.maxDuration}s for ${config.model}`);
    }

    if (config.duration < 1 || config.duration > 60) {
      throw new Error('Duration must be between 1 and 60 seconds');
    }
  }

  // Private methods

  private buildPayload(config: VideoGenerationConfig, modelInfo: typeof VIDEO_MODELS[VideoModel]): object {
    return {
      version: modelInfo.version,
      input: {
        prompt: config.prompt.trim(),
        duration: config.duration,
        ...(config.negativePrompt && { negative_prompt: config.negativePrompt }),
        ...(config.seed && { seed: config.seed }),
        ...(config.aspectRatio && { aspect_ratio: config.aspectRatio }),
        ...(config.quality && { quality: config.quality }),
        ...(config.style && { style: config.style }),
      },
      webhook: config.webhook,
      webhook_events_filter: ['completed', 'failed'],
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'JadaRiseLabs/1.0',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Replicate API error: ${response.status} - ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  private async retryRequest<T>(request: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          console.log(`[Replicate] Retry ${attempt + 1}/${this.maxRetries} in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Don't retry on auth errors, bad requests, or not found
      return message.includes('401') || 
             message.includes('403') || 
             message.includes('400') || 
             message.includes('404');
    }
    return false;
  }

  private async checkRateLimit(key: string): Promise<void> {
    const now = Date.now();
    let state = this.rateLimitStates.get(key);

    if (!state) {
      state = {
        tokens: this.rateLimitConfig.maxTokens,
        lastRefill: now,
      };
      this.rateLimitStates.set(key, state);
    }

    // Refill tokens
    const elapsed = now - state.lastRefill;
    const refill = (elapsed / 1000) * this.rateLimitConfig.refillRate;
    state.tokens = Math.min(
      this.rateLimitConfig.maxTokens,
      state.tokens + refill
    );
    state.lastRefill = now;

    if (state.tokens < 1) {
      const waitTime = (1 - state.tokens) / this.rateLimitConfig.refillRate * 1000;
      console.log(`[Replicate] Rate limit hit, waiting ${waitTime}ms`);
      await this.sleep(waitTime);
    }

    state.tokens -= 1;
  }

  private getCacheKey(config: VideoGenerationConfig): string {
    const crypto = require('crypto');
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({
        prompt: config.prompt.trim().toLowerCase(),
        duration: config.duration,
        model: config.model,
        quality: config.quality,
        style: config.style,
      }))
      .digest('hex')
      .substring(0, 32);
    return `replicate:prediction:${hash}`;
  }

  private async getCachedResult(key: string): Promise<ReplicatePrediction | null> {
    // Check memory cache first
    const memoryResult = memoryCache.get<ReplicatePrediction>(key);
    if (memoryResult) {
      return memoryResult;
    }

    // Check Redis cache
    try {
      const redisResult = await redis.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult);
        memoryCache.set(key, parsed); // Populate memory cache
        return parsed;
      }
    } catch (error) {
      console.warn('[Replicate] Redis cache read failed:', error);
    }

    return null;
  }

  private async cacheResult(key: string, prediction: ReplicatePrediction): Promise<void> {
    // Cache in memory
    memoryCache.set(key, prediction);

    // Cache in Redis
    try {
      await redis.setex(key, 3600, JSON.stringify(prediction));
    } catch (error) {
      console.warn('[Replicate] Redis cache write failed:', error);
    }
  }

  private calculateProgress(prediction: ReplicatePrediction): number {
    switch (prediction.status) {
      case 'starting':
        return 10;
      case 'processing':
        return 50;
      case 'succeeded':
        return 100;
      case 'failed':
      case 'canceled':
        return 0;
      default:
        return 0;
    }
  }

  private getQualityMultiplier(quality: VideoQuality): number {
    const multipliers: Record<VideoQuality, number> = {
      standard: 1.0,
      high: 1.5,
      ultra: 2.0,
    };
    return multipliers[quality] || 1.0;
  }

  private handleError(error: unknown, traceId: string): Error {
    if (error instanceof Error) {
      return new Error(`[${traceId}] ${error.message}`);
    }
    return new Error(`[${traceId}] Unknown error`);
  }

  private generateTraceId(): string {
    return `rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const replicateClient = new ReplicateClient();
export default ReplicateClient;
