import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProviderWrapper } from '@/components/language-provider-wrapper';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JadaRiseLabs — Laboratoire IA Tout-en-1',
  description:
    "Plateforme web tout-en-un qui démocratise l'accès aux IA génératives. Générez des images, chattez avec l'IA, créez des vidéos et plus encore.",
  keywords: ['IA', 'Intelligence Artificielle', 'Afrique', 'génération images', 'chatbot', 'JadaRiseLabs'],
  authors: [{ name: 'JadaRiseLabs' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jadariselabs.vercel.app'),
  openGraph: {
    title: 'JadaRiseLabs — Laboratoire IA Tout-en-1',
    description:
      "Plateforme web tout-en-un qui démocratise l'accès aux IA génératives pour le grand public africain. Images, Chat, Vidéo, Audio — tout en un.",
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    siteName: 'JadaRiseLabs',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JadaRiseLabs — Laboratoire IA Tout-en-1 pour l\'Afrique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JadaRiseLabs — Laboratoire IA Tout-en-1',
    description:
      "Générez des images, chattez avec l'IA, créez des vidéos. Plateforme IA africaine accessible à tous.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}>
        <LanguageProviderWrapper>
          {children}
        </LanguageProviderWrapper>
      </body>
    </html>
  );
}
