import type { LandingVideoProps } from '../kit/landing/overlays.js';
import { rasterize } from './native-export.js';

function httpsUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

function attribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

export async function landingVideoNativeSource(args: LandingVideoProps) {
  const url = httpsUrl(args.src);
  const embed = args.kind === 'embed';
  const captions = httpsUrl(args.captions?.src);
  const track =
    captions && args.captions
      ? `<track kind="captions" src="${attribute(captions.href)}" srclang="${attribute(args.captions.language)}" label="${attribute(args.captions.label)}" default>`
      : '';
  const media = url
    ? embed
      ? `<iframe title="${attribute(args.title)}" src="${attribute(url.href)}" sandbox="allow-scripts allow-same-origin allow-presentation" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`
      : `<video aria-label="${attribute(args.title)}" src="${attribute(url.href)}" controls playsinline autoplay>${track}</video>`
    : '<p>Brak dostępnego źródła wideo.</p>';
  const document = `<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%;background:#000;color:#fff}video,iframe{display:block;width:100%;height:100%;border:0}</style><body>${media}</body></html>`;
  const poster = args.poster ? await rasterize(args.poster) : undefined;

  return `// Requires react-native-webview. In Expo, run: npx expo install react-native-webview
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const title = ${JSON.stringify(args.title)};
const description = ${JSON.stringify(args.description ?? '')};
const poster = ${JSON.stringify(poster ?? null)};
const html = ${JSON.stringify(document)};
const embedOrigin = ${JSON.stringify(embed ? (url?.origin ?? '') : '')};
const inline = ${args.presentation === 'inline'};

export default function Example({
  consentGranted = ${Boolean(args.consentGranted)},
  onConsentRequest,
  onOpenChange,
}: {
  consentGranted?: boolean;
  onConsentRequest?: () => void;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [open, setOpen] = useState(${Boolean(args.open)});
  const permitted = ${!args.requireConsent} || consentGranted;

  function update(next: boolean) {
    if (next && !permitted) {
      onConsentRequest?.();
      return;
    }
    setOpen(next);
    onOpenChange?.(next);
  }

  const visible = open && permitted;
  const player = visible ? (
    <View accessibilityViewIsModal={!inline} style={[styles.player, inline ? styles.inlinePlayer : styles.modalPlayer]}>
      <WebView source={{ html }} originWhitelist={['*']}
        onShouldStartLoadWithRequest={({ url }) =>
          url === 'about:blank' || (!!embedOrigin &&
            (url === embedOrigin || url.startsWith(embedOrigin + '/')))
        }
        accessibilityLabel={title}
        javaScriptEnabled={!!embedOrigin}
        allowsInlineMediaPlayback allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        thirdPartyCookiesEnabled={false}
        mixedContentMode="never" />
      <Pressable accessibilityRole="button" style={styles.action} onPress={() => update(false)}>
        <Text style={styles.actionText}>Zamknij odtwarzacz</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {inline && visible ? player : (
        <Pressable accessibilityRole="button" accessibilityLabel={
          (permitted ? 'Odtwórz film: ' : 'Ustaw zgody, aby odtworzyć film: ') + title
        } accessibilityHint={permitted ? undefined : 'Odtwarzanie wymaga zgody'}
          style={styles.poster} onPress={() => update(true)}>
          {poster ? <Image accessible={false} source={{ uri: poster }}
            resizeMode="cover" style={StyleSheet.absoluteFill} /> : null}
          <Text style={styles.actionText}>{title}</Text>
        </Pressable>
      )}
      {description ? <Text>{description}</Text> : null}
      {!inline && visible ? (
        <Modal visible animationType="none" onRequestClose={() => update(false)}>
          {player}
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  player: { backgroundColor: '#000000' },
  inlinePlayer: { minHeight: 260, aspectRatio: 16 / 9 },
  modalPlayer: { flex: 1 },
  poster: { aspectRatio: 16 / 9, justifyContent: 'flex-end', backgroundColor: '#161616', overflow: 'hidden' },
  action: { minHeight: 48, justifyContent: 'center' },
  actionText: { padding: 12, color: '#ffffff', backgroundColor: '#151515', fontSize: 16 },
});
`;
}
