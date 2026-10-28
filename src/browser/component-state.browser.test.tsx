import { useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { page } from 'vitest/browser';
import { LandingDocumentCarousel } from '../kit/landing/content';
import { LandingProvider } from '../kit/landing/core';
import { MaskedField, MobileTextArea, PhoneField, PinInput } from '../kit/mobile/inputs';
import { PortalSelect } from '../kit/portal/Forms';
import { PortalFileUpload } from '../kit/portal/FileUpload';
import { BrowserSurface } from './fixtures';

afterEach(cleanup);

const documents = Array.from({ length: 5 }, (_, index) => ({
  id: String(index),
  title: `Document ${index + 1}`,
  href: `#document-${index + 1}`,
  image:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="400"/%3E',
}));

function Carousel({
  value,
  onValueChange,
}: {
  value?: number;
  onValueChange?: (next: number) => void;
}) {
  return (
    <BrowserSurface platform="landing">
      <div style={{ width: 600 }}>
        <LandingProvider animationsDisabled>
          <LandingDocumentCarousel
            title="Documents"
            items={documents}
            value={value}
            onValueChange={onValueChange}
          />
        </LandingProvider>
      </div>
    </BrowserSurface>
  );
}

function desiredScroll(track: HTMLElement, index: number) {
  return Math.min(
    (track.children[index] as HTMLElement).offsetLeft - track.offsetLeft,
    track.scrollWidth - track.clientWidth,
  );
}

test('controlled carousel scroll follows external values and rejects an unaccepted button change', async () => {
  const change = vi.fn();
  const { container, rerender } = render(<Carousel value={0} onValueChange={change} />);
  const track = container.querySelector<HTMLElement>('.ml-document-track')!;
  await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 0))).toBeLessThan(2);
  rerender(<Carousel value={2} onValueChange={change} />);
  await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 2))).toBeLessThan(2);
  expect(screen.getByText('Dokument 3 z 5')).toBeVisible();
  expect(change).not.toHaveBeenCalled();
  await page.getByRole('button', { name: 'Następny dokument' }).click();
  expect(change).toHaveBeenCalledExactlyOnceWith(3);
  expect(Math.abs(track.scrollLeft - desiredScroll(track, 2))).toBeLessThan(2);
  expect(screen.getByText('Dokument 3 z 5')).toBeVisible();
});

test('carousel accepts controlled navigation to the last slide without a scroll callback reversing it', async () => {
  const change = vi.fn();
  function Example() {
    const [value, setValue] = useState(0);
    return (
      <Carousel
        value={value}
        onValueChange={(next) => {
          change(next);
          setValue(next);
        }}
      />
    );
  }
  const { container } = render(<Example />);
  const track = container.querySelector<HTMLElement>('.ml-document-track')!;
  await page.getByRole('button', { name: 'Następny dokument' }).click();
  await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 1))).toBeLessThan(2);
  await page.getByRole('button', { name: 'Następny dokument' }).click();
  await page.getByRole('button', { name: 'Następny dokument' }).click();
  await page.getByRole('button', { name: 'Następny dokument' }).click();
  await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 4))).toBeLessThan(2);
  expect(screen.getByText('Dokument 5 z 5')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Następny dokument' })).toBeDisabled();
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, 2, 3, 4]);
});

test('a controlled carousel restores its value after a rejected native scroll', async () => {
  const change = vi.fn();
  const { container } = render(<Carousel value={1} onValueChange={change} />);
  const track = container.querySelector<HTMLElement>('.ml-document-track')!;
  await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 1))).toBeLessThan(2);
  fireEvent.wheel(track, { deltaX: 1000 });
  track.scrollTo({ left: track.scrollWidth });
  await expect.poll(() => change.mock.calls.length).toBe(1);
  expect(change).toHaveBeenCalledWith(4);
  await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 1))).toBeLessThan(2);
  expect(screen.getByText('Dokument 2 z 5')).toBeVisible();
});

