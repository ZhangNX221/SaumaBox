const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { getDb, closeDb, logActivity, DB_PATH, BACKUP_DIR, DB_DIR } = require('../db');
const { requireAuth } = require('../auth');
const { parseExcel, generateExcel } = require('../excel');
const { compressImageFile } = require('../imageOptimizer');
const {
  cleanPrice,
  cleanRating,
  cleanYear,
  cleanSizeGb,
  cleanText,
  cleanWatched,
  cleanCompleted,
  parseCSV,
  generateCSV,
  autoMapColumns
} = require('../parser');

const UPLOADS_DIR = path.join(DB_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage dengan mempertahankan ekstensi asli untuk deteksi tipe file (.xlsx, .csv, .json)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const COVERS_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'covers');
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, COVERS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});

const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (allowed.includes(file.mimetype) || /\.(jpe?g|png|webp|svg|gif)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya berkas gambar (JPG, PNG, WebP, SVG, GIF) yang diperbolehkan.'));
    }
  }
});

// POST /api/data/upload-cover — Unggah gambar cover/poster manual
router.post('/upload-cover', requireAuth, coverUpload.single('cover_image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Berkas gambar wajib dipilih.' });
  }

  // Auto-kompres cover gambar ke max 200 KB (target 100-200 KB)
  try {
    await compressImageFile(req.file.path);
  } catch (err) {
    console.error('[Upload Cover] Gagal kompres:', err.message);
  }

  const finalStat = fs.statSync(req.file.path);
  res.json({
    success: true,
    url: `/images/covers/${req.file.filename}`,
    filename: req.file.filename,
    size: finalStat.size
  });
});

// POST /api/data/import-preview — Mengunggah file Excel/CSV/JSON & menghasilkan preview mapping
router.post('/import-preview', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File wajib diunggah.' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const isExcel = ['.xlsx', '.xls'].includes(ext);
  const isJson = ext === '.json';

  try {
    let headers = [];
    let sampleRows = [];
    let totalRows = 0;
    let sheets = [];
    let activeSheet = null;

    if (isExcel) {
      const excelData = parseExcel(filePath, req.body.sheet_name || null);
      headers = excelData.headers;
      sampleRows = excelData.rows.slice(0, 5);
      totalRows = excelData.totalRows;
      sheets = excelData.sheets;
      activeSheet = excelData.sheetName;
    } else if (isJson) {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        headers = Object.keys(parsed[0]);
        sampleRows = parsed.slice(0, 5);
        totalRows = parsed.length;
      } else {
        return res.status(400).json({ error: 'Format JSON harus berupa array of objects.' });
      }
    } else {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const csvResult = parseCSV(rawContent);
      headers = csvResult.headers;
      sampleRows = csvResult.rows.slice(0, 5);
      totalRows = csvResult.rows.length;
    }

    const suggestedMapping = autoMapColumns(headers);

    res.json({
      temp_file_id: path.basename(filePath),
      filename: req.file.originalname,
      format: isExcel ? 'excel' : (isJson ? 'json' : 'csv'),
      total_rows: totalRows,
      headers,
      suggested_mapping: suggestedMapping,
      sample_rows: sampleRows,
      sheets,
      sheet_name: activeSheet
    });
  } catch (err) {
    fs.unlink(filePath, () => {});
    res.status(500).json({ error: `Gagal membaca file ${ext}: ${err.message}` });
  }
});

