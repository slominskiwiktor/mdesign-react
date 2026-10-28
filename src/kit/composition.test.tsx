import { createRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListRow, ServiceTile, Tooltip } from './components.js';
import { LandingLink, LandingProvider, LandingTooltip } from './landing/core.js';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('forwards landing refs through a tooltip trigger and provider boundary', async () => {
  const user = userEvent.setup();
  const anchor = createRef<HTMLAnchorElement>();
  const provider = createRef<HTMLDivElement>();
  render(
    <LandingProvider ref={provider}>
      <LandingTooltip content="Informacja o odnośniku">
        <LandingLink ref={anchor} href="#details">
          Szczegóły
        </LandingLink>
      </LandingTooltip>
    </LandingProvider>,
  );
  expect(provider.current).toHaveClass('m-landing');
  expect(anchor.current).toBe(screen.getByRole('link', { name: 'Szczegóły' }));
  await user.tab();
  expect(anchor.current).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Informacja o odnośniku');
});

it('lets interactive rows act as ref-capable tooltip triggers', async () => {
  const user = userEvent.setup();
  const row = createRef<HTMLElement>();
  const tile = createRef<HTMLElement>();
  render(
    <>
      <Tooltip content="Informacja o wierszu">
        <ListRow ref={row} title="Wiersz" onClick={() => {}} />
      </Tooltip>
      <ServiceTile ref={tile} icon="✓" title="Usługa" onClick={() => {}} />
    </>,
  );
  expect(row.current?.tagName).toBe('BUTTON');
  expect(tile.current?.tagName).toBe('BUTTON');
  await user.tab();
  expect(row.current).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Informacja o wierszu');
});
