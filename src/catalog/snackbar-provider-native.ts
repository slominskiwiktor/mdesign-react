import type { NativePlatformChoice } from './native-export.js';

type ProviderArgs = { maxVisible?: number; position?: string };

export function snackbarProviderNativeSource(
  args: ProviderArgs,
  portal: boolean,
  platform: NativePlatformChoice,
) {
  const provider = portal ? 'PortalSnackbarProvider' : 'SnackbarProvider';
  const hook = portal ? 'usePortalSnackbar' : 'useSnackbar';
  const add = portal ? 'enqueue' : 'show';
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, View } from 'react-native';

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type Message = {
  id?: string;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  ${portal ? "closable?: boolean;\n  tone?: 'info' | 'success' | 'warning' | 'danger';\n  onClose?: () => void;" : 'dismissible?: boolean;'}
};
type Entry = Message & { id: string; instance: number };
type Api = {
  ${add}: (message: Message) => string;
  dismiss: (id${portal ? '' : '?'}: string) => void;
  clear: () => void;
};
const Context = createContext<Api | null>(null);
const isIOS = ${ios};

export function ${hook}() {
  const api = useContext(Context);
  if (!api) throw new Error('${hook} requires ${provider}');
  return api;
}

export function ${provider}({
  children,
  maxVisible = ${args.maxVisible ?? (portal ? 3 : 1)},
  position = ${JSON.stringify(args.position ?? 'bottom-center')},
}: { children: ReactNode; maxVisible?: number; position?: Position }) {
  const [queue, setQueue] = useState<Entry[]>([]);
  const current = useRef<Entry[]>([]);
  const sequence = useRef(0);

  function update(next: Entry[]) {
    current.current = next;
    setQueue(next);
  }

  function ${add}(message: Message) {
    const instance = ++sequence.current;
    const id = message.id ?? 'snackbar-' + instance;
    const entry = { ...message, id, instance };
    const queue = current.current;
    ${
      portal
        ? `update(queue.some((item) => item.id === id)
      ? queue.map((item) => item.id === id ? entry : item)
      : [...queue, entry]);`
        : 'update([...queue.filter((item) => item.id !== id), entry]);'
    }
    return id;
  }

  function dismiss(id${portal ? '' : '?'}: string) {
    const target = ${portal ? 'id' : 'id ?? current.current[0]?.id'};
    ${portal ? 'const removed = current.current.find((item) => item.id === target);' : ''}
    update(current.current.filter((item) => item.id !== target));
    ${portal ? 'removed?.onClose?.();' : ''}
  }

  function clear() {
    ${portal ? 'const removed = current.current;' : ''}
    update([]);
    ${portal ? 'removed.forEach((item) => item.onClose?.());' : ''}
  }

  const alignment = position.endsWith('left') ? 'flex-start'
    : position.endsWith('right') ? 'flex-end' : 'center';

  return (
    <Context.Provider value={{ ${add}, dismiss, clear }}>
      <View style={styles.container}>
        {children}
        <View pointerEvents="box-none" style={[
          styles.region,
          position.startsWith('top') ? { top: 16 } : { bottom: 16 },
          { alignItems: alignment },
        ]}>
          {queue.slice(0, Math.max(1, maxVisible)).map((item) => (
            <Notice key={item.instance} item={item} dismiss={() => {
              if (current.current.some((entry) => entry.instance === item.instance)) dismiss(item.id);
            }} />
          ))}
        </View>
      </View>
    </Context.Provider>
  );
}

function Notice({ item, dismiss }: { item: Entry; dismiss: () => void }) {
  const close = useRef(dismiss);
  close.current = dismiss;
  const duration = item.duration ?? ${portal ? 5000 : 3500};

  useEffect(() => {
    if (!Number.isFinite(duration)${portal ? ' || duration <= 0' : ''}) return;
    const timeout = setTimeout(() => close.current(), duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <View style={styles.notice}>
      <Text accessibilityRole=${portal ? "{item.tone === 'danger' ? 'alert' : 'text'}" : '"text"'}
        accessibilityLiveRegion="polite" style={[styles.text, styles.message]}>{item.message}</Text>
      {item.action ? (
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
          item.action?.onClick();
          ${portal ? '' : 'dismiss();'}
        }}>
          <Text style={styles.text}>{item.action.label}</Text>
        </Pressable>
      ) : null}
      {(item.${portal ? 'closable' : 'dismissible'} ?? true) ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Zamknij komunikat"
          style={styles.button} onPress={dismiss}>
          <Text style={styles.text}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Controls() {
  const { ${add}, clear } = ${hook}();
  const count = useRef(0);
  return (
    <View>
      <Pressable accessibilityRole="button" style={styles.button}
        onPress={() => ${add}({ message: 'Komunikat ' + ++count.current })}>
        <Text>Pokaż komunikat</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.button} onPress={clear}>
        <Text>Wyczyść komunikaty</Text>
      </Pressable>
    </View>
  );
}

export default function Example() {
  return <${provider}><Controls /></${provider}>;
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 240, padding: 16 },
  region: { position: 'absolute', left: 16, right: 16, gap: 8 },
  notice: {
    width: '100%', maxWidth: 420, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 2, minHeight: 48,
    borderRadius: isIOS ? 4 : 8, backgroundColor: isIOS ? '#52575f' : '#323232',
    ...(isIOS
      ? { shadowColor: '#101317', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }
      : { elevation: 4 }),
  },
  text: { color: '#fff', fontSize: isIOS ? 13 : 14 },
  message: { flex: 1 },
  button: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
});
`;
}
