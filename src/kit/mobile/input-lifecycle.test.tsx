import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { MobileTextArea, PinInput } from './inputs';
import { MobileSnackbar, SnackbarProvider, useSnackbar } from './overlays';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

for (const kind of ['pin', 'textarea'] as const) {
  test(`${kind} forwards React 19 ref cleanup and does not detach a stable ref on editing`, () => {
    const dispose = vi.fn();
    const ref = vi.fn(() => dispose);
    const view = (value: string) =>
      kind === 'pin' ? (
        <PinInput label="Input" value={value} ref={ref} />
      ) : (
        <MobileTextArea label="Input" value={value} ref={ref} />
      );
    const { rerender, unmount } = render(view('1234'));
    rerender(view('5678'));
    expect(ref).toHaveBeenCalledOnce();
    expect(dispose).not.toHaveBeenCalled();
    unmount();
    expect(dispose).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenCalledOnce();
  });
}

test('changing a persistent snackbar to a finite duration starts its full timeout', () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const { rerender } = render(
    <MobileSnackbar message="Saving" duration={Infinity} onDismiss={dismiss} />,
  );
  act(() => vi.advanceTimersByTime(5000));
  rerender(<MobileSnackbar message="Saved" duration={3500} onDismiss={dismiss} />);
  act(() => vi.advanceTimersByTime(3499));
  expect(dismiss).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(dismiss).toHaveBeenCalledOnce();
});

test('replacing a snackbar with the same id and message restarts its lifetime', () => {
  vi.useFakeTimers();
  function Example() {
    const { show } = useSnackbar();
    return (
      <button onClick={() => show({ id: 'save', message: 'Saved', duration: 1000 })}>Show</button>
    );
  }
  render(
    <SnackbarProvider>
      <Example />
    </SnackbarProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Show' }));
  act(() => vi.advanceTimersByTime(800));
  fireEvent.click(screen.getByRole('button', { name: 'Show' }));
  act(() => vi.advanceTimersByTime(999));
  expect(screen.getByRole('status')).toHaveTextContent('Saved');
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole('status')).toBeNull();
});

test('unmount clears snackbar expiry before it can call onDismiss', () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const { unmount } = render(
    <MobileSnackbar message="Saved" duration={1000} onDismiss={dismiss} />,
  );
  unmount();
  act(() => vi.runAllTimers());
  expect(dismiss).not.toHaveBeenCalled();
});
