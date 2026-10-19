# Decisiones de diseño — ErreBe

Registro de decisiones del prototipo. Cada entrada cita evidencia de [`CONTEXTO_ERREBE.md`](CONTEXTO_ERREBE.md)
(IDs E1…E11, R1…R6, SC1–SC2, T1…T6 de la 9.1). Lo que no tiene respaldo allí se marca **por validar**.

Evidencias visuales de esta jornada: [`evidencias/9.2/2026-10-05/`](evidencias/9.2/2026-10-05/).

---

## 2026-10-05 · Actividad 9.2 — Construcción y evidencias del prototipo

Hipótesis bajo prueba (9.1): el músico del Segmento B registra el acuerdo completo (R1) y decide qué equipos
llevar (R2) sin ayuda ni consultar al local. Perfil: músicos del Segmento B que cobran o esperan cobrar.

### D1 · Modo validación oculto tras `?test=1`, con datos en memoria
- **Qué:** el panel de test solo aparece con `?test=1`. Carga un set de datos de ejemplo propio (`buildTestDB`) y desactiva el guardado en `errebe:db`. Los resultados se guardan aparte, en `errebe:test:sesiones`.
- **Por qué:** el test necesita un escenario idéntico para los 4 participantes y no puede mezclarse con datos reales del prototipo ni ensuciarlos.
- **Evidencia:** 9.1 §5 (mismo local ficticio y escenario para todos; planilla por participante con tiempo y si completó).
- **Descartado:** un `test.html` aparte (duplicaría la app y rompería la estructura de un solo archivo); registrar todo a mano en la planilla (más error del observador en tiempos y clics).

### D2 · Cuatro tareas: T1, T2, T3 y T5 de la 9.1
- **Qué:** 1) registrar y enviar el acuerdo (R1); 2) marcar qué equipos llevar (R2); 3) prueba de sonido y hora (R3); 4) reabrir el acuerdo y decir cuánto recibe la banda (R1, recuperación).
- **Por qué:** la consigna permite 3–4 tareas. R1 y R2 son los que validan o refutan la hipótesis (prioridad alta); R3 es corto y SC2 exige medirlo.
- **Evidencia:** 9.1 §2 (criterio de validación R1 + R2), SC2, RIA R1 (meta incluye "recuperar el acuerdo sin ayuda").
- **Descartado dentro del panel:** T4 (agenda + tareas, R4) y T6 (simulador, R5). Son de prioridad media/baja y T6 necesita datos reales del participante. Siguen disponibles en la app para que el observador las aplique fuera del panel. **Por validar:** si sacarlas del panel cambia lo que se mide en R4/R5.

### D3 · "Completada" se calcula contra la pauta, no por autoinforme
- **Qué:** T1 revisa en los datos que exista un acuerdo con La Bodega Sonora con los 4 campos y enviado. T2, T3 y T4 comparan la respuesta con la pauta (T4 contra lo que quedó registrado en la app). También se registran tiempo, clics fuera del panel y "No pude" como abandono.
- **Por qué:** la 9.1 mide "cuántos de los cuatro campos quedan completos" y "comparar la respuesta con la pauta"; un botón de "lo logré" no mide eso.
- **Evidencia:** 9.1 §5 pasos 4–8 y §6 (métricas R1–R3).
- **Descartado:** preguntar al participante si cree que lo logró. **Por validar:** que el panel con la consigna no sesgue el recorrido; la 9.1 preveía un escenario impreso.

### D4 · Método y plazo de pago como campos separados y obligatorios para enviar
- **Qué:** el formulario agrupa reparto, asistencia mínima, método y plazo bajo "Lo que necesitas para enviarlo", con un contador `n de 4`. Se puede guardar borrador incompleto, pero no enviarlo; al intentarlo se marcan los campos faltantes. Los selects parten en "Elige…" para no dar por completo algo que nadie eligió.
- **Por qué:** R1 define exactamente esos 4 campos. Antes, método y plazo iban en un solo select ("Transferencia, 48 hrs") que siempre tenía valor, así que el campo nunca podía quedar "incompleto" ni medirse; y "Por puerta" no tenía plazo.
- **Evidencia:** RIA R1 (Sincera, 4 campos), E1, E3.
- **Descartado:** mantener el select combinado; hacer obligatorios también los campos opcionales (seguro, sonidista), que la evidencia no pide y alargan el registro.

