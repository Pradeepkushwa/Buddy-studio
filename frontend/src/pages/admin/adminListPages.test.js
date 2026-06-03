import AdminCustomersPage from './AdminCustomersPage';
import AdminAppointments from './AdminAppointments';
import AdminStaffPage from './AdminStaffPage';
import AdminBookings from './AdminBookings';
import AdminReviews from './AdminReviews';
import AdminEquipment from './AdminEquipment';
import { expectListPageLoads } from '../../test-utils/listPage';

jest.mock('../../api');

describe('Admin list pages', () => {
  const cases = [
    {
      name: 'AdminCustomersPage',
      Component: AdminCustomersPage,
      matchUrl: '/admin/customers',
      responseData: { customers: [{ id: 1, name: 'Alice', email: 'a@b.com', email_verified: true, created_at: new Date().toISOString() }] },
      heading: /Customers \(1\)/,
    },
    {
      name: 'AdminAppointments',
      Component: AdminAppointments,
      matchUrl: '/admin/appointments',
      responseData: { appointments: [{ id: 1, name: 'Bob', email: 'b@b.com', status: 'new' }] },
      heading: /Appointments \(1\)/,
    },
    {
      name: 'AdminStaffPage',
      Component: AdminStaffPage,
      matchUrl: '/admin/staff',
      responseData: { staff: [{ id: 2, name: 'Staff', email: 's@b.com', verification_status: 'approved' }] },
      heading: /Staff Members \(1\)/,
    },
    {
      name: 'AdminBookings',
      Component: AdminBookings,
      matchUrl: (url) => url.startsWith('/admin/bookings'),
      responseData: { bookings: [{ id: 1, package_name: 'Pack', status: 'pending', user_name: 'U', amount: 100 }] },
      heading: 'Bookings',
      content: 'Pack',
    },
    {
      name: 'AdminReviews',
      Component: AdminReviews,
      matchUrl: '/admin/reviews',
      responseData: { reviews: [{ id: 1, name: 'R', email: 'r@t.com', rating: 5, feedback: 'Nice', approved: false }] },
      heading: 'Reviews & Feedback',
      content: 'Nice',
    },
    {
      name: 'AdminEquipment',
      Component: AdminEquipment,
      matchUrl: '/admin/equipments',
      responseData: { equipments: [{ id: 1, name: 'Cam', equipment_type: 'photography_camera', active: true }] },
      heading: /Equipment \(1\)/,
    },
  ];

  it.each(cases)('$name loads data from API', async ({ Component, matchUrl, responseData, heading, content }) => {
    await expectListPageLoads(Component, { matchUrl, responseData, heading, content });
  });
});
