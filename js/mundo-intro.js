/**
 * @file mundo-intro.js
 * @description Diapositiva 0 de "Our Water, Our Choices": el mundo gira, la cámara se acerca a un trozo
 * que se aplana en un bloque ancho y el relieve sube; una gota de agua recorre el bloque de izquierda a derecha
 * (mar, nubes y El Niño, montañas y embalse, campo, ciudad, fábrica y centro de datos, y de vuelta al mar) entre
 * animales silvestres y domésticos y comunidades. El corte lateral muestra el agua subterránea, que baja cuando se usa.
 * Es un gancho visual de ~44 s en bucle que acompaña la pregunta de apertura; no lleva cifras en pantalla.
 *
 * Todo se dibuja con SVG generado por script (cero librerías, cero imágenes externas, 100% offline).
 * Deriva de la skill `mundo-isometrico-organico`, con proyección oblicua (vista de diorama) en vez de isométrica.
 * El diseño fue aprobado como boceto en boceto/boceto_diapositiva0.html.
 *
 * API: `window.MundoIntro.mount(contenedor, reiniciar)`, `.unmount()`.
 * Depuración para capturas: `?mt=12` fija el segundo de la línea de tiempo, `&freeze=1` congela la escena.
 */
(function () {
  "use strict";


/* ---------- proyección oblicua: x → derecha, y → hacia atrás (arriba y a la derecha), z → arriba ---------- */
  var SX = 108, SKX = 28, SY = 36, SZ = 74, X0 = 120, Y0 = 842;
  var LX = 14, LY = 6, DX = 0.25, DY = 0.25, WL = 0.55, LW = 0.78, INK = "rgba(70,56,44,.42)";

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Proyección oblicua de un punto 3D del bloque a coordenadas de pantalla. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function Pz(x, y, z) { return [X0 + x * SX + y * SKX, Y0 - y * SY - z * SZ]; }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Redondea a 1 decimal para acortar el SVG. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function f1(n) { return Math.round(n * 10) / 10; }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Convierte un punto [x,y] en texto "x,y". @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function pt(p) { return f1(p[0]) + "," + f1(p[1]); }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Limita un número a un rango. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Interpolación suave (smoothstep). @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Mezcla lineal de dos colores RGB. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Texto CSS rgb() con factor de luminosidad. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function rgb(c, f) { f = f || 1; return "rgb(" + Math.round(Math.min(255, c[0] * f)) + "," + Math.round(Math.min(255, c[1] * f)) + "," + Math.round(Math.min(255, c[2] * f)) + ")"; }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Convierte "#rrggbb" en [r,g,b]. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Campana gaussiana 2D para modelar montañas y colinas. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function g2(x, y, cx, cy, sx, sy) { var a = (x - cx) / sx, b = (y - cy) / sy; return Math.exp(-(a * a + b * b) / 2); }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Campana gaussiana 1D. @Capa: Técnica @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function g1(x, c, s) { return Math.exp(-Math.pow((x - c) / s, 2) / 2); }

  /* ---------- terreno ---------- */
  var RIVER = [[2.6, 4.1], [3.7, 3.4], [4.8, 3.15], [5.7, 2.75], [6.9, 3.35], [8.0, 2.85], [9.2, 3.3], [10.4, 2.65], [11.6, 3.05], [12.4, 2.8], [13.4, 2.8]];
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Distancia de un punto al trazado del río (para excavar el cauce). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function riverDist(x, y) {
    var best = 9;
    for (var i = 0; i < RIVER.length - 1; i++) {
      var ax = RIVER[i][0], ay = RIVER[i][1], bx = RIVER[i + 1][0], by = RIVER[i + 1][1], dx = bx - ax, dy = by - ay;
      var t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
      best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t));
    }
    return best;
  }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Altura del terreno a pleno relieve en (x,y). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function Tfull(x, y) {
    var z = 1 + 0.035 * Math.sin(x * 1.9) * Math.cos(y * 2.3);
    z += 2.3 * g2(x, y, 1.5, 4.6, 1.15, 1.0) + 0.9 * g2(x, y, 0.4, 2.4, 0.8, 0.9) + 1.0 * g2(x, y, 3.8, 5.9, 1.7, 0.6) + 0.8 * g2(x, y, 8.6, 6.0, 2.4, 0.6) + 0.6 * g2(x, y, 11.2, 6.0, 1.4, 0.6);
    z -= 0.8 * g2(x, y, 3.7, 3.1, 0.85, 1.0);
    z -= 0.14 * Math.exp(-Math.pow(riverDist(x, y) / 0.24, 2));
    var c = smooth(12.1, 13.5, x);
    return z * (1 - c) + (0.14 - 0.04 * (x - 13.5)) * c;
  }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Color del suelo según altura y zona (césped, arena, roca, nieve). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function topColor(x, y, h) {
    var n = 0.5 + 0.5 * Math.sin(x * 2.3 + y * 1.7) * Math.sin(x * 1.1 - y * 2.9);
    var c = mix(hex("#a9c297"), hex("#8cac7a"), n);
    c = mix(c, hex("#ecdbb2"), smooth(0.8, 0.58, h));
    c = mix(c, hex("#b8aea2"), smooth(1.9, 2.5, h));
    return mix(c, hex("#f6f3ee"), smooth(2.9, 3.3, h));
  }
  /* nivel freático (agua subterránea): bajo en los pozos, más alto cerca de la montaña y el embalse */
  function wt(x) {
    return 0.26 - 0.08 * smooth(8, 14, x) - 0.3 * g1(x, 5.6, 0.75) - 0.3 * g1(x, 7.9, 0.75) - 0.14 * g1(x, 9.3, 0.6) - 0.12 * g1(x, 11.7, 0.6);
  }

  /* ---------- pinceles de dibujo ---------- */
  function poly(pts, fill, op, sw) {
    return '<polygon points="' + pts.map(pt).join(" ") + '" fill="' + fill + '"' + (op ? ' fill-opacity="' + op + '"' : "") + ' stroke="' + INK + '" stroke-width="' + (sw || 0.9) + '" stroke-linejoin="round"/>';
  }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Sombra elíptica suave bajo un objeto. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function shadowE(p, rx, ry) { return '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] + 1) + '" rx="' + f1(rx) + '" ry="' + f1(ry) + '" fill="rgba(70,56,44,.2)"/>'; }
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Caja en proyección oblicua (frente, derecha y techo). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function boxO(x, y, w, d, h, z0, c) {
    var A = Pz(x, y, z0), B = Pz(x + w, y, z0), C = Pz(x + w, y, z0 + h), D = Pz(x, y, z0 + h);
    var E = Pz(x, y + d, z0 + h), F = Pz(x + w, y + d, z0 + h), G = Pz(x + w, y + d, z0);
    return poly([A, B, C, D], c.front) + poly([B, G, F, C], c.right) + poly([D, C, F, E], c.top);
  }

  /* ---------- escena (diorama) ---------- */
  function diorama(opt) {
    var zk = opt.zk, objs = opt.objs, objects = opt.objs, base = 0.95;
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Altura del terreno escalada por el factor de relieve zk. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function Hz(x, y) {
      var t = Tfull(x, y), d = t - base;
      return base + d * (d > 0 ? zk : Math.max(zk, 0.85));
    }
    var NX = Math.round(LX / DX), NY = Math.round(LY / DY), i, j;
    var buckets = [];
    for (j = 0; j < NY; j++) buckets.push({ t: [], o: [] });
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Fila de profundidad (cubo de dibujo) de una coordenada y. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
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
        var mx = Math.max(a, b, c, d), lvl = x0 < 8 ? LW : WL;
        if (mx < lvl + 0.02) {
          var dep = clamp((lvl - (a + b + c + d) / 4) / 0.6, 0, 1), wc = mix(hex("#9bd6e1"), hex("#3f93ad"), dep);
          s += '<polygon points="' + pt(Pz(x0, y0, lvl)) + " " + pt(Pz(x1, y0, lvl)) + " " + pt(Pz(x1, y1, lvl)) + " " + pt(Pz(x0, y1, lvl)) + '" fill="' + rgb(wc) + '" fill-opacity=".88" stroke="' + rgb(wc) + '" stroke-opacity=".88" stroke-width=".6"/>';
        }
        buckets[j].t.push(s);
      }
    }

    /* decales planos sobre el terreno: se dibujan en el cubo de su fila más cercana a la cámara */
    function zz(x, y) { return Hz(x, y) + 0.03; }
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Polígono plano sobre el terreno, dibujado en la fila más cercana a la cámara. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function decal(pts, fill, extra) {
      var minY = 99; pts.forEach(function (p) { minY = Math.min(minY, p[1]); });
      var s = poly(pts.map(function (p) { return Pz(p[0], p[1], zz(p[0], p[1])); }), fill, 1, 0.7) + (extra || "");
      buckets[row(minY)].t.push(s);
    }
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Línea plana sobre el terreno. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function ln(x0, y0, x1, y1, st, w, cls) {
      return '<line' + (cls ? ' class="' + cls + '"' : "") + ' x1="' + pt(Pz(x0, y0, zz(x0, y0))).split(",")[0] + '" y1="' + pt(Pz(x0, y0, zz(x0, y0))).split(",")[1] + '" x2="' + pt(Pz(x1, y1, zz(x1, y1))).split(",")[0] + '" y2="' + pt(Pz(x1, y1, zz(x1, y1))).split(",")[1] + '" stroke="' + st + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    }
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Parcela de cultivo con surcos (y surcos con agua si se riega). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function parcel(x0, y0, x1, y1, fill, stripe, rows, water) {
      var extra = "";
      for (var k = 1; k < rows; k++) {
        var yk = y0 + ((y1 - y0) * k) / rows;
        extra += ln(x0 + 0.04, yk, x1 - 0.04, yk, stripe, 1.8);
        if (water) extra += ln(x0 + 0.04, yk, x1 - 0.04, yk, "#8fcfdc", 1.6, "mi-flow");
      }
      decal([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, extra);
    }
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Tramo de línea sobre el terreno repartido por filas de dibujo. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function segs(pts, stroke, w, extraStyle) {
      for (var k = 0; k < pts.length - 1; k++) {
        var a = pts[k], b = pts[k + 1], p = Pz(a[0], a[1], zz(a[0], a[1])), q = Pz(b[0], b[1], zz(b[0], b[1]));
        buckets[row((a[1] + b[1]) / 2)].t.push('<line x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round"' + (extraStyle || "") + "/>");
      }
    }
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Puntos de una curva Catmull-Rom (cauce del río). @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function crPts(P0, n) {
      var out = [];
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Interpolación Catmull-Rom de un valor. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function cr(a, b, c, d3, t) { return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d3) * t * t + (-a + 3 * b - 3 * c + d3) * t * t * t); }
      for (var m = 0; m <= n; m++) {
        var u = (m / n) * (P0.length - 1), i0 = Math.min(P0.length - 2, Math.floor(u)), f = u - i0;
        var p0 = P0[Math.max(0, i0 - 1)], p1 = P0[i0], p2 = P0[i0 + 1], p3 = P0[Math.min(P0.length - 1, i0 + 2)];
        out.push([cr(p0[0], p1[0], p2[0], p3[0], f), cr(p0[1], p1[1], p2[1], p3[1], f)]);
      }
      return out;
    }
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Registra un objeto en el cubo de su fila para que el terreno de adelante no lo tape. @Capa: Funcional @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
    function put(y, s) { buckets[row(y)].o.push(objects ? popWrap(s) : s); }

    /* río (sobre la tierra; en el mar ya no se ve) */
    var rp = crPts(RIVER, 70).filter(function (p) { return p[0] < 12.95; });
    segs(rp, "#5fb0c4", 9);
    segs(rp, "#9bd6e1", 5);
    segs(rp, "#ffffff", 2, ' stroke-opacity=".7" stroke-dasharray="4 12" class="mi-flow"');

    if (objs) {
      /* GRANJA (zona central): parcelas al norte y al sur del río, canales, pivote de riego, pasto con vacas, granero */
      parcel(5.2, 3.95, 6.4, 5.3, "#d8c47e", "#b8a25a", 7, true);
      parcel(6.55, 3.95, 7.7, 5.3, "#a9c97f", "#7fa263", 7, true);
      parcel(5.2, 0.75, 6.6, 2.05, "#c9a679", "#a98859", 7, false);
      parcel(6.85, 0.75, 8.0, 2.05, "#e6d08a", "#c2ab62", 7, true);
      var piv = [], k;
      for (k = 0; k < 40; k++) { var an = (k / 40) * Math.PI * 2; piv.push([8.9 + 0.0, 1.4]); }
      /* pivote de riego circular al sur de la ciudad */
      piv = []; for (k = 0; k < 40; k++) { var an2 = (k / 40) * Math.PI * 2; piv.push([8.75 + 0.62 * Math.cos(an2), 1.4 + 0.62 * Math.sin(an2)]); }
      var spokes = "";
      for (k = 0; k < 4; k++) { var a3 = (k / 4) * Math.PI; spokes += ln(8.75 - 0.62 * Math.cos(a3), 1.4 - 0.62 * Math.sin(a3), 8.75 + 0.62 * Math.cos(a3), 1.4 + 0.62 * Math.sin(a3), "#7aa261", 1.4); }
      decal(piv, "#9cc47a", spokes);
      decal([[7.75, 3.95], [8.3, 3.95], [8.3, 5.3], [7.75, 5.3]], "#b9d09a", "");
      /* canales de riego que salen del río */
      segs([[6.45, 3.25], [6.45, 3.95]], "#5fb0c4", 5); segs([[6.45, 3.25], [6.45, 3.95]], "#9bd6e1", 2.6);
      segs([[6.7, 2.8], [6.7, 0.9]], "#5fb0c4", 5); segs([[6.7, 2.8], [6.7, 0.9]], "#9bd6e1", 2.6);
      /* escorrentía de fertilizante hacia el río */
      segs([[5.4, 3.95], [5.3, 3.5], [5.25, 3.0]], "#d4dc84", 4);
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
        var k = (o.k || 1.15) * 1.3, p = Pz(x, y, Hz(x, y)), sh = o.shirt || "#c8745a", sk = o.skin || SK[0];
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
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Oveja (sin escalar). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function sheepRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 11, 3.4) + '<g stroke="' + INK + '" stroke-width=".7"><line x1="' + f1(p[0] - 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 4) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 4) + '" y2="' + f1(p[1]) + '"/>' +
          '<circle cx="' + f1(p[0] - 5) + '" cy="' + f1(p[1] - 9) + '" r="6" fill="#fbf8f2"/><circle cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 11) + '" r="6.5" fill="#fbf8f2"/><circle cx="' + f1(p[0] + 5) + '" cy="' + f1(p[1] - 9) + '" r="6" fill="#fbf8f2"/><circle cx="' + f1(p[0] + 11) + '" cy="' + f1(p[1] - 9) + '" r="3.4" fill="#5b4a3e"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Venado (sin escalar). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function deerRaw(x, y) {
        var p = Pz(x, y, Hz(x, y)), c = "#b98a5e";
        return shadowE(p, 14, 4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] - 7) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] + 7) + '" y2="' + f1(p[1]) + '"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 14) + '" rx="12" ry="6" fill="' + c + '"/><path d="M' + f1(p[0] + 8) + "," + f1(p[1] - 16) + " L" + f1(p[0] + 15) + "," + f1(p[1] - 29) + " L" + f1(p[0] + 19) + "," + f1(p[1] - 27) + " L" + f1(p[0] + 12) + "," + f1(p[1] - 13) + 'Z" fill="' + c + '"/>' +
          '<ellipse cx="' + f1(p[0] + 19) + '" cy="' + f1(p[1] - 29) + '" rx="4.6" ry="3" fill="' + c + '"/><path d="M' + f1(p[0] + 18) + "," + f1(p[1] - 32) + " l-3,-8 m3,3 l5,-6 m-2,9 l5,-5" + '" fill="none" stroke="#6b5a4a" stroke-width="1.4"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Chigüiro (sin escalar). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function capyRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 14, 4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 6) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 6) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 6) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 6) + '" y2="' + f1(p[1]) + '"/>' +
          '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 8) + '" rx="12" ry="6.4" fill="#9a7552"/><ellipse cx="' + f1(p[0] + 12) + '" cy="' + f1(p[1] - 9) + '" rx="5" ry="4.2" fill="#8a6745"/><circle cx="' + f1(p[0] + 9) + '" cy="' + f1(p[1] - 13) + '" r="1.6" fill="#8a6745"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Pato sobre el agua del embalse. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function duck(x, y) {
        var p = Pz(x, y, LW + 0.02);
        return '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] + 2) + '" rx="12" ry="3" fill="#fff" fill-opacity=".45"/><g stroke="' + INK + '" stroke-width=".7"><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 3) + '" rx="8" ry="4.6" fill="#fbf8f2"/><circle cx="' + f1(p[0] + 7) + '" cy="' + f1(p[1] - 8) + '" r="3.6" fill="#5f8f5a"/><path d="M' + f1(p[0] + 10) + "," + f1(p[1] - 8) + " l5,1.5 l-5,1.5Z" + '" fill="#e8a24a"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Gallina (sin escalar). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function henRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 7, 2.2) + '<g stroke="' + INK + '" stroke-width=".7"><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 5) + '" rx="6" ry="4.4" fill="#e9d9bd"/><circle cx="' + f1(p[0] + 6) + '" cy="' + f1(p[1] - 9) + '" r="2.8" fill="#e9d9bd"/><path d="M' + f1(p[0] + 8) + "," + f1(p[1] - 9) + ' l3,1 l-3,1Z" fill="#e8a24a"/><path d="M' + f1(p[0] + 5) + "," + f1(p[1] - 12) + ' l1,-3 l2,2 Z" fill="#c8745a"/><line x1="' + f1(p[0] - 1) + '" y1="' + f1(p[1] - 1) + '" x2="' + f1(p[0] - 1) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 2) + '" y1="' + f1(p[1] - 1) + '" x2="' + f1(p[0] + 2) + '" y2="' + f1(p[1]) + '"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Perro (sin escalar). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function dogRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 9, 3) + '<g stroke="' + INK + '" stroke-width=".7" stroke-linecap="round"><line x1="' + f1(p[0] - 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] - 4) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 4) + '" y1="' + f1(p[1] - 4) + '" x2="' + f1(p[0] + 4) + '" y2="' + f1(p[1]) + '"/><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 7) + '" rx="8" ry="4" fill="#b98a5e"/><circle cx="' + f1(p[0] + 8) + '" cy="' + f1(p[1] - 10) + '" r="3.6" fill="#b98a5e"/><path d="M' + f1(p[0] - 8) + "," + f1(p[1] - 8) + " q-4,-4 -3,-8" + '" fill="none"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Burro (sin escalar). @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function donkeyRaw(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 14, 4) + '<g stroke="' + INK + '" stroke-width=".8" stroke-linecap="round"><line x1="' + f1(p[0] - 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] - 7) + '" y2="' + f1(p[1]) + '"/><line x1="' + f1(p[0] + 7) + '" y1="' + f1(p[1] - 10) + '" x2="' + f1(p[0] + 7) + '" y2="' + f1(p[1]) + '"/><ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 14) + '" rx="13" ry="6.4" fill="#a9a095"/><path d="M' + f1(p[0] + 9) + "," + f1(p[1] - 16) + " L" + f1(p[0] + 15) + "," + f1(p[1] - 25) + " L" + f1(p[0] + 20) + "," + f1(p[1] - 22) + " L" + f1(p[0] + 14) + "," + f1(p[1] - 12) + 'Z" fill="#a9a095"/><path d="M' + f1(p[0] + 15) + "," + f1(p[1] - 25) + " l-1,-8 l4,6Z" + '" fill="#8f877b"/><rect x="' + f1(p[0] - 5) + '" y="' + f1(p[1] - 21) + '" width="10" height="5" rx="2" fill="#c8745a"/></g>';
      }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Choza rural con techo de paja. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function hutR(x, y) {
        var p = Pz(x, y, Hz(x, y));
        return shadowE(p, 26, 7) + '<path d="M' + f1(p[0] - 20) + "," + f1(p[1] - 24) + " L" + f1(p[0] - 20) + "," + f1(p[1]) + " A20 6 0 0 0 " + f1(p[0] + 20) + "," + f1(p[1]) + " L" + f1(p[0] + 20) + "," + f1(p[1] - 24) + 'Z" fill="url(#wall)" stroke="' + INK + '" stroke-width=".9"/>' +
          '<path d="M' + f1(p[0] - 25) + "," + f1(p[1] - 22) + " Q" + f1(p[0]) + "," + f1(p[1] - 14) + " " + f1(p[0] + 25) + "," + f1(p[1] - 22) + " L" + f1(p[0]) + "," + f1(p[1] - 54) + 'Z" fill="#d9b87a" stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"/>' +
          '<path d="M' + f1(p[0] - 5) + "," + f1(p[1] + 1) + " v-13 a5 5 0 0 1 10 0 v13Z" + '" fill="#7a5a3a"/>';
      }

      /** Agranda un animal alrededor de su punto de apoyo en el terreno para que se lea desde lejos. */
      function big(x, y, svg, k) { var p = Pz(x, y, Hz(x, y)); return '<g transform="translate(' + f1(p[0]) + " " + f1(p[1]) + ") scale(" + k + ") translate(" + f1(-p[0]) + " " + f1(-p[1]) + ')">' + svg + "</g>"; }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Oveja estilizada. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function sheep(x, y) { return big(x, y, sheepRaw(x, y), 1.4); }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Venado estilizado. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function deer(x, y) { return big(x, y, deerRaw(x, y), 1.4); }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Chigüiro (capibara) estilizado. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function capy(x, y) { return big(x, y, capyRaw(x, y), 1.4); }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Gallina estilizada. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function hen(x, y) { return big(x, y, henRaw(x, y), 1.5); }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Perro estilizado. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function dog(x, y) { return big(x, y, dogRaw(x, y), 1.5); }
      /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Burro con aparejo. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
      function donkey(x, y) { return big(x, y, donkeyRaw(x, y), 1.35); }
      var cowSvg = function (cx, cy, flip) { return big(cx, cy, cowRaw(cx, cy, flip), 1.3); };
      put(3.96, cowSvg(7.95, 4.35, false) + cowSvg(8.1, 4.85, true) + cowSvg(7.9, 4.05, true));
      /* animales domésticos y comunidad rural (borde izquierdo, pie de la montaña) */
      put(1.0, hutR(0.9, 0.95) + hutR(1.85, 0.75));
      put(0.9, person(1.35, 0.55, { shirt: "#6fa3b5", skin: SK[2], skirt: true, skirtColor: "#c8745a", hat: "scarf", tool: "bucket" }) + person(2.45, 0.7, { shirt: "#e2c27a", skin: SK[3], k: 0.85 }) + person(2.75, 0.95, { shirt: "#9bb58a", skin: SK[1], k: 1.05, tool: "bag" }));
      put(2.0, sheep(1.3, 2.1) + sheep(1.75, 1.85) + sheep(2.15, 2.25));
      put(4.9, deer(4.1, 4.95));
      put(3.5, capy(5.95, 3.55) + capy(6.35, 3.6));
      put(3.2, duck(3.3, 3.15) + duck(3.85, 2.75) + duck(3.45, 3.65));
      put(5.5, donkey(4.9, 5.25) + hen(6.75, 5.45) + hen(6.95, 5.65) + hen(6.6, 5.7));
      /* personas trabajando: agricultores sobre las parcelas (se dibujan en la fila delantera de cada parcela) */
      put(3.96, person(5.85, 4.3, { shirt: "#c8745a", skin: SK[2], hat: "straw", tool: "hoe" }) + person(7.1, 4.5, { shirt: "#7fa263", skin: SK[1], hat: "straw", tool: "hoe" }) + person(8.0, 4.4, { shirt: "#e2c27a", skin: SK[3], k: 0.85 }) + dog(7.6, 4.6));
      put(0.76, person(7.35, 1.35, { shirt: "#6fa3b5", skin: SK[3], hat: "straw", tool: "hoe" }) + person(5.9, 1.4, { shirt: "#c8745a", skin: SK[0], hat: "straw", tool: "hoe" }));
      /* comunidad de la ciudad: cola con baldes junto al pozo, y vecinos con niños */
      put(0.7, person(9.0, 0.6, { shirt: "#9bb58a", skin: SK[2], skirt: true, skirtColor: "#8a6f4e", hat: "scarf", tool: "bucket" }) + person(9.35, 0.62, { shirt: "#c8745a", skin: SK[1], tool: "bucket" }) + person(9.7, 0.6, { shirt: "#e2c27a", skin: SK[3], k: 0.9, tool: "bucket" }));
      put(2.5, person(8.9, 2.45, { shirt: "#7fa263", skin: SK[0], tool: "bag" }) + person(10.0, 2.35, { shirt: "#6fa3b5", skin: SK[2], skirt: true, skirtColor: "#c8745a" }) + person(10.3, 2.5, { shirt: "#e2c27a", skin: SK[1], k: 0.8 }) + person(10.15, 2.68, { shirt: "#c8745a", skin: SK[3], k: 0.75 }));
      /* trabajadores de la fábrica (casco amarillo) y técnica del centro de datos */
      put(4.0, person(10.45, 4.05, { shirt: "#8a8173", skin: SK[1], hat: "hard" }) + person(10.7, 4.0, { shirt: "#6fa3b5", skin: SK[3], hat: "hard" }));
      put(0.9, person(12.6, 1.0, { shirt: "#efe3c6", skin: SK[2], hat: "hard", tool: "bag" }));
      /* granero */
      (function () {
        var x = 5.5, y = 5.55, w = 0.9, d = 0.6, h = 0.5, z0 = Hz(x + w / 2, y + d / 2), zr = z0 + h + 0.38;
        var gable = poly([Pz(x, y, z0 + h), Pz(x + w, y, z0 + h), Pz(x + w / 2, y, zr)], "#d98a70");
        var rs = poly([Pz(x + w, y, z0 + h), Pz(x + w, y + d, z0 + h), Pz(x + w / 2, y + d, zr), Pz(x + w / 2, y, zr)], "#a65a43");
        put(y, shadowE(Pz(x + w / 2, y, z0), 52, 11) + boxO(x, y, w, d, h, z0, { front: "#c8745a", right: "#a9604a", top: "#a65a43" }) + rs + gable);
      })();
      /* árboles: laderas de la montaña y fondo */
      var tcands = [[0.9, 3.2], [1.3, 2.4], [2.2, 1.7], [2.9, 2.4], [3.4, 1.1], [4.2, 1.7], [0.7, 1.2], [5.6, 5.5], [6.9, 5.7], [9.0, 5.3], [10.1, 5.6], [11.9, 5.2], [2.4, 5.2], [3.3, 5.4], [9.7, 2.0], [10.6, 1.4], [12.0, 1.0]];
      tcands.forEach(function (tc) {
        var p = Pz(tc[0], tc[1], Hz(tc[0], tc[1])), k2 = 1.1 + ((tc[0] * 7 + tc[1] * 3) % 1) * 0.4;
        put(tc[1], shadowE(p, 11 * k2, 3.6 * k2) +
          '<path d="M' + (p[0] - 2) + "," + p[1] + " L" + (p[0] - 1.4) + "," + (p[1] - 17 * k2) + " L" + (p[0] + 1.4) + "," + (p[1] - 17 * k2) + " L" + (p[0] + 2) + "," + p[1] + 'Z" fill="#8b6a4f"/>' +
          '<circle cx="' + (p[0] - 5 * k2) + '" cy="' + (p[1] - 19 * k2) + '" r="' + 10 * k2 + '" fill="url(#leaf)" stroke="' + INK + '" stroke-width=".8"/>' +
          '<circle cx="' + (p[0] + 5.5 * k2) + '" cy="' + (p[1] - 20 * k2) + '" r="' + 10.5 * k2 + '" fill="url(#leaf)" stroke="' + INK + '" stroke-width=".8"/>' +
          '<circle cx="' + p[0] + '" cy="' + (p[1] - 28 * k2) + '" r="' + 10 * k2 + '" fill="url(#leaf)" stroke="' + INK + '" stroke-width=".8"/>');
      });
      /* presa del embalse */
      (function () {
        var x = 4.62, y = 2.15, w = 0.26, d = 1.95, h = 0.34, z0 = Hz(x + w, y + d / 2) - 0.1;
        put(y, boxO(x, y, w, d, h, z0, { front: "#e2dccf", right: "#c9c1b3", top: "#f0ebe0" }));
      })();
      /* CIUDAD: casas con techo terracota, torre de agua y persona de compras */
      function house(x, y, w, d, h, rh) {
        var z0 = Hz(x + w / 2, y + d / 2), s = shadowE(Pz(x + w / 2, y, z0), w * SX * 0.62, 9) + boxO(x, y, w, d, h, z0, { front: "#f1e6d2", right: "#d9ccb3", top: "#e7dcc6" });
        var zt = z0 + h, zr = zt + rh, e = 0.07;
        s += poly([Pz(x - e, y - e, zt), Pz(x + w + e, y - e, zt), Pz(x + w * 0.78, y + d / 2, zr), Pz(x + w * 0.22, y + d / 2, zr)], "#d98a70");
        s += poly([Pz(x + w + e, y - e, zt), Pz(x + w + e, y + d + e, zt), Pz(x + w * 0.78, y + d / 2, zr)], "#a9604a");
        var dp = Pz(x + w * 0.42, y, z0); s += '<rect x="' + f1(dp[0]) + '" y="' + f1(dp[1] - 0.28 * SZ) + '" width="' + f1(w * SX * 0.16) + '" height="' + f1(0.28 * SZ) + '" fill="#9c5a45"/>';
        put(y, s);
      }
      house(8.5, 3.8, 0.8, 0.6, 0.5, 0.4); house(9.4, 4.5, 0.8, 0.6, 0.55, 0.42); house(9.45, 1.95, 0.7, 0.55, 0.45, 0.36); house(10.0, 3.8, 0.7, 0.55, 0.45, 0.36);
      (function () {
        var p = Pz(9.4, 5.3, Hz(9.4, 5.3)), s = shadowE(p, 22, 7);
        s += '<g stroke="' + INK + '" stroke-width="1.2"><line x1="' + f1(p[0] - 11) + '" y1="' + f1(p[1]) + '" x2="' + f1(p[0] - 7) + '" y2="' + f1(p[1] - 50) + '"/><line x1="' + f1(p[0] + 11) + '" y1="' + f1(p[1]) + '" x2="' + f1(p[0] + 7) + '" y2="' + f1(p[1] - 50) + '"/></g>' +
          '<rect x="' + f1(p[0] - 17) + '" y="' + f1(p[1] - 82) + '" width="34" height="32" rx="9" fill="url(#wall)" stroke="' + INK + '" stroke-width=".9"/>' +
          '<path d="M' + f1(p[0] - 20) + "," + f1(p[1] - 82) + " L" + f1(p[0]) + "," + f1(p[1] - 100) + " L" + f1(p[0] + 20) + "," + f1(p[1] - 82) + 'Z" fill="url(#roof)" stroke="' + INK + '" stroke-width=".9" stroke-linejoin="round"/>' +
          '<path d="M' + f1(p[0]) + "," + f1(p[1] - 76) + " c3,4 3,8 0,8 c-3,0 -3,-4 0,-8Z" + '" fill="#3f9db4"/>';
        put(5.3, s);
      })();
      (function () {
        var p = Pz(8.15, 2.3, Hz(8.15, 2.3));
        put(2.3, shadowE(p, 8, 3) +
          '<rect x="' + f1(p[0] - 5) + '" y="' + f1(p[1] - 18) + '" width="10" height="17" rx="5" fill="#c8745a" stroke="' + INK + '" stroke-width=".9"/>' +
          '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1] - 24) + '" r="6" fill="#f0cfae" stroke="' + INK + '" stroke-width=".9"/>' +
          '<rect x="' + f1(p[0] + 4) + '" y="' + f1(p[1] - 16) + '" width="5" height="8" rx="2" fill="#9fd0dc" stroke="' + INK + '" stroke-width=".7"/>' +
          '<rect x="' + f1(p[0] - 14) + '" y="' + f1(p[1] - 11) + '" width="9" height="10" rx="2" fill="#efe3c6" stroke="' + INK + '" stroke-width=".7"/>');
      })();
      /* INDUSTRIA: nave, torre de enfriamiento y humo */
      (function () {
        var z0 = Hz(10.9, 4.3);
        put(4.3, shadowE(Pz(11.6, 4.3, z0), 70, 11) + boxO(10.9, 4.3, 1.4, 0.8, 0.5, z0, { front: "#e3ddd1", right: "#c4bcae", top: "#efeadf" }) +
          '<rect x="' + f1(Pz(11.1, 4.3, z0)[0]) + '" y="' + f1(Pz(11.1, 4.3, z0)[1] - 0.34 * SZ) + '" width="22" height="22" rx="3" fill="#9fc4cf" stroke="' + INK + '" stroke-width=".7"/>');
        var b = Pz(10.2, 5.0, Hz(10.2, 5.0)), h = 148, bw = 46, wst = 30, tp = 36, smoke = "";
        for (var k = 0; k < 3; k++) smoke += '<circle class="mi-puff" cx="' + f1(b[0]) + '" cy="' + f1(b[1] - h - 8) + '" r="11" fill="#fff" stroke="' + INK + '" stroke-width=".7" style="animation-delay:' + (-k * 1.13) + 's"/>';
        put(5.0, shadowE(b, bw, bw / 3) +
          '<path d="M' + f1(b[0] - bw) + "," + f1(b[1]) + " C" + f1(b[0] - wst - 6) + "," + f1(b[1] - h * 0.4) + " " + f1(b[0] - wst) + "," + f1(b[1] - h * 0.66) + " " + f1(b[0] - tp) + "," + f1(b[1] - h) +
          " L" + f1(b[0] + tp) + "," + f1(b[1] - h) + " C" + f1(b[0] + wst) + "," + f1(b[1] - h * 0.66) + " " + f1(b[0] + wst + 6) + "," + f1(b[1] - h * 0.4) + " " + f1(b[0] + bw) + "," + f1(b[1]) +
          " A" + bw + " " + f1(bw / 3) + " 0 0 1 " + f1(b[0] - bw) + "," + f1(b[1]) + 'Z" fill="url(#grey)" stroke="' + INK + '" stroke-width=".9"/>' +
          '<ellipse cx="' + f1(b[0]) + '" cy="' + f1(b[1] - h) + '" rx="' + tp + '" ry="' + f1(tp / 3) + '" fill="url(#top)" stroke="' + INK + '" stroke-width=".9"/>' + smoke);
      })();
      /* CENTRO DE DATOS: caja con rejillas, ventiladores y gota */
      (function () {
        var x = 10.85, y = 0.85, w = 1.5, d = 0.9, h = 0.72, z0 = Hz(x + w / 2, y + d / 2), s = shadowE(Pz(x + w / 2, y, z0), 82, 12) + boxO(x, y, w, d, h, z0, { front: "#dcd5c8", right: "#bfb7a9", top: "#ece7dc" });
        for (var k = 0; k < 5; k++) {
          var a = Pz(x + 0.1, y, z0 + 0.1 + k * 0.1), b2 = Pz(x + w - 0.1, y, z0 + 0.1 + k * 0.1);
          s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b2[0]) + '" y2="' + f1(b2[1]) + '" stroke="rgba(61,53,44,.38)" stroke-width="3" stroke-linecap="round"/>';
        }
        var dr = Pz(x + w * 0.82, y, z0 + h * 0.5);
        s += '<path d="M' + f1(dr[0]) + "," + f1(dr[1] - 9) + " C" + f1(dr[0] + 7) + "," + f1(dr[1] - 1) + " " + f1(dr[0] + 6) + "," + f1(dr[1] + 6) + " " + f1(dr[0]) + "," + f1(dr[1] + 6) + " C" + f1(dr[0] - 6) + "," + f1(dr[1] + 6) + " " + f1(dr[0] - 7) + "," + f1(dr[1] - 1) + " " + f1(dr[0]) + "," + f1(dr[1] - 9) + 'Z" fill="#3f9db4" stroke="#fff" stroke-width="1.2"/>';
        [0.35, 0.95].forEach(function (fx, idx) {
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
    /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Franja de una capa del corte frontal. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
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
    /* nivel freático: línea original y, solo en la escena completa, una capa que lo hace descender cuando se usa el agua */
    var wtPath = "", lowPath = "";
    for (i = 0; i <= N2; i++) { wtPath += (i ? "L" : "M") + pt(Pz(xs[i], 0, b2[i])); lowPath += (i ? "L" : "M") + pt(Pz(xs[i], 0, Math.max(-0.6, b2[i] - 0.34))); }
    var wtLine = function (d) { return '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.4" stroke-dasharray="3 9" stroke-linecap="round" class="mi-flow"/>'; };
    if (objs) {
      var dp = [], k3;
      for (k3 = 0; k3 <= N2; k3++) dp.push(Pz(xs[k3], 0, b2[k3]));
      for (k3 = N2; k3 >= 0; k3--) dp.push(Pz(xs[k3], 0, Math.max(-0.6, b2[k3] - 0.34)));
      out += '<g id="miDeplete" opacity="0"><polygon points="' + dp.map(pt).join(" ") + '" fill="#cdb592"/>' + wtLine(lowPath) + "</g>";
      out += '<g id="miWt">' + wtLine(wtPath) + "</g>";
    } else {
      out += wtLine(wtPath);
    }
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
      var pk = Pz(1.5, 4.6, Hz(1.5, 4.6) + 0.55), rain = "";
      for (var r = -3; r <= 3; r++) rain += '<line class="mi-rain" x1="' + f1(pk[0] + r * 11) + '" y1="' + f1(pk[1] + 4) + '" x2="' + f1(pk[0] + r * 11) + '" y2="' + f1(pk[1] + 46) + '" stroke="#5fa9bd" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 9"/>';
      out += rain + cloudG([pk[0], pk[1] - 30], 1.25, 0) + cloudG(Pz(13.3, 2.4, 2.6), 1.15, -2);

      /* aves: un cóndor andino sobre la montaña, una bandada sobre el campo y gaviotas en el mar */
      function bird(p, k, col) { return '<path d="M' + f1(p[0] - 9 * k) + "," + f1(p[1]) + " Q" + f1(p[0] - 4.5 * k) + "," + f1(p[1] - 7 * k) + " " + f1(p[0]) + "," + f1(p[1]) + " Q" + f1(p[0] + 4.5 * k) + "," + f1(p[1] - 7 * k) + " " + f1(p[0] + 9 * k) + "," + f1(p[1]) + '" fill="none" stroke="' + (col || "#4a4036") + '" stroke-width="' + f1(2.2 * k) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
      var cond = Pz(3.3, 4.6, 3.9);
      out += '<path d="M' + f1(cond[0] - 36) + "," + f1(cond[1] + 4) + " Q" + f1(cond[0] - 14) + "," + f1(cond[1] - 14) + " " + f1(cond[0]) + "," + f1(cond[1]) + " Q" + f1(cond[0] + 14) + "," + f1(cond[1] - 14) + " " + f1(cond[0] + 36) + "," + f1(cond[1] + 4) + '" fill="none" stroke="#3d352c" stroke-width="5" stroke-linecap="round"/><circle cx="' + f1(cond[0]) + '" cy="' + f1(cond[1] + 1) + '" r="3.4" fill="#3d352c"/>';
      [[6.4, 4.2, 3.2, 1], [7.0, 3.4, 3.5, 0.85], [7.7, 4.6, 3.0, 0.9], [8.3, 3.2, 3.3, 0.7]].forEach(function (b) { out += bird(Pz(b[0], b[1], b[2]), b[3] * 1.2); });
      [[13.2, 3.9, 2.0, 1], [13.6, 1.4, 2.3, 0.9]].forEach(function (b) { out += bird(Pz(b[0], b[1], b[2]), b[3] * 1.2, "#7a7268"); });
    }
    return { svg: out, Hz: Hz };
  }

  
/* ---------- globo ---------- */
  function blob(pts) {
    var n = pts.length, d = "M" + f1(pts[0][0]) + "," + f1(pts[0][1]);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += "C" + f1(p1[0] + (p2[0] - p0[0]) / 6) + "," + f1(p1[1] + (p2[1] - p0[1]) / 6) + " " + f1(p2[0] - (p3[0] - p1[0]) / 6) + "," + f1(p2[1] - (p3[1] - p1[1]) / 6) + " " + f1(p2[0]) + "," + f1(p2[1]);
    }
    return d + "Z";
  }
  var LANDS = [
    [[40, -70], [95, -95], [150, -60], [140, -10], [100, 20], [60, 0], [30, -30]],
    [[110, 50], [150, 40], [175, 80], [150, 125], [115, 110]],
    [[250, -90], [320, -100], [370, -60], [340, -20], [290, -30], [255, -55]],
    [[300, 10], [350, 0], [385, 50], [360, 110], [320, 100], [295, 55]],
    [[470, -80], [560, -100], [640, -70], [610, -20], [540, -10], [490, -40]],
    [[600, 40], [660, 30], [690, 70], [650, 100], [610, 85]]
  ];
  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Globo terráqueo con continentes, nubes y mancha cálida de El Niño. @Capa: Estética @Riesgo_Evaluado: Bajo - dibujo aislado sin consumidores externos */
  function globe(cx, cy, r, shiftX, withWarm) {
    var s = r / 190, land = "", k;
    for (k = -1; k <= 1; k++) {
      land += '<g transform="translate(' + (k * 760) + ' 0)">';
      LANDS.forEach(function (p) { land += '<path d="' + blob(p) + '" fill="#a9c297" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>'; });
      if (withWarm) land += '<ellipse cx="440" cy="34" rx="56" ry="24" fill="#e8895f" fill-opacity=".6"/>';
      land += '<ellipse cx="60" cy="-120" rx="50" ry="12" fill="#fff" fill-opacity=".8"/><ellipse cx="420" cy="-130" rx="55" ry="12" fill="#fff" fill-opacity=".8"/><ellipse cx="230" cy="90" rx="60" ry="13" fill="#fff" fill-opacity=".75"/>';
      land += "</g>";
    }
    return '<g id="miGlobe" transform="translate(' + cx + " " + cy + ") scale(" + s.toFixed(4) + ')">' +
      '<circle r="206" fill="#9bd6e1" fill-opacity=".14"/><circle r="197" fill="#9bd6e1" fill-opacity=".28"/>' +
      '<circle r="190" fill="url(#ocean)" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<g clip-path="url(#gclip)"><g id="miLand" transform="translate(' + shiftX + ' 0)">' + land + "</g></g>" +
      '<circle r="190" fill="url(#shade)"/></g>';
  }

  
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

  

  /* ----------------------------------------------------------------------- *
   * Brote escalonado de objetos, título, ensamblado y animación
   * ----------------------------------------------------------------------- */


  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Easing cúbico de entrada y salida para las transiciones. @Capa: Estética @Riesgo_Evaluado: Bajo */
  function ease(x) {
    x = clamp(x, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Interpolación lineal. @Capa: Técnica @Riesgo_Evaluado: Bajo */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / mundo-intro
   * @Propósito: Envuelve un objeto en un grupo `.mi-o` con su posición relativa (0..1, izquierda a derecha) para que brote escalonado al levantarse el relieve.
   * @Capa: Estética
   * @Riesgo_Evaluado: Bajo - la posición se deduce de la primera coordenada x del SVG; si no se encuentra, se usa el centro
   */
  function popWrap(s) {
    var m = /(?:\bcx|\bx|\bx1)="(-?[0-9.]+)"|points="(-?[0-9.]+),|M(-?[0-9.]+),/.exec(s);
    var sx = m ? parseFloat(m[1] || m[2] || m[3]) : (X0 + (LX * SX) / 2);
    var r = clamp((sx - X0) / (LX * SX + LY * SKX), 0, 1);
    return '<g class="mi-o" data-r="' + r.toFixed(3) + '">' + s + "</g>";
  }

  /** Bloque reservado para el título y el nombre (arriba a la izquierda; no se mueve en toda la animación). */
  var TITLE =
    '<text x="96" y="150" font-size="92" font-weight="800" letter-spacing="-1" fill="#3d352c">Our Water, Our Choices</text>' +
    '<text x="98" y="208" font-size="33" font-weight="500" fill="#8a7f70">Culture, Ecosystems, and Global Water Bankruptcy</text>' +
    '<text x="98" y="266" font-size="30" font-weight="700" fill="#3d352c">Orlando Bojacá</text>' +
    '<text x="330" y="266" font-size="22" font-weight="600" fill="#a39886" letter-spacing="2" style="font-family:ui-monospace,Menlo,monospace">ENGLISH B2 · FINAL PRESENTATION</text>';

  /** Línea de tiempo en segundos: globo → acercamiento → relieve → recorrido de la gota → cierre → pausa. */
  var LOOP = 44;
  var T_A0 = 6;
  var T_A1 = 8.6;
  var T_B1 = 11.4;
  var TRAVEL = 26;
  var T_C1 = T_B1 + TRAVEL;

  /** Estaciones del recorrido: segundo local (desde T_B1) en que cambia el rótulo. */
  var STATIONS = [
    { at: 0, name: "Ocean" },
    { at: 3.5, name: "Clouds · El Niño" },
    { at: 7, name: "Mountains" },
    { at: 11.5, name: "Farm" },
    { at: 17.5, name: "City" },
    { at: 21, name: "Factory · Data center" },
    { at: 24.5, name: "Back to the sea" }
  ];

  var markup = null;
  var refs = null;
  var raf = 0;
  var running = false;
  var startMs = null;
  var seek = 0;
  var frozen = false;
  var last = { cap: null, capT: 0, dots: -2, B: -1, d: -1 };

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / mundo-intro
   * @Propósito: Ruta de la gota en el bloque, con el segundo local de cada punto; la altura se toma del terreno real.
   * @Capa: Funcional
   * @Riesgo_Evaluado: Bajo - función pura
   */
  function buildRoute(Hz) {
    function g(x, y, dz) { return [x, y, Hz(x, y) + dz]; }
    return [
      { t: 0, p: [13.35, 4.1, WL + 0.18] },
      { t: 2.2, p: [13.3, 3.0, 1.1] },
      { t: 3.6, p: [13.3, 2.4, 2.5] },
      { t: 6.0, p: [8.0, 3.6, 3.6] },
      { t: 7.6, p: [3.4, 4.7, 3.8] },
      { t: 8.8, p: g(1.5, 4.6, 0.6) },
      { t: 10.2, p: g(2.6, 4.0, 0.35) },
      { t: 11.0, p: [3.7, 3.2, LW + 0.15] },
      { t: 11.9, p: g(5.7, 2.8, 0.3) },
      { t: 13.3, p: g(6.45, 3.6, 0.3) },
      { t: 14.9, p: g(5.9, 4.6, 0.5) },
      { t: 16.5, p: g(6.9, 3.3, 0.3) },
      { t: 18.2, p: g(8.9, 3.3, 0.4) },
      { t: 19.8, p: g(9.3, 1.0, 0.5) },
      { t: 21.6, p: g(10.7, 4.6, 0.6) },
      { t: 23.4, p: g(11.6, 1.5, 0.9) },
      { t: 24.8, p: g(12.4, 2.8, 0.3) },
      { t: 26.0, p: [13.3, 3.1, WL + 0.18] }
    ];
  }

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / mundo-intro
   * @Propósito: Construye (una sola vez) el SVG completo: globo, anillo punteado, bloque en tres niveles de relieve, gota, título y rótulos.
   * @Capa: Estética
   * @Riesgo_Evaluado: Bajo - se cachea; los tres niveles se funden entre sí para simular el relieve que sube
   */
  function buildMarkup() {
    var w0 = diorama({ zk: 0.28, objs: false });
    var w1 = diorama({ zk: 0.62, objs: false });
    var w2 = diorama({ zk: 1, objs: true });
    var dots = "";
    for (var k = 0; k < STATIONS.length; k++) dots += '<circle class="mi-dot" cx="' + k * 30 + '" cy="0" r="7" fill="#e4ddcf"/>';
    return {
      route: buildRoute(w2.Hz),
      svg: DEFS + globe(1330, 600, 380, -120, true) +
        '<rect id="miPatch" x="1060" y="590" width="540" height="150" rx="28" fill="none" stroke="#c8745a" stroke-width="4" stroke-dasharray="14 12" opacity="0"/>' +
        '<g id="miSlab" opacity="0"><g id="miL0">' + w0.svg + '</g><g id="miL1" opacity="0">' + w1.svg + '</g><g id="miL2" opacity="0">' + w2.svg + '</g><g id="miDrop"></g></g>' +
        TITLE +
        '<text id="miCap" x="96" y="1024" font-size="56" font-weight="800" fill="#3d352c" opacity="0"></text>' +
        '<g id="miDots" transform="translate(104 1056)" opacity="0">' + dots + "</g>"
    };
  }

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / mundo-intro
   * @Propósito: Posición de la gota en la ruta para el segundo local lt (interpolación lineal entre puntos).
   * @Capa: Funcional
   * @Riesgo_Evaluado: Bajo - función pura
   */
  function dropAt(route, lt) {
    var n = route.length, idx = 1;
    while (idx < n - 1 && route[idx].t < lt) idx++;
    var a = route[idx - 1], b = route[idx];
    var u = clamp((lt - a.t) / (b.t - a.t), 0, 1);
    return [a.p[0] + (b.p[0] - a.p[0]) * u, a.p[1] + (b.p[1] - a.p[1]) * u, a.p[2] + (b.p[2] - a.p[2]) * u];
  }

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: SVG de la gota con halo en la posición de pantalla q. @Capa: Estética @Riesgo_Evaluado: Bajo */
  function dropMarkup(q) {
    return '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="19" fill="#6fb8c9" fill-opacity=".3"/>' +
      '<path d="M' + f1(q[0]) + "," + f1(q[1] - 15) + " C" + f1(q[0] + 12) + "," + f1(q[1] - 2) + " " + f1(q[0] + 11) + "," + f1(q[1] + 10) + " " + f1(q[0]) + "," + f1(q[1] + 10) +
      " C" + f1(q[0] - 11) + "," + f1(q[1] + 10) + " " + f1(q[0] - 12) + "," + f1(q[1] - 2) + " " + f1(q[0]) + "," + f1(q[1] - 15) + 'Z" fill="#3f9db4" stroke="#fff" stroke-width="2"/>' +
      '<circle cx="' + f1(q[0] - 3) + '" cy="' + f1(q[1] + 1) + '" r="2.2" fill="#fff" fill-opacity=".85"/>';
  }

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Índice de la estación activa para el segundo local lt. @Capa: Funcional @Riesgo_Evaluado: Bajo */
  function stationAt(lt) {
    var idx = 0;
    for (var i = 0; i < STATIONS.length; i++) if (lt >= STATIONS[i].at) idx = i;
    return idx;
  }

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Muestra u oculta un nodo SVG con opacidad (display none cuando es 0 para ahorrar dibujo). @Capa: Técnica @Riesgo_Evaluado: Bajo */
  function setOp(el, v) {
    if (v <= 0.002) { el.setAttribute("display", "none"); return; }
    el.removeAttribute("display");
    el.setAttribute("opacity", v >= 0.998 ? "1" : v.toFixed(3));
  }

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / mundo-intro
   * @Propósito: Pinta un instante t (0..LOOP): globo, acercamiento, relieve que sube, objetos que brotan, agua subterránea, gota y rótulos.
   * @Capa: Funcional
   * @Riesgo_Evaluado: Bajo - solo escribe atributos de nodos propios (refs); los objetos se tocan solo mientras el relieve sube o baja
   */
  function render(t) {
    var A, B;
    if (t < T_C1) {
      A = ease((t - T_A0) / (T_A1 - T_A0));
      B = ease((t - T_A1) / (T_B1 - T_A1));
    } else {
      B = 1 - ease((t - T_C1) / 2.6);
      A = t < T_C1 + 2.6 ? 1 : 1 - ease((t - T_C1 - 2.6) / 2.6);
    }

    /* globo: gira, se acerca y se desliza hacia abajo mientras sube el relieve */
    var r = lerp(380, 1100, A), cx = lerp(1330, 960, A), cy = lerp(600, 1830, A) + B * 520;
    refs.globe.setAttribute("transform", "translate(" + f1(cx) + " " + f1(cy) + ") scale(" + (r / 190).toFixed(4) + ")");
    refs.land.setAttribute("transform", "translate(" + f1(-120 - ((t * 22) % 760)) + " 0)");
    setOp(refs.globe, 1 - B);
    var patch = t < T_C1 ? smooth(3, 5.2, t) * (1 - A) : 0;
    setOp(refs.patch, patch * 0.9);

    /* bloque: asoma plano, crece hasta ocupar la pantalla y los niveles de relieve se funden */
    var sc = lerp(lerp(0.5, 0.84, A), 1, B);
    refs.slab.setAttribute("transform", "translate(" + f1(960 * (1 - sc)) + " " + f1(700 * (1 - sc)) + ") scale(" + sc.toFixed(4) + ")");
    setOp(refs.slab, Math.min(1, A * 2.2));
    setOp(refs.l0, 1 - smooth(0.55, 1, B));
    setOp(refs.l1, smooth(0, 0.5, B) * (1 - smooth(0.55, 1, B)));
    setOp(refs.l2, smooth(0.3, 1, B));

    /* objetos, fauna y personas brotan de izquierda a derecha */
    if (B < 1 || last.B < 1) {
      for (var i = 0; i < refs.objs.length; i++) {
        var o = refs.objs[i], p = ease(clamp((B - parseFloat(o.getAttribute("data-r")) * 0.45) / 0.55, 0, 1));
        if (p >= 1) { o.style.transform = ""; o.style.opacity = ""; }
        else { o.style.transform = "scale(" + Math.max(p, 0.001).toFixed(3) + ")"; o.style.opacity = p.toFixed(3); }
      }
    }
    last.B = B;

    /* agua subterránea: baja mientras se usa (campo, ciudad, industria) y se recupera con la lluvia */
    var lt = t - T_B1, d = 0;
    if (lt >= 0 && lt < TRAVEL) d = smooth(10, 16, lt) * (1 - smooth(24, 26.5, lt));
    if (Math.abs(d - last.d) > 0.004) {
      last.d = d;
      refs.deplete.setAttribute("opacity", d.toFixed(3));
      refs.wt.setAttribute("opacity", (1 - d * 0.9).toFixed(3));
    }

    /* gota y rótulos */
    var cap = "", dot = -1;
    if (t >= T_B1 && t < T_C1) {
      dot = stationAt(lt);
      cap = STATIONS[dot].name;
      refs.drop.innerHTML = dropMarkup(Pz.apply(null, dropAt(markup.route, lt)));
    } else {
      refs.drop.innerHTML = "";
      if (t >= T_A1 && t < T_B1) cap = "One drop.";
      else if (t >= T_C1) cap = "Where does it go next?";
    }
    if (cap !== last.cap) { last.cap = cap; last.capT = frozen ? t - 1 : t; refs.cap.textContent = cap; }
    refs.cap.setAttribute("opacity", cap ? clamp((t - last.capT) / 0.35, 0, 1).toFixed(2) : "0");
    if (dot !== last.dots) {
      last.dots = dot;
      refs.dotsWrap.setAttribute("opacity", dot < 0 ? "0" : "1");
      for (var k = 0; k < refs.dots.length; k++) {
        refs.dots[k].setAttribute("fill", k === dot ? "#c8745a" : (dot >= 0 && k < dot ? "#b9b09f" : "#e4ddcf"));
        refs.dots[k].setAttribute("r", k === dot ? "10" : "7");
      }
    }
  }

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Bucle de animación; calcula el instante desde el arranque (o fijo con ?mt=&freeze=1). @Capa: Funcional @Riesgo_Evaluado: Bajo - se cancela en unmount() */
  function frame(now) {
    if (!running) return;
    var t = frozen ? seek % LOOP : ((((now - startMs) / 1000) + seek) % LOOP);
    render(t);
    raf = window.requestAnimationFrame(frame);
  }

  /** @BAUTO_REFACTOR 2026-11-01 @Modulo: AGUA_PRESENTACION / mundo-intro @Propósito: Detiene la animación y libera referencias al salir de la diapositiva 0. @Capa: Técnica @Riesgo_Evaluado: Bajo - evita fugas de requestAnimationFrame */
  function unmount() {
    running = false;
    if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
    raf = 0;
    refs = null;
  }

  /**
   * @BAUTO_REFACTOR 2026-11-01
   * @Modulo: AGUA_PRESENTACION / mundo-intro
   * @Propósito: Monta la escena dentro de un contenedor y arranca el bucle; conserva el reloj salvo que se pida reiniciar.
   * @Capa: Funcional
   * @Riesgo_Evaluado: Bajo - el SVG pesado se genera una sola vez y se reutiliza
   */
  function mount(container, restart) {
    unmount();
    if (!container || !window.requestAnimationFrame) return;
    if (!markup) markup = buildMarkup();

    var qs = window.location.search || "";
    var m = /[?&]mt=([0-9.]+)/.exec(qs);
    seek = m ? parseFloat(m[1]) : 0;
    frozen = /[?&]freeze=1/.test(qs);

    container.innerHTML =
      '<svg class="mi-world" viewBox="0 0 1920 1080" role="img" aria-label="The world turns and a piece of it rises into a wide block of land where one drop of water travels from the ocean through clouds, mountains, a farm, a city, a factory and a data center and back to the sea, among animals and communities.">' + markup.svg + "</svg>";

    refs = {
      globe: container.querySelector("#miGlobe"),
      land: container.querySelector("#miLand"),
      patch: container.querySelector("#miPatch"),
      slab: container.querySelector("#miSlab"),
      l0: container.querySelector("#miL0"),
      l1: container.querySelector("#miL1"),
      l2: container.querySelector("#miL2"),
      deplete: container.querySelector("#miDeplete"),
      wt: container.querySelector("#miWt"),
      drop: container.querySelector("#miDrop"),
      cap: container.querySelector("#miCap"),
      dotsWrap: container.querySelector("#miDots"),
      dots: container.querySelectorAll(".mi-dot"),
      objs: container.querySelectorAll(".mi-o")
    };
    last = { cap: null, capT: 0, dots: -2, B: -1, d: -1 };
    if (restart || startMs === null) startMs = window.performance ? window.performance.now() : Date.now();
    running = true;
    raf = window.requestAnimationFrame(frame);
  }

  window.MundoIntro = { mount: mount, unmount: unmount, LOOP: LOOP };
})();
