const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFile } = require('node:child_process');
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');

const COVERS_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'covers');
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

const posterStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, COVERS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    let fname = `${base}${ext}`;
    if (fs.existsSync(path.join(COVERS_DIR, fname))) {
      fname = `${base}-${Date.now()}${ext}`;
    }
    cb(null, fname);
  }
});

const posterUpload = multer({
  storage: posterStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpe?g|png|webp|svg|gif)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Hanya berkas gambar (JPG, PNG, WebP, SVG) yang diperbolehkan.'));
  }
});

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ============================================================
// GENRES & TAGS
// ============================================================
router.get('/genres', (req, res) => {
  const db = getDb();
  const { media_type, q } = req.query;
  let sql = 'SELECT * FROM genres WHERE 1=1';
  const params = [];

  if (media_type && media_type !== 'all') {
    sql += " AND (media_type = ? OR media_type = 'all')";
    params.push(media_type);
  }
  if (q) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/genres', requireAuth, (req, res) => {
  const db = getDb();
  const { name, media_type = 'all', description = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama genre wajib diisi.' });

  try {
    const info = db.prepare('INSERT INTO genres (name, media_type, description) VALUES (?, ?, ?)').run(name.trim(), media_type, description.trim());
    logActivity(db, 'CREATE_GENRE', 'taxonomy', info.lastInsertRowid, name.trim());
    res.json({ id: info.lastInsertRowid, success: true });
  } catch (err) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'Genre dengan nama tersebut sudah ada.' : err.message });
  }
});

router.put('/genres/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { name, media_type, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama genre wajib diisi.' });

  try {
    db.prepare('UPDATE genres SET name = ?, media_type = ?, description = ? WHERE id = ?').run(name.trim(), media_type || 'all', description || '', req.params.id);
    logActivity(db, 'UPDATE_GENRE', 'taxonomy', req.params.id, name.trim());
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/genres/:id', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM genres WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE_GENRE', 'taxonomy', req.params.id, `ID ${req.params.id}`);
  res.json({ success: true });
});

// ============================================================
// POSTERS & COVER ART MANAGEMENT (/antislop-ui & poncho)
// ============================================================
router.get('/posters', (req, res) => {
  const db = getDb();
  const { q, domain } = req.query;
  if (!fs.existsSync(COVERS_DIR)) return res.json([]);

  const files = fs.readdirSync(COVERS_DIR);
  const gameCovers = db.prepare('SELECT id, title, cover_url FROM games WHERE cover_url IS NOT NULL').all();
  const cinemaCovers = db.prepare('SELECT id, title, cover_url FROM cinema WHERE cover_url IS NOT NULL').all();
  const musicCovers = db.prepare('SELECT id, title, cover_url FROM music WHERE cover_url IS NOT NULL').all();

  let list = files
    .filter(f => !f.startsWith('.') && /\.(jpe?g|png|webp|svg|gif)$/i.test(f))
    .map(f => {
      const fullPath = path.join(COVERS_DIR, f);
      let stat = { size: 0, mtime: new Date() };
      try { stat = fs.statSync(fullPath); } catch (_) {}
      const url = `/images/covers/${f}`;

      const linkedGames = gameCovers.filter(g => g.cover_url && g.cover_url.endsWith(f));
      const linkedCinema = cinemaCovers.filter(c => c.cover_url && c.cover_url.endsWith(f));
      const linkedMusic = musicCovers.filter(m => m.cover_url && m.cover_url.endsWith(f));

      const links = [
        ...linkedGames.map(g => ({ domain: 'games', id: g.id, title: g.title, typeName: 'Game' })),
        ...linkedCinema.map(c => ({ domain: 'cinema', id: c.id, title: c.title, typeName: 'Cinema' })),
        ...linkedMusic.map(m => ({ domain: 'music', id: m.id, title: m.title, typeName: 'Musik' }))
      ];

      let detectedDomain = 'unlinked';
      if (linkedGames.length > 0) detectedDomain = 'games';
      else if (linkedCinema.length > 0) detectedDomain = 'cinema';
      else if (linkedMusic.length > 0) detectedDomain = 'music';

      const ext = path.extname(f).toLowerCase().replace('.', '').toUpperCase();

      return {
        filename: f,
        url,
        size_bytes: stat.size,
        size_formatted: formatBytes(stat.size),
        updated_at: stat.mtime ? stat.mtime.toISOString() : new Date().toISOString(),
        ext,
        domain: detectedDomain,
        links
      };
    });

  if (domain && domain !== 'all') {
    list = list.filter(item => item.domain === domain);
  }
  if (q) {
    const term = q.toLowerCase();
    list = list.filter(item =>
      item.filename.toLowerCase().includes(term) ||
      item.links.some(l => l.title.toLowerCase().includes(term))
    );
  }

  list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  res.json(list);
});

router.post('/posters/upload', requireAuth, posterUpload.single('poster'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Berkas gambar wajib dipilih.' });
  const db = getDb();
  const filename = req.file.filename;
  const url = `/images/covers/${filename}`;

  const { target_domain, target_id } = req.body;
  if (target_domain && target_id) {
    const id = Number(target_id);
    if (target_domain === 'games') db.prepare('UPDATE games SET cover_url = ? WHERE id = ?').run(url, id);
    else if (target_domain === 'cinema') db.prepare('UPDATE cinema SET cover_url = ? WHERE id = ?').run(url, id);
    else if (target_domain === 'music') db.prepare('UPDATE music SET cover_url = ? WHERE id = ?').run(url, id);
  }

  logActivity(db, 'UPLOAD_POSTER', 'taxonomy', Number(target_id) || 0, filename);
  res.json({
    success: true,
    filename,
    url,
    size: req.file.size
  });
});

