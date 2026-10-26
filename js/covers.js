/**
 * Generador de Portadas Vectoriales Pentagram Style para Editorial Vórtice
 * Diseñado con tipografía suiza, retículas rigurosas y abstracción geométrica.
 */

const BookCoverRenderer = {
  renderSVG(book, options = {}) {
    const { width = 440, height = 660, isThumbnail = false } = options;
    const { title, subtitle, author, number, year, isbn, coverStyle } = book;
    const { bg, text, accent, theme, label } = coverStyle;

    // Generar gráficos geométricos según el tema
    let graphicContent = '';

    switch (theme) {
      case 'geometric-lines':
        // Círculos concéntricos y cuadrícula de líneas tensas
        graphicContent = `
          <g opacity="0.85">
            <line x1="40" y1="280" x2="400" y2="280" stroke="${accent}" stroke-width="1.5" />
            <line x1="40" y1="360" x2="400" y2="360" stroke="${text}" stroke-width="0.75" stroke-dasharray="4 4" />
            <line x1="40" y1="440" x2="400" y2="440" stroke="${text}" stroke-width="0.5" />
            <circle cx="220" cy="360" r="90" fill="none" stroke="${accent}" stroke-width="2" />
            <circle cx="220" cy="360" r="140" fill="none" stroke="${text}" stroke-width="0.75" opacity="0.6" />
            <circle cx="220" cy="360" r="5" fill="${accent}" />
            <rect x="215" y="220" width="10" height="280" fill="${accent}" opacity="0.15" />
          </g>
        `;
        break;

      case 'blueprint-grid':
        // Malla milimétrica y polígonos constructivistas
        graphicContent = `
          <g opacity="0.9">
            <defs>
              <pattern id="grid-${book.id}" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${accent}" stroke-width="0.3" opacity="0.4" />
              </pattern>
            </defs>
            <rect x="40" y="240" width="360" height="220" fill="url(#grid-${book.id})" />
            <polygon points="100,430 340,430 220,260" fill="none" stroke="${text}" stroke-width="1.5" />
            <polygon points="140,430 300,430 220,310" fill="${accent}" opacity="0.15" stroke="${accent}" stroke-width="1" />
            <line x1="220" y1="230" x2="220" y2="460" stroke="${accent}" stroke-width="1" stroke-dasharray="3 3" />
            <circle cx="220" cy="260" r="4" fill="${accent}" />
          </g>
        `;
        break;

      case 'mist-minimal':
        // Capas translúcidas de niebla y vectores liminares
        graphicContent = `
          <g opacity="0.9">
            <defs>
              <linearGradient id="mist-${book.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${accent}" stop-opacity="0.4" />
                <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
                <stop offset="100%" stop-color="${accent}" stop-opacity="0.2" />
              </linearGradient>
            </defs>
            <rect x="40" y="260" width="360" height="180" fill="url(#mist-${book.id})" />
            <path d="M 40,350 Q 130,280 220,350 T 400,350" fill="none" stroke="${accent}" stroke-width="2" />
            <path d="M 40,370 Q 130,300 220,370 T 400,370" fill="none" stroke="${text}" stroke-width="0.75" opacity="0.5" />
            <circle cx="340" cy="300" r="30" fill="none" stroke="${accent}" stroke-width="1" />
            <circle cx="340" cy="300" r="2" fill="${accent}" />
          </g>
        `;
        break;

      case 'topo-contour':
        // Curvas de nivel topográficas y referencias de latitud
        graphicContent = `
          <g opacity="0.85">
            <path d="M 40,420 C 120,370 180,440 260,390 S 360,360 400,380" fill="none" stroke="${text}" stroke-width="0.75" />
            <path d="M 40,380 C 140,340 190,400 280,350 S 350,330 400,340" fill="none" stroke="${text}" stroke-width="0.75" />
            <path d="M 40,340 C 150,300 210,360 290,310 S 340,290 400,300" fill="none" stroke="${accent}" stroke-width="1.75" />
            <path d="M 40,300 C 160,260 230,320 310,270 S 330,260 400,270" fill="none" stroke="${text}" stroke-width="0.75" />
            <rect x="180" y="240" width="80" height="20" fill="${text}" />
            <text x="220" y="254" font-family="'Space Grotesk', 'Inter', monospace" font-size="9" fill="${bg}" font-weight="700" text-anchor="middle" letter-spacing="1">LAT 43°19'N</text>
          </g>
        `;
        break;

      case 'shutter-iris':
        // Diafragma óptico estilizado y escala de tiempos
        graphicContent = `
          <g opacity="0.95">
            <circle cx="220" cy="350" r="85" fill="none" stroke="${accent}" stroke-width="2" />
            <line x1="140" y1="350" x2="300" y2="350" stroke="${text}" stroke-width="0.75" />
            <line x1="220" y1="270" x2="220" y2="430" stroke="${text}" stroke-width="0.75" />
            <line x1="163" y1="293" x2="277" y2="407" stroke="${accent}" stroke-width="1.2" />
            <line x1="163" y1="407" x2="277" y2="293" stroke="${text}" stroke-width="0.75" stroke-dasharray="2 2" />
            <circle cx="220" cy="350" r="45" fill="${accent}" opacity="0.2" stroke="${accent}" stroke-width="1" />
            <circle cx="220" cy="350" r="6" fill="${accent}" />
            <text x="220" y="460" font-family="'Space Grotesk', sans-serif" font-size="10" fill="${text}" letter-spacing="3" text-anchor="middle">1/1000 SEC · OPTICAL EXP</text>
          </g>
        `;
        break;

      case 'zigzag-vectors':
        // Vectores quebrados en ángulo de 60 grados
        graphicContent = `
          <g opacity="0.9">
            <polyline points="50,260 160,320 100,380 250,440 200,480" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="square" />
            <polyline points="80,260 190,320 130,380 280,440 230,480" fill="none" stroke="${text}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6" />
            <circle cx="160" cy="320" r="5" fill="${accent}" />
            <circle cx="100" cy="380" r="5" fill="${text}" />
            <circle cx="250" cy="440" r="6" fill="${accent}" />
          </g>
        `;
        break;

      case 'concentric-circles':
        // Círculos excéntricos de astronomía herética
        graphicContent = `
          <g opacity="0.9">
            <circle cx="220" cy="360" r="120" fill="none" stroke="${text}" stroke-width="0.5" opacity="0.4" />
            <circle cx="200" cy="350" r="80" fill="none" stroke="${accent}" stroke-width="1.5" />
            <circle cx="180" cy="340" r="50" fill="none" stroke="${text}" stroke-width="1" />
            <circle cx="170" cy="335" r="25" fill="${accent}" opacity="0.25" />
            <circle cx="170" cy="335" r="4" fill="${accent}" />
            <line x1="60" y1="360" x2="380" y2="360" stroke="${accent}" stroke-width="0.75" stroke-dasharray="3 3" />
          </g>
        `;
        break;

      case 'swiss-grid-heavy':
        // Máxima pureza suiza: bloques tipográficos monumentales
        graphicContent = `
          <g opacity="0.95">
            <rect x="40" y="270" width="170" height="170" fill="${accent}" />
            <rect x="230" y="270" width="170" height="80" fill="${text}" />
            <line x1="230" y1="375" x2="400" y2="375" stroke="${text}" stroke-width="4" />
            <line x1="230" y1="400" x2="400" y2="400" stroke="${text}" stroke-width="2" />
            <line x1="230" y1="420" x2="400" y2="420" stroke="${text}" stroke-width="1" />
            <line x1="230" y1="435" x2="400" y2="435" stroke="${text}" stroke-width="0.5" />
            <text x="125" y="365" font-family="'Space Grotesk', Helvetica, Arial, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" text-anchor="middle">¶</text>
          </g>
        `;
        break;

      case 'whisper-dots':
        // Matriz de puntos y atenuación de intensidad
        graphicContent = `
          <g opacity="0.8">
            ${Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 9 }).map((_, c) => {
                const cx = 80 + c * 35;
                const cy = 270 + r * 30;
                const radius = Math.max(1, 4 - Math.abs(c - 4) * 0.7 - Math.abs(r - 2.5) * 0.8);
                const fill = (r === 2 && c === 4) ? accent : text;
                return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" opacity="${0.2 + radius * 0.2}" />`;
              }).join('')
            ).join('')}
            <line x1="40" y1="460" x2="400" y2="460" stroke="${accent}" stroke-width="1" />
          </g>
        `;
        break;

      case 'slow-monolith':
        // Rectángulo monolítico central y campo de color
        graphicContent = `
          <g opacity="0.95">
            <rect x="130" y="260" width="180" height="200" fill="${accent}" />
            <rect x="150" y="280" width="140" height="160" fill="${bg}" opacity="0.15" />
            <circle cx="220" cy="360" r="30" fill="${text}" opacity="0.9" />
            <line x1="40" y1="220" x2="400" y2="220" stroke="${text}" stroke-width="0.75" />
            <line x1="40" y1="500" x2="400" y2="500" stroke="${text}" stroke-width="0.75" />
          </g>
        `;
        break;

      case 'circuit-strata':
        // Estratos horizontales y nodos de memoria
        graphicContent = `
          <g opacity="0.85">
            <rect x="40" y="260" width="360" height="2" fill="${accent}" />
            <rect x="40" y="295" width="280" height="1.5" fill="${text}" opacity="0.6" />
            <rect x="40" y="330" width="360" height="1" fill="${accent}" />
            <rect x="120" y="365" width="280" height="2" fill="${text}" />
            <rect x="40" y="400" width="200" height="1.5" fill="${accent}" opacity="0.8" />
            <rect x="40" y="435" width="360" height="1" fill="${text}" opacity="0.4" />
            <circle cx="320" cy="295" r="4" fill="${accent}" />
            <circle cx="120" cy="365" r="4" fill="${text}" />
            <circle cx="240" cy="400" r="4" fill="${accent}" />
          </g>
        `;
        break;

      case 'polar-eclipse':
      default:
        // Eclipse polar minimalista y horizonte gélido
        graphicContent = `
          <g opacity="0.95">
            <circle cx="220" cy="340" r="75" fill="${accent}" opacity="0.3" />
            <circle cx="220" cy="340" r="70" fill="${bg}" />
            <circle cx="245" cy="325" r="60" fill="${accent}" opacity="0.9" />
            <line x1="40" y1="440" x2="400" y2="440" stroke="${text}" stroke-width="1.5" />
            <circle cx="220" cy="440" r="4" fill="${accent}" />
          </g>
        `;
        break;
    }

    // Dividir títulos largos de forma inteligente
    const words = title.split(' ');
    let titleLines = [];
    if (words.length <= 3) {
      titleLines = [title];
    } else {
      const mid = Math.ceil(words.length / 2);
      titleLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
    }

    const titleFontSize = title.length > 25 ? 26 : (title.length > 18 ? 30 : 34);
    const titleLineHeight = titleFontSize + 8;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 660" width="${width}" height="${height}" class="vortice-book-cover-svg" data-book-id="${book.id}">
        <defs>
          <!-- Textura sutil de papel editorial -->
          <filter id="paper-grain-${book.id}" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" />
            <feComposite in2="SourceGraphic" in="glare" operator="over" />
          </filter>
          
          <!-- Sombra de lomo simulada -->
          <linearGradient id="spine-shadow-${book.id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.35" />
            <stop offset="3%" stop-color="#000000" stop-opacity="0.1" />
            <stop offset="6%" stop-color="#ffffff" stop-opacity="0.1" />
            <stop offset="10%" stop-color="#000000" stop-opacity="0" />
            <stop offset="97%" stop-color="#000000" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
          </linearGradient>
        </defs>

        <!-- Fondo del libro -->
        <rect width="440" height="660" fill="${bg}" />

        <!-- Banda superior de colección Pentagram Style -->
        <g id="header-colophon">
          <line x1="40" y1="40" x2="400" y2="40" stroke="${text}" stroke-width="1" opacity="0.2" />
          
          <!-- Logo Vórtice y Número de Colección -->
          <text x="40" y="65" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="11" font-weight="700" fill="${text}" letter-spacing="2.5">VÓRTICE</text>
          <text x="400" y="65" font-family="'Space Grotesk', monospace" font-size="10" font-weight="600" fill="${accent}" letter-spacing="1.5" text-anchor="end">${label}</text>
          
          <line x1="40" y1="80" x2="400" y2="80" stroke="${text}" stroke-width="1" opacity="0.3" />
        </g>

        <!-- Bloque de Título y Autor (Parte Superior / Media) -->
        <g id="typography-block">
          <text x="40" y="115" font-family="'Space Grotesk', sans-serif" font-size="13" font-weight="600" fill="${accent}" letter-spacing="1.5" text-transform="uppercase">${author}</text>
          
          ${titleLines.map((line, idx) => `
            <text x="40" y="${155 + (idx * titleLineHeight)}" font-family="'Space Grotesk', Helvetica, Arial, sans-serif" font-size="${titleFontSize}" font-weight="800" fill="${text}" letter-spacing="-0.5">${line}</text>
          `).join('')}

          <text x="40" y="${170 + (titleLines.length * titleLineHeight)}" font-family="'Inter', serif" font-size="12" font-style="italic" fill="${text}" opacity="0.75">${subtitle}</text>
        </g>

        <!-- Gráfico Conceptual Modernista Central -->
        ${graphicContent}

        <!-- Bloque Inferior: Pie editorial, ISBN y Código de barras estilizado -->
        <g id="footer-colophon">
          <line x1="40" y1="570" x2="400" y2="570" stroke="${text}" stroke-width="1" opacity="0.3" />

          <!-- Código de barras y año de publicación -->
          <g transform="translate(40, 585)">
            <!-- Barras verticales mínimas suizas -->
            <rect x="0" y="0" width="2" height="24" fill="${text}" opacity="0.8" />
            <rect x="4" y="0" width="1" height="24" fill="${text}" opacity="0.8" />
            <rect x="7" y="0" width="3" height="24" fill="${text}" opacity="0.8" />
            <rect x="12" y="0" width="1" height="24" fill="${text}" opacity="0.8" />
            <rect x="15" y="0" width="2" height="24" fill="${text}" opacity="0.8" />
            <rect x="19" y="0" width="4" height="24" fill="${text}" opacity="0.8" />
            <rect x="25" y="0" width="1" height="24" fill="${text}" opacity="0.8" />
            <rect x="28" y="0" width="2" height="24" fill="${text}" opacity="0.8" />
            <rect x="33" y="0" width="3" height="24" fill="${text}" opacity="0.8" />
            <rect x="38" y="0" width="1" height="24" fill="${text}" opacity="0.8" />
            <rect x="42" y="0" width="2" height="24" fill="${text}" opacity="0.8" />
            <text x="0" y="34" font-family="'Space Grotesk', monospace" font-size="7.5" fill="${text}" opacity="0.7" letter-spacing="0.5">${isbn}</text>
          </g>

          <!-- Detalles editoriales -->
          <text x="400" y="598" font-family="'Space Grotesk', sans-serif" font-size="10" font-weight="700" fill="${text}" text-anchor="end" letter-spacing="1">EDITORIAL VÓRTICE · ${year}</text>
          <text x="400" y="614" font-family="'Space Grotesk', sans-serif" font-size="8.5" fill="${accent}" text-anchor="end" letter-spacing="1">EDICIÓN CRÍTICA AUTORIZADA</text>

          <line x1="40" y1="628" x2="400" y2="628" stroke="${text}" stroke-width="1" opacity="0.15" />
        </g>

        <!-- Sombra realista de lomo y corte -->
        <rect width="440" height="660" fill="url(#spine-shadow-${book.id})" pointer-events="none" />
      </svg>
    `;
  }
};
