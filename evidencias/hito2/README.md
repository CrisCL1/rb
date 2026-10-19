# Evidencias · Hito 2 (iteración tras la primera validación)

Generadas con [`capturar.js`](capturar.js) (Playwright + Chromium). "Antes" es el commit `c1accc6`, la versión
que se usó en la primera validación (14–18 oct). Para regenerarlas desde la raíz del repo:

```bash
NODE_PATH=$(npm root -g) node evidencias/hito2/capturar.js                 # carpeta con la fecha de hoy
NODE_PATH=$(npm root -g) node evidencias/hito2/capturar.js --fecha=2026-10-19 --antes=c1accc6
```

El script levanta un servidor local, carga el escenario del test (La Bodega Sonora) y **falla** si hay
errores de JavaScript o de consola, o si no se cumple alguno de los criterios de la iteración:

- botón de avanzar/enviar visible en los 4 pasos del acuerdo a 1440 × 900, 390 × 844 y 390 × 700;
- cada paso cabe en 390 × 700 sin desplazarse;
- tras enviar: aviso "Enviado a … · esperando confirmación" y el acuerdo primero en la lista;
- menú visible con ≤ 5 entradas por rol y "Más herramientas" llega a cada herramienta;
- Inicio sin desplazarse a 1440 × 900 (ambos roles); la barra móvil muestra la sección actual;
- modo validación (`?test=1`) completo a 390 y 1440 px: 4 tareas completadas, T1 en ≤ 8 clics, versión `Hito 2 v2`.

## Estructura de `<fecha>/`

| Carpeta | Contenido |
|---|---|
| `antes-despues/` | `*_antes.png` (`c1accc6`) y `*_despues.png`, a 1440 y 390 px: `bienvenida`, `musico_entrada` / `local_entrada` (Inicio), `musico_menu` / `local_menu`, `musico_acuerdos` / `local_acuerdos` (lista), `musico_acuerdo-formulario` (antes, un solo formulario) frente a `musico_acuerdo-paso1` … `paso4` (después), `musico_acuerdo-paso4-faltan` (resumen con lo que falta) y `musico_acuerdo-tras-enviar`. |
| `validacion/` | Cada paso del modo validación en ambos anchos (`01_intro` … `13_fin`), con la ruta mínima de T1 paso a paso, y un CSV y un JSON de ejemplo por ancho. |
| `video/` | `flujo-modo-validacion.mp4` / `.webm`: flujo completo del test a 1280 × 760. |
| `verificacion/` | `resultado.json` con cada comprobación y su detalle; `boton-visible_paso1…4_390x700.png`. |

Los archivos `ejemplo_*` y el video son una **corrida automática del equipo con el código P00**. No son datos
de participantes y `comparar_rondas.py` los excluye salvo con `--incluir-p00`. Los tiempos de P00 no son
representativos (el script navega rápido); los clics de T1 sí son la ruta mínima.

## Comparar las dos rondas

```bash
python3 validacion/comparar_rondas.py --ronda1 <exportes ronda 1> --ronda2 <exportes ronda 2> --salida resumen.csv
```

Ver [`DECISIONES.md`](../../DECISIONES.md) (D16–D29) para el porqué de cada cambio.
