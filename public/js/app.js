// ============================================================
// SaumaBox — Single Page Application (SPA) Controller
// ============================================================

const app = {
  state: {
    user: null,
    currentTab: 'landing',
    theme: localStorage.getItem('saumabox_theme') || 'dark',
    publicConfig: {
      app_name: 'SaumaBox',
      public_sharing_enabled: true,
      public_games_enabled: true,
      public_cinema_enabled: true,
      public_music_enabled: true,
      public_show_prices: true,
      public_show_ratings: true
    },
    // Games state
    games: {
      items: [],
      type: 'ALL',
      q: '',
      platform: 'ALL',
      status: 'ALL',
      console: 'ALL',
      sortBy: 'id',
      sortOrder: 'desc',
      page: 1,
      limit: 24,
      totalPages: 1,
      totalPrice: 0,
      filterOptions: {},
      viewMode: localStorage.getItem('saumabox_view_games') || 'grid'
    },
    // Cinema state
    cinema: {
      items: [],
      type: 'ALL',
      watched: 'ALL',
      genre: 'ALL',
      q: '',
      sortBy: 'id',
      sortOrder: 'desc',
      page: 1,
      limit: 24,
      totalPages: 1,
      filterOptions: {},
      viewMode: localStorage.getItem('saumabox_view_cinema') || 'grid'
    },
    // Music state
    music: {
      items: [],
      platform: 'ALL',
      genre: 'ALL',
      favorite: 'ALL',
      q: '',
      sortBy: 'id',
      sortOrder: 'desc',
      page: 1,
      limit: 24,
      totalPages: 1,
      filterOptions: {},
      viewMode: localStorage.getItem('saumabox_view_music') || 'grid'
    },
    // Dashboard stats
    stats: null
  },

  async init() {
    this.applyTheme(this.state.theme);
    this.bindGlobalEvents();

    try {
      // Cek apakah sistem butuh initial setup
      const setupCheck = await api.get('/api/auth/setup-status');
      if (setupCheck.needsSetup) {
        this.openSetupModal();
        return;
      }

      // Cek user login & config
      const [authRes, configRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/settings/public-config')
      ]);

      if (authRes.authenticated) {
        this.state.user = authRes.user;
      }
      if (configRes) {
        this.state.publicConfig = configRes;
      }

      // Routing awal berdasarkan status login & public sharing
      if (this.state.user) {
        this.navigate('dashboard');
      } else {
        this.navigate('landing');
      }
    } catch (err) {
      console.error('Initialization error:', err);
      this.navigate('landing');
    }
  },

  applyTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('saumabox_theme', theme);
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  },

  bindGlobalEvents() {
    window.onAuthExpired = () => {
      this.state.user = null;
      this.updateNavbar();
      showToast('Sesi telah berakhir. Silakan login kembali.', 'warning');
      this.openLoginModal();
    };

    // Keyboard accessibility: Escape menutup modal aktif
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Theme toggle button
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }
  },

  updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    const authActions = document.getElementById('auth-actions');
    const bottomNav = document.getElementById('bottom-nav');
    const isLoggedIn = !!this.state.user;

    if (isLoggedIn) {
      navLinks.innerHTML = `
        <button class="nav-btn ${this.state.currentTab === 'dashboard' ? 'active' : ''}" onclick="app.navigate('dashboard')">📊 Dashboard</button>
        <button class="nav-btn ${this.state.currentTab === 'games' ? 'active' : ''}" onclick="app.navigate('games')">🎮 Games</button>
        <button class="nav-btn ${this.state.currentTab === 'cinema' ? 'active' : ''}" onclick="app.navigate('cinema')">🎬 Cinema</button>
        <button class="nav-btn ${this.state.currentTab === 'music' ? 'active' : ''}" onclick="app.navigate('music')">🎵 Music</button>
        <button class="nav-btn ${this.state.currentTab === 'settings' ? 'active' : ''}" onclick="app.navigate('settings')">⚙️ Settings</button>
      `;

      authActions.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.85rem; color:var(--text-secondary);">👤 <strong>${escapeHtml(this.state.user.displayName || this.state.user.username)}</strong></span>
          <button class="btn btn-secondary btn-sm" onclick="app.logout()">Keluar</button>
        </div>
      `;

      if (bottomNav) {
        bottomNav.innerHTML = `
          <div class="bottom-nav-inner">
            <div class="bottom-nav-item ${this.state.currentTab === 'dashboard' ? 'active' : ''}" onclick="app.navigate('dashboard')">
              <span class="bottom-nav-icon">📊</span><span>Dashboard</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'games' ? 'active' : ''}" onclick="app.navigate('games')">
              <span class="bottom-nav-icon">🎮</span><span>Games</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'cinema' ? 'active' : ''}" onclick="app.navigate('cinema')">
              <span class="bottom-nav-icon">🎬</span><span>Cinema</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'music' ? 'active' : ''}" onclick="app.navigate('music')">
              <span class="bottom-nav-icon">🎵</span><span>Music</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'settings' ? 'active' : ''}" onclick="app.navigate('settings')">
              <span class="bottom-nav-icon">⚙️</span><span>Settings</span>
            </div>
          </div>
        `;
      }
    } else {
      navLinks.innerHTML = `
        <button class="nav-btn ${this.state.currentTab === 'landing' ? 'active' : ''}" onclick="app.navigate('landing')">Beranda</button>
        <button class="nav-btn ${this.state.currentTab === 'games' ? 'active' : ''}" onclick="app.navigate('games')">Katalog Games</button>
        <button class="nav-btn ${this.state.currentTab === 'cinema' ? 'active' : ''}" onclick="app.navigate('cinema')">Katalog Cinema</button>
        <button class="nav-btn ${this.state.currentTab === 'music' ? 'active' : ''}" onclick="app.navigate('music')">Katalog Music</button>
      `;

      authActions.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="app.openLoginModal()">Masuk Admin</button>
      `;

      if (bottomNav) {
        bottomNav.innerHTML = `
          <div class="bottom-nav-inner">
            <div class="bottom-nav-item ${this.state.currentTab === 'landing' ? 'active' : ''}" onclick="app.navigate('landing')">
              <span class="bottom-nav-icon">🏠</span><span>Beranda</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'games' ? 'active' : ''}" onclick="app.navigate('games')">
              <span class="bottom-nav-icon">🎮</span><span>Games</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'cinema' ? 'active' : ''}" onclick="app.navigate('cinema')">
              <span class="bottom-nav-icon">🎬</span><span>Cinema</span>
            </div>
            <div class="bottom-nav-item ${this.state.currentTab === 'music' ? 'active' : ''}" onclick="app.navigate('music')">
              <span class="bottom-nav-icon">🎵</span><span>Music</span>
            </div>
          </div>
        `;
      }
    }
  },

  async navigate(tab) {
    this.state.currentTab = tab;
    this.updateNavbar();
    const container = document.getElementById('view-container');

    // Loading skeleton
    container.innerHTML = `
      <div class="state-container">
        <div class="state-icon">⏳</div>
        <div class="state-title">Memuat data...</div>
      </div>
    `;

    try {
      if (tab === 'landing') {
        await this.renderLanding(container);
      } else if (tab === 'dashboard') {
        if (!this.state.user) {
          this.openLoginModal();
          return this.navigate('landing');
        }
        await this.renderDashboard(container);
      } else if (tab === 'games') {
        await this.renderGames(container);
      } else if (tab === 'cinema') {
        await this.renderCinema(container);
      } else if (tab === 'music') {
        await this.renderMusic(container);
      } else if (tab === 'settings') {
        if (!this.state.user) {
          this.openLoginModal();
          return this.navigate('landing');
        }
        await this.renderSettings(container);
      }
    } catch (err) {
      container.innerHTML = `
        <div class="state-container">
          <div class="state-icon">⚠️</div>
          <div class="state-title">Gagal memuat halaman</div>
          <div class="state-desc">${escapeHtml(err.message)}</div>
          <button class="btn btn-secondary" onclick="app.navigate('${tab}')">🔄 Coba Lagi</button>
        </div>
      `;
    }
  },

  // -------------------------------------------------------------
  // VIEW: Public Landing Page
  // -------------------------------------------------------------
  async renderLanding(container) {
    const [stats, recent] = await Promise.all([
      api.get('/api/settings/stats'),
      api.get('/api/recent')
    ]);
    this.state.recent = recent;
    this.state.recentCategory = this.state.recentCategory || 'all';

    container.innerHTML = `
      <section class="hero-section">
        <div class="hero-tag">DitherOS Algorithmic Catalog v1.0.0</div>
        <h1 class="hero-title">Koleksi Media Digital Pribadi dalam Satu Tempat</h1>
        <p class="hero-desc">Platform katalog terpadu untuk PC Games, Emulator ROMs, Recomp Ports, Cinema, dan Koleksi Musik dengan performa SQLite cepat dan offline-first.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="app.navigate('games')">🎮 Jelajahi Games</button>
          <button class="btn btn-secondary" onclick="app.navigate('cinema')">🎬 Lihat Cinema</button>
          <button class="btn btn-secondary" onclick="app.navigate('music')">🎵 Koleksi Musik</button>
        </div>
      </section>

      <section class="stats-ribbon">
        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-info">
            <span class="stat-label">Total Games</span>
            <span class="stat-value">${stats.totals.games}</span>
            <span class="stat-sub">${stats.games.pc} PC • ${stats.games.emulator} Emu • ${stats.games.recomp} Port</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎬</div>
          <div class="stat-info">
            <span class="stat-label">Total Cinema</span>
            <span class="stat-value">${stats.totals.cinema}</span>
            <span class="stat-sub">${stats.cinema.movies} Film • ${stats.cinema.series} Series • ${stats.cinema.anime} Anime</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-info">
            <span class="stat-label">Total Musik</span>
            <span class="stat-value">${stats.totals.music}</span>
            <span class="stat-sub">${stats.totals.favorite_music} Trek Favorit</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-label">Investasi Game PC</span>
            <span class="stat-value">${formatRupiah(stats.totals.spending)}</span>
            <span class="stat-sub">Auto-Sum pengeluaran game</span>
          </div>
        </div>
      </section>

      <section class="module-grid">
        <div class="module-card">
          <div>
            <div class="module-card-header">
              <h2 class="module-card-title">🎮 Katalog Games</h2>
              <span class="badge badge-neutral">${stats.totals.games} judul</span>
            </div>
            <p class="module-card-desc">Pencatatan game PC AAA, emulator konsol multi-generasi, hingga proyek unofficial recompilation PC ports.</p>
            <div class="module-card-tags">
              <span class="badge badge-steam">Steam</span>
              <span class="badge badge-gog">GOG</span>
              <span class="badge badge-epic">Epic</span>
              <span class="badge badge-info">PS2 / Switch</span>
              <span class="badge badge-purple">N64 Recomp</span>
            </div>
          </div>
          <button class="btn btn-secondary" onclick="app.navigate('games')">Buka Katalog Games →</button>
        </div>

        <div class="module-card">
          <div>
            <div class="module-card-header">
              <h2 class="module-card-title">🎬 Katalog Cinema</h2>
              <span class="badge badge-neutral">${stats.totals.cinema} judul</span>
            </div>
            <p class="module-card-desc">Tracking daftar tontonan Movies, Serial TV, dan Anime lengkap dengan rating IMDb dan status checklist tontonan.</p>
            <div class="module-card-tags">
              <span class="badge badge-success">${stats.cinema.watched_percentage}% Ditonton</span>
              <span class="badge badge-neutral">Movie</span>
              <span class="badge badge-neutral">Anime Series</span>
              <span class="badge badge-neutral">TV Series</span>
            </div>
          </div>
          <button class="btn btn-secondary" onclick="app.navigate('cinema')">Buka Katalog Cinema →</button>
        </div>

        <div class="module-card">
          <div>
            <div class="module-card-header">
              <h2 class="module-card-title">🎵 Katalog Music</h2>
              <span class="badge badge-neutral">${stats.totals.music} trek</span>
            </div>
            <p class="module-card-desc">Arsip trek musik, soundtrack game/anime, format FLAC lossless, dan integrasi penanda favorit.</p>
            <div class="module-card-tags">
              <span class="badge badge-info">Spotify</span>
              <span class="badge badge-purple">Lossless FLAC</span>
              <span class="badge badge-neutral">Apple Music</span>
              <span class="badge badge-neutral">OST Game</span>
            </div>
          </div>
          <button class="btn btn-secondary" onclick="app.navigate('music')">Buka Katalog Music →</button>
        </div>
      </section>

      <!-- Section: Koleksi Media Terbaru (Grid Card Showcase) -->
      <section class="recent-showcase-section">
        <div class="showcase-header">
          <div>
            <div class="hero-tag" style="margin-bottom:8px; display:inline-block;">RILISAN & KOLEKSI TERBARU</div>
            <h2 style="font-size:1.6rem; margin-bottom:4px;">Koleksi Media Terbaru</h2>
            <p style="color:var(--text-secondary); font-size:0.92rem;">Akses cepat rilisan terbaru game, cinema, dan trek musik lengkap dengan poster dan gambar album visual.</p>
          </div>
          <div class="showcase-tabs" role="tablist">
            <button class="showcase-tab-btn ${this.state.recentCategory === 'all' ? 'active' : ''}" id="tab-recent-all" onclick="app.filterRecentCards('all')">Semua (Terbaru)</button>
            <button class="showcase-tab-btn ${this.state.recentCategory === 'games' ? 'active' : ''}" id="tab-recent-games" onclick="app.filterRecentCards('games')">🎮 Games (${recent.games.length})</button>
            <button class="showcase-tab-btn ${this.state.recentCategory === 'cinema' ? 'active' : ''}" id="tab-recent-cinema" onclick="app.filterRecentCards('cinema')">🎬 Cinema (${recent.cinema.length})</button>
            <button class="showcase-tab-btn ${this.state.recentCategory === 'music' ? 'active' : ''}" id="tab-recent-music" onclick="app.filterRecentCards('music')">🎵 Musik (${recent.music.length})</button>
          </div>
        </div>

        <div class="media-grid" id="recent-media-grid">
          ${this.renderRecentGridHtml(this.state.recentCategory)}
        </div>
      </section>
    `;
  },

  filterRecentCards(category) {
    this.state.recentCategory = category;
    document.querySelectorAll('.showcase-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-recent-${category}`);
    if (activeBtn) activeBtn.classList.add('active');

    const grid = document.getElementById('recent-media-grid');
    if (grid) {
      grid.innerHTML = this.renderRecentGridHtml(category);
    }
  },

  renderRecentGridHtml(category) {
    const recent = this.state.recent;
    if (!recent) return '<p style="color:var(--text-secondary);">Memuat data...</p>';

    let cards = [];
    if (category === 'all') {
      const games = (recent.games || []).slice(0, 4).map(g => this.renderRecentGameCard(g));
      const cinema = (recent.cinema || []).slice(0, 4).map(c => this.renderRecentCinemaCard(c));
      const music = (recent.music || []).slice(0, 4).map(m => this.renderRecentMusicCard(m));
      cards = [...games, ...cinema, ...music];
    } else if (category === 'games') {
      cards = (recent.games || []).map(g => this.renderRecentGameCard(g));
    } else if (category === 'cinema') {
      cards = (recent.cinema || []).map(c => this.renderRecentCinemaCard(c));
    } else if (category === 'music') {
      cards = (recent.music || []).map(m => this.renderRecentMusicCard(m));
    }

    if (cards.length === 0) {
      return '<div style="grid-column: 1 / -1; padding: 32px; text-align: center; color: var(--text-secondary);">Belum ada koleksi pada kategori ini.</div>';
    }

    return cards.join('');
  },

  renderRecentGameCard(g) {
    const coverSrc = g.cover_url || '/images/covers/cyberpunk2077.svg';
    let platformPill = '';
    if (g.type === 'PC') {
      platformPill = `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform || 'PC')}</span>`;
    } else if (g.type === 'EMULATOR') {
      platformPill = `<span class="badge badge-neutral">${escapeHtml(g.console || 'Emu')}</span>`;
    } else {
      platformPill = `<span class="badge badge-purple">${escapeHtml(g.port_version || 'Recomp')}</span>`;
    }

    const priceText = g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (g.status || 'Koleksi');

    return `
      <article class="media-card" onclick="app.openMediaDetail('games', ${g.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('games', ${g.id})">
        <div class="media-poster-container">
          <div class="poster-overlay-top">
            ${platformPill}
            <span class="badge badge-rating">${formatRating(g.rating)}</span>
          </div>
          <img class="media-poster-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(g.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.svg';">
          <div class="poster-gradient"></div>
        </div>
        <div class="media-card-body">
          <div class="card-type-tag">🎮 ${g.type} • ${g.year || '-'}</div>
          <h3 class="card-media-title" title="${escapeHtml(g.title)}">${escapeHtml(g.title)}</h3>
          <div class="card-media-sub">${escapeHtml(g.publisher || g.developer || g.console || 'Katalog Game')}</div>
          <div class="media-card-footer">
            <span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status || 'Tersedia')}</span>
            <span class="font-mono card-media-extra" style="font-weight:600;">${priceText}</span>
          </div>
        </div>
      </article>
    `;
  },

  renderRecentCinemaCard(c) {
    const coverSrc = c.cover_url || '/images/covers/breaking_bad.jpg';
    const typeClass = getCinemaTypeBadgeClass(c.type);

    return `
      <article class="media-card" onclick="app.openMediaDetail('cinema', ${c.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('cinema', ${c.id})">
        <div class="media-poster-container">
          <div class="poster-overlay-top">
            <span class="badge ${typeClass}">${c.type}</span>
            <span class="badge badge-rating">${formatRating(c.rating)}</span>
          </div>
          <img class="media-poster-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(c.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/breaking_bad.jpg';">
          <div class="poster-gradient"></div>
        </div>
        <div class="media-card-body">
          <div class="card-type-tag">🎬 ${c.type} • ${c.year || '-'}</div>
          <h3 class="card-media-title" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</h3>
          <div class="card-media-sub">${escapeHtml(c.genre || c.studio || 'Katalog Cinema')}</div>
          <div class="media-card-footer">
            <span class="badge ${c.watched ? 'badge-success' : 'badge-neutral'}">${c.watched ? '✓ Ditonton' : 'Belum'}</span>
            <span class="card-media-extra">${escapeHtml(c.studio || c.country || '')}</span>
          </div>
        </div>
      </article>
    `;
  },

  renderRecentMusicCard(m) {
    const coverSrc = m.cover_url || '/images/covers/bohemian_rhapsody.jpg';

    return `
      <article class="media-card" onclick="app.openMediaDetail('music', ${m.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('music', ${m.id})">
        <div class="media-poster-container music-aspect">
          <div class="poster-overlay-top">
            <span class="badge badge-info">${escapeHtml(m.platform || 'Audio')}</span>
            <span class="badge ${m.is_favorite ? 'badge-danger' : 'badge-neutral'}">${m.is_favorite ? '❤️ Favorit' : '🎵'}</span>
          </div>
          <img class="media-poster-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(m.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/bohemian_rhapsody.jpg';">
          <div class="poster-gradient"></div>
        </div>
        <div class="media-card-body">
          <div class="card-type-tag">🎵 MUSIK • ${m.year || '-'}</div>
          <h3 class="card-media-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</h3>
          <div class="card-media-sub">${escapeHtml(m.artist || 'Artis')} • ${escapeHtml(m.album || 'Album')}</div>
          <div class="media-card-footer">
            <span class="badge badge-neutral">${escapeHtml(m.genre || 'Musik')}</span>
            <span class="font-mono card-media-extra">${m.rating ? formatRating(m.rating) : (m.year || '')}</span>
          </div>
        </div>
      </article>
    `;
  },

  async openMediaDetail(category, id) {
    try {
      const item = await api.get(`/api/${category}/${id}`);
      let title = '';
      let posterSrc = item.cover_url || '';
      let detailsHtml = '';
      let targetTab = category;

      if (category === 'games') {
        title = `🎮 ${item.title}`;
        if (!posterSrc) posterSrc = '/images/covers/cyberpunk2077.svg';
        detailsHtml = `
          <table class="media-detail-table">
            <tr><td>Kategori</td><td><span class="badge badge-neutral">${item.type}</span></td></tr>
            <tr><td>Tahun Rilis</td><td><span class="font-mono">${item.year || '-'}</span></td></tr>
            <tr><td>Publisher</td><td>${escapeHtml(item.publisher || '-')}</td></tr>
            <tr><td>Developer</td><td>${escapeHtml(item.developer || '-')}</td></tr>
            ${item.type === 'PC' ? `
              <tr><td>Platform</td><td><span class="badge ${getPlatformBadgeClass(item.platform)}">${escapeHtml(item.platform || '-')}</span></td></tr>
              <tr><td>Harga Beli</td><td class="font-mono">${item.price ? formatRupiah(item.price) : 'Rp 0'}</td></tr>
            ` : ''}
            ${item.type === 'EMULATOR' ? `
              <tr><td>Konsol Asal</td><td><span class="badge badge-neutral">${escapeHtml(item.console || '-')}</span></td></tr>
              <tr><td>Emulator</td><td>${escapeHtml(item.emulator || '-')}</td></tr>
              <tr><td>Format ROM</td><td class="font-mono">${escapeHtml(item.rom_format || '-')}</td></tr>
            ` : ''}
            ${item.type === 'RECOMP' ? `
              <tr><td>Konsol Asal</td><td><span class="badge badge-neutral">${escapeHtml(item.console || 'Port')}</span></td></tr>
              <tr><td>Port Dev</td><td>${escapeHtml(item.port_developer || '-')}</td></tr>
              <tr><td>Versi Port</td><td class="font-mono">${escapeHtml(item.port_version || '-')}</td></tr>
              <tr><td>Fitur Enhancements</td><td>${escapeHtml(item.enhancements || '-')}</td></tr>
            ` : ''}
            <tr><td>Ukuran Penyimpanan</td><td class="font-mono">${escapeHtml(item.size_gb ? item.size_gb + ' GB' : '-')}</td></tr>
            <tr><td>Rating Skor</td><td class="font-mono">${formatRating(item.rating)}</td></tr>
            <tr><td>Status</td><td><span class="badge ${getStatusBadgeClass(item.status)}">${escapeHtml(item.status || '-')}</span></td></tr>
          </table>
        `;
      } else if (category === 'cinema') {
        title = `🎬 ${item.title}`;
        if (!posterSrc) posterSrc = '/images/covers/breaking_bad.jpg';
        detailsHtml = `
          <table class="media-detail-table">
            <tr><td>Tipe Cinema</td><td><span class="badge ${getCinemaTypeBadgeClass(item.type)}">${item.type}</span></td></tr>
            <tr><td>Tahun Rilis</td><td class="font-mono">${item.year || '-'}</td></tr>
            <tr><td>Genre</td><td>${escapeHtml(item.genre || '-')}</td></tr>
            <tr><td>Studio / Produksi</td><td>${escapeHtml(item.studio || '-')}</td></tr>
            <tr><td>Negara Asal</td><td>${escapeHtml(item.country || '-')}</td></tr>
            <tr><td>Rating Usia</td><td><span class="badge badge-neutral">${escapeHtml(item.age_rating || '-')}</span></td></tr>
            ${item.total_episodes ? `<tr><td>Total Episode</td><td class="font-mono">${item.total_episodes} eps</td></tr>` : ''}
            ${item.total_seasons ? `<tr><td>Total Season</td><td class="font-mono">${item.total_seasons} seasons</td></tr>` : ''}
            <tr><td>Rating IMDb</td><td class="font-mono">${formatRating(item.rating)}</td></tr>
            <tr><td>Status Nonton</td><td><span class="badge ${item.watched ? 'badge-success' : 'badge-neutral'}">${item.watched ? '✓ Selesai Ditonton' : 'Belum Ditonton'}</span></td></tr>
          </table>
        `;
      } else if (category === 'music') {
        title = `🎵 ${item.title}`;
        if (!posterSrc) posterSrc = '/images/covers/bohemian_rhapsody.jpg';
        detailsHtml = `
          <table class="media-detail-table">
            <tr><td>Artis / Musisi</td><td><strong>${escapeHtml(item.artist || '-')}</strong></td></tr>
            <tr><td>Album</td><td>${escapeHtml(item.album || '-')}</td></tr>
            <tr><td>Tahun Rilis</td><td class="font-mono">${item.year || '-'}</td></tr>
            <tr><td>Genre Musik</td><td>${escapeHtml(item.genre || '-')}</td></tr>
            <tr><td>Platform / Format</td><td><span class="badge badge-info">${escapeHtml(item.platform || '-')}</span></td></tr>
            <tr><td>Ukuran File</td><td class="font-mono">${item.size_mb ? item.size_mb + ' MB' : '-'}</td></tr>
            <tr><td>Rating Skor</td><td class="font-mono">${formatRating(item.rating)}</td></tr>
            <tr><td>Penanda Favorit</td><td>${item.is_favorite ? '<span class="badge badge-danger">❤️ Favorit</span>' : '<span class="badge badge-neutral">Standar</span>'}</td></tr>
            ${item.notes ? `<tr><td>Catatan</td><td>${escapeHtml(item.notes)}</td></tr>` : ''}
          </table>
        `;
      }

      const modalId = 'modal-media-detail';
      const isAdmin = !!this.state.user;
      const editButton = isAdmin ? `
        <button class="btn btn-secondary" onclick="app.closeModal('${modalId}'); ${category === 'games' ? `app.openEditGameModal(${item.id})` : category === 'cinema' ? `app.openEditCinemaModal(${item.id})` : `app.openEditMusicModal(${item.id})`}">✏️ Edit Data</button>
      ` : '';

      this.createModal(modalId, title, `
        <div class="media-detail-view">
          <div class="media-detail-poster ${category === 'music' ? 'music-aspect' : ''}">
            <img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.svg';">
          </div>
          <div class="media-detail-info">
            <div>
              <h2 style="font-size:1.35rem; margin-bottom:4px;">${escapeHtml(item.title)}</h2>
              <div style="color:var(--text-secondary); font-size:0.85rem;">${escapeHtml(item.artist || item.publisher || item.studio || '')} ${item.year ? '• ' + item.year : ''}</div>
            </div>
            ${detailsHtml}
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
              <button class="btn btn-primary" onclick="app.closeModal('${modalId}'); app.navigate('${targetTab}')">Buka di Katalog ${targetTab.toUpperCase()} →</button>
              ${editButton}
              <button class="btn btn-secondary" onclick="app.closeModal('${modalId}')">Tutup</button>
            </div>
          </div>
        </div>
      `);
    } catch (err) {
      showToast('Gagal memuat detail: ' + err.message, 'error');
    }
  },

  setCatalogViewMode(catalog, mode) {
    if (this.state[catalog]) {
      this.state[catalog].viewMode = mode;
      localStorage.setItem(`saumabox_view_${catalog}`, mode);
      const container = document.getElementById('view-container');
      if (catalog === 'games') this.renderGames(container);
      else if (catalog === 'cinema') this.renderCinema(container);
      else if (catalog === 'music') this.renderMusic(container);
    }
  },

  // -------------------------------------------------------------
  // VIEW: Admin Dashboard
  // -------------------------------------------------------------
  async renderDashboard(container) {
    const stats = await api.get('/api/settings/stats');
    this.state.stats = stats;

    const platformPills = stats.games.platforms.map(p =>
      `<span class="badge ${getPlatformBadgeClass(p.platform)}">${escapeHtml(p.platform)} (${p.count})</span>`
    ).join(' ');

    const consolePills = stats.games.consoles.map(c =>
      `<span class="badge badge-neutral">${escapeHtml(c.console)} (${c.count})</span>`
    ).join(' ');

    const activityRows = stats.recent_activity.map(log => `
      <tr>
        <td class="font-mono" style="font-size:0.75rem;">${formatDate(log.created_at)}</td>
        <td><span class="badge badge-neutral">${escapeHtml(log.action)}</span></td>
        <td><strong>${escapeHtml(log.module)}</strong></td>
        <td>${escapeHtml(log.item_title || '-')}</td>
        <td style="color:var(--text-secondary); font-size:0.8rem;">${escapeHtml(log.details || '')}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:1.6rem;">Dashboard Admin</h1>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Selamat datang kembali, ${escapeHtml(this.state.user.displayName || this.state.user.username)}.</p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="app.openAddGameModal()">+ Tambah Game</button>
          <button class="btn btn-secondary" onclick="app.openAddCinemaModal()">+ Tambah Cinema</button>
          <button class="btn btn-secondary" onclick="app.openAddMusicModal()">+ Tambah Musik</button>
          <button class="btn btn-secondary" onclick="app.openImportModal()">📥 Import</button>
          <button class="btn btn-secondary" onclick="app.downloadBackup()">💾 Backup Database</button>
        </div>
      </div>

      <section class="stats-ribbon">
        <div class="stat-card" onclick="app.navigate('games')" style="cursor:pointer;">
          <div class="stat-icon">🎮</div>
          <div class="stat-info">
            <span class="stat-label">Koleksi Games</span>
            <span class="stat-value">${stats.totals.games}</span>
            <span class="stat-sub">${stats.games.pc} PC • ${stats.games.emulator} Emu • ${stats.games.recomp} Port</span>
          </div>
        </div>
        <div class="stat-card" onclick="app.navigate('cinema')" style="cursor:pointer;">
          <div class="stat-icon">🎬</div>
          <div class="stat-info">
            <span class="stat-label">Koleksi Cinema</span>
            <span class="stat-value">${stats.totals.cinema}</span>
            <span class="stat-sub">${stats.totals.watched} Ditonton (${stats.cinema.watched_percentage}%)</span>
          </div>
        </div>
        <div class="stat-card" onclick="app.navigate('music')" style="cursor:pointer;">
          <div class="stat-icon">🎵</div>
          <div class="stat-info">
            <span class="stat-label">Koleksi Musik</span>
            <span class="stat-value">${stats.totals.music}</span>
            <span class="stat-sub">${stats.totals.favorite_music} Trek Favorit</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-label">Total Beli Game PC</span>
            <span class="stat-value">${formatRupiah(stats.totals.spending)}</span>
            <span class="stat-sub">Auto-Sum Pembelian</span>
          </div>
        </div>
      </section>

      <div class="form-row" style="margin-bottom:24px;">
        <div class="module-card">
          <h2 style="font-size:1.1rem; margin-bottom:12px;">🎮 Distribusi Platform & Konsol</h2>
          <div style="margin-bottom:12px;">
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:6px;">Platform PC:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">${platformPills || '<span style="color:var(--text-muted)">Belum ada data</span>'}</div>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:6px;">Konsol Emulator Populer:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">${consolePills || '<span style="color:var(--text-muted)">Belum ada data</span>'}</div>
          </div>
        </div>

        <div class="module-card">
          <h2 style="font-size:1.1rem; margin-bottom:12px;">🎬 Progress Tontonan Cinema</h2>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:12px;">
            ${stats.totals.watched} dari ${stats.totals.cinema} judul tayangan telah selesai ditonton.
          </p>
          <div style="background:var(--bg-surface-elevated); height:12px; border-radius:6px; overflow:hidden; margin-bottom:16px;">
            <div style="background:var(--accent-color); height:100%; width:${stats.cinema.watched_percentage}%; transition:width 0.3s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
            <span>Film: ${stats.cinema.movies}</span>
            <span>Series: ${stats.cinema.series}</span>
            <span>Anime: ${stats.cinema.anime}</span>
          </div>
        </div>
      </div>

      <div class="data-panel">
        <div class="toolbar">
          <div style="font-weight:700;">Riwayat Aktivitas Terakhir</div>
          <span class="badge badge-neutral">${stats.recent_activity.length} catatan</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aksi</th>
                <th>Modul</th>
                <th>Item</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              ${activityRows || '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada riwayat aktivitas.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // VIEW: Katalog Games
  // -------------------------------------------------------------
  async renderGames(container) {
    const { type, q, platform, status, console: con, sortBy, sortOrder, page, limit } = this.state.games;
    const res = await api.get('/api/games', {
      type, q, platform, status, console: con, sort_by: sortBy, sort_order: sortOrder, page, limit
    });

    this.state.games.items = res.items;
    this.state.games.totalPages = res.pagination.totalPages;
    this.state.games.totalPrice = res.aggregates.total_price;
    this.state.games.filterOptions = res.filter_options;

    const isAdmin = !!this.state.user;

    // Platform options
    const platformOpts = ['ALL', ...(res.filter_options.platforms || [])].map(p =>
      `<option value="${p}" ${platform === p ? 'selected' : ''}>${p === 'ALL' ? 'Semua Platform' : p}</option>`
    ).join('');

    // Status options
    const statusOpts = ['ALL', ...(res.filter_options.statuses || [])].map(s =>
      `<option value="${s}" ${status === s ? 'selected' : ''}>${s === 'ALL' ? 'Semua Status' : s}</option>`
    ).join('');

    // Table rows
    const tableRows = res.items.map((g, idx) => {
      const rowNum = (page - 1) * limit + idx + 1;
      let platformOrConsole = '-';
      if (g.type === 'PC') {
        platformOrConsole = g.platform ? `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform)}</span>` : '-';
      } else if (g.type === 'EMULATOR') {
        platformOrConsole = g.console ? `<span class="badge badge-neutral">${escapeHtml(g.console)}</span>` : '-';
      } else if (g.type === 'RECOMP') {
        platformOrConsole = g.port_version ? `<span class="badge badge-purple">${escapeHtml(g.port_version)}</span>` : '<span class="badge badge-purple">Port</span>';
      }

      const statusBadge = g.status ? `<span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status)}</span>` : '-';
      const priceText = g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (g.type === 'PC' ? 'Rp 0' : '-');

      const actionButtons = isAdmin ? `
        <button class="btn btn-secondary btn-sm" onclick="app.openEditGameModal(${g.id})" title="Edit">✏️</button>
        <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteGame(${g.id}, '${escapeHtml(g.title)}')" title="Hapus">🗑️</button>
      ` : '';

      return `
        <tr>
          <td class="font-mono" style="color:var(--text-muted); width:40px;">${rowNum}</td>
          <td><span class="badge badge-neutral">${g.type}</span></td>
          <td>
            <strong>${escapeHtml(g.title)}</strong>
            ${g.type === 'RECOMP' && g.enhancements ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(g.enhancements)}</div>` : ''}
          </td>
          <td class="font-mono">${g.year || '-'}</td>
          <td>${escapeHtml(g.publisher || g.developer || '-')}</td>
          <td>${platformOrConsole}</td>
          <td class="font-mono">${escapeHtml(g.size_gb ? g.size_gb + ' GB' : '-')}</td>
          <td class="font-mono">${formatRating(g.rating)}</td>
          <td>${statusBadge}</td>
          <td class="font-mono" style="font-weight:600;">${priceText}</td>
          ${isAdmin ? `<td style="white-space:nowrap; text-align:right;">${actionButtons}</td>` : ''}
        </tr>
      `;
    }).join('');

    // Mobile card items
    const mobileCards = res.items.map(g => {
      return `
        <div class="mobile-data-card">
          <div class="mobile-card-row">
            <span class="badge badge-neutral">${g.type}</span>
            <span class="font-mono">${formatRating(g.rating)}</span>
          </div>
          <div>
            <strong style="font-size:1.05rem;">${escapeHtml(g.title)}</strong>
            <div style="font-size:0.8rem; color:var(--text-secondary);">
              ${g.year || ''} • ${escapeHtml(g.publisher || g.developer || '')}
            </div>
          </div>
          <div class="mobile-card-row">
            <div>
              ${g.platform ? `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform)}</span>` : ''}
              ${g.console ? `<span class="badge badge-neutral">${escapeHtml(g.console)}</span>` : ''}
              ${g.status ? `<span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status)}</span>` : ''}
            </div>
            <div class="font-mono" style="font-weight:700;">
              ${g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : ''}
            </div>
          </div>
          ${isAdmin ? `
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-subtle); padding-top:8px;">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditGameModal(${g.id})">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteGame(${g.id}, '${escapeHtml(g.title)}')">Hapus</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Grid cards (PS Plus & Educatech inspired)
    const gridCards = res.items.map(g => {
      const coverSrc = g.cover_url || '/images/covers/cyberpunk2077.svg';
      const initial = (g.title || 'G').charAt(0).toUpperCase();
      const avatarBg = getAvatarColor(initial);

      let platformPill = '';
      if (g.type === 'PC') {
        platformPill = `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform || 'PC')}</span>`;
      } else if (g.type === 'EMULATOR') {
        platformPill = `<span class="badge badge-neutral">${escapeHtml(g.console || 'Emu')}</span>`;
      } else {
        platformPill = `<span class="badge badge-purple">${escapeHtml(g.port_version || 'Recomp')}</span>`;
      }

      const priceText = g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (g.status || 'Tersedia');

      const adminActions = isAdmin ? `
        <div class="ps-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-sm" onclick="app.openEditGameModal(${g.id})" title="Edit">✏️</button>
          <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteGame(${g.id}, '${escapeHtml(g.title)}')" title="Hapus">🗑️</button>
        </div>
      ` : '';

      return `
        <article class="ps-card" onclick="app.openMediaDetail('games', ${g.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('games', ${g.id})">
          <div class="ps-card-media">
            <div class="ps-overlay-top">
              <div class="ps-overlay-badges-left">
                ${platformPill}
                <span class="badge badge-neutral">${g.type}</span>
              </div>
              <div class="ps-overlay-action-right">
                <span class="badge badge-rating">${formatRating(g.rating)}</span>
              </div>
            </div>
            <img class="ps-card-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(g.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.svg';">
            <div class="ps-overlay-gradient"></div>
          </div>
          <div class="ps-card-body">
            <div class="ps-header-row">
              <div class="ps-avatar-badge" style="background:${avatarBg};">${initial}</div>
              <div style="flex:1; min-width:0;">
                <h3 class="ps-card-title" title="${escapeHtml(g.title)}">${escapeHtml(g.title)}</h3>
                <div class="ps-card-meta">
                  <span>${g.year || '-'}</span>
                  <span>•</span>
                  <span>${escapeHtml(g.publisher || g.developer || g.console || 'Game')}</span>
                </div>
              </div>
            </div>
            <div class="ps-card-footer">
              <div>
                <span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status || 'Playable')}</span>
                <span class="font-mono card-media-extra" style="margin-left:6px; font-weight:700;">${priceText}</span>
              </div>
              ${adminActions}
            </div>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <div class="data-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="sub-tabs">
              <button class="sub-tab-btn ${type === 'ALL' ? 'active' : ''}" onclick="app.setGameType('ALL')">Semua Games</button>
              <button class="sub-tab-btn ${type === 'PC' ? 'active' : ''}" onclick="app.setGameType('PC')">PC Games</button>
              <button class="sub-tab-btn ${type === 'EMULATOR' ? 'active' : ''}" onclick="app.setGameType('EMULATOR')">Emulator Console</button>
              <button class="sub-tab-btn ${type === 'RECOMP' ? 'active' : ''}" onclick="app.setGameType('RECOMP')">Recomp Ports</button>
            </div>

            <div class="search-input-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" class="search-input" id="search-games" placeholder="Cari judul, publisher..." value="${escapeHtml(q)}">
            </div>

            <select class="filter-select" id="filter-game-platform" onchange="app.setGamePlatform(this.value)">
              ${platformOpts}
            </select>

            <select class="filter-select" id="filter-game-status" onchange="app.setGameStatus(this.value)">
              ${statusOpts}
            </select>
          </div>

          <div class="toolbar-right">
            <div class="view-toggle-group">
              <button class="view-toggle-btn ${this.state.games.viewMode === 'grid' ? 'active' : ''}" onclick="app.setCatalogViewMode('games', 'grid')" title="Tampilan Grid Poster">
                <span>🔲</span><span>Grid</span>
              </button>
              <button class="view-toggle-btn ${this.state.games.viewMode === 'table' ? 'active' : ''}" onclick="app.setCatalogViewMode('games', 'table')" title="Tampilan Tabel Spreadsheet">
                <span>📋</span><span>Tabel</span>
              </button>
            </div>

            ${isAdmin ? `
              <button class="btn btn-primary" onclick="app.openAddGameModal()">+ Tambah Game</button>
              <button class="btn btn-secondary" onclick="app.openImportModal('games')">📥 Import</button>
              <button class="btn btn-secondary" onclick="app.exportData('games')">📤 Export</button>
            ` : ''}
          </div>
        </div>

        ${this.state.games.viewMode === 'grid' ? `
          <div class="catalog-grid">
            ${gridCards || '<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">🎮</div><div class="state-title">Tidak ada game ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci pencarian atau filter platform Anda.</div></div>'}
          </div>
        ` : `
          <div class="table-responsive data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipe</th>
                  <th class="sortable" onclick="app.sortGames('title')">Judul Game</th>
                  <th class="sortable" onclick="app.sortGames('year')">Tahun</th>
                  <th>Publisher / Dev</th>
                  <th>Platform / Konsol</th>
                  <th>Ukuran</th>
                  <th class="sortable" onclick="app.sortGames('rating')">Rating</th>
                  <th>Status</th>
                  <th class="sortable" onclick="app.sortGames('price')">Harga</th>
                  ${isAdmin ? '<th style="text-align:right;">Aksi</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="11" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada game yang cocok dengan kriteria filter.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="mobile-card-list" style="padding:16px;">
            ${mobileCards || '<div class="state-container"><div class="state-title">Tidak ada game ditemukan</div></div>'}
          </div>
        `}

        <div class="table-footer">
          <div class="auto-sum-card">
            <span class="auto-sum-label">Auto-Sum Total Harga Game:</span>
            <span class="auto-sum-val">${formatRupiah(this.state.games.totalPrice)}</span>
          </div>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              Menampilkan <strong>${res.pagination.total > 0 ? (page - 1) * limit + 1 : 0}-${Math.min(page * limit, res.pagination.total)}</strong> dari total <strong>${res.pagination.total}</strong> game
            </span>
            <div class="pagination">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="app.changeGamePage(${page - 1})">◀</button>
              <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${page} dari ${this.state.games.totalPages}</span>
              <button class="page-btn" ${page >= this.state.games.totalPages ? 'disabled' : ''} onclick="app.changeGamePage(${page + 1})">▶</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Pasang handler search dengan debounce
    const searchInput = document.getElementById('search-games');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.state.games.q = e.target.value;
        this.state.games.page = 1;
        this.renderGames(container);
      }, 350));
    }
  },

  setGameType(type) {
    this.state.games.type = type;
    this.state.games.page = 1;
    this.renderGames(document.getElementById('view-container'));
  },

  setGamePlatform(platform) {
    this.state.games.platform = platform;
    this.state.games.page = 1;
    this.renderGames(document.getElementById('view-container'));
  },

  setGameStatus(status) {
    this.state.games.status = status;
    this.state.games.page = 1;
    this.renderGames(document.getElementById('view-container'));
  },

  sortGames(col) {
    if (this.state.games.sortBy === col) {
      this.state.games.sortOrder = this.state.games.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.games.sortBy = col;
      this.state.games.sortOrder = 'desc';
    }
    this.renderGames(document.getElementById('view-container'));
  },

  changeGamePage(newPage) {
    this.state.games.page = newPage;
    this.renderGames(document.getElementById('view-container'));
  },

  // -------------------------------------------------------------
  // VIEW: Katalog Cinema
  // -------------------------------------------------------------
  async renderCinema(container) {
    const { type, watched, genre, q, sortBy, sortOrder, page, limit } = this.state.cinema;
    const res = await api.get('/api/cinema', {
      type, watched, genre, q, sort_by: sortBy, sort_order: sortOrder, page, limit
    });

    this.state.cinema.items = res.items;
    this.state.cinema.totalPages = res.pagination.totalPages;
    this.state.cinema.filterOptions = res.filter_options;

    const isAdmin = !!this.state.user;

    const genreOpts = ['ALL', ...(res.filter_options.genres || [])].map(g =>
      `<option value="${g}" ${genre === g ? 'selected' : ''}>${g === 'ALL' ? 'Semua Genre' : g}</option>`
    ).join('');

    const tableRows = res.items.map((c, idx) => {
      const rowNum = (page - 1) * limit + idx + 1;
      const isWatched = c.watched === 1;

      const checkbox = isAdmin ? `
        <button class="quick-check-btn" onclick="app.toggleCinemaWatched(${c.id})" title="${isWatched ? 'Sudah ditonton' : 'Belum ditonton'}">
          ${isWatched ? '☑️' : '⬜'}
        </button>
      ` : (isWatched ? '✅' : '⚪');

      const actionButtons = isAdmin ? `
        <button class="btn btn-secondary btn-sm" onclick="app.openEditCinemaModal(${c.id})" title="Edit">✏️</button>
        <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteCinema(${c.id}, '${escapeHtml(c.title)}')" title="Hapus">🗑️</button>
      ` : '';

      return `
        <tr>
          <td class="font-mono" style="color:var(--text-muted); width:40px;">${rowNum}</td>
          <td style="text-align:center; width:44px;">${checkbox}</td>
          <td><span class="badge badge-neutral">${c.type}</span></td>
          <td>
            <strong>${escapeHtml(c.title)}</strong>
            ${c.genre ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(c.genre)}</div>` : ''}
          </td>
          <td class="font-mono">${formatRating(c.rating)}</td>
          <td class="font-mono">${c.year || '-'}</td>
          <td>${escapeHtml(c.country || '-')}</td>
          <td>${escapeHtml(c.studio || '-')}</td>
          <td>${c.age_rating ? `<span class="badge badge-neutral">${escapeHtml(c.age_rating)}</span>` : '-'}</td>
          <td class="font-mono">${c.total_episodes ? c.total_episodes + ' Ep' : (c.total_seasons ? c.total_seasons + ' S' : '-')}</td>
          ${isAdmin ? `<td style="white-space:nowrap; text-align:right;">${actionButtons}</td>` : ''}
        </tr>
      `;
    }).join('');

    const gridCards = res.items.map(c => {
      const isWatched = c.watched === 1;
      const initial = (c.title || 'C').charAt(0).toUpperCase();
      const avatarBg = getAvatarColor(initial);
      const coverSrc = c.cover_url || '/images/covers/breaking_bad.jpg';

      const adminActions = isAdmin ? `
        <div class="ps-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-sm" onclick="app.openEditCinemaModal(${c.id})" title="Edit">✏️</button>
          <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteCinema(${c.id}, '${escapeHtml(c.title)}')" title="Hapus">🗑️</button>
        </div>
      ` : '';

      const quickWatchBtn = isAdmin ? `
        <button class="ps-heart-btn ${isWatched ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleCinemaWatched(${c.id})" title="${isWatched ? 'Tandai belum ditonton' : 'Tandai sudah ditonton'}">
          ${isWatched ? '☑️' : '⬜'}
        </button>
      ` : (isWatched ? '<span class="badge badge-green" style="backdrop-filter:blur(4px); box-shadow:0 2px 6px rgba(0,0,0,0.4);">Ditonton</span>' : '');

      return `
        <article class="ps-card" onclick="app.openMediaDetail('cinema', ${c.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('cinema', ${c.id})">
          <div class="ps-card-media cinema-aspect">
            <div class="ps-overlay-top">
              <div class="ps-overlay-badges-left">
                <span class="badge ${getCinemaTypeBadgeClass(c.type)}">${c.type}</span>
                ${c.age_rating ? `<span class="badge badge-neutral">${escapeHtml(c.age_rating)}</span>` : ''}
              </div>
              <div class="ps-overlay-action-right" style="display:flex; align-items:center; gap:6px;">
                <span class="badge badge-rating">${formatRating(c.rating)}</span>
                ${quickWatchBtn}
              </div>
            </div>
            <img class="ps-card-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(c.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/breaking_bad.jpg';">
            <div class="ps-overlay-gradient"></div>
          </div>
          <div class="ps-card-body">
            <div class="ps-header-row">
              <div class="ps-avatar-badge" style="background:${avatarBg};">${initial}</div>
              <div style="flex:1; min-width:0;">
                <h3 class="ps-card-title" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</h3>
                <div class="ps-card-meta">
                  <span>${c.year || '-'}</span>
                  <span>•</span>
                  <span>${escapeHtml(c.studio || c.country || 'Film')}</span>
                </div>
              </div>
            </div>
            <div class="ps-card-footer">
              <div>
                <span class="badge badge-neutral">${c.total_episodes ? c.total_episodes + ' Ep' : (c.total_seasons ? c.total_seasons + ' S' : (c.year || 'Film'))}</span>
                ${c.genre ? `<span style="font-size:0.75rem; color:var(--text-secondary); margin-left:6px;">${escapeHtml(c.genre.split(',')[0])}</span>` : ''}
              </div>
              ${adminActions}
            </div>
          </div>
        </article>
      `;
    }).join('');

    const mobileCards = res.items.map(c => {
      const isWatched = c.watched === 1;
      return `
        <div class="mobile-data-card">
          <div class="mobile-card-row">
            <span class="badge badge-neutral">${c.type}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="font-mono">${formatRating(c.rating)}</span>
              ${isAdmin ? `
                <button class="quick-check-btn" onclick="app.toggleCinemaWatched(${c.id})">
                  ${isWatched ? '☑️' : '⬜'}
                </button>
              ` : (isWatched ? '✅' : '⚪')}
            </div>
          </div>
          <div>
            <strong style="font-size:1.05rem;">${escapeHtml(c.title)}</strong>
            <div style="font-size:0.8rem; color:var(--text-secondary);">
              ${c.year || ''} • ${escapeHtml(c.studio || c.country || '')}
            </div>
            ${c.genre ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${escapeHtml(c.genre)}</div>` : ''}
          </div>
          ${isAdmin ? `
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-subtle); padding-top:8px;">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditCinemaModal(${c.id})">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteCinema(${c.id}, '${escapeHtml(c.title)}')">Hapus</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="data-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="sub-tabs">
              <button class="sub-tab-btn ${type === 'ALL' ? 'active' : ''}" onclick="app.setCinemaType('ALL')">Semua</button>
              <button class="sub-tab-btn ${type === 'MOVIE' ? 'active' : ''}" onclick="app.setCinemaType('MOVIE')">Movies</button>
              <button class="sub-tab-btn ${type === 'SERIES' ? 'active' : ''}" onclick="app.setCinemaType('SERIES')">Series</button>
              <button class="sub-tab-btn ${type === 'ANIME' ? 'active' : ''}" onclick="app.setCinemaType('ANIME')">Anime</button>
            </div>

            <div class="search-input-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" class="search-input" id="search-cinema" placeholder="Cari judul, studio..." value="${escapeHtml(q)}">
            </div>

            <select class="filter-select" id="filter-cinema-watched" onchange="app.setCinemaWatched(this.value)">
              <option value="ALL" ${watched === 'ALL' ? 'selected' : ''}>Status Tontonan (Semua)</option>
              <option value="1" ${watched === '1' ? 'selected' : ''}>Sudah Ditonton (☑️)</option>
              <option value="0" ${watched === '0' ? 'selected' : ''}>Belum Ditonton (⬜)</option>
            </select>

            <select class="filter-select" id="filter-cinema-genre" onchange="app.setCinemaGenre(this.value)">
              ${genreOpts}
            </select>
          </div>

          <div class="toolbar-right">
            <div class="view-toggle-group">
              <button class="view-toggle-btn ${this.state.cinema.viewMode === 'grid' ? 'active' : ''}" onclick="app.setCatalogViewMode('cinema', 'grid')" title="Tampilan Grid Poster">
                <span>🔲</span><span>Grid</span>
              </button>
              <button class="view-toggle-btn ${this.state.cinema.viewMode === 'table' ? 'active' : ''}" onclick="app.setCatalogViewMode('cinema', 'table')" title="Tampilan Tabel Spreadsheet">
                <span>📋</span><span>Tabel</span>
              </button>
            </div>

            ${isAdmin ? `
              <button class="btn btn-primary" onclick="app.openAddCinemaModal()">+ Tambah Cinema</button>
              <button class="btn btn-secondary" onclick="app.openImportModal('cinema')">📥 Import</button>
              <button class="btn btn-secondary" onclick="app.exportData('cinema')">📤 Export</button>
            ` : ''}
          </div>
        </div>

        ${this.state.cinema.viewMode === 'grid' ? `
          <div class="catalog-grid">
            ${gridCards || '<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">🎬</div><div class="state-title">Tidak ada tayangan ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci pencarian atau filter tipe/genre Anda.</div></div>'}
          </div>
        ` : `
          <div class="table-responsive data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style="text-align:center;">Status</th>
                  <th>Tipe</th>
                  <th class="sortable" onclick="app.sortCinema('title')">Judul</th>
                  <th class="sortable" onclick="app.sortCinema('rating')">Rating IMDb</th>
                  <th class="sortable" onclick="app.sortCinema('year')">Tahun</th>
                  <th>Negara</th>
                  <th>Studio</th>
                  <th>Usia</th>
                  <th>Ep/Season</th>
                  ${isAdmin ? '<th style="text-align:right;">Aksi</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="11" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada tayangan yang cocok.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="mobile-card-list" style="padding:16px;">
            ${mobileCards || '<div class="state-container"><div class="state-title">Tidak ada tayangan ditemukan</div></div>'}
          </div>
        `}

        <div class="table-footer">
          <span style="font-size:0.85rem; color:var(--text-secondary);">
            Klik ikon ⬜/☑️ untuk menandai status tontonan instan.
          </span>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              Menampilkan <strong>${res.pagination.total > 0 ? (page - 1) * limit + 1 : 0}-${Math.min(page * limit, res.pagination.total)}</strong> dari total <strong>${res.pagination.total}</strong> tayangan
            </span>
            <div class="pagination">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="app.changeCinemaPage(${page - 1})">◀</button>
              <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${page} dari ${this.state.cinema.totalPages}</span>
              <button class="page-btn" ${page >= this.state.cinema.totalPages ? 'disabled' : ''} onclick="app.changeCinemaPage(${page + 1})">▶</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('search-cinema');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.state.cinema.q = e.target.value;
        this.state.cinema.page = 1;
        this.renderCinema(container);
      }, 350));
    }
  },

  setCinemaType(type) {
    this.state.cinema.type = type;
    this.state.cinema.page = 1;
    this.renderCinema(document.getElementById('view-container'));
  },

  setCinemaWatched(val) {
    this.state.cinema.watched = val;
    this.state.cinema.page = 1;
    this.renderCinema(document.getElementById('view-container'));
  },

  setCinemaGenre(genre) {
    this.state.cinema.genre = genre;
    this.state.cinema.page = 1;
    this.renderCinema(document.getElementById('view-container'));
  },

  sortCinema(col) {
    if (this.state.cinema.sortBy === col) {
      this.state.cinema.sortOrder = this.state.cinema.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.cinema.sortBy = col;
      this.state.cinema.sortOrder = 'desc';
    }
    this.renderCinema(document.getElementById('view-container'));
  },

  changeCinemaPage(newPage) {
    this.state.cinema.page = newPage;
    this.renderCinema(document.getElementById('view-container'));
  },

  async toggleCinemaWatched(id) {
    try {
      const res = await api.patch(`/api/cinema/${id}/toggle-watched`);
      showToast(res.watched === 1 ? 'Ditandai sudah ditonton' : 'Ditandai belum ditonton', 'success');
      this.renderCinema(document.getElementById('view-container'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // VIEW: Katalog Music
  // -------------------------------------------------------------
  async renderMusic(container) {
    const { platform, genre, favorite, q, sortBy, sortOrder, page, limit } = this.state.music;
    const res = await api.get('/api/music', {
      platform, genre, favorite, q, sort_by: sortBy, sort_order: sortOrder, page, limit
    });

    this.state.music.items = res.items;
    this.state.music.totalPages = res.pagination.totalPages;
    this.state.music.filterOptions = res.filter_options;

    const isAdmin = !!this.state.user;

    const platformOpts = ['ALL', ...(res.filter_options.platforms || [])].map(p =>
      `<option value="${p}" ${platform === p ? 'selected' : ''}>${p === 'ALL' ? 'Semua Platform' : p}</option>`
    ).join('');

    const tableRows = res.items.map((m, idx) => {
      const rowNum = (page - 1) * limit + idx + 1;
      const isFav = m.is_favorite === 1;

      const favButton = isAdmin ? `
        <button class="quick-check-btn" onclick="app.toggleMusicFavorite(${m.id})" title="${isFav ? 'Hapus favorit' : 'Jadikan favorit'}">
          ${isFav ? '⭐' : '☆'}
        </button>
      ` : (isFav ? '⭐' : '-');

      const actionButtons = isAdmin ? `
        <button class="btn btn-secondary btn-sm" onclick="app.openEditMusicModal(${m.id})" title="Edit">✏️</button>
        <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteMusic(${m.id}, '${escapeHtml(m.title)}')" title="Hapus">🗑️</button>
      ` : '';

      return `
        <tr>
          <td class="font-mono" style="color:var(--text-muted); width:40px;">${rowNum}</td>
          <td style="text-align:center; width:44px;">${favButton}</td>
          <td>
            <strong>${escapeHtml(m.title)}</strong>
            ${m.notes ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(m.notes)}</div>` : ''}
          </td>
          <td>${escapeHtml(m.artist || '-')}</td>
          <td>${escapeHtml(m.album || '-')}</td>
          <td class="font-mono">${m.year || '-'}</td>
          <td>${escapeHtml(m.genre || '-')}</td>
          <td>${m.platform ? `<span class="badge badge-neutral">${escapeHtml(m.platform)}</span>` : '-'}</td>
          <td class="font-mono">${m.size_mb ? m.size_mb + ' MB' : '-'}</td>
          <td class="font-mono">${formatRating(m.rating)}</td>
          ${isAdmin ? `<td style="white-space:nowrap; text-align:right;">${actionButtons}</td>` : ''}
        </tr>
      `;
    }).join('');

    const gridCards = res.items.map(m => {
      const isFav = m.is_favorite === 1;
      const initial = (m.artist || m.title || 'M').charAt(0).toUpperCase();
      const avatarBg = getAvatarColor(initial);
      const coverSrc = m.cover_url || '/images/covers/bohemian_rhapsody.jpg';

      const adminActions = isAdmin ? `
        <div class="ps-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-sm" onclick="app.openEditMusicModal(${m.id})" title="Edit">✏️</button>
          <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteMusic(${m.id}, '${escapeHtml(m.title)}')" title="Hapus">🗑️</button>
        </div>
      ` : '';

      const favButton = isAdmin ? `
        <button class="ps-heart-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleMusicFavorite(${m.id})" title="${isFav ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      ` : (isFav ? '<span class="ps-heart-btn active" style="cursor:default;" title="Favorit">❤️</span>' : '');

      return `
        <article class="ps-card" onclick="app.openMediaDetail('music', ${m.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('music', ${m.id})">
          <div class="ps-card-media music-aspect">
            <div class="ps-overlay-top">
              <div class="ps-overlay-badges-left">
                ${m.platform ? `<span class="badge badge-purple">${escapeHtml(m.platform)}</span>` : '<span class="badge badge-neutral">Audio</span>'}
                ${m.genre ? `<span class="badge badge-neutral">${escapeHtml(m.genre)}</span>` : ''}
              </div>
              <div class="ps-overlay-action-right" style="display:flex; align-items:center; gap:6px;">
                ${m.rating ? `<span class="badge badge-rating">${formatRating(m.rating)}</span>` : ''}
                ${favButton}
              </div>
            </div>
            <img class="ps-card-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(m.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/bohemian_rhapsody.jpg';">
            <div class="ps-overlay-gradient"></div>
          </div>
          <div class="ps-card-body">
            <div class="ps-header-row">
              <div class="ps-avatar-badge" style="background:${avatarBg};">${initial}</div>
              <div style="flex:1; min-width:0;">
                <h3 class="ps-card-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</h3>
                <div class="ps-card-meta">
                  <span>${escapeHtml(m.artist || 'Artis')}</span>
                  ${m.album ? `<span>•</span><span>${escapeHtml(m.album)}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="ps-card-footer">
              <div>
                <span class="badge badge-neutral">${m.year || '-'}</span>
                ${m.size_mb ? `<span class="font-mono card-media-extra" style="margin-left:6px; font-weight:700;">${m.size_mb} MB</span>` : ''}
              </div>
              ${adminActions}
            </div>
          </div>
        </article>
      `;
    }).join('');

    const mobileCards = res.items.map(m => {
      const isFav = m.is_favorite === 1;
      return `
        <div class="mobile-data-card">
          <div class="mobile-card-row">
            <div>
              <strong style="font-size:1.05rem;">${escapeHtml(m.title)}</strong>
              <div style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(m.artist || '')} • ${escapeHtml(m.album || '')}</div>
            </div>
            ${isAdmin ? `
              <button class="quick-check-btn" onclick="app.toggleMusicFavorite(${m.id})">
                ${isFav ? '⭐' : '☆'}
              </button>
            ` : (isFav ? '⭐' : '')}
          </div>
          <div class="mobile-card-row">
            <div>
              ${m.platform ? `<span class="badge badge-neutral">${escapeHtml(m.platform)}</span>` : ''}
              ${m.genre ? `<span class="badge badge-neutral">${escapeHtml(m.genre)}</span>` : ''}
            </div>
            <span class="font-mono">${formatRating(m.rating)}</span>
          </div>
          ${isAdmin ? `
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-subtle); padding-top:8px;">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditMusicModal(${m.id})">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteMusic(${m.id}, '${escapeHtml(m.title)}')">Hapus</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="data-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="sub-tabs">
              <button class="sub-tab-btn ${favorite === 'ALL' ? 'active' : ''}" onclick="app.setMusicFavorite('ALL')">Semua Musik</button>
              <button class="sub-tab-btn ${favorite === '1' ? 'active' : ''}" onclick="app.setMusicFavorite('1')">Favorit ⭐</button>
            </div>

            <div class="search-input-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" class="search-input" id="search-music" placeholder="Cari trek, artis, album..." value="${escapeHtml(q)}">
            </div>

            <select class="filter-select" id="filter-music-platform" onchange="app.setMusicPlatform(this.value)">
              ${platformOpts}
            </select>
          </div>

          <div class="toolbar-right">
            <div class="view-toggle-group">
              <button class="view-toggle-btn ${this.state.music.viewMode === 'grid' ? 'active' : ''}" onclick="app.setCatalogViewMode('music', 'grid')" title="Tampilan Grid Poster">
                <span>🔲</span><span>Grid</span>
              </button>
              <button class="view-toggle-btn ${this.state.music.viewMode === 'table' ? 'active' : ''}" onclick="app.setCatalogViewMode('music', 'table')" title="Tampilan Tabel Spreadsheet">
                <span>📋</span><span>Tabel</span>
              </button>
            </div>

            ${isAdmin ? `
              <button class="btn btn-primary" onclick="app.openAddMusicModal()">+ Tambah Musik</button>
              <button class="btn btn-secondary" onclick="app.openImportModal('music')">📥 Import</button>
              <button class="btn btn-secondary" onclick="app.exportData('music')">📤 Export</button>
            ` : ''}
          </div>
        </div>

        ${this.state.music.viewMode === 'grid' ? `
          <div class="catalog-grid">
            ${gridCards || '<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">🎵</div><div class="state-title">Tidak ada trek musik ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci pencarian atau filter platform Anda.</div></div>'}
          </div>
        ` : `
          <div class="table-responsive data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style="text-align:center;">Fav</th>
                  <th class="sortable" onclick="app.sortMusic('title')">Judul Trek / Album</th>
                  <th class="sortable" onclick="app.sortMusic('artist')">Artis / Komposer</th>
                  <th>Album</th>
                  <th class="sortable" onclick="app.sortMusic('year')">Tahun</th>
                  <th>Genre</th>
                  <th>Platform / Format</th>
                  <th>Ukuran</th>
                  <th class="sortable" onclick="app.sortMusic('rating')">Rating</th>
                  ${isAdmin ? '<th style="text-align:right;">Aksi</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="11" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada trek musik yang cocok.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="mobile-card-list" style="padding:16px;">
            ${mobileCards || '<div class="state-container"><div class="state-title">Tidak ada musik ditemukan</div></div>'}
          </div>
        `}

        <div class="table-footer">
          <span style="font-size:0.85rem; color:var(--text-secondary);">
            Koleksi file lokal Lossless FLAC, MP3, serta streaming platform terpusat.
          </span>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              Menampilkan <strong>${res.pagination.total > 0 ? (page - 1) * limit + 1 : 0}-${Math.min(page * limit, res.pagination.total)}</strong> dari total <strong>${res.pagination.total}</strong> trek musik
            </span>
            <div class="pagination">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="app.changeMusicPage(${page - 1})">◀</button>
              <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${page} dari ${this.state.music.totalPages}</span>
              <button class="page-btn" ${page >= this.state.music.totalPages ? 'disabled' : ''} onclick="app.changeMusicPage(${page + 1})">▶</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('search-music');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.state.music.q = e.target.value;
        this.state.music.page = 1;
        this.renderMusic(container);
      }, 350));
    }
  },

  setMusicFavorite(fav) {
    this.state.music.favorite = fav;
    this.state.music.page = 1;
    this.renderMusic(document.getElementById('view-container'));
  },

  setMusicPlatform(plat) {
    this.state.music.platform = plat;
    this.state.music.page = 1;
    this.renderMusic(document.getElementById('view-container'));
  },

  sortMusic(col) {
    if (this.state.music.sortBy === col) {
      this.state.music.sortOrder = this.state.music.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.music.sortBy = col;
      this.state.music.sortOrder = 'desc';
    }
    this.renderMusic(document.getElementById('view-container'));
  },

  changeMusicPage(newPage) {
    this.state.music.page = newPage;
    this.renderMusic(document.getElementById('view-container'));
  },

  async toggleMusicFavorite(id) {
    try {
      const res = await api.patch(`/api/music/${id}/toggle-favorite`);
      showToast(res.is_favorite === 1 ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', 'success');
      this.renderMusic(document.getElementById('view-container'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // VIEW: Settings & Data Management
  // -------------------------------------------------------------
  async renderSettings(container) {
    const settings = await api.get('/api/settings');

    container.innerHTML = `
      <div style="max-width:800px; margin:0 auto;">
        <h1 style="font-size:1.6rem; margin-bottom:8px;">Pengaturan & Manajemen Database</h1>
        <p style="color:var(--text-secondary); margin-bottom:24px;">Konfigurasi sharing publik, tema, backup instan, dan restore database SQLite.</p>

        <div class="module-card" style="margin-bottom:20px;">
          <h2 style="font-size:1.15rem; margin-bottom:16px;">💾 Backup & Restore Database SQLite</h2>
          <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:16px;">
            Unduh salinan penuh file <code>saumabox.sqlite</code> secara instan, atau pulihkan data dari file backup sebelumnya dengan perlindungan rollback otomatis.
          </p>

          <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px;">
            <button class="btn btn-primary" onclick="app.downloadBackup()">💾 Download Backup (.sqlite)</button>
            <button class="btn btn-secondary" onclick="app.openRestoreModal()">🔄 Restore Database</button>
          </div>

          <div style="font-size:0.8rem; color:var(--text-muted);">
            Backup Terakhir: <strong>${settings.last_backup_at ? formatDate(settings.last_backup_at) : 'Belum pernah'}</strong>
          </div>
        </div>

        <div class="module-card" style="margin-bottom:20px;">
          <h2 style="font-size:1.15rem; margin-bottom:16px;">🌐 Konfigurasi Publik Sharing</h2>
          <form id="settings-form" onsubmit="app.saveSettings(event)">
            <div class="form-group">
              <label class="form-label">Nama Aplikasi / Katalog</label>
              <input type="text" class="form-input" name="app_name" value="${escapeHtml(settings.app_name || 'SaumaBox')}">
            </div>

            <div class="form-group">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" name="public_sharing_enabled" value="true" ${settings.public_sharing_enabled === 'true' ? 'checked' : ''}>
                <strong>Aktifkan Akses Publik (Read-Only)</strong>
              </label>
              <div class="form-help">Pengunjung dapat melihat katalog tanpa perlu login jika diaktifkan.</div>
            </div>

            <div class="form-group" style="padding-left:24px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:8px;">
                <input type="checkbox" name="public_games_enabled" value="true" ${settings.public_games_enabled === 'true' ? 'checked' : ''}>
                <span>Tampilkan Katalog Games di Publik</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:8px;">
                <input type="checkbox" name="public_cinema_enabled" value="true" ${settings.public_cinema_enabled === 'true' ? 'checked' : ''}>
                <span>Tampilkan Katalog Cinema di Publik</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:8px;">
                <input type="checkbox" name="public_music_enabled" value="true" ${settings.public_music_enabled === 'true' ? 'checked' : ''}>
                <span>Tampilkan Katalog Music di Publik</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-bottom:8px;">
                <input type="checkbox" name="public_show_prices" value="true" ${settings.public_show_prices === 'true' ? 'checked' : ''}>
                <span>Tampilkan Informasi Harga Game di Publik</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary">Simpan Pengaturan</button>
          </form>
        </div>
      </div>
    `;
  },

  async saveSettings(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const updates = {
      app_name: formData.get('app_name'),
      public_sharing_enabled: formData.get('public_sharing_enabled') ? 'true' : 'false',
      public_games_enabled: formData.get('public_games_enabled') ? 'true' : 'false',
      public_cinema_enabled: formData.get('public_cinema_enabled') ? 'true' : 'false',
      public_music_enabled: formData.get('public_music_enabled') ? 'true' : 'false',
      public_show_prices: formData.get('public_show_prices') ? 'true' : 'false'
    };

    try {
      await api.put('/api/settings', updates);
      showToast('Pengaturan berhasil diperbarui', 'success');
      this.state.publicConfig = await api.get('/api/settings/public-config');
      this.navigate('settings');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  downloadBackup() {
    window.location.href = '/api/data/backup';
    showToast('Mengunduh backup database...', 'info');
  },

  exportData(moduleName) {
    window.location.href = `/api/data/export?module=${moduleName}&format=csv`;
    showToast(`Mengekspor data ${moduleName} ke CSV...`, 'info');
  },

  // -------------------------------------------------------------
  // MODAL: First-Time Setup Wizard
  // -------------------------------------------------------------
  openSetupModal() {
    this.createModal('modal-setup', '🚀 Setup Awal SaumaBox', `
      <form id="form-setup" onsubmit="app.handleSetupSubmit(event)">
        <p style="color:var(--text-secondary); margin-bottom:16px;">
          Selamat datang di SaumaBox. Buat akun administrator pertama untuk mulai mengelola katalog Anda.
        </p>
        <div class="form-group">
          <label class="form-label">Username Admin *</label>
          <input type="text" class="form-input" name="username" required autofocus placeholder="admin">
        </div>
        <div class="form-group">
          <label class="form-label">Password * (Min. 6 Karakter)</label>
          <input type="password" class="form-input" name="password" required minlength="6" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label class="form-label">Nama Tampilan</label>
          <input type="text" class="form-input" name="displayName" placeholder="Rizky (Admin)">
        </div>
        <div class="form-group">
          <label class="form-label">Nama Katalog Pribadi</label>
          <input type="text" class="form-input" name="catalogName" value="SaumaBox">
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="enablePublic" value="true" checked>
            <span>Aktifkan Halaman Publik (Read-Only)</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Selesaikan Setup & Masuk</button>
      </form>
    `);
  },

  async handleSetupSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const body = {
      username: form.username.value,
      password: form.password.value,
      displayName: form.displayName.value,
      catalogName: form.catalogName.value,
      enablePublic: form.enablePublic.checked
    };

    try {
      const res = await api.post('/api/auth/setup', body);
      api.setToken(res.token);
      this.state.user = res.user;
      this.closeModal('modal-setup');
      showToast('Setup awal berhasil. Selamat datang!', 'success');
      this.navigate('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // MODAL: Login
  // -------------------------------------------------------------
  openLoginModal() {
    this.createModal('modal-login', '🔐 Masuk ke Admin Panel', `
      <form id="form-login" onsubmit="app.handleLoginSubmit(event)">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" name="username" required autofocus placeholder="admin">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" name="password" required placeholder="••••••••">
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="rememberMe" value="true" checked>
            <span>Ingat saya (30 hari)</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Masuk</button>
      </form>
    `);
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api.post('/api/auth/login', {
        username: form.username.value,
        password: form.password.value,
        rememberMe: form.rememberMe.checked
      });

      api.setToken(res.token);
      this.state.user = res.user;
      this.closeModal('modal-login');
      showToast('Login berhasil', 'success');
      this.navigate('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {}
    api.setToken('');
    this.state.user = null;
    showToast('Anda telah keluar', 'info');
    this.navigate('landing');
  },

  // -------------------------------------------------------------
  // MODAL: Add / Edit Game
  // -------------------------------------------------------------
  openAddGameModal() {
    this.openGameModal(null);
  },

  async openEditGameModal(id) {
    try {
      const game = await api.get(`/api/games/${id}`);
      this.openGameModal(game);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  openGameModal(game = null) {
    const isEdit = !!game;
    const g = game || {
      type: this.state.games.type === 'ALL' ? 'PC' : this.state.games.type,
      title: '', year: '', publisher: '', developer: '', size_gb: '',
      rating: '', status: 'Purchase', platform: 'Steam', price: 0,
      console: '', emulator: '', rom_format: '', port_year: '',
      port_developer: '', port_version: '', enhancements: '', cover_url: ''
    };

    const modalId = 'modal-game-form';
    this.createModal(modalId, isEdit ? '✏️ Edit Game' : '🎮 Tambah Game Baru', `
      <form id="form-game" onsubmit="app.handleGameSubmit(event, ${isEdit ? g.id : 'null'})">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kategori Game *</label>
            <select class="form-select" name="type" id="modal-game-type" onchange="app.toggleGameModalFields(this.value)">
              <option value="PC" ${g.type === 'PC' ? 'selected' : ''}>PC Games</option>
              <option value="EMULATOR" ${g.type === 'EMULATOR' ? 'selected' : ''}>Emulator Console</option>
              <option value="RECOMP" ${g.type === 'RECOMP' ? 'selected' : ''}>Recomp / Unofficial Port</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tahun Rilis</label>
            <input type="number" class="form-input" name="year" value="${g.year || ''}" placeholder="2022">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Judul Game *</label>
          <input type="text" class="form-input" name="title" required value="${escapeHtml(g.title)}" placeholder="Contoh: Elden Ring">
        </div>

        <div class="form-group">
          <label class="form-label">URL Poster Cover Art</label>
          <input type="text" class="form-input" name="cover_url" value="${escapeHtml(g.cover_url || '')}" placeholder="/images/covers/elden_ring.jpg atau https://...">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Publisher</label>
            <input type="text" class="form-input" name="publisher" value="${escapeHtml(g.publisher || '')}" placeholder="Bandai Namco">
          </div>
          <div class="form-group">
            <label class="form-label">Developer</label>
            <input type="text" class="form-input" name="developer" value="${escapeHtml(g.developer || '')}" placeholder="FromSoftware">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ukuran Penyimpanan (GB)</label>
            <input type="text" class="form-input" name="size_gb" value="${escapeHtml(g.size_gb || '')}" placeholder="60 atau TBA">
          </div>
          <div class="form-group">
            <label class="form-label">Rating Skor (0 - 10)</label>
            <input type="number" step="0.1" min="0" max="10" class="form-input" name="rating" value="${g.rating || ''}" placeholder="9.5">
          </div>
        </div>

        <!-- PC Fields -->
        <div id="field-group-pc" class="form-row" style="${g.type === 'PC' ? '' : 'display:none;'}">
          <div class="form-group">
            <label class="form-label">Platform PC</label>
            <select class="form-select" name="platform">
              <option value="Steam" ${g.platform === 'Steam' ? 'selected' : ''}>Steam</option>
              <option value="Epic" ${g.platform === 'Epic' ? 'selected' : ''}>Epic Games</option>
              <option value="GOG" ${g.platform === 'GOG' ? 'selected' : ''}>GOG</option>
              <option value="Ubisoft" ${g.platform === 'Ubisoft' ? 'selected' : ''}>Ubisoft</option>
              <option value="Crack Fitgirl" ${g.platform === 'Crack Fitgirl' ? 'selected' : ''}>Crack / Repack</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Pembelian (IDR)</label>
            <input type="number" class="form-input" name="price" value="${g.price || 0}" placeholder="599000">
          </div>
        </div>

        <!-- Emulator Fields -->
        <div id="field-group-emu" class="form-row" style="${g.type === 'EMULATOR' ? '' : 'display:none;'}">
          <div class="form-group">
            <label class="form-label">Konsol Asal</label>
            <input type="text" class="form-input" name="console" value="${escapeHtml(g.console || '')}" placeholder="PS2, Switch, N64...">
          </div>
          <div class="form-group">
            <label class="form-label">Software Emulator</label>
            <input type="text" class="form-input" name="emulator" value="${escapeHtml(g.emulator || '')}" placeholder="PCSX2, Ryujinx, Cemu...">
          </div>
        </div>

        <!-- Recomp Fields -->
        <div id="field-group-recomp" style="${g.type === 'RECOMP' ? '' : 'display:none;'}">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tim Porting / Developer</label>
              <input type="text" class="form-input" name="port_developer" value="${escapeHtml(g.port_developer || '')}" placeholder="Harbour Masters">
            </div>
            <div class="form-group">
              <label class="form-label">Versi Build Port</label>
              <input type="text" class="form-input" name="port_version" value="${escapeHtml(g.port_version || '')}" placeholder="v8.0.5">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Fitur Tambahan (Enhancements)</label>
            <input type="text" class="form-input" name="enhancements" value="${escapeHtml(g.enhancements || '')}" placeholder="High FPS, Ultrawide, HD Texture">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Status Kepemilikan / Kompatibilitas</label>
          <input type="text" class="form-input" name="status" value="${escapeHtml(g.status || '')}" placeholder="Purchase, Wishlist, Playable (60 FPS)...">
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('${modalId}')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Game'}</button>
        </div>
      </form>
    `);
  },

  toggleGameModalFields(type) {
    document.getElementById('field-group-pc').style.display = type === 'PC' ? 'grid' : 'none';
    document.getElementById('field-group-emu').style.display = type === 'EMULATOR' ? 'grid' : 'none';
    document.getElementById('field-group-recomp').style.display = type === 'RECOMP' ? 'block' : 'none';
  },

  async handleGameSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = {
      type: form.type.value,
      title: form.title.value,
      cover_url: form.cover_url?.value || '',
      year: form.year.value,
      publisher: form.publisher.value,
      developer: form.developer.value,
      size_gb: form.size_gb.value,
      rating: form.rating.value,
      status: form.status.value,
      platform: form.platform?.value || '',
      price: form.price?.value || 0,
      console: form.console?.value || '',
      emulator: form.emulator?.value || '',
      port_developer: form.port_developer?.value || '',
      port_version: form.port_version?.value || '',
      enhancements: form.enhancements?.value || ''
    };

    try {
      if (id) {
        await api.put(`/api/games/${id}`, body);
        showToast('Data game berhasil diperbarui', 'success');
      } else {
        await api.post('/api/games', body);
        showToast('Game baru berhasil ditambahkan', 'success');
      }
      this.closeModal('modal-game-form');
      if (this.state.currentTab === 'games') {
        this.renderGames(document.getElementById('view-container'));
      } else {
        this.renderLanding(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteGame(id, title) {
    if (confirm(`Yakin ingin menghapus game "${title}"?`)) {
      api.delete(`/api/games/${id}`).then(() => {
        showToast('Game berhasil dihapus', 'success');
        this.renderGames(document.getElementById('view-container'));
      }).catch(err => showToast(err.message, 'error'));
    }
  },

  // -------------------------------------------------------------
  // MODAL: Add / Edit Cinema
  // -------------------------------------------------------------
  openAddCinemaModal() {
    this.openCinemaModal(null);
  },

  async openEditCinemaModal(id) {
    try {
      const item = await api.get(`/api/cinema/${id}`);
      this.openCinemaModal(item);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  openCinemaModal(item = null) {
    const isEdit = !!item;
    const c = item || {
      type: 'MOVIE', title: '', rating: '', year: '', country: 'Indonesia',
      studio: '', genre: '', age_rating: 'SU (Semua Umur)', total_episodes: '',
      total_seasons: '', watched: 0, cover_url: ''
    };

    const modalId = 'modal-cinema-form';
    this.createModal(modalId, isEdit ? '✏️ Edit Tayangan' : '🎬 Tambah Tayangan Baru', `
      <form id="form-cinema" onsubmit="app.handleCinemaSubmit(event, ${isEdit ? c.id : 'null'})">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tipe Tayangan *</label>
            <select class="form-select" name="type">
              <option value="MOVIE" ${c.type === 'MOVIE' ? 'selected' : ''}>Movie (Film)</option>
              <option value="SERIES" ${c.type === 'SERIES' ? 'selected' : ''}>TV Series</option>
              <option value="ANIME" ${c.type === 'ANIME' ? 'selected' : ''}>Anime</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tahun Rilis</label>
            <input type="number" class="form-input" name="year" value="${c.year || ''}" placeholder="2022">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Judul Tayangan *</label>
          <input type="text" class="form-input" name="title" required value="${escapeHtml(c.title)}" placeholder="22 Menit, Jujutsu Kaisen...">
        </div>

        <div class="form-group">
          <label class="form-label">URL Poster Cover Art</label>
          <input type="text" class="form-input" name="cover_url" value="${escapeHtml(c.cover_url || '')}" placeholder="/images/covers/breaking_bad.jpg atau https://...">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Rating IMDb (0 - 10)</label>
            <input type="number" step="0.1" min="0" max="10" class="form-input" name="rating" value="${c.rating || ''}" placeholder="8.5">
          </div>
          <div class="form-group">
            <label class="form-label">Klasifikasi Usia</label>
            <input type="text" class="form-input" name="age_rating" value="${escapeHtml(c.age_rating || '')}" placeholder="SU, R (13+), D (17+)">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Negara</label>
            <input type="text" class="form-input" name="country" value="${escapeHtml(c.country || '')}" placeholder="Indonesia, Jepang...">
          </div>
          <div class="form-group">
            <label class="form-label">Studio / Rumah Produksi</label>
            <input type="text" class="form-input" name="studio" value="${escapeHtml(c.studio || '')}" placeholder="MAPPA, Falcon Pictures...">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Genre (Pisahkan koma)</label>
          <input type="text" class="form-input" name="genre" value="${escapeHtml(c.genre || '')}" placeholder="Aksi, Drama, Thriller">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Total Episode (Series/Anime)</label>
            <input type="number" class="form-input" name="total_episodes" value="${c.total_episodes || ''}" placeholder="24">
          </div>
          <div class="form-group">
            <label class="form-label">Total Season</label>
            <input type="number" class="form-input" name="total_seasons" value="${c.total_seasons || ''}" placeholder="1">
          </div>
        </div>

        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="watched" value="1" ${c.watched === 1 ? 'checked' : ''}>
            <span>Sudah Selesai Ditonton</span>
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('${modalId}')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Tayangan'}</button>
        </div>
      </form>
    `);
  },

  async handleCinemaSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = {
      type: form.type.value,
      title: form.title.value,
      cover_url: form.cover_url?.value || '',
      rating: form.rating.value,
      year: form.year.value,
      country: form.country.value,
      studio: form.studio.value,
      genre: form.genre.value,
      age_rating: form.age_rating.value,
      total_episodes: form.total_episodes.value,
      total_seasons: form.total_seasons.value,
      watched: form.watched.checked ? 1 : 0
    };

    try {
      if (id) {
        await api.put(`/api/cinema/${id}`, body);
        showToast('Tayangan berhasil diperbarui', 'success');
      } else {
        await api.post('/api/cinema', body);
        showToast('Tayangan baru berhasil ditambahkan', 'success');
      }
      this.closeModal('modal-cinema-form');
      if (this.state.currentTab === 'cinema') {
        this.renderCinema(document.getElementById('view-container'));
      } else {
        this.renderLanding(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteCinema(id, title) {
    if (confirm(`Yakin ingin menghapus tayangan "${title}"?`)) {
      api.delete(`/api/cinema/${id}`).then(() => {
        showToast('Tayangan berhasil dihapus', 'success');
        this.renderCinema(document.getElementById('view-container'));
      }).catch(err => showToast(err.message, 'error'));
    }
  },

  // -------------------------------------------------------------
  // MODAL: Add / Edit Music
  // -------------------------------------------------------------
  openAddMusicModal() {
    this.openMusicModal(null);
  },

  async openEditMusicModal(id) {
    try {
      const item = await api.get(`/api/music/${id}`);
      this.openMusicModal(item);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  openMusicModal(item = null) {
    const isEdit = !!item;
    const m = item || {
      title: '', artist: '', album: '', year: '', genre: '',
      platform: 'Spotify', size_mb: '', rating: '', is_favorite: 0, notes: '', cover_url: ''
    };

    const modalId = 'modal-music-form';
    this.createModal(modalId, isEdit ? '✏️ Edit Trek Musik' : '🎵 Tambah Musik Baru', `
      <form id="form-music" onsubmit="app.handleMusicSubmit(event, ${isEdit ? m.id : 'null'})">
        <div class="form-group">
          <label class="form-label">Judul Trek / Album *</label>
          <input type="text" class="form-input" name="title" required value="${escapeHtml(m.title)}" placeholder="Bohemian Rhapsody">
        </div>

        <div class="form-group">
          <label class="form-label">URL Album Cover Art</label>
          <input type="text" class="form-input" name="cover_url" value="${escapeHtml(m.cover_url || '')}" placeholder="/images/covers/bohemian_rhapsody.jpg atau https://...">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Artis / Komposer</label>
            <input type="text" class="form-input" name="artist" value="${escapeHtml(m.artist || '')}" placeholder="Queen">
          </div>
          <div class="form-group">
            <label class="form-label">Nama Album</label>
            <input type="text" class="form-input" name="album" value="${escapeHtml(m.album || '')}" placeholder="A Night at the Opera">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tahun</label>
            <input type="number" class="form-input" name="year" value="${m.year || ''}" placeholder="1975">
          </div>
          <div class="form-group">
            <label class="form-label">Genre</label>
            <input type="text" class="form-input" name="genre" value="${escapeHtml(m.genre || '')}" placeholder="Rock, Jazz, OST">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Platform / Format</label>
            <input type="text" class="form-input" name="platform" value="${escapeHtml(m.platform || '')}" placeholder="Spotify, FLAC/Lossless...">
          </div>
          <div class="form-group">
            <label class="form-label">Ukuran File (MB)</label>
            <input type="number" step="0.1" class="form-input" name="size_mb" value="${m.size_mb || ''}" placeholder="48.5">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Rating (0 - 10)</label>
            <input type="number" step="0.1" min="0" max="10" class="form-input" name="rating" value="${m.rating || ''}" placeholder="9.8">
          </div>
          <div class="form-group">
            <label class="form-label">Catatan Tambahan</label>
            <input type="text" class="form-input" name="notes" value="${escapeHtml(m.notes || '')}" placeholder="Trek favorit konser">
          </div>
        </div>

        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="is_favorite" value="1" ${m.is_favorite === 1 ? 'checked' : ''}>
            <span>Tandai Sebagai Favorit ⭐</span>
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('${modalId}')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Musik'}</button>
        </div>
      </form>
    `);
  },

  async handleMusicSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = {
      title: form.title.value,
      artist: form.artist.value,
      cover_url: form.cover_url?.value || '',
      album: form.album.value,
      year: form.year.value,
      genre: form.genre.value,
      platform: form.platform.value,
      size_mb: form.size_mb.value,
      rating: form.rating.value,
      is_favorite: form.is_favorite.checked ? 1 : 0,
      notes: form.notes.value
    };

    try {
      if (id) {
        await api.put(`/api/music/${id}`, body);
        showToast('Musik berhasil diperbarui', 'success');
      } else {
        await api.post('/api/music', body);
        showToast('Musik berhasil ditambahkan', 'success');
      }
      this.closeModal('modal-music-form');
      if (this.state.currentTab === 'music') {
        this.renderMusic(document.getElementById('view-container'));
      } else {
        this.renderLanding(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteMusic(id, title) {
    if (confirm(`Yakin ingin menghapus musik "${title}"?`)) {
      api.delete(`/api/music/${id}`).then(() => {
        showToast('Musik berhasil dihapus', 'success');
        this.renderMusic(document.getElementById('view-container'));
      }).catch(err => showToast(err.message, 'error'));
    }
  },

  // -------------------------------------------------------------
  // MODAL: Smart Import (CSV / JSON)
  // -------------------------------------------------------------
  openImportModal(defaultModule = 'games') {
    this.createModal('modal-import', '📥 Smart Import Data', `
      <div id="import-step-upload">
        <p style="color:var(--text-secondary); margin-bottom:16px;">
          Unggah file spreadsheet (CSV atau JSON) untuk diimport ke dalam katalog. Sistem otomatis mendeteksi dan mencocokkan kolom Anda.
        </p>
        <div class="form-group">
          <label class="form-label">Modul Tujuan *</label>
          <select class="form-select" id="import-target-module">
            <option value="games" ${defaultModule === 'games' ? 'selected' : ''}>Katalog Games</option>
            <option value="cinema" ${defaultModule === 'cinema' ? 'selected' : ''}>Katalog Cinema</option>
            <option value="music" ${defaultModule === 'music' ? 'selected' : ''}>Katalog Music</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Pilih File (.csv atau .json) *</label>
          <input type="file" id="import-file-input" class="form-input" accept=".csv, .json, text/csv, application/json">
        </div>
        <button type="button" class="btn btn-primary" onclick="app.uploadImportFile()">Lanjut ke Pencocokan Kolom →</button>
      </div>
      <div id="import-step-mapping" style="display:none;"></div>
    `);
  },

  async uploadImportFile() {
    const fileInput = document.getElementById('import-file-input');
    const targetModule = document.getElementById('import-target-module').value;
    if (!fileInput || !fileInput.files[0]) {
      return showToast('Pilih file terlebih dahulu', 'warning');
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      showToast('Membaca struktur file...', 'info');
      const res = await api.upload('/api/data/import-preview', formData);
      this.renderMappingStep(res, targetModule);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  renderMappingStep(previewData, targetModule) {
    document.getElementById('import-step-upload').style.display = 'none';
    const mappingContainer = document.getElementById('import-step-mapping');
    mappingContainer.style.display = 'block';

    const targetFields = targetModule === 'games' ? [
      { key: 'title', label: 'Judul Game *' },
      { key: 'type', label: 'Tipe (PC / EMULATOR / RECOMP)' },
      { key: 'year', label: 'Tahun' },
      { key: 'publisher', label: 'Publisher' },
      { key: 'developer', label: 'Developer' },
      { key: 'size_gb', label: 'Ukuran (GB)' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status' },
      { key: 'platform', label: 'Platform (Steam/GOG...)' },
      { key: 'price', label: 'Harga (IDR)' },
      { key: 'console', label: 'Konsol' },
      { key: 'emulator', label: 'Emulator' }
    ] : (targetModule === 'cinema' ? [
      { key: 'title', label: 'Judul Tayangan *' },
      { key: 'type', label: 'Tipe (MOVIE / SERIES / ANIME)' },
      { key: 'rating', label: 'Rating IMDb' },
      { key: 'year', label: 'Tahun' },
      { key: 'country', label: 'Negara' },
      { key: 'studio', label: 'Studio' },
      { key: 'genre', label: 'Genre' },
      { key: 'age_rating', label: 'Rating Usia' },
      { key: 'watched', label: 'Status Ditonton' }
    ] : [
      { key: 'title', label: 'Judul Trek *' },
      { key: 'artist', label: 'Artis' },
      { key: 'album', label: 'Album' },
      { key: 'year', label: 'Tahun' },
      { key: 'genre', label: 'Genre' },
      { key: 'platform', label: 'Platform' },
      { key: 'size_mb', label: 'Ukuran (MB)' },
      { key: 'rating', label: 'Rating' }
    ]);

    const headerOptions = `<option value="">(Abaikan / Kosongkan)</option>` +
      previewData.headers.map(h => `<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join('');

    const mappingRows = targetFields.map(f => {
      const suggested = previewData.suggested_mapping[f.key] || '';
      return `
        <tr>
          <td><strong>${f.label}</strong></td>
          <td>
            <select class="form-select mapping-select" data-key="${f.key}">
              <option value="">(Abaikan / Kosongkan)</option>
              ${previewData.headers.map(h => `<option value="${escapeHtml(h)}" ${h === suggested ? 'selected' : ''}>${escapeHtml(h)}</option>`).join('')}
            </select>
          </td>
        </tr>
      `;
    }).join('');

    mappingContainer.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3>Pencocokan Kolom (Smart Mapping)</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary);">
          File: <strong>${escapeHtml(previewData.filename)}</strong> (${previewData.total_rows} baris data).
        </p>
      </div>

      <div class="table-responsive" style="max-height:300px; margin-bottom:16px;">
        <table class="data-table">
          <thead>
            <tr><th>Kolom SaumaBox</th><th>Kolom dari File Anda</th></tr>
          </thead>
          <tbody>
            ${mappingRows}
          </tbody>
        </table>
      </div>

      <div style="display:flex; justify-content:space-between; gap:10px;">
        <button class="btn btn-secondary" onclick="app.openImportModal('${targetModule}')">← Pilih Ulang File</button>
        <button class="btn btn-primary" onclick="app.executeImport('${previewData.temp_file_id}', '${targetModule}')">Mulai Import Data Sekarang 🚀</button>
      </div>
    `;
  },

  async executeImport(tempFileId, targetModule) {
    const selects = document.querySelectorAll('.mapping-select');
    const mapping = {};
    selects.forEach(sel => {
      if (sel.value) {
        mapping[sel.dataset.key] = sel.value;
      }
    });

    if (!mapping.title) {
      return showToast('Kolom Judul wajib dipetakan!', 'warning');
    }

    try {
      showToast('Mengimpor data...', 'info');
      const res = await api.post('/api/data/import-execute', {
        temp_file_id: tempFileId,
        module: targetModule,
        mapping
      });

      this.closeModal('modal-import');
      showToast(`Sukses! ${res.success_count} baris berhasil diimport.`, 'success');
      this.navigate(targetModule);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // MODAL: Restore Database
  // -------------------------------------------------------------
  openRestoreModal() {
    this.createModal('modal-restore', '🔄 Restore Database SQLite', `
      <p style="color:var(--text-secondary); margin-bottom:16px;">
        Pilih file <code>.sqlite</code> untuk memulihkan seluruh data aplikasi. Sistem akan menjalankan validasi <code>PRAGMA integrity_check;</code> dan otomatis membuat rollback snapshot sebelum menimpa data aktif.
      </p>
      <div class="form-group">
        <label class="form-label">Pilih File Backup (.sqlite) *</label>
        <input type="file" id="restore-file-input" class="form-input" accept=".sqlite, .db">
      </div>
      <div style="background:var(--bg-surface-elevated); padding:12px; border-radius:var(--radius-control); margin-bottom:16px; font-size:0.8rem; color:var(--text-muted);">
        ⚠️ Peringatan: Proses ini akan memulihkan katalog dari file backup. Snapshot cadangan otomatis disimpan di <code>auto_backup_before_restore.sqlite</code>.
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-secondary" onclick="app.closeModal('modal-restore')">Batal</button>
        <button class="btn btn-danger" onclick="app.executeRestore()">Mulai Restore Database</button>
      </div>
    `);
  },

  async executeRestore() {
    const fileInput = document.getElementById('restore-file-input');
    if (!fileInput || !fileInput.files[0]) {
      return showToast('Pilih file backup (.sqlite) terlebih dahulu', 'warning');
    }

    const formData = new FormData();
    formData.append('backup_file', fileInput.files[0]);

    try {
      showToast('Memvalidasi integritas file backup...', 'info');
      const res = await api.upload('/api/data/restore', formData);
      this.closeModal('modal-restore');
      showToast(res.message, 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // Modal Helpers
  // -------------------------------------------------------------
  createModal(id, title, bodyHtml) {
    this.closeModal(id);
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.id = id;

    backdrop.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 style="font-size:1.15rem;">${title}</h2>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="app.closeModal('${id}')" aria-label="Tutup">✕</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.closeModal(id);
      }
    });

    document.body.appendChild(backdrop);
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  }
};

// Inisialisasi aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
