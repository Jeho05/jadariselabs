interface StudioPageProps {
    params: Promise<{
        module: string;
    }>;
}

export default async function StudioPage({ params }: StudioPageProps) {
    const { module } = await params;
    
    return (
        <div className="min-h-screen bg-cream">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6 capitalize">Studio {module}</h1>
                <p className="text-text-secondary">Page en construction</p>
            </div>
        </div>
    );
}
