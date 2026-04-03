/**
 * Qwen3-TTS — Text-to-Speech via Alibaba Cloud DashScope
 * ElevenLabs-quality, free, 49 voices, instant voice cloning
 * Endpoint: dashscope-intl.aliyuncs.com (Singapore, international)
 */

import { ProviderError } from '@/lib/provider-router';

const DASHSCOPE_TTS_URL =
  'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/tts/speech-synthesis';

// Voice mapping by language
export const QWEN_VOICES: Record<string, { voice: string; displayName: string }> = {
  fr: { voice: 'Cherry', displayName: 'Cherry (FR)' },
  en: { voice: 'Cherry', displayName: 'Cherry (EN)' },
  de: { voice: 'Cherry', displayName: 'Cherry (DE)' },
  es: { voice: 'Cherry', displayName: 'Cherry (ES)' },
  it: { voice: 'Cherry', displayName: 'Cherry (IT)' },
  pt: { voice: 'Cherry', displayName: 'Cherry (PT)' },
  zh: { voice: 'Chelsie', displayName: 'Chelsie (ZH)' },
};

export interface QwenTTSOptions {
  voice?: string;
  format?: 'wav' | 'mp3';
  sampleRate?: number;
}

/**
 * Generate speech audio from text using Qwen3-TTS
 * Returns audio buffer and estimated duration
 */
export async function generateQwenTTS(
  text: string,
  langCode: string = 'fr',
  options: QwenTTSOptions = {}
): Promise<{ audio: Buffer; duration: number }> {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
  if (!apiKey) {
    throw new ProviderError('qwen-tts', 'DASHSCOPE_API_KEY non configurée', 503);
  }

  if (!text || text.trim().length === 0) {
    throw new ProviderError('qwen-tts', 'Le texte ne peut pas être vide', 400);
  }

  const voiceProfile = QWEN_VOICES[langCode] || QWEN_VOICES['en'];
  const voice = options.voice || voiceProfile.voice;
  const format = options.format || 'wav';
  const sampleRate = options.sampleRate || 24000;

  const response = await fetch(DASHSCOPE_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen3-tts-flash',
      input: {
        text: text.trim(),
      },
      parameters: {
        voice,
        format,
        sample_rate: sampleRate,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ProviderError(
      'qwen-tts',
      `Qwen3-TTS: ${errorText.substring(0, 200)}`,
      response.status
    );
  }

  // Check content type — the response could be audio binary or JSON with a URL
  const contentType = response.headers.get('content-type') || '';

  let audioBuffer: Buffer;

  if (contentType.includes('audio/') || contentType.includes('application/octet-stream')) {
    // Direct audio binary response
    audioBuffer = Buffer.from(await response.arrayBuffer());
  } else {
    // JSON response — could contain base64 audio or a download URL
    const data = await response.json();

    if (data?.output?.audio) {
      // Base64-encoded audio
      audioBuffer = Buffer.from(data.output.audio, 'base64');
    } else if (data?.output?.audio_url) {
      // URL to download audio
      const audioRes = await fetch(data.output.audio_url);
      if (!audioRes.ok) {
        throw new ProviderError('qwen-tts', 'Impossible de télécharger l\'audio Qwen3-TTS', 500);
      }
      audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    } else {
      throw new ProviderError(
        'qwen-tts',
        `Réponse Qwen3-TTS inattendue: ${JSON.stringify(data).substring(0, 200)}`,
        500
      );
    }
  }

  // Estimate duration from text length
  const wordCount = text.split(/\s+/).length;
  const estimatedDuration = Math.ceil(wordCount / 2.5);

  return {
    audio: audioBuffer,
    duration: estimatedDuration,
  };
}
