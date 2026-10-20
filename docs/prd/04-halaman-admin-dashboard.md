# PRD 04 — Halaman Admin & Dashboard

> **Dokumen:** 04 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 4.1 Dashboard Admin

### Deskripsi

Dashboard adalah halaman pertama yang dilihat admin setelah login. Menampilkan ringkasan
statistik seluruh katalog, aktivitas terbaru, dan quick actions.

### Route: `/admin/dashboard`

---

### 4.1.1 Wireframe — Dashboard (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─── Top Bar ─────────────────────────────────────────────────────────┐   │
│  │  🎮 SaumaBox            🔍 Search...                  👤 Admin  ▼  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌── Sidebar ──┐  ┌── Main Content ────────────────────────────────────┐   │
│  │             │  │                                                    │   │
│  │  📊 Dash ◀ │  │  Dashboard                                         │   │
│  │  ─────────  │  │  ─────────────────────────────────────────────     │   │
│  │  🎮 Games  │  │                                                    │   │
│  │  🎬 Cinema │  │  ┌── Stat Cards ──────────────────────────────┐    │   │
│  │  🎵 Music  │  │  │                                            │    │   │
│  │  ─────────  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │   │
│  │  📥 Import │  │  │  │ 🎮 Games │ │ 🎬 Cinema│ │ 🎵 Music │  │    │   │
│  │  📤 Export │  │  │  │          │ │          │ │          │  │    │   │
│  │  ─────────  │  │  │  │   523   │ │   312   │ │  1,245   │  │    │   │
│  │  ⚙ Setting │  │  │  │  total   │ │  total   │ │  total   │  │    │   │
│  │             │  │  │  └──────────┘ └──────────┘ └──────────┘  │    │   │
│  │             │  │  │                                            │    │   │
│  │             │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │   │
│  │             │  │  │  │ 💰 Total │ │ 📦 DB    │ │ 🕐 Last  │  │    │   │
│  │             │  │  │  │ Spend    │ │ Size     │ │ Backup   │  │    │   │
│  │             │  │  │  │          │ │          │ │          │  │    │   │
│  │             │  │  │  │Rp 12.5 M │ │ 24.5 MB │ │ 2 hari   │  │    │   │
│  │             │  │  │  │          │ │          │ │ lalu     │  │    │   │
│  │             │  │  │  └──────────┘ └──────────┘ └──────────┘  │    │   │
│  │             │  │  │                                            │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Charts Row ─────────────────────────────┐    │   │
│  │             │  │  │                                            │    │   │
│  │             │  │  │  ┌─ Games by Platform ─┐ ┌─ Cinema by ──┐ │    │   │
│  │             │  │  │  │                     │ │ Type         │ │    │   │
│  │             │  │  │  │   Steam ████████ 45%│ │              │ │    │   │
│  │             │  │  │  │   Epic  ████    20%│ │  Movie ███ 40│ │    │   │
│  │             │  │  │  │   GOG   ███     15%│ │  Series██ 35│ │    │   │
│  │             │  │  │  │   Crack ██      10%│ │  Anime █  25│ │    │   │
│  │             │  │  │  │   Other █       10%│ │              │ │    │   │
│  │             │  │  │  │                     │ │              │ │    │   │
│  │             │  │  │  └─────────────────────┘ └──────────────┘ │    │   │
│  │             │  │  │                                            │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Recent Activity ────────────────────────┐    │   │
│  │             │  │  │  Aktivitas Terbaru                        │    │   │
│  │             │  │  │  ─────────────────────────────────────    │    │   │
│  │             │  │  │  🟢 Added "Elden Ring" to PC Games   2m  │    │   │
│  │             │  │  │  🔵 Updated "Naruto" in Cinema       5m  │    │   │
│  │             │  │  │  🟡 Imported 50 games from Excel    30m  │    │   │
│  │             │  │  │  🔴 Deleted "Test Entry" from Music  1h  │    │   │
│  │             │  │  │  📦 Database backup created          2h  │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Quick Actions ──────────────────────────┐    │   │
│  │             │  │  │                                            │    │   │
│  │             │  │  │  [+ Game] [+ Cinema] [+ Music]            │    │   │
│  │             │  │  │  [📥 Import] [📤 Export] [💾 Backup]      │    │   │
│  │             │  │  │                                            │    │   │
│  │             │  │  └────────────────────────────────────────────┘    │   │
│  │             │  │                                                    │   │
│  └─────────────┘  └────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1.2 Wireframe — Dashboard (Mobile)

