// ============================================
// JadaRiseLabs — Types TypeScript Partagés
// ============================================
// Convention : chaque dev ajoute ses types dans sa SECTION
// Pull avant d'ajouter, push immédiatement après

// ---- SECTION : Types communs ----

export type PlanType = 'free' | 'starter' | 'pro';

export type GenerationType = 'image' | 'chat' | 'video' | 'audio' | 'code';

export type PaymentProvider = 'orange_money' | 'wave' | 'mtn' | 'moov' | 'card';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export type SupportedLang = 'fr' | 'en';

// ---- SECTION : Modèles de données ----

export interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    preferred_lang: SupportedLang;
    plan: PlanType;
    credits: number;
    created_at: string;
    updated_at: string;
}

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

export interface Subscription {
    id: string;
    user_id: string;
    plan: Exclude<PlanType, 'free'>;
    status: SubscriptionStatus;
    start_date: string;
    end_date: string;
    payment_id: string | null;
    created_at: string;
}

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

// ---- SECTION : Plans & Crédits ----

export interface PlanDetails {
    name: PlanType;
    credits_per_month: number;
    image_hd: boolean;
    video: boolean;
    video_max_seconds: number;
    audio: boolean;
    watermark: boolean;
    price_cfa: number;
}

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

// ---- SECTION : Dev 1 — Auth, Dashboard, Chat, Vidéo, Crédits ----

export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    preferredLang: SupportedLang;
}

export interface PasswordStrength {
    label: string;
    score: number; // 0-4
    color: string;
    isValid: boolean;
}

// ---- SECTION : Dev 1 — Chat IA ----

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ChatConversation {
    id: string;
    user_id: string;
    title: string;
    messages: ChatMessage[];
    created_at: string;
    updated_at: string;
}

export interface ProfileUpdateData {
    username?: string;
    preferred_lang?: SupportedLang;
    avatar_url?: string;
}

// ---- SECTION : Dev 2 — Image, Galerie, Paiement ----
// (Ajouter ici les types spécifiques au Dev 2)
