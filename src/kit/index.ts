import './tokens.css';
import './components.css';
import tokenData from './tokens.json';
import originalColorData from './official-mobile-colors.json';

export * from './components.js';
export * from './patterns.js';
export * from './NativeIcon.js';
export const tokens = tokenData;
export interface OriginalColorSet {
  sourcePath: string;
  rawJSON: string;
  readAt: string;
  parsed: Record<string, unknown>;
  resolved: Array<{ appearance: string; hex: string; alpha: number; colorSpace: string }>;
}
export interface OfficialMobileColors {
  verifiedAt: string;
  source: string;
  sourceType: string;
  sourceRevision: string;
  scope: string;
  semanticMapping: Record<string, Record<string, string>>;
  darkAppearance: string;
  colors: Record<string, OriginalColorSet>;
}
export const officialMobileColors: OfficialMobileColors = originalColorData;

export * from './documentBackgrounds.js';
export * from './DocumentArtwork.js';
export * from './ServiceIcon.js';
export * from './SearchField.js';

export * from './OfficialIcon.js';

export * from './portal/index.js';
export * from './mobile/index.js';
export * from './landing/index.js';
