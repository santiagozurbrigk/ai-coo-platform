# PLAN_VERIFICACION.md — Qué probar cuando esté todo construido

> **Para Santiago:** el módulo de Embudos se está construyendo sin poder conectar
> cuentas reales ni leer las documentaciones de las APIs. Este documento acumula
> **todo lo que hay que verificar a mano**, en orden, para hacer una sola pasada
> completa al final.
>
> **Para Claude Code:** ver la regla al final. Cada unidad que construyas suma su
> bloque de verificación acá, con pasos concretos y resultado esperado.
>
> **Última actualización:** 2026-08-30 · Cubre hasta la ola 1 completa

---

## Cómo usar este documento

Cada bloque tiene **qué hacer**, **qué tendría que pasar** y **qué significa si
falla**. Los bloques están ordenados por dependencia: el 0 antes que todos, y
después cada unidad.

Marcá con ✅ lo que va pasando. Lo que falle, anotalo con el error textual — la
mayoría de las fallas esperadas son de mapeo de campos y se corrigen mirando el
dato crudo.

### Leyenda

| Símbolo | Significa |
|---|---|
| 🔑 | Necesita credenciales o una cuenta real |
| 🤖 | Se puede verificar sin cuentas, sólo con la app |
| ⚠️ | Falla probable: es de las cosas construidas a ciegas |

---

## 0. Prerrequisitos

🔑 **Antes de empezar, tener a mano:**

- [ ] Cuenta de **Whop** con permisos para crear webhooks
- [ ] Cuenta de **Fanbasis** con permisos para crear webhooks
- [ ] Cuenta de **VTurb** con al menos un video con reproducciones
- [ ] Cuenta de **Hyros** con datos de al menos 30 días
- [ ] Acceso a **GHL** con al menos un pipeline y oportunidades
- [ ] Cuenta de **WebinarJam o Zoom** con un webinar ya realizado
- [ ] `CRON_SECRET` y `NEXT_PUBLIC_APP_URL` de producción
- [ ] `ENCRYPTION_MASTER_KEY` configurada (si no, la conexión de pagos falla al cifrar)

🤖 **Estado de la app:**

- [ ] Migraciones aplicadas: `funnel_instances`, `funnel_step_bindings`, `funnel_benchmarks`, `funnel_period_snapshots`, `ad_metrics_daily`, `payment_integrations`, `payment_orders`, `payment_transactions`, `payment_webhook_events`
- [ ] Add-on `embudos` activado para la org de prueba desde super-admin
- [ ] La org de prueba tiene **Zernio conectado** (lo necesita I-1)

---

## 1. Módulo de Embudos — comportamiento base

🤖 No necesita ninguna cuenta externa.

### 1.1 El módulo aparece

| Paso | Resultado esperado |
|---|---|
| Entrar a la app con el add-on `embudos` activo | "Embudos" aparece en el sidebar con icono de filtro |
| Desactivar el add-on y recargar | Desaparece del sidebar |
| Con el add-on desactivado, ir a `/funnels` por URL | No debería mostrar datos de la org |

### 1.2 Crear un embudo

| Paso | Resultado esperado |
|---|---|
| Ir a `/funnels` sin ningún embudo creado | Empty state, no una tabla vacía |
| Crear uno de tipo **DM**, precio 5000, moneda USD | Redirige al detalle |
| Volver a `/funnels` | La tarjeta muestra nombre, tipo y precio formateado |
| Crear uno de tipo **Webinar** y otro **VSL** | Los tres conviven sin pisarse |

### 1.3 El spine y sus tres estados ⭐

Es lo más importante de verificar, porque es la regla que sostiene todo el módulo.

| Paso | Resultado esperado |
|---|---|
| Abrir el detalle de un embudo recién creado | Se ven las **7 etapas** del spine |
| Mirar la etapa **Spend** | Dice **"no aplica"** en gris — ninguna plantilla la usa |
| Mirar la etapa **Lead** en el embudo **VSL** | También **"no aplica"** — el VSL no tiene opt-in |
| Mirar las demás etapas sin datos | Dicen **"sin datos"** en ámbar, con icono de alerta |
| Verificar que **ninguna** diga `0` | ⭐ Si aparece un `0` donde no hay datos, es el bug que todo el diseño quiere evitar |
| Mirar el paso "Trigger (comment / story / ad)" del DM | Columna Origen dice **"Sin fuente"** en ámbar |
| Mirar el aviso arriba de la tabla | Lista las integraciones que faltan |

### 1.4 Períodos

| Paso | Resultado esperado |
|---|---|
| Cambiar entre 7d / 30d / 90d | La URL cambia a `?period=7d` y el rango de fechas mostrado también |
| Copiar la URL con período y abrirla en otra pestaña | Muestra el mismo período |
| Recargar | Mantiene el período |

### 1.5 Configurar fuentes

| Paso | Resultado esperado |
|---|---|
| Ir a "Configurar fuentes" desde el detalle | Una fila por paso, con su etapa y su métrica |
| Ver la columna "Según el estándar" | Dice qué herramienta le asigna el documento a ese paso |
| Cambiar la fuente de un paso | Se guarda solo, aparece el tilde verde |
| Poner un paso en **"Sin fuente"** | Vuelve al detalle y ese paso dice "sin datos" |
| Intentar una fuente incompatible con la etapa | El select no debería ni ofrecerla |

### 1.6 Aislamiento entre organizaciones 🔒

| Paso | Resultado esperado |
|---|---|
| Crear un embudo en la org A | — |
| Entrar con un usuario de la org B a `/funnels` | **No** ve el embudo de A |
| Con el usuario de B, abrir la URL del embudo de A | 404, no los datos |

---

## 2. I-1 — Métricas de anuncios

🔑 Necesita Zernio conectado con anuncios activos.

| Paso | Resultado esperado |
|---|---|
| Correr el cron a mano: `curl -X POST "$APP_URL/api/cron/capture-ad-metrics" -H "Authorization: Bearer $CRON_SECRET"` | JSON con `ok: true` y `captured > 0` |
| Correrlo **sin** el header de autorización | 401 |
| Consultar `ad_metrics_daily` en Supabase | Una fila por anuncio del día anterior |
| ⚠️ Comparar el `spend` de una fila contra el panel de Meta | **Deberían coincidir.** Si difiere por un factor de 100, el monto viene en centavos y hay que ajustar el mapeo |
| Verificar `impressions`, `reach` y `clicks` | Coherentes con Meta |
| Correr el cron dos veces para el mismo día | No duplica filas — hace upsert |
| Rellenar un día pasado con `?date=YYYY-MM-DD` | Captura ese día |
| Abrir un embudo Webinar o VSL | La etapa **Click** ya muestra un número |

---

## 3. I-2 — Pagos con Whop y Fanbasis ⚠️

🔑 **Corregido el 2026-08-30 contra la documentación real** (`docs/external-apis/`).
El riesgo bajó mucho, pero quedan cosas que sólo se confirman con una cuenta viva.

> **Fanbasis se llama Commas.** El API se sigue sirviendo desde `www.fanbasis.com`,
> así que el proveedor en OTC sigue siendo `fanbasis`.

### 3.1 Conectar

| Paso | Resultado esperado |
|---|---|
| Ir a `/integrations` y bajar hasta "Pagos" | Dos tarjetas: Whop y Fanbasis, ambas "Sin conectar" |
| Click en Conectar, dejar el secreto vacío y enviar | El botón está deshabilitado |
| Pegar el webhook secret de Whop y conectar | Estado pasa a "Conectado" y aparece la URL del webhook |
| Copiar la URL con el botón | Va al portapapeles |
| Verificar la fila en `payment_integrations` | `webhook_secret_encrypted` **no** está en texto plano |

### 3.2 Recibir eventos

| Paso | Resultado esperado |
|---|---|
| Registrar la URL copiada en el panel de Whop | — |
| Hacer una **compra de prueba** | — |
| Consultar `payment_webhook_events` | Una fila con el payload crudo |
| ⚠️ Mirar la columna `status` | Si dice `processed`, el mapeo acertó. Si dice `unmapped`, hay que corregirlo |
| ⚠️ Si quedó `unmapped`, leer `error_message` y el `payload` | Dice exactamente qué no se pudo leer |
| Corregir `lib/payments/normalize.ts` con los nombres reales | — |
| Actualizar `lib/payments/__tests__/normalize.test.ts` con el payload real | — |

### 3.3 Verificar los números

| Paso | Resultado esperado |
|---|---|
| Consultar `payment_transactions` | Una fila con `kind='payment'` y el monto correcto |
| ⭐ Comparar el monto contra el dashboard de Whop | Debe coincidir con **`settlement_amount`** (lo cobrado al cliente), no con `total` ni `subtotal`, que excluyen los fees del comprador |
| Verificar que Whop **no** venga en centavos | La doc dice decimales (10.43 = $10.43). Si difiere ×100, revisar |
| Verificar que Commas **sí** venga en centavos | `amount_cents: 2900` debe guardarse como `29` |
| Consultar `payment_orders` tras una suscripción **con** `auto_expire_after_x_periods` | ⭐ `contract_value` = cuota × ciclos. Una suscripción de $500 × 6 debe dar **3000**, no 500 |
| Crear una suscripción **indefinida** (sin `auto_expire_after_x_periods`) | ⭐ Debe quedar `unmapped`, **no** guardar la cuota como si fuera el total |
| Hacer un **reembolso de prueba** | Fila con `kind='refund'` y monto **positivo** |
| Verificar el neto en el embudo | Cash collected = pagos − reembolsos |

### 3.4 Seguridad del webhook 🔒

