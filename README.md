# 🎮 SaumaBox

> **All-in-One Personal Media Catalog & Archiving System**  
> Kelola, arsipkan, dan pantau seluruh koleksi Game, Cinema, dan Musik pribadi Anda dalam satu platform web modern, ringan, dan mandiri tanpa ketergantungan cloud pihak ketiga.

[![Version](https://img.shields.io/badge/version-v0.1.0-blue.svg)](https://github.com/ZhangNX221/SaumaBox/releases/tag/v0.1.0)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-003B57.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Design](https://img.shields.io/badge/Design-DitherOS%20Inspired-8B5CF6.svg)](#desain-antarmuka)

---

## 🌟 Sorotan Fitur Utama

### 1. Tampilan Fleksibel: Grid Poster vs Tabel Spreadsheet
- **Visual Poster & Album Grid**: Terinspirasi dari antarmuka modern **PlayStation Plus Games Catalog** dan **Educatech Card Design**.
  - **Rasio Poster Vertikal (3:4 & 2:3)** untuk Games dan Cinema, serta **Rasio Persegi (1:1)** untuk sampul album Musik.
  - Badge kategori dinamis, skor bintang rating, label harga/ketersediaan (*Gratis/Premium*), dan *Avatar Inisial Berwarna* yang unik.
  - Quick action buttons (status tontonan ☑️ dan favorit ❤️) langsung di kartu poster.
- **Dense Spreadsheet Table**: Mode tabel padat untuk meninjau data dalam jumlah besar dengan cepat, lengkap dengan sorting kolom, filter multi-dimensi, dan pagination.
- **Penyimpanan Preferensi Tampilan**: Preferensi tampilan (*Grid* atau *Tabel*) tersimpan otomatis di setiap modul.

### 2. Tiga Pilar Manajemen Media
- 🎮 **Katalog Game**:
  - **PC Games**: Informasi publisher, developer, platform pembelian (Steam, Epic, GOG), harga beli, dan kartu **Auto-Sum Total Investasi Game**.
  - **Emulator Games**: Pendataan konsol retro/modern (PS2, PSP, Wii U, Switch, dll.), software emulator (PCSX2, RPCS3, Cemu, Ryujinx), dan format ROM (`.iso`, `.chd`, `.nsp`).
  - **Recompilation & PC Ports**: Pelacakan game decompiled/porting native modern (Ship of Harkinian, OpenGOAL, SM64 PC Port) beserta catatan modifikasi 60/120 FPS dan HD texture pack.
- 🎬 **Katalog Cinema**:
  - Mendukung **Movies**, **TV Series**, dan **Anime**.
  - Pelacakan jumlah episode & season, studio produksi, negara asal, genre, dan rating IMDb.
  - Tombol instan penanda status tontonan (⬜ Belum / ☑️ Sudah).
- 🎵 **Katalog Musik**:
  - Pengarsipan file lokal resolusi tinggi (FLAC, Hi-Res, MP3) dan streaming library (Spotify, Apple Music).
  - Informasi ukuran file (MB), genre, tahun rilis, album, komposer/artis, serta pin lagu favorit.

### 3. Keamanan & Kedaulatan Data Penuh
- **Zero Cloud Lock-in**: Data Anda 100% milik Anda, disimpan di komputer lokal Anda menggunakan SQLite dengan mode WAL (*Write-Ahead Logging*) untuk performa baca/tulis tinggi dan anti-korupsi.
- **One-Click Backup & Restore**: Unduh snapshot database `.sqlite` kapan saja. Dilengkapi fitur restore otomatis dengan uji integritas (`PRAGMA integrity_check;`) dan auto-snapshot rollback sebelum penimpaan database.
- **Import & Export CSV**: Kemudahan ekspor seluruh data ke file CSV dan impor massal dari spreadsheet luar.
- **Autentikasi Session Aman**: Hash sandi berstandar kriptografi PBKDF2 dengan salt acak dan token sesi SHA-256 yang aman dalam cookie `HttpOnly`.
- **Mode Publik & Admin**: Tamu publik dapat menjelajahi katalog dengan bebas (read-only), sementara akses tambah, edit, hapus, impor, dan restore terkunci khusus akun administrator.

---

## 🛠️ Arsitektur & Teknologi

SaumaBox dirancang dengan prinsip **Zero-Bloat / High Performance**:

| Komponen | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend** | Node.js (22+) & Express 5 | Ringan, cepat, dan menggunakan driver native `node:sqlite` tanpa kompilasi C++ lokal (*no node-gyp required*). |
| **Database** | SQLite 3 (WAL Mode) | Format penyimpanan file tunggal yang tangguh, nol konfigurasi server terpisah, dan ACID-compliant. |
| **Frontend** | Vanilla JavaScript (ES2022) | Bebas dari build step yang lambat; kode langsung dijalankan oleh browser dengan performa maksimal. |
| **Styling** | Vanilla CSS (DitherOS System) | Desain bertema DitherOS bernuansa industrial cyberpunk, mendukung Dark Mode & Light Mode, serta aksesibilitas tinggi (WCAG AA). |

---

## 🚀 Memulai Instalasi & Menjalankan

### Prasyarat
- **Node.js** versi **v22.0.0** atau yang lebih baru (mendukung native `node:sqlite`).
- Browser modern (Chrome, Edge, Firefox, Safari).

### Langkah-langkah

1. **Clone repositori**:
   ```bash
   git clone https://github.com/ZhangNX221/SaumaBox.git
   cd SaumaBox
   ```

2. **Pasang dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan aplikasi**:
   ```bash
   npm start
   ```
   *Atau jalankan mode development (auto-reload saat file diedit):*
   ```bash
   npm run dev
   ```

4. **Buka di Browser**:
   Buka alamat berikut di browser Anda:
   ```
   http://localhost:3000
   ```

---

## 🔑 Akun Bawaan (Default Credentials)

Saat pertama kali dijalankan, sistem otomatis membuatkan skema database, data awal (seed), dan akun admin bawaan:

- **Username**: `admin`
- **Password**: `admin123`

> 💡 **Saran Keamanan**: Segera ganti kata sandi admin melalui menu pengaturan profil setelah login pertama kali.

---

## 📁 Struktur Direktori Proyek

```text
SaumaBox/
├── data/                       # Direktori database lokal (terabaikan di git)
│   ├── backups/                # Folder penyimpanan file backup snapshot
│   ├── uploads/                # Folder penyimpanan file upload poster/media
│   └── saumabox.sqlite         # Database aktif SQLite (otomatis dibuat)
├── docs/                       # Dokumentasi lengkap PRD & arsitektur sistem
│   └── prd/                    # 10 bab PRD terperinci
├── public/                     # Aset web statis frontend
│   ├── css/
│   │   └── style.css           # Desain tema DitherOS, grid visual & tata letak
│   ├── images/
│   │   └── covers/             # Koleksi cover poster game, cinema, & musik
│   ├── js/
│   │   ├── api.js              # Klien HTTP fetch dengan penanganan error
│   │   ├── app.js              # Controller utama aplikasi & logika tampilan
│   │   └── utils.js            # Utilitas format rupiah, tanggal, rating, badge
│   └── index.html              # Halaman SPA tunggal
├── server/                     # Backend API & layanan sistem
│   ├── db.js                   # Inisialisasi SQLite, schema DDL, seed data, & logging
│   └── index.js                # Server Express, routing REST API, & session auth
├── package.json
└── README.md
```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE). Bebas digunakan, dimodifikasi, dan dikembangkan untuk keperluan personal maupun komunitas.
