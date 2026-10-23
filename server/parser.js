// Parser & data cleaning sesuai spesifikasi PRD 09

function cleanPrice(val) {
  if (val === null || val === undefined) return 0;
  const str = String(val).trim();
  if (str === '-' || str === '' || str.toLowerCase() === 'free' || str.toLowerCase() === 'rp -') return 0;
  // Hapus semua selain angka
  const cleaned = str.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function cleanRating(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (str === '-' || str === '' || str.toLowerCase() === 'tba') return null;
  // Ubah koma jadi titik: 6,6 -> 6.6
  const num = parseFloat(str.replace(',', '.'));
  return isNaN(num) ? null : Math.min(10, Math.max(0, num));
}

function cleanYear(val) {
  if (!val) return null;
  const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) || num < 1900 || num > 2100 ? null : num;
}

function cleanSizeGb(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str === '-' || str === '') return '';
  if (str.toUpperCase() === 'TBA') return 'TBA';
  return str.replace(',', '.');
}

function cleanText(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (str === '-') return fallback;
  return str;
}

function cleanWatched(val) {
  if (val === true || val === 1 || val === '1') return 1;
  if (!val) return 0;
  const str = String(val).trim().toLowerCase();
  return (str === 'sudah' || str === 'ya' || str === 'yes' || str === 'completed' || str === 'tamat' || str === 'sudah tamat' || str === 'true' || str === 'checked' || str === '1') ? 1 : 0;
}

// Robust CSV Parser (RFC 4180 compliant)
function parseCSV(text) {
  // Hapus UTF-8 BOM jika ada
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuote) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // lewati quote kedua
      } else if (char === '"') {
        insideQuote = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // Abaikan \r
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] !== undefined ? row[index] : '';
    });
    data.push(item);
  }

  return { headers, rows: data };
}

// CSV Generator
function generateCSV(headers, data) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(h => escapeCell(h.label || h.key)).join(',');
  const rows = data.map(item => {
    return headers.map(h => escapeCell(item[h.key])).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

// Smart Column Mapping dictionary
const COLUMN_ALIASES = {
  title: ['games aaa', 'judul', 'title', 'nama game', 'judul game', 'name', 'nama', 'judul lagu / album', 'judul lagu', 'trek', 'judul web', 'nama web', 'nama aplikasi', 'bookmark'],
  year: ['year', 'tahun', 'tahun rilis', 'release year'],
  publisher: ['publisher', 'penerbit'],
  developer: ['developer', 'pengembang', 'studio'],
  size_gb: ['size pc (gb)', 'size pc(gb)', 'size (gb)', 'size', 'ukuran', 'ukuran (gb)', 'size pc'],
  rating: ['rating (imdb)', 'rating', 'skor', 'score', 'nilai', 'rating pribadi'],
  platform: ['platform pc', 'platform', 'platform / format', 'sumber'],
  status: ['status', 'status kepemilikan', 'status kompatibilitas / main', 'kondisi'],
  price: ['harga & kalkulasi total (idr)', 'harga', 'price', 'harga (idr)', 'total idr', 'biaya'],
  console: ['konsol asal', 'console', 'konsol', 'base console'],
  emulator: ['software emulator', 'emulator', 'emu'],
  rom_format: ['format file', 'rom/iso format', 'rom format', 'format'],
  port_year: ['tahun port', 'port year', 'tahun rilis port'],
  port_developer: ['tim porting / engine', 'port developer', 'porting team', 'engine'],
  port_version: ['versi build', 'port version', 'versi', 'version'],
  enhancements: ['fitur tambahan', 'enhancements', 'fitur', 'mods'],
  type: ['sub-kategori', 'tipe', 'type', 'kategori'],
  watched: ['status tontonan', 'watched', 'ditonton', 'selesai'],
  total_episodes: ['total episode', 'episode', 'episodes', 'total episode / season'],
  total_seasons: ['total season', 'seasons', 'season'],
  country: ['negara', 'country', 'asal negara'],
  studio: ['studio', 'rumah produksi'],
  age_rating: ['klasifikasi usia', 'rating umur', 'age rating', 'sensor'],
  genre: ['genre', 'kategori genre', 'tag'],
  completed: ['status tamat', 'tamat', 'completed', 'sudah tamat', 'selesai tamat'],
  artist: ['artis', 'artist', 'penyanyi', 'band', 'komposer', 'artis / band'],
  album: ['album', 'album & tahun rilis'],
  size_mb: ['ukuran file', 'size mb', 'size (mb)', 'size_mb'],
  is_favorite: ['favorit', 'is_favorite', 'favorite', 'fav', 'status favorit'],
  url: ['url website', 'url', 'link', 'tautan', 'website', 'alamat web', 'web url', 'href'],
  category: ['kategori', 'category', 'kelompok', 'grup', 'group', 'tag'],
  description: ['deskripsi', 'description', 'keterangan', 'ringkasan', 'catatan'],
  icon_url: ['url ikon', 'icon_url', 'icon', 'favicon', 'logo', 'ikon'],
  bg_color: ['warna aksen', 'bg_color', 'color', 'warna', 'latar belakang', 'background'],
  is_pinned: ['disematkan (1/0)', 'disematkan', 'pinned', 'pin', 'is_pinned']
};

function autoMapColumns(inputHeaders) {
  const mapping = {};
  for (const rawHeader of inputHeaders) {
    const cleanHeader = rawHeader.toLowerCase().trim();
    for (const [targetKey, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.some(alias => cleanHeader === alias || cleanHeader.includes(alias))) {
        mapping[targetKey] = rawHeader;
        break;
      }
    }
  }
  return mapping;
}

module.exports = {
  cleanPrice,
  cleanRating,
  cleanYear,
  cleanSizeGb,
  cleanText,
  cleanWatched,
  cleanCompleted: cleanWatched,
  parseCSV,
  generateCSV,
  autoMapColumns
};
