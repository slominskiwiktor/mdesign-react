import type { NavigationItem } from '../kit/patterns.js';
import { captureRenderedIcon } from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';

type CapturedIcon = Awaited<ReturnType<typeof captureRenderedIcon>>;

export function captureBottomNavigationIcons(root: HTMLElement) {
  return Promise.all([...root.querySelectorAll('.m-navigation-icon')].map(captureRenderedIcon));
}

export function bottomNavigationNativeSource(
  items: NavigationItem[],
  initialValue: string,
  label: string,
  platform: NativePlatformChoice,
  icons: CapturedIcon[] = [],
) {
  const destinations = items.map(({ value, label, disabled }, index) => ({
    value,
    label,
    disabled: disabled ?? false,
    icon: icons[index]?.uri ?? null,
    tintable: Boolean(icons[index]?.style.tintColor),
  }));
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Image, Pressable, StyleSheet, Text, View } from 'react-native';

const destinations = ${JSON.stringify(destinations, null, 2)} as const;
const ios = ${ios};

type Props = {
  renderIcon?: (value: string, selected: boolean) => ReactNode;
  onValueChange?: (value: string) => void;
};

export default function BottomNavigationExample({ renderIcon, onValueChange }: Props = {}) {
  const [value, setValue] = useState<string>(${JSON.stringify(initialValue)});
  return (
    <View accessibilityRole="tablist" accessibilityLabel={${JSON.stringify(label)}} style={styles.bar}>
      {destinations.map((item) => {
        const selected = value === item.value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected, disabled: item.disabled }}
            disabled={item.disabled}
            onPress={() => { setValue(item.value); onValueChange?.(item.value); }}
            style={[styles.destination, item.disabled && styles.disabled]}
          >
            <View style={[styles.icon, !ios && selected && styles.indicator]}>
              {renderIcon ? renderIcon(item.value, selected) : item.icon ? (
                <Image source={{ uri: item.icon }} accessible={false} resizeMode="contain"
                  style={[styles.artwork, item.tintable && { tintColor: selected ? '#0452a8' : '#52575f' }]} />
              ) : null}
            </View>
            <Text style={[styles.label, selected && styles.selected]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Place the bar in the app's safe-area container.
  bar: { flexDirection: 'row', minHeight: ios ? 49 : 80, backgroundColor: ios ? '#f4f6fb' : '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#d0d4db' },
  destination: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ios ? 2 : 4 },
  icon: { width: ios ? 24 : 64, maxWidth: '100%', height: ios ? 24 : 32, borderRadius: ios ? 0 : 16, alignItems: 'center', justifyContent: 'center' },
  artwork: { width: 24, height: 24 },
  indicator: { backgroundColor: '#ddebfb' },
  label: { fontSize: ios ? 10 : 11, color: '#52575f', textAlign: 'center' },
  selected: { color: '#0452a8' },
  disabled: { opacity: 0.4 },
});
`;
}
