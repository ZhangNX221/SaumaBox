# PRD 06 — Modul Katalog Cinema & Music

> **Dokumen:** 06 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 6.1 Modul Katalog Cinema

### Deskripsi

Modul Cinema mencakup 3 sub-kategori: **Movie**, **Series**, dan **Anime**.
Semua disimpan dalam satu tabel `cinema` dengan kolom `type` sebagai pembeda.

### Arsitektur Tab Cinema

```
┌─────────────────────────────────────────────────────────┐
│                    MODUL KATALOG CINEMA                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌── Tab Bar ──────────────────────────────────────┐    │
│  │                                                  │    │
│  │   [ All ]  [ Movie ]  [ Series ]  [ Anime ]     │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                         │
│  type = 'MOVIE'    → Tab Movie                          │
│  type = 'SERIES'   → Tab Series                         │
│  type = 'ANIME'    → Tab Anime                          │
│  type = ALL        → Tab All (gabungan)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 6.1.1 Skema Data Cinema

| Field | Nama Kolom DB | Tipe | Required | Keterangan |
|-------|--------------|------|----------|------------|
| Nomor Urut | auto-generated | — | — | Penomoran baris otomatis |
| Tipe | `type` | TEXT | ✅ | MOVIE, SERIES, ANIME |
| Judul | `title` | TEXT | ✅ | Nama film/serial/anime |
| Rating IMDb | `rating` | REAL | ❌ | Skor desimal (6.6, 7.1, 8.6) atau NULL |
| Tahun | `year` | INTEGER | ❌ | Tahun rilis |
| Negara | `country` | TEXT | ❌ | Negara asal produksi |
| Studio | `studio` | TEXT | ❌ | Rumah produksi / studio animasi |
| Genre | `genre` | TEXT | ❌ | Multi-tag comma-separated |
| Klasifikasi Usia | `age_rating` | TEXT | ❌ | SU, R (13+), D (17+), dll |
| Total Episode | `total_episodes` | INTEGER | ❌ | Untuk Series & Anime |
| Total Season | `total_seasons` | INTEGER | ❌ | Untuk Series |
| Status Tonton | `watched` | BOOLEAN | ❌ | Checkbox interaktif |

### Klasifikasi Usia Badges

| Rating | Label | Warna |
|--------|-------|-------|
| SU | Semua Umur | Hijau `#28A745` |
| R (13+) | Remaja 13+ | Kuning `#FFC107` |
| D (13+) | Dewasa 13+ | Oranye `#FD7E14` |
| D (17+) | Dewasa 17+ | Merah `#DC3545` |
| — | Belum ditentukan | Abu-abu `#6C757D` |

### Genre Tags — Contoh

| Warna | Genre |
|-------|-------|
| Merah | Aksi, Thriller, Horror |
| Biru | Drama, Misteri, Sci-Fi |
| Hijau | Komedi, Keluarga, Petualangan |
| Ungu | Fantasi, Supernatural |
| Pink | Romansa, Slice of Life |
| Kuning | Dokumenter, Sejarah |

---

