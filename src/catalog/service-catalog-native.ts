import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { safeHref } from '../kit/mobile/shared.js';
import type { PortalCatalogItem } from '../kit/portal/Shell.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  items: PortalCatalogItem[];
  heading?: ReactNode;
  description?: ReactNode;
  information?: ReactNode;
};

function control(node: ReactNode) {
  const props = isValidElement<{ href?: string; disabled?: boolean; 'aria-label'?: string }>(node)
    ? node.props
    : undefined;
  const href = props?.href ? safeHref(props.href) : undefined;
  return {
    label: props?.['aria-label'] ?? textOf(node),
    href: href || null,
    disabled: !!props?.disabled || (!!props?.href && href === undefined),
  };
}

export function serviceCatalogNativeSource(args: Args, platform: NativePlatformChoice) {
  const config = {
    heading: textOf(args.heading),
    description: textOf(args.description),
    information: textOf(args.information),
    items: args.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: textOf(item.description),
      action: control(item.action),
      more: control(item.more),
    })),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};
type Control = { label: string; href: string | null; disabled: boolean };
type Props = {
  onAction?: (id: string, kind: 'action' | 'more') => void;
  onNavigate?: (href: string) => void;
};

export default function Example({ onAction, onNavigate }: Props = {}) {
  const [feedback, setFeedback] = useState('');
  async function activate(id: string, kind: 'action' | 'more', control: Control) {
    if (control.disabled) return;
    setFeedback('');
    if (control.href) {
      if (onNavigate) onNavigate(control.href);
      else if (/^(https?:|mailto:|tel:)/i.test(control.href)) {
        try { await Linking.openURL(control.href); }
        catch { setFeedback('Nie udało się otworzyć odnośnika.'); }
      } else setFeedback(control.href);
    } else if (onAction) onAction(id, kind);
    else setFeedback(control.label);
  }

  return (
    <ScrollView contentContainerStyle={styles.catalog}>
      {config.heading ? <Text accessibilityRole="header" style={styles.heading}>{config.heading}</Text> : null}
      {config.description ? <Text style={styles.copy}>{config.description}</Text> : null}
      {config.information ? <Text style={[styles.copy, styles.information]}>{config.information}</Text> : null}
      {config.items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.copy}>{item.description}</Text> : null}
          {(['more', 'action'] as const).map((kind) => {
            const entry: Control = item[kind];
            return entry.label ? <Pressable key={kind} accessibilityRole={entry.href ? 'link' : 'button'}
              accessibilityLabel={entry.label + ', ' + item.title}
              accessibilityState={{ disabled: entry.disabled }} disabled={entry.disabled}
              style={[styles.control, kind === 'action' && styles.outline, entry.disabled && styles.disabled]}
              onPress={() => void activate(item.id, kind, entry)}>
              <Text style={[styles.link, kind === 'more' && styles.inline]}>{entry.label}</Text>
            </Pressable> : null;
          })}
        </View>
      ))}
      {feedback ? <Text accessibilityLiveRegion="polite" style={styles.copy}>{feedback}</Text> : null}
    </ScrollView>
  );
}

const blue = isIOS ? '#165ef8' : '#0452a8';
const styles = StyleSheet.create({
  catalog: { padding: 16, gap: 12 },
  heading: { color: '#161b22', fontSize: isIOS ? 34 : 28, fontWeight: '700' },
  title: { color: '#161b22', fontSize: isIOS ? 17 : 18, fontWeight: '600' },
  copy: { color: '#52575f', fontSize: 15 },
  information: { padding: 12, backgroundColor: '#e8f2ff', borderRadius: 8 },
  card: { padding: 16, gap: 8, borderRadius: isIOS ? 16 : 12, borderWidth: 1,
    borderColor: '#d6d9df', backgroundColor: '#fff' },
  control: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  outline: { borderWidth: 1, borderColor: blue, borderRadius: isIOS ? 22 : 8, paddingHorizontal: 16 },
  link: { color: blue, fontWeight: '600' },
  inline: { textDecorationLine: 'underline' },
  disabled: { opacity: 0.5 },
});
`;
}
