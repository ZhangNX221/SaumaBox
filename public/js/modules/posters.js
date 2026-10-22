// ============================================================
// SaumaBox — Poster & Album Manager Module
// ============================================================

Object.assign(app, {
  async renderPostersTab(content) {
    const s = this.state.taxonomy = this.state.taxonomy || { subTab: 'posters', q: '', posterDomain: 'all', sortBy: 'updated_at', sortOrder: 'desc', page: 1, limit: 12 };
    const { q, limit = 12, page = 1 } = s;
    const curDomain = s.posterDomain || 'all';

    content.innerHTML = getLoadingHtml('Memuat galeri poster...', 'Memindai berkas poster dan album');

    let posters = [];
    try {
      posters = await api.get('/api/taxonomy/posters', { q, domain: curDomain });
    } catch (err) {
      content.innerHTML = `<div class="state-container"><div class="state-icon">⚠️</div><div class="state-title">Gagal memuat poster</div><div class="state-desc">${escapeHtml(err.message)}</div></div>`;
      return;
    }

    const total = posters.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const curPage = Math.min(Math.max(1, page), totalPages);
    s.page = curPage;
    const paged = posters.slice((curPage - 1) * limit, curPage * limit);

    const filterBar = `
      <div class="poster-filter-bar">
        <div class="poster-filter-pills">
          <button class="poster-pill-btn ${curDomain === 'all' ? 'active' : ''}" onclick="app.setPosterDomainFilter('all')">Semua (${total})</button>
          <button class="poster-pill-btn ${curDomain === 'games' ? 'active' : ''}" onclick="app.setPosterDomainFilter('games')">🎮 Game</button>
          <button class="poster-pill-btn ${curDomain === 'cinema' ? 'active' : ''}" onclick="app.setPosterDomainFilter('cinema')">🎬 Cinema</button>
          <button class="poster-pill-btn ${curDomain === 'music' ? 'active' : ''}" onclick="app.setPosterDomainFilter('music')">🎵 Musik</button>
          <button class="poster-pill-btn ${curDomain === 'unlinked' ? 'active' : ''}" onclick="app.setPosterDomainFilter('unlinked')">📁 Belum Ditautkan</button>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="text" class="form-input" style="padding:6px 12px; font-size:0.85rem; width:220px;" placeholder="Cari poster..." value="${escapeHtml(q)}" onkeyup="if(event.key==='Enter'){app.state.taxonomy.q=this.value; app.state.taxonomy.page=1; app.loadTaxonomyData();}">
        </div>
      </div>
    `;

    const cards = paged.map(p => {
      const hasLink = p.links && p.links.length > 0;
      const linkLabel = hasLink ? p.links.map(l => `${l.typeName}: ${l.title}`).join(', ') : 'Belum ditautkan';
      return `
        <div class="poster-admin-card">
          <div class="poster-thumb-wrap">
            <img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.filename)}" class="poster-thumb-img" loading="lazy" onerror="this.src='/images/logo-icon.png'">
            <span class="poster-badge-format">${p.ext}</span>
            <span class="poster-badge-size">${p.size_formatted}</span>
          </div>
          <div class="poster-info">
            <div class="poster-filename" title="${escapeHtml(p.filename)}">${escapeHtml(p.filename)}</div>
            <div class="poster-link-status ${hasLink ? 'linked' : ''}" title="${escapeHtml(linkLabel)}">
              ${hasLink ? getIcon('check', 'ui-icon', 12) : getIcon('info', 'ui-icon', 12)}
              <span>${escapeHtml(linkLabel)}</span>
            </div>
            <div class="poster-actions">
              <button class="btn btn-secondary btn-sm" onclick="app.openLinkPosterModal('${escapeHtml(p.filename)}')" title="Tautkan ke Media">${getIcon('link', 'ui-icon', 12)} Tautkan</button>
              <button class="btn btn-secondary btn-sm btn-icon-sm" onclick="app.copyPosterPath('${escapeHtml(p.url)}')" title="Salin Path">${getIcon('copy', 'ui-icon', 12)}</button>
              <a href="${escapeHtml(p.url)}" download="${escapeHtml(p.filename)}" class="btn btn-secondary btn-sm btn-icon-sm" title="Unduh File">${getIcon('download', 'ui-icon', 12)}</a>
              <button class="btn btn-secondary btn-sm btn-icon-sm" onclick="app.confirmDeletePoster('${escapeHtml(p.filename)}')" title="Hapus Poster">${getIcon('trash', 'ui-icon', 12)}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const footer = `
      <div class="table-footer">
        <div class="table-page-size-wrap">
          <span>Tampilkan:</span>
          <select class="filter-select page-size-select" onchange="app.changeTaxonomyLimit(this.value)" aria-label="Jumlah poster">
            ${[12, 24, 48, 96].map(n => `<option value="${n}" ${limit === n ? 'selected' : ''}>${n} poster</option>`).join('')}
          </select>
        </div>
        <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <span style="font-size:0.85rem; color:var(--text-secondary);">
            Menampilkan <strong>${total > 0 ? (curPage - 1) * limit + 1 : 0}-${Math.min(curPage * limit, total)}</strong> dari total <strong>${total}</strong> berkas poster
          </span>
          <div class="pagination">
            <button class="page-btn" ${curPage <= 1 ? 'disabled' : ''} onclick="app.changeTaxonomyPage(${curPage - 1})">◀</button>
            <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${curPage} dari ${totalPages}</span>
            <button class="page-btn" ${curPage >= totalPages ? 'disabled' : ''} onclick="app.changeTaxonomyPage(${curPage + 1})">▶</button>
          </div>
        </div>
      </div>
    `;

    content.innerHTML = `
      ${filterBar}
      ${cards ? `<div class="poster-gallery-grid">${cards}</div>` : `<div class="state-container" style="padding:40px 16px;"><div class="state-icon">🖼️</div><div class="state-title">Tidak ada berkas poster yang cocok.</div><div class="state-desc" style="color:var(--text-secondary); font-size:0.85rem; margin-top:4px;">Gunakan tombol "Import Poster" untuk mengunggah poster baru.</div></div>`}
      ${footer}
    `;
  },

  setPosterDomainFilter(domain) {
    if (!this.state.taxonomy) return;
    this.state.taxonomy.posterDomain = domain;
    this.state.taxonomy.page = 1;
    this.loadTaxonomyData();
  },

  copyPosterPath(url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Path poster disalin ke clipboard!', 'success');
      }).catch(() => prompt('Salin path gambar:', url));
    } else {
      prompt('Salin path gambar:', url);
    }
  },

  exportPostersZip() {
    showToast('Menyiapkan arsip ZIP poster...', 'info');
    window.location.href = '/api/taxonomy/posters/export-zip';
  },

  confirmDeletePoster(filename) {
    showConfirmModal({
      title: 'Hapus Berkas Poster',
      message: `Hapus berkas poster "<strong>${escapeHtml(filename)}</strong>" secara permanen?`,
      subtext: 'Berkas gambar ini akan dihapus dari penyimpanan server dan tidak dapat dipulihkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        api.delete(`/api/taxonomy/posters/${encodeURIComponent(filename)}`).then(() => {
          showToast('Berkas poster berhasil dihapus', 'success');
          this.loadTaxonomyData();
        }).catch(err => showToast(err.message, 'error'));
      }
    });
  },

  async openImportPosterModal() {
    let candidates = { games: [], cinema: [], music: [] };
    try { candidates = await api.get('/api/taxonomy/media-candidates'); } catch (_) {}

    const gameOpts = (candidates.games || []).map(g => `<option value="games:${g.id}">[Game] ${escapeHtml(g.title)}</option>`).join('');
    const cinemaOpts = (candidates.cinema || []).map(c => `<option value="cinema:${c.id}">[Cinema] ${escapeHtml(c.title)}</option>`).join('');
    const musicOpts = (candidates.music || []).map(m => `<option value="music:${m.id}">[Musik] ${escapeHtml(m.title)}</option>`).join('');

    this.createModal('modal-import-poster', 'Import Gambar Poster / Sampul', `
      <form onsubmit="app.handleUploadPoster(event)">
        <div class="form-group">
          <label class="form-label">Pilih Berkas Gambar Poster *</label>
          <input type="file" class="form-input" name="poster" accept=".jpg,.jpeg,.png,.webp,.svg,.gif" required onchange="app.previewImportPoster(event)">
          <span style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px; display:block;">Format: JPG, PNG, WebP, SVG (Maks. 25MB)</span>
        </div>
        <div id="import-poster-preview-wrap" style="display:none; margin-bottom:14px; text-align:center;">
          <img id="import-poster-preview-img" src="" alt="Pratinjau" style="max-height:160px; max-width:100%; border-radius:var(--radius-card); border:1px solid var(--border-color); object-fit:contain;">
        </div>
        <div class="form-group">
          <label class="form-label">Tautkan ke Media (Opsional)</label>
          <select class="form-select" name="target_media">
            <option value="">-- Simpan ke penyimpanan saja (Tanpa tautan) --</option>
            <optgroup label="🎮 Katalog Game">${gameOpts}</optgroup>
            <optgroup label="🎬 Katalog Cinema">${cinemaOpts}</optgroup>
            <optgroup label="🎵 Katalog Musik">${musicOpts}</optgroup>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-import-poster')">Batal</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-import">${getIcon('upload', 'ui-icon-btn', 14)} <span>Unggah Poster</span></button>
        </div>
      </form>
    `);
  },

  previewImportPoster(e) {
    const file = e.target.files[0];
    const previewWrap = document.getElementById('import-poster-preview-wrap');
    const previewImg = document.getElementById('import-poster-preview-img');
    if (file && previewWrap && previewImg) {
      previewImg.src = URL.createObjectURL(file);
      previewWrap.style.display = 'block';
    }
  },

  async handleUploadPoster(e) {
    e.preventDefault();
    const form = e.target;
    const file = form.poster.files[0];
    if (!file) return showToast('Pilih berkas poster terlebih dahulu.', 'error');
    const submitBtn = document.getElementById('btn-submit-import');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Mengunggah...'; }

    const formData = new FormData();
    formData.append('poster', file);
    const target = form.target_media.value;
    if (target) {
      const [target_domain, target_id] = target.split(':');
      formData.append('target_domain', target_domain);
      formData.append('target_id', target_id);
    }

    try {
      await api.upload('/api/taxonomy/posters/upload', formData);
      showToast('Poster berhasil diunggah!', 'success');
      this.closeModal('modal-import-poster');
      this.loadTaxonomyData();
    } catch (err) {
      showToast(err.message || 'Gagal mengunggah poster.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${getIcon('upload', 'ui-icon-btn', 14)} <span>Unggah Poster</span>`;
      }
    }
  },

  async openLinkPosterModal(filename) {
    let candidates = { games: [], cinema: [], music: [] };
    try { candidates = await api.get('/api/taxonomy/media-candidates'); } catch (_) {}

    const gameOpts = (candidates.games || []).map(g => `<option value="games:${g.id}">[Game] ${escapeHtml(g.title)}</option>`).join('');
    const cinemaOpts = (candidates.cinema || []).map(c => `<option value="cinema:${c.id}">[Cinema] ${escapeHtml(c.title)}</option>`).join('');
    const musicOpts = (candidates.music || []).map(m => `<option value="music:${m.id}">[Musik] ${escapeHtml(m.title)}</option>`).join('');

    this.createModal('modal-link-poster', 'Tautkan Poster ke Media', `
      <form onsubmit="app.handleLinkPoster(event, '${escapeHtml(filename)}')">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px; padding:10px; background:var(--bg-surface-elevated); border-radius:var(--radius-card);">
          <img src="/images/covers/${escapeHtml(filename)}" alt="${escapeHtml(filename)}" style="width:48px; height:64px; object-fit:cover; border-radius:4px;">
          <div style="overflow:hidden;">
            <div style="font-weight:600; font-size:0.85rem; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(filename)}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">/images/covers/${escapeHtml(filename)}</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Pilih Item Media Target *</label>
          <select class="form-select" name="target_media" required>
            <option value="">-- Pilih Media untuk Menerapkan Cover Ini --</option>
            <optgroup label="🎮 Katalog Game">${gameOpts}</optgroup>
            <optgroup label="🎬 Katalog Cinema">${cinemaOpts}</optgroup>
            <optgroup label="🎵 Katalog Musik">${musicOpts}</optgroup>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-link-poster')">Batal</button>
          <button type="submit" class="btn btn-primary">${getIcon('link', 'ui-icon-btn', 14)} <span>Terapkan Tautan</span></button>
        </div>
      </form>
    `);
  },

  async handleLinkPoster(e, filename) {
    e.preventDefault();
    const target = e.target.target_media.value;
    if (!target) return showToast('Pilih item media tujuan.', 'error');
    const [target_domain, target_id] = target.split(':');

    try {
      await api.post('/api/taxonomy/posters/link', { filename, target_domain, target_id });
      showToast('Poster berhasil ditautkan ke media!', 'success');
      this.closeModal('modal-link-poster');
      this.loadTaxonomyData();
    } catch (err) {
      showToast(err.message || 'Gagal menautkan poster.', 'error');
    }
  }
});
