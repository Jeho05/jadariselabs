'use client';

import ShinyText from '@/components/ShinyText';
import BlurText from '@/components/BlurText';

export function PageHero({
  badge,
  title,
  subtitle,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-24">
      {/* Halos dorés */}
      <div className="gold-orb w-[520px] h-[520px] -top-44 -right-40 opacity-70" />
      <div className="gold-orb w-[420px] h-[420px] -bottom-44 -left-40 opacity-50" />
      <div className="hairline-gold absolute top-0 left-1/2 -translate-x-1/2 w-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-gold)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-gold)]" />
            </span>
            <ShinyText
              text={badge}
              speed={3}
              color="#B3A692"
              shineColor="#E8CD80"
              className="text-sm font-semibold tracking-wide uppercase"
            />
          </div>
        )}

        <BlurText
          as="h1"
          text={title}
          animateBy="words"
          delay={80}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] justify-center leading-tight"
        />

        {subtitle && (
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mt-6 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}