| Paso | Resultado esperado |
|---|---|
| `curl -X POST "$APP_URL/api/webhooks/whop?organizationId=<uuid>" -d '{}'` sin firma | **401** |
| Enviar con una firma inventada | **401** |
| Enviar sin `organizationId` | **400** |
| Repetir con Commas | Cabecera `x-webhook-signature`, HMAC-SHA256 **hex** sobre el cuerpo crudo |
| ⭐ Whop: verificar que el secreto `ws_...` funcione **sin transformar** | La doc pide usarlo literal, sin quitar prefijo ni decodificar base64 |
| ⭐ Commas: enviar un evento que no se sepa interpretar | Debe responder **200**, no error. Su entrega es at-most-once: un error pierde el evento para siempre |

### 3.5 Desconectar

| Paso | Resultado esperado |
|---|---|
| Desconectar Whop | Estado "Sin conectar", secretos borrados |
| Consultar `payment_orders` y `payment_transactions` | ⭐ **Las filas siguen ahí** — son historia del negocio |

---

## 4. I-3 — Detección de fuente vacía ⭐

🔑 Necesita una org con llamadas de cierre reales.

Es la regla que evita que el módulo confunda "no pasó nada" con "nadie lo cargó".

| Paso | Resultado esperado |
|---|---|
| Org con llamadas en el período, **todas en `scheduled`** | Show rate y Close rate dicen **"sin datos"**, no `0%` |
| Marcar **una** llamada como `no_show` | Ahora sí muestra `0%` de asistencia — hay señal, el cero es real |
| Marcar una como `closed` | Show rate y Close rate muestran números |
| Org **sin ninguna** conversación jamás | La etapa Lead dice "sin datos" |
| Org **con** conversaciones históricas pero ninguna en el período | Muestra `0`, que es un cero real |

---

## 5. I-4 — Oportunidades de GHL ⚠️⭐

🔑 Necesita una sub-cuenta de GHL real, con pipeline y oportunidades.

Es la unidad con más asunciones sin verificar del plan: la doc de GHL **no expande
el objeto pipeline ni el objeto opportunity**, y la vía de entrega por Workflow no
está documentada en ningún lado.

### 5.1 Catálogo de pipelines

| Paso | Resultado esperado |
|---|---|
| Con GHL conectado, correr "Sincronizar pipelines" | Devuelve la cantidad de pipelines y etapas de la sub-cuenta |
| ⚠️ Mirar `ghl_pipelines.raw` del primer response | **Verificar que el id venga en `id` o `_id`** y el nombre en `name`. Si usa otros nombres, corregir `ghlEntityId` y `syncGHLPipelinesForOrg` |
| ⚠️ Mirar `ghl_pipeline_stages.raw` | Verificar `position`. Si no viene, el orden del array es el respaldo — comprobar que coincida con el orden del pipeline en la UI de GHL |
| `skipped > 0` en el resultado | Hay pipelines o etapas sin id reconocible: mirar `raw` antes de seguir |

### 5.2 Entrega del webhook — la decisión que hay que cerrar ⚠️

Hay dos vías y **hoy sólo una es viable**, porque OTC no tiene app del Marketplace
aprobada.

| Paso | Resultado esperado |
|---|---|
| En Integraciones, generar el secreto de webhook | Devuelve la URL completa **una sola vez**. Guardarla: no se puede volver a leer |
| Crear un Workflow en GHL con trigger "Opportunity Stage Changed" y acción "Webhook" a esa URL | El workflow se guarda |
| Mover una oportunidad de etapa en GHL | Llega una fila a `ghl_webhook_events` |
| ⚠️ **Mirar el payload crudo de esa fila** | **Es la verificación que decide la unidad.** Confirmar que trae el id de la oportunidad y, sobre todo, **`pipelineStageId`**. Si no lo trae, la vía de workflow sólo sirve para altas y I-4 queda atada a la app del Marketplace |
| `status` de esa fila | `processed`. Si dice `unmapped`, el motivo está en `error_message` |
| Cuando exista la app del Marketplace: mandar un evento firmado | `auth_path = 'platform_ed25519'`, sin secreto en la URL |

### 5.3 El historial de transiciones ⭐

Es la razón de ser de la unidad: GHL no tiene historial y OTC construye el suyo.

| Paso | Resultado esperado |
|---|---|
| Mover una oportunidad Lead → Engaged → Intent, tres eventos | Tres filas en `ghl_stage_transitions`, con `from_stage_external_id` encadenado |
| ⭐ Mirar `occurred_at` de esas filas | Es la **hora de recepción**, no `dateAdded`. Si fuera `dateAdded`, las tres transiciones caerían en la fecha de creación de la oportunidad y el conteo por período sería falso |
| La primera transición de una oportunidad que ya existía en GHL | `from_stage_external_id` en `NULL`, no la primera etapa del pipeline |
| Reenviar el mismo evento (con el mismo `webhookId`) | No aparece una transición de más: se descarta como duplicado |
| Cambiar el nombre de una oportunidad sin moverla | **No** aparece transición nueva |
| Borrar una oportunidad | `ghl_opportunities.status = 'deleted'` y **ninguna transición nueva**; las anteriores siguen contando en su período |

### 5.4 El período ciego ⭐

| Paso | Resultado esperado |
|---|---|
| Antes del primer webhook, bindear un paso a una fuente `ghl_*` | El paso dice **"Fuera del historial registrado"**, no `0` |
| Después del primer webhook, pedir un período **anterior** a esa fecha | Sigue diciendo "fuera del historial" |
| Pedir un período que **empieza antes** del borde y termina después | También "fuera del historial": un conteo parcial presentado como completo es peor que un hueco visible |
| Pedir un período que empieza **en o después** del borde | Muestra el conteo real |

### 5.5 Configuración de la etapa ⭐

| Paso | Resultado esperado |
|---|---|
| Bindear un paso a "Entraron a una etapa del pipeline (GHL)" sin elegir etapa | El paso dice **"Falta elegir la etapa"** y resuelve a "sin datos" |
| Elegir la etapa | Aparece el número |
| Cambiar la fuente de ese paso a otra | La etapa elegida se descarta: no significa nada para otra fuente |
| Sin pipelines sincronizados | El formulario dice que hay que sincronizar, no ofrece un selector vacío |

### 5.6 Seguridad del webhook 🔒

| Paso | Resultado esperado |
|---|---|
| `POST` sin firma y sin secreto | `401` |
| `POST` con un secreto incorrecto | `401` |
| `POST` con `X-GHL-Signature` inventada **y** el secreto correcto | `401` — una firma inválida **no** cae al secreto compartido |
| `POST` con el `organizationId` de otra org y su secreto | Los datos entran en **esa** org, no en la del atacante: el id de la URL no autoriza nada |
| `POST` de un evento que no es `Opportunity*` | `200` con `ignored`, **sin guardar el payload** — trae datos personales que no hacen falta |

---

## 6. I-6 — VTurb ⚠️⭐

🔑 Necesita una cuenta de VTurb con al menos un VSL que haya tenido tráfico.

Es la unidad con más asunciones de **semántica**: el spec de VTurb lista los
campos de `Stats` con su tipo y **sin una sola descripción**.

### 6.1 Conectar y sincronizar

| Paso | Resultado esperado |
|---|---|
| Pegar la API key de Analytics (app.vturb.com → Settings → Analytics API) | Conecta y sincroniza los videos en el mismo paso |
| ⚠️ Si devuelve `401` | Puede ser la key **o** el header `X-Api-Version`: la doc de autenticación dice `v1`, el spec declara `v3`. Probar el otro valor antes de descartar la key |
| Con la cuenta conectada | El panel muestra la cantidad de videos y **cuántos no tienen pitch time** |
| ⚠️ Mirar `vturb_players.raw` del primer response | Confirmar `id`, `name`, `duration` y `pitch_time` |

### 6.2 La semántica de los campos ⚠️

**Es la verificación que decide si los números del embudo VSL son confiables.**
Tomar un período cerrado y comparar contra el dashboard de VTurb:

| Campo | Se está leyendo como | Qué confirmar |
|---|---|---|
| `total_viewed` | M08 — visitantes de la página | Que sea gente que **cargó la página**, no que reprodujo |
| `total_started` | M10 — reproducciones | Que sea "le dio play" |
| `engagement_rate` | M11 — % promedio visto | Que coincida con el "retención promedio" del dashboard |
| `total_over_pitch` | M12 — llegaron al CTA | Ver 6.3 |

También hay que ver **qué deduplican los sufijos `_device_uniq` y
`_session_uniq`**: si el dashboard muestra el valor único y OTC el bruto, los
números no van a coincidir y hay que cambiar de campo.

### 6.3 El pitch time ⭐

Es la regla propia de esta unidad.

| Paso | Resultado esperado |
|---|---|
| Un video **con** pitch time en VTurb, bindeado a "Llegaron al CTA del VSL" | Muestra un número |
| ⭐ Un video **sin** pitch time (`pitch_time = 0`) | El paso dice **"sin datos"**, no un número. Sin saber en qué segundo está la oferta, `total_over_pitch` cuenta a casi todos los que abrieron el video, y presentarlo como "llegaron al CTA" sería un número inflado que parece correcto |
| Cruzar `total_over_pitch` contra la curva | Pedir `/times/user_engagement` del mismo player y período, y buscar el `total_users` en el segundo `pitch_time`. **Deberían coincidir.** Si no, manda la curva y hay que cambiar el camino de cálculo |

### 6.4 El caché y las cuotas

| Paso | Resultado esperado |
|---|---|
| Abrir el mismo embudo dos veces seguidas | La segunda **no** llama a VTurb: sale de `vturb_stats_cache` |
| Un embudo con tres pasos apuntando al mismo video | **Una sola** llamada por endpoint, no tres |
| Un período que ya terminó | `is_final = true`, y no se vuelve a pedir nunca |
| Un período que incluye hoy | Se refresca a los 30 minutos |
| ⚠️ Si aparece un `429` | El mensaje guardado en `vturb_stats_cache.error_message` debería incluir el `resets_at` que manda VTurb |
| Comparar `GET /quota/usage` antes y después de abrir un embudo | Ver cuántas *queries* consume de verdad: la doc avisa que **una llamada HTTP puede contar como más de una** |

