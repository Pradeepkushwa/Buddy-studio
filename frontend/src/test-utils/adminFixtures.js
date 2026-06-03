export const adminCategory = { id: 1, name: 'Wedding', active: true, packages_count: 1, description: 'Desc', position: 0, image_url: '' };
export const adminEquipment = { id: 1, name: 'Canon', equipment_type: 'photography_camera', active: true };

export const adminPackage = {
  id: 1,
  name: 'Gold Pack',
  category_name: 'Wedding',
  category_id: 1,
  description: 'Full coverage',
  price: 10000,
  offer_price: 9000,
  discount_percentage: 10,
  featured: true,
  active: true,
  approval_status: 'approved',
  items: [{ id: 10, equipment_id: 1, quantity: 1, notes: 'Main' }],
  created_by_name: 'Admin',
};

export const pendingPackage = {
  ...adminPackage,
  id: 2,
  name: 'Pending Pack',
  approval_status: 'pending_approval',
};

export function mockAdminPackageApis(api, { packages = [adminPackage], categories = [adminCategory], equipments = [adminEquipment] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/admin/packages') return Promise.resolve({ data: { packages } });
    if (url === '/admin/categories') return Promise.resolve({ data: { categories } });
    if (url === '/admin/equipments') return Promise.resolve({ data: { equipments } });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
}
