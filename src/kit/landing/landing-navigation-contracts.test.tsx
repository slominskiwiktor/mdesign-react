import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LandingDocumentCarousel,
  LandingFAQ,
  LandingHeader,
  LandingNewsList,
  LandingProvider,
} from './index.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const navigation = [
  {
    label: 'Aplikacja',
    href: '#aplikacja',
    children: [
      { label: 'mDowód', href: '#mdowod', current: true },
      { label: 'Karta rodzinna', href: '#rodzina' },
    ],
  },
  { label: 'Pomoc', href: '#pomoc' },
];
const documents = [
  { id: 'id', title: 'mDowód', href: '#mdowod', image: '/id.png' },
  { id: 'family', title: 'Karta rodzinna', href: '#rodzina', image: '/family.png' },
  { id: 'cars', title: 'Pojazdy', href: '#pojazdy', image: '/cars.png' },
];

describe('landing header navigation contracts', () => {
  it('opens the desktop submenu from the keyboard, restores focus, dismisses outside and reports destinations', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(
      <>
        <LandingHeader items={navigation} onNavigate={navigate} />
        <button>Poza nagłówkiem</button>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Rozwiń submenu Aplikacja' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const first = await screen.findByRole('link', { name: 'mDowód' });
    await waitFor(() => expect(first).toHaveFocus());
    expect(first).toHaveAttribute('aria-current', 'page');
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'mDowód' })).not.toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Poza nagłówkiem' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await user.click(screen.getByRole('link', { name: 'Karta rodzinna' }));
    expect(navigate).toHaveBeenCalledExactlyOnceWith('#rodzina');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    navigate.mockClear();
    await user.click(trigger);
    await user.click(screen.getByRole('link', { name: 'Aplikacja' }));
    expect(navigate).toHaveBeenCalledExactlyOnceWith('#aplikacja');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes an uncontrolled mobile menu after parent, nested and plain destination links', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const changed = vi.fn();
    render(<LandingHeader items={navigation} onNavigate={navigate} onMenuOpenChange={changed} />);
    const trigger = screen.getByRole('button', { name: 'Pokaż nawigację menu głównego' });
    for (const [label, href] of [
      ['Pokaż wszystko', '#aplikacja'],
      ['mDowód', '#mdowod'],
      ['Pomoc', '#pomoc'],
    ]) {
      await user.click(trigger);
      const dialog = screen.getByRole('dialog', { name: 'Menu główne' });
      if (label !== 'Pomoc')
        await user.click(within(dialog).getByText('Aplikacja', { selector: 'summary' }));
      await user.click(within(dialog).getByRole('link', { name: label }));
      expect(navigate).toHaveBeenLastCalledWith(href);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await waitFor(() => expect(trigger).toHaveFocus());
    }
    expect(navigate).toHaveBeenCalledTimes(3);
    expect(changed.mock.calls.map(([open]) => open)).toEqual([
      true,
      false,
      true,
      false,
      true,
      false,
    ]);
  });

  it('leaves controlled menu commits to its owner rather than leaking internal open state', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(
      <LandingHeader items={navigation} menuOpen={false} onMenuOpenChange={changed} />,
    );
    const trigger = screen.getByRole('button', { name: 'Pokaż nawigację menu głównego' });
    await user.click(trigger);
    expect(changed).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<LandingHeader items={navigation} menuOpen onMenuOpenChange={changed} />);
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Zamknij menu' }),
    );
    expect(changed).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<LandingHeader items={navigation} menuOpen={false} onMenuOpenChange={changed} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('changes the mobile language and closes the menu before delivering the download action', async () => {
    const user = userEvent.setup();
    const languageChanged = vi.fn();
    const download = vi.fn();
    function Example() {
      const [language, setLanguage] = useState('pl');
      return (
        <LandingHeader
          items={navigation}
          language={language}
          onLanguageChange={(next) => {
            setLanguage(next);
            languageChanged(next);
          }}
          onDownload={download}
          downloadLabel="Pobierz teraz"
          mobileSocialLinks={[{ label: 'Kanał informacyjny', href: 'https://example.com/news' }]}
        />
      );
    }
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Pokaż nawigację menu głównego' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('link', { name: 'Kanał informacyjny — nowe okno' }),
    ).toHaveAttribute('href', 'https://example.com/news');
    await user.click(within(dialog).getByRole('combobox', { name: 'Język strony Polski' }));
    await user.click(within(dialog).getByRole('option', { name: 'English' }));
    expect(languageChanged).toHaveBeenCalledExactlyOnceWith('en');
    expect(within(dialog).getByRole('combobox', { name: 'Język strony English' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Pobierz teraz' }));
    expect(download).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Pobierz teraz' }));
    expect(download).toHaveBeenCalledTimes(2);
  });
});

