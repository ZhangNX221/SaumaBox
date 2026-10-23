// ============================================================
// SaumaBox — Games Catalog & Form Module
// ============================================================

Object.assign(app, {
  async renderGames(container) {
    const { type, q, platform, status, completed, console: con, sortBy, sortOrder, page, limit } = this.state.games;
    const res = await api.get('/api/games', {
      type, q, platform, status, completed, console: con, sort_by: sortBy, sort_order: sortOrder, page, limit
    });

    this.state.games.items = res.items;
    this.state.games.totalPages = res.pagination.totalPages;
    this.state.games.totalPrice = res.aggregates.total_price;
    this.state.games.filterOptions = res.filter_options;

    const isAdmin = !!this.state.user;
    const canShowPrice = isAdmin || (this.state.publicConfig && this.state.publicConfig.public_show_prices !== false);

    const defaultPlatforms = ['Steam', 'GOG', 'EGS', 'Ubisoft', 'EA Origin'];
    const allPlatforms = Array.from(new Set([...defaultPlatforms, ...(res.filter_options.platforms || [])]));
    const platformOpts = ['ALL', ...allPlatforms].map(p => `<option value="${p}" ${platform === p ? 'selected' : ''}>${p === 'ALL' ? 'Semua Platform' : p}</option>`).join('');

    const defaultStatuses = ['Crack', 'Free', 'Free EGS', 'Free Ubisoft', 'Link EGS', 'Link Steam', 'Link Ubisoft', 'Purchase', 'Wishlist'];
    const allStatuses = Array.from(new Set([...defaultStatuses, ...(res.filter_options.statuses || [])])).sort();
    const statusOpts = ['ALL', ...allStatuses].map(s => `<option value="${s}" ${status === s ? 'selected' : ''}>${s === 'ALL' ? 'Semua Status' : s}</option>`).join('');
    const completedOpts = `<option value="ALL" ${!completed || completed === 'ALL' ? 'selected' : ''}>Status Tamat (Semua)</option><option value="1" ${completed === '1' ? 'selected' : ''}>Sudah Tamat</option><option value="0" ${completed === '0' ? 'selected' : ''}>Belum Tamat</option>`;

    const tableRows = res.items.map((g, idx) => {
      const rowNum = (page - 1) * limit + idx + 1;
      const isCompleted = g.completed === 1;
      const itemCode = typeof formatItemCode === 'function' ? formatItemCode('games', g.id) : `G-${String(g.id).padStart(3, '0')}`;
      let platformOrConsole = '-';
      if (g.type === 'PC') platformOrConsole = g.platform ? `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform)}</span>` : '-';
      else if (g.type === 'EMULATOR') platformOrConsole = g.console ? `<span class="badge badge-neutral">${escapeHtml(g.console)}</span>` : '-';
      else if (g.type === 'RECOMP') platformOrConsole = g.port_version ? `<span class="badge badge-purple">${escapeHtml(g.port_version)}</span>` : '<span class="badge badge-purple">Port</span>';
      else if (g.type === 'MOBILE') platformOrConsole = g.platform ? `<span class="badge badge-mobile">${escapeHtml(g.platform)}</span>` : '<span class="badge badge-mobile">Mobile</span>';

      const statusBadge = g.status ? `<span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status)}</span>` : '-';
      const priceText = canShowPrice && g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (canShowPrice && g.type === 'PC' ? 'Rp 0' : '-');
      const actionButtons = isAdmin ? `<div style="display:inline-flex; gap:4px;"><button class="btn btn-secondary btn-sm" onclick="app.openEditGameModal(${g.id})" title="Edit">${getIcon('edit', 'ui-icon', 14)}</button><button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteGame(${g.id}, '${escapeHtml(g.title)}')" title="Hapus">${getIcon('trash', 'ui-icon', 14)}</button></div>` : '';

      const completedCheckbox = isAdmin ? `
        <button class="quick-check-btn ${isCompleted ? 'active' : ''}" onclick="app.toggleGameCompleted(${g.id})" title="${isCompleted ? 'Tandai belum tamat' : 'Tandai sudah tamat'}" aria-label="${isCompleted ? 'Sudah tamat' : 'Belum tamat'}">
          ${isCompleted ? getIcon('check', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
        </button>
      ` : (isCompleted ? `<span class="badge badge-success">${getIcon('check', 'ui-icon', 12)} Tamat</span>` : '<span class="badge badge-neutral">Belum</span>');

      return `
        <tr>
          <td class="font-mono td-center" style="color:var(--text-muted); width:32px;">${rowNum}</td>
          <td class="td-center" style="width:36px;">${completedCheckbox}</td>
          <td class="cell-nowrap" style="width:68px;"><span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span></td>
          <td style="width:52px;"><span class="badge badge-neutral">${g.type}</span></td>
          <td>
            <strong>${escapeHtml(g.title)}</strong>
            ${g.genre ? `<div class="cell-sub">${escapeHtml(g.genre)}</div>` : ''}
            ${g.type === 'RECOMP' && g.enhancements ? `<div class="cell-sub" style="color:var(--accent-color);">${escapeHtml(g.enhancements)}</div>` : ''}
          </td>
          <td class="font-mono cell-nowrap">${escapeHtml(g.release_date || (g.year ? String(g.year) : '-'))}</td>
          <td>
            <div>${escapeHtml(g.developer || '-')}</div>
            ${g.publisher && g.publisher !== g.developer ? `<div class="cell-sub">${escapeHtml(g.publisher)}</div>` : ''}
          </td>
          <td>${platformOrConsole}</td>
          <td class="font-mono cell-nowrap">${escapeHtml(g.size_gb ? g.size_gb + ' GB' : '-')}</td>
          <td class="font-mono cell-nowrap">${formatRating(g.rating)}</td>
          <td>
            ${statusBadge}
            ${priceText !== '-' ? `<div class="font-mono cell-sub" style="font-weight:700;">${priceText}</div>` : ''}
          </td>
          <td class="td-center cell-nowrap">${g.download_url ? `<a href="${escapeHtml(g.download_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Akses Halaman Download" style="display:inline-flex; align-items:center; gap:3px; text-decoration:none;">${getIcon('download', 'ui-icon', 12)} Unduh</a>` : '<span style="color:var(--text-muted); font-size:0.8rem;">-</span>'}</td>
          ${isAdmin ? `<td class="td-right cell-nowrap">${actionButtons}</td>` : ''}
        </tr>`;
    }).join('');

    const mobileCards = res.items.map(g => {
      const releaseStr = g.release_date || (g.year ? String(g.year) : '');
      const isCompleted = g.completed === 1;
      const itemCode = typeof formatItemCode === 'function' ? formatItemCode('games', g.id) : `G-${String(g.id).padStart(3, '0')}`;
      return `
        <div class="mobile-data-card">
          <div class="mobile-card-row">
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span>
              <span class="badge badge-neutral">${g.type}</span>
              ${g.genre ? `<span class="badge badge-neutral">${escapeHtml(g.genre)}</span>` : ''}
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="font-mono">${formatRating(g.rating)}</span>
              ${isAdmin ? `
                <button class="quick-check-btn ${isCompleted ? 'active' : ''}" onclick="app.toggleGameCompleted(${g.id})" aria-label="${isCompleted ? 'Sudah tamat' : 'Belum tamat'}">
                  ${isCompleted ? getIcon('check', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
                </button>
              ` : (isCompleted ? `<span class="badge badge-success">${getIcon('check', 'ui-icon', 12)}</span>` : '<span class="badge badge-neutral">-</span>')}
            </div>
          </div>
          <div>
            <strong style="font-size:1.05rem;">${escapeHtml(g.title)}</strong>
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px; display:flex; flex-direction:column; gap:2px;">
              ${releaseStr ? `<div><span style="color:var(--text-muted);">Tanggal Rilis:</span> <span class="font-mono">${escapeHtml(releaseStr)}</span></div>` : ''}
              ${g.developer ? `<div><span style="color:var(--text-muted);">Pengembang:</span> ${escapeHtml(g.developer)}</div>` : ''}
              ${g.publisher ? `<div><span style="color:var(--text-muted);">Penerbit:</span> ${escapeHtml(g.publisher)}</div>` : ''}
            </div>
          </div>
          <div class="mobile-card-row">
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${g.platform ? `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform)}</span>` : ''}
              ${g.console ? `<span class="badge badge-neutral">${escapeHtml(g.console)}</span>` : ''}
              ${g.status ? `<span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status)}</span>` : ''}
            </div>
            <div class="font-mono" style="font-weight:700;">
              ${canShowPrice && g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : ''}
            </div>
          </div>
          ${isAdmin ? `
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-subtle); padding-top:8px;">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditGameModal(${g.id})">${getIcon('edit', 'ui-icon-btn', 13)} Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteGame(${g.id}, '${escapeHtml(g.title)}')">${getIcon('trash', 'ui-icon-btn', 13)} Hapus</button>
            </div>` : ''}
        </div>`;
    }).join('');

    const gridCards = res.items.map(g => {
      const coverSrc = g.cover_url || '/images/covers/cyberpunk2077.svg';
      const devPubParts = [];
      if (g.developer) devPubParts.push(escapeHtml(g.developer));
      if (g.publisher && g.publisher !== g.developer) devPubParts.push(escapeHtml(g.publisher));
      const devPubHtml = devPubParts.length > 0 ? devPubParts.map(p => `<span>${p}</span>`).join('<span>•</span>') : '<span>-</span>';
      const isCompleted = g.completed === 1;
      const itemCode = typeof formatItemCode === 'function' ? formatItemCode('games', g.id) : `G-${String(g.id).padStart(3, '0')}`;

      let platformPill = '';
      if (g.type === 'PC') platformPill = `<span class="badge ${getPlatformBadgeClass(g.platform)}">${escapeHtml(g.platform || 'PC')}</span>`;
      else if (g.type === 'EMULATOR') platformPill = `<span class="badge badge-neutral">${escapeHtml(g.console || 'Emu')}</span>`;
      else if (g.type === 'MOBILE') platformPill = `<span class="badge badge-mobile">${escapeHtml(g.platform || 'Mobile')}</span>`;
      else platformPill = `<span class="badge badge-purple">${escapeHtml(g.port_version || 'Recomp')}</span>`;

      const priceText = canShowPrice && g.type === 'PC' && g.price > 0 ? formatRupiah(g.price) : (g.status || 'Tersedia');
      const adminActions = isAdmin ? `<div class="ps-actions" onclick="event.stopPropagation()"><button class="btn btn-secondary btn-sm" onclick="app.openEditGameModal(${g.id})" title="Edit">${getIcon('edit', 'ui-icon', 14)}</button><button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteGame(${g.id}, '${escapeHtml(g.title)}')" title="Hapus">${getIcon('trash', 'ui-icon', 14)}</button></div>` : '';
      const quickCompletedBtn = isAdmin ? `<button class="ps-heart-btn ${isCompleted ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleGameCompleted(${g.id})" title="${isCompleted ? 'Tandai belum tamat' : 'Tandai sudah tamat'}">${isCompleted ? getIcon('check', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}</button>` : (isCompleted ? '<span class="badge badge-success" style="backdrop-filter:blur(4px); box-shadow:0 2px 6px rgba(0,0,0,0.4);">Tamat</span>' : '');

      return `
        <article class="ps-card" onclick="app.openMediaDetail('games', ${g.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('games', ${g.id})">
          <div class="ps-card-media">
            <div class="ps-overlay-top">
              <div class="ps-overlay-badges-left">
                <span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span>
                ${platformPill}
                <span class="badge badge-neutral">${g.type}</span>
              </div>
              <div class="ps-overlay-action-right" style="display:flex; align-items:center; gap:6px;">
                <span class="badge badge-rating">${formatRating(g.rating)}</span>
                ${quickCompletedBtn}
              </div>
            </div>
            <img class="ps-card-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(g.title)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/cyberpunk2077.svg';">
            <div class="ps-overlay-gradient"></div>
          </div>
          <div class="ps-card-body">
            <div class="ps-header-row">
              <div style="flex:1; min-width:0;">
                <h3 class="ps-card-title" title="${escapeHtml(g.title)}">${escapeHtml(g.title)}</h3>
                <div class="ps-card-meta">${devPubHtml}</div>
              </div>
            </div>
            <div class="ps-card-footer">
              <div>
                <span class="badge ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status || 'Playable')}</span>
                ${canShowPrice && g.type === 'PC' && g.price > 0 ? `<span class="font-mono card-media-extra" style="margin-left:6px; font-weight:700;">${priceText}</span>` : ''}
              </div>
              ${adminActions}
            </div>
          </div>
        </article>`;
    }).join('');

    container.innerHTML = `
      <div class="data-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="sub-tabs">
              ${[['ALL','Semua'],['PC','PC'],['EMULATOR','Emulator'],['RECOMP','Recomp'],['MOBILE','Mobile']].map(([k,l])=>`<button class="sub-tab-btn ${type===k?'active':''}" onclick="app.setGameType('${k}')">${l}</button>`).join('')}
            </div>
            <div class="toolbar-filters-row">
              <select class="filter-select" id="filter-game-platform" onchange="app.setGamePlatform(this.value)">${platformOpts}</select>
              <select class="filter-select" id="filter-game-status" onchange="app.setGameStatus(this.value)">${statusOpts}</select>
              <select class="filter-select" id="filter-game-completed" onchange="app.setGameCompletedFilter(this.value)">${completedOpts}</select>
            </div>
          </div>
          <div class="toolbar-right">
            <div class="view-toggle-group" role="group" aria-label="Pilihan Tampilan">
              <button class="view-toggle-btn ${this.state.games.viewMode === 'grid' ? 'active' : ''}" onclick="app.setCatalogViewMode('games', 'grid')" title="Tampilan Grid Poster" aria-label="Tampilan Grid">${getIcon('grid', 'ui-icon', 16)}</button>
              <button class="view-toggle-btn ${this.state.games.viewMode === 'table' ? 'active' : ''}" onclick="app.setCatalogViewMode('games', 'table')" title="Tampilan Tabel Spreadsheet" aria-label="Tampilan Tabel">${getIcon('table', 'ui-icon', 16)}</button>
            </div>
            ${isAdmin ? `
              <div class="toolbar-actions-group">
                <button class="btn btn-primary btn-icon" onclick="app.openAddGameModal()" title="Tambah Game" aria-label="Tambah Game">${getIcon('plus', 'ui-icon-btn', 16)}</button>
                <button class="btn btn-secondary btn-icon" onclick="app.openImportModal('games')" title="Import Data" aria-label="Import Data">${getIcon('upload', 'ui-icon-btn', 16)}</button>
                <button class="btn btn-secondary btn-icon" onclick="app.openExportModal('games')" title="Ekspor Data" aria-label="Ekspor Data">${getIcon('download', 'ui-icon-btn', 16)}</button>
              </div>` : ''}
          </div>
        </div>

        ${this.state.games.viewMode === 'grid' ? `
          <div class="catalog-grid">
            ${gridCards || `<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">${getIcon('games', 'ui-icon', 40)}</div><div class="state-title">Tidak ada game ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci atau filter pencarian Anda.</div></div>`}
          </div>` : `
          <div class="table-responsive data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-center" style="width:32px;">#</th>
                  <th class="th-center" style="width:36px;">Tamat</th>
                  <th style="width:68px;">ID Unik</th>
                  <th style="width:52px;">Tipe</th>
                  <th class="sortable ${this.state.games.sortBy === 'title' ? 'sorted' : ''}" onclick="app.sortCatalog('games', 'title')">Judul &amp; Genre <span class="sort-indicator">${this.state.games.sortBy === 'title' ? (this.state.games.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th class="sortable ${this.state.games.sortBy === 'release_date' ? 'sorted' : ''}" onclick="app.sortCatalog('games', 'release_date')">Tgl Rilis <span class="sort-indicator">${this.state.games.sortBy === 'release_date' ? (this.state.games.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th>Studio &amp; Penerbit</th>
                  <th>Platform</th>
                  <th>Ukuran</th>
                  <th class="sortable ${this.state.games.sortBy === 'rating' ? 'sorted' : ''}" onclick="app.sortCatalog('games', 'rating')">Rating <span class="sort-indicator">${this.state.games.sortBy === 'rating' ? (this.state.games.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th class="sortable ${this.state.games.sortBy === 'price' ? 'sorted' : ''}" onclick="app.sortCatalog('games', 'price')">${canShowPrice ? 'Status &amp; Harga' : 'Status'} <span class="sort-indicator">${this.state.games.sortBy === 'price' ? (this.state.games.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th class="th-center">Unduh</th>
                  ${isAdmin ? '<th class="th-right">Aksi</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="13" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada game yang cocok dengan kriteria pencarian.</td></tr>'}
              </tbody>
            </table>
          </div>
          <div class="mobile-card-list" style="padding:16px;">
            ${mobileCards || '<div class="state-container"><div class="state-title">Tidak ada game ditemukan</div></div>'}
          </div>`}

        <div class="table-footer">
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <div class="table-page-size-wrap">
              <span>Tampilkan:</span>
              <select class="filter-select page-size-select" onchange="app.changeLimit('games', this.value)" aria-label="Jumlah baris data">
                ${[10, 25, 50, 100].map(n => `<option value="${n}" ${limit === n ? 'selected' : ''}>${n} data</option>`).join('')}
              </select>
            </div>
            ${canShowPrice && (type === 'PC' || type === 'ALL') ? `
              <span class="kpi-value" style="font-size:0.95rem; color:var(--text-primary); font-family:var(--font-mono);">
                Estimasi Aset: <strong>${formatRupiah(this.state.games.totalPrice)}</strong>
              </span>` : '<span style="font-size:0.85rem; color:var(--text-secondary);">Koleksi game terkurasi.</span>'}
          </div>
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Menampilkan <strong>${res.pagination.total > 0 ? (page - 1) * limit + 1 : 0}-${Math.min(page * limit, res.pagination.total)}</strong> dari <strong>${res.pagination.total}</strong> game</span>
            <div class="pagination">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="app.changePage('games', ${page - 1})">◀</button>
              <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${page} dari ${this.state.games.totalPages}</span>
              <button class="page-btn" ${page >= this.state.games.totalPages ? 'disabled' : ''} onclick="app.changePage('games', ${page + 1})">▶</button>
            </div>
          </div>
        </div>
      </div>`;
  },

  setGameType(type) { this.state.games.type = type; this.state.games.page = 1; this.renderGames(document.getElementById('view-container')); },
  setGamePlatform(platform) { this.state.games.platform = platform; this.state.games.page = 1; this.renderGames(document.getElementById('view-container')); },
  setGameStatus(status) { this.state.games.status = status; this.state.games.page = 1; this.renderGames(document.getElementById('view-container')); },
  setGameCompletedFilter(val) { this.state.games.completed = val; this.state.games.page = 1; this.renderGames(document.getElementById('view-container')); },

  async toggleGameCompleted(id) {
    try {
      const res = await api.patch(`/api/games/${id}/toggle-completed`);
      showToast(res.completed === 1 ? 'Game ditandai sudah tamat' : 'Game ditandai belum tamat', 'success');
      this.renderGames(document.getElementById('view-container'));
    } catch (err) { showToast(err.message, 'error'); }
  },

  sortGames(col) { this.sortCatalog('games', col); },
  changeGamePage(newPage) { this.changePage('games', newPage); },
  openAddGameModal() { this.openGameModal(null); },

  async openEditGameModal(id) {
    try { const item = await api.get(`/api/games/${id}`); this.openGameModal(item); } catch (err) { showToast(err.message, 'error'); }
  },

  async openGameModal(item = null) {
    const isEdit = !!item;
    const g = item || {
      type: 'PC', title: '', year: '', release_date: '', genre: '', publisher: '', developer: '',
      size_gb: '', rating: '', status: 'Purchase', platform: 'Steam', price: 0,
      console: '', emulator: '', port_developer: '', port_version: '', enhancements: '', cover_url: '', completed: 0
    };

    let customStatuses = ['Crack', 'Free', 'Free EGS', 'Free Ubisoft', 'Link EGS', 'Link Steam', 'Link Ubisoft', 'Purchase', 'Wishlist'];
    let customPlatforms = ['Steam', 'GOG', 'EGS', 'Ubisoft', 'EA Origin'];
    let customGenres = [];
    try {
      const [stRes, plRes, gnRes] = await Promise.all([api.get('/api/taxonomy/statuses'), api.get('/api/taxonomy/platforms'), api.get('/api/taxonomy/genres?media_type=game')]);
      if (Array.isArray(stRes) && stRes.length) customStatuses = stRes.map(x => x.name);
      if (Array.isArray(plRes) && plRes.length) customPlatforms = Array.from(new Set([...plRes.filter(x => !x.category || x.category === 'Game Platform').map(x => x.name), ...customPlatforms]));
      if (Array.isArray(gnRes) && gnRes.length) customGenres = gnRes;
    } catch (_) {}

    const modalId = 'modal-game-form';
    this.createModal(modalId, isEdit ? 'Edit Game' : 'Tambah Game Baru', `
      <form id="form-game" onsubmit="app.handleGameSubmit(event, ${isEdit ? g.id : 'null'})">
        ${this.renderMetaFetchBar('games', g.title)}
        
        <div class="form-row-1-2">
          <div class="form-group">
            <label class="form-label">Tipe Game *</label>
            <select class="form-select" name="type" onchange="app.toggleGameModalFields(this.value)">
              <option value="PC" ${g.type === 'PC' ? 'selected' : ''}>PC Game</option>
              <option value="EMULATOR" ${g.type === 'EMULATOR' ? 'selected' : ''}>Emulator Console</option>
              <option value="RECOMP" ${g.type === 'RECOMP' ? 'selected' : ''}>Recomp Port</option>
              <option value="MOBILE" ${g.type === 'MOBILE' ? 'selected' : ''}>Game Mobile</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Judul Game *</label>
            <input type="text" class="form-input" name="title" required value="${escapeHtml(g.title)}" placeholder="Cyberpunk 2077">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tanggal Rilis (YYYY-MM-DD / Tahun)</label>
            <input type="text" class="form-input" name="release_date" value="${escapeHtml(g.release_date || (g.year ? String(g.year) : ''))}" placeholder="2020-12-10 atau 2020">
          </div>
          <div class="form-group">
            <label class="form-label">Status Kepemilikan</label>
            <select class="form-select" name="status">
              ${customStatuses.map(s => `<option value="${s}" ${g.status === s || (!customStatuses.includes(g.status) && s === 'Purchase') ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        ${this.renderCoverUploadField(g.cover_url, 'Gambar Poster Cover Art')}

        ${this.renderGenreSelector(g.genre, 'game', customGenres)}

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Pengembang (Developer)</label>
            <input type="text" class="form-input" name="developer" value="${escapeHtml(g.developer || '')}" placeholder="CD Projekt Red">
          </div>
          <div class="form-group">
            <label class="form-label">Penerbit (Publisher)</label>
            <input type="text" class="form-input" name="publisher" value="${escapeHtml(g.publisher || '')}" placeholder="CD Projekt">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ukuran Penyimpanan (GB)</label>
            <input type="text" class="form-input" name="size_gb" value="${escapeHtml(g.size_gb || '')}" placeholder="70">
          </div>
          <div class="form-group">
            <label class="form-label">Rating Skor (0 - 10)</label>
            <input type="number" step="0.1" min="0" max="10" class="form-input" name="rating" value="${g.rating || ''}" placeholder="9.5">
          </div>
        </div>

        <div id="field-group-pc" class="form-row" style="${g.type === 'PC' ? '' : 'display:none;'}">
          <div class="form-group">
            <label class="form-label">Platform PC</label>
            <select class="form-select" name="platform">
              ${customPlatforms.map(p => `<option value="${p}" ${g.platform === p || (!g.platform && p === 'Steam') ? 'selected' : ''}>${p}</option>`).join('')}
              ${g.platform && !customPlatforms.includes(g.platform) ? `<option value="${escapeHtml(g.platform)}" selected>${escapeHtml(g.platform)}</option>` : ''}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Pembelian (IDR)</label>
            <input type="number" class="form-input" name="price" value="${g.price || 0}" placeholder="599000">
          </div>
        </div>

        <div id="field-group-mobile" class="form-row" style="${g.type === 'MOBILE' ? '' : 'display:none;'}">
          <div class="form-group">
            <label class="form-label">Platform Mobile</label>
            <select class="form-select" name="platform_mobile">
              <option value="Android" ${g.platform === 'Android' ? 'selected' : ''}>Android</option>
              <option value="iOS" ${g.platform === 'iOS' ? 'selected' : ''}>iOS</option>
              <option value="Android / iOS" ${g.platform === 'Android / iOS' || !g.platform ? 'selected' : ''}>Android / iOS</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Pembelian (0 jika Free-to-Play)</label>
            <input type="number" class="form-input" name="price_mobile" value="${g.price || 0}" placeholder="0">
          </div>
        </div>

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

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Link Download / Halaman Akses Game</label>
            <input type="url" class="form-input" name="download_url" value="${escapeHtml(g.download_url || '')}" placeholder="https://store.steampowered.com/app/... atau tautan unduh">
          </div>
          <div class="form-group" style="display:flex; flex-direction:column; justify-content:flex-end;">
            <label class="form-checkbox-card">
              <input type="checkbox" id="game-completed" name="completed" ${g.completed === 1 ? 'checked' : ''}>
              <div class="form-checkbox-label">
                <strong>Sudah Tamat (Completed)</strong>
                <span>Tandai riwayat selesai bermain</span>
              </div>
            </label>
          </div>
        </div>

        <div class="modal-actions-footer">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('${modalId}')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Game'}</button>
        </div>
      </form>
    `);
  },

  toggleGameModalFields(type) {
    const setDisplay = (id, d) => { const el = document.getElementById(id); if (el) el.style.display = d; };
    setDisplay('field-group-pc', type === 'PC' ? 'grid' : 'none');
    setDisplay('field-group-emu', type === 'EMULATOR' ? 'grid' : 'none');
    setDisplay('field-group-recomp', type === 'RECOMP' ? 'block' : 'none');
    setDisplay('field-group-mobile', type === 'MOBILE' ? 'grid' : 'none');
  },

  async handleGameSubmit(e, id) {
    e.preventDefault();
    const form = e.target;
    const gameType = form.type.value;
    let gamePlatform = form.platform?.value || '';
    let gamePrice = form.price?.value || 0;
    if (gameType === 'MOBILE') {
      gamePlatform = form.platform_mobile?.value || 'Android / iOS';
      gamePrice = form.price_mobile?.value || 0;
    }

    const releaseVal = form.release_date?.value?.trim() || '';
    const parsedYear = releaseVal ? (parseInt(releaseVal.slice(0, 4), 10) || null) : (form.year?.value || null);

    const body = {
      type: gameType, title: form.title.value, cover_url: form.cover_url?.value || '',
      release_date: releaseVal, genre: form.genre?.value?.trim() || '', year: parsedYear,
      publisher: form.publisher.value, developer: form.developer.value, size_gb: form.size_gb.value,
      rating: form.rating.value, status: form.status.value, platform: gamePlatform, price: gamePrice,
      console: form.console?.value || '', emulator: form.emulator?.value || '',
      port_developer: form.port_developer?.value || '', port_version: form.port_version?.value || '',
      enhancements: form.enhancements?.value || '', completed: form.completed?.checked ? 1 : 0,
      download_url: form.download_url?.value?.trim() || ''
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
      const c = document.getElementById('view-container');
      const tab = this.state.currentTab;
      if (tab === 'dashboard') this.renderDashboard(c);
      else if (tab === 'games') this.renderGames(c);
      else this.renderLanding(c);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteGame(id, title) {
    showConfirmModal({
      title: 'Hapus Game',
      message: `Yakin ingin menghapus game "<strong>${escapeHtml(title)}</strong>"?`,
      subtext: 'Data game ini akan dihapus permanen dari pustaka SaumaBox.',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        api.delete(`/api/games/${id}`).then(() => {
          showToast('Game berhasil dihapus', 'success');
          const c = document.getElementById('view-container');
          if (this.state.currentTab === 'dashboard') this.renderDashboard(c);
          else this.renderGames(c);
        }).catch(err => showToast(err.message, 'error'));
      }
    });
  }
});
