import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { PortalSelect } from '../kit/portal/Forms';
import { PortalMenu } from '../kit/portal/Overlays';
import { PortalDialog } from '../kit/portal/Dialogs';
import { PortalDatePicker } from '../kit/portal/Calendar';
import { PortalFileUpload } from '../kit/portal/FileUpload';
import { BrowserSurface } from './fixtures';
const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];
afterEach(cleanup);

test('native reset restores both select label and submitted value', async () => {
  const { container } = render(
    <BrowserSurface>
      <form>
        <PortalSelect name="choice" label="Choice" defaultValue="a" options={options} />
        <button type="reset">Reset</button>
      </form>
    </BrowserSurface>,
  );
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Beta' }).click();
  expect(new FormData(container.querySelector('form')!).get('choice')).toBe('b');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect.poll(() => screen.getByRole('combobox').textContent).toContain('Alpha');
  expect(new FormData(container.querySelector('form')!).get('choice')).toBe('a');
});
test('native reset cannot diverge from a controlled select value', async () => {
  const { container } = render(
    <BrowserSurface>
      <form>
        <PortalSelect name="choice" label="Choice" value="b" options={options} />
        <button type="reset">Reset</button>
      </form>
    </BrowserSurface>,
  );
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  expect(screen.getByRole('combobox').textContent).toContain('Beta');
  expect(new FormData(container.querySelector('form')!).get('choice')).toBe('b');
});
test('disabling an open menu removes its actions', async () => {
  const select = vi.fn();
  const view = (disabled: boolean) => (
    <BrowserSurface>
      <PortalMenu
        label="Options"
        disabled={disabled}
        items={[{ id: 'run', label: 'Run', onSelect: select }]}
      />
    </BrowserSurface>
  );
  const { rerender } = render(view(false));
  await page.getByRole('button', { name: 'Options' }).click();
  expect(screen.getByRole('menuitem')).toBeVisible();
  rerender(view(true));
  expect(screen.queryByRole('menuitem')).toBeNull();
  expect(select).not.toHaveBeenCalled();
});
for (const kind of ['select', 'menu', 'calendar'] as const)
  test(`${kind} popup remains anchored and usable inside a transformed dialog`, async () => {
    render(
      <BrowserSurface theme="dark">
        <PortalDialog defaultOpen title="Dialog">
          {kind === 'select' ? (
            <PortalSelect label="Choice" options={options} />
          ) : kind === 'menu' ? (
            <PortalMenu label="Options" items={[{ id: 'run', label: 'Run' }]} />
          ) : (
            <PortalDatePicker label="Date" defaultValue="2026-10-20" />
          )}
        </PortalDialog>
      </BrowserSurface>,
    );
    const trigger =
      kind === 'select'
        ? page.getByRole('combobox')
        : kind === 'menu'
          ? page.getByRole('button', { name: 'Options' })
          : page.getByRole('button', { name: 'Wybierz datę' });
    await trigger.click();
    const popup = () =>
      document.querySelector<HTMLElement>(
        kind === 'select'
          ? '.mp-select-popup'
          : kind === 'menu'
            ? '.mp-menu-list'
            : '.mp-calendar-popover',
      )!;
    await expect.poll(() => popup()?.getBoundingClientRect().width ?? 0).toBeGreaterThan(100);
    await expect
      .poll(() => {
        const anchor =
          kind === 'select'
            ? screen.getByRole('combobox')
            : kind === 'menu'
              ? screen.getByRole('button', { name: 'Options' })
              : screen.getByRole('textbox', { name: 'Date' }).parentElement!;
        const a = anchor.getBoundingClientRect(),
          b = popup().getBoundingClientRect();
        return Math.min(Math.abs(b.top - a.bottom - 4), Math.abs(a.top - b.bottom - 4));
      })
      .toBeLessThan(2);
    const box = popup().getBoundingClientRect();
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(innerWidth);
    if (kind === 'select') {
      await page.getByRole('option', { name: 'Beta' }).click();
      expect(screen.getByRole('combobox').textContent).toContain('Beta');
    }
    if (kind === 'menu') {
      await page.getByRole('menuitem', { name: 'Run' }).click();
      expect(screen.queryByRole('menu')).toBeNull();
    }
  });
test('selected upload files participate in native FormData and disabled controls do not', async () => {
  const view = (disabled: boolean) => (
    <BrowserSurface>
      <form>
        <PortalFileUpload name="attachments" label="Attachments" disabled={disabled} />
      </form>
    </BrowserSurface>
  );
  const { container, rerender } = render(view(false));
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } });
  await expect.poll(() => screen.queryByText('hello.txt')).not.toBeNull();
  const data = new FormData(container.querySelector('form')!);
  const selected = data.get('attachments') as File;
  expect(selected.name).toBe('hello.txt');
  expect(await selected.text()).toBe('hello');
  rerender(view(true));
  expect(new FormData(container.querySelector('form')!).has('attachments')).toBe(false);
});

test('an open popup follows changes to the surrounding theme', async () => {
  const view = (theme: 'light' | 'dark') => (
    <BrowserSurface theme={theme}>
      <PortalSelect label="Choice" options={options} />
    </BrowserSurface>
  );
  const { rerender } = render(view('light'));
  await page.getByRole('combobox').click();
  const color = () => getComputedStyle(document.querySelector('.mp-select-popup')!).backgroundColor;
  const initial = color();
  rerender(view('dark'));
  await expect.poll(color).not.toBe(initial);
  expect(color()).toBe(getComputedStyle(screen.getByRole('combobox')).backgroundColor);
});
