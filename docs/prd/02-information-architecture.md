# PRD 02 — Information Architecture & Navigasi

> **Dokumen:** 02 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 2.1 Sitemap Aplikasi

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SITEMAP: SaumaBox                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  /                          Landing Page (Publik)                       │
│  ├── /login                 Halaman Login Admin                         │
│  ├── /catalog               Katalog Publik (read-only)                  │
│  │   ├── /catalog/games     Katalog Games Publik                        │
│  │   ├── /catalog/cinema    Katalog Cinema Publik                       │
│  │   └── /catalog/music     Katalog Music Publik                        │
│  │                                                                      │
│  └── /admin                 Panel Admin (auth required)                  │
│      ├── /admin/dashboard   Dashboard Statistik                         │
│      ├── /admin/games       Manajemen Katalog Games                     │
│      │   ├── ?tab=all       Semua Games                                 │
│      │   ├── ?tab=pc        PC Games                                    │
│      │   ├── ?tab=emulator  Emulator Games                              │
│      │   └── ?tab=recomp    Recomp / Unofficial Port                    │
│      ├── /admin/cinema      Manajemen Katalog Cinema                    │
│      │   ├── ?tab=all       Semua Cinema                                │
│      │   ├── ?tab=movie     Movies                                      │
│      │   ├── ?tab=series    Series                                      │
│      │   └── ?tab=anime     Anime                                       │
│      ├── /admin/music       Manajemen Katalog Music                     │
│      ├── /admin/import      Import Data                                 │
│      ├── /admin/export      Export Data                                  │
│      └── /admin/settings    Pengaturan                                   │
│          ├── ?tab=general   Pengaturan Umum                              │
│          ├── ?tab=account   Akun & Password                              │
│          ├── ?tab=backup    Backup & Restore                             │
│          └── ?tab=public    Public Sharing                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2.2 Navigasi Desktop (Web)

### Wireframe — Layout Desktop Utama

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─── Top Bar ─────────────────────────────────────────────────────────┐   │
│  │  🎮 SaumaBox            🔍 Search...                  👤 Admin  ▼  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌── Sidebar ──┐  ┌── Main Content ────────────────────────────────────┐   │
│  │             │  │                                                    │   │
│  │  📊 Dash   │  │  ┌── Breadcrumb ──────────────────────────────┐    │   │
│  │  ─────────  │  │  │  Admin > Games > PC Games                 │    │   │
│  │  🎮 Games  │  │  └────────────────────────────────────────────┘    │   │
│  │  🎬 Cinema │  │                                                    │   │
│  │  🎵 Music  │  │  ┌── Tab Bar ─────────────────────────────────┐    │   │
│  │  ─────────  │  │  │  All │ PC │ Emulator │ Recomp             │    │   │
│  │  📥 Import │  │  └────────────────────────────────────────────┘    │   │
│  │  📤 Export │  │                                                    │   │
│  │  ─────────  │  │  ┌── Toolbar ────────────────────────────────┐    │   │
│  │  ⚙ Setting │  │  │  [+ Tambah] [📥 Import] 🔍 Filter...     │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Data Grid (Tabel) ──────────────────────┐    │   │
│  │             │  │  │ # │ Judul      │ Year │ Platform │ Status │    │   │
│  │             │  │  │───┼────────────┼──────┼──────────┼────────│    │   │
│  │             │  │  │ 1 │ Far Cry 6  │ 2021 │ 🔵Steam  │ 🟢Buy │    │   │
│  │             │  │  │ 2 │ Elden Ring │ 2022 │ 🔵Steam  │ 🟢Buy │    │   │
│  │             │  │  │ 3 │ Cyberpunk  │ 2020 │ 🟠GOG    │ 🟢Buy │    │   │
│  │             │  │  │...│ ...        │ ...  │ ...      │ ...    │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Footer / Pagination ────────────────────┐    │   │
│  │             │  │  │  ◀ 1 2 3 ... 10 ▶  │ Total: 500 items    │    │   │
│  │             │  │  │  Auto-Sum: Rp 12.500.000                  │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  └─────────────┘  └────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Spesifikasi Sidebar Desktop

