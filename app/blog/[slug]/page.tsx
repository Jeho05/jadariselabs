import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { IconArrowRight, IconClock, IconTag } from '@/components/icons';
import { getAllPosts, getPostBySlug, getRelatedPosts, formatPostDate } from '@/lib/blog';

export function generateStaticParams() {
    return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const post = getPostBySlug(params.slug);
    if (!post) return { title: 'Article — JadaRiseLabs' };

    return {
        title: `${post.title} — JadaRiseLabs`,
        description: post.excerpt,
    };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);
    if (!post) notFound();

    const related = getRelatedPosts(post);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <SiteHeader />

            <main className="flex-1 pt-28 md:pt-32">
                <article className="relative z-10 px-6 md:px-12 lg:px-16">
                    <div className="max-w-3xl mx-auto">
                        {/* Breadcrumb */}
                        <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-[var(--color-text-muted)]">
                            <Link href="/" className="hover:text-[var(--color-gold-light)]">Accueil</Link>
                            <span className="mx-2">/</span>
                            <Link href="/blog" className="hover:text-[var(--color-gold-light)]">Blog</Link>
                        </nav>

                        {/* Title */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {post.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href="/blog"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-gold-light)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 px-3 py-1 rounded-full hover:bg-[var(--color-gold)]/[0.18] transition-colors"
                                >
                                    <IconTag size={11} />
                                    {tag}
                                </Link>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                            {post.title}
                        </h1>
                        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6">
                            {post.subtitle}
                        </p>

                        {/* Author + meta */}
                        <div className="flex flex-wrap items-center gap-4 py-5 border-y border-[var(--color-border)] mb-8">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center text-white font-bold">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{post.author}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">{post.authorRole}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] ml-auto">
                                <span>{formatPostDate(post.date)}</span>
                                <span className="inline-flex items-center gap-1">
                                    <IconClock size={14} />
                                    {post.readingTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    {post.thumbnail && (
                        <div className="max-w-4xl mx-auto mb-10">
                            <div className="relative aspect-[16/7] rounded-3xl overflow-hidden shadow-lg">
                                <Image
                                    src={post.thumbnail}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 896px) 100vw, 896px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-6">
                            {post.content.map((paragraph, i) => (
                                <p key={i} className="text-[var(--color-text-primary)] leading-relaxed text-[17px]">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {/* Share */}
                        <div className="flex flex-wrap items-center gap-3 mt-10 pt-6 border-t border-[var(--color-border)]">
                            <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                                Partager :
                            </span>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://jadariselabs.vercel.app/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.18] transition-colors"
                            >
                                X / Twitter
                            </a>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://jadariselabs.vercel.app/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.18] transition-colors"
                            >
                                Facebook
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://jadariselabs.vercel.app/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.18] transition-colors"
                            >
                                LinkedIn
                            </a>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — https://jadariselabs.vercel.app/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 text-[var(--color-gold-light)] hover:bg-[var(--color-gold)]/[0.18] transition-colors"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </article>

                {/* Lead conversion */}
                <section className="relative z-10 px-6 py-12 md:px-12 lg:px-16">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative glass-dark rounded-3xl p-8 md:p-10 text-center overflow-hidden gold-border-hover">
                            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundSize: '150px' }} />
                            <div className="gold-orb w-[280px] h-[280px] -top-20 -right-20 opacity-50" />
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Passez à la pratique
                                </h2>
                                <p className="text-[var(--color-text-secondary)] mb-6">
                                    50 crédits offerts pour créer vos premières images, vidéos et voix avec l&apos;IA.
                                </p>
                                <a href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] text-[#1A1206] shadow-md shadow-[var(--color-gold)]/30 hover:shadow-lg hover:shadow-[var(--color-gold)]/50 hover:-translate-y-0.5 transition-all">
                                    Créer un compte gratuit
                                    <IconArrowRight size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related articles */}
                {related.length > 0 && (
                    <section className="relative z-10 px-6 py-10 md:px-12 lg:px-16">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                                À lire ensuite
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {related.map((article) => (
                                    <Link
                                        key={article.slug}
                                        href={`/blog/${article.slug}`}
                                        className="group glass-dark rounded-2xl overflow-hidden gold-border-hover flex flex-col"
                                    >
                                        <div className="relative aspect-[16/8]">
                                            {article.thumbnail ? (
                                                <Image
                                                    src={article.thumbnail}
                                                    alt={article.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] opacity-20" />
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold mb-2 group-hover:text-[var(--color-gold-light)] transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                {article.author} · {formatPostDate(article.date)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}