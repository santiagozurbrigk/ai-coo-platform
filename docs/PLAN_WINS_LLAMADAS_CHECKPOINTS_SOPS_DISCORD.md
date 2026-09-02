# Plan de desarrollo — Wins, Llamadas por cliente, Checkpoints, SOPs desde video y Bot de Discord

> Escrito el **2026-09-02** a partir de una lectura del repo, no de memoria.
> Cada sección dice **qué existe hoy** (con archivos y migraciones concretas),
> **qué falta**, **en qué orden construirlo** y **qué decisión queda abierta**.
>
> Leer junto con `CHANGES.md` (historial) y `PENDIENTES.md` (backlog).

---

## Resumen: cuánto hay construido de cada pedido

| Pedido | Estado real | Trabajo principal |
|---|---|---|
| **1. Tracker + Dashboard de Wins** | 🔴 No existe nada. Lo más cercano es `clients.is_success_case`, un booleano sin detalle | Módulo nuevo completo |
| **2. Llamadas de Fathom asociadas al cliente por mail** | 🟡 El 80% está construido y **apuntando a otro lado**: `calendar_invitees` ya se persiste con los mails, pero la asociación a cliente sigue siendo por título y el alcance se cerró a ventas el 2026-09-01 | Reabrir alcance + cambiar la regla de identidad |
| **3. Checkpoints configurables** | 🔴 No existe. `custom_metrics` y `metrics_snapshots` son **otra cosa** (KPIs de organización, no del cliente) | Módulo nuevo — y es el que desbloquea el campo "Fase" de Wins |
| **4. Creador de SOPs desde Loom + capturas** | 🟡 El creador existe y funciona desde texto. Whisper, ffmpeg, el bucket privado y el patrón de job asíncrono ya están en el repo por otras features | Entrada de video + capturas dentro del contenido |
| **5. Bot de Discord** | 🟢 **El bot está entero y no está desplegado.** Código, tablas, OAuth de instalación y UI: todo existe | Deploy (operación, no código) + conectarlo al tracking |

**El orden recomendado está al final**, porque hay una dependencia real entre el
punto 3 y el punto 1.

---

## 1. Tracker de Wins + Dashboard de Wins

### Qué existe hoy

Nada del tracker. Lo único adyacente:

| Pieza | Dónde | Qué aporta |
|---|---|---|
| `clients.is_success_case` / `status='success_case'` | `supabase/migrations/20260521100000_clients.sql` | Un booleano por cliente. No tiene fecha, ni logro, ni número |
| `discord_messages.is_testimonial` | `20260527100000_discord_bot.sql` | El bot ya marca mensajes como testimonio (ver §5) |
| `sop_attachments` + subida con signed URL | `20260719100000_sop_attachments.sql`, `app/sops/actions.ts:396` | **El patrón exacto** que hay que copiar para las capturas |
| `payment-receipt-dropzone.tsx` | `components/clients/` | El patrón de UI de subida de imagen |

### ⭐ El problema de diseño que hay que resolver primero

El tracker y el dashboard **no piden los mismos datos**:

| Tracker (por win) | Dashboard (por cliente) |
|---|---|
| Fecha, Cliente, Logro, Tipo, Fase, Captura, Dónde se usó | Nicho, **Punto inicial**, **Punto final**, **Plazo** |

Nicho, punto inicial, punto final y plazo **no salen de los wins tal como están
descritos**. Salen sólo si cada win puede llevar un **número comparable**.

La propuesta: un win puede tener, opcionalmente, una **medida** —clave, valor y
unidad—. Con eso:

- **Punto inicial** = el baseline cargado del cliente, o el valor más viejo de esa medida
- **Punto final** = el valor más reciente de esa medida
- **Plazo** = los días entre uno y otro
- **Nicho** = atributo del cliente (columna nueva: hoy sólo existe `organizations.industry`, que es el nicho *de la org*, no el del cliente)

