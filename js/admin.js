/* cspell:disable */
/**
 * EDITORIAL VÓRTICE — Consola de Administración y Gestión Editorial
 * Lógica de negocio completa: Autenticación, Dashboard KPIs, CRUD de Catálogo,
 * Generador interactivo de portadas, Gestión de Pedidos, Albaranes y Ajustes.
 */

const AdminApp = {
  isAuthenticated: sessionStorage.getItem('vortice-admin-auth') === 'true',
  activeTab: 'dashboard',
  books: [],
  collections: [],
  orders: [],
  settings: {
    paypalClientId: localStorage.getItem('vortice-paypal-client-id') || 'test',
    shippingStandard: parseFloat(localStorage.getItem('vortice-shipping-standard') || '3.50'),
    shippingFreeThreshold: parseFloat(localStorage.getItem('vortice-shipping-threshold') || '40.00'),
    companyName: localStorage.getItem('vortice-company-name') || 'Editorial Vórtice S.L.',
    companyNif: localStorage.getItem('vortice-company-nif') || 'B-84920194',
    companyAddress: localStorage.getItem('vortice-company-address') || 'Calle Conde de Romanones 14, 28012 Madrid',
    companyEmail: localStorage.getItem('vortice-company-email') || 'administracion@vortice-editorial.es'
  },
  editingBookId: null,
  activeOrderRef: null,
  bookFilterCollection: 'all',
  bookSearchQuery: '',
  bookSortBy: 'featured',
  orderFilterStatus: 'all',
  orderSearchQuery: '',

  init() {
    this.initTheme();
    this.loadData();
    this.checkAuth();
    this.bindEvents();
  },

  /* ------------------------------------------------------------------------
     Tema Visual (Claro / Oscuro)
     ------------------------------------------------------------------------ */
  initTheme() {
    const theme = localStorage.getItem('vortice-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeButton();
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('vortice-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    this.updateThemeButton();
    this.showToast(`Modo visual: ${next === 'dark' ? 'Contraste Invertido' : 'Editorial Claro'}`);
  },

  updateThemeButton() {
    const btn = document.getElementById('admin-btn-theme');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  },

  /* ------------------------------------------------------------------------
     Autenticación
     ------------------------------------------------------------------------ */
  checkAuth() {
    const gate = document.getElementById('admin-auth-gate');
    const shell = document.getElementById('admin-dashboard-app');
    if (!gate || !shell) return;

    if (this.isAuthenticated) {
      gate.style.display = 'none';
      shell.style.display = 'flex';
      this.refreshAll();
    } else {
      gate.style.display = 'flex';
      shell.style.display = 'none';
      const passInput = document.getElementById('admin-password-input');
      if (passInput) passInput.focus();
    }
  },

  handleLogin(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('admin-password-input');
    const card = document.getElementById('admin-auth-card');
    const val = input ? input.value.trim().toLowerCase() : '';

    // Claves permitidas: vortice2026, admin, demo, vortice
    if (val === 'vortice2026' || val === 'admin' || val === 'demo' || val === 'vortice') {
      this.isAuthenticated = true;
      sessionStorage.setItem('vortice-admin-auth', 'true');
      this.showToast('Acceso concedido a la consola editorial');
      this.checkAuth();
    } else {
      if (card) {
        card.classList.remove('shake');
        void card.offsetWidth; // Forzar reflow para reiniciar animación
        card.classList.add('shake');
      }
      this.showToast('Clave incorrecta. Usa: vortice2026');
      if (input) input.select();
    }
  },

  quickDemoLogin() {
    const input = document.getElementById('admin-password-input');
    if (input) input.value = 'vortice2026';
    this.handleLogin();
  },

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('vortice-admin-auth');
    this.showToast('Sesión cerrada correctamente');
    this.checkAuth();
  },

  /* ------------------------------------------------------------------------
     Carga y Sincronización de Datos (Local Storage + Supabase PostgreSQL)
     ------------------------------------------------------------------------ */
  async loadData() {
    // 1. Carga inmediata desde almacenamiento local
    if (typeof loadStoredBooks === 'function') {
      this.books = loadStoredBooks();
    } else {
      this.books = JSON.parse(localStorage.getItem('vortice-books') || '[]');
    }

    if (typeof loadStoredCollections === 'function') {
      this.collections = loadStoredCollections();
    } else {
      this.collections = JSON.parse(localStorage.getItem('vortice-collections') || '[]');
    }

    this.orders = JSON.parse(localStorage.getItem('vortice-orders') || '[]');
    if (!Array.isArray(this.orders)) this.orders = [];

    // 2. Si Supabase está configurado, sincronizar con PostgreSQL
    if (window.VorticeDB && VorticeDB.isConnected()) {
      this.updateSupabaseStatusPill('Sincronizando...', 'default');
      const isOnline = await VorticeDB.checkHealth();
      if (isOnline) {
        this.updateSupabaseStatusPill('🟢 Conectado (PostgreSQL)', 'status-completado');

        const cloudBooks = await VorticeDB.getBooks();
        if (cloudBooks && cloudBooks.length > 0) {
          this.books = cloudBooks;
          if (typeof saveBooksToStorage === 'function') saveBooksToStorage(this.books);
        }

        const cloudOrders = await VorticeDB.getOrders();
        if (cloudOrders) {
          this.orders = cloudOrders;
          localStorage.setItem('vortice-orders', JSON.stringify(this.orders));
        }

        const cloudCols = await VorticeDB.getCollections();
        if (cloudCols && cloudCols.length > 0) {
          this.collections = cloudCols;
          if (typeof saveCollectionsToStorage === 'function') saveCollectionsToStorage(this.collections);
        }

        // Re-renderizar vistas con los datos de la nube
        this.renderDashboardKPIs();
        this.renderBooksTable();
        this.renderOrdersTable();
        this.renderCollectionsGrid();
        this.updateBadges();
      } else {
        this.updateSupabaseStatusPill('⚠️ Error Conexión', 'status-pendiente');
      }
    } else {
      this.updateSupabaseStatusPill('⚪ Modo Local (Offline)', 'default');
    }
  },

  saveBooks() {
    if (typeof saveBooksToStorage === 'function') {
      saveBooksToStorage(this.books);
    } else {
      localStorage.setItem('vortice-books', JSON.stringify(this.books));
    }
  },

  saveCollections() {
    if (typeof saveCollectionsToStorage === 'function') {
      saveCollectionsToStorage(this.collections);
    } else {
      localStorage.setItem('vortice-collections', JSON.stringify(this.collections));
    }
  },

  saveOrders() {
    localStorage.setItem('vortice-orders', JSON.stringify(this.orders));
  },

  refreshAll() {
    this.loadData();
    this.renderDashboardKPIs();
    this.renderBooksTable();
    this.renderOrdersTable();
    this.renderCollectionsGrid();
    this.renderSettings();
    this.updateBadges();
  },

  updateBadges() {
    const bookCount = document.getElementById('badge-books-count');
    if (bookCount) bookCount.textContent = this.books.length;

    const pendingOrders = this.orders.filter(o => o.status === 'Pendiente').length;
    const orderCount = document.getElementById('badge-orders-count');
    if (orderCount) {
      orderCount.textContent = pendingOrders > 0 ? pendingOrders : this.orders.length;
    }
  },

  /* ------------------------------------------------------------------------
     Navegación por Pestañas
     ------------------------------------------------------------------------ */
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-pane-${tabId}`);
    });

    if (tabId === 'dashboard') this.renderDashboardKPIs();
    if (tabId === 'catalog') this.renderBooksTable();
    if (tabId === 'orders') this.renderOrdersTable();
    if (tabId === 'collections') this.renderCollectionsGrid();
    if (tabId === 'settings') this.renderSettings();
  },

  /* ------------------------------------------------------------------------
     TAB 1: Dashboard y Métricas
     ------------------------------------------------------------------------ */
  renderDashboardKPIs() {
    // 1. Facturación Total
    const totalRevenue = this.orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const revDisplay = document.getElementById('kpi-total-revenue');
    if (revDisplay) revDisplay.textContent = `${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

    // 2. Pedidos Registrados
    const ordersDisplay = document.getElementById('kpi-total-orders');
    if (ordersDisplay) ordersDisplay.textContent = this.orders.length;

    // 3. Libros Activos
    const booksDisplay = document.getElementById('kpi-total-books');
    if (booksDisplay) booksDisplay.textContent = this.books.length;

    // 4. Ticket Medio
    const avgTicket = this.orders.length > 0 ? totalRevenue / this.orders.length : 0;
    const avgDisplay = document.getElementById('kpi-avg-ticket');
    if (avgDisplay) avgDisplay.textContent = `${avgTicket.toFixed(2)} €`;

    // Gráfico de distribución de catálogo por colecciones
    this.renderCollectionDistributionBars();

    // Actividad reciente de pedidos
    this.renderDashboardRecentOrders();
  },

  renderCollectionDistributionBars() {
    const container = document.getElementById('dashboard-collection-bars');
    if (!container) return;

    const totalBooks = this.books.length || 1;
    const colPalette = {
      cultura: '#FF3300',
      poesia: '#0047FF',
      arte: '#C5A059',
      moda: '#00875A',
      tendencias: '#7000FF',
      default: '#4A4A4A'
    };

    const validCollections = this.collections.filter(c => c.id !== 'all');
    container.innerHTML = validCollections.map(col => {
      const count = this.books.filter(b => b.collectionId === col.id || b.collection?.toLowerCase() === col.name?.toLowerCase()).length;
      const pct = Math.round((count / totalBooks) * 100);
      const color = colPalette[col.id.toLowerCase()] || colPalette.default;

      return `
        <div class="admin-col-bar-row">
          <div class="admin-col-bar-meta">
            <span><strong>${col.name}</strong> <span style="color:var(--text-muted); font-size:0.75rem;">(${col.code || 'COL'})</span></span>
            <span>${count} títulos · <strong>${pct}%</strong></span>
          </div>
          <div class="admin-col-bar-track">
            <div class="admin-col-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderDashboardRecentOrders() {
    const tbody = document.getElementById('dashboard-recent-orders-tbody');
    if (!tbody) return;

    if (this.orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 2.5rem 1rem; color: var(--text-muted);">
            No hay pedidos registrados todavía. 
            <button class="admin-btn admin-btn-sm admin-btn-secondary" style="margin-left: 0.5rem;" onclick="AdminApp.generateDemoOrders()">Generar Pedidos Demo</button>
          </td>
        </tr>
      `;
      return;
    }

    const recent = this.orders.slice(0, 5);
    tbody.innerHTML = recent.map(o => {
      const statusClass = (o.status || 'Completado').toLowerCase();
      return `
        <tr>
          <td><strong style="font-family:var(--font-mono); color:var(--text-primary);">${o.orderRef}</strong></td>
          <td>${o.date}</td>
          <td>${o.payerName}</td>
          <td><strong>${parseFloat(o.total || 0).toFixed(2)} €</strong></td>
          <td><span class="admin-badge-pill status-${statusClass}">${o.status || 'Completado'}</span></td>
        </tr>
      `;
    }).join('');
  },

  /* ------------------------------------------------------------------------
     TAB 2: Catálogo de Libros (CRUD)
     ------------------------------------------------------------------------ */
  renderBooksTable() {
    const tbody = document.getElementById('admin-books-tbody');
    const countDisplay = document.getElementById('admin-books-count-summary');
    if (!tbody) return;

    let filtered = [...this.books];

    // Filtro por colección
    if (this.bookFilterCollection !== 'all') {
      filtered = filtered.filter(b => b.collectionId === this.bookFilterCollection || b.collection?.toLowerCase() === this.bookFilterCollection.toLowerCase());
    }

    // Filtro por búsqueda
    const q = this.bookSearchQuery.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.number && b.number.toLowerCase().includes(q))
      );
    }

    // Ordenación
    filtered.sort((a, b) => {
      if (this.bookSortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (this.bookSortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (this.bookSortBy === 'price-asc') return a.price - b.price;
      if (this.bookSortBy === 'price-desc') return b.price - a.price;
      if (this.bookSortBy === 'year') return b.year - a.year;
      // Default: featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    if (countDisplay) {
      countDisplay.innerHTML = `Mostrando <strong>${filtered.length}</strong> de <strong>${this.books.length}</strong> títulos`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            No se encontraron libros con los criterios seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(book => {
      let thumbSvg = '';
      if (window.BookCoverRenderer) {
        thumbSvg = BookCoverRenderer.renderSVG(book, { width: 44, height: 66, isThumbnail: true });
      } else {
        thumbSvg = `<div style="background:#111;width:100%;height:100%;"></div>`;
      }

      const badgeHtml = book.badge 
        ? `<span class="admin-badge-pill ${book.badge.toLowerCase().includes('novedad') ? 'novedad' : (book.badge.toLowerCase().includes('esencial') ? 'esencial' : 'default')}">${book.badge}</span>` 
        : '';

      return `
        <tr>
          <td>
            <div class="admin-book-cell">
              <div class="admin-book-thumb">${thumbSvg}</div>
              <div class="admin-book-info">
                <h4>${book.title}</h4>
                <p>${book.subtitle || ''}</p>
                <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted);">${book.number || ''}</span>
              </div>
            </div>
          </td>
          <td><strong>${book.author}</strong></td>
          <td><span class="admin-badge-pill default">${book.collection}</span></td>
          <td><span style="font-family:var(--font-mono);">${book.year}</span></td>
          <td><strong style="font-family:var(--font-heading);">${parseFloat(book.price).toFixed(2)} €</strong></td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="checkbox" id="featured-${book.id}" ${book.featured ? 'checked' : ''} onchange="AdminApp.toggleFeatured('${book.id}', this.checked)" title="Marcar como destacado">
              ${badgeHtml}
            </div>
          </td>
          <td>
            <div class="admin-row-actions">
              <button class="admin-action-icon-btn" onclick="AdminApp.openEditBookModal('${book.id}')" title="Editar libro">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="admin-action-icon-btn" onclick="AdminApp.duplicateBook('${book.id}')" title="Duplicar ficha">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="admin-action-icon-btn danger" onclick="AdminApp.confirmDeleteBook('${book.id}')" title="Eliminar del catálogo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleFeatured(bookId, isFeatured) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;
    book.featured = isFeatured;
    this.saveBooks();
    this.showToast(`«${book.title}» ${isFeatured ? 'marcado como destacado' : 'retirado de destacados'}`);
    this.updateBadges();
  },

  /* ------------------------------------------------------------------------
     Modal de Libro (Alta / Edición y Portada en Vivo)
     ------------------------------------------------------------------------ */
  openNewBookModal() {
    this.editingBookId = null;
    const modalTitle = document.getElementById('book-modal-title');
    if (modalTitle) modalTitle.textContent = 'Añadir Nuevo Libro al Catálogo';

    // Rellenar formulario con plantilla vacía / predeterminada
    const nextNumber = `VÓRTICE ${(this.books.length + 1).toString().padStart(2, '0')}`;
    const nextId = `vortice-${(this.books.length + 1).toString().padStart(2, '0')}`;

    document.getElementById('form-book-id').value = nextId;
    document.getElementById('form-book-title').value = '';
    document.getElementById('form-book-subtitle').value = '';
    document.getElementById('form-book-author').value = '';
    document.getElementById('form-book-collection').value = 'cultura';
    document.getElementById('form-book-number').value = nextNumber;
    document.getElementById('form-book-year').value = new Date().getFullYear();
    document.getElementById('form-book-price').value = '24.00';
    document.getElementById('form-book-badge').value = 'Novedad';
    document.getElementById('form-book-featured').checked = false;
    document.getElementById('form-book-isbn').value = `978-84-12894${Math.floor(10 + Math.random() * 90)}-0-1`;
    document.getElementById('form-book-pages').value = '280';
    document.getElementById('form-book-dimensions').value = '145 x 220 mm';
    document.getElementById('form-book-binding').value = 'Tapa dura entelada';
    document.getElementById('form-book-paper').value = 'Fedrigoni Arena 120 g/m²';
    document.getElementById('form-book-typography').value = 'Space Grotesk & Newsreader';
    document.getElementById('form-book-translator').value = 'Original en castellano';
    document.getElementById('form-book-synopsis').value = '';
    document.getElementById('form-book-quote').value = '';
    document.getElementById('form-book-curatorial').value = '';

    // Estilo de portada
    document.getElementById('form-cover-type').value = 'svg';
    document.getElementById('form-cover-image').value = '';
    document.getElementById('form-cover-theme').value = 'geometric-lines';
    document.getElementById('form-cover-bg').value = '#0D0D0D';
    document.getElementById('form-cover-bg-hex').value = '#0D0D0D';
    document.getElementById('form-cover-text').value = '#FFFFFF';
    document.getElementById('form-cover-text-hex').value = '#FFFFFF';
    document.getElementById('form-cover-accent').value = '#FF3300';
    document.getElementById('form-cover-accent-hex').value = '#FF3300';
    document.getElementById('form-cover-label').value = nextNumber;

    this.toggleCoverTypeInputs();
    this.updateLiveCoverPreview();

    const modal = document.getElementById('modal-book-form');
    if (modal) modal.classList.add('active');
  },

  openEditBookModal(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;

    this.editingBookId = bookId;
    const modalTitle = document.getElementById('book-modal-title');
    if (modalTitle) modalTitle.textContent = `Editar Libro: «${book.title}»`;

    document.getElementById('form-book-id').value = book.id;
    document.getElementById('form-book-title').value = book.title || '';
    document.getElementById('form-book-subtitle').value = book.subtitle || '';
    document.getElementById('form-book-author').value = book.author || '';
    document.getElementById('form-book-collection').value = book.collectionId || 'cultura';
    document.getElementById('form-book-number').value = book.number || '';
    document.getElementById('form-book-year').value = book.year || 2026;
    document.getElementById('form-book-price').value = book.price || 24.00;
    document.getElementById('form-book-badge').value = book.badge || '';
    document.getElementById('form-book-featured').checked = !!book.featured;
    document.getElementById('form-book-isbn').value = book.isbn || '';
    document.getElementById('form-book-pages').value = book.pages || 280;
    document.getElementById('form-book-dimensions').value = book.dimensions || '145 x 220 mm';
    document.getElementById('form-book-binding').value = book.binding || 'Tapa dura';
    document.getElementById('form-book-paper').value = book.paper || 'Papel ecológico 90 g/m²';
    document.getElementById('form-book-typography').value = book.typography || 'Alegreya';
    document.getElementById('form-book-translator').value = book.translator || 'Original en castellano';
    document.getElementById('form-book-synopsis').value = book.synopsis || '';
    document.getElementById('form-book-quote').value = book.quote || '';
    document.getElementById('form-book-curatorial').value = book.curatorialNote || '';

    // Portada
    const hasImage = !!book.coverImage;
    document.getElementById('form-cover-type').value = hasImage ? 'image' : 'svg';
    document.getElementById('form-cover-image').value = book.coverImage || '';

    const style = book.coverStyle || {};
    const theme = style.theme || 'geometric-lines';
    const bg = style.bg || '#0D0D0D';
    const text = style.text || '#FFFFFF';
    const accent = style.accent || '#FF3300';
    const label = style.label || book.number || '';

    document.getElementById('form-cover-theme').value = theme;
    document.getElementById('form-cover-bg').value = bg;
    document.getElementById('form-cover-bg-hex').value = bg;
    document.getElementById('form-cover-text').value = text;
    document.getElementById('form-cover-text-hex').value = text;
    document.getElementById('form-cover-accent').value = accent;
    document.getElementById('form-cover-accent-hex').value = accent;
    document.getElementById('form-cover-label').value = label;

    this.toggleCoverTypeInputs();
    this.updateLiveCoverPreview();

    const modal = document.getElementById('modal-book-form');
    if (modal) modal.classList.add('active');
  },

  closeBookModal() {
    const modal = document.getElementById('modal-book-form');
    if (modal) modal.classList.remove('active');
    this.editingBookId = null;
  },

  toggleCoverTypeInputs() {
    const type = document.getElementById('form-cover-type').value;
    const imgGroup = document.getElementById('group-cover-image');
    const svgGroup = document.getElementById('group-cover-svg-settings');

    if (imgGroup && svgGroup) {
      if (type === 'image') {
        imgGroup.style.display = 'block';
        svgGroup.style.display = 'none';
      } else {
        imgGroup.style.display = 'none';
        svgGroup.style.display = 'block';
      }
    }
  },

  updateLiveCoverPreview() {
    const previewContainer = document.getElementById('admin-live-cover-preview');
    if (!previewContainer) return;

    const coverType = document.getElementById('form-cover-type')?.value || 'svg';
    const title = document.getElementById('form-book-title')?.value || 'TÍTULO DEL LIBRO';
    const author = document.getElementById('form-book-author')?.value || 'Autor / Autora';
    const number = document.getElementById('form-book-number')?.value || 'VÓRTICE 00';
    const year = parseInt(document.getElementById('form-book-year')?.value) || 2026;
    const isbn = document.getElementById('form-book-isbn')?.value || '978-84-000000-0-0';
    const coverImage = document.getElementById('form-cover-image')?.value?.trim();

    const mockBook = {
      id: this.editingBookId || 'live-preview',
      title: title,
      subtitle: document.getElementById('form-book-subtitle')?.value || '',
      author: author,
      number: number,
      year: year,
      isbn: isbn,
      coverImage: coverType === 'image' && coverImage ? coverImage : null,
      coverStyle: {
        bg: document.getElementById('form-cover-bg')?.value || '#0D0D0D',
        text: document.getElementById('form-cover-text')?.value || '#FFFFFF',
        accent: document.getElementById('form-cover-accent')?.value || '#FF3300',
        theme: document.getElementById('form-cover-theme')?.value || 'geometric-lines',
        label: document.getElementById('form-cover-label')?.value || number
      }
    };

    if (window.BookCoverRenderer) {
      previewContainer.innerHTML = BookCoverRenderer.renderSVG(mockBook, { width: 220, height: 330 });
    }
  },

  saveBookForm(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('form-book-id').value.trim();
    const title = document.getElementById('form-book-title').value.trim();
    const author = document.getElementById('form-book-author').value.trim();

    if (!title || !author) {
      this.showToast('Por favor, indica al menos el título y el autor');
      return;
    }

    const collectionId = document.getElementById('form-book-collection').value;
    const colObj = this.collections.find(c => c.id === collectionId);
    const collectionName = colObj ? colObj.name : 'Cultura';

    const coverType = document.getElementById('form-cover-type').value;
    const coverImage = coverType === 'image' ? document.getElementById('form-cover-image').value.trim() : null;

    const bookPayload = {
      id: id || `vortice-${Date.now().toString(36)}`,
      title: title,
      subtitle: document.getElementById('form-book-subtitle').value.trim(),
      author: author,
      collection: collectionName,
      collectionId: collectionId,
      number: document.getElementById('form-book-number').value.trim(),
      year: parseInt(document.getElementById('form-book-year').value) || 2026,
      price: parseFloat(document.getElementById('form-book-price').value) || 20.00,
      badge: document.getElementById('form-book-badge').value.trim(),
      featured: document.getElementById('form-book-featured').checked,
      isbn: document.getElementById('form-book-isbn').value.trim(),
      pages: parseInt(document.getElementById('form-book-pages').value) || 280,
      dimensions: document.getElementById('form-book-dimensions').value.trim(),
      binding: document.getElementById('form-book-binding').value.trim(),
      paper: document.getElementById('form-book-paper').value.trim(),
      typography: document.getElementById('form-book-typography').value.trim(),
      translator: document.getElementById('form-book-translator').value.trim(),
      synopsis: document.getElementById('form-book-synopsis').value.trim(),
      quote: document.getElementById('form-book-quote').value.trim(),
      curatorialNote: document.getElementById('form-book-curatorial').value.trim(),
      coverImage: coverImage,
      coverStyle: {
        bg: document.getElementById('form-cover-bg').value,
        text: document.getElementById('form-cover-text').value,
        accent: document.getElementById('form-cover-accent').value,
        theme: document.getElementById('form-cover-theme').value,
        label: document.getElementById('form-cover-label').value.trim() || document.getElementById('form-book-number').value.trim()
      }
    };

    if (this.editingBookId) {
      const idx = this.books.findIndex(b => b.id === this.editingBookId);
      if (idx !== -1) {
        this.books[idx] = { ...this.books[idx], ...bookPayload };
        this.showToast(`Libro «${title}» actualizado con éxito`);
      }
    } else {
      // Si el id ya existe, crear sufijo
      if (this.books.some(b => b.id === bookPayload.id)) {
        bookPayload.id = `${bookPayload.id}-${Date.now().toString().slice(-4)}`;
      }
      this.books.unshift(bookPayload);
      this.showToast(`Nuevo libro «${title}» añadido al catálogo`);
    }

    this.saveBooks();

    // Sincronizar en la nube con Supabase si está activo
    if (window.VorticeDB && VorticeDB.isConnected()) {
      VorticeDB.saveBook(bookPayload);
    }

    this.closeBookModal();
    this.refreshAll();
  },

  duplicateBook(bookId) {
    const orig = this.books.find(b => b.id === bookId);
    if (!orig) return;

    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = `vortice-copy-${Date.now().toString(36)}`;
    copy.title = `${copy.title} (Copia)`;
    copy.featured = false;

    this.books.unshift(copy);
    this.saveBooks();
    this.showToast(`Copia creada de «${orig.title}»`);
    this.refreshAll();
  },

  confirmDeleteBook(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;

    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente del catálogo el libro:\n\n«${book.title}» de ${book.author}?`);
    if (confirmed) {
      this.books = this.books.filter(b => b.id !== bookId);
      this.saveBooks();
      if (window.VorticeDB && VorticeDB.isConnected()) {
        VorticeDB.deleteBook(bookId);
      }
      this.showToast(`Libro «${book.title}» eliminado del catálogo`);
      this.refreshAll();
    }
  },

  /* ------------------------------------------------------------------------
     TAB 3: Gestión de Pedidos y Albaranes
     ------------------------------------------------------------------------ */
  renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    const countDisplay = document.getElementById('admin-orders-count-summary');
    if (!tbody) return;

    let filtered = [...this.orders];

    if (this.orderFilterStatus !== 'all') {
      filtered = filtered.filter(o => (o.status || 'Completado').toLowerCase() === this.orderFilterStatus.toLowerCase());
    }

    const q = this.orderSearchQuery.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(o => 
        (o.orderRef && o.orderRef.toLowerCase().includes(q)) ||
        (o.payerName && o.payerName.toLowerCase().includes(q)) ||
        (o.payerEmail && o.payerEmail.toLowerCase().includes(q))
      );
    }

    if (countDisplay) {
      countDisplay.innerHTML = `Mostrando <strong>${filtered.length}</strong> de <strong>${this.orders.length}</strong> pedidos`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            No hay pedidos con estos filtros.
            <div style="margin-top: 1rem;">
              <button class="admin-btn admin-btn-sm" onclick="AdminApp.generateDemoOrders()">Generar 4 Pedidos Demo</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(order => {
      const itemsCount = (order.items || []).reduce((acc, item) => acc + (item.qty || 1), 0);
      const itemsBrief = (order.items || []).map(i => `${i.title} (${i.qty})`).join(', ');
      const statusClass = (order.status || 'Completado').toLowerCase();

      return `
        <tr>
          <td><strong style="font-family:var(--font-mono); color:var(--text-primary);">${order.orderRef}</strong></td>
          <td><span style="font-size:0.8rem;">${order.date}</span></td>
          <td>
            <strong>${order.payerName}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${order.payerEmail}</div>
          </td>
          <td>
            <span title="${itemsBrief}"><strong>${itemsCount}</strong> ejemplares</span>
          </td>
          <td><strong style="font-family:var(--font-heading); font-size:1rem;">${parseFloat(order.total || 0).toFixed(2)} €</strong></td>
          <td>
            <select class="admin-form-select" style="padding:0.3rem 0.5rem; font-size:0.75rem; width:auto;" onchange="AdminApp.updateOrderStatus('${order.orderRef}', this.value)">
              <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="Procesando" ${order.status === 'Procesando' ? 'selected' : ''}>Procesando</option>
              <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
              <option value="Completado" ${order.status === 'Completado' || !order.status ? 'selected' : ''}>Completado</option>
            </select>
          </td>
          <td>
            <div class="admin-row-actions">
              <button class="admin-action-icon-btn" onclick="AdminApp.viewOrderReceipt('${order.orderRef}')" title="Ver Albarán / Factura Proforma">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </button>
              <button class="admin-action-icon-btn" onclick="AdminApp.printOrderReceipt('${order.orderRef}')" title="Imprimir Albarán">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              </button>
              <button class="admin-action-icon-btn danger" onclick="AdminApp.confirmDeleteOrder('${order.orderRef}')" title="Eliminar pedido">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateOrderStatus(orderRef, newStatus) {
    const order = this.orders.find(o => o.orderRef === orderRef);
    if (!order) return;
    order.status = newStatus;
    this.saveOrders();
    this.showToast(`Pedido ${orderRef} marcado como «${newStatus}»`);
    this.updateBadges();
  },

  viewOrderReceipt(orderRef) {
    const order = this.orders.find(o => o.orderRef === orderRef);
    if (!order) return;

    this.activeOrderRef = orderRef;
    const container = document.getElementById('receipt-modal-content');
    if (!container) return;

    const subtotal = parseFloat(order.subtotal || order.total || 0);
    const shipping = parseFloat(order.shipping || 0);
    const total = parseFloat(order.total || 0);
    const vatEstimated = (subtotal * 0.04).toFixed(2); // 4% IVA superreducido de libros en España

    container.innerHTML = `
      <div class="admin-receipt-wrap admin-receipt-printable">
        <div class="admin-receipt-header">
          <div class="admin-receipt-brand">
            <img src="img/logo-w.png" alt="Editorial Vórtice" style="filter: invert(1);">
            <p><strong>${this.settings.companyName}</strong><br>
            CIF: ${this.settings.companyNif}<br>
            ${this.settings.companyAddress}<br>
            ${this.settings.companyEmail}</p>
          </div>
          <div class="admin-receipt-meta">
            <h4>ALBARÁN DE EXPEDICIÓN</h4>
            <p><strong>Ref:</strong> ${order.orderRef}</p>
            <p><strong>Fecha:</strong> ${order.date}</p>
            <p><strong>Pasarela:</strong> PayPal Transaction ID: ${order.paypalTransactionId || 'N/A'}</p>
            <p><strong>Estado:</strong> <span class="admin-badge-pill status-${(order.status || 'Completado').toLowerCase()}">${order.status || 'Completado'}</span></p>
          </div>
        </div>

        <div class="admin-receipt-client-box">
          <div>
            <h5>Destinatario / Facturar a</h5>
            <p><strong>${order.payerName}</strong><br>
            ${order.payerEmail}<br>
            Envío Postal Estándar (24/48h Peninsular y Red de Librerías)</p>
          </div>
          <div>
            <h5>Detalles de Distribución</h5>
            <p>Embalaje protegido en cartón reciclado libre de ácidos.<br>
            Edición numerada y verificada en taller editorial.</p>
          </div>
        </div>

        <table class="admin-receipt-table">
          <thead>
            <tr>
              <th>Título y Edición</th>
              <th>Colección</th>
              <th style="text-align:center;">Cant.</th>
              <th style="text-align:right;">PVP Unit.</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td><strong>${item.title}</strong><br><span style="font-size:0.75rem; color:#777;">${item.author || ''}</span></td>
                <td>${item.collection || 'General'}</td>
                <td style="text-align:center;">${item.qty || 1}</td>
                <td style="text-align:right;">${parseFloat(item.price || 0).toFixed(2)} €</td>
                <td style="text-align:right;"><strong>${(parseFloat(item.price || 0) * (item.qty || 1)).toFixed(2)} €</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="admin-receipt-totals">
          <div class="admin-receipt-total-row">
            <span>Subtotal Bruto:</span>
            <span>${subtotal.toFixed(2)} €</span>
          </div>
          <div class="admin-receipt-total-row">
            <span>IVA Libros (4% inc.):</span>
            <span>${vatEstimated} €</span>
          </div>
          <div class="admin-receipt-total-row">
            <span>Gastos de Envío:</span>
            <span>${shipping === 0 ? 'Gratis (Promoción)' : `${shipping.toFixed(2)} €`}</span>
          </div>
          <div class="admin-receipt-total-row grand-total">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)} €</span>
          </div>
        </div>

        <div class="admin-receipt-footer-notes">
          <p>Editorial Vórtice · Inscrita en el Registro Mercantil de Madrid · Depósito Legal e ISBN gestionados según normativa vigente.<br>
          Para cualquier consulta de expedición contactar con logística: logistica@vortice-editorial.es</p>
        </div>
      </div>
    `;

    const modal = document.getElementById('modal-order-receipt');
    if (modal) modal.classList.add('active');
  },

  printOrderReceipt(orderRef) {
    this.viewOrderReceipt(orderRef);
    setTimeout(() => {
      window.print();
    }, 300);
  },

  closeOrderReceiptModal() {
    const modal = document.getElementById('modal-order-receipt');
    if (modal) modal.classList.remove('active');
    this.activeOrderRef = null;
  },

  confirmDeleteOrder(orderRef) {
    const confirmed = window.confirm(`¿Deseas eliminar del registro el pedido ${orderRef}?`);
    if (confirmed) {
      this.orders = this.orders.filter(o => o.orderRef !== orderRef);
      this.saveOrders();
      this.showToast(`Pedido ${orderRef} eliminado`);
      this.refreshAll();
    }
  },

  generateDemoOrders() {
    const sampleBuyers = [
      { name: 'Dr. Guillermo Navarro', email: 'g.navarro@arquitectura-madrid.es', city: 'Madrid' },
      { name: 'Sophie L. Bernard', email: 'sophie.bernard@basel-kunst.ch', city: 'Basilea' },
      { name: 'Alonso Trejo M.', email: 'trejo.alonso@filosofia-unam.mx', city: 'Ciudad de México' },
      { name: 'Kenji Takahashi', email: 'k.takahashi@tokyo-design.jp', city: 'Tokio' }
    ];

    const demoOrders = sampleBuyers.map((buyer, i) => {
      const book1 = this.books[i % this.books.length] || this.books[0];
      const book2 = this.books[(i + 2) % this.books.length] || this.books[1];
      const items = [
        { ...book1, qty: 1 },
        { ...book2, qty: (i === 1 ? 2 : 1) }
      ];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping = subtotal >= 40 ? 0 : 3.50;
      const total = subtotal + shipping;
      const statuses = ['Completado', 'Enviado', 'Procesando', 'Pendiente'];

      return {
        orderRef: `VOR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        paypalTransactionId: `PP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString('es-ES', {
          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        payerName: buyer.name,
        payerEmail: buyer.email,
        items: items,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: statuses[i % statuses.length]
      };
    });

    this.orders = [...demoOrders, ...this.orders];
    this.saveOrders();
    this.showToast('Se han generado 4 pedidos de muestra con éxito');
    this.refreshAll();
  },

  /* ------------------------------------------------------------------------
     TAB 4: Colecciones Editoriales
     ------------------------------------------------------------------------ */
  renderCollectionsGrid() {
    const container = document.getElementById('admin-collections-container');
    if (!container) return;

    const validCollections = this.collections.filter(c => c.id !== 'all');

    container.innerHTML = validCollections.map(col => {
      const count = this.books.filter(b => b.collectionId === col.id || b.collection?.toLowerCase() === col.name?.toLowerCase()).length;
      return `
        <div class="admin-collection-card">
          <div class="admin-col-card-header">
            <div>
              <span class="admin-col-code">${col.code || 'COL'}</span>
              <h3 class="admin-col-title">${col.name}</h3>
            </div>
            <span class="admin-badge-pill default">${col.id}</span>
          </div>
          <p class="admin-col-desc">${col.description || 'Sin descripción curatorial.'}</p>
          <div class="admin-col-card-footer">
            <span class="admin-col-count">📚 <strong>${count}</strong> títulos publicados</span>
            <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="AdminApp.filterCatalogByCollection('${col.id}')">Ver en Catálogo</button>
          </div>
        </div>
      `;
    }).join('');
  },

  filterCatalogByCollection(colId) {
    this.bookFilterCollection = colId;
    const sel = document.getElementById('admin-filter-collection-select');
    if (sel) sel.value = colId;
    this.switchTab('catalog');
  },

  openNewCollectionModal() {
    const name = window.prompt('Nombre de la nueva colección editorial (ej. Fotografía Crítica):');
    if (!name || !name.trim()) return;

    const id = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    const code = window.prompt('Código de referencia (ej. COL-06):', `COL-${(this.collections.length).toString().padStart(2, '0')}`);
    const desc = window.prompt('Descripción de la colección:');

    this.collections.push({
      id: id,
      name: name.trim(),
      code: code ? code.trim() : 'COL',
      description: desc ? desc.trim() : ''
    });

    this.saveCollections();
    this.showToast(`Colección «${name}» creada correctamente`);
    this.refreshAll();
  },

  /* ------------------------------------------------------------------------
     TAB 5: Ajustes & Configuración de Tienda y Base de Datos
     ------------------------------------------------------------------------ */
  renderSettings() {
    // Supabase
    const inputSupaUrl = document.getElementById('setting-supabase-url');
    if (inputSupaUrl) inputSupaUrl.value = localStorage.getItem('vortice-supabase-url') || '';

    const inputSupaKey = document.getElementById('setting-supabase-key');
    if (inputSupaKey) inputSupaKey.value = localStorage.getItem('vortice-supabase-key') || '';

    if (window.VorticeDB && VorticeDB.isConnected()) {
      this.updateSupabaseStatusPill(VorticeDB.isOnline ? '🟢 Conectado (PostgreSQL)' : '⚠️ Configurado (Verificando...)', VorticeDB.isOnline ? 'status-completado' : 'status-pendiente');
    } else {
      this.updateSupabaseStatusPill('⚪ Modo Local (Offline)', 'default');
    }

    // PayPal y Tienda
    const inputPaypal = document.getElementById('setting-paypal-id');
    if (inputPaypal) inputPaypal.value = this.settings.paypalClientId;

    const inputShipStd = document.getElementById('setting-shipping-std');
    if (inputShipStd) inputShipStd.value = this.settings.shippingStandard.toFixed(2);

    const inputShipThreshold = document.getElementById('setting-shipping-threshold');
    if (inputShipThreshold) inputShipThreshold.value = this.settings.shippingFreeThreshold.toFixed(2);

    const inputCompName = document.getElementById('setting-company-name');
    if (inputCompName) inputCompName.value = this.settings.companyName;

    const inputCompNif = document.getElementById('setting-company-nif');
    if (inputCompNif) inputCompNif.value = this.settings.companyNif;

    const inputCompAddress = document.getElementById('setting-company-address');
    if (inputCompAddress) inputCompAddress.value = this.settings.companyAddress;

    const inputCompEmail = document.getElementById('setting-company-email');
    if (inputCompEmail) inputCompEmail.value = this.settings.companyEmail;
  },

  saveSettings(e) {
    if (e) e.preventDefault();

    this.settings.paypalClientId = document.getElementById('setting-paypal-id')?.value.trim() || 'test';
    this.settings.shippingStandard = parseFloat(document.getElementById('setting-shipping-std')?.value) || 3.50;
    this.settings.shippingFreeThreshold = parseFloat(document.getElementById('setting-shipping-threshold')?.value) || 40.00;
    this.settings.companyName = document.getElementById('setting-company-name')?.value.trim() || 'Editorial Vórtice S.L.';
    this.settings.companyNif = document.getElementById('setting-company-nif')?.value.trim() || 'B-84920194';
    this.settings.companyAddress = document.getElementById('setting-company-address')?.value.trim() || '';
    this.settings.companyEmail = document.getElementById('setting-company-email')?.value.trim() || '';

    localStorage.setItem('vortice-paypal-client-id', this.settings.paypalClientId);
    localStorage.setItem('vortice-shipping-standard', this.settings.shippingStandard.toString());
    localStorage.setItem('vortice-shipping-threshold', this.settings.shippingFreeThreshold.toString());
    localStorage.setItem('vortice-company-name', this.settings.companyName);
    localStorage.setItem('vortice-company-nif', this.settings.companyNif);
    localStorage.setItem('vortice-company-address', this.settings.companyAddress);
    localStorage.setItem('vortice-company-email', this.settings.companyEmail);

    this.showToast('Configuración editorial y pasarela guardada');
  },

  /* ------------------------------------------------------------------------
     Gestión de Base de Datos Cloud (Supabase / PostgreSQL)
     ------------------------------------------------------------------------ */
  updateSupabaseStatusPill(text, badgeClass) {
    const pill = document.getElementById('supabase-status-pill');
    if (!pill) return;
    pill.textContent = text;
    pill.className = `admin-badge-pill ${badgeClass}`;
  },

  async testAndSaveSupabase() {
    const url = document.getElementById('setting-supabase-url')?.value.trim();
    const key = document.getElementById('setting-supabase-key')?.value.trim();

    if (!url || !key) {
      this.showToast('Introduce tanto la Project URL como la Anon Key de Supabase');
      return;
    }

    this.showToast('Comprobando conexión con PostgreSQL...');
    this.updateSupabaseStatusPill('Verificando...', 'default');

    if (window.VorticeDB) {
      const ok = await VorticeDB.setCredentials(url, key);
      if (ok) {
        this.updateSupabaseStatusPill('🟢 Conectado (PostgreSQL)', 'status-completado');
        this.showToast('¡Conectado exitosamente con Supabase PostgreSQL!');
        this.loadData();
      } else {
        this.updateSupabaseStatusPill('⚠️ Error de Acceso', 'status-pendiente');
        this.showToast('No se pudo conectar. Verifica la URL, la Anon Key y que ejecutaste el script SQL.');
      }
    }
  },

  disconnectSupabase() {
    if (window.VorticeDB) {
      VorticeDB.clearCredentials();
      const inputUrl = document.getElementById('setting-supabase-url');
      if (inputUrl) inputUrl.value = '';
      const inputKey = document.getElementById('setting-supabase-key');
      if (inputKey) inputKey.value = '';
      this.updateSupabaseStatusPill('⚪ Modo Local (Offline)', 'default');
      this.showToast('Desconectado de Supabase. Operando con base de datos local.');
    }
  },

  async migrateToSupabase() {
    if (!window.VorticeDB || !VorticeDB.isConnected()) {
      this.showToast('Conecta primero tu proyecto Supabase antes de migrar.');
      return;
    }

    const confirmed = window.confirm(
      '¿Deseas migrar todo el catálogo actual y pedidos a la base de datos de Supabase?\n\n' +
      'Esto subirá tus libros, colecciones y pedidos a las tablas correspondientes en PostgreSQL.'
    );
    if (!confirmed) return;

    this.showToast('Subiendo datos a PostgreSQL...');
    try {
      await VorticeDB.migrateLocalData(this.books, this.collections, this.orders, this.settings);
      this.showToast('¡Migración completada con éxito en Supabase!');
    } catch (err) {
      console.error(err);
      this.showToast('Error durante la migración: ' + err.message);
    }
  },

  async copySqlSchema() {
    try {
      const res = await fetch('sql/schema.sql');
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      this.showToast('¡Script SQL copiado! Pégalo en el SQL Editor de Supabase.');
    } catch (e) {
      window.open('sql/schema.sql', '_blank');
      this.showToast('Abriendo archivo sql/schema.sql...');
    }
  },

  /* ------------------------------------------------------------------------
     Copias de Seguridad (Export / Import JSON)
     ------------------------------------------------------------------------ */
  exportFullBackup() {
    const backupData = {
      app: 'Editorial Vórtice',
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      books: this.books,
      collections: this.collections,
      orders: this.orders,
      settings: this.settings
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vortice_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.showToast('Copia de seguridad descargada en JSON');
  },

  triggerImportBackup() {
    const fileInput = document.getElementById('input-import-backup-file');
    if (fileInput) fileInput.click();
  },

  handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.books && Array.isArray(parsed.books)) {
          this.books = parsed.books;
          this.saveBooks();
        }
        if (parsed.collections && Array.isArray(parsed.collections)) {
          this.collections = parsed.collections;
          this.saveCollections();
        }
        if (parsed.orders && Array.isArray(parsed.orders)) {
          this.orders = parsed.orders;
          this.saveOrders();
        }
        this.showToast('Copia de seguridad restaurada con éxito');
        this.refreshAll();
      } catch (err) {
        alert('Error al leer el archivo JSON. Asegúrate de que es un archivo válido de Vórtice.');
      }
    };
    reader.readAsText(file);
  },

  restoreFactoryDefaults() {
    const confirmed = window.confirm(
      '¿Restablecer el catálogo editorial a sus valores originales de fábrica?\n\n' +
      'Esta acción recargará los 12 títulos esenciales y las colecciones oficiales.'
    );
    if (!confirmed) return;

    if (typeof resetCatalogToDefault === 'function') {
      const res = resetCatalogToDefault();
      this.books = res.books;
      this.collections = res.collections;
    }
    this.showToast('Catálogo restablecido a valores originales de fábrica');
    this.refreshAll();
  },

  /* ------------------------------------------------------------------------
     Notificaciones Toast
     ------------------------------------------------------------------------ */
  showToast(msg) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  },

  /* ------------------------------------------------------------------------
     Event Listeners
     ------------------------------------------------------------------------ */
  bindEvents() {
    // Sincronización de colores en el generador de portadas
    const bindColorSync = (pickerId, hexId) => {
      const picker = document.getElementById(pickerId);
      const hex = document.getElementById(hexId);
      if (picker && hex) {
        picker.addEventListener('input', () => {
          hex.value = picker.value.toUpperCase();
          this.updateLiveCoverPreview();
        });
        hex.addEventListener('input', () => {
          if (/^#[0-9A-F]{6}$/i.test(hex.value)) {
            picker.value = hex.value;
            this.updateLiveCoverPreview();
          }
        });
      }
    };

    bindColorSync('form-cover-bg', 'form-cover-bg-hex');
    bindColorSync('form-cover-text', 'form-cover-text-hex');
    bindColorSync('form-cover-accent', 'form-cover-accent-hex');

    // Inputs que actualizan la portada en directo
    ['form-book-title', 'form-book-subtitle', 'form-book-author', 'form-book-number', 'form-book-year', 'form-cover-theme', 'form-cover-label'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updateLiveCoverPreview());
    });

    const coverTypeSelect = document.getElementById('form-cover-type');
    if (coverTypeSelect) {
      coverTypeSelect.addEventListener('change', () => {
        this.toggleCoverTypeInputs();
        this.updateLiveCoverPreview();
      });
    }

    const coverImgInput = document.getElementById('form-cover-image');
    if (coverImgInput) {
      coverImgInput.addEventListener('input', () => this.updateLiveCoverPreview());
    }

    // Buscador de libros
    const bookSearch = document.getElementById('admin-book-search-input');
    if (bookSearch) {
      bookSearch.addEventListener('input', (e) => {
        this.bookSearchQuery = e.target.value;
        this.renderBooksTable();
      });
    }

    // Filtro de colección de libros
    const colFilter = document.getElementById('admin-filter-collection-select');
    if (colFilter) {
      colFilter.addEventListener('change', (e) => {
        this.bookFilterCollection = e.target.value;
        this.renderBooksTable();
      });
    }

    // Ordenación de libros
    const bookSort = document.getElementById('admin-sort-books-select');
    if (bookSort) {
      bookSort.addEventListener('change', (e) => {
        this.bookSortBy = e.target.value;
        this.renderBooksTable();
      });
    }

    // Buscador de pedidos
    const orderSearch = document.getElementById('admin-order-search-input');
    if (orderSearch) {
      orderSearch.addEventListener('input', (e) => {
        this.orderSearchQuery = e.target.value;
        this.renderOrdersTable();
      });
    }

    // Filtro estado de pedidos
    const orderStatus = document.getElementById('admin-order-status-filter');
    if (orderStatus) {
      orderStatus.addEventListener('change', (e) => {
        this.orderFilterStatus = e.target.value;
        this.renderOrdersTable();
      });
    }

    // Input file de importación
    const importInput = document.getElementById('input-import-backup-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImportFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeBookModal();
        this.closeOrderReceiptModal();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
