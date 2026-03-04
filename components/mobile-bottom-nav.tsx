'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    IconChart,
    IconPalette,
    ImageIcon,
    IconUser,
} from '@/components/icons';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: IconChart },
    { href: '/studio/image', label: 'Studio', icon: IconPalette, matchPrefix: '/studio' },
    { href: '/gallery', label: 'Galerie', icon: ImageIcon },
    { href: '/dashboard/profile', label: 'Profil', icon: IconUser },
];

/**
 * Mobile Bottom Navigation Bar
 * Fixed at the bottom of the screen on mobile/tablet (hidden on lg+)
 * Provides quick navigation between main sections
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
        <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
            {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`mobile-bottom-nav-item ${active ? 'active' : ''}`}
                    >
                        <div className="mobile-bottom-nav-icon-wrapper">
                            <item.icon size={22} />
                            {active && <div className="mobile-bottom-nav-dot" />}
                        </div>
                        <span className="mobile-bottom-nav-label">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
