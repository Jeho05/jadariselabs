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
    IconTrendingUp,
    IconClock,
    IconStar,
} from '@/components/icons';

/**
 * Dashboard Page - Premium Design with African Identity
 */
export default function DashboardPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
    const [totalGenerations, setTotalGenerations] = useState<number>(0);
    const [moduleStats, setModuleStats] = useState<{ type: string; count: number }[]>([]);
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

                // Fetch total generations for stats
                const { data: allGenerations } = await supabase
                    .from('generations')
                    .select('type')
                    .eq('user_id', user.id);

                if (allGenerations) {
                    setTotalGenerations(allGenerations.length);

                    // Calculate module stats
                    const stats = allGenerations.reduce((acc, curr) => {
                        const existing = acc.find(item => item.type === curr.type);
                        if (existing) {
                            existing.count++;
                        } else {
                            acc.push({ type: curr.type, count: 1 });
                        }
                        return acc;
                    }, [] as { type: string; count: number }[]);

                    // Sort by count descending
                    stats.sort((a, b) => b.count - a.count);
                    setModuleStats(stats);
                }
            }

            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
                {/* Background Pattern */}
                <div
                    className="fixed inset-0 pointer-events-none opacity-[0.03]"
                    style={{ 
                        backgroundImage: 'url(/pattern-african.svg)', 
                        backgroundRepeat: 'repeat',
                        animation: 'parallax-float 20s linear infinite'
                    }}
                />
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                    {/* Skeleton loading */}
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-64 bg-[var(--color-cream-dark)] rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-[var(--color-cream-dark)] rounded-2xl" />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-40 bg-[var(--color-cream-dark)] rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getPlanDisplay = (plan: string) => {
        if (plan === 'free') return 'Gratuit';
        if (plan === 'starter') return 'Starter';
        return 'Pro';
    };

    const modules = [
        {
            icon: IconImage,
            title: 'Génération d\'images',
            description: 'Créez des images époustouflantes avec FLUX & SDXL',
            href: '/studio/image',
            color: 'terracotta',
            tag: 'POPULAIRE',
            gradient: 'from-[var(--color-terracotta)] to-[var(--color-terracotta-light)]',
        },
        {
            icon: IconChat,
            title: 'Chat IA',
            description: 'Assistant intelligent propulsé par LLaMA 3.3 70B',
            href: '/studio/chat',
            color: 'savanna',
            tag: 'NOUVEAU',
            gradient: 'from-[var(--color-savanna)] to-[var(--color-savanna-light)]',
        },
        {
            icon: IconVideo,
            title: 'Génération vidéo',
            description: 'Transformez vos idées en vidéos créatives',
            href: '/studio/video',
            color: 'gold',
            tag: 'BÊTA',
            gradient: 'from-[var(--color-gold)] to-[var(--color-gold-light)]',
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ 
                    backgroundImage: 'url(/pattern-african.svg)', 
                    backgroundRepeat: 'repeat',
                    animation: 'parallax-float 20s linear infinite'
                }}
            />

            {/* Premium Floating Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="orb orb-gold w-96 h-96 -top-48 -right-48" />
                <div className="orb orb-terracotta w-80 h-80 top-1/3 -left-40" />
                <div className="orb orb-savanna w-64 h-64 bottom-1/4 right-1/3" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 lg:py-12">
                {/* Welcome Section */}
                <div className="mb-10 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[var(--color-savanna)]/10 border border-[var(--color-savanna)]/20 rounded-full px-4 py-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-savanna)] animate-pulse" />
                                <span className="text-[var(--color-savanna-dark)] text-sm font-medium">
                                    Espace créatif
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                Bienvenue, <span className="text-gradient-animated">{profile?.username || 'Utilisateur'}</span>
                                <IconSparkle size={32} className="inline ml-2 text-[var(--color-gold)]" />
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-lg">
                                Votre laboratoire IA est prêt à créer
                            </p>
                        </div>
                        <Link 
                            href="/studio/image" 
                            className="btn-cta-premium group inline-flex items-center"
                        >
                            <span>Commencer à créer</span>
                            <IconRocket size={18} className="ml-2 group-hover:animate-bounce" />
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 stagger-container">
                    {/* Credits Card */}
                    <div className="stat-card-premium hover-lift" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center shadow-lg">
                                <IconZap size={28} className="text-white" />
                            </div>
                            <div className="flex items-center gap-1 text-[var(--color-savanna)] text-sm font-medium">
                                <IconTrendingUp size={16} />
                                <span>Actif</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-[var(--color-text-primary)] mb-1">
                                {profile?.credits === -1 ? (
                                    <IconInfinity size={36} className="text-[var(--color-gold)]" />
                                ) : (
                                    <span className="text-gradient">{profile?.credits ?? 0}</span>
                                )}
                            </p>
                            <p className="text-[var(--color-text-muted)] text-sm">Crédits restants</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-text-muted)]">Recharge automatique</span>
                                <span className="text-[var(--color-savanna)] font-medium">Activée</span>
                            </div>
                        </div>
                    </div>

                    {/* Generations Card */}
                    <div className="stat-card-premium hover-lift" style={{ animationDelay: '0.15s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-savanna)] to-[var(--color-savanna-dark)] flex items-center justify-center shadow-lg">
                                <IconPalette size={28} className="text-white" />
                            </div>
                            <div className="flex items-center gap-1 text-[var(--color-gold)] text-sm font-medium">
                                <IconStar size={16} />
                                <span>+{totalGenerations > 0 ? Math.min(totalGenerations, 50) : 0} ce mois</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-gradient mb-1">{totalGenerations}</p>
                            <p className="text-[var(--color-text-muted)] text-sm">Générations totales</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <div className="w-full bg-[var(--color-cream-dark)] rounded-full h-2 overflow-hidden">
                                <div 
                                    className="h-2 rounded-full bg-gradient-to-r from-[var(--color-savanna)] to-[var(--color-gold)] transition-all duration-1000"
                                    style={{ width: `${Math.min(totalGenerations / 10 * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plan Card */}
                    <div className="stat-card-premium hover-lift" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                profile?.plan === 'pro' 
                                    ? 'bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-earth-dark)]' 
                                    : 'bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-terracotta-dark)]'
                            }`}>
                                {profile?.plan === 'pro' ? (
                                    <IconCrown size={28} className="text-white" />
                                ) : (
                                    <IconChart size={28} className="text-white" />
                                )}
                            </div>
                            {profile?.plan !== 'pro' && (
                                <Link 
                                    href="/pricing" 
                                    className="text-xs font-semibold text-[var(--color-earth)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1"
                                >
                                    Upgrade <IconArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-[var(--color-text-primary)] mb-1 capitalize">
                                {getPlanDisplay(profile?.plan || 'free')}
                            </p>
                            <p className="text-[var(--color-text-muted)] text-sm">Votre plan</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center gap-2">
                                {profile?.plan === 'pro' ? (
                                    <span className="text-xs font-medium text-[var(--color-gold)]">✨ Accès illimité</span>
                                ) : (
                                    <span className="text-xs text-[var(--color-text-muted)]">Passez Pro pour plus</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module Cards */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                            Modules IA
                        </h2>
                        <Link 
                            href="/studio" 
                            className="text-sm font-medium text-[var(--color-earth)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1"
                        >
                            Voir tout <IconArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-container">
                        {modules.map((module, index) => (
                            <Link
                                key={module.href}
                                href={module.href}
                                className="gradient-border-card group"
                                style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                            >
                                <div className="bg-white rounded-[calc(1.25rem-2px)] p-6 h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            <module.icon size={28} className="text-white" />
                                        </div>
                                        <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full tag-${module.color}`}>
                                            {module.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-earth)] transition-colors">
                                        {module.title}
                                    </h3>
                                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
                                        {module.description}
                                    </p>
                                    <div className="flex items-center text-[var(--color-earth)] font-medium text-sm group-hover:gap-3 transition-all">
                                        <span>Accéder</span>
                                        <IconArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Module Stats */}
                {totalGenerations > 0 && (
                    <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                            Vos outils favoris
                        </h2>
                        <div className="glass-card-premium rounded-2xl p-6 lg:p-8">
                            <div className="space-y-6">
                                {moduleStats.map((stat, index) => {
                                    const percentage = Math.round((stat.count / totalGenerations) * 100);
                                    const getModuleColor = (type: string) => {
                                        switch (type) {
                                            case 'image': return { bg: 'bg-[var(--color-terracotta)]', text: 'text-[var(--color-terracotta)]', gradient: 'from-[var(--color-terracotta)] to-[var(--color-terracotta-light)]' };
                                            case 'chat': return { bg: 'bg-[var(--color-savanna)]', text: 'text-[var(--color-savanna)]', gradient: 'from-[var(--color-savanna)] to-[var(--color-savanna-light)]' };
                                            case 'video': return { bg: 'bg-[var(--color-gold)]', text: 'text-[var(--color-gold)]', gradient: 'from-[var(--color-gold)] to-[var(--color-gold-light)]' };
                                            default: return { bg: 'bg-[var(--color-earth)]', text: 'text-[var(--color-earth)]', gradient: 'from-[var(--color-earth)] to-[var(--color-earth-light)]' };
                                        }
                                    };
                                    const getModuleLabel = (type: string) => {
                                        switch (type) {
                                            case 'image': return 'Génération d\'images';
                                            case 'chat': return 'Chat IA';
                                            case 'video': return 'Génération vidéo';
                                            default: return type;
                                        }
                                    };
                                    const colors = getModuleColor(stat.type);

                                    return (
                                        <div key={stat.type} className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-sm font-semibold ${colors.text}`}>
                                                    {getModuleLabel(stat.type)}
                                                </span>
                                                <span className="text-sm font-bold text-[var(--color-text-primary)]">
                                                    {stat.count} créations
                                                </span>
                                            </div>
                                            <div className="relative w-full bg-[var(--color-cream-dark)] rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-3 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-1000 progress-shimmer`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-[var(--color-text-muted)]">{percentage}% d'utilisation</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent generations */}
                {recentGenerations.length > 0 && (
                    <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                                Dernières créations
                            </h2>
                            <Link 
                                href="/gallery" 
                                className="text-sm font-medium text-[var(--color-earth)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1"
                            >
                                Voir la galerie <IconArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-container">
                            {recentGenerations.map((gen, index) => {
                                const getTypeStyle = (type: string) => {
                                    switch (type) {
                                        case 'image': return { icon: IconImage, color: 'terracotta', gradient: 'from-[var(--color-terracotta)] to-[var(--color-terracotta-light)]' };
                                        case 'chat': return { icon: IconChat, color: 'savanna', gradient: 'from-[var(--color-savanna)] to-[var(--color-savanna-light)]' };
                                        case 'video': return { icon: IconVideo, color: 'gold', gradient: 'from-[var(--color-gold)] to-[var(--color-gold-light)]' };
                                        default: return { icon: IconPalette, color: 'earth', gradient: 'from-[var(--color-earth)] to-[var(--color-earth-light)]' };
                                    }
                                };
                                const typeStyle = getTypeStyle(gen.type);

                                return (
                                    <div 
                                        key={gen.id} 
                                        className="glass-card-premium rounded-xl p-4 hover-lift"
                                        style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeStyle.gradient} flex items-center justify-center`}>
                                                <typeStyle.icon size={20} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-semibold text-[var(--color-${typeStyle.color})] capitalize`}>
                                                    {gen.type}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                                                    <IconClock size={12} />
                                                    <span>{new Date(gen.created_at).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                                            {gen.prompt}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {recentGenerations.length === 0 && (
                    <div className="glass-card-premium rounded-3xl p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="relative inline-block mb-8">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-terracotta)] to-[var(--color-gold)] flex items-center justify-center animate-float shadow-premium">
                                <IconRocket size={48} className="text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-savanna)] flex items-center justify-center animate-bounce">
                                <IconSparkle size={16} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                            Aucune création pour le moment
                        </h3>
                        <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto text-lg">
                            Commencez par générer votre première image IA et libérez votre créativité !
                        </p>
                        <Link href="/studio/image" className="btn-cta-premium inline-flex group">
                            <span>Créer ma première image</span>
                            <IconArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
