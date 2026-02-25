'use client';

// ============================================
// Modern SVG Icons for JadaRiseLabs
// Replaces basic emojis with styled gradients
// ============================================

interface IconProps {
    className?: string;
    size?: number;
}

// Gradient definitions (used inside SVGs)
const Gradients = () => (
    <defs>
        {/* Gold gradient */}
        <linearGradient id="gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#D4BA6E" />
        </linearGradient>
        {/* Earth gradient */}
        <linearGradient id="gradient-earth" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B4F2E" />
            <stop offset="100%" stopColor="#A0714D" />
        </linearGradient>
        {/* Terracotta gradient */}
        <linearGradient id="gradient-terracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E76F51" />
            <stop offset="100%" stopColor="#EC8D75" />
        </linearGradient>
        {/* Savanna gradient */}
        <linearGradient id="gradient-savanna" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#48856A" />
        </linearGradient>
        {/* Multi gradient for special icons */}
        <linearGradient id="gradient-multi" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="50%" stopColor="#E76F51" />
            <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
    </defs>
);

// Zap / Lightning (Credits)
export function IconZap({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="url(#gradient-gold)"
                stroke="url(#gradient-gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Palette (Image Generation)
export function IconPalette({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="9" stroke="url(#gradient-terracotta)" strokeWidth="2" fill="none" />
            <circle cx="8" cy="9" r="1.5" fill="url(#gradient-terracotta)" />
            <circle cx="12" cy="7" r="1.5" fill="url(#gradient-gold)" />
            <circle cx="16" cy="9" r="1.5" fill="url(#gradient-savanna)" />
            <circle cx="14" cy="14" r="1.5" fill="url(#gradient-earth)" />
            <circle cx="10" cy="15" r="1.5" fill="url(#gradient-terracotta)" />
        </svg>
    );
}

// Chart (Dashboard/Stats)
export function IconChart({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="3" y="12" width="4" height="8" rx="1" fill="url(#gradient-earth)" />
            <rect x="10" y="8" width="4" height="12" rx="1" fill="url(#gradient-gold)" />
            <rect x="17" y="4" width="4" height="16" rx="1" fill="url(#gradient-savanna)" />
        </svg>
    );
}

// Image Frame (Gallery)
export function ImageIcon({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="url(#gradient-terracotta)" strokeWidth="2" fill="none" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="url(#gradient-gold)" />
            <path d="M21 15l-5-5L5 21" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Chat Bubble (Chat AI)
export function IconChat({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Video/Camera (Video Generation)
export function IconVideo({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="2" y="6" width="14" height="12" rx="2" stroke="url(#gradient-gold)" strokeWidth="2" fill="none" />
            <path d="M22 7l-6 5 6 5V7z" fill="url(#gradient-gold)" />
        </svg>
    );
}

// Rocket (Launch/Empty State)
export function IconRocket({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M4.5 16.5c-1.5 4.5 1.5 4.5 3 3l1.5-1.5"
                stroke="url(#gradient-terracotta)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 12c0-5 4-8 9-8 3 0 5 2 5 5 0 5-3 9-8 9-3 0-6-2-6-6z"
                stroke="url(#gradient-multi)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="2" fill="url(#gradient-gold)" />
        </svg>
    );
}

// Flask (Logo)
export function IconFlask({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M9 3h6v5l4 9a2 2 0 01-2 3H7a2 2 0 01-2-3l4-9V3z"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="9" y1="3" x2="15" y2="3" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="14" r="1" fill="url(#gradient-terracotta)" />
            <circle cx="14" cy="15" r="1.5" fill="url(#gradient-savanna)" />
        </svg>
    );
}

// User (Profile)
export function IconUser({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="8" r="4" stroke="url(#gradient-earth)" strokeWidth="2" fill="none" />
            <path
                d="M4 21v-1a6 6 0 0112 0v1"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Logout (Door)
export function IconLogout({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                stroke="url(#gradient-terracotta)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 17l5-5-5-5"
                stroke="url(#gradient-terracotta)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="21" y1="12" x2="9" y2="12" stroke="url(#gradient-terracotta)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Wave (Welcome)
export function IconWave({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M18.5 12c0-1.5-1-2.5-2-2.5s-2 1-2 2.5"
                stroke="url(#gradient-gold)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M14.5 12V8c0-1.5-1-2.5-2-2.5s-2 1-2 2.5v8"
                stroke="url(#gradient-terracotta)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M10.5 16V6c0-1.5-1-2.5-2-2.5s-2 1-2 2.5v10"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M6.5 16v-4c0-1.5-1-2.5-2-2.5s-2 1-2 2.5v4a9 9 0 0018 0v-4"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Sparkles (AI/Premium)
export function IconSparkles({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
                fill="url(#gradient-gold)"
            />
            <path
                d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
                fill="url(#gradient-terracotta)"
                opacity="0.7"
            />
            <path
                d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z"
                fill="url(#gradient-savanna)"
                opacity="0.7"
            />
        </svg>
    );
}

// Menu (Hamburger)
export function IconMenu({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Close (X)
export function IconClose({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Chevron Down
export function IconChevronDown({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Folder
export function IconFolder({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Crown (Pro Plan)
export function IconCrown({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M2 17l3-7 4 4 3-8 3 8 4-4 3 7H2z"
                fill="url(#gradient-gold)"
                stroke="url(#gradient-gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="5" cy="10" r="1.5" fill="url(#gradient-gold)" />
            <circle cx="12" cy="6" r="1.5" fill="url(#gradient-gold)" />
            <circle cx="19" cy="10" r="1.5" fill="url(#gradient-gold)" />
        </svg>
    );
}

// Infinity (Unlimited)
export function IconInfinity({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M12 12c-2-2-4-3-5.5-3S3 10.5 3 12s2 3 3.5 3 3.5-1 5.5-3c2 2 4 3 5.5 3s3.5-1.5 3.5-3-2-3-3.5-3-3.5 1-5.5 3z"
                stroke="url(#gradient-gold)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
}

// Arrow Right
export function IconArrowRight({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Plus
export function IconPlus({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Send (Chat)
export function IconSend({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M22 2L11 13"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M22 2L15 22l-4-9-9-4 20-7z"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Trash (Delete)
export function IconTrash({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
                d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Edit (Pencil)
export function IconEdit({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

// Globe (Language)
export function IconGlobe({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="10" stroke="url(#gradient-savanna)" strokeWidth="2" fill="none" />
            <ellipse cx="12" cy="12" rx="4" ry="10" stroke="url(#gradient-savanna)" strokeWidth="2" fill="none" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="url(#gradient-savanna)" strokeWidth="2" />
        </svg>
    );
}

// Camera (Avatar)
export function IconCamera({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="4" stroke="url(#gradient-earth)" strokeWidth="2" fill="none" />
        </svg>
    );
}

// Refresh
export function IconRefresh({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M1 4v6h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3.51 15a9 9 0 105.64-11.36L1 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

// New Chat
export function IconNewChat({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="12" y1="8" x2="12" y2="16" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Upload (Cloud Arrow Up)
export function IconUpload({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M17 8l-5-5-5 5"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <line x1="12" y1="3" x2="12" y2="15" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// ============================================
// PREMIUM ICONS - Elegant Design
// ============================================

// Music/Audio (Audio Generation)
export function IconMusic({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M9 18V5l12-2v13"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle cx="6" cy="18" r="3" fill="url(#gradient-savanna)" />
            <circle cx="18" cy="16" r="3" fill="url(#gradient-gold)" />
            <path d="M9 9l12-2" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
    );
}

// Code (Code Assistant)
export function IconCode({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <polyline
                points="16 18 22 12 16 6"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <polyline
                points="8 6 2 12 8 18"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <line x1="12" y1="4" x2="12" y2="20" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        </svg>
    );
}

// Enhance/Magic Wand (Image Enhancement)
export function IconEnhance({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6L12 2z"
                fill="url(#gradient-gold)"
            />
            <circle cx="12" cy="12" r="3" fill="white" opacity="0.9" />
            <circle cx="12" cy="12" r="1.5" fill="url(#gradient-terracotta)" />
        </svg>
    );
}

// Check (Validation/Success)
export function IconCheck({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="10" fill="url(#gradient-savanna)" opacity="0.15" />
            <path
                d="M8 12l3 3 5-6"
                stroke="url(#gradient-savanna)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

// Star (Premium/Popular)
export function IconStar({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6L12 2z"
                fill="url(#gradient-gold)"
                stroke="url(#gradient-gold-dark)"
                strokeWidth="1"
            />
        </svg>
    );
}

// Sparkle (AI Magic)
export function IconSparkle({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
                fill="url(#gradient-gold)"
            />
            <path
                d="M5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
                fill="url(#gradient-terracotta)"
                opacity="0.6"
            />
            <path
                d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z"
                fill="url(#gradient-savanna)"
                opacity="0.6"
            />
        </svg>
    );
}

// Download
export function IconDownload({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <polyline
                points="7 10 12 15 17 10"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <line x1="12" y1="15" x2="12" y2="3" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Wand (Magic Tool)
export function IconWand({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M15 4V2"
                stroke="url(#gradient-gold)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M15 16v-2"
                stroke="url(#gradient-gold)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M8 9h2"
                stroke="url(#gradient-terracotta)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M20 9h2"
                stroke="url(#gradient-terracotta)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M17.8 11.8l1.4 1.4"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10.8 11.8l-1.4 1.4"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M3 21l9-9"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M12 9l-1-1"
                stroke="url(#gradient-gold)"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}