for (const controlled of [false, true]) {
  test(`${controlled ? 'controlled' : 'uncontrolled'} carousel accepts native scrolling and can navigate back`, async () => {
    const change = vi.fn();
    function Example() {
      const [value, setValue] = useState(0);
      return (
        <Carousel
          value={controlled ? value : undefined}
          onValueChange={(next) => {
            change(next);
            setValue(next);
          }}
        />
      );
    }
    const { container } = render(<Example />);
    const track = container.querySelector<HTMLElement>('.ml-document-track')!;
    fireEvent.wheel(track, { deltaX: 1000 });
    track.scrollTo({ left: track.scrollWidth });
    await expect.poll(() => screen.queryByText('Dokument 5 z 5')).not.toBeNull();
    expect(change).toHaveBeenCalledExactlyOnceWith(4);
    await page.getByRole('button', { name: 'Poprzedni dokument' }).click();
    await expect.poll(() => Math.abs(track.scrollLeft - desiredScroll(track, 3))).toBeLessThan(2);
    expect(screen.getByText('Dokument 4 z 5')).toBeVisible();
    expect(change.mock.calls.map(([index]) => index)).toEqual([4, 3]);
  });
}

type ResetMode = 'normal' | 'canceled' | 'controlled' | 'disabled';
const initialValues = ['1234', '12345', 'initial', '+48', '123'];
const editedValues = ['9876', '99999', 'changed', '+48', '999'];

function MobileResetForm({ mode, changed }: { mode: ResetMode; changed: () => void }) {
  const [disabled, setDisabled] = useState(false);
  const [resets, setResets] = useState(0);
  const controlled = mode === 'controlled';
  return (
    <BrowserSurface platform="mobile">
      <form
        onReset={(event) => {
          if (mode === 'canceled') event.preventDefault();
          setResets((count) => count + 1);
        }}
      >
        <PinInput
          label="PIN"
          name="pin"
          masked={false}
          disabled={disabled}
          onValueChange={changed}
          {...(controlled ? { value: '1234' } : { defaultValue: '1234' })}
        />
        <MaskedField
          label="Code"
          name="code"
          mask="#####"
          disabled={disabled}
          onValueChange={changed}
          {...(controlled ? { value: '12345' } : { defaultValue: '12345' })}
        />
        <MobileTextArea
          label="Text"
          name="text"
          disabled={disabled}
          onValueChange={changed}
          {...(controlled ? { value: 'initial' } : { defaultValue: 'initial' })}
        />
        <PhoneField
          label="Phone"
          countryCodeName="country"
          numberName="phone"
          disabled={disabled}
          onValueChange={changed}
          {...(controlled
            ? { value: { countryCode: '+48', number: '123' } }
            : { defaultValue: { countryCode: '+48', number: '123' } })}
        />
        <button type="button" onClick={() => setDisabled(true)}>
          Disable fields
        </button>
        <button type="reset">Reset</button>
        <output>{resets}</output>
      </form>
    </BrowserSurface>
  );
}

for (const mode of ['normal', 'canceled', 'controlled', 'disabled'] as const) {
  test(`mobile named fields preserve native ${mode} reset semantics`, async () => {
    const changed = vi.fn();
    const { container } = render(<MobileResetForm mode={mode} changed={changed} />);
    const form = container.querySelector('form')!;
    const fields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
    );
    if (mode !== 'controlled') {
      await page.getByRole('textbox', { name: 'PIN', exact: true }).fill('9876');
      await page.getByRole('textbox', { name: 'Code', exact: true }).fill('99999');
      await page.getByRole('textbox', { name: 'Text', exact: true }).fill('changed');
      await page.getByRole('textbox', { name: 'Phone, Numer telefonu', exact: true }).fill('999');
      expect(fields.map((field) => field.value)).toEqual(editedValues);
    }
    if (mode === 'disabled') await page.getByRole('button', { name: 'Disable fields' }).click();
    changed.mockClear();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect
      .poll(() => fields.map((field) => field.value))
      .toEqual(mode === 'canceled' ? editedValues : initialValues);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('1');
    expect(Array.from(new FormData(form).values())).toEqual(
      mode === 'disabled' ? [] : mode === 'canceled' ? editedValues : initialValues,
    );
  });
}

