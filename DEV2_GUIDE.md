# Guide Dev 2 — JadaRiseLabs

Ce guide contient toutes les informations nécessaires pour le développement des modules assignés au Dev 2.

---

## 1. Responsabilités Dev 2

### Modules à développer
- **Génération d'images** (`/studio/image`) — Priorité P1
- **Galerie personnelle** (`/gallery`) 
- **Génération vidéo** (`/studio/video`) — Priorité P2
- **Paiement CinetPay** (`/api/payment`)

### Planning (Cahier des Charges)

| Jour | Tâches Dev 2 |
|------|-------------|
| J1-J2 | Setup projet, comprendre architecture, installer shadcn/ui |
| J3-J4 | Galerie personnelle : UI + stockage Supabase Storage |
| J5-J7 | Studio Image : UI + API Hugging Face (FLUX/SDXL) |
| J8-J10 | Intégration watermark + téléchargement + partage social |
| J11-J14 | Studio Vidéo : UI + API Replicate (Wan 2.1) |
| J15-J18 | Paiement : intégration CinetPay SDK + webhooks |
| J19-J21 | Polish UI + tests + déploiement |

---

## 2. Stack Technique

| Technologie | Version | Usage |
|------------|---------|-------|
| Next.js | 14.2.0 | Frontend + API Routes |
| React | 18.2.0 | UI |
| Tailwind CSS | 3.4.0 | Styling |
| Supabase | - | Auth, DB, Storage |
| Hugging Face API | - | Génération images (FLUX, SDXL) |
| Replicate API | - | Génération vidéo (Wan 2.1) |
| CinetPay | - | Paiement Mobile Money |

---

## 3. Structure des Fichiers (votre domaine)

```
/app
  /studio/[module]/page.tsx    ← Page dynamique studio (image, video)
  /gallery/page.tsx            ← Galerie personnelle (existe, à compléter)
  /api
    /generate/image/route.ts   ← API génération images (existe, à implémenter)
    /generate/video/route.ts   ← API génération vidéo (existe, à implémenter)
    /payment/route.ts          ← Webhook CinetPay (existe, à implémenter)

/components                    ← Composants réutilisables (à créer)
  /ui/                         ← Composants shadcn/ui
  /image-generator.tsx         ← Composant génération image
  /video-generator.tsx         ← Composant génération vidéo
  /gallery-grid.tsx            ← Grille galerie
  /payment-form.tsx            ← Formulaire paiement

/lib
  /types.ts                    ← Types TypeScript (SECTION Dev 2)
  /huggingface.ts              ← Client HF (à créer)
  /replicate.ts                ← Client Replicate (à créer)
  /cinetpay.ts                 ← Client CinetPay (à créer)
```

---

## 4. Types TypeScript à utiliser

Les types sont définis dans `/lib/types.ts`. Voici ceux pertinents pour Dev 2 :

```typescript
// Types de génération
export type GenerationType = 'image' | 'chat' | 'video' | 'audio' | 'code';

// Interface Generation
export interface Generation {
    id: string;
    user_id: string;
    type: GenerationType;
    prompt: string;
    result_url: string | null;
    metadata: Record<string, unknown>;
    credits_used: number;
    created_at: string;
}

// Types de paiement
export type PaymentProvider = 'orange_money' | 'wave' | 'mtn' | 'moov' | 'card';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
    id: string;
    user_id: string;
    subscription_id: string | null;
    amount: number; // en centimes de F CFA
    provider: PaymentProvider;
    status: PaymentStatus;
    transaction_id: string | null;
    created_at: string;
}

// Plans et crédits
export const PLANS: Record<PlanType, PlanDetails> = {
    free: {
        name: 'free',
        credits_per_month: 50,
        image_hd: false,
        video: false,
        video_max_seconds: 0,
        audio: false,
        watermark: true,
        price_cfa: 0,
    },
    starter: {
        name: 'starter',
        credits_per_month: 200,
        image_hd: true,
        video: true,
        video_max_seconds: 5,
        audio: true,
        watermark: false,
        price_cfa: 500,
    },
    pro: {
        name: 'pro',
        credits_per_month: -1, // illimité
        image_hd: true,
        video: true,
        video_max_seconds: 15,
        audio: true,
        watermark: false,
        price_cfa: 1500,
    },
};
```

**Important** : Ajoutez vos types spécifiques dans la SECTION Dev 2 de `/lib/types.ts`.

---

## 5. API Hugging Face — Génération d'Images

