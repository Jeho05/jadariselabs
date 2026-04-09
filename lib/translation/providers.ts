// ============================================
// JadaRiseLabs — Système de traduction locale
// Support: Français ↔ Fon ↔ Yoruba
// Approche hybride: Gemini → HuggingFace → Règles
// ============================================

export type SupportedLanguage = 'fr' | 'fon' | 'yoruba' | 'en';

export interface TranslationPair {
    from: SupportedLanguage;
    to: SupportedLanguage;
    label: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedAccuracy: number; // 0-100
}

// Paires de traduction supportées
export const TRANSLATION_PAIRS: TranslationPair[] = [
    // Français ↔ Fon
    { from: 'fr', to: 'fon', label: 'Français → Fon', difficulty: 'medium', estimatedAccuracy: 75 },
    { from: 'fon', to: 'fr', label: 'Fon → Français', difficulty: 'medium', estimatedAccuracy: 80 },
    
    // Français ↔ Yoruba
    { from: 'fr', to: 'yoruba', label: 'Français → Yoruba', difficulty: 'hard', estimatedAccuracy: 65 },
    { from: 'yoruba', to: 'fr', label: 'Yoruba → Français', difficulty: 'hard', estimatedAccuracy: 70 },
    
    // Fon ↔ Yoruba (via Français)
    { from: 'fon', to: 'yoruba', label: 'Fon → Yoruba', difficulty: 'hard', estimatedAccuracy: 50 },
    { from: 'yoruba', to: 'fon', label: 'Yoruba → Fon', difficulty: 'hard', estimatedAccuracy: 50 },
    
    // Français ↔ Anglais (pour référence)
    { from: 'fr', to: 'en', label: 'Français → Anglais', difficulty: 'easy', estimatedAccuracy: 95 },
    { from: 'en', to: 'fr', label: 'Anglais → Français', difficulty: 'easy', estimatedAccuracy: 95 },
];

// Configuration des langues
export const LANGUAGE_CONFIG: Record<SupportedLanguage, {
    name: string;
    nativeName: string;
    speakers: string;
    region: string;
    flag: string;
    hasGeminiSupport: boolean;
    phoneticAvailable: boolean;
}> = {
    fr: {
        name: 'Français',
        nativeName: 'Français',
        speakers: '300M+',
        region: 'Mondial',
        flag: '🇫🇷',
        hasGeminiSupport: true,
        phoneticAvailable: false,
    },
    fon: {
        name: 'Fon',
        nativeName: 'Fɔ̀ngbè',
        speakers: '2M+',
        region: 'Bénin, Togo, Nigeria',
        flag: '🇧🇯',
        hasGeminiSupport: false, // Gemini support limité
        phoneticAvailable: true,
    },
    yoruba: {
        name: 'Yoruba',
        nativeName: 'Yorùbá',
        speakers: '45M+',
        region: 'Nigeria, Bénin, Togo',
        flag: '🇳🇬',
        hasGeminiSupport: true, // Gemini a un support basique
        phoneticAvailable: true,
    },
    en: {
        name: 'Anglais',
        nativeName: 'English',
        speakers: '1.5B+',
        region: 'Mondial',
        flag: '🇬🇧',
        hasGeminiSupport: true,
        phoneticAvailable: false,
    },
};

// Dictionnaire de base Fon ↔ Français (mots courants)
export const FON_DICTIONARY: Record<string, string> = {
    // Salutations
    'bonjour': 'a kwaaba',
    'salut': 'a kwaaba',
    'au revoir': 'a bɔ́',
    'merci': 'a ná',
    's\'il vous plaît': 'bi bo nukun',
    'oui': 'wɛ́',
    'non': 'aɖé',
    
    // Famille
    'mère': 'nǔ',
    'père': 'tó',
    'enfant': 'ɔ́mɛ̀',
    'fils': 'ɔ́mɛ̀ lɛ́',
    'fille': 'ɔ́mɛ̀ bɛ́',
    'famille': 'hɔ́nɛ̀',
    
    // Quotidien
    'eau': 'tí',
    'nourriture': 'àkɔ̀n',
    'maison': 'àgbà',
    'travail': 'àzɔ̀n',
    'argent': 'wɔ̀mɛ̀',
    'marché': 'àhà',
    
    // Adjectifs
    'bon': 'ɛ́nɛ̀',
    'mauvais': 'bí',
    'grand': 'ɖì',
    'petit': 'wɛ̀',
    'beau': 'ɖé',
    'nouveau': 'yɔ́yɔ́',
    
    // Actions
    'manger': 'dù',
    'boire': 'mɛ̀',
    'aller': 'yì',
    'venir': 'wá',
    'faire': 'yí',
    'voir': 'kà',
};

