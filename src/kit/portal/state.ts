import { useCallback, useState } from 'react';
export function usePortalState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [local, setLocal] = useState(defaultValue);
  const current = value === undefined ? local : value;
  const set = useCallback(
    (next: T) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, set] as const;
}
export const portalClass = (...values: Array<string | false | undefined>) =>
  values.filter(Boolean).join(' ');
