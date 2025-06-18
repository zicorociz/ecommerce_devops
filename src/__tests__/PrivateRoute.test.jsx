import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../routes/PrivateRoute'; // Sesuaikan path

// --- MOCK SEMUA DEPENDENSI ---
let authStateCallback = null;
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    authStateCallback = callback;
    return jest.fn(); // fungsi unsubscribe
  }),
}));
jest.mock('../firebase', () => ({ auth: {} }));
jest.mock('react-toastify', () => ({
  toast: {
    warning: jest.fn(),
  },
}));

// Import fungsi mock untuk kita kontrol
const { toast } = require('react-toastify');

// --- GRUP TES ---
describe('PrivateRoute Component', () => {

  // Halaman dummy yang akan diproteksi
  const ProtectedPage = () => <div>Halaman Rahasia</div>;
  // Halaman login dummy
  const LoginPage = () => <div>Halaman Login</div>;
  
  // Fungsi helper untuk merender komponen dengan setup router
  const renderPrivateRoute = () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <PrivateRoute>
                <ProtectedPage />
              </PrivateRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;
  });

  test('menampilkan "Loading..." pada awalnya', () => {
    renderPrivateRoute();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('me-render children (halaman yang diproteksi) saat pengguna login', async () => {
    renderPrivateRoute();
    
    // Tunggu sampai listener auth siap
    await waitFor(() => expect(authStateCallback).not.toBeNull());
    
    // Simulasikan pengguna login
    act(() => {
      authStateCallback({ uid: 'user-terproteksi' });
    });
    
    // Verifikasi bahwa halaman rahasia sekarang ditampilkan
    expect(await screen.findByText('Halaman Rahasia')).toBeInTheDocument();
  });

  test('mengarahkan ke halaman login saat pengguna tidak login', async () => {
    renderPrivateRoute();

    await waitFor(() => expect(authStateCallback).not.toBeNull());
    
    // Simulasikan pengguna tidak login
    act(() => {
      authStateCallback(null);
    });

    // Verifikasi bahwa pengguna diarahkan dan "Halaman Login" ditampilkan
    expect(await screen.findByText('Halaman Login')).toBeInTheDocument();
    
    // Verifikasi bahwa halaman rahasia TIDAK ditampilkan
    expect(screen.queryByText('Halaman Rahasia')).not.toBeInTheDocument();
  });
  
  test('memanggil notifikasi toast saat pengguna tidak login', async () => {
    renderPrivateRoute();

    await waitFor(() => expect(authStateCallback).not.toBeNull());
    
    // Simulasikan pengguna tidak login
    act(() => {
      authStateCallback(null);
    });
    
    // Tunggu sampai redirect selesai
    await screen.findByText('Halaman Login');

    // Verifikasi toast warning dipanggil
    expect(toast.warning).toHaveBeenCalledWith("Silakan login terlebih dahulu untuk mengakses halaman ini.");
    expect(toast.warning).toHaveBeenCalledTimes(1);
  });
});