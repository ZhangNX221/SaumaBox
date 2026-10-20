# PRD 03 — Halaman Publik & Halaman Login

> **Dokumen:** 03 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0 (Login), P1 (Publik)

---

## 3.1 Halaman Landing / Publik

### Deskripsi

Halaman publik adalah halaman yang dapat diakses tanpa login. Halaman ini berfungsi sebagai:
- **Landing page** saat pertama kali membuka URL aplikasi
- **Katalog read-only** untuk viewer yang diberi akses oleh admin
- **Showcase** koleksi media yang di-share secara publik

### Konfigurasi Public Sharing

Admin dapat mengatur mana modul yang bisa diakses publik melalui Settings:

| Setting | Tipe | Default | Keterangan |
|---------|------|---------|------------|
| `public_sharing_enabled` | Boolean | `false` | Master switch publik |
| `public_games_enabled` | Boolean | `false` | Katalog games publik |
| `public_cinema_enabled` | Boolean | `false` | Katalog cinema publik |
| `public_music_enabled` | Boolean | `false` | Katalog music publik |
| `public_show_prices` | Boolean | `false` | Tampilkan harga game |
| `public_show_ratings` | Boolean | `true` | Tampilkan rating |

---

### 3.1.1 Wireframe — Landing Page (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌── Navbar ───────────────────────────────────────────────────────┐    │
│  │  🎮 SaumaBox          Games  Cinema  Music        [ Login ]    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌── Hero Section ─────────────────────────────────────────────────┐    │
│  │                    ┌─────────────────────────┐                   │    │
│  │                    │   🎮 🎬 🎵              │                   │    │
│  │                    │   Personal Media        │                   │    │
│  │                    │   Catalog               │                   │    │
│  │                    │   Koleksi Games, Film   │                   │    │
│  │                    │   & Musik terpadu.      │                   │    │
│  │                    │  [🔍 Jelajahi Katalog]  │                   │    │
│  │                    └─────────────────────────┘                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│  ┌── Stats Bar ────────────────────────────────────────────────────┐    │
│  │    🎮 500+ Games      🎬 300+ Films       🎵 1000+ Tracks      │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│  ┌── Module Cards ─────────────────────────────────────────────────┐    │
│  │  ┌─── Games ────┐  ┌─── Cinema ───┐  ┌─── Music ────┐          │    │
│  │  │  🎮           │  │  🎬          │  │  🎵           │          │    │
│  │  │  Katalog      │  │  Katalog     │  │  Katalog      │          │    │
│  │  │  PC/Emu/Port │  │  Film/Series │  │  Album/Track │          │    │
│  │  │  [Lihat →]    │  │  [Lihat →]   │  │  [Lihat →]    │          │    │
│  │  └───────────────┘  └──────────────┘  └───────────────┘          │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│  ┌── Footer ──────────────────────────────────────────────────────┐     │
│  │  SaumaBox v1.0.0 • Self-Hosted Media Catalog • 2026           │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1.2 Wireframe — Landing Page (Mobile)

