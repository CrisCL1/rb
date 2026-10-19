/*
 * Evidencias Hito 2 — ErreBe
 * Antes/después de la entrada, el menú, el formulario de acuerdo (cada paso) y la lista de acuerdos,
 * a 1440 px y 390 px; el flujo completo del modo validación en ambos anchos; un video del flujo;
 * y las comprobaciones de los criterios de la iteración (falla si alguno no se cumple).
 *
 * Uso (desde la raíz del repo):
 *   NODE_PATH=$(npm root -g) node evidencias/hito2/capturar.js
 * Opciones:
 *   --antes=<ref git>   versión "antes" (por defecto c1accc6, la que se usó en la primera validación)
 *   --fecha=AAAA-MM-DD  carpeta de salida (por defecto, hoy)
 *   --chromium=<ruta>   ejecutable de Chromium (por defecto /opt/pw-browsers/chromium si existe)
 *
 * Salida: evidencias/hito2/<fecha>/{antes-despues,validacion,video,verificacion}
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const hoy = new Date(); const pad = n => String(n).padStart(2, '0');
const FECHA = arg('fecha', `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`);
const ANTES_REF = arg('antes', 'c1accc6');
const OUT = path.join(__dirname, FECHA);
const DIRS = { ad: 'antes-despues', val: 'validacion', video: 'video', ver: 'verificacion' };
for (const d of Object.values(DIRS)) fs.mkdirSync(path.join(OUT, d), { recursive: true });

const VIEWPORTS = {
  '1440': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  '390': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const ESC = { local: 'La Bodega Sonora', reparto: '60', cuota: '30', metodo: 'Transferencia', plazo: '48 horas', precio: '5000' };

function servidor(htmlAntes) {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      const p = req.url.split('?')[0];
      const body = p.startsWith('/antes') ? htmlAntes : fs.readFileSync(path.join(ROOT, 'errebeapp.html'), 'utf8');
      r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); r.end(body);
    });
    srv.listen(0, () => res(srv));
  });
}

const errores = [];
const verif = [];
const check = (ok, que, detalle) => { verif.push({ ok: !!ok, que, detalle }); if (!ok) errores.push('✗ ' + que + (detalle ? ' — ' + JSON.stringify(detalle) : '')); };
async function nuevaPagina(browser, vp, extra = {}) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], ...extra });
  const page = await ctx.newPage();
  page.on('pageerror', e => errores.push(`[${vp}] ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errores.push(`[${vp}] console: ${m.text()}`); });
  return { ctx, page };
}
const espera = ms => new Promise(r => setTimeout(r, ms));
async function foto(page, carpeta, nombre, fullPage = false) {
  await espera(400);
  await page.screenshot({ path: path.join(OUT, carpeta, nombre + '.png'), fullPage });
}
async function limpiar(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'));
    if (window.closeHelp) closeHelp();
    const a = document.getElementById('aside'); if (a) a.classList.remove('open');
  });
}
// Mismos datos que el test (La Bodega Sonora) pero sin el panel del modo validación encima
async function abrirEscenario(page, url) {
  await page.goto(url + '?test=1');
  await page.evaluate(() => { const p = document.getElementById('vt-panel'); if (p) p.hidden = true; if (window.vtBackdrop) vtBackdrop(false); });
}
async function entrar(page, rol) {
  await limpiar(page);
  await page.evaluate(r => { document.getElementById('gate').classList.remove('hide'); enter(r); window.scrollTo(0, 0); }, rol);
}
// El botón está completamente dentro de la ventana y no tapado por otro elemento
async function botonVisible(page, sel) {
  return page.evaluate(sel => {
    const b = document.querySelector(sel); if (!b) return { ok: false, motivo: 'no existe' };
    const r = b.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    const dentro = r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= H && r.right <= W;
    const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const visible = !!arriba && (arriba === b || b.contains(arriba));
    return { ok: dentro && visible, texto: b.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom), alto: H };
  }, sel);
}
async function cabeSinDesplazar(page) {
  return page.evaluate(() => { const b = document.getElementById('ac-body'); return { ok: b.scrollHeight <= b.clientHeight + 1, scroll: b.scrollHeight, visible: b.clientHeight }; });
}

/* ---------- Formulario: versión antes (un solo formulario) y después (4 pasos) ---------- */
async function llenarAntes(page) {
  await page.evaluate(e => {
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    s('ac-local', e.local); s('ac-reparto', e.reparto); s('ac-cuota', e.cuota); s('ac-metodo', e.metodo); s('ac-plazo', e.plazo); s('ac-precio-ent', e.precio);
    if (window.acCount) acCount();
  }, ESC);
}
// Ruta mínima con clics reales: Inicio → enviado
async function rutaMinima(page, pausa = () => espera(80), alPaso = async () => { }) {
  await page.locator('.acc.main').click(); await pausa(500);
  await alPaso(1);
  await page.locator(`#ac-locales-op .opt[data-v="${ESC.local}"]`).click(); await pausa(400);
  await page.keyboard.type(ESC.reparto, { delay: 60 });
  await page.locator('#ac-cuota').click(); await page.keyboard.type(ESC.cuota, { delay: 60 });
  await page.locator('#ac-precio-ent').click(); await page.keyboard.type(ESC.precio, { delay: 60 }); await pausa(400);
  await alPaso(2);
  await page.locator('#ac-sig').click(); await pausa(400);
  await page.locator(`#ac-metodo-op .opt[data-v="${ESC.metodo}"]`).click(); await pausa(200);
  await alPaso(3);
  await page.locator(`#ac-plazo-op .opt[data-v="${ESC.plazo}"]`).click();
  await page.waitForFunction(() => acStep === 4); await pausa(500);
  await alPaso(4);
  await page.locator('#ac-sig').click(); await pausa(600);
}