```
┌─────────────────────────────┐
│  ┌── Top Bar ─────────────┐ │
│  │  ☰  Dashboard     🔍   │ │
│  └────────────────────────┘ │
│                              │
│  ┌── Stat Cards ──────────┐ │
│  │                         │ │
│  │  ┌────────┐ ┌────────┐ │ │
│  │  │🎮 Games│ │🎬 Cine.│ │ │
│  │  │  523   │ │  312   │ │ │
│  │  └────────┘ └────────┘ │ │
│  │                         │ │
│  │  ┌────────┐ ┌────────┐ │ │
│  │  │🎵 Music│ │💰 Spend│ │ │
│  │  │ 1,245  │ │Rp12.5M │ │ │
│  │  └────────┘ └────────┘ │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── Quick Actions ───────┐ │
│  │                         │ │
│  │  [+ Game]  [+ Cinema]  │ │
│  │  [+ Music] [📥 Import] │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── Recent Activity ─────┐ │
│  │                         │ │
│  │  🟢 Added "Elden Ring" │ │
│  │     PC Games • 2m ago  │ │
│  │  ───────────────────── │ │
│  │  🔵 Updated "Naruto"   │ │
│  │     Cinema • 5m ago    │ │
│  │  ───────────────────── │ │
│  │  🟡 Imported 50 games  │ │
│  │     Excel • 30m ago    │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── Bottom Nav ──────────┐ │
│  │  🎮    🎬    🎵    ⚙  │ │
│  │ Games Cinema Music  DB │ │
│  └────────────────────────┘ │
│                              │
└─────────────────────────────┘
```

---

### 4.1.3 Spesifikasi Stat Cards

| Card | Data Source | Kalkulasi | Ikon | Warna |
|------|-----------|-----------|------|-------|
| Total Games | `COUNT(*) FROM games` | Live query | 🎮 | Biru |
| Total Cinema | `COUNT(*) FROM cinema` | Live query | 🎬 | Merah |
| Total Music | `COUNT(*) FROM music` | Live query | 🎵 | Hijau |
| Total Spending | `SUM(price) FROM games WHERE type='PC'` | Live query | 💰 | Kuning |
| DB Size | File size `.sqlite` | OS stat | 📦 | Ungu |
| Last Backup | `last_backup_at FROM app_settings` | Stored value | 🕐 | Abu-abu |

### 4.1.4 Spesifikasi Charts

| Chart | Tipe | Data |
|-------|------|------|
| Games by Platform | Horizontal Bar | Group by `platform` |
| Games by Status | Donut / Pie | Group by `status` |
| Cinema by Type | Donut / Pie | Group by `type` (Movie/Series/Anime) |
| Games by Year | Line Chart | Group by `year` |
| Music by Genre | Horizontal Bar | Group by `genre` |

---

## 4.2 Halaman Manajemen Admin

