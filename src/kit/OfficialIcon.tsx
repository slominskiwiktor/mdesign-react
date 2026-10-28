import type { CSSProperties } from 'react';
import { officialIconSources, officialIconNames } from './official-icons/registry.js';
import type { OfficialIconName } from './official-icons/registry.js';
export { officialIconSources, officialIconNames };
export type { OfficialIconName };
export interface OfficialIconProps {
  name: OfficialIconName;
  size?: number | string;
  title?: string;
  monochrome?: boolean;
  className?: string;
  style?: CSSProperties;
}
/** Pinned icon API with neutral demo replacements for withdrawn document markings. */
export function OfficialIcon({
  name,
  size = 24,
  title,
  monochrome = name.includes('/Outline/'),
  className,
  style,
}: OfficialIconProps) {
  const source = officialIconSources[name];
  if (monochrome)
    return (
      <span
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={!title}
        className={className}
        style={{
          display: 'inline-block',
          flexShrink: 0,
          width: size,
          height: size,
          background: 'currentColor',
          mask: `url("${source}") center / contain no-repeat`,
          WebkitMask: `url("${source}") center / contain no-repeat`,
          ...style,
        }}
      />
    );
  return (
    <img
      className={className}
      src={source}
      alt={title ?? ''}
      aria-hidden={!title}
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0, objectFit: 'contain', ...style }}
    />
  );
}
