'use client';

import { useContext } from 'react';
import { LanguageContext } from './LanguageProvider';
import { translations, TranslationKey, Language } from './translations';

/**
 * Hook to access translations
 * @returns { t: function, lang: Language, setLang: function }
 */
export function useTranslation() {
    const context = useContext(LanguageContext);
    const lang = context?.lang ?? 'fr';
    const setLang = context?.setLang ?? (() => {});

    const t = (key: TranslationKey): string => {
        const translation = translations[lang][key];
        if (!translation) {
            console.warn(`Translation missing for key: ${key} in language: ${lang}`);
            return key;
        }
        return translation;
    };

    return { t, lang, setLang };
}

/**
 * Get translation for a specific language (server-side friendly)
 */
export function getTranslation(lang: Language, key: TranslationKey): string {
    const translation = translations[lang][key];
    if (!translation) {
        return key;
    }
    return translation;
}

/**
 * Get all translations for a specific language
 */
export function getTranslationsForLang(lang: Language) {
    return translations[lang];
}
