import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type EmptyStateArgs = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  variant?: 'cases' | 'payments';
};

export function emptyStateNativeSource(
  name: string,
  args: EmptyStateArgs,
  platform: NativePlatformChoice,
) {
  const portal = name === 'PortalEmptyState';
  const payments = args.variant === 'payments';
  const config = {
    title: textOf(args.title),
    description:
      textOf(args.description ?? args.children) ||
      (portal && args.children == null
        ? payments
          ? 'Wszystkie zobowiązania zostały opłacone. Potwierdzenie przelewu znajdziesz w historii płatności.'
          : 'Tu zobaczysz nowe sprawy załatwiane online. Poprzednie sprawy znajdziesz w skrzynkach lub historii spraw.'
        : ''),
    action: textOf(args.action),
    portalActions: portal && args.children == null,
    payments,
    icon: name !== 'MobileEmptyState',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Props = {
  onAction?: () => void;
  onInbox?: () => void;
  onHistory?: () => void;
};

export default function Example({ onAction, onInbox, onHistory }: Props) {
  const [destination, setDestination] = useState('');

  function open(label: string, callback?: () => void) {
    if (callback) callback();
    else setDestination(label);
  }

  const history = config.payments ? 'Historia płatności' : 'Historia spraw';

  return (
    <View style={styles.container}>
      {destination ? (
        <>
          <Text accessibilityRole="header" style={styles.title}>{destination}</Text>
          <Action label="Wróć" onPress={() => setDestination('')} />
        </>
      ) : (
        <>
          {config.icon ? <Text accessible={false} style={styles.icon}>ⓘ</Text> : null}
          {config.title ? <Text accessibilityRole="header" style={styles.title}>{config.title}</Text> : null}
          {config.description ? <Text style={styles.copy}>{config.description}</Text> : null}
          {config.action ? <Action label={config.action} onPress={() => open(config.action, onAction)} /> : null}
          {config.portalActions && !config.payments && onInbox
            ? <Action label="Twoje skrzynki" onPress={onInbox} /> : null}
          {config.portalActions && onHistory ? <Action label={history} onPress={onHistory} /> : null}
        </>
      )}
    </View>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', gap: isIOS ? 8 : 12 },
  title: { color: '#161b22', fontSize: isIOS ? 17 : 20, fontWeight: '600', textAlign: 'center' },
  copy: { color: '#52575f', fontSize: isIOS ? 13 : 16, textAlign: 'center' },
  icon: { color: isIOS ? '#165ef8' : '#0452a8', fontSize: 32 },
  action: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  actionLabel: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600', textAlign: 'center' },
});
`;
}
