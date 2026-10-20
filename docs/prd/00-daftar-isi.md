# PRD — All-in-One Personal Media Catalog
## Daftar Isi & Navigasi Dokumen

| Versi   | Tanggal      | Status   |
|---------|-------------|----------|
| 1.0.0   | 2026-10-20  | Draft    |

---

## Ringkasan Produk

**Nama Produk:** SaumaBox — All-in-One Personal Media Catalog  
**Tagline:** Katalog pribadi untuk Games, Cinema & Music dalam satu platform.  
**Platform:** Web (Desktop & Mobile PWA)  
**Database:** SQLite  
**Target Pengguna:** Kolektor media digital (gamer, cinephile, audiophile) yang ingin mencatat, mengelola, dan mengekspor seluruh koleksi mereka secara offline-first.

---

## Struktur Dokumen PRD

Dokumen PRD ini dipecah menjadi beberapa file terpisah agar mudah dibaca dan di-maintain. Setiap file dibatasi 400–500 baris.

| No | File | Judul | Keterangan |
|----|------|-------|------------|
| 01 | [01-executive-summary.md](./01-executive-summary.md) | Executive Summary & User Persona | Visi produk, tujuan bisnis, target pengguna, dan persona utama |
| 02 | [02-information-architecture.md](./02-information-architecture.md) | Information Architecture & Navigasi | Sitemap, navigasi web vs mobile, PWA, dan wireframe layout |
| 03 | [03-halaman-publik-dan-login.md](./03-halaman-publik-dan-login.md) | Halaman Publik & Halaman Login | Spesifikasi halaman landing publik, login, dan registrasi beserta wireframe |
| 04 | [04-halaman-admin-dashboard.md](./04-halaman-admin-dashboard.md) | Halaman Admin & Dashboard | Spesifikasi panel admin, dashboard statistik, manajemen user beserta wireframe |
| 05 | [05-modul-katalog-games.md](./05-modul-katalog-games.md) | Modul Katalog Games | Spesifikasi lengkap 3 sub-kategori: PC Games, Emulator, Recomp & wireframe |
| 06 | [06-modul-katalog-cinema-music.md](./06-modul-katalog-cinema-music.md) | Modul Katalog Cinema & Music | Spesifikasi modul Cinema (Movie/Series/Anime) dan Music beserta wireframe |
| 07 | [07-functional-requirements.md](./07-functional-requirements.md) | Functional Requirements Detail | CRUD, filter/sort, auto-sum, quick-checkbox, dan fitur interaktif |
| 08 | [08-database-schema.md](./08-database-schema.md) | Database Schema (SQLite DDL) | CREATE TABLE, CREATE INDEX, relasi tabel, dan ERD |
| 09 | [09-import-export-backup.md](./09-import-export-backup.md) | Import/Export & Backup/Restore | Spesifikasi parser data, format file, alur backup/restore |
| 10 | [10-tech-stack-dan-deployment.md](./10-tech-stack-dan-deployment.md) | Tech Stack & Deployment | Rekomendasi teknologi, arsitektur sistem, Docker, dan self-hosted |

---

## Konvensi Dokumen

### Status Badge
- 🟢 `Implemented` — Fitur sudah selesai dibangun
- 🟡 `In Progress` — Fitur sedang dikerjakan
- 🔴 `Not Started` — Fitur belum dimulai
- ⚪ `Deferred` — Fitur ditunda ke versi selanjutnya

### Prioritas
- **P0** — Must Have (wajib ada di v1.0)
- **P1** — Should Have (sangat direkomendasikan)
- **P2** — Nice to Have (jika waktu memungkinkan)
- **P3** — Future (roadmap)

### Wireframe Legend
```
┌──────────┐  Box/Container
│          │
└──────────┘

[  Button  ]  Tombol aksi
(  Radio   )  Radio button
☐ Checkbox    Checkbox
─────────     Garis pemisah
▼             Dropdown
🔍            Pencarian
☰             Hamburger menu
←  →          Navigasi
```

---

## Changelog

| Versi | Tanggal     | Perubahan |
|-------|------------|-----------|
| 1.0.0 | 2026-10-20 | Initial draft — seluruh modul PRD |

---

*Dokumen ini dihasilkan berdasarkan [prompt_master_prd_katalog_media.md](../prompt_master_prd_katalog_media.md)*
