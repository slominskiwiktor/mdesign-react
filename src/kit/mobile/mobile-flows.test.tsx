import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatBubble, Onboarding, Pager, ServiceWelcomePage } from './pages.js';
import { MobileCalendar, MobileDatePicker, MobileTimePicker } from './date-picker.js';
import { BottomSheet, MobileFilePicker, MobileMenu, MobileSnackbar } from './overlays.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function pointer(node: Element, type: string, x: number, y: number, pointerType = 'touch') {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    pointerId: { value: 1 },
  });
  fireEvent(node, event);
}

describe('mobile page workflows', () => {
  it('blocks duplicate refreshes, reports a failed refresh and permits retrying', async () => {
    let rejectRefresh!: (reason: Error) => void;
    const refresh = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_, reject) => {
            rejectRefresh = reject;
          }),
      )
      .mockResolvedValue(undefined);
    const failure = vi.fn(),
      back = vi.fn(),
      action = vi.fn();
    render(
      <ServiceWelcomePage
        topBarTitle="Usługa"
        header={{ icon: 'i', title: 'Twoje dane' }}
        onRefresh={refresh}
        onRefreshError={failure}
        onBack={back}
        action={<button onClick={action}>Przejdź dalej</button>}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Odśwież' }));
    const pending = screen.getByRole('button', { name: 'Odświeżanie' });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(pending);
    expect(refresh).toHaveBeenCalledOnce();
    const error = new Error('Brak połączenia');
    await act(async () => rejectRefresh(error));
    expect(failure).toHaveBeenCalledExactlyOnceWith(error);
    await userEvent.click(screen.getByRole('button', { name: 'Odśwież' }));
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Odśwież' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Wróć' }));
    await userEvent.click(screen.getByRole('button', { name: 'Przejdź dalej' }));
    expect(back).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledOnce();
  });

  it('navigates pager indicators and keyboard bounds without intercepting child keys', async () => {
    render(
      <Pager
        label="Przewodnik"
        pages={[
          { content: <p>Pierwszy ekran</p> },
          { content: <p>Drugi ekran</p> },
          { content: <input aria-label="Odpowiedź" /> },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(screen.getByRole('group', { name: '2 z 3' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Strona 3 z 3' }));
    const pager = screen.getByRole('region', { name: 'Przewodnik' });
    pager.focus();
    await userEvent.keyboard('{Home}{ArrowLeft}');
    expect(screen.getByRole('group', { name: '1 z 3' })).toBeVisible();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('group', { name: '3 z 3' })).toBeVisible();
    await userEvent.click(screen.getByRole('textbox', { name: 'Odpowiedź' }));
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('group', { name: '3 z 3' })).toBeVisible();
  });

  it('accepts horizontal touch swipes but ignores vertical, mouse and cancelled gestures', () => {
    const { container } = render(
      <Pager label="Slajdy" pages={[{ content: 'Pierwszy' }, { content: 'Drugi' }]} />,
    );
    const content = container.querySelector('.m-mobile-pager-content')!;
    pointer(content, 'pointerdown', 110, 100);
    pointer(content, 'pointerup', 20, 104);
    expect(screen.getByRole('group', { name: '2 z 2' })).toBeVisible();
    pointer(content, 'pointerdown', 20, 100);
    pointer(content, 'pointerup', 110, 104);
    expect(screen.getByRole('group', { name: '1 z 2' })).toBeVisible();
    pointer(content, 'pointerdown', 110, 20);
    pointer(content, 'pointerup', 20, 180);
    pointer(content, 'pointerdown', 110, 100, 'mouse');
    pointer(content, 'pointerup', 20, 100, 'mouse');
    pointer(content, 'pointerdown', 110, 100);
    pointer(content, 'pointercancel', 110, 100);
    pointer(content, 'pointerup', 20, 100);
    expect(screen.getByRole('group', { name: '1 z 2' })).toBeVisible();
  });

  it('completes onboarding only after the final page', async () => {
    const complete = vi.fn();
    render(
      <Onboarding
        onComplete={complete}
        pages={[
          { title: 'Poznaj usługę', illustration: '1', description: 'Pierwszy krok' },
          { title: 'Gotowe do działania', illustration: '2', description: 'Ostatni krok' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Poznaj usługę' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(complete).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Poznaj usługę' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Zakończ' }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('forwards chat actions, suggestions and controlled negative feedback independently', async () => {
    const action = vi.fn(),
      suggestion = vi.fn(),
      share = vi.fn(),
      url = vi.fn(),
      feedback = vi.fn();
    function Example() {
      const [negative, setNegative] = useState(false);
      return (
        <ChatBubble
          content={[{ type: 'link', value: 'Szczegóły', url: 'https://example.com/details' }]}
          onUrlClick={url}
          additionalInfo="Odpowiedź może wymagać sprawdzenia."
          actions={[{ label: 'Zobacz sprawę', onClick: action }]}
          suggestions={[{ label: 'Zapytaj ponownie', onClick: suggestion }]}
          footer={{
            negative,
            onNegativeChange: (next) => {
              feedback(next);
              setNegative(next);
            },
            onShare: share,
            sources: {
              title: 'Źródła',
              items: [{ label: 'Źródło', url: 'https://example.com/source' }],
              showMoreLabel: 'Pokaż źródła',
              showLessLabel: 'Zwiń źródła',
            },
          }}
        />
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Zobacz sprawę' }));
    await userEvent.click(screen.getByRole('button', { name: 'Zapytaj ponownie' }));
    await userEvent.click(screen.getByRole('button', { name: 'Udostępnij odpowiedź' }));
    await userEvent.click(screen.getByRole('link', { name: 'Szczegóły' }));
    expect(action).toHaveBeenCalledOnce();
    expect(suggestion).toHaveBeenCalledOnce();
    expect(share).toHaveBeenCalledOnce();
    expect(url).toHaveBeenCalledExactlyOnceWith('https://example.com/details');
    const negative = screen.getByRole('button', { name: 'Nieprzydatna odpowiedź' });
    await userEvent.click(negative);
    expect(negative).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(negative);
    expect(feedback.mock.calls).toEqual([[true], [false]]);
    await userEvent.click(screen.getByRole('button', { name: 'Pokaż źródła' }));
    expect(screen.getByRole('link', { name: 'Źródło' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Zwiń źródła' }));
    expect(screen.queryByRole('link', { name: 'Źródło' })).not.toBeInTheDocument();
  });
});

describe('mobile date and overlay workflows', () => {
  it('pages months to the first enabled day and supports month and year keyboard jumps', async () => {
    const { rerender } = render(
      <MobileCalendar
        today="2026-10-21"
        isDateDisabled={(date) => ['2026-11-01', '2026-11-02'].includes(date)}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Następny miesiąc' }));
    expect(screen.getByRole('button', { name: '3 listopada 2026' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Poprzedni miesiąc' }));
    expect(screen.getByRole('button', { name: '1 października 2026' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    rerender(<MobileCalendar value="2026-10-21" today="2026-10-21" />);
    screen.getByRole('button', { name: '21 października 2026' }).focus();
    await userEvent.keyboard('{Home}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '19 października 2026' })).toHaveFocus(),
    );
    await userEvent.keyboard('{End}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '25 października 2026' })).toHaveFocus(),
    );
    await userEvent.keyboard('{PageUp}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '25 września 2026' })).toHaveFocus(),
    );
    await userEvent.keyboard('{PageDown}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '25 października 2026' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '25 października 2025' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '25 października 2026' })).toHaveFocus(),
    );
  });

  it('cancels a date draft with Escape then explicitly clears the committed date', async () => {
    const change = vi.fn();
    render(
      <MobileDatePicker
        label="Termin"
        defaultValue="2026-10-20"
        today="2026-10-20"
        onValueChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Termin' }));
    await userEvent.click(screen.getByRole('button', { name: '21 października 2026' }));
    await userEvent.keyboard('{Escape}');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Termin' })).toHaveTextContent('20.10.2026');
    await userEvent.click(screen.getByRole('button', { name: 'Termin' }));
    await userEvent.click(screen.getByRole('button', { name: 'Wyczyść' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('validates time drafts, cancels without committing and pads a confirmed time', async () => {
    const change = vi.fn();
    render(<MobileTimePicker label="Godzina wizyty" defaultValue="12:00" onValueChange={change} />);
    const open = () => userEvent.click(screen.getByRole('button', { name: 'Godzina wizyty' }));
    await open();
    const minutes = screen.getByRole('textbox', { name: 'Minuty' });
    fireEvent.change(minutes, { target: { value: '6x1' } });
    expect(minutes).toHaveValue('61');
    expect(minutes).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Zatwierdź' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(change).not.toHaveBeenCalled();
    await open();
    expect(screen.getByRole('textbox', { name: 'Minuty' })).toHaveValue('00');
    await userEvent.keyboard('{Escape}');
    await open();
    fireEvent.change(screen.getByRole('textbox', { name: 'Godzina' }), { target: { value: '8' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Minuty' }), { target: { value: '5' } });
    await userEvent.click(screen.getByRole('button', { name: 'Zatwierdź' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('08:05');
  });

  it('cancels sheet dragging, dismisses after a sufficient drag and restores an external opener', async () => {
    const stateChange = vi.fn();
    function Example() {
      const [state, setState] = useState<'hidden' | 'half-expanded' | 'expanded'>('hidden');
      return (
        <>
          <button onClick={() => setState('half-expanded')}>Otwórz arkusz</button>
          <BottomSheet
            title="Dodatkowe opcje"
            state={state}
            allowHalfExpanded
            onStateChange={(next) => {
              stateChange(next);
              setState(next);
            }}
          >
            <button>Akcja</button>
          </BottomSheet>
        </>
      );
    }
    const { container } = render(<Example />);
    const opener = screen.getByRole('button', { name: 'Otwórz arkusz' });
    await userEvent.click(opener);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-half', 'true');
    const handle = container.querySelector('.m-mobile-sheet-handle-area')!;
    pointer(handle, 'pointerdown', 20, 100);
    pointer(handle, 'pointermove', 20, 150);
    expect(dialog).toHaveStyle({ transform: 'translateY(50px)' });
    pointer(handle, 'pointercancel', 20, 150);
    expect(dialog.style.transform).toBe('');
    expect(stateChange).not.toHaveBeenCalled();
    pointer(handle, 'pointerdown', 20, 100);
    pointer(handle, 'pointermove', 20, 200);
    pointer(handle, 'pointerup', 20, 200);
    expect(stateChange).toHaveBeenCalledExactlyOnceWith('hidden');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('uses menu opening keys, typeahead expiry, Escape and outside dismissal', async () => {
    render(
      <>
        <MobileMenu
          label="Opcje"
          items={[
            { label: 'Pierwsza', onSelect: vi.fn() },
            { label: 'Trzecia', onSelect: vi.fn() },
          ]}
        />
        <button>Poza menu</button>
      </>,
    );
    const opener = screen.getByRole('button', { name: 'Opcje' });
    opener.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('tr');
    expect(screen.getByRole('menuitem', { name: 'Trzecia' })).toHaveFocus();
    await new Promise((resolve) => setTimeout(resolve, 550));
    await userEvent.keyboard('p');
    expect(screen.getByRole('menuitem', { name: 'Pierwsza' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(opener).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: 'Poza menu' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Poza menu' })).toHaveFocus();
  });

  it('previews host-selected images and releases their object URLs on removal and unmount', async () => {
    const create = vi.fn().mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
    const revoke = vi.fn();
    const OriginalURL = URL;
    vi.stubGlobal(
      'URL',
      class extends OriginalURL {
        static createObjectURL = create;
        static revokeObjectURL = revoke;
      },
    );
    const first = new File(['a'], 'first.png', { type: 'image/png' });
    const second = new File(['b'], 'second.png', { type: 'image/png' });
    const preview = vi.fn(),
      selected = vi.fn();
    const source = vi
      .fn<(add: (files: File[]) => void) => void>()
      .mockImplementationOnce((add) => add([first]))
      .mockImplementationOnce((add) => add([second]));
    const { container, unmount } = render(
      <MobileFilePicker
        label="Zdjęcia"
        onRequestSource={source}
        onPreview={preview}
        onFilesChange={selected}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj plik' }));
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:first');
    await userEvent.click(screen.getByRole('button', { name: 'Podgląd: first.png' }));
    expect(preview).toHaveBeenCalledExactlyOnceWith(first);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Usuń plik: first.png' }));
    expect(selected).toHaveBeenLastCalledWith([]);
    expect(revoke).toHaveBeenCalledWith('blob:first');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj plik' }));
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:second');
    unmount();
    expect(revoke).toHaveBeenLastCalledWith('blob:second');
    expect(revoke).toHaveBeenCalledTimes(2);
  });

  it('runs a snackbar action before dismissing and keeps its message available to assistive tech', async () => {
    const order: string[] = [];
    render(
      <MobileSnackbar
        message="Usunięto dokument"
        duration={Infinity}
        action={{ label: 'Cofnij', onClick: () => order.push('action') }}
        onDismiss={() => order.push('dismiss')}
      />,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Usunięto dokument');
    await userEvent.hover(status);
    await userEvent.unhover(status);
    await userEvent.click(screen.getByRole('button', { name: 'Cofnij' }));
    expect(order).toEqual(['action', 'dismiss']);
  });
});
