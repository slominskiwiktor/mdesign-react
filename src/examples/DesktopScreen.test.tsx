import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesktopScreen } from './DesktopScreen';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('current desktop example', () => {
  it('contains keyboard focus in the menu and returns it after Escape', async () => {
    const user = userEvent.setup();
    render(<DesktopScreen />);
    const menu = screen.getByRole('button', { name: 'Menu' });
    await user.click(menu);
    const drawer = screen.getByRole('dialog', { name: 'Menu główne' });
    const close = within(drawer).getByRole('button', { name: 'Zamknij' });
    expect(document.body.style.overflow).toBe('hidden');
    expect(close).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(within(drawer).getByRole('link', { name: 'Aplikacja mobilna' })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(menu).toHaveFocus());
    expect(document.body.style.overflow).toBe('');
  });

  it('restores the original page scroll setting when an open preview unmounts', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';
    const { unmount } = render(<DesktopScreen />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });

  it('opens the current catalog and completes a local service dialog without submitting a request', async () => {
    const user = userEvent.setup();
    render(<DesktopScreen />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Załatw sprawę online' }),
    );
    expect(screen.getByRole('heading', { name: 'Załatw sprawę online' })).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const action = screen.getAllByRole('button', { name: 'Załatw sprawę' })[0];
    await user.click(action);
    const notice = screen.getByRole('dialog', { name: 'Informacja' });
    expect(notice).toHaveTextContent('wniosek nie został wysłany');
    await user.click(within(notice).getByRole('button', { name: 'Zamknij' }));
    await waitFor(() => expect(action).toHaveFocus());
  });
});
