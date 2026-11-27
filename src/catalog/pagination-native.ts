import type { PortalPaginationProps } from '../kit/portal/DataTable.js';
import type { NativePlatformChoice } from './native-export.js';

function integer(value: unknown, floor: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= floor
    ? Math.floor(value)
    : fallback;
}

export function paginationNativeSource(
  example: Partial<PortalPaginationProps>,
  portal: boolean,
  platform: NativePlatformChoice,
) {
  const size = integer(example.pageSize ?? example.defaultPageSize, 1, 10);
  const config = {
    label: example.label ?? (portal ? 'Stronicowanie' : 'Strony wyników'),
    initialPage: integer(example.page ?? example.defaultPage, 1, 1),
    total: integer(example.total, 0, 0),
    size,
    sizes: [
      ...new Set(
        [size, ...(example.pageSizeOptions ?? [10, 20, 50])].map((value) => integer(value, 1, 0)),
      ),
    ]
      .filter(Boolean)
      .sort((a, b) => a - b),
    disabled: example.disabled ?? false,
    portal,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { Fragment, useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const ios = ${ios};

export default function PaginationExample({ onPageChange, onPageSizeChange }: {
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
} = {}) {
  const [page, setPage] = useState(config.initialPage);
  const [size, setSize] = useState(config.size);
  const [showSizes, setShowSizes] = useState(false);
  const count = Math.max(1, config.portal ? Math.ceil(config.total / size) : config.total);
  const current = Math.min(page, count);
  const pages = [...new Set([1, ...Array.from({ length: 5 }, (_, index) => current - 2 + index)
    .filter((number) => number >= 1 && number <= count), count])].sort((a, b) => a - b);

  function change(next: number) {
    setPage(next);
    onPageChange?.(next);
  }

  function changeSize(next: number) {
    setSize(next);
    setShowSizes(false);
    onPageSizeChange?.(next);
    change(1);
  }

  function button(label: string, text: string, target: number, boundary = false, selected = false) {
    const disabled = boundary || config.disabled;
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label}
        accessibilityState={{ selected, disabled }} disabled={disabled}
        onPress={() => change(target)} style={[styles.button, selected && styles.selected, disabled && styles.disabled]}>
        <Text style={styles.controlText}>{text}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.group} accessibilityLabel={config.label}>
      {config.portal && (
        <>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" accessibilityLabel={'Wierszy na stronie: ' + size}
              accessibilityState={{ expanded: showSizes, disabled: config.disabled }} disabled={config.disabled}
              onPress={() => setShowSizes(!showSizes)} style={styles.button}>
              <Text style={styles.controlText}>{size} ⌄</Text>
            </Pressable>
            <Text accessibilityLiveRegion="polite" style={styles.status}>
              {config.total ? ((current - 1) * size + 1) + '–' + Math.min(current * size, config.total) + ' z ' + config.total : '0 wyników'}
            </Text>
          </View>
          {showSizes && <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Wierszy na stronie">
            {config.sizes.map((option) => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={String(option)}
              accessibilityState={{ checked: size === option }} onPress={() => changeSize(option)}
              style={[styles.button, size === option && styles.selected]}>
              <Text style={styles.controlText}>{option}</Text>
            </Pressable>)}
          </View>}
        </>
      )}
      <View style={styles.row}>
        {config.portal && button('Pierwsza strona', '«', 1, current === 1)}
        {button('Poprzednia strona', '‹', current - 1, current === 1)}
        {config.portal ? (
          <Text accessibilityLiveRegion="polite" accessibilityLabel={'Strona ' + current + ' z ' + count} style={styles.status}>
            {current} / {count}
          </Text>
        ) : pages.map((number, index) => (
          <Fragment key={number}>
            {index > 0 && number - pages[index - 1] > 1 && <Text accessible={false} style={styles.status}>…</Text>}
            {button('Strona ' + number, String(number), number, false, number === current)}
          </Fragment>
        ))}
        {button('Następna strona', '›', current + 1, current === count)}
        {config.portal && button('Ostatnia strona', '»', count, current === count)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8, alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4 },
  button: { minWidth: ios ? 44 : 48, minHeight: ios ? 44 : 48, paddingHorizontal: 7,
    justifyContent: 'center', alignItems: 'center', borderRadius: ios ? 10 : 24 },
  selected: { backgroundColor: '#ddebfb' },
  disabled: { opacity: 0.45 },
  controlText: { fontSize: ios ? 17 : 16, color: '#0452a8' },
  status: { fontSize: 14, color: '#101317', paddingHorizontal: 4 },
});
`;
}
