import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { safeHref } from '../kit/mobile/shared.js';
import { rasterize } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

type Entry = {
  title: string;
  href?: string;
  description?: ReactNode;
  image?: { src: string; alt: string };
};

type Args = {
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  image?: { src: string; alt: string };
  actions?: ReactNode;
  reverse?: boolean;
  tone?: 'white' | 'blue' | 'dark';
  layout?: string;
  variant?: string;
  links?: { label: string; href: string }[];
  breadcrumbs?: { label: string; href?: string }[];
  items?: ({ value: ReactNode; label: string; detail?: string } | Entry)[];
  related?: Entry[];
  mobileImage?: string;
  date?: string;
};

export async function landingSectionNativeSource(
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const controls = Children.toArray(args.actions).map((node) => {
    const props = isValidElement<{ disabled?: boolean; href?: string; 'aria-label'?: string }>(node)
      ? node.props
      : undefined;
    return {
      label: props?.['aria-label'] ?? textOf(node),
      href: props?.href ?? '',
      disabled: !!props?.disabled,
    };
  });
  const article = name === 'LandingArticle';
  const awards = name === 'LandingAwards';
  const entries = await Promise.all(
    (article
      ? (args.related ?? [])
      : awards
        ? (args.items ?? []).filter((item): item is Entry => 'title' in item)
        : []
    ).map(async (item) => ({
      title: item.title,
      description: textOf(item.description),
      href: item.href ? (safeHref(item.href) ?? '') : '',
      image: item.image ? ((await rasterize(item.image.src)) ?? null) : null,
      alt: item.image?.alt ?? '',
    })),
  );
  const config = {
    article,
    entries,
    date: args.date ?? '',
    paragraphs: article ? Children.toArray(args.children).map(textOf).filter(Boolean) : [],
    mobileImage: args.mobileImage ? ((await rasterize(args.mobileImage)) ?? null) : null,
    title: textOf(args.title),
    body: textOf(args.lead ?? args.description ?? (article ? undefined : args.children)),
    image: args.image ? ((await rasterize(args.image.src)) ?? null) : null,
    alt: args.image?.alt ?? '',
    reverse: !!args.reverse,
    split:
      !article && !awards && (args.layout ?? 'split') === 'split' && args.variant !== 'listing',
    hero: name === 'LandingHero',
    tone: args.tone ?? (name === 'LandingSocialBanner' ? 'blue' : 'white'),
    stats: (args.items ?? [])
      .filter((item) => 'value' in item)
      .map(({ value, label, detail }) => ({
        value: textOf(value),
        label,
        detail: detail ?? '',
      })),
    crumbs: (args.breadcrumbs ?? []).map(({ label, href }) => ({
      label,
      href: href ? (safeHref(href) ?? '') : '',
    })),
    controls: [...controls, ...(args.links ?? []).map((link) => ({ ...link, disabled: false }))]
      .filter(({ label }) => label)
      .map(({ label, href, disabled }) => ({
        label,
        href: safeHref(href) ?? '',
        disabled: disabled || (!!href && safeHref(href) === undefined),
      })),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Control = { label: string; href: string; disabled: boolean };
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ media, onNavigate, onAction }: {
  media?: ReactNode; onNavigate?: (href: string) => void; onAction?: (label: string) => void;
} = {}) {
  const { width } = useWindowDimensions();
  const wide = config.split && width >= 720;
  const [status, setStatus] = useState('');
  async function activate({ label, href, disabled }: Control) {
    if (disabled) return;
    setStatus('');
    if (!href) {
      if (onAction) onAction(label);
      else setStatus(label);
    } else if (onNavigate) onNavigate(href);
    else if (/^(https?:|mailto:|tel:)/i.test(href)) {
      try { await Linking.openURL(href); }
      catch { setStatus('Nie udało się otworzyć odnośnika.'); }
    } else setStatus(href);
  }

  const uri = width < 768 ? config.mobileImage ?? config.image : config.image;
  const image = media ?? (uri ? <Image accessible={!!config.alt}
    accessibilityLabel={config.alt || undefined} source={{ uri }}
    resizeMode="contain" style={styles.image} /> : null);

  return (
    <View style={styles.section}>
      {config.crumbs.length ? <View style={styles.crumbs}>
        {(config.crumbs as { label: string; href: string }[]).map((item, index) =>
          item.href && index < config.crumbs.length - 1 ? (
            <Pressable key={index} accessibilityRole="link" style={styles.control}
              onPress={() => void activate({ ...item, disabled: false })}><Text style={styles.link}>{item.label}</Text></Pressable>
          ) : <Text key={index} style={styles.copy}>{item.label}</Text>
        )}
      </View> : null}
      <View style={[styles.layout, wide && styles.wide, wide && config.reverse && styles.reverse]}>
        <View style={styles.text}>
          {config.date ? <Text style={styles.copy}>{config.date}</Text> : null}
          <Text accessibilityRole="header" style={[styles.heading, config.hero && styles.hero]}>{config.title}</Text>
          {config.body ? <Text style={styles.copy}>{config.body}</Text> : null}
          {(config.stats as { value: string; label: string; detail: string }[]).map((item, index) => (
            <View key={index} style={styles.stat}>
              <Text style={styles.heading}>{item.value}</Text>
              <Text style={styles.copy}>{item.label}</Text>
              {item.detail ? <Text style={styles.copy}>{item.detail}</Text> : null}
            </View>
          ))}
          {(config.controls as Control[]).map((control, index) => (
            <Pressable key={index} accessibilityRole={control.href ? 'link' : 'button'}
              accessibilityState={{ disabled: control.disabled }} disabled={control.disabled}
              style={styles.control} onPress={() => void activate(control)}><Text style={styles.link}>{control.label}</Text></Pressable>
          ))}
          {status ? <Text accessibilityLiveRegion="polite" style={styles.copy}>{status}</Text> : null}
        </View>
        {image ? <View style={styles.media}>{image}</View> : null}
      </View>
      {(config.paragraphs as string[]).map((paragraph, index) => <Text key={index} style={styles.copy}>{paragraph}</Text>)}
      {config.article && config.entries.length ? <Text accessibilityRole="header" style={styles.heading}>Przeczytaj również</Text> : null}
      {(config.entries as { title: string; description: string; href: string; image: string | null; alt: string }[]).map((entry, index) => (
        <View key={index} style={styles.entry}>
          {entry.image ? <Image accessible={!!entry.alt} accessibilityLabel={entry.alt || undefined}
            source={{ uri: entry.image }} resizeMode="contain" style={styles.image} /> : null}
          {entry.href ? <Pressable accessibilityRole="link" style={styles.control}
            onPress={() => void activate({ label: entry.title, href: entry.href, disabled: false })}>
            <Text style={styles.link}>{entry.title}</Text>
          </Pressable> : <Text accessibilityRole="header" style={styles.heading}>{entry.title}</Text>}
          {entry.description ? <Text style={styles.copy}>{entry.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const dark = config.tone === 'dark';
const ink = dark ? '#fff' : '#161b22';
const styles = StyleSheet.create({
  section: { padding: 16, gap: 8, backgroundColor: dark ? '#162c4c' : config.tone === 'blue' ? '#edf3fc' : '#fff' },
  layout: { gap: 16 },
  wide: { flexDirection: 'row', alignItems: 'center' },
  reverse: { flexDirection: 'row-reverse' },
  text: { flex: 1, gap: 8 },
  media: { flex: 1 },
  image: { width: '100%', aspectRatio: 2 },
  heading: { color: ink, fontSize: isIOS ? 24 : 22, fontWeight: '700' },
  hero: { fontSize: isIOS ? 34 : 30 },
  copy: { color: ink, fontSize: 16 },
  crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  entry: { paddingVertical: 8, gap: 4 },
  stat: { gap: 2 },
  control: { minHeight: 44, justifyContent: 'center' },
  link: { color: dark ? '#fff' : '#0452a8', fontWeight: '600', textDecorationLine: 'underline' },
});
`;
}
