/**
 * Image Enhancement Client
 * Upscaling et restauration d'images via Hugging Face
 */

export type EnhanceModel = 'real-esrgan' | 'gfpgan' | 'codeformer';

export interface EnhanceResult {
    image: Buffer;
    model: EnhanceModel;
    originalSize: { width: number; height: number };
    newSize: { width: number; height: number };
}

// Modèles disponibles pour l'amélioration
export const ENHANCE_MODELS: Record<EnhanceModel, {
    displayName: string;
    description: string;
    huggingfaceId: string;
    credits: number;
    type: 'upscale' | 'restore';
}> = {
    'real-esrgan': {
        displayName: 'Real-ESRGAN',
        description: 'Upscaling x4 — agrandissement haute qualité',
        huggingfaceId: 'ai-forever/Real-ESRGAN',
        credits: 2,
        type: 'upscale',
    },
    'gfpgan': {
        displayName: 'GFPGAN',
        description: 'Restauration de visages — amélioration portraits',
        huggingfaceId: 'xinntao/gfpgan',
        credits: 2,
        type: 'restore',
    },
    'codeformer': {
        displayName: 'CodeFormer',
        description: 'Restauration avancée — visages et détails',
        huggingfaceId: 'sczhou/codeformer',
        credits: 3,
        type: 'restore',
    },
};

/**
 * Upscale une image avec Real-ESRGAN (x4)
 */
export async function upscaleImage(imageBuffer: Buffer): Promise<EnhanceResult> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const response = await fetch(
        'https://router.huggingface.co/hf-inference/models/ai-forever/Real-ESRGAN',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: new Uint8Array(imageBuffer),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 503) {
            throw new Error('Le modèle est en cours de chargement. Réessayez dans quelques secondes.');
        }
        if (response.status === 429) {
            throw new Error('Trop de requêtes. Veuillez patienter.');
        }

        throw new Error(`Erreur upscaling: ${errorText.substring(0, 200)}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    return {
        image: resultBuffer,
        model: 'real-esrgan',
        originalSize: { width: 0, height: 0 }, // Non disponible avant traitement
        newSize: { width: 0, height: 0 }, // Sera calculé après
    };
}

/**
 * Restaure un visage avec GFPGAN
 */
export async function restoreFace(imageBuffer: Buffer, model: 'gfpgan' | 'codeformer' = 'gfpgan'): Promise<EnhanceResult> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const modelConfig = ENHANCE_MODELS[model];

    const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${modelConfig.huggingfaceId}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: new Uint8Array(imageBuffer),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 503) {
            throw new Error('Le modèle est en cours de chargement. Réessayez dans quelques secondes.');
        }
        if (response.status === 429) {
            throw new Error('Trop de requêtes. Veuillez patienter.');
        }

        throw new Error(`Erreur restauration: ${errorText.substring(0, 200)}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    return {
        image: resultBuffer,
        model,
        originalSize: { width: 0, height: 0 },
        newSize: { width: 0, height: 0 },
    };
}

/**
 * Calcule les crédits nécessaires pour une amélioration
 */
export function calculateEnhanceCredits(model: EnhanceModel): number {
    return ENHANCE_MODELS[model].credits;
}
