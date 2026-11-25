import type { ReactNode } from 'react';
import { safeHref } from '../kit/mobile/shared.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Item = {
  id?: string;
  value?: string;
  label: string;
  href?: string;
  disabled?: boolean;
  badge?: ReactNode;
  children?: Item[];
};
type Args = {
  items: Item[];
  value?: string;
  label?: string;
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  mode?: string;
  minimized?: boolean;
};

function normalize(items: Item[]): object[] {
  return items.map((item, index) => {
    const href = item.href ? safeHref(item.href) : undefined;
    return {
      id: item.id ?? item.value ?? String(index),
      label: item.label,
      href: href || null,
      disabled: !!item.disabled || (!!item.href && href === undefined),
      badge: textOf(item.badge),
      children: item.children ? normalize(item.children) : null,
    };
  });
}

export function sidebarNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const config = {
    label: args.label ?? 'Nawigacja boczna',
    title: textOf(args.title ?? args.children),
    footer: textOf(args.footer),
    value: args.value ?? '',
    drawer: args.mode === 'drawer',
    closeOnSelection: name === 'PortalSidebar',
    minimized: !!args.minimized,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Item = { id: string; label: string; href: string | null; disabled: boolean; badge: string; children: Item[] | null };
const items: Item[] = ${JSON.stringify(normalize(args.items), null, 2)};
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  value?: string; onValueChange?: (id: string) => void; onClose?: () => void;
  onNavigate?: (href: string, id: string) => void;
  renderIcon?: (id: string, selected: boolean) => ReactNode;
  footer?: ReactNode;
};

function contains(item: Item, selected: string): boolean {
  return item.id === selected || !!item.children?.some((child) => contains(child, selected));
}

export default function Example({ value, onValueChange, onClose, onNavigate, renderIcon, footer }: Props = {}) {
  const [localValue, setValue] = useState(config.value);
  const [show, setShow] = useState(true);
  const [groups, setGroups] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState('');
  const selected = value ?? localValue;

  function close() {
    setShow(false);
    onClose?.();
  }

  async function select(item: Item) {
    if (item.disabled) return;
    setFeedback('');
    if (value === undefined) setValue(item.id);
    onValueChange?.(item.id);
    if (config.drawer && config.closeOnSelection) close();
    if (item.href) {
      if (onNavigate) onNavigate(item.href, item.id);
      else if (/^(https?:|mailto:|tel:)/i.test(item.href)) {
        try { await Linking.openURL(item.href); }
        catch { setFeedback('Nie udało się otworzyć odnośnika.'); }
      }
    }
  }

  function render(entries: Item[], depth = 0): ReactNode {
    return entries.map((item) => {
      const current = item.id === selected;
      const expanded = groups[item.id] ?? !!item.children?.some((child) => contains(child, selected));
      const icon = renderIcon?.(item.id, current);
      return (
        <View key={item.id}>
          <Pressable accessibilityRole={item.children || !item.href ? 'button' : 'link'}
            accessibilityLabel={item.label} accessibilityState={{
              selected: current, disabled: item.disabled, expanded: item.children ? expanded : undefined,
            }}
            disabled={item.disabled} style={[styles.item, { paddingLeft: 12 + depth * 12 },
              current && styles.active, item.disabled && styles.disabled]}
            onPress={() => {
              if (item.disabled) return;
              if (item.children) setGroups((previous) => ({ ...previous, [item.id]: !expanded }));
              else void select(item);
            }}>
            {icon}
            {(!config.minimized || !icon) ? <Text style={styles.label}>{item.label}</Text> : null}
            {item.badge ? <Text style={styles.badge}>{item.badge}</Text> : null}
            {item.children ? <Text accessible={false} style={styles.badge}>{expanded ? '⌃' : '⌄'}</Text> : null}
          </Pressable>
          {item.children && expanded ? render(item.children, depth + 1) : null}
        </View>
      );
    });
  }

  return show ? (
    <ScrollView accessibilityLabel={config.label} contentContainerStyle={styles.container}>
      {config.title ? <Text accessibilityRole="header" style={styles.title}>{config.title}</Text> : null}
      {config.drawer || onClose ? (
        <Pressable accessibilityRole="button" style={styles.item} onPress={close}>
          <Text style={styles.label}>Zamknij nawigację</Text>
        </Pressable>
      ) : null}
      {render(items)}
      {footer ?? (config.footer ? <Text style={styles.label}>{config.footer}</Text> : null)}
      {feedback ? <Text accessibilityRole="alert">{feedback}</Text> : null}
    </ScrollView>
  ) : (
    <Pressable accessibilityRole="button" style={styles.item} onPress={() => setShow(true)}>
      <Text style={styles.label}>Otwórz nawigację</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 4, backgroundColor: isIOS ? '#f5f6f8' : '#f3f7fc' },
  title: { fontSize: 20, fontWeight: '700', color: '#161b22', padding: 8 },
  item: { minHeight: 44, borderRadius: isIOS ? 10 : 24, flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingHorizontal: 12 },
  active: { backgroundColor: isIOS ? '#e1ebff' : '#ddebfb' },
  label: { fontSize: isIOS ? 15 : 16, color: '#161b22', flexShrink: 1 },
  badge: { fontSize: 13, color: '#0452a8' },
  disabled: { opacity: 0.5 },
});
`;
}
