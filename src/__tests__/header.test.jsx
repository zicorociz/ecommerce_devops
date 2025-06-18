import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

let authStateCallback = null;
const mockNavigate = jest.fn();
const mockSignOut = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    authStateCallback = callback;
    return jest.fn();
  }),
  signOut: (auth) => mockSignOut(auth),
}));

jest.mock('../firebase', () => ({ auth: {} }));

describe('Header Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;
    document.body.className = '';
  });

  const renderHeader = () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
  };

  test('merender link navigasi utama dengan benar', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /ecommerce/i })).toBeInTheDocument();
  });

  test('menampilkan tombol Login dan Sign Up saat pengguna tidak login', () => {
    renderHeader();
    act(() => {
      if (authStateCallback) authStateCallback(null);
    });
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  test('menampilkan tombol Logout saat pengguna login', () => {
    renderHeader();
    act(() => {
      if (authStateCallback) authStateCallback({ uid: 'user123' });
    });
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  // Tes yang sudah diperbaiki
  test('memanggil signOut dan navigasi saat tombol Logout diklik', async () => {
    mockSignOut.mockResolvedValue(undefined);
    renderHeader();
    
    act(() => {
      if (authStateCallback) authStateCallback({ uid: 'user123' });
    });
    
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    // Simulasikan perubahan state auth setelah logout
    act(() => {
      if (authStateCallback) authStateCallback(null);
    });

    // Tunggu UI diperbarui untuk menampilkan tombol Login
    expect(await screen.findByRole('link', { name: /login/i })).toBeInTheDocument();
    
    // Verifikasi navigasi
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('mengganti tema saat tombol tema diklik', () => {
    renderHeader();
    expect(document.body.className).not.toContain('dark');
    const themeToggleButton = screen.getByTestId('theme-toggle-button');
    fireEvent.click(themeToggleButton);
    expect(document.body.className).toContain('dark');
    fireEvent.click(themeToggleButton);
    expect(document.body.className).not.toContain('dark');
  });
});