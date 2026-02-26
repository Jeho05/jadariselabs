'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Generation } from '@/lib/types';
import {
    IconZap,
    IconPalette,
    IconChart,
    IconImage,
    IconChat,
    IconVideo,
    IconRocket,
    IconWave,
    IconInfinity,
    IconCrown,
    IconArrowRight,
    IconSparkle,
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
                {/* Welcome section */}
                <div className="dashboard-header animate-fade-in-up">
                    <h1 style={{ fontFamily: 'var(--font-heading)' }} className="flex items-center gap-2">
                        Bienvenue, {profile?.username || 'Utilisateur'}
                        <IconSparkle size={24} className="text-[var(--color-gold)]" />
                    </h1>
                    <p>Votre espace créatif IA est prêt</p>
                </div>

            {/* Stats cards */}
            <div className="stats-grid animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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
            <h2 className="section-title animate-fade-in-up" style={{ fontFamily: 'var(--font-heading)', animationDelay: '0.2s' }}>
                Modules IA
            </h2>
            <div className="modules-grid animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                {[
                    {
                        icon: IconImage,
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
                        className="module-card-premium"
                    >
                        <div className={`module-icon-premium ${module.color}`}>
                            <module.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{module.title}</h3>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full tag-${module.color}`}>
                                    {module.tag}
                                </span>
                            </div>
                            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                                {module.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent generations */}
            {recentGenerations.length > 0 && (
                <>
                    <h2 className="section-title animate-fade-in-up" style={{ fontFamily: 'var(--font-heading)', animationDelay: '0.3s' }}>
                        Dernières créations
                    </h2>
                    <div className="generations-grid animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                        {recentGenerations.map((gen, index) => (
                            <div key={gen.id} className="module-card-premium flex-col" style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                                <div className="flex items-center gap-3 mb-2">
                                    {gen.type === 'image' ? (
                                        <IconImage size={20} className="text-[var(--color-terracotta)]" />
                                    ) : gen.type === 'chat' ? (
                                        <IconChat size={20} className="text-[var(--color-savanna)]" />
                                    ) : gen.type === 'video' ? (
                                        <IconVideo size={20} className="text-[var(--color-gold)]" />
                                    ) : (
                                        <IconPalette size={20} className="text-[var(--color-earth)]" />
                                    )}
                                    <span className="text-xs text-[var(--color-text-muted)] capitalize">{gen.type}</span>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{gen.prompt}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {recentGenerations.length === 0 && (
                <div className="module-card-premium flex-col items-center justify-center text-center p-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="module-icon-premium terracotta mb-6 animate-float">
                        <IconRocket size={48} />
                    </div>
                    <p className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        Aucune création pour le moment
                    </p>
                    <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
                        Commencez par générer votre première image IA !
                    </p>
                    <Link href="/studio/image" className="btn-primary">
                        Créer ma première image
                        <IconArrowRight size={16} className="ml-2" />
                    </Link>
                </div>
            )}
            </div>
        </div>
    );
}
