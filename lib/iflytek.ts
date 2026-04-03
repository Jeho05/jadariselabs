/**
 * iFlytek Spark (讯飞星火) — Chat LLM Provider
 * Unlimited free tokens, OpenAI-compatible endpoint
 * https://www.xfyun.cn
 */

import { ProviderError } from '@/lib/provider-router';

const IFLYTEK_API_BASE = 'https://spark-api-open.xf-yun.com/v1';

// Model tiers — generalv3.5 is the best free one
export const IFLYTEK_MODELS = {
  speed: 'generalv3.5',     // Spark Max
  reasoning: '4.0Ultra',     // Spark Ultra  
  long: 'generalv3.5',
} as const;

export type IFlytekMode = keyof typeof IFLYTEK_MODELS;

/**
 * Run an OpenAI-compatible chat completion via iFlytek Spark
 * Auth: Bearer <APIKey>:<APISecret>
 */
export async function runIFlytekChat({
  messages,
  mode = 'speed',
  stream = true,
}: {
  messages: Array<{ role: string; content: string }>;
  mode?: IFlytekMode;
  stream?: boolean;
}): Promise<Response> {
  const apiKey = process.env.IFLYTEK_API_KEY;
  const apiSecret = process.env.IFLYTEK_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new ProviderError('iflytek', 'IFLYTEK_API_KEY ou IFLYTEK_API_SECRET non configurée', 503);
  }

  const model = IFLYTEK_MODELS[mode];
  
  // iFlytek OpenAI-compatible endpoint uses APIKey:APISecret as the Bearer token
  const authToken = `${apiKey}:${apiSecret}`;

  const response = await fetch(`${IFLYTEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
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
      'iflytek',
      `iFlytek Spark ${model}: ${errorText.substring(0, 200)}`,
      response.status
    );
  }

  return response;
}