### 6.5 Que un error no se vuelva un cero ⭐

| Paso | Resultado esperado |
|---|---|
| Desconectar VTurb y abrir el embudo | Los pasos de VTurb dicen "sin datos", no `0%` de play rate |
| Bindear una fuente de VTurb sin elegir el video | **"Falta elegir el video"** |
| Elegir un video que no está en el catálogo (borrado en VTurb) | "Sin datos", con el error registrado |
| Un video sin `duration` en el catálogo | M11 queda "sin datos" — el endpoint de retención pide `video_duration` y sin él no se puede consultar |

---

## 7. I-5 — WebinarJam / EverWebinar ⚠️⭐

🔑 **Bloqueo previo:** la API key **requiere aprobación de WebinarJam**. Es el
primer paso y el más lento — ver `[WEBINARJAM-API-KEY]` en `PENDIENTES.md`.

### 7.1 Conectar y traer el catálogo

| Paso | Resultado esperado |
|---|---|
| Pegar la API key | Conecta y sincroniza los webinars. Se prueban los **dos prefijos** (`/webinarjam` y `/everwebinar`): alcanza con que uno responda |
| Con una cuenta que tiene los dos productos | Aparecen webinars de los dos, cada uno etiquetado con su producto |
| ⚠️ Mirar `webinarjam_webinars.schedules` | Debe traer objetos con `schedule` id, no textos. Los ids **sólo salen del detalle** (`/webinar`), no de `/webinars` |
| ⚠️ Contrastar un `schedule` id contra el panel | La doc avisa que **el id de la API NO coincide con el de la pestaña Schedules**. Confirmar que se está usando el de la API |

### 7.2 Los formatos que la doc no declara ⚠️

**Es la verificación que decide si los conteos caen en el período correcto.**

| Paso | Resultado esperado |
|---|---|
| ⚠️ Mirar `signup_at` de un registrante contra su fecha real en el panel | Si difiere en años, el epoch se leyó en la unidad equivocada (segundos vs milisegundos) |
| ⚠️ Mirar `attended_live` de alguien que sí asistió | Debe ser `true`. La doc publica la tabla 0-4 del **filtro**, no la del campo de respuesta: si devolviera otra convención, todos los asistentes se marcarían mal |
| Un registrante de un webinar con `last_name` deshabilitado | `last_name` en `NULL`, sin romper el sync |
| ⚠️ Ver bajo qué clave viene el array en `/registrants` | El ejemplo de la doc es una captura de pantalla. El cliente acepta `registrants`, `users` y `data`; confirmar cuál llega y dejar sólo esa |

### 7.3 El segundo de la oferta ⭐

| Paso | Resultado esperado |
|---|---|
| Un webinar **sin** segundo de oferta cargado | "Se quedaron hasta la oferta" dice **"sin datos"**, no `0` |
| Cargar el segundo y volver a traer registrantes | `stayed_past_pitch` deja de ser `NULL` y el stick rate aparece |
| ⭐ Contrastar contra el panel de WebinarJam | El conteo debería coincidir con los asistentes que se fueron pasado ese minuto |
| Cambiar el segundo y re-sincronizar | El conteo cambia — no queda pegado al valor anterior |
| Volver a correr el sync de webinars | El segundo cargado **no se pisa**: es configuración del usuario, no dato de la API |

### 7.4 M16 — la medida que no existe ⛔

| Paso | Resultado esperado |
|---|---|
| Abrir el embudo Webinar | El paso "Clicked CTA / booked call" dice **"sin fuente"** |
| Revisar las opciones de fuente de ese paso | **No** debe ofrecerse ninguna fuente de WebinarJam. `purchased_live` es conversión, no intención: ofrecerlo sería presentar una medida por otra |

### 7.5 Que un dato faltante no se vuelva un cero ⭐

| Paso | Resultado esperado |
|---|---|
| Registrantes traídos pero **ninguno** con asistencia registrada | "Asistieron" dice "sin datos", no `0` — mismo criterio que las llamadas de cierre en §4 |
| Un registrante con asistencia y otros sin ella | El conteo es real: hay señal |
| Bindear una fuente de webinar sin elegir el webinar | "Falta elegir el webinar" |

---

## 8. I-9 — Retención y compras repetidas ⚠️⭐

🔑 Necesita una cuenta de pagos conectada con **historial**, no sólo con webhooks
del último mes.

Es la unidad que desbloquea **LTV:CAC**, una de las dos ratios que el documento
llama decisivas. También es la que tiene la definición más discutible del plan:
el documento escribe `LTV = AOV × purchases × retention` y **no define ninguno de
los dos últimos factores**. Lo que hay que verificar no es el código, es la
interpretación.

| Paso | Resultado esperado |
|---|---|
| ⚠️ **Comparar el LTV que muestra OTC contra el que el cliente ya usa** | Es la verificación que decide la unidad. Si difieren mucho, la definición de M32 o M33 está mal elegida — no el cálculo |
| M32 sobre una org con historial de un año | Un número > 1 en un negocio con recompra. Si da exactamente 1.0, la ventana quedó corta o no hay recompra |
| ⭐ Cambiar el período del embudo | M32 **casi no debería moverse**: se mide sobre una ventana de 365 días, no sobre el período. "Cuántas veces compra un cliente" es una propiedad lenta del negocio |
| M33 en una org **sin** planes de cuotas ni suscripciones | Dice "sin datos", **no 0%**. Un cero acá dejaría el LTV en cero y diría que el negocio no vale nada |
| M33 en una org cuyas suscripciones empezaron todas dentro del período | "Sin datos" — todavía no se puede saber si siguen pagando |
| M33 con una cohorte real | Un porcentaje. Contrastar contra cuántos planes de cuotas siguen al día |
| Un reembolso dentro del período | **No** cuenta como pago para la retención |
| Órdenes sin comprador identificable | Se excluyen de M32 **arriba y abajo**: no inflan ni hunden el promedio |

---

## 9. I-10 — Triggers de Zernio ⭐

🔑 Necesita una cuenta de Zernio con comentarios reales.

| Paso | Resultado esperado |
|---|---|
| Bindear el paso "Trigger" del embudo DM a los comentarios de Zernio | Muestra un número si la ventana del inbox alcanza |
| ⭐ Pedir un período viejo (hace 6 meses) | Dice **"sin datos"**, no `0`. `listComments` es un inbox de tamaño desconocido: si el comentario más viejo que devolvió ya está dentro del período, no se puede saber si faltan más |
| Pedir el período actual en una cuenta con comentarios viejos | Muestra el conteo real |
| Zernio desconectado | "Sin datos", no `0` |
| ⛔ Buscar las historias | **No hay fuente y no la va a haber.** Meta sólo expone las historias vigentes (24 h): para cualquier período que no sea hoy, el dato no existe de su lado |

---

## 10. I-8 — Hyros ⚠️⭐

🔑 Necesita la cuenta de Hyros de un cliente, con su plan habilitando la API.

Es la unidad de la que dependen las decisiones de escala: el ROAS por fuente es
lo que el documento llama *"the steering wheel"*.

### 10.1 Conectar

| Paso | Resultado esperado |
|---|---|
| Pegar la API key | Conecta y trae las cuentas publicitarias |
| ⚠️ Si devuelve `401` o `403` | **Puede ser que el plan del cliente no incluya la API.** La doc no dice qué tier la habilita: hay que confirmarlo con Hyros antes de dar la key por inválida |
| Con una key de agencia | Cargar el `Accessible-Account-Id` de la cuenta cliente. El rate limit se cuenta igual contra el dueño de la key |
| Sin cuentas publicitarias sincronizadas | El panel lo dice y el embudo muestra "sin datos": el reporte **exige** nombrar las cuentas |

### 10.2 Que los números sean los correctos ⚠️⭐

**Es la verificación que decide la unidad.** Tomar un período cerrado y abrir el
dashboard de Hyros al lado.

| Paso | Resultado esperado |
|---|---|
| ⚠️ Comparar el **revenue atribuido** de OTC contra el del dashboard, mismo período y mismo modelo | Tienen que coincidir. Si no, revisar `fields` y `currency` |
| ⚠️ Verificar qué campo corresponde a "visitantes" | OTC usa **`new_visits`**, no `clicks`: un mismo visitante puede clickear varias veces. Confirmar que es lo que el cliente entiende por visitantes |
| ⭐ Comparar el **ROAS by-source** contra el **blended** | **Tienen que dar distinto.** Si dieran exactamente igual, algo está leyendo las mismas medidas para los dos, que es el bug que se corrigió al construir esta unidad |
| Cambiar el modelo de atribución | Los números cambian. Si no cambian, la caché no se está invalidando por modelo |
| ⚠️ Escribir mal un parámetro a propósito (p. ej. `fromDate` como `from_date`) | **Hyros devuelve `200` con datos distintos, sin avisar.** Es su comportamiento documentado: casi todos sus endpoints ignoran en silencio los parámetros desconocidos. Sirve para entender por qué el cliente construye los nombres en un solo lugar |

### 10.3 Los opt-ins y la landing

| Paso | Resultado esperado |
|---|---|
| Bindear la etapa Lead a "Opt-ins atribuidos (Hyros)" | Muestra los leads atribuidos del período |
| Comparar contra `form_submissions` del mismo período | **No tienen por qué coincidir**: uno cuenta lo atribuido a fuentes pagas y el otro todas las respuestas del formulario. Si el usuario espera que coincidan, hay que explicarlo, no "arreglarlo" |
| Bindear la etapa Click a "Visitantes de la página (Hyros)" en una landing sin VSL | Muestra un número donde antes no había fuente posible |

### 10.4 Que un error no se vuelva un cero ⭐

