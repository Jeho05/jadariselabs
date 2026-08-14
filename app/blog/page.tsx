import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ButtonLink } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { IconArrowRight, IconClock, IconTag, IconMail } from '@/components/icons';
import { getAllPosts, formatPostDate } from '@/lib/blog';

export const metadata: Metadata = {
    title: 'Blog — JadaRiseLabs',
    description:
        'Guides, tutoriels et actualités sur l\'intelligence artificielle pour les créateurs et développeurs d\'Afrique de l\'Ouest.',
};

export default function BlogPage() {
    const posts = getAllPosts();

    const [featured, ...rest] = posts;

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <SiteHeader />
            <PageHero
                badge="Guides & tutoriels"
                title="Le blog JadaRiseLabs"
                subtitle="Apprenez à créer avec l'IA : guides pratiques, tutoriels et réflexions sur la créativité africaine."
            />

            <main className="flex-1">
                {/* Featured post */}
                <section className="relative z-10 px-6 py-12 md:px-12 lg:px-16">
                    <div className="max-w-6xl mx-auto">
                        <Link
                            href={`/blog/${featured.slug}`}
                            className="group grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch glass-dark rounded-3xl overflow-hidden gold-border-hover"
                        >
                            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[220px]">
                                {featured.thumbnail ? (
                                    <Image
                                        src={featured.thumbnail}
                                        alt={featured.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] opacity-20" />
                                )}
                                <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#1A1206] bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] shadow-lg shadow-[var(--color-gold)]/30">
                                    À la une
                                </span>
                            </div>
                            <div className="p-8 lg:p-10">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    {featured.tags.map((tag) => (
                                        <span key={tag} className="text-xs font-semibold text-[var(--color-gold-light)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 px-3 py-1 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-[var(--color-gold-light)] transition-colors">
                                    {featured.title}
                                </h2>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                                    {featured.subtitle}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-6">
                                    <span className="font-semibold text-[var(--color-text-primary)]">{featured.author} · {featured.authorRole}</span>
                                    <span>{formatPostDate(featured.date)}</span>
                                    <span className="inline-flex items-center gap-1">
                                        <IconClock size={14} />
                                        {featured.readingTime}
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-gold-light)]">
                                    Lire l&apos;article
                                    <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Post grid */}
                <section className="relative z-10 px-6 py-10 md:px-12 lg:px-16">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {rest.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group glass-dark rounded-2xl overflow-hidden gold-border-hover flex flex-col"
                            >
                                <div className="relative aspect-[16/9]">
                                    {post.thumbnail ? (
                                        <Image
                                            src={post.thumbnail}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] opacity-20" />
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {post.tags.map((tag) => (
                                            <span key={tag} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-gold-light)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 px-2.5 py-1 rounded-full">
                                                <IconTag size={11} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h2 className="text-lg font-bold mb-2 group-hover:text-[var(--color-gold-light)] transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] pt-4 border-t border-[var(--color-border)]">
                                        <span className="font-semibold text-[var(--color-text-primary)]">{post.author}</span>
                                        <span>{formatPostDate(post.date)}</span>
                                        <span className="inline-flex items-center gap-1 ml-auto">
                                            <IconClock size={12} />
                                            {post.readingTime}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Newsletter opt-in */}
                <section className="relative z-10 px-6 py-16 md:px-12 lg:px-16">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative glass-dark rounded-3xl p-8 md:p-12 text-center overflow-hidden">
                            <div className="gold-orb w-[300px] h-[300px] -top-24 -right-24 opacity-60" />
                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                    La newsletter du lab
                                </h2>
                                <p className="text-[var(--color-text-secondary)] mb-8">
                                    Un guide pratique par mois sur la création avec l&apos;IA,
                                    sans spam. Rejoignez 2 500+ lecteurs.
                                </p>
                                <form
                                    action="/signup"
                                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                                >
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                            <IconMail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            name="email"
                                            placeholder="votre@email.com"
                                            aria-label="Votre adresse email"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all"
                                        />
                                    </div>
                                    <ButtonLink href="/signup" variant="primary" className="sm:w-auto">
                                        S&apos;inscrire
                                    </ButtonLink>
                                </form>
                                <p className="text-xs text-[var(--color-text-muted)] mt-4">
                                    En vous inscrivant, vous créez un compte gratuit avec 50 crédits offerts.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
