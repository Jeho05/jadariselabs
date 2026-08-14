import type { CSSProperties, RefObject } from 'react';

interface ScrollVelocityProps {
  scrollContainerRef?: RefObject<HTMLElement>;
  texts?: string[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: { input: number[]; output: number[] };
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}

declare const ScrollVelocity: (props: ScrollVelocityProps) => React.JSX.Element;

export default ScrollVelocity;
