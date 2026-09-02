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
| **2. Llamadas de Fathom asignadas al cliente** | 🟡 Hay mucho construido y **apuntando a otro lado**: se clasifica por título. Fathom **no da ninguna señal declarativa**, pero OTC ya tiene la lista de clientes y de leads — y ahí está la respuesta | Resolver la contraparte y derivar el propósito de eso |
| **3. Checkpoints configurables** | 🔴 No existe. `custom_metrics` y `metrics_snapshots` son **otra cosa** (KPIs de organización, no del cliente) | Módulo nuevo — y es el que desbloquea el campo "Fase" de Wins |
| **4. Creador de SOPs desde Loom + capturas** | 🟡 El creador existe y funciona desde texto. Whisper, ffmpeg, el bucket privado y el patrón de job asíncrono ya están en el repo por otras features | Entrada de video + capturas dentro del contenido |
| **5. Bot de Discord** | 🟢 **El bot está entero y no está desplegado.** Código, tablas, OAuth de instalación y UI: todo existe | Deploy (operación, no código) + conectarlo al tracking |

**El orden recomendado está al final**, porque hay una dependencia real entre el
Encargo C y el Encargo A.

> ### 📌 Premisa que vale para los cinco encargos
>
> **Los datos históricos no importan** (decisión de Santiago, 2026-09-02). Las
> llamadas, los clientes y las métricas que hoy están en la base **no hay que
> migrarlas, recuperarlas ni arreglarlas**. Todo esto vale de hoy en adelante.
>
> Concretamente: **ninguna migración de este plan necesita backfill**, y el
> criterio de verificación de cada fase se mide **generando un dato nuevo a
> propósito**, no revisando lo viejo.

---

# 🎫 Reparto entre sesiones de Claude Code

> **Si estás leyendo esto como sesión asignada:** buscá tu encargo en la tabla,
> leé su ficha completa acá abajo y después la sección larga que le corresponde
> más adelante en este documento. **Leé también las "Reglas de convivencia" —
> hay cinco sesiones tocando el mismo repo al mismo tiempo.**

## Los cinco encargos

| Encargo | Nombre | Fases | Rama | Depende de | Aislamiento |
|---|---|---|---|---|---|
| **A** | `WINS` | W1 · W2 · W3 | `claude/wins-tracker` | **C1** (catálogo de fases) | Medio |
| **B** | `LLAMADAS` | **L0** · L1 · L2 · L3 | `claude/llamadas-cliente` | Verificar acceso de la key · decisión #4 | Alto |
| **C** | `CHECKPOINTS` | C1 · C2 · C3 | `claude/checkpoints-cliente` | Nada. **C1 desbloquea A** | Alto |
| **D** | `SOPS-VIDEO` | S1 · S2 · S3 | `claude/sops-desde-video` | Nada | **Total** — arrancá cuando quieras |
| **E** | `DISCORD` | D1 · D2 · D3 | `claude/discord-bot-produccion` | D3 depende de A y C | Alto (D1 y D2) |

**Para asignar una sesión, alcanza con decirle:**

> Leé `docs/PLAN_WINS_LLAMADAS_CHECKPOINTS_SOPS_DISCORD.md`. Sos el **Encargo A (`WINS`)**. Implementá sólo tus fases, respetá las reglas de convivencia y trabajá en tu rama.

Los prompts completos de arranque están al final de cada ficha.

---

## Ficha · ENCARGO A — `WINS`

**Rama:** `claude/wins-tracker` · **Bloque de migraciones:** `20260903 09 MM 00`

| | |
|---|---|
| **Hacé** | Tracker de wins (alta con captura), dashboard agrupado por cliente, enganches desde Discord y llamadas |
| **Archivos que son tuyos** | `apps/web/lib/wins/**` · `apps/web/app/clients/win-actions.ts` · `apps/web/components/clients/wins/**` · `apps/web/app/(platform)/clients/wins/**` · `apps/web/types/wins.ts` · tu migración |
| **Compartidos que vas a tocar** | `routes/paths.ts` · `lib/navigation/sidebar-modules.ts` · `components/clients/client-detail.tsx` · `clients` (columnas `niche`, `baseline_*`) |
| **NO toques** | `lib/fathom/**` (es de B) · `lib/checkpoints/**` (es de C) · `apps/discord-bot/**` (es de E) |
| **Dependencia** | El campo **Fase** necesita el catálogo del Encargo C. **Arrancá igual**: `phase_id` nullable + `phase_label` de respaldo. Cuando C1 esté mergeado, conectás la FK |
| **Decisiones que te bloquean** | #1 (tipos de win) y #2 (qué es "Fase"). Si no hay respuesta, aplicá el supuesto del final del documento y dejalo escrito |

**Prompt de arranque:**

```
Leé docs/PLAN_WINS_LLAMADAS_CHECKPOINTS_SOPS_DISCORD.md, CHANGES.md y PENDIENTES.md.
Sos el ENCARGO A (WINS). Implementá las fases W1 y W2 en la rama claude/wins-tracker,
partiendo de main actualizado. Respetá las reglas de convivencia del documento:
usá el bloque de migraciones 20260903 09MM 00, tocá los archivos compartidos al
final y en un commit aparte, y no abras PR. Empezá por W1.
```

---

## Ficha · ENCARGO B — `LLAMADAS`

**Rama:** `claude/llamadas-cliente` · **Bloque de migraciones:** `20260903 10 MM 00`

> ⚠️ **Rediseñado tres veces el 2026-09-02.** La idea central: **el propósito de
> una llamada lo define la otra persona**, no quién grabó ni de qué calendario
> salió. Cliente → entrega. Lead → venta.
>
> ⛔ **Fathom no permite etiquetar llamadas** (verificado). No hay ninguna señal
> declarativa del lado de Fathom: de Fathom salen hechos crudos, y toda la
> interpretación sale de lo que OTC ya sabe. Leé la sección larga completa antes
> de escribir una línea.

