/**
 * SiliconFlow (硅基流动) — Chat LLM Provider
 * OpenAI-compatible API with 137+ models, 20M free tokens
 * https://cloud.siliconflow.com
 */

import { ProviderError } from '@/lib/provider-router';

const SILICONFLOW_API_BASE = 'https://api.siliconflow.com/v1';

// Free models (no Pro/ prefix) — ordered by quality
export const SILICONFLOW_MODELS = {
  speed: 'Qwen/Qwen3-8B',
  reasoning: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  long: 'Qwen/Qwen2.5-7B-Instruct',
} as const;

export type SiliconFlowMode = keyof typeof SILICONFLOW_MODELS;

/**
 * Run an OpenAI-compatible chat completion via SiliconFlow
 * Returns a streaming Response for SSE consumption
 */
export async function runSiliconFlowChat({
  messages,
  mode = 'speed',
  stream = true,
}: {
  messages: Array<{ role: string; content: string }>;
  mode?: SiliconFlowMode;
  stream?: boolean;
}): Promise<Response> {
  const apiKey = process.env.SILICONFLOW_API_KEY?.trim();
  if (!apiKey) {
    throw new ProviderError('siliconflow', 'SILICONFLOW_API_KEY non configurée', 503);
  }

  const model = SILICONFLOW_MODELS[mode];

  const response = await fetch(`${SILICONFLOW_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ProviderError(
      'siliconflow',
      `SiliconFlow ${model}: ${errorText.substring(0, 200)}`,
      response.status
    );
  }

  return response;
}

/**
 * Generate an image via SiliconFlow's image generation API
 * Uses FLUX.1-schnell (free) or Stable Diffusion models
 */
export async function generateSiliconFlowImage(
  prompt: string,
  options: { width?: number; height?: number } = {}
): Promise<Buffer> {
  const apiKey = process.env.SILICONFLOW_API_KEY?.trim();
  if (!apiKey) {
    throw new ProviderError('siliconflow', 'SILICONFLOW_API_KEY non configurée', 503);
  }

  const width = options.width || 512;
  const height = options.height || 512;

  const response = await fetch(`${SILICONFLOW_API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'stabilityai/stable-diffusion-3-5-large',
      prompt,
      image_size: `${width}x${height}`,
      num_inference_steps: 20,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ProviderError(
      'siliconflow',
      `SiliconFlow Image: ${errorText.substring(0, 200)}`,
      response.status
    );
  }

  const data = await response.json();

  // SiliconFlow returns { images: [{ url: "..." }] } or { data: [{ url: "..." }] }
  const imageUrl = data?.images?.[0]?.url || data?.data?.[0]?.url;
  if (!imageUrl) {
    throw new ProviderError('siliconflow', 'Pas d\'URL d\'image dans la réponse SiliconFlow', 500);
  }

  // Download the image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new ProviderError('siliconflow', 'Impossible de télécharger l\'image SiliconFlow', 500);
  }

  return Buffer.from(await imgRes.arrayBuffer());
}
