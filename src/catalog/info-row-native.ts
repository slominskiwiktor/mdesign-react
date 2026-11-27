import type { InfoRowProps } from '../kit/mobile/content.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function infoRowNativeSource(
  items: InfoRowProps[],
  list: boolean,
  platform: NativePlatformChoice,
) {
  const rows = items.map(({ title, description, bullet, icon }) => ({
    title: textOf(title),
    description: textOf(description),
    bullet: !!bullet,
    icon: !!icon,
  }));
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}StyleSheet, Text, View } from 'react-native';

type Row = { title: string; description?: string; bullet?: boolean; icon?: boolean };
const sample: Row[] = ${JSON.stringify(rows, null, 2)};
const isList = ${list};
const isIOS = ${ios};

export default function Example({ items = sample, renderIcon }: {
  items?: readonly Row[];
  renderIcon?: (item: Row, index: number) => ReactNode;
} = {}) {
  const rows = isList ? items : items.slice(0, 1);
  return (
    <View role={isList ? 'list' : undefined} style={styles.list}>
      {rows.map((item, index) => (
        <View key={index} role={isList ? 'listitem' : undefined} style={styles.row}>
          {item.bullet || item.icon ? (
            <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.marker}>
              {item.bullet ? <Text style={styles.symbol}>•</Text>
                : renderIcon?.(item, index) ?? <Text style={styles.symbol}>ⓘ</Text>}
            </View>
          ) : null}
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  marker: { width: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: isIOS ? 17 : 16, lineHeight: 22, color: '#161b22', fontWeight: '600' },
  description: { fontSize: isIOS ? 13 : 14, lineHeight: 18, color: '#52575f' },
  symbol: { fontSize: 20, color: isIOS ? '#165ef8' : '#0452a8' },
});
`;
}
