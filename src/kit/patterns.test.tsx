import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNavigation, DocumentTile, Sidebar } from './patterns';
afterEach(cleanup);
const items = [
  { value: 'docs', label: 'Dokumenty', icon: <span>D</span> },
  { value: 'services', label: 'Usługi', icon: <span>U</span> },
];
describe('reusable navigation patterns', () => {
  it('announces the active tab and changes it using the keyboard', async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<BottomNavigation items={items} value="docs" onValueChange={change} />);
    expect(screen.getByRole('button', { name: 'Dokumenty' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('services');
  });
  it('does not activate a disabled sidebar destination', async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(
      <Sidebar
        items={[...items, { value: 'off', label: 'Niedostępne', icon: <span />, disabled: true }]}
        value="docs"
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Niedostępne' }));
    expect(change).not.toHaveBeenCalled();
  });
  it('changes the selected artwork without adding icon text to the destination name', async () => {
    const user = userEvent.setup();
    const destinations = [
      {
        value: 'docs',
        label: 'Dokumenty',
        icon: <span data-testid="docs-outline">Kontur</span>,
        activeIcon: <span data-testid="docs-filled">Wypełnienie</span>,
      },
      {
        value: 'services',
        label: 'Usługi',
        icon: <span data-testid="services-outline">Kontur</span>,
      },
    ];
    function Example() {
      const [active, setActive] = useState('docs');
      return (
        <BottomNavigation
          items={destinations}
          value={active}
          onValueChange={setActive}
          homeIndicator
        />
      );
    }
    render(<Example />);
    expect(screen.getByRole('button', { name: 'Dokumenty' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByTestId('docs-filled')).toBeInTheDocument();
    expect(screen.queryByTestId('docs-outline')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Usługi' }));
    expect(screen.getByRole('button', { name: 'Usługi' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Dokumenty' })).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('docs-outline')).toBeInTheDocument();
    expect(screen.queryByTestId('docs-filled')).not.toBeInTheDocument();
    expect(screen.getByTestId('services-outline')).toBeInTheDocument();
  });
  it('closes drawer navigation from the keyboard without selecting a destination', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    const change = vi.fn();
    const { rerender } = render(
      <Sidebar mode="drawer" onClose={close} items={items} value="docs" onValueChange={change} />,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Zamknij nawigację' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(close).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    rerender(
      <Sidebar
        mode="persistent"
        onClose={close}
        items={items}
        value="docs"
        onValueChange={change}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Zamknij nawigację' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Nawigacja boczna' })).toBeInTheDocument();
  });
  it('makes a document actionable only when it has a handler', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const { rerender } = render(<DocumentTile title="Dokument" icon={<span />} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<DocumentTile title="Dokument" icon={<span />} onClick={action} />);
    await user.click(screen.getByRole('button', { name: 'Dokument' }));
    expect(action).toHaveBeenCalledOnce();
  });
});
