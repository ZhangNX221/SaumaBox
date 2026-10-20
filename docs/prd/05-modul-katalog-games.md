# PRD 05 — Modul Katalog Games

> **Dokumen:** 05 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 5.1 Arsitektur Modul Games

Modul Games memiliki **3 sub-kategori** yang dikelola dalam satu tabel database `games`
dengan kolom `type` sebagai pembeda:

```
┌─────────────────────────────────────────────────────────────┐
│                     MODUL KATALOG GAMES                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌── Tab Bar ──────────────────────────────────────────┐    │
│  │                                                      │    │
│  │   [ All Games ]  [ PC Games ]  [ Emulator ]          │    │
│  │                  [ Recomp / Unofficial Port ]         │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                             │
│  type = 'PC'         → Tab PC Games                         │
│  type = 'EMULATOR'   → Tab Emulator                         │
│  type = 'RECOMP'     → Tab Recomp                           │
│  type = ALL          → Tab All Games (gabungan)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5.2 Sub-Kategori 1: PC Games

### Skema Data PC Games

| Field | Nama Kolom DB | Tipe | Required | Keterangan |
|-------|--------------|------|----------|------------|
| Judul Game | `title` | TEXT | ✅ | Nama lengkap + edisi/DLC |
| Tahun | `year` | INTEGER | ❌ | Format 4 digit (2020, 2021...) |
| Penerbit | `publisher` | TEXT | ❌ | Nama perusahaan penerbit |
| Pengembang | `developer` | TEXT | ❌ | Nama studio pengembang |
| Ukuran (GB) | `size_gb` | TEXT | ❌ | Angka desimal atau "TBA" |
| Rating | `rating` | REAL | ❌ | Skor 0.0 — 10.0 |
| Platform PC | `platform` | TEXT | ❌ | Steam, Epic, GOG, dll |
| Status | `status` | TEXT | ❌ | Purchase, Wishlist, Free, Crack |
| Harga (IDR) | `price` | INTEGER | ❌ | Dalam satuan Rupiah (integer) |

### Color-Coded Badges — Platform PC

| Platform | Warna Badge | Hex Code | Contoh |
|----------|-------------|----------|--------|
| Steam | Biru Tua | `#1B2838` | `[Steam]` |
| Epic | Abu-abu Gelap | `#2A2A2A` | `[Epic]` |
| Ubisoft | Abu-abu | `#6B6B6B` | `[Ubisoft]` |
| GOG | Oranye | `#FF8C00` | `[GOG]` |
| Crack / Fitgirl | Kuning | `#FFD700` | `[Crack]` |

### Color-Coded Badges — Status

| Status | Warna Badge | Hex Code | Contoh |
|--------|-------------|----------|--------|
| Purchase | Hijau | `#28A745` | `[Purchase]` |
| Wishlist | Biru Muda | `#17A2B8` | `[Wishlist]` |
| Free / Free Uplay | Ungu | `#6F42C1` | `[Free]` |
| Crack | Kuning | `#FFC107` | `[Crack]` |

---

