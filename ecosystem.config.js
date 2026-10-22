module.exports = {
  apps: [
    {
      name: 'saumabox',
      script: 'server/index.js',
      // PENTING: Gunakan 1 instance (fork mode) agar SQLite WAL aman dari conflict concurrent writer
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
};
