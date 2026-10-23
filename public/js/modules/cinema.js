// ============================================================
// SaumaBox — Cinema Catalog & Form Module
// ============================================================

Object.assign(app, {
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
        <button class="quick-check-btn ${isWatched ? 'active' : ''}" onclick="app.toggleCinemaWatched(${c.id})" title="${isWatched ? 'Sudah ditonton' : 'Belum ditonton'}" aria-label="${isWatched ? 'Sudah ditonton' : 'Belum ditonton'}">
          ${isWatched ? getIcon('check', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
        </button>
      ` : (isWatched ? `<span class="badge badge-success">${getIcon('check', 'ui-icon', 12)} Ditonton</span>` : '<span class="badge badge-neutral">Belum</span>');

      const actionButtons = isAdmin ? `
        <div style="display:inline-flex; gap:4px;">
          <button class="btn btn-secondary btn-sm" onclick="app.openEditCinemaModal(${c.id})" title="Edit" aria-label="Edit ${escapeHtml(c.title)}">${getIcon('edit', 'ui-icon', 14)}</button>
          <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteCinema(${c.id}, '${escapeHtml(c.title)}')" title="Hapus" aria-label="Hapus ${escapeHtml(c.title)}">${getIcon('trash', 'ui-icon', 14)}</button>
        </div>
      ` : '';

      const itemCode = typeof formatItemCode === 'function' ? formatItemCode('cinema', c.id) : `C-${String(c.id).padStart(3, '0')}`;

      return `
        <tr>
          <td class="font-mono td-center" style="color:var(--text-muted); width:32px;">${rowNum}</td>
          <td class="td-center" style="width:36px;">${checkbox}</td>
          <td class="cell-nowrap" style="width:68px;"><span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span></td>
          <td style="width:52px;"><span class="badge badge-neutral">${c.type}</span></td>
          <td>
            <strong>${escapeHtml(c.title)}</strong>
            ${c.genre ? `<div class="cell-sub">${escapeHtml(c.genre)}</div>` : ''}
          </td>
          <td class="font-mono cell-nowrap">${formatRating(c.rating)}</td>
          <td class="font-mono cell-nowrap">
            <div>${c.year || '-'}</div>
            ${c.age_rating ? `<div class="cell-sub"><span class="badge badge-neutral" style="font-size:0.65rem; padding:1px 4px;">${escapeHtml(c.age_rating)}</span></div>` : ''}
          </td>
          <td>
            <div>${escapeHtml(c.studio || '-')}</div>
            ${c.country ? `<div class="cell-sub">${escapeHtml(c.country)}</div>` : ''}
          </td>
          <td class="font-mono cell-nowrap">${c.total_episodes ? c.total_episodes + ' Ep' : (c.total_seasons ? c.total_seasons + ' S' : '-')}</td>
          <td class="td-center cell-nowrap">${c.download_url ? `<a href="${escapeHtml(c.download_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Akses Halaman Download / Tonton" style="display:inline-flex; align-items:center; gap:3px; text-decoration:none;">${getIcon('download', 'ui-icon', 12)} Unduh</a>` : '<span style="color:var(--text-muted); font-size:0.8rem;">-</span>'}</td>
          ${isAdmin ? `<td class="td-right cell-nowrap">${actionButtons}</td>` : ''}
        </tr>
      `;
    }).join('');

    const gridCards = res.items.map(c => {
      const isWatched = c.watched === 1;
      const coverSrc = c.cover_url || '/images/covers/breaking_bad.jpg';
      const itemCode = typeof formatItemCode === 'function' ? formatItemCode('cinema', c.id) : `C-${String(c.id).padStart(3, '0')}`;

      const adminActions = isAdmin ? `
        <div class="ps-actions" onclick="event.stopPropagation()">
          <button class="btn btn-secondary btn-sm" onclick="app.openEditCinemaModal(${c.id})" title="Edit" aria-label="Edit">${getIcon('edit', 'ui-icon', 14)}</button>
          <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteCinema(${c.id}, '${escapeHtml(c.title)}')" title="Hapus" aria-label="Hapus">${getIcon('trash', 'ui-icon', 14)}</button>
        </div>
      ` : '';

      const quickWatchBtn = isAdmin ? `
        <button class="ps-heart-btn ${isWatched ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleCinemaWatched(${c.id})" title="${isWatched ? 'Tandai belum ditonton' : 'Tandai sudah ditonton'}" aria-label="${isWatched ? 'Tandai belum ditonton' : 'Tandai sudah ditonton'}">
          ${isWatched ? getIcon('check', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
        </button>
      ` : (isWatched ? '<span class="badge badge-success" style="backdrop-filter:blur(4px); box-shadow:0 2px 6px rgba(0,0,0,0.4);">Ditonton</span>' : '');

      return `
        <article class="ps-card" onclick="app.openMediaDetail('cinema', ${c.id})" tabindex="0" onkeydown="if(event.key==='Enter')app.openMediaDetail('cinema', ${c.id})">
          <div class="ps-card-media cinema-aspect">
            <div class="ps-overlay-top">
              <div class="ps-overlay-badges-left">
                <span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span>
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
      const itemCode = typeof formatItemCode === 'function' ? formatItemCode('cinema', c.id) : `C-${String(c.id).padStart(3, '0')}`;
      return `
        <div class="mobile-data-card">
          <div class="mobile-card-row">
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <span class="badge badge-item-id font-mono" onclick="copyItemCode('${itemCode}', event)" title="Klik untuk salin ID unik">${itemCode}</span>
              <span class="badge badge-neutral">${c.type}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="font-mono">${formatRating(c.rating)}</span>
              ${isAdmin ? `
                <button class="quick-check-btn ${isWatched ? 'active' : ''}" onclick="app.toggleCinemaWatched(${c.id})" aria-label="${isWatched ? 'Sudah ditonton' : 'Belum ditonton'}">
                  ${isWatched ? getIcon('check', 'ui-icon', 14) : '<span class="quick-check-empty"></span>'}
                </button>
              ` : (isWatched ? `<span class="badge badge-success">${getIcon('check', 'ui-icon', 12)}</span>` : '<span class="badge badge-neutral">-</span>')}
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
              <button class="btn btn-secondary btn-sm" onclick="app.openEditCinemaModal(${c.id})">${getIcon('edit', 'ui-icon-btn', 13)} Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteCinema(${c.id}, '${escapeHtml(c.title)}')">${getIcon('trash', 'ui-icon-btn', 13)} Hapus</button>
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

            <div class="toolbar-filters-row">
              <select class="filter-select" id="filter-cinema-watched" onchange="app.setCinemaWatched(this.value)">
                <option value="ALL" ${watched === 'ALL' ? 'selected' : ''}>Status Tontonan (Semua)</option>
                <option value="1" ${watched === '1' ? 'selected' : ''}>Sudah Ditonton</option>
                <option value="0" ${watched === '0' ? 'selected' : ''}>Belum Ditonton</option>
              </select>

              <select class="filter-select" id="filter-cinema-genre" onchange="app.setCinemaGenre(this.value)">
                ${genreOpts}
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <div class="view-toggle-group" role="group" aria-label="Pilihan Tampilan">
              <button class="view-toggle-btn ${this.state.cinema.viewMode === 'grid' ? 'active' : ''}" onclick="app.setCatalogViewMode('cinema', 'grid')" title="Tampilan Grid Poster" aria-label="Tampilan Grid">${getIcon('grid', 'ui-icon', 16)}</button>
              <button class="view-toggle-btn ${this.state.cinema.viewMode === 'table' ? 'active' : ''}" onclick="app.setCatalogViewMode('cinema', 'table')" title="Tampilan Tabel Spreadsheet" aria-label="Tampilan Tabel">${getIcon('table', 'ui-icon', 16)}</button>
            </div>

            ${isAdmin ? `
              <div class="toolbar-actions-group">
                <button class="btn btn-primary btn-icon" onclick="app.openAddCinemaModal()" title="Tambah Cinema" aria-label="Tambah Cinema">${getIcon('plus', 'ui-icon-btn', 16)}</button>
                <button class="btn btn-secondary btn-icon" onclick="app.openImportModal('cinema')" title="Import Data" aria-label="Import Data">${getIcon('upload', 'ui-icon-btn', 16)}</button>
                <button class="btn btn-secondary btn-icon" onclick="app.openExportModal('cinema')" title="Ekspor Data" aria-label="Ekspor Data">${getIcon('download', 'ui-icon-btn', 16)}</button>
              </div>
            ` : ''}
          </div>
        </div>

        ${this.state.cinema.viewMode === 'grid' ? `
          <div class="catalog-grid">
            ${gridCards || `<div class="state-container" style="grid-column:1/-1;"><div class="state-icon">${getIcon('cinema', 'ui-icon', 40)}</div><div class="state-title">Tidak ada tayangan ditemukan</div><div class="state-desc">Coba sesuaikan kata kunci pencarian atau filter tipe/genre Anda.</div></div>`}
          </div>
        ` : `
          <div class="table-responsive data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-center" style="width:32px;">#</th>
                  <th class="th-center" style="width:36px;">Status</th>
                  <th style="width:68px;">ID Unik</th>
                  <th style="width:52px;">Tipe</th>
                  <th class="sortable ${this.state.cinema.sortBy === 'title' ? 'sorted' : ''}" onclick="app.sortCatalog('cinema', 'title')">Judul &amp; Genre <span class="sort-indicator">${this.state.cinema.sortBy === 'title' ? (this.state.cinema.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th class="sortable ${this.state.cinema.sortBy === 'rating' ? 'sorted' : ''}" onclick="app.sortCatalog('cinema', 'rating')">Rating IMDb <span class="sort-indicator">${this.state.cinema.sortBy === 'rating' ? (this.state.cinema.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th class="sortable ${this.state.cinema.sortBy === 'year' ? 'sorted' : ''}" onclick="app.sortCatalog('cinema', 'year')">Tahun &amp; Usia <span class="sort-indicator">${this.state.cinema.sortBy === 'year' ? (this.state.cinema.sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span></th>
                  <th>Studio &amp; Negara</th>
                  <th>Ep / Season</th>
                  <th class="th-center">Unduh</th>
                  ${isAdmin ? '<th class="th-right">Aksi</th>' : ''}
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
          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <div class="table-page-size-wrap">
              <span>Tampilkan:</span>
              <select class="filter-select page-size-select" onchange="app.changeLimit('cinema', this.value)" aria-label="Jumlah baris data">
                ${[10, 25, 50, 100].map(n => `<option value="${n}" ${limit === n ? 'selected' : ''}>${n} data</option>`).join('')}
              </select>
            </div>
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              Gunakan tombol status untuk menandai tontonan yang telah selesai.
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">
              Menampilkan <strong>${res.pagination.total > 0 ? (page - 1) * limit + 1 : 0}-${Math.min(page * limit, res.pagination.total)}</strong> dari total <strong>${res.pagination.total}</strong> tayangan
            </span>
            <div class="pagination">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="app.changePage('cinema', ${page - 1})">◀</button>
              <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${page} dari ${this.state.cinema.totalPages}</span>
              <button class="page-btn" ${page >= this.state.cinema.totalPages ? 'disabled' : ''} onclick="app.changePage('cinema', ${page + 1})">▶</button>
            </div>
          </div>
        </div>
      </div>
    `;
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

  async toggleCinemaWatched(id) {
    try {
      const res = await api.patch(`/api/cinema/${id}/toggle-watched`);
      showToast(res.watched === 1 ? 'Ditandai sudah ditonton' : 'Ditandai belum ditonton', 'success');
      this.renderCinema(document.getElementById('view-container'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

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

  async openCinemaModal(item = null) {
    const isEdit = !!item;
    const c = item || {
      type: 'MOVIE', title: '', rating: '', year: '', country: 'Indonesia',
      studio: '', genre: '', age_rating: 'SU (Semua Umur)', total_episodes: '',
      total_seasons: '', watched: 0, cover_url: ''
    };

    let customGenres = [];
    try {
      const gnRes = await api.get('/api/taxonomy/genres?media_type=cinema');
      if (Array.isArray(gnRes) && gnRes.length) customGenres = gnRes;
    } catch (_) {}

    const modalId = 'modal-cinema-form';
    this.createModal(modalId, isEdit ? 'Edit Tayangan' : 'Tambah Tayangan Baru', `
      <form id="form-cinema" onsubmit="app.handleCinemaSubmit(event, ${isEdit ? c.id : 'null'})">
        ${this.renderMetaFetchBar('cinema', c.title)}
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

        ${this.renderCoverUploadField(c.cover_url, 'Gambar Poster Tayangan')}

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

        ${this.renderGenreSelector(c.genre, 'cinema', customGenres)}

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
          <label class="form-label">Link Download / Halaman Akses Video</label>
          <input type="url" class="form-input" name="download_url" value="${escapeHtml(c.download_url || '')}" placeholder="https://... tautan unduh / tonton">
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
      watched: form.watched.checked ? 1 : 0,
      download_url: form.download_url?.value?.trim() || ''
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
      const c = document.getElementById('view-container');
      const tab = this.state.currentTab;
      if (tab === 'dashboard') this.renderDashboard(c);
      else if (tab === 'cinema') this.renderCinema(c);
      else this.renderLanding(c);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  confirmDeleteCinema(id, title) {
    showConfirmModal({
      title: 'Hapus Tayangan Cinema',
      message: `Yakin ingin menghapus tayangan "<strong>${escapeHtml(title)}</strong>"?`,
      subtext: 'Data tayangan film/serial ini akan dihapus permanen dari pustaka SaumaBox.',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        api.delete(`/api/cinema/${id}`).then(() => {
          showToast('Tayangan berhasil dihapus', 'success');
          const c = document.getElementById('view-container');
          if (this.state.currentTab === 'dashboard') this.renderDashboard(c);
          else this.renderCinema(c);
        }).catch(err => showToast(err.message, 'error'));
      }
    });
  }
});
