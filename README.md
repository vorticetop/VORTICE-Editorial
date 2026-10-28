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
│   └── covers.js        # Generador dinámico de portadas vectoriales
├── admin.html           # Consola de administración editorial
├── index.html           # Página principal y catálogo
├── .gitignore           # Archivos ignorados por git
└── README.md            # Documentación del proyecto
```

## Consola de Administración Editorial

- **Acceso:** [admin.html](admin.html) o atajo `Ctrl + Shift + A` desde cualquier página.
- **Credenciales por defecto:** `vortice2026` o `admin` (incluye botón de acceso demo 1-click).
- **Funcionalidades:**
  - Panel General con KPIs en tiempo real (Facturación, Pedidos, Catálogo, Ticket Medio).
  - CRUD Completo de Libros con Taller de Portadas vectoriales en vivo.
  - Gestión de Pedidos, estados de expedición e impresión de albaranes oficiales.
  - Gestión de Colecciones editoriales.
  - Ajustes de pasarela PayPal, costes de envío y datos fiscales.
  - Copias de seguridad e importación/exportación en JSON.

## Tecnologías

- HTML5 semántico
- CSS3 (Vanilla CSS con variables, diseño suizo, tipografía y responsive design)
- JavaScript ES6+ (Modular, sin dependencias externas)
