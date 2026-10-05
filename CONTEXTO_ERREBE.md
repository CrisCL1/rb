# Contexto ErreBe — base de evidencia

Extracto de los documentos del Equipo 10 en Google Drive, armado el 2026-10-05 para la Actividad 9.2.
Solo contiene lo que dicen esas fuentes, resumido. **No hay citas textuales de entrevistados**: las fuentes
presentan las entrevistas como paráfrasis del equipo, y así se mantienen aquí.

Fuentes:
- **[T1]** `Tarea1_ErreBe` (Google Doc, 7 sep 2026) — validación del problema, 5 entrevistas.
- **[RIA]** `RIA_ErreBe_Lab6.1.xlsx` (28 sep 2026) — requerimientos R1–R6, atributos, metas.
- **[9.1]** `Experimento_Validacion_ErreBe` (Google Doc, 28 sep 2026) — hipótesis y diseño del test.

Si algo de este archivo no calza con las fuentes, manda la fuente.

---

## Usuario y problema

- Usuario: músico independiente del **Segmento B** que trata su actividad **como oficio o proyecto en crecimiento** (cobra o espera cobrar). Quien toca por afición queda fuera: para ese perfil el problema prácticamente no existe. [T1 §3–4]
- Problema reformulado: los músicos cierran sus presentaciones por acuerdos verbales o de mensajería que **no dejan registro verificable** de las condiciones económicas ni técnicas, y quedan sin respaldo ante incumplimientos, pérdidas y percances técnicos. [T1 §4]
- Cliente distinto del usuario: el local controla el espacio y transa aforo y consumo; el músico persigue transparentar su trabajo. [T1 §2.3]

## Hallazgos de las entrevistas (Tarea 1)

| ID | Hallazgo | Fuente |
|---|---|---|
| E1 | 5 de 5 proyectos cerraron su último show por Instagram, WhatsApp o correo; ninguno conserva un documento firmado. Es el único hallazgo presente en el 100 % de los casos. | T1 §3 |
| E2 | Ante un pago atrasado, un entrevistado (Carlos Fuenzalida) señala que solo cabe esperar, porque no tienen representación para un reclamo formal. | T1 §3, Ficha 4 |
| E3 | Mismo caso: pagó $60.000 por agendar; esperaban ~$30.000 por integrante y recibieron $25.000. | T1 Ficha 4 |
| E4 | 4 de 5 casos reportan desajuste entre lo informado y lo encontrado: amplificadores inutilizables pese a existir ficha técnica; batería de mala calidad que el baterista tuvo que afinar largo rato; equipos desgastados aunque funcionales. | T1 §3 |
| E5 | Félix Arévalo (Niebla Púrpura): el local envió un listado técnico, pero la banda interpretó que la batería estaba disponible y era adecuada; atribuye el error a no haber formalizado la consulta. El problema no es la ausencia de ficha sino su falta de estandarización y de indicación del estado real. | T1 Ficha 2 |
| E6 | Dos proyectos declaran que la existencia de **prueba de sonido** determina si aceptan o rechazan una invitación, por sobre el monto. Su ausencia es un riesgo recurrente. | T1 §3, Ficha 3 |
| E7 | Un entrevistado **menor de edad** fue rechazado por un recinto con venta de alcohol. Surgió de un solo caso. | T1 §3, RIA R6 |
| E8 | Exigencias de asistencia mínima: llevar 30 personas (Ficha 4); vender mínimo 30 entradas en otro recinto (Ficha 3); cuota repartida entre dos bandas (Ficha 2). Condición abusiva en 3 de 5 casos (60 %), no universal. | T1 §3 |
| E9 | La coordinación consume 1–2 horas diarias la semana previa; el desgaste baja cuando un integrante concentra la gestión y sube cuando nadie está a cargo. | T1 §3, Ficha 5 |
| E10 | Incumplimientos no solo económicos: registros y certificados prometidos llegaron tarde o no llegaron (circuito universitario). | T1 Ficha 5 |
| E11 | Antelación insuficiente: principal motivo de rechazo en 3 de 5 casos. | T1 §3 |

## Requerimientos y atributos (RIA Lab 6.1)

| Req. | Debe ocurrir que… | Atributo | Prioridad | Meta |
|---|---|---|---|---|
| R1 | Músico y local dejen registradas, **antes de confirmar la fecha**, reparto de ganancias, cuota mínima de asistencia, método y plazo de pago, en un documento que **ambas partes puedan consultar** después. | Sincera | Alta | ≥ 80 % de acuerdos con los 4 campos; el usuario recupera el acuerdo sin ayuda |
| R2 | El músico conozca el inventario técnico con el **estado real de cada equipo**, en campos fijos y con fecha de actualización, para decidir qué llevar. | Informativa | Alta | ≥ 3 de 4 usuarios deciden bien qué llevar solo con la ficha |
| R3 | El músico sepa, antes de aceptar, si hay prueba de sonido y en qué condiciones (horario y duración). | Informativa | Media | 100 % responde bien en < 30 s |
| R4 | Fechas, tareas y responsables en un solo lugar, con una persona por tarea. | Práctica | Media | ≥ 90 % de tareas clave sin asistencia |
| R5 | El músico conozca el resultado económico estimado del show. | Clara | Baja | Desviación ≤ 20 % en 3 de 4 casos |
| R6 | Los músicos menores puedan identificar qué recintos los admiten. | Accesible (transversal) | Media | 100 % de fichas informan admisión de menores |

## Hipótesis y diseño del test (Actividad 9.1)

- **Hipótesis:** los músicos del Segmento B que tratan su actividad como oficio, al usar el prototipo para cerrar una fecha simulada, **registrarán las condiciones del acuerdo de forma completa y decidirán qué equipos llevar sin pedir ayuda ni consultar al local**. Se valida si se cumplen R1 (≥ 80 % acuerdos completos) y R2 (≥ 3 de 4 deciden bien). [9.1 §2]
- **Perfil a validar:** 4 músicos del Segmento B que cobran o esperan cobrar (pregunta de filtro), distintos del participante del test de la Tarea 5. [9.1 §5]
- **Supuestos críticos:** SC1 participantes del perfil objetivo; SC2 el prototipo debe incluir **todos los campos que se miden, en particular prueba de sonido y admisión de menores**. [9.1 §4]
- **Tareas definidas:** T1 registrar pre-acuerdo (R1); T2 decidir qué equipos llevar (R2); T3 prueba de sonido y horario, cronometrado (R3); T4 agendar y asignar 2 tareas (R4); T5 reabrir el acuerdo y decir cuánto le corresponde a la banda (R1); T6 simulador con un show real (R5); cierre con 2 preguntas abiertas. [9.1 §5]
- El observador no interviene salvo 2 minutos sin avance; en ese caso se registra "completada con ayuda". [9.1 §5]
- Test anterior (Tarea 5, CD1100): 1 solo usuario, perfil de afición, 100 % de tareas completadas; no concluyente. [RIA R4, 9.1 §1]
