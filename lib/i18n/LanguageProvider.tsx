'use client';

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Language } from './translations';

const LANGUAGE_COOKIE_NAME = 'preferred_lang';
const LANGUAGE_STORAGE_KEY = 'jadariselabs_lang';

interface LanguageContextValue {
    lang: Language;
    setLang: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({ lang: 'fr', setLang: () => {} });

interface LanguageProviderProps {
    children: ReactNode;
    initialLang?: Language;
}

/**
 * Language Provider
 * - Persists language preference in cookie + localStorage
 * - Updates HTML lang attribute
 * - Syncs with user profile in database
 */
export function LanguageProvider({ children, initialLang = 'fr' }: LanguageProviderProps) {
    const [lang, setLangState] = useState<Language>(initialLang);
    const [mounted, setMounted] = useState(false);

    // Initialize language from localStorage after mount
    useEffect(() => {
        setMounted(true);
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
        if (storedLang && ['fr', 'en'].includes(storedLang)) {
            setLangState(storedLang);
        }
    }, []);

    // Update HTML lang attribute
    useEffect(() => {
        if (mounted && typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    }, [lang, mounted]);

    const setLang = useCallback(async (newLang: Language) => {
        setLangState(newLang);

        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
            // Save to cookie for server-side access
            document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
        }

        // Sync with profile in database
        try {
            await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferred_lang: newLang }),
            });
        } catch (error) {
            console.error('Failed to sync language with profile:', error);
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Get language from cookie (server-side)
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
