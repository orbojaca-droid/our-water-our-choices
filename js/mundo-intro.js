/**
 * @file mundo-intro.js
 * @description Diapositiva 0 de "Our Water, Our Choices" (v4): sin globo ni rótulos. Un bloque de tierra a todo el ancho aparece en píxeles (máscara de celdas)
 * y ya con su forma final muestra: montaña alta con páramo de frailejones, río que serpentea, represa y lago, zona rural (casas, cultivos, cerdos),
 * una pequeña transición, y una ciudad urbana con una fábrica y un centro de datos junto al mar. Varias gotas recorren el ciclo del agua
 * al mismo tiempo (26 gotas pequeñas; evaporación, nubes, lluvia, escorrentía, embalse, vertedero, río, riego, infiltración, agua subterránea,
 * bombeo, retorno y mar). Gotas color óxido son vertidos: salen de tubos subterráneos (campo, ciudad, fábrica, centro de datos), el río nace limpio y
 * se tiñe aguas abajo de cada boca, y varias bocas en la orilla del mar generan manchas oscuras. Fauna y gente por toda la escena. Título y nombre arriba a la derecha.
 *
 * Todo se dibuja con SVG generado por script (cero librerías, cero imágenes externas, 100% offline).
 * Deriva de la skill `mundo-isometrico-organico`, con proyección oblicua (vista de diorama). Diseño aprobado en boceto/boceto_diapositiva0_ciclo6.html.
 *
 * API: `window.MundoIntro.mount(contenedor, reiniciar)`, `.unmount()`.
 * Depuración para capturas: `?mt=12` fija el segundo de la línea de tiempo, `&freeze=1` congela la escena.
 */
