import { useRef } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useNativeFormReset } from './form-reset';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test('unmount cancels deferred reset work and removes the form listener', () => {
  vi.useFakeTimers();
  const reset = vi.fn();
  function Example() {
    const input = useRef<HTMLInputElement>(null);
    useNativeFormReset(input, reset);
    return (
      <form>
        <input ref={input} />
      </form>
    );
  }
  const { container, unmount } = render(<Example />);
  const form = container.querySelector('form')!;
  fireEvent.reset(form);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.reset(form);
  vi.runAllTimers();
  expect(reset).not.toHaveBeenCalled();
});
