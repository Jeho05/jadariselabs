/**
 * WebSocket Server - Real-time Video Generation Progress
 * Uses Socket.io for bidirectional communication
 */

import { Server as HttpServer } from 'http';
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io';
import { redis, redisSubscriber } from '../queue/redis';

interface ServerToClientEvents {
  'job:queued': (data: { generationId: string; position: number }) => void;
  'job:started': (data: { generationId: string; workerId: string }) => void;
  'job:progress': (data: { generationId: string; percent: number; stage: string; message: string }) => void;
  'job:completed': (data: { generationId: string; videoUrl: string }) => void;
  'job:failed': (data: { generationId: string; error: string; retryIn?: number }) => void;
  'job:cancelled': (data: { generationId: string }) => void;
}

interface ClientToServerEvents {
  'subscribe': (data: { generationId: string }) => void;
  'unsubscribe': (data: { generationId: string }) => void;
  'cancel': (data: { generationId: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  subscriptions: Set<string>;
}

class WebSocketManager {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;
  private initialized: boolean = false;

  initialize(httpServer: HttpServer): void {
    if (this.initialized) {
      console.warn('[WebSocket] Already initialized');
      return;
    }

    this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
      httpServer,
      {
        path: '/api/socket',
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        // Redis adapter can be added later with @socket.io/redis-adapter
      }
    );

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupRedisSubscriptions();

    this.initialized = true;
    console.log('[WebSocket] Server initialized');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        // Extract user ID from handshake
        const userId = socket.handshake.auth.userId || socket.handshake.headers['x-user-id'];

        if (!userId) {
          return next(new Error('Authentication required'));
        }

        // Store user data in socket
        socket.data.userId = userId as string;
        socket.data.subscriptions = new Set();

        console.log(`[WebSocket] User connected: ${userId}`);
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Subscribe to generation updates
      socket.on('subscribe', async (data) => {
        try {
          const { generationId } = data;
          
          // Verify ownership
          const isOwner = await this.verifyOwnership(socket.data.userId, generationId);
          if (!isOwner) {
            socket.emit('job:failed', {
              generationId,
              error: 'Unauthorized access',
            });
            return;
          }

          // Join room for this generation
          socket.join(`generation:${generationId}`);
          socket.data.subscriptions.add(generationId);

          console.log(`[WebSocket] Client ${socket.id} subscribed to ${generationId}`);

          // Send current status if available
          const currentStatus = await this.getCurrentStatus(generationId);
          if (currentStatus) {
            socket.emit(`job:${currentStatus.status}` as any, currentStatus.data);
          }
        } catch (error) {
          console.error('[WebSocket] Subscribe error:', error);
        }
      });

      // Unsubscribe from generation updates
      socket.on('unsubscribe', (data) => {
        const { generationId } = data;
        socket.leave(`generation:${generationId}`);
        socket.data.subscriptions.delete(generationId);
        console.log(`[WebSocket] Client ${socket.id} unsubscribed from ${generationId}`);
      });

      // Cancel generation
      socket.on('cancel', async (data) => {
        try {
          const { generationId } = data;
          
          // Verify ownership
          const isOwner = await this.verifyOwnership(socket.data.userId, generationId);
          if (!isOwner) {
            return;
          }

          // Cancel via API
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate/video?generation_id=${generationId}`, {
            method: 'DELETE',
            headers: { 'X-User-Id': socket.data.userId },
          });

          socket.emit('job:cancelled', { generationId });
        } catch (error) {
          console.error('[WebSocket] Cancel error:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  private setupRedisSubscriptions(): void {
    // Subscribe to Redis channels for job updates
    // Note: Redis subscription is handled separately via redisSubscriber.on('message')
    redisSubscriber.subscribe('video:job:*').catch((err: Error) => {
      console.error('[WebSocket] Redis subscription error:', err.message);
    });

    // Handle incoming messages
    redisSubscriber.on('message', (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        const generationId = data.generationId;

        // Emit to all clients subscribed to this generation
        this.io?.to(`generation:${generationId}`).emit(data.event, data.payload);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[WebSocket] Redis message error:', errorMsg);
      }
    });
  }

  private async verifyOwnership(userId: string, generationId: string): Promise<boolean> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      
      const { data } = await supabase
        .from('generations')
        .select('user_id')
        .eq('id', generationId)
        .single();

      return data?.user_id === userId;
    } catch {
      return false;
    }
  }

  private async getCurrentStatus(generationId: string): Promise<{ status: string; data: any } | null> {
    try {
      const cachedStatus = await redis.get(`video:status:${generationId}`);
      if (cachedStatus) {
        return JSON.parse(cachedStatus);
      }
      return null;
    } catch {
      return null;
    }
  }

  // Public methods for emitting events from workers

  emitJobQueued(generationId: string, position: number): void {
    this.publishEvent(generationId, 'queued', { generationId, position });
  }

  emitJobStarted(generationId: string, workerId: string): void {
    this.publishEvent(generationId, 'started', { generationId, workerId });
  }

  emitJobProgress(generationId: string, percent: number, stage: string, message: string): void {
    this.publishEvent(generationId, 'progress', { generationId, percent, stage, message });
  }

  emitJobCompleted(generationId: string, videoUrl: string): void {
    this.publishEvent(generationId, 'completed', { generationId, videoUrl });
  }

  emitJobFailed(generationId: string, error: string, retryIn?: number): void {
    this.publishEvent(generationId, 'failed', { generationId, error, retryIn });
  }

  emitJobCancelled(generationId: string): void {
    this.publishEvent(generationId, 'cancelled', { generationId });
  }

  private async publishEvent(generationId: string, event: string, payload: any): Promise<void> {
    const message = JSON.stringify({
      generationId,
      event: `job:${event}`,
      payload,
    });

    // Publish to Redis for distributed systems
    await redis.publish(`video:job:${generationId}`, message);

    // Cache current status
    await redis.setex(
      `video:status:${generationId}`,
      3600, // 1 hour
      JSON.stringify({ status: event, data: payload })
    );

    // Emit directly if server is available
    this.io?.to(`generation:${generationId}`).emit(`job:${event}` as any, payload);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async close(): Promise<void> {
    if (this.io) {
      await this.io.close();
      this.io = null;
      this.initialized = false;
      console.log('[WebSocket] Server closed');
    }
  }
}

// Singleton instance
export const websocketManager = new WebSocketManager();

// For Next.js API route integration
export const config = {
  api: {
    bodyParser: false,
  },
};

export default WebSocketManager;