### Wireframe — Data Grid PC Games (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌── Tab Bar ──────────────────────────────────────────────────────┐        │
│  │  All (523)  │  PC Games (312) ◀  │  Emulator (156)  │  Recomp (55)│     │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Toolbar ──────────────────────────────────────────────────────┐        │
│  │  [+ Tambah Game]  [📥 Import]   🔍 Cari game...                │        │
│  │  Platform: [ Semua ▼ ]   Status: [ Semua ▼ ]   Year: [ Semua ▼ ] │      │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Data Grid ────────────────────────────────────────────────────┐        │
│  │ ☐ │ # │ Judul Game          │ Year │ Publisher │ Developer     │        │
│  │   │   │                     │      │           │               │        │
│  │   │   │ Platform │ Status   │ Size │ Rating    │ Harga (IDR)   │        │
│  │───┼───┼─────────────────────┼──────┼───────────┼───────────────│        │
│  │ ☐ │ 1 │ Far Cry New Dawn    │ 2019 │ Ubisoft   │ Ubisoft Mtl   │        │
│  │   │   │ Ultimate            │      │           │               │        │
│  │   │   │ 🔵Steam  │ 🟢Buy   │ 40.2 │ ⭐ 7.5    │ Rp 169.750    │        │
│  │───┼───┼─────────────────────┼──────┼───────────┼───────────────│        │
│  │ ☐ │ 2 │ It Takes Two        │ 2021 │ EA        │ Hazelight     │        │
│  │   │   │ 🔵Steam  │ 🟢Buy   │ 20.5 │ ⭐ 9.2    │ Rp 299.000    │        │
│  │───┼───┼─────────────────────┼──────┼───────────┼───────────────│        │
│  │ ☐ │ 3 │ Cyberpunk 2077      │ 2020 │ CDPR      │ CDPR          │        │
│  │   │   │ 🟠GOG    │ 🟢Buy   │ 70.0 │ ⭐ 8.0    │ Rp 599.000    │        │
│  │───┼───┼─────────────────────┼──────┼───────────┼───────────────│        │
│  │ ☐ │ 4 │ Stardew Valley      │ 2016 │ Concern.  │ Concern.      │        │
│  │   │   │ 🔵Steam  │ 🟢Buy   │ 0.5  │ ⭐ 9.0    │ Rp 69.000     │        │
│  │───┼───┼─────────────────────┼──────┼───────────┼───────────────│        │
│  │ ☐ │ 5 │ GTA V               │ 2015 │ Rockstar  │ Rockstar N.   │        │
│  │   │   │ 🟡Crack  │ 🟡Crack │ 94.0 │ ⭐ 9.5    │ Rp -          │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Footer ──────────────────────────────────────────────────────┐         │
│  │  ◀ 1 2 3 ... 13 ▶    Total: 312 games                        │         │
│  │  💰 Auto-Sum Harga: Rp 12.547.000  (hanya filtered items)    │         │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Auto-Sum Harga — Spesifikasi

| Aspek | Detail |
|-------|--------|
| **Kalkulasi** | `SUM(price)` dari semua baris yang saat ini ditampilkan (sesuai filter aktif) |
| **Tampilan** | Format Rupiah: `Rp 12.547.000` |
| **Update** | Real-time saat filter berubah |
| **Exclude** | Baris dengan harga `0`, `-`, atau `NULL` tidak dihitung |
| **Posisi** | Di footer data grid, sejajar dengan kolom Harga |

---

## 5.3 Sub-Kategori 2: Game Emulator

### Skema Data Game Emulator

| Field | Nama Kolom DB | Tipe | Required | Keterangan |
|-------|--------------|------|----------|------------|
| Judul Game | `title` | TEXT | ✅ | Nama game + region opsional |
| Tahun Rilis Asli | `year` | INTEGER | ❌ | Tahun rilis di konsol |
| Penerbit | `publisher` | TEXT | ❌ | Penerbit asli |
| Pengembang | `developer` | TEXT | ❌ | Studio pengembang asli |
| Konsol Asal | `console` | TEXT | ❌ | PS1, PS2, N64, Switch, dll |
| Software Emulator | `emulator` | TEXT | ❌ | PCSX2, RPCS3, Yuzu, dll |
| Format File | `rom_format` | TEXT | ❌ | .iso, .chd, .nsp, .xci, dll |
| Ukuran (GB) | `size_gb` | TEXT | ❌ | Termasuk update/DLC |
| Status | `status` | TEXT | ❌ | Playable, Completed, Backlog |
| Rating | `rating` | REAL | ❌ | Skor 0.0 — 10.0 |

### Console Badges

| Manufaktur | Konsol | Warna Badge |
|-----------|--------|-------------|
| **Sony** | PS1, PS2, PS3, PSP, PS Vita | Biru PlayStation (`#003087`) |
| **Nintendo** | NES, SNES, N64, GameCube, Wii, Wii U, Switch, GB/GBA, NDS, 3DS | Merah Nintendo (`#E60012`) |
| **Sega** | Sega Genesis, Dreamcast | Biru Sega (`#0060A8`) |
| **Microsoft** | Xbox, Xbox 360 | Hijau Xbox (`#107C10`) |
| **Lainnya** | Arcade/MAME | Abu-abu (`#6B6B6B`) |

### Status Badges — Emulator

| Status | Warna | Keterangan |
|--------|-------|------------|
| Playable (60 FPS) | Hijau `#28A745` | Berjalan sempurna |
| Completed | Biru `#007BFF` | Sudah selesai dimainkan |
| Ingame | Kuning `#FFC107` | Bisa masuk game tapi ada issue |
| Unplayable | Merah `#DC3545` | Tidak bisa dimainkan |
| Backlog | Abu-abu `#6C757D` | Belum dicoba |

