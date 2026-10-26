/* cspell:disable */
/**
 * Editorial Vórtice - Aplicación Principal
 * Lógica interactiva: catálogo, retícula dinámica, visor de lectura y cesta
 */

// Estado global de la aplicación
const AppState = {
  activeCollection: 'all',
  searchQuery: '',
  sortBy: 'featured',
  layoutMode: 'grid', // 'grid' | 'dense' | 'index'
  theme: localStorage.getItem('vortice-theme') || 'light',
  cart: JSON.parse(localStorage.getItem('vortice-cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('vortice-wishlist') || '[]'),
  activeBookId: null,
  readerBookId: null,
  readerFont: 'serif' // 'serif' | 'sans'
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderHeroFeature();
  renderCatalog();
  renderFilterTabs();
  initEventListeners();
  updateCartUI();
  updateWishlistUI();
  startInternationalClocks();
});

/* ==========================================================================
   Gestión del Tema (Dark / Light Pentagram Inversion)
   ========================================================================== */
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  updateThemeIcon();
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('vortice-theme', AppState.theme);
  document.documentElement.setAttribute('data-theme', AppState.theme);
  updateThemeIcon();
  showToast(`Modo visual: ${AppState.theme === 'dark' ? 'Contraste Invertido' : 'Editorial Claro'}`);
}

