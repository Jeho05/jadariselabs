/**
 * Hugging Face Video Synthesis Client
 * Génération de vidéo gratuite via l'API Inference
 */

export type HFVideoModel = 'text-to-video-ms' | 'animatediff-lightning';

export interface VideoGenerationOptions {
    model?: HFVideoModel;
    num_inference_steps?: number;
    guidance_scale?: number;
}

export interface VideoGenerationResult {
    video: Buffer;
    model: HFVideoModel;
}

// Modèles disponibles
const MODEL_IDS: Record<HFVideoModel, string> = {
    'text-to-video-ms': 'damo-vilab/text-to-video-ms-1.7b',
    'animatediff-lightning': 'ByteDance/AnimateDiff-Lightning',
};

export const HF_VIDEO_MODELS: Record<HFVideoModel, {
    displayName: string;
    description: string;
    credits: number;
}> = {
    'text-to-video-ms': {
        displayName: 'Text-to-Video MS',
        description: 'Génération de vidéos courtes et fluides (2-4s)',
        credits: 3,
    },
    'animatediff-lightning': {
        displayName: 'AnimateDiff Lightning',
        description: 'Vidéos artistiques et animations rapides',
        credits: 2,
    },
};

/**
 * Génère une vidéo à partir de texte avec Hugging Face
 */
export async function generateHFVideo(
    prompt: string,
    options: VideoGenerationOptions = {}
): Promise<VideoGenerationResult> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const model: HFVideoModel = options.model || 'text-to-video-ms';

    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Le prompt ne peut pas être vide');
    }

    const modelId = MODEL_IDS[model];

    let response;
    let retries = 0;
    const maxRetries = 3;
    let lastError = '';

    while (retries < maxRetries) {
        response = await fetch(
            `https://router.huggingface.co/hf-inference/models/${modelId}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: options.num_inference_steps || 25,
                        guidance_scale: options.guidance_scale || 7.5,
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
                console.log(`[HF-Video] Le modèle charge (503). Attente de 20s... (Essai ${retries}/${maxRetries - 1})`);
                await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
                continue;
            }
            throw new Error(`Le modèle vidéo ${HF_VIDEO_MODELS[model].displayName} met trop de temps à charger. Veuillez réessayer dans quelques minutes.`);
        }

        if (response.status === 429) {
            throw new Error('Trop de requêtes vidéo pour le moment. L\'API gratuite limite les usages intensifs. Veuillez patienter.');
        }
        if (response.status === 400) {
            throw new Error('Le prompt fourni n\'a pas pu être traité par le modèle vidéo.');
        }

        throw new Error(`Erreur HF Video: ${errorText.substring(0, 200)}`);
    }

    if (!response || !response.ok) {
        throw new Error(`Erreur inattendue de l'API Vidéo: ${lastError.substring(0, 200)}`);
    }

    // L'API HF Inference retourne directement le fichier vidéo binaire (par ex: mp4/gif)
    const videoBuffer = Buffer.from(await response.arrayBuffer());

    return {
        video: videoBuffer,
        model,
    };
}

/**
 * Calcule les crédits nécessaires
 */
export function calculateVideoCredits(model: HFVideoModel): number {
    return HF_VIDEO_MODELS[model].credits;
}
