// ============================================================
// SaumaBox — Poster & Album Manager Module
// ============================================================

Object.assign(app, {
  async renderPostersTab(content) {
    const s = this.state.taxonomy = this.state.taxonomy || { subTab: 'posters', q: '', posterDomain: 'all', sortBy: 'updated_at', sortOrder: 'desc', page: 1, limit: 12 };
    s.selectedPosters = s.selectedPosters || [];
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

    const selectionBanner = s.selectedPosters.length > 0 ? `
      <div class="poster-selection-banner" style="display:flex; align-items:center; justify-content:space-between; background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:10px; padding:8px 14px; margin-bottom:14px; font-size:0.82rem;">
        <span style="color:var(--accent-color); font-weight:600; display:inline-flex; align-items:center; gap:6px;">
          ${getIcon('check', 'ui-icon', 14)} <span><strong>${s.selectedPosters.length}</strong> poster dipilih</span>
        </span>
        <button type="button" class="btn btn-ghost btn-xs" onclick="app.clearPosterSelection()" style="color:var(--text-secondary); padding:2px 8px; font-size:0.75rem;">
          ${getIcon('close', 'ui-icon', 12)} <span>Batalkan Seleksi</span>
        </button>
      </div>
    ` : '';

    const cards = paged.map(p => {
      const hasLink = p.links && p.links.length > 0;
      const linkLabel = hasLink
        ? p.links.map(l => `${l.code ? `[${l.code}] ` : ''}${l.title}`).join(', ')
        : 'Belum ditautkan';
      const isSelected = s.selectedPosters.includes(p.filename);
      return `
        <div class="poster-admin-card ${isSelected ? 'selected' : ''}" id="poster-card-${encodeURIComponent(p.filename)}" onclick="app.toggleSelectPoster('${escapeHtml(p.filename)}')">
          <div class="poster-thumb-wrap">
            <label class="poster-select-box" onclick="event.stopPropagation();" title="Pilih poster ini" aria-label="Pilih poster ${escapeHtml(p.filename)}">
              <input type="checkbox" class="poster-checkbox-input" value="${escapeHtml(p.filename)}" ${isSelected ? 'checked' : ''} onchange="app.toggleSelectPoster('${escapeHtml(p.filename)}', this.checked)">
              <span class="poster-custom-checkbox">${getIcon('check', 'poster-check-icon', 12)}</span>
            </label>
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
            <div class="poster-actions" onclick="event.stopPropagation();">
              <button class="btn btn-secondary btn-sm btn-icon-sm" onclick="app.openLinkPosterModal('${escapeHtml(p.filename)}')" title="Tautkan ke Media" aria-label="Tautkan ke Media">${getIcon('link', 'ui-icon', 14)}</button>
              <button class="btn btn-secondary btn-sm btn-icon-sm" onclick="app.copyPosterPath('${escapeHtml(p.url)}')" title="Salin Path / URL" aria-label="Salin Path">${getIcon('copy', 'ui-icon', 14)}</button>
              <a href="${escapeHtml(p.url)}" download="${escapeHtml(p.filename)}" class="btn btn-secondary btn-sm btn-icon-sm" title="Download Berkas" aria-label="Download Berkas">${getIcon('download', 'ui-icon', 14)}</a>
              <button class="btn btn-secondary btn-sm btn-icon-sm btn-trash" onclick="app.confirmDeletePoster('${escapeHtml(p.filename)}')" title="Hapus Poster" aria-label="Hapus Poster">${getIcon('trash', 'ui-icon', 14)}</button>
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
      ${selectionBanner}
      ${cards ? `<div class="poster-gallery-grid">${cards}</div>` : `<div class="state-container" style="padding:40px 16px;"><div class="state-icon">🖼️</div><div class="state-title">Tidak ada berkas poster yang cocok.</div><div class="state-desc" style="color:var(--text-secondary); font-size:0.85rem; margin-top:4px;">Gunakan tombol "Import Poster" untuk mengunggah poster baru.</div></div>`}
      ${footer}
    `;

    // Sinkronisasi filter dropdown di toolbar jika ada
    const sel = document.getElementById('filter-poster-domain');
    if (sel && sel.value !== curDomain) sel.value = curDomain;

    this.updatePostersToolbar();
  },

  isAllPostersSelectedOnPage() {
    const s = this.state.taxonomy || {};
    const selected = s.selectedPosters || [];
    const pagedCbs = document.querySelectorAll('.poster-checkbox-input');
    if (pagedCbs.length === 0) return false;
    return Array.from(pagedCbs).every(cb => selected.includes(cb.value));
  },

  toggleSelectAllCurrentPagePosters() {
    const isAll = this.isAllPostersSelectedOnPage();
    this.toggleSelectAllPosters(!isAll);
  },

  toggleSelectPoster(filename, forceState) {
    const s = this.state.taxonomy = this.state.taxonomy || {};
    s.selectedPosters = s.selectedPosters || [];
    const idx = s.selectedPosters.indexOf(filename);
    const shouldSelect = typeof forceState === 'boolean' ? forceState : idx === -1;

    if (shouldSelect && idx === -1) {
      s.selectedPosters.push(filename);
    } else if (!shouldSelect && idx !== -1) {
      s.selectedPosters.splice(idx, 1);
    }

    const card = document.getElementById(`poster-card-${encodeURIComponent(filename)}`);
    if (card) {
      card.classList.toggle('selected', shouldSelect);
      const cb = card.querySelector('.poster-checkbox-input');
      if (cb) cb.checked = shouldSelect;
    }

    const isAll = this.isAllPostersSelectedOnPage();
    const allCb = document.getElementById('poster-select-all-cb');
    if (allCb) allCb.checked = isAll;
    const allBtn = document.getElementById('btn-select-all-posters');
    if (allBtn) {
      allBtn.classList.toggle('btn-select-all-active', isAll);
      const span = allBtn.querySelector('span');
      if (span) span.textContent = isAll ? 'Batal Pilih' : 'Pilih Semua';
    }

    this.updatePostersToolbar();
  },

  toggleSelectAllPosters(isChecked) {
    const s = this.state.taxonomy = this.state.taxonomy || {};
    s.selectedPosters = s.selectedPosters || [];
    const pagedCbs = document.querySelectorAll('.poster-checkbox-input');

    pagedCbs.forEach(cb => {
      const fname = cb.value;
      cb.checked = isChecked;
      const idx = s.selectedPosters.indexOf(fname);
      if (isChecked && idx === -1) s.selectedPosters.push(fname);
      else if (!isChecked && idx !== -1) s.selectedPosters.splice(idx, 1);

      const card = document.getElementById(`poster-card-${encodeURIComponent(fname)}`);
      if (card) card.classList.toggle('selected', isChecked);
    });

    const allCb = document.getElementById('poster-select-all-cb');
    if (allCb) allCb.checked = isChecked;
    const allBtn = document.getElementById('btn-select-all-posters');
    if (allBtn) {
      allBtn.classList.toggle('btn-select-all-active', isChecked);
      const span = allBtn.querySelector('span');
      if (span) span.textContent = isChecked ? 'Batal Pilih' : 'Pilih Semua';
    }

    this.updatePostersToolbar();
  },

  clearPosterSelection() {
    const s = this.state.taxonomy = this.state.taxonomy || {};
    s.selectedPosters = [];
    document.querySelectorAll('.poster-admin-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.poster-checkbox-input').forEach(cb => cb.checked = false);
    const allCb = document.getElementById('poster-select-all-cb');
    if (allCb) allCb.checked = false;
    const allBtn = document.getElementById('btn-select-all-posters');
    if (allBtn) {
      allBtn.classList.remove('btn-select-all-active');
      const span = allBtn.querySelector('span');
      if (span) span.textContent = 'Pilih Semua';
    }
    this.updatePostersToolbar();
  },

  downloadSelectedPosters() {
    const s = this.state.taxonomy || {};
    const selected = s.selectedPosters || [];
    if (selected.length === 0) {
      showToast('Pilih setidaknya satu poster untuk didownload', 'info');
      return;
    }

    if (selected.length === 1) {
      const filename = selected[0];
      const a = document.createElement('a');
      a.href = `/images/covers/${encodeURIComponent(filename)}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`Mengunduh berkas ${filename}`, 'success');
    } else {
      showToast(`Menyiapkan arsip ZIP untuk ${selected.length} poster terpilih...`, 'info');
      window.location.href = `/api/taxonomy/posters/export-zip?files=${encodeURIComponent(selected.join(','))}`;
    }
  },

  confirmDeleteSelectedPosters() {
    const s = this.state.taxonomy || {};
    const selected = s.selectedPosters || [];
    if (selected.length === 0) return;

    showConfirmModal({
      title: 'Hapus Poster Terpilih',
      message: `Hapus <strong>${selected.length} berkas poster</strong> yang dipilih secara permanen?`,
      subtext: 'Berkas gambar ini akan dihapus dari server dan tautan cover pada media terkait akan dibersihkan.',
      confirmText: `Ya, Hapus (${selected.length})`,
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.post('/api/taxonomy/posters/batch-delete', { filenames: selected });
          showToast(`${res.count || selected.length} berkas poster berhasil dihapus`, 'success');
          s.selectedPosters = [];
          this.loadTaxonomyData();
        } catch (err) {
          showToast('Gagal menghapus poster: ' + err.message, 'error');
        }
      }
    });
  },

  async compressAllPosters() {
    showToast('Memeriksa dan mengompresi poster...', 'info');
    try {
      const res = await api.post('/api/taxonomy/posters/compress-all');
      showToast(res.message || 'Kompresi selesai!', 'success');
      this.loadTaxonomyData();
    } catch (err) {
      showToast('Gagal mengompresi poster: ' + err.message, 'error');
    }
  },

  async compressSelectedPosters() {
    const s = this.state.taxonomy || {};
    const selected = s.selectedPosters || [];
    if (selected.length === 0) return;

    showToast(`Mengompresi ${selected.length} poster terpilih...`, 'info');
    try {
      const res = await api.post('/api/taxonomy/posters/compress-selected', { filenames: selected });
      showToast(res.message || 'Kompresi selesai!', 'success');
      s.selectedPosters = [];
      this.loadTaxonomyData();
    } catch (err) {
      showToast('Gagal mengompresi poster: ' + err.message, 'error');
    }
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

  findMediaCandidate(input) {
    if (!this._mediaCandidates || !input) return null;
    const str = String(input).trim();
    if (!str) return null;

    const parsed = typeof parseItemCode === 'function' ? parseItemCode(str) : null;
    const all = [
      ...(this._mediaCandidates.games || []).map(g => ({ ...g, domain: 'games', domainLabel: '🎮 Game', code: g.code || `G-${String(g.id).padStart(3, '0')}`, meta: [g.type, g.genre, g.year || g.release_date].filter(Boolean).join(' • ') })),
      ...(this._mediaCandidates.cinema || []).map(c => ({ ...c, domain: 'cinema', domainLabel: '🎬 Cinema', code: c.code || `C-${String(c.id).padStart(3, '0')}`, meta: [c.type, c.genre, c.year].filter(Boolean).join(' • ') })),
      ...(this._mediaCandidates.music || []).map(m => ({ ...m, domain: 'music', domainLabel: '🎵 Musik', code: m.code || `M-${String(m.id).padStart(3, '0')}`, meta: [m.artist, m.album, m.year].filter(Boolean).join(' • ') }))
    ];

    if (parsed) {
      const match = all.find(item => {
        if (parsed.domain !== 'any' && item.domain !== parsed.domain) return false;
        return Number(item.id) === Number(parsed.id);
      });
      if (match) return match;
    }

    // Pencarian cadangan jika pengguna mengetik kode persis atau substring kode
    const upper = str.toUpperCase();
    const exactCodeMatch = all.find(item => item.code.toUpperCase() === upper);
    if (exactCodeMatch) return exactCodeMatch;

    return null;
  },

  onLinkPosterCodeInput(val) {
    const previewWrap = document.getElementById('link-poster-preview-card');
    const submitBtn = document.getElementById('btn-submit-link-poster');
    const helperSel = document.getElementById('link-poster-helper-select');
    if (!previewWrap) return;

    const trimmed = (val || '').trim();
    if (!trimmed) {
      previewWrap.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; color:var(--text-muted); font-size:0.85rem; width:100%; justify-content:center; padding:8px 0;">
          ${getIcon('info', 'ui-icon', 16)}
          <span>Ketik ID unik item (contoh: <strong style="color:var(--text-primary);">G-001</strong>, <strong style="color:var(--text-primary);">C-002</strong>, <strong style="color:var(--text-primary);">M-003</strong>) untuk mendeteksi media.</span>
        </div>`;
      if (submitBtn) submitBtn.disabled = true;
      if (helperSel) helperSel.value = '';
      return;
    }

    const item = this.findMediaCandidate(trimmed);
    if (item) {
      const coverSrc = item.cover_url || (item.domain === 'games' ? '/images/covers/cyberpunk2077.svg' : item.domain === 'cinema' ? '/images/covers/breaking_bad.jpg' : '/images/covers/bohemian_rhapsody.jpg');
      previewWrap.innerHTML = `
        <img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(item.title)}" style="width:44px; height:58px; object-fit:cover; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0;" onerror="this.src='/images/logo-icon.png'">
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px; flex-wrap:wrap;">
            <span class="badge badge-item-id font-mono" style="font-size:0.75rem;">${escapeHtml(item.code)}</span>
            <span class="badge badge-neutral" style="font-size:0.7rem;">${escapeHtml(item.domainLabel)}</span>
            <span style="font-size:0.75rem; color:var(--badge-success-text); font-weight:700; display:inline-flex; align-items:center; gap:3px;">
              ${getIcon('check', 'ui-icon', 12)} Media Terdeteksi
            </span>
          </div>
          <div style="font-weight:700; font-size:0.92rem; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(item.meta || '')}</div>
        </div>
      `;
      if (submitBtn) submitBtn.disabled = false;
      if (helperSel) {
        helperSel.value = `${item.domain}:${item.id}`;
      }
    } else {
      previewWrap.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; color:var(--badge-danger-text); font-size:0.85rem; width:100%; justify-content:center; padding:8px 0;">
          ${getIcon('alert', 'ui-icon', 16)}
          <span>ID "<strong>${escapeHtml(trimmed)}</strong>" tidak ditemukan. Pastikan format diawali <strong class="font-mono">G-</strong> (Game), <strong class="font-mono">C-</strong> (Cinema), atau <strong class="font-mono">M-</strong> (Musik).</span>
        </div>`;
      if (submitBtn) submitBtn.disabled = true;
    }
  },

  toggleLinkPosterHelperDropdown() {
    const wrap = document.getElementById('link-poster-helper-wrap');
    if (wrap) {
      const isHidden = wrap.style.display === 'none';
      wrap.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        const sel = document.getElementById('link-poster-helper-select');
        if (sel) sel.focus();
      }
    }
  },

  onLinkPosterHelperSelect(val) {
    if (!val) return;
    const [domain, id] = val.split(':');
    const input = document.getElementById('link-poster-code-input');
    const code = typeof formatItemCode === 'function' ? formatItemCode(domain, id) : `${domain.charAt(0).toUpperCase()}-${String(id).padStart(3, '0')}`;
    if (input) {
      input.value = code;
      this.onLinkPosterCodeInput(code);
    }
  },

  onImportPosterCodeInput(val) {
    const previewEl = document.getElementById('import-poster-target-preview');
    if (!previewEl) return;
    const trimmed = (val || '').trim();
    if (!trimmed) {
      previewEl.innerHTML = '';
      return;
    }
    const item = this.findMediaCandidate(trimmed);
    if (item) {
      previewEl.innerHTML = `<span style="color:var(--badge-success-text); font-weight:600;">✓ Ditautkan ke: [${escapeHtml(item.code)}] ${escapeHtml(item.title)} (${escapeHtml(item.domainLabel)})</span>`;
    } else {
      previewEl.innerHTML = `<span style="color:var(--badge-danger-text);">ID "${escapeHtml(trimmed)}" tidak ditemukan.</span>`;
    }
  },

  async openImportPosterModal() {
    let candidates = { games: [], cinema: [], music: [] };
    try { candidates = await api.get('/api/taxonomy/media-candidates'); } catch (_) {}
    this._mediaCandidates = candidates;

    const gameOpts = (candidates.games || []).map(g => `<option value="${g.code || `G-${String(g.id).padStart(3, '0')}`}">[${g.code || `G-${String(g.id).padStart(3, '0')}`}] ${escapeHtml(g.title)}</option>`).join('');
    const cinemaOpts = (candidates.cinema || []).map(c => `<option value="${c.code || `C-${String(c.id).padStart(3, '0')}`}">[${c.code || `C-${String(c.id).padStart(3, '0')}`}] ${escapeHtml(c.title)}</option>`).join('');
    const musicOpts = (candidates.music || []).map(m => `<option value="${m.code || `M-${String(m.id).padStart(3, '0')}`}">[${m.code || `M-${String(m.id).padStart(3, '0')}`}] ${escapeHtml(m.title)}</option>`).join('');

    this.createModal('modal-import-poster', 'Import Gambar Poster / Sampul', `
      <form onsubmit="app.handleUploadPoster(event)">
        <div class="form-group">
          <label class="form-label">Pilih Berkas Gambar Poster *</label>
          <input type="file" class="form-input" name="poster" accept=".jpg,.jpeg,.png,.webp,.svg,.gif" required onchange="app.previewImportPoster(event)">
          <span style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px; display:block;">Format: JPG, PNG, WebP (Otomatis dikompresi maksimal 100-200 KB)</span>
        </div>
        <div id="import-poster-preview-wrap" style="display:none; margin-bottom:14px; text-align:center;">
          <img id="import-poster-preview-img" src="" alt="Pratinjau" style="max-height:160px; max-width:100%; border-radius:var(--radius-card); border:1px solid var(--border-color); object-fit:contain;">
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
            <span>Tautkan ke Media (Opsional dengan ID)</span>
            <span style="font-size:0.75rem; color:var(--text-secondary);">Contoh: <code style="color:var(--accent-color);">G-001</code>, <code style="color:var(--accent-color);">C-002</code></span>
          </label>
          <div style="display:flex; gap:8px;">
            <input type="text" class="form-input font-mono" name="target_code" placeholder="Ketik ID unik (misal: G-001)" style="text-transform:uppercase; font-weight:700;" oninput="app.onImportPosterCodeInput(this.value)">
            <select class="form-select" style="max-width:200px;" onchange="if(this.value){document.querySelector('[name=target_code]').value=this.value; app.onImportPosterCodeInput(this.value);}">
              <option value="">-- Pilih Judul --</option>
              <optgroup label="🎮 Game">${gameOpts}</optgroup>
              <optgroup label="🎬 Cinema">${cinemaOpts}</optgroup>
              <optgroup label="🎵 Musik">${musicOpts}</optgroup>
            </select>
          </div>
          <div id="import-poster-target-preview" style="font-size:0.8rem; margin-top:4px; min-height:18px;"></div>
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
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Mengunggah & Mengompresi...'; }

    const formData = new FormData();
    formData.append('poster', file);
    const targetCode = form.target_code ? form.target_code.value.trim() : '';
    if (targetCode) {
      formData.append('target_code', targetCode);
    }

    try {
      const res = await api.upload('/api/taxonomy/posters/upload', formData);
      const msg = res.compressed
        ? `Poster berhasil diunggah & dikompresi ke ${res.size_formatted}!`
        : `Poster berhasil diunggah (${res.size_formatted || 'Optimal'})!`;
      showToast(msg, 'success');
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
    this._mediaCandidates = candidates;

    const gameOpts = (candidates.games || []).map(g => `<option value="games:${g.id}">[${g.code || `G-${String(g.id).padStart(3, '0')}`}] ${escapeHtml(g.title)}</option>`).join('');
    const cinemaOpts = (candidates.cinema || []).map(c => `<option value="cinema:${c.id}">[${c.code || `C-${String(c.id).padStart(3, '0')}`}] ${escapeHtml(c.title)}</option>`).join('');
    const musicOpts = (candidates.music || []).map(m => `<option value="music:${m.id}">[${m.code || `M-${String(m.id).padStart(3, '0')}`}] ${escapeHtml(m.title)}</option>`).join('');

    this.createModal('modal-link-poster', 'Tautkan Poster ke Media', `
      <form onsubmit="app.handleLinkPoster(event, '${escapeHtml(filename)}')">
        <!-- Info Poster yang Sedang Ditautkan -->
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; padding:10px 12px; background:var(--bg-surface-elevated); border-radius:var(--radius-card); border:1px solid var(--border-color);">
          <img src="/images/covers/${escapeHtml(filename)}" alt="${escapeHtml(filename)}" style="width:48px; height:64px; object-fit:cover; border-radius:4px; border:1px solid var(--border-color); flex-shrink:0;">
          <div style="overflow:hidden;">
            <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(filename)}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;" class="font-mono">/images/covers/${escapeHtml(filename)}</div>
          </div>
        </div>

        <!-- Input ID Unik Target -->
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
            <span>ID Unik Media Target *</span>
            <span style="font-size:0.75rem; color:var(--text-secondary);">Contoh: <code style="color:var(--accent-color); font-weight:700;">G-001</code>, <code style="color:var(--accent-color); font-weight:700;">C-002</code>, <code style="color:var(--accent-color); font-weight:700;">M-005</code></span>
          </label>
          <div style="display:flex; gap:8px;">
            <input type="text"
                   id="link-poster-code-input"
                   name="target_code"
                   class="form-input font-mono"
                   placeholder="Ketik ID item (misal: G-001)"
                   style="text-transform:uppercase; font-size:1.05rem; font-weight:700; letter-spacing:1px;"
                   autocomplete="off"
                   autofocus
                   required
                   oninput="app.onLinkPosterCodeInput(this.value)">
            <button type="button" class="btn btn-secondary" onclick="app.toggleLinkPosterHelperDropdown()" title="Cari dari daftar judul jika lupa ID" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
              ${getIcon('search', 'ui-icon', 14)} <span>Cari Judul</span>
            </button>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:5px;">
            Cukup ketik ID-nya saja untuk menghubungkan dengan cepat. Awalan: <strong class="font-mono">G-</strong> (Game), <strong class="font-mono">C-</strong> (Cinema), <strong class="font-mono">M-</strong> (Musik).
          </div>
        </div>

        <!-- Helper Dropdown Pencarian Judul (Opsional) -->
        <div id="link-poster-helper-wrap" style="display:none; margin-bottom:14px; padding:10px 12px; background:var(--bg-surface-elevated); border-radius:var(--radius-card); border:1px solid var(--border-color);">
          <label class="form-label" style="font-size:0.75rem; margin-bottom:4px; color:var(--text-secondary);">Pilih dari Daftar Judul Media:</label>
          <select class="form-select" id="link-poster-helper-select" onchange="app.onLinkPosterHelperSelect(this.value)">
            <option value="">-- Pilih Media untuk Memasukkan ID Otomatis --</option>
            <optgroup label="🎮 Katalog Game">${gameOpts}</optgroup>
            <optgroup label="🎬 Katalog Cinema">${cinemaOpts}</optgroup>
            <optgroup label="🎵 Katalog Musik">${musicOpts}</optgroup>
          </select>
        </div>

        <!-- Live Target Preview Card -->
        <div id="link-poster-preview-card" style="margin-bottom:16px; padding:12px; border-radius:var(--radius-card); border:1px dashed var(--border-color); background:var(--bg-surface-elevated); min-height:72px; display:flex; align-items:center; gap:12px;">
          <div style="display:flex; align-items:center; gap:10px; color:var(--text-muted); font-size:0.85rem; width:100%; justify-content:center; padding:8px 0;">
            ${getIcon('info', 'ui-icon', 16)}
            <span>Ketik ID unik item di atas untuk melihat pratinjau media target.</span>
          </div>
        </div>

        <!-- Tombol Aksi -->
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-link-poster')">Batal</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-link-poster">${getIcon('link', 'ui-icon-btn', 14)} <span>Terapkan Tautan</span></button>
        </div>
      </form>
    `);

    // Auto-focus ke input setelah dialog modal muncul
    setTimeout(() => {
      const inp = document.getElementById('link-poster-code-input');
      if (inp) inp.focus();
    }, 100);
  },

  async handleLinkPoster(e, filename) {
    e.preventDefault();
    const form = e.target;
    const codeVal = (form.target_code ? form.target_code.value : '').trim();
    if (!codeVal) return showToast('Masukkan ID item media target.', 'error');

    const item = this.findMediaCandidate(codeVal);
    const submitBtn = document.getElementById('btn-submit-link-poster');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Menautkan...';
    }

    try {
      const payload = { filename, code: codeVal };
      if (item) {
        payload.target_domain = item.domain;
        payload.target_id = item.id;
      }
      const res = await api.post('/api/taxonomy/posters/link', payload);
      const title = (item && item.title) ? ` ke [${res.code || item.code}] ${item.title}` : '';
      showToast(`Poster berhasil ditautkan${title}!`, 'success');
      this.closeModal('modal-link-poster');
      this.loadTaxonomyData();
    } catch (err) {
      showToast(err.message || 'Gagal menautkan poster.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${getIcon('link', 'ui-icon-btn', 14)} <span>Terapkan Tautan</span>`;
      }
    }
  }
});

