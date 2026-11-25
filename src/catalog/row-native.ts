import type { NativeSingleCardProps } from '../kit/mobile/content.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = Partial<NativeSingleCardProps> & { color?: string; backgroundImage?: string };

export function rowNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const tile = name === 'ShortcutTile' || name === 'SmallServiceCard';
  const artwork = name === 'SmallServiceCard';
  const config = {
    title: textOf(args.title),
    info: textOf(args.info),
    descriptions: [args.description, ...(args.descriptions ?? [])].map(textOf).filter(Boolean),
    badge: textOf(args.badge),
    trailing: textOf(args.trailing),
    icon: !!args.icon,
    iconAction: !!args.onIconClick,
    iconLabel: args.iconLabel ?? 'Więcej informacji',
    iconSize: args.iconSize ?? (artwork ? 32 : 24),
    imageSize: args.imageSize ?? 44,
    image: args.image && /^https?:\/\//i.test(args.image.src) ? args.image : null,
    artwork: /^https?:\/\//i.test(args.backgroundImage ?? '') ? args.backgroundImage : null,
    tile,
    artworkTile: artwork,
    disabled: !!args.disabled,
    selected: !!args.selected,
    reversed: !!args.reversed,
    bordered: name === 'NativeSingleCard' && args.drawBorder !== false,
    compact: !!args.contentOnly,
    tint: args.color ?? '#0452a8',
    titleColor: args.titleColor ?? '#161b22',
    variant: args.variant ?? (args.onClick ? 'clickable' : 'info'),
    alignTop: args.iconAlign === 'title',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

const config = ${JSON.stringify(config, null, 2)} as {
  title: string; info: string; descriptions: string[]; badge: string; trailing: string;
  icon: boolean; iconAction: boolean; iconLabel: string; iconSize: number; imageSize: number;
  image: { src: string; alt: string } | null; artwork: string | null;
  tile: boolean; artworkTile: boolean; disabled: boolean; selected: boolean; reversed: boolean;
  bordered: boolean; compact: boolean; tint: string; titleColor: string;
  variant: 'info' | 'clickable' | 'checkbox' | 'radio' | 'delete'; alignTop: boolean;
};
const isIOS = ${ios};

type Props = {
  icon?: ReactNode;
  trailing?: ReactNode;
  imageSource?: ImageSourcePropType;
  backgroundImageSource?: ImageSourcePropType;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onPress?: () => void;
  onIconPress?: () => void;
};

export default function Example({
  icon, trailing, imageSource, backgroundImageSource,
  selected, onSelectedChange, onPress, onIconPress,
}: Props) {
  const [localSelected, setLocalSelected] = useState(config.selected);
  const [activated, setActivated] = useState(false);
  const checked = selected ?? localSelected;
  const selectable = config.variant === 'checkbox' || config.variant === 'radio';
  const interactive = selectable || config.variant === 'clickable' || !!onPress;
  const separateIcon = !config.tile && (config.iconAction || !!onIconPress);
  const image = imageSource ?? (config.image ? { uri: config.image.src } : undefined);
  const artwork = backgroundImageSource ?? (config.artwork ? { uri: config.artwork } : undefined);
  const showMedia = config.icon || !!icon || !!image || config.variant === 'delete' || config.tile;

  function activate() {
    if (config.disabled) return;
    if (selectable) {
      const next = config.variant === 'radio' ? true : !checked;
      if (next === checked) return;
      if (selected === undefined) setLocalSelected(next);
      onSelectedChange?.(next);
    } else if (onPress) onPress();
    else setActivated(true);
  }

  const iconContent = icon ?? (
    image ? <Image source={image} accessibilityLabel={config.image?.alt || undefined}
      style={{ width: config.imageSize, height: config.imageSize, borderRadius: 8 }} />
      : <Text accessible={false} style={{ color: config.tint, fontSize: config.iconSize }}>
        {config.variant === 'delete' ? '×' : '◈'}
      </Text>
  );
  const media = (
    <View style={[styles.media, config.alignTop && styles.mediaTop, config.tile && styles.circle,
      config.artworkTile && styles.artwork]}>
      {artwork ? <Image accessible={false} source={artwork} style={styles.background} /> : null}
      {iconContent}
    </View>
  );
  const content = (
    <>
      {showMedia && !separateIcon ? media : null}
      <View style={config.tile ? styles.tileCopy : styles.copy}>
        {config.info ? <Text style={[styles.description, config.reversed && styles.emphasis]}>{config.info}</Text> : null}
        <Text style={[styles.title, config.tile && styles.tileTitle,
          config.reversed && styles.description, { color: config.titleColor }]}>{config.title}</Text>
        {config.descriptions.map((description, index) => <Text key={index} style={styles.description}>{description}</Text>)}
        {config.badge ? <Text style={styles.description}>{config.badge}</Text> : null}
      </View>
      {!config.tile ? (trailing ?? (config.trailing || selectable || config.variant === 'clickable'
        ? <Text accessible={false} style={styles.trailing}>
            {config.trailing || (selectable ? (checked ? '●' : '○') : '›')}
          </Text> : null)) : null}
    </>
  );
  const bodyStyle = [styles.body, config.compact && styles.compact, config.tile && styles.tile,
    config.artworkTile && styles.wideTile];

  return (
    <View>
      <View style={[styles.shell, config.bordered && styles.border, config.disabled && styles.disabled]}>
        {separateIcon ? (
          <Pressable accessibilityRole="button" accessibilityLabel={config.iconLabel} disabled={config.disabled}
            style={styles.iconAction} onPress={() => {
              if (config.disabled) return;
              if (onIconPress) onIconPress();
              else setActivated(true);
            }}>
            {media}
          </Pressable>
        ) : null}
        {interactive ? (
          <Pressable accessibilityRole={selectable ? (config.variant === 'radio' ? 'radio' : 'checkbox') : 'button'}
            accessibilityState={{ disabled: config.disabled, checked: selectable ? checked : undefined }}
            disabled={config.disabled} style={({ pressed }) => [...bodyStyle, pressed && styles.pressed]}
            onPress={activate}>{content}</Pressable>
        ) : <View style={bodyStyle}>{content}</View>}
      </View>
      {activated ? <Text accessibilityLiveRegion="polite">{config.title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  border: { borderColor: '#d6d9df', borderWidth: 1, borderRadius: isIOS ? 12 : 16 },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: isIOS ? 44 : 56, padding: 8 },
  compact: { padding: 0 },
  copy: { flex: 1, gap: 2 },
  tileCopy: { alignItems: 'center' },
  title: { fontWeight: '600', fontSize: isIOS ? 17 : 16 },
  description: { fontSize: 13, color: '#52575f', fontWeight: '400' },
  emphasis: { fontSize: 17, fontWeight: '600' },
  tile: { flex: 0, flexDirection: 'column', width: isIOS ? 80 : 96, minHeight: 80, alignItems: 'center' },
  wideTile: { width: 108 },
  tileTitle: { textAlign: 'center', fontSize: 12 },
  media: { alignItems: 'center', justifyContent: 'center' },
  mediaTop: { alignSelf: 'flex-start' },
  circle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#edf3fc' },
  artwork: { width: 80, height: 80, borderRadius: 16, overflow: 'hidden' },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  iconAction: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  trailing: { fontSize: 20, color: '#52575f' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
});
`;
}
