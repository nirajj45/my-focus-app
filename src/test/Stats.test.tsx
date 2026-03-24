import { render, screen } from '@testing-library/react';
import { Stats } from '../components/Stats';
import { describe, it, expect } from 'vitest';
import { ForestStats } from '../types';

describe('Stats Component', () => {
  const mockStats: ForestStats = {
    grown: 5,
    withered: 2,
    totalFocusTime: 150,
    coins: 350,
    unlockedTrees: ['oak', 'pine']
  };

  it('renders all stats correctly', () => {
    render(<Stats stats={mockStats} />);

    expect(screen.getByText('5')).toBeInTheDocument(); // Trees Grown
    expect(screen.getByText('2')).toBeInTheDocument(); // Trees Withered
    expect(screen.getByText('150m')).toBeInTheDocument(); // Focus Time
    expect(screen.getByText('350')).toBeInTheDocument(); // Coins
  });

  it('calculates goal progress correctly', () => {
    render(<Stats stats={mockStats} />);
    
    // Daily goal is 4, grown is 5, so progress should be 100%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});