function trackGeometry(track: HTMLElement) {
  // jsdom has no layout or native scrolling; model three equally spaced slides.
  Object.defineProperty(track, 'offsetLeft', { configurable: true, value: 20 });
  Object.defineProperties(track, {
    scrollWidth: { configurable: true, value: 900 },
    clientWidth: { configurable: true, value: 300 },
  });
  Array.from(track.children).forEach((child, index) =>
    Object.defineProperty(child, 'offsetLeft', { configurable: true, value: 20 + index * 300 }),
  );
  const scrollTo = vi.fn(({ left }: ScrollToOptions) => {
    track.scrollLeft = left ?? 0;
    fireEvent.scroll(track);
  });
  Object.defineProperty(track, 'scrollTo', { configurable: true, value: scrollTo });
  return scrollTo;
}
function pointer(target: HTMLElement, type: string, clientX: number, buttons = 1) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, buttons });
  Object.defineProperties(event, { pointerType: { value: 'mouse' }, pointerId: { value: 1 } });
  fireEvent(target, event);
}

describe('landing content interaction contracts', () => {
  it('syncs carousel scroll selection, button boundaries and reduced-motion scrolling without duplicate scroll commits', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <LandingProvider animationsDisabled>
        <LandingDocumentCarousel title="Dokumenty" items={documents} onValueChange={changed} />
      </LandingProvider>,
    );
    const track = screen.getByLabelText('Przewijana kolekcja dokumentów');
    const scrollTo = trackGeometry(track);
    await user.click(screen.getByRole('button', { name: 'Następny dokument' }));
    expect(screen.getByText('Dokument 2 z 3')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: 'instant' });
    await user.click(screen.getByRole('button', { name: 'Poprzedni dokument' }));
    expect(screen.getByText('Dokument 1 z 3')).toBeInTheDocument();
    track.scrollLeft = 580;
    fireEvent.scroll(track);
    expect(changed).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('Dokument 3 z 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Następny dokument' })).toBeDisabled();
    const commits = changed.mock.calls.length;
    fireEvent.scroll(track);
    expect(changed).toHaveBeenCalledTimes(commits);
  });

  it('keeps a controlled carousel on the accepted slide until its parent accepts navigation', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(
      <LandingDocumentCarousel
        title="Dokumenty"
        items={documents}
        value={0}
        onValueChange={changed}
      />,
    );
    const track = screen.getByLabelText('Przewijana kolekcja dokumentów');
    const scrollTo = trackGeometry(track);
    await user.click(screen.getByRole('button', { name: 'Następny dokument' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(1);
    expect(screen.getByText('Dokument 1 z 3')).toBeInTheDocument();
    expect(scrollTo).not.toHaveBeenCalled();
    rerender(
      <LandingDocumentCarousel
        title="Dokumenty"
        items={documents}
        value={1}
        onValueChange={changed}
      />,
    );
    expect(screen.getByText('Dokument 2 z 3')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ left: 300, behavior: 'smooth' });
    track.focus();
    await user.keyboard('{End}');
    expect(changed).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('Dokument 2 z 3')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledOnce();
    rerender(
      <LandingDocumentCarousel
        title="Dokumenty"
        items={documents}
        value={2}
        onValueChange={changed}
      />,
    );
    expect(screen.getByRole('button', { name: 'Następny dokument' })).toBeDisabled();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 600, behavior: 'smooth' });
  });

  it('suppresses accidental link activation during a mouse drag and releases suppression on up, cancel and an unmoved leave', async () => {
    const clicked = vi.fn();
    render(
      <div onClick={clicked}>
        <LandingDocumentCarousel title="Dokumenty" items={documents} />
      </div>,
    );
    const track = screen.getByLabelText('Przewijana kolekcja dokumentów');
    const link = screen.getByRole('link', { name: 'mDowód' });
    const capture = vi.fn();
    Object.defineProperty(track, 'setPointerCapture', { value: capture });
    track.scrollLeft = 300;
    pointer(track, 'pointermove', 180, 0);
    expect(track.scrollLeft).toBe(300);
    pointer(track, 'pointerdown', 200);
    pointer(track, 'pointermove', 180);
    expect(track.scrollLeft).toBe(320);
    expect(capture).toHaveBeenCalledWith(1);
    // React synthesizes onPointerLeave from the browser's bubbling pointerout.
    pointer(track, 'pointerout', 180);
    expect(fireEvent.click(link)).toBe(false);
    expect(clicked).not.toHaveBeenCalled();
    pointer(track, 'pointerup', 180, 0);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(fireEvent.click(link)).toBe(true);
    expect(clicked).toHaveBeenCalledTimes(1);
    clicked.mockClear();
    pointer(track, 'pointerdown', 200);
    pointer(track, 'pointermove', 160);
    pointer(track, 'pointercancel', 160, 0);
    expect(fireEvent.click(link)).toBe(true);
    expect(clicked).toHaveBeenCalledTimes(1);
    pointer(track, 'pointerdown', 200);
    pointer(track, 'pointerout', 200);
    const before = track.scrollLeft;
    pointer(track, 'pointermove', 150);
    expect(track.scrollLeft).toBe(before);
  });

  it('filters news by category, blocks repeated load-more while busy and respects controlled rejection', async () => {
    const user = userEvent.setup();
    const category = vi.fn();
    const more = vi.fn();
    const items = [
      { id: 'app', title: 'Nowy dokument', href: '#nowy', category: 'Aplikacja' },
      { id: 'safe', title: 'Chroń swoje dane', href: '#dane', category: 'Bezpieczeństwo' },
    ];
    const { rerender } = render(
      <LandingNewsList items={items} onCategoryChange={category} hasMore onLoadMore={more} />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Kategoria aktualności Wszystkie' }));
    await user.click(screen.getByRole('option', { name: 'Bezpieczeństwo' }));
    expect(category).toHaveBeenCalledExactlyOnceWith('Bezpieczeństwo');
    expect(screen.queryByRole('heading', { name: 'Nowy dokument' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chroń swoje dane' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Pokaż więcej aktualności' }));
    expect(more).toHaveBeenCalledTimes(1);
    rerender(
      <LandingNewsList
        items={items}
        onCategoryChange={category}
        hasMore
        onLoadMore={more}
        loading
      />,
    );
    const load = screen.getByRole('button', { name: 'Pokaż więcej aktualności' });
    expect(load).toBeDisabled();
    await user.click(load);
    expect(more).toHaveBeenCalledTimes(1);
    rerender(<LandingNewsList items={items} category="Nieznana" onCategoryChange={category} />);
    expect(screen.getByRole('status')).toHaveTextContent('Brak aktualności');
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Aplikacja' }));
    expect(category).toHaveBeenLastCalledWith('Aplikacja');
    expect(screen.getByRole('status')).toHaveTextContent('Brak aktualności');
    rerender(<LandingNewsList items={items} category="Aplikacja" onCategoryChange={category} />);
    expect(screen.getByRole('heading', { name: 'Nowy dokument' })).toBeVisible();
  });

  it('closes uncontrolled FAQ answers and leaves controlled expanded commits to its owner', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const items = [
      { id: 'install', question: 'Jak zainstalować?', answer: 'Otwórz sklep.' },
      { id: 'safe', question: 'Jak chronić dane?', answer: 'Wybierz zabezpieczenia.' },
    ];
    const { rerender } = render(
      <LandingFAQ items={items} defaultExpanded={['install']} onExpandedChange={changed} />,
    );
    await user.click(screen.getByRole('button', { name: 'Jak zainstalować?' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith([]);
    expect(screen.queryByRole('region', { name: 'Jak zainstalować?' })).not.toBeInTheDocument();
    rerender(<LandingFAQ items={items} expanded={['safe']} onExpandedChange={changed} />);
    await user.click(screen.getByRole('button', { name: 'Jak chronić dane?' }));
    expect(changed).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole('region', { name: 'Jak chronić dane?' })).toBeVisible();
    rerender(<LandingFAQ items={items} expanded={[]} onExpandedChange={changed} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