| | |
|---|---|
| **Hacé** | Resolver **quién es la contraparte** de cada grabación, derivar el propósito de eso, aprender el alias en cada confirmación manual, y el panel de llamadas en la ficha del cliente |
| **Archivos que son tuyos** | `apps/web/lib/fathom/**` · `apps/web/app/fathom/**` · `apps/web/components/integrations/fathom-mapping-panel.tsx` · `apps/web/components/integrations/unlinked-recordings-panel.tsx` · `apps/web/components/clients/client-calls-panel.tsx` · `apps/web/app/(platform)/clients/calls/**` · tu migración |
| **Compartidos que vas a tocar** | `components/clients/client-detail.tsx` · `routes/paths.ts` · `lib/ghl/sync-appointments.ts` y `lib/calendly/sync-events.ts` (sólo `calendar_provider` y `calendar_ref`) |
| **NO toques** | `lib/wins/**` (es de A) · `lib/checkpoints/**` (es de C) · `apps/discord-bot/**` (es de E) |
| **⚠️ Cuidado** | `lib/fathom/client-matcher.ts` lo usan otras pantallas. **Degradalo a candidato, no lo borres** sin revisar quién lo importa |
| **Sin backfill** | Los datos históricos **no importan**. Nada que migrar ni recuperar |
| **🔴 Antes de escribir código — dos verificaciones** | **(a)** ¿La API key ve las llamadas del closer, o están sin compartir? Si no las ve, **no existen para OTC**. **(b)** Grabá una llamada sin agendarla: ¿vienen `recorded_by`, `meeting_url` en `null` y los nombres de los hablantes? |
| **No pierdas tiempo con** | Los `meeting_type` de Fathom: **no se pueden etiquetar**, está verificado y descartado |
| **⭐ Empezá por L0** | Fathom ya entrega **próximos pasos con link al segundo**, resumen, momentos marcados y —lo más importante— **el vínculo entre nombre de pantalla y mail** (`matched_speaker_display_name`). OTC pide uno solo de los cuatro `include_`. Y 🐛 **el resumen nunca llega**: `default_summary` es un objeto y `pickString` devuelve null |
| **⭐ El alias se aprende solo** | Todo cliente fue lead, y su llamada de venta **sí estuvo agendada** → de ahí sale su nombre de pantalla gratis, y con eso se resuelven todas sus entregas futuras. **El lado de ventas le enseña al de entrega** |
| **Sembrá el alias desde el día uno** | `client_identities` arranca poblada con nombres, **apodos** y mails de `clients`, `sales_leads`, `closing_calls`, contactos de GHL y mails de comprador de los pagos |
| **Decisión que te bloquea** | #4 (confirmar el alcance de entrega). La #6 —"¿el founder también cierra?"— y la #8 —"revisá los tipos en Fathom"— **quedaron cerradas** |

**Prompt de arranque:**

```
Leé docs/PLAN_WINS_LLAMADAS_CHECKPOINTS_SOPS_DISCORD.md, CHANGES.md y PENDIENTES.md.
Sos el ENCARGO B (LLAMADAS). Leé completa la sección larga del Encargo B: se rediseñó
dos veces. La idea central es que el propósito de una llamada lo define la contraparte
(cliente → entrega, lead → venta), no quién grabó ni el calendario.

Ojo: Fathom NO permite etiquetar llamadas, está verificado — no hay señal declarativa
de Fathom y no pierdas tiempo ahí. Antes de escribir código hacé las dos verificaciones
que lista la ficha y decime los resultados: si la API key ve las llamadas del closer, y
qué trae el payload de una llamada grabada sin agendar.

Después implementá L0 (pedirle a Fathom todo lo que ya entrega y no estamos pidiendo,
y arreglar el bug del resumen) y seguí con L1 (resolver la contraparte), en la rama
claude/llamadas-cliente desde main actualizado. Sin backfill. Bloque de migraciones 20260903 10MM 00. Guardá
siempre resolution_method. No toques lib/wins, lib/checkpoints ni apps/discord-bot.
No abras PR.
```

---

## Ficha · ENCARGO C — `CHECKPOINTS`

**Rama:** `claude/checkpoints-cliente` · **Bloque de migraciones:** `20260903 08 MM 00`

| | |
|---|---|
| **Hacé** | Catálogo de fases y checkpoints configurables, registro de eventos con formulario dinámico, fase actual y clientes trabados |
| **Archivos que son tuyos** | `apps/web/lib/checkpoints/**` · `apps/web/app/clients/checkpoint-actions.ts` · `apps/web/components/clients/checkpoints/**` · `apps/web/app/(platform)/clients/checkpoints/**` · `apps/web/types/checkpoints.ts` · tu migración |
| **Compartidos que vas a tocar** | `components/clients/client-detail.tsx` · `routes/paths.ts` · `lib/navigation/sidebar-modules.ts` · `clients` (columna `current_stage_id`) |
| **NO toques** | `clients.status` ni su check ni `lib/validations.ts` — el status grueso **no se hace configurable**. Tampoco `lib/wins/**`, `lib/fathom/**` ni `apps/discord-bot/**` |
| **🔴 Prioridad** | **C1 (el catálogo) desbloquea al Encargo A.** Entregalo y mergealo antes de seguir con C2. Avisá cuando esté |
| **Decisión que te bloquea** | #3 — ¿un recorrido por organización o uno por producto? Dejá `product_id` nullable desde la migración igual |

**Prompt de arranque:**

```
Leé docs/PLAN_WINS_LLAMADAS_CHECKPOINTS_SOPS_DISCORD.md, CHANGES.md y PENDIENTES.md.
Sos el ENCARGO C (CHECKPOINTS). Empezá por C1, que es prioridad porque desbloquea al
Encargo A: catálogo de fases y checkpoints más su UI de configuración, en la rama
claude/checkpoints-cliente desde main actualizado. Usá el bloque de migraciones
20260903 08MM 00. No toques clients.status. Avisame cuando C1 esté listo para mergear
antes de seguir con C2. No abras PR.
```

---

## Ficha · ENCARGO D — `SOPS-VIDEO`

**Rama:** `claude/sops-desde-video` · **Bloque de migraciones:** `20260903 11 MM 00`

