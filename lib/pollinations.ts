/**
 * Pollinations.ai Image Generation API Client
 * GÃ©nÃ©ration d'images gratuite et illimitÃ©e
 */

export interface PollinationsOptions {
    width?: number;
    height?: number;
    seed?: number;
    nologo?: boolean;
    model?: string;
}

/**
 * GÃ©nÃ©ration d'image via Pollinations.ai (GET request)
 * @returns Buffer de l'image (JPEG)
 */
export async function generateImagePollinations(
    prompt: string,
    options: PollinationsOptions = {}
): Promise<Buffer> {
    const {
        width = 512,
        height = 512,
        seed = Math.floor(Math.random() * 1000000),
        nologo = true,
        model = 'flux', // Use FLUX by default
    } = options;

    const encodedPrompt = encodeURIComponent(prompt.trim());
    
    // Construct the URL
    // Format: https://image.pollinations.ai/prompt/{prompt}
    // Note: Query parameters like width/height/model currently cause 500 errors on Pollinations API
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
        let errorText = '';
        try {
            errorText = await response.text();
        } catch {
            errorText = 'Unknown error';
        }
        throw new Error(`Erreur Pollinations.ai (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
