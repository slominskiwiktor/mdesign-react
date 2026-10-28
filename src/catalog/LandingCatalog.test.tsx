import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingCatalog } from './LandingCatalog.js';
import manifest from './component-manifest.json';

beforeEach(() => {
  localStorage.clear();
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
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('landing component catalog', () => {
  it('opens component examples by default and exposes every public landing API across its visible groups', async () => {
    const user = userEvent.setup();
    const { container } = render(<LandingCatalog />);
    expect(screen.getByRole('heading', { name: 'LandingButton' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'LandingSearchField' })).toBeVisible();
    expect(container.querySelector('.ml-home')).toBeNull();
    expect(container.querySelector('iframe[src="/preview/landing"]')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'LandingHome' })).not.toBeInTheDocument();

    const navigation = screen.getByRole('navigation', { name: 'Grupy komponentów landingu' });
    const groups = within(navigation)
      .getAllByRole('button')
      .filter((button) => button.textContent?.trim() !== 'Cała strona');
    const renderedNames: string[] = [];
    for (const group of groups) {
      await user.click(group);
      expect(group).toHaveAttribute('aria-pressed', 'true');
      const cards = [...container.querySelectorAll<HTMLElement>('.kit-example[data-component]')];
      expect(cards.length).toBeGreaterThan(0);
      renderedNames.push(...cards.map((card) => card.dataset.component!));
    }
    const publicNames = manifest.components
      .filter((component) => component.category === 'landing')
      .map((component) => component.name);
    expect(renderedNames.sort()).toEqual(publicNames.sort());
  });

  it('loads the whole page only on request and removes that preview when returning to components', async () => {
    const user = userEvent.setup();
    render(<LandingCatalog />);
    const navigation = screen.getByRole('navigation', { name: 'Grupy komponentów landingu' });
    await user.click(within(navigation).getByRole('button', { name: 'Cała strona' }));
    const frame = screen.getByTitle('Interaktywny podgląd całego landingu');
    expect(frame).toBeInstanceOf(HTMLIFrameElement);
    expect(frame).toHaveAttribute('src', '/preview/landing');
    expect(screen.queryByRole('heading', { name: 'LandingButton' })).not.toBeInTheDocument();
    await user.click(within(navigation).getByRole('button', { name: 'Przyciski i pola' }));
    expect(frame).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'LandingButton' })).toBeVisible();
  });

  it('reopens stored cookie settings from the catalog action and returns focus after refusal', async () => {
    localStorage.setItem(
      'mdesign-landing-catalog-consent',
      JSON.stringify({
        necessary: true,
        preferences: true,
        statistics: false,
        marketing: false,
        updatedAt: '2026-10-20T08:00:00Z',
      }),
    );
    const user = userEvent.setup();
    render(<LandingCatalog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const opener = screen.getByRole('button', { name: 'Otwórz banner cookies' });
    await user.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Dbamy o Twoją prywatność' });
    await user.click(within(dialog).getByRole('button', { name: 'Odmowa' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
    const stored = JSON.parse(localStorage.getItem('mdesign-landing-catalog-consent')!);
    expect(stored).toMatchObject({
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
    });
  });

  it('keeps action feedback inside the button example', async () => {
    const user = userEvent.setup();
    render(<LandingCatalog />);
    const example = screen.getByRole('heading', { name: 'LandingButton' }).closest('article')!;
    await user.click(within(example).getByRole('button', { name: 'Pobierz aplikację' }));
    expect(within(example).getByRole('status')).toHaveTextContent('Wybrano główną akcję.');
  });

  it('allows the utility example to change its initially reduced motion setting', async () => {
    const user = userEvent.setup();
    render(<LandingCatalog />);
    await user.click(
      within(screen.getByRole('navigation', { name: 'Grupy komponentów landingu' })).getByRole(
        'button',
        { name: 'Nawigacja' },
      ),
    );
    const toggle = screen.getByRole('checkbox', { name: 'Włącz animacje' });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(screen.getByRole('checkbox', { name: 'Wyłącz animacje' })).not.toBeChecked();
  });

  it('restores video permission from a stored explicit choice without loading the player automatically', async () => {
    localStorage.setItem(
      'mdesign-landing-catalog-consent',
      JSON.stringify({
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: true,
        updatedAt: '2026-10-20T08:00:00Z',
      }),
    );
    const user = userEvent.setup();
    render(<LandingCatalog />);
    await user.click(
      within(screen.getByRole('navigation', { name: 'Grupy komponentów landingu' })).getByRole(
        'button',
        { name: 'Okna i cookies' },
      ),
    );
    expect(screen.getByRole('button', { name: 'Odtwórz film: Poznaj mDowód' })).toBeVisible();
    expect(screen.queryByTitle('Poznaj mDowód')).not.toBeInTheDocument();
  });
});
