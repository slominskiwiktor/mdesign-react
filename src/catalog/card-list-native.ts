import type { CardListProps } from '../kit/mobile/index.js';

export function cardListNativeSource(
  items: CardListProps['items'],
  platform: CardListProps['platform'],
) {
  const rows = items.map((item, index) => ({
    id: item.value ?? String(index + 1),
    title:
      typeof item.title === 'string' || typeof item.title === 'number'
        ? String(item.title)
        : 'Pozycja ' + (index + 1),
    ...(typeof item.description === 'string' ? { description: item.description } : {}),
    disabled: item.disabled ?? false,
  }));
  const recipe = {
    ios: '{ rowHeight: 60, radius: 12, rowPadding: 8, dividerHeight: 0.5, dividerStart: 16, dividerEnd: 0 }',
    android:
      '{ rowHeight: 80, radius: 16, rowPadding: 16, dividerHeight: 1, dividerStart: 20, dividerEnd: 20 }',
  };
  const geometry = platform
    ? recipe[platform]
    : `Platform.select({
  ios: ${recipe.ios},
  android: ${recipe.android},
  default: ${recipe.ios},
})!`;

  return `import type { ReactNode } from 'react';
import { ${platform ? '' : 'Platform, '}Pressable, StyleSheet, Text, View } from 'react-native';

const items = ${JSON.stringify(rows, null, 2)} as const;
const geometry = ${geometry};

type Item = (typeof items)[number];
type Props = {
  onSelect?: (id: Item['id']) => void;
  renderIcon?: (id: Item['id']) => ReactNode;
};

export default function CardListExample({ onSelect, renderIcon }: Props) {
  return (
    <View style={styles.group}>
      {items.map((item, index) => {
        const icon = renderIcon?.(item.id);
        const content = (
          <>
            {icon != null && <View style={styles.icon}>{icon}</View>}
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              {'description' in item && <Text style={styles.description}>{item.description}</Text>}
            </View>
            {onSelect && <Text accessible={false} style={styles.chevron}>›</Text>}
          </>
        );

        return (
          <View key={item.id}>
            {index > 0 && (
              <View style={[styles.divider, icon != null && styles.iconDivider]} />
            )}
            {onSelect ? (
              <Pressable style={styles.row} accessibilityRole="button" disabled={item.disabled}
                onPress={() => onSelect(item.id)}>
                {content}
              </Pressable>
            ) : <View style={styles.row}>{content}</View>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { backgroundColor: '#ffffff', borderRadius: geometry.radius, overflow: 'hidden' },
  row: {
    minHeight: geometry.rowHeight,
    paddingHorizontal: 16,
    paddingVertical: geometry.rowPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: { width: 24, alignItems: 'center' },
  copy: { flex: 1 },
  title: { color: '#101317', fontSize: 16, fontWeight: '600' },
  description: { color: '#656a75', fontSize: 13, marginTop: 4 },
  chevron: { color: '#656a75', fontSize: 24 },
  divider: {
    height: geometry.dividerHeight,
    marginStart: geometry.dividerStart,
    marginEnd: geometry.dividerEnd,
    backgroundColor: '#d0d4db',
  },
  iconDivider: { marginStart: geometry.dividerEnd === 0 ? 56 : geometry.dividerStart },
});
`;
}
