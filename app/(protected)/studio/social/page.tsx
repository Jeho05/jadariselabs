'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconMegaphone,
    IconZap,
    IconLoader2,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
    IconSparkles,
    IconTikTok,
    IconFacebook,
    IconMessageCircle,
    IconLinkedin,
    IconInstagram,
    IconRepeat,
    IconTrendingUp,
    IconClock,
    IconCheck,
    IconX,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import SocialShareButtons from '@/components/social-share-buttons';
import {
    PLATFORM_CONFIG,
    SUGGESTED_HASHTAGS,
    type PlatformType,
} from '@/lib/prompts/social-templates';

type PlatformKey = PlatformType;
type SocialPlatformId = PlatformType | 'x';
type SocialAccountSummary = {
    id: string;
    platform: SocialPlatformId;
    accountName: string | null;
    accountId: string;
    expiresAt: string | null;
};

const PLATFORMS: Array<{ id: PlatformKey; name: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bestTimes: string }> = [
    { id: 'tiktok', name: 'TikTok', icon: IconTikTok, color: 'from-pink-500 to-purple-600', bestTimes: '12h • 19h • 21h' },
    { id: 'facebook', name: 'Facebook', icon: IconFacebook, color: 'from-blue-500 to-blue-700', bestTimes: '9h • 13h • 15h' },
    { id: 'whatsapp', name: 'WhatsApp', icon: IconMessageCircle, color: 'from-green-500 to-green-600', bestTimes: '9h • 12h • 17h' },
    { id: 'linkedin', name: 'LinkedIn', icon: IconLinkedin, color: 'from-blue-600 to-blue-800', bestTimes: '8h • 12h • 17h' },
    { id: 'instagram', name: 'Instagram', icon: IconInstagram, color: 'from-purple-500 to-pink-500', bestTimes: '11h • 14h • 19h' },
];

const CONNECT_PLATFORMS: Array<{ id: SocialPlatformId; name: string; icon: React.ComponentType<{ size?: number; className?: string }>; enabled: boolean }> = [
    { id: 'linkedin', name: 'LinkedIn', icon: IconLinkedin, enabled: true },
    { id: 'x', name: 'X', icon: IconX, enabled: true },
    { id: 'tiktok', name: 'TikTok', icon: IconTikTok, enabled: true },
    { id: 'facebook', name: 'Facebook', icon: IconFacebook, enabled: false },
    { id: 'instagram', name: 'Instagram', icon: IconInstagram, enabled: false },
    { id: 'whatsapp', name: 'WhatsApp', icon: IconMessageCircle, enabled: false },
];

const TONE_OPTIONS = [
    { value: 'professionnel', label: 'Professionnel', emoji: '💼' },
    { value: 'authentique', label: 'Authentique', emoji: '🤝' },
    { value: 'dynamique', label: 'Dynamique', emoji: '⚡' },
    { value: 'humoristique', label: 'Humoristique', emoji: '😄' },
    { value: 'inspirant', label: 'Inspirant', emoji: '✨' },
];

const SECTOR_OPTIONS = [
    { value: 'general', label: 'Général', emoji: '🌐' },
    { value: 'business', label: 'Business', emoji: '💼' },
    { value: 'creative', label: 'Créatif', emoji: '🎨' },
    { value: 'education', label: 'Éducation', emoji: '📚' },
    { value: 'tech', label: 'Tech', emoji: '💻' },
    { value: 'food', label: 'Food/Restauration', emoji: '🍽️' },
    { value: 'fashion', label: 'Mode/Fashion', emoji: '👗' },
    { value: 'beauty', label: 'Beauté', emoji: '💄' },
];

