// ============================================================
// SaumaBox — Import & Export Module (Minimalist & Antislop)
// ============================================================

Object.assign(app, {
  openImportModal(defaultModule = 'games') {
    const selectedModule = defaultModule || 'games';

    this.createModal('modal-import', 'Impor Data Katalog', `
      <div id="import-step-upload">
        <div class="io-mode-toggle" role="tablist" aria-label="Pilihan Alur Data">
          <button type="button" class="io-mode-btn active" role="tab" aria-selected="true">
            ${getIcon('upload', 'ui-icon', 15)} Impor
          </button>
          <button type="button" class="io-mode-btn" role="tab" aria-selected="false" onclick="app.closeModal('modal-import'); app.openExportModal(document.getElementById('import-target-module').value);">
            ${getIcon('download', 'ui-icon', 15)} Ekspor
          </button>
        </div>

        <p class="io-subtitle">
          Pilih katalog tujuan dan unggah berkas data untuk ditambahkan ke koleksi.
        </p>

        <div class="form-group">
          <label class="form-label" for="import-target-module">Katalog Tujuan</label>
          <select class="form-select" id="import-target-module">
            <option value="games" ${selectedModule === 'games' ? 'selected' : ''}>Katalog Games</option>
            <option value="cinema" ${selectedModule === 'cinema' ? 'selected' : ''}>Katalog Cinema</option>
            <option value="music" ${selectedModule === 'music' ? 'selected' : ''}>Katalog Musik</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Berkas Data</label>
          <div class="io-dropzone" id="io-dropzone"
               onclick="document.getElementById('import-file-input').click()"
               ondragover="event.preventDefault(); this.classList.add('dragover');"
               ondragleave="this.classList.remove('dragover');"
               ondrop="event.preventDefault(); this.classList.remove('dragover'); if(event.dataTransfer.files.length){ const inp = document.getElementById('import-file-input'); inp.files = event.dataTransfer.files; app.handleImportFileSelect(inp); }">
            <input type="file" id="import-file-input" style="display:none;" accept=".xlsx, .xls, .csv, .json, text/csv, application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onchange="app.handleImportFileSelect(this)">
            
            <div class="io-dropzone-empty" id="io-dropzone-empty">
              <div class="io-dropzone-icon">
                ${getIcon('upload', 'ui-icon', 20)}
              </div>
              <div class="io-dropzone-title">Pilih berkas atau seret ke sini</div>
              <div class="io-dropzone-hint">Mendukung format Excel (.xlsx), CSV (.csv), dan JSON (.json) hingga 10 MB</div>
            </div>

            <div class="io-dropzone-selected" id="io-dropzone-selected" style="display:none;">
              <span class="io-file-badge font-mono" id="io-file-badge">FILE</span>
              <div class="io-file-details">
                <div class="io-file-name" id="io-file-name">berkas.xlsx</div>
                <div class="io-file-size" id="io-file-size">0 KB</div>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); app.clearImportFile();" style="padding:4px 8px; font-size:0.75rem;">Ganti</button>
            </div>
          </div>
        </div>

        <div class="io-modal-actions">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-import')">Batal</button>
          <button type="button" class="btn btn-primary" onclick="app.uploadImportFile()">Lanjut ke Pemetaan</button>
        </div>
      </div>

      <div id="import-step-mapping" style="display:none;"></div>
    `);
  },

  handleImportFileSelect(input) {
    const file = input && input.files ? input.files[0] : null;
    const emptyEl = document.getElementById('io-dropzone-empty');
    const selEl = document.getElementById('io-dropzone-selected');
    const nameEl = document.getElementById('io-file-name');
    const sizeEl = document.getElementById('io-file-size');
    const badgeEl = document.getElementById('io-file-badge');

    if (!file) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (selEl) selEl.style.display = 'none';
      return;
    }

    const ext = file.name.split('.').pop().toUpperCase();
    if (emptyEl) emptyEl.style.display = 'none';
    if (selEl) selEl.style.display = 'flex';
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    if (badgeEl) badgeEl.textContent = ext;
  },

  clearImportFile() {
    const input = document.getElementById('import-file-input');
    if (input) input.value = '';
    this.handleImportFileSelect(null);
  },

  async uploadImportFile() {
    const fileInput = document.getElementById('import-file-input');
    const targetModule = document.getElementById('import-target-module').value;
    if (!fileInput || !fileInput.files[0]) return showToast('Pilih berkas spreadsheet atau JSON terlebih dahulu.', 'warning');

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    try {
      showToast('Menganalisis susunan kolom berkas...', 'info');
      const res = await api.upload('/api/data/import-preview', formData);
      this.renderMappingStep(res, targetModule);
    } catch (err) { showToast(err.message, 'error'); }
  },

  renderMappingStep(previewData, targetModule) {
    document.getElementById('import-step-upload').style.display = 'none';
    const mappingContainer = document.getElementById('import-step-mapping');
    mappingContainer.style.display = 'block';

    const sheetSelector = (previewData.sheets && previewData.sheets.length > 1) ? `
      <div class="form-group" style="margin-bottom:14px;">
        <label class="form-label">Lembar Kerja (Sheet Excel)</label>
        <select class="form-select" id="import-sheet-select">
          ${previewData.sheets.map(s => `<option value="${escapeHtml(s)}" ${s === previewData.sheet_name ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
        </select>
      </div>
    ` : '';

    const formatBadge = previewData.format === 'excel'
      ? '<span class="io-file-badge font-mono">XLSX</span>'
      : (previewData.format === 'json' ? '<span class="io-file-badge font-mono">JSON</span>' : '<span class="io-file-badge font-mono">CSV</span>');

    const targetFields = ({
      games: [{ key: 'title', label: 'Judul Game' }, { key: 'type', label: 'Tipe' }, { key: 'year', label: 'Tahun Rilis' }, { key: 'genre', label: 'Genre' }, { key: 'developer', label: 'Pengembang' }, { key: 'publisher', label: 'Penerbit' }, { key: 'platform', label: 'Platform' }, { key: 'price', label: 'Harga' }, { key: 'rating', label: 'Rating' }, { key: 'status', label: 'Status' }],
      cinema: [{ key: 'title', label: 'Judul Tayangan' }, { key: 'type', label: 'Tipe' }, { key: 'year', label: 'Tahun Rilis' }, { key: 'genre', label: 'Genre' }, { key: 'director', label: 'Sutradara' }, { key: 'studio', label: 'Studio' }, { key: 'rating', label: 'Rating' }, { key: 'watched', label: 'Ditonton' }],
      music: [{ key: 'title', label: 'Judul Trek' }, { key: 'artist', label: 'Artis' }, { key: 'album', label: 'Album' }, { key: 'year', label: 'Tahun' }, { key: 'genre', label: 'Genre' }, { key: 'platform', label: 'Platform' }, { key: 'rating', label: 'Rating' }, { key: 'is_favorite', label: 'Favorit' }]
    })[targetModule] || [];

    const mappingRows = targetFields.map(f => `
      <tr>
        <td style="font-weight:600; font-size:0.86rem; color:var(--text-primary);">${f.label}</td>
        <td>
          <select class="form-select mapping-select" data-key="${f.key}" style="padding:6px 10px; font-size:0.85rem;">
            <option value="">(Abaikan)</option>
            ${previewData.headers.map(h => `<option value="${escapeHtml(h)}" ${h === previewData.suggested_mapping[f.key] ? 'selected' : ''}>${escapeHtml(h)}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');

    mappingContainer.innerHTML = `
      <div style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <h3 style="margin:0; font-size:1.05rem;">Pemetaan Kolom</h3>
          ${formatBadge}
        </div>
        <p class="io-subtitle" style="margin:0;">
          Berkas: <strong>${escapeHtml(previewData.filename)}</strong> (${previewData.total_rows} baris terdeteksi)
        </p>
      </div>
      ${sheetSelector}
      <div class="table-responsive" style="max-height:260px; margin-bottom:16px; border:1px solid var(--border-color); border-radius:var(--radius-card);">
        <table class="data-table">
          <thead><tr><th style="width:40%;">Kolom SaumaBox</th><th>Kolom Berkas</th></tr></thead>
          <tbody>${mappingRows}</tbody>
        </table>
      </div>
      <div class="io-modal-actions">
        <button type="button" class="btn btn-secondary" onclick="app.openImportModal('${targetModule}')">Kembali</button>
        <button type="button" class="btn btn-primary" onclick="app.executeImport('${previewData.temp_file_id}', '${targetModule}')">Mulai Impor</button>
      </div>
    `;
  },

  async executeImport(tempFileId, targetModule) {
    const selects = document.querySelectorAll('.mapping-select');
    const mapping = {};
    selects.forEach(sel => { if (sel.value) mapping[sel.dataset.key] = sel.value; });
    if (!mapping.title) return showToast('Kolom Judul wajib dipetakan agar data tersimpan dengan benar.', 'warning');

    const sheetSelect = document.getElementById('import-sheet-select');
    const sheetName = sheetSelect ? sheetSelect.value : null;

    try {
      showToast('Menyimpan data baru ke dalam katalog...', 'info');
      const res = await api.post('/api/data/import-execute', {
        temp_file_id: tempFileId,
        module: targetModule,
        mapping,
        sheet_name: sheetName
      });
      this.closeModal('modal-import');
      showToast(`Katalog berhasil diperbarui dengan ${res.success_count} entri baru.`, 'success');
      this.navigate(targetModule);
    } catch (err) { showToast(err.message, 'error'); }
  },

  openExportModal(defaultModule = 'games') {
    const selectedModule = defaultModule || 'games';

    this.createModal('modal-export', 'Ekspor Data Katalog', `
      <div class="io-mode-toggle" role="tablist" aria-label="Pilihan Alur Data">
        <button type="button" class="io-mode-btn" role="tab" aria-selected="false" onclick="app.closeModal('modal-export'); app.openImportModal(document.getElementById('export-module-select').value);">
          ${getIcon('upload', 'ui-icon', 15)} Impor
        </button>
        <button type="button" class="io-mode-btn active" role="tab" aria-selected="true">
          ${getIcon('download', 'ui-icon', 15)} Ekspor
        </button>
      </div>

      <p class="io-subtitle">
        Pilih katalog dan format berkas yang ingin Anda unduh ke perangkat.
      </p>

      <div class="form-group">
        <label class="form-label" for="export-module-select">Katalog Sumber</label>
        <select class="form-select" id="export-module-select">
          <option value="games" ${selectedModule === 'games' ? 'selected' : ''}>Katalog Games</option>
          <option value="cinema" ${selectedModule === 'cinema' ? 'selected' : ''}>Katalog Cinema</option>
          <option value="music" ${selectedModule === 'music' ? 'selected' : ''}>Katalog Musik</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Format Berkas</label>
        <div class="io-format-grid" role="radiogroup" aria-label="Format Berkas Ekspor">
          <label class="io-format-card">
            <input type="radio" name="export-format" value="xlsx" checked class="io-format-input">
            <div class="io-format-content">
              <div class="io-format-head">
                <span class="io-format-name">Excel</span>
                <span class="io-format-ext font-mono">.xlsx</span>
              </div>
              <span class="io-format-desc">Spreadsheet standar</span>
            </div>
          </label>
          <label class="io-format-card">
            <input type="radio" name="export-format" value="csv" class="io-format-input">
            <div class="io-format-content">
              <div class="io-format-head">
                <span class="io-format-name">CSV</span>
                <span class="io-format-ext font-mono">.csv</span>
              </div>
              <span class="io-format-desc">Tabel teks UTF-8</span>
            </div>
          </label>
          <label class="io-format-card">
            <input type="radio" name="export-format" value="json" class="io-format-input">
            <div class="io-format-content">
              <div class="io-format-head">
                <span class="io-format-name">JSON</span>
                <span class="io-format-ext font-mono">.json</span>
              </div>
              <span class="io-format-desc">Objek data terstruktur</span>
            </div>
          </label>
        </div>
      </div>

      <div class="io-modal-actions">
        <button type="button" class="btn btn-secondary" onclick="app.closeModal('modal-export')">Batal</button>
        <button type="button" class="btn btn-primary" onclick="app.triggerExportDownload()">
          ${getIcon('download', 'ui-icon-btn', 14)} Unduh Berkas
        </button>
      </div>
    `);
  },

  triggerExportDownload() {
    const moduleSelect = document.getElementById('export-module-select');
    const moduleName = moduleSelect ? moduleSelect.value : 'games';
    const checkedRadio = document.querySelector('input[name="export-format"]:checked');
    const format = checkedRadio ? checkedRadio.value : 'xlsx';

    this.exportData(moduleName, format);
    this.closeModal('modal-export');
  },

  exportData(moduleName, format = 'xlsx') {
    window.location.href = `/api/data/export?module=${moduleName}&format=${format}`;
    showToast(`Menyiapkan berkas ekspor ${moduleName.toUpperCase()} (${format.toUpperCase()})...`, 'info');
  }
});
