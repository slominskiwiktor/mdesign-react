import { forwardRef, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactElement, ReactNode, Ref, RefAttributes } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from './glyphs.js';
import { usePortalState, portalClass } from './state.js';
function positive(value: number, fallback: number) {
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
}
function nonnegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
export interface PortalPaginationProps {
  total: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
  disabled?: boolean;
}
export function PortalPagination({
  total,
  page,
  defaultPage = 1,
  onPageChange,
  pageSize,
  defaultPageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  label = 'Stronicowanie',
  disabled,
}: PortalPaginationProps) {
  const [rawSize, setSize] = usePortalState(pageSize, defaultPageSize, onPageSizeChange);
  const size = positive(rawSize, 10);
  const [rawCurrent, setCurrent] = usePortalState(page, defaultPage, onPageChange);
  const current = positive(rawCurrent, 1);
  const totalItems = nonnegative(total);
  const count = Math.max(1, Math.ceil(totalItems / size));
  const actual = Math.min(count, Math.max(1, current));
  return (
    <nav className="mp-pagination" aria-label={label}>
      <label>
        Wierszy na stronie{' '}
        <select
          value={size}
          disabled={disabled}
          onChange={(e) => {
            setSize(Number(e.target.value));
            setCurrent(1);
          }}
        >
          {Array.from(new Set([size, ...pageSizeOptions]))
            .filter((n) => Number.isFinite(n) && n >= 1)
            .sort((a, b) => a - b)
            .map((n) => (
              <option value={n} key={n}>
                {n}
              </option>
            ))}
        </select>
      </label>
      <span role="status">
        {totalItems
          ? `${(actual - 1) * size + 1}–${Math.min(actual * size, totalItems)} z ${totalItems}`
          : '0 wyników'}
      </span>
      <div>
        {[
          { label: 'Pierwsza strona', n: 1, icon: <ChevronsLeft size={18} /> },
          { label: 'Poprzednia strona', n: actual - 1, icon: <ChevronLeft size={18} /> },
        ].map((b) => (
          <button
            type="button"
            key={b.label}
            aria-label={b.label}
            disabled={disabled || actual === 1}
            onClick={() => setCurrent(b.n)}
          >
            {b.icon}
          </button>
        ))}
        <span aria-label={`Strona ${actual} z ${count}`}>
          {actual} / {count}
        </span>
        {[
          { label: 'Następna strona', n: actual + 1, icon: <ChevronRight size={18} /> },
          { label: 'Ostatnia strona', n: count, icon: <ChevronsRight size={18} /> },
        ].map((b) => (
          <button
            type="button"
            key={b.label}
            aria-label={b.label}
            disabled={disabled || actual === count}
            onClick={() => setCurrent(b.n)}
          >
            {b.icon}
          </button>
        ))}
      </div>
    </nav>
  );
}
export interface PortalTableColumn<T> {
  key: string;
  header: ReactNode;
  label?: string;
  accessor?: (row: T) => unknown;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  compare?: (a: T, b: T) => number;
  width?: number;
  minWidth?: number;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
}
export interface PortalTableSort {
  key: string;
  direction: 'ascending' | 'descending';
}
export interface PortalDataTableProps<T> {
  rows: readonly T[];
  columns: PortalTableColumn<T>[];
  rowKey: (row: T) => string;
  caption: string;
  sort?: PortalTableSort | null;
  defaultSort?: PortalTableSort | null;
  onSortChange?: (sort: PortalTableSort | null) => void;
  selection?: readonly string[];
  defaultSelection?: readonly string[];
  onSelectionChange?: (keys: string[]) => void;
  selectable?: boolean;
  isRowDisabled?: (row: T) => boolean;
  rowLabel?: (row: T) => string;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  pagination?: boolean;
  empty?: ReactNode;
  loading?: boolean;
  stickyHeader?: boolean;
  minWidth?: number | string;
  layout?: 'auto' | 'fixed';
  className?: string;
  style?: CSSProperties;
  onRowActivate?: (row: T) => void;
}
function SelectionBox({
  mixed,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { mixed?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!mixed;
  }, [mixed]);
  return <input {...props} type="checkbox" ref={ref} />;
}
function DataTableInner<T>(
  {
    rows,
    columns,
    rowKey,
    caption,
    sort,
    defaultSort = null,
    onSortChange,
    selection,
    defaultSelection = [],
    onSelectionChange,
    selectable,
    isRowDisabled,
    rowLabel,
    page,
    defaultPage = 1,
    onPageChange,
    pageSize,
    defaultPageSize = 10,
    onPageSizeChange,
    pageSizeOptions,
    pagination = true,
    empty = 'Brak danych do wyświetlenia.',
    loading,
    stickyHeader,
    minWidth,
    layout = 'auto',
    className,
    style,
    onRowActivate,
  }: PortalDataTableProps<T>,
  ref: Ref<HTMLTableElement>,
) {
  const [order, setOrder] = usePortalState(sort, defaultSort, onSortChange);
  const [selected, setSelected] = usePortalState<readonly string[]>(
    selection,
    defaultSelection,
    (v) => onSelectionChange?.([...v]),
  );
  const [rawCurrent, setCurrent] = usePortalState(page, defaultPage, onPageChange);
  const current = positive(rawCurrent, 1);
  const [rawSize, setSize] = usePortalState(pageSize, defaultPageSize, onPageSizeChange);
  const size = positive(rawSize, 10);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);
  const value = (column: PortalTableColumn<T>, row: T) =>
    column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.key];
  const ordered = [...rows];
  if (order) {
    const column = columns.find((c) => c.key === order.key);
    if (column)
      ordered.sort((a, b) => {
        const n = column.compare
          ? column.compare(a, b)
          : String(value(column, a) ?? '').localeCompare(String(value(column, b) ?? ''), 'pl', {
              numeric: true,
            });
        return order.direction === 'ascending' ? n : -n;
      });
  }
  const actualPage = Math.min(Math.max(1, current), Math.max(1, Math.ceil(ordered.length / size)));
  const visible = pagination ? ordered.slice((actualPage - 1) * size, actualPage * size) : ordered;
  const enabled = visible.filter((r) => !isRowDisabled?.(r)).map(rowKey);
  const checked = enabled.length > 0 && enabled.every((k) => selected.includes(k));
  const mixed = !checked && enabled.some((k) => selected.includes(k));
  function toggle(key: string) {
    setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }
  function resize(column: PortalTableColumn<T>, start: number) {
    setWidths((previous) => ({
      ...previous,
      [column.key]: Math.max(column.minWidth ?? 48, start),
    }));
  }
  return (
    <section
      className={portalClass('mp-data-table', className)}
      style={style}
      aria-busy={loading || undefined}
    >
      <div className="mp-table-scroll">
        <table
          ref={ref}
          style={{ minWidth: minWidth ?? (visible.length ? 600 : undefined), tableLayout: layout }}
          className={stickyHeader ? 'mp-table-sticky' : ''}
        >
          <caption>{caption}</caption>
          <colgroup>
            {selectable && <col style={{ width: 52 }} />}
            {columns.map((c) => (
              <col key={c.key} style={{ width: widths[c.key] ?? c.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {selectable && (
                <th scope="col">
                  <SelectionBox
                    aria-label="Zaznacz wszystkie wiersze na tej stronie"
                    checked={checked}
                    mixed={mixed}
                    disabled={!enabled.length || loading}
                    onChange={() =>
                      setSelected(
                        checked
                          ? selected.filter((k) => !enabled.includes(k))
                          : Array.from(new Set([...selected, ...enabled])),
                      )
                    }
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  scope="col"
                  key={c.key}
                  aria-sort={
                    order?.key === c.key ? order.direction : c.sortable ? 'none' : undefined
                  }
                  style={{ textAlign: c.align }}
                >
                  {c.sortable ? (
                    <button
                      className="mp-sort"
                      type="button"
                      onClick={() => {
                        setOrder(
                          order?.key !== c.key
                            ? { key: c.key, direction: 'ascending' }
                            : order.direction === 'ascending'
                              ? { key: c.key, direction: 'descending' }
                              : null,
                        );
                        setCurrent(1);
                      }}
                    >
                      {c.header}
                      <ChevronDown
                        size={16}
                        style={{
                          transform:
                            order?.key === c.key && order.direction === 'ascending'
                              ? 'rotate(180deg)'
                              : undefined,
                        }}
                      />
                    </button>
                  ) : (
                    c.header
                  )}
                  {c.resizable && (
                    <span
                      className="mp-column-resize"
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Szerokość kolumny ${c.label ?? c.key}`}
                      aria-valuenow={widths[c.key] ?? c.width ?? 160}
                      aria-valuemin={c.minWidth ?? 48}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                          e.preventDefault();
                          resize(
                            c,
                            (widths[c.key] ?? c.width ?? 160) + (e.key === 'ArrowRight' ? 8 : -8),
                          );
                        }
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        cleanup.current();
                        const startX = e.clientX,
                          startWidth =
                            e.currentTarget.parentElement?.getBoundingClientRect().width ?? 160;
                        const move = (ev: PointerEvent) =>
                          resize(c, startWidth + ev.clientX - startX);
                        const finish = () => {
                          window.removeEventListener('pointermove', move);
                          window.removeEventListener('pointerup', finish);
                          window.removeEventListener('pointercancel', finish);
                        };
                        window.addEventListener('pointermove', move);
                        window.addEventListener('pointerup', finish, { once: true });
                        window.addEventListener('pointercancel', finish, { once: true });
                        cleanup.current = finish;
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <span role="status">Ładowanie danych…</span>
                </td>
              </tr>
            ) : visible.length ? (
              visible.map((row, i) => {
                const key = rowKey(row);
                const disabled = !!isRowDisabled?.(row);
                return (
                  <tr
                    key={key}
                    aria-selected={selectable ? selected.includes(key) : undefined}
                    aria-disabled={disabled || undefined}
                    tabIndex={onRowActivate && !disabled ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (
                        e.target === e.currentTarget &&
                        !disabled &&
                        onRowActivate &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        e.preventDefault();
                        onRowActivate(row);
                      }
                    }}
                    onDoubleClick={() => !disabled && onRowActivate?.(row)}
                  >
                    {selectable && (
                      <td>
                        <SelectionBox
                          aria-label={`Zaznacz ${rowLabel?.(row) ?? key}`}
                          checked={selected.includes(key)}
                          disabled={disabled}
                          onChange={() => toggle(key)}
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} style={{ textAlign: c.align }}>
                        {c.render ? c.render(row, i) : String(value(c, row) ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="mp-table-empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <PortalPagination
          total={rows.length}
          page={actualPage}
          onPageChange={setCurrent}
          pageSize={size}
          onPageSizeChange={(v) => {
            setSize(v);
            setCurrent(1);
          }}
          pageSizeOptions={pageSizeOptions}
          disabled={loading}
        />
      )}
    </section>
  );
}
export const PortalDataTable = /* @__PURE__ */ forwardRef(DataTableInner) as <T>(
  props: PortalDataTableProps<T> & RefAttributes<HTMLTableElement>,
) => ReactElement;
