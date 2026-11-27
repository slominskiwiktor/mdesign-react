import type {
  LandingDownloadCTAProps,
  LandingDownloadPanelProps,
} from '../kit/landing/overlays.js';
import { landingAssets, landingStoreLinks } from '../kit/landing/assets.js';
import { safeHref } from '../kit/mobile/shared.js';
import { textOf } from './native-example-text.js';
import { rasterize } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';

export async function downloadNativeSource(
  name: string,
  args: LandingDownloadCTAProps & LandingDownloadPanelProps,
  platform: NativePlatformChoice,
) {
  const panel = name === 'LandingDownloadPanel';
  const stores = (
    args.stores ?? [
      { label: 'Pobierz z Google Play', href: landingStoreLinks.googlePlay },
      { label: 'Pobierz z App Store', href: landingStoreLinks.appStore },
    ]
  ).flatMap(({ label, href }) => {
    const filtered = safeHref(href);
    return filtered && /^https?:\/\//i.test(filtered) ? [{ label, href: filtered }] : [];
  });
  const image =
    panel || args.onDownload
      ? await rasterize(args.qrImage ?? landingAssets.downloadQR)
      : undefined;
  const config = {
    panel,
    stores,
    image: image ?? null,
    qrAlt: args.qrAlt ?? 'Kod QR do strony pobierania',
    title: textOf(args.title) || (panel ? 'Pobierz aplikację' : 'Pobierz aplikację demo'),
    description: textOf(args.description),
    extra: textOf(args.children),
    compact: args.variant === 'compact',
    showQR: panel || !!args.onDownload,
    trigger: textOf(args.trigger) || 'Pobierz aplikację',
    open: args.open ?? args.defaultOpen ?? false,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ open, onOpenChange, onNavigate }: {
  open?: boolean; onOpenChange?: (open: boolean) => void; onNavigate?: (href: string) => void;
} = {}) {
  const [shown, setShown] = useState(config.open);
  const [error, setError] = useState('');
  function change(next: boolean) {
    if (open === undefined) setShown(next);
    onOpenChange?.(next);
  }

  function content(inModal: boolean) {
    return (
      <View style={styles.card} accessibilityViewIsModal={inModal}>
        <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>
        {config.description ? <Text>{config.description}</Text> : null}
        {inModal && config.image ? <Image accessible accessibilityRole="image"
          accessibilityLabel={config.qrAlt} source={{ uri: config.image }} style={styles.qr} resizeMode="contain" /> : null}
        {config.stores.map(({ href, label }, index) => (
          <Pressable key={index} accessibilityRole="link" style={styles.action} onPress={() => {
            setError('');
            if (onNavigate) onNavigate(href);
            else void Linking.openURL(href).catch(() => setError('Nie udało się otworzyć sklepu.'));
          }}>
            <Text style={styles.link}>{label}</Text>
          </Pressable>
        ))}
        {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        {inModal && config.extra ? <Text>{config.extra}</Text> : null}
        {inModal || config.showQR ? <Pressable accessibilityRole="button" style={styles.action}
          onPress={() => change(!inModal)}>
          <Text style={styles.link}>{inModal ? 'Zamknij' : 'Pokaż kod QR'}</Text>
        </Pressable> : null}
      </View>
    );
  }

  return (
    <View>
      {config.panel ? <Pressable accessibilityRole="button" style={styles.action} onPress={() => change(true)}>
        <Text style={styles.link}>{config.trigger}</Text>
      </Pressable> : content(false)}
      <Modal transparent visible={open ?? shown} animationType={isIOS ? 'slide' : 'fade'} onRequestClose={() => change(false)}>
        <ScrollView contentContainerStyle={styles.overlay}>{content(true)}</ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flexGrow: 1, justifyContent: isIOS ? 'flex-end' : 'center', backgroundColor: '#0006', padding: 16 },
  card: { padding: config.compact ? 12 : 20, gap: 8, backgroundColor: '#fff', borderRadius: isIOS ? 16 : 12 },
  title: { color: '#161b22', fontWeight: '700', fontSize: config.compact ? 17 : 22 },
  qr: { width: 176, height: 176, alignSelf: 'center' },
  action: { minHeight: 44, justifyContent: 'center' },
  link: { color: '#0452a8', fontWeight: '600' },
});
`;
}
