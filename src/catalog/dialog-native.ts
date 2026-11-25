import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type DialogExample = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  trigger?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  closeLabel?: string;
  footer?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  data?: Array<{ label: ReactNode; value: ReactNode }>;
};

const dialogNames = new Set([
  'Dialog',
  'BottomSheet',
  'ResultModal',
  'MobileDialog',
  'MobileDialogActions',
  'MobileDialogClose',
  'PortalDialog',
  'PortalDialogClose',
  'PortalDialogContent',
  'PortalDialogFooter',
  'PortalDialogHeader',
  'PortalDialogProvider',
  'PortalDialogRoot',
  'PortalDialogSurface',
  'PortalDialogTrigger',
]);

export function dialogNativeSource(
  name: string,
  args: DialogExample,
  platform: NativePlatformChoice,
) {
  if (!dialogNames.has(name)) return undefined;
  const children = textOf(args.children);
  const close = name.endsWith('Close');
  const trigger = name === 'PortalDialogTrigger';
  const sheet = name === 'BottomSheet';
  const confirm =
    args.confirmLabel || textOf(args.footer) || (name === 'PortalDialogFooter' ? children : '');
  const config = {
    title: textOf(args.title) || 'Potwierdź zmianę',
    description: textOf(args.description),
    body: !close && !trigger && name !== 'PortalDialogFooter' ? children : '',
    trigger: (trigger ? children : textOf(args.trigger)) || 'Otwórz dialog',
    close:
      args.closeLabel || (close ? children : '') || (confirm ? args.cancelLabel : '') || 'Zamknij',
    confirm,
    initialOpen: args.open ?? args.defaultOpen ?? false,
    data: Array.isArray(args.data)
      ? args.data.map(({ label, value }) => ({
          label: textOf(label),
          value: textOf(value),
        }))
      : [],
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const ios = ${ios};
const sheet = ${sheet};

export default function DialogExample({ children, onConfirm, onOpenChange }: {
  children?: ReactNode;
  onConfirm?: () => void;
  onOpenChange?: (value: boolean) => void;
} = {}) {
  const [open, setOpen] = useState(config.initialOpen);
  const nativeSheet = sheet && ios;

  function changeOpen(value: boolean) {
    setOpen(value);
    onOpenChange?.(value);
  }

  function confirm() {
    changeOpen(false);
    onConfirm?.();
  }

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => changeOpen(true)} style={styles.trigger}>
        <Text style={styles.action}>{config.trigger}</Text>
      </Pressable>
      <Modal visible={open} transparent={!nativeSheet} presentationStyle={nativeSheet ? 'pageSheet' : 'overFullScreen'}
        animationType={sheet ? 'slide' : 'fade'} onRequestClose={() => changeOpen(false)}>
        <View style={[styles.overlay, sheet && styles.bottom, nativeSheet && styles.nativeSheet]}>
          <View accessibilityViewIsModal style={[styles.surface, sheet && styles.sheet]}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>
              {!!config.description && <Text style={styles.description}>{config.description}</Text>}
              {!!config.body && <Text style={styles.body}>{config.body}</Text>}
              {config.data.map((row, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.description}>{row.label}</Text>
                  <Text style={styles.body}>{row.value}</Text>
                </View>
              ))}
              {children}
            </ScrollView>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => changeOpen(false)} style={styles.button}>
                <Text style={styles.action}>{config.close}</Text>
              </Pressable>
              {!!config.confirm && <Pressable accessibilityRole="button" onPress={confirm} style={styles.button}>
                <Text style={styles.action}>{config.confirm}</Text>
              </Pressable>}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', backgroundColor: '#0008', padding: 24 },
  bottom: { justifyContent: 'flex-end', padding: 0 },
  nativeSheet: { backgroundColor: '#fff' },
  surface: { maxHeight: '85%', backgroundColor: '#fff', borderRadius: ios ? 14 : 24, overflow: 'hidden' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  content: { padding: 20, gap: 8 },
  title: { fontSize: ios ? 17 : 22, fontWeight: '600', color: '#101317' },
  body: { fontSize: 16, color: '#101317' },
  description: { fontSize: 14, color: '#52575f' },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, gap: 8 },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  trigger: { minHeight: 44, justifyContent: 'center' },
  action: { color: '#0452a8', fontWeight: '600' },
});
`;
}
