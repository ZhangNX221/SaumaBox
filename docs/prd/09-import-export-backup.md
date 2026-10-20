# PRD 09 — Import/Export & Backup/Restore

> **Dokumen:** 09 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 9.1 Import Data

### 9.1.1 Format yang Didukung

| Format | Ekstensi | Library / Parser | Max File Size |
|--------|----------|-----------------|---------------|
| Excel | `.xlsx` | SheetJS (xlsx) / openpyxl | 50 MB |
| CSV | `.csv` | Built-in CSV parser | 50 MB |
| JSON | `.json` | Built-in JSON parser | 50 MB |

### 9.1.2 Alur Import — Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ALUR IMPORT DATA                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: Upload File                                                     │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │                                                             │         │
│  │     ┌─────────────────────────────────────────┐             │         │
│  │     │                                         │             │         │
│  │     │        📁 Drag & Drop File              │             │         │
│  │     │        atau                             │             │         │
│  │     │        [📎 Pilih File]                  │             │         │
│  │     │                                         │             │         │
│  │     │   Format: .xlsx, .csv, .json            │             │         │
│  │     │   Max: 50 MB                            │             │         │
│  │     └─────────────────────────────────────────┘             │         │
│  │                                                             │         │
│  │  Target Modul: (●) Games  (  ) Cinema  (  ) Music          │         │
│  │  Sub-Kategori: (●) PC     (  ) Emulator  (  ) Recomp       │         │
│  │  (hanya untuk Games)                                        │         │
│  │                                                             │         │
│  └─────────────────────────────────────────────────────────────┘         │
│       │                                                                  │
│       ▼                                                                  │
│  Step 2: Preview & Column Mapping                                        │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │                                                             │         │
│  │  Preview Data (5 baris pertama):                            │         │
│  │  ┌── Row 1 ──────────────────────────────────────────┐      │         │
│  │  │ Games AAA: Far Cry New Dawn | Year: 2019 | ...    │      │         │
│  │  └───────────────────────────────────────────────────┘      │         │
│  │                                                             │         │
│  │  Column Mapping:                                            │         │
│  │  ┌───────────────────┬────────────────────────────┐         │         │
│  │  │ Kolom Excel       │ Map ke Kolom Database      │         │         │
│  │  ├───────────────────┼────────────────────────────┤         │         │
│  │  │ "Games AAA"       │ [ title              ▼ ]   │         │         │
│  │  │ "Year"            │ [ year               ▼ ]   │         │         │
│  │  │ "Publisher"       │ [ publisher          ▼ ]   │         │         │
│  │  │ "Developer"       │ [ developer          ▼ ]   │         │         │
│  │  │ "Size PC(GB)"     │ [ size_gb            ▼ ]   │         │         │
│  │  │ "Rating"          │ [ rating             ▼ ]   │         │         │
│  │  │ "Platform PC"     │ [ platform           ▼ ]   │         │         │
│  │  │ "Status"          │ [ status             ▼ ]   │         │         │
│  │  │ "Harga (IDR)"     │ [ price              ▼ ]   │         │         │
│  │  │ "Unknown Col"     │ [ — Skip —           ▼ ]   │         │         │
│  │  └───────────────────┴────────────────────────────┘         │         │
│  │                                                             │         │
│  │  Auto-detected mappings: 8/9 kolom                          │         │
│  │                                                             │         │
│  └─────────────────────────────────────────────────────────────┘         │
│       │                                                                  │
│       ▼                                                                  │
│  Step 3: Data Cleaning & Validation Preview                              │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │                                                             │         │
│  │  Cleaning Rules Applied:                                    │         │
│  │  ┌──────────────────────────────────────────────────┐       │         │
│  │  │ ✅ "Rp 169.750" → 169750 (integer)              │       │         │
│  │  │ ✅ "Rp -" → 0                                   │       │         │
│  │  │ ✅ "-" (Studio) → "" (empty string)              │       │         │
│  │  │ ✅ "TBA" (Size) → "TBA" (kept as text)          │       │         │
│  │  │ ✅ "6,6" (Rating) → 6.6 (decimal)               │       │         │
│  │  │ ⚠️  2 baris tanpa judul → akan di-skip          │       │         │
│  │  │ ⚠️  1 baris duplikat terdeteksi                  │       │         │
│  │  └──────────────────────────────────────────────────┘       │         │
│  │                                                             │         │
│  │  Ringkasan:                                                 │         │
│  │  • Total baris: 500                                         │         │
│  │  • Akan diimport: 497                                       │         │
│  │  • Akan di-skip: 2 (tanpa judul)                            │         │
│  │  • Duplikat: 1 (peringatan, tetap import)                   │         │
│  │                                                             │         │
│  │  [ Batal ]    [ ← Kembali ]    [ 📥 Mulai Import ]         │         │
│  │                                                             │         │
│  └─────────────────────────────────────────────────────────────┘         │
│       │                                                                  │
│       ▼                                                                  │
│  Step 4: Import Progress                                                 │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │                                                             │         │
│  │  Mengimport data...                                         │         │
│  │                                                             │         │
│  │  ████████████████████████████░░░░  75%                      │         │
│  │  373 / 497 baris                                            │         │
│  │                                                             │         │
│  │  ⏱ Elapsed: 3s   |   Estimated: 1s remaining               │         │
│  │                                                             │         │
│  │  [ ✋ Cancel Import ]                                       │         │
│  │                                                             │         │
│  └─────────────────────────────────────────────────────────────┘         │
│       │                                                                  │
│       ▼                                                                  │
│  Step 5: Result Summary                                                  │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │                                                             │         │
│  │  ✅ Import Selesai!                                         │         │
│  │                                                             │         │
│  │  • Berhasil: 497 baris                                      │         │
│  │  • Gagal: 0 baris                                           │         │
│  │  • Di-skip: 2 baris (tanpa judul)                           │         │
│  │  • Waktu: 4.2 detik                                         │         │
│  │                                                             │         │
│  │  [ Lihat Data ]    [ Import Lagi ]                          │         │
│  │                                                             │         │
│  └─────────────────────────────────────────────────────────────┘         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 9.1.3 Smart Column Mapping — Rules

