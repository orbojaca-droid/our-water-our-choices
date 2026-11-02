/**
 * @file app.js
 * @description Motor interactivo vanilla JS (100% offline, cero dependencias externas)
 * para la presentación "Water, a Complex Web". Gestiona escalado letterbox 16:9,
 * pasos de animación por teclado/táctil, evolución del Círculo Viviente, modo orador
 * sincronizado (panel lateral + ventana secundaria opcional), cronómetro, cuadrícula
 * e impresión estática.
 */
(function () {
  "use strict";

  var DATA = window.PRESENTATION_DATA;
  if (!DATA) {
    throw new Error("PRESENTATION_DATA no se cargó desde js/contenido.js");
  }

  /** Lista combinada: diapositiva 0 (gancho animado) + 12 principales + diapositiva 13 de fuentes */
  var ALL_SLIDES = [DATA.introSlide].concat(DATA.slides, [DATA.sourcesSlide]);

  /** Estado reactivo central de la sesión */
  var state = {
    slideIndex: 0, // 0..13 (0 = Slide 0 gancho, 1 = Slide 1, 12 = Slide 12, 13 = Slide 13 Fuentes); el índice coincide con slide.id

    step: 0,
    speakerOpen: false,
    gridOpen: false,
    sourcesFilter: "all",
    activeColombiaPin: 0,
    aralSliderPct: 14,
    timerRunning: false,
    totalElapsedSec: 0,
    slideElapsedSec: 0,
    timerIntervalId: null,
    isStandaloneSpeaker: window.location.search.indexOf("speaker=1") !== -1
  };

  /** Controlador para limpiar listeners específicos de cada diapositiva sin fugas de memoria */
  var slideAbortController = null;

  /** Canal opcional para sincronizar segunda ventana de modo orador */
  var syncChannel = typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("agua_presentacion_sync_v1")
    : null;

  /** Referencias DOM cacheadas al iniciar */
  var dom = {};

  /**
   * Escapa caracteres HTML especiales para prevenir inyección accidental al interpolar textos.
   * @param {string} str Cadena de entrada.
   * @returns {string} Cadena segura para HTML.
   */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Formatea segundos enteros en cadena MM:SS.
   * @param {number} sec Segundos totales.
   * @returns {string} Tiempo formateado.
   */
  function formatTime(sec) {
    var s = Math.max(0, Math.floor(sec));
    var m = Math.floor(s / 60);
    var rem = s % 60;
    return m + ":" + (rem < 10 ? "0" + rem : rem);
  }

  /**
   * Genera píldoras discretas de trazabilidad con los IDs del RESEARCH_LEDGER.md.
   * @param {string|string[]} ids Uno o varios IDs L-XX.
   * @returns {string} HTML de la píldora.
   */
  function renderLedgerPills(ids) {
    if (!ids) return "";
    var list = Array.isArray(ids) ? ids : [ids];
    if (!list.length) return "";
    return '<span class="ledger-pill" title="Verified Ledger ID">' + esc(list.join(" · ")) + "</span>";
  }

  /**
   * Resalta estructuras gramaticales objetivo de nivel B2 en las diapositivas 10 y 11.
   * @param {string} text Oración en inglés.
   * @returns {string} HTML con etiquetas <span class="grammar-hl">.
   */
  function highlightB2Grammar(text) {
    var safe = esc(text);
    var phrases = [
      "might have treated",
      "must have assumed",
      "may have failed",
      "shouldn't have diverted",
      "if they had respected",
      "wouldn't have lost",
      "shouldn't have cut",
      "was approved",
      "If the 2014 Bogotá River ruling had been implemented",
      "would already be cleaning",
      "should have acted"
    ];
    for (var i = 0; i < phrases.length; i++) {
      var p = esc(phrases[i]);
      safe = safe.replace(p, '<span class="grammar-hl">' + p + "</span>");
    }
    return safe;
  }

  /**
   * Calcula y aplica la escala proporcional 16:9 (letterbox) sobre el lienzo 1920×1080.
   * @returns {void}
   */
  function updateStageScale() {
    if (!dom.viewport || !dom.scaler) return;
    var vw = dom.viewport.clientWidth;
    var vh = dom.viewport.clientHeight;
    if (vw <= 0 || vh <= 0) return;
    var padX = 20;
    var padY = 20;
    var scale = Math.min((vw - padX) / 1920, (vh - padY) / 1080);
    scale = Math.max(0.18, Math.min(scale, 2.0));
    document.documentElement.style.setProperty("--stage-scale", scale.toFixed(4));
  }

  /**
   * Renderiza el SVG persistente del "Círculo Viviente" (esquina superior izquierda, diapositivas 2–11).
   * @param {string} mode Modo visual según la sección actual.
   * @returns {string} Markup SVG accesible.
   */
  function renderMiniLivingCircleSVG(mode) {
    var waterFill = mode === "corner-bankruptcy" ? "#D64545" : "#0E5A8A";
    var strokeW = mode === "corner-heavy-draw" ? "4.2" : "2.4";
    var showRedBack =
      mode === "corner-bankruptcy" ||
      mode === "corner-consumption" ||
      mode === "corner-thermal" ||
      mode === "corner-health-return";
    var showGreenBranch = mode === "corner-recovery";
    var showThreads = mode === "corner-threads";
    var showCultureRing = mode === "corner-culture" || mode === "corner-question";
    var showColombia = mode === "corner-colombia";

    return (
      '<svg viewBox="0 0 160 80" width="152" height="76" role="img" aria-label="Living Circle mini map: Water, Plants, and People">' +
      "<title>Living Circle: Water, Plants, and People</title>" +
      (showThreads
        ? '<g stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.75">' +
          '<line x1="30" y1="40" x2="10" y2="14"/><line x1="30" y1="40" x2="10" y2="66"/>' +
          '<line x1="30" y1="40" x2="54" y2="10"/><line x1="30" y1="40" x2="54" y2="70"/>' +
          "</g>"
        : "") +
      (showColombia
        ? '<polygon points="80,22 88,30 85,46 79,58 73,45 74,31" fill="rgba(56,189,248,0.25)" stroke="#38BDF8" stroke-width="1.4"/>'
        : "") +
      /* Flechas base del triángulo */
      '<path d="M 42 32 L 74 18" stroke="#38BDF8" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M 92 18 L 122 32" stroke="#3E9B5C" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M 118 48 L 46 48" stroke="' +
      (showRedBack ? "#D64545" : "#F2A03D") +
      '" stroke-width="' +
      strokeW +
      '" ' +
      (showRedBack ? 'stroke-dasharray="4 3"' : "") +
      ' fill="none" stroke-linecap="round"/>' +
      (showGreenBranch
        ? '<path d="M 118 54 Q 82 74 44 54" stroke="#3E9B5C" stroke-width="2.8" fill="none"/>'
        : "") +
      /* Nodo Agua */
      '<circle cx="30" cy="42" r="13" fill="' +
      waterFill +
      '" stroke="#38BDF8" stroke-width="2"/>' +
      '<text x="30" y="46" text-anchor="middle" fill="#FFF" font-size="11" font-weight="800">W</text>' +
      /* Nodo Plantas */
      '<circle cx="83" cy="15" r="11" fill="#3E9B5C" stroke="#86EFAC" stroke-width="1.8"/>' +
      '<text x="83" y="19" text-anchor="middle" fill="#FFF" font-size="10" font-weight="800">P</text>' +
      /* Nodo Humanos */
      (showCultureRing
        ? '<circle cx="130" cy="42" r="17" fill="none" stroke="#FBBF24" stroke-width="2" stroke-dasharray="3 2"/>'
        : "") +
      '<circle cx="130" cy="42" r="13" fill="#F2A03D" stroke="#FEF08A" stroke-width="2"/>' +
      '<text x="130" y="46" text-anchor="middle" fill="#0B1F33" font-size="11" font-weight="900">' +
      (mode === "corner-question" ? "?" : "H") +
      "</text>" +
      "</svg>"
    );
  }

  /**
   * Renderiza la silueta humana SVG de la Diapositiva 1 con nivel interno de agua al 60%.
   * @param {boolean} filled Indica si el Paso 1 ya llenó el 60% del cuerpo.
   * @returns {string} Markup SVG accesible.
   */
  function renderHumanSilhouetteSVG(filled) {
    var translateY = filled ? 152 : 380; // 60% de altura sobre lienzo 380px
    return (
      '<svg class="s1-silhouette-svg" viewBox="0 0 180 380" role="img" aria-label="Human body silhouette filled to 60 percent water">' +
      "<title>Human body: approximately 60 percent water</title>" +
      "<defs>" +
      '<clipPath id="humanBodyClip">' +
      '<circle cx="90" cy="44" r="28"/>' +
      '<path d="M52,84 C52,76 128,76 128,84 L144,192 C145,202 131,206 127,196 L116,124 L116,352 C116,364 95,364 95,352 L93,232 L87,232 L85,352 C85,364 64,364 64,352 L64,124 L53,196 C49,206 35,202 36,192 Z"/>' +
      "</clipPath>" +
      "</defs>" +
      /* Contorno base */
      '<g fill="rgba(255,255,255,0.06)" stroke="#38BDF8" stroke-width="3">' +
      '<circle cx="90" cy="44" r="28"/>' +
      '<path d="M52,84 C52,76 128,76 128,84 L144,192 C145,202 131,206 127,196 L116,124 L116,352 C116,364 95,364 95,352 L93,232 L87,232 L85,352 C85,364 64,364 64,352 L64,124 L53,196 C49,206 35,202 36,192 Z"/>' +
      "</g>" +
      /* Nivel de agua al 60% */
      '<g clip-path="url(#humanBodyClip)">' +
      '<g class="s1-water-fill" style="transform: translate3d(0, ' +
      translateY +
      'px, 0);">' +
      '<path d="M0,12 Q45,0 90,12 T180,12 L180,390 L0,390 Z" fill="rgba(56,189,248,0.82)"/>' +
      '<line x1="12" y1="12" x2="168" y2="12" stroke="#FEF08A" stroke-width="3" stroke-dasharray="6 4"/>' +
      "</g>" +
      "</g>" +
      (filled
        ? '<text x="90" y="218" text-anchor="middle" fill="#0B1F33" font-size="28" font-weight="900">≈ 60%</text>'
        : "") +
      "</svg>"
    );
  }

  /**
   * Renderiza el Círculo Viviente a gran escala para la Diapositiva 1 (apertura) y 12 (cierre).
   * @param {boolean} isClosing True en Diapositiva 12 (muestra flecha roja de contaminación).
   * @param {number} step Paso actual de animación.
   * @returns {string} Markup SVG accesible.
   */
  function renderHeroLivingCircleSVG(isClosing, step) {
    var showPlantsArrow = isClosing || step >= 2;
    var showPeopleLoop = isClosing || step >= 3;
    var showRedPollution = isClosing && step >= 1;

    return (
      '<svg class="s1-circle-svg" viewBox="0 0 760 440" role="img" aria-label="Living Circle diagram connecting Water, Plants and Algae, and People">' +
      "<title>The Living Circle: Water, Plants and Algae, and People</title>" +
      "<defs>" +
      '<marker id="arrBlue" markerWidth="10" markerHeight="10" refX="7" refY="3.5" orient="auto">' +
      '<polygon points="0 0, 9 3.5, 0 7" fill="#38BDF8"/></marker>' +
      '<marker id="arrGreen" markerWidth="10" markerHeight="10" refX="7" refY="3.5" orient="auto">' +
      '<polygon points="0 0, 9 3.5, 0 7" fill="#4ADE80"/></marker>' +
      '<marker id="arrAmber" markerWidth="10" markerHeight="10" refX="7" refY="3.5" orient="auto">' +
      '<polygon points="0 0, 9 3.5, 0 7" fill="#FBBF24"/></marker>' +
      '<marker id="arrRed" markerWidth="11" markerHeight="11" refX="7" refY="3.5" orient="auto">' +
      '<polygon points="0 0, 9 3.5, 0 7" fill="#F87171"/></marker>' +
      "</defs>" +
      /* Conectores curvos */
      (showPlantsArrow
        ? '<path d="M 190 250 Q 250 115 322 96" fill="none" stroke="#38BDF8" stroke-width="6" marker-end="url(#arrBlue)"/>' +
          '<text x="195" y="148" fill="#7DD3FC" font-size="20" font-weight="700">sustains life</text>'
        : "") +
      (showPeopleLoop
        ? '<path d="M 442 96 Q 520 118 572 246" fill="none" stroke="#4ADE80" stroke-width="6" marker-end="url(#arrGreen)"/>' +
          '<text x="505" y="148" fill="#86EFAC" font-size="20" font-weight="700">≥50% O₂ + food</text>'
        : "") +
      (!isClosing && showPeopleLoop
        ? '<path d="M 520 326 Q 380 390 238 326" fill="none" stroke="#FBBF24" stroke-width="5" stroke-dasharray="10 6" marker-end="url(#arrAmber)"/>' +
          '<text x="380" y="388" text-anchor="middle" fill="#FDE68A" font-size="21" font-weight="700">depends on &amp; shapes</text>'
        : "") +
      (showRedPollution
        ? '<path d="M 522 330 Q 380 418 236 330" fill="none" stroke="#F87171" stroke-width="9" marker-end="url(#arrRed)"/>' +
          '<rect x="235" y="366" width="290" height="38" rx="10" fill="#D64545"/>' +
          '<text x="380" y="391" text-anchor="middle" fill="#FFFFFF" font-size="19" font-weight="900">▲ POLLUTION &amp; BANKRUPTCY</text>'
        : "") +
      /* Nodo 1: WATER */
      '<g transform="translate(150, 295)">' +
      '<circle r="76" fill="#0E5A8A" stroke="#38BDF8" stroke-width="5"/>' +
      '<text y="-6" text-anchor="middle" fill="#FFFFFF" font-size="28" font-weight="900">WATER</text>' +
      '<text y="24" text-anchor="middle" fill="#BAE6FD" font-size="18" font-weight="600">Rivers · Aquifers · Rain</text>' +
      "</g>" +
      /* Nodo 2: PLANTS & ALGAE */
      '<g transform="translate(382, 86)" opacity="' +
      (showPlantsArrow ? "1" : "0.28") +
      '">' +
      '<circle r="74" fill="#1F6E3C" stroke="#4ADE80" stroke-width="5"/>' +
      '<text y="-8" text-anchor="middle" fill="#FFFFFF" font-size="24" font-weight="900">PLANTS</text>' +
      '<text y="18" text-anchor="middle" fill="#DCFCE7" font-size="20" font-weight="700">&amp; Ocean Algae</text>' +
      "</g>" +
      /* Nodo 3: PEOPLE / CULTURE */
      '<g transform="translate(610, 295)" opacity="' +
      (showPeopleLoop ? "1" : "0.28") +
      '">' +
      '<circle r="76" fill="#B45309" stroke="#FBBF24" stroke-width="5"/>' +
      '<text y="-6" text-anchor="middle" fill="#FFFFFF" font-size="27" font-weight="900">PEOPLE</text>' +
      '<text y="24" text-anchor="middle" fill="#FEF3C7" font-size="18" font-weight="700">Culture &amp; Choices</text>' +
      "</g>" +
      "</svg>"
    );
  }

  /**
   * Renderiza el cauce fluvial SVG de la Diapositiva 2 que desciende en el Paso 1 y teje 4 esferas.
   * @param {boolean} dropped True cuando el nivel del agua desciende (Paso >= 1).
   * @returns {string} Markup SVG accesible.
   */
  function renderDryingRiverSVG(dropped) {
    return (
      '<svg viewBox="0 0 1600 110" width="100%" height="104" role="img" aria-label="River water level dropping and weaving threads across climate, farming, economy, and health">' +
      "<title>Drying river connecting all four spheres at once</title>" +
      '<rect x="10" y="12" width="1580" height="84" rx="20" fill="#E2E8F0"/>' +
      /* Nivel alto inicial vs nivel bajo en sequía */
      (dropped
        ? '<path d="M 20 66 Q 400 52 800 68 T 1580 64 L 1580 92 L 20 92 Z" fill="#0E5A8A"/>' +
          '<text x="800" y="42" text-anchor="middle" fill="#B91C1C" font-size="22" font-weight="800">▼ River flow drops during drought → threads pull every sphere together</text>' +
          '<g stroke="#0E5A8A" stroke-width="3" stroke-dasharray="7 5">' +
          '<line x1="200" y1="88" x2="200" y2="110"/><line x1="600" y1="88" x2="600" y2="110"/>' +
          '<line x1="1000" y1="88" x2="1000" y2="110"/><line x1="1400" y1="88" x2="1400" y2="110"/>' +
          '<line x1="200" y1="96" x2="1400" y2="96"/>' +
          "</g>"
        : '<path d="M 20 30 Q 400 18 800 32 T 1580 28 L 1580 92 L 20 92 Z" fill="#0E5A8A"/>' +
          '<text x="800" y="66" text-anchor="middle" fill="#FFFFFF" font-size="23" font-weight="800">Imagine a river in Colombia drying up today…</text>') +
      "</svg>"
    );
  }

  /**
   * Renderiza el comparador SVG Antes/Después (1960 vs. 2020s) del Mar de Aral en la Diapositiva 5.
   * @param {number} pct Porcentaje del deslizador (0 = vista 1960 completa, 100 = vista 2020s reducida).
   * @returns {string} Markup SVG accesible.
   */
  function renderAralSeaSVG(pct) {
    var splitX = Math.round(520 * (1 - pct / 100)); // Al aumentar pct, se revela más el estado seco 2020s
    return (
      '<svg id="aralSvg" viewBox="0 0 520 220" width="100%" height="100%" role="img" aria-label="Aral Sea comparison between 1960 full lake and 2020s shrunken remnants">' +
      "<title>Aral Sea 1960 versus 2020s shrinkage</title>" +
      "<defs>" +
      '<clipPath id="aral1960Clip"><rect id="aralClipRect" x="0" y="0" width="' +
      splitX +
      '" height="220"/></clipPath>' +
      "</defs>" +
      /* Fondo 2020s: lecho salino seco + fragmentos Norte y Oeste */
      '<rect width="520" height="220" fill="#E7DFD3"/>' +
      '<path d="M145,26 C210,16 325,30 355,82 C378,125 344,186 270,196 C195,204 136,174 130,115 C125,70 120,35 145,26 Z" fill="#D6C7B2" stroke="#94A3B8" stroke-width="2" stroke-dasharray="5 4"/>' +
      /* Aral Norte (recuperado parcialmente con Kokaral) y remanente occidental */
      '<path d="M175,32 C215,24 265,32 272,52 C260,64 205,62 175,48 Z" fill="#0E5A8A"/>' +
      '<path d="M142,88 C156,86 164,122 156,166 C144,162 135,126 142,88 Z" fill="#0E5A8A"/>' +
      '<text x="382" y="196" fill="#7C2D12" font-size="17" font-weight="800">2020s (&gt;80% lost)</text>' +
      /* Capa 1960 recortada por el deslizador */
      '<g clip-path="url(#aral1960Clip)">' +
      '<rect width="520" height="220" fill="#DCEBFA"/>' +
      '<path d="M145,26 C210,16 325,30 355,82 C378,125 344,186 270,196 C195,204 136,174 130,115 C125,70 120,35 145,26 Z" fill="#0E5A8A"/>' +
      '<text x="24" y="196" fill="#0B1F33" font-size="17" font-weight="800">1960 (Full basin)</text>' +
      "</g>" +
      /* Línea divisoria del deslizador */
      '<line id="aralDividerLine" x1="' +
      splitX +
      '" y1="0" x2="' +
      splitX +
      '" y2="220" stroke="#0B1F33" stroke-width="3"/>' +
      '<circle id="aralDividerKnob" cx="' +
      splitX +
      '" cy="110" r="13" fill="#F2A03D" stroke="#0B1F33" stroke-width="2.5"/>' +
      "</svg>"
    );
  }

  /**
   * Renderiza el vaso con filtro de inspección UV para contaminantes emergentes (Diapositiva 7).
   * @param {boolean} active True cuando el Paso 3 activa el lente UV.
   * @returns {string} Markup SVG accesible.
   */
  function renderUVGlassSVG(active) {
    return (
      '<svg viewBox="0 0 380 130" width="100%" height="122" role="img" aria-label="Drinking glass inspected by a UV lens revealing invisible PFAS, microplastics, and pharmaceuticals">' +
      "<title>Invisible emerging contaminants revealed in water</title>" +
      /* Vaso */
      '<polygon points="48,14 142,14 130,118 60,118" fill="rgba(56,189,248,0.18)" stroke="#7DD3FC" stroke-width="3"/>' +
      '<polygon points="53,42 137,42 128,114 62,114" fill="rgba(56,189,248,0.34)"/>' +
      /* Lente UV */
      (active
        ? '<circle cx="110" cy="74" r="42" fill="rgba(168,85,247,0.26)" stroke="#FBBF24" stroke-width="3"/>' +
          '<circle cx="96" cy="64" r="4.5" fill="#F87171"/><circle cx="118" cy="58" r="3.5" fill="#FBBF24"/>' +
          '<circle cx="106" cy="84" r="4" fill="#4ADE80"/><circle cx="126" cy="78" r="4.5" fill="#F87171"/>' +
          '<line x1="142" y1="102" x2="174" y2="120" stroke="#FBBF24" stroke-width="5" stroke-linecap="round"/>' +
          '<text x="176" y="46" fill="#FEF08A" font-size="18" font-weight="800">● PFAS (“forever chemicals”)</text>' +
          '<text x="176" y="74" fill="#FCA5A5" font-size="18" font-weight="800">● Micro- &amp; nanoplastics</text>' +
          '<text x="176" y="102" fill="#86EFAC" font-size="18" font-weight="800">● Pharmaceuticals</text>'
        : '<text x="170" y="72" fill="#94A3B8" font-size="19" font-weight="700">Looks clear to the naked eye…</text>') +
      "</svg>"
    );
  }

  /**
   * Renderiza el reloj SVG de 250 millones de horas diarias (Diapositiva 8).
   * @param {boolean} active True cuando el Paso 3 está visible.
   * @returns {string} Markup SVG accesible.
   */
  function renderHoursClockSVG(active) {
    return (
      '<svg viewBox="0 0 120 120" width="108" height="108" role="img" aria-label="Clock showing 250 million daily hours spent by women and girls collecting water">' +
      "<title>250 million hours per day collecting water</title>" +
      '<circle cx="60" cy="60" r="50" fill="#FFFBEB" stroke="#F2A03D" stroke-width="7"/>' +
      '<path d="M60,60 L60,24" stroke="#0B1F33" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M60,60 L' +
      (active ? "92,76" : "60,24") +
      '" stroke="#D64545" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="60" cy="60" r="5" fill="#0B1F33"/>' +
      "</svg>"
    );
  }

  /**
   * Renderiza el mapa vectorial esquemático de Colombia con sus 3 pines interactivos (Diapositiva 9).
   * @param {number} step Paso actual de la diapositiva (0..4).
   * @param {number} selectedPin Pin resaltado manualmente (0 = ninguno).
   * @param {Array} pins Lista de pines desde contenido.js.
   * @returns {string} Markup SVG accesible.
   */
  function renderColombiaMapSVG(step, selectedPin, pins) {
    var pinsMarkup = "";
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      var isLit = step >= p.step || selectedPin === p.pinNumber;
      var fill = isLit ? (p.pinNumber === 2 ? "#D64545" : p.pinNumber === 3 ? "#3E9B5C" : "#F2A03D") : "#94A3B8";
      pinsMarkup +=
        '<g class="map-pin-group" data-pin="' +
        p.pinNumber +
        '" role="button" tabindex="0" aria-label="Pin ' +
        p.pinNumber +
        ": " +
        esc(p.title) +
        '">' +
        (isLit
          ? '<circle cx="' + p.coords.x + '" cy="' + p.coords.y + '" r="24" fill="' + fill + '" opacity="0.24"/>'
          : "") +
        '<circle cx="' +
        p.coords.x +
        '" cy="' +
        p.coords.y +
        '" r="16" fill="' +
        fill +
        '" stroke="#0B1F33" stroke-width="2.5"/>' +
        '<text x="' +
        p.coords.x +
        '" y="' +
        (p.coords.y + 6) +
        '" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="900">' +
        p.pinNumber +
        "</text>" +
        "</g>";
    }

    return (
      '<svg viewBox="0 0 360 440" width="100%" height="410" role="img" aria-label="Map of Colombia with macro-basins and three case-study pins: Bogotá River, Alluvial Gold Mining, and Lake Tota">' +
      "<title>Colombia Water Paradox and Three Regional Mirrors</title>" +
      /* Silueta estilizada de Colombia */
      '<path d="M156,24 L196,18 L212,42 L196,74 L224,116 L278,136 L316,186 L296,248 L324,296 L282,368 L238,422 L206,372 L152,348 L102,318 L76,268 L94,202 L82,142 L108,104 L126,56 Z" fill="#DBEAFE" stroke="#0E5A8A" stroke-width="3.5" stroke-linejoin="round"/>' +
      /* Franja Andina/Caribe (74% población, menor agua) vs Amazonía/Orinoquía/Pacífico (77% agua) */
      '<path d="M126,56 L196,74 L224,116 L228,256 L152,304 L106,240 L108,104 Z" fill="rgba(242,160,61,0.24)" stroke="rgba(180,83,9,0.4)" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      /* Río Magdalena-Cauca esquemático */
      '<path d="M154,298 Q166,200 162,64" fill="none" stroke="#0E5A8A" stroke-width="3" opacity="0.65"/>' +
      '<text x="178" y="96" fill="#7C2D12" font-size="13" font-weight="800">74% population</text>' +
      '<text x="242" y="328" text-anchor="middle" fill="#0E5A8A" font-size="13" font-weight="800">77% water</text>' +
      pinsMarkup +
      "</svg>"
    );
  }

  /* =========================================================================
   * CONSTRUCTORES DE CONTENIDO CENTRAL POR DIAPOSITIVA (1..13)
   * ========================================================================= */

  /**
   * Construye el cuerpo HTML específico según el layout de la diapositiva.
   * @param {Object} slide Objeto de diapositiva desde contenido.js.
   * @param {number} step Paso actual.
   * @returns {string} HTML del área principal `.slide-main`.
   */
  function buildSlideMainHTML(slide, step) {
    var v = slide.visual;
    switch (slide.layout) {
      case "opening-circle":
        return (
          '<div class="s1-grid" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s1-left card">' +
          renderHumanSilhouetteSVG(step >= 1) +
          '<div class="s1-stats-stack">' +
          '<div class="step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1">' +
          '<div class="kpi-huge" style="color:var(--water-bright);">' + esc(v.bodyWaterPct.value) + renderLedgerPills(v.bodyWaterPct.ledgerId) + "</div>" +
          '<p class="body-copy"><strong>' + esc(v.bodyWaterPct.label) + "</strong><br>" + esc(v.bodyWaterPct.detail) + "</p>" +
          "</div>" +
          '<div class="step-reveal ' + (step >= 2 ? "is-visible" : "") + '" data-req-step="2">' +
          '<div class="kpi-large" style="color:var(--plants-bright);">' + esc(v.oceanOxygen.value) + renderLedgerPills(v.oceanOxygen.ledgerId) + "</div>" +
          '<p class="body-copy-sm">' + esc(v.oceanOxygen.label) + "</p>" +
          "</div>" +
          "</div></div>" +
          '<div class="s1-circle-wrap">' +
          renderHeroLivingCircleSVG(false, step) +
          '<div class="card step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3" style="width:100%;text-align:center;padding:16px 24px;border-color:var(--amber-bright);">' +
          '<p class="body-copy" style="font-weight:800;color:var(--amber-bright);">' + esc(v.circleRule.chain) + "</p>" +
          '<p class="body-copy-sm">' + esc(v.circleRule.question) + "</p>" +
          "</div></div></div>"
        );

      case "drying-river":
        var spheresHTML = v.spheres
          .map(function (sp) {
            return (
              '<div class="s2-sphere-card ' + (step >= 1 ? "is-linked" : "") + '">' +
              '<div class="s2-sphere-title">' + esc(sp.icon + " " + sp.title) + "</div>" +
              '<p class="body-copy-sm">' + esc(step >= 1 ? sp.effect : "Separate problem?") + "</p>" +
              "</div>"
            );
          })
          .join("");
        var badgeCardsHTML = v.badgeCards
          .map(function (b) {
            return (
              '<div class="s2-badge-item">' +
              '<div class="s2-badge-icon">' + esc(b.symbol) + "</div>" +
              "<div><strong style=\"font-size:24px;\">" + esc(b.name) + "</strong>" + renderLedgerPills(b.ledgerId) +
              '<p class="body-copy-sm">' + esc(b.desc) + "</p></div></div>"
            );
          })
          .join("");
        return (
          '<div class="s2-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="card s2-river-box">' +
          renderDryingRiverSVG(step >= 1) +
          '<div class="s2-spheres-grid">' + spheresHTML + "</div>" +
          '<p class="body-copy step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1" style="margin-top:12px;font-weight:800;color:var(--water);text-align:center;">' +
          esc(v.allAtOnceBanner) + "</p></div>" +
          '<div class="s2-morin-row">' +
          '<div class="card step-reveal ' + (step >= 2 ? "is-visible" : "") + '" data-req-step="2" style="border-left:7px solid var(--water);">' +
          '<div class="chip-eyebrow" style="color:var(--water);">' + esc(v.morinCard.thinker) + renderLedgerPills(v.morinCard.ledgerId) + "</div>" +
          '<div style="font-size:34px;font-weight:800;margin:6px 0 8px;">' + esc(v.morinCard.term) + "</div>" +
          '<p class="body-copy-sm">' + esc(v.morinCard.explanation) + "</p></div>" +
          '<div class="s2-badges-grid step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3">' +
          badgeCardsHTML + "</div></div></div>"
        );

      case "angel-maya-venn":
        return (
          '<div class="s3-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s3-venn-stage">' +
          '<div class="s3-circle-card s3-eco-card">' +
          '<div class="chip-eyebrow" style="color:var(--plants-bright);">Sphere 1 · Biophysical Base</div>' +
          '<div style="font-size:34px;font-weight:800;">' + esc(v.leftCircle.title) + renderLedgerPills(v.leftCircle.ledgerId) + "</div>" +
          '<ul class="s3-list">' + v.leftCircle.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
          "</div>" +
          '<div class="s3-circle-card s3-inter-card step-reveal ' + (step >= 2 ? "is-visible" : "") + '" data-req-step="2">' +
          '<div class="chip-eyebrow" style="color:#FFFFFF;">Intersection</div>' +
          '<div style="font-size:32px;font-weight:900;">' + esc(v.intersection.title) + renderLedgerPills(v.intersection.ledgerId) + "</div>" +
          '<p class="body-copy-sm">' + esc(v.intersection.crisisNote) + "</p>" +
          "</div>" +
          '<div class="s3-circle-card s3-cul-card step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1">' +
          '<div class="chip-eyebrow" style="color:var(--amber-bright);">Sphere 2 · Human Adaptation</div>' +
          '<div style="font-size:34px;font-weight:800;">' + esc(v.rightCircle.title) + renderLedgerPills(v.rightCircle.ledgerId) + "</div>" +
          '<div style="font-size:22px;color:var(--amber-bright);font-weight:700;">' + esc(v.rightCircle.subtitle) + "</div>" +
          '<ul class="s3-list">' + v.rightCircle.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
          "</div></div>" +
          '<div class="s3-thesis-box step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3">' +
          '<span style="font-size:15px;text-transform:uppercase;letter-spacing:0.14em;color:var(--amber-bright);display:block;margin-bottom:4px;">Central Thesis</span>' +
          esc(v.thesis) + "</div>" +
          '<div class="s3-flip-bar step-reveal ' + (step >= 4 ? "is-visible" : "") + '" data-req-step="4">' +
          '<span style="opacity:0.82;">' + esc(v.questionFlip.oldQuestion) + "</span>" +
          '<span style="color:var(--amber-bright);">→ ' + esc(v.questionFlip.newQuestion) + renderLedgerPills(v.questionFlip.ledgerId) + "</span>" +
          "</div></div>"
        );

      case "two-faces-bankruptcy":
        return (
          '<div class="s4-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s4-bankruptcy-head step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1">' +
          "<div><div class=\"chip-eyebrow\" style=\"color:#FCA5A5;\">" + esc(v.bankruptcyBanner.tag) + renderLedgerPills(v.bankruptcyBanner.ledgerId) + "</div>" +
          '<p class="body-copy-sm">' + esc(v.bankruptcyBanner.definition) + "</p></div>" +
          '<div class="bankruptcy-stamp">' + esc(v.bankruptcyBanner.label) + "</div></div>" +
          '<div class="s4-faces-grid">' +
          '<div class="card step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1">' +
          '<div class="chip-eyebrow" style="color:var(--water-bright);">' + esc(v.faceA.title) + "</div>" +
          v.faceA.stats.map(function (st) {
            return (
              '<div class="s4-stat-row"><span class="kpi-large" style="color:var(--water-bright);min-width:136px;">' +
              esc(st.value) + '</span><span class="body-copy-sm">' + esc(st.text) + renderLedgerPills(st.ledgerId) + "</span></div>"
            );
          }).join("") +
          "</div>" +
          '<div class="s4-loop-center step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3">' +
          '<div style="font-size:42px;line-height:1;">↻</div>' +
          '<div class="kpi-huge" style="color:var(--amber-bright);">' + esc(v.centralLoop.stat) + renderLedgerPills(v.centralLoop.ledgerId) + "</div>" +
          '<p class="body-copy" style="font-weight:800;">' + esc(v.centralLoop.headline) + "</p>" +
          '<p class="body-copy-sm" style="color:#FDE68A;">' + esc(v.centralLoop.mechanism) + "</p>" +
          "</div>" +
          '<div class="card step-reveal ' + (step >= 2 ? "is-visible" : "") + '" data-req-step="2">' +
          '<div class="chip-eyebrow" style="color:var(--alert-bright);">' + esc(v.faceB.title) + "</div>" +
          v.faceB.stats.map(function (st) {
            return (
              '<div class="s4-stat-row"><span class="kpi-large" style="color:var(--alert-bright);min-width:128px;">' +
              esc(st.value) + '</span><span class="body-copy-sm">' + esc(st.text) + renderLedgerPills(st.ledgerId) + "</span></div>"
            );
          }).join("") +
          "</div></div></div>"
        );

      case "history-timeline":
        var sliderVal = step >= 3 ? state.aralSliderPct : 12;
        return (
          '<div class="s5-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s5-top-grid">' +
          '<div class="s5-bars-stack">' +
          v.growthBars.map(function (b) {
            return (
              '<div class="card step-reveal ' + (step >= b.step ? "is-visible" : "") + '" data-req-step="' + b.step + '" style="padding:16px 22px;">' +
              '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;">' +
              '<strong style="font-size:24px;">' + esc(b.label) + renderLedgerPills(b.ledgerId) + "</strong>" +
              '<span style="font-size:30px;font-weight:900;color:var(--water);">' + esc(b.value) + "</span></div>" +
              '<div class="growth-bar-track"><div class="growth-bar-fill ' + esc(b.colorClass) + '" style="width:' + b.fillPct + '%;"></div></div>' +
              '<p class="body-copy-sm" style="color:var(--ink-muted-light);">' + esc(b.note) + "</p></div>"
            );
          }).join("") +
          "</div>" +
          '<div class="card aral-card step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3">' +
          "<div><strong style=\"font-size:26px;\">" + esc(v.aralComparison.title) + renderLedgerPills(v.aralComparison.ledgerId) + "</strong>" +
          '<p class="body-copy-sm">' + esc(v.aralComparison.subtitle) + "</p></div>" +
          '<div class="aral-stage">' + renderAralSeaSVG(sliderVal) + "</div>" +
          '<div class="aral-slider-Row">' +
          "<span>1960</span>" +
          '<input id="aralRangeInput" class="aral-range" type="range" min="0" max="100" value="' + sliderVal + '" aria-label="Compare Aral Sea 1960 versus 2020s"/>' +
          "<span>2020s</span></div>" +
          '<p class="body-copy-sm" style="font-size:21px;color:var(--alert-ink);font-weight:700;">' + esc(v.aralComparison.lossLabel) + "</p>" +
          "</div></div>" +
          '<div class="s5-milestones">' +
          v.milestones.map(function (m) {
            return (
              '<div class="milestone-card step-reveal ' + (step >= m.step ? "is-visible" : "") + '" data-req-step="' + m.step + '">' +
              '<div style="font-size:19px;font-weight:900;color:var(--water);">' + esc(m.year) + renderLedgerPills(m.ledgerId) + "</div>" +
              '<div style="font-size:24px;font-weight:800;margin:3px 0;">' + esc(m.title) + "</div>" +
              '<p class="body-copy-sm" style="font-size:22px;">' + esc(m.desc) + "</p></div>"
            );
          }).join("") +
          "</div></div>"
        );

      case "production-consumption-web":
        return (
          '<div class="s6-grid" aria-label="' + esc(slide.altText) + '">' +
          v.nodes.map(function (n) {
            var tshirtHTML = n.tshirtSplit
              ? '<div class="tshirt-bar" role="img" aria-label="2700 liters split into 45 percent blue irrigation, 41 percent green rain, and 14 percent grey dilution">' +
                n.tshirtSplit.map(function (seg) {
                  return '<div class="tshirt-seg ' + esc(seg.cls) + '" style="width:' + seg.pct + '%;">' + esc(seg.label) + "</div>";
                }).join("") +
                "</div>"
              : "";
            return (
              '<div class="card s6-node accent-' + esc(n.accent) + " step-reveal " + (step >= n.step ? "is-visible" : "") + '" data-req-step="' + n.step + '">' +
              '<div style="display:flex;justify-content:space-between;align-items:baseline;">' +
              '<span class="chip-eyebrow" style="font-size:16px;">' + esc(n.icon + " " + n.tag) + renderLedgerPills(n.ledgerIds) + "</span>" +
              '<span class="kpi-large">' + esc(n.kpi) + "</span></div>" +
              '<p class="body-copy-sm" style="font-weight:700;">' + esc(n.kpiLabel) + "</p>" +
              tshirtHTML +
              '<p class="body-copy-sm">' + esc(n.bullets[0]) + "</p>" +
              "</div>"
            );
          }).join("") +
          "</div>"
        );

      case "accelerators-2026":
        return (
          '<div class="s7-grid" aria-label="' + esc(slide.altText) + '">' +
          /* Panel 1: El Niño */
          '<div class="card s7-panel step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1" style="border-top:6px solid var(--amber-bright);">' +
          "<div><div class=\"chip-eyebrow\">" + esc(v.elNinoPanel.badge) + renderLedgerPills(v.elNinoPanel.ledgerIds) + "</div>" +
          '<div style="font-size:30px;font-weight:800;margin-top:4px;">' + esc(v.elNinoPanel.title) + "</div></div>" +
          "<div><div class=\"kpi-large\" style=\"color:var(--amber-bright);\">" + esc(v.elNinoPanel.kpi) + "</div>" +
          '<p class="body-copy-sm" style="font-weight:700;">' + esc(v.elNinoPanel.subkpi) + "</p></div>" +
          '<p class="body-copy-sm">' + esc(v.elNinoPanel.bullets[0]) + "</p>" +
          '<p class="body-copy-sm" style="color:#FDE68A;">' + esc(v.elNinoPanel.bullets[1]) + "</p>" +
          "</div>" +
          /* Panel 2: AI & Data Centers */
          '<div class="card s7-panel step-reveal ' + (step >= 2 ? "is-visible" : "") + '" data-req-step="2" style="border-top:6px solid var(--water-bright);">' +
          "<div><div class=\"chip-eyebrow\" style=\"color:var(--water-bright);\">" + esc(v.aiPanel.badge) + renderLedgerPills(v.aiPanel.ledgerIds) + "</div>" +
          '<div style="font-size:30px;font-weight:800;margin-top:4px;">' + esc(v.aiPanel.title) + "</div></div>" +
          "<div><div class=\"kpi-large\" style=\"color:var(--water-bright);\">" + esc(v.aiPanel.kpi) + "</div>" +
          '<p class="body-copy-sm" style="font-weight:700;">' + esc(v.aiPanel.subkpi) + "</p></div>" +
          '<div class="pool-pill">🏊 ' + esc(v.aiPanel.poolsCalc) + "</div>" +
          '<p class="body-copy-sm">' + esc(v.aiPanel.bullets[0]) + " <strong>" + esc(v.aiPanel.bullets[1]) + "</strong></p>" +
          "</div>" +
          /* Panel 3: Contaminantes emergentes */
          '<div class="card s7-panel step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3" style="border-top:6px solid var(--alert-bright);">' +
          "<div><div class=\"chip-eyebrow\" style=\"color:var(--alert-bright);\">" + esc(v.contaminantsPanel.badge) + renderLedgerPills(v.contaminantsPanel.ledgerIds) + "</div>" +
          '<div style="font-size:30px;font-weight:800;margin-top:4px;">' + esc(v.contaminantsPanel.title) + "</div></div>" +
          renderUVGlassSVG(step >= 3) +
          '<div class="law-compare-box law-eu"><strong>✓ ' + esc(v.contaminantsPanel.euRule) + "</strong></div>" +
          '<div class="law-compare-box law-us"><strong>▲ ' + esc(v.contaminantsPanel.usRule) + "</strong></div>" +
          "</div></div>"
        );

      case "health-inequality-split":
        return (
          '<div class="s8-grid" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s8-col">' +
          '<div class="card step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1" style="border-left:7px solid var(--alert);">' +
          '<div class="kpi-huge" style="color:var(--alert-ink);">' + esc(v.healthColumn.washDeaths.kpi) + renderLedgerPills(v.healthColumn.washDeaths.ledgerId) + "</div>" +
          '<p class="body-copy" style="font-weight:800;">' + esc(v.healthColumn.washDeaths.label) + "</p>" +
          '<p class="body-copy-sm">' + esc(v.healthColumn.washDeaths.sub) + "</p></div>" +
          v.healthColumn.chemicalRisks.map(function (cr) {
            return (
              '<div class="card ' + (cr.uncertain ? "uncertain-card" : "") + " step-reveal " + (step >= 2 ? "is-visible" : "") + '" data-req-step="2" style="padding:18px 24px;">' +
              '<div class="chip-eyebrow" style="color:' + (cr.uncertain ? "var(--amber-ink)" : "var(--alert-ink)") + ';">' +
              esc(cr.badge) + renderLedgerPills(cr.ledgerId) + "</div>" +
              '<div style="font-size:27px;font-weight:800;margin:4px 0;">' + esc(cr.title) + "</div>" +
              '<p class="body-copy-sm">' + esc(cr.detail) + "</p></div>"
            );
          }).join("") +
          "</div>" +
          '<div class="s8-col">' +
          '<div class="card step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3" style="display:flex;align-items:center;gap:24px;">' +
          renderHoursClockSVG(step >= 3) +
          "<div><div class=\"kpi-huge\" style=\"color:var(--amber-ink);\">" + esc(v.dailyColumn.hoursClock.kpi) + renderLedgerPills(v.dailyColumn.hoursClock.ledgerId) + "</div>" +
          '<div style="font-size:26px;font-weight:800;">' + esc(v.dailyColumn.hoursClock.unit) + " — " + esc(v.dailyColumn.hoursClock.label) + "</div>" +
          '<p class="body-copy-sm">' + esc(v.dailyColumn.hoursClock.source) + "</p></div></div>" +
          '<div class="card step-reveal ' + (step >= 4 ? "is-visible" : "") + '" data-req-step="4">' +
          '<div style="font-size:26px;font-weight:800;margin-bottom:14px;">' + esc(v.dailyColumn.ruralGapBars.title) + renderLedgerPills(v.dailyColumn.ruralGapBars.ledgerId) + "</div>" +
          '<div class="irca-bar-row"><span style="width:130px;">Urban</span><div class="irca-track"><div class="irca-fill-urban" style="width:56%;"></div></div><span style="width:88px;text-align:right;">56%</span></div>' +
          '<div class="irca-bar-row" style="margin-top:14px;"><span style="width:130px;color:var(--alert-ink);">▲ Rural</span><div class="irca-track"><div class="irca-fill-rural" style="width:9.7%;"></div></div><span style="width:88px;text-align:right;color:var(--alert-ink);">9.7%</span></div>' +
          "</div></div></div>"
        );

      case "colombia-hologram":
        return (
          '<div class="s9-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s9-paradox-bar step-reveal ' + (step >= 1 ? "is-visible" : "") + '" data-req-step="1">' +
          '<div style="display:flex;align-items:baseline;gap:14px;"><span class="kpi-large" style="color:var(--water);white-space:nowrap;">' +
          esc(v.paradoxBanner.yieldKpi) + "</span>" + renderLedgerPills(v.paradoxBanner.ledgerIds) + "</div>" +
          '<div><p class="body-copy-sm" style="font-weight:700;">' + esc(v.paradoxBanner.yieldNote) + "</p>" +
          '<p class="body-copy-sm" style="color:var(--ink-muted-light);">' + esc(v.paradoxBanner.reservoirNote) + "</p></div></div>" +
          '<div class="s9-main-grid">' +
          '<div class="card s9-map-card">' +
          renderColombiaMapSVG(step, state.activeColombiaPin, v.pins) +
          '<span style="font-size:16px;font-weight:700;color:var(--ink-muted-light);">Click any pin (1–3) to highlight</span>' +
          "</div>" +
          '<div class="s9-pins-stack">' +
          v.pins.map(function (p) {
            var isHi = state.activeColombiaPin === p.pinNumber;
            return (
              '<div class="card s9-pin-card ' + (isHi ? "is-highlighted" : "") + " step-reveal " + (step >= p.step ? "is-visible" : "") + '" data-req-step="' + p.step + '" data-pin-card="' + p.pinNumber + '">' +
              '<div style="display:flex;justify-content:space-between;align-items:baseline;">' +
              '<span class="chip-eyebrow" style="color:var(--water);">Pin ' + p.pinNumber + " · " + esc(p.region) + " ↔ " + esc(p.globalDriver) + renderLedgerPills(p.ledgerIds) + "</span>" +
              '<span style="font-size:28px;font-weight:900;color:var(--alert-ink);">' + esc(p.kpi) + "</span></div>" +
              '<div style="font-size:26px;font-weight:800;margin:2px 0 4px;">' + esc(p.icon + " " + p.title) + "</div>" +
              '<p class="body-copy-sm" style="font-size:23px;">' + esc(p.detail) + "</p></div>"
            );
          }).join("") +
          "</div></div></div>"
        );

      case "hypotheses-cards":
        return (
          '<div class="s10-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="rubric-banner">◆ ' + esc(v.rubricTag) + "</div>" +
          '<div class="s10-cards-grid">' +
          v.cards.map(function (c) {
            var flipped = step >= c.step;
            return (
              '<div class="flip-card ' + (flipped ? "is-flipped" : "") + '" data-flip-card="' + c.step + '" tabindex="0" role="button" aria-label="Hypothesis ' + esc(c.number) + ": " + esc(c.backTitle) + '">' +
              '<div class="flip-card-inner">' +
              '<div class="flip-face flip-front">' +
              '<div style="font-size:52px;font-weight:900;color:var(--water-bright);">?' + esc(c.number) + "</div>" +
              '<p class="body-copy" style="font-weight:800;font-size:28px;">' + esc(c.frontQuestion) + "</p>" +
              '<p class="body-copy-sm" style="color:var(--ink-muted-dark);">' + esc(c.frontClue) + "</p>" +
              '<span class="chip-eyebrow">Press → or click to reveal cultural hypothesis</span>' +
              "</div>" +
              '<div class="flip-face flip-back">' +
              "<div><div class=\"chip-eyebrow\">Hypothesis " + esc(c.number) + " · Cultural Decision" + renderLedgerPills(c.ledgerIds) + "</div>" +
              '<div style="font-size:31px;font-weight:900;margin-top:6px;color:#FFFFFF;">' + esc(c.backTitle) + "</div></div>" +
              '<p class="body-copy" style="font-size:26px;line-height:1.45;">' + highlightB2Grammar(c.backStatement) + "</p>" +
              '<div style="font-size:17px;font-weight:700;color:var(--amber-bright);">B2 Modal: ' + esc(c.modalHighlight) + "</div>" +
              "</div></div></div>"
            );
          }).join("") +
          "</div>" +
          '<div class="card step-reveal ' + (step >= 4 ? "is-visible" : "") + '" data-req-step="4" style="padding:16px 26px;border-color:var(--amber-bright);text-align:center;">' +
          '<p class="body-copy" style="font-weight:700;">' + esc(v.synthesisBar) + "</p></div></div>"
        );

      case "regrets-and-hope":
        return (
          '<div class="s11-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="rubric-banner">▲ ' + esc(v.rubricTag) + "</div>" +
          '<div class="s11-regrets-grid">' +
          v.regrets.map(function (r) {
            return (
              '<div class="card regret-card step-reveal ' + (step >= r.step ? "is-visible" : "") + '" data-req-step="' + r.step + '">' +
              "<div><div class=\"chip-eyebrow\" style=\"color:var(--alert-ink);\">" + esc(r.grammarTag) + renderLedgerPills(r.ledgerIds) + "</div>" +
              '<div style="font-size:28px;font-weight:800;margin-top:4px;">' + esc(r.icon + " " + r.place) + "</div></div>" +
              '<p class="body-copy-sm" style="font-size:24px;line-height:1.44;">' + highlightB2Grammar(r.statement) + "</p>" +
              "</div>"
            );
          }).join("") +
          "</div>" +
          '<div class="hope-strip step-reveal ' + (step >= 4 ? "is-visible" : "") + '" data-req-step="4">' +
          '<div class="hope-head">' + esc(v.hopeStrip.tag) + "</div>" +
          v.hopeStrip.cases.map(function (hc) {
            return (
              "<div><strong style=\"font-size:26px;color:var(--plants-ink);\">✓ " + esc(hc.title) + renderLedgerPills(hc.ledgerId) + "</strong>" +
              '<p class="body-copy-sm" style="margin-top:4px;">' + esc(hc.detail) + "</p></div>"
            );
          }).join("") +
          "</div></div>"
        );

      case "closing-circle":
        return (
          '<div class="s12-layout" aria-label="' + esc(slide.altText) + '">' +
          '<div class="s12-center-grid">' +
          '<div class="card step-reveal ' + (step >= 2 ? "is-visible" : "") + '" data-req-step="2" style="border-left:6px solid var(--amber-bright);">' +
          '<div style="font-size:26px;font-weight:800;color:var(--amber-bright);margin-bottom:10px;">' + esc(v.uncertaintiesCard.title) + renderLedgerPills(v.uncertaintiesCard.ledgerIds) + "</div>" +
          '<p class="body-copy-sm" style="margin-bottom:12px;">• ' + esc(v.uncertaintiesCard.items[0]) + "</p>" +
          '<p class="body-copy-sm">• ' + esc(v.uncertaintiesCard.items[1]) + "</p>" +
          "</div>" +
          '<div style="display:flex;flex-direction:column;align-items:center;">' +
          renderHeroLivingCircleSVG(true, step) +
          '<p class="body-copy-sm" style="text-align:center;color:#BAE6FD;font-weight:600;">' + esc(v.angelMayaQuote) + renderLedgerPills("L-06") + "</p>" +
          "</div>" +
          '<div class="card step-reveal ' + (step >= 3 ? "is-visible" : "") + '" data-req-step="3" style="border-left:6px solid var(--water-bright);">' +
          '<div class="chip-eyebrow" style="color:var(--water-bright);">' + esc(v.milestoneCard.title) + renderLedgerPills(v.milestoneCard.ledgerIds) + "</div>" +
          '<div style="font-size:30px;font-weight:900;margin:6px 0;">' + esc(v.milestoneCard.event) + "</div>" +
          '<p class="body-copy-sm" style="color:#FEF08A;font-weight:700;margin-bottom:8px;">' + esc(v.milestoneCard.whenWhere) + "</p>" +
          '<p class="body-copy-sm">' + esc(v.milestoneCard.note) + "</p>" +
          "</div></div>" +
          '<div class="step-reveal ' + (step >= 4 ? "is-visible" : "") + '" data-req-step="4">' +
          '<div class="s12-actions-bar">' +
          v.actions.map(function (a) {
            return (
              '<div class="action-pill"><span class="action-verb">' + esc(a.verb) + '</span><span class="body-copy-sm">' + esc(a.text) + "</span></div>"
            );
          }).join("") +
          "</div>" +
          '<p style="text-align:center;font-size:28px;font-weight:800;margin:14px 0 0;color:#FFFFFF;">' + esc(v.closingLine) + "</p>" +
          "</div></div>"
        );

      case "sources-annex":
        var groups = slide.groups.filter(function (g) {
          return state.sourcesFilter === "all" || g.id === state.sourcesFilter;
        });
        return (
          '<div class="sources-layout">' +
          '<div class="sources-filter-bar">' +
          '<button type="button" class="filter-btn ' + (state.sourcesFilter === "all" ? "is-selected" : "") + '" data-src-filter="all">All Blocks (Slides 1–12)</button>' +
          '<button type="button" class="filter-btn ' + (state.sourcesFilter === "part1" ? "is-selected" : "") + '" data-src-filter="part1">Part I · Theory (1–3)</button>' +
          '<button type="button" class="filter-btn ' + (state.sourcesFilter === "part2a" ? "is-selected" : "") + '" data-src-filter="part2a">Part II-A · Global &amp; History (4–6)</button>' +
          '<button type="button" class="filter-btn ' + (state.sourcesFilter === "part2b" ? "is-selected" : "") + '" data-src-filter="part2b">Part II-B &amp; III · 2026 &amp; Colombia (7–12)</button>' +
          "</div>" +
          '<div class="sources-grid" style="grid-template-columns:repeat(' + groups.length + ', 1fr);">' +
          groups.map(function (g) {
            return (
              '<div class="source-group-card">' +
              '<div style="font-size:20px;font-weight:800;color:var(--water);margin-bottom:8px;">' + esc(g.heading) + "</div>" +
              g.entries.map(function (e) {
                return (
                  '<div class="source-item">' +
                  "<strong>[Slides " + esc(e.slides) + "] " + esc(e.org) + " (" + esc(e.year) + "):</strong> " +
                  esc(e.title) + renderLedgerPills(e.ledger) +
                  "</div>"
                );
              }).join("") +
              "</div>"
            );
          }).join("") +
          "</div></div>"
        );

      default:
        return "";
    }
  }

  /**
   * Construye la franja contextual inferior (Colombia Zoom + Which cultural decision?) en diapositivas 4–9.
   * @param {Object} slide Diapositiva actual.
   * @param {number} step Paso actual.
   * @returns {string} HTML de la franja inferior.
   */
  function buildContextStripHTML(slide, step) {
    var hasCol = Boolean(slide.colombiaZoom);
    var hasDec = Boolean(slide.culturalDecision);
    if (!hasCol && !hasDec) return "<div></div>";

    var revealStep = slide.maxSteps;
    var visClass = step >= revealStep ? "is-visible" : "";
    var colHTML = "";
    if (hasCol) {
      colHTML =
        '<div class="colombia-chip step-reveal ' + visClass + '" data-req-step="' + revealStep + '">' +
        '<div class="colombia-flag-bar" aria-hidden="true"></div>' +
        "<div><div class=\"chip-eyebrow\">" + esc(slide.colombiaZoom.title) + " · " + esc(slide.colombiaZoom.metric) + renderLedgerPills(slide.colombiaZoom.ledgerIds) + "</div>" +
        '<div class="chip-body">' + esc(slide.colombiaZoom.detail) + "</div></div></div>";
    }
    var decHTML = "";
    if (hasDec) {
      decHTML =
        '<div class="decision-chip step-reveal ' + visClass + '" data-req-step="' + revealStep + '">' +
        "<div><div class=\"chip-eyebrow\">◆ Which cultural decision? (Ángel Maya lens)</div>" +
        '<div class="chip-body">' + esc(slide.culturalDecision) + "</div></div></div>";
    }

    return (
      '<div class="context-strip ' + (!hasCol || !hasDec ? "single-col" : "") + '">' +
      colHTML +
      decHTML +
      "</div>"
    );
  }

  /**
   * Construye el HTML completo de un lienzo 1920×1080 para una diapositiva y paso dados.
   * @param {Object} slide Objeto de diapositiva.
   * @param {number} step Paso actual de animación.
   * @param {boolean} animateEntry True si cambia de diapositiva.
   * @returns {string} HTML completo de `.slide-canvas`.
   */
  function buildSlideCanvasHTML(slide, step, animateEntry) {
    if (slide.layout === "intro-world") {
      return buildIntroCanvasHTML(slide);
    }
    var isHeroCircle = !slide.livingCircleState || slide.livingCircleState.mode.indexOf("hero") === 0;
    var activeBadges = slide.activeBadges || [];

    var badgesHTML = DATA.theoryBadges
      .map(function (b) {
        var on = activeBadges.indexOf(b.id) !== -1 && (slide.id !== 2 || step >= 3);
        return (
          '<span class="theory-badge ' + (on ? "is-active" : "") + '" title="' + esc(b.tooltip) + '">' +
          '<span class="badge-sym">' + esc(b.symbol) + "</span><span>" + esc(b.label) + "</span></span>"
        );
      })
      .join("");

    var dotsHTML = "";
    for (var s = 1; s <= (slide.maxSteps || 0); s++) {
      dotsHTML += '<span class="step-dot ' + (step >= s ? "is-done" : "") + '"></span>';
    }

    var slideCounterText = slide.id <= 12
      ? "Slide " + slide.id + " / " + DATA.meta.totalMainSlides
      : "Sources Annex (13)";

    var progressRatio = slide.id <= 12
      ? (slide.id - 1 + (slide.maxSteps ? step / slide.maxSteps : 1)) / DATA.meta.totalMainSlides
      : 1;

    return (
      '<section class="slide-canvas theme-' + esc(slide.theme) + '" aria-live="polite">' +
      '<header class="slide-header">' +
      '<div class="header-left">' +
      '<div class="living-circle-mini ' + (isHeroCircle ? "is-hidden-hero" : "") + '" title="' +
      esc(slide.livingCircleState ? slide.livingCircleState.caption : "") + '">' +
      (isHeroCircle ? "" : renderMiniLivingCircleSVG(slide.livingCircleState.mode)) +
      "</div>" +
      '<div class="title-block">' +
      '<div class="part-eyebrow"><span>' + esc(slide.part) + "</span></div>" +
      '<h1 class="slide-title">' + esc(slide.title) + "</h1>" +
      "</div></div>" +
      '<div class="header-right">' +
      (slide.stamp2026 ? '<span class="stamp-2026">● ' + esc(slide.stamp2026) + "</span>" : "") +
      (slide.id <= 12 ? '<div class="theory-badges" aria-label="Complexity badges">' + badgesHTML + "</div>" : "") +
      "</div></header>" +
      '<main class="slide-main ' + (animateEntry ? "slide-body-enter" : "") + '">' +
      buildSlideMainHTML(slide, step) +
      "</main>" +
      buildContextStripHTML(slide, step) +
      '<footer class="slide-footer">' +
      "<div>" + esc(slide.footerSources || "All sources verified against primary documents (cutoff: 2026-10-29).") + "</div>" +
      '<div class="footer-meta">' +
      (dotsHTML ? '<span class="step-dots" aria-label="Animation steps">' + dotsHTML + "</span>" : "") +
      "<span>" + esc(slideCounterText) + "</span>" +
      "</div></footer>" +
      '<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="transform:scaleX(' +
      Math.max(0.03, Math.min(1, progressRatio)).toFixed(4) +
      ');"></div></div>' +
      "</section>"
    );
  }

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / presentacion
   * @Propósito: Lienzo 1920×1080 de la diapositiva 0; solo deja un contenedor donde js/mundo-intro.js monta la animación.
   * @Capa: Funcional
   * @Riesgo_Evaluado: Bajo - rama nueva y aislada; no toca las 12 diapositivas existentes
   * @param {Object} slide Diapositiva 0 (DATA.introSlide).
   * @returns {string} HTML del lienzo.
   */
  function buildIntroCanvasHTML(slide) {
    return (
      '<section class="slide-canvas intro-canvas" aria-label="' + esc(slide.altText) + '">' +
      '<div id="miMount" class="mi-stage"></div>' +
      "</section>"
    );
  }

  /**
   * Conecta los listeners interactivos propios de la diapositiva activa y limpia los anteriores.
   * @param {Object} slide Diapositiva actual.
   * @returns {void}
   */
  function attachPerSlideInteractions(slide) {
    if (slideAbortController) {
      slideAbortController.abort();
    }
    slideAbortController = new AbortController();
    var sig = slideAbortController.signal;

    /* Deslizador interactivo del Mar de Aral (Diapositiva 5) */
    if (slide.id === 5) {
      var range = document.getElementById("aralRangeInput");
      if (range) {
        range.addEventListener(
          "input",
          function (ev) {
            state.aralSliderPct = Number(ev.target.value);
            var splitX = Math.round(520 * (1 - state.aralSliderPct / 100));
            var clipRect = document.getElementById("aralClipRect");
            var divLine = document.getElementById("aralDividerLine");
            var knob = document.getElementById("aralDividerKnob");
            if (clipRect) clipRect.setAttribute("width", String(splitX));
            if (divLine) {
              divLine.setAttribute("x1", String(splitX));
              divLine.setAttribute("x2", String(splitX));
            }
            if (knob) knob.setAttribute("cx", String(splitX));
          },
          { signal: sig }
        );
      }
    }

    /* Pines interactivos del mapa de Colombia (Diapositiva 9) */
    if (slide.id === 9) {
      var pinEls = dom.scaler.querySelectorAll("[data-pin], [data-pin-card]");
      pinEls.forEach(function (el) {
        el.addEventListener(
          "click",
          function (ev) {
            ev.stopPropagation();
            var num = Number(el.getAttribute("data-pin") || el.getAttribute("data-pin-card"));
            state.activeColombiaPin = state.activeColombiaPin === num ? 0 : num;
            if (state.step < num + 1) {
              state.step = num + 1;
            }
            renderCurrentSlide(false);
          },
          { signal: sig }
        );
      });
    }

    /* Tarjetas 3D volteables manualmente en Q&A (Diapositiva 10) */
    if (slide.id === 10) {
      var cards = dom.scaler.querySelectorAll("[data-flip-card]");
      cards.forEach(function (card) {
        card.addEventListener(
          "click",
          function (ev) {
            ev.stopPropagation();
            card.classList.toggle("is-flipped");
          },
          { signal: sig }
        );
      });
    }

    /* Filtros de fuentes (Diapositiva 13) */
    if (slide.id === 13) {
      var btns = dom.scaler.querySelectorAll("[data-src-filter]");
      btns.forEach(function (btn) {
        btn.addEventListener(
          "click",
          function (ev) {
            ev.stopPropagation();
            state.sourcesFilter = btn.getAttribute("data-src-filter") || "all";
            renderCurrentSlide(false);
          },
          { signal: sig }
        );
      });
    }
  }

  /**
   * Renderiza la diapositiva activa, actualiza el panel del orador, el hash URL y sincroniza ventanas.
   * @param {boolean} animateEntry True cuando se cambia de número de diapositiva.
   * @returns {void}
   */
  function renderCurrentSlide(animateEntry) {
    var slide = ALL_SLIDES[state.slideIndex];
    if (!slide) return;

    if (dom.scaler) {
      dom.scaler.innerHTML = buildSlideCanvasHTML(slide, state.step, animateEntry);
      attachPerSlideInteractions(slide);
      /* Diapositiva 0: monta (y reinicia al entrar) o detiene la animación del mundo */
      if (window.MundoIntro) {
        if (slide.id === 0) {
          window.MundoIntro.mount(document.getElementById("miMount"), animateEntry);
        } else {
          window.MundoIntro.unmount();
        }
      }
    }

    renderSpeakerPanel(slide);
    renderGridSelection();
    updateUrlHash(slide);
    broadcastSyncState();
  }

  /**
   * Actualiza el panel del Modo Orador (notas en español, guion B2 sincronizado al paso, pronunciación y recortes).
   * @param {Object} slide Diapositiva actual.
   * @returns {void}
   */
  function renderSpeakerPanel(slide) {
    if (!dom.speakerContent) return;
    updateTimerDisplay();

    if (!slide.speaker) {
      dom.speakerContent.innerHTML =
        '<div class="sp-section"><h4>Sources Annex</h4>' +
        '<p class="sp-step-line is-current-step">Use the filter pills to show primary references by thematic block during professor Q&amp;A.</p></div>' +
        buildQASectionHTML();
      return;
    }

    var sp = slide.speaker;
    var stepsHTML = sp.englishSteps
      .map(function (line, idx) {
        var active = idx === state.step || (state.step >= sp.englishSteps.length && idx === sp.englishSteps.length - 1);
        return '<p class="sp-step-line ' + (active ? "is-current-step" : "") + '">' + esc(line) + "</p>";
      })
      .join("");

    var pronHTML = (sp.pronunciation || [])
      .map(function (p) {
        return '<span class="sp-pron-chip"><strong>' + esc(p.word) + "</strong>: " + esc(p.ipa) + "</span>";
      })
      .join("");

    dom.speakerContent.innerHTML =
      (sp.propCue
        ? '<div class="sp-section" style="border-color:var(--amber-bright);background:rgba(242,160,61,0.14);"><h4>🥛 Prop Cue</h4><div style="font-size:14px;">' +
          esc(sp.propCue) + "</div></div>"
        : "") +
      '<div class="sp-section sp-rescue"><h4>🇨🇴 Nota de rescate (en tus palabras)</h4><div>' +
      esc(sp.spanishNotes) +
      "</div></div>" +
      '<div class="sp-section"><h4>🇬🇧 English B2 Script (Step ' +
      state.step +
      "/" +
      slide.maxSteps +
      " · " +
      slide.wordCount +
      " words)</h4>" +
      stepsHTML +
      "</div>" +
      '<div class="sp-section"><h4>🗣 Pronunciation</h4><div>' +
      pronHTML +
      "</div></div>" +
      '<div class="sp-section"><h4>⏱ Time Adjustments</h4>' +
      '<div style="font-size:13px;line-height:1.45;"><strong>Si vas largo:</strong> ' +
      esc(sp.timeCuts.ifLong) +
      "<br><strong>Si vas corto:</strong> " +
      esc(sp.timeCuts.ifShort) +
      "</div></div>" +
      buildQASectionHTML();
  }

  /**
   * Construye el bloque desplegable con las 6 preguntas probables del profesor dentro del modo orador.
   * @returns {string} HTML del banco Q&A.
   */
  function buildQASectionHTML() {
    return (
      '<details class="sp-section"><summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--amber-bright);">Professor Q&amp;A Bank (6 ready answers)</summary>' +
      '<div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;">' +
      DATA.qaBank
        .map(function (item, idx) {
          return (
            '<div style="font-size:13px;line-height:1.4;"><strong>Q' +
            (idx + 1) +
            ": " +
            esc(item.q) +
            '</strong><div style="color:#CBD5E1;margin-top:2px;">' +
            esc(item.a) +
            "</div></div>"
          );
        })
        .join("") +
      "</div></details>"
    );
  }

  /**
   * Actualiza los contadores del cronómetro (diapositiva actual vs asignado y acumulado vs 15:00).
   * @returns {void}
   */
  function updateTimerDisplay() {
    var slide = ALL_SLIDES[state.slideIndex];
    if (!dom.timerSlide || !dom.timerTotal || !dom.timerBar) return;
    var assigned = (slide && slide.assignedSeconds) || 0;
    dom.timerSlide.textContent = formatTime(state.slideElapsedSec) + " / " + formatTime(assigned);
    dom.timerTotal.textContent = formatTime(state.totalElapsedSec) + " / 15:00";

    var overSlide = assigned > 0 && state.slideElapsedSec > assigned;
    var overTotal = state.totalElapsedSec > DATA.meta.totalDurationSeconds;
    dom.timerBar.classList.toggle("is-overtime", overSlide || overTotal);
    if (dom.timerToggleBtn) {
      dom.timerToggleBtn.textContent = state.timerRunning ? "Pause" : "Start";
    }
  }

  /**
   * Inicia o pausa el cronómetro del orador.
   * @returns {void}
   */
  function toggleTimer() {
    state.timerRunning = !state.timerRunning;
    if (state.timerRunning && !state.timerIntervalId) {
      state.timerIntervalId = window.setInterval(function () {
        state.totalElapsedSec += 1;
        state.slideElapsedSec += 1;
        updateTimerDisplay();
      }, 1000);
    } else if (!state.timerRunning && state.timerIntervalId) {
      window.clearInterval(state.timerIntervalId);
      state.timerIntervalId = null;
    }
    updateTimerDisplay();
  }

  /**
   * Reinicia a cero el cronómetro acumulado y el de la diapositiva.
   * @returns {void}
   */
  function resetTimer() {
    state.totalElapsedSec = 0;
    state.slideElapsedSec = 0;
    updateTimerDisplay();
  }

  /**
   * Navega a un índice de diapositiva y paso específicos.
   * @param {number} targetIndex Índice en ALL_SLIDES (0..12).
   * @param {number} [targetStep=0] Paso inicial dentro de la diapositiva.
   * @returns {void}
   */
  function goToSlide(targetIndex, targetStep) {
    var clampedIndex = Math.max(0, Math.min(ALL_SLIDES.length - 1, targetIndex));
    var changedSlide = clampedIndex !== state.slideIndex;
    var slide = ALL_SLIDES[clampedIndex];
    var maxSteps = slide.maxSteps || 0;

    state.slideIndex = clampedIndex;
    state.step = Math.max(0, Math.min(maxSteps, targetStep == null ? 0 : targetStep));

    if (changedSlide) {
      state.slideElapsedSec = 0;
      state.activeColombiaPin = 0;
      state.aralSliderPct = state.step >= 3 ? 88 : 14;
    } else if (slide.id === 5) {
      state.aralSliderPct = state.step >= 3 ? 88 : 14;
    }

    renderCurrentSlide(changedSlide);
  }

  /**
   * Avanza un paso de animación dentro de la diapositiva actual, o pasa a la siguiente diapositiva.
   * @returns {void}
   */
  function stepForward() {
    var slide = ALL_SLIDES[state.slideIndex];
    if (state.step < (slide.maxSteps || 0)) {
      goToSlide(state.slideIndex, state.step + 1);
    } else if (state.slideIndex < ALL_SLIDES.length - 1) {
      goToSlide(state.slideIndex + 1, 0);
    }
  }

  /**
   * Retrocede un paso de animación o vuelve al último paso de la diapositiva anterior.
   * @returns {void}
   */
  function stepBackward() {
    if (state.step > 0) {
      goToSlide(state.slideIndex, state.step - 1);
    } else if (state.slideIndex > 0) {
      var prev = ALL_SLIDES[state.slideIndex - 1];
      goToSlide(state.slideIndex - 1, prev.maxSteps || 0);
    }
  }

  /**
   * Muestra u oculta el panel lateral del Modo Orador (tecla N) y recalcula la escala 16:9.
   * @param {boolean} [force] Valor booleano opcional.
   * @returns {void}
   */
  function toggleSpeakerMode(force) {
    state.speakerOpen = typeof force === "boolean" ? force : !state.speakerOpen;
    if (dom.speakerPanel) {
      dom.speakerPanel.classList.toggle("is-open", state.speakerOpen);
    }
    if (dom.btnSpeaker) {
      dom.btnSpeaker.classList.toggle("is-active", state.speakerOpen);
    }
    window.requestAnimationFrame(updateStageScale);
  }

  /**
   * Abre una segunda ventana sincronizada dedicada exclusivamente a las notas del orador.
   * @returns {void}
   */
  function openSecondarySpeakerWindow() {
    var base = window.location.href.split("#")[0].split("?")[0];
    var hash = window.location.hash || "#1";
    window.open(base + "?speaker=1" + hash, "AguaSpeakerWindow", "width=520,height=820");
  }

  /**
   * Muestra u oculta la cuadrícula/índice de las 12 diapositivas + fuentes (tecla G).
   * @param {boolean} [force] Estado forzado opcional.
   * @returns {void}
   */
  function toggleGridOverlay(force) {
    state.gridOpen = typeof force === "boolean" ? force : !state.gridOpen;
    if (dom.gridOverlay) {
      dom.gridOverlay.classList.toggle("is-open", state.gridOpen);
    }
    if (dom.btnGrid) {
      dom.btnGrid.classList.toggle("is-active", state.gridOpen);
    }
  }

  /**
   * Activa o sale de pantalla completa (tecla F) manejando restricciones del navegador.
   * @returns {void}
   */
  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(function () {});
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    } catch (_err) {
      /* Ignorar si el entorno restringe Fullscreen sin gesto directo */
    }
  }

  /**
   * Construye las tarjetas miniatura dentro de la superposición de cuadrícula (G).
   * @returns {void}
   */
  function buildGridCards() {
    if (!dom.gridCards) return;
    dom.gridCards.innerHTML = ALL_SLIDES.map(function (s, idx) {
      var timeTag = s.id <= 12 ? formatTime(s.assignedSeconds) + " · " + s.wordCount + "w" : "Bibliography";
      return (
        '<button type="button" class="grid-thumb" data-grid-idx="' + idx + '">' +
        '<div style="display:flex;justify-content:space-between;width:100%;font-size:13px;color:var(--water-bright);font-weight:800;">' +
        "<span>" + (s.id === 0 ? "OPENING" : s.id <= 12 ? "SLIDE " + s.id : "ANNEX") + "</span><span>" + esc(timeTag) + "</span></div>" +
        '<div style="font-size:19px;font-weight:800;line-height:1.25;">' + esc(s.title) + "</div>" +
        '<div style="font-size:13px;color:#94A3B8;">' + esc(s.part) + "</div>" +
        "</button>"
      );
    }).join("");

    dom.gridCards.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-grid-idx]");
      if (!btn) return;
      var idx = Number(btn.getAttribute("data-grid-idx"));
      toggleGridOverlay(false);
      goToSlide(idx, 0);
    });
  }

  /**
   * Actualiza el borde activo de la diapositiva actual en la cuadrícula (G).
   * @returns {void}
   */
  function renderGridSelection() {
    if (!dom.gridCards) return;
    var thumbs = dom.gridCards.querySelectorAll("[data-grid-idx]");
    thumbs.forEach(function (el) {
      el.classList.toggle("is-current", Number(el.getAttribute("data-grid-idx")) === state.slideIndex);
    });
  }

  /**
   * Sincroniza el hash de la URL (#1..#12 o #sources) sin ensuciar el historial.
   * @param {Object} slide Diapositiva actual.
   * @returns {void}
   */
  function updateUrlHash(slide) {
    var targetHash = slide.id === 13 ? "#sources" : "#" + slide.id;
    if (window.location.hash !== targetHash) {
      try {
        window.history.replaceState(null, "", targetHash);
      } catch (_e) {
        window.location.hash = targetHash;
      }
    }
  }

  /**
   * Lee el hash inicial de la URL (#7, #12, #sources) y posiciona la diapositiva correspondiente.
   * @returns {void}
   */
  function applyHashFromLocation() {
    var raw = (window.location.hash || "").replace(/^#/, "").trim().toLowerCase();
    if (!raw) return;
    if (raw === "sources" || raw === "13") {
      state.slideIndex = ALL_SLIDES.length - 1;
      state.step = 0;
      return;
    }
    var n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0 && n <= 12) {
      state.slideIndex = n; // el índice en ALL_SLIDES coincide con slide.id (0 = gancho)
      state.step = 0;
    }
  }

  /**
   * Envía el estado actual a cualquier ventana secundaria de orador abierta.
   * @returns {void}
   */
  function broadcastSyncState() {
    var payload = { slideIndex: state.slideIndex, step: state.step, ts: Date.now() };
    if (syncChannel) {
      try {
        syncChannel.postMessage(payload);
      } catch (_e) {}
    }
    try {
      window.localStorage.setItem("agua_presentacion_sync_state", JSON.stringify(payload));
    } catch (_e2) {}
  }

  /**
   * Genera la versión estática completa de impresión (@media print), con guion opcional si Modo Orador está activo.
   * @returns {void}
   */
  function populatePrintDeck() {
    if (!dom.printDeck) return;
    var includeNotes = state.speakerOpen;
    dom.printDeck.innerHTML = ALL_SLIDES.filter(function (s) { return s.id !== 0; }).map(function (s) {
      var slidePage = '<div class="print-page">' + buildSlideCanvasHTML(s, s.maxSteps || 0, false) + "</div>";
      if (!includeNotes || !s.speaker) return slidePage;
      var notesPage =
        '<div class="print-notes-page">' +
        "<h2>Slide " + s.id + ": " + esc(s.title) + " (" + formatTime(s.assignedSeconds) + ")</h2>" +
        "<p><strong>English B2 Script:</strong> " + esc(s.speaker.englishSteps.join(" ")) + "</p>" +
        "<p><strong>Nota en español:</strong> " + esc(s.speaker.spanishNotes) + "</p>" +
        "</div>";
      return slidePage + notesPage;
    }).join("");
  }

  /**
   * Registra los atajos globales de teclado, gestos táctiles, cambio de hash e impresión.
   * @returns {void}
   */
  function bindGlobalEvents() {
    window.addEventListener("resize", updateStageScale);

    window.addEventListener("hashchange", function () {
      applyHashFromLocation();
      renderCurrentSlide(true);
    });

    window.addEventListener("beforeprint", populatePrintDeck);

    if (syncChannel) {
      syncChannel.addEventListener("message", function (ev) {
        if (!ev.data) return;
        if (ev.data.slideIndex !== state.slideIndex || ev.data.step !== state.step) {
          state.slideIndex = ev.data.slideIndex;
          state.step = ev.data.step;
          renderCurrentSlide(false);
        }
      });
    }

    window.addEventListener("storage", function (ev) {
      if (ev.key === "agua_presentacion_sync_state" && ev.newValue) {
        try {
          var data = JSON.parse(ev.newValue);
          if (data.slideIndex !== state.slideIndex || data.step !== state.step) {
            state.slideIndex = data.slideIndex;
            state.step = data.step;
            renderCurrentSlide(false);
          }
        } catch (_e) {}
      }
    });

    /* Teclado global */
    window.addEventListener("keydown", function (ev) {
      var tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
      if (tag === "input" && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) {
        return; // Permitir mover el deslizador del Mar de Aral cuando tiene el foco
      }

      if (ev.key === "Escape") {
        if (state.gridOpen) {
          toggleGridOverlay(false);
        } else if (state.speakerOpen && !state.isStandaloneSpeaker) {
          toggleSpeakerMode(false);
        }
        return;
      }

      if (ev.key === "g" || ev.key === "G") {
        ev.preventDefault();
        toggleGridOverlay();
        return;
      }

      if (ev.key === "n" || ev.key === "N") {
        ev.preventDefault();
        toggleSpeakerMode();
        return;
      }

      if (ev.key === "f" || ev.key === "F") {
        if (!ev.metaKey && !ev.ctrlKey) {
          ev.preventDefault();
          toggleFullscreen();
        }
        return;
      }

      if (state.gridOpen) return;

      switch (ev.key) {
        case "ArrowRight":
        case " ":
          ev.preventDefault();
          stepForward();
          break;
        case "ArrowLeft":
          ev.preventDefault();
          stepBackward();
          break;
        case "PageDown":
          ev.preventDefault();
          goToSlide(state.slideIndex + 1, 0);
          break;
        case "PageUp":
          ev.preventDefault();
          goToSlide(state.slideIndex - 1, 0);
          break;
        case "Home":
          ev.preventDefault();
          goToSlide(1, 0);
          break;
        case "0":
          ev.preventDefault();
          goToSlide(0, 0); // vuelve al gancho animado
          break;
        case "End":
          ev.preventDefault();
          goToSlide(DATA.meta.totalMainSlides, 0);
          break;
        default:
          break;
      }
    });

    /* Gestos táctiles (swipe) y clic limpio en escenario */
    var touchStartX = 0;
    var touchStartY = 0;
    if (dom.viewport) {
      dom.viewport.addEventListener(
        "touchstart",
        function (ev) {
          if (ev.touches.length === 1) {
            touchStartX = ev.touches[0].clientX;
            touchStartY = ev.touches[0].clientY;
          }
        },
        { passive: true }
      );

      dom.viewport.addEventListener(
        "touchend",
        function (ev) {
          if (ev.changedTouches.length === 1) {
            var dx = ev.changedTouches[0].clientX - touchStartX;
            var dy = ev.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) stepForward();
              else stepBackward();
            }
          }
        },
        { passive: true }
      );

      dom.viewport.addEventListener("click", function (ev) {
        if (state.gridOpen) return;
        var interactive = ev.target.closest(
          "button, input, a, details, summary, .sources-grid, [data-pin], [data-pin-card], [data-flip-card], [data-src-filter]"
        );
        if (interactive) return;
        var sel = window.getSelection ? String(window.getSelection()) : "";
        if (sel.length > 0) return;
        stepForward();
      });
    }
  }

  /**
   * Punto de entrada principal al cargar el DOM.
   * @returns {void}
   */
  function init() {
    dom.viewport = document.getElementById("stageViewport");
    dom.scaler = document.getElementById("stageScaler");
    dom.speakerPanel = document.getElementById("speakerPanel");
    dom.speakerContent = document.getElementById("speakerContent");
    dom.timerBar = document.getElementById("timerBar");
    dom.timerSlide = document.getElementById("timerSlide");
    dom.timerTotal = document.getElementById("timerTotal");
    dom.timerToggleBtn = document.getElementById("timerToggleBtn");
    dom.gridOverlay = document.getElementById("gridOverlay");
    dom.gridCards = document.getElementById("gridCards");
    dom.printDeck = document.getElementById("printDeck");
    dom.btnPrev = document.getElementById("btnPrev");
    dom.btnNext = document.getElementById("btnNext");
    dom.btnGrid = document.getElementById("btnGrid");
    dom.btnSpeaker = document.getElementById("btnSpeaker");
    dom.btnFull = document.getElementById("btnFull");

    if (state.isStandaloneSpeaker) {
      document.body.classList.add("speaker-standalone");
      state.speakerOpen = true;
    }

    /* Botones HUD */
    if (dom.btnPrev) dom.btnPrev.addEventListener("click", stepBackward);
    if (dom.btnNext) dom.btnNext.addEventListener("click", stepForward);
    if (dom.btnGrid) dom.btnGrid.addEventListener("click", function () { toggleGridOverlay(); });
    if (dom.btnSpeaker) dom.btnSpeaker.addEventListener("click", function () { toggleSpeakerMode(); });
    if (dom.btnFull) dom.btnFull.addEventListener("click", toggleFullscreen);

    var btnCloseGrid = document.getElementById("btnCloseGrid");
    if (btnCloseGrid) btnCloseGrid.addEventListener("click", function () { toggleGridOverlay(false); });

    var btnCloseSpeaker = document.getElementById("btnCloseSpeaker");
    if (btnCloseSpeaker) btnCloseSpeaker.addEventListener("click", function () { toggleSpeakerMode(false); });

    var btnPopSpeaker = document.getElementById("btnPopSpeaker");
    if (btnPopSpeaker) btnPopSpeaker.addEventListener("click", openSecondarySpeakerWindow);

    if (dom.timerToggleBtn) dom.timerToggleBtn.addEventListener("click", toggleTimer);
    var btnTimerReset = document.getElementById("timerResetBtn");
    if (btnTimerReset) btnTimerReset.addEventListener("click", resetTimer);

    buildGridCards();
    applyHashFromLocation();
    updateStageScale();
    renderCurrentSlide(false);
    bindGlobalEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
