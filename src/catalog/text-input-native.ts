import type { ReactNode } from 'react';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

type TextExample = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  type?: string;
  inputMode?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  passwordToggle?: boolean;
  maxLength?: number;
  characterLimit?: number;
  hardLimit?: boolean;
  mode?: 'fixed' | 'flexible';
  minHeight?: number;
  maxHeight?: number;
};

const inputModes = new Set(['decimal', 'email', 'none', 'numeric', 'search', 'tel', 'text', 'url']);

export function textInputNativeSource(
  name: string,
  args: TextExample,
  platform: NativePlatformChoice,
) {
  const search = name === 'SearchField' || name === 'LandingSearchField';
  const multiline = name === 'TextArea' || name === 'MobileTextArea';
  const secure = !search && !multiline && args.type === 'password';
  const rawMode = search
    ? 'search'
    : (args.inputMode ?? (args.type === 'number' ? 'decimal' : args.type));
  const config = {
    label: textOf(args.label),
    placeholder:
      args.placeholder ?? (name === 'LandingSearchField' ? 'Wyszukaj' : search ? 'Szukaj' : ''),
    helper: textOf(args.error ?? args.hint),
    error: !!args.error,
    initialValue: secure ? '' : String(args.value ?? args.defaultValue ?? ''),
    disabled: !!(args.disabled || args.readOnly),
    clearable: !multiline && !secure && args.clearable !== false,
    clearLabel: args.clearLabel ?? (search ? 'Wyczyść wyszukiwanie' : 'Wyczyść pole'),
    passwordToggle: secure && args.passwordToggle !== false,
    secure,
    search,
    multiline,
    maxLength:
      Number.isInteger(args.maxLength) && args.maxLength! >= 0 ? args.maxLength : undefined,
    characterLimit:
      Number.isInteger(args.characterLimit) && args.characterLimit! >= 0
        ? args.characterLimit
        : null,
    hardLimit: !!args.hardLimit,
    flexible: args.mode === 'flexible',
    minHeight: args.minHeight ?? 48,
    maxHeight: args.maxHeight ?? 128,
  };
  const mode = rawMode && inputModes.has(rawMode) ? rawMode : 'text';
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');

  return `import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const ios = ${ios};

function characters(value: string) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value);
    return Array.from(segments, ({ segment }) => segment);
  }
  return Array.from(value);
}

export default function TextInputExample({ onValueChange, onSubmit, onLimitReached }: {
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onLimitReached?: (over: boolean) => void;
} = {}) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [value, setValue] = useState(config.initialValue);
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(config.minHeight);
  const count = config.characterLimit === null ? 0 : characters(value).length;
  const over = config.characterLimit !== null && count > config.characterLimit;
  const invalid = config.error || over;

  useEffect(() => { onLimitReached?.(over); }, [over, onLimitReached]);

  function change(text: string) {
    const next = config.hardLimit && config.characterLimit !== null
      ? characters(text).slice(0, config.characterLimit).join('') : text;
    setValue(next);
    onValueChange?.(next);
  }

  return (
    <View style={styles.group}>
      {!config.search && !!config.label && <Text style={styles.label}>{config.label}</Text>}
      <View style={[styles.field, config.search && styles.search, config.disabled && styles.disabled,
        invalid && styles.invalid, config.multiline && styles.multiline]}>
        {config.search && <View accessible={false} importantForAccessibility="no" style={styles.searchIcon}>
          <View style={styles.searchCircle} /><View style={styles.searchHandle} />
        </View>}
        <TextInput
          ref={input}
          accessibilityLabel={config.label}
          accessibilityState={{ disabled: config.disabled }}
          editable={!config.disabled}
          placeholder={config.placeholder}
          placeholderTextColor="#656a75"
          value={value}
          onChangeText={change}
          onSubmitEditing={() => onSubmit?.(value)}
          inputMode=${JSON.stringify(mode)}
          returnKeyType={config.search ? 'search' : 'default'}
          secureTextEntry={config.secure && !visible}
          multiline={config.multiline}
          maxLength={${config.maxLength ?? 'undefined'}}
          autoCorrect={!config.search && !config.secure}
          autoCapitalize={config.search || config.secure ? 'none' : 'sentences'}
          onContentSizeChange={config.multiline && config.flexible ? (event) => {
            setHeight(Math.min(config.maxHeight, Math.max(config.minHeight, event.nativeEvent.contentSize.height)));
          } : undefined}
          style={[styles.input, config.multiline && { height: config.flexible ? height : config.maxHeight }]}
        />
        {config.clearable && !config.disabled && !!value && (
          <Pressable accessibilityRole="button" accessibilityLabel={config.clearLabel}
            style={styles.action} hitSlop={4} onPress={() => { change(''); input.current?.focus(); }}>
            <Text style={styles.actionText}>×</Text>
          </Pressable>
        )}
        {config.passwordToggle && !config.disabled && (
          <Pressable accessibilityRole="button" style={styles.action} hitSlop={4}
            onPress={() => setVisible((previous) => !previous)}>
            <Text style={styles.actionText}>{visible ? 'Ukryj hasło' : 'Pokaż hasło'}</Text>
          </Pressable>
        )}
      </View>
      {config.characterLimit !== null && <Text accessibilityLiveRegion="polite"
        accessibilityLabel={count + ' z ' + config.characterLimit + ' znaków'}
        style={over ? styles.error : styles.hint}>{count}/{config.characterLimit}</Text>}
      {!!config.helper && <Text accessibilityLiveRegion={invalid ? 'polite' : 'none'}
        style={invalid ? styles.error : styles.hint}>{config.helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 4 },
  label: { color: '#52575f', fontSize: ios ? 13 : 14 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 56,
    paddingHorizontal: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#808893',
    borderRadius: ios ? 12 : 4 },
  search: { minHeight: ios ? 36 : 56, paddingHorizontal: 12, borderRadius: ios ? 10 : 24,
    borderWidth: 0, backgroundColor: ios ? '#e2e3e9' : '#e7eaed' },
  searchIcon: { position: 'relative', width: 19, height: 19 },
  searchCircle: { width: 14, height: 14, borderWidth: 1.5, borderColor: '#52575f', borderRadius: 7 },
  searchHandle: { position: 'absolute', width: 7, height: 1.5, left: 11, top: 13,
    transform: [{ rotate: '45deg' }], backgroundColor: '#52575f' },
  multiline: { alignItems: 'flex-start' },
  input: { flex: 1, padding: 0, paddingVertical: config.multiline ? 12 : 0,
    textAlignVertical: config.multiline ? 'top' : 'center', fontSize: ios ? 17 : 16, color: '#101317' },
  action: { minWidth: 32, minHeight: 32, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#0452a8', fontWeight: '600' },
  hint: { color: '#52575f', fontSize: 13 },
  error: { color: '#cd3214', fontSize: 13 },
  invalid: { borderColor: '#cd3214', borderWidth: 1 },
  disabled: { opacity: 0.5 },
});
`;
}
