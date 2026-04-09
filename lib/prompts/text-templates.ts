// ============================================
// JadaRiseLabs — Templates de prompts pour le générateur universel
// ============================================

export type TextTemplate = {
    id: string;
    name: string;
    description: string;
    category: 'writing' | 'marketing' | 'ideas' | 'scripts' | 'social' | 'professional';
    icon: string;
    promptTemplate: string;
    defaultParams: {
        tone: string;
        length: string;
        audience: string;
    };
};

export const TEXT_TEMPLATES: TextTemplate[] = [
    // === ÉCRITURE ===
    {
        id: 'email',
        name: 'Email professionnel',
        description: 'Rédigez des emails clairs et efficaces',
        category: 'writing',
        icon: 'mail',
        promptTemplate: `Rédige un email professionnel sur le sujet suivant : "{{topic}}"

Contexte : {{context}}

Instructions :
- Ton : {{tone}}
- Longueur : {{length}}
- Destinataire : {{audience}}
- Structure : objet accrocheur, introduction concise, développement structuré, conclusion avec call-to-action

Ne mets pas de formules de politesse génériques, adapte-les au contexte.`,
        defaultParams: { tone: 'professionnel', length: 'moyen', audience: 'client' },
    },
    {
        id: 'article',
        name: 'Article de blog',
        description: 'Articles informatifs et engageants',
        category: 'writing',
        icon: 'file-text',
        promptTemplate: `Rédige un article de blog sur : "{{topic}}"

Instructions :
- Ton : {{tone}}
- Longueur : {{length}}
- Public cible : {{audience}}
- Structure : titre accrocheur (H1), introduction qui pose le problème, 3-5 sections avec sous-titres (H2), conclusion avec résumé et appel à l'action
- Style : paragraphes courts, phrases dynamiques, utiliser des émojis avec parcimonie
- SEO : inclure des mots-clés naturellement`,
        defaultParams: { tone: 'informatif', length: 'long', audience: 'grand public' },
    },
    {
        id: 'story',
        name: 'Histoire / Récit',
        description: 'Récits captivants et créatifs',
        category: 'writing',
        icon: 'book-open',
        promptTemplate: `Écris une histoire sur : "{{topic}}"

Instructions :
- Ton : {{tone}}
- Longueur : {{length}}
- Public : {{audience}}
- Structure : accroche immédiate, développement avec tension, climax, résolution
- Style : dialogues naturels, descriptions sensorielles, rythme adapté`,
        defaultParams: { tone: 'créatif', length: 'moyen', audience: 'tous publics' },
    },

    // === MARKETING ===
    {
        id: 'ad',
        name: 'Publicité / Annonce',
        description: 'Copywriting pour publicités',
        category: 'marketing',
        icon: 'megaphone',
        promptTemplate: `Rédige un texte publicitaire pour : "{{topic}}"

Contexte produit/service : {{context}}

Instructions :
- Ton : {{tone}}
- Longueur : {{length}}
- Cible : {{audience}}
- Technique : AIDA (Attention, Intérêt, Désir, Action)
- Inclure : accroche impactante, bénéfices clés (pas de fonctionnalités), preuve sociale suggérée, call-to-action clair
- Style : langage actif, verbes d'action, créer l'urgence positive`,
        defaultParams: { tone: 'enthousiaste', length: 'court', audience: 'clients potentiels' },
    },
    {
        id: 'sales-pitch',
        name: 'Pitch de vente',
        description: 'Argumentaire commercial',
        category: 'marketing',
        icon: 'trending-up',
        promptTemplate: `Crée un pitch de vente pour : "{{topic}}"

Contexte : {{context}}

Instructions :
- Ton : {{tone}}
- Longueur : {{length}}
- Audience : {{audience}}
- Structure : problème → solution → bénéfices → différenciation → preuve → appel à l'action
- Durée : adapter à un pitch oral de 30s, 1min ou 2min selon la longueur demandée`,
        defaultParams: { tone: 'convaincant', length: 'court', audience: 'investisseurs' },
    },

    // === IDÉES ===
    {
        id: 'brainstorm',
        name: 'Brainstorming',
        description: 'Génération d\'idées créatives',
        category: 'ideas',
        icon: 'lightbulb',
        promptTemplate: `Génère des idées pour : "{{topic}}"

Contraintes/contexte : {{context}}

Instructions :
- Ton : {{tone}}
- Nombre d'idées : adapter selon {{length}} (court=3, moyen=5, long=10)
- Public : {{audience}}
- Format : liste numérotée avec titre accrocheur pour chaque idée
- Pour chaque idée : nom créatif, description en 2-3 phrases, pourquoi c'est pertinent, difficulté de mise en œuvre (facile/moyen/difficile)`,
        defaultParams: { tone: 'créatif', length: 'moyen', audience: 'équipe projet' },
    },
    {
        id: 'names',
        name: 'Noms & Slogans',
        description: 'Suggestions de noms et taglines',
        category: 'ideas',
        icon: 'tag',
        promptTemplate: `Génère des noms et slogans pour : "{{topic}}"

Domaine/secteur : {{context}}

Instructions :
- Ton : {{tone}}
- Nombre : {{length}} (court=3, moyen=6, long=12)
- Cible : {{audience}}
- Pour chaque proposition :
  1. Nom (vérifier la disponibilité approximative)
  2. Slogan/tagline associé
  3. Signification/étymologie
  4. Pourquoi ça fonctionne pour la cible`,
        defaultParams: { tone: 'innovant', length: 'moyen', audience: 'grand public' },
    },

    // === SCRIPTS ===
    {
        id: 'video-script',
        name: 'Script vidéo',
        description: 'Scripts pour YouTube, TikTok, Reels',
        category: 'scripts',
        icon: 'video',
        promptTemplate: `Rédige un script vidéo pour : "{{topic}}"

Format vidéo : {{context}}

Instructions :
- Ton : {{tone}}
- Longueur : {{length}} → adapter au format (court=30s, moyen=1-2min, long=3-5min)
- Audience : {{audience}}
- Structure :
  [HOOK] Accroche 0-3s (doit retenir l'attention)
  [INTRO] Présentation du sujet 5-10s
  [CORPS] Développement avec points clés
  [CTA] Call-to-action final
- Indiquer : durée estimée par section, notes de mise en scène, suggestions de B-roll entre crochets`,
        defaultParams: { tone: 'dynamique', length: 'court', audience: 'jeunes' },
    },
    {
        id: 'podcast-script',
        name: 'Script podcast',
        description: 'Structure pour épisodes audio',
        category: 'scripts',
        icon: 'mic',
        promptTemplate: `Crée un script de podcast pour : "{{topic}}"

Format : {{context}}

Instructions :
- Ton : {{tone}}
- Longueur : {{length}} → adapter (court=5min, moyen=15min, long=30min)
- Audience : {{audience}}
- Structure :
  [JINGLE] Suggestion d'intro musicale
  [HOOK] Accroche verbale (15-20s)
  [INTRO] Présentation épisode + animateur(s)
  [SEGMENT 1] Premier sujet avec transition
  [SEGMENT 2] Deuxième sujet avec transition
  [SEGMENT 3] Troisième sujet (optionnel selon longueur)
  [OUTRO] Conclusion + teaser prochain épisode + call-to-action
- Style : langage oral naturel, phrases courtes, marquer les pauses avec [...]`,
        defaultParams: { tone: 'conversationnel', length: 'moyen', audience: 'auditeurs réguliers' },
    },

    // === PROFESSIONNEL ===
    {
        id: 'linkedin-post',
        name: 'Post LinkedIn',
        description: 'Publications professionnelles',
        category: 'professional',
        icon: 'linkedin',
        promptTemplate: `Rédige un post LinkedIn sur : "{{topic}}"

Contexte professionnel : {{context}}

Instructions :
- Ton : {{tone}} (professionnel mais accessible)
- Longueur : {{length}} → court=100 mots, moyen=200 mots, long=300 mots max
- Audience : {{audience}}
- Structure : accroche personnelle ou question, expérience/insight partagé, leçon/conseil actionnable, call-to-action engagement
- Style : paragraphes très courts (1-2 phrases), sauts de ligne entre chaque, émojis pertinents (3-5 max), hashtags professionnels (3-5 max en fin de post)`,
        defaultParams: { tone: 'authentique', length: 'moyen', audience: 'réseau professionnel' },
    },
    {
        id: 'proposal',
        name: 'Proposition commerciale',
        description: 'Offres et devis',
        category: 'professional',
        icon: 'briefcase',
        promptTemplate: `Rédige une proposition commerciale pour : "{{topic}}"

Contexte client/projet : {{context}}

Instructions :
- Ton : {{tone}}
- Longueur : {{length}}
- Client : {{audience}}
- Structure :
  1. Présentation de la compréhension du besoin client
  2. Solution proposée (approche méthodologique)
  3. Livrables détaillés
  4. Timeline indicative
  5. Investissement (fourchette ou tarifs)
  6. Prochaines étapes
- Style : professionnel rassurant, éviter le jargon excessif, mettre en valeur la valeur ajoutée unique`,
        defaultParams: { tone: 'professionnel', length: 'long', audience: 'client B2B' },
    },
];

