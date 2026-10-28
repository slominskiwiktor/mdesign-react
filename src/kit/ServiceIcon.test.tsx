import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ServiceIcon } from './ServiceIcon';

afterEach(cleanup);

describe('ServiceIcon accessibility', () => {
  it('announces a meaningful icon once when switching themes and hides decorative icons', () => {
    const { rerender } = render(
      <>
        <ServiceIcon name="pesel" theme="light" title="Zastrzeż PESEL" />
        <ServiceIcon name="apply" theme="dark" />
      </>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Zastrzeż PESEL' })).toBeInTheDocument();
    rerender(
      <>
        <ServiceIcon name="pesel" theme="dark" title="Zastrzeż PESEL" />
        <ServiceIcon name="apply" theme="light" />
      </>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Zastrzeż PESEL' })).toBeInTheDocument();
    rerender(<ServiceIcon name="pesel" theme="dark" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('preserves the same naming contract for a published native fallback', () => {
    const { rerender } = render(
      <ServiceIcon name="signature" theme="dark" title="Podpisz dokument" />,
    );
    expect(screen.getByRole('img', { name: 'Podpisz dokument' })).toBeInTheDocument();
    rerender(<ServiceIcon name="signature" theme="light" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
