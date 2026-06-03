import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setMockParams, setMockLocation } from './routerMock';

export { setMockAuth } from './authMock';
export { mockNavigate, setMockLocation, setMockParams } from './routerMock';
export { mockApiGet } from './apiMock';
export { mockWindowConfirm } from './confirmMock';
export { adminCategory, adminEquipment, adminPackage, pendingPackage, mockAdminPackageApis } from './adminFixtures';

export function renderWithRouter(ui, { route = '/', location } = {}) {
  setMockLocation(location ?? { pathname: route, state: null, search: '' });
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

/** Render a page that reads route params via useParams. */
export function renderRoute(element, { params = {} } = {}) {
  setMockParams(params);
  return render(<MemoryRouter>{element}</MemoryRouter>);
}
