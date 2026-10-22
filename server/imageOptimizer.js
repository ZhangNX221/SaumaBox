const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

// Disable Sharp internal file caching to prevent file locking on Windows
sharp.cache(false);

const MAX_IMAGE_SIZE = 200 * 1024; // 204,800 bytes (200 KB)
const TARGET_CEILING_SIZE = 195 * 1024; // 195 KB safety ceiling

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Compress an image file so its size is strictly <= 200 KB (targeting 100 - 195 KB).
 * @param {string} filePath Absolute or relative path to the image file
 * @param {object} options Optional configuration
 * @returns {Promise<{compressed: boolean, originalSize: number, newSize: number, originalFormatted: string, newFormatted: string}>}
 */
async function compressImageFile(filePath, options = {}) {
  const maxBytes = options.maxBytes || MAX_IMAGE_SIZE;
  if (!fs.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  const originalSize = stat.size;

  // If already <= 200 KB and force is not set, keep as-is
  if (originalSize <= maxBytes && !options.force) {
    return {
      compressed: false,
      originalSize,
      newSize: originalSize,
      originalFormatted: formatBytes(originalSize),
      newFormatted: formatBytes(originalSize),
      reason: 'Sudah di bawah 200 KB'
    };
  }

  const ext = path.extname(filePath).toLowerCase();
  // Vector graphics or animated GIFs are preserved
  if (ext === '.svg' || ext === '.gif') {
    return {
      compressed: false,
      originalSize,
      newSize: originalSize,
      originalFormatted: formatBytes(originalSize),
      newFormatted: formatBytes(originalSize),
      reason: 'Format vektor atau GIF dipertahankan'
    };
  }

  // Read into memory buffer to prevent Windows EBUSY / file locking
  const inputBuffer = fs.readFileSync(filePath);
  const metadata = await sharp(inputBuffer).metadata();

  let width = metadata.width || 1200;
  if (width > 1200) width = 1200; // Optimal HD cover dimensions

  let quality = options.initialQuality || 85;
  let bestBuffer = null;

  // Progressive compression loop: adjusts quality and resolution if needed
  for (let attempt = 0; attempt < 8; attempt++) {
    const pipeline = sharp(inputBuffer).resize({
      width: Math.round(width),
      withoutEnlargement: true,
      fit: 'inside'
    });

    let currentBuffer;
    if (metadata.format === 'png') {
      currentBuffer = await pipeline
        .png({
          quality: Math.max(quality, 50),
          compressionLevel: 9,
          palette: true,
          effort: 7
        })
        .toBuffer();
    } else if (metadata.format === 'webp') {
      currentBuffer = await pipeline
        .webp({ quality, effort: 5 })
        .toBuffer();
    } else {
      currentBuffer = await pipeline
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    bestBuffer = currentBuffer;

    if (currentBuffer.length <= maxBytes) {
      break;
    }

    quality -= 8;
    if (quality < 45) {
      width = Math.floor(width * 0.85);
      quality = 70;
    }
  }

  if (bestBuffer && bestBuffer.length < originalSize) {
    fs.writeFileSync(filePath, bestBuffer);
    const newStat = fs.statSync(filePath);
    return {
      compressed: true,
      originalSize,
      newSize: newStat.size,
      originalFormatted: formatBytes(originalSize),
      newFormatted: formatBytes(newStat.size)
    };
  }

  return {
    compressed: false,
    originalSize,
    newSize: originalSize,
    originalFormatted: formatBytes(originalSize),
    newFormatted: formatBytes(originalSize)
  };
}

/**
 * Compress all images in a given directory that exceed maxBytes (<= 200 KB).
 * @param {string} dirPath Directory to scan
 * @param {object} options
 * @returns {Promise<{totalChecked: number, totalCompressed: number, spaceSaved: number, spaceSavedFormatted: string, files: Array}>}
 */
async function compressDirectory(dirPath, options = {}) {
  const maxBytes = options.maxBytes || MAX_IMAGE_SIZE;
  if (!fs.existsSync(dirPath)) {
    return { totalChecked: 0, totalCompressed: 0, spaceSaved: 0, spaceSavedFormatted: '0 B', files: [] };
  }

  const entries = fs.readdirSync(dirPath);
  let totalChecked = 0;
  let totalCompressed = 0;
  let spaceSaved = 0;
  const fileResults = [];

  for (const f of entries) {
    const fullPath = path.join(dirPath, f);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    const ext = path.extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    totalChecked++;
    if (stat.size > maxBytes || options.force) {
      try {
        const res = await compressImageFile(fullPath, options);
        if (res.compressed) {
          totalCompressed++;
          const saved = res.originalSize - res.newSize;
          spaceSaved += saved;
          fileResults.push({
            filename: f,
            originalSize: res.originalSize,
            newSize: res.newSize,
            originalFormatted: res.originalFormatted,
            newFormatted: res.newFormatted,
            savedFormatted: formatBytes(saved)
          });
        }
      } catch (err) {
        console.error(`[imageOptimizer] Gagal kompres ${f}:`, err.message);
      }
    }
  }

  return {
    totalChecked,
    totalCompressed,
    spaceSaved,
    spaceSavedFormatted: formatBytes(spaceSaved),
    files: fileResults
  };
}

module.exports = {
  MAX_IMAGE_SIZE,
  formatBytes,
  compressImageFile,
  compressDirectory
};
