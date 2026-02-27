/**
 * WebSocket Hook for Client-side Real-time Updates
 * React hook for subscribing to video generation progress
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { VideoProgress, VideoProgressStage } from '../types/video';

// Event data types
interface JobQueuedData { generationId: string; position: number; }
interface JobStartedData { generationId: string; workerId: string; }
interface JobProgressData { generationId: string; percent: number; stage: string; message: string; }
interface JobCompletedData { generationId: string; videoUrl: string; }
interface JobFailedData { generationId: string; error: string; retryIn?: number; }
interface JobCancelledData { generationId: string; }

interface UseVideoWebSocketOptions {
  generationId?: string;
  onProgress?: (progress: VideoProgress) => void;
  onCompleted?: (videoUrl: string) => void;
  onFailed?: (error: string) => void;
  autoConnect?: boolean;
}

interface VideoWebSocketState {
  isConnected: boolean;
  progress: VideoProgress | null;
  error: string | null;
}

export function useVideoWebSocket(options: UseVideoWebSocketOptions = {}) {
  const {
    generationId,
    onProgress,
    onCompleted,
    onFailed,
    autoConnect = true,
  } = options;

  const [state, setState] = useState<VideoWebSocketState>({
    isConnected: false,
    progress: null,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    const socket = io({
      path: '/api/socket',
      auth: {
        userId: getUserId(),
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error);
      setState(prev => ({ ...prev, error: error.message }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect]);

  // Subscribe to generation updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !generationId || !state.isConnected) return;

    socket.emit('subscribe', { generationId });

    // Listen for events
    socket.on('job:queued', (data: JobQueuedData) => {
      setState(prev => ({
        ...prev,
        progress: {
          generationId: data.generationId,
          status: 'queued',
          progress: 0,
          stage: 'queued',
          message: `Position dans la file: ${data.position}`,
        },
      }));
    });

    socket.on('job:started', (data: JobStartedData) => {
      setState(prev => ({
        ...prev,
        progress: {
          generationId: data.generationId,
          status: 'processing',
          progress: 5,
          stage: 'processing',
          message: 'Génération démarrée',
        },
      }));
    });

    socket.on('job:progress', (data: JobProgressData) => {
      const progress: VideoProgress = {
        generationId: data.generationId,
        status: 'processing',
        progress: data.percent,
        stage: data.stage as VideoProgressStage,
        message: data.message,
      };

      setState(prev => ({ ...prev, progress }));
      onProgress?.(progress);
    });

    socket.on('job:completed', (data: JobCompletedData) => {
      setState(prev => ({
        ...prev,
        progress: {
          generationId: data.generationId,
          status: 'completed',
          progress: 100,
          stage: 'completed',
          message: 'Génération terminée',
        },
      }));
      onCompleted?.(data.videoUrl);
    });

    socket.on('job:failed', (data: JobFailedData) => {
      setState(prev => ({
        ...prev,
        error: data.error,
        progress: {
          generationId: data.generationId,
          status: 'failed',
          progress: 0,
          stage: 'failed',
          message: data.error,
        },
      }));
      onFailed?.(data.error);
    });

    socket.on('job:cancelled', (data: JobCancelledData) => {
      setState(prev => ({
        ...prev,
        progress: {
          generationId: data.generationId,
          status: 'cancelled',
          progress: 0,
          stage: 'failed',
          message: 'Génération annulée',
        },
      }));
    });

    return () => {
      socket.emit('unsubscribe', { generationId });
      socket.off('job:queued');
      socket.off('job:started');
      socket.off('job:progress');
      socket.off('job:completed');
      socket.off('job:failed');
      socket.off('job:cancelled');
    };
  }, [generationId, state.isConnected, onProgress, onCompleted, onFailed]);

  // Cancel generation
  const cancelGeneration = useCallback((genId: string) => {
    const socket = socketRef.current;
    if (socket && state.isConnected) {
      socket.emit('cancel', { generationId: genId });
    }
  }, [state.isConnected]);

  // Subscribe to a different generation
  const subscribe = useCallback((genId: string) => {
    const socket = socketRef.current;
    if (socket && state.isConnected) {
      socket.emit('subscribe', { generationId: genId });
    }
  }, [state.isConnected]);

  // Unsubscribe
  const unsubscribe = useCallback((genId: string) => {
    const socket = socketRef.current;
    if (socket && state.isConnected) {
      socket.emit('unsubscribe', { generationId: genId });
    }
  }, [state.isConnected]);

  return {
    ...state,
    cancelGeneration,
    subscribe,
    unsubscribe,
    socket: socketRef.current,
  };
}

// Helper to get user ID from session
function getUserId(): string | null {
  // This would typically come from your auth context
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
}

export default useVideoWebSocket;
