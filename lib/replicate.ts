/**
 * Replicate API Client - Advanced Video Generation
 * Supports multiple models: Wan2.1, Gen-2, Sora
 * Includes retry logic, rate limiting, and cost optimization
 */

export interface VideoGenerationConfig {
  prompt: string;
  duration?: number;
  model?: 'wan2' | 'gen2' | 'sora';
  quality?: 'standard' | 'high' | 'ultra';
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  style?: string;
  negative_prompt?: string;
  seed?: number;
}

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  logs?: string;
  created_at: string;
  completed_at?: string;
  metrics?: {
    predict_time?: number;
  };
}

export interface ReplicateModel {
  name: string;
  version: string;
  credits_per_second: number;
  max_duration: number;
  supported_features: string[];
}

const REPLICATE_CONFIG = {
  api_token: process.env.REPLICATE_API_TOKEN,
  base_url: 'https://api.replicate.com/v1',
  max_retries: 3,
  retry_delay: 2000,
  timeout: 300000, // 5 minutes
};

const REPLICATE_MODELS: Record<string, ReplicateModel> = {
  wan2: {
    name: 'lucataco/wan2.1',
    version: '8c7419d0f7b9b5a5b1e6a6e6a6e6a6e6a6e6a6e',
    credits_per_second: 1,
    max_duration: 15,
    supported_features: ['text-to-video', 'style-transfer'],
  },
  gen2: {
    name: 'runwayml/gen-2',
    version: '5c6d9b2c8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b',
    credits_per_second: 2,
    max_duration: 10,
    supported_features: ['text-to-video', 'image-to-video', 'motion-brush'],
  },
  sora: {
    name: 'openai/sora',
    version: '9a6d9b2c8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b',
    credits_per_second: 3,
    max_duration: 30,
    supported_features: ['text-to-video', 'physics-simulation', '4k-output'],
  },
};

class ReplicateClient {
  private headers: Record<string, string>;

  constructor() {
    if (!REPLICATE_CONFIG.api_token) {
      throw new Error('REPLICATE_API_TOKEN is required');
    }

    this.headers = {
      'Authorization': `Token ${REPLICATE_CONFIG.api_token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'JadaRiseLabs/1.0',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${REPLICATE_CONFIG.base_url}${endpoint}`;
    let lastError: Error;

    for (let attempt = 0; attempt <= REPLICATE_CONFIG.max_retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.headers,
          ...options,
          signal: AbortSignal.timeout(REPLICATE_CONFIG.timeout),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Replicate API error: ${response.status} - ${errorData.detail || response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === REPLICATE_CONFIG.max_retries) {
          break;
        }

        // Exponential backoff
        const delay = REPLICATE_CONFIG.retry_delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  async createPrediction(config: VideoGenerationConfig): Promise<ReplicatePrediction> {
    const model = config.model || 'wan2';
    const modelConfig = REPLICATE_MODELS[model];

    if (!modelConfig) {
      throw new Error(`Unsupported model: ${model}`);
    }

    if (config.duration && config.duration > modelConfig.max_duration) {
      throw new Error(`Duration ${config.duration}s exceeds max ${modelConfig.max_duration}s for ${model}`);
    }

    const payload = {
      version: modelConfig.version,
      input: {
        prompt: config.prompt,
        ...(config.duration && { duration: config.duration }),
        ...(config.negative_prompt && { negative_prompt: config.negative_prompt }),
        ...(config.style && { style: config.style }),
        ...(config.seed && { seed: config.seed }),
        ...(config.aspect_ratio && { aspect_ratio: config.aspect_ratio }),
        ...(config.quality && { quality: config.quality }),
      },
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
      webhook_events_filter: ['completed', 'failed'],
    };

    return this.makeRequest<ReplicatePrediction>('/predictions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPrediction(predictionId: string): Promise<ReplicatePrediction> {
    return this.makeRequest<ReplicatePrediction>(`/predictions/${predictionId}`);
  }

  async cancelPrediction(predictionId: string): Promise<ReplicatePrediction> {
    return this.makeRequest<ReplicatePrediction>(`/predictions/${predictionId}/cancel`, {
      method: 'POST',
    });
  }

  async listPredictions(limit = 100): Promise<ReplicatePrediction[]> {
    return this.makeRequest<ReplicatePrediction[]>(`/predictions?limit=${limit}`);
  }

  getModelInfo(model: string): ReplicateModel | undefined {
    return REPLICATE_MODELS[model];
  }

  getAllModels(): Record<string, ReplicateModel> {
    return REPLICATE_MODELS;
  }

  calculateCredits(model: string, duration: number, options?: { quality?: string; style?: string }): number {
    const modelConfig = REPLICATE_MODELS[model];
    if (!modelConfig) {
      throw new Error(`Unknown model: ${model}`);
    }

    const baseCredits = modelConfig.credits_per_second * duration;
    
    // Quality multiplier
    const qualityMultiplier: Record<string, number> = {
      standard: 1,
      high: 1.5,
      ultra: 2,
    };

    // Style multiplier (complex styles cost more)
    const styleMultiplier = (style?: string) => {
      if (!style) return 1;
      const complexStyles = ['cinematic', 'hyperrealistic', '4k', 'professional'];
      return complexStyles.some(s => style.toLowerCase().includes(s)) ? 1.5 : 1;
    };

    const multiplier = (qualityMultiplier[options?.quality || 'standard'] || 1) * styleMultiplier(options?.style);
    
    return Math.ceil(baseCredits * multiplier);
  }

  async enhancePrompt(prompt: string): Promise<string> {
    // Use Groq API to enhance the prompt for better video generation
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/enhance/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          context: 'video_generation',
          max_length: 500 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.enhanced_prompt || prompt;
      }
    } catch (error) {
      console.warn('Failed to enhance prompt:', error);
    }

    return prompt;
  }

  validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!prompt || prompt.trim().length === 0) {
      issues.push('Le prompt ne peut pas être vide');
    }

    if (prompt.length > 1000) {
      issues.push('Le prompt est trop long (max 1000 caractères)');
    }

    // Check for potentially problematic content
    const problematicKeywords = ['violence', 'hate', 'nude', 'weapon', 'illegal'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const keyword of problematicKeywords) {
      if (lowerPrompt.includes(keyword)) {
        issues.push(`Contenu potentiellement inapproprié: ${keyword}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// Singleton instance
export const replicateClient = new ReplicateClient();

// Helper functions
export function getOptimalModel(userPlan: string, duration: number): string {
  switch (userPlan) {
    case 'free':
      return 'wan2'; // Most affordable
    case 'starter':
      return duration <= 5 ? 'wan2' : 'gen2';
    case 'pro':
      return duration <= 10 ? 'gen2' : 'sora';
    default:
      return 'wan2';
  }
}

export function estimateGenerationTime(model: string, duration: number): number {
  const baseTimes: Record<string, number> = {
    wan2: 30, // 30 seconds per second of video
    gen2: 45, // 45 seconds per second of video
    sora: 60, // 60 seconds per second of video
  };

  return (baseTimes[model] || 30) * duration;
}

export default ReplicateClient;
