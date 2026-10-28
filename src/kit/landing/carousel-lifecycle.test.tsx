import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { LandingDocumentCarousel } from './content';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test('unmount cancels a queued controlled-scroll restoration and drag-release task', () => {
  vi.useFakeTimers();
  const frame = vi.fn(() => 123),
    cancelFrame = vi.fn();
  vi.stubGlobal('requestAnimationFrame', frame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  const { container, unmount } = render(
    <LandingDocumentCarousel
      title="Documents"
      value={0}
      items={[
        { id: 'a', title: 'A', href: '#a', image: '/a.png' },
        { id: 'b', title: 'B', href: '#b', image: '/b.png' },
      ]}
    />,
  );
  const track = container.querySelector<HTMLElement>('.ml-document-track')!;
  Object.defineProperties(track, { scrollWidth: { value: 300 }, clientWidth: { value: 100 } });
  Object.defineProperty(track.children[1], 'offsetLeft', { value: 100 });
  track.scrollLeft = 100;
  fireEvent.scroll(track);
  expect(frame).toHaveBeenCalledOnce();
  fireEvent.pointerUp(track);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(cancelFrame).toHaveBeenCalledWith(123);
  expect(vi.getTimerCount()).toBe(0);
});
