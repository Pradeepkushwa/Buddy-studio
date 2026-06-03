import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminCategories from './AdminCategories';
import api from '../../api';
import { renderWithRouter, mockWindowConfirm, adminCategory } from '../../test-utils';

jest.mock('../../api');

describe('AdminCategories interactions', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: { categories: [adminCategory] } });
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
  });

  it('creates, edits, and deactivates a category', async () => {
    mockWindowConfirm(true);
    renderWithRouter(<AdminCategories />);
    await waitFor(() => expect(screen.getByText(/Categories \(1\)/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Category' }));
    fireEvent.change(screen.getByPlaceholderText('e.g. Wedding Package'), { target: { value: 'Events' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/categories', expect.any(Object)));

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByDisplayValue('Wedding'), { target: { value: 'Wedding Plus' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/categories/1', expect.any(Object)));

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/categories/1'));
  });

  it('shows error on failed save', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { errors: ['Duplicate name'] } } });
    renderWithRouter(<AdminCategories />);
    await waitFor(() => expect(screen.getByText('Wedding')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Category' }));
    fireEvent.change(screen.getByPlaceholderText('e.g. Wedding Package'), { target: { value: 'Wedding' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(screen.getByText('Duplicate name')).toBeInTheDocument());
  });
});