```
┌─────────────────────────────┐
│  ┌── Top Bar ─────────────┐ │
│  │  🎮 SaumaBox    [ ☰ ]  │ │
│  └────────────────────────┘ │
│  ┌── Hero ────────────────┐ │
│  │  🎮 🎬 🎵              │ │
│  │  Personal Media        │ │
│  │  Catalog Terpadu       │ │
│  │  [🔍 Jelajahi Katalog] │ │
│  └────────────────────────┘ │
│  ┌── Stats ───────────────┐ │
│  │  🎮 500+  🎬 300+      │ │
│  │  🎵 1000+ Tracks       │ │
│  └────────────────────────┘ │
│  ┌── Card: Games ─────────┐ │
│  │  🎮 PC, Emulator, Port │ │
│  │  [Lihat Katalog →]     │ │
│  └────────────────────────┘ │
│  ┌── Card: Cinema ────────┐ │
│  │  🎬 Movie, Series, Anime││
│  │  [Lihat Katalog →]     │ │
│  └────────────────────────┘ │
│  ┌── Card: Music ─────────┐ │
│  │  🎵 Track, Album, FLAC │ │
│  │  [Lihat Katalog →]     │ │
│  └────────────────────────┘ │
│  ┌── Footer ──────────────┐ │
│  │  SaumaBox v1.0.0       │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

---

### 3.1.3 Wireframe — Katalog Publik (Read-Only View Desktop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌── Navbar ───────────────────────────────────────────────────────┐    │
│  │  🎮 SaumaBox          Games  Cinema  Music        [ Login ]    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌── Breadcrumb ──────────────────────────────────────────────────┐    │
│  │  Katalog > Games                                               │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌── Tab Bar ─────────────────────────────────────────────────────┐    │
│  │  All │ PC Games │ Emulator │ Recomp                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌── Filter Bar (Read-Only) ──────────────────────────────────────┐    │
│  │  🔍 Cari game...   Platform [ Semua ▼ ]  Status [ Semua ▼ ]   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌── Data Table (Read-Only — No Edit/Delete Buttons) ────────────┐    │
│  │ # │ Judul        │ Year │ Publisher  │ Platform  │ Rating      │    │
│  │───┼──────────────┼──────┼───────────┼───────────┼─────────────│    │
│  │ 1 │ Far Cry 6    │ 2021 │ Ubisoft   │ 🔵 Steam  │ ⭐ 8.5      │    │
│  │ 2 │ Elden Ring   │ 2022 │ Bandai N. │ 🔵 Steam  │ ⭐ 9.5      │    │
│  │ 3 │ Cyberpunk    │ 2020 │ CDPR      │ 🟠 GOG    │ ⭐ 8.0      │    │
│  │ 4 │ Stardew V.   │ 2016 │ Concern.  │ 🔵 Steam  │ ⭐ 9.0      │    │
│  │ 5 │ Hollow Kn.   │ 2017 │ Team Ch.  │ 🔵 Steam  │ ⭐ 9.2      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌── Pagination ──────────────────────────────────────────────────┐    │
│  │  ◀  1  2  3  ...  10  ▶     Menampilkan 1-20 dari 500         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Perbedaan Tampilan Publik vs Admin

| Elemen | Publik | Admin |
|--------|--------|-------|
| Tombol [+ Tambah] | ❌ Hidden | ✅ Visible |
| Tombol Edit/Delete per baris | ❌ Hidden | ✅ Visible |
| Tombol [📥 Import] | ❌ Hidden | ✅ Visible |
| Tombol [📤 Export] | ❌ Hidden | ✅ Visible |
| Filter & Search | ✅ Available | ✅ Available |
| Sort kolom | ✅ Available | ✅ Available |
| Kolom Harga | ⚙️ Tergantung setting | ✅ Visible |
| Inline edit | ❌ Disabled | ✅ Enabled |
| Sidebar menu lengkap | ❌ Hidden | ✅ Visible |
| Auto-Sum footer | ⚙️ Tergantung setting | ✅ Visible |

---

## 3.2 Halaman Login

### Deskripsi

Halaman login adalah pintu masuk ke panel admin. Hanya admin yang memiliki kredensial
yang dapat mengakses fitur CRUD, import/export, dan backup/restore.

### Spesifikasi Login

| Aspek | Detail |
|-------|--------|
| **URL** | `/login` |
| **Method** | POST `/api/auth/login` |
| **Fields** | Username + Password |
| **Autentikasi** | Session-based (cookie) atau JWT token |
| **Session Duration** | 7 hari (configurable) |
| **Remember Me** | Checkbox opsional (extend session ke 30 hari) |
| **Rate Limiting** | Max 5 percobaan gagal → lockout 15 menit |
| **Password Hash** | bcrypt (cost factor 12) |
| **CSRF Protection** | Token per session |

---

### 3.2.1 Wireframe — Halaman Login (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ┌── Login Card ──────────────────┐                   │
│                    │        🎮 SaumaBox             │                   │
│                    │   Masuk ke Admin Panel         │                   │
│                    │   ─────────────────────────    │                   │
│                    │   Username                     │                   │
│                    │   ┌───────────────────────┐    │                   │
│                    │   │ 👤 admin              │    │                   │
│                    │   └───────────────────────┘    │                   │
│                    │   Password                     │                   │
│                    │   ┌───────────────────────┐    │                   │
│                    │   │ 🔒 ••••••••       👁  │    │                   │
│                    │   └───────────────────────┘    │                   │
│                    │   ☐ Ingat saya (30 hari)       │                   │
│                    │   ┌───────────────────────┐    │                   │
│                    │   │     [ 🔐 Masuk ]      │    │                   │
│                    │   └───────────────────────┘    │                   │
│                    │   Lupa password? Hubungi admin │                   │
│                    └────────────────────────────────┘                   │
│  ┌── Footer ──────────────────────────────────────────────────────┐     │
│  │  SaumaBox v1.0.0 • Self-Hosted Media Catalog                  │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2.2 Wireframe — Halaman Login (Mobile)

```
┌─────────────────────────────┐
│  ┌── Status Bar ──────────┐ │
│  │  9:41          📶 🔋   │ │
│  └────────────────────────┘ │
│       🎮 SaumaBox           │
│    Masuk ke Admin Panel     │
│    ────────────────────     │
│    Username                 │
│    ┌──────────────────┐     │
│    │ 👤 admin          │     │
│    └──────────────────┘     │
│    Password                 │
│    ┌──────────────────┐     │
│    │ 🔒 ••••••    👁  │     │
│    └──────────────────┘     │
│    ☐ Ingat saya             │
│    ┌──────────────────┐     │
│    │   [ 🔐 Masuk ]   │     │
│    └──────────────────┘     │
│    Lupa password? Hubungi   │
│  ┌── Footer ──────────────┐ │
│  │  SaumaBox v1.0.0       │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

