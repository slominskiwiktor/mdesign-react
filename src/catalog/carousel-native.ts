import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import { rasterize } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';

type SlideContent = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  illustration?: ReactNode;
};
type CarouselExample = {
  title?: ReactNode;
  description?: ReactNode;
  label?: string;
  pages?: Array<
    SlideContent & {
      content?: ReactNode;
      buttonLabel?: string;
      hideButton?: boolean;
      onAction?: () => void;
    }
  >;
  items?: Array<{ id: string; title: string; href: string; image: string }>;
  value?: number;
  defaultValue?: number;
  page?: number;
  defaultPage?: number;
  count?: number;
  onPageChange?: (page: number) => void;
  nextLabel?: string;
  finishLabel?: string;
};

async function imageSource(source?: string) {
  if (!source || typeof document === 'undefined') return '';
  let url: URL;
  try {
    url = new URL(source, document.baseURI);
  } catch {
    return '';
  }
  if (!['http:', 'https:', 'data:', 'blob:'].includes(url.protocol)) return '';
  if (
    ['data:', 'blob:'].includes(url.protocol) ||
    url.origin === document.location.origin ||
    /\.svg$/i.test(url.pathname)
  ) {
    return (await rasterize(url.href)) ?? '';
  }
  return url.href;
}

export async function carouselNativeSource(
  name: string,
  args: CarouselExample,
  platform: NativePlatformChoice,
) {
  const indicator = name === 'PageIndicator';
  const documents = name === 'LandingDocumentCarousel';
  const slides = documents
    ? await Promise.all(
        (args.items ?? []).map(async (item) => ({
          id: item.id,
          title: item.title,
          body: '',
          href: item.href,
          image: await imageSource(item.image),
          buttonLabel: '',
          hidden: false,
          action: false,
        })),
      )
    : await Promise.all(
        (args.pages ?? []).map(async (page, index) => {
          const content = isValidElement<SlideContent>(page.content) ? page.content.props : page;
          const illustration = isValidElement<{ src?: string }>(content.illustration)
            ? content.illustration.props.src
            : undefined;
          return {
            id: String(index),
            title: textOf(content.title),
            body: [textOf(content.description), textOf(content.children ?? page.content)]
              .filter(Boolean)
              .join('\n'),
            image: await imageSource(illustration),
            href: '',
            buttonLabel: page.buttonLabel ?? '',
            hidden: !!page.hideButton,
            action: !!page.onAction,
          };
        }),
      );
  const count = indicator ? (args.count ?? 0) : slides.length;
  const initial = args.page ?? args.defaultPage ?? args.value ?? args.defaultValue ?? 0;
  const config = {
    count: Number.isFinite(count)
      ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(count)))
      : 0,
    initial: Number.isFinite(initial) ? Math.max(0, Math.floor(initial)) : 0,
    label:
      args.label ??
      (name === 'Onboarding' ? 'Wprowadzenie' : indicator ? 'Strony' : 'Dokumenty w aplikacji'),
    title: textOf(args.title),
    description: textOf(args.description),
    nextLabel: args.nextLabel ?? 'Dalej',
    finishLabel: args.finishLabel ?? 'Zakończ',
    indicator,
    interactive: !indicator || typeof args.onPageChange === 'function',
    documents,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { Fragment, useEffect, useRef, useState } from 'react';
