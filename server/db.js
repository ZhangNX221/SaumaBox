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
      type           TEXT NOT NULL CHECK(type IN ('PC', 'EMULATOR', 'RECOMP', 'MOBILE')),
      title          TEXT NOT NULL,
      year           INTEGER,
      release_date   TEXT DEFAULT '',
      genre          TEXT DEFAULT '',
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
      enhancements   TEXT DEFAULT '',
      completed      INTEGER NOT NULL DEFAULT 0,
      download_url   TEXT DEFAULT ''
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
      download_url   TEXT DEFAULT '',
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
      download_url TEXT DEFAULT '',
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

  // Migrasi kolom genre, release_date, dan completed pada tabel games jika belum ada
  const gameCols = database.prepare('PRAGMA table_info(games)').all().map(c => c.name);
  if (!gameCols.includes('genre')) {
    database.exec("ALTER TABLE games ADD COLUMN genre TEXT DEFAULT ''");
  }
  if (!gameCols.includes('release_date')) {
    database.exec("ALTER TABLE games ADD COLUMN release_date TEXT DEFAULT ''");
  }
  if (!gameCols.includes('completed')) {
    database.exec("ALTER TABLE games ADD COLUMN completed INTEGER NOT NULL DEFAULT 0");
  }
  database.exec("CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre)");
  database.exec("CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date)");
  database.exec("CREATE INDEX IF NOT EXISTS idx_games_completed ON games(completed)");

  // Migrasi tabel games untuk mendukung type 'MOBILE'
  const gamesTableSql = database.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='games'").get()?.sql || '';
  if (gamesTableSql && !gamesTableSql.includes('MOBILE')) {
    database.exec(`
      PRAGMA foreign_keys = OFF;
      CREATE TABLE games_migration_temp (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        type           TEXT NOT NULL CHECK(type IN ('PC', 'EMULATOR', 'RECOMP', 'MOBILE')),
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
      INSERT INTO games_migration_temp SELECT * FROM games;
      DROP TABLE games;
      ALTER TABLE games_migration_temp RENAME TO games;
      CREATE INDEX IF NOT EXISTS idx_games_type ON games(type);
      CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
      CREATE INDEX IF NOT EXISTS idx_games_year ON games(year);
      CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
      CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
      CREATE INDEX IF NOT EXISTS idx_games_console ON games(console);
      CREATE INDEX IF NOT EXISTS idx_games_price ON games(price);
      CREATE INDEX IF NOT EXISTS idx_games_type_year ON games(type, year DESC);
      PRAGMA foreign_keys = ON;
    `);
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

  // Jalankan skema & data master tambahan (taksonomi, moderasi, roles, API integration, seed sample data)
  const { setupExtendedSchema } = require('./db_schema');
  setupExtendedSchema(database);
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
