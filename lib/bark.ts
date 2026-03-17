/**
 * Audio Synthesis Client
 * Synthèse vocale via Fish Audio (prioritaire) ou Suno Bark (Hugging Face)
 */

import { runProviderChain, ProviderError } from '@/lib/provider-router';

export type BarkVoice = 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'zh';

export interface AudioGenerationOptions {
    voice?: BarkVoice;
    temperature?: number;
}

export interface AudioGenerationResult {
    audio: Buffer;
    voice: BarkVoice;
    duration: number;
    provider?: 'fish' | 'bark';
    router?: { provider: string; attempts: unknown[]; duration_ms: number };
}

export const BARK_VOICES: Record<BarkVoice, {
    displayName: string;
    description: string;
    credits: number;
}> = {
    fr: { displayName: 'Français', description: 'Voix française naturelle', credits: 2 },
    en: { displayName: 'Anglais', description: 'Voix anglaise naturelle', credits: 2 },
    de: { displayName: 'Allemand', description: 'Voix allemande', credits: 2 },
    es: { displayName: 'Espagnol', description: 'Voix espagnole', credits: 2 },
    it: { displayName: 'Italien', description: 'Voix italienne', credits: 2 },
    pt: { displayName: 'Portugais', description: 'Voix portugaise', credits: 2 },
    zh: { displayName: 'Chinois', description: 'Voix chinoise', credits: 2 },
};

/**
 * Génère de l'audio à partir de texte
 */
export async function generateAudio(
    text: string,
    options: AudioGenerationOptions = {}
): Promise<AudioGenerationResult> {
    const voice = options.voice || 'fr';
    const fishApiKey = process.env.FISH_AUDIO_API_KEY;
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;

    if (!text || text.trim().length === 0) {
        throw new Error("Le texte ne peut pas être vide");
    }
    if (text.length > 500) {
        throw new Error("Le texte est trop long (max 500 caractères)");
    }

    if (!fishApiKey && !hfApiKey) {
        throw new Error(
            'Aucun fournisseur audio configuré. ' +
            'Ajoutez FISH_AUDIO_API_KEY (fish.audio, gratuit) ou HUGGINGFACE_API_KEY dans .env.local'
        );
    }

    const estimateDuration = (value: string) => {
        const wordCount = value.split(/\s+/).length;
        return Math.ceil(wordCount / 2.5);
    };

    const providers: Array<{ name: 'fish' | 'bark'; run: () => Promise<{ audio: Buffer; duration: number }> }> = [];

    // Fish Audio — prioritaire (plus fiable)
    if (fishApiKey) {
        providers.push({
            name: 'fish',
            run: async () => {
                const fishResponse = await fetch('https://api.fish.audio/v1/tts', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${fishApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text }),
                });

                if (!fishResponse.ok) {
                    const errorText = await fishResponse.text();
                    throw new ProviderError('fish', errorText.substring(0, 200), fishResponse.status);
                }

                return {
                    audio: Buffer.from(await fishResponse.arrayBuffer()),
                    duration: estimateDuration(text),
                };
            },
        });
    }

    // Bark via Hugging Face Inference API — fallback
    if (hfApiKey) {
        providers.push({
            name: 'bark',
            run: async () => {
                const languagePrompt = getLanguagePrompt(text, voice);

                let response: Response | undefined;
                let retries = 0;
                const maxRetries = 3;
                let lastError = '';

                while (retries < maxRetries) {
                    // Use the standard HF inference endpoint (not router which may 404)
                    response = await fetch(
                        'https://api-inference.huggingface.co/models/suno/bark',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${hfApiKey}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                inputs: languagePrompt,
                                parameters: {
                                    temperature: options.temperature || 0.7,
                                },
                            }),
                        }
                    );

                    if (response.ok) break;

                    const errorText = await response.text();
                    lastError = errorText;

                    if (response.status === 503) {
                        retries++;
                        if (retries < maxRetries) {
                            console.log(`[Bark] Modèle en chargement (503). Attente 15s... (Essai ${retries}/${maxRetries - 1})`);
                            await new Promise(resolve => setTimeout(resolve, 15000));
                            continue;
                        }
                        throw new ProviderError('bark', 'Le modèle audio met trop de temps à charger. Réessayez dans quelques minutes.', response.status);
                    }

                    if (response.status === 404) {
                        throw new ProviderError('bark', 'Le modèle Bark est temporairement indisponible sur HuggingFace.', response.status);
                    }

                    if (response.status === 429) {
                        throw new ProviderError('bark', 'Trop de requêtes audio. Veuillez patienter.', response.status);
                    }

                    throw new ProviderError('bark', `Erreur Bark: ${errorText.substring(0, 200)}`, response.status);
                }

                if (!response || !response.ok) {
                    throw new ProviderError('bark', `Erreur inattendue de l'API Audio: ${lastError.substring(0, 200)}`);
                }

                return {
                    audio: Buffer.from(await response.arrayBuffer()),
                    duration: estimateDuration(text),
                };
            },
        });
    }

    const providerResult = await runProviderChain<{ audio: Buffer; duration: number }>(providers, { purpose: 'audio' });

    return {
        audio: providerResult.result.audio,
        voice,
        duration: providerResult.result.duration,
        provider: providerResult.provider as 'fish' | 'bark',
        router: {
            provider: providerResult.provider,
            attempts: providerResult.attempts,
            duration_ms: providerResult.latency_ms,
        },
    };
}

function getLanguagePrompt(text: string, voice: BarkVoice): string {
    const prefixes: Record<BarkVoice, string> = {
        fr: '[fr]', en: '[en]', de: '[de]', es: '[es]', it: '[it]', pt: '[pt]', zh: '[zh]',
    };
    return `${prefixes[voice]} ${text}`;
}

export function calculateAudioCredits(voice: BarkVoice, textLength: number): number {
    const baseCredits = BARK_VOICES[voice].credits;
    const lengthBonus = Math.floor(textLength / 200);
    return baseCredits + lengthBonus;
}
