import { Children, isValidElement } from 'react';
import type { PortalAccountMenuProps, PortalHeaderProps } from '../kit/portal/Shell.js';
import { safeHref } from '../kit/mobile/shared.js';
import { captureIconSurface } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

export async function portalHeaderNativeSource(
  root: HTMLElement,
  args: PortalHeaderProps,
  platform: NativePlatformChoice,
) {
  const picture = await captureIconSurface(root, '.mp-emblem-link');
  const account =
    isValidElement<PortalAccountMenuProps>(args.account) && Array.isArray(args.account.props.items)
      ? args.account.props
      : undefined;
  const config = {
    menu: !!args.onMenuClick,
    open: !!args.menuOpen,
    menuLabel: args.menuLabel ?? 'Menu',
    brand: root.querySelector('.mp-emblem-link')?.textContent?.trim() ?? 'Aplikacja demo',
    href: safeHref(args.brandHref ?? '/') ?? '',
    uri: picture.uri ?? null,
    account: account?.name ?? '',
    accountDisabled: !!account?.disabled,
    items: (account?.items ?? []).map((item) => ({
      id: item.id,
      label: textOf(item.label),
      disabled: !!item.disabled,
    })),
    actions: Children.toArray(args.actions).map(textOf).filter(Boolean),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ menuOpen, onMenuChange, onNavigate, onAction, onAccountSelect }: {
  menuOpen?: boolean; onMenuChange?: (open: boolean) => void; onNavigate?: (href: string) => void;
  onAction?: (label: string) => void; onAccountSelect?: (id: string) => void;
} = {}) {
  const [localOpen, setMenuOpen] = useState(config.open);
  const [accountOpen, setAccountOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const open = menuOpen ?? localOpen;

  function home() {
    if (!config.href) return;
    if (onNavigate) onNavigate(config.href);
    else if (/^https?:/i.test(config.href)) void Linking.openURL(config.href).catch(() => setFeedback('Nie udało się otworzyć strony.'));
    else setFeedback(config.href);
  }

  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        {config.menu || onMenuChange ? <Pressable accessibilityRole="button"
          accessibilityLabel={config.menuLabel} accessibilityState={{ expanded: open }} style={styles.button}
          onPress={() => { if (menuOpen === undefined) setMenuOpen(!open); onMenuChange?.(!open); }}>
          <Text>{open ? '×' : '☰'} {config.menuLabel}</Text>
        </Pressable> : null}
        <Pressable accessibilityRole="link" accessibilityLabel="Strona główna" style={[styles.button, styles.brand]} onPress={home}>
          {config.uri ? <Image accessible={false} source={{ uri: config.uri }} style={styles.logo} resizeMode="contain" /> : null}
          <Text style={styles.label}>{config.brand}</Text>
        </Pressable>
        {config.actions.map((label, i) => <Pressable key={i} accessibilityRole="button" style={styles.button}
          onPress={() => onAction ? onAction(label) : setFeedback(label)}><Text>{label}</Text></Pressable>)}
        {config.account ? <Pressable accessibilityRole="button" style={styles.button} disabled={config.accountDisabled}
          accessibilityState={{ expanded: accountOpen, disabled: config.accountDisabled }}
          onPress={() => setAccountOpen(!accountOpen)}><Text>{config.account}</Text></Pressable> : null}
      </View>
      {accountOpen ? <View style={styles.account}>
        {(config.items as { id: string; label: string; disabled: boolean }[]).map((item) =>
          <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ disabled: item.disabled }}
            disabled={item.disabled} style={styles.button} onPress={() => {
              setAccountOpen(false);
              if (onAccountSelect) onAccountSelect(item.id);
              else setFeedback(item.label);
            }}><Text>{item.label}</Text></Pressable>)}
      </View> : null}
      {feedback ? <Text accessibilityLiveRegion="polite">{feedback}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { backgroundColor: '#fff' },
  bar: { minHeight: isIOS ? 44 : 56, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  brand: { flexDirection: 'row', gap: 8, flexGrow: 1 },
  button: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
  label: { color: '#161b22', fontWeight: '600' },
  logo: ${JSON.stringify(picture.icon ?? {})},
  account: { paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#d6d9df' },
});
`;
}
