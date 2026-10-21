// ============================================================
// SaumaBox — Admin Dashboard & Visual Analytics Module
// ============================================================

Object.assign(app, {
  async renderDashboard(container) {
    const stats = await api.get('/api/settings/stats');
    this.state.stats = stats;

    const totalMedia = (stats.totals.games || 0) + (stats.totals.cinema || 0) + (stats.totals.music || 0);

    // Donut chart slices & legend
    const mediaSlices = [
      { label: 'Koleksi Games', value: stats.totals.games || 0, color: '#6366f1', icon: getIcon('games', 'ui-icon', 14), route: 'games' },
      { label: 'Koleksi Cinema', value: stats.totals.cinema || 0, color: '#ec4899', icon: getIcon('cinema', 'ui-icon', 14), route: 'cinema' },
      { label: 'Koleksi Musik', value: stats.totals.music || 0, color: '#10b981', icon: getIcon('music', 'ui-icon', 14), route: 'music' }
    ];
    const donutSvgHtml = renderDonutSvg(mediaSlices, 150, 20);
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

    // Cinema Radial Progress
    const cinemaRadialHtml = renderRadialGaugeSvg(stats.cinema.watched_percentage, 86, 8, '#10b981');
    const totalCinema = stats.totals.cinema || 1;
    const moviePct = Math.round(((stats.cinema.movies || 0) / totalCinema) * 100);
    const seriesPct = Math.round(((stats.cinema.series || 0) / totalCinema) * 100);
    const animePct = Math.round(((stats.cinema.anime || 0) / totalCinema) * 100);

    // Popular items ranking
    const pop = stats.popular || { games: [], cinema: [], music: [] };
    const renderPopularList = (items, type) => (items || []).map((item, idx) => `
      <div class="popular-item-row" onclick="app.openMediaDetail('${type}', ${item.id})" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('${type}', ${item.id})" title="Buka rincian ${escapeHtml(item.title)}">
        <span class="platform-rank-badge ${idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : ''}">#${idx + 1}</span>
        ${item.cover_url ? `<img src="${escapeHtml(item.cover_url)}" style="width:30px; height:40px; border-radius:4px; object-fit:cover; flex-shrink:0;" alt="" onerror="this.style.display='none';">` : ''}
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.85rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-primary);">${escapeHtml(item.title)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.platform || item.artist || item.genre || '')}</div>
        </div>
        <span class="badge badge-rating font-mono">${formatRating(item.rating)}</span>
      </div>
    `).join('') || '<div style="color:var(--text-muted); font-size:0.8rem; padding:12px; text-align:center;">Belum ada data ulasan.</div>';

    // Activity log rows
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
      <div class="dashboard-header-wrap">
        <div class="dashboard-title-group">
          <h1 class="dashboard-main-title">Dashboard Ringkasan</h1>
          <p class="dashboard-sub-title">Selamat datang kembali, ${escapeHtml(this.state.user.displayName || this.state.user.username)}. Seluruh koleksi pribadi Anda terkelola secara lokal.</p>
        </div>
        <div class="dashboard-action-group">
          <button class="btn btn-primary" onclick="app.openAddGameModal()">${getIcon('plus', 'ui-icon-btn', 14)} Tambah Game</button>
          <button class="btn btn-secondary" onclick="app.openAddCinemaModal()">${getIcon('plus', 'ui-icon-btn', 14)} Tambah Film</button>
          <button class="btn btn-secondary" onclick="app.openAddMusicModal()">${getIcon('plus', 'ui-icon-btn', 14)} Tambah Musik</button>
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
        <div class="stat-card" onclick="app.navigate('taxonomy', 'genres')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')app.navigate('taxonomy', 'genres')" title="Buka Taksonomi Koleksi">
          <div class="stat-icon">${getIcon('layers', 'ui-icon', 22)}</div>
          <div class="stat-info">
            <span class="stat-label">Total Pustaka</span>
            <span class="stat-value font-mono">${totalMedia}</span>
            <span class="stat-sub">Arsip multimedia tersimpan lokal</span>
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

      <!-- 2. ANALISIS DIAGRAM & KONTEN POPULER -->
      <section class="dashboard-analytics-section">
        <div class="dashboard-section-header">
          <div>
            <div class="dashboard-section-title">${getIcon('dashboard', 'ui-icon-header', 18)} Analisis Grafik &amp; Konten Terpopuler</div>
            <div style="font-size:0.82rem; color:var(--text-secondary);">Proporsi media dan peringkat item dengan rating tertinggi</div>
          </div>
          <span class="badge badge-neutral font-mono">Live Ranking</span>
        </div>

        <div class="dashboard-charts-grid">
          <!-- Donut Komposisi Media -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">${getIcon('album', 'ui-icon', 16)} Komposisi Media</div>
                <div class="chart-card-sub">Total ${totalMedia} item terkelola</div>
              </div>
              <span class="badge badge-info font-mono">${totalMedia} Item</span>
            </div>
            <div class="donut-chart-layout">
              ${donutSvgHtml}
              <div class="donut-legend">${donutLegendHtml}</div>
            </div>
          </div>

          <!-- Kategori Games Segmented Bar -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">${getIcon('games', 'ui-icon', 16)} Distribusi Platform Game</div>
                <div class="chart-card-sub">PC, Mobile, Emulator &amp; Port</div>
              </div>
              <span class="badge badge-steam font-mono">${stats.totals.games} Game</span>
            </div>
            <div>
              <div class="segmented-bar-track">${categoryStripHtml}</div>
              <div class="chart-category-list">${categoryBarsHtml}</div>
            </div>
          </div>

          <!-- Konten Populer / Rating Tertinggi -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">${getIcon('star', 'ui-icon', 16)} Konten Terpopuler (Rating Tertinggi)</div>
                <div class="chart-card-sub">Game, film, dan lagu favorit komunitas</div>
              </div>
              <span class="badge badge-purple font-mono">Top Rated</span>
            </div>
            <div>
              <div class="popular-group-label">${getIcon('games', 'ui-icon', 14)} <span>Game Paling Disukai</span></div>
              ${renderPopularList(pop.games.slice(0, 2), 'games')}
              <div class="popular-group-label">${getIcon('cinema', 'ui-icon', 14)} <span>Film &amp; Serial Unggulan</span></div>
              ${renderPopularList(pop.cinema.slice(0, 2), 'cinema')}
              <div class="popular-group-label">${getIcon('music', 'ui-icon', 14)} <span>Trek Musik Pilihan</span></div>
              ${renderPopularList(pop.music.slice(0, 2), 'music')}
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
  }
});
