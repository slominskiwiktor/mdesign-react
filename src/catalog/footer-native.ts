import type { ReactNode } from 'react';
import { safeHref } from '../kit/mobile/shared.js';
import { portalDefaultAppLinks } from '../kit/portal/Shell.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Link = { label: string; href: string };
type Args = {
  groups?: { title: string; href?: string; links: Link[] }[];
  title?: string;
  appLinks?: Link[];
  appLabel?: string;
  legalLinks?: Link[];
  organizationLinks?: Link[];
  logos?: Link[];
  onCookieSettings?: () => void;
  copyright?: ReactNode;
  download?: ReactNode;
  brand?: ReactNode;
  onBrandClick?: () => void;
};

function safeLinks(links: Link[] = []) {
  return links.flatMap(({ label, href }) => {
    const url = safeHref(href);
    return url ? [{ label, href: url }] : [];
  });
}

export function footerNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const sitemap = name === 'LandingSitemap';
  const config = {
    sitemap,
    title: sitemap ? (args.title ?? 'Mapa strony') : '',
    groups: (args.groups ?? []).map(({ title, href, links }) => ({
      title,
      href: href ? safeHref(href) || null : null,
      links: safeLinks(links),
    })),
    stores: safeLinks(args.appLinks ?? (name === 'PortalFooter' ? portalDefaultAppLinks : [])),
    storeLabel: args.appLabel ?? 'Pobierz aplikację demo',
    legal: safeLinks(args.legalLinks),
    organizations: safeLinks([...(args.logos ?? []), ...(args.organizationLinks ?? [])]),
    copyright: textOf(args.copyright ?? (name === 'LandingFooter' ? '© mDesign demo' : '')),
    download: textOf(args.download),
    brand: textOf(args.brand),
    brandAction: !!args.onBrandClick,
    cookies: !!args.onCookieSettings,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Linking, Pressable, StyleSheet, Text, View } from 'react-native';

type Link = { label: string; href: string };
type Group = { title: string; href: string | null; links: Link[] };
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = { onNavigate?: (href: string) => void; onCookieSettings?: () => void; onBrandClick?: () => void; download?: ReactNode };

export default function Example({ onNavigate, onCookieSettings, onBrandClick, download }: Props = {}) {
  const [collapsed, setCollapsed] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');

  async function activate(href: string) {
    setFeedback('');
    if (onNavigate) onNavigate(href);
    else if (/^(https?:|mailto:|tel:)/i.test(href)) {
      try { await Linking.openURL(href); }
      catch { setFeedback('Nie udało się otworzyć odnośnika.'); }
    } else setFeedback(href);
  }

  function link({ label, href }: Link, index = 0) {
    return <Pressable key={index} accessibilityRole="link" accessibilityLabel={label}
      style={styles.action} onPress={() => void activate(href)}><Text style={styles.link}>{label}</Text></Pressable>;
  }

  return (
    <View style={styles.root}>
      {config.title ? <Text accessibilityRole="header" style={styles.title}>{config.title}</Text> : null}
      {download ?? (config.download ? <Text style={styles.copy}>{config.download}</Text> : null)}
      {(config.groups as Group[]).map((group, index) => {
        const open = !collapsed.includes(index);
        return (
          <View key={index} style={styles.group}>
            {config.sitemap ? (
              <Pressable accessibilityRole="button" accessibilityLabel={group.title} accessibilityState={{ expanded: open }}
                style={styles.action} onPress={() => setCollapsed((previous) =>
                  open ? [...previous, index] : previous.filter((key) => key !== index))}>
                <Text style={styles.heading}>{group.title}</Text>
              </Pressable>
            ) : group.href ? link({ label: group.title, href: group.href })
              : <Text accessibilityRole="header" style={styles.heading}>{group.title}</Text>}
            {open && config.sitemap && group.href ? link({ label: 'Pokaż wszystko', href: group.href }, -1) : null}
            {open ? group.links.map(link) : null}
          </View>
        );
      })}
      {config.stores.length ? <Text accessibilityRole="header" style={styles.heading}>{config.storeLabel}</Text> : null}
      {(config.stores as Link[]).map(link)}
      {(config.legal as Link[]).map(link)}
      {config.cookies || onCookieSettings ? (
        <Pressable accessibilityRole="button" style={styles.action} onPress={() => {
          if (onCookieSettings) onCookieSettings();
          else setFeedback('Ustawienia cookies');
        }}><Text style={styles.link}>Ustawienia cookies</Text></Pressable>
      ) : null}
      {(config.organizations as Link[]).map(link)}
      {config.brand ? (
        config.brandAction || onBrandClick
          ? <Pressable accessibilityRole="button" style={styles.action} onPress={() => onBrandClick ? onBrandClick() : setFeedback(config.brand)}>
              <Text style={styles.link}>{config.brand}</Text>
            </Pressable>
          : <Text style={styles.heading}>{config.brand}</Text>
      ) : null}
      {config.copyright ? <Text style={styles.copy}>{config.copyright}</Text> : null}
      {feedback ? <Text accessibilityLiveRegion="polite" style={styles.copy}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8, backgroundColor: config.sitemap ? '#fff' : '#f5f6f8' },
  group: { borderBottomWidth: 1, borderColor: '#d6d9df', paddingBottom: 8 },
  title: { fontSize: isIOS ? 34 : 28, fontWeight: '700', color: '#161b22' },
  heading: { fontSize: 17, fontWeight: '600', color: '#161b22' },
  action: { minHeight: 44, justifyContent: 'center' },
  link: { fontSize: isIOS ? 15 : 16, fontWeight: '600', color: isIOS ? '#165ef8' : '#0452a8' },
  copy: { fontSize: 13, color: '#52575f' },
});
`;
}
