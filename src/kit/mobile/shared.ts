import { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import { useNativeFormReset } from '../form-reset.js';
export const mobileClass = (name: string, extra?: string) =>
  `m-mobile m-mobile-${name}${extra ? ' ' + extra : ''}`;
export function useMobileValue<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
  control?: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
) {
  const [internal, setInternal] = useState(initial);
  const reset = useCallback(() => {
    if (value === undefined) setInternal(initial);
  }, [value, initial]);
  useNativeFormReset(control, reset);
  const current = value === undefined ? internal : value;
  const set = useCallback(
    (next: T) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, set, reset] as const;
}
export function splitCharacters(value: string) {
  return typeof Intl.Segmenter === 'function'
    ? Array.from(
        new Intl.Segmenter('pl', { granularity: 'grapheme' }).segment(value),
        (s) => s.segment,
      )
    : Array.from(value);
}
export function countCharacters(value: string) {
  return splitCharacters(value).length;
}
export function safeHref(href: string) {
  // Strip ASCII controls before rejecting obfuscated, unsupported URL schemes.
  // eslint-disable-next-line no-control-regex
  const value = href.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  return /^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:|^mailto:|^tel:/i.test(value)
    ? undefined
    : value;
}