| Paso | Resultado esperado |
|---|---|
| Desconectar Hyros y abrir el embudo | ROAS by-source dice "sin datos". **No 0×** |
| Desactivar todas las cuentas publicitarias | "Sin datos", con el motivo en el panel |
| Una cuenta que falla y otra que responde | Se muestran los números de la que respondió **y** el error de la otra: el total es parcial y se dice |
| Un `429` | El mensaje guardado incluye el `Retry-After` que manda Hyros |

---

## 11. Estado de las unidades — ✅ **las diez están construidas**

Al 2026-08-30 no queda ninguna unidad del plan sin construir. Lo que falta no es
código: son **cuentas reales**.

| Unidad | Construida | Qué bloquea su verificación |
|---|---|---|
| I-1 métricas de ads | ✅ | — |
| I-2 pagos (Whop / Fanbasis) | ✅ | Conectar una cuenta |
| I-3 asistencia y cierres | ✅ | — |
| I-4 oportunidades de GHL | ✅ | ⚠️ Confirmar que un Workflow entregue `pipelineStageId` (§5.2) |
| I-5 WebinarJam | ✅ | 🔑 **La API key requiere aprobación previa** |
| I-6 VTurb | ✅ | Conectar una cuenta y cargar el pitch time |
| ~~I-7~~ | — | Absorbida por I-8 |
| I-8 Hyros | ✅ | Conectar una cuenta; confirmar que el plan incluya la API |
| I-9 retención | ✅ | ⚠️ Validar la definición contra el LTV que usa el cliente |
| I-10 triggers de Zernio | ✅ | — |

**Las tres cosas que hay que conseguir antes de poder verificar nada:**

1. 🔑 **La API key de WebinarJam** — requiere aprobación de su equipo y es lo más
   lento. Sin ella, tres de los siete pasos del embudo Webinar no tienen datos.
2. 🔑 **Una cuenta de Hyros con la API habilitada** — la documentación no dice qué
   plan la incluye.
3. 🔑 **Una sub-cuenta de GHL para probar el webhook** — 10 minutos, y define si
   I-4 funciona ya o espera la aprobación del Marketplace.


---

## 12. Verificación final, con todo conectado

Cuando estén todas las unidades y todas las cuentas conectadas:

| Paso | Resultado esperado |
|---|---|
| Abrir el embudo **DM** con datos reales | Las 6 etapas con números, ninguna "sin datos" |
| Abrir el **Webinar** | Las 7 filas con números |
| Abrir el **VSL** | Lead sigue diciendo "no aplica"; el resto con números |
| Verificar las tasas entre etapas | Ninguna supera 100% — si pasa, hay un denominador mal atado |
| ⭐ Comparar contra los rangos del documento | Los números deberían caer cerca de las bandas de la sección 02 |
| Contrastar el cash collected contra el dashboard del proveedor | Deberían coincidir |
| Cambiar de período y verificar que todo se mueva junto | — |
| Un embudo con dos ofertas de precio muy distinto | El spend es de la org entera hasta que esté Hyros — no confundir |

---

## 13. Onboarding — Fase 0 (capa de derivación)

Construido el 2026-08-31. La lógica pura está cubierta por 25 tests unitarios; lo
que **no** se puede verificar sin una base real es que las consultas lean las
tablas correctas. Ver `docs/ONBOARDING_PLAN.md`.

### 13.1 Aplicar la migración 🔒

| Paso | Resultado esperado |
|---|---|
| Correr `20260831120000_onboarding_state.sql` | La tabla `onboarding_state` existe con RLS activo |
| 🔒 Desde una sesión de la org A, leer la fila de la org B | Cero filas — la policy filtra por `get_my_organization_id()` |
| Verificar que `onboarding_responses` quedó intacta | El wizard de holding sigue funcionando igual |

### 13.2 Que los hechos se lean de donde corresponde — ✅ verificado 2026-08-31

Se replicaron los resolvers en SQL contra las 8 organizaciones founder con
usuarios y los resultados son coherentes campo por campo. Los dos que estaban
marcados como riesgosos quedaron resueltos:

- **`funnels.fullyBound`** — las tres instancias existentes son plantilla
  `webinar` (7 pasos) con **1 solo binding**, así que ninguna cuenta como
  completa. Es exactamente lo que muestra la grilla de `/funnels`: el checklist
  y esa pantalla no se contradicen.
- **`teamMemberCount`** — sólo `Optimiza tu Control` y `familiayformacion`
  superan un miembro; el resto mantiene el ítem abierto, como corresponde.

Queda pendiente **sólo** el filtro de desconexión (`connectedSourceCount`): hoy
ninguna organización tiene una integración desconectada, así que ese caso no se
pudo observar. Ver la tabla de abajo.

Si hiciera falta re-verificar, contrastar cada campo contra lo que muestra la UI:

| Campo | Contra qué se contrasta | Riesgo |
|---|---|---|
| `organization` | `/settings` → pestaña General | — |
| `hasCoreOffer` | `/product` → la oferta marcada como principal | — |
| `hasPrimaryAvatar` | `/product` → avatar principal | — |
| `connectedSourceCount` | `/integrations` → tarjetas conectadas | ⚠️ **el más probable de fallar.** Cada proveedor se desconecta distinto: unos borran la fila, otros la marcan. Si una integración desconectada sigue contando, falta un filtro en `DATA_SOURCE_TABLES` |
| `funnels.fullyBound` | `/funnels` → tarjetas con todos los pasos vinculados | ⚠️ tiene que dar **exactamente** el mismo número que la grilla; si difiere, el checklist y esa pantalla se contradicen |
| `historicalSnapshotCount` | `/integrations/import` | — |
| `teamMemberCount` | `/team/members` | ⚠️ cuenta perfiles, founder incluido: con un solo miembro el ítem debe seguir abierto |
| `indexedDocumentCount` | `/business-context/documents` con estado indexado | — |

### 13.3 La regla central: derivar, no guardar ⭐

Es lo que justifica todo el diseño. Probarlo explícitamente:

| Paso | Resultado esperado |
|---|---|
| ⭐ Con una org que **ya tenía** oferta y avatar cargados antes de esta feature | Los ítems aparecen cumplidos y `gate.required` es `false`, sin haber pasado nunca por el wizard |
| ⭐ Borrar la oferta principal de una org que ya cruzó el gate | El ítem se reabre en el checklist y `gate.required` sigue en `false` — no la expulsa a mitad de trabajo |
| Conectar una integración desde `/integrations` sin tocar el checklist | El ítem `data_source` aparece cumplido en la siguiente carga |
| Desconectar esa integración | El ítem vuelve a abrirse ⚠️ (ver 13.2) |

### 13.4 Cache y frescura

| Paso | Resultado esperado |
|---|---|
| Completar un ítem y recargar de inmediato | Aparece cumplido — las mutaciones deben llamar `invalidateOnboardingState` |
| Sin invalidar, esperar 60 s y recargar | Aparece cumplido igual: la ventana de cache es el techo del desfasaje |

### 13.5 Fase 1 — el gate, contra sesiones reales ⭐

Construido el 2026-08-31. **Las dos migraciones ya están aplicadas** y se verificó
por SQL que ningún usuario existente queda bloqueado (18 perfiles, cero
redirigidos) y que RLS aísla (1 fila visible de 25). Lo que falta es con sesión
de navegador:

| Paso | Resultado esperado |
|---|---|
| ⭐ Crear una cuenta founder nueva desde super-admin y entrar | Primero pide cambiar la contraseña; **después** cae en `/onboarding` |
| El paso 1 llega con moneda y zona horaria **sin elegir** | Es lo que corrige la migración de defaults: si vinieran precargadas, el paso no preguntaría nada |
| Intentar navegar a `/dashboard` desde el gate | Vuelve al gate |
| Verificar que la pantalla no muestra la notch nav | El gate se renderiza sin chrome |
| Completar los tres pasos | Redirige al panel y se reproduce la animación de bienvenida **una sola vez** |
| Volver a `/onboarding` a mano después de terminar | Redirige al panel |
| ⭐ Entrar con una cuenta **invitada** (`member`, `admin`) de una org sin oferta | Entra normal al panel, sin gate |
| Entrar con una cuenta **holding** | Va a `/onboarding/holding`, como antes |
| Con una org marcada `skip_onboarding` | Entra directo |
| Salir a mitad del gate y volver a entrar | Retoma en el primer paso sin cumplir, con lo anterior ya guardado |
| ⚠️ Con el gate abierto, que el agente u otra ruta de API responda | Las rutas `/api/` quedan excluidas del redirect: un redirect devolvería HTML y rompería el fetch |

### 13.6 Fase 2 — el checklist

Construido el 2026-08-31.

| Paso | Resultado esperado |
|---|---|
| Entrar al panel con una org con ítems abiertos | La tarjeta aparece arriba de todo, con el progreso y un link por ítem |
| ⭐ Con una org **sin actividad** (el panel muestra su empty state) | La tarjeta se ve igual: es el momento en que más hace falta, y el overview hace un early return |
| Mirar la isla derecha de la notch nav | Ícono con el contador de pasos abiertos |
| Ocultar un ítem con la X | Desaparece al instante, y sigue oculto tras recargar |
| Ocultar todos los ítems abiertos | La tarjeta y el contador desaparecen juntos |
| Completar un ítem de verdad (ej. conectar una integración) | Aparece tildado, sin haber tocado el checklist |
| ⭐ Entrar con una cuenta **invitada** | Ni tarjeta ni contador: el checklist es trabajo de founder |
| ⚠️ Medir el tiempo de carga del panel | El layout resuelve el estado en cada request de founder (~8 counts en paralelo, cache de 60 s). Si se nota, es el primer lugar donde mirar |

### 13.7 ⚠️ Las integraciones OAuth NO se pueden probar desde un preview

Descubierto el 2026-08-31 probando la Fase 2, y **no es un bug del onboarding**:
aplica a cualquier rama y ya era así antes.

