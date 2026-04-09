import { Client } from '@gradio/client';

export type GradioVideoModel = 'Wan-AI/Wan2.1' | 'tencent/HunyuanVideo';

interface GradioVideoRequest {
  prompt: string;
  model?: GradioVideoModel;
  resolution?: string;
}

const GRADIO_TIMEOUT_MS = 30000; // 30 seconds timeout

export async function generateGradioVideo(request: GradioVideoRequest) {
  const modelToUse = request.model || 'Wan-AI/Wan2.1';
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is missing in env');
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gradio timeout: la génération a pris trop de temps (30s). Veuillez réessayer.')), GRADIO_TIMEOUT_MS);
    });

    // Connect to Gradio space
    const connectPromise = Client.connect(modelToUse, {
      token: process.env.HUGGINGFACE_API_KEY as `hf_${string}`,
    });

    const client = await Promise.race([connectPromise, timeoutPromise]);

    if (modelToUse === 'Wan-AI/Wan2.1') {
      // Use predict with timeout
      const predictPromise = client.predict('/predict', {
        prompt: request.prompt,
        seed: -1,
      });

      const result = await Promise.race([predictPromise, timeoutPromise]);
      
      const videoUrl = Array.isArray(result.data) && result.data[0] 
        ? result.data[0].url || result.data[0].path 
        : null;

      if (!videoUrl) {
        throw new Error('Gradio n\'a pas retourné d\'URL vidéo valide');
      }

      return {
        predictionId: `gradio_${Date.now()}`, 
        url: videoUrl,
      };
    }
    
    throw new Error(`Model ${modelToUse} not configured manually in gradio.ts yet.`);
  } catch (error) {
    console.error('[Gradio] Error:', error);
    
    // Provide clearer error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Gradio timeout: le service est occupé. Réessayez avec un autre provider.');
      }
      if (error.message.includes('fetch')) {
        throw new Error('Gradio indisponible: erreur de connexion au service HuggingFace.');
      }
    }
    
    throw error;
  }
}
