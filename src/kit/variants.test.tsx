import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, Checkbox } from './components.js';

afterEach(cleanup);

describe('controlled component variants', () => {
  it('resolves a mixed checkbox through the change callbacks and preserves its description and ref', async () => {
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [mixed, setMixed] = useState(true);
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          ref={ref}
          label="Wszystkie dokumenty"
          hint="Wybiera wszystkie pozycje."
          checked={checked}
          indeterminate={mixed}
          onIndeterminateChange={setMixed}
          onChange={(e) => setChecked(e.target.checked)}
        />
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    const input = screen.getByRole('checkbox', { name: 'Wszystkie dokumenty' });
    expect(input).toBePartiallyChecked();
    expect(input).toHaveAccessibleDescription('Wybiera wszystkie pozycje.');
    expect(ref.current).toBe(input);
    await user.click(input);
    expect(input).not.toBePartiallyChecked();
    expect(input).toBeChecked();
    expect(input).toHaveFocus();
    await user.click(input);
    expect(input).not.toBeChecked();
  });
  it('allows only one controlled disclosure at a time and supports its external reset', async () => {
    const user = userEvent.setup();
    function Example() {
      const [expanded, setExpanded] = useState<string[]>([]);
      return (
        <>
          <Accordion
            expanded={expanded}
            onExpandedChange={setExpanded}
            multiple={false}
            items={[
              { id: 'one', title: 'Pierwsza sekcja', content: 'Pierwsza treść' },
              { id: 'two', title: 'Druga sekcja', content: 'Druga treść' },
            ]}
          />
          <button onClick={() => setExpanded([])}>Zwiń wszystkie</button>
        </>
      );
    }
    render(<Example />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    await user.click(screen.getByText('Pierwsza sekcja'));
    expect(screen.getByRole('region', { name: 'Pierwsza sekcja' })).toBeVisible();
    await user.click(screen.getByText('Druga sekcja'));
    expect(screen.queryByRole('region', { name: 'Pierwsza sekcja' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Druga sekcja' })).toBeVisible();
    await user.click(screen.getByText('Zwiń wszystkie'));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
  it('requests a per-item expansion while its controlling prop retains ownership', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    const { rerender } = render(
      <Accordion
        items={[
          { title: 'Szczegóły', content: 'Dane dokumentu', open: false, onExpandedChange: changed },
        ]}
      />,
    );
    await user.click(screen.getByText('Szczegóły'));
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    rerender(
      <Accordion
        items={[
          { title: 'Szczegóły', content: 'Dane dokumentu', open: true, onExpandedChange: changed },
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: 'Szczegóły' })).toBeVisible();
  });
});