async function capturarAntesDespues(browser, base) {
  for (const vp of Object.keys(VIEWPORTS)) {
    for (const version of ['antes', 'despues']) {
      const { ctx, page } = await nuevaPagina(browser, vp);
      await abrirEscenario(page, base + '/' + version);
      const nom = n => `${n}_${vp}_${version}`;
      await foto(page, DIRS.ad, nom('bienvenida'));
      for (const rol of ['musico', 'local']) {
        await entrar(page, rol);
        await foto(page, DIRS.ad, nom(`${rol}_entrada`));
        // Menú: en escritorio, la barra lateral; en el teléfono, el menú abierto
        if (vp === '1440') { await espera(300); await page.locator('#aside').screenshot({ path: path.join(OUT, DIRS.ad, nom(`${rol}_menu`) + '.png') }); }
        else { await page.locator('#burger').click(); await foto(page, DIRS.ad, nom(`${rol}_menu`)); await limpiar(page); }
        await page.evaluate(() => go('acuerdos'));
        await foto(page, DIRS.ad, nom(`${rol}_acuerdos`), true);
      }
      await entrar(page, 'musico');
      if (version === 'antes') {
        await page.evaluate(() => { go('acuerdos'); openAcuerdo(); });
        await foto(page, DIRS.ad, nom('musico_acuerdo-formulario'));
        await llenarAntes(page);
        await page.evaluate(() => saveAcuerdo(true)); await espera(300);
        await foto(page, DIRS.ad, nom('musico_acuerdo-tras-enviar'));
      } else {
        await rutaMinima(page, () => espera(80), async n => { await foto(page, DIRS.ad, nom(`musico_acuerdo-paso${n}`)); });
        await foto(page, DIRS.ad, nom('musico_acuerdo-tras-enviar'));
        // Resumen con condiciones faltantes y enlace a su paso
        await page.evaluate(() => { openAcuerdo(); document.getElementById('ac-local').value = 'Peña El Trauco'; acIr(4, false); });
        await foto(page, DIRS.ad, nom('musico_acuerdo-paso4-faltan'));
      }
      await ctx.close();
    }
  }
}

