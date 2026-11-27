import type { ChatBubbleProps } from '../kit/mobile/pages.js';
import { safeHref } from '../kit/mobile/shared.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function chatNativeSource(
  name: string,
  args: ChatBubbleProps,
  platform: NativePlatformChoice,
) {
  const sources = args.footer?.sources;
  const config = {
    indicator: name === 'TypingIndicator',
    outgoing: args.direction === 'outgoing',
    label: args.label ?? '',
    loading: !!args.loading,
    text: textOf(args.children),
    additional: textOf(args.additionalInfo),
    content: (args.content ?? [])
      .filter(({ type }) => type !== 'unknown')
      .map(({ type, value, url }) => ({
        label: value,
        url: type !== 'text' && url ? (safeHref(url) ?? null) : null,
      })),
    sources: (sources?.items ?? []).map(({ label, url }) => ({
      label,
      url: safeHref(url) ?? null,
    })),
    more: sources?.showMoreLabel ?? sources?.title ?? 'Pokaż źródła',
    less: sources?.showLessLabel ?? 'Ukryj źródła',
    share: !!args.footer?.onShare,
    positive: !!args.footer?.onPositiveChange,
    negative: !!args.footer?.onNegativeChange,
    initialPositive: !!args.footer?.positive,
    initialNegative: !!args.footer?.negative,
    actions: [...(args.actions ?? []), ...(args.suggestions ?? [])].map(({ label }) => label),
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useEffect, useRef, useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}AccessibilityInfo, Animated, Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';

type Segment = { label: string; url: string | null };
const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

function Typing() {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let mounted = true;
    let loop: Animated.CompositeAnimation | undefined;
    function update(reduced: boolean) {
      if (!mounted) return;
      loop?.stop();
      phase.setValue(0);
      if (reduced) return;
      loop = Animated.loop(Animated.timing(phase, {
        toValue: 3, duration: 1050, useNativeDriver: true, isInteraction: false,
      }));
      loop.start();
    }
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    void AccessibilityInfo.isReduceMotionEnabled().then(update, () => {});
    return () => { mounted = false; listener.remove(); loop?.stop(); };
  }, [phase]);
  return (
    <View accessible accessibilityLabel="Trwa pisanie" accessibilityLiveRegion="polite" style={styles.dots}>
      {[0, 1, 2].map((dot) => <Animated.View key={dot} style={[styles.dot, {
        opacity: phase.interpolate({ inputRange: [0, 1, 2, 3], outputRange:
          [0, 1, 2, 0].map((active) => active === dot ? 1 : 0.45) }),
      }]} />)}
    </View>
  );
}

type Props = { loading?: boolean; onUrlClick?: (url: string) => void; onAction?: (label: string) => void;
  onShare?: () => void; onPositiveChange?: (value: boolean) => void; onNegativeChange?: (value: boolean) => void };

export default function Example({ loading = config.loading, onUrlClick, onAction,
  onShare, onPositiveChange, onNegativeChange }: Props = {}) {
  const [expanded, setExpanded] = useState(false);
  const [positive, setPositive] = useState(config.initialPositive);
  const [negative, setNegative] = useState(config.initialNegative);
  const [feedback, setFeedback] = useState('');
  if (config.indicator) return <Typing />;
  const ink = config.outgoing ? styles.inverse : styles.ink;

  async function open(url: string) {
    if (onUrlClick) { onUrlClick(url); return; }
    if (!/^(https?:|mailto:|tel:)/i.test(url)) { setFeedback(url); return; }
    try { await Linking.openURL(url); }
    catch { setFeedback('Nie udało się otworzyć odnośnika.'); }
  }

  function segment(item: Segment, index: number) {
    const url = item.url;
    return url ? <Text key={index} accessibilityRole="link" style={[ink, styles.link]}
      onPress={() => void open(url)}>{item.label}</Text> : <Text key={index} style={ink}>{item.label}</Text>;
  }

  return (
    <View style={[styles.bubble, config.outgoing && styles.outgoing]}>
      {config.label ? <Text style={[ink, styles.title]}>{config.label}</Text> : null}
      {loading ? <Typing /> : <Text style={ink}>{config.content.map(segment)}{config.text}</Text>}
      {config.sources.length ? (
        <>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded }} style={styles.action}
            onPress={() => setExpanded(!expanded)}><Text style={ink}>{expanded ? config.less : config.more}</Text></Pressable>
          {expanded ? config.sources.map((item, index) => <Text key={index}>{segment(item, index)}</Text>) : null}
        </>
      ) : null}
      {config.share ? <Pressable accessibilityRole="button" style={styles.action} onPress={() => {
        if (onShare) onShare();
        else void Share.share({ message: config.content.map(({ label }) => label).join('') + config.text })
          .catch(() => setFeedback('Nie udało się udostępnić odpowiedzi.'));
      }}><Text style={ink}>Udostępnij odpowiedź</Text></Pressable> : null}
      {config.positive ? <Pressable accessibilityRole="togglebutton" accessibilityState={{ checked: positive }}
        style={styles.action} onPress={() => { setPositive(!positive); onPositiveChange?.(!positive); }}>
        <Text style={ink}>Przydatna odpowiedź</Text></Pressable> : null}
      {config.negative ? <Pressable accessibilityRole="togglebutton" accessibilityState={{ checked: negative }}
        style={styles.action} onPress={() => { setNegative(!negative); onNegativeChange?.(!negative); }}>
        <Text style={ink}>Nieprzydatna odpowiedź</Text></Pressable> : null}
      {config.actions.map((label, index) => <Pressable key={index} accessibilityRole="button"
        style={styles.action} onPress={() => onAction ? onAction(label) : setFeedback(label)}><Text style={ink}>{label}</Text></Pressable>)}
      {config.additional ? <Text style={ink}>{config.additional}</Text> : null}
      {feedback ? <Text accessibilityLiveRegion="polite" style={ink}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { alignSelf: 'flex-start', maxWidth: '90%', padding: 12, gap: 4,
    borderRadius: isIOS ? 16 : 20, backgroundColor: '#f0f2f5' },
  outgoing: { alignSelf: 'flex-end', backgroundColor: '#0452a8' },
  ink: { color: '#161b22', fontSize: isIOS ? 15 : 16 },
  inverse: { color: '#fff', fontSize: isIOS ? 15 : 16 },
  title: { fontWeight: '600' },
  link: { textDecorationLine: 'underline' },
  action: { minHeight: 44, justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 22 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: config.outgoing ? '#fff' : '#52575f' },
});
`;
}
