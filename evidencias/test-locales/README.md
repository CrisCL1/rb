# Evidencias · Test para locales y ficha técnica por pasos

Link del test: **https://criscl1.github.io/rb/?test=local** (el de músicos sigue en `?test=1`).

Generadas con [`capturar.js`](capturar.js) (Playwright + Chromium). "Antes" de la ficha es el commit `807733b` (Hito 2).

```bash
NODE_PATH=$(npm root -g) node evidencias/test-locales/capturar.js
```

El script recorre el test completo a 390 y 1440 px. A mitad de la tarea 3 **recarga la página** y comprueba que
"Seguir donde quedé" vuelve a la misma tarea con lo ya hecho. Al final descarga el archivo con el botón final y
revisa su nombre y contenido. Falla si hay errores de consola o si alguna comprobación no se cumple
(`verificacion/resultado.json`).

| Carpeta | Contenido |
|---|---|
| `test/` | `01_intro` … `13_intro_con_test_guardado`, en ambos anchos, y el CSV de ejemplo descargado. |
| `ficha/` | `musico_fichas_*_antes/despues` (tarjeta) y `local_ficha-editar_*_antes` frente a `local_ficha-paso1…4_*_despues`. |
| `verificacion/` | `resultado.json`. |

Los nombres usados ("Prueba Equipo", "Local de prueba", "Banda de Prueba") son de una corrida automática del equipo,
no de un local real. Decisiones: [`DECISIONES.md`](../../DECISIONES.md) D30–D33.
