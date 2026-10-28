import apply_light from './service-icons/apply-light.svg';
import apply_dark from './service-icons/apply-dark.svg';
import pesel_light from './service-icons/pesel-light.svg';
import pesel_dark from './service-icons/pesel-dark.svg';
import my_cases_light from './service-icons/my-cases-light.svg';
import my_cases_dark from './service-icons/my-cases-dark.svg';
import verify_id_light from './service-icons/verify-id-light.svg';
import verify_id_dark from './service-icons/verify-id-dark.svg';
import cybersecurity_light from './service-icons/cybersecurity-light.svg';
import cybersecurity_dark from './service-icons/cybersecurity-dark.svg';
import verify_pesel_light from './service-icons/verify-pesel-light.svg';
import verify_pesel_dark from './service-icons/verify-pesel-dark.svg';
import { NativeIcon } from './NativeIcon.js';
import type { NativeIconProps } from './NativeIcon.js';
import './service-icons.css';

const variants = {
  apply: { light: apply_light, dark: apply_dark },
  pesel: { light: pesel_light, dark: pesel_dark },
  'my-cases': { light: my_cases_light, dark: my_cases_dark },
  'verify-id': { light: verify_id_light, dark: verify_id_dark },
  cybersecurity: { light: cybersecurity_light, dark: cybersecurity_dark },
  'verify-pesel': { light: verify_pesel_light, dark: verify_pesel_dark },
} as const;
export const serviceIconNames = Object.keys(variants) as Array<keyof typeof variants>;
export interface ServiceIconProps extends NativeIconProps {
  theme?: 'light' | 'dark';
}
/** Reference-matched service shapes; NativeIcon preserves the published originals. */
export function ServiceIcon({
  name,
  theme,
  size = 24,
  title,
  className = '',
  style,
  monochrome,
}: ServiceIconProps) {
  if (!(name in variants))
    return (
      <NativeIcon
        name={name}
        size={size}
        title={title}
        className={className}
        style={style}
        monochrome={monochrome}
      />
    );
  const source = variants[name as keyof typeof variants];
  return (
    <span
      className={`m-service-artwork ${className}`}
      data-theme={theme}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={!title}
      style={{ width: size, height: size, ...style }}
    >
      <img className="m-service-artwork-light" src={source.light} alt="" aria-hidden="true" />
      <img className="m-service-artwork-dark" src={source.dark} alt="" aria-hidden="true" />
    </span>
  );
}
