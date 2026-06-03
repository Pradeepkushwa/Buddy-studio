import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import AdminGallery from './AdminGallery';
import api from '../../api';
import { renderWithRouter, mockWindowConfirm } from '../../test-utils';

jest.mock('../../api');

const galleryItem = {
  id: 1,
  title: 'Sunset',
  media_url: 'http://img.test/s.jpg',
  media_type: 'photo',
  category: 'Wedding',
  description: 'Nice',
  position: 1,
  active: true,
  uploaded_by: 'Admin',
};

const videoItem = {
  ...galleryItem,
  id: 2,
  title: 'Clip',
  media_type: 'video',
  media_url: 'http://vid.test/v.mp4',
};

describe('AdminGallery', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/admin/gallery_items') {
        return Promise.resolve({ data: { gallery_items: [galleryItem, videoItem] } });
      }
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
  });

  it('loads gallery items including video row', async () => {
    renderWithRouter(<AdminGallery />);
    await waitFor(() => {
      expect(screen.getByText(/Gallery \(2\)/)).toBeInTheDocument();
      expect(screen.getByText('Sunset')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
    });
  });

  it('adds a new gallery item', async () => {
    renderWithRouter(<AdminGallery />);
    await waitFor(() => expect(screen.getByText('Sunset')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));
    const form = document.querySelector('.admin-form-card');
    const inputs = within(form).getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'New Photo' } });
    fireEvent.change(inputs[1], { target: { value: 'http://x/new.jpg' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/admin/gallery_items', {
        gallery_item: expect.objectContaining({ title: 'New Photo', media_url: 'http://x/new.jpg' }),
      });
    });
  });

  it('edits and deletes an item', async () => {
    mockWindowConfirm(true);
    renderWithRouter(<AdminGallery />);
    await waitFor(() => expect(screen.getByText('Sunset')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editForm = document.querySelector('.admin-form-card');
    fireEvent.change(within(editForm).getAllByRole('textbox')[0], { target: { value: 'Sunset Edited' } });
    fireEvent.click(within(editForm).getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/admin/gallery_items/1', expect.any(Object)));

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/admin/gallery_items/1'));
  });

  it('shows error when save fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { errors: ['Invalid URL'] } } });
    renderWithRouter(<AdminGallery />);
    await waitFor(() => expect(screen.getByText('Sunset')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));
    const form = document.querySelector('.admin-form-card');
    const inputs = within(form).getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Bad' } });
    fireEvent.change(inputs[1], { target: { value: 'bad' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(screen.getByText('Invalid URL')).toBeInTheDocument());
  });
});
