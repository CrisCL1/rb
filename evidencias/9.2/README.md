# Evidencias · Actividad 9.2

Generadas con [`capturar.js`](capturar.js) (Playwright + Chromium). Para regenerarlas desde la raíz del repo:

```bash
NODE_PATH=$(npm root -g) node evidencias/9.2/capturar.js            # carpeta con la fecha de hoy
NODE_PATH=$(npm root -g) node evidencias/9.2/capturar.js --fecha=2026-10-05 --antes=f965cea
```

El script levanta un servidor local, recorre la app y falla si hay errores de JavaScript o si el flujo de
referencia del modo validación no completa las 4 tareas.

## Estructura de `<fecha>/`

| Carpeta | Contenido |
|---|---|
| `vistas/` | Todas las vistas en rol Músico (`musico_NN_*`) y Local (`local_NN_*`), a 1440 px y 390 px. |
| `antes-despues/` | Pantallas modificadas hoy: `*_antes.png` (commit `f965cea`) y `*_despues.png`. |
| `validacion/` | Cada paso del modo validación (`?test=1`) en ambos anchos, más un CSV y un JSON de ejemplo. |
| `video/` | `flujo-modo-validacion.mp4` / `.webm`: flujo completo del test, ~23 s. |

Los archivos `ejemplo_*` y el video son una **corrida automática del equipo con el código P00**. No son datos
de participantes: usa P01 en adelante para las sesiones reales. Los clics y tiempos de P00 no son
representativos, porque el script navega directo.