| | |
|---|---|
| **Hacé** | Subida de video, job asíncrono, extracción de audio y transcripción, generación del SOP desde la transcripción, capturas dentro del contenido |
| **Archivos que son tuyos** | `apps/web/lib/sops/**` · `apps/web/app/sops/actions.ts` · `apps/web/components/sops/**` · `apps/web/app/api/queue/process-sop-video/**` · `apps/web/app/api/agent/transcribe/route.ts` · `docs/API_DOCS_PENDIENTES.md` · tu migración |
| **Compartidos que vas a tocar** | Casi ninguno. **Sos el encargo más aislado** — podés arrancar cuando quieras sin coordinar |
| **NO toques** | Nada de clientes: `lib/wins/**`, `lib/fathom/**`, `lib/checkpoints/**`, `apps/discord-bot/**` |
| **Bug que te toca** | `/api/agent/transcribe` **no registra nada en `token_usage`**. Arreglalo en S1, porque el costo de esta feature depende de eso |
| **Obligación del CLAUDE.md** | Loom no publica documentación para bajar el video → entrada en `docs/API_DOCS_PENDIENTES.md` (regla 3) |
| **Decisión que te bloquea** | #5 — ¿archivo subido o link de Loom? El plan asume archivo. **Con eso alcanza para S1 y S2 completos** |

**Prompt de arranque:**

```
Leé docs/PLAN_WINS_LLAMADAS_CHECKPOINTS_SOPS_DISCORD.md, CHANGES.md y PENDIENTES.md.
Sos el ENCARGO D (SOPS-VIDEO). Implementá S1 en la rama claude/sops-desde-video desde
main actualizado: subida del archivo de video, job asíncrono, extracción de audio con
ffmpeg y transcripción, con el cálculo de cortes como lógica pura testeada. Arreglá de
paso que /api/agent/transcribe registre en token_usage. Usá el bloque de migraciones
20260903 11MM 00. No toques nada del módulo de clientes. No abras PR.
```

---

## Ficha · ENCARGO E — `DISCORD`

**Rama:** `claude/discord-bot-produccion` · **Bloque de migraciones:** `20260903 12 MM 00`

| | |
|---|---|
| **Hacé** | **D1 es operación, no código:** activar el intent, publicar la app, desplegar el contenedor, instalar el bot en un servidor real. Después: actividad del cliente, señal de silencio y propuestas |
| **Archivos que son tuyos** | `apps/discord-bot/**` · `apps/web/app/discord/actions.ts` · `apps/web/app/api/discord/**` · `apps/web/components/integrations/discord-settings.tsx` · `apps/web/components/clients/client-discord-activity.tsx` · tu migración |
| **Compartidos que vas a tocar** | `components/clients/client-detail.tsx` — **ya tenés tu sección ahí**, la modificás, no agregás una nueva |
| **NO toques** | `lib/wins/**` (es de A) · `lib/fathom/**` (es de B) · `lib/checkpoints/**` (es de C) |
| **Bugs que te tocan** | El detector de testimonios marca **todo mensaje de un canal `#wins`** como testimonio sin leer el contenido · `ai_sentiment` y `requires_attention` existen desde el día uno y nadie las llena |
| **Dependencia** | **D3 necesita que A y C existan** (no hay a dónde mandar una propuesta de win o de checkpoint). D1 y D2 no dependen de nadie |
| **Decisión pendiente** | Retención y aviso de que el servidor se registra — **antes de instalarlo en el servidor de un cliente**, no después |

**Prompt de arranque:**

```
Leé docs/PLAN_WINS_LLAMADAS_CHECKPOINTS_SOPS_DISCORD.md, CHANGES.md y PENDIENTES.md.
Sos el ENCARGO E (DISCORD). Empezá por D1, que es operación y no código: decime paso a
paso qué tengo que hacer yo (activar el intent MESSAGE CONTENT, publicar la app,
desplegar el contenedor, qué variables de entorno) y preparame lo que haga falta del
lado del repo para que eso funcione. Rama claude/discord-bot-produccion desde main
actualizado. Después seguimos con D2. No abras PR.
```

---

## Reglas de convivencia — leerlas antes de escribir código

Hay cinco sesiones sobre el mismo repo. Estas reglas existen para que el trabajo
de una no borre el de otra.

**1 · Una rama por encargo, siempre desde `main` actualizado.**
```bash
git fetch origin main
git checkout -B <tu-rama> origin/main
```
Nunca dos encargos en la misma rama. Nunca pushear a `main`. **No abrir PR sin
que Santiago lo pida** (regla 7 del `CLAUDE.md`).

**2 · Hay exactamente cinco archivos compartidos.** Tocalos **al final del
trabajo, en un commit propio y lo más chico posible**:

| Archivo | Quién lo toca | Cómo |
|---|---|---|
| `apps/web/routes/paths.ts` | A · B · C | Agregar tu ruta dentro del bloque `clients`, sin reordenar |
| `apps/web/lib/navigation/sidebar-modules.ts` | A · C | Agregar tu item, sin reordenar |
| `apps/web/components/clients/client-detail.tsx` | A · B · C · E | **Un import y una línea**, al final de las secciones existentes |
| `CHANGES.md` | Todos | Entrada al principio del historial, en el commit final |
| `PENDIENTES.md` | Todos | Ídem |

**3 · `client-detail.tsx` es el punto caliente.** Hoy tiene cuatro secciones
(pagos, llamadas vinculadas, Discord, timeline) y **cuatro encargos quieren
agregar la suya**. La regla: cada uno crea su componente en su propio archivo y
lo inserta con **un import y una línea**, sin mover ni reformatear lo que ya
está. Así, si hay conflicto, es de una línea y se resuelve en diez segundos.

**4 · Cada encargo tiene su bloque de timestamps de migración.** No elijas "la
hora actual": si dos sesiones lo hacen el mismo día, chocan. Usá tu bloque y
sumá minutos si necesitás más de una:

```
C · CHECKPOINTS   20260903 08 MM 00
A · WINS          20260903 09 MM 00
B · LLAMADAS      20260903 10 MM 00
D · SOPS-VIDEO    20260903 11 MM 00
E · DISCORD       20260903 12 MM 00
```

**5 · `CHANGES.md` y `PENDIENTES.md` van a dar conflicto, y está bien.** Los dos
se escriben al principio del archivo. Cuando pase: **quedarse con las dos
entradas**, nunca descartar la de otro encargo. Escribilas en el commit final de
tu rama, no al principio.

