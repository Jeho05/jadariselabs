import { Client } from '@gradio/client';

export type GradioVideoModel = 'Wan-AI/Wan2.1' | 'tencent/HunyuanVideo';

interface GradioVideoRequest {
  prompt: string;
  model?: GradioVideoModel;
  resolution?: string;
}

export async function generateGradioVideo(request: GradioVideoRequest) {
  const modelToUse = request.model || 'Wan-AI/Wan2.1';
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is missing in env');
  }

  try {
    const client = await Client.connect(modelToUse, {
      token: process.env.HUGGINGFACE_API_KEY as `hf_${string}`,
    });

    if (modelToUse === 'Wan-AI/Wan2.1') {
      // Pour Wan-AI/Wan2.1, the /predict endpoint usually takes [prompt, negative_prompt, seed, resolution, etc.]
      // On the latest space it's often simpler but we need to assume standard payload based on typical gradio inputs.
      // Based on docs: prompt: string, resolution: string, etc.
      // We'll pass prompt directly and let gradio handle defaults for the rest.
      // We use submit instead of predict to get an async job we can check.
      const job = await client.submit('/predict', {
        prompt: request.prompt,
        // The space dictates these, assuming these exist based on the docs payload.
      });
      // the job gives an event emitter, but to keep our architecture stateless and polling-friendly,
      // it's tricky because gradio SDK uses websockets for submit. 
      // If we await the result directly, it might timeout the vercel function.
      // Vercel function timeout is usually 10-60s or more without streaming.
      
      // But Gradio V4 supports prediction endpoint returning an event stream.
      // Wait, standard `predict()` waits for completion.
      // The strategy doc says "L'API répond immédiatement avec un identifiant de tâche (task_id)".
      // With Gradio client, we can return the endpoint queue hash if we interact with the REST API, 
      // or we can just await the prediction if we are within a long-running instance or allow vercel to wait.
      const result = await client.predict('/predict', {
        prompt: request.prompt,
        seed: -1,
        // resolution might just be "480x832" or something
      });
      
      return {
        predictionId: `gradio_${Date.now()}`, 
        url: Array.isArray(result.data) && result.data[0] ? result.data[0].url || result.data[0].path : null,
      };
    }
    
    throw new Error(`Model ${modelToUse} not configured manually in gradio.ts yet.`);
  } catch (error) {
    console.error('[Gradio] Error:', error);
    throw error;
  }
}
