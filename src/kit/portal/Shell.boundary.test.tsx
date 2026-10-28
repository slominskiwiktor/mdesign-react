import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PortalShell } from './Shell.js';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const navigation = [
  { id: 'home', label: 'Strona główna', href: '/home' },
  { id: 'help', label: 'Pomoc', href: '/help' },
];

describe('portal shell inside another application', () => {
  it('keeps each drawer in its own shell and returns focus to its own opener', async () => {
    const user = userEvent.setup();
    const hostAction = vi.fn();
    render(
      <div>
        <header>
          <button onClick={hostAction}>Nawigacja dokumentacji</button>
        </header>
        <section aria-label="Podgląd A">
          <PortalShell navigation={navigation}>
            <p>Pierwszy przykład</p>
          </PortalShell>
        </section>
        <section aria-label="Podgląd B" data-theme="dark">
          <PortalShell navigation={navigation}>
            <p>Drugi przykład</p>
          </PortalShell>
        </section>
      </div>,
    );
    const first = screen.getByRole('region', { name: 'Podgląd A' });
    const second = screen.getByRole('region', { name: 'Podgląd B' });
    const firstOpener = within(first).getByRole('button', { name: 'Menu' });
    const secondOpener = within(second).getByRole('button', { name: 'Menu' });
    await user.click(secondOpener);
    const drawer = await screen.findByRole('dialog', { name: 'Nawigacja główna' });
    expect(second).toContainElement(drawer);
    expect(drawer.closest('.mp-shell')).toBe(secondOpener.closest('.mp-shell'));
    expect(drawer.closest('[data-theme="dark"]')).toBe(second);
    expect(first).not.toContainElement(drawer);
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(drawer).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(secondOpener).toHaveFocus());
    expect(firstOpener).not.toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nawigacja dokumentacji' }));
    expect(hostAction).toHaveBeenCalledOnce();
  });

  it('removes modal effects from the host when an open nested preview unmounts', async () => {
    const user = userEvent.setup();
    const hostAction = vi.fn();
    const host = (showPreview: boolean) => (
      <div>
        <button onClick={hostAction}>Sterowanie katalogiem</button>
        {showPreview && (
          <section aria-label="Zagnieżdżony podgląd">
            <PortalShell defaultSidebarOpen navigation={navigation}>
              <p>Przykład</p>
            </PortalShell>
          </section>
        )}
      </div>
    );
    const { rerender } = render(host(true));
    await screen.findByRole('dialog', { name: 'Nawigacja główna' });
    rerender(host(false));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: 'Sterowanie katalogiem' }));
    expect(hostAction).toHaveBeenCalledOnce();
  });
});
