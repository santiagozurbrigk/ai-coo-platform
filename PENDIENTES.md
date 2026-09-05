# PENDIENTES.md — Backlog de trabajo pendiente en Limitless

> **Para Claude Code y cualquier asistente IA:**  
> Leer este archivo junto con `CHANGES.md` al inicio de cada sesión.  
> Actualizar este archivo cuando se completa un ítem o se agregan nuevos pendientes.  
> Al completar un ítem: moverlo a la sección `## ✅ Completados` con fecha.

---

## 🔴 Urgente — Hacer antes de usar con clientes reales

### [TRACKERS-PERMISOS-VACIOS] Todos los wins ya cargados quedan sin permiso 🔴

**Qué es:** los permisos existen desde hoy, así que **cada win cargado antes de
esta sesión quedó en "sin preguntar"** — o sea, no publicable. Es deliberado: no
se puede asumir un permiso que nadie dio. Pero significa que la primera vez que
entres al dashboard vas a ver todo marcado sin permiso.

**Qué hacer:** repasar los wins que ya se usaron en material y cargarles el
permiso que efectivamente dieron, con la nota de cómo lo dijeron.

---

### [TRACKERS-PROBAR-CON-SESION] Probar los cinco cambios con una sesión real 🔴

**Qué es:** las capturas de la revisión semanal, del tracker con permisos y de la
ficha del cliente se sacaron con el middleware puenteado y datos inventados. Eso
verifica que la pantalla dibuja, **no** que las Server Actions escriben.

**Qué probar:** cargar un permiso y ver que el filtro "Con permiso" lo levanta;
marcar una reservada; cargar objetivo y fecha de egreso en la ficha; anotar un
estado en la revisión semanal y ver la fecha del anotado.

**Bloque completo en:** `docs/PLAN_VERIFICACION.md`.

---

### [TRACKERS-EGRESO-MANUAL] La fecha de egreso no se calcula del plan

**Qué es:** `clients.exit_date` se carga a mano. Existe `plan_durations` con la
duración del plan; calcular la fecha desde ahí y dejarla editable era la propuesta
del análisis y quedó afuera.

---

### [TRACKERS-RIESGO-PAGOS] "En riesgo" sólo ve las cuotas cargadas

**Qué es:** la señal de pago atrasado sale de `clients.installments`. Un cliente
sin cuotas cargadas —pago único, o cuotas que nunca se cargaron— **nunca dispara
esa señal**, así que necesita las otras dos para aparecer en riesgo.

---

### [TRACKERS-RECOMENDACIONES-6-10] Lo que el análisis dejó para después

**Qué es:** de las diez recomendaciones de `docs/TRACKERS_EXCEL_VS_OTC.md` se
construyeron las cinco primeras. Quedan: ficha de caso (creencias, restricciones,
proceso), checklist de contenido por caso, revisión mensual de patrones, caso de
éxito como entidad curada, próximos pasos por llamada de entrega y responsable por
cliente. **Son producto nuevo, no una migración chica.**

---


### [PROPUESTAS-CALIDAD-SIN-VER] Medir los falsos positivos del matcher de hitos 🔴

**Qué es:** el filtro que decide qué propuesta sobrevive tiene 19 tests, pero
**el matcher nunca corrió contra la API real**. Los tests cubren que no se
inventen hitos ni textos y que el umbral corte; no cubren la calidad de las
coincidencias.

**Qué mirar en la primera corrida real:** cuántas propuestas se aceptan contra
cuántas se descartan. Si se descartan más de la mitad, hay que subir el piso de
confianza (`MIN_MATCH_CONFIDENCE`, hoy 0.7) o endurecer el prompt — una lista de
propuestas que casi siempre están mal se deja de mirar.

---

### [B-FATHOM-NUNCA-PROBADO] Probar Fathom contra una cuenta real 🔴

**Qué es:** L0 arregló el módulo de keys por miembro —que **nunca funcionó**,
porque el código usaba una columna inexistente— pero **nada se probó contra
Fathom**. Ni conectar una key, ni crear un webhook, ni recibir un evento.

**Lo que más riesgo tiene, en orden:**

1. **La verificación de firma.** Se asume HMAC-SHA256 sobre el cuerpo crudo y una
   lista de headers posibles. **Si Fathom firma distinto, se rechazan todos los
   webhooks** y no llega ninguna llamada. Es lo primero a mirar con un evento real.
2. **La forma del payload del webhook** y de `crm_matches`. El extractor acepta
   variantes y descarta lo que no entiende, pero la primera llamada real manda.
3. **`POST /webhooks`.** Que devuelva `id` y `secret` como dice el plan.

**Cómo se verifica (del plan):** dos miembros conectan su key → el panel los
muestra conectados con su mail confirmado → cada uno graba una llamada y **las dos
llegan solas** → los dos en una misma llamada dan **una sola fila** → uno revoca la
key y la fila pasa a "revocada" → uno se desconecta y **el webhook desaparece de su
cuenta de Fathom**.

---

### [B-SEMBRAR-IDENTIDADES] Sembrar `client_identities` 🔴

**Qué es:** la tabla existe y la resolución de contraparte la usa, pero **nadie la
llena todavía**. Sin la siembra, el módulo arranca resolviendo mucho menos de lo
que puede: cada llamada iría a la cola de revisión en vez de resolverse sola.

**De dónde sale, todo ya existe en la base:** `clients` (nombre, **apodo**, mail),
`sales_leads`, `closing_calls` (nombre y mail de cada turno), contactos de GHL, y
el **mail del comprador** de los pagos.

**Ojo con el apodo:** `clients.nickname` es exactamente el tipo de dato que hace
match con un nombre de pantalla de Zoom, y hoy no lo usa nadie.

---

### [D-SOPS-VIDEO-NUNCA-CORRIO] Probar el flujo entero de SOP desde video 🔴

**Qué es:** el encargo D está completo pero **nunca se ejecutó**: no se subió un
video, no se llamó a Whisper ni a Sonnet, y el worker no corrió una sola vez. La
lógica pura tiene 25 tests; el resto no tiene ninguna prueba real.

**Lo que más riesgo tiene, en orden:**

1. **ffmpeg en Vercel.** El binario de `@ffmpeg-installer` está en `apps/web` por
   Trial Reels, pero el worker de SOPs nunca se ejecutó en producción. Si no está
   disponible en la lambda, falla ahí y no hay forma de saberlo antes.
2. **El tiempo.** `maxDuration = 800`; un Loom de una hora hace cinco llamadas a
   Whisper en serie. Puede no alcanzar.
3. **El peso estimado del audio** (`ESTIMATED_BYTES_PER_SECOND`) se eligió por
   criterio, no midiendo. Conviene transcribir un audio real y ajustar.
4. **La calidad del SOP.** La regla de "no inventar pasos" está en el prompt; no
   hay forma de saber cuánto la respeta sin correrla contra un video real.

**Necesita:** `OPENAI_API_KEY`, `QSTASH_TOKEN` y `NEXT_PUBLIC_APP_URL`.

---

### [E-D1-DESPLEGAR] Desplegar el bot de Discord 🔴

**Qué es:** el bot está escrito entero y **no corre en ningún lado**. Nada de la
actividad, el silencio ni los testimonios funciona hasta que esté desplegado.

**Es operación, no código.** El runbook paso a paso está en
**`docs/DISCORD_DEPLOY.md`**: activar el intent MESSAGE CONTENT, sacar el token,
desplegar en Railway con cinco variables, e instalar el bot en un servidor.

**Cómo sabés que salió bien:** hay filas en `discord_messages` **con `content` no
vacío**. Si `content` viene vacío, el intent no está activado — ese es el modo de
falla peligroso, porque el bot parece andar.

---

### [E-RETENCION] Decidir la retención de mensajes de terceros 🔴

**Qué es:** el bot lee y guarda mensajes de **personas que no son usuarias de
OTC** (los clientes de tu cliente). Hoy se guardan para siempre y no hay nada
escrito que diga que el servidor está siendo registrado.

**Cuándo:** **antes** de instalarlo en el servidor de un cliente, no después.

---



### [A-PROBAR-CAPTURAS] La subida de capturas nunca se ejecutó 🔴

**Qué es:** el flujo de captura (pedir signed URL → subir → registrar) está
escrito copiando el patrón de `sop_attachments`, pero **nunca corrió**. Toca
storage, que es donde más fácil se rompe algo silenciosamente.

