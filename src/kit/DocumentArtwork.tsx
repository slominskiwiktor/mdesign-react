import type { CSSProperties } from 'react';
import id from './document-assets/demo/id.svg';
import pension from './document-assets/demo/pension.svg';
import family from './document-assets/demo/family.svg';
import vehicles from './document-assets/demo/vehicles.svg';
import './document-artwork.css';

export type DocumentArtworkVariant = 'id' | 'pension' | 'family' | 'vehicles';
export interface DocumentArtworkProps {
  variant: DocumentArtworkVariant;
  className?: string;
  style?: CSSProperties;
}
const sources = { id, pension, family, vehicles } as const;
/** Neutral demo artwork, independent of official document graphics. Decorative only. */
export function DocumentArtwork({ variant, className = '', style }: DocumentArtworkProps) {
  return (
    <span
      className={`m-document-artwork m-document-artwork--${variant} ${className}`}
      aria-hidden="true"
      style={style}
    >
      <img src={sources[variant]} alt="" />
    </span>
  );
}
