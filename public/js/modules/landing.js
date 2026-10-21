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

    // Pick top spotlight item (highest rating or featured)
    const candidates = [
      ...allGames.map(g => ({ ...g, _cat: 'games', _type: g.type, _sub: g.developer || g.publisher || 'PC / Console' })),
      ...allCinema.map(c => ({ ...c, _cat: 'cinema', _type: c.type, _sub: c.studio || c.country || 'Cinema' })),
      ...allMusic.map(m => ({ ...m, _cat: 'music', _type: 'Audio', _sub: `${m.artist} • ${m.album}` }))
    ].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const spotlight = candidates[0] || {
      id: 3, _cat: 'games', title: 'Cyberpunk 2077', rating: 9.2, _type: 'PC',
      _sub: 'CD PROJEKT RED', cover_url: '/images/covers/cyberpunk2077.jpg',
      genre: 'Action RPG, Open World', year: 2020
    };

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

            <div class="hero-action-cluster">
              <button class="btn btn-primary btn-hero-cta" onclick="app.scrollToShowcase()">
                ${getIcon('sparkles', 'ui-icon-btn', 16)} Jelajahi Koleksi
              </button>
              <button class="btn btn-secondary" onclick="app.navigate('games')">
                ${getIcon('layers', 'ui-icon-btn', 16)} Buka Pustaka
              </button>
            </div>
          </div>

          <div class="hero-spotlight-col">
            <div class="spotlight-card" onclick="app.openMediaDetail('${spotlight._cat}', ${spotlight.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('${spotlight._cat}', ${spotlight.id})" title="Buka rincian ${escapeHtml(spotlight.title)}">
              <div class="spotlight-badge-floating">
                <span class="spotlight-star">${getIcon('star', 'icon-star', 12)}</span>
                <span>Sorotan Pilihan</span>
              </div>
              <div class="spotlight-poster-frame ${spotlight._cat === 'music' ? 'aspect-square' : ''}">
                <img src="${escapeHtml(spotlight.cover_url || '/images/covers/cyberpunk2077.jpg')}" alt="${escapeHtml(spotlight.title)}" class="spotlight-img" loading="eager">
                <div class="spotlight-gradient-scrim"></div>
              </div>
              <div class="spotlight-caption">
                <div class="spotlight-tags">
                  <span class="badge badge-primary">${escapeHtml(spotlight._type)}</span>
                  ${spotlight.genre ? `<span class="badge badge-neutral">${escapeHtml(spotlight.genre)}</span>` : ''}
                  <span class="badge badge-rating">${formatRating(spotlight.rating)}</span>
                </div>
                <h2 class="spotlight-title">${escapeHtml(spotlight.title)}</h2>
                <p class="spotlight-sub">${escapeHtml(spotlight._sub)} ${spotlight.year ? `• ${spotlight.year}` : ''}</p>
                <div class="spotlight-action-link">
                  <span>Lihat Rincian Lengkap</span>
                  ${getIcon('arrowRight', 'ui-icon-btn', 14)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="recent-showcase-section" id="public-showcase-section">
        <div class="showcase-control-bar">
          <div class="showcase-heading-group">
            <h2 class="showcase-title">Pilihan Koleksi Terbaru</h2>
            <p class="showcase-subtitle">Eksplorasi entri media yang baru ditambahkan lengkap dengan sampul otentik</p>
          </div>

          <div class="showcase-toolbar-group">
            <div class="showcase-tabs" role="tablist" aria-label="Filter Kategori Media">
              <button class="showcase-tab-btn ${this.state.recentCategory === 'all' ? 'active' : ''}" onclick="app.setRecentCategory('all')" role="tab">Semua <span class="tab-count">${totalCount}</span></button>
              <button class="showcase-tab-btn ${this.state.recentCategory === 'games' ? 'active' : ''}" onclick="app.setRecentCategory('games')" role="tab">Games <span class="tab-count">${allGames.length}</span></button>
              <button class="showcase-tab-btn ${this.state.recentCategory === 'cinema' ? 'active' : ''}" onclick="app.setRecentCategory('cinema')" role="tab">Sinema <span class="tab-count">${allCinema.length}</span></button>
              <button class="showcase-tab-btn ${this.state.recentCategory === 'music' ? 'active' : ''}" onclick="app.setRecentCategory('music')" role="tab">Musik <span class="tab-count">${allMusic.length}</span></button>
            </div>

            <div class="showcase-filter-row">
              <div class="search-input-wrap showcase-search-wrap">
                <span class="search-icon">${getIcon('search', 'ui-icon', 16)}</span>
                <input type="search" class="search-input showcase-search-input" placeholder="Cari judul, artis, pengembang, genre..." value="${escapeHtml(this.state.landingSearch)}" oninput="app.handleLandingSearch(this.value)" aria-label="Pencarian Cepat">
              </div>

              <select class="form-select showcase-sort-select" onchange="app.handleLandingSort(this.value)" aria-label="Urutkan Koleksi">
                <option value="newest" ${this.state.landingSort === 'newest' ? 'selected' : ''}>Terbaru Ditambahkan</option>
                <option value="rating" ${this.state.landingSort === 'rating' ? 'selected' : ''}>Penilaian Tertinggi</option>
                <option value="title" ${this.state.landingSort === 'title' ? 'selected' : ''}>Berdasarkan Abjad (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="media-grid" id="recent-media-grid">
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
      const text = btn.textContent.toLowerCase();
      btn.classList.toggle('active', text.startsWith(category) || (category === 'all' && text.startsWith('semua')));
    });
    const grid = document.getElementById('recent-media-grid');
    if (grid) grid.innerHTML = this.renderRecentShowcase();
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
    const category = this.state.recentCategory || 'all';
    const query = this.state.landingSearch || '';
    const sortBy = this.state.landingSort || 'newest';

    let list = [];
    if (category === 'all' || category === 'games') {
      (recent.games || []).forEach(g => list.push({ ...g, _mediaType: 'games' }));
    }
    if (category === 'all' || category === 'cinema') {
      (recent.cinema || []).forEach(c => list.push({ ...c, _mediaType: 'cinema' }));
    }
    if (category === 'all' || category === 'music') {
      (recent.music || []).forEach(m => list.push({ ...m, _mediaType: 'music' }));
    }

    // Filter by query
    if (query) {
      list = list.filter(item => {
        const title = (item.title || '').toLowerCase();
        const artist = (item.artist || '').toLowerCase();
        const album = (item.album || '').toLowerCase();
        const genre = (item.genre || '').toLowerCase();
        const dev = (item.developer || item.studio || item.publisher || '').toLowerCase();
        return title.includes(query) || artist.includes(query) || album.includes(query) || genre.includes(query) || dev.includes(query);
      });
    }

    // Sort list
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    if (list.length === 0) {
      return `
        <div class="showcase-empty-state">
          <div class="empty-icon">${getIcon('search', 'ui-icon', 36)}</div>
          <h3 class="empty-title">Koleksi Belum Ditemukan</h3>
          <p class="empty-desc">Tidak ada entri yang cocok dengan kata kunci atau filter saat ini. Coba periksa kembali ejaan atau pilih kategori lain di atas.</p>
        </div>
      `;
    }

    return list.map(item => {
      if (item._mediaType === 'games') return this.renderRecentGameCard(item);
      if (item._mediaType === 'cinema') return this.renderRecentCinemaCard(item);
      return this.renderRecentMusicCard(item);
    }).join('');
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
      const editButton = isAdmin ? `
        <button class="btn btn-secondary" onclick="app.closeModal('${modalId}'); ${category === 'games' ? `app.openEditGameModal(${item.id})` : category === 'cinema' ? `app.openEditCinemaModal(${item.id})` : `app.openEditMusicModal(${item.id})`}">${getIcon('edit', 'ui-icon-btn', 14)} Edit Data</button>
      ` : '';
      const downloadAction = item.download_url ? `
        <a href="${escapeHtml(item.download_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">${getIcon('download', 'ui-icon-btn', 14)} Unduh Media</a>
      ` : '';

      this.createModal(modalId, title, `
        <div class="media-detail-view">
          <div class="media-detail-poster ${category === 'music' ? 'music-aspect' : ''}">
            <img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.jpg';">
          </div>
          <div class="media-detail-info">
            ${detailsHtml}
            <div class="media-detail-actions">
              ${downloadAction}
              ${editButton}
              <button class="btn btn-secondary" onclick="app.closeModal('${modalId}')">Tutup</button>
            </div>
          </div>
        </div>
      `);
    } catch (err) {
      showToast('Rincian media belum dapat dimuat saat ini. Silakan coba kembali.', 'error');
    }
  },

  filterGamesByType(type) {
    this.state.games.type = type;
    this.navigate('games');
  }
});
