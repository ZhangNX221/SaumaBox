const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');
const { cleanPrice, cleanRating, cleanYear, cleanSizeGb, cleanCompleted } = require('../parser');

// GET /api/games — List games dengan filter, sort, search, pagination, dan auto-sum
router.get('/', (req, res) => {
  const db = getDb();
  const {
    type,
    completed,
    q,
    platform,
    status,
    console: consoleFilter,
    emulator,
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

  if (completed !== undefined && completed !== 'ALL' && completed !== '') {
    conditions.push('completed = ?');
    params.push(parseInt(completed, 10) === 1 ? 1 : 0);
  }

  if (q && q.trim()) {
    conditions.push('(title LIKE ? OR publisher LIKE ? OR developer LIKE ? OR genre LIKE ? OR release_date LIKE ? OR console LIKE ? OR emulator LIKE ? OR port_developer LIKE ?)');
    const term = `%${q.trim()}%`;
    params.push(term, term, term, term, term, term, term, term);
  }

  if (platform && platform !== 'ALL') {
    conditions.push('platform = ?');
    params.push(platform);
  }

  if (status && status !== 'ALL') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (consoleFilter && consoleFilter !== 'ALL') {
    conditions.push('console = ?');
    params.push(consoleFilter);
  }

  if (emulator && emulator !== 'ALL') {
    conditions.push('emulator = ?');
    params.push(emulator);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validasi sort column
  const allowedSortCols = ['id', 'title', 'year', 'release_date', 'genre', 'developer', 'publisher', 'rating', 'price', 'platform', 'status', 'console', 'size_gb', 'completed'];
  const safeSortCol = allowedSortCols.includes(sort_by) ? sort_by : 'id';
  const safeSortOrder = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  // Total count
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM games ${whereClause}`);
  const total = countStmt.get(...params).total;

  // Auto-sum price untuk filter aktif
  const sumStmt = db.prepare(`SELECT COALESCE(SUM(price), 0) as total_price FROM games ${whereClause}`);
  const totalPrice = sumStmt.get(...params).total_price;

  // Pagination query
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  const dataStmt = db.prepare(`
    SELECT * FROM games
    ${whereClause}
    ORDER BY ${safeSortCol} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `);
  const items = dataStmt.all(...params, limitNum, offset);

  // Ambil daftar unik untuk dropdown filter
  const platforms = db.prepare("SELECT DISTINCT platform FROM games WHERE platform != '' AND type = 'PC' ORDER BY platform").all().map(r => r.platform);
  const consoles = db.prepare("SELECT DISTINCT console FROM games WHERE console != '' ORDER BY console").all().map(r => r.console);
  const emulators = db.prepare("SELECT DISTINCT emulator FROM games WHERE emulator != '' ORDER BY emulator").all().map(r => r.emulator);
  const statuses = db.prepare("SELECT DISTINCT status FROM games WHERE status != '' ORDER BY status").all().map(r => r.status);
  const genres = db.prepare("SELECT DISTINCT genre FROM games WHERE genre != '' ORDER BY genre").all().map(r => r.genre);

  res.json({
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    },
    aggregates: {
      total_price: totalPrice
    },
    filter_options: {
      platforms,
      consoles,
      emulators,
      statuses,
      genres
    }
  });
});

// GET /api/games/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) return res.status(404).json({ error: 'Game tidak ditemukan.' });
  res.json(game);
});

// POST /api/games — Tambah game baru
router.post('/', requireAuth, (req, res) => {
  const db = getDb();
  const {
    type = 'PC',
    title,
    year,
    release_date,
    genre,
    publisher,
    developer,
    size_gb,
    rating,
    status,
    platform,
    price,
    console: consoleName,
    emulator,
    rom_format,
    port_year,
    port_developer,
    port_version,
    enhancements,
    cover_url,
    completed = 0
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul game wajib diisi.' });
  }

  const validTypes = ['PC', 'EMULATOR', 'RECOMP', 'MOBILE'];
  const safeType = validTypes.includes(type.toUpperCase()) ? type.toUpperCase() : 'PC';

  const stmt = db.prepare(`
    INSERT INTO games (
      type, title, year, release_date, genre, publisher, developer, size_gb, rating, status,
      platform, price, console, emulator, rom_format, port_year,
      port_developer, port_version, enhancements, cover_url,
      system_requirements, trailer_url, screenshot_url, completed, download_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    safeType,
    title.trim(),
    cleanYear(year),
    release_date ? release_date.trim() : '',
    genre ? genre.trim() : '',
    publisher ? publisher.trim() : '',
    developer ? developer.trim() : '',
    cleanSizeGb(size_gb),
    cleanRating(rating),
    status ? status.trim() : '',
    platform ? platform.trim() : '',
    cleanPrice(price),
    consoleName ? consoleName.trim() : '',
    emulator ? emulator.trim() : '',
    rom_format ? rom_format.trim() : '',
    cleanYear(port_year),
    port_developer ? port_developer.trim() : '',
    port_version ? port_version.trim() : '',
    enhancements ? enhancements.trim() : '',
    cover_url ? cover_url.trim() : '',
    req.body.system_requirements ? req.body.system_requirements.trim() : '',
    req.body.trailer_url ? req.body.trailer_url.trim() : '',
    req.body.screenshot_url ? req.body.screenshot_url.trim() : '',
    cleanCompleted(completed),
    req.body.download_url ? req.body.download_url.trim() : ''
  );

  const newId = Number(result.lastInsertRowid);
  logActivity(db, 'CREATE', 'games', newId, title.trim());

  const created = db.prepare('SELECT * FROM games WHERE id = ?').get(newId);
  res.status(201).json(created);
});

// PUT /api/games/:id — Update game
router.put('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Game tidak ditemukan.' });

  const {
    type = existing.type,
    title = existing.title,
    year = existing.year,
    release_date = existing.release_date,
    genre = existing.genre,
    publisher = existing.publisher,
    developer = existing.developer,
    size_gb = existing.size_gb,
    rating = existing.rating,
    status = existing.status,
    platform = existing.platform,
    price = existing.price,
    console: consoleName = existing.console,
    emulator = existing.emulator,
    rom_format = existing.rom_format,
    port_year = existing.port_year,
    port_developer = existing.port_developer,
    port_version = existing.port_version,
    enhancements = existing.enhancements,
    cover_url = existing.cover_url,
    system_requirements = existing.system_requirements,
    trailer_url = existing.trailer_url,
    screenshot_url = existing.screenshot_url,
    completed = existing.completed,
    download_url = existing.download_url
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul game wajib diisi.' });
  }

  const stmt = db.prepare(`
    UPDATE games SET
      type = ?, title = ?, year = ?, release_date = ?, genre = ?, publisher = ?, developer = ?,
      size_gb = ?, rating = ?, status = ?, platform = ?, price = ?,
      console = ?, emulator = ?, rom_format = ?, port_year = ?,
      port_developer = ?, port_version = ?, enhancements = ?, cover_url = ?,
      system_requirements = ?, trailer_url = ?, screenshot_url = ?,
      completed = ?, download_url = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    type.toUpperCase(),
    title.trim(),
    cleanYear(year),
    release_date ? release_date.trim() : '',
    genre ? genre.trim() : '',
    publisher ? publisher.trim() : '',
    developer ? developer.trim() : '',
    cleanSizeGb(size_gb),
    cleanRating(rating),
    status ? status.trim() : '',
    platform ? platform.trim() : '',
    cleanPrice(price),
    consoleName ? consoleName.trim() : '',
    emulator ? emulator.trim() : '',
    rom_format ? rom_format.trim() : '',
    cleanYear(port_year),
    port_developer ? port_developer.trim() : '',
    port_version ? port_version.trim() : '',
    enhancements ? enhancements.trim() : '',
    cover_url ? cover_url.trim() : '',
    system_requirements ? system_requirements.trim() : '',
    trailer_url ? trailer_url.trim() : '',
    screenshot_url ? screenshot_url.trim() : '',
    cleanCompleted(completed),
    download_url ? download_url.trim() : '',
    req.params.id
  );

  logActivity(db, 'UPDATE', 'games', req.params.id, title.trim());
  const updated = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/games/:id/toggle-completed — Quick Checkbox toggle
router.patch('/:id/toggle-completed', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id, title, completed FROM games WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Game tidak ditemukan.' });

  const newCompleted = existing.completed === 1 ? 0 : 1;
  db.prepare("UPDATE games SET completed = ?, updated_at = datetime('now') WHERE id = ?").run(newCompleted, req.params.id);

  logActivity(db, 'TOGGLE_COMPLETED', 'games', req.params.id, existing.title, `Completed status changed to ${newCompleted}`);
  res.json({ success: true, id: existing.id, completed: newCompleted });
});

// DELETE /api/games/:id — Hapus game
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Game tidak ditemukan.' });

  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  logActivity(db, 'DELETE', 'games', req.params.id, existing.title);

  res.json({ success: true, message: `Game "${existing.title}" berhasil dihapus.` });
});

// POST /api/games/bulk-delete — Hapus banyak game
router.post('/bulk-delete', requireAuth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Daftar ID yang ingin dihapus tidak valid.' });
  }

  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM games WHERE id IN (${placeholders})`);
  stmt.run(...ids);

  logActivity(db, 'BULK_DELETE', 'games', null, `${ids.length} games dihapus`);
  res.json({ success: true, count: ids.length });
});

module.exports = router;
