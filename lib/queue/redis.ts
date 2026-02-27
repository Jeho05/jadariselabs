/**
 * Redis Connection Manager - Enterprise Grade
 * Handles Redis connections with retry logic, health checks, and monitoring
 */

import Redis from 'ioredis';
import { QUEUE_CONFIG } from '../config/queue';

class RedisManager {
  private static instance: RedisManager;
  private client: Redis | null = null;
  private subscriber: Redis | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  private constructor() {}

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  getClient(): Redis {
    if (!this.client) {
      this.client = this.createClient();
    }
    return this.client;
  }

  getSubscriber(): Redis {
    if (!this.subscriber) {
      this.subscriber = this.createClient();
    }
    return this.subscriber;
  }

  private createClient(): Redis {
    const client = new Redis({
      host: QUEUE_CONFIG.redis.host,
      port: QUEUE_CONFIG.redis.port,
      password: QUEUE_CONFIG.redis.password,
      db: QUEUE_CONFIG.redis.db,
      maxRetriesPerRequest: QUEUE_CONFIG.redis.maxRetriesPerRequest,
      enableReadyCheck: QUEUE_CONFIG.redis.enableReadyCheck,
      enableOfflineQueue: QUEUE_CONFIG.redis.enableOfflineQueue,
      retryStrategy: (times: number) => {
        if (times > this.maxReconnectAttempts) {
          console.error('[Redis] Max reconnection attempts reached');
          return null;
        }
        this.reconnectAttempts = times;
        const delay = Math.min(times * 100, 3000);
        console.log(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
    });

    client.on('connect', () => {
      console.log('[Redis] Connecting...');
    });

    client.on('ready', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('[Redis] Connected and ready');
    });

    client.on('error', (error) => {
      console.error('[Redis] Error:', error.message);
    });

    client.on('close', () => {
      this.isConnected = false;
      console.log('[Redis] Connection closed');
    });

    client.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    return client;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      await this.getClient().ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }
    this.isConnected = false;
    console.log('[Redis] Disconnected');
  }

  isReady(): boolean {
    return this.isConnected && this.client?.status === 'ready';
  }
}

// Export singleton instance
export const redisManager = RedisManager.getInstance();
export const redis = redisManager.getClient();
export const redisSubscriber = redisManager.getSubscriber();

export default RedisManager;
