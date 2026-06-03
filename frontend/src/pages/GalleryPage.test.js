import { screen, waitFor } from '@testing-library/react';
import GalleryPage from './GalleryPage';
import { mockApiGet, renderWithRouter } from '../test-utils';

jest.mock('../api');

describe('GalleryPage', () => {
  it('renders gallery items', async () => {
    mockApiGet([{
      match: '/gallery',
      data: {
        gallery_items: [{ id: 1, title: 'Sunset', media_url: 'http://x.jpg', media_type: 'photo', category: 'Wedding' }],
        categories: ['Wedding'],
      },
    }]);
    renderWithRouter(<GalleryPage />);
    await waitFor(() => {
      expect(screen.getByText('Sunset')).toBeInTheDocument();
    });
  });
});
