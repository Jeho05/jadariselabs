'use client';

import { LanguageProvider } from '@/lib/i18n';
import type { ReactNode } from 'react';

interface LanguageProviderWrapperProps {
    children: ReactNode;
    initialLang?: 'fr' | 'en';
}

export function LanguageProviderWrapper({ children, initialLang = 'fr' }: LanguageProviderWrapperProps) {
    return (
        <LanguageProvider initialLang={initialLang}>
            {children}
        </LanguageProvider>
    );
}
