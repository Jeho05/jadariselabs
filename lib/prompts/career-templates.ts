// ============================================
// JadaRiseLabs — Templates pour CV et Lettres de motivation
// Adaptés au marché de l'emploi ouest-africain
// ============================================

export type DocumentType = 'cv' | 'cover-letter';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'executive';
export type SectorType = 
    | 'tech' 
    | 'business' 
    | 'administration' 
    | 'health' 
    | 'education' 
    | 'creative'
    | 'agriculture'
    | 'finance'
    | 'other';

export interface CareerTemplate {
    id: string;
    documentType: DocumentType;
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
}

export const SECTOR_CONFIG: Record<SectorType, { 
    name: string; 
    skills: string[];
    keywords: string[];
}> = {
    tech: {
        name: 'Technologie / IT',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Cloud', 'DevOps', 'Agile', 'SQL'],
        keywords: ['développement', 'programmation', 'solutions digitales', 'innovation'],
    },
    business: {
        name: 'Business / Marketing',
        skills: ['Stratégie', 'Marketing digital', 'Ventes', 'Négociation', 'CRM', 'Analyse de marché'],
        keywords: ['croissance', 'chiffre d\'affaires', 'clients', 'marché africain'],
    },
    administration: {
        name: 'Administration / Management',
        skills: ['Gestion de projet', 'Leadership', 'Planification', 'Reporting', 'RH', 'Processus'],
        keywords: ['organisation', 'efficacité', 'équipe', 'supervision'],
    },
    health: {
        name: 'Santé / Médical',
        skills: ['Soins patients', 'Diagnostic', 'Hygiène', 'Pharmacie', 'Dossiers médicaux'],
        keywords: ['patients', 'soins', 'santé publique', 'bien-être'],
    },
    education: {
        name: 'Éducation / Formation',
        skills: ['Pédagogie', 'Conception de cours', 'Évaluation', 'Mentorat', 'Animation'],
        keywords: ['apprentissage', 'étudiants', 'pédagogie', 'transmission'],
    },
    creative: {
        name: 'Créatif / Médias',
        skills: ['Design', 'Rédaction', 'Photographie', 'Vidéo', 'Branding', 'Créativité'],
        keywords: ['création', 'visuel', 'communication', 'esthétique'],
    },
    agriculture: {
        name: 'Agriculture / Agro',
        skills: ['Agronomie', 'Gestion de production', 'Logistique', 'Qualité', 'Export'],
        keywords: ['production', 'durabilité', 'terroir', 'agro-business'],
    },
    finance: {
        name: 'Finance / Comptabilité',
        skills: ['Comptabilité', 'Analyse financière', 'Audit', 'Contrôle de gestion', 'Fiscalité'],
        keywords: ['rentabilité', 'équilibre', 'trésorerie', 'compliance'],
    },
    other: {
        name: 'Autre secteur',
        skills: ['Adaptabilité', 'Autonomie', 'Communication', 'Résolution de problèmes'],
        keywords: ['polyvalence', 'engagement', 'excellence'],
    },
};

