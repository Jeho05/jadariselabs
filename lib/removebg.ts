/**
 * Background Removal Client
 * Suppression d'arrière-plan via remove.bg API
 * 
 * Note: remove.bg offre 1 export HD gratuit/mois, illimité en basse résolution
 * Alternative gratuite : Hugging Face RMBG-1.4
 */

export interface RemoveBgResult {
    image: Buffer;
    credits: number;
    provider: 'removebg' | 'rmbg';
}

/**
 * Supprime l'arrière-plan avec remove.bg API
 * (Nécessite REMOVEBG_API_KEY)
 */
export async function removeBackgroundRemoveBg(imageBuffer: Buffer): Promise<RemoveBgResult> {
    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey) {
        // Fallback vers Hugging Face RMBG
        return removeBackgroundRMBG(imageBuffer);
    }

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': apiKey,
        },
        body: new Uint8Array(imageBuffer),
    });

    if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 402) {
            // Quota dépassé, fallback vers RMBG
            console.log('[RemoveBg] Quota dépassé, utilisation de RMBG');
            return removeBackgroundRMBG(imageBuffer);
        }
        
        throw new Error(`Erreur remove.bg: ${errorText.substring(0, 200)}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    return {
        image: resultBuffer,
        credits: 1, // 1 crédit pour remove.bg
        provider: 'removebg',
    };
}

/**
 * Supprime l'arrière-plan avec Hugging Face RMBG-1.4 (gratuit)
 * Alternative 100% gratuite à remove.bg
 */
export async function removeBackgroundRMBG(imageBuffer: Buffer): Promise<RemoveBgResult> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const response = await fetch(
        'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
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
        
        throw new Error(`Erreur RMBG: ${errorText.substring(0, 200)}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    return {
        image: resultBuffer,
        credits: 1, // 1 crédit pour RMBG
        provider: 'rmbg',
    };
}

/**
 * Supprime l'arrière-plan (meilleur provider disponible)
 */
export async function removeBackground(imageBuffer: Buffer): Promise<RemoveBgResult> {
    // Essayer remove.bg en premier (meilleure qualité), fallback vers RMBG
    if (process.env.REMOVEBG_API_KEY) {
        try {
            return await removeBackgroundRemoveBg(imageBuffer);
        } catch (error) {
            console.log('[RemoveBg] Erreur, fallback vers RMBG:', error);
        }
    }
    
    // Utiliser RMBG (gratuit via HuggingFace)
    return removeBackgroundRMBG(imageBuffer);
}

/**
 * Calcule les crédits nécessaires
 */
export function calculateRemoveBgCredits(): number {
    return 1;
}
