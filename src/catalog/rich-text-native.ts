import type { RichTextSegment } from '../kit/mobile/content.js';
import { safeHref } from '../kit/mobile/shared.js';
import type { NativePlatformChoice } from './native-export.js';

export function richTextNativeSource(segments: RichTextSegment[], platform: NativePlatformChoice) {
  const content = segments.map(({ type, value, url }) => ({
    text: value,
    href: (type === 'link' || type === 'source') && url ? safeHref(url) || null : null,
  }));
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Linking, StyleSheet, Text, View } from 'react-native';

const content: { text: string; href: string | null }[] = ${JSON.stringify(content, null, 2)};
const isIOS = ${ios};

export default function Example({ onUrlClick }: { onUrlClick?: (url: string) => void } = {}) {
  const [feedback, setFeedback] = useState('');
  async function open(href: string) {
    setFeedback('');
    if (onUrlClick) {
      onUrlClick(href);
    } else if (/^(https?:|mailto:|tel:)/i.test(href)) {
      try { await Linking.openURL(href); }
      catch { setFeedback('Nie udało się otworzyć odnośnika.'); }
    } else {
      setFeedback('Wybrano odnośnik ' + href);
    }
  }

  return (
    <View>
      <Text style={styles.body}>
        {content.map(({ text, href }, index) => href ? (
          <Text key={index} accessibilityRole="link" style={styles.link}
            onPress={() => void open(href)}>{text}</Text>
        ) : <Text key={index}>{text}</Text>)}
      </Text>
      {feedback ? <Text accessibilityLiveRegion="polite" style={styles.body}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { color: '#161b22', fontSize: isIOS ? 17 : 16, lineHeight: 24 },
  link: { color: isIOS ? '#165ef8' : '#0452a8', textDecorationLine: 'underline', fontWeight: '600' },
});
`;
}
