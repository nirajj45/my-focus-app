import { render, screen, fireEvent } from '@testing-library/react';
import { Store } from '../components/Store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TREE_SPECIES } from '../constants';

describe('Store Component', () => {
  const mockOnClose = vi.fn();
  const mockOnPurchase = vi.fn();
  const unlockedTrees = ['oak'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <Store
        isOpen={true}
        onClose={mockOnClose}
        coins={100}
        unlockedTrees={unlockedTrees}
        onPurchase={mockOnPurchase}
      />
    );

    expect(screen.getByText('Tree Store')).toBeInTheDocument();
    expect(screen.getAllByText(/100 Coins/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Oak')).toBeInTheDocument();
    expect(screen.getByText('Pine')).toBeInTheDocument();
  });

  it('shows "Unlocked" for already owned trees', () => {
    render(
      <Store
        isOpen={true}
        onClose={mockOnClose}
        coins={100}
        unlockedTrees={unlockedTrees}
        onPurchase={mockOnPurchase}
      />
    );

    expect(screen.getByText('Unlocked')).toBeInTheDocument();
  });

  it('enables "Buy Now" button if user has enough coins', () => {
    render(
      <Store
        isOpen={true}
        onClose={mockOnClose}
        coins={100}
        unlockedTrees={unlockedTrees}
        onPurchase={mockOnPurchase}
      />
    );

    const pineBuyButton = screen.getAllByText('Buy Now')[0];
    expect(pineBuyButton).not.toBeDisabled();
  });

  it('disables "Buy Now" button if user does not have enough coins', () => {
    render(
      <Store
        isOpen={true}
        onClose={mockOnClose}
        coins={50}
        unlockedTrees={unlockedTrees}
        onPurchase={mockOnPurchase}
      />
    );

    const pineBuyButton = screen.getAllByText('Buy Now')[0];
    expect(pineBuyButton).toBeDisabled();
  });

  it('calls onPurchase when "Buy Now" is clicked', () => {
    render(
      <Store
        isOpen={true}
        onClose={mockOnClose}
        coins={100}
        unlockedTrees={unlockedTrees}
        onPurchase={mockOnPurchase}
      />
    );

    const pineBuyButton = screen.getAllByText('Buy Now')[0];
    fireEvent.click(pineBuyButton);

    const pineSpecies = TREE_SPECIES.find(s => s.id === 'pine');
    expect(mockOnPurchase).toHaveBeenCalledWith(pineSpecies);
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Store
        isOpen={true}
        onClose={mockOnClose}
        coins={100}
        unlockedTrees={unlockedTrees}
        onPurchase={mockOnPurchase}
      />
    );

    const closeButton = screen.getAllByRole('button')[0]; // The X button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
