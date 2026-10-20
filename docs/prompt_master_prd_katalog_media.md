# Prompt Master: Pembuatan PRD Aplikasi Katalog Games, Cinema & Music

Salin seluruh teks di bawah garis pembatas ini dan tempelkan ke AI untuk menghasilkan dokumen **Product Requirements Document (PRD)** yang lengkap dan siap dieksekusi:

---

## [MULAI SALIN DARI SINI]

**Role & Objective:**
Bertindaklah sebagai Senior Product Manager dan System Architect. Buatkan **Product Requirements Document (PRD)** yang lengkap, detail, dan siap dieksekusi oleh developer untuk membangun aplikasi **"All-in-One Personal Media Catalog" (Games, Cinema, & Music)** berbasis Web dan Mobile dengan database **SQLite**.

---

### 1. Visi & Aksesibilitas Produk (Web & Mobile)
* **Cross-Platform (Web & Mobile):** Aplikasi harus mudah diakses melalui browser **Desktop (Web)** maupun **Smartphone/Tablet (Mobile)** menggunakan pendekatan *Responsive Web Design* dan **Progressive Web App (PWA)** yang dapat diinstal langsung di layar utama perangkat.
* **Tampilan Desktop:** Menggunakan tampilan tabel interaktif (*data grid* seperti *spreadsheet*) dengan fitur *multi-sort*, *filter* per kolom, pencarian instan, dan *color-coded badges*.
* **Tampilan Mobile:** Otomatis beradaptasi menjadi *Compact Card View* / *List View* yang nyaman dioperasikan dengan satu tangan, dilengkapi *bottom navigation bar* untuk berpindah antar modul (**Games**, **Cinema**, **Music**, dan **Database/Settings**).

---

### 2. Spesifikasi Modul & Skema Data

#### A. Modul Katalog Games (Terbagi dalam 3 Sub-Kategori)
Modul Games harus mendukung tampilan gabungan (*All Games*) maupun tampilan per tab kategori (**PC Games**, **Emulator Console**, dan **Recomp / Unofficial Port**).

##### 1) Sub-Kategori: PC Games (Official, Repack, & Digital Store)
* **Judul Game (`Games AAA`):** Nama lengkap game beserta informasi edisi/DLC (contoh: *Far Cry New Dawn Ultimate*, *It Takes Two*).
* **Tahun (`Year`):** Tahun rilis dalam format angka 4 digit.
* **Penerbit (`Publisher`):** Nama perusahaan penerbit (contoh: Ubisoft, Electronic Arts (EA), Bandai Namco).
* **Pengembang (`Developer`):** Nama studio pengembang (contoh: Ubisoft Montreal, Hazelight Studios, Mojiken Studio).
* **Ukuran (`Size PC (GB)`):** Kapasitas penyimpanan dalam satuan GB (mendukung angka desimal maupun teks status seperti `TBA`).
* **Rating:** Nilai skor ulasan atau penilaian pribadi.
* **Platform (`Platform PC`):** Pilihan *badge* berwarna sesuai platform distribusi:
  * `Steam` (Biru Tua)
  * `Epic` (Abu-abu Gelap)
  * `Ubisoft` (Abu-abu)
  * `GOG` (Oranye)
  * `Crack Fitgirl` / Repack (Kuning)
* **Status Kepemilikan (`Status`):** Pilihan *badge* berwarna:
  * `Purchase` (Hijau)
  * `Wishlist` (Biru Muda)
  * `Free` / `Free Uplay` (Ungu)
  * `Crack` (Kuning)
* **Harga & Kalkulasi Total (IDR):** Nilai harga beli dalam Rupiah (contoh: `Rp 169.750` atau `Rp -`) disertai fitur **Auto-Sum Header** yang otomatis menjumlahkan total pengeluaran dari seluruh game yang tampil sesuai filter aktif.

##### 2) Sub-Kategori: Game Emulator (Multi-Console)
* **Judul Game:** Nama game konsol beserta kode *region* opsional (`USA`, `JPN`, `EUR`).
* **Tahun (`Year`):** Tahun rilis asli di konsol.
* **Publisher & Developer:** Penerbit dan studio pengembang asli.
* **Konsol Asal (`Console`):** *Badge* penanda konsol:
  * **Sony:** `PS1`, `PS2`, `PS3`, `PSP`, `PS Vita`
  * **Nintendo:** `NES`, `SNES`, `N64`, `GameCube`, `Wii`, `Wii U`, `Switch`, `GB/GBA`, `NDS`, `3DS`
  * **Sega & Lainnya:** `Sega Genesis`, `Dreamcast`, `Xbox`, `Xbox 360`, `Arcade/MAME`
