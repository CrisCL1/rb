/**
 * ErreBe · Recepción de resultados del modo validación (?test=1)
 *
 * Instalación (una sola vez, ~3 minutos):
 * 1. Abre la planilla "ErreBe · Resultados validación 9.2" en Google Drive.
 * 2. Extensiones → Apps Script. Borra lo que haya y pega este archivo completo. Guarda.
 * 3. Implementar → Nueva implementación → tipo "Aplicación web".
 *      Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario
 * 4. Autoriza los permisos y copia la URL que termina en /exec.
 * 5. Pega esa URL en la app (modo validación → "Planilla del equipo") o pásala para dejarla fija en el código.
 *
 * Cada sesión se identifica por sesion_id. Si llega otra vez (por ejemplo, una sesión parcial
 * que luego se completa), sus filas anteriores se reemplazan: no quedan duplicados.
 *
 * Hito 2 (ronda 2): se agregaron 5 columnas AL FINAL (version, primera_seccion, pasos_formulario,
 * pasos_secuencia, guardo_borrador) para no mover las de la ronda 1. Para recibirlas hay que volver a
 * implementar: Implementar → Gestionar implementaciones → editar (lápiz) → Versión: nueva → Implementar.
 * Así la URL /exec no cambia. Mientras no se haga, esos datos igual quedan en la hoja "Sesiones (JSON)".
 */
const COLUMNAS = ['sesion_id', 'fecha', 'participante', 'observador', 'estado', 'dispositivo', 'viewport',
  'tarea_n', 'tarea_id', 'requerimiento', 'tarea', 'tiempo_s', 'completada', 'clics', 'respuesta', 'esperado',
  'likert_claridad', 'likert_utilidad', 'likert_usaria', 'comentario', 'recibido',
  'version', 'primera_seccion', 'pasos_formulario', 'pasos_secuencia', 'guardo_borrador'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const datos = JSON.parse(e.postData.contents);
    const hoja = hojaResultados_();
    const id = String(datos.sesion_id || '');
    if (!id || !Array.isArray(datos.filas)) return respuesta_({ ok: false, error: 'faltan datos' });

    // Quita las filas anteriores de la misma sesión (de abajo hacia arriba)
    const ultima = hoja.getLastRow();
    if (ultima > 1) {
      const ids = hoja.getRange(2, 1, ultima - 1, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) hoja.deleteRow(i + 2);
    }
    const ahora = new Date();
    const filas = datos.filas.map(f => COLUMNAS.map(c => c === 'recibido' ? ahora : (f[c] === undefined || f[c] === null ? '' : f[c])));
    if (filas.length) hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, COLUMNAS.length).setValues(filas);

    // Copia completa de la sesión en JSON, por si se necesita reconstruir algo
    const crudo = hojaCruda_();
    crudo.appendRow([id, ahora, JSON.stringify(datos.sesion || {})]);
    return respuesta_({ ok: true, filas: filas.length });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return respuesta_({ ok: true, servicio: 'ErreBe validación' }); }

function hojaResultados_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.getSheetByName('Resultados') || ss.getSheets()[0];
  if (h.getName() !== 'Resultados') h.setName('Resultados');
  if (h.getLastRow() === 0) h.appendRow(COLUMNAS);
  else if (h.getLastColumn() < COLUMNAS.length) h.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]); // agrega los encabezados nuevos
  return h;
}
function hojaCruda_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Sesiones (JSON)');
  if (!h) { h = ss.insertSheet('Sesiones (JSON)'); h.appendRow(['sesion_id', 'recibido', 'json']); }
  return h;
}
function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
