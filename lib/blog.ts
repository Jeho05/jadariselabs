export interface BlogPost {
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    thumbnail: string | null;
    author: string;
    authorRole: string;
    date: string;
    tags: string[];
    readingTime: string;
    content: string[];
    related: string[];
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'ia-pour-createurs-africains',
        title: 'L\'IA pour les créateurs africains : 5 usages qui changent la donne',
        subtitle: 'Comment les créateurs de contenu de Dakar à Douala utilisent déjà l\'IA pour créer plus, mieux et moins cher.',
        excerpt: 'Design, vidéo, audio, code : tour d\'horizon des usages concrets de l\'IA par les créateurs ouest-africains.',
        thumbnail: '/module-image-gen.jpg',
        author: 'Jada',
        authorRole: 'Fondateur & CEO',
        date: '2026-03-10',
        tags: ['Créateurs', 'Guide', 'Afrique'],
        readingTime: '6 min',
        content: [
            'Quand on pense "IA", on imagine souvent des start-ups californiennes. Mais sur le terrain, à Dakar, Abidjan ou Ouagadougou, l\'IA devient un outil de travail quotidien pour une nouvelle génération de créateurs.',
            'Premier usage : la génération d\'images. Un designer freelance qui recevait une demande de logo en urgence passe de plusieurs heures de travail à quelques minutes. Il génère des concepts variés, les présente à son client, puis peaufine la version retenue.',
            'Deuxième usage : la vidéo courte. Les plateformes comme TikTok récompensent la régularité. Avec un module vidéo IA, un créateur transforme une idée en clip de 5 secondes en moins de deux minutes — de quoi publier quotidiennement sans équipe.',
            'Troisième usage : la voix. Les podcasts et les vidéos YouTube demandent une voix off professionnelle. Le clonage vocal permet de générer des voix naturelles dans plus de 17 langues, y compris des langues africaines, sans studio ni micro coûteux.',
            'Quatrième usage : la rédaction. Propositions commerciales, posts LinkedIn, descriptions de produits : le chat IA rédige en français comme dans les langues locales, avec le ton que vous lui demandez.',
            'Cinquième usage : le code. Les développeurs du continent utilisent l\'agentic coding pour déboguer plus vite, comprendre des bibliothèques inconnues et automatiser les tâches répétitives.',
            'Le point commun de ces usages ? Ils ne remplacent personne : ils suppriment les tâches pénibles et laissent le temps à la créativité. C\'est exactement la philosophie de JadaRiseLabs.',
        ],
        related: ['generer-une-image-ia-francais', 'video-courte-tiktok'],
    },
    {
        slug: 'generer-une-image-ia-francais',
        title: 'Comment générer une image IA en français : le guide complet',
        subtitle: 'Prompt engineering accessible : nos meilleurs conseils pour obtenir des visuels parfaits avec JadaRiseLabs.',
        excerpt: 'Un bon prompt, c\'est 80% du résultat. Apprenez à formuler vos demandes en français pour des images qui vous ressemblent.',
        thumbnail: '/module-image-gen.jpg',
        author: 'Awa',
        authorRole: 'Design & Expérience',
        date: '2026-02-18',
        tags: ['Tutoriel', 'Images', 'Prompt'],
        readingTime: '8 min',
        content: [
            'La génération d\'images par IA a une réputation : "c\'est simple, on tape ce qu\'on veut". La réalité est plus nuancée — et c\'est une bonne nouvelle, car ceux qui maîtrisent le prompt obtiennent des résultats incomparables.',
            'Règle n°1 : soyez précis sur le sujet. "Une femme en boubou" est un début, mais "une jeune femme souriante portant un boubou brodé doré, studio photo, fond beige doux, éclairage naturel" décrit exactement l\'image que vous imaginez.',
            'Règle n°2 : décrivez le style. Photo réaliste, illustration, aquarelle, 3D cartoon ? Ajoutez un style et une ambiance : "photographie professionnelle, tons chauds, profondeur de champ".',
            'Règle n°3 : précisez les détails qui comptent. Pour un usage commercial, mentionnez le cadrage ("plan large", "portrait rapproché"), le format et ce que vous ne voulez pas voir.',
            'Règle n°4 : itérez. Le premier résultat n\'est presque jamais le bon. Affinez un mot à la fois : changez l\'éclairage, la palette, la position. Les meilleurs créateurs font 5 à 10 itérations.',
            'Règle n°5 : réutilisez vos réussites. Conservez les prompts qui fonctionnent et créez votre bibliothèque personnelle de "recettes". C\'est votre style, votre signature.',
            'Chez JadaRiseLabs, le prompt se fait en français — pas besoin de passer par l\'anglais. Nos modèles comprennent vos descriptions naturelles : testez, affinez, créez.',
        ],
        related: ['ia-pour-createurs-africains', 'video-courte-tiktok'],
    },
    {
        slug: 'video-courte-tiktok',
        title: 'Vidéos courtes : 3 formules IA pour publier chaque jour',
        subtitle: 'La régularité est la clé des réseaux sociaux. Voici comment produire des clips quotidiens avec l\'IA.',
        excerpt: 'Teaser produit, storytelling, réaction : trois formats de vidéo courte que vous pouvez produire quotidiennement grâce à l\'IA.',
        thumbnail: '/module-video.jpg',
        author: 'Moussa',
        authorRole: 'Ingénierie IA',
        date: '2026-01-25',
        tags: ['Vidéo', 'TikTok', 'Stratégie'],
        readingTime: '5 min',
        content: [
            'Les algorithmes des réseaux sociaux ont un point commun : ils récompensent la régularité. Publier chaque jour est le levier le plus puissant pour grandir — mais produire un contenu par jour reste un défi logistique.',
            'Formule n°1 : le teaser produit. Transformez votre produit ou service en clip de 5 secondes : un objet, un résultat, un avant-après. L\'IA génère la séquence, vous ajoutez la musique et le texte.',
            'Formule n°2 : le storytelling visuel. Décrivez une scène — "un créateur à Dakar reçoit son premier grand contrat, vue du marché de Sandaga au lever du soleil" — et obtenez une vidéo qui raconte une histoire. L\'émotion retient le spectateur.',
            'Formule n°3 : la transformation. Les contenus "avant/après" génèrent de l\'engagement massif. Faites générer une scène par l\'IA, puis montrez le résultat final de votre travail : votre audience verra la magie opérer.',
            'Conseil de production : gardez une identité visuelle constante (palette de couleurs, typographie, musique). L\'IA accélère la production, mais la cohérence, c\'est vous.',
            'Avec le plan Starter de JadaRiseLabs, 200 crédits mensuels suffisent pour produire plus de 30 clips : une vidéo courte par jour, en moyenne, pour moins de 500 F CFA par mois.',
        ],
        related: ['ia-pour-createurs-africains', 'generer-une-image-ia-francais'],
    },
    {
        slug: 'mobile-money-ia-accessibilite',
        title: 'Pourquoi le Mobile Money change tout pour l\'IA en Afrique',
        subtitle: 'Orange Money, Wave, MTN MoMo : l\'accès aux outils premium passe enfin par les moyens de paiement locaux.',
        excerpt: 'Sans carte bancaire internationale, l\'IA était hors de portée. Le paiement Mobile Money ouvre la voie à des millions de créateurs.',
        thumbnail: null,
        author: 'Jada',
        authorRole: 'Fondateur & CEO',
        date: '2025-12-05',
        tags: ['Paiement', 'Mobile Money', 'Vision'],
        readingTime: '4 min',
        content: [
            'Pendant des années, utiliser l\'IA de pointe exigeait une carte bancaire internationale et un abonnement facturé en dollars. Pour des millions d\'Africains — souvent plus connectés qu\'on ne le croit — c\'était une porte fermée.',
            'Le Mobile Money a changé la donne. Orange Money, Wave, MTN MoMo et Moov Money sont devenus les premiers moyens de paiement de toute une génération : rapides, sans banque, utilisables au quotidien.',
            'Notre pari chez JadaRiseLabs était simple : si l\'IA est un outil de développement, elle doit se payer comme les autres outils du quotidien — en F CFA, via Mobile Money.',
            'Les résultats dépassent nos attentes. Plus de 80% de nos abonnés payants utilisent le Mobile Money. Des étudiants, des artisans, des créateurs qui n\'avaient jamais acheté un abonnement numérique en ligne.',
            'Cette accessibilité transforme l\'usage : quand l\'IA coûte moins qu\'un crédit de communication, elle devient un outil de travail, pas un luxe. C\'est exactement l\'avenir que nous voulons construire.',
            'Et demain ? Nous travaillons à étendre les moyens de paiement à d\'autres pays et à des solutions de facturation adaptées aux petits budgets — parce que la créativité n\'attend pas la fin du mois.',
        ],
        related: ['ia-pour-createurs-africains', 'video-courte-tiktok'],
    },
];

export function getAllPosts(): BlogPost[] {
    return BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
    return post.related
        .map((slug) => BLOG_POSTS.find((p) => p.slug === slug))
        .filter((p): p is BlogPost => Boolean(p));
}

export function formatPostDate(date: string): string {
    return new Date(date + 'T00:00:00Z').toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}