export const CAREER_TEMPLATES: CareerTemplate[] = [
    // === CV ===
    {
        id: 'cv-professional',
        documentType: 'cv',
        name: 'CV Professionnel',
        description: 'Format classique et professionnel',
        systemPrompt: `Tu es un expert en rédaction de CV pour le marché de l'emploi en Afrique de l'Ouest (Bénin, Togo, Côte d'Ivoire, Sénégal).

RÈGLES IMPORTANTES:
1. Format européen adapté aux standards locaux
2. Mettre en valeur les expériences pertinentes pour le poste visé
3. Utiliser des verbes d'action impactants
4. Quantifier les réalisations quand possible
5. Adapter au contexte africain (diplômes reconnus, langues locales)
6. Maximum 2 pages
7. Sections claires et cohérentes`,
        userPromptTemplate: `Rédige un CV professionnel pour le poste suivant.

POSTE VISÉ: {{jobTitle}}

INFORMATIONS CANDIDAT:
- Nom: {{name}}
- Email: {{email}}
- Téléphone: {{phone}}
- Localisation: {{location}}
- Expérience: {{experienceLevel}}
- Secteur: {{sector}}
- Expériences passées: {{experiences}}
- Formation: {{education}}
- Compétences clés: {{skills}}
- Langues: {{languages}}
- Réalisations marquantes: {{achievements}}

FORMAT DE SORTIE:

[NOM PRÉNOM]
[Email] | [Téléphone] | [LinkedIn optionnel] | [Localisation]

PROFIL PROFESSIONNEL
Résumé de 3-4 lignes mettant en avant l'expérience et la valeur ajoutée pour le poste.

EXPÉRIENCES PROFESSIONNELLES
(De la plus récente à la plus ancienne)

Pour chaque expérience:
[Date] - [Poste] | [Entreprise], [Localisation]
• Réalisation 1 (quantifiée si possible)
• Réalisation 2
• Réalisation 3

FORMATION
[Date] - [Diplôme] | [Établissement], [Localisation]
Mentionner les équivalences si diplôme étranger

COMPÉTENCES CLÉS
• [Compétence technique 1] • [Compétence technique 2]
• [Soft skill 1] • [Soft skill 2]

LANGUES
• Français: [niveau]
• Anglais: [niveau] (si applicable)
• Langues locales: [si pertinent]

RÉFÉRENCES
Sur demande` ,
    },
    {
        id: 'cv-modern',
        documentType: 'cv',
        name: 'CV Moderne/Startup',
        description: 'Style dynamique pour startups et tech',
        systemPrompt: 'Expert CV pour startups et entreprises innovantes en Afrique. Style dynamique, mettre en avant la créativité et l\'adaptabilité.',
        userPromptTemplate: `Crée un CV moderne et impactant pour ce profil:

Poste: {{jobTitle}}
Profil: {{experienceLevel}} en {{sector}}

Données:
{{name}} | {{email}} | {{phone}} | {{location}}

Expériences: {{experiences}}
Formation: {{education}}
Compétences: {{skills}}
Réalisations: {{achievements}}

STYLE: Dynamique, sections originales possibles ("Projets", "Passions"), tons professionnel mais accessible.`
    },
    {
        id: 'cv-minimal',
        documentType: 'cv',
        name: 'CV Minimaliste',
        description: 'Design épuré et concis',
        systemPrompt: 'Expert CV minimaliste. Maximum d\'impact avec minimum de texte. Privilégier la clarté et la lisibilité.',
        userPromptTemplate: `Rédige un CV minimaliste et concis.

Poste: {{jobTitle}}
Profil: {{name}}, {{experienceLevel}}

Infos:
- {{email}}
- {{phone}}
- {{location}}

Expériences clés: {{experiences}}
Formation: {{education}}
Top 3 compétences: {{skills}}

FORMAT: Ultra-concis, phrases courtes, espacement important.`
    },

    // === LETTRES DE MOTIVATION ===
    {
        id: 'cover-classic',
        documentType: 'cover-letter',
        name: 'Lettre Classique',
        description: 'Format traditionnel et professionnel',
        systemPrompt: `Tu es un expert en lettres de motivation pour le marché africain.

RÈGLES:
1. 3-4 paragraphes maximum
2. Personnalisation réelle (pas de générique)
3. Connexion entre expérience et besoin du poste
4. Ton respectueux mais confiant
5. Mentionner la contribution à l'entreprise
6. Fermeture avec appel à l'action`,
        userPromptTemplate: `Rédige une lettre de motivation pour le poste suivant.

DESTINATAIRE:
Entreprise: {{companyName}}
Poste: {{jobTitle}}
Adresse: {{companyAddress}}

CANDIDAT:
Nom: {{name}}
Adresse: {{address}}
Contact: {{email}}, {{phone}}

PROFIL:
Niveau: {{experienceLevel}}
Secteur: {{sector}}
Points forts: {{strengths}}
Motivation spécifique: {{motivation}}

STRUCTURE:
[Formule d'appel personnalisée si possible]

Paragraphe 1: Accroche - Pourquoi ce poste m'intéresse spécifiquement
Paragraphe 2: Valeur ajoutée - Mon expérience répond à vos besoins parce que...
Paragraphe 3: Contribution - Ce que j'apporte à {{companyName}}
Paragraphe 4: Disponibilité et appel à l'action

[Formule de politesse appropriée]`
    },
    {
        id: 'cover-creative',
        documentType: 'cover-letter',
        name: 'Lettre Créative',
        description: 'Originalité pour postes créatifs',
        systemPrompt: 'Lettre de motivation originale pour secteurs créatifs (marketing, design, médias). Peut inclure storytelling et légère originalité.',
        userPromptTemplate: `Écris une lettre de motivation créative et originale.

Poste: {{jobTitle}} chez {{companyName}}
Candidat: {{name}}, {{experienceLevel}} en {{sector}}

Angle: {{motivation}}
Points forts créatifs: {{strengths}}

Style: Accroche narrative, ton chaleureux, démonstration plutôt qu'énumération.`
    },
    {
        id: 'cover-spontaneous',
        documentType: 'cover-letter',
        name: 'Candidature Spontanée',
        description: 'Quand aucune offre n\'est publiée',
        systemPrompt: 'Lettre de candidature spontanée. Montrer la connaissance de l\'entreprise, proposer une valeur ajoutée concrète.',
        userPromptTemplate: `Rédige une candidature spontanée.

Entreprise: {{companyName}}
Profil: {{name}}, {{experienceLevel}} en {{sector}}

Intérêt pour l'entreprise: {{motivation}}
Proposition de valeur: {{strengths}}

OBJECTIF: Convaincre qu'ils ont besoin de ce profil même sans offre.`
    },
];

// Helper functions
export function getTemplatesByType(type: DocumentType): CareerTemplate[] {
    return CAREER_TEMPLATES.filter(t => t.documentType === type);
}

export function buildCareerPrompt(
    template: CareerTemplate,
    params: Record<string, string>
): string {
    let prompt = template.userPromptTemplate;
    
    Object.entries(params).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    
    return prompt;
}

// Suggestions de formulations
export const CV_ACTION_VERBS = [
    'Conception', 'Développement', 'Mise en œuvre', 'Coordination',
    'Optimisation', 'Supervision', 'Analyse', 'Pilotage',
    'Réalisation', 'Déploiement', 'Gestion', 'Accompagnement',
    'Formation', 'Création', 'Transformation', 'Audit'
];

export const COVER_OPENINGS = [
    'Suite à votre offre publiée sur...',
    'Votre entreprise m\'a particulièrement interpellé par...',
    'C\'est avec un vif intérêt que je vous adresse...',
    'Passionné(e) par [secteur], je souhaite rejoindre...',
];

export const COVER_CLOSINGS = [
    'Dans l\'attente de vous rencontrer...',
    'Je serais ravi(e) d\'échanger avec vous...',
    'Je me tiens à votre disposition pour un entretien...',
    'En espérant que ma candidature retiendra votre attention...',
];

// Validation
export function validateCVData(data: Record<string, string>): string[] {
    const errors: string[] = [];
    const required = ['name', 'email', 'phone', 'jobTitle', 'sector'];
    
    required.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`Le champ ${field} est requis`);
        }
    });
    
    if (data.email && !data.email.includes('@')) {
        errors.push('Email invalide');
    }
    
    return errors;
}
