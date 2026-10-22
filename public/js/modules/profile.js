// ============================================================
// SaumaBox — User Profile Settings Module
// ============================================================

Object.assign(app, {
  renderSettingsProfile() {
    const user = this.state.user || {
      id: 1,
      username: 'admin',
      displayName: 'Administrator',
      email: '',
      role: 'super_admin'
    };

    const initial = (user.displayName || user.username || 'A').charAt(0).toUpperCase();
    const hasAvatar = !!user.avatarUrl;
    const avatarContent = hasAvatar
      ? `<img src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.displayName || user.username)}" class="profile-avatar-img">`
      : `<div class="profile-avatar-inner">${escapeHtml(initial)}</div>`;

    return `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- Hidden File Input for Avatar Upload -->
        <input type="file" id="profile-photo-input" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none;" onchange="app.handleUploadProfilePhoto(event)">

        <!-- 1. Hero Card: Profil & Identitas Admin Eksklusif -->
        <div class="profile-hero-card">
          <div style="display:flex; align-items:center; gap:20px; z-index:1; flex-wrap:wrap;">
            <div class="profile-avatar-wrap" onclick="document.getElementById('profile-photo-input').click()" title="Klik untuk unggah atau ganti foto profil" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')document.getElementById('profile-photo-input').click()">
              <div class="profile-avatar-ring">
                ${avatarContent}
              </div>
              <div class="profile-avatar-overlay">
                ${getIcon('camera', 'ui-icon', 15)}
                <span>Ganti</span>
              </div>
              <button type="button" class="profile-avatar-upload-badge" onclick="event.stopPropagation(); document.getElementById('profile-photo-input').click();" title="Unggah Foto Profil" aria-label="Unggah Foto Profil">
                ${getIcon('camera', 'ui-icon', 13)}
              </button>
              <span class="profile-status-indicator" title="Sesi Aktif"></span>
            </div>
            <div class="profile-hero-info">
              <div class="profile-hero-name">
                <span>${escapeHtml(user.displayName || user.username)}</span>
                <span class="badge badge-success" style="font-size:0.75rem; padding:3px 10px; display:inline-flex; align-items:center; gap:5px;">
                  ${getIcon('shield', 'ui-icon', 12)}
                  ${user.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                </span>
              </div>
              <div class="profile-meta-chips">
                <span class="profile-meta-chip font-mono">@${escapeHtml(user.username)}</span>
                <span class="profile-meta-chip">${user.email ? escapeHtml(user.email) : 'Belum ada email'}</span>
                <span class="profile-meta-chip">ID Akun: #${user.id || 1}</span>
                ${hasAvatar ? `
                  <button type="button" class="btn btn-secondary btn-sm" onclick="app.handleDeleteProfilePhoto()" style="padding:2px 8px; font-size:0.72rem; gap:4px; color:var(--text-muted);" title="Hapus foto dan kembali ke inisial">
                    ${getIcon('trash', 'ui-icon', 11)} Hapus Foto
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
          <div style="z-index:1;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="app.logout()" title="Keluar dari sesi ini" style="gap:6px;">
              ${getIcon('logout', 'ui-icon-btn', 14)} <span>Keluar Sesi</span>
            </button>
          </div>
        </div>

        <!-- 2. Grid Pengaturan: Informasi Akun & Keamanan Kata Sandi -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
          <!-- Card Kiri: Form Informasi Pribadi -->
          <div class="module-card">
            <h3 style="font-size:1.1rem; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent-color);">${getIcon('user', 'ui-icon', 18)}</span>
              Informasi Akun
            </h3>
            <p style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:18px;">
              Perbarui identitas profil dan kontak korespondensi akun pengelola katalog Anda.
            </p>

            <!-- Foto Profil Interaktif -->
            <div class="profile-photo-row">
              <div class="profile-photo-preview-mini">
                ${hasAvatar ? `<img src="${escapeHtml(user.avatarUrl)}" alt="Avatar">` : escapeHtml(initial)}
              </div>
              <div class="profile-photo-info">
                <div class="profile-photo-title">${hasAvatar ? 'Foto Profil Kustom Aktif' : 'Avatar Inisial Standar'}</div>
                <div class="profile-photo-sub">Format JPG, PNG, atau WebP (Maks. 10MB).</div>
                <div style="display:flex; gap:8px; margin-top:8px; align-items:center;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('profile-photo-input').click()" style="gap:6px;">
                    ${getIcon('camera', 'ui-icon-btn', 13)} <span>${hasAvatar ? 'Ganti Foto' : 'Unggah Foto'}</span>
                  </button>
                  ${hasAvatar ? `
                    <button type="button" class="btn btn-secondary btn-sm" onclick="app.handleDeleteProfilePhoto()" style="gap:4px; color:#ef4444;" title="Hapus foto profil">
                      ${getIcon('trash', 'ui-icon-btn', 12)} <span>Hapus</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>

            <form onsubmit="app.handleSaveProfile(event)">
              <div class="form-group">
                <label class="form-label">Nama Tampilan (Display Name) *</label>
                <input type="text" class="form-input" name="displayName" value="${escapeHtml(user.displayName || '')}" required placeholder="Contoh: Taufiq Zhang">
              </div>

              <div class="form-group">
                <label class="form-label">Username Login *</label>
                <input type="text" class="form-input font-mono" name="username" value="${escapeHtml(user.username || '')}" required placeholder="username_anda">
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                  Digunakan untuk otentikasi masuk ke sistem SaumaBox.
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Alamat Email (Opsional)</label>
                <input type="email" class="form-input" name="email" value="${escapeHtml(user.email || '')}" placeholder="admin@domain.com">
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                  Kontak pemulihan akun dan notifikasi sistem.
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tingkat Hak Akses &amp; Otoritas</label>
                <div class="profile-perm-card">
                  <div class="profile-perm-header">
                    <div class="profile-perm-title">
                      ${getIcon('shield', 'ui-icon', 14)} Super Administrator (Root)
                    </div>
                    <span class="badge badge-success" style="font-size:0.7rem;">Aktif Penuh</span>
                  </div>
                  <div class="profile-perm-list">
                    <span class="profile-perm-item">${getIcon('check', 'ui-icon', 11)} Akses Seluruh Katalog</span>
                    <span class="profile-perm-item">${getIcon('check', 'ui-icon', 11)} Kelola Taksonomi</span>
                    <span class="profile-perm-item">${getIcon('check', 'ui-icon', 11)} Kunci API &amp; Backup</span>
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top:10px; width:100%; justify-content:center;">
                ${getIcon('check', 'ui-icon-btn', 15)} Simpan Perubahan Profil
              </button>
            </form>
          </div>

          <!-- Card Kanan: Form Keamanan & Kata Sandi -->
          <div class="module-card">
            <h3 style="font-size:1.1rem; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent-color);">${getIcon('key', 'ui-icon', 18)}</span>
              Keamanan &amp; Kata Sandi
            </h3>
            <p style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:18px;">
              Ganti kata sandi secara berkala untuk menjaga integritas data koleksi multimedia Anda.
            </p>

            <form onsubmit="app.handleUpdatePassword(event)" id="form-update-password">
              <div class="form-group">
                <label class="form-label">Password Saat Ini *</label>
                <div class="input-password-wrap">
                  <input type="password" class="form-input" id="profile-current-pw" name="currentPassword" required placeholder="Masukkan password saat ini...">
                  <button type="button" class="btn-toggle-password" onclick="app.togglePasswordVisibility('profile-current-pw', this)" title="Tampilkan / Sembunyikan" aria-label="Toggle password visibility">
                    ${getIcon('eye', 'ui-icon', 15)}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Password Baru (Min. 6 Karakter) *</label>
                <div class="input-password-wrap">
                  <input type="password" class="form-input" id="profile-new-pw" name="newPassword" minlength="6" required placeholder="Kombinasi huruf &amp; angka..." oninput="app.checkPasswordStrength(this)">
                  <button type="button" class="btn-toggle-password" onclick="app.togglePasswordVisibility('profile-new-pw', this)" title="Tampilkan / Sembunyikan" aria-label="Toggle password visibility">
                    ${getIcon('eye', 'ui-icon', 15)}
                  </button>
                </div>
                <div class="password-meter-wrap" id="password-meter-wrap">
                  <div class="password-meter-bar">
                    <div class="password-meter-fill" id="password-meter-fill"></div>
                  </div>
                  <div class="password-meter-label">
                    <span id="password-strength-text">Kekuatan password: Belum diisi</span>
                    <span>Min. 6 karakter</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Ulangi Password Baru *</label>
                <div class="input-password-wrap">
                  <input type="password" class="form-input" id="profile-confirm-pw" name="confirmPassword" minlength="6" required placeholder="Ulangi password baru...">
                  <button type="button" class="btn-toggle-password" onclick="app.togglePasswordVisibility('profile-confirm-pw', this)" title="Tampilkan / Sembunyikan" aria-label="Toggle password visibility">
                    ${getIcon('eye', 'ui-icon', 15)}
                  </button>
                </div>
              </div>

              <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-control); padding:10px 14px; margin-bottom:18px;">
                <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.45; display:flex; align-items:flex-start; gap:8px;">
                  <span style="color:var(--accent-color); flex-shrink:0;">${getIcon('shield', 'ui-icon', 15)}</span>
                  <div>
                    <strong>Tips Keamanan:</strong> Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk proteksi data katalog optimal.
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-secondary" style="width:100%; justify-content:center;">
                ${getIcon('shield', 'ui-icon-btn', 14)} Perbarui Kata Sandi
              </button>
            </form>
          </div>
        </div>

        <!-- 3. Ringkasan Integritas Sistem & Parameter Sesi -->
        <div class="profile-system-grid">
          <div class="profile-system-tile">
            <span class="profile-system-label">Status Sesi Otentikasi</span>
            <div class="profile-system-val">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 6px #10b981;"></span>
              <span>Aktif (SQLite Session)</span>
            </div>
          </div>
          <div class="profile-system-tile">
            <span class="profile-system-label">Enkripsi Kredensial</span>
            <div class="profile-system-val font-mono">
              ${getIcon('lock', 'ui-icon', 14)} PBKDF2 / SHA-256
            </div>
          </div>
          <div class="profile-system-tile">
            <span class="profile-system-label">Waktu Registrasi Akun</span>
            <div class="profile-system-val font-mono">
              ${user.createdAt ? formatDate(user.createdAt) : '21 Okt 2026'}
            </div>
          </div>
          <div class="profile-system-tile">
            <span class="profile-system-label">Integritas Basis Data</span>
            <div class="profile-system-val" style="color:#10b981;">
              ${getIcon('check', 'ui-icon', 14)} Tervalidasi &amp; Sinkron
            </div>
          </div>
        </div>
      </div>
    `;
  },

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    if (btnEl) {
      btnEl.style.color = isPw ? 'var(--accent-color)' : 'var(--text-muted)';
      btnEl.title = isPw ? 'Sembunyikan password' : 'Tampilkan password';
    }
  },

  checkPasswordStrength(inputEl) {
    const val = inputEl ? inputEl.value : '';
    const fill = document.getElementById('password-meter-fill');
    const label = document.getElementById('password-strength-text');
    if (!fill || !label) return;

    if (!val) {
      fill.style.width = '0%';
      fill.style.background = 'transparent';
      label.textContent = 'Kekuatan password: Belum diisi';
      label.style.color = 'var(--text-muted)';
      return;
    }

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 2) {
      fill.style.width = '33%';
      fill.style.background = '#ef4444';
      label.textContent = 'Kekuatan password: Lemah';
      label.style.color = '#ef4444';
    } else if (score <= 3) {
      fill.style.width = '66%';
      fill.style.background = '#f59e0b';
      label.textContent = 'Kekuatan password: Cukup';
      label.style.color = '#f59e0b';
    } else {
      fill.style.width = '100%';
      fill.style.background = '#10b981';
      label.textContent = 'Kekuatan password: Sangat Kuat';
      label.style.color = '#10b981';
    }
  },

  async handleSaveProfile(e) {
    e.preventDefault();
    const form = e.target;
    const displayName = form.displayName.value.trim();
    const username = form.username.value.trim();
    const email = form.email.value.trim();

    if (!displayName || !username) {
      return showToast('Nama tampilan dan username wajib diisi.', 'warning');
    }

    try {
      showToast('Menyimpan perubahan profil akun...', 'info');
      const res = await api.put('/api/auth/profile', { displayName, username, email });
      if (res.success && res.user) {
        this.state.user = res.user;
        this.updateNavbar();
        showToast(res.message || 'Profil berhasil diperbarui.', 'success');
        this.renderSettings(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui profil.', 'error');
    }
  },

  async handleUpdatePassword(e) {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (!currentPassword || !newPassword) {
      return showToast('Semua kolom password wajib diisi.', 'warning');
    }
    if (newPassword.length < 6) {
      return showToast('Password baru minimal 6 karakter.', 'warning');
    }
    if (newPassword !== confirmPassword) {
      return showToast('Konfirmasi password baru tidak cocok.', 'warning');
    }

    try {
      showToast('Memperbarui kata sandi akun...', 'info');
      const res = await api.put('/api/auth/password', { currentPassword, newPassword, confirmPassword });
      if (res.success) {
        showToast(res.message || 'Kata sandi berhasil diperbarui.', 'success');
        form.reset();
        const fill = document.getElementById('password-meter-fill');
        const label = document.getElementById('password-strength-text');
        if (fill) fill.style.width = '0%';
        if (label) {
          label.textContent = 'Kekuatan password: Belum diisi';
          label.style.color = 'var(--text-muted)';
        }
      }
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui kata sandi.', 'error');
    }
  },

  async handleUploadProfilePhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return showToast('Format berkas harus berupa gambar (JPG, PNG, WebP, GIF).', 'warning');
    }
    if (file.size > 10 * 1024 * 1024) {
      return showToast('Ukuran foto profil maksimal 10MB.', 'warning');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      showToast('Mengunggah foto profil...', 'info');
      const res = await api.upload('/api/auth/avatar', formData);
      if (res.success && res.user) {
        this.state.user = res.user;
        this.updateNavbar();
        showToast(res.message || 'Foto profil berhasil diperbarui!', 'success');
        this.renderSettings(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message || 'Gagal mengunggah foto profil.', 'error');
    } finally {
      e.target.value = '';
    }
  },

  async handleDeleteProfilePhoto() {
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil dan kembali menggunakan inisial?')) {
      return;
    }
    try {
      showToast('Menghapus foto profil...', 'info');
      const res = await api.delete('/api/auth/avatar');
      if (res.success && res.user) {
        this.state.user = res.user;
        this.updateNavbar();
        showToast(res.message || 'Foto profil berhasil dihapus.', 'success');
        this.renderSettings(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message || 'Gagal menghapus foto profil.', 'error');
    }
  }
});

