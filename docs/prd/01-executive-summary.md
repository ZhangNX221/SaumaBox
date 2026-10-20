# PRD 01 — Executive Summary & User Persona

> **Dokumen:** 01 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 1.1 Visi Produk

**SaumaBox** adalah aplikasi katalog media pribadi berbasis web yang dirancang untuk menjadi
*single source of truth* bagi seluruh koleksi digital pengguna — mencakup **Games**, **Cinema**,
dan **Music** — dalam satu antarmuka terpadu.

### Pernyataan Visi
> Menyediakan platform katalog media pribadi yang cepat, ringan, dan offline-first,
> memungkinkan siapa saja mencatat, mengelola, dan mengekspor seluruh koleksi
> digital mereka tanpa bergantung pada layanan cloud pihak ketiga.

### Tujuan Bisnis

| # | Tujuan | Metrik Keberhasilan | Target |
|---|--------|---------------------|--------|
| 1 | Menggantikan spreadsheet manual | Migrasi data Excel/CSV berhasil tanpa error | 100% kompatibilitas |
| 2 | Aksesibilitas lintas perangkat | Tampilan responsif web + PWA mobile | Score Lighthouse ≥ 90 |
| 3 | Self-hosted & privacy-first | Dapat di-deploy via Docker 1 command | < 5 menit setup |
| 4 | Kecepatan operasi CRUD | Response time untuk semua operasi | < 200ms (P95) |
| 5 | Zero data loss | Backup/restore berjalan konsisten | 0 insiden korupsi data |

### Masalah yang Diselesaikan

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MASALAH PENGGUNA SAAT INI                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐    ┌──────────────┐    ┌───────────────────┐    │
│  │  Spreadsheet  │    │  Tidak ada   │    │  Data terpisah    │    │
│  │  berantakan   │    │  backup      │    │  di banyak file   │    │
│  │  & lambat     │    │  otomatis    │    │  & format         │    │
│  └───────┬───────┘    └──────┬───────┘    └────────┬──────────┘    │
│          │                   │                      │               │
│          ▼                   ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    SOLUSI: SaumaBox                         │    │
│  │                                                             │    │
│  │  • 1 database SQLite terpusat                               │    │
│  │  • Import dari Excel/CSV/JSON                               │    │
│  │  • Backup 1-klik                                            │    │
│  │  • Akses dari desktop & mobile                              │    │
│  │  • Self-hosted (privasi penuh)                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1.2 Aksesibilitas Produk

### Cross-Platform Strategy

| Aspek | Desktop (Web) | Mobile (PWA) |
|-------|--------------|--------------|
| **Akses** | Browser modern (Chrome, Firefox, Edge, Safari) | Browser mobile + install ke home screen |
| **Tampilan Data** | Data Grid / tabel interaktif (spreadsheet-like) | Compact Card View / List View |
| **Navigasi** | Sidebar kiri + top bar | Bottom Navigation Bar |
| **Interaksi** | Mouse + keyboard shortcuts | Touch gestures + one-hand operation |
| **Offline** | Service Worker cache | Full PWA offline support |
| **Install** | Bookmark / PWA install prompt | Add to Home Screen |

### PWA Requirements

| Fitur PWA | Requirement | Prioritas |
|-----------|-------------|-----------|
| Service Worker | Cache-first strategy untuk asset statis | P0 |
| Web App Manifest | Nama, ikon, tema, orientasi | P0 |
| Offline Mode | Baca data cached, queue operasi tulis | P1 |
| Install Prompt | Banner install di mobile & desktop | P0 |
| Push Notification | Notifikasi update versi app | P2 |
| Background Sync | Sinkronisasi operasi yang di-queue | P2 |

---

## 1.3 User Persona

### Persona 1: Admin (Pemilik Katalog)

