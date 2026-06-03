import { screen, waitFor } from '@testing-library/react';
import Packages from './Packages';
import { mockApiGet, renderWithRouter } from '../test-utils';

jest.mock('../api');

describe('Packages', () => {
  beforeEach(() => {
    mockApiGet([
      { match: '/categories', data: { categories: [{ id: 1, name: 'Wedding' }] } },
      {
        match: (url) => url.startsWith('/packages'),
        data: {
          packages: [{
            id: 1,
            name: 'Gold Pack',
            category_name: 'Wedding',
            price: 10000,
            offer_price: 9000,
            discount_percentage: 10,
            items_count: 2,
            description: 'Desc',
          }],
        },
      },
    ]);
  });

  it('renders package list and category filter tabs', async () => {
    renderWithRouter(<Packages />);
    await waitFor(() => {
      expect(screen.getByText('Gold Pack')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'common.all' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Wedding' })).toBeInTheDocument();
    });
  });
});