* **Software Emulator (`Emulator`):** Nama aplikasi emulator yang digunakan (contoh: *PCSX2*, *RPCS3*, *DuckStation*, *PPSSPP*, *Ryujinx/Yuzu/Citron*, *Cemu*, *Dolphin*, *Vita3K*, *Xenia*, *RetroArch*).
* **Format File (`ROM/ISO Format`):** Jenis ekstensi file (`.iso`, `.chd`, `.rvz`, `.nsp`, `.xci`, `.pkg`, `.3ds`).
* **Ukuran (`Size (GB)`):** Ukuran file ROM/ISO beserta *Update/DLC* dalam GB.
* **Status Kompatibilitas / Main (`Status`):** *Badge* status seperti `Playable (60 FPS)`, `Completed`, `Ingame`, `Unplayable`, atau `Backlog`.
* **Rating:** Skor penilaian pribadi.

##### 3) Sub-Kategori: Game Recomp & Unofficial PC Port (Decompilation / Native Port)
Kategori khusus untuk game konsol klasik yang di-*porting* secara tidak resmi oleh komunitas menjadi aplikasi *native* PC (melalui teknik *static recompilation* atau *decompilation* seperti proyek N64Recomp, Harbour Masters, atau OpenGOAL).
* **Judul Game:** Nama game atau nama proyek *porting* (contoh: *Ship of Harkinian (Ocarina of Time)*, *2Ship2Harkinian (Majora's Mask)*, *Zelda 64: Recompiled*, *Super Mario 64 PC Port*, *OpenGOAL: Jak and Daxter*, *Sonic Unleashed Recompiled*).
* **Tahun Rilis Asli & Tahun Port:** Tahun rilis game asli dan tahun rilis versi *porting*.
* **Konsol Asal (`Base Console`):** Konsol asli sebelum di-*port* (contoh: `N64`, `PS2`, `GameCube`, `Xbox 360`, `Dreamcast`).
* **Tim Porting / Engine (`Port Developer`):** Nama komunitas atau pengembang *port* (contoh: *Harbour Masters*, *Wiseguy / N64Recomp*, *OpenGOAL Team*, *SM64 Decomp Team*).
* **Versi Build (`Port Version`):** Versi aplikasi *port* saat ini (contoh: `v8.0.5`, `v1.2.0`, `Nightly Build`) untuk memudahkan pelacakan *update*.
* **Fitur Tambahan (`Enhancements`):** *Multi-tag* fitur yang didukung atau terpasang (contoh: `High FPS (60/120+)`, `Ultrawide Support`, `HD Texture Pack`, `Ray Tracing`, `Native Gyro/Controller`).
* **Ukuran (`Size PC (GB)`):** Total ukuran instalasi beserta *asset ROM* dan *texture pack* dalam GB.
* **Status & Rating:** *Badge* status (`Installed`, `Completed`, `Modded`, `Wishlist`) dan skor penilaian.

---

#### B. Modul Katalog Cinema (Movies, Series, & Anime)
* **Nomor Urut (`No`):** Penomoran baris otomatis sesuai urutan atau hasil filter.
* **Sub-Kategori (`Tipe`):** Pilihan kategori: **Movie**, **Series**, atau **Anime** (dilengkapi kolom opsional `Total Episode / Season` untuk Series & Anime).
* **Judul (`Judul`):** Nama film, serial, atau anime (contoh: *22 Menit*, *3 Srikandi*, *Ada Apa Dengan Cinta?*).
* **Rating (`Rating (IMDb)`):** Skor angka desimal (contoh: `6,6`, `7,1`, `8,6`) atau tanda `-` jika belum memiliki nilai.
* **Tahun (`Tahun`):** Tahun rilis tayangan.
* **Negara (`Negara`):** Negara asal produksi (contoh: Indonesia, Jepang, Korea Selatan, Amerika Serikat).
* **Studio (`Studio`):** Nama rumah produksi atau studio animasi (contoh: Falcon Pictures, Starvision, Multivision Pictures, MAPPA, Ufotable) atau `-` jika kosong.
* **Genre (`Genre`):** Dukungan *multi-tag* yang dipisahkan koma (contoh: `Aksi, Drama, Thriller` atau `Komedi, Romansa`).
* **Klasifikasi Usia (`Rating Umur`):** Kategori batas umur penonton (contoh: `SU (Semua Umur)`, `R (13+)`, `D (13+)`, `D (17+)`).
* **Status Tontonan (`Status`):** Komponen **Checkbox Interaktif** (centang sekali klik/ketuk) untuk menandai apakah tayangan sudah selesai ditonton atau belum.

---

#### C. Modul Katalog Music
* **Judul Lagu / Album:** Nama trek musik atau album.
* **Artis / Band:** Nama penyanyi, grup musik, atau komposer (termasuk *Original Soundtrack / OST Game & Anime*).
* **Album & Tahun Rilis:** Nama album dan tahun peluncuran.
* **Genre:** Kategori musik (*Pop, Rock, Jazz, J-Pop, Orkestra/Soundtrack*, dll.).
* **Platform / Format:** Sumber koleksi (*Spotify, YouTube Music, Apple Music, FLAC/Lossless, MP3, CD/Vinyl*).
* **Ukuran File (Opsional):** Untuk koleksi file lokal (MB/GB).
* **Rating & Status Favorit:** Skor penilaian pribadi dan *checkbox* status favorit/koleksi.

---

### 3. Fitur Import & Export Data (Spreadsheet Friendly)
* **Multi-Format Import:** Mendukung unggah file **Excel (`.xlsx`), CSV (`.csv`), dan JSON (`.json`)** untuk setiap modul dan sub-kategori.
* **Smart Column Mapping & Data Cleaning:**
  * Menyediakan antarmuka pencocokan kolom sebelum *import* dieksekusi, sehingga file Excel lama dengan nama kolom seperti `Games AAA`, `Size PC(GB)`, atau `Rating (IMDb)` dapat langsung dipetakan.
  * Mampu menangani nilai non-standar tanpa *error*, seperti teks `TBA` pada kolom ukuran GB, tanda strip `-` pada kolom Studio/Rating/Harga, serta format mata uang `Rp 169.750` yang otomatis dikonversi menjadi *integer* (`169750`) di database.
* **Flexible Export:** Pengguna dapat mengekspor seluruh data atau hanya data yang sedang ter-filter ke dalam format `.xlsx`, `.csv`, atau `.json`.

---

### 4. Arsitektur Database SQLite & Sistem Backup/Restore
* **Database Engine:** Menggunakan **SQLite** (file tunggal `.sqlite` / `.db`) dengan mode `PRAGMA journal_mode=WAL;` agar cepat, ringan, dan aman dari korupsi data saat diakses bersamaan.
* **1-Click Database Backup:**
  * Tombol khusus di menu Pengaturan untuk mengunduh file database SQLite utuh secara langsung (format nama file otomatis: `catalog_backup_YYYYMMDD_HHMM.sqlite`) baik dari browser Desktop maupun HP.
* **1-Click Database Restore & Safety Mechanism:**
  * Fitur unggah file `.sqlite` untuk memulihkan seluruh data aplikasi.
  * Sistem wajib melakukan validasi skema dan `PRAGMA integrity_check;` terhadap file yang diunggah.
  * Sebelum menimpa database aktif, sistem otomatis membuat *rollback snapshot* (`auto_backup_before_restore.sqlite`) sehingga pengguna dapat membatalkan proses jika salah mengunggah file.

---

### 5. Struktur Output PRD yang Harus Dihasilkan
Tuliskan dokumen PRD secara komprehensif dengan urutan bagian berikut:
1. **Executive Summary & User Persona**
2. **Information Architecture & Navigasi (Web vs Mobile PWA)**
3. **Functional Requirements Detail** (Mencakup sistem CRUD, Filter/Sort, Auto-Sum Harga Game PC, Filter Console/Emulator, Pelacak Versi Game Recomp, dan Quick-Checkbox Cinema)
4. **Database Schema (SQLite DDL Lengkap)**:
   * Sediakan perintah `CREATE TABLE` dan `CREATE INDEX` yang optimal untuk tabel `games` (mendukung tipe `PC`, `EMULATOR`, `RECOMP`), `cinema`, `music`, dan `app_settings`.
5. **Spesifikasi Teknis Import/Export & Parser Data** (Aturan konversi format Rupiah, penanganan nilai `-` dan `TBA`)
6. **Alur Kerja Teknis Backup & Restore SQLite** (Diagram alur teks & langkah pengamanan file)
7. **Rekomendasi Tech Stack Modern** (Mudah di-*deploy* secara *self-hosted* via Docker maupun dijalankan secara lokal di PC/NAS).