### 4.2.1 Wireframe — Pengaturan Umum (`/admin/settings?tab=general`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌── Sidebar ──┐  ┌── Main Content ────────────────────────────────────┐   │
│  │  ...        │  │                                                    │   │
│  │  ⚙ Setting◀│  │  Pengaturan                                        │   │
│  │             │  │  ─────────────────────────────────────────────     │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Tab Bar ────────────────────────────────┐     │   │
│  │             │  │  │ General │ Akun │ Backup │ Public Sharing  │     │   │
│  │             │  │  └──────────────────────────────────────────┘     │   │
│  │             │  │                                                    │   │
│  │             │  │  ┌── Form: Pengaturan Umum ─────────────────┐     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  │  Nama Aplikasi                            │     │   │
│  │             │  │  │  ┌─────────────────────────────────┐      │     │   │
│  │             │  │  │  │ SaumaBox Media Catalog           │      │     │   │
│  │             │  │  │  └─────────────────────────────────┘      │     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  │  Bahasa                                   │     │   │
│  │             │  │  │  ┌─────────────────────────────────┐      │     │   │
│  │             │  │  │  │ Bahasa Indonesia            ▼   │      │     │   │
│  │             │  │  │  └─────────────────────────────────┘      │     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  │  Tema                                     │     │   │
│  │             │  │  │  (●) Dark Mode                            │     │   │
│  │             │  │  │  (  ) Light Mode                          │     │   │
│  │             │  │  │  (  ) System Default                      │     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  │  Items per Halaman                        │     │   │
│  │             │  │  │  ┌─────────────────────────────────┐      │     │   │
│  │             │  │  │  │ 25                          ▼   │      │     │   │
│  │             │  │  │  └─────────────────────────────────┘      │     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  │  Format Mata Uang                         │     │   │
│  │             │  │  │  ┌─────────────────────────────────┐      │     │   │
│  │             │  │  │  │ IDR (Rp)                    ▼   │      │     │   │
│  │             │  │  │  └─────────────────────────────────┘      │     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  │  ─────────────────────────────────────    │     │   │
│  │             │  │  │              [ 💾 Simpan Pengaturan ]     │     │   │
│  │             │  │  │                                           │     │   │
│  │             │  │  └───────────────────────────────────────────┘     │   │
│  │             │  │                                                    │   │
│  └─────────────┘  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2.2 Wireframe — Pengaturan Akun (`/admin/settings?tab=account`)

```
┌── Main Content ────────────────────────────────────────────────┐
│                                                                │
│  ┌── Tab Bar ────────────────────────────────────────────┐     │
│  │ General │ Akun ◀ │ Backup │ Public Sharing            │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌── Form: Ubah Profil ────────────────────────────────┐      │
│  │                                                      │      │
│  │  Username (read-only)                                │      │
│  │  ┌────────────────────────────────────┐               │      │
│  │  │ admin                       🔒     │               │      │
│  │  └────────────────────────────────────┘               │      │
│  │                                                      │      │
│  │  Display Name                                        │      │
│  │  ┌────────────────────────────────────┐               │      │
│  │  │ Rizky Admin                        │               │      │
│  │  └────────────────────────────────────┘               │      │
│  │                                                      │      │
│  │              [ 💾 Update Profil ]                    │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                │
│  ┌── Form: Ubah Password ──────────────────────────────┐      │
│  │                                                      │      │
│  │  Password Lama                                       │      │
│  │  ┌────────────────────────────────────┐               │      │
│  │  │ ••••••••                      👁   │               │      │
│  │  └────────────────────────────────────┘               │      │
│  │                                                      │      │
│  │  Password Baru                                       │      │
│  │  ┌────────────────────────────────────┐               │      │
│  │  │ ••••••••                      👁   │               │      │
│  │  └────────────────────────────────────┘               │      │
│  │  Min. 8 karakter, huruf + angka                      │      │
│  │                                                      │      │
│  │  Konfirmasi Password Baru                            │      │
│  │  ┌────────────────────────────────────┐               │      │
│  │  │ ••••••••                      👁   │               │      │
│  │  └────────────────────────────────────┘               │      │
│  │                                                      │      │
│  │              [ 🔐 Ubah Password ]                    │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                │
│  ┌── Danger Zone ──────────────────────────────────────┐      │
│  │  ⚠️ Zona Berbahaya                                  │      │
│  │  ──────────────────────────────────────────────      │      │
│  │                                                      │      │
│  │  Reset Semua Data                                    │      │
│  │  Menghapus seluruh data katalog. Tidak dapat         │      │
│  │  dibatalkan. Backup database terlebih dahulu.        │      │
│  │                                                      │      │
│  │              [ 🗑️ Reset Database ]                   │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### 4.2.3 Wireframe — Public Sharing (`/admin/settings?tab=public`)

```
┌── Main Content ────────────────────────────────────────────────┐
│                                                                │
│  ┌── Tab Bar ────────────────────────────────────────────┐     │
│  │ General │ Akun │ Backup │ Public Sharing ◀            │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌── Public Sharing Settings ──────────────────────────┐      │
│  │                                                      │      │
│  │  ┌─────────────────────────────────────────────┐     │      │
│  │  │  Public Sharing                     [ON/OFF]│     │      │
│  │  │                                             │     │      │
│  │  │  Mengaktifkan akses publik read-only        │     │      │
│  │  │  ke katalog yang dipilih.                   │     │      │
│  │  └─────────────────────────────────────────────┘     │      │
│  │                                                      │      │
│  │  Modul yang Dipublikasikan:                          │      │
│  │  ┌─────────────────────────────────────────────┐     │      │
│  │  │  🎮 Katalog Games               [ON/OFF]   │     │      │
│  │  │  ─────────────────────────────────────────  │     │      │
│  │  │  🎬 Katalog Cinema              [ON/OFF]   │     │      │
│  │  │  ─────────────────────────────────────────  │     │      │
│  │  │  🎵 Katalog Music               [ON/OFF]   │     │      │
│  │  └─────────────────────────────────────────────┘     │      │
│  │                                                      │      │
│  │  Kolom yang Ditampilkan:                             │      │
│  │  ┌─────────────────────────────────────────────┐     │      │
│  │  │  💰 Tampilkan Harga Game        [ON/OFF]   │     │      │
│  │  │  ─────────────────────────────────────────  │     │      │
│  │  │  ⭐ Tampilkan Rating            [ON/OFF]   │     │      │
│  │  │  ─────────────────────────────────────────  │     │      │
│  │  │  📊 Tampilkan Statistik          [ON/OFF]   │     │      │
│  │  └─────────────────────────────────────────────┘     │      │
│  │                                                      │      │
│  │  Link Publik:                                        │      │
│  │  ┌─────────────────────────────────────────────┐     │      │
│  │  │  https://myserver.com/catalog    [📋 Copy]  │     │      │
│  │  └─────────────────────────────────────────────┘     │      │
│  │                                                      │      │
│  │              [ 💾 Simpan Pengaturan ]                │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4.3 Spesifikasi Komponen Admin

