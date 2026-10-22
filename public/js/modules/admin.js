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
          <button class="sub-tab-btn ${curTab === 'profile' ? 'active' : ''}" onclick="app.setSettingsSubTab('profile')">${getIcon('user', 'ui-icon-btn', 13)} Profil Akun</button>
          <button class="sub-tab-btn ${curTab === 'layout' ? 'active' : ''}" onclick="app.setSettingsSubTab('layout')">${getIcon('settings', 'ui-icon-btn', 13)} Tampilan</button>
          <button class="sub-tab-btn ${curTab === 'api' ? 'active' : ''}" onclick="app.setSettingsSubTab('api')">${getIcon('key', 'ui-icon-btn', 13)} Kunci API</button>
          <button class="sub-tab-btn ${curTab === 'data' ? 'active' : ''}" onclick="app.setSettingsSubTab('data')">${getIcon('download', 'ui-icon-btn', 13)} Cadangan Data</button>
          <button class="sub-tab-btn ${curTab === 'system' ? 'active' : ''}" onclick="app.setSettingsSubTab('system')">${getIcon('sparkles', 'ui-icon-btn', 13)} Pembaruan Sistem</button>
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
      { name: 'public_show_prices', label: 'Tampilkan Informasi Estimasi Harga Game ke Publik' }
    ];
    return `
      <div class="settings-two-col-grid">
        <!-- Kustomisasi Tampilan & Identitas Brand -->
        <div class="module-card">
          <h2 style="font-size:1.15rem; margin-bottom:12px;">🎨 Kustomisasi Tampilan &amp; Banner Utama</h2>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
            Sesuaikan identitas brand aplikasi, logo SVG/PNG, serta tajuk pengenalan yang ditampilkan kepada publik.
          </p>
          <form onsubmit="app.handleSaveGeneralSettings(event)">
            <div class="form-group"><label class="form-label">Nama Aplikasi / Katalog *</label><input type="text" class="form-input" name="app_name" value="${escapeHtml(s.app_name || 'SaumaBox')}"></div>
            <div class="form-group"><label class="form-label">URL Berkas Logo Aplikasi</label><input type="text" class="form-input" name="app_logo_url" value="${escapeHtml(s.app_logo_url || '/images/logo.svg')}" placeholder="/images/logo.svg"></div>
            <div class="form-group"><label class="form-label">Judul Banner Beranda (Hero Title)</label><input type="text" class="form-input" name="banner_title" value="${escapeHtml(s.banner_title || 'Katalog Multi-Media Modern')}"></div>
            <div class="form-group"><label class="form-label">Deskripsi Banner (Subtitle)</label><textarea class="form-input" name="banner_subtitle" rows="3">${escapeHtml(s.banner_subtitle || '')}</textarea></div>
            <button type="submit" class="btn btn-primary">Simpan Tampilan</button>
          </form>
        </div>

        <!-- Konfigurasi Publik Sharing (Read-Only) -->
        <div class="module-card">
          <h2 style="font-size:1.15rem; margin-bottom:12px;">🌐 Konfigurasi Publik Sharing (Read-Only)</h2>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
            Atur visibilitas katalog bagi pengunjung publik yang mengakses tanpa login.
          </p>
          <form onsubmit="app.handleSaveGeneralSettings(event)">
            <div class="form-group">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" name="public_sharing_enabled" value="true" ${s.public_sharing_enabled === 'true' ? 'checked' : ''}>
                <strong>Aktifkan Akses Publik</strong>
              </label>
            </div>
            <div style="padding-left:24px; display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
              ${checks.map(c => `
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                  <input type="checkbox" name="${c.name}" value="true" ${s[c.name] === 'true' ? 'checked' : ''}>
                  <span>${c.label}</span>
                </label>
              `).join('')}
            </div>
            <button type="submit" class="btn btn-primary">Simpan Pengaturan Sharing</button>
          </form>
        </div>
      </div>
    `;
  },

  renderSettingsApi(s) {
    const freeApis = [
      { id: 'steam', name: '🎮 Steam Store API', desc: 'Open database PC game: spesifikasi, developer/publisher, dan cover resmi.' },
      { id: 'tvmaze', name: '🎬 TVMaze Open DB', desc: 'Open database Film & Series: sinopsis lengkap, rating, studio, dan poster HD.' },
      { id: 'itunes', name: '🎵 iTunes & MusicBrainz', desc: 'Open database Musik: trek audio, artis, album, durasi, dan cover art HD 600px.' }
    ];
    const customApis = [
      { id: 'tmdb', name: '🎬 The Movie Database (TMDB) API', desc: 'Opsional untuk metadata Hollywood.', fields: [{ name: 'tmdb_api_key', type: 'password', val: s.tmdb_api_key, ph: 'TMDB API Key (v3 auth)...' }] },
      { id: 'igdb', name: '🎮 IGDB by Twitch', desc: 'Opsional untuk Twitch developer ID.', fields: [{ name: 'igdb_client_id', type: 'text', val: s.igdb_client_id, ph: 'IGDB Client ID' }, { name: 'igdb_client_secret', type: 'password', val: s.igdb_client_secret, ph: 'IGDB Client Secret' }] },
      { id: 'spotify', name: '🎵 Spotify Developer Web API', desc: 'Opsional untuk Spotify developer ID.', fields: [{ name: 'spotify_client_id', type: 'text', val: s.spotify_client_id, ph: 'Spotify Client ID' }, { name: 'spotify_client_secret', type: 'password', val: s.spotify_client_secret, ph: 'Spotify Client Secret' }] }
    ];
    return `
      <div class="module-card">
        <h2 style="font-size:1.15rem; margin-bottom:4px;">🔑 Integrasi API Eksternal &amp; Open Database</h2>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">
          Penyedia metadata otomatis untuk mengisi poster cover art, sinopsis, info developer, dan data katalog tanpa input manual.
        </p>

        <h3 style="font-size:0.95rem; margin-bottom:10px; color:var(--accent-green, #10b981);">🌐 API Terbuka &amp; Gratis (Siap Digunakan — Tanpa Perlu Daftar)</h3>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          ${freeApis.map(a => `
            <div style="background:var(--bg-surface-elevated); padding:12px 14px; border:1px solid var(--border-color); border-radius:var(--radius-control); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong>${a.name}</strong>
                  <span class="badge badge-success" style="font-size:0.7rem;">🟢 Aktif &amp; Gratis</span>
                </div>
                <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">${a.desc}</div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="app.testIntegration('${a.id}')">Uji Sambungan</button>
            </div>
          `).join('')}
        </div>

        <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--radius-control); padding:12px 14px; margin-top:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none;" onclick="app.toggleCustomApiCollapse()" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')app.toggleCustomApiCollapse()">
            <div>
              <h3 style="font-size:0.95rem; margin:0; display:flex; align-items:center; gap:6px;">
                🔐 Kunci API Kustom (Opsional)
              </h3>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">TMDB, IGDB by Twitch, dan Spotify Developer Web API</div>
            </div>
            <button type="button" id="custom-api-toggle-btn" class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:4px; font-size:0.75rem; pointer-events:none;">
              ${this.state.customApiCollapsed ? getIcon('chevronDown', 'ui-icon-btn', 13) + ' Buka' : getIcon('minus', 'ui-icon-btn', 13) + ' Minimize'}
            </button>
          </div>
          <div id="custom-api-collapsible-body" style="display:${this.state.customApiCollapsed ? 'none' : 'block'}; margin-top:12px; border-top:1px solid var(--border-subtle); padding-top:12px;">
            <form onsubmit="app.handleSaveGeneralSettings(event)">
              ${customApis.map(a => `
                <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); padding:10px 12px; border-radius:var(--radius-control); margin-bottom:10px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong>${a.name}</strong>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="app.testIntegration('${a.id}')">Uji</button>
                  </div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:6px;">${a.desc}</div>
                  <div class="${a.fields.length > 1 ? 'form-row' : ''}">
                    ${a.fields.map(f => `<input type="${f.type}" class="form-input form-input-sm" name="${f.name}" value="${escapeHtml(f.val || '')}" placeholder="${f.ph}">`).join('')}
                  </div>
                </div>
              `).join('')}
              <button type="submit" class="btn btn-primary" style="margin-top:4px;">Simpan Kunci API</button>
            </form>
          </div>
        </div>
      </div>
    `;
  },



  renderSettingsData(s) {
    return `
      <div class="module-card" style="margin-bottom:20px;">
        <h2 style="font-size:1.15rem; margin-bottom:12px;">💾 Cadangkan &amp; Pulihkan Database SQLite</h2>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">
          Unduh salinan penuh file <code>saumabox.sqlite</code> secara instan, atau pulihkan data dari file cadangan sebelumnya.
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px;">
          <button class="btn btn-primary" onclick="app.downloadBackup()">💾 Download Backup (.sqlite)</button>
          <button class="btn btn-secondary" onclick="app.openRestoreModal()">🔄 Restore Database</button>
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted);">
          Backup Terakhir: <strong>${s.last_backup_at ? formatDate(s.last_backup_at) : 'Belum pernah'}</strong>
        </div>
      </div>

      <div class="module-card">
        <h2 style="font-size:1.15rem; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <span>📑</span> Impor &amp; Ekspor Spreadsheet
        </h2>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">
          Smart data transfer (Excel, CSV, JSON) untuk penambahan data massal atau pencadangan katalog game, film, dan musik.
        </p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
          <!-- Kartu Ekspor -->
          <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:12px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
            <div>
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                <div style="width:34px; height:34px; border-radius:8px; background:rgba(99,102,241,0.15); color:var(--primary); display:flex; align-items:center; justify-content:center;">
                  ${getIcon('download', 'ui-icon', 18)}
                </div>
                <div>
                  <strong style="font-size:0.95rem; display:block;">Ekspor Data Katalog</strong>
                  <span style="font-size:0.75rem; color:var(--text-secondary);">Unduh ke Excel, CSV, atau JSON</span>
                </div>
              </div>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">
                Pilih modul data dan format file yang diinginkan melalui jendela pop-up ekspor.
              </p>
            </div>
            <div>
              <button class="btn btn-primary" onclick="app.openExportModal()" style="width:100%; justify-content:center; margin-bottom:8px;">
                ${getIcon('download', 'ui-icon-btn', 14)} Ekspor Data (Pilih Format)
              </button>
              <div style="display:flex; gap:6px;">
                ${['games:🎮 Games','cinema:🎬 Cinema','music:🎵 Musik'].map(m=>{const [k,l]=m.split(':');return `<button class="btn btn-ghost" style="flex:1; font-size:0.75rem; padding:4px 6px;" onclick="app.openExportModal('${k}')">${l}</button>`;}).join('')}
              </div>
            </div>
          </div>

          <!-- Kartu Impor -->
          <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:12px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
            <div>
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                <div style="width:34px; height:34px; border-radius:8px; background:rgba(16,185,129,0.15); color:var(--accent-green, #10b981); display:flex; align-items:center; justify-content:center;">
                  ${getIcon('upload', 'ui-icon', 18)}
                </div>
                <div>
                  <strong style="font-size:0.95rem; display:block;">Impor Data Katalog</strong>
                  <span style="font-size:0.75rem; color:var(--text-secondary);">Unggah Excel, CSV, atau JSON</span>
                </div>
              </div>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">
                Smart mapping otomatis mencocokkan kolom berkas dengan struktur database SaumaBox.
              </p>
            </div>
            <div>
              <button class="btn btn-secondary" onclick="app.openImportModal()" style="width:100%; justify-content:center; margin-bottom:8px;">
                ${getIcon('upload', 'ui-icon-btn', 14)} Impor Data (Unggah File)
              </button>
              <div style="display:flex; gap:6px;">
                ${['games:Games','cinema:Cinema','music:Musik'].map(m=>{const [k,l]=m.split(':');return `<button class="btn btn-ghost" style="flex:1; font-size:0.75rem; padding:4px 6px;" onclick="app.openImportModal('${k}')">${l}</button>`;}).join('')}
              </div>
            </div>
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
      this.renderSettings(document.getElementById('view-container'));
    } catch (err) { showToast(err.message, 'error'); }
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
  }
});