```
┌─────────────────────────────────────────────────────────┐
│                    PERSONA: ADMIN                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nama     : Rizky (28 tahun)                            │
│  Profesi  : Software Developer & Gamer                  │
│  Device   : PC Gaming + Smartphone Android              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Goals:                                         │    │
│  │  • Mencatat 500+ game (PC, emulator, recomp)    │    │
│  │  • Tracking total pengeluaran game              │    │
│  │  • Mengelola watchlist film & anime              │    │
│  │  • Backup data rutin                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Pain Points:                                   │    │
│  │  • Spreadsheet lambat untuk 1000+ baris         │    │
│  │  • Tidak ada filter cepat per platform/konsol   │    │
│  │  • Sulit akses dari HP                          │    │
│  │  • Takut data hilang tanpa backup               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Skenario Penggunaan:                           │    │
│  │  • Login ke admin panel                         │    │
│  │  • Import data Excel yang sudah ada             │    │
│  │  • CRUD katalog games, cinema, music            │    │
│  │  • Filter & sort data                           │    │
│  │  • Export laporan                               │    │
│  │  • Backup database                              │    │
│  │  • Mengelola pengaturan aplikasi                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Persona 2: Viewer / Publik (Opsional — Read-Only)

```
┌─────────────────────────────────────────────────────────┐
│                  PERSONA: VIEWER                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nama     : Teman / Keluarga Rizky                      │
│  Akses    : Link publik tanpa login                     │
│  Device   : Smartphone / Laptop                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Goals:                                         │    │
│  │  • Melihat koleksi game/film Rizky              │    │
│  │  • Mencari rekomendasi dari katalog             │    │
│  │  • Browse tanpa perlu registrasi                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Akses Terbatas:                                │    │
│  │  • Read-only (tidak bisa edit/hapus)            │    │
│  │  • Filter & search data                         │    │
│  │  • Tidak bisa import/export                     │    │
│  │  • Tidak bisa backup/restore                    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 1.4 Role & Permission Matrix

| Fitur | Admin | Viewer (Publik) |
|-------|-------|-----------------|
| Login / Logout | ✅ | ❌ (tanpa login) |
| Lihat katalog games | ✅ | ✅ (jika public sharing aktif) |
| Lihat katalog cinema | ✅ | ✅ (jika public sharing aktif) |
| Lihat katalog music | ✅ | ✅ (jika public sharing aktif) |
| Filter & Search | ✅ | ✅ |
| Sort data | ✅ | ✅ |
| Tambah data (Create) | ✅ | ❌ |
| Edit data (Update) | ✅ | ❌ |
| Hapus data (Delete) | ✅ | ❌ |
| Import data | ✅ | ❌ |
| Export data | ✅ | ❌ |
| Backup database | ✅ | ❌ |
| Restore database | ✅ | ❌ |
| Pengaturan aplikasi | ✅ | ❌ |
| Kelola user/password | ✅ | ❌ |
| Toggle public sharing | ✅ | ❌ |

---

## 1.5 User Journey Map

### Journey 1: First-Time Setup (Admin)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Install │    │  Buka    │    │  Setup   │    │  Import  │    │  Mulai   │
│  via     │───▶│  Browser │───▶│  Admin   │───▶│  Data    │───▶│  Pakai   │
│  Docker  │    │  / PWA   │    │  Account │    │  Excel   │    │  Katalog │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
  5 menit        10 detik         1 menit         2 menit         ∞
```

### Journey 2: Daily Usage (Admin)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Buka    │    │  Login   │    │  CRUD    │    │  Logout  │
│  App     │───▶│  (jika   │───▶│  Data    │───▶│  /       │
│  (PWA)   │    │  expired)│    │  Katalog │    │  Close   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Journey 3: Public Viewer

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Terima  │    │  Browse  │    │  Cari &  │
│  Link    │───▶│  Katalog │───▶│  Filter  │
│  Publik  │    │  (Read)  │    │  Data    │
└──────────┘    └──────────┘    └──────────┘
```

---

## 1.6 Scope & Out of Scope

