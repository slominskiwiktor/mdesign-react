import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  Checkbox,
  Dialog,
  Progress,
  Radio,
  Skeleton,
  Switch,
  Tabs,
  TextField,
  Tooltip,
} from './components';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('form accessibility', () => {
  it('clears a controlled mobile field through its change handler and returns focus to the input', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [value, setValue] = useState('Jan');
      return (
        <div data-platform="mobile">
          <TextField
            ref={ref}
            label="Imię"
            value={value}
            onChange={(event) => {
              changed(event.target.value);
              setValue(event.target.value);
            }}
          />
        </div>
      );
    }
    render(<Example />);
    const input = screen.getByRole('textbox', { name: 'Imię' });
    expect(ref.current).toBe(input);
    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Wyczyść pole' }));
    expect(input).toHaveValue('');
    expect(changed).toHaveBeenLastCalledWith('');
    expect(input).toHaveFocus();
    await user.type(input, 'Anna');
    expect(input).toHaveValue('Anna');
    expect(changed).toHaveBeenLastCalledWith('Anna');
  });

  it('reveals a secure field without changing its value and can opt out of native field controls', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <div data-platform="mobile">
        <TextField label="Hasło" type="password" defaultValue="przykładowe hasło" />
      </div>,
    );
    const input = screen.getByLabelText('Hasło');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Pokaż hasło' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('przykładowe hasło');
    expect(screen.getByRole('button', { name: 'Ukryj hasło' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(input).toHaveFocus();
    rerender(
      <div data-platform="mobile">
        <TextField
          label="Hasło"
          type="password"
          defaultValue="przykładowe hasło"
          passwordToggle={false}
        />
      </div>,
    );
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('przykładowe hasło');
    expect(screen.queryByRole('button', { name: 'Pokaż hasło' })).not.toBeInTheDocument();
    rerender(
      <div data-platform="mobile">
        <TextField label="Hasło" type="password" defaultValue="przykładowe hasło" />
      </div>,
    );
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Pokaż hasło' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    rerender(
      <div data-platform="mobile">
        <TextField label="Hasło" type="password" defaultValue="przykładowe hasło" disabled />
      </div>,
    );
    const disabledReveal = screen.getByRole('button', { name: 'Pokaż hasło' });
    expect(disabledReveal).toBeDisabled();
    await user.click(disabledReveal);
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('przykładowe hasło');
  });

  it('keeps a forwarded callback ref attached while typing and clearing the same input', async () => {
    const user = userEvent.setup();
    const forwarded = vi.fn();
    const { unmount } = render(
      <div data-platform="mobile">
        <TextField ref={forwarded} label="Imię" defaultValue="Jan" />
      </div>,
    );
    const input = screen.getByRole('textbox', { name: 'Imię' });
    expect(forwarded).toHaveBeenCalledExactlyOnceWith(input);
    await user.type(input, 'ek');
    await user.click(screen.getByRole('button', { name: 'Wyczyść pole' }));
    expect(input).toHaveValue('');
    expect(forwarded).toHaveBeenCalledExactlyOnceWith(input);
    unmount();
    expect(forwarded).toHaveBeenLastCalledWith(null);
    expect(forwarded).toHaveBeenCalledTimes(2);
  });

  it('exposes checkbox validation separately from its label and preserves disabled semantics', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(
      <Checkbox
        label="Akceptuję warunki"
        hint="Przeczytaj warunki przed zatwierdzeniem."
        error="Wymagana akceptacja."
        onChange={changed}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Akceptuję warunki' });
    expect(checkbox).toHaveAccessibleDescription('Wymagana akceptacja.');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    rerender(
      <Checkbox
        label="Akceptuję warunki"
        hint="Możesz zmienić wybór później."
        disabled
        onChange={changed}
      />,
    );
    expect(checkbox).toHaveAccessibleDescription('Możesz zmienić wybór później.');
    expect(checkbox).not.toHaveAttribute('aria-invalid');
    await user.click(checkbox);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('keeps radio hints and errors out of the option name and lets the native group select one option', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Radio name="delivery" label="W aplikacji" hint="Otrzymasz powiadomienie." />
        <Radio name="delivery" label="E-mailem" error="Najpierw podaj adres e-mail." />
      </>,
    );
    const app = screen.getByRole('radio', { name: 'W aplikacji' });
    const email = screen.getByRole('radio', { name: 'E-mailem' });
    expect(app).toHaveAccessibleDescription('Otrzymasz powiadomienie.');
    expect(email).toHaveAccessibleDescription('Najpierw podaj adres e-mail.');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    await user.click(app);
    expect(app).toBeChecked();
    await user.click(email);
    expect(email).toBeChecked();
    expect(app).not.toBeChecked();
  });

  it('connects field label and current validation error for assistive technology', () => {
    const { rerender } = render(<TextField label="Numer PESEL" hint="Wpisz 11 cyfr." />);
    const input = screen.getByRole('textbox', { name: 'Numer PESEL' });
    expect(input).toHaveAccessibleDescription('Wpisz 11 cyfr.');
    expect(input).not.toHaveAttribute('aria-invalid');
    rerender(
      <TextField
        label="Numer PESEL"
        hint="Wpisz 11 cyfr."
        error="Numer PESEL musi mieć 11 cyfr."
      />,
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Numer PESEL musi mieć 11 cyfr.');
    expect(screen.getByRole('alert')).toHaveTextContent('Numer PESEL musi mieć 11 cyfr.');
  });

  it('changes a controlled switch with the keyboard and prevents changes when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Example() {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          label="Powiadomienia"
          checked={checked}
          onCheckedChange={(value) => {
            setChecked(value);
            onChange(value);
          }}
        />
      );
    }
    const { rerender } = render(<Example />);
    const control = screen.getByRole('switch', { name: 'Powiadomienia' });
    await user.tab();
    expect(control).toHaveFocus();
    await user.keyboard(' ');
    expect(control).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(' ');
    expect(control).not.toBeChecked();
    rerender(<Switch label="Powiadomienia" checked={false} disabled onCheckedChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe('keyboard navigation', () => {
  it('moves between tabs with arrow keys and exposes only the active panel', async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        label="Dokumenty"
        items={[
          { value: 'active', label: 'Aktywne', content: 'Ważne dokumenty' },
          { value: 'archived', label: 'Archiwum', content: 'Dokumenty archiwalne' },
        ]}
      />,
    );
    const activeTab = screen.getByRole('tab', { name: 'Aktywne' });
    await user.tab();
    expect(activeTab).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Archiwum' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Archiwum' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Dokumenty archiwalne');
    expect(screen.queryByText('Ważne dokumenty')).not.toBeInTheDocument();
  });

  it('traps focus in a dialog and restores it to the trigger after Escape', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button>Dalsza akcja strony</Button>
        <Dialog
          trigger={<Button>Otwórz potwierdzenie</Button>}
          title="Potwierdź zmianę"
          description="Możesz zmienić tę decyzję później."
        >
          <TextField label="Komentarz" />
          <Button>Zatwierdź</Button>
        </Dialog>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Otwórz potwierdzenie' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Potwierdź zmianę' });
    expect(dialog).toHaveAccessibleDescription('Możesz zmienić tę decyzję później.');
    const close = within(dialog).getByRole('button', { name: 'Zamknij okno' });
    await waitFor(() => expect(close).toHaveFocus());
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Zatwierdź' })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('layout and numeric boundaries', () => {
  it('preserves skeleton styles unless explicit dimension props override them', () => {
    const { rerender } = render(
      <Skeleton data-testid="skeleton" style={{ width: '75%', height: 52, marginBottom: 10 }} />,
    );
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '75%', height: '52px', marginBottom: '10px' });
    rerender(
      <Skeleton
        data-testid="skeleton"
        width={120}
        height={0}
        style={{ width: '75%', height: 52 }}
      />,
    );
    expect(skeleton).toHaveStyle({ width: '120px', height: '0px' });
    rerender(<Skeleton data-testid="skeleton" />);
    expect(skeleton).toHaveStyle({ height: '16px' });
  });

  it.each([
    [-5, 0],
    [140, 100],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    [53.5, 53.5],
  ])('keeps progress %s within its accessible and visual range', (value, expected) => {
    render(<Progress value={value} label="Kompletność profilu" />);
    const progress = screen.getByRole('progressbar', { name: 'Kompletność profilu' });
    expect(progress).toHaveAttribute('aria-valuenow', String(expected));
    expect(progress.firstElementChild).toHaveStyle({ width: `${expected}%` });
  });

  it('keeps tooltip content in its local platform and theme scope', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const user = userEvent.setup();
    render(
      <div data-theme="dark" data-platform="mobile">
        <Tooltip content="Podpowiedź do działania">
          <Button>Sprawdź</Button>
        </Tooltip>
      </div>,
    );
    await user.tab();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.closest('[data-theme]')).toHaveAttribute('data-theme', 'dark');
    expect(tooltip.closest('[data-platform]')).toHaveAttribute('data-platform', 'mobile');
  });
});
