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
  openGraph: {
    title: 'JadaRiseLabs — Laboratoire IA Tout-en-1',
    description:
      "Plateforme web tout-en-un qui démocratise l'accès aux IA génératives pour le grand public africain.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'JadaRiseLabs',
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
