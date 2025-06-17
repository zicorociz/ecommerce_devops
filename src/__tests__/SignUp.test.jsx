// src/__tests__/SignUp.test.jsx

// --- SEMUA IMPORT DIKUMPULKAN DI ATAS ---
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '../modules/SignUp';
import { auth } from '../firebase'; // <-- DIPINDAHKAN KE SINI

// --- Mocking Dependencies ---
// Mocking tetap di sini, setelah semua import.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockCreateUserWithEmailAndPassword = jest.fn();
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  createUserWithEmailAndPassword: (auth, email, password) =>
    mockCreateUserWithEmailAndPassword(auth, email, password),
}));

jest.mock('../firebase', () => ({
  auth: {
    // Objek auth tiruan
  },
}));

// --- Test Suite ---
describe('SignUp Component', () => {
  let alertSpy;
  
  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateUserWithEmailAndPassword.mockClear();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('renders the sign-up form correctly', () => {
    render(<SignUp />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test('shows an error message if passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password456');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('allows user to sign up successfully, shows alert, and navigates to login', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'new-user-uid-456' },
    });

    const user = userEvent.setup();
    render(<SignUp />);

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'newuser@example.com',
        'password123'
      );
    });

    expect(alertSpy).toHaveBeenCalledWith('Signup successful! Redirecting to login...');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows a firebase error message on failed sign-up', async () => {
    const error = new Error('Firebase: Error (auth/email-already-in-use).');
    mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

    const user = userEvent.setup();
    render(<SignUp />);

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Firebase: Error (auth/email-already-in-use).')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});