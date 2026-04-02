/**
 * Audio Synthesis Client
 * Synthèse vocale via Fish Audio (prioritaire) ou Kokoro TTS (Hugging Face fallback)
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
    provider?: 'fish' | 'kokoro';
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

    const providers: Array<{ name: 'fish' | 'kokoro'; run: () => Promise<{ audio: Buffer; duration: number }> }> = [];

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

    // HuggingFace TTS fallback — tries multiple models in sequence
    if (hfApiKey) {
        providers.push({
            name: 'kokoro',
            run: async () => {
                // List of HF TTS models to try, in priority order
                const hfModels = [
                    'facebook/mms-tts-fra',
                    'espnet/kan-bayashi_ljspeech_vits',
                ];

                let lastError = '';

                for (const model of hfModels) {
                    let response: Response | undefined;
                    let retries = 0;
                    const maxRetries = 2;

                    while (retries < maxRetries) {
                        try {
                            response = await fetch(
                                `https://router.huggingface.co/hf-inference/models/${model}`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${hfApiKey}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        inputs: text,
                                    }),
                                }
                            );

                            if (response.ok) {
                                console.log(`[Audio HF] Succès avec le modèle: ${model}`);
                                return {
                                    audio: Buffer.from(await response.arrayBuffer()),
                                    duration: estimateDuration(text),
                                };
                            }

                            const errorText = await response.text();
                            lastError = errorText;

                            if (response.status === 503) {
                                retries++;
                                if (retries < maxRetries) {
                                    console.log(`[Audio HF] Modèle ${model} en chargement (503). Attente 10s... (Essai ${retries}/${maxRetries})`);
                                    await new Promise(resolve => setTimeout(resolve, 10000));
                                    continue;
                                }
                                // Model is loading too long, try next model
                                console.log(`[Audio HF] Modèle ${model} indisponible, tentative du suivant...`);
                                break;
                            }

                            if (response.status === 404 || response.status === 422) {
                                console.log(`[Audio HF] Modèle ${model} non trouvé (${response.status}), tentative du suivant...`);
                                break; // Try next model
                            }

                            if (response.status === 429) {
                                throw new ProviderError('kokoro', 'Trop de requêtes audio. Veuillez patienter.', response.status);
                            }

                            // Other error, try next model
                            console.log(`[Audio HF] Erreur ${response.status} avec ${model}: ${errorText.substring(0, 100)}`);
                            break;
                        } catch (err) {
                            if (err instanceof ProviderError) throw err;
                            lastError = String(err);
                            break;
                        }
                    }
                }

                throw new ProviderError('kokoro', `Aucun modèle audio HuggingFace disponible actuellement. Réessayez plus tard. (${lastError.substring(0, 150)})`, 503);
            },
        });
    }

    const providerResult = await runProviderChain<{ audio: Buffer; duration: number }>(providers, { purpose: 'audio' });

    return {
        audio: providerResult.result.audio,
        voice,
        duration: providerResult.result.duration,
        provider: providerResult.provider as 'fish' | 'kokoro',
        router: {
            provider: providerResult.provider,
            attempts: providerResult.attempts,
            duration_ms: providerResult.latency_ms,
        },
    };
}

export function calculateAudioCredits(voice: BarkVoice, textLength: number): number {
    const baseCredits = BARK_VOICES[voice].credits;
    const lengthBonus = Math.floor(textLength / 200);
    return baseCredits + lengthBonus;
}
