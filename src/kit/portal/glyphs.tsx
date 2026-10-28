import type { CSSProperties } from 'react';
import { PortalIcon } from './PortalIcon.js';
import type { PortalIconName } from './PortalIcon.js';
type GlyphProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
};
const glyph =
  (name: PortalIconName) =>
  ({ size = 24, className, style }: GlyphProps) => (
    <PortalIcon name={name} size={size} className={className} style={style} />
  );
export const ChevronLeft = glyph('AB_chevron_left');
export const ChevronRight = glyph('AB_chevron_right');
export const ChevronDown = glyph('AB_chevron_down');
// First/last-page shapes from the currently served Angular Material paginator:
// https://www.mobywatel.gov.pl/_angular_material_paginator.LIQBi9hrat.js
const paginatorGlyph =
  (path: string) =>
  ({ size = 24, className, style }: GlyphProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      <path d={path} />
    </svg>
  );
export const ChevronsLeft = paginatorGlyph(
  'M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z',
);
export const ChevronsRight = paginatorGlyph(
  'M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z',
);
export const CalendarDays = glyph('calendar-datepicker');
export const X = glyph('AE_x_mark');
export const Check = glyph('AE_check');
export const Info = glyph('AA_information_circle');
export const CheckCircle2 = glyph('AA_check_circle');
export const AlertTriangle = glyph('AA_exclamation_triangle');
export const AlertCircle = glyph('AA_exclamation_circle');
export const FileText = glyph('AD_document');
export const UploadCloud = glyph('AB_arrow_up_tray');
export const RotateCcw = glyph('AB_arrow_path');
export const ExternalLink = glyph('AB_arrow_top_right_on_square');