// Dictionnaire Yoruba ↔ Français (mots courants)
export const YORUBA_DICTIONARY: Record<string, string> = {
    // Salutations
    'bonjour': 'báwo ni',
    'salut': 'ẹ ku àárọ̀ / ẹ ku ọ̀san',
    'au revoir': 'ó dàbọ̀',
    'merci': 'ẹ ṣé',
    's\'il vous plaît': 'ẹ jọ̀wọ̀',
    'oui': 'bẹ́ẹ̀ni',
    'non': 'rárá',
    
    // Famille
    'mère': 'ìyá',
    'père': 'bàbá',
    'enfant': 'ọmọ',
    'fils': 'ọmọkùnrin',
    'fille': 'ọmọbìnrin',
    'famille': 'ẹ́bí',
    
    // Quotidien
    'eau': 'omi',
    'nourriture': 'òúnjẹ',
    'maison': 'ilé',
    'travail': 'iṣẹ́',
    'argent': 'owo',
    'marché': 'ọjà',
    
    // Adjectifs
    'bon': 'rere',
    'mauvais': 'burúkú',
    'grand': 'tóbi',
    'petit': 'kékeré',
    'beau': 'lẹwa',
    'nouveau': 'titun',
    
    // Actions
    'manger': 'jẹun',
    'boire': 'mu',
    'aller': 'lọ',
    'venir': 'wá',
    'faire': 'ṣe',
    'voir': 'rí',
};

// Phonétique pour prononciation
export const FON_PHONETIC: Record<string, string> = {
    'a kwaaba': '[a kwa-aba] - Accroche les deux A',
    'a ná': '[a na] - Le a est ouvert',
    'wɛ́': '[wé] - Monte sur la fin',
    'aɖé': '[a-dé] - Dur sur le dé',
    'nǔ': '[nou] - U fermé',
    'tó': '[to] - O moyen',
    'tí': '[ti] - I court',
};

export const YORUBA_PHONETIC: Record<string, string> = {
    'ẹ ṣé': '[é shé] - E ouvert, CH comme church',
    'báwo ni': '[ba-wo ni] - Tons descendants',
    'ẹ jọ̀wọ̀': '[é jo-wo] - WO avec les lèvres arrondies',
    'ọmọ': '[o-mo] - O ouvert, mo bref',
    'ilé': '[i-lé] - LE monte',
    'omi': '[o-mi] - O puis I',
};

// Helper pour détecter la langue
export function detectLanguage(text: string): SupportedLanguage {
    const fonWords = ['a kwaaba', 'wɛ́', 'nǔ', 'tó', 'àgbà', 'ɔ́mɛ̀', 'ɖé', 'hɔ́nɛ̀'];
    const yorubaWords = ['ẹ', 'ọ', 'ṣé', 'gbọ́', 'ìyá', 'bàbá', 'ilé', 'omi', 'bẹ́ẹ̀ni'];
    
    const lowerText = text.toLowerCase();
    
    // Check for Fon markers
    if (fonWords.some(word => lowerText.includes(word.toLowerCase()))) {
        return 'fon';
    }
    
    // Check for Yoruba markers (tonal marks)
    if (/[ẹọ́ṣìí]/.test(text) || yorubaWords.some(word => lowerText.includes(word.toLowerCase()))) {
        return 'yoruba';
    }
    
    // Default to French if contains French words, else English
    const frenchWords = ['le', 'la', 'les', 'un', 'une', 'et', 'est', 'dans', 'pour'];
    const words = lowerText.split(/\s+/).slice(0, 20);
    const frenchCount = words.filter(w => frenchWords.includes(w)).length;
    
    return frenchCount > 2 ? 'fr' : 'en';
}

