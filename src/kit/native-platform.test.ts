import { describe, expect, test } from 'vitest';
import { nativePreviewPlatform, normalizeNativePlatformChoice } from './native-platform.js';

const android =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36';
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15';

describe('native platform preference', () => {
  test.each([
    [android, 'android'],
    [iphone, 'ios'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'ios'],
    ['', 'ios'],
  ])('resolves automatic platform for %s', (agent, expected) => {
    expect(nativePreviewPlatform('auto', agent)).toBe(expected);
  });

  test('manual platform takes precedence over the browser', () => {
    expect(nativePreviewPlatform('android', iphone)).toBe('android');
    expect(nativePreviewPlatform('ios', android)).toBe('ios');
  });

  test.each([null, undefined, '', 'auto', 'iOS', 'desktop', 1])(
    'uses Auto for unsupported preference %s',
    (preference) => {
      expect(normalizeNativePlatformChoice(preference)).toBe('auto');
    },
  );
});