### In Scope (v1.0)

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Modul Katalog Games (PC, Emulator, Recomp) | P0 |
| 2 | Modul Katalog Cinema (Movie, Series, Anime) | P0 |
| 3 | Modul Katalog Music | P0 |
| 4 | Sistem Login/Auth untuk Admin | P0 |
| 5 | Halaman publik read-only | P1 |
| 6 | CRUD operasi lengkap | P0 |
| 7 | Filter, Sort, Search | P0 |
| 8 | Import Excel/CSV/JSON | P0 |
| 9 | Export Excel/CSV/JSON | P0 |
| 10 | Backup/Restore database | P0 |
| 11 | Responsive design (Desktop + Mobile) | P0 |
| 12 | PWA support | P1 |
| 13 | Auto-Sum harga game PC | P1 |
| 14 | Dashboard statistik admin | P1 |

### Out of Scope (v1.0)

| # | Fitur | Alasan | Rencana |
|---|-------|--------|---------|
| 1 | Multi-user collaboration | Scope terlalu besar | v2.0 |
| 2 | API integrasi IGDB/TMDB/Spotify | Butuh koneksi internet | v2.0 |
| 3 | Social features (share, comment) | Bukan prioritas | v3.0 |
| 4 | Native mobile app (iOS/Android) | PWA sudah cukup | Evaluasi |
| 5 | Real-time sync multi-device | Butuh server sync | v2.0 |
| 6 | AI recommendation engine | Kompleksitas tinggi | v3.0 |

---

## 1.7 Asumsi & Risiko

### Asumsi

| # | Asumsi |
|---|--------|
| 1 | Pengguna memiliki data katalog dalam format Excel/CSV yang siap diimport |
| 2 | Aplikasi di-deploy pada infrastruktur yang sudah ada (PC/NAS/VPS) |
| 3 | Pengguna memahami cara menggunakan Docker atau menjalankan binary |
| 4 | Browser target mendukung Service Worker dan IndexedDB |
| 5 | SQLite cukup untuk single-user / low-concurrency use case |

### Risiko

| # | Risiko | Dampak | Mitigasi |
|---|--------|--------|----------|
| 1 | Data Excel memiliki format tidak konsisten | Import gagal | Smart Column Mapping + validasi |
| 2 | SQLite lock pada concurrent write | Data korupsi | WAL mode + queue write operations |
| 3 | PWA cache stale | User melihat data lama | Cache versioning + update prompt |
| 4 | File backup besar (>100MB) | Download lambat | Kompresi ZIP + progress bar |
| 5 | Browser lama tidak support PWA | Fitur tidak tersedia | Graceful degradation |

---

## 1.8 Success Metrics (KPI)

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| Setup Time | < 5 menit | Waktu dari `docker run` sampai login pertama |
| Import Success Rate | ≥ 98% | Jumlah baris berhasil / total baris |
| Page Load Time | < 2 detik | Lighthouse Performance Score |
| CRUD Response Time | < 200ms (P95) | Backend response time monitoring |
| Backup/Restore Success | 100% | Integrity check pass rate |
| PWA Install Rate | Tampil di semua browser modern | Manifest + SW audit |
| Data Grid Render | < 500ms untuk 5000 baris | Client-side profiling |

---

## 1.9 Analisis Komparatif Solusi Produk

Untuk memastikan SaumaBox menawarkan *value proposition* yang unik bagi kolektor digital, berikut perbandingan mendalam dengan solusi alternatif yang umum digunakan:

