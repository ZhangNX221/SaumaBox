# PRD 07 — Functional Requirements Detail

> **Dokumen:** 07 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 7.1 Sistem CRUD (Create, Read, Update, Delete)

### 7.1.1 Alur CRUD — Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      ALUR CRUD UNIVERSAL                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌── CREATE ─────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  User klik [+ Tambah]                                      │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  Modal form muncul                                         │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  User isi field → klik [Simpan]                            │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  ┌─── Validasi ───┐                                       │   │
│  │  │ Client-side:    │                                       │   │
│  │  │ • Required field│                                       │   │
│  │  │ • Format data   │                                       │   │
│  │  │ • Duplikasi cek │                                       │   │
│  │  └────────┬────────┘                                       │   │
│  │           │                                                │   │
│  │      ┌────┴────┐                                           │   │
│  │      ▼         ▼                                           │   │
│  │    Valid     Invalid                                       │   │
│  │      │         │                                           │   │
│  │      ▼         ▼                                           │   │
│  │  POST API   Show error                                     │   │
│  │      │      (inline)                                       │   │
│  │      ▼                                                     │   │
│  │  ┌─── Server ──┐                                          │   │
│  │  │ Validasi    │                                          │   │
│  │  │ INSERT INTO │                                          │   │
│  │  │ Return 201  │                                          │   │
│  │  └──────┬──────┘                                          │   │
│  │         ▼                                                  │   │
│  │  Toast: "✅ Data berhasil ditambahkan"                     │   │
│  │  Tutup modal → Refresh data grid                           │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── READ ───────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  GET /api/admin/{module}                                   │   │
│  │  Query params: page, limit, sort, order, search, filters   │   │
│  │                                                            │   │
│  │  Response:                                                 │   │
│  │  {                                                         │   │
│  │    "data": [...],                                          │   │
│  │    "total": 500,                                           │   │
│  │    "page": 1,                                              │   │
│  │    "limit": 25,                                            │   │
│  │    "aggregates": {                                         │   │
│  │      "sum_price": 12547000,                                │   │
│  │      "count_watched": 98                                   │   │
│  │    }                                                       │   │
│  │  }                                                         │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── UPDATE ─────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  User klik ikon Edit pada baris data                       │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  Modal form muncul (pre-filled dengan data existing)       │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  User ubah field → klik [Simpan]                           │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  PUT /api/admin/{module}/{id}                              │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  Toast: "✅ Data berhasil diperbarui"                      │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── DELETE ─────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  User klik ikon Delete pada baris data                     │   │
│  │       │                                                    │   │
│  │       ▼                                                    │   │
│  │  Dialog konfirmasi: "Yakin hapus [judul]?"                 │   │
│  │       │                                                    │   │
│  │  ┌────┴────┐                                               │   │
│  │  ▼         ▼                                               │   │
│  │ Batal    Hapus                                             │   │
│  │  │         │                                               │   │
│  │  ▼         ▼                                               │   │
│  │ Tutup   DELETE /api/admin/{module}/{id}                    │   │
│  │ dialog       │                                             │   │
│  │              ▼                                             │   │
│  │         Toast: "✅ Data berhasil dihapus"                  │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 7.1.2 API Endpoints — CRUD

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/admin/games` | List semua games (paginated) | ✅ |
| GET | `/api/admin/games/:id` | Detail satu game | ✅ |
| POST | `/api/admin/games` | Tambah game baru | ✅ |
| PUT | `/api/admin/games/:id` | Update game | ✅ |
| DELETE | `/api/admin/games/:id` | Hapus game | ✅ |
| DELETE | `/api/admin/games/bulk` | Hapus banyak game | ✅ |
| GET | `/api/admin/cinema` | List semua cinema (paginated) | ✅ |
| GET | `/api/admin/cinema/:id` | Detail satu cinema | ✅ |
| POST | `/api/admin/cinema` | Tambah cinema baru | ✅ |
| PUT | `/api/admin/cinema/:id` | Update cinema | ✅ |
| PATCH | `/api/admin/cinema/:id` | Toggle watched status | ✅ |
| DELETE | `/api/admin/cinema/:id` | Hapus cinema | ✅ |
| GET | `/api/admin/music` | List semua music (paginated) | ✅ |
| GET | `/api/admin/music/:id` | Detail satu music | ✅ |
| POST | `/api/admin/music` | Tambah music baru | ✅ |
| PUT | `/api/admin/music/:id` | Update music | ✅ |
| PATCH | `/api/admin/music/:id` | Toggle favorite status | ✅ |
| DELETE | `/api/admin/music/:id` | Hapus music | ✅ |

### Public API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/public/games` | List games publik (read-only) | ❌ |
| GET | `/api/public/cinema` | List cinema publik (read-only) | ❌ |
| GET | `/api/public/music` | List music publik (read-only) | ❌ |
| GET | `/api/public/stats` | Statistik publik | ❌ |

---

## 7.2 Filter, Sort & Search

### 7.2.1 Global Search

