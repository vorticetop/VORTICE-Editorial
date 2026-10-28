/* cspell:disable */
/**
 * EDITORIAL VÓRTICE — Conector de Base de Datos Cloud (Supabase / PostgreSQL)
 * Capa de abstracción para sincronización en tiempo real con PostgreSQL via REST API.
 * Funciona de forma transparente: si hay credenciales sincroniza con la nube;
 * si no las hay o falla la red, opera fluidamente con la caché local de respaldo.
 */

const VorticeDB = {
  url: localStorage.getItem('vortice-supabase-url') || '',
  anonKey: localStorage.getItem('vortice-supabase-key') || '',
  isOnline: false,

  init() {
    this.url = localStorage.getItem('vortice-supabase-url') || '';
    this.anonKey = localStorage.getItem('vortice-supabase-key') || '';
    if (this.url && this.anonKey) {
      this.checkHealth();
    }
  },

  isConnected() {
    return Boolean(this.url && this.anonKey);
  },

  setCredentials(url, key) {
    this.url = (url || '').trim().replace(/\/+$/, '');
    this.anonKey = (key || '').trim();
    localStorage.setItem('vortice-supabase-url', this.url);
    localStorage.setItem('vortice-supabase-key', this.anonKey);
    return this.checkHealth();
  },

  clearCredentials() {
    this.url = '';
    this.anonKey = '';
    localStorage.removeItem('vortice-supabase-url');
    localStorage.removeItem('vortice-supabase-key');
    this.isOnline = false;
  },

  getHeaders(prefer = 'return=representation') {
    return {
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': prefer
    };
  },

  async checkHealth() {
    if (!this.isConnected()) {
      this.isOnline = false;
      return false;
    }
    try {
      const res = await fetch(`${this.url}/rest/v1/collections?select=count&limit=1`, {
        method: 'GET',
        headers: this.getHeaders('count=exact')
      });
      this.isOnline = res.ok;
      return res.ok;
    } catch (err) {
      this.isOnline = false;
      return false;
    }
  },

  /* ------------------------------------------------------------------------
     Operaciones de Libros (Books)
     ------------------------------------------------------------------------ */
  async getBooks() {
    if (!this.isConnected()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/books?select=*&order=year.desc`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rawBooks = await res.json();

      // Normalizar campos de camelCase / snake_case
      return rawBooks.map(b => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || '',
        author: b.author,
        collectionId: b.collection_id || b.collectionId || 'cultura',
        collection: b.collection || 'Cultura',
        number: b.number || '',
        year: b.year || 2026,
        price: parseFloat(b.price) || 24.00,
        badge: b.badge || '',
        featured: Boolean(b.featured),
        isbn: b.isbn || '',
        pages: b.pages || 280,
        dimensions: b.dimensions || '145 x 220 mm',
        binding: b.binding || 'Tapa dura',
        paper: b.paper || 'Papel ecológico',
        typography: b.typography || 'Space Grotesk',
        translator: b.translator || 'Original en castellano',
        synopsis: b.synopsis || '',
        quote: b.quote || '',
        curatorialNote: b.curatorial_note || b.curatorialNote || '',
        coverImage: b.cover_image || b.coverImage || null,
        coverStyle: b.cover_style || b.coverStyle || {
          bg: '#0D0D0D', text: '#FFFFFF', accent: '#FF3300', theme: 'geometric-lines'
        },
        sampleChapter: b.sample_chapter || b.sampleChapter || null
      }));
    } catch (err) {
      console.warn('VorticeDB: Error consultando libros de Supabase, usando respaldo local', err);
      return null;
    }
  },

  async saveBook(book) {
    if (!this.isConnected()) return false;
    try {
      const payload = {
        id: book.id,
        title: book.title,
        subtitle: book.subtitle || null,
        author: book.author,
        collection_id: book.collectionId || 'cultura',
        collection: book.collection || 'Cultura',
        number: book.number || null,
        year: parseInt(book.year) || 2026,
        price: parseFloat(book.price) || 24.00,
        badge: book.badge || null,
        featured: Boolean(book.featured),
        isbn: book.isbn || null,
        pages: parseInt(book.pages) || null,
        dimensions: book.dimensions || null,
        binding: book.binding || null,
        paper: book.paper || null,
        typography: book.typography || null,
        translator: book.translator || null,
        synopsis: book.synopsis || null,
        quote: book.quote || null,
        curatorial_note: book.curatorialNote || null,
        cover_image: book.coverImage || null,
        cover_style: book.coverStyle || null,
        sample_chapter: book.sampleChapter || null,
        updated_at: new Date().toISOString()
      };

      const res = await fetch(`${this.url}/rest/v1/books`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error('VorticeDB: Error guardando libro en Supabase', err);
      return false;
    }
  },

  async deleteBook(bookId) {
    if (!this.isConnected()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/books?id=eq.${encodeURIComponent(bookId)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch (err) {
      console.error('VorticeDB: Error eliminando libro en Supabase', err);
      return false;
    }
  },

  /* ------------------------------------------------------------------------
     Operaciones de Pedidos (Orders)
     ------------------------------------------------------------------------ */
  async getOrders() {
    if (!this.isConnected()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/orders?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rawOrders = await res.json();

      return rawOrders.map(o => ({
        id: o.id,
        orderRef: o.order_ref,
        paypalTransactionId: o.paypal_transaction_id || 'N/A',
        date: o.date,
        payerName: o.payer_name,
        payerEmail: o.payer_email,
        items: o.items || [],
        subtotal: parseFloat(o.subtotal) || 0,
        shipping: parseFloat(o.shipping) || 0,
        total: parseFloat(o.total) || 0,
        status: o.status || 'Completado'
      }));
    } catch (err) {
      console.warn('VorticeDB: Error consultando pedidos de Supabase, usando respaldo local', err);
      return null;
    }
  },

  async saveOrder(order) {
    if (!this.isConnected()) return false;
    try {
      const payload = {
        order_ref: order.orderRef,
        paypal_transaction_id: order.paypalTransactionId || null,
        date: order.date,
        payer_name: order.payerName,
        payer_email: order.payerEmail,
        items: order.items || [],
        subtotal: parseFloat(order.subtotal) || 0,
        shipping: parseFloat(order.shipping) || 0,
        total: parseFloat(order.total) || 0,
        status: order.status || 'Completado'
      };

      const res = await fetch(`${this.url}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error('VorticeDB: Error guardando pedido en Supabase', err);
      return false;
    }
  },

  async updateOrderStatus(orderRef, status) {
    if (!this.isConnected()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/orders?order_ref=eq.${encodeURIComponent(orderRef)}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (err) {
      console.error('VorticeDB: Error actualizando estado de pedido', err);
      return false;
    }
  },

  async deleteOrder(orderRef) {
    if (!this.isConnected()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/orders?order_ref=eq.${encodeURIComponent(orderRef)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch (err) {
      console.error('VorticeDB: Error eliminando pedido en Supabase', err);
      return false;
    }
  },

  /* ------------------------------------------------------------------------
     Operaciones de Colecciones (Collections)
     ------------------------------------------------------------------------ */
  async getCollections() {
    if (!this.isConnected()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/collections?select=*&order=code.asc`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('VorticeDB: Error consultando colecciones de Supabase', err);
      return null;
    }
  },

  async saveCollection(col) {
    if (!this.isConnected()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/collections`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify({
          id: col.id,
          name: col.name,
          code: col.code || null,
          description: col.description || null
        })
      });
      return res.ok;
    } catch (err) {
      console.error('VorticeDB: Error guardando colección en Supabase', err);
      return false;
    }
  },

  /* ------------------------------------------------------------------------
     Migración en Lote (Upload Local Data to Supabase)
     ------------------------------------------------------------------------ */
  async migrateLocalData(books, collections, orders, settings) {
    if (!this.isConnected()) throw new Error('No hay conexión configurada con Supabase.');

    // 1. Colecciones
    for (const col of collections) {
      await this.saveCollection(col);
    }

    // 2. Libros
    for (const b of books) {
      await this.saveBook(b);
    }

    // 3. Pedidos
    for (const o of orders) {
      await this.saveOrder(o);
    }

    return true;
  }
};

// Inicializar al cargar el script
VorticeDB.init();
