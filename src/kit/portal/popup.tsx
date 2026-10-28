import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';

/** Shared positioning for menus, selects and calendars, including transformed dialogs. */
export function usePortalPopup(
  open: boolean,
  align: 'start' | 'end' = 'start',
  matchWidth = false,
) {
  return useFloating({
    open,
    strategy: 'fixed',
    placement: `bottom-${align}`,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, rects, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(0, availableHeight)}px`,
            maxWidth: `${Math.max(0, availableWidth)}px`,
            ...(matchWidth ? { width: `${rects.reference.width}px` } : {}),
          });
        },
      }),
    ],
  });
}

export function PortalPopupLayer({
  anchor,
  children,
}: {
  anchor: HTMLElement | null;
  children: ReactNode;
}) {
  const [scope, setScope] = useState<{
    host: HTMLElement;
    theme: string;
    platform: string;
    style: CSSProperties;
  }>();
  useEffect(() => {
    if (!anchor) return;
    const updateScope = () => {
      const computed = getComputedStyle(anchor);
      const style: Record<string, string> = {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        direction: computed.direction,
        pointerEvents: 'auto',
        display: 'contents',
      };
      for (let index = 0; index < computed.length; index++) {
        const name = computed.item(index);
        if (name.startsWith('--m-') || name.startsWith('--md-'))
          style[name] = computed.getPropertyValue(name);
      }
      setScope({
        // Stay inside a modal's focus boundary, outside its scrolling content.
        host: anchor.closest<HTMLElement>('[role="dialog"]') ?? anchor.ownerDocument.body,
        theme: anchor.closest('[data-theme]')?.getAttribute('data-theme') ?? 'light',
        platform: anchor.closest('[data-platform]')?.getAttribute('data-platform') ?? 'web',
        style,
      });
    };
    updateScope();
    const observer = new MutationObserver(updateScope);
    for (let element: HTMLElement | null = anchor; element; element = element.parentElement)
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-platform', 'style', 'class'],
      });
    return () => observer.disconnect();
  }, [anchor]);
  if (!scope) return null;
  return createPortal(
    <div data-theme={scope.theme} data-platform={scope.platform} style={scope.style}>
      {children}
    </div>,
    scope.host,
  );
}
