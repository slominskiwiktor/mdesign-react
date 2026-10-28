import nativeClose from './native-icons/close.svg';
import nativeChevronDown from './native-icons/chevron-down.svg';
import nativeFieldClear from './native-icons/field-clear.svg';
import nativeChevronRight from './native-icons/chevron-right.svg';
import nativeChevronLeft from './native-icons/chevron-left.svg';
import nativeStatusMinus from './native-icons/status-minus.svg';
import nativeStatusNotice from './native-icons/status-notice.svg';
import nativeStatusError from './native-icons/status-error.svg';
import nativeStatusSuccess from './native-icons/status-success.svg';
import nativeStatusInfo from './native-icons/status-info.svg';
import nativeSupportSuccess from './native-icons/support-success.svg';
import nativeSupportError from './native-icons/support-error.svg';
import nativeSupportWarning from './native-icons/support-warning.svg';
import nativeSupportInfo from './native-icons/support-info.svg';
import nativeHidePassword from './native-icons/hide-password.svg';
import nativeShowPassword from './native-icons/show-password.svg';
import nativeFieldError from './native-icons/field-error.svg';
import nativeCheckboxMark from './native-icons/checkbox-mark.svg';
import type { CSSProperties } from 'react';
import peselSource from './native-icons/pesel.svg';
import verifyPeselSource from './native-icons/verify-pesel.svg';
import cybersecuritySource from './native-icons/cybersecurity.svg';
import verifyIdSource from './native-icons/verify-id.svg';
import applySource from './native-icons/apply.svg';
import myCasesSource from './native-icons/my-cases.svg';
import paymentsSource from './native-icons/payments.svg';
import carHistorySource from './native-icons/car-history.svg';
import collisionSource from './native-icons/collision.svg';
import signatureSource from './native-icons/signature.svg';
import penaltyPointsSource from './native-icons/penalty-points.svg';
import documentsSource from './native-icons/documents.svg';
import servicesSource from './native-icons/services.svg';
import qrSource from './native-icons/qr.svg';
import moreSource from './native-icons/more.svg';
import idDocumentSource from './native-icons/id-document.svg';
import pensionCardSource from './native-icons/pension-card.svg';
import familyCardSource from './native-icons/family-card.svg';
import vehiclesSource from './native-icons/vehicles.svg';
import drivingLicenseSource from './native-icons/driving-license.svg';
import documentsFilledSource from './native-icons/documents-filled.svg';
import servicesFilledSource from './native-icons/services-filled.svg';
import qrFilledSource from './native-icons/qr-filled.svg';
import moreFilledSource from './native-icons/more-filled.svg';
import searchSource from './native-icons/search.svg';
import checkSource from './native-icons/check.svg';
import backSource from './native-icons/back.svg';
import gridSource from './native-icons/grid.svg';
import listSource from './native-icons/list.svg';
import bellSource from './native-icons/bell.svg';
import helpSource from './native-icons/help.svg';
import plusSource from './native-icons/plus.svg';
import idLogoSource from './native-icons/id-logo.svg';
import pensionLogoSource from './native-icons/pension-logo.svg';
import familyLogoSource from './native-icons/family-logo.svg';

/** Exact SVG assets from the pinned native mObywatel design-system snapshot. */
export const nativeIconNames = [
  'close',
  'chevron-down',
  'field-clear',
  'chevron-right',
  'chevron-left',
  'status-minus',
  'status-notice',
  'status-error',
  'status-success',
  'status-info',
  'support-success',
  'support-error',
  'support-warning',
  'support-info',
  'hide-password',
  'show-password',
  'field-error',
  'checkbox-mark',
  'pesel',
  'verify-pesel',
  'cybersecurity',
  'verify-id',
  'apply',
  'my-cases',
  'payments',
  'car-history',
  'collision',
  'signature',
  'penalty-points',
  'documents',
  'services',
  'qr',
  'more',
  'id-document',
  'pension-card',
  'family-card',
  'vehicles',
  'driving-license',
  'documents-filled',
  'services-filled',
  'qr-filled',
  'more-filled',
  'search',
  'check',
  'back',
  'grid',
  'list',
  'bell',
  'help',
  'plus',
  'id-logo',
  'pension-logo',
  'family-logo',
] as const;