### 4.3.1 Data Grid / Tabel Interaktif

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Sortable Columns | Klik header → sort ASC/DESC/none | P0 |
| Multi-Sort | Shift+klik untuk sort multiple kolom | P1 |
| Column Filter | Filter per kolom (text, dropdown, range) | P0 |
| Global Search | Pencarian instant lintas kolom | P0 |
| Pagination | Server-side pagination | P0 |
| Row Selection | Checkbox per baris (multi-select) | P1 |
| Bulk Actions | Delete, export selected rows | P1 |
| Inline Edit | Double-click cell → edit langsung | P2 |
| Column Resize | Drag border kolom | P2 |
| Column Reorder | Drag & drop header kolom | P3 |
| Sticky Header | Header tetap saat scroll | P0 |
| Color-Coded Badges | Warna berbeda per status/platform | P0 |
| Auto-Sum Footer | Total otomatis kolom harga | P1 |

### 4.3.2 Toolbar Actions

| Action | Ikon | Shortcut | Keterangan |
|--------|------|----------|------------|
| Tambah Baru | + | Ctrl+N | Buka modal form |
| Import | 📥 | Ctrl+I | Buka halaman import |
| Export | 📤 | Ctrl+E | Download file |
| Refresh | 🔄 | F5 | Reload data |
| Filter | 🔍 | Ctrl+F | Toggle filter bar |
| Bulk Delete | 🗑️ | Delete | Hapus item terpilih |

### 4.3.3 Konfirmasi Dialog — Hapus Data

