import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import { Button } from '../kit/components';
import { BrowserSurface } from './fixtures';

afterEach(cleanup);

for (const theme of ['light', 'dark'] as const) {
  test(`the documented web customization controls button colors and radius in ${theme}`, async () => {
    render(
      <BrowserSurface theme={theme}>
        <style>{`
          .my-app {
            --m-prime-brand: #0f6b5a;
            --m-prime-brand-hover: #0a5144;
            --m-prime-brand-active: #073d33;
            --m-prime-on-brand: #fff;
          }
          .my-app .m-button { border-radius: 8px; }
        `}</style>
        <div className="my-app">
          <Button>Customized button</Button>
        </div>
      </BrowserSurface>,
    );
    const locator = page.getByRole('button', { name: 'Customized button' });
    const button = screen.getByRole('button', { name: 'Customized button' });
    const color = () => getComputedStyle(button).backgroundColor;
    await locator.unhover();
    expect(color()).toBe('rgb(15, 107, 90)');
    expect(getComputedStyle(button).borderRadius).toBe('8px');
    expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)');
    await locator.hover();
    expect(color()).toBe('rgb(10, 81, 68)');
    button.focus();
    try {
      await userEvent.keyboard('[Space>]');
      expect(color()).toBe('rgb(7, 61, 51)');
      expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)');
    } finally {
      await userEvent.keyboard('[/Space]');
    }
  });
}
