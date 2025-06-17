import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Untuk matcher seperti .toBeInTheDocument()
import Footer from '../components/Footer'; // Sesuaikan path jika perlu

// Deskripsikan grup tes untuk komponen Footer
describe('Footer Component', () => {

  // Tes pertama: Memastikan komponen bisa dirender tanpa error
  test('renders without crashing', () => {
    render(<Footer />);
    // Kita tidak perlu assertion khusus di sini, tes akan gagal jika render error
  });

  // =========================================================================
  // --- PERBAIKAN DI SINI ---
  // Tes kedua yang sudah diperbaiki untuk menjadi lebih spesifik
  test('displays the brand name "Ecommerce" inside the main link', () => {
    render(<Footer />);
    
    // Cari elemen dengan role 'link' yang namanya mengandung "Ecommerce".
    // Ini akan menargetkan elemen <a>, bukan paragraf <p>.
    const brandLink = screen.getByRole('link', { name: /ecommerce/i });

    // Pastikan elemen link tersebut ada di dalam dokumen.
    expect(brandLink).toBeInTheDocument();

    // Assertion tambahan yang bagus untuk memastikan link mengarah ke homepage.
    expect(brandLink).toHaveAttribute('href', '/');
  });
  // --- AKHIR PERBAIKAN ---
  // =========================================================================


  // Tes ketiga: Memastikan judul kategori muncul
  // Karena ada beberapa judul "CATEGORIES", kita gunakan getAllByText
  test('displays "CATEGORIES" headings', () => {
    render(<Footer />);
    // Cari semua elemen yang berisi teks "CATEGORIES"
    const categoryHeadings = screen.getAllByText('CATEGORIES');
    // Pastikan kita menemukan lebih dari satu (dalam kasus Anda, ada 4)
    expect(categoryHeadings.length).toBeGreaterThan(0);
    expect(categoryHeadings.length).toBe(4); // Bisa lebih spesifik
  });

  // Tes keempat: Memastikan teks copyright muncul
  test('displays the copyright notice', () => {
    render(<Footer />);
    // Cari teks yang mengandung "Jaimin Patel"
    const copyrightText = screen.getByText(/jaimin patel/i);
    expect(copyrightText).toBeInTheDocument();
  });

  // Tes kelima: Memastikan link sosial ada
  // Kita bisa mencarinya berdasarkan 'aria-label' yang sudah Anda sediakan
  test('renders social media links', () => {
    render(<Footer />);
    // 'getAllByRole' akan mencari semua elemen dengan role 'button'
    const socialLinks = screen.getAllByRole('button', { name: /social link/i });
    // Pastikan ada 4 tombol link sosial
    expect(socialLinks).toHaveLength(4);
  });

});