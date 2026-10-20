const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');
const { cleanRating, cleanYear } = require('../parser');

// GET /api/music — List musik
router.get('/', (req, res) => {
  const db = getDb();
  const {
    platform,
    genre,
    favorite,
    q,
    sort_by = 'id',
    sort_order = 'desc',
    page = 1,
    limit = 25
  } = req.query;

  const conditions = [];
  const params = [];

  if (platform && platform !== 'ALL') {
    conditions.push('platform = ?');
    params.push(platform);
  }

  if (genre && genre !== 'ALL') {
    conditions.push('genre LIKE ?');
    params.push(`%${genre}%`);
  }

  if (favorite !== undefined && favorite !== 'ALL' && favorite !== '') {
    conditions.push('is_favorite = ?');
    params.push(parseInt(favorite, 10) === 1 ? 1 : 0);
  }

  if (q && q.trim()) {
    conditions.push('(title LIKE ? OR artist LIKE ? OR album LIKE ? OR genre LIKE ?)');
    const term = `%${q.trim()}%`;
    params.push(term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortCols = ['id', 'title', 'artist', 'album', 'year', 'rating', 'size_mb', 'is_favorite'];
  const safeSortCol = allowedSortCols.includes(sort_by) ? sort_by : 'id';
  const safeSortOrder = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM music ${whereClause}`);
  const total = countStmt.get(...params).total;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  const dataStmt = db.prepare(`
    SELECT * FROM music
    ${whereClause}
    ORDER BY ${safeSortCol} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `);
  const items = dataStmt.all(...params, limitNum, offset);

  const platforms = db.prepare("SELECT DISTINCT platform FROM music WHERE platform != '' ORDER BY platform").all().map(r => r.platform);
  const genres = db.prepare("SELECT DISTINCT genre FROM music WHERE genre != '' ORDER BY genre").all().map(r => r.genre);

  res.json({
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    },
    filter_options: {
      platforms,
      genres
    }
  });
});

// GET /api/music/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Musik tidak ditemukan.' });
  res.json(item);
});

// POST /api/music
router.post('/', requireAuth, (req, res) => {
  const db = getDb();
  const {
    title,
    artist,
    album,
    year,
    genre,
    platform,
    size_mb,
    rating,
    is_favorite = 0,
    notes,
    cover_url
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul lagu / album wajib diisi.' });
  }

  const stmt = db.prepare(`
    INSERT INTO music (
      title, artist, album, year, genre, platform,
      size_mb, rating, is_favorite, notes, cover_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    title.trim(),
    artist ? artist.trim() : '',
    album ? album.trim() : '',
    cleanYear(year),
    genre ? genre.trim() : '',
    platform ? platform.trim() : '',
    size_mb ? parseFloat(size_mb) : null,
    cleanRating(rating),
    is_favorite ? 1 : 0,
    notes ? notes.trim() : '',
    cover_url ? cover_url.trim() : ''
  );

  const newId = Number(result.lastInsertRowid);
  logActivity(db, 'CREATE', 'music', newId, title.trim());

  const created = db.prepare('SELECT * FROM music WHERE id = ?').get(newId);
  res.status(201).json(created);
});

// PUT /api/music/:id
router.put('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Musik tidak ditemukan.' });

  const {
    title = existing.title,
    artist = existing.artist,
    album = existing.album,
    year = existing.year,
    genre = existing.genre,
    platform = existing.platform,
    size_mb = existing.size_mb,
    rating = existing.rating,
    is_favorite = existing.is_favorite,
    notes = existing.notes,
    cover_url = existing.cover_url
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul lagu / album wajib diisi.' });
  }

  const stmt = db.prepare(`
    UPDATE music SET
      title = ?, artist = ?, album = ?, year = ?, genre = ?,
      platform = ?, size_mb = ?, rating = ?, is_favorite = ?,
      notes = ?, cover_url = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    title.trim(),
    artist ? artist.trim() : '',
    album ? album.trim() : '',
    cleanYear(year),
    genre ? genre.trim() : '',
    platform ? platform.trim() : '',
    size_mb ? parseFloat(size_mb) : null,
    cleanRating(rating),
    is_favorite ? 1 : 0,
    notes ? notes.trim() : '',
    cover_url ? cover_url.trim() : '',
    req.params.id
  );

  logActivity(db, 'UPDATE', 'music', req.params.id, title.trim());
  const updated = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/music/:id/toggle-favorite
router.patch('/:id/toggle-favorite', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id, title, is_favorite FROM music WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Musik tidak ditemukan.' });

  const newFav = existing.is_favorite === 1 ? 0 : 1;
  db.prepare("UPDATE music SET is_favorite = ?, updated_at = datetime('now') WHERE id = ?").run(newFav, req.params.id);

  logActivity(db, 'TOGGLE_FAVORITE', 'music', req.params.id, existing.title, `Favorite set to ${newFav}`);
  res.json({ success: true, id: existing.id, is_favorite: newFav });
});

// DELETE /api/music/:id
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Musik tidak ditemukan.' });

  db.prepare('DELETE FROM music WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE', 'music', req.params.id, existing.title);

  res.json({ success: true, message: `Musik "${existing.title}" berhasil dihapus.` });
});

module.exports = router;