### Endpoint
```
POST https://api-inference.huggingface.co/models/{model_id}
```

### Modèles recommandés
- `black-forest-labs/FLUX.1-schnell` — Rapide, bonne qualité
- `stabilityai/stable-diffusion-xl-base-1.0` — SDXL, haute qualité

### Exemple d'implémentation

```typescript
// lib/huggingface.ts
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function generateImage(prompt: string, model: string = 'black-forest-labs/FLUX.1-schnell') {
    const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: 20,
                    width: 512,
                    height: 512,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error('Image generation failed');
    }

    const blob = await response.blob();
    return blob; // À uploader vers Supabase Storage
}
```

### API Route `/api/generate/image/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/huggingface';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt, model } = await request.json();
        
        // 1. Vérifier auth
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Vérifier crédits
        const { data: profile } = await supabase
            .from('profiles')
            .select('credits, plan')
            .eq('id', user.id)
            .single();
        
        if (!profile || profile.credits < 1) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
        }

        // 3. Générer image
        const imageBlob = await generateImage(prompt, model);

        // 4. Upload vers Supabase Storage
        const fileName = `${user.id}/${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('generations')
            .upload(fileName, imageBlob, { contentType: 'image/png' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
            .storage
            .from('generations')
            .getPublicUrl(fileName);

        // 5. Déduire crédits
        await supabase
            .from('profiles')
            .update({ credits: profile.credits - 1 })
            .eq('id', user.id);

        // 6. Enregistrer génération
        await supabase
            .from('generations')
            .insert({
                user_id: user.id,
                type: 'image',
                prompt,
                result_url: publicUrl,
                metadata: { model },
                credits_used: 1,
            });

        return NextResponse.json({ 
            success: true, 
            image_url: publicUrl,
            credits_remaining: profile.credits - 1,
        });
    } catch (error) {
        return NextResponse.json({ 
            error: 'Generation failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
```

---

## 6. API Replicate — Génération Vidéo

### Endpoint
```
POST https://api.replicate.com/v1/predictions
```

### Modèle recommandé
- `wan2.1` — Texte vers vidéo courte (5-15s)

### Exemple d'implémentation

```typescript
// lib/replicate.ts
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function generateVideo(prompt: string, duration: number = 5) {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: 'wan2.1-model-version-id', // À vérifier
            input: {
                prompt,
                duration,
            },
        }),
    });

    const prediction = await response.json();
    
    // Polling pour attendre le résultat
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 2000));
        const pollResponse = await fetch(
            `https://api.replicate.com/v1/predictions/${result.id}`,
            { headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` } }
        );
        result = await pollResponse.json();
    }

    if (result.status === 'failed') {
        throw new Error('Video generation failed');
    }

    return result.output; // URL de la vidéo
}
```

---

## 7. CinetPay — Paiement Mobile Money

### Configuration
```typescript
// lib/cinetpay.ts
const CINETPAY_CONFIG = {
    api_key: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    secret_key: process.env.CINETPAY_SECRET_KEY,
    base_url: 'https://api-checkout.cinetpay.com/v2',
};

export interface PaymentRequest {
    transaction_id: string;
    amount: number; // En F CFA
    currency: string; // 'XOF'
    description: string;
    customer_name: string;
    customer_email: string;
    return_url: string;
    notify_url: string; // Webhook
}

export async function initiatePayment(payment: PaymentRequest) {
    const response = await fetch(`${CINETPAY_CONFIG.base_url}/payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            apikey: CINETPAY_CONFIG.api_key,
            site_id: CINETPAY_CONFIG.site_id,
            ...payment,
        }),
    });

    return response.json();
}

