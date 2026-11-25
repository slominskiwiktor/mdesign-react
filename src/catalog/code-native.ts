import type { ReactNode } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import type { BarcodeGraphicProps, QRCodeGraphicProps } from '../kit/mobile/codes.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = Partial<BarcodeGraphicProps & QRCodeGraphicProps> & {
  title?: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

type Run = [number, number];

function runs(dark: (column: number) => boolean, width: number, margin: number): Run[] {
  const result: Run[] = [];
  for (let start = 0; start < width;) {
    if (!dark(start)) {
      start++;
      continue;
    }
    let end = start + 1;
    while (end < width && dark(end)) end++;
    result.push([start + margin, end - start]);
    start = end;
  }
  return result;
}

export function codeNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const qr = name.startsWith('QRCode');
  const card = name.endsWith('Card');
  const value = args.value ?? '';
  const format = args.format ?? 'CODE128';
  let columns = 0;
  let bands: Run[][] = [];
  let error = '';
  try {
    if (qr) {
      const { modules } = QRCode.create(value, { errorCorrectionLevel: args.level ?? 'M' });
      columns = modules.size + 8;
      bands = Array.from({ length: modules.size }, (_, row) =>
        runs((column) => !!modules.get(row, column), modules.size, 4),
      );
    } else {
      const target: { encodings?: { data: string }[] } = {};
      (JsBarcode as unknown as (target: object, value: string, options: object) => void)(
        target,
        value,
        { format, displayValue: false, margin: 0 },
      );
      const data = target.encodings?.map(({ data }) => data).join('') ?? '';
      if (!data) throw new Error('Empty barcode');
      columns = data.length + 20;
      bands = [runs((column) => data[column] === '1', data.length, 10)];
    }
  } catch {
    error = qr
      ? 'Nie można zakodować podanych danych.'
      : 'Nieprawidłowe dane dla kodu ' + format + '.';
  }
  const config = {
    qr,
    card,
    columns,
    bands,
    error,
    label: card
      ? (args.title ?? (qr ? 'Kod QR' : 'Kod kreskowy'))
      : (args.label ?? (qr ? 'Kod QR' : 'Kod kreskowy')),
    size: card ? 192 : (args.size ?? 192),
    height: card ? 64 : (args.height ?? 64),
    description: textOf(args.description),
    caption: !qr && (card || args.displayValue !== false) ? value : '',
    action: name === 'QRCodeCard' && args.onAction ? (args.actionLabel ?? 'Pokaż szczegóły') : '',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';

const config = ${JSON.stringify({ ...config, bands: undefined }, null, 2)};
const bands: [number, number][][] = ${JSON.stringify(bands)};
const isIOS = ${ios};

export default function Example({ onAction }: { onAction?: () => void } = {}) {
  const [width, setWidth] = useState(0);
  const density = PixelRatio.get();
  const limit = config.qr ? Math.min(width, config.size) : width;
  const modulePixels = config.columns ? Math.floor(limit * density / config.columns) : 0;
  const unit = modulePixels / density;
  const action = config.action || (onAction && config.card && config.qr ? 'Pokaż szczegóły' : '');
  const [details, setDetails] = useState(false);

  return (
    <View style={config.card && styles.card} onLayout={(event) => {
      setWidth(Math.max(0, event.nativeEvent.layout.width - (config.card ? 32 : 0)));
    }}>
      {config.card ? <Text accessibilityRole="header" style={styles.title}>{config.label}</Text> : null}
      {config.description ? <Text style={styles.copy}>{config.description}</Text> : null}
      {action ? <Pressable accessibilityRole="button" style={styles.action}
        onPress={() => onAction ? onAction() : setDetails(!details)}><Text>{action}</Text></Pressable> : null}
      {details ? <Text accessibilityLiveRegion="polite">{config.label}</Text> : null}
      {config.error ? <Text accessibilityRole="alert">{config.error}</Text> : modulePixels > 0 ? (
        <View accessible accessibilityRole="image" accessibilityLabel={config.label}
          style={[styles.graphic, { width: unit * config.columns,
            height: config.qr ? unit * config.columns : config.height }]}>
          {bands.map((band, y) => band.map(([x, length]) => (
            <View key={y + ':' + x} accessible={false} style={[styles.ink, {
              left: x * unit, width: length * unit, top: config.qr ? (y + 4) * unit : 0,
              height: config.qr ? unit : config.height,
            }]} />
          )))}
        </View>
      ) : width > 0 ? <Text accessibilityRole="alert">Za mało miejsca, aby wyświetlić kod.</Text> : null}
      {config.caption && !config.error ? <Text style={styles.caption}>{config.caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: isIOS ? 16 : 12, gap: 8, backgroundColor: '#fff' },
  title: { fontSize: 17, fontWeight: '600', color: '#161b22' },
  copy: { color: '#52575f' },
  action: { minHeight: 44, justifyContent: 'center' },
  graphic: { backgroundColor: '#fff', alignSelf: 'center' },
  ink: { position: 'absolute', backgroundColor: '#000' },
  caption: { color: '#161b22', textAlign: 'center' },
});
`;
}