Las rutas de OAuth arman la vuelta con una **variable de entorno fija**
(`GOOGLE_FORMS_REDIRECT_URI`, `CALENDLY_REDIRECT_URI`, `TYPEFORM_REDIRECT_URI`,
`STRIPE_REDIRECT_URI`, `MERCADOPAGO_REDIRECT_URI`, `INSTAGRAM_REDIRECT_URI`), no
con el host de la request — y esa URL está registrada en la consola del
proveedor. Desde un preview, la secuencia es:

| Qué pasa | Por qué |
|---|---|
| Arranca el OAuth en el preview | El cookie de estado se escribe en el dominio del preview |
| El proveedor devuelve a **producción** | La redirect URI es fija |
| El callback falla en silencio | El cookie de estado no existe en ese dominio: no se guarda la integración |
| Aparece la pantalla de login | En producción no hay sesión — **no es un deslogueo**, es otro dominio |
| Al entrar, no se ve lo de la rama | Porque estás en producción, no en el preview |

**Cómo probar el ítem "conectar una fuente de datos" en un preview:** usar un
proveedor de **API key**, que se conecta por diálogo y no sale del dominio —
Zernio, GoHighLevel, Fathom, o los de pagos. Cuentan igual para el checklist.

**Si hiciera falta probar OAuth en previews**, la salida es registrar un alias
estable de preview en cada consola de proveedor y apuntar ahí las variables del
entorno Preview. Es una decisión de infraestructura, no de código.

### 13.8 Fuentes de datos — la función de base de datos

`onboarding_connected_source_count` reemplazó al array de cinco tablas.

| Paso | Resultado esperado |
|---|---|
| ⭐ Conectar cualquier proveedor y recargar el panel | El ítem "Conectar una fuente de datos" queda tildado. Antes sólo contaban Zernio, GHL, Calendly, Fathom y pagos: **Google, Typeform, Instagram, ManyChat, Unipile, YouTube, Stripe, Mercado Pago, Hyros, VTurb y WebinarJam no contaban** |
| Desconectar ese proveedor | El ítem vuelve a abrirse ⚠️ — sigue siendo el caso que no se pudo observar: ninguna org tiene hoy una integración desconectada |
| 🔒 Verificar los permisos de la función | `security definer` y execute **sólo** para `service_role`: toma un `org_id` arbitrario y saltea RLS |

### 13.9 Fase 3 — tours contextuales

Construido el 2026-08-31 con Driver.js. **El popover ya se verificó renderizado**
en Chromium sobre el tema oscuro: fondo `rgb(15,15,15)`, texto `rgb(250,250,250)`,
descripción en `muted-foreground` y el botón principal en el naranja de marca con
texto negro. Lo que falta es el disparo real dentro de la aplicación.

| Paso | Resultado esperado |
|---|---|
| ⭐ Entrar por primera vez a `/funnels` con una cuenta que nunca lo vio | El tour arranca solo, con 2 pasos |
| Terminarlo y volver a entrar | No vuelve a aparecer |
| Cerrarlo con la X o con Escape en el primer paso | Tampoco vuelve: cerrar es una decisión del usuario |
| ⭐ Abrir `/funnels`, **navegar a otro módulo** sin cerrar el tour, y volver | **Sí** vuelve a aparecer: irse no es haberlo visto |
| Repetir en `/marketing/content`, `/agent` y `/sales/inbox` | Cada uno con su propio tour, independiente |
| ⭐ Entrar a `/funnels` con la pantalla **vacía** (sin embudos creados) | Corre igual, pero **sólo con el paso que tiene ancla**: la grilla no existe si no hay embudos, y un paso apuntando a la nada muestra un recuadro flotando |
| Entrar con una cuenta **invitada** a un módulo que sí puede ver | El tour corre — es su única forma de onboarding |
| Entrar con una cuenta sin permiso sobre el módulo | No se ofrece |
| Mirar el popover en tema claro | Los mismos tokens; verificado sólo en oscuro |
| ⚠️ Probar en mobile | Las anclas de la bandeja (`inbox-conversations`, `inbox-thread`) son las columnas **de escritorio**, ocultas con `md:`. En mobile ese tour va a quedar sin pasos y no correr — es aceptable, pero conviene confirmarlo |

**El guard de las anclas.** `lib/onboarding/__tests__/tours.test.ts` verifica que
cada `data-tour` declarado exista en el JSX y que no haya anclas huérfanas. Se
comprobó que **falla en rojo** al borrar un ancla a mano, nombrándola. Es la
protección contra el modo de falla propio de los tours: un paso que desaparece
sin que nada se rompa.

### 13.10 Fase 4 — panel de onboarding en super-admin

Construido el 2026-08-31. **El contenido ya se verificó** corriendo el mapeo real
contra los datos reales de las 13 organizaciones con usuarios: el orden sale
correcto y los holdings quedan al final. Falta verlo renderizado.

| Paso | Resultado esperado |
|---|---|
| Entrar a **Super Admin → Onboarding** | Lista ordenada por quién necesita atención primero |
| Mirar el encabezado | Hoy debería decir **0 sin terminar la configuración inicial** — todas las orgs existentes están eximidas por el backfill |
| ⭐ Crear una cuenta founder nueva y **no** completar el gate | Aparece primera, con "Todavía no terminó la configuración inicial" y los tres pasos pendientes |
| Dejarla así 3 días | El texto cambia a "Trabada en la configuración inicial hace N días" |
| Mirar los holdings y las orgs con `skip_onboarding` | Al final de la lista, **sin barra de progreso**, con el motivo explícito |
| Contrastar el progreso de una org con lo que ve ese cliente en su panel | Tienen que coincidir: el panel usa la misma `deriveOnboardingState` |
| 🔒 Verificar los permisos de `onboarding_org_progress()` | `security definer` y execute **sólo** para `service_role`: recorre todas las organizaciones y saltea RLS |

**Lo que este panel no responde todavía:** cuándo fue la última actividad de la
organización. Hoy dice en qué punto quedó, no si sigue viva — eso lo cubre
`/super-admin/client-health`, que es una pantalla aparte.

---

## 14. C0 — Campos configurables (Wins y Checkpoints)

Construido el 2026-09-02, rama `claude/checkpoints-cliente`. La lógica pura tiene
**58 tests en verde**; lo que sigue verifica lo que los tests no pueden ver: la
migración aplicada, RLS y la pantalla.

🤖 No necesita ninguna cuenta externa.

✅ **Migración aplicada el 2026-09-02** al proyecto OTC. Los cortes de la base ya
se verificaron ejecutándolos (en transacciones revertidas, cero filas quedaron):
clave repetida en la misma entidad **corta**; la misma clave en la otra entidad
**se permite**; `entity`, `field_type`, `options_source` y `currency` rechazan un
valor fuera de vocabulario; el trigger de `updated_at` pisa una fecha vieja.
Lo que sigue es la pasada por la pantalla, que no se hizo.

| Paso | Resultado esperado |
|---|---|
| Entrar a **Clientes** → botón **Campos personalizados** (arriba a la derecha, junto a "Crear planes") | Dos solapas (Wins, Checkpoints), las dos vacías, y el encabezado dice "Campos personalizados" |
| Apretar **Cargar "Tipo de win" de ejemplo** | Aparece una columna de lista con 7 opciones de colores |
| Recargar la página | La columna sigue ahí, con el mismo orden |
| ⭐ Renombrar la columna a "Categoría" | Cambia el nombre visible y la **clave interna sigue siendo `tipo_de_win`** — es lo que hace que renombrar no toque un dato cargado |
| ⭐ Renombrar la opción "Facturación" a "Ingresos" | Cambia la etiqueta; el valor guardado sigue siendo `facturacion` (se ve en la base) |
| ⭐ Intentar sacar una opción ya guardada de la lista | La app lo rechaza y ofrece archivarla |
| Archivar una opción | Deja de aparecer en el desplegable de carga |
| Crear una segunda columna llamada "Tipo de Win" | Se rechaza: choca con la primera (misma clave derivada) |
| Crear una columna llamada sólo con emojis | Se rechaza pidiendo al menos una letra o un número |
| Borrar una columna recién creada | Se borra (nadie la usó todavía) |
| ⚠️ Borrar una columna **con datos cargados**, cuando exista `client_wins` | Se rechaza y ofrece archivar. **Hoy no se puede probar**: la tabla de valores la trae el Encargo A |
| 🔒 Entrar con un usuario `operator` | **No ve el botón** en Clientes; entrando por la dirección directa ve la configuración sin botones de editar, y las acciones del servidor rechazan igual si se llaman a mano |
| 🔒 Verificar RLS de `field_definitions` | Un usuario de otra organización no ve ni una fila |
| ⚠️ Elegir `options_source = 'journey_stages'` | **No se puede desde la UI todavía, y está bien**: el catálogo de fases lo entrega C1. La columna existe en la base desde ahora |

**Qué significa si falla la clave interna:** si al renombrar cambia la clave, el
mecanismo entero se cae —los datos cargados quedarían apuntando a una columna que
ya no existe—. Es el paso más importante de este bloque.

---

## 15. C1 — El recorrido del cliente (fases y checkpoints)

Construido el 2026-09-03. **28 tests** sobre la lógica pura.

✅ **Migración aplicada** al proyecto OTC, y los cortes de la base verificados
ejecutándolos en transacciones revertidas (cero filas quedaron): un color fuera
de la paleta corta; un `sets_client_status` que no es uno de los cuatro de
`clients.status` corta; un plazo de cero días corta; un checkpoint bajo una fase
inexistente corta.

🤖 No necesita ninguna cuenta externa. Sí necesita **al menos una columna de
checkpoint** cargada en Campos personalizados para poder elegir métricas.

