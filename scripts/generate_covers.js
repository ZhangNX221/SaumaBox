const fs = require('node:fs');
const path = require('node:path');

const outDir = path.join(__dirname, '..', 'public', 'images', 'covers');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function createPosterSvg({ title, subtitle, category, year, bgGradient, accentColor, iconSvg, badgeText }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}" />
      <stop offset="50%" stop-color="${bgGradient[1]}" />
      <stop offset="100%" stop-color="${bgGradient[2]}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <pattern id="dither" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="none" />
      <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.08)" />
      <circle cx="5" cy="5" r="0.8" fill="rgba(255,255,255,0.08)" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="400" height="600" fill="url(#bg)" />
  <rect width="400" height="600" fill="url(#glow)" />
  <rect width="400" height="600" fill="url(#dither)" />

  <!-- Geometric Accents -->
  <rect x="20" y="20" width="360" height="560" rx="16" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
  <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
  <line x1="20" y1="460" x2="380" y2="460" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

  <!-- Top Bar -->
  <rect x="36" y="38" width="80" height="24" rx="12" fill="rgba(0,0,0,0.5)" stroke="${accentColor}" stroke-width="1" />
  <text x="76" y="54" fill="${accentColor}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">${category}</text>
  
  <text x="364" y="55" fill="rgba(255,255,255,0.7)" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" text-anchor="end">${year || '2024'}</text>

  <!-- Central Graphic / Icon -->
  <g transform="translate(200, 260) scale(2.2)">
    ${iconSvg}
  </g>

  <!-- Title & Meta Area -->
  <rect x="36" y="475" width="100" height="22" rx="11" fill="rgba(255,255,255,0.12)" />
  <text x="86" y="490" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">${badgeText || 'ARCHIVE'}</text>

  <text x="36" y="525" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="22" font-weight="800" letter-spacing="-0.5">
    ${escapeSvg(title)}
  </text>
  <text x="36" y="550" fill="rgba(255,255,255,0.65)" font-family="'Outfit', sans-serif" font-size="13" font-weight="500">
    ${escapeSvg(subtitle)}
  </text>
</svg>`;
}

function createAlbumSvg({ title, artist, album, year, bgGradient, accentColor, iconSvg, badgeText }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}" />
      <stop offset="60%" stop-color="${bgGradient[1]}" />
      <stop offset="100%" stop-color="${bgGradient[2]}" />
    </linearGradient>
    <radialGradient id="vinyl" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#111115" />
      <stop offset="60%" stop-color="#18181d" />
      <stop offset="100%" stop-color="#0a0a0c" />
    </radialGradient>
    <pattern id="dither" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="none" />
      <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.06)" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="500" height="500" fill="url(#bg)" />
  <rect width="500" height="500" fill="url(#dither)" />

  <!-- Vinyl Record Effect Behind Glass -->
  <circle cx="250" cy="210" r="140" fill="url(#vinyl)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  <circle cx="250" cy="210" r="115" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
  <circle cx="250" cy="210" r="90" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
  <circle cx="250" cy="210" r="65" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
  <circle cx="250" cy="210" r="35" fill="${accentColor}" opacity="0.9" />
  <circle cx="250" cy="210" r="10" fill="#09090b" />

  <!-- Central Icon inside vinyl or over -->
  <g transform="translate(250, 210) scale(1.5)">
    ${iconSvg}
  </g>

  <!-- Frame & Border -->
  <rect x="20" y="20" width="460" height="460" rx="16" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />

  <!-- Badge Top -->
  <rect x="36" y="36" width="90" height="24" rx="12" fill="rgba(0,0,0,0.6)" stroke="${accentColor}" stroke-width="1" />
  <text x="81" y="52" fill="${accentColor}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">${badgeText || 'HI-RES'}</text>
  <text x="464" y="53" fill="rgba(255,255,255,0.7)" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" text-anchor="end">${year || '2024'}</text>

  <!-- Audio Wave Bars -->
  <g transform="translate(36, 360)">
    <rect x="0" y="8" width="4" height="24" rx="2" fill="${accentColor}" opacity="0.8" />
    <rect x="8" y="2" width="4" height="30" rx="2" fill="${accentColor}" opacity="0.9" />
    <rect x="16" y="14" width="4" height="18" rx="2" fill="${accentColor}" opacity="0.7" />
    <rect x="24" y="0" width="4" height="32" rx="2" fill="${accentColor}" />
    <rect x="32" y="6" width="4" height="26" rx="2" fill="${accentColor}" opacity="0.85" />
    <rect x="40" y="12" width="4" height="20" rx="2" fill="${accentColor}" opacity="0.7" />
  </g>

  <!-- Title & Artist -->
  <text x="36" y="425" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5">
    ${escapeSvg(title)}
  </text>
  <text x="36" y="452" fill="rgba(255,255,255,0.75)" font-family="'Outfit', sans-serif" font-size="14" font-weight="500">
    ${escapeSvg(artist)} • ${escapeSvg(album)}
  </text>
</svg>`;
}

