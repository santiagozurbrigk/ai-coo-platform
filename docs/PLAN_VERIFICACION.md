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
