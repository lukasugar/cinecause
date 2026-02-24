import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharitySelector } from '../CharitySelector';

describe('CharitySelector', () => {
  const defaultCharity = {
    name: 'World Wildlife Fund',
    slug: 'wwf',
    logoUrl: 'https://example.com/wwf.png',
  };

  it('displays the selected charity name', () => {
    render(
      <CharitySelector
        selectedCharity={defaultCharity}
        onCharityChange={() => {}}
      />
    );
    expect(screen.getByText('World Wildlife Fund')).toBeInTheDocument();
  });

  it('shows "Your donation goes to:" label', () => {
    render(
      <CharitySelector
        selectedCharity={defaultCharity}
        onCharityChange={() => {}}
      />
    );
    expect(screen.getByText('Your donation goes to:')).toBeInTheDocument();
  });

  it('has a clickable charity selector button', () => {
    render(
      <CharitySelector
        selectedCharity={defaultCharity}
        onCharityChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /world wildlife fund/i })).toBeInTheDocument();
  });

  it('opens modal when charity selector is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CharitySelector
        selectedCharity={defaultCharity}
        onCharityChange={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /world wildlife fund/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search charities/i)).toBeInTheDocument();
  });

  it('shows a selected charity summary with description when available', () => {
    render(
      <CharitySelector
        selectedCharity={{
          name: 'Wikimedia Foundation',
          slug: 'wikimediafoundation',
          description: 'A free, collaborative, multilingual Internet encyclopedia.',
        }}
        onCharityChange={() => {}}
      />
    );

    expect(screen.getByText("Great choice! You're supporting Wikimedia Foundation.")).toBeInTheDocument();
    expect(screen.getByText('A free, collaborative, multilingual Internet encyclopedia.')).toBeInTheDocument();
  });
});
