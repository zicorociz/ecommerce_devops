// src/__tests__/Login.test.jsx

// --- SEMUA IMPORT DIKUMPULKAN DI ATAS ---
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../modules/Login';
import { auth } from '../firebase'; // <-- DIPINDAHKAN KE SINI

// --- Mocking Dependencies ---
// Mocking tetap di sini, setelah semua import. Jest akan menanganinya.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockSignInWithEmailAndPassword = jest.fn();
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signInWithEmailAndPassword: (auth, email, password) => mockSignInWithEmailAndPassword(auth, email, password),
}));

jest.mock('../firebase', () => ({
  auth: {
    // Properti tiruan yang dibutuhkan oleh tes
  },
}));


// --- Test Suite ---

describe('Login Component', () => {

  // Membersihkan mock sebelum setiap tes
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSignInWithEmailAndPassword.mockClear();
  });

  test('renders the login form correctly', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('allows user to log in successfully and navigates to home', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid-123' },
    });

    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth, // 'auth' yang diimpor dari mock sudah benar
        'test@example.com',
        'password123'
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    expect(screen.queryByText(/incorrect email or password/i)).not.toBeInTheDocument();
  });

  test('shows an error message on failed login', async () => {
    const error = new Error('Firebase: Error (auth/wrong-password).');
    mockSignInWithEmailAndPassword.mockRejectedValue(error);

    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect email or password/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});