### 6.1.2 Wireframe — Data Grid Cinema (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌── Tab Bar ──────────────────────────────────────────────────────┐        │
│  │  All (312)  │  Movie (125) ◀  │  Series (87)  │  Anime (100)   │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Toolbar ──────────────────────────────────────────────────────┐        │
│  │  [+ Tambah Cinema]  [📥 Import]   🔍 Cari judul...             │        │
│  │  Genre: [ Semua ▼ ]  Negara: [ Semua ▼ ]  Status: [ Semua ▼ ]  │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Data Grid ────────────────────────────────────────────────────┐        │
│  │ ☐ │ # │ Judul               │ Rating│ Year │ Negara    │ Studio │       │
│  │   │   │                     │ IMDb  │      │           │        │       │
│  │   │   │ Genre                        │ Usia  │ Ditonton │       │       │
│  │───┼───┼─────────────────────┼───────┼──────┼───────────┼────────│       │
│  │ ☐ │ 1 │ 22 Menit            │ 6.6   │ 2018 │ Indonesia │ Falcon │       │
│  │   │   │ 🔴Aksi, 🔵Drama             │ 🟡R13+│ ☑        │       │       │
│  │───┼───┼─────────────────────┼───────┼──────┼───────────┼────────│       │
│  │ ☐ │ 2 │ 3 Srikandi          │ 7.1   │ 2016 │ Indonesia │ Starvs │       │
│  │   │   │ 🔵Drama, 🟢Keluarga         │ 🟢SU  │ ☑        │       │       │
│  │───┼───┼─────────────────────┼───────┼──────┼───────────┼────────│       │
│  │ ☐ │ 3 │ Ada Apa Dengan      │ 8.6   │ 2002 │ Indonesia │ Miles  │       │
│  │   │   │ Cinta?              │       │      │           │        │       │
│  │   │   │ 🔵Drama, 💗Romansa          │ 🟡R13+│ ☑        │       │       │
│  │───┼───┼─────────────────────┼───────┼──────┼───────────┼────────│       │
│  │ ☐ │ 4 │ The Shawshank       │ 9.3   │ 1994 │ USA       │ Castle │       │
│  │   │   │ Redemption          │       │      │           │ Rock   │       │
│  │   │   │ 🔵Drama                     │ 🔴D17+│ ☑        │       │       │
│  │───┼───┼─────────────────────┼───────┼──────┼───────────┼────────│       │
│  │ ☐ │ 5 │ Spirited Away       │ 8.6   │ 2001 │ Jepang    │ Ghibli │       │
│  │   │   │ 🟢Petualangan, 🟣Fantasi    │ 🟢SU  │ ☐        │       │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Footer ──────────────────────────────────────────────────────┐         │
│  │  ◀ 1 2 3 ... 7 ▶    Total: 125 movies                        │         │
│  │  ☑ Ditonton: 98 (78%)    ☐ Belum: 27 (22%)                   │         │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Quick-Checkbox Cinema — Spesifikasi

| Aspek | Detail |
|-------|--------|
| **Interaksi** | Single click/tap pada checkbox |
| **API Call** | `PATCH /api/admin/cinema/:id` → `{ watched: true/false }` |
| **Response Time** | < 100ms (optimistic update) |
| **Feedback** | Checkbox berubah instant + subtle animation |
| **Undo** | Klik/tap lagi untuk toggle balik |
| **Counter** | Footer menampilkan jumlah ditonton vs belum |

---

### 6.1.3 Wireframe — Data Grid Series/Anime (Desktop)

```
┌── Data Grid — Tab Series ──────────────────────────────────────────┐
│ # │ Judul              │ Rating│ Year │ Season │ Episode │ Negara  │
│   │                    │ IMDb  │      │        │         │         │
│   │ Genre              │ Studio         │ Usia │ Ditonton         │
│───┼────────────────────┼───────┼──────┼────────┼─────────┼─────────│
│ 1 │ Breaking Bad       │ 9.5   │ 2008 │ 5      │ 62      │ USA     │
│   │ 🔵Drama, 🔴Thriller│ Sony Pictures  │ 🔴D17+│ ☑                │
│───┼────────────────────┼───────┼──────┼────────┼─────────┼─────────│
│ 2 │ Stranger Things    │ 8.7   │ 2016 │ 4      │ 34      │ USA     │
│   │ 🟣Sci-Fi, 🔴Horror │ Netflix        │ 🟡R13+│ ☑                │
│───┼────────────────────┼───────┼──────┼────────┼─────────┼─────────│
│ 3 │ Squid Game         │ 8.0   │ 2021 │ 2      │ 16      │ Korea   │
│   │ 🔴Thriller, 🔵Drama│ Siren Pictures │ 🔴D17+│ ☐                │
└────────────────────────────────────────────────────────────────────┘

┌── Data Grid — Tab Anime ───────────────────────────────────────────┐
│ # │ Judul              │ Rating│ Year │ Episode │ Studio  │ Negara  │
│   │ Genre              │ Usia  │ Ditonton                         │
│───┼────────────────────┼───────┼──────┼─────────┼─────────┼─────────│
│ 1 │ Attack on Titan    │ 9.0   │ 2013 │ 87      │ MAPPA   │ Jepang  │
│   │ 🔴Aksi, 🟣Fantasi  │ 🔴D17+│ ☑                                │
│───┼────────────────────┼───────┼──────┼─────────┼─────────┼─────────│
│ 2 │ Demon Slayer       │ 8.6   │ 2019 │ 44      │Ufotable │ Jepang  │
│   │ 🔴Aksi, 🟣Supernatural│🟡R13+│ ☑                              │
│───┼────────────────────┼───────┼──────┼─────────┼─────────┼─────────│
│ 3 │ One Piece          │ 8.9   │ 1999 │ 1100+   │ Toei    │ Jepang  │
│   │ 🔴Aksi, 🟢Petualangan│ 🟢SU │ ☐ (ongoing)                     │
└────────────────────────────────────────────────────────────────────┘
```

