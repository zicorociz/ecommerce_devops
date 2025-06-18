import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductPage from '../modules/ProductPage';

// Mock dependencies
jest.spyOn(window, 'fetch');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Import fungsi-fungsi mock, TERMASUK 'doc'
const { getAuth } = require('firebase/auth');
const { getDoc, setDoc, doc } = require('firebase/firestore');
const { toast } = require('react-toastify');

const mockProduct = {
  id: 1,
  title: 'Classic T-Shirt',
  price: 25.00,
  description: 'A simple and classic t-shirt.',
  category: 'clothing',
  image: 'tshirt.jpg',
};

describe('ProductPage Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // --- TAMBAHKAN PERBAIKAN INI ---
    // Pastikan mock doc() selalu mengembalikan objek dummy
    doc.mockReturnValue({ path: 'dummy/path' }); 
  });

  const renderComponent = (user) => {
    getAuth.mockReturnValue({ currentUser: user });
    window.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    });
    
    render(
      <MemoryRouter initialEntries={[`/ProductPage/${mockProduct.id}`]}>
        <Routes>
          <Route path="/ProductPage/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('mengambil dan menampilkan detail produk dengan benar', async () => {
    renderComponent({ uid: 'test-user' });
    expect(await screen.findByText('Classic T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('clothing')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText(/A simple and classic t-shirt/)).toBeInTheDocument();
    expect(window.fetch).toHaveBeenCalledWith(`https://fakestoreapi.com/products/${mockProduct.id}`);
  });

  test('menambahkan produk ke keranjang baru saat pengguna login', async () => {
    renderComponent({ uid: 'test-user' });
    getDoc.mockResolvedValue({ exists: () => false });
    const addToCartButton = await screen.findByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      // Verifikasi keranjang baru dibuat
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), {
        items: [{ ...mockProduct, quantity: 1 }],
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Item added successfully!', expect.any(Object));
  });

  test('menambah kuantitas produk yang sudah ada di keranjang', async () => {
    renderComponent({ uid: 'test-user' });
    const existingCartData = { items: [{ ...mockProduct, quantity: 2 }] };
    getDoc.mockResolvedValue({ exists: () => true, data: () => existingCartData });
    const addToCartButton = await screen.findByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      // Verifikasi kuantitasnya menjadi 3
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), {
        items: [{ ...mockProduct, quantity: 3 }],
      });
    });
  });

  test('menampilkan error saat pengguna tidak login mencoba menambah ke keranjang', async () => {
    renderComponent(null);
    const addToCartButton = await screen.findByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    expect(setDoc).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('You must be logged in to add items to the cart!', expect.any(Object));
  });
});