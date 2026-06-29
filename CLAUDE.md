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
