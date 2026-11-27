import { isValidElement } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import type { PortalDashboard } from '../kit/portal/Shell.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

const keys = ['banner', 'cases', 'payments', 'catalog', 'popular', 'calendar'] as const;

function sample(node: ReactNode) {
  const props = isValidElement<{
    heading?: ReactNode;
    children?: ReactNode;
    value?: string;
    defaultValue?: string;
  }>(node)
    ? node.props
    : undefined;
  return {
    title: textOf(props?.heading),
    body: textOf(node),
    date:
      props?.value ??
      props?.defaultValue ??
      (isValidElement<{ defaultValue?: string }>(props?.children)
        ? props.children.props.defaultValue
        : undefined),
  };
}

export function dashboardNativeSource(
  args: Partial<ComponentProps<typeof PortalDashboard>>,
  platform: NativePlatformChoice,
) {
  const data = Object.fromEntries(keys.map((key) => [key, sample(args[key])]));
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Slot = 'banner' | 'cases' | 'payments' | 'catalog' | 'popular' | 'calendar';
type Sample = { title: string; body: string; date?: string };
const sample: Record<Slot, Sample> = ${JSON.stringify(data, null, 2)};
const isIOS = ${ios};

export default function Example(slots: Partial<Record<Slot, ReactNode>> = {}) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  function render(key: Slot) {
    const override = slots[key];
    if (override !== undefined) {
      return typeof override === 'string' || typeof override === 'number' ? <Text>{override}</Text> : override;
    }
    const item = sample[key];
    if (!item.title && !item.body && !item.date && key !== 'calendar') return null;
    return (
      <View style={styles.card}>
        {item.title || key === 'calendar' ? <Text accessibilityRole="header" style={styles.title}>
          {item.title || 'Kalendarz'}
        </Text> : null}
        {item.body ? <Text style={styles.copy}>{item.body}</Text> : null}
        {item.date ? <Text style={styles.copy}>{item.date}</Text> : null}
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={[styles.dashboard, wide && styles.wide]}>
      <View style={styles.main}>
        {render('banner')}
        {render('cases')}
        {render('payments')}
        <View style={[styles.services, wide && styles.wide]}>
          <View style={styles.tile}>{render('catalog')}</View>
          <View style={styles.tile}>{render('popular')}</View>
        </View>
      </View>
      <View style={wide ? styles.calendarWide : undefined}>{render('calendar')}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashboard: { padding: 16, gap: 16, backgroundColor: '#f5f6f8' },
  wide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, gap: 16 },
  services: { gap: 16 },
  tile: { flex: 1 },
  calendarWide: { width: 280 },
  card: { padding: 16, gap: 8, backgroundColor: '#fff', borderRadius: isIOS ? 16 : 12 },
  title: { fontSize: isIOS ? 17 : 18, fontWeight: '600', color: '#161b22' },
  copy: { fontSize: 15, color: '#52575f' },
});
`;
}
