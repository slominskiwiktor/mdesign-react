import { isValidElement } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { PortalFormFieldProps } from '../kit/portal/Forms.js';
import { textOf } from './native-example-text.js';
import type { NativePlatformChoice } from './native-export.js';

export function formFieldNativeSource(
  args: Partial<PortalFormFieldProps>,
  platform: NativePlatformChoice,
) {
  const child = isValidElement<InputHTMLAttributes<HTMLInputElement>>(args.children)
    ? args.children
    : undefined;
  const input = child?.props;
  const config = {
    label: textOf(args.label) || input?.['aria-label'] || 'Pole formularza',
    hint: textOf(args.hint),
    error: textOf(args.error),
    placeholder: input?.placeholder ?? '',
    initial: input?.type === 'password' ? '' : String(input?.value ?? input?.defaultValue ?? ''),
    required: input?.required ?? args.required ?? false,
    disabled: input?.disabled ?? args.disabled ?? false,
    readOnly: !!input?.readOnly,
    multiline: child?.type === 'textarea',
    secure: input?.type === 'password',
    maxLength:
      typeof input?.maxLength === 'number' && input.maxLength >= 0 ? input.maxLength : null,
  };
  const ios = platform === 'auto' ? "Platform.OS === 'ios'" : String(platform === 'ios');
  return `import { useState } from 'react';
import type { ReactNode } from 'react';
import { ${platform === 'auto' ? 'Platform, ' : ''}StyleSheet, Text, TextInput, View } from 'react-native';

const config = ${JSON.stringify(config, null, 2)};
const isIOS = ${ios};

type Field = {
  value: string; label: string; description: string; disabled: boolean;
  readOnly: boolean; invalid: boolean; required: boolean;
  onValueChange: (value: string) => void; onBlur: () => void;
};
type Props = {
  value?: string; error?: string; onValueChange?: (value: string) => void;
  renderInput?: (field: Field) => ReactNode;
};

export default function Example({ value, error = config.error, onValueChange, renderInput }: Props = {}) {
  const [localValue, setLocalValue] = useState(config.initial);
  const [touched, setTouched] = useState(false);
  const current = value ?? localValue;
  const message = error || (touched && config.required && !current.trim() ? 'Uzupełnij wymagane pole.' : '');
  const description = message || config.hint;

  function change(next: string) {
    if (config.disabled || config.readOnly) return;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }
  const field: Field = {
    value: current, label: config.label, description, disabled: config.disabled,
    readOnly: config.readOnly, invalid: !!message, required: config.required, onValueChange: change, onBlur: () => setTouched(true),
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{config.label}{config.required ? ' *' : ''}</Text>
      {renderInput ? renderInput(field) : (
        <TextInput accessibilityLabel={config.label + (config.required ? ', pole wymagane' : '')}
          accessibilityHint={description || undefined} accessibilityState={{ disabled: config.disabled }}
          editable={!config.disabled && !config.readOnly}
          placeholder={config.placeholder} placeholderTextColor="#626872"
          value={current} onChangeText={change} onBlur={field.onBlur}
          multiline={config.multiline} secureTextEntry={config.secure && !config.multiline}
          maxLength={config.maxLength ?? undefined}
          style={[styles.input, config.multiline && styles.multiline,
            config.disabled && styles.disabled, !!message && styles.invalid]}
        />
      )}
      {message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text>
        : config.hint ? <Text style={styles.hint}>{config.hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: '#161b22', fontWeight: '600', fontSize: 14 },
  input: { minHeight: isIOS ? 56 : 48, borderRadius: isIOS ? 8 : 4,
    borderWidth: 1, borderColor: '#767c84', padding: 12, color: '#161b22', backgroundColor: '#fff' },
  multiline: { minHeight: 104, textAlignVertical: 'top' },
  disabled: { backgroundColor: '#f0f2f5' },
  invalid: { borderColor: '#b31225' },
  error: { color: '#b31225', fontSize: 13 },
  hint: { color: '#52575f', fontSize: 13 },
});
`;
}