---

### 3.2.3 Login Flow Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │     │  Halaman     │     │  Backend     │
│  Browser │     │  Login       │     │  API         │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘
     │                   │                     │
     │  Buka /login      │                     │
     │──────────────────▶│                     │
     │                   │                     │
     │  Render form      │                     │
     │◀──────────────────│                     │
     │                   │                     │
     │  Isi username     │                     │
     │  + password       │                     │
     │──────────────────▶│                     │
     │                   │                     │
     │                   │  POST /api/auth/    │
     │                   │  login              │
     │                   │────────────────────▶│
     │                   │                     │
     │                   │     ┌───────────────┤
     │                   │     │ Validasi:     │
     │                   │     │ 1. Username   │
     │                   │     │ 2. Password   │
     │                   │     │    (bcrypt)   │
     │                   │     │ 3. Rate limit │
     │                   │     └───────────────┤
     │                   │                     │
     │                   │  ┌── IF Valid ──┐   │
     │                   │  │              │   │
     │                   │◀─┤ Set cookie/  │───│
     │                   │  │ JWT token    │   │
     │                   │  └──────────────┘   │
     │                   │                     │
     │  Redirect to      │                     │
     │  /admin/dashboard │                     │
     │◀──────────────────│                     │
     │                   │                     │
     │                   │  ┌── IF Invalid ┐   │
     │                   │  │              │   │
     │                   │◀─┤ Error msg    │───│
     │                   │  │ + attempt++  │   │
     │                   │  └──────────────┘   │
     │                   │                     │
     │  Show error toast │                     │
     │◀──────────────────│                     │
     │                   │                     │