✅ **Verificado el 2026-09-03 — la mitad de seguridad:** el bucket `client-wins`
existe, es **privado**, limita a 10 MB y sólo imágenes, y **ninguna policy de
`storage.objects` lo nombra**: ningún rol del cliente puede leerlo ni escribirlo
directamente. Sólo el admin del servidor, que es lo que hace el código.

🔴 **Falta la vuelta completa**, que necesita la `SUPABASE_SERVICE_ROLE_KEY` (no
está en el entorno de desarrollo): pedir el signed URL, subir la imagen, verla en
el tracker, y confirmar que borrar un win **borra también el archivo** del bucket.

---

### [A-ENGANCHES-W3] Wins desde Discord y desde llamadas

**Qué es:** la fase W3 dejó la sección de wins en la ficha del cliente, pero los
**candidatos automáticos** no están: un testimonio de Discord y una llamada de
Fathom deberían proponer un win que alguien acepta —mismo criterio que las
propuestas de checkpoint de C3—. Lo conectan los Encargos **E** y **B**.
`client_wins.source` y `source_ref` ya existen para eso.

---

### [C3-TRABADO-SIN-PRIMER-HITO] Un cliente que nunca arrancó no figura como trabado

**Qué es:** el plazo se cuenta desde el hito **inmediatamente anterior**. Si un
cliente no tiene ningún hito registrado, no hay desde cuándo contar y **no se
marca trabado** — aunque sea el caso más urgente (compró y nunca empezó).

**Por qué quedó así:** anclarlo a la fecha de alta del cliente es una decisión de
producto distinta, no un bug. Hoy esos clientes se ven igual en la lista, con
"Sin empezar".

**Si se decide cambiarlo:** el único lugar a tocar es `deriveClientJourneyStatus`
en `lib/checkpoints/stalled.ts`, caso 3.

---


### [C2-PROBAR-FICHA] Probar el registro de checkpoints en la ficha con sesión real

**Qué es:** la sección "Recorrido" de la ficha del cliente ya se vio en un
navegador, pero **con datos fabricados y una página descartable** (borrada).
Falta la pasada real: entrar a un cliente, registrar un checkpoint, ver que las
métricas se piden según lo configurado y que se guardan.

**Qué mirar,** bloque §16 de `docs/PLAN_VERIFICACION.md`. Los tres que más
importan: que un checkpoint con `sets_client_status` **mueva el estado del
cliente** al registrarlo; que **deshacer NO revierta el estado** (sí avisa); y
que un monto ilegible se rechace en vez de guardarse como cero.

---

### [C1-PROBAR-PANTALLA] Probar el Recorrido del cliente con una sesión real

**Qué es:** la migración está aplicada y los cortes de la base verificados, pero
la pantalla sólo se vio **con datos fabricados y el founder forzado**. Falta la
pasada real: crear tres fases, meterles checkpoints y elegirles métricas.

**Qué mirar,** bloque §15 de `docs/PLAN_VERIFICACION.md`. Los dos pasos que más
importan: que una métrica siga apuntando a su columna después de renombrarla, y
que borrar una fase con checkpoints adentro **se rechace** (la base los borraría
en cascada).

**Pendiente de scope, anotado a propósito:** `clients.current_stage_id` todavía
no existe. Es estado, no catálogo, y se escribe al registrar un evento — va en la
migración de **C2**.

---

### [C0-PROBAR-PANTALLA] Probar Campos personalizados con una sesión real

**Qué es:** ✅ **parcialmente verificado el 2026-09-03 con datos reales.** En la
base hay dos columnas creadas desde la pantalla: una de wins (`tipo_de_win`, 7
opciones, cargada con el botón de ejemplo y **después renombrada a "Wbinar"
manteniendo su clave interna** — que es la prueba del mecanismo entero) y una de
checkpoints (`nose`, lista de 2 opciones, obligatoria).

Queda por probar: archivar una opción, el rechazo al sacar una opción en uso, y
que un `operator` no vea los botones de editar.

**Qué mirar,** en el orden del bloque §14 de `docs/PLAN_VERIFICACION.md`. El paso
que más importa: crear una columna, renombrarla y confirmar que su **clave interna
no cambia** — si cambia, el mecanismo entero se cae.

**Verificar también** que un `operator` ve la pantalla sin los botones de editar.

---

### [C0-PENDIENTES] Lo que C0 dejó abierto a propósito

**`options_source = 'journey_stages'` no se puede elegir desde la UI.** La
columna existe en la base y la lógica la soporta; falta el catálogo de fases,
que entrega **C1**. Cuando esté, se habilita la opción en la pantalla y el campo
"Fase" del Encargo A pasa a tomar sus opciones del catálogo cambiando una fila,
sin migrar datos.

**El chequeo de "columna en uso" todavía no puede fallar.** `isFieldInUse`
consulta `client_wins` y `client_checkpoint_events`, que no existen: las traen el
**Encargo A** y **C2**. Hoy toda columna cuenta como sin uso y se puede borrar.
Reverificar cuando esas tablas entren.

**Sin cobertura de Playwright** en la pantalla de campos personalizados.

---

### [LLAMADAS-PR] Un solo PR al final, no uno por fase

**Decisión del usuario (2026-09-01):** las tres fases del módulo de llamadas se
acumulan en `Claude-New-Features` y se abre **un único PR** cuando estén todas
listas, para pasar la implementación entera a producción de una vez.

**No abrir PR antes de terminar la Fase 2.**

---

### [LLAMADAS-VERIFICAR-FATHOM] Probar el cruce con datos reales 🔴

**Qué es:** el motor está construido pero **nada se probó contra una cuenta real
de Fathom**. El mapeo de campos se hizo leyendo la documentación.

**Qué mirar, en orden:**

1. **¿`calendar_invitees` viene poblado?** Es la señal de la que cuelga todo.
   El schema lo marca obligatorio, pero una reunión sin evento de calendario
   podría traer el array vacío.
2. **¿Cuántas grabaciones quedan sin turno, y cuáles de esas eran ventas?** Se ve
   en Integraciones → Llamadas de venta. Estar en esa lista no es un problema:
   una reunión de equipo o una sesión con un cliente no es una venta.
3. **¿La ventana de 45 minutos del match provisional es la correcta?** Se eligió
   por criterio, no midiendo cruces reales.

**Alcance actual:** OTC registra **únicamente llamadas de venta**. Equipo y
entrega de servicio quedan para más adelante — cuando se implementen, entran por
`counterparty` y `purpose`, que ya existen.

---

### [LLAMADAS-FASE-2-PULIR] Detalles que quedaron a medias del seguimiento

~~**Responsable del próximo paso**~~ — resuelto el 2026-09-03: la columna
`next_action_owner_id` ya se carga desde la columna Responsable de la tabla.

**Calificación previa:** `pre_call_qualification` tiene columna y acción, pero la
tabla sólo expone la posterior. La previa tendría que poder cargarse desde la
ficha del turno, antes de la llamada.

**Turnos de Calendly sin lead:** los 186 turnos que no vienen de GHL no tienen
identidad estable hasta que un sync les complete el mail. Se resuelve solo —el
mail ya se persiste desde la Fase 0—, pero conviene verificar que efectivamente
se completen.

**Sin cobertura de Playwright** en la tabla de seguimiento. La lógica pura tiene
37 tests; la pantalla, ninguno.

---

### [SEGUIMIENTO-ESCALA] El estado se deriva en JS, no en SQL

La tabla de seguimiento lee hasta **2.000 leads** y filtra, ordena y pagina en
memoria en el servidor, porque el estado del lead se deriva de sus turnos y no
está persistido. Con 964 leads (medidos el 2026-09-03) sobra, pero el margen
es menor de lo que parecía: pasado el techo la tabla avisa que hay leads afuera
en vez de mostrarse incompleta.

Cuando no alcance, hay que derivar el estado en la base (vista o función), **no**
persistirlo: guardar un estado derivado es lo que haría que la tabla mienta
cuando los datos cambian por debajo.

---

### [LLAMADAS-CANCELED-BY] Leer quién canceló en Calendly

**Qué es:** `cancelled_by` se llena con `unknown` en los dos proveedores.
Calendly expone el autor en `cancellation.canceled_by` y todavía no se lee; GHL
no lo informa.

**Por qué importa:** que cancele el lead es una señal sobre el lead; que cancele
el closer es una señal sobre la operación. Con `unknown` en todo, la distinción
no se puede usar.

---

### [REPORTES-PULSO-DIARIO] Revisar la primera salida real del pulso diario

**Qué es:** el reporte diario se construyó pero **nunca corrió**. Su prompt le pide algo distinto al semanal: detectar roturas obvias sin recomendar acciones, y decir en una oración cuando el día fue normal.

