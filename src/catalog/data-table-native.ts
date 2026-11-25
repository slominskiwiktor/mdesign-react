import type { PortalDataTableProps } from '../kit/portal/DataTable.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

function positive(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1
    ? Math.floor(value)
    : fallback;
}

export function dataTableNativeSource<T>(
  args: PortalDataTableProps<T>,
  platform: NativePlatformChoice,
) {
  const keyedRows = args.rows.map((row, index) => ({
    row,
    index,
    id: args.rowKey?.(row) ?? String(index),
  }));
  const ranks = new Map<string, Map<string, number>>();
  for (const column of args.columns) {
    const compare = column.compare;
    if (!compare) continue;
    const sorted = [...keyedRows].sort((a, b) => compare(a.row, b.row));
    const columnRanks = new Map<string, number>();
    let rank = 0;
    for (const [index, item] of sorted.entries()) {
      if (index && compare(sorted[index - 1].row, item.row) !== 0) rank = index;
      columnRanks.set(item.id, rank);
    }
    ranks.set(column.key, columnRanks);
  }
  const columns = args.columns.map((column) => ({
    key: column.key,
    label: column.label ?? (textOf(column.header) || column.key),
    sortable: !!column.sortable,
    width: Math.max(positive(column.minWidth, 76), positive(column.width, 136)),
    align: column.align ?? 'left',
  }));
  const rows = keyedRows.map(({ row, id, index }) => ({
    id,
    label: args.rowLabel?.(row) ?? 'Wiersz ' + (index + 1),
    disabled: !!args.isRowDisabled?.(row),
    cells: args.columns.map((column) => {
      const value = column.accessor
        ? column.accessor(row)
        : (row as Record<string, unknown>)[column.key];
      return {
        value: value == null ? '' : String(value),
        text: column.render
          ? textOf(column.render(row, index))
          : value == null
            ? ''
            : String(value),
        rank: ranks.get(column.key)?.get(id) ?? null,
      };
    }),
  }));
  const size = positive(args.pageSize ?? args.defaultPageSize, 10);
  const config = {
    caption: args.caption,
    selection: args.selection ?? args.defaultSelection ?? [],
    page: positive(args.page ?? args.defaultPage, 1),
    size,
    sizes: [
      ...new Set([
        size,
        ...(args.pageSizeOptions ?? [10, 20, 50]).map((option) => positive(option, 0)),
      ]),
    ]
      .filter(Boolean)
      .sort((a, b) => a - b),
    selectable: !!args.selectable,
    pagination: args.pagination !== false,
    loading: !!args.loading,
    sticky: !!args.stickyHeader,
    empty: textOf(args.empty) || 'Brak danych do wyświetlenia.',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Sort = { key: string; direction: 'ascending' | 'descending' };
type Column = { key: string; label: string; width: number; align: 'left' | 'center' | 'right'; sortable: boolean };
type Row = { id: string; label: string; disabled: boolean; cells: { value: string; text: string; rank: number | null }[] };

const config = ${JSON.stringify(config, null, 2)};
const columns: Column[] = ${JSON.stringify(columns, null, 2)};
const rows: Row[] = ${JSON.stringify(rows, null, 2)};
const initialSort: Sort | null = ${JSON.stringify(args.sort === undefined ? (args.defaultSort ?? null) : args.sort)};
const ios = ${ios};

export default function DataTableExample({
  onSortChange, onSelectionChange, onRowActivate, onPageChange, onPageSizeChange, renderCell,
}: {
  onSortChange?: (sort: Sort | null) => void;
  onSelectionChange?: (keys: string[]) => void;
  onRowActivate?: (key: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  renderCell?: (row: string, column: string) => ReactNode;
} = {}) {
  const [sort, setSort] = useState<Sort | null>(initialSort);
  const [selection, setSelection] = useState<string[]>(config.selection);
  const [page, setPage] = useState(config.page);
  const [size, setSize] = useState(config.size);
  const [sizesOpen, setSizesOpen] = useState(false);
  const ordered = [...rows];
  if (sort) {
    const index = columns.findIndex((column) => column.key === sort.key);
    if (index >= 0) ordered.sort((a, b) => {
      const x = a.cells[index], y = b.cells[index];
      const order = x.rank !== null && y.rank !== null ? x.rank - y.rank
        : x.value.localeCompare(y.value, 'pl', { numeric: true });
      return sort.direction === 'ascending' ? order : -order;
    });
  }
  const pages = Math.max(1, Math.ceil(ordered.length / size));
  const current = Math.min(page, pages);
  const visible = config.pagination ? ordered.slice((current - 1) * size, current * size) : ordered;
  const enabled = visible.filter((row) => !row.disabled).map((row) => row.id);
  const all = enabled.length > 0 && enabled.every((key) => selection.includes(key));
  const some = !all && enabled.some((key) => selection.includes(key));

  function changeSort(column: Column) {
    const next = sort?.key !== column.key ? { key: column.key, direction: 'ascending' } as const
      : sort.direction === 'ascending' ? { key: column.key, direction: 'descending' } as const : null;
    setSort(next);
    onSortChange?.(next);
    changePage(1);
  }
  function choose(keys: string[]) {
    setSelection(keys);
    onSelectionChange?.(keys);
  }
  function changePage(next: number) {
    setPage(next);
    onPageChange?.(next);
  }
  function control(title: string, onPress: () => void, disabled = false) {
    return <Pressable accessibilityRole="button" accessibilityLabel={title}
      disabled={disabled} onPress={onPress} style={[styles.control, disabled && styles.disabled]}>
      <Text style={styles.action}>{title}</Text>
    </Pressable>;
  }
  function check(title: string, checked: boolean | 'mixed', disabled: boolean, onPress: () => void) {
    return <Pressable accessibilityRole="checkbox" accessibilityLabel={title}
      accessibilityState={{ checked, disabled }} disabled={disabled} onPress={onPress} style={styles.check}>
      <Text style={styles.action}>{checked === 'mixed' ? '−' : checked ? '☑' : '☐'}</Text>
    </Pressable>;
  }

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.caption}>{config.caption}</Text>
      {config.loading ? <ActivityIndicator accessibilityLabel="Ładowanie" /> : !visible.length
        ? <Text style={styles.text}>{config.empty}</Text>
        : <ScrollView horizontal showsHorizontalScrollIndicator>
          <ScrollView style={styles.scroller} stickyHeaderIndices={config.sticky ? [0] : undefined}>
            <View style={[styles.row, styles.header]}>
              {config.selectable && check('Zaznacz wszystkie wiersze na tej stronie',
                some ? 'mixed' : all, !enabled.length,
                () => choose(all ? selection.filter((key) => !enabled.includes(key))
                  : [...new Set([...selection, ...enabled])]))}
              {columns.map((column) => {
                const direction = sort?.key === column.key ? sort.direction : undefined;
                const text = column.label + (direction === 'ascending' ? ' ↑' : direction === 'descending' ? ' ↓' : '');
                return column.sortable
                  ? <Pressable key={column.key} accessibilityRole="button" accessibilityLabel={column.label +
                    (direction === 'ascending' ? ', rosnąco' : direction === 'descending' ? ', malejąco' : '')}
                    onPress={() => changeSort(column)} style={[styles.cell, { width: column.width }]}>
                    <Text style={styles.heading}>{text}</Text>
                  </Pressable>
                  : <Text accessibilityRole="header" key={column.key}
                    style={[styles.cell, styles.heading, { width: column.width }]}>{text}</Text>;
              })}
              {onRowActivate && <View style={styles.check} />}
            </View>
            {visible.map((row) => {
              const selected = selection.includes(row.id);
              return <View key={row.id} style={[styles.row, selected && styles.selected, row.disabled && styles.disabled]}>
                {config.selectable && check('Zaznacz: ' + row.label, selected, row.disabled,
                  () => choose(selected ? selection.filter((key) => key !== row.id) : [...selection, row.id]))}
                {columns.map((column, index) => <View key={column.key} style={[styles.cell, { width: column.width }]}>
                  {renderCell ? renderCell(row.id, column.key)
                    : <Text style={[styles.text, { textAlign: column.align }]}>{row.cells[index].text}</Text>}
                </View>)}
                {onRowActivate && <Pressable accessibilityRole="button" accessibilityLabel={'Otwórz: ' + row.label}
                  disabled={row.disabled} onPress={() => onRowActivate(row.id)} style={styles.check}>
                  <Text style={styles.action}>›</Text>
                </Pressable>}
              </View>;
            })}
          </ScrollView>
        </ScrollView>}
      {config.pagination && <View style={styles.pages}>
        {control('Poprzednia strona', () => changePage(current - 1), current === 1 || config.loading)}
        <Text accessibilityLiveRegion="polite" style={styles.text}>{current} / {pages}</Text>
        {control('Następna strona', () => changePage(current + 1), current === pages || config.loading)}
        {control('Wierszy na stronie: ' + size, () => setSizesOpen(!sizesOpen), config.loading)}
        {sizesOpen && config.sizes.map((option) =>
          <Pressable key={option} accessibilityRole="radio" accessibilityLabel={String(option)}
            accessibilityState={{ checked: option === size }} style={styles.control}
            onPress={() => { setSize(option); setSizesOpen(false); onPageSizeChange?.(option); changePage(1); }}>
            <Text style={styles.action}>{option}</Text>
          </Pressable>
        )}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  caption: { color: '#101317', fontSize: ios ? 17 : 18, fontWeight: '600' },
  scroller: { maxHeight: 480 },
  row: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d0d4db', alignItems: 'center', minHeight: ios ? 48 : 52 },
  header: { backgroundColor: '#f4f6fb' },
  cell: { justifyContent: 'center', padding: 10 },
  heading: { fontWeight: '600', color: '#101317', fontSize: 14 },
  text: { color: '#101317', fontSize: 14 },
  action: { color: '#0452a8', fontWeight: '600', fontSize: 14 },
  selected: { backgroundColor: '#ddebfb' },
  disabled: { opacity: 0.5 },
  check: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pages: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  control: { paddingHorizontal: 6, minHeight: 44, justifyContent: 'center' },
});
`;
}