Y la regla dura, coherente con el resto del repo: **si el cliente no tiene dos
puntos numéricos comparables, el dashboard dice "sin medir"**. No estima, no
interpola y no muestra una flecha verde sin datos que la sostengan.

### Modelo de datos

```
client_wins
  organization_id, client_id, win_date, achievement (texto),
  win_type, phase_id → client_journey_stages (ver §3), phase_label (respaldo),
  metric_key, metric_value, metric_unit,     ← opcional, es lo que hace posible el dashboard
  source ('manual' | 'discord' | 'fathom'), source_ref, notes

win_attachments        ← mismo patrón que sop_attachments (draft_id + storage_path)
  organization_id, win_id, draft_id, file_name, storage_path, mime_type, file_size

win_usages             ← "si se usó y en dónde"
  organization_id, win_id, channel ('landing'|'vsl'|'ad'|'story'|'dm'|'proposal'|'other'),
  location_label, url, used_at, notes

clients   + niche text
          + baseline_metric_key / baseline_metric_value / baseline_captured_at
```

**Por qué `win_usages` es una tabla y no dos columnas:** un caso bueno se usa en
varios lados, y la pregunta real del dashboard es *"¿dónde está usado este
caso?"*. Con `used boolean + used_where text` esa pregunta no se puede responder
sin leer texto libre.

**Bucket:** `client-wins`, privado, lectura por signed URL — igual que
`trial-reels` (`20260810120000_trial_reels_jobs.sql`). Las capturas de resultados
de clientes no van en un bucket público.

### Fases

| Fase | Entregable | Cómo se verifica |
|---|---|---|
| **W1** | Migración + acciones CRUD + tracker (tabla, alta con captura, filtros) en `/clients/wins` | Se carga un win a mano con captura y se ve en la lista |
| **W2** | Dashboard: agrupado por cliente, con nicho, punto inicial → final, plazo y usos | Un cliente con dos medidas muestra el recorrido; uno sin medidas dice "sin medir" |
| **W3** | Enganches: win desde testimonio de Discord (§5), win desde llamada (§2), sección de wins en la ficha del cliente | Un testimonio de Discord aparece como *candidato* y sólo se convierte en win cuando alguien lo acepta |

### Archivos a tocar

- `supabase/migrations/2026XXXX_client_wins.sql`
- `apps/web/lib/wins/derive-case.ts` — punto inicial/final/plazo. **Lógica pura, con tests** (`lib/wins/__tests__/`)
- `apps/web/app/clients/win-actions.ts` — CRUD + subida (copiar `prepareSopAttachmentUploadAction`)
- `apps/web/components/clients/wins/` — `wins-tracker.tsx`, `wins-dashboard.tsx`, `win-form-modal.tsx`
- `apps/web/routes/paths.ts` + `lib/navigation/sidebar-modules.ts`

### Decisión abierta

- **La lista real de "tipos de win".** Propuesta de arranque: `facturación`,
  `hito`, `testimonio`, `métrica`, `lanzamiento`, `mentalidad`, `otro`. Si la
  lista es de la organización y no fija, cuesta una tabla `win_types` más.
- **"Fase" depende de §3.** Ver el orden recomendado al final.

---

## 2. Panel de registro de llamadas (Fathom → cliente por mail)

### Qué existe hoy — más de lo que parece

| Pieza | Dónde | Estado |
|---|---|---|
| `fathom_calls.calendar_invitees` (jsonb con `email`, `is_external`, `email_domain`) | `20260901180000_fathom_classification.sql` | ✅ **Ya se persiste.** Es exactamente la señal que el pedido necesita |
| `parseFathomInvitees` / `normalizeEmail` / `allEmails` | `lib/fathom/invitees.ts` | ✅ Construido y comentado |
| `fathom_calls.client_id`, `fathom_url`, `summary`, `transcript`, `ai_situation_summary`, `ai_next_steps[]` | `20260522000000_phase11_integrations.sql` | ✅ Las columnas del pedido ya existen |
| `client_timeline_entries` con `entry_type='fathom_call'` | ídem | ✅ La tabla existe |
| `extractTranscriptPreview` | `lib/fathom/transcript-preview.ts` | ✅ El "preview" ya está resuelto |
| `client-linked-calls.tsx`, `client-call-analysis.tsx`, `pending-fathom-calls.tsx` | `components/clients/` | ✅ Hay UI |
| `counterparty` ('lead'\|'client'\|'internal') y `purpose` ('sales'\|'delivery'\|'team') | `20260901180000` | ⚠️ Existen pero **hoy sólo se escriben con 'lead' y 'sales'** |

