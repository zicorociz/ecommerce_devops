// src/__tests__/SignUp.test.jsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '../modules/SignUp'; // Sesuaikan path jika perlu

// --- Mocking Dependencies ---
// Pola yang sama seperti pada Login.test.jsx

// 1. Mock 'react-router-dom' untuk mengontrol navigasi
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// 2. Mock 'firebase/auth' untuk mengontrol fungsi createUser...
const mockCreateUserWithEmailAndPassword = jest.fn();
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  createUserWithEmailAndPassword: (auth, email, password) =>
    mockCreateUserWithEmailAndPassword(auth, email, password),
}));

// 3. Mock file konfigurasi firebase lokal
jest.mock('../firebase', () => ({
  auth: {
    // Objek auth tiruan
  },
}));

// Mengimpor objek `auth` yang sudah dimock
import { auth } from '../firebase';

// --- Test Suite ---

describe('SignUp Component', () => {
  // 4. Mock window.alert karena tidak tersedia di lingkungan JSDOM
  // Kita menggunakan jest.spyOn agar bisa merestore-nya nanti
  let alertSpy;
  beforeEach(() => {
    // Membersihkan semua mock sebelum setiap tes
    mockNavigate.mockClear();
    mockCreateUserWithEmailAndPassword.mockClear();
    // Menyiapkan spy untuk window.alert
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    // Membersihkan spy setelah setiap tes untuk menghindari kebocoran
    alertSpy.mockRestore();
  });

  test('renders the sign-up form correctly', () => {
    render(<SignUp />);

    // Memeriksa elemen-elemen penting ada di layar
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument(); // regex untuk password saja
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('shows an error message if passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    // Aksi: Mengisi form dengan password yang tidak cocok
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password456'); // Password berbeda
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Verifikasi:
    // 1. Pesan error yang benar ditampilkan
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    // 2. Fungsi Firebase dan navigasi TIDAK dipanggil
    expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('allows user to sign up successfully, shows alert, and navigates to login', async () => {
    // Setup: Atur agar mock Firebase berhasil (resolve)
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'new-user-uid-456' },
    });

    const user = userEvent.setup();
    render(<SignUp />);

    // Aksi: Mengisi form dengan data yang valid
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Verifikasi:
    // 1. Memastikan fungsi Firebase dipanggil dengan data yang benar
    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'newuser@example.com',
        'password123'
      );
    });

    // 2. Memastikan alert dipanggil dengan pesan yang benar
    expect(alertSpy).toHaveBeenCalledWith('Signup successful! Redirecting to login...');
    
    // 3. Memastikan navigasi ke halaman login terjadi
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    
    // 4. Memastikan tidak ada pesan error yang muncul
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows a firebase error message on failed sign-up', async () => {
    // Setup: Atur agar mock Firebase gagal (reject) dengan pesan error spesifik
    const error = new Error('Firebase: Error (auth/email-already-in-use).');
    mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

    const user = userEvent.setup();
    render(<SignUp />);

    // Aksi: Mengisi form dengan data yang akan menyebabkan error
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Verifikasi:
    // 1. Menunggu dan memastikan pesan error dari Firebase ditampilkan
    await waitFor(() => {
      expect(screen.getByText('Firebase: Error (auth/email-already-in-use).')).toBeInTheDocument();
    });

    // 2. Memastikan navigasi TIDAK terjadi
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});