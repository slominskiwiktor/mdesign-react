import { captureIconSurface, captureRenderedIcon } from './native-export.js';

export async function iconSurfaceNativeSource(
  root: HTMLElement,
  label?: string,
  disabled?: boolean,
) {
  const { width, visual, icon, uri } = await captureIconSurface(root);
  return `import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const label = ${JSON.stringify(label ?? '')};
const uri = ${JSON.stringify(uri ?? null)};

export default function Example({ children }: { children?: ReactNode } = {}) {
  return (
    <View accessible={!!label} accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label || undefined} accessibilityState={{ disabled: ${!!disabled} }}
      accessibilityElementsHidden={!label} importantForAccessibility={label ? 'auto' : 'no-hide-descendants'}
      style={styles.surface}>
      {children ?? (uri ? <Image accessible={false} source={{ uri }} resizeMode="contain" style={styles.icon} /> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { width: ${width}, height: ${width}, alignItems: 'center', justifyContent: 'center',
    ...${JSON.stringify(visual)} },
  icon: ${JSON.stringify(icon ?? {})},
});
`;
}

export async function iconNativeSource(root: HTMLElement, title?: string) {
  const icon = await captureRenderedIcon(root);
  if (!icon) throw new Error('Brak widocznej ikony.');

  return `import { Image, StyleSheet } from 'react-native';

const uri = ${JSON.stringify(icon.uri)};
const label = ${JSON.stringify(title ?? '')};

export default function Example({ size, color, accessibilityLabel = label }: {
  size?: number;
  color?: string;
  accessibilityLabel?: string;
} = {}) {
  return (
    <Image
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel || undefined}
      importantForAccessibility={accessibilityLabel ? 'auto' : 'no'}
      resizeMode="contain"
      source={{ uri }}
      style={[styles.icon, size === undefined ? undefined : { width: size, height: size },
        color === undefined ? undefined : { tintColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  icon: ${JSON.stringify(icon.style)},
});
`;
}
