'use client';

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Language } from './translations';

const LANGUAGE_COOKIE_NAME = 'preferred_lang';
const LANGUAGE_STORAGE_KEY = 'jadariselabs_lang';

interface LanguageContextValue {
    lang: Language;
    setLang: (lang: Language) => void;
    isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

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
    const [isLoading, setIsLoading] = useState(true);

    // Initialize language from localStorage or cookie
    useEffect(() => {
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
        if (storedLang && ['fr', 'en'].includes(storedLang)) {
            setLangState(storedLang);
        } else if (initialLang) {
            setLangState(initialLang);
        }
        setIsLoading(false);
    }, [initialLang]);

    // Update HTML lang attribute
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    }, [lang]);

    const setLang = useCallback(async (newLang: Language) => {
        setLangState(newLang);

        // Save to localStorage
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);

        // Save to cookie for server-side access
        document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;

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
        <LanguageContext.Provider value={{ lang, setLang, isLoading }}>
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
