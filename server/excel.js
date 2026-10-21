// ============================================================
// SaumaBox — Excel (.xlsx/.xls) Processing Engine
// Reads & generates high-fidelity Excel spreadsheets using SheetJS
// ============================================================

const XLSX = require('xlsx');

/**
 * Membaca file Excel (.xlsx, .xls) dan mengekstrak baris, kolom, dan daftar sheet
 * @param {string} filePath - Path ke file Excel temporary
 * @param {string|null} selectedSheet - Nama sheet opsional (default sheet pertama)
 * @returns {object} { headers, rows, sheets, sheetName, totalRows }
 */
function parseExcel(filePath, selectedSheet = null) {
  const workbook = XLSX.readFile(filePath, { cellDates: true, cellNF: false });
  const sheets = workbook.SheetNames;
  if (!sheets || sheets.length === 0) {
    return { headers: [], rows: [], sheets: [], sheetName: '', totalRows: 0 };
  }

  const activeSheet = (selectedSheet && sheets.includes(selectedSheet)) ? selectedSheet : sheets[0];
  const worksheet = workbook.Sheets[activeSheet];

  if (!worksheet) {
    return { headers: [], rows: [], sheets, sheetName: activeSheet, totalRows: 0 };
  }

  // Konversi worksheet ke array of objects
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

  let headers = [];
  if (rawRows.length > 0) {
    headers = Object.keys(rawRows[0]);
  } else {
    // Ambil header dari baris pertama jika sheet tidak memiliki data
    const ref = worksheet['!ref'];
    if (ref) {
      const range = XLSX.utils.decode_range(ref);
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
        if (cell && cell.v !== undefined) headers.push(String(cell.v).trim());
      }
    }
  }

  // Bersihkan data baris (trim strings)
  const rows = rawRows.map(r => {
    const cleanRow = {};
    for (const [k, v] of Object.entries(r)) {
      cleanRow[k] = typeof v === 'string' ? v.trim() : v;
    }
    return cleanRow;
  });

  return {
    headers,
    rows,
    sheets,
    sheetName: activeSheet,
    totalRows: rows.length
  };
}

/**
 * Menghasilkan buffer file Excel (.xlsx) dengan styling lebar kolom otomatis
 * @param {string} targetModule - Nama modul (games, cinema, music)
 * @param {Array<object>} data - Data baris dari database
 * @param {Array<object>} headers - Metadata kolom [{ key, label }]
 * @returns {Buffer} Buffer binary file .xlsx
 */
function generateExcel(targetModule, data, headers) {
  // Format ulang key baris menjadi label manusiawi
  const formattedData = data.map(item => {
    const row = {};
    for (const h of headers) {
      const val = item[h.key];
      row[h.label || h.key] = val !== undefined && val !== null ? val : '';
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Auto kalkulasi lebar kolom agar rapi saat dibuka di Microsoft Excel
  const colWidths = headers.map(h => {
    const label = h.label || h.key;
    let maxLen = label.length;
    for (const item of data.slice(0, 50)) {
      const val = item[h.key];
      if (val) maxLen = Math.max(maxLen, String(val).length);
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  const sheetTitle = targetModule ? (targetModule.charAt(0).toUpperCase() + targetModule.slice(1)) : 'Katalog';
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  parseExcel,
  generateExcel
};
