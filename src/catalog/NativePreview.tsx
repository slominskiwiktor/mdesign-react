import { createContext, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  copyNativeSource,
  nativePreviewPlatform,
  normalizeNativePlatformChoice,
} from './native-export.js';
import type { NativePlatformChoice } from './native-export.js';
import './native-preview.css';

export const NativePreviewPreference = createContext<NativePlatformChoice>('auto');

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
  source?: (choice: NativePlatformChoice) => string;
  className?: string;
}) {
  const inheritedChoice = useContext(NativePreviewPreference);
  const [localChoice, setLocalChoice] = useState<NativePlatformChoice>();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const choice = controlledChoice ?? localChoice ?? inheritedChoice;
  const platform = nativePreviewPlatform(choice);

  function change(value: NativePlatformChoice) {
    setCode('');
    setFeedback('');
    if (onChoiceChange) onChoiceChange(value);
    else setLocalChoice(value);
  }

  async function exportCode() {
    if (!content.current) return;
    setBusy(true);
    setFeedback('');
    setCode('');
    try {
      const text = source ? source(choice) : await copyNativeSource(content.current, choice);
      setCode(text);
      try {
        await navigator.clipboard.writeText(text);
        setFeedback('Skopiowano kod React Native.');
      } catch {
        setFeedback('Skopiuj wygenerowany kod z pola poniżej.');
      }
    } catch {
      setFeedback('Brak widocznej treści. Otwórz komponent w podglądzie i spróbuj ponownie.');
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
        {feedback && <p role="status">{feedback}</p>}
        {!!code && (
          <textarea readOnly aria-label="Wygenerowany kod React Native" value={code} rows={8} />
        )}
      </details>
    </>
  );
}