/* ---------- Comprobaciones de los criterios ---------- */
async function verificar(browser, base) {
  for (const vp of Object.keys(VIEWPORTS)) {
    const { ctx, page } = await nuevaPagina(browser, vp);
    await abrirEscenario(page, base + '/despues');
    for (const rol of ['musico', 'local']) {
      await entrar(page, rol);
      const menu = await page.evaluate(() => Array.prototype.filter.call(document.querySelectorAll('nav.side > .nav-item'), n => !n.hidden).map(n => n.textContent.trim().replace(/\s+/g, ' ')));
      check(menu.length <= 5, `[${vp}] ${rol}: menú visible con ≤ 5 entradas`, menu);
      const herramientas = await page.evaluate(() => Array.prototype.filter.call(document.querySelectorAll('#more-list .nav-item'), n => !n.hidden).map(n => n.dataset.v));
      const llegan = [];
      for (const v of herramientas) {
        if (vp === '390') await page.locator('#burger').click();
        if (await page.locator('#more-list').isHidden()) await page.locator('#more-btn').click();
        await page.locator(`#more-list .nav-item[data-v="${v}"]`).click(); await espera(150);
        llegan.push([v, await page.evaluate(v => document.querySelector('.view.show').dataset.view === v, v)]);
      }
      check(llegan.length > 0 && llegan.every(x => x[1]), `[${vp}] ${rol}: "Más herramientas" lleva a cada herramienta`, llegan);
      if (vp === '1440') {
        await page.evaluate(() => go('inicio'));
        const alto = await page.evaluate(() => document.documentElement.scrollHeight);
        check(alto <= 900, `[1440×900] ${rol}: Inicio sin desplazarse`, { alto });
      }
      if (vp === '390') {
        await page.evaluate(() => go('fichas'));
        const titulo = await page.locator('#mb-title').textContent();
        check(titulo.trim().length > 0 && titulo !== 'Inicio', `[390] ${rol}: la barra superior muestra la sección actual`, titulo);
      }
    }
    await ctx.close();
  }
  // Botón de avanzar/enviar visible en cada paso: 1440×900, 390×844 y 390×700 (sin desplazar el paso)
  const tams = [['1440', null], ['390', null], ['390', { width: 390, height: 700 }]];
  for (const [vp, vpx] of tams) {
    const etiqueta = vpx ? `${vpx.width}×${vpx.height}` : (vp === '1440' ? '1440×900' : '390×844');
    const { ctx, page } = await nuevaPagina(browser, vp, vpx ? { viewport: vpx } : {});
    await abrirEscenario(page, base + '/despues');
    await entrar(page, 'musico');
    const pasos = [];
    await rutaMinima(page, () => espera(60), async n => {
      const b = await botonVisible(page, '#ac-sig');
      const c = await cabeSinDesplazar(page);
      pasos.push({ paso: n, boton: b.texto, visible: b.ok, cabe: c.ok, scroll: c.scroll, alto: c.visible });
      if (vp === '390' && vpx) await foto(page, DIRS.ver, `boton-visible_paso${n}_390x700`);
    });
    check(pasos.length === 4 && pasos.every(p => p.visible), `[${etiqueta}] botón de avanzar/enviar visible en los 4 pasos`, pasos);
    if (vpx) check(pasos.every(p => p.cabe), `[${etiqueta}] cada paso cabe sin desplazarse`, pasos);
    const enviado = await page.evaluate(() => { const a = DB.acuerdos.find(x => x.local === 'La Bodega Sonora'); const primero = document.querySelector('#list-acuerdos .item'); return { estado: a && a.estado, aviso: document.getElementById('acuerdos-aviso').textContent.trim(), primero: primero && primero.textContent.indexOf('La Bodega Sonora') >= 0 }; });
    check(enviado.estado === 'enviado' && /esperando confirmación/.test(enviado.aviso) && enviado.primero, `[${etiqueta}] tras enviar: confirmación de estado y acuerdo arriba en la lista`, enviado);
    await ctx.close();
  }
}

/* ---------- Flujo completo del modo validación ---------- */
async function irA(page, vp, v) {
  if (vp === '390') { await page.locator('#burger').click(); await espera(300); }
  await page.locator(`nav.side > .nav-item[data-v="${v}"]`).click();
}
async function flujoValidacion(page, { video = false, fotos = false, vp = '1440' } = {}) {
  const pausa = ms => espera(video ? ms : 60);
  const clic = async sel => { await page.locator(sel).first().click(); await pausa(500); };
  const f = async n => { if (fotos) await foto(page, DIRS.val, `${n}_${vp}`); };
  await f('01_intro');
  await pausa(900);
  await page.fill('#vt-cod', 'P00'); // P00 = corrida del equipo, nunca un participante real
  await page.fill('#vt-obs', 'Equipo (prueba automática)');
  await clic('#vt-panel .btn-prim'); // Empezar
  await f('02_tarea1_instruccion');
  await pausa(1200);
  // Tarea 1: ruta mínima con clics reales
  await clic('#vt-panel .btn-prim');
  await f('03_tarea1_inicio');
  const nombres = { 1: '04_tarea1_paso1_local', 2: '05_tarea1_paso2_reparto', 3: '06_tarea1_paso3_pago', 4: '07_tarea1_paso4_revisar' };
  await rutaMinima(page, ms => pausa(ms || 500), async n => f(nombres[n]));
  await f('08_tarea1_enviado');
  await clic('#vt-panel'); // abre la instrucción (no cuenta como clic)
  await clic('#vt-panel .btn-prim'); // Listo
  // Tarea 2: qué equipos llevar
  await clic('#vt-panel .btn-prim');
  await irA(page, vp, 'fichas'); await pausa(1400);
  await f('09_tarea2_ficha');
  await clic('#vt-panel');
  for (const o of ['Platillos', 'Amplificador de bajo', 'Cables de instrumento']) { await page.locator(`.vt-op[value="${o}"]`).check(); await pausa(250); }
  await f('10_tarea2_respuesta');
  await clic('#vt-panel .btn-prim');
  // Tarea 3: prueba de sonido
  await clic('#vt-panel .btn-prim');
  await irA(page, vp, 'fichas'); await pausa(1000);
  await clic('#vt-panel');
  await page.selectOption('#vt-pr', 'si'); await page.fill('#vt-hr', '19:00'); await pausa(400);
  await clic('#vt-panel .btn-prim');
  // Tarea 4: recuperar el acuerdo
  await clic('#vt-panel .btn-prim');
  await irA(page, vp, 'acuerdos'); await pausa(700);
  await page.locator('#list-acuerdos .item', { hasText: 'La Bodega Sonora' }).click(); await pausa(1400);
  await f('11_tarea4_acuerdo');
  await clic('#vt-panel');
  await page.fill('#vt-monto', '90000'); await pausa(400);
  await clic('#vt-panel .btn-prim');
  // Likert + pregunta abierta
  const likerts = page.locator('.likert');
  await likerts.nth(0).locator('button').nth(3).click(); await pausa(300);
  await likerts.nth(1).locator('button').nth(4).click(); await pausa(300);
  await likerts.nth(2).locator('button').nth(3).click(); await pausa(300);
  await page.fill('#vt-com', 'Ejemplo de respuesta abierta (sesión de prueba del equipo).'); await pausa(500);
  await f('12_likert');
  await clic('#vt-panel .btn-prim');
  await pausa(1500);
  if (fotos) {
    await f('13_fin');
    for (const ext of ['CSV', 'JSON']) {
      const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#vt-panel button', { hasText: 'Descargar ' + ext }).click()]);
      const nombre = dl.suggestedFilename();
      if (!/^errebe_validacion_P00_\d{4}-\d{2}-\d{2}\.(csv|json)$/.test(nombre)) errores.push(`[${vp}] nombre de descarga inesperado: ${nombre}`);
      await dl.saveAs(path.join(OUT, DIRS.val, `ejemplo_${vp}_` + nombre));
    }
  }
  return page.evaluate(() => VT.res);
}

