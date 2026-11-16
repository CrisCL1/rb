/*
 * Evidencias del test para locales (?test=local) y de la ficha técnica por pasos — ErreBe
 * Recorre el test completo a 390 y 1440 px, recarga la página a mitad de una tarea para comprobar el
 * guardado automático, descarga el archivo final y captura la ficha antes/después.
 *
 * Uso (desde la raíz del repo):
 *   NODE_PATH=$(npm root -g) node evidencias/test-locales/capturar.js
 * Opciones: --antes=<ref git> (por defecto 807733b, Hito 2) · --fecha=AAAA-MM-DD · --chromium=<ruta>
 *
 * Salida: evidencias/test-locales/<fecha>/{test,ficha,verificacion}
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
const ANTES_REF = arg('antes', '807733b');
const OUT = path.join(__dirname, FECHA);
const DIRS = { test: 'test', ficha: 'ficha', ver: 'verificacion' };
for (const d of Object.values(DIRS)) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const VIEWPORTS = {
  '1440': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  '390': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
// Datos de una corrida del equipo: no son de un local real
const PERSONA = { nombre: 'Prueba Equipo', local: 'Local de prueba', banda: 'Banda de Prueba' };

function servidor(htmlAntes) {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      const body = req.url.startsWith('/antes') ? htmlAntes : fs.readFileSync(path.join(ROOT, 'errebeapp.html'), 'utf8');
      r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); r.end(body);
    });
    srv.listen(0, () => res(srv));
  });
}
const errores = [], verif = [];
const check = (ok, que, detalle) => { verif.push({ ok: !!ok, que, detalle }); if (!ok) errores.push('✗ ' + que + (detalle !== undefined ? ' — ' + JSON.stringify(detalle) : '')); };
const espera = ms => new Promise(r => setTimeout(r, ms));
async function nuevaPagina(browser, vp) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errores.push(`[${vp}] ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errores.push(`[${vp}] console: ${m.text()}`); });
  return { ctx, page };
}
async function foto(page, carpeta, nombre, fullPage = false) { await espera(400); await page.screenshot({ path: path.join(OUT, carpeta, nombre + '.png'), fullPage }); }
async function irA(page, vp, v) {
  if (vp === '390') { await page.locator('#burger').click(); await espera(300); }
  await page.locator(`nav.side > .nav-item[data-v="${v}"]`).click(); await espera(300);
}
const panel = page => page.locator('#vt-panel');
async function abrirInstruccion(page) { if (await page.evaluate(() => VT.min)) await panel(page).click(); await espera(250); }

async function flujo(page, vp) {
  const f = n => foto(page, DIRS.test, `${n}_${vp}`);
  await f('01_intro');
  await page.fill('#vt-nom', PERSONA.nombre); await page.fill('#vt-loc', PERSONA.local); await page.fill('#vt-ban', PERSONA.banda);
  await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  await f('02_tarea1_instruccion');
  // Tarea 1: observar el acuerdo de la banda
  await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  await f('03_tarea1_inicio');
  await page.locator('.acc.main').click(); await espera(300);
  await page.locator('#list-acuerdos .item', { hasText: PERSONA.banda }).click(); await espera(300);
  await page.locator('#acuerdo-det-body .btn', { hasText: 'Observar' }).click(); await espera(300);
  await page.fill('#ob-texto', 'La asistencia mínima que pedimos es 40 personas, no 30.');
  await f('04_tarea1_observacion');
  await page.locator('#ov-observar .btn-prim').click(); await espera(300);
  await abrirInstruccion(page); await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  // Tarea 2: amplificador de bajo con falla
  await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  await irA(page, vp, 'fichas');
  await f('05_tarea2_mi_ficha');
  await page.locator('#fichas-cta .btn-prim').click(); await espera(300);
  await f('06_tarea2_resumen');
  await page.locator('#fi-rev .lnk').nth(1).click(); await espera(300);
  const fila = page.locator('#fi-gear-list .gear-ed').filter({ has: page.locator('input[value*="bajo"]') });
  await fila.locator('select').selectOption('falla'); await espera(200);
  await f('07_tarea2_equipos');
  await page.locator('#fi-sig').click(); await espera(300);
  await page.locator('#fi-sig').click(); await espera(300);
  await abrirInstruccion(page); await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  // Tarea 3: empieza, se recarga la página y se retoma (guardado automático)
  await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  await irA(page, vp, 'fichas'); await espera(300);
  const antes = await page.evaluate(() => ({ tareas: VT.res.tareas.length, clics: VT.clics }));
  await page.reload(); await espera(600);
  await f('08_recarga_seguir');
  const hayPendiente = await page.locator('#vt-panel button', { hasText: 'Seguir donde quedé' }).count();
  await page.locator('#vt-panel button', { hasText: 'Seguir donde quedé' }).click(); await espera(400);
  const despues = await page.evaluate(() => ({ tareas: VT.res.tareas.length, paso: VT.paso, activa: VT.activa, clics: VT.clics, falla: fichaDe('La Bodega Sonora').gear.find(g => /bajo/i.test(g.n)).st, obs: DB.acuerdos.find(a => a.id === 3).estado }));
  check(hayPendiente === 1 && despues.tareas === antes.tareas && despues.paso === 'tarea' && despues.activa && despues.falla === 'falla' && despues.obs === 'observado',
    `[${vp}] guardado automático: tras recargar se sigue en la misma tarea con lo hecho`, { antes, despues });
  await irA(page, vp, 'fichas');
  await page.locator('#fichas-cta .btn-prim').click(); await espera(300);
  await page.locator('#fi-rev .lnk').nth(2).click(); await espera(300);
  await page.fill('#fi-prueba-hora', '18:30'); await page.fill('#fi-prueba-dur', '45');
  await f('09_tarea3_prueba');
  await page.locator('#fi-sig').click(); await espera(300);
  await page.locator('#fi-sig').click(); await espera(300);
  await abrirInstruccion(page); await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  // Tarea 4: encontrar la fecha de la banda
  await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  await irA(page, vp, 'agenda');
  await f('10_tarea4_mis_fechas');
  const ev = await page.evaluate(() => { const e = vtFechaLocal(); return { fecha: e.fecha, show: e.show }; });
  await abrirInstruccion(page);
  await page.fill('#vt-fe', ev.fecha); await page.fill('#vt-hr', ev.show);
  await page.locator('#vt-panel .btn-prim').click(); await espera(300);
  // Valoración y comentario
  const lk = page.locator('.likert');
  for (const i of [0, 1, 2]) { await lk.nth(i).locator('button').nth(3).click(); await espera(150); }
  await page.fill('#vt-com', 'Ejemplo de respuesta abierta (corrida de prueba del equipo).');
  await f('11_likert');
  await page.locator('#vt-panel .btn-prim').click(); await espera(500);
  await f('12_fin_mandar_archivo');
  // Botón final: descarga el archivo con el nombre de la persona y la banda
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('.vt-mandar').click()]);
  const nombre = dl.suggestedFilename();
  const destino = path.join(OUT, DIRS.test, `ejemplo_${vp}_${nombre}`);
  await dl.saveAs(destino);
  const csv = fs.readFileSync(destino, 'utf8').replace(/^﻿/, '').trim().split('\n');
  check(/^errebe_test_local_Prueba-Equipo_Banda-de-Prueba_\d{4}-\d{2}-\d{2}\.csv$/.test(nombre), `[${vp}] el archivo lleva el nombre de la persona y de la banda`, nombre);
  check(csv.length === 5 && csv.slice(1).every(l => l.indexOf(',si,') > 0) && csv[0].endsWith('rol,nombre,local_nombre,banda'), `[${vp}] el archivo tiene las 4 tareas completadas y las columnas de quién responde`, csv[0]);
  const r = await page.evaluate(() => VT.res);
  check(r.tareas.length === 4 && r.tareas.every(t => t.completada), `[${vp}] test de locales: 4 tareas completadas`, r.tareas.map(t => [t.id, t.completada, t.respuesta]));
  check(r.version === 'ErreBe prototipo · Test locales v1', `[${vp}] versión registrada`, r.version);
  const guardada = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('errebe:test:local:sesiones') || '[]'); return { n: s.length, fin: !!(s[0] && s[0].fin), musicos: localStorage.getItem('errebe:test:sesiones') }; });
  check(guardada.n === 1 && guardada.fin && !guardada.musicos, `[${vp}] la sesión queda guardada en el dispositivo, separada de las de músicos`, guardada);
  // Al volver a abrir el link aparece en la lista para volver a descargarla
  await page.locator('#vt-panel button', { hasText: 'Hacer otro test' }).click(); await espera(600);
  await f('13_intro_con_test_guardado');
  check(await page.locator('#vt-lista button', { hasText: 'Descargar' }).count() === 1, `[${vp}] el test guardado se puede volver a descargar desde el inicio`);
}

async function ficha(browser, base) {
  for (const vp of Object.keys(VIEWPORTS)) {
    for (const version of ['antes', 'despues']) {
      const { ctx, page } = await nuevaPagina(browser, vp);
      await page.goto(base + '/' + version + '?test=1');
      await page.evaluate(() => { document.getElementById('vt-panel').hidden = true; vtBackdrop(false); });
      await page.evaluate(() => { enter('musico'); go('fichas'); });
      await foto(page, DIRS.ficha, `musico_fichas_${vp}_${version}`);
      await page.evaluate(() => { enter('local'); go('fichas'); openFicha(); });
      if (version === 'antes') await foto(page, DIRS.ficha, `local_ficha-editar_${vp}_antes`);
      else {
        for (const n of [1, 2, 3, 4]) {
          await page.evaluate(n => fiIr(n), n);
          await foto(page, DIRS.ficha, `local_ficha-paso${n}_${vp}_despues`);
          const b = await page.evaluate(() => { const r = document.getElementById('fi-sig').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.height > 0; });
          check(b, `[${vp}] ficha: botón de avanzar/publicar visible en el paso ${n}`);
        }
      }
      await ctx.close();
    }
  }
}

(async () => {
  const exe = arg('chromium', fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const htmlAntes = execSync(`git show ${ANTES_REF}:errebeapp.html`, { cwd: ROOT, maxBuffer: 1 << 24 }).toString();
  const srv = await servidor(htmlAntes);
  const base = 'http://localhost:' + srv.address().port;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  try {
    await ficha(browser, base); console.log('✓ ficha antes/después');
    for (const vp of Object.keys(VIEWPORTS)) {
      const { ctx, page } = await nuevaPagina(browser, vp);
      await page.goto(base + '/despues?test=local');
      await flujo(page, vp);
      await ctx.close();
    }
    console.log('✓ test de locales');
    check(!errores.some(e => /^\[/.test(e)), 'sin errores de JavaScript ni de consola', errores.filter(e => /^\[/.test(e)));
  } finally { await browser.close(); srv.close(); }
  fs.writeFileSync(path.join(OUT, DIRS.ver, 'resultado.json'), JSON.stringify({ fecha: FECHA, antes: ANTES_REF, comprobaciones: verif }, null, 2));
  for (const v of verif) console.log((v.ok ? '✓ ' : '✗ ') + v.que);
  if (errores.length) { console.error('Errores:\n' + errores.join('\n')); process.exit(1); }
  console.log('Listo → ' + path.relative(ROOT, OUT));
})();
