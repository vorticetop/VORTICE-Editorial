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
  PayPalService.init();
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
  const shippingDisplay = document.getElementById('cart-shipping-val');
  const totalDisplay = document.getElementById('cart-total-val');
  const fallbackTotalDisplay = document.getElementById('cart-fallback-total');
  const shippingNote = document.getElementById('cart-shipping-note');
  const shippingFill = document.getElementById('shipping-bar-fill');
  const checkoutMethods = document.querySelector('.checkout-methods-wrapper');

  const totalItems = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const freeShippingThreshold = 40.00;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = (subtotal === 0 || isFreeShipping) ? 0 : 3.50;
  const grandTotal = subtotal + shippingCost;

  if (countBadge) {
    countBadge.textContent = totalItems;
    countBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  if (countHeader) {
    countHeader.textContent = `(${totalItems})`;
  }

  if (subtotalDisplay) subtotalDisplay.textContent = `${subtotal.toFixed(2)} €`;
  if (shippingDisplay) {
    shippingDisplay.textContent = subtotal === 0 ? '0.00 €' : (isFreeShipping ? 'Gratis' : `${shippingCost.toFixed(2)} €`);
    shippingDisplay.style.color = isFreeShipping && subtotal > 0 ? 'var(--accent-emerald)' : 'inherit';
  }
  if (totalDisplay) totalDisplay.textContent = `${grandTotal.toFixed(2)} €`;
  if (fallbackTotalDisplay) fallbackTotalDisplay.textContent = `${grandTotal.toFixed(2)} €`;

  // Barra de progreso hacia el envío gratuito
  if (shippingFill) {
    const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
    shippingFill.style.width = `${progress}%`;
  }

  if (shippingNote) {
    if (subtotal === 0) {
      shippingNote.textContent = 'Envío gratuito a España peninsular a partir de 40.00 €';
    } else if (isFreeShipping) {
      shippingNote.innerHTML = '<strong>¡Envío gratuito conseguido!</strong> Sin gastos adicionales de transporte.';
    } else {
      const remaining = (freeShippingThreshold - subtotal).toFixed(2);
      shippingNote.innerHTML = `Añade <strong>${remaining} €</strong> más para conseguir <strong>Envío Gratuito</strong>.`;
    }
  }

  if (checkoutMethods) {
    checkoutMethods.style.display = totalItems > 0 ? 'flex' : 'none';
  }

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
            <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)" aria-label="Disminuir">-</button>
            <span class="qty-count">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)" aria-label="Aumentar">+</button>
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

  // Si PayPal no se había renderizado aún y hay artículos, intentar renderizar
  if (window.paypal && window.paypal.Buttons && !PayPalService.isRendered) {
    PayPalService.renderButtons();
  }
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

/* ==========================================================================
   Pasarela Oficial de Pago: PayPal Buttons SDK & Checkout
   ========================================================================== */