**6 · Si necesitás tocar código que es de otro encargo, no lo toques.** Anotalo
en `PENDIENTES.md` con el encargo dueño y decilo en tu respuesta. Es preferible
un pendiente explícito a dos sesiones editando el mismo archivo a ciegas.

**7 · Antes de terminar tu bloque:** `tsc --noEmit` y `pnpm test` en verde, la
lógica pura nueva de `lib/` con tests, `CHANGES.md` y `PENDIENTES.md`
actualizados, y la explicación en palabras simples (reglas 2, 5 y 6 del
`CLAUDE.md`).

---

## ENCARGO A · `WINS` — Tracker de Wins + Dashboard de Wins

### Qué existe hoy

Nada del tracker. Lo único adyacente:

| Pieza | Dónde | Qué aporta |
|---|---|---|
| `clients.is_success_case` / `status='success_case'` | `supabase/migrations/20260521100000_clients.sql` | Un booleano por cliente. No tiene fecha, ni logro, ni número |
| `discord_messages.is_testimonial` | `20260527100000_discord_bot.sql` | El bot ya marca mensajes como testimonio (ver Encargo E) |
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
  win_type, phase_id → client_journey_stages (ver Encargo C), phase_label (respaldo),
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
| **W3** | Enganches: win desde testimonio de Discord (Encargo E), win desde llamada (Encargo B), sección de wins en la ficha del cliente | Un testimonio de Discord aparece como *candidato* y sólo se convierte en win cuando alguien lo acepta |

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
- **"Fase" depende del Encargo C.** Ver el orden recomendado al final.

---

## ENCARGO B · `LLAMADAS` — Registro de llamadas por cliente

> ⚠️ **Rediseñado tres veces el 2026-09-02.** (1) Las llamadas de entrega casi
> nunca pasan por un calendario. (2) El closer también entrega, lo que tiró abajo
> el eje "quién grabó". (3) **Fathom no permite etiquetar llamadas** —verificado
> por Santiago—, así que no hay ninguna señal declarativa del lado de Fathom.
> Esta versión reemplaza a las tres anteriores. **Leela entera antes de escribir
> una línea.**

### El cuello de botella estaba mal planteado — incluso por este documento

Las dos versiones anteriores buscaban una señal que dijera *"esta llamada es de
venta"* o *"esta es de entrega"*: primero el calendario, después quién grabó. Las
dos fallan por la misma razón, y la corrección de Santiago la deja a la vista:

> *"El closer siempre cierra ventas, pero puede haber casos en que también
> entregue el servicio."*

**Ninguna propiedad de la llamada dice para qué era.** Ni el calendario —la
mayoría no pasa por uno—, ni quién grabó —la misma persona hace las dos cosas—,
ni el título —el 86% son "Impromptu Google Meet Meeting"—.

⭐ **Pero hay una propiedad que sí lo dice, y es la otra persona.**

| Con quién fue la llamada | Qué era |
|---|---|
| Con un **cliente** | Entrega |
| Con un **lead que todavía no compró** | Venta |
| Sólo con gente del equipo | Interna |

Eso disuelve el problema por completo: **quién grabó deja de importar.** El closer
con un cliente es entrega. El closer con un lead es venta. El founder con un
cliente es entrega. No hay que mapear personas a roles, ni calendarios a
propósitos, ni pedirle al usuario que cambie cómo trabaja.

**Y OTC está en una posición única para hacerlo**, porque ya tiene las dos listas:
`clients` y `sales_leads` — y `sales_leads.client_id` ya registra cuál lead se
convirtió en cuál cliente (`20260902100000_sales_leads.sql`). Fathom no puede
hacer esta clasificación: no sabe quiénes son tus clientes. **OTC sí.**

### Entonces el problema real es uno solo: ¿quién es la otra persona?

Y ese es un problema mucho más chico, porque:

- **Tu cartera de clientes es chica y estable.** Diez, treinta, cien personas que
  se repiten llamada tras llamada.
- **Los leads son muchos y siempre nuevos** — pero los leads **sí** vienen con
  mail, porque pasaron por una agenda para reservar el turno.

O sea: donde hay volumen (leads) hay mail, y donde no hay mail (entregas) hay
poca gente y se repite. Las dos mitades del problema tienen solución distinta y
las dos son tratables.

### Cómo se identifica a la otra persona

**Paso 0 · Sacar a los de casa.** La contraparte es el participante que **no** es
del equipo. Y hay un truco gratis para saber quiénes son del equipo:
`recorded_by` viene en **todas** las grabaciones y siempre es alguien de casa.
Después de unas pocas llamadas, OTC conoce los nombres de pantalla del equipo sin
preguntarle nada a nadie. Se completa con los `profiles` de la organización.

Acá `recorded_by` sí sirve — **para descartar internos y para atribuir la llamada
a un closer**, no para decidir el propósito.

**Paso 1 · Identificar a la contraparte,** de lo más fuerte a lo más débil:

| # | Señal | Fuerza | ¿Sirve sin calendario? |
|---|---|---|---|
| 1 | Mail de invitado externo ∈ identidades de un cliente o mail de un lead | Determinista | ❌ |
| 2 | ⭐ Nombre de hablante ∈ **alias aprendido** | Determinista. Y el alias **se aprende solo** de las llamadas que sí tuvieron calendario | ✅ |
| 3 | Nombre de hablante = nombre de cliente o lead (normalizado) | Alta, pero **candidato** | ✅ |
| 4 | Lo que la persona dice de sí misma en el transcript | Propuesta con motivo | ✅ |
| 5 | Nada | Cola de revisión | — |

**Paso 2 · El propósito sale de la contraparte,** sin más preguntas:

| Contraparte resuelta | `counterparty` | `purpose` |
|---|---|---|
| Cliente activo | `client` | `delivery` |
| Cliente **con un turno agendado que cruza** | `client` | `sales` — es un upsell |
| Lead que todavía no compró | `lead` | `sales` |
| Nadie externo | `internal` | `team` |

Las dos columnas ya existen y son separadas desde `20260901180000` — **ese
diseño era correcto y acá se aprovecha entero.** Un upsell es una llamada de
venta con un cliente, y el modelo puede decir las dos cosas a la vez en vez de
tener que elegir una y perder la otra.

**Paso 3 · Sólo si la contraparte no se resolvió,** en este orden:

