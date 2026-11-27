import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type NoticeArgs = {
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  action?: { label?: string } | ReactNode;
  duration?: number;
  closable?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
};

export function snackbarNativeSource(
  name: string,
  args: NoticeArgs,
  platform: NativePlatformChoice,
) {
  const banner = name === 'MobileBanner';
  const portal = name === 'PortalSnackbar';
  const duration = args.duration ?? (portal ? 5000 : 3500);
  const action = args.action;
  const config = {
    title: textOf(args.title),
    message: textOf(banner ? args.children : args.message),
    action:
      action && typeof action === 'object' && 'label' in action
        ? (action.label ?? '')
        : textOf(action as ReactNode),
    duration: banner || !Number.isFinite(duration) || (portal && duration <= 0) ? null : duration,
    closable: banner
      ? Boolean(args.onDismiss)
      : portal
        ? (args.closable ?? true)
        : (args.dismissible ?? true),
    dismissLabel: args.dismissLabel ?? 'Zamknij komunikat',
    dismissOnAction: !portal && !banner,
    banner,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useEffect, useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const notice = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ onAction }: { onAction?: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(notice.duration !== 0);

  useEffect(() => {
    if (!visible || notice.duration === null) return;
    const timeout = setTimeout(() => setVisible(false), notice.duration);
    return () => clearTimeout(timeout);
  }, [attempt, visible]);

  return (
    <View style={styles.container}>
      {!visible ? (
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
          setAttempt((previous) => previous + 1);
          setVisible(true);
        }}>
          <Text>Pokaż komunikat</Text>
        </Pressable>
      ) : (
        <View style={[styles.notice, notice.banner && styles.banner]}>
          <View style={styles.copy} accessibilityLiveRegion="polite">
            {notice.title ? <Text style={[styles.message, styles.title]}>{notice.title}</Text> : null}
            <Text accessibilityRole="alert" style={styles.message}>{notice.message}</Text>
          </View>
          {notice.action ? (
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
              onAction?.();
              if (notice.dismissOnAction) setVisible(false);
            }}>
              <Text style={styles.message}>{notice.action}</Text>
            </Pressable>
          ) : null}
          {notice.closable ? (
            <Pressable accessibilityRole="button" accessibilityLabel={notice.dismissLabel}
              style={styles.button} onPress={() => setVisible(false)}>
              <Text style={styles.message}>×</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  notice: {
    flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, padding: 16,
    borderRadius: isIOS ? 4 : 8, backgroundColor: isIOS ? '#52575f' : '#323232',
    ...isIOS
      ? { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 4 },
  },
  banner: { backgroundColor: '#17486b' },
  copy: { flex: 1 },
  message: { color: '#fff', fontSize: isIOS ? 13 : 14 },
  title: { fontWeight: '600', marginBottom: 4 },
  button: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
});
`;
}
