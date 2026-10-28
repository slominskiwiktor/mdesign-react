import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PortalCatalog } from './PortalCatalog.js';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  location.hash = '';
});

describe('portal catalog preview boundary', () => {
  it('keeps queued dialogs and snackbars in the light preview inside dark documentation', async () => {
    const user = userEvent.setup();
    render(
      <div data-theme="dark">
        <PortalCatalog />
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Potwierdzenie' }));
    const dialog = await screen.findByRole('dialog', { name: 'Zapisz zmiany' });
    expect(dialog.closest('[data-theme]')).toHaveAttribute('data-theme', 'light');
    await user.click(within(dialog).getByRole('button', { name: 'Anuluj' }));
    await user.click(screen.getByRole('button', { name: 'Dodaj komunikat' }));
    const example = screen.getByRole('region', { name: 'Menu, chipy i powiadomienia' });
    const notifications = within(example).getByLabelText('Powiadomienia');
    const snackbar = within(notifications)
      .getByText('Dane zostały zapisane.')
      .closest('[role="status"]');
    expect(snackbar).toBeInTheDocument();
    expect(snackbar?.closest('[data-theme]')).toHaveAttribute('data-theme', 'light');
  });

  it('navigates to a focusable section without replacing the catalog hash route', async () => {
    const user = userEvent.setup();
    location.hash = '#portal-kit';
    render(<PortalCatalog />);
    const index = screen.getByRole('navigation', { name: 'Komponenty portalu' });
    await user.click(within(index).getByRole('link', { name: 'Części formularza' }));
    const destination = screen.getByRole('region', { name: 'Części formularza' });
    expect(location.hash).toBe('#portal-kit');
    await waitFor(() => expect(destination).toHaveFocus());
    expect(destination.scrollIntoView).toHaveBeenCalled();
  });

  it('hosts the full portal shell in a named preview document while its own controls remain local', async () => {
    const user = userEvent.setup();
    const { container } = render(<PortalCatalog />);
    const frame = screen.getByTitle('Interaktywny podgląd powłoki portalu mObywatel');
    expect(frame).toBeInstanceOf(HTMLIFrameElement);
    expect(frame).toHaveAttribute('src', '/preview/portal-shell');
    // A separate browsing context owns fixed overlays, focus traps and scroll.
    // Viewport geometry and actual frame navigation are verified in the browser.
    expect(container.querySelector('.mp-shell')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Opcje dokumentu' }));
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Otwórz' }));
    expect(screen.getByText('Wybrano dokument.')).toBeVisible();
  });
});
