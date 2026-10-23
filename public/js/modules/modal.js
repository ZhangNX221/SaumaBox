// ============================================================
// SaumaBox — Modal & Authentication Module
// ============================================================

Object.assign(app, {
  // Modal Base Manager
  createModal(id, title, bodyHtml, headerActionsHtml = '') {
    this.closeModal(id);
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.id = id;

    backdrop.innerHTML = `
      <div class="modal-dialog ${id === 'modal-login' ? 'modal-login-dialog' : ''}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2 style="font-size:1.15rem;">${title}</h2>
          <div class="modal-header-actions" style="display:inline-flex; align-items:center; gap:8px;">
            ${headerActionsHtml}
            <button class="btn btn-secondary btn-sm btn-icon" onclick="app.closeModal('${id}')" title="Tutup" aria-label="Tutup">${getIcon('close', 'ui-icon', 16)}</button>
          </div>
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

  closeModal(id) { const el = document.getElementById(id); if (el) el.remove(); },
  closeAllModals() { document.querySelectorAll('.modal-backdrop').forEach(el => el.remove()); },

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

  // Login Modal (Modern, Informatif, & Minimalis)
  openLoginModal() {
    this.createModal('modal-login', 'Masuk Portal Administrator', `
      <div class="login-modal-wrapper">
        <div class="login-modal-hero">
          <div class="login-badge-portal"><span class="portal-dot"></span><span>PORTAL ADMINISTRATOR</span></div>
          <div class="login-modal-title">Pusat Kendali SaumaBox</div>
          <div class="login-modal-desc">Kelola pustaka Game, Cinema, Musik, taksonomi, serta konfigurasi sistem dalam satu dasbor.</div>
        </div>

        <form id="form-login" onsubmit="app.handleLoginSubmit(event)">
          <div class="form-group">
            <label class="form-label" style="display:flex; justify-content:space-between;"><span>Username atau ID Akun</span><span style="font-size:0.7rem; color:var(--text-muted);">Wajib</span></label>
            <div class="input-with-icon-wrap">
              <span class="input-leading-icon">${getIcon('user', 'ui-icon', 16)}</span>
              <input type="text" class="form-input input-with-icon" id="login-username" name="username" required autofocus placeholder="Masukkan username..." value="">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="display:flex; justify-content:space-between;"><span>Kata Sandi (Password)</span><span style="font-size:0.7rem; color:var(--text-muted);">Terenkripsi</span></label>
            <div class="input-with-icon-wrap">
              <span class="input-leading-icon">${getIcon('lock', 'ui-icon', 16)}</span>
              <input type="password" class="form-input input-with-icon" id="login-password" name="password" required placeholder="Masukkan kata sandi..." value="">
              <button type="button" class="input-trailing-action" onclick="app.toggleLoginPasswordVisibility()" title="Tampilkan/sembunyikan kata sandi" aria-label="Toggle password visibility">${getIcon('eye', 'ui-icon', 15)}</button>
            </div>
          </div>

          <div class="login-options-row">
            <label class="login-remember-label"><input type="checkbox" name="rememberMe" value="true" checked><span>Ingat saya di perangkat ini (30 hari)</span></label>
          </div>

          <button type="submit" class="btn btn-primary btn-login-submit">${getIcon('shield', 'ui-icon-btn', 15)} <span>Masuk Akun Administrator</span></button>
          <div class="login-security-footer">${getIcon('lock', 'ui-icon', 12)} <span>Sesi aman terenkripsi PBKDF2 &amp; SQLite Session Token</span></div>
        </form>
      </div>
    `);
  },

  toggleLoginPasswordVisibility() {
    const input = document.getElementById('login-password');
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
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

  // Restore Database Modal (/antislop-ui)
  openRestoreModal() {
    this.createModal('modal-restore', 'Restore Database SQLite', `
      <p style="color:var(--text-secondary); margin-bottom:16px; font-size:0.86rem; line-height:1.45;">
        Pilih berkas cadangan <code>.sqlite</code> untuk memulihkan seluruh data aplikasi. Sistem akan memvalidasi integritas struktur data sebelum menimpa basis data aktif.
      </p>

      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label">Berkas Database Cadangan *</label>
        <div class="io-dropzone" id="restore-dropzone"
             onclick="document.getElementById('restore-file-input').click()"
             ondragover="event.preventDefault(); this.classList.add('dragover');"
             ondragleave="this.classList.remove('dragover');"
             ondrop="event.preventDefault(); this.classList.remove('dragover'); if(event.dataTransfer.files.length){ const inp = document.getElementById('restore-file-input'); inp.files = event.dataTransfer.files; app.handleRestoreFileSelect(inp); }">
          <input type="file" id="restore-file-input" style="display:none;" accept=".sqlite, .db" onchange="app.handleRestoreFileSelect(this)">
          
          <div class="io-dropzone-empty" id="restore-dropzone-empty">
            <div class="io-dropzone-icon">
              ${getIcon('database', 'ui-icon', 22)}
            </div>
            <div class="io-dropzone-title">Pilih berkas .sqlite atau seret ke sini</div>
            <div class="io-dropzone-hint">Mendukung berkas SQLite Database (.sqlite, .db) hingga 50 MB</div>
          </div>

          <div class="io-dropzone-selected" id="restore-dropzone-selected" style="display:none;">
            <span class="io-file-badge font-mono" style="background:rgba(212,175,55,0.15); color:var(--accent-color); border:1px solid rgba(212,175,55,0.3);">SQLITE</span>
            <div class="io-file-details">
              <div class="io-file-name" id="restore-file-name">database.sqlite</div>
              <div class="io-file-size" id="restore-file-size">0 KB</div>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); app.clearRestoreFile();" style="padding:4px 8px; font-size:0.75rem;">Ganti</button>
          </div>
        </div>
      </div>

      <div class="restore-safety-notice">
        <span class="restore-safety-icon">${getIcon('shield', 'ui-icon', 16)}</span>
        <div>
          <strong>Snapshot Otomatis Dibuat</strong>
          <span>Sistem secara otomatis mencadangkan kondisi database saat ini ke <code>auto_backup_before_restore.sqlite</code> sebelum proses penimpaan data dimulai.</span>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-restore')">Batal</button>
        <button type="button" class="btn btn-danger" id="restore-submit-btn" onclick="app.executeRestore()" style="display:inline-flex; align-items:center; gap:6px;">
          ${getIcon('refresh', 'ui-icon-btn', 14)} Mulai Pemulihan Database
        </button>
      </div>
    `);
  },

  handleRestoreFileSelect(input) {
    const file = input && input.files ? input.files[0] : null;
    const emptyEl = document.getElementById('restore-dropzone-empty');
    const selEl = document.getElementById('restore-dropzone-selected');
    const nameEl = document.getElementById('restore-file-name');
    const sizeEl = document.getElementById('restore-file-size');

    if (!file) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (selEl) selEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (selEl) selEl.style.display = 'flex';
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = typeof formatBytes === 'function' ? formatBytes(file.size) : (file.size + ' B');
  },

  clearRestoreFile() {
    const input = document.getElementById('restore-file-input');
    if (input) input.value = '';
    this.handleRestoreFileSelect(null);
  },

  async executeRestore() {
    const fileInput = document.getElementById('restore-file-input');
    if (!fileInput || !fileInput.files[0]) {
      return showToast('Silakan tentukan berkas cadangan database (.sqlite) yang ingin dipulihkan.', 'warning');
    }

    const btn = document.getElementById('restore-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${getIcon('refresh', 'ui-icon-btn spin', 14)} Memulihkan...`;
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
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `${getIcon('refresh', 'ui-icon-btn', 14)} Mulai Pemulihan Database`;
      }
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
      <div style="padding:12px; text-align:center; color:var(--text-secondary); font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:10px;">
        <span class="state-spinner" style="width:16px; height:16px; border-width:2px; margin:0;" aria-hidden="true"></span>
        <span>Mencari metadata dari open database...</span>
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

    const fMap = { games: ['developer', 'publisher', 'platform', 'price'], cinema: ['studio', 'country', 'synopsis', 'type'], music: ['artist', 'album', 'duration_secs', 'platform'] };
    (fMap[type] || []).forEach(f => { if (item[f]) setVal(f, item[f]); });

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
    const chipsHtml = selectedList.map(g => `<span class="genre-chip"><span>${escapeHtml(g)}</span><button type="button" class="genre-chip-remove" onclick="app.removeGenreTag('${escapeHtml(g)}')" title="Hapus ${escapeHtml(g)}">✕</button></span>`).join('');
    const optionsHtml = allPresets.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
    const quickPresets = (defaultGenres[mediaType] || defaultGenres.game).slice(0, 14);
    const quickList = Array.from(new Set([...taxNames.slice(0, 5), ...quickPresets]));
    const pillsHtml = quickList.map(g => `<button type="button" class="genre-pill-btn ${selectedList.some(s => s.toLowerCase() === g.toLowerCase()) ? 'active' : ''}" data-genre="${escapeHtml(g)}" onclick="app.toggleGenrePill('${escapeHtml(g)}')">${escapeHtml(g)}</button>`).join('');

    return `
      <div class="form-group">
        <label class="form-label">Genre ${mediaType === 'game' ? 'Game' : mediaType === 'cinema' ? 'Tayangan' : 'Musik'}</label>
        <input type="hidden" name="genre" id="modal-genre-input" value="${escapeHtml(currentGenreStr || '')}">
        <div class="genre-selector-wrapper">
          <div id="modal-genre-chips" class="genre-chips-box">${chipsHtml || '<span class="genre-empty-hint">Belum ada genre dipilih. Pilih dari menu atau tombol di bawah:</span>'}</div>
          <div style="display:flex; gap:8px;">
            <select class="form-select" id="genre-select-dropdown" onchange="app.selectGenreFromDropdown(this)" aria-label="Pilih genre untuk ditambahkan"><option value="">➕ Pilih Genre untuk Ditambahkan...</option>${optionsHtml}</select>
          </div>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Pilihan Cepat (klik untuk memilih / membatalkan):</div>
            <div class="genre-quick-pills-wrap">${pillsHtml}</div>
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
  },

  // ============================================================
  // Mobile Bottom Sheets: Menu (Pengganti Sidebar) & Profil Pop-Up
  // ============================================================
  closeBottomSheet() {
    const sheet = document.getElementById('bottom-sheet-backdrop');
    if (!sheet) return;
    sheet.classList.remove('open');
    setTimeout(() => {
      if (sheet && sheet.parentNode) sheet.remove();
    }, 260);
  },

  openMobileMenuSheet() {
    this.closeBottomSheet();
    const curTab = this.state.currentTab;
    const subTab = this.state.taxonomy?.subTab || '';
    const setTab = this.state.settingsTab || '';

    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    backdrop.id = 'bottom-sheet-backdrop';

    const isA = (tab, sub = null) => {
      if (sub && tab === 'taxonomy') return curTab === 'taxonomy' && subTab === sub;
      if (sub && tab === 'settings') return curTab === 'settings' && setTab === sub;
      return curTab === tab;
    };

    backdrop.innerHTML = `
      <div class="bottom-sheet-dialog" role="dialog" aria-modal="true" aria-label="Menu Utama SaumaBox">
        <div class="bottom-sheet-drag-handle" aria-hidden="true"></div>
        <div class="bottom-sheet-header">
          <div class="bottom-sheet-title-group">
            <h2 class="bottom-sheet-title">
              ${getIcon('layers', 'ui-icon', 20)}
              <span>Menu SaumaBox</span>
            </h2>
            <span class="bottom-sheet-subtitle">Navigasi lengkap seluruh katalog, taksonomi, dan pengaturan</span>
          </div>
          <button type="button" class="bottom-sheet-close-btn" onclick="app.closeBottomSheet()" title="Tutup menu" aria-label="Tutup menu">
            ${getIcon('close', 'ui-icon', 16)}
          </button>
        </div>

        <div class="bottom-sheet-body">
          <!-- 1. Ringkasan -->
          <div class="sheet-menu-section">
            <div class="sheet-menu-label">1. Ringkasan</div>
            <div class="sheet-menu-grid">
              <div class="sheet-menu-item ${isA('dashboard') ? 'active' : ''}" onclick="app.navigate('dashboard'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('dashboard', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Dashboard</span>
                  <span class="sheet-item-sub">Analisis &amp; ringkasan</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Katalog Media -->
          <div class="sheet-menu-section">
            <div class="sheet-menu-label">2. Katalog Media</div>
            <div class="sheet-menu-grid">
              <div class="sheet-menu-item ${isA('games') ? 'active' : ''}" onclick="app.navigate('games'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('games', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Katalog Game</span>
                  <span class="sheet-item-sub">PC, retro emu &amp; port</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('cinema') ? 'active' : ''}" onclick="app.navigate('cinema'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('cinema', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Katalog Cinema</span>
                  <span class="sheet-item-sub">Film, serial &amp; anime</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('music') ? 'active' : ''}" onclick="app.navigate('music'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('music', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Katalog Musik</span>
                  <span class="sheet-item-sub">Album, lagu &amp; artis</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('web') ? 'active' : ''}" onclick="app.navigate('web'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('globe', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Katalog Web</span>
                  <span class="sheet-item-sub">30 bookmark homelab</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Kategori Data (Taksonomi) -->
          <div class="sheet-menu-section">
            <div class="sheet-menu-label">3. Kategori Data (Taksonomi)</div>
            <div class="sheet-menu-grid">
              <div class="sheet-menu-item ${isA('taxonomy', 'genres') ? 'active' : ''}" onclick="app.navigate('taxonomy', 'genres'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('tag', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Genre &amp; Tag</span>
                  <span class="sheet-item-sub">Kelola taksonomi genre</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('taxonomy', 'posters') ? 'active' : ''}" onclick="app.navigate('taxonomy', 'posters'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('image', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Galeri Poster</span>
                  <span class="sheet-item-sub">Semua sampul visual</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('taxonomy', 'platforms') ? 'active' : ''}" onclick="app.navigate('taxonomy', 'platforms'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('layers', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Platform</span>
                  <span class="sheet-item-sub">Distribusi &amp; konsol</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('taxonomy', 'statuses') ? 'active' : ''}" onclick="app.navigate('taxonomy', 'statuses'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('shield', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Status Koleksi</span>
                  <span class="sheet-item-sub">Tamat, backlog, dll</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Pengaturan Sistem -->
          <div class="sheet-menu-section">
            <div class="sheet-menu-label">4. Pengaturan Sistem</div>
            <div class="sheet-menu-grid">
              <div class="sheet-menu-item ${isA('settings', 'layout') ? 'active' : ''}" onclick="app.navigate('settings', 'layout'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('palette', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Tampilan</span>
                  <span class="sheet-item-sub">Tema, brand &amp; hero</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('settings', 'api') ? 'active' : ''}" onclick="app.navigate('settings', 'api'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('code', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">API &amp; Integrasi</span>
                  <span class="sheet-item-sub">Steam, TMDB, Spotify</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('settings', 'data') ? 'active' : ''}" onclick="app.navigate('settings', 'data'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('database', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Atur Data</span>
                  <span class="sheet-item-sub">Backup SQLite &amp; CSV</span>
                </div>
              </div>
              <div class="sheet-menu-item ${isA('settings', 'system') ? 'active' : ''}" onclick="app.navigate('settings', 'system'); app.closeBottomSheet();" role="button" tabindex="0">
                <div class="sheet-item-icon-box">${getIcon('refresh', 'ui-icon', 18)}</div>
                <div class="sheet-item-text">
                  <span class="sheet-item-title">Pembaruan</span>
                  <span class="sheet-item-sub">Versi &amp; update git</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Aksi Tambahan -->
          <div style="display:flex; gap:10px; margin-top:4px;">
            <button type="button" class="profile-sheet-btn" onclick="app.openMobileProfileSheet();" style="flex:1;">
              <span class="profile-sheet-btn-left">
                ${getIcon('user', 'ui-icon', 16)}
                <span>Profil Akun</span>
              </span>
              ${getIcon('chevronRight', 'ui-icon', 14)}
            </button>
            <button type="button" class="profile-sheet-btn danger" onclick="app.closeBottomSheet(); app.logout();" style="flex:1;">
              <span class="profile-sheet-btn-left">
                ${getIcon('logout', 'ui-icon', 16)}
                <span>Keluar</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeBottomSheet();
    });

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });
  },

  openMobileProfileSheet() {
    this.closeBottomSheet();
    const user = this.state.user || {};
    const username = user.displayName || user.username || 'Administrator';
    const handle = user.username ? `@${user.username}` : '@admin';
    const email = user.email || 'admin@saumabox.local';
    const role = (user.role || 'administrator').toUpperCase();
    const avatarMarkup = user.avatarUrl
      ? `<img src="${escapeHtml(user.avatarUrl)}" alt="Avatar">`
      : username.charAt(0).toUpperCase();

    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    backdrop.id = 'bottom-sheet-backdrop';

    backdrop.innerHTML = `
      <div class="bottom-sheet-dialog" role="dialog" aria-modal="true" aria-label="Profil Pengguna">
        <div class="bottom-sheet-drag-handle" aria-hidden="true"></div>
        <div class="bottom-sheet-header">
          <div class="bottom-sheet-title-group">
            <h2 class="bottom-sheet-title">
              ${getIcon('user', 'ui-icon', 18)}
              <span>Profil Pengguna</span>
            </h2>
            <span class="bottom-sheet-subtitle">Informasi akun dan akses sistem SaumaBox</span>
          </div>
          <button type="button" class="bottom-sheet-close-btn" onclick="app.closeBottomSheet()" title="Tutup" aria-label="Tutup">
            ${getIcon('close', 'ui-icon', 16)}
          </button>
        </div>

        <div class="bottom-sheet-body">
          <!-- User Profile Card -->
          <div class="profile-sheet-card">
            <div class="profile-sheet-avatar">
              ${avatarMarkup}
            </div>
            <div class="profile-sheet-info">
              <div class="profile-sheet-name">${escapeHtml(username)}</div>
              <div class="profile-sheet-handle">${escapeHtml(handle)} • ${escapeHtml(email)}</div>
              <div class="profile-sheet-badge-row">
                <span class="badge badge-success font-mono" style="font-size:0.7rem; gap:4px;">
                  <span style="width:6px; height:6px; border-radius:50%; background:#10b981; display:inline-block;"></span>
                  ${escapeHtml(role)}
                </span>
                <span class="badge badge-neutral font-mono" style="font-size:0.7rem;">Sesi Aktif</span>
              </div>
            </div>
          </div>

          <!-- Profile Actions List -->
          <div class="profile-sheet-actions-list">
            <button type="button" class="profile-sheet-btn" onclick="app.navigate('settings', 'profile'); app.closeBottomSheet();">
              <span class="profile-sheet-btn-left">
                ${getIcon('user', 'ui-icon', 16)}
                <span>Edit Nama &amp; Foto Profil</span>
              </span>
              ${getIcon('chevronRight', 'ui-icon', 14)}
            </button>
            <button type="button" class="profile-sheet-btn" onclick="app.navigate('settings', 'profile'); app.closeBottomSheet();">
              <span class="profile-sheet-btn-left">
                ${getIcon('key', 'ui-icon', 16)}
                <span>Keamanan &amp; Ganti Password</span>
              </span>
              ${getIcon('chevronRight', 'ui-icon', 14)}
            </button>
            <button type="button" class="profile-sheet-btn" onclick="app.navigate('settings', 'layout'); app.closeBottomSheet();">
              <span class="profile-sheet-btn-left">
                ${getIcon('palette', 'ui-icon', 16)}
                <span>Kustomisasi Tampilan &amp; Branding</span>
              </span>
              ${getIcon('chevronRight', 'ui-icon', 14)}
            </button>
            <button type="button" class="profile-sheet-btn danger" onclick="app.closeBottomSheet(); app.logout();">
              <span class="profile-sheet-btn-left">
                ${getIcon('logout', 'ui-icon', 16)}
                <span>Keluar dari Akun (Logout)</span>
              </span>
              ${getIcon('chevronRight', 'ui-icon', 14)}
            </button>
          </div>
        </div>
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeBottomSheet();
    });

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });
  }
});

