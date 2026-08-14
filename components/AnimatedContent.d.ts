import type { ReactNode } from 'react';

interface AnimatedContentProps {
  children: ReactNode;
  container?: string | HTMLElement;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
}

declare const AnimatedContent: (props: AnimatedContentProps) => React.JSX.Element;

export default AnimatedContent;
