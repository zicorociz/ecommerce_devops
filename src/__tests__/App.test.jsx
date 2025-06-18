// src/__tests__/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App'; // Path relatif dari __tests__ ke src

// --- Mocking (Membuat Tiruan) Komponen Anak ---
// Ini adalah bagian terpenting. Kita mengganti komponen asli dengan tiruan sederhana.
// Tujuannya agar tes ini hanya fokus pada logika routing di App.js,
// bukan pada isi dari puluhan komponen lainnya.
// Path seperti '../components/Header' sudah disesuaikan untuk struktur folder src/__tests__

jest.mock('../components/Header', () => () => <div>Mock Header</div>);
jest.mock('../components/Footer', () => () => <div>Mock Footer</div>);
jest.mock('../modules/Home', () => () => <div>Mock Home</div>);
jest.mock('../modules/ProductPage', () => () => <div>Mock ProductPage</div>);
jest.mock('../modules/About', () => () => <div>Mock About</div>);
jest.mock('../modules/Category', () => () => <div>Mock Category</div>);
jest.mock('../modules/ShoppingCart', () => () => <div>Mock ShoppingCart</div>);
jest.mock('../modules/Context', () => () => <div>Mock Context</div>);
jest.mock('../modules/ErrorPage', () => () => <div>Mock ErrorPage</div>);
jest.mock('../modules/Products', () => () => <div>Mock Products</div>);
jest.mock('../modules/CategoryPage', () => () => <div>Mock CategoryPage</div>);
jest.mock('../modules/Login', () => () => <div>Mock Login</div>);
jest.mock('../modules/SignUp', () => () => <div>Mock SignUp</div>);

// Mock PrivateRoute untuk memeriksa apakah komponen anak ter-render di dalamnya
jest.mock('../routes/PrivateRoute', () => ({ children }) => (
  <div>Mock PrivateRoute: {children}</div>
));

// Mock ToastContainer dari library eksternal
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div>Mock ToastContainer</div>,
  toast: jest.fn(), // Fungsi tiruan jika ada komponen yang memanggil toast
}));


/**
 * Fungsi helper untuk merender komponen dengan konteks router.
 * Ini membuat kode tes lebih bersih dan mudah dibaca.
 * @param {React.ReactElement} ui - Komponen React yang akan dirender
 * @param {{route: string}} options - Opsi untuk menentukan rute awal
 * @returns Hasil render dari React Testing Library
 */
const renderWithRouter = (ui, { route = '/' } = {}) => {
  return render(ui, {
    // MemoryRouter adalah pembungkus yang ideal untuk menguji routing
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    ),
  });
};


describe('App Component Routing', () => {
  // Test 1: Memastikan komponen statis (Header, Footer) selalu ada
  test('selalu merender Header, Footer, dan ToastContainer', () => {
    renderWithRouter(<App />);
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
    expect(screen.getByText('Mock ToastContainer')).toBeInTheDocument();
  });

  // Test 2: Rute halaman utama
  test('merender komponen Home pada rute "/"', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByText('Mock Home')).toBeInTheDocument();
  });

  // Test 3: Rute halaman kategori produk
  test('merender komponen Category pada rute "/ProductPage"', () => {
    renderWithRouter(<App />, { route: '/ProductPage' });
    expect(screen.getByText('Mock Category')).toBeInTheDocument();
  });

  // Test 4: Rute halaman detail produk dengan parameter dinamis
  test('merender komponen ProductPage pada rute "/ProductPage/:id"', () => {
    renderWithRouter(<App />, { route: '/ProductPage/sepatu-keren-123' });
    expect(screen.getByText('Mock ProductPage')).toBeInTheDocument();
  });

  // Test 5: Rute halaman About
  test('merender komponen About pada rute "/About"', () => {
    renderWithRouter(<App />, { route: '/About' });
    expect(screen.getByText('Mock About')).toBeInTheDocument();
  });
  
  // Test 6: Rute halaman kategori spesifik dengan parameter dinamis
  test('merender komponen CategoryPage pada rute "/Products/category/:category"', () => {
    renderWithRouter(<App />, { route: '/Products/category/electronics' });
    expect(screen.getByText('Mock CategoryPage')).toBeInTheDocument();
  });

  // Test 7: Rute halaman Login
  test('merender komponen Login pada rute "/login"', () => {
    renderWithRouter(<App />, { route: '/login' });
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
  });
  
  // Test 8: Rute halaman SignUp
  test('merender komponen SignUp pada rute "/signup"', () => {
    renderWithRouter(<App />, { route: '/signup' });
    expect(screen.getByText('Mock SignUp')).toBeInTheDocument();
  });

  // Test 9: Rute yang dilindungi (Private Route)
  test('merender ShoppingCart di dalam PrivateRoute pada rute "/ShoppingCard"', () => {
    renderWithRouter(<App />, { route: '/ShoppingCard' });
    // Memastikan wrapper PrivateRoute (tiruan) ada
    expect(screen.getByText(/Mock PrivateRoute/)).toBeInTheDocument();
    // Memastikan komponen ShoppingCart (tiruan) ada di dalam wrapper
    expect(screen.getByText('Mock ShoppingCart')).toBeInTheDocument();
  });

  // Test 10: Rute yang tidak ditemukan (halaman 404)
  test('merender ErrorPage untuk rute yang tidak valid', () => {
    renderWithRouter(<App />, { route: '/halaman-ini-tidak-ada' });
    expect(screen.getByText('Mock ErrorPage')).toBeInTheDocument();
    // Memastikan komponen lain (contoh: Home) tidak dirender
    expect(screen.queryByText('Mock Home')).not.toBeInTheDocument();
  });
});