// POST /api/data/import-execute — Mengeksekusi import data ke modul target
router.post('/import-execute', requireAuth, (req, res) => {
  const { temp_file_id, module: targetModule, mapping, sub_type, sheet_name } = req.body;
  if (!temp_file_id || !targetModule || !mapping) {
    return res.status(400).json({ error: 'Parameter import tidak lengkap.' });
  }

  const filePath = path.join(UPLOADS_DIR, temp_file_id);
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Sesi file import telah kedaluwarsa. Silakan upload ulang.' });
  }

  const db = getDb();
  const ext = path.extname(filePath).toLowerCase();

  try {
    let rows = [];

    if (['.xlsx', '.xls'].includes(ext)) {
      rows = parseExcel(filePath, sheet_name || null).rows;
    } else if (ext === '.json') {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      rows = JSON.parse(rawContent);
    } else {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      rows = parseCSV(rawContent).rows;
    }

    let successCount = 0;
    let failedCount = 0;

    if (targetModule === 'games') {
      const stmt = db.prepare(`
        INSERT INTO games (
          type, title, year, release_date, genre, publisher, developer, size_gb, rating, status,
          platform, price, console, emulator, rom_format, port_year,
          port_developer, port_version, enhancements, cover_url, completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of rows) {
        const titleVal = row[mapping.title];
        if (!titleVal || !String(titleVal).trim()) {
          failedCount++;
          continue;
        }

        const typeVal = (sub_type || row[mapping.type] || 'PC').toUpperCase();
        const safeType = ['PC', 'EMULATOR', 'RECOMP', 'MOBILE'].includes(typeVal) ? typeVal : 'PC';

        stmt.run(
          safeType,
          String(titleVal).trim(),
          cleanYear(row[mapping.year]),
          cleanText(row[mapping.release_date]),
          cleanText(row[mapping.genre]),
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
          cleanText(row[mapping.enhancements]),
          cleanText(row[mapping.cover_url]),
          cleanCompleted(row[mapping.completed])
        );
        successCount++;
      }
    } else if (targetModule === 'cinema') {
      const stmt = db.prepare(`
        INSERT INTO cinema (
          type, title, rating, year, country, studio, genre,
          age_rating, total_episodes, total_seasons, watched, director, cast, synopsis, cover_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          cleanWatched(row[mapping.watched]),
          cleanText(row[mapping.director]),
          cleanText(row[mapping.cast]),
          cleanText(row[mapping.synopsis]),
          cleanText(row[mapping.cover_url])
        );
        successCount++;
      }
    } else if (targetModule === 'music') {
      const stmt = db.prepare(`
        INSERT INTO music (
          title, artist, album, year, genre, platform, size_mb, rating, is_favorite, notes, duration_secs, lyrics, cover_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          cleanText(row[mapping.notes]),
          row[mapping.duration_secs] ? parseInt(row[mapping.duration_secs], 10) : null,
          cleanText(row[mapping.lyrics]),
          cleanText(row[mapping.cover_url])
        );
        successCount++;
      }
    }

    fs.unlink(filePath, () => {});
    logActivity(db, 'IMPORT', targetModule, null, `${successCount} baris diimport (${ext})`);

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

// GET /api/data/export — Mengekspor data ke Excel (.xlsx), CSV, atau JSON
router.get('/export', requireAuth, (req, res) => {
  const { module: targetModule, format = 'xlsx', type } = req.query;
  const db = getDb();
  const exportFormat = String(format).toLowerCase();

  let data = [];
  let headers = [];
  const filename = `saumabox_${targetModule}_${new Date().toISOString().slice(0, 10)}`;

  if (targetModule === 'games') {
    const where = type && type !== 'ALL' ? "WHERE type = '" + type.toUpperCase() + "'" : '';
    data = db.prepare(`SELECT * FROM games ${where} ORDER BY id ASC`).all();
    headers = [
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Tipe' },
      { key: 'title', label: 'Judul Game' },
      { key: 'year', label: 'Tahun' },
      { key: 'release_date', label: 'Tanggal Rilis' },
      { key: 'genre', label: 'Genre' },
      { key: 'publisher', label: 'Penerbit' },
      { key: 'developer', label: 'Pengembang' },
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
      { key: 'enhancements', label: 'Fitur Tambahan' },
      { key: 'cover_url', label: 'URL Cover' },
      { key: 'completed', label: 'Tamat (1/0)' }
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
      { key: 'age_rating', label: 'Rating Usia' },
      { key: 'total_episodes', label: 'Total Episode' },
      { key: 'total_seasons', label: 'Total Season' },
      { key: 'watched', label: 'Ditonton (1/0)' },
      { key: 'director', label: 'Sutradara' },
      { key: 'cast', label: 'Pemeran' },
      { key: 'synopsis', label: 'Sinopsis' },
      { key: 'cover_url', label: 'URL Poster' }
    ];
  } else if (targetModule === 'music') {
    data = db.prepare('SELECT * FROM music ORDER BY id ASC').all();
    headers = [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Judul Trek' },
      { key: 'artist', label: 'Artis' },
      { key: 'album', label: 'Album' },
      { key: 'year', label: 'Tahun' },
      { key: 'genre', label: 'Genre' },
      { key: 'platform', label: 'Platform' },
      { key: 'size_mb', label: 'Ukuran (MB)' },
      { key: 'rating', label: 'Rating' },
      { key: 'is_favorite', label: 'Favorit (1/0)' },
      { key: 'duration_secs', label: 'Durasi (detik)' },
      { key: 'notes', label: 'Catatan' },
      { key: 'cover_url', label: 'URL Cover' }
    ];
  } else {
    return res.status(400).json({ error: 'Modul export tidak dikenal.' });
  }

  logActivity(db, 'EXPORT', targetModule, null, `${data.length} baris diekspor (${exportFormat})`);

  if (exportFormat === 'xlsx' || exportFormat === 'excel') {
    const excelBuffer = generateExcel(targetModule, data, headers);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    return res.send(excelBuffer);
  } else if (exportFormat === 'json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  } else {
    const csvContent = generateCSV(headers, data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send('\uFEFF' + csvContent);
  }
});

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// GET /api/data/backups — Daftar riwayat berkas cadangan database
router.get('/backups', requireAuth, (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(f => f.endsWith('.sqlite'))
      .map(f => {
        const fullPath = path.join(BACKUP_DIR, f);
        let stat = { size: 0, mtime: new Date() };
        try { stat = fs.statSync(fullPath); } catch (_) {}
        let type = 'Manual';
        if (f.startsWith('auto_backup_')) type = 'Auto-Rollback';
        else if (f.startsWith('catalog_backup_')) type = 'Manual';
        else type = 'Snapshot';

        return {
          filename: f,
          size_bytes: stat.size,
          size_formatted: formatBytes(stat.size),
          created_at: stat.mtime.toISOString(),
          type
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: `Gagal membaca riwayat cadangan: ${err.message}` });
  }
});

// GET /api/data/backups/:filename — Unduh berkas cadangan spesifik dari riwayat
router.get('/backups/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Berkas cadangan tidak ditemukan di server.' });
  }
  res.download(filePath, filename);
});

// POST /api/data/backups/:filename/restore — Pulihkan database dari riwayat cadangan
router.post('/backups/:filename/restore', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Berkas cadangan tidak ditemukan.' });
  }

  try {
    const testDb = new DatabaseSync(filePath);
    const integrityResult = testDb.prepare('PRAGMA integrity_check;').get();
    if (!integrityResult || integrityResult['integrity_check'] !== 'ok') {
      testDb.close();
      return res.status(400).json({ error: 'Berkas cadangan korup atau tidak lulus validasi integritas SQLite.' });
    }
    testDb.close();

    const rollbackPath = path.join(BACKUP_DIR, 'auto_backup_before_restore.sqlite');
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, rollbackPath);
    }

    closeDb();
    if (fs.existsSync(`${DB_PATH}-wal`)) {
      try { fs.unlinkSync(`${DB_PATH}-wal`); } catch (_) {}
    }
    if (fs.existsSync(`${DB_PATH}-shm`)) {
      try { fs.unlinkSync(`${DB_PATH}-shm`); } catch (_) {}
    }
    fs.copyFileSync(filePath, DB_PATH);

    const freshDb = getDb();
    logActivity(freshDb, 'RESTORE', 'system', null, `Database restored from historical backup ${filename}`);

    res.json({
      success: true,
      message: `Database berhasil dipulihkan dari cadangan ${filename}. Snapshot tersimpan di auto_backup_before_restore.sqlite.`
    });
  } catch (err) {
    res.status(500).json({ error: `Gagal memulihkan database: ${err.message}` });
  }
});

// DELETE /api/data/backups/:filename — Hapus berkas cadangan dari riwayat
router.delete('/backups/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(BACKUP_DIR, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      const db = getDb();
      logActivity(db, 'DELETE_BACKUP', 'system', null, filename);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: `Gagal menghapus berkas: ${err.message}` });
    }
  }
  res.status(404).json({ error: 'Berkas cadangan tidak ditemukan.' });
});

// GET /api/data/backup — 1-Click Database Backup (.sqlite file download)
router.get('/backup', requireAuth, (req, res) => {
  const db = getDb();
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const backupFileName = `catalog_backup_${timestamp}.sqlite`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    fs.copyFileSync(DB_PATH, backupFilePath);
    db.prepare("UPDATE app_settings SET value = ?, updated_at = datetime('now') WHERE key = 'last_backup_at'").run(now.toISOString());
    logActivity(db, 'BACKUP', 'system', null, `Database backed up to ${backupFileName}`);

    res.download(backupFilePath, backupFileName);
  } catch (err) {
    res.status(500).json({ error: `Gagal membuat backup database: ${err.message}` });
  }
});

// POST /api/data/restore — 1-Click Database Restore
router.post('/restore', requireAuth, upload.single('backup_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File backup (.sqlite) wajib diunggah.' });
  }

  const uploadedPath = req.file.path;
  try {
    const testDb = new DatabaseSync(uploadedPath);
    const integrityResult = testDb.prepare('PRAGMA integrity_check;').get();

    if (!integrityResult || integrityResult['integrity_check'] !== 'ok') {
      testDb.close();
      fs.unlinkSync(uploadedPath);
      return res.status(400).json({ error: 'File backup korup atau tidak lulus validasi integritas SQLite.' });
    }

    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
    const requiredTables = ['games', 'cinema', 'music', 'users', 'app_settings'];
    const missing = requiredTables.filter(t => !tables.includes(t));

    if (missing.length > 0) {
      testDb.close();
      fs.unlinkSync(uploadedPath);
      return res.status(400).json({ error: `File backup tidak memiliki skema yang valid. Tabel tidak ditemukan: ${missing.join(', ')}` });
    }

    testDb.close();

    const rollbackPath = path.join(BACKUP_DIR, 'auto_backup_before_restore.sqlite');
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, rollbackPath);
    }

    closeDb();
    if (fs.existsSync(`${DB_PATH}-wal`)) {
      try { fs.unlinkSync(`${DB_PATH}-wal`); } catch (_) {}
    }
    if (fs.existsSync(`${DB_PATH}-shm`)) {
      try { fs.unlinkSync(`${DB_PATH}-shm`); } catch (_) {}
    }
    fs.copyFileSync(uploadedPath, DB_PATH);
    fs.unlinkSync(uploadedPath);

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
