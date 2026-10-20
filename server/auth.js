const crypto = require('node:crypto');
const { getDb } = require('./db');

// Password hashing menggunakan native crypto.scrypt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(userId, rememberMe = false) {
  const db = getDb();
  const token = generateToken();
  const days = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const stmt = db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)');
  stmt.run(userId, token, expiresAt);

  return { token, expiresAt };
}

function deleteSession(token) {
  if (!token) return;
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

function getUserFromToken(token) {
  if (!token) return null;
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    SELECT u.id, u.username, u.display_name, s.token, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ?
  `);
  const user = stmt.get(token, now);
  return user || null;
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.saumabox_token || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (token) {
    req.user = getUserFromToken(token);
  } else {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Akses ditolak. Silakan login sebagai administrator.' });
  }
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  getUserFromToken,
  authMiddleware,
  requireAuth
};
