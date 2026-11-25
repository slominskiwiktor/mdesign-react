import type { LandingUtilityBarProps } from '../kit/landing/navigation.js';
import { safeHref } from '../kit/mobile/shared.js';
import type { NativePlatformChoice } from './native-export.js';

export function utilityBarNativeSource(
  args: LandingUtilityBarProps,
  platform: NativePlatformChoice,
) {
  const links = [
    {
      label: 'Migowy',
      href: args.signLanguageHref ?? 'https://tlumacz.migam.org/mobywatel_govpl',
      accessibilityLabel: 'Pomoc tłumacza polskiego języka migowego',
    },
    ...(args.links ?? []),
  ].flatMap((link) => {
    const href = safeHref(link.href);
    return href
      ? [
          {
            label: link.label,
            href,
            accessibilityLabel: 'accessibilityLabel' in link ? link.accessibilityLabel : link.label,
          },
        ]
      : [];
  });
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useEffect, useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}AccessibilityInfo, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

const links = ${JSON.stringify(links, null, 2)};
const preset: boolean | null = ${JSON.stringify(args.animationsDisabled ?? null)};
const isIOS = ${ios};

type Props = {
  animationsDisabled?: boolean;
  onAnimationsDisabledChange?: (disabled: boolean) => void;
  onNavigate?: (href: string) => void;
};

export default function Example({ animationsDisabled, onAnimationsDisabledChange, onNavigate }: Props = {}) {
  const [systemReduced, setSystemReduced] = useState(true);
  const [override, setOverride] = useState<boolean | null>(preset);
  const [feedback, setFeedback] = useState('');
  const disabled = animationsDisabled ?? override ?? systemReduced;

  useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
      changed = true;
      if (active) setSystemReduced(reduced);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (active && !changed) setSystemReduced(reduced);
    }, () => {});
    return () => { active = false; subscription.remove(); };
  }, []);

  async function open(href: string) {
    setFeedback('');
    if (onNavigate) onNavigate(href);
    else if (/^(https?:|mailto:|tel:)/i.test(href)) {
      try { await Linking.openURL(href); }
      catch { setFeedback('Nie udało się otworzyć odnośnika.'); }
    } else setFeedback(href);
  }

  return (
    <View style={styles.bar}>
      <View style={styles.preference}>
        <Text style={styles.label}>{disabled ? 'Włącz animacje' : 'Wyłącz animacje'}</Text>
        <Switch value={disabled} accessibilityLabel="Wyłącz animacje" trackColor={{ true: isIOS ? '#165ef8' : '#0452a8' }}
          onValueChange={(next) => {
            if (animationsDisabled === undefined) setOverride(next);
            onAnimationsDisabledChange?.(next);
          }} />
      </View>
      {links.map(({ label, href, accessibilityLabel }, index) => (
        <Pressable key={index} accessibilityRole="link" accessibilityLabel={accessibilityLabel}
          style={styles.link} onPress={() => void open(href)}>
          <Text style={styles.linkText}>{label}</Text>
        </Pressable>
      ))}
      {feedback ? <Text accessibilityLiveRegion="polite" style={styles.label}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingHorizontal: 16,
    backgroundColor: isIOS ? '#f5f6f8' : '#edf3fc' },
  preference: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 8 },
  label: { fontSize: 13, color: '#161b22' },
  link: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  linkText: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600', textDecorationLine: 'underline' },
});
`;
}
