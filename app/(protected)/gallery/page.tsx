import { IconPalette, IconSparkle, IconImage } from '@/components/icons';

export default function GalleryPage() {
    // Placeholder gallery items
    const galleryItems = [
        { id: 1, type: 'image', title: 'Portrait africain', date: '2024-01-15' },
        { id: 2, type: 'image', title: 'Paysage savane', date: '2024-01-14' },
        { id: 3, type: 'image', title: 'Art abstrait', date: '2024-01-13' },
        { id: 4, type: 'image', title: 'Logo moderne', date: '2024-01-12' },
        { id: 5, type: 'image', title: 'Illustration digital', date: '2024-01-11' },
        { id: 6, type: 'image', title: 'Design UI', date: '2024-01-10' },
    ];

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
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[var(--color-savanna)]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium terracotta">
                            <IconPalette size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                                Ma Galerie
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                                Vos créations IA en un coup d&apos;œil
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <IconImage size={16} />
                        <span>{galleryItems.length} créations</span>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="module-card-premium flex-col p-0 overflow-hidden group cursor-pointer"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Image Placeholder */}
                            <div className="relative aspect-square bg-gradient-to-br from-[var(--color-terracotta)]/20 via-[var(--color-gold)]/20 to-[var(--color-savanna)]/20">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <IconImage size={32} className="text-[var(--color-earth)]/30" />
                                </div>
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-[var(--color-earth)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <IconSparkle size={24} className="text-white" />
                                </div>
                            </div>
                            {/* Info */}
                            <div className="p-3 sm:p-4">
                                <p className="font-medium text-sm truncate">{item.title}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">{item.date}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State (hidden when items exist) */}
                {galleryItems.length === 0 && (
                    <div className="module-card-premium flex-col items-center justify-center text-center p-12">
                        <div className="module-icon-premium terracotta mb-6 animate-float">
                            <IconPalette size={48} />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Aucune création
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
                            Commencez à générer des images pour remplir votre galerie personnelle.
                        </p>
                        <a href="/studio/image" className="btn-primary">
                            Créer ma première image
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