function escapeSvg(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Icon SVGs
const icons = {
  gamepad: `<g transform="translate(-16, -16)" fill="currentColor"><path d="M7 6h10a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-3a5 5 0 0 1 5-5zm2 5H7v2h2v2h2v-2h2v-2h-2V9H9v2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#ffffff" opacity="0.9"/></g>`,
  film: `<g transform="translate(-16, -16)"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 3v2h3V7H4zm0 4v2h3v-2H4zm0 4v2h3v-2H4zm13-8v2h3V7h-3zm0 4v2h3v-2h-3zm0 4v2h3v-2h-3z" fill="#ffffff" opacity="0.9"/></g>`,
  sword: `<g transform="translate(-16, -16)"><path d="M19.7 4.3a1 1 0 0 0-1.4 0l-9.9 9.9-2.1-.7a1 1 0 0 0-1.1.3l-2 2a1 1 0 0 0 0 1.4l3.5 3.5-3.5 3.5a1 1 0 1 0 1.4 1.4l3.5-3.5 3.5 3.5a1 1 0 0 0 1.4 0l2-2a1 1 0 0 0 .3-1.1l-.7-2.1 9.9-9.9a1 1 0 0 0 0-1.4l-4.9-4.9z" fill="#ffffff" opacity="0.9"/></g>`,
  music: `<g transform="translate(-16, -16)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#ffffff" opacity="0.95"/></g>`,
  flame: `<g transform="translate(-16, -16)"><path d="M12 2c-.5 2.5-3 4-3 7 0 2.8 2.2 5 5 5s5-2.2 5-5c0-4-3.5-5.5-4-7zm-1 9c-.5 0-1-.5-1-1 0-1 1-2 2-2.5 0 1.5-.5 3.5-1 3.5z" fill="#ffffff" opacity="0.9"/></g>`,
  star: `<g transform="translate(-16, -16)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ffffff" opacity="0.9"/></g>`
};

const items = [
  // Games
  {
    filename: 'cyberpunk2077.svg',
    type: 'poster',
    title: 'Cyberpunk 2077',
    subtitle: 'CD Projekt Red • GOG',
    category: 'PC GAME',
    year: '2020',
    bgGradient: ['#0d0d12', '#2a2202', '#060608'],
    accentColor: '#fcee0a',
    badgeText: 'RAY TRACING',
    iconSvg: icons.gamepad
  },
  {
    filename: 'it_takes_two.svg',
    type: 'poster',
    title: 'It Takes Two',
    subtitle: 'Hazelight Studios • Steam',
    category: 'PC GAME',
    year: '2021',
    bgGradient: ['#0a1826', '#14385c', '#09121a'],
    accentColor: '#38bdf8',
    badgeText: 'CO-OP GOTY',
    iconSvg: icons.star
  },
  {
    filename: 'far_cry.svg',
    type: 'poster',
    title: 'Far Cry New Dawn',
    subtitle: 'Ubisoft Montreal • Ubisoft',
    category: 'PC GAME',
    year: '2019',
    bgGradient: ['#1f0a20', '#4a154b', '#100612'],
    accentColor: '#f43f5e',
    badgeText: 'ULTIMATE ED',
    iconSvg: icons.flame
  },
  {
    filename: 'space_unbound.svg',
    type: 'poster',
    title: 'A Space for the Unbound',
    subtitle: 'Mojiken Studio • Toge',
    category: 'PC GAME',
    year: '2023',
    bgGradient: ['#071a28', '#133e5c', '#061019'],
    accentColor: '#67e8f9',
    badgeText: 'INDIE NARRATIVE',
    iconSvg: icons.star
  },
  {
    filename: 'silksong.svg',
    type: 'poster',
    title: 'Hollow Knight Silksong',
    subtitle: 'Team Cherry • Steam',
    category: 'PC GAME',
    year: '2025',
    bgGradient: ['#1e0d0d', '#421616', '#100707'],
    accentColor: '#ef4444',
    badgeText: 'WISHLISTED',
    iconSvg: icons.sword
  },
  {
    filename: 'god_of_war.svg',
    type: 'poster',
    title: 'God of War II',
    subtitle: 'Santa Monica • PCSX2',
    category: 'PS2 EMULATOR',
    year: '2007',
    bgGradient: ['#220d08', '#4d190d', '#0d0503'],
    accentColor: '#fb923c',
    badgeText: '60 FPS ISO',
    iconSvg: icons.sword
  },
  {
    filename: 'persona5.svg',
    type: 'poster',
    title: 'Persona 5 Royal',
    subtitle: 'Atlus • P-Studio • Ryujinx',
    category: 'SWITCH EMU',
    year: '2019',
    bgGradient: ['#260707', '#591010', '#120404'],
    accentColor: '#f87171',
    badgeText: '60 FPS NSP',
    iconSvg: icons.star
  },
  {
    filename: 'zelda_botw.svg',
    type: 'poster',
    title: 'Zelda Breath of the Wild',
    subtitle: 'Nintendo EPD • Cemu',
    category: 'WII U EMU',
    year: '2017',
    bgGradient: ['#051c14', '#0d402e', '#03100b'],
    accentColor: '#34d399',
    badgeText: 'MASTERPIECE',
    iconSvg: icons.sword
  },
  {
    filename: 'mgs3.svg',
    type: 'poster',
    title: 'Metal Gear Solid 3',
    subtitle: 'Konami • Snake Eater',
    category: 'PS2 EMULATOR',
    year: '2004',
    bgGradient: ['#141909', '#2d3814', '#0a0d05'],
    accentColor: '#a3e635',
    badgeText: 'STEALTH TACTICAL',
    iconSvg: icons.sword
  },
  {
    filename: 'ship_of_harkinian.svg',
    type: 'poster',
    title: 'Ship of Harkinian',
    subtitle: 'Harbour Masters • N64 Port',
    category: 'RECOMP PORT',
    year: '2022',
    bgGradient: ['#0f172a', '#1e293b', '#090d16'],
    accentColor: '#60a5fa',
    badgeText: '120FPS + HD PACK',
    iconSvg: icons.sword
  },
  {
    filename: 'opengoal.svg',
    type: 'poster',
    title: 'OpenGOAL Jak & Daxter',
    subtitle: 'OpenGOAL Team • PS2 Port',
    category: 'RECOMP PORT',
    year: '2023',
    bgGradient: ['#1e1408', '#42280d', '#100b04'],
    accentColor: '#f59e0b',
    badgeText: 'ULTRAWIDE 120FPS',
    iconSvg: icons.gamepad
  },
  {
    filename: 'mario64.svg',
    type: 'poster',
    title: 'Super Mario 64 PC',
    subtitle: 'SM64 Decomp • Render96',
    category: 'RECOMP PORT',
    year: '2020',
    bgGradient: ['#1c0c0c', '#3d1616', '#0e0606'],
    accentColor: '#f87171',
    badgeText: 'RAY TRACING 60FPS',
    iconSvg: icons.star
  },

  // Cinema
  {
    filename: 'aot.svg',
    type: 'poster',
    title: 'Attack on Titan Final',
    subtitle: 'MAPPA • Hajime Isayama',
    category: 'ANIME SERIES',
    year: '2020',
    bgGradient: ['#1f0909', '#421414', '#0f0505'],
    accentColor: '#f87171',
    badgeText: 'RATING 9.0',
    iconSvg: icons.sword
  },
  {
    filename: 'jujutsu_kaisen.svg',
    type: 'poster',
    title: 'Jujutsu Kaisen',
    subtitle: 'MAPPA • Gege Akutami',
    category: 'ANIME SERIES',
    year: '2020',
    bgGradient: ['#150921', '#32144f', '#0c0514'],
    accentColor: '#c084fc',
    badgeText: 'SHIBUYA INCIDENT',
    iconSvg: icons.flame
  },
  {
    filename: 'ada_apa_cinta.svg',
    type: 'poster',
    title: 'Ada Apa Dengan Cinta?',
    subtitle: 'Miles Films • Rudi Soedjarwo',
    category: 'INDONESIA MOVIE',
    year: '2002',
    bgGradient: ['#210915', '#4f1433', '#14050d'],
    accentColor: '#f472b6',
    badgeText: 'ROMANCE CLASSIC',
    iconSvg: icons.star
  },
  {
    filename: 'menit22.svg',
    type: 'poster',
    title: '22 Menit',
    subtitle: 'Buttonijo Games • Eugene Panji',
    category: 'ACTION THRILLER',
    year: '2018',
    bgGradient: ['#1e140d', '#422a1a', '#0f0a06'],
    accentColor: '#fb923c',
    badgeText: 'INDONESIA ACTION',
    iconSvg: icons.film
  },
  {
    filename: 'srikandi3.svg',
    type: 'poster',
    title: '3 Srikandi',
    subtitle: 'MVP Pictures • Iman Brotoseno',
    category: 'BIOPIC DRAMA',
    year: '2016',
    bgGradient: ['#091b1a', '#143d3a', '#051110'],
    accentColor: '#2dd4bf',
    badgeText: 'OLYMPIC GOLD',
    iconSvg: icons.film
  },

  // Music
  {
    filename: 'hikaru_nara.svg',
    type: 'album',
    title: 'Hikaru Nara',
    artist: 'Goose house',
    album: 'Milk (Single)',
    year: '2014',
    bgGradient: ['#0f172a', '#1e293b', '#0b1120'],
    accentColor: '#38bdf8',
    badgeText: 'ANIME OST',
    iconSvg: icons.music
  },
  {
    filename: 'gurenge.svg',
    type: 'album',
    title: 'Gurenge',
    artist: 'LiSA',
    album: 'Leo-Nine',
    year: '2019',
    bgGradient: ['#240a0a', '#541717', '#120505'],
    accentColor: '#f43f5e',
    badgeText: 'J-ROCK HIT',
    iconSvg: icons.flame
  },
  {
    filename: 'time_zimmer.svg',
    type: 'album',
    title: 'Time',
    artist: 'Hans Zimmer',
    album: 'Inception Original Soundtrack',
    year: '2010',
    bgGradient: ['#0b1622', '#142a42', '#060c14'],
    accentColor: '#60a5fa',
    badgeText: 'LOSSLESS FLAC',
    iconSvg: icons.music
  }
];

for (const item of items) {
  const filePath = path.join(outDir, item.filename);
  let svgContent = '';
  if (item.type === 'album') {
    svgContent = createAlbumSvg(item);
  } else {
    svgContent = createPosterSvg(item);
  }
  fs.writeFileSync(filePath, svgContent, 'utf-8');
  console.log(`Generated: ${item.filename}`);
}

console.log('Cover generation completed successfully.');