| Kriteria Evaluasi | Excel / Google Sheets | Notion / Airtable | Trakt / Backloggd | SaumaBox (Target v1.0) |
|-------------------|----------------------|-------------------|-------------------|------------------------|
| **Kepemilikan Data** | 100% Lokal/Cloud User | Bergantung Cloud Vendor | Data tersimpan di server pihak ketiga | 100% Self-Hosted & SQLite File |
| **Kategori Multi-Media** | Manual diatur per sheet | Bisa relasi tabel tapi lambat | Terpisah (satu platform satu media) | Terpadu (Games, Cinema, Music) |
| **Performa Data > 3000 Baris**| Lambat & lag pada mobile | Loading berat & lag seluler | Terbatas pada pagination web | Super cepat via SQLite WAL & Grid |
| **Parsing Format Khusus** | Rumus spreadsheet rumit | Formula rumit | Tidak fleksibel untuk field custom | Smart parser otomatis (TBA, strip, Rp) |
| **Dukungan Emulator & Port** | Manual text | Text biasa tanpa metadata spesifik | Sangat minim / tidak ada | First-class metadata (ROM, Base, Port) |
| **Aksesibilitas Mobile** | Canggung di layar kecil | Lambat dibuka di smartphone | Aplikasi mobile / web terpisah | PWA offline-first dengan Bottom Nav |
| **Biaya Langganan** | Gratis / Berlangganan | Batasan blok gratis ($10+/bln) | Berlangganan fitur pro | 100% Open-Source / Self-Hosted Gratis |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       POSISI NILAI PRODUK SAUMABOX                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tinggi ▲                                                                   │
│         │                                                                   │
│         │                                  ┌──────────────────────────┐     │
│         │                                  │   🎮 SaumaBox            │     │
│         │                                  │   (All-in-One, PWA,      │     │
│         │                                  │    SQLite Self-Hosted)   │     │
│         │                                  └──────────────────────────┘     │
│  FOKUS  │                                                                   │
│  MEDIA  │       ┌──────────────────────┐                                    │
│  KOLEKSI│       │ Trakt / Backloggd    │                                    │
│  PRIBADI│       │ (Terpisah per media) │                                    │
│         │       └──────────────────────┘                                    │
│         │                                                                   │
│         │   ┌────────────────────┐         ┌──────────────────────────┐     │
│         │   │ Spreadsheet        │         │ Notion / Airtable        │     │
│         │   │ (Manual & Rentan)  │         │ (Kompleks & Berlangganan)│     │
│         │   └────────────────────┘         └──────────────────────────┘     │
│  Rendah ▼                                                                   │
│         └───────────────────────────────────────────────────────────────▶   │
│           Rendah                 KEMUDAHAN & OTOMASI                   Tinggi │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.10 Prinsip Desain UI/UX & Standar Aksesibilitas

Untuk menjamin pengalaman pengguna setara aplikasi enterprise modern, implementasi antarmuka SaumaBox wajib mematuhi standar desain berikut:

### 1.10.1 Prinsip Desain Utama

1. **Information Density with Clarity:**
   * Tampilan desktop memprioritaskan kerapatan data tinggi (*high density*) agar pengguna dapat meninjau puluhan baris item secara simultan.
   * Tetap menyematkan pembeda visual instan seperti warna *badge* platform (Steam: Biru, GOG: Oranye, Repack: Kuning) untuk meminimalkan kelelahan visual (*cognitive load*).

2. **One-Hand Mobile Thumb Zone:**
   * Pada perangkat seluler, seluruh tombol navigasi krusial dan aksi utama (*Quick Checkbox*, filter pop-up, tombol pencarian) diletakkan di area bawah (*thumb zone*) layar.
   * Jarak ketuk minimal (*touch target size*) adalah 48 × 48 piksel untuk menghindari salah sentuh pada form atau tabel.

3. **Zero-Latency Feedback:**
   * Setiap penekanan tombol (*like*, *checkbox* tontonan, perubahan filter, atau penambahan data) harus langsung memberikan feedback visual (*instant optimistic UI update*) tanpa menunggu round-trip backend.
   * Rollback otomatis dengan notifikasi toast informatif jika operasi database SQLite di latar belakang mengalami kegagalan.

### 1.10.2 Standar Kepatuhan Aksesibilitas (WCAG 2.1 Level AA)

