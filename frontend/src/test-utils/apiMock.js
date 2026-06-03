import api from '../api';

/**
 * Route GET responses by URL match (string equality or predicate).
 * Fails fast on unexpected URLs to keep tests explicit.
 */
export function mockApiGet(routes) {
  api.get.mockImplementation((url) => {
    const route = routes.find(({ match }) =>
      typeof match === 'string' ? url === match : match(url)
    );
    if (route) return Promise.resolve({ data: route.data });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
}
