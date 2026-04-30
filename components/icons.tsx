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

// Copy
export function IconCopy({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect
                x="9"
                y="9"
                width="11"
                height="11"
                rx="2"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                fill="none"
            />
            <rect
                x="4"
                y="4"
                width="11"
                height="11"
                rx="2"
                stroke="url(#gradient-gold)"
                strokeWidth="2"
                fill="none"
            />
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

// Shield (Security/Privacy)
export function IconShield({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                fill="url(#gradient-earth)"
                opacity="0.15"
            />
            <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="url(#gradient-earth)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M9 12l2 2 4-4"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Clock (Time/Expiration)
export function IconClock({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="10" stroke="url(#gradient-terracotta)" strokeWidth="2" fill="none" />
            <path d="M12 6v6l4 2" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// File (Document/Terms)
export function IconFile({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                fill="url(#gradient-savanna)"
                opacity="0.15"
            />
            <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path d="M14 2v6h6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 13H8" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 17H8" stroke="url(--gradient-earth)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Image (Gallery)
export function IconImage({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="url(#gradient-earth)" strokeWidth="2" fill="none" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="url(#gradient-gold)" />
            <path d="M21 15l-5-5L5 21" stroke="url(#gradient-terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Lock (Security/Password)
export function IconLock({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="5" y="11" width="14" height="10" rx="2" fill="url(#gradient-earth)" opacity="0.15" />
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="url(#gradient-earth)" strokeWidth="2" fill="none" />
            <path d="M8 11V7a4 4 0 118 0v4" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="url(#gradient-gold)" />
        </svg>
    );
}

// Mail (Email)
export function IconMail({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="3" y="5" width="18" height="14" rx="2" fill="url(#gradient-savanna)" opacity="0.1" />
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="url(#gradient-savanna)" strokeWidth="2" fill="none" />
            <path d="M3 7l9 6 9-6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Users (Community/Team)
export function IconUsers({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="9" cy="7" r="3" stroke="url(#gradient-earth)" strokeWidth="2" fill="none" />
            <circle cx="17" cy="7" r="2.5" stroke="url(#gradient-gold)" strokeWidth="2" fill="none" />
            <path d="M3 21v-1a5 5 0 015-5h2a5 5 0 015 5v1" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M21 21v-1a3 3 0 00-3-3h-1" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
    );
}

// Play (Video/Start)
export function IconPlay({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="10" fill="url(#gradient-gold)" opacity="0.15" />
            <circle cx="12" cy="12" r="10" stroke="url(#gradient-gold)" strokeWidth="2" fill="none" />
            <path d="M10 8l6 4-6 4V8z" fill="url(#gradient-gold)" />
        </svg>
    );
}

// TrendingUp (Stats/Growth)
export function IconTrendingUp({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M17 6h6v6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Message (Chat/Support)
export function IconMessage({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                fill="url(#gradient-savanna)"
                opacity="0.15"
            />
            <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                stroke="url(#gradient-savanna)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <line x1="8" y1="9" x2="16" y2="9" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="13" x2="14" y2="13" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Loader2 (Spinner)
export function IconLoader2({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Alert Circle
export function IconAlertCircle({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
    );
}

// X (Close)
export function IconX({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Share
export function IconShare({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="18" cy="5" r="3" stroke="url(#gradient-gold)" strokeWidth="2" fill="none" />
            <circle cx="6" cy="12" r="3" stroke="url(#gradient-terracotta)" strokeWidth="2" fill="none" />
            <circle cx="18" cy="19" r="3" stroke="url(#gradient-savanna)" strokeWidth="2" fill="none" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="url(#gradient-terracotta)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Search (Magnifying Glass)
export function IconSearch({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Heart
export function IconHeart({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
        </svg>
    );
}

// ============================================
// NEW MODULE ICONS (Phase 1)
// ============================================

// Text / Type (Universal Text Generator)
export function IconText({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M4 7V5h16v2" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5v14" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 21h6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// FileText / Document (Document Summarizer)
export function IconFileText({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M14 2v6h6" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 13H8" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 17H8" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 9H8" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Megaphone / Social (Social Media Generator)
export function IconMegaphone({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M3 11l18-5v12L3 14v-3z" fill="url(#gradient-terracotta)" opacity="0.15" />
            <path d="M3 11l18-5v12L3 14v-3z" stroke="url(#gradient-terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M11.6 14.8l-2.4 5.6a1 1 0 001.4 1.2l2.4-1.6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Briefcase / Career (CV & Cover Letter)
export function IconBriefcase({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="2" y="7" width="20" height="14" rx="2" fill="url(#gradient-gold)" opacity="0.15" />
            <rect x="2" y="7" width="20" height="14" rx="2" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Languages / Translate (Local Translation)
export function IconLanguages({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="10" stroke="url(#gradient-savanna)" strokeWidth="2" fill="none" />
            <path d="M2 12h20" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2a15.3 15.3 0 010 20" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2a15.3 15.3 0 000 20" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Pen / Writing
export function IconPen({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Target / Marketing
export function IconTarget({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <circle cx="12" cy="12" r="10" stroke="url(#gradient-terracotta)" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="6" stroke="url(#gradient-gold)" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="2" fill="url(#gradient-savanna)" />
        </svg>
    );
}

// Film / Video Scripts
export function IconFilm({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <rect x="2" y="2" width="20" height="20" rx="2.18" stroke="url(#gradient-earth)" strokeWidth="2" fill="none" />
            <path d="M7 2v20" stroke="url(#gradient-gold)" strokeWidth="2" />
            <path d="M17 2v20" stroke="url(#gradient-gold)" strokeWidth="2" />
            <path d="M2 12h20" stroke="url(#gradient-gold)" strokeWidth="2" />
            <path d="M2 7h5" stroke="url(#gradient-terracotta)" strokeWidth="2" />
            <path d="M2 17h5" stroke="url(#gradient-terracotta)" strokeWidth="2" />
            <path d="M17 17h5" stroke="url(#gradient-terracotta)" strokeWidth="2" />
            <path d="M17 7h5" stroke="url(#gradient-terracotta)" strokeWidth="2" />
        </svg>
    );
}

// Settings2 / Expert Mode
export function IconSettings2({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M4 21v-7" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 10V3" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 21v-9" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 8V3" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 21v-5" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 12V3" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
            <path d="M1 14h6" stroke="url(#gradient-earth)" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 8h6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M17 16h6" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Lightbulb / Ideas
export function IconLightbulb({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M9 18h6" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 22h4" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 002 2h4a2 2 0 002-2v-2.26A6.98 6.98 0 0019 9a7 7 0 00-7-7z" fill="url(#gradient-gold)" opacity="0.15" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// Repeat / Multi-output
export function IconRepeat({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Gradients />
            <path d="M17 1l4 4-4 4" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 11V9a4 4 0 014-4h14" stroke="url(#gradient-savanna)" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 23l-4-4 4-4" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 13v2a4 4 0 01-4 4H3" stroke="url(#gradient-gold)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// LinkedIn
export function IconLinkedin({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Tag / Labels
export function IconTag({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="7" cy="7" r="1" fill="currentColor" />
        </svg>
    );
}

// Wand2 / Magic Wand 2
export function IconWand2({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M21 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M13 10l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 12l-5 5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 17l-2 5-2-2 5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Instagram (Social Media)
export function IconInstagram({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="6" r="1" fill="currentColor" />
        </svg>
    );
}

// BookOpen (Reading/Translation)
export function IconBookOpen({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Volume2 (Audio/Speech)
export function IconVolume2({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Mic (Microphone)
export function IconMic({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 2a3 3 0 013 3v7a3 3 0 11-6 0V5a3 3 0 013-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Building (Company/Career)
export function IconBuilding({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 21V7l8-4 8 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Document (File)
export function IconDocument({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// MessageCircle (WhatsApp/Social)
export function IconMessageCircle({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 014 11.5a8.5 8.5 0 018.5-8.5 8.5 8.5 0 018.5 8.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// TikTok
export function IconTikTok({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M9 12a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M15 8v8a4 4 0 01-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 8a4 4 0 004-4v0h-4v0a4 4 0 00-4 4v0a4 4 0 004 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Facebook
export function IconFacebook({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// GraduationCap
export function IconGraduationCap({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// Award
export function IconAward({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Phone
export function IconPhone({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

// MapPin
export function IconMapPin({ className = '', size = 24 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
}

export const IconLeaf = ({ size = 24, className = "" }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);