| Aspek | Detail |
|-------|--------|
| **Trigger** | Ketik di search box / `Ctrl+K` |
| **Debounce** | 300ms setelah user berhenti mengetik |
| **Scope** | Mencari di semua kolom TEXT dari modul aktif |
| **Case** | Case-insensitive |
| **Query** | `WHERE title LIKE '%query%' OR publisher LIKE '%query%' OR ...` |
| **Highlight** | Teks yang cocok di-highlight di hasil |
| **Min Chars** | Minimal 2 karakter |

### 7.2.2 Sort — Spesifikasi

| Aspek | Detail |
|-------|--------|
| **Single Sort** | Klik header kolom → ASC → DESC → None |
| **Multi-Sort** | Shift+Klik header → tambahkan ke sort chain |
| **Indikator** | Arrow icon (▲/▼) + nomor urut sort |
| **Default** | Sort by `id DESC` (terbaru di atas) |
| **API** | `?sort=year&order=desc` atau `?sort=year,title&order=desc,asc` |

### Sort Indicator — Wireframe

```
┌─────────────────────────────────────────────────┐
│  Judul ▲¹  │  Year ▼²  │  Platform  │  Status  │
│            │           │            │          │
│  Multi-sort: Judul ASC (primary),               │
│              Year DESC (secondary)              │
└─────────────────────────────────────────────────┘
```

### 7.2.3 Filter Per Kolom

| Tipe Kolom | Kontrol Filter | Contoh |
|-----------|---------------|--------|
| TEXT (judul, publisher) | Text input (contains) | "Far Cry" |
| TEXT (platform, status) | Dropdown / Multi-select | Steam, Epic |
| INTEGER (year) | Range slider / dual input | 2015 – 2024 |
| REAL (rating) | Range slider | 7.0 – 10.0 |
| BOOLEAN (watched) | Toggle | Semua / Ya / Tidak |
| TEXT (genre) | Multi-select tags | Aksi, Drama |

### Filter Bar — Wireframe

```
┌── Filter Bar (Expanded) ─────────────────────────────────────────┐
│                                                                   │
│  🔍 Search: [ Far Cry                                        ]   │
│                                                                   │
│  Platform    Status      Year           Rating                    │
│  ┌────────┐  ┌────────┐  ┌────────────┐  ┌────────────┐          │
│  │☑ Steam │  │☑ Buy   │  │ 2015 ─── 2024│  │ 7.0 ─── 10 │          │
│  │☑ Epic  │  │☐ Wish  │  │ ●════════●  │  │ ●═════●    │          │
│  │☐ GOG   │  │☐ Free  │  └────────────┘  └────────────┘          │
│  │☐ Crack │  │☐ Crack │                                          │
│  └────────┘  └────────┘                                          │
│                                                                   │
│  Active Filters: Platform: Steam, Epic × │ Status: Buy × │       │
│                  [ Clear All Filters ]                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 7.3 Auto-Sum Harga Game PC

### Spesifikasi Detail

```
┌──────────────────────────────────────────────────────────────┐
│                   AUTO-SUM HARGA GAME PC                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Trigger:                                                    │
│  • Saat data grid PC Games pertama kali dimuat               │
│  • Saat filter berubah (re-kalkulasi)                        │
│  • Saat data ditambah/edit/hapus (re-kalkulasi)              │
│                                                              │
│  Kalkulasi:                                                  │
│  • Hanya menjumlahkan item yang saat ini ter-filter          │
│  • Exclude: price = 0, price = NULL, status = 'Crack'        │
│  • Exclude: status = 'Free', status = 'Wishlist'             │
│                                                              │
│  Display:                                                    │
│  ┌── Footer Row ──────────────────────────────────────┐      │
│  │  Total: 312 games │ 💰 Total Pengeluaran:          │      │
│  │                   │    Rp 12.547.000               │      │
│  │                   │    (dari 250 game purchased)    │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
│  Format:                                                     │
│  • Server mengirim integer: 12547000                         │
│  • Client format ke: "Rp 12.547.000"                         │
│  • Menggunakan Intl.NumberFormat('id-ID')                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Response — Aggregates

```json
{
  "data": [...],
  "total": 312,
  "page": 1,
  "limit": 25,
  "aggregates": {
    "sum_price": 12547000,
    "count_purchased": 250,
    "count_wishlist": 30,
    "count_free": 20,
    "count_crack": 12,
    "total_size_gb": 5432.5
  }
}
```

---

## 7.4 Quick-Checkbox Cinema

### Spesifikasi Detail

