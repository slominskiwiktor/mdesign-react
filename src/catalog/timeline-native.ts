import type { ReactNode } from 'react';
import type { TimelineItem } from '../kit/mobile/content.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = { items?: TimelineItem[]; label?: string; children?: ReactNode };

export function timelineNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  const platformImport = platform === 'auto' ? 'Platform, ' : '';
  if (name === 'BulletPoint') {
    return `import type { ReactNode } from 'react';
import { ${platformImport}StyleSheet, Text, View } from 'react-native';

const isIOS = ${ios};

export default function Example({ children }: { children?: ReactNode } = {}) {
  const copy = children ?? ${JSON.stringify(textOf(args.children))};
  return (
    <View role="listitem" style={styles.row}>
      <View style={styles.mark} accessible={false} importantForAccessibility="no" />
      <View style={styles.copy}>{typeof copy === 'string' || typeof copy === 'number' ? <Text style={styles.text}>{copy}</Text> : copy}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mark: { width: 6, height: 6, borderRadius: 3, marginTop: 8, backgroundColor: '#52575f' },
  copy: { flex: 1 },
  text: { fontSize: isIOS ? 15 : 16, lineHeight: 22, color: '#161b22' },
});
`;
  }
  const rows = (args.items ?? []).map(({ header, title, descriptions }) => ({
    header,
    title: textOf(title),
    descriptions: (descriptions ?? []).map(textOf),
  }));
  return `import { ${platformImport}StyleSheet, Text, View } from 'react-native';

type Item = { header: string; title: string; descriptions?: readonly string[] };
const example: Item[] = ${JSON.stringify(rows, null, 2)};
const isIOS = ${ios};

export default function Example({ items = example }: { items?: readonly Item[] } = {}) {
  return (
    <View role="list" accessibilityLabel={${JSON.stringify(args.label ?? 'Historia')}}>
      {items.map((item, index) => (
        <View key={index} role="listitem" style={styles.entry}>
          <View style={styles.heading}>
            <View accessible={false} style={styles.dot} />
            <Text style={styles.meta}>{item.header}</Text>
          </View>
          <View style={styles.details}>
            <View accessible={false} importantForAccessibility="no" style={styles.rail}>
              {index < items.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.copy}>
              <Text accessibilityRole="header" style={styles.title}>{item.title}</Text>
              {item.descriptions?.map((description, offset) => (
                <Text key={offset} style={styles.meta}>{description}</Text>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  entry: { alignItems: 'stretch' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  details: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#52575f' },
  rail: { width: 4, alignItems: 'center' },
  line: { flex: 1, width: 1, backgroundColor: '#c3c7ce' },
  copy: { flex: 1, paddingBottom: isIOS ? 10 : 12 },
  title: { fontSize: isIOS ? 17 : 16, fontWeight: '600', color: '#161b22', paddingVertical: 1 },
  meta: { flexShrink: 1, fontSize: isIOS ? 13 : 14, lineHeight: isIOS ? 18 : 20, color: '#52575f' },
});
`;
}
