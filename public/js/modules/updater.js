// ============================================================
// SaumaBox — System Updater & Version Management Module
// ============================================================

Object.assign(app, {
  renderSettingsSystem(s) {
    const curVer = 'v0.5.0';
    return `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- Card Utama: Status & Pembaruan Sistem -->
        <div class="module-card">
          <div class="system-update-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="system-update-icon-box">
                <img src="/images/logo-icon.png" alt="SaumaBox Logo" width="30" height="30" style="object-fit:contain; filter:drop-shadow(0 2px 5px rgba(212,175,55,0.35));">
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <h2 style="font-size:1.15rem; margin:0;">Pembaruan Sistem SaumaBox</h2>
                  <span class="badge badge-success font-mono" id="system-version-badge" style="font-size:0.75rem;">${curVer}</span>
                  <span class="badge badge-neutral font-mono" style="font-size:0.7rem;">Stable</span>
                </div>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
                  Pusat kendali versi aplikasi dan sinkronisasi repositori GitHub.
                </div>
              </div>
            </div>
            <div id="system-update-status-badge">
              <span class="badge badge-neutral" style="font-size:0.75rem;">Siap Diperiksa</span>
            </div>
          </div>

          <!-- Grid Info Status Versi -->
          <div class="system-version-grid">
            <div class="system-version-tile">
              <span class="system-tile-label">Versi Terpasang</span>
              <strong class="system-tile-val font-mono" id="app-current-ver">${curVer}</strong>
            </div>
            <div class="system-version-tile">
              <span class="system-tile-label">Branch Repositori</span>
              <strong class="system-tile-val font-mono" id="app-branch-val">main</strong>
            </div>
            <div class="system-version-tile">
              <span class="system-tile-label">Commit Aktif</span>
              <strong class="system-tile-val font-mono" id="app-current-commit">Memuat...</strong>
            </div>
            <div class="system-version-tile">
              <span class="system-tile-label">Pemeriksaan Terakhir</span>
              <strong class="system-tile-val" id="app-last-checked" style="font-size:0.8rem;">Belum diperiksa</strong>
            </div>
          </div>

          <!-- Banner Notifikasi Status -->
          <div id="system-update-banner" class="system-update-banner info">
            <div class="banner-icon">${getIcon('info', 'ui-icon', 18)}</div>
            <div class="banner-content">
              <div class="banner-title" id="banner-status-title">Pemeriksaan Versi &amp; Commit Terbaru</div>
              <div class="banner-desc" id="banner-status-desc">
                Tekan tombol <strong>Periksa Update</strong> untuk memeriksa apakah tersedia commit atau versi baru di GitHub resmi.
              </div>
            </div>
          </div>

          <!-- Tombol Aksi: Periksa Update & Update Sekarang -->
          <div class="system-update-actions">
            <button type="button" class="btn btn-secondary" id="btn-check-update" onclick="app.checkForUpdates()" style="gap:7px;">
              ${getIcon('sparkles', 'ui-icon-btn', 14)}
              <span id="btn-check-text">Periksa Update</span>
            </button>
            <button type="button" class="btn btn-primary" id="btn-apply-update" onclick="app.applySystemUpdate()" style="gap:7px;" disabled>
              ${getIcon('download', 'ui-icon-btn', 14)}
              <span id="btn-apply-text">Update Sekarang</span>
            </button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="app.forceCheckUpdates()" title="Periksa Ulang Secara Paksa" style="margin-left:auto; font-size:0.75rem; gap:5px;">
              ${getIcon('refresh', 'ui-icon-btn', 12)} Sinkron Ulang
            </button>
          </div>
        </div>

        <!-- Card Informasi Catatan Rilis & Fitur -->
        <div class="module-card">
          <h3 style="font-size:1.05rem; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
            <span style="color:var(--accent-color);">${getIcon('layers', 'ui-icon', 16)}</span>
            Catatan Pembaruan Terkini (v0.5.0)
          </h3>
          <p style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:14px;">
            Peningkatan fitur, efisiensi penyimpanan, dan perbaikan antarmuka pada rilis ini:
          </p>
          <div class="changelog-list">
            <div class="changelog-item">
              <span class="changelog-tag tag-new">Fitur Baru</span>
              <span><strong>Kompresi Gambar Otomatis (100–200 KB):</strong> Engine optimasi gambar terintegrasi berbasis Sharp untuk seluruh upload poster, cover, dan avatar profil dengan batas ketat $\le 200$ KB.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-system">Media</span>
              <span><strong>Kompresi Massal Galeri Poster:</strong> Optimasi seluruh koleksi gambar poster di disk tanpa menurunkan estetika tampilan, dilengkapi fitur Kompres Semua &amp; Kompres Selektif di UI.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-ui">Antarmuka</span>
              <span><strong>Redesain Taksonomi &amp; Galeri:</strong> Restrukturisasi menu (Genre, Poster, Platform, Status), multi-select dengan aksi tombol ikon minimalis, download massal, dan hapus terpilih.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-ui">Antarmuka</span>
              <span><strong>Modal Ekspor &amp; Impor Terpisah:</strong> Pop-up terpisah yang bersih dan fungsional untuk ekspor data CSV dan impor data per modul.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-system">Database</span>
              <span><strong>Tabel Riwayat Cadangan &amp; Restore SQLite Minimalis:</strong> Riwayat snapshot backup otomatis, kartu restore single-card yang bersih, dan restrukturisasi tab pengaturan profil.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-system">Database</span>
              <span><strong>Bundling Database &amp; Asset Koleksi:</strong> Penyatuan database lokal SQLite aktif beserta seluruh aset poster cover media ke dalam repositori.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-new">Fitur Baru</span>
              <span><strong>Horizontal Category Sliders (Games, Sinema, Musik):</strong> Pemisahan koleksi media menjadi baris slider horizontal mandiri dengan 5 poster di desktop (10 data dimuat) dan 4 poster kompak pada mode mobile.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-ui">Antarmuka</span>
              <span><strong>Tabel Katalog Bebas Scroll Horizontal:</strong> Penyesuaian layout tabel Game, Sinema, dan Musik agar seluruh kolom data tampil penuh di layar tanpa scroll bar.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-ui">Antarmuka</span>
              <span><strong>Login Modal Mobile &amp; Logo Transparan:</strong> Modal login ramah mobile (bottom sheet) dan aset logo resmi transparan tanpa latar belakang.</span>
            </div>
            <div class="changelog-item">
              <span class="changelog-tag tag-system">Perbaikan</span>
              <span><strong>Stabilisasi Rerender Dashboard:</strong> Perbaikan bug reload saat mengedit atau menghapus konten dari peringkat terpopuler.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async initSystemVersionInfo() {
    try {
      const res = await api.get('/api/settings/version');
      const elCommit = document.getElementById('app-current-commit');
      const elBranch = document.getElementById('app-branch-val');
      if (elCommit && res.commit) elCommit.textContent = res.commit;
      if (elBranch && res.branch) elBranch.textContent = res.branch;
    } catch (_) {}
  },

  async checkForUpdates() {
    const btnCheck = document.getElementById('btn-check-update');
    const btnText = document.getElementById('btn-check-text');
    const btnApply = document.getElementById('btn-apply-update');
    const statusBadge = document.getElementById('system-update-status-badge');
    const banner = document.getElementById('system-update-banner');
    const title = document.getElementById('banner-status-title');
    const desc = document.getElementById('banner-status-desc');
    const lastChecked = document.getElementById('app-last-checked');

    if (btnCheck) btnCheck.disabled = true;
    if (btnText) btnText.textContent = 'Memeriksa...';
    showToast('Memeriksa pembaruan dari repositori GitHub...', 'info');

    try {
      const res = await api.get('/api/settings/check-update');
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (lastChecked) lastChecked.textContent = `Hari ini, ${nowStr}`;

      const elCommit = document.getElementById('app-current-commit');
      if (elCommit && res.currentCommit) elCommit.textContent = res.currentCommit;

      if (res.hasUpdate) {
        if (statusBadge) statusBadge.innerHTML = '<span class="badge badge-warning" style="font-size:0.75rem;">🟢 Pembaruan Tersedia</span>';
        if (banner) { banner.className = 'system-update-banner warning'; }
        if (title) title.textContent = 'Pembaruan Sistem Baru Tersedia!';
        if (desc) desc.innerHTML = `Ditemukan commit terbaru di remote GitHub (<strong>${res.remoteCommit || 'Latest'}</strong>). Tekan tombol <strong>Update Sekarang</strong> di bawah untuk memasang pembaruan secara otomatis.`;
        if (btnApply) btnApply.disabled = false;
        showToast('Pembaruan sistem baru tersedia!', 'success');
      } else {
        if (statusBadge) statusBadge.innerHTML = '<span class="badge badge-success" style="font-size:0.75rem;">✓ Sistem Mutakhir</span>';
        if (banner) { banner.className = 'system-update-banner success'; }
        if (title) title.textContent = 'SaumaBox Berjalan Pada Versi Terbaru';
        if (desc) desc.innerHTML = `Aplikasi Anda sudah sinkron dengan branch <strong>${res.branch || 'main'}</strong> (commit: <code>${res.currentCommit || 'OK'}</code>). Tidak ada pembaruan tertunda.`;
        if (btnApply) btnApply.disabled = true;
        showToast('SaumaBox sudah dalam versi terbaru.', 'info');
      }
    } catch (err) {
      if (banner) { banner.className = 'system-update-banner error'; }
      if (title) title.textContent = 'Gagal Memeriksa Pembaruan';
      if (desc) desc.textContent = err.message || 'Terjadi kesalahan saat menghubungi server GitHub.';
      showToast(err.message || 'Gagal memeriksa update.', 'error');
    } finally {
      if (btnCheck) btnCheck.disabled = false;
      if (btnText) btnText.textContent = 'Periksa Update';
    }
  },

  forceCheckUpdates() {
    this.checkForUpdates();
  },

  async applySystemUpdate() {
    const ok = await showConfirmModal({
      title: 'Terapkan Pembaruan Sistem',
      message: 'Apakah Anda yakin ingin menerapkan pembaruan sistem sekarang?',
      subtext: 'Sistem akan menjalankan sinkronisasi kode terbaru dan memuat ulang aplikasi.',
      confirmText: 'Terapkan Update',
      type: 'warning'
    });
    if (!ok) return;

    const btnApply = document.getElementById('btn-apply-update');
    const btnText = document.getElementById('btn-apply-text');
    if (btnApply) btnApply.disabled = true;
    if (btnText) btnText.textContent = 'Menerapkan...';

    showToast('Mengunduh dan menerapkan pembaruan sistem...', 'info');

    try {
      const res = await api.post('/api/settings/apply-update');
      showToast(res.message || 'Pembaruan berhasil diterapkan!', 'success');

      const banner = document.getElementById('system-update-banner');
      const title = document.getElementById('banner-status-title');
      const desc = document.getElementById('banner-status-desc');
      if (banner) banner.className = 'system-update-banner success';
      if (title) title.textContent = 'Pembaruan Berhasil Dipasang!';
      if (desc) desc.textContent = 'Aplikasi akan otomatis memuat ulang dalam 2 detik untuk menerapkan perubahan.';

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      showToast(err.message || 'Gagal menerapkan pembaruan.', 'error');
      if (btnApply) btnApply.disabled = false;
      if (btnText) btnText.textContent = 'Update Sekarang';
    }
  }
});
