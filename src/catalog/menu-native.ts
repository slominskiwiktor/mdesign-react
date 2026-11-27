import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type MenuExample = {
  label?: string;
  name?: string;
  trigger?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  items: Array<{
    id?: string;
    label: string;
    type?: 'action' | 'checkbox' | 'radio' | 'separator' | 'group';
    checked?: boolean;
    disabled?: boolean;
    destructive?: boolean;
    href?: string;
    closeOnSelect?: boolean;
  }>;
};

export function menuNativeSource(example: MenuExample, platform: NativePlatformChoice) {
  let group = 0;
  const items = example.items.map((item, index) => {
    if (item.type === 'group' || item.type === 'separator') group += 1;
    return {
      id: item.id ?? String(index + 1),
      label: item.label,
      type: item.type ?? 'action',
      checked: !!item.checked,
      disabled: !!item.disabled,
      destructive: !!item.destructive,
      closeOnSelect: item.closeOnSelect ?? item.type !== 'checkbox',
      href: item.href ?? '',
      group,
    };
  });
  const label = example.label ?? (example.name ? 'Menu konta: ' + example.name : 'Działania');
  const config = {
    label,
    trigger: textOf(example.trigger) || example.name || label,
    disabled: !!example.disabled,
    initialOpen: !!(example.open ?? example.defaultOpen) && !example.disabled,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Item = {
  id: string;
  label: string;
  type: 'action' | 'checkbox' | 'radio' | 'separator' | 'group';
  checked: boolean;
  disabled: boolean;
  destructive: boolean;
  closeOnSelect: boolean;
  href: string;
  group: number;
};

const config = ${JSON.stringify(config, null, 2)};
const items: Item[] = ${JSON.stringify(items, null, 2)};
const ios = ${ios};

export default function MenuExample({ onSelect, onOpenChange, onCheckedChange, renderIcon }: {
  onSelect?: (id: string, href?: string) => void;
  onOpenChange?: (open: boolean) => void;
  onCheckedChange?: (id: string, checked: boolean) => void;
  renderIcon?: (id: string) => ReactNode;
} = {}) {
  const [open, setOpen] = useState(config.initialOpen);
  const [selection, setSelection] = useState(() =>
    Object.fromEntries(items.map((item) => [item.id, item.checked])));

  function setVisible(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function select(item: Item) {
    if (item.disabled || config.disabled) return;
    if (item.type === 'checkbox' || item.type === 'radio') {
      const checked = item.type === 'radio' || !selection[item.id];
      const cleared = item.type === 'radio' ? Object.fromEntries(items
        .filter((option) => option.type === 'radio' && option.group === item.group && option.id !== item.id)
        .map((option) => [option.id, false])) : {};
      setSelection({ ...selection, ...cleared, [item.id]: checked });
      for (const other of Object.keys(cleared)) {
        if (selection[other]) onCheckedChange?.(other, false);
      }
      if (selection[item.id] !== checked) onCheckedChange?.(item.id, checked);
    }
    onSelect?.(item.id, item.href || undefined);
    if (item.closeOnSelect) setVisible(false);
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={config.label}
        accessibilityState={{ expanded: open, disabled: config.disabled }} disabled={config.disabled}
        onPress={() => setVisible(true)} style={styles.trigger}>
        <Text style={styles.link}>{config.trigger} ⌄</Text>
      </Pressable>
      <Modal visible={open} transparent animationType={ios ? 'fade' : 'slide'}
        onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable accessible={false} importantForAccessibility="no" style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)} />
          <View style={styles.surface} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.title}>{config.label}</Text>
            <ScrollView style={styles.list}>
              {items.map((item) => {
                if (item.type === 'group') return <Text key={item.id} accessibilityRole="header"
                  style={styles.group}>{item.label}</Text>;
                if (item.type === 'separator') return <View key={item.id} style={styles.separator} />;
                const checked = item.type === 'checkbox' || item.type === 'radio' ? selection[item.id] : undefined;
                return (
                  <Pressable key={item.id} accessibilityRole={item.type === 'action' ? 'button' : item.type}
                    accessibilityLabel={item.label}
                    accessibilityState={{ checked, disabled: item.disabled }}
                    disabled={item.disabled} onPress={() => select(item)}
                    style={[styles.item, item.disabled && styles.disabled]}>
                    {renderIcon?.(item.id)}
                    <Text style={[styles.label, item.destructive && styles.destructive]}>{item.label}</Text>
                    {checked && <Text accessible={false} importantForAccessibility="no" style={styles.link}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable accessibilityRole="button" style={styles.close} onPress={() => setVisible(false)}>
              <Text style={styles.link}>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { justifyContent: 'center', minHeight: 44 },
  overlay: { flex: 1, backgroundColor: '#0005', justifyContent: ios ? 'center' : 'flex-end', padding: 16 },
  surface: { backgroundColor: '#fff', borderRadius: ios ? 14 : 24, maxHeight: '80%', overflow: 'hidden' },
  title: { padding: 16, fontWeight: '600', fontSize: 17, color: '#101317' },
  list: { flexGrow: 0, flexShrink: 1 },
  group: { paddingHorizontal: 16, paddingVertical: 8, color: '#52575f', fontSize: 13 },
  item: { flexDirection: 'row', alignItems: 'center', minHeight: ios ? 44 : 48, gap: 12, paddingHorizontal: 16 },
  label: { flex: 1, color: '#101317', fontSize: 16 },
  destructive: { color: '#cd3214' },
  disabled: { opacity: 0.5 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#d0d4db' },
  close: { minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  link: { color: '#0452a8', fontSize: 16, fontWeight: '600' },
});
`;
}
