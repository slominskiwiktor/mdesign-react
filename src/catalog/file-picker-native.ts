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
    canUpload: name === 'PortalFileUpload',
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `// Install in your Expo project: npx expo install expo-document-picker
import { useEffect, useRef, useState } from 'react';
import { getDocumentAsync } from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

type File = DocumentPickerAsset;
type Rejection = { file: File; code: 'type' | 'size' | 'count' | 'name' | 'custom'; message: string };
type Status = { state: 'uploading' | 'success' | 'error'; progress: number; error?: string };
type Props = {
  upload?: (file: File, context: { signal: AbortSignal; onProgress: (percent: number) => void }) => Promise<void>;
  onUploaded?: (file: File) => void;
  onFilesChange?: (files: File[]) => void;
  onRejected?: (rejections: Rejection[]) => void;
  onPreview?: (file: File) => void;
  validateName?: (name: string) => string | undefined;
  validate?: (file: File) => string | undefined | Promise<string | undefined>;
};
const config = ${JSON.stringify(config, null, 2)} as {
  label: string; hint: string; error: string; accept: string[]; maxFiles: number | null;
  maxFileSize: number | null; uniqueNames: boolean; required: boolean;
  disabled: boolean; multiple: boolean; sourceOnly: boolean; canUpload: boolean;
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

export default function Example({ onFilesChange, onRejected, onPreview, validateName, validate, upload, onUploaded }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [statuses, setStatuses] = useState(new Map<File, Status>());
  const active = useRef(new Map<File, AbortController>());

  useEffect(() => {
    const jobs = active.current;
    return () => {
      const controllers = [...jobs.values()];
      jobs.clear();
      controllers.forEach((controller) => controller.abort());
    };
  }, []);

  function cancel(file: File) {
    const controller = active.current.get(file);
    active.current.delete(file);
    controller?.abort();
    setStatuses((previous) => {
      const next = new Map(previous);
      next.delete(file);
      return next;
    });
  }

  async function send(file: File) {
    if (!config.canUpload || !upload || blocked || active.current.has(file)) return;
    const controller = new AbortController();
    active.current.set(file, controller);
    function update(status: Status) {
      setStatuses((previous) => new Map(previous).set(file, status));
    }
    const isCurrent = () => active.current.get(file) === controller;
    update({ state: 'uploading', progress: 0 });
    try {
      await upload(file, {
        signal: controller.signal,
        onProgress: (percent) => {
          if (isCurrent() && Number.isFinite(percent)) {
            update({ state: 'uploading', progress: Math.max(0, Math.min(100, percent)) });
          }
        },
      });
      if (isCurrent()) {
        active.current.delete(file);
        update({ state: 'success', progress: 100 });
        onUploaded?.(file);
      }
    } catch (error) {
      if (isCurrent()) {
        active.current.delete(file);
        update({ state: 'error', progress: 0,
          error: error instanceof Error ? error.message : 'Nie udało się wysłać pliku.' });
      }
    }
  }
  const blocked = config.disabled || busy;

  function change(next: File[]) {
    if (config.canUpload) files.filter((file) => !next.includes(file)).forEach(cancel);
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
      {files.map((file, index) => {
        const status = statuses.get(file);
        return (
        <View key={file.uri + ':' + index} style={styles.row}>
          {onPreview ? <Pressable accessibilityRole="button" accessibilityLabel={'Podgląd: ' + file.name}
            style={styles.filename} onPress={() => onPreview(file)}><Text>{file.name}</Text></Pressable>
            : <Text style={styles.filename}>{file.name}</Text>}
          {config.canUpload && upload ? (
            <View>
              {status?.state === 'uploading' ? (
                <>
                  <Text accessibilityRole="progressbar" accessibilityLabel={'Wysyłanie: ' + file.name}
                    accessibilityValue={{ min: 0, max: 100, now: status.progress }}>{Math.round(status.progress)}%</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={'Anuluj wysyłanie: ' + file.name}
                    style={styles.action} onPress={() => cancel(file)}><Text style={styles.actionText}>Anuluj</Text></Pressable>
                </>
              ) : status?.state === 'success' ? <Text accessibilityLiveRegion="polite">Wysłano</Text> : (
                <>
                  {status?.error ? <Text accessibilityRole="alert" style={styles.error}>{status.error}</Text> : null}
                  <Pressable accessibilityRole="button" accessibilityLabel={'Wyślij: ' + file.name}
                    disabled={blocked} style={styles.action} onPress={() => void send(file)}>
                    <Text style={styles.actionText}>{status?.state === 'error' ? 'Ponów' : 'Wyślij'}</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}
          {!config.sourceOnly ? (
            <Pressable accessibilityRole="button" accessibilityLabel={'Usuń: ' + file.name}
              disabled={blocked} style={styles.action} onPress={() => change(files.filter((_, i) => i !== index))}>
              <Text style={styles.actionText}>Usuń</Text>
            </Pressable>
          ) : null}
        </View>
        );
      })}
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
