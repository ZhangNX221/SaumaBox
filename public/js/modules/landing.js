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
    const totalCount = allGames.length + allCinema.length + allMusic.length;

    container.innerHTML = `
      <section class="editorial-hero">
        <div class="hero-glow-bg" aria-hidden="true"></div>
        <div class="hero-layout-grid">
          <div class="hero-copy-col">
            <div class="hero-status-pill">
              <span class="status-pulse-dot"></span>
              <span class="status-pill-text">Pustaka Multimedia Personal • Akses Lokal Siap Pakai</span>
            </div>
            <h1 class="hero-display-title">
              Kurasi Digital <span class="gradient-text-accent">Game, Sinema &amp; Audio</span> dalam Satu Presisi
            </h1>
            <p class="hero-lead-text">
              Ruang arsip pribadi untuk menyimpan dan mengorganisasi koleksi game PC, emulator retro, serial sinema pilihan, dan arsip audio lossless dalam tampilan bersih dan tenang.
            </p>

            <div class="hero-metric-strip">
              <div class="metric-chip" onclick="app.setRecentCategory('games'); app.scrollToShowcase();" role="button" tabindex="0">
                <span class="metric-num">${stats.totals.games}</span>
                <span class="metric-lbl">Permainan</span>
              </div>
              <div class="metric-chip" onclick="app.setRecentCategory('cinema'); app.scrollToShowcase();" role="button" tabindex="0">
                <span class="metric-num">${stats.totals.cinema}</span>
                <span class="metric-lbl">Sinema</span>
              </div>
              <div class="metric-chip" onclick="app.setRecentCategory('music'); app.scrollToShowcase();" role="button" tabindex="0">
                <span class="metric-num">${stats.totals.music}</span>
                <span class="metric-lbl">Musik</span>
              </div>
              <div class="metric-chip">
                <span class="metric-num font-mono">${formatRupiah(stats.totals.spending)}</span>
                <span class="metric-lbl">Investasi Koleksi</span>
              </div>
            </div>
          </div>

          <div class="hero-illustration-col">
            <div class="hero-app-showcase-card">
              <div class="app-illustration-frame">
                <img src="/images/logo.png" alt="Ilustrasi SaumaBox Media Hub" class="app-illustration-img" loading="eager">
              </div>
              <div class="app-showcase-badge">
                ${getIcon('sparkles', 'ui-icon', 13)}
                <span>Pustaka Terpadu</span>
              </div>
              <h2 class="app-showcase-title">SaumaBox Hub</h2>
              <p class="app-showcase-desc">Pusat arsip media pribadi: Permainan, Sinema, dan Musik Resolusi Tinggi.</p>
              <div class="app-showcase-pillars">
                <span class="pillar-tag">${getIcon('games', 'ui-icon', 14)} Games</span>
                <span class="pillar-tag">${getIcon('cinema', 'ui-icon', 14)} Sinema</span>
                <span class="pillar-tag">${getIcon('music', 'ui-icon', 14)} Musik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="recent-showcase-section" id="public-showcase-section">
        <div class="showcase-control-bar">
          <div class="showcase-heading-group">
            <h2 class="showcase-title">Pilihan Koleksi Terbaru</h2>
            <p class="showcase-subtitle">Eksplorasi entri media terbaru per kategori dengan slider interaktif (Maksimal 10 poster per baris)</p>
          </div>

          <div class="showcase-toolbar-group">
            <div class="showcase-tabs" role="tablist" aria-label="Filter Kategori Media">
              <button class="showcase-tab-btn ${this.state.recentCategory === 'all' ? 'active' : ''}" data-cat="all" onclick="app.setRecentCategory('all')" role="tab">Semua <span class="tab-count">${totalCount}</span></button>
              <button class="showcase-tab-btn ${this.state.recentCategory === 'games' ? 'active' : ''}" data-cat="games" onclick="app.setRecentCategory('games')" role="tab">Games <span class="tab-count">${allGames.length}</span></button>
              <button class="showcase-tab-btn ${this.state.recentCategory === 'cinema' ? 'active' : ''}" data-cat="cinema" onclick="app.setRecentCategory('cinema')" role="tab">Sinema <span class="tab-count">${allCinema.length}</span></button>
              <button class="showcase-tab-btn ${this.state.recentCategory === 'music' ? 'active' : ''}" data-cat="music" onclick="app.setRecentCategory('music')" role="tab">Musik <span class="tab-count">${allMusic.length}</span></button>
            </div>
          </div>
        </div>

        <div class="showcase-rows-wrapper" id="recent-media-grid">
          ${this.renderRecentShowcase()}
        </div>
      </section>

      <section class="editorial-bento-section">
        <div class="bento-header">
          <div class="hero-status-pill">
            <span class="status-pill-text">ARSITEKTUR & FITUR PUSTAKA</span>
          </div>
          <h2 class="bento-title">Didesain untuk Pengalaman Eksplorasi Tanpa Kompromi</h2>
          <p class="bento-desc">DitherOS Architecture: Struktur modular, basis data lokal cepat, dan visual sinematik.</p>
        </div>

        <div class="bento-grid">
          <article class="bento-card bento-card-featured">
            <div class="bento-icon-badge">${getIcon('games', 'ui-icon', 26)}</div>
            <h3 class="bento-card-title">Multi-Platform & Emulation Engine</h3>
            <p class="bento-card-text">Pengarsipan komprehensif untuk PC Steam/GOG/Epic, koleksi ROM konsol PlayStation 2 & Switch, hingga port native recompilation yang berjalan di 60+ FPS.</p>
            <div class="bento-tags">
              <span class="badge badge-neutral">PC Master Race</span>
              <span class="badge badge-neutral">PCSX2 & Yuzu</span>
              <span class="badge badge-purple">N64 Recomp</span>
              <span class="badge badge-mobile">Android & iOS</span>
            </div>
          </article>

          <article class="bento-card">
            <div class="bento-icon-badge">${getIcon('cinema', 'ui-icon', 26)}</div>
            <h3 class="bento-card-title">Watchlist & Cinema Tracking</h3>
            <p class="bento-card-text">Lacak status tontonan film layar lebar, progress episode serial TV, dan kurasi serial anime favorit lengkap dengan rating IMDb terverifikasi.</p>
            <div class="bento-tags">
              <span class="badge badge-info">Film Layar Lebar</span>
              <span class="badge badge-purple">Serial Multi-Season</span>
              <span class="badge badge-danger">Anime Seasons</span>
            </div>
          </article>

          <article class="bento-card">
            <div class="bento-icon-badge">${getIcon('music', 'ui-icon', 26)}</div>
            <h3 class="bento-card-title">Lossless Audio & Master Vault</h3>
            <p class="bento-card-text">Manajemen metadata trek FLAC resolusi tinggi, integrasi streaming, kurasi album legendaris, serta penanda trek bintang pilihan.</p>
            <div class="bento-tags">
              <span class="badge badge-success">FLAC Lossless</span>
              <span class="badge badge-neutral">Trek Favorit</span>
              <span class="badge badge-info">Spotify / Apple</span>
            </div>
          </article>
        </div>
      </section>
    `;
  },

  scrollToShowcase() {
    const el = document.getElementById('public-showcase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  setRecentCategory(category) {
    this.state.recentCategory = category;
    document.querySelectorAll('.showcase-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === category);
    });
    const grid = document.getElementById('recent-media-grid');
    if (grid) grid.innerHTML = this.renderRecentShowcase();
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
    const activeCat = this.state.recentCategory || 'all';
    const query = this.state.landingSearch || '';
    const sortBy = this.state.landingSort || 'newest';

    const categories = [
      { key: 'games', label: 'Games', icon: 'games', link: 'games' },
      { key: 'cinema', label: 'Sinema', icon: 'cinema', link: 'cinema' },
      { key: 'music', label: 'Musik', icon: 'music', link: 'music' }
    ];

    const selectedCats = activeCat === 'all' 
      ? categories 
      : categories.filter(c => c.key === activeCat);

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
        renderedRows.push(this.renderShowcaseCategoryRow(cat, items));
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

    const priceText = g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (g.status || 'Koleksi');

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

      if (category === 'games') {
        if (!posterSrc) posterSrc = '/images/covers/cyberpunk2077.jpg';
        detailsHtml = `
          <table class="media-detail-table">
            <tr><td>Kategori Koleksi</td><td><span class="badge badge-neutral">${item.type}</span></td></tr>
            <tr><td>Tanggal Rilis</td><td><span class="font-mono">${escapeHtml(item.release_date || (item.year ? String(item.year) : '-'))}</span></td></tr>
            <tr><td>Genre Permainan</td><td>${item.genre ? `<span class="badge badge-neutral">${escapeHtml(item.genre)}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td></tr>
            <tr><td>Pengembang (Developer)</td><td>${escapeHtml(item.developer || '-')}</td></tr>
            <tr><td>Penerbit (Publisher)</td><td>${escapeHtml(item.publisher || '-')}</td></tr>
            ${item.type === 'PC' ? `
              <tr><td>Platform</td><td><span class="badge ${getPlatformBadgeClass(item.platform)}">${escapeHtml(item.platform || '-')}</span></td></tr>
              <tr><td>Estimasi Harga</td><td class="font-mono">${item.price ? formatRupiah(item.price) : 'Rp 0'}</td></tr>
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
