// Demo du composant ImageStreamHero — aperçu de la refonte hero
// Images : Unsplash (photos stables, chaînées avec les params officiels)

import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const U = "https://images.unsplash.com";

const IMAGES = [
  {
    src: `${U}/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80`,
    alt: "Portrait masculin à la lumière chaude",
  },
  {
    src: `${U}/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80`,
    alt: "Circuit imprimé électronique",
  },
  {
    src: `${U}/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80`,
    alt: "Portrait féminin souriant",
  },
  {
    src: `${U}/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80`,
    alt: "Main robotique d'intelligence artificielle",
  },
  {
    src: `${U}/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80`,
    alt: "Portrait masculin posant",
  },
  {
    src: `${U}/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80`,
    alt: "Abstraction visuelle générée par IA",
  },
  {
    src: `${U}/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80`,
    alt: "Portrait féminin élégant",
  },
  {
    src: `${U}/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80`,
    alt: "Cybersécurité et réseaux lumineux",
  },
  {
    src: `${U}/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80`,
    alt: "Portrait féminin en noir et blanc",
  },
  {
    src: `${U}/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80`,
    alt: "Réseau mondial technologique",
  },
  {
    src: `${U}/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80`,
    alt: "Portrait féminin studio",
  },
  {
    src: `${U}/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80`,
    alt: "Rendu 3D abstrait organique",
  },
];

export default function ImageStreamHeroDemo() {
  return (
    <ImageStreamHero
      images={IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Votre travail,
            <br />
            au premier plan.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          Un hero qui mène avec les images au lieu de les décrire. Remplacez-les
          par les vôtres et le couloir se reconstruit autour d&apos;elles.
        </p>
      </div>
    </ImageStreamHero>
  );
}