### D5 · Ciclo del acuerdo: borrador → enviado → confirmado, y el local puede confirmar u observar
- **Qué:** el músico guarda un borrador o lo envía. Desde la cuenta Local, en la misma sección Acuerdos, el local confirma u observa con un texto. La banda ve la observación, corrige y reenvía. Un acuerdo confirmado queda bloqueado. Se eliminó el botón "Marcar como aceptado" del músico.
- **Por qué:** un acuerdo que el músico se acepta a sí mismo no es un registro que "ambas partes puedan consultar". Hoy, cuando el trato se incumple, el músico no tiene a qué recurrir.
- **Evidencia:** RIA R1 ("documento que ambas partes puedan consultar después", "antes de confirmar la fecha"), E1, E2.
- **Descartado:** firma o validación externa (fuera del alcance del prototipo); un módulo o pestaña nueva de bandeja para el local (la consigna no permite módulos nuevos; se amplió la sección existente).

### D6 · Historial con fecha y hora en cada acuerdo
- **Qué:** cada cambio de estado queda listado (enviado, observado con su texto, confirmado).
- **Por qué:** el problema es la falta de registro **verificable**; el estado actual por sí solo no muestra qué se dijo ni cuándo.
- **Evidencia:** E1, E2, E10 (compromisos que llegan tarde o no llegan).
- **Descartado:** mostrar solo el estado actual.

### D7 · El detalle del acuerdo muestra cuánto recibe la banda si se llega a la asistencia mínima
- **Qué:** con precio de entrada, asistencia mínima y reparto, se muestra el monto (ej.: 30 × $5.000 × 60 % = $90.000).
- **Por qué:** es la pregunta de T5 de la 9.1 ("cuánto le corresponde a la banda") y la diferencia entre lo esperado y lo recibido es un dolor documentado.
- **Evidencia:** 9.1 T5, E3, RIA R5 (Clara).
- **Descartado:** dejar solo el porcentaje y que el músico calcule. **Por validar:** si el cálculo en pantalla vuelve T4 del panel demasiado fácil para medir recuperación; si ocurre, se mide solo el tiempo hasta encontrarlo.

### D8 · Estado por equipo en la ficha y recuadro "La banda debe llevar"
- **Qué:** cada equipo tiene estado: Buen estado / Con desgaste, funciona / Con falla · no usar / No hay · llévalo. El local lo edita fila por fila. La ficha junta en un recuadro lo que falla, lo que no hay y lo que el local pide traer.
- **Por qué:** la falla no fue la falta de ficha, sino que no mostraba el estado real ni seguía un formato fijo. Con un solo estado general no se puede decidir equipo por equipo.
- **Evidencia:** E4, E5, RIA R2 (Informativa: "estado real de cada equipo, en campos fijos y con fecha de actualización").
- **Descartado:** texto libre por línea (como antes) o un estado general único. **Por validar:** si el recuadro calculado hace que el participante deje de leer la lista; se observará en T2.

### D9 · Prueba de sonido en la ficha: sí/no, hora y duración
- **Qué:** campo propio en la ficha del local, visible como dato fijo en la tarjeta y usado como respaldo en el detalle de cada fecha.
- **Por qué:** SC2 exige que el prototipo incluya el campo; antes solo existía como hora cargada por el músico en cada fecha.
- **Evidencia:** E6, RIA R3, 9.1 SC2.
- **Descartado:** dejarlo solo en la Agenda (depende de que el músico ya lo sepa, que es justo lo que falta).

