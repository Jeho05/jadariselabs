/**
 * Fal.ai Video Synthesis Client
 * GÃ©nÃ©ration de vidÃ©o via l'API Fal.ai (Wan 2.1)
 */

export interface FalPrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output?: string;
    error?: string;
}

/**
 * DÃ©marre une gÃ©nÃ©ration de vidÃ©o sur Fal.ai
 */
export async function generateFalVideo(
    prompt: string
): Promise<{ predictionId: string }> {
    const apiKey = process.env.FAL_KEY;

    if (!apiKey) {
        throw new Error('FAL_KEY is not configured');
    }

    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Le prompt ne peut pas Ãªtre vide');
    }

    // Endpoint for Fal.ai Queue
    const response = await fetch(`https://queue.fal.run/fal-ai/wan2.1`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: "16:9",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Fal.ai Video: ${errorText.substring(0, 200)}`);
    }

    const prediction = await response.json();
    return {
        predictionId: prediction.request_id,
    };
}

/**
 * GÃ©nÃ©ration d'image Premium via Fal.ai (FLUX)
 */
export async function generateFalImage(
    prompt: string,
    options: { width?: number; height?: number } = {}
): Promise<Buffer> {
    const apiKey = process.env.FAL_KEY;

    if (!apiKey) {
        throw new Error('FAL_KEY is not configured');
    }

    const response = await fetch(`https://fal.run/fal-ai/flux/dev`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            image_size: {
                width: options.width || 1024,
                height: options.height || 1024
            },
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true,
            sync_mode: true
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Fal.ai Image: ${errorText.substring(0, 200)}`);
    }

    const result = await response.json();
    
    if (result && result.images && result.images.length > 0) {
        const imageUrl = result.images[0].url;
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    
    throw new Error('Aucune image retournÃ©e par Fal.ai');
}

/**
 * VÃ©rifie le statut d'une requÃªte Fal.ai
 */
export async function checkFalPrediction(requestId: string): Promise<FalPrediction> {
    const apiKey = process.env.FAL_KEY;

    if (!apiKey) {
        throw new Error('FAL_KEY is not configured');
    }

    const response = await fetch(`https://queue.fal.run/fal-ai/wan2.1/requests/${requestId}/status`, {
        headers: {
            'Authorization': `Key ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur Fal Status: ${response.status}`);
    }

    const prediction = await response.json();
    
    // Map Fal.ai status to our internal status format (which matches Replicate for compatibility)
    let mappedStatus: FalPrediction['status'] = 'processing';
    if (prediction.status === 'IN_PROGRESS' || prediction.status === 'IN_QUEUE') {
        mappedStatus = 'processing';
    } else if (prediction.status === 'COMPLETED') {
        mappedStatus = 'succeeded';
    } else if (prediction.status === 'FAILED') {
        mappedStatus = 'failed';
    }

    // If completed, fetch the actual result
    let outputUrl = undefined;
    if (mappedStatus === 'succeeded') {
        const resultResponse = await fetch(`https://queue.fal.run/fal-ai/wan2.1/requests/${requestId}`, {
            headers: {
                'Authorization': `Key ${apiKey}`,
            },
        });
        const result = await resultResponse.json();
        // Fal.ai outputs are usually in an 'video' object or array
        if (result.video && result.video.url) {
            outputUrl = result.video.url;
        } else if (result.output && result.output.video) {
            outputUrl = result.output.video.url;
        } else if (Array.isArray(result) && result[0]?.url) {
            outputUrl = result[0].url;
        }
    }

    return {
        id: requestId,
        status: mappedStatus,
        output: outputUrl,
        error: prediction.error || undefined,
    };
}
