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
    const avatarBg = getAvatarColor(user.displayName || user.username);

    return `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- Header Profil Ringkas -->
        <div class="module-card" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%);">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:58px; height:58px; border-radius:50%; background:${avatarBg}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:800; box-shadow:var(--shadow-md); flex-shrink:0;">
              ${escapeHtml(initial)}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h2 style="font-size:1.25rem; margin:0;">${escapeHtml(user.displayName || user.username)}</h2>
                <span class="badge badge-success" style="font-size:0.72rem; display:inline-flex; align-items:center; gap:4px;">
                  <span style="width:6px; height:6px; border-radius:50%; background:#10b981; display:inline-block;"></span>
                  ${user.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                </span>
              </div>
              <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:3px;">
                @${escapeHtml(user.username)} ${user.email ? `• ${escapeHtml(user.email)}` : '• Belum ada email'}
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="app.handleLogout()">
            ${getIcon('logout', 'ui-icon-btn', 13)} Keluar Sesi
          </button>
        </div>

        <!-- Grid Pengaturan Profil & Keamanan -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
          <!-- 1. Form Informasi Pribadi -->
          <div class="module-card">
            <h3 style="font-size:1.05rem; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
              ${getIcon('user', 'ui-icon', 18)} Informasi Akun
            </h3>
            <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:18px;">
              Perbarui identitas profil dan kontak korespondensi akun pengelola katalog Anda.
            </p>

            <form onsubmit="app.handleSaveProfile(event)">
              <div class="form-group">
                <label class="form-label">Nama Tampilan (Display Name) *</label>
                <input type="text" class="form-input" name="displayName" value="${escapeHtml(user.displayName || '')}" required placeholder="Contoh: Taufiq Zhang">
              </div>

              <div class="form-group">
                <label class="form-label">Username Login *</label>
                <input type="text" class="form-input font-mono" name="username" value="${escapeHtml(user.username || '')}" required placeholder="username_anda">
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                  Digunakan untuk masuk ke sistem SaumaBox.
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
                <label class="form-label">Tingkat Hak Akses</label>
                <input type="text" class="form-input" value="Super Administrator (Akses Penuh Seluruh Modul)" disabled style="opacity:0.7; cursor:not-allowed;">
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top:6px; width:100%; justify-content:center;">
                ${getIcon('check', 'ui-icon-btn', 14)} Simpan Perubahan Profil
              </button>
            </form>
          </div>

          <!-- 2. Form Keamanan & Kata Sandi -->
          <div class="module-card">
            <h3 style="font-size:1.05rem; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
              ${getIcon('key', 'ui-icon', 18)} Keamanan &amp; Kata Sandi
            </h3>
            <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:18px;">
              Ganti kata sandi secara berkala untuk menjaga integritas data koleksi multimedia Anda.
            </p>

            <form onsubmit="app.handleUpdatePassword(event)" id="form-update-password">
              <div class="form-group">
                <label class="form-label">Password Saat Ini *</label>
                <input type="password" class="form-input" name="currentPassword" required placeholder="Masukkan password saat ini...">
              </div>

              <div class="form-group">
                <label class="form-label">Password Baru (Min. 6 Karakter) *</label>
                <input type="password" class="form-input" name="newPassword" minlength="6" required placeholder="Kombinasi huruf &amp; angka...">
              </div>

              <div class="form-group">
                <label class="form-label">Ulangi Password Baru *</label>
                <input type="password" class="form-input" name="confirmPassword" minlength="6" required placeholder="Ulangi password baru...">
              </div>

              <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-control); padding:10px 12px; margin-bottom:16px;">
                <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4;">
                  🛡️ <strong>Tips Keamanan:</strong> Gunakan minimal 6 karakter dengan variasi angka atau simbol untuk proteksi optimal.
                </div>
              </div>

              <button type="submit" class="btn btn-secondary" style="width:100%; justify-content:center;">
                ${getIcon('shield', 'ui-icon-btn', 14)} Perbarui Kata Sandi
              </button>
            </form>
          </div>
        </div>

        <!-- 3. Ringkasan Sesi & Info Sistem -->
        <div class="module-card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; font-size:0.82rem; color:var(--text-secondary);">
          <div style="display:flex; align-items:center; gap:8px;">
            ${getIcon('info', 'ui-icon', 16)}
            <span>Status Sesi: <strong>Aktif (Terotentikasi SQLite Session)</strong></span>
          </div>
          <div>
            ${user.createdAt ? `Akun Terdaftar: <strong>${formatDate(user.createdAt)}</strong>` : ''}
          </div>
        </div>
      </div>
    `;
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
      }
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui kata sandi.', 'error');
    }
  }
});