### D10 · Admisión de menores escrita en palabras
- **Qué:** la edad mínima se muestra como "No admite menores (+18)", "Admite desde los N años" o "Todas las edades" (edad 0). Antes un 0 se guardaba como 18.
- **Por qué:** SC2 y R6 piden que cada ficha informe la admisión de menores sin ambigüedad.
- **Evidencia:** E7, RIA R6, 9.1 SC2.
- **Descartado:** agregar un campo sí/no aparte (duplica la edad mínima). **Por validar:** E7 viene de un solo caso.

### D11 · Escenario del test: local ficticio "La Bodega Sonora"
- **Qué:** 60 % para la banda, asistencia mínima 30, transferencia a 48 h, entrada $5.000. Ficha con platillos que no hay, amplificador de bajo con falla, monitores con desgaste y "trae cables". Respuestas correctas de T2: platillos, amplificador de bajo y cables.
- **Por qué:** el escenario necesita equipos que fallen o falten (si no, T2 no discrimina) y condiciones económicas con los 4 campos de R1.
- **Evidencia:** la asistencia mínima de 30 aparece en E8; los tipos de falla (amplificador inutilizable, equipo con desgaste) vienen de E4. **Por validar:** el reparto 60 %, el plazo de 48 h y el precio $5.000 no salen de entrevistas (supuesto S2 de la 9.1).
- **Descartado:** reutilizar "Bar Estación", que ya trae datos y acuerdos previos y confundiría T1 y T4.

### D12 · Panel de tarea minimizado y que no pierde respuestas
- **Qué:** al comenzar una tarea, el panel se reduce a una pestaña ("📋 2/4") para no tapar la app; en el teléfono va en el borde derecho, para no cubrir la × ni los botones de los modales. Ocultar y mostrar conserva lo marcado. Los clics dentro del panel no cuentan.
- **Por qué:** en 390 px el panel abierto cubre la ficha que el participante debe leer. Se detectó en las capturas de hoy.
- **Evidencia:** CLAUDE.md (compatibilidad móvil); capturas `validacion/05_*` y `06_*`.
- **Descartado:** panel fijo siempre visible (tapaba contenido); pegarlo arriba (tapaba la × del modal tipo hoja).

### D13 · Paleta: no se cambió hoy (pendiente del equipo)
- **Qué:** la consigna pide mantener #F2E4C9, #C8102E, #1A1A1A, #86B0B5 con Impact en titulares, pero el código publicado usa otra paleta (#E1121C, #0A0A0B, etc.) y "Arial Black" con Impact como alternativa. Los elementos nuevos usan las variables existentes; el título del panel de test usa Impact.
- **Por qué:** retematizar toda la app es un cambio grande que no se pidió y cambiaría cómo se ven todas las pantallas justo antes del test.
- **Evidencia:** ninguna en CONTEXTO_ERREBE.md. **Por validar / decisión pendiente del equipo.**
- **Descartado:** aplicar la paleta indicada sin confirmación.

### D14 · Persistencia: sin cambios hoy
- **Qué:** la app guarda en `window.storage`, que no existe en GitHub Pages, así que al recargar se vuelve a los datos de ejemplo. No se cambió.
- **Por qué:** para el test es irrelevante (cada sesión parte limpia) y cambiarla ahora podría mezclar datos de sesiones.
- **Evidencia:** ninguna. **Por validar:** R1 pide recuperar el acuerdo "después"; en el test solo se mide dentro de la misma sesión.

---

## 2026-10-14 · Corrección: los intentos no llegaban al equipo

