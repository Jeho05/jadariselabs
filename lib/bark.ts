/**
 * Bark Audio Synthesis Client
 * Synthèse vocale via Suno Bark (Hugging Face)
 * 
 * Bark est un modèle de synthèse vocale multilingue gratuit
 * Supporte le français, anglais, et d'autres langues
 */

export type BarkVoice = 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'zh';

export interface AudioGenerationOptions {
    voice?: BarkVoice;
    temperature?: number;
}

export interface AudioGenerationResult {
    audio: Buffer;
    voice: BarkVoice;
    duration: number; // en secondes (approximatif)
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
        throw new Error('Le texte ne peut pas être vide');
    }

    if (text.length > 500) {
        throw new Error('Le texte est trop long (max 500 caractères pour l\'instant)');
    }
    
    // Fish Audio API implementation
    if (fishApiKey) {
        try {
            const fishResponse = await fetch("https://api.fish.audio/v1/tts", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${fishApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text,
                    // Optionally map voice to specific Fish Audio model/reference if needed, default is ok
                })
            });
            
            if (fishResponse.ok) {
                const fishAudioBuffer = Buffer.from(await fishResponse.arrayBuffer());
                const wordCount = text.split(/\s+/).length;
                const estimatedDuration = Math.ceil(wordCount / 2.5);
                
                return {
                    audio: fishAudioBuffer,
                    voice,
                    duration: estimatedDuration,
                };
            } else {
                console.warn("[AudioAPI] Fish Audio failed, falling back to Hugging Face Bark", await fishResponse.text());
            }
        } catch (fishError) {
             console.warn("[AudioAPI] Fish Audio network error, falling back to Hugging Face Bark", fishError);
        }
    }

    // Fallback: Hugging Face Bark
    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY and FISH_AUDIO_API_KEY are not configured');
    }

    // Construire le prompt avec la langue
    // Bark utilise des préfixes pour les langues
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
                console.log(`[Bark] Le modèle charge (503). Attente de 15s... (Essai ${retries}/${maxRetries - 1})`);
                await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
                continue;
            }
            throw new Error('Le modèle audio met trop de temps à charger. Veuillez réessayer dans quelques minutes.');
        }

        if (response.status === 429) {
            throw new Error('Trop de requêtes audio pour le moment. Veuillez patienter.');
        }
        if (response.status === 400) {
            throw new Error('Texte invalide. Essayez avec un texte plus court.');
        }

        throw new Error(`Erreur Bark: ${errorText.substring(0, 200)}`);
    }

    if (!response || !response.ok) {
        throw new Error(`Erreur inattendue de l'API Audio: ${lastError.substring(0, 200)}`);
    }

    // La réponse est un fichier audio (WAV ou MP3)
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Estimer la durée (approximatif : ~150 mots/minute en synthèse)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount / 2.5); // ~2.5 mots/seconde

    return {
        audio: audioBuffer,
        voice,
        duration: estimatedDuration,
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
