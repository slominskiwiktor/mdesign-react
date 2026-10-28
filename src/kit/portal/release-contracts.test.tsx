import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { PortalDialogProvider, usePortalDialog } from './Dialogs';

afterEach(cleanup);
it('resolves a request closed in the same event that opened it', async () => {
  let api!: ReturnType<typeof usePortalDialog>;
  function Consumer() {
    api = usePortalDialog();
    return null;
  }
  render(
    <PortalDialogProvider>
      <Consumer />
    </PortalDialogProvider>,
  );
  let result!: Promise<boolean>;
  act(() => {
    result = api.open({ title: 'Confirm' });
    api.closeAll();
  });
  expect(await result).toBe(false);
});
it('consecutive closes resolve each queued request exactly once', async () => {
  let api!: ReturnType<typeof usePortalDialog>;
  function Consumer() {
    api = usePortalDialog();
    return null;
  }
  render(
    <PortalDialogProvider>
      <Consumer />
    </PortalDialogProvider>,
  );
  const resolveFirst = vi.fn();
  const resolveSecond = vi.fn();
  let first!: Promise<boolean>, second!: Promise<boolean>;
  act(() => {
    first = api.open({ title: 'First' }).then((value) => {
      resolveFirst(value);
      return value;
    });
    second = api.open({ title: 'Second' }).then((value) => {
      resolveSecond(value);
      return value;
    });
    api.close(true);
    api.close(false);
  });
  expect(await Promise.all([first, second])).toEqual([true, false]);
  expect(resolveFirst).toHaveBeenCalledOnce();
  expect(resolveSecond).toHaveBeenCalledOnce();
});
