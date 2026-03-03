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

    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    if (!text || text.trim().length === 0) {
        throw new Error('Le texte ne peut pas être vide');
    }

    if (text.length > 500) {
        throw new Error('Le texte est trop long (max 500 caractères pour Bark)');
    }

    // Construire le prompt avec la langue
    // Bark utilise des préfixes pour les langues
    const languagePrompt = getLanguagePrompt(text, voice);

    const response = await fetch(
        'https://api-inference.huggingface.co/models/suno/bark',
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

    if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 503) {
            throw new Error('Le modèle Bark est en cours de chargement. Réessayez dans quelques secondes.');
        }
        if (response.status === 429) {
            throw new Error('Trop de requêtes. Veuillez patienter.');
        }
        if (response.status === 400) {
            throw new Error('Texte invalide. Essayez avec un texte plus court.');
        }
        
        throw new Error(`Erreur Bark: ${errorText.substring(0, 200)}`);
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
