# PRD 08 — Database Schema (SQLite DDL)

> **Dokumen:** 08 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 8.1 Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ERD: SaumaBox Database                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │     users         │                                                   │
│  ├──────────────────┤                                                   │
│  │ PK id            │                                                   │
│  │    username      │                                                   │
│  │    password_hash │                                                   │
│  │    display_name  │                                                   │
│  │    created_at    │                                                   │
│  │    updated_at    │                                                   │
│  └──────────────────┘                                                   │
│                                                                          │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐     │
│  │     games         │   │     cinema        │   │     music         │     │
│  ├──────────────────┤   ├──────────────────┤   ├──────────────────┤     │
│  │ PK id            │   │ PK id            │   │ PK id            │     │
│  │    type          │   │    type          │   │    title         │     │
│  │    title         │   │    title         │   │    artist        │     │
│  │    year          │   │    rating        │   │    album         │     │
│  │    publisher     │   │    year          │   │    year          │     │
│  │    developer     │   │    country       │   │    genre         │     │
│  │    size_gb       │   │    studio        │   │    platform      │     │
│  │    rating        │   │    genre         │   │    size_mb       │     │
│  │    platform      │   │    age_rating    │   │    rating        │     │
│  │    status        │   │    total_episodes│   │    is_favorite   │     │
│  │    price         │   │    total_seasons │   │    notes         │     │
│  │    console       │   │    watched       │   │    created_at    │     │
│  │    emulator      │   │    created_at    │   │    updated_at    │     │
│  │    rom_format    │   │    updated_at    │   └──────────────────┘     │
│  │    port_year     │   └──────────────────┘                            │
│  │    port_developer│                                                   │
│  │    port_version  │   ┌──────────────────┐   ┌──────────────────┐     │
│  │    enhancements  │   │   app_settings    │   │  activity_log    │     │
│  │    created_at    │   ├──────────────────┤   ├──────────────────┤     │
│  │    updated_at    │   │ PK id            │   │ PK id            │     │
│  └──────────────────┘   │    key           │   │    action        │     │
│                          │    value         │   │    module        │     │
│                          │    updated_at    │   │    item_id       │     │
│                          └──────────────────┘   │    item_title    │     │
│                                                  │    details       │     │
│  ┌──────────────────┐                            │    created_at    │     │
│  │    sessions       │                            └──────────────────┘     │
│  ├──────────────────┤                                                   │
│  │ PK id            │                                                   │
│  │ FK user_id       │──── references users.id                          │
│  │    token         │                                                   │
│  │    expires_at    │                                                   │
│  │    created_at    │                                                   │
│  └──────────────────┘                                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8.2 Pragma & Database Configuration

```sql
-- ============================================================
-- SaumaBox Database Configuration
-- Engine: SQLite 3.x
-- File: saumabox.sqlite
-- ============================================================

-- Performance & Safety Pragmas
PRAGMA journal_mode = WAL;          -- Write-Ahead Logging untuk concurrency
PRAGMA synchronous = NORMAL;        -- Balance antara speed & safety
PRAGMA cache_size = -64000;         -- 64MB cache
PRAGMA foreign_keys = ON;           -- Enforce foreign key constraints
PRAGMA temp_store = MEMORY;         -- Temporary tables in memory
PRAGMA mmap_size = 268435456;       -- 256MB memory-mapped I/O
PRAGMA page_size = 4096;            -- 4KB page size (default)
PRAGMA busy_timeout = 5000;         -- 5 detik timeout saat locked
```

---

## 8.3 CREATE TABLE Statements

### 8.3.1 Tabel `users`

```sql
-- ============================================================
-- Tabel: users
-- Menyimpan data akun admin
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    display_name    TEXT    DEFAULT '',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

### 8.3.2 Tabel `sessions`

```sql
-- ============================================================
-- Tabel: sessions
-- Menyimpan session login admin
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    token           TEXT    NOT NULL UNIQUE,
    expires_at      TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### 8.3.3 Tabel `games`