```
┌──────────────────────────────────────────────────────────────┐
│                   QUICK-CHECKBOX CINEMA                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Interaksi:                                                  │
│  1. User klik/tap checkbox di kolom "Ditonton"               │
│  2. UI langsung update (optimistic update)                   │
│  3. Background: PATCH /api/admin/cinema/:id                  │
│     Body: { "watched": true }                                │
│  4. Jika API gagal: revert checkbox + error toast            │
│                                                              │
│  Animasi:                                                    │
│  ┌─────┐         ┌─────┐                                    │
│  │ ☐   │  klik   │ ☑   │  + subtle scale animation          │
│  │     │ ──────▶ │     │  + sound effect (opsional)          │
│  └─────┘         └─────┘                                    │
│                                                              │
│  Counter Update:                                             │
│  Footer: ☑ Ditonton: 98 → 99  │  ☐ Belum: 27 → 26          │
│                                                              │
│  Bulk Toggle:                                                │
│  1. Pilih beberapa baris (checkbox row)                      │
│  2. Klik "Toggle Ditonton" di toolbar                        │
│  3. Semua baris terpilih di-toggle                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7.5 Validasi Data — Rules

### 7.5.1 Validasi Client-Side

| Field | Rule | Pesan Error |
|-------|------|-------------|
| `title` | Required, min 1 char, max 500 char | "Judul wajib diisi" |
| `year` | Optional, format 4 digit (1900–2099) | "Format tahun tidak valid" |
| `rating` | Optional, range 0.0–10.0 | "Rating harus antara 0 dan 10" |
| `size_gb` | Optional, numeric ≥ 0 atau "TBA" | "Format ukuran tidak valid" |
| `price` | Optional, numeric ≥ 0 | "Format harga tidak valid" |
| `total_episodes` | Optional, integer ≥ 1 | "Jumlah episode minimal 1" |
| `port_version` | Optional, max 50 char | "Versi terlalu panjang" |

### 7.5.2 Validasi Server-Side

| Rule | Aksi |
|------|------|
| SQL Injection protection | Parameterized queries (prepared statements) |
| XSS protection | HTML entity encoding pada output |
| Duplicate check | Peringatan (bukan blocking) jika judul sama |
| Size limit | Max 10MB per request body |
| Rate limiting | Max 100 requests/menit per session |

---

## 7.6 Pagination

### Spesifikasi

| Aspek | Detail |
|-------|--------|
| **Tipe** | Server-side pagination |
| **Default** | 25 items per halaman |
| **Opsi** | 10, 25, 50, 100 items per halaman |
| **Navigasi** | Previous / Next + nomor halaman |
| **URL Sync** | `?page=2&limit=25` di query string |
| **Jump to** | Input nomor halaman langsung |
| **Info** | "Menampilkan 26-50 dari 312 items" |

### Wireframe — Pagination Controls

```
┌── Pagination ─────────────────────────────────────────────────┐
│                                                                │
│  Items per page: [25 ▼]                                        │
│                                                                │
│  ◀  1  2  [3]  4  5  ...  13  ▶    Halaman: [3] dari 13       │
│                                                                │
│  Menampilkan 51-75 dari 312 items                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

---

## 7.7 Keyboard Accessibility

| Konteks | Key | Aksi |
|---------|-----|------|
| Data Grid | `Tab` | Pindah antar cell |
| Data Grid | `Enter` | Buka detail / edit mode |
| Data Grid | `Space` | Toggle checkbox |
| Data Grid | `Delete` | Hapus row (jika selected) |
| Modal | `Escape` | Tutup modal |
| Modal | `Enter` | Submit form |
| Filter | `Escape` | Clear filter saat ini |
| Global | `?` | Tampilkan keyboard shortcut help |

---

## 7.8 Audit Logging & Riwayat Perubahan

Sistem mencatat setiap mutasi data penting (Create, Update, Delete) ke tabel internal untuk mencegah kehilangan data akibat ketidaksengajaan:

| Atribut Audit | Tipe | Deskripsi |
|---------------|------|-----------|
| `log_id` | Integer (PK) | Identifikator unik entri riwayat |
| `module` | Varchar(20) | Modul entitas (`games`, `cinema`, `music`, `auth`) |
| `record_id` | Integer | ID data yang mengalami perubahan |
| `action` | Varchar(10) | Jenis tindakan (`INSERT`, `UPDATE`, `DELETE`) |
| `changes_json` | Text (JSON) | Diff nilai sebelum dan sesudah perubahan |
| `timestamp` | Datetime | Waktu presisi terjadinya operasi mutasi data |

---

## 7.9 Operasi Massal (Batch & Bulk Actions)

Untuk memfasilitasi pengelolaan koleksi berskala besar (ribuan entri), sistem menyediakan toolbar aksi massal saat beberapa baris dipilih:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3 item dipilih:  [ 🏷️ Ubah Status ▼ ]  [ 📁 Pindah Kategori ▼ ]  [ 🗑️ Hapus ] │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Bulk Delete Protection:** Membutuhkan modal konfirmasi ganda dengan menyebutkan jumlah pasti item yang akan dihapus.
2. **Bulk Category / Platform Update:** Mengubah field tertentu secara bersamaan pada seluruh item terpilih dalam 1 transaksi atomic database SQLite.

---

*← Kembali ke [06-modul-katalog-cinema-music.md](./06-modul-katalog-cinema-music.md)  
Lanjut ke → [08-database-schema.md](./08-database-schema.md)*