(async () => {
  const exe = arg('chromium', fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const htmlAntes = execSync(`git show ${ANTES_REF}:errebeapp.html`, { cwd: ROOT, maxBuffer: 1 << 24 }).toString();
  const srv = await servidor(htmlAntes);
  const base = 'http://localhost:' + srv.address().port;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const resultados = {};
  try {
    await capturarAntesDespues(browser, base); console.log('✓ antes/después');
    await verificar(browser, base); console.log('✓ comprobaciones');
    for (const vp of Object.keys(VIEWPORTS)) {
      const { ctx, page } = await nuevaPagina(browser, vp);
      await page.goto(base + '/despues?test=1');
      resultados[vp] = await flujoValidacion(page, { fotos: true, vp });
      await ctx.close();
    }
    console.log('✓ modo validación');
    const vctx = await browser.newContext({ viewport: { width: 1280, height: 760 }, recordVideo: { dir: path.join(OUT, DIRS.video), size: { width: 1280, height: 760 } } });
    const vpage = await vctx.newPage();
    vpage.on('pageerror', e => errores.push('[video] ' + e.message));
    await vpage.goto(base + '/despues?test=1');
    const t0 = Date.now();
    await flujoValidacion(vpage, { video: true });
    const dur = (Date.now() - t0) / 1000;
    const vpath = await vpage.video().path();
    await vctx.close();
    const destino = path.join(OUT, DIRS.video, 'flujo-modo-validacion.webm');
    fs.renameSync(vpath, destino);
    try { execSync(`ffmpeg -y -loglevel error -i "${destino}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${destino.replace('.webm', '.mp4')}"`); } catch (e) { }
    console.log(`✓ video (${dur.toFixed(1)} s)`);
    for (const [vp, r] of Object.entries(resultados)) {
      const mal = r.tareas.filter(t => !t.completada).map(t => t.id);
      check(!mal.length, `[${vp}] modo validación: las 4 tareas completadas`, mal);
      const t1 = r.tareas[0];
      check(t1.clics <= 8, `[${vp}] T1 ruta mínima Inicio → enviado en ≤ 8 clics`, { clics: t1.clics, pasos: t1.pasos_secuencia });
      check(r.version === 'ErreBe prototipo · Hito 2 v2', `[${vp}] versión registrada`, r.version);
    }
    check(!errores.some(e => /console|^\[/.test(e)), 'sin errores de JavaScript ni de consola', errores.filter(e => /console|^\[/.test(e)));
  } finally {
    await browser.close(); srv.close();
  }
  const resumen = { fecha: FECHA, antes: ANTES_REF, comprobaciones: verif, t1_clics: Object.fromEntries(Object.entries(resultados).map(([vp, r]) => [vp, r.tareas[0].clics])) };
  fs.writeFileSync(path.join(OUT, DIRS.ver, 'resultado.json'), JSON.stringify(resumen, null, 2));
  for (const v of verif) console.log((v.ok ? '✓ ' : '✗ ') + v.que);
  if (errores.length) { console.error('Errores:\n' + errores.join('\n')); process.exit(1); }
  console.log('Listo → ' + path.relative(ROOT, OUT));
})();
