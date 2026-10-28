import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PageIndicator } from './pages.js';

afterEach(cleanup);

it('bounds a huge page collection and preserves the current and last page actions', () => {
  const change = vi.fn();
  const { container, rerender } = render(
    <PageIndicator count={10_000_000} page={5_000_000} onPageChange={change} />,
  );
  expect(container.querySelector('nav')!.children.length).toBeLessThanOrEqual(7);
  expect(screen.getByRole('button', { name: 'Strona 5000001 z 10000000' })).toHaveAttribute(
    'aria-current',
    'step',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Strona 10000000 z 10000000' }));
  expect(change).toHaveBeenCalledExactlyOnceWith(9_999_999);
  rerender(<PageIndicator count={Number.MAX_VALUE} page={Number.MAX_VALUE} />);
  expect(container.querySelector('nav')!.children.length).toBeLessThanOrEqual(7);
  expect(container.querySelector('[data-active="true"]')).toHaveAttribute(
    'aria-label',
    `Strona ${Number.MAX_SAFE_INTEGER}, bieżąca`,
  );
});

it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
  'renders no indicators for invalid or empty count %s',
  (count) => {
    const { container } = render(<PageIndicator count={count} page={Number.NaN} />);
    expect(container.querySelector('nav')).toBeEmptyDOMElement();
  },
);

it('keeps small collections complete and normalizes fractional counts and page indices', () => {
  const { container, rerender } = render(<PageIndicator count={4.9} page={1.9} />);
  expect(container.querySelector('nav')!.children).toHaveLength(4);
  expect(container.querySelector('[data-active="true"]')).toHaveAttribute(
    'aria-label',
    'Strona 2, bieżąca',
  );
  rerender(<PageIndicator count={4} page={Number.NaN} />);
  expect(container.querySelector('[data-active="true"]')).toHaveAttribute(
    'aria-label',
    'Strona 1, bieżąca',
  );
});