1. **Cruce con un turno** cuyo calendario la organización declaró como de ventas.
   Esto es lo que resuelve el multicalendario.
2. **Leer el transcript con IA** (abajo).
3. Nada → cola de revisión.

> ⛔ **`meeting_type` está descartado.** Era el único campo declarativo por llamada
> que Fathom ofrece en su API, y **Santiago verificó que Fathom no permite
> etiquetar llamadas**. No hay `fathom_meeting_type_map` en este diseño: la que se
> dropeó el 2026-09-01 **se queda dropeada**.
>
> Que el diseño sobreviva a eso no es casualidad: se había asumido el peor caso a
> propósito, justamente para que la clasificación no dependiera de una señal que
> Fathom no garantiza.

**Paso 4 · La confirmación enseña.** Cada vez que alguien resuelve una llamada a
mano, **se guarda el alias del hablante**. Esa persona no se vuelve a preguntar
nunca. El trabajo manual arranca alto y **tiende a cero**.

### ⭐ Lo que la respuesta de Fathom ya trae y OTC no está pidiendo

Releyendo la respuesta completa de `GET /meetings` aparecieron cuatro cosas que
cambian el plan **para mejor**. Tres son datos gratis; la cuarta es un bug.

#### 1 · ⭐⭐ El alias se aprende solo — el hallazgo más importante del módulo

Cuando **sí** hubo evento de calendario, Fathom entrega el vínculo entre el
nombre de pantalla y el mail, **en las dos direcciones**:

```
calendar_invitees[].matched_speaker_display_name   ← "el mail X habla como 'Juan P.'"
transcript[].speaker.matched_calendar_invitee_email ← "el que dice llamarse 'Juan P.' es X"
```

Y acá se cierra el círculo, porque **todo cliente fue primero un lead, y la
llamada de venta de ese lead sí estuvo agendada**:

```
Llamada de VENTA  →  tiene calendario  →  tiene mail  →  se resuelve sola
                                      ↘
                        Fathom regala: "ese mail habla como 'Juan P.'"
                                      ↘
                              se guarda el alias
                                      ↘
Llamadas de ENTREGA  →  sin calendario, sin mail  →  se resuelven por el alias
```

**El lado de ventas —que ya funciona— le enseña al lado de entrega.** Sin que
nadie confirme nada.

Eso reduce muchísimo el trabajo manual que la versión anterior daba por
inevitable: la confirmación a mano queda para quien nunca tuvo una llamada
agendada y para las variantes raras del nombre. **No para cada cliente.**

⚠️ Dos condiciones de la documentación: `matched_speaker_display_name` sólo viene
con `include_transcript=true` —que OTC ya manda— y **sólo para reuniones
posteriores a feb-2025**. Las dos se cumplen.

#### 2 · Los próximos pasos ya vienen hechos, con link al segundo exacto

El pedido original decía *"próximos pasos hablados en la llamada"*. **Fathom ya
los entrega**, y con más de lo que OTC genera hoy con Claude:

| Campo | Qué aporta |
|---|---|
| `description` | El próximo paso, en texto |
| `user_generated` | ⭐ **Si lo escribió una persona o lo dedujo la IA de Fathom.** Un paso escrito por un humano es una declaración; uno de la IA es una inferencia — y **no hay que mostrarlos igual** |
| `completed` | Si ya se hizo |
| `recording_playback_url` + `recording_timestamp` | ⭐ **Link al segundo exacto de la grabación** donde se dijo |
| `assignee` (nombre, mail, equipo) | A quién le toca — y **un mail más para la tabla de identidades** |

Hoy OTC genera `ai_next_steps[]` mandándole el transcript a Claude. **Fathom ya lo
hizo, mejor y gratis.** La regla: los de Fathom son la fuente; la IA de OTC sólo
completa si vienen vacíos.

#### 3 · Fathom no etiqueta llamadas, pero sí etiqueta *momentos*

`highlights[].type` es **"the label of the bookmark this highlight was created
from"**. O sea: no se puede etiquetar la llamada, pero **sí marcar un momento con
una etiqueta**, y esa etiqueta llega por la API.

Hay un canal declarativo por llamada después de todo — vive en los momentos, no
en la llamada. En el ejemplo de la documentación la etiqueta es `"Objection"`, que
ya de por sí es una señal de venta.

**Vale la pena averiguar si las etiquetas de bookmark son personalizables en
Fathom.** Si lo son, un bookmark puesto durante la llamada sería una declaración
determinista.

⚠️ **Pero el diseño no puede depender de esto**, porque exige que alguien apriete
un botón en cada llamada. Es un **acelerador para los casos dudosos**, no la base.
Lo que sí hay que hacer siempre: **persistir `highlights` crudo**. No cuesta nada
y `summary` y `text` son entrada barata para el desempate por contenido — mucho
más barata que mandar el transcript entero.

#### 4 · 🐛 Bug: el resumen nunca llega

`lib/fathom/api.ts:326` hace:

```ts
summary: pickString(obj, ["summary", "ai_summary", "default_summary"])
```

Pero `default_summary` **no es un string**: es un objeto
`{ template_name, markdown_formatted }`. `pickString` devuelve `null`. Y encima
**OTC nunca pide `include_summary=true`**.

Resultado: **`fathom_calls.summary` está vacío**. Y de ahí cuelgan el "tema de la
llamada", el preview y el desempate por contenido — las tres features se apoyan en
un campo que no se está llenando. **Arreglarlo es parte de L1.**

#### Los cuatro `include_` son opcionales y OTC pide uno solo

| Parámetro | ¿Lo pide OTC? | Qué se pierde |
|---|---|---|
| `include_transcript` | ✅ Sí | — |
| `include_summary` | 🔴 No | El resumen — ver el bug de arriba |
| `include_action_items` | 🔴 No | **Los próximos pasos con link al segundo** |
| `include_highlights` | 🔴 No | Los momentos marcados y sus etiquetas |

Tres pedidos de datos gratis que hoy no se hacen.

#### ⚠️ Una trampa: `calendar_invitees_domains_type`

Es obligatorio y siempre trae valor (`only_internal` / `one_or_more_external`),
así que **parece** un detector de "¿había alguien de afuera?". No lo es: se calcula
sobre los invitados del calendario, y **sin calendario no hay invitados**. Una
llamada de entrega con un cliente, sin agenda, va a decir `only_internal`.