```sql
-- ============================================================
-- Tabel: games
-- Menyimpan katalog games (PC, Emulator, Recomp)
-- Kolom type menentukan sub-kategori: 'PC', 'EMULATOR', 'RECOMP'
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Common fields (semua sub-kategori)
    type            TEXT    NOT NULL CHECK(type IN ('PC', 'EMULATOR', 'RECOMP')),
    title           TEXT    NOT NULL,
    year            INTEGER,
    publisher       TEXT    DEFAULT '',
    developer       TEXT    DEFAULT '',
    size_gb         TEXT    DEFAULT '',       -- TEXT karena bisa berisi 'TBA'
    rating          REAL    DEFAULT NULL,
    status          TEXT    DEFAULT '',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),

    -- Fields khusus PC Games
    platform        TEXT    DEFAULT '',       -- Steam, Epic, GOG, Ubisoft, Crack
    price           INTEGER DEFAULT 0,        -- Harga dalam Rupiah (integer)

    -- Fields khusus Emulator
    console         TEXT    DEFAULT '',       -- PS1, PS2, N64, Switch, dll
    emulator        TEXT    DEFAULT '',       -- PCSX2, RPCS3, Yuzu, dll
    rom_format      TEXT    DEFAULT '',       -- .iso, .chd, .nsp, .xci, dll

    -- Fields khusus Recomp
    port_year       INTEGER,                  -- Tahun versi port dirilis
    port_developer  TEXT    DEFAULT '',       -- Tim porting / komunitas
    port_version    TEXT    DEFAULT '',       -- v8.0.5, Nightly, dll
    enhancements    TEXT    DEFAULT ''        -- Comma-separated tags
);

-- Index untuk query umum
CREATE INDEX idx_games_type ON games(type);
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_year ON games(year);
CREATE INDEX idx_games_platform ON games(platform);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_console ON games(console);
CREATE INDEX idx_games_emulator ON games(emulator);
CREATE INDEX idx_games_price ON games(price);

-- Index composite untuk filter + sort yang sering digunakan
CREATE INDEX idx_games_type_year ON games(type, year DESC);
CREATE INDEX idx_games_type_platform ON games(type, platform);
CREATE INDEX idx_games_type_status ON games(type, status);
CREATE INDEX idx_games_type_console ON games(type, console);
```

### 8.3.4 Tabel `cinema`

```sql
-- ============================================================
-- Tabel: cinema
-- Menyimpan katalog cinema (Movie, Series, Anime)
-- Kolom type menentukan sub-kategori: 'MOVIE', 'SERIES', 'ANIME'
-- ============================================================
CREATE TABLE IF NOT EXISTS cinema (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    type            TEXT    NOT NULL CHECK(type IN ('MOVIE', 'SERIES', 'ANIME')),
    title           TEXT    NOT NULL,
    rating          REAL    DEFAULT NULL,      -- Rating IMDb (6.6, 7.1, 8.6)
    year            INTEGER,
    country         TEXT    DEFAULT '',
    studio          TEXT    DEFAULT '',
    genre           TEXT    DEFAULT '',        -- Comma-separated: "Aksi, Drama"
    age_rating      TEXT    DEFAULT '',        -- SU, R (13+), D (17+)
    total_episodes  INTEGER DEFAULT NULL,      -- Untuk Series & Anime
    total_seasons   INTEGER DEFAULT NULL,      -- Untuk Series
    watched         INTEGER NOT NULL DEFAULT 0, -- 0 = belum, 1 = sudah
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index
CREATE INDEX idx_cinema_type ON cinema(type);
CREATE INDEX idx_cinema_title ON cinema(title);
CREATE INDEX idx_cinema_year ON cinema(year);
CREATE INDEX idx_cinema_country ON cinema(country);
CREATE INDEX idx_cinema_genre ON cinema(genre);
CREATE INDEX idx_cinema_watched ON cinema(watched);
CREATE INDEX idx_cinema_rating ON cinema(rating);

-- Index composite
CREATE INDEX idx_cinema_type_year ON cinema(type, year DESC);
CREATE INDEX idx_cinema_type_watched ON cinema(type, watched);
```

### 8.3.5 Tabel `music`

```sql
-- ============================================================
-- Tabel: music
-- Menyimpan katalog music
-- ============================================================
CREATE TABLE IF NOT EXISTS music (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    artist          TEXT    DEFAULT '',
    album           TEXT    DEFAULT '',
    year            INTEGER,
    genre           TEXT    DEFAULT '',
    platform        TEXT    DEFAULT '',       -- Spotify, YouTube Music, FLAC, dll
    size_mb         REAL    DEFAULT NULL,     -- Ukuran file lokal (MB)
    rating          REAL    DEFAULT NULL,
    is_favorite     INTEGER NOT NULL DEFAULT 0, -- 0 = tidak, 1 = favorit
    notes           TEXT    DEFAULT '',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index
CREATE INDEX idx_music_title ON music(title);
CREATE INDEX idx_music_artist ON music(artist);
CREATE INDEX idx_music_album ON music(album);
CREATE INDEX idx_music_year ON music(year);
CREATE INDEX idx_music_genre ON music(genre);
CREATE INDEX idx_music_platform ON music(platform);
CREATE INDEX idx_music_favorite ON music(is_favorite);
CREATE INDEX idx_music_rating ON music(rating);
```

