// src/__tests__/firebase.test.js

// Impor fungsi yang ingin kita lacak dari modul yang akan kita mock
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Mocking (Membuat Tiruan) Modul Firebase ---
// Ini adalah langkah kunci. Kita memberitahu Jest untuk mengganti
// modul 'firebase/...' dengan objek tiruan kita sendiri.
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ // Lacak panggilan dan kembalikan objek 'app' tiruan
    name: 'mock-app',
  })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ // Lacak panggilan dan kembalikan objek 'auth' tiruan
    currentUser: null,
  })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({ // Lacak panggilan dan kembalikan objek 'db' tiruan
    collection: jest.fn(),
  })),
}));


// Definisikan firebaseConfig di sini agar bisa diakses di dalam tes
const expectedFirebaseConfig = {
  apiKey: "AIzaSyAy5tdVugIk4tAD_8m6FlSgXkQcNKheENw",
  authDomain: "pso-klp9.firebaseapp.com",
  projectId: "pso-klp9",
  storageBucket: "pso-klp9.appspot.com",
  messagingSenderId: "39575625516",
  appId: "1:39575625516:web:b0d5c844b239ea18585689",
  measurementId: "G-6V6T4T7M1S"
};

describe('Firebase Initialization', () => {

  // Gunakan beforeEach untuk mereset mock sebelum setiap tes.
  // Ini memastikan tes berjalan secara terisolasi.
  beforeEach(() => {
    // Membersihkan semua histori panggilan mock dari tes sebelumnya
    initializeApp.mockClear();
    getAuth.mockClear();
    getFirestore.mockClear();
  });

  test('initializeApp harus dipanggil dengan konfigurasi yang benar', () => {
    // 'require' digunakan di sini untuk menjalankan kode di firebase.js
    // setelah mock diatur.
    require('../firebase.js');

    // Verifikasi bahwa initializeApp dipanggil
    expect(initializeApp).toHaveBeenCalledTimes(1);
    
    // Verifikasi bahwa initializeApp dipanggil dengan objek konfigurasi yang kita harapkan
    expect(initializeApp).toHaveBeenCalledWith(expectedFirebaseConfig);
  });

  test('getAuth dan getFirestore harus dipanggil setelah inisialisasi aplikasi', () => {
    require('../firebase.js');

    const mockAppInstance = initializeApp.mock.results[0].value;

    // Verifikasi bahwa getAuth dipanggil
    expect(getAuth).toHaveBeenCalledTimes(1);
    // Verifikasi bahwa getAuth dipanggil dengan instance aplikasi tiruan
    expect(getAuth).toHaveBeenCalledWith(mockAppInstance);

    // Verifikasi bahwa getFirestore dipanggil
    expect(getFirestore).toHaveBeenCalledTimes(1);
    // Verifikasi bahwa getFirestore dipanggil dengan instance aplikasi tiruan
    expect(getFirestore).toHaveBeenCalledWith(mockAppInstance);
  });

  test('mengekspor instance app, auth, dan db yang sudah diinisialisasi', () => {
    // Impor hasil dari file firebase.js
    const { app, auth, db } = require('../firebase.js');

    // Verifikasi bahwa objek yang diekspor tidak null atau undefined
    expect(app).toBeDefined();
    expect(auth).toBeDefined();
    expect(db).toBeDefined();

    // Verifikasi bahwa objek yang diekspor adalah hasil dari fungsi mock kita
    // Ini memastikan bahwa semua terhubung dengan benar.
    expect(app).toEqual({ name: 'mock-app' });
    expect(auth).toEqual({ currentUser: null });
    expect(db).toBeDefined(); // Cukup periksa apakah defined karena mock-nya lebih kompleks
  });
});