**Qué mirar en el primer resultado real:** que un día tranquilo produzca un reporte corto y honesto en vez de inflar riesgos para llenar espacio. Si sale ruidoso, lo que hay que ajustar es el prompt del sistema en `lib/executive-reports/generate-daily.ts`, no la UI.

**Cuándo:** el cron corre todos los días a las 11 UTC (8 de la mañana en Argentina).

---

### [REPORTES-GENERACION-MANUAL] Decidir qué pasa con el botón de pipeline semanal

**Qué es:** la UI de reportes ya no ofrece generar nada, como se pidió. Pero `GenerateWeeklyPipelineButton` sigue en **Inteligencia** y en **Operaciones**, y ese botón dispara un pipeline que —entre otras cosas— genera el reporte ejecutivo semanal.

**Por qué no se tocó:** sacarlo rompería esas dos pantallas, que están fuera del pedido.

**Qué decidir:** si el reporte ejecutivo tiene que salir de ese pipeline, o si el botón debería generar sólo lo de Inteligencia y Operaciones y dejar el ejecutivo puramente automático.

---

### [EMBUDOS-SALUD] Habilitar el estado de salud (bandas de la §04) ⏸️

**Qué es:** el documento define bandas de salud por métrica —qué valor es sano, cuál está en el piso y cuál está roto— y OTC tiene el código construido y testeado en `lib/funnels/health-bands.ts`, con la precedencia de tres niveles (plantilla → override de oferta → baseline de la org).

**Está en pausa por decisión tuya**, desde que arrancamos la Fase 2. La UI no pinta ningún número en verde ni en rojo: mostrar un semáforo es hacer una afirmación sobre el negocio, y esa afirmación todavía no se habilitó.

**Cuando lo habilites**, lo que falta es la capa de presentación: el semáforo en la tabla de pasos, en los KPIs y `diagnoseFunnel()` para decir dónde está el cuello de botella. El motor ya está.

---

### [EMBUDOS-CUENTAS-REALES] Conectar las cuentas y correr la verificación 🔴

**Qué es:** las diez unidades del plan de integraciones están construidas y **ninguna está verificada contra datos reales**, que es lo que Santiago decidió dejar para el final. Los pasos están en [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md), sección por sección.

**Las tres cosas que hay que conseguir primero:**

1. 🔑 **API key de WebinarJam** — requiere aprobación de su equipo, es lo más lento y bloquea tres pasos del embudo Webinar. Ver `[WEBINARJAM-API-KEY]`.
2. 🔑 **Cuenta de Hyros con la API habilitada** — la documentación no dice qué plan la incluye.
3. 🔑 **Una sub-cuenta de GHL para probar el webhook** — 10 minutos, y define si I-4 funciona ya o espera la aprobación del Marketplace. Ver `[EMBUDOS-GHL-ENTREGA]`.

**Las tres verificaciones que más pueden cambiar el código:**

- ⚠️ El payload del Workflow de GHL (`PLAN_VERIFICACION.md` §5.2).
- ⚠️ La semántica de los campos de VTurb, que su spec no describe (§6.2).
- ⚠️ Que el LTV de OTC coincida con el que el cliente ya usa (§8) — si no, la definición de M32 o M33 está mal elegida.

---


### [EMBUDOS-FUENTES] Plan de integraciones del módulo de Embudos

**Qué es:** el mapa completo de las 34 medidas atómicas que pide el documento fuente, con su estado en OTC y el orden de construcción, está en **[`docs/FUNNELS_SOURCE_MAP.md`](./docs/FUNNELS_SOURCE_MAP.md)**. Leerlo antes de arrancar cualquier integración de embudos.

**Estado actual (2026-08-30):** ✅ **las diez unidades están construidas.** Lo que falta no es código, son **cuentas reales** — ver `docs/PLAN_VERIFICACION.md` §11. La única medida del documento que quedó como imposible es **M16** (clicks al CTA durante un webinar en vivo): la API de WebinarJam no la expone.

**Orden acordado — de afuera hacia adentro, no de a un embudo:**
- **Ola 1 (extremos, sirve a los 3 embudos):** ✅ **Completa.** ~~I-1 métricas de ads~~ · ~~I-2 pagos con Whop y Fanbasis~~ 🔨 *(falta conectar una cuenta real y verificar el mapeo)* · ~~I-3 asistencia y cierres + detección de fuente vacía~~
- **Ola 2 (medios, por costo):** ~~I-4 GHL opportunities~~ 🔨 *(construido 2026-08-30; falta recibir el primer webhook real — ver `[EMBUDOS-GHL-ENTREGA]`)* · ~~I-6 VTurb~~ 🔨 *(construido 2026-08-30; falta conectar una cuenta real)* · ~~I-5 webinar~~ 🔨 *(construido 2026-08-30; bloqueado por la aprobación de la API key)* — 📗 documentación capturada. **Ola 2 completa.** Hallazgos que cambian el diseño: GHL **no** tiene historial de cambios de etapa (hay que construirlo desde webhooks); VTurb **sí** da la curva de retención y ya modela el segundo del CTA; WebinarJam resuelve el stick rate del lado del servidor pero **no expone clicks al CTA**, y su API key **requiere aprobación previa** — pedirla ya.
- **Ola 3:** ~~I-9 retención~~ 🔨 *(construido 2026-08-30)* · ~~I-8 Hyros~~ 🔨 *(construido 2026-08-30)* · ~~I-10 triggers de Zernio~~ 🔨 *(construido 2026-08-30; las historias son imposibles de periodizar — Meta sólo expone las de 24 h)* — 📗 Hyros capturado. Confirma que **`I-7` no hace falta** (M08 y M09 salen de `/leads` y del reporte de atribución) y que `fields=cost` cubre M01, así que tampoco hace falta cruzar la API de cada plataforma de ads.

**Verificación:** nada se prueba contra cuentas reales hasta terminar todas las olas — ver [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md).

**Documentación de las APIs:** ✅ **los seis proveedores están capturados** en [`docs/external-apis/`](./docs/external-apis/) — GoHighLevel, VTurb, Whop, Commas (ex Fanbasis), Hyros y WebinarJam. Cada uno tiene un `RESUMEN-OTC.md` que responde las preguntas que estaban abiertas en `docs/API_DOCS_PENDIENTES.md`. Se refresca con `docs/external-apis/tools/regenerar.sh`. **Leer el resumen del proveedor antes de construir o corregir su unidad.**

**Decisiones cerradas:** VSL en VTurb (tiene API pública) · todos los clientes pagan Hyros · landings en Vercel, así que los opt-ins salen de Hyros e I-7 desaparece · clientes repartidos en partes iguales entre los tres embudos. **No queda ninguna pregunta abierta en el plan.**

---

### [EMBUDOS-PAGOS-CORREGIR] Corregir el mapeo de Whop contra su spec real

**Qué es:** con la documentación de Whop ya capturada, quedaron a la vista tres errores concretos en `apps/web/lib/payments/normalize.ts`, que se escribió a ciegas:

1. **El campo de monto no existe.** `KEYS.amount` busca `settled_amount`; el campo real es **`settlement_amount`**. `total` y `subtotal` sí existen pero son *"to show to the creator (excluding buyer fees)"* — no es lo que se cobró.
2. **Whop manda decimales, no centavos** (*"10.43 for $10.43 USD"*), mientras que **Commas sí manda `amount_cents`**. La regla tiene que ser por proveedor, no una heurística de sufijo `_cents`.
3. **`membership.created` no existe.** El evento de alta es `membership.activated`. Conviene reemplazar los regex de detección de evento por la lista literal, que ahora se conoce entera.

**Además:** la deduplicación de Whop va por `webhook-id` (entrega *at least once*, 12 reintentos en ~71 h, sin orden garantizado), y el prefijo del secreto de firma es `ws_`, no `whsec_`.

**Dónde está el detalle:** [`docs/external-apis/whop/RESUMEN-OTC.md`](./docs/external-apis/whop/RESUMEN-OTC.md) y [`docs/external-apis/commas/RESUMEN-OTC.md`](./docs/external-apis/commas/RESUMEN-OTC.md).

---

### [EMBUDOS-GHL-ENTREGA] Cerrar cómo llegan los webhooks de oportunidades de GHL

**Qué es:** I-4 está construido, pero la pregunta que decide si funciona sigue abierta. Los webhooks de plataforma de GHL **se configuran dentro de una app del Marketplace**, que OTC no tiene aprobada (`[FEAT-GHL-OAUTH]`). El endpoint acepta por eso dos vías: la firma Ed25519 de la plataforma, y un **secreto compartido por organización** para eventos entregados desde una acción "Webhook" de un Workflow de la sub-cuenta.

