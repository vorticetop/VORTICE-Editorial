-- ============================================================================
-- EDITORIAL VÓRTICE — Esquema Relacional de Base de Datos PostgreSQL (Supabase)
-- ============================================================================
-- Este script crea las tablas, índices, políticas de seguridad (RLS) y datos iniciales.
-- Copia y pega este contenido en el 'SQL Editor' de tu proyecto en https://supabase.com

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE COLECCIONES EDITORIALES
CREATE TABLE IF NOT EXISTS public.collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA GENERAL DE LIBROS
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    author TEXT NOT NULL,
    collection_id TEXT REFERENCES public.collections(id) ON DELETE SET NULL,
    collection TEXT NOT NULL,
    number TEXT,
    year INTEGER DEFAULT 2026,
    price NUMERIC(10,2) NOT NULL DEFAULT 24.00,
    badge TEXT,
    featured BOOLEAN DEFAULT false,
    isbn TEXT,
    pages INTEGER,
    dimensions TEXT DEFAULT '145 x 220 mm',
    binding TEXT DEFAULT 'Tapa dura',
    paper TEXT DEFAULT 'Papel ecológico libre de cloro',
    typography TEXT DEFAULT 'Space Grotesk & Newsreader',
    translator TEXT DEFAULT 'Original en castellano',
    synopsis TEXT,
    quote TEXT,
    curatorial_note TEXT,
    cover_image TEXT,
    cover_style JSONB DEFAULT '{"bg": "#0D0D0D", "text": "#FFFFFF", "accent": "#FF3300", "theme": "geometric-lines"}'::jsonb,
    sample_chapter JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_books_collection ON public.books(collection_id);
CREATE INDEX IF NOT EXISTS idx_books_featured ON public.books(featured);
CREATE INDEX IF NOT EXISTS idx_books_year ON public.books(year DESC);

-- 4. TABLA DE PEDIDOS Y EXPEDICIONES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_ref TEXT UNIQUE NOT NULL,
    paypal_transaction_id TEXT,
    date TEXT,
    payer_name TEXT NOT NULL,
    payer_email TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    shipping NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Completado',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 5. TABLA DE CONFIGURACIÓN Y AJUSTES DE TIENDA
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'vortice-main',
    paypal_client_id TEXT DEFAULT 'test',
    shipping_standard NUMERIC(10,2) DEFAULT 3.50,
    shipping_free_threshold NUMERIC(10,2) DEFAULT 40.00,
    company_name TEXT DEFAULT 'Editorial Vórtice S.L.',
    company_nif TEXT DEFAULT 'B-84920194',
    company_address TEXT DEFAULT 'Calle Conde de Romanones 14, 28012 Madrid',
    company_email TEXT DEFAULT 'administracion@vortice-editorial.es',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública para el catálogo, colecciones y ajustes de tienda
CREATE POLICY "Lectura pública de colecciones" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Lectura pública de libros" ON public.books FOR SELECT USING (true);
CREATE POLICY "Lectura pública de ajustes" ON public.store_settings FOR SELECT USING (true);

-- Inserción y actualización para usuarios con anon key (o autenticados)
CREATE POLICY "Gestión completa de colecciones" ON public.collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión completa de libros" ON public.books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión completa de pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestión completa de ajustes" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- DATOS SEMILLA INICIALES (SEED DATA)
-- ============================================================================

