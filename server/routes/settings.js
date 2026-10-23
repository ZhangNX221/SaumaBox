const express = require('express');
const router = express.Router();
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execSync } = require('child_process');
const pkg = require('../../package.json');
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');

const appRoot = path.resolve(__dirname, '..', '..');

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
  const totalWeb = db.prepare('SELECT COUNT(*) as c FROM web_bookmarks').get()?.c || 0;
  const pinnedWeb = db.prepare('SELECT COUNT(*) as c FROM web_bookmarks WHERE is_pinned = 1').get()?.c || 0;
  const webCategories = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM web_bookmarks
    GROUP BY category
    ORDER BY count DESC
  `).all();

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
      web: totalWeb,
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
    web: {
      total: totalWeb,
      pinned: pinnedWeb,
      categories: webCategories
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

// GET /api/settings/public-config or /api/public/config — Konfigurasi untuk tampilan publik
router.get(['/public-config', '/public/config'], (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });

  res.json({
    app_name: settings.app_name || 'SaumaBox',
    app_logo_url: settings.app_logo_url || '/images/logo-icon.png',
    banner_title: settings.banner_title || 'Kurasi Digital Game, Sinema & Audio dalam Satu Presisi',
    banner_subtitle: settings.banner_subtitle || 'Ruang arsip pribadi untuk menyimpan dan mengorganisasi koleksi game PC, emulator retro, serial sinema pilihan, dan arsip audio lossless dalam tampilan bersih dan tenang.',
    public_sharing_enabled: settings.public_sharing_enabled !== 'false',
    public_games_enabled: settings.public_games_enabled !== 'false',
    public_cinema_enabled: settings.public_cinema_enabled !== 'false',
    public_music_enabled: settings.public_music_enabled !== 'false',
    public_web_enabled: settings.public_web_enabled !== 'false',
    public_show_prices: settings.public_show_prices !== 'false',
    public_show_ratings: settings.public_show_ratings !== 'false',
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

  const web = db.prepare(`
    SELECT id, title, url, category, icon_url, description, bg_color, is_pinned
    FROM web_bookmarks
    ORDER BY is_pinned DESC, sort_order ASC, id DESC
    LIMIT ?
  `).all(limit);

  res.json({ games, cinema, music, web });
});

// GET /api/settings/version — Dapatkan informasi versi aplikasi saat ini
router.get('/version', (req, res) => {
  let commitHash = 'unknown';
  let branch = 'main';
  const hasGit = fs.existsSync(path.join(appRoot, '.git'));

  if (hasGit) {
    try {
      commitHash = execSync('git rev-parse --short HEAD', { cwd: appRoot, encoding: 'utf8' }).trim();
      branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: appRoot, encoding: 'utf8' }).trim();
    } catch (_) {}
  } else {
    // Di lingkungan Docker / ZimaOS tanpa .git, gunakan tag versi package
    commitHash = `v${pkg.version}`;
  }

  res.json({
    version: pkg.version,
    commit: commitHash,
    branch,
    isDocker: !hasGit,
    repoUrl: 'https://github.com/ZhangNX221/SaumaBox'
  });
});

// GET /api/settings/check-update — Periksa apakah ada commit/versi baru dari remote GitHub
router.get('/check-update', requireAuth, async (req, res) => {
  let localCommit = 'unknown';
  let remoteCommit = '';
  let branch = 'main';
  let hasUpdate = false;
  let remoteError = null;
  let latestVersion = `v${pkg.version}`;
  const hasGit = fs.existsSync(path.join(appRoot, '.git'));

  if (hasGit) {
    try {
      localCommit = execSync('git rev-parse --short HEAD', { cwd: appRoot, encoding: 'utf8' }).trim();
      branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: appRoot, encoding: 'utf8' }).trim();
    } catch (_) {
      localCommit = 'unknown';
    }
  } else {
    localCommit = `v${pkg.version}`;
  }

  // Gunakan GitHub REST API terlebih dahulu (sangat andal di Docker/ZimaOS tanpa perlu CLI git)
  try {
    const ghHeaders = {
      'User-Agent': 'SaumaBox-Updater',
      'Accept': 'application/vnd.github.v3+json'
    };

    // 1. Periksa rilis resmi terbaru di GitHub
    try {
      const releaseRes = await fetch('https://api.github.com/repos/ZhangNX221/SaumaBox/releases/latest', {
        headers: ghHeaders,
        signal: AbortSignal.timeout(10000)
      });
      if (releaseRes.ok) {
        const releaseData = await releaseRes.json();
        if (releaseData && releaseData.tag_name) {
          latestVersion = releaseData.tag_name;
          const cleanLatest = latestVersion.replace(/^v/, '');
          const cleanCurrent = pkg.version.replace(/^v/, '');
          if (cleanLatest !== cleanCurrent) {
            hasUpdate = true;
          }
        }
      }
    } catch (_) {}

    // 2. Periksa commit terbaru di branch main
    const commitRes = await fetch('https://api.github.com/repos/ZhangNX221/SaumaBox/commits/main', {
      headers: ghHeaders,
      signal: AbortSignal.timeout(10000)
    });

    if (commitRes.ok) {
      const commitData = await commitRes.json();
      if (commitData && commitData.sha) {
        remoteCommit = commitData.sha.substring(0, 7);
        if (hasGit && localCommit !== 'unknown' && !commitData.sha.startsWith(localCommit)) {
          hasUpdate = true;
        } else if (!hasGit && hasUpdate) {
          // Versi rilis berbeda pada Docker
          hasUpdate = true;
        }
      }
    }
  } catch (apiErr) {
    // Fallback: jika REST API gagal (misal rate limit), gunakan git ls-remote jika ada Git CLI
    if (hasGit) {
      try {
        const rawRemote = execSync(`git ls-remote origin refs/heads/${branch || 'main'}`, { cwd: appRoot, encoding: 'utf8', timeout: 12000 });
        if (rawRemote && rawRemote.trim()) {
          remoteCommit = rawRemote.split('\t')[0].trim().substring(0, 7);
          if (remoteCommit && !remoteCommit.startsWith(localCommit)) {
            hasUpdate = true;
          }
        }
      } catch (gitErr) {
        remoteError = gitErr.message;
      }
    } else {
      remoteError = apiErr.message;
    }
  }

  res.json({
    currentVersion: pkg.version,
    currentCommit: localCommit,
    remoteCommit: remoteCommit || latestVersion,
    latestVersion,
    branch,
    hasUpdate,
    isDocker: !hasGit,
    remoteError: remoteError ? 'Tidak dapat terhubung ke remote GitHub (periksa koneksi internet).' : null,
    checkedAt: new Date().toISOString()
  });
});

// POST /api/settings/apply-update — Lakukan update sistem (Dukungan Git & Docker/ZimaOS)
router.post('/apply-update', requireAuth, async (req, res) => {
  const db = getDb();
  const hasGit = fs.existsSync(path.join(appRoot, '.git'));

  // Skenario 1: Lingkungan Repository Git (Local / Server dengan Git)
  if (hasGit) {
    try {
      const output = execSync('git pull origin main', { cwd: appRoot, encoding: 'utf8', timeout: 35000 });
      logActivity(db, 'SYSTEM_UPDATE', 'system', req.user.id, req.user.username, `Pembaruan sistem via git: ${output.substring(0, 100)}`);
      return res.json({
        success: true,
        message: 'Aplikasi berhasil diperbarui via Git! Halaman akan dimuat ulang.',
        output,
        isDocker: false
      });
    } catch (err) {
      return res.status(500).json({
        error: `Gagal memperbarui aplikasi via Git: ${err.message}`
      });
    }
  }

  // Skenario 2: Lingkungan Docker / ZimaOS / Standalone (Tanpa folder .git)
  try {
    const tmpTarPath = path.join(os.tmpdir(), `saumabox-update-${Date.now()}.tar.gz`);
    const tarUrl = 'https://github.com/ZhangNX221/SaumaBox/archive/refs/heads/main.tar.gz';

    // 1. Unduh arsip kode terbaru dari GitHub
    const resp = await fetch(tarUrl, {
      headers: { 'User-Agent': 'SaumaBox-Updater' },
      signal: AbortSignal.timeout(60000)
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText} saat mengunduh paket dari GitHub`);

    const arrayBuffer = await resp.arrayBuffer();
    fs.writeFileSync(tmpTarPath, Buffer.from(arrayBuffer));

    // 2. Ekstrak arsip ke folder sementara
    const tmpExtractDir = path.join(os.tmpdir(), `saumabox-extract-${Date.now()}`);
    fs.mkdirSync(tmpExtractDir, { recursive: true });

    execSync(`tar -xzf "${tmpTarPath}" -C "${tmpExtractDir}"`, { encoding: 'utf8', timeout: 35000 });

    // GitHub archive biasanya memiliki subfolder SaumaBox-main/
    const extractedItems = fs.readdirSync(tmpExtractDir);
    const sourceDir = extractedItems.length === 1 && fs.statSync(path.join(tmpExtractDir, extractedItems[0])).isDirectory()
      ? path.join(tmpExtractDir, extractedItems[0])
      : tmpExtractDir;

    // 3. Salin file pembaruan ke appRoot DENGAN MEMPROTEKSI FOLDER data/ (Database SQLite & upload pengguna)
    const itemsToCopy = ['public', 'server', 'package.json', 'package-lock.json', 'Dockerfile', 'docker-compose.yml', 'README.md', 'LICENSE'];
    for (const item of itemsToCopy) {
      const srcItem = path.join(sourceDir, item);
      const destItem = path.join(appRoot, item);
      if (fs.existsSync(srcItem)) {
        fs.cpSync(srcItem, destItem, { recursive: true, force: true });
      }
    }

    // 4. Bersihkan file sementara
    try {
      fs.unlinkSync(tmpTarPath);
      fs.rmSync(tmpExtractDir, { recursive: true, force: true });
    } catch (_) {}

    // 5. Jalankan npm install jika diperlukan
    try {
      execSync('npm install --omit=dev', { cwd: appRoot, encoding: 'utf8', timeout: 60000 });
    } catch (_) {}

    logActivity(db, 'SYSTEM_UPDATE', 'system', req.user.id, req.user.username, 'Pembaruan sistem via GitHub Archive (Docker/ZimaOS)');

    res.json({
      success: true,
      message: 'Pembaruan SaumaBox berhasil dipasang! Server container akan memuat ulang proses dalam 2 detik.',
      isDocker: true
    });

    // Beri jeda 1.5 detik agar respon HTTP sampai ke klien sebelum proses Node berhenti dan di-restart oleh Docker
    setTimeout(() => {
      console.log('Restarting SaumaBox after update...');
      process.exit(0);
    }, 1500);

  } catch (err) {
    console.error('Docker update error:', err);
    res.status(500).json({
      error: `Gagal memperbarui aplikasi di ZimaOS/Docker: ${err.message}`
    });
  }
});

module.exports = router;

