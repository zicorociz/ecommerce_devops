import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Products from '../modules/Products';

// Mock fetch
beforeEach(() => {
  jest.spyOn(window, 'fetch').mockImplementation(mockFetch);
});
afterEach(() => {
  jest.restoreAllMocks();
});

const mockProductsData = [
  {
    id: 1,
    title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
    price: 109.95,
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
  },
  {
    id: 2,
    title: 'Mens Casual Premium Slim Fit T-Shirts',
    price: 22.3,
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
  },
];

const mockFetch = async (url) => ({
  ok: true,
  status: 200,
  json: async () => mockProductsData,
});

describe('Products Component', () => {

  test('menampilkan judul "All Products"', () => {
    render(<MemoryRouter><Products /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /all products/i })).toBeInTheDocument();
  });

  // Tes yang sudah diperbaiki dengan urutan yang benar
  test('mengambil dan menampilkan daftar produk dari API', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Tunggu sampai elemen-elemen dari data mock muncul di layar
    expect(await screen.findByText(mockProductsData[0].title)).toBeInTheDocument();
    expect(await screen.findByText(mockProductsData[1].title)).toBeInTheDocument();

    // Setelah dipastikan UI sudah ter-update, baru verifikasi panggilan fetch
    expect(window.fetch).toHaveBeenCalledTimes(2); // Diharapkan 2x karena Strict Mode
    expect(window.fetch).toHaveBeenCalledWith('https://fakestoreapi.com/products');
  });

  test('setiap produk adalah link yang bisa diklik ke halaman detailnya', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Tunggu sampai link muncul
    const firstProductLink = await screen.findByRole('link', { name: new RegExp(mockProductsData[0].title) });
    
    // Verifikasi atribut href
    expect(firstProductLink).toHaveAttribute('href', `/ProductPage/${mockProductsData[0].id}`);
  });
});