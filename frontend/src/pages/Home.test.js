import { screen, waitFor, fireEvent } from '@testing-library/react';
import Home from './Home';
import api from '../api';
import { mockApiGet, renderWithRouter } from '../test-utils';

jest.mock('../api');

describe('Home', () => {
  beforeEach(() => {
    mockApiGet([
      { match: '/categories', data: { categories: [] } },
      { match: '/packages', data: { packages: [] } },
      { match: '/gallery', data: { gallery_items: [] } },
      { match: '/reviews', data: { reviews: [], average_rating: 4.5, total_reviews: 2 } },
    ]);
  });

  it('renders hero section', async () => {
    renderWithRouter(<Home />);
    await waitFor(() => {
      expect(screen.getByText('home.hero_title')).toBeInTheDocument();
    });
  });

  it('submits appointment form successfully', async () => {
    api.post.mockResolvedValueOnce({ data: { message: 'Appointment received' } });
    renderWithRouter(<Home />);
    await waitFor(() => expect(screen.getByText('home.hero_title')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('you@email.com'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'home.appt_request' }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/appointments', expect.any(Object));
      expect(screen.getByText('Appointment received')).toBeInTheDocument();
    });
  });
});