| Kolom Excel (Case-Insensitive) | Auto-Map ke DB Column | Modul |
|-------------------------------|----------------------|-------|
| `Games AAA`, `Judul Game`, `Title`, `Judul` | `title` | All |
| `Year`, `Tahun` | `year` | All |
| `Publisher`, `Penerbit` | `publisher` | Games |
| `Developer`, `Pengembang` | `developer` | Games |
| `Size PC(GB)`, `Size (GB)`, `Ukuran` | `size_gb` | Games |
| `Rating`, `Rating (IMDb)`, `Score` | `rating` | All |
| `Platform PC`, `Platform` | `platform` | Games/Music |
| `Status` | `status` | Games |
| `Harga`, `Harga (IDR)`, `Price` | `price` | Games |
| `Console`, `Konsol` | `console` | Games |
| `Emulator` | `emulator` | Games |
| `ROM/ISO Format`, `Format` | `rom_format` | Games |
| `Tipe`, `Type` | `type` | Cinema |
| `Negara`, `Country` | `country` | Cinema |
| `Studio` | `studio` | Cinema |
| `Genre` | `genre` | Cinema/Music |
| `Rating Umur`, `Age Rating` | `age_rating` | Cinema |
| `Artis`, `Artist`, `Band` | `artist` | Music |
| `Album` | `album` | Music |

### 9.1.4 Data Cleaning Rules

| Input Pattern | Transformation | Output |
|--------------|----------------|--------|
| `Rp 169.750` | Strip "Rp ", strip ".", parse int | `169750` |
| `Rp -` | Detect dash → set 0 | `0` |
| `Rp 0` | Parse → 0 | `0` |
| `-` (di kolom Studio/Rating) | Detect dash → empty string atau NULL | `""` / `NULL` |
| `TBA` (di kolom Size) | Keep as text | `"TBA"` |
| `6,6` (Rating dengan koma) | Replace koma → titik, parse float | `6.6` |
| `45.2 GB` (dengan unit) | Strip unit, parse float | `"45.2"` |
| `  Far Cry  ` (extra spaces) | Trim whitespace | `"Far Cry"` |
| `""` (empty string) | Keep as empty atau NULL | `""` / `NULL` |

---

## 9.2 Export Data

### 9.2.1 Spesifikasi Export

| Aspek | Detail |
|-------|--------|
| **Format Output** | Excel (`.xlsx`), CSV (`.csv`), JSON (`.json`) |
| **Scope** | Seluruh data ATAU hanya data yang ter-filter |
| **Filename** | `{module}_{date}_{time}.{ext}` contoh: `games_20261020_1930.xlsx` |
| **Max Rows** | Tidak ada limit (seluruh data) |
| **Encoding** | UTF-8 (untuk CSV) |
| **Excel Sheet** | 1 sheet per sub-kategori |

### 9.2.2 Wireframe — Export Dialog

