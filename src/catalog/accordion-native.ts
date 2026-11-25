import type { AccordionProps } from '../kit/components.js';
import type { LandingFAQProps } from '../kit/landing/content.js';
import type { NativePlatformChoice } from './native-export.js';

import { textOf } from './native-example-text.js';

export function accordionNativeSource(
  example: AccordionProps | LandingFAQProps,
  isFaq: boolean,
  platform: NativePlatformChoice,
) {
  const faq = isFaq ? (example as LandingFAQProps) : undefined;
  const accordion = isFaq ? undefined : (example as AccordionProps);
  const sections =
    faq?.items.map(({ id, question, answer, category, searchText }) => ({
      id,
      title: question,
      content: textOf(answer),
      searchText: searchText ?? textOf(answer),
      category: category ?? '',
      disabled: false,
      open: undefined,
      defaultOpen: false,
    })) ??
    accordion!.items.map((item, index) => ({
      id: item.id ?? String(index),
      title: textOf(item.title),
      content: textOf(item.content),
      searchText: '',
      category: '',
      disabled: item.disabled ?? false,
      open: item.open,
      defaultOpen: item.defaultOpen ?? item.open ?? false,
    }));
  const expanded = example.expanded ?? example.defaultExpanded;
  const config = {
    title: faq ? textOf(faq.title) || 'Pytania i odpowiedzi' : '',
    searchable: faq?.searchable ?? false,
    query: faq?.query ?? '',
    emptyMessage: faq?.emptyMessage ?? 'Nie znaleziono pytań.',
    multiple: accordion?.multiple ?? true,
    sections: sections.map(({ defaultOpen, open, ...section }) => ({
      ...section,
      expanded: open ?? (expanded ? expanded.includes(section.id) : defaultOpen),
    })),
  };

  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const ios = ${ios};

export default function AccordionExample({ renderContent, onExpandedChange }: {
  renderContent?: (id: string) => ReactNode;
  onExpandedChange?: (values: string[]) => void;
} = {}) {
  const [expanded, setExpanded] = useState(() => config.sections.filter((section) => section.expanded)
    .map((section) => section.id));
  const [query, setQuery] = useState(config.query);
  const term = query.trim().toLocaleLowerCase('pl-PL');
  const results = config.sections.filter(
    (section) => !config.searchable || (section.title + ' ' + section.searchText)
      .toLocaleLowerCase('pl-PL').includes(term),
  );

  function toggle(id: string) {
    const next = expanded.includes(id) ? expanded.filter((value) => value !== id)
      : config.multiple ? [...expanded, id] : [id];
    setExpanded(next);
    onExpandedChange?.(next);
  }

  return (
    <View style={styles.group}>
      {!!config.title && <Text accessibilityRole="header" style={styles.heading}>{config.title}</Text>}
      {config.searchable && <TextInput accessibilityLabel="Wyszukiwarka pytań i odpowiedzi"
        placeholder="Szukaj" value={query} onChangeText={setQuery} style={styles.input} />}
      {results.length === 0 && <Text style={styles.body}>{config.emptyMessage}</Text>}
      {results.map((section, index) => {
        const open = expanded.includes(section.id);
        return (
          <Fragment key={section.id}>
            {!!section.category && section.category !== results[index - 1]?.category &&
              <Text accessibilityRole="header" style={styles.heading}>{section.category}</Text>}
            <View style={styles.section}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: open, disabled: section.disabled }}
                disabled={section.disabled} onPress={() => toggle(section.id)}
                style={[styles.trigger, section.disabled && styles.disabled]}>
                <Text style={styles.title}>{section.title}</Text>
                <Text accessible={false} importantForAccessibility="no" style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
              </Pressable>
              {open && <View style={styles.content}>
                {renderContent ? renderContent(section.id) : <Text style={styles.body}>{section.content}</Text>}
              </View>}
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: ios ? 16 : 8 },
  section: { backgroundColor: '#fff', borderRadius: ios ? 0 : 12 },
  trigger: { minHeight: ios ? 44 : 48, paddingHorizontal: ios ? 0 : 16, gap: 8,
    flexDirection: 'row', alignItems: 'center' },
  heading: { fontWeight: '600', fontSize: 20, color: '#101317' },
  title: { flex: 1, fontWeight: '600', fontSize: ios ? 17 : 16, color: '#101317' },
  chevron: { fontSize: 24, color: '#52575f' },
  content: { paddingHorizontal: ios ? 0 : 16, paddingTop: ios ? 16 : 8, paddingBottom: 16 },
  body: { fontSize: 16, color: '#101317' },
  input: { minHeight: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#e7eaed', color: '#101317' },
  disabled: { opacity: 0.5 },
});
`;
}
