'use client';

import { useState, type ReactNode } from 'react';
import { IconChevronDown } from '@/components/icons';

interface AccordionItemProps {
    question: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

export function AccordionItem({ question, children, defaultOpen = false }: AccordionItemProps) {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = `accordion-panel-${question.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    const buttonId = `${panelId}-button`;

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-card overflow-hidden">
            <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-[var(--color-cream)]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2"
            >
                <span className="font-semibold text-[var(--color-text-primary)] text-sm sm:text-base">{question}</span>
                <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        open ? 'bg-[var(--color-earth)] text-white rotate-180' : 'bg-[var(--color-cream-dark)] text-[var(--color-text-secondary)]'
                    }`}
                >
                    <IconChevronDown size={16} />
                </span>
            </button>
            <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5 text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}