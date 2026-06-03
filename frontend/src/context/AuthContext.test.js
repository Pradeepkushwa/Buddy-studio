import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import api from '../api';

jest.mock('../api');

function makeToken(expUnix) {
  const payload = btoa(JSON.stringify({ sub: 1, exp: expUnix }));
  return `header.${payload}.sig`;
}

const futureToken = () => makeToken(Math.floor(Date.now() / 1000) + 3600);
const expiredToken = () => makeToken(Math.floor(Date.now() / 1000) - 10);

describe('AuthContext', () => {
  it('clears expired token from localStorage on init', () => {
    const token = expiredToken();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('login saves token and user', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: futureToken(), user: { id: 1, email: 'a@b.com', role: 'user' } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login('a@b.com', 'pass');
    });

    expect(result.current.token).toBeTruthy();
    expect(result.current.user.email).toBe('a@b.com');
  });

  it('logout clears session even if API fails', async () => {
    localStorage.setItem('token', futureToken());
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'a@b.com' }));
    api.delete.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('fetches user when token exists without user in state', async () => {
    const token = futureToken();
    localStorage.setItem('token', token);
    api.get.mockResolvedValueOnce({ data: { user: { id: 1, email: 'x@y.com', role: 'user' } } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => expect(result.current.user?.email).toBe('x@y.com'));
  });
});
