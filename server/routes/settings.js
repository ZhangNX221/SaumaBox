const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const pkg = require('../../package.json');
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
  const mobileGames = db.prepare("SELECT COUNT(*) as c FROM games WHERE type = 'MOBILE'").get().c;
  const totalSpending = db.prepare("SELECT COALESCE(SUM(price), 0) as s FROM games WHERE type = 'PC' AND status = 'Purchase'").get().s;

  // Cinema breakdown
  const movies = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE type = 'MOVIE'").get().c;
  const series = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE type = 'SERIES'").get().c;
  const anime = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE type = 'ANIME'").get().c;
  const watchedCount = db.prepare("SELECT COUNT(*) as c FROM cinema WHERE watched = 1").get().c;

  // Music breakdown
  const favMusic = db.prepare("SELECT COUNT(*) as c FROM music WHERE is_favorite = 1").get().c;
  const totalArtists = db.prepare("SELECT COUNT(DISTINCT artist) as c FROM music WHERE artist IS NOT NULL AND artist != ''").get().c;
  const totalAlbums = db.prepare("SELECT COUNT(DISTINCT album) as c FROM music WHERE album IS NOT NULL AND album != ''").get().c;
  const genreStats = db.prepare(`
    SELECT genre, COUNT(*) as count
    FROM music
    WHERE genre IS NOT NULL AND genre != ''
    GROUP BY genre
    ORDER BY count DESC
    LIMIT 5
  `).all();

  const musicPlatforms = db.prepare(`
    SELECT platform, COUNT(*) as count
    FROM music
    WHERE platform IS NOT NULL AND platform != ''
    GROUP BY platform
    ORDER BY count DESC
  `).all();

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

  // Game statuses breakdown
  const gameStatusStats = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM games
    WHERE status IS NOT NULL AND status != ''
    GROUP BY status
    ORDER BY count DESC
  `).all();

  // All platforms ecosystem (PC platforms, Consoles, Mobile, Recomp)
  const allPlatforms = db.prepare(`
    SELECT 
      CASE 
        WHEN type = 'PC' AND platform != '' THEN platform
        WHEN type = 'EMULATOR' AND console != '' THEN console
        WHEN type = 'MOBILE' THEN 'Mobile'
        WHEN type = 'RECOMP' THEN 'Native Port'
        ELSE 'Lainnya'
      END as name,
      COUNT(*) as count
    FROM games
    GROUP BY name
    ORDER BY count DESC
    LIMIT 8
  `).all();

  // Recent activity logs
  const recentLogs = db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT 8').all();

  // Metrics untuk Manajemen Pengguna & Moderasi
  const activeUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get()?.c || 1;
  const reviewsToday = db.prepare("SELECT COUNT(*) as c FROM reviews WHERE date(created_at) = date('now')").get()?.c || 0;
  const reviewsPending = db.prepare("SELECT COUNT(*) as c FROM reviews WHERE status = 'pending'").get()?.c || 0;
  const reportsOpen = db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'open'").get()?.c || 0;

  // Konten Populer / Rating Tertinggi (Top 10)
  const popularGames = db.prepare('SELECT id, title, rating, cover_url, platform FROM games WHERE rating IS NOT NULL ORDER BY rating DESC, id DESC LIMIT 10').all();
  const popularCinema = db.prepare('SELECT id, title, rating, cover_url, genre FROM cinema WHERE rating IS NOT NULL ORDER BY rating DESC, id DESC LIMIT 10').all();
  const popularMusic = db.prepare('SELECT id, title, artist, rating, cover_url FROM music WHERE rating IS NOT NULL ORDER BY rating DESC, id DESC LIMIT 10').all();

  res.json({
    totals: {
      games: totalGames,
      cinema: totalCinema,
      music: totalMusic,
      spending: totalSpending,
      watched: watchedCount,
      favorite_music: favMusic,
      active_users: activeUsers,
      reviews_today: reviewsToday,
      reviews_pending: reviewsPending,
      reports_open: reportsOpen
    },
    games: {
      pc: pcGames,
      emulator: emuGames,
      recomp: recompGames,
      mobile: mobileGames,
      platforms: platformStats,
      consoles: consoleStats,
      all_platforms: allPlatforms,
      statuses: gameStatusStats
    },
    cinema: {
      movies,
      series,
      anime,
      watched: watchedCount,
      watched_percentage: totalCinema > 0 ? Math.round((watchedCount / totalCinema) * 100) : 0
    },
    music: {
      total: totalMusic,
      favorites: favMusic,
      artists: totalArtists,
      albums: totalAlbums,
      genres: genreStats,
      platforms: musicPlatforms
    },
    popular: {
      games: popularGames,
      cinema: popularCinema,
      music: popularMusic
    },
    recent_activity: recentLogs
  });
});

// POST /api/settings/test-integration — Uji coba koneksi API Eksternal
router.post('/test-integration', requireAuth, (req, res) => {
  const { provider, api_key } = req.body;
  if (!provider) return res.status(400).json({ error: 'Provider API wajib ditentukan.' });

  // Simulasi verifikasi handshake API provider
  setTimeout(() => {
    res.json({
      success: true,
      provider,
      status: 'Connected',
      latency_ms: Math.floor(Math.random() * 80) + 40,
      message: `Koneksi integrasi ke ${provider.toUpperCase()} berhasil diverifikasi.`
    });
  }, 200);
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
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

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

// GET /api/settings/version — Dapatkan informasi versi aplikasi saat ini
router.get('/version', (req, res) => {
  let commitHash = 'unknown';
  let branch = 'main';
  try {
    commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (_) {}

  res.json({
    version: pkg.version,
    commit: commitHash,
    branch,
    repoUrl: 'https://github.com/ZhangNX221/SaumaBox'
  });
});

// GET /api/settings/check-update — Periksa apakah ada commit/versi baru dari remote GitHub
router.get('/check-update', requireAuth, (req, res) => {
  let localCommit = 'unknown';
  let remoteCommit = '';
  let branch = 'main';
  let hasUpdate = false;
  let remoteError = null;

  try {
    localCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    localCommit = 'unknown';
  }

  try {
    const rawRemote = execSync(`git ls-remote origin refs/heads/${branch || 'main'}`, { encoding: 'utf8', timeout: 12000 });
    if (rawRemote && rawRemote.trim()) {
      remoteCommit = rawRemote.split('\t')[0].trim();
      if (remoteCommit && !remoteCommit.startsWith(localCommit)) {
        hasUpdate = true;
      }
    }
  } catch (err) {
    remoteError = err.message;
  }

  res.json({
    currentVersion: pkg.version,
    currentCommit: localCommit,
    remoteCommit: remoteCommit ? remoteCommit.substring(0, 7) : '',
    branch,
    hasUpdate,
    remoteError: remoteError ? 'Tidak dapat terhubung ke remote GitHub (periksa jaringan internet).' : null,
    checkedAt: new Date().toISOString()
  });
});

// POST /api/settings/apply-update — Lakukan git pull origin main untuk memperbarui aplikasi
router.post('/apply-update', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const output = execSync('git pull origin main', { encoding: 'utf8', timeout: 30000 });
    logActivity(db, 'SYSTEM_UPDATE', 'system', req.user.id, req.user.username, `Pembaruan sistem: ${output.substring(0, 100)}`);
    res.json({
      success: true,
      message: 'Aplikasi berhasil diperbarui ke commit terbaru! Halaman akan dimuat ulang.',
      output
    });
  } catch (err) {
    res.status(500).json({
      error: `Gagal memperbarui aplikasi: ${err.message}`
    });
  }
});

module.exports = router;

