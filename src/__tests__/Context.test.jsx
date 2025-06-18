import React from 'react';
// Impor 'act'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Context from '../modules/Context';

let authStateCallback = null;
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    authStateCallback = callback;
    return jest.fn();
  }),
}));
jest.mock('../firebase', () => ({ auth: {}, db: {} }));
jest.mock('firebase/firestore', () => ({
  // Perbaiki mock collection
  collection: jest.fn(() => ({ path: 'dummy-collection' })), 
  addDoc: jest.fn(),
  Timestamp: { now: jest.fn(() => ({ toDate: () => new Date() })) },
}));

// Import 'collection' agar bisa di-mock
const { addDoc, collection } = require('firebase/firestore');

describe('Contact Form (Context) Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;
    // Pastikan mock collection di-reset dan di-setup
    collection.mockReturnValue({ path: 'dummy-collection' });
  });

  // Tes lain tetap sama...
  test('merender form kontak dengan benar', () => {
    render(<Context />);
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
  });

  test('memperbarui input form saat pengguna mengetik', () => {
    render(<Context />);
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
  });

  test('berhasil mengirim form dan meresetnya saat submit berhasil', async () => {
    addDoc.mockResolvedValue({ id: 'doc123' });
    render(<Context />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello World' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Message sent successfully!')).toBeInTheDocument();
  });

  test('menampilkan pesan error saat submit gagal', async () => {
    addDoc.mockRejectedValue(new Error('Firestore error'));
    render(<Context />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Fail' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fail@test.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'This should fail.' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/failed to send message/i)).toBeInTheDocument();
  });

  // Tes terakhir yang sudah diperbaiki sepenuhnya
  test('menyertakan UID saat pengguna login', async () => {
    addDoc.mockResolvedValue({ id: 'doc123' });
    render(<Context />);
    
    await waitFor(() => {
      expect(authStateCallback).not.toBeNull();
    });

    // Bungkus pemanggilan callback dengan 'act'
    act(() => {
      authStateCallback({ uid: 'user-logged-in-456' });
    });

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Logged In User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'logged@in.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'A message.' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'user-logged-in-456',
        })
      );
    });
  });
});