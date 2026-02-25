'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Generation } from '@/lib/types';
import {
    IconZap,
    IconPalette,
    IconChart,
    ImageIcon,
    IconChat,
    IconVideo,
    IconRocket,
    IconWave,
    IconInfinity,
    IconCrown,
    IconArrowRight,
} from '@/components/icons';

/**
 * Dashboard Page - Modern Design with African Identity
 */
export default function DashboardPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) setProfile(profileData);

                // Fetch recent generations (last 5)
                const { data: generationsData } = await supabase
                    .from('generations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (generationsData) setRecentGenerations(generationsData);
            }

            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    if (loading) {
        return (
            <div className="dashboard-container">
                {/* Skeleton loading */}
                <div className="dashboard-header">
                    <div className="skeleton h-8 w-64 mb-2 rounded-lg" />
                    <div className="skeleton h-5 w-48 rounded-lg" />
                </div>
                <div className="stats-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-24 rounded-xl" />
                    ))}
                </div>
                <div className="modules-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-28 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const getPlanDisplay = (plan: string) => {
        if (plan === 'free') return 'Gratuit';
        if (plan === 'starter') return 'Starter';
        return 'Pro';
    };

    return (
        <div className="dashboard-container">
            {/* Welcome section */}
            <div className="dashboard-header">
                <h1 style={{ fontFamily: 'var(--font-heading)' }}>
                    Bienvenue, {profile?.username || 'Utilisateur'}
                </h1>
                <p>Votre espace créatif IA est prêt</p>
            </div>

            {/* Stats cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon gold">
                        <IconZap size={24} />
                    </div>
                    <div>
                        <p className="stat-value">
                            {profile?.credits === -1 ? (
                                <IconInfinity size={28} />
                            ) : (
                                profile?.credits ?? 0
                            )}
                        </p>
                        <p className="stat-label">Crédits restants</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon savanna">
                        <IconPalette size={24} />
                    </div>
                    <div>
                        <p className="stat-value">{recentGenerations.length}</p>
                        <p className="stat-label">Générations récentes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon earth">
                        {profile?.plan === 'pro' ? (
                            <IconCrown size={24} />
                        ) : (
                            <IconChart size={24} />
                        )}
                    </div>
                    <div>
                        <p className="stat-value capitalize">
                            {getPlanDisplay(profile?.plan || 'free')}
                        </p>
                        <p className="stat-label">Votre plan</p>
                    </div>
                </div>
            </div>

            {/* Module Cards */}
            <h2 className="section-title" style={{ fontFamily: 'var(--font-heading)' }}>
                Modules IA
            </h2>
            <div className="modules-grid">
                {[
                    {
                        icon: ImageIcon,
                        title: 'Génération d\'images',
                        description: 'Créez des images à partir de texte avec FLUX & SDXL',
                        href: '/studio/image',
                        color: 'terracotta',
                        tag: 'P1',
                    },
                    {
                        icon: IconChat,
                        title: 'Chat IA',
                        description: 'Assistant intelligent propulsé par LLaMA 3.3',
                        href: '/studio/chat',
                        color: 'savanna',
                        tag: 'P1',
                    },
                    {
                        icon: IconVideo,
                        title: 'Génération vidéo',
                        description: 'Créez des courtes vidéos à partir de prompts',
                        href: '/studio/video',
                        color: 'gold',
                        tag: 'P2',
                    },
                ].map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        className="module-card"
                    >
                        <div className={`module-icon ${module.color}`}>
                            <module.icon size={24} />
                        </div>
                        <div className="module-content">
                            <div className="module-header">
                                <h3 className="module-title">{module.title}</h3>
                                <span className="module-tag">{module.tag}</span>
                            </div>
                            <p className="module-description">{module.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent generations */}
            {recentGenerations.length > 0 && (
                <>
                    <h2 className="section-title" style={{ fontFamily: 'var(--font-heading)' }}>
                        Dernières créations
                    </h2>
                    <div className="generations-grid">
                        {recentGenerations.map((gen, index) => (
                            <div key={gen.id} className="generation-card" style={{ animationDelay: `${0.45 + index * 0.05}s` }}>
                                <div className="generation-preview">
                                    {gen.type === 'image' ? (
                                        <ImageIcon size={24} className="text-terracotta" />
                                    ) : gen.type === 'chat' ? (
                                        <IconChat size={24} className="text-savanna" />
                                    ) : gen.type === 'video' ? (
                                        <IconVideo size={24} className="text-gold" />
                                    ) : (
                                        <IconPalette size={24} className="text-earth" />
                                    )}
                                </div>
                                <p className="generation-prompt">{gen.prompt}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {recentGenerations.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <IconRocket size={48} />
                    </div>
                    <p className="empty-title">Aucune création pour le moment</p>
                    <p className="empty-description">
                        Commencez par générer votre première image IA !
                    </p>
                    <Link href="/studio/image" className="btn-auth">
                        Créer ma première image
                        <IconArrowRight size={16} className="ml-2" />
                    </Link>
                </div>
            )}
        </div>
    );
}
