import { createContext, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  copyNativeSource,
  nativePreviewPlatform,
  normalizeNativePlatformChoice,
} from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import './native-preview.css';

export const NativePreviewPreference = createContext<{
  choice: NativePlatformChoice;
  onChoiceChange: (choice: NativePlatformChoice) => void;
} | null>(null);

export function NativePreview({
  children,
  choice: controlledChoice,
  onChoiceChange,
  source,
  className,
}: {
  children: ReactNode;
  choice?: NativePlatformChoice;
  onChoiceChange?: (choice: NativePlatformChoice) => void;
  source?: (choice: NativePlatformChoice, root: HTMLElement) => string | Promise<string>;
  className?: string;
}) {
  const preference = useContext(NativePreviewPreference);
  const [localChoice, setLocalChoice] = useState<NativePlatformChoice>();
  const [result, setResult] = useState<{
    choice: NativePlatformChoice;
    code: string;
    feedback: string;
  }>();
  const [busy, setBusy] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const choice = controlledChoice ?? preference?.choice ?? localChoice ?? 'auto';
  const platform = nativePreviewPlatform(choice);
  const visibleResult = result?.choice === choice ? result : undefined;

  function change(value: NativePlatformChoice) {
    setResult(undefined);
    const update = onChoiceChange ?? preference?.onChoiceChange ?? setLocalChoice;
    update(value);
  }

  async function exportCode() {
    if (!content.current) return;
    setBusy(true);
    setResult(undefined);
    try {
      const text = source
        ? await source(choice, content.current)
        : await copyNativeSource(content.current, choice);
      try {
        await navigator.clipboard.writeText(text);
        setResult({ choice, code: text, feedback: 'Skopiowano kod React Native.' });
      } catch {
        setResult({ choice, code: text, feedback: 'Skopiuj wygenerowany kod z pola poniżej.' });
      }
    } catch {
      setResult({
        choice,
        code: '',
        feedback: 'Brak widocznej treści. Otwórz komponent w podglądzie i spróbuj ponownie.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div
        ref={content}
        data-native-preview-content
        data-mobile-os={platform}
        className={className}
      >
        {children}
      </div>
      <details className="md-native-preview-tools">
        <summary>React Native · {platform === 'ios' ? 'iOS' : 'Android'}</summary>
        <div className="md-native-preview-controls">
          <label>
            System podglądu
            <select
              value={choice}
              disabled={busy}
              onChange={(event) => change(normalizeNativePlatformChoice(event.currentTarget.value))}
            >
              <option value="auto">Auto</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </label>
          <button type="button" disabled={busy} onClick={exportCode}>
            {busy ? 'Generowanie…' : 'Kopiuj kod React Native'}
          </button>
        </div>
        {visibleResult?.feedback && <p role="status">{visibleResult.feedback}</p>}
        {!!visibleResult?.code && (
          <textarea
            readOnly
            aria-label="Wygenerowany kod React Native"
            value={visibleResult.code}
            rows={8}
          />
        )}
      </details>
    </>
  );
}
