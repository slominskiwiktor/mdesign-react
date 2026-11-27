import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import bannerArtwork from '../kit/portal/assets/demo-banner-e-delivery.svg';
import { textOf } from './native-example-text.js';
import { rasterize } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  heading?: ReactNode;
  description?: ReactNode;
  code?: string;
  image?: string;
  actions?: ReactNode;
  dismissible?: boolean;
  visible?: boolean;
  defaultVisible?: boolean;
};

export async function portalNoticeNativeSource(
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const banner = name === 'PortalBanner';
  const image = banner ? (args.image ?? bannerArtwork) : '';
  const uri =
    image === bannerArtwork
      ? await rasterize(image)
      : /^https?:\/\//i.test(image) && !/\.svg(?:[?#]|$)/i.test(image)
        ? image
        : undefined;
  const actions = Children.toArray(args.actions)
    .map((node) => {
      const props = isValidElement<{ 'aria-label'?: string; disabled?: boolean }>(node)
        ? node.props
        : undefined;
      return { label: props?.['aria-label'] ?? textOf(node), disabled: !!props?.disabled };
    })
    .filter(({ label }) => label);
  const config = {
    banner,
    actions,
    uri: uri ?? null,
    title: textOf(args.heading ?? (banner ? 'Ważna informacja' : 'Wystąpił błąd')),
    description: textOf(args.description),
    code: args.code ?? '',
    visible: args.visible ?? args.defaultVisible ?? true,
    dismissible: banner && (args.dismissible ?? true),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};
type Props = {
  visible?: boolean; onVisibleChange?: (visible: boolean) => void; onDismiss?: () => void;
  onAction?: (label: string, index: number) => void; actions?: ReactNode;
  imageSource?: ImageSourcePropType; icon?: ReactNode;
};

export default function Example({ visible, onVisibleChange, onDismiss, onAction, actions, imageSource, icon }: Props = {}) {
  const [local, setLocal] = useState(config.visible);
  const [selection, setSelection] = useState('');
  const source = imageSource ?? (config.uri ? { uri: config.uri } : undefined);
  if (config.banner && !(visible ?? local)) return null;

  return (
    <View style={[styles.container, config.banner ? styles.banner : styles.error]}>
      {config.dismissible ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Zamknij informację"
          style={styles.close} onPress={() => {
            if (visible === undefined) setLocal(false);
            onVisibleChange?.(false);
            onDismiss?.();
          }}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      ) : null}
      {config.banner && source ? <Image accessible={false} source={source} resizeMode="contain" style={styles.image} /> : null}
      {!config.banner ? (icon ?? <Text accessible={false} style={styles.errorIcon}>ⓘ</Text>) : null}
      {config.code ? <Text style={styles.code}>{config.code}</Text> : null}
      <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>
      {config.description ? <Text style={styles.description}>{config.description}</Text> : null}
      {actions ?? config.actions.map(({ label, disabled }, index) => (
        <Pressable key={index} accessibilityRole="button" accessibilityState={{ disabled }}
          style={[styles.action, disabled && styles.disabled]} disabled={disabled} onPress={() => {
            if (disabled) return;
            if (onAction) onAction(label, index);
            else setSelection(label);
          }}>
          <Text style={styles.actionText}>{label}</Text>
        </Pressable>
      ))}
      {selection ? <Text accessibilityLiveRegion="polite" style={styles.description}>{selection}</Text> : null}
    </View>
  );
}

const ink = config.banner ? '#fff' : '#161b22';
const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, borderRadius: isIOS ? 16 : 12 },
  banner: { backgroundColor: isIOS ? '#17468f' : '#0452a8' },
  error: { alignItems: 'center', backgroundColor: '#fff' },
  title: { color: ink, fontSize: isIOS ? 22 : 20, fontWeight: '700', textAlign: config.banner ? 'left' : 'center' },
  description: { color: ink, fontSize: 15, textAlign: config.banner ? 'left' : 'center' },
  close: { alignSelf: 'flex-end', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: ink, fontSize: 24 },
  image: { width: '100%', height: 96 },
  errorIcon: { color: '#0452a8', fontSize: 48 },
  code: { color: '#52575f', fontSize: 16 },
  action: { alignSelf: config.banner ? 'flex-start' : 'center', minHeight: 44, justifyContent: 'center',
    borderWidth: 1, borderRadius: isIOS ? 22 : 8, borderColor: config.banner ? '#fff' : '#0452a8', paddingHorizontal: 16 },
  actionText: { color: config.banner ? '#fff' : '#0452a8', fontWeight: '600' },
  disabled: { opacity: 0.55 },
});
`;
}
