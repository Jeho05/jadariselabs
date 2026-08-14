import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PageHero } from '@/components/page-hero';

export const metadata = {
    title: 'Politique de Confidentialité — JadaRiseLabs',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <SiteHeader />
            <PageHero
                badge="Confidentialité"
                title="Politique de Confidentialité"
            />

            <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 pb-20 w-full">
                <div className="glass-dark rounded-3xl p-8 md:p-12">
                    <p className="text-sm text-[var(--color-text-muted)] mb-8">
                        Dernière mise à jour : 13 août 2026
                    </p>

                    {/* Plain-language summary */}
                    <div className="bg-[var(--color-surface-2)]/70 rounded-2xl border border-[var(--color-gold)]/15 p-6 mb-10">
                        <h2 className="text-base font-bold text-[var(--color-gold-light)] mb-3">
                            En résumé
                        </h2>
                        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                            <li>• Nous collectons uniquement ce qui est nécessaire : email, pseudo, préférences et vos créations.</li>
                            <li>• Vos données ne sont jamais vendues à des tiers.</li>
                            <li>• Vos créations sont conservées aussi longtemps que votre compte est actif.</li>
                            <li>• Vous pouvez demander la suppression totale de vos données à tout moment.</li>
                            <li>• Nous utilisons des cookies essentiels (session) et des cookies analytiques anonymes.</li>
                        </ul>
                    </div>

                    <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-8">
                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">1. Collecte des données</h2>
                            <p>
                                JadaRiseLabs collecte uniquement les données nécessaires au fonctionnement de nos services IA :
                                email, pseudo, préférences linguistiques et vos créations (images, vidéos, audio, textes).
                                Les paiements sont traités par notre prestataire CinetPay, qui ne nous transmet que la confirmation
                                et le plan souscrit — jamais vos coordonnées bancaires.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">2. Utilisation des données</h2>
                            <p>
                                Vos données sont utilisées exclusivement pour fournir nos services de génération IA,
                                améliorer l&apos;expérience utilisateur, gérer votre abonnement et vous envoyer des
                                notifications importantes (confirmations de paiement, réinitialisation de mot de passe).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">3. Durée de conservation</h2>
                            <p>
                                Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte,
                                vos données et créations sont supprimées définitivement sous 30 jours. Les données de paiement
                                ne sont conservées que par CinetPay, selon sa propre politique, pour des obligations légales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">4. Protection des données</h2>
                            <p>
                                Nous utilisons des mesures de sécurité avancées pour protéger vos données :
                                chiffrement SSL, authentification sécurisée (Supabase Auth), et hébergement conforme
                                aux normes de sécurité en vigueur. Nos clés d&apos;API et identifiants ne sont jamais exposés.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Vos droits</h2>
                            <p>
                                Conformément au RGPD et aux réglementations applicables, vous disposez d&apos;un droit
                                d&apos;accès, de rectification, de suppression et de portabilité de vos données.
                                Contactez-nous pour exercer ces droits — nous répondons sous 30 jours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Intégration des Réseaux Sociaux et TikTok</h2>
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
                                En utilisant l&apos;intégration TikTok, vous acceptez également les Conditions d&apos;utilisation de TikTok.
                                Vous pouvez révoquer l&apos;accès à tout moment depuis les paramètres de votre compte TikTok
                                ou depuis le tableau de bord JadaRiseLabs.
                            </p>
                        </section>

                        <section id="deletion">
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">7. Suppression des données et Révocation</h2>
                            <p>
                                Vous pouvez déconnecter vos réseaux sociaux à tout moment depuis votre tableau de bord JadaRiseLabs.
                                Pour TikTok en particulier, vous pouvez également révoquer l&apos;accès directement depuis vos
                                paramètres de sécurité TikTok. Pour demander la suppression totale de vos données JadaRiseLabs
                                et des jetons associés, envoyez un email à contact@jadariselabs.com.
                                Vos données seront supprimées sous 30 jours.
                            </p>
                        </section>

                        <section id="cookies">
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">8. Cookies</h2>
                            <p className="mb-4">
                                Nous utilisons deux catégories de cookies :
                            </p>
                            <ul className="list-disc pl-6 mb-4">
                                <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (session d&apos;authentification Supabase, préférences). Ils ne peuvent pas être désactivés.</li>
                                <li><strong>Cookies analytiques :</strong> anonymes, utilisés pour comprendre comment le site est utilisé et améliorer nos services.</li>
                            </ul>
                            <p>
                                Vous pouvez contrôler les cookies analytiques depuis les paramètres de votre navigateur.
                                La désactivation des cookies essentiels peut empêcher l&apos;utilisation du service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">9. Contact</h2>
                            <p>
                                Pour toute question concernant cette politique, vos données ou une demande légale,
                                contactez-nous à :
                                <span className="text-[var(--color-gold-light)] font-medium"> contact@jadariselabs.com</span>
                                (objet : « Données personnelles »).
                            </p>
                        </section>

                        {/* Version history */}
                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">10. Historique des versions</h2>
                            <ul className="list-disc pl-6 text-sm">
                                <li><strong>13 août 2026</strong> — Ajout du résumé en langage simple, de la durée de conservation, de la section cookies dédiée et du contact légal.</li>
                                <li><strong>Janvier 2024</strong> — Version initiale.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