// Catégories pour l'UI
export const TEXT_CATEGORIES = [
    { id: 'writing', name: 'Écriture', icon: 'pen' },
    { id: 'marketing', name: 'Marketing', icon: 'target' },
    { id: 'ideas', name: 'Idées', icon: 'zap' },
    { id: 'scripts', name: 'Scripts', icon: 'film' },
    { id: 'professional', name: 'Professionnel', icon: 'briefcase' },
] as const;

// Options de personnalisation
export const TONE_OPTIONS = [
    { value: 'professionnel', label: 'Professionnel', description: 'Formel et structuré' },
    { value: 'conversationnel', label: 'Conversationnel', description: 'Naturel et amical' },
    { value: 'enthousiaste', label: 'Enthousiaste', description: 'Énergique et motivant' },
    { value: 'informatif', label: 'Informatif', description: 'Clair et pédagogique' },
    { value: 'créatif', label: 'Créatif', description: 'Imaginatif et original' },
    { value: 'convaincant', label: 'Convaincant', description: 'Persuasif et impactant' },
    { value: 'authentique', label: 'Authentique', description: 'Sincère et personnel' },
    { value: 'dynamique', label: 'Dynamique', description: 'Rapide et punchy' },
];

export const LENGTH_OPTIONS = [
    { value: 'court', label: 'Court', description: 'Concis et direct', credits: 1 },
    { value: 'moyen', label: 'Moyen', description: 'Équilibré et complet', credits: 1 },
    { value: 'long', label: 'Long', description: 'Détaillé et approfondi', credits: 2 },
];