**Nunca usarlo como detector de externos.** Los externos se detectan por los
hablantes que no están en el roster del equipo.

#### Sobre `meeting_type`

El ejemplo de la documentación lo muestra poblado, pero Santiago verificó que
Fathom no permite etiquetar llamadas. **Se persiste el valor crudo igual** —ya se
parsea, cuesta cero— **y no se construye nada encima**. Si algún día llegara
poblado, es señal gratis; si no llega, no se pierde nada.

### ⭐ La asimetría que hace todo esto tratable

Sin ninguna etiqueta de Fathom, hay que apoyarse en cómo funciona el negocio. Y
ahí hay una asimetría que juega a favor:

| | Llamadas de **venta** | Llamadas de **entrega** |
|---|---|---|
| ¿Se agendan? | **Casi siempre** — el lead reserva un turno | Muchas veces no: se arman sobre la marcha |
| ¿Traen mail? | **Sí**, porque pasaron por la agenda | Muchas veces no |
| ¿Cuánta gente distinta? | Muchísima, y siempre nueva | Poca, y se repite |

O sea: **donde hay volumen hay mail, y donde no hay mail hay poca gente que se
repite.** Las dos mitades duras del problema no coinciden nunca.

De ahí sale la regla negativa, que es fuerte y no la habíamos escrito:

> **Una grabación que no cruza ningún turno agendado casi seguro no es una
> venta**, porque las ventas se agendan.

Con eso, la pregunta "¿venta o entrega?" prácticamente se responde sola, y **el
trabajo real que queda es sólo uno: decir con *qué cliente* fue.** Que es un
problema mucho más chico.

⚠️ **La excepción, y hay que preverla:** una venta improvisada —un lead que sale de
un DM y se sube a una llamada en el momento— no cruza ningún turno. Se cubre
igual, porque la contraparte va a resolver contra `sales_leads`: **contraparte que
es un lead conocido → venta, aunque no haya turno.**

### ⭐ El alias no arranca vacío: OTC ya sabe casi todo

La tabla de identidades **no se llena sólo con confirmaciones manuales**. Se
siembra de entrada con todo lo que OTC ya tiene de cada persona:

| Fuente | Qué aporta | Estado |
|---|---|---|
| `clients` | `name`, **`nickname`**, `email` | ✅ Existe |
| `sales_leads` | `name`, `email`, `phone`, `ghl_contact_id` | ✅ Existe (`20260902100000`) |
| `closing_calls` | `lead_name`, `lead_email` de cada turno | ✅ Existe |
| Contactos de GHL | nombre, mail y teléfono — `lib/ghl/sync-contacts.ts` | ✅ Existe |
| Pagos (Whop / Commas) | **`customerEmail`** del comprador — `lib/payments/normalize.ts` | ✅ Existe |
| Vínculos de Discord | nombre de pantalla ↔ cliente | 🔨 Encargo E |

**Ese es el reemplazo real de lo que Fathom no da.** En vez de pedirle a un
proveedor que declare algo, OTC usa lo que ya sabe: el día que se enciende, la
tabla de identidades ya tiene el nombre, el apodo y el mail de cada cliente y de
cada lead. La confirmación manual queda para las variantes raras —"iPhone de
Juan"—, no para todo el mundo.

**Ojo con una asimetría de los nombres:** `nickname` es exactamente el tipo de
dato que hace match con un nombre de pantalla de Zoom, y hoy no lo usa nadie.

### El desempate por contenido: lo que la IA puede y lo que no

Una llamada de venta y una de entrega **no se parecen en nada**. La de venta
tiene descubrimiento, objeciones, precio y cierre. La de entrega tiene revisión
de avances, "cómo te fue esta semana" y próximos pasos. Un modelo leyendo los
primeros minutos del transcript distingue eso con mucha más precisión que
cualquier heurística de metadatos.

**Pero la IA acá tiene un lugar preciso, y hay que respetarlo:**

- ✅ Actúa **sólo** cuando la identidad no se resolvió. Nunca pisa una señal determinista.
- ✅ Produce una **propuesta con su motivo**, no un hecho.
- ✅ Su salida se confirma con un click — y esa confirmación **enseña el alias**.
- ❌ **Nunca** decide sola que una llamada es de venta y la mete en las métricas de ventas.

La diferencia importa: si la IA decidiera sola, un error suyo contaminaría el
tablero de ventas en silencio. Como propuesta, su peor error cuesta un click.

Ese es el rol honesto de la IA en este módulo: **no decidir, sino convertir la
confirmación del humano en un click en vez de una búsqueda.**

### Medir por qué peldaño se resolvió cada llamada

Cada llamada guarda **cuál regla la resolvió** (`resolution_method`). Sin eso, en
dos semanas nadie va a saber si el módulo funciona porque el alias aprendido está
haciendo el trabajo o porque la IA está tapando un problema de configuración.

Con eso, el panel responde en una tabla: cuántas por mail, cuántas por alias,
cuántas por tipo de reunión, cuántas por IA, cuántas a mano. **Eso dice dónde
invertir**, en vez de adivinar.

### ⛔ Cerrado: Fathom no aporta ninguna señal declarativa

`meeting_type` era la única vía por la que Fathom podía decir para qué era una
llamada, y **Santiago verificó que no se pueden etiquetar las llamadas**
(2026-09-02). Queda descartada y no hay que volver sobre ella.

**Consecuencia de diseño, y es la más importante del módulo:** OTC **no depende
de ningún dato declarativo de Fathom**. De Fathom sólo se usan hechos crudos —
quién grabó, quiénes hablaron, si hubo evento de calendario, qué se dijo — y toda
la interpretación sale de lo que OTC ya sabe de su propio negocio.

### 🔴 El hallazgo operativo que sí sigue abierto: la API key de Fathom es por persona

Del FAQ oficial: *"API keys are per user, not per org, and there are no org-level
keys."* Una key sólo ve **lo que esa persona grabó o lo que le compartieron**.

**Si el closer graba en su cuenta y no comparte, OTC no ve esas llamadas.** No es
que las clasifique mal: no existen para el sistema.

