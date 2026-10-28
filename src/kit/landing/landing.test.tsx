import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LandingButton,
  LandingCatalogListing,
  LandingCombobox,
  LandingCookieConsent,
  LandingDocumentCarousel,
  LandingDownloadPanel,
  LandingFAQ,
  LandingHeader,
  LandingProvider,
  LandingSearchField,
  LandingTabs,
  LandingUtilityBar,
  LandingVideo,
} from './index';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('landing search and filtering', () => {
  it('clears controlled search, preserves the forwarded input and restores focus', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [query, setQuery] = useState('PESEL');
      return (
        <LandingProvider>
          <LandingSearchField
            ref={ref}
            label="Wyszukaj usługę"
            value={query}
            onValueChange={(value) => {
              change(value);
              setQuery(value);
            }}
          />
          <output aria-label="Zapytanie">{query}</output>
        </LandingProvider>
      );
    }
    render(<Example />);
    const input = screen.getByRole('searchbox', { name: 'Wyszukaj usługę' });
    expect(ref.current).toBe(input);
    await user.type(input, ' online');
    expect(screen.getByRole('status', { name: 'Zapytanie' })).toHaveTextContent('PESEL online');
    await user.click(screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }));
    expect(change).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(ref.current).toBe(input);
  });
  it('supports combobox arrows, disabled options, typeahead, selection and Escape', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState('a');
      return (
        <LandingProvider>
          <LandingCombobox
            label="Kategoria"
            value={value}
            onValueChange={(next) => {
              setValue(next);
              change(next);
            }}
            options={[
              { value: 'a', label: 'Wszystkie' },
              { value: 'off', label: 'Niedostępne', disabled: true },
              { value: 'docs', label: 'Dokumenty' },
              { value: 'services', label: 'Usługi' },
            ]}
          />
        </LandingProvider>
      );
    }
    render(<Example />);
    const combo = screen.getByRole('combobox', { name: 'Kategoria Wszystkie' });
    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(change).toHaveBeenLastCalledWith('docs');
    expect(combo).toHaveAccessibleName('Kategoria Dokumenty');
    expect(combo).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('u{Enter}');
    expect(change).toHaveBeenLastCalledWith('services');
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combo).toHaveFocus();
  });
  it('filters a real catalogue by text and category and announces the resulting count', async () => {
    const user = userEvent.setup();
    render(
      <LandingProvider>
        <LandingCatalogListing
          title="Dokumenty"
          items={[
            { id: 'id', title: 'mDowód', href: '/id', category: 'Tożsamość' },
            { id: 'car', title: 'Moje pojazdy', href: '/cars', category: 'Pojazdy' },
          ]}
        />
      </LandingProvider>,
    );
    const search = screen.getByRole('searchbox', { name: 'Wyszukiwarka: Dokumenty' });
    await user.type(search, 'pojazdy');
    expect(screen.getByRole('status')).toHaveTextContent('Liczba wyników: 1');
    expect(screen.queryByRole('heading', { name: 'mDowód' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }));
    await user.click(screen.getByRole('combobox', { name: 'Kategoria Wszystkie' }));
    await user.click(screen.getByRole('option', { name: 'Tożsamość' }));
    expect(screen.getByRole('status')).toHaveTextContent('Liczba wyników: 1');
    expect(screen.getByRole('heading', { name: 'mDowód' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Moje pojazdy' })).not.toBeInTheDocument();
  });
});

describe('landing content navigation', () => {
  it('expands controlled FAQ answers and searches their content', async () => {
    const user = userEvent.setup();
    const expanded = vi.fn();
    function Example() {
      const [open, setOpen] = useState<string[]>([]);
      return (
        <LandingProvider>
          <LandingFAQ
            searchable
            expanded={open}
            onExpandedChange={(next) => {
              setOpen(next);
              expanded(next);
            }}
            items={[
              {
                id: 'app',
                question: 'Jak zainstalować aplikację?',
                answer: 'Pobierz z App Store.',
              },
              { id: 'pesel', question: 'Jak chronić dane?', answer: 'Zastrzeż PESEL.' },
            ]}
          />
        </LandingProvider>
      );
    }
    render(<Example />);
    const question = screen.getByRole('button', { name: 'Jak chronić dane?' });
    expect(question).toHaveAttribute('aria-expanded', 'false');
    await user.click(question);
    expect(expanded).toHaveBeenLastCalledWith(['pesel']);
    expect(screen.getByRole('region', { name: 'Jak chronić dane?' })).toHaveTextContent(
      'Zastrzeż PESEL.',
    );
    await user.type(screen.getByRole('searchbox'), 'PESEL');
    expect(
      screen.queryByRole('button', { name: 'Jak zainstalować aplikację?' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jak chronić dane?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
  it('switches landing tabs with arrows and exposes only the selected panel', async () => {
    const user = userEvent.setup();
    render(
      <LandingProvider>
        <LandingTabs
          items={[
            { value: 'app', label: 'Aplikacja', content: 'W telefonie' },
            { value: 'off', label: 'Wkrótce', content: 'Niedostępne', disabled: true },
            { value: 'web', label: 'Portal', content: 'W przeglądarce' },
          ]}
        />
      </LandingProvider>,
    );
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Portal' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('W przeglądarce');
  });
  it('moves a controlled document carousel from the keyboard and announces the slide', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    function Example() {
      const [value, setValue] = useState(0);
      return (
        <LandingProvider>
          <LandingDocumentCarousel
            title="Dokumenty"
            value={value}
            onValueChange={(next) => {
              changed(next);
              setValue(next);
            }}
            items={[
              { id: 'a', title: 'mDowód', href: '/id', image: '/id.png' },
              { id: 'b', title: 'Karta rodzinna', href: '/family', image: '/family.png' },
              { id: 'c', title: 'Moje pojazdy', href: '/cars', image: '/cars.png' },
            ]}
          />
        </LandingProvider>
      );
    }
    render(<Example />);
    screen.getByLabelText('Przewijana kolekcja dokumentów').focus();
    await user.keyboard('{End}');
    expect(changed).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('Dokument 3 z 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Następny dokument' })).toBeDisabled();
    await user.keyboard('{Home}');
    expect(changed).toHaveBeenLastCalledWith(0);
    expect(screen.getByRole('button', { name: 'Poprzedni dokument' })).toBeDisabled();
  });
});

describe('landing menus and panels', () => {
  it('opens the mobile menu and returns focus after Escape', async () => {
    const user = userEvent.setup();
    render(
      <LandingProvider>
        <LandingHeader
          items={[
            {
              label: 'Aplikacja',
              href: '/app',
              children: [{ label: 'Dokumenty', href: '/documents' }],
            },
          ]}
        />
      </LandingProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Pokaż nawigację menu głównego' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Menu główne' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it('keeps reduced motion in the download portal and traps/restores focus', async () => {
    const user = userEvent.setup();
    render(
      <LandingProvider>
        <LandingUtilityBar />
        <LandingDownloadPanel trigger={<LandingButton>Pobierz aplikację</LandingButton>} />
      </LandingProvider>,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Wyłącz animacje' }));
    expect(screen.getByRole('checkbox', { name: 'Włącz animacje' })).toBeChecked();
    const trigger = screen.getByRole('button', { name: 'Pobierz aplikację' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('[data-platform]')).toHaveAttribute('data-platform', 'landing');
    expect(dialog.closest('[data-motion]')).toHaveAttribute('data-motion', 'reduced');
    const close = within(dialog).getByRole('button', { name: 'Zamknij' });
    await waitFor(() => expect(close).toHaveFocus());
    await user.tab({ shift: true });
    expect(within(dialog).getAllByRole('link').at(-1)).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it('returns a controlled panel to the external header or hero button that opened it', async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <LandingProvider animationsDisabled>
          <LandingButton onClick={() => setOpen(true)}>Pobierz z nagłówka</LandingButton>
          <LandingButton onClick={() => setOpen(true)}>Pobierz z hero</LandingButton>
          <LandingDownloadPanel open={open} onOpenChange={setOpen} />
        </LandingProvider>
      );
    }
    render(<Example />);
    const header = screen.getByRole('button', { name: 'Pobierz z nagłówka' });
    const hero = screen.getByRole('button', { name: 'Pobierz z hero' });
    await user.click(header);
    expect(screen.getByRole('dialog').closest('[data-motion]')).toHaveAttribute(
      'data-motion',
      'reduced',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(header).toHaveFocus());
    await user.click(hero);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Zamknij' }));
    await waitFor(() => expect(hero).toHaveFocus());
  });
  it('does not create an external video embed until permitted and explicitly played', async () => {
    const user = userEvent.setup();
    const consent = vi.fn();
    const { rerender } = render(
      <LandingProvider>
        <LandingVideo
          title="Film"
          kind="embed"
          src="https://www.youtube-nocookie.com/embed/example"
          requireConsent
          onConsentRequest={consent}
        />
      </LandingProvider>,
    );
    expect(screen.queryByTitle('Film')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ustaw zgody, aby odtworzyć film: Film' }));
    expect(consent).toHaveBeenCalledOnce();
    expect(screen.queryByTitle('Film')).not.toBeInTheDocument();
    rerender(
      <LandingProvider>
        <LandingVideo
          title="Film"
          kind="embed"
          src="https://www.youtube-nocookie.com/embed/example"
          requireConsent
          consentGranted
          onConsentRequest={consent}
        />
      </LandingProvider>,
    );
    expect(screen.queryByTitle('Film')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Odtwórz film: Film' }));
    expect(screen.getByTitle('Film')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/example',
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByTitle('Film')).not.toBeInTheDocument();
  });
});

describe('landing opt-in consent', () => {
  it('opens the requested detail tab and discloses the supplied provider records independently', async () => {
    const user = userEvent.setup();
    render(
      <LandingProvider>
        <LandingCookieConsent
          open
          defaultTab="details"
          categories={[
            {
              id: 'necessary',
              label: 'Niezbędne',
              description: 'Wymagane do działania strony.',
              providers: [
                {
                  name: 'Własna witryna',
                  cookies: [
                    {
                      name: 'LocalConsent',
                      description: 'Zapamiętuje wybór.',
                      retention: '1 rok',
                      type: 'Plik cookie HTTP',
                    },
                  ],
                },
              ],
            },
          ]}
        />
      </LandingProvider>,
    );
    expect(screen.getByRole('tab', { name: 'Szczegóły' })).toHaveAttribute('data-state', 'active');
    expect(screen.queryByRole('heading', { name: 'LocalConsent' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Niezbędne (1)' }));
    await user.click(screen.getByRole('button', { name: 'Własna witryna 1' }));
    expect(screen.getByRole('heading', { name: 'LocalConsent' })).toBeVisible();
    expect(screen.getByText('Zapamiętuje wybór.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Niezbędne (1)' }));
    expect(screen.queryByRole('heading', { name: 'LocalConsent' })).not.toBeInTheDocument();
  });
  it('returns cookie settings to the external footer button after an explicit choice', async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <LandingProvider>
          <button type="button" onClick={() => setOpen(true)}>
            Ustawienia cookies w stopce
          </button>
          <LandingCookieConsent open={open} onOpenChange={setOpen} storageKey="footer-focus-test" />
        </LandingProvider>
      );
    }
    render(<Example />);
    const footer = screen.getByRole('button', { name: 'Ustawienia cookies w stopce' });
    await user.click(footer);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Dbamy o Twoją prywatność');
    await user.click(screen.getByRole('button', { name: 'Odmowa' }));
    await waitFor(() => expect(footer).toHaveFocus());
    await user.click(footer);
    await user.click(screen.getByRole('button', { name: 'Zezwól na wszystkie' }));
    await waitFor(() => expect(footer).toHaveFocus());
  });
  it('defaults all optional categories off, persists only the explicit choice and remembers rejection', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { unmount } = render(
      <LandingProvider>
        <LandingCookieConsent storageKey="consent-test" onConsentChange={changed} />
      </LandingProvider>,
    );
    await user.click(await screen.findByRole('button', { name: 'Spersonalizuj' }));
    expect(screen.getByRole('switch', { name: 'Niezbędne — zawsze aktywne' })).toBeChecked();
    for (const name of ['Preferencje', 'Statystyka', 'Marketing'])
      expect(screen.getByRole('switch', { name })).not.toBeChecked();
    expect(changed).not.toHaveBeenCalled();
    expect(localStorage.getItem('consent-test')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Odmowa' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: false,
      }),
    );
    expect(JSON.parse(localStorage.getItem('consent-test')!)).toEqual(
      expect.objectContaining({
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: false,
      }),
    );
    unmount();
    render(
      <LandingProvider>
        <LandingCookieConsent storageKey="consent-test" onConsentChange={changed} />
      </LandingProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Zezwól na wszystkie' })).not.toBeInTheDocument();
    expect(changed).toHaveBeenCalledOnce();
  });
  it('saves only the visitor-selected optional categories', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <LandingProvider>
        <LandingCookieConsent storageKey="custom-test" onConsentChange={changed} />
      </LandingProvider>,
    );
    await user.click(await screen.findByRole('button', { name: 'Spersonalizuj' }));
    await user.click(screen.getByRole('switch', { name: 'Statystyka' }));
    await user.click(screen.getByRole('button', { name: 'Zezwól na wybór' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        necessary: true,
        preferences: false,
        statistics: true,
        marketing: false,
      }),
    );
  });
});
