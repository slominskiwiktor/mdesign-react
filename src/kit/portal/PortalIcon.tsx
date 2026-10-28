import type { CSSProperties } from 'react';
import icon183 from '../official-icons/icon-183.svg';
import icon178 from '../official-icons/icon-178.svg';
import icon193 from '../official-icons/icon-193.svg';
import icon197 from '../official-icons/icon-197.svg';
import icon204 from '../official-icons/icon-204.svg';
import icon205 from '../official-icons/icon-205.svg';
import icon207 from '../official-icons/icon-207.svg';
import icon208 from '../official-icons/icon-208.svg';
import icon209 from '../official-icons/icon-209.svg';
import icon211 from '../official-icons/icon-211.svg';
import icon212 from '../official-icons/icon-212.svg';
import icon216 from '../official-icons/icon-216.svg';
import icon298 from '../official-icons/icon-298.svg';
import icon218 from '../official-icons/icon-218.svg';
import icon219 from '../official-icons/icon-219.svg';
import icon220 from '../official-icons/icon-220.svg';
import icon222 from '../official-icons/icon-222.svg';
import icon232 from '../official-icons/icon-232.svg';
import icon233 from '../official-icons/icon-233.svg';
import icon270 from '../official-icons/icon-270.svg';
import icon272 from '../official-icons/icon-272.svg';
import icon273 from '../official-icons/icon-273.svg';
import icon274 from '../official-icons/icon-274.svg';
import icon279 from '../official-icons/icon-279.svg';
import icon285 from '../official-icons/icon-285.svg';
import icon287 from '../official-icons/icon-287.svg';
import icon291 from '../official-icons/icon-291.svg';
import icon301 from '../official-icons/icon-301.svg';
import icon302 from '../official-icons/icon-302.svg';
import icon312 from '../official-icons/icon-312.svg';
import icon317 from '../official-icons/icon-317.svg';
import icon307 from '../official-icons/icon-307.svg';
import icon340 from '../official-icons/icon-340.svg';

/** Compatibility aliases backed only by native COI MIT SVGs. Original portal icons were withdrawn. */
export const portalIconNames = [
  'AA_check_circle',
  'AA_exclamation_circle',
  'AA_exclamation_triangle',
  'AA_information_circle',
  'AA_question_mark_circle',
  'AB_arrow_path',
  'AB_arrow_right_start_on_rectangle',
  'AB_arrow_top_right_on_square',
  'AB_arrow_up_tray',
  'AB_chevron_down',
  'AB_chevron_left',
  'AB_chevron_right',
  'AC_home',
  'AD_document',
  'AD_document_pen',
  'AD_document_plus',
  'AD_folder',
  'AE_bars_3',
  'AE_bell',
  'AE_check',
  'AE_inbox',
  'AE_magnifying_glass',
  'AE_x_mark',
  'AF_credit_card',
  'AF_wallet',
  'AH_envelope',
  'AH_mobile',
  'AI_car',
  'AI_compass_needle',
  'AJ_user',
  'AJ_user_square',
  'BJ_user',
  'arrow-go-back',
  'calendar-datepicker',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'download',
  'error',
  'hamburger',
  'plus',
  'remove',
  'remove-thin',
  'upload',
] as const;
export type PortalIconName = (typeof portalIconNames)[number];
const sources: Record<PortalIconName, string> = {
  AA_check_circle: icon279,
  AA_exclamation_circle: icon317,
  AA_exclamation_triangle: icon317,
  AA_information_circle: icon178,
  AA_question_mark_circle: icon218,
  AB_arrow_path: icon270,
  AB_arrow_right_start_on_rectangle: icon222,
  AB_arrow_top_right_on_square: icon298,
  AB_arrow_up_tray: icon272,
  AB_chevron_down: icon211,
  AB_chevron_left: icon208,
  AB_chevron_right: icon209,
  AC_home: icon204,
  AD_document: icon193,
  AD_document_pen: icon220,
  AD_document_plus: icon197,
  AD_folder: icon302,
  AE_bars_3: icon307,
  AE_bell: icon216,
  AE_check: icon279,
  AE_inbox: icon302,
  AE_magnifying_glass: icon205,
  AE_x_mark: icon212,
  AF_credit_card: icon312,
  AF_wallet: icon287,
  AH_envelope: icon183,
  AH_mobile: icon291,
  AI_car: icon340,
  AI_compass_needle: icon301,
  AJ_user: icon232,
  AJ_user_square: icon233,
  BJ_user: icon232,
  'arrow-go-back': icon207,
  'calendar-datepicker': icon274,
  'chevron-down': icon211,
  'chevron-left': icon208,
  'chevron-right': icon209,
  download: icon273,
  error: icon285,
  hamburger: icon307,
  plus: icon219,
  remove: icon212,
  'remove-thin': icon212,
  upload: icon272,
};
export interface PortalIconProps {
  name: PortalIconName;
  size?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
  originalColor?: boolean;
}
export function PortalIcon({
  name,
  size = 24,
  title,
  className,
  style,
  originalColor = false,
}: PortalIconProps) {
  return originalColor ? (
    <img
      src={sources[name]}
      alt={title ?? ''}
      aria-hidden={!title}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  ) : (
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
        backgroundColor: 'currentColor',
        mask: `url("${sources[name]}") center / contain no-repeat`,
        WebkitMask: `url("${sources[name]}") center / contain no-repeat`,
        ...style,
      }}
    />
  );
}