export type NativeIconName = (typeof nativeIconNames)[number];

const nativeIconSources: Record<NativeIconName, string> = {
  close: nativeClose,
  'chevron-down': nativeChevronDown,
  'field-clear': nativeFieldClear,
  'chevron-right': nativeChevronRight,
  'chevron-left': nativeChevronLeft,
  'status-minus': nativeStatusMinus,
  'status-notice': nativeStatusNotice,
  'status-error': nativeStatusError,
  'status-success': nativeStatusSuccess,
  'status-info': nativeStatusInfo,
  'support-success': nativeSupportSuccess,
  'support-error': nativeSupportError,
  'support-warning': nativeSupportWarning,
  'support-info': nativeSupportInfo,
  'hide-password': nativeHidePassword,
  'show-password': nativeShowPassword,
  'field-error': nativeFieldError,
  'checkbox-mark': nativeCheckboxMark,
  pesel: peselSource,
  'verify-pesel': verifyPeselSource,
  cybersecurity: cybersecuritySource,
  'verify-id': verifyIdSource,
  apply: applySource,
  'my-cases': myCasesSource,
  payments: paymentsSource,
  'car-history': carHistorySource,
  collision: collisionSource,
  signature: signatureSource,
  'penalty-points': penaltyPointsSource,
  documents: documentsSource,
  services: servicesSource,
  qr: qrSource,
  more: moreSource,
  'id-document': idDocumentSource,
  'pension-card': pensionCardSource,
  'family-card': familyCardSource,
  vehicles: vehiclesSource,
  'driving-license': drivingLicenseSource,
  'documents-filled': documentsFilledSource,
  'services-filled': servicesFilledSource,
  'qr-filled': qrFilledSource,
  'more-filled': moreFilledSource,
  search: searchSource,
  check: checkSource,
  back: backSource,
  grid: gridSource,
  list: listSource,
  bell: bellSource,
  help: helpSource,
  plus: plusSource,
  'id-logo': idLogoSource,
  'pension-logo': pensionLogoSource,
  'family-logo': familyLogoSource,
};

export interface NativeIconProps {
  name: NativeIconName;
  size?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
  /** Tint monochrome symbols through currentColor; native colored artwork stays unchanged. */
  monochrome?: boolean;
}

/** Decorative by default. Provide title when the image itself conveys meaning. */
export function NativeIcon({
  name,
  size = 24,
  title,
  className,
  style,
  monochrome,
}: NativeIconProps) {
  const isMonochrome =
    monochrome ??
    [
      'field-clear',
      'chevron-down',
      'close',
      'documents',
      'services',
      'qr',
      'more',
      'documents-filled',
      'services-filled',
      'qr-filled',
      'more-filled',
      'search',
      'check',
      'back',
      'grid',
      'list',
      'bell',
      'help',
      'plus',
      'verify-id',
      'checkbox-mark',
      'field-error',
      'show-password',
      'hide-password',
      'status-info',
      'status-success',
      'status-error',
      'status-notice',
      'status-minus',
      'chevron-left',
      'chevron-right',
    ].includes(name);
  if (isMonochrome)
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
          backgroundColor: 'currentColor',
          mask: `url("${nativeIconSources[name]}") center / contain no-repeat`,
          WebkitMask: `url("${nativeIconSources[name]}") center / contain no-repeat`,
          ...style,
        }}
      />
    );
  return (
    <img
      src={nativeIconSources[name]}
      alt={title ?? ''}
      aria-hidden={!title}
      width={size}
      height={size}
      className={className}
      style={{ ...style, objectFit: 'contain' }}
    />
  );
}