export const AUDIENCE_OPTIONS = [
    { value: 'grand public', label: 'Grand public' },
    { value: 'professionnels', label: 'Professionnels' },
    { value: 'jeunes', label: 'Jeunes (18-25 ans)' },
    { value: 'experts', label: 'Experts du domaine' },
    { value: 'clients', label: 'Clients potentiels' },
    { value: 'investisseurs', label: 'Investisseurs' },
    { value: 'collaborateurs', label: 'Collaborateurs' },
];

// Helper pour générer le prompt final
export function buildPrompt(
    template: TextTemplate,
    params: {
        topic: string;
        context?: string;
        tone?: string;
        length?: string;
        audience?: string;
    }
): string {
    return template.promptTemplate
        .replace('{{topic}}', params.topic)
        .replace('{{context}}', params.context || 'Non spécifié')
        .replace('{{tone}}', params.tone || template.defaultParams.tone)
        .replace('{{length}}', params.length || template.defaultParams.length)
        .replace('{{audience}}', params.audience || template.defaultParams.audience);
}

// Helper pour calculer les crédits
export function calculateTextCredits(length: string, multiOutput: boolean = false): number {
    const baseCredits = length === 'long' ? 2 : 1;
    return multiOutput ? baseCredits * 3 : baseCredits;
}
