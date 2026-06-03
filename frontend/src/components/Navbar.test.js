jest.unmock('./Navbar');

import { screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { setMockAuth, renderWithRouter } from '../test-utils';

jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const renderNavbar = () => renderWithRouter(<Navbar />);

describe('Navbar', () => {
  it('shows login and signup links for guests', () => {
    setMockAuth();
    renderNavbar();
    expect(screen.getByText('nav.login')).toBeInTheDocument();
    expect(screen.getByText('nav.signup')).toBeInTheDocument();
  });

  it('shows dashboard and my bookings for logged-in customer', () => {
    setMockAuth({ token: 't', user: { role: 'user', name: 'Test' } });
    renderNavbar();
    expect(screen.getByText('nav.my_bookings')).toBeInTheDocument();
    expect(screen.queryByText('nav.login')).not.toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    setMockAuth();
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }));
    expect(document.querySelector('.navbar-links-open')).toBeInTheDocument();
  });
});