| Paso | Resultado esperado |
|---|---|
| **Clientes → Recorrido del cliente** | Estado vacío con el botón de recorrido de ejemplo |
| Apretar **Cargar un recorrido de ejemplo** | Tres fases: Onboarding, Primeros resultados, Escala |
| Agregar un checkpoint a la primera fase | Aparece anidado bajo su fase |
| Ponerle plazo `5` | Se muestra "5 d" con el reloj. El texto del formulario aclara **desde el checkpoint anterior** |
| Ponerle "Al alcanzarlo pasa a: Activo" | Se muestra la etiqueta "→ Activo" |
| Tildarle una métrica y marcarla obligatoria | Aparece con asterisco en la fila del checkpoint |
| ⭐ Renombrar esa columna en **Campos personalizados** y volver | La métrica sigue enganchada y muestra el **nombre nuevo** — la referencia es por clave |
| ⭐ Archivar esa columna y volver | La métrica queda marcada en ámbar con el aviso de que apunta a algo que ya no está disponible |
| ⭐ Intentar **borrar una fase con checkpoints adentro** | **Se rechaza.** Si no lo hiciera, la cascada de la base borraría todos los checkpoints sin avisar |
| Borrar una fase vacía | Se borra |
| Subir y bajar fases y checkpoints | El orden persiste al recargar |
| ⚠️ Borrar un checkpoint que algún cliente alcanzó | **Hoy no se puede probar**: `client_checkpoint_events` la trae C2. Reverificar entonces |
| 🔒 Entrar con un usuario `operator` | No ve el botón en Clientes; entrando por la dirección directa ve el recorrido sin botones de editar |
| 🔒 RLS de las dos tablas | Un usuario de otra organización no ve ni una fila |

**Qué significa si falla el renombrado:** si al renombrar una columna la métrica
del checkpoint se desengancha, el puente entre C0 y C1 está roto y hay que mirar
`resolveMetricSchema` antes de seguir con C2.

---

## 16. C2 — Registrar que un cliente alcanzó un checkpoint

Construido el 2026-09-03. **10 tests nuevos** sobre la lógica de progreso (683 en total).

✅ **Migración aplicada** al proyecto OTC, cortes verificados ejecutándolos en
transacciones revertidas con un cliente fabricado y borrado (cero filas
quedaron): el índice único corta el mismo checkpoint dos veces por cliente; otro
checkpoint del mismo cliente se permite; un `source` inválido corta;
`clients.current_stage_id` acepta la fase; borrar el checkpoint o el cliente se
lleva sus eventos por cascada.

🤖 Necesita **un recorrido configurado con al menos un checkpoint** (C1) y **al
menos un cliente**.

| Paso | Resultado esperado |
|---|---|
| Entrar a un cliente | Abajo de los pagos, la sección **"Recorrido"** con los checkpoints en orden |
| Si el recorrido no está configurado | La sección **no aparece**: se configura en su pantalla, no desde la ficha |
| Apretar **Registrar** en un pendiente sin métricas | Diálogo con fecha (hoy) y nota, nada más |
| ⭐ Registrar uno que pide métricas | El formulario pide **exactamente** las métricas configuradas, con el control de cada tipo |
| Cargar un monto ilegible ("mil") | Se rechaza con el motivo; no se guarda como cero |
| Elegir una fecha futura | Se rechaza (el input ya la limita, y el server también) |
| Guardar | El hito pasa a "alcanzado" con su fecha y sus números; el resumen de arriba sube |
| ⭐ Registrar uno con "pasa a: Activo" | El **estado del cliente** cambia a Activo arriba de la ficha |
| Marcar el tercer hito sin el primero | Se permite; el primero queda como hueco pendiente |
| ⭐ Deshacer un registro | Pide confirmación; si movía el estado, **avisa que no vuelve solo**. El estado del cliente **no** cambia; la fase actual sí se recalcula |
| Registrar el mismo checkpoint dos veces | La segunda vez **edita** el registro, no duplica |
| 🔒 RLS de `client_checkpoint_events` | Un usuario de otra organización no ve ni una fila |

**Qué significa si falla el estado:** si registrar un checkpoint con
`sets_client_status` no mueve el estado del cliente, revisar `applyClientStatus`
en `checkpoint-event-actions.ts` antes de C3, que se apoya en esto.

---

## 17. C3 — Clientes trabados, fase en la lista y buzón de propuestas

Construido el 2026-09-03. **14 tests nuevos** sobre "trabado" (687 en total).

✅ **Migración aplicada**, cortes verificados en transacciones revertidas: el
duplicado pendiente de la misma fuente corta; otra fuente para el mismo hito se
permite; `source = 'manual'` corta; una confianza fuera de 0–1 corta; tras
resolver se puede volver a proponer; borrar el cliente se lleva sus propuestas.

🤖 Necesita un recorrido con plazos configurados (C1) y hitos registrados (C2).

| Paso | Resultado esperado |
|---|---|
| Entrar a **Clientes** con un recorrido configurado | Columna **"Recorrido"** con la fase actual y su color |
| Un cliente sin ningún hito registrado | Dice **"Sin empezar"**, no "Fase 1" |
| Un cliente con todo el recorrido hecho | "N de N", sin aviso |
| ⭐ Registrar un hito con plazo y esperar a que venza | El cliente muestra **"trabado hace N días"** en rojo |
| Si no hay ningún trabado | La pill **"Trabados" no aparece** |
| Con al menos uno | Aparece **"Trabados (N)"**; al tocarla la lista deja sólo ésos |
| ⚠️ Un cliente que compró y **nunca** registró un hito | **No** aparece como trabado. Es el límite documentado, no un bug |
| Sin recorrido configurado | La columna **no aparece** |
| 🔒 RLS de `client_checkpoint_proposals` | Un usuario de otra organización no ve ni una fila |

**Del buzón de propuestas** (necesita que E o B lo alimenten, o un insert a mano):

| Paso | Resultado esperado |
|---|---|
| Insertar una propuesta a mano en la tabla | Aparece en la ficha del cliente, arriba del recorrido, con quién propone y por qué |
| ⭐ Aceptar | Se crea el evento real, con las **mismas validaciones** que el registro manual, y el estado del cliente se mueve si el hito lo declara |
| Descartar | No crea nada; la propuesta desaparece del buzón y queda como historial |
| Insertar dos veces la misma propuesta pendiente | La segunda no entra (índice parcial) |
| Proponer un hito **ya registrado** | No se crea la propuesta |

**Qué significa si falla el aceptar:** si aceptar una propuesta creara el evento
salteando validaciones, el buzón sería una puerta trasera al registro. Revisar que
`acceptCheckpointProposalAction` siga llamando a `recordCheckpointAction`.

---

## 18. A · WINS — tracker de logros y dashboard de casos

Construido el 2026-09-03. **14 tests nuevos** sobre `derive-case` (701 en total).

✅ **Migración aplicada**, cortes verificados en transacciones revertidas:
`source` inválido corta; canal de uso fuera del vocabulario corta; un adjunto sin
win y sin draft corta; `storage_path` duplicado corta; borrar el win se lleva usos
y adjuntos; el bucket `client-wins` quedó **privado**.

🤖 Conviene tener al menos una columna de win cargada en Campos personalizados (C0).

**El tracker:**

| Paso | Resultado esperado |
|---|---|
| **Clientes → Wins** | Solapas Tracker y Dashboard; el tracker vacío explica para qué sirve el número |
| Cargar un win sin número | Entra; la columna Medida muestra un guion |
| ⭐ Cargar la medida a medias (clave sin número) | **Se rechaza** pidiendo las dos o ninguna |
| Cargar un número ilegible ("mil") | **Se rechaza** con el motivo |
| ⭐ Las columnas de C0 aparecen como columnas del tracker | Con sus opciones y colores |
| 🔴 **Subir una captura** | Sube, se ve en miniatura por signed URL. **Nunca se probó** |
| 🔴 Borrar el win con captura | Se borra la fila **y el archivo del bucket** |
| Agregar "se usó en" (Landing, VSL…) | Cada uso es un chip; se quita tocándolo |

**El dashboard:**

| Paso | Resultado esperado |
|---|---|
| Un cliente con **dos wins** con la misma clave y unidad | Punto inicial → final, la diferencia con su porcentaje, y el plazo en días |
| ⭐ Un cliente con **un solo** número | "Sin medir · Hay un solo número: falta otro para comparar" |
| ⭐ Un cliente **sin** números | "Sin medir · Ningún win de este cliente tiene un número cargado" |
| ⭐ Dos wins con **unidades distintas** (USD y ARS) | "Sin medir · unidades distintas". **No los resta** |
| Dos números del **mismo día** | "Sin medir · no hay plazo que medir" |
| Un cliente que **bajó** una métrica | La diferencia se muestra negativa, en rojo, no se esconde |
| Cargar el baseline del cliente (hoy por base) | El punto inicial pasa a ser el baseline |
| ⚠️ Nicho y baseline | **No tienen UI**: se cargan por base. Ver pendiente `[A-BASELINE-SIN-UI]` |

**Qué significa si falla "sin medir":** si el dashboard mostrara un número donde
debería decir "sin medir", estaría inventando el dato más importante del módulo.
Es el paso que más importa de este bloque.

---

## 19. D · SOPS-VIDEO — un SOP escrito desde un Loom

Construido el 2026-09-04. **25 tests nuevos** de lógica pura (748 en total).

✅ **Migración aplicada**, cortes verificados en transacción revertida: un
`status` fuera del vocabulario corta; un job sin `video_path` corta; ⭐ la
transcripción **se conserva** cuando el job pasa a `failed`; realtime habilitado;
bucket `sop-videos` privado con cero policies que lo nombren.

🔴 **Nada del flujo se ejecutó nunca.** Este bloque es el más importante de todos
los que quedan: es el único encargo donde lo no verificado es la mayor parte.

🔑 Necesita `OPENAI_API_KEY`, `QSTASH_TOKEN` y `NEXT_PUBLIC_APP_URL`.

