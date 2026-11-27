import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import { captureIconSurface } from './native-export.js';

export async function portalLogoNativeSource(root: HTMLElement, label?: ReactNode, alt?: string) {
  const { icon, uri } = await captureIconSurface(root, '.mp-logo-information');
  return `import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

const defaultSource: ImageSourcePropType | undefined = ${uri ? JSON.stringify({ uri }) : 'undefined'};
const defaultLabel = ${JSON.stringify(textOf(label === undefined ? 'Aplikacja demo' : label))};
const defaultAlt = ${JSON.stringify(alt ?? 'Symbol aplikacji demonstracyjnej')};

export default function Example({
  source = defaultSource, label = defaultLabel, alt = defaultAlt,
}: { source?: ImageSourcePropType; label?: string; alt?: string } = {}) {
  return (
    <View style={styles.brand}>
      {source ? <Image source={source} resizeMode="contain" style={styles.logo}
        accessible={!!alt} accessibilityRole={alt ? 'image' : undefined}
        accessibilityLabel={alt || undefined} importantForAccessibility={alt ? 'auto' : 'no'} /> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: ${JSON.stringify(icon ?? { width: 48, height: 48 })},
  label: { flexShrink: 1, fontSize: 16, fontWeight: '600', color: '#161b22' },
});
`;
}