test('React can cancel reset without a portal select changing its label or submitted value', async () => {
  function Example() {
    const [resets, setResets] = useState(0);
    return (
      <BrowserSurface>
        <form
          onReset={(event) => {
            event.preventDefault();
            setResets((count) => count + 1);
          }}
        >
          <input name="native" aria-label="Native" defaultValue="initial" />
          <PortalSelect
            name="choice"
            label="Choice"
            defaultValue="a"
            options={[
              { value: 'a', label: 'Alpha' },
              { value: 'b', label: 'Beta' },
            ]}
          />
          <button type="reset">Reset</button>
          <output>{resets}</output>
        </form>
      </BrowserSurface>
    );
  }
  const { container } = render(<Example />);
  await page.getByRole('textbox', { name: 'Native', exact: true }).fill('changed');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Beta' }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect.poll(() => screen.getByRole('status').textContent).toBe('1');
  // Wait beyond the deferred native-reset task as well as the React event.
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(screen.getByRole('combobox')).toHaveTextContent('Beta');
  expect(Array.from(new FormData(container.querySelector('form')!))).toEqual([
    ['native', 'changed'],
    ['choice', 'b'],
  ]);
});

test('canceling an upload reset preserves the selected files and native FormData', async () => {
  const change = vi.fn();
  function Example() {
    const [resets, setResets] = useState(0);
    return (
      <BrowserSurface>
        <form
          onReset={(event) => {
            event.preventDefault();
            setResets((count) => count + 1);
          }}
        >
          <PortalFileUpload name="attachments" label="Attachments" onFilesChange={change} />
          <button type="reset">Reset</button>
          <output>{resets}</output>
        </form>
      </BrowserSurface>
    );
  }
  const { container } = render(<Example />);
  const file = new File(['selected content'], 'selected.txt', { type: 'text/plain' });
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } });
  await expect.poll(() => screen.queryByText('selected.txt')).not.toBeNull();
  change.mockClear();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(screen.getByText('selected.txt')).toBeVisible();
  expect(container.querySelector('output')).toHaveTextContent('1');
  expect(change).not.toHaveBeenCalled();
  const submitted = new FormData(container.querySelector('form')!).get('attachments') as File;
  expect(submitted.name).toBe('selected.txt');
  expect(await submitted.text()).toBe('selected content');
});

test('native upload reset restores defaultFiles with one notification and preserves controlled files', async () => {
  const initial = new File(['initial'], 'initial.txt');
  const added = new File(['added'], 'added.txt');
  const change = vi.fn();
  const view = (controlled: boolean) => (
    <BrowserSurface>
      <form>
        <PortalFileUpload
          name="attachments"
          label="Attachments"
          defaultFiles={[initial]}
          files={controlled ? [added] : undefined}
          onFilesChange={change}
        />
        <button type="reset">Reset</button>
      </form>
    </BrowserSurface>
  );
  const { container, rerender } = render(view(false));
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [added] } });
  await expect.poll(() => screen.queryByText('added.txt')).not.toBeNull();
  change.mockClear();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect.poll(() => change.mock.calls.length).toBe(1);
  expect(change).toHaveBeenCalledWith([initial]);
  await expect.poll(() => screen.queryByText('added.txt')).toBeNull();
  expect(
    new FormData(container.querySelector('form')!)
      .getAll('attachments')
      .map((file) => (file as File).name),
  ).toEqual(['initial.txt']);
  rerender(view(true));
  change.mockClear();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByText('added.txt')).toBeVisible();
  expect(
    new FormData(container.querySelector('form')!)
      .getAll('attachments')
      .map((file) => (file as File).name),
  ).toEqual(['added.txt']);
});

test('unmount discards a queued native upload reset', async () => {
  const change = vi.fn();
  const { container, unmount } = render(
    <BrowserSurface>
      <form>
        <PortalFileUpload
          defaultFiles={[new File(['initial'], 'initial.txt')]}
          label="Attachments"
          onFilesChange={change}
        />
      </form>
    </BrowserSurface>,
  );
  container.querySelector('form')!.reset();
  unmount();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(change).not.toHaveBeenCalled();
});
