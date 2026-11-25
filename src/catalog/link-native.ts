import type { ReactNode } from 'react';
import { safeHref } from '../kit/mobile/shared.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type LinkExample = {
  id?: string;
  href?: string;
  label?: string;
  disabled?: boolean;
};
type LinkArgs = LinkExample & {
  children?: ReactNode;
  items?: LinkExample[];
  showIcon?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
  'aria-label'?: string;
};

export function linkNativeSource(name: string, args: LinkArgs, platform: NativePlatformChoice) {
  const list = name === 'PortalServiceLinks';
  const config = {
    list,
    groupLabel: list ? (args.label ?? 'Usługi') : '',
    variant: args.variant ?? 'link',
    items: (list
      ? (args.items ?? [])
      : [
          {
            ...args,
            label: textOf(args.children) || args['aria-label'] || 'Otwórz odnośnik',
          },
        ]
    ).map((item, index) => {
      const href = item.href ? safeHref(item.href) || null : null;
      return {
        id: item.id ?? String(index),
        label: item.label ?? '',
        href,
        disabled: !!item.disabled || (!!item.href && !href),
        external: !!href && /^(https?:|mailto:|tel:)/i.test(href),
      };
    }),
    showIcon: name === 'PortalExternalLink' && (args.showIcon ?? true),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Linking, Pressable, StyleSheet, Text, View } from 'react-native';

type Item = { id: string; label: string; href: string | null; disabled: boolean; external: boolean };
const config: {
  list: boolean; groupLabel: string; variant: 'primary' | 'secondary' | 'link'; items: Item[]; showIcon: boolean;
} = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({
  onNavigate,
  onAction,
}: { onNavigate?: (href: string) => void; onAction?: (id: string) => void }) {
  const [destination, setDestination] = useState<Item | null>(null);
  const [error, setError] = useState('');

  async function activate(item: Item) {
    if (item.disabled) return;
    setError('');
    if (item.external && item.href) {
      try {
        await Linking.openURL(item.href);
      } catch {
        setError('Nie udało się otworzyć odnośnika.');
      }
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    } else if (!item.href && onAction) {
      onAction(item.id);
    } else {
      setDestination(item);
    }
  }

  if (destination) {
    return (
      <View style={styles.panel}>
        <Pressable accessibilityRole="button" onPress={() => setDestination(null)} style={styles.item}>
          <Text style={styles.text}>Wróć</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.heading}>{destination.label}</Text>
        {destination.href ? <Text>{destination.href}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      {config.list ? <Text accessibilityRole="header" style={styles.heading}>{config.groupLabel}</Text> : null}
      {config.items.map((item) => (
        <Pressable key={item.id} accessibilityRole={item.href ? 'link' : 'button'}
          accessibilityLabel={item.label} accessibilityState={{ disabled: item.disabled }}
          disabled={item.disabled} onPress={() => void activate(item)}
          style={[styles.item, config.list && styles.row, config.variant === 'primary' && !item.disabled && styles.primary,
            config.variant === 'secondary' && styles.secondary]}>
          <Text style={[styles.text, config.variant === 'link' && !config.list && styles.inline,
            config.variant === 'primary' && styles.primaryText, item.disabled && styles.disabled]}>
            {item.label}
          </Text>
          {config.list || config.showIcon ? (
            <Text accessible={false} style={[styles.text, item.disabled && styles.disabled]}>
              {config.list ? '›' : '↗'}
            </Text>
          ) : null}
        </Pressable>
      ))}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const blue = isIOS ? '#165ef8' : '#0452a8';
const styles = StyleSheet.create({
  panel: { padding: 16, gap: 8 },
  heading: { color: '#161b22', fontSize: 18, fontWeight: '700' },
  item: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  row: { justifyContent: 'space-between', backgroundColor: '#f5f7fa', borderRadius: 8 },
  text: { color: blue, fontSize: isIOS ? 13 : 16, fontWeight: '600', flexShrink: 1 },
  inline: { textDecorationLine: 'underline' },
  primary: { backgroundColor: blue, borderRadius: 8 },
  primaryText: { color: '#fff' },
  secondary: { borderWidth: 1, borderColor: blue, borderRadius: 8 },
  disabled: { color: '#626872' },
  error: { color: '#b31225' },
});
`;
}
