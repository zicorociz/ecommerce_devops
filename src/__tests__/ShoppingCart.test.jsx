import React from 'react';
// Hapus 'within' jika tidak digunakan di tempat lain
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ShoppingCart from '../modules/ShoppingCart';

// ... (semua mock tetap sama) ...
jest.mock('firebase/auth', () => ({ getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user-id-123' } })) }));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn(), doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), useNavigate: () => mockNavigate }));
const { getDoc, setDoc, doc } = require('firebase/firestore');


describe('ShoppingCart Component', () => {
  const mockCartData = {
    items: [
      { id: 'prod1', title: 'Laptop Pro', price: '1200', quantity: 1, image: 'laptop.jpg' },
      { id: 'prod2', title: 'Mouse Canggih', price: '30', quantity: 2, image: 'mouse.jpg' },
    ],
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    doc.mockReturnValue({ path: 'dummy/path' }); 
  });

  test('menampilkan pesan "Cart is Empty" saat tidak ada item', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ items: [] }) });
    render(<MemoryRouter><ShoppingCart /></MemoryRouter>);
    expect(await screen.findByText('Cart is Empty')).toBeInTheDocument();
  });

  // Tes yang sudah diperbaiki untuk mematuhi aturan ESLint
  test('menampilkan item dan total harga dengan benar saat keranjang berisi', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockCartData });
    render(<MemoryRouter><ShoppingCart /></MemoryRouter>);

    expect(await screen.findByText('Laptop Pro')).toBeInTheDocument();
    expect(await screen.findByText('Mouse Canggih')).toBeInTheDocument();
    
    const totalAmount = (1200 * 1) + (30 * 2);
    
    // Cari SEMUA elemen yang cocok dengan teks harga
    const allTotalAmounts = await screen.findAllByText(`₹ ${totalAmount.toFixed(2)}`);
    
    // Verifikasi bahwa kita menemukan dua elemen, seperti yang diharapkan
    expect(allTotalAmounts).toHaveLength(2);
  });

  // Tes lain tetap sama...
  test('menambah kuantitas saat tombol "+" diklik', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockCartData });
    render(<MemoryRouter><ShoppingCart /></MemoryRouter>);
    const increaseButtons = await screen.findAllByRole('button', { name: '+' });
    fireEvent.click(increaseButtons[0]);
    await waitFor(() => { expect(setDoc).toHaveBeenCalledTimes(1); });
    const expectedData = { items: [{ ...mockCartData.items[0], quantity: 2 }, mockCartData.items[1]] };
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), expectedData);
  });

  test('menghapus item saat tombol "REMOVE" diklik', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockCartData });
    render(<MemoryRouter><ShoppingCart /></MemoryRouter>);
    const removeButtons = await screen.findAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    await waitFor(() => { expect(setDoc).toHaveBeenCalledTimes(1); });
    const expectedData = { items: [mockCartData.items[1]] };
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), expectedData);
  });

  test('menavigasi ke halaman checkout saat tombol "Proceed to Checkout" diklik', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockCartData });
    render(<MemoryRouter><ShoppingCart /></MemoryRouter>);
    const checkoutButton = await screen.findByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
});