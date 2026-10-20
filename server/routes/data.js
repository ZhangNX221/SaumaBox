const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { getDb, logActivity, DB_PATH, BACKUP_DIR, DB_DIR } = require('../db');
const { requireAuth } = require('../auth');
const {
  cleanPrice,
  cleanRating,
  cleanYear,
  cleanSizeGb,
  cleanText,
  cleanWatched,
  parseCSV,
  generateCSV,
  autoMapColumns
} = require('../parser');

const UPLOADS_DIR = path.join(DB_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// POST /api/data/import-preview — Mengunggah file CSV/JSON & menghasilkan preview mapping
router.post('/import-preview', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File wajib diunggah.' });
  }

  const filePath = req.file.path;
  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    let headers = [];
    let sampleRows = [];
    let totalRows = 0;

    const isJson = req.file.originalname.toLowerCase().endsWith('.json') || rawContent.trim().startsWith('[');

    if (isJson) {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        headers = Object.keys(parsed[0]);
        sampleRows = parsed.slice(0, 5);
        totalRows = parsed.length;
      } else {
        return res.status(400).json({ error: 'Format JSON harus berupa array of objects.' });
      }
    } else {
      const csvResult = parseCSV(rawContent);
      headers = csvResult.headers;
      sampleRows = csvResult.rows.slice(0, 5);
      totalRows = csvResult.rows.length;
    }

    const suggestedMapping = autoMapColumns(headers);

    res.json({
      temp_file_id: path.basename(filePath),
      filename: req.file.originalname,
      total_rows: totalRows,
      headers,
      suggested_mapping: suggestedMapping,
      sample_rows: sampleRows
    });
  } catch (err) {
    fs.unlink(filePath, () => {});
    res.status(500).json({ error: `Gagal membaca file: ${err.message}` });
  }
});