(function () {
  "use strict";

  /* ---------- proyección oblicua: x → derecha, y → hacia atrás (arriba y a la derecha), z → arriba ---------- */
  var SX = 123, SKX = 32, SY = 38, SZ = 80, X0 = 0, Y0 = 938;
  var LX = 14, LY = 6, DX = 0.25, DY = 0.25, WL = 0.55, LW = 0.9, INK = "rgba(70,56,44,.42)";

  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Proyección oblicua de un punto 3D del bloque a coordenadas de pantalla. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function Pz(x, y, z) { return [X0 + x * SX + y * SKX, Y0 - y * SY - z * SZ]; }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Redondea a 1 decimal para acortar el SVG. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function f1(n) { return Math.round(n * 10) / 10; }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Convierte un punto [x,y] en texto "x,y". @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function pt(p) { return f1(p[0]) + "," + f1(p[1]); }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Limita un número a un rango. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Interpolación suave (smoothstep). @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Mezcla lineal de dos colores RGB. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Texto CSS rgb() con factor de luminosidad. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function rgb(c, f) { f = f || 1; return "rgb(" + Math.round(Math.min(255, c[0] * f)) + "," + Math.round(Math.min(255, c[1] * f)) + "," + Math.round(Math.min(255, c[2] * f)) + ")"; }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Convierte "#rrggbb" en [r,g,b]. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Campana gaussiana 2D para modelar montañas y colinas. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function g2(x, y, cx, cy, sx, sy) { var a = (x - cx) / sx, b = (y - cy) / sy; return Math.exp(-(a * a + b * b) / 2); }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Campana gaussiana 1D. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function g1(x, c, s) { return Math.exp(-Math.pow((x - c) / s, 2) / 2); }

  /* ---------- terreno ---------- */
  var RIVER = [[2.35, 4.5], [2.85, 4.3], [2.6, 4.0], [3.1, 3.85], [3.0, 3.6], [3.6, 3.45], [4.5, 3.2], [5.3, 3.0], [5.9, 2.85], [6.9, 3.35], [8.0, 2.85], [9.2, 3.3], [10.4, 2.65], [11.6, 3.05], [12.4, 2.8], [13.4, 2.8]];
  /** Punto del río (mundo) más cercano en x a la abscisa dada. */
  function riverAtX(x) {
    var rs = crPts2(RIVER, 150), best = rs[0], i;
    for (i = 1; i < rs.length; i++) if (Math.abs(rs[i][0] - x) < Math.abs(best[0] - x)) best = rs[i];
    return best;
  }
  /* focos de vertido: origen, tubo subterráneo (puntos intermedios) y boca donde descarga; sea = descarga directa en el mar */
  var SRC = [
    { pt: [5.55, 4.4], via: [[6.15, 3.65]], jx: 6.15 },
    { pt: [10.15, 4.6], via: [], jx: 10.15 },
    { pt: [11.65, 4.6], via: [], jx: 11.65 },
    { pt: [10.15, 1.9], via: [], jx: 10.55 },
    { pt: [11.65, 1.75], via: [[12.3, 1.4]], sea: [13.0, 1.4] },
    { pt: [11.9, 5.2], via: [[12.4, 5.1]], sea: [13.0, 5.0] },
    { pt: [11.2, 1.2], via: [[12.0, 0.7]], sea: [13.0, 0.6] },
    { pt: [11.9, 4.2], via: [[12.4, 4.0]], sea: [13.0, 4.0] }
  ];
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Distancia de un punto al trazado del río. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function riverDist(x, y) {
    var best = 9;
    for (var i = 0; i < RIVER.length - 1; i++) {
      var ax = RIVER[i][0], ay = RIVER[i][1], bx = RIVER[i + 1][0], by = RIVER[i + 1][1], dx = bx - ax, dy = by - ay;
      var t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
      best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t));
    }
    return best;
  }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Altura del terreno a pleno relieve en (x,y). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function Tfull(x, y) {
    var z = 1 + 0.035 * Math.sin(x * 1.9) * Math.cos(y * 2.3);
    z += 4.4 * g2(x, y, 1.0, 4.8, 1.05, 1.0) + 3.0 * g2(x, y, 2.3, 5.7, 0.9, 0.7) + 1.7 * g2(x, y, 0.2, 2.4, 0.7, 0.9) + 1.5 * g2(x, y, 2.8, 4.4, 0.9, 0.8);
    z += 0.8 * g2(x, y, 4.6, 5.9, 1.4, 0.6) + 0.3 * g2(x, y, 8.6, 6.0, 2.4, 0.6) + 0.2 * g2(x, y, 11.2, 6.0, 1.4, 0.6);
    z -= 1.6 * g2(x, y, 2.7, 2.9, 1.2, 1.15) * smooth(4.8, 4.3, x);
    z -= 0.38 * g2(x, y, 5.0, 3.0, 0.5, 0.55);
    z -= (0.14 + 0.16 * smooth(4.5, 3, x)) * Math.exp(-Math.pow(riverDist(x, y) / 0.24, 2));
    var c = smooth(12.1, 13.5, x);
    return z * (1 - c) + (0.14 - 0.04 * (x - 13.5)) * c;
  }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Color del suelo según altura y zona (césped, páramo, arena, roca, nieve). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function topColor(x, y, h) {
    var n = 0.5 + 0.5 * Math.sin(x * 2.3 + y * 1.7) * Math.sin(x * 1.1 - y * 2.9);
    var c = mix(hex("#a9c297"), hex("#8cac7a"), n);
    c = mix(c, hex("#ecdbb2"), smooth(0.8, 0.58, h));
    if (x < 6) c = mix(c, mix(hex("#c3c48f"), hex("#b3b57e"), n), smooth(1.7, 2.3, h));
    c = mix(c, hex("#b8aea2"), smooth(3.2, 3.8, h));
    return mix(c, hex("#f6f3ee"), smooth(4.1, 4.6, h));
  }
  /* nivel freático (agua subterránea): bajo en los pozos, más alto cerca de la montaña y el embalse */
  function wt(x) {
    return 0.26 - 0.08 * smooth(8, 14, x) - 0.3 * g1(x, 5.6, 0.75) - 0.3 * g1(x, 7.9, 0.75) - 0.14 * g1(x, 9.3, 0.6) - 0.12 * g1(x, 11.7, 0.6);
  }

  /* ---------- pinceles de dibujo ---------- */
  function poly(pts, fill, op, sw) {
    return '<polygon points="' + pts.map(pt).join(" ") + '" fill="' + fill + '"' + (op ? ' fill-opacity="' + op + '"' : "") + ' stroke="' + INK + '" stroke-width="' + (sw || 0.9) + '" stroke-linejoin="round"/>';
  }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Sombra elíptica suave bajo un objeto. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function shadowE(p, rx, ry) { return '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] + 1) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="rgba(70,56,44,.2)"/>'; }
  /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Caja en proyección oblicua (frente, derecha y techo). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function boxO(x, y, w, d, h, z0, c) {
    var A = Pz(x, y, z0), B = Pz(x + w, y, z0), C = Pz(x + w, y, z0 + h), D = Pz(x, y, z0 + h);
    var E = Pz(x, y + d, z0 + h), F = Pz(x + w, y + d, z0 + h), G = Pz(x + w, y + d, z0);
    return poly([A, B, C, D], c.front) + poly([B, G, F, C], c.right) + poly([D, C, F, E], c.top);
  }

  /* ---------- escena (diorama) ---------- */
  function diorama(opt) {
    var zk = opt.zk, objs = opt.objs, base = 0.95;
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function Hz(x, y) {
      var t = Tfull(x, y), d = t - base;
      return base + d * (d > 0 ? zk : Math.max(zk, 0.85));
    }
    var NX = Math.round(LX / DX), NY = Math.round(LY / DY), i, j;
    var buckets = [];
    for (j = 0; j < NY; j++) buckets.push({ t: [], o: [] });
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function row(y) { return clamp(Math.floor(y / DY), 0, NY - 1); }
    var HH = [];
    for (i = 0; i <= NX; i++) { HH[i] = []; for (j = 0; j <= NY; j++) HH[i][j] = Hz(i * DX, j * DY); }

    var Lx = -0.5, Ly = -0.4, Lz = 0.77, Lm = Math.hypot(Lx, Ly, Lz);
    for (j = NY - 1; j >= 0; j--) {
      for (i = 0; i < NX; i++) {
        var a = HH[i][j], b = HH[i + 1][j], c = HH[i + 1][j + 1], d = HH[i][j + 1];
        var x0 = i * DX, x1 = x0 + DX, y0 = j * DY, y1 = y0 + DY;
        var gx = ((b - a) + (c - d)) / (2 * DX), gy = ((d - a) + (c - b)) / (2 * DY);
        var nm = Math.hypot(gx, gy, 1), dl = Math.max(0, (-gx * Lx - gy * Ly + Lz) / (nm * Lm));
        var col = rgb(topColor((x0 + x1) / 2, (y0 + y1) / 2, (a + b + c + d) / 4), 0.6 + 0.5 * dl);
        var s = '<polygon points="' + pt(Pz(x0, y0, a)) + " " + pt(Pz(x1, y0, b)) + " " + pt(Pz(x1, y1, c)) + " " + pt(Pz(x0, y1, d)) + '" fill="' + col + '" stroke="' + col + '" stroke-width=".7" stroke-linejoin="round"/>';
        var mx = Math.max(a, b, c, d), lvl = x0 < 4.7 ? LW : WL;
        if (mx < lvl + 0.02) {
          var dep = clamp((lvl - (a + b + c + d) / 4) / 0.6, 0, 1), wc = mix(hex("#9bd6e1"), hex("#3f93ad"), dep);
          s += '<polygon points="' + pt(Pz(x0, y0, lvl)) + " " + pt(Pz(x1, y0, lvl)) + " " + pt(Pz(x1, y1, lvl)) + " " + pt(Pz(x0, y1, lvl)) + '" fill="' + rgb(wc) + '" fill-opacity=".88" stroke="' + rgb(wc) + '" stroke-opacity=".88" stroke-width=".6"/>';
        }
        buckets[j].t.push(s);
      }
    }

    /* decales planos sobre el terreno: se dibujan en el cubo de su fila más cercana a la cámara */
    function zz(x, y) { return Hz(x, y) + 0.03; }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function decal(pts, fill, extra) {
      var minY = 99; pts.forEach(function (p) { minY = Math.min(minY, p[1]); });
      var s = poly(pts.map(function (p) { return Pz(p[0], p[1], zz(p[0], p[1])); }), fill, 1, 0.7) + (extra || "");
      buckets[row(minY)].t.push(s);
    }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function ln(x0, y0, x1, y1, st, w, cls) {
      return '<line' + (cls ? ' class="' + cls + '"' : "") + ' x1="' + pt(Pz(x0, y0, zz(x0, y0))).split(",")[0] + '" y1="' + pt(Pz(x0, y0, zz(x0, y0))).split(",")[1] + '" x2="' + pt(Pz(x1, y1, zz(x1, y1))).split(",")[0] + '" y2="' + pt(Pz(x1, y1, zz(x1, y1))).split(",")[1] + '" stroke="' + st + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function parcel(x0, y0, x1, y1, fill, stripe, rows, water) {
      var extra = "";
      for (var k = 1; k < rows; k++) {
        var yk = y0 + ((y1 - y0) * k) / rows;
        extra += ln(x0 + 0.04, yk, x1 - 0.04, yk, stripe, 1.8);
        if (water) extra += ln(x0 + 0.04, yk, x1 - 0.04, yk, "#8fcfdc", 1.6, "mi-flow");
      }
      decal([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, extra);
    }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function segs(pts, stroke, w, extraStyle) {
      for (var k = 0; k < pts.length - 1; k++) {
        var a = pts[k], b = pts[k + 1], p = Pz(a[0], a[1], zz(a[0], a[1])), q = Pz(b[0], b[1], zz(b[0], b[1]));
        buckets[row((a[1] + b[1]) / 2)].t.push('<line x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round"' + (extraStyle || "") + "/>");
      }
    }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function crPts(P0, n) {
      var out = [];
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function cr(a, b, c, d3, t) { return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d3) * t * t + (-a + 3 * b - 3 * c + d3) * t * t * t); }
      for (var m = 0; m <= n; m++) {
        var u = (m / n) * (P0.length - 1), i0 = Math.min(P0.length - 2, Math.floor(u)), f = u - i0;
        var p0 = P0[Math.max(0, i0 - 1)], p1 = P0[i0], p2 = P0[i0 + 1], p3 = P0[Math.min(P0.length - 1, i0 + 2)];
        out.push([cr(p0[0], p1[0], p2[0], p3[0], f), cr(p0[1], p1[1], p2[1], p3[1], f)]);
      }
      return out;
    }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function put(y, s) { buckets[row(y)].o.push(s); }

    /* río (sobre la tierra; en el mar ya no se ve) */
    var rp = crPts(RIVER, 70).filter(function (p) { return p[0] < 12.95 && (p[0] >= 5.0 || Hz(p[0], p[1]) > 0.86); });
    [[0, 3.9, 4, 2], [3.8, 8.2, 8, 4.6], [8.1, 13, 11, 6.4]].forEach(function (z) { var sl = rp.filter(function (p) { return p[0] >= z[0] && p[0] <= z[1]; }); segs(sl, "#5fb0c4", z[2]); segs(sl, "#9bd6e1", z[3]); });
    segs(rp.filter(function (p) { return p[0] < 3.4; }), "#ffffff", 2.4, ' stroke-opacity=".85" stroke-dasharray="2 6" class="mi-flow"');
    segs(rp, "#ffffff", 2, ' stroke-opacity=".7" stroke-dasharray="4 12" class="mi-flow"');
    /* el río nace limpio y se tiñe de óxido aguas abajo de cada boca de desagüe (los tintes se suman) */
    [6.15, 10.15, 11.65].forEach(function (x0) {
      segs(rp.filter(function (p) { return p[0] >= x0; }), "#b8532b", 5, ' stroke-opacity=".3" class="mi-pollute"');
    });
    /* tubos subterráneos: trazo punteado tenue desde cada foco hasta su boca; las bocas se dibujan más abajo con los objetos */
    var MOUTHS = [];
    SRC.forEach(function (S) {
      var end = S.sea ? S.sea : riverAtX(S.jx), c = [S.pt].concat(S.via, [end]);
      segs(c, "#6e4429", 2.6, ' stroke-opacity=".5" stroke-dasharray="3 7"');
      MOUTHS.push(end);
    });

    if (objs) {
      /* GRANJA (zona central): parcelas al norte y al sur del río, canales, pivote de riego, pasto con vacas, granero */
      parcel(5.1, 3.65, 6.3, 4.75, "#d8c47e", "#b8a25a", 7, true);
      
      parcel(5.1, 0.75, 6.3, 1.95, "#a9c97f", "#7fa263", 7, true);
      parcel(5.1, 2.1, 6.35, 2.6, "#e6d08a", "#c2ab62", 4, true);
      parcel(6.45, 1.95, 7.55, 2.55, "#c9a679", "#a98859", 4, false);
      parcel(7.6, 3.5, 8.05, 3.75, "#cbd48a", "#a9b36b", 2, true);
      
      var piv = [], k;
      for (k = 0; k < 40; k++) { var an = (k / 40) * Math.PI * 2; piv.push([8.9 + 0.0, 1.4]); }
      /* pivote de riego circular al sur de la ciudad */
      piv = []; for (k = 0; k < 40; k++) { var an2 = (k / 40) * Math.PI * 2; piv.push([8.75 + 0.62 * Math.cos(an2), 1.4 + 0.62 * Math.sin(an2)]); }
      var spokes = "";
      for (k = 0; k < 4; k++) { var a3 = (k / 4) * Math.PI; spokes += ln(8.75 - 0.62 * Math.cos(a3), 1.4 - 0.62 * Math.sin(a3), 8.75 + 0.62 * Math.cos(a3), 1.4 + 0.62 * Math.sin(a3), "#7aa261", 1.4); }
      
      decal([[6.5, 3.7], [7.35, 3.7], [7.35, 5.0], [6.5, 5.0]], "#b9d09a", "");
      /* canales de riego que salen del río */
      segs([[5.7, 3.1], [5.7, 3.65]], "#5fb0c4", 5); segs([[5.7, 3.1], [5.7, 3.65]], "#9bd6e1", 2.6);
      segs([[5.7, 2.85], [5.7, 2.6]], "#5fb0c4", 5); segs([[5.7, 2.85], [5.7, 2.6]], "#9bd6e1", 2.6); segs([[6.95, 3.25], [6.95, 2.55]], "#5fb0c4", 5); segs([[6.95, 3.25], [6.95, 2.55]], "#9bd6e1", 2.6);
      /* escorrentía de fertilizante hacia el río */
      
      /* PÁRAMO: laguna de origen del río, frailejones en grupos (tronco con falda de hojas secas y roseta plateada) y macollas de paja */
      var lag = []; for (k = 0; k < 20; k++) { var al = (k / 20) * Math.PI * 2; lag.push([2.36 + 0.17 * Math.cos(al), 4.52 + 0.11 * Math.sin(al)]); }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function frail(x, y, sc, flower) {
        var p = Pz(x, y, Hz(x, y)), h = 21 * sc, rc = p[1] - h - 3 * sc, g = shadowE(p, 9 * sc, 2.8 * sc), a, k2;
        g += '<path d="M' + f1(p[0] - 5.4 * sc) + "," + f1(p[1]) + " L" + f1(p[0] - 3.8 * sc) + "," + f1(p[1] - h) + " L" + f1(p[0] + 3.8 * sc) + "," + f1(p[1] - h) + " L" + f1(p[0] + 5.4 * sc) + "," + f1(p[1]) + 'Z" fill="#8f7650" stroke="' + INK + '" stroke-width=".8"/>';
        for (k2 = 0; k2 < 5; k2++) { var yy = p[1] - h * (0.1 + 0.19 * k2); g += '<path d="M' + f1(p[0] - 6.4 * sc) + "," + f1(yy) + " Q" + f1(p[0]) + "," + f1(yy + 5 * sc) + " " + f1(p[0] + 6.4 * sc) + "," + f1(yy) + '" fill="none" stroke="' + (k2 % 2 ? "#cdb77f" : "#b79e68") + '" stroke-width="' + f1(2.6 * sc) + '" stroke-linecap="round"/>'; }
        if (flower) { g += '<line x1="' + f1(p[0]) + '" y1="' + f1(rc) + '" x2="' + f1(p[0] + 3 * sc) + '" y2="' + f1(rc - 22 * sc) + '" stroke="#8aa06a" stroke-width="1.6"/>'; for (k2 = 0; k2 < 3; k2++) g += '<circle cx="' + f1(p[0] + (k2 - 1) * 4 * sc + 3 * sc) + '" cy="' + f1(rc - 22 * sc - (k2 % 2) * 3 * sc) + '" r="' + f1(2.5 * sc) + '" fill="#e8c34a"/>'; }
        for (a = 0; a < 10; a++) {
          var an = (a / 10) * Math.PI * 2 + 0.25, cx2 = p[0] + Math.cos(an) * 8.5 * sc, cy2 = rc + Math.sin(an) * 4.6 * sc;
          g += '<ellipse cx="' + f1(cx2) + '" cy="' + f1(cy2) + '" rx="' + f1(10 * sc) + '" ry="' + f1(2.9 * sc) + '" fill="' + (a % 2 ? "#c3cf9f" : "#dbe5bd") + '" stroke="rgba(70,56,44,.22)" stroke-width=".5" transform="rotate(' + f1((an * 180) / Math.PI) + " " + f1(cx2) + " " + f1(cy2) + ')"/>';
        }
        return g + '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(rc) + '" rx="' + f1(4.6 * sc) + '" ry="' + f1(2.8 * sc) + '" fill="#f1f4df"/>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function paja(x, y) {
        var p = Pz(x, y, Hz(x, y)), g = "", k2;
        for (k2 = -3; k2 <= 3; k2++) g += '<line x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(p[0] + k2 * 3.2) + '" y2="' + f1(p[1] - 13 + Math.abs(k2) * 1.6) + '" stroke="#bfae62" stroke-width="1.6" stroke-linecap="round"/>';
        return g;
      }
      for (var fx = 0.3; fx < 5.3; fx += 0.14) for (var fy = 2.4; fy < 6.0; fy += 0.13) {
        var jx = fx + (rnd(fx, fy) - 0.5) * 0.18, jy = fy + (rnd(fy, fx) - 0.5) * 0.16, hh = Hz(jx, jy);
        if (hh > 1.85 && hh < 3.7 && riverDist(jx, jy) > 0.3 && Math.hypot(jx - 2.36, jy - 4.52) > 0.35 && rnd(fx * 5.3, fy * 2.9) < 0.93) put(jy, frail(jx, jy, 0.62 + 0.28 * rnd(jx, jy), rnd(jy, jx * 3) < 0.12));
        var kx = fx + 0.1 + (rnd(fy, fx * 2) - 0.5) * 0.2, ky = fy + 0.09, kh = Hz(kx, ky);
        if (kh > 1.8 && kh < 3.7 && riverDist(kx, ky) > 0.25 && rnd(fx * 1.3, fy * 7.1) < 0.4) put(ky, paja(kx, ky));
      }
      var cowRaw = function (cx, cy, flip) {
        var p = Pz(cx, cy, Hz(cx, cy)), f = flip ? -1 : 1;
        return shadowE(p, 11, 3.6) +
          '<g stroke="' + INK + '" stroke-width=".8"><line x1="' + f1(p[0] - 5) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 5) + '" y2="' + f1(p[1] + 1) + '"/><line x1="' + f1(p[0] + 5) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 5) + '" y2="' + f1(p[1] + 1) + '"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 8) + '" rx="10" ry="5.6" fill="#f4efe6"/><circle cx="' + f1(p[0] + 11 * f) + '" cy="' + f1(p[1] - 10) + '" r="3.6" fill="#f4efe6"/></g>' +
          '<ellipse cx="' + f1(p[0] - 3) + '" cy="' + f1(p[1] - 9) + '" rx="3.2" ry="2.2" fill="#6b5a4a"/><ellipse cx="' + f1(p[0] + 4) + '" cy="' + f1(p[1] - 6.5) + '" rx="2.2" ry="1.7" fill="#6b5a4a"/>';
      };

      /* ---------- FAUNA Y COMUNIDADES ---------- */
      var SK = ["#f0cfae", "#d9a679", "#a9784f", "#7a5236"];
      /** Persona estilizada sin rostro; opciones: shirt, skin, hat ("straw"|"hard"|"scarf"), tool ("hoe"|"bucket"|"bag"), skirt, k (escala). */
      function person(x, y, o) {
        o = o || {};
        var k = (o.k || 1.15) * 0.55, p = Pz(x, y, Hz(x, y)), sh = o.shirt || "#c8745a", sk = o.skin || SK[0];
        var h = 17 * k, w = 9.5 * k, g = shadowE(p, 7 * k, 2.6 * k);
        if (o.skirt) g += '<path d="M' + f1(p[0] - w * 0.5) + "," + f1(p[1] - h * 0.5) + " L" + f1(p[0] - w * 0.9) + "," + f1(p[1] - 1) + " L" + f1(p[0] + w * 0.9) + "," + f1(p[1] - 1) + " L" + f1(p[0] + w * 0.5) + "," + f1(p[1] - h * 0.5) + 'Z" fill="' + (o.skirtColor || "#8a6f4e") + '" stroke="' + INK + '" stroke-width=".8"/>';
        else g += '<g stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"><line x1="' + f1(p[0] - 2) + '" y1="' + f1(p[1] - 4 * k) + '" x2="' + f1(p[0] - 2) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 2) + '" y1="' + f1(p[1] - 4 * k) + '" x2="' + f1(p[0] + 2) + '" y2="' + f1(p[1]) + '"/></g>';
        if (o.tool === "hoe") g += '<line x1="' + f1(p[0] + 7 * k) + '" y1="' + f1(p[1] - 1) + '" x2="' + f1(p[0] - 5 * k) + '" y2="' + f1(p[1] - h - 4 * k) + '" stroke="#7a5a3a" stroke-width="2" stroke-linecap="round"/>';
        g += '<rect x="' + f1(p[0] - w / 2) + '" y="' + f1(p[1] - h) + '" width="' + f1(w) + '" height="' + f1(h * 0.78) + '" rx="' + f1(w * 0.45) + '" fill="' + sh + '" stroke="' + INK + '" stroke-width=".8"/>';
        g += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1] - h - 4.5 * k) + '" r="' + f1(5 * k) + '" fill="' + sk + '" stroke="' + INK + '" stroke-width=".8"/>';
        if (o.hat === "straw") g += '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - h - 7.5 * k) + '" rx="' + f1(9 * k) + '" ry="' + f1(2.6 * k) + '" fill="#e2c27a" stroke="' + INK + '" stroke-width=".8"/><path d="M' + f1(p[0] - 4 * k) + "," + f1(p[1] - h - 8 * k) + " Q" + f1(p[0]) + "," + f1(p[1] - h - 14 * k) + " " + f1(p[0] + 4 * k) + "," + f1(p[1] - h - 8 * k) + 'Z" fill="#e2c27a" stroke="' + INK + '" stroke-width=".8"/>';
        if (o.hat === "hard") g += '<path d="M' + f1(p[0] - 5.4 * k) + "," + f1(p[1] - h - 6 * k) + " A" + f1(5.4 * k) + " " + f1(5.4 * k) + " 0 0 1 " + f1(p[0] + 5.4 * k) + "," + f1(p[1] - h - 6 * k) + 'Z" fill="#f2c84b" stroke="' + INK + '" stroke-width=".8"/>';
        if (o.hat === "scarf") g += '<path d="M' + f1(p[0] - 5.2 * k) + "," + f1(p[1] - h - 5 * k) + " A" + f1(5.2 * k) + " " + f1(5.2 * k) + " 0 0 1 " + f1(p[0] + 5.2 * k) + "," + f1(p[1] - h - 5 * k) + 'Z" fill="#6fa3b5" stroke="' + INK + '" stroke-width=".8"/>';
        if (o.tool === "bucket") g += '<path d="M' + f1(p[0] + 6 * k) + "," + f1(p[1] - 9 * k) + " l-1.5,8 h7 l-1.5,-8Z" + '" fill="#7fb7c9" stroke="' + INK + '" stroke-width=".8"/>';
        if (o.tool === "bag") g += '<rect x="' + f1(p[0] + 5 * k) + '" y="' + f1(p[1] - 9 * k) + '" width="7" height="8" rx="1.5" fill="#efe3c6" stroke="' + INK + '" stroke-width=".7"/>';
        return g;
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function sheepRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 11, 3.4) + '<g stroke="' + INK + '" stroke-width=".7"><line x1="' + f1(p[0] - 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 4) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 4) + '" y2="' + f1(p[1]) + '"/>' +
          '<circle cx="' + f1(p[0] - 5) + '" cy="' + f1(p[1] - 9) + '" r="6" fill="#fbf8f2"/><circle cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 11) + '" r="6.5" fill="#fbf8f2"/><circle cx="' + f1(p[0] + 5) + '" cy="' + f1(p[1] - 9) + '" r="6" fill="#fbf8f2"/><circle cx="' + f1(p[0] + 11) + '" cy="' + f1(p[1] - 9) + '" r="3.4" fill="#5b4a3e"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function deerRaw(x, y) {
        var p = Pz(x, y, Hz(x, y)), c = "#b98a5e";
        return shadowE(p, 14, 4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] - 7) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] + 7) + '" y2="' + f1(p[1]) + '"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 14) + '" rx="12" ry="6" fill="' + c + '"/><path d="M' + f1(p[0] + 8) + "," + f1(p[1] - 16) + " L" + f1(p[0] + 15) + "," + f1(p[1] - 29) + " L" + f1(p[0] + 19) + "," + f1(p[1] - 27) + " L" + f1(p[0] + 12) + "," + f1(p[1] - 13) + 'Z" fill="' + c + '"/>' +
          '<ellipse cx="' + f1(p[0] + 19) + '" cy="' + f1(p[1] - 29) + '" rx="4.6" ry="3" fill="' + c + '"/><path d="M' + f1(p[0] + 18) + "," + f1(p[1] - 32) + " l-3,-8 m3,3 l5,-6 m-2,9 l5,-5" + '" fill="none" stroke="#6b5a4a" stroke-width="1.4"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function capyRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 14, 4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 6) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 6) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 6) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 6) + '" y2="' + f1(p[1]) + '"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 8) + '" rx="12" ry="6.4" fill="#9a7552"/><ellipse cx="' + f1(p[0] + 12) + '" cy="' + f1(p[1] - 9) + '" rx="5" ry="4.2" fill="#8a6745"/><circle cx="' + f1(p[0] + 9) + '" cy="' + f1(p[1] - 13) + '" r="1.6" fill="#8a6745"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function duck(x, y) {
        var p = Pz(x, y, LW + 0.02);
        return '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] + 2) + '" rx="12" ry="3" fill="#fff" fill-opacity=".45"/><g stroke="' + INK + '" stroke-width=".7"><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 3) + '" rx="8" ry="4.6" fill="#fbf8f2"/><circle cx="' + f1(p[0] + 7) + '" cy="' + f1(p[1] - 8) + '" r="3.6" fill="#5f8f5a"/><path d="M' + f1(p[0] + 10) + "," + f1(p[1] - 8) + " l5,1.5 l-5,1.5Z" + '" fill="#e8a24a"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function henRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 7, 2.2) + '<g stroke="' + INK + '" stroke-width=".7"><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 5) + '" rx="6" ry="4.4" fill="#e9d9bd"/><circle cx="' + f1(p[0] + 6) + '" cy="' + f1(p[1] - 9) + '" r="2.8" fill="#e9d9bd"/><path d="M' + f1(p[0] + 8) + "," + f1(p[1] - 9) + ' l3,1 l-3,1Z" fill="#e8a24a"/><path d="M' + f1(p[0] + 5) + "," + f1(p[1] - 12) + ' l1,-3 l2,2 Z" fill="#c8745a"/><line x1="' + f1(p[0] - 1) + '" y1="' + f1(p[1] - 1) + '" x2="' + f1(p[0] - 1) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 2) + '" y1="' + f1(p[1] - 1) + '" x2="' + f1(p[0] + 2) + '" y2="' + f1(p[1]) + '"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function dogRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 9, 3) + '<g stroke="' + INK + '" stroke-width=".7" stroke-linecap="round"><line x1="' + f1(p[0] - 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 4) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 4) + '" y2="' + f1(p[1]) + '"/><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 7) + '" rx="8" ry="4" fill="#b98a5e"/><circle cx="' + f1(p[0] + 8) + '" cy="' + f1(p[1] - 10) + '" r="3.6" fill="#b98a5e"/><path d="M' + f1(p[0] - 8) + "," + f1(p[1] - 8) + " q-4,-4 -3,-8" + '" fill="none"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function donkeyRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 14, 4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] - 7) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] + 7) + '" y2="' + f1(p[1]) + '"/><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 14) + '" rx="13" ry="6.4" fill="#a9a095"/><path d="M' + f1(p[0] + 9) + "," + f1(p[1] - 16) + " L" + f1(p[0] + 15) + "," + f1(p[1] - 25) + " L" + f1(p[0] + 20) + "," + f1(p[1] - 22) + " L" + f1(p[0] + 14) + "," + f1(p[1] - 12) + 'Z" fill="#a9a095"/><path d="M' + f1(p[0] + 15) + "," + f1(p[1] - 25) + " l-1,-8 l4,6Z" + '" fill="#8f877b"/><rect x="' + f1(p[0] - 5) + '" y="' + f1(p[1] - 21) + '" width="10" height="5" rx="2" fill="#c8745a"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function hutR(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 26, 7) + '<path d="M' + f1(p[0] - 20) + "," + f1(p[1] - 24) + " L" + f1(p[0] - 20) + "," + f1(p[1]) + " A20 6 0 0 0 " + f1(p[0] + 20) + "," + f1(p[1]) + " L" + f1(p[0] + 20) + "," + f1(p[1] - 24) + 'Z" fill="url(#wall)" stroke="' + INK + '" stroke-width=".9"/>' +
          '<path d="M' + f1(p[0] - 25) + "," + f1(p[1] - 22) + " Q" + f1(p[0]) + "," + f1(p[1] - 14) + " " + f1(p[0] + 25) + "," + f1(p[1] - 22) + " L" + f1(p[0]) + "," + f1(p[1] - 54) + 'Z" fill="#d9b87a" stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"/>' +
          '<path d="M' + f1(p[0] - 5) + "," + f1(p[1] + 1) + " v-13 a5 5 0 0 1 10 0 v13Z" + '" fill="#7a5a3a"/>';
      }

      /** Agranda un animal alrededor de su punto de apoyo en el terreno para que se lea desde lejos. */
      function big(x, y, svg, k) { var p = Pz(x, y, Hz(x, y)); return '<g transform="translate(' + f1(p[0]) + " " + f1(p[1]) + ") scale(" + k + ") translate(" + f1(-p[0]) + " " + f1(-p[1]) + ')">' + svg + "</g>"; }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function sheep(x, y) { return big(x, y, sheepRaw(x, y), 0.9); }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function deer(x, y) { return big(x, y, deerRaw(x, y), 1.05); }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function capy(x, y) { return big(x, y, capyRaw(x, y), 0.95); }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function hen(x, y) { return big(x, y, henRaw(x, y), 0.85); }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function dog(x, y) { return big(x, y, dogRaw(x, y), 0.85); }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function donkey(x, y) { return big(x, y, donkeyRaw(x, y), 1.0); }
      var cowSvg = function (cx, cy, flip) { return big(cx, cy, cowRaw(cx, cy, flip), 1.0); };
      put(3.7, cowSvg(6.85, 4.3, false) + cowSvg(7.1, 4.75, true) + cowSvg(6.7, 4.65, true));
      /* animales domésticos y comunidad rural (borde izquierdo, pie de la montaña) */
      put(1.0, big(0.9, 0.95, hutR(0.9, 0.95), 0.62) + big(1.85, 0.75, hutR(1.85, 0.75), 0.62));
      put(0.9, person(1.35, 0.55, { shirt: "#6fa3b5", skin: SK[2], skirt: true, skirtColor: "#c8745a", hat: "scarf", tool: "bucket" }) + person(2.45, 0.7, { shirt: "#e2c27a", skin: SK[3], k: 0.85 }) + person(2.75, 0.95, { shirt: "#9bb58a", skin: SK[1], k: 1.05, tool: "bag" }));
      put(1.9, sheep(0.7, 1.9) + sheep(1.15, 1.6) + sheep(1.55, 2.0));
      put(4.9, deer(4.1, 4.95));
      put(3.5, capy(5.7, 3.45) + capy(6.1, 3.5));
      put(3.2, duck(3.3, 3.15) + duck(3.85, 2.75) + duck(3.45, 3.65));
      put(5.5, donkey(4.9, 5.25) + hen(4.5, 5.45) + hen(4.7, 5.65) + hen(4.35, 5.7));
      /* personas trabajando: agricultores sobre las parcelas (se dibujan en la fila delantera de cada parcela) */
      put(3.66, person(5.6, 4.1, { shirt: "#c8745a", skin: SK[2], hat: "straw", tool: "hoe" }) + person(7.0, 4.1, { shirt: "#7fa263", skin: SK[1], hat: "straw", tool: "hoe" }) + person(7.15, 4.6, { shirt: "#e2c27a", skin: SK[3], k: 0.85 }) + dog(6.95, 4.6));
      put(0.76, person(5.9, 1.3, { shirt: "#6fa3b5", skin: SK[3], hat: "straw", tool: "hoe" }) + person(5.45, 1.6, { shirt: "#c8745a", skin: SK[0], hat: "straw", tool: "hoe" }));
      /* comunidad de la ciudad: cola con baldes junto al pozo, y vecinos con niños */
      put(0.7, person(9.0, 0.6, { shirt: "#9bb58a", skin: SK[2], skirt: true, skirtColor: "#8a6f4e", hat: "scarf", tool: "bucket" }) + person(9.35, 0.62, { shirt: "#c8745a", skin: SK[1], tool: "bucket" }) + person(9.7, 0.6, { shirt: "#e2c27a", skin: SK[3], k: 0.9, tool: "bucket" }));
      put(2.5, person(8.9, 2.45, { shirt: "#7fa263", skin: SK[0], tool: "bag" }) + person(10.0, 2.35, { shirt: "#6fa3b5", skin: SK[2], skirt: true, skirtColor: "#c8745a" }) + person(10.3, 2.5, { shirt: "#e2c27a", skin: SK[1], k: 0.8 }) + person(10.15, 2.68, { shirt: "#c8745a", skin: SK[3], k: 0.75 }));
      /* trabajadores de la fábrica (casco amarillo) y técnica del centro de datos */
      put(4.3, person(11.05, 4.3, { shirt: "#8a8173", skin: SK[1], hat: "hard" }) + person(11.6, 4.25, { shirt: "#6fa3b5", skin: SK[3], hat: "hard" }));
      put(0.6, person(11.1, 0.5, { shirt: "#efe3c6", skin: SK[2], hat: "hard", tool: "bag" }));
      /* casa de campo grande (reemplaza al granero y al establo) */
      casa(5.75, 5.4, 1, 1.35);
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function pig(x, y) {
        var p = Pz(x, y, Hz(x, y)), c = "#f2b8a6";
        return shadowE(p, 13, 3.6) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 7) + '" y1="' + f1(p[1] - 5) + '" x2="' + f1(p[0] - 7) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 6) + '" y1="' + f1(p[1] - 5) + '" x2="' + f1(p[0] + 6) + '" y2="' + f1(p[1]) + '"/></g>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 9) + '" rx="12" ry="7" fill="' + c + '" stroke="' + INK + '" stroke-width=".8"/>' +
          '<circle cx="' + f1(p[0] + 11) + '" cy="' + f1(p[1] - 10) + '" r="5.2" fill="' + c + '" stroke="' + INK + '" stroke-width=".8"/>' +
          '<ellipse cx="' + f1(p[0] + 15.6) + '" cy="' + f1(p[1] - 9) + '" rx="2.6" ry="2.1" fill="#e69a88" stroke="' + INK + '" stroke-width=".6"/>' +
          '<path d="M' + f1(p[0] + 8.5) + "," + f1(p[1] - 14) + " l2,-5 l3,4Z" + '" fill="#e69a88" stroke="' + INK + '" stroke-width=".6"/>' +
          '<path d="M' + f1(p[0] - 12) + "," + f1(p[1] - 10) + " q-5,-3 -2,-6 q2,-1 0,2" + '" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-linecap="round"/>';
      }
      var penPts = [[6.85, 5.3], [7.45, 5.3], [7.45, 5.85], [6.85, 5.85]];
      decal(penPts, "#b79a78", "");
      segs(penPts.concat([penPts[0]]), "#7a5a3a", 3);
      put(5.31, big(7.0, 5.5, pig(7.0, 5.5), 0.7) + big(7.25, 5.62, pig(7.25, 5.62), 0.7) + big(7.1, 5.75, pig(7.1, 5.75), 0.7));
      /* árboles: bosque denso en las laderas bajas, galerías junto al río y árboles sueltos en los bordes */
      function rnd(a, b) { var v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); }
      var KEEP = [[4.1, 4.95], [4.9, 5.25], [5.7, 3.45], [6.1, 3.5], [0.7, 1.9], [1.15, 1.6], [1.55, 2.0], [0.9, 0.95], [1.85, 0.75], [1.35, 0.55], [2.45, 0.7], [2.75, 0.95]];
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function blocked(x, y) {
        if (x > 5.0 && x < 6.4 && ((y > 3.6 && y < 4.85) || (y > 0.65 && y < 2.05))) return true;
        if (x > 6.4 && x < 7.9 && ((y > 0.5 && y < 2.7) || (y > 3.3 && y < 5.2))) return true;
        if (x > 5.0 && x < 6.4 && y > 2.0 && y < 2.7) return true;
        
        if (x > 8.2 && y > 0.45) return true;
        
        if (Hz(x, y) < 0.95 || (x > 3.9 && x < 5.3 && y > 0.5 && y < 4.7)) return true;
        
        if (x > 5.0 && x < 7.6 && y > 5.2) return true;
        
        if (x > 0.4 && x < 3.1 && y < 1.3) return true;
        if (x > 4.5 && y < 0.8) return true;
        if (y < 0.3 || x > 12.0) return true;
        var h0 = Hz(x, y);
        if (x < 5.4 && h0 > 1.9) return true;
        if (h0 > 3.0 || riverDist(x, y) < 0.28) return true;
        for (var q = 0; q < KEEP.length; q++) if (Math.hypot(x - KEEP[q][0], y - KEEP[q][1]) < 0.3) return true;
        return false;
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function treeSvg(x, y, k2) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 11 * k2, 3.6 * k2) +
          '<path d="M' + f1(p[0] - 2) + "," + f1(p[1]) + " L" + f1(p[0] - 1.4) + "," + f1(p[1] - 17 * k2) + " L" + f1(p[0] + 1.4) + "," + f1(p[1] - 17 * k2) + " L" + f1(p[0] + 2) + "," + f1(p[1]) + 'Z" fill="#8b6a4f"/>' +
          '<circle cx="' + f1(p[0] - 5 * k2) + '" cy="' + f1(p[1] - 19 * k2) + '" r="' + f1(10 * k2) + '" fill="url(#leaf)" stroke="' + INK + '" stroke-width=".8"/>' +
          '<circle cx="' + f1(p[0] + 5.5 * k2) + '" cy="' + f1(p[1] - 20 * k2) + '" r="' + f1(10.5 * k2) + '" fill="url(#leaf)" stroke="' + INK + '" stroke-width=".8"/>' +
          '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 28 * k2) + '" r="' + f1(10 * k2) + '" fill="url(#leaf)" stroke="' + INK + '" stroke-width=".8"/>';
      }
      for (var gx = 0.25; gx < 12.2; gx += 0.22) for (var gy = 0.4; gy < 5.9; gy += 0.22) {
        var tx = gx + (rnd(gx, gy) - 0.5) * 0.3, ty = gy + (rnd(gy, gx) - 0.5) * 0.3;
        var prob = tx < 5.4 ? 1.0 : (riverDist(tx, ty) < 1.0 ? 0.85 : 0.5);
        if (rnd(gx * 3.1, gy * 1.7) < prob && !blocked(tx, ty)) put(ty, treeSvg(tx, ty, 0.95 + 0.4 * rnd(tx, ty)));
      }
      /* flora ribereña: frailejones y árboles a ambos lados del río en la montaña */
      for (var ri = 0; ri < rp.length - 1; ri++) {
        var q0 = rp[ri], q1 = rp[ri + 1], tdx = q1[0] - q0[0], tdy = q1[1] - q0[1], tl = Math.hypot(tdx, tdy) || 1, nxn = -tdy / tl, nyn = tdx / tl;
        if (q0[0] > 4.0) break;
        [-1, 1].forEach(function (sd) {
          [0.38, 0.62, 0.9].forEach(function (dd, di) {
            var rr = 0.8 + 0.5 * rnd(q0[0] * 7 + di, q0[1] * 3 + sd), px = q0[0] + nxn * sd * dd * rr, py = q0[1] + nyn * sd * dd * rr, hq = Hz(px, py);
            if (hq < 0.95 || px < 0.2 || py > 5.95) return;
            if (hq > 1.85 && hq < 3.7) put(py, frail(px, py, 0.7 + 0.25 * rnd(px, py), rnd(py, px) < 0.1));
            else if (hq <= 1.85 && !blocked(px, py)) put(py, treeSvg(px, py, 0.95 + 0.4 * rnd(px, py)));
          });
        });
      }
      /* PRESA: muro de concreto que sigue el terreno, pilas y compuertas, vertedero con cascada, espuma al pie, torre de captación y boyas */
      (function () {
        var x = 4.25, w = 0.45, top = 1.28, yy, k7, idx = 0;
        for (yy = 1.3; yy < 4.29; yy += 0.25, idx++) {
          var spill = yy > 2.74 && yy < 3.3, zt = spill ? 0.92 : top, zb = Math.min(Hz(x + w + 0.2, yy + 0.125), 1.0) - 0.1, hh = Math.max(0.14, zt - zb), g = "";
          g += shadowE(Pz(x + w, yy, zb), 20, 5) + boxO(x, yy, w, 0.25, hh, zb, { front: "#cfc5b2", right: "#9c8f7b", top: spill ? "#c9d8dc" : "#e0d9c9" });
          if (!spill) {
            var pa = Pz(x + w, yy, zb), pb = Pz(x + w, yy, zb + hh);
            g += '<line x1="' + f1(pa[0]) + '" y1="' + f1(pa[1]) + '" x2="' + f1(pb[0]) + '" y2="' + f1(pb[1]) + '" stroke="rgba(70,56,44,.38)" stroke-width="1.6"/>';
            var ra = Pz(x + 0.05, yy, zb + hh + 0.09), rb = Pz(x + 0.05, yy + 0.25, zb + hh + 0.09);
            g += '<line x1="' + f1(ra[0]) + '" y1="' + f1(ra[1]) + '" x2="' + f1(rb[0]) + '" y2="' + f1(rb[1]) + '" stroke="#7a7268" stroke-width="1.8" stroke-dasharray="2 4" stroke-linecap="round"/>';
            if (idx % 3 === 1) g += boxO(x + 0.08, yy + 0.05, 0.22, 0.15, 0.12, zb + hh, { front: "#a9a093", right: "#8f877b", top: "#c7beb0" });
          } else {
            g += poly([Pz(x + w, yy, zb + hh), Pz(x + w, yy + 0.25, zb + hh), Pz(x + w, yy + 0.25, zb), Pz(x + w, yy, zb)], "#eaf6f8", 0.97);
            for (k7 = 0; k7 < 3; k7++) { var sa = Pz(x + w + 0.01, yy + 0.04 + k7 * 0.07, zb + hh), sb = Pz(x + w + 0.01, yy + 0.04 + k7 * 0.07, zb); g += '<line class="mi-flow" x1="' + f1(sa[0]) + '" y1="' + f1(sa[1]) + '" x2="' + f1(sb[0]) + '" y2="' + f1(sb[1]) + '" stroke="#fff" stroke-width="3.4" stroke-dasharray="8 8" stroke-linecap="round"/>'; }
          }
          put(yy, g);
        }
        var fp = Pz(x + w + 0.2, 3.0, Hz(x + w + 0.2, 3.0));
        put(2.95, '<ellipse cx="' + f1(fp[0]) + '" cy="' + f1(fp[1] + 2) + '" rx="42" ry="10" fill="#fff" fill-opacity=".88"/><ellipse cx="' + f1(fp[0] + 10) + '" cy="' + f1(fp[1] + 5) + '" rx="28" ry="6.5" fill="#d9eef2" fill-opacity=".92"/>');
        var tw = Pz(3.85, 2.3, LW + 0.08), tg = shadowE(tw, 16, 5) + '<rect x="' + f1(tw[0] - 9) + '" y="' + f1(tw[1] - 56) + '" width="18" height="56" rx="3" fill="#d9d2c4" stroke="' + INK + '" stroke-width=".9"/><rect x="' + f1(tw[0] - 12) + '" y="' + f1(tw[1] - 64) + '" width="24" height="10" rx="3" fill="#c8745a" stroke="' + INK + '" stroke-width=".9"/>';
        var br = Pz(x, 2.3, top + 0.1);
        tg += '<line x1="' + f1(tw[0] + 9) + '" y1="' + f1(tw[1] - 48) + '" x2="' + f1(br[0]) + '" y2="' + f1(br[1]) + '" stroke="#8a8173" stroke-width="3"/>';
        put(2.3, tg);
        var bu = "";
        [[3.3, 1.7], [3.5, 2.0], [3.4, 3.5], [3.65, 3.8], [3.7, 3.1]].forEach(function (b3) { var bp = Pz(b3[0], b3[1], LW + 0.02); bu += '<ellipse cx="' + f1(bp[0]) + '" cy="' + f1(bp[1] + 1) + '" rx="7" ry="2.4" fill="rgba(255,255,255,.55)"/><circle cx="' + f1(bp[0]) + '" cy="' + f1(bp[1] - 2) + '" r="3.6" fill="#e0603f" stroke="#fff" stroke-width="1"/>'; });
        put(2.6, bu);
      })();
      /* CASAS: paredes claras, techo a cuatro aguas, puerta, ventana y chimenea (rurales y de barrio) */
      function casa(x, y, ci, sc) {
        sc = sc || 1;
        var w = 0.3 * sc, d = 0.26 * sc, h = 0.25 * sc, rh = 0.2 * sc, z0 = Hz(x + w / 2, y + d / 2);
        var WL2 = ["#f6efe3", "#f0e2c6", "#ebd9bd"], RF = [["#c8745a", "#a9604a"], ["#b9613f", "#97502f"], ["#d08a5a", "#b06f43"]], rc = RF[ci % 3];
        var s3 = shadowE(Pz(x + w / 2, y, z0), w * SX * 0.62, 6) + boxO(x, y, w, d, h, z0, { front: WL2[ci % 3], right: "#d9ccb3", top: "#e7dcc6" });
        var zt = z0 + h, zr = zt + rh, e = 0.04;
        s3 += poly([Pz(x - e, y - e, zt), Pz(x + w + e, y - e, zt), Pz(x + w * 0.78, y + d / 2, zr), Pz(x + w * 0.22, y + d / 2, zr)], rc[0]);
        s3 += poly([Pz(x + w + e, y - e, zt), Pz(x + w + e, y + d + e, zt), Pz(x + w * 0.78, y + d / 2, zr)], rc[1]);
        var dp = Pz(x + w * 0.18, y, z0), wp = Pz(x + w * 0.58, y, z0 + h * 0.35), ch = Pz(x + w * 0.72, y + d * 0.55, zt + rh * 0.35);
        s3 += '<rect x="' + f1(dp[0]) + '" y="' + f1(dp[1] - 0.15 * SZ * sc) + '" width="' + f1(w * SX * 0.15) + '" height="' + f1(0.15 * SZ * sc) + '" fill="#8a5a45"/>' +
          '<rect x="' + f1(wp[0]) + '" y="' + f1(wp[1] - 0.09 * SZ * sc) + '" width="' + f1(w * SX * 0.2) + '" height="' + f1(0.09 * SZ * sc) + '" fill="#8fb5c2" stroke="' + INK + '" stroke-width=".5"/>' +
          '<rect x="' + f1(ch[0]) + '" y="' + f1(ch[1] - 0.17 * SZ * sc) + '" width="' + f1(5 * sc) + '" height="' + f1(0.17 * SZ * sc) + '" fill="#b9a58c" stroke="' + INK + '" stroke-width=".5"/>';
        put(y, s3);
      }
      /* ZONA RURAL: casas, un par de parcelas, pasto y corral */
      [[6.45, 0.7], [6.9, 0.85], [7.3, 0.65], [6.5, 1.45], [6.95, 1.55], [7.35, 1.35], [4.95, 5.0], [5.4, 5.05]].forEach(function (c, ci) { casa(c[0], c[1], ci); });
      put(1.0, person(6.7, 1.15, { shirt: "#c8745a", skin: SK[1], skirt: true, skirtColor: "#6fa3b5", k: 1.0 }) + person(7.1, 1.1, { shirt: "#e2c27a", skin: SK[3], k: 0.8 }) + hen(6.75, 0.5) + hen(7.0, 0.45));
      put(2.15, person(5.8, 2.32, { shirt: "#7fa263", skin: SK[1], hat: "straw", tool: "hoe" }) + person(7.0, 2.2, { shirt: "#c8745a", skin: SK[2], hat: "straw", tool: "hoe" }));

      /* TRANSICIÓN rural-ciudad: camino de tierra, parque con árboles, huerto y casas sueltas */
      decal([[7.5, 4.36], [8.4, 4.36], [8.4, 4.64], [7.5, 4.64]], "#cdb88e", "");
      decal([[7.7, 3.85], [8.15, 3.85], [8.15, 4.3], [7.7, 4.3]], "#a9cc88", "");
      [[7.8, 3.98, 0.85], [8.02, 4.2, 0.95], [7.76, 4.2, 0.75]].forEach(function (tt) { put(tt[1], treeSvg(tt[0], tt[1], tt[2])); });
      [[7.6, 4.85], [7.85, 4.85], [7.6, 5.15], [7.85, 5.15], [7.6, 5.45], [7.85, 5.45]].forEach(function (tt) { put(tt[1], treeSvg(tt[0], tt[1], 0.8)); });
      casa(8.0, 5.0, 2); casa(8.0, 5.45, 0);

      /* CIUDAD muy urbana: avenidas anchas, puente, apartamentos angostos, casas de barrio, coches y peatones */
      function road(pts, fill) {
        var minY = 99; pts.forEach(function (p) { minY = Math.min(minY, p[1]); });
        buckets[row(minY)].t.push('<polygon points="' + pts.map(function (p) { return pt(Pz(p[0], p[1], zz(p[0], p[1]))); }).join(" ") + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="1.4" stroke-linejoin="round"/>');
      }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function strN(x, y0, y1, w) { for (var yy = y0; yy < y1 - 0.01; yy += 0.4) { var ye = Math.min(yy + 0.4, y1); road([[x - w / 2 - 0.07, yy], [x + w / 2 + 0.07, yy], [x + w / 2 + 0.07, ye], [x - w / 2 - 0.07, ye]], "#e4dccb"); road([[x - w / 2, yy], [x + w / 2, yy], [x + w / 2, ye], [x - w / 2, ye]], "#aaa59c"); } }
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function strE(y, x0, x1, w) { road([[x0, y - w / 2 - 0.07], [x1, y - w / 2 - 0.07], [x1, y + w / 2 + 0.07], [x0, y + w / 2 + 0.07]], "#e4dccb"); road([[x0, y - w / 2], [x1, y - w / 2], [x1, y + w / 2], [x0, y + w / 2]], "#aaa59c"); }
      var AVS = [8.55, 9.35, 10.15, 10.95];
      strE(4.5, 8.2, 12.0, 0.3); strE(1.7, 8.2, 12.0, 0.3);
      AVS.forEach(function (ax) { strN(ax, 3.6, 4.35, 0.3); strN(ax, 4.65, 5.85, 0.3); strN(ax, 0.55, 1.55, 0.3); strN(ax, 1.85, 2.45, 0.3); });
      [9.35, 10.95].forEach(function (bx) {
        road([[bx - 0.2, 2.45], [bx + 0.2, 2.45], [bx + 0.2, 3.65], [bx - 0.2, 3.65]], "#cfc6b6"); road([[bx - 0.15, 2.45], [bx + 0.15, 2.45], [bx + 0.15, 3.65], [bx - 0.15, 3.65]], "#aaa59c");
        segs([[bx - 0.18, 2.45], [bx - 0.18, 3.65]], "#8a8173", 2.4); segs([[bx + 0.18, 2.45], [bx + 0.18, 3.65]], "#8a8173", 2.4);
      });
      [4.5, 1.7].forEach(function (ly) { segs([[8.25, ly], [11.95, ly]], "#fffdf8", 1.8, ' stroke-opacity=".9" stroke-dasharray="10 9"'); });
      AVS.forEach(function (ax) { [[3.65, 4.3], [4.7, 5.8], [0.6, 1.5], [1.9, 2.4]].forEach(function (r) { segs([[ax, r[0]], [ax, r[1]]], "#f2d98a", 1.8, ' stroke-opacity=".9" stroke-dasharray="9 9"'); }); });
      var WALLS2 = [{ front: "#ece4d6", right: "#d3c9b6", top: "#f4efe5" }, { front: "#e3d8c6", right: "#cabda6", top: "#efe6d6" }, { front: "#dbd3c8", right: "#c0b7aa", top: "#e9e3d9" }, { front: "#efe0cb", right: "#d6c4a8", top: "#f5ead8" }, { front: "#d4dcdb", right: "#b9c4c3", top: "#e4ecea" }];
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function apt(x, y, w, d, h, ci) {
        var z0 = Hz(x + w / 2, y + d / 2), s4 = shadowE(Pz(x + w / 2, y, z0), w * SX * 0.62, 6) + boxO(x, y, w, d, h, z0, WALLS2[ci % 5]), r2, zw;
        for (r2 = 0; ; r2++) {
          zw = 0.1 + r2 * 0.1;
          if (zw > h - 0.06) break;
          var wa = Pz(x + 0.04, y, z0 + zw), wb = Pz(x + w - 0.04, y, z0 + zw);
          s4 += '<line x1="' + f1(wa[0]) + '" y1="' + f1(wa[1]) + '" x2="' + f1(wb[0]) + '" y2="' + f1(wb[1]) + '" stroke="#8fb5c2" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="4 3"/>';
        }
        if (ci % 3 === 0) s4 += boxO(x + w * 0.25, y + d * 0.25, w * 0.4, d * 0.4, 0.06, z0 + h, { front: "#c7beb0", right: "#a9a093", top: "#d9d1c4" });
        put(y, s4);
      }
      var BLK = [8.81, 9.61, 10.41, 11.21];
      var ROWSN = [3.62, 3.98, 4.72, 5.08, 5.44], ROWSS = [1.98, 1.2, 0.7];
      BLK.forEach(function (bx, bi) {
        ROWSN.concat(ROWSS).forEach(function (ry, ri) {
          if (bx > 10.9 && (ry > 4.6 || ry < 1.8)) return;
          if (bi === 0 || (bi + ri) % 5 === 3) { casa(bx - 0.01, ry, bi + ri); return; }
          var cen = 1 - Math.min(1, Math.abs(bx + 0.14 - 9.9) / 2.2), hh = 0.5 + 0.55 * cen + 0.25 * rnd(bx * 3, ry);
          apt(bx + 0.04, ry, 0.28, 0.28, hh, bi + ri + Math.floor(rnd(bx, ry) * 3));
        });
      });
      var CARC = ["#c8745a", "#6fa3b5", "#e2c27a", "#8a8173", "#9bb58a", "#f4efe6", "#a65a43"];
      /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function car(cx, cy, vert, col) {
        var z0 = Hz(cx, cy) + 0.012, w = vert ? 0.1 : 0.2, d = vert ? 0.2 : 0.1;
        put(cy, shadowE(Pz(cx + w / 2, cy, z0), 13, 3.2) + boxO(cx, cy - d / 2, w, d, 0.07, z0, { front: col, right: "#6b5a4a", top: col }) + boxO(cx + w * 0.22, cy - d * 0.3, w * 0.55, d * 0.6, 0.05, z0 + 0.07, { front: "#dfe9ec", right: "#b9c9ce", top: "#eef3f4" }));
      }
      [8.4, 8.8, 9.2, 9.6, 10.0, 10.4, 10.8, 11.2, 11.6].forEach(function (cx, i) { car(cx, 4.5 + (i % 2 ? 0.06 : -0.06), false, CARC[i % 7]); });
      [8.4, 8.95, 9.5, 10.05, 10.6, 11.15, 11.65].forEach(function (cx, i) { car(cx, 1.7 + (i % 2 ? 0.06 : -0.06), false, CARC[(i + 3) % 7]); });
      [[8.55, 5.2], [9.35, 5.5], [9.35, 4.0], [10.15, 5.2], [10.95, 5.4], [10.95, 2.1], [10.15, 2.2], [8.55, 1.2], [9.35, 1.0], [10.95, 1.2], [8.55, 3.9]].forEach(function (c, i) { car(c[0] - 0.05, c[1], true, CARC[(i + 1) % 7]); });
      var PSK = [SK[0], SK[1], SK[2], SK[3]], PSH = ["#c8745a", "#6fa3b5", "#e2c27a", "#7fa263", "#8a8173", "#9bb58a", "#efe3c6"];
      [[8.7, 4.34], [9.1, 4.66], [9.6, 4.34], [10.0, 4.66], [10.4, 4.34], [10.8, 4.66], [11.3, 4.34], [11.6, 4.66], [8.7, 1.54], [9.2, 1.86], [9.7, 1.54], [10.2, 1.86], [10.7, 1.54], [11.1, 1.86], [8.9, 3.7], [9.9, 3.85], [10.6, 3.75], [11.2, 5.2], [9.4, 5.0], [10.9, 4.0], [8.55, 4.5], [10.15, 4.5], [11.5, 1.7]].forEach(function (c, i) {
        put(c[1], person(c[0], c[1], { shirt: PSH[i % 7], skin: PSK[i % 4], k: 1.0 + 0.12 * (i % 3), tool: i % 5 === 0 ? "bag" : undefined, skirt: i % 4 === 1 }));
      });
      /* ---------- FAUNA Y GENTE EXTRA: oso de anteojos, venados, caballos, gatos, perros, garzas, peces y aves de varios tipos ---------- */
      /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Oso de anteojos del páramo (pelaje oscuro, antifaz crema). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function bear(x, y) {
        var p = Pz(x, y, Hz(x, y)), c = "#2f2a26";
        return big(x, y, shadowE(p, 16, 4.4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 9) + '" y1="' + f1(p[1] - 7) + '" x2="' + f1(p[0] - 9) + '" y2="' + f1(p[1]) + '" stroke-width="3.4" stroke="' + c + '"/><line x1="' + f1(p[0] + 8) + '" y1="' + f1(p[1] - 7) + '" x2="' + f1(p[0] + 8) + '" y2="' + f1(p[1]) + '" stroke-width="3.4" stroke="' + c + '"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 12) + '" rx="14" ry="8.4" fill="' + c + '"/><ellipse cx="' + f1(p[0] + 7) + '" cy="' + f1(p[1] - 9) + '" rx="4.4" ry="3.4" fill="#e8d9b8"/>' +
          '<circle cx="' + f1(p[0] + 14) + '" cy="' + f1(p[1] - 15) + '" r="6.4" fill="' + c + '"/><circle cx="' + f1(p[0] + 11) + '" cy="' + f1(p[1] - 21) + '" r="2.4" fill="' + c + '"/><circle cx="' + f1(p[0] + 17.5) + '" cy="' + f1(p[1] - 21) + '" r="2.4" fill="' + c + '"/>' +
          '<ellipse cx="' + f1(p[0] + 19) + '" cy="' + f1(p[1] - 12.6) + '" rx="3.6" ry="2.7" fill="#e8d9b8"/><circle cx="' + f1(p[0] + 21) + '" cy="' + f1(p[1] - 13.4) + '" r="1.2" fill="' + c + '"/>' +
          '<circle cx="' + f1(p[0] + 13) + '" cy="' + f1(p[1] - 16.4) + '" r="3" fill="none" stroke="#efe3c6" stroke-width="1.5"/><circle cx="' + f1(p[0] + 18) + '" cy="' + f1(p[1] - 16.4) + '" r="3" fill="none" stroke="#efe3c6" stroke-width="1.5"/></g>', 0.8);
      }
      /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Caballo de la zona rural en el color indicado. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function horse(x, y, col) {
        var p = Pz(x, y, Hz(x, y)), c = col || "#8a5a3a", m = "#3a2a20", g = shadowE(p, 20, 4.8) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round">';
        [-10, -6, 7, 11].forEach(function (dx) { g += '<line x1="' + f1(p[0] + dx) + '" y1="' + f1(p[1] - 12) + '" x2="' + f1(p[0] + dx) + '" y2="' + f1(p[1]) + '" stroke-width="2.4" stroke="' + c + '"/>'; });
        g += '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 16) + '" rx="15" ry="7" fill="' + c + '"/>' +
          '<path d="M' + f1(p[0] + 9) + "," + f1(p[1] - 19) + " L" + f1(p[0] + 17) + "," + f1(p[1] - 35) + " L" + f1(p[0] + 23) + "," + f1(p[1] - 32) + " L" + f1(p[0] + 15) + "," + f1(p[1] - 13) + 'Z" fill="' + c + '"/>' +
          '<ellipse cx="' + f1(p[0] + 23) + '" cy="' + f1(p[1] - 33.5) + '" rx="6.4" ry="3.2" fill="' + c + '" transform="rotate(28 ' + f1(p[0] + 23) + " " + f1(p[1] - 33.5) + ')"/>' +
          '<path d="M' + f1(p[0] + 10) + "," + f1(p[1] - 30) + " q3,-6 8,-7" + '" fill="none" stroke="' + m + '" stroke-width="3"/><path d="M' + f1(p[0] - 14) + "," + f1(p[1] - 18) + " q-7,7 -3,16" + '" fill="none" stroke="' + m + '" stroke-width="3"/></g>';
        return big(x, y, g, 0.6);
      }
      /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Gato de ciudad sentado con la cola levantada. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function cat(x, y, col) {
        var p = Pz(x, y, Hz(x, y)), c = col || "#d9915a";
        return shadowE(p, 7, 2.2) + '<g stroke="' + INK + '" stroke-width=".7" stroke-linecap="round"><path d="M' + f1(p[0] - 5) + "," + f1(p[1] - 3) + " q-5,-3 -2,-10" + '" fill="none" stroke="' + c + '" stroke-width="2.2"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 4) + '" rx="5.4" ry="3.8" fill="' + c + '"/><circle cx="' + f1(p[0] + 5) + '" cy="' + f1(p[1] - 8) + '" r="3" fill="' + c + '"/>' +
          '<path d="M' + f1(p[0] + 3) + "," + f1(p[1] - 10) + " l.6,-3.4 l2,2.2Z M" + f1(p[0] + 5.4) + "," + f1(p[1] - 10.4) + " l2,-2.6 l.6,3.4Z" + '" fill="' + c + '"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Garza blanca de pie en la orilla del río. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function heron(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 8, 2.4) + '<g stroke="' + INK + '" stroke-width=".7" stroke-linecap="round"><line x1="' + f1(p[0] - 1) + '" y1="' + f1(p[1] - 13) + '" x2="' + f1(p[0] - 1) + '" y2="' + f1(p[1]) + '" stroke="#9a8f7f" stroke-width="1.4"/><line x1="' + f1(p[0] + 2) + '" y1="' + f1(p[1] - 13) + '" x2="' + f1(p[0] + 2) + '" y2="' + f1(p[1]) + '" stroke="#9a8f7f" stroke-width="1.4"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 19) + '" rx="5.6" ry="7.6" fill="#f6f3ee"/><path d="M' + f1(p[0] + 3) + "," + f1(p[1] - 24) + " q7,-6 3,-14" + '" fill="none" stroke="#f6f3ee" stroke-width="3.2"/><circle cx="' + f1(p[0] + 6.4) + '" cy="' + f1(p[1] - 39) + '" r="2.6" fill="#f6f3ee"/><path d="M' + f1(p[0] + 8.4) + "," + f1(p[1] - 39.6) + ' l8,1.2 l-8,1.6Z" fill="#e8b84a"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Ave en vuelo (guacamaya, tucán, colibrí, paloma, gaviota, golondrina o loro) con deriva suave. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      var BIRD = {
        macaw: { b: "#d8402f", h: "#d8402f", t: "#2f6fb5", tl: 10, w: "#2f6fb5", s: "#f2c84b", bk: "#efe6d2", bl: 3.4 },
        toucan: { b: "#2b2622", h: "#2b2622", t: "#2b2622", tl: 3, w: "#3a342f", s: "#f2d24a", bk: "#e8892f", bl: 9 },
        hummer: { b: "#3f9a6a", h: "#2f7f55", t: "#2f7f55", tl: 3, w: "#cfe3d6", s: "", bk: "#3d352c", bl: 8 },
        pigeon: { b: "#a3abb0", h: "#7f8b92", t: "#8a949a", tl: 4, w: "#838d93", s: "", bk: "#e8a24a", bl: 2.4 },
        gull: { b: "#fbf8f2", h: "#fbf8f2", t: "#fbf8f2", tl: 4, w: "#d3d8da", s: "", bk: "#e8a24a", bl: 3.4 },
        swallow: { b: "#2f4a63", h: "#2f4a63", t: "#2f4a63", tl: 8, w: "#25384b", s: "", bk: "#2b2622", bl: 2 },
        parrot: { b: "#6fa65a", h: "#6fa65a", t: "#4f8a45", tl: 6, w: "#4f8a45", s: "#e8c34a", bk: "#e8a24a", bl: 2.8 }
      };
      function flyer(wx, wy, wz, k, kind, delay) {
        var T = BIRD[kind], p = Pz(wx, wy, wz);
        return '<g transform="translate(' + f1(p[0]) + " " + f1(p[1]) + ") scale(" + k + ')"><g class="mi-float" style="animation-delay:' + delay + 's">' +
          '<path d="M-6,0 L-' + (6 + T.tl) + ',3 L-' + (6 + T.tl) + ',-2Z" fill="' + T.t + '" stroke="' + INK + '" stroke-width=".7"/>' +
          '<ellipse cx="0" cy="0" rx="7.5" ry="3.6" fill="' + T.b + '" stroke="' + INK + '" stroke-width=".7"/><circle cx="7.6" cy="-1.2" r="3" fill="' + T.h + '" stroke="' + INK + '" stroke-width=".7"/>' +
          '<path d="M9.8,-1.8 l' + T.bl + ',1.4 l-' + T.bl + ',1.8Z" fill="' + T.bk + '" stroke="' + INK + '" stroke-width=".5"/>' +
          '<path d="M-1,-2 Q-4,-16 -13,-13 Q-8,-6 3,-1Z" fill="' + T.w + '" stroke="' + INK + '" stroke-width=".7"/>' +
          (T.s ? '<path d="M-3,-6 Q-6,-12 -10,-11" fill="none" stroke="' + T.s + '" stroke-width="1.6" stroke-linecap="round"/>' : "") + "</g></g>";
      }
      /** Las aves van en la última fila: siempre quedan por encima de árboles, casas y edificios. */
      function sky(s) { buckets[NY - 1].o.push(s); }
      var up = function (x, y, d) { return Hz(x, y) + d; };
      sky(flyer(1.4, 2.9, up(1.4, 2.9, 1.1), 1.1, "macaw", -1) + flyer(1.75, 3.15, up(1.75, 3.15, 1.0), 1.0, "macaw", -2.5) + flyer(0.7, 3.6, up(0.7, 3.6, 1.2), 1.0, "parrot", -4) + flyer(1.1, 2.3, up(1.1, 2.3, 0.9), 0.9, "parrot", -3));
      sky(flyer(4.9, 5.0, up(4.9, 5.0, 0.9), 1.1, "toucan", -2) + flyer(0.95, 1.9, up(0.95, 1.9, 0.9), 1.0, "toucan", -3.5));
      sky(flyer(2.5, 3.8, up(2.5, 3.8, 0.4), 1.0, "hummer", -0.5) + flyer(3.25, 4.9, up(3.25, 4.9, 0.4), 1.0, "hummer", -1.8) + flyer(2.0, 5.0, up(2.0, 5.0, 0.4), 0.9, "hummer", -3));
      sky(flyer(6.9, 2.5, up(6.9, 2.5, 1.3), 1.0, "swallow", -1) + flyer(7.5, 4.0, up(7.5, 4.0, 1.4), 1.0, "swallow", -2.2) + flyer(6.2, 1.7, up(6.2, 1.7, 1.0), 1.0, "parrot", -3.1) + flyer(5.7, 5.2, up(5.7, 5.2, 0.9), 1.0, "swallow", -0.4));
      sky(flyer(9.9, 3.6, up(9.9, 3.6, 0.6), 1.0, "pigeon", -1) + flyer(10.6, 1.2, up(10.6, 1.2, 0.95), 1.0, "pigeon", -2) + flyer(9.0, 5.1, up(9.0, 5.1, 1.05), 1.0, "pigeon", -3) + flyer(11.4, 3.5, up(11.4, 3.5, 0.5), 0.9, "pigeon", -1.5) + flyer(8.7, 2.8, up(8.7, 2.8, 0.55), 0.9, "pigeon", -2.7));
      sky(flyer(13.6, 3.1, 1.5, 1.1, "gull", -1) + flyer(13.0, 0.8, 1.8, 1.0, "gull", -2) + flyer(13.7, 2.0, 1.1, 1.0, "gull", -3) + flyer(13.3, 4.4, 1.6, 1.0, "gull", -0.6) + flyer(12.7, 5.2, 1.4, 0.9, "gull", -3.6));
      /* peces del embalse y del mar, patos y garzas */
      /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Pez visto bajo la superficie del agua. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function fishAt(x, y, lvl, col, k) {
        var q = Pz(x, y, lvl - 0.02);
        buckets[row(y)].t.push('<g opacity=".85" transform="translate(' + f1(q[0]) + " " + f1(q[1]) + ") scale(" + k + ')"><ellipse cx="0" cy="0" rx="8" ry="3.2" fill="' + col + '"/><path d="M-7,0 l-6,-4 v8Z" fill="' + col + '"/><circle cx="4.5" cy="-.6" r=".9" fill="#fff"/></g>');
      }
      [[2.5, 2.5], [2.9, 3.4], [3.3, 2.3], [2.2, 3.2], [3.6, 3.15], [2.8, 2.9], [3.1, 3.7]].forEach(function (f, i) { fishAt(f[0], f[1], LW, i % 2 ? "#c8745a" : "#2f7f99", 0.9); });
      [[13.2, 4.2], [13.7, 2.7], [13.4, 1.8], [13.8, 4.0], [13.1, 0.6], [13.6, 5.7]].forEach(function (f, i) { fishAt(f[0], f[1], WL, i % 2 ? "#2f7f99" : "#e8a24a", 1.0); });
      put(3.0, duck(2.8, 2.5) + duck(2.45, 3.3) + duck(3.05, 3.9));
      put(2.7, heron(8.05, 2.55) + heron(5.5, 3.25));
      put(3.2, heron(3.95, 2.1));
      /* fauna del páramo, el campo y la ciudad */
      put(5.45, bear(3.35, 5.45));
      put(5.0, deer(3.0, 5.05));
      put(1.95, horse(7.85, 1.95, "#8a5a3a") + horse(7.9, 1.05, "#efe9df"));
      put(5.3, horse(5.2, 5.55, "#b87a45"));
      put(4.05, horse(7.1, 4.1, "#5b3f2a"));
      put(3.3, person(7.6, 3.4, { shirt: "#7fa263", skin: SK[1], hat: "straw" }));
      /* personas extra: páramo, bote en el embalse, campo, orilla del mar y ciudad */
      put(4.55, person(4.3, 4.55, { shirt: "#c8745a", skin: SK[2], hat: "scarf", tool: "bag" }));
      (function () {
        var b = Pz(3.0, 2.95, LW + 0.03);
        put(2.95, '<ellipse cx="' + f1(b[0]) + '" cy="' + f1(b[1] + 3) + '" rx="20" ry="4" fill="rgba(70,56,44,.16)"/><path d="M' + f1(b[0] - 18) + "," + f1(b[1] - 3) + " L" + f1(b[0] + 18) + "," + f1(b[1] - 3) + " L" + f1(b[0] + 12) + "," + f1(b[1] + 4) + " L" + f1(b[0] - 12) + "," + f1(b[1] + 4) + 'Z" fill="#c8745a" stroke="' + INK + '" stroke-width=".8"/>' +
          '<rect x="' + f1(b[0] - 3) + '" y="' + f1(b[1] - 15) + '" width="7" height="12" rx="3" fill="#7fa263" stroke="' + INK + '" stroke-width=".7"/><circle cx="' + f1(b[0] + 0.5) + '" cy="' + f1(b[1] - 19) + '" r="3.4" fill="' + SK[2] + '" stroke="' + INK + '" stroke-width=".7"/><line x1="' + f1(b[0] + 4) + '" y1="' + f1(b[1] - 12) + '" x2="' + f1(b[0] + 20) + '" y2="' + f1(b[1] - 26) + '" stroke="#7a5a3a" stroke-width="1.4"/>');
      })();
      put(4.2, person(5.3, 4.2, { shirt: "#e2c27a", skin: SK[3], k: 0.8 }) + person(6.0, 4.5, { shirt: "#6fa3b5", skin: SK[1], skirt: true, skirtColor: "#c8745a", tool: "bucket" }));
      put(1.5, person(5.5, 1.1, { shirt: "#c8745a", skin: SK[1], k: 0.8 }) + person(6.2, 1.6, { shirt: "#9bb58a", skin: SK[2], hat: "straw", tool: "hoe" }) + dog(5.9, 1.05));
      put(3.9, person(12.4, 3.9, { shirt: "#6fa3b5", skin: SK[0] }) + person(12.65, 4.15, { shirt: "#e2c27a", skin: SK[2], k: 0.8 }) + dog(12.2, 4.05));
      [[9.0, 4.7], [9.3, 4.35], [9.75, 4.66], [10.3, 4.64], [10.6, 4.36], [11.0, 4.35], [11.45, 4.66], [8.9, 1.84], [9.45, 1.56], [9.95, 1.84], [10.45, 1.56], [10.9, 1.84], [11.4, 1.56], [9.55, 3.8], [10.25, 3.7], [10.8, 3.9], [8.8, 5.3], [9.6, 5.35], [10.5, 5.4], [9.2, 0.65], [10.0, 0.62]].forEach(function (c, i) {
        put(c[1], person(c[0], c[1], { shirt: PSH[(i + 2) % 7], skin: SK[(i + 1) % 4], k: 0.95 + 0.1 * (i % 3), tool: i % 6 === 0 ? "bag" : undefined, skirt: i % 5 === 2 }));
      });
      [[9.1, 4.62, "#d9915a"], [10.5, 4.4, "#8a8173"], [9.35, 1.7, "#e9d9bd"], [10.7, 1.8, "#3d352c"], [9.9, 3.62, "#c8a37a"], [8.75, 5.1, "#d9915a"], [11.2, 5.3, "#8a8173"]].forEach(function (c) { put(c[1], cat(c[0], c[1], c[2])); });
      put(4.7, dog(9.5, 4.7) + dog(10.9, 4.68)); put(1.85, dog(9.8, 1.86) + dog(11.2, 1.88)); put(3.75, dog(10.4, 3.75));
      /* bocas de desagüe de concreto con chorro y mancha óxido (las del río y la del centro de datos en el mar) */
      MOUTHS.forEach(function (m, k) {
        var z = Math.max(Hz(m[0], m[1]), WL) + 0.02, q = Pz(m[0], m[1], z);
        put(m[1], '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1] + 3) + '" rx="13" ry="3.6" fill="#b8532b" fill-opacity=".55" class="mi-pollute"/><rect x="' + f1(q[0] - 7) + '" y="' + f1(q[1] - 7) + '" width="14" height="9" rx="2" fill="#b9b0a3" stroke="' + INK + '" stroke-width=".9"/><ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1] - 2.5) + '" rx="3.6" ry="2.6" fill="#3a2a20"/><path class="mi-flow" d="M' + f1(q[0]) + "," + f1(q[1]) + " q2,6 0,10" + '" fill="none" stroke="#b8532b" stroke-width="3" stroke-dasharray="3 4" stroke-linecap="round"/>');
      });
      /* torre de agua al fondo, entre la zona rural y la ciudad */
      (function () {
        var p = Pz(7.6, 5.95, Hz(7.6, 5.95)), s = shadowE(p, 20, 6);
        s += '<g stroke="' + INK + '" stroke-width="1.2"><line x1="' + f1(p[0] - 10) + '" y1="' + f1(p[1]) + '" x2="' + f1(p[0] - 6) + '" y2="' + f1(p[1] - 42) + '"/><line x1="' + f1(p[0] + 10) + '" y1="' + f1(p[1]) + '" x2="' + f1(p[0] + 6) + '" y2="' + f1(p[1] - 42) + '"/></g>' +
          '<rect x="' + f1(p[0] - 15) + '" y="' + f1(p[1] - 70) + '" width="30" height="28" rx="8" fill="url(#wall)" stroke="' + INK + '" stroke-width=".9"/>' +
          '<path d="M' + f1(p[0] - 18) + "," + f1(p[1] - 70) + " L" + f1(p[0]) + "," + f1(p[1] - 86) + " L" + f1(p[0] + 18) + "," + f1(p[1] - 70) + 'Z" fill="url(#roof)" stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"/>';
        put(5.95, s);
      })();
      (function () {
        var p = Pz(8.0, 2.3, Hz(8.0, 2.3));
        put(2.3, shadowE(p, 8, 3) +
          '<rect x="' + f1(p[0] - 5) + '" y="' + f1(p[1] - 18) + '" width="10" height="17" rx="5" fill="#c8745a" stroke="' + INK + '" stroke-width=".9"/>' +
          '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 24) + '" r="6" fill="#f0cfae" stroke="' + INK + '" stroke-width=".9"/>' +
          '<rect x="' + f1(p[0] + 4) + '" y="' + f1(p[1] - 16) + '" width="5" height="8" rx="2" fill="#9fd0dc" stroke="' + INK + '" stroke-width=".7"/>' +
          '<rect x="' + f1(p[0] - 14) + '" y="' + f1(p[1] - 11) + '" width="9" height="10" rx="2" fill="#efe3c6" stroke="' + INK + '" stroke-width=".7"/>');
      })();
      /* INDUSTRIA: una sola fábrica, más grande que las casas, con dos chimeneas y humo */
      (function () {
        var x = 11.25, y = 4.67, w = 0.8, d = 1.0, h = 0.85, z0 = Hz(x + w / 2, y + d / 2), s5 = shadowE(Pz(x + w / 2, y, z0), 70, 12) + boxO(x, y, w, d, h, z0, { front: "#e3ddd1", right: "#c4bcae", top: "#efeadf" }), k4;
        for (k4 = 0; k4 < 3; k4++) { var wa = Pz(x + 0.1, y, z0 + 0.2 + k4 * 0.17), wb = Pz(x + w - 0.1, y, z0 + 0.2 + k4 * 0.17); s5 += '<line x1="' + f1(wa[0]) + '" y1="' + f1(wa[1]) + '" x2="' + f1(wb[0]) + '" y2="' + f1(wb[1]) + '" stroke="#9fc4cf" stroke-width="5" stroke-linecap="round" stroke-dasharray="9 6"/>'; }
        var saw = "";
        [0.15, 0.45].forEach(function (fx) { var a = Pz(x + fx, y + 0.2, z0 + h), b4 = Pz(x + fx + 0.14, y + 0.2, z0 + h), c4 = Pz(x + fx + 0.14, y + 0.2, z0 + h + 0.2); saw += poly([a, b4, c4], "#d6cfc2"); });
        put(y, s5 + saw);
        [[11.4, 5.5], [11.75, 5.55]].forEach(function (c, idx) {
          var b = Pz(c[0], c[1], z0 + h * 0.6), sm = "";
          for (var k5 = 0; k5 < 3; k5++) sm += '<circle class="mi-puff" cx="' + f1(b[0]) + '" cy="' + f1(b[1] - 96) + '" r="10" fill="#fff" stroke="' + INK + '" stroke-width=".7" style="animation-delay:' + (-k5 * 1.13 - idx * 0.5) + 's"/>';
          put(c[1], '<rect x="' + f1(b[0] - 8) + '" y="' + f1(b[1] - 92) + '" width="16" height="92" rx="3" fill="#cfc7b8" stroke="' + INK + '" stroke-width=".9"/><rect x="' + f1(b[0] - 8) + '" y="' + f1(b[1] - 92) + '" width="16" height="9" fill="#c8745a"/>' + sm);
        });
      })();
      /* CENTRO DE DATOS: caja con rejillas, ventiladores y gota */
      (function () {
        var x = 11.2, y = 0.7, w = 0.9, d = 1.0, h = 0.95, z0 = Hz(x + w / 2, y + d / 2), s = shadowE(Pz(x + w / 2, y, z0), 100, 14) + boxO(x, y, w, d, h, z0, { front: "#dcd5c8", right: "#bfb7a9", top: "#ece7dc" });
        for (var k = 0; k < 7; k++) {
          var a = Pz(x + 0.1, y, z0 + 0.1 + k * 0.1), b2 = Pz(x + w - 0.1, y, z0 + 0.1 + k * 0.1);
          s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b2[0]) + '" y2="' + f1(b2[1]) + '" stroke="rgba(61,53,44,.38)" stroke-width="3" stroke-linecap="round"/>';
        }
        var dr = Pz(x + w * 0.82, y, z0 + h * 0.5);
        s += '<path d="M' + f1(dr[0]) + "," + f1(dr[1] - 9) + " C" + f1(dr[0] + 7) + "," + f1(dr[1] - 1) + " " + f1(dr[0] + 6) + "," + f1(dr[1] + 6) + " " + f1(dr[0]) + "," + f1(dr[1] + 6) + " C" + f1(dr[0] - 6) + "," + f1(dr[1] + 6) + " " + f1(dr[0] - 7) + "," + f1(dr[1] - 1) + " " + f1(dr[0]) + "," + f1(dr[1] - 9) + 'Z" fill="#3f9db4" stroke="#fff" stroke-width="1.2"/>';
        [0.25, 0.62].forEach(function (fx, idx) {
          var c = Pz(x + fx, y + d * 0.5, z0 + h);
          s += '<ellipse cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" rx="17" ry="6" fill="url(#grey)" stroke="' + INK + '" stroke-width=".9"/><circle class="mi-puff" cx="' + f1(c[0]) + '" cy="' + f1(c[1] - 4) + '" r="8" fill="#fff" stroke="' + INK + '" stroke-width=".6" style="animation-delay:' + (-idx * 1.6) + 's"/>';
        });
        put(y, s);
      })();
      /* bombas de pozo en el borde frontal (su tubo baja por el corte lateral hasta el agua subterránea) */
      [5.6, 7.9, 9.3, 11.7].forEach(function (wx) {
        var wy = 0.42, p = Pz(wx, wy, Hz(wx, wy));
        put(wy, shadowE(p, 14, 4) + '<rect x="' + f1(p[0] - 7) + '" y="' + f1(p[1] - 16) + '" width="14" height="16" rx="3" fill="#8a8173" stroke="' + INK + '" stroke-width=".8"/><rect x="' + f1(p[0] - 11) + '" y="' + f1(p[1] - 21) + '" width="22" height="6" rx="3" fill="#6f675b" stroke="' + INK + '" stroke-width=".8"/>');
      });
      /* olas y mancha cálida de El Niño en el mar */
      for (var wv = 0; wv < 6; wv++) {
        var wy2 = 0.5 + wv * 0.9, a = Pz(13.25, wy2, WL + 0.02), b3 = Pz(13.95, wy2, WL + 0.02);
        buckets[row(wy2)].t.push('<line class="mi-wave" x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b3[0]) + '" y2="' + f1(b3[1]) + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="9 15"/>');
      }

      /* barca de pescadores en el mar y peces bajo el agua */
      (function () {
        var b = Pz(13.5, 4.7, WL + 0.03), fish = "";
        [[13.3, 3.4], [13.6, 1.0], [13.45, 5.3]].forEach(function (f) {
          var q = Pz(f[0], f[1], WL + 0.02);
          fish += '<g opacity=".8"><ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="9" ry="3.4" fill="#2f7f99"/><path d="M' + f1(q[0] - 8) + "," + f1(q[1]) + " l-6,-4 v8Z" + '" fill="#2f7f99"/></g>';
        });
        buckets[row(3.4)].t.push(fish);
        var boat = '<ellipse cx="' + f1(b[0]) + '" cy="' + f1(b[1] + 3) + '" rx="30" ry="6" fill="rgba(70,56,44,.18)"/><path d="M' + f1(b[0] - 28) + "," + f1(b[1] - 4) + " L" + f1(b[0] + 28) + "," + f1(b[1] - 4) + " L" + f1(b[0] + 20) + "," + f1(b[1] + 6) + " L" + f1(b[0] - 20) + "," + f1(b[1] + 6) + 'Z" fill="#c8745a" stroke="' + INK + '" stroke-width=".9"/>' +
          '<line x1="' + f1(b[0]) + '" y1="' + f1(b[1] - 4) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1] - 40) + '" stroke="#7a5a3a" stroke-width="2"/><path d="M' + f1(b[0] + 2) + "," + f1(b[1] - 38) + " L" + f1(b[0] + 22) + "," + f1(b[1] - 8) + " L" + f1(b[0] + 2) + "," + f1(b[1] - 8) + 'Z" fill="#fbf8f2" stroke="' + INK + '" stroke-width=".8"/>' +
          '<circle cx="' + f1(b[0] - 14) + '" cy="' + f1(b[1] - 14) + '" r="4.6" fill="' + SK[2] + '" stroke="' + INK + '" stroke-width=".8"/><rect x="' + f1(b[0] - 18.5) + '" y="' + f1(b[1] - 10) + '" width="9" height="7" rx="3" fill="#6fa3b5" stroke="' + INK + '" stroke-width=".8"/>';
        buckets[row(4.7)].o.push(boat);
      })();
      var warm = [], q2;
      for (q2 = 0; q2 < 40; q2++) { var an4 = (q2 / 40) * Math.PI * 2; warm.push(Pz(13.5 + 0.38 * Math.cos(an4), 2.0 + 0.95 * Math.sin(an4), WL + 0.02)); }
      var mouth = [], q3;
      for (q3 = 0; q3 < 30; q3++) { var an5 = (q3 / 30) * Math.PI * 2; mouth.push(Pz(13.35 + 0.62 * Math.cos(an5), 2.85 + 1.25 * Math.sin(an5), WL + 0.03)); }
      SRC.forEach(function (S, k) {
        if (!S.sea) return;
        var st2 = [], q4;
        for (q4 = 0; q4 < 24; q4++) { var an6 = (q4 / 24) * Math.PI * 2; st2.push(Pz(S.sea[0] + 0.4 + 0.42 * Math.cos(an6), S.sea[1] + 0.55 * Math.sin(an6), WL + 0.03)); }
        buckets[row(S.sea[1] - 0.3)].t.push('<polygon class="mi-stain" style="animation-delay:' + (-k * 0.9) + 's" points="' + st2.map(pt).join(" ") + '" fill="#4a2818" fill-opacity=".55" stroke="none"/>');
      });
      buckets[row(1.7)].t.push('<polygon class="mi-stain" points="' + mouth.map(pt).join(" ") + '" fill="#4a2818" fill-opacity=".55" stroke="none"/>');
      buckets[row(1.1)].t.push('<polygon class="mi-warm" points="' + warm.map(pt).join(" ") + '" fill="#e8895f" fill-opacity=".6"/>');
    } else {
      /* en el cuadro de transición solo se insinúan los campos como manchas planas */
      decal([[5.2, 3.95], [7.7, 3.95], [7.7, 5.3], [5.2, 5.3]], "#cbbd86", "");
      decal([[5.2, 0.75], [8.0, 0.75], [8.0, 2.05], [5.2, 2.05]], "#cbbd86", "");
    }

    var out = "";
    for (j = NY - 1; j >= 0; j--) out += buckets[j].t.join("") + buckets[j].o.join("");

    /* corte frontal: suelo, capa sin saturar, acuífero (agua subterránea) y roca */
    var xs = [], N2 = 56, top = [], b1 = [], b2 = [];
    for (i = 0; i <= N2; i++) {
      var xx = (i / N2) * LX; xs.push(xx);
      var tp2 = Hz(xx, 0), w2 = wt(xx);
      top.push(tp2); b2.push(w2);
      b1.push(Math.max(w2 + 0.05, Math.min(tp2 - 0.02, Math.min(tp2 - 0.45, 0.62))));
    }
    /** @BAUTO_REFACTOR 2026-11-02 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Función auxiliar de dibujo o animación de la escena. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function band(up, lo, fill, op) {
      var pts = [], k;
      for (k = 0; k <= N2; k++) pts.push(Pz(xs[k], 0, typeof up === "function" ? up(k) : up));
      for (k = N2; k >= 0; k--) pts.push(Pz(xs[k], 0, typeof lo === "function" ? lo(k) : lo));
      return '<polygon points="' + pts.map(pt).join(" ") + '" fill="' + fill + '"' + (op ? ' fill-opacity="' + op + '"' : "") + ' stroke="rgba(70,56,44,.22)" stroke-width=".8" stroke-linejoin="round"/>';
    }
    out += band(function (k) { return top[k]; }, function (k) { return b1[k]; }, "#b58c69");
    out += band(function (k) { return b1[k]; }, function (k) { return b2[k]; }, "#cdb592");
    out += band(function (k) { return b2[k]; }, -0.65, "#79bdd0");
    out += band(-0.65, -1.6, "#9a9083");
    /* mar en el corte frontal */
    (function () {
      var pts = [], k, any = false;
      for (k = 0; k <= N2; k++) if (top[k] < WL && xs[k] > 12) { pts.push(Pz(xs[k], 0, top[k])); any = true; }
      if (any) {
        var first = pts[0], last = pts[pts.length - 1];
        out += '<polygon points="' + pt(Pz(first ? xs[N2 - pts.length + 1] : 12, 0, WL)) + " " + pt(Pz(LX, 0, WL)) + " " + pts.slice().reverse().map(pt).join(" ") + '" fill="#6cb6cb" fill-opacity=".9" stroke="rgba(70,56,44,.2)" stroke-width=".8"/>';
      }
    })();
    /* ondulación del nivel freático y texto de sección */
    var wtPath = "";
    for (i = 0; i <= N2; i++) wtPath += (i ? "L" : "M") + pt(Pz(xs[i], 0, b2[i]));
    out += '<path d="' + wtPath + '" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.4" stroke-dasharray="3 9" stroke-linecap="round" class="mi-flow"/>';
    /* tubos de los pozos por el corte frontal */
    if (objs) {
      [5.6, 7.9, 9.3, 11.7].forEach(function (wx) {
        var ii = Math.round((wx / LX) * N2), a = Pz(wx, 0, top[ii]), b = Pz(wx, 0, b2[ii] - 0.12);
        out += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="#5b564e" stroke-width="4" stroke-linecap="round"/>' +
          '<rect x="' + f1(b[0] - 6) + '" y="' + f1(b[1] - 2) + '" width="12" height="9" rx="2" fill="#5b564e"/>';
      });
    }
    /* cara derecha (lado del mar) */
    (function () {
      var A = [Pz(LX, 0, -1.6), Pz(LX, LY, -1.6), Pz(LX, LY, -0.65), Pz(LX, 0, -0.65)], B = [Pz(LX, 0, -0.65), Pz(LX, LY, -0.65), Pz(LX, LY, 0.12), Pz(LX, 0, 0.12)], C = [Pz(LX, 0, 0.12), Pz(LX, LY, 0.12), Pz(LX, LY, WL), Pz(LX, 0, WL)];
      out += poly(A, "#8a8073", 1, 0.8) + poly(B, "#6aaec2", 1, 0.8) + poly(C, "#6cb6cb", 0.9, 0.8);
    })();
    /* contorno del bloque */
    out += '<path d="M' + pt(Pz(0, 0, -1.6)) + " L" + pt(Pz(LX, 0, -1.6)) + " L" + pt(Pz(LX, 0, WL)) + " L" + pt(Pz(0, 0, top[0])) + 'Z" fill="none" stroke="rgba(70,56,44,.5)" stroke-width="1.4" stroke-linejoin="round"/>';

    /* nubes y lluvia */
    if (objs) {
      var cloudG = function (p, k, delay) {
        var c = [[-22, 5, 14], [-4, -7, 19], [17, -2, 16], [30, 6, 11], [-34, 8, 9], [6, 8, 14]], g = "";
        c.forEach(function (d) { g += '<circle cx="' + d[0] * k + '" cy="' + d[1] * k + '" r="' + d[2] * k + '" fill="url(#cloud)" stroke="' + INK + '" stroke-width=".9"/>'; });
        return '<g transform="translate(' + f1(p[0]) + "," + f1(p[1]) + ')"><g class="mi-float" style="animation-delay:' + delay + 's">' + g + "</g></g>";
      };
      var pk = Pz(1.1, 4.7, Hz(1.1, 4.7) + 0.55), rain = "";
      for (var r = -3; r <= 3; r++) rain += '<line class="mi-rain" x1="' + f1(pk[0] + r * 11) + '" y1="' + f1(pk[1] + 4) + '" x2="' + f1(pk[0] + r * 11) + '" y2="' + f1(pk[1] + 46) + '" stroke="#5fa9bd" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 9"/>';
      out += rain + cloudG([pk[0], pk[1] - 30], 1.25, 0) + cloudG(Pz(13.4, 3.3, 3.3), 1.15, -2);
      out += cloudG(Pz(3.2, 5.6, Hz(3.2, 5.6) + 1.5), 1.05, -1) + cloudG(Pz(4.7, 5.3, Hz(4.7, 5.3) + 1.9), 0.9, -3) + cloudG(Pz(2.2, 3.8, 5.3), 0.8, -4) + cloudG(Pz(13.2, 1.5, 2.5), 1.0, -1.5) + cloudG(Pz(13.7, 5.0, 3.1), 1.05, -3.5) + cloudG(Pz(12.9, 4.2, 4.6), 0.8, -0.5);
      var pk2 = Pz(3.2, 5.6, Hz(3.2, 5.6) + 1.2), rain2 = "";
      for (var r3 = -2; r3 <= 2; r3++) rain2 += '<line class="mi-rain" x1="' + f1(pk2[0] + r3 * 11) + '" y1="' + f1(pk2[1] + 4) + '" x2="' + f1(pk2[0] + r3 * 11) + '" y2="' + f1(pk2[1] + 36) + '" stroke="#5fa9bd" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 9"/>';
      out += rain2;

      /* aves: un cóndor andino sobre la montaña, una bandada sobre el campo y gaviotas en el mar */
      function bird(p, k, col) { return '<path d="M' + f1(p[0] - 9 * k) + "," + f1(p[1]) + " Q" + f1(p[0] - 4.5 * k) + "," + f1(p[1] - 7 * k) + " " + f1(p[0]) + "," + f1(p[1]) + " Q" + f1(p[0] + 4.5 * k) + "," + f1(p[1] - 7 * k) + " " + f1(p[0] + 9 * k) + "," + f1(p[1]) + '" fill="none" stroke="' + (col || "#4a4036") + '" stroke-width="' + f1(2.2 * k) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
      var cond = Pz(3.4, 4.6, 5.3);
      out += '<path d="M' + f1(cond[0] - 36) + "," + f1(cond[1] + 4) + " Q" + f1(cond[0] - 14) + "," + f1(cond[1] - 14) + " " + f1(cond[0]) + "," + f1(cond[1]) + " Q" + f1(cond[0] + 14) + "," + f1(cond[1] - 14) + " " + f1(cond[0] + 36) + "," + f1(cond[1] + 4) + '" fill="none" stroke="#3d352c" stroke-width="5" stroke-linecap="round"/><circle cx="' + f1(cond[0]) + '" cy="' + f1(cond[1] + 1) + '" r="3.4" fill="#3d352c"/>';
      [[6.4, 4.2, 3.2, 1], [7.0, 3.4, 3.5, 0.85], [7.7, 4.6, 3.0, 0.9], [8.3, 3.2, 3.3, 0.7]].forEach(function (b) { out += bird(Pz(b[0], b[1], b[2]), b[3] * 1.2); });
      [[13.2, 3.9, 2.0, 1], [13.6, 1.4, 2.3, 0.9]].forEach(function (b) { out += bird(Pz(b[0], b[1], b[2]), b[3] * 1.2, "#7a7268"); });
      /* nube y gota en el campo (cuadro de ejemplo) */
      if (opt.drop) {
        var q = Pz(opt.drop[0], opt.drop[1], Hz(opt.drop[0], opt.drop[1]) + 0.45);
        out += '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="17" fill="#6fb8c9" fill-opacity=".3"/>' +
          '<path d="M' + f1(q[0]) + "," + f1(q[1] - 14) + " C" + f1(q[0] + 11) + "," + f1(q[1] - 2) + " " + f1(q[0] + 10) + "," + f1(q[1] + 9) + " " + f1(q[0]) + "," + f1(q[1] + 9) + " C" + f1(q[0] - 10) + "," + f1(q[1] + 9) + " " + f1(q[0] - 11) + "," + f1(q[1] - 2) + " " + f1(q[0]) + "," + f1(q[1] - 14) + 'Z" fill="#3f9db4" stroke="#fff" stroke-width="2"/>';
      }
    }
    lastHz = Hz;
    return out;
  }

  var lastHz = null;

  var DEFS = '<defs>' +
    '<radialGradient id="leaf" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#a6c88f"/><stop offset="1" stop-color="#6f9a62"/></radialGradient>' +
    '<linearGradient id="wall"><stop offset="0" stop-color="#f8f0e3"/><stop offset=".55" stop-color="#eadfcd"/><stop offset="1" stop-color="#cfbfa6"/></linearGradient>' +
    '<linearGradient id="grey"><stop offset="0" stop-color="#f2eee7"/><stop offset=".55" stop-color="#ded7cb"/><stop offset="1" stop-color="#b9b0a3"/></linearGradient>' +
    '<linearGradient id="roof"><stop offset="0" stop-color="#d98a70"/><stop offset=".6" stop-color="#c8745a"/><stop offset="1" stop-color="#a65a43"/></linearGradient>' +
    '<linearGradient id="top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8f2"/><stop offset="1" stop-color="#d9d1c4"/></linearGradient>' +
    '<radialGradient id="cloud" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe8ea"/></radialGradient>' +
    '<radialGradient id="ocean" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="#9bd6e1"/><stop offset="1" stop-color="#3f93ad"/></radialGradient>' +
    '<radialGradient id="shade" cx=".36" cy=".3" r=".8"><stop offset=".55" stop-color="#3d352c" stop-opacity="0"/><stop offset="1" stop-color="#3d352c" stop-opacity=".34"/></radialGradient>' +
    '<clipPath id="gclip"><circle r="190"/></clipPath></defs>';



  /* ---------- animación: el bloque aparece en píxeles y después muchas gotas pequeñas recorren el ciclo ---------- */
  var REVEAL = 3.2, CELL = 48, NOMINAL = 36;
  var W = function (x, y, dz) { return Pz(x, y, lastHz(x, y) + dz); };
  var A = function (x, y, z) { return Pz(x, y, z); };
  var WATER = { fill: "#3f93ad", stroke: "#fff" }, VAPOR = { fill: "#fff", stroke: "#3f93ad" }, DIRTY = { fill: "#b8532b", stroke: "#f6e4d4" };

  /** Curva suave (Catmull-Rom) por los puntos del río en coordenadas del mundo. */
  function crPts2(P0, n) {
    var out = [];
    /** @BAUTO_REFACTOR 2026-11-03 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Interpolación Catmull-Rom de un tramo. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function cr(a, b, c, d3, t) { return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d3) * t * t + (-a + 3 * b - 3 * c + d3) * t * t * t); }
    for (var m = 0; m <= n; m++) {
      var u = (m / n) * (P0.length - 1), i0 = Math.min(P0.length - 2, Math.floor(u)), f = u - i0;
      var p0 = P0[Math.max(0, i0 - 1)], p1 = P0[i0], p2 = P0[i0 + 1], p3 = P0[Math.min(P0.length - 1, i0 + 2)];
      out.push([cr(p0[0], p1[0], p2[0], p3[0], f), cr(p0[1], p1[1], p2[1], p3[1], f)]);
    }
    return out;
  }

  /** Longitudes acumuladas de una polilínea de pantalla (para recorrerla a velocidad pareja). */
  function withLen(path) {
    var len = [0], i;
    for (i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    return { path: path, len: len, L: len[len.length - 1] };
  }

  /** Punto de una polilínea con longitudes a la distancia d (en píxeles) desde su inicio. */
  function pointAt(pl, d) {
    var target = clamp(d, 0, pl.L), i = 1;
    while (i < pl.len.length - 1 && pl.len[i] < target) i++;
    var seg = pl.len[i] - pl.len[i - 1] || 1, f = (target - pl.len[i - 1]) / seg;
    return [pl.path[i - 1][0] + (pl.path[i][0] - pl.path[i - 1][0]) * f, pl.path[i - 1][1] + (pl.path[i][1] - pl.path[i - 1][1]) * f];
  }

  /* ciclo natural: ruta 1 (superficie) y ruta 2 (riego, acuífero y bombeo); contaminación: seis vertidos antrópicos que se mezclan con río, acuífero y mar */
  function stageDefs() {
    var rs = crPts2(RIVER, 150), per = 150 / (RIVER.length - 1);
    /** Tramo del río (índices de puntos de control a..b) a la altura dz sobre el agua. */
    function riverPath(a, b, dz) { var o = [], i; for (i = Math.round(a * per); i <= Math.round(b * per); i++) o.push(W(rs[i][0], rs[i][1], dz)); return o; }
    /** Río desde la primera muestra con x >= x0 hasta el mar. */
    function riverFrom(x0, dz) { var o = [], i; for (i = 0; i < rs.length; i++) if (rs[i][0] >= x0) o.push(W(rs[i][0], rs[i][1], dz)); return o; }
    /** Curva cuadrática (3 puntos) o recta (2) muestreada. */
    function curve(p) {
      var o = [], i, u;
      for (i = 0; i <= 36; i++) {
        u = i / 36;
        o.push(p.length === 3
          ? [(1 - u) * (1 - u) * p[0][0] + 2 * (1 - u) * u * p[1][0] + u * u * p[2][0], (1 - u) * (1 - u) * p[0][1] + 2 * (1 - u) * u * p[1][1] + u * u * p[2][1]]
          : [p[0][0] + (p[1][0] - p[0][0]) * u, p[0][1] + (p[1][1] - p[0][1]) * u]);
      }
      return o;
    }
    var R1 = [
      { d: 3, vap: 1, pts: [A(13.6, 1.9, 0.9), A(13.9, 2.5, 1.6), A(13.5, 3.0, 2.7)] },
      { d: 1.6, vap: 1, pts: [A(13.5, 3.0, 2.7), A(13.4, 3.3, 3.9)] },
      { d: 5.5, vap: 1, pts: [A(13.1, 3.4, 3.9), A(7.4, 5.8, 7.4), A(2.9, 5.2, 5.7)] },
      { d: 3, pts: [A(2.9, 5.2, 5.7), A(2.0, 5.0, 4.4), W(2.35, 4.5, 0.3)] },
      { d: 4.5, riv: [0, 5], dz: 0.35 },
      { d: 3, pts: [A(3.6, 3.45, 0.95), A(3.1, 3.0, 0.95), A(4.05, 3.0, 0.97)] },
      { d: 1.8, pts: [A(4.05, 3.0, 0.98), A(4.9, 3.0, 1.0), W(5.1, 3.0, 0.3)] },
      { d: 3, riv: [7, 10], dz: 0.3 },
      { d: 4, riv: [10, 14], dz: 0.3 },
      { d: 1.5, riv: [14, 15], dz: 0.3 }
    ];
    var R2 = [
      { d: 2, riv: [6, 7], dz: 0.3 },
      { d: 2.5, pts: [W(5.5, 2.95, 0.3), W(5.7, 2.7, 0.4), W(5.7, 2.3, 0.4)] },
      { d: 3, pts: [W(5.7, 2.3, 0.2), A(5.7, 0.9, 0.2), A(5.7, 0, -0.45)] },
      { d: 7, pts: [A(5.7, 0, -0.45), A(7.5, 0, -0.6), A(9.4, 0, -0.45)] },
      { d: 3, pts: [A(9.4, 0, -0.45), A(9.4, 0.5, 0.2), W(9.35, 1.9, 0.5)] },
      { d: 2.5, pts: [W(9.35, 1.9, 0.5), W(9.55, 2.9, 0.6), W(9.2, 3.3, 0.3)] },
      { d: 3.5, riv: [11, 14], dz: 0.3 },
      { d: 1.5, riv: [14, 15], dz: 0.3 }
    ];
    [R1, R2].forEach(function (R) {
      var prev = null;
      R.total = 0;
      R.forEach(function (st) {
        var path = st.riv ? riverPath(st.riv[0], st.riv[1], st.dz) : curve(st.pts), pl;
        if (prev) path.unshift(prev);
        prev = path[path.length - 1];
        pl = withLen(path);
        st.path = pl.path; st.len = pl.len; st.L = pl.L;
        st.t0 = R.total;
        R.total += st.d;
      });
    });
    /* vertidos: n gotas, velocidad en píxeles por segundo, y el punto donde nace el foco */
    var STAIN = [13.35, 2.85];
    var POL = [
      { n: 5, v: 105, src: SRC[0] },
      { n: 4, v: 105, pts: [W(5.7, 2.35, 0.2), A(5.7, 0.9, 0.2), A(5.7, 0, -0.3), A(7.5, 0, -0.38), A(9.4, 0, -0.3), A(11.5, 0, -0.36), A(13.2, 0, -0.36)] },
      { n: 3, v: 100, src: SRC[3] },
      { n: 3, v: 100, src: SRC[1] },
      { n: 4, v: 100, src: SRC[2] },
      { n: 3, v: 100, src: SRC[4] },
      { n: 2, v: 100, src: SRC[5] },
      { n: 2, v: 100, src: SRC[6] },
      { n: 2, v: 100, src: SRC[7] }
    ];
    POL.forEach(function (P) {
      var path, pipe = null;
      if (P.src) {
        var S = P.src, end = S.sea ? S.sea : riverAtX(S.jx);
        pipe = [W(S.pt[0], S.pt[1], 0.05)].concat(S.via.map(function (v) { return W(v[0], v[1], 0.05); }), [W(end[0], end[1], 0.2)]);
        path = pipe.slice();
        if (S.sea) path.push(W(S.sea[0] + 0.4, S.sea[1], 0.1)); else path = path.concat(riverFrom(end[0] + 0.01, 0.3), [W(STAIN[0], STAIN[1], 0.1)]);
        P.pts = [path[0]];
        P.pipeL = withLen(pipe).L;
      } else path = P.pts.slice();
      var pl = withLen(path);
      P.path = pl.path; P.len = pl.len; P.L = pl.L;
    });
    return { r1: R1, r2: R2, pol: POL };
  }

  var markup = null, refs = null, raf = 0, running = false, startMs = null, seek = 0, frozen = false;

  /** Aleatorio determinista por celda (para que el efecto de píxeles sea idéntico en cada pasada y en las capturas). */
  function hash2(a, b) { var v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); }

  /** Construye una sola vez el SVG pesado: escena completa, máscara de píxeles, focos de vertido, título y gotas. */
  function buildMarkup() {
    var full = diorama({ zk: 1, objs: true });
    var st = stageDefs(), svg = DEFS, i, j, cells = "", cols = Math.ceil(1920 / CELL), rows = Math.ceil(1080 / CELL), delays = [];
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      delays.push(0.9 * (1 - (j + 0.5) / rows) + 1.55 * hash2(i, j));
      cells += '<rect x="' + i * CELL + '" y="' + j * CELL + '" width="' + CELL + '" height="' + CELL + '" fill="#fff" fill-opacity="0" shape-rendering="crispEdges"/>';
    }
    svg += '<mask id="miMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><g id="miCells">' + cells + "</g></mask>";
    svg += '<g id="miL1" mask="url(#miMask)">' + full + "</g>";
    var rings = "";
    st.pol.map(function (P) { return P.pts[0]; }).forEach(function (p, k) {
      rings += '<circle class="mi-ring" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="16" fill="none" stroke="#b8532b" stroke-width="3" style="animation-delay:' + (-k * 0.45) + 's"/>' +
        '<circle class="mi-pollute" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="7" fill="#b8532b" fill-opacity=".5" stroke="none"/>';
    });
    svg += '<g id="miRings" opacity="0">' + rings + "</g>";
    svg += '<g id="miTitle" opacity="0"><text x="1860" y="138" text-anchor="end" font-size="92" font-weight="800" letter-spacing="-1" fill="#3d352c">Our Water, Our Choices</text><text x="1860" y="198" text-anchor="end" font-size="36" font-weight="700" fill="#8a7f70">Orlando Bojacá</text></g>';
    var drops = "", n1 = 16, n2 = 10, np = 0, k;
    st.pol.forEach(function (P) { np += P.n; });
    for (k = 0; k < n1 + n2; k++) drops += '<path id="miD' + k + '" opacity="0" d="M0,-9 C7,-2 6,6 0,6 C-6,6 -7,-2 0,-9Z" fill="#3f93ad" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>';
    for (k = 0; k < np; k++) drops += '<path id="miP' + k + '" opacity="0" d="M0,-8 C6,-2 6,5 0,5 C-6,5 -6,-2 0,-8Z" fill="#b8532b" stroke="#f6e4d4" stroke-width="1.3" stroke-linejoin="round"/>';
    svg += '<g id="miDrops">' + drops + "</g>";
    return { svg: svg, stages: st, n1: n1, n2: n2, np: np, delays: delays, cols: cols, rows: rows };
  }

  /** Dibuja un instante t (segundos desde que arranca la diapositiva): el bloque aparece en píxeles y, después, las gotas siguen el ciclo. */
  function render(t) {
    var r = refs, i;
    if (!r.done) {
      for (i = 0; i < r.cells.length; i++) {
        var o = smooth(markup.delays[i], markup.delays[i] + 0.4, t);
        if (o !== r.cellOp[i]) { r.cellOp[i] = o; r.cells[i].setAttribute("fill-opacity", f1(o * 100) / 100); }
      }
      if (t >= REVEAL + 0.1) { r.l1.removeAttribute("mask"); r.done = true; }
    }
    var ti = smooth(0.3, 1.4, t);
    r.title.setAttribute("opacity", f1(ti));
    r.title.setAttribute("transform", "translate(0 " + f1((1 - ti) * 18) + ")");
    var fo = smooth(REVEAL - 0.2, REVEAL + 0.8, t);
    r.rings.setAttribute("opacity", f1(fo));
    var S = markup.stages, k = 0, ri, j, g, p, s, u;
    var routes = [{ R: S.r1, n: markup.n1 }, { R: S.r2, n: markup.n2 }];
    for (ri = 0; ri < routes.length; ri++) {
      var R = routes[ri].R, n = routes[ri].n, sp = R.total / n;
      for (j = 0; j < n; j++, k++) {
        g = r.water[k];
        var ph = (((t - REVEAL + ri * 1.3 + j * sp) % R.total) + R.total) % R.total, si = 0;
        while (si < R.length - 1 && R[si + 1].t0 <= ph) si++;
        s = R[si]; u = (ph - s.t0) / s.d; p = pointAt(s, s.L * u);
        var vis = smooth(REVEAL - 0.3 + (k % 7) * 0.12, REVEAL + 0.6 + (k % 7) * 0.12, t) * (si === 0 ? smooth(0, 0.6, ph - s.t0) : 1) * (si === R.length - 1 ? smooth(s.d, s.d - 0.6, ph - s.t0) : 1);
        g.el.setAttribute("opacity", f1(vis));
        g.el.setAttribute("transform", "translate(" + f1(p[0]) + " " + f1(p[1]) + ") scale(" + g.sc + ")");
        var key = ri * 100 + si;
        if (g.si !== key) { g.si = key; var c = s.vap ? VAPOR : WATER; g.el.setAttribute("fill", c.fill); g.el.setAttribute("stroke", c.stroke); }
      }
    }
    k = 0;
    S.pol.forEach(function (P) {
      var q, sp2 = P.L / P.n;
      for (q = 0; q < P.n; q++, k++) {
        g = r.dirty[k];
        var d = ((((t - REVEAL) * P.v + q * sp2) % P.L) + P.L) % P.L;
        p = pointAt(P, d);
        var vp = smooth(REVEAL - 0.1 + (k % 5) * 0.15, REVEAL + 0.8 + (k % 5) * 0.15, t) * smooth(0, 50, d) * smooth(P.L, P.L - 60, d) * (P.pipeL && d < P.pipeL ? 0.5 : 1);
        g.el.setAttribute("opacity", f1(vp));
        g.el.setAttribute("transform", "translate(" + f1(p[0]) + " " + f1(p[1]) + ") scale(" + g.sc + ")");
      }
    });
  }

  /** Bucle de animación: avanza el reloj y redibuja; con ?freeze=1 queda fijo en el segundo ?mt=. */
  function frame(now) {
    if (!running) return;
    render(frozen ? seek : ((now - startMs) / 1000) + seek);
    raf = window.requestAnimationFrame(frame);
  }

  /** Detiene la animación y libera referencias al salir de la diapositiva 0. */
  function unmount() {
    running = false;
    if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
    raf = 0;
    refs = null;
  }

  /** Monta la escena dentro de un contenedor y arranca el bucle; conserva el reloj salvo que se pida reiniciar. */
  function mount(container, restart) {
    unmount();
    if (!container || !window.requestAnimationFrame) return;
    if (!markup) markup = buildMarkup();
    var qs = window.location.search || "", m = /[?&]mt=([0-9.]+)/.exec(qs), i;
    seek = m ? parseFloat(m[1]) : 0;
    frozen = /[?&]freeze=1/.test(qs);
    container.innerHTML = '<svg class="mi-world" viewBox="0 0 1920 1080" role="img" aria-label="A block of land appears pixel by pixel: a snow-capped mountain with a páramo, a reservoir, farmland, a city, a factory and a data center beside the sea, with animals and people. Many small drops of water flow through the natural cycle, and rust-colored drops from farms, the city, the factory and the data center mix into the river, the aquifer and the sea.">' + markup.svg + "</svg>";
    refs = { l1: container.querySelector("#miL1"), title: container.querySelector("#miTitle"), rings: container.querySelector("#miRings"), cells: container.querySelectorAll("#miCells rect"), cellOp: [], water: [], dirty: [], done: false };
    for (i = 0; i < refs.cells.length; i++) refs.cellOp.push(-1);
    for (i = 0; i < markup.n1 + markup.n2; i++) refs.water.push({ el: container.querySelector("#miD" + i), si: -1, sc: f1(0.8 + 0.3 * hash2(i, 5)) });
    for (i = 0; i < markup.np; i++) refs.dirty.push({ el: container.querySelector("#miP" + i), sc: f1(0.8 + 0.3 * hash2(i, 9)) });
    if (restart || startMs === null) startMs = window.performance ? window.performance.now() : Date.now();
    running = true;
    raf = window.requestAnimationFrame(frame);
  }

  window.MundoIntro = { mount: mount, unmount: unmount, LOOP: NOMINAL };

})();
