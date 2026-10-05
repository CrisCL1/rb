/*
 * Evidencias Lab 9.2 — ErreBe
 * Captura cada vista en rol Músico y rol Local a 1440px y 390px, el antes/después
 * de las pantallas modificadas y un video corto del flujo del modo validación.
 *
 * Uso (desde la raíz del repo):
 *   NODE_PATH=$(npm root -g) node evidencias/9.2/capturar.js
 * Opciones:
 *   --antes=<ref git>   versión "antes" para las comparativas (por defecto f965cea)
 *   --fecha=AAAA-MM-DD  carpeta de salida (por defecto, hoy)
 *   --chromium=<ruta>   ejecutable de Chromium (por defecto /opt/pw-browsers/chromium si existe)
 *
 * Salida: evidencias/9.2/<fecha>/{vistas,antes-despues,validacion,video}
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
const ANTES_REF = arg('antes', 'f965cea');
const OUT = path.join(__dirname, FECHA);
const DIRS = { vistas: 'vistas', ad: 'antes-despues', val: 'validacion', video: 'video' };
for (const d of Object.values(DIRS)) fs.mkdirSync(path.join(OUT, d), { recursive: true });

const VIEWPORTS = {
  '1440': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  '390': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

// Servidor estático mínimo: /despues = versión actual, /antes = versión de referencia
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
async function nuevaPagina(browser, vp, extra = {}) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], ...extra });
  const page = await ctx.newPage();
  page.on('pageerror', e => errores.push(`[${vp}] ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errores.push(`[${vp}] console: ${m.text()}`); });
  return { ctx, page };
}
const espera = ms => new Promise(r => setTimeout(r, ms));
async function foto(page, carpeta, nombre, fullPage = true) {
  await espera(350); // deja terminar la animación de entrada
  await page.screenshot({ path: path.join(OUT, carpeta, nombre + '.png'), fullPage });
}
async function cerrarModales(page) {
  await page.evaluate(() => { document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show')); if (window.closeHelp) closeHelp(); });
}

// Vistas por rol. Cada paso deja la app en un estado y devuelve si conviene foto de página completa.
const PASOS = {
  musico: [
    ['inicio', p => p.evaluate(() => go('inicio'))],
    ['acuerdos', p => p.evaluate(() => go('acuerdos'))],
    ['acuerdo-detalle', p => p.evaluate(() => verAcuerdo(DB.acuerdos[0].id))],
    ['acuerdo-nuevo', p => p.evaluate(() => { go('acuerdos'); openAcuerdo(); }), false],
    ['fichas', p => p.evaluate(() => go('fichas'))],
    ['agenda', p => p.evaluate(() => go('agenda'))],
    ['fecha-detalle', p => p.evaluate(() => { go('agenda'); verEvento(DB.eventos.filter(e => e.local)[0].id); }), false],
    ['simulador', p => p.evaluate(() => go('simulador'))],
    ['tareas', p => p.evaluate(() => go('tareas'))],
    ['alertas', p => p.evaluate(() => go('alertas'))],
    ['qr', p => p.evaluate(() => go('qr'))],
    ['buscador', p => p.evaluate(() => go('buscador'))],
    ['estadisticas', p => p.evaluate(() => go('stats'))],
    ['ayuda-acuerdos', p => p.evaluate(() => { go('acuerdos'); openHelp(); }), false],
  ],
  local: [
    ['inicio', p => p.evaluate(() => go('inicio'))],
    ['acuerdos', p => p.evaluate(() => go('acuerdos'))],
    ['acuerdo-por-revisar', p => p.evaluate(() => { const a = DB.acuerdos.find(x => x.local === DB.miLocal && x.estado === 'enviado'); verAcuerdo(a.id); })],
    ['acuerdo-observar', p => p.evaluate(() => { const a = DB.acuerdos.find(x => x.local === DB.miLocal && x.estado === 'enviado'); verAcuerdo(a.id); openObservar(a.id); }), false],
    ['fichas', p => p.evaluate(() => go('fichas'))],
    ['ficha-editar', p => p.evaluate(() => { go('fichas'); openFicha(); }), false],
    ['alertas', p => p.evaluate(() => go('alertas'))],
    ['buscador', p => p.evaluate(() => go('buscador'))],
    ['estadisticas', p => p.evaluate(() => go('stats'))],
  ],
};
// Pantallas modificadas hoy (rol, paso). Se capturan en la versión anterior y en la actual.
const MODIFICADAS = [
  ['musico', 'inicio'], ['musico', 'acuerdos'], ['musico', 'acuerdo-detalle'], ['musico', 'acuerdo-nuevo'],
  ['musico', 'fichas'], ['musico', 'fecha-detalle'], ['local', 'inicio'], ['local', 'fichas'], ['local', 'ficha-editar'],
];

async function capturarVistas(browser, base) {
  for (const vp of Object.keys(VIEWPORTS)) {
    const { ctx, page } = await nuevaPagina(browser, vp);
    await page.goto(base + '/despues');
    await foto(page, DIRS.vistas, `00_bienvenida_${vp}`, false);
    for (const rol of ['musico', 'local']) {
      await page.evaluate(r => enter(r), rol);
      let i = 1;
      for (const [nombre, fn, full = true] of PASOS[rol]) {
        await cerrarModales(page);
        await fn(page);
        await foto(page, DIRS.vistas, `${rol}_${pad(i++)}_${nombre}_${vp}`, full);
      }
      await cerrarModales(page);
      await page.evaluate(() => backToGate());
    }
    await ctx.close();
  }
}

async function capturarAntesDespues(browser, base) {
  for (const vp of Object.keys(VIEWPORTS)) {
    for (const version of ['antes', 'despues']) {
      const { ctx, page } = await nuevaPagina(browser, vp);
      await page.goto(base + '/' + version);
      for (const [rol, nombre] of MODIFICADAS) {
        const paso = PASOS[rol].find(x => x[0] === nombre);
        await cerrarModales(page);
        await page.evaluate(r => { if (ROLE !== r || !document.getElementById('gate').classList.contains('hide')) enter(r); }, rol);
        try { await paso[1](page); } catch (e) { if (version === 'despues') throw e; continue; }
        await foto(page, DIRS.ad, `${rol}_${nombre}_${vp}_${version}`, paso[2] !== false);
      }
      await ctx.close();
    }
  }
}

// Recorre el flujo completo del modo validación. Con video=true lo hace a ritmo legible.
async function flujoValidacion(page, { video = false, fotos = false, vp = '1440' } = {}) {
  const pausa = ms => espera(video ? ms : 60);
  const clic = async sel => { await page.locator(sel).first().click(); await pausa(500); };
  if (fotos) await foto(page, DIRS.val, `01_intro_${vp}`, false);
  await pausa(900);
  await page.fill('#vt-cod', 'P00'); // P00 = corrida del equipo, nunca un participante real
  await clic('#vt-panel .btn-prim'); // Empezar
  if (fotos) await foto(page, DIRS.val, `02_tarea1_instruccion_${vp}`, false);
  await pausa(1200);
  // Tarea 1: registrar y enviar acuerdo
  await clic('#vt-panel .btn-prim');
  await clic('#home-cta .btn-prim');
  await page.fill('#ac-local', 'La Bodega Sonora'); await pausa(300);
  await page.fill('#ac-reparto', '60'); await pausa(250);
  await page.fill('#ac-cuota', '30'); await pausa(250);
  await page.selectOption('#ac-metodo', 'Transferencia'); await pausa(250);
  await page.selectOption('#ac-plazo', '48 horas'); await pausa(250);
  await page.fill('#ac-precio-ent', '5000'); await pausa(300);
  if (fotos) await foto(page, DIRS.val, `03_tarea1_formulario_${vp}`, false);
  await clic('#ov-acuerdo .modal-foot .btn-prim');
  await pausa(700);
  if (fotos) await foto(page, DIRS.val, `04_tarea1_acuerdo_enviado_${vp}`, false);
  await clic('#vt-panel'); // abre la instrucción
  await clic('#vt-panel .btn-prim'); // Listo
  // Tarea 2: qué equipos llevar
  await clic('#vt-panel .btn-prim');
  await page.evaluate(() => go('fichas')); await pausa(1400);
  if (fotos) await foto(page, DIRS.val, `05_tarea2_ficha_${vp}`, false);
  await clic('#vt-panel');
  for (const o of ['Platillos', 'Amplificador de bajo', 'Cables de instrumento']) { await page.locator(`.vt-op[value="${o}"]`).check(); await pausa(250); }
  if (fotos) await foto(page, DIRS.val, `06_tarea2_respuesta_${vp}`, false);
  await clic('#vt-panel .btn-prim');
  // Tarea 3: prueba de sonido
  await clic('#vt-panel .btn-prim');
  await page.evaluate(() => go('fichas')); await pausa(1000);
  await clic('#vt-panel');
  await page.selectOption('#vt-pr', 'si'); await page.fill('#vt-hr', '19:00'); await pausa(400);
  await clic('#vt-panel .btn-prim');
  // Tarea 4: recuperar el acuerdo
  await clic('#vt-panel .btn-prim');
  await page.evaluate(() => go('acuerdos')); await pausa(700);
  await page.locator('#list-acuerdos .item', { hasText: 'La Bodega Sonora' }).click(); await pausa(1400);
  if (fotos) await foto(page, DIRS.val, `07_tarea4_acuerdo_${vp}`, false);
  await clic('#vt-panel');
  await page.fill('#vt-monto', '90000'); await pausa(400);
  await clic('#vt-panel .btn-prim');
  // Likert + pregunta abierta
  const likerts = page.locator('.likert');
  await likerts.nth(0).locator('button').nth(3).click(); await pausa(300);
  await likerts.nth(1).locator('button').nth(4).click(); await pausa(300);
  await likerts.nth(2).locator('button').nth(3).click(); await pausa(300);
  await page.fill('#vt-com', 'Ejemplo de respuesta abierta (sesión de prueba del equipo).'); await pausa(500);
  if (fotos) await foto(page, DIRS.val, `08_likert_${vp}`, false);
  await clic('#vt-panel .btn-prim');
  await pausa(1500);
  if (fotos) {
    await foto(page, DIRS.val, `09_fin_${vp}`, false);
    // Descargas: deben generar CSV y JSON con fecha y código, sin nombres
    for (const [i, ext] of [[0, 'csv'], [1, 'json']]) {
      const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#vt-panel .vt-row').first().locator('button').nth(i).click()]);
      const nombre = dl.suggestedFilename();
      if (!/^errebe_validacion_P00_\d{4}-\d{2}-\d{2}\.(csv|json)$/.test(nombre)) errores.push(`[${vp}] nombre de descarga inesperado: ${nombre}`);
      if (vp === '1440') await dl.saveAs(path.join(OUT, DIRS.val, 'ejemplo_' + nombre));
    }
  }
  return page.evaluate(() => VT.res);
}

(async () => {
  const exe = arg('chromium', fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  let htmlAntes = '';
  try { htmlAntes = execSync(`git show ${ANTES_REF}:errebeapp.html`, { cwd: ROOT, maxBuffer: 1 << 24 }).toString(); }
  catch (e) { console.warn('No se pudo leer la versión antes (' + ANTES_REF + '); se omite antes/después.'); }
  const srv = await servidor(htmlAntes);
  const base = 'http://localhost:' + srv.address().port;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  try {
    await capturarVistas(browser, base); console.log('✓ vistas');
    if (htmlAntes) { await capturarAntesDespues(browser, base); console.log('✓ antes/después'); }

    // Pantallas del modo validación en ambos anchos (sin video)
    const resultados = {};
    for (const vp of Object.keys(VIEWPORTS)) {
      const { ctx, page } = await nuevaPagina(browser, vp);
      await page.goto(base + '/despues?test=1');
      resultados[vp] = await flujoValidacion(page, { fotos: true, vp });
      await ctx.close();
    }
    console.log('✓ modo validación');

    // Video corto del flujo principal (escritorio)
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

    // Comprobaciones del flujo: las 4 tareas deben quedar completadas con la ruta correcta
    for (const [vp, r] of Object.entries(resultados)) {
      const mal = r.tareas.filter(t => !t.completada).map(t => t.id);
      if (mal.length) errores.push(`[${vp}] tareas no completadas en el flujo de referencia: ${mal.join(', ')}`);
    }
  } finally {
    await browser.close(); srv.close();
  }
  if (errores.length) { console.error('Errores:\n' + errores.join('\n')); process.exit(1); }
  console.log('Listo → ' + path.relative(ROOT, OUT));
})();