| Item Menu | Ikon | Route | Sub-menu |
|-----------|------|-------|----------|
| Dashboard | 📊 | `/admin/dashboard` | — |
| Games | 🎮 | `/admin/games` | All, PC, Emulator, Recomp (tab) |
| Cinema | 🎬 | `/admin/cinema` | All, Movie, Series, Anime (tab) |
| Music | 🎵 | `/admin/music` | — |
| Import | 📥 | `/admin/import` | — |
| Export | 📤 | `/admin/export` | — |
| Settings | ⚙️ | `/admin/settings` | General, Account, Backup, Public |

### Spesifikasi Top Bar Desktop

| Elemen | Posisi | Fungsi |
|--------|--------|--------|
| Logo + Nama App | Kiri | Branding, klik → dashboard |
| Global Search | Tengah | Pencarian lintas modul |
| User Menu | Kanan | Dropdown: Profile, Settings, Logout |

---

## 2.3 Navigasi Mobile (PWA)

### Wireframe — Layout Mobile Utama

```
┌─────────────────────────────┐
│  ┌── Status Bar ──────────┐ │
│  │  9:41          📶 🔋   │ │
│  └────────────────────────┘ │
│                              │
│  ┌── Top Bar ─────────────┐ │
│  │  ☰  SaumaBox     🔍   │ │
│  └────────────────────────┘ │
│                              │
│  ┌── Tab Bar ─────────────┐ │
│  │  All │ PC │ Emu │ Rec  │ │
│  └────────────────────────┘ │
│                              │
│  ┌── Card List ───────────┐ │
│  │                         │ │
│  │  ┌── Card ───────────┐ │ │
│  │  │  🎮 Far Cry 6     │ │ │
│  │  │  2021 │ Ubisoft   │ │ │
│  │  │  🔵 Steam  🟢 Buy │ │ │
│  │  │  ⭐ 8.5   45.2 GB │ │ │
│  │  └───────────────────┘ │ │
│  │                         │ │
│  │  ┌── Card ───────────┐ │ │
│  │  │  🎮 Elden Ring    │ │ │
│  │  │  2022 │ FromSoft  │ │ │
│  │  │  🔵 Steam  🟢 Buy │ │ │
│  │  │  ⭐ 9.5   49.0 GB │ │ │
│  │  └───────────────────┘ │ │
│  │                         │ │
│  │  ┌── Card ───────────┐ │ │
│  │  │  🎮 Cyberpunk     │ │ │
│  │  │  2020 │ CDPR      │ │ │
│  │  │  🟠 GOG   🟢 Buy  │ │ │
│  │  │  ⭐ 8.0   70.0 GB │ │ │
│  │  └───────────────────┘ │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── FAB ─────────────────┐ │
│  │                    [+]  │ │
│  └────────────────────────┘ │
│                              │
│  ┌── Bottom Nav ──────────┐ │
│  │  🎮    🎬    🎵    ⚙  │ │
│  │ Games Cinema Music  DB │ │
│  └────────────────────────┘ │
│                              │
└─────────────────────────────┘
```

### Spesifikasi Bottom Navigation Bar (Mobile)

| Tab | Ikon | Route | Keterangan |
|-----|------|-------|------------|
| Games | 🎮 | `/admin/games` | Default active tab |
| Cinema | 🎬 | `/admin/cinema` | Modul film/series/anime |
| Music | 🎵 | `/admin/music` | Modul musik |
| DB/Settings | ⚙️ | `/admin/settings` | Import, Export, Backup, Settings |

### Spesifikasi FAB (Floating Action Button)

| Konteks | Aksi FAB | Ikon |
|---------|----------|------|
| Games | Tambah game baru | + |
| Cinema | Tambah cinema baru | + |
| Music | Tambah music baru | + |
| Settings | — (tidak ada FAB) | — |

---

## 2.4 Responsive Breakpoints

| Breakpoint | Lebar | Layout | Navigasi |
|------------|-------|--------|----------|
| Desktop Large | ≥ 1440px | Sidebar + Data Grid penuh | Sidebar tetap terbuka |
| Desktop | 1024px – 1439px | Sidebar + Data Grid | Sidebar collapsible |
| Tablet | 768px – 1023px | Data Grid simplified | Sidebar sebagai drawer |
| Mobile | < 768px | Card View / List View | Bottom Navigation Bar |

### Wireframe — Transisi Layout

