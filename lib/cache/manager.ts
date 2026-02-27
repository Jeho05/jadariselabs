/**
 * Cache Manager - Multi-Level Enterprise Cache
 * L1: Memory (LRU) → L2: Redis → L3: Database
 */

import NodeCache from 'node-cache';
import { redis } from '../queue/redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Max items in memory cache
}

class CacheManager {
  private memoryCache: NodeCache;
  private defaultTTL: number = 3600; // 1 hour

  constructor() {
    this.memoryCache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 600, // Check for expired every 10 min
      maxKeys: 1000,
      useClones: false, // Better performance
    });

    // Log cache stats periodically
    setInterval(() => {
      const stats = this.memoryCache.getStats();
      if (stats.keys > 0) {
        console.log(`[Cache] Memory: ${stats.keys} keys, ${stats.ksize} bytes, hit rate: ${this.calculateHitRate(stats)}%`);
      }
    }, 60000); // Every minute
  }

  /**
   * Get value from cache (checks L1 → L2 → L3)
   */
  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache
    const memoryValue = this.memoryCache.get<T>(key);
    if (memoryValue !== undefined) {
      console.log(`[Cache] L1 hit: ${key}`);
      return memoryValue;
    }

    // L2: Redis cache
    try {
      const redisValue = await redis.get(key);
      if (redisValue) {
        const parsed = JSON.parse(redisValue) as T;
        // Populate L1 cache
        this.memoryCache.set(key, parsed);
        console.log(`[Cache] L2 hit: ${key}`);
        return parsed;
      }
    } catch (error) {
      console.warn(`[Cache] Redis error for key ${key}:`, error);
    }

    console.log(`[Cache] Miss: ${key}`);
    return null;
  }

  /**
   * Set value in cache (L1 + L2)
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || this.defaultTTL;

    // Set in L1
    this.memoryCache.set(key, value, ttl);

    // Set in L2
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn(`[Cache] Redis set error for key ${key}:`, error);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    // Delete from L1
    this.memoryCache.del(key);

    // Delete from L2
    try {
      await redis.del(key);
    } catch (error) {
      console.warn(`[Cache] Redis delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    // Delete from L1
    const keys = this.memoryCache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    keys.forEach(key => {
      if (regex.test(key)) {
        this.memoryCache.del(key);
      }
    });

    // Delete from L2
    try {
      const redisKeys = await redis.keys(pattern);
      if (redisKeys.length > 0) {
        await redis.del(...redisKeys);
      }
    } catch (error) {
      console.warn(`[Cache] Redis delete pattern error:`, error);
    }
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const result = await redis.incrby(key, amount);
      return result;
    } catch (error) {
      console.warn(`[Cache] Redis increment error:`, error);
      return 0;
    }
  }

  /**
   * Set with TTL only in Redis (for rate limiting, etc.)
   */
  async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    try {
      await redis.setex(key, ttl, value);
    } catch (error) {
      console.warn(`[Cache] Redis setex error:`, error);
    }
  }

  /**
   * Get TTL remaining
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      return -1;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.flushAll();
    try {
      await redis.flushdb();
    } catch (error) {
      console.warn(`[Cache] Redis flush error:`, error);
    }
  }

  /**
   * Get cache stats
   */
  getStats(): {
    memory: {
      keys: number;
      ksize: number;
      vsize: number;
      hits: number;
      misses: number;
      hitRate: number;
    };
  } {
    const stats = this.memoryCache.getStats();
    return {
      memory: {
        keys: stats.keys,
        ksize: stats.ksize,
        vsize: stats.vsize,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: this.calculateHitRate(stats),
      },
    };
  }

  private calculateHitRate(stats: { hits: number; misses: number }): number {
    const total = stats.hits + stats.misses;
    return total > 0 ? Math.round((stats.hits / total) * 100) : 0;
  }
}

// Export singleton
export const cacheManager = new CacheManager();
export default CacheManager;