import type { ComponentRef, ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const slides: { id: string; title: string; body: string; href: string; image: string;
  buttonLabel: string; hidden: boolean; action: boolean }[] = ${JSON.stringify(slides, null, 2)};
const ios = ${ios};

function bounded(index: number) { return Math.max(0, Math.min(config.count - 1, index)); }

export default function CarouselExample({ onPageChange, onFinish, onAction, onDocumentPress, renderPage }: {
  onPageChange?: (index: number) => void;
  onFinish?: () => void;
  onAction?: (index: number) => void;
  onDocumentPress?: (id: string, href: string) => void;
  renderPage?: (index: number) => ReactNode;
} = {}) {
  const [page, setPage] = useState(() => bounded(config.initial));
  const [width, setWidth] = useState(0);
  const current = useRef(page);
  const viewport = useRef<ComponentRef<typeof ScrollView>>(null);
  const pending = useRef<number | null>(null);
  const slide = slides[page];
  const last = config.count - 1;

  useEffect(() => {
    if (width) viewport.current?.scrollTo({ x: current.current * width, animated: false });
  }, [width]);

  function move(index: number, scroll = true) {
    const next = bounded(index);
    if (next === current.current) return;
    current.current = next;
    setPage(next);
    onPageChange?.(next);
    if (scroll && width) {
      pending.current = next;
      viewport.current?.scrollTo({ x: next * width, animated: true });
    }
  }

  const start = Math.max(1, Math.min(page - 1, config.count - 4));
  const indicators = config.count <= 7
    ? Array.from({ length: config.count }, (_, index) => index)
    : [0, start, start + 1, start + 2, last];
  const dots = (
    <View style={styles.dots} accessibilityLabel={config.indicator ? config.label : 'Strony'}>
      {indicators.map((index, position) => {
        const active = index === page;
        const text = 'Strona ' + (index + 1) + ' z ' + config.count;
        const dot = <View style={[styles.dot, active && styles.active]} />;
        return <Fragment key={index}>
          {position > 0 && index - indicators[position - 1] > 1 && <Text accessible={false} style={styles.muted}>…</Text>}
          {config.interactive ? <Pressable accessibilityRole="button" accessibilityLabel={text}
            accessibilityState={{ selected: active }} onPress={() => move(index)} style={styles.dotArea}>{dot}</Pressable>
            : <View accessible accessibilityLabel={text} accessibilityState={{ selected: active }} style={styles.dotArea}>{dot}</View>}
        </Fragment>;
      })}
    </View>
  );

  if (config.indicator || !slide) return dots;
  return (
    <View style={styles.root} accessibilityLabel={config.label}>
      {!!config.title && <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>}
      {!!config.description && <Text style={styles.body}>{config.description}</Text>}
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && <ScrollView ref={viewport} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => { pending.current = null; }}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            if (pending.current !== null) {
              if (pending.current === index) pending.current = null;
              return;
            }
            move(index, false);
          }}>
          {slides.map((item, index) => {
            const content = renderPage ? renderPage(index) : <>
              {!!item.image && <Image source={{ uri: item.image }} resizeMode="contain" style={styles.image} />}
              {!!item.title && <Text style={styles.title}>{item.title}</Text>}
              {!!item.body && <Text style={styles.body}>{item.body}</Text>}
            </>;
            return <View key={item.id} style={{ width }}
              importantForAccessibility={index === page ? 'auto' : 'no-hide-descendants'}
              accessibilityElementsHidden={index !== page}>
              {config.documents && !renderPage
                ? <Pressable accessibilityRole="link" accessibilityLabel={item.title} disabled={!onDocumentPress}
                  onPress={() => onDocumentPress?.(item.id, item.href)} style={styles.slide}>{content}</Pressable>
                : <View style={styles.slide}>{content}</View>}
            </View>;
          })}
        </ScrollView>}
      </View>
      {dots}
      {config.documents ? <View style={styles.navigation}>
        <Pressable accessibilityRole="button" accessibilityLabel="Poprzedni dokument" disabled={page === 0}
          style={styles.button} onPress={() => move(page - 1)}><Text style={styles.link}>‹</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Następny dokument" disabled={page === last}
          style={styles.button} onPress={() => move(page + 1)}><Text style={styles.link}>›</Text></Pressable>
      </View> : !slide.hidden && <Pressable accessibilityRole="button" style={styles.button}
        onPress={() => { if (slide.action) onAction?.(page); else if (page < last) move(page + 1); else onFinish?.(); }}>
        <Text style={styles.link}>{slide.buttonLabel || (page === last ? config.finishLabel : config.nextLabel)}</Text>
      </Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  slide: { padding: 16, gap: 8, backgroundColor: '#fff', borderRadius: ios ? 16 : 12 },
  title: { fontSize: ios ? 20 : 22, fontWeight: '600', color: '#101317' },
  body: { fontSize: 16, color: '#101317' },
  muted: { color: '#52575f' },
  image: { width: '100%', height: 180 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dotArea: { minWidth: ios ? 30 : 24, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: ios ? 6 : 8, height: ios ? 6 : 8, borderRadius: 4, backgroundColor: '#a4aab2' },
  active: { backgroundColor: '#0452a8' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  link: { color: '#0452a8', fontWeight: '600', fontSize: 16 },
});
`;
}