### D15 · Cada intento se envía a una planilla compartida y queda también en el dispositivo
- **Qué pasó:** se hizo una prueba con P02 y el resultado no apareció en ninguna parte del proyecto. El modo validación solo guardaba en el navegador del dispositivo usado, y para que llegara al equipo había que descargar el CSV a mano.
- **Qué:** cada sesión se envía a la planilla de Google Sheets "ErreBe · Resultados validación 9.2", tras cada tarea y al final; también se envían las sesiones abandonadas a la mitad. Si no hay conexión, queda pendiente y se reintenta al abrir `?test=1` de nuevo. La pantalla de inicio lista los intentos guardados en el dispositivo y su estado de envío, con botones Enviar y Compartir (en el teléfono abre WhatsApp, Drive o correo). Se registra además quién observa la sesión.
- **Por qué:** la 9.1 pide consolidar las 4 planillas en una sola (paso 12). Un archivo que depende de que alguien recuerde descargarlo se pierde.
- **Evidencia:** 9.1 §5, paso 12; falla observada en la sesión P02.
- **Descartado:** subir los resultados al repositorio desde la app (exigiría una clave de GitHub expuesta en la página); un servicio externo de base de datos (otra cuenta más que mantener).
- **Datos personales:** el participante sigue identificado solo por código. "Quién observa" es un integrante del equipo, no el participante.

---

## 2026-10-19 · Hito 2: iteración tras la primera validación

Evidencia: resultados V1 en [`CONTEXTO_ERREBE.md`](CONTEXTO_ERREBE.md#resultados-de-la-primera-validación-modo-test1-1418-oct-2026)
(IDs V1-…). Línea base "antes": commit `c1accc6`. Capturas antes/después: [`evidencias/hito2/`](evidencias/hito2/).

**Decisión del equipo: iterar, no pivotar.** El valor se entiende (utilidad 4,4) y la ficha técnica funciona
(T2 y T3 con mediana de 1 clic); lo que falla es encontrar y completar el acuerdo (T1 40 %, T4 80 %) y
orientarse al entrar (claridad 4,0; V1-e, V1-f, V1-g). Cada cambio apunta a una conducta observable en la
ronda 2: **el músico envía el acuerdo sin pedir ayuda y lo vuelve a encontrar**. Lo que no ayuda a eso no se
construye (clase U2.1). No se agregan pestañas, paneles ni textos que nombren los atributos.

### D16 · El acuerdo se registra en 4 pasos cortos, con el botón de avanzar o enviar fijo al pie
- **Qué cambió:** el formulario único "Nuevo acuerdo" pasa a 4 pasos: 1) local, 2) reparto y asistencia mínima, 3) método y plazo de pago, 4) revisar y enviar. El pie del modal (contador, "qué falta" y botón) queda fijo y visible en móvil y escritorio. Cada paso cabe en 390 × 700 sin desplazarse (verificado en `evidencias/hito2/<fecha>/verificacion/`).
- **Por qué:** T1 llegó a 40 % (2 de 5; meta ≥ 80 %). Quienes fallaron usaron 27 a 49 clics y quienes lo lograron 16 y 18 (V1-b): más de 25 clics es buscar dónde está la acción, no un formulario largo. En `c1accc6` los botones de envío no se veían sin desplazarse (V1-h).
- **Evidencia:** V1-T1, V1-b, V1-h; RIA R1.
- **Descartado:** dejar el formulario único y solo fijar el botón (no ordena qué completar primero); un paso por campo (8 pantallas y más clics); bloquear el avance hasta completar cada paso (impediría guardar un borrador incompleto, que D4 permite).

### D17 · Indicador de avance y lista de lo que falta, con enlace a su paso
- **Qué cambió:** el encabezado dice "Paso n de 4" y muestra los 4 pasos (se puede saltar a cualquiera). El pie mantiene el contador "n de 4" de D4 y dice qué falta ("Para enviarlo falta: método de pago, plazo de pago"). En el paso 4, cada condición faltante aparece con "Completar en paso n". Si se intenta enviar incompleto, se marcan los campos (D4 sigue igual).
- **Por qué:** visibilidad del estado y prevención de errores (workshop UX/UI). P05 pidió referencias de "en qué panel u opción está lo solicitado" (V1-f).
- **Evidencia:** V1-f, V1-T1; D4.
- **Descartado:** deshabilitar "Enviar al local" mientras falte algo (un botón gris no dice qué falta).

