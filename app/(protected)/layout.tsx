import Header from '@/components/header';
import MobileBottomNav from '@/components/mobile-bottom-nav';

/**
 * Protected Layout Group
 * Wraps all authenticated pages (dashboard, studio, gallery)
 * with the Header component automatically.
 * - pt-16 / lg:pt-20 compensates for the fixed header height
 * - pb-20 / lg:pb-0 compensates for the mobile bottom nav
 */
export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-cream flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 pt-28 lg:pt-36 pb-20 lg:pb-0 overflow-hidden flex flex-col min-h-0">{children}</main>
            <MobileBottomNav />
        </div>
    );
}
