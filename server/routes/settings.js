const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');

// GET /api/settings — Pengaturan aplikasi
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

// PUT /api/settings — Update pengaturan aplikasi (Admin only)
router.put('/', requireAuth, (req, res) => {
  const db = getDb();
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Data pengaturan tidak valid.' });
  }

  const stmt = db.prepare(`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  for (const [key, val] of Object.entries(updates)) {
    stmt.run(key, String(val));
  }

  logActivity(db, 'UPDATE_SETTINGS', 'settings', null, 'App settings updated');
  res.json({ success: true, message: 'Pengaturan berhasil disimpan.' });
});

// GET /api/stats — Dashboard summary & statistik
router.get('/stats', (req, res) => {
  const db = getDb();

  const totalGames = db.prepare('SELECT COUNT(*) as c FROM games').get().c;
  const totalCinema = db.prepare('SELECT COUNT(*) as c FROM cinema').get().c;
  const totalMusic = db.prepare('SELECT COUNT(*) as c FROM music').get().c;

  // Games breakdown
  const pcGames = db.prepare("SELECT COUNT(*) as c FROM games WHERE type = 'PC'").get().c;
  const emuGames = db.prepare("SELECT COUNT(*) as c FROM games WHERE type = 'EMULATOR'").get().c;
  const recompGames = db.prepare("SELECT COUNT(*) as c FROM games WHERE type = 'RECOMP'").get().c;
  const totalSpending = db.prepare("SELECT COALESCE(SUM(price), 0) as s FROM games WHERE type = 'PC' AND status = 'Purchase'").get().s;

  // Cinema breakdown
  const movies = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE type = 'MOVIE'").get().c;
  const series = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE type = 'SERIES'").get().c;
  const anime = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE type = 'ANIME'").get().c;
  const watchedCount = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE watched = 1").get().c;

  // Music breakdown
  const favMusic = db.prepare("SELECT COUNT(*) as c FROM music WHERE is_favorite = 1").get().c;

  // Platform breakdown for PC
  const platformStats = db.prepare(`
    SELECT platform, COUNT(*) as count
    FROM games
    WHERE type = 'PC' AND platform != ''
    GROUP BY platform
    ORDER BY count DESC
  `).all();

  // Console breakdown for Emulator
  const consoleStats = db.prepare(`
    SELECT console, COUNT(*) as count
    FROM games
    WHERE type = 'EMULATOR' AND console != ''
    GROUP BY console
    ORDER BY count DESC
    LIMIT 6
  `).all();

  // Recent activity logs
  const recentLogs = db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT 8').all();

  res.json({
    totals: {
      games: totalGames,
      cinema: totalCinema,
      music: totalMusic,
      spending: totalSpending,
      watched: watchedCount,
      favorite_music: favMusic
    },
    games: {
      pc: pcGames,
      emulator: emuGames,
      recomp: recompGames,
      platforms: platformStats,
      consoles: consoleStats
    },
    cinema: {
      movies,
      series,
      anime,
      watched_percentage: totalCinema > 0 ? Math.round((watchedCount / totalCinema) * 100) : 0
    },
    recent_activity: recentLogs
  });
});

// GET /api/public/config — Konfigurasi untuk tampilan publik
router.get('/public-config', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });

  res.json({
    app_name: settings.app_name || 'SaumaBox',
    public_sharing_enabled: settings.public_sharing_enabled === 'true',
    public_games_enabled: settings.public_games_enabled === 'true',
    public_cinema_enabled: settings.public_cinema_enabled === 'true',
    public_music_enabled: settings.public_music_enabled === 'true',
    public_show_prices: settings.public_show_prices === 'true',
    public_show_ratings: settings.public_show_ratings === 'true',
    theme: settings.theme || 'dark'
  });
});

// GET /api/settings/recent — Ambil item terbaru per kategori untuk showcase beranda
router.get('/recent', (req, res) => {
  const db = getDb();
  const limit = Math.min(12, Math.max(1, parseInt(req.query.limit, 10) || 6));

  const games = db.prepare(`
    SELECT id, type, title, year, publisher, developer, rating, status, platform, price, console, cover_url
    FROM games
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);

  const cinema = db.prepare(`
    SELECT id, type, title, rating, year, country, studio, genre, watched, cover_url
    FROM cinema
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);

  const music = db.prepare(`
    SELECT id, title, artist, album, year, genre, platform, rating, is_favorite, cover_url
    FROM music
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);

  res.json({ games, cinema, music });
});

module.exports = router;