Hay dos salidas y las dos son de configuración, no de código:
1. Que un **admin de Fathom** tenga acceso a todas las llamadas compartidas, y usar su key.
2. Que **cada miembro conecte su propia key** — y esto **ya está construido en OTC**: `app/fathom/member-actions.ts` tiene `connectMemberFathomAction` y `syncMemberFathomAction`.

La opción 2 además da algo mejor que `recorded_by`: sabés **qué perfil de OTC**
grabó cada llamada, sin tener que casar mails.

### Modelo de datos

```
client_identities              ← ⭐ el alias aprendido
  organization_id, client_id,
  kind ('email' | 'speaker_name' | 'domain'),
  value, confirmed_by, confirmed_at, source
  unique (organization_id, kind, lower(value))
  -- Sirve igual para leads: se agrega lead_id nullable, excluyentes entre sí

team_speaker_names             ← el roster interno, auto-alimentado por recorded_by
  organization_id, display_name, email, profile_id, source ('recorded_by'|'profile'|'manual')

calendar_purpose_map           ← el multicalendario. Su único trabajo: que un turno
  organization_id,               del calendario de entrega del founder NO cuente
  provider ('ghl'|'calendly'),   como evidencia de venta
  calendar_ref, label, purpose

closing_calls  + calendar_provider, + calendar_ref
  ↑ `ghl_calendar_id` YA existe y YA se llena. Falta el equivalente de Calendly
    y una llave única para que el mapa tenga una sola clave

fathom_calls   + recorded_by_email, + recorded_by_name
               + had_calendar_event   (derivado de meeting_url === null)
               + speaker_names text[]
               + counterpart_client_id, + counterpart_lead_id
               + resolution_method     ⭐ por qué peldaño se resolvió
               + ai_topic
               + action_items jsonb    ⭐ nativos de Fathom, con user_generated y
                                         recording_playback_url al segundo exacto
               + highlights jsonb      ⭐ momentos marcados y su etiqueta de bookmark
```

**Dos tablas de versiones anteriores desaparecieron del diseño.**
`fathom_user_roles` —el propósito no sale de quién grabó— y
`fathom_meeting_type_map` —Fathom no permite etiquetar—. **Ninguna de las dos hace
falta**, y eso es la mejor señal de que el diseño quedó apoyado donde
corresponde: en lo que OTC sabe de su propio negocio, no en lo que un proveedor
quiera declarar.

### Fases

| Fase | Entregable | Cómo se verifica |
|---|---|---|
| **L0** | **Pedir lo que ya está disponible.** Sumar `include_summary`, `include_action_items` e `include_highlights`; arreglar el bug del resumen; parsear `recorded_by`, `meeting_url`, `action_items`, `highlights` y los dos campos `matched_*` | Una grabación nueva llega con resumen, próximos pasos con link al segundo, y el vínculo nombre↔mail de cada participante |
| **L1** | **La contraparte.** Roster interno auto-alimentado; `client_identities` **sembrada** desde clientes, leads, contactos de GHL y pagos, y **auto-aprendida** desde `matched_speaker_display_name`; resolución por mail y por alias; `resolution_method` | Grabá una llamada con un cliente **sin agendarla**. Tiene que quedar `counterparty='client'`, `purpose='delivery'` **sin que nadie haya confirmado nada antes**, y decir por qué |
| **L2** | **El aprendizaje.** Cola de revisión que al confirmar **guarda el alias**; propuesta de la IA leyendo el transcript; mapa de propósito por calendario | Confirmá un cliente una vez. **La segunda grabación con ese hablante se resuelve sola**, y `resolution_method` dice `alias` |
| **L3** | **El registro.** Tema con Haiku, preview, **próximos pasos nativos de Fathom con su link al segundo** —distinguiendo los escritos por una persona de los deducidos por IA—, panel en la ficha, timeline y el tablero de `resolution_method` | Una entrega aparece en la ficha con fecha, tema, link y próximos pasos clickeables al momento exacto |

### Archivos a tocar

- `supabase/migrations/20260903 10MM 00_*.sql` — **sin backfill**: los datos viejos no importan
- `lib/fathom/api.ts` — 🐛 **arreglar el resumen** (`default_summary` es un objeto, no un string) · sumar `include_summary`, `include_action_items` e `include_highlights` · **parsear `recorded_by`, `action_items`, `highlights` y los dos campos `matched_*`** · `meeting_url` como bandera de "sin agenda"
- `lib/fathom/resolve-counterpart.ts` (nuevo) — pasos 0 y 1. **Puro y con tests**
- `lib/fathom/resolve-purpose.ts` (nuevo) — pasos 2 y 3. **Puro y con tests**
- `lib/fathom/classify-from-transcript.ts` (nuevo) — la propuesta de la IA, aislada
- `lib/fathom/resolve-sales-call.ts` — queda como un caso del paso 3, no el punto de entrada
- `lib/fathom/client-matcher.ts` — **degradar a candidato.** Revisá quién lo importa antes de tocarlo
- `lib/ghl/sync-appointments.ts` y `lib/calendly/sync-events.ts` — escribir `calendar_provider` y `calendar_ref`
- `components/integrations/fathom-mapping-panel.tsx` (nuevo)
- `components/integrations/unlinked-recordings-panel.tsx` — la cola que **enseña**
- `components/clients/client-calls-panel.tsx` (nuevo)

### Riesgos

- 🔴 **La API key es por persona.** Si las llamadas del closer no están compartidas, **no existen para OTC**. Verificar antes que nada.
- ⚠️ **`recorded_by` no está probado contra la cuenta real.** Está en el `required` del schema, pero el roster interno se apoya en eso.
- ⚠️ **Los nombres de pantalla son inestables:** "Juan", "Juan P.", "iPhone de Juan". Por eso el alias es una tabla con varias filas por persona: **cada variante confirmada se suma**, no reemplaza.
- ⚠️ **Un cliente que vuelve como lead a otra oferta** existe y el modelo lo soporta (upsell), pero conviene mirar los primeros casos reales antes de confiar en la regla.
- ⚠️ **Costo de IA:** el desempate por transcript corre sólo sobre las no resueltas. Si esa proporción no baja con el tiempo, algo está mal configurado — y `resolution_method` es lo que lo va a mostrar.
- 🐛 **`fathom_calls.summary` está vacío hoy** por el bug de `pickString` sobre `default_summary` más el `include_summary` que no se pide. Tres features cuelgan de ese campo. Es lo primero de L0.
- ⚠️ **El auto-aprendizaje del alias sólo cubre a quien tuvo alguna llamada agendada.** Un cliente que nunca pasó por una agenda —heredado, o cerrado por DM— sigue necesitando una confirmación manual. Son pocos, pero existen.
- ⚠️ **Una venta improvisada sin turno** se apoya enteramente en que el lead ya esté en `sales_leads`. Si un lead llega por un canal que OTC no sincroniza, esa llamada va a la cola de revisión. Es correcto que vaya: es preferible preguntar antes que meter una venta inventada en el tablero.