// Traduction simple basée sur dictionnaire
export function simpleTranslate(
    text: string, 
    from: SupportedLanguage, 
    to: SupportedLanguage
): { translation: string; method: 'dictionary' | 'fallback'; confidence: number } {
    const dictionary = from === 'fon' || to === 'fon' ? FON_DICTIONARY :
                      from === 'yoruba' || to === 'yoruba' ? YORUBA_DICTIONARY :
                      {};
    
    // Inverser si nécessaire
    const dict = from === 'fr' || from === 'en' ? dictionary :
                  Object.fromEntries(Object.entries(dictionary).map(([k, v]) => [v, k]));
    
    let translated = text.toLowerCase();
    let matchCount = 0;
    let totalWords = 0;
    
    const words = text.split(/(\s+|[.,!?;:])/);
    const result = words.map(word => {
        if (/^\s+$/.test(word) || /^[.,!?;:]$/.test(word)) return word;
        totalWords++;
        
        const cleanWord = word.toLowerCase().trim();
        if (dict[cleanWord]) {
            matchCount++;
            return dict[cleanWord];
        }
        return word;
    });
    
    const confidence = totalWords > 0 ? Math.round((matchCount / totalWords) * 100) : 0;
    
    return {
        translation: result.join(''),
        method: confidence > 50 ? 'dictionary' : 'fallback',
        confidence,
    };
}

// Obtenir la phonétique
export function getPhonetic(text: string, lang: SupportedLanguage): string | null {
    const phoneticDict = lang === 'fon' ? FON_PHONETIC : 
                        lang === 'yoruba' ? YORUBA_PHONETIC : 
                        null;
    
    if (!phoneticDict) return null;
    
    // Chercher les mots connus
    const words = text.split(/\s+/);
    const phonetics: string[] = [];
    
    for (const word of words) {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        if (phoneticDict[cleanWord]) {
            phonetics.push(phoneticDict[cleanWord]);
        }
    }
    
    return phonetics.length > 0 ? phonetics.join(' | ') : null;
}

// Calculer les crédits
export function calculateTranslationCredits(
    textLength: number, 
    includePhonetic: boolean,
    pair: TranslationPair
): number {
    const baseCredits = pair.difficulty === 'hard' ? 2 : 1;
    const lengthMultiplier = textLength > 500 ? 2 : 1;
    const phoneticCost = includePhonetic ? 1 : 0;
    
    return (baseCredits * lengthMultiplier) + phoneticCost;
}

// Prompt pour Gemini
export function buildTranslationPrompt(
    text: string,
    from: SupportedLanguage,
    to: SupportedLanguage,
    includePhonetic: boolean
): string {
    const fromName = LANGUAGE_CONFIG[from].nativeName;
    const toName = LANGUAGE_CONFIG[to].nativeName;
    
    let prompt = `Traduis ce texte du ${fromName} vers le ${toName}.

TEXTE À TRADUIRE:
${text}

INSTRUCTIONS:
- Traduction fidèle mais naturelle
- Conserve le sens et le ton original
- Adapte si nécessaire aux expressions locales
- Réponds UNIQUEMENT avec la traduction, pas d'explication`;

    if (includePhonetic && LANGUAGE_CONFIG[to].phoneticAvailable) {
        prompt += `\n\nAprès la traduction, ajoute:\n[PHONÉTIQUE] Guide de prononciation entre crochets`;
    }
    
    return prompt;
}

// Exporter les éléments clés pour API
export const TRANSLATION_CONSTANTS = {
    fonDictionary: FON_DICTIONARY,
    yorubaDictionary: YORUBA_DICTIONARY,
    fonPhonetic: FON_PHONETIC,
    yorubaPhonetic: YORUBA_PHONETIC,
};
