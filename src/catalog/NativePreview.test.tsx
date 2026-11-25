import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { NativePreview } from './NativePreview.js';

test('hides copied code when the global platform changes', async () => {
  const source = (platform: string) => `Kod: ${platform}`;
  const { rerender } = render(
    <NativePreview choice="ios" source={source}>
      Podgląd
    </NativePreview>,
  );
  fireEvent.click(screen.getByText('React Native · iOS'));
  fireEvent.click(screen.getByRole('button', { name: 'Kopiuj kod React Native' }));
  expect(await screen.findByLabelText('Wygenerowany kod React Native')).toHaveValue('Kod: ios');

  rerender(
    <NativePreview choice="android" source={source}>
      Podgląd
    </NativePreview>,
  );
  expect(screen.queryByLabelText('Wygenerowany kod React Native')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Kopiuj kod React Native' }));
  expect(await screen.findByLabelText('Wygenerowany kod React Native')).toHaveValue('Kod: android');
});
