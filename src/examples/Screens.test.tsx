import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreensPage } from './Screens';

afterEach(cleanup);

describe('desktop preview in the component catalog', () => {
  it('uses its own browsing context so viewport overlays cannot cover the catalog', async () => {
    const user = userEvent.setup();
    const { container } = render(<ScreensPage />);
    await user.click(screen.getByRole('button', { name: 'Desktop' }));
    const frame = screen.getByTitle('Interaktywny podgląd portalu mObywatel');
    expect(frame).toHaveAttribute('src', '/preview/desktop');
    expect(frame).toBeInstanceOf(HTMLIFrameElement);
    expect(container.querySelector('.official-desktop')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Mobile' }));
    expect(frame).not.toBeInTheDocument();
  });
});
