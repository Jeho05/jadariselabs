interface StudioPageProps {
    params: Promise<{
        module: string;
    }>;
}

const MODULE_NAMES: Record<string, string> = {
    image: 'Génération d\'images 🖼️',
    chat: 'Chat IA 💬',
    video: 'Génération vidéo 🎬',
    audio: 'Génération audio 🎵',
    code: 'Assistant code 💻',
};

export default async function StudioPage({ params }: StudioPageProps) {
    const { module } = await params;
    const moduleName = MODULE_NAMES[module] || `Studio ${module}`;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                {moduleName}
            </h1>
            <div className="card p-8 text-center">
                <p className="text-4xl mb-3">
                    {module === 'image' ? '🖼️' : module === 'chat' ? '💬' : module === 'video' ? '🎬' : '🧪'}
                </p>
                <p className="font-semibold mb-1">Module en préparation</p>
                <p className="text-sm text-text-secondary">
                    Ce studio sera disponible bientôt.
                </p>
            </div>
        </div>
    );
}
