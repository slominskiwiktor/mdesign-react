import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type Args = {
  label?: string;
  description?: string;
  hint?: string;
  error?: ReactNode;
  requirements?: string[];
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  uniqueNames?: boolean;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
};

export function filePickerNativeSource(name: string, args: Args, platform: NativePlatformChoice) {
  const sourceOnly = name === 'FileSourceItem';
  const config = {
    label: args.label ?? 'Załączniki',
    hint: [args.description, args.hint, ...(args.requirements ?? [])].filter(Boolean).join('\n'),
    error: textOf(args.error),
    accept: (args.accept ?? '')
      .toLowerCase()
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean),
    maxFiles: Number.isFinite(args.maxFiles) ? args.maxFiles : null,
    maxFileSize: Number.isFinite(args.maxFileSize) ? args.maxFileSize : null,
    uniqueNames: args.uniqueNames ?? true,
    required: !!args.required,
    disabled: !!args.disabled,
    multiple: !sourceOnly && (args.multiple ?? true),
    sourceOnly,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `// Install in your Expo project: npx expo install expo-document-picker
import { useRef, useState } from 'react';
import { getDocumentAsync } from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

type File = DocumentPickerAsset;
type Rejection = { file: File; code: 'type' | 'size' | 'count' | 'name' | 'custom'; message: string };
type Props = {
  onFilesChange?: (files: File[]) => void;
  onRejected?: (rejections: Rejection[]) => void;
  onPreview?: (file: File) => void;
  validateName?: (name: string) => string | undefined;
  validate?: (file: File) => string | undefined | Promise<string | undefined>;
};
const config = ${JSON.stringify(config, null, 2)} as {
  label: string; hint: string; error: string; accept: string[]; maxFiles: number | null;
  maxFileSize: number | null; uniqueNames: boolean; required: boolean;
  disabled: boolean; multiple: boolean; sourceOnly: boolean;
};
const isIOS = ${ios};

function allowed(file: File) {
  const mime = file.mimeType?.toLowerCase() ?? '';
  const name = file.name.toLowerCase();
  return config.accept.length === 0 || config.accept.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token === '*/*') return true;
    return token.endsWith('/*') ? mime.startsWith(token.slice(0, -1)) : mime === token;
  });
}

export default function Example({ onFilesChange, onRejected, onPreview, validateName, validate }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const blocked = config.disabled || busy;

  function change(next: File[]) {
    setFiles(next);
    onFilesChange?.(next);
  }

  async function pick() {
    if (config.disabled || locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      const result = await getDocumentAsync({
        multiple: config.multiple,
        copyToCacheDirectory: true,
        type: config.accept.length && config.accept.every((token) => token.includes('/'))
          ? config.accept : '*/*',
      });
      if (result.canceled) return;
      const next = config.multiple ? [...files] : [];
      const rejected: Rejection[] = [];
      for (const file of config.multiple ? result.assets : result.assets.slice(0, 1)) {
        const name = validateName?.(file.name);
        const duplicate = config.uniqueNames && next.some((item) => item.name.toLowerCase() === file.name.toLowerCase());
        if (!allowed(file)) {
          rejected.push({ file, code: 'type', message: 'Niedozwolony format pliku.' });
        } else if (config.maxFileSize !== null && (file.size === undefined || file.size > config.maxFileSize)) {
          rejected.push({ file, code: 'size', message: 'Rozmiar jest nieznany lub przekracza limit ' + config.maxFileSize + ' B.' });
        } else if (config.maxFiles !== null && next.length >= config.maxFiles) {
          rejected.push({ file, code: 'count', message: 'Maksymalna liczba plików: ' + config.maxFiles + '.' });
        } else if (duplicate || name) {
          rejected.push({ file, code: 'name', message: name || 'Plik o tej nazwie jest już na liście.' });
        } else {
          const issue = await validate?.(file);
          if (issue) rejected.push({ file, code: 'custom', message: issue });
          else next.push(file);
        }
      }
      if (next.length > (config.multiple ? files.length : 0)) change(next);
      setIssues(rejected.map(({ file, message }) => file.name + ': ' + message));
      if (rejected.length) onRejected?.(rejected);
    } catch {
      setIssues(['Nie udało się odczytać wybranych plików.']);
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }

  return (
    <View style={styles.container}>
      {!config.sourceOnly ? <Text accessibilityRole="header" style={styles.title}>{config.label}</Text> : null}
      {config.hint ? <Text style={styles.copy}>{config.hint}</Text> : null}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: blocked, busy }}
        disabled={blocked} style={[styles.action, blocked && styles.disabled]} onPress={() => void pick()}>
        <Text style={styles.actionText}>{busy ? 'Odczytywanie…' : config.sourceOnly ? config.label : 'Wybierz pliki'}</Text>
      </Pressable>
      {files.map((file, index) => (
        <View key={file.uri + ':' + index} style={styles.row}>
          {onPreview ? <Pressable accessibilityRole="button" accessibilityLabel={'Podgląd: ' + file.name}
            style={styles.filename} onPress={() => onPreview(file)}><Text>{file.name}</Text></Pressable>
            : <Text style={styles.filename}>{file.name}</Text>}
          {!config.sourceOnly ? (
            <Pressable accessibilityRole="button" accessibilityLabel={'Usuń: ' + file.name}
              disabled={blocked} style={styles.action} onPress={() => change(files.filter((_, i) => i !== index))}>
              <Text style={styles.actionText}>Usuń</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      {config.required && !files.length ? <Text style={styles.copy}>Dodaj co najmniej jeden plik.</Text> : null}
      {config.error ? <Text accessibilityRole="alert" style={styles.error}>{config.error}</Text> : null}
      {issues.length ? <Text accessibilityRole="alert" style={styles.error}>{issues.join('\\n')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  title: { fontSize: 17, fontWeight: '600', color: '#161b22' },
  copy: { color: '#52575f', fontSize: isIOS ? 13 : 14 },
  action: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', alignSelf: 'flex-start',
    backgroundColor: '#edf3fc', borderRadius: isIOS ? 22 : 8 },
  actionText: { color: isIOS ? '#165ef8' : '#0452a8', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filename: { flex: 1 },
  error: { color: '#b31225' },
  disabled: { opacity: 0.55 },
});
`;
}
