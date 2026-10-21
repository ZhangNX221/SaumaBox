const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const fs = require('node:fs');
const { getDb } = require('./db');
const { authMiddleware } = require('./auth');

const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const cinemaRoutes = require('./routes/cinema');
const musicRoutes = require('./routes/music');
const settingsRoutes = require('./routes/settings');
const dataRoutes = require('./routes/data');
const taxonomyRoutes = require('./routes/taxonomy');
const metadataRoutes = require('./routes/metadata');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Initialize database
getDb();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/cinema', cinemaRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/metadata', metadataRoutes);
app.get('/api/recent', (req, res, next) => {
  req.url = '/recent';
  settingsRoutes(req, res, next);
});


// Static assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// SPA Fallback: kirim index.html untuk semua rute non-API
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
  }
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎮 SaumaBox — All-in-One Personal Media Catalog`);
    console.log(`🌐 Server aktif di: http://localhost:${PORT}`);
    console.log(`📁 Database: data/saumabox.sqlite (WAL Mode)`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
