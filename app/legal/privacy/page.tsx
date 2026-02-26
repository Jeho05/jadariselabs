import { IconShield, IconFlask } from '@/components/icons';
import Link from 'next/link';

export const metadata = {
    title: 'Politique de Confidentialité — JadaRiseLabs',
};

export default function PrivacyPage() {
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
                <div className="absolute top-1/3 -left-20 w-60 h-60 bg-[var(--color-terracotta)]/5 rounded-full blur-3xl" />
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
                        <div className="module-icon-premium earth">
                            <IconShield size={24} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                            Politique de Confidentialité
                        </h1>
                    </div>

                    <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-4">
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            Dernière mise à jour : Janvier 2024
                        </p>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">1. Collecte des données</h2>
                            <p>
                                JadaRiseLabs collecte uniquement les données nécessaires au fonctionnement de nos services IA :
                                email, pseudo, et préférences linguistiques. Vos créations sont stockées de manière sécurisée.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">2. Utilisation des données</h2>
                            <p>
                                Vos données sont utilisées exclusivement pour fournir nos services de génération IA,
                                améliorer l&apos;expérience utilisateur et vous envoyer des notifications importantes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">3. Protection des données</h2>
                            <p>
                                Nous utilisons des mesures de sécurité avancées pour protéger vos données :
                                chiffrement SSL, authentification sécurisée, et hébergement sur des serveurs conformes GDPR.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">4. Vos droits</h2>
                            <p>
                                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
                                de suppression et de portabilité de vos données. Contactez-nous pour exercer ces droits.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Cookies</h2>
                            <p>
                                Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies
                                analytiques anonymes pour améliorer nos services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Contact</h2>
                            <p>
                                Pour toute question concernant cette politique, contactez-nous à :
                                <span className="text-[var(--color-earth)] font-medium"> contact@jadariselabs.com</span>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
