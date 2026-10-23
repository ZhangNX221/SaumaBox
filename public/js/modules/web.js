// ============================================================
// SaumaBox — Web Catalog & App Launcher Module
// Design: /antislop-ui & /antislop-layoutmobile compliant
// ============================================================

Object.assign(app, {
  stateWeb: {
    items: [],
    categories: [],
    activeCategory: 'Semua',
    q: '',
    loading: false
  },

  async renderWeb(container) {
    if (!this.stateWeb) {
      this.stateWeb = { items: [], categories: [], activeCategory: 'Semua', q: '', loading: false };
    }

    container.innerHTML = getLoadingHtml('Memuat Katalog Web...', 'Menyiapkan bookmark tautan dan peluncur aplikasi Anda.');

    try {
      const params = {};
      if (this.stateWeb.activeCategory && this.stateWeb.activeCategory !== 'Semua') {
        params.category = this.stateWeb.activeCategory;
      }
      if (this.stateWeb.q && this.stateWeb.q.trim()) {
        params.q = this.stateWeb.q.trim();
      }

      const res = await api.get('/api/web', params);
      this.stateWeb.items = res.items || [];
      this.stateWeb.categories = res.categories || [];

      this.renderWebUI(container);
    } catch (err) {
      container.innerHTML = `
        <div class="state-container">
          <div class="state-icon">${getIcon('alert', 'ui-icon', 40)}</div>
          <div class="state-title">Gagal memuat katalog web</div>
          <div class="state-desc">${escapeHtml(err.message)}</div>
          <button class="btn btn-secondary" onclick="app.renderWeb(document.getElementById('view-container'))">Coba Lagi</button>
        </div>
      `;
    }
  },

  renderWebUI(container) {
    const isAdmin = !!this.state.user;
    const items = this.stateWeb.items || [];
    const activeCat = this.stateWeb.activeCategory || 'Semua';
    const totalCount = items.length;

    // Kategori default
    const allCategories = ['Semua', ...this.stateWeb.categories.map(c => c.category)];
    // Hapus duplikat
    const uniqueCategories = Array.from(new Set(allCategories));

    const categoryPillsHtml = uniqueCategories.map(cat => {
      const isActive = cat === activeCat;
      const count = cat === 'Semua'
        ? this.stateWeb.categories.reduce((acc, c) => acc + c.count, 0)
        : (this.stateWeb.categories.find(c => c.category === cat)?.count || 0);

      return `
        <button type="button" class="web-pill-btn ${isActive ? 'active' : ''}" onclick="app.filterWebCategory('${escapeHtml(cat)}')">
          <span>${escapeHtml(cat)}</span>
          <span class="web-pill-count">${count}</span>
        </button>
      `;
    }).join('');

    const tilesHtml = items.map(item => this.renderWebTile(item, isAdmin)).join('');

    const addTileHtml = isAdmin ? `
      <div class="web-app-tile web-app-tile-add" onclick="app.openAddWebModal()" role="button" tabindex="0" title="Tambah Bookmark Baru" aria-label="Tambah Bookmark Baru">
        <div class="web-app-icon-wrap">
          ${getIcon('plus', 'ui-icon', 22)}
        </div>
        <div class="web-app-title">Tambah Web</div>
        <div class="web-app-domain">Tautan Baru</div>
      </div>
    ` : '';

    const emptyStateHtml = items.length === 0 ? `
      <div class="web-empty-state" style="grid-column: 1 / -1;">
        <div class="web-empty-icon">${getIcon('globe', 'ui-icon', 28)}</div>
        <div class="web-empty-title">Tidak ada bookmark ditemukan</div>
        <div class="web-empty-desc">${this.stateWeb.q ? `Tidak ada hasil untuk kata kunci "${escapeHtml(this.stateWeb.q)}".` : 'Belum ada tautan web tersimpan di kategori ini.'}</div>
        ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="app.openAddWebModal()" style="margin-top:8px;">${getIcon('plus', 'ui-icon-btn', 14)} Tambah Bookmark Pertama</button>` : ''}
      </div>
    ` : '';

    container.innerHTML = `
      <div class="web-catalog-container">
        <!-- Header -->
        <header class="web-catalog-header">
          <div class="web-header-top">
            <div class="web-title-group">
              <h1 class="web-title">
                ${getIcon('globe', 'ui-icon', 24)}
                <span>Katalog Web &amp; Bookmark Aplikasi</span>
              </h1>
              <p class="web-subtitle">
                Akses cepat layanan homelab, dashboard server, alat pengembangan, dan web favorit dalam tampilan kisi aplikasi bersih.
              </p>
            </div>
            ${isAdmin ? `
              <div class="web-header-actions">
                <button class="btn btn-primary btn-sm" onclick="app.openAddWebModal()" title="Tambah Bookmark Baru">
                  ${getIcon('plus', 'ui-icon-btn', 14)}
                  <span>Tambah Web Baru</span>
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Toolbar -->
          <div class="web-toolbar">
            <div class="web-category-pills" role="tablist" aria-label="Filter Kategori Web">
              ${categoryPillsHtml}
            </div>

            <div class="web-search-box">
              <span class="web-search-icon" aria-hidden="true">${getIcon('search', 'ui-icon', 14)}</span>
              <input type="search" placeholder="Cari bookmark atau domain..." value="${escapeHtml(this.stateWeb.q || '')}" oninput="app.handleWebSearch(this.value)" aria-label="Cari bookmark web">
            </div>
          </div>
        </header>

        <!-- App Launcher Grid -->
        <main class="web-app-grid" role="region" aria-label="Daftar Aplikasi dan Bookmark Web">
          ${addTileHtml}
          ${tilesHtml}
          ${emptyStateHtml}
        </main>
      </div>
    `;
  },

  renderWebTile(item, isAdmin) {
    const bgColor = item.bg_color || '#272830';
    let hostname = '';
    try {
      const u = new URL(item.url);
      hostname = u.hostname.replace(/^www\./i, '');
      if (u.port) hostname += ':' + u.port;
    } catch (_) {
      hostname = item.url;
    }

    const firstChar = (item.title || 'W').charAt(0).toUpperCase();

    const adminActionsHtml = isAdmin ? `
      <div class="web-app-admin-actions" onclick="event.stopPropagation()">
        <button type="button" class="web-action-btn" onclick="app.openEditWebModal(${item.id})" title="Edit Bookmark" aria-label="Edit bookmark ${escapeHtml(item.title)}">
          ${getIcon('edit', 'ui-icon', 12)}
        </button>
        <button type="button" class="web-action-btn btn-delete" onclick="app.deleteWebBookmark(${item.id}, '${escapeHtml(item.title).replace(/'/g, "\\'")}')" title="Hapus Bookmark" aria-label="Hapus bookmark ${escapeHtml(item.title)}">
          ${getIcon('trash', 'ui-icon', 12)}
        </button>
      </div>
    ` : '';

    const pinHtml = item.is_pinned ? `
      <div class="web-app-pin" title="Disematkan di atas" aria-label="Disematkan">
        ${getIcon('pin', 'ui-icon', 13)}
      </div>
    ` : '';

    const hasIcon = Boolean(item.icon_url && item.icon_url.trim());

    return `
      <div class="web-app-tile" onclick="window.open('${escapeHtml(item.url)}', '_blank', 'noopener,noreferrer')" role="button" tabindex="0" title="${escapeHtml(item.title)}: ${escapeHtml(item.url)}${item.description ? ' — ' + escapeHtml(item.description) : ''}" aria-label="Buka ${escapeHtml(item.title)}">
        ${pinHtml}
        ${adminActionsHtml}
        <div class="web-app-icon-wrap" style="background:${escapeHtml(bgColor)};">
          ${hasIcon ? `
            <img class="web-app-icon-img" src="${escapeHtml(item.icon_url)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <span class="web-app-icon-fallback" style="display:none;">${firstChar}</span>
          ` : `
            <span class="web-app-icon-fallback">${firstChar}</span>
          `}
        </div>
        <div class="web-app-title">${escapeHtml(item.title)}</div>
        <div class="web-app-domain">${escapeHtml(hostname)}</div>
      </div>
    `;
  },

  filterWebCategory(cat) {
    if (!this.stateWeb) return;
    this.stateWeb.activeCategory = cat;
    const container = document.getElementById('view-container');
    if (container) this.renderWeb(container);
  },

  handleWebSearch: debounce(function(val) {
    if (!app.stateWeb) return;
    app.stateWeb.q = val || '';
    const container = document.getElementById('view-container');
    if (container) app.renderWeb(container);
  }, 250),

  openAddWebModal() {
    this.showWebModal(null);
  },

  async openEditWebModal(id) {
    try {
      const item = await api.get(`/api/web/${id}`);
      this.showWebModal(item);
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  showWebModal(item = null) {
    const isEdit = !!item;
    const title = isEdit ? 'Edit Bookmark Web' : 'Tambah Bookmark Web Baru';

    const defaultCategories = ['Homelab', 'Media', 'Produktivitas', 'Pengembangan', 'Sosial', 'Alat', 'Umum'];
    const currentCategory = item?.category || 'Homelab';
    const allCats = Array.from(new Set([...defaultCategories, currentCategory]));

    const colors = ['#1d4ed8', '#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#181717', '#ef4444'];
    const currentColor = item?.bg_color || '#1d4ed8';

    const colorSwatchesHtml = colors.map(c => `
      <button type="button" class="color-swatch-btn ${c === currentColor ? 'selected' : ''}" style="width:26px; height:26px; border-radius:6px; background:${c}; border:2px solid ${c === currentColor ? '#ffffff' : 'transparent'}; cursor:pointer;" onclick="app.pickWebColor('${c}')"></button>
    `).join('');

    const bodyHtml = `
      <form id="form-web-bookmark" onsubmit="app.handleWebSubmit(event, ${item?.id || 'null'})">
        <div class="form-group">
          <label class="form-label" style="display:flex; justify-content:space-between;">
            <span>URL Website / Layanan *</span>
            <span style="font-size:0.72rem; color:var(--text-muted);">http(s):// atau IP</span>
          </label>
          <div style="display:flex; gap:8px;">
            <input type="text" class="form-input" name="url" id="web-input-url" required placeholder="https://github.com atau 192.168.10.8:8080" value="${escapeHtml(item?.url || '')}">
            <button type="button" class="btn btn-secondary btn-sm" style="flex-shrink:0; white-space:nowrap;" onclick="app.autoFetchWebMeta()" title="Otomatis isi judul, favicon, dan warna dari URL">
              ${getIcon('sparkles', 'ui-icon-btn', 13)} Auto-Fill
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nama / Judul Bookmark *</label>
          <input type="text" class="form-input" name="title" id="web-input-title" required placeholder="Contoh: GitHub, CasaOS, AdGuard Home" value="${escapeHtml(item?.title || '')}">
        </div>

        <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <input type="text" list="web-category-list" class="form-input" name="category" id="web-input-cat" placeholder="Pilih atau ketik kategori..." value="${escapeHtml(currentCategory)}">
            <datalist id="web-category-list">
              ${allCats.map(c => `<option value="${escapeHtml(c)}">`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label">Urutan Sortir</label>
            <input type="number" class="form-input" name="sort_order" id="web-input-sort" placeholder="0" value="${item?.sort_order ?? 0}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">URL Ikon / Favicon</label>
          <div style="display:flex; gap:10px; align-items:center;">
            <div id="web-icon-preview-box" style="width:48px; height:48px; border-radius:12px; background:${escapeHtml(currentColor)}; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 10px rgba(0,0,0,0.3); overflow:hidden;">
              <img id="web-icon-preview-img" src="${escapeHtml(item?.icon_url || '')}" style="width:32px; height:32px; object-fit:contain; display:${item?.icon_url ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('web-icon-preview-fallback').style.display='block';">
              <span id="web-icon-preview-fallback" style="font-size:1.2rem; font-weight:700; color:#ffffff; display:${item?.icon_url ? 'none' : 'block'};">${escapeHtml((item?.title || 'W').charAt(0).toUpperCase())}</span>
            </div>
            <div style="flex:1; display:flex; gap:8px;">
              <input type="text" class="form-input" name="icon_url" id="web-input-icon" placeholder="https://domain.com/icon.png" value="${escapeHtml(item?.icon_url || '')}" oninput="app.previewWebIcon(this.value)">
              <label class="btn btn-secondary btn-sm" style="flex-shrink:0; cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:6px;" title="Unggah gambar ikon">
                ${getIcon('upload', 'ui-icon-btn', 13)} Unggah
                <input type="file" id="web-icon-file-input" accept="image/*" style="display:none;" onchange="app.handleWebIconUpload(this)">
              </label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Warna Latar Ikon</label>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <div id="web-swatches-wrap" style="display:flex; gap:6px;">
              ${colorSwatchesHtml}
            </div>
            <input type="color" id="web-color-picker" name="bg_color" value="${escapeHtml(currentColor)}" style="width:32px; height:28px; padding:0; border:none; background:none; cursor:pointer;" onchange="app.pickWebColor(this.value)">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi / Catatan Singkat (Opsional)</label>
          <input type="text" class="form-input" name="description" placeholder="Catatan kegunaan atau info login cepat..." value="${escapeHtml(item?.description || '')}">
        </div>

        <div class="form-group">
          <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; user-select:none;">
            <input type="checkbox" name="is_pinned" value="1" ${item?.is_pinned ? 'checked' : ''}>
            <span>Sematkan di baris teratas (Pinned Bookmark)</span>
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; padding-top:16px; border-top:1px solid var(--border-color);">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-web-bookmark')">Batal</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-web">
            ${getIcon('check', 'ui-icon-btn', 14)}
            <span>${isEdit ? 'Simpan Perubahan' : 'Tambah Bookmark'}</span>
          </button>
        </div>
      </form>
    `;

    this.createModal('modal-web-bookmark', title, bodyHtml);
  },

  pickWebColor(color) {
    const input = document.getElementById('web-color-picker');
    if (input) input.value = color;
    const box = document.getElementById('web-icon-preview-box');
    if (box) box.style.backgroundColor = color;
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.style.borderColor = btn.style.backgroundColor === color ? '#ffffff' : 'transparent';
    });
  },

  previewWebIcon(url) {
    const img = document.getElementById('web-icon-preview-img');
    const fallback = document.getElementById('web-icon-preview-fallback');
    if (!img || !fallback) return;

    if (url && url.trim()) {
      img.src = url.trim();
      img.style.display = 'block';
      fallback.style.display = 'none';
    } else {
      img.style.display = 'none';
      fallback.style.display = 'block';
    }
  },

  async handleWebIconUpload(fileInput) {
    const file = fileInput.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover_image', file);

    showToast('Mengunggah gambar ikon...', 'info');
    try {
      const res = await api.upload('/api/data/upload-cover', formData);
      if (res && res.cover_url) {
        const iconInput = document.getElementById('web-input-icon');
        if (iconInput) {
          iconInput.value = res.cover_url;
          this.previewWebIcon(res.cover_url);
        }
        showToast('Ikon berhasil diunggah!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async autoFetchWebMeta() {
    const urlInput = document.getElementById('web-input-url');
    const rawUrl = urlInput?.value?.trim();
    if (!rawUrl) {
      return showToast('Ketik URL atau IP website terlebih dahulu.', 'warning');
    }

    showToast('Mengambil favicon dan info situs...', 'info');
    try {
      const meta = await api.get('/api/web/fetch-meta', { url: rawUrl });
      if (meta) {
        if (meta.url) urlInput.value = meta.url;
        const titleInput = document.getElementById('web-input-title');
        if (titleInput && (!titleInput.value.trim() || titleInput.value.trim() === 'Umum')) {
          titleInput.value = meta.title;
        }
        const iconInput = document.getElementById('web-input-icon');
        if (iconInput) {
          iconInput.value = meta.icon_url;
          this.previewWebIcon(meta.icon_url);
        }
        if (meta.bg_color) {
          this.pickWebColor(meta.bg_color);
        }
        showToast('Informasi situs berhasil diisi otomatis!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  async handleWebSubmit(e, id = null) {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('btn-submit-web');
    if (btn) btn.disabled = true;

    const body = {
      title: form.title.value.trim(),
      url: form.url.value.trim(),
      category: form.category.value.trim() || 'Umum',
      icon_url: form.icon_url.value.trim(),
      bg_color: form.bg_color?.value || '#272830',
      description: form.description.value.trim(),
      sort_order: parseInt(form.sort_order.value, 10) || 0,
      is_pinned: form.is_pinned.checked ? 1 : 0
    };

    try {
      if (id) {
        await api.put(`/api/web/${id}`, body);
        showToast(`Bookmark "${body.title}" berhasil diperbarui.`, 'success');
      } else {
        await api.post('/api/web', body);
        showToast(`Bookmark "${body.title}" berhasil ditambahkan.`, 'success');
      }
      this.closeModal('modal-web-bookmark');

      // Refresh jika sedang di tab web
      if (this.state.currentTab === 'web') {
        this.renderWeb(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async deleteWebBookmark(id, title) {
    if (!confirm(`Hapus bookmark "${title}" dari katalog web?`)) return;

    try {
      await api.delete(`/api/web/${id}`);
      showToast(`Bookmark "${title}" berhasil dihapus.`, 'success');
      if (this.state.currentTab === 'web') {
        this.renderWeb(document.getElementById('view-container'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
});
