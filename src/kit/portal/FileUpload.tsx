import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { FileText, UploadCloud, X, RotateCcw } from './glyphs.js';
import { Button, Progress } from '../components.js';
import { usePortalState, portalClass } from './state.js';
import { validatePortalFiles } from './validation.js';
import type { PortalFileRules, PortalFileRejection } from './validation.js';
import { useNativeFormReset } from '../form-reset.js';
export interface PortalImageRules {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}
export interface PortalFileUploadProps extends Omit<PortalFileRules, 'existingFiles'> {
  label: string;
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  onReject?: (rejections: PortalFileRejection[]) => void;
  name?: string;
  id?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  imageRules?: PortalImageRules;
  validateImages?: boolean;
  validateSignatures?: boolean;
  validateAsync?: (file: File) => Promise<string | undefined>;
  upload?: (
    file: File,
    context: { signal: AbortSignal; onProgress: (percent: number) => void },
  ) => Promise<void>;
  onUploaded?: (file: File) => void;
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
}
export interface PortalFileUploadHandle {
  reset: () => void;
  focus: () => void;
  uploadAll: () => Promise<void>;
  cancel: () => void;
  getFiles: () => File[];
}
type UploadState = { status: 'uploading' | 'success' | 'error'; progress: number; error?: string };
async function imageSize(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const image = await createImageBitmap(file);
      const size = { width: image.width, height: image.height };
      image.close();
      return size;
    } catch {
      /* Some valid browser-supported image formats require Image decoding. */
    }
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Nie można odczytać obrazu.'));
    };
    image.src = url;
  });
}
async function validSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const starts = (v: number[]) => v.every((b, i) => bytes[i] === b);
  if (file.type === 'image/png') return starts([137, 80, 78, 71, 13, 10, 26, 10]);
  if (file.type === 'image/jpeg') return starts([255, 216, 255]);
  if (file.type === 'image/gif') return starts([71, 73, 70, 56]);
  if (file.type === 'application/pdf') return starts([37, 80, 68, 70, 45]);
  if (file.type === 'image/webp')
    return starts([82, 73, 70, 70]) && [87, 69, 66, 80].every((b, i) => bytes[8 + i] === b);
  return true;
}
export const PortalFileUpload = /* @__PURE__ */ forwardRef<
  PortalFileUploadHandle,
  PortalFileUploadProps