### 8.3.6 Tabel `app_settings`

```sql
-- ============================================================
-- Tabel: app_settings
-- Menyimpan konfigurasi aplikasi (key-value pair)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    key             TEXT    NOT NULL UNIQUE,
    value           TEXT    DEFAULT '',
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index
CREATE UNIQUE INDEX idx_settings_key ON app_settings(key);

-- Default settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES
    ('app_name', 'SaumaBox'),
    ('language', 'id'),
    ('theme', 'dark'),
    ('items_per_page', '25'),
    ('currency', 'IDR'),
    ('public_sharing_enabled', 'false'),
    ('public_games_enabled', 'false'),
    ('public_cinema_enabled', 'false'),
    ('public_music_enabled', 'false'),
    ('public_show_prices', 'false'),
    ('public_show_ratings', 'true'),
    ('last_backup_at', ''),
    ('auto_backup_enabled', 'false'),
    ('auto_backup_interval', 'weekly');
```

### 8.3.7 Tabel `activity_log`

```sql
-- ============================================================
-- Tabel: activity_log
-- Menyimpan log aktivitas admin
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    action          TEXT    NOT NULL,         -- CREATE, UPDATE, DELETE, IMPORT, etc
    module          TEXT    NOT NULL,         -- games, cinema, music, settings
    item_id         INTEGER,                 -- ID item yang terkena aksi (nullable)
    item_title      TEXT    DEFAULT '',       -- Judul item untuk display
    details         TEXT    DEFAULT '',       -- JSON detail perubahan
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index
CREATE INDEX idx_activity_module ON activity_log(module);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
```

---

## 8.4 Trigger — Auto Update `updated_at`

```sql
-- ============================================================
-- Triggers: Auto-update updated_at timestamp
-- ============================================================

CREATE TRIGGER trg_games_updated_at
AFTER UPDATE ON games
FOR EACH ROW
BEGIN
    UPDATE games SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER trg_cinema_updated_at
AFTER UPDATE ON cinema
FOR EACH ROW
BEGIN
    UPDATE cinema SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER trg_music_updated_at
AFTER UPDATE ON music
FOR EACH ROW
BEGIN
    UPDATE music SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER trg_settings_updated_at
AFTER UPDATE ON app_settings
FOR EACH ROW
BEGIN
    UPDATE app_settings SET updated_at = datetime('now') WHERE id = NEW.id;
END;
```

---

## 8.5 Query Contoh (Common Queries)

### Dashboard Stats
```sql
-- Total per modul
SELECT
    (SELECT COUNT(*) FROM games) AS total_games,
    (SELECT COUNT(*) FROM cinema) AS total_cinema,
    (SELECT COUNT(*) FROM music) AS total_music;

-- Total spending (PC Games purchased)
SELECT COALESCE(SUM(price), 0) AS total_spending
FROM games
WHERE type = 'PC' AND status = 'Purchase' AND price > 0;
```

### Filtered Games with Aggregates
```sql
-- PC Games filtered by platform, with price sum
SELECT *, COUNT(*) OVER() AS total_count
FROM games
WHERE type = 'PC'
  AND platform = 'Steam'
  AND status = 'Purchase'
ORDER BY year DESC
LIMIT 25 OFFSET 0;

-- Aggregate for footer
SELECT
    SUM(CASE WHEN price > 0 THEN price ELSE 0 END) AS sum_price,
    COUNT(*) AS total_filtered
FROM games
WHERE type = 'PC'
  AND platform = 'Steam'
  AND status = 'Purchase';
```

### Cinema Watch Progress
```sql
-- Watch progress per type
SELECT
    type,
    COUNT(*) AS total,
    SUM(watched) AS watched_count,
    COUNT(*) - SUM(watched) AS unwatched_count,
    ROUND(SUM(watched) * 100.0 / COUNT(*), 1) AS watch_percentage
FROM cinema
GROUP BY type;
```

---

*← Kembali ke [07-functional-requirements.md](./07-functional-requirements.md)  
Lanjut ke → [09-import-export-backup.md](./09-import-export-backup.md)*
