import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import type { PortalShellProps } from '../kit/portal/Shell.js';
import { safeHref } from '../kit/mobile/shared.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

function navigation(items: PortalShellProps['navigation']): unknown[] {
  return items.map(({ id, label, href, disabled, children }) => ({
    id,
    label,
    disabled: !!disabled,
    href: href ? (safeHref(href) ?? null) : null,
    children: children?.length ? navigation(children) : null,
  }));
}

export function portalShellNativeSource(args: PortalShellProps, platform: NativePlatformChoice) {
  const props = isValidElement<{ heading?: ReactNode }>(args.children)
    ? args.children.props
    : undefined;
  const config = {
    title: textOf(props?.heading ?? args.children),
    brand: textOf(args.brand) || 'Aplikacja demo',
    contentLabel: args.contentLabel ?? 'Treść strony',
    open: args.sidebarOpen ?? args.defaultSidebarOpen ?? null,
    value: args.value ?? '',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Item = { id: string; label: string; disabled: boolean; href: string | null; children: Item[] | null };
const items: Item[] = ${JSON.stringify(navigation(args.navigation), null, 2)};
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ value, sidebarOpen, onSidebarOpenChange, onValueChange, onNavigate, onBrandClick,
  children, brand, headerActions, account, footer, sidebarFooter }: {
  value?: string; sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void; onValueChange?: (id: string) => void;
  onNavigate?: (href: string) => void; onBrandClick?: () => void; children?: ReactNode;
  brand?: ReactNode; headerActions?: ReactNode; account?: ReactNode; footer?: ReactNode; sidebarFooter?: ReactNode;
} = {}) {
  const wide = useWindowDimensions().width >= 1536;
  const [localOpen, setLocalOpen] = useState<boolean | null>(config.open);
  const [selected, select] = useState(config.value);
  const [groups, setGroups] = useState<Record<string, boolean>>({});
  const open = sidebarOpen ?? localOpen ?? wide;
  const active = value ?? selected;
  const [error, setError] = useState('');

  function change(open: boolean) {
    if (sidebarOpen === undefined) setLocalOpen(open);
    onSidebarOpenChange?.(open);
  }

  function entries(items: Item[], depth = 0): ReactNode {
    return items.map((item) => {
      const current = item.id === active;
      const expanded = !!groups[item.id];
      return <View key={item.id}>
        <Pressable accessibilityRole={item.href && !item.children ? 'link' : 'button'} disabled={item.disabled}
          accessibilityState={{ selected: current, disabled: item.disabled, expanded: item.children ? expanded : undefined }}
          style={[styles.control, current && styles.selected, { paddingLeft: 12 + depth * 16 }]} onPress={() => {
            if (item.disabled) return;
            if (item.children) {
              setGroups((previous) => ({ ...previous, [item.id]: !expanded }));
              return;
            }
            if (value === undefined) select(item.id);
            onValueChange?.(item.id);
            setError('');
            if (item.href && onNavigate) onNavigate(item.href);
            else if (item.href && /^(https?:|mailto:|tel:)/i.test(item.href)) {
              void Linking.openURL(item.href).catch(() => setError('Nie udało się otworzyć odnośnika.'));
            }
            if (!wide) change(false);
          }}><Text>{item.label}</Text></Pressable>
        {expanded && item.children ? entries(item.children, depth + 1) : null}
      </View>;
    });
  }

  const sidebar = <ScrollView style={styles.sidebar}>
    {!wide ? <Pressable accessibilityRole="button" style={styles.control} onPress={() => change(false)}>
      <Text>Zamknij menu</Text></Pressable> : null}
    {entries(items)}
    {sidebarFooter}
  </ScrollView>;

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }}
          style={styles.control} onPress={() => change(!open)}><Text>Menu</Text></Pressable>
        {onBrandClick ? <Pressable accessibilityRole="button" accessibilityLabel="Strona główna"
          style={[styles.brand, styles.control]} onPress={onBrandClick}>
          {brand ?? <Text>{config.brand}</Text>}
        </Pressable> : brand ?? <Text style={styles.brand}>{config.brand}</Text>}
        {headerActions}{account}
      </View>
      <View style={styles.layout}>
        {wide && open ? sidebar : null}
        <ScrollView accessibilityLabel={config.contentLabel} contentContainerStyle={styles.content}>
          {children ?? <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>}
          {error ? <Text accessibilityRole="alert">{error}</Text> : null}
          {footer}
        </ScrollView>
      </View>
      <Modal visible={!wide && open} transparent animationType={isIOS ? 'slide' : 'fade'}
        onRequestClose={() => change(false)}>
        <View accessibilityViewIsModal style={styles.overlay}>
          {sidebar}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { minHeight: isIOS ? 44 : 56, paddingHorizontal: 12, flexDirection: 'row',
    gap: 8, alignItems: 'center', backgroundColor: '#fff' },
  layout: { flex: 1, flexDirection: 'row' },
  brand: { fontWeight: '600', flex: 1 },
  content: { padding: 16, gap: 16 },
  title: { color: '#161b22', fontWeight: '700', fontSize: isIOS ? 28 : 24 },
  sidebar: { width: 280, maxWidth: '86%', backgroundColor: '#fff', flexGrow: 0 },
  control: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  selected: { backgroundColor: '#e8f2ff' },
  overlay: { flex: 1, backgroundColor: '#0006', flexDirection: 'row' },
});
`;
}
