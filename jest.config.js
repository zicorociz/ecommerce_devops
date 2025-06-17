// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    // Menangani asset statis jika ada (misal, CSS, gambar)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  //================================================================//
  //--- TAMBAHAN: BAGIAN INI UNTUK MEMASTIKAN SEMUA FILE DIANALISIS ---//
  //================================================================//

  /**
   * Memberitahu Jest untuk mengumpulkan cakupan tes dari semua file yang
   * cocok dengan pola di bawah ini, bahkan jika tidak ada tes untuk file tersebut.
   * Ini memastikan laporan cakupan yang komprehensif untuk SonarCloud.
   */
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}', // Mencakup semua file kode di dalam folder src

    // --- PENGECUALIAN (Kustomisasi sesuai kebutuhan proyek Anda) ---
    '!src/**/*.test.{js,jsx,ts,tsx}', // Abaikan file tes itu sendiri
    '!src/index.js',                  // Abaikan file entry point utama aplikasi
    '!src/reportWebVitals.js',        // Abaikan file performa (jika ada)
    '!src/setupTests.js',             // Abaikan file setup tes
    // '!src/constants/**',           // Contoh: Abaikan folder yang hanya berisi konstanta
    // '!src/types/**',               // Contoh: Abaikan folder yang hanya berisi definisi tipe TypeScript
  ],
};