```
Desktop (≥1024px)                    Tablet (768-1023px)
┌────┬──────────────────┐            ┌──────────────────────┐
│Side│                   │            │ ☰ ┌─────────────────┐│
│bar │   Data Grid       │    ───▶    │   │  Data Grid      ││
│    │   (Tabel Penuh)   │            │   │  (Kolom dikur.) ││
│    │                   │            │   └─────────────────┘│
└────┴──────────────────┘            └──────────────────────┘

Mobile (<768px)
┌──────────────────────┐
│  ☰  SaumaBox     🔍  │
│  ┌──────────────────┐ │
│  │  Card View       │ │
│  │  (1 kolom)       │ │
│  │  ┌──────────┐    │ │
│  │  │  Card 1  │    │ │
│  │  └──────────┘    │ │
│  │  ┌──────────┐    │ │
│  │  │  Card 2  │    │ │
│  │  └──────────┘    │ │
│  └──────────────────┘ │
│  🎮  🎬  🎵  ⚙      │
└──────────────────────┘
```

---

## 2.5 Sistem Navigasi Detail

### Breadcrumb Hierarchy

```
Level 0 : Home
Level 1 : Home > Games / Cinema / Music / Settings
Level 2 : Home > Games > PC Games / Emulator / Recomp
Level 3 : Home > Games > PC Games > [Nama Game] (Detail/Edit)
```

### Keyboard Shortcuts (Desktop)

| Shortcut | Aksi |
|----------|------|
| `Ctrl + K` | Focus global search |
| `Ctrl + N` | Tambah item baru |
| `Ctrl + S` | Save form |
| `Ctrl + E` | Export data |
| `Ctrl + I` | Import data |
| `Escape` | Tutup modal/dialog |
| `←` `→` | Navigasi tab |
| `↑` `↓` | Navigasi baris tabel |

### Touch Gestures (Mobile)

| Gesture | Aksi |
|---------|------|
| Swipe Left pada Card | Tampilkan tombol Edit/Delete |
| Swipe Down (Pull) | Refresh data |
| Long Press pada Card | Pilih item (multi-select mode) |
| Tap pada Card | Buka detail item |
| Double Tap pada Badge | Quick edit status |

---

## 2.6 State Management — Loading & Empty States

### Wireframe — Loading State (Desktop)

```
┌── Data Grid Loading ────────────────────────────────────┐
│ # │ Judul          │ Year │ Platform │ Status │ Size    │
│───┼────────────────┼──────┼──────────┼────────┼─────────│
│   │ ░░░░░░░░░░░░░░ │ ░░░░ │ ░░░░░░░░ │ ░░░░░░ │ ░░░░░░ │
│   │ ░░░░░░░░░░░    │ ░░░░ │ ░░░░░░   │ ░░░░░  │ ░░░░░  │
│   │ ░░░░░░░░░░░░░  │ ░░░░ │ ░░░░░░░  │ ░░░░░░ │ ░░░░░░ │
│   │ ░░░░░░░░░░     │ ░░░░ │ ░░░░░    │ ░░░░   │ ░░░░   │
│   │ ░░░░░░░░░░░░   │ ░░░░ │ ░░░░░░░░ │ ░░░░░░ │ ░░░░░░ │
└─────────────────────────────────────────────────────────┘
           Skeleton loading animation (shimmer)
```

### Wireframe — Empty State

```
┌─────────────────────────────────────────────┐
│                                             │
│           ┌───────────────┐                 │
│           │   📦          │                 │
│           │  Belum ada    │                 │
│           │  data games   │                 │
│           │               │                 │
│           │ [+ Tambah Game]                 │
│           │ [📥 Import dari Excel]          │
│           └───────────────┘                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Wireframe — Error State

```
┌─────────────────────────────────────────────┐
│                                             │
│           ┌───────────────┐                 │
│           │   ⚠️          │                 │
│           │  Gagal memuat │                 │
│           │  data         │                 │
│           │               │                 │
│           │ [🔄 Coba Lagi]                  │
│           └───────────────┘                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 2.7 Modal & Dialog Patterns

