// ============================================================
// SaumaBox — Modal & Authentication Module
// ============================================================

Object.assign(app, {
  // Modal Base Manager
  createModal(id, title, bodyHtml) {
    this.closeModal(id);
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.id = id;

    backdrop.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 style="font-size:1.15rem;">${title}</h2>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="app.closeModal('${id}')" aria-label="Tutup">${getIcon('close', 'ui-icon', 16)}</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeModal(id);
    });

    document.body.appendChild(backdrop);
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  },

  // First-Time Setup Wizard
  openSetupModal() {
    this.createModal('modal-setup', 'Setup Akun Administrator', `
      <form id="form-setup" onsubmit="app.handleSetupSubmit(event)">
        <p style="color:var(--text-secondary); margin-bottom:16px;">
          Selamat datang di SaumaBox. Buat akun administrator pertama untuk mulai mengelola katalog Anda.
        </p>
        <div class="form-group">
          <label class="form-label">Username Admin *</label>
          <input type="text" class="form-input" name="username" required autofocus placeholder="admin">
        </div>
        <div class="form-group">
          <label class="form-label">Password * (Min. 6 Karakter)</label>
          <input type="password" class="form-input" name="password" required minlength="6" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label class="form-label">Nama Tampilan</label>
          <input type="text" class="form-input" name="displayName" placeholder="Admin">
        </div>
        <div class="form-group">
          <label class="form-label">Nama Katalog Pribadi</label>
          <input type="text" class="form-input" name="catalogName" value="SaumaBox">
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="enablePublic" value="true" checked>
            <span>Aktifkan Halaman Publik (Read-Only)</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Selesaikan Setup & Masuk</button>
      </form>
    `);
  },

  async handleSetupSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const body = {
      username: form.username.value,
      password: form.password.value,
      displayName: form.displayName.value,
      catalogName: form.catalogName.value,
      enablePublic: form.enablePublic.checked
    };

    try {
      const res = await api.post('/api/auth/setup', body);
      api.setToken(res.token);
      this.state.user = res.user;
      this.closeModal('modal-setup');
      showToast('Setup awal berhasil. Selamat datang!', 'success');
      this.navigate('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // Login Modal
  openLoginModal() {
    this.createModal('modal-login', 'Masuk ke Akun Admin', `
      <form id="form-login" onsubmit="app.handleLoginSubmit(event)">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" name="username" required autofocus placeholder="admin">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" name="password" required placeholder="••••••••">
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" name="rememberMe" value="true" checked>
            <span>Ingat saya (30 hari)</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Masuk</button>
      </form>
    `);
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api.post('/api/auth/login', {
        username: form.username.value,
        password: form.password.value,
        rememberMe: form.rememberMe.checked
      });

      api.setToken(res.token);
      this.state.user = res.user;
      this.closeModal('modal-login');
      showToast('Login berhasil', 'success');
      this.navigate('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {}
    api.setToken('');
    this.state.user = null;
    showToast('Sesi Anda telah berakhir. Sampai jumpa kembali!', 'info');
    this.navigate('landing');
  },

  // Restore Database Modal
  openRestoreModal() {
    this.createModal('modal-restore', 'Restore Database SQLite', `
      <p style="color:var(--text-secondary); margin-bottom:16px;">
        Pilih file <code>.sqlite</code> untuk memulihkan seluruh data aplikasi. Sistem akan menjalankan validasi integritas dan otomatis membuat berkas snapshot cadangan sebelum memulihkan data aktif.
      </p>
      <div class="form-group">
        <label class="form-label">Pilih File Backup (.sqlite) *</label>
        <input type="file" id="restore-file-input" class="form-input" accept=".sqlite, .db">
      </div>
      <div style="background:var(--bg-surface-elevated); padding:12px; border-radius:var(--radius-control); margin-bottom:16px; font-size:0.8rem; color:var(--text-muted);">
        Peringatan: Proses ini akan memulihkan katalog dari file backup. Snapshot cadangan otomatis disimpan di <code>auto_backup_before_restore.sqlite</code>.
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-secondary" onclick="app.closeModal('modal-restore')">Batal</button>
        <button class="btn btn-danger" onclick="app.executeRestore()">Mulai Restore Database</button>
      </div>
    `);
  },

  async executeRestore() {
    const fileInput = document.getElementById('restore-file-input');
    if (!fileInput || !fileInput.files[0]) {
      return showToast('Silakan tentukan berkas cadangan database (.sqlite) yang ingin dipulihkan.', 'warning');
    }

    const formData = new FormData();
    formData.append('backup_file', fileInput.files[0]);

    try {
      showToast('Memeriksa integritas berkas cadangan database...', 'info');
      const res = await api.upload('/api/data/restore', formData);
      this.closeModal('modal-restore');
      showToast(res.message, 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  renderMetaFetchBar(type, defaultQuery = '') {
    const providerName = type === 'games' ? 'Steam Store API' : (type === 'cinema' ? 'TVMaze Open DB' : 'iTunes & MusicBrainz');
    return `
      <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:10px; padding:10px 12px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-secondary);">⚡ Auto-Fetch Metadata (${providerName} — Gratis &amp; Open)</span>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="meta-fetch-query" class="form-input form-input-sm" style="font-size:0.85rem;" placeholder="Ketik judul untuk auto-fill data &amp; cover..." value="${escapeHtml(defaultQuery || '')}">
          <button type="button" class="btn btn-secondary btn-sm" style="flex-shrink:0; white-space:nowrap;" onclick="app.fetchMetadataLookup('${type}')">
            🔍 Cari Metadata
          </button>
        </div>
        <div id="meta-fetch-results" style="display:none; margin-top:10px;"></div>
      </div>
    `;
  },

  async fetchMetadataLookup(type) {
    const input = document.getElementById('meta-fetch-query');
    const container = document.getElementById('meta-fetch-results');
    if (!input || !container) return;

    let query = input.value.trim();
    if (!query) {
      const titleInput = document.querySelector('input[name="title"]');
      if (titleInput && titleInput.value.trim()) {
        query = titleInput.value.trim();
        input.value = query;
      }
    }
    if (!query) {
      return showToast('Masukkan judul yang ingin dicari metadatanya.', 'warning');
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div style="padding:10px; text-align:center; color:var(--text-secondary); font-size:0.82rem;">
        <span>⏳ Mencari metadata dari open database...</span>
      </div>
    `;

    try {
      const res = await api.get('/api/metadata/search', { type, q: query });
      if (!res.results || res.results.length === 0) {
        container.innerHTML = `
          <div style="padding:8px 12px; background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:8px; font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
            <span>Tidak ditemukan metadata untuk "<strong>${escapeHtml(query)}</strong>".</span>
            <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('meta-fetch-results').style.display='none'">Tutup</button>
          </div>
        `;
        return;
      }

      const cards = res.results.map((item) => {
        const itemStr = encodeURIComponent(JSON.stringify(item));
        const subtitle = item.developer || item.studio || item.artist || item.source || '';
        const meta = [item.year, item.genre].filter(Boolean).join(' • ');

        return `
          <div style="display:flex; align-items:center; gap:10px; background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:8px; padding:8px 10px;">
            ${item.cover_url ? `<img src="${escapeHtml(item.cover_url)}" style="width:40px; height:48px; object-fit:cover; border-radius:4px; flex-shrink:0;" alt="Cover">` : ''}
            <div style="flex:1; min-width:0;">
              <strong style="font-size:0.85rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.title)}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(subtitle)}</div>
              <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(meta)}</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" style="flex-shrink:0; font-size:0.75rem; padding:4px 10px;" onclick="app.applyMetadata('${type}', decodeURIComponent('${itemStr}'))">
              Gunakan
            </button>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div style="border:1px solid var(--border-color); border-radius:10px; padding:10px; background:rgba(0,0,0,0.25); display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75rem; font-weight:600; color:var(--text-secondary);">Ditemukan ${res.results.length} kecocokan:</span>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size:0.7rem; padding:2px 6px;" onclick="document.getElementById('meta-fetch-results').style.display='none'">Tutup</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
            ${cards}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="padding:8px 12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; font-size:0.8rem; color:var(--danger, #ef4444);">
          ${escapeHtml(err.message)}
        </div>
      `;
    }
  },

  applyMetadata(type, item) {
    if (typeof item === 'string') {
      try { item = JSON.parse(item); } catch (_) {}
    }
    if (!item) return;

    const setVal = (name, val) => {
      if (val === undefined || val === null) return;
      const el = document.querySelector(`[name="${name}"]`);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    setVal('title', item.title);
    if (item.year) setVal('year', item.year);
    if (item.genre) {
      setVal('genre', item.genre);
      this.refreshGenreUI();
    }
    if (item.cover_url) {
      setVal('cover_url', item.cover_url);
      this.previewCoverUrl(item.cover_url);
    }
    if (item.rating) setVal('rating', item.rating);

    if (type === 'games') {
      if (item.developer) setVal('developer', item.developer);
      if (item.publisher) setVal('publisher', item.publisher);
      if (item.platform) setVal('platform', item.platform);
      if (item.price) setVal('price', item.price);
    } else if (type === 'cinema') {
      if (item.studio) setVal('studio', item.studio);
      if (item.country) setVal('country', item.country);
      if (item.synopsis) setVal('synopsis', item.synopsis);
      if (item.type) setVal('type', item.type);
    } else if (type === 'music') {
      if (item.artist) setVal('artist', item.artist);
      if (item.album) setVal('album', item.album);
      if (item.duration_secs) setVal('duration_secs', item.duration_secs);
      if (item.platform) setVal('platform', item.platform);
    }

    const container = document.getElementById('meta-fetch-results');
    if (container) container.style.display = 'none';

    showToast(`Metadata "${item.title}" berhasil diterapkan!`, 'success');
  },

  renderCoverUploadField(currentUrl = '', label = 'URL Poster / Cover Art') {
    const hasCover = Boolean(currentUrl && currentUrl.trim());
    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <div style="display:flex; gap:12px; align-items:center;">
          <div id="cover-preview-box" style="width:52px; height:64px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-surface-elevated); overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <img id="cover-preview-img" src="${escapeHtml(currentUrl || '')}" style="width:100%; height:100%; object-fit:cover; display:${hasCover ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('cover-preview-icon').style.display='block';">
            <span id="cover-preview-icon" style="font-size:1.3rem; display:${hasCover ? 'none' : 'block'};">🖼️</span>
          </div>
          <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; gap:8px;">
              <input type="text" class="form-input form-input-sm" name="cover_url" id="input-cover-url" value="${escapeHtml(currentUrl || '')}" placeholder="Masukkan URL gambar atau klik tombol unggah..." oninput="app.previewCoverUrl(this.value)">
              <label class="btn btn-secondary btn-sm" style="flex-shrink:0; cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:6px;" title="Unggah gambar poster dari perangkat">
                ${getIcon('upload', 'ui-icon-btn', 13)} Unggah Gambar
                <input type="file" id="manual-cover-file" accept="image/*" style="display:none;" onchange="app.handleManualCoverUpload(this)">
              </label>
            </div>
            <span style="font-size:0.72rem; color:var(--text-muted);">Pilih berkas dari perangkat (JPG, PNG, WebP) atau tempelkan URL gambar.</span>
          </div>
        </div>
      </div>
    `;
  },

  previewCoverUrl(url) {
    const img = document.getElementById('cover-preview-img');
    const icon = document.getElementById('cover-preview-icon');
    if (!img || !icon) return;
    if (url && url.trim()) {
      img.src = url.trim();
      img.style.display = 'block';
      icon.style.display = 'none';
    } else {
      img.style.display = 'none';
      icon.style.display = 'block';
    }
  },

  async handleManualCoverUpload(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];

    const localUrl = URL.createObjectURL(file);
    this.previewCoverUrl(localUrl);

    const formData = new FormData();
    formData.append('cover_image', file);

    try {
      showToast('Mengunggah berkas poster...', 'info');
      const res = await api.upload('/api/data/upload-cover', formData);
      const urlInput = document.getElementById('input-cover-url');
      if (urlInput) {
        urlInput.value = res.url;
        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        urlInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      this.previewCoverUrl(res.url);
      showToast('Gambar poster berhasil diunggah ke server!', 'success');
    } catch (err) {
      showToast(`Gagal mengunggah gambar: ${err.message}`, 'error');
    }
  },

  renderGenreSelector(currentGenreStr = '', mediaType = 'game', customTaxonomy = []) {
    const defaultGenres = {
      game: ['Action', 'Adventure', 'Action-Adventure', 'Action RPG', 'RPG', 'JRPG', 'Souls-like', 'Open World', 'Shooter', 'FPS', 'Battle Royale', 'Hack and Slash', 'Platformer', 'Puzzle', 'Racing', 'Fighting', 'Horror', 'Survival', 'Simulation', 'Strategy', 'Sports', 'Indie', 'Casual', 'Stealth', 'Gacha', 'Metroidvania', 'Co-op'],
      cinema: ['Aksi', 'Petualangan', 'Animasi', 'Anime', 'Biografi', 'Drama', 'Dokumenter', 'Fantasi', 'Horor', 'Kejahatan', 'Komedi', 'Misteri', 'Musikal', 'Romansa', 'Sci-Fi', 'Supernatural', 'Shounen', 'Thriller'],
      music: ['Akustik', 'Anime OST', 'Blues', 'Country', 'Dangdut', 'EDM / Elektronik', 'Folk', 'Hip-Hop', 'Indie', 'J-Pop', 'J-Rock', 'Jazz', 'Klasik', 'K-Pop', 'Metal', 'Orkestra', 'Pop', 'Pop Rock', 'R&B', 'Reggae', 'Rock', 'Rock Ballad', 'Soundtrack']
    };

    const taxNames = Array.isArray(customTaxonomy) ? customTaxonomy.map(x => x.name || x) : [];
    const allPresets = Array.from(new Set([...taxNames, ...(defaultGenres[mediaType] || defaultGenres.game)])).sort((a, b) => a.localeCompare('id'));

    const selectedList = currentGenreStr ? currentGenreStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const chipsHtml = selectedList.map(g => `
      <span class="genre-chip">
        <span>${escapeHtml(g)}</span>
        <button type="button" class="genre-chip-remove" onclick="app.removeGenreTag('${escapeHtml(g)}')" title="Hapus ${escapeHtml(g)}">✕</button>
      </span>
    `).join('');

    const optionsHtml = allPresets.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
    const quickPresets = (defaultGenres[mediaType] || defaultGenres.game).slice(0, 14);
    const quickList = Array.from(new Set([...taxNames.slice(0, 5), ...quickPresets]));
    const pillsHtml = quickList.map(g => {
      const isActive = selectedList.some(s => s.toLowerCase() === g.toLowerCase());
      return `<button type="button" class="genre-pill-btn ${isActive ? 'active' : ''}" data-genre="${escapeHtml(g)}" onclick="app.toggleGenrePill('${escapeHtml(g)}')">${escapeHtml(g)}</button>`;
    }).join('');

    return `
      <div class="form-group">
        <label class="form-label">Genre ${mediaType === 'game' ? 'Game' : mediaType === 'cinema' ? 'Tayangan' : 'Musik'}</label>
        <input type="hidden" name="genre" id="modal-genre-input" value="${escapeHtml(currentGenreStr || '')}">
        <div class="genre-selector-wrapper">
          <div id="modal-genre-chips" class="genre-chips-box">
            ${chipsHtml || '<span class="genre-empty-hint">Belum ada genre dipilih. Pilih dari menu atau tombol di bawah:</span>'}
          </div>
          <div style="display:flex; gap:8px;">
            <select class="form-select" id="genre-select-dropdown" onchange="app.selectGenreFromDropdown(this)" aria-label="Pilih genre untuk ditambahkan">
              <option value="">➕ Pilih Genre untuk Ditambahkan...</option>
              ${optionsHtml}
            </select>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Pilihan Cepat (klik untuk memilih / membatalkan):</div>
            <div class="genre-quick-pills-wrap">
              ${pillsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  addGenreTag(tag) {
    const input = document.getElementById('modal-genre-input');
    if (!input || !tag || !tag.trim()) return;
    const list = input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (!list.some(g => g.toLowerCase() === tag.trim().toLowerCase())) { list.push(tag.trim()); input.value = list.join(', '); this.refreshGenreUI(); }
  },

  removeGenreTag(tag) {
    const input = document.getElementById('modal-genre-input');
    if (!input) return;
    const list = (input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : []).filter(g => g.toLowerCase() !== tag.trim().toLowerCase());
    input.value = list.join(', ');
    this.refreshGenreUI();
  },

  toggleGenrePill(tag) {
    const input = document.getElementById('modal-genre-input');
    if (!input) return;
    const list = input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (list.some(g => g.toLowerCase() === tag.trim().toLowerCase())) this.removeGenreTag(tag);
    else this.addGenreTag(tag);
  },

  selectGenreFromDropdown(sel) {
    if (sel && sel.value) { this.addGenreTag(sel.value); sel.value = ''; }
  },

  refreshGenreUI() {
    const input = document.getElementById('modal-genre-input');
    const chipsBox = document.getElementById('modal-genre-chips');
    if (!input || !chipsBox) return;
    const list = input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : [];
    chipsBox.innerHTML = list.length === 0 ? '<span class="genre-empty-hint">Belum ada genre dipilih. Pilih dari menu atau tombol di bawah:</span>' : list.map(g => `
      <span class="genre-chip"><span>${escapeHtml(g)}</span><button type="button" class="genre-chip-remove" onclick="app.removeGenreTag('${escapeHtml(g)}')" title="Hapus ${escapeHtml(g)}">✕</button></span>
    `).join('');
    document.querySelectorAll('.genre-pill-btn').forEach(btn => {
      const pillTag = btn.dataset.genre;
      if (pillTag) btn.classList.toggle('active', list.some(g => g.toLowerCase() === pillTag.toLowerCase()));
    });
  }
});