### ⭐ Los dos problemas reales

**Problema 1 — la asociación a cliente se hace por título, y el título no sirve.**

`lib/fathom/client-matcher.ts` busca el nombre del cliente dentro del título con
Fuse.js. `docs/external-apis/fathom/RESUMEN-OTC.md` mide el resultado: **el 86%
de los títulos reales son "Impromptu Google Meet Meeting"** y la asociación
falla en el 100% de los casos —0 de 248 llamadas asociadas con 264 clientes
cargados—. El pedido de asociar **por mail** es exactamente la corrección, y el
dato ya está guardado.

**Problema 2 — el alcance se cerró a llamadas de venta hace un día.**

`20260901210000_sales_calls_only.sql` (2026-09-01) dice: *"OTC registra
únicamente llamadas de venta. Las llamadas de equipo y de entrega de servicio
quedan para más adelante."* Una llamada **con un cliente** es entrega, no venta.

Este pedido **reabre `counterparty='client'` / `purpose='delivery'`**, que es
justamente la puerta que esa migración dejó abierta a propósito. No hay que
deshacer nada del módulo de ventas: se **agrega una segunda regla de
resolución**, después de la de ventas.

### Cómo queda la regla de resolución

Una grabación de Fathom se resuelve en este orden, y el orden importa:

| # | Condición | Resultado |
|---|---|---|
| 1 | Algún invitado cruza con un **turno agendado** (mail + ventana horaria) | Llamada de **venta** — comportamiento actual, intacto |
| 2 | Algún invitado tiene un mail registrado como **mail de un cliente** | Llamada de **cliente**: `counterparty='client'`, `purpose='delivery'`, `client_id` |
| 3 | Ningún invitado externo | Interna — fuera de alcance, no es un error |
| 4 | Nada de lo anterior | Sin asociar → cola de revisión, con candidatos |

**Venta antes que cliente, deliberadamente:** un cliente que vuelve a una
llamada agendada es un upsell, y eso es una venta.

### La identidad del cliente necesita una tabla

`clients.email` es **un solo campo** (lo agregó la migración del bot de Discord)
y en la mayoría de las filas está vacío. Una persona usa más de un mail.

```
client_emails
  organization_id, client_id, email, is_primary, source
  unique (organization_id, lower(email))
```

Backfill: desde `clients.email` y desde `closing_calls.lead_email` del turno con
el que se cerró cada cliente.

**La regla es la misma que sostiene `sales_leads` (ver `CHANGES.md`, 2026-09-02):
la identidad es el mail, nunca el nombre.** El fuzzy por nombre y el cruce por
dominio de mail quedan como **candidatos para revisión manual**, jamás como
asociación automática — un dominio genérico como `gmail.com` uniría a todos los
clientes en uno.

### El "tema de la llamada" hay que generarlo

El pedido pide *fecha, tema, link de Fathom y próximos pasos*. Tres de los cuatro
ya están. El **tema** no puede salir del título por lo que dice el Problema 1:
hay que derivarlo del resumen con Haiku, una frase, y guardarlo en `ai_topic`.
Es barato (el resumen ya está generado) y es la diferencia entre un panel legible
y una lista de "Impromptu Google Meet Meeting".

### Fases

