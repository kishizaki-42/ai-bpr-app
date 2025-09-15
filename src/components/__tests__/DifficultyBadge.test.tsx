/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { DifficultyBadge } from '../DifficultyBadge';

describe('DifficultyBadge', () => {
  it('shows proper label for beginner', () => {
    render(<DifficultyBadge level="beginner" />);
    expect(screen.getByText('初級')).toBeInTheDocument();
  });
});

