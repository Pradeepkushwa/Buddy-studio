import { screen, waitFor } from '@testing-library/react';
import StaffEquipment from './StaffEquipment';
import StaffPackages from './StaffPackages';
import StaffLayout from './StaffLayout';
import api from '../../api';
import { setMockAuth, mockApiGet, renderWithRouter } from '../../test-utils';
import { expectListPageLoads } from '../../test-utils/listPage';

jest.mock('../../api');
jest.mock('../../context/AuthContext', () => require('../../test-utils/authMock').getAuthContextMock());

describe('Staff pages', () => {
  beforeEach(() => {
    setMockAuth({ user: { name: 'Staff', role: 'staff' }, logout: jest.fn() });
  });

  it('StaffEquipment loads equipment list', async () => {
    await expectListPageLoads(StaffEquipment, {
      matchUrl: '/staff/equipments',
      responseData: { equipments: [{ id: 1, name: 'Camera', equipment_type: 'photography_camera', active: true }] },
      heading: /Equipment \(1\)/,
    });
  });

  it('StaffPackages loads packages after parallel fetches', async () => {
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
            items: [],
          }],
        },
      },
      { match: '/categories', data: { categories: [] } },
      { match: '/staff/equipments', data: { equipments: [] } },
    ]);
    renderWithRouter(<StaffPackages />);
    await waitFor(() => {
      expect(screen.getByText(/My Packages \(1\)/)).toBeInTheDocument();
      expect(screen.getByText('My Pack')).toBeInTheDocument();
    });
  });

  it('StaffLayout renders staff navigation', () => {
    renderWithRouter(<StaffLayout />);
    expect(screen.getByText('Staff Panel')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
  });
});
