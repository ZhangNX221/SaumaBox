const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { requireAuth } = require('../auth');

// GET /api/web — Daftar bookmark website
router.get('/', (req, res) => {
  const db = getDb();
  const {
    category,
    q,
    sort_by = 'sort_order',
    sort_order = 'asc'
  } = req.query;

  const conditions = [];
  const params = [];

  if (category && category !== 'ALL' && category !== 'Semua') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (q && q.trim()) {
    conditions.push('(title LIKE ? OR url LIKE ? OR description LIKE ? OR category LIKE ?)');
    const term = `%${q.trim()}%`;
    params.push(term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortCols = ['id', 'title', 'category', 'sort_order', 'created_at', 'is_pinned'];
  const safeSortCol = allowedSortCols.includes(sort_by) ? sort_by : 'sort_order';
  const safeSortOrder = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const items = db.prepare(`
    SELECT * FROM web_bookmarks
    ${whereClause}
    ORDER BY is_pinned DESC, ${safeSortCol} ${safeSortOrder}, id ASC
  `).all(...params);

  const categories = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM web_bookmarks
    GROUP BY category
    ORDER BY count DESC, category ASC
  `).all();

  res.json({
    items,
    total: items.length,
    categories
  });
});

// GET /api/web/categories — Daftar kategori web bookmark
router.get('/categories', (req, res) => {
  const db = getDb();
  const categories = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM web_bookmarks
    GROUP BY category
    ORDER BY count DESC, category ASC
  `).all();
  res.json(categories);
});

// GET /api/web/fetch-meta — Helper auto-fill metadata dan favicon dari URL
router.get('/fetch-meta', (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ error: 'Parameter URL wajib disertakan.' });
  }

  try {
    let parsedUrlStr = rawUrl.trim();
    if (!/^https?:\/\//i.test(parsedUrlStr)) {
      parsedUrlStr = 'http://' + parsedUrlStr;
    }
    const parsed = new URL(parsedUrlStr);
    const hostname = parsed.hostname;

    // Bersihkan nama hostname untuk dijadikan title default
    const cleanHost = hostname.replace(/^www\./i, '');
    const titleParts = cleanHost.split('.');
    const autoTitle = titleParts.length > 1
      ? titleParts[0].charAt(0).toUpperCase() + titleParts[0].slice(1)
      : cleanHost;

    // Palette warna aksen berdasarkan domain
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#6366f1', '#ef4444'];
    let hash = 0;
    for (let i = 0; i < cleanHost.length; i++) hash = (hash << 5) - hash + cleanHost.charCodeAt(i);
    const bgColor = palette[Math.abs(hash) % palette.length];

    // High-res Google Favicon API
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;

    res.json({
      url: parsedUrlStr,
      hostname,
      title: autoTitle,
      icon_url: faviconUrl,
      bg_color: bgColor
    });
  } catch (err) {
    res.status(400).json({ error: 'Format URL tidak valid.' });
  }
});

// GET /api/web/:id — Detail satu bookmark
router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM web_bookmarks WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Bookmark web tidak ditemukan.' });
  res.json(item);
});

// POST /api/web — Tambah bookmark baru (Admin only)
router.post('/', requireAuth, (req, res) => {
  const db = getDb();
  const {
    title,
    url,
    category = 'Umum',
    icon_url = '',
    description = '',
    bg_color = '#272830',
    is_pinned = 0,
    sort_order = 0
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Nama/Judul bookmark wajib diisi.' });
  }
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL website wajib diisi.' });
  }

  let finalUrl = url.trim();
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'http://' + finalUrl;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO web_bookmarks (title, url, category, icon_url, description, bg_color, is_pinned, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      finalUrl,
      category.trim() || 'Umum',
      (icon_url || '').trim(),
      (description || '').trim(),
      bg_color || '#272830',
      is_pinned ? 1 : 0,
      parseInt(sort_order, 10) || 0
    );

    const insertedId = Number(result.lastInsertRowid);
    const createdItem = db.prepare('SELECT * FROM web_bookmarks WHERE id = ?').get(insertedId);

    logActivity(db, 'CREATE', 'web', insertedId, `Menambah bookmark web "${title}"`);

    res.status(201).json({
      success: true,
      message: 'Bookmark web berhasil ditambahkan.',
      item: createdItem
    });
  } catch (err) {
    res.status(500).json({ error: `Gagal menyimpan bookmark: ${err.message}` });
  }
});

// PUT /api/web/:id — Perbarui bookmark (Admin only)
router.put('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id, 10);
  const existing = db.prepare('SELECT * FROM web_bookmarks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Bookmark web tidak ditemukan.' });
  }

  const {
    title = existing.title,
    url = existing.url,
    category = existing.category,
    icon_url = existing.icon_url,
    description = existing.description,
    bg_color = existing.bg_color,
    is_pinned = existing.is_pinned,
    sort_order = existing.sort_order
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Nama/Judul bookmark wajib diisi.' });
  }
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL website wajib diisi.' });
  }

  let finalUrl = url.trim();
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'http://' + finalUrl;
  }

  try {
    const stmt = db.prepare(`
      UPDATE web_bookmarks
      SET title = ?, url = ?, category = ?, icon_url = ?, description = ?,
          bg_color = ?, is_pinned = ?, sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      title.trim(),
      finalUrl,
      category.trim() || 'Umum',
      (icon_url || '').trim(),
      (description || '').trim(),
      bg_color || '#272830',
      is_pinned ? 1 : 0,
      parseInt(sort_order, 10) || 0,
      id
    );

    const updatedItem = db.prepare('SELECT * FROM web_bookmarks WHERE id = ?').get(id);
    logActivity(db, 'UPDATE', 'web', id, `Memperbarui bookmark web "${title}"`);

    res.json({
      success: true,
      message: 'Bookmark web berhasil diperbarui.',
      item: updatedItem
    });
  } catch (err) {
    res.status(500).json({ error: `Gagal memperbarui bookmark: ${err.message}` });
  }
});

// DELETE /api/web/:id — Hapus bookmark (Admin only)
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id, 10);
  const existing = db.prepare('SELECT * FROM web_bookmarks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Bookmark web tidak ditemukan.' });
  }

  db.prepare('DELETE FROM web_bookmarks WHERE id = ?').run(id);
  logActivity(db, 'DELETE', 'web', id, `Menghapus bookmark web "${existing.title}"`);

  res.json({
    success: true,
    message: `Bookmark "${existing.title}" berhasil dihapus.`
  });
});

module.exports = router;
