import { screen, waitFor } from '@testing-library/react';
import api from '../api';
import { renderWithRouter } from './index';

/**
 * Shared helper for pages that fetch a list on mount (admin/staff tables).
 * Avoids duplicating the same render + waitFor pattern across specs.
 */
export async function expectListPageLoads(Component, { matchUrl, responseData, heading, content }) {
  api.get.mockImplementation((url) => {
    const matched = typeof matchUrl === 'string' ? url === matchUrl : matchUrl(url);
    if (matched) return Promise.resolve({ data: responseData });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });

  renderWithRouter(<Component />);

  await waitFor(() => {
    if (heading) expect(screen.getByText(heading)).toBeInTheDocument();
    if (content) expect(screen.getByText(content)).toBeInTheDocument();
  });
}
