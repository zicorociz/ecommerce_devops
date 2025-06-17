// src/setupTests.js

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// -- TAMBAHKAN BARIS DI BAWAH INI --
import fetchMock from 'jest-fetch-mock';

// Atur TextEncoder/Decoder (sudah ada dari solusi sebelumnya)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Aktifkan fetch mock secara global
fetchMock.enableMocks();