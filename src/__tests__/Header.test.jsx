// src/__tests__/Header.test.jsx

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

// --- MOCKING ---
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
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
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

  test('memanggil signOut dan navigasi saat tombol Logout diklik', async () => {
    mockSignOut.mockResolvedValue(undefined);
    renderHeader();
    
    act(() => { if (authStateCallback) authStateCallback({ uid: 'user123' }) });
    
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await act(async () => {
      await expect(mockSignOut).toHaveBeenCalledTimes(1);
      if (authStateCallback) authStateCallback(null);
    });

    expect(await screen.findByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // Tes tema yang sudah disesuaikan dengan HTML baru
  test('mengganti tema saat tombol tema diklik', () => {
    renderHeader();
    expect(document.body.className).not.toContain('dark');

    // Cari berdasarkan role checkbox dan nama aksesibelnya
    const themeToggleButton = screen.getByRole('checkbox', { name: /toggle theme/i });
    
    fireEvent.click(themeToggleButton);
    expect(document.body.className).toContain('dark');

    fireEvent.click(themeToggleButton);
    expect(document.body.className).not.toContain('dark');
  });
});