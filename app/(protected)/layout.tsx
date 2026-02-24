import Header from '@/components/header';

/**
 * Protected Layout Group
 * Wraps all authenticated pages (dashboard, studio, gallery)
 * with the Header component automatically.
 */
export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
        </div>
    );
}
