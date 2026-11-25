import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type TabsExample = {
  items: Array<{ value: string; label: ReactNode; content?: ReactNode; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  label?: string;
};

export function tabsNativeSource(
  example: TabsExample,
  segmented: boolean,
  platform: NativePlatformChoice,
) {
  const items = example.items.map(({ value, label, content, disabled }) => ({
    value,
    label: textOf(label),
    content: textOf(content),
    disabled: disabled ?? false,
  }));
  const value = example.value ?? example.defaultValue ?? items[0]?.value ?? '';
  const label = example.label ?? 'Widoki';
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const items = ${JSON.stringify(items, null, 2)};
const ios = ${ios};
const segmented = ${segmented};

export default function TabsExample({ onValueChange, renderContent }: {
  onValueChange?: (value: string) => void;
  renderContent?: (value: string) => ReactNode;
} = {}) {
  const [value, setValue] = useState<string>(${JSON.stringify(value)});
  const active = items.find((item) => item.value === value);
  return (
    <View style={styles.root}>
      <View accessibilityRole={segmented ? 'radiogroup' : 'tablist'}
        accessibilityLabel={${JSON.stringify(label)}} style={[styles.row, !ios && segmented && styles.outline]}>
        {items.map((item, index) => {
          const selected = value === item.value;
          return (
            <Pressable key={item.value} accessibilityRole={segmented ? 'radio' : 'tab'}
              accessibilityState={segmented ? { checked: selected, disabled: item.disabled } : { selected, disabled: item.disabled }}
              disabled={item.disabled}
              onPress={() => { setValue(item.value); onValueChange?.(item.value); }}
              style={[
                styles.item,
                !ios && segmented && index > 0 && styles.divider,
                selected && (ios ? styles.iosSelected : segmented ? styles.androidSelected : styles.androidTab),
                item.disabled && styles.disabled,
              ]}>
              <Text style={[styles.label, selected && styles.activeLabel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {!segmented && active && <View style={styles.panel}>
        {renderContent ? renderContent(value) : <Text style={styles.body}>{active.content}</Text>}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 16 },
  row: { flexDirection: 'row', backgroundColor: ios ? '#e7eaed' : '#fff',
    borderRadius: ios ? 10 : segmented ? 24 : 0, padding: ios ? 2 : 0, gap: ios ? 2 : 0 },
  outline: { borderWidth: 1, borderColor: '#808893', overflow: 'hidden' },
  item: { flex: 1, minHeight: ios ? 44 : 48, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 6, borderRadius: ios ? 8 : 0 },
  divider: { borderStartWidth: 1, borderColor: '#808893' },
  iosSelected: { backgroundColor: '#fff' },
  androidSelected: { backgroundColor: '#ddebfb' },
  androidTab: { borderBottomWidth: 3, borderBottomColor: '#0452a8' },
  label: { textAlign: 'center', fontSize: ios ? 13 : 14, color: '#52575f' },
  activeLabel: { fontWeight: '600', color: '#101317' },
  disabled: { opacity: 0.45 },
  panel: { paddingHorizontal: 4 },
  body: { fontSize: 16, color: '#101317' },
});
`;
}