### D18 · Los campos opcionales se pliegan; el precio de la entrada pasa al paso 2
- **Qué cambió:** seguro de sala, hora de carga, contacto del sonidista y condiciones quedan en "Agregar detalles (opcional)", cerrado por defecto, en el paso 4. El precio de la entrada se pide en el paso 2 como "Precio de la entrada (para calcular tu ganancia)" y ahí mismo se calcula cuánto recibe la banda.
- **Por qué:** "diseñar es restar": esos campos no los exige R1 y competían con los 4 que sí. El precio sí es necesario para mostrar el monto de D7, que es lo que pregunta T4.
- **Evidencia:** RIA R1 (4 campos), D7, V1-T4.
- **Descartado:** borrar los opcionales (los usa el detalle del acuerdo y los ve el local); hacer obligatorio el precio para enviar (cambiaría la regla de 4 campos de D4 y la pauta de T1).

### D19 · Elegir de una lista avanza solo; la ruta mínima de T1 baja de 10 a 8 toques
- **Qué cambió:** en el paso 1 el local se elige de una lista de botones (o se escribe otro) y al tocarlo se pasa al paso 2 con el cursor en el reparto. Método y plazo son botones de opción, no selects; con ambos elegidos se pasa solo al resumen, desde donde se puede volver con "Cambiar". Enter pasa al campo siguiente.
- **Por qué:** cada select nativo cuesta 2 toques (abrir y elegir) y en iOS abre una rueda. Ruta mínima Inicio → enviado con el escenario completo: **antes 10 toques** (+ Nuevo acuerdo, local, reparto, asistencia, método ×2, plazo ×2, precio, Enviar; 9 sin el precio, que era opcional); **después 8** (Cerrar una fecha nueva, local, asistencia, precio, Siguiente, método, plazo, Enviar al local), medido con el contador de clics del modo validación a 390 y 1440 px.
- **Evidencia:** V1-b (clics de T1); contexto de uso "de pie, apurado, con una mano y en el celular" (workshop UX/UI).
- **Descartado:** avanzar solo al terminar de escribir un número (no se sabe cuándo terminó). **Por validar:** que el avance automático no desoriente; se revisará en `pasos_secuencia` de la ronda 2.

### D20 · Después de enviar: estado explícito y el acuerdo arriba de la lista
- **Qué cambió:** al enviar se vuelve a Acuerdos con el aviso "Enviado a La Bodega Sonora · esperando confirmación" y el acuerdo queda primero y marcado. La lista ordena lo pendiente arriba (Músico: observado, borrador, enviado, confirmado; Local: por revisar primero). Antes se abría el detalle y la lista seguía el orden de creación.
- **Por qué:** en T4 dos personas no encontraron el acuerdo tras 41 y 48 clics (V1-c). Si el acuerdo recién enviado queda a la vista, reabrirlo es un toque.
- **Evidencia:** V1-T4, V1-c; RIA R1 ("el usuario recupera el acuerdo sin ayuda").
- **Descartado:** notificaciones o correo al local (funcionalidad nueva, fuera del alcance del prototipo).

### D21 · Estados con texto, no solo color, y la acción que sigue
- **Qué cambió:** "Falta que el local confirme", "Confirmado por ambos", "El local hizo una observación" (Músico); "Te toca revisarlo" y "Esperando que la banda corrija" (Local); "Borrador · n de 4". Bajo cada acuerdo pendiente se indica qué hacer ("Revisa la observación y corrígelo →").
- **Por qué:** visibilidad del estado; "reconocer, no recordar". El ciclo de D5 seguía igual pero había que deducir qué hacer con cada estado.
- **Evidencia:** D5, D6; V1-f.
- **Descartado:** íconos sin texto.

