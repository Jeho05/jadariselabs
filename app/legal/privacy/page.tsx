import { IconShield } from '@/components/icons';
import Image from 'next/image';
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
                <div className="flex items-center mb-12">
                    <Link href="/" className="inline-flex items-center group">
                        <div className="relative transition-transform group-hover:scale-[1.02]">
                            <Image src="/logo-lion.png" alt="JadaRiseLabs" width={240} height={160} className="object-contain h-12 w-auto" />
                        </div>
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
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Intégration des Réseaux Sociaux et TikTok</h2>
                            <p className="mb-4">
                                JadaRiseLabs permet de connecter vos comptes X (Twitter), LinkedIn et TikTok. 
                                Nous utilisons ces connexions via OAuth pour publier du contenu en votre nom uniquement 
                                sur votre demande explicite. Nous ne stockons que les jetons d&apos;accès nécessaires 
                                et nous ne vendons jamais vos données de profil à des tiers.
                            </p>
                            <p className="mb-4">
                                <strong>Concernant spécifiquement TikTok :</strong> Notre application utilise les produits suivants de l&apos;API TikTok :
                            </p>
                            <ul className="list-disc pl-6 mb-4">
                                <li><strong>Login Kit :</strong> Utilisé pour authentifier l&apos;utilisateur de manière sécurisée et accéder à ses informations de profil basiques (avatar, nom d&apos;utilisateur) afin de personnaliser son tableau de bord.</li>
                                <li><strong>Web Video Kit (Share Kit) :</strong> Utilisé pour permettre aux utilisateurs de publier directement depuis l&apos;interface JadaRiseLabs les vidéos générées par notre IA vers leur compte TikTok personnel. Aucune vidéo n&apos;est publiée sans une action explicite de validation de la part de l&apos;utilisateur.</li>
                            </ul>
                            <p>
                                En utilisant l&apos;intégration TikTok, vous acceptez également les Conditions d&apos;utilisation de TikTok. Vous pouvez révoquer l&apos;accès à tout moment depuis les paramètres de votre compte TikTok ou depuis le tableau de bord JadaRiseLabs.
                            </p>
                        </section>

                        <section id="deletion">
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Suppression des données et Révocation</h2>
                            <p>
                                Vous pouvez déconnecter vos réseaux sociaux à tout moment depuis votre tableau de bord JadaRiseLabs. Pour TikTok en particulier, vous pouvez également révoquer l&apos;accès directement depuis vos paramètres de sécurité TikTok. Pour demander la suppression totale de vos données JadaRiseLabs et des jetons associés, envoyez un email à contact@jadariselabs.com. Vos données seront supprimées sous 30 jours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">7. Cookies</h2>
                            <p>
                                Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies
                                analytiques anonymes pour améliorer nos services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">8. Contact</h2>
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
