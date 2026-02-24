'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Generation } from '@/lib/types';

/**
 * Dashboard Page (Day 2 placeholder with basic auth integration)
 * Full dashboard UI will be built on Day 4-5
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Skeleton loading */}
                <div className="skeleton h-8 w-64 mb-2 rounded-lg" />
                <div className="skeleton h-5 w-48 mb-8 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {/* Welcome section */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                    Bienvenue, {profile?.username || 'Utilisateur'} 👋
                </h1>
                <p className="text-text-secondary mt-1">
                    Votre espace créatif IA est prêt
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-xl">
                        ⚡
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-primary">
                            {profile?.credits === -1 ? '∞' : profile?.credits ?? 0}
                        </p>
                        <p className="text-sm text-text-secondary">Crédits restants</p>
                    </div>
                </div>

                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-savanna/10 flex items-center justify-center text-xl">
                        🎨
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-primary">
                            {recentGenerations.length}
                        </p>
                        <p className="text-sm text-text-secondary">Générations récentes</p>
                    </div>
                </div>

                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-earth/10 flex items-center justify-center text-xl">
                        📊
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-primary capitalize">
                            {profile?.plan === 'free' ? 'Gratuit' : profile?.plan === 'starter' ? 'Starter' : 'Pro'}
                        </p>
                        <p className="text-sm text-text-secondary">Votre plan</p>
                    </div>
                </div>
            </div>

            {/* Module Cards */}
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Modules IA
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                    {
                        icon: '🖼️',
                        title: 'Génération d\'images',
                        description: 'Créez des images à partir de texte avec FLUX & SDXL',
                        href: '/studio/image',
                        color: 'bg-terracotta/10',
                        tag: 'P1',
                    },
                    {
                        icon: '💬',
                        title: 'Chat IA',
                        description: 'Assistant intelligent propulsé par LLaMA 3.3',
                        href: '/studio/chat',
                        color: 'bg-savanna/10',
                        tag: 'P1',
                    },
                    {
                        icon: '🎬',
                        title: 'Génération vidéo',
                        description: 'Créez des courtes vidéos à partir de prompts',
                        href: '/studio/video',
                        color: 'bg-gold/10',
                        tag: 'P2',
                    },
                ].map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        className="card p-5 hover:scale-[1.02] transition-all duration-200 group"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center text-xl flex-shrink-0`}>
                                {module.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-text-primary group-hover:text-earth transition-colors">
                                        {module.title}
                                    </h3>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-earth/10 text-earth font-semibold">
                                        {module.tag}
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary">{module.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent generations */}
            {recentGenerations.length > 0 && (
                <>
                    <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                        Dernières créations
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {recentGenerations.map((gen) => (
                            <div key={gen.id} className="card p-3 text-center">
                                <div className="w-full aspect-square rounded-lg bg-cream-dark flex items-center justify-center text-2xl mb-2">
                                    {gen.type === 'image' ? '🖼️' : gen.type === 'chat' ? '💬' : gen.type === 'video' ? '🎬' : '🎵'}
                                </div>
                                <p className="text-xs text-text-secondary truncate">{gen.prompt}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {recentGenerations.length === 0 && (
                <div className="card p-8 text-center">
                    <p className="text-4xl mb-3">🚀</p>
                    <p className="font-semibold mb-1">Aucune création pour le moment</p>
                    <p className="text-sm text-text-secondary mb-4">
                        Commencez par générer votre première image IA !
                    </p>
                    <Link href="/studio/image" className="btn-primary inline-flex">
                        Créer ma première image
                    </Link>
                </div>
            )}
        </div>
    );
}
