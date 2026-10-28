import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/react';
import { exampleRegistry } from '../stories/registry';
import type { ExampleArgs } from '../stories/registry';
import { BrowserExample } from './fixtures';
import { diff } from '@blazediff/core';
import { visualPixelmatchOptions } from './visual-comparison';

// Keep Date-dependent UI stable while real timers and requestAnimationFrame
// continue to drive Radix, image decoding and browser screenshot stabilization.
const referenceTime = new Date('2026-10-20T10:00:00.000Z');
beforeEach(() => {
  vi.setSystemTime(referenceTime);
  document.documentElement.lang = 'pl';
  localStorage.clear();
  window.scrollTo(0, 0);
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});
async function settle() {
  // An initial layout discovers fonts requested by freshly inserted content.
  document.body.getBoundingClientRect();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const faces = new Set(
    [...document.body.querySelectorAll<HTMLElement>('*')].map((element) => {
      const style = getComputedStyle(element);
      return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    }),
  );
  await Promise.all([...faces].map((face) => document.fonts.load(face)));
  await document.fonts.ready;
  await Promise.all(
    [...document.images]
      .filter((image) => image.currentSrc || image.src)
      .map((image) => image.decode()),
  );
  const backgrounds = new Set<string>();
  for (const element of document.body.querySelectorAll('*')) {
    const style = getComputedStyle(element);
    for (const value of [style.backgroundImage, style.maskImage]) {
      for (const match of value.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/g))
        backgrounds.add(match[1] ?? match[2] ?? match[3]);
    }
  }
  await Promise.all(
    [...backgrounds].map(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
    }),
  );
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
  // An element screenshot can report a1591px body while the iframe still clips
  // everything after its900px viewport. Expand the iframe before capturing a
  // tall composition; otherwise the resulting PNG has a misleading white tail.
  for (let attempt = 0; attempt < 3; attempt++) {
    const contentHeight = Math.ceil(
      Math.max(document.body.scrollHeight, document.body.getBoundingClientRect().height),
    );
    if (contentHeight <= window.innerHeight) break;
    await page.viewport(window.innerWidth, contentHeight);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }
  expect(document.body.getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight + 1);
  expect(Date.now()).toBe(referenceTime.getTime());
  expect(window.devicePixelRatio).toBe(1);
  expect(navigator.language).toBe('pl-PL');
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Europe/Warsaw');
  // Catch the runner's fit-to-window scaling rather than approving a resized
  // image as a native-size regression baseline.
  if (window.frameElement) {
    expect(window.frameElement.getBoundingClientRect().width).toBeCloseTo(window.innerWidth, 0);
    expect(window.frameElement.getBoundingClientRect().height).toBeCloseTo(window.innerHeight, 0);
  }
}

// Keep card layout fixtures stable when the documentation's editorial copy changes.
const cardBaselineArgs = {
  children:
    'Przykładowa treść komponentu. Zmień parametry w panelu Controls, aby sprawdzić jego warianty.',
};
// Component regression baselines use fixed viewports and deterministic example data.
for (const example of Object.values(exampleRegistry)) {
  test(`${example.category} ${example.name} default`, async () => {
    await page.viewport(example.category === 'mobile' ? 375 : 1280, 900);
    render(
      <BrowserExample
        name={example.name}
        args={['Card', 'MobileContentBox'].includes(example.name) ? cardBaselineArgs : undefined}
      />,
    );
    await settle();
    await expect(page.elementLocator(document.body)).toMatchScreenshot();
  });
}
const states: Array<{
  name: string;
  theme: 'light' | 'dark';
  args?: ExampleArgs;
  mobile?: boolean;
}> = [
  { name: 'Button', theme: 'dark' },
  { name: 'Button', theme: 'light', mobile: true },
  { name: 'Button', theme: 'dark', mobile: true, args: { loading: true } },
  { name: 'TextField', theme: 'dark' },
  { name: 'TextField', theme: 'light', args: { error: 'Sprawdź wpisaną wartość.' } },
  { name: 'BottomNavigation', theme: 'dark', mobile: true },
  { name: 'PortalDatePicker', theme: 'dark' },
  { name: 'PortalSelect', theme: 'dark' },
  { name: 'PortalFormField', theme: 'dark' },
  { name: 'PortalCard', theme: 'dark' },
  { name: 'MobileCalendar', theme: 'dark' },
  { name: 'PinInput', theme: 'dark' },
  { name: 'SmallServiceCard', theme: 'dark' },
  { name: 'RadioGroup', theme: 'dark' },
  { name: 'LandingCookieConsent', theme: 'light', args: { open: true } },
  { name: 'LandingCookieConsent', theme: 'light', mobile: true, args: { open: true } },
];
for (const [index, state] of states.entries())
  test(`${state.name} ${state.theme} variant ${index}`, async () => {
    const example = exampleRegistry[state.name];
    if (!example) throw new Error(`Unknown public component in visual fixture: ${state.name}`);
    await page.viewport(state.mobile || example.category === 'mobile' ? 375 : 1280, 900);
    render(
      <BrowserExample
        name={state.name}
        theme={state.theme}
        args={state.args}
        corePlatform={state.mobile ? 'mobile' : 'web'}
      />,
    );
    await settle();
    await expect(page.elementLocator(document.body)).toMatchScreenshot();
  });

