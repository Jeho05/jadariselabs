// ============================================
// JadaRiseLabs — Templates de prompts pour Social Media
// Optimisés pour l'Afrique de l'Ouest
// ============================================

export type PlatformType = 'tiktok' | 'facebook' | 'whatsapp' | 'linkedin' | 'instagram';
export type ContentType = 'promo' | 'story' | 'tips' | 'engagement' | 'event';

export interface SocialTemplate {
    id: string;
    platform: PlatformType;
    contentType: ContentType;
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    maxLength: number;
    hashtagCount: number;
}

export const PLATFORM_CONFIG: Record<PlatformType, {
    name: string;
    maxChars: number;
    bestTimes: string[];
    hashtagStrategy: string;
}> = {
    tiktok: {
        name: 'TikTok',
        maxChars: 2200,
        bestTimes: ['12h', '19h', '21h'],
        hashtagStrategy: '3-5 hashtags dont 1 viral et 2 niche',
    },
    facebook: {
        name: 'Facebook',
        maxChars: 5000,
        bestTimes: ['9h', '13h', '15h'],
        hashtagStrategy: '2-3 hashtags maximum',
    },
    whatsapp: {
        name: 'WhatsApp Business',
        maxChars: 1000,
        bestTimes: ['9h', '12h', '17h'],
        hashtagStrategy: 'Pas de hashtags, utiliser des emojis',
    },
    linkedin: {
        name: 'LinkedIn',
        maxChars: 3000,
        bestTimes: ['8h', '12h', '17h'],
        hashtagStrategy: '3-5 hashtags professionnels',
    },
    instagram: {
        name: 'Instagram',
        maxChars: 2200,
        bestTimes: ['11h', '14h', '19h'],
        hashtagStrategy: '5-10 hashtags variés',
    },
};