| Fase | Entregable | Cómo se verifica |
|---|---|---|
| **L1** | `client_emails` + backfill + resolución por mail. Sin UI nueva | **La medida es cuántas grabaciones quedan asociadas a un cliente.** Hoy son 0 |
| **L2** | Enriquecimiento de llamadas de cliente: tema con Haiku, preview, próximos pasos, escritura en `client_timeline_entries` | Una llamada de entrega aparece en el timeline con su tema y sus próximos pasos |
| **L3** | UI: panel de llamadas en la ficha del cliente, registro global, cola de revisión y vínculo manual | Se puede asociar a mano una llamada que no cruzó sola |

### Archivos a tocar

- `supabase/migrations/2026XXXX_client_emails.sql` (+ backfill, + `fathom_calls.ai_topic`)
- `lib/fathom/resolve-sales-call.ts` → generalizar a `resolve-call-subject.ts` (misma forma: IO afuera, decisión pura y testeada adentro, como `match-appointment.ts`)
- `lib/fathom/client-matcher.ts` → **degradar a sugerencia**, sacarlo del camino automático
- `lib/fathom/process-call.ts` — que el análisis corra también para `purpose='delivery'`
- `components/clients/client-calls-panel.tsx` (nuevo) y `components/integrations/unlinked-recordings-panel.tsx` (extender)

### Riesgos

- ⚠️ **Costo de IA.** Reabrir entrega significa analizar más llamadas con Sonnet. Mirar `token_usage` después de la primera semana.
- ⚠️ **Nada del módulo de llamadas está verificado contra una cuenta real de Fathom** (`PENDIENTES.md` → `[LLAMADAS-VERIFICAR-FATHOM]`). Este trabajo hereda ese riesgo entero: si `calendar_invitees` viniera vacío en las reuniones improvisadas, la regla nueva tampoco cruza. **Conviene verificar Fathom antes de construir L1**, es media hora y decide si el plan es correcto.

---

## 3. Checkpoints configurables

### Qué existe hoy

Nada con ese nombre. Y dos cosas que **se parecen y no lo son** — conviene
dejarlo escrito para que nadie las mezcle después:

| Existe | Qué es | Por qué no sirve acá |
|---|---|---|
| `custom_metrics` (`20260805120000`) | KPIs compuestos **de la organización** | No tiene cliente ni momento |
| `metrics_snapshots` (`20260825100000`) | Métricas **por período** de la org | Ídem |
| `clients.status` (4 valores fijos) | Estado grueso del negocio | Está hardcodeado en el check, en `lib/validations.ts` y en la UI. **No es configurable y no hay que hacerlo configurable** |

### ⭐ Qué es un checkpoint — la definición que propongo

*Un hito configurable por organización dentro del recorrido de un cliente que,
al alcanzarse, registra métricas y opcionalmente cambia el estado del cliente.*

```
client_journey_stages     ← las FASES. Es lo que el campo "Fase" de Wins referencia
  organization_id, name, sort_order, color

client_checkpoints        ← la DEFINICIÓN (el catálogo configurable)
  organization_id, stage_id, name, sort_order,
  sets_client_status,     ← opcional: al alcanzarlo, el cliente pasa a este status
  expected_days,          ← plazo esperado desde el checkpoint anterior
  metric_schema jsonb,    ← qué métricas pedir: [{key,label,type,unit,required}]
  product_id              ← nullable, para cuando el recorrido dependa del producto

client_checkpoint_events  ← lo que OCURRIÓ
  organization_id, client_id, checkpoint_id, reached_at,
  metrics jsonb, note, recorded_by,
  source ('manual'|'discord'|'fathom'|'automatic')

clients + current_stage_id   ← desnormalizado a propósito, para las listas
```

**Cómo convive con `clients.status`:** el status no se toca. Es el estado grueso
(pendiente / onboardeado / activo / caso de éxito). La fase es el recorrido
configurable. Un checkpoint puede *setear* el status si su definición lo dice —
así el usuario configura una vez y el estado se mantiene solo, que es la mitad
del pedido ("checkpoints para actualizar estado y métricas").