router.post('/posters/link', requireAuth, (req, res) => {
  const db = getDb();
  const { filename, target_domain, target_id } = req.body;
  if (!filename || !target_domain || !target_id) {
    return res.status(400).json({ error: 'Parameter tidak lengkap.' });
  }
  const url = `/images/covers/${path.basename(filename)}`;
  const id = Number(target_id);
  if (target_domain === 'games') db.prepare('UPDATE games SET cover_url = ? WHERE id = ?').run(url, id);
  else if (target_domain === 'cinema') db.prepare('UPDATE cinema SET cover_url = ? WHERE id = ?').run(url, id);
  else if (target_domain === 'music') db.prepare('UPDATE music SET cover_url = ? WHERE id = ?').run(url, id);
  logActivity(db, 'LINK_POSTER', 'taxonomy', id, `${filename} -> ${target_domain} #${id}`);
  res.json({ success: true, url });
});

router.delete('/posters/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const fullPath = path.join(COVERS_DIR, filename);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (_) {}
  }
  const db = getDb();
  logActivity(db, 'DELETE_POSTER', 'taxonomy', 0, filename);
  res.json({ success: true });
});

router.get('/posters/export-zip', requireAuth, (req, res) => {
  const zipName = `saumabox-posters-${Date.now()}.zip`;
  const tmpZipPath = path.join(os.tmpdir(), zipName);
  const files = fs.readdirSync(COVERS_DIR).filter(f => !f.startsWith('.') && /\.(jpe?g|png|webp|svg|gif)$/i.test(f));

  if (files.length === 0) {
    return res.status(400).json({ error: 'Tidak ada berkas poster untuk diekspor.' });
  }

  const fileArgs = files.map(f => path.join(COVERS_DIR, f));
  execFile('zip', ['-j', tmpZipPath, ...fileArgs], (err) => {
    if (err || !fs.existsSync(tmpZipPath)) {
      return res.status(500).json({ error: 'Gagal membuat berkas ZIP poster.' });
    }
    res.download(tmpZipPath, 'saumabox-posters.zip', () => {
      try { fs.unlinkSync(tmpZipPath); } catch (_) {}
    });
  });
});

router.get('/media-candidates', requireAuth, (req, res) => {
  const db = getDb();
  const games = db.prepare('SELECT id, title, type as category FROM games ORDER BY title ASC').all();
  const cinema = db.prepare('SELECT id, title, type as category FROM cinema ORDER BY title ASC').all();
  const music = db.prepare('SELECT id, title, artist as category FROM music ORDER BY title ASC').all();
  res.json({ games, cinema, music });
});

// ============================================================
// PLATFORMS & MEDIA
// ============================================================
router.get('/platforms', (req, res) => {
  const db = getDb();
  const { category, q } = req.query;
  let sql = 'SELECT * FROM platforms WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (q) {
    sql += ' AND (name LIKE ? OR notes LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/platforms', requireAuth, (req, res) => {
  const db = getDb();
  const { name, category = 'Game Platform', icon_url = '', notes = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama platform/media wajib diisi.' });

  try {
    const info = db.prepare('INSERT INTO platforms (name, category, icon_url, notes) VALUES (?, ?, ?, ?)').run(name.trim(), category, icon_url.trim(), notes.trim());
    logActivity(db, 'CREATE_PLATFORM', 'taxonomy', info.lastInsertRowid, name.trim());
    res.json({ id: info.lastInsertRowid, success: true });
  } catch (err) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'Platform dengan nama tersebut sudah ada.' : err.message });
  }
});

router.put('/platforms/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { name, category, icon_url = '', notes = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama platform/media wajib diisi.' });

  try {
    db.prepare('UPDATE platforms SET name = ?, category = ?, icon_url = ?, notes = ? WHERE id = ?').run(name.trim(), category, icon_url.trim(), notes.trim(), req.params.id);
    logActivity(db, 'UPDATE_PLATFORM', 'taxonomy', req.params.id, name.trim());
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/platforms/:id', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM platforms WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE_PLATFORM', 'taxonomy', req.params.id, `ID ${req.params.id}`);
  res.json({ success: true });
});

// ============================================================
// OWNERSHIP STATUSES (STATUS KEPEMILIKAN)
// ============================================================
router.get('/statuses', (req, res) => {
  const db = getDb();
  const { q } = req.query;
  let sql = 'SELECT * FROM ownership_statuses WHERE 1=1';
  const params = [];

  if (q) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/statuses', requireAuth, (req, res) => {
  const db = getDb();
  const { name, badge_color = 'badge-neutral', description = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama status kepemilikan wajib diisi.' });

  try {
    const info = db.prepare('INSERT INTO ownership_statuses (name, badge_color, description) VALUES (?, ?, ?)').run(name.trim(), badge_color, description.trim());
    logActivity(db, 'CREATE_STATUS', 'taxonomy', info.lastInsertRowid, name.trim());
    res.json({ id: info.lastInsertRowid, success: true });
  } catch (err) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'Status kepemilikan dengan nama tersebut sudah ada.' : err.message });
  }
});

router.put('/statuses/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { name, badge_color = 'badge-neutral', description = '' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama status kepemilikan wajib diisi.' });

  try {
    db.prepare('UPDATE ownership_statuses SET name = ?, badge_color = ?, description = ? WHERE id = ?').run(name.trim(), badge_color, description.trim(), req.params.id);
    logActivity(db, 'UPDATE_STATUS', 'taxonomy', req.params.id, name.trim());
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/statuses/:id', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM ownership_statuses WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE_STATUS', 'taxonomy', req.params.id, `ID ${req.params.id}`);
  res.json({ success: true });
});

module.exports = router;
