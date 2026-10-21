const express = require('express');
const router = express.Router();
const { getDb, logActivity } = require('../db');
const { hashPassword, verifyPassword, createSession, deleteSession } = require('../auth');

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
      displayName: user.display_name
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
  const user = db.prepare('SELECT id, username, display_name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({
    authenticated: true,
    user: user ? {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email || '',
      role: user.role || 'super_admin',
      createdAt: user.created_at
    } : {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.display_name,
      email: req.user.email || '',
      role: req.user.role || 'super_admin'
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

  const updated = db.prepare('SELECT id, username, display_name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);

  res.json({
    success: true,
    message: 'Profil akun berhasil diperbarui.',
    user: {
      id: updated.id,
      username: updated.username,
      displayName: updated.display_name,
      email: updated.email || '',
      role: updated.role || 'super_admin',
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

module.exports = router;
