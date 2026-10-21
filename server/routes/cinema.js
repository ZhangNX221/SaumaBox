const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');
const { cleanRating, cleanYear, cleanWatched } = require('../parser');

// GET /api/cinema — List cinema dengan filter, sort, search, dan pagination
router.get('/', (req, res) => {
  const db = getDb();
  const {
    type,
    watched,
    genre,
    q,
    sort_by = 'id',
    sort_order = 'desc',
    page = 1,
    limit = 25
  } = req.query;

  const conditions = [];
  const params = [];

  if (type && type !== 'ALL') {
    conditions.push('type = ?');
    params.push(type.toUpperCase());
  }

  if (watched !== undefined && watched !== 'ALL' && watched !== '') {
    conditions.push('watched = ?');
    params.push(parseInt(watched, 10) === 1 ? 1 : 0);
  }

  if (genre && genre !== 'ALL') {
    conditions.push('genre LIKE ?');
    params.push(`%${genre}%`);
  }

  if (q && q.trim()) {
    conditions.push('(title LIKE ? OR studio LIKE ? OR country LIKE ? OR genre LIKE ?)');
    const term = `%${q.trim()}%`;
    params.push(term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortCols = ['id', 'title', 'year', 'rating', 'watched', 'type', 'studio', 'country'];
  const safeSortCol = allowedSortCols.includes(sort_by) ? sort_by : 'id';
  const safeSortOrder = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM cinema ${whereClause}`);
  const total = countStmt.get(...params).total;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  const dataStmt = db.prepare(`
    SELECT * FROM cinema
    ${whereClause}
    ORDER BY ${safeSortCol} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `);
  const items = dataStmt.all(...params, limitNum, offset);

  // Ambil daftar genre unik
  const rawGenres = db.prepare("SELECT genre FROM cinema WHERE genre != ''").all();
  const genreSet = new Set();
  rawGenres.forEach(r => {
    r.genre.split(',').forEach(g => {
      const trimmed = g.trim();
      if (trimmed) genreSet.add(trimmed);
    });
  });

  res.json({
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    },
    filter_options: {
      genres: Array.from(genreSet).sort(),
      types: ['MOVIE', 'SERIES', 'ANIME']
    }
  });
});

// GET /api/cinema/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM cinema WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Tayangan tidak ditemukan.' });
  res.json(item);
});

// POST /api/cinema — Tambah tayangan baru
router.post('/', requireAuth, (req, res) => {
  const db = getDb();
  const {
    type = 'MOVIE',
    title,
    rating,
    year,
    country,
    studio,
    genre,
    age_rating,
    total_episodes,
    total_seasons,
    watched = 0,
    cover_url
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul tayangan wajib diisi.' });
  }

  const validTypes = ['MOVIE', 'SERIES', 'ANIME'];
  const safeType = validTypes.includes(type.toUpperCase()) ? type.toUpperCase() : 'MOVIE';

  const stmt = db.prepare(`
    INSERT INTO cinema (
      type, title, rating, year, country, studio, genre,
      age_rating, total_episodes, total_seasons, watched, cover_url,
      duration_mins, director, cast, synopsis, trailer_url, download_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    safeType,
    title.trim(),
    cleanRating(rating),
    cleanYear(year),
    country ? country.trim() : '',
    studio ? studio.trim() : '',
    genre ? genre.trim() : '',
    age_rating ? age_rating.trim() : '',
    total_episodes ? parseInt(total_episodes, 10) : null,
    total_seasons ? parseInt(total_seasons, 10) : null,
    cleanWatched(watched),
    cover_url ? cover_url.trim() : '',
    req.body.duration_mins ? parseInt(req.body.duration_mins, 10) : null,
    req.body.director ? req.body.director.trim() : '',
    req.body.cast ? req.body.cast.trim() : '',
    req.body.synopsis ? req.body.synopsis.trim() : '',
    req.body.trailer_url ? req.body.trailer_url.trim() : '',
    req.body.download_url ? req.body.download_url.trim() : ''
  );

  const newId = Number(result.lastInsertRowid);
  logActivity(db, 'CREATE', 'cinema', newId, title.trim());

  const created = db.prepare('SELECT * FROM cinema WHERE id = ?').get(newId);
  res.status(201).json(created);
});

// PUT /api/cinema/:id — Update tayangan
router.put('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM cinema WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tayangan tidak ditemukan.' });

  const {
    type = existing.type,
    title = existing.title,
    rating = existing.rating,
    year = existing.year,
    country = existing.country,
    studio = existing.studio,
    genre = existing.genre,
    age_rating = existing.age_rating,
    total_episodes = existing.total_episodes,
    total_seasons = existing.total_seasons,
    watched = existing.watched,
    cover_url = existing.cover_url,
    duration_mins = existing.duration_mins,
    director = existing.director,
    cast = existing.cast,
    synopsis = existing.synopsis,
    trailer_url = existing.trailer_url,
    download_url = existing.download_url
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul tayangan wajib diisi.' });
  }

  const stmt = db.prepare(`
    UPDATE cinema SET
      type = ?, title = ?, rating = ?, year = ?, country = ?,
      studio = ?, genre = ?, age_rating = ?, total_episodes = ?,
      total_seasons = ?, watched = ?, cover_url = ?,
      duration_mins = ?, director = ?, cast = ?, synopsis = ?, trailer_url = ?,
      download_url = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    type.toUpperCase(),
    title.trim(),
    cleanRating(rating),
    cleanYear(year),
    country ? country.trim() : '',
    studio ? studio.trim() : '',
    genre ? genre.trim() : '',
    age_rating ? age_rating.trim() : '',
    total_episodes ? parseInt(total_episodes, 10) : null,
    total_seasons ? parseInt(total_seasons, 10) : null,
    cleanWatched(watched),
    cover_url ? cover_url.trim() : '',
    duration_mins ? parseInt(duration_mins, 10) : null,
    director ? director.trim() : '',
    cast ? cast.trim() : '',
    synopsis ? synopsis.trim() : '',
    trailer_url ? trailer_url.trim() : '',
    download_url ? download_url.trim() : '',
    req.params.id
  );

  logActivity(db, 'UPDATE', 'cinema', req.params.id, title.trim());
  const updated = db.prepare('SELECT * FROM cinema WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/cinema/:id/toggle-watched — Quick Checkbox toggle
router.patch('/:id/toggle-watched', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id, title, watched FROM cinema WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tayangan tidak ditemukan.' });

  const newWatched = existing.watched === 1 ? 0 : 1;
  db.prepare("UPDATE cinema SET watched = ?, updated_at = datetime('now') WHERE id = ?").run(newWatched, req.params.id);

  logActivity(db, 'TOGGLE_WATCHED', 'cinema', req.params.id, existing.title, `Watched status changed to ${newWatched}`);
  res.json({ success: true, id: existing.id, watched: newWatched });
});

// DELETE /api/cinema/:id
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM cinema WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tayangan tidak ditemukan.' });

  db.prepare('DELETE FROM cinema WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE', 'cinema', req.params.id, existing.title);

  res.json({ success: true, message: `Tayangan "${existing.title}" berhasil dihapus.` });
});

module.exports = router;
