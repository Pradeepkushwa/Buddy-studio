import { screen, waitFor, fireEvent } from '@testing-library/react';
import PackageDetail from './PackageDetail';
import api from '../api';
import { setMockAuth } from '../test-utils/authMock';
import { mockNavigate, renderRoute } from '../test-utils';

jest.mock('../api');
jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const pkg = {
  id: 1,
  name: 'Premium Pack',
  category_name: 'Wedding',
  description: 'Full day coverage',
  price: 20000,
  offer_price: 18000,
  discount_percentage: 10,
  items: [{ id: 1, equipment_name: 'Canon', equipment_type: 'photography_camera', quantity: 1, notes: null }],
};

describe('PackageDetail', () => {
  beforeEach(() => {
    setMockAuth();
    api.get.mockResolvedValue({ data: { package: pkg } });
  });

  it('renders package details', async () => {
    renderRoute(<PackageDetail />, { params: { id: '1' } });
    await waitFor(() => {
      expect(screen.getByText('Premium Pack')).toBeInTheDocument();
      expect(screen.getByText('Full day coverage')).toBeInTheDocument();
    });
  });

  it('redirects guests to login when booking', async () => {
    renderRoute(<PackageDetail />, { params: { id: '1' } });
    await waitFor(() => expect(screen.getByText('common.book_now')).toBeInTheDocument());
    fireEvent.click(screen.getByText('common.book_now'));
    expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=/book/1');
  });
});