---

### 6.1.4 Wireframe — Card View Cinema (Mobile)

```
┌─────────────────────────────┐
│                              │
│  ┌── Cinema Card ─────────┐ │
│  │                         │ │
│  │  🎬 22 Menit            │ │
│  │                         │ │
│  │  ┌─────────────────────┐│ │
│  │  │ 2018 │ Indonesia    ││ │
│  │  │ Studio: Falcon      ││ │
│  │  └─────────────────────┘│ │
│  │                         │ │
│  │  🔴 Aksi  🔵 Drama      │ │
│  │  🟡 R (13+)             │ │
│  │                         │ │
│  │  ⭐ 6.6 IMDb            │ │
│  │                         │ │
│  │  ☑ Sudah ditonton       │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── Cinema Card ─────────┐ │
│  │                         │ │
│  │  🎬 Attack on Titan     │ │
│  │  (Anime • 87 Episode)  │ │
│  │                         │ │
│  │  ┌─────────────────────┐│ │
│  │  │ 2013 │ Jepang       ││ │
│  │  │ Studio: MAPPA       ││ │
│  │  └─────────────────────┘│ │
│  │                         │ │
│  │  🔴 Aksi  🟣 Fantasi    │ │
│  │  🔴 D (17+)             │ │
│  │                         │ │
│  │  ⭐ 9.0 IMDb            │ │
│  │                         │ │
│  │  ☑ Sudah ditonton       │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
└─────────────────────────────┘
```

---

### 6.1.5 Form Tambah/Edit Cinema

```
┌── Modal: Tambah Cinema ─────────────────────────────────────────┐
│                                                           [  ✕ ]│
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  Tipe *                                                          │
│  ┌──────────────────────────────────────────────────┐            │
│  │ (●) Movie  (  ) Series  (  ) Anime              │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                  │
│  Judul *              [ Ada Apa Dengan Cinta?               ]    │
│  Rating (IMDb)        [ 8.6                                 ]    │
│  Tahun                [ 2002                                ]    │
│  Negara               [ Indonesia                    ▼      ]    │
│  Studio               [ Miles Films                         ]    │
│  Genre                [ Drama ✕ ] [ Romansa ✕ ] [+ tambah]      │
│  Klasifikasi Usia     [ R (13+)                      ▼      ]    │
│                                                                  │
│  ── Fields untuk Series & Anime ────────────────────            │
│  (muncul jika tipe = Series atau Anime)                          │
│                                                                  │
│  Total Episode        [ 62                                  ]    │
│  Total Season         [ 5                                   ]    │
│  (Season hanya untuk Series)                                     │
│                                                                  │
│  ── Status ─────────────────────────────────────────            │
│                                                                  │
│  ☐ Sudah ditonton                                                │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                  [ Batal ]         [ 💾 Simpan Cinema ]         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Modul Katalog Music

### Deskripsi

Modul Music mencatat koleksi musik pengguna — baik digital streaming maupun file lokal.

---

### 6.2.1 Skema Data Music

| Field | Nama Kolom DB | Tipe | Required | Keterangan |
|-------|--------------|------|----------|------------|
| Judul Lagu/Album | `title` | TEXT | ✅ | Nama trek atau album |
| Artis / Band | `artist` | TEXT | ❌ | Penyanyi, grup, komposer |
| Album | `album` | TEXT | ❌ | Nama album |
| Tahun Rilis | `year` | INTEGER | ❌ | Tahun peluncuran |
| Genre | `genre` | TEXT | ❌ | Pop, Rock, Jazz, J-Pop, dll |
| Platform / Format | `platform` | TEXT | ❌ | Spotify, YouTube Music, FLAC, dll |
| Ukuran File | `size_mb` | REAL | ❌ | Untuk koleksi lokal (MB) |
| Rating | `rating` | REAL | ❌ | Skor 0.0 — 10.0 |
| Favorit | `is_favorite` | BOOLEAN | ❌ | Checkbox status favorit |
| Catatan | `notes` | TEXT | ❌ | Catatan opsional (OST game/anime) |

### Platform/Format Badges

| Platform | Warna Badge | Hex Code |
|----------|-------------|----------|
| Spotify | Hijau | `#1DB954` |
| YouTube Music | Merah | `#FF0000` |
| Apple Music | Pink | `#FC3C44` |
| FLAC/Lossless | Emas | `#DAA520` |
| MP3 | Biru | `#0078D4` |
| CD/Vinyl | Abu-abu | `#6C757D` |

