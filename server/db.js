const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DB_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DB_DIR, 'backups');
const DB_PATH = path.join(DB_DIR, 'saumabox.sqlite');

// Pastikan direktori data & backups tersedia
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

let db = null;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    initDb(db);
  }
  return db;
}

function initDb(database) {
  // Pragma konfigurasi SQLite WAL mode
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
  `);

  // Schema DDL sesuai PRD 08
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name  TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

    CREATE TABLE IF NOT EXISTS sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      token      TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS games (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      type           TEXT NOT NULL CHECK(type IN ('PC', 'EMULATOR', 'RECOMP')),
      title          TEXT NOT NULL,
      year           INTEGER,
      publisher      TEXT DEFAULT '',
      developer      TEXT DEFAULT '',
      size_gb        TEXT DEFAULT '',
      rating         REAL DEFAULT NULL,
      status         TEXT DEFAULT '',
      cover_url      TEXT DEFAULT '',
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
      platform       TEXT DEFAULT '',
      price          INTEGER DEFAULT 0,
      console        TEXT DEFAULT '',
      emulator       TEXT DEFAULT '',
      rom_format     TEXT DEFAULT '',
      port_year      INTEGER,
      port_developer TEXT DEFAULT '',
      port_version   TEXT DEFAULT '',
      enhancements   TEXT DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_games_type ON games(type);
    CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
    CREATE INDEX IF NOT EXISTS idx_games_year ON games(year);
    CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_games_console ON games(console);
    CREATE INDEX IF NOT EXISTS idx_games_price ON games(price);
    CREATE INDEX IF NOT EXISTS idx_games_type_year ON games(type, year DESC);

    CREATE TABLE IF NOT EXISTS cinema (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      type           TEXT NOT NULL CHECK(type IN ('MOVIE', 'SERIES', 'ANIME')),
      title          TEXT NOT NULL,
      rating         REAL DEFAULT NULL,
      year           INTEGER,
      country        TEXT DEFAULT '',
      studio         TEXT DEFAULT '',
      genre          TEXT DEFAULT '',
      age_rating     TEXT DEFAULT '',
      total_episodes INTEGER DEFAULT NULL,
      total_seasons  INTEGER DEFAULT NULL,
      watched        INTEGER NOT NULL DEFAULT 0,
      cover_url      TEXT DEFAULT '',
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cinema_type ON cinema(type);
    CREATE INDEX IF NOT EXISTS idx_cinema_title ON cinema(title);
    CREATE INDEX IF NOT EXISTS idx_cinema_year ON cinema(year);
    CREATE INDEX IF NOT EXISTS idx_cinema_genre ON cinema(genre);
    CREATE INDEX IF NOT EXISTS idx_cinema_watched ON cinema(watched);

    CREATE TABLE IF NOT EXISTS music (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      artist      TEXT DEFAULT '',
      album       TEXT DEFAULT '',
      year        INTEGER,
      genre       TEXT DEFAULT '',
      platform    TEXT DEFAULT '',
      size_mb     REAL DEFAULT NULL,
      rating      REAL DEFAULT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      notes       TEXT DEFAULT '',
      cover_url   TEXT DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_music_title ON music(title);
    CREATE INDEX IF NOT EXISTS idx_music_artist ON music(artist);
    CREATE INDEX IF NOT EXISTS idx_music_genre ON music(genre);
    CREATE INDEX IF NOT EXISTS idx_music_favorite ON music(is_favorite);

    CREATE TABLE IF NOT EXISTS app_settings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      key        TEXT NOT NULL UNIQUE,
      value      TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);

    CREATE TABLE IF NOT EXISTS activity_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      action      TEXT NOT NULL,
      module      TEXT NOT NULL,
      item_id     INTEGER,
      item_title  TEXT DEFAULT '',
      details     TEXT DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
  `);

  // Migrasi kolom cover_url untuk database yang sudah ada sebelumnya
  const mediaTables = ['games', 'cinema', 'music'];
  for (const table of mediaTables) {
    const cols = database.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (!cols.includes('cover_url')) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN cover_url TEXT DEFAULT ''`);
    }
  }

  // Default app settings
  const defaultSettings = [
    ['app_name', 'SaumaBox'],
    ['language', 'id'],
    ['theme', 'dark'],
    ['items_per_page', '25'],
    ['currency', 'IDR'],
    ['public_sharing_enabled', 'true'],
    ['public_games_enabled', 'true'],
    ['public_cinema_enabled', 'true'],
    ['public_music_enabled', 'true'],
    ['public_show_prices', 'true'],
    ['public_show_ratings', 'true'],
    ['last_backup_at', '']
  ];

  const insertSetting = database.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
  for (const [key, val] of defaultSettings) {
    insertSetting.run(key, val);
  }

  // Seed sample data jika database masih kosong, serta perbarui cover jika kosong
  seedSampleData(database);
}

function seedSampleData(database) {
  const gamesCount = database.prepare('SELECT COUNT(*) as count FROM games').get().count;
  if (gamesCount === 0) {
    const insertGame = database.prepare(`
      INSERT INTO games (type, title, year, publisher, developer, size_gb, rating, status, platform, price, console, emulator, rom_format, port_year, port_developer, port_version, enhancements, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // PC Games
    insertGame.run('PC', 'Far Cry New Dawn Ultimate', 2019, 'Ubisoft', 'Ubisoft Montreal', '40', 8.0, 'Purchase', 'Ubisoft', 169750, '', '', '', null, '', '', '', '/images/covers/far_cry.svg');
    insertGame.run('PC', 'It Takes Two', 2021, 'Electronic Arts (EA)', 'Hazelight Studios', '50', 9.5, 'Purchase', 'Steam', 479000, '', '', '', null, '', '', '', '/images/covers/it_takes_two.svg');
    insertGame.run('PC', 'Cyberpunk 2077', 2020, 'CD Projekt', 'CD Projekt Red', '70', 8.8, 'Purchase', 'GOG', 699000, '', '', '', null, '', '', '', '/images/covers/cyberpunk2077.svg');
    insertGame.run('PC', 'A Space for the Unbound', 2023, 'Toge Productions', 'Mojiken Studio', '2.5', 9.2, 'Purchase', 'Steam', 99000, '', '', '', null, '', '', '', '/images/covers/space_unbound.svg');
    insertGame.run('PC', 'Elden Ring', 2022, 'Bandai Namco', 'FromSoftware', '60', 9.8, 'Purchase', 'Steam', 599000, '', '', '', null, '', '', '', '/images/covers/elden_ring.jpg');
    insertGame.run('PC', 'Hollow Knight: Silksong', 2025, 'Team Cherry', 'Team Cherry', 'TBA', null, 'Wishlist', 'Steam', 0, '', '', '', null, '', '', '', '/images/covers/silksong.svg');

    // Emulator Games
    insertGame.run('EMULATOR', 'God of War II (USA)', 2007, 'Sony Computer Entertainment', 'Santa Monica Studio', '7.9', 9.6, 'Playable (60 FPS)', '', 0, 'PS2', 'PCSX2', '.iso', null, '', '', '', '/images/covers/god_of_war.svg');
    insertGame.run('EMULATOR', 'Persona 5 Royal (USA)', 2019, 'Atlus', 'P-Studio', '14.2', 9.5, 'Playable (60 FPS)', '', 0, 'Switch', 'Ryujinx', '.nsp', null, '', '', '', '/images/covers/persona5.svg');
    insertGame.run('EMULATOR', 'The Legend of Zelda: Breath of the Wild', 2017, 'Nintendo', 'Nintendo EPD', '13.5', 9.9, 'Completed', '', 0, 'Wii U', 'Cemu', '.wux', null, '', '', '', '/images/covers/zelda_botw.svg');
    insertGame.run('EMULATOR', 'Metal Gear Solid 3: Snake Eater', 2004, 'Konami', 'Konami Computer Entertainment', '4.1', 9.7, 'Playable (60 FPS)', '', 0, 'PS2', 'PCSX2', '.chd', null, '', '', '', '/images/covers/mgs3.svg');

    // Recomp Games
    insertGame.run('RECOMP', 'Ship of Harkinian (Ocarina of Time)', 1998, 'Nintendo', 'Nintendo EAD', '1.2', 9.9, 'Installed', '', 0, 'N64', '', '', 2022, 'Harbour Masters', 'v8.0.5', 'High FPS (60/120+), Ultrawide Support, HD Texture Pack', '/images/covers/ship_of_harkinian.svg');
    insertGame.run('RECOMP', 'OpenGOAL: Jak and Daxter', 2001, 'Sony Computer Entertainment', 'Naughty Dog', '2.1', 9.4, 'Completed', '', 0, 'PS2', '', '', 2023, 'OpenGOAL Team', 'v1.2.0', 'Ultrawide Support, 120 FPS, Custom Texture', '/images/covers/opengoal.svg');
    insertGame.run('RECOMP', 'Super Mario 64 PC Port', 1996, 'Nintendo', 'Nintendo EAD', '0.8', 9.6, 'Installed', '', 0, 'N64', '', '', 2020, 'SM64 Decomp Team', 'Render96 v3.1', 'HD Model Pack, Ray Tracing, 60 FPS', '/images/covers/mario64.svg');
  }

  const cinemaCount = database.prepare('SELECT COUNT(*) as count FROM cinema').get().count;
  if (cinemaCount === 0) {
    const insertCinema = database.prepare(`
      INSERT INTO cinema (type, title, rating, year, country, studio, genre, age_rating, total_episodes, total_seasons, watched, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCinema.run('MOVIE', '22 Menit', 6.6, 2018, 'Indonesia', 'Buttonijo Games', 'Aksi, Drama, Thriller', 'D (13+)', null, null, 1, '/images/covers/menit22.svg');
    insertCinema.run('MOVIE', '3 Srikandi', 7.1, 2016, 'Indonesia', 'MVP Pictures', 'Drama, Biografi, Olahraga', 'SU (Semua Umur)', null, null, 1, '/images/covers/srikandi3.svg');
    insertCinema.run('MOVIE', 'Ada Apa Dengan Cinta?', 7.7, 2002, 'Indonesia', 'Miles Films', 'Drama, Romansa', 'R (13+)', null, null, 1, '/images/covers/ada_apa_cinta.svg');
    insertCinema.run('ANIME', 'Attack on Titan: The Final Season', 9.0, 2020, 'Jepang', 'MAPPA', 'Aksi, Fantasi, Drama', 'D (17+)', 28, null, 1, '/images/covers/aot.svg');
    insertCinema.run('ANIME', 'Jujutsu Kaisen', 8.6, 2020, 'Jepang', 'MAPPA', 'Aksi, Supernatural, Shounen', 'D (17+)', 24, null, 1, '/images/covers/jujutsu_kaisen.svg');
    insertCinema.run('SERIES', 'Breaking Bad', 9.5, 2008, 'Amerika Serikat', 'High Bridge Productions', 'Kejahatan, Drama, Thriller', 'D (17+)', 62, 5, 1, '/images/covers/breaking_bad.jpg');
  }

  const musicCount = database.prepare('SELECT COUNT(*) as count FROM music').get().count;
  if (musicCount === 0) {
    const insertMusic = database.prepare(`
      INSERT INTO music (title, artist, album, year, genre, platform, size_mb, rating, is_favorite, notes, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMusic.run('Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 1975, 'Rock', 'FLAC/Lossless', 48.2, 10.0, 1, 'Masterpiece classic', '/images/covers/bohemian_rhapsody.jpg');
    insertMusic.run('Hikaru Nara', 'Goose house', 'Milk', 2014, 'J-Pop, Anime OST', 'Spotify', 11.4, 9.2, 1, 'Your Lie in April OP', '/images/covers/hikaru_nara.svg');
    insertMusic.run('Gurenge', 'LiSA', 'Leo-Nine', 2019, 'J-Rock, Anime OST', 'Apple Music', 10.2, 9.0, 1, 'Demon Slayer OP', '/images/covers/gurenge.svg');
    insertMusic.run('Time', 'Hans Zimmer', 'Inception OST', 2010, 'Orkestra / Soundtrack', 'FLAC/Lossless', 35.8, 9.8, 1, 'Christopher Nolan film score', '/images/covers/time_zimmer.svg');
  }

  // Backfill cover_url untuk data yang sudah ada di database lokal
  const gameCovers = {
    'Elden Ring': '/images/covers/elden_ring.jpg',
    'Cyberpunk 2077': '/images/covers/cyberpunk2077.svg',
    'Far Cry New Dawn Ultimate': '/images/covers/far_cry.svg',
    'It Takes Two': '/images/covers/it_takes_two.svg',
    'A Space for the Unbound': '/images/covers/space_unbound.svg',
    'Hollow Knight: Silksong': '/images/covers/silksong.svg',
    'God of War II (USA)': '/images/covers/god_of_war.svg',
    'Persona 5 Royal (USA)': '/images/covers/persona5.svg',
    'The Legend of Zelda: Breath of the Wild': '/images/covers/zelda_botw.svg',
    'Metal Gear Solid 3: Snake Eater': '/images/covers/mgs3.svg',
    'Ship of Harkinian (Ocarina of Time)': '/images/covers/ship_of_harkinian.svg',
    'OpenGOAL: Jak and Daxter': '/images/covers/opengoal.svg',
    'Super Mario 64 PC Port': '/images/covers/mario64.svg'
  };
  const updateGameCover = database.prepare("UPDATE games SET cover_url = ? WHERE title = ? AND (cover_url IS NULL OR cover_url = '')");
  for (const [title, url] of Object.entries(gameCovers)) {
    updateGameCover.run(url, title);
  }

  const cinemaCovers = {
    'Breaking Bad': '/images/covers/breaking_bad.jpg',
    'Attack on Titan: The Final Season': '/images/covers/aot.svg',
    'Jujutsu Kaisen': '/images/covers/jujutsu_kaisen.svg',
    'Ada Apa Dengan Cinta?': '/images/covers/ada_apa_cinta.svg',
    '22 Menit': '/images/covers/menit22.svg',
    '3 Srikandi': '/images/covers/srikandi3.svg'
  };
  const updateCinemaCover = database.prepare("UPDATE cinema SET cover_url = ? WHERE title = ? AND (cover_url IS NULL OR cover_url = '')");
  for (const [title, url] of Object.entries(cinemaCovers)) {
    updateCinemaCover.run(url, title);
  }

  const musicCovers = {
    'Bohemian Rhapsody': '/images/covers/bohemian_rhapsody.jpg',
    'Hikaru Nara': '/images/covers/hikaru_nara.svg',
    'Gurenge': '/images/covers/gurenge.svg',
    'Time': '/images/covers/time_zimmer.svg'
  };
  const updateMusicCover = database.prepare("UPDATE music SET cover_url = ? WHERE title = ? AND (cover_url IS NULL OR cover_url = '')");
  for (const [title, url] of Object.entries(musicCovers)) {
    updateMusicCover.run(url, title);
  }
}

function logActivity(database, action, module, itemId, itemTitle, details = '') {
  try {
    const stmt = database.prepare(`
      INSERT INTO activity_log (action, module, item_id, item_title, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(action, module, itemId || null, itemTitle || '', typeof details === 'object' ? JSON.stringify(details) : String(details));
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = {
  getDb,
  logActivity,
  DB_PATH,
  DB_DIR,
  BACKUP_DIR
};