export default function SocialStudioPage() {
    const supabase = createClient();
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'studio' | 'autopilot'>('studio');

    const [schedulesLoading, setSchedulesLoading] = useState(false);
    const [scheduleId, setScheduleId] = useState<string | null>(null);
    const [scheduleEnabled, setScheduleEnabled] = useState(true);
    const [schedulePlatforms, setSchedulePlatforms] = useState<PlatformKey[]>(['tiktok', 'instagram', 'facebook', 'linkedin', 'whatsapp']);
    const [schedulePostsPerWeek, setSchedulePostsPerWeek] = useState(3);
    const [scheduleCreditsBudgetWeekly, setScheduleCreditsBudgetWeekly] = useState(10);

    const [scheduleTopic, setScheduleTopic] = useState('');
    const [scheduleContext, setScheduleContext] = useState('');
    const [scheduleTone, setScheduleTone] = useState('authentique');
    const [scheduleSector, setScheduleSector] = useState('general');
    const [scheduleAutoPublish, setScheduleAutoPublish] = useState(false);

    const [draftsLoading, setDraftsLoading] = useState(false);
    const [drafts, setDrafts] = useState<Array<any>>([]);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [accounts, setAccounts] = useState<SocialAccountSummary[]>([]);
    
    // Platform & options
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('tiktok');
    const [topic, setTopic] = useState('');
    const [context, setContext] = useState('');
    const [tone, setTone] = useState('professionnel');
    const [sector, setSector] = useState('general');
    const [multiVariant, setMultiVariant] = useState(false);
    
    // Generation state
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const fetchSchedules = async () => {
        setSchedulesLoading(true);
        try {
            const res = await fetch('/api/social/schedules');
            if (!res.ok) return;
            const data = await res.json();
            const first = data.schedules?.[0];
            if (!first) {
                setScheduleId(null);
                return;
            }
            setScheduleId(first.id);
            setScheduleEnabled(!!first.enabled);
            setSchedulePlatforms((first.platforms || []) as PlatformKey[]);
            setSchedulePostsPerWeek(Number(first.posts_per_week || 3));
            setScheduleCreditsBudgetWeekly(Number(first.credits_budget_weekly || 10));

            const cfg = (first.config || {}) as any;
            setScheduleTopic(String(cfg.topic || ''));
            setScheduleContext(String(cfg.context || ''));
            setScheduleTone(String(cfg.tone || 'authentique'));
            setScheduleSector(String(cfg.sector || 'general'));
            setScheduleAutoPublish(!!cfg.auto_publish);
        } finally {
            setSchedulesLoading(false);
        }
    };

    const fetchDrafts = async () => {
        setDraftsLoading(true);
        try {
            const res = await fetch('/api/social/drafts?status=draft');
            if (!res.ok) return;
            const data = await res.json();
            setDrafts(data.drafts || []);
        } finally {
            setDraftsLoading(false);
        }
    };

    const fetchAccounts = async () => {
        setAccountsLoading(true);
        try {
            const res = await fetch('/api/social/accounts');
            if (!res.ok) return;
            const data = await res.json();
            setAccounts(data.accounts || []);
        } finally {
            setAccountsLoading(false);
        }
    };

    const handleDisconnectAccount = async (id: string) => {
        await fetch(`/api/social/accounts/${id}`, { method: 'DELETE' });
        fetchAccounts();
    };

    useEffect(() => {
        if (!loading && activeTab === 'autopilot') {
            fetchSchedules();
            fetchDrafts();
            fetchAccounts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, loading]);

    useEffect(() => {
        if (!output) return;
        const container = outputRef.current?.parentElement;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, [output]);

    const platformConfig = PLATFORM_CONFIG[selectedPlatform];
    const platformInfo = PLATFORMS.find(p => p.id === selectedPlatform);

    const calculateCredits = () => {
        return multiVariant ? 2 : 1;
    };

    const handleGenerate = async () => {
        if (!topic.trim() || isStreaming) return;

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Il vous faut ${creditsNeeded} crédit(s).`);
            return;
        }

        setIsStreaming(true);
        setError(null);
        setOutput('');
        setCopied(false);

        try {
            const res = await fetch('/api/generate/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: selectedPlatform,
                    topic: topic.trim(),
                    context: context.trim(),
                    tone,
                    sector,
                    multiVariant,
                }),
            });

            if (!res.ok) {
                let data: any = null;
                try {
                    data = await res.json();
                } catch {
                    // ignore non-JSON errors
                }
                setError(data?.details || data?.error || 'Une erreur est survenue');
                setIsStreaming(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let buffer = '';

            if (!reader) {
                setError('Streaming indisponible. Veuillez reessayer.');
                return;
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const rawLine of lines) {
                    const line = rawLine.trim();
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.meta) {
                            if (parsed.meta.remaining_credits !== undefined) {
                                setProfile((prev) => prev ? { ...prev, credits: parsed.meta.remaining_credits } : prev);
                            }
                        }
                        if (parsed.content) {
                            fullContent += parsed.content;
                            setOutput(fullContent);
                        }
                    } catch {
                        // ignore malformed chunk
                    }
                }
            }

            const finalLine = buffer.trim();
            if (finalLine.startsWith('data: ')) {
                const data = finalLine.slice(6).trim();
                if (data !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            fullContent += parsed.content;
                            setOutput(fullContent);
                        }
                    } catch {
                        // ignore malformed chunk
                    }
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setIsStreaming(false);
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // no-op
        }
    };

    const handleSaveSchedule = async () => {
        setSchedulesLoading(true);
        try {
            const payload = {
                enabled: scheduleEnabled,
                platforms: schedulePlatforms,
                posts_per_week: schedulePostsPerWeek,
                credits_budget_weekly: scheduleCreditsBudgetWeekly,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Porto-Novo',
                config: {
                    topic: scheduleTopic,
                    context: scheduleContext,
                    tone: scheduleTone,
                    sector: scheduleSector,
                    content_type: 'tips',
                    auto_publish: scheduleAutoPublish,
                },
            };

            const res = await fetch(scheduleId ? `/api/social/schedules/${scheduleId}` : '/api/social/schedules', {
                method: scheduleId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) return;
            const data = await res.json();
            if (data.schedule?.id) setScheduleId(data.schedule.id);
        } finally {
            setSchedulesLoading(false);
        }
    };

    const handleTogglePlatform = (platform: PlatformKey) => {
        setSchedulePlatforms((prev) => {
            if (prev.includes(platform)) return prev.filter((p) => p !== platform);
            return [...prev, platform];
        });
    };

    const handleDraftStatus = async (id: string, status: 'approved' | 'archived') => {
        await fetch(`/api/social/drafts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        fetchDrafts();
    };

    const handlePublishDraft = async (id: string) => {
        await fetch(`/api/social/publish/${id}`, { method: 'POST' });
        fetchDrafts();
    };

    const getSuggestedHashtags = () => {
        return SUGGESTED_HASHTAGS[sector] || SUGGESTED_HASHTAGS.general;
    };

    const getViralSuggestions = () => {
        const suggestions: Record<string, string[]> = {
            tiktok: [
                'Comment j\'ai doublé mes ventes en 30 jours',
                'Le secret des entrepreneurs africains',
                'Ce que personne ne vous dit sur le business',
                'Tuto: Créer du contenu viral',
                'Day in the life: entrepreneur à Cotonou',
            ],
            facebook: [
                'Quel est le plus grand défi de votre business?',
                '3 leçons que j\'ai apprises en entrepreneuriat',
                'Le marché africain change: voici comment s\'adapter',
                'Témoignage client: transformation incroyable',
            ],
            whatsapp: [
                'Nouvelle collection disponible!',
                'Offre spéciale cette semaine',
                'Votre devis personnalisé est prêt',
                'Rappel: Rendez-vous demain',
            ],
            linkedin: [
                'Ce que 5 ans d\'entrepreneuriat m\'ont appris',
                'L\'Afrique est le futur de l\'innovation',
                'Comment recruter les meilleurs talents en Afrique',
                'Le pouvoir du networking local',
            ],
            instagram: [
                'Behind the scenes de notre équipe',
                'Transformation: avant/après',
                'Ce que signifie vraiment "Made in Africa"',
                'Storytime: comment tout a commencé',
            ],
        };
        return suggestions[selectedPlatform] || suggestions.tiktok;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    const creditsNeeded = calculateCredits();

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] right-[-10%] w-[30%] h-[40%] bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[25%] h-[35%] bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium terracotta shadow-lg">
                            <IconMegaphone size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Social Media
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Posts viraux pour TikTok, Facebook, WhatsApp, LinkedIn
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-terracotta)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('studio')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            activeTab === 'studio'
                                ? 'bg-[var(--color-terracotta)] text-white border-[var(--color-terracotta)]'
                                : 'bg-white/60 text-gray-700 border-white'
                        }`}
                    >
                        Studio
                    </button>
                    <button
                        onClick={() => setActiveTab('autopilot')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            activeTab === 'autopilot'
                                ? 'bg-[var(--color-savanna)] text-white border-[var(--color-savanna)]'
                                : 'bg-white/60 text-gray-700 border-white'
                        }`}
                    >
                        Autopilot
                    </button>
                </div>

                {activeTab === 'autopilot' ? (
                    <div className="grid lg:grid-cols-2 gap-6">

                        <div className="space-y-6">
                            <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <IconMegaphone size={18} className="text-[var(--color-terracotta)]" />
                                    Comptes connectes
                                </h3>
                                <div className="space-y-3">
                                    {accountsLoading ? (
                                        <div className="text-sm text-gray-500">Chargement...</div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {CONNECT_PLATFORMS.map((p) => {
                                                const account = accounts.find((a) => a.platform === p.id);
                                                const Icon = p.icon;
                                                return (
                                                    <div key={p.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                                                        p.enabled ? 'border-gray-200 bg-white/60' : 'border-dashed border-gray-200 bg-gray-50/60'
                                                    }`}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon size={16} className="text-gray-600" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                                                                {account && (
                                                                    <div className="text-[11px] text-gray-500">{account.accountName || account.accountId}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {p.enabled ? (
                                                            account ? (
                                                                <button
                                                                    onClick={() => handleDisconnectAccount(account.id)}
                                                                    className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"
                                                                >
                                                                    Deconnecter
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={`/api/social/connect/${p.id}`}
                                                                    className="px-3 py-2 rounded-xl text-xs font-bold bg-[var(--color-terracotta)] text-white"
                                                                >
                                                                    Connecter
                                                                </a>
                                                            )
                                                        ) : (
                                                            <span className="text-[10px] font-semibold text-gray-400 uppercase">Bientot</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Connectez vos comptes pour activer la publication automatique.
                                    </p>
                                </div>
                            </div>
                            <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconClock size={18} className="text-[var(--color-gold)]" />
                                Planification
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Activé</span>
                                    <button
                                        onClick={() => setScheduleEnabled((v) => !v)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                                            scheduleEnabled
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}
                                    >
                                        {scheduleEnabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Publication auto</span>
                                    <button
                                        onClick={() => setScheduleAutoPublish((v) => !v)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                                            scheduleAutoPublish
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}
                                    >
                                        {scheduleAutoPublish ? 'ON' : 'OFF'}
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Plateformes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PLATFORMS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleTogglePlatform(p.id)}
                                                className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                                                    schedulePlatforms.includes(p.id)
                                                        ? 'bg-[var(--color-savanna)] text-white border-[var(--color-savanna)]'
                                                        : 'bg-white/60 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Sujet (Autopilot)</label>
                                    <input
                                        value={scheduleTopic}
                                        onChange={(e) => setScheduleTopic(e.target.value)}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/60 focus:outline-none focus:border-[var(--color-savanna)]"
                                        placeholder="Ex: Promouvoir mon service, éduquer sur..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Contexte (Autopilot)</label>
                                    <textarea
                                        value={scheduleContext}
                                        onChange={(e) => setScheduleContext(e.target.value)}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/60 focus:outline-none focus:border-[var(--color-savanna)] min-h-[90px]"
                                        placeholder="Ex: produit, audience, offre, localisation, lien, contraintes"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Ton</label>
                                        <select
                                            value={scheduleTone}
                                            onChange={(e) => setScheduleTone(e.target.value)}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/60 focus:outline-none focus:border-[var(--color-savanna)]"
                                        >
                                            {TONE_OPTIONS.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Secteur</label>
                                        <select
                                            value={scheduleSector}
                                            onChange={(e) => setScheduleSector(e.target.value)}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/60 focus:outline-none focus:border-[var(--color-savanna)]"
                                        >
                                            {SECTOR_OPTIONS.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Posts / semaine</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={21}
                                            value={schedulePostsPerWeek}
                                            onChange={(e) => setSchedulePostsPerWeek(Number(e.target.value))}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/60 focus:outline-none focus:border-[var(--color-savanna)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Budget crédits / semaine</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={1000}
                                            value={scheduleCreditsBudgetWeekly}
                                            onChange={(e) => setScheduleCreditsBudgetWeekly(Number(e.target.value))}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/60 focus:outline-none focus:border-[var(--color-savanna)]"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveSchedule}
                                    disabled={schedulesLoading}
                                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-[16px] font-bold text-white transition-all disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-savanna) 0%, #2a9d8f 100%)',
                                    }}
                                >
                                    {schedulesLoading ? (
                                        <>
                                            <IconLoader2 size={18} className="animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <IconCheck size={18} />
                                            Enregistrer
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500">
                                    Autopilot genere des drafts. Activez &quot;Publication auto&quot; pour publier sans intervention.
                                </p>
                            </div>
                        </div>

                        </div>
                        <div className="bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                            <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                                <span className="text-gray-700 font-medium text-sm">Drafts à valider</span>
                                <button
                                    onClick={fetchDrafts}
                                    disabled={draftsLoading}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    title="Rafraîchir"
                                >
                                    <IconRefresh size={16} className={draftsLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <div className="max-h-[520px] overflow-y-auto p-5 space-y-4">
                                {draftsLoading ? (
                                    <div className="text-sm text-gray-500">Chargement...</div>
                                ) : drafts.length === 0 ? (
                                    <div className="text-sm text-gray-500">Aucun draft pour l’instant.</div>
                                ) : (
                                    drafts.map((d) => {
                                        const account = accounts.find((a) => a.platform === d.platform);
                                        const isApproved = d.status === 'approved';
                                        return (
                                            <div key={d.id} className="border border-gray-100 rounded-2xl p-4">
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                        {String(d.platform).toUpperCase()}
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                                                            {String(d.status || 'draft')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(d.content || '')}
                                                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                            title="Copier"
                                                        >
                                                            <IconCopy size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDraftStatus(d.id, 'approved')}
                                                            disabled={isApproved}
                                                            className="px-3 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 disabled:opacity-60"
                                                        >
                                                            Valider
                                                        </button>
                                                        <button
                                                            onClick={() => handlePublishDraft(d.id)}
                                                            disabled={!account || !isApproved}
                                                            className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 disabled:opacity-60"
                                                        >
                                                            Publier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDraftStatus(d.id, 'archived')}
                                                            className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200"
                                                        >
                                                            Archiver
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                    {String(d.content || '').slice(0, 600)}
                                                    {String(d.content || '').length > 600 ? '...' : ''}
                                                </div>
                                                <SocialShareButtons text={String(d.content || '')} showLabel={false} size="sm" className="mt-3" />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>

                    {/* Platform Selector */}
                    <div className="grid grid-cols-5 gap-2 mb-6">
                    {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatform === platform.id;
                        return (
                            <button
                                key={platform.id}
                                onClick={() => { setSelectedPlatform(platform.id); setOutput(''); }}
                                disabled={isStreaming}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    isSelected
                                        ? `border-[var(--color-terracotta)] bg-gradient-to-br ${platform.color} text-white`
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                                }`}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-medium hidden sm:block">{platform.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Best Times Banner */}
                {platformInfo && (
                    <div className="mb-6 p-3 bg-white/50 rounded-xl flex items-center gap-2 text-sm">
                        <IconClock size={16} className="text-[var(--color-gold)]" />
                        <span className="text-gray-600">Meilleurs horaires pour {platformInfo.name}:</span>
                        <span className="font-medium text-gray-800">{platformInfo.bestTimes}</span>
                        <span className="text-gray-400 ml-1">(heure locale)</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Panel - Configuration */}
                    <div className="space-y-6">
                        {/* Topic Input */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconTrendingUp size={18} className="text-[var(--color-terracotta)]" />
                                Votre sujet / offre
                            </h3>
                            
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={`Décrivez ce que vous voulez promouvoir...\nEx: "Lancement de ma nouvelle collection de bijoux faits main"`}
                                rows={4}
                                maxLength={500}
                                disabled={isStreaming}
                                className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:outline-none focus:border-[var(--color-terracotta)] focus:ring-4 focus:ring-[var(--color-terracotta)]/10 transition-all resize-none text-[15px] leading-relaxed mb-4"
                            />

                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Contexte additionnel (optionnel): prix, date, contraintes spécifiques..."
                                rows={2}
                                maxLength={300}
                                disabled={isStreaming}
                                className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white/50 focus:outline-none focus:border-[var(--color-terracotta)] transition-all resize-none text-sm"
                            />
                        </div>

                        {/* Options */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconSparkles size={18} className="text-[var(--color-gold)]" />
                                Personnalisation
                            </h3>

                            {/* Tone */}
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Ton de voix</label>
                                <div className="flex flex-wrap gap-2">
                                    {TONE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setTone(opt.value)}
                                            disabled={isStreaming}
                                            className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                                tone === opt.value
                                                    ? 'bg-[var(--color-terracotta)] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {opt.emoji} {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sector */}
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Secteur d&apos;activité</label>
                                <div className="flex flex-wrap gap-2">
                                    {SECTOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSector(opt.value)}
                                            disabled={isStreaming}
                                            className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                                sector === opt.value
                                                    ? 'bg-[var(--color-savanna)] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {opt.emoji} {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Multi-variant */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Format de sortie</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setMultiVariant(false)}
                                        disabled={isStreaming}
                                        className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                                            !multiVariant
                                                ? 'border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <p className="font-medium text-sm">Une version</p>
                                        <p className="text-xs text-gray-500">1 crédit</p>
                                    </button>
                                    <button
                                        onClick={() => setMultiVariant(true)}
                                        disabled={isStreaming}
                                        className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                                            multiVariant
                                                ? 'border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <IconRepeat size={14} />
                                            <p className="font-medium text-sm">3 variantes</p>
                                        </div>
                                        <p className="text-xs text-gray-500">2 crédits</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="glass-card-premium rounded-[20px] p-6">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <IconTrendingUp size={18} className="text-[var(--color-gold)]" />
                                Idées virales pour {platformInfo?.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {getViralSuggestions().map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setTopic(suggestion)}
                                        disabled={isStreaming}
                                        className="px-3 py-2 bg-white/50 hover:bg-white border border-gray-200 hover:border-[var(--color-terracotta)] rounded-full text-xs text-gray-600 hover:text-gray-800 transition-all text-left"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hashtags Reference */}
                        <div className="p-4 bg-white/30 rounded-xl">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Hashtags suggérés ({sector})</p>
                            <div className="flex flex-wrap gap-1">
                                {getSuggestedHashtags().map((tag) => (
                                    <span key={tag} className="px-2 py-1 bg-white/50 rounded text-xs text-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!topic.trim() || isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-terracotta) 0%, var(--color-terracotta-dark) 100%)',
                                boxShadow: '0 8px 16px -4px rgba(231, 111, 81, 0.4)',
                            }}
                        >
                            {isStreaming ? (
                                <>
                                    <IconLoader2 size={20} className="animate-spin" />
                                    <span>Création en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconSparkles size={20} />
                                    <span>Générer le post ({creditsNeeded} crédit{creditsNeeded > 1 ? 's' : ''})</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl">
                                <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[500px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platformInfo?.color} flex items-center justify-center text-white`}>
                                    {platformInfo && <platformInfo.icon size={16} />}
                                </div>
                                <span className="text-gray-700 font-medium text-sm">
                                    {output || isStreaming ? 'Votre post' : 'Aperçu'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {output && (
                                    <button
                                        onClick={handleCopy}
                                        className={`p-2 rounded-lg transition-colors ${
                                            copied 
                                                ? 'text-green-600 bg-green-100' 
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                        title="Copier"
                                    >
                                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    </button>
                                )}
                                <button
                                    onClick={() => { setOutput(''); setCopied(false); }}
                                    disabled={!output}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    title="Effacer"
                                >
                                    <IconRefresh size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <IconLoader2 size={32} className="animate-spin text-[var(--color-terracotta)]" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Création de votre post viral...</p>
                                        <p className="text-xs text-gray-400 mt-1">Optimisé pour {platformInfo?.name}</p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed whitespace-pre-wrap">
                                    <ChatMessageContent content={output} />
                                    <div ref={outputRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                                        <IconMegaphone size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Votre post apparaîtra ici</p>
                                    <p className="text-xs text-gray-400 max-w-xs text-center">
                                        Configurez votre contenu et cliquez sur Générer
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Platform Tips Footer */}
                        {output && (
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 space-y-3">
                                <SocialShareButtons text={output} />
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <IconCheck size={12} />
                                        {output.length} caractères
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <IconCheck size={12} />
                                        Optimisé {platformInfo?.name}
                                    </span>
                                    {platformConfig && output.length > platformConfig.maxChars && (
                                        <span className="text-amber-600 font-medium">
                                            ⚠️ Dépasse la limite ({platformConfig.maxChars} max)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}