### D22 · Inicio con tres accesos grandes y solo lo que ayuda a decidir
- **Qué cambió:** al entrar como Músico, arriba: "Cerrar una fecha nueva" (botón principal, rojo), "Ver mis acuerdos" (con contador de pendientes) y "Ver locales y sus fichas". Como Local: "Revisar acuerdos que te enviaron", "Mi ficha técnica" y "Mis fechas". Debajo, solo la próxima fecha y los acuerdos pendientes. Se quitaron las tarjetas de métricas (acuerdos confirmados, fechas confirmadas, equipos publicados, días desde actualización) porque no llevan a una acción; siguen en Estadísticas o en la ficha. Inicio no requiere desplazarse a 1440 × 900.
- **Por qué:** "se siente como si fuese mucha información de una sola vez" (V1-e); la claridad (4,0) quedó bajo la utilidad (4,4) y una participante puso claridad 2 (V1-a); conclusión del equipo: página saturada (V1-g). "El valor vive en un paso concreto. Todo lo demás debería protegerlo, no enterrarlo."
- **Evidencia:** V1-a, V1-e, V1-g, V1-h.
- **Descartado:** mantener las métricas en Inicio; un tutorial modal al entrar (el equipo ya lo reemplazó por ayuda por página en `2fe7cec`).

### D23 · Primera visita: "Así funciona ErreBe" en tres pasos, se cierra y no vuelve
- **Qué cambió:** bajo los accesos de Inicio, un bloque breve: revisa la ficha del local → cierra el acuerdo → la fecha queda en tu agenda (en Local: publica tu ficha → revisa los acuerdos → la fecha queda en tus fechas). Cada paso lleva a su sección. La × lo oculta y deja una marca en `localStorage` (`errebe:guia:<rol>`, con try/catch). En `?test=1` no se guarda la marca: todos los participantes lo ven al empezar.
- **Por qué:** P05: "Para un principio, las instrucciones son poco claras" (V1-f). Es una orientación de entrada que no bloquea.
- **Evidencia:** V1-f.
- **Descartado:** un recorrido paso a paso que bloquea la pantalla (mismo motivo que en D22). **Pendiente:** el acuerdo todavía no crea la fecha en la agenda; en el escenario del test la fecha con La Bodega Sonora ya existe.

### D24 · Menú corto: 4 entradas y "Más herramientas" plegado
- **Qué cambió:** el menú visible es Inicio, Acuerdos, Locales y fichas (Local: Mi ficha técnica) y Agenda (Local: Mis fechas), más "Más herramientas", cerrado por defecto, con Simulador, Tareas, Alertas legales, QR & Público, Buscador y Estadísticas (Local: Alertas legales, Buscador y Estadísticas). Cada una lleva una línea que dice para qué sirve. Ninguna se borró; si se abre una, el grupo queda desplegado y marcado. Local ahora tiene "Mis fechas" (antes no tenía agenda).
- **Por qué:** 10 entradas en el menú del Músico (V1-h). Las tareas validadas usan solo Inicio, Acuerdos y Fichas. "El atributo también te dice qué no construir" (U2.1).
- **Evidencia:** V1-h, V1-g; D2 (T4 y T6 de la 9.1 viven en las herramientas y siguen accesibles).
- **Descartado:** eliminar herramientas; ocultarlas por completo.

### D25 · Referencias de ubicación y "?" junto al título
- **Qué cambió:** cada sección muestra su título y una línea que dice qué se hace ahí. En el teléfono la barra superior muestra la sección actual. El ítem activo del menú se marca con borde rojo y texto en negrita. El botón "?" ya no flota rojo arriba a la derecha (competía con "+ Nuevo acuerdo"): ahora va junto al título de cada sección, en gris, con el mismo contenido.
- **Por qué:** P05 pidió referencias de en qué panel está lo solicitado (V1-f); un solo botón llamativo por pantalla.
- **Evidencia:** V1-f, V1-h.
- **Descartado:** quitar la ayuda; mantener el "?" en la barra móvil (se veía como una segunda acción).

