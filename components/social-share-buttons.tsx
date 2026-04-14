'use client';

import { useMemo, useState, type ComponentType } from 'react';
import {
    IconCheck,
    IconFacebook,
    IconInstagram,
    IconLinkedin,
    IconMessageCircle,
    IconTikTok,
} from '@/components/icons';

type ShareTarget = {
    id: 'whatsapp' | 'facebook' | 'linkedin' | 'instagram' | 'tiktok';
    label: string;
    href: (text: string) => string;
    className: string;
    icon: ComponentType<{ size?: number; className?: string }>;
};

interface SocialShareButtonsProps {
    text: string;
    showLabel?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

const SHARE_TARGETS: ShareTarget[] = [
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        href: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
        className: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white',
        icon: IconMessageCircle,
    },
    {
        id: 'facebook',
        label: 'Facebook',
        href: () => 'https://www.facebook.com/',
        className: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white',
        icon: IconFacebook,
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        href: () => 'https://www.linkedin.com/feed/',
        className: 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white',
        icon: IconLinkedin,
    },
    {
        id: 'instagram',
        label: 'Instagram',
        href: () => 'https://www.instagram.com/',
        className: 'bg-gradient-to-br from-pink-500/10 to-purple-500/10 text-pink-600 hover:from-pink-500 hover:to-purple-500 hover:text-white',
        icon: IconInstagram,
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        href: () => 'https://www.tiktok.com/',
        className: 'bg-gray-900/10 text-gray-900 hover:bg-gray-900 hover:text-white',
        icon: IconTikTok,
    },
];

export default function SocialShareButtons({
    text,
    showLabel = true,
    size = 'md',
    className = '',
}: SocialShareButtonsProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const cleanText = useMemo(() => text.trim(), [text]);
    const disabled = cleanText.length === 0;
    const iconSize = size === 'sm' ? 14 : 16;
    const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';

    const handleShare = async (target: ShareTarget) => {
        if (disabled) return;

        try {
            await navigator.clipboard.writeText(cleanText);
            setCopiedId(target.id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            // no-op
        }

        const href = target.href(cleanText);
        try {
            window.open(href, '_blank', 'noopener,noreferrer');
        } catch {
            // no-op
        }
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {showLabel && (
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Partager</span>
            )}
            {SHARE_TARGETS.map((target) => {
                const Icon = target.icon;
                const isCopied = copiedId === target.id;
                return (
                    <button
                        key={target.id}
                        type="button"
                        onClick={() => handleShare(target)}
                        disabled={disabled}
                        title={isCopied ? 'Copie' : `Partager sur ${target.label}`}
                        className={`${buttonSize} rounded-full flex items-center justify-center transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${target.className}`}
                    >
                        {isCopied ? <IconCheck size={iconSize} /> : <Icon size={iconSize} />}
                    </button>
                );
            })}
            {showLabel && (
                <span className="text-[11px] text-gray-400">
                    Texte copie. Collez-le sur le reseau.
                </span>
            )}
        </div>
    );
}
