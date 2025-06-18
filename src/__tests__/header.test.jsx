import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

// ... (semua mock tetap sama seperti sebelumnya) ...
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

  // ... (tes-tes lain yang sudah benar) ...
  test('merender link navigasi utama dengan benar', () => { /* ... */ });
  test('menampilkan tombol Login dan Sign Up saat pengguna tidak login', () => { /* ... */ });
  test('menampilkan tombol Logout saat pengguna login', async () => { /* ... */ });
  test('memanggil signOut dan navigasi saat tombol Logout diklik', async () => { /* ... */ });


  // TES YANG DIPERBARUI
  test('mengganti tema saat tombol tema diklik', () => {
    renderHeader();

    expect(document.body.className).not.toContain('dark');

    // Cari elemen menggunakan data-testid
    const themeToggleButton = screen.getByTestId('theme-toggle-button');
    fireEvent.click(themeToggleButton);
    
    expect(document.body.className).toContain('dark');

    fireEvent.click(themeToggleButton);

    expect(document.body.className).not.toContain('dark');
  });
});