**Lo que hay que verificar, y es lo único que importa:** que un Workflow de GHL pueda mandar **`pipelineStageId`** en el cuerpo del webhook. Si no pudiera, esa vía sólo serviría para altas (M21) y M22, M23 y M25 quedarían atadas a la aprobación del Marketplace.

**Cómo probarlo:** los pasos están en [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md) §5.2. Generar el secreto desde Integraciones, armar el Workflow apuntando a la URL, mover una oportunidad de etapa y **mirar el payload crudo** en `ghl_webhook_events`.

**Consecuencia si sale mal:** hay que priorizar `[FEAT-GHL-OAUTH]`, que es lento porque depende de la aprobación de GHL.

---

### [EMBUDOS-GHL-BACKFILL] Poblar la última etapa conocida de las oportunidades preexistentes

**Qué es:** el historial de etapas arranca con el primer webhook y **no se puede reconstruir hacia atrás** — GHL no lo expone. Lo que sí se puede es traer el **estado actual** de las oportunidades que ya existen, para que la primera transición que llegue se derive contra una etapa conocida en vez de registrarse como alta.

`searchGHLOpportunities` ya está construido en `lib/ghl/client.ts` y no se usa todavía.

**Ojo:** poblar el estado inicial **no** debe generar filas en `ghl_stage_transitions` — sería inventar transiciones que nadie observó. Sólo escribe `ghl_opportunities`.

---

### [EMBUDOS-VTURB-PITCH] Configurar el pitch time de los VSL en VTurb

**Qué es:** VTurb permite marcar en qué segundo del video está la oferta (`pitch_time`). Con eso configurado, la medida **"llegaron al CTA"** del embudo VSL sale directo y sin cálculos.

**Sin eso, esa medida no se puede mostrar.** VTurb devuelve `pitch_time = 0` para los videos que no lo tienen, y su contador pasa a incluir a todo el que abrió el video — un número que parece la métrica correcta y no lo es. OTC lo detecta y muestra "sin datos" en vez de ese número.

**Acción:** entrar a cada player en VTurb y configurarle el pitch time. El panel de Integraciones dice cuántos videos están sin configurar.

---

### [WEBINARJAM-API-KEY] Pedir la API key de WebinarJam 🔴

**Qué es:** la API de WebinarJam/EverWebinar **requiere aprobación previa** — no alcanza con tener cuenta.

**Por qué subió de prioridad (2026-08-30):** se debatió reemplazar WebinarJam por VTurb y **no se puede**. Los clientes corren sus webinars **en vivo, a una hora fija**, y VTurb es un reproductor de archivos grabados: en un webinar en vivo no hay video que medir. Sin esta key, **tres de los siete pasos del embudo Webinar no tienen datos** y no hay plan B. El razonamiento completo está en `docs/FUNNELS_SOURCE_MAP.md`, sección "Por qué WebinarJam no se puede reemplazar con VTurb".

**Acción:** seguir [el artículo de solicitud](./docs/external-apis/webinarjam/15370143-apply-for-an-api-key-for-webinarjam-or-everwebinar.md) para la cuenta del cliente que vaya a usarse.

**Ya no hace falta saber cuál de los dos productos usa el cliente:** son la misma API con dos prefijos y el sync consulta los dos. La integración está construida (2026-08-30) y **lo único que falta es la key.**

**Después de conseguirla:** cargar el segundo en el que aparece la oferta de cada webinar, desde el panel de Integraciones. Sin ese número no se puede medir el stick rate — ver `docs/PLAN_VERIFICACION.md` §7.3.

---

### [EMBUDOS-PAGOS-VERIFICAR] Verificar el mapeo de webhooks de Whop y Commas contra eventos reales

**Qué es:** la capa de pagos (I-2) está construida y su mapeo se escribió a ciegas. **Desde el 2026-08-30 la documentación de los dos proveedores está capturada** en [`docs/external-apis/whop/`](./docs/external-apis/whop/) y [`docs/external-apis/commas/`](./docs/external-apis/commas/), así que buena parte de lo que había que "verificar" ya se puede **corregir leyendo** — ver `[EMBUDOS-PAGOS-CORREGIR]` más arriba.

Lo que queda para este ítem es lo que ninguna documentación resuelve: **ver un payload real de cada proveedor** y confirmar que el mapeo corregido lo lee bien. La firma de los dos ya está documentada (Whop: Standard Webhooks con secreto `ws_`; Commas: `x-webhook-signature`, HMAC-SHA256 hex sobre el body crudo), pero ninguna de las dos se probó contra un evento real.

**Por qué no bloquea:** cada webhook se persiste crudo en `payment_webhook_events` antes de interpretarse. Un evento que no se sabe leer queda en estado `unmapped` con su motivo y se puede reprocesar; nunca se inventa un número.

**Cuándo:** decisión de Santiago (2026-08-30) — **no se conecta nada hasta que esté todo construido**, y ahí se hace una sola pasada de prueba de punta a punta.

**Los pasos exactos están en [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md) §3**, junto con el resto de las verificaciones pendientes de todas las unidades.

**La UI de conexión ya está hecha** (2026-08-30): `/integrations` → sección "Pagos".

---

### [EMBUDOS-GHL-PIPELINE] Sync de oportunidades/pipelines de GHL

**Qué es:** la sección 05 del documento fuente le asigna al **GHL pipeline** los "Stage counts, set/close, follow-up" — o sea, los conteos por etapa del embudo DM. La integración GHL de OTC consume `/calendars` y `/contacts`, pero no `/opportunities` ni `/pipelines`.

**Efecto:** el embudo DM no se puede medir según el estándar hasta que exista. Contra lo que se asumió en la Fase 1, el DM **no** era construible end-to-end.

**Acción:** extender `lib/ghl/` con sync de oportunidades y sus etapas, y agregar las fuentes correspondientes a `lib/funnels/sources.ts`.

---

~~### [DB-PLANES] Aplicar migración de tabla plans en Supabase~~ ✅ Completado 2026-08-26

---

## 🟡 Trial Reels — Feature en producción, mejoras pendientes



### [TRIAL-4] Assets reales de LUT y música en el worker (Fly.io)

**Qué es:** `apps/reel-worker/luts/` solo tiene `.gitkeep`. Las variantes V3 (música) y V5 (color) usan fallbacks de baja calidad.  
**Efecto actual:**
- V5 (color): usa `eq` filter en lugar del LUT cálido → colorimetría plana
- V3 (música): sale en silencio si no hay `background-music.mp3`

**Acción:** Conseguir/crear un `warm.cube` (LUT cálido) y un `background-music.mp3` libre de derechos, ponerlos en `apps/reel-worker/luts/` y hacer redeploy en Fly.io.  
**Quién puede hacerlo:** Santiago (conseguir los assets) + Claude (commit + redeploy)

---

## 🟠 Bugs conocidos — Verificar en producción

### [BUG-1] Stories de Instagram — verificar en producción tras fix

**Contexto:** Fix deployado en `claude/architecture-review-improvements-fdj4ae`. Ahora usa el endpoint correcto `GET /v1/accounts/{accountId}/instagram/stories` + fallbacks. Las historias se fuerzan a `postType='story'` antes del dedup y entran primero en `allPosts`.  
**Para verificar:** Con una historia activa en Instagram → sync manual desde `/marketing/content` → el log `[syncZernioContent] stories sync` debe mostrar `fromDedicatedEndpoint > 0` → ir al tab "Historias" en la UI.  
**Si sigue sin aparecer:** Revisar que el registro en DB tenga `type='story'` (puede ser que exista como `type='post'` de syncs anteriores; el próximo sync lo corrige vía UPDATE).  
**Archivos clave:** `app/marketing/content/sync-actions.ts`, `lib/zernio/client.ts`

---


## 🟣 Nuevos Features — Implementar cuando Santiago lo indique

### [ONBOARDING] Onboarding guiado para cuentas nuevas — ✅ las cuatro fases construidas

**Qué es:** hasta el 2026-08-31 **no existía onboarding de founder**: una cuenta nueva la creaba el super-admin, el founder cambiaba la contraseña y entraba a un dashboard vacío. Hoy hay gate, checklist y tours; falta la visibilidad interna.

**El plan completo está en [`docs/ONBOARDING_PLAN.md`](./docs/ONBOARDING_PLAN.md)** — leerlo antes de escribir una línea.