```
┌── Dialog: Export Data ──────────────────────────────────────────┐
│                                                           [  ✕ ]│
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  Modul: Games                                                    │
│                                                                  │
│  Scope Export:                                                   │
│  (●) Seluruh data (523 items)                                   │
│  (  ) Hanya data yang ter-filter (45 items)                      │
│                                                                  │
│  Format:                                                         │
│  (●) Excel (.xlsx)                                               │
│  (  ) CSV (.csv)                                                 │
│  (  ) JSON (.json)                                               │
│                                                                  │
│  Opsi Tambahan:                                                  │
│  ☑ Sertakan header kolom                                         │
│  ☑ Format harga sebagai Rupiah (Rp 169.750)                      │
│  ☐ Pisahkan per sub-kategori (sheet/file terpisah)               │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                  [ Batal ]         [ 📤 Download ]              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 9.2.3 Export API

| Method | Endpoint | Params | Response |
|--------|----------|--------|----------|
| GET | `/api/admin/export/games` | `format`, `scope`, `filters` | File download |
| GET | `/api/admin/export/cinema` | `format`, `scope`, `filters` | File download |
| GET | `/api/admin/export/music` | `format`, `scope`, `filters` | File download |

---

## 9.3 Backup Database

### 9.3.1 Spesifikasi Backup

| Aspek | Detail |
|-------|--------|
| **Method** | Download file SQLite mentah |
| **Format** | `.sqlite` (copy dari database aktif) |
| **Filename** | `catalog_backup_YYYYMMDD_HHMM.sqlite` |
| **Trigger** | Klik tombol "Backup" di Settings |
| **Process** | 1. WAL checkpoint 2. Copy file 3. Download |
| **Kompresi** | Opsional: ZIP jika file > 50MB |

### 9.3.2 Alur Backup — Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       ALUR BACKUP DATABASE                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                    Frontend              Backend           │
│   │                        │                      │              │
│   │  Klik [💾 Backup]      │                      │              │
│   │───────────────────────▶│                      │              │
│   │                        │                      │              │
│   │                        │  GET /api/admin/     │              │
│   │                        │  backup/download     │              │
│   │                        │─────────────────────▶│              │
│   │                        │                      │              │
│   │                        │     ┌────────────────┤              │
│   │                        │     │ 1. PRAGMA      │              │
│   │                        │     │    wal_checkpoint│             │
│   │                        │     │    (TRUNCATE)   │              │
│   │                        │     │                │              │
│   │                        │     │ 2. Copy file   │              │
│   │                        │     │    database     │              │
│   │                        │     │                │              │
│   │                        │     │ 3. Set response│              │
│   │                        │     │    headers     │              │
│   │                        │     │    Content-    │              │
│   │                        │     │    Disposition:│              │
│   │                        │     │    attachment  │              │
│   │                        │     │                │              │
│   │                        │     │ 4. Update      │              │
│   │                        │     │    last_backup │              │
│   │                        │     │    _at setting │              │
│   │                        │     └────────────────┤              │
│   │                        │                      │              │
│   │                        │  File stream         │              │
│   │                        │◀─────────────────────│              │
│   │                        │                      │              │
│   │  Download file         │                      │              │
│   │  (browser save dialog) │                      │              │
│   │◀──────────────────────│                      │              │
│   │                        │                      │              │
│   │  Toast: "✅ Backup      │                      │              │
│   │  berhasil diunduh"     │                      │              │
│   │◀──────────────────────│                      │              │
│   │                        │                      │              │
```

---

## 9.4 Restore Database

### 9.4.1 Spesifikasi Restore

| Aspek | Detail |
|-------|--------|
| **Method** | Upload file `.sqlite` |
| **Validasi** | 1. Ekstensi file 2. PRAGMA integrity_check 3. Schema validation |
| **Safety** | Auto-create rollback snapshot sebelum replace |
| **Rollback** | File `auto_backup_before_restore.sqlite` |

