'use client';

import BlurText from '@/components/BlurText';
import GradientText from '@/components/GradientText';
import { IconSparkle } from '@/components/icons';

export function SectionHeading({
  title,
  accent,
  subtitle,
  eyebrow,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="text-center mb-16">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 rounded-full px-5 py-2 mb-6">
          <IconSparkle size={16} className="text-[var(--color-gold)]" />
          <span className="text-[var(--color-gold-light)] text-sm font-semibold">{eyebrow}</span>
        </div>
      )}
      <h2 className="flex items-center justify-center gap-3 flex-wrap">
        <BlurText
          as="span"
          text={title}
          animateBy="words"
          delay={70}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] justify-center"
        />
        {accent && (
          <GradientText
            colors={['#D4AF37', '#E8CD80', '#C08552']}
            animationSpeed={6}
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            {accent}
          </GradientText>
        )}
      </h2>
      {subtitle && (
        <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg mt-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}