export function verifySignature(data: string, signature: string): boolean {
    // Vérifier la signature CinetPay avec secret_key
    const crypto = require('crypto');
    const expected = crypto
        .createHmac('sha256', CINETPAY_CONFIG.secret_key)
        .update(data)
        .digest('hex');
    return expected === signature;
}
```

### Webhook `/api/payment/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySignature } from '@/lib/cinetpay';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-signature') || '';
        
        // 1. Vérifier signature
        if (!verifySignature(body, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const data = JSON.parse(body);
        const { transaction_id, status, metadata } = data;

        // 2. Mettre à jour paiement
        const supabase = await createClient();
        await supabase
            .from('payments')
            .update({ status, transaction_id })
            .eq('id', metadata.payment_id);

        // 3. Si succès, activer subscription
        if (status === 'success') {
            await supabase
                .from('subscriptions')
                .update({ status: 'active' })
                .eq('payment_id', metadata.payment_id);

            // Mettre à jour plan utilisateur
            await supabase
                .from('profiles')
                .update({ 
                    plan: metadata.plan,
                    credits: metadata.plan === 'starter' ? 200 : -1,
                })
                .eq('id', metadata.user_id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
```

---

## 8. Supabase Storage — Stockage fichiers

### Configuration bucket
Créer un bucket `generations` dans Supabase Dashboard → Storage

### Policies RLS Storage
```sql
-- Users can upload their own files
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Upload exemple
```typescript
const { data, error } = await supabase
    .storage
    .from('generations')
    .upload(`${user.id}/${filename}`, file, {
        contentType: 'image/png',
        upsert: false,
    });
```

---

## 9. Watermark — Ajout automatique

Pour les utilisateurs gratuits, ajouter un watermark sur les images :

```typescript
import sharp from 'sharp'; // npm install sharp

export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
    const watermarkText = 'Created with JadaRiseLabs';
    
    const svgText = `
        <svg width="200" height="30">
            <text x="0" y="20" font-family="Arial" font-size="12" fill="rgba(255,255,255,0.7)">
                ${watermarkText}
            </text>
        </svg>
    `;
    
    const watermark = Buffer.from(svgText);
    
    return await sharp(imageBuffer)
        .composite([{
            input: watermark,
            gravity: 'southeast',
        }])
        .toBuffer();
}
```

---

## 10. Variables d'environnement requises

Ajouter dans `.env.local` et Vercel :

```bash
# Hugging Face
HUGGINGFACE_API_KEY=hf_xxxxx

# Replicate
REPLICATE_API_TOKEN=r8_xxxxx

# CinetPay
CINETPAY_API_KEY=xxxxx
CINETPAY_SITE_ID=xxxxx
CINETPAY_SECRET_KEY=xxxxx
```

---

## 11. Design System — Couleurs

Utiliser les variables CSS définies dans `globals.css` :

```css
--color-earth: #7B4F2E;       /* Primaire */
--color-gold: #C9A84C;        /* Secondaire */
--color-savanna: #2D6A4F;     /* Succès */
--color-terracotta: #E76F51;  /* Accent */
--color-cream: #FDF6E3;       /* Background */
```

### Classes Tailwind
```html
<button class="bg-earth text-white hover:bg-earth-dark">
<button class="bg-gold text-earth">
<div class="bg-cream">
```

---

## 12. Composants shadcn/ui à installer

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add skeleton
```

---

## 13. Tests — Checklist

### Studio Image
- [ ] Prompt vide → erreur claire
- [ ] Crédits insuffisants → message + CTA upgrade
- [ ] Image générée → affichage + téléchargement
- [ ] Plan gratuit → watermark visible
- [ ] Partage WhatsApp/Facebook fonctionne

### Galerie
- [ ] Affichage toutes générations utilisateur
- [ ] Filtres par type (image, vidéo, texte)
- [ ] Téléchargement HD pour premium
- [ ] Suppression individuelle

### Paiement
- [ ] Orange Money fonctionne (sandbox)
- [ ] Wave fonctionne (sandbox)
- [ ] Webhook met à jour DB
- [ ] Crédits ajoutés après paiement

---

## 14. Conflits Git — À éviter

### Fichiers partagés (coordonner avant modification)
- `/lib/types.ts` — Ajouter dans SECTION Dev 2
- `/components/ui/` — Ne pas modifier les composants existants
- `/app/layout.tsx` — Ne pas modifier

### Votre domaine exclusif
- `/app/studio/[module]/page.tsx`
- `/app/gallery/page.tsx`
- `/api/generate/image/`
- `/api/generate/video/`
- `/api/payment/`
- `/lib/huggingface.ts`
- `/lib/replicate.ts`
- `/lib/cinetpay.ts`

---

## 15. Ressources

- **Hugging Face Docs** : https://huggingface.co/docs/api-inference
- **Replicate Docs** : https://replicate.com/docs
- **CinetPay Docs** : https://cinetpay.com/developer
- **Supabase Storage** : https://supabase.com/docs/guides/storage
- **shadcn/ui** : https://ui.shadcn.com

---

## 16. Contact Dev 1

Pour toute question sur :
- Authentification Supabase → Dev 1
- Dashboard utilisateur → Dev 1
- Chat IA (Groq) → Dev 1
- Base de données / migrations → Dev 1

---

*Guide généré automatiquement depuis le Cahier des Charges JadaRiseLabs*
