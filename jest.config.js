// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // Opsional, tapi sangat direkomendasikan
  moduleNameMapper: {
    // Menangani asset statis jika ada (misal, CSS, gambar)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};