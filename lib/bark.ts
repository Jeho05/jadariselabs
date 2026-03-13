/**
 * Bark Audio Synthesis Client
 * Synthèse vocale via Suno Bark (Hugging Face)
 * 
 * Bark est un modèle de synthèse vocale multilingue gratuit
 * Supporte le français, anglais, et d'autres langues
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
    duration: number; // en secondes (approximatif)
    provider?: 'fish' | 'bark';
    router?: { provider: string; attempts: unknown[]; duration_ms: number };
}

// Voix disponibles
export const BARK_VOICES: Record<BarkVoice, {
    displayName: string;
    description: string;
    credits: number;
}> = {
    fr: {
        displayName: 'Français',
        description: 'Voix française naturelle',
        credits: 2,
    },
    en: {
        displayName: 'Anglais',
        description: 'Voix anglaise naturelle',
        credits: 2,
    },
    de: {
        displayName: 'Allemand',
        description: 'Voix allemande',
        credits: 2,
    },
    es: {
        displayName: 'Espagnol',
        description: 'Voix espagnole',
        credits: 2,
    },
    it: {
        displayName: 'Italien',
        description: 'Voix italienne',
        credits: 2,
    },
    pt: {
        displayName: 'Portugais',
        description: 'Voix portugaise',
        credits: 2,
    },
    zh: {
        displayName: 'Chinois',
        description: 'Voix chinoise',
        credits: 2,
    },
};

/**
 * Génère de l'audio à partir de texte avec Bark
 */
export async function generateAudio(
    text: string,
    options: AudioGenerationOptions = {}
): Promise<AudioGenerationResult> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const voice = options.voice || 'fr';

    // Check for Fish Audio Key first
    const fishApiKey = process.env.FISH_AUDIO_API_KEY;

    if (!text || text.trim().length === 0) {
        throw new Error("Le texte ne peut pas être vide");
    }

    if (text.length > 500) {
        throw new Error("Le texte est trop long (max 500 caractères pour l'instant)");
    }

    if (!fishApiKey && !apiKey) {
        throw new Error('HUGGINGFACE_API_KEY and FISH_AUDIO_API_KEY are not configured');
    }

    const estimateDuration = (value: string) => {
        const wordCount = value.split(/\s+/).length;
        return Math.ceil(wordCount / 2.5);
    };

    const providers: Array<{ name: 'fish' | 'bark'; run: () => Promise<{ audio: Buffer; duration: number }> }> = [];

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
                    body: JSON.stringify({
                        text: text,
                        // Optionally map voice to specific Fish Audio model/reference if needed, default is ok
                    }),
                });

                if (!fishResponse.ok) {
                    const errorText = await fishResponse.text();
                    throw new ProviderError('fish', errorText.substring(0, 200), fishResponse.status);
                }

                const fishAudioBuffer = Buffer.from(await fishResponse.arrayBuffer());
                return {
                    audio: fishAudioBuffer,
                    duration: estimateDuration(text),
                };
            },
        });
    }

    if (apiKey) {
        providers.push({
            name: 'bark',
            run: async () => {
                const languagePrompt = getLanguagePrompt(text, voice);

                let response;
                let retries = 0;
                const maxRetries = 3;
                let lastError = '';

                while (retries < maxRetries) {
                    response = await fetch(
                        'https://router.huggingface.co/hf-inference/models/suno/bark',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${apiKey}`,
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

                    if (response.ok) {
                        break; // Success!
                    }

                    const errorText = await response.text();
                    lastError = errorText;

                    // Error 503 means the model is loading. We MUST wait and retry for free tier.
                    if (response.status === 503) {
                        retries++;
                        if (retries < maxRetries) {
                            console.log(`[Bark] Le modele charge (503). Attente de 15s... (Essai ${retries}/${maxRetries - 1})`);
                            await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
                            continue;
                        }
                        throw new ProviderError('bark', 'Le modele audio met trop de temps a charger. Veuillez reessayer dans quelques minutes.', response.status);
                    }

                    if (response.status === 429) {
                        throw new ProviderError('bark', 'Trop de requetes audio pour le moment. Veuillez patienter.', response.status);
                    }
                    if (response.status === 400) {
                        throw new ProviderError('bark', 'Texte invalide. Essayez avec un texte plus court.', response.status);
                    }

                    throw new ProviderError('bark', `Erreur Bark: ${errorText.substring(0, 200)}`, response.status);
                }

                if (!response || !response.ok) {
                    throw new ProviderError('bark', `Erreur inattendue de l'API Audio: ${lastError.substring(0, 200)}`);
                }

                // La reponse est un fichier audio (WAV ou MP3)
                const audioBuffer = Buffer.from(await response.arrayBuffer());

                return {
                    audio: audioBuffer,
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

/**
 * Construit le prompt avec le préfixe de langue
 */
function getLanguagePrompt(text: string, voice: BarkVoice): string {
    // Bark utilise des préfixes spéciaux pour les langues
    const prefixes: Record<BarkVoice, string> = {
        fr: '[fr]',
        en: '[en]',
        de: '[de]',
        es: '[es]',
        it: '[it]',
        pt: '[pt]',
        zh: '[zh]',
    };

    return `${prefixes[voice]} ${text}`;
}

/**
 * Calcule les crédits nécessaires
 */
export function calculateAudioCredits(voice: BarkVoice, textLength: number): number {
    const baseCredits = BARK_VOICES[voice].credits;
    // Ajouter 1 crédit par tranche de 200 caractères
    const lengthBonus = Math.floor(textLength / 200);
    return baseCredits + lengthBonus;
}