| Aspek Aksesibilitas | Ketentuan Teknis | Implementasi SaumaBox |
|---------------------|------------------|------------------------|
| **Rasio Kontras Warna** | Minimal 4.5:1 untuk teks normal, 3:1 untuk teks tebal/komponen | Dark mode & Light mode lolos audit kontras WebAIM |
| **Navigasi Keyboard** | Seluruh tombol, input, dan grid dapat dijangkau via Tab/Arrow | Focus ring terlihat tegas, shortcut keyboard global |
| **Screen Reader Friendly**| Atribut `aria-label`, `role="table"`, `aria-checked` lengkap | Elemen interaktif memiliki label semantik yang jelas |
| **Motion & Transition** | Dukungan media query `@media (prefers-reduced-motion)` | Nonaktifkan animasi transisi jika opsi sistem aktif |

---

## 1.11 Release Milestones & Phase Transition Gate

Proses rilis SaumaBox dibagi ke dalam empat fase terstruktur dengan kriteria penerimaan (*acceptance criteria*) yang terdefinisi ketat:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Phase 1     │     │  Phase 2     │     │  Phase 3     │     │  Phase 4     │
│  MVP Core    │────▶│  PWA & Mobile│────▶│  Import/Save │────▶│  v1.0 Launch │
│  (Sprint 1)  │     │  (Sprint 2)  │     │  (Sprint 3)  │     │  (Sprint 4)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
 • SQLite WAL        • PWA Manifest       • Smart Mapping      • Dockerfile &
 • CRUD Games        • Bottom Bar         • Auto-clean TBA     • Backup 1-Klik
 • Table Grid        • Touch targets      • SQLite Restore     • User Docs
```

| Fase | Target Deliverable | Exit Criteria |
|------|--------------------|---------------|
| **Phase 1: Core Engine** | Backend SQLite WAL, schema DDL, REST API dasar, dan web table grid | Pengujian unit lulus 100%, operasi CRUD latency < 50ms |
| **Phase 2: Responsive & PWA** | Desain responsif desktop/mobile, PWA installable, card view | Skor PWA Lighthouse ≥ 90, tata letak mobile thumb-friendly |
| **Phase 3: Migration Suite** | Parser XLSX/CSV/JSON, smart column mapping, auto-cleaning | Uji import 10.000 baris data beragam format tanpa crash |
---

## 1.12 Tata Kelola Dokumen & Persetujuan Stakeholder

Dokumen PRD ini ditinjau dan disetujui secara berkala oleh seluruh peran kunci proyek sebelum memasuki tahap pengembangan:

| Peran | Nama / Inisial | Tanggung Jawab Utama | Status Persetujuan |
|-------|----------------|----------------------|--------------------|
| **Product Owner** | R. S. | Prioritas fitur, roadmap, dan cakupan fungsional | Disetujui (v1.0.0) |
| **System Architect** | T. M. | Desain skema SQLite WAL, REST API, dan PWA caching | Disetujui (v1.0.0) |
| **UI/UX Designer** | A. K. | Wireframe, ergonomi mobile, dan standar aksesibilitas | Disetujui (v1.0.0) |
| **QA Lead** | D. W. | Validasi skenario import/export, edge cases, dan backup test | Disetujui (v1.0.0) |

### Mekanisme Perubahan Spesifikasi (RFC / Change Request)

Setiap modifikasi terhadap dokumen PRD ini setelah status disetujui wajib melalui proses:
1. Pembuatan tiket perubahan spesifikasi (*Request for Comments*).
2. Tinjauan dampak terhadap model data SQLite (tabel `games`, `cinema`, `music`) dan parser import.
3. Pembaruan nomor versi dokumen (*semantic versioning*: Patch untuk revisi teks, Minor untuk penambahan kolom, Major untuk perombakan arsitektur).

---

*Lanjut ke → [02-information-architecture.md](./02-information-architecture.md)*