---

### 6.2.2 Wireframe — Data Grid Music (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌── Toolbar ──────────────────────────────────────────────────────┐        │
│  │  [+ Tambah Music]  [📥 Import]   🔍 Cari lagu/artis...         │        │
│  │  Genre: [ Semua ▼ ]  Platform: [ Semua ▼ ]  Fav: [ Semua ▼ ]   │        │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Data Grid ────────────────────────────────────────────────────┐        │
│  │ ☐ │ # │ Judul Lagu        │ Artis       │ Album     │ Year    │        │
│  │   │   │ Genre             │ Platform    │ Size      │ Rating  │ Fav   │
│  │───┼───┼───────────────────┼─────────────┼───────────┼─────────│        │
│  │ ☐ │ 1 │ Bohemian Rhapsody │ Queen       │ A Night   │ 1975    │        │
│  │   │   │ 🎸 Rock           │ 🟢 Spotify  │ —         │ ⭐ 10   │ ♥     │
│  │───┼───┼───────────────────┼─────────────┼───────────┼─────────│        │
│  │ ☐ │ 2 │ Weight of the     │ Keiichi     │ NieR:     │ 2017    │        │
│  │   │   │ World             │ Okabe       │ Automata  │         │        │
│  │   │   │ 🎼 OST/Soundtrack │ 🟡 FLAC     │ 45.2 MB   │ ⭐ 9.5  │ ♥     │
│  │───┼───┼───────────────────┼─────────────┼───────────┼─────────│        │
│  │ ☐ │ 3 │ Lemon             │ Kenshi      │ Single    │ 2018    │        │
│  │   │   │                   │ Yonezu      │           │         │        │
│  │   │   │ 🎌 J-Pop          │ 🟢 Spotify  │ —         │ ⭐ 8.5  │ ♡     │
│  │───┼───┼───────────────────┼─────────────┼───────────┼─────────│        │
│  │ ☐ │ 4 │ Terlalu Cinta     │ Rossa       │ Best of   │ 2005    │        │
│  │   │   │ 🎤 Pop            │ 🔵 MP3      │ 8.5 MB    │ ⭐ 7.0  │ ♡     │
│  │───┼───┼───────────────────┼─────────────┼───────────┼─────────│        │
│  │ ☐ │ 5 │ Dearly Beloved    │ Yoko        │ Kingdom   │ 2002    │        │
│  │   │   │                   │ Shimomura   │ Hearts    │         │        │
│  │   │   │ 🎼 OST/Soundtrack │ 🔴 YouTube  │ —         │ ⭐ 9.0  │ ♥     │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌── Footer ──────────────────────────────────────────────────────┐         │
│  │  ◀ 1 2 3 ... 50 ▶    Total: 1,245 tracks                     │         │
│  │  ♥ Favorit: 250 tracks                                        │         │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2.3 Wireframe — Card View Music (Mobile)

