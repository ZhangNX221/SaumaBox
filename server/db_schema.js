// ============================================================
// SaumaBox — Database Schema Extension & Seed Data
// ============================================================

function setupExtendedSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS genres (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      media_type  TEXT NOT NULL DEFAULT 'all',
      description TEXT DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS creators (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      role       TEXT NOT NULL,
      bio        TEXT DEFAULT '',
      photo_url  TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS platforms (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      category   TEXT NOT NULL DEFAULT 'Game Platform',
      icon_url   TEXT DEFAULT '',
      notes      TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ownership_statuses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      badge_color TEXT DEFAULT 'badge-neutral',
      description TEXT DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      media_type TEXT NOT NULL CHECK(media_type IN ('games', 'cinema', 'music')),
      media_id   INTEGER NOT NULL,
      user_name  TEXT NOT NULL DEFAULT 'Pengunjung',
      rating     REAL NOT NULL DEFAULT 5.0,
      comment    TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      media_type TEXT NOT NULL,
      media_id   INTEGER,
      user_name  TEXT NOT NULL DEFAULT 'Pengguna',
      reason     TEXT NOT NULL,
      details    TEXT DEFAULT '',
      status     TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'resolved', 'dismissed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrasi kolom tambahan tabel games
  const gameCols = database.prepare('PRAGMA table_info(games)').all().map(c => c.name);
  if (!gameCols.includes('system_requirements')) database.exec("ALTER TABLE games ADD COLUMN system_requirements TEXT DEFAULT ''");
  if (!gameCols.includes('trailer_url')) database.exec("ALTER TABLE games ADD COLUMN trailer_url TEXT DEFAULT ''");
  if (!gameCols.includes('screenshot_url')) database.exec("ALTER TABLE games ADD COLUMN screenshot_url TEXT DEFAULT ''");
  if (!gameCols.includes('completed')) database.exec("ALTER TABLE games ADD COLUMN completed INTEGER NOT NULL DEFAULT 0");
  if (!gameCols.includes('download_url')) database.exec("ALTER TABLE games ADD COLUMN download_url TEXT DEFAULT ''");

  // Migrasi kolom tambahan tabel cinema
  const cinemaCols = database.prepare('PRAGMA table_info(cinema)').all().map(c => c.name);
  if (!cinemaCols.includes('duration_mins')) database.exec("ALTER TABLE cinema ADD COLUMN duration_mins INTEGER DEFAULT NULL");
  if (!cinemaCols.includes('director')) database.exec("ALTER TABLE cinema ADD COLUMN director TEXT DEFAULT ''");
  if (!cinemaCols.includes('cast')) database.exec("ALTER TABLE cinema ADD COLUMN cast TEXT DEFAULT ''");
  if (!cinemaCols.includes('synopsis')) database.exec("ALTER TABLE cinema ADD COLUMN synopsis TEXT DEFAULT ''");
  if (!cinemaCols.includes('trailer_url')) database.exec("ALTER TABLE cinema ADD COLUMN trailer_url TEXT DEFAULT ''");
  if (!cinemaCols.includes('download_url')) database.exec("ALTER TABLE cinema ADD COLUMN download_url TEXT DEFAULT ''");

  // Migrasi kolom tambahan tabel music
  const musicCols = database.prepare('PRAGMA table_info(music)').all().map(c => c.name);
  if (!musicCols.includes('duration_secs')) database.exec("ALTER TABLE music ADD COLUMN duration_secs INTEGER DEFAULT NULL");
  if (!musicCols.includes('lyrics')) database.exec("ALTER TABLE music ADD COLUMN lyrics TEXT DEFAULT ''");
  if (!musicCols.includes('stream_url')) database.exec("ALTER TABLE music ADD COLUMN stream_url TEXT DEFAULT ''");
  if (!musicCols.includes('download_url')) database.exec("ALTER TABLE music ADD COLUMN download_url TEXT DEFAULT ''");

  // Migrasi kolom tambahan tabel users
  const userCols = database.prepare('PRAGMA table_info(users)').all().map(c => c.name);
  if (!userCols.includes('role')) database.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'super_admin'");
  if (!userCols.includes('status')) database.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
  if (!userCols.includes('email')) database.exec("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''");

  // App settings untuk Integrasi API & Layout
  const extraSettings = [
    ['tmdb_api_key', ''],
    ['igdb_client_id', ''],
    ['igdb_client_secret', ''],
    ['spotify_client_id', ''],
    ['spotify_client_secret', ''],
    ['app_logo_url', '/images/logo.svg'],
    ['banner_title', 'Katalog Multi-Media Modern & Eksklusif'],
    ['banner_subtitle', 'Satu tempat terpadu mengelola koleksi game PC & konsol, film layar lebar, serial anime, dan trek musik lossless kesayangan Anda.']
  ];
  const insertSetting = database.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
  for (const [key, val] of extraSettings) {
    insertSetting.run(key, val);
  }

  seedExtendedData(database);
}

function seedExtendedData(database) {
  // 1. Seed Genres
  const genreCount = database.prepare('SELECT COUNT(*) as c FROM genres').get().c;
  if (genreCount === 0) {
    const insertGenre = database.prepare('INSERT INTO genres (name, media_type, description) VALUES (?, ?, ?)');
    insertGenre.run('Action RPG', 'game', 'Game bermain peran berfokus pertarungan dinamis');
    insertGenre.run('Souls-like', 'game', 'Sub-genre RPG aksi tingkat kesulitan tinggi dan eksplorasi mendalam');
    insertGenre.run('Open World', 'game', 'Dunia terbuka luas dengan kebebasan eksplorasi penuh');
    insertGenre.run('JRPG / Turn-Based', 'game', 'Game RPG khas Jepang dengan sistem pertarungan giliran');
    insertGenre.run('Sci-Fi / Cyberpunk', 'cinema', 'Fiksi ilmiah masa depan dengan teknologi mutakhir dan distopia');
    insertGenre.run('Drama / Romance', 'cinema', 'Kisah emosional, relasi antar tokoh, dan drama mendalam');
    insertGenre.run('Shounen Anime', 'cinema', 'Animasi aksi petualangan dan kepahlawanan penuh semangat');
    insertGenre.run('Rock / Hard Rock', 'music', 'Musik rock klasik, distorsi gitar, dan vokal bertenaga');
    insertGenre.run('J-Pop / Anime OST', 'music', 'Musik pop Jepang dan lagu pembuka/penutup anime populer');
    insertGenre.run('Orchestral / Film Score', 'music', 'Komposisi orkestra megah pengiring film layar lebar');
  }

  // 2. Seed Creators & Tokoh
  const creatorCount = database.prepare('SELECT COUNT(*) as c FROM creators').get().c;
  if (creatorCount === 0) {
    const insertCreator = database.prepare('INSERT INTO creators (name, role, bio, photo_url) VALUES (?, ?, ?, ?)');
    insertCreator.run('Hidetaka Miyazaki', 'Developer / Game Director', 'Presiden FromSoftware, kreator seri Dark Souls, Bloodborne, dan Elden Ring.', '');
    insertCreator.run('Keanu Reeves', 'Aktor', 'Aktor legendaris membintangi film The Matrix, John Wick, dan pemeran Johnny Silverhand di Cyberpunk 2077.', '');
    insertCreator.run('Christopher Nolan', 'Sutradara', 'Sutradara visioner di balik film Inception, The Dark Knight Trilogy, Interstellar, dan Oppenheimer.', '');
    insertCreator.run('Hans Zimmer', 'Komposer', 'Komposer pemenang Academy Award pencipta skor legendaris Inception, Interstellar, Gladiator, dan Dune.', '');
    insertCreator.run('Freddie Mercury & Queen', 'Musisi / Band', 'Band rock legendaris asal Inggris yang mempopulerkan Bohemian Rhapsody dan We Will Rock You.', '');
    insertCreator.run('MAPPA Studio', 'Studio Animasi', 'Studio animasi terkemuka asal Jepang penggarap Attack on Titan Final Season, Jujutsu Kaisen, dan Chainsaw Man.', '');
  }

  // 3. Seed Platform & Media
  const insertPlat = database.prepare('INSERT OR IGNORE INTO platforms (name, category, icon_url, notes) VALUES (?, ?, ?, ?)');
  insertPlat.run('Steam', 'Game Platform', '', 'Etalase digital game PC terbesar dari Valve');
  insertPlat.run('GOG', 'Game Platform', '', 'Platform digital DRM-Free oleh CD Projekt');
  insertPlat.run('EGS', 'Game Platform', '', 'Epic Games Store - Etalase digital dan launcher game PC');
  insertPlat.run('Ubisoft', 'Game Platform', '', 'Ubisoft Connect - Platform resmi game Ubisoft');
  insertPlat.run('EA Origin', 'Game Platform', '', 'EA App / Origin - Platform resmi game Electronic Arts');
  insertPlat.run('PlayStation 5', 'Game Platform', '', 'Konsol generasi terkini Sony Interactive Entertainment');
  insertPlat.run('Nintendo Switch', 'Game Platform', '', 'Konsol hibrida genggam dan rumahan Nintendo');
  insertPlat.run('Android / iOS', 'Game Platform', '', 'Platform sistem operasi mobile smartphone & tablet');
  insertPlat.run('4K Ultra HD BluRay', 'Audio/Video Format', '', 'Format video fisik resolusi 3840x2160 HDR');
  insertPlat.run('FLAC (24-bit Lossless)', 'Audio/Video Format', '', 'Format audio digital kompresi tanpa kehilangan detail frekuensi');
  insertPlat.run('Spotify', 'Distributor / Lisensi', '', 'Layanan streaming musik on-demand global');

  // 4. Seed Status Kepemilikan (Ownership Statuses)
  const insertStatus = database.prepare('INSERT OR IGNORE INTO ownership_statuses (name, badge_color, description) VALUES (?, ?, ?)');
  insertStatus.run('Purchase', 'badge-success', 'Game dibeli secara resmi dan menjadi milik akun');
  insertStatus.run('Free', 'badge-purple', 'Game gratis permanen (F2P / Free-to-Play)');
  insertStatus.run('Free Ubisoft', 'badge-ubisoft', 'Game klaim gratis giveaway resmi dari Ubisoft Connect');
  insertStatus.run('Free EGS', 'badge-epic', 'Game klaim gratis mingguan dari Epic Games Store');
  insertStatus.run('Crack', 'badge-repack', 'Game bajakan / repack / non-original');
  insertStatus.run('Link Ubisoft', 'badge-ubisoft', 'Tautan aktivasi atau integrasi akun Ubisoft');
  insertStatus.run('Link EGS', 'badge-epic', 'Tautan aktivasi atau integrasi akun Epic Games Store');
  insertStatus.run('Link Steam', 'badge-steam', 'Tautan aktivasi atau integrasi akun Steam');
  insertStatus.run('Wishlist', 'badge-info', 'Daftar keinginan game yang ingin dibeli atau dimainkan nanti');

  // 4. Seed Reviews (Moderasi)
  const reviewCount = database.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
  if (reviewCount === 0) {
    const insertReview = database.prepare('INSERT INTO reviews (media_type, media_id, user_name, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?)');
    insertReview.run('games', 5, 'Rian_Gamer', 10.0, 'Elden Ring adalah mahakarya soulslike terbaik yang pernah dibuat FromSoftware. Dunia The Lands Between begitu magis dan penuh rahasia.', 'approved');
    insertReview.run('games', 3, 'Neo2077', 9.0, 'Night City terasa sangat hidup setelah update 2.0 dan Phantom Liberty. Cerita Johnny Silverhand luar biasa mendalam.', 'approved');
    insertReview.run('cinema', 6, 'Cinemania', 9.8, 'Breaking Bad adalah standar emas serial televisi. Perkembangan karakter Walter White sungguh tidak ada tandingannya.', 'approved');
    insertReview.run('music', 1, 'RockFan', 10.0, 'Bohemian Rhapsody tidak akan pernah lekang oleh waktu. Vokal Freddie Mercury di bridge opera sangat ikonik.', 'approved');
    insertReview.run('games', 2, 'SpamBot99', 1.0, 'Kunjungi situs xyz-gratis-voucher.com sekarang juga untuk free gift card!', 'pending');
    insertReview.run('cinema', 4, 'BudiAnime', 8.5, 'Animasi MAPPA di Shingeki no Kyojin episode klimaks sangat memukau, tapi alur di babak pertengahan terasa agak cepat.', 'pending');
  }

  // 5. Seed Reports (Aduan Masuk)
  const reportCount = database.prepare('SELECT COUNT(*) as c FROM reports').get().c;
  if (reportCount === 0) {
    const insertReport = database.prepare('INSERT INTO reports (media_type, media_id, user_name, reason, details, status) VALUES (?, ?, ?, ?, ?, ?)');
    insertReport.run('games', 1, 'GamerSejati', 'Spesifikasi Sistem Kurang Lengkap', 'RAM rekomendasi belum tercantum pada tab PC Game Far Cry New Dawn.', 'open');
    insertReport.run('reviews', 5, 'ModeratorBot', 'Komentar Terindikasi Spam Komersial', 'Ulasan mengandung tautan eksternal promosi yang mencurigakan.', 'open');
    insertReport.run('cinema', 1, 'Andi_Film', 'Tahun Rilis Keliru', 'Film 22 Menit tayang perdana tahun 2018 sudah diperbaiki.', 'resolved');
  }

  // 6. Seed Sample Users jika belum ada member tambahan
  const userCount = database.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount <= 1) {
    const { hashPassword } = require('./auth');
    const hash = hashPassword('editor123');
    const insertUser = database.prepare('INSERT OR IGNORE INTO users (username, password_hash, display_name, role, status, email) VALUES (?, ?, ?, ?, ?, ?)');
    insertUser.run('editor_game', hash, 'Editor Game', 'editor_game', 'active', 'game.editor@saumabox.local');
    insertUser.run('editor_cinema', hash, 'Editor Cinema', 'editor_cinema', 'active', 'cinema.editor@saumabox.local');
    insertUser.run('moderator1', hash, 'Staff Moderator', 'moderator', 'active', 'mod@saumabox.local');
    insertUser.run('member_rizki', hash, 'Rizki Pratama', 'member', 'active', 'rizki@example.com');
  }
}

module.exports = {
  setupExtendedSchema
};
