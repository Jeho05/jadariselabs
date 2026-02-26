import { IconFile, IconFlask } from '@/components/icons';
import Link from 'next/link';

export const metadata = {
    title: 'Conditions Générales d\'Utilisation — JadaRiseLabs',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background Pattern */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }}
            />
            
            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-gold)]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-20 w-60 h-60 bg-[var(--color-savanna)]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-earth)] to-[var(--color-gold)] flex items-center justify-center shadow-lg">
                            <IconFlask size={20} className="text-white" />
                        </div>
                        <span 
                            className="font-bold text-lg group-hover:text-[var(--color-earth-light)] transition-colors"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            JadaRiseLabs
                        </span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="module-card-premium flex-col p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="module-icon-premium savanna">
                            <IconFile size={24} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                            Conditions Générales d&apos;Utilisation
                        </h1>
                    </div>

                    <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-4">
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            Dernière mise à jour : Janvier 2024
                        </p>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">1. Acceptation des conditions</h2>
                            <p>
                                En utilisant JadaRiseLabs, vous acceptez ces conditions d&apos;utilisation. 
                                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">2. Description du service</h2>
                            <p>
                                JadaRiseLabs est une plateforme IA permettant la génération d&apos;images, de vidéos,
                                de conversations et de contenu audio. Les services sont fournis via des crédits.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">3. Compte utilisateur</h2>
                            <p>
                                Vous êtes responsable de la sécurité de votre compte. Ne partagez pas vos identifiants.
                                Nous nous réservons le droit de suspendre les comptes en cas de violation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">4. Utilisation acceptable</h2>
                            <p>
                                Il est interdit d&apos;utiliser nos services pour créer du contenu illégal, offensant,
                                ou portant atteinte aux droits d&apos;autrui. Le contenu généré doit respecter les lois en vigueur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Propriété intellectuelle</h2>
                            <p>
                                Le contenu généré vous appartient. Cependant, vous accordez à JadaRiseLabs 
                                une licence limitée pour améliorer nos services. Les modèles IA restent notre propriété.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Limitation de responsabilité</h2>
                            <p>
                                JadaRiseLabs n&apos;est pas responsable des dommages indirects liés à l&apos;utilisation
                                du service. Nos services sont fournis &quot;tel quel&quot; sans garantie explicite.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">7. Modifications</h2>
                            <p>
                                Nous pouvons modifier ces conditions à tout moment. Les utilisateurs seront notifiés
                                des changements importants par email ou via la plateforme.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">8. Contact</h2>
                            <p>
                                Pour toute question : 
                                <span className="text-[var(--color-earth)] font-medium"> contact@jadariselabs.com</span>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