**Estado: ✅ Primera tanda completa (2026-08-31)** — Fases 0, 1 y 2. Migraciones **aplicadas en Supabase**, capa de derivación con 35 tests, gate de tres pasos con ruteo en el middleware, y checklist en el panel y la notch nav. Cero dependencias nuevas, como se acordó.

**✅ Fase 3 completa (2026-08-31)** — tours contextuales con Driver.js en Embudos, Contenido, Agente y Bandeja. Es la única dependencia que agregó todo el plan, y queda en el chunk del runner: el bundle compartido no se movió (185 kB).

**✅ Fase 4 completa (2026-08-31)** — panel **Super Admin → Onboarding**: en qué punto quedó cada organización, ordenado por quién necesita atención primero. Una sola consulta (`onboarding_org_progress`) para todas, y la derivación pasa por la misma función pura que la aplicación, así que el panel no puede mostrar un progreso distinto del que ve el cliente.

**Lo que falta:**
1. **Probar el flujo completo en un navegador** — lo verificado es SQL, tests, build y render aislado del popover. Pasos en [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md) §13.5, §13.6, §13.9 y §13.10. Lo más importante sigue siendo que una cuenta nueva pase primero por el cambio de contraseña y después por el gate, en ese orden.

**Riesgo a mirar tras el merge con `main`:** el PR #33 dejó anotado que con 10 módulos las islas de la notch nav se superponen a 1280px. Esta rama **suma un ítem a la isla derecha** (el contador de configuración pendiente), que sólo aparece mientras el checklist tiene pasos abiertos. Con 8 módulos hay margen, pero conviene medirlo antes de encender Operaciones y Producto.

**Deuda conocida:** el layout resuelve el estado en cada request de founder (~8 counts en paralelo, cache de 60 s) — medir antes de optimizar. Y el filtro de desconexión de integraciones sigue sin poder observarse porque ninguna org tiene una integración desconectada.

~~**Estado: ✅ Fase 0 completa (2026-08-31)** — migración `onboarding_state`, catálogo, capa de derivación pura y resolver, con 25 tests. Falta aplicar la migración en Supabase. **Siguiente: Fase 1** (gate de tres pasos + ruteo en el middleware).~~

**Las tres decisiones ya están cerradas (2026-08-31):**
1. **Gate duro de tres pasos** (identidad y unidades · oferta principal · avatar principal), con salida de emergencia vía `organizations.skip_onboarding`.
2. **Los invitados no pasan por el gate** — reciben un tour corto derivado de sus permisos. El ruteo del middleware debe condicionarse a `role = 'founder'` desde la Fase 1.
3. **Primera tanda: Fases 0, 1 y 2** (derivación · gate · checklist). Los tours con Driver.js quedan para después y **no se agrega ninguna dependencia** en esta tanda.

**La decisión de diseño que no se negocia:** el progreso se **deriva** de las tablas reales, no se guarda en booleanos por paso. Un booleano miente en cuatro casos concretos que ya pasan en este repo — están enumerados en el plan. Se persiste sólo lo no derivable: `gate_completed_at`, `dismissed_items`, `tours_seen`.

**Piezas existentes que hay que reusar, no duplicar:** las Server Actions de settings, producto y avatar (no se escribe una sola mutación nueva); `CinematicWelcome` + `markWelcomePending()`, que hoy **nadie dispara** y cuyo lugar es el final del gate; y el ratio `boundSteps / stepCount` que la página de embudos ya calcula.

**Lo que NO se toca:** `onboarding_responses` y el wizard de `/onboarding/holding` son del holding y quedan como están.

---

### [UI-21ST] Cuatro componentes de 21st.dev relevados — decidir cuáles entran

**Qué es:** el relevamiento completo (instalación, dependencias, código de uso, prompts y checklist) está en **[`docs/COMPONENTES_21ST.md`](./docs/COMPONENTES_21ST.md)**. Leerlo antes de correr cualquier `21st add`.

**Decisiones abiertas:**
- **Dropdown Range Date Picker** (`ruixen.ui`) — el de mayor valor: filtro de rango de fechas para `/marketing/anuncios`, `/finance/*`, `/executive-reports` y `/sales/closing`. **Bloqueado por dos cosas:** no declara licencia, y hay que verificar que exponga `value`/`onChange` (si el rango se queda adentro del componente, no sirve para filtrar).
- **Adaptive Notch Navigation Bar** (`arunachalam`) — técnicamente el más limpio (cero dependencias de registry), pero es navegación horizontal y `CLAUDE.md` dice que la navegación es solo sidebar. Decisión de producto: ¿va en `(landing)` / `(founder)`, o no va?
- **Tabs variante `button`** (`sean0205`/ReUI) — **no instalar.** Portar la variante a `packages/ui/src/primitives/tabs.tsx` con `cva`, dejando `default` igual que hoy.
- **Statistics Card 1** (`sean0205`/ReUI) — **no instalar.** Ya tenemos `MetricCard`, `MetricStat` y `MetricBand`. Lo único que aporta es el menú `⋯` por tarjeta; portarlo a `MetricCard` como prop `actions`.

**Prerrequisito para cualquiera de los dos primeros:** sesión de 21st.dev (`npx @21st-dev/cli@latest login`). Sin credenciales el registry devuelve 403.

---

### [FEAT-EMBUDOS] Módulo de Embudos — motor genérico + plantillas por tipo de funnel

**Qué es:** Módulo de medición que permite al usuario intercambiar entre "vistas" de embudos (Webinar, VSL book-a-call, DM, y los que vengan), cada uno con su estructura, sobre un spine universal de 7 etapas. Análisis completo y decisiones cerradas en **[`docs/FUNNELS_ARCHITECTURE.md`](./docs/FUNNELS_ARCHITECTURE.md)** — leer antes de implementar.

**Principio no negociable:** un tipo de embudo es un dato, no un módulo. Agregar un embudo nuevo = agregar un archivo de plantilla en TS. Si hace falta escribir un componente, la arquitectura falló.

**Fases:**
1. ~~**Fase 0** — Normalizar el documento a schema~~ ✅ **Completada 2026-08-29.** `lib/funnels/` con spine, tipos, las 3 plantillas, KPIs universales, health bands, instrumentación y validador. Typecheck + lint limpios, validador con 0 problemas. **Pendiente: revisión de Santiago del schema antes de arrancar la Fase 1.**
2. ~~**Fase 1** — Instancias + resolver + página genérica~~ ✅ **Completada 2026-08-29.** Migración, catálogo de fuentes, capa pura de cálculo, resolver contra Supabase, Server Actions, índice y detalle genérico. **Pendiente: aplicar la migración `20260829120000_funnels_phase1.sql` en Supabase y activar el add-on `embudos` en la org.**
3. **Fase 2** — Parcial. ✅ Configuración de fuentes por step (2026-08-29). ⏸️ Health bands y `diagnoseFunnel()` **en pausa por pedido de Santiago** hasta nuevo aviso.
4. **Fase 3** — Switcher + segunda y tercera instancia. **Bloqueada por el track de integraciones.**
5. **Fase 4** — KPIs universales + `/funnels/comparar` con agrupación por price point.
6. **Fase 5** — Snapshots periódicos + pulso diario.

**Riesgo principal:** el resolver nunca debe devolver `0` por ausencia de datos. Si lo hace, el diagnóstico marca huecos de instrumentación como roturas de negocio y el founder pierde confianza en el módulo. `ResolvedMetric.value` es `number | null` y la UI distingue etapa salteada / sin datos / bajo el piso.

**Deuda a resolver en el camino:** tabla propia `funnel_period_snapshots` (`metrics_snapshots` no sirve — su UNIQUE colisiona con varias instancias por org); `resolveSourceValue` necesita ventana temporal; no existe timezone de reporte por org.

**Testing:** ✅ Vitest incorporado al monorepo (2026-08-29) y CI corriendo `pnpm test` en cada push. El backlog completo de tests pendientes del repo está en [`docs/TESTING_BACKLOG.md`](./docs/TESTING_BACKLOG.md) — 24 ítems priorizados, pensados para que los tome un agente tester. 153 tests de conformidad verifican las plantillas contra el documento fuente. Cuando llegue una versión nueva del documento, actualizar `lib/funnels/__tests__/document-fixture.ts` primero y dejar que los tests señalen qué plantillas quedaron atrás.

---

### [FEAT-EMBUDOS-INTEGRACIONES] Track de integraciones bloqueante para Embudos

