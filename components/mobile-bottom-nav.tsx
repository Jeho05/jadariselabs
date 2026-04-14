'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    IconChart,
    IconPalette,
    ImageIcon,
    IconUser,
    IconMegaphone,
} from '@/components/icons';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: IconChart },
    { href: '/studio/image', label: 'Studio', icon: IconPalette, matchPrefix: '/studio/image' },
    { href: '/studio/social', label: 'Social', icon: IconMegaphone },
    { href: '/gallery', label: 'Galerie', icon: ImageIcon },
    { href: '/dashboard/profile', label: 'Profil', icon: IconUser },
];

/**
 * Mobile Bottom Navigation Bar
 * Fixed at the bottom of the screen on mobile/tablet (hidden on lg+)
 * Premium glassmorphism design
 */
export default function MobileBottomNav() {
    const pathname = usePathname();

    const isActive = (item: typeof NAV_ITEMS[0]) => {
        if (item.matchPrefix) {
            return pathname.startsWith(item.matchPrefix);
        }
        return pathname === item.href || pathname.startsWith(item.href + '/');
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.06)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            aria-label="Navigation mobile"
        >
            <div className="flex items-stretch justify-around max-w-lg mx-auto px-2">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center py-2.5 px-3 min-w-[64px] transition-colors relative"
                        >
                            <div className="relative flex items-center justify-center mb-1">
                                <div
                                    className={`p-2 rounded-xl transition-all duration-200 ${
                                        active
                                            ? 'bg-[rgba(123,79,46,0.1)] text-[var(--color-earth)]'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <item.icon size={22} />
                                </div>
                                {active && (
                                    <div
                                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                        style={{ background: 'var(--color-earth)' }}
                                    />
                                )}
                            </div>
                            <span
                                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                                    active ? 'text-[var(--color-earth)]' : 'text-gray-400'
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
