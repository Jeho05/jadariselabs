import type { ReactNode } from 'react';

interface FadeContentProps {
  children: ReactNode;
  container?: string | HTMLElement;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  initialOpacity?: number;
  animateOpacity?: boolean;
  className?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
}

declare const FadeContent: (props: FadeContentProps) => React.JSX.Element;

export default FadeContent;
