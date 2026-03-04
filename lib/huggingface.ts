/**
 * Hugging Face Inference API Client
 * Génération d'images via FLUX.1-schnell et SDXL
 */

export type ImageModel = 'flux-schnell' | 'sdxl' | 'sd35-medium';

export interface ImageGenerationOptions {
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    negative_prompt?: string;
}

// Modèles disponibles
const MODEL_IDS: Record<ImageModel, string> = {
    'flux-schnell': 'black-forest-labs/FLUX.1-schnell',
    'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
    'sd35-medium': 'stabilityai/stable-diffusion-3.5-medium',
};

export const IMAGE_MODELS: Record<ImageModel, {
    displayName: string;
    description: string;
    maxResolution: number;
    defaultSteps: number;
    creditsSD: number;
    creditsHD: number;
    badge?: string;
}> = {
    'flux-schnell': {
        displayName: 'FLUX.1 Schnell',
        description: 'Rapide et de bonne qualité — idéal pour l\'exploration',
        maxResolution: 1024,
        defaultSteps: 4,
        creditsSD: 1,
        creditsHD: 2,
    },
    'sdxl': {
        displayName: 'Stable Diffusion XL',
        description: 'Haute qualité — détails fins et réalisme',
        maxResolution: 1024,
        defaultSteps: 25,
        creditsSD: 2,
        creditsHD: 3,
    },
    'sd35-medium': {
        displayName: 'Stable Diffusion 3.5',
        description: 'Nouvelle génération — excellente adhérence au prompt',
        maxResolution: 1024,
        defaultSteps: 20,
        creditsSD: 2,
        creditsHD: 3,
        badge: 'NOUVEAU',
    },
};

/**
 * Générer une image via l'API Hugging Face Inference
 * @returns Buffer de l'image générée (PNG)
 */
export async function generateImage(
    prompt: string,
    model: ImageModel = 'flux-schnell',
    options: ImageGenerationOptions = {}
): Promise<Buffer> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY is not configured. Ajoutez-la dans .env.local');
    }

    const modelId = MODEL_IDS[model];
    if (!modelId) {
        throw new Error(`Modèle inconnu: ${model}`);
    }

    const {
        width = 512,
        height = 512,
        num_inference_steps,
        guidance_scale,
        negative_prompt,
    } = options;

    // Build request body with better quality defaults if not provided
    const body: Record<string, unknown> = {
        inputs: prompt,
        parameters: {
            width: Math.min(width, IMAGE_MODELS[model].maxResolution),
            height: Math.min(height, IMAGE_MODELS[model].maxResolution),
            // Optmized defaults for free tier (balance between speed and quality before HF API timeout)
            num_inference_steps: num_inference_steps || (model === 'flux-schnell' ? 4 : 25),
            guidance_scale: guidance_scale || (model === 'flux-schnell' ? 3.5 : 7.5),
        },
    };

    // Universal high-quality negative prompt for free models (especially SDXL and SD3.5)
    // Flux Schnell doesn't actively use negative prompts, but it doesn't break the API.
    const defaultNegativePrompt = "blurry, poor quality, bad anatomy, bad proportions, deformed, lowres, ugly, out of focus, duplicate, mutated, extra limbs, poorly drawn face, poorly drawn hands, missing fingers";

    (body.parameters as Record<string, unknown>).negative_prompt = negative_prompt || defaultNegativePrompt;

    const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${modelId}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        // Handle common errors
        if (response.status === 503) {
            let parsed;
            try { parsed = JSON.parse(errorText); } catch { /* ignore */ }
            if (parsed?.error?.includes('loading')) {
                throw new Error(`Le modèle ${IMAGE_MODELS[model].displayName} est en cours de chargement. Réessayez dans quelques secondes.`);
            }
            throw new Error('Le service est temporairement indisponible. Réessayez dans quelques instants.');
        }

        if (response.status === 429) {
            throw new Error('Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer.');
        }

        if (response.status === 401) {
            throw new Error('Clé API Hugging Face invalide ou expirée.');
        }

        throw new Error(`Erreur Hugging Face (${response.status}): ${errorText.substring(0, 200)}`);
    }

    // Response is the raw image binary
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Calculate credits required for an image generation
 */
export function calculateImageCredits(model: ImageModel, isHD: boolean): number {
    const modelInfo = IMAGE_MODELS[model];
    return isHD ? modelInfo.creditsHD : modelInfo.creditsSD;
}
