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
const webRoutes = require('./routes/web');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

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
app.use('/api/web', webRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/metadata', metadataRoutes);
app.get('/api/recent', (req, res, next) => {
  req.url = '/recent';
  settingsRoutes(req, res, next);
});
app.get(['/api/public/config', '/api/public-config'], (req, res, next) => {
  req.url = '/public-config';
  settingsRoutes(req, res, next);
});

// Health check endpoint for Docker, Kubernetes, & cloud PaaS (Render, Railway, Coolify)
app.get(['/api/health', '/healthz'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'SaumaBox',
    version: require('../package.json').version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
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
  const server = app.listen(PORT, HOST, () => {
    const { DB_PATH } = require('./db');
    console.log(`\n======================================================`);
    console.log(`🎮 SaumaBox — All-in-One Personal Media Catalog`);
    console.log(`🌐 Server aktif di: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`📁 Database: ${DB_PATH} (WAL Mode)`);
    console.log(`======================================================\n`);
  });

  const handleShutdown = (signal) => {
    console.log(`\n[${signal}] Menutup server SaumaBox secara aman...`);
    server.close(() => {
      const { closeDb } = require('./db');
      closeDb();
      console.log('Koneksi database SQLite ditutup. Selesai.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Batas waktu penutupan habis, mematikan proses paksa.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

module.exports = app;