// Compact targets keep small glyph/indicator changes from being diluted by a
// full viewport of whitespace. Existing full-canvas baselines stay unchanged.
const compactCases: Array<{
  name: string;
  selector: string;
  args?: ExampleArgs;
  width?: number;
}> = [
  { name: 'Button', selector: '.m-button' },
  { name: 'IconButton', selector: '.m-icon-button' },
  { name: 'Checkbox', selector: '.m-choice', args: { label: 'Zgoda', defaultChecked: true } },
  {
    name: 'PinInput',
    selector: '.m-mobile-pin-cells',
    args: { defaultValue: '1234', masked: false },
  },
  { name: 'PortalDatePicker', selector: '.mp-date-input', width: 368 },
  { name: 'FilterControl', selector: '.m-mobile-filter-control' },
];

for (const item of compactCases)
  test(`compact ${item.name}`, async () => {
    await page.viewport(exampleRegistry[item.name].category === 'mobile' ? 375 : 1280, 900);
    const view = render(
      <div style={{ width: item.width }}>
        <BrowserExample name={item.name} args={item.args} />
      </div>,
    );
    await settle();
    const target = view.container.querySelector<HTMLElement>(item.selector);
    expect(target).not.toBeNull();
    const box = target!.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(0);
    expect(box.width).toBeLessThanOrEqual(375);
    expect(box.height).toBeGreaterThan(0);
    expect(box.height).toBeLessThanOrEqual(80);
    await expect(page.elementLocator(target!)).toMatchScreenshot();
  });

async function capturePixels(target: HTMLElement) {
  const png = await page.screenshot({ element: target, save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${png}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas2D is required to decode the real browser PNG.');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  return { data: pixels.data, width: pixels.width, height: pixels.height, png };
}

test('compact comparator rejects removal of a real24px icon', async ({ annotate }) => {
  await page.viewport(1280, 900);
  const view = render(<BrowserExample name="IconButton" />);
  await settle();
  const button = view.container.querySelector<HTMLButtonElement>('.m-icon-button')!;
  const glyph = button.querySelector<HTMLElement>('span')!;
  expect(glyph.getBoundingClientRect().width).toBe(24);
  expect(glyph.getBoundingClientRect().height).toBe(24);
  const before = await capturePixels(button);
  glyph.style.visibility = 'hidden';
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
  const after = await capturePixels(button);
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  // @blazediff/core is the pixel diff used by Vitest's built-in pixelmatch
  // comparator. Use its actual configured threshold and allowed-pixel bound.
  const mismatched = diff(
    before.data,
    after.data,
    undefined,
    before.width,
    before.height,
    visualPixelmatchOptions,
  );
  const allowed =
    before.width * before.height * visualPixelmatchOptions.allowedMismatchedPixelRatio;
  const sensitivity = {
    width: before.width,
    height: before.height,
    glyphWidth: 24,
    glyphHeight: 24,
    mismatchedPixels: mismatched,
    allowedMismatchedPixels: allowed,
    ...visualPixelmatchOptions,
  };
  console.info('VRT_SENSITIVITY ' + JSON.stringify(sensitivity));
  await annotate(JSON.stringify(sensitivity), 'visual-sensitivity');
  await annotate('Before hiding the24px icon', 'visual-sensitivity', {
    contentType: 'image/png',
    body: before.png,
    bodyEncoding: 'base64',
  });
  await annotate('After hiding the24px icon', 'visual-sensitivity', {
    contentType: 'image/png',
    body: after.png,
    bodyEncoding: 'base64',
  });
  expect(mismatched).toBeGreaterThan(allowed);
  expect(mismatched).toBeGreaterThan(0);
});
