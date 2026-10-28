import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PortalFileUpload } from './FileUpload';
import type { PortalFileUploadHandle } from './FileUpload';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('upload transport and browser validation contracts', () => {
  it('reports a failed transport, retries it and commits exactly one successful upload', async () => {
    const user = userEvent.setup();
    const file = new File(['data'], 'application.pdf', { type: 'application/pdf' });
    const uploaded = vi.fn();
    let complete!: () => void;
    let progress!: (value: number) => void;
    const transport = vi
      .fn<NonNullable<Parameters<typeof PortalFileUpload>[0]['upload']>>()
      .mockRejectedValueOnce(new Error('Serwer jest niedostępny.'))
      .mockImplementationOnce((_, context) => {
        progress = context.onProgress;
        return new Promise<void>((resolve) => {
          complete = resolve;
        });
      });
    render(
      <PortalFileUpload
        label="Załączniki"
        defaultFiles={[file]}
        upload={transport}
        onUploaded={uploaded}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Wyślij pliki' }));
    await screen.findByText('Serwer jest niedostępny.');
    expect(uploaded).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Ponów wysyłanie application.pdf' }));
    act(() => progress(-10));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    act(() => progress(150));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('button', { name: 'Wyślij pliki' })).toBeDisabled();
    await act(async () => complete());
    await screen.findByText('Wysłano');
    expect(transport).toHaveBeenCalledTimes(2);
    expect(uploaded).toHaveBeenCalledExactlyOnceWith(file);
    expect(screen.queryByRole('button', { name: /Ponów wysyłanie/ })).not.toBeInTheDocument();
  });

  it('aborts removal and unmount, ignoring progress and completion from both stale transports', async () => {
    const user = userEvent.setup();
    const files = [new File(['a'], 'first.pdf'), new File(['b'], 'second.pdf')];
    const pending: Array<{
      signal: AbortSignal;
      onProgress: (value: number) => void;
      finish: () => void;
    }> = [];
    const uploaded = vi.fn();
    const view = render(
      <PortalFileUpload
        label="Załączniki"
        defaultFiles={files}
        onUploaded={uploaded}
        upload={(_, context) =>
          new Promise<void>((resolve) => pending.push({ ...context, finish: resolve }))
        }
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Wyślij pliki' }));
    expect(pending).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Usuń first.pdf' }));
    expect(pending[0].signal.aborted).toBe(true);
    expect(screen.queryByText('first.pdf')).not.toBeInTheDocument();
    expect(pending[1].signal.aborted).toBe(false);
    view.unmount();
    expect(pending[1].signal.aborted).toBe(true);
    await act(async () => {
      for (const entry of pending) {
        entry.onProgress(99);
        entry.finish();
      }
    });
    expect(uploaded).not.toHaveBeenCalled();
  });

  it('validates decoded image dimensions and releases each bitmap before accepting or rejecting', async () => {
    const user = userEvent.setup();
    const closeSmall = vi.fn();
    const closeLarge = vi.fn();
    vi.stubGlobal(
      'createImageBitmap',
      vi
        .fn()
        .mockResolvedValueOnce({ width: 100, height: 100, close: closeSmall })
        .mockResolvedValueOnce({ width: 300, height: 200, close: closeLarge }),
    );
    const changed = vi.fn();
    const rejected = vi.fn();
    render(
      <PortalFileUpload
        label="Załączniki"
        imageRules={{ minWidth: 200 }}
        onFilesChange={changed}
        onReject={rejected}
      />,
    );
    const small = new File(['small'], 'small.png', { type: 'image/png' });
    const large = new File(['large'], 'large.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Załączniki'), [small, large]);
    await screen.findByText('large.png');
    expect(screen.getByRole('alert')).toHaveTextContent('Wymiary obrazu nie spełniają wymagań.');
    expect(changed).toHaveBeenLastCalledWith([large]);
    expect(rejected).toHaveBeenCalledWith([
      expect.objectContaining({ file: small, code: 'custom' }),
    ]);
    expect(closeSmall).toHaveBeenCalledOnce();
    expect(closeLarge).toHaveBeenCalledOnce();
  });

  it('falls back to Image decoding and revokes object URLs on success and decoding failure', async () => {
    const user = userEvent.setup();
    const revoke = vi.fn();
    let attempt = 0;
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockRejectedValue(new Error('Decoder not available')),
    );
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = vi.fn(() => `blob:validation-${++attempt}`);
        static revokeObjectURL = revoke;
      },
    );
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = 300;
        naturalHeight = 200;
        onload?: () => void;
        onerror?: () => void;
        set src(value: string) {
          queueMicrotask(() => (value.endsWith('-1') ? this.onload?.() : this.onerror?.()));
        }
      },
    );
    const changed = vi.fn();
    render(<PortalFileUpload label="Załączniki" validateImages onFilesChange={changed} />);
    const good = new File(['good'], 'good.png', { type: 'image/png' });
    const broken = new File(['broken'], 'broken.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Załączniki'), [good, broken]);
    await screen.findByText('good.png');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Plik jest uszkodzony lub nie można go odczytać.',
    );
    expect(changed).toHaveBeenLastCalledWith([good]);
    expect(revoke.mock.calls).toEqual([['blob:validation-1'], ['blob:validation-2']]);
  });

  it('checks file signatures, rejects a forged MIME header and keeps valid files', async () => {
    const user = userEvent.setup();
    const fixtures = [
      ['valid.png', 'image/png', [137, 80, 78, 71, 13, 10, 26, 10]],
      ['valid.jpg', 'image/jpeg', [255, 216, 255]],
      ['valid.gif', 'image/gif', [71, 73, 70, 56]],
      ['valid.pdf', 'application/pdf', [37, 80, 68, 70, 45]],
      ['valid.webp', 'image/webp', [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]],
      ['forged.png', 'image/png', [0, 0, 0, 0]],
    ] as const;
    const files = fixtures.map(([name, type, bytes]) => {
      const file = new File([Uint8Array.from(bytes)], name, { type });
      // jsdom lacks Blob.arrayBuffer; preserve native File identity and model
      // only the browser byte-reading boundary used by signature validation.
      Object.defineProperty(file, 'slice', {
        value: (start: number, end: number) => ({
          arrayBuffer: async () => Uint8Array.from(bytes.slice(start, end)).buffer,
        }),
      });
      return file;
    });
    const changed = vi.fn();
    render(<PortalFileUpload label="Załączniki" validateSignatures onFilesChange={changed} />);
    await user.upload(screen.getByLabelText('Załączniki'), files);
    await screen.findByText('valid.webp');
    expect(changed).toHaveBeenLastCalledWith(files.slice(0, 5));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'forged.png: Zawartość pliku nie odpowiada podanemu formatowi.',
    );
  });

  it('restores required validity on form reset and focuses the visible chooser when invalid', async () => {
    const user = userEvent.setup();
    const ref = createRef<PortalFileUploadHandle>();
    const view = render(
      <form aria-label="Wniosek">
        <PortalFileUpload ref={ref} label="Załączniki" required />
      </form>,
    );
    const input = screen.getByLabelText(/Załączniki/) as HTMLInputElement;
    fireEvent.invalid(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Dodaj co najmniej jeden plik.');
    expect(screen.getByRole('button', { name: 'Wybierz pliki' })).toHaveFocus();
    await user.upload(input, new File(['data'], 'application.pdf'));
    await screen.findByText('application.pdf');
    expect(input.checkValidity()).toBe(true);
    fireEvent.reset(view.container.querySelector('form')!);
    await waitFor(() => expect(ref.current?.getFiles()).toEqual([]));
    expect(input.validity.customError).toBe(true);
    expect(screen.queryByText('application.pdf')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
