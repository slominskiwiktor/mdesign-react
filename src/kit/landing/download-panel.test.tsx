import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { LandingDownloadPanel } from './overlays';

afterEach(cleanup);

test('the download panel gives its QR image a neutral and customizable description', () => {
  const { rerender } = render(<LandingDownloadPanel open qrImage="/download.png" />);
  expect(screen.getByRole('img', { name: 'Kod QR do strony pobierania' })).toHaveAttribute(
    'src',
    '/download.png',
  );
  rerender(
    <LandingDownloadPanel open qrImage="/custom-qr.png" qrAlt="Kod QR do pobrania Example App" />,
  );
  expect(screen.getByRole('img', { name: 'Kod QR do pobrania Example App' })).toHaveAttribute(
    'src',
    '/custom-qr.png',
  );
});
