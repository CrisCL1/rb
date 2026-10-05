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
