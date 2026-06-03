import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('renders five stars with filled state for rating', () => {
    render(<StarRating rating={3} />);
    expect(screen.getAllByText('★')).toHaveLength(3);
    expect(screen.getAllByText('☆')).toHaveLength(2);
  });

  it('calls onChange when a star is clicked', () => {
    const onChange = jest.fn();
    render(<StarRating rating={2} onChange={onChange} />);
    fireEvent.click(screen.getAllByText('☆')[2]);
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
