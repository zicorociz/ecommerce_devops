// src/__tests__/Cart.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Cart } from '../components/Cart'; // Sesuaikan path jika lokasi file Anda berbeda

// --- Mocking global fetch API ---
// Ini adalah langkah paling penting. Kita tidak ingin tes kita membuat
// panggilan jaringan sungguhan. Kita akan mengganti fungsi `fetch` global
// dengan fungsi tiruan dari Jest.
global.fetch = jest.fn();

// Data tiruan yang akan kita "kembalikan" dari API palsu kita.
// Strukturnya harus sama dengan respons API asli.
const mockCategories = ["electronics", "jewelery", "men's clothing"];

describe('Cart Component (Category List)', () => {

  // Gunakan beforeEach untuk mengatur mock `fetch` sebelum setiap tes.
  beforeEach(() => {
    // Reset fetch mock sebelum setiap tes untuk isolasi
    fetch.mockClear();

    // Konfigurasi mock fetch agar mengembalikan data tiruan kita
    fetch.mockResolvedValue({
      // `fetch` mengembalikan promise yang resolve ke objek Response.
      // Objek Response memiliki method .json() yang juga mengembalikan promise.
      json: () => Promise.resolve(mockCategories),
    });
  });

  // Test 1: Memverifikasi render elemen statis
  test('renders static elements like the title', () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    // Periksa apakah judul utama ada di dokumen
    expect(screen.getByText('Popular Categories')).toBeInTheDocument();
    // Periksa apakah subjudul ada
    expect(screen.getByText('Choose from variety of items')).toBeInTheDocument();
  });

  // Test 2: Memverifikasi bahwa API dipanggil dan data ditampilkan
  test('fetches categories on mount and displays them', async () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    // Verifikasi bahwa `fetch` dipanggil ke URL yang benar
    expect(fetch).toHaveBeenCalledWith('https://fakestoreapi.com/products/categories');
    expect(fetch).toHaveBeenCalledTimes(1);

    // Tunggu hingga kategori dari data tiruan kita muncul di layar.
    // `findByText` adalah query asinkron yang akan menunggu elemen muncul.
    const firstCategory = await screen.findByText("electronics");
    expect(firstCategory).toBeInTheDocument();

    // Verifikasi bahwa semua kategori dari data tiruan kita dirender
    expect(screen.getByText("jewelery")).toBeInTheDocument();
    expect(screen.getByText("men's clothing")).toBeInTheDocument();
  });

  // Test 3: Memverifikasi bahwa setiap kategori adalah tautan (link) dengan href yang benar
  test('renders each category as a link with the correct path', async () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    // Tunggu hingga elemen muncul untuk memastikan fetch sudah selesai
    await screen.findByText("electronics");

    // Dapatkan elemen link berdasarkan teksnya
    const electronicsLink = screen.getByRole('link', { name: /electronics/i });
    const jeweleryLink = screen.getByRole('link', { name: /jewelery/i });

    // Periksa atribut `href` dari link tersebut.
    // Di lingkungan tes, href akan menjadi URL lengkap.
    expect(electronicsLink).toHaveAttribute('href', '/Products/category/electronics');
    expect(jeweleryLink).toHaveAttribute('href', '/Products/category/jewelery');
  });

  // Test 4: Memverifikasi link "All Categories"
  test('renders "All Categories" links pointing to the correct page', () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    // Ada dua link "All Categories" (satu untuk desktop, satu untuk mobile)
    const allCategoryLinks = screen.getAllByRole('link', { name: /all categories/i });
    
    // Pastikan ada 2 link
    expect(allCategoryLinks).toHaveLength(2);

    // Periksa apakah keduanya mengarah ke path yang benar
    allCategoryLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/ProductPage/');
    });
  });
});