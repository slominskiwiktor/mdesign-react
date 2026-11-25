import type { ComponentProps } from 'react';
import type { FilterControl } from '../kit/mobile/content.js';
import type { NativePlatformChoice } from './native-export.js';

type FilterArgs = Pick<
  ComponentProps<typeof FilterControl>,
  'items' | 'label' | 'value' | 'defaultValue'
>;

export function filterNativeSource(args: FilterArgs, platform: NativePlatformChoice) {
  const items = args.items.map(({ label, value, disabled }) => ({
    label,
    value,
    disabled: !!disabled,
  }));
  const initial = args.value ?? args.defaultValue ?? items[0]?.value ?? '';
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const isIOS = ${ios};
const items: { label: string; value: string; disabled: boolean }[] = ${JSON.stringify(items, null, 2)};

export default function Example({ value, onValueChange }: {
  value?: string; onValueChange?: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(${JSON.stringify(initial)});
  const selected = value ?? localValue;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled"
      accessibilityLabel={${JSON.stringify(args.label)}}>
      <View accessibilityRole="radiogroup" style={styles.row}>
        {items.map((item) => {
          const active = item.value === selected;
          return (
            <Pressable key={item.value} accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled: item.disabled }}
              disabled={item.disabled}
              onPress={() => {
                if (item.disabled || active) return;
                if (value === undefined) setLocalValue(item.value);
                onValueChange?.(item.value);
              }}
              style={({ pressed }) => [
                styles.option, active && styles.selected,
                item.disabled && styles.disabled, pressed && styles.pressed,
              ]}>
              <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: isIOS ? 4 : 8, padding: 4 },
  option: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: isIOS ? 22 : 12 },
  label: { color: '#52575f', fontSize: isIOS ? 15 : 14 },
  activeLabel: { color: isIOS ? '#174fbd' : '#0452a8', fontWeight: '600' },
  selected: { backgroundColor: isIOS ? '#e7efff' : '#ddebfb' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});
`;
}