const PayPalService = {
  clientId: localStorage.getItem('vortice-paypal-client-id') || 'test',
  isRendered: false,

  init() {
    this.updateConfigLabel();
    this.mountButtonsWhenReady();
  },

  updateConfigLabel() {
    const label = document.getElementById('paypal-client-label');
    if (!label) return;
    if (this.clientId === 'test') {
      label.textContent = 'PayPal Sandbox (test)';
    } else {
      label.textContent = `PayPal Configurado (${this.clientId.substring(0, 7)}...)`;
    }
    const input = document.getElementById('paypal-client-id-input');
    if (input) input.value = this.clientId;
  },

  mountButtonsWhenReady() {
    if (window.paypal && window.paypal.Buttons) {
      this.renderButtons();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.paypal && window.paypal.Buttons) {
          clearInterval(interval);
          this.renderButtons();
        } else if (attempts > 10) {
          clearInterval(interval);
          this.showFallback();
        }
      }, 400);
    }
  },

  renderButtons() {
    const container = document.getElementById('paypal-button-container');
    const fallback = document.getElementById('paypal-fallback-container');
    if (!container) return;

    // Limpiar contenedor para evitar duplicados en re-render
    container.innerHTML = '';

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'black',
          shape: 'rect',
          label: 'paypal',
          height: 44
        },
        createOrder: (data, actions) => {
          if (AppState.cart.length === 0) {
            showToast('Tu cesta está vacía');
            return actions.reject();
          }

          const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
          const shipping = subtotal >= 40 ? 0 : 3.50;
          const total = subtotal + shipping;

          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              reference_id: 'VOR-' + Date.now(),
              description: 'Pedido Editorial Vórtice',
              amount: {
                currency_code: 'EUR',
                value: total.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: 'EUR',
                    value: subtotal.toFixed(2)
                  },
                  shipping: {
                    currency_code: 'EUR',
                    value: shipping.toFixed(2)
                  }
                }
              },
              items: AppState.cart.map(item => ({
                name: (item.title || 'Libro Vórtice').substring(0, 120),
                unit_amount: {
                  currency_code: 'EUR',
                  value: Number(item.price).toFixed(2)
                },
                quantity: String(item.qty),
                category: 'PHYSICAL_GOODS'
              }))
            }],
            application_context: {
              brand_name: 'EDITORIAL VÓRTICE',
              shipping_preference: 'GET_FROM_FILE',
              user_action: 'PAY_NOW'
            }
          });
        },
        onApprove: (data, actions) => {
          showToast('Verificando y capturando orden con PayPal...');
          return actions.order.capture().then((orderData) => {
            handleOrderSuccess(orderData);
          }).catch(err => {
            console.error('Error al capturar orden PayPal:', err);
            showToast('Error al capturar el cobro en PayPal');
          });
        },
        onCancel: () => {
          showToast('Pago cancelado en PayPal.');
        },
        onError: (err) => {
          console.error('Error en PayPal Buttons SDK:', err);
          this.showFallback('Error de conexión con la pasarela de PayPal.');
        }
      }).render('#paypal-button-container');

      this.isRendered = true;
      if (fallback) fallback.style.display = 'none';
    } catch (e) {
      console.warn('Excepción al renderizar PayPal Buttons:', e);
      this.showFallback();
    }
  },

  showFallback(msg) {
    const fallback = document.getElementById('paypal-fallback-container');
    if (fallback) fallback.style.display = 'block';
    if (msg) showToast(msg);
  },

  reloadSDKWithClientId(newClientId) {
    this.clientId = newClientId.trim() || 'test';
    localStorage.setItem('vortice-paypal-client-id', this.clientId);
    this.updateConfigLabel();
    this.isRendered = false;

    const oldScript = document.getElementById('paypal-sdk-script');
    if (oldScript) oldScript.remove();

    showToast('Actualizando pasarela de PayPal...');

    const newScript = document.createElement('script');
    newScript.id = 'paypal-sdk-script';
    newScript.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(this.clientId)}&currency=EUR&locale=es_ES&components=buttons`;
    newScript.async = true;
    newScript.onload = () => {
      this.renderButtons();
      showToast('Pasarela PayPal actualizada con éxito');
    };
    newScript.onerror = () => {
      showToast('No se pudo inicializar con ese Client ID. Verifica que sea correcto.');
      this.showFallback();
    };
    document.head.appendChild(newScript);
  }
};

/* ==========================================================================
   Checkout Alternativo / Simulado & Confirmación de Pedidos
   ========================================================================== */

function checkout() {
  if (AppState.cart.length === 0) {
    showToast('Tu cesta está vacía');
    return;
  }
  // Si la pasarela oficial está cargada, enfocarla
  const paypalContainer = document.getElementById('paypal-button-container');
  if (paypalContainer && paypalContainer.children.length > 0) {
    paypalContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('Completa el pago seleccionando tu opción de PayPal o Tarjeta');
  } else {
    simulateCheckout();
  }
}

function simulateCheckout() {
  if (AppState.cart.length === 0) {
    showToast('Tu cesta está vacía');
    return;
  }

  showToast('Iniciando cobro seguro con pasarela...');
  setTimeout(() => {
    const mockOrderData = {
      id: 'PAYPAL-TEST-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: 'COMPLETED',
      payer: {
        name: { given_name: 'Lector', surname: 'Vórtice' },
        email_address: 'lector@vortice-editorial.es'
      }
    };
    handleOrderSuccess(mockOrderData);
  }, 900);
}

function handleOrderSuccess(orderData) {
  const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 40 ? 0 : 3.50;
  const grandTotal = subtotal + shipping;

  const orderRecord = {
    orderRef: 'VOR-2026-' + Math.floor(100000 + Math.random() * 900000),
    paypalTransactionId: orderData.id || 'N/A',
    date: new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    payerName: orderData.payer?.name?.given_name
      ? `${orderData.payer.name.given_name} ${orderData.payer.name.surname || ''}`.trim()
      : 'Lector Vórtice',
    payerEmail: orderData.payer?.email_address || 'lector@vortice.es',
    items: JSON.parse(JSON.stringify(AppState.cart)),
    subtotal: subtotal,
    shipping: shipping,
    total: grandTotal
  };

  // Guardar en almacenamiento de pedidos
  const history = JSON.parse(localStorage.getItem('vortice-orders') || '[]');
  history.unshift(orderRecord);
  localStorage.setItem('vortice-orders', JSON.stringify(history));

  // Vaciar cesta y actualizar UI
  AppState.cart = [];
  saveCart();
  updateCartUI();
  closeCart();

  // Mostrar modal de confirmación con el justificante
  renderOrderReceipt(orderRecord);
  openOrderModal();
  showToast('¡Pago procesado con éxito! Pedido confirmado.');
}

function renderOrderReceipt(order) {
  const body = document.getElementById('order-modal-body');
  if (!body) return;

  body.innerHTML = `
    <div class="order-meta-grid">
      <div class="order-meta-col">
        <span class="order-meta-label">Nº de Pedido</span>
        <span class="order-meta-value">${order.orderRef}</span>
      </div>
      <div class="order-meta-col">
        <span class="order-meta-label">ID Transacción PayPal</span>
        <span class="order-meta-value">${order.paypalTransactionId}</span>
      </div>
      <div class="order-meta-col">
        <span class="order-meta-label">Fecha y Hora</span>
        <span class="order-meta-value">${order.date}</span>
      </div>
      <div class="order-meta-col">
        <span class="order-meta-label">Comprador</span>
        <span class="order-meta-value">${order.payerName}</span>
      </div>
    </div>

    <table class="order-items-table">
      <thead>
        <tr>
          <th>Ejemplar</th>
          <th class="text-right">Cant.</th>
          <th class="text-right">Precio Unit.</th>
          <th class="text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>
              <strong>${item.title}</strong><br>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${item.author || ''}</span>
            </td>
            <td class="text-right">${item.qty}</td>
            <td class="text-right">${item.price.toFixed(2)} €</td>
            <td class="text-right">${(item.price * item.qty).toFixed(2)} €</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="order-summary-box">
      <div class="order-summary-line">
        <span>Base Imponible / Subtotal:</span>
        <span>${order.subtotal.toFixed(2)} €</span>
      </div>
      <div class="order-summary-line">
        <span>Gastos de Envío:</span>
        <span>${order.shipping === 0 ? 'Gratis (Promoción +40€)' : `${order.shipping.toFixed(2)} €`}</span>
      </div>
      <div class="order-summary-line order-summary-total">
        <span>Total Abonado (EUR):</span>
        <span>${order.total.toFixed(2)} €</span>
      </div>
    </div>

    <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-top: 1rem;">
      * Se ha remitido el justificante electrónico a <strong>${order.payerEmail}</strong>. El paquete se preparará con encuadernación artesanal y entrega estimada en 48-72h.
    </p>
  `;
}

function openOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openPayPalConfigModal() {
  const modal = document.getElementById('paypal-config-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('paypal-client-id-input');
    if (input) input.value = PayPalService.clientId;
  }
}

function closePayPalConfigModal() {
  const modal = document.getElementById('paypal-config-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setPayPalPreset(preset) {
  const input = document.getElementById('paypal-client-id-input');
  if (input) input.value = preset;
}

function savePayPalSettings() {
  const input = document.getElementById('paypal-client-id-input');
  const newId = input ? input.value.trim() : '';
  if (!newId) {
    showToast('Por favor introduce un Client ID válido');
    return;
  }
  PayPalService.reloadSDKWithClientId(newId);
  closePayPalConfigModal();
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
      closeOrderModal();
      closePayPalConfigModal();
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
