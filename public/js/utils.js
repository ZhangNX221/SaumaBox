// Utilitas & formatting SaumaBox

function formatRupiah(number) {
  if (number === null || number === undefined || number === 0) {
    return 'Rp 0';
  }
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return isoStr;
  }
}

function formatRating(rating) {
  if (rating === null || rating === undefined || rating === '') return '-';
  const num = parseFloat(rating);
  if (isNaN(num)) return '-';
  return '⭐ ' + num.toFixed(1).replace('.', ',');
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 3500);
}

function debounce(func, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function getPlatformBadgeClass(platform) {
  if (!platform) return 'badge-neutral';
  const p = platform.toLowerCase();
  if (p.includes('steam')) return 'badge-steam';
  if (p.includes('epic')) return 'badge-epic';
  if (p.includes('ubisoft') || p.includes('uplay')) return 'badge-ubisoft';
  if (p.includes('gog')) return 'badge-gog';
  if (p.includes('crack') || p.includes('fitgirl') || p.includes('repack')) return 'badge-repack';
  return 'badge-neutral';
}

function getStatusBadgeClass(status) {
  if (!status) return 'badge-neutral';
  const s = status.toLowerCase();
  if (s.includes('purchase') || s.includes('playable') || s.includes('installed') || s.includes('completed')) {
    return 'badge-success';
  }
  if (s.includes('wishlist')) return 'badge-info';
  if (s.includes('free') || s.includes('backlog')) return 'badge-purple';
  if (s.includes('crack') || s.includes('unplayable')) return 'badge-repack';
  return 'badge-neutral';
}

function getCinemaTypeBadgeClass(type) {
  if (!type) return 'badge-neutral';
  const t = type.toUpperCase();
  if (t === 'MOVIE') return 'badge-info';
  if (t === 'ANIME') return 'badge-purple';
  if (t === 'SERIES') return 'badge-steam';
  return 'badge-neutral';
}

function getAvatarColor(char) {
  const colors = [
    'linear-gradient(135deg, #4f46e5, #7c3aed)',
    'linear-gradient(135deg, #0284c7, #0369a1)',
    'linear-gradient(135deg, #059669, #047857)',
    'linear-gradient(135deg, #d97706, #b45309)',
    'linear-gradient(135deg, #dc2626, #b91c1c)',
    'linear-gradient(135deg, #9333ea, #7e22ce)',
    'linear-gradient(135deg, #db2777, #be185d)'
  ];
  const code = (char || 'S').charCodeAt(0);
  return colors[code % colors.length];
}