## ENCARGO C · `CHECKPOINTS` — Checkpoints configurables

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
| **C3** | Derivados: fase actual en la lista de clientes, clientes trabados, propuestas automáticas desde los encargos B y E | Un cliente que pasó `expected_days` aparece marcado |

### Decisión abierta 🔴

- **¿El recorrido es igual para todos los clientes de la org, o depende del producto contratado?** (`clients.offered_product` ya existe, de `20260720100000`). La columna `product_id` la dejo nullable desde el día uno porque es barata; **la UI de v1 asume un solo recorrido por organización**. Si en realidad hay uno por producto, cambia la UI de configuración y el stepper.
- **Qué es "Fase" en el tracker de Wins:** asumo que es la fase del recorrido en la que estaba el cliente cuando ocurrió el win. Si es otra cosa (por ejemplo la fase del *lanzamiento*), cambia el modelo de Wins.

---

## ENCARGO D · `SOPS-VIDEO` — Creador de SOPs desde un Loom + capturas

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

## ENCARGO E · `DISCORD` — Bot de Discord

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
| **Testimonio → Win** | Candidato a win en el tracker del Encargo A | `is_testimonial` corregido → `client_wins` con `source='discord'`, **aceptado a mano** |
| **Mensaje → Checkpoint** | Propuesta de checkpoint alcanzado (Encargo C) | Haiku por lote → propuesta, nunca evento directo |
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

Con las cinco sesiones en paralelo, **cuatro de los cinco encargos pueden
arrancar hoy mismo**. Sólo hay dos compuertas reales.

```
ARRANCAN YA, sin esperar a nadie

  D · SOPS-VIDEO   →  S1   El más aislado del repo. No coordina con nadie
  C · CHECKPOINTS  →  C1   Prioridad: es lo que desbloquea a WINS
  E · DISCORD      →  D1   Operación pura. Depende de terceros, por eso va primero
  A · WINS         →  W1   Arranca con phase_id nullable; conecta la FK cuando C1 mergee

ESPERA UNA CONFIRMACIÓN

  B · LLAMADAS     →  L0   🔴 Necesita la decisión #4 y verificar el acceso de la key

────────────── las dos únicas compuertas ──────────────

  C1 mergeado   ──▶  A conecta la FK de fase (W1 cierra)
  A y C listos  ──▶  E puede hacer D3 (propuestas de win y de checkpoint)
```

**Por qué D1 y la llamada de prueba de Fathom van primero:** los dos dependen de
algo externo, y los dos pueden invalidar planes enteros. Todo el Encargo B se
apoya en que Fathom devuelva `recorded_by` en cada grabación; si no viniera, el
plan cambia de raíz. Y ahora verificarlo es barato: **grabás una llamada sin
agendarla y mirás el payload crudo** — no hace falta esperar a que se acumulen
datos, porque los viejos no cuentan.

**Por qué C1 es la primera prioridad de código:** es chico y es la única
dependencia dura del plan. Cuanto antes mergee, antes deja de estorbar al
Encargo A.

**Por qué Wins va temprano:** es el pedido más autocontenido, no depende de
ninguna integración externa y entrega valor visible solo.

**Por qué SOPs puede arrancar sin coordinar:** es el de mayor esfuerzo (job
asíncrono, ffmpeg, transcripción, prompt nuevo, marcadores de imagen), pero no
comparte un solo archivo con los otros cuatro. Es el encargo ideal para la sesión
que quieras dejar corriendo sola.

---

## Decisiones que necesito de Santiago

| # | Decisión | Bloquea a | Por qué |
|---|---|---|---|
| 1 | **La lista real de "tipos de win"** | **A** | Define si es un enum o una tabla configurable |
| 2 | **Qué es "Fase" en un win** — ¿la fase del recorrido del cliente, o algo del lanzamiento? | **A** | Cambia el modelo de datos de Wins |
| 3 | **¿El recorrido de checkpoints es uno solo por organización, o uno por producto?** | **C** | Cambia la UI de configuración y el stepper |
| 4 | **¿Confirmás reabrir las llamadas de entrega?** Se cerraron el 2026-09-01 y este pedido las reabre | **B** | Es una vuelta atrás de una decisión de producto de hace días |
| 5 | **¿Los Loom se suben como archivo, o hace falta que funcione con el link pegado?** | **D** | El link es frágil y hay que decidir si vale el riesgo |
| ~~6~~ | ~~¿Vos también cerrás ventas?~~ **Disuelta por el rediseño** | — | El propósito ya no depende de quién grabó, así que la pregunta dejó de importar |
| 7 | **¿Estás dispuesto a confirmar a mano la contraparte en algunos casos?** | **B** | **Muy aliviada:** el alias se auto-aprende de las llamadas agendadas, así que sólo quedan los clientes que nunca pasaron por una agenda y las variantes raras de nombre |
| ~~8~~ | ~~¿Podés revisar cómo se asignan los tipos de reunión?~~ **Respondida: Fathom no permite etiquetar llamadas** | — | Descartada como señal. El diseño ya asumía el peor caso, así que no cambia nada |

Mientras no haya respuesta, el plan asume: (1) el enum propuesto, (2) fase del
recorrido del cliente, (3) uno por organización con la columna lista para
producto, (4) sí, se reabre entrega sin tocar ventas, (5) archivo subido,
(6) disuelta, (7) sí, pero son pocos casos porque el alias se auto-aprende, (8)
cerrada — Fathom no etiqueta, y el diseño no la necesitaba.
