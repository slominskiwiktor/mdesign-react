import type { AvatarProps } from '../kit/components.js';
import type { NativePlatformChoice } from './native-export.js';

export function primitiveNativeSource(
  name: string,
  args: Partial<AvatarProps>,
  platform: NativePlatformChoice,
) {
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  const platformImport = platform === 'auto' ? 'Platform, ' : '';
  if (name === 'Divider')
    return `import { ${platformImport}StyleSheet, View } from 'react-native';

const isIOS = ${ios};

export default function Example() {
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={styles.divider} />
  );
}

const styles = StyleSheet.create({
  divider: { alignSelf: 'stretch', height: isIOS ? StyleSheet.hairlineWidth : 1,
    marginVertical: 16, backgroundColor: '#d6d9df' },
});
`;

  const size =
    typeof args.size === 'number'
      ? Math.max(0, args.size)
      : args.size === 'sm'
        ? 28
        : args.size === 'lg'
          ? 48
          : 32;
  return `import { ${platformImport}StyleSheet, Text, View } from 'react-native';

const isIOS = ${ios};
const fallbackName = ${JSON.stringify(args.name ?? '')};

export default function Example({ name = fallbackName, size = ${JSON.stringify(Number.isFinite(size) ? size : 32)} }: {
  name?: string; size?: number;
} = {}) {
  const initials = name.trim().split(/\\s+/).filter(Boolean).slice(0, 2)
    .map((word) => Array.from(word)[0]).join('').toLocaleUpperCase('pl-PL');
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={name || 'Awatar'}
      style={[styles.avatar, { width: size, height: size, borderRadius: isIOS ? size / 2 : 6 }]}>
      <Text accessible={false} style={[styles.text, { fontSize: size / 2 }]}>{initials || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: isIOS ? '#e9e9eb' : '#edf3fc' },
  text: { color: '#161b22', fontWeight: '500' },
});
`;
}