**El plazo (`expected_days`) es lo que hace útil el módulo:** un cliente cuyo
checkpoint actual venció está **trabado**, y ese es exactamente el criterio
`stalled` que ya se usa en el módulo de leads. Es la misma idea aplicada a
entrega.

**Nada se dispara solo.** Discord y Fathom producen **propuestas** de checkpoint,
que alguien acepta — mismo patrón que `fathom_task_proposals`
(`20260708120000`). Un checkpoint alcanzado es una afirmación sobre el negocio
del cliente; no la hace un heurístico.

### Fases

| Fase | Entregable | Cómo se verifica |
|---|---|---|
| **C1** | Catálogo (fases + checkpoints) + UI de configuración en `/clients/checkpoints` | Se configura un recorrido de 5 pasos. **Desbloquea el campo "Fase" de Wins** |
| **C2** | Registro de eventos, con formulario **generado desde `metric_schema`**, + stepper en la ficha del cliente | Registrar un checkpoint carga sus métricas y, si corresponde, mueve el status |
| **C3** | Derivados: fase actual en la lista de clientes, clientes trabados, propuestas automáticas desde §2 y §5 | Un cliente que pasó `expected_days` aparece marcado |

### Decisión abierta 🔴

- **¿El recorrido es igual para todos los clientes de la org, o depende del producto contratado?** (`clients.offered_product` ya existe, de `20260720100000`). La columna `product_id` la dejo nullable desde el día uno porque es barata; **la UI de v1 asume un solo recorrido por organización**. Si en realidad hay uno por producto, cambia la UI de configuración y el stepper.
- **Qué es "Fase" en el tracker de Wins:** asumo que es la fase del recorrido en la que estaba el cliente cuando ocurrió el win. Si es otra cosa (por ejemplo la fase del *lanzamiento*), cambia el modelo de Wins.

---

## 4. Creador de SOPs desde un Loom + capturas

### Qué existe hoy

| Pieza | Dónde | Estado |
|---|---|---|
| Creador desde texto (objetivo, departamento, resultado esperado, contexto) → Sonnet → markdown | `components/sops/sop-creator-form.tsx`, `lib/sops/generate-sop-prompt.ts`, `app/sops/actions.ts` | ✅ Funciona |
| `sop_attachments` con `draft_id`, subida por signed URL, borrado | `20260719100000` + `actions.ts:396-478` | ✅ Ya se pueden subir capturas… |
| …pero al prompt sólo le llegan **los nombres de archivo** | `sop-creator-form.tsx:73` (`attachmentContext`) | 🔴 **Las imágenes no entran al SOP** |
| Transcripción con Whisper (25 MB, español) | `app/api/agent/transcribe/route.ts` | ✅ Reutilizable |
| **ffmpeg ya instalado en `apps/web`** (`@ffmpeg-installer/ffmpeg`, `fluent-ffmpeg`) | `apps/web/package.json` | ✅ Está por Trial Reels |
| Patrón de job asíncrono con QStash + bucket privado + realtime | `20260810120000_trial_reels_jobs.sql`, `api/queue/process-reel-variations` | ✅ El molde exacto |
| `sop_versions` | `20260616300000` | ✅ El SOP generado desde video versiona igual |

O sea: **todas las piezas técnicas ya están en el repo**. Lo que falta es
conectarlas y resolver cuatro problemas concretos.

### ⭐ Los cuatro problemas

**1. Cómo llega el video.** Loom **no publica una API para bajar el video de un
share link**. Dos caminos:

- **A (el que hay que construir):** el usuario baja el mp4 desde Loom y lo sube. Cero fragilidad, cero problema de términos de uso.
- **B (comodidad, best-effort):** pegar el link de Loom e intentar resolver el archivo desde la página pública. Frágil y depende de que el video sea público. **No construir en v1.** Si se construye, tiene que fallar diciendo *"no se pudo, subí el archivo"* y no dejar el job colgado.

