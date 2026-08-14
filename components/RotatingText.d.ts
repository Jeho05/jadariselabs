import type { ReactNode, Transition } from 'react';

interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  initial?: { y?: string | number; opacity?: number } | Record<string, unknown>;
  animate?: { y?: string | number; opacity?: number } | Record<string, unknown>;
  exit?: { y?: string | number; opacity?: number } | Record<string, unknown>;
  animatePresenceMode?: 'sync' | 'wait' | 'popLayout';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words';
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  children?: ReactNode;
}

declare const RotatingText: React.ForwardRefExoticComponent<
  RotatingTextProps & React.RefAttributes<unknown>
>;

export default RotatingText;