function updateThemeIcon() {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (AppState.theme === 'dark') {
    // Sol / modo claro
    icon.innerHTML = `<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/><line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" stroke-width="2"/><line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="2"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/><line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="2"/><line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="2"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>`;
  } else {
    // Luna / modo oscuro
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="none"/>`;
  }
}

/* ==========================================================================
   Hero Spotlight
   ========================================================================== */
function renderHeroFeature() {
  const heroContainer = document.getElementById('hero-spotlight-section');
  if (!heroContainer) return;

  const featuredBook = BOOKS_DATA.find(b => b.featured) || BOOKS_DATA[0];
  const svgCover = BookCoverRenderer.renderSVG(featuredBook, { width: 440, height: 660 });

  heroContainer.innerHTML = `
    <div class="container">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-meta-kicker">
            <span class="hero-tag">Selección Editorial</span>
            <span class="hero-col-number">${featuredBook.collection} · ${featuredBook.number}</span>
          </div>

          <h1 class="hero-title">${featuredBook.title}</h1>
          <p class="hero-author">${featuredBook.author}</p>
          
          <blockquote class="hero-quote">
            ${featuredBook.quote}
          </blockquote>

          <div class="hero-specs-row">
            <div class="spec-item">
              <span class="spec-label">Encuadernación</span>
              <span class="spec-value">Tapa dura entelada</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Páginas</span>
              <span class="spec-value">${featuredBook.pages} pp.</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Formato</span>
              <span class="spec-value">${featuredBook.dimensions}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Precio</span>
              <span class="spec-value">${featuredBook.price.toFixed(2)} €</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary" onclick="addToCart('${featuredBook.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 01-8 0"></path>
              </svg>
              Comprar Ejemplar · ${featuredBook.price.toFixed(2)} €
            </button>

            <button class="btn-secondary" onclick="openReader('${featuredBook.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"></path>
              </svg>
              Muestra de Lectura
            </button>

            <button class="btn-secondary" onclick="openBookDetail('${featuredBook.id}')" title="Ver ficha técnica completa">
              Ficha Técnica
            </button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-book-3d" onclick="openBookDetail('${featuredBook.id}')" title="Explorar libro en detalle">
            ${svgCover}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Pestañas de Colecciones
   ========================================================================== */
function renderFilterTabs() {
  const container = document.getElementById('filter-tabs-container');
  if (!container) return;

  container.innerHTML = COLLECTIONS_DATA.map(col => `
    <button class="filter-tab ${AppState.activeCollection === col.id ? 'active' : ''}" 
            data-collection-id="${col.id}"
            onclick="setCollection('${col.id}')">
      ${col.name}
      <span class="count">${col.id === 'all' ? BOOKS_DATA.length : BOOKS_DATA.filter(b => b.collectionId === col.id).length}</span>
    </button>
  `).join('');
}

function setCollection(colId) {
  AppState.activeCollection = colId;
  renderFilterTabs();
  renderCatalog();
}

/* ==========================================================================
   Filtrado y Ordenación de Libros
   ========================================================================== */
function getFilteredBooks() {
  return BOOKS_DATA.filter(book => {
    // Filtro por colección
    const matchesCol = AppState.activeCollection === 'all' || book.collectionId === AppState.activeCollection;
    
    // Filtro por búsqueda
    const q = AppState.searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      book.title.toLowerCase().includes(q) || 
      book.author.toLowerCase().includes(q) || 
      book.subtitle.toLowerCase().includes(q) ||
      book.collection.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q);

    return matchesCol && matchesSearch;
  }).sort((a, b) => {
    switch (AppState.sortBy) {
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'year':
        return b.year - a.year;
      case 'featured':
      default:
        if (a.featured) return -1;
        if (b.featured) return 1;
        return 0;
    }
  });
}

/* ==========================================================================
   Renderizado del Catálogo (Grid, Dense y Tabla de Índice)
   ========================================================================== */
function renderCatalog() {
  const container = document.getElementById('catalog-content');
  const countDisplay = document.getElementById('catalog-results-count');
  if (!container) return;

  const filtered = getFilteredBooks();

  if (countDisplay) {
    countDisplay.innerHTML = `Mostrando <strong>${filtered.length}</strong> de <strong>${BOOKS_DATA.length}</strong> títulos`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 6rem 1rem; font-family: var(--font-heading);">
        <p style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">No se encontraron títulos</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Prueba a modificar los términos de búsqueda o seleccionar otra colección.</p>
        <button class="btn-primary" style="margin-top: 1.5rem;" onclick="resetFilters()">Restablecer filtros</button>
      </div>
    `;
    return;
  }

  // Render según layoutMode
  if (AppState.layoutMode === 'index') {
    renderIndexTable(filtered, container);
  } else {
    renderCardGrid(filtered, container);
  }
}

function resetFilters() {
  AppState.activeCollection = 'all';
  AppState.searchQuery = '';
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) searchInput.value = '';
  renderFilterTabs();
  renderCatalog();
}

function renderCardGrid(books, container) {
  const isDense = AppState.layoutMode === 'dense';

  const cardsHtml = books.map(book => {
    const isSaved = AppState.wishlist.includes(book.id);
    const svgCover = BookCoverRenderer.renderSVG(book, { width: 440, height: 660 });

    return `
      <article class="book-card" data-book-id="${book.id}">
        <div class="book-card-cover-wrap" onclick="openBookDetail('${book.id}')">
          ${book.badge ? `<span class="book-badge-corner">${book.badge}</span>` : ''}
          
          <button class="book-bookmark-btn ${isSaved ? 'saved' : ''}" 
                  onclick="event.stopPropagation(); toggleWishlist('${book.id}')"
                  title="${isSaved ? 'Quitar de guardados' : 'Guardar en lista de lectura'}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          ${svgCover}

          <div class="book-hover-actions">
            <button class="hover-btn" onclick="event.stopPropagation(); openReader('${book.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"></path>
              </svg>
              Lectura
            </button>
            <button class="hover-btn btn-cart-quick" onclick="event.stopPropagation(); addToCart('${book.id}')">
              + Cesta
            </button>
          </div>
        </div>

        <div class="book-card-info">
          <div class="book-card-meta">
            <span>${book.collection}</span>
            <span>${book.number}</span>
          </div>
          <h3 class="book-card-title" onclick="openBookDetail('${book.id}')">${book.title}</h3>
          <p class="book-card-author">${book.author}</p>
          <div class="book-card-bottom">
            <span class="book-card-price">${book.price.toFixed(2)} €</span>
            <button class="book-card-btn-text" onclick="openBookDetail('${book.id}')">
              Ficha
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <div class="books-grid ${isDense ? 'layout-dense' : ''}">
      ${cardsHtml}
    </div>
  `;
}

function renderIndexTable(books, container) {
  const rowsHtml = books.map(book => {
    const isSaved = AppState.wishlist.includes(book.id);
    const thumbSvg = BookCoverRenderer.renderSVG(book, { width: 38, height: 57, isThumbnail: true });

    return `
      <tr onclick="openBookDetail('${book.id}')">
        <td style="width: 50px;">
          <div class="table-thumb">${thumbSvg}</div>
        </td>
        <td>
          <div class="table-title-cell">
            <span>${book.title}</span>
            ${book.badge ? `<span class="table-badge">${book.badge}</span>` : ''}
          </div>
        </td>
        <td>${book.author}</td>
        <td>${book.collection}</td>
        <td>${book.number}</td>
        <td>${book.year}</td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem;">${book.isbn}</td>
        <td class="table-price">${book.price.toFixed(2)} €</td>
        <td style="text-align: right;" onclick="event.stopPropagation();">
          <div class="table-actions">
            <button class="table-action-btn" onclick="openReader('${book.id}')" title="Leer muestra">
              Lectura
            </button>
            <button class="table-action-btn" onclick="addToCart('${book.id}')" title="Añadir a la cesta">
              + Cesta
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="books-index-table-wrap">
      <table class="books-index-table">
        <thead>
          <tr>
            <th>Port.</th>
            <th>Título de la Obra</th>
            <th>Autor / Autora</th>
            <th>Colección</th>
            <th>Ref.</th>
            <th>Año</th>
            <th>ISBN</th>
            <th>PVP</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

function setLayout(mode) {
  AppState.layoutMode = mode;
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === mode);
  });
  renderCatalog();
}

/* ==========================================================================
   Cajón de Detalle de Libro (Book Detail Drawer)
   ========================================================================== */
function openBookDetail(bookId) {
  const book = BOOKS_DATA.find(b => b.id === bookId);
  if (!book) return;

  AppState.activeBookId = bookId;
  const drawer = document.getElementById('book-detail-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (!drawer || !backdrop) return;

  const svgCover = BookCoverRenderer.renderSVG(book, { width: 440, height: 660 });

  drawer.innerHTML = `
    <div class="drawer-header">
      <span class="drawer-header-meta">${book.collection} · ${book.number} · EDITORIAL VÓRTICE</span>
      <button class="drawer-close-btn" onclick="closeBookDetail()" aria-label="Cerrar ficha">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="drawer-body">
      <div class="drawer-book-presentation">
        <div class="drawer-cover-wrap">
          ${svgCover}
        </div>

        <div class="drawer-primary-info">
          ${book.badge ? `<span class="drawer-tag">${book.badge}</span>` : ''}
          <h2 class="drawer-book-title">${book.title}</h2>
          <p class="drawer-book-author">Por ${book.author}</p>
          <p style="font-size: 0.9rem; color: var(--text-muted); font-style: italic; margin-bottom: 1.25rem;">${book.subtitle}</p>
          
          <div class="drawer-book-price">${book.price.toFixed(2)} € <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">(IVA incl.)</span></div>

          <div class="drawer-cta-group">
            <button class="btn-primary btn-drawer-cart" onclick="addToCart('${book.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 01-8 0"></path>
              </svg>
              Añadir a la Cesta
            </button>

            <button class="btn-secondary btn-drawer-reader" onclick="closeBookDetail(); openReader('${book.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"></path>
              </svg>
              Leer Muestra del Primer Capítulo
            </button>
          </div>
        </div>
      </div>

      <blockquote class="drawer-quote">
        ${book.quote}
      </blockquote>

      <h3 class="drawer-section-title">Sinopsis Editorial</h3>
      <p class="drawer-synopsis-p">${book.synopsis}</p>
      
      <h3 class="drawer-section-title">Nota Curatorial</h3>
      <p class="drawer-synopsis-p" style="font-style: italic;">${book.curatorialNote}</p>

      <h3 class="drawer-section-title">Colofón y Especificaciones Técnicas</h3>
      <div class="drawer-colophon-grid">
        <div class="colophon-item">
          <span class="colophon-label">ISBN</span>
          <span class="colophon-val">${book.isbn}</span>
        </div>
        <div class="colophon-item">
          <span class="colophon-label">Páginas</span>
          <span class="colophon-val">${book.pages}</span>
        </div>
        <div class="colophon-item">
          <span class="colophon-label">Dimensiones</span>
          <span class="colophon-val">${book.dimensions}</span>
        </div>
        <div class="colophon-item">
          <span class="colophon-label">Traducción</span>
          <span class="colophon-val">${book.translator}</span>
        </div>
        <div class="colophon-item" style="grid-column: span 2;">
          <span class="colophon-label">Encuadernación</span>
          <span class="colophon-val">${book.binding}</span>
        </div>
        <div class="colophon-item" style="grid-column: span 2;">
          <span class="colophon-label">Papel Interior</span>
          <span class="colophon-val">${book.paper}</span>
        </div>
        <div class="colophon-item" style="grid-column: span 2;">
          <span class="colophon-label">Tipografía Utilizada</span>
          <span class="colophon-val">${book.typography}</span>
        </div>
      </div>
    </div>
  `;

  drawer.classList.add('active');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBookDetail() {
  const drawer = document.getElementById('book-detail-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop && !document.getElementById('cart-drawer')?.classList.contains('active')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Visor de Lectura (Sample Reader Modal)
   ========================================================================== */
function openReader(bookId) {
  const book = BOOKS_DATA.find(b => b.id === bookId);
  if (!book || !book.sampleChapter) return;

  AppState.readerBookId = bookId;
  const modal = document.getElementById('reader-modal');
  if (!modal) return;

  document.getElementById('reader-book-title').textContent = book.title;
  document.getElementById('reader-book-author').textContent = `Por ${book.author}`;
  document.getElementById('reader-chapter-title').textContent = book.sampleChapter.chapterTitle;

  const contentWrap = document.getElementById('reader-paragraphs');
  contentWrap.className = `reader-paragraphs ${AppState.readerFont === 'sans' ? 'font-sans' : ''}`;
  contentWrap.innerHTML = book.sampleChapter.content.map(p => {
    if (typeof p === 'string' && (p.trim().startsWith('<div') || p.trim().startsWith('<iframe'))) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Reiniciar barra de progreso
  const progressFill = document.getElementById('reader-progress-fill');
  if (progressFill) progressFill.style.width = '0%';

  const scrollContainer = document.getElementById('reader-scroll-container');
  if (scrollContainer) {
    scrollContainer.scrollTop = 0;
    scrollContainer.onscroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };
  }
}

function closeReader() {
  const modal = document.getElementById('reader-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleReaderFont(fontType) {
  AppState.readerFont = fontType;
  const contentWrap = document.getElementById('reader-paragraphs');
  if (contentWrap) {
    contentWrap.className = `reader-paragraphs ${fontType === 'sans' ? 'font-sans' : ''}`;
  }
  document.querySelectorAll('.reader-font-toggle').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.font === fontType);
  });
}

/* ==========================================================================
   Cesta de Compra (Cart / Bag Drawer)
   ========================================================================== */
function addToCart(bookId) {
  const book = BOOKS_DATA.find(b => b.id === bookId);
  if (!book) return;

  const existing = AppState.cart.find(item => item.id === bookId);
  if (existing) {
    existing.qty += 1;
  } else {
    AppState.cart.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  openCart();
  showToast(`«${book.title}» añadido a la cesta`);
}

function updateCartQty(bookId, delta) {
  const item = AppState.cart.find(i => i.id === bookId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart = AppState.cart.filter(i => i.id !== bookId);
  }

  saveCart();
  updateCartUI();
}

function removeCartItem(bookId) {
  AppState.cart = AppState.cart.filter(i => i.id !== bookId);
  saveCart();
  updateCartUI();
  showToast('Título eliminado de la cesta');
}

function saveCart() {
  localStorage.setItem('vortice-cart', JSON.stringify(AppState.cart));
}

function updateCartUI() {
  const countBadge = document.getElementById('cart-badge');
  const countHeader = document.getElementById('cart-items-count');
  const listContainer = document.getElementById('cart-items-list');
  const subtotalDisplay = document.getElementById('cart-subtotal-val');
  const totalDisplay = document.getElementById('cart-total-val');

  const totalItems = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (countBadge) {
    countBadge.textContent = totalItems;
    countBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  if (countHeader) {
    countHeader.textContent = `(${totalItems})`;
  }

  if (subtotalDisplay) subtotalDisplay.textContent = `${subtotal.toFixed(2)} €`;
  if (totalDisplay) totalDisplay.textContent = `${subtotal.toFixed(2)} €`;

  if (!listContainer) return;

  if (AppState.cart.length === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto; opacity: 0.5;">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
        <p>Tu cesta de libros está vacía.</p>
        <button class="btn-secondary" style="margin-top: 1.5rem;" onclick="closeCart()">Explorar Catálogo</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = AppState.cart.map(item => {
    const book = BOOKS_DATA.find(b => b.id === item.id) || {};
    const thumbSvg = BookCoverRenderer.renderSVG(book, { width: 60, height: 90, isThumbnail: true });

    return `
      <div class="cart-item">
        <div class="cart-item-thumb">
          ${thumbSvg}
        </div>
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <p>${item.author}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
            <span class="qty-count">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price-col">
          <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} €</div>
          <button class="cart-item-remove" onclick="removeCartItem('${item.id}')">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop && !document.getElementById('book-detail-drawer')?.classList.contains('active')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function checkout() {
  if (AppState.cart.length === 0) {
    showToast('Tu cesta está vacía');
    return;
  }
  showToast('Iniciando pasarela de pago segura...');
  setTimeout(() => {
    alert('Simulación de Pedido Vórtice: Gracias por apoyar la edición independiente de libros.');
    AppState.cart = [];
    saveCart();
    updateCartUI();
    closeCart();
  }, 1000);
}

/* ==========================================================================
   Lista de Deseos / Guardados (Wishlist)
   ========================================================================== */
function toggleWishlist(bookId) {
  const index = AppState.wishlist.indexOf(bookId);
  const book = BOOKS_DATA.find(b => b.id === bookId);

  if (index > -1) {
    AppState.wishlist.splice(index, 1);
    showToast(`Eliminado de tu lista: «${book?.title}»`);
  } else {
    AppState.wishlist.push(bookId);
    showToast(`Guardado en tu lista: «${book?.title}»`);
  }

  localStorage.setItem('vortice-wishlist', JSON.stringify(AppState.wishlist));
  updateWishlistUI();
  renderCatalog();
}

function updateWishlistUI() {
  const badge = document.getElementById('wishlist-badge');
  if (badge) {
    badge.textContent = AppState.wishlist.length;
    badge.style.display = AppState.wishlist.length > 0 ? 'flex' : 'none';
  }
}

/* ==========================================================================
   Búsqueda Instantánea
   ========================================================================== */
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-modal-input');
  if (modal) modal.classList.add('active');
  if (input) {
    input.focus();
    input.value = '';
    renderSearchResults('');
  }
  document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleSearchModalInput(val) {
  renderSearchResults(val);
}

function renderSearchResults(val) {
  const container = document.getElementById('search-modal-results');
  if (!container) return;

  const q = val.toLowerCase().trim();
  if (!q) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2rem 0;">
        Escribe un título, autor, colección o ISBN para buscar en el catálogo.
      </p>
    `;
    return;
  }

  const results = BOOKS_DATA.filter(b => 
    b.title.toLowerCase().includes(q) || 
    b.author.toLowerCase().includes(q) || 
    b.collection.toLowerCase().includes(q) ||
    b.isbn.toLowerCase().includes(q)
  );

  if (results.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No se encontraron resultados para «${val}»</p>`;
    return;
  }

  container.innerHTML = results.map(book => {
    const thumbSvg = BookCoverRenderer.renderSVG(book, { width: 36, height: 54, isThumbnail: true });
    return `
      <div class="search-result-row" onclick="closeSearchModal(); openBookDetail('${book.id}')">
        <div style="width: 36px; height: 54px; flex-shrink: 0; border: 1px solid var(--border-color);">${thumbSvg}</div>
        <div class="search-result-info">
          <h4>${book.title}</h4>
          <p>${book.author} · ${book.collection} · ${book.price.toFixed(2)} €</p>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Relojes Internacionales Pentagram (Timezone Clocks)
   ========================================================================== */
function startInternationalClocks() {
  function updateClocks() {
    const now = new Date();

    const cities = [
      { id: 'clock-madrid', zone: 'Europe/Madrid' },
      { id: 'clock-basilea', zone: 'Europe/Zurich' },
      { id: 'clock-cdmx', zone: 'America/Mexico_City' },
      { id: 'clock-tokio', zone: 'Asia/Tokyo' }
    ];

    cities.forEach(c => {
      const el = document.getElementById(c.id);
      if (el) {
        try {
          const timeStr = now.toLocaleTimeString('es-ES', { timeZone: c.zone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          el.textContent = timeStr;
        } catch (e) {
          el.textContent = '--:--:--';
        }
      }
    });
  }

  updateClocks();
  setInterval(updateClocks, 1000);
}

/* ==========================================================================
   Notificaciones Toast
   ========================================================================== */
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   Event Listeners e Inicialización
   ========================================================================== */
function initEventListeners() {
  // Input de búsqueda en la barra de catálogo
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value;
      renderCatalog();
    });
  }

  // Ordenación
  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.sortBy = e.target.value;
      renderCatalog();
    });
  }

  // Cerrar cajones con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBookDetail();
      closeCart();
      closeReader();
      closeSearchModal();
    }
    // Atajo CMD+K o CTRL+K para búsqueda
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
  });

  // Newsletter submit
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('Suscripción confirmada al Boletín Editorial Vórtice');
        input.value = '';
      }
    });
  }
}

/* ==========================================================================
   Menú Móvil
   ========================================================================== */
function toggleMobileMenu() {
  const panel = document.getElementById('mobile-nav-panel');
  const btn = document.getElementById('btn-mobile-menu');
  if (!panel) return;

  const isOpen = panel.classList.toggle('active');
  panel.setAttribute('aria-hidden', !isOpen);

  if (btn) {
    btn.setAttribute('aria-expanded', isOpen);
    btn.innerHTML = isOpen ? `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ` : `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
  }
}

function closeMobileMenu() {
  const panel = document.getElementById('mobile-nav-panel');
  const btn = document.getElementById('btn-mobile-menu');
  if (panel && panel.classList.contains('active')) {
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
    }
  }
}