export const SOCIAL_TEMPLATES: SocialTemplate[] = [
    // === TIKTOK ===
    {
        id: 'tiktok-script',
        platform: 'tiktok',
        contentType: 'promo',
        name: 'Script TikTok',
        description: 'Script vidéo court et accrocheur',
        maxLength: 300,
        hashtagCount: 4,
        systemPrompt: `Tu es un créateur de contenu TikTok expert pour le marché ouest-africain.
Tu maîtrises les tendances locales et sais ce qui devient viral au Bénin, Togo, Côte d'Ivoire.

RÈGLES TIKTOK:
- Hook immédiat (première phrase cruciale)
- Ton authentique, proche de la rue
- Rythme rapide, phrases courtes
- Appel à l'action clair (like, follow, commente)
- Intégrer des références culturelles locales si pertinent`,
        userPromptTemplate: `Écris un script TikTok pour: "{{topic}}"

TON: {{tone}}
CONTEXTE: {{context}}

STRUCTURE:
[HOOK 0-3s] Accroche qui retient immédiatement
[PROBLÈME] Pain point de l'audience
[SOLUTION] Comment {{topic}} résout ça
[PREUVE] Exemple concret ou témoignage
[CTA] Like + follow + commente

FORMAT: Texte à lire à voix haute avec indications [PAUSE] et [ZOOM]`
    },
    {
        id: 'tiktok-story',
        platform: 'tiktok',
        contentType: 'story',
        name: 'Storytime',
        description: 'Récit personnel engageant',
        maxLength: 400,
        hashtagCount: 4,
        systemPrompt: 'Tu racontes des histoires courtes captivantes pour TikTok. Style conversationnel, suspens, punchline à la fin.',
        userPromptTemplate: `Raconte une story TikTok sur: "{{topic}}"

CONSIGNE: {{context}}

STRUCTURE:
- Accroche mystérieuse
- Montée en puissance
- Twist ou révélation
- Leçon/moralité
- CTA engagement

Style: Comme si tu parles à un ami, avec du suspense`
    },

    // === FACEBOOK ===
    {
        id: 'fb-promo',
        platform: 'facebook',
        contentType: 'promo',
        name: 'Post promo',
        description: 'Publication commerciale engageante',
        maxLength: 300,
        hashtagCount: 3,
        systemPrompt: `Tu rédiges des posts Facebook qui performent en Afrique de l'Ouest.
Tu connais les codes: communauté avant vente, storytelling, preuve sociale.

RÈGLES FACEBOOK:
- Commencer par une question ou une émotion
- Développer avec du storytelling
- Insérer la proposition subtilement
- Appel à l'action conversationnel
- Répondre aux commentaires est crucial`,
        userPromptTemplate: `Rédige un post Facebook pour promouvoir: "{{topic}}"

OFFRE/PRODUIT: {{context}}
TON: {{tone}}

STRUCTURE:
Accroche personnelle ou question
Story/contexte (2-3 phrases)
Présentation de l'offre
Bénéfices (pas de features)
Preuve sociale ou urgence
CTA: Commentez ou DM

HORODATAGE: Inclure une référence temporelle ("Aujourd'hui", "Cette semaine")`
    },
    {
        id: 'fb-community',
        platform: 'facebook',
        contentType: 'engagement',
        name: 'Post communauté',
        description: 'Publication pour engager votre communauté',
        maxLength: 200,
        hashtagCount: 2,
        systemPrompt: 'Posts communautaires qui génèrent des discussions. Questions ouvertes, sondages, conseils partagés.',
        userPromptTemplate: `Crée un post communautaire Facebook sur: "{{topic}}"

OBJECTIF: {{context}}

FORMAT: Question ouverte qui invite au partage d'expériences
Style: bienveillant, curieux, valorisant
CTA: demander des avis ou conseils`
    },
    {
        id: 'fb-event',
        platform: 'facebook',
        contentType: 'event',
        name: 'Événement',
        description: 'Promotion d\'événement local',
        maxLength: 250,
        hashtagCount: 3,
        systemPrompt: 'Expert en promotion d\'événements sur Facebook. Créer l\'envie, l\'urgence, faciliter l\'inscription.',
        userPromptTemplate: `Rédige un post pour l'événement: "{{topic}}"

DÉTAILS: {{context}}

STRUCTURE:
Quoi + Quand + Où (dès le début)
Pourquoi c'est important/incontournable
Programme/Activités clés
Call-to-action inscription
Urgence si places limitées`
    },

    // === WHATSAPP BUSINESS ===
    {
        id: 'wa-catalog',
        platform: 'whatsapp',
        contentType: 'promo',
        name: 'Message catalogue',
        description: 'Présentation produit WhatsApp',
        maxLength: 150,
        hashtagCount: 0,
        systemPrompt: `Tu rédiges des messages WhatsApp Business professionnels mais chaleureux.
Contexte Afrique de l'Ouest: mobile-first, réponses rapides, emojis appropriés.

RÈGLES WHATSAPP:
- Message court et direct
- Ton professionnel mais amical
- Emojis pertinents (max 3-4)
- Question ouverte en fin
- Pas de hashtags sur WhatsApp`,
        userPromptTemplate: `Rédige un message WhatsApp Business pour: "{{topic}}"

PRODUIT/SERVICE: {{context}}

FORMAT:
Salutation courte
Présentation valeur (1 phrase)
Bénéfice clé
Prix ou offre si applicable
Question engageante
Signature optionnelle`
    },
    {
        id: 'wa-followup',
        platform: 'whatsapp',
        contentType: 'tips',
        name: 'Relance client',
        description: 'Message de suivi client',
        maxLength: 120,
        hashtagCount: 0,
        systemPrompt: 'Messages de relance professionnels et bienveillants. Pas de pression, juste du rappel.',
        userPromptTemplate: `Rédige une relance WhatsApp pour: "{{topic}}"

SITUATION: {{context}}

TON: Poli, pas pressant
STRUCTURE:
Rappel contexte
Question douce sur avancement
Proposition d'aide
Emojis professionnels`
    },

    // === LINKEDIN ===
    {
        id: 'li-professional',
        platform: 'linkedin',
        contentType: 'promo',
        name: 'Post professionnel',
        description: 'Publication B2B ou carrière',
        maxLength: 300,
        hashtagCount: 4,
        systemPrompt: `Expert LinkedIn pour le marché africain. Contenu professionnel mais accessible.
Storytelling personnel, insights métier, pas de jargon inutile.

RÈGLES LINKEDIN:
- Paragraphes très courts (1-2 phrases max)
- Espacement entre paragraphes
- Insight ou leçon partagée
- CTA qui génère des commentaires
- 3-4 hashtags ciblés en fin`,
        userPromptTemplate: `Rédige un post LinkedIn sur: "{{topic}}"

CONTEXTE: {{context}}
TON: {{tone}}

STRUCTURE:
Accroche personnelle ou observation
Expérience/leçon partagée
Insight actionnable
CTA engagement (question)
Hashtags professionnels`
    },
    {
        id: 'li-tips',
        platform: 'linkedin',
        contentType: 'tips',
        name: 'Conseils/Carrière',
        description: 'Tips professionnels',
        maxLength: 250,
        hashtagCount: 3,
        systemPrompt: 'Conseils carrière et business sous forme de listes ou frameworks actionnables.',
        userPromptTemplate: `Crée un post LinkedIn de conseils sur: "{{topic}}"

FORMAT: Liste numérotée ou étapes
STRUCTURE:
Problème commun
[3-5 conseils actionables]
Résultat attendu
CTA: partage ton expérience`
    },

    // === INSTAGRAM ===
    {
        id: 'ig-caption',
        platform: 'instagram',
        contentType: 'promo',
        name: 'Légende Instagram',
        description: 'Caption avec hashtags',
        maxLength: 400,
        hashtagCount: 8,
        systemPrompt: `Expert Instagram pour créateurs africains. Captions qui racontent une histoire.
Visual-first mais texte qui ajoute de la valeur.

RÈGLES INSTAGRAM:
- Première ligne accrocheuse (sinon tronquée)
- Corps: storytelling ou valeur
- CTA clair (lien en bio, commente, tag)
- Emojis stratégiques (pas trop)
- Hashtags variés en fin ou premier commentaire`,
        userPromptTemplate: `Rédige une légende Instagram pour: "{{topic}}"

VISUEL: {{context}}
TON: {{tone}}

STRUCTURE:
Hook première ligne
Story ou valeur ajoutée
CTA précis
Emojis pertinents
8 hashtags variés (mix populaires + niche)`
    },
    {
        id: 'ig-carousel',
        platform: 'instagram',
        contentType: 'tips',
        name: 'Carousel éducatif',
        description: 'Post multi-slides éducatif',
        maxLength: 200,
        hashtagCount: 6,
        systemPrompt: 'Carousels Instagram éducatifs: titres de slides percutants, contenu concis par slide.',
        userPromptTemplate: `Planifie un carousel Instagram sur: "{{topic}}"

FORMAT: 5-7 slides
STRUCTURE:
Slide 1: Titre accrocheur + hook
Slides 2-6: Points clés (1 idée par slide)
Slide 7: CTA + compte

LÉGENDE: Courte qui incite à swiper`
    },
];

