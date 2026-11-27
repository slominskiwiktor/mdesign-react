import { captureIconSurface } from './native-export.js';

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