### D26 · Lenguaje del usuario y estados vacíos útiles
- **Qué cambió:** "Cerrar una fecha nueva" en vez de "+ Nuevo acuerdo"; "Locales y fichas"; "equipo" en vez de "backline"; "para calcular tu ganancia", "lo que te pagaron y lo que te deben". En la bienvenida, bajo cada cuenta: "Cierra tus fechas por escrito y revisa el equipo de cada local" (músico) y "Publica tu ficha y recibe acuerdos claros de las bandas" (local). Alertas legales y QR & Público mantienen su nombre y dicen para qué sirven. Sin emojis en los títulos. Cuando no hay acuerdos, fechas o ficha, se dice qué hacer y hay un botón para hacerlo.
- **Por qué:** las tareas deben poder completarse leyendo solo lo que aparece en pantalla, sin explicación del observador (V1-f).
- **Evidencia:** V1-f, V1-e.
- **Descartado:** renombrar Alertas legales y QR & Público: basta con decir para qué sirven.

### D27 · Jerarquía visual y accesibilidad sin cambiar la paleta
- **Qué cambió:** un solo botón primario rojo por vista; los secundarios con borde o subrayado ("Guardar borrador" pesa menos que "Enviar al local"). Objetivos táctiles de al menos 44 px en botones, menú, opciones y enlaces del formulario. Los textos secundarios (ayudas, subtítulos, etiquetas) usan `--gris` (≥ 4,5:1 sobre el fondo) en vez de `--gris-2`. En tema claro, los chips de estado llevan el texto en `--texto` con borde del color del estado, porque el ámbar y el verde claros no llegaban a 4,5:1.
- **Por qué:** heurística de diseño minimalista; contraste 4,5:1 y 44 px; contexto de uso con una mano.
- **Evidencia:** lineamientos del workshop UX/UI; CLAUDE.md.
- **Descartado:** cambiar los valores de las variables de color (D13 sigue pendiente del equipo).

### D28 · La ficha técnica no se rediseña: se hace visible desde la entrada
- **Qué cambió:** acceso directo desde Inicio ("Ver locales y sus fichas") y entrada propia en el menú. Cada tarjeta mantiene la prueba de sonido como primer dato y el recuadro "La banda debe llevar". Se agregó en cada tarjeta un botón secundario "Cerrar una fecha con este local", que abre el acuerdo con el local ya elegido.
- **Por qué:** T2 100 % y T3 100 % con mediana de 1 clic: funciona. T3 tuvo un caso de 386 s (V1-d), por eso los dos datos siguen destacados.
- **Evidencia:** V1-T2, V1-T3, V1-d; D8, D9.
- **Descartado:** reordenar o rediseñar la tarjeta.

### D29 · Segunda ronda comparable con la primera
- **Qué cambió:** la versión registrada pasa a `ErreBe prototipo · Hito 2 v2`. Escenario (La Bodega Sonora, 60 %, 30 personas, transferencia, 48 horas, $5.000), 4 tareas y respuestas correctas sin cambios. Se registra además, por tarea: primera sección o ventana abierta tras comenzar (`primera_seccion`), pasos del formulario recorridos (`pasos_formulario`, `pasos_secuencia`) y, en T1, si guardó un borrador en vez de enviar (`guardo_borrador`). Las columnas nuevas van al final del CSV y de la planilla. `validacion/comparar_rondas.py` calcula por tarea y ronda el % completado (sobre el total de sesiones válidas), las medianas de tiempo y clics y los promedios Likert.
- **Por qué:** la rúbrica pide resultados conectados a los indicadores del RIA; solo se pueden comparar si las tareas y la pauta son las mismas. Las sesiones se identifican por archivo y observador porque varias se exportaron con el mismo código (P03).
- **Evidencia:** D1–D3, D15; V1.
- **Descartado:** cambiar tareas o escenario; una planilla aparte para la ronda 2 (la columna `version` separa las rondas). **Pendiente del equipo:** volver a implementar el Apps Script (misma URL) para ver las columnas nuevas en la hoja "Resultados"; mientras tanto quedan en "Sesiones (JSON)".
