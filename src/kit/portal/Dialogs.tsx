import { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import * as Radix from '@radix-ui/react-dialog';
import { X } from './glyphs.js';
import { Button } from '../components.js';
import { portalClass } from './state.js';
export type PortalDialogSize = 'small' | 'medium' | 'large' | 'fit-content' | 'fullscreen';
const DialogContainerContext = createContext<HTMLElement | null | undefined>(undefined);
export function PortalDialogRoot({ children, ...props }: React.ComponentProps<typeof Radix.Root>) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <Radix.Root {...props}>
      <div className="mp-dialog-scope" ref={setContainer}>
        <DialogContainerContext.Provider value={container}>
          {children}
        </DialogContainerContext.Provider>
      </div>
    </Radix.Root>
  );
}
export const PortalDialogTrigger = Radix.Trigger;
export const PortalDialogClose = Radix.Close;
export interface PortalDialogSurfaceProps extends React.ComponentPropsWithoutRef<
  typeof Radix.Content
> {
  size?: PortalDialogSize;
  fitViewport?: boolean;
  closeOnOutside?: boolean;
  closeOnEscape?: boolean;
  container?: HTMLElement | null;
}
export const PortalDialogSurface = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  PortalDialogSurfaceProps
>(function PortalDialogSurface(
  {
    size = 'large',
    fitViewport = true,
    closeOnOutside = true,
    closeOnEscape = true,
    className,
    children,
    onPointerDownOutside,
    onEscapeKeyDown,
    onOpenAutoFocus,
    onCloseAutoFocus,
    container,
    ...props
  },
  ref,
) {
  const local = useContext(DialogContainerContext);
  const returnFocus = useRef<HTMLElement | null>(null);
  if (local === null && container === undefined) return null;
  return (
    <Radix.Portal container={container ?? local ?? undefined}>
      <Radix.Overlay className="mp-dialog-overlay" />
      <Radix.Content
        {...props}
        ref={ref}
        className={portalClass(
          'mp-dialog',
          `mp-dialog--${size}`,
          fitViewport && 'mp-dialog--fit',
          className,
        )}
        onOpenAutoFocus={(e) => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
          onOpenAutoFocus?.(e);
        }}
        onCloseAutoFocus={(e) => {
          onCloseAutoFocus?.(e);
          if (!e.defaultPrevented && returnFocus.current?.isConnected) {
            e.preventDefault();
            returnFocus.current.focus();
          }
        }}
        onPointerDownOutside={(e) => {
          if (!closeOnOutside) e.preventDefault();
          onPointerDownOutside?.(e);
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) e.preventDefault();
          onEscapeKeyDown?.(e);
        }}
      >
        {children}
      </Radix.Content>
    </Radix.Portal>
  );
});
export interface PortalDialogHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  closable?: boolean;
}
export function PortalDialogHeader({
  title,
  description,
  closable = true,
  className,
  ...props
}: PortalDialogHeaderProps) {
  return (
    <header {...props} className={portalClass('mp-dialog-header', className)}>
      <div>
        <Radix.Title>{title}</Radix.Title>
        {description && <Radix.Description>{description}</Radix.Description>}
      </div>
      {closable && (
        <Radix.Close className="mp-plain-button" aria-label="Zamknij">
          <X size={24} />
        </Radix.Close>
      )}
    </header>
  );
}
export const PortalDialogContent = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function PortalDialogContent({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={portalClass('mp-dialog-content', className)} />;
});
export const PortalDialogFooter = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { confirm?: boolean }
>(function PortalDialogFooter({ className, confirm, ...props }, ref) {
  return (
    <footer
      {...props}
      ref={ref}
      className={portalClass('mp-dialog-footer', confirm && 'mp-dialog-footer--confirm', className)}
    />
  );
});
export interface PortalDialogProps extends Pick<
  PortalDialogSurfaceProps,
  'size' | 'fitViewport' | 'closeOnOutside' | 'closeOnEscape'
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closable?: boolean;
}
export function PortalDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  closable,
  ...surface
}: PortalDialogProps) {
  return (
    <PortalDialogRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <Radix.Trigger asChild>{trigger}</Radix.Trigger>}
      <PortalDialogSurface
        {...surface}
        {...(!description ? { 'aria-describedby': undefined } : {})}
      >
        <PortalDialogHeader title={title} description={description} closable={closable} />
        <PortalDialogContent>{children}</PortalDialogContent>
        {footer && <PortalDialogFooter>{footer}</PortalDialogFooter>}
      </PortalDialogSurface>
    </PortalDialogRoot>
  );
}
export interface PortalDialogRequest {
  title: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: PortalDialogSize;
}
interface PortalDialogApi {
  open: (options: PortalDialogRequest) => Promise<boolean>;
  close: (result?: boolean) => void;
  closeAll: (result?: boolean) => void;
}
const DialogContext = createContext<PortalDialogApi | null>(null);
export function usePortalDialog() {
  const value = useContext(DialogContext);
  if (!value) throw new Error('usePortalDialog requires PortalDialogProvider.');
  return value;
}
export function PortalDialogProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<
    Array<{ options: PortalDialogRequest; resolve: (result: boolean) => void }>
  >([]);
  const latest = useRef(queue);
  useEffect(
    () => () => {
      const pending = latest.current;
      latest.current = [];
      pending.forEach((entry) => entry.resolve(false));
    },
    [],
  );
  const close = (result = false) => {
    const [active, ...remaining] = latest.current;
    latest.current = remaining;
    setQueue(remaining);
    active?.resolve(result);
  };
  const closeAll = (result = false) => {
    const pending = latest.current;
    latest.current = [];
    setQueue([]);
    pending.forEach((item) => item.resolve(result));
  };
  const active = queue[0]?.options;
  return (
    <DialogContext.Provider
      value={{
        open: (options) =>
          new Promise((resolve) => {
            latest.current = [...latest.current, { options, resolve }];
            setQueue(latest.current);
          }),
        close,
        closeAll,
      }}
    >
      {children}
      {active && (
        <PortalDialog
          open
          onOpenChange={(open) => {
            if (!open) close(false);
          }}
          title={active.title}
          description={active.description}
          size={active.size}
          footer={
            <>
              <Button variant="secondary" onClick={() => close(false)}>
                {active.cancelLabel ?? 'Anuluj'}
              </Button>
              <Button onClick={() => close(true)}>{active.confirmLabel ?? 'Potwierdź'}</Button>
            </>
          }
        >
          {active.content}
        </PortalDialog>
      )}
    </DialogContext.Provider>
  );
}
