import { render, screen, fireEvent, act } from '@testing-library/react';
import { Timer } from '../components/Timer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Timer Component', () => {
  const mockOnStart = vi.fn();
  const mockOnGiveUp = vi.fn();
  const mockOnComplete = vi.fn();
  const unlockedTrees = ['oak', 'pine'];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('renders correctly in initial state', () => {
    render(
      <Timer
        isFocusing={false}
        onStart={mockOnStart}
        onGiveUp={mockOnGiveUp}
        onComplete={mockOnComplete}
        unlockedTrees={unlockedTrees}
      />
    );

    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Plant Oak')).toBeInTheDocument();
  });

  it('updates duration when slider is moved', () => {
    render(
      <Timer
        isFocusing={false}
        onStart={mockOnStart}
        onGiveUp={mockOnGiveUp}
        onComplete={mockOnComplete}
        unlockedTrees={unlockedTrees}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '45' } });

    expect(screen.getByText('45:00')).toBeInTheDocument();
  });

  it('calls onStart with correct duration and species', () => {
    render(
      <Timer
        isFocusing={false}
        onStart={mockOnStart}
        onGiveUp={mockOnGiveUp}
        onComplete={mockOnComplete}
        unlockedTrees={unlockedTrees}
      />
    );

    const startButton = screen.getByText('Plant Oak');
    fireEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalledWith(25, 'oak');
  });

  it('renders focusing state correctly', () => {
    render(
      <Timer
        isFocusing={true}
        onStart={mockOnStart}
        onGiveUp={mockOnGiveUp}
        onComplete={mockOnComplete}
        unlockedTrees={unlockedTrees}
      />
    );

    expect(screen.getByText('Give Up')).toBeInTheDocument();
    expect(screen.queryByText('Plant Oak')).not.toBeInTheDocument();
  });

  it('calls onGiveUp when give up button is clicked', () => {
    render(
      <Timer
        isFocusing={true}
        onStart={mockOnStart}
        onGiveUp={mockOnGiveUp}
        onComplete={mockOnComplete}
        unlockedTrees={unlockedTrees}
      />
    );

    const giveUpButton = screen.getByText('Give Up');
    fireEvent.click(giveUpButton);

    expect(mockOnGiveUp).toHaveBeenCalled();
  });

  it('calls onComplete when timer reaches zero', () => {
    render(
      <Timer
        isFocusing={true}
        onStart={mockOnStart}
        onGiveUp={mockOnGiveUp}
        onComplete={mockOnComplete}
        unlockedTrees={unlockedTrees}
      />
    );

    // Fast-forward 25 minutes
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });
});
