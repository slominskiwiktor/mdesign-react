import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { PortalDatePicker } from './Calendar.js';
import { PortalFormField, PortalSelect } from './Forms.js';
import { PortalSnackbarProvider, usePortalSnackbar } from './Overlays.js';

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
const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

function formValues(container: HTMLElement) {
  return [...new FormData(container.querySelector('form')!)];
}

describe('PortalFormField native control identity', () => {
  it('uses the child ID for the label and preserves external descriptions', () => {
    render(
      <>
        <p id="existing-help">Opis aplikacji.</p>
        <PortalFormField id="wrapper-id" label="Imię" hint="Podaj imię." required>
          <input id="consumer-id" aria-describedby="existing-help" />
        </PortalFormField>
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Imię' });
    expect(input).toHaveAttribute('id', 'consumer-id');
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Opis aplikacji. Podaj imię.');
    expect(screen.getByText('Imię').closest('label')).toHaveAttribute('for', 'consumer-id');
  });
  it('reconciles a render-prop child ID with the generated error description', () => {
    render(
      <PortalFormField label="Nazwisko" error="Uzupełnij nazwisko.">
        {(field) => <input id="custom-surname" aria-describedby={field.describedBy} />}
      </PortalFormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Nazwisko' });
    expect(input).toHaveAttribute('id', 'custom-surname');
    expect(input).toHaveAccessibleDescription('Uzupełnij nazwisko.');
    expect(input).toHaveAttribute('aria-describedby', 'custom-surname-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('PortalDatePicker controlled commits', () => {
  it('keeps the controlled date and native form value when the parent declines typed changes', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <form>
        <PortalDatePicker label="Wizyta" name="visit" value="2026-10-19" onValueChange={change} />
      </form>,
    );
    const input = screen.getByRole('textbox', { name: 'Wizyta' });
    fireEvent.change(input, { target: { value: '2026-10-20' } });
    fireEvent.blur(input);
    input.focus();
    await user.keyboard('{Escape}');
    expect(change).toHaveBeenCalledWith('2026-10-20');
    expect(input).toHaveValue('2026-10-19');
    expect(formValues(container)).toEqual([['visit', '2026-10-19']]);
    await user.click(screen.getByRole('button', { name: 'Wyczyść datę' }));
    expect(change).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('2026-10-19');
    expect(formValues(container)).toEqual([['visit', '2026-10-19']]);
  });
  it('keeps the controlled date after a declined calendar selection and closing the popup', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <form>
        <PortalDatePicker label="Wizyta" name="visit" value="2026-10-19" onValueChange={change} />
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Wybierz datę' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wizyta' })).getByRole('button', {
        name: '20 października 2026',
      }),
    );
    expect(change).toHaveBeenLastCalledWith('2026-10-20');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Wizyta' })).toHaveValue('2026-10-19');
    expect(formValues(container)).toEqual([['visit', '2026-10-19']]);
  });
  it('updates and clears normally when the parent accepts controlled changes', async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = useState('2026-10-19');
      return (
        <form>
          <PortalDatePicker label="Wizyta" name="visit" value={value} onValueChange={setValue} />
        </form>
      );
    }
    const { container } = render(<Example />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Wizyta' }), {
      target: { value: '2026-10-20' },
    });
    expect(screen.getByRole('textbox', { name: 'Wizyta' })).toHaveValue('2026-10-20');
    expect(formValues(container)).toEqual([['visit', '2026-10-20']]);
    await user.click(screen.getByRole('button', { name: 'Wyczyść datę' }));
    expect(screen.getByRole('textbox', { name: 'Wizyta' })).toHaveValue('');
    expect(formValues(container)).toEqual([['visit', '']]);
  });
  it('keeps an invalid draft invalid and lets Escape restore the committed date', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<PortalDatePicker label="Wizyta" value="2026-10-19" onValueChange={change} />);
    const input = screen.getByRole('textbox', { name: 'Wizyta' });
    fireEvent.change(input, { target: { value: '2026-02-30' } });
    fireEvent.blur(input);
    expect(input).toBeInvalid();
    expect(change).not.toHaveBeenCalled();
    input.focus();
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('2026-10-19');
    expect(input).toBeValid();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('closes an already open calendar when the field becomes read-only', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <PortalDatePicker label="Wizyta" value="2026-10-19" onValueChange={change} />,
    );
    await user.click(screen.getByRole('button', { name: 'Wybierz datę' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(
      <PortalDatePicker label="Wizyta" value="2026-10-19" onValueChange={change} readOnly />,
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('textbox')).toHaveValue('2026-10-19');
    expect(change).not.toHaveBeenCalled();
  });
});

describe('PortalSelect interaction boundaries', () => {
  it.each(['disabled', 'readOnly'] as const)(
    'does not expose a controlled-open popup when %s',
    (mode) => {
      const change = vi.fn();
      render(
        <PortalSelect
          label="Wariant"
          options={options}
          value="a"
          open
          onValueChange={change}
          {...{ [mode]: true }}
        />,
      );
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(change).not.toHaveBeenCalled();
    },
  );
  it.each(['disabled', 'readOnly'] as const)(
    'closes an open list when %s changes and preserves its form value',
    async (mode) => {
      const user = userEvent.setup();
      const change = vi.fn();
      const { container, rerender } = render(
        <form>
          <PortalSelect
            label="Wariant"
            name="choice"
            options={options}
            defaultValue="a"
            onValueChange={change}
          />
        </form>,
      );
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
      rerender(
        <form>
          <PortalSelect
            label="Wariant"
            name="choice"
            options={options}
            defaultValue="a"
            onValueChange={change}
            {...{ [mode]: true }}
          />
        </form>,
      );
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('Alpha');
      expect(change).not.toHaveBeenCalled();
      expect(formValues(container)).toEqual(mode === 'disabled' ? [] : [['choice', 'a']]);
      rerender(
        <form>
          <PortalSelect
            label="Wariant"
            name="choice"
            options={options}
            defaultValue="a"
            onValueChange={change}
          />
        </form>,
      );
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Beta' }));
      expect(change).toHaveBeenLastCalledWith('b');
      expect(formValues(container)).toEqual([['choice', 'b']]);
    },
  );
  it('does not open read-only selection from native constraint validation', () => {
    const { container } = render(
      <form>
        <PortalSelect label="Wariant" name="choice" options={options} required readOnly />
      </form>,
    );
    expect(container.querySelector('form')!.checkValidity()).toBe(false);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });
});

it('exposes queued notifications inside their labelled region', async () => {
  const user = userEvent.setup();
  function Controls() {
    const snackbar = usePortalSnackbar();
    return (
      <button onClick={() => snackbar.enqueue({ message: 'Zapisano zmiany.', duration: 0 })}>
        Powiadom
      </button>
    );
  }
  render(
    <PortalSnackbarProvider>
      <Controls />
    </PortalSnackbarProvider>,
  );
  const region = screen.getByRole('region', { name: 'Powiadomienia' });
  await user.click(screen.getByRole('button', { name: 'Powiadom' }));
  expect(within(region).getByRole('status')).toHaveTextContent('Zapisano zmiany.');
});
