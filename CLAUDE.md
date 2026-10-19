# ErreBe — Consideraciones de desarrollo

## Compatibilidad obligatoria: móvil y escritorio

**La app debe funcionar correctamente en iPhone/Android Y en computador (Chrome, Safari, Firefox).**

Antes de hacer cualquier cambio en HTML, CSS o JavaScript, verificar:

### CSS
- Usar siempre `-webkit-` prefix junto a la propiedad estándar para Safari/iOS:
  - `transform` → también `-webkit-transform`
  - `transition` → también `-webkit-transition`
  - `backdrop-filter` → también `-webkit-backdrop-filter`
  - `appearance` → también `-webkit-appearance`
- Evitar `inset: 0` — usar `top:0; left:0; right:0; bottom:0` (no soportado en iOS < 14.5)
- Inputs de formulario: `font-size` mínimo **16px** en móvil para evitar zoom automático en iOS
- `min-height: 100vh` → agregar también `min-height: -webkit-fill-available` para iOS Safari
- `touch-action: manipulation` en todos los botones para eliminar el delay de 300ms en iOS
- `-webkit-tap-highlight-color: transparent` global para quitar el flash azul en iOS
- Overlays/modales: siempre `-webkit-overflow-scrolling: touch` para scroll suave en iOS
- Transiciones de sidebar: usar `-webkit-transform: translateX()` en la regla `@media`

### JavaScript
- Verificar siempre la sintaxis con `node --check` antes de hacer commit
- No usar sintaxis moderna no soportada en iOS < 15 sin polyfill (verificar caniuse.com)
- Funciones de render: proteger con `if(!el) return` antes de manipular DOM para evitar crashes

### Layout responsivo
- Breakpoint principal: `max-width: 780px` para móvil
- Sidebar: `position: fixed` en móvil con `transform: translateX(-100%)` y botón ☰ **siempre visible** en la barra superior fija (`.mobile-bar`)
- Grillas: `.g-3` y `.g-2` colapsan a `1fr` en móvil (ya definido en CSS)
- Modales en móvil: estilo "sheet" que sube desde abajo (`border-radius: 16px 16px 0 0`)
- Tablas: columnas con `.hide-sm` se ocultan en móvil; el contenedor debe tener `overflow-x: auto`

### Flujo de deploy
1. Editar `errebeapp.html` en la rama `claude/mobile-document-responsive-hwaaw3`
2. Verificar sintaxis JS: `node --check`
3. Commit y push a la rama de desarrollo
4. Actualizar `gh-pages`: `git checkout gh-pages && git show <rama>:errebeapp.html > index.html && git add index.html && git commit && git push && git checkout <rama>`
5. GitHub Pages publica automáticamente en `https://criselpro2007.github.io/rb/`

### Tema claro / oscuro
- Las variables CSS están en `:root` (oscuro) y `[data-theme="light"]` (claro)
- La preferencia se guarda en `localStorage` con la clave `errebe:theme`
- Se inicializa al cargar la página antes de cualquier render para evitar flash
- Los botones de toggle están en: pantalla de bienvenida, sidebar, y barra móvil

### Modo validación (?test=1)
- Se activa solo con `?test=1` (ej.: `https://criscl1.github.io/rb/?test=1`). Usa `buildTestDB()` en memoria, no llama a `persist()` y guarda resultados en `localStorage['errebe:test:sesiones']`.
- Versión registrada actual: `ErreBe prototipo · Hito 2 v2` (ronda 2). La ronda 1 quedó como `ErreBe prototipo · Lab 9.2` (commit `c1accc6`). **No cambiar** el escenario (La Bodega Sonora, 60 %, 30 personas, transferencia, 48 horas, $5.000), las 4 tareas ni sus respuestas correctas: así se comparan las rondas.
- Además de tiempo, clics y completada, cada tarea registra `primera_seccion`, `pasos_formulario`, `pasos_secuencia` y, en T1, `guardo_borrador`. Columnas nuevas siempre **al final** del CSV (`VT_COLS`) y de la planilla.
- Cada sesión también se envía (POST text/plain) a la planilla del equipo vía Apps Script: `validacion/planilla_apps_script.gs`. La URL va en `VT_ENDPOINT` o se fija con `?hoja=<url /exec>` (queda en `localStorage['errebe:test:endpoint']`). Los envíos fallidos se reintentan al abrir `?test=1`.
- Comparar rondas: `python3 validacion/comparar_rondas.py --ronda1 <exportes> --ronda2 <exportes>` (% sobre sesiones válidas de cada ronda; sesiones identificadas por archivo y observador).
- Evidencias y prueba del flujo: `NODE_PATH=$(npm root -g) node evidencias/hito2/capturar.js` (falla si no se cumplen los criterios del Hito 2 o hay errores de consola). El de `evidencias/9.2/` corresponde a `c1accc6`.
- Decisiones de diseño: `DECISIONES.md` (D1–D29); evidencia citable: `CONTEXTO_ERREBE.md` (incluye los resultados V1 de la primera ronda).

### Estructura de navegación (Hito 2)
- Menú visible: máximo 5 entradas por rol (Inicio, Acuerdos, Locales y fichas / Mi ficha técnica, Agenda / Mis fechas, y "Más herramientas" plegado). Lo nuevo que no sea del flujo principal va dentro de "Más herramientas".
- Un solo botón primario (rojo) por vista. El "?" va junto al título de cada sección (`.q-btn`), no flotante.
- El acuerdo se registra por pasos (`acIr(n)`); el pie del modal (`.wiz-foot`) es fijo y debe seguir visible en 390 × 700.
