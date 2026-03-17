/**
 * Pollinations.ai Image Generation API Client
 * Génération d'images gratuite et illimitée
 */

export interface PollinationsOptions {
    width?: number;
    height?: number;
    seed?: number;
    nologo?: boolean;
    model?: string;
}

/**
 * Génération d'image via Pollinations.ai (GET request)
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
        model = 'flux',
    } = options;

    const encodedPrompt = encodeURIComponent(prompt.trim());
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=${nologo}&model=${model}`;

    const maxAttempts = 3;
    let lastStatus = 0;
    let lastErrorText = '';

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let response: Response | undefined;
        try {
            response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(60000), // 60s timeout
            });
        } catch (err) {
            lastStatus = 0;
            lastErrorText = err instanceof Error ? err.message : 'Unknown network error';
            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
                continue;
            }
            throw new Error(`Erreur Pollinations.ai (réseau): ${lastErrorText.substring(0, 200)}`);
        }

        if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('image')) {
                // Pollinations sometimes returns HTML/JSON error wrapped in 200
                const text = await response.text();
                if (attempt < maxAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
                    continue;
                }
                throw new Error(`Pollinations.ai a retourné un contenu non-image: ${text.substring(0, 100)}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            let buffer: Buffer = Buffer.from(arrayBuffer);

            // Resize locally if needed
            if (width !== 1024 || height !== 1024) {
                try {
                    const sharp = (await import('sharp')).default;
                    buffer = await sharp(buffer)
                        .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .png()
                        .toBuffer();
                } catch {
                    // If sharp fails, return as-is
                }
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
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
        }

        throw new Error(`Erreur Pollinations.ai (${response.status}): ${lastErrorText.substring(0, 200)}`);
    }

    throw new Error(`Erreur Pollinations.ai (${lastStatus}): ${lastErrorText.substring(0, 200)}`);
}
