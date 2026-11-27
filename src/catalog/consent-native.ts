import { defaultLandingCookieCategories } from '../kit/landing/cookie-data.js';
import type { LandingCookieConsentProps } from '../kit/landing/overlays.js';
import type { NativePlatformChoice } from './native-export.js';
import { textOf } from './native-example-text.js';

export function consentNativeSource(
  args: LandingCookieConsentProps,
  platform: NativePlatformChoice,
) {
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

const isIOS = ${ios};
type Category = {
  id: 'necessary' | 'preferences' | 'statistics' | 'marketing' | 'unclassified';
  label: string; description: string;
  providers: { name: string; privacyHref?: string; note?: string;
    cookies: { name: string; description: string; retention: string; type: string }[] }[];
};
const categories: Category[] = ${JSON.stringify(args.categories ?? defaultLandingCookieCategories, null, 2)};
const initial = { preferences: false, statistics: false, marketing: false };
type Choices = typeof initial;
type Consent = Choices & { necessary: true; updatedAt: string };

export default function Example({ value, open, onOpenChange, onConsentChange, onOpenPolicy }: {
  value?: Consent; open?: boolean; onOpenChange?: (open: boolean) => void;
  onConsentChange?: (value: Consent) => void; onOpenPolicy?: (href: string) => void;
} = {}) {
  const [local, setLocal] = useState<Consent | undefined>();
  const [shown, setShown] = useState<boolean | undefined>(${args.open ?? 'undefined'});
  const [settings, setSettings] = useState(${args.defaultTab === 'details'});
  const [draft, setDraft] = useState<Choices>(value ?? initial);

  const [expanded, setExpanded] = useState<Category['id'] | null>(null);

  function save(choices: Choices) {
    const consent: Consent = { ...choices, necessary: true, updatedAt: new Date().toISOString() };
    setLocal(consent);
    setShown(false);
    onConsentChange?.(consent);
    onOpenChange?.(false);
  }

  return (
    <View>
      <Action label="Ustawienia prywatności" run={() => {
        setDraft(value ?? local ?? initial);
        setExpanded(null);
        setSettings(${args.defaultTab === 'details'});
        setShown(true);
        onOpenChange?.(true);
      }} />
      <Modal visible={open ?? shown ?? !value} transparent animationType={isIOS ? 'slide' : 'fade'} onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={styles.panel}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text accessibilityRole="header" style={styles.heading}>{${JSON.stringify(args.title ?? 'Dbamy o Twoją prywatność')}}</Text>
              <Text>{${JSON.stringify(textOf(args.description) || 'Wybierz, na jakie opcjonalne pliki cookies wyrażasz zgodę.')}}</Text>
              {onOpenPolicy ? <Action label="Polityka prywatności" run={() => onOpenPolicy(${JSON.stringify(args.policyHref ?? '#privacy')})} /> : null}
              {settings ? (
                <>
                  {categories.map(({ id, label, description, providers }) => {
                    const optional = id !== 'necessary' && id !== 'unclassified';
                    const disclosureOpen = expanded === id;
                    return (
                      <View key={id} style={styles.category}>
                        <View style={styles.row}>
                          <Pressable accessibilityRole="button" accessibilityState={{ expanded: disclosureOpen }}
                            style={styles.action} onPress={() => setExpanded(disclosureOpen ? null : id)}>
                            <Text style={styles.actionText}>{label}</Text>
                          </Pressable>
                          {optional ? <Switch accessibilityLabel={label} value={draft[id]}
                            onValueChange={(checked) => setDraft((previous) => ({ ...previous, [id]: checked }))} />
                            : id === 'necessary' ? <Text>Zawsze aktywne</Text> : null}
                        </View>
                        {disclosureOpen ? <>
                          <Text>{description}</Text>
                          {providers.map((provider, index) => (
                            <View key={index} style={styles.category}>
                              <Text accessibilityRole="header">{provider.name}</Text>
                              {provider.privacyHref && onOpenPolicy ? (
                                <Pressable accessibilityRole="link" style={styles.action}
                                  onPress={() => onOpenPolicy(provider.privacyHref!)}>
                                  <Text style={styles.actionText}>Polityka prywatności dostawcy</Text>
                                </Pressable>
                              ) : null}
                              {provider.note ? <Text>{provider.note}</Text> : null}
                              {provider.cookies.map((cookie, offset) => (
                                <Text key={offset}>{[cookie.name, cookie.description, cookie.retention, cookie.type].join(' · ')}</Text>
                              ))}
                            </View>
                          ))}
                        </> : null}
                      </View>
                    );
                  })}
                  <Action label="Zapisz ustawienia" run={() => save(draft)} />
                </>
              ) : <Action label="Dostosuj ustawienia" run={() => setSettings(true)} />}
              <Action label="Tylko niezbędne" run={() => save(initial)} />
              <Action label="Zaakceptuj wszystkie" run={() => save({ preferences: true, statistics: true, marketing: true })} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Action({ label, run }: { label: string; run: () => void }) {
  return <Pressable accessibilityRole="button" onPress={run} style={styles.action}>
    <Text style={styles.actionText}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: isIOS ? 'flex-end' : 'center', backgroundColor: '#0006', padding: 16 },
  panel: { maxHeight: '90%', borderRadius: isIOS ? 16 : 12, backgroundColor: '#fff' },
  content: { padding: 16, gap: 8 },
  heading: { fontSize: 22, fontWeight: '700' },
  category: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  action: { minHeight: 44, justifyContent: 'center' },
  actionText: { color: '#0452a8', fontWeight: '600' },
});
`;
}