### 9.4.2 Alur Restore — Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       ALUR RESTORE DATABASE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Upload File                                             │
│       │                                                          │
│       ▼                                                          │
│  Step 2: Validasi File                                           │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                                                     │         │
│  │  ☑ Ekstensi .sqlite / .db                           │         │
│  │  ☑ PRAGMA integrity_check → "ok"                    │         │
│  │  ☑ Schema validation (tabel wajib ada):             │         │
│  │    • games ✅                                       │         │
│  │    • cinema ✅                                      │         │
│  │    • music ✅                                       │         │
│  │    • app_settings ✅                                │         │
│  │    • users ✅                                       │         │
│  │  ☑ Versi schema kompatibel                          │         │
│  │                                                     │         │
│  └─────────────────────────────────────────────────────┘         │
│       │                                                          │
│  ┌────┴────┐                                                     │
│  ▼         ▼                                                     │
│ Valid   Invalid                                                  │
│  │         │                                                     │
│  │         ▼                                                     │
│  │    Error: "File tidak valid. [detail error]"                  │
│  │                                                               │
│  ▼                                                               │
│  Step 3: Konfirmasi                                              │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                                                     │         │
│  │  ⚠️ Konfirmasi Restore                              │         │
│  │                                                     │         │
│  │  File yang diupload berisi:                         │         │
│  │  • 450 games                                        │         │
│  │  • 280 cinema                                       │         │
│  │  • 1100 music                                       │         │
│  │                                                     │         │
│  │  Data saat ini akan diganti SELURUHNYA.             │         │
│  │  Backup otomatis akan dibuat sebelum restore.       │         │
│  │                                                     │         │
│  │  [ Batal ]    [ 🔄 Restore Sekarang ]               │         │
│  │                                                     │         │
│  └─────────────────────────────────────────────────────┘         │
│       │                                                          │
│       ▼                                                          │
│  Step 4: Proses Restore                                          │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                                                     │         │
│  │  1. ✅ Membuat backup: auto_backup_before_restore   │         │
│  │  2. ✅ Menutup koneksi database aktif               │         │
│  │  3. ⏳ Mengganti file database...                   │         │
│  │  4. ⬜ Membuka koneksi baru                         │         │
│  │  5. ⬜ Verifikasi data                              │         │
│  │                                                     │         │
│  └─────────────────────────────────────────────────────┘         │
│       │                                                          │
│       ▼                                                          │
│  Step 5: Selesai                                                 │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                                                     │         │
│  │  ✅ Restore berhasil!                               │         │
│  │                                                     │         │
│  │  Database telah diganti dengan file yang diupload.  │         │
│  │  Backup sebelumnya tersimpan di:                    │         │
│  │  auto_backup_before_restore.sqlite                  │         │
│  │                                                     │         │
│  │  [ Muat Ulang Halaman ]                             │         │
│  │                                                     │         │
│  └─────────────────────────────────────────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 9.4.3 Wireframe — Settings > Backup & Restore

```
┌── Main Content ────────────────────────────────────────────────┐
│                                                                │
│  ┌── Tab Bar ────────────────────────────────────────────┐     │
│  │ General │ Akun │ Backup ◀ │ Public Sharing            │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌── Backup Section ──────────────────────────────────┐       │
│  │                                                     │       │
│  │  💾 Backup Database                                 │       │
│  │  ────────────────────────────────────────────       │       │
│  │                                                     │       │
│  │  Backup terakhir: 18 Oktober 2026, 14:30            │       │
│  │  Ukuran database: 24.5 MB                           │       │
│  │                                                     │       │
│  │  [💾 Download Backup Sekarang]                      │       │
│  │                                                     │       │
│  │  Auto-Backup                                        │       │
│  │  ┌──────────────────────────────────────────┐       │       │
│  │  │  Aktifkan Auto-Backup         [ON/OFF]  │       │       │
│  │  │  Interval: [ Mingguan         ▼      ]  │       │       │
│  │  └──────────────────────────────────────────┘       │       │
│  │                                                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                │
│  ┌── Restore Section ─────────────────────────────────┐       │
│  │                                                     │       │
│  │  🔄 Restore Database                                │       │
│  │  ────────────────────────────────────────────       │       │
│  │                                                     │       │
│  │  ⚠️ Restore akan mengganti SELURUH data yang ada.   │       │
│  │  Backup otomatis akan dibuat sebelum restore.       │       │
│  │                                                     │       │
│  │  ┌─────────────────────────────────────────┐        │       │
│  │  │                                         │        │       │
│  │  │     📁 Drag & Drop file .sqlite         │        │       │
│  │  │     atau [📎 Pilih File]                │        │       │
│  │  │                                         │        │       │
│  │  └─────────────────────────────────────────┘        │       │
│  │                                                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                │
│  ┌── Rollback Section ────────────────────────────────┐       │
│  │                                                     │       │
│  │  🔙 Rollback Snapshot                               │       │
│  │  ────────────────────────────────────────────       │       │
│  │                                                     │       │
│  │  Tersedia: auto_backup_before_restore.sqlite        │       │
│  │  Dibuat: 20 Oktober 2026, 19:30                     │       │
│  │                                                     │       │
│  │  [🔙 Restore dari Snapshot]  [🗑️ Hapus Snapshot]    │       │
│  │                                                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 9.5 API Endpoints — Import/Export/Backup

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/admin/import` | Upload & import file | ✅ |
| POST | `/api/admin/import/preview` | Preview & column mapping | ✅ |
| GET | `/api/admin/export/:module` | Export data modul | ✅ |
| GET | `/api/admin/backup/download` | Download backup SQLite | ✅ |
| POST | `/api/admin/backup/restore` | Upload & restore SQLite | ✅ |
| GET | `/api/admin/backup/rollback-info` | Info rollback snapshot | ✅ |
| POST | `/api/admin/backup/rollback` | Restore dari snapshot | ✅ |
| DELETE | `/api/admin/backup/rollback` | Hapus snapshot | ✅ |

---

*← Kembali ke [08-database-schema.md](./08-database-schema.md)  
Lanjut ke → [10-tech-stack-dan-deployment.md](./10-tech-stack-dan-deployment.md)*
