const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getDb, logActivity } = require('../db');
const { hashPassword, verifyPassword, createSession, deleteSession, requireAuth } = require('../auth');
const { compressImageFile } = require('../imageOptimizer');

const AVATARS_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'avatars');
if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar-${req.user ? req.user.id : 'user'}-${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype) || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya berkas gambar (JPG, PNG, WebP, GIF, SVG) yang diperbolehkan.'));
    }
  }
});

// Cek apakah sistem butuh initial setup (belum ada admin)
router.get('/setup-status', (req, res) => {
  const db = getDb();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const appNameRow = db.prepare("SELECT value FROM app_settings WHERE key = 'app_name'").get();
  res.json({
    needsSetup: userCount === 0,
    appName: appNameRow ? appNameRow.value : 'SaumaBox'
  });
});

// Setup akun admin pertama kali
router.post('/setup', (req, res) => {
  const db = getDb();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return res.status(400).json({ error: 'Setup sudah pernah dilakukan. Silakan gunakan halaman login.' });
  }

  const { username, password, displayName, catalogName, enablePublic } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  const pwdHash = hashPassword(password);
  const stmt = db.prepare('INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)');
  const result = stmt.run(username.trim(), pwdHash, displayName ? displayName.trim() : username.trim());
  const userId = Number(result.lastInsertRowid);

  if (catalogName) {
    db.prepare("UPDATE app_settings SET value = ? WHERE key = 'app_name'").run(catalogName.trim());
  }
  if (enablePublic !== undefined) {
    db.prepare("UPDATE app_settings SET value = ? WHERE key = 'public_sharing_enabled'").run(enablePublic ? 'true' : 'false');
  }

  logActivity(db, 'SETUP', 'auth', userId, username, 'First-time system setup completed');

  const { token, expiresAt } = createSession(userId, true);
  res.cookie('saumabox_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    token,
    user: {
      id: userId,
      username: username.trim(),
      displayName: displayName || username.trim()
    }
  });
});

// Login admin
router.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const { token, expiresAt } = createSession(user.id, !!rememberMe);
  res.cookie('saumabox_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
  });

  logActivity(db, 'LOGIN', 'auth', user.id, user.username, 'Admin logged in');

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url || ''
    }
  });
});

// Logout admin
router.post('/logout', (req, res) => {
  const token = req.cookies?.saumabox_token || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (token) {
    deleteSession(token);
  }
  res.clearCookie('saumabox_token');
  res.json({ success: true, message: 'Berhasil keluar.' });
});

// Info user saat ini
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }
  const db = getDb();
  const user = db.prepare('SELECT id, username, display_name, email, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({
    authenticated: true,
    user: user ? {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email || '',
      role: user.role || 'super_admin',
      avatarUrl: user.avatar_url || '',
      createdAt: user.created_at
    } : {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.display_name,
      email: req.user.email || '',
      role: req.user.role || 'super_admin',
      avatarUrl: req.user.avatar_url || ''
    }
  });
});

// Perbarui Profil Akun
router.put('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sesi login tidak valid atau telah berakhir.' });
  }

  const { displayName, email, username } = req.body;
  const db = getDb();

  if (displayName !== undefined && !displayName.trim()) {
    return res.status(400).json({ error: 'Nama tampilan tidak boleh kosong.' });
  }
  if (username !== undefined && !username.trim()) {
    return res.status(400).json({ error: 'Username tidak boleh kosong.' });
  }

  const newDisplayName = displayName !== undefined ? displayName.trim() : req.user.display_name;
  const newEmail = email !== undefined ? email.trim() : (req.user.email || '');
  const newUsername = username !== undefined ? username.trim() : req.user.username;

  // Cek keunikan username jika diganti
  if (newUsername.toLowerCase() !== req.user.username.toLowerCase()) {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?').get(newUsername, req.user.id);
    if (existing) {
      return res.status(400).json({ error: `Username "${newUsername}" sudah digunakan oleh akun lain.` });
    }
  }

  db.prepare('UPDATE users SET display_name = ?, email = ?, username = ? WHERE id = ?')
    .run(newDisplayName, newEmail, newUsername, req.user.id);

  logActivity(db, 'UPDATE_PROFILE', 'auth', req.user.id, newUsername, `Profil diperbarui: ${newDisplayName}`);

  const updated = db.prepare('SELECT id, username, display_name, email, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);

  res.json({
    success: true,
    message: 'Profil akun berhasil diperbarui.',
    user: {
      id: updated.id,
      username: updated.username,
      displayName: updated.display_name,
      email: updated.email || '',
      role: updated.role || 'super_admin',
      avatarUrl: updated.avatar_url || '',
      createdAt: updated.created_at
    }
  });
});

