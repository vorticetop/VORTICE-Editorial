# Editorial Vórtice

Catálogo General de Libros y Ediciones Críticas. Sello independiente de ensayo contemporáneo, filosofía crítica, narrativa de vanguardia, arquitectura y poesía visual.

## Estructura del Proyecto

```
vortice/
├── css/
│   ├── styles.css       # Estilos y diseño suizo contemporáneo
│   └── admin.css        # Estilos de la consola de administración
├── js/
│   ├── admin.js         # Lógica del panel de administración y pedidos
│   ├── app.js           # Lógica principal de la aplicación y filtros
│   ├── books.js         # Base de datos y sincronización reactiva
│   ├── covers.js        # Generador dinámico de portadas vectoriales
│   └── supabase.js      # Conector cliente de base de datos Supabase / PostgreSQL
├── sql/
│   └── schema.sql       # Esquema DDL, políticas RLS y seed inicial de PostgreSQL
├── admin.html           # Consola de administración editorial
├── index.html           # Página principal y catálogo
├── .gitignore           # Archivos ignorados por git
└── README.md            # Documentación del proyecto
```

## Base de Datos (Supabase / PostgreSQL)

Editorial Vórtice cuenta con arquitectura híbrida **PostgreSQL en la nube (Supabase)** + **Caché local reactiva (LocalStorage)**:

1. **Esquema Relacional:** Ubicado en [sql/schema.sql](sql/schema.sql) con las tablas `collections`, `books`, `orders` y `store_settings`, índices optimizados, políticas de seguridad RLS y datos iniciales completos.
2. **Conexión en 3 pasos:**
   - Crea un proyecto en [supabase.com](https://supabase.com).
   - En el **SQL Editor** de Supabase, pega el contenido de [sql/schema.sql](sql/schema.sql) y pulsa **Run**.
   - En la consola [admin.html](admin.html) (Pestaña *Ajustes*), introduce tu **Project URL** y **Anon Key**, y pulsa **Probar Conexión & Guardar**.
3. **Modo Offline / Fallback:** Si no se configuran credenciales o la red falla, el sistema opera automáticamente con la base de datos local sin interrumpir el funcionamiento ni de la tienda ni de la consola.

## Consola de Administración Editorial

- **Acceso:** [admin.html](admin.html) o atajo `Ctrl + Shift + A` desde cualquier página.
- **Credenciales por defecto:** `vortice2026` o `admin` (incluye botón de acceso demo 1-click).
- **Funcionalidades:**
  - Panel General con KPIs en tiempo real (Facturación, Pedidos, Catálogo, Ticket Medio).
  - CRUD Completo de Libros con Taller de Portadas vectoriales en vivo.
  - Gestión de Pedidos, estados de expedición e impresión de albaranes oficiales.
  - Gestión de Colecciones editoriales.
  - Sincronización y migración a Supabase PostgreSQL con 1 clic.
  - Ajustes de pasarela PayPal, costes de envío y datos fiscales.
  - Copias de seguridad e importación/exportación en JSON.

## Tecnologías

- HTML5 semántico
- CSS3 (Vanilla CSS con variables, diseño suizo, tipografía y responsive design)
- JavaScript ES6+ (Modular, sin dependencias externas)
- PostgreSQL / Supabase REST API