-- Colecciones
INSERT INTO public.collections (id, name, code, description) VALUES
('all', 'Catálogo Completo', 'COL-00', 'Todas las publicaciones de Editorial Vórtice.'),
('cultura', 'Cultura', 'COL-01', 'Ensayos sobre estética, pensamiento político y fenomenología contemporánea.'),
('poesia', 'Poesía', 'COL-02', 'Morfología espacial, historia del diseño tipográfico y teoría constructiva.'),
('arte', 'Arte', 'COL-03', 'Narrativa de vanguardia, atmósferas liminares y experimentación formal.'),
('moda', 'Moda', 'COL-04', 'Voces poéticas radicales, apropiaciones textuales y sonoridades mínimas.'),
('tendencias', 'Tendencias', 'COL-05', 'Cultura visual, crítica de la imagen técnica y nuevos medios sintéticos.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, description = EXCLUDED.description;

-- Ajustes de tienda por defecto
INSERT INTO public.store_settings (id, paypal_client_id, shipping_standard, shipping_free_threshold, company_name, company_nif, company_address, company_email)
VALUES ('vortice-main', 'test', 3.50, 40.00, 'Editorial Vórtice S.L.', 'B-84920194', 'Calle Conde de Romanones 14, 28012 Madrid', 'administracion@vortice-editorial.es')
ON CONFLICT (id) DO NOTHING;

-- Libros del Catálogo Oficial
INSERT INTO public.books (
    id, title, subtitle, author, collection_id, collection, number, year, price, badge, featured,
    isbn, pages, dimensions, binding, paper, typography, translator, synopsis, quote, curatorial_note,
    cover_image, cover_style, sample_chapter
) VALUES
(
    'vortice-01',
    'ALBZ',
    'Acústica de la memoria y arquitectura del vacío urbano',
    'Elisabet F. Gutierrez',
    'poesia',
    'Poesía',
    'VÉRTICE 14',
    2026,
    24.00,
    'Novedad',
    true,
    '978-84-128941-0-2',
    312,
    '145 x 220 mm',
    'Tapa dura',
    'Papel Mate 80 g/m² libre de cloro',
    'Alegreya',
    'Original en castellano',
    'Un ensayo riguroso y poético sobre las zonas mudas de las metrópolis modernas. A través del análisis del urbanismo contemporáneo, Valdés desentraña cómo el ruido constante ha privatizado la atención colectiva y cómo los espacios de silencio se han convertido en el bien más codiciado y disputado del siglo XXI.',
    '«Y mi corazón,un cazador solitario,se tornó duro como las rocas, para así hacerle Propietario de su muro»',
    'Seleccionado como libro del mes por el Instituto de Crítica Urbana de Basilea. Una obra fundamental para entender la relación entre escucha, arquitectura cívica y disidencia.',
    'img/Cover1.jpg',
    '{"bg": "#0D0D0D", "text": "#FFFFFF", "accent": "#000000ff", "theme": "geometric-lines", "label": "VÉRTICE · 14"}'::jsonb,
    '{"chapterTitle": "Capítulo I: El umbral de las tres frecuencias", "content": ["A las 04:17 de una noche de noviembre en la dársena norte, el rumor de los transformadores eléctricos desciende a una vibración apenas perceptible de 43 hercios.", "Nos hemos habituado a concebir el espacio público como una composición estrictamente visual.", "Cuando una comunidad pierde el control sobre su paisaje sonoro, no solo experimenta una degradación sensorial; pierde la facultad de distinguir la voz propia de la consigna ajena."]}'::jsonb
),
(
    'vortice-02',
    'Arquitectura de lo Efímero',
    'Morfología de los pabellones provisionales y la ruina instantánea',
    'Marcus V. Holst',
    'cultura',
    'Cultura',
    'ESTRUCTURAS 07',
    2026,
    32.00,
    'Esencial',
    false,
    '978-84-128941-1-9',
    420,
    '170 x 240 mm',
    'Rústica cosida con sobrecubierta',
    'Fedrigoni Arena White Smooth 140 g/m²',
    'Favorit Mono & GT Super',
    'Traducción de Carmen G. Aldama',
    'Holst examina la paradoja de las estructuras diseñadas con fecha de caducidad: desde los pabellones de exposiciones universales hasta las instalaciones nómadas de emergencia.',
    '«El edificio permanente pacta con la posteridad; el pabellón efímero desafía al instante presente.»',
    'Incluye 120 planos y esquemas axonométricos a dos tintas.',
    NULL,
    '{"bg": "#F2F0EB", "text": "#1A1A1A", "accent": "#0047FF", "theme": "blueprint-grid", "label": "ESTRUCTURAS · 07"}'::jsonb,
    '{"chapterTitle": "Prólogo: La belleza de lo que nace para ser desmontado", "content": ["Todo pabellón temporal contiene en su diseño el mapa exacto de su propia disolución.", "Esta finitud declarada no empobrece la experiencia espacial; al contrario, le confiere una intensidad casi dramática."]}'::jsonb
),
(
    'vortice-03',
    'Vectores de la Niebla',
    'Cartografía de una ciudad portuaria que desaparece',
    'Clara Sörensen',
    'arte',
    'Arte',
    'FICCIONES 22',
    2026,
    21.50,
    'Novedad',
    false,
    '978-84-128941-2-6',
    280,
    '130 x 205 mm',
    'Tapa dura con corte teñido',
    'Coral Book White 90 g/m²',
    'Plantin & Akzidenz-Grotesk',
    'Traducción de Jorge Bergamín',
    'En Osthafen, una ciudad del mar del Norte, una niebla densa y cargada de salitre borra cada equinoccio una manzana entera del plano municipal.',
    '«No hay mapa más exacto que aquel cuyos contornos se desdibujan al tacto.»',
    'Premio de Novela Vanguardista del Círculo Nórdico 2025.',
    NULL,
    '{"bg": "#121418", "text": "#F5F5F0", "accent": "#A3B8CC", "theme": "mist-minimal", "label": "FICCIONES · 22"}'::jsonb,
    '{"chapterTitle": "Sección I: La línea de pleamar", "content": ["El muelle dieciséis nunca amanece exactamente donde estaba la víspera.", "Los prácticos del puerto conocen la deriva de las piedras mejor que los geólogos de la academia."]}'::jsonb
),
(
    'vortice-04',
    'Tipografía y Disidencia',
    'Historia material de las publicaciones clandestinas (1933–1989)',
    'Antón Valenzuela',
    'cultura',
    'Cultura',
    'VÉRTICE 11',
    2025,
    26.00,
    'Esencial',
    false,
    '978-84-128941-3-3',
    360,
    '155 x 230 mm',
    'Rústica con solapas enteladas',
    'Munken Pure 120 g/m²',
    'Haas Unica & Sabon',
    'Original en castellano',
    'Un recorrido apasionante por las imprentas ilegales, los mimeógrafos ocultos en sótanos y los tipógrafos anónimos que arriesgaron su libertad por imprimir panfletos.',
    '«Una letra mal compuesta puede delatar al impresor; una letra bien elegida sostiene una revolución.»',
    'Incluye 80 reproducciones a tamaño real de facsímiles censurados.',
    NULL,
    '{"bg": "#EFECE6", "text": "#0F0F0F", "accent": "#FF3300", "theme": "swiss-grid-heavy", "label": "VÉRTICE · 11"}'::jsonb,
    '{"chapterTitle": "Capítulo 2: Los tipos de plomo en el fondo del río", "content": ["En abril de 1941, tres cajistas del taller municipal de Varsovia cargaron en dos carretas de verduras las cajas completas de la fundición Berthold.", "El plomo no flota, pero la tinta es indeleble."]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    author = EXCLUDED.author,
    collection_id = EXCLUDED.collection_id,
    collection = EXCLUDED.collection,
    number = EXCLUDED.number,
    year = EXCLUDED.year,
    price = EXCLUDED.price,
    badge = EXCLUDED.badge,
    featured = EXCLUDED.featured,
    isbn = EXCLUDED.isbn,
    cover_style = EXCLUDED.cover_style;