**Qué es:** Santiago definió que las etapas de Webinar y VSL se llenan **sí o sí con integración** (sin input manual como salida) y que la atribución sigue tal cual asume el documento fuente. Eso convierte estas integraciones en prerrequisito de la Fase 3 de `[FEAT-EMBUDOS]`, no en mejora futura.

| Integración | Alimenta | Bloquea |
|---|---|---|
| **Hyros** | Atribución real, ROAS by-source, EPL, journeys | Etiquetado `[Hyros]`, KPIs universales |
| **WebinarJam / Zoom** | Show-up rate, stick rate, CTA clicks | Embudo Webinar entero (etapa Engaged) |
| **Hosting de VSL con analytics** | Play rate, avg watch % | Embudo VSL (etapa Engaged) |
| Scoring de calificación | Qualified rate de aplicaciones | Etapa Intent del VSL |

**Decisión abierta:** qué proveedor de hosting de video se soporta para el VSL (Wistia, Vimeo, YouTube, player propio). Cada uno tiene un modelo de analytics distinto — hay que resolverlo antes de escribir el binding de la etapa Engaged.

**Nota:** Whop / Fanbasis del documento quedan cubiertos por los equivalentes que OTC ya tiene (Stripe + Mercado Pago). No bloquean.

---

### [FEAT-GHL-OAUTH] GHL OAuth / Marketplace App — migrar de Private Integration Token a OAuth

**Qué es:** Cuando OTC sea aprobado como app en el GHL Marketplace, reemplazar el flujo de Private Integration Token por OAuth estándar ("Connect with GHL"). El proceso de aprobación de GHL es lento.
**Estado actual:** Integración funcional con Private Integration Token. El usuario pega el token + Location ID manualmente.
**Pendiente:**
1. Registrar OTC como app en GHL Marketplace (proceso manual de Santiago)
2. Agregar `GHL_CLIENT_ID` y `GHL_CLIENT_SECRET` a env vars
3. Implementar `/api/integrations/ghl/oauth/start` → `/api/integrations/ghl/oauth/callback`
4. Reemplazar StepCredentials en `ghl-connect-dialog.tsx` por botón "Conectar con GHL"
5. Actualizar `ghl_integrations` para guardar `access_token` + `refresh_token` en lugar de `api_key_encrypted`

**Decisión tomada:** Private Integration Token ahora; OAuth cuando sea posible.

---

### [FEAT-EXCEL-IMPORT-FASE3-RESTANTE] Importación de pagos y consumo de metrics_snapshots

**Qué es:** Lo que queda de importación de datos:
- Importación de pagos (tab "Pagos") — clientes y llamadas cubiertos, pagos no
- Oportunidades de GHL (pipeline) → closing_calls como stretch goal
- Conectar `metrics_snapshots` a módulos de Finanzas y Métricas de ventas para visualizar los datos importados

**Estado:** ✅ **COMPLETADO (2026-08-25)**. Arquitectura baseline-live implementada en todos los paneles: `finance-data-provider` (financeSummary + monthlySeries), Dashboard, Finance metrics, Intelligence module, Agente de IA (org-context). Column mapper implementado. Deuda menor: si el archivo tiene filas de totales/subtítulos en columna A, aparecen como opciones en el dropdown — sin filtrado por ahora.
**Complejidad:** Media

---

### [FEAT-1] Secuencias de historias

**Qué es:** Feature para planificar y publicar secuencias de historias de Instagram como una unidad cohesiva.  
**Estado DB:** Tablas `story_sequences` y `story_frames` ya creadas en producción (migración 20260811140000). Listas para usar.  
**Pendiente:** Análisis conjunto con Santiago + implementación de UI y acciones.  
**Preguntas a resolver antes de implementar:**
- ¿Zernio soporta publicación de historias? ¿Individual o en lote?
- ¿Qué tipo de contenido va en cada historia (video, imagen, texto)?
- ¿El founder define la secuencia en OTC o en Zernio?
- ¿Hay delay entre historias de la misma secuencia?
- ¿Cómo se integra con el módulo de Marketing/Contenido existente?

---

### [FEAT-2] Análisis de competidores

**Qué es:** Feature para que el founder monitoree cuentas de competidores y extraiga insights de su estrategia de contenido.  
**Estado DB:** Tablas `competitors` y `competitor_posts` ya creadas en producción (migración 20260811150000). Listas para usar.  
**Pendiente:** Análisis conjunto con Santiago + implementación de UI, acciones y análisis IA.  
**Preguntas a resolver antes de implementar:**
- ¿Desde dónde se obtienen los datos? (Zernio, scraping, API de Meta, entrada manual)
- ¿Qué se analiza? (frecuencia, formatos, hooks, CTAs, temas, engagement)
- ¿Dónde vive en el producto? (¿tab en Marketing? ¿módulo separado?)
- ¿La IA genera un reporte periódico o es on-demand?
- ¿Cuántos competidores por org?

---

## 🟪 Notch nav — adoptada, con validación pendiente

> El 2026-08-30 la notch nav reemplazó al sidebar de plataforma (ver `CHANGES.md`).
> El flag `NEXT_PUBLIC_NAV_STYLE` ya no existe: es la única navegación.

### [NAV-1] Validar con sesión real

**Qué es:** el entorno de desarrollo no renderiza las páginas autenticadas (faltan
env de Supabase), así que la barra sólo se verificó con providers mockeados.

**Acción:** recorrer la plataforma en el preview de Vercel y confirmar: pill activo
al navegar, dropdowns de módulo, switcher de holding, badge de clientes con el número
real, menú de perfil (nombre y organización correctos) y cierre de sesión. En mobile,
el drawer.
**Quién:** Santiago.

### [NAV-2] Limpieza opcional: renombrar `sidebar-modules.ts`

Ya no hay sidebar de plataforma, pero el config sigue llamándose así. Renombrarlo a
`lib/navigation/platform-modules.ts` toca ~15 imports sin cambiar comportamiento.
Cosmético, hacer sólo si molesta.

> **Ojo:** `components/navigation/sidebar-*` que quedan **no son restos**: los usan el
> sidebar de super-admin y el drawer mobile. No borrarlos.

### [NAV-3] Etiqueta "Fase 1 · Beta"

La mostraba el footer del sidebar y se perdió. Decidir si va a algún lado de la notch
(p. ej. el menú de perfil) o si ya no hace falta.

---

## 🔵 Rebranding Limitless — cerrado, con 5 pendientes acotados

> Fases 1 y 2 completas — ver `CHANGES.md` 2026-08-29. La app usa el naranja
> `#E15D12`, el logotipo real y el favicon nuevo, en tema claro y oscuro.
> Lo que queda abajo son decisiones, no trabajo mecánico.

### [CHART-A] Vista de tabla como equivalente accesible de cada gráfico

**Qué es:** hoy los valores de un gráfico se leen por tooltip, leyenda con valor y
etiquetas directas. No hay una vista de tabla equivalente, que es el fallback limpio
para lectores de pantalla, impresión y modo de contraste forzado.

**Acción:** un toggle "gráfico / tabla" en `ChartShell` que renderice los mismos datos
como `<table>`. La mayoría de los componentes de `charts/platform` ya reciben los datos
en forma de filas, así que el toggle puede vivir en el shell.
**Complejidad:** media.

---

### [CHART-B] Embudo con etapas de valor muy dispar

**Qué es:** `FunnelChartPanel` dibuja el ancho proporcional al valor. Con un rango tipo
120.000 → 210 las últimas tres etapas quedan como hilos de 1px y ocupan media card sin
mostrar nada.

**Por qué no se "arregló" en el rediseño de gráficos:** el ancho proporcional es
correcto — la caída realmente es esa, y una escala logarítmica mentiría sobre la
conversión. Los valores y porcentajes están rotulados, así que la información se lee.

**Acción posible:** ofrecer una variante en barras horizontales (una barra por etapa +
la tasa de conversión entre etapas) para cuando el rango es muy amplio. Es una decisión
de producto, no un bug.
**Complejidad:** media.

---

### [BRAND-B] Licenciar Neue Haas Grotesk

**Qué es:** el manual (sección 07) pide Neue Haas Grotesk para títulos. Es de licencia
comercial (Monotype) y no está comprada, así que `--font-display` resuelve a Inter.
Los títulos no coinciden con el manual.

**Acción:** comprar la licencia web, poner los archivos en `apps/web/app/fonts/`,
cargarla con `next/font/local` y apuntar `--font-display` a su variable en
`packages/ui/src/styles/tokens.css`. Ningún componente necesita cambios — la utilidad
`font-display` de Tailwind ya existe.
**Quién:** Santiago (licencia) + Claude (implementación).

