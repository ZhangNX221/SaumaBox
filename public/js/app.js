// ============================================================
// SaumaBox — Core SPA Controller & Router
// ============================================================

const app = {
  state: {
    user: null,
    currentTab: 'landing',
    theme: 'dark',
    publicConfig: { app_name: 'SaumaBox', public_sharing_enabled: true, public_games_enabled: true, public_cinema_enabled: true, public_music_enabled: true, public_show_prices: true, public_show_ratings: true },
    games: { items: [], type: 'ALL', completed: 'ALL', q: '', platform: 'ALL', status: 'ALL', console: 'ALL', sortBy: 'id', sortOrder: 'desc', page: 1, limit: 10, totalPages: 1, totalPrice: 0, filterOptions: {}, viewMode: localStorage.getItem('saumabox_view_games') || 'grid' },
    cinema: { items: [], type: 'ALL', watched: 'ALL', genre: 'ALL', q: '', sortBy: 'id', sortOrder: 'desc', page: 1, limit: 10, totalPages: 1, filterOptions: {}, viewMode: localStorage.getItem('saumabox_view_cinema') || 'grid' },
    music: { items: [], subTab: 'all', platform: 'ALL', genre: 'ALL', favorite: 'ALL', q: '', sortBy: 'id', sortOrder: 'desc', page: 1, limit: 10, totalPages: 1, filterOptions: {}, viewMode: localStorage.getItem('saumabox_view_music') || 'grid' },
    web: { q: '', category: 'Semua' },
    stats: null,
    notifications: [],
    unreadNotifications: 0,
    sidebarMinimized: localStorage.getItem('saumabox_sidebar_minimized') === 'true'
  },

  async init() {
    this.applyTheme(this.state.theme);
    this.loadNotifications();
    this.bindGlobalEvents();
    this.initTopbarSearch();

    try {
      const setupCheck = await api.get('/api/auth/setup-status');
      if (setupCheck.needsSetup) return this.openSetupModal();

      const [authRes, configRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/settings/public-config')
      ]);

      if (authRes.authenticated) this.state.user = authRes.user;
      if (configRes) this.state.publicConfig = configRes;
      this.applyBrandAndPublicConfig();

      this.navigate(this.state.user ? 'dashboard' : 'landing');
    } catch (err) {
      console.error('Initialization error:', err);
      this.navigate('landing');
    }
  },

  applyBrandAndPublicConfig() {
    const config = this.state.publicConfig || {};
    const appName = config.app_name || 'SaumaBox';
    const logoUrl = config.app_logo_url || '/images/logo-icon.png';

    document.title = `${appName}: Personal Media Catalog`;
    document.querySelectorAll('.brand-name').forEach(el => {
      el.textContent = appName;
    });
    document.querySelectorAll('.brand-logo-img').forEach(el => {
      if (logoUrl) el.src = logoUrl;
    });
  },

  applyTheme() {
    this.state.theme = 'dark';
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.removeItem('saumabox_theme');
  },

  bindGlobalEvents() {
    window.onAuthExpired = () => {
      this.state.user = null;
      this.updateNavbar();
      showToast('Sesi telah berakhir. Silakan login kembali.', 'warning');
      this.openLoginModal();
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.toggleAdminSidebar(false);
        const nd = document.getElementById('notifications-dropdown');
        if (nd) nd.classList.add('hidden');
        const ad = document.getElementById('add-catalog-dropdown');
        if (ad) ad.classList.add('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      const nw = document.getElementById('notifications-wrapper');
      const nd = document.getElementById('notifications-dropdown');
      if (nd && !nd.classList.contains('hidden') && nw && !nw.contains(e.target)) nd.classList.add('hidden');
      const aw = document.getElementById('add-catalog-wrapper');
      const ad = document.getElementById('add-catalog-dropdown');
      if (ad && !ad.classList.contains('hidden') && aw && !aw.contains(e.target)) ad.classList.add('hidden');
    });

    window.addEventListener('resize', () => {
      this.applySidebarState();
    });
  },

  updateNavbar() {
    const appEl = document.getElementById('app');
    const navLinks = document.getElementById('nav-links');
    const authActions = document.getElementById('auth-actions');
    const bottomNav = document.getElementById('bottom-nav');
    const adminSidebar = document.getElementById('admin-sidebar');
    const isLoggedIn = !!this.state.user;
    const curTab = this.state.currentTab;

    if (isLoggedIn) {
      if (appEl) appEl.classList.add('admin-mode');

      if (adminSidebar) {
        const user = this.state.user, username = user.displayName || user.username;
        const avatarMarkup = user.avatarUrl ? `<img src="${escapeHtml(user.avatarUrl)}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : username.charAt(0).toUpperCase();
        const sec = [
          { title: '1. Ringkasan', links: [{ id: 'dashboard', icon: 'dashboard', label: 'Dashboard', active: curTab === 'dashboard', click: "app.navigate('dashboard')" }] },
          { title: '2. Katalog Media', links: [
            { id: 'games', icon: 'games', label: 'Katalog Game', active: curTab === 'games', click: "app.navigate('games')" },
            { id: 'cinema', icon: 'cinema', label: 'Katalog Cinema', active: curTab === 'cinema', click: "app.navigate('cinema')" },
            { id: 'music', icon: 'music', label: 'Katalog Musik', active: curTab === 'music', click: "app.navigate('music')" },
            { id: 'web', icon: 'globe', label: 'Katalog Web', active: curTab === 'web', click: "app.navigate('web')" }
          ] },
          { title: '3. Kategori Data', links: [{ id: 'genres', icon: 'tag', label: 'Genre', active: curTab === 'taxonomy' && this.state.taxonomy?.subTab === 'genres', click: "app.navigate('taxonomy', 'genres')" }, { id: 'posters', icon: 'image', label: 'Poster', active: curTab === 'taxonomy' && this.state.taxonomy?.subTab === 'posters', click: "app.navigate('taxonomy', 'posters')" }, { id: 'platforms', icon: 'layers', label: 'Platform', active: curTab === 'taxonomy' && this.state.taxonomy?.subTab === 'platforms', click: "app.navigate('taxonomy', 'platforms')" }, { id: 'statuses', icon: 'shield', label: 'Status', active: curTab === 'taxonomy' && this.state.taxonomy?.subTab === 'statuses', click: "app.navigate('taxonomy', 'statuses')" }] },
          { title: '4. Pengaturan', links: [{ id: 'profile', icon: 'user', label: 'Profil', active: curTab === 'settings' && this.state.settingsTab === 'profile', click: "app.navigate('settings', 'profile')" }, { id: 'layout', icon: 'palette', label: 'Tampilan', active: curTab === 'settings' && this.state.settingsTab === 'layout', click: "app.navigate('settings', 'layout')" }, { id: 'api', icon: 'code', label: 'API', active: curTab === 'settings' && this.state.settingsTab === 'api', click: "app.navigate('settings', 'api')" }, { id: 'data', icon: 'database', label: 'Atur Data', active: curTab === 'settings' && this.state.settingsTab === 'data', click: "app.navigate('settings', 'data')" }, { id: 'system', icon: 'refresh', label: 'Pembaruan', active: curTab === 'settings' && this.state.settingsTab === 'system', click: "app.navigate('settings', 'system')" }] }
        ];

        const secHtml = sec.map(s => `
          <div class="sidebar-section">
            <div class="sidebar-section-title">${s.title}</div>
            ${s.links.map(l => `<button class="sidebar-link ${l.active ? 'active' : ''}" onclick="${l.click}; app.toggleAdminSidebar(false);" title="${l.label}"><div class="sidebar-link-content">${getIcon(l.icon, 'sidebar-link-icon', 18)}<span>${l.label}</span></div></button>`).join('')}
          </div>
        `).join('');

        adminSidebar.innerHTML = `
          <div class="sidebar-brand">
            <a class="sidebar-brand-link" onclick="app.navigate('dashboard'); app.toggleAdminSidebar(false);" aria-label="Beranda Dashboard">
              <img src="/images/logo-icon.png" class="brand-logo-img" alt="Logo" width="26" height="26">
              <span>SaumaBox</span><span class="brand-badge">Admin</span>
            </a>
            <button class="sidebar-close-btn" onclick="app.toggleAdminSidebar(false)" title="Tutup menu">${getIcon('close', 'ui-icon', 18)}</button>
          </div>
          <div class="sidebar-profile" onclick="app.navigate('settings', 'profile'); app.toggleAdminSidebar(false);" role="button" tabindex="0" title="Kelola Profil Akun" style="cursor:pointer;">
            <div class="sidebar-avatar">${avatarMarkup}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${escapeHtml(username)}</div>
              <div class="sidebar-user-role"><span class="sidebar-status-dot"></span> Administrator</div>
            </div>
          </div>
          ${secHtml}
          <div class="sidebar-footer">
            <button class="btn btn-secondary btn-sm sidebar-logout-btn" onclick="app.logout()" title="Keluar" style="width:100%; justify-content:center; gap:8px;">
              ${getIcon('logout', 'ui-icon', 16)}<span>Keluar</span>
            </button>
          </div>`;
      }

      if (navLinks) navLinks.innerHTML = '';
      if (authActions) authActions.innerHTML = typeof this.renderAddCatalogDropdown === 'function' ? this.renderAddCatalogDropdown() : '';

      if (bottomNav) {
        const bItems = [['dashboard','dashboard','Dashboard'],['games','games','Games'],['cinema','cinema','Cinema'],['music','music','Musik'],['web','globe','Web'],['settings','settings','Setelan']];
        const isAct = (id) => curTab === id || (id === 'settings' && curTab === 'taxonomy');
        bottomNav.innerHTML = `<div class="bottom-nav-inner">${bItems.map(([id, icon, txt]) => `
          <div class="bottom-nav-item ${isAct(id) ? 'active' : ''}" onclick="app.navigate('${id}')">${getIcon(icon, 'ui-icon', 20)}<span>${txt}</span></div>
        `).join('')}</div>`;
      }
    } else {
      if (appEl) appEl.classList.remove('admin-mode');
      if (adminSidebar) adminSidebar.innerHTML = '';

      const cfg = this.state.publicConfig || {};
      const isPublic = cfg.public_sharing_enabled !== false;

      const navButtons = [
        `<button class="nav-btn ${curTab === 'landing' ? 'active' : ''}" onclick="app.navigate('landing')">Beranda</button>`
      ];

      if (isPublic) {
        if (cfg.public_games_enabled !== false) {
          navButtons.push(`<button class="nav-btn ${curTab === 'games' ? 'active' : ''}" onclick="app.navigate('games')">Koleksi Games</button>`);
        }
        if (cfg.public_cinema_enabled !== false) {
          navButtons.push(`<button class="nav-btn ${curTab === 'cinema' ? 'active' : ''}" onclick="app.navigate('cinema')">Koleksi Cinema</button>`);
        }
        if (cfg.public_music_enabled !== false) {
          navButtons.push(`<button class="nav-btn ${curTab === 'music' ? 'active' : ''}" onclick="app.navigate('music')">Koleksi Musik</button>`);
        }
        if (cfg.public_web_enabled !== false) {
          navButtons.push(`<button class="nav-btn ${curTab === 'web' ? 'active' : ''}" onclick="app.navigate('web')">Katalog Web</button>`);
        }
      }

      navLinks.innerHTML = navButtons.join('');

      authActions.innerHTML = `<button class="btn btn-primary btn-sm btn-admin-demo" onclick="app.openLoginModal()" title="Masuk Mode Admin (Demo)">${getIcon('user', 'ui-icon-btn', 14)} <span>Masuk Admin</span></button>`;

      if (bottomNav) {
        const bItems = [['landing','dashboard','Beranda']];
        if (isPublic) {
          if (cfg.public_games_enabled !== false) bItems.push(['games','games','Games']);
          if (cfg.public_cinema_enabled !== false) bItems.push(['cinema','cinema','Cinema']);
          if (cfg.public_music_enabled !== false) bItems.push(['music','music','Musik']);
          if (cfg.public_web_enabled !== false) bItems.push(['web','globe','Web']);
        }
        bItems.push(['login','user','Admin']);

        bottomNav.innerHTML = `<div class="bottom-nav-inner">${bItems.map(([id, icon, txt]) => `
          <div class="bottom-nav-item ${curTab === id ? 'active' : ''}" onclick="app.navigate('${id}')">${getIcon(icon, 'ui-icon', 20)}<span>${txt}</span></div>
        `).join('')}</div>`;
      }
    }

    this.applySidebarState();
    this.updateNotificationBadge();
  },

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.toggleAdminSidebar();
    } else {
      this.toggleSidebarMinimize();
    }
  },

  toggleSidebarMinimize(force) {
    const sidebar = document.getElementById('admin-sidebar');
    const appEl = document.getElementById('app');
    if (!sidebar || !appEl) return;
    const isMin = force !== undefined ? force : !sidebar.classList.contains('minimized');
    if (isMin) {
      sidebar.classList.add('minimized');
      appEl.classList.add('sidebar-minimized');
      this.state.sidebarMinimized = true;
      localStorage.setItem('saumabox_sidebar_minimized', 'true');
    } else {
      sidebar.classList.remove('minimized');
      appEl.classList.remove('sidebar-minimized');
      this.state.sidebarMinimized = false;
      localStorage.setItem('saumabox_sidebar_minimized', 'false');
    }
    this.updateSidebarToggleTooltip();
  },

  applySidebarState() {
    const sidebar = document.getElementById('admin-sidebar');
    const appEl = document.getElementById('app');
    if (!sidebar || !appEl) return;
    if (this.state.sidebarMinimized && window.innerWidth > 768) {
      sidebar.classList.add('minimized');
      appEl.classList.add('sidebar-minimized');
    } else {
      sidebar.classList.remove('minimized');
      appEl.classList.remove('sidebar-minimized');
    }
    this.updateSidebarToggleTooltip();
  },

  updateSidebarToggleTooltip() {
    const btn = document.getElementById('btn-toggle-sidebar');
    if (!btn) return;
    const isMin = this.state.sidebarMinimized && window.innerWidth > 768;
    btn.title = isMin ? 'Perluas menu admin' : 'Perkecil menu admin';
    btn.setAttribute('aria-label', btn.title);
  },

  toggleAdminSidebar(force) {
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar) return;
    const isOpen = force !== undefined ? force : !sidebar.classList.contains('open');
    if (isOpen) {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
    } else {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }
  },

  loadNotifications() {
    try {
      const raw = localStorage.getItem('saumabox_notifications');
      this.state.notifications = raw ? JSON.parse(raw) : [];
    } catch (_) {
      this.state.notifications = [];
    }
    this.updateNotificationBadge();
  },

  saveNotifications() {
    try {
      localStorage.setItem('saumabox_notifications', JSON.stringify(this.state.notifications));
    } catch (_) {}
  },

  addNotification(message, type = 'info') {
    const notif = {
      id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      message: String(message),
      type: type || 'info',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false
    };
    if (!Array.isArray(this.state.notifications)) this.state.notifications = [];
    this.state.notifications.unshift(notif);
    if (this.state.notifications.length > 30) this.state.notifications.pop();
    this.saveNotifications();
    this.updateNotificationBadge();

    const btn = document.getElementById('btn-toggle-notifications');
    if (btn) {
      btn.classList.remove('bell-ring');
      void btn.offsetWidth;
      btn.classList.add('bell-ring');
    }

    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      this.renderNotificationsList();
    }
  },

  updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    const items = Array.isArray(this.state.notifications) ? this.state.notifications : [];
    const unread = items.filter(n => !n.read).length;
    this.state.unreadNotifications = unread;
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
    const countEl = document.getElementById('notif-unread-count');
    if (countEl) countEl.textContent = unread > 0 ? `(${unread} baru)` : '';
  },

  toggleNotificationsPanel(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('notifications-dropdown');
    if (!dropdown) return;
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      this.renderNotificationsList();
      dropdown.classList.remove('hidden');
    } else {
      dropdown.classList.add('hidden');
    }
  },

  renderNotificationsList() {
    const listEl = document.getElementById('notif-list');
    if (!listEl) return;
    const items = this.state.notifications || [];
    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="notif-empty">
          <div class="notif-empty-icon">${getIcon('bell', 'ui-icon', 28)}</div>
          <div class="notif-empty-title">Tidak ada notifikasi</div>
          <div class="notif-empty-desc">Pemberitahuan aktivitas dan sistem akan muncul di sini.</div>
        </div>
      `;
      return;
    }
    const icons = { success: 'check', error: 'close', warning: 'alert' };
    listEl.innerHTML = items.map(n => `
      <div class="notif-item notif-${n.type} ${n.read ? 'read' : 'unread'}" onclick="app.markSingleNotificationRead('${n.id}')">
        <div class="notif-item-icon">${getIcon(icons[n.type] || 'info', 'notif-type-icon', 13)}</div>
        <div class="notif-item-body">
          <div class="notif-item-msg">${escapeHtml(n.message)}</div>
          <div class="notif-item-time">${n.time}</div>
        </div>
        ${!n.read ? '<span class="notif-item-dot" title="Belum dibaca"></span>' : ''}
      </div>
    `).join('');
  },

  refreshNotifications() {
    this.saveNotifications();
    this.updateNotificationBadge();
    this.renderNotificationsList();
  },

  markNotificationsAsRead() {
    (this.state.notifications || []).forEach(n => { n.read = true; });
    this.refreshNotifications();
  },

  markSingleNotificationRead(id) {
    const item = (this.state.notifications || []).find(n => n.id === id);
    if (item && !item.read) { item.read = true; this.refreshNotifications(); }
  },

  clearAllNotifications() {
    this.state.notifications = [];
    this.refreshNotifications();
  },

  async navigate(tab, subTab = null) {
    if (tab === 'profile') return this.navigate('settings', 'profile');
    if (tab === 'login') {
      this.openLoginModal();
      return;
    }
    this.state.currentTab = tab;
    if (subTab) {
      if (tab === 'taxonomy') this.state.taxonomy = { subTab, q: '', filter: 'all' };
      if (tab === 'settings') this.state.settingsTab = subTab;
    }

    this.updateNavbar();
    this.syncTopbarSearch(tab);
    const container = document.getElementById('view-container');

    const cfg = this.state.publicConfig || {};
    const isLoggedIn = !!this.state.user;

    // Guard visibilitas publik bagi pengunjung tanpa login
    if (!isLoggedIn && tab !== 'landing') {
      if (cfg.public_sharing_enabled === false) {
        container.innerHTML = `
          <div class="state-container" style="max-width:540px; margin:40px auto; text-align:center; padding:48px 24px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:18px;">
            <div class="state-icon" style="color:var(--accent-color);">${getIcon('lock', 'ui-icon', 48)}</div>
            <h2 class="state-title" style="margin-top:16px; font-size:1.3rem;">Akses Publik Dinonaktifkan</h2>
            <p class="state-desc" style="color:var(--text-secondary); margin:8px 0 24px 0; font-size:0.9rem;">
              Administrator telah mengunci akses publik. Silakan masuk sebagai administrator untuk mengelola dan melihat katalog media.
            </p>
            <button class="btn btn-primary" onclick="app.openLoginModal()" style="display:inline-flex; align-items:center; gap:8px;">
              ${getIcon('user', 'ui-icon-btn', 14)} <span>Masuk Mode Administrator</span>
            </button>
          </div>
        `;
        return;
      }

      const catFlagMap = {
        games: cfg.public_games_enabled,
        cinema: cfg.public_cinema_enabled,
        music: cfg.public_music_enabled,
        web: cfg.public_web_enabled
      };

      if (catFlagMap[tab] === false) {
        const catLabels = { games: 'Katalog Game', cinema: 'Katalog Cinema', music: 'Katalog Musik', web: 'Katalog Web' };
        container.innerHTML = `
          <div class="state-container" style="max-width:540px; margin:40px auto; text-align:center; padding:48px 24px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:18px;">
            <div class="state-icon" style="color:var(--accent-color);">${getIcon('lock', 'ui-icon', 48)}</div>
            <h2 class="state-title" style="margin-top:16px; font-size:1.3rem;">${catLabels[tab] || 'Katalog'} Privat</h2>
            <p class="state-desc" style="color:var(--text-secondary); margin:8px 0 24px 0; font-size:0.9rem;">
              Administrator telah menonaktifkan visibilitas publik untuk ${catLabels[tab] || 'katalog ini'}.
            </p>
            <div style="display:flex; justify-content:center; gap:12px;">
              <button class="btn btn-secondary" onclick="app.navigate('landing')">Kembali ke Beranda</button>
              <button class="btn btn-primary" onclick="app.openLoginModal()">${getIcon('user', 'ui-icon-btn', 14)} Masuk Admin</button>
            </div>
          </div>
        `;
        return;
      }
    }

    container.innerHTML = getLoadingHtml('Memuat data katalog...', 'Menyiapkan koleksi media dan preferensi Anda');

    try {
      if (tab === 'landing') await this.renderLanding(container);
      else if (tab === 'dashboard') {
        if (!this.state.user) { this.openLoginModal(); return this.navigate('landing'); }
        await this.renderDashboard(container);
      } else if (tab === 'games') await this.renderGames(container);
      else if (tab === 'cinema') await this.renderCinema(container);
      else if (tab === 'music') await this.renderMusic(container);
      else if (tab === 'web') await this.renderWeb(container);
      else if (tab === 'taxonomy') {
        if (!this.state.user) { this.openLoginModal(); return this.navigate('landing'); }
        await this.renderTaxonomy(container);
      } else if (tab === 'settings') {
        if (!this.state.user) { this.openLoginModal(); return this.navigate('landing'); }
        await this.renderSettings(container);
      }
    } catch (err) {
      container.innerHTML = `
        <div class="state-container">
          <div class="state-icon">${getIcon('alert', 'ui-icon', 40)}</div>
          <div class="state-title">Gagal memuat halaman</div>
          <div class="state-desc">${escapeHtml(err.message)}</div>
          <button class="btn btn-secondary" onclick="app.navigate('${tab}')">Muat Ulang</button>
        </div>
      `;
    }
  },

  renderCatalog(d) {
    const c = document.getElementById('view-container');
    if (!c) return;
    if (d === 'games') this.renderGames(c);
    else if (d === 'cinema') this.renderCinema(c);
    else if (d === 'music') this.renderMusic(c);
  },

  setCatalogViewMode(cat, mode) {
    if (this.state[cat]) {
      this.state[cat].viewMode = mode;
      localStorage.setItem(`saumabox_view_${cat}`, mode);
      this.renderCatalog(cat);
    }
  },

  sortCatalog(domain, col) {
    const s = this.state[domain];
    if (!s) return;
    s.sortOrder = s.sortBy === col && s.sortOrder === 'asc' ? 'desc' : 'asc';
    s.sortBy = col;
    this.renderCatalog(domain);
  },

  changePage(domain, page) {
    const s = this.state[domain];
    if (!s) return;
    s.page = page;
    this.renderCatalog(domain);
  },

  filterGamesByType(type) { this.state.games.type = type; this.navigate('games'); },
  sortGames(col) { this.sortCatalog('games', col); },
  changeGamePage(p) { this.changePage('games', p); },
  sortCinema(col) { this.sortCatalog('cinema', col); },
  changeCinemaPage(p) { this.changePage('cinema', p); },
  sortMusic(col) { this.sortCatalog('music', col); },
  changeMusicPage(p) { this.changePage('music', p); },
  changeLimit(d, l) { const s = this.state[d]; if (s) { s.limit = +l || 10; s.page = 1; this.renderCatalog(d); } },

  initTopbarSearch() {
    const inp = document.getElementById('topbar-search-input');
    const clr = document.getElementById('topbar-search-clear');
    if (!inp) return;
    inp.addEventListener('input', debounce((e) => {
      if (clr) clr.classList.toggle('hidden', !e.target.value);
      this.handleGlobalSearch(e.target.value);
    }, 300));
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.handleGlobalSearch(inp.value); }
      if (e.key === 'Escape') this.clearTopbarSearch();
    });
  },

  clearTopbarSearch() {
    const inp = document.getElementById('topbar-search-input');
    const clr = document.getElementById('topbar-search-clear');
    if (inp) { inp.value = ''; inp.focus(); }
    if (clr) clr.classList.add('hidden');
    this.handleGlobalSearch('');
  },

  handleGlobalSearch(query) {
    const tab = this.state.currentTab;
    const q = (query || '').trim();
    const c = document.getElementById('view-container');
    if (tab === 'games') { this.state.games.q = q; this.state.games.page = 1; this.renderGames(c); }
    else if (tab === 'cinema') { this.state.cinema.q = q; this.state.cinema.page = 1; this.renderCinema(c); }
    else if (tab === 'music') { this.state.music.q = q; this.state.music.page = 1; this.renderMusic(c); }
    else if (tab === 'web') {
      if (!this.stateWeb) this.stateWeb = { items: [], categories: [], activeCategory: 'Semua', q: '' };
      this.stateWeb.q = q;
      this.renderWeb(c);
    }
    else if (tab === 'taxonomy') { if (this.state.taxonomy) { this.state.taxonomy.q = q; this.loadTaxonomyData(); } }
    else if (tab === 'landing') { if (typeof this.handleLandingSearch === 'function') this.handleLandingSearch(query); }
    else if (q) { this.state.cinema.q = q; this.state.cinema.page = 1; this.navigate('cinema'); }
  },

  syncTopbarSearch(tab) {
    const inp = document.getElementById('topbar-search-input');
    const clr = document.getElementById('topbar-search-clear');
    if (!inp) return;
    const qMap = { games: this.state.games?.q, cinema: this.state.cinema?.q, music: this.state.music?.q, web: this.stateWeb?.q, taxonomy: this.state.taxonomy?.q, landing: this.state.landingSearch };
    const q = qMap[tab] || '';
    inp.value = q;
    if (clr) clr.classList.toggle('hidden', !q);
    const phMap = { games: 'Cari judul, publisher, genre...', cinema: 'Cari judul, studio, genre...', music: 'Cari trek, artis, album...', web: 'Cari bookmark web, tautan, domain...', taxonomy: 'Cari data master...', landing: 'Cari di SaumaBox...' };
    inp.placeholder = phMap[tab] || 'Cari koleksi katalog...';
  }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