```

---

### 3.2.4 Validasi & Error Handling Login

| Skenario | Pesan Error | Aksi Sistem |
|----------|-------------|-------------|
| Username kosong | "Username wajib diisi" | Focus ke field username |
| Password kosong | "Password wajib diisi" | Focus ke field password |
| Username tidak ditemukan | "Username atau password salah" | Increment attempt counter |
| Password salah | "Username atau password salah" | Increment attempt counter |
| Akun terkunci (5x gagal) | "Akun terkunci. Coba lagi dalam 15 menit" | Tampilkan countdown |
| Session expired | "Sesi Anda telah berakhir. Silakan login kembali" | Redirect ke /login |

> **Security Note:** Pesan error untuk username tidak ditemukan dan password salah
> harus **identik** untuk mencegah username enumeration attack.

---

## 3.3 Setup Awal (First-Time Setup)

### Deskripsi

Saat aplikasi pertama kali dijalankan dan belum ada akun admin, sistem menampilkan
halaman setup awal untuk membuat akun admin pertama.

### 3.3.1 Wireframe — First-Time Setup

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                    ┌── Setup Card ─────────────────────┐                │
│                    │                                    │                │
│                    │        🎮 SaumaBox                 │                │
│                    │        Setup Awal                  │                │
│                    │                                    │                │
│                    │   ─────────────────────────────    │                │
│                    │                                    │                │
│                    │   Selamat datang! Buat akun        │                │
│                    │   admin untuk memulai.             │                │
│                    │                                    │                │
│                    │   Step 1 of 2: Akun Admin          │                │
│                    │   ● ─────── ○                      │                │
│                    │                                    │                │
│                    │   Username                         │                │
│                    │   ┌──────────────────────────┐     │                │
│                    │   │ admin                     │     │                │
│                    │   └──────────────────────────┘     │                │
│                    │                                    │                │
│                    │   Password                         │                │
│                    │   ┌──────────────────────────┐     │                │
│                    │   │ ••••••••             👁  │     │                │
│                    │   └──────────────────────────┘     │                │
│                    │   Min. 8 karakter, huruf + angka   │                │
│                    │                                    │                │
│                    │   Konfirmasi Password              │                │
│                    │   ┌──────────────────────────┐     │                │
│                    │   │ ••••••••             👁  │     │                │
│                    │   └──────────────────────────┘     │                │
│                    │                                    │                │
│                    │   ┌──────────────────────────┐     │                │
│                    │   │     [ Lanjut →  ]        │     │                │
│                    │   └──────────────────────────┘     │                │
│                    │                                    │                │
│                    └────────────────────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3.2 Wireframe — Setup Step 2 (Pengaturan Awal)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    ┌── Setup Card ─────────────────────┐                │
│                    │                                    │                │
│                    │        🎮 SaumaBox                 │                │
│                    │        Setup Awal                  │                │
│                    │                                    │                │
│                    │   ─────────────────────────────    │                │
│                    │                                    │                │
│                    │   Step 2 of 2: Pengaturan          │                │
│                    │   ○ ─────── ●                      │                │
│                    │                                    │                │
│                    │   Nama Katalog                     │                │
│                    │   ┌──────────────────────────┐     │                │
│                    │   │ My Media Catalog          │     │                │
│                    │   └──────────────────────────┘     │                │
│                    │                                    │                │
│                    │   Aktifkan Public Sharing?         │                │
│                    │   (  ) Ya, izinkan akses publik    │                │
│                    │   (●) Tidak, hanya admin           │                │
│                    │                                    │                │
│                    │   Import data awal?                │                │
│                    │   ☐ Saya punya file Excel/CSV      │                │
│                    │     untuk diimport nanti           │                │
│                    │                                    │                │
│                    │   ┌──────────────────────────┐     │                │
│                    │   │  [ ← Kembali ]           │     │                │
│                    │   │  [ 🚀 Mulai Gunakan ]    │     │                │
│                    │   └──────────────────────────┘     │                │
│                    │                                    │                │
│                    └────────────────────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3.4 Halaman Logout

### Spesifikasi

| Aspek | Detail |
|-------|--------|
| **Trigger** | Klik menu "Logout" di dropdown user |
| **Endpoint** | POST `/api/auth/logout` |
| **Aksi** | Hapus session/token, clear cookie |
| **Redirect** | Ke halaman `/login` |
| **Konfirmasi** | Toast: "Anda telah keluar" |

### Flow Logout

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │     │  Frontend    │     │  Backend     │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘
     │                   │                     │
     │  Klik Logout      │                     │
     │──────────────────▶│                     │
     │                   │                     │
     │                   │  POST /api/auth/    │
     │                   │  logout             │
     │                   │────────────────────▶│
     │                   │                     │
     │                   │  Clear session      │
     │                   │◀────────────────────│
     │                   │                     │
     │  Clear local      │                     │
     │  storage/cookie   │                     │
     │◀──────────────────│                     │
     │                   │                     │
     │  Redirect /login  │                     │
     │  + Success toast  │                     │
     │◀──────────────────│                     │
     │                   │                     │
```

---

## 3.5 Middleware & Route Protection

### Route Classification

| Route Pattern | Tipe | Auth Required | Redirect If Not Auth |
|---------------|------|---------------|---------------------|
| `/` | Publik | ❌ | — |
| `/login` | Publik | ❌ | Redirect ke `/admin/dashboard` jika sudah login |
| `/catalog/*` | Publik | ❌ | — (tapi cek `public_sharing_enabled`) |
| `/admin/*` | Protected | ✅ | Redirect ke `/login` |
| `/api/auth/*` | API | ❌ | — |
| `/api/admin/*` | Protected API | ✅ | Return 401 Unauthorized |
| `/api/public/*` | Public API | ❌ | — (tapi cek setting) |
| `/setup` | Publik | ❌ | Redirect ke `/login` jika sudah ada admin |

### Middleware Flow

```
Request masuk
    │
    ▼
┌──────────────────┐
│ Cek route type   │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Public    Protected
    │         │
    ▼         ▼
 Lanjut   ┌──────────────┐
          │ Ada session/ │
          │ token valid? │
          └──────┬───────┘
                 │
            ┌────┴────┐
            ▼         ▼
          Valid     Invalid
            │         │
            ▼         ▼
         Lanjut    Redirect
                   /login
```

---

*← Kembali ke [02-information-architecture.md](./02-information-architecture.md)  
Lanjut ke → [04-halaman-admin-dashboard.md](./04-halaman-admin-dashboard.md)*
