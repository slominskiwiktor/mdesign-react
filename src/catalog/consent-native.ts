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
const options = [
  ['preferences', 'Preferencje'], ['statistics', 'Statystyka'], ['marketing', 'Marketing'],
] as const;
const initial = { preferences: false, statistics: false, marketing: false };
type Choices = typeof initial;
type Consent = Choices & { necessary: true; updatedAt: string };

export default function Example({ value, open, onOpenChange, onConsentChange, onOpenPolicy }: {
  value?: Consent; open?: boolean; onOpenChange?: (open: boolean) => void;
  onConsentChange?: (value: Consent) => void; onOpenPolicy?: (href: string) => void;
} = {}) {
  const [local, setLocal] = useState<Consent | undefined>();
  const [shown, setShown] = useState(${args.open ?? true});
  const [settings, setSettings] = useState(${args.defaultTab === 'details'});
  const [draft, setDraft] = useState<Choices>(value ?? initial);

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
        setSettings(${args.defaultTab === 'details'});
        setShown(true);
        onOpenChange?.(true);
      }} />
      <Modal visible={open ?? shown} transparent animationType={isIOS ? 'slide' : 'fade'} onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={styles.panel}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text accessibilityRole="header" style={styles.heading}>{${JSON.stringify(args.title ?? 'Dbamy o Twoją prywatność')}}</Text>
              <Text>{${JSON.stringify(textOf(args.description) || 'Wybierz, na jakie opcjonalne pliki cookies wyrażasz zgodę.')}}</Text>
              {onOpenPolicy ? <Action label="Polityka prywatności" run={() => onOpenPolicy(${JSON.stringify(args.policyHref ?? '#privacy')})} /> : null}
              {settings ? (
                <>
                  <Text>Niezbędne · zawsze aktywne</Text>
                  {options.map(([key, label]) => (
                    <View key={key} style={styles.row}>
                      <Text>{label}</Text>
                      <Switch accessibilityLabel={label} value={draft[key]}
                        onValueChange={(checked) => setDraft((previous) => ({ ...previous, [key]: checked }))} />
                    </View>
                  ))}
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  action: { minHeight: 44, justifyContent: 'center' },
  actionText: { color: '#0452a8', fontWeight: '600' },
});
`;
}
