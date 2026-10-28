import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PortalShellExample } from './PortalShellExample.js';

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
});

describe('standalone public portal shell example', () => {
  it('owns its action feedback and restores focus when the local dialog closes', async () => {
    const user = userEvent.setup();
    render(<PortalShellExample />);
    const action = screen.getByRole('button', { name: 'Załóż skrzynkę do e-Doręczeń' });
    await user.click(action);
    expect(screen.getByRole('dialog', { name: 'Informacja' })).toHaveTextContent(
      'Wybrano e-Doręczenia',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(action).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Zobacz więcej' }));
    expect(screen.getByRole('dialog', { name: 'Informacja' })).toHaveTextContent(
      'Wybrano katalog usług.',
    );
  });

  it('preserves local navigation selection and closes its own drawer', async () => {
    const user = userEvent.setup();
    render(<PortalShellExample />);
    const menu = screen.getByRole('button', { name: 'Menu' });
    await user.click(menu);
    await user.click(
      within(screen.getByRole('dialog', { name: 'Nawigacja główna' })).getByRole('button', {
        name: /Twoje sprawy/,
      }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(menu).toHaveFocus());
    await user.click(menu);
    expect(
      within(screen.getByRole('dialog', { name: 'Nawigacja główna' })).getByRole('button', {
        name: /Twoje sprawy/,
      }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
