import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  location.hash = 'forms';
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  location.hash = '';
});

describe('catalog integration', () => {
  it('moves the skip-link focus to main without losing the active route', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: 'Przejdź do treści' }));
    expect(location.hash).toBe('#forms');
    expect(screen.getByRole('heading', { name: 'Formularze', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
  });
  it('validates a real form and clears the error after valid submission', async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = screen.getByRole('textbox', { name: 'Adres e-mail do powiadomień' });
    const form = field.closest('form')!;
    await user.click(within(form).getByRole('button', { name: 'Zapisz preferencje' }));
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Podaj poprawny adres e-mail.');
    await user.type(field, 'jan@example.pl');
    await user.click(within(form).getByRole('button', { name: 'Zapisz preferencje' }));
    expect(within(form).getByText('Zapisano preferencje')).toBeInTheDocument();
    expect(field).not.toHaveAttribute('aria-invalid', 'true');
  });
});
