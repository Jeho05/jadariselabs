import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PageHero } from '@/components/page-hero';

export const metadata = {
    title: 'Conditions Générales d\'Utilisation — JadaRiseLabs',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <SiteHeader />
            <PageHero
                badge="Légal"
                title="Conditions Générales d'Utilisation"
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
                            <li>• Les créations que vous générez vous appartiennent.</li>
                            <li>• Utilisation interdite pour du contenu illégal, trompeur ou portant atteinte aux droits d&apos;autrui.</li>
                            <li>• Paiements via CinetPay, crédits sans expiration tant que le compte est actif.</li>
                            <li>• Remboursement sous 14 jours si le service ne convient pas.</li>
                            <li>• Service fourni « tel quel », sans garantie de résultat spécifique.</li>
                        </ul>
                    </div>

                    <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-8">
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
                                de conversations, de code, d&apos;analyse documentaire et de contenu audio.
                                Les services sont fournis via un système de crédits mensuels selon le plan souscrit.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">3. Compte utilisateur</h2>
                            <p>
                                Vous êtes responsable de la sécurité de votre compte. Ne partagez pas vos identifiants.
                                Nous nous réservons le droit de suspendre les comptes en cas de violation
                                de ces conditions. Les crédits n&apos;ont pas de date d&apos;expiration
                                tant que votre compte est actif.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">4. Utilisation acceptable</h2>
                            <p>
                                Il est interdit d&apos;utiliser nos services pour créer du contenu illégal, offensant,
                                trompeur, ou portant atteinte aux droits d&apos;autrui (droit à l&apos;image,
                                droit d&apos;auteur, données personnelles). Le contenu généré doit respecter
                                les lois en vigueur dans votre pays.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Propriété intellectuelle</h2>
                            <p>
                                Le contenu généré via nos services vous appartient. Vous accordez à JadaRiseLabs
                                une licence limitée pour améliorer nos services. Les modèles IA, l&apos;interface
                                et les marques restent notre propriété exclusive.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Paiements et remboursements</h2>
                            <p>
                                Les paiements sont traités de manière sécurisée par notre prestataire CinetPay
                                (Mobile Money, Visa, Mastercard). Vous pouvez demander un remboursement intégral
                                sous 14 jours suivant votre premier paiement si le service ne vous convient pas,
                                en écrivant à contact@jadariselabs.com. L&apos;annulation de l&apos;abonnement
                                met fin aux débits futurs sans remboursement des crédits déjà consommés.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">7. Limitation de responsabilité</h2>
                            <p>
                                JadaRiseLabs n&apos;est pas responsable des dommages indirects liés à l&apos;utilisation
                                du service. Nos services sont fournis &quot;tel quel&quot; sans garantie explicite
                                de résultat spécifique. Les contenus générés par IA doivent être vérifiés
                                avant toute utilisation professionnelle.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">8. Modifications</h2>
                            <p>
                                Nous pouvons modifier ces conditions à tout moment. Les utilisateurs seront notifiés
                                des changements importants par email ou via la plateforme. La date de
                                dernière mise à jour est toujours indiquée en haut de cette page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">9. Contact</h2>
                            <p>
                                Pour toute question relative à ces conditions ou à un litige :
                                <span className="text-[var(--color-gold-light)] font-medium"> contact@jadariselabs.com</span>
                            </p>
                        </section>

                        {/* Version history */}
                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">10. Historique des versions</h2>
                            <ul className="list-disc pl-6 text-sm">
                                <li><strong>13 août 2026</strong> — Ajout du résumé, des sections paiement/remboursement et de l&apos;historique des versions.</li>
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
