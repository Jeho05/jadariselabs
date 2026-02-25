// ============================================
// JadaRiseLabs — Server-safe i18n cookie helper
// No 'use client' — safe to import in Server Components & layouts
// ============================================

import type { Language } from './translations';

const LANGUAGE_COOKIE_NAME = 'preferred_lang';

/**
 * Get language from cookie header string (server-side utility).
 * Intentionally kept in a separate file from LanguageProvider
 * so it can be imported by Server Components without a 'use client' boundary error.
 */
export function getLangFromCookie(cookieHeader?: string): Language {
    if (!cookieHeader) return 'fr';

    const match = cookieHeader.match(new RegExp(`${LANGUAGE_COOKIE_NAME}=([^;]+)`));
    const lang = match?.[1];

    if (lang && ['fr', 'en'].includes(lang)) {
        return lang as Language;
    }

    return 'fr';
}
