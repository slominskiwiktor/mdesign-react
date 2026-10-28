/** Date-only helpers deliberately avoid UTC parsing and DST-dependent millisecond arithmetic. */
export function parsePortalDate(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return d.getFullYear() === Number(m[1]) &&
    d.getMonth() === Number(m[2]) - 1 &&
    d.getDate() === Number(m[3])
    ? d
    : undefined;
}
export function formatPortalDate(date: Date) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addPortalDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}
export function addPortalMonths(date: Date, months: number) {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    Math.min(date.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
    12,
  );
}
export function portalDateInRange(value: string, min?: string, max?: string) {
  return !!parsePortalDate(value) && (!min || value >= min) && (!max || value <= max);
}
