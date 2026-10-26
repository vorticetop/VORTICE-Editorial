// Catálogo de Libros - Editorial Vórtice (Estilo Pentagram)
const BOOKS_DATA = [
  {
    id: "vortice-01",
    title: "La Geometría del Silencio",
    subtitle: "Acústica de la memoria y arquitectura del vacío urbano",
    author: "Elena Valdés",
    collection: "Filosofía Crítica",
    collectionId: "filosofia",
    number: "VÉRTICE 14",
    year: 2026,
    price: 24.00,
    badge: "Novedad",
    featured: true,
    isbn: "978-84-128941-0-2",
    coverImage: "img/Cover1.jpg",
    pages: 312,
    dimensions: "145 x 220 mm",
    binding: "Tapa dura entelada en lino negro con serigrafía blanca y cinta de registro",
    paper: "Munken Lynx 120 g/m² libre de cloro",
    typography: "Neue Haas Grotesk & Freight Text Pro",
    translator: "Original en castellano",
    synopsis: "Un ensayo riguroso y poético sobre las zonas mudas de las metrópolis modernas. A través del análisis del urbanismo contemporáneo, Valdés desentraña cómo el ruido constante ha privatizado la atención colectiva y cómo los espacios de silencio se han convertido en el bien más codiciado y disputado del siglo XXI.",
    quote: "«El silencio no es la ausencia de sonido, sino la superficie donde el pensamiento recupera su propio eco gravitatorio.»",
    curatorialNote: "Seleccionado como libro del mes por el Instituto de Crítica Urbana de Basilea. Una obra fundamental para entender la relación entre escucha, arquitectura cívica y disidencia.",
    coverStyle: {
      bg: "#0D0D0D",
      text: "#FFFFFF",
      accent: "#FF3300",
      theme: "geometric-lines",
      label: "VÉRTICE · 14"
    },
    sampleChapter: {
      chapterTitle: "Capítulo I: El umbral de las tres frecuencias",
      content: [
        "A las 04:17 de una noche de noviembre en la dársena norte, el rumor de los transformadores eléctricos desciende a una vibración apenas perceptible de 43 hercios. En ese estrecho intervalo —antes de que el primer convoy de mercancías active los sensores de la terminal férrea— la ciudad revela su esqueleto acústico.",
        "Nos hemos habituado a concebir el espacio público como una composición estrictamente visual: fachadas, pavimentos, alineaciones de arbolado y luminarias que marcan los ejes de circulación. Sin embargo, toda arquitectura es primariamente un resonador. Los muros no solo contienen cuerpos; refractan, absorben o multiplican el sonido del tránsito humano.",
        "Cuando una comunidad pierde el control sobre su paisaje sonoro, no solo experimenta una degradación sensorial; pierde la facultad de distinguir la voz propia de la consigna ajena. La polución acústica contemporánea no es un mero subproducto industrial: es una técnica de saturación que imposibilita la pausa reflexiva.",
        "En las páginas que siguen, recorreremos doce enclaves donde el silencio aún opera como un acto de resistencia calculada."
      ]
    }
  },
  {
    id: "vortice-02",
    title: "Arquitectura de lo Efímero",
    subtitle: "Morfología de los pabellones provisionales y la ruina instantánea",
    author: "Marcus V. Holst",
    collection: "Arquitectura & Ensayo",
    collectionId: "arquitectura",
    number: "ESTRUCTURAS 07",
    year: 2026,
    price: 32.00,
    badge: "Esencial",
    featured: false,
    isbn: "978-84-128941-1-9",
    pages: 420,
    dimensions: "170 x 240 mm",
    binding: "Rústica cosida con sobrecubierta desplegable en papel Kraft de 180 g",
    paper: "Fedrigoni Arena White Smooth 140 g/m²",
    typography: "Favorit Mono & GT Super",
    translator: "Traducción de Carmen G. Aldama",
    synopsis: "Holst examina la paradoja de las estructuras diseñadas con fecha de caducidad: desde los pabellones de exposiciones universales hasta las instalaciones nómadas de emergencia. ¿Cómo influye la certeza de la demolición en la osadía constructiva?",
    quote: "«El edificio permanente pacta con la posteridad; el pabellón efímero desafía al instante presente.»",
    curatorialNote: "Incluye 120 planos y esquemas axonométricos a dos tintas, además de un ensayo visual con fotografías de estructuras desaparecidas.",
    coverStyle: {
      bg: "#F2F0EB",
      text: "#1A1A1A",
      accent: "#0047FF",
      theme: "blueprint-grid",
      label: "ESTRUCTURAS · 07"
    },
    sampleChapter: {
      chapterTitle: "Prólogo: La belleza de lo que nace para ser desmontado",
      content: [
        "Todo pabellón temporal contiene en su diseño el mapa exacto de su propia disolución. A diferencia de las catedrales o los parlamentos, que erigen muros macizos con la ilusión de desafiar a los siglos, la arquitectura efímera sabe de antemano el día y la hora en que el último perno será desenroscado.",
        "Esta finitud declarada no empobrece la experiencia espacial; al contrario, le confiere una intensidad casi dramática. El visitante que recorre una estructura sabiendo que dentro de noventa días ese suelo volverá a ser un descampado percibe cada juntura, cada lámina traslúcida y cada sombra proyectada con una lucidez inusual.",
        "Examinar la historia de estos artefactos transitorios es descubrir los momentos más audaces de la experimentación tectónica. Donde no hay que garantizar cincuenta inviernos de impermeabilidad, la ligereza y la transparencia pueden alcanzar cotas poéticas."
      ]
    }
  },
  {
    id: "vortice-03",
    title: "Vectores de la Niebla",
    subtitle: "Cartografía de una ciudad portuaria que desaparece",
    author: "Clara Sörensen",
    collection: "Ficción Especulativa",
    collectionId: "ficcion",
    number: "FICCIONES 22",
    year: 2026,
    price: 21.50,
    badge: "Novedad",
    featured: false,
    isbn: "978-84-128941-2-6",
    pages: 280,
    dimensions: "130 x 205 mm",
    binding: "Tapa dura con corte teñido en grafito y estampación en golpe seco",
    paper: "Coral Book White 90 g/m²",
    typography: "Plantin & Akzidenz-Grotesk",
    translator: "Traducción de Jorge Bergamín",
    synopsis: "En Osthafen, una ciudad del mar del Norte, una niebla densa y cargada de salitre borra cada equinoccio una manzana entera del plano municipal. Cuando la bruma se retira, los edificios están intactos pero la numeración catastral ha cambiado de lugar y nadie recuerda qué familia habitaba antes el chaflán.",
    quote: "«El mapa no mentía: simplemente describía una versión de la dársena que aún no había decidido si existir o disolverse.»",
    curatorialNote: "Galardonada con el Premio Nórdico de Novela de Atmósfera. Una prosa hipnótica donde la precisión geométrica se funde con el misterio ontológico.",
    coverStyle: {
      bg: "#1E2226",
      text: "#E8ECEF",
      accent: "#00E599",
      theme: "mist-minimal",
      label: "FICCIONES · 22"
    },
    sampleChapter: {
      chapterTitle: "I. El registro de las boyas apagadas",
      content: [
        "Nadie en el muelle de San Jerónimo llamaba a la bruma por su nombre meteorológico. Se referían a ella simplemente como 'el espesor'. Llegaba sin viento, subiendo por las escalinatas de limo con el sigilo de un aceite frío derramado sobre mármol.",
        "El hidrógrafo Nils Kjellberg mantenía sobre la mesa del altillo tres cronómetros sincronizados con el observatorio de Greenwich y una regla de bronce de cuarenta centímetros. Cuando el espesor alcanzaba el dintel de la ventana, Nils trazaba una línea perpendicular sobre el plano de cuadrícula.",
        "Esa tarde, el muro este del almacén de brea no reflejó el destello del faro secundario. Nils miró por el anteojo: el edificio seguía allí, pero los tres arcos de medio punto se habían convertido en dos ventanas ojivales. Nadie en el puerto pareció advertir la mutación."
      ]
    }
  },
  {
    id: "vortice-04",
    title: "Topografía del Desasosiego",
    subtitle: "Fragmentos líricos de manuales topográficos (1910–1938)",
    author: "Andrés De La Riva",
    collection: "Poesía Contemporánea",
    collectionId: "poesia",
    number: "VERSO RADICAL 09",
    year: 2026,
    price: 18.00,
    badge: null,
    featured: false,
    isbn: "978-84-128941-3-3",
    pages: 160,
    dimensions: "120 x 190 mm",
    binding: "Cosido Singer con hilo rojo visible al lomo y cartulina verjurada de 300 g",
    paper: "Gmund Cotton Linen Cream 110 g/m²",
    typography: "Founders Grotesk & Caslon Pro",
    translator: "Original en castellano",
    synopsis: "Un libro de poemas singular construido mediante la apropiación y redistribución métrica de instrucciones de geodesia, nivelación de terrenos y medición de linderos de principios del siglo XX. La frialdad técnica se transmuta en una elegía descarnada sobre el paso del tiempo.",
    quote: "«Calcular la cota exacta de un valle es aprender cuánto dolor cabe entre dos curvas de nivel.»",
    curatorialNote: "Edición numerada de 750 ejemplares con tipografía móvil para las cubiertas.",
    coverStyle: {
      bg: "#F9F8F5",
      text: "#111111",
      accent: "#D60000",
      theme: "topo-contour",
      label: "VERSO RADICAL · 09"
    },
    sampleChapter: {
      chapterTitle: "Cuaderno de campo: Estación III",
      content: [
        "Ajustar la plomada sobre el hito de granito.",
        "Verificar que la burbuja del nivel esférico repose exactamente en el círculo central.",
        "Mirar a través del anteojo hacia el punto distante donde la colina pierde su nombre.",
        "Lo que no entra en el ángulo azimutal no es error de cálculo:",
        "es el mundo que se niega a ser parcelado por dos agrimensores cansados."
      ]
    }
  },
  {
    id: "vortice-05",
    title: "El Ojo Mecánico y el Tiempo",
    subtitle: "Velocidad visual en el cine de vanguardia y la visión sintética",
    author: "Koji Takahashi",
    collection: "Arte & Estética",
    collectionId: "arte",
    number: "IMAGEN & PENSAMIENTO 03",
    year: 2025,
    price: 28.00,
    badge: null,
    featured: false,
    isbn: "978-84-128941-4-0",
    pages: 350,
    dimensions: "155 x 230 mm",
    binding: "Tapa dura con lomo en tela plata y sobrecubierta en acetato transparente serigrafiado",
    paper: "Creator Silk 135 g/m²",
    typography: "Univers LT & Sabon",
    translator: "Traducción de Nuria Sato",
    synopsis: "Desde Dziga Vértov hasta los modelos generativos de difusión latente: ¿qué ocurre con la conciencia humana cuando la máquina ve más rápido y más lejos de lo que el nervio óptico puede procesar? Takahashi traza una historia crítica del aparato óptico como prótesis de dominación y emancipación.",
    quote: "«La cámara no congela el instante; lo arranca de la cronología para instituir un tiempo artificial sin muerte ni fatiga.»",
    curatorialNote: "Profusamente ilustrado con fotogramas restaurados y diagramas cromáticos de obturación.",
    coverStyle: {
      bg: "#101014",
      text: "#FFFFFF",
      accent: "#FFB800",
      theme: "shutter-iris",
      label: "IMAGEN · 03"
    },
    sampleChapter: {
      chapterTitle: "1. La cámara como guillotina del flujo continuo",
      content: [
        "Antes de 1839, ninguna mirada humana había contemplado un segundo diseccionado en veinticuatro porciones inmóviles. El ojo vivía en la corriente fluida del presente, donde cada gesto se desvanecía al nacer.",
        "La invención del obturador mecánico produjo una mutación ontológica sin precedentes. Por primera vez, el galope de un caballo o el salto de un acróbata quedaron retenidos en un estado de suspensión estática que no pertenecía ni a la vida ni a la escultura.",
        "Esta fragmentación del tiempo preparó la mente moderna para la producción en cadena de las fábricas. Si el movimiento puede dividirse en fotogramas, también el trabajo humano puede cronometrarse y dividirse en gestos milimétricos."
      ]
    }
  },
  {
    id: "vortice-06",
    title: "Teoría de la Línea Quebrada",
    subtitle: "Fenomenología del desvío, la digresión y la resistencia",
    author: "Vivienne Moreau",
    collection: "Filosofía Crítica",
    collectionId: "filosofia",
    number: "VÉRTICE 13",
    year: 2025,
    price: 22.50,
    badge: null,
    featured: false,
    isbn: "978-84-128941-5-7",
    pages: 264,
    dimensions: "140 x 215 mm",
    binding: "Rústica con solapas anchas en cartulina gráfica invercote de 330 g",
    paper: "Munken Pure Rough 100 g/m²",
    typography: "Druk Text & Baskerville Original",
    translator: "Traducción de Antoine Delacroix",
    synopsis: "La modernidad nos exige caminar en línea recta: la ruta más corta entre la intención y el consumo, entre el origen y el beneficio. Moreau rescata la figura del laberinto, el meandro fluvial y el rodeo literario como las únicas tácticas verdaderamente revolucionarias frente a la tiranía de la eficiencia algorítmica.",
    quote: "«Caminar en zigzag no es perder el tiempo: es obligar al tiempo a revelar sus pliegues ocultos.»",
    curatorialNote: "Un tratado de filosofía política camuflado de ensayo estético. Lectura imprescindible.",
    coverStyle: {
      bg: "#EFECE6",
      text: "#151515",
      accent: "#E63946",
      theme: "zigzag-vectors",
      label: "VÉRTICE · 13"
    },
    sampleChapter: {
      chapterTitle: "Capítulo II: La tiranía del vector recto",
      content: [
        "El camino recto es siempre una imposición del poder. Los ingenieros romanos trazaban sus calzadas a cordel ignorando colinas, poblados y arroyos porque su misión no era habitar el paisaje, sino someterlo militarmente.",
        "Por el contrario, las sendas campesinas serpentean respetando las raíces de los robles añosos, bordeando las hondonadas húmedas y buscando la pendiente menos agotadora para los bueyes. Son caminos conversacionales.",
        "Hoy, la autopista de la información y la interfaz de usuario replican la violencia de la vía romana: ningún desvío está permitido, toda duda es penalizada como 'tiempo de rebote'. Reclamar la línea quebrada es reclamar nuestro derecho a la indecisión fructífera."
      ]
    }
  },
  {
    id: "vortice-07",
    title: "El Atlas de las Sombras Tardías",
    subtitle: "Relatos concéntricos en torno a una biblioteca subterránea",
    author: "Julian Thorne",
    collection: "Ficción Especulativa",
    collectionId: "ficcion",
    number: "FICCIONES 21",
    year: 2026,
    price: 23.00,
    badge: "Edición Limitada",
    featured: false,
    isbn: "978-84-128941-6-4",
    pages: 368,
    dimensions: "140 x 215 mm",
    binding: "Tapa dura con estampado en cera negra mate y guardas impresas con planos astronómicos",
    paper: "Holmen Book Cream 80 g/m²",
    typography: "Caslon Ionic & Trade Gothic",
    translator: "Traducción de Matilde R. Orozco",
    synopsis: "En las catacumbas bajo la catedral de Estrasburgo, un grupo de bibliotecarios heréticos preserva manuscritos que los autores destruyeron antes de publicar. Thorne trenza siete relatos que oscilan entre el siglo XVI y un futuro desértico, unidos por el rumor de un libro que contiene el final de todos los demás.",
    quote: "«Los libros quemados por sus propios autores no desaparecen: arden en una frecuencia más lenta en la memoria de las piedras.»",
    curatorialNote: "Una joya de la literatura metaliteraria que fascinará a los lectores de Borges, Calvino y Sebald.",
    coverStyle: {
      bg: "#181818",
      text: "#F5F5F0",
      accent: "#C5A059",
      theme: "concentric-circles",
      label: "FICCIONES · 21"
    },
    sampleChapter: {
      chapterTitle: "La cámara de los textos cenicientos",
      content: [
        "La humedad constante del nivel -4 mantiene los pergaminos en un estado de flexibilidad gomosa. Hay que manejarlos con espátulas de cuerno de ciervo y guantes de seda sin teñir.",
        "El conservador mayor, Monsieur Vaneau, me mostró el legajo atribuido a Baruch Spinoza que su casera holandesa arrojó a la chimenea en el invierno de 1675. Solo quedaban trescientas palabras legibles en los bordes ennegrecidos.",
        "Sin embargo, al colocarlas bajo la lámpara de vapor de mercurio, las sombras proyectadas por las quemaduras revelaban un segundo texto intercalado: un tratado de óptica donde cada refracción explicaba por qué los humanos confunden el castigo divino con su propia ceguera geométrica."
      ]
    }
  },
  {
    id: "vortice-08",
    title: "Tipografía y Poder",
    subtitle: "El orden de la página impresa del Renacimiento al capitalismo cognitivo",
    author: "Dieter Brand & Sofía Lenz",
    collection: "Arquitectura & Ensayo",
    collectionId: "arquitectura",
    number: "ESTRUCTURAS 08",
    year: 2026,
    price: 34.00,
    badge: "Imprescindible",
    featured: false,
    isbn: "978-84-128941-7-1",
    pages: 440,
    dimensions: "175 x 245 mm",
    binding: "Rústica suiza con lomo visto a la vista y cinta serigrafiada de cierre",
    paper: "Arctic Volume White 130 g/m²",
    typography: "Univers Next & Bodoni Poster",
    translator: "Original en castellano y alemán",
    synopsis: "Una investigación monumental sobre cómo la retícula tipográfica, los tipos de plomo y los formatos de página no son meras elecciones estéticas, sino dispositivos disciplinarios y herramientas de control ideológico. Desde las bulas papales de Gutenberg hasta los píxeles de las interfaces corporativas de Silicon Valley.",
    quote: "«Quien controla los blancos de la página controla la respiración del lector; quien controla la interlínea decide el ritmo de su pensamiento.»",
    curatorialNote: "Diseño interior basado en una estricta retícula de 12 columnas con glosas marginales exhaustivas.",
    coverStyle: {
      bg: "#FFFFFF",
      text: "#000000",
      accent: "#FF0000",
      theme: "swiss-grid-heavy",
      label: "ESTRUCTURAS · 08"
    },
    sampleChapter: {
      chapterTitle: "Capítulo IV: La invención de la mayúscula imperativa",
      content: [
        "La inscripción en la base de la Columna Trajana en Roma no fue esculpida para ser leída por los plebeyos; fue esculpida para imponer la presencia inmutable del Estado sobre quienes levantaban la vista desde el foro.",
        "La proporción áurea de sus letras capitales —el ancho de la 'M', la circunferencia perfecta de la 'O'— sentó las bases de lo que durante dos milenios denominaríamos 'autoridad tipográfica'.",
        "Cuando las marcas globales contemporáneas simplifican sus logotipos en grots geométricas monocromas, no están buscando una inocente modernidad funcional: están reactivando el código visual del imperio romano traducido al código binario."
      ]
    }
  },
  {
    id: "vortice-09",
    title: "Física del Murmullo",
    subtitle: "Sonoridades mínimas, pausas respiratorias y tipografía en desintegración",
    author: "Mateo Albarracín",
    collection: "Poesía Contemporánea",
    collectionId: "poesia",
    number: "VERSO RADICAL 10",
    year: 2026,
    price: 19.50,
    badge: "Novedad",
    featured: false,
    isbn: "978-84-128941-8-8",
    pages: 144,
    dimensions: "125 x 195 mm",
    binding: "Cosido con hilo de lino crudo y cubierta en papel hecho a mano con incrustaciones vegetales",
    paper: "Arche Velin BFK Rives 115 g/m²",
    typography: "Garamond Premier Pro & Futura ND",
    translator: "Original en castellano",
    synopsis: "Albarracín investiga los límites fisiológicos de la voz poética cuando el aire escasea. Poemas breves como esquirlas de cuarzo que exigen ser leídos en voz baja, casi en un suspiro, donde el espacio en blanco de la hoja adquiere el peso de una pausa litúrgica.",
    quote: "«Basta con decir una palabra demasiado fuerte para que la habitación olvide todo lo que aprendió en la penumbra.»",
    curatorialNote: "Premio Nacional de la Crítica de Poesía Experimental 2026.",
    coverStyle: {
      bg: "#161616",
      text: "#EDEDED",
      accent: "#6C757D",
      theme: "whisper-dots",
      label: "VERSO RADICAL · 10"
    },
    sampleChapter: {
      chapterTitle: "Partitura I: Antes del aire",
      content: [
        "No abras la boca todavía.",
        "Deja que la consonante toque el paladar",
        "como una moneda fría.",
        "Espera.",
        "Si la dices ahora, será solo lenguaje.",
        "Si la retienes tres latidos más,",
        "será un puente tendido entre dos ahogos."
      ]
    }
  },
  {
    id: "vortice-10",
    title: "Manifiesto por un Arte Lento",
    subtitle: "Reivindicación de la contemplación prolongada frente al torrente algorítmico",
    author: "Béatrice D'Aubigny",
    collection: "Arte & Estética",
    collectionId: "arte",
    number: "IMAGEN & PENSAMIENTO 04",
    year: 2025,
    price: 26.00,
    badge: null,
    featured: false,
    isbn: "978-84-128941-9-5",
    pages: 296,
    dimensions: "150 x 225 mm",
    binding: "Tapa dura con sobrecubierta serigrafiada a mano sobre papel Munken Kristall",
    paper: "GardaMatt Ultra 130 g/m²",
    typography: "GT America & Minion Pro",
    translator: "Traducción de Paula S. Echeverría",
    synopsis: "En los museos de hoy, el tiempo promedio que un visitante pasa frente a una obra maestra es de 8.3 segundos, la mayoría dedicados a encuadrar la pantalla del teléfono. D'Aubigny formula una propuesta radical: pasar tres horas consecutivas ante un único cuadro de Mark Rothko o una vasija de la dinastía Song para recuperar la mirada anestesiada.",
    quote: "«Ver requiere tiempo; contemplar exige la renuncia voluntaria a todas las demás imágenes del mundo.»",
    curatorialNote: "Un panfleto lúcido y apasionado contra el consumo hiperacelerado del arte.",
    coverStyle: {
      bg: "#F4F1EA",
      text: "#121212",
      accent: "#FF4500",
      theme: "slow-monolith",
      label: "IMAGEN · 04"
    },
    sampleChapter: {
      chapterTitle: "Prólogo: La prueba de los ciento ochenta minutos",
      content: [
        "Llegué a la sala 9 del museo a las diez de la mañana de un martes lluvioso. En la pared del fondo colgaba el lienzo de tres metros por dos: dos rectángulos de color bermellón y ocre sobre un campo de sombra púrpura.",
        "Durante los primeros quince minutos, mi mente no hizo otra cosa que catalogar distracciones: el roce de la suela de un guardia sobre el parquet, la lista de compras pendiente, la urgencia ridícula de comprobar si había recibido un correo electrónico.",
        "Al minuto cuarenta y cinco sucedió algo inesperado: el bermellón empezó a vibrar. La superficie, que parecía plana y opaca, reveló diecisiete capas de veladura transparente. El cuadro no era una imagen: era una atmósfera que respiraba con una cadencia propia."
      ]
    }
  },
  {
    id: "vortice-11",
    title: "Cartografías de la Obsolescencia",
    subtitle: "Arqueología de los soportes de almacenamiento y el olvido deliberado",
    author: "Ramiro Benítez",
    collection: "Filosofía Crítica",
    collectionId: "filosofia",
    number: "VÉRTICE 12",
    year: 2025,
    price: 25.00,
    badge: null,
    featured: false,
    isbn: "978-84-128942-0-1",
    pages: 336,
    dimensions: "140 x 215 mm",
    binding: "Tapa dura entelada en gris cemento con golpe seco metálico",
    paper: "Munken Design 115 g/m²",
    typography: "Neue Montreal & Adobe Jenson Pro",
    translator: "Original en castellano",
    synopsis: "De las cintas magnéticas de óxido férrico a los disquetes de 5¼, pasando por los servidores en silos de sal gema: Benítez explora la fragilidad física de nuestra memoria digital. Mientras los manuscritos del siglo XII siguen siendo perfectamente legibles, millones de documentos creados en 1998 son hoy irrecuperables por falta de unidades lectoras.",
    quote: "«Nuestra época produce más datos que ninguna otra civilización y será la primera en no dejar restos arqueológicos legibles dentro de tres siglos.»",
    curatorialNote: "Obra de referencia para archivistas, filósofos de la tecnología y diseñadores de sistemas.",
    coverStyle: {
      bg: "#2A2A2D",
      text: "#F0F0F0",
      accent: "#00B4D8",
      theme: "circuit-strata",
      label: "VÉRTICE · 12"
    },
    sampleChapter: {
      chapterTitle: "I. El óxido que olvida",
      content: [
        "En un cajón de un laboratorio de la Universidad Politécnica descansa una bobina de cinta perforada de 1968. Si se sostiene a trasluz, los orificios diminutos forman constelaciones ordenadas. Pero ya no existe en el continente una máquina capaz de leerla sin desintegrar el soporte de celulosa.",
        "Creímos que la digitalización era sinónimo de inmortalidad, cuando en realidad inauguraba el período de mayor vulnerabilidad documental de la historia humana. El papiro resiste dos milenios; el disco duro pierde su magnetismo en diez años.",
        "El olvido ya no es una decisión política ni un accidente de las guerras: es una propiedad inherente a los códecs propietarios y a las licencias de software que expiran."
      ]
    }
  },
  {
    id: "vortice-12",
    title: "Las Huéspedes del Tiempo Suspendido",
    subtitle: "Novela coral en una estación astronómica polar",
    author: "Ingrid Vane",
    collection: "Ficción Especulativa",
    collectionId: "ficcion",
    number: "FICCIONES 20",
    year: 2025,
    price: 20.00,
    badge: "Bestseller Crítico",
    featured: false,
    isbn: "978-84-128942-1-8",
    pages: 304,
    dimensions: "135 x 210 mm",
    binding: "Rústica fresada con solapas envolventes y tinta fosforescente en cantos",
    paper: "Olin Regular Cream 90 g/m²",
    typography: "Stanley & Neue Haas Unica",
    translator: "Traducción de Silvia Montero",
    synopsis: "Durante los seis meses de la noche polar en el archipiélago de Svalbard, tres astrofísicas de generaciones distintas custodian el telescopio óptico más septentrional del planeta. Cuando las comunicaciones por satélite colapsan sin previo aviso, el cielo nocturno empieza a transmitir una señal periódica que desafía las leyes de la termodinámica.",
    quote: "«En la oscuridad absoluta de los 78 grados norte, no miras las estrellas: sientes que el vacío del cosmos te está tomando las medidas.»",
    curatorialNote: "Finalista del Premio Europeo de Literatura 2025. Una novela absorbente, tensa y deslumbrante.",
    coverStyle: {
      bg: "#0A0D14",
      text: "#E2E8F0",
      accent: "#7000FF",
      theme: "polar-eclipse",
      label: "FICCIONES · 20"
    },
    sampleChapter: {
      chapterTitle: "Día 43 de la Noche Continua",
      content: [
        "El termómetro exterior marcaba -38 grados Celsius. A esa temperatura, si arrojas una taza de agua hirviendo al aire libre, se convierte en una nube de nieve cristalina antes de tocar el suelo.",
        "Klara ajustaba las coordenadas del radiómetro de microondas en la cúpula B. La campana de cristal templado temblaba ligeramente bajo las ráfagas del viento catabático. En los auriculares solo debía escucharse el soplido uniforme de la radiación de fondo del Big Bang.",
        "Sin embargo, a las 23:14, una modulación rítmica de siete pulsos rompió la estática. No era una interferencia de los barcos rompehielos rusos ni el eco de un satélite en desuso. Era un compás perfecto de siete por ocho, emitido desde una región del espacio donde los mapas afirmaban que solo había gas frío."
      ]
    }
  }
];

// Colecciones editoriales
const COLLECTIONS_DATA = [
  { id: "all", name: "Catálogo Completo", count: 12 },
  { id: "filosofia", name: "Filosofía Crítica", count: 3, code: "COL-01", description: "Ensayos sobre estética, pensamiento político y fenomenología contemporánea." },
  { id: "arquitectura", name: "Arquitectura & Ensayo", count: 2, code: "COL-02", description: "Morfología espacial, historia del diseño tipográfico y teoría constructiva." },
  { id: "ficcion", name: "Ficción Especulativa", count: 3, code: "COL-03", description: "Narrativa de vanguardia, atmósferas liminares y experimentación formal." },
  { id: "poesia", name: "Poesía Contemporánea", count: 2, code: "COL-04", description: "Voces poéticas radicales, apropiaciones textuales y sonoridades mínimas." },
  { id: "arte", name: "Arte & Estética", count: 2, code: "COL-05", description: "Cultura visual, crítica de la imagen técnica y nuevos medios sintéticos." }
];