| Paso | Resultado esperado |
|---|---|
| **Operaciones → SOPs → Crear → "Desde un video"** | El selector de archivo y los tres campos opcionales |
| Subir un mp4 corto (2-3 min) | Barra de progreso; al terminar, el estado pasa a "En cola…" |
| ⚠️ **Mirar los logs del worker** | Es donde va a fallar si ffmpeg no está disponible en la lambda. **El riesgo #1** |
| Esperar | El estado pasa solo a "Transcribiendo…" y después a "Escribiendo el SOP…" sin apretar F5 |
| Cuando termina | El markdown aparece cargado en el editor del creador |
| ⭐ Leer el SOP contra el video | **No tiene que haber pasos que no se dijeron.** Es la regla principal del prompt y la única forma de evaluarla es leyendo |
| ⭐ Mirar "Lo que el video no aclara" | Tiene que listar los huecos reales. Si viene vacío en un video incompleto, el prompt no está funcionando |
| Cortar el video a mitad de una frase y subirlo | La transcripción no tiene que repetir palabras en el empalme |
| ⭐ Forzar un fallo de generación y reintentar | **No vuelve a transcribir**: la transcripción quedó guardada. Es lo que evita pagar Whisper dos veces |
| Subir un video de más de 25 MB de audio (~1 h) | Se parte en varios pedidos y la transcripción sale completa |
| 💰 Mirar `token_usage` después de transcribir | ⭐ Tiene que haber una fila con `model = 'whisper-1'` y el costo. **Antes no se registraba nada** |
| Con capturas: subir 2-3 imágenes al SOP | Aparecen dentro de los pasos, no al final |
| ⭐ Volver al SOP **una semana después** | Las capturas **siguen viéndose**. Es la prueba de que se guardó el marcador y no la URL firmada |
| Ver un SOP cuyo adjunto se borró | Dice "Captura no disponible", no una imagen rota |

**Qué significa si falla lo de la semana:** si las capturas dejan de verse, en
algún lado se guardó la URL firmada en vez del marcador, y hay que revisar
`validateAttachmentMarkers` y el visor antes de que se llene de SOPs rotos.

---

## 20. B · LLAMADAS — keys por miembro, contraparte e identidades

Construido el 2026-09-04. **27 tests nuevos** de lógica pura (775 en total).

✅ **Migración aplicada**, cortes verificados: `encrypted_api_key` **ahora existe**
(era el bug que impedía conectar a cualquier miembro); el mismo valor apuntando a
dos personas corta; una identidad con cliente **y** lead corta; una sin dueño
corta; un `status` inválido corta; la policy de privacidad quedó instalada.

🔑 **Necesita una cuenta real de Fathom.** Es el encargo con más superficie sin
verificar: todo el mapeo se hizo leyendo el plan.

| Paso | Resultado esperado |
|---|---|
| Un miembro conecta su key en Integraciones | Se valida antes de guardar; el panel lo muestra conectado |
| ⭐ Mirar el mail deducido de la cuenta | Se le **muestra para confirmar**, no se asume. Si sale mal, todas sus llamadas quedarían atribuidas a otro |
| 🔒 Conectar **sin** `ENCRYPTION_MASTER_KEY` | **Falla con el motivo y no guarda nada.** Antes guardaba la key **en texto plano** diciendo "conectado" |
| Mirar Fathom → Settings → Webhooks | Apareció un webhook que **OTC creó solo**. El miembro no configuró nada |
| ⚠️ Grabar una llamada | Llega sola, sin apretar sincronizar. **Si no llega, mirar la firma**: es el riesgo #1 |
| ⭐ Dos miembros en la **misma** llamada | Llega **una sola fila**, no dos (`triggered_for`) |
| Mirar `fathom_calls.user_id` | Dice quién grabó cada una |
| 🔒 ⭐ Una llamada **sin vincular** a un cliente | La ve **sólo quien la grabó**. Otro miembro no la ve |
| 🔒 Vincularla a un cliente | Ahora **sí** la ve toda la organización |
| Revocar la key en Fathom | La fila pasa a **"revocada"** y avisa. **Nunca dejar de recibir en silencio** |
| Desconectarse | El webhook **desaparece** de la cuenta de Fathom de esa persona |
| ⭐ Mirar el resumen de una llamada | **Llega.** Antes `default_summary` era un objeto y `pickString` devolvía null, así que el resumen **no llegaba nunca** |
| ⭐ Mirar `resolution_method` de cada llamada | Dice por qué peldaño se resolvió. Es lo que después dice **dónde invertir** |
| ⚠️ Sembrar `client_identities` y volver a mirar | Muchas más llamadas se resuelven solas. **Sin la siembra el módulo arranca flojo** — ver pendiente |

**Qué significa si falla la firma:** no llega ninguna llamada y el panel muestra
"firma inválida" en la fila del miembro. Hay que mirar cómo firma Fathom de verdad
y ajustar `verifySignature` en la ruta del token.

---

## 21. Las cinco piezas de los Excel y la revisión semanal

**Estado:** construido, con la base migrada y los cortes probados en una
transacción revertida. **Nada probado con una sesión real** — las capturas se
sacaron con el middleware puenteado y datos inventados.

**Dónde:** `/clients/wins` (tracker y dashboard), `/clients/revision`.

| Paso | Resultado esperado |
|------|--------------------|
| Abrir `/clients/wins` con clientes reales | El tracker abre con las pills contando: **Sin usar (n)**, Reservadas, Usadas, Sin permiso, Falta captura |
| ⚠️ Mirar la columna **Permiso** de los wins ya cargados | Todos dicen **"Sin preguntar"** y el motivo. Es correcto: nadie dio permiso todavía |
| ⭐ Editar un win, elegir **Autorizado** y guardar sin elegir cómo aparece | **Rechaza** con "Si el cliente autorizó, elegí cómo quiere aparecer". Un permiso a medias no se guarda |
| Elegir **Nombre, sin los números** y guardar | Guarda. La columna muestra "Autorizado" y debajo la forma elegida |
| Ir al **Dashboard** y tocar **Con permiso (n)** | Deja sólo los clientes con al menos un win autorizado |
| ⭐ Marcar un win como **Reservada** y guardar | Queda "Reservada". Cargarle un uso lo pasa a **"Usada"** solo, sin tocar nada más |
| Marcar **Falta sacar la captura** | Aparece el aviso ámbar en la columna Estado y el win entra en el filtro "Falta captura" |
| Abrir la **ficha del cliente** (lápiz del dashboard) y cargar objetivo con clave y número | La tarjeta muestra **Punto inicial → Punto final → Objetivo** |
| ⭐ Cargar el objetivo con **otra clave** que la del recorrido | El objetivo **no** se muestra. Comparar dos medidas distintas sería inventar el dato |
| Cargar la clave del objetivo **sin** el número | **Rechaza**: "La métrica objetivo necesita la clave y el número, o ninguno" |
| Cargar una **fecha de egreso** dentro de los próximos 2 meses | El cliente aparece en "¿Quién está cerca del egreso?" de la revisión semanal |
| Abrir `/clients/revision` | Cuatro secciones con nombres. Las vacías dicen **por qué** están vacías, no se esconden |
| ⭐ Mirar "¿Quién no se movió?" | Coincide con los trabados de C3. Un cliente **sin plazo cargado** no aparece: no se puede saber |
| ⭐ Mirar "¿Quién está en riesgo?" | Sólo clientes con **dos señales** o más. Un trabado a secas **no** está acá |
| Anotar algo en la fila de un cliente y guardar | Aparece "anotado el <fecha>". El mismo texto se ve en cualquier otra sección donde ese cliente figure |
| Borrar la anotación y guardar | Se borra el texto **y la fecha**: un "cuándo" sin "qué" no dice nada |
| ⚠️ Mirar el acceso: barra superior → **SOPs** | Aparece **sin** activar el add-on `operaciones`. El resto del grupo Operaciones sigue oculto |

**Qué significa si algo no aparece:** las cuatro listas están hechas para no
inventar señales. Un cliente que esperabas ver y no está casi siempre es un dato
que falta —el plazo de su próximo hito, su fecha de egreso, la medida de sus
wins— y no un error de la pantalla.
## 14. Seguimiento en tabla, con valores propios (2026-09-03)

Construido sin poder abrirlo en un navegador: la sesión no tiene la app corriendo
ni cobertura de Playwright en esta pantalla. Todo lo de acá es 🤖 —no hace falta
ninguna cuenta externa—, pero **nada se vio renderizado**.

**La migración `20260903120000_sales_follow_up_options.sql` ya está aplicada**
(2026-09-03, verificada: tabla con RLS, 0 CHECK restantes en `closing_calls`,
1.139 turnos intactos).

### 14.1 La tabla reemplaza al acordeón

| Paso | Resultado esperado |
|---|---|
| Entrar a **Ventas → Closing → Seguimiento** | Una tabla con nueve columnas, no las tarjetas desplegables |
| Mirar el pill **Pendientes** | El número tiene que coincidir con lo que mostraba el panel anterior |
| ⭐ Pasar a **Todos** | Aparecen también los ganados, perdidos y agendados — los 964 leads que antes no se veían en ninguna pantalla |
| Buscar por nombre y por mail | Filtra sobre el total, no sobre la página |
| Pasar de página | La numeración dice `51–100 de N` y las filas cambian |

### 14.2 Editar en la celda

| Paso | Resultado esperado |
|---|---|
| Elegir un **próximo paso** en una fila | Se guarda solo, sin botón. La columna **Estado** cambia en el acto |
| ⭐ Recargar la página | El cambio sigue ahí: el guardado optimista no mintió |
| Cambiar la **fecha** | El estado pasa de "Seguimiento vencido" a "Seguimiento agendado" al ponerla a futuro |
| Elegir **Dar por perdido** | La celda de fecha queda deshabilitada y el estado pasa a "Perdido" |
| ⭐ Cambiar el próximo paso de una fila que ya tenía nota y responsable | La nota y el responsable **no se borran** |
| Asignar un **responsable** | Es la primera vez que `next_action_owner_id` se puede cargar desde la UI; verificar en la base que la columna se llenó |
| Escribir una **nota** y hacer click afuera | Se guarda; con Escape vuelve al valor anterior |
| Click en el nombre del lead | Se abre el panel lateral con el hilo de intentos completo |