>(function PortalFileUpload(
  {
    label,
    files,
    defaultFiles = [],
    onFilesChange,
    onReject,
    name,
    id,
    hint,
    error,
    disabled,
    multiple = true,
    imageRules,
    validateImages,
    validateSignatures,
    validateAsync,
    upload,
    onUploaded,
    className,
    inputRef,
    ...rules
  },
  ref,
) {
  const [current, setCurrent] = usePortalState(files, defaultFiles, onFilesChange);
  const [rejections, setRejections] = useState<PortalFileRejection[]>([]);
  const [statuses, setStatuses] = useState<Record<string, UploadState>>({});
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const choose = useRef<HTMLButtonElement>(null);
  const active = useRef(new Map<string, AbortController>());
  const generation = useRef(0);
  const alive = useRef(true);
  const latest = useRef(current);
  latest.current = current;
  const keys = useRef(new WeakMap<File, string>());
  const seq = useRef(0);
  const generated = useId();
  const inputId = id ?? generated;
  const key = (file: File) => {
    let k = keys.current.get(file);
    if (!k) {
      k = String(++seq.current);
      keys.current.set(file, k);
    }
    return k;
  };
  function cancel() {
    active.current.forEach((c) => c.abort());
    active.current.clear();
    setStatuses((s) =>
      Object.fromEntries(
        Object.entries(s).map(([k, v]) => [
          k,
          v.status === 'uploading'
            ? { status: 'error', progress: v.progress, error: 'Wysyłanie anulowane.' }
            : v,
        ]),
      ),
    );
  }
  function clearUploadState() {
    generation.current++;
    active.current.forEach((controller) => controller.abort());
    active.current.clear();
    setStatuses({});
    setRejections([]);
    setChecking(false);
    setAttempted(false);
    if (input.current) input.current.value = '';
  }
  function reset() {
    clearUploadState();
    setCurrent([]);
  }
  useEffect(() => {
    const controllers = active.current;
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current += 1;
      controllers.forEach((c) => c.abort());
    };
  }, []);
  useNativeFormReset(input, () => {
    clearUploadState();
    if (files === undefined) setCurrent(defaultFiles);
  });
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const serialize = (event: FormDataEvent) => {
      if (!name || disabled || input.current?.matches(':disabled')) return;
      for (const file of latest.current) event.formData.append(name, file, file.name);
    };
    form.addEventListener('formdata', serialize);
    return () => {
      form.removeEventListener('formdata', serialize);
    };
  });
  useEffect(() => {
    input.current?.setCustomValidity(
      rules.required && !current.length ? 'Dodaj co najmniej jeden plik.' : '',
    );
  }, [rules.required, current.length]);
  async function add(incoming: File[]) {
    if (disabled || checking) return;
    const token = ++generation.current;
    const result = validatePortalFiles(multiple ? incoming : incoming.slice(0, 1), {
      ...rules,
      maxFiles: multiple ? rules.maxFiles : 1,
      existingFiles: multiple ? latest.current : [],
    });
    const rejected = [...result.rejected];
    setChecking(true);
    const accepted: File[] = [];
    try {
      for (const file of result.accepted) {
        let issue: string | undefined;
        try {
          if (validateSignatures && !(await validSignature(file)))
            issue = 'Zawartość pliku nie odpowiada podanemu formatowi.';
          if (
            !issue &&
            (validateImages || imageRules) &&
            (file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name))
          ) {
            const size = await imageSize(file);
            if (
              imageRules &&
              ((imageRules.minWidth !== undefined && size.width < imageRules.minWidth) ||
                (imageRules.minHeight !== undefined && size.height < imageRules.minHeight) ||
                (imageRules.maxWidth !== undefined && size.width > imageRules.maxWidth) ||
                (imageRules.maxHeight !== undefined && size.height > imageRules.maxHeight))
            )
              issue = 'Wymiary obrazu nie spełniają wymagań.';
          }
          if (!issue) issue = await validateAsync?.(file);
        } catch {
          issue = 'Plik jest uszkodzony lub nie można go odczytać.';
        }
        if (issue) rejected.push({ file, code: 'custom', message: issue });
        else accepted.push(file);
      }
      if (!alive.current || generation.current !== token) return;
      setCurrent(multiple ? [...latest.current, ...accepted] : accepted);
      setRejections(rejected);
      if (rejected.length) onReject?.(rejected);
    } finally {
      if (alive.current && generation.current === token) {
        setChecking(false);
        setAttempted(false);
        if (input.current) input.current.value = '';
      }
    }
  }
  async function send(file: File) {
    if (!upload || disabled) return;
    const k = key(file);
    if (active.current.has(k)) return;
    const controller = new AbortController();
    active.current.set(k, controller);
    setStatuses((s) => ({ ...s, [k]: { status: 'uploading', progress: 0 } }));
    try {
      await upload(file, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (!controller.signal.aborted && alive.current)
            setStatuses((s) => ({
              ...s,
              [k]: { status: 'uploading', progress: Math.max(0, Math.min(100, progress)) },
            }));
        },
      });
      if (!controller.signal.aborted && alive.current) {
        setStatuses((s) => ({ ...s, [k]: { status: 'success', progress: 100 } }));
        onUploaded?.(file);
      }
    } catch (e) {
      if (!controller.signal.aborted && alive.current)
        setStatuses((s) => ({
          ...s,
          [k]: {
            status: 'error',
            progress: 0,
            error: e instanceof Error ? e.message : 'Nie udało się wysłać pliku.',
          },
        }));
    } finally {
      active.current.delete(k);
    }
  }
  async function uploadAll() {
    await Promise.all(latest.current.map(send));
  }
  useImperativeHandle(ref, () => ({
    reset,
    focus: () => choose.current?.focus(),
    uploadAll,
    cancel,
    getFiles: () => [...latest.current],
  }));
  const issue =
    error ||
    (rules.required && !current.length && (attempted || rejections.length)
      ? 'Dodaj co najmniej jeden plik.'
      : undefined);
  return (
    <div
      className={portalClass(
        'mp-file-upload',
        dragging && 'mp-file-upload--dragging',
        disabled && 'mp-disabled',
        className,
      )}
      aria-busy={checking || undefined}
    >
      <label htmlFor={inputId}>
        {label}
        {rules.required && <span aria-hidden="true"> *</span>}
      </label>
      <div
        className="mp-file-drop"
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) void add(Array.from(e.dataTransfer.files));
        }}
      >
        <UploadCloud className="mp-file-drop-icon" size={32} aria-hidden="true" />
        <p>Przeciągnij i upuść {multiple ? 'pliki' : 'plik'} lub</p>
        <input
          ref={(node) => {
            input.current = node;
            if (typeof inputRef === 'function') inputRef(node);
            else if (inputRef) inputRef.current = node;
          }}
          className="mp-sr"
          id={inputId}
          type="file"
          data-field-name={name}
          multiple={multiple}
          accept={rules.accept}
          disabled={disabled || checking}
          required={rules.required && !current.length}
          aria-describedby={`${inputId}-help`}
          aria-invalid={!!issue || undefined}
          onInvalid={(e) => {
            e.preventDefault();
            setAttempted(true);
            choose.current?.focus();
          }}
          onChange={(e) => void add(Array.from(e.target.files ?? []))}
        />
        <Button
          ref={choose}
          variant="secondary"
          disabled={disabled || checking}
          onClick={() => input.current?.click()}
        >
          Wybierz {multiple ? 'pliki' : 'plik'}
        </Button>
        <p className="mp-helper" id={`${inputId}-help`}>
          {hint ??
            [
              rules.accept ? `Formaty: ${rules.accept}.` : null,
              rules.maxFileSize
                ? `Maksymalny rozmiar: ${(rules.maxFileSize / 1024 / 1024).toLocaleString('pl', { maximumFractionDigits: 1 })} MB.`
                : null,
            ]
              .filter(Boolean)
              .join(' ')}
        </p>
      </div>
      {checking && <p role="status">Sprawdzanie plików…</p>}
      {issue && (
        <p className="mp-field-error" role="alert">
          {issue}
        </p>
      )}
      {rejections.length > 0 && (
        <ul className="mp-file-errors" aria-label="Odrzucone pliki" role="alert">
          {rejections.map((r, i) => (
            <li key={i}>
              {r.file.name}: {r.message}
            </li>
          ))}
        </ul>
      )}
      {current.length > 0 && (
        <ul className="mp-file-list">
          {current.map((file) => {
            const k = key(file),
              state = statuses[k];
            return (
              <li key={k}>
                <FileText size={24} aria-hidden="true" />
                <div>
                  <strong>{file.name}</strong>
                  <small>
                    {(file.size / 1024).toLocaleString('pl', { maximumFractionDigits: 1 })} kB
                  </small>
                  {state?.status === 'uploading' && (
                    <Progress value={state.progress} label={`Wysyłanie ${file.name}`} />
                  )}
                  <span role="status">
                    {state?.status === 'success' ? 'Wysłano' : state?.error}
                  </span>
                </div>
                {upload && state?.status === 'error' && (
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Ponów wysyłanie ${file.name}`}
                    onClick={() => void send(file)}
                  >
                    <RotateCcw size={20} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Usuń ${file.name}`}
                  onClick={() => {
                    active.current.get(k)?.abort();
                    active.current.delete(k);
                    setStatuses((s) => {
                      const next = { ...s };
                      delete next[k];
                      return next;
                    });
                    setCurrent(current.filter((f) => f !== file));
                  }}
                >
                  <X size={20} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {current.length > 0 && (
        <div className="mp-file-actions">
          {upload && (
            <Button
              disabled={
                disabled ||
                checking ||
                Object.values(statuses).some((v) => v.status === 'uploading')
              }
              onClick={() => void uploadAll()}
            >
              Wyślij pliki
            </Button>
          )}
          <Button variant="tertiary" disabled={disabled} onClick={reset}>
            Wyczyść listę
          </Button>
        </div>
      )}
    </div>
  );
});
