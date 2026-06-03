import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPackages from './AdminPackages';
import api from '../../api';
import {
  renderWithRouter,
  mockAdminPackageApis,
  mockWindowConfirm,
  adminPackage,
  pendingPackage,
  adminCategory,
  adminEquipment,
} from '../../test-utils';

jest.mock('../../api');

describe('AdminPackages', () => {
  beforeEach(() => {
    mockAdminPackageApis(api, { packages: [adminPackage, pendingPackage] });
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
  });

  it('loads package table', async () => {
    renderWithRouter(<AdminPackages />);
    await waitFor(() => {
      expect(screen.getByText(/Packages \(2\)/)).toBeInTheDocument();
      expect(screen.getByText('Gold Pack')).toBeInTheDocument();
    });
  });

  it('creates a package from the form', async () => {
    renderWithRouter(<AdminPackages />);
    await waitFor(() => expect(screen.getByText('Gold Pack')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Package' }));
    fireEvent.change(screen.getByPlaceholderText('e.g. Premium Wedding Coverage'), { target: { value: 'New Pack' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('25000'), { target: { value: '20000' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));
    const equipmentSelects = screen.getAllByRole('combobox');
    fireEvent.change(equipmentSelects[equipmentSelects.length - 1], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Package' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/packages', expect.objectContaining({
        package: expect.objectContaining({ name: 'New Pack', price: 20000 }),
      }));
    });
  });

  it('edits an existing package', async () => {
    renderWithRouter(<AdminPackages />);
    await waitFor(() => expect(screen.getByText('Gold Pack')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    fireEvent.change(screen.getByDisplayValue('Gold Pack'), { target: { value: 'Gold Updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Package' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/admin/packages/1', expect.any(Object));
    });
  });

  it('approves and rejects pending packages', async () => {
    renderWithRouter(<AdminPackages />);
    await waitFor(() => expect(screen.getByText('Pending Pack')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/packages/2/approve'));

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/packages/2/reject'));
  });

  it('deactivates package when confirmed', async () => {
    mockWindowConfirm(true);
    renderWithRouter(<AdminPackages />);
    await waitFor(() => expect(screen.getByText('Gold Pack')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: 'Deactivate' })[0]);
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/packages/1'));
  });

  it('shows validation error on failed save', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { errors: ['Name taken'] } } });
    renderWithRouter(<AdminPackages />);
    await waitFor(() => expect(screen.getByText('Gold Pack')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Package' }));
    fireEvent.change(screen.getByPlaceholderText('e.g. Premium Wedding Coverage'), { target: { value: 'Dup' } });
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('25000'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Package' }));

    await waitFor(() => expect(screen.getByText('Name taken')).toBeInTheDocument());
  });

  it('removes a package item row in the form', async () => {
    renderWithRouter(<AdminPackages />);
    await waitFor(() => expect(screen.getByText('Gold Pack')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Package' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByPlaceholderText('Notes (optional)')).not.toBeInTheDocument();
  });
});
