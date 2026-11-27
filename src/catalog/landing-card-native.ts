import type { ReactNode } from 'react';
import type { LandingNewsItem } from '../kit/landing/content.js';
import { safeHref } from '../kit/mobile/shared.js';
import { captureIconSurface } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

type Args = {
  item?: LandingNewsItem;
  title?: string;
  description?: ReactNode;
  href?: string;
  image?: { src: string; alt: string };
  featured?: boolean;
  showDate?: boolean;
  wide?: boolean;
  buttonLabel?: string;
  linkLabel?: string;
  format?: string;
  sizeBytes?: number;
};

export async function landingCardNativeSource(
  root: HTMLElement,
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const item = args.item ?? args;
  const kind =
    name === 'LandingCatalogCard'
      ? 'catalog'
      : name === 'LandingNewsCard'
        ? 'news'
        : name === 'LandingServiceCard'
          ? 'service'
          : 'press';
  const card = root.querySelector(
    '.ml-catalog-card, .ml-news-card, .ml-service-card, .ml-press-card',
  );
  const picture = card?.querySelector('img')
    ? await captureIconSurface(
        root,
        '.ml-catalog-card, .ml-news-card, .ml-service-card, .ml-press-card',
      )
    : undefined;
  const size = args.sizeBytes;
  const fileSize =
    typeof size === 'number' && Number.isFinite(size) && size >= 0
      ? size >= 1048576
        ? (size / 1048576).toLocaleString('pl', { maximumFractionDigits: 1 }) + ' MB'
        : Math.ceil(size / 1024) + ' KB'
      : '';
  const config = {
    kind,
    title: item.title ?? '',
    description: textOf(item.description),
    href: item.href ? (safeHref(item.href) ?? '') : '',
    image: picture?.uri ?? null,
    alt: kind === 'catalog' ? '' : (item.image?.alt ?? ''),
    date: args.showDate !== false ? (args.item?.date ?? '') : '',
    featured: !!args.featured,
    wide: !!args.wide,
    isNew: !!args.item?.isNew,
    linkLabel:
      args.buttonLabel ??
      args.linkLabel ??
      (kind === 'press' ? 'Pobierz' : kind === 'catalog' ? 'Czytaj więcej' : 'Dowiedz się więcej'),
    file: [args.format, fileSize].filter(Boolean).join(' · '),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

const config = ${JSON.stringify(config, null, 2)} as {
  kind: 'catalog' | 'news' | 'service' | 'press'; title: string; description: string;
  href: string; image: string | null; alt: string; date: string; featured: boolean;
  wide: boolean; isNew: boolean; linkLabel: string; file: string;
};
const isIOS = ${ios};

export default function Example({ image, onNavigate }: {
  image?: ImageSourcePropType; onNavigate?: (href: string) => void;
} = {}) {
  const [status, setStatus] = useState('');
  const artwork = image ?? (config.image ? { uri: config.image } : undefined);
  const wide = config.kind === 'service' && config.wide;

  async function open() {
    if (!config.href) return;
    setStatus('');
    if (onNavigate) onNavigate(config.href);
    else if (/^(https?:|mailto:|tel:)/i.test(config.href)) {
      try { await Linking.openURL(config.href); }
      catch { setStatus('Nie udało się otworzyć odnośnika.'); }
    } else setStatus(config.href);
  }

  return (
    <View style={styles.card}>
      <View style={wide && styles.wide}>
        {artwork ? <Image source={artwork} accessible={!!config.alt} accessibilityLabel={config.alt || undefined}
          resizeMode="cover" style={[styles.artwork, wide && styles.side]} /> : null}
        <View style={styles.copy}>
          {config.isNew ? <Text style={styles.meta}>Nowość</Text> : null}
          {config.date ? <Text style={styles.meta}>{config.date}</Text> : null}
          <Text accessibilityRole="header" style={[styles.title, config.featured && styles.featured]}>{config.title}</Text>
          {config.description ? <Text style={styles.body}>{config.description}</Text> : null}
          {config.file ? <Text style={styles.meta}>{config.file}</Text> : null}
          {config.href ? <Pressable accessibilityRole="link" accessibilityLabel={config.linkLabel + ': ' + config.title}
            onPress={() => void open()} style={styles.action}>
            <Text style={styles.link}>{config.linkLabel}</Text>
          </Pressable> : null}
          {status ? <Text accessibilityLiveRegion="polite" style={styles.meta}>{status}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: isIOS ? 16 : 12, borderWidth: 1, borderColor: '#d6d9df', overflow: 'hidden' },
  wide: { flexDirection: 'row' },
  artwork: { width: '100%', aspectRatio: 2 },
  side: { width: '40%', alignSelf: 'stretch', aspectRatio: undefined },
  copy: { flex: 1, minWidth: 0, padding: 16, gap: 8 },
  title: { color: '#161b22', fontSize: isIOS ? 19 : 18, fontWeight: '700' },
  featured: { fontSize: 24 },
  body: { color: '#161b22', fontSize: 15 },
  meta: { color: '#52575f', fontSize: 13 },
  action: { minHeight: 44, justifyContent: 'center' },
  link: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600', textDecorationLine: 'underline' },
});
`;
}