Según la **regla 3 de `CLAUDE.md`**, esto va anotado en
`docs/API_DOCS_PENDIENTES.md`: se implementa contra Loom sin documentación
oficial que respalde el camino B.

**2. El tamaño.** Whisper corta en 25 MB. Un Loom de 20 minutos en mp4 son
cientos de MB — pero el **audio** extraído a mp3 mono 16 kHz pesa ~1 MB por
minuto, o sea ~60 minutos por request. Entonces: ffmpeg extrae el audio, y si
igual supera el límite se corta por tiempo con un solape corto y se concatenan
las transcripciones. **El cálculo de los cortes es lógica pura y va con tests**
(`lib/sops/audio-chunks.ts`).

**3. El tiempo.** Esto no entra en un request de Vercel. Job asíncrono, igual
que los reels: tabla `sop_generation_jobs` (`pending → transcribing → generating
→ ready | failed`), disparo a `/api/queue/process-sop-video`, y la UI escucha
por realtime (el patrón ya está en `20260810200000_trial_reels_realtime.sql`).

**4. Dónde van las capturas dentro del SOP.** Hoy el modelo sólo ve nombres de
archivo, así que las imágenes nunca aparecen en el contenido. El diseño:

- Cada adjunto se presenta al modelo con un **id corto y estable**, y las imágenes se le mandan a Sonnet directamente (acepta imágenes). Con menos de ~10 capturas es más simple y da mejor resultado que describirlas primero.
- El prompt pide insertar `![texto alternativo](sop-attachment:<id>)` en el paso que corresponda, y **prohíbe inventar ids**: sólo puede usar los de la lista.
- Validación después de generar: **cualquier id que no exista se borra del markdown y se registra**. Nunca queda un link roto ni una imagen inventada.
- El visor (`sop-markdown-preview.tsx`, `sop-content-viewer.tsx`) resuelve `sop-attachment:<id>` a una signed URL en el momento de mostrar. **Se guarda el marcador, no la URL**: las signed URLs vencen, el marcador no.

### El prompt tiene que cambiar de naturaleza

Hoy el SOP se genera desde cuatro campos declarativos. Desde un Loom el input es
una transcripción hablada, desordenada y con muletillas. El prompt nuevo tiene
que hacer tres cosas que el actual no hace:

1. Extraer los pasos **en el orden en que se muestran** en el video.
2. **No inventar pasos que no se dijeron** — es el riesgo principal: un modelo al que le pedís un SOP completo rellena los huecos con lo que "debería" ir.
3. **Marcar explícitamente lo que el video no aclara** (*"el video no dice qué hacer si el pago falla"*). Eso es lo que separa un SOP útil de uno inventado, y le dice al usuario qué grabar de nuevo.

La transcripción va envuelta en `wrapUntrustedContent`, como el resto.

### Fases

| Fase | Entregable | Cómo se verifica |
|---|---|---|
| **S1** | Subida de video + job + extracción de audio + transcripción | El usuario sube un Loom y ve la transcripción. **Se verifica solo, sin generar nada** |
| **S2** | Generación del SOP desde la transcripción, con prompt nuevo, como un modo más del creador actual (sin romper el modo texto) | El SOP resultante refleja lo que se dijo y marca los huecos |
| **S3** | Capturas dentro del contenido: marcadores, validación de ids, resolución en el visor | La captura aparece en el paso correcto y sigue apareciendo una semana después (signed URL vencida y renovada) |

### Costo

Whisper cuesta US$0.006/minuto: un Loom de 20 minutos ≈ **US$0.12**. La
generación con Sonnet sobre esa transcripción son ~5k tokens de entrada.
⚠️ **Hoy `/api/agent/transcribe` no registra nada en `token_usage`** — hay que
agregarlo, o el costo de esta feature va a ser invisible.

---

## 5. Bot de Discord

### Qué existe hoy — casi todo

