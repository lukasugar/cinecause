import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from '../MobileMenu';

describe('MobileMenu', () => {
  it('closes the expanded menu when a menu link is clicked', async () => {
    const user = userEvent.setup();
    const signOutAction = vi.fn(async () => {});

    const { container } = render(
      <MobileMenu isSignedIn={false} signOutAction={signOutAction} />
    );
    const details = container.querySelector('details');
    expect(details).not.toBeNull();

    await user.click(screen.getByText('Menu'));
    expect(details?.open).toBe(true);

    await user.click(screen.getByRole('link', { name: /how it works/i }));
    expect(details?.open).toBe(false);
  });
});