// Helpers
export function getTemplatesByPlatform(platform: PlatformType): SocialTemplate[] {
    return SOCIAL_TEMPLATES.filter(t => t.platform === platform);
}

export function getTemplatesByType(contentType: ContentType): SocialTemplate[] {
    return SOCIAL_TEMPLATES.filter(t => t.contentType === contentType);
}

export function buildSocialPrompt(
    template: SocialTemplate,
    params: {
        topic: string;
        context?: string;
        tone?: string;
    }
): string {
    return template.userPromptTemplate
        .replace('{{topic}}', params.topic)
        .replace('{{context}}', params.context || 'Non spécifié')
        .replace('{{tone}}', params.tone || 'professionnel');
}

// Hashtags suggérés par secteur pour l'Afrique
export const SUGGESTED_HASHTAGS: Record<string, string[]> = {
    general: ['#JadaRiseLabs', '#Afrique', '#Innovation', '#TechAfrique'],
    business: ['#EntrepreneurAfrique', '#BusinessLocal', '#StartupAfrique', '#Cotonou', '#Abidjan', '#Lomé'],
    creative: ['#CréateurContenu', '#ContenuAfricain', '#DigitalAfrique', '#MadeInAfrica'],
    education: ['#ÉducationAfrique', '#Formation', '#Apprendre', '#Savoir'],
    tech: ['#TechAfrique', '#Innovation', '#Digital', '#IAfrique'],
    food: ['#CuisineAfricaine', '#FoodAfrique', '#Gastronomie', '#LocalFood'],
    fashion: ['#ModeAfricaine', '#AfricanFashion', '#Pagne', '#MadeInAfrica'],
    beauty: ['#BeautéAfricaine', '#SkinCare', '#CoiffureAfro', '#Bienêtre'],
};

export function getSuggestedHashtags(sector: string = 'general'): string[] {
    return SUGGESTED_HASHTAGS[sector] || SUGGESTED_HASHTAGS.general;
}
