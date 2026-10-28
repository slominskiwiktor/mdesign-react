import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Wait until native and delegated reset handlers have both had a chance to cancel. */
export function useNativeFormReset(
  control: RefObject<FormControl | null> | undefined,
  onReset: () => void,
) {
  const latestReset = useRef(onReset);
  latestReset.current = onReset;
  const pending = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => () => pending.current.forEach(clearTimeout), []);
  useEffect(() => {
    const form = control?.current?.form;
    if (!form) return;
    const reset = (event: Event) => {
      const timer = setTimeout(() => {
        pending.current.delete(timer);
        if (!event.defaultPrevented) latestReset.current();
      }, 0);
      pending.current.add(timer);
    };
    form.addEventListener('reset', reset);
    return () => {
      form.removeEventListener('reset', reset);
    };
  });
}
