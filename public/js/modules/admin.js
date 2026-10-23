// ============================================================
// SaumaBox — Admin & Settings Module
// ============================================================

Object.assign(app, {
  async renderSettings(container) {
    if (!this.state.settingsTab || this.state.settingsTab === 'sharing') this.state.settingsTab = 'profile';
    const settings = await api.get('/api/settings');
    const curTab = this.state.settingsTab;

    container.innerHTML = `
      <div style="max-width:880px; margin:0 auto;">
        <h1 style="font-size:1.6rem; margin-bottom:6px;">Pengaturan Aplikasi</h1>
        <p style="color:var(--text-secondary); margin-bottom:20px; font-size:0.9rem;">
          Konfigurasi tampilan antarmuka, hak akses publik, kunci integrasi API eksternal, dan pemeliharaan database.
        </p>

        <div class="sub-tabs" style="margin-bottom:20px;">
          <button class="sub-tab-btn ${curTab === 'profile' ? 'active' : ''}" onclick="app.setSettingsSubTab('profile')">${getIcon('user', 'ui-icon-btn', 13)} Profil</button>
          <button class="sub-tab-btn ${curTab === 'layout' ? 'active' : ''}" onclick="app.setSettingsSubTab('layout')">${getIcon('palette', 'ui-icon-btn', 13)} Tampilan</button>
          <button class="sub-tab-btn ${curTab === 'api' ? 'active' : ''}" onclick="app.setSettingsSubTab('api')">${getIcon('code', 'ui-icon-btn', 13)} API</button>
          <button class="sub-tab-btn ${curTab === 'data' ? 'active' : ''}" onclick="app.setSettingsSubTab('data')">${getIcon('database', 'ui-icon-btn', 13)} Atur Data</button>
          <button class="sub-tab-btn ${curTab === 'system' ? 'active' : ''}" onclick="app.setSettingsSubTab('system')">${getIcon('refresh', 'ui-icon-btn', 13)} Pembaruan</button>
        </div>

        <div id="settings-content">
          ${curTab === 'profile' ? (this.renderSettingsProfile ? this.renderSettingsProfile() : '') : ''}
          ${curTab === 'layout' ? this.renderSettingsLayout(settings) : ''}
          ${curTab === 'api' ? this.renderSettingsApi(settings) : ''}
          ${curTab === 'data' ? this.renderSettingsData(settings) : ''}
          ${curTab === 'system' ? (this.renderSettingsSystem ? this.renderSettingsSystem(settings) : '') : ''}
        </div>
      </div>
    `;
    if (curTab === 'system' && this.initSystemVersionInfo) setTimeout(() => this.initSystemVersionInfo(), 30);
    if (curTab === 'data' && this.loadBackupHistory) setTimeout(() => this.loadBackupHistory(), 30);
  },

  setSettingsSubTab(tab) {
    this.state.settingsTab = tab === 'sharing' ? 'layout' : tab;
    this.renderSettings(document.getElementById('view-container'));
  },

  renderSettingsLayout(s) {
    const checks = [
      { name: 'public_games_enabled', label: 'Tampilkan Katalog Games ke Publik' },
      { name: 'public_cinema_enabled', label: 'Tampilkan Katalog Cinema ke Publik' },
      { name: 'public_music_enabled', label: 'Tampilkan Katalog Musik ke Publik' },
      { name: 'public_web_enabled', label: 'Tampilkan Katalog Web ke Publik' },
      { name: 'public_show_prices', label: 'Tampilkan Informasi Estimasi Harga Game ke Publik' }
    ];
    return `
      <div class="module-card">
        <!-- Header -->
        <div style="margin-bottom:20px;">
          <h2 style="font-size:1.15rem; margin:0 0 6px 0; display:flex; align-items:center; gap:8px;">
            ${getIcon('palette', 'ui-icon', 20)}
            <span>Pengaturan Tampilan &amp; Visibilitas Publik</span>
          </h2>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
            Kelola identitas brand aplikasi, banner beranda, serta izin akses katalog bagi pengunjung tanpa akun dalam satu panel terpadu.
          </p>
        </div>

        <form onsubmit="app.handleSaveGeneralSettings(event)">
          <!-- Grup 1: Identitas Brand & Banner Beranda -->
          <div class="settings-group-header">
            <span class="settings-group-title">
              ${getIcon('edit', 'ui-icon', 14)} Identitas Brand &amp; Banner Beranda
            </span>
            <div class="settings-group-desc">Nama katalog, berkas logo aplikasi, serta judul utama pada halaman beranda</div>
          </div>

          <div class="form-row" style="margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Nama Aplikasi / Katalog *</label>
              <input type="text" class="form-input" name="app_name" value="${escapeHtml(s.app_name || 'SaumaBox')}" required>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">URL Berkas Logo Aplikasi</label>
              <input type="text" class="form-input" name="app_logo_url" value="${escapeHtml(s.app_logo_url || '/images/logo.svg')}" placeholder="/images/logo.svg">
            </div>
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label">Judul Banner Beranda (Hero Title)</label>
            <input type="text" class="form-input" name="banner_title" value="${escapeHtml(s.banner_title || 'Katalog Multi-Media Modern & Eksklusif')}">
          </div>

          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Deskripsi Banner (Subtitle)</label>
            <textarea class="form-input" name="banner_subtitle" rows="3" placeholder="Satu tempat terpadu mengelola koleksi media...">${escapeHtml(s.banner_subtitle || '')}</textarea>
          </div>

          <!-- Divider -->
          <div class="settings-section-divider"></div>

          <!-- Grup 2: Konfigurasi Akses Publik (Read-Only) -->
          <div class="settings-group-header">
            <span class="settings-group-title">
              ${getIcon('eye', 'ui-icon', 14)} Visibilitas Akses Publik (Read-Only)
            </span>
            <div class="settings-group-desc">Tentukan apakah pengunjung dapat menjelajah katalog tanpa login sebagai admin</div>
          </div>

          <!-- Master Switch Box -->
          <div class="sharing-master-box">
            <label style="display:flex; align-items:flex-start; gap:12px; cursor:pointer; margin:0;">
              <input type="checkbox" name="public_sharing_enabled" value="true" ${s.public_sharing_enabled !== 'false' ? 'checked' : ''} onchange="app.togglePublicSharingSubChecks(this.checked)" style="width:18px; height:18px; accent-color:var(--accent-color, #d4af37); margin-top:2px;">
              <div>
                <strong style="font-size:0.9rem; color:var(--text-primary); display:block;">Aktifkan Akses Publik</strong>
                <span style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; display:block; margin-top:2px;">
                  Jika aktif, pengunjung tanpa login dapat melihat katalog yang diizinkan di bawah ini secara read-only.
                </span>
              </div>
            </label>
          </div>

          <!-- Sub Checklist Grid -->
          <div class="sharing-sub-grid" style="${s.public_sharing_enabled !== 'false' ? '' : 'opacity:0.45; pointer-events:none;'}">
            ${checks.map(c => `
              <label class="sharing-sub-item">
                <input type="checkbox" name="${c.name}" value="true" ${s[c.name] !== 'false' ? 'checked' : ''}>
                <span>${c.label}</span>
              </label>
            `).join('')}
          </div>

          <!-- Submit Button -->
          <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border-subtle); display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px;">
              ${getIcon('check', 'ui-icon-btn', 14)} Simpan Pengaturan Tampilan
            </button>
          </div>
        </form>
      </div>
    `;
  },

  renderSettingsApi(s) {
    const freeApis = [
      { id: 'steam', icon: 'games', name: 'Steam Store API', desc: 'Database PC games: spesifikasi, pengembang/penerbit, dan cover art resmi.' },
      { id: 'tvmaze', icon: 'cinema', name: 'TVMaze Open DB', desc: 'Database Film & Serial: sinopsis lengkap, rating, studio produksi, dan poster HD.' },
      { id: 'itunes', icon: 'music', name: 'iTunes & MusicBrainz', desc: 'Database Musik: metadata lagu, artis, rilisan album, durasi, dan cover art HD.' }
    ];
    const customApis = [
      {
        id: 'tmdb',
        icon: 'cinema',
        name: 'The Movie Database (TMDB) API',
        desc: 'Opsional untuk metadata film dan serial internasional komprehensif.',
        fields: [{ name: 'tmdb_api_key', type: 'password', val: s.tmdb_api_key, ph: 'TMDB API Key (v3 auth)...' }]
      },
      {
        id: 'igdb',
        icon: 'games',
        name: 'IGDB by Twitch',
        desc: 'Opsional untuk cover art resolusi tinggi dan katalog game konsol luas.',
        fields: [
          { name: 'igdb_client_id', type: 'text', val: s.igdb_client_id, ph: 'IGDB Client ID' },
          { name: 'igdb_client_secret', type: 'password', val: s.igdb_client_secret, ph: 'IGDB Client Secret' }
        ]
      },
      {
        id: 'spotify',
        icon: 'music',
        name: 'Spotify Developer Web API',
        desc: 'Opsional untuk preview trek audio dan integrasi Spotify Web API.',
        fields: [
          { name: 'spotify_client_id', type: 'text', val: s.spotify_client_id, ph: 'Spotify Client ID' },
          { name: 'spotify_client_secret', type: 'password', val: s.spotify_client_secret, ph: 'Spotify Client Secret' }
        ]
      }
    ];
    return `
      <div class="module-card">
        <!-- Header -->
        <div style="margin-bottom:20px;">
          <h2 style="font-size:1.15rem; margin:0 0 6px 0; display:flex; align-items:center; gap:8px;">
            ${getIcon('code', 'ui-icon', 20)}
            <span>Integrasi API &amp; Layanan Metadata</span>
          </h2>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">
            Penyedia metadata otomatis untuk mengisi cover art, sinopsis, info developer, dan detail katalog tanpa input manual.
          </p>
        </div>

        <!-- Section 1: Layanan Terbuka (Tanpa Akun) -->
        <div class="api-section-group">
          <div class="api-section-header">
            <span class="api-section-title">
              Layanan Terbuka (Tanpa Akun)
            </span>
            <span class="api-section-subtitle">Tersedia langsung tanpa konfigurasi kunci</span>
          </div>

          <div class="api-service-list">
            ${freeApis.map(a => `
              <div class="api-service-item">
                <div class="api-service-info">
                  <div class="api-service-icon">
                    ${getIcon(a.icon, 'ui-icon', 18)}
                  </div>
                  <div class="api-service-meta">
                    <div class="api-service-name-wrap">
                      <span class="api-service-name">${a.name}</span>
                      <span class="api-status-badge">
                        <span class="api-status-dot"></span> Aktif
                      </span>
                    </div>
                    <div class="api-service-desc">${a.desc}</div>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="app.testIntegration('${a.id}')" title="Uji sambungan ke server ${a.name}">
                  ${getIcon('refresh', 'ui-icon-btn', 12)} Uji Sambungan
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 2: Kunci API Kustom (Opsional) -->
        <div class="custom-api-form-card">
          <div class="custom-api-header" onclick="app.toggleCustomApiCollapse()" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')app.toggleCustomApiCollapse()">
            <div>
              <span class="api-section-title" style="margin-bottom:2px;">
                ${getIcon('key', 'ui-icon', 14)} Kunci API Tambahan (Opsional)
              </span>
              <div style="font-size:0.75rem; color:var(--text-secondary);">TMDB, IGDB by Twitch, dan Spotify Developer API</div>
            </div>
            <button type="button" id="custom-api-toggle-btn" class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:4px; font-size:0.75rem; pointer-events:none;">
              ${this.state.customApiCollapsed ? getIcon('chevronDown', 'ui-icon-btn', 13) + ' Buka' : getIcon('minus', 'ui-icon-btn', 13) + ' Minimize'}
            </button>
          </div>

          <div id="custom-api-collapsible-body" class="custom-api-content" style="display:${this.state.customApiCollapsed ? 'none' : 'block'};">
            <form onsubmit="app.handleSaveGeneralSettings(event)">
              ${customApis.map(a => `
                <div class="custom-api-row">
                  <div class="custom-api-row-top">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="color:var(--accent-color, #d4af37);">${getIcon(a.icon, 'ui-icon', 15)}</span>
                      <strong style="font-size:0.88rem; color:var(--text-primary);">${a.name}</strong>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="app.testIntegration('${a.id}')">
                      ${getIcon('refresh', 'ui-icon-btn', 12)} Uji
                    </button>
                  </div>
                  <div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:8px;">${a.desc}</div>
                  <div class="${a.fields.length > 1 ? 'form-row' : ''}">
                    ${a.fields.map(f => `<input type="${f.type}" class="form-input form-input-sm" name="${f.name}" value="${escapeHtml(f.val || '')}" placeholder="${f.ph}">`).join('')}
                  </div>
                </div>
              `).join('')}
              <div style="margin-top:14px; display:flex; justify-content:flex-end;">
                <button type="submit" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px;">
                  ${getIcon('check', 'ui-icon-btn', 14)} Simpan Kunci API
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },



  renderSettingsData(s) {
    return `
      <div class="module-card" style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="font-size:1.15rem; margin:0 0 6px 0; display:flex; align-items:center; gap:8px;">
              ${getIcon('database', 'ui-icon', 20)}
              <span>Cadangkan &amp; Pulihkan Database SQLite</span>
            </h2>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0; max-width:680px;">
              Unduh salinan penuh file <code>saumabox.sqlite</code> secara instan, atau pulihkan data dari file cadangan sebelumnya.
            </p>
          </div>
          <div style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-secondary); background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:4px 10px; border-radius:6px;">
            ${getIcon('shield', 'ui-icon', 13)}
            <span>Status: <strong>WAL Mode Aktif</strong></span>
          </div>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin:16px 0 14px 0;">
          <button type="button" class="btn btn-primary" onclick="app.downloadBackup()">
            ${getIcon('download', 'ui-icon-btn', 15)} <span>Download Backup (.sqlite)</span>
          </button>
          <button type="button" class="btn btn-secondary" onclick="app.openRestoreModal()">
            ${getIcon('upload', 'ui-icon-btn', 15)} <span>Restore Database</span>
          </button>
          <button type="button" class="btn btn-secondary" onclick="app.openExportModal()">
            ${getIcon('download', 'ui-icon-btn', 15)} <span>Ekspor Data</span>
          </button>
          <button type="button" class="btn btn-secondary" onclick="app.openImportModal()">
            ${getIcon('upload', 'ui-icon-btn', 15)} <span>Impor Data</span>
          </button>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); padding-bottom:14px; border-bottom:1px solid var(--border-color);">
          Backup Terakhir: <strong>${s.last_backup_at ? formatDateTime(s.last_backup_at) : 'Belum pernah'}</strong>
        </div>

        <!-- Tabel Riwayat Cadangan Database -->
        <div style="margin-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div>
              <h3 style="font-size:0.95rem; font-weight:600; margin:0; display:flex; align-items:center; gap:6px;">
                ${getIcon('layers', 'ui-icon', 16)}
                <span>Riwayat Cadangan Database</span>
              </h3>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                Daftar arsip snapshot database yang tersimpan di direktori server <code>data/backups/</code>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="app.loadBackupHistory()" title="Segarkan riwayat cadangan">
              ${getIcon('refresh', 'ui-icon-btn', 13)} <span>Segarkan</span>
            </button>
          </div>

          <div id="backup-history-container">
            ${getLoadingHtml('Memuat riwayat cadangan database...', 'Memeriksa berkas di direktori backups')}
          </div>
        </div>
      </div>
    `;
  },

  async handleSaveGeneralSettings(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const updates = {};
    for (const [key, val] of formData.entries()) {
      updates[key] = val;
    }
    // Handle checkbox booleans
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      updates[cb.name] = cb.checked ? 'true' : 'false';
    });

    try {
      await api.put('/api/settings', updates);
      showToast('Pengaturan aplikasi berhasil disimpan.', 'success');
      this.state.publicConfig = await api.get('/api/settings/public-config');
      if (typeof this.applyBrandAndPublicConfig === 'function') {
        this.applyBrandAndPublicConfig();
      }
      this.updateNavbar();
      this.renderSettings(document.getElementById('view-container'));
    } catch (err) { showToast(err.message, 'error'); }
  },

  togglePublicSharingSubChecks(enabled) {
    const grid = document.querySelector('.sharing-sub-grid');
    if (!grid) return;
    grid.style.opacity = enabled ? '1' : '0.45';
    grid.style.pointerEvents = enabled ? 'auto' : 'none';
  },

  toggleCustomApiCollapse() {
    this.state.customApiCollapsed = !this.state.customApiCollapsed;
    const body = document.getElementById('custom-api-collapsible-body');
    const btn = document.getElementById('custom-api-toggle-btn');
    if (body) body.style.display = this.state.customApiCollapsed ? 'none' : 'block';
    if (btn) {
      btn.innerHTML = this.state.customApiCollapsed
        ? `${getIcon('chevronDown', 'ui-icon-btn', 13)} Buka`
        : `${getIcon('minus', 'ui-icon-btn', 13)} Minimize`;
    }
  },

  async testIntegration(provider) {
    try {
      showToast(`Memeriksa sambungan ke ${provider.toUpperCase()}...`, 'info');
      const res = await api.post('/api/metadata/test', { provider });
      showToast(`${res.message} (Respon: ${res.latency_ms}ms)`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
  },

  downloadBackup() {
    window.location.href = '/api/data/backup';
    showToast('Menyiapkan berkas cadangan database untuk diunduh...', 'info');
    setTimeout(() => {
      if (typeof this.loadBackupHistory === 'function') {
        this.loadBackupHistory();
      }
    }, 1500);
  },

  async loadBackupHistory() {
    const container = document.getElementById('backup-history-container');
    if (!container) return;

    try {
      const backups = await api.get('/api/data/backups');
      if (!backups || backups.length === 0) {
        container.innerHTML = `
          <div style="padding:24px 16px; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed var(--border-color); border-radius:8px;">
            <div style="font-size:0.88rem; font-weight:600; color:var(--text-primary); margin-bottom:4px;">Belum Ada Riwayat Cadangan</div>
            <div style="font-size:0.78rem; color:var(--text-secondary); max-width:460px; margin:0 auto;">
              Belum ada berkas cadangan tersimpan di server. Klik tombol <strong>Download Backup (.sqlite)</strong> di atas untuk membuat snapshot pertama.
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-responsive" style="border:1px solid var(--border-color); border-radius:8px; overflow:hidden;">
          <table class="table-modern" style="margin:0; width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-surface-elevated); border-bottom:1px solid var(--border-color); text-align:left; font-size:0.74rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-secondary);">
                <th style="padding:10px 14px;">Nama Berkas</th>
                <th style="padding:10px 14px;">Waktu Cadangan</th>
                <th style="padding:10px 14px;">Ukuran File</th>
                <th style="padding:10px 14px;">Tipe</th>
                <th style="padding:10px 14px; text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${backups.map(b => `
                <tr style="border-bottom:1px solid var(--border-subtle); transition:background 0.15s ease;" onmouseenter="this.style.background='rgba(255,255,255,0.02)'" onmouseleave="this.style.background='transparent'">
                  <td style="padding:10px 14px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="color:var(--accent-color);">${getIcon('database', 'ui-icon', 15)}</span>
                      <span class="font-mono" style="font-size:0.82rem; font-weight:600; color:var(--text-primary);">${escapeHtml(b.filename)}</span>
                    </div>
                  </td>
                  <td style="padding:10px 14px; font-size:0.82rem; color:var(--text-secondary);">
                    ${formatDateTime(b.created_at)}
                  </td>
                  <td style="padding:10px 14px; font-size:0.82rem; font-weight:600; color:var(--text-secondary);">
                    ${escapeHtml(b.size_formatted)}
                  </td>
                  <td style="padding:10px 14px;">
                    <span class="badge" style="font-size:0.72rem; padding:2px 8px; border-radius:4px; font-weight:600; ${b.type === 'Manual' ? 'background:rgba(212,175,55,0.12); color:#d4af37; border:1px solid rgba(212,175,55,0.3);' : 'background:rgba(59,130,246,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);'}">
                      ${escapeHtml(b.type)}
                    </span>
                  </td>
                  <td style="padding:10px 14px; text-align:right;">
                    <div style="display:inline-flex; gap:6px; align-items:center; justify-content:flex-end;">
                      <a href="/api/data/backups/${encodeURIComponent(b.filename)}" download="${escapeHtml(b.filename)}" class="btn btn-secondary btn-sm btn-icon-sm" title="Unduh berkas cadangan ini" aria-label="Unduh ${escapeHtml(b.filename)}">
                        ${getIcon('download', 'ui-icon', 13)}
                      </a>
                      <button type="button" class="btn btn-secondary btn-sm btn-icon-sm" onclick="app.confirmRestoreHistoricalBackup('${escapeHtml(b.filename)}')" title="Pulihkan database dari berkas ini" aria-label="Pulihkan ${escapeHtml(b.filename)}">
                        ${getIcon('refresh', 'ui-icon', 13)}
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm btn-icon-sm btn-trash" onclick="app.confirmDeleteHistoricalBackup('${escapeHtml(b.filename)}')" title="Hapus berkas dari server" aria-label="Hapus ${escapeHtml(b.filename)}">
                        ${getIcon('trash', 'ui-icon', 13)}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="padding:16px; border:1px solid rgba(239,68,68,0.3); background:rgba(239,68,68,0.06); border-radius:8px; color:#f87171; font-size:0.82rem;">
          Gagal memuat riwayat cadangan: ${escapeHtml(err.message)}
        </div>
      `;
    }
  },

  confirmRestoreHistoricalBackup(filename) {
    showConfirmModal({
      title: 'Pulihkan Database dari Cadangan',
      message: `Pulihkan database dari berkas "<strong>${escapeHtml(filename)}</strong>"?`,
      subtext: 'Data saat ini akan ditimpa dengan data dari cadangan ini. Snapshot otomatis akan disimpan sebagai auto_backup_before_restore.sqlite.',
      confirmText: 'Ya, Pulihkan Database',
      cancelText: 'Batal',
      type: 'warning',
      onConfirm: async () => {
        try {
          showToast('Memulihkan database...', 'info');
          const res = await api.post(`/api/data/backups/${encodeURIComponent(filename)}/restore`);
          showToast(res.message || 'Database berhasil dipulihkan', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          showToast('Gagal memulihkan database: ' + err.message, 'error');
        }
      }
    });
  },

  confirmDeleteHistoricalBackup(filename) {
    showConfirmModal({
      title: 'Hapus Berkas Cadangan',
      message: `Hapus berkas cadangan "<strong>${escapeHtml(filename)}</strong>" dari penyimpanan server?`,
      subtext: 'Berkas ini akan dihapus secara permanen dari direktori data/backups/ dan tidak dapat dipulihkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/data/backups/${encodeURIComponent(filename)}`);
          showToast('Berkas cadangan berhasil dihapus', 'success');
          this.loadBackupHistory();
        } catch (err) {
          showToast('Gagal menghapus berkas: ' + err.message, 'error');
        }
      }
    });
  }
});

