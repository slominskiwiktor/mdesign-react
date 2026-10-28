import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './SearchField';

afterEach(cleanup);

describe('SearchField', () => {
  it('labels a controlled search, forwards its ref and clears through the change handler', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [query, setQuery] = useState('PESEL');
      return (
        <div data-platform="mobile">
          <SearchField
            ref={ref}
            label="Szukaj usług"
            value={query}
            onChange={(event) => {
              changed(event.target.value);
              setQuery(event.target.value);
            }}
          />
          <output aria-label="Zapytanie">{query}</output>
        </div>
      );
    }
    const { unmount } = render(<Example />);
    const input = screen.getByRole('searchbox', { name: 'Szukaj usług' });
    expect(ref.current).toBe(input);
    expect(input).toHaveValue('PESEL');
    await user.type(input, ' online');
    expect(screen.getByRole('status', { name: 'Zapytanie' })).toHaveTextContent('PESEL online');
    await user.click(screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }));
    expect(changed).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Wyczyść wyszukiwanie' })).not.toBeInTheDocument();
    unmount();
    expect(ref.current).toBeNull();
  });

  it('keeps validation accessible and prevents clearing readonly or disabled text', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(
      <SearchField
        label="Znajdź dokument"
        defaultValue="Karta"
        clearLabel="Usuń zapytanie"
        hint="Wpisz nazwę dokumentu."
        onChange={changed}
        readOnly
      />,
    );
    const input = screen.getByRole('searchbox', { name: 'Znajdź dokument' });
    expect(input).toHaveAccessibleDescription('Wpisz nazwę dokumentu.');
    expect(screen.queryByRole('button', { name: 'Usuń zapytanie' })).not.toBeInTheDocument();
    await user.type(input, ' X');
    expect(input).toHaveValue('Karta');
    expect(changed).not.toHaveBeenCalled();
    rerender(
      <SearchField
        label="Znajdź dokument"
        defaultValue="Karta"
        clearLabel="Usuń zapytanie"
        error="Spróbuj ponownie później."
        disabled
      />,
    );
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Spróbuj ponownie później.');
    expect(screen.queryByRole('button', { name: 'Usuń zapytanie' })).not.toBeInTheDocument();
  });
});
