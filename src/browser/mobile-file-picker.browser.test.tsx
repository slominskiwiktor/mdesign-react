import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { MobileFilePicker } from '../kit/mobile/overlays';
import { BrowserSurface } from './fixtures';

afterEach(cleanup);

const original = new File(['original'], 'original.txt', { type: 'text/plain' });
const selected = new File(['selected'], 'selected.txt', { type: 'text/plain' });
const extra = new File(['extra'], 'extra.txt', { type: 'text/plain' });
const rejected = new File(['image'], 'rejected.png', { type: 'image/png' });

test('required empty picker blocks native submit, announces the error and focuses its visible action', async () => {
  const submit = vi.fn();
  const { container } = render(
    <BrowserSurface platform="mobile">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <MobileFilePicker label="Attachments" required />
        <button type="submit">Submit</button>
      </form>
    </BrowserSurface>,
  );
  await page.getByRole('button', { name: 'Submit' }).click();
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Dodaj plik' })).toHaveFocus();
  await expect
    .poll(() => screen.queryByRole('alert')?.textContent)
    .toContain('Dodaj co najmniej jeden plik.');
  const input = container.querySelector<HTMLInputElement>('input[type=file]')!;
  expect(input).toHaveAttribute('aria-required', 'true');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input.validity.customError).toBe(true);
});

test('selected files satisfy required without a native FileList or FormData serialization', async () => {
  const submit = vi.fn();
  const { container } = render(
    <BrowserSurface platform="mobile">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <MobileFilePicker label="Attachments" required onRequestSource={(add) => add([selected])} />
        <button type="submit">Submit</button>
      </form>
    </BrowserSurface>,
  );
  await page.getByRole('button', { name: 'Dodaj plik' }).click();
  await expect.poll(() => screen.queryByText('selected.txt')).not.toBeNull();
  const input = container.querySelector<HTMLInputElement>('input[type=file]')!;
  expect(input.files).toHaveLength(0);
  expect(input.validity.customError).toBe(false);
  await page.getByRole('button', { name: 'Submit' }).click();
  expect(submit).toHaveBeenCalledOnce();
  expect(Array.from(new FormData(container.querySelector('form')!))).toEqual([]);
  await page.getByRole('button', { name: 'Usuń plik: selected.txt' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  expect(submit).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Dodaj plik' })).toHaveFocus();
});

test('a disabled required picker does not block form submission', async () => {
  const submit = vi.fn();
  const { container } = render(
    <BrowserSurface platform="mobile">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <MobileFilePicker label="Attachments" required disabled />
        <button type="submit">Submit</button>
      </form>
    </BrowserSurface>,
  );
  await page.getByRole('button', { name: 'Submit' }).click();
  expect(submit).toHaveBeenCalledOnce();
  expect(container.querySelector<HTMLInputElement>('input')!.willValidate).toBe(false);
  expect(container.querySelector<HTMLInputElement>('input')!.validity.customError).toBe(false);
  expect(screen.getByRole('button', { name: 'Dodaj plik' })).toBeDisabled();
});

for (const mode of ['uncontrolled', 'controlled', 'canceled'] as const) {
  test(`${mode} native reset preserves the picker value contract and resets issues when accepted`, async () => {
    const change = vi.fn();
    const source = vi
      .fn()
      .mockImplementationOnce((add) => add([extra]))
      .mockImplementationOnce((add) => add([rejected]));
    render(
      <BrowserSurface platform="mobile">
        <form
          onReset={(event) => {
            if (mode === 'canceled') event.preventDefault();
          }}
        >
          <MobileFilePicker
            label="Attachments"
            required
            accept="text/plain"
            defaultFiles={[original]}
            files={mode === 'controlled' ? [selected] : undefined}
            onFilesChange={change}
            onRequestSource={source}
          />
          <button type="reset">Reset</button>
        </form>
      </BrowserSurface>,
    );
    await page.getByRole('button', { name: 'Dodaj plik' }).click();
    await page.getByRole('button', { name: 'Dodaj plik' }).click();
    expect(screen.getByRole('alert')).toHaveTextContent('rejected.png');
    change.mockClear();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(change).not.toHaveBeenCalled();
    if (mode === 'canceled') {
      expect(screen.getByRole('alert')).toHaveTextContent('rejected.png');
      expect(screen.getByText('extra.txt')).toBeVisible();
    } else {
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByText('extra.txt')).toBeNull();
      expect(
        screen.getByText(mode === 'controlled' ? 'selected.txt' : 'original.txt'),
      ).toBeVisible();
    }
  });
}
