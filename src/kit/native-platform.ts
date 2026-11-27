export type NativePlatform = 'ios' | 'android';
export type NativePlatformChoice = NativePlatform | 'auto';

export function normalizeNativePlatformChoice(value: unknown): NativePlatformChoice {
  return value === 'ios' || value === 'android' ? value : 'auto';
}

export function nativePreviewPlatform(
  choice: NativePlatformChoice,
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent,
): NativePlatform {
  if (choice !== 'auto') return choice;
  return /Android/i.test(userAgent) ? 'android' : 'ios';
}