---

### Wireframe — Data Grid Emulator (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌── Tab Bar ──────────────────────────────────────────────────────┐        │
│  │  All (523) │ PC Games (312) │ Emulator (156) ◀ │ Recomp (55)   │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Toolbar ──────────────────────────────────────────────────────┐        │
│  │  [+ Tambah Game]  [📥 Import]   🔍 Cari game...                │        │
│  │  Console: [ Semua ▼ ]  Emulator: [ Semua ▼ ]  Status: [ Semua ▼ ]│      │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Data Grid ────────────────────────────────────────────────────┐        │
│  │ # │ Judul Game          │ Year │ Console    │ Emulator │ Format │        │
│  │   │                     │      │            │          │        │        │
│  │   │ Size   │ Status             │ Rating                       │        │
│  │───┼─────────────────────┼──────┼────────────┼──────────┼────────│        │
│  │ 1 │ Shadow of Colossus  │ 2005 │ 🔵 PS2    │ PCSX2    │ .iso   │        │
│  │   │ 3.2 GB │ 🟢 Playable (60fps) │ ⭐ 9.5                     │        │
│  │───┼─────────────────────┼──────┼────────────┼──────────┼────────│        │
│  │ 2 │ Zelda: OoT (USA)    │ 1998 │ 🔴 N64    │ Mupen64  │ .z64   │        │
│  │   │ 0.03GB │ 🔵 Completed        │ ⭐ 10.0                    │        │
│  │───┼─────────────────────┼──────┼────────────┼──────────┼────────│        │
│  │ 3 │ Persona 5 Royal     │ 2019 │ 🔵 PS3    │ RPCS3    │ .pkg   │        │
│  │   │ 25.0GB │ 🟢 Playable (30fps) │ ⭐ 9.8                     │        │
│  │───┼─────────────────────┼──────┼────────────┼──────────┼────────│        │
│  │ 4 │ Monster Hunter Rise │ 2021 │ 🔴 Switch │ Ryujinx  │ .nsp   │        │
│  │   │ 12.5GB │ 🟡 Ingame           │ ⭐ 8.5                     │        │
│  │───┼─────────────────────┼──────┼────────────┼──────────┼────────│        │
│  │ 5 │ Crisis Core FF7     │ 2007 │ 🔵 PSP    │ PPSSPP   │ .iso   │        │
│  │   │ 1.5 GB │ 🟢 Playable (60fps) │ ⭐ 8.8                     │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Footer ──────────────────────────────────────────────────────┐         │
│  │  ◀ 1 2 3 ... 7 ▶    Total: 156 games                         │         │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Filter Emulator — Spesifikasi

| Filter | Tipe Kontrol | Opsi |
|--------|-------------|------|
| Console | Dropdown multi-select | Semua konsol yang ada di data |
| Emulator | Dropdown | Semua emulator yang ada di data |
| Status | Dropdown | Playable, Completed, Ingame, Unplayable, Backlog |
| Year Range | Range slider | Min–Max dari data |
| ROM Format | Dropdown | .iso, .chd, .nsp, .xci, .pkg, dll |

---

## 5.4 Sub-Kategori 3: Recomp & Unofficial PC Port

### Skema Data Recomp

| Field | Nama Kolom DB | Tipe | Required | Keterangan |
|-------|--------------|------|----------|------------|
| Judul Game | `title` | TEXT | ✅ | Nama game/proyek port |
| Tahun Rilis Asli | `year` | INTEGER | ❌ | Tahun rilis asli |
| Tahun Port | `port_year` | INTEGER | ❌ | Tahun rilis versi port |
| Konsol Asal | `console` | TEXT | ❌ | Konsol sebelum di-port |
| Tim Porting | `port_developer` | TEXT | ❌ | Nama komunitas/developer |
| Versi Build | `port_version` | TEXT | ❌ | v8.0.5, Nightly, dll |
| Enhancements | `enhancements` | TEXT | ❌ | Multi-tag (comma-separated) |
| Ukuran (GB) | `size_gb` | TEXT | ❌ | Total instalasi + asset |
| Status | `status` | TEXT | ❌ | Installed, Completed, Modded, Wishlist |
| Rating | `rating` | REAL | ❌ | Skor 0.0 — 10.0 |

