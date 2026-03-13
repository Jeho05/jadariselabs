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

    const maxAttempts = 2;
    let lastStatus = 0;
    let lastErrorText = '';

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let response: Response | undefined;
        try {
            response = await fetch(url, { method: 'GET' });
        } catch (err) {
            lastStatus = 0;
            lastErrorText = err instanceof Error ? err.message : 'Unknown network error';
            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 600 * (attempt + 1)));
                continue;
            }
            throw new Error(`Erreur Pollinations.ai (network): ${lastErrorText.substring(0, 200)}`);
        }

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            let buffer: Buffer = Buffer.from(arrayBuffer);

            // Pollinations ignores size params (and they can cause 500s), so resize locally if needed.
            if (width !== 512 || height !== 512) {
                const sharp = (await import('sharp')).default;
                buffer = await sharp(buffer)
                    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .png()
                    .toBuffer();
            }

            return buffer;
        }

        lastStatus = response.status;
        try {
            lastErrorText = await response.text();
        } catch {
            lastErrorText = 'Unknown error';
        }

        if (response.status >= 500 && attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 600 * (attempt + 1)));
            continue;
        }

        throw new Error(`Erreur Pollinations.ai (${response.status}): ${lastErrorText.substring(0, 200)}`);
    }

    throw new Error(`Erreur Pollinations.ai (${lastStatus}): ${lastErrorText.substring(0, 200)}`);
}
