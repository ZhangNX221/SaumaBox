// ============================================================
// SaumaBox — Admin Dashboard & Visual Analytics Module
// ============================================================

Object.assign(app, {
  async renderDashboard(container) {
    const [stats, webRes] = await Promise.all([
      api.get('/api/settings/stats'),
      api.get('/api/web')
    ]);
    this.state.stats = stats;
    const webBookmarks = webRes?.items || [];

    const totalMedia = (stats.totals.games || 0) + (stats.totals.cinema || 0) + (stats.totals.music || 0);

    // Donut chart slices & legend
    const mediaSlices = [
      { label: 'Koleksi Games', value: stats.totals.games || 0, color: '#6366f1', icon: getIcon('games', 'ui-icon', 14), route: 'games' },
      { label: 'Koleksi Cinema', value: stats.totals.cinema || 0, color: '#ec4899', icon: getIcon('cinema', 'ui-icon', 14), route: 'cinema' },
      { label: 'Koleksi Musik', value: stats.totals.music || 0, color: '#10b981', icon: getIcon('music', 'ui-icon', 14), route: 'music' }
    ];
    const donutSvgHtml = renderDonutSvg(mediaSlices, 120, 16);
    const donutLegendHtml = mediaSlices.map(s => {
      const pct = totalMedia > 0 ? Math.round((s.value / totalMedia) * 100) : 0;
      return `
        <div class="donut-legend-item" onclick="app.navigate('${s.route}')" title="Buka ${s.label}">
          <div class="legend-swatch" style="background:${s.color};"></div>
          <div class="legend-info">
            <div class="legend-name">${s.icon} <span>${s.label}</span></div>
            <div class="legend-meta">
              <span class="legend-count font-mono">${s.value} item</span>
              <span class="legend-pct font-mono">${pct}%</span>
            </div>
          </div>
        </div>`;
    }).join('');

    // Game categories breakdown
    const totalGames = stats.totals.games || 1;
    const gameCategories = [
      { label: 'PC Games', count: stats.games.pc || 0, color: '#3b82f6', icon: getIcon('games', 'ui-icon', 14), badge: 'badge-steam', tab: 'PC' },
      { label: 'Game Mobile', count: stats.games.mobile || 0, color: '#06b6d4', icon: getIcon('mobile', 'ui-icon', 14), badge: 'badge-mobile', tab: 'MOBILE' },
      { label: 'Emulator', count: stats.games.emulator || 0, color: '#ec4899', icon: getIcon('games', 'ui-icon', 14), badge: 'badge-purple', tab: 'EMULATOR' },
      { label: 'Native Port', count: stats.games.recomp || 0, color: '#10b981', icon: getIcon('games', 'ui-icon', 14), badge: 'badge-success', tab: 'RECOMP' }
    ];
    const categoryStripHtml = gameCategories.map(cat => {
      const pct = Math.round((cat.count / totalGames) * 100);
      if (pct <= 0) return '';
      return `<div class="segmented-bar-segment" style="width:${pct}%; background:${cat.color};" title="${cat.label}: ${cat.count} (${pct}%)"></div>`;
    }).join('');

    const categoryBarsHtml = gameCategories.map(cat => {
      const pct = Math.round((cat.count / totalGames) * 100);
      return `
        <div class="chart-category-row" onclick="app.filterGamesByType('${cat.tab}')" title="Filter ${cat.label}">
          <div class="category-row-header">
            <div class="category-row-title">
              <span>${cat.icon}</span><strong>${cat.label}</strong>
              <span class="badge ${cat.badge}" style="font-size:0.7rem; padding:1px 6px;">${cat.count}</span>
            </div>
            <div class="category-row-val font-mono"><span>${pct}%</span></div>
          </div>
          <div class="chart-progress-track">
            <div class="chart-progress-fill" style="width:${pct}%; background:${cat.color};"></div>
          </div>
        </div>`;
    }).join('');

    // Cinema breakdown
    const totalCinema = stats.totals.cinema || 1;
    const cinemaCategories = [
      { label: 'Film (Movie)', count: stats.cinema.movies || 0, color: '#38bdf8', icon: getIcon('cinema', 'ui-icon', 14), badge: 'badge-info' },
      { label: 'Serial TV', count: stats.cinema.series || 0, color: '#a855f7', icon: getIcon('cinema', 'ui-icon', 14), badge: 'badge-purple' },
      { label: 'Anime', count: stats.cinema.anime || 0, color: '#ec4899', icon: getIcon('cinema', 'ui-icon', 14), badge: 'badge-repack' }
    ];
    const cinemaStripHtml = cinemaCategories.map(cat => {
      const pct = Math.round((cat.count / totalCinema) * 100);
      if (pct <= 0) return '';
      return `<div class="segmented-bar-segment" style="width:${pct}%; background:${cat.color};" title="${cat.label}: ${cat.count} (${pct}%)"></div>`;
    }).join('');

    const cinemaBarsHtml = cinemaCategories.map(cat => {
      const pct = Math.round((cat.count / totalCinema) * 100);
      return `
        <div class="chart-category-row" onclick="app.navigate('cinema')" title="Buka ${cat.label}">
          <div class="category-row-header">
            <div class="category-row-title">
              <span>${cat.icon}</span><strong>${cat.label}</strong>
              <span class="badge ${cat.badge}" style="font-size:0.7rem; padding:1px 6px;">${cat.count}</span>
            </div>
            <div class="category-row-val font-mono"><span>${pct}%</span></div>
          </div>
          <div class="chart-progress-track">
            <div class="chart-progress-fill" style="width:${pct}%; background:${cat.color};"></div>
          </div>
        </div>`;
    }).join('');

    // Music breakdown
    const totalMusic = stats.totals.music || 1;
    const defaultMusicColors = ['#10b981', '#22c55e', '#06b6d4', '#f59e0b', '#8b5cf6'];
    const musicPlatList = (stats.music.platforms && stats.music.platforms.length)
      ? stats.music.platforms
      : [{ platform: 'FLAC/Lossless', count: 5 }, { platform: 'Spotify', count: 3 }, { platform: 'Apple Music', count: 2 }];
    const musicCategories = musicPlatList.map((p, idx) => ({
      label: p.platform,
      count: p.count,
      color: defaultMusicColors[idx % defaultMusicColors.length],
      icon: getIcon('music', 'ui-icon', 14),
      badge: 'badge-success'
    }));

    const musicStripHtml = musicCategories.map(cat => {
      const pct = Math.round((cat.count / totalMusic) * 100);
      if (pct <= 0) return '';
      return `<div class="segmented-bar-segment" style="width:${pct}%; background:${cat.color};" title="${cat.label}: ${cat.count} (${pct}%)"></div>`;
    }).join('');

    const musicBarsHtml = musicCategories.map(cat => {
      const pct = Math.round((cat.count / totalMusic) * 100);
      return `
        <div class="chart-category-row" onclick="app.navigate('music')" title="Buka ${cat.label}">
          <div class="category-row-header">
            <div class="category-row-title">
              <span>${cat.icon}</span><strong>${cat.label}</strong>
              <span class="badge ${cat.badge}" style="font-size:0.7rem; padding:1px 6px;">${cat.count}</span>
            </div>
            <div class="category-row-val font-mono"><span>${pct}%</span></div>
          </div>
          <div class="chart-progress-track">
            <div class="chart-progress-fill" style="width:${pct}%; background:${cat.color};"></div>
          </div>
        </div>`;
    }).join('');

    // Popular items ranking (Top 10 Showcase with Slide Feature)
    const pop = stats.popular || { games: [], cinema: [], music: [] };
    const renderPopularSlider = (items, type, sliderId) => {
      if (!items || items.length === 0) {
        return '<div style="color:var(--text-muted); font-size:0.8rem; padding:8px 0;">Belum ada data ulasan.</div>';
      }
      return `
        <div class="popular-slider-container">
          <div class="popular-posters-row popular-slider-track" id="${sliderId}" onscroll="app.updateSliderIndicator('${sliderId}')">
            ${items.slice(0, 10).map((item, idx) => {
              const fallback = type === 'games'
                ? '/images/covers/cyberpunk2077.svg'
                : (type === 'cinema' ? '/images/covers/breaking_bad.jpg' : '/images/covers/bohemian_rhapsody.jpg');
              const sub = type === 'games'
                ? (item.platform || 'Game')
                : (type === 'cinema' ? (item.genre ? item.genre.split(',')[0].trim() : 'Cinema') : (item.artist || 'Musik'));
              const rankClass = idx === 0 ? 'rank-gold' : (idx === 1 ? 'rank-silver' : (idx === 2 ? 'rank-bronze' : ''));
              return `
                <div class="popular-poster-card ${type === 'music' ? 'is-music' : ''}" onclick="app.openMediaDetail('${type}', ${item.id})" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('${type}', ${item.id})" aria-label="${escapeHtml(item.title)}">
                  <div class="popular-poster-media">
                    <img src="${escapeHtml(item.cover_url || fallback)}" alt="${escapeHtml(item.title)}" class="popular-poster-img" loading="lazy" onerror="this.onerror=null; this.src='${fallback}';">
                    <div class="popular-poster-gradient"></div>
                    <span class="popular-poster-rank ${rankClass}">#${idx + 1}</span>
                    <span class="popular-poster-rating">${formatRating(item.rating)}</span>
                  </div>
                  <div class="popular-poster-info">
                    <div class="popular-poster-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
                    <div class="popular-poster-sub">${escapeHtml(sub)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    // Activity log rows with clean semantic badges and accurate timestamps (/antislop-ui)
    const activityRows = (stats.recent_activity || []).map(log => {
      let badgeClass = 'badge-neutral';
      if (log.action.includes('UPDATE') || log.action.includes('EDIT') || log.action.includes('AVATAR')) {
        badgeClass = 'badge-info';
      } else if (log.action.includes('DELETE') || log.action.includes('REMOVE')) {
        badgeClass = 'badge-danger';
      } else if (log.action.includes('SYSTEM')) {
        badgeClass = 'badge-purple';
      }
      return `
        <tr>
          <td class="font-mono" style="font-size:0.75rem; white-space:nowrap;">${formatDateTime(log.created_at)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(log.action)}</span></td>
          <td><strong>${escapeHtml(log.module)}</strong></td>
          <td>${escapeHtml(log.item_title || '-')}</td>
          <td style="color:var(--text-secondary); font-size:0.8rem;">${escapeHtml(log.details || '')}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="dashboard-header-wrap">
        <div class="dashboard-title-group">
          <h1 class="dashboard-main-title">Dashboard Ringkasan</h1>
          <p class="dashboard-sub-title">Selamat datang kembali, ${escapeHtml(this.state.user.displayName || this.state.user.username)}. Seluruh koleksi pribadi Anda terkelola secara lokal.</p>
        </div>
      </div>

      <!-- 1. STATISTIK UTAMA (6 Personal KPI Cards) -->
      <section class="stats-ribbon" aria-label="Ringkasan Statistik Koleksi Pribadi">
        <div class="stat-card" onclick="app.navigate('games')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.navigate('games')" title="Buka Katalog Permainan">
          <div class="stat-icon">${getIcon('games', 'ui-icon', 22)}</div>
          <div class="stat-info">
            <span class="stat-label">Total Permainan</span>
            <span class="stat-value font-mono">${stats.totals.games}</span>
            <span class="stat-sub">${stats.games.pc} PC • ${stats.games.mobile} Mobile • ${stats.games.emulator} Emu</span>
          </div>
        </div>
        <div class="stat-card" onclick="app.navigate('cinema')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.navigate('cinema')" title="Buka Katalog Sinema">
          <div class="stat-icon">${getIcon('cinema', 'ui-icon', 22)}</div>
          <div class="stat-info">
            <span class="stat-label">Film &amp; Serial</span>
            <span class="stat-value font-mono">${stats.totals.cinema}</span>
            <span class="stat-sub">${stats.cinema.movies} Film • ${stats.cinema.series} Series • ${stats.cinema.anime} Anime</span>
          </div>
        </div>
        <div class="stat-card" onclick="app.navigate('music')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.navigate('music')" title="Buka Katalog Musik">
          <div class="stat-icon">${getIcon('music', 'ui-icon', 22)}</div>
          <div class="stat-info">
            <span class="stat-label">Lagu &amp; Trek</span>
            <span class="stat-value font-mono">${stats.totals.music}</span>
            <span class="stat-sub">${stats.music?.albums || 0} Album • ${stats.music?.artists || 0} Musisi</span>
          </div>
        </div>
        <div class="stat-card" onclick="app.navigate('web')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.navigate('web')" title="Buka Katalog Web &amp; Bookmark">
          <div class="stat-icon" style="color:var(--accent-color);">${getIcon('globe', 'ui-icon', 22)}</div>
          <div class="stat-info">
            <span class="stat-label">Bookmark Web</span>
            <span class="stat-value font-mono">${stats.totals.web || 0}</span>
            <span class="stat-sub">${stats.web?.pinned || 0} Disematkan • Akses Cepat</span>
          </div>
        </div>
        <div class="stat-card stat-card-wide" onclick="app.navigate('games')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.navigate('games')" title="Buka Estimasi Investasi">
          <div class="stat-icon">${getIcon('tag', 'ui-icon', 22)}</div>
          <div class="stat-info">
            <span class="stat-label">Investasi Koleksi</span>
            <span class="stat-value stat-value-currency font-mono">${formatRupiah(stats.totals.spending)}</span>
            <span class="stat-sub">Estimasi belanja game PC</span>
          </div>
        </div>
      </section>

      <!-- 2. PELUNCUR CEPAT WEB & HOMELAB (Launchpad Grid) -->
      ${webBookmarks.length > 0 ? `
        <section class="web-launcher-section" style="margin-bottom:var(--space-xl);">
          <div class="web-launcher-header">
            <div class="web-launcher-title">
              ${getIcon('globe', 'ui-icon', 18)}
              <span>Peluncur Cepat Web &amp; Homelab</span>
            </div>
            <a class="web-launcher-all-link" onclick="app.navigate('web')">
              <span>Buka Semua (${webBookmarks.length})</span>
              ${getIcon('chevronRight', 'ui-icon', 14)}
            </a>
          </div>
          <div class="web-app-grid">
            ${webBookmarks.slice(0, 12).map(b => this.renderWebTile(b, true)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 3. ANALISIS DIAGRAM & KONTEN POPULER -->
      <section class="dashboard-analytics-section">
        <div class="dashboard-section-header">
          <div>
            <div class="dashboard-section-title">${getIcon('dashboard', 'ui-icon-header', 18)} Analisis Grafik &amp; Konten Terpopuler</div>
            <div style="font-size:0.82rem; color:var(--text-secondary);">Proporsi media dan peringkat item dengan rating tertinggi</div>
          </div>
        </div>

        <div class="dashboard-charts-grid">
          <!-- Card 1: Komposisi & Distribusi Media (Ringkas, Terintegrasi & Sejajar) -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">${getIcon('album', 'ui-icon', 16)} Komposisi &amp; Distribusi Media</div>
                <div class="chart-card-sub">Total ${totalMedia} item (${stats.totals.games} game terkelola)</div>
              </div>
            </div>
            
            <div class="donut-chart-layout compact">
              ${donutSvgHtml}
              <div class="donut-legend compact">${donutLegendHtml}</div>
            </div>

            <div class="platform-distributions-wrap">
              <div class="platform-distribution-compact">
                <div class="platform-distribution-header">
                  <span class="platform-sub-title">${getIcon('games', 'ui-icon', 14)} <strong>Distribusi Platform Game</strong></span>
                  <span class="badge badge-steam font-mono" style="font-size:0.7rem; padding:1px 6px;">${stats.totals.games} Game</span>
                </div>
                <div class="segmented-bar-track" style="margin: 6px 0 8px;">${categoryStripHtml}</div>
                <div class="chart-category-list compact">${categoryBarsHtml}</div>
              </div>

              <div class="platform-distribution-compact">
                <div class="platform-distribution-header">
                  <span class="platform-sub-title">${getIcon('cinema', 'ui-icon', 14)} <strong>Distribusi Kategori Cinema</strong></span>
                  <span class="badge badge-purple font-mono" style="font-size:0.7rem; padding:1px 6px;">${stats.totals.cinema} Item</span>
                </div>
                <div class="segmented-bar-track" style="margin: 6px 0 8px;">${cinemaStripHtml}</div>
                <div class="chart-category-list compact">${cinemaBarsHtml}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
                  <span>Tontonan Selesai: <strong>${stats.totals.watched || 0} dari ${stats.totals.cinema}</strong></span>
                  <span class="font-mono" style="color:#10b981; font-weight:700;">${stats.cinema.watched_percentage || 0}%</span>
                </div>
              </div>

              <div class="platform-distribution-compact">
                <div class="platform-distribution-header">
                  <span class="platform-sub-title">${getIcon('music', 'ui-icon', 14)} <strong>Distribusi Platform &amp; Format Musik</strong></span>
                  <span class="badge badge-success font-mono" style="font-size:0.7rem; padding:1px 6px;">${stats.totals.music} Trek</span>
                </div>
                <div class="segmented-bar-track" style="margin: 6px 0 8px;">${musicStripHtml}</div>
                <div class="chart-category-list compact">${musicBarsHtml}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
                  <span>Koleksi Favorit: <strong>${stats.totals.favorite_music || 0} lagu</strong></span>
                  <span>${stats.music.albums || 0} Album • ${stats.music.artists || 0} Artis</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Konten Populer / Rating Tertinggi (Sejajar & Kompak) -->
          <div class="chart-card chart-card-2x">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">${getIcon('star', 'ui-icon', 16)} Konten Terpopuler (Rating Tertinggi)</div>
                <div class="chart-card-sub">Menampilkan 5 teratas • Geser panah untuk melihat peringkat #6–10</div>
              </div>
            </div>
            <div class="popular-catalog-section">
              <div class="popular-group-header">
                <div class="popular-group-label">${getIcon('games', 'ui-icon', 14)} <span>Game Paling Disukai (10 Besar)</span></div>
                <div class="slider-nav-btns">
                  <span class="slider-page-indicator" id="popular-slider-games-indicator">#1–5</span>
                  <button type="button" class="slider-btn" onclick="app.slidePopularRow('popular-slider-games', -1)" title="Geser ke kiri (#1-5)" aria-label="Geser ke kiri">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button type="button" class="slider-btn" onclick="app.slidePopularRow('popular-slider-games', 1)" title="Geser ke kanan (#6-10)" aria-label="Geser ke kanan">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
              ${renderPopularSlider(pop.games, 'games', 'popular-slider-games')}

              <div class="popular-group-header">
                <div class="popular-group-label">${getIcon('cinema', 'ui-icon', 14)} <span>Film &amp; Serial Unggulan (10 Besar)</span></div>
                <div class="slider-nav-btns">
                  <span class="slider-page-indicator" id="popular-slider-cinema-indicator">#1–5</span>
                  <button type="button" class="slider-btn" onclick="app.slidePopularRow('popular-slider-cinema', -1)" title="Geser ke kiri (#1-5)" aria-label="Geser ke kiri">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button type="button" class="slider-btn" onclick="app.slidePopularRow('popular-slider-cinema', 1)" title="Geser ke kanan (#6-10)" aria-label="Geser ke kanan">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
              ${renderPopularSlider(pop.cinema, 'cinema', 'popular-slider-cinema')}

              <div class="popular-group-header">
                <div class="popular-group-label">${getIcon('music', 'ui-icon', 14)} <span>Trek Musik Pilihan (10 Besar)</span></div>
                <div class="slider-nav-btns">
                  <span class="slider-page-indicator" id="popular-slider-music-indicator">#1–5</span>
                  <button type="button" class="slider-btn" onclick="app.slidePopularRow('popular-slider-music', -1)" title="Geser ke kiri (#1-5)" aria-label="Geser ke kiri">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button type="button" class="slider-btn" onclick="app.slidePopularRow('popular-slider-music', 1)" title="Geser ke kanan (#6-10)" aria-label="Geser ke kanan">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
              ${renderPopularSlider(pop.music, 'music', 'popular-slider-music')}
            </div>
          </div>
        </div>
      </section>

      <!-- 3. AKTIVITAS TERBARU & MODERASI -->
      <div class="data-panel" style="margin-top:20px;">
        <div class="toolbar">
          <div style="font-weight:700;">${getIcon('flag', 'ui-icon-btn', 14)} Log Aktivitas Terbaru &amp; Perubahan Sistem</div>
          <span class="badge badge-neutral">${stats.recent_activity.length} catatan</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Waktu</th><th>Aksi</th><th>Modul</th><th>Item / Target</th><th>Detail Catatan</th></tr>
            </thead>
            <tbody>
              ${activityRows || '<tr><td colspan="5" style="text-align:center; padding:20px;">Belum ada riwayat aktivitas.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderAddCatalogDropdown() {
    return `
      <div class="add-catalog-wrapper" id="add-catalog-wrapper">
        <button class="btn btn-primary btn-sm btn-add-catalog" id="btn-add-catalog" onclick="app.toggleAddCatalogMenu(event)" title="Tambah Katalog Baru" aria-haspopup="true" aria-expanded="false">
          ${getIcon('plus', 'ui-icon-btn', 14)}<span class="btn-text">Tambah Katalog</span>
          <span class="btn-caret">${getIcon('chevronDown', 'ui-icon-btn', 12)}</span>
        </button>
        <div class="add-catalog-dropdown hidden" id="add-catalog-dropdown" role="menu">
          <div class="add-catalog-menu-header">Pilih Jenis Katalog</div>
          <div class="add-catalog-menu-items">
            <button type="button" class="add-catalog-menu-item" onclick="app.selectAddCatalog('game')" role="menuitem">
              <span class="menu-item-icon icon-game">${getIcon('games', 'ui-icon', 18)}</span>
              <div class="menu-item-text">
                <span class="menu-item-title">Koleksi Game</span>
                <span class="menu-item-desc">PC, emulator retro &amp; native port</span>
              </div>
            </button>
            <button type="button" class="add-catalog-menu-item" onclick="app.selectAddCatalog('cinema')" role="menuitem">
              <span class="menu-item-icon icon-cinema">${getIcon('cinema', 'ui-icon', 18)}</span>
              <div class="menu-item-text">
                <span class="menu-item-title">Koleksi Cinema</span>
                <span class="menu-item-desc">Film layar lebar, serial &amp; anime</span>
              </div>
            </button>
            <button type="button" class="add-catalog-menu-item" onclick="app.selectAddCatalog('music')" role="menuitem">
              <span class="menu-item-icon icon-music">${getIcon('music', 'ui-icon', 18)}</span>
              <div class="menu-item-text">
                <span class="menu-item-title">Koleksi Musik</span>
                <span class="menu-item-desc">Audio lossless FLAC &amp; album</span>
              </div>
            </button>
            <button type="button" class="add-catalog-menu-item" onclick="app.selectAddCatalog('web')" role="menuitem">
              <span class="menu-item-icon icon-web" style="background:rgba(212,175,55,0.15); color:var(--accent-color);">${getIcon('globe', 'ui-icon', 18)}</span>
              <div class="menu-item-text">
                <span class="menu-item-title">Bookmark Web</span>
                <span class="menu-item-desc">Tautan aplikasi, homelab &amp; situs favorit</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openAddCatalogModal(e) {
    this.toggleAddCatalogMenu(e);
  },

  toggleAddCatalogMenu(forceOrEvent) {
    if (forceOrEvent && forceOrEvent.stopPropagation) forceOrEvent.stopPropagation();
    const dd = document.getElementById('add-catalog-dropdown');
    if (!dd) return;
    const isHidden = dd.classList.contains('hidden');
    const show = typeof forceOrEvent === 'boolean' ? forceOrEvent : isHidden;
    dd.classList.toggle('hidden', !show);
    const btn = document.getElementById('btn-add-catalog');
    if (btn) btn.setAttribute('aria-expanded', String(show));
  },

  selectAddCatalog(type) {
    this.toggleAddCatalogMenu(false);
    if (type === 'game') this.openAddGameModal();
    else if (type === 'cinema') this.openAddCinemaModal();
    else if (type === 'music') this.openAddMusicModal();
    else if (type === 'web') this.openAddWebModal();
  },

  slidePopularRow(sliderId, direction) {
    const el = document.getElementById(sliderId);
    if (!el) return;
    const scrollAmount = el.clientWidth || 400;
    el.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    setTimeout(() => this.updateSliderIndicator(sliderId), 350);
  },

  updateSliderIndicator(sliderId) {
    const el = document.getElementById(sliderId);
    const ind = document.getElementById(sliderId + '-indicator');
    if (!el || !ind) return;
    const isScrolled = el.scrollLeft > 60;
    ind.textContent = isScrolled ? '#6–10' : '#1–5';
  }
});
