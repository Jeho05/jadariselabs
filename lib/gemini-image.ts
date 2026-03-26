/**
 * Google Gemini Image Generation Client
 * Génération d'images via Gemini 2.0 Flash (palier gratuit)
 * 
 * Quota gratuit : ~500 images/jour, 10 req/min
 * Résolution : 1024x1024
 */

export interface GeminiImageOptions {
    width?: number;
    height?: number;
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-exp';

/**
 * Génère une image via l'API Gemini (REST direct)
 * @returns Buffer de l'image générée (PNG)
 */
export async function generateGeminiImage(
    prompt: string,
    options: GeminiImageOptions = {}
): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured. Ajoutez-la dans .env.local');
    }

    const enhancedPrompt = `Generate a high-quality image: ${prompt}. The image should be detailed, well-composed, and visually stunning.`;

    const url = `${GEMINI_API_BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                parts: [
                    { text: enhancedPrompt }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
        },
    };

    let response: Response;
    let lastError = '';
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30000), // 30s timeout
            });
        } catch (err) {
            lastError = err instanceof Error ? err.message : 'Network error';
            if (attempt < maxRetries) {
                // Exponential backoff with jitter
                const delay = Math.min(2000 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw new Error(`Erreur Gemini Image (réseau): ${lastError}`);
        }

        if (response!.ok) {
            break;
        }

        const errorText = await response!.text();
        lastError = errorText;

        if (response!.status === 429) {
            // Rate limit — let the circuit breaker handle fallback
            throw new Error(`Limite de requêtes Gemini atteinte. ${errorText.substring(0, 100)}`);
        }

        if (response!.status === 400) {
            // Bad request — might be a safety filter
            let parsed;
            try { parsed = JSON.parse(errorText); } catch { /* ignore */ }
            const reason = parsed?.error?.message || errorText.substring(0, 200);
            throw new Error(`Gemini a refusé la requête: ${reason}`);
        }

        if (response!.status >= 500 && attempt < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
        }

        throw new Error(`Erreur Gemini Image (${response!.status}): ${errorText.substring(0, 200)}`);
    }

    if (!response! || !response!.ok) {
        throw new Error(`Erreur Gemini Image: ${lastError.substring(0, 200)}`);
    }

    const result = await response!.json();

    // Parse Gemini response to extract image data
    // Response structure: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
    const candidates = result?.candidates;
    if (!candidates || candidates.length === 0) {
        const blockReason = result?.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`Image bloquée par le filtre de sécurité Gemini: ${blockReason}`);
        }
        throw new Error('Aucune image retournée par Gemini');
    }

    const parts = candidates[0]?.content?.parts;
    if (!parts || parts.length === 0) {
        throw new Error('Réponse Gemini vide');
    }

    // Find the image part (inlineData with image mime type)
    for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
            
            // Resize if needed (Gemini may return non-standard sizes)
            const { width = 1024, height = 1024 } = options;
            if (width !== 1024 || height !== 1024) {
                try {
                    const sharp = (await import('sharp')).default;
                    return await sharp(imageBuffer)
                        .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .png()
                        .toBuffer();
                } catch {
                    // If sharp fails, return as-is
                    return imageBuffer;
                }
            }

            return imageBuffer;
        }
    }

    throw new Error('La réponse Gemini ne contient pas d\'image. Le modèle a peut-être retourné du texte uniquement.');
}
