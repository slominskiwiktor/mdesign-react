import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import type { DocumentArtworkVariant } from '../kit/DocumentArtwork.js';
import { documentBackgrounds } from '../kit/documentBackgrounds.js';
import { rasterize } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';

const backgrounds: Record<DocumentArtworkVariant, string> = {
  id: documentBackgrounds.idWide,
  pension: documentBackgrounds.pensionWide,
  family: documentBackgrounds.familyWide,
  vehicles: documentBackgrounds.vehiclesWide,
};
const tones = { blue: '#dceaff', teal: '#dcefe9', purple: '#ece4f8', orange: '#ffebda' };

type Args = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  backgroundImage?: string;
  artwork?: DocumentArtworkVariant;
  variant?: DocumentArtworkVariant;
  tone?: keyof typeof tones;
  onClick?: () => void;
  style?: { maxWidth?: number | string };
};

export async function documentNativeSource(
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const artworkOnly = name === 'DocumentArtwork';
  const tile = name === 'DocumentTile';
  const variant = artworkOnly ? args.variant : args.artwork;
  const chosen = variant ? backgrounds[variant] : args.backgroundImage;
  let uri: string | undefined;
  if (chosen && Object.values(backgrounds).includes(chosen)) {
    uri = await rasterize(chosen);
    if (!uri) throw new Error('Nie udało się przygotować grafiki dokumentu.');
  } else if (chosen && /^https?:\/\//i.test(chosen) && !/\.svg(?:[?#]|$)/i.test(chosen)) {
    uri = chosen;
  }
  const config = {
    title: args.title ?? '',
    description: args.description ?? '',
    uri: uri ?? null,
    artworkOnly,
    tile,
    color: tones[args.tone ?? 'blue'],
    interactive: !!args.onClick,
    trailing: !!args.trailing,
    glyph: isValidElement(args.icon) ? '▣' : '',
    maxWidth: typeof args.style?.maxWidth === 'number' ? args.style.maxWidth : null,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  imageSource?: ImageSourcePropType;
  icon?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
};

export default function Example({ imageSource, icon, trailing, onPress }: Props = {}) {
  const [opened, setOpened] = useState(false);
  const source = imageSource ?? (config.uri ? { uri: config.uri } : undefined);
  const artwork = source ? (
    <Image source={source} accessible={false} importantForAccessibility="no"
      resizeMode="cover" style={styles.artwork} />
  ) : null;
  const surface = [styles.surface, config.tile && styles.tile,
    config.maxWidth !== null && { maxWidth: config.maxWidth }];
  if (config.artworkOnly) {
    return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={[styles.surface, styles.illustration]}>{artwork}</View>;
  }
  const content = (
    <>
      {artwork}
      {artwork ? <View pointerEvents="none" style={styles.scrim} /> : null}
      {config.tile && (icon ?? (config.glyph ? <Text style={[styles.icon, !!artwork && styles.onArtwork]} accessible={false}>{config.glyph}</Text> : null))}
      <View style={[styles.caption, config.tile && styles.tileCaption]}>
        <View style={styles.copy}>
          <Text style={[styles.title, config.tile && styles.tileTitle, !!artwork && styles.onArtwork]}>{config.title}</Text>
          {config.description ? <Text style={[styles.description, !!artwork && styles.onArtwork]}>{config.description}</Text> : null}
        </View>
        {!config.tile && (trailing ?? (config.trailing ? <Text style={[styles.trailing, !!artwork && styles.onArtwork]} accessible={false}>›</Text> : null))}
      </View>
    </>
  );
  return (
    <View>
      {config.interactive || onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel={config.title}
          accessibilityHint={config.description || undefined}
          style={({ pressed }) => [...surface, pressed && styles.pressed]} onPress={() => {
            if (onPress) onPress();
            else setOpened(true);
          }}>
          {content}
        </Pressable>
      ) : <View style={surface}>{content}</View>}
      {opened ? <Text accessibilityLiveRegion="polite">{config.title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { minHeight: isIOS ? 226 : 204, borderRadius: isIOS ? 8 : 16,
    backgroundColor: config.color, overflow: 'hidden', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  tile: { minHeight: 128, padding: 16, justifyContent: 'space-between', gap: 8 },
  illustration: { minHeight: 128, aspectRatio: 2 },
  artwork: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: '#0005' },
  onArtwork: { color: '#fff' },
  caption: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tileCaption: { minHeight: 0 },
  copy: { flex: 1 },
  title: { fontSize: isIOS ? 17 : 16, color: '#101317', fontWeight: '600' },
  tileTitle: { fontSize: 15 },
  description: { fontSize: 12, color: '#394450' },
  icon: { fontSize: 28, color: '#0452a8' },
  trailing: { width: 44, textAlign: 'center', fontSize: 24, color: '#101317' },
  pressed: { opacity: 0.76 },
});
`;
}