### Enhancement Tags

| Tag | Ikon | Keterangan |
|-----|------|------------|
| High FPS (60/120+) | 🏎️ | Frame rate tinggi |
| Ultrawide Support | 🖥️ | Dukungan 21:9 / 32:9 |
| HD Texture Pack | 🎨 | Tekstur resolusi tinggi |
| Ray Tracing | 💡 | Pencahayaan ray tracing |
| Native Gyro/Controller | 🎮 | Dukungan gyro/controller |
| Widescreen Fix | 📐 | Perbaikan aspect ratio |
| Custom OST | 🎵 | Musik custom/remastered |

### Status Badges — Recomp

| Status | Warna | Keterangan |
|--------|-------|------------|
| Installed | Hijau `#28A745` | Terinstal di PC |
| Completed | Biru `#007BFF` | Sudah selesai |
| Modded | Ungu `#6F42C1` | Dengan mod tambahan |
| Wishlist | Biru Muda `#17A2B8` | Belum diinstal |

---

### Wireframe — Data Grid Recomp (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌── Tab Bar ──────────────────────────────────────────────────────┐        │
│  │  All (523) │ PC Games (312) │ Emulator (156) │ Recomp (55) ◀   │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Toolbar ──────────────────────────────────────────────────────┐        │
│  │  [+ Tambah Game]  [📥 Import]   🔍 Cari game...                │        │
│  │  Console: [ Semua ▼ ]  Status: [ Semua ▼ ]                     │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Data Grid ────────────────────────────────────────────────────┐        │
│  │ # │ Judul Game/Project  │ Year  │ Port  │ Console │ Port Dev   │        │
│  │   │                     │ (Orig)│ Year  │         │            │        │
│  │   │ Version │ Enhancements              │ Size  │ Status     │        │
│  │───┼─────────────────────┼───────┼───────┼─────────┼────────────│        │
│  │ 1 │ Ship of Harkinian   │ 1998  │ 2023  │ 🔴 N64  │ Harbour    │        │
│  │   │ (Ocarina of Time)   │       │       │         │ Masters    │        │
│  │   │ v8.0.5 │ 🏎️60fps 🖥️UW 🎨HD       │ 0.5GB │ 🟢Install │        │
│  │───┼─────────────────────┼───────┼───────┼─────────┼────────────│        │
│  │ 2 │ 2Ship2Harkinian     │ 2000  │ 2024  │ 🔴 N64  │ Harbour    │        │
│  │   │ (Majora's Mask)     │       │       │         │ Masters    │        │
│  │   │ v1.2.0 │ 🏎️60fps 🖥️UW 🎨HD       │ 0.6GB │ 🟢Install │        │
│  │───┼─────────────────────┼───────┼───────┼─────────┼────────────│        │
│  │ 3 │ Zelda 64 Recomp.    │ 1998  │ 2024  │ 🔴 N64  │ Wiseguy /  │        │
│  │   │                     │       │       │         │ N64Recomp  │        │
│  │   │ Nightly│ 🏎️120fps 🖥️UW 💡RT       │ 0.4GB │ 🟣Modded  │        │
│  │───┼─────────────────────┼───────┼───────┼─────────┼────────────│        │
│  │ 4 │ OpenGOAL: Jak &     │ 2001  │ 2023  │ 🔵 PS2  │ OpenGOAL   │        │
│  │   │ Daxter              │       │       │         │ Team       │        │
│  │   │ v0.2.0 │ 🏎️60fps 🖥️UW             │ 1.2GB │ 🔵Complet │        │
│  │───┼─────────────────────┼───────┼───────┼─────────┼────────────│        │
│  │ 5 │ SM64 PC Port        │ 1996  │ 2020  │ 🔴 N64  │ SM64       │        │
│  │   │                     │       │       │         │ Decomp     │        │
│  │   │ Nightly│ 🏎️60fps 💡RT 🎵OST       │ 0.1GB │ 🟣Modded  │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Footer ──────────────────────────────────────────────────────┐         │
│  │  ◀ 1 2 3 ▶    Total: 55 games                                │         │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pelacak Versi — Spesifikasi

| Fitur | Detail |
|-------|--------|
| **Field** | `port_version` (TEXT) |
| **Display** | Badge di data grid |
| **Update** | Admin bisa update versi kapan saja |
| **Format** | Teks bebas: `v8.0.5`, `v1.2.0`, `Nightly Build`, `Beta 3` |
| **Notifikasi** | Opsional: highlight jika versi sudah lama tidak diupdate |

---

## 5.5 Form Tambah/Edit Game — Universal

### Wireframe — Form Game (Adaptive per Sub-Kategori)

```
┌── Modal: Tambah Game Baru ──────────────────────────────────────┐
│                                                           [  ✕ ]│
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  Sub-Kategori                                                    │
│  ┌──────────────────────────────────────────────────┐            │
│  │ (●) PC Games  (  ) Emulator  (  ) Recomp        │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                  │
│  ── Fields yang selalu muncul ──────────────────────            │
│                                                                  │
│  Judul Game *         [ Far Cry New Dawn Ultimate           ]    │
│  Tahun                [ 2019                                ]    │
│  Publisher            [ Ubisoft                             ]    │
│  Developer            [ Ubisoft Montreal                    ]    │
│  Ukuran (GB)          [ 40.2                                ]    │
│  Rating               [ ⭐ ⭐ ⭐ ⭐ ☆  7.5                ]    │
│                                                                  │
│  ── Fields khusus PC Games ─────────────────────────            │
│  (muncul jika sub-kategori = PC Games)                          │
│                                                                  │
│  Platform PC          [ Steam                        ▼     ]    │
│  Status               [ Purchase                     ▼     ]    │
│  Harga (IDR)          [ 169750                              ]    │
│                        Tampil sebagai: Rp 169.750            │    │
│                                                                  │
│  ── Fields khusus Emulator ─────────────────────────            │
│  (muncul jika sub-kategori = Emulator)                          │
│                                                                  │
│  Konsol               [ PS2                          ▼     ]    │
│  Emulator             [ PCSX2                        ▼     ]    │
│  Format ROM           [ .iso                         ▼     ]    │
│  Status               [ Playable (60 FPS)            ▼     ]    │
│                                                                  │
│  ── Fields khusus Recomp ───────────────────────────            │
│  (muncul jika sub-kategori = Recomp)                            │
│                                                                  │
│  Tahun Port           [ 2023                                ]    │
│  Konsol Asal          [ N64                          ▼     ]    │
│  Tim Porting          [ Harbour Masters                     ]    │
│  Versi Build          [ v8.0.5                              ]    │
│  Enhancements         [ ☐ High FPS  ☑ Ultrawide  ☑ HD TX  ]    │
│  Status               [ Installed                    ▼     ]    │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                  [ Batal ]         [ 💾 Simpan Game ]           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5.6 Mobile — Card View Games

### Wireframe — Card View PC Game (Mobile)

```
┌─────────────────────────────┐
│                              │
│  ┌── Game Card ───────────┐ │
│  │                         │ │
│  │  🎮 Far Cry New Dawn   │ │
│  │     Ultimate            │ │
│  │                         │ │
│  │  ┌─────────────────────┐│ │
│  │  │ 2019 │ Ubisoft      ││ │
│  │  │ Dev: Ubisoft Mtl    ││ │
│  │  └─────────────────────┘│ │
│  │                         │ │
│  │  🔵 Steam    🟢 Purchase│ │
│  │                         │ │
│  │  📦 40.2 GB  ⭐ 7.5     │ │
│  │  💰 Rp 169.750          │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── Game Card ───────────┐ │
│  │                         │ │
│  │  🎮 Elden Ring         │ │
│  │                         │ │
│  │  ┌─────────────────────┐│ │
│  │  │ 2022 │ Bandai Namco ││ │
│  │  │ Dev: FromSoftware   ││ │
│  │  └─────────────────────┘│ │
│  │                         │ │
│  │  🔵 Steam    🟢 Purchase│ │
│  │                         │ │
│  │  📦 49.0 GB  ⭐ 9.5     │ │
│  │  💰 Rp 599.000          │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
└─────────────────────────────┘
```

---

*← Kembali ke [04-halaman-admin-dashboard.md](./04-halaman-admin-dashboard.md)  
Lanjut ke → [06-modul-katalog-cinema-music.md](./06-modul-katalog-cinema-music.md)*
