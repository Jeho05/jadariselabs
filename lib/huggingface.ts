/**
 * Hugging Face Inference API Client
 * GÃ©nÃ©ration d'images via FLUX.1-schnell et SDXL
 */

export type ImageModel = 'flux-schnell' | 'sdxl' | 'sd35-medium';

export interface ImageGenerationOptions {
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    negative_prompt?: string;
}

// ModÃ¨les disponibles
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
        description: 'Rapide et de bonne qualitÃ© â€” idÃ©al pour l\'exploration',
        maxResolution: 1024,
        defaultSteps: 4,
        creditsSD: 1,
        creditsHD: 2,
    },
    'sdxl': {
        displayName: 'Stable Diffusion XL',
        description: 'Haute qualitÃ© â€” dÃ©tails fins et rÃ©alisme',
        maxResolution: 1024,
        defaultSteps: 25,
        creditsSD: 2,
        creditsHD: 3,
    },
    'sd35-medium': {
        displayName: 'Stable Diffusion 3.5',
        description: 'Nouvelle gÃ©nÃ©ration â€” excellente adhÃ©rence au prompt',
        maxResolution: 1024,
        defaultSteps: 20,
        creditsSD: 2,
        creditsHD: 3,
        badge: 'NOUVEAU',
    },
};

/**
 * GÃ©nÃ©rer une image via l'API Hugging Face Inference
 * @returns Buffer de l'image gÃ©nÃ©rÃ©e (PNG)
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
        throw new Error(`ModÃ¨le inconnu: ${model}`);
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
            num_inference_steps: num_inference_steps || IMAGE_MODELS[model].defaultSteps,
            guidance_scale: guidance_scale || (model === 'flux-schnell' ? 3.5 : 7.5),
        },
    };

    // Universal high-quality negative prompt for free models (especially SDXL and SD3.5)
    // Flux Schnell doesn't actively use negative prompts, but it doesn't break the API.
    const defaultNegativePrompt = "blurry, poor quality, bad anatomy, bad proportions, deformed, lowres, ugly, out of focus, duplicate, mutated, extra limbs, poorly drawn face, poorly drawn hands, missing fingers";

    (body.parameters as Record<string, unknown>).negative_prompt = negative_prompt || defaultNegativePrompt;

    let response: Response | undefined;
    let lastError = '';
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        response = await fetch(
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

        if (response.ok) {
            break;
        }

        const errorText = await response.text();
        lastError = errorText;

        if (response.status === 503) {
            let parsed;
            try { parsed = JSON.parse(errorText); } catch { /* ignore */ }
            if (parsed?.error?.includes('loading')) {
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 15000));
                    continue;
                }
                throw new Error(`Le modele ${IMAGE_MODELS[model].displayName} met trop de temps a charger. Reessayez dans quelques minutes.`);
            }
            throw new Error('Le service est temporairement indisponible. Reessayez dans quelques instants.');
        }

        if (response.status === 429) {
            throw new Error('Trop de requetes. Veuillez patienter quelques secondes avant de reessayer.');
        }

        if (response.status === 401) {
            throw new Error('Cle API Hugging Face invalide ou expiree.');
        }

        throw new Error(`Erreur Hugging Face (${response.status}): ${errorText.substring(0, 200)}`);
    }

    if (!response || !response.ok) {
        throw new Error(`Erreur Hugging Face: ${lastError.substring(0, 200)}`);
    }

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



