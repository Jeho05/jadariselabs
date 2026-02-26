import { IconPalette, IconChat, IconVideo, IconMusic, IconCode, IconSparkle } from '@/components/icons';

interface StudioPageProps {
    params: Promise<{
        module: string;
    }>;
}

const MODULE_CONFIG: Record<string, { name: string; icon: React.ComponentType<{ className?: string; size?: number }>; color: string; description: string; image: string }> = {
    image: { 
        name: 'Génération d\'images', 
        icon: IconPalette, 
        color: 'terracotta',
        description: 'Transformez vos idées en images époustouflantes avec FLUX et SDXL.',
        image: '/module-image-gen.jpg'
    },
    chat: { 
        name: 'Chat IA', 
        icon: IconChat, 
        color: 'savanna',
        description: 'Assistant intelligent pour le copywriting, la traduction et plus.',
        image: '/hero-ai-tech.jpg'
    },
    video: { 
        name: 'Génération vidéo', 
        icon: IconVideo, 
        color: 'gold',
        description: 'Créez des vidéos à partir de texte pour vos réseaux sociaux.',
        image: '/module-video.jpg'
    },
    audio: { 
        name: 'Génération audio', 
        icon: IconMusic, 
        color: 'terracotta',
        description: 'Musique, voix off, jingles - créez du contenu audio professionnel.',
        image: '/hero-ai-tech.jpg'
    },
    code: { 
        name: 'Assistant code', 
        icon: IconCode, 
        color: 'savanna',
        description: 'Aide au développement, débogage et refactoring avec l\'IA.',
        image: '/hero-ai-tech.jpg'
    },
};

export default async function StudioPage({ params }: StudioPageProps) {
    const { module } = await params;
    const config = MODULE_CONFIG[module] || { 
        name: `Studio ${module}`, 
        icon: IconSparkle, 
        color: 'earth',
        description: 'Module en développement.',
        image: '/hero-ai-tech.jpg'
    };
    const IconComponent = config.icon;

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background Pattern */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            
            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-gold)]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-20 w-60 h-60 bg-[var(--color-terracotta)]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
                    <div className={`module-icon-premium ${config.color}`}>
                        <IconComponent size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                            {config.name}
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-sm">{config.description}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left - Coming Soon Card */}
                    <div className="module-card-premium flex-col items-center justify-center text-center p-12" style={{ animationDelay: '0.1s' }}>
                        <div className={`module-icon-premium ${config.color} mb-6 animate-float`}>
                            <IconComponent size={48} />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Module en préparation
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
                            Ce studio sera disponible très bientôt. Nous travaillons activement pour vous offrir la meilleure expérience possible.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-gold)]">
                            <IconSparkle size={16} />
                            <span>Bientôt disponible</span>
                        </div>
                    </div>

                    {/* Right - Preview Card */}
                    <div className="module-card-premium flex-col overflow-hidden p-0" style={{ animationDelay: '0.2s' }}>
                        <div className="relative h-48 w-full">
                            <img 
                                src={config.image}
                                alt={config.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold mb-2">Aperçu des fonctionnalités</h3>
                            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-savanna)]" />
                                    Interface intuitive et moderne
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-terracotta)]" />
                                    Résultats en quelques secondes
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                                    Historique de vos créations
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-earth)]" />
                                    Export en haute qualité
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
