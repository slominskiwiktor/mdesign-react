import type { SkeletonProps } from '../kit/components.js';
import type { NativePlatformChoice } from './native-export.js';

type DimensionValue = number | `${number}%` | 'auto';

function dimension(value: unknown, fallback: DimensionValue): DimensionValue {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value !== 'string') return fallback;
  const input = value.trim();
  if (/^\d+(?:\.\d+)?%$/.test(input)) return input as `${number}%`;
  if (/^\d+(?:\.\d+)?px$/.test(input)) return Number.parseFloat(input);
  return input === 'auto' ? input : fallback;
}

export function skeletonNativeSource(args: SkeletonProps, platform: NativePlatformChoice) {
  const config = {
    width: dimension(args.width ?? args.style?.width, '100%'),
    height: dimension(args.height ?? args.style?.height, 16),
    rounded: args.rounded ?? false,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useEffect, useRef } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import type { DimensionValue } from 'react-native';

const config: { width: DimensionValue; height: DimensionValue; rounded: boolean } = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    function update(reduced: boolean) {
      if (!active) return;
      animation?.stop();
      opacity.setValue(1);
      if (reduced) return;
      animation = Animated.loop(Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 850, useNativeDriver: true, isInteraction: false }),
        Animated.timing(opacity, { toValue: 1, duration: 850, useNativeDriver: true, isInteraction: false }),
      ]));
      animation.start();
    }
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    void AccessibilityInfo.isReduceMotionEnabled().then(update, () => {});
    return () => {
      active = false;
      listener.remove();
      animation?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={[styles.placeholder, { opacity, width: config.width, height: config.height,
        borderRadius: config.rounded ? 999 : isIOS ? 8 : 6 }]} />
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: isIOS ? '#e9e9eb' : '#e1e5ea', maxWidth: '100%' },
});
`;
}
