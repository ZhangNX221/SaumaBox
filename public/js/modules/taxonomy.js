// ============================================================
// SaumaBox — Master Data & Taksonomi Module
// ============================================================

Object.assign(app, {
  async renderTaxonomy(container) {
    if (!this.state.taxonomy) {
      this.state.taxonomy = { subTab: 'genres', q: '', filter: 'all', sortBy: 'name', sortOrder: 'asc', page: 1, limit: 10 };
    }
    const { subTab, q } = this.state.taxonomy;

    container.innerHTML = `
      <div class="data-panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="sub-tabs">
              <button class="sub-tab-btn ${subTab === 'genres' ? 'active' : ''}" onclick="app.setTaxonomyTab('genres')">Genre</button>
              <button class="sub-tab-btn ${subTab === 'creators' ? 'active' : ''}" onclick="app.setTaxonomyTab('creators')">Kreator</button>
              <button class="sub-tab-btn ${subTab === 'platforms' ? 'active' : ''}" onclick="app.setTaxonomyTab('platforms')">Platform</button>
              <button class="sub-tab-btn ${subTab === 'statuses' ? 'active' : ''}" onclick="app.setTaxonomyTab('statuses')">Status</button>
            </div>
          </div>
          <div class="toolbar-right">
            ${subTab === 'genres' ? `<button class="btn btn-primary btn-icon" onclick="app.openAddGenreModal()" title="Tambah Genre" aria-label="Tambah Genre">${getIcon('plus', 'ui-icon-btn', 16)}</button>` : ''}
            ${subTab === 'creators' ? `<button class="btn btn-primary btn-icon" onclick="app.openAddCreatorModal()" title="Tambah Tokoh" aria-label="Tambah Tokoh">${getIcon('plus', 'ui-icon-btn', 16)}</button>` : ''}
            ${subTab === 'platforms' ? `<button class="btn btn-primary btn-icon" onclick="app.openAddPlatformModal()" title="Tambah Platform" aria-label="Tambah Platform">${getIcon('plus', 'ui-icon-btn', 16)}</button>` : ''}
            ${subTab === 'statuses' ? `<button class="btn btn-primary btn-icon" onclick="app.openAddStatusModal()" title="Tambah Status" aria-label="Tambah Status">${getIcon('plus', 'ui-icon-btn', 16)}</button>` : ''}
          </div>
        </div>

        <div id="taxonomy-content" style="padding-top:12px;">
          <div class="state-container"><div class="state-icon">⏳</div><div class="state-title">Memuat data master...</div></div>
        </div>
      </div>
    `;

    await this.loadTaxonomyData();
  },

  setTaxonomyTab(tab) {
    if (!this.state.taxonomy) this.state.taxonomy = { subTab: 'genres', q: '', filter: 'all', sortBy: 'name', sortOrder: 'asc', page: 1, limit: 10 };
    this.state.taxonomy.subTab = tab;
    this.state.taxonomy.q = '';
    this.state.taxonomy.page = 1;
    this.renderTaxonomy(document.getElementById('view-container'));
  },

  sortTaxonomy(col) {
    const s = this.state.taxonomy = this.state.taxonomy || { subTab: 'genres', q: '', filter: 'all', sortBy: 'name', sortOrder: 'asc', page: 1, limit: 10 };
    s.sortOrder = s.sortBy === col && s.sortOrder === 'asc' ? 'desc' : 'asc';
    s.sortBy = col;
    s.page = 1;
    this.loadTaxonomyData();
  },

  changeTaxonomyPage(p) {
    if (!this.state.taxonomy) return;
    this.state.taxonomy.page = p;
    this.loadTaxonomyData();
  },

  changeTaxonomyLimit(l) {
    if (!this.state.taxonomy) return;
    this.state.taxonomy.limit = +l || 10;
    this.state.taxonomy.page = 1;
    this.loadTaxonomyData();
  },

  async loadTaxonomyData() {
    const content = document.getElementById('taxonomy-content');
    if (!content) return;
    const s = this.state.taxonomy = this.state.taxonomy || { subTab: 'genres', q: '', filter: 'all', sortBy: 'name', sortOrder: 'asc', page: 1, limit: 10 };
    const { subTab, q } = s;
    const sortBy = s.sortBy || 'name';
    const sortOrder = s.sortOrder || 'asc';
    const limit = s.limit || 10;
    const page = s.page || 1;

    const paginateAndSort = (items) => {
      items.sort((a, b) => {
        let va = a[sortBy] ?? '';
        let vb = b[sortBy] ?? '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortOrder === 'asc' ? -1 : 1;
        if (va > vb) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      const total = items.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const curPage = Math.min(Math.max(1, page), totalPages);
      s.page = curPage;
      const paged = items.slice((curPage - 1) * limit, curPage * limit);
      return { paged, total, totalPages, curPage };
    };

    const sortTh = (col, label) => {
      const isSorted = sortBy === col;
      const arrow = isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '↕';
      return `<th class="sortable ${isSorted ? 'sorted' : ''}" onclick="app.sortTaxonomy('${col}')" title="Urutkan ${label}">${label} <span class="sort-indicator">${arrow}</span></th>`;
    };

    const renderFooter = (total, curPage, totalPages, label) => `
      <div class="table-footer">
        <div class="table-page-size-wrap">
          <span>Tampilkan:</span>
          <select class="filter-select page-size-select" onchange="app.changeTaxonomyLimit(this.value)" aria-label="Jumlah baris data">
            ${[10, 25, 50, 100].map(n => `<option value="${n}" ${limit === n ? 'selected' : ''}>${n} data</option>`).join('')}
          </select>
        </div>
        <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <span style="font-size:0.85rem; color:var(--text-secondary);">
            Menampilkan <strong>${total > 0 ? (curPage - 1) * limit + 1 : 0}-${Math.min(curPage * limit, total)}</strong> dari total <strong>${total}</strong> ${label}
          </span>
          <div class="pagination">
            <button class="page-btn" ${curPage <= 1 ? 'disabled' : ''} onclick="app.changeTaxonomyPage(${curPage - 1})">◀</button>
            <span style="font-size:0.85rem; font-weight:600; padding:0 6px;">Halaman ${curPage} dari ${totalPages}</span>
            <button class="page-btn" ${curPage >= totalPages ? 'disabled' : ''} onclick="app.changeTaxonomyPage(${curPage + 1})">▶</button>
          </div>
        </div>
      </div>
    `;

    if (subTab === 'genres') {
      const genres = await api.get('/api/taxonomy/genres', { q });
      const { paged, total, totalPages, curPage } = paginateAndSort(genres);
      const rows = paged.map((g, idx) => `
        <tr>
          <td class="font-mono" style="width:40px; text-align:center; color:var(--text-muted);">${(curPage - 1) * limit + idx + 1}</td>
          <td><strong>${escapeHtml(g.name)}</strong></td>
          <td style="text-align:center;"><span class="badge badge-purple">${escapeHtml(g.media_type.toUpperCase())}</span></td>
          <td style="color:var(--text-secondary);">${escapeHtml(g.description || '-')}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="app.openEditGenreModal(${g.id}, '${escapeHtml(g.name)}', '${g.media_type}', '${escapeHtml(g.description || '')}')">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteTaxonomy('genres', ${g.id}, '${escapeHtml(g.name)}')">${getIcon('trash', 'ui-icon', 13)}</button>
          </td>
        </tr>
      `).join('');

      content.innerHTML = `
        <div class="table-responsive data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                ${sortTh('name', 'Nama Genre / Tag')}
                ${sortTh('media_type', 'Cakupan Media')}
                ${sortTh('description', 'Deskripsi')}
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5" style="text-align:center; padding:32px;">Tidak ada genre ditemukan.</td></tr>'}</tbody>
          </table>
        </div>
        ${renderFooter(total, curPage, totalPages, 'genre')}
      `;
    } else if (subTab === 'creators') {
      const creators = await api.get('/api/taxonomy/creators', { q });
      const { paged, total, totalPages, curPage } = paginateAndSort(creators);
      const rows = paged.map((c, idx) => {
        const initial = (c.name || 'C').charAt(0).toUpperCase();
        const avatarBg = getAvatarColor(initial);
        return `
          <tr>
            <td class="font-mono" style="width:40px; text-align:center; color:var(--text-muted);">${(curPage - 1) * limit + idx + 1}</td>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="ps-avatar-badge" style="background:${avatarBg}; width:32px; height:32px; font-size:0.85rem;">${initial}</div>
                <strong>${escapeHtml(c.name)}</strong>
              </div>
            </td>
            <td style="text-align:center;"><span class="badge badge-neutral">${escapeHtml(c.role)}</span></td>
            <td style="color:var(--text-secondary); max-width:320px; font-size:0.85rem;">${escapeHtml(c.bio || '-')}</td>
            <td style="text-align:right; white-space:nowrap;">
              <button class="btn btn-secondary btn-sm" onclick="app.openEditCreatorModal(${c.id}, '${escapeHtml(c.name)}', '${escapeHtml(c.role)}', '${escapeHtml(c.bio || '')}')">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteTaxonomy('creators', ${c.id}, '${escapeHtml(c.name)}')">${getIcon('trash', 'ui-icon', 13)}</button>
            </td>
          </tr>
        `;
      }).join('');

      content.innerHTML = `
        <div class="table-responsive data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                ${sortTh('name', 'Nama Tokoh / Entitas')}
                ${sortTh('role', 'Peran / Profesi')}
                ${sortTh('bio', 'Biografi Singkat')}
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5" style="text-align:center; padding:32px;">Tidak ada tokoh ditemukan.</td></tr>'}</tbody>
          </table>
        </div>
        ${renderFooter(total, curPage, totalPages, 'tokoh')}
      `;
    } else if (subTab === 'platforms') {
      const platforms = await api.get('/api/taxonomy/platforms', { q });
      const { paged, total, totalPages, curPage } = paginateAndSort(platforms);
      const rows = paged.map((p, idx) => `
        <tr>
          <td class="font-mono" style="width:40px; text-align:center; color:var(--text-muted);">${(curPage - 1) * limit + idx + 1}</td>
          <td><strong>${escapeHtml(p.name)}</strong></td>
          <td style="text-align:center;"><span class="badge badge-steam">${escapeHtml(p.category)}</span></td>
          <td style="color:var(--text-secondary); font-size:0.85rem;">${escapeHtml(p.notes || '-')}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="app.openEditPlatformModal(${p.id}, '${escapeHtml(p.name)}', '${escapeHtml(p.category)}', '${escapeHtml(p.notes || '')}')">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteTaxonomy('platforms', ${p.id}, '${escapeHtml(p.name)}')">${getIcon('trash', 'ui-icon', 13)}</button>
          </td>
        </tr>
      `).join('');

      content.innerHTML = `
        <div class="table-responsive data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                ${sortTh('name', 'Nama Platform / Media')}
                ${sortTh('category', 'Kategori Klasifikasi')}
                ${sortTh('notes', 'Keterangan / Lisensi')}
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5" style="text-align:center; padding:32px;">Tidak ada platform ditemukan.</td></tr>'}</tbody>
          </table>
        </div>
        ${renderFooter(total, curPage, totalPages, 'platform')}
      `;
    } else if (subTab === 'statuses') {
      const statuses = await api.get('/api/taxonomy/statuses', { q });
      const { paged, total, totalPages, curPage } = paginateAndSort(statuses);
      const rows = paged.map((s, idx) => `
        <tr>
          <td class="font-mono" style="width:40px; text-align:center; color:var(--text-muted);">${(curPage - 1) * limit + idx + 1}</td>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td style="text-align:center;"><span class="badge ${escapeHtml(s.badge_color || 'badge-neutral')}">${escapeHtml(s.name)}</span></td>
          <td style="color:var(--text-secondary); font-size:0.85rem;">${escapeHtml(s.description || '-')}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="app.openEditStatusModal(${s.id}, '${escapeHtml(s.name)}', '${escapeHtml(s.badge_color || 'badge-neutral')}', '${escapeHtml(s.description || '')}')">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="app.confirmDeleteTaxonomy('statuses', ${s.id}, '${escapeHtml(s.name)}')">${getIcon('trash', 'ui-icon', 13)}</button>
          </td>
        </tr>
      `).join('');

      content.innerHTML = `
        <div class="table-responsive data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px;">#</th>
                ${sortTh('name', 'Nama Status Kepemilikan')}
                ${sortTh('badge_color', 'Tampilan Badge')}
                ${sortTh('description', 'Keterangan Deskripsi')}
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5" style="text-align:center; padding:32px;">Tidak ada status kepemilikan ditemukan.</td></tr>'}</tbody>
          </table>
        </div>
        ${renderFooter(total, curPage, totalPages, 'status')}
      `;
    }
  },

  openAddGenreModal() { this.openGenreModal(null); },
  openEditGenreModal(id, name, media_type, description) {
    this.openGenreModal({ id, name, media_type, description });
  },
  openGenreModal(item) {
    const isEdit = !!item;
    const g = item || { name: '', media_type: 'all', description: '' };
    this.createModal('modal-genre', isEdit ? 'Edit Genre' : 'Tambah Genre Baru', `
      <form onsubmit="app.handleSaveGenre(event, ${isEdit ? g.id : 'null'})">
        <div class="form-group">
          <label class="form-label">Nama Genre *</label>
          <input type="text" class="form-input" name="name" required value="${escapeHtml(g.name)}" placeholder="Contoh: Action RPG">
        </div>
        <div class="form-group">
          <label class="form-label">Cakupan Media *</label>
          <select class="form-select" name="media_type">
            <option value="all" ${g.media_type === 'all' ? 'selected' : ''}>Semua Media (Game, Film, Musik)</option>
            <option value="game" ${g.media_type === 'game' ? 'selected' : ''}>Khusus Game</option>
            <option value="cinema" ${g.media_type === 'cinema' ? 'selected' : ''}>Khusus Film / Cinema</option>
            <option value="music" ${g.media_type === 'music' ? 'selected' : ''}>Khusus Musik</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea class="form-input" name="description" rows="2" placeholder="Keterangan singkat...">${escapeHtml(g.description || '')}</textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-genre')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);
  },
  async handleSaveGenre(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = { name: form.name.value, media_type: form.media_type.value, description: form.description.value };
    try {
      if (id) await api.put(`/api/taxonomy/genres/${id}`, body);
      else await api.post('/api/taxonomy/genres', body);
      showToast('Genre berhasil disimpan', 'success');
      this.closeModal('modal-genre');
      this.loadTaxonomyData();
    } catch (err) { showToast(err.message, 'error'); }
  },

  openAddCreatorModal() { this.openCreatorModal(null); },
  openEditCreatorModal(id, name, role, bio) { this.openCreatorModal({ id, name, role, bio }); },
  openCreatorModal(item) {
    const isEdit = !!item;
    const c = item || { name: '', role: 'Aktor', bio: '' };
    this.createModal('modal-creator', isEdit ? 'Edit Tokoh' : 'Tambah Tokoh / Kreator', `
      <form onsubmit="app.handleSaveCreator(event, ${isEdit ? c.id : 'null'})">
        <div class="form-group">
          <label class="form-label">Nama Tokoh / Entitas *</label>
          <input type="text" class="form-input" name="name" required value="${escapeHtml(c.name)}" placeholder="Contoh: Christopher Nolan">
        </div>
        <div class="form-group">
          <label class="form-label">Peran / Profesi *</label>
          <select class="form-select" name="role">
            <option value="Aktor" ${c.role === 'Aktor' ? 'selected' : ''}>Aktor / Pemeran</option>
            <option value="Sutradara" ${c.role === 'Sutradara' ? 'selected' : ''}>Sutradara</option>
            <option value="Musisi / Band" ${c.role.includes('Musisi') ? 'selected' : ''}>Musisi / Band</option>
            <option value="Komposer" ${c.role === 'Komposer' ? 'selected' : ''}>Komposer Musik</option>
            <option value="Developer / Game Director" ${c.role.includes('Developer') ? 'selected' : ''}>Developer Game</option>
            <option value="Studio Animasi" ${c.role.includes('Studio') ? 'selected' : ''}>Studio Animasi / Film</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Biografi Singkat</label>
          <textarea class="form-input" name="bio" rows="3" placeholder="Profil atau karya legendaris...">${escapeHtml(c.bio || '')}</textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-creator')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);
  },
  async handleSaveCreator(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = { name: form.name.value, role: form.role.value, bio: form.bio.value };
    try {
      if (id) await api.put(`/api/taxonomy/creators/${id}`, body);
      else await api.post('/api/taxonomy/creators', body);
      showToast('Data tokoh berhasil disimpan', 'success');
      this.closeModal('modal-creator');
      this.loadTaxonomyData();
    } catch (err) { showToast(err.message, 'error'); }
  },

  openAddPlatformModal() { this.openPlatformModal(null); },
  openEditPlatformModal(id, name, category, notes) { this.openPlatformModal({ id, name, category, notes }); },
  openPlatformModal(item) {
    const isEdit = !!item;
    const p = item || { name: '', category: 'Game Platform', notes: '' };
    this.createModal('modal-platform', isEdit ? 'Edit Platform & Media' : 'Tambah Platform / Media', `
      <form onsubmit="app.handleSavePlatform(event, ${isEdit ? p.id : 'null'})">
        <div class="form-group">
          <label class="form-label">Nama Platform / Media *</label>
          <input type="text" class="form-input" name="name" required value="${escapeHtml(p.name)}" placeholder="Contoh: PlayStation 5, FLAC Lossless">
        </div>
        <div class="form-group">
          <label class="form-label">Kategori *</label>
          <select class="form-select" name="category">
            <option value="Game Platform" ${p.category === 'Game Platform' ? 'selected' : ''}>Game Platform (Steam, PS5, Switch, Android...)</option>
            <option value="Audio/Video Format" ${p.category.includes('Format') ? 'selected' : ''}>Audio/Video Format (FLAC, 4K UHD, MKV...)</option>
            <option value="Distributor / Lisensi" ${p.category.includes('Distributor') ? 'selected' : ''}>Distributor / Layanan Streaming (Spotify, Netflix...)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan / Lisensi</label>
          <input type="text" class="form-input" name="notes" value="${escapeHtml(p.notes || '')}" placeholder="Catatan format atau distribusi...">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-platform')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);
  },
  async handleSavePlatform(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = { name: form.name.value, category: form.category.value, notes: form.notes.value };
    try {
      if (id) await api.put(`/api/taxonomy/platforms/${id}`, body);
      else await api.post('/api/taxonomy/platforms', body);
      showToast('Platform berhasil disimpan', 'success');
      this.closeModal('modal-platform');
      this.loadTaxonomyData();
    } catch (err) { showToast(err.message, 'error'); }
  },

  openAddStatusModal() { this.openStatusModal(null); },
  openEditStatusModal(id, name, badge_color, description) {
    this.openStatusModal({ id, name, badge_color, description });
  },
  openStatusModal(item) {
    const isEdit = !!item;
    const s = item || { name: '', badge_color: 'badge-success', description: '' };
    const badgeOptions = [
      { val: 'badge-success', label: 'Hijau (Purchase / Original / Aktif)' },
      { val: 'badge-info', label: 'Biru Muda (Wishlist / Rencana)' },
      { val: 'badge-purple', label: 'Ungu (Free / Gratis)' },
      { val: 'badge-steam', label: 'Cyan Steam (Link Steam)' },
      { val: 'badge-epic', label: 'Abu-abu Gelap (Free EGS / Link EGS)' },
      { val: 'badge-ubisoft', label: 'Biru Ubisoft (Free Ubisoft / Link Ubi)' },
      { val: 'badge-repack', label: 'Merah (Crack / Repack)' },
      { val: 'badge-neutral', label: 'Netral (Abu-abu)' }
    ];

    this.createModal('modal-status', isEdit ? 'Edit Status Kepemilikan' : 'Tambah Status Kepemilikan', `
      <form onsubmit="app.handleSaveStatus(event, ${isEdit ? s.id : 'null'})">
        <div class="form-group">
          <label class="form-label">Nama Status Kepemilikan *</label>
          <input type="text" class="form-input" name="name" required value="${escapeHtml(s.name)}" placeholder="Contoh: Purchase, Free, Crack, Wishlist">
        </div>
        <div class="form-group">
          <label class="form-label">Warna Badge Tampilan *</label>
          <select class="form-select" name="badge_color">
            ${badgeOptions.map(o => `<option value="${o.val}" ${s.badge_color === o.val ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan / Deskripsi</label>
          <input type="text" class="form-input" name="description" value="${escapeHtml(s.description || '')}" placeholder="Keterangan singkat hak kepemilikan...">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-status')">Batal</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
        </div>
      </form>
    `);
  },
  async handleSaveStatus(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = { name: form.name.value, badge_color: form.badge_color.value, description: form.description.value };
    try {
      if (id) await api.put(`/api/taxonomy/statuses/${id}`, body);
      else await api.post('/api/taxonomy/statuses', body);
      showToast('Status kepemilikan berhasil disimpan', 'success');
      this.closeModal('modal-status');
      this.loadTaxonomyData();
    } catch (err) { showToast(err.message, 'error'); }
  },

  confirmDeleteTaxonomy(endpoint, id, name) {
    if (confirm(`Hapus "${name}" dari data master?`)) {
      api.delete(`/api/taxonomy/${endpoint}/${id}`).then(() => {
        showToast('Berhasil dihapus', 'success');
        this.loadTaxonomyData();
      }).catch(err => showToast(err.message, 'error'));
    }
  }
});