### [BRAND-C] Validar el texto negro sobre los botones naranjas

**Qué es:** `--primary-foreground` pasó de blanco a negro. Blanco sobre `#E15D12` da
3.64:1, por debajo de AA para texto normal; negro da 5.78:1. Cambia el aspecto de
todos los botones primarios de la app.

**Acción:** que el equipo mire los botones y confirme. Si se prefiere blanco pese al
contraste, es una línea en `tokens.css` (`--primary-foreground: 0 0% 100%`).
**Quién:** Santiago.

### [BRAND-D] Limpieza — borrar la rama `brand-source`

**Qué es:** el material de identidad (incluido el manual en PDF de 58 MB) se subió a la
rama `brand-source`, deliberadamente fuera de `main` para no cargar el historial.

**Acción:** una vez que el equipo tenga el material guardado en otro lado, borrar la
rama en GitHub. **No mergearla a `main`.**

### [BRAND-E] Dominio — fuera del alcance (decisión de Santiago)

`optimizatucontrol.com` sigue en pie. Está centralizado en `brand.domain`, pero hay
referencias sueltas fuera de ese campo:

- `lib/utm/build-links.ts`, `components/marketing/utm-generator.tsx`, `components/settings/settings-form.tsx`
- `app/(landing)/privacidad/page.tsx` — `CONTACT_EMAIL` y `APP_URL`
- `mocks/utm-links.ts`
- `lib/email/welcome-email.ts` — fallback `https://otc-plaform.vercel.app` (con el typo del original)
- `app/api/queue/publish-reel-variation/route.ts` — fallback `https://app.otc.com`
- `components/super-admin/infrastructure-page.tsx` — hostname de Vercel

**Acción:** al definir el dominio de Limitless, migrar DNS y actualizar estas
referencias + `brand.domain`.

---

## 🟢 Deuda técnica — Phase 2 (baja urgencia)

*(TECH-1 y TECH-2 completados — ver tabla abajo)*




### [TECH-4] VSL Player placeholder en landing

**Contexto:** `components/landing/vsl-player.tsx:37` renderiza un placeholder cuando no hay `NEXT_PUBLIC_VSL_URL`. Cuando exista el video de ventas real, setear esa env var en Vercel.  
**Archivos clave:** `components/landing/vsl-player.tsx`

---

### [TECH-5] Badge `children` en React 19 — revisión global

**Contexto:** `packages/ui/src/primitives/badge.tsx` fue corregido, pero hay ~15 archivos pre-existentes con el mismo patrón (`extends React.HTMLAttributes` sin `children?: React.ReactNode`) que Vercel ignora por caché de Turbo. En un rebuild limpio fallarían.  
**Acción:** Hacer un `grep -rn "HTMLAttributes" packages/ui/src/` y agregar `children?: React.ReactNode` a todos los componentes que lo necesiten.

---

## ✅ Completados (referencia histórica)

