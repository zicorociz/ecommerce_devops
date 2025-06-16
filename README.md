# Proyek CI/CD DevOps – E-commerce

Repositori ini dibuat untuk mengimplementasikan praktik **Continuous Integration (CI)** dan **Continuous Deployment (CD)** menggunakan GitHub Actions, Docker, SonarQube, dan deployment ke server VPS (Niagahoster). Proyek ini dilengkapi dengan monitoring uptime menggunakan Uptime Kuma.
![image_alt](https://github.com/zicorociz/cobadevops3/blob/b0dfc7a6d8dace330440f8e79e5b77ea70ceda42/website%20page.png)

## 📄 Dokumentasi Proyek
👉 Dokumentasi lengkap proyek PSO dapat diakses [di sini](https://docs.google.com/document/d/1a2DzO4n6TFwfom2k698a_BO9H8oXvmMIc7KmMnWqqIs/edit?tab=t.0).


## 📌 Tujuan

1. Otomatisasi build, test, dan analisis kode menggunakan CI.
2. Otomatisasi deployment ke server produksi menggunakan CD.
3. Monitoring aplikasi yang telah di-deploy.

## 🔁 Alur CI/CD

<div align="center">
  <img src="https://github.com/zicorociz/cobadevops3/blob/5ca5476a26ba1c01ddca110cd84d5bc6b6dc21ad/workflow.png?raw=true" width="700"/>
</div>

### 1. Continuous Integration (CI) – Branch `staging`
Setiap kali ada push ke branch `staging`, maka proses berikut akan dijalankan:

#### 🔄 Workflow CI:

1. **Install dependensi**

   Menginstal semua dependencies yang dibutuhkan proyek:

   ```bash
   npm install

2. **Install Babel Dependencies**

   Digunakan untuk mendukung fitur ECMAScript terbaru di Jest:

   ```bash
   npm install --save-dev @babel/core @babel/preset-env babel-jest
   ```
3. **Run Unit Testing dengan Jest**

   Menjalankan pengujian unit menggunakan Jest dan menampilkan laporan coverage:
   ```bash
   npm test -- --coverage
   ```
4. **Linting dengan ESLint**

   Mengecek kualitas dan konsistensi gaya penulisan kode:
   ```bash
   npm run lint

5. **Analisis Kode dengan SonarQube**
   - Menggunakan token rahasia `SONAR_TOKEN`.
   - Tools ini akan melakukan analisa terhadap kualitas kode, seperti code smells, duplikasi, dan potensi bugs.

6. **Build Docker Image**
   - Image akan dibangun berdasarkan `Dockerfile`.
   - Image diberi tag `cobadevops3-staging`.

### 2.Continuous Deployment (CD) – Branch `main`
Setiap kali ada push ke branch `main`, maka proses berikut akan dijalankan:

#### 🔄 Workflow CD:

1. **Login ke DockerHub**
   - Menggunakan secret `DOCKER_USERNAME` dan `DOCKER_PASSWORD`.

2. **Build Docker Image**
   - Dari source code terbaru di branch `main`.

3. **Push Docker Image ke DockerHub**
   - Nama image: `username/cobadevops3-main`.

4. **Remote Deployment ke VPS via SSH**
   - Menggunakan sshpass untuk SSH ke server VPS Niagahoster.
   - VPS akan:
      - Menghentikan container lama (jika ada).
      - Menghapus container lama.
      - Menarik image terbaru dari DockerHub.
      - Menjalankan container baru dengan port 8090.

5. **Monitoring dengan Uptime Kuma**
   - Mengecek apakah server/proyek berhasil online pasca-deploy.

