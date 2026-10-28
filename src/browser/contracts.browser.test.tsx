import { afterEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render, screen } from '@testing-library/react';
import { PortalDatePicker } from '../kit/portal/Calendar';
import { PortalFormField, PortalSelect } from '../kit/portal/Forms';
import { BrowserExample, BrowserSurface } from './fixtures';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

test('Controls change the rendered example, including disabled and loading behavior', async () => {
  const view = render(
    <BrowserExample name="Button" args={{ children: 'Zapisz sprawę', disabled: false }} />,
  );
  await expect.element(page.getByRole('button', { name: 'Zapisz sprawę' })).toBeEnabled();
  view.rerender(
    <BrowserExample name="Button" args={{ children: 'Zapisz sprawę', disabled: true }} />,
  );
  await expect.element(page.getByRole('button', { name: 'Zapisz sprawę' })).toBeDisabled();
  view.rerender(
    <BrowserExample name="Button" args={{ children: 'Zapisz sprawę', loading: true }} />,
  );
  await expect.element(page.getByRole('button', { name: /Zapisz sprawę/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: /Zapisz sprawę/ }).getAttribute('aria-busy')).toBe(
    'true',
  );
});

for (const theme of ['light', 'dark'] as const)
  test(`portal input surfaces retain readable colors in ${theme}`, async () => {
    render(
      <BrowserSurface theme={theme}>
        <PortalFormField label="Imię">
          <input />
        </PortalFormField>
        <PortalDatePicker label="Wizyta" defaultValue="2026-10-20" />
        <PortalSelect label="Kanał kontaktu" options={[{ value: 'email', label: 'E-mail' }]} />
      </BrowserSurface>,
    );
    const input = screen.getByRole('textbox', { name: 'Imię' });
    const date = screen.getByRole('textbox', { name: 'Wizyta' });
    const select = screen.getByRole('combobox');
    const surface = getComputedStyle(input).backgroundColor;
    expect(getComputedStyle(input).color).not.toBe(surface);
    expect(getComputedStyle(select).backgroundColor).toBe(surface);
    expect(getComputedStyle(date.parentElement!).backgroundColor).toBe(surface);
    await page.getByRole('textbox', { name: 'Wizyta' }).click();
    expect(getComputedStyle(date).outlineStyle).toBe('none');
    expect(getComputedStyle(date).boxShadow).toBe('none');
  });

test('a composed date field keeps one outer border and the native input geometry', async () => {
  render(
    <BrowserSurface>
      <PortalFormField>
        <PortalDatePicker label="Termin" defaultValue="2026-10-20" />
      </PortalFormField>
    </BrowserSurface>,
  );
  const input = screen.getByRole('textbox', { name: 'Termin' });
  expect(getComputedStyle(input).borderTopWidth).toBe('0px');
  expect(input.getBoundingClientRect().height).toBe(46);
  await page.getByRole('textbox', { name: 'Termin' }).click();
  expect(getComputedStyle(input).outlineStyle).toBe('none');
});

for (const theme of ['light', 'dark'] as const)
  test(`mobile navigation keeps its geometry after changing tab in ${theme}`, async () => {
    await page.viewport(375, 812);
    render(<BrowserExample name="BottomNavigation" theme={theme} corePlatform="mobile" />);
    const buttons = screen.getAllByRole('button');
    const before = buttons.map((node) => node.getBoundingClientRect());
    await page.getByRole('button', { name: 'Usługi' }).click();
    expect(screen.getByRole('button', { name: 'Usługi' }).getAttribute('aria-current')).toBe(
      'page',
    );
    buttons.forEach((node, index) => {
      const after = node.getBoundingClientRect();
      expect(after.x).toBeCloseTo(before[index].x, 2);
      expect(after.width).toBeCloseTo(before[index].width, 2);
    });
    expect(
      Math.max(...before.map((box) => box.width)) - Math.min(...before.map((box) => box.width)),
    ).toBeLessThan(1);
  });

test('cookie preferences open, save an explicit refusal and restore focus', async () => {
  render(<BrowserExample name="LandingCookieConsent" />);
  await page.getByRole('button', { name: 'Ustawienia plików cookies' }).click();
  await expect.element(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Odmowa', exact: true }).click();
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  const record = JSON.parse(localStorage.getItem('mdesign-storybook-consent')!);
  expect(record).toMatchObject({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });
  await expect
    .element(page.getByRole('button', { name: 'Ustawienia plików cookies' }))
    .toHaveFocus();
});
