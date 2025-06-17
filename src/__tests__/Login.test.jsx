// src/__tests__/Login.test.jsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../modules/Login'; // Sesuaikan path jika perlu

// --- Mocking Dependencies ---
// Kita membuat mock untuk dependensi eksternal agar tes kita terisolasi dan cepat.

// 1. Mock 'react-router-dom'
// Kita perlu mock `useNavigate` untuk mengembalikan fungsi mock (jest.fn())
// agar kita bisa memeriksa apakah fungsi tersebut dipanggil.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // impor modul asli
  useNavigate: () => mockNavigate, // ganti useNavigate dengan mock kita
}));

// 2. Mock 'firebase/auth'
// Kita mock fungsi `signInWithEmailAndPassword` agar tidak membuat panggilan API sungguhan.
const mockSignInWithEmailAndPassword = jest.fn();
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signInWithEmailAndPassword: (auth, email, password) => mockSignInWithEmailAndPassword(auth, email, password),
}));

// 3. Mock file konfigurasi firebase lokal
// Ini memastikan kita menggunakan objek `auth` tiruan.
jest.mock('../firebase', () => ({
  auth: {
    // properti tiruan, bisa kosong atau berisi apa yang dibutuhkan
  },
}));

// Menggunakan objek `auth` yang sudah dimock dari file di atas
import { auth } from '../firebase';

// --- Test Suite ---

describe('Login Component', () => {

  // Membersihkan mock sebelum setiap tes untuk menghindari kebocoran antar tes
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSignInWithEmailAndPassword.mockClear();
  });

  test('renders the login form correctly', () => {
    render(<Login />);

    // Memeriksa apakah judul, input, dan tombol ada di layar
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  test('allows user to log in successfully and navigates to home', async () => {
    // Setup: Atur agar mock signIn berhasil (resolve)
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid-123' },
    });

    const user = userEvent.setup();
    render(<Login />);

    // Aksi: Pengguna mengisi form dan menekan tombol login
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verifikasi:
    // 1. Memastikan fungsi login Firebase dipanggil dengan data yang benar
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
    });

    // 2. Memastikan navigasi ke halaman utama ('/') terjadi setelah login berhasil
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    // 3. Memastikan tidak ada pesan error yang muncul
    expect(screen.queryByText(/incorrect email or password/i)).not.toBeInTheDocument();
  });

  test('shows an error message on failed login', async () => {
    // Setup: Atur agar mock signIn gagal (reject)
    const error = new Error('Firebase: Error (auth/wrong-password).');
    mockSignInWithEmailAndPassword.mockRejectedValue(error);

    const user = userEvent.setup();
    render(<Login />);

    // Aksi: Pengguna mengisi form dengan data yang salah dan menekan tombol login
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verifikasi:
    // 1. Menunggu dan memastikan pesan error ditampilkan di layar
    await waitFor(() => {
      expect(screen.getByText(/incorrect email or password/i)).toBeInTheDocument();
    });

    // 2. Memastikan navigasi TIDAK terjadi
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});