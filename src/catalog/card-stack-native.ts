import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

type Args = { children?: ReactNode; spacing?: number; cardHeight?: number; label?: string };

export function cardStackNativeSource(args: Args, platform: NativePlatformChoice) {
  const cards = Children.toArray(args.children).map((child) => {
    const props = isValidElement<{ title?: ReactNode; description?: ReactNode }>(child)
      ? child.props
      : undefined;
    return { title: textOf(props?.title ?? child), description: textOf(props?.description) };
  });
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { Children } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}StyleSheet, Text, View } from 'react-native';

const isIOS = ${ios};
const sample = ${JSON.stringify(cards, null, 2)};
const label = ${JSON.stringify(args.label ?? 'Dokumenty')};

export default function Example({
  children,
  spacing = ${Number.isFinite(args.spacing) ? args.spacing : 40},
  cardHeight = ${Number.isFinite(args.cardHeight) ? args.cardHeight : 226},
}: { children?: ReactNode; spacing?: number; cardHeight?: number } = {}) {
  const items = children === undefined ? sample.map(({ title, description }, index) => (
    <View key={index} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  )) : Children.toArray(children);
  const height = items.length ? cardHeight + (items.length - 1) * spacing : 0;

  return (
    <View accessibilityLabel={label} style={[styles.stack, { height }]}>
      {items.map((child, index) => (
        <View key={index} style={[styles.layer, { top: index * spacing, zIndex: index, height: cardHeight }]}>
          {typeof child === 'string' || typeof child === 'number' ? <Text>{child}</Text> : child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { position: 'relative' },
  layer: { position: 'absolute', left: 0, right: 0 },
  card: { flex: 1, gap: 4, padding: 12, borderWidth: 1, borderColor: '#d6d9df',
    borderRadius: isIOS ? 8 : 16, backgroundColor: '#edf3fc' },
  title: { color: '#161b22', fontSize: 17, fontWeight: '600' },
  description: { color: '#52575f', fontSize: 13 },
});
`;
}