```
┌─────────────────────────────┐
│                              │
│  ┌── Music Card ──────────┐ │
│  │                         │ │
│  │  🎵 Bohemian Rhapsody   │ │
│  │                         │ │
│  │  ┌─────────────────────┐│ │
│  │  │ Queen               ││ │
│  │  │ Album: A Night at   ││ │
│  │  │ the Opera • 1975    ││ │
│  │  └─────────────────────┘│ │
│  │                         │ │
│  │  🎸 Rock   🟢 Spotify   │ │
│  │                         │ │
│  │  ⭐ 10.0     ♥ Favorit  │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
│  ┌── Music Card ──────────┐ │
│  │                         │ │
│  │  🎵 Weight of the       │ │
│  │     World               │ │
│  │                         │ │
│  │  ┌─────────────────────┐│ │
│  │  │ Keiichi Okabe       ││ │
│  │  │ Album: NieR:        ││ │
│  │  │ Automata OST • 2017 ││ │
│  │  └─────────────────────┘│ │
│  │                         │ │
│  │  🎼 OST    🟡 FLAC      │ │
│  │  📦 45.2 MB             │ │
│  │                         │ │
│  │  ⭐ 9.5      ♥ Favorit  │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
└─────────────────────────────┘
```

---

### 6.2.4 Form Tambah/Edit Music

```
┌── Modal: Tambah Music ──────────────────────────────────────────┐
│                                                           [  ✕ ]│
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  Judul Lagu/Album *   [ Weight of the World                ]    │
│  Artis / Band         [ Keiichi Okabe                       ]    │
│  Album                [ NieR: Automata OST                  ]    │
│  Tahun Rilis          [ 2017                                ]    │
│  Genre                [ OST/Soundtrack              ▼       ]    │
│  Platform / Format    [ FLAC/Lossless               ▼       ]    │
│  Ukuran File (MB)     [ 45.2                                ]    │
│                        (opsional, untuk koleksi lokal)            │
│  Rating               [ ⭐ ⭐ ⭐ ⭐ ⭐  9.5               ]    │
│                                                                  │
│  ☑ Tandai sebagai Favorit                                        │
│                                                                  │
│  Catatan (opsional)                                              │
│  ┌──────────────────────────────────────────────────┐            │
│  │ OST dari game NieR: Automata. Vocal oleh        │            │
│  │ J'Nique Nicole & Emi Evans.                      │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                  [ Batal ]         [ 💾 Simpan Music ]          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6.3 Filter Spesifikasi — Cinema & Music

### Filter Cinema

| Filter | Tipe Kontrol | Opsi |
|--------|-------------|------|
| Tipe | Tab bar | All, Movie, Series, Anime |
| Genre | Dropdown multi-select | Dari data yang ada |
| Negara | Dropdown | Dari data yang ada |
| Tahun | Range slider | Min–Max dari data |
| Rating IMDb | Range slider | 0.0 – 10.0 |
| Usia | Dropdown | SU, R(13+), D(13+), D(17+) |
| Status Tonton | Toggle | Semua / Sudah / Belum |
| Studio | Dropdown | Dari data yang ada |

### Filter Music

| Filter | Tipe Kontrol | Opsi |
|--------|-------------|------|
| Genre | Dropdown multi-select | Dari data yang ada |
| Platform | Dropdown | Spotify, YouTube, FLAC, dll |
| Tahun | Range slider | Min–Max dari data |
| Rating | Range slider | 0.0 – 10.0 |
| Favorit | Toggle | Semua / Favorit saja |
| Artis | Autocomplete search | Dari data yang ada |

---

*← Kembali ke [05-modul-katalog-games.md](./05-modul-katalog-games.md)  
Lanjut ke → [07-functional-requirements.md](./07-functional-requirements.md)*
