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
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.display_name
    }
  });
});

module.exports = router;
