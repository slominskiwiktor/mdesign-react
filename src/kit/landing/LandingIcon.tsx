import type { CSSProperties } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  X,
  ExternalLink,
  Globe,
  Menu,
  Play,
  Star,
  ArrowDown,
  ArrowUp,
  Link,
  Award,
} from 'lucide-react';
const icons = {
  'arrow-right-black': ArrowRight,
  check: Check,
  'chevron-right': ChevronRight,
  'close-black': X,
  external: ExternalLink,
  'globe-white': Globe,
  globe: Globe,
  hamburger: Menu,
  play: Play,
  play2: Play,
  star: Star,
  'arrow-down-blue': ArrowDown,
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  facebook: Link,
  linkedin: Link,
  wreath: Award,
  x: X,
} as const;
export const landingIconNames = Object.keys(icons) as Array<keyof typeof icons>;
export type LandingIconName = keyof typeof icons;
export interface LandingIconProps {
  name: LandingIconName;
  size?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
}
/** Lucide ISC icons, independent of the original landing SVG files. */
export function LandingIcon({ name, size = 24, title, className, style }: LandingIconProps) {
  const Icon = icons[name];
  return (
    <Icon
      size={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={!title}
      className={className}
      style={{ flexShrink: 0, ...style }}
    />
  );
}
