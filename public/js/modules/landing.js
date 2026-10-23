// ============================================================
// SaumaBox — Landing Page & Showcase Module
// Impeccable Design: Critique, Layout, Typeset & Colorize
// ============================================================

Object.assign(app, {
  async renderLanding(container) {
    const [stats, recent] = await Promise.all([
      api.get('/api/settings/stats'),
      api.get('/api/recent')
    ]);
    this.state.recent = recent;
    this.state.recentCategory = this.state.recentCategory || 'all';
    this.state.landingSearch = this.state.landingSearch || '';
    this.state.landingSort = this.state.landingSort || 'newest';

    const allGames = recent.games || [];
    const allCinema = recent.cinema || [];
    const allMusic = recent.music || [];
    const allWeb = recent.web || [];
    const cfg = this.state.publicConfig || {};
    const isPublic = cfg.public_sharing_enabled !== false;
    const isGames = isPublic && cfg.public_games_enabled !== false;
    const isCinema = isPublic && cfg.public_cinema_enabled !== false;
    const isMusic = isPublic && cfg.public_music_enabled !== false;
    const isWeb = isPublic && cfg.public_web_enabled !== false;
    const showPrice = !!this.state.user || (isPublic && cfg.public_show_prices !== false);

    const bannerTitle = escapeHtml(cfg.banner_title || 'Kurasi Digital Game, Sinema & Audio dalam Satu Presisi');
    const bannerSubtitle = escapeHtml(cfg.banner_subtitle || 'Ruang arsip pribadi untuk menyimpan dan mengorganisasi koleksi game PC, emulator retro, serial sinema pilihan, dan arsip audio lossless dalam tampilan bersih dan tenang.');
    const appLogo = escapeHtml(cfg.app_logo_url || '/images/logo.png');
    const appName = escapeHtml(cfg.app_name || 'SaumaBox');

    const totalCount = (isGames ? allGames.length : 0) + (isCinema ? allCinema.length : 0) + (isMusic ? allMusic.length : 0) + (isWeb ? allWeb.length : 0);

    container.innerHTML = `
      <section class="editorial-hero">
        <div class="hero-glow-bg" aria-hidden="true"></div>
        <div class="hero-layout-grid">
          <div class="hero-copy-col">
            <div class="hero-status-pill">
              <span class="status-pulse-dot"></span>
              <span class="status-pill-text">Pustaka Multimedia Personal • Akses Lokal Siap Pakai</span>
            </div>
            <h1 class="hero-display-title">${bannerTitle}</h1>
            <p class="hero-lead-text">${bannerSubtitle}</p>

            <div class="hero-metric-strip">
              ${isGames ? `
                <div class="metric-chip" onclick="app.scrollToCategory('games');" role="button" tabindex="0">
                  <span class="metric-num">${stats.totals.games}</span>
                  <span class="metric-lbl">Permainan</span>
                </div>
              ` : ''}
              ${isCinema ? `
                <div class="metric-chip" onclick="app.scrollToCategory('cinema');" role="button" tabindex="0">
                  <span class="metric-num">${stats.totals.cinema}</span>
                  <span class="metric-lbl">Sinema</span>
                </div>
              ` : ''}
              ${isMusic ? `
                <div class="metric-chip" onclick="app.scrollToCategory('music');" role="button" tabindex="0">
                  <span class="metric-num">${stats.totals.music}</span>
                  <span class="metric-lbl">Musik</span>
                </div>
              ` : ''}
              ${isWeb ? `
                <div class="metric-chip" onclick="app.scrollToCategory('web');" role="button" tabindex="0">
                  <span class="metric-num">${stats.totals.web || 0}</span>
                  <span class="metric-lbl">Bookmark Web</span>
                </div>
              ` : ''}
              ${showPrice && isGames ? `
                <div class="metric-chip">
                  <span class="metric-num font-mono">${formatRupiah(stats.totals.spending)}</span>
                  <span class="metric-lbl">Investasi Koleksi</span>
                </div>
              ` : ''}
              ${!isPublic ? `
                <div class="metric-chip" style="border-color:var(--accent-color);">
                  <span class="metric-num">${getIcon('lock', 'ui-icon', 18)}</span>
                  <span class="metric-lbl">Katalog Privat</span>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="hero-illustration-col">
            <div class="hero-app-showcase-card">
              <div class="app-illustration-frame">
                <img src="${appLogo}" alt="Ilustrasi ${appName}" class="app-illustration-img" loading="eager" onerror="this.src='/images/logo.png'">
              </div>
              <div class="app-showcase-badge">
                ${getIcon('sparkles', 'ui-icon', 13)}
                <span>Pustaka Terpadu</span>
              </div>
              <h2 class="app-showcase-title">${appName} Hub</h2>
              <p class="app-showcase-desc">Pusat arsip media pribadi: Permainan, Sinema, Musik, dan Bookmark Web.</p>
              <div class="app-showcase-pillars">
                ${isGames ? `<span class="pillar-tag">${getIcon('games', 'ui-icon', 14)} Games</span>` : ''}
                ${isCinema ? `<span class="pillar-tag">${getIcon('cinema', 'ui-icon', 14)} Sinema</span>` : ''}
                ${isMusic ? `<span class="pillar-tag">${getIcon('music', 'ui-icon', 14)} Musik</span>` : ''}
                ${isWeb ? `<span class="pillar-tag">${getIcon('globe', 'ui-icon', 14)} Web</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      ${isPublic ? `
        <section class="recent-showcase-section" id="public-showcase-section">
          <div class="showcase-control-bar">
            <div class="showcase-heading-group">
              <h2 class="showcase-title">Pilihan Koleksi Terbaru</h2>
              <p class="showcase-subtitle">Eksplorasi entri media terbaru per kategori dengan slider interaktif (Maksimal 10 poster per baris)</p>
            </div>
          </div>

          <div class="showcase-rows-wrapper" id="recent-media-grid">
            ${this.renderRecentShowcase()}
          </div>
        </section>
      ` : `
        <section class="recent-showcase-section" id="public-showcase-section" style="padding:48px 24px; text-align:center;">
          <div class="state-container" style="max-width:540px; margin:0 auto; padding:36px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:18px;">
            <div class="state-icon" style="color:var(--accent-color);">${getIcon('lock', 'ui-icon', 40)}</div>
            <h3 class="state-title" style="margin-top:14px;">Visibilitas Akses Publik Nonaktif</h3>
            <p class="state-desc" style="color:var(--text-secondary); margin:8px 0 20px 0; font-size:0.88rem;">
              Administrator menonaktifkan visibilitas publik untuk pengunjung. Silakan masuk untuk melihat seluruh katalog koleksi.
            </p>
            <button class="btn btn-primary btn-sm" onclick="app.openLoginModal()">${getIcon('user', 'ui-icon-btn', 14)} Masuk Admin</button>
          </div>
        </section>
      `}

      <footer class="site-public-footer" role="contentinfo" aria-label="Informasi Footer Publik">
        <div class="footer-container">
          <div class="footer-grid">
            <div class="footer-col footer-brand-col">
              <div class="footer-brand-wrap" onclick="app.navigate('landing')" role="button" tabindex="0" title="Beranda ${appName}">
                <img src="${appLogo}" alt="${appName}" class="footer-brand-logo" width="30" height="30" onerror="this.src='/images/logo-icon.png'">
                <div class="footer-brand-title-group">
                  <span class="footer-brand-name">${appName}</span>
                  <span class="footer-version-tag">v0.5.3</span>
                </div>
              </div>
              <p class="footer-brand-desc">
                Pustaka multimedia personal mandiri. Mengarsipkan katalog game, sinema film & serial, audio lossless, serta peluncur web favorit dalam satu wadah privat yang tenang.
              </p>
              <div class="footer-pill-badge">
                <span class="footer-pulse-dot" aria-hidden="true"></span>
                <span>Local-First • SQLite WAL • Bebas Pelacak</span>
              </div>
            </div>

            <div class="footer-col footer-nav-col">
              <h4 class="footer-col-title">Navigasi Pustaka</h4>
              <ul class="footer-links-list">
                <li><button type="button" class="footer-link-btn" onclick="app.navigate('landing')">${getIcon('dashboard', 'footer-link-icon', 14)} <span>Beranda Publik</span></button></li>
                ${isGames ? `<li><button type="button" class="footer-link-btn" onclick="app.navigate('games')">${getIcon('games', 'footer-link-icon', 14)} <span>Katalog Games</span></button></li>` : ''}
                ${isCinema ? `<li><button type="button" class="footer-link-btn" onclick="app.navigate('cinema')">${getIcon('cinema', 'footer-link-icon', 14)} <span>Koleksi Sinema</span></button></li>` : ''}
                ${isMusic ? `<li><button type="button" class="footer-link-btn" onclick="app.navigate('music')">${getIcon('music', 'footer-link-icon', 14)} <span>Arsip Musik FLAC</span></button></li>` : ''}
                ${isWeb ? `<li><button type="button" class="footer-link-btn" onclick="app.navigate('web')">${getIcon('globe', 'footer-link-icon', 14)} <span>Peluncur Web & Bookmark</span></button></li>` : ''}
              </ul>
            </div>

            <div class="footer-col footer-tech-col">
              <h4 class="footer-col-title">Arsitektur Sistem</h4>
              <ul class="footer-info-list">
                <li class="footer-info-item">
                  <span class="footer-info-icon">${getIcon('database', 'footer-mini-icon', 14)}</span>
                  <div class="footer-info-content">
                    <span class="footer-info-label">Basis Data SQLite</span>
                    <span class="footer-info-sub">Penyimpanan lokal cepat dengan WAL mode</span>
                  </div>
                </li>
                <li class="footer-info-item">
                  <span class="footer-info-icon">${getIcon('shield', 'footer-mini-icon', 14)}</span>
                  <div class="footer-info-content">
                    <span class="footer-info-label">100% Privasi Mandiri</span>
                    <span class="footer-info-sub">Self-hosted tanpa pelacak pihak ketiga</span>
                  </div>
                </li>
                <li class="footer-info-item">
                  <span class="footer-info-icon">${getIcon('layers', 'footer-mini-icon', 14)}</span>
                  <div class="footer-info-content">
                    <span class="footer-info-label">PWA & Desain Responsif</span>
                    <span class="footer-info-sub">Optimal di perangkat mobile & desktop</span>
                  </div>
                </li>
              </ul>
            </div>

            <div class="footer-col footer-meta-col">
              <h4 class="footer-col-title">Proyek & Ekosistem</h4>
              <ul class="footer-links-list">
                <li>
                  <a href="https://github.com/sauma/SaumaBox" target="_blank" rel="noopener noreferrer" class="footer-link-btn external" title="Buka repositori GitHub di tab baru">
                    <svg class="footer-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span>Repositori GitHub</span>
                    ${getIcon('externalLink', 'footer-ext-icon', 11)}
                  </a>
                </li>
                <li>
                  <span class="footer-link-btn static-item">
                    ${getIcon('code', 'footer-link-icon', 14)}
                    <span>Lisensi Terbuka MIT</span>
                  </span>
                </li>
                <li>
                  <span class="footer-link-btn static-item">
                    ${getIcon('refresh', 'footer-link-icon', 14)}
                    <span>Rilis Versi 0.5.3</span>
                  </span>
                </li>
                <li>
                  <span class="footer-link-btn static-item">
                    ${getIcon('sparkles', 'footer-link-icon', 14)}
                    <span>Ekspor / Impor JSON & CSV</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <div class="footer-copy-text">
              &copy; ${new Date().getFullYear()} <strong>${appName}</strong>. Seluruh koleksi tersimpan secara lokal dan mandiri.
            </div>

            <div class="footer-bottom-actions">
              ${!!this.state.user ? `
                <button type="button" class="footer-action-trigger" onclick="app.navigate('dashboard')" title="Buka Dashboard Admin">
                  ${getIcon('dashboard', 'footer-btn-icon', 13)}
                  <span>Dashboard Admin</span>
                </button>
              ` : `
                <button type="button" class="footer-action-trigger" onclick="app.openLoginModal()" title="Masuk Mode Administrator (Pintasan: Ctrl + Shift + L)">
                  ${getIcon('lock', 'footer-btn-icon', 13)}
                  <span>Masuk Admin</span>
                </button>
              `}
              <span class="footer-bottom-dot" aria-hidden="true">&bull;</span>
              <button type="button" class="footer-back-to-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" title="Kembali ke atas halaman" aria-label="Kembali ke atas">
                <span>Ke Atas</span>
                ${getIcon('chevronUp', 'footer-btn-icon', 13)}
              </button>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  scrollToShowcase() {
    const el = document.getElementById('public-showcase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  scrollToCategory(category) {
    const el = document.getElementById(`row-${category}`) || document.getElementById('public-showcase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  setRecentCategory(category) {
    this.scrollToCategory(category);
  },

  slideShowcase(category, direction) {
    const track = document.getElementById(`slider-${category}`);
    if (!track) return;
    const card = track.querySelector('.media-card');
    const isMobile = window.innerWidth <= 768;
    const gap = isMobile ? 6 : 16;
    const visibleCount = isMobile ? 4 : 5;
    const step = card ? (card.offsetWidth + gap) * visibleCount : track.clientWidth * 0.85;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  },

  handleLandingSearch(query) {
    this.state.landingSearch = (query || '').trim().toLowerCase();
    const grid = document.getElementById('recent-media-grid');
    if (grid) grid.innerHTML = this.renderRecentShowcase();
  },

  handleLandingSort(sortBy) {
    this.state.landingSort = sortBy;
    const grid = document.getElementById('recent-media-grid');
    if (grid) grid.innerHTML = this.renderRecentShowcase();
  },

  renderRecentShowcase() {
    const recent = this.state.recent || { games: [], cinema: [], music: [] };
    const query = this.state.landingSearch || '';
    const sortBy = this.state.landingSort || 'newest';

    const cfg = this.state.publicConfig || {};
    const isPublic = cfg.public_sharing_enabled !== false;
    const isGames = isPublic && cfg.public_games_enabled !== false;
    const isCinema = isPublic && cfg.public_cinema_enabled !== false;
    const isMusic = isPublic && cfg.public_music_enabled !== false;
    const isWeb = isPublic && cfg.public_web_enabled !== false;

    const categories = [];
    if (isGames) categories.push({ key: 'games', label: 'Games', icon: 'games', link: 'games' });
    if (isCinema) categories.push({ key: 'cinema', label: 'Sinema', icon: 'cinema', link: 'cinema' });
    if (isMusic) categories.push({ key: 'music', label: 'Musik', icon: 'music', link: 'music' });
    if (isWeb) categories.push({ key: 'web', label: 'Bookmark Web', icon: 'globe', link: 'web' });

    const selectedCats = categories;

    const renderedRows = [];

    for (const cat of selectedCats) {
      let items = (recent[cat.key] || []).map(item => ({ ...item, _mediaType: cat.key }));

      if (query) {
        items = items.filter(item => {
          const str = `${item.title || ''} ${item.artist || ''} ${item.album || ''} ${item.genre || ''} ${item.developer || ''} ${item.studio || ''} ${item.publisher || ''}`.toLowerCase();
          return str.includes(query);
        });
      }

      if (sortBy === 'rating') {
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'title') {
        items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }

      items = items.slice(0, 10);

      if (items.length > 0) {
        if (cat.key === 'web') {
          renderedRows.push(this.renderShowcaseWebRow(cat, items));
        } else {
          renderedRows.push(this.renderShowcaseCategoryRow(cat, items));
        }
      }
    }

    if (renderedRows.length === 0) {
      return `
        <div class="showcase-empty-state">
          <div class="empty-icon">${getIcon('search', 'ui-icon', 36)}</div>
          <h3 class="empty-title">Koleksi Belum Ditemukan</h3>
          <p class="empty-desc">Tidak ada entri yang cocok dengan kata kunci atau filter saat ini. Coba periksa kembali ejaan atau pilih kategori lain di atas.</p>
        </div>
      `;
    }

    return renderedRows.join('');
  },

  renderShowcaseCategoryRow(cat, items) {
    const cardsHtml = items.map(item => {
      if (cat.key === 'games') return this.renderRecentGameCard(item);
      if (cat.key === 'cinema') return this.renderRecentCinemaCard(item);
      return this.renderRecentMusicCard(item);
    }).join('');

    return `
      <section class="showcase-category-row" id="row-${cat.key}">
        <div class="showcase-row-header">
          <div class="showcase-row-title-wrap">
            <span class="showcase-row-icon">${getIcon(cat.icon, 'ui-icon', 18)}</span>
            <h3 class="showcase-row-title">${cat.label}</h3>
            <span class="badge badge-neutral font-mono">${items.length}</span>
            <button class="showcase-view-all-link" onclick="app.navigate('${cat.link}')" title="Buka katalog ${cat.label}">
              Lihat Semua ↗
            </button>
          </div>
          <div class="showcase-row-controls">
            <button class="slider-nav-btn" onclick="app.slideShowcase('${cat.key}', -1)" title="Geser ke kiri" aria-label="Geser ke kiri">
              ${getIcon('chevronLeft', 'ui-icon', 16)}
            </button>
            <button class="slider-nav-btn" onclick="app.slideShowcase('${cat.key}', 1)" title="Geser ke kanan" aria-label="Geser ke kanan">
              ${getIcon('chevronRight', 'ui-icon', 16)}
            </button>
          </div>
        </div>
        <div class="media-slider-container">
          <div class="media-slider-track" id="slider-${cat.key}">
            ${cardsHtml}
          </div>
        </div>
      </section>
    `;
  },

  renderShowcaseWebRow(cat, items) {
    const tilesHtml = items.map(item => typeof this.renderWebTile === 'function' ? this.renderWebTile(item, false) : '').join('');

    return `
      <section class="showcase-category-row" id="row-web">
        <div class="showcase-row-header">
          <div class="showcase-row-title-wrap">
            <span class="showcase-row-icon">${getIcon('globe', 'ui-icon', 18)}</span>
            <h3 class="showcase-row-title">${cat.label}</h3>
            <span class="badge badge-neutral font-mono">${items.length}</span>
            <button class="showcase-view-all-link" onclick="app.navigate('web')" title="Buka katalog web lengkap">
              Lihat Semua ↗
            </button>
          </div>
        </div>
        <div class="web-app-grid" style="margin-top:12px;">
          ${tilesHtml}
        </div>
      </section>
    `;
  },

  renderRecentGameCard(g) {
    const coverSrc = g.cover_url || '/images/covers/cyberpunk2077.jpg';
    let platformPill = '';
    if (g.type === 'PC') {
      platformPill = `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform || 'PC')}</span>`;
    } else if (g.type === 'EMULATOR') {
      platformPill = `<span class="badge badge-neutral">${escapeHtml(g.console || 'Emu')}</span>`;
    } else if (g.type === 'MOBILE') {
      platformPill = `<span class="badge badge-mobile">${escapeHtml(g.platform || 'Mobile')}</span>`;
    } else {
      platformPill = `<span class="badge badge-purple">${escapeHtml(g.port_version || 'Port')}</span>`;
    }

    const cfg = this.state.publicConfig || {};
    const showPrice = !!this.state.user || cfg.public_show_prices !== false;
    const priceText = showPrice && g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (g.status || 'Koleksi');

    return `
      <article class="media-card" onclick="app.openMediaDetail('games', ${g.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('games', ${g.id})">
        <div class="media-poster-container">
          <div class="poster-overlay-top">
            ${platformPill}
            <span class="badge badge-rating">${formatRating(g.rating)}</span>
          </div>
          <img class="media-poster-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(g.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.jpg';">
          <div class="poster-gradient"></div>
        </div>
        <div class="media-card-body">
          <div class="card-type-tag">${g.type} • ${g.year || '-'}</div>
          <h3 class="card-media-title" title="${escapeHtml(g.title)}">${escapeHtml(g.title)}</h3>
          <div class="card-media-sub">${escapeHtml(g.developer || g.publisher || g.console || 'Katalog Game')}</div>
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
    return `
      <article class="media-card" onclick="app.openMediaDetail('cinema', ${c.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('cinema', ${c.id})">
        <div class="media-poster-container">
          <div class="poster-overlay-top">
            <span class="badge ${getCinemaTypeBadgeClass(c.type)}">${c.type}</span>
            <span class="badge badge-rating">${formatRating(c.rating)}</span>
          </div>
          <img class="media-poster-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(c.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/breaking_bad.jpg';">
          <div class="poster-gradient"></div>
        </div>
        <div class="media-card-body">
          <div class="card-type-tag">${c.type} • ${c.year || '-'}</div>
          <h3 class="card-media-title" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</h3>
          <div class="card-media-sub">${escapeHtml(c.genre || c.studio || 'Katalog Cinema')}</div>
          <div class="media-card-footer">
            <span class="badge ${c.watched ? 'badge-success' : 'badge-neutral'}">${c.watched ? 'Ditonton' : 'Watchlist'}</span>
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
            <span class="badge ${m.is_favorite ? 'badge-danger' : 'badge-neutral'}">${m.is_favorite ? 'Favorit' : 'Trek'}</span>
          </div>
          <img class="media-poster-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(m.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/bohemian_rhapsody.jpg';">
          <div class="poster-gradient"></div>
        </div>
        <div class="media-card-body">
          <div class="card-type-tag">MUSIK • ${m.year || '-'}</div>
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
      const title = escapeHtml(item.title);
      let posterSrc = item.cover_url || '';
      let detailsHtml = '';

      const itemCode = typeof formatItemCode === 'function' ? formatItemCode(category, item.id) : `${category.charAt(0).toUpperCase()}-${String(item.id).padStart(3, '0')}`;
      const idRowHtml = `<tr><td>ID Unik Item</td><td><span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span><span style="font-size:0.75rem; color:var(--text-muted); margin-left:6px;">(Klik untuk salin ID)</span></td></tr>`;

      if (category === 'games') {
        if (!posterSrc) posterSrc = '/images/covers/cyberpunk2077.jpg';
        detailsHtml = `
          <table class="media-detail-table">
            ${idRowHtml}
            <tr><td>Kategori Koleksi</td><td><span class="badge badge-neutral">${item.type}</span></td></tr>
            <tr><td>Tanggal Rilis</td><td><span class="font-mono">${escapeHtml(item.release_date || (item.year ? String(item.year) : '-'))}</span></td></tr>
            <tr><td>Genre Permainan</td><td>${item.genre ? `<span class="badge badge-neutral">${escapeHtml(item.genre)}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td></tr>
            <tr><td>Pengembang (Developer)</td><td>${escapeHtml(item.developer || '-')}</td></tr>
            <tr><td>Penerbit (Publisher)</td><td>${escapeHtml(item.publisher || '-')}</td></tr>
            ${item.type === 'PC' ? `
              <tr><td>Platform</td><td><span class="badge ${getPlatformBadgeClass(item.platform)}">${escapeHtml(item.platform || '-')}</span></td></tr>
              ${(!!this.state.user || !this.state.publicConfig || this.state.publicConfig.public_show_prices !== false) ? `<tr><td>Estimasi Harga</td><td class="font-mono">${item.price ? formatRupiah(item.price) : 'Rp 0'}</td></tr>` : ''}
            ` : ''}
            ${item.type === 'EMULATOR' ? `
              <tr><td>Konsol Asal</td><td><span class="badge badge-neutral">${escapeHtml(item.console || '-')}</span></td></tr>
              <tr><td>Aplikasi Emulator</td><td>${escapeHtml(item.emulator || '-')}</td></tr>
              <tr><td>Format Berkas</td><td class="font-mono">${escapeHtml(item.rom_format || '-')}</td></tr>
            ` : ''}
            ${item.type === 'RECOMP' ? `
              <tr><td>Konsol Asal</td><td><span class="badge badge-neutral">${escapeHtml(item.console || 'Port')}</span></td></tr>
              <tr><td>Pengembang Port</td><td>${escapeHtml(item.port_developer || '-')}</td></tr>
              <tr><td>Versi Port</td><td class="font-mono">${escapeHtml(item.port_version || '-')}</td></tr>
              <tr><td>Peningkatan Fitur</td><td>${escapeHtml(item.enhancements || '-')}</td></tr>
            ` : ''}
            <tr><td>Kapasitas Penyimpanan</td><td class="font-mono">${escapeHtml(item.size_gb ? item.size_gb + ' GB' : '-')}</td></tr>
            <tr><td>Skor Penilaian</td><td class="font-mono">${formatRating(item.rating)}</td></tr>
            <tr><td>Status Koleksi</td><td><span class="badge ${getStatusBadgeClass(item.status)}">${escapeHtml(item.status || '-')}</span></td></tr>
            ${item.download_url ? `<tr><td>Link Download</td><td><a href="${escapeHtml(item.download_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color); font-weight:600;">Akses Halaman Download ↗</a></td></tr>` : ''}
          </table>
        `;
      } else if (category === 'cinema') {
        if (!posterSrc) posterSrc = '/images/covers/breaking_bad.jpg';
        detailsHtml = `
          <table class="media-detail-table">
            ${idRowHtml}
            <tr><td>Jenis Tayangan</td><td><span class="badge ${getCinemaTypeBadgeClass(item.type)}">${item.type}</span></td></tr>
            <tr><td>Tahun Rilis</td><td class="font-mono">${item.year || '-'}</td></tr>
            <tr><td>Genre Sinema</td><td>${escapeHtml(item.genre || '-')}</td></tr>
            <tr><td>Studio Produksi</td><td>${escapeHtml(item.studio || '-')}</td></tr>
            <tr><td>Negara Asal</td><td>${escapeHtml(item.country || '-')}</td></tr>
            <tr><td>Klasifikasi Usia</td><td><span class="badge badge-neutral">${escapeHtml(item.age_rating || '-')}</span></td></tr>
            ${item.total_episodes ? `<tr><td>Jumlah Episode</td><td class="font-mono">${item.total_episodes} eps</td></tr>` : ''}
            ${item.total_seasons ? `<tr><td>Jumlah Musim</td><td class="font-mono">${item.total_seasons} musim</td></tr>` : ''}
            <tr><td>Skor IMDb</td><td class="font-mono">${formatRating(item.rating)}</td></tr>
            <tr><td>Status Menonton</td><td><span class="badge ${item.watched ? 'badge-success' : 'badge-neutral'}">${item.watched ? 'Sudah Ditonton' : 'Belum Ditonton'}</span></td></tr>
            ${item.download_url ? `<tr><td>Link Download</td><td><a href="${escapeHtml(item.download_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color); font-weight:600;">Akses Halaman Download ↗</a></td></tr>` : ''}
          </table>
        `;
      } else if (category === 'music') {
        if (!posterSrc) posterSrc = '/images/covers/bohemian_rhapsody.jpg';
        detailsHtml = `
          <table class="media-detail-table">
            ${idRowHtml}
            <tr><td>Musisi / Artis</td><td><strong>${escapeHtml(item.artist || '-')}</strong></td></tr>
            <tr><td>Judul Album</td><td>${escapeHtml(item.album || '-')}</td></tr>
            <tr><td>Tahun Rilis</td><td class="font-mono">${item.year || '-'}</td></tr>
            <tr><td>Genre Musik</td><td>${escapeHtml(item.genre || '-')}</td></tr>
            <tr><td>Format / Platform</td><td><span class="badge badge-info">${escapeHtml(item.platform || '-')}</span></td></tr>
            <tr><td>Ukuran Berkas</td><td class="font-mono">${item.size_mb ? item.size_mb + ' MB' : '-'}</td></tr>
            <tr><td>Skor Penilaian</td><td class="font-mono">${formatRating(item.rating)}</td></tr>
            <tr><td>Tanda Favorit</td><td>${item.is_favorite ? '<span class="badge badge-danger">Favorit</span>' : '<span class="badge badge-neutral">Standar</span>'}</td></tr>
            ${item.download_url ? `<tr><td>Link Download</td><td><a href="${escapeHtml(item.download_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color); font-weight:600;">Akses Halaman Download ↗</a></td></tr>` : ''}
            ${item.notes ? `<tr><td>Catatan Pribadi</td><td>${escapeHtml(item.notes)}</td></tr>` : ''}
          </table>
        `;
      }

      const modalId = 'modal-media-detail';
      const isAdmin = !!this.state.user;
      const editHeaderBtn = isAdmin ? `
        <button class="btn btn-secondary btn-sm btn-icon" onclick="app.closeModal('${modalId}'); ${category === 'games' ? `app.openEditGameModal(${item.id})` : category === 'cinema' ? `app.openEditCinemaModal(${item.id})` : `app.openEditMusicModal(${item.id})`}" title="Edit Data" aria-label="Edit Data">
          ${getIcon('edit', 'ui-icon', 16)}
        </button>
      ` : '';
      const downloadAction = item.download_url ? `
        <div class="media-detail-actions" style="margin-top:8px;">
          <a href="${escapeHtml(item.download_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">${getIcon('download', 'ui-icon-btn', 14)} Unduh Media</a>
        </div>
      ` : '';

      this.createModal(modalId, title, `
        <div class="media-detail-view">
          <div class="media-detail-poster ${category === 'music' ? 'music-aspect' : ''}">
            <img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.jpg';">
          </div>
          <div class="media-detail-info">
            ${detailsHtml}
            ${downloadAction}
          </div>
        </div>
      `, editHeaderBtn);
    } catch (err) {
      showToast('Rincian media belum dapat dimuat saat ini. Silakan coba kembali.', 'error');
    }
  },

  filterGamesByType(type) {
    this.state.games.type = type;
    this.navigate('games');
  }
});
