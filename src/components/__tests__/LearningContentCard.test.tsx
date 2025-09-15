/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { LearningContentCard } from '../LearningContentCard';

describe('LearningContentCard', () => {
  it('renders title and topics', () => {
    render(<LearningContentCard title="BPR基礎" difficulty="beginner" aiTopics={["LLM"]} progress={50} />);
    expect(screen.getByText('BPR基礎')).toBeInTheDocument();
    expect(screen.getByText(/AIトピック/)).toBeInTheDocument();
  });
});