| Pieza | Dónde | Estado |
|---|---|---|
| Bot completo: gateway, mensajes, testimonios, vinculación, canales nuevos | `apps/discord-bot/src/` | ✅ Escrito y coherente |
| Tablas: `discord_integrations`, `discord_client_links`, `discord_messages`, `discord_pending_channels`, `discord_pending_links` | `20260527100000_discord_bot.sql` | ✅ Con RLS |
| **Instalación en un servidor con un click** (OAuth, scope `bot`, permisos 68608 = ver canal + escribir + leer historial) | `app/api/integrations/discord/oauth/start/route.ts` | ✅ Ya construido y con permisos mínimos correctos |
| UI de configuración y actividad por cliente | `components/integrations/discord-settings.tsx`, `components/clients/client-discord-activity.tsx` | ✅ |
| Detección de canal nuevo → el bot se presenta y pide `!vincular mail` | `src/events/channelCreate.ts`, `src/handlers/link-handler.ts` | ✅ |
| **Despliegue** | `apps/discord-bot/Dockerfile` existe; `OTC_OPERATIONAL_NOTES.md:159` dice *"debe estar desplegado"* | 🔴 **No está corriendo en ningún lado** |

### ⭐ Los tres hallazgos que definen el plan

**1. No hay forma serverless de hacer esto, y conviene saberlo antes de
investigar.** Los "webhooks" de Discord son **salientes** (mandan hacia Discord).
Para *recibir* todos los mensajes de un canal hace falta el **Gateway**, que es
un websocket persistente: un proceso corriendo 24/7. El endpoint de HTTP
Interactions sólo cubre slash commands y botones, no el flujo de mensajes. O sea:
**el bot como proceso separado no es una decisión de arquitectura que se pueda
revisar, es un requisito de la plataforma.** El repo ya lo resolvió bien.

**2. El intent `MESSAGE CONTENT` es privilegiado.** Sin activarlo en el portal de
Discord, el bot recibe los eventos con el contenido **vacío** y todo funciona
aparentemente bien mientras guarda mensajes en blanco. Se activa con un click
hasta 100 servidores; **a partir de 100 requiere verificación de Discord**, que
lleva tiempo. Hay que activarlo ya y anotar el techo.

**3. Lo que falta para "que el usuario pueda instalar el bot lo antes posible" es
operación, no código:** publicar la app de Discord, activar el intent, desplegar
el contenedor (Railway / Fly.io / Render) y setear `NEXT_PUBLIC_DISCORD_CLIENT_ID`.
**Se puede tener funcionando esta semana sin escribir una línea.**

### El detector de testimonios tiene un error que va a doler

`src/handlers/testimonial-handler.ts` marca como testimonio **todo mensaje en un
canal cuyo nombre contenga "win", "logro", "caso" o "resultado"** — sin mirar el
contenido. En un servidor con un canal `#wins`, cada "felicitaciones 🎉" queda
guardado como testimonio. Con el tracker de Wins conectado, eso es ruido directo
al módulo. Hay que reemplazar el heurístico por Haiku **por lote** (no por
mensaje: el costo por mensaje no cierra), y que produzca **candidatos**, no wins.

### Conectar el bot con el tracking del cliente

Que es el pedido real. Cuatro conexiones, en orden de valor:

| Conexión | Qué produce | Cómo |
|---|---|---|
| **Actividad** | Última vez que el cliente habló, mensajes por semana, y **la señal de silencio** (no habla hace N días) | Rollup sobre `discord_messages`. Es la de mayor valor y la más barata |
| **Testimonio → Win** | Candidato a win en el tracker de §1 | `is_testimonial` corregido → `client_wins` con `source='discord'`, **aceptado a mano** |
| **Mensaje → Checkpoint** | Propuesta de checkpoint alcanzado (§3) | Haiku por lote → propuesta, nunca evento directo |
| **Sentimiento / atención** | `ai_sentiment` y `requires_attention` | ⚠️ **Esas dos columnas existen desde el día uno y nadie las llena.** Están vacías en la UI hoy |

### Fases