### 14.3 Valores propios ⭐

| Paso | Resultado esperado |
|---|---|
| Abrir el selector de próximo paso → **Crear valor…** | Formulario con nombre, color y comportamiento |
| Crear uno con **Necesita fecha** (ej. "Esperando pago") | Queda seleccionado en esa fila y disponible en todas las demás |
| ⭐ Crear uno con **Cierra el hilo** (ej. "Derivado a socio") y elegirlo | El estado pasa a "Perdido" y la fecha queda deshabilitada — se comporta igual que `lost` |
| Crear una **calificación** propia | No pide comportamiento: las calificaciones sólo describen |
| Intentar crear uno con un nombre que ya existe | Lo rechaza con "Ya existe un valor con ese nombre" |
| Abrir **Valores** en la barra | Los de fábrica se ven con un candado; los propios se renombran, recolorean y archivan |
| ⭐ Archivar un valor que **está en uso** | Desaparece del selector, pero las filas que lo tenían lo siguen mostrando tachado. **El dato no se blanquea** |
| 🔒 Verificar RLS de `sales_follow_up_options` | Un usuario de otra organización no ve ni crea valores ajenos |

### 14.5 Cargar el seguimiento al marcar el resultado ⭐

| Paso | Resultado esperado |
|---|---|
| Abrir una llamada agendada → **Marcar como no cerrada** | El modal pide motivo, notas **y** el bloque de seguimiento (calificación, próximo paso, fecha, responsable, nota) |
| Guardar con un próximo paso cargado | Toast "Resultado y seguimiento guardados". En la pestaña Seguimiento la fila ya aparece con ese próximo paso y su fecha |
| ⭐ Guardar **sin** próximo paso | El modal avisa antes que el lead queda como "Sin próximo paso", y así aparece en la tabla. No lo bloquea |
| **Marcar como no show** | Abre el mismo modal, **sin** selector de motivo, con el mismo bloque de seguimiento |
| Elegir un próximo paso que pide fecha y borrar la fecha | No deja guardar: "El próximo paso necesita una fecha" |
| Crear un valor propio desde el modal | Queda seleccionado y disponible después en la tabla |
| Abrir una llamada en estado **"Asistió — sin resultado"** | ⭐ Tiene los tres botones de resultado. Antes no los tenía: la UI comparaba contra `scheduled` a mano |
| Reabrir el modal con otra llamada | Todos los campos en blanco — no arrastra lo de la llamada anterior |

### 14.4 Lo que puede fallar

- ⚠️ **El techo de 2.000 leads.** El estado se deriva en JS, no en SQL, así que la
  tabla se resuelve en memoria. Pasado ese número aparece el aviso y **hay leads
  que no entran en la vista**. Hoy son 964: sobra, con menos margen del esperado. El día que no sobre, hay que
  derivar el estado en la base.
- ⚠️ **Fecha por defecto.** Elegir un próximo paso que pide fecha y no la tiene la
  pone en **pasado mañana** en vez de pedirla. Es deliberado —sin fecha el lead se
  pierde en silencio— pero hay que confirmar que se entiende al usarlo.
- ⚠️ **Sin cobertura de Playwright.** La lógica pura tiene 37 tests; la pantalla,
  ninguno.

---

## 22. Los cuatro cables — el buzón de propuestas

**Estado:** construido y con el filtro probado. **La migración de las marcas está
sin aplicar** y **el matcher nunca corrió contra la API real**.

**Dónde:** cron `/api/cron/daily-signals` · Wins → solapa **Candidatos** · ficha
del cliente, sección del recorrido.

| Paso | Resultado esperado |
|------|--------------------|
| 🔴 Aplicar `20260904110000_checkpoint_proposal_sources.sql` | Sin esto los dos pasos de propuestas fallan. Es lo primero |
| Correr el cron a mano con `?organizationId=<uuid>` | Devuelve los tres pasos con sus números, o el error de cada uno por separado |
| ⚠️ Mirar `clasificacion.vacios` en la respuesta | Si es alto, **el intent MESSAGE CONTENT del bot no está activado**: los mensajes llegan en blanco |
| ⭐ Sin recorrido configurado, correr el cron igual | Los pasos de propuestas devuelven cero **sin llamar a la IA**: sin catálogo no hay contra qué comparar |
| Correrlo dos veces seguidas | La segunda no vuelve a evaluar lo mismo. Si lo hace, la marca `checkpoint_checked_at` no se está escribiendo |
| ⭐ Mirar las propuestas que aparecen en la ficha del cliente | Cada una dice de dónde salió y por qué. Ninguna registró el hito sola |
| ⭐ Aceptar una propuesta | Crea el evento por el mismo camino que el registro manual, con las mismas validaciones |
| Proponer un hito **ya registrado** | No se propone: no hay nada que decidir |
| Correr el cron dos días seguidos con la misma propuesta pendiente | No se duplica |
| ⭐ **Contar aceptadas contra descartadas** en la primera semana | Es la única medida real de calidad. Más de la mitad descartadas → subir `MIN_MATCH_CONFIDENCE` |
| Wins → **Candidatos** | Están los testimonios de todos los clientes, con el mensaje textual |
| Convertir un candidato | Crea el win con el mensaje como origen y desaparece de la lista |
| "No es un testimonio" | Desaparece de la lista **y** deja de estar resaltado en la ficha del cliente |

**Qué significa si no aparece ninguna propuesta:** lo más probable es que no haya
mensajes (el bot no está desplegado) o que no haya recorrido configurado. El
tercer motivo es que el umbral de confianza esté cortando todo, y eso se ve
corriendo el cron y mirando `propuestos` contra `evaluados`.

---

## Permisos por módulo y el bloqueo del servidor — 2026-09-06

**Por qué no se verificó acá:** hace falta una segunda cuenta con un rol
limitado, y en esta sesión sólo hay la del fundador (que pasa siempre por
diseño).

**Estado:** la migración **ya está aplicada y verificada** contra la base real
(63 roles, cero claves viejas, reparto idéntico al ensayo de sólo lectura). Lo
que queda por probar es lo que ninguna consulta puede probar: que una persona con
un rol limitado vea lo que tiene que ver.

| Paso | Resultado esperado |
|------|--------------------|
| 🔴 Abrir Equipo → Roles con un rol creado **antes** de hoy | Los permisos siguen ahí, agrupados en 13 módulos. La consulta dice que están; esto confirma que la pantalla los muestra |
| Crear un rol con Finanzas en "Sin acceso" y asignarlo a alguien | En su sesión, Finanzas no aparece en la navegación |
| 🔒 ⭐ Con esa sesión, **tipear `/finance` en la barra del navegador** | Sale "No tenés acceso a Finanzas". Antes de este cambio entraba y veía la facturación entera |
| 🔒 Probar también `/finance/expenses` y `/team/roles` | Las subrutas heredan el bloqueo del módulo padre |
| ⭐ Invitar a alguien **sin asignarle rol** y entrar con esa cuenta | **Puede navegar**. El bloqueo no corre sin rol cargado: tratar "sin rol" como "sin acceso a nada" dejaría la cuenta inutilizable |
| Con el mismo rol limitado, entrar a `/onboarding` | Entra: las rutas previas al rol quedan libres a propósito |
| 🔒 Invocar una Server Action de Finanzas desde esa sesión (consola del navegador) | ⚠️ **Hoy responde.** El bloqueo cubre el render, no las actions — está anotado en `PENDIENTES.md` |

---

## Notas del cliente y comprobante opcional — 2026-09-06

**Estado:** las dos migraciones **ya están aplicadas**. Las columnas existen y
`storage_path` acepta null.

| Paso | Resultado esperado |
|------|--------------------|
| 🔴 Escribir una nota en la ficha de un cliente y guardar | Aparece "última edición" con la fecha de hoy. Es el primer paso que prueba que la Server Action escribe de verdad |
| Recargar la pantalla | La nota sigue ahí |
| ⭐ Anotar un estado en la **revisión semanal** del mismo cliente | La nota libre **no se pisa**: son dos campos distintos, y ese es el punto de haberlos separado |
| 🔴 Registrar un cobro **sin adjuntar comprobante** | Se guarda |
| Mirar la lista de pagos | El cobro dice "Sin comprobante" |
| ⭐ Registrar un cobro y quedarse en la pantalla | El monto aparece **sin recargar**. Si hay que recargar, `refreshClientPayments` no se está llamando |

---

## Volver atrás en todas las pantallas — 2026-09-06

**Cubierto por tests** (el test recorre las rutas en disco), pero la vuelta que
*tiene sentido* no la decide un test.

| Paso | Resultado esperado |
|------|--------------------|
| Recorrer las pantallas hondas: detalle de cliente, SOP, embudo, reporte ejecutivo | Todas tienen la vuelta arriba del título, y lleva al lugar del que se vino |
| ⭐ Fijarse si alguna vuelta lleva a una pantalla que no sirve | El test garantiza que existe y que no apunta a sí misma; que sea *la correcta* es criterio |

---

## Regla permanente para Claude Code

> Cada vez que construyas una unidad de integración o una feature que **no puedas
> verificar en el momento** (falta una cuenta, una credencial o la documentación):
>
> 1. Sumá su bloque a este documento, con pasos concretos y resultado esperado.
> 2. Marcá con ⚠️ los pasos con probabilidad alta de fallar, y por qué.
> 3. Marcá con 🔒 los que verifican seguridad — RLS, firmas, autorización de crons.
> 4. Marcá con ⭐ los que verifican una regla de diseño central, no sólo que ande.
> 5. Registrá también en `CHANGES.md` que la unidad quedó sin verificación real.

---

*Creado 2026-08-30. Documento vivo: crece con cada unidad construida y se tacha a
medida que se verifica.*
