import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '../components.js';
import { OfficialIcon } from '../OfficialIcon.js';
import { NativeIcon } from '../NativeIcon.js';
import { validatePortalFiles } from '../portal/validation.js';
import type { PortalFileRules, PortalFileRejection } from '../portal/validation.js';
import { FieldError, FieldHelper } from './inputs.js';
import { NativeSingleCard, MobileTextButton } from './content.js';
import { mobileClass, useMobileValue } from './shared.js';
import { useNativeFormReset } from '../form-reset.js';

export interface MobileModalProps {
  title: ReactNode;
  description?: ReactNode;
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  actions?: ReactNode;
  closeLabel?: string;
  className?: string;
}
export interface MobileDialogProps extends MobileModalProps {
  variant?: 'text' | 'icon' | 'three-buttons' | 'native-alert';
  icon?: ReactNode;
}
export function MobileDialog({
  title,
  description,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  children,
  actions,
  closeLabel = 'Zamknij',
  className,
  variant = 'text',
  icon,
}: MobileDialogProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <RadixDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <div className={mobileClass('modal-scope')} ref={setContainer}>
        {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
        {container && (
          <RadixDialog.Portal container={container}>
            <RadixDialog.Overlay className="m-mobile-modal-overlay" />
            <RadixDialog.Content
              className={mobileClass('dialog', className)}
              data-variant={variant}
              onOpenAutoFocus={() => {
                previousFocus.current =
                  document.activeElement instanceof HTMLElement ? document.activeElement : null;
              }}
              onCloseAutoFocus={(e) => {
                if (!trigger && previousFocus.current?.isConnected) {
                  e.preventDefault();
                  previousFocus.current.focus();
                }
              }}
            >
              <RadixDialog.Close className="m-mobile-modal-close" aria-label={closeLabel}>
                <NativeIcon name="close" size={24} />
              </RadixDialog.Close>
              {icon && (
                <div className="m-mobile-dialog-icon" aria-hidden="true">
                  {icon}
                </div>
              )}
              <RadixDialog.Title>{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description>{description}</RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="m-mobile-sr">
                  Okno dialogowe
                </RadixDialog.Description>
              )}
              {children && <div className="m-mobile-dialog-body">{children}</div>}
              {actions && <div className="m-mobile-dialog-actions">{actions}</div>}
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </div>
    </RadixDialog.Root>
  );
}
export const MobileDialogClose = RadixDialog.Close;
export interface BottomSheetProps extends MobileModalProps {
  state?: 'expanded' | 'half-expanded' | 'hidden';
  onStateChange?: (state: 'expanded' | 'half-expanded' | 'hidden') => void;
  allowHalfExpanded?: boolean;
  dismissible?: boolean;
}
export function BottomSheet({
  title,
  description,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  children,
  actions,
  closeLabel = 'Zamknij',
  className,
  state,
  onStateChange,
  allowHalfExpanded = false,
  dismissible = true,
}: BottomSheetProps) {
  const [isOpen, setOpen] = useMobileValue(
    open ?? (state ? state !== 'hidden' : undefined),
    defaultOpen ?? false,
    onOpenChange,
  );
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  function change(next: boolean) {
    setOpen(next);
    onStateChange?.(next ? (allowHalfExpanded ? 'half-expanded' : 'expanded') : 'hidden');
  }
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={change}>
      <div className={mobileClass('modal-scope')} ref={setContainer}>
        {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
        {container && (
          <RadixDialog.Portal container={container}>
            <RadixDialog.Overlay className="m-mobile-modal-overlay" />
            <RadixDialog.Content
              className={mobileClass('bottom-sheet', className)}
              data-half={state === 'half-expanded'}
              onOpenAutoFocus={() => {
                previousFocus.current =
                  document.activeElement instanceof HTMLElement ? document.activeElement : null;
              }}
              onCloseAutoFocus={(e) => {
                if (!trigger && previousFocus.current?.isConnected) {
                  e.preventDefault();
                  previousFocus.current.focus();
                }
              }}
              style={{
                transform: drag ? 'translateY(' + drag + 'px)' : undefined,
              }}
              onEscapeKeyDown={(e) => {
                if (!dismissible) e.preventDefault();
              }}
              onPointerDownOutside={(e) => {
                if (!dismissible) e.preventDefault();
              }}
            >
              <div
                className="m-mobile-sheet-handle-area"
                onPointerDown={(e) => {
                  if (!dismissible) return;
                  start.current = e.clientY;
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (start.current !== null) setDrag(Math.max(0, e.clientY - start.current));
                }}
                onPointerUp={() => {
                  if (drag > 80) change(false);
                  start.current = null;
                  setDrag(0);
                }}
                onPointerCancel={() => {
                  start.current = null;
                  setDrag(0);
                }}
              >
                <span className="m-mobile-sheet-handle" />
              </div>
              <div className="m-mobile-sheet-header">
                <RadixDialog.Title>{title}</RadixDialog.Title>
                {dismissible && (
                  <RadixDialog.Close aria-label={closeLabel}>
                    <NativeIcon name="close" size={24} />
                  </RadixDialog.Close>
                )}
              </div>
              {description ? (
                <RadixDialog.Description>{description}</RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="m-mobile-sr">
                  Arkusz z dodatkowymi opcjami
                </RadixDialog.Description>
              )}
              <div className="m-mobile-sheet-body">{children}</div>
              {actions && <div className="m-mobile-sheet-actions">{actions}</div>}
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </div>
    </RadixDialog.Root>
  );
}
export interface MobileMenuItem {
  label: string;
  onSelect: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}
export interface MobileMenuProps {
  label: string;
  trigger?: ReactNode;
  items: MobileMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
export function MobileMenu({
  label,
  trigger = '•••',
  items,
  open,
  onOpenChange,
  className,
}: MobileMenuProps) {
  const [visible, setVisible] = useMobileValue(open, false, onOpenChange);
  const id = useId();
  const root = useRef<HTMLDivElement>(null),
    anchor = useRef<HTMLButtonElement>(null),
    buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const typed = useRef(''),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enabled = items.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const firstEnabled = enabled[0];
  const close = useCallback(
    (restore = true) => {
      setVisible(false);
      if (restore) anchor.current?.focus();
    },
    [setVisible],
  );
  useEffect(() => {
    if (visible && firstEnabled !== undefined) {
      setActive(firstEnabled);
      buttons.current[firstEnabled]?.focus();
    }
  }, [visible, firstEnabled]); // A new menu starts at its first enabled item.
  useEffect(() => {
    if (!visible) return;
    const dismiss = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [visible, close]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className={mobileClass('menu', className)} ref={root}>
      <button
        ref={anchor}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={visible}
        aria-controls={visible ? id : undefined}
        className="m-mobile-menu-trigger"
        onClick={() => setVisible(!visible)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setVisible(true);
          }
        }}
      >
        {trigger}
      </button>
      {visible && (
        <div
          id={id}
          role="menu"
          aria-label={label}
          className="m-mobile-menu-popup"
          onKeyDown={(e) => {
            let index: number | undefined;
            const pos = enabled.indexOf(active);
            if (e.key === 'Escape') {
              e.preventDefault();
              close();
            } else if (e.key === 'Tab') close(false);
            else if (e.key === 'ArrowDown') index = enabled[(pos + 1) % enabled.length];
            else if (e.key === 'ArrowUp')
              index = enabled[(pos - 1 + enabled.length) % enabled.length];
            else if (e.key === 'Home') index = enabled[0];
            else if (e.key === 'End') index = enabled.at(-1);
            else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
              typed.current += e.key.toLocaleLowerCase('pl');
              clearTimeout(timer.current);
              timer.current = setTimeout(() => {
                typed.current = '';
              }, 500);
              index = enabled.find((i) =>
                items[i].label.toLocaleLowerCase('pl').startsWith(typed.current),
              );
            }
            if (index !== undefined) {
              e.preventDefault();
              setActive(index);
              buttons.current[index]?.focus();
            }
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              ref={(node) => {
                buttons.current[i] = node;
              }}
              role="menuitem"
              tabIndex={i === active ? 0 : -1}
              disabled={item.disabled}
              data-destructive={item.destructive}
              onFocus={() => setActive(i)}
              onClick={() => {
                item.onSelect();
                close();
              }}
            >
              {item.leading && <span aria-hidden="true">{item.leading}</span>}
              <span>{item.label}</span>
              {item.trailing && <span aria-hidden="true">{item.trailing}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export interface MobileDropdownProps {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
}
export function MobileDropdown({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Wybierz',
  hint,
  error,
  disabled,
  className,
}: MobileDropdownProps) {
  const [selected, setSelected] = useMobileValue(value, defaultValue, onValueChange),
    [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  return (
    <div className={mobileClass('dropdown-field', className)}>
      <span id={id}>{label}</span>
      <BottomSheet
        title={label}
        open={open && !disabled}
        onOpenChange={(next) => setOpen(!disabled && next)}
        trigger={
          <button
            type="button"
            className="m-mobile-dropdown-trigger"
            disabled={disabled}
            aria-labelledby={id}
            aria-invalid={!!error}
            aria-describedby={error || hint ? id + '-description' : undefined}
          >
            <span data-placeholder={!selected}>
              {options.find((o) => o.value === selected)?.label ?? placeholder}
            </span>
            <NativeIcon name="chevron-down" size={24} />
          </button>
        }
      >
        <div className="m-mobile-dropdown-options" role="group" aria-label={label}>
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              disabled={disabled || o.disabled}
              aria-pressed={o.value === selected}
              onClick={() => {
                if (disabled || o.disabled) return;
                setSelected(o.value);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              {o.value === selected && <NativeIcon name="check" size={24} />}
            </button>
          ))}
        </div>
      </BottomSheet>
      {error ? (
        <FieldError id={id + '-description'}>{error}</FieldError>
      ) : hint ? (
        <FieldHelper id={id + '-description'}>{hint}</FieldHelper>
      ) : null}
    </div>
  );
}
export interface ResultModalProps extends Omit<MobileModalProps, 'children' | 'actions'> {
  icon: ReactNode;
  data: { label: ReactNode; value: ReactNode }[];
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  tertiaryAction?: ReactNode;
}
export function ResultModal({
  icon,
  data,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  ...props
}: ResultModalProps) {
  return (
    <MobileDialog
      {...props}
      variant="icon"
      icon={icon}
      className={'m-mobile-result-modal ' + (props.className ?? '')}
      actions={
        <>
          {primaryAction}
          {secondaryAction}
          {tertiaryAction}
        </>
      }
    >
      <dl className="m-mobile-result-data">
        {data.map((item, i) => (
          <div key={i}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </MobileDialog>
  );
}
export interface SnackbarMessage {
  id?: string;
  message: ReactNode;
  action?: { label: string; onClick: () => void };
  duration?: number;
  dismissible?: boolean;
}
export interface MobileSnackbarProps extends SnackbarMessage {
  onDismiss: () => void;
  className?: string;
}
export function MobileSnackbar({
  message,
  action,
  duration = 3500,
  dismissible = true,
  onDismiss,
  className,
}: MobileSnackbarProps) {
  const [paused, setPaused] = useState(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  const remaining = useRef(duration),
    started = useRef(0);
  useEffect(() => {
    remaining.current = duration;
  }, [duration, message]);
  useEffect(() => {
    if (paused || duration === Infinity) return;
    started.current = Date.now();
    const timer = setTimeout(() => dismissRef.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
    };
  }, [paused, duration, message]);
  return (
    <div
      className={mobileClass('snackbar', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <span role="status">{message}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button type="button" aria-label="Zamknij powiadomienie" onClick={onDismiss}>
          <NativeIcon name="close" size={24} />
        </button>
      )}
    </div>
  );
}
interface SnackbarApi {
  show: (message: SnackbarMessage) => string;
  dismiss: (id?: string) => void;
  clear: () => void;
}
const SnackbarContext = createContext<SnackbarApi | null>(null);
export function SnackbarProvider({
  children,
  maxVisible = 1,
}: {
  children: ReactNode;
  maxVisible?: number;
}) {
  const [queue, setQueue] = useState<(SnackbarMessage & { id: string; instance: number })[]>([]);
  const counter = useRef(0);
  const show = useCallback((message: SnackbarMessage) => {
    const instance = ++counter.current;
    const id = message.id ?? 'snackbar-' + instance;
    setQueue((q) => [...q.filter((m) => m.id !== id), { ...message, id, instance }]);
    return id;
  }, []);
  const dismiss = useCallback(
    (id?: string) => setQueue((q) => (id ? q.filter((m) => m.id !== id) : q.slice(1))),
    [],
  );
  const clear = useCallback(() => setQueue([]), []);
  return (
    <SnackbarContext.Provider value={{ show, dismiss, clear }}>
      {children}
      <div className="m-mobile-snackbar-host">
        {queue.slice(0, Math.max(1, maxVisible)).map((m) => (
          <MobileSnackbar key={m.instance} {...m} onDismiss={() => dismiss(m.id)} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar requires SnackbarProvider');
  return context;
}
export interface FileSourceItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  disabled?: boolean;
}
export function FileSourceItem({
  icon,
  label,
  description,
  onClick,
  disabled,
}: FileSourceItemProps) {
  return (
    <NativeSingleCard
      title={label}
      description={description}
      icon={icon}
      iconSize={24}
      onClick={onClick}
      disabled={disabled}
    />
  );
}
function MobileFileThumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => {
      URL.revokeObjectURL(next);
    };
  }, [file]);
  return url ? (
    <img className="m-mobile-file-thumbnail" src={url} alt="" onError={() => setUrl(undefined)} />
  ) : (
    <NativeIcon name="documents" size={32} />
  );
}
export interface MobileFilePickerProps extends Omit<PortalFileRules, 'existingFiles'> {
  label: string;
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  onRejected?: (rejected: PortalFileRejection[]) => void;
  requirements?: string[];
  error?: ReactNode;
  disabled?: boolean;
  onPreview?: (file: File) => void;
  onRequestSource?: (add: (files: File[]) => void) => void;
  className?: string;
}
export function MobileFilePicker({
  label,
  files,
  defaultFiles = [],
  onFilesChange,
  onRejected,
  requirements = [],
  error,
  disabled,
  onPreview,
  onRequestSource,
  className,
  ...rules
}: MobileFilePickerProps) {
  const [selected, setSelected, resetSelected] = useMobileValue(files, defaultFiles, onFilesChange);
  const [issues, setIssues] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const filesRef = useRef(selected);
  filesRef.current = selected;
  useEffect(() => {
    input.current?.setCustomValidity(
      rules.required && !disabled && !selected.length ? 'Dodaj co najmniej jeden plik.' : '',
    );
  }, [rules.required, disabled, selected.length]);
  useNativeFormReset(input, () => {
    resetSelected();
    if (files === undefined) filesRef.current = defaultFiles;
    setIssues([]);
    setAttempted(false);
  });
  const add = (incoming: File[]) => {
    const current = filesRef.current;
    const result = validatePortalFiles(incoming, {
      ...rules,
      existingFiles: current,
    });
    if (result.accepted.length) {
      const next = [...current, ...result.accepted];
      if (files === undefined) filesRef.current = next;
      setSelected(next);
    }
    setIssues(result.rejected.map((r) => r.file.name + ': ' + r.message));
    if (result.rejected.length) onRejected?.(result.rejected);
  };
  const canAdd = rules.maxFiles === undefined || selected.length < rules.maxFiles;
  const requiredIssue =
    rules.required && !selected.length && attempted ? 'Dodaj co najmniej jeden plik.' : undefined;
  const describedBy =
    [
      requirements.length ? id + '-requirements' : undefined,
      error || requiredIssue ? id + '-error' : undefined,
      issues.length ? id + '-issues' : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <div className={mobileClass('file-picker', className)} role="group" aria-labelledby={id}>
      <div id={id} className="m-mobile-field-label">
        {label}
        {rules.required && <span aria-hidden="true"> *</span>}
      </div>
      <input
        ref={input}
        className="m-mobile-sr"
        type="file"
        tabIndex={-1}
        aria-label={label}
        aria-required={rules.required || undefined}
        aria-invalid={!!error || !!requiredIssue || !!issues.length || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        required={!!rules.required && !selected.length}
        accept={rules.accept}
        multiple={rules.maxFiles !== 1}
        onInvalid={(event) => {
          event.preventDefault();
          setAttempted(true);
          addButton.current?.focus();
        }}
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      <div className="m-mobile-file-list">
        {selected.map((file, index) => (
          <div
            key={file.name + '-' + file.lastModified + '-' + index}
            className="m-mobile-file-row"
          >
            <button
              type="button"
              disabled={disabled || !onPreview}
              onClick={() => onPreview?.(file)}
              aria-label={'Podgląd: ' + file.name}
            >
              <MobileFileThumbnail file={file} />
              <span>
                <strong>{file.name}</strong>
                <small>{Math.ceil(file.size / 1024)} KB</small>
              </span>
            </button>
            <button
              type="button"
              aria-label={'Usuń plik: ' + file.name}
              disabled={disabled}
              onClick={() => setSelected(selected.filter((_, i) => i !== index))}
            >
              <OfficialIcon name="Icons/Outline/Symbols/AA002_Delete/AA002_Delete" size={24} />
            </button>
          </div>
        ))}
      </div>
      {canAdd && (
        <button
          type="button"
          ref={addButton}
          className="m-mobile-file-add"
          disabled={disabled}
          aria-describedby={describedBy}
          onClick={() => (onRequestSource ? onRequestSource(add) : input.current?.click())}
        >
          <NativeIcon name="plus" size={24} />
          Dodaj plik
        </button>
      )}
      {requirements.length > 0 && (
        <ul id={id + '-requirements'} className="m-mobile-file-requirements">
          {requirements.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      {(error || requiredIssue) && (
        <FieldError id={id + '-error'}>{error || requiredIssue}</FieldError>
      )}
      {issues.length > 0 && (
        <FieldError id={id + '-issues'}>
          {issues.map((issue, i) => (
            <span key={i}>
              {issue}
              <br />
            </span>
          ))}
        </FieldError>
      )}
    </div>
  );
}
export function MobileDialogActions({
  onConfirm,
  onCancel,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  destructive = false,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}) {
  return (
    <>
      <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <MobileTextButton onClick={onCancel}>{cancelLabel}</MobileTextButton>
    </>
  );
}
