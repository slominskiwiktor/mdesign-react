import { createRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PinInput,
  PhoneField,
  MaskedField,
  MobileTextArea,
  CheckboxGroup,
  RadioGroup,
} from './inputs.js';
import {
  BottomSheet,
  MobileDialog,
  MobileDropdown,
  MobileMenu,
  MobileFilePicker,
  SnackbarProvider,
  useSnackbar,
  MobileSnackbar,
} from './overlays.js';
import { MobileCalendar, MobileDatePicker, MobileTimePicker } from './date-picker.js';
import { Pager, ChatBubble } from './pages.js';
import { BarcodeGraphic, QRCodeGraphic } from './codes.js';
import { SegmentedControl } from './content.js';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe('mobile inputs', () => {
  it('submits the selected option value through native FormData', async () => {
    const { container, rerender } = render(
      <form>
        <RadioGroup
          label="Kanał kontaktu"
          name="contact"
          defaultValue="email"
          options={[
            { value: 'email', label: 'E-mail' },
            { value: 'phone', label: 'Telefon' },
          ]}
        />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).getAll('contact')).toEqual(['email']);
    await userEvent.click(screen.getByRole('radio', { name: 'Telefon' }));
    expect(new FormData(form).getAll('contact')).toEqual(['phone']);
    rerender(
      <form>
        <RadioGroup
          label="Kanał kontaktu"
          name="contact"
          value="phone"
          disabled
          options={[{ value: 'phone', label: 'Telefon' }]}
        />
      </form>,
    );
    expect(new FormData(form).has('contact')).toBe(false);
  });
  it('sanitizes pasted PIN, limits cells and reports completion once', async () => {
    const complete = vi.fn(),
      change = vi.fn();
    render(<PinInput label="PIN" onValueChange={change} onComplete={complete} />);
    const input = screen.getByLabelText('PIN');
    await userEvent.click(input);
    await userEvent.paste('12a3456');
    expect(input).toHaveValue('1234');
    expect(complete).toHaveBeenCalledExactlyOnceWith('1234');
    await userEvent.type(input, '9');
    expect(complete).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith('1234');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
  });
  it('moves phone focus from prefix to number and preserves separate values', async () => {
    const change = vi.fn();
    render(<PhoneField label="Telefon" onValueChange={change} />);
    const prefix = screen.getByRole('textbox', { name: 'Telefon, Kod kraju' }),
      number = screen.getByRole('textbox', { name: 'Telefon, Numer telefonu' });
    await userEvent.click(prefix);
    await userEvent.keyboard('{Enter}');
    expect(number).toHaveFocus();
    await userEvent.type(number, '123456789');
    expect(change).toHaveBeenLastCalledWith({
      countryCode: '+48',
      number: '123456789',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Wyczyść numer telefonu' }));
    expect(number).toHaveValue('');
    expect(number).toHaveFocus();
  });
  it('submits explicit phone input names and omits both entries when disabled', () => {
    const props = {
      id: 'contact-phone',
      label: 'Telefon',
      countryCodeName: 'phoneCountryCode',
      numberName: 'phoneNumber',
      defaultValue: { countryCode: '+48', number: '123456789' },
    };
    const { container, rerender } = render(
      <form>
        <PhoneField {...props} />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect([...new FormData(form)]).toEqual([
      ['phoneCountryCode', '+48'],
      ['phoneNumber', '123456789'],
    ]);
    expect(screen.getByRole('textbox', { name: 'Telefon, Kod kraju' })).toHaveAttribute(
      'id',
      'contact-phone-country-code',
    );
    expect(screen.getByRole('textbox', { name: 'Telefon, Numer telefonu' })).toHaveAttribute(
      'id',
      'contact-phone-number',
    );
    rerender(
      <form>
        <PhoneField {...props} disabled />
      </form>,
    );
    expect([...new FormData(form)]).toEqual([]);
  });
  it('forwards the phone ref to the local input and clears it on unmount', () => {
    const ref = createRef<HTMLInputElement>();
    const { unmount } = render(<PhoneField label="Telefon" ref={ref} />);
    const number = screen.getByRole('textbox', { name: 'Telefon, Numer telefonu' });
    expect(ref.current).toBe(number);
    act(() => ref.current?.focus());
    expect(number).toHaveFocus();
    unmount();
    expect(ref.current).toBeNull();
  });
  it('reports phone blur only when focus leaves the whole composite field', async () => {
    const blur = vi.fn();
    render(
      <>
        <PhoneField
          label="Telefon"
          defaultValue={{ countryCode: '+48', number: '123456789' }}
          onBlur={blur}
        />
        <button>Dalej</button>
      </>,
    );
    await userEvent.click(screen.getByRole('textbox', { name: 'Telefon, Kod kraju' }));
    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'Telefon, Numer telefonu' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Wyczyść numer telefonu' })).toHaveFocus();
    expect(blur).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('textbox', { name: 'Telefon, Numer telefonu' })).toHaveFocus();
    expect(blur).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(blur).toHaveBeenCalledOnce();
  });
  it('keeps parent-controlled phone data when a change is declined', () => {
    const change = vi.fn();
    const { container } = render(
      <form>
        <PhoneField
          label="Telefon"
          value={{ countryCode: '+48', number: '123456789' }}
          onValueChange={change}
          countryCodeName="country"
          numberName="number"
        />
      </form>,
    );
    const number = screen.getByRole('textbox', { name: 'Telefon, Numer telefonu' });
    fireEvent.change(number, { target: { value: '987654321' } });
    expect(change).toHaveBeenLastCalledWith({ countryCode: '+48', number: '987654321' });
    expect(number).toHaveValue('123456789');
    expect([...new FormData(container.querySelector('form')!)]).toEqual([
      ['country', '+48'],
      ['number', '123456789'],
    ]);
  });
  it('formats a pasted postal code and emits its raw value', async () => {
    const raw = vi.fn();
    render(<MaskedField label="Kod" mask="##-###" onRawValueChange={raw} />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Kod' }));
    await userEvent.paste('12345');
    expect(screen.getByRole('textbox', { name: 'Kod' })).toHaveValue('12-345');
    expect(raw).toHaveBeenLastCalledWith('12345');
  });
  it('applies source BLIK and country-prefix masks without duplicating fixed digits', async () => {
    render(
      <>
        <MaskedField label="BLIK" maskType="BLIK" />
        <MaskedField label="Numer z prefiksem" maskType="PHONE_COUNTRY_CODE" />
      </>,
    );
    const blik = screen.getByRole('textbox', { name: 'BLIK' });
    await userEvent.click(blik);
    await userEvent.paste('1234567');
    expect(blik).toHaveValue('123 456');
    const phone = screen.getByRole('textbox', { name: 'Numer z prefiksem' });
    await userEvent.click(phone);
    await userEvent.paste('+48 123456789');
    expect(phone).toHaveValue('+48 123456789');
  });
  it('counts Unicode graphemes and announces the character limit without silently discarding text', () => {
    render(<MobileTextArea label="Opis" characterLimit={2} />);
    const input = screen.getByRole('textbox', { name: 'Opis' });
    fireEvent.change(input, { target: { value: 'a👨‍👩‍👧‍👦' } });
    expect(screen.getByLabelText('2 z 2 znaków')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'a👨‍👩‍👧‍👦b' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveValue('a👨‍👩‍👧‍👦b');
  });
  it('supports multi-selection and native mutually exclusive radio grouping', async () => {
    const options = [
      { value: 'a', label: 'Pierwsza' },
      { value: 'b', label: 'Druga' },
      { value: 'c', label: 'Trzecia', disabled: true },
    ];
    render(
      <>
        <CheckboxGroup label="Kilka" options={options} />
        <RadioGroup label="Jedna" options={options} />
      </>,
    );
    const check = screen.getByRole('group', { name: 'Kilka' }),
      radio = screen.getByRole('group', { name: 'Jedna' });
    await userEvent.click(within(check).getByRole('checkbox', { name: 'Pierwsza' }));
    await userEvent.click(within(check).getByRole('checkbox', { name: 'Druga' }));
    expect(within(check).getAllByRole('checkbox', { checked: true })).toHaveLength(2);
    await userEvent.click(within(radio).getByRole('radio', { name: 'Pierwsza' }));
    await userEvent.click(within(radio).getByRole('radio', { name: 'Druga' }));
    expect(within(radio).getAllByRole('radio', { checked: true })).toHaveLength(1);
    expect(within(radio).getByRole('radio', { name: 'Trzecia' })).toBeDisabled();
  });
});
describe('mobile overlays and files', () => {
  it('retains files added through an asynchronous source adapter instead of using stale selection', async () => {
    let addFiles: ((files: File[]) => void) | undefined;
    render(
      <MobileFilePicker
        label="Pliki adaptera"
        maxFiles={3}
        onRequestSource={(add) => {
          addFiles = add;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj plik' }));
    act(() => addFiles?.([new File(['a'], 'a.pdf')]));
    act(() => addFiles?.([new File(['b'], 'b.pdf')]));
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(screen.getByText('b.pdf')).toBeInTheDocument();
  });
  it('traps sheet focus, dismisses with Escape and restores its trigger', async () => {
    render(
      <BottomSheet title="Załączniki" trigger={<button>Otwórz arkusz</button>}>
        <button>Pierwszy</button>
        <button>Ostatni</button>
      </BottomSheet>,
    );
    const trigger = screen.getByRole('button', { name: 'Otwórz arkusz' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Załączniki' });
    const last = within(dialog).getByRole('button', { name: 'Ostatni' });
    last.focus();
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it('restores an external controlled-dialog opener and associates description', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Pokaż</button>
          <MobileDialog
            title="Potwierdź"
            description="Opis okna"
            open={open}
            onOpenChange={setOpen}
          >
            <button>Dalej</button>
          </MobileDialog>
        </>
      );
    }
    render(<Example />);
    const opener = screen.getByRole('button', { name: 'Pokaż' });
    await userEvent.click(opener);
    expect(screen.getByRole('dialog', { name: 'Potwierdź' })).toHaveAccessibleDescription(
      'Opis okna',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it('supports menu roving focus, skips disabled items, selects and restores focus', async () => {
    const choose = vi.fn();
    render(
      <MobileMenu
        label="Opcje"
        items={[
          { label: 'Pierwsza', onSelect: () => {} },
          { label: 'Nieaktywna', disabled: true, onSelect: () => {} },
          { label: 'Trzecia', onSelect: choose },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Opcje' });
    await userEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Pierwsza' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Trzecia' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(choose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('preserves menu focus across equivalent item updates and recovers when the first item is disabled', async () => {
    const items = () => [
      { label: 'Pierwsza', onSelect: () => {} },
      { label: 'Druga', onSelect: () => {} },
    ];
    const { rerender } = render(<MobileMenu label="Opcje" items={items()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Opcje' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Druga' })).toHaveFocus();
    rerender(<MobileMenu label="Opcje" items={items()} />);
    expect(screen.getByRole('menuitem', { name: 'Druga' })).toHaveFocus();
    const updated = items();
    rerender(<MobileMenu label="Opcje" items={[{ ...updated[0], disabled: true }, updated[1]]} />);
    expect(screen.getByRole('menuitem', { name: 'Druga' })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Druga' })).toHaveAttribute('tabindex', '0');
  });
  it('closes an open dropdown when disabled without committing or reopening on enable', async () => {
    const change = vi.fn();
    const props = {
      label: 'Region',
      defaultValue: 'a',
      onValueChange: change,
      options: [
        { value: 'a', label: 'Mazowsze' },
        { value: 'b', label: 'Pomorze' },
      ],
    };
    const { rerender } = render(<MobileDropdown {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Region' }));
    expect(screen.getByRole('button', { name: 'Pomorze' })).toBeEnabled();
    rerender(<MobileDropdown {...props} disabled />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Region' });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent('Mazowsze');
    await userEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    rerender(<MobileDropdown {...props} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Region' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pomorze' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('b');
  });
  it('selects a dropdown option and closes its sheet', async () => {
    const change = vi.fn();
    render(
      <MobileDropdown
        label="Region"
        onValueChange={change}
        options={[
          { value: 'a', label: 'Mazowsze' },
          { value: 'b', label: 'Pomorze' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Region' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pomorze' }));
    expect(change).toHaveBeenLastCalledWith('b');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Region' })).toHaveTextContent('Pomorze');
  });
  it('validates files and count, retains accepted entries and supports removal', async () => {
    const change = vi.fn(),
      reject = vi.fn();
    render(
      <MobileFilePicker
        label="Pliki"
        maxFiles={1}
        maxFileSize={10}
        accept=".pdf"
        onFilesChange={change}
        onRejected={reject}
      />,
    );
    const input = screen.getByLabelText('Pliki', { selector: 'input' });
    fireEvent.change(input, {
      target: {
        files: [
          new File(['ok'], 'a.pdf', { type: 'application/pdf' }),
          new File(['bad'], 'b.txt', { type: 'text/plain' }),
        ],
      },
    });
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(reject).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Dodaj plik' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Usuń plik: a.pdf' }));
    expect(change).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole('button', { name: 'Dodaj plik' })).toBeInTheDocument();
  });
  it('pauses snackbar expiry while focused and resumes its remaining duration', () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    render(<MobileSnackbar message="Zapisano" duration={1000} onDismiss={dismiss} />);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.focus(screen.getByRole('button', { name: 'Zamknij powiadomienie' }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(dismiss).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByRole('button', { name: 'Zamknij powiadomienie' }));
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(dismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(dismiss).toHaveBeenCalledOnce();
  });
  it('queues snackbar messages and advances on dismissal', async () => {
    function Example() {
      const s = useSnackbar();
      return (
        <button
          onClick={() => {
            s.show({ message: 'Pierwszy', duration: Infinity });
            s.show({ message: 'Drugi', duration: Infinity });
          }}
        >
          Dodaj
        </button>
      );
    }
    render(
      <SnackbarProvider>
        <Example />
      </SnackbarProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    expect(screen.getByRole('status')).toHaveTextContent('Pierwszy');
    await userEvent.click(screen.getByRole('button', { name: 'Zamknij powiadomienie' }));
    expect(screen.getByRole('status')).toHaveTextContent('Drugi');
  });
});
describe('calendar, pager and generated codes', () => {
  it('keeps one enabled calendar tab stop when today is unavailable or constraints change', async () => {
    const { container, rerender } = render(<MobileCalendar today="2026-10-19" min="2026-10-20" />);
    const tabStops = () =>
      container.querySelectorAll("[role=grid] button:not(:disabled)[tabindex='0']");
    expect(tabStops()).toHaveLength(1);
    expect(tabStops()[0]).toHaveAccessibleName('20 października 2026');
    await userEvent.tab(); // Next month; previous month is outside min.
    await userEvent.tab();
    expect(tabStops()[0]).toHaveFocus();
    rerender(
      <MobileCalendar today="2026-10-19" isDateDisabled={(date) => date === '2026-10-20'} />,
    );
    expect(tabStops()).toHaveLength(1);
    expect(tabStops()[0]).not.toBeDisabled();
    expect(tabStops()[0]).toHaveAccessibleName('1 października 2026');
    rerender(<MobileCalendar today="2026-10-19" isDateDisabled={() => true} />);
    expect(tabStops()).toHaveLength(0);
  });
  it('provides an enabled calendar entry when the initial selected day is disabled', () => {
    const { container } = render(
      <MobileCalendar
        value="2026-10-19"
        today="2026-10-19"
        isDateDisabled={(date) => date === '2026-10-19'}
      />,
    );
    expect(screen.getByRole('button', { name: '19 października 2026' })).toBeDisabled();
    const entry = container.querySelectorAll("[role=grid] button[tabindex='0']");
    expect(entry).toHaveLength(1);
    expect(entry[0]).not.toBeDisabled();
    expect(entry[0]).toHaveAccessibleName('1 października 2026');
  });
  it('navigates dates by keyboard while skipping disabled days', async () => {
    render(
      <MobileCalendar
        value="2026-10-19"
        today="2026-10-19"
        isDateDisabled={(date) => date === '2026-10-20'}
      />,
    );
    const day = screen.getByRole('button', { name: '19 października 2026' });
    day.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '21 października 2026' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(day).toHaveFocus());
  });
  it('commits a date only on confirmation; cancel leaves original value', async () => {
    const change = vi.fn();
    render(
      <MobileDatePicker
        label="Data"
        defaultValue="2026-10-19"
        onValueChange={change}
        min="2026-10-19"
        max="2026-10-25"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Data' }));
    expect(screen.getByRole('button', { name: '18 października 2026' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '21 października 2026' }));
    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Data' }));
    await userEvent.click(screen.getByRole('button', { name: '22 października 2026' }));
    await userEvent.click(screen.getByRole('button', { name: 'Zatwierdź' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('2026-10-22');
  });
  it('discards an open date draft when disabled and requires a fresh explicit opening', async () => {
    const change = vi.fn();
    const props = {
      label: 'Data',
      value: '2026-10-20',
      today: '2026-10-20',
      onValueChange: change,
    };
    const { rerender } = render(<MobileDatePicker {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Data' }));
    await userEvent.click(screen.getByRole('button', { name: '21 października 2026' }));
    rerender(<MobileDatePicker {...props} disabled />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Data' })).toBeDisabled();
    expect(change).not.toHaveBeenCalled();
    rerender(<MobileDatePicker {...props} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Data' }));
    expect(
      screen.getByRole('button', { name: '20 października 2026' }).closest('td'),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('button', { name: '22 października 2026' }));
    await userEvent.click(screen.getByRole('button', { name: 'Zatwierdź' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('2026-10-22');
  });
  it('discards an open time draft when disabled and preserves the committed time', async () => {
    const change = vi.fn();
    const props = { label: 'Czas', defaultValue: '12:00', onValueChange: change };
    const { rerender } = render(<MobileTimePicker {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Czas' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Godzina' }), {
      target: { value: '13' },
    });
    rerender(<MobileTimePicker {...props} disabled />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Czas' })).toBeDisabled();
    expect(change).not.toHaveBeenCalled();
    rerender(<MobileTimePicker {...props} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Czas' }));
    expect(screen.getByRole('textbox', { name: 'Godzina' })).toHaveValue('12');
    expect(screen.getByRole('textbox', { name: 'Minuty' })).toHaveValue('00');
    fireEvent.change(screen.getByRole('textbox', { name: 'Godzina' }), {
      target: { value: '14' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Zatwierdź' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('14:00');
  });
  it('uses pager keyboard and final action without activating hidden content', async () => {
    const finish = vi.fn();
    render(
      <Pager
        label="Wprowadzenie"
        pages={[{ content: <button>Ukryta akcja</button> }, { content: <p>Druga strona</p> }]}
        onFinish={finish}
      />,
    );
    const pager = screen.getByRole('region', { name: 'Wprowadzenie' });
    pager.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.queryByRole('button', { name: 'Ukryta akcja' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Zakończ' }));
    expect(finish).toHaveBeenCalledOnce();
  });
  it('skips unavailable segmented choices using arrow keys', async () => {
    render(
      <SegmentedControl
        label="Widok"
        items={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
          { value: 'c', label: 'C' },
        ]}
      />,
    );
    const first = screen.getByRole('radio', { name: 'A' });
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true');
  });
  it('renders real payload-dependent QR matrices and rejects invalid barcode data', () => {
    const { rerender } = render(<QRCodeGraphic value="https://example.com/a" label="Kod" />);
    const path = screen.getByRole('img', { name: 'Kod' }).querySelector('path')?.getAttribute('d');
    expect(path?.length).toBeGreaterThan(500);
    rerender(<QRCodeGraphic value="https://example.com/b" label="Kod" />);
    expect(
      screen.getByRole('img', { name: 'Kod' }).querySelector('path')?.getAttribute('d'),
    ).not.toBe(path);
    rerender(<BarcodeGraphic value="invalid" format="EAN13" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Nieprawidłowe dane');
  });
  it('expands chat sources and forwards feedback callbacks', async () => {
    const positive = vi.fn();
    render(
      <ChatBubble
        label="Asystent"
        content={[{ type: 'text', value: 'Odpowiedź' }]}
        footer={{
          sources: {
            title: 'Źródła',
            items: [{ label: 'Informacje', url: 'https://info.mobywatel.gov.pl' }],
          },
          onPositiveChange: positive,
        }}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Informacje' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Źródła' }));
    expect(screen.getByRole('link', { name: 'Informacje' })).toHaveAttribute(
      'href',
      'https://info.mobywatel.gov.pl',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Przydatna odpowiedź' }));
    expect(positive).toHaveBeenCalledWith(true);
  });
});
