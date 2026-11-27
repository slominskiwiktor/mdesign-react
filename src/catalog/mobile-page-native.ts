import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../kit/components.js';
import { captureIconSurface } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

type Args = {
  title?: ReactNode;
  description?: ReactNode;
  subDescription?: ReactNode;
  children?: ReactNode;
  bottomContent?: ReactNode;
  action?: ReactNode;
  alert?: ReactNode;
  topBarTitle?: string;
  header?: { title?: ReactNode; description?: ReactNode };
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export async function mobilePageNativeSource(
  root: HTMLElement,
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const picture = await captureIconSurface(
    root,
    '.m-mobile-page-icon, .m-mobile-page-illustration, .m-mobile-icon-surface',
  );
  const buttonInBody =
    isValidElement(args.children) &&
    (args.children.type === Button || args.children.type === 'button');
  const config = {
    title: textOf(args.header?.title ?? args.title),
    description: [args.header?.description ?? args.description, args.subDescription]
      .map(textOf)
      .filter(Boolean),
    body: buttonInBody ? '' : textOf(args.children),
    button: buttonInBody ? textOf(args.children) : '',
    footer: textOf(args.action ?? args.bottomContent),
    alert: textOf(args.alert),
    bar: args.topBarTitle ?? '',
    back: !!args.onBack,
    refresh: !!args.onRefresh,
    refreshing: !!args.refreshing,
    centered: name !== 'ServiceWelcomePage',
    image: picture.uri ?? null,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  children?: ReactNode; artwork?: ReactNode; footer?: ReactNode; topBarActions?: ReactNode;
  onBack?: () => void; onAction?: (label: string) => void;
  onRefresh?: () => void | Promise<void>; onRefreshError?: (error: unknown) => void; refreshing?: boolean;
};

export default function Example({ children, artwork, footer, topBarActions, onBack, onAction,
  onRefresh, onRefreshError, refreshing = config.refreshing }: Props = {}) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function refresh() {
    if (lock.current || refreshing || !onRefresh) return;
    lock.current = true;
    setBusy(true);
    try { await onRefresh(); }
    catch (error) { onRefreshError?.(error); setStatus('Nie udało się odświeżyć.'); }
    finally { lock.current = false; setBusy(false); }
  }

  function action(label: string, run?: () => void) {
    return <Pressable accessibilityRole="button" style={styles.action} onPress={() => {
      if (run) run();
      else if (onAction) onAction(label);
      else setStatus(label);
    }}><Text style={styles.link}>{label}</Text></Pressable>;
  }

  return (
    <View style={styles.screen}>
      {config.bar ? <View style={styles.bar}>
        {config.back || onBack ? action('Wróć', onBack) : null}
        <Text style={styles.barTitle}>{config.bar}</Text>{topBarActions}
      </View> : null}
      <ScrollView contentContainerStyle={[styles.content, config.centered && styles.centered]}
        refreshControl={onRefresh ? <RefreshControl refreshing={busy || refreshing} onRefresh={() => void refresh()} /> : undefined}>
        {config.refresh && !onRefresh ? action('Odśwież') : null}
        {config.alert ? <Text accessibilityRole="alert">{config.alert}</Text> : null}
        {artwork ?? (config.image ? <Image accessible={false} source={{ uri: config.image }}
          resizeMode="contain" style={styles.artwork} /> : null)}
        <Text accessibilityRole="header" style={[styles.title, config.centered && styles.centerText]}>{config.title}</Text>
        {config.description.map((line, index) => <Text key={index} style={config.centered && styles.centerText}>{line}</Text>)}
        {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text>
          : children ?? (config.button ? action(config.button) : config.body ? <Text>{config.body}</Text> : null)}
        {status ? <Text accessibilityLiveRegion="polite">{status}</Text> : null}
      </ScrollView>
      {footer ?? (config.footer ? <View style={styles.footer}>{action(config.footer)}</View> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  bar: { minHeight: isIOS ? 44 : 56, paddingHorizontal: 16, gap: 12, flexDirection: 'row', alignItems: 'center' },
  barTitle: { color: '#161b22', fontWeight: '600', flex: 1 },
  content: { padding: 16, gap: 8 },
  centered: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  artwork: ${JSON.stringify(picture.icon ?? {})},
  title: { color: '#161b22', fontSize: isIOS ? 28 : 24, fontWeight: '700' },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  link: { color: '#0452a8', fontWeight: '600' },
  footer: { padding: 16 },
});
`;
}
