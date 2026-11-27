import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import type { NativePlatformChoice } from './native-export.js';
import { NativePreview, NativePreviewPreference } from './NativePreview.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Catalog() {
  const [choice, onChoiceChange] = useState<NativePlatformChoice>('auto');
  return (
    <NativePreviewPreference.Provider value={{ choice, onChoiceChange }}>
      <button onClick={() => onChoiceChange('ios')}>Ustaw iOS w katalogu</button>
      <NativePreview>Pierwszy przykład</NativePreview>
      <NativePreview>Drugi przykład</NativePreview>
    </NativePreviewPreference.Provider>
  );
}

test('keeps options in all previews synchronized with the catalog preference', () => {
  const { container } = render(<Catalog />);
  const choices = screen.getAllByLabelText('System podglądu');
  expect(choices.map((selector) => (selector as HTMLSelectElement).value)).toEqual([
    'auto',
    'auto',
  ]);

  fireEvent.change(choices[0], { target: { value: 'android' } });
  expect(choices[1]).toHaveValue('android');
  expect(
    container.querySelectorAll('[data-native-preview-content][data-mobile-os="android"]'),
  ).toHaveLength(2);

  fireEvent.click(screen.getByRole('button', { name: 'Ustaw iOS w katalogu' }));
  expect(choices[0]).toHaveValue('ios');
  expect(choices[1]).toHaveValue('ios');
  expect(
    container.querySelectorAll('[data-native-preview-content][data-mobile-os="ios"]'),
  ).toHaveLength(2);
});
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

test('does not copy a pending export after the platform changes', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  let resolveExport!: (code: string) => void;
  const pending = new Promise<string>((resolve) => {
    resolveExport = resolve;
  });
  const { rerender } = render(
    <NativePreview choice="ios" source={() => pending}>
      Podgląd
    </NativePreview>,
  );
  fireEvent.click(screen.getByText('React Native · iOS'));
  fireEvent.click(screen.getByRole('button', { name: 'Kopiuj kod React Native' }));
  rerender(
    <NativePreview choice="android" source={() => 'Kod Androida'}>
      Podgląd
    </NativePreview>,
  );
  await act(async () => resolveExport('Stary kod iOS'));
  expect(writeText).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Kopiuj kod React Native' }));
  expect(await screen.findByLabelText('Wygenerowany kod React Native')).toHaveValue('Kod Androida');
  expect(writeText).toHaveBeenCalledExactlyOnceWith('Kod Androida');
});
