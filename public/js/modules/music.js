// ============================================================
// SaumaBox — Music Catalog Module
// ============================================================

Object.assign(app, {
  async renderMusic(container) {
    const { platform, genre, favorite, q, sortBy, sortOrder, page, limit } = this.state.music;
    const subTab = this.state.music.subTab || (favorite === '1' ? 'favorite' : 'all');
    const isAdmin = !!this.state.user;

    let contentHtml = '';
    let footerHtml = '';
    let platformFilterHtml = '';

    if (subTab === 'album') {
      const albums = await api.get('/api/music/albums', { q });
      const albumCards = albums.map(a => {
        const coverSrc = a.cover_url || '/images/covers/bohemian_rhapsody.jpg';
        return `
          <article class="album-card" onclick="app.filterMusicByAlbum('${escapeHtml(a.album)}')" tabindex="0" onkeydown="if(event.key==='Enter')app.filterMusicByAlbum('${escapeHtml(a.album)}')">
            <div class="album-cover-wrap">
              <div class="album-vinyl-accent"></div>
              <img class="album-cover-img" src="${escapeHtml(coverSrc)}" alt="${escapeHtml(a.album)}" loading="lazy" onerror="this.onerror=null; this.src='/images/covers/bohemian_rhapsody.jpg';">
            </div>
            <div class="album-card-body">
              <h3 class="album-title" title="${escapeHtml(a.album)}">${escapeHtml(a.album)}</h3>
              <div class="album-artist">${escapeHtml(a.artist)}</div>
              <div class="album-meta-row">
                <span class="badge badge-neutral">${a.year || '-'}</span>
                <span class="badge badge-purple">${a.total_tracks} Lagu</span>
              </div>
            </div>
          </article>`;
      }).join('');

      contentHtml = `<div class="album-grid">${albumCards || `<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">${getIcon('album', 'ui-icon', 40)}</div><div class="state-title">Tidak ada album ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci pencarian Anda.</div></div>`}</div>`;

      footerHtml = `
        <div class="table-footer">
          <span style="font-size:0.85rem; color:var(--text-secondary);">Koleksi album musik terkurasi. Klik kartu album untuk memfilter seluruh daftar lagu.</span>
          <span style="font-size:0.85rem; color:var(--text-secondary);">Total <strong>${albums.length}</strong> album</span>
        </div>`;
    } else if (subTab === 'artist') {
      const artists = await api.get('/api/music/artists', { q });
      const artistCards = artists.map(art => {
        const initial = (art.artist || 'A').charAt(0).toUpperCase();
        const avatarBg = getAvatarColor(initial);
        return `
          <article class="artist-card" onclick="app.filterMusicByArtist('${escapeHtml(art.artist)}')" tabindex="0" onkeydown="if(event.key==='Enter')app.filterMusicByArtist('${escapeHtml(art.artist)}')">
            <div class="artist-avatar-wrap" style="background:${avatarBg};">
              ${art.cover_url ? `<img class="artist-avatar-img" src="${escapeHtml(art.cover_url)}" alt="${escapeHtml(art.artist)}" onerror="this.style.display='none';">` : ''}
              <span>${initial}</span>
            </div>
            <div class="artist-info">
              <h3 class="artist-name" title="${escapeHtml(art.artist)}">${escapeHtml(art.artist)}</h3>
              <div class="artist-stats">${art.total_tracks} Lagu • ${art.total_albums} Album</div>
              ${art.genre ? `<div style="margin-top:6px;"><span class="badge badge-neutral" style="font-size:0.7rem;">${escapeHtml(art.genre)}</span></div>` : ''}
            </div>
          </article>`;
      }).join('');

      contentHtml = `<div class="artist-grid">${artistCards || `<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">${getIcon('artist', 'ui-icon', 40)}</div><div class="state-title">Tidak ada penyanyi ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci pencarian Anda.</div></div>`}</div>`;

      footerHtml = `
        <div class="table-footer">
          <span style="font-size:0.85rem; color:var(--text-secondary);">Katalog penyanyi, musisi, band, dan komposer. Klik artis untuk melihat seluruh lagu karyanya.</span>
          <span style="font-size:0.85rem; color:var(--text-secondary);">Total <strong>${artists.length}</strong> penyanyi</span>
        </div>`;
    } else {
      const res = await api.get('/api/music', { platform, genre, favorite, q, sort_by: sortBy, sort_order: sortOrder, page, limit });
      this.state.music.items = res.items;
      this.state.music.totalPages = res.pagination.totalPages;
      this.state.music.filterOptions = res.filter_options;

      const platformOpts = ['ALL', ...(res.filter_options.platforms || [])].map(p =>
        `<option value="${p}" ${platform === p ? 'selected' : ''}>${p === 'ALL' ? 'Semua Platform' : p}</option>`
      ).join('');

      platformFilterHtml = `<select class="filter-select" id="filter-music-platform" onchange="app.setMusicPlatform(this.value)">${platformOpts}</select>`;

      const tableRows = res.items.map((m, idx) => {
        const rowNum = (page - 1) * limit + idx + 1;
        const isFav = m.is_favorite === 1;
        const itemCode = typeof formatItemCode === 'function' ? formatItemCode('music', m.id) : `M-${String(m.id).padStart(3, '0')}`;
        const favButton = isAdmin ? `
          <button class="quick-check-btn ${isFav ? 'active' : ''}" onclick="app.toggleMusicFavorite(${m.id})" title="${isFav ? 'Hapus favorit' : 'Jadikan favorit'}" aria-label="${isFav ? 'Hapus favorit' : 'Favorit'}">
            ${isFav ? getIcon('star', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
          </button>` : (isFav ? `<span style="color:#fbbf24;">${getIcon('star', 'ui-icon', 14)}</span>` : '-');

        const actionButtons = isAdmin ? `
          <div style="display:inline-flex; gap:4px;">
            <button class="btn btn-secondary btn-sm" onclick="app.openEditMusicModal(${m.id})" title="Edit" aria-label="Edit ${escapeHtml(m.title)}">${getIcon('edit', 'ui-icon', 14)}</button>
            <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteMusic(${m.id}, '${escapeHtml(m.title)}')" title="Hapus" aria-label="Hapus ${escapeHtml(m.title)}">${getIcon('trash', 'ui-icon', 14)}</button>
          </div>` : '';

        return `
          <tr>
            <td class="font-mono td-center" style="color:var(--text-muted); width:32px;">${rowNum}</td>
            <td class="td-center" style="width:36px;">${favButton}</td>
            <td class="cell-nowrap" style="width:68px;"><span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span></td>
            <td>
              <strong>${escapeHtml(m.title)}</strong>
              ${m.notes ? `<div class="cell-sub">${escapeHtml(m.notes)}</div>` : ''}
            </td>
            <td>
              <div><strong>${escapeHtml(m.artist || '-')}</strong></div>
              ${m.album ? `<div class="cell-sub">${escapeHtml(m.album)}</div>` : ''}
            </td>
            <td class="font-mono cell-nowrap">
              <div>${m.year || '-'}</div>
              ${m.genre ? `<div class="cell-sub">${escapeHtml(m.genre)}</div>` : ''}
            </td>
            <td>
              ${m.platform ? `<span class="badge badge-neutral">${escapeHtml(m.platform)}</span>` : '<span style="color:var(--text-muted);">-</span>'}
              ${m.size_mb ? `<div class="cell-sub font-mono" style="font-weight:700;">${m.size_mb} MB</div>` : ''}
            </td>
            <td class="font-mono cell-nowrap">${formatRating(m.rating)}</td>
            <td class="td-center cell-nowrap">${m.download_url ? `<a href="${escapeHtml(m.download_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Akses Halaman Download / Trek" style="display:inline-flex; align-items:center; gap:3px; text-decoration:none;">${getIcon('download', 'ui-icon', 12)} Unduh</a>` : '<span style="color:var(--text-muted); font-size:0.8rem;">-</span>'}</td>
            ${isAdmin ? `<td class="td-right cell-nowrap">${actionButtons}</td>` : ''}
          </tr>`;
      }).join('');

      const gridCards = res.items.map(m => {
        const isFav = m.is_favorite === 1;
        const coverSrc = m.cover_url || '/images/covers/bohemian_rhapsody.jpg';
        const itemCode = typeof formatItemCode === 'function' ? formatItemCode('music', m.id) : `M-${String(m.id).padStart(3, '0')}`;

        const adminActions = isAdmin ? `
          <div class="ps-actions" onclick="event.stopPropagation()">
            <button class="btn btn-secondary btn-sm" onclick="app.openEditMusicModal(${m.id})" title="Edit" aria-label="Edit">${getIcon('edit', 'ui-icon', 14)}</button>
            <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteMusic(${m.id}, '${escapeHtml(m.title)}')" title="Hapus" aria-label="Hapus">${getIcon('trash', 'ui-icon', 14)}</button>
          </div>` : '';

        const favButton = isAdmin ? `
          <button class="ps-heart-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleMusicFavorite(${m.id})" title="${isFav ? 'Hapus dari favorit' : 'Favorit'}" aria-label="Favorit">
            ${getIcon('heart', 'ui-icon', 15)}
          </button>` : (isFav ? `<span class="ps-heart-btn active" style="cursor:default;" title="Favorit">${getIcon('heart', 'ui-icon', 15)}</span>` : '');

        return `
          <article class="ps-card" onclick="app.openMediaDetail('music', ${m.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('music', ${m.id})">
            <div class="ps-card-media music-aspect">
              <div class="ps-overlay-top">
                <div class="ps-overlay-badges-left">
                  <span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span>
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
                <div style="flex:1; min-width:0;">
                  <h3 class="ps-card-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</h3>
                  <div class="ps-card-meta"><span>${escapeHtml(m.artist || 'Artis')}</span>${m.album ? `<span>•</span><span>${escapeHtml(m.album)}</span>` : ''}</div>
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
          </article>`;
      }).join('');

      const mobileCards = res.items.map(m => {
        const isFav = m.is_favorite === 1;
        const itemCode = typeof formatItemCode === 'function' ? formatItemCode('music', m.id) : `M-${String(m.id).padStart(3, '0')}`;
        return `
          <div class="mobile-data-card">
            <div class="mobile-card-row">
              <div>
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span>
                </div>
                <strong style="font-size:1.05rem;">${escapeHtml(m.title)}</strong>
                <div style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(m.artist || '')} • ${escapeHtml(m.album || '')}</div>
              </div>
              ${isAdmin ? `
                <button class="quick-check-btn ${isFav ? 'active' : ''}" onclick="app.toggleMusicFavorite(${m.id})" aria-label="${isFav ? 'Hapus favorit' : 'Favorit'}">
                  ${isFav ? getIcon('star', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
                </button>` : (isFav ? `<span style="color:#fbbf24;">${getIcon('star', 'ui-icon', 14)}</span>` : '')}
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
                <button class="btn btn-secondary btn-sm" onclick="app.openEditMusicModal(${m.id})">${getIcon('edit', 'ui-icon-btn', 13)} Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteMusic(${m.id}, '${escapeHtml(m.title)}')">${getIcon('trash', 'ui-icon-btn', 13)} Hapus</button>
              </div>` : ''}
          </div>`;
      }).join('');

      contentHtml = this.state.music.viewMode === 'grid' ? `
        <div class="catalog-grid">
          ${gridCards || `<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">${getIcon('music', 'ui-icon', 40)}</div><div class="state-title">Tidak ada trek musik ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci atau filter platform Anda.</div></div>`}
        </div>` : `
        <div class="table-responsive data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-center" style="width:32px;">#</th>
                <th class="th-center" style="width:36px;">Fav</th>
                <th style="width:68px;">ID Unik</th>
                <th class="sortable ${this.state.music.sortBy === 'title' ? 'sorted' : ''}" onclick="app.sortCatalog('music', 'title')">Judul Trek <span class="sort-indicator">${this.state.music.sortBy === 'title' ? (this.state.music.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                <th class="sortable ${this.state.music.sortBy === 'artist' ? 'sorted' : ''}" onclick="app.sortCatalog('music', 'artist')">Artis &amp; Album <span class="sort-indicator">${this.state.music.sortBy === 'artist' ? (this.state.music.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                <th class="sortable ${this.state.music.sortBy === 'year' ? 'sorted' : ''}" onclick="app.sortCatalog('music', 'year')">Tahun &amp; Genre <span class="sort-indicator">${this.state.music.sortBy === 'year' ? (this.state.music.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                <th>Platform &amp; Format</th>
                <th class="sortable ${this.state.music.sortBy === 'rating' ? 'sorted' : ''}" onclick="app.sortCatalog('music', 'rating')">Rating <span class="sort-indicator">${this.state.music.sortBy === 'rating' ? (this.state.music.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                <th class="th-center">Unduh</th>
                ${isAdmin ? '<th class="th-right">Aksi</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="10" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada trek musik yang cocok.</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="mobile-card-list" style="padding:16px;">
          ${mobileCards || '<div class="state-container"><div class="state-title">Tidak ada musik ditemukan</div></div>'}
        </div>`;

      footerHtml = `
        <div class="table-footer">
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <div class="table-page-size-wrap">
              <span>Tampilkan:</span>
              <select class="filter-select page-size-select" onchange="app.changeLimit('music', this.value)" aria-label="Jumlah baris data">
                ${[10, 25, 50, 100].map(n => `<option value="${n}" ${limit === n ? 'selected' : ''}>${n} data</option>`).join('')}
              </select>
            </div>
            <span style="font-size:0.85rem; color:var(--text-secondary);">Koleksi file lokal Lossless FLAC, MP3, serta streaming platform terpusat.</span>
          </div>
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              Menampilkan <strong>${res.pagination.total > 0 ? (page - 1) * limit + 1 : 0}-${Math.min(page * limit, res.pagination.total)}</strong> dari total <strong>${res.pagination.total}</strong> trek musik
            </span>
            <div class="pagination">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="app.changePage('music', ${page - 1})">◀</button>
              <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${page} dari ${this.state.music.totalPages}</span>
              <button class="page-btn" ${page >= this.state.music.totalPages ? 'disabled' : ''} onclick="app.changePage('music', ${page + 1})">▶</button>
            </div>
          </div>
        </div>`;
    }

    container.innerHTML = `
      <div class="data-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="sub-tabs">
              <button class="sub-tab-btn ${subTab === 'all' ? 'active' : ''}" onclick="app.setMusicTab('all')">Semua</button>
              <button class="sub-tab-btn ${subTab === 'album' ? 'active' : ''}" onclick="app.setMusicTab('album')">Album</button>
              <button class="sub-tab-btn ${subTab === 'artist' ? 'active' : ''}" onclick="app.setMusicTab('artist')">Penyanyi</button>
              <button class="sub-tab-btn ${subTab === 'favorite' ? 'active' : ''}" onclick="app.setMusicTab('favorite')">Favorit</button>
            </div>
            ${platformFilterHtml ? `<div class="toolbar-filters-row">${platformFilterHtml}</div>` : ''}
          </div>
          <div class="toolbar-right">
            ${(subTab === 'all' || subTab === 'favorite') ? `
              <div class="view-toggle-group" role="group" aria-label="Pilihan Tampilan">
                <button class="view-toggle-btn ${this.state.music.viewMode === 'grid' ? 'active' : ''}" onclick="app.setCatalogViewMode('music', 'grid')" title="Tampilan Grid Poster" aria-label="Tampilan Grid">${getIcon('grid', 'ui-icon', 16)}</button>
                <button class="view-toggle-btn ${this.state.music.viewMode === 'table' ? 'active' : ''}" onclick="app.setCatalogViewMode('music', 'table')" title="Tampilan Tabel Spreadsheet" aria-label="Tampilan Tabel">${getIcon('table', 'ui-icon', 16)}</button>
              </div>` : ''}
            ${isAdmin ? `
              <div class="toolbar-actions-group">
                <button class="btn btn-primary btn-icon" onclick="app.openAddMusicModal()" title="Tambah Musik" aria-label="Tambah Musik">${getIcon('plus', 'ui-icon-btn', 16)}</button>
                <button class="btn btn-secondary btn-icon" onclick="app.openImportModal('music')" title="Import Data" aria-label="Import Data">${getIcon('upload', 'ui-icon-btn', 16)}</button>
                <button class="btn btn-secondary btn-icon" onclick="app.openExportModal('music')" title="Ekspor Data" aria-label="Ekspor Data">${getIcon('download', 'ui-icon-btn', 16)}</button>
              </div>` : ''}
          </div>
        </div>
        ${contentHtml}
        ${footerHtml}
      </div>`;
  },

  setMusicTab(tab) {
    this.state.music.subTab = tab;
    this.state.music.favorite = tab === 'favorite' ? '1' : 'ALL';
    this.state.music.page = 1;
    this.renderMusic(document.getElementById('view-container'));
  },

  filterMusicByAlbum(album) {
    this.state.music.subTab = 'all';
    this.state.music.favorite = 'ALL';
    this.state.music.q = album;
    this.state.music.page = 1;
    this.renderMusic(document.getElementById('view-container'));
  },

  filterMusicByArtist(artist) {
    this.state.music.subTab = 'all';
    this.state.music.favorite = 'ALL';
    this.state.music.q = artist;
    this.state.music.page = 1;
    this.renderMusic(document.getElementById('view-container'));
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

  sortMusic(col) { this.sortCatalog('music', col); },
  changeMusicPage(newPage) { this.changePage('music', newPage); },

  async toggleMusicFavorite(id) {
    try {
      const res = await api.patch(`/api/music/${id}/toggle-favorite`);
      showToast(res.is_favorite === 1 ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', 'success');
      this.renderMusic(document.getElementById('view-container'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  openAddMusicModal() { this.openMusicModal(null); },

  async openEditMusicModal(id) {
    try {
      const item = await api.get(`/api/music/${id}`);
      this.openMusicModal(item);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async openMusicModal(item = null) {
    const isEdit = !!item;
    const m = item || {
      title: '', artist: '', album: '', year: '', genre: '',
      platform: 'Spotify', size_mb: '', rating: '', is_favorite: 0, notes: '', cover_url: ''
    };

    let customGenres = [];
    try {
      const gnRes = await api.get('/api/taxonomy/genres?media_type=music');
      if (Array.isArray(gnRes) && gnRes.length) customGenres = gnRes;
    } catch (_) {}

    const modalId = 'modal-music-form';
    this.createModal(modalId, isEdit ? 'Edit Trek Musik' : 'Tambah Trek Musik', `
      <form id="form-music" onsubmit="app.handleMusicSubmit(event, ${isEdit ? m.id : 'null'})">
        ${this.renderMetaFetchBar('music', m.title)}
        
        <div class="form-row-2-1">
          <div class="form-group">
            <label class="form-label">Judul Trek / Album *</label>
            <input type="text" class="form-input" name="title" required value="${escapeHtml(m.title)}" placeholder="Bohemian Rhapsody">
          </div>
          <div class="form-group">
            <label class="form-label">Tahun Rilis</label>
            <input type="number" class="form-input" name="year" value="${m.year || ''}" placeholder="1975">
          </div>
        </div>

        ${this.renderCoverUploadField(m.cover_url, 'Gambar Cover Album / Lagu')}

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

        ${this.renderGenreSelector(m.genre, 'music', customGenres)}

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

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Link Download / Halaman Akses Trek Musik</label>
            <input type="url" class="form-input" name="download_url" value="${escapeHtml(m.download_url || '')}" placeholder="https://... tautan unduh / stream">
          </div>
          <div class="form-group" style="display:flex; flex-direction:column; justify-content:flex-end;">
            <label class="form-checkbox-card">
              <input type="checkbox" name="is_favorite" value="1" ${m.is_favorite === 1 ? 'checked' : ''}>
              <div class="form-checkbox-label">
                <strong>Tandai Favorit</strong>
                <span>Koleksi musik pilihan utama</span>
              </div>
            </label>
          </div>
        </div>

        <div class="modal-actions-footer">
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
      notes: form.notes.value,
      download_url: form.download_url?.value?.trim() || ''
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
      const c = document.getElementById('view-container');
      const tab = this.state.currentTab;
      if (tab === 'dashboard') this.renderDashboard(c);
      else if (tab === 'music') this.renderMusic(c);
      else this.renderLanding(c);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteMusic(id, title) {
    showConfirmModal({
      title: 'Hapus Koleksi Musik',
      message: `Yakin ingin menghapus musik "<strong>${escapeHtml(title)}</strong>"?`,
      subtext: 'Data trek audio atau album ini akan dihapus permanen dari pustaka SaumaBox.',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        api.delete(`/api/music/${id}`).then(() => {
          showToast('Musik berhasil dihapus', 'success');
          const c = document.getElementById('view-container');
          if (this.state.currentTab === 'dashboard') this.renderDashboard(c);
          else this.renderMusic(c);
        }).catch(err => showToast(err.message, 'error'));
      }
    });
  }
});