// POST /api/data/import-execute — Mengeksekusi import data ke modul target
router.post('/import-execute', requireAuth, (req, res) => {
  const { temp_file_id, module: targetModule, mapping, sub_type } = req.body;
  if (!temp_file_id || !targetModule || !mapping) {
    return res.status(400).json({ error: 'Parameter import tidak lengkap.' });
  }

  const filePath = path.join(UPLOADS_DIR, temp_file_id);
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Sesi file import telah kedaluwarsa. Silakan upload ulang.' });
  }

  const db = getDb();

  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    let rows = [];

    if (filePath.endsWith('.json') || rawContent.trim().startsWith('[')) {
      rows = JSON.parse(rawContent);
    } else {
      rows = parseCSV(rawContent).rows;
    }

    let successCount = 0;
    let failedCount = 0;

    if (targetModule === 'games') {
      const stmt = db.prepare(`
        INSERT INTO games (
          type, title, year, publisher, developer, size_gb, rating, status,
          platform, price, console, emulator, rom_format, port_year,
          port_developer, port_version, enhancements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of rows) {
        const titleVal = row[mapping.title];
        if (!titleVal || !String(titleVal).trim()) {
          failedCount++;
          continue;
        }

        const typeVal = (sub_type || row[mapping.type] || 'PC').toUpperCase();
        const safeType = ['PC', 'EMULATOR', 'RECOMP'].includes(typeVal) ? typeVal : 'PC';

        stmt.run(
          safeType,
          String(titleVal).trim(),
          cleanYear(row[mapping.year]),
          cleanText(row[mapping.publisher]),
          cleanText(row[mapping.developer]),
          cleanSizeGb(row[mapping.size_gb]),
          cleanRating(row[mapping.rating]),
          cleanText(row[mapping.status]),
          cleanText(row[mapping.platform]),
          cleanPrice(row[mapping.price]),
          cleanText(row[mapping.console]),
          cleanText(row[mapping.emulator]),
          cleanText(row[mapping.rom_format]),
          cleanYear(row[mapping.port_year]),
          cleanText(row[mapping.port_developer]),
          cleanText(row[mapping.port_version]),
          cleanText(row[mapping.enhancements])
        );
        successCount++;
      }
    } else if (targetModule === 'cinema') {
      const stmt = db.prepare(`
        INSERT INTO cinema (
          type, title, rating, year, country, studio, genre,
          age_rating, total_episodes, total_seasons, watched
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of rows) {
        const titleVal = row[mapping.title];
        if (!titleVal || !String(titleVal).trim()) {
          failedCount++;
          continue;
        }

        const typeVal = (sub_type || row[mapping.type] || 'MOVIE').toUpperCase();
        const safeType = ['MOVIE', 'SERIES', 'ANIME'].includes(typeVal) ? typeVal : 'MOVIE';

        stmt.run(
          safeType,
          String(titleVal).trim(),
          cleanRating(row[mapping.rating]),
          cleanYear(row[mapping.year]),
          cleanText(row[mapping.country]),
          cleanText(row[mapping.studio]),
          cleanText(row[mapping.genre]),
          cleanText(row[mapping.age_rating]),
          row[mapping.total_episodes] ? parseInt(row[mapping.total_episodes], 10) : null,
          row[mapping.total_seasons] ? parseInt(row[mapping.total_seasons], 10) : null,
          cleanWatched(row[mapping.watched])
        );
        successCount++;
      }
    } else if (targetModule === 'music') {
      const stmt = db.prepare(`
        INSERT INTO music (
          title, artist, album, year, genre, platform, size_mb, rating, is_favorite, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of rows) {
        const titleVal = row[mapping.title];
        if (!titleVal || !String(titleVal).trim()) {
          failedCount++;
          continue;
        }

        stmt.run(
          String(titleVal).trim(),
          cleanText(row[mapping.artist]),
          cleanText(row[mapping.album]),
          cleanYear(row[mapping.year]),
          cleanText(row[mapping.genre]),
          cleanText(row[mapping.platform]),
          row[mapping.size_mb] ? parseFloat(row[mapping.size_mb]) : null,
          cleanRating(row[mapping.rating]),
          row[mapping.is_favorite] ? 1 : 0,
          cleanText(row[mapping.notes])
        );
        successCount++;
      }
    }

    // Bersihkan file temporary
    fs.unlink(filePath, () => {});

    logActivity(db, 'IMPORT', targetModule, null, `${successCount} baris diimport (${failedCount} dilewati)`);

    res.json({
      success: true,
      success_count: successCount,
      failed_count: failedCount
    });
  } catch (err) {
    fs.unlink(filePath, () => {});
    res.status(500).json({ error: `Gagal mengimpor data: ${err.message}` });
  }
});

// GET /api/data/export — Mengekspor data ke CSV atau JSON
router.get('/export', requireAuth, (req, res) => {
  const { module: targetModule, format = 'csv', type } = req.query;
  const db = getDb();

  let data = [];
  let headers = [];
  let filename = `saumabox_${targetModule}_${new Date().toISOString().slice(0, 10)}`;

  if (targetModule === 'games') {
    const where = type && type !== 'ALL' ? "WHERE type = '" + type.toUpperCase() + "'" : '';
    data = db.prepare(`SELECT * FROM games ${where} ORDER BY id ASC`).all();
    headers = [
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Tipe' },
      { key: 'title', label: 'Judul Game' },
      { key: 'year', label: 'Tahun' },
      { key: 'publisher', label: 'Publisher' },
      { key: 'developer', label: 'Developer' },
      { key: 'size_gb', label: 'Ukuran (GB)' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status' },
      { key: 'platform', label: 'Platform' },
      { key: 'price', label: 'Harga (IDR)' },
      { key: 'console', label: 'Konsol' },
      { key: 'emulator', label: 'Emulator' },
      { key: 'rom_format', label: 'Format ROM' },
      { key: 'port_year', label: 'Tahun Port' },
      { key: 'port_developer', label: 'Port Developer' },
      { key: 'port_version', label: 'Port Version' },
      { key: 'enhancements', label: 'Enhancements' }
    ];
  } else if (targetModule === 'cinema') {
    const where = type && type !== 'ALL' ? "WHERE type = '" + type.toUpperCase() + "'" : '';
    data = db.prepare(`SELECT * FROM cinema ${where} ORDER BY id ASC`).all();
    headers = [
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Tipe' },
      { key: 'title', label: 'Judul' },
      { key: 'rating', label: 'Rating (IMDb)' },
      { key: 'year', label: 'Tahun' },
      { key: 'country', label: 'Negara' },
      { key: 'studio', label: 'Studio' },
      { key: 'genre', label: 'Genre' },
      { key: 'age_rating', label: 'Rating Umur' },
      { key: 'total_episodes', label: 'Total Episode' },
      { key: 'total_seasons', label: 'Total Season' },
      { key: 'watched', label: 'Ditonton (1/0)' }
    ];
  } else if (targetModule === 'music') {
    data = db.prepare('SELECT * FROM music ORDER BY id ASC').all();
    headers = [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Judul' },
      { key: 'artist', label: 'Artis' },
      { key: 'album', label: 'Album' },
      { key: 'year', label: 'Tahun' },
      { key: 'genre', label: 'Genre' },
      { key: 'platform', label: 'Platform' },
      { key: 'size_mb', label: 'Ukuran (MB)' },
      { key: 'rating', label: 'Rating' },
      { key: 'is_favorite', label: 'Favorit (1/0)' },
      { key: 'notes', label: 'Catatan' }
    ];
  } else {
    return res.status(400).json({ error: 'Modul export tidak dikenal.' });
  }

  logActivity(db, 'EXPORT', targetModule, null, `${data.length} baris diekspor (${format})`);

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  } else {
    const csvContent = generateCSV(headers, data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send('\uFEFF' + csvContent); // Include UTF-8 BOM agar rapi di Excel
  }
});

// GET /api/data/backup — 1-Click Database Backup (.sqlite file download)
router.get('/backup', requireAuth, (req, res) => {
  const db = getDb();
  try {
    // Flush WAL buffer ke file utama
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const backupFileName = `catalog_backup_${timestamp}.sqlite`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    // Salin file database
    fs.copyFileSync(DB_PATH, backupFilePath);

    // Perbarui setting waktu backup terakhir
    db.prepare("UPDATE app_settings SET value = ?, updated_at = datetime('now') WHERE key = 'last_backup_at'").run(now.toISOString());
    logActivity(db, 'BACKUP', 'system', null, `Database backed up to ${backupFileName}`);

    res.download(backupFilePath, backupFileName);
  } catch (err) {
    res.status(500).json({ error: `Gagal membuat backup database: ${err.message}` });
  }
});

// POST /api/data/restore — 1-Click Database Restore dengan validasi integritas & auto rollback
router.post('/restore', requireAuth, upload.single('backup_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File backup (.sqlite) wajib diunggah.' });
  }

  const uploadedPath = req.file.path;

  try {
    // Validasi 1: Uji integritas SQLite menggunakan connection terisolasi
    const testDb = new DatabaseSync(uploadedPath);
    const integrityResult = testDb.prepare('PRAGMA integrity_check;').get();

    if (!integrityResult || integrityResult['integrity_check'] !== 'ok') {
      testDb.close();
      fs.unlinkSync(uploadedPath);
      return res.status(400).json({ error: 'File backup korup atau tidak lulus validasi integritas SQLite.' });
    }

    // Validasi 2: Verifikasi tabel-tabel utama harus ada
    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
    const requiredTables = ['games', 'cinema', 'music', 'users', 'app_settings'];
    const missing = requiredTables.filter(t => !tables.includes(t));

    if (missing.length > 0) {
      testDb.close();
      fs.unlinkSync(uploadedPath);
      return res.status(400).json({ error: `File backup tidak memiliki skema yang valid. Tabel tidak ditemukan: ${missing.join(', ')}` });
    }

    testDb.close();

    // Buat rollback snapshot otomatis sebelum restore
    const rollbackPath = path.join(BACKUP_DIR, 'auto_backup_before_restore.sqlite');
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, rollbackPath);
    }

    // Ganti file database aktif dengan file yang baru diunggah
    fs.copyFileSync(uploadedPath, DB_PATH);
    fs.unlinkSync(uploadedPath);

    // Bersihkan WAL & SHM lama jika ada
    if (fs.existsSync(`${DB_PATH}-wal`)) fs.unlinkSync(`${DB_PATH}-wal`);
    if (fs.existsSync(`${DB_PATH}-shm`)) fs.unlinkSync(`${DB_PATH}-shm`);

    const freshDb = getDb();
    logActivity(freshDb, 'RESTORE', 'system', null, 'Database restored successfully from backup');

    res.json({
      success: true,
      message: 'Database berhasil dipulihkan. Snapshot rollback disimpan di auto_backup_before_restore.sqlite.'
    });
  } catch (err) {
    if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    res.status(500).json({ error: `Gagal memulihkan database: ${err.message}` });
  }
});

module.exports = router;