### Wireframe — Modal Form (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌── Modal ────────────────────────────────────────────┐    │
│   │  Tambah Game Baru                            [  ✕ ] │    │
│   │  ─────────────────────────────────────────────────── │    │
│   │                                                      │    │
│   │  Judul Game    [ Far Cry 6                        ]  │    │
│   │  Tahun         [ 2021                             ]  │    │
│   │  Publisher     [ Ubisoft                          ]  │    │
│   │  Developer     [ Ubisoft Montreal                 ]  │    │
│   │  Platform      [ Steam               ▼           ]  │    │
│   │  Status        [ Purchase             ▼           ]  │    │
│   │  Ukuran (GB)   [ 45.2                             ]  │    │
│   │  Rating        [ 8.5                              ]  │    │
│   │  Harga (IDR)   [ Rp 599.000                      ]  │    │
│   │                                                      │    │
│   │  ─────────────────────────────────────────────────── │    │
│   │              [ Batal ]    [ 💾 Simpan ]              │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Wireframe — Bottom Sheet (Mobile)

```
┌─────────────────────────────┐
│                              │
│  (dimmed background)         │
│                              │
│  ┌── Bottom Sheet ─────────┐│
│  │  ── handle bar ──       ││
│  │                          ││
│  │  Tambah Game Baru       ││
│  │                          ││
│  │  Judul    [           ]  ││
│  │  Tahun    [           ]  ││
│  │  Platform [ Steam  ▼ ]   ││
│  │  Status   [ Buy    ▼ ]   ││
│  │  Size     [           ]  ││
│  │  Rating   [           ]  ││
│  │  Harga    [           ]  ││
│  │                          ││
│  │  [ 💾 Simpan Game ]      ││
│  └──────────────────────────┘│
└─────────────────────────────┘
```

---

## 2.8 Notifikasi & Feedback Patterns

| Tipe | Trigger | Tampilan | Durasi |
|------|---------|----------|--------|
| Success Toast | CRUD berhasil | `✅ Game berhasil ditambahkan` | 3 detik |
| Error Toast | Operasi gagal | `❌ Gagal menyimpan data` | 5 detik |
| Warning Dialog | Hapus data | Modal konfirmasi: "Yakin hapus?" | Sampai user merespons |
| Info Banner | Import selesai | `ℹ️ 500 baris berhasil diimport` | 5 detik |
| Loading Overlay | Proses berat | Spinner + progress text | Sampai selesai |

---

## 2.9 Matriks Breakpoint Responsif & Adaptasi Tata Letak

Aplikasi SaumaBox menggunakan sistem *fluid responsive design* dengan 4 zona breakpoint utama:

| Breakpoint | Lebar Viewport | Komponen Navigasi | Tampilan Data Utama | Modus Interaksi |
|------------|----------------|-------------------|---------------------|-----------------|
| **Desktop XL** | ≥ 1440px | Sidebar Kiri Permanen (240px) | Data Grid Multi-kolom Lengkap | Keyboard + Mouse Hover |
| **Desktop MD** | 1024px – 1439px| Sidebar Kiri Permanen (200px) | Data Grid Terkompresi (Scroll H) | Keyboard + Mouse Hover |
| **Tablet** | 768px – 1023px | Sidebar Lipat (Collapsible Drawer)| Dual-Column Card View | Touch + Pointer |
| **Mobile** | < 768px | Bottom Navigation Bar (Fixed) | Single Column Card View | Thumb Zone Gestures |

---

## 2.10 Diagram Wireframe Transisi State Antarmuka

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ALUR PERUBAHAN STATE VIEWPORT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ Inisialisasi Aplikasi ] ──▶ [ State: Loading Skeleton ]                  │
│                                       │                                     │
│                  ┌────────────────────┴────────────────────┐                │
│                  ▼                                         ▼                │
│     [ State: Data Tersedia ]                     [ State: Error Jaringan ]  │
│        (Render Grid / Card)                                │                │
│                  │                                         │                │
│        ┌─────────┴─────────┐                               ▼                │
│        ▼                   ▼                       [ Retry Action ]         │
│  [ Filter / Search ]   [ Hapus Semua ]                                      │
│        │                   │                                                │
│        ▼                   ▼                                                │
│  [ State: Filtered ]   [ State: Empty State ]                               │
│  (Update Auto-Sum)     ("Belum ada data, klik tambah")                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*← Kembali ke [01-executive-summary.md](./01-executive-summary.md)  
Lanjut ke → [03-halaman-publik-dan-login.md](./03-halaman-publik-dan-login.md)*
