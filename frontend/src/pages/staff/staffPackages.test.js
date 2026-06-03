import { screen, fireEvent, waitFor } from '@testing-library/react';
import StaffPackages from './StaffPackages';
import api from '../../api';
import { setMockAuth, mockApiGet, renderWithRouter } from '../../test-utils';

jest.mock('../../api');
jest.mock('../../context/AuthContext', () => require('../../test-utils/authMock').getAuthContextMock());

describe('StaffPackages interactions', () => {
  beforeEach(() => {
    setMockAuth({ user: { name: 'Staff', role: 'staff' }, logout: jest.fn() });
    mockApiGet([
      {
        match: '/staff/packages',
        data: {
          packages: [{
            id: 1,
            name: 'My Pack',
            approval_status: 'approved',
            price: 10000,
            offer_price: 9000,
            category_id: 1,
            category_name: 'Wedding',
            discount_percentage: 0,
            featured: false,
            items: [],
          }],
        },
      },
      { match: '/categories', data: { categories: [{ id: 1, name: 'Wedding' }] } },
      { match: '/staff/equipments', data: { equipments: [{ id: 1, name: 'Cam', active: true }] } },
    ]);
    api.post.mockResolvedValue({ data: { message: 'Submitted for approval' } });
  });

  it('creates a staff package', async () => {
    renderWithRouter(<StaffPackages />);
    await waitFor(() => expect(screen.getByText('My Pack')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Create Package' }));
    const form = document.querySelector('.admin-form-card');
    fireEvent.change(form.querySelector('input'), { target: { value: 'Staff Pack' } });
    fireEvent.change(form.querySelectorAll('select')[0], { target: { value: '1' } });
    fireEvent.change(form.querySelector('input[type="number"]'), { target: { value: '12000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Package' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/staff/packages', expect.any(Object));
      expect(screen.getByText('Submitted for approval')).toBeInTheDocument();
    });
  });
});