// Ganti Password Akun
router.put('/password', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sesi login tidak valid atau telah berakhir.' });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Password saat ini dan password baru wajib diisi.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
  }
  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Konfirmasi password baru tidak cocok.' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Password saat ini salah.' });
  }

  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

  logActivity(db, 'CHANGE_PASSWORD', 'auth', user.id, user.username, 'Password akun berhasil diubah');

  res.json({
    success: true,
    message: 'Password akun berhasil diperbarui.'
  });
});

// POST /api/auth/avatar — Unggah foto profil
router.post('/avatar', requireAuth, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Berkas foto profil wajib dipilih.' });
  }

  // Auto-kompres avatar ke max 200 KB (target 100-200 KB)
  try {
    await compressImageFile(req.file.path);
  } catch (err) {
    console.error('[Upload Avatar] Gagal kompres:', err.message);
  }

  const db = getDb();
  const avatarUrl = `/images/avatars/${req.file.filename}`;

  try {
    const prev = db.prepare('SELECT avatar_url FROM users WHERE id = ?').get(req.user.id);
    if (prev && prev.avatar_url && prev.avatar_url.startsWith('/images/avatars/')) {
      const oldPath = path.join(__dirname, '..', '..', 'public', prev.avatar_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  } catch (err) {
    // Abaikan error cleanup berkas lama
  }

  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.user.id);
  logActivity(db, 'UPDATE_AVATAR', 'auth', req.user.id, req.user.username, 'Foto profil berhasil diperbarui');

  const updated = db.prepare('SELECT id, username, display_name, email, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);

  res.json({
    success: true,
    message: 'Foto profil berhasil diperbarui.',
    avatarUrl,
    user: {
      id: updated.id,
      username: updated.username,
      displayName: updated.display_name,
      email: updated.email || '',
      role: updated.role || 'super_admin',
      avatarUrl: updated.avatar_url || '',
      createdAt: updated.created_at
    }
  });
});

// DELETE /api/auth/avatar — Hapus foto profil
router.delete('/avatar', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const prev = db.prepare('SELECT avatar_url FROM users WHERE id = ?').get(req.user.id);
    if (prev && prev.avatar_url && prev.avatar_url.startsWith('/images/avatars/')) {
      const oldPath = path.join(__dirname, '..', '..', 'public', prev.avatar_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  } catch (err) {
    // Abaikan error cleanup berkas lama
  }

  db.prepare("UPDATE users SET avatar_url = '' WHERE id = ?").run(req.user.id);
  logActivity(db, 'DELETE_AVATAR', 'auth', req.user.id, req.user.username, 'Foto profil dihapus');

  const updated = db.prepare('SELECT id, username, display_name, email, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);

  res.json({
    success: true,
    message: 'Foto profil berhasil dihapus.',
    user: {
      id: updated.id,
      username: updated.username,
      displayName: updated.display_name,
      email: updated.email || '',
      role: updated.role || 'super_admin',
      avatarUrl: '',
      createdAt: updated.created_at
    }
  });
});

module.exports = router;