| Fase | Entregable | Cómo se verifica |
|---|---|---|
| **D1** *(operación, arrancar ya)* | Intent activado, app publicada, contenedor desplegado, envs seteadas, bot instalado en un servidor real | **Hay mensajes reales en `discord_messages` con contenido no vacío** |
| **D2** | Rollup de actividad por cliente + señal de silencio en la ficha y en la lista | Un cliente que no habla hace 14 días aparece marcado |
| **D3** | Testimonio corregido → candidato a win; sentimiento y atención por lote; propuestas de checkpoint | Un `#wins` con 50 mensajes no genera 50 testimonios |

### Privacidad — hay que decidirlo, no dejarlo pasar

El bot **lee y persiste mensajes de personas que no son usuarios de OTC**. Hoy
guarda sólo canales monitoreados (bien) y el bot se presenta al crear un canal
(bien). Falta: una política de retención configurable y que quede escrito en
algún lado que el servidor está siendo registrado. No es una traba técnica, es
una decisión que conviene tomar antes de instalarlo en el servidor de un cliente.

---

## Orden recomendado

La única dependencia dura es que **el campo "Fase" del tracker de Wins necesita
el catálogo de fases de los Checkpoints**. Todo lo demás es independiente.

```
Semana 0   D1  Deploy del bot de Discord        ← operación, arranca ya y corre en paralelo
           +   Verificar Fathom con datos reales ← media hora, decide si §2 está bien planteado

Semana 1   C1  Catálogo de fases y checkpoints   ← chico, y desbloquea Wins
           W1  Tracker de wins

Semana 2   W2  Dashboard de wins                 ← acá ya hay valor entregado y visible
           L1  Llamadas: identidad por mail      ← la medida es "de 0 a N llamadas asociadas"

Semana 3   L2  Enriquecimiento de llamadas
           L3  Panel de llamadas en la ficha
           C2  Registro de checkpoints

Semana 4   D2  Actividad de Discord en el tracking
           C3  Derivados: fase actual, clientes trabados
           W3  Enganches de wins (Discord, llamadas)

Semana 5+  S1..S3  SOPs desde Loom               ← el más caro y el más independiente
           D3      Propuestas automáticas desde Discord
```

**Por qué D1 y la verificación de Fathom van primero:** los dos dependen de
terceros (Discord aprueba, Fathom tiene que tener datos reales) y los dos pueden
invalidar planes enteros. Si `calendar_invitees` viniera vacío, el plan de §2
cambia de raíz — y eso conviene saberlo antes de escribir el código, no después.

**Por qué Wins va temprano:** es el pedido más autocontenido, no depende de
ninguna integración externa y entrega valor visible solo.

**Por qué SOPs va último:** es el de mayor esfuerzo (job asíncrono, ffmpeg,
transcripción, prompt nuevo, marcadores de imagen), el que más depende de un
prompt bien calibrado, y el único cuyo valor no se degrada por esperar.

---

## Decisiones que necesito de Santiago

| # | Decisión | Por qué bloquea |
|---|---|---|
| 1 | **La lista real de "tipos de win"** | Define si es un enum o una tabla configurable |
| 2 | **Qué es "Fase" en un win** — ¿la fase del recorrido del cliente, o algo del lanzamiento? | Cambia el modelo de datos de Wins |
| 3 | **¿El recorrido de checkpoints es uno solo por organización, o uno por producto?** | Cambia la UI de configuración y el stepper |
| 4 | **¿Confirmás reabrir las llamadas de entrega?** Se cerraron el 2026-09-01 y este pedido las reabre | Es una vuelta atrás de una decisión de producto de hace un día |
| 5 | **¿Los Loom se suben como archivo, o hace falta que funcione con el link pegado?** | El link es frágil y hay que decidir si vale el riesgo |

Mientras no haya respuesta, el plan asume: (1) el enum propuesto, (2) fase del
recorrido del cliente, (3) uno por organización con la columna lista para
producto, (4) sí, se reabre entrega sin tocar ventas, (5) archivo subido.
