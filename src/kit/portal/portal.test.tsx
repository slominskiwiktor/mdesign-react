import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { PortalCalendar, PortalDatePicker } from './Calendar.js';
import { PortalDataTable, PortalPagination } from './DataTable.js';
import { PortalFileUpload } from './FileUpload.js';
import type { PortalFileUploadHandle } from './FileUpload.js';
import {
  PortalMenu,
  PortalChip,
  PortalSnackbar,
  PortalSnackbarProvider,
  usePortalSnackbar,
} from './Overlays.js';
import { PortalDialog } from './Dialogs.js';
import { PortalFormField, PortalSelect } from './Forms.js';
import { PortalShell } from './Shell.js';
import { PortalBreadcrumbs } from './Parts.js';
import { validatePortalFiles } from './validation.js';
import { addPortalDays, formatPortalDate, parsePortalDate } from './dates.js';
it('keeps a linked final breadcrumb interactive unless explicitly current', () => {
  const { rerender } = render(
    <PortalBreadcrumbs items={[{ id: 'home', label: 'Strona główna', href: '/' }]} />,
  );
  expect(screen.getByRole('link', { name: 'Strona główna' })).toHaveAttribute('href', '/');
  expect(screen.getByText('Strona główna').closest('li')).not.toHaveAttribute('aria-current');
  rerender(
    <PortalBreadcrumbs
      items={[{ id: 'home', label: 'Strona główna', href: '/', current: true }]}
    />,
  );
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText('Strona główna').closest('li')).toHaveAttribute('aria-current', 'page');
});
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('portal dates', () => {
  it('rejects impossible dates and adds calendar days across months', () => {
    expect(parsePortalDate('2026-02-30')).toBeUndefined();
    expect(formatPortalDate(addPortalDays(parsePortalDate('2026-03-31')!, 1))).toBe('2026-04-01');
  });
  it('aligns adjacent dates to the configured week start without making them selectable', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <PortalCalendar defaultMonth="2026-10-01" onValueChange={change} />,
    );
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Pn',
      'Wt',
      'Śr',
      'Cz',
      'Pt',
      'So',
      'Nd',
    ]);
    const previous = screen.getByRole('gridcell', { name: '28 września 2026' });
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(within(previous).queryByRole('button')).not.toBeInTheDocument();
    await user.click(previous);
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('gridcell', { name: '1 listopada 2026' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    const firstWeek = screen.getAllByRole('row')[1];
    expect(
      within(firstWeek)
        .getAllByRole('gridcell')
        .map((c) => c.textContent),
    ).toEqual(['28', '29', '30', '1', '2', '3', '4']);
    rerender(
      <PortalCalendar defaultMonth="2026-10-01" firstDayOfWeek={0} onValueChange={change} />,
    );
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Nd',
      'Pn',
      'Wt',
      'Śr',
      'Cz',
      'Pt',
      'So',
    ]);
    expect(
      within(screen.getAllByRole('row')[1])
        .getAllByRole('gridcell')
        .map((c) => c.textContent),
    ).toEqual(['27', '28', '29', '30', '1', '2', '3']);
    await user.click(screen.getByRole('button', { name: '1 października 2026' }));
    expect(change).toHaveBeenCalledWith('2026-10-01');
  });
  it('keeps Intl weekday labels for non-Polish locales', () => {
    render(<PortalCalendar defaultMonth="2026-10-01" locale="en-GB" />);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
  });
  it('moves keyboard focus to the next month and excludes disabled dates', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PortalCalendar
        defaultValue="2026-01-31"
        min="2026-01-01"
        max="2026-12-31"
        isDateDisabled={(d) => d === '2026-02-01'}
        onValueChange={onChange}
      />,
    );
    screen.getByRole('button', { name: '31 stycznia 2026' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '2 lutego 2026' })).toHaveFocus(),
    );
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('2026-02-02');
  });
  it('opens a labelled date dialog, chooses a date and clears it', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<PortalDatePicker label="Wizyta" defaultValue="2026-10-19" onValueChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Wybierz datę' }));
    const dialog = screen.getByRole('dialog', { name: 'Wizyta' });
    await user.click(within(dialog).getByRole('button', { name: '20 października 2026' }));
    expect(screen.getByLabelText('Wizyta')).toHaveValue('2026-10-20');
    expect(change).toHaveBeenLastCalledWith('2026-10-20');
    await user.click(screen.getByRole('button', { name: 'Wyczyść datę' }));
    expect(screen.getByLabelText('Wizyta')).toHaveValue('');
  });
  it('prevents native form submission for a malformed or out of range typed date', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <PortalDatePicker label="Data" min="2026-01-01" max="2026-12-31" />
      </form>,
    );
    const input = screen.getByLabelText('Data');
    await user.type(input, '2026-02-30');
    expect(input).toBeInvalid();
    await user.clear(input);
    await user.type(input, '2026-02-28');
    expect(input).toBeValid();
  });
});
describe('portal data table', () => {
  const rows = [
    { id: '1', name: 'C', disabled: false },
    { id: '2', name: 'A', disabled: true },
    { id: '3', name: 'B', disabled: false },
  ];
  it('sorts, pages and selects enabled visible rows only', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <PortalDataTable
        caption="Sprawy"
        rows={rows}
        rowKey={(r) => r.id}
        rowLabel={(r) => r.name}
        columns={[{ key: 'name', header: 'Nazwa', sortable: true }]}
        selectable
        isRowDisabled={(r) => r.disabled}
        defaultPageSize={2}
        pageSizeOptions={[2, 3]}
        onSelectionChange={change}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Nazwa' }));
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('A');
    await user.click(
      screen.getByRole('checkbox', { name: 'Zaznacz wszystkie wiersze na tej stronie' }),
    );
    expect(change).toHaveBeenLastCalledWith(['3']);
    expect(screen.getByRole('checkbox', { name: 'Zaznacz A' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Następna strona' }));
    expect(screen.getByRole('cell', { name: 'C' })).toBeVisible();
  });
  it('activates rows from keyboard but does not activate for an inner control', async () => {
    const user = userEvent.setup();
    const activate = vi.fn();
    render(
      <PortalDataTable
        caption="Dane"
        rows={[{ id: '1', name: 'A' }]}
        rowKey={(r) => r.id}
        columns={[{ key: 'name', header: 'Nazwa', render: (r) => <button>{r.name}</button> }]}
        pagination={false}
        onRowActivate={activate}
      />,
    );
    const row = screen.getAllByRole('row')[1];
    row.focus();
    await user.keyboard('{Enter}');
    expect(activate).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'A' }));
    await user.keyboard('{Enter}');
    expect(activate).toHaveBeenCalledTimes(1);
  });
  it('normalizes invalid pagination numbers and exposes resize keyboard bounds', async () => {
    const user = userEvent.setup();
    render(
      <>
        <PortalPagination total={NaN} page={Infinity} pageSize={0} />
        <PortalDataTable
          caption="Kolumny"
          rows={[]}
          rowKey={(r: { id: string }) => r.id}
          columns={[{ key: 'id', header: 'Id', width: 100, minWidth: 64, resizable: true }]}
          pagination={false}
        />
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('0 wyników');
    const resize = screen.getByRole('separator', { name: 'Szerokość kolumny id' });
    expect(resize).toHaveAttribute('aria-valuemin', '64');
    resize.focus();
    await user.keyboard('{ArrowRight}');
    expect(resize).toHaveAttribute('aria-valuenow', '108');
  });
});
describe('portal files', () => {
  it('validates formats, bytes, count and duplicate names independently', () => {
    const a = new File(['1234'], 'a.pdf', { type: 'application/pdf' });
    const duplicate = new File(['1'], 'a.pdf', { type: 'application/pdf' });
    const wrong = new File(['x'], 'wrong.exe', { type: 'application/octet-stream' });
    const big = new File(['123456'], 'big.pdf', { type: 'application/pdf' });
    const extra = new File(['1'], 'extra.pdf', { type: 'application/pdf' });
    const result = validatePortalFiles([a, duplicate, wrong, big, extra], {
      accept: '.pdf',
      maxFileSize: 5,
      maxFiles: 1,
    });
    expect(result.accepted).toEqual([a]);
    expect(result.rejected.map((r) => r.code)).toEqual(['count', 'type', 'size', 'count']);
    expect(validatePortalFiles([duplicate], { existingFiles: [a] }).rejected[0].code).toBe('name');
  });
  it('adds files from chooser and drop, rejects invalid files and resets through ref', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const ref = createRef<PortalFileUploadHandle>();
    render(<PortalFileUpload ref={ref} label="Załączniki" accept=".pdf" maxFiles={2} />);
    const input = screen.getByLabelText('Załączniki');
    await user.upload(input, new File(['one'], 'one.pdf', { type: 'application/pdf' }));
    await screen.findByText('one.pdf');
    fireEvent.drop(input.closest('.mp-file-upload')!.querySelector('.mp-file-drop')!, {
      dataTransfer: {
        files: [
          new File(['x'], 'bad.exe'),
          new File(['two'], 'two.pdf', { type: 'application/pdf' }),
        ],
      },
    });
    await screen.findByText('two.pdf');
    expect(screen.getByRole('alert')).toHaveTextContent('Niedozwolony format');
    act(() => ref.current!.reset());
    expect(screen.queryByText('one.pdf')).not.toBeInTheDocument();
    expect(screen.queryByText('two.pdf')).not.toBeInTheDocument();
  });
  it('ignores late asynchronous validation after reset', async () => {
    const user = userEvent.setup();
    const ref = createRef<PortalFileUploadHandle>();
    let finish!: (value: string | undefined) => void;
    render(
      <PortalFileUpload
        ref={ref}
        label="Pliki"
        validateAsync={() =>
          new Promise((resolve) => {
            finish = resolve;
          })
        }
      />,
    );
    await user.upload(screen.getByLabelText('Pliki'), new File(['one'], 'one.pdf'));
    await waitFor(() => expect(finish).toBeDefined());
    act(() => ref.current!.reset());
    await act(async () => finish(undefined));
    expect(screen.queryByText('one.pdf')).not.toBeInTheDocument();
  });
  it('calls the consumer transport with real progress and supports cancellation', async () => {
    const user = userEvent.setup();
    const ref = createRef<PortalFileUploadHandle>();
    let signal: AbortSignal | undefined;
    render(
      <PortalFileUpload
        ref={ref}
        label="Pliki"
        defaultFiles={[new File(['x'], 'file.pdf')]}
        upload={(_, { signal: s, onProgress }) => {
          signal = s;
          onProgress(35);
          return new Promise((_, reject) =>
            s.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
          );
        }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Wyślij pliki' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '35');
    act(() => ref.current!.cancel());
    expect(signal?.aborted).toBe(true);
    await screen.findByText('Wysyłanie anulowane.');
  });
});
describe('portal popup and messages', () => {
  it('skips disabled menu items, restores focus on Escape and selects checkbox items', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <PortalMenu
        label="Opcje"
        items={[
          { id: 'a', label: 'Alfa' },
          { id: 'b', label: 'Brak', disabled: true },
          { id: 'c', label: 'Chcę', type: 'checkbox', onCheckedChange: changed },
        ]}
      />,
    );
    const button = screen.getByRole('button', { name: 'Opcje' });
    await user.click(button);
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Alfa' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Chcę' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(changed).toHaveBeenCalledWith(true);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(button).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  it('supports multiselect without closing and returns focus from a single select', async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = useState<string | string[]>([]);
      return (
        <PortalSelect
          label="Kanały"
          multiple
          value={value}
          onValueChange={setValue}
          options={[
            { value: 'a', label: 'Aplikacja' },
            { value: 'e', label: 'E-mail' },
          ]}
        />
      );
    }
    render(<Example />);
    const combo = screen.getByRole('combobox', { name: 'Kanały Wybierz' });
    await user.click(combo);
    await user.click(screen.getByRole('option', { name: 'Aplikacja' }));
    await user.click(screen.getByRole('option', { name: 'E-mail' }));
    expect(combo).toHaveTextContent('Aplikacja, E-mail');
    await user.keyboard('{Escape}');
    expect(combo).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('keeps selection and dismiss actions distinct on a chip', async () => {
    const user = userEvent.setup();
    const dismiss = vi.fn();
    render(
      <PortalChip selectable onDismiss={dismiss}>
        Rodzina
      </PortalChip>,
    );
    const chip = screen.getByRole('button', { name: 'Rodzina' });
    await user.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(dismiss).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Usuń: Rodzina' }));
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
  it('pauses snackbar expiration while hovered', () => {
    vi.useFakeTimers();
    const close = vi.fn();
    render(<PortalSnackbar message="Info" duration={100} onClose={close} />);
    act(() => vi.advanceTimersByTime(40));
    fireEvent.mouseEnter(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(1000));
    expect(close).not.toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(60));
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('queues notices beyond the visible limit and advances on dismissal', async () => {
    const user = userEvent.setup();
    function Controls() {
      const api = usePortalSnackbar();
      return (
        <button
          onClick={() => {
            api.enqueue({ message: 'Pierwszy', duration: 0 });
            api.enqueue({ message: 'Drugi', duration: 0 });
          }}
        >
          Dodaj
        </button>
      );
    }
    render(
      <PortalSnackbarProvider maxVisible={1}>
        <Controls />
      </PortalSnackbarProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    expect(screen.getByText('Pierwszy')).toBeVisible();
    expect(screen.queryByText('Drugi')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Zamknij komunikat' }));
    expect(screen.getByText('Drugi')).toBeVisible();
  });
});
describe('portal composition', () => {
  it('restores the opener of a controlled dialog without a Radix trigger', async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Sterowane okno</button>
          <PortalDialog open={open} onOpenChange={setOpen} title="Kontrolowane">
            <input aria-label="Dane" />
          </PortalDialog>
        </>
      );
    }
    render(<Example />);
    const opener = screen.getByRole('button', { name: 'Sterowane okno' });
    await user.click(opener);
    expect(screen.getByRole('dialog', { name: 'Kontrolowane' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('preserves theme scope and a dialog accessible description with Escape focus return', async () => {
    const user = userEvent.setup();
    render(
      <div
        data-theme="dark"
        data-platform="web"
        style={{ '--custom-token': 'purple' } as React.CSSProperties}
      >
        <PortalDialog
          trigger={<button>Otwórz</button>}
          title="Potwierdzenie"
          description="Sprawdź dane."
        >
          <input aria-label="Pole" />
        </PortalDialog>
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Otwórz' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Potwierdzenie' });
    expect(dialog).toHaveAccessibleDescription('Sprawdź dane.');
    expect(dialog.closest('[data-theme="dark"]')).not.toBeNull();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it('associates label, help/error text and native control in form parts', () => {
    render(
      <PortalFormField label="Imię" hint="Podaj imię." error="Pole jest wymagane." required>
        <input />
      </PortalFormField>,
    );
    const input = screen.getByLabelText('Imię *');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Pole jest wymagane.');
  });
  it('exports a shell drawer with focus management and Escape', async () => {
    const user = userEvent.setup();
    render(
      <PortalShell
        navigation={[
          { id: 'home', label: 'Strona główna', icon: 'AC_home' },
          { id: 'help', label: 'Pomoc' },
        ]}
      >
        <p>Treść</p>
      </PortalShell>,
    );
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Nawigacja główna' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it('keeps an initially open drawer inside its shell and inherited theme scope', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div data-theme="dark">
        <PortalShell
          defaultSidebarOpen
          navigation={[{ id: 'home', label: 'Strona główna', icon: 'AC_home' }]}
        >
          <p>Treść</p>
        </PortalShell>
      </div>,
    );
    const drawer = await screen.findByRole('dialog', { name: 'Nawigacja główna' });
    expect(drawer.closest('.mp-shell')).toBe(container.querySelector('.mp-shell'));
    expect(drawer.closest('[data-theme="dark"]')).toBe(container.firstElementChild);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus());
  });
});