| Fecha | Ítem | Branch |
|-------|------|--------|
| 2026-09-05 | MIGRACION-20260904110000: aplicada y verificada — las dos columnas `checkpoint_checked_at` y los dos índices parciales existen. Y se arregló el build del bot en Railway: construía el monorepo en vez del bot porque faltaba el root directory del servicio | `claude/checkpoints-cliente-ccc3ih` |
| 2026-09-04 | CABLES-PROPUESTAS: el buzón de C3 empieza a recibir. Cron diario `daily-signals` que clasifica los mensajes de Discord y propone hitos desde los mensajes y desde las llamadas de entrega de Fathom. Solapa **Candidatos** en Wins con los testimonios de todos los clientes juntos. Un hito que no está en el catálogo se descarta entero; piso de confianza 0.7; la marca es de "evaluado", no de "propuesto". 849 tests | `claude/checkpoints-cliente-ccc3ih` |
| 2026-09-04 | TRACKERS-EXCEL: las cinco piezas que los Excel tenían y OTC no — permisos del cliente sobre su win (con la forma en que quiere aparecer), estado de uso con el filtro "Sin usar", objetivo con el que entró, fecha de egreso y estado actual en palabras. Más la pantalla de **Revisión semanal** con las cuatro preguntas. 812 tests | `claude/checkpoints-cliente-ccc3ih` |
| 2026-09-04 | OPERACIONES-ADDON-APAGADO: SOPs salió del add-on `operaciones` y es un módulo propio de la barra superior. El creador de SOPs existía y **nadie podía llegar**, porque las 5 organizaciones tienen `enabled_add_ons` vacío. El resto de Operaciones sigue detrás del add-on | `claude/checkpoints-cliente-ccc3ih` |
| 2026-09-03 | SEGUIMIENTO-EN-EL-MOMENTO: el modal de resultado de la llamada pide también el seguimiento (calificación, próximo paso, fecha, responsable, nota) en un solo guardado. "No show" pasó de acción directa a modal con el mismo bloque. El panel de detalle ahora usa `acceptsManualOutcome`, así que las llamadas "asistió sin resultado" pueden cerrarse | `claude/seguimientos-tabla-closing-u6arke` |
| 2026-09-03 | SEGUIMIENTO-TABLA: la pestaña Seguimiento pasa de acordeón a tabla editable celda por celda (calificación, próximo paso, fecha, responsable, notas), con panel lateral para el hilo de intentos, filtros, buscador, orden y paginado. Se ven **todos** los leads, no sólo los tres estados accionables. Valores de seguimiento propios por organización (`sales_follow_up_options`): cada valor declara si pide fecha o cierra el hilo, se archiva en vez de borrarse, y los de fábrica no se pueden pisar. Se completó `next_action_owner_id`, que no tenía UI. 595 tests | `claude/seguimientos-tabla-closing-u6arke` |
| 2026-09-02 | LLAMADAS-FASE-2: seguimiento del lead. Tabla `sales_leads` que hila los intentos (845 leads, 861 turnos, 15 con reagendas). Próximo paso con fecha y notas — lo que faltaba para que una llamada que no cierra deje de ser un callejón sin salida. Tres estados de trabajo derivados: seguimiento vencido, falta resultado y sin próximo paso. Calificación antes y después. Ciclo lead → cliente cerrado al vender. 577 tests | `Claude-New-Features` |
| 2026-09-01 | LLAMADAS-ALCANCE: reducción a sólo llamadas de venta. Una grabación lo es cuando el mail de un participante coincide con el del lead de un turno y el horario corresponde; match provisional por horario mientras los turnos no tengan mail. Se retiró lo que quedó fuera de alcance (tipos de reunión, parser de título, match contra clientes, detección de equipo). El mail del lead ahora viaja al cliente al cerrar. 558 tests | `Claude-New-Features` |
| 2026-09-01 | LLAMADAS-FASE-1: un solo clasificador con dos ejes (con quién / para qué). Se empezaron a leer los invitados de Fathom —con mail e `is_external`— que el parser descartaba, y el cruce grabación↔turno por horario y mail, con FK real. Parser posicional del título como respaldo. UI de mapeo de tipos y cola de sin clasificar. 581 tests | `Claude-New-Features` |
| 2026-09-01 | LLAMADAS-FASE-0: `showed` de GHL dejó de contarse como venta; canceladas se importan como canceladas y no como no-show; los syncs dejaron de pisar los estados manuales; se dejó de inventar `"delivery"`; rescate de llamadas trabadas; `lead_email` persistido; documentación de Fathom bajada al repo. 544 tests | `Claude-New-Features` |
| 2026-08-31 | BRAND-A: paleta categórica aplicada a badges, etiquetas y nodos del grafo; 0 clases violeta en la app | `Claude-Design` |
| 2026-08-31 | Rediseño del sistema de gráficos: paleta categórica y ordinal validadas, leyendas, espaciados y barra de progreso honesta en métricas | `Claude-Design` |
| 2026-08-31 | REPORTES-IA: pulso diario (tercera cadencia), UI rediseñada y movida a un panel de la isla derecha de la barra. "Reportes" salió de Operaciones. Sólo generación automática. Rehecho sobre `main` después de que entraran #32/#33/#34: 509 tests, lint y tsc limpios, build de 131 páginas | `Claude-New-Features` |
| 2026-08-30 | ADDON-EMBUDOS: add-on `embudos` activado en la org "Optimiza tu Control" (`46cce98c`). El módulo ya aparece en el sidebar; no depende de ninguna integración | — (cambio de datos) |
| 2026-08-30 | EMBUDOS-UI: interfaz del módulo — switcher que conserva el período, KPIs universales con las dos ratios decisivas, etiquetas [Meta]/[Hyros], spine con conectores, índice con estado de configuración. Destapó que computeFunnel no devolvía los KPIs universales. 414 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-I8: integración Hyros — atribución por fuente, y corrección del ROAS by-source, que usaba las mismas medidas que el blended y por lo tanto mostraba el mismo número. **Cierra las 10 unidades del plan.** 408 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-I9-I10: retención y compras por cliente (desbloquea LTV:CAC) + triggers de Zernio. Sin integraciones nuevas ni migraciones. 395 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-HUECOS: fuente de clicks al CTA de VTurb (M16) y fuentes de formulario (M13, M17, M18), que estaban marcadas como medibles pero desconectadas del módulo. Debate WebinarJam vs VTurb cerrado y documentado. 372 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-I5: integración WebinarJam / EverWebinar — registrantes persistidos por fila (la API no acepta rangos de fecha arbitrarios), stick rate pedido filtrado al servidor, segundo de la oferta configurable. M16 documentado como no medible. 364 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-I6: integración VTurb — caché por período (engagement_rate es un promedio y no se puede sumar entre días), M12 sólo cuando el player tiene pitch time, catálogo de videos y selector en el formulario de fuentes. 351 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-I4: oportunidades de GHL — historial propio de transiciones de etapa (GHL no lo expone), período ciego explícito, webhook con dos vías de autenticación, tres fuentes de embudo con etapa configurable. 331 tests en verde | `Claude-New-Features` |
| 2026-08-30 | DOC-EXTERNAL-APIS-2: Whop (897 páginas + 3 specs OpenAPI), Commas ex Fanbasis (42 secciones), Hyros (482 guías + 3 specs) y WebinarJam (17 artículos) bajados a `docs/external-apis/`, con un `RESUMEN-OTC.md` por proveedor. Cierra las seis secciones de `API_DOCS_PENDIENTES.md` | `Claude-New-Features` |
| 2026-08-30 | DOC-EXTERNAL-APIS: documentación completa de GoHighLevel (948 páginas) y VTurb (28 endpoints + `openapi.json`) bajada a `docs/external-apis/`, con scripts de regeneración y dos `RESUMEN-OTC.md` que cierran §3 y §4 de `API_DOCS_PENDIENTES.md` | `Claude-New-Features` |
| 2026-08-26 | FEAT-GHL-MULTI-CALENDAR: multi-selección de calendarios GHL + filtro en closing panel | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-26 | UI-CLEANUP: Eliminación botón flotante del agente (FloatingChat) + fix layout integrations page (min-w-0) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-PLANES-CUOTAS-CLIENTES: planes con sistemas de cuotas, eliminar clientes, asignar plan, closing con cuotas manuales — migración SQL pendiente de aplicar en Supabase | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-VENTAS-CASH-COLLECTED: panel de métricas de ventas usa gastosTotales del provider (no snapshot) para cash collected | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-BASELINE-GAPS: Baseline fallback en Intelligence module (collect-context.ts) y monthlySeries (finance-data-provider) — cierran los dos últimos vacíos de la arquitectura baseline | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-BASELINE-ARCHITECTURE: Arquitectura baseline escalable — baseline-service.ts, finance-data-provider fallback, Dashboard, Finance metrics, agente IA, data_source column en metrics_snapshots | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-METRICS-DERIVE: Auto-derivación de métricas combinadas al importar — deriveSalesMetrics (close_rate, show_rate, tasa_agendamiento, tasa_fantasma, inasistencias, no_cierres) y deriveFinanceMetrics (margen, pct_margen); mapper de filas reducido a solo métricas primarias (11 ventas, 4 finanzas) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-TRANSPOSED-ROW-MAPPER: Mapeo manual de filas en formato pivot — TransposedRowMapper con dropdowns por campo OTC, auto-sugerencia desde diccionario, rowMapping pasado al parser, texto de confirm corregido (upsert) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-PIVOT: Soporte formato pivot en importación de métricas — auto-detección de meses como columnas, parser transpuesto, banner "Formato tabla detectado", fix preview para archivos con título merged (resuelve __EMPTY) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-EXCEL-PREVIEW: getExcelPreviewAction ahora usa { header: 1 } y salta filas de título — fix para archivos con celdas merged/título en la primera fila | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-VERCEL-BUILD x4: prefer-const, unused imports/props, SectionDef[] filter inference, keyof Union type — 4 errores de build de Vercel corregidos en serie | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-MULTISHEET: Selector de hoja en wizard de importación Excel — heurística pickBestSheet, SheetSelector UI, re-fetch al cambiar hoja, re-auto-mapeo | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-COLUMN-MAPPER: UI de mapeo columna-a-columna para archivos Excel propios — paso "mapper" en wizard, auto-mapeo, vista previa, validación de campos requeridos | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-UTM: Atribución UTM en closing calls — fetch attributionSource del contacto GHL durante sync, columna + panel de detalle en UI | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE2: Importación datos históricos GHL contacts + Excel clientes/llamadas — wizard 3 pasos, parsers Excel, preview GHL, server actions | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FIX-GHL-TIMESTAMPS: GHL `/calendars/events` requiere Unix ms, no ISO 8601 — fix sync que devolvía 0 citas | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE1: Integración GoHighLevel Calendar — Private Integration Token, sync horario, UI dialog multi-paso, badges de origen en closing | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-23 | BUG-3: Patrón UTC-midnight — isInCurrentMonth (enrich-team-compensation.ts) + periodBounds (cta-actions.ts) | `feat/trial-retry-variation` |
| 2026-08-23 | BUG-2: Gráfico distribución ya incluye content_pieces Zernio (ya estaba implementado) | `main` |
| 2026-08-23 | TRIAL-1: Reintentar variante fallida — botón en variation-card.tsx + retryVariationAction (ya existía implementado) | `main` |
| 2026-08-23 | refactor(agent/marketing): split de action files grandes — agent/actions.ts (1665→1252 líneas) + canvas-actions.ts + workboard-actions.ts; marketing/actions.ts (963→536 líneas) + utm-actions.ts | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | Sentry integration (client/server/edge configs + withSentryConfig en next.config.ts) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | perf(holding): RPC get_holding_dashboard_stats — 28 queries → 2 paralelas | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | fix(holding): dropdown del switcher de negocios scrollable (max-h-[280px]) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | feat(crons): fan-out QStash para sync-metrics, intelligence-snapshot, executive-report, founder-tone | `claude/qstash-fanout-playwright` |
| 2026-08-24 | fix(e2e): clearCookies() en beforeEach para garantizar refresh token virgen (tests 6/7 holding) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | feat(testing): Playwright E2E setup + tests holding flow (pendiente ejecutar con cuenta real) | `claude/qstash-fanout-playwright` |
| 2026-08-11 | TECH-1: Fathom deep analysis vía QStash (reemplaza void pattern que se perdía en Vercel) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TECH-2: Retención real YouTube Analytics API (fallback gracioso a estimación) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | SEED: Limpieza de 171 registros ficticios en Supabase prod (org `46cce98c-...`) | directo en DB |
| 2026-08-11 | TECH-3: Mecanismo add-ons por org (DB + permisos + sidebar dinámico + super-admin toggle) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TRIAL-3: Música personalizable por org en Trial Reels | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TRIAL-2: Botón "Generar con IA" para captions/hashtags por variante | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | BUG-1: Sync de stories de Instagram via Zernio (doble estrategia con fallback) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | Upload real de video a Zernio en Trial Reels (bug crítico) | `feat/trial-reels-video-upload` |
| 2026-08-11 | Email de notificación cuando todos los reels terminan de publicar | `feat/trial-reels-video-upload` |
| 2026-08-11 | Cron de limpieza de Storage (`trial-reels` bucket, 30 días) | `feat/trial-reels-video-upload` |
| 2026-08-11 | Delay real entre publicaciones con QStash (reemplazó setTimeout fake) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | Estado "scheduled" para variantes encoladas en QStash | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-10 | Fix reel-worker crasheaba en Node.js 20 (migrar a Node.js 22) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-10 | Auth triple redundancia worker (X-Worker-Secret + Bearer + query param) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-09 | Fix MRR=0 y Nuevos clientes=0 en Panel General | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix errores 403 en consola por URLs CDN de Instagram expiradas | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix React #418 (hidratación) en detalle de contenido | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix "Conectá tus redes" en dashboard aunque Zernio estuviera conectado | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix panel ManyChat roto en página de integraciones | `claude/marketing-module-console-errors-g2py5w` |

---

*Creado: 2026-08-11. Actualizar con cada sesión — mover ítems completados a la tabla de abajo.*
