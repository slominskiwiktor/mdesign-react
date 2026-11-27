import type { LandingCatalogListingProps, LandingNewsListProps } from '../kit/landing/content.js';
import { safeHref } from '../kit/mobile/shared.js';
import { rasterize } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

type Args = Partial<LandingCatalogListingProps & Omit<LandingNewsListProps, 'title' | 'items'>> & {
  items: LandingCatalogListingProps['items'] | LandingNewsListProps['items'];
};

export async function landingListNativeSource(
  name: string,
  args: Args,
  platform: NativePlatformChoice,
) {
  const news = name === 'LandingNewsList';
  const items = await Promise.all(
    args.items.map(async (item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      category: item.category ?? '',
      href: safeHref(item.href) ?? '',
      isNew: !!item.isNew,
      date:
        'date' in item && typeof item.date === 'string' && args.showDates !== false
          ? item.date
          : '',
      image: item.image ? ((await rasterize(item.image.src)) ?? null) : null,
      alt: news ? (item.image?.alt ?? '') : '',
    })),
  );
  const config = {
    news,
    title: textOf(args.title) || (news ? 'Aktualności' : 'Usługi'),
    description: textOf(args.description),
    query: args.query ?? '',
    category: args.category ?? '',
    grouped: !news && !!args.groupByCategory,
    featured: news && !!args.featured,
    filters: !news || args.showFilters !== false,
    more: news && !!(args.hasMore && args.onLoadMore),
    loading: !!args.loading,
    empty:
      args.emptyMessage ??
      (news ? 'Brak aktualności w tej kategorii.' : 'Brak wyników. Spróbuj użyć innej nazwy.'),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Item = { id: string; title: string; description: string; category: string; href: string;
  isNew: boolean; date: string; image: string | null; alt: string };
const sample: Item[] = ${JSON.stringify(items)};
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({ items = sample, query, category, loading = config.loading, hasMore = config.more,
  onQueryChange, onCategoryChange, onNavigate, onLoadMore }: {
  items?: Item[]; query?: string; category?: string; loading?: boolean; hasMore?: boolean;
  onQueryChange?: (query: string) => void; onCategoryChange?: (category: string) => void;
  onNavigate?: (href: string) => void; onLoadMore?: () => void;
} = {}) {
  const [localQuery, setQuery] = useState(config.query);
  const [localCategory, setCategory] = useState(config.category);
  const [status, setStatus] = useState('');
  const text = query ?? localQuery;
  const selected = category ?? localCategory;
  const options = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const shown = items.filter((item) => (!selected || item.category === selected)
    && (config.news || (item.title + ' ' + item.description).toLocaleLowerCase('pl').includes(text.trim().toLocaleLowerCase('pl'))));
  const groups = config.grouped ? [...new Set(shown.map((item) => item.category || 'Pozostałe'))] : [''];

  function open(href: string) {
    if (onNavigate) onNavigate(href);
    else if (/^(https?:|mailto:|tel:)/i.test(href)) {
      void Linking.openURL(href).catch(() => setStatus('Nie udało się otworzyć odnośnika.'));
    } else setStatus(href);
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
      <Text accessibilityRole="header" style={styles.title}>{config.title}</Text>
      {config.description ? <Text>{config.description}</Text> : null}
      {!config.news ? <TextInput accessibilityLabel={'Wyszukiwarka: ' + config.title}
        style={styles.search} placeholder="Szukaj" value={text} onChangeText={(next) => {
          if (query === undefined) setQuery(next);
          onQueryChange?.(next);
        }} /> : null}
      {config.filters && options.length > (config.news ? 0 : 1) ? (
        <View accessibilityRole="radiogroup" accessibilityLabel="Kategoria" style={styles.filters}>
          {['', ...options].map((option) => (
            <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: selected === option }}
              style={[styles.control, selected === option && styles.active]} onPress={() => {
                if (category === undefined) setCategory(option);
                onCategoryChange?.(option);
              }}><Text>{option || 'Wszystkie'}</Text></Pressable>
          ))}
        </View>
      ) : null}
      {!config.news ? <Text accessibilityLiveRegion="polite">Liczba wyników: {shown.length}</Text> : null}
      {groups.map((group) => <View key={group} style={styles.group}>
        {group ? <Text accessibilityRole="header" style={styles.heading}>{group}</Text> : null}
        {shown.filter((item) => !config.grouped || (item.category || 'Pozostałe') === group).map((item, index) => (
          <View key={item.id} style={styles.card}>
            {item.image ? <Image accessible={!!item.alt} accessibilityLabel={item.alt || undefined}
              source={{ uri: item.image }} resizeMode="cover" style={styles.image} /> : null}
            {item.date ? <Text>{item.date}</Text> : null}
            {!config.news && item.isNew ? <Text>Nowość</Text> : null}
            <Text accessibilityRole="header" style={config.featured && index === 0 ? styles.title : styles.heading}>{item.title}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
            {item.href ? <Pressable accessibilityRole="link" accessibilityLabel={'Czytaj więcej: ' + item.title}
              style={styles.control} onPress={() => open(item.href)}><Text style={styles.link}>Czytaj więcej</Text></Pressable> : null}
          </View>
        ))}
      </View>)}
      {!shown.length && !loading ? <Text accessibilityLiveRegion="polite">{config.empty}</Text> : null}
      {loading ? <ActivityIndicator accessibilityLabel="Wczytywanie aktualności" /> : null}
      {hasMore && onLoadMore ? <Pressable accessibilityRole="button" disabled={loading}
        style={styles.control} onPress={onLoadMore}><Text>Pokaż więcej aktualności</Text></Pressable> : null}
      {status ? <Text accessibilityLiveRegion="polite">{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  title: { color: '#161b22', fontSize: isIOS ? 28 : 25, fontWeight: '700' },
  heading: { color: '#161b22', fontSize: 18, fontWeight: '600' },
  search: { minHeight: 48, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#767c84' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  control: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  active: { backgroundColor: '#e8f2ff', borderRadius: 8 },
  group: { gap: 12 },
  card: { padding: 12, gap: 8, borderWidth: 1, borderColor: '#d6d9df', borderRadius: isIOS ? 16 : 12, backgroundColor: '#fff' },
  image: { width: '100%', aspectRatio: 2, borderRadius: 8 },
  link: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600' },
});
`;
}
