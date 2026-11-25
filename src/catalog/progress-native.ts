import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type ProgressArgs = {
  label?: string;
  value?: number;
  max?: number;
  buffer?: number;
  indeterminate?: boolean;
  size?: number | 'small' | 'large';
  loading?: boolean;
  overlay?: boolean;
  children?: ReactNode;
};

export function progressNativeSource(
  name: string,
  args: ProgressArgs,
  platform: NativePlatformChoice,
) {
  const auto = platform === 'auto';
  const ios = auto ? "Platform.OS === 'ios'" : String(platform === 'ios');
  const platformImport = auto ? 'Platform, ' : '';
  if (name !== 'Progress' && name !== 'PortalProgress') {
    const config = {
      label: args.label ?? (name === 'LandingLoader' ? 'Wczytywanie' : 'Ładowanie'),
      content: textOf(args.children),
      size:
        typeof args.size === 'number' && Number.isFinite(args.size) && args.size > 0
          ? args.size
          : name === 'PortalLoader'
            ? 32
            : 20,
      loading: args.loading ?? true,
      overlay: args.overlay ?? false,
      showLabel: name === 'PortalLoader',
    };
    return `import type { ReactNode } from 'react';
import { ${platformImport}ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

export default function Example({
  loading = config.loading,
  children,
}: { loading?: boolean; children?: ReactNode }) {
  return (
    <View style={styles.container} accessibilityState={{ busy: loading }}>
      {children ?? (config.content ? <Text>{config.content}</Text> : null)}
      {loading ? (
        <View accessible accessibilityRole="progressbar" accessibilityLabel={config.label}
          accessibilityState={{ busy: true }} style={[styles.indicator, config.overlay && styles.overlay]}>
          <ActivityIndicator size={isIOS ? (config.size >= 32 ? 'large' : 'small') : config.size}
            color={isIOS ? '#165ef8' : '#0452a8'} />
          {config.showLabel ? <Text>{config.label}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 44 },
  indicator: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: '#ffffffdd' },
});
`;
  }
  const portal = name === 'PortalProgress';
  const config = {
    label: args.label ?? 'Postęp',
    value: Number.isFinite(args.value) ? args.value : 0,
    max: portal && Number.isFinite(args.max) && Number(args.max) > 0 ? args.max : 100,
    buffer: portal && Number.isFinite(args.buffer) ? args.buffer : undefined,
    indeterminate: portal && !!args.indeterminate,
    small: portal && args.size === 'small',
    showLabel: !portal && !!args.label,
  };
  return `import { useEffect, useRef, useState } from 'react';
import { ${platformImport}AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify({ ...config, buffer: config.buffer ?? null }, null, 2)};
const isIOS = ${ios};
type Props = { value?: number; indeterminate?: boolean; buffer?: number | null };

export default function Example({
  value = config.value,
  buffer = config.buffer,
  indeterminate = config.indeterminate,
}: Props) {
  const bounded = Math.min(config.max, Math.max(0, Number.isFinite(value) ? value : 0));
  const percent = (bounded / config.max) * 100;
  const buffered = buffer !== null && Number.isFinite(buffer)
    ? Math.max(percent, Math.min(100, buffer)) : null;
  const animation = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    if (!indeterminate) return;
    let active = true;
    const update = (reduced: boolean) => { if (active) setReduceMotion(reduced); };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    void AccessibilityInfo.isReduceMotionEnabled().then(update, () => {});
    return () => { active = false; subscription.remove(); };
  }, [indeterminate]);

  useEffect(() => {
    animation.setValue(0);
    if (!indeterminate || reduceMotion || width <= 0) return;
    const movement = Animated.loop(Animated.timing(animation, {
      toValue: 1, duration: 1500, useNativeDriver: true, isInteraction: false,
    }));
    movement.start();
    return () => movement.stop();
  }, [animation, indeterminate, reduceMotion, width]);

  return (
    <View style={styles.container}>
      {config.showLabel ? (
        <View style={styles.labels} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.label}>{config.label}</Text><Text style={styles.label}>{Math.round(percent)}%</Text>
        </View>
      ) : null}
      <View accessible accessibilityRole="progressbar" accessibilityLabel={config.label}
        accessibilityState={{ busy: indeterminate }}
        accessibilityValue={indeterminate ? { text: 'Ładowanie' } : { min: 0, max: config.max, now: bounded }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={[styles.track, config.small && styles.small]}>
        {!indeterminate && buffered !== null ? <View style={[styles.buffer, { width: \`\${buffered}%\` }]} /> : null}
        {indeterminate && !reduceMotion ? (
          <Animated.View style={[styles.fill, { width: '35%', transform: [{
            translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [-0.35 * width, width] }),
          }] }]} />
        ) : <View style={[styles.fill, { width: indeterminate ? '35%' : \`\${percent}%\` }]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#161b22', fontSize: isIOS ? 13 : 14 },
  track: { height: isIOS ? 6 : 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e9e9eb' },
  small: { height: 4 },
  fill: { height: '100%', borderRadius: 8, backgroundColor: isIOS ? '#165ef8' : '#0452a8' },
  buffer: { position: 'absolute', height: '100%', backgroundColor: '#bacfee' },
});
`;
}
