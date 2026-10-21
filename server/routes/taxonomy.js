const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');

// ============================================================
// GENRES & TAGS
// ============================================================
router.get('/genres', (req, res) => {
  const db = getDb();
  const { media_type, q } = req.query;
  let sql = 'SELECT * FROM genres WHERE 1=1';
  const params = [];

  if (media_type && media_type !== 'all') {
    sql += ' AND (media_type = ? OR media_type = "all")';
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
// CREATORS & TOKOH
// ============================================================
router.get('/creators', (req, res) => {
  const db = getDb();
  const { role, q } = req.query;
  let sql = 'SELECT * FROM creators WHERE 1=1';
  const params = [];

  if (role && role !== 'all') {
    sql += ' AND role LIKE ?';
    params.push(`%${role}%`);
  }
  if (q) {
    sql += ' AND (name LIKE ? OR bio LIKE ? OR role LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/creators', requireAuth, (req, res) => {
  const db = getDb();
  const { name, role, bio = '', photo_url = '' } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Nama dan peran tokoh wajib diisi.' });

  const info = db.prepare('INSERT INTO creators (name, role, bio, photo_url) VALUES (?, ?, ?, ?)').run(name.trim(), role.trim(), bio.trim(), photo_url.trim());
  logActivity(db, 'CREATE_CREATOR', 'taxonomy', info.lastInsertRowid, name.trim());
  res.json({ id: info.lastInsertRowid, success: true });
});

router.put('/creators/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { name, role, bio = '', photo_url = '' } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Nama dan peran tokoh wajib diisi.' });

  db.prepare('UPDATE creators SET name = ?, role = ?, bio = ?, photo_url = ? WHERE id = ?').run(name.trim(), role.trim(), bio.trim(), photo_url.trim(), req.params.id);
  logActivity(db, 'UPDATE_CREATOR', 'taxonomy', req.params.id, name.trim());
  res.json({ success: true });
});

router.delete('/creators/:id', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM creators WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE_CREATOR', 'taxonomy', req.params.id, `ID ${req.params.id}`);
  res.json({ success: true });
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
  sql += ' ORDER BY id ASC';
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