```
┌─────────────────────────────────────────────────┐
│                                                  │
│   ┌── Dialog ─────────────────────────────┐     │
│   │                                        │     │
│   │   ⚠️ Konfirmasi Hapus                  │     │
│   │   ──────────────────────────────       │     │
│   │                                        │     │
│   │   Apakah Anda yakin ingin menghapus    │     │
│   │   "Far Cry 6" dari katalog Games?      │     │
│   │                                        │     │
│   │   Tindakan ini tidak dapat dibatalkan.  │     │
│   │                                        │     │
│   │   ──────────────────────────────       │     │
│   │          [ Batal ]    [ 🗑️ Hapus ]     │     │
│   │                                        │     │
│   └────────────────────────────────────────┘     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 4.3.4 Konfirmasi Dialog — Bulk Delete

```
┌─────────────────────────────────────────────────┐
│                                                  │
│   ┌── Dialog ─────────────────────────────┐     │
│   │                                        │     │
│   │   ⚠️ Konfirmasi Hapus Massal           │     │
│   │   ──────────────────────────────       │     │
│   │                                        │     │
│   │   Anda akan menghapus 15 item          │     │
│   │   dari katalog Games.                  │     │
│   │                                        │     │
│   │   Ketik "HAPUS" untuk konfirmasi:      │     │
│   │   ┌────────────────────────────┐       │     │
│   │   │                            │       │     │
│   │   └────────────────────────────┘       │     │
│   │                                        │     │
│   │   ──────────────────────────────       │     │
│   │          [ Batal ]    [ 🗑️ Hapus ]     │     │
│   │                                        │     │
│   └────────────────────────────────────────┘     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 4.4 Admin Activity Log

### Spesifikasi

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | INTEGER | Auto-increment |
| `action` | TEXT | `CREATE`, `UPDATE`, `DELETE`, `IMPORT`, `EXPORT`, `BACKUP`, `RESTORE` |
| `module` | TEXT | `games`, `cinema`, `music`, `settings` |
| `item_id` | INTEGER | ID item yang terkena aksi (nullable) |
| `item_title` | TEXT | Judul item untuk display |
| `details` | TEXT | JSON detail perubahan |
| `created_at` | DATETIME | Timestamp aksi |

### Wireframe — Activity Log Page

```
┌── Main Content ────────────────────────────────────────────────┐
│                                                                │
│  Log Aktivitas                                                 │
│  ─────────────────────────────────────────────                 │
│                                                                │
│  ┌── Filter ───────────────────────────────────────────┐       │
│  │  Modul: [ Semua ▼ ]  Aksi: [ Semua ▼ ]             │       │
│  │  Tanggal: [ 7 hari terakhir ▼ ]                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                │
│  ┌── Log Table ────────────────────────────────────────┐       │
│  │ Waktu            │ Aksi    │ Modul  │ Detail        │       │
│  │──────────────────┼─────────┼────────┼───────────────│       │
│  │ 20/10 19:30      │ 🟢 ADD  │ Games  │ Far Cry 6     │       │
│  │ 20/10 19:25      │ 🔵 UPD  │ Cinema │ Naruto Ep.500 │       │
│  │ 20/10 19:00      │ 🟡 IMP  │ Games  │ 50 items      │       │
│  │ 20/10 18:45      │ 🔴 DEL  │ Music  │ Test Track    │       │
│  │ 20/10 18:00      │ 📦 BKP  │ System │ Backup OK     │       │
│  │ ...              │ ...     │ ...    │ ...           │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4.5 Admin Settings — Detail Konfigurasi

### Tabel Konfigurasi `app_settings`

| Key | Tipe | Default | Keterangan |
|-----|------|---------|------------|
| `app_name` | TEXT | "SaumaBox" | Nama aplikasi |
| `language` | TEXT | "id" | Kode bahasa |
| `theme` | TEXT | "dark" | dark / light / system |
| `items_per_page` | INTEGER | 25 | 10 / 25 / 50 / 100 |
| `currency` | TEXT | "IDR" | Format mata uang |
| `public_sharing_enabled` | BOOLEAN | false | Master switch |
| `public_games_enabled` | BOOLEAN | false | Games publik |
| `public_cinema_enabled` | BOOLEAN | false | Cinema publik |
| `public_music_enabled` | BOOLEAN | false | Music publik |
| `public_show_prices` | BOOLEAN | false | Harga di publik |
| `public_show_ratings` | BOOLEAN | true | Rating di publik |
| `last_backup_at` | DATETIME | NULL | Timestamp backup terakhir |
| `auto_backup_enabled` | BOOLEAN | false | Backup otomatis |
| `auto_backup_interval` | TEXT | "weekly" | daily / weekly / monthly |

---

*← Kembali ke [03-halaman-publik-dan-login.md](./03-halaman-publik-dan-login.md)  
Lanjut ke → [05-modul-katalog-games.md](./05-modul-katalog-games.md)*
