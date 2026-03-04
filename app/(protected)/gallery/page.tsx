'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Generation, Profile } from '@/lib/types';
import {
    IconPalette,
    IconImage,
    IconChat,
    IconVideo,
    IconTrash,
    IconDownload,
    IconSparkle,
    IconSearch,
    IconClose,
    IconAlertCircle,
} from '@/components/icons';
import ShareButtons from '@/components/share-buttons';

type FilterType = 'all' | 'image' | 'chat' | 'video';

const FILTER_OPTIONS: { id: FilterType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'all', label: 'Tout', icon: IconSparkle },
    { id: 'image', label: 'Images', icon: IconImage },
    { id: 'chat', label: 'Chat', icon: IconChat },
    { id: 'video', label: 'Vidéos', icon: IconVideo },
];

export default function GalleryPage() {
    const supabase = createClient();

    const [generations, setGenerations] = useState<Generation[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch generations
    useEffect(() => {
        const fetchGenerations = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile for plan info
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (profileData) setProfile(profileData);

            const { data, error: fetchError } = await supabase
                .from('generations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Gallery fetch error:', fetchError);
                setError('Impossible de charger vos créations.');
            } else {
                setGenerations(data || []);
            }
            setLoading(false);
        };

        fetchGenerations();
    }, [supabase]);

    // Filtered and searched generations
    const filteredGenerations = useMemo(() => {
        let result = generations;

        // Filter by type
        if (filter !== 'all') {
            result = result.filter(g => g.type === filter);
        }

        // Search by prompt
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(g => g.prompt.toLowerCase().includes(query));
        }

        return result;
    }, [generations, filter, searchQuery]);

    // Delete generation
    const handleDelete = useCallback(async (id: string) => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setGenerations(prev => prev.filter(g => g.id !== id));
                setDeleteId(null);
                if (expandedId === id) setExpandedId(null);
            } else {
                const data = await res.json();
                setError(data.error || 'Erreur lors de la suppression');
            }
        } catch {
            setError('Erreur réseau');
        }
        setDeleting(false);
    }, [expandedId]);

    // Download
    const handleDownload = (url: string, type: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `jadarise-${type}-${Date.now()}.${type === 'video' ? 'mp4' : 'png'}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Type badge
    const getTypeBadge = (type: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            image: { label: 'Image', color: 'terracotta' },
            chat: { label: 'Chat', color: 'savanna' },
            video: { label: 'Vidéo', color: 'gold' },
            audio: { label: 'Audio', color: 'earth' },
            code: { label: 'Code', color: 'savanna' },
        };
        return badges[type] || { label: type, color: 'earth' };
    };

    // Stats
    const stats = useMemo(() => ({
        total: generations.length,
        images: generations.filter(g => g.type === 'image').length,
        chats: generations.filter(g => g.type === 'chat').length,
        videos: generations.filter(g => g.type === 'video').length,
    }), [generations]);

    if (loading) {
        return (
            <div className="gallery-page">
                <div className="gallery-loading">
                    <div className="gallery-loading-grid">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="gallery-skeleton-card">
                                <div className="skeleton gallery-skeleton-img" />
                                <div className="gallery-skeleton-info">
                                    <div className="skeleton h-4 w-3/4 rounded" />
                                    <div className="skeleton h-3 w-1/2 rounded mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-page">
            {/* Background */}
            <div className="gallery-bg">
                <div className="gallery-bg-orb orb-1" />
                <div className="gallery-bg-orb orb-2" />
                <div className="gallery-bg-orb orb-3" />
            </div>

            <div className="gallery-content">
                {/* Header */}
                <div className="gallery-header">
                    <div className="gallery-header-left">
                        <div className="module-icon-premium terracotta">
                            <IconPalette size={28} />
                        </div>
                        <div>
                            <h1>Ma Galerie</h1>
                            <p>Vos créations IA en un coup d&apos;œil — {stats.total} création{stats.total !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="gallery-stats">
                        <span className="gallery-stat"><IconImage size={14} /> {stats.images}</span>
                        <span className="gallery-stat"><IconChat size={14} /> {stats.chats}</span>
                        <span className="gallery-stat"><IconVideo size={14} /> {stats.videos}</span>
                    </div>
                </div>

                {/* Toolbar: Filters + Search */}
                <div className="gallery-toolbar">
                    <div className="gallery-filters">
                        {FILTER_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    className={`gallery-filter-btn ${filter === opt.id ? 'active' : ''}`}
                                    onClick={() => setFilter(opt.id)}
                                >
                                    <Icon size={16} />
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="gallery-search">
                        <IconSearch size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par prompt..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="gallery-search-input"
                        />
                        {searchQuery && (
                            <button className="gallery-search-clear" onClick={() => setSearchQuery('')}>
                                <IconClose size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="gallery-error">
                        <IconAlertCircle size={18} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {/* Gallery Grid */}
                {filteredGenerations.length === 0 ? (
                    <div className="gallery-empty">
                        <div className="gallery-empty-icon">
                            <IconPalette size={56} />
                        </div>
                        {generations.length === 0 ? (
                            <>
                                <h2>Aucune création</h2>
                                <p>Commencez à générer du contenu pour remplir votre galerie personnelle.</p>
                                <div className="gallery-empty-actions">
                                    <a href="/studio/image" className="btn-primary">🎨 Créer une image</a>
                                    <a href="/studio/chat" className="btn-secondary">💬 Ouvrir le chat</a>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>Aucun résultat</h2>
                                <p>Aucune création ne correspond à vos filtres. Essayez de modifier votre recherche.</p>
                                <button className="btn-secondary" onClick={() => { setFilter('all'); setSearchQuery(''); }}>
                                    Réinitialiser les filtres
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {filteredGenerations.map((gen, index) => {
                            const badge = getTypeBadge(gen.type);
                            const isExpanded = expandedId === gen.id;

                            return (
                                <div
                                    key={gen.id}
                                    className={`gallery-card ${isExpanded ? 'expanded' : ''}`}
                                    style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
                                >
                                    {/* Preview */}
                                    <div
                                        className="gallery-card-preview"
                                        onClick={() => setExpandedId(isExpanded ? null : gen.id)}
                                    >
                                        {gen.type === 'image' && gen.result_url ? (
                                            <img src={gen.result_url} alt={gen.prompt} loading="lazy" />
                                        ) : gen.type === 'video' && gen.result_url ? (
                                            <video src={gen.result_url} muted />
                                        ) : (
                                            <div className="gallery-card-text-preview">
                                                <p>{gen.prompt.substring(0, 120)}{gen.prompt.length > 120 ? '...' : ''}</p>
                                            </div>
                                        )}
                                        {/* Type badge */}
                                        <span className={`gallery-card-badge ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                        {/* Watermark indicator for free plan */}
                                        {profile?.plan === 'free' && gen.type === 'image' && (
                                            <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                Watermark
                                            </span>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="gallery-card-overlay">
                                            <IconSparkle size={24} />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="gallery-card-info">
                                        <p className="gallery-card-prompt">{gen.prompt}</p>
                                        <div className="gallery-card-meta">
                                            <span>{formatDate(gen.created_at)}</span>
                                            <span>{gen.credits_used} cr.</span>
                                        </div>
                                    </div>

                                    {/* Actions (visible on hover or expanded) */}
                                    <div className={`gallery-card-actions ${isExpanded ? 'visible' : ''}`}>
                                        {gen.result_url && (
                                            <button
                                                className="gallery-action-btn"
                                                onClick={() => handleDownload(gen.result_url!, gen.type)}
                                                title={profile?.plan === 'free' ? 'Télécharger (SD)' : 'Télécharger (HD)'}
                                            >
                                                <IconDownload size={16} />
                                                <span className="text-[10px] ml-1">
                                                    {profile?.plan === 'free' ? 'SD' : 'HD'}
                                                </span>
                                            </button>
                                        )}
                                        <button
                                            className="gallery-action-btn danger"
                                            onClick={() => setDeleteId(gen.id)}
                                            title="Supprimer"
                                        >
                                            <IconTrash size={16} />
                                        </button>
                                    </div>

                                    {/* Expanded view with share */}
                                    {isExpanded && gen.result_url && (
                                        <div className="gallery-card-share">
                                            <ShareButtons
                                                title={`Créé avec JadaRiseLabs : "${gen.prompt.substring(0, 50)}"`}
                                                url={gen.result_url}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="gallery-modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
                    <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Supprimer cette création ?</h3>
                        <p>Cette action est irréversible. La création sera définitivement supprimée.</p>
                        <div className="gallery-modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setDeleteId(null)}
                                disabled={deleting}
                            >
                                Annuler
                            </button>
                            <button
                                className="gallery-modal-delete-btn"
                                onClick={() => handleDelete(deleteId)}
                                disabled={deleting}
                            >
                                {deleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
