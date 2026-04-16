// ============================================
// JadaRiseLabs — Templates de prompts pour le Studio Code Pro
// Générateur complet : Apps, Cahiers des charges, Plans, Ideas, etc.
// ============================================

export type CodeDeliverable =
    | 'app'
    | 'cahier'
    | 'plan'
    | 'ideas'
    | 'architecture'
    | 'docs'
    | 'audit';

export type CodeComplexity = 'mvp' | 'standard' | 'advanced';

export type CodeTemplate = {
    id: string;
    name: string;
    description: string;
    category: CodeDeliverable;
    icon: string;
    promptTemplate: string;
    defaultStack: string;
    defaultComplexity: CodeComplexity;
    creditsBase: number;
};

// === TEMPLATES ===
export const CODE_TEMPLATES: CodeTemplate[] = [
    // === APPLICATION COMPLÈTE ===
    {
        id: 'web-app',
        name: 'Application web complète',
        description: 'App fullstack avec frontend, backend et base de données',
        category: 'app',
        icon: 'globe',
        defaultStack: 'Next.js + TypeScript',
        defaultComplexity: 'standard',
        creditsBase: 3,
        promptTemplate: `Tu es un architecte logiciel senior. Le client veut une APPLICATION WEB COMPLÈTE.

PROJET : "{{topic}}"

STACK TECHNIQUE : {{stack}}
COMPLEXITÉ : {{complexity}}
CONTEXTE ADDITIONNEL : {{context}}

INSTRUCTIONS IMPÉRATIVES :
1. Génère la STRUCTURE COMPLÈTE DU PROJET avec l'arborescence des fichiers
2. Pour CHAQUE FICHIER, crée un bloc de code avec le chemin en commentaire
3. Le code doit être FONCTIONNEL, pas de placeholders ni de "TODO"
4. Inclus : configuration, modèles de données, routes API, composants UI, styles
5. Ajoute un README.md avec instructions d'installation et lancement
6. Suis les MEILLEURES PRATIQUES du stack choisi

FORMAT DE SORTIE :
- Commence par un résumé du projet (3-4 lignes)
- Puis l'arborescence des fichiers
- Puis chaque fichier avec son code complet dans des blocs markdown
- Termine par les instructions de déploiement`,
    },
    {
        id: 'mobile-app',
        name: 'Application mobile',
        description: 'App mobile React Native ou Flutter',
        category: 'app',
        icon: 'smartphone',
        defaultStack: 'React Native + Expo',
        defaultComplexity: 'standard',
        creditsBase: 3,
        promptTemplate: `Tu es un développeur mobile senior. Le client veut une APPLICATION MOBILE.

PROJET : "{{topic}}"

STACK TECHNIQUE : {{stack}}
COMPLEXITÉ : {{complexity}}
CONTEXTE ADDITIONNEL : {{context}}

INSTRUCTIONS IMPÉRATIVES :
1. Génère la structure complète du projet mobile
2. Inclus : navigation, écrans, composants réutilisables, API calls, state management
3. Le code doit être prêt à l'emploi (copier-coller → ça marche)
4. Inclus le styling (StyleSheet ou équivalent)
5. Gère les permissions, le storage local, et l'authentification si pertinent
6. README avec setup instructions

FORMAT : Structure de fichiers → Code complet par fichier → Instructions de lancement`,
    },
    {
        id: 'api-rest',
        name: 'API REST / Backend',
        description: 'API complète avec endpoints, auth et base de données',
        category: 'app',
        icon: 'server',
        defaultStack: 'Node.js + Express + PostgreSQL',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un architecte backend senior. Le client veut une API REST COMPLÈTE.

PROJET : "{{topic}}"

STACK TECHNIQUE : {{stack}}
COMPLEXITÉ : {{complexity}}
CONTEXTE ADDITIONNEL : {{context}}

INSTRUCTIONS IMPÉRATIVES :
1. Génère tous les endpoints REST avec documentation
2. Inclus : modèles de données, migrations, middleware auth, validation, error handling
3. Implémente JWT ou session-based auth
4. Ajoute les variables d'environnement (.env.example)
5. Inclus des tests unitaires pour les routes principales
6. Documentation API (format OpenAPI/Swagger si possible)
7. README avec instructions de déploiement

FORMAT : Architecture → Schéma DB → Endpoints → Code par fichier → Tests → Déploiement`,
    },
    {
        id: 'landing-page',
        name: 'Landing page',
        description: 'Page d\'atterrissage responsive et optimisée conversion',
        category: 'app',
        icon: 'layout',
        defaultStack: 'HTML + CSS + JavaScript',
        defaultComplexity: 'mvp',
        creditsBase: 2,
        promptTemplate: `Tu es un expert en web design et conversion. Le client veut une LANDING PAGE.

PROJET : "{{topic}}"

STACK TECHNIQUE : {{stack}}
COMPLEXITÉ : {{complexity}}
CONTEXTE ADDITIONNEL : {{context}}

INSTRUCTIONS IMPÉRATIVES :
1. Design moderne, responsive, professionnel
2. Sections : Hero, Features, Témoignages, Pricing, FAQ, CTA, Footer
3. Animations CSS subtiles (fade-in, hover effects)
4. Optimisé pour la conversion (CTA visibles, urgence, preuves sociales)
5. SEO-friendly (meta tags, semantic HTML, structured data)
6. Performance optimisée (lazy loading, minification ready)
7. Mode sombre supporté si pertinent

FORMAT : HTML complet + CSS complet + JS si nécessaire + Instructions`,
    },

    // === CAHIER DES CHARGES ===
    {
        id: 'cahier-fonctionnel',
        name: 'Cahier des charges fonctionnel',
        description: 'Document détaillé des fonctionnalités et parcours utilisateur',
        category: 'cahier',
        icon: 'file-text',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un consultant senior en gestion de projet IT. Rédige un CAHIER DES CHARGES FONCTIONNEL professionnel.

PROJET : "{{topic}}"

COMPLEXITÉ : {{complexity}}
CONTEXTE : {{context}}

STRUCTURE DU DOCUMENT :

1. **PAGE DE GARDE**
   - Titre du projet, client, date, version, auteur

2. **RÉSUMÉ EXÉCUTIF** (1 page max)
   - Objectif du projet, périmètre, bénéfices attendus

3. **CONTEXTE & PROBLÉMATIQUE**
   - Situation actuelle, problèmes identifiés, enjeux

4. **OBJECTIFS DU PROJET**
   - Objectifs SMART, KPIs de succès

5. **PÉRIMÈTRE FONCTIONNEL**
   - Fonctionnalités principales (Must-Have)
   - Fonctionnalités secondaires (Should-Have)
   - Fonctionnalités futures (Could-Have)
   - Exclusions explicites (Won't-Have)

6. **PARCOURS UTILISATEUR**
   - Personas détaillés
   - User flows principaux (étape par étape)
   - Wireframes textuels

7. **EXIGENCES NON-FONCTIONNELLES**
   - Performance, sécurité, accessibilité, compatibilité

8. **PLANNING PRÉVISIONNEL**
   - Phases, jalons, livrables par phase

9. **BUDGET ESTIMATIF**
   - Ventilation par poste (développement, design, infrastructure)

10. **ANNEXES**
    - Glossaire, références, documents annexes

FORMAT : Document Markdown structuré avec numérotation, tableaux, et listes. Chaque section doit être détaillée et actionnable.`,
    },
    {
        id: 'cahier-technique',
        name: 'Cahier des charges technique',
        description: 'Spécifications techniques et architecture',
        category: 'cahier',
        icon: 'settings',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un architecte solution senior. Rédige un CAHIER DES CHARGES TECHNIQUE complet.

PROJET : "{{topic}}"

STACK SUGGÉRÉE : {{stack}}
COMPLEXITÉ : {{complexity}}
CONTEXTE : {{context}}

STRUCTURE DU DOCUMENT :

1. **VUE D'ENSEMBLE TECHNIQUE**
   - Architecture cible, principes directeurs

2. **STACK TECHNIQUE RECOMMANDÉE**
   - Frontend, Backend, Base de données, Infrastructure
   - Justification de chaque choix

3. **ARCHITECTURE LOGICIELLE**
   - Diagramme d'architecture (décrit en mermaid)
   - Patterns utilisés (MVC, microservices, etc.)
   - Communication entre services

4. **MODÈLE DE DONNÉES**
   - Schéma entité-relation (en mermaid)
   - Description de chaque table/collection
   - Relations et contraintes

5. **API DESIGN**
   - Liste des endpoints
   - Format d'échange (JSON, GraphQL, etc.)
   - Authentification & autorisation

6. **SÉCURITÉ**
   - Stratégie d'authentification
   - Protection des données (RGPD)
   - Gestion des secrets

7. **INFRASTRUCTURE & DÉPLOIEMENT**
   - Environnements (dev, staging, prod)
   - CI/CD pipeline
   - Monitoring & logging

8. **TESTS**
   - Stratégie de tests (unitaires, intégration, E2E)
   - Couverture cible

9. **PLANNING TECHNIQUE**
   - Découpage en sprints
   - Estimation des charges (en jours-homme)

FORMAT : Document technique professionnel en Markdown avec diagrammes mermaid.`,
    },

    // === PLAN D'ACTION ===
    {
        id: 'plan-projet',
        name: 'Plan d\'action projet',
        description: 'Roadmap détaillée avec phases, tâches et jalons',
        category: 'plan',
        icon: 'calendar',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un chef de projet senior certifié PMP. Crée un PLAN D'ACTION PROJET détaillé.

PROJET : "{{topic}}"

COMPLEXITÉ : {{complexity}}
CONTEXTE : {{context}}

STRUCTURE :

1. **RÉSUMÉ DU PROJET**
   - Vision, objectifs, durée estimée

2. **PHASES DU PROJET** (Timeline Gantt en mermaid)
   Pour chaque phase :
   - Nom et durée
   - Objectifs de la phase
   - Tâches détaillées (avec estimation en jours)
   - Livrables attendus
   - Critères de validation
   - Risques associés

3. **MATRICE RACI**
   - Responsable, Accountable, Consulted, Informed par tâche

4. **BUDGET PRÉVISIONNEL**
   - Répartition par phase et par type de coût
   - Marge de contingence

5. **GESTION DES RISQUES**
   - Identification des risques (probabilité × impact)
   - Plan de mitigation pour chaque risque

6. **INDICATEURS DE SUIVI (KPIs)**
   - Métriques de progression
   - Fréquence de reporting

7. **PROCHAINES ÉTAPES IMMÉDIATES**
   - Les 5 premières actions à lancer dès maintenant

FORMAT : Document structuré avec diagramme Gantt mermaid, tableaux et listes d'actions.`,
    },
    {
        id: 'roadmap-produit',
        name: 'Roadmap produit',
        description: 'Vision produit et évolution sur 6-12 mois',
        category: 'plan',
        icon: 'map',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un Product Manager senior. Crée une ROADMAP PRODUIT stratégique.

PRODUIT : "{{topic}}"

CONTEXTE : {{context}}

STRUCTURE :

1. **VISION PRODUIT**
   - Mission, vision, proposition de valeur unique

2. **ANALYSE DE MARCHÉ**
   - Concurrents principaux (analyse comparative)
   - Opportunités identifiées

3. **ROADMAP PAR TRIMESTRE** (Q1, Q2, Q3, Q4)
   Pour chaque trimestre :
   - Thème principal
   - Features principales avec priorité (P0/P1/P2)
   - Métriques cibles
   - Dépendances

4. **MVP (Minimum Viable Product)**
   - Features du MVP (liste priorisée)
   - Critères de succès du MVP
   - Timeline du MVP

5. **STRATÉGIE DE GROWTH**
   - Canaux d'acquisition
   - Métriques AARRR (Acquisition, Activation, Retention, Revenue, Referral)

6. **DIAGRAMME TIMELINE** (en mermaid)

FORMAT : Document stratégique avec visuels mermaid et tableaux de priorisation.`,
    },

    // === BRAINSTORMING & IDÉES ===
    {
        id: 'brainstorm-features',
        name: 'Brainstorming features',
        description: 'Génération d\'idées de fonctionnalités innovantes',
        category: 'ideas',
        icon: 'lightbulb',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 1,
        promptTemplate: `Tu es un consultant en innovation et un expert produit. Génère des IDÉES DE FONCTIONNALITÉS innovantes.

PROJET/PRODUIT : "{{topic}}"

CONTEXTE : {{context}}

INSTRUCTIONS :
1. Génère 10-15 idées de fonctionnalités classées par catégorie
2. Pour chaque idée :
   - 🏷️ Nom accrocheur
   - 📝 Description (2-3 phrases)
   - 💎 Valeur ajoutée pour l'utilisateur
   - ⚡ Complexité technique (🟢 Facile / 🟡 Moyen / 🔴 Difficile)
   - 📊 Impact business (Faible / Moyen / Fort)
   - 🎯 Priorité recommandée (P0 / P1 / P2)

3. Classe les idées en 3 niveaux :
   - 🔥 Quick Wins (facile + fort impact)
   - 🚀 Big Bets (difficile + fort impact)
   - 💡 Nice to Have (à considérer plus tard)

4. Termine par une matrice impact/effort visuelle

FORMAT : Liste structurée avec émojis et tableaux.`,
    },
    {
        id: 'brainstorm-startup',
        name: 'Idées de startup / business',
        description: 'Concepts de business innovants autour d\'un thème',
        category: 'ideas',
        icon: 'rocket',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 1,
        promptTemplate: `Tu es un serial entrepreneur et venture capitalist. Génère des IDÉES DE BUSINESS innovantes.

THÈME / SECTEUR : "{{topic}}"

CONTEXTE : {{context}}

Pour chaque idée (génère 5-8 concepts) :

1. **Nom du concept** + Tagline
2. **Le problème** : Quel pain-point résout-on ?
3. **La solution** : Comment ça fonctionne ?
4. **Le marché** : Taille estimée, cible
5. **Le business model** : Comment ça génère du revenu ?
6. **La concurrence** : Qui existe déjà ? Différenciation
7. **Le MVP** : Que construire en premier ? (2-4 semaines)
8. **Score de viabilité** : /10

Termine par un tableau comparatif des idées avec les scores.

FORMAT : Document structuré avec tableaux comparatifs.`,
    },

    // === ARCHITECTURE ===
    {
        id: 'archi-system',
        name: 'Architecture système',
        description: 'Architecture technique complète avec diagrammes',
        category: 'architecture',
        icon: 'layers',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un architecte solution cloud senior. Conçois l'ARCHITECTURE SYSTÈME complète.

PROJET : "{{topic}}"

STACK : {{stack}}
COMPLEXITÉ : {{complexity}}
CONTEXTE : {{context}}

LIVRABLES :

1. **Architecture globale** (diagramme mermaid)
   - Frontend, Backend, Base de données, Services externes
   - Flux de données entre composants

2. **Architecture détaillée par couche**
   - Couche présentation
   - Couche métier
   - Couche données
   - Couche infrastructure

3. **Modèle de données** (diagramme ER en mermaid)
   - Tables, relations, index critiques

4. **Design des APIs** (format OpenAPI résumé)
   - Endpoints principaux avec méthodes et payloads

5. **Infrastructure cloud** (diagramme mermaid)
   - Services cloud recommandés
   - Stratégie de scaling
   - Backup & disaster recovery

6. **Sécurité**
   - Architecture de sécurité
   - Authentification/autorisation
   - Encryption des données

7. **Monitoring**
   - Métriques à surveiller
   - Alertes critiques

FORMAT : Document technique avec multiples diagrammes mermaid et tableaux.`,
    },

    // === DOCUMENTATION ===
    {
        id: 'doc-api',
        name: 'Documentation API',
        description: 'Documentation complète d\'une API REST',
        category: 'docs',
        icon: 'book',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un technical writer senior. Rédige une DOCUMENTATION API complète.

API / PROJET : "{{topic}}"

STACK : {{stack}}
CONTEXTE : {{context}}

STRUCTURE :

1. **Introduction**
   - Description de l'API
   - Base URL
   - Authentification (comment obtenir un token)

2. **Pour chaque endpoint** :
   - Méthode + URL
   - Description
   - Headers requis
   - Paramètres (query, path, body) avec types et exemples
   - Réponse (code HTTP, body JSON avec exemple)
   - Erreurs possibles (codes + messages)
   - Exemple cURL

3. **Modèles de données**
   - Description de chaque modèle avec types

4. **Rate Limiting & Pagination**

5. **Webhooks** (si applicable)

6. **Exemples d'intégration**
   - JavaScript/Node.js
   - Python
   - cURL

FORMAT : Documentation technique en Markdown avec blocs de code et tableaux.`,
    },
    {
        id: 'doc-guide',
        name: 'Guide utilisateur',
        description: 'Manuel d\'utilisation complet pour end-users',
        category: 'docs',
        icon: 'help-circle',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 1,
        promptTemplate: `Tu es un UX writer et technical writer. Rédige un GUIDE UTILISATEUR complet.

PRODUIT / APP : "{{topic}}"

CONTEXTE : {{context}}

STRUCTURE :

1. **Bienvenue** — Introduction chaleureuse au produit
2. **Démarrage rapide** — Les 5 premières étapes
3. **Fonctionnalités principales** — Guide détaillé pour chaque feature
4. **Tutoriels pas à pas** — 3-5 scénarios courants
5. **FAQ** — 10+ questions fréquentes avec réponses
6. **Dépannage** — Problèmes courants et solutions
7. **Raccourcis & astuces** — Tips pour utilisateurs avancés

FORMAT : Document friendly avec émojis, captures d'écran suggérées [📸], et étapes numérotées.`,
    },

    // === AUDIT ===
    {
        id: 'audit-code',
        name: 'Audit de code',
        description: 'Analyse et recommandations sur du code existant',
        category: 'audit',
        icon: 'search',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un expert en qualité logicielle et revue de code. Réalise un AUDIT DE CODE complet.

PROJET / CODE À AUDITER : "{{topic}}"

CONTEXTE : {{context}}

ANALYSE À FOURNIR :

1. **Résumé exécutif** — Score global /100 + points clés

2. **Architecture** — Score /20
   - Organisation du code, patterns utilisés
   - Couplage et cohésion
   - Recommandations

3. **Qualité du code** — Score /20
   - Lisibilité, naming conventions
   - DRY, SOLID principles
   - Gestion d'erreurs
   - Recommandations

4. **Sécurité** — Score /20
   - Vulnérabilités détectées
   - Gestion des données sensibles
   - Recommandations prioritaires

5. **Performance** — Score /20
   - Bottlenecks identifiés
   - Optimisations possibles
   - Recommandations

6. **Maintenabilité** — Score /20
   - Tests existants
   - Documentation
   - Dette technique estimée
   - Recommandations

7. **Plan d'action correctif**
   - Actions classées par priorité (critique, haute, moyenne, basse)
   - Estimation du temps par action

FORMAT : Rapport professionnel avec scores, tableaux et code snippets pour les fixes recommandés.`,
    },
    {
        id: 'audit-perf',
        name: 'Audit de performance',
        description: 'Analyse de performance et optimisation',
        category: 'audit',
        icon: 'activity',
        defaultStack: '',
        defaultComplexity: 'standard',
        creditsBase: 2,
        promptTemplate: `Tu es un expert en performance web et optimisation. Réalise un AUDIT DE PERFORMANCE.

APPLICATION / SITE : "{{topic}}"

STACK : {{stack}}
CONTEXTE : {{context}}

ANALYSE :

1. **Score global estimé** (basé sur les bonnes pratiques)
2. **Core Web Vitals** — Analyse des métriques LCP, FID/INP, CLS
3. **Loading Performance** — Bundle size, lazy loading, code splitting
4. **Runtime Performance** — Re-renders, memory leaks, event listeners
5. **Network** — Requêtes, caching, CDN, compression
6. **Database** — Requêtes N+1, indexation, connection pooling
7. **Infrastructure** — Scaling, load balancing, edge computing

Pour chaque point :
- État actuel estimé
- Impact (critique/haut/moyen/bas)
- Solution recommandée avec code d'exemple
- Gain attendu

FORMAT : Rapport technique avec code snippets et métriques.`,
    },
];

// === CATÉGORIES ===
export const CODE_CATEGORIES: Array<{
    id: CodeDeliverable;
    name: string;
    description: string;
    icon: string;
    color: string;
}> = [
    {
        id: 'app',
        name: 'Application',
        description: 'Code complet et fonctionnel',
        icon: 'code',
        color: 'earth',
    },
    {
        id: 'cahier',
        name: 'Cahier des charges',
        description: 'Spécifications détaillées',
        icon: 'clipboard',
        color: 'savanna',
    },
    {
        id: 'plan',
        name: 'Plan d\'action',
        description: 'Roadmap et planning',
        icon: 'calendar',
        color: 'gold',
    },
    {
        id: 'ideas',
        name: 'Brainstorming',
        description: 'Idées et concepts',
        icon: 'lightbulb',
        color: 'terracotta',
    },
    {
        id: 'architecture',
        name: 'Architecture',
        description: 'Design technique',
        icon: 'layers',
        color: 'earth',
    },
    {
        id: 'docs',
        name: 'Documentation',
        description: 'Guides et références',
        icon: 'book',
        color: 'savanna',
    },
    {
        id: 'audit',
        name: 'Audit',
        description: 'Analyse et recommandations',
        icon: 'search',
        color: 'terracotta',
    },
];

// === OPTIONS DE STACK ===
export const STACK_OPTIONS = [
    { value: 'Next.js + TypeScript', label: 'Next.js + TypeScript' },
    { value: 'React + Vite + TypeScript', label: 'React + Vite + TypeScript' },
    { value: 'Vue.js 3 + TypeScript', label: 'Vue.js 3 + TypeScript' },
    { value: 'Angular + TypeScript', label: 'Angular + TypeScript' },
    { value: 'React Native + Expo', label: 'React Native + Expo' },
    { value: 'Flutter + Dart', label: 'Flutter + Dart' },
    { value: 'Node.js + Express + PostgreSQL', label: 'Node.js + Express + PostgreSQL' },
    { value: 'Python + FastAPI + PostgreSQL', label: 'Python + FastAPI + PostgreSQL' },
    { value: 'Python + Django', label: 'Python + Django' },
    { value: 'Laravel + PHP + MySQL', label: 'Laravel + PHP + MySQL' },
    { value: 'HTML + CSS + JavaScript', label: 'HTML + CSS + JavaScript (Vanilla)' },
    { value: 'Spring Boot + Java', label: 'Spring Boot + Java' },
    { value: 'Go + Gin + PostgreSQL', label: 'Go + Gin + PostgreSQL' },
    { value: '', label: 'Non applicable / À déterminer' },
];

// === OPTIONS DE COMPLEXITÉ ===
export const COMPLEXITY_OPTIONS: Array<{
    value: CodeComplexity;
    label: string;
    description: string;
    multiplier: number;
}> = [
    { value: 'mvp', label: 'MVP', description: 'Minimum viable, essentiel uniquement', multiplier: 1 },
    { value: 'standard', label: 'Standard', description: 'Complet et professionnel', multiplier: 1.5 },
    { value: 'advanced', label: 'Avancé', description: 'Maximum de détails et fonctionnalités', multiplier: 2 },
];

// === SUGGESTIONS RAPIDES ===
export const QUICK_SUGGESTIONS = [
    'Crée-moi une app de gestion de tâches en React',
    'Cahier des charges pour une marketplace e-commerce',
    'Plan d\'action pour lancer un SaaS en 3 mois',
    'Architecture d\'une API e-commerce avec paiement',
    'Brainstorming features pour une app de fitness',
    'Documentation API pour un système de réservation',
    'Audit de performance d\'une app Next.js',
    'Application mobile de livraison avec suivi GPS',
    'Roadmap produit pour une fintech africaine',
    'Guide utilisateur pour un CRM simple',
];

// === HELPERS ===

export function buildCodePrompt(
    template: CodeTemplate,
    params: {
        topic: string;
        context?: string;
        stack?: string;
        complexity?: CodeComplexity;
    }
): string {
    const complexityLabels: Record<CodeComplexity, string> = {
        mvp: 'MVP — Essentiel uniquement, rapide à implémenter',
        standard: 'Standard — Complet, professionnel, production-ready',
        advanced: 'Avancé — Maximum de détails, fonctionnalités complètes, optimisé',
    };

    return template.promptTemplate
        .replace('{{topic}}', params.topic)
        .replace('{{context}}', params.context || 'Non spécifié')
        .replace('{{stack}}', params.stack || template.defaultStack || 'À déterminer selon le besoin')
        .replace('{{complexity}}', complexityLabels[params.complexity || template.defaultComplexity]);
}

export function calculateCodeCredits(
    template: CodeTemplate | null,
    complexity: CodeComplexity = 'standard'
): number {
    if (!template) return 1; // Mode rapide = 1 crédit
    const multiplier = COMPLEXITY_OPTIONS.find((o) => o.value === complexity)?.multiplier || 1;
    return Math.ceil(template.creditsBase * multiplier);
}

export function getTemplatesByCategory(category: CodeDeliverable): CodeTemplate[] {
    return CODE_TEMPLATES.filter((t) => t.category === category);
}
