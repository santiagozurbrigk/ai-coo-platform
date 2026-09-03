# CHANGES.md — Registro de cambios del monorepo Limitless

> **Para Claude Code y cualquier asistente IA que trabaje en este repo:**
>
> **OBLIGATORIO — leer este archivo al inicio de cada sesión** que involucre cambios al código.  
> **OBLIGATORIO — actualizar este archivo al final de cada sesión** (o después de cada bloque de cambios significativo).
>
> El formato de cada entrada está documentado en la sección [Formato de entrada](#formato-de-entrada).  
> No omitir este paso aunque el cambio parezca pequeño — la continuidad del contexto depende de esto.

---

## Historial de cambios

---

### 2026-09-03 — Seguimiento en tabla, con valores propios de cada organización

**Rama/branch:** `claude/seguimientos-tabla-closing-u6arke`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/sales/follow-up-options.ts` (nuevo), `app/sales/follow-up-options-actions.ts` (nuevo), `components/closing/{leads-table,lead-detail-drawer,follow-up-option-picker,manage-follow-up-options-dialog}.tsx` (nuevos), `components/closing/lead-follow-up-panel.tsx` (eliminado), `supabase/migrations/20260903120000_sales_follow_up_options.sql` (nueva), `lib/sales/lead-thread.ts`, `app/sales/lead-actions.ts`, `components/closing/closing-overview.tsx`, `app/(platform)/sales/closing/page.tsx`

**Qué se hizo:**

La pestaña **Seguimiento** del panel de closing pasa de acordeón a tabla editable
tipo Airtable, y el vocabulario del seguimiento deja de estar cerrado.

**⭐ La tabla, en vez del acordeón.** Editar un lead costaba tres clicks —abrir la
fila, elegir el botón, guardar— y nunca se podían mirar dos leads a la vez. Ahora
son nueve columnas y cada celda se edita en el lugar, guardando sola:
calificación, próximo paso, fecha, responsable y notas. El historial de intentos
se mudó a un panel lateral que se abre con el nombre del lead: dejó de ocupar la
vista principal, pero no se perdió.

**⭐ Se ven todos los leads, no sólo los que arden.** El panel anterior listaba
únicamente los tres estados accionables, con `limit 100`. Los ganados, perdidos y
agendados —la enorme mayoría de los 964 leads de hoy— no aparecían en **ninguna**
pantalla. El toggle *Pendientes / Todos* abre la base completa, con filtro por
estado, buscador, orden y paginado.

**⭐ El estado se sigue derivando, y ahora también en el cliente.** La columna
Estado no se edita. Al cambiar una celda, la fila se recalcula con el mismo
`buildLeadThread` que usa el servidor —es puro— así que el estado se mueve en el
acto sin persistir nada derivado y sin esperar un round-trip.

**⭐ Valores propios de seguimiento.** El próximo paso y la calificación eran
listas cerradas por partida doble: constantes de TypeScript **y** un CHECK en
Postgres. Agregar "Esperando pago" pedía migración y deploy, así que esa
información terminaba en las notas, donde no se puede filtrar ni contar. Ahora
cada organización crea los suyos desde el propio selector de la tabla.

| | |
|---|---|
| Tabla nueva | `sales_follow_up_options` (org, kind, slug, label, color, behavior, sort_order, archived_at) |
| CHECK dados de baja | `closing_calls_next_action_check`, `closing_calls_pre_call_qualification_check`, `closing_calls_post_call_qualification_check` |
| Validación | pasa a la Server Action, contra `built-ins ∪ opciones de la org` |

**Decisiones de diseño relevantes:**

- **Un valor no es una etiqueta: tiene consecuencia.** `lost` cierra el hilo y
  todo lo demás exige fecha. Si un valor propio fuera texto libre, el motor de
  estados no sabría qué hacer con él. Por eso cada valor **declara su
  comportamiento** al crearse (`needs_date` o `closes_thread`), y el motor pregunta
  por el comportamiento en vez de comparar contra el string `lost`. Un valor
  propio que cierra el hilo cierra igual que el de fábrica.
- **Los valores de fábrica no se siembran en la base.** Viven en el código, como
  en `knowledge_base_categories`: no hay que backfillear cada organización, una
  organización nueva ya tiene vocabulario, y borrar filas no puede dejar a nadie
  sin próximo paso posible. Un valor propio tampoco puede pisar a uno de fábrica
  —si pudiera, alguien podría hacer que `lost` deje de cerrar y los leads perdidos
  volverían a la cola para siempre.
- **Se archiva, no se borra.** Hay turnos apuntando al slug: borrarlo vaciaría ese
  dato en silencio. Archivado desaparece del selector y las filas viejas lo siguen
  mostrando, tachado. Misma regla de siempre: lo que no se entiende se marca, no
  se blanquea.
- **Un slug desconocido pide fecha.** Es la respuesta prudente: si el valor se
  archivó o se perdió, exigir la fecha mantiene al lead en la cola en vez de
  dejarlo caer sin que nadie se entere.
- **Cambiar el próximo paso no pisa el responsable ni la nota.** Sólo se tocan si
  vienen explícitos en la llamada; borrar el paso sí los limpia, porque le
  pertenecen.
- **Elegir un paso que pide fecha sin tenerla la pone en pasado mañana** en vez de
  bloquear el guardado. Un paso sin fecha nunca vence y por lo tanto nunca vuelve
  a la cola; la celda de al lado queda lista para corregirla.
- **Se completó `next_action_owner_id`**, que existía en la base y en la acción
  desde la Fase 2 pero no tenía UI: era un pendiente anotado en `PENDIENTES.md`.
- **El índice de la cola dejó de excluir `'lost'` por nombre** y ahora excluye lo
  que no tiene fecha — que es la condición real, y cubre a cualquier valor propio
  que cierre el hilo.

**Riesgos / deuda técnica pendiente:**

- **Techo de 2.000 leads.** El estado se deriva en JS, no en SQL, así que filtrar y
  paginar por estado se resuelve en memoria en el servidor. Con 964 leads sobra;
  pasado el techo la tabla avisa que hay leads afuera en vez de mostrarse
  incompleta. El día que no alcance, hay que derivar el estado en la base.
- **Nada se vio renderizado**: la sesión no corrió la app ni tiene Playwright en
  esta pantalla. El bloque de verificación quedó en `docs/PLAN_VERIFICACION.md` §14.
- **La migración se aplicó y se verificó** en Supabase el 2026-09-03: tabla creada
  con RLS, 0 CHECK restantes en `closing_calls`, índice de la cola recreado, y los
  1.139 turnos y 964 leads existentes intactos.
- **La calificación previa** (`pre_call_qualification`) sigue sin exponerse: la
  tabla sólo edita la posterior.

**Verificación:** `tsc --noEmit` limpio, `pnpm build` OK, **595 tests en verde**
(18 nuevos: 13 del catálogo de valores y 5 del motor de estados con valores
propios).

---

### 2026-09-02 — Llamadas Fase 2: seguimiento del lead

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/sales/{lead-thread,resolve-lead}.ts` (nuevos), `app/sales/lead-actions.ts` (nuevo), `components/closing/lead-follow-up-panel.tsx` (nuevo), `supabase/migrations/20260902100000_sales_leads.sql` (nueva), `lib/{ghl/sync-appointments,calendly/sync-events}.ts`, `providers/platform-data-provider.tsx`, `components/closing/closing-overview.tsx`

**Qué se hizo:**

Cierra el pedido original: poder seguir a cada lead cuando la llamada no termina
en venta.

**⭐ El lead como entidad.** Cada turno era una fila suelta: un lead con siete
turnos en dos días eran siete filas sin relación entre sí. La tabla `sales_leads`
los hila. La identidad es el **mail**, con el contacto de GHL como respaldo —
**nunca el nombre**: los nombres de la base vienen con emojis y espacios dobles,
y fusionar dos personas por un nombre parecido es peor que dejarlas separadas.
Un turno sin identidad estable no genera lead y queda suelto hasta que un sync se
la complete.

La migración hiló los turnos existentes por contacto de GHL: **845 leads, 861
turnos enganchados, 15 leads con más de un turno** — esas son las reagendas que
estaban huérfanas. Es aditivo: no se modificó estado, resultado ni ninguna otra
columna, y los 4 cierres existentes quedaron intactos.

**⭐ El próximo paso, que es lo que faltaba.** De 1.027 turnos, **cero** tenían
resultado cargado. No porque nadie trabajara: porque después de una llamada que
no cerraba **no había dónde anotar qué seguía**. Ahora cada llamada acepta un
próximo paso —reagendar, seguir, esperando al lead, perdido— con fecha,
responsable y notas.

**⭐ Los tres estados que son trabajo real**, derivados sin inventar nada:

| Estado | Qué significa |
|---|---|
| `follow_up_due` | Hay un próximo paso cuya fecha venció |
| `pending_outcome` | La llamada pasó y nadie cargó qué ocurrió |
| `stalled` | Tuvo desenlace, no cerró, y **nadie definió qué sigue** |

El tercero es la fuga que el módulo viene a tapar: el lead queda sin dueño y sin
fecha, y desaparece.

**Calificación en dos momentos.** Antes de la llamada y después,
deliberadamente separadas. Colapsarlas perdería justo la información útil: si el
lead resultó mejor o peor de lo que parecía al agendar.

**El ciclo lead → cliente se cierra.** Al vender, el lead queda vinculado al
cliente en que se convirtió. Antes el hilo se cortaba justo ahí: el lead
desaparecía y el cliente aparecía sin nada que dijera que eran la misma persona.

**Decisiones de diseño relevantes:**

- **No se infieren reagendas.** Sería fácil decir "este turno se canceló y
  apareció otro después, entonces se reagendó", pero podrían ser dos intentos
  independientes. El hilo muestra los intentos en orden —que es un hecho— y la
  reagenda la **declara el closer** con el próximo paso. Misma regla que sostiene
  todo el módulo.
- **Un próximo paso sin fecha se rechaza.** Sin fecha nunca vencería, así que
  nunca volvería a la cola: sería una forma silenciosa de perder el lead. `lost`
  es la excepción, porque cierra el hilo.
- **El seguimiento vencido pesa más que el resultado sin cargar.** Una fecha que
  pasó es un compromiso incumplido.
- **`lost` se lee del intento más reciente.** Un "perdido" viejo seguido de un
  turno nuevo significa que el lead volvió, no que sigue perdido.
- **Un lead sin turnos no es trabajo pendiente.** Todavía no pasó nada.
- **La resolución de leads maneja la carrera entre dos syncs**: si el índice
  único corta el insert, se recupera el lead que ganó en vez de perder el vínculo
  del turno.

**Verificación ejecutada:**
- `pnpm test`: **577 tests en 35 archivos, todos en verde** (19 nuevos del hilo).
- `tsc --noEmit` y `pnpm lint` limpios. `pnpm build` completo: 133 páginas.
- Migración **aplicada** y verificada: 845 leads, 861 turnos hilados, 15 con
  varios turnos, 4 cierres sin tocar.

**Riesgos / deuda técnica pendiente:**

- ⚠️ **Nada se probó todavía contra cuentas reales.** Sigue pendiente todo el
  bloque de verificación de Fathom.
- Los turnos de Calendly sin mail (186) no tienen lead hasta que un sync se lo
  complete. El mail ya se persiste desde la Fase 0, así que se resuelve solo.
- El responsable del próximo paso (`next_action_owner_id`) se guarda pero la UI
  todavía no lo deja elegir: hoy queda en null.
- La calificación previa (`pre_call_qualification`) tiene columna y acción pero
  la UI sólo expone la posterior.
- El panel no tiene cobertura de Playwright.

---

### 2026-09-01 — Llamadas: reducción de alcance a sólo llamadas de venta

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/fathom/{match-appointment,resolve-sales-call,invitees}.ts`, `app/fathom/sales-call-actions.ts` (nuevo), `components/integrations/unlinked-recordings-panel.tsx` (nuevo), `supabase/migrations/20260901210000_sales_calls_only.sql` (nueva), `providers/platform-data-provider.tsx`, `types/clients.ts`, `lib/clients/mapper.ts`, `lib/validations.ts`

**Qué se hizo:**

Decisión de producto: OTC registra **únicamente llamadas de venta**. Equipo y
entrega de servicio quedan para más adelante.

**La regla, completa:** una grabación de Fathom es una llamada de venta cuando el
mail de alguno de sus participantes coincide con el del lead de un turno
agendado y el horario corresponde. Lo que no cruza existe igual en
`fathom_calls`, pero no entra al módulo de ventas — y eso **no es un error**.

**⭐ El match provisional, y por qué existe.** Los 1.027 turnos actuales no tienen
mail: `lead_email` se agregó en la Fase 0 y se llena a medida que corren los
syncs. Con la regla estricta no se asociaría **ninguna** llamada durante semanas.
Por eso un único turno dentro de una ventana corta (45 min) alcanza para
asociar, marcado como `provisional` y distinguible de un cruce `confirmed` por
mail (ventana de 12 h). Con **dos** turnos posibles no se asocia: elegir el más
cercano sería adivinar, y un vínculo mal hecho le adjudica a un lead una llamada
que no tuvo. Este camino se apaga solo cuando los turnos tengan mail.

**Se retiró lo que quedó fuera de alcance**, en vez de dejarlo dormido: el mapeo
de tipos de reunión de Fathom (tabla, acciones, pantalla y lector de la API), el
parser de la convención del título, la búsqueda contra clientes por mail y la
detección de reunión de equipo. Código y columnas que parecen vivos pero nadie
escribe son exactamente cómo terminaron conviviendo los cuatro clasificadores
que la Fase 1 acababa de reemplazar.

**La cola de revisión se reformuló.** Ya no pregunta "¿qué es esto?" sino que
deja **vincular a mano** una grabación con un turno. El caso que resuelve es el
inverso al que parece: una llamada de venta real que no llegó a cruzar, y por lo
tanto un turno sin su registro de la llamada — que es lo que el seguimiento del
lead necesita.

**El mail del lead viaja al cliente al cerrar la venta.** La columna
`clients.email` existía en la base pero la aplicación **nunca la escribía**: los
264 clientes cargados tenían el mail vacío, y el tipo `Client` ni siquiera tenía
el campo. Es la identidad estable que hila al lead con el cliente en que se
convirtió, y sin ella la Fase 2 no puede seguir el hilo.

**Corrección de un defecto de la Fase 0:** al agregar el estado `attended` se
actualizaron los botones de "no cerró" y "no show" para aceptarlo, pero **se
había salteado el de cerrar la venta**. Una llamada que GHL marcaba como asistida
no se podía cerrar desde OTC.

**Decisiones de diseño relevantes:**

- **Se comparan todos los participantes, no sólo los que Fathom marca externos.**
  `is_external` se calcula contra el dominio de la cuenta de Fathom: un closer
  con Gmail personal figura como externo y un lead con dominio parecido figura
  como interno. El mail del turno es la referencia, así que conviene comparar
  contra el conjunto completo y dejar que el turno decida.
- **El mail le gana a la cercanía temporal.** Si un participante coincide con el
  lead de un turno, ese turno gana aunque otro esté más cerca en el tiempo: el
  mail es identidad, la hora corrobora.
- **Sin mail y con más de un turno posible, no se asocia.** Es la diferencia
  entre un dato y una suposición.
- **`counterparty` y `purpose` se conservan** aunque hoy sólo tomen `lead` y
  `sales`: son la puerta por la que entran entrega y equipo cuando se
  implementen. `calendar_invitees` y `meeting_type` también, porque son datos
  crudos que Fathom devuelve y guardarlos no cuesta nada.
- **`email` se agregó al schema de validación de cliente.** Sin declararlo, Zod
  lo descartaba en silencio y nunca habría llegado a la base.

**Verificación ejecutada:**
- `pnpm test`: **558 tests en 34 archivos, todos en verde** (14 del matcher, reescritos contra la regla nueva).
- `tsc --noEmit` y `pnpm lint` limpios. `pnpm build` completo: 133 páginas.
- Migración **aplicada** a Supabase.

**Riesgos / deuda técnica pendiente:**

- ⚠️ **Nada se probó todavía contra una cuenta real de Fathom.** Lo primero a
  verificar sigue siendo si `calendar_invitees` viene poblado.
- La ventana de 45 minutos del match provisional se eligió por criterio, no
  midiendo cruces reales. Se ajusta con datos.
- Los 264 clientes existentes siguen sin mail: sólo los nuevos lo heredan.
- `associateCallWithClients` (el fuzzy match por título) sigue en el pipeline
  como último recurso; se retira cuando haya datos reales que confirmen que no
  se activa.

---

### 2026-09-01 — Llamadas Fase 1: un clasificador, dos ejes, y la señal que se estaba tirando

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/fathom/{invitees,parse-title,match-appointment,classify,resolve-classification}.ts` (nuevos), `supabase/migrations/20260901180000_fathom_classification.sql` (nueva), `app/fathom/classification-actions.ts` (nuevo), `components/integrations/{fathom-call-classification-panel,unclassified-calls-panel}.tsx` (nuevos), `lib/fathom/{api,sync,process-call}.ts`, `app/fathom/{actions,member-actions}.ts`, `app/(platform)/integrations/page.tsx`

**Qué se hizo:**

**⭐ El hallazgo que cambió el plan.** Se bajó la documentación de Fathom (faltaba
en el repo) y `GET /meetings` devuelve **`calendar_invitees[]`** con el mail de
cada invitado, su dominio y **`is_external`** — en la lista de campos
**obligatorios** de la respuesta. `lib/fathom/api.ts` parseaba título, fechas y
transcript, y **descartaba todo lo demás**.

Eso es lo que faltaba: el 86% de los títulos reales son `"Impromptu Google Meet
Meeting"`, y toda la arquitectura leía el título. Con los invitados, la identidad
y el "interna vs. externa" salen de la API, no de adivinar.

**⭐ Dos ejes en vez de uno.** `call_type` mezclaba *con quién* y *para qué*, y el
fracaso de la primera pregunta decidía la segunda en silencio. Ahora son
`counterparty` (lead/cliente/interna) y `purpose` (venta/entrega/equipo). Una
llamada de venta es con un **lead**, que por definición todavía no es cliente —
por eso el sistema viejo, que buscaba clientes, las mandaba todas a `unmatched` y
las analizaba con `clientName: "Equipo interno"`.

**⭐ Un solo clasificador.** `classify.ts` reemplaza a los cuatro que competían:
el regex de equipo de `associate.ts`, las 60 keywords de `classify-call-type.ts`
(eliminado), la IA sobre el transcript y el fuzzy match del título. Orden de
señales, de la más verificable a la más frágil: turno agendado → cliente por mail
→ invitados internos → tipo de reunión → convención del título. Sin ninguna,
`null` con el motivo y a la cola de revisión.

**⭐ El cruce con la agenda, que es la señal fuerte.** `match-appointment.ts`
cruza la grabación con `closing_calls` por **horario y mail**. Reemplaza al
`ilike '%nombre%'` que tomaba el turno más reciente sin mirar fechas. Ventana
amplia (12 h) cuando el mail confirma la identidad, ajustada (45 min) cuando lo
único que hay es el solapamiento. Dos turnos igual de plausibles → `ambiguous`,
no un vínculo al azar. Y la FK real `fathom_calls.closing_call_id`, que no
existía.

**El parser del título, por posición.** `"Llamada de venta - Mariano"`: el tipo
sólo a la izquierda del separador, la identidad sólo a la derecha. El viejo
buscaba keywords en cualquier parte, así que `"Weekly de ventas"` (equipo) caía
en venta y `"Reunión con Juan"` (venta) caía en equipo. Es respaldo, no
mecanismo principal.

**UI.** Pantalla de mapeo tipo de reunión → propósito, y cola de llamadas sin
clasificar con el motivo y resolución en un clic.

**Decisiones de diseño relevantes:**

- **Un array de invitados vacío no es "no había externos".** `isInternalOnly`
  devuelve `null` sin lista: sin invitados no se puede afirmar que la reunión era
  interna. Misma regla que rige todo el módulo.
- **El mail manda sobre la cercanía temporal.** Si un invitado coincide con el
  lead de un turno, ese turno gana aunque otro esté más cerca en el tiempo: el
  mail es identidad, la hora es corroboración.
- **`normalizeEmail` no saca puntos ni sufijos `+algo`.** Son convenciones de
  Gmail, no del protocolo; aplicarlas a dominios corporativos uniría personas
  distintas.
- **Confianza 0.95 para el vínculo por mail, no 1.** `1` está reservado a
  `MANUAL_FATHOM_LINK_CONFIDENCE` — los vínculos que hizo una persona. 0.95
  supera el umbral de asociación (0.75) sin hacerse pasar por manual.
- **La clave del mapeo de tipos es el nombre, no un ID**, porque la API de Fathom
  no expone identificador. Si alguien renombra un tipo el mapeo queda huérfano, y
  la UI lo marca en vez de dejar de clasificar en silencio.
- **La API de tipos es de sólo lectura.** Los tipos se crean y se asignan dentro
  de Fathom; OTC sólo los lista. El panel lo dice explícitamente.
- **Una lista vacía de tipos es una respuesta válida**, distinta de "no se pudo
  preguntar" (`unavailable`). El panel explica que la clasificación funciona
  igual sin tipos.
- **La IA dejó de escribir `call_type`.** Lo decide el clasificador. `call_type`
  queda como columna legada; los lectores migraron a `purpose` —incluida la
  lista de llamadas de venta, que filtraba `call_type = 'consulting'` y por eso
  perdía toda llamada mal clasificada.

**Verificación ejecutada:**
- `pnpm test`: **581 tests en 36 archivos, todos en verde** (37 nuevos).
- `tsc --noEmit` y `pnpm lint` limpios. `pnpm build` completo: 133 páginas.
- Migración **aplicada** a Supabase.

**Un hueco que encontró un test antes de llegar a producción:** el clasificador
reportaba `no_signal` cuando había invitados externos pero no se resolvía el
propósito. Son situaciones distintas —"no hay nada de dónde agarrarse" vs.
"sabemos que fue con alguien de afuera y falta para qué"— y la cola de revisión
las trata distinto. Se corrigió el código, no el test.

**Riesgos / deuda técnica pendiente:**

- ⚠️ **Nada de esto se probó contra una cuenta real de Fathom.** El mapeo de
  campos se construyó leyendo la documentación. Lo primero que hay que mirar es
  si `calendar_invitees` viene poblado, y si la organización tiene tipos de
  reunión configurados.
- **No se sabe si los tipos de reunión existen en la cuenta del usuario.** La
  documentación de la API no explica dónde se crean y no aparecen en la pantalla
  de ajustes de Fathom. El panel de OTC responde la pregunta desde el deploy sin
  que la API key pase por ningún lado.
- `associateCallWithClients` (el fuzzy match por título) sigue en el pipeline
  como último recurso. Con el match por mail ya no debería activarse; se retira
  en la Fase 2 una vez confirmado con datos reales.
- La cola de revisión no permite vincular a un cliente o a un turno concreto,
  sólo asignar el propósito.

---

### 2026-09-01 — Llamadas Fase 0: dejar de corromper datos de venta

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/closing/call-status.ts` (nuevo), `lib/fathom/reclaim-stuck.ts` (nuevo), `supabase/migrations/20260901120000_closing_calls_disposition.sql` (nueva), `lib/ghl/sync-appointments.ts`, `lib/calendly/{sync-events,closer-sync,fetch-scheduled-events}.ts`, `app/api/integrations/calendly/webhook/route.ts`, `lib/fathom/process-call.ts`, `lib/funnels/source-signal.ts`, `lib/closing/mapper.ts`, `lib/manychat/*`, `components/closing/*`, `docs/external-apis/fathom/` (nuevo)

**Qué se hizo:**

Primera fase del rediseño del módulo de llamadas. **No agrega features**: corrige
la ingesta antes de construir el seguimiento de leads encima. El orden importa
porque el sync borraba los estados manuales cada hora, así que cualquier
seguimiento construido primero habría durado hasta el próximo cron.

**⭐ Asistir se estaba contando como vender.** `showed` en GoHighLevel significa
que el lead asistió. Estaba mapeado a `closed`, que en OTC es una venta cerrada y
alimenta la etapa Cash del embudo y la facturación. Ahora cae en `attended`, un
estado nuevo que dice exactamente lo que GHL dice y deja el resultado para que lo
cargue una persona.

**⭐ Cancelar no es faltar, y en dos lugares distintos era lo mismo.** GHL
descartaba las canceladas en el filtro del sync —una llamada cancelada no existía
para OTC— y Calendly las guardaba como `no_show`, en `fetch-scheduled-events.ts`
y en el webhook. En un no-show el lead faltó a una llamada que ocurrió; en una
cancelación la llamada nunca ocurrió. Confundirlas infla la tasa de inasistencia
y borra el evento que el seguimiento del lead tiene que registrar. Estado nuevo
`cancelled`, con `cancelled_by` para distinguir si canceló el lead o el closer.

**⭐ El sync ya no pisa lo que carga una persona.** Los updates sólo respetaban
`status = 'closed'`, así que un `not_closed` o un `no_show` marcado por un closer
volvía a `scheduled` en la siguiente corrida. Nueva columna `status_source`: todo
lo que pasa por el mapper de las Server Actions se marca `manual`, y los tres
syncs (Calendly, closer-sync, GHL) dejan de tocar el estado en esas filas. Los
datos del turno —horario, nombre, contacto— se siguen refrescando siempre: ahí el
proveedor sí es la fuente de verdad.

**⭐ Se dejó de inventar el tipo de llamada.** `process-call.ts` escribía
`call_type: analysis?.call_type ?? "delivery"`: cuando la IA fallaba, la llamada
quedaba marcada como entrega sin que nadie lo hubiera determinado. Ahora es
`null`. Explica las 122 llamadas que hoy tienen tipo nulo teniendo transcript.

**Llamadas trabadas.** `processSingleFathomCall` marca `processing` antes de
trabajar y el cron sólo levanta `pending`: si algo falla, la fila queda colgada
para siempre. Había 51 así, la más vieja del 16 de julio. Nueva columna
`processing_started_at` y rescate en el cron.

**Identidad del lead.** `sync-events.ts` recibía el email del invitado de Calendly
y lo usaba sólo para atribución UTM, descartándolo. Ahora se persiste en
`lead_email`, que es lo que la Fase 2 necesita para hilar reagendas de las 186
llamadas que no vienen de GHL.

**Documentación de Fathom bajada.** Era el séptimo proveedor y no estaba en
`docs/external-apis/`. Leerla corrigió un supuesto del plan: `GET /meetings`
devuelve `calendar_invitees[]` con **email, dominio e `is_external`**, y un campo
**`meeting_type`** configurable por organización — y OTC descarta los dos, porque
`lib/fathom/api.ts` sólo parsea título, fechas y transcript.

**Decisiones de diseño relevantes:**

- **Un solo vocabulario de estados** (`lib/closing/call-status.ts`). Estaba
  interpretado a mano en quince archivos, cada uno decidiendo por su cuenta qué
  contaba como asistencia y qué como venta; así fue como `showed` terminó siendo
  `closed`. Los `Record<ClosingCallStatus, …>` de la UI hacen que el compilador
  exija cubrir cada estado nuevo, pero las comparaciones sueltas no, y había
  tres que caían en el default equivocado (`utm-leads-sheet`, `lead-journey`,
  `score-conversation`): un estado nuevo se mostraba como "Agendado".
- **`CallStatus` de embudos pasó a ser un alias, no una copia.** La lista
  duplicada quedándose atrás es exactamente cómo `attended` habría dejado de
  contarse en la asistencia del embudo.
- **`syncMayOverwriteStatus` protege además los `closed` viejos.** Las filas
  anteriores a la migración quedaron en `status_source = 'sync'` porque la
  columna no existía; sin esa protección, el primer sync posterior al cambio de
  `showed` habría devuelto a `attended` los 4 cierres existentes.
- **El rescate de trabadas no toca las viejas, a propósito.** Mira
  `processing_started_at`, que se agregó ahora: las 51 que ya estaban colgadas no
  lo tienen y quedan afuera sin necesidad de un caso especial. Es la decisión del
  usuario —las llamadas anteriores a este sistema se dejan como están— y además
  evita disparar 51 análisis con IA que nadie pidió.
- **`attended` cuenta como asistencia en las métricas.** Es el denominador de la
  tasa de cierre: dejarlo afuera la subestimaría.
- **Una cancelada no es señal de asistencia.** Un período con sólo agendadas y
  canceladas sigue sin resultados cargados (`hasOutcomes = false`), porque la
  llamada nunca ocurrió y no dice nada sobre si los leads se presentan.

**Verificación ejecutada:**
- `pnpm test`: **544 tests en 33 archivos, todos en verde** (35 nuevos).
- `tsc --noEmit` y `pnpm lint` limpios. `pnpm build` completo: 133 páginas.
- Migración **aplicada** a Supabase y verificada: ninguna fila existente cambió
  de estado (981 `scheduled` / 44 `no_show` / 4 `closed`, igual que antes).

**Riesgos / deuda técnica pendiente:**

- ⚠️ **Las 4 llamadas marcadas como venta que sólo fueron asistencia siguen ahí**,
  por decisión explícita del usuario de no tocar el histórico. Van a seguir
  contando como ventas en facturación y en la etapa Cash del embudo. El defecto
  que las generaba está corregido: no se suman nuevas.
- Las 51 llamadas trabadas desde julio quedan trabadas, por la misma decisión.
- `cancelled_by` se llena con `unknown` en los dos proveedores. Calendly expone
  el autor en `cancellation.canceled_by` y todavía no se lee; GHL no lo informa.
- El eje de estado sigue siendo un solo campo con tres significados. Separarlo en
  campos propios es Fase 2; mientras tanto los predicados de
  `lib/closing/call-status.ts` son la única lectura correcta.

---

### 2026-08-31 — BRAND-A: la paleta categórica llega a los badges, tags y nodos

**Rama/branch:** `Claude-Design`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `apps/web/app/globals.css`, `apps/web/lib/ui/category-badge.ts` (nuevo), `apps/web/tailwind.config.ts`, `apps/web/components/product/graph-nodes.tsx`, `apps/web/lib/workboard/styles.ts`, `apps/web/constants/conversation-tags.ts`, `apps/web/components/agent/proposal-card.tsx`, `apps/web/components/sales/zernio-side-panel.tsx`, consumidores de workboard y de tags

**Qué se hizo:**

Cierra [BRAND-A]: los 5 archivos que seguían en violeta de la marca anterior
ahora usan la paleta categórica validada que se definió para los gráficos.

**Tokens de tinta.** `--chart-cat-1…6` está validado a ≥3:1, que es el umbral de
**marca**, no de texto. Un badge necesita además un color de texto, así que se
agregaron `--chart-cat-N-ink` en los dos temas, resueltos por búsqueda binaria
sobre la lightness del anchor hasta cruzar 4.5:1 contra la superficie. Los doce
valores pasan.

**`lib/ui/category-badge.ts` (nuevo).** `categoryColor`, `categoryInk` y
`categorySurface(index, { fill, border, ink })`, que arma el relleno y el borde
con `color-mix` sobre el token. Cada categoría necesitaba tres derivados del
mismo color en dos temas: con clases de Tailwind eso son seis strings por
categoría mantenidos a mano, que es exactamente cómo el violeta sobrevivió en
cinco archivos.

**Asignación de slots**, conservando el color que ya tenía cada categoría donde
se podía y cambiando sólo lo que colisionaba:

- **Áreas de workboard** — operaciones naranja, ventas azul, finanzas verde,
  clientes rosa se mantienen; marketing pasa de violeta a índigo. `general` no
  es una categoría más (es la ausencia de área) y queda neutro.
- **Nodos del grafo de producto** — framework naranja, avatar azul, escalón
  verde se mantienen; producto pasa de violeta a índigo y propuesta de valor de
  ámbar a rosa, porque contra el naranja del framework eran el mismo color. El
  nodo raíz sale de la paleta: no es un tipo de entidad sino el centro del
  grafo, así que va neutro y no gasta un slot.
- **Propuestas del agente** — mismo criterio que los nodos.
- **Etiqueta "Closeado"** — índigo, que la separa del azul de "Agendado" sin
  pisar el verde de la escala de calificación.
- **"Próximo paso" del panel de Zernio** — no es una categoría sino la
  recomendación del agente: va al color de IA, que en este design system es el
  de marca.

**Énfasis dentro de un tipo.** Avatar principal y core offer usaban un hue
distinto del resto (violeta vs púrpura, azul vs celeste) y se leían como dos
categorías en vez de como una destacada. Ahora es el mismo tono con más
intensidad de relleno y borde.

**Bug de fondo encontrado y corregido.** Los globs de `content` de Tailwind eran
`app`, `components`, `layouts` y `packages/ui/src` — **no** `lib` ni
`constants`. Las clases que se arman en esos dos directorios nunca se generaban,
así que tres etiquetas de conversación ("Calificado", "Descalificado",
"Agendado") salían literalmente sin color, y sólo se salvaban las que por
casualidad aparecían en otro archivo escaneado.

**Contraste de las etiquetas de conversación.** El archivo estaba escrito sólo
para tema oscuro (`text-teal-300`, `text-white/50`). En claro las pills eran
ilegibles y "No closeado" era invisible (blanco al 50% sobre blanco). Se
agregaron los pasos de texto para claro y "No closeado" pasó a tokens neutros.
"Descalificado" pasó de naranja a ámbar: el naranja es el acento de marca y una
pill de descalificado en color de marca se lee como énfasis, no como bajada.

Se agregó `/design-system/categorias` con los slots, las áreas, las etiquetas y
los nodos, para verificar contraste y separación en los dos temas.

**Por qué / finalidad:**

[BRAND-A] estaba trabado porque no existía una paleta categórica que conviviera
con un acento naranja. El rediseño de gráficos la definió y la validó; esto la
lleva al resto de la UI. Después del cambio no queda ninguna clase
`violet-*`/`purple-*`/`indigo-*` en la app.

**Decisiones de diseño relevantes:**

- **Estilos inline con tokens en vez de clases de Tailwind.** Es lo que permite
  que un solo token defina las tres derivadas y que el tema las cambie sin
  variantes `dark:`. La contra es que estas superficies ya no son ajustables
  desde el `className` del llamador.
- **El nodo raíz y `general` no toman slot.** Gastar un color de categoría en
  algo que no es una categoría es lo que empuja a inventar un séptimo hue.
- **La escala de calificación sigue siendo de estado, no categórica.** Verde,
  ámbar y rojo ahí significan qué tan bien va el lead; sólo los estados de flujo
  (closeado) toman color de la paleta categórica.

**Verificación:**

`tsc --noEmit` y `pnpm lint` limpios. Capturas de `/design-system/categorias` en
claro y oscuro, comparadas antes y después. Los doce tokens de tinta validados a
≥4.5:1 por script. Búsqueda global: 0 clases violeta/púrpura/índigo.

**Riesgos / deuda técnica pendiente:**

- **`next build` no se pudo correr en esta sesión**: `next/font` no logra bajar
  Inter ni JetBrains Mono de Google Fonts a través del proxy del entorno. Se
  verificó que el árbol limpio (el commit anterior, ya buildeado con éxito antes
  en esta misma sesión) falla exactamente igual, así que es de red y no del
  cambio. **Igual conviene mirar el build de Vercel al mergear.**
- Los nuevos globs de `content` hacen que Tailwind genere clases que antes
  faltaban en todo `lib/` y `constants/`, no sólo en los archivos tocados. El CSS
  crece un poco y puede aparecer color en lugares que hasta ahora salían sin él.

---

### 2026-08-31 — Rediseño del sistema de gráficos: paleta categórica, leyendas y espaciados

**Rama/branch:** `Claude-Design`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `apps/web/app/globals.css`, `apps/web/lib/chart/colors.ts`, `apps/web/components/charts/*`, `apps/web/components/charts/platform/*`, `packages/ui/src/components/metric-{card,stat}.tsx`, `packages/ui/src/lib/metric-trend.ts`, consumidores en marketing / finanzas

**Qué se hizo:**

Auditoría visual de los 17 componentes de `components/charts/platform` levantando la
app y comparando capturas en tema claro y oscuro. Se agregó
`/design-system/charts` (`components/design-system/charts-gallery.tsx`) que los
renderiza todos con datos de ejemplo — es la página con la que se hizo la auditoría
y con la que conviene verificar cualquier cambio futuro de gráficos.

**Color — tres familias donde antes había una.** `--chart-1…5` era una sola tinta
(negro en claro, blanco en oscuro) a distintas opacidades, y se usaba para todo.
Ahora hay tres familias con trabajos separados, todas en `globals.css` y expuestas
por `lib/chart/colors.ts`:

- `--chart-1…5` (monocroma) — magnitud dentro de una serie. Se corrigió la rampa:
  era `1 / .4 / .2 / .32 / .24`, **no monótona**, así que el paso 3 era más claro que
  el 4 y el 5. Ahora `1 / .62 / .44 / .30 / .20`.
- `--chart-cat-1…6` (categórica, nueva) — identidad de serie. Naranja de marca +
  azul, verde, índigo, rosa y verde oscuro.
- `--chart-ordinal-1…5` (ordinal, nueva) — posición en una secuencia (etapas de
  embudo). Un solo tono, lightness monótona.

Las dos paletas nuevas se validaron por script en ambos temas, no a ojo: banda de
lightness, piso de croma, separación de pares adyacentes simulando protanopía y
deuteranopía, piso de visión normal y contraste ≥3:1 contra la superficie de la
card. Los dos sets pasan las cinco. La ordinal se invierte entre claro y oscuro para
que el paso más alto sea siempre el de más contraste contra el fondo.

**Migrados a la paleta categórica:** slices de torta/anillo (`pie-context`), áreas de
radar (`radar-context`), series de scatter (`chart-context`), barras apiladas,
áreas duales, distribución de etiquetas de contenido, segmentos de gasto y stacks de
facturación (`chartSeriesColors` / `expenseSegmentColors` / `revenueStackColors`).

**Leyendas.** Se agregó `ChartLegend` y se puso leyenda en todo gráfico con dos o más
series. Las tortas y los anillos no tenían ninguna: la identidad de cada slice sólo
existía en el hover, que no está en touch ni en teclado. Ahora cada entrada además
lleva su porcentaje como etiqueta directa. `PieDistributionChart` agrupa en "Otros"
más allá de la sexta categoría en vez de repetir colores.

**Bugs de layout corregidos:**

- `BarXAxis` posicionaba las etiquetas de categoría usando `barScale` como
  coordenada X siempre. En barras **horizontales** `barScale` es el eje vertical, así
  que las cinco etiquetas se apilaban una encima de otra en la esquina inferior
  izquierda. Se agregó la variante horizontal, que las pone al lado de su barra.
- El clip de revelado (`time-series-chart-shell`) coincidía exacto con el área de
  dibujo cuando no había barras, y cortaba por la mitad los marcadores del primer y
  del último punto. Ahora reserva `EDGE_GLYPH_CLIP_PADDING`.
- `MetricChartPanel` y `MiniMetricChart` posicionaban el encabezado en `absolute`
  sobre el gráfico, con un degradado encima: el gráfico quedaba pisado arriba y las
  etiquetas del eje X recortadas contra el piso de la card. El encabezado pasó al
  flujo normal.
- `FunnelChartPanel`: las etiquetas de la primera y la última etapa se cortaban
  contra el borde de la card. El chart posiciona sus etapas en `absolute inset-0`,
  que ignora el padding del propio elemento, así que la canaleta va en un wrapper.
- `HeroAreaChart` reservaba `margin.top: 56` para un encabezado flotante que ya no
  existe, y el área quedaba aplastada contra el piso.
- `DualAreaChart` no tenía canaleta lateral y la primera etiqueta del eje pisaba el
  borde.

**Métricas.** `deriveMetricProgress` **inventaba** el ancho de la barra de progreso
cuando el valor no era un porcentaje: `up → 72`, `down → 38`, si no `56`, o el delta
de tendencia por 4. `MetricCard` trae `showProgressBar` en `true` por defecto y hay
59 usos en la app contra 2 que pasan `progress` explícito, así que casi todas las
cards mostraban una barra que no codificaba nada. Ahora devuelve `null` salvo que el
valor sea un porcentaje real, y la barra no se dibuja. Se sacó `tabular-nums` de las
cifras grandes (a ese tamaño deja los números sueltos; sirve en tablas, no en un
número suelto) y se renombró `progressVariant="violet"` a `"brand"`.

**Otros ajustes:** grilla sólida en vez de punteada (el punteado se lee como umbral o
proyección); barras más finas (`barGap` 0.2 → 0.55) porque los bloques anchos y
saturados se leen ruidosos; separación de 2px entre segmentos apilados con la
superficie de la card en lugar de un borde, y radio fijo de 3px para que la pila siga
leyéndose como una columna y no como píldoras sueltas; relleno de sparkline
degradado a transparente.

**Por qué / finalidad:**

Todo el sistema de gráficos era monocromo. Eso funciona para una serie de línea, pero
falla en cuanto hay categorías: en una torta de 5 slices había dos grises con 4 puntos
de opacidad de diferencia y ningún rótulo, así que el gráfico no se podía leer. El
naranja de marca no aparecía en ningún gráfico.

**Decisiones de diseño relevantes:**

- **Se usaron seis hues, no sólo naranja y neutros.** El manual define tres colores de
  marca, pero eso rige la identidad, no la codificación de datos: con un solo tono no
  hay forma de distinguir cinco categorías. El naranja queda como slot 1 —lo primario
  sigue siendo de marca— y los otros cinco son colores de datos.
- **El orden de los slots es el mismo en claro y oscuro**, con pasos re-escalonados
  por tema, no un flip automático. Así una serie conserva su color al cambiar de tema.
- **Los colores se asignan por índice de entidad, no por ranking**, para que filtrar
  una serie no repinte a las que quedan.
- **Se prefirió no dibujar la barra de progreso antes que dibujar una inventada.**
  Cambia el aspecto de casi todas las cards de métrica; es intencional.
- **La geometría del embudo no se tocó.** Con un rango de 120.000 a 210 las últimas
  etapas quedan como hilos, pero el ancho es proporcional al valor y eso es cierto:
  achatarlo (escala log) mentiría sobre la caída. Los valores y porcentajes están
  rotulados, así que se leen igual.

**Verificación:**

`tsc --noEmit` y `pnpm lint` limpios en los 4 paquetes; `next build` genera las 128
páginas. Auditoría visual con capturas en tema claro y oscuro antes y después, por
sección. Paletas validadas por script (5/5 checks en ambos temas).

**Riesgos / deuda técnica pendiente:**

- El cambio de color toca todos los módulos con gráficos (marketing, ventas, finanzas,
  clientes, super-admin). Conviene que el equipo lo mire en producción.
- No se agregó vista de tabla como equivalente accesible de cada gráfico; hoy el
  tooltip y las leyendas con valor cubren la lectura, pero no es lo mismo.
- Los 5 archivos de [BRAND-A] (badges, nodos de grafo, tags) siguen en violeta: ahora
  existe la paleta categórica que les faltaba, falta adoptarla.

---

### 2026-08-31 — Onboarding Fase 4: panel de progreso en super-admin

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `supabase/migrations/20260831150000_onboarding_org_progress.sql` (nuevo), `lib/super-admin/onboarding-progress{,-mapper}.ts` (nuevos), `components/super-admin/onboarding-progress-table.tsx` (nuevo), `app/(super-admin)/super-admin/onboarding/page.tsx` (nueva), `lib/onboarding/derive.ts`, `lib/onboarding/current.ts`, `components/dashboard/dashboard-empty-state.tsx`, `routes/paths.ts`, `lib/navigation/super-admin-sidebar-modules.ts`

**Qué se hizo:**
**Super Admin → Onboarding**: en qué punto quedó cada organización, ordenado por quién necesita atención primero. Con esto las cuatro fases del plan están construidas.

**Decisiones de diseño relevantes:**

- **Una consulta para todas las organizaciones.** `onboarding_org_progress()` devuelve los hechos de todas de una vez; resolverlas una por una eran ocho consultas por organización —doscientas con veinticinco clientes— para pintar una pantalla.
- **La función devuelve hechos, no conclusiones.** Quién está trabado y qué falta lo sigue decidiendo `deriveOnboardingState`, la misma función pura que usa la aplicación. Es lo que garantiza que **el panel no pueda mostrar un progreso distinto del que el cliente ve en su pantalla**. Ninguna regla de negocio está duplicada en SQL.
- **Los conteos de pasos por plantilla de embudo no se hardcodearon en SQL.** Viven en `lib/funnels/templates/` y la función devuelve el detalle crudo —cada instancia con su plantilla y sus bindings— para que la app resuelva. Copiarlos habría creado una segunda fuente de verdad de las plantillas.
- **El mapeo puro se separó del acceso a datos** (`-mapper.ts`), siguiendo la convención de `lib/*/mapper.ts` que ya usa el repo: `server-only` no resuelve en vitest, y la lógica que decide algo tiene que poder testearse.

**Dos cosas que aparecieron al correr el mapeo contra los datos reales**, y que no se veían leyendo el código:

1. **Los holdings encabezaban la lista de "necesita atención".** Cuatro de ellos, con el checklist en cero, tapaban a los clientes que sí estaban trabados. Un holding no mide embudos ni importa histórico —eso lo hacen sus negocios— y tiene su propio onboarding. Se agregó `applies` al progreso: las organizaciones a las que este flujo no les corresponde (holdings y las excusadas con `skip_onboarding`) van al final, sin barra de progreso y con el motivo explícito, y no entran en los contadores del encabezado.
2. **`deriveOnboardingState` no conocía `account_type`.** La regla "un holding no pasa por el gate" vivía sólo en el middleware. El panel deriva sin pasar por ahí, así que marcaba como trabado a un holding nuevo. Se sumó `accountType` al sujeto: ahora la regla vive en la capa pura y la usan los dos.

**De paso — un duplicado que había causado la Fase 2:** una organización nueva veía dos tarjetas pidiendo lo mismo, el checklist ("Conectar una fuente de datos") y el empty state del panel ("Conectá tus primeras integraciones"). El empty state ahora se corre cuando el checklist está visible, porque el checklist sabe más: conoce qué le falta a *esa* organización. También se le sacó la enumeración de proveedores, que estaba vieja (ManyChat, Calendly, Fathom) y se iba a volver a desactualizar.

**Verificación ejecutada:**
- `vitest`: **498 tests en verde** (14 nuevos).
- `tsc --noEmit`, `pnpm lint` y `next build` limpios (133 páginas).
- **El mapeo se corrió contra los datos reales** de las 13 organizaciones con usuarios: el orden sale correcto —de 0/4 a 3/4, con los holdings al final— y los pendientes de cada una coinciden con lo que muestra su propio checklist.
- **Evidencia en vivo de que la Fase 3 funciona:** `tours_seen = ["funnels"]` en dos organizaciones. El tour se disparó solo en el preview y se persistió.

**Riesgos / deuda técnica pendiente:**
- **La pantalla no se vio renderizada.** Se verificó el contenido, no el render — `PLAN_VERIFICACION.md` §13.10.
- **Hoy el panel muestra 0 organizaciones sin terminar la configuración inicial**, porque el backfill eximió a todas las existentes. Recién se va a poblar con cuentas nuevas: no es un bug, pero conviene saberlo antes de mirarlo por primera vez.
- El panel dice en qué punto quedó cada organización, **no si sigue viva**. La última actividad la cubre `/super-admin/client-health`, que es otra pantalla.
- `client-health` usa emojis en el JSX, contra la regla de `CLAUDE.md`. Es preexistente y no se tocó.

---

### 2026-08-31 — Onboarding Fase 3: tours contextuales con Driver.js

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/onboarding/tours.ts` (nuevo), `components/onboarding/tour-runner.tsx` (nuevo), `lib/onboarding/__tests__/tours.test.ts` (nuevo), `lib/onboarding/current.ts`, `lib/onboarding/resolve.ts`, `app/onboarding/actions.ts`, `providers/onboarding-provider.tsx`, `app/(platform)/layout.tsx`, `app/globals.css`, anclas en `funnels/page.tsx`, `marketing/content/page.tsx`, `agent-sidebar.tsx`, `agent-module.tsx`, `sales-inbox-layout.tsx`, `package.json`

**Qué se hizo:**
Cuatro tours que arrancan solos la primera vez que alguien entra a Embudos, Contenido, Agente y Bandeja. **Driver.js es la única dependencia que agregó todo el plan de onboarding**, y queda en el chunk del runner: el bundle compartido no se movió (185 kB antes y después).

**Decisiones de diseño relevantes:**

- **Las anclas son `data-tour`, nunca clases de Tailwind**, y hay un test que verifica que cada una siga existiendo en el JSX. El modo de falla de un tour es que un paso deje de aparecer **sin que nada se rompa**; el test lo convierte en rojo. Se comprobó que efectivamente falla al borrar un ancla a mano, nombrándola. También detecta anclas huérfanas —un `data-tour` que ningún tour usa es código muerto o un tour borrado a medias— y que el walk encuentre archivos, para que no pase en verde por no haber leído nada.
- **Los pasos cuyo elemento no está en el DOM se descartan.** Una pantalla vacía no tiene grilla, y un paso apuntando a la nada muestra un recuadro flotando en el medio. Si no queda ninguno, el tour no corre **y no se marca como visto**: mañana esa pantalla puede tener contenido.
- **Se espera a que el ancla aparezca** (hasta 4 s) antes de decidir. Varios módulos montan su contenido en un efecto, así que mirar el DOM en el primer render diría que no hay nada.
- **Navegar a otro módulo NO marca el tour como visto.** La limpieza del efecto también llama a `destroy()`, y sin distinguir los dos casos alguien que abre la pantalla y se va quemaría un tour sin haberlo leído. Cerrarlo con la X o con Escape sí cuenta: ahí la decisión fue del usuario.
- **Los tours sí le corresponden a las cuentas invitadas** —es su única forma de onboarding, según la decisión del plan— así que `tours_seen` se resuelve para todos, aparte del checklist. Es una consulta por clave primaria, no los ocho `count` del checklist, que sigue siendo founder-only.
- **El popover se re-mapea a los tokens del design system** en vez de reescribir la hoja de la librería: sigue el tema como cualquier otra superficie y una actualización de Driver.js no lo rompe.
- **El anclaje del agente NO usa un wrapper con `display: contents`.** Fue el primer intento y estaba mal: un elemento con `display: contents` no tiene caja, así que `getBoundingClientRect()` devuelve ceros y el resaltado no marcaría nada. Las anclas van sobre el `<aside>` y el `<div>` reales.

**Verificación ejecutada:**
- `vitest`: **481 tests en verde** (12 nuevos).
- `tsc --noEmit`, `pnpm lint` y `next build` limpios (133 páginas).
- **El popover se renderizó de verdad en Chromium** sobre el tema oscuro, con el mismo CSS que se despliega: fondo `rgb(15,15,15)`, título `rgb(250,250,250)`, descripción en `muted-foreground` y el botón principal en el naranja de marca `rgb(226,95,18)` con texto negro. Cero errores de página. La primera captura salió translúcida y era la animación de entrada — confirmado midiendo `opacity: 1` una vez asentada.

**Riesgos / deuda técnica pendiente:**
- **El disparo dentro de la aplicación no está probado.** Lo verificado es el render del popover aislado; que el tour arranque solo al entrar a un módulo queda para el navegador — `PLAN_VERIFICACION.md` §13.9.
- ⚠️ **El tour de la bandeja probablemente no corra en mobile:** sus anclas son las columnas de escritorio, ocultas con `md:`. El runner descarta los pasos sin ancla, así que no se rompe — simplemente no aparece. Conviene confirmarlo.
- El popover se verificó **sólo en tema oscuro**. Usa los mismos tokens en claro, pero no se miró.
- No hay forma de volver a lanzar un tour desde la UI una vez visto.

---

### 2026-08-31 — FIX: desplegables ilegibles en oscuro y fuentes de datos que no se contaban

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `app/globals.css`, `supabase/migrations/20260831140000_onboarding_connected_sources.sql` (nuevo), `lib/onboarding/resolve.ts`, `docs/PLAN_VERIFICACION.md`

Santiago probó el preview y reportó tres síntomas. Resultaron ser **dos bugs y una propiedad conocida del entorno**.

**1 · Los `<select>` nativos eran ilegibles en modo oscuro** — texto blanco sobre fondo blanco.

`html.dark` ya declaraba `color-scheme: dark`, así que la causa no era esa. Chrome pinta el popup del select con el **background computado del propio elemento**, y la app los estila con `bg-transparent`: eso resuelve a blanco mientras el texto hereda el foreground del tema. El `color-scheme` no alcanza justamente porque el background explícito gana.

Se estila el `<option>` y no el `<select>`: una regla de elemento sobre el select perdería contra las clases de Tailwind de cada uno de los **77 desplegables** que tiene la app. Con `option` gana, porque nadie los estila. **No era un bug del onboarding: afectaba a toda la aplicación en modo oscuro.**

Verificado midiendo el estilo computado en Chromium, antes y después: `rgba(0,0,0,0)` sobre texto `rgb(255,255,255)` → `rgb(15,15,15)` sobre `rgb(250,250,250)`.

**2 · El ítem "conectar una fuente de datos" contaba 5 de 16 tablas.**

Santiago conectó Google y el ítem siguió abierto: `google_forms_integrations` no estaba en el array. Tampoco Typeform, Instagram, ManyChat, Unipile, YouTube, Stripe, Mercado Pago, Hyros, VTurb ni WebinarJam.

Se reemplazó el array por **`onboarding_connected_source_count`**, una función de base de datos. Dos razones: la lista de qué cuenta como fuente ahora vive junto a las tablas en vez de en un array de la app que se desactualiza en silencio cada vez que se agrega un proveedor, y es **una consulta en vez de dieciséis** en un layout que corre en cada request. El criterio es excluir estados terminales (`disconnected`, `revoked`) en vez de exigir un valor, porque cada proveedor usa su propio vocabulario —`'connected'` en unos, `'active'` en otros, `is_active` en otros— y un proveedor nuevo con otra palabra quedaría afuera sin que nada falle.

**No cuentan** `discord_integrations` (canal de notificación hacia afuera, no fuente) ni `team_member_integrations` (por persona, no de la organización).

Aplicada y verificada: la cuenta subió donde correspondía (familiayformacion 3 → 5, Optimiza tu Control 1 → 2).

**3 · "Me deslogueó al conectar Google" — no era un bug.**

Los logs de Vercel lo muestran: el callback `/api/integrations/google-forms/oauth/callback` llegó a **producción**, no al preview. Las rutas OAuth arman la vuelta con una variable de entorno fija, registrada en la consola del proveedor, no con el host de la request. Desde un preview eso encadena los tres síntomas de una sola vez: el cookie de estado queda en el dominio del preview, el callback falla en silencio en producción (por eso no se guardó la integración), aparece el login de producción —donde no hay sesión, no hubo deslogueo— y al entrar no se ve nada de la rama porque no está desplegada ahí.

Ya era así antes de esta rama y aplica a Calendly, Typeform, Stripe, Mercado Pago e Instagram. Documentado en `PLAN_VERIFICACION.md` §13.7 con la salida práctica: en previews, probar el ítem con un proveedor de **API key** (Zernio, GHL, Fathom, pagos), que se conecta por diálogo sin salir del dominio.

**Verificación ejecutada:** 469 tests, `tsc`, `pnpm lint` y `next build` limpios. La función nueva probada contra las 13 organizaciones con usuarios.

**Riesgos / deuda técnica pendiente:**
- El caso "desconectar una integración y ver que el ítem se reabre" **sigue sin poder observarse**: ninguna organización tiene hoy una integración desconectada.
- La lógica de qué cuenta como fuente ahora vive en SQL y no la cubre `vitest`. La derivación (`connectedSourceCount > 0`) sigue siendo pura y testeada; lo que se movió es el conteo, que es IO por naturaleza.

---

### 2026-08-31 — FIX: loop de redirects entre el gate y el cambio de contraseña

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/onboarding/gate-routing.ts` (nuevo), `lib/onboarding/__tests__/gate-routing.test.ts` (nuevo), `lib/supabase/middleware.ts`

**El bug.** Santiago probó el preview y `/onboarding` devolvía `ERR_TOO_MANY_REDIRECTS`. Los logs de Vercel mostraban el ciclo entero:

```
/onboarding → 307 → /auth/force-password-change → 307 → /onboarding → …
```

Toda cuenta nueva llega con `must_change_password`, así que el middleware la manda a cambiar la contraseña. Pero **el chequeo del gate no exceptuaba esa pantalla** y, como `/auth/force-password-change` no es una ruta pública, la rebotaba de vuelta al gate.

**Lo peor del caso:** rompía exactamente al usuario al que el gate está dirigido —una cuenta recién creada en su primer login— y no lo agarraba nada: `tsc`, `pnpm lint`, 453 tests y `next build` pasaban todos en verde. El comentario del código decía el orden correcto ("va después del cambio de contraseña a propósito"); la condición no lo implementaba.

**El arreglo.** Dos guardas —`!mustChangePassword` y `!isForcePasswordChangePath`—, pero sobre todo **la decisión se extrajo a `lib/onboarding/gate-routing.ts`**, una función pura con 16 tests.

**Por qué extraerla y no sólo agregar la condición:** el modo de falla de esta lógica no es un valor mal calculado, es **un loop entre dos reglas del mismo middleware**, y eso tumba la aplicación entera sin que ninguna herramienta lo note. Mientras la decisión viviera adentro de una función que hace IO y arma `NextResponse`, no había forma de testear las combinaciones. Ahora el loop tiene tres tests que lo cubren por nombre.

**Verificación ejecutada:**
- `vitest`: **469 tests en verde** (16 nuevos, cuatro de ellos sobre el loop).
- `tsc --noEmit`, `pnpm lint` y `next build` limpios.

**Riesgos / deuda técnica pendiente:**
- El middleware sigue teniendo otras reglas de redirect (contraseña expirada, login, holding sin negocio activo) que **no** pasaron por esta extracción. Ninguna choca con el gate hoy, pero conviene el mismo tratamiento si se agrega otra.
- La lección para la Fase 3: nada de esto se ve sin abrir la aplicación. Los tours van a tener el mismo problema.

---

### 2026-08-31 — Onboarding Fase 2: el checklist persistente

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `components/onboarding/{setup-checklist,notch-setup-indicator}.tsx` (nuevos), `providers/onboarding-provider.tsx` (nuevo), `lib/onboarding/current.ts` (nuevo), `lib/onboarding/derive.ts`, `app/onboarding/actions.ts`, `app/(platform)/layout.tsx`, `components/dashboard/dashboard-page-content.tsx`, `components/navigation/notch-nav/platform-notch-nav.tsx`, `components/navigation/nav-icons.tsx`

**Qué se hizo:**
Lo que no entra en el gate ya se le muestra al founder: una tarjeta de progreso en el panel y un contador en la isla derecha de la notch nav. Con esto el onboarding queda completo de punta a punta — las tres fases de la primera tanda están cerradas.

**Decisiones de diseño relevantes:**

- **El checklist es sólo para founders.** Sus ítems viven en Ajustes, Integraciones y Equipo, donde un `operator` o un `viewer` no tienen permiso: mostrárselo sería pedirles algo que no pueden hacer. `getCurrentOnboardingState` devuelve `null` para cuentas invitadas, así que además no se resuelven los hechos en cada request de ellas.
- **El estado se resuelve en el layout, que es Server Component,** y baja por provider. Así la tarjeta se pinta con la primera respuesta en vez de aparecer un segundo después de que la página ya se vio.
- **La tarjeta se monta en `DashboardPageContent`, no en `DashboardOverview`.** Ese componente hace un early return al empty state, que es justo donde cae una organización recién configurada — o sea, el momento en que el checklist más hace falta. Montarlo adentro lo habría escondido exactamente ahí.
- **Los descartes se aplican primero en el cliente** y después se confirman contra el servidor, para que el ítem desaparezca al toque. La lógica vive en `applyLocalDismissals`, en la capa pura, porque no alcanza con marcar el ítem: hay que recalcular `open` y `complete`, que son los que deciden si la tarjeta y el contador siguen en pantalla.
- **`getCurrentOnboardingState` es una función server plana, no una Server Action.** La llama el layout; convertirla en acción dejaría un endpoint expuesto sin necesidad.

**Un bug silencioso encontrado de paso:** `NavIcon` cae a `LayoutDashboard` ante un nombre desconocido, y tres de los íconos del catálogo (`building-2`, `user-round`, `upload`) no estaban en el mapa — se habrían pintado todos iguales sin que nada fallara. Se agregaron, y `NAV_ICON_NAMES` ahora se exporta para que un test verifique la relación en vez del caso.

**Verificación ejecutada:**
- `vitest`: **453 tests en verde** (6 nuevos: `applyLocalDismissals` y los íconos del catálogo).
- `tsc --noEmit`, `pnpm lint` y `next build` limpios (133 páginas).
- **Contra la base real (cierra lo que quedaba abierto de `PLAN_VERIFICACION.md` §13.2):** se replicaron los resolvers en SQL sobre las 8 organizaciones founder con usuarios. El punto que estaba marcado como riesgoso quedó resuelto: las tres instancias de embudo existentes son plantilla `webinar` (7 pasos) con **un solo binding**, así que ninguna cuenta como completa — que es exactamente lo que muestra la grilla de `/funnels`. El checklist y esa pantalla no se contradicen.

**Riesgos / deuda técnica pendiente:**
- **El layout resuelve el estado en cada request de founder** — unos 8 `count` en paralelo sobre columnas indexadas, con cache de 60 s en memoria. Es el primer lugar donde mirar si el panel se siente lento; medir antes de optimizar.
- **El filtro de desconexión de integraciones sigue sin observarse:** hoy ninguna organización tiene una integración desconectada, así que no se pudo ver si `connectedSourceCount` cuenta de más. Sigue en `PLAN_VERIFICACION.md` §13.2.
- Nada probado con sesión de navegador — pasos en §13.6.
- El contador de la notch nav linkea al panel, no a la tarjeta: no hace scroll ni la resalta.

---

### 2026-08-31 — Onboarding Fase 1: el gate de tres pasos (migraciones aplicadas)

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `app/onboarding/actions.ts`, `app/(platform)/onboarding/page.tsx`, `components/onboarding/onboarding-gate.tsx`, `lib/supabase/middleware.ts`, `layouts/platform-layout.tsx`, `lib/navigation/chromeless.ts`, `constants/organization-options.ts`, `components/settings/settings-form.tsx`, `routes/paths.ts`, `lib/onboarding/derive.ts`, `supabase/migrations/20260831130000_organizations_drop_unit_defaults.sql`, `CLAUDE.md`

**Qué se hizo:**
Una cuenta founder nueva ya no entra a un panel vacío: cae en `/onboarding` y no sale hasta cargar unidades del negocio, oferta principal y avatar principal. **Las dos migraciones están aplicadas en Supabase** (proyecto OTC).

**Dos cosas que aparecieron al mirar la base real y cambiaron el diseño:**

- **El backfill.** Seis organizaciones existentes —entre ellas `familiayformacion`, activa y con tres miembros— no tienen oferta principal ni avatar, así que al desplegar se habrían encontrado un wizard bloqueante en su próximo login. La migración de `onboarding_state` les marca `gate_completed_at`: quedan eximidas y el checklist les mostrará igual lo que falta. **Verificado por SQL: de 18 perfiles, cero quedan redirigidos.** El gate queda para las cuentas nuevas, que es para lo que se diseñó.
- **Los defaults de la base tumbaban la premisa del paso 1.** `organizations.currency` tenía default `'USD'` y `timezone` default Buenos Aires, así que una org recién creada nacía "configurada" y la derivación —que sólo puede mirar si el valor está o no— salteaba justo el paso que motivó bloquear. Y el default no es neutro: para un cliente que cobra en pesos, `'USD'` es directamente el valor equivocado e indistinguible de una elección deliberada. Se agregó `20260831130000_organizations_drop_unit_defaults.sql`. No toca las filas existentes, y la UI de Ajustes ya resolvía el null con su propio fallback.

**Decisiones de diseño relevantes:**

- **El middleware hace una sola consulta por clave primaria** (`gate_completed_at`) y nada más. Si el gate hace falta o no —¿ya tiene oferta?— lo decide la página, que es la única que necesita la derivación completa y no corre en cada request.
- **Las rutas `/api/` quedan excluidas del redirect**, por el mismo motivo que las Server Actions: un redirect devuelve HTML y sobre un `fetch` rompe al cliente en vez de mandarlo a ningún lado.
- **El gate se renderiza sin chrome** (`lib/navigation/chromeless.ts`). Mostrarle la navegación a alguien que el middleware va a devolver es ofrecerle una salida que no existe. No se incluyó `/onboarding/holding`: ese wizard viene mostrándose dentro del shell y cambiarlo sería ajeno a esta fase.
- **Cero mutaciones nuevas.** Los tres pasos delegan en `saveGeneralOrganizationSettingsAction`, `saveProductAction` y `saveAvatarAction`. Salir a mitad de camino no pierde nada: al volver, `firstPendingGateStep` arranca en el primero que falte.
- **Un precio vacío o mal tipeado se guarda como ausente, no como cero** — una oferta sin precio conocido no es una oferta gratis.
- **`completeOnboardingGateAction` revalida en el servidor** que los tres ítems estén cumplidos. El cliente ya lo impide, pero la acción es la que escribe y no puede confiar en eso.
- **Las listas de moneda/zona/idioma se extrajeron a `constants/organization-options.ts`**, que ahora comparten Ajustes y el gate: duplicadas se desincronizaban del `z.enum` de `lib/validations.ts` sin que nada fallara.

**Verificación ejecutada:**
- `vitest`: **447 tests en verde** (4 nuevos sobre `firstPendingGateStep`).
- `tsc --noEmit` y `pnpm lint` limpios. `next build` OK — 133 páginas, ambas rutas de onboarding presentes.
- **Contra la base real:** los 18 perfiles existentes entran sin gate; una org creada de cero cae en el gate y con la identidad genuinamente pendiente; 🔒 RLS de `onboarding_state` aislando (1 fila visible de 25). Las orgs de prueba se borraron.
- Se agregó `PLAN_VERIFICACION.md` §13.5 con lo que falta probar en un navegador.

**Riesgos / deuda técnica pendiente:**
- **Nada probado con sesión de navegador.** Todo lo verificado es SQL, tests y build; el flujo visual queda para el preview de Vercel — pasos en `PLAN_VERIFICACION.md` §13.5.
- El gate suma **una consulta al middleware por request de founder**. Con el backfill devuelve rápido, pero conviene medirlo antes de que crezcan las cuentas.
- La animación de bienvenida se dispara desde el cliente tras completar el gate; si el usuario cierra la pestaña justo ahí, se pierde (el gate igual queda cerrado).
- Todavía **no hay checklist**: lo que no entra en el gate no se le muestra a nadie hasta la Fase 2.

**De paso:** se corrigieron las dos filas desactualizadas de `CLAUDE.md` —`app/onboarding/actions.ts` ahora existe de verdad, y el acento de marca es naranja `#E15D12`, no violeta.

---

### 2026-08-31 — Onboarding Fase 0: capa de derivación y estado persistido

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `supabase/migrations/20260831120000_onboarding_state.sql` (nuevo), `lib/onboarding/{items,derive,resolve}.ts` (nuevos), `lib/onboarding/__tests__/derive.test.ts` (nuevo), `docs/PLAN_VERIFICACION.md`

**Qué se hizo:**
Fase 0 del plan de `docs/ONBOARDING_PLAN.md`: el estado de onboarding de cualquier organización ya se puede consultar. **Sin UI todavía** — no hay pantalla ni ruteo, eso es la Fase 1.

- **`onboarding_state`** — una fila por org con lo único que no se puede derivar: `gate_completed_at`, `dismissed_items`, `tours_seen`. RLS con el patrón estándar. `onboarding_responses` (el wizard de holding) queda intacta.
- **`items.ts`** — catálogo de los 8 ítems con su nivel, a dónde mandan y si se pueden descartar. Sólo datos.
- **`derive.ts`** — la capa pura: dados los hechos, decide qué está cumplido y si el gate bloquea. No toca la base.
- **`resolve.ts`** — junta los hechos de las tablas reales y cachea 60 s.

**Decisiones de diseño relevantes:**

- **La asimetría entre `passed` y `satisfied` es lo más importante del archivo.** El gate se cruza una vez (`gate_completed_at`); el checklist mira el estado de ahora. Si alguien borra su única oferta después de haber cruzado, el ítem se reabre en el checklist pero **no lo expulsa de la aplicación a mitad de trabajo**. Mezclar las dos cosas daba una de dos fallas: o quedaba encerrado, o el checklist mentía.
- **`gate.required` es falso cuando los datos ya están cargados**, aunque nadie haya pasado por el wizard. Eso es lo que evita arrastrar por el gate a las organizaciones que existían antes de esta feature — que era la consecuencia más molesta de la decisión de bloquear.
- **Del formulario de identidad, sólo tres campos deciden:** nombre, moneda y zona horaria. Industria, país e idioma se piden pero no bloquean. El criterio es el mismo que define el gate: bloquear sólo por lo que no se puede corregir después sin dejar mal etiquetado lo ya cargado.
- **Un embudo a medio vincular no cuenta como hecho.** Se usa el mismo ratio `boundSteps / stepCount` que la grilla de `/funnels` ya calcula, para que el checklist y esa pantalla no puedan discrepar.
- **`connectedSourceCount` cuenta tablas, no proveedores concretos.** Cualquier fuente sirve; exigir Zernio sería adivinar el negocio del cliente.
- **La cache guarda los hechos, no el estado derivado.** La derivación depende de quién mira (rol y `skip_onboarding`) y es pura y barata; meter eso en la clave multiplicaba entradas y volvía la invalidación un barrido por prefijo.
- **`countRows` devuelve 0 ante cualquier error**, tabla inexistente incluida: un ítem de onboarding no puede tumbar la request que lo muestra.

**Verificación ejecutada:**
- `vitest`: **443 tests en 25 archivos, todos en verde** (25 nuevos).
- `tsc --noEmit` limpio.
- `pnpm lint`: sin errores ni warnings nuevos en `lib/onboarding`.
- Se agregó la sección 13 a `docs/PLAN_VERIFICACION.md` con lo que no se puede probar sin base real.

**Riesgos / deuda técnica pendiente:**
- **Lo único verificado es la lógica pura.** Que las consultas lean las tablas correctas necesita una base real — pasos en `PLAN_VERIFICACION.md` §13.
- ⚠️ **`connectedSourceCount` es lo más probable de fallar.** Cada proveedor se desconecta distinto: `zernio_integrations` y `payment_integrations` marcan `is_active`, `fathom_integrations` usa `status`, y `ghl_integrations` y `calendly_integrations` no tienen ninguna de las dos — ahí la sola presencia de la fila cuenta como conectado. Si alguno borra tokens sin borrar la fila, va a contar de más.
- La migración **no está aplicada** en Supabase todavía.
- Nada consume esta capa aún: sin la Fase 1 no cambia nada para el usuario.

---

### 2026-08-31 — Plan de onboarding guiado para cuentas nuevas

**Rama/branch:** `Claude-Onboarding`
**Commits:** pendiente commit
**Módulo(s) afectado(s):** `docs/ONBOARDING_PLAN.md` (nuevo), `PENDIENTES.md`

**Qué se hizo:**
Sesión de diseño, sin código. Se relevó el estado real del onboarding en el repo y se escribió el plan completo en `docs/ONBOARDING_PLAN.md`, con las tres decisiones de producto ya cerradas con Santiago.

**Lo que apareció en el relevamiento:**
- **No existe onboarding de founder.** `CLAUDE.md` lista `app/onboarding/actions.ts` como "onboarding founder" y **ese archivo no existe** — la fila está desactualizada. Lo único construido es el wizard del holding.
- **`CinematicWelcome` está huérfana.** El `WelcomeGate` y `welcome-storage.ts` están completos y esperan un `markWelcomePending()` que **ningún flujo llama**. Su lugar natural es el final del gate de onboarding.
- Las cuentas founder nacen con la organización **ya nombrada** por el super-admin y con `must_change_password`, así que el onboarding arranca después del cambio de contraseña forzado, no antes.

**Qué es obligatorio y por qué (el criterio, no la lista):**
El criterio elegido no es "qué nos gustaría que cargue" sino **qué se rompe si falta y lo descubre en el mes 2**. Si se recalcula, no es obligatorio; si dejó el histórico mal etiquetado, sí. La segunda fuente objetiva es `getOrgContext()`: lo que el agente lee en cada llamada y no puede degradar con elegancia. Eso deja **tres** ítems en el gate —unidades del negocio, oferta principal, avatar principal— y todo lo demás en checklist o sugerido.

**Decisiones de diseño relevantes:**

- **El progreso se deriva, no se guarda.** La propuesta de partida era una tabla con un booleano por paso. Eso miente en cuatro casos que ya ocurren acá: el super-admin crea la org con nombre; un founder puede conectar Zernio sin pasar por el checklist; un cliente puede importar el histórico primero; y borrar la única oferta deja el booleano en `true`. Guardar el hecho duplica una verdad que ya vive en `products`, `customer_avatars` y `zernio_integrations` — y de dos fuentes para el mismo dato, una se desincroniza siempre. Se persiste sólo lo no derivable.
- **Una sola dependencia nueva, y no en la primera tanda.** Se evaluaron las cuatro librerías contra el registry de npm en vez de de memoria. Resultados que cambiaron la conclusión: **`onboardjs` está despublicado** (el paquete real es `@onboardjs/core`, en release candidate, ~9K descargas semanales) y **React Joyride sí soporta React 19** (peer `16.8 - 19`), que era la duda más razonable. Queda **Driver.js** —cero dependencias, 156 KB, 2M descargas semanales— y sólo para los tours contextuales, en la segunda tanda. El flujo se construye acá porque **el estado sale de la base de datos**: ninguna librería puede saber si esta org ya tiene una oferta cargada.
- **El gate no aplica a invitados.** Un `operator` o `viewer` no tiene permiso de `settings` ni de `integrations`, así que el gate lo dejaría encerrado en una pantalla que no puede completar. El redirect del middleware se condiciona a `role = 'founder'` desde la Fase 1, aunque su tour recién se construya en la Fase 3.

**Riesgos / deuda técnica pendiente:**
- Nada implementado todavía — el plan está listo, el código no existe.
- El gate agrega consultas al middleware, que corre en cada request. Medir antes de optimizar.
- Con el gate duro, la única salida para un cliente trabado es que alguien de OTC le marque `skip_onboarding`. Conviene que el panel de visibilidad (Fase 4) llegue antes de tener muchas altas simultáneas.
- **`CLAUDE.md` tiene dos filas desactualizadas** detectadas de paso: el `app/onboarding/actions.ts` inexistente, y un acento primario violeta `#7C3AED` cuando `DESIGN.md` y los tokens definen naranja `#E15D12`.

### 2026-08-31 — Sacar el panel contenedor y fijar Embudos en la navegación

**Rama/branch:** `Claude-Design`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `components/layout/platform-shell.tsx`, `components/navigation/notch-nav/notch-nav.tsx`, `lib/navigation/sidebar-modules.ts`

**Qué se hizo:**

- **El contenido va directo sobre el fondo de la app.** Se sacó el `MainContainerPanel` del shell de plataforma: ya no hay tarjeta redondeada con sombra y patrón de puntos envolviendo cada pantalla. El título de página queda fijo arriba (fuera del contenedor de scroll) con un hairline que marca dónde empieza el contenido, y el padding horizontal replica el de `.page-content` para que el h1 alinee con las cards.
- **`Embudos` deja de ser add-on en la navegación.** Estaba detrás de `enabledAddOns.includes("embudos")`, así que solo aparecía si la organización tenía el add-on activo. Ahora va siempre; quién lo ve lo sigue decidiendo el permiso `funnels`.
- **Los labels de la barra no se parten en dos líneas** (`whitespace-nowrap` + `min-w-0` en la isla central).

**Por qué / finalidad:**

Pedido de Santiago: el recuadro que envolvía todo el contenido de cada panel sobraba visualmente. Y Embudos no es un módulo opcional del producto, así que no correspondía gatearlo por add-on.

**Decisiones de diseño relevantes:**

- **`MainContainerPanel` NO se borró:** lo sigue usando `three-column-layout`, que es el shell del área de super-admin. Solo dejó de usarlo la plataforma.
- **Se mantiene el hairline debajo del título.** Sin la tarjeta podría parecer chrome sobrante, pero hace trabajo real: marca el límite entre la franja fija y el área que scrollea; sin él, el contenido subiendo por detrás del título se ve roto.
- **`Operaciones` y `Producto` siguen gateados por add-on**, que es exactamente el mecanismo para "por ahora no, más adelante sí": apagados hoy, se encienden desde super-admin sin tocar código.
- **El AddOnId `"embudos"` se deja declarado** en `lib/auth/add-on-ids.ts` aunque ya no gatee nada, porque puede haber organizaciones que lo tengan guardado en la base.

**Verificación:**

`tsc` 4/4, lint 0, build de 132 páginas y 418 tests. Verificación visual en tema claro y oscuro. Se comprobó por aserción que las tres islas de la barra **no se superponen en ningún ancho** (1920, 1512, 1440, 1366, 1280, 1180, 1024, 768) — el gap mínimo es de 32px — y que la lista de módulos queda en Panel General · Clientes · Equipo · Marketing · Ventas · Finanzas · Embudos · Tablero de trabajo.

**Riesgos / deuda técnica pendiente:**

- Con `Operaciones` y `Producto` encendidos serían 10 módulos y a 1280px la isla central **se superpone** con la derecha. Antes de habilitar esos add-ons hay que resolverlo: acortar labels, agrupar módulos o pasar a iconos por debajo de cierto ancho.
- Se perdió el patrón de puntos de fondo, que era parte del panel. Si se lo quiere de vuelta, va sobre el fondo de la app.

---

### 2026-08-30 — Reportes ejecutivos: pulso diario, UI rediseñada y panel discreto

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/executive-reports/{cadences,generate-daily}.ts` (nuevos), `components/executive-reports/*`, `app/(platform)/executive-reports/*`, `app/api/cron/executive-report-daily/`, `app/api/queue/process-cron-executive-report/`, `lib/queue/qstash-client.ts`, `lib/navigation/*`, `components/navigation/notch-nav/platform-notch-nav.tsx`, `vercel.json`

**Qué se hizo:**
El sistema de reportes con IA ya existía —generadores, crons semanal y mensual, tabla— pero se leía desde **Operaciones → Reportes** en el sidebar, con una UI que no seguía el diseño actual y con un botón de generación manual.

**⭐ Dónde vive ahora, y por qué.** Los reportes pasaron a un **panel detrás de un ícono en la barra superior**, disponible desde cualquier pantalla. Un reporte automático se lee y se cierra: no es un lugar donde uno *trabaja*, y ocupar un renglón del sidebar lo ponía al mismo nivel que SOPs o Clientes. La entrada "Reportes" de Operaciones se quitó — el panel no se suma al navbar, lo libera.

Quedan dos páginas, sin entrada en el navbar y accesibles desde el panel: el **historial** (volver sobre reportes viejos) y el **detalle** (compartir el link de uno). Las páginas por cadencia (`/weekly`, `/monthly`) se borraron: el panel ya muestra el último de cada una.

**⭐ El pulso diario es una lectura distinta, no el semanal más seguido.** El documento fuente (§06) le da a cada cadencia un propósito propio, y al diario una advertencia explícita: *"Lectura de 5 minutos. No se toman decisiones con un solo día de datos."* De ahí tres diferencias deliberadas en el generador:

1. **No produce recomendaciones.** El array se guarda vacío y la UI ni siquiera dibuja la sección: un bloque "Recomendaciones — ninguna" se leería como que la IA no encontró nada, cuando en realidad no se le pidió.
2. **Menos ítems y más cortos** — máximo 3 riesgos y 3 cuellos de botella, de una línea.
3. **Ventana de un día** en los estados por departamento, no de siete.

La advertencia va **arriba de los números** en la UI. Sin ella, un mal martes parece un problema estructural.

**Sólo generación automática**, como se pidió: la UI de reportes no tiene ningún botón de generar. El pulso diario corre a las 11 UTC (8 de la mañana en Argentina).

**Verificación ejecutada** (sobre `main` con onboarding, notch nav y embudos ya mergeados):
- `pnpm test`: **509 tests en 30 archivos, todos en verde** (11 nuevos de este cambio).
- `tsc --noEmit` y `pnpm lint` limpios.
- `pnpm build` completo: **131 páginas**. Quedan `/executive-reports/history` y `/executive-reports/[id]`; `/weekly`, `/monthly` y `/operations/reportes` ya no se compilan.
- Migración **aplicada**.

**Un bug de layout que se atajó antes de llegar al navegador:** `DialogContent` trae `grid gap-4 p-6` por defecto, así que la columna con scroll interno que necesita el panel no armaba y el contenido se habría desbordado en vez de scrollear. Se pisa con `flex flex-col gap-0 p-0`. No lo detecta ni `tsc` ni el lint: es CSS, y sólo se ve corriendo la app o leyendo el primitivo.

**Decisiones de diseño:**
- **Un solo worker de cola para las tres cadencias.** El worker acepta un `period` opcional que cae en `weekly`: los jobs ya encolados cuando se agregó el diario no traen el campo y tienen que seguir generando lo que pidieron. Tres workers habrían sido tres copias del mismo archivo cambiando una línea.
- **El punto de "no leído" vive en `localStorage`, no en la base.** Es una comodidad por navegador: su peor caso es volver a ver un punto que ya se había apagado, y eso no justifica una tabla de leídos. Toda lectura y escritura va en `try/catch` porque el modo privado puede bloquearlo.
- **El panel se trae sus propios datos.** El shell de la plataforma es client hasta arriba, así que no hay dónde consultar del lado del servidor sin atravesar dos componentes con props que no les incumben. Vive en el layout: monta una vez por sesión, no en cada navegación.
- **`ReportBody` es el mismo en el panel y en la página de detalle.** El mismo reporte no debería leerse distinto según por dónde se entró.
- **El historial se agrupa por cadencia y no se ordena por fecha.** Los diarios son muchos más que los otros dos y una lista cronológica única los enterraría.
- **El botón sólo aparece si hay al menos un reporte.** Un ícono que sólo puede mostrar un vacío es ruido en la barra.
- **Vive en la isla derecha de la notch nav**, junto al tema y al perfil. Se escribió cuando todavía convivían la topbar clásica y la notch nav; al quedar la notch nav como navegación única (#31, #33), el panel quedó sólo ahí.

**Corrección a algo que dije durante el trabajo:** al empezar reporté que la función estaba "huérfana, sin ningún link desde la navegación". Era falso — estaba en **Operaciones → Reportes**. Lo detecté al romper la compilación de esa página, y cambió el alcance: el panel **reemplaza** esa entrada en vez de sumarse a la navegación.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **Queda un camino de generación manual que no se tocó.** `GenerateWeeklyPipelineButton` (en Inteligencia y en Operaciones) dispara un pipeline que, entre otras cosas, genera el reporte ejecutivo semanal. Sacarlo rompería esas dos pantallas, que están fuera de este pedido. La UI de reportes no ofrece generar nada; ese botón sí, desde otro lado.
- El pulso diario **nunca corrió**: su primer resultado real es el que va a decir si el prompt produce algo útil o ruido. Si sale ruidoso, lo que hay que ajustar es el prompt del sistema en `generate-daily.ts`, no la UI.
- El panel no tiene cobertura de Playwright.

---

### 2026-08-30 — Quitar el rate limit de conexión de integraciones

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/rate-limit.ts`, `app/ghl/actions.ts`, `app/integrations/zernio/actions.ts`, `app/manychat/actions.ts`, `app/fathom/actions.ts`, `app/api/integrations/fathom/connect/route.ts`

**Qué se hizo:**
Santiago quedó bloqueado 20 minutos intentando conectar GoHighLevel. `integrationConnectRateLimit` permitía **5 intentos por hora, por usuario**, y se aplicaba a las cinco pantallas de conexión de integraciones: GHL, Zernio, ManyChat y Fathom (server action y ruta API).

**Por qué estaba mal calibrado.** El límite estaba tuneado como una defensa de fuerza bruta de login —ventana de una hora, 5 intentos— pero se aplicaba a un **formulario de setup**. Equivocarse cinco veces seguidas ahí es lo normal: los tokens son largos, el Location ID hay que ir a buscarlo a otra pantalla de GHL, y cada error de tipeo consume un intento. El resultado es quedar bloqueado justo en la mitad de la configuración, que es el peor momento posible.

**Por qué sacarlo no pierde protección real:**
- La acción **ya exige sesión iniciada** y la clave del contador es el `user.id`. No hay fuerza bruta que prevenir: quien llega acá ya está autenticado.
- Ningún humano tipeando puede acercarse a las cuotas de los proveedores. GHL admite 100 requests cada 10 segundos; el límite de OTC era 5 por hora, unas 700 veces más restrictivo que el del proveedor que decía proteger.

**Se quitó también la definición**, no sólo los usos, y en su lugar quedó un comentario explicando por qué no existe y qué forma debería tener si alguna vez hace falta volver a ponerlo: ventanas de minutos con decenas de intentos, no de horas con cinco.

**Lo que NO se tocó:** `integrationRateLimit` (30 por minuto), que cubre el **sync manual** de Fathom. Ese sí protege algo real —un botón que dispara llamadas a una API externa y se puede apretar repetidamente— y su ventana es sana.

**Verificación ejecutada:**
- `pnpm test`: **418 tests, todos en verde**.
- `tsc --noEmit` y `pnpm lint` limpios.
- Sin referencias colgadas: `grep integrationConnectRateLimit` no devuelve nada en todo el monorepo.

**Riesgos / deuda técnica pendiente:**
- Las filas viejas en la tabla `rate_limits` con la clave de este límite quedan inertes: ya nadie las consulta. No hace falta borrarlas.
- Los otros límites del archivo (`aiRateLimit`, `authRateLimit`, `apiRateLimit`, los de webhooks) siguen intactos y no se revisaron. Vale la pena mirar si alguno más está calibrado con el mismo criterio equivocado.

---

### 2026-08-30 — FIX: el permiso de Embudos no se podía conceder desde la UI

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `constants/permission-modules.ts`, `constants/__tests__/permission-modules.test.ts` (nuevo), `vitest.config.ts`

**Qué se hizo:**
Santiago preguntó cómo darle acceso al panel de Embudos a una cuenta, y ahí apareció el bug: **no se podía**.

**El bug.** `funnels` estaba declarado como módulo de permisos (`PermissionModuleId` y `PERMISSION_MODULES`) y el módulo del sidebar lo referenciaba con `permissionId: "funnels"`, pero **nunca se agregó a `MODULE_GROUPS`**. El formulario de roles personalizados itera los grupos, no la lista de módulos, así que "Embudos" no se renderizaba nunca y el permiso no se podía conceder. El módulo quedaba visible **sólo para founders**, que se saltean los permisos por completo.

De los 21 módulos declarados, era **el único** sin grupo — así que no era un patrón, era un olvido.

**Es un modo de falla silencioso:** nada rompe, nada avisa. Sólo se nota cuando alguien intenta darle acceso a otra persona y el módulo no está en la lista.

**Un segundo hueco del mismo tipo.** Al escribir el test de regresión resultó que **no habría corrido**: el `include` de Vitest era `lib/**`, así que cualquier test fuera de esa carpeta se ignoraba en silencio — se ve verde porque no se ejecutó. Se amplió a toda la app, con `exclude` explícito para `node_modules`, `.next`, `dist` y `e2e` (que son de Playwright).

**Verificación ejecutada:**
- `pnpm test`: **418 tests en 24 archivos, todos en verde** (4 nuevos; el archivo de constants ahora sí se ejecuta).
- `tsc --noEmit` y `pnpm lint` limpios.

**Decisiones de diseño:**
- **Embudos va en el grupo "General" y no en "Ventas".** Atraviesa módulos: mide desde el gasto en anuncios hasta el cobro. Agruparlo bajo Ventas sugeriría que sólo cubre esa parte.
- **El test de regresión verifica la relación, no el caso.** Comprueba que *todo* módulo declarado esté en algún grupo, que ningún grupo referencie un módulo inexistente y que ninguno esté duplicado. El caso puntual de `funnels` es sólo el cuarto test.

---

### 2026-08-30 — NAV-NOTCH definitiva: la notch nav reemplaza al sidebar

**Rama/branch:** `Claude-Design`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `components/layout/platform-shell.tsx`, `components/navigation/notch-nav/*`, borrados `app-sidebar`, `sidebar-profile-area`, `sidebar-footer`, `sidebar-navigation`, `app-topbar`, `breadcrumbs`, `lib/navigation/nav-style.ts`, `.env.example`, `CLAUDE.md`, `DESIGN.md`

**Qué se hizo:**

- **La notch nav pasa a ser la única navegación de la plataforma.** Se eliminó el flag `NEXT_PUBLIC_NAV_STYLE` y el branch de `PlatformShell`: el shell de la notch **es** ahora `PlatformShell`.
- **Paridad cerrada antes de borrar el sidebar** — los tres huecos que quedaban:
  - **Perfil** (`NotchProfileMenu`): avatar con iniciales, nombre de usuario y organización. Era lo único que vivía solo en el `SidebarProfileArea`; sin esto no había forma de ver con qué cuenta y organización estabas logueado. Suma **Cerrar sesión**, que antes estaba enterrado en Ajustes.
  - **Badge de clientes** en el item Clientes (`usePlatformData().clients.length`), igual que el sidebar.
  - **"Mi Holding"**, que el sidebar mostraba sólo para cuentas holding y la notch no tenía.
- **Borrados:** `app-sidebar`, `sidebar-profile-area`, `sidebar-footer`, `sidebar-navigation`, `app-topbar`, `breadcrumbs` y el módulo del flag.

**Por qué / finalidad:**

Decisión de Santiago tras ver la barra funcionando. Cierra `[NAV-3]` de PENDIENTES: no mantener dos navegaciones en paralelo.

**Decisiones de diseño relevantes:**

- **Qué NO se borró.** `ThreeColumnLayout` lo usa `super-admin-layout`; `MobileNav` lo usa la propia notch; `sidebar-item`, `sidebar-two-level-navigation`, `sidebar-root/sub-navigation` y `useSidebarCollapsed` los comparten el **sidebar de super-admin** y el drawer mobile. Se mapearon las dependencias antes de borrar: quedan porque tienen otros consumidores, no por olvido.
- **`sidebar-modules.ts` conserva el nombre** aunque ya no haya sidebar de plataforma. Renombrarlo tocaría ~15 imports sin cambiar comportamiento; el archivo sigue siendo la fuente de verdad de módulos, permisos y add-ons, y el nombre se puede cambiar en una limpieza aparte.
- **Sign out en el menú de perfil:** el submit se dispara por `ref` sobre un `<form>` oculto, porque Radix cierra el menú al seleccionar y un `<button type="submit">` dentro del item puede perder el submit.
- **`gap-2` sólo en los items del perfil**, no en la primitiva `DropdownMenuItem`: tocarla afectaría todos los dropdowns de la app.

**Ajustes de la isla derecha (pedido de Santiago tras revisar el preview):**

- **Fuera el botón de búsqueda.** La paleta se sigue abriendo con **⌘K / Ctrl+K**; se pierde el acceso visible, no el acceso.
- **El engranaje pasa a ser Integraciones** (icono `plug`) y navega directo a `/integrations`, sin dropdown. Ajustes ya se llega desde el menú de perfil, así que el dropdown de Configuración sobraba.
- **"Conexión con Ventas" sale de la navegación de Marketing** con `hidden: true`, el mismo patrón que ya usaban "Administrar" y "UTMs". La ruta sigue existiendo y accesible por URL: se saca del menú, no se borra la pantalla.

**Verificación:**

`tsc`, lint y `next build` limpios (127 páginas). Verificación visual con una página de preview temporal (borrada antes del commit): barra completa, dropdown de módulo, menú de perfil con nombre/organización/cerrar sesión y badge de clientes. Los tres ajustes se comprobaron por aserción además de por captura — cero iconos de lupa en el header y el dropdown de Marketing devolviendo Overview · Contenido · Anuncios · Formularios · Automatizaciones · Lead Magnets.

**Riesgos / deuda técnica pendiente:**

- **No validado con sesión real.** El entorno de desarrollo no puede renderizar las páginas autenticadas (faltan las env de Supabase), así que el pill activo, el switcher de holding y el badge con datos reales quedan por confirmar en el preview de Vercel.
- Se perdió la etiqueta "Fase 1 · Beta" que mostraba el footer del sidebar (`secondaryNavigation` estaba vacío, así que no se perdió ningún link).
- Ya no hay sidebar como alternativa: revertir es `git revert` del commit.
### 2026-08-30 — Traer `main` a la rama de embudos para poder probar todo junto

**Rama/branch:** `Claude-New-Features`
**Commits:** merge de `origin/main` (`fcafaff`)
**Módulo(s) afectado(s):** todo el rebranding Limitless + notch nav que ya estaba en producción

**Qué se hizo:**
La rama de embudos estaba **26 commits adelante de `main` pero 1 atrás**: le faltaba el rebranding a Limitless y la notch nav, que ya están mergeados y deployados en producción. El preview de la rama mostraba la identidad vieja (violeta OTC), así que probar "el flujo entero" ahí habría sido probar contra algo que ya no existe.

**Por qué el merge fue barato:** un solo conflicto, en `CHANGES.md`, y puramente aditivo — dos bloques de entradas de changelog que no se pisan. Se conservaron los dos.

**Por qué la UI de embudos no necesitó tocarse:** está escrita **sólo con tokens del design system** (`primary`, `border`, `muted-foreground`) y colores semánticos de estado (`amber` para huecos de instrumentación). El rebranding migró 462 clases `violet`/`purple`/`indigo` hardcodeadas; la UI de embudos no tenía ninguna, así que hereda el naranja Limitless automáticamente.

**Verificación ejecutada tras el merge:**
- `pnpm test`: **414 tests, todos en verde**.
- `tsc --noEmit` limpio, `pnpm lint` sin errores, `pnpm build` completo.

**Riesgo que queda:** la notch nav viene detrás del flag `NEXT_PUBLIC_NAV_STYLE=notch`. Sin la variable, el preview usa el sidebar clásico — que es donde vive el link a Embudos, y ese link **sólo aparece si la org tiene el add-on `embudos` activo**.

---

### 2026-08-30 — UI del módulo de Embudos, y los KPIs universales que no se mostraban

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `app/(platform)/funnels/*`, `components/funnels/*`, `app/funnels/actions.ts`, `lib/funnels/compute.ts`

**Qué se hizo:**
La interfaz del módulo, sobre el motor que ya existía.

**⭐ El hueco de motor que apareció al armar la UI.** `computeFunnel` calculaba los KPIs universales —la sección 03 entera del documento, incluidas las dos ratios que declara decisivas— pero **nunca los devolvía**: sólo se usaban de rebote cuando una plantilla los referenciaba como north-star. No había nada que mostrar porque no había nada que leer. Se agregó `kpis` a `ComputedFunnel`, **separado de `metrics`**: mezclarlos haría parecer que CAC o LTV son propiedad de ese embudo, cuando el documento los pone explícitamente por encima de cualquiera.

**⭐ El orden de la página es la jerarquía del documento, no una lista.** De arriba abajo: los tres punteros de la plantilla → los KPIs universales, con EPL vs CPL y LTV:CAC arriba y más grandes → el spine → la tabla paso a paso. Es literal:

> *"the stage-by-stage tables tell you WHERE a funnel is broken; these two ratios tell you WHETHER it is."*

Primero si funciona, después dónde falla.

**El switcher de embudos, que era el pedido original.** Se puede cambiar de embudo sin volver al índice, y **el período se conserva** al cambiar: mirar la misma ventana en embudos distintos, uno detrás del otro, es el trabajo real del usuario. Volver al índice y entrar de nuevo lo perdía.

**Las etiquetas `[Meta]` / `[Hyros]`, que el documento declara no negociables.** Cada cifra de la tabla de pasos lleva su fuente entre corchetes —forma literal del documento, conservada como convención de lectura y no traducida a un badge de color— y cada KPI lleva la suya, compuesta cuando cruza herramientas: el ROAS blended es `[Checkout + Meta]`, no `[Meta]` a secas.

**Verificación ejecutada:**
- `pnpm test`: **414 tests en 23 archivos, todos en verde** (6 nuevos sobre la salida de KPIs).
- `tsc --noEmit` limpio, `pnpm lint` sin errores, `pnpm build` completo.

**Decisiones de diseño:**
- **La tabla de pasos tiene dos columnas de origen, no una:** de dónde sale el número hoy y qué herramienta le asigna el estándar. Cuando no coinciden, la segunda se pinta en ámbar — el número es legítimo pero viene de otro lado, y eso hay que poder verlo.
- **Los huecos se separan por cómo se arreglan.** "Sin fuente configurada" se arregla en la pantalla de fuentes; "con fuente pero sin número" se arregla eligiendo un parámetro o esperando a que se acumule historial. Meterlos en el mismo aviso mandaría al usuario al lugar equivocado.
- **La conversión entre etapas se muestra en el conector, no dentro de la tarjeta:** pertenece al paso entre dos etapas, no a ninguna de las dos.
- **Una etapa salteada no lleva alerta.** El VSL no tiene Lead porque no hay opt-in: marcarlo como problema entrenaría al usuario a ignorar las alertas de verdad.
- **El índice muestra cuántos pasos tienen fuente, no un número de negocio.** Resolver cada embudo entero —con todas sus integraciones— para pintar una grilla de tarjetas sería caro y no ayuda a decidir a cuál entrar.
- **El índice lista la cobertura de las herramientas del estándar** con lo que cada una cubre hoy, para que el estado del módulo sea legible sin entrar a ningún embudo.

**Riesgos / deuda técnica pendiente:**
- ⏸️ **No hay semáforo de salud, a propósito.** Las bandas de la §04 siguen en pausa por decisión de Santiago. Pintar un número en verde o rojo es una afirmación sobre el negocio, y esa afirmación todavía no se habilitó. El código de `health-bands.ts` existe y está testeado; falta la orden de mostrarlo.
- No hay serie histórica ni sparklines: `funnel_period_snapshots` existe desde la Fase 1 pero el job que la puebla es de la Fase 5.
- La UI no tiene cobertura de Playwright — sigue como `[T-8]` en `docs/TESTING_BACKLOG.md`.
- El switcher es un menú propio y no el `DropdownMenu` de `@ai-coo/ui`: hace falta revisar si conviene unificarlo cuando se toque el design system.

---

### 2026-08-30 — Ola 3 (2/2): I-8 Hyros, y el ROAS by-source que no era by-source

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `supabase/migrations/20260830210000_hyros.sql`, `lib/hyros/*`, `app/hyros/actions.ts`, `lib/funnels/{types,compute,kpis,sources,resolve,instrumentation}.ts`, `components/integrations/hyros-connect-panel.tsx`, docs

**Qué se hizo:**
La última unidad del plan. Hyros es el dueño de la atribución según el documento: M05 (revenue atribuido), M06 (leads atribuidos), M07 (journeys), M08 (visitantes de landing) y M09 (opt-ins). **Con esto las diez unidades quedan construidas.**

**⭐ El hallazgo: el ROAS by-source no era by-source.** El KPI `roas_by_source` venía de la Fase 1 definido con `revenue ÷ spend` — **exactamente las mismas medidas que el blended**. Las dos tarjetas mostraban el mismo número y la etiqueta `[Hyros]` no significaba nada, justo lo que el documento declara no negociable:

> *"label each figure with its source — [Meta] for platform-reported, [Hyros] for attributed. The two never match exactly, and a report that mixes them without labels is how bad decisions get made."*

Se agregaron dos medidas nuevas al motor, `attributed_revenue` y `attributed_spend`, que salen las dos de Hyros. El texto de la fórmula **no se tocó**: el documento usa las mismas palabras para las dos ROAS, y una prueba de conformidad lo verifica. Lo que las distingue son las medidas, no el texto.

**Un bug que encontró un test.** El parser de importes limpiaba símbolos con `replace(/[^0-9.-]/g, "")`, y `"n/a"` quedaba como cadena vacía: `Number("")` es `0`. Un texto sin sentido se convertía en un cero real, que es precisamente lo que §9.1 prohíbe. Se agregó una guarda que exige al menos un dígito. **El test se escribió primero y falló; se corrigió la fuente, no el test.**

**Verificación ejecutada:**
- `pnpm test`: **408 tests en 23 archivos, todos en verde** (13 nuevos).
- `tsc --noEmit` limpio, `pnpm lint` sin errores.
- Migración **aplicada** al proyecto Supabase de OTC.

**Decisiones de diseño:**
- **Se usa `/attribution/ad-account` y no `/attribution`.** El segundo exige `ids` a nivel campaña o adset: habría que enumerar cada campaña antes de poder preguntar nada. El primero toma la cuenta entera.
- **El modelo de atribución forma parte de la llave de caché.** `last_click`, `first_click` y `scientific` responden preguntas distintas sobre el mismo período: compartir caché mostraría el número de un modelo bajo la etiqueta de otro.
- **`new_visits` y no `clicks` para M08.** Un mismo visitante puede clickear varias veces.
- **Un campo que ninguna cuenta reporta es `null`, no `0`.** Si al menos una lo reporta, las que no cuentan como cero: ahí sí hay señal de que el campo existe.
- **Una cuenta que falla no invalida a las demás**, pero el total pasa a ser parcial: el error se registra, se muestra, y la respuesta **no** se marca como definitiva.
- **`is_active` por cuenta publicitaria no se pisa en el sync.** Es una decisión del usuario sobre qué entra en los totales, no un dato de la API.

**Efecto colateral que vale registrar:** con Hyros en `partial`, **ninguna herramienta del documento quedó en estado `missing`**. `blockingTools()` comparaba contra ese literal y TypeScript marcó la comparación como imposible — una señal, no un error. Se reescribió con el tipo ancho para que siga encontrando herramientas nuevas sin integrar.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **La documentación no dice qué plan de Hyros incluye la API.** Un `401`/`403` al conectar puede ser la key o el plan, y no se puede distinguir desde la respuesta.
- ⚠️ **Casi todos los endpoints de Hyros ignoran en silencio los parámetros mal escritos** y devuelven `200` con datos distintos a los pedidos. Un `fromDate` mal escrito devolvería la lista completa de leads, que se leería como un pico de opt-ins que nunca ocurrió. Por eso los nombres de parámetro se construyen en un solo lugar.
- La verificación que decide la unidad es **comparar el revenue atribuido contra el dashboard de Hyros**, y comprobar que el by-source y el blended den **distinto** — `docs/PLAN_VERIFICACION.md` §10.2.
- Los webhooks de Hyros (`sale.attributed`, `lead.opted.in`, firma `X-Hyros-Signature`) no están implementados: hoy todo es pull. Sería la vía de tiempo real.

---

### 2026-08-30 — Ola 3 (1/2): I-9 retención y I-10 triggers de Zernio

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/payments/{retention,aggregate}.ts`, `lib/zernio/triggers.ts`, `lib/funnels/{sources,resolve}.ts`, docs

**Qué se hizo:**
Dos unidades de la Ola 3. Ninguna necesitó integración nueva ni migración: las dos son cálculo sobre datos que ya existen.

**I-9 — retención y compras repetidas (M32, M33).** Son las dos medidas que faltaban para **LTV**, y por lo tanto para **LTV:CAC**, una de las dos ratios que el documento llama decisivas. Salen de `payment_orders` y `payment_transactions`, que I-2 ya puebla.

⭐ **M32 no se puede medir dentro del período del embudo.** En una ventana de 7 días casi todo cliente tiene exactamente una compra, así que "compras por cliente" daría ~1.0 y el LTV colapsaría al AOV. Se mide sobre una ventana de **365 días** hacia atrás desde el fin del período: cuántas veces compra un cliente es una propiedad lenta del negocio, no una métrica semanal.

⭐ **M33 devuelve `null` en dos casos, y ninguno es cero.** Si la org no tiene ninguna orden recurrente, la retención no aplica a un negocio de pago único — devolver `0` sería catastrófico, porque el LTV multiplica por este factor y quedaría en cero, diciendo que el negocio no vale nada; devolver `1` inventaría una retención perfecta que nadie midió. Y si hay órdenes recurrentes pero todas empezaron dentro del período, no hay cohorte: es demasiado pronto para preguntarse si siguieron pagando.

**I-10 — triggers de Zernio (M34).** La etapa Click del embudo DM, o sea lo que ocurre *antes* de que exista la conversación. El documento no le asigna herramienta y es la única fila con benchmark `context-set`.

⭐ **`listComments` es un inbox, no un historial.** No acepta filtro de fecha ni cursor: devuelve una ventana reciente de tamaño desconocido. Contar lo que cae dentro del período y presentarlo como el total sería reportar un número incompleto como completo. La única evidencia de que la ventana cubre el período es **haber visto un comentario más viejo que su inicio**; si no, el resolver devuelve `null`. Es el período ciego de GHL entrando por otra puerta.

⛔ **Las historias no se pueden contar en un período, y no es un límite de OTC.** Meta sólo expone las historias **vigentes**, o sea 24 horas. Para cualquier período que no sea "hoy" el dato no existe del lado de Meta. M34 queda cubierta por ads (Meta) + comentarios (Zernio), y la parte de historias se documenta como imposible en vez de quedar como un pendiente que nunca se va a cerrar.

**Verificación ejecutada:**
- `pnpm test`: **395 tests en 22 archivos, todos en verde** (23 nuevos).
- `tsc --noEmit` limpio, `pnpm lint` sin errores.
- Sin migraciones: las dos unidades leen tablas que ya existían.

**Decisiones de diseño:**
- **`customerKey` se exportó de `aggregate.ts` en vez de duplicarse.** La identidad del comprador tiene que resolverse igual en las dos medidas o los conjuntos no cruzan.
- **En M32, las órdenes anónimas se excluyen del numerador Y del denominador.** Contarlas arriba y no abajo inflaría el promedio; contarlas abajo como clientes distintos lo hundiría. Sin identidad, la orden no participa.
- **Un reembolso no cuenta como pago para la retención.**
- **El borde de la ventana de comentarios se trata de forma estricta:** si el más antiguo cae justo en el inicio del período, también devuelve `null`. Erramos hacia "sin datos" antes que afirmar un cero que no se puede sostener.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **Las definiciones de M32 y M33 son una interpretación, no una cita.** El documento escribe `LTV = AOV × purchases × retention` y no define ninguno de los dos últimos factores. La verificación que decide la unidad es **comparar el LTV que muestra OTC contra el que el cliente ya usa** — está en `docs/PLAN_VERIFICACION.md` §8.
- Observación sobre la fórmula del documento: `AOV × purchases` ya da "revenue por cliente", y multiplicar eso por una retención < 1 lo **reduce**, cuando lo habitual es que la retención extienda el lifetime. Se implementó **fiel al documento**; si al contrastar contra el número del cliente no cierra, es acá donde hay que mirar.
- La nota del documento sobre LTV proyectado para suscripciones y planes de pago no está implementada.

---

### 2026-08-30 — Debate WebinarJam vs VTurb, y los dos huecos que dejó al descubierto

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `lib/funnels/{sources,resolve}.ts`, `lib/vturb/{resolve-stats,stats}.ts`, `app/funnels/actions.ts`, `components/funnels/funnel-bindings-form.tsx`, `docs/FUNNELS_SOURCE_MAP.md`

**Qué se hizo:**
Santiago propuso quedarse sólo con VTurb y borrar I-5, razonando que las dos plataformas hacen lo mismo y que así se evitaba el trámite de la API key de WebinarJam. El debate cerró en que **no se puede**, y de paso dejó a la vista dos huecos reales.

**La decisión y su razón.** Las tres métricas del webinar (asistió / se quedó / clickeó) miden efectivamente lo mismo que las tres del VSL, así que la intuición era razonable. Pero la diferencia que el documento encoda no es el reproductor: es que **el embudo Webinar es "Registration-led" y tiene etapa Lead ("Registration opt-in"), y el VSL no la tiene**. VTurb es un reproductor de un archivo grabado; WebinarJam es una plataforma de eventos. Con la respuesta de Santiago —**los clientes corren sus webinars en vivo, a una hora fija**— queda cerrado: en un webinar en vivo no hay archivo que reproducir, así que no hay nada que VTurb pueda medir. I-5 se queda y la aprobación de su API key es el camino crítico real del embudo Webinar.

**Corrección de algo que yo mismo había argumentado.** Presenté "recuperar M16 con VTurb" como un punto a favor de la propuesta. Aplica sólo al caso evergreen: **con webinars en vivo M16 sigue sin fuente posible**. La fuente se agregó igual, pero no resuelve lo que yo había dicho que resolvía.

**Hueco 1 — M16 (`vturb_cta_clicks`).** VTurb expone `total_clicked` y un endpoint de clicks por segundo del video. Es la medida que WebinarJam no da. Se agregó como fuente sólo para la etapa Intent: un click al CTA es intención declarada, y bindearlo a Sales Conv. contaría clicks como si fueran ventas.

**Hueco 2 — las fuentes de formulario.** M17 y M18 figuraban en el mapa como ✅ "ya medibles" desde antes del módulo de embudos, pero **nunca se creó la fuente**: los datos existían en `form_responses` y el módulo no los podía usar. Es la única fila del documento que OTC cubría entera y estaba desconectada. Se agregaron `form_submissions` y `form_qualified`.

**Verificación ejecutada:**
- `pnpm test`: **372 tests en 20 archivos, todos en verde** (8 nuevos).
- `tsc --noEmit` limpio, `pnpm lint` sin errores.
- Sin migración: las tablas ya existían.

**Decisiones de diseño:**
- **`form_submissions` sirve para dos etapas.** El documento le da dos roles al mismo formulario: opt-in de registro en el webinar (Lead, M13) y aplicación en el VSL (Intent, M17). Es la primera fuente del catálogo con esa doble lectura, y es fiel al documento, no una comodidad.
- **Sólo cuentan las respuestas completas.** Una respuesta a medias no es una aplicación enviada.
- **⭐ M18 resuelve a `null` si ninguna respuesta del período tiene calificación de la IA.** Cero calificadas diría que ninguna aplicación servía; la verdad sería que nadie las evaluó. Mismo criterio que las llamadas de cierre sin resultado cargado.
- **Los clicks al CTA no dependen del pitch time.** Son un evento propio, así que siguen disponibles en un player que no tiene configurado el segundo de la oferta — a diferencia de M12.
- **Se dejó constancia del debate en el mapa de fuentes**, con la tabla comparativa y la condición bajo la cual la decisión cambiaría (si un cliente pasa a evergreen, ese embudo se arma sin WebinarJam y las fuentes ya existen).

**Riesgos / deuda técnica pendiente:**
- ⚠️ **`total_clicked` no tiene descripción en el spec de VTurb**, como ninguno de sus campos. Se asume "clicks en el botón del reproductor". Falta confirmarlo contra el dashboard.
- M09 (opt-ins de landing) sigue sin fuente: no es lo mismo que M13. Sale de Hyros en I-8.
- 🔑 La API key de WebinarJam pasa de "trámite pendiente" a **bloqueo del embudo Webinar**: sin ella, tres de sus siete pasos no tienen datos.

---

### 2026-08-30 — I-5: WebinarJam / EverWebinar, y una medida que la API no da

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `supabase/migrations/20260830190000_webinarjam.sql`, `lib/webinarjam/*`, `app/webinarjam/actions.ts`, `lib/funnels/{sources,resolve,instrumentation}.ts`, `components/integrations/webinarjam-connect-panel.tsx`, `components/funnels/funnel-bindings-form.tsx`, docs

**Qué se hizo:**
La unidad I-5, que cierra la Ola 2: M13 (registrados), M14 (asistieron, vivo + replay) y M15 (se quedaron hasta la oferta).

**Se persisten las personas, no los totales.** `/registrants` **no acepta un rango de fechas arbitrario**: su filtro `date_range` es una lista de presets (hoy, esta semana, últimos 30 días). El módulo de embudos pregunta por períodos arbitrarios, así que la única forma de responder es traer las filas y recortarlas del lado de OTC por `signup_date` y por las fechas de asistencia, que sí vienen por registrante. De ahí `webinarjam_registrants`, una fila por persona y sesión.

**M15 se pide filtrada al servidor, no se deriva.** `attended_live=4` con `attended_live_timestamp = <segundo de la oferta>` devuelve exactamente los que asistieron y se fueron después de ese segundo — WebinarJam lo calcula de su lado. Eso evita depender de `time_live`, que la doc declara `string` sin decir si son segundos, `mm:ss` o `hh:mm:ss`. El segundo de la oferta lo carga el usuario en el panel de Integraciones porque **la API no lo publica**, a diferencia de VTurb que sí expone el `pitch_time` de cada player.

**⛔ M16 (clicks al CTA durante el webinar) no se puede medir, y eso se dice.** La API no lo expone por ninguna vía. Lo más cercano que da es `purchased_live` —compró en la sala—, que es **conversión y no intención**: presentarlo como clicks al CTA sería inventar la medida. El paso `webinar.cta` del embudo se queda sin fuente a propósito, ninguna fuente de WebinarJam se ofrece para él, y el panel explica por qué.

**No hay que elegir entre WebinarJam y EverWebinar.** Son la misma API con dos prefijos: mismos endpoints, mismos parámetros, mismos campos. El sync consulta los dos y guarda de dónde vino cada webinar, así que la pregunta "cuál usa este cliente" desaparece.

**Verificación ejecutada:**
- `pnpm test`: **364 tests en 20 archivos, todos en verde** (13 nuevos de normalización de registrantes).
- `tsc --noEmit` limpio, `pnpm lint` sin errores.
- Migración **aplicada** al proyecto Supabase de OTC.

**Decisiones de diseño:**
- **Los `schedule` id sólo salen del detalle.** `/webinars` devuelve los horarios como texto ("Every day, 01:00 PM"); `/registrants` necesita el id, que está en `/webinar`. Por eso el sync pide el detalle de cada webinar. Además la doc avisa que **el id de la API no coincide con el que se ve en la pestaña Schedules del panel** — queda anotado en el código.
- **Los tres campos de asistencia son nullable.** `NULL` significa "la API no lo dijo"; `false` afirma que la persona no asistió. Contar como ausente a alguien de quien no se sabe nada hundiría el show rate sin motivo.
- **Las fechas se parsean por magnitud.** La doc declara `signup_date` como `integer` sin la unidad; se decide segundos vs milisegundos por el valor, y lo que no se entiende queda en `NULL` en vez de caer en 1970.
- **El sync de webinars no pisa `pitch_second`.** Es configuración del usuario, no dato de la API.
- **M13 se cuenta por fecha de registro y M14 por fecha de asistencia.** Son dos preguntas distintas y el documento las separa en dos filas.

**Riesgos / deuda técnica pendiente:**
- 🔑 **Nada de esto se puede probar sin la API key, que requiere aprobación previa de WebinarJam.** Es el bloqueo de la unidad y conviene pedirla ya — `[WEBINARJAM-API-KEY]` en `PENDIENTES.md`.
- ⚠️ **El ejemplo de `/registrants` en la doc es una captura de pantalla**, así que no se sabe bajo qué clave viene el array. El cliente acepta `registrants`, `users` y `data`; con el primer response real hay que dejar sólo la correcta.
- ⚠️ **La tabla de valores de `attended_live` como campo de respuesta no está publicada** — la doc sólo documenta la del parámetro de filtro. Se asumió `0` = no, positivo = sí.
- `lib/webinarjam/sync.ts` no tiene tests de orquestación — quedó como `[T-6d]` en `docs/TESTING_BACKLOG.md`.

---

### 2026-08-30 — I-6: VTurb, el video de la landing

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `supabase/migrations/20260830170000_vturb.sql`, `lib/vturb/*`, `app/vturb/actions.ts`, `lib/funnels/{sources,resolve,instrumentation}.ts`, `components/integrations/vturb-connect-panel.tsx`, `components/funnels/funnel-bindings-form.tsx`, docs

**Qué se hizo:**
La unidad I-6: M08 (visitantes de la página), M10 (reproducciones), M11 (% promedio visto) y M12 (llegaron al CTA). Cubre la etapa Engaged del embudo VSL, que hasta ahora no tenía ninguna fuente posible.

**La decisión de arquitectura que define la unidad: caché por período, no métricas diarias.** `ad_metrics_daily` guarda una fila por día y el resolver suma. Con VTurb eso da un número sin significado, porque **`engagement_rate` es un promedio** y el promedio de los promedios diarios no es el promedio del período — cada día pesa distinto según cuántas sesiones tuvo. Así que se le pide a VTurb el período exacto y se cachea la respuesta cruda por `(player, start_date, end_date)`. Un período que ya terminó se marca `is_final` y no se vuelve a pedir nunca; uno que incluye hoy se refresca cada 30 minutos. Eso además respeta las cuotas de VTurb, que son ajustadas (60-800 requests por minuto según el plan, y una sola llamada HTTP puede contar como más de una query).

**La regla propia de esta integración: `pitch_time = 0` no es un pitch time.** VTurb devuelve `total_over_pitch`, que es exactamente M12 —cuántos vieron el video pasado el segundo de la oferta— y además publica el `pitch_time` configurado de cada player, así que no hay que configurarlo a mano. Pero para los players que no lo tienen puesto, VTurb devuelve `pitch_time = 0`, y entonces `total_over_pitch` cuenta a **los que vieron más de 0 segundos**: casi todo el mundo. Es un número que parece M12 y no lo es, y mostrarlo sería peor que no mostrar nada. `isUsablePitchTime` lo rechaza, la medida resuelve a `null` con el motivo `no_pitch_time`, y el panel de integraciones avisa cuántos videos están en esa situación, porque se arregla en VTurb y no en OTC.

**Verificación ejecutada:**
- `pnpm test`: **351 tests en 19 archivos, todos en verde** (20 nuevos de VTurb).
- `tsc --noEmit` limpio, `pnpm lint` sin errores.
- Migración **aplicada** al proyecto Supabase de OTC.

**Decisiones de diseño:**
- **`engagement_rate` se toma de `/times/user_engagement`, no de `/sessions/stats`.** Los dos endpoints lo devuelven, pero sólo el primero documenta su fórmula (`average_watched_time / video_duration * 100`). El segundo queda como respaldo.
- **Camino de respaldo para M12 por la curva de retención.** Si `total_over_pitch` no viene, se busca en `grouped_timed` el último punto en o antes del segundo del pitch. La curva no viene segundo a segundo, así que ese punto es la última cantidad conocida de gente que seguía mirando.
- **`end_date` se manda siempre, explícito.** Las release notes de VTurb documentan un bug —vivo hasta 2026-05-07— donde tres endpoints lo ignoraban y devolvían datos hasta "ahora", inflando cualquier ventana histórica corta.
- **Una llamada por player, no por step.** Tres pasos del embudo VSL pueden apuntar al mismo video; `resolveFunnel` memoiza la consulta.
- **`avg_watch_pct` va en `measures.reported`,** no como conteo de step: el documento lo modela como métrica sin denominador y es un promedio que reporta el player, no un cociente entre etapas.
- **El selector de parámetros del formulario de fuentes se generalizó.** Antes era un selector de etapa de GHL; ahora es un componente que sirve para cualquier fuente configurable, y cambiar de fuente descarta el parámetro anterior — una etapa de GHL no significa nada para una fuente de VTurb.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **El spec de VTurb no describe ni un solo campo de `Stats`.** Se asumió `total_viewed` = visitantes de página y `total_started` = reproducciones. Falta confirmar contra el dashboard, y sobre todo **qué deduplican los sufijos `_device_uniq` y `_session_uniq`**: si el dashboard muestra el valor único y OTC el bruto, los números no van a coincidir. Anotado en `docs/API_DOCS_PENDIENTES.md` §4 y `docs/PLAN_VERIFICACION.md` §6.2.
- ⚠️ **`X-Api-Version` sin resolver.** La página de autenticación dice `v1`, el spec declara `v3`. Se manda `v1`; si la primera llamada devuelve 401, es esto.
- `lib/vturb/stats.ts` no tiene tests de orquestación (caché, TTL, invalidación por `pitch_time`) — quedó como `[T-6c]` en `docs/TESTING_BACKLOG.md`.
- M09 (opt-ins de landing) sigue sin fuente: sale de Hyros en I-8, no de VTurb.

---

### 2026-08-30 — I-4: oportunidades de GoHighLevel y el historial de etapas que GHL no tiene

**Rama/branch:** `Claude-New-Features`
**Commits:** pendiente push
**Módulo(s) afectado(s):** `supabase/migrations/20260830140000_ghl_opportunities.sql`, `lib/ghl/{client,integration,opportunity-event,stage-transition,verify-webhook,ingest-opportunity-event,sync-pipelines}.ts`, `app/api/webhooks/ghl/route.ts`, `app/ghl/opportunity-actions.ts`, `lib/funnels/{sources,resolve}.ts`, `app/funnels/actions.ts`, `components/funnels/{funnel-bindings-form,funnel-steps-table}.tsx`, docs

**Qué se hizo:**
La unidad I-4 del mapa de fuentes: M21, M22, M23 y M25, que son 4 de los 6 pasos del embudo DM.

**El problema que resuelve, y por qué no era un sync más.** La documentación verificada confirmó que **la API v3 de GHL no expone historial de cambios de etapa**: no hay endpoint de historial, la búsqueda no filtra por transición, y `OpportunityStageUpdate` trae la etapa nueva pero no la anterior ni el momento del cambio. El documento fuente, en cambio, pide conteos por etapa **durante un período**. Con sólo el REST, una oportunidad que pasó por Lead → Engaged → Intent dentro del período se contaría una sola vez, en la etapa donde quedó.

Así que OTC construye su propio historial. `ghl_stage_transitions` guarda cada transición derivada contra la última etapa conocida en `ghl_opportunities`, que existe justamente para eso: el webhook no trae la etapa de origen, hay que recordarla.

**El período ciego, que es la parte que más importa.** Ese historial arranca con el primer webhook. Antes de esa fecha OTC no sabe nada, y las cero transiciones que devolvería la consulta significan "no lo estábamos mirando", no "no pasó nada". `ghl_integrations.stage_history_since` marca el borde; cualquier período que empiece antes resuelve a `null` con motivo `outside_history` y la UI dice "Fuera del historial registrado". Es la regla del `null` vs `0` (§9.1) aplicada al tiempo. Un período que **cruza** el borde también resuelve a `null`: un conteo parcial presentado como completo es peor que un hueco visible.

**El bloqueo de entrega, y cómo se resolvió sin esperar a GHL.** Los webhooks de plataforma se configuran **dentro de una app del Marketplace**, que OTC no tiene aprobada (`[FEAT-GHL-OAUTH]`). El endpoint acepta por eso **dos vías de autenticación**:
- **Firma Ed25519** (`X-GHL-Signature`) con la clave pública de GHL, más la RSA legacy por el período de transición. Es lo que va a usar la app del Marketplace cuando exista, y resuelve la org por el `locationId` del payload.
- **Secreto compartido por organización**, para eventos que el cliente entregue desde una acción "Webhook" de un Workflow de su sub-cuenta. Es la vía que funciona **hoy**.

Una firma inválida **no** cae al secreto compartido: si cayera, quien conociera el secreto podría hacer pasar eventos por firmados por la plataforma.

**Configuración por paso.** `ghl_stage_entered` no significa nada sin saber a qué etapa se refiere, así que el binding guarda `{ stageId }` en `funnel_step_bindings.config` y el usuario la elige de un selector poblado por `syncGHLPipelinesForOrg`. Sin elegirla, el paso resuelve a `null` con motivo `missing_config` y la UI dice "Falta elegir la etapa" — un hueco de configuración es distinto de un hueco de historial y de un cero, y los tres se arreglan distinto.

**Verificación ejecutada:**
- `pnpm test`: **331 tests en 17 archivos, todos en verde** (34 nuevos entre `opportunity-event`, `stage-transition`, `verify-webhook` y `missingSourceConfig`).
- `tsc --noEmit` limpio, `pnpm lint` sin errores.
- Migración **aplicada** al proyecto Supabase de OTC.

**Decisiones de diseño:**
- **`occurred_at` es la hora de recepción, no `dateAdded`.** `dateAdded` es la fecha de creación de la oportunidad y no cambia con las transiciones: usarla pondría las tres transiciones de una misma oportunidad en la fecha de su alta, y el conteo por período sería falso. Hay un test que fija esto.
- **La etapa de origen de la primera transición queda en `NULL`.** Una oportunidad que apareció por primera vez en la etapa 5 pudo haber pasado por las anteriores sin que OTC lo viera; decir que vino de la 1 sería afirmar un recorrido que nadie observó.
- **Las fuentes cuentan oportunidades distintas, no filas.** Si una vuelve a entrar a la misma etapa dos veces en el período, es una sola oportunidad que llegó ahí.
- **Una baja no es una transición.** Marca `status = 'deleted'` y no toca el historial: las transiciones que ya ocurrieron siguen siendo ciertas y siguen contando en su período.
- **Un `OpportunityUpdate` que sólo cambió el nombre no registra nada.** Sumar ahí inflaría los conteos de etapa con ediciones administrativas.
- **Los eventos que no son `Opportunity*` se descartan sin guardar.** No aportan al embudo y traen datos personales del contacto que no hace falta almacenar.
- **`Version: v3` sólo para opportunities.** El resto del cliente sigue con `2021-04-15`; se agregó un override por llamada en vez de migrar todo.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **El payload de la vía de Workflow no está documentado** — lo arma quien configura el workflow. El normalizador lo busca en varias capas y el evento crudo se persiste antes de interpretarse, pero la pregunta que decide la unidad sigue abierta: **si un Workflow de GHL puede mandar `pipelineStageId`**. Si no pudiera, esa vía sólo serviría para altas y I-4 quedaría atada a la aprobación del Marketplace. Anotado en `docs/API_DOCS_PENDIENTES.md` §3 y en `docs/PLAN_VERIFICACION.md` §5.2.
- ⚠️ **La doc no expande el objeto `pipeline` ni el `opportunity`.** Se guarda `raw` completo de los dos para poder corregir el mapeo con el primer response real sin volver a llamar a la API.
- No hay backfill: `searchGHLOpportunities` está construido pero sólo puede traer el estado actual, no el historial. Sirve para poblar la última etapa conocida de oportunidades preexistentes, y todavía no se usa.
- `lib/ghl/ingest-opportunity-event.ts` no tiene tests de orquestación — quedó como `[T-6b]` en `docs/TESTING_BACKLOG.md`.

---

### 2026-08-30 — FIX-EMBUDOS-I2: corrección del mapeo de pagos con la documentación real

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `lib/payments/{normalize,verify-signature}.ts`, `app/api/webhooks/{whop,fanbasis}/route.ts`, `lib/payments/__tests__/normalize.test.ts`, `docs/API_DOCS_PENDIENTES.md`, `docs/PLAN_VERIFICACION.md`

**Qué se hizo:**
Santiago capturó la documentación completa de los seis proveedores en `docs/external-apis/` (5.8 MB, con un `RESUMEN-OTC.md` por proveedor que responde las preguntas abiertas). Eso permitió **corregir el mapeo de pagos que se había construido a ciegas** y responder las preguntas de diseño de las unidades que faltan.

**Bugs reales encontrados y corregidos en I-2:**

1. **El monto de Whop estaba mal.** `KEYS.amount` no incluía `settlement_amount`. De las claves que buscaba, en el payload real de Whop sólo existen `total` y `subtotal`, que la doc define como *"para mostrarle al creador, excluyendo los fees del comprador"* — **no es lo que se le cobró al cliente**. El cash collected habría quedado sistemáticamente por debajo del real.
2. **La conversión de centavos se infería del sufijo `_cents`.** Whop manda **decimales** (10.43 = $10.43) y Commas manda **centavos** (2900 = $29). Convenciones opuestas entre los dos proveedores de la misma unidad. Ahora la unidad se declara por proveedor en `PROVIDER_CONFIG`.
3. **Los tipos de evento se detectaban por regex.** `membership.created` no existe en Whop; el alta es `membership.activated`. Reemplazado por listas literales.
4. **La identidad del comprador se buscaba sólo en la raíz.** Commas la anida bajo `buyer`, Whop bajo `user` / `member`.
5. **El valor contratado tomaba el monto del evento como si fuera el total.** En Commas es `amount_cents × auto_expire_after_x_periods`; si la suscripción es indefinida **no existe** un total contratado y ahora queda `unmapped` en vez de guardar la cuota como si fuera la promesa completa.

**Firmas — confirmadas, con un matiz:**
- Whop usa Standard Webhooks, como se había asumido. **La clave es el secreto `ws_...` literal**, no `whsec_` con base64: el código caía en la rama correcta por accidente y ahora está documentado.
- Commas firma con HMAC-SHA256 **hex** sobre el cuerpo crudo en `x-webhook-signature`. La cabecera ya estaba entre las candidatas; ahora es la primera.

**Diferencia operativa que se documentó en las rutas:**
Whop entrega *at least once* y reintenta ~3 días; **Commas entrega *at most once* y nunca reintenta**. Por eso la ruta de Commas responde 200 ante cualquier evento con firma válida: devolver un error perdería el evento para siempre.

**Respuestas a las preguntas de diseño que quedaban abiertas:**
- **GHL:** no hay endpoint de historial de etapas, pero **sí existe el webhook `OpportunityStageUpdate`**. I-4 tiene que persistir las transiciones en tabla propia. Ojo: `dateAdded` es la fecha de creación de la oportunidad, **no** el momento del cambio de etapa — hay que guardar la hora de recepción.
- **VTurb:** la retención viene como promedio y como curva por segundo, y además **VTurb tiene `pitch_time` nativo**: `total_over_pitch` da M12 ya calculado. I-6 baja a tamaño S y cubre también M08.
- **WebinarJam:** `/registrants` con `attended_live=4` + `attended_live_timestamp` devuelve directamente los que se quedaron pasado el segundo del pitch, o sea **M15 sin post-procesar**. Distingue vivo de replay en columnas separadas. **M16 (clicks al CTA) no está expuesto** — lo más cercano es `purchased_live`, que es conversión y no intención; no hay que presentarlo como si fuera lo mismo. La API key **requiere aprobación previa**.
- **Hyros:** `GET /api/v1.0/attribution` con `level` y `fields` da M05; `/leads/journey` con `includeEvents=true` da M07. ⚠️ Casi todos sus endpoints **ignoran en silencio los parámetros mal escritos** y devuelven 200 con datos distintos a los pedidos.

**Hallazgo de identidad:** **Fanbasis se llama Commas.** El rebranding cambió marca y documentación, no los hosts — el API se sigue sirviendo desde `www.fanbasis.com`, así que el id de proveedor en la base (`fanbasis`) no cambia y no hace falta migración.

**Verificación ejecutada:**
- `pnpm test`: **293 tests en 14 archivos, todos en verde** (33 de normalización reescritos con los payloads reales de la documentación).
- `tsc --noEmit` y lint: limpios.

**Decisiones de diseño:**
- **La configuración es por proveedor y no por heurística.** Adivinar la unidad por el sufijo del campo funcionaba de casualidad; un campo nuevo sin `_cents` se habría colado como si fuera unidad.
- **Los tests usan payloads copiados de la documentación**, no inventados, y varios existen sólo para fijar que el mapeo no vuelva a tomar el campo equivocado.
- **Una suscripción indefinida no tiene valor contratado.** Estimarlo sería inventar una promesa que el cliente nunca hizo.

**Riesgos / deuda técnica pendiente:**
- Sigue sin conectarse ninguna cuenta real — es lo que Santiago decidió dejar para el final. Los pasos están en `docs/PLAN_VERIFICACION.md` §3, ahora con las expectativas correctas.
- El backfill histórico no está construido: los dos proveedores exponen endpoints REST para traerlo (`GET /payments` en Whop, `/public-api/checkout-sessions/transactions` en Commas) y la API key ya se guarda en la UI, pero no se usa todavía.
- Whop desactiva endpoints que fallan 72 h seguidas y **no reenvía lo perdido**: si eso pasa hay que reconstruir por REST.

---

### 2026-08-30 — DOC-EXTERNAL-APIS-2: Whop, Commas, Hyros y WebinarJam bajados al repo

**Rama/branch:** `Claude-New-Features`  
**Commits:** `c70b578`  
**Módulo(s) afectado(s):** `docs/external-apis/` (4 proveedores nuevos), `docs/API_DOCS_PENDIENTES.md`, `CLAUDE.md`, `PENDIENTES.md`

**Qué se hizo:**
Segunda tanda de captura, después de GoHighLevel y VTurb. Santiago pasó las URLs de las
cuatro documentaciones que faltaban. **Las cuatro eran alcanzables**, así que el bloqueo
de red que motivó `API_DOCS_PENDIENTES.md` ya no existe para ningún proveedor.

- **`whop/`** — 897 páginas de `docs.whop.com` más los **3 specs OpenAPI oficiales**
  que Whop publica en `/openapi/*` (native 246 operaciones, stable/legacy 202, wallet
  stats 2). Referencia legible generada desde los specs.
- **`commas/`** — 42 secciones de `commasdocs.com`. **Fanbasis se rebrandeó a Commas**;
  `apidocs.fan` ya no es su documentación, aunque el API sigue en `www.fanbasis.com`.
- **`hyros/`** — los **3 specs OpenAPI 3.1** vigentes de `api-docs.hyros.com/ai-context/`
  (REST v1.40, webhooks, MCP), el documento viejo de Apiary (v1.37) y **482 guías** de
  `docs.hyros.com`.
- **`webinarjam/`** — los 17 artículos de API del centro de ayuda, con los links
  internos reescritos al slug real.
- **Un `RESUMEN-OTC.md` por proveedor**, que responde una por una las preguntas de
  `API_DOCS_PENDIENTES.md` §1, §2, §5 y §6.
- **`tools/`**: se sumaron `render.py` (Chromium), `crawl_hyros.py`, `openapi_md.py`
  (OpenAPI 3.x → markdown, reutilizable), y un build por proveedor. `regenerar.sh` ahora
  toma proveedores como argumento.

**Por qué / finalidad:**
Las tres olas de integración quedan con documentación local. Dos de las unidades ya
construidas (Whop y Commas, la capa de pagos) se pueden corregir contra los specs reales
en vez de esperar a que llegue el primer webhook.

**Los hallazgos que cambian código o diseño:**
- **Whop no manda centavos: manda decimales en la unidad de la moneda.** El spec lo dice
  textual (*"10.43 for $10.43 USD"*). Y **ninguna de las claves de monto que busca
  `normalize.ts` existe en su payload**: busca `settled_amount`, el campo es
  `settlement_amount`. `total` y `subtotal` sí existen pero son otra cosa (*"to show to
  the creator, excluding buyer fees"*).
- **Commas sí manda centavos (`amount_cents`).** Los dos proveedores de la misma unidad
  usan convenciones opuestas: la regla no puede ser una heurística de sufijo.
- **La firma de Commas quedó confirmada**: `x-webhook-signature`, HMAC-SHA256 hex sobre
  el body crudo, secreto sin transformar. Era la pregunta que bloqueaba toda la ruta.
- **La firma de Whop también**, con un detalle: el prefijo del secreto es `ws_`, no
  `whsec_`, y se usa como clave literal.
- **`membership.created` no existe en Whop.** El evento de alta es `membership.activated`.
- **WebinarJam resuelve M15 del lado del servidor**: el filtro `attended_live=4` +
  `attended_live_timestamp=<segundo>` devuelve los que se quedaron más allá del pitch.
  En cambio **M16 (clicks al CTA) no existe** — sólo hay `purchased_live`.
- **Hyros confirma que `I-7` no hace falta**: M08 y M09 salen de `/leads` y del reporte
  de atribución. Y `fields=cost` cubre M01, así que tampoco hace falta cruzar la API de
  cada plataforma de ads.

**Decisiones de diseño:**
- **Cuando el proveedor publica un spec, el spec es la fuente.** Whop y Hyros lo
  publican; VTurb lo embebe. Se guardan los specs y la referencia se genera de ahí, en
  vez de raspar la página de cada endpoint. En Whop eso además evita duplicar 18 MB: cada
  página de `api-reference` re-embebe el spec entero, 548 veces.
- **`openapi_md.py` es un conversor genérico**, no uno por proveedor: resuelve `$ref`,
  `oneOf`/`anyOf`/`allOf`, enums, y la sección `webhooks:` de OpenAPI 3.1.
- **Commas y Hyros se renderizan con Chromium** porque son SPAs que no sirven HTML.
  Chromium necesita `--proxy-server` y `--ssl-version-max=tls1.2` para atravesar el proxy
  del entorno; sin eso el handshake se corta. **No se desactiva la verificación TLS.**
- **Los links entre guías de Hyros se reconstruyen por título**, porque las tarjetas
  "View guide" son botones de React sin `href`. Lo que no matchea queda como texto: no se
  inventa un destino.
- **Hyros se crawlea hasta converger.** El bundle sólo declara 283 rutas; siguiendo las
  tarjetas aparecen 482 páginas reales.

**Riesgos / deuda técnica pendiente:**
- **La capa de pagos sigue sin corregir.** Este cambio documenta qué está mal, no lo
  arregla: `normalize.ts` sigue sin `settlement_amount` y con el regex de
  `membership.created`. Queda como `[EMBUDOS-PAGOS-CORREGIR]` en `PENDIENTES.md`.
- La copia pesa ~27 MB, casi todo Whop. El README explica qué se puede podar si molesta.
- **La API key de WebinarJam requiere aprobación previa** — conviene pedirla ya, es el
  camino crítico de I-5.
- Hyros tiene dos referencias con versiones distintas (spec v1.40 vs Apiary v1.37). Si
  difieren, manda el spec; está anotado en su INDEX.
- De GoHighLevel y WebinarJam siguen faltando cosas que la fuente no publica (schemas de
  respuesta sin expandir, unidades de `time_live`). Están en cada `RESUMEN-OTC.md`.

---

### 2026-08-30 — Relevamiento de 4 componentes de 21st.dev

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `docs/COMPONENTES_21ST.md` (nuevo), `PENDIENTES.md`

**Qué se hizo:**
Santiago pasó cuatro URLs de componentes de 21st.dev y pidió bajarlos a un documento markdown: uso, prompts y todo lo necesario para integrarlos, investigando primero cómo funciona 21st.dev y qué hay que conectar.

- **`docs/COMPONENTES_21ST.md`**: cómo funciona 21st.dev (CLI `@21st-dev/cli` v1.16.1, registry shadcn, MCP, autenticación con key `21st_sk_…`, modelo de cobro), el estado del repo frente a lo que piden los componentes, una ficha por componente con su comando de instalación, dependencias npm y de registry, código de uso real, API y ajustes concretos para OTC, cinco prompts listos para pegar en una sesión de agente, checklist de integración y un resumen ejecutivo con la recomendación para cada uno.
- Los cuatro componentes son: `arunachalam/adaptive-notch-navigation-bar`, `ruixen.ui/dropdown-range-date-picker`, `sean0205/statistics-card-1` y `sean0205/tabs` (variante `button`).
- **`PENDIENTES.md`**: ítem `[UI-21ST]` con las cuatro decisiones abiertas.

**Por qué / finalidad:**
Bajar componentes de un marketplace a un monorepo que ya tiene design system propio no es copiar y pegar: el CLI resuelve dependencias de registry y escribe primitivas ajenas en `apps/web/components/ui/`, que es exactamente donde no queremos que vivan. El documento existe para que la decisión de qué instalar y qué portar esté tomada antes de correr el primer comando.

**Decisiones de diseño:**
- **El documento dice explícitamente qué no se pudo leer.** El registry de 21st.dev devuelve 403 sin credenciales, así que el código interno de los componentes no está en el documento — solo los demos, que sí son públicos y están extraídos verbatim del HTML servido. Las props documentadas se marcan como "las que usa el demo", no como una API completa. Nada se rellenó con una suposición.
- **La recomendación difiere por componente en vez de ser una sola.** Dos de los cuatro (tabs y statistics card) son cosas que ya tenemos con otro look: instalarlos duplicaría `Tabs`, `Card`, `Badge` y `DropdownMenu`. Para esos la recomendación es portar la variante o el detalle que aportan a `packages/ui/src/primitives/`, no instalarlos. Los otros dos sí llenan huecos reales.
- **Los prompts están escritos para que el agente respete `CLAUDE.md`.** Cada uno incluye el paso de `add --print` antes de escribir archivos, la traducción de imports a `@ai-coo/ui`, el arreglo de clases de Tailwind v4 y la actualización de `CHANGES.md`.
- **Se documentó el desfase de Tailwind.** El repo está en v3.4 y los componentes publicados en 2026 asumen v4: `shadow-xs` y `h-8.5` no generan CSS y fallan en silencio, sin romper el build. Es el error más probable de la integración y por eso está en el checklist.

**Riesgos / deuda técnica pendiente:**
- **El date picker de Ruixen UI no declara licencia** (`license: ""` en la metadata del registry). Los otros tres son MIT. Hay que resolverlo antes de que ese componente entre a producción.
- No hay sesión de 21st.dev en este entorno, así que nada de esto está probado de punta a punta: la sección 7 del documento lista qué queda por verificar y con qué comando.
- El Notch Nav choca con la regla de `CLAUDE.md` de que la navegación es solo sidebar. El documento propone montarlo en landing/founder, pero es una decisión de producto que Santiago tiene que confirmar.
### 2026-08-30 — DOC-EXTERNAL-APIS: documentación de GoHighLevel y VTurb bajada al repo

**Rama/branch:** `Claude-New-Features`  
**Commits:** `9dc02ca`  
**Módulo(s) afectado(s):** `docs/external-apis/` (nuevo), `docs/API_DOCS_PENDIENTES.md`, `CLAUDE.md`, `PENDIENTES.md`

**Qué se hizo:**
Santiago pidió bajar a tierra la documentación de las dos APIs que faltan para la ola 2
(VTurb para I-6 y GoHighLevel para I-4) y guardarla en el repo. Ambos dominios, que el
2026-08-29 figuraban como bloqueados, resultaron alcanzables.

- **`docs/external-apis/gohighlevel/`** — 948 páginas de
  `marketplace.gohighlevel.com/docs` convertidas a markdown: 634 endpoints REST y 77
  eventos de webhook. Cada archivo lleva front-matter con su URL de origen, sección,
  versión de API y —en los endpoints— método y path. Más `INDEX.md` (por recurso) y
  `ENDPOINTS.md` (tabla plana por path).
- **`docs/external-apis/vturb/`** — las 8 páginas (pt + en) de `vturb.gitbook.io`, y un
  **`openapi.json`** con los 28 endpoints, reconstruido uniendo los documentos OpenAPI
  3.0.2 que la propia doc embebe uno por endpoint. De ese spec se genera `ENDPOINTS.md`.
- **Dos `RESUMEN-OTC.md`** que responden una por una las preguntas que
  `API_DOCS_PENDIENTES.md` §3 y §4 dejaron abiertas, y dicen qué cambia en el diseño de
  cada unidad.
- **`docs/external-apis/tools/`** — los scripts que generan todo, con `regenerar.sh`
  como único punto de entrada. Probado de punta a punta.
- `API_DOCS_PENDIENTES.md`: §3 y §4 pasan a resueltas; la regla permanente ahora
  arranca con "probá la URL antes de asumir que está bloqueada". `CLAUDE.md` regla 3
  apunta a la copia local.

**Por qué / finalidad:**
Las dos unidades de la ola 2 se iban a construir a ciegas, como se construyó la capa de
pagos. Teniendo la documentación adentro del repo, se construyen leyendo. Y la copia
sirve a todas las sesiones que vengan, sin depender de que la red del entorno remoto
coopere ese día.

**Los dos hallazgos que cambian diseño:**
- **GHL no expone historial de cambios de etapa.** No hay endpoint, no hay filtro por
  transición, y el webhook `OpportunityStageUpdate` trae la etapa nueva pero no la
  anterior ni el timestamp. Los conteos por etapa en un período (M21–M23, M25) **no se
  pueden leer de la API**: I-4 tiene que construir su propio historial desde los
  webhooks y mostrar explícitamente el período ciego anterior a la suscripción.
- **VTurb da la curva de retención, no sólo el promedio** — y además ya modela el CTA.
  `/times/user_engagement` devuelve `grouped_timed[]` (segundo → usuarios) junto con
  `average_watched_time` y `engagement_rate`; `/sessions/stats` devuelve
  `total_over_pitch` y `/players/list` el `pitch_time` de cada player. M12 sale directo
  en vez de haber que derivarlo, y el segundo del CTA no hay que configurarlo a mano.

**Decisiones de diseño:**
- **De GHL se capturó sólo la versión *current* (v3).** El sitemap expone además
  `2021-04-15`, `2021-07-28` y `2023-02-21`; se verificó comparando páginas que las tres
  son idénticas a la current salvo por el valor permitido del header `Version`. Bajar
  las cuatro cuadruplicaba el peso sin agregar información.
- **El conversor entiende el DOM del plugin OpenAPI de Docusaurus**, no es un
  html→texto genérico: grupos de parámetros, árboles de schema anidados, enums, tabs de
  ejemplo y code blocks de Prism salen como markdown estructurado. Lo que la fuente deja
  sin expandir (`opportunity: object`) queda sin expandir — no se completa por
  inferencia.
- **De VTurb la fuente de verdad es el `openapi.json`, no el markdown.** Es
  machine-readable y sirve para generar tipos o un cliente cuando se construya I-6.
- **Los scripts se commitean.** Sin ellos la copia envejece y nadie sabe cómo
  refrescarla; con ellos, actualizar es correr un comando y mirar el diff.

**Riesgos / deuda técnica pendiente:**
- La copia es un snapshot del 2026-08-30. Antes de construir I-4 o I-6 conviene correr
  `regenerar.sh` y ver si hay diff.
- **No se capturaron los code samples de GHL** (curl/Node/Python del panel derecho): los
  arma JavaScript y no existen en el HTML servido. Sí están el request, el schema de
  respuesta y el ejemplo JSON.
- **GHL no expande muchos objetos de respuesta.** Los campos de `opportunity` y de
  `pipeline` hay que leerlos del primer payload real.
- **VTurb declara `v1` en el header y `v3` en el spec**, los campos de `Stats` no tienen
  descripción, y las release notes mencionan `/smart_autoplays/stats_by_player`, que no
  está en la referencia. Los cuatro puntos quedaron listados en su `RESUMEN-OTC.md`.
- Los otros siete dominios de documentación (Whop, Fanbasis, Hyros, Zoom, WebinarJam)
  **no se volvieron a probar**. Puede que alguno también esté disponible.

---

### 2026-08-30 — DOC-PLAN-VERIFICACION: registro de lo que queda sin probar

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `docs/PLAN_VERIFICACION.md` (nuevo), `CLAUDE.md`, `PENDIENTES.md`

**Qué se hizo:**
Santiago decidió **no conectar ninguna cuenta real hasta terminar todas las olas de integración**, y hacer una única prueba de punta a punta paso por paso. Pidió que se vaya documentando qué hay que testear.

- **`docs/PLAN_VERIFICACION.md`**: runbook ordenado por dependencia, con **qué hacer**, **qué tendría que pasar** y **qué significa si falla** en cada paso. Cubre prerrequisitos, el comportamiento base del módulo, y las tres unidades de la ola 1. Tiene marcas de ⚠️ (falla probable por haberse construido a ciegas), 🔒 (verifica seguridad) y ⭐ (verifica una regla de diseño central, no sólo que ande).
- **Regla 4 de `CLAUDE.md`**: toda unidad que no se pueda verificar en el momento suma su bloque a ese documento.
- El ítem `[EMBUDOS-PAGOS-VERIFICAR]` de `PENDIENTES.md` ahora apunta al plan en vez de repetir los pasos.

**Por qué / finalidad:**
El módulo se está construyendo sin acceso a cuentas ni a documentaciones de API. Sin un registro acumulado, al llegar al final habría que reconstruir de memoria qué se asumió en cada unidad y qué falta comprobar. Con el plan, la pasada final es mecánica.

**Decisiones de diseño:**
- **El plan se ordena por dependencia, no por unidad.** El bloque 0 son los prerrequisitos y el 1 el comportamiento base del módulo, que no necesita ninguna cuenta externa: se puede hacer hoy mismo y ya valida las reglas centrales.
- **Las marcas distinguen tipos de riesgo.** Un paso ⚠️ probablemente falle y se arregla mirando el dato crudo; uno 🔒 que falle es un problema de seguridad; uno ⭐ que falle significa que una regla de diseño no se sostuvo.
- **Los pasos de aislamiento entre organizaciones y de rechazo de firma están explícitos.** Son las verificaciones que nadie hace por costumbre y las que más caro salen si fallan.

**Riesgos / deuda técnica pendiente:**
- Las preguntas abiertas sobre GHL (¿hay historial de cambios de etapa?) y VTurb (¿la retención es promedio o curva?) siguen sin respuesta hasta que lleguen las documentaciones. Ambas pueden cambiar el diseño de su unidad, no sólo el mapeo — están registradas en `docs/API_DOCS_PENDIENTES.md`.
- El plan cubre hasta la ola 1. Las unidades de las olas 2 y 3 suman su bloque a medida que se construyan.

---

### 2026-08-30 — UI de conexión de pagos, I-3 y registro de APIs sin documentar

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `docs/API_DOCS_PENDIENTES.md` (nuevo), `CLAUDE.md`, `app/payments/actions.ts` (nuevo), `components/integrations/payments-connect-panel.tsx` (nuevo), `app/(platform)/integrations/page.tsx`, `lib/funnels/source-signal.ts` (nuevo), `lib/funnels/resolve.ts`

**Qué se hizo:**

**1. `docs/API_DOCS_PENDIENTES.md` + regla permanente en `CLAUDE.md`**
Santiago pidió que quede registrado en algún lado qué documentaciones de API faltan verificar, para pasarlas todas juntas al final de las olas y corregir de una.

Se verificó que **los nueve dominios de documentación probados están bloqueados** por la política de red del entorno: `docs.whop.com`, `apidocs.fan`, `vturb.gitbook.io`, `api-docs.hyros.com`, `docs.hyros.com`, `highlevel.stoplight.io`, `marketplace.gohighlevel.com`, `developers.zoom.us` y `help.webinarjam.com`. No es específico de un proveedor: **va a pasar en todas las integraciones que quedan.**

El documento lista, por proveedor: qué se asumió, con qué nivel de confianza, cómo se verifica y qué se necesita exactamente de la documentación. Cubre Whop y Fanbasis (construidos) y deja preparadas las secciones de GHL, VTurb, WebinarJam/Zoom y Hyros.

Se agregó como **Regla 3** de `CLAUDE.md`, con el patrón obligatorio: persistir el payload crudo antes de interpretarlo, nunca inventar un valor, aislar el mapeo en un archivo con advertencia en el header, y dejar la entrada en el registro.

**2. UI de conexión de pagos**
- `app/payments/actions.ts`: estado, conexión y desconexión de Whop y Fanbasis. El secreto del webhook es obligatorio; la API key es opcional y hoy no se usa (va a hacer falta para el backfill).
- `components/integrations/payments-connect-panel.tsx`: una tarjeta por proveedor con estado, formulario de conexión, **la URL del webhook con botón de copiar**, fecha del último evento y un aviso cuando hay eventos sin interpretar.
- Montado en `/integrations`.

**3. Unidad I-3 — asistencia y cierres**
Resultó ser una verificación y no una reparación: `updateClosingCallAction` ya permite cargar el resultado y los syncs de Calendly y GHL nunca pisan un `closed`.

Lo que sí faltaba, y se construyó, es **`lib/funnels/source-signal.ts`**, que cierra el agujero abierto desde la Fase 1: una fuente bindeada a una tabla que nunca se pobló devolvía `0`.
- `resolveCallOutcomes`: si TODAS las llamadas del período siguen en `scheduled`, devuelve `null`. Un `no_show` sí cuenta como resultado cargado.
- `resolveWithSignal`: ante un cero en el período, consulta si la org tuvo filas alguna vez. Si nunca tuvo, `null`. La consulta extra corre **sólo cuando el conteo dio cero**.
- Aplicado a `conversations`, `closing_calls` y `clients`.

**Verificación ejecutada:**
- `pnpm test`: **284 tests en 14 archivos, todos en verde** (14 nuevos sobre la detección de fuente vacía).
- `tsc --noEmit` y lint: limpios.

**Decisiones de diseño:**
- **Un `no_show` cuenta como señal.** Alguien miró la llamada y registró que el lead no vino: el cero de asistencia que sale de ahí es real, no un hueco.
- **La consulta de histórico corre sólo si el período dio cero**, así que en el caso normal no cuesta nada.
- **Desconectar un proveedor de pagos no borra órdenes ni transacciones.** Son historia del negocio, no de la conexión; borrarlas alteraría métricas de períodos pasados.
- **La URL del webhook se muestra con botón de copiar después de conectar.** El flujo tiene dos lados y sin el segundo no llega ningún evento; la UI lo dice explícitamente.
- **El panel avisa cuántos eventos quedaron sin interpretar**, con el texto de que no se perdió nada y se reprocesan al ajustar el mapeo.

**Riesgos / deuda técnica pendiente:**
- El mapeo de webhooks de Whop y Fanbasis sigue sin verificar — ver `docs/API_DOCS_PENDIENTES.md`.
- La API key que se guarda en la UI todavía no se usa: falta el backfill histórico.
- La detección de fuente vacía usa "¿la org tuvo alguna fila alguna vez?", que es una heurística: una org que borró toda su historia se leería como sin instrumentar. Es un caso raro y el costo de equivocarse es mostrar "sin datos" en vez de un cero, que es el lado seguro.

---

### 2026-08-29 — FEAT-EMBUDOS-I2: capa de pagos con Whop y Fanbasis

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `supabase/migrations/20260829200000_payments_whop_fanbasis.sql` (nuevo, **aplicado**), `lib/payments/` (módulo nuevo), `app/api/webhooks/{whop,fanbasis}/route.ts` (nuevos), `lib/funnels/resolve.ts`, `docs/FUNNELS_SOURCE_MAP.md`

**Qué se hizo:**
Segunda unidad de la ola 1 (`I-2`). Santiago indicó que Stripe y Mercado Pago no sirven para lo que el documento plantea sobre pagos, así que se implementó con **Whop y Fanbasis**, que son los que la sección 05 asigna a la etapa Cash.

- **Migración con 4 tablas:** `payment_integrations` (credenciales cifradas por org, sin RLS de lectura porque guarda secretos), `payment_orders` (el compromiso: `contract_value`), `payment_transactions` (el dinero real: `kind` payment/refund, monto siempre positivo) y `payment_webhook_events` (el payload crudo).
- **`lib/payments/types.ts`** — modelo normalizado independiente del proveedor, con la separación orden/transacción que exige el documento.
- **`lib/payments/normalize.ts`** — traduce webhooks al modelo normalizado. Extractores tolerantes a varios nombres de campo, conversión de centavos, y fechas en ISO o epoch.
- **`lib/payments/aggregate.ts`** — capa pura que calcula M26–M31 desde las filas.
- **`lib/payments/verify-signature.ts`** — Standard Webhooks para Whop (con ventana de tolerancia contra replay) y HMAC-SHA256 para Fanbasis.
- **`lib/payments/ingest.ts`** — guarda el evento crudo **antes** de interpretarlo, deduplica reentregas y marca el estado del procesamiento.
- **Rutas de webhook** para ambos proveedores, con verificación de firma obligatoria.
- **`resolveOrgMeasures`** ahora saca revenue, cash collected, contracted value, orders y customers de las tablas nuevas en vez de `client_payments` y `clients`.

**Verificación ejecutada:**
- `pnpm test`: **270 tests en 13 archivos, todos en verde** (53 nuevos: 14 de agregación, 15 de firmas, 24 de normalización).
- `tsc --noEmit` y lint: limpios.
- Migración aplicada al proyecto `OTC` y verificada: 4 tablas, RLS activo en todas, política de SELECT sólo en `payment_orders` y `payment_transactions`.

**Decisiones de diseño:**
- **El evento crudo se persiste ANTES de interpretarlo.** Es lo que hace tolerable no tener acceso a la documentación de los proveedores: el primer webhook real de cada uno es la fuente de verdad para corregir el mapeo, y ningún evento se pierde mientras tanto.
- **Un evento que no se sabe leer queda `unmapped`, nunca vale cero.** Un cobro cuyo monto no se entiende no es un cobro de cero.
- **El monto en `payment_transactions` es siempre positivo**; el signo lo da `kind`. Un reembolso guardado en negativo con `kind='refund'` se restaría dos veces — hay un test que lo fija.
- **Cash collected es neto de reembolsos.** El documento pide lo que queda en la cuenta.
- **Una compra sin id ni email no cuenta como cliente nuevo.** Contarla inflaría el CAC hacia abajo, que es el error más caro posible en este módulo.
- **La ventana de tolerancia del timestamp** en Standard Webhooks evita que un evento capturado se reinyecte indefinidamente.
- **El `organizationId` va en la URL del webhook pero no autentica nada**: sólo dice contra qué secreto verificar. Lo que prueba la legitimidad es la firma.
- **Stripe y Mercado Pago no se eliminaron.** Siguen sirviendo al módulo de Finanzas y a la importación manual; lo que cambió es que ya no son la fuente de la etapa Cash del embudo.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **El mapeo de campos de los webhooks NO está verificado.** `docs.whop.com` y `apidocs.fan` están bloqueados por la política de red del entorno, así que los nombres de campo en `normalize.ts` son una lectura razonable de los modelos publicados, no una transcripción de sus specs. **Hay que conectar una cuenta real de cada proveedor y revisar `payment_webhook_events` para corregirlos.** El archivo lleva la advertencia en el header.
- ⚠️ **El esquema de firma de Fanbasis tampoco está verificado**: se asume HMAC-SHA256 sobre el cuerpo crudo, que es lo más habitual. La ruta prueba varias cabeceras candidatas.
- **Falta la UI de conexión.** Hoy las credenciales de `payment_integrations` se cargan a mano. Falta el diálogo en `/integrations` para pegar API key y webhook secret.
- **`purchases_per_customer` y `retention_rate` siguen sin fuente** (M32, M33): son la unidad I-9 y hacen falta para LTV.
- Ninguna org tiene todavía una cuenta conectada, así que la etapa Cash sigue resolviendo `null` hasta que se conecte la primera.

---

### 2026-08-29 — FEAT-EMBUDOS-I1: captura diaria de métricas de anuncios

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `supabase/migrations/20260829180000_ad_metrics_daily.sql` (nuevo, **aplicado**), `lib/marketing/ad-metrics-snapshot.ts` (nuevo), `app/api/cron/capture-ad-metrics/route.ts` (nuevo), `lib/funnels/{sources,resolve}.ts`, `vercel.json`, `docs/FUNNELS_SOURCE_MAP.md`

**Qué se hizo:**
Primera unidad de la ola 1 del plan de integraciones (`I-1` del mapa de fuentes).

- **Migración `ad_metrics_daily`** (aplicada en producción y verificada): día, plataforma, anuncio, campaña, adset y las cuatro medidas que el documento asigna a Meta Ads — spend, impressions, reach y clicks. `UNIQUE (organization_id, metric_date, platform, ad_external_id)`. RLS con política **sólo de SELECT**: la escritura es exclusiva del cron vía service role.
- **`lib/marketing/ad-metrics-snapshot.ts`**: `mapAdToRow` (puro) normaliza un anuncio de Zernio a fila diaria, `dedupeRows` (puro) colapsa anuncios repetidos, y `captureAdMetricsForOrganization` / `...ForAllOrganizations` hacen el IO.
- **Cron `capture-ad-metrics`** a las 05:30 UTC, captura el día anterior ya cerrado. Acepta `?organizationId=` y `?date=YYYY-MM-DD` para rellenar un día perdido.
- **Fuente `ad_clicks`** en el catálogo de embudos, bindeada por defecto a `webinar.click` y `vsl.click`.
- **`resolveOrgMeasures`** ahora lee `spend`, `reach` e `impressions` de `ad_metrics_daily` en vez de devolver `null` fijo.

**Decisiones tomadas por Santiago que quedaron registradas en el mapa:**
- **VSL: VTurb.** Tiene Analytics API pública con plays, views y retención filtrables por video y fecha. `I-6` baja de tamaño L a M.
- **Todos los clientes pagan Hyros.** `I-8` es una integración directa, sin degradación por cliente.
- **Landings en Vercel.** Como Vercel es hosting y no analítica de embudo, y el script de Hyros ya va a estar en todas esas páginas, los opt-ins (M08, M09) salen del endpoint de leads de Hyros. **`I-7` se elimina como unidad independiente y se absorbe en `I-8`.**
- **Clientes repartidos en partes iguales entre los tres embudos**, así que la ola 2 se ordena por costo: GHL, VTurb, webinar.
- Los datos actuales de `closing_calls` son de prueba: la conclusión anterior de que el flujo de resultados no se puebla **no era válida**. `I-3` pasa de reparar a verificar.

**Verificación ejecutada:**
- `pnpm test`: **217 tests en 10 archivos, todos en verde** (13 nuevos sobre el mapeo y la deduplicación).
- `tsc --noEmit`: limpio.
- Migración aplicada al proyecto `OTC` y verificada: RLS activo, 1 política de SELECT, 13 columnas.

**Decisiones de diseño:**
- **En la captura, un cero es un dato real.** Si un anuncio existe y no gastó, gastó cero — no es un hueco. La distinción `null` vs `0` de §9.1 vive en el resolver del embudo, no acá. Está documentado en el código y cubierto por un test.
- **`dedupeRows` existe porque Zernio devuelve el mismo `_id` cuando un anuncio está en varios adsets**; sin eso el upsert choca contra sí mismo dentro del mismo batch.
- **El cron captura el día anterior, no el actual**: un día en curso tiene métricas incompletas y quedarían congeladas mal.
- **Sin política de INSERT/UPDATE en la tabla.** Los usuarios leen; sólo el cron escribe.
- **`dm.trigger` sigue sin binding a propósito.** `ad_clicks` cubre sólo la parte paga de "comment / story / ad"; bindearlo ahí subcontaría los disparadores orgánicos.

**Riesgos / deuda técnica pendiente:**
- **La serie histórica arranca el día que se activa el cron.** Hacia atrás no es reconstruible: Zernio devuelve una ventana limitada y los ads no se guardaban antes.
- **El spend es de la org entera, no por embudo.** Cuando una org corra varios embudos a la vez, atribuir el gasto a cada uno necesita `I-8` (Hyros). Hasta entonces, un cliente con dos embudos ve el mismo spend total en los dos.
- `lib/funnels/resolve.ts` sigue sin tests ([T-6] del backlog); las funciones nuevas de IA de esta unidad tampoco.
- El cron todavía no corrió en producción: hay que verificar la primera ejecución.

---

### 2026-08-29 — DB-EMBUDOS aplicada + FEAT-EMBUDOS-FUENTES: configuración de fuentes por step

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** Supabase (migración aplicada), `lib/funnels/{instrumentation,sources}.ts`, `app/funnels/actions.ts`, `app/(platform)/funnels/[funnelId]/configurar/`, `components/funnels/funnel-bindings-form.tsx`, `routes/paths.ts`

**Qué se hizo:**

**1. Migración aplicada en producción**
`20260829120000_funnels_phase1.sql` aplicada al proyecto Supabase `OTC` (`nrzlylzbmsuowzhpdnjl`). Verificado antes de escribir: 6/6 tablas esperadas presentes, helper `get_my_organization_id` existente, 0 tablas `funnel_*` previas. Verificado después: las 4 tablas creadas, RLS activo y 1 política en cada una. El advisor de seguridad no reporta ningún hallazgo sobre las tablas nuevas.

**2. Hallazgo: los bindings del embudo DM de la Fase 1 estaban mal**
Al verificar el resolver contra datos reales aparecieron dos problemas:
- **`conversations` tiene 0 filas.** Es la tabla del inbox legacy; el inbox vivo es Zernio (live-fetch). Los tres primeros pasos del DM estaban bindeados ahí.
- **`closing_calls` tiene 282 filas pero 0 en estado `closed` o `not_closed`** (258 `scheduled` + 24 `no_show`), y 0 con `outcome` o `closed_by_name`. Los pasos de `sales_conv` y `cash` también resolvían a cero.

Resultado: el embudo DM habría renderizado todo en cero, que el diseño lee como catástrofe de negocio. Es el modo de falla de §9.1 entrando por una puerta que no estaba cerrada: se contempló "sin binding → null" pero no "bindeado a una tabla que nunca se puebla → 0".

**3. Lectura del documento sobre la fuente del embudo DM**
La sección 05 del documento fuente asigna explícitamente **"GHL pipeline — Stage counts, set/close, follow-up"**. El estándar NO mide el embudo DM desde una tabla de mensajes: modela cada conversación como una oportunidad que avanza por etapas del CRM. La integración GHL de OTC consume `/calendars` y `/contacts`, pero **no `/opportunities` ni `/pipelines`** (`lib/ghl/sync-pipeline.ts` es el pipeline de sincronización de OTC, no los pipelines de GHL).

En consecuencia, `crm_pipeline` pasó de `otcStatus: "available"` a un nuevo estado **`partial`**, y `blockingTools()` ahora incluye las herramientas parcialmente cubiertas. **El embudo DM no era "el único construible end-to-end"** — esa afirmación de la Fase 1 era incorrecta.

**4. Configuración de fuentes por step (lo elegido para esta tanda de Fase 2)**
- `getFunnelBindingsAction` y `setFunnelStepBindingAction` en `app/funnels/actions.ts`.
- Ruta `/funnels/[funnelId]/configurar` con `FunnelBindingsForm`: un select por paso con las fuentes compatibles con su etapa, más la opción explícita "Sin fuente — no se mide".
- Cada fila muestra qué herramienta le asigna **el documento** a ese paso, para que se vea cuándo lo conectado no es lo que el estándar pide.
- La action valida compatibilidad fuente ↔ etapa antes de escribir: bindear conteos de llamadas a la etapa Lead da error.
- El panel inferior lista las herramientas pendientes con su nota de cobertura.

**5. Corrección de modelado detectada por un test**
`conversations_opened` declaraba `suitableFor: ["lead", "click"]`. Una conversación abierta no es un disparador: en el documento la etapa Click del DM es el "Trigger (comment / story / ad)", que ocurre **antes** de que el hilo exista. Se corrigió a `["lead"]`. El test que lo detectó se dejó como está — el error estaba en la fuente, no en el test.

**Verificación ejecutada:**
- `pnpm test`: **203 tests en 9 archivos, todos en verde**.
- `pnpm typecheck` y `pnpm lint` desde la raíz: verdes.
- Consultas del resolver replicadas en SQL contra la base real para confirmar el hallazgo del punto 2.

**Decisiones de diseño:**
- **Nuevo estado `partial` en `ToolAvailability`.** "Existe la integración" y "cubre lo que el documento le asigna" son cosas distintas, y confundirlas es lo que hizo que la Fase 1 diera por construible un embudo que no lo era.
- **Dejar un paso sin fuente es una opción explícita en la UI**, no un olvido: aparece como primera opción del select y se marca en ámbar.
- **La validación fuente ↔ etapa vive en la Server Action**, no sólo en la UI: el select ya filtra, pero la action igual verifica.

**Riesgos / deuda técnica pendiente:**
- **Los bindings por defecto del DM siguen apuntando a `conversations` (0 filas).** No se tocaron porque la decisión sobre cómo resolverlo quedó abierta con Santiago. Hoy se pueden corregir desde `/funnels/[id]/configurar`, pero el default sigue siendo engañoso.
- **Falta cerrar el agujero "fuente bindeada pero nunca poblada → 0".** El detector de fuente vacía (chequear si la fuente tiene datos históricos para la org y devolver `null` si nunca tuvo) sigue sin implementarse.
- **Para seguir el documento al pie de la letra, el embudo DM necesita sync de oportunidades/pipelines de GHL**, que no existe. Es un ítem nuevo del track de integraciones.
- `resolve.ts` sigue sin tests ([T-6] del backlog).
- El estado de salud (good/watch/below) sigue sin implementarse por pedido explícito de Santiago.

---

### 2026-08-29 — FEAT-EMBUDOS-FASE1 + CI-TESTS + TESTING-BACKLOG

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `.github/workflows/ci.yml`, `supabase/migrations/20260829120000_funnels_phase1.sql` (nuevo), `lib/funnels/{sources,period,compute,resolve}.ts` (nuevos), `app/funnels/actions.ts` (nuevo), `app/(platform)/funnels/` (nuevo), `components/funnels/` (nuevo), `routes/paths.ts`, `constants/permission-modules.ts`, `lib/auth/add-on-ids.ts`, `lib/navigation/sidebar-modules.ts`, `components/navigation/nav-icons.tsx`, `docs/TESTING_BACKLOG.md` (nuevo)

**Qué se hizo:**

**1. CI — paso de tests**
El workflow `.github/workflows/ci.yml` **ya existía** con `pnpm typecheck` y `pnpm lint`; le faltaba `pnpm test`. Se agregó el paso y se ampliaron los triggers de push para cubrir ramas de feature (`Claude-*`, `claude/**`, `feat/**`, `fix/**`, `chore/**`), que antes sólo corrían CI al abrir PR.

**2. Fase 1 del módulo de Embudos**
- **Migración `20260829120000_funnels_phase1.sql`:** `funnel_instances` (plantilla + oferta + price_point + currency + reporting_timezone), `funnel_step_bindings` (step → fuente), `funnel_benchmarks` (overrides de nivel 2 y 3) y `funnel_period_snapshots` (serie histórica). RLS por `get_my_organization_id()` en las cuatro.
- **`lib/funnels/sources.ts`:** catálogo de 8 fuentes respaldadas por tablas reales de OTC, cada una con su procedencia. `DEFAULT_BINDINGS` con los 5 bindings del DM.
- **`lib/funnels/period.ts`:** ventanas de 7/30/90 días con límites inclusivo/exclusivo correctos.
- **`lib/funnels/compute.ts`:** capa PURA — estados de etapa, cálculo de métricas con resolución recursiva de referencias, transiciones entre etapas ocupadas, y KPIs universales.
- **`lib/funnels/resolve.ts`:** capa de IO contra Supabase. No se re-exporta desde el barrel para que ningún Client Component arrastre el cliente de base de datos.
- **`app/funnels/actions.ts`:** listar, resolver y crear instancias, todas con `requireOrganizationId()`.
- **Páginas:** `/funnels` (índice real, no redirect) y `/funnels/[funnelId]` (detalle genérico, sirve cualquier plantilla).
- **Componentes:** `funnel-spine-strip` (7 etapas con sus 3 estados diferenciados), `funnel-steps-table` (misma estructura que la tabla del documento + valor y origen), `funnel-create-form`, `funnel-format`.
- **Registro:** ruta en `paths.ts`, permiso `funnels`, add-on `embudos`, entrada de sidebar e icono `filter` en `nav-icons.tsx`.

**3. `docs/TESTING_BACKLOG.md`**
Backlog de 24 ítems de testing pendientes, priorizados y con ubicación exacta, pensado para que un agente tester de Claude los tome en el futuro. Incluye convenciones del repo, las tres reglas que hacen que un test valga algo, qué NO testear, y el procedimiento de cierre de cada ítem.

**Verificación ejecutada:**
- `pnpm test`: **199 tests en 9 archivos, todos en verde** (46 nuevos sobre `compute`, `period` y `sources`).
- `tsc --noEmit` en `apps/web`: limpio.
- `next lint` sobre `lib/funnels`, `components/funnels` y `app/funnels`: sin warnings ni errores.
- `pnpm typecheck` y `pnpm lint` desde la raíz (los tres pasos que corre el CI): verdes.

**Decisiones de diseño:**
- **Separación compute / resolve.** Toda la matemática vive en `compute.ts`, que es puro y no importa Supabase; `resolve.ts` sólo trae números. Es lo que permite testear el cálculo sin base de datos, y explica que los 46 tests nuevos no necesiten mocks.
- **`dm.trigger` queda deliberadamente sin fuente.** OTC no tiene hoy de dónde sacar disparadores (comentarios / historias / ads que inician conversación). Inventarle un origen habría sido peor: el step se muestra como "Sin fuente" y la página avisa qué integraciones faltan. Es la demostración práctica de la regla §9.1.
- **`spend`, `reach` e `impressions` resuelven a `null`.** El spend de Meta llega vía Zernio como live-fetch y no es periodizable hacia atrás. Cualquier métrica de costo que dependa de spend da `null`, y eso es correcto.
- **Dividir por cero da `null`, no 0%.** Una tasa sobre cero es indefinida; mostrarla como 0% sería exactamente el error que el diseño quiere evitar.
- **El conteo de una etapa es el de su primer step.** En el webinar, `engaged` tiene dos steps y el conteo de la etapa son los asistentes (la entrada), no los que se quedaron al pitch.
- **`/funnels` es un índice real, no un redirect al último usado.** Un redirect hace que el mismo click lleve a lugares distintos según el día.
- **`resolve.ts` fuera del barrel `index.ts`**, para no filtrar el cliente de Supabase a componentes de cliente.
- **Sin `server-only`:** el paquete no está instalado ni se usa en el repo; se documentó la restricción en el header del archivo en vez de sumar una dependencia.

**Riesgos / deuda técnica pendiente:**
- **La migración `20260829120000_funnels_phase1.sql` está sin aplicar en Supabase.** Hasta que se aplique, `/funnels` va a fallar al consultar tablas que no existen.
- **Sin health bands en la UI todavía.** Fase 1 muestra valores, conteos, transiciones y procedencia; el color de estado y el diagnóstico de la primera transición rota son Fase 2, tal como estaba planeado.
- **El switcher entre embudos es Fase 3.** Hoy se navega por el índice. El sidebar muestra una entrada única "Embudos", no una por instancia.
- **`lib/funnels/resolve.ts` no tiene tests** — es el ítem `[T-6]` del nuevo backlog, y el primero que conviene tomar porque obliga a construir el helper de mock de Supabase que después reusa todo el resto.
- **`conversations_replied` trae todas las filas y filtra en memoria** porque `jsonb_array_length` no se expresa bien en el query builder. Con volúmenes grandes conviene moverlo a una RPC.
- El add-on `embudos` tiene que activarse por org desde super-admin para que el módulo aparezca en el sidebar.

---

### 2026-08-29 — FEAT-TESTING-VITEST + FUNNELS-CONFORMANCE: Vitest en el monorepo y tests de conformidad de embudos

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `turbo.json`, `package.json` (raíz), `apps/web/package.json`, `apps/web/vitest.config.ts` (nuevo), `apps/web/lib/funnels/__tests__/` (nuevo), `CLAUDE.md`, `docs/FUNNELS_ARCHITECTURE.md`

**Qué se hizo:**

**1. Vitest como runner de tests unitarios del monorepo**
- Task `test` agregada a `turbo.json` (con `dependsOn: ["^test"]`), script `test: "turbo test"` en el `package.json` raíz.
- `apps/web`: devDependency `vitest ^3.2.4`, scripts `test` (`vitest run`) y `test:watch`.
- `apps/web/vitest.config.ts`: entorno `node`, alias `@` a la raíz de la app, `include` limitado a `lib/**/*.test.ts` y `lib/**/__tests__/**/*.test.ts`.
- Convención adoptada: los tests viven junto al código que cubren, cubren **lógica pura de `lib/`**, y los flujos de UI siguen en Playwright.

**2. Tests de conformidad del módulo de embudos (153 tests, 6 archivos)**
- **`document-fixture.ts`** — transcripción **verbatim** del `Funnel Metrics Standard v1.0`: masthead, spine, las 3 tablas de embudo fila por fila, los 6 KPIs, la tabla de health bands con sus textos literales, las 8 herramientas y las 3 cadencias. No importa nada de `lib/funnels`: sólo copia el documento.
- **`templates.conformance.test.ts`** (72 tests) — compara cada fila de cada tabla contra su step (etapa, label, metricLabel, benchmarkLabel, order), verifica encabezados y punteros, el spine disperso, la normalización de los rangos, y los denominadores explícitos.
- **`health-bands.test.ts`** (33) — `null` vs `0`, dirección de la métrica, benchmarks sin piso, precedencia de 3 niveles y las 6 filas de la sección 04 incluyendo el comparador relativo.
- **`validate-template.test.ts`** (16) — que las plantillas reales pasen, y 12 casos negativos que verifican que el validador atrapa cada clase de error.
- **`kpis.test.ts`** (13), **`instrumentation.test.ts`** (12) y **`spine.test.ts`** (7).

**3. Revisión del documento contra las plantillas**
El documento que Santiago volvió a pasar es **byte-idéntico** al analizado (mismo md5: `b5ed6261f92764dc4a78c29cef76abce`). La revisión se convirtió en la suite de conformidad, que verifica cada fila automáticamente en vez de a ojo.

**Verificación ejecutada:**
- `pnpm test` desde la raíz vía turbo — **153 tests, 6 archivos, todos en verde**.
- `tsc --noEmit` en `apps/web` (incluye los tests) — limpio.
- `next lint --dir lib/funnels` — sin warnings ni errores.
- **Mutation testing manual** para confirmar que la suite no es decorativa: se rompieron tres cosas a propósito y cada una fue detectada por el test correcto — un rango normalizado (25-45 a 25-40), un denominador (`attendee_to_sale` apuntando a registrantes en vez de asistentes) y un texto del documento. Archivo restaurado y verificado sin diff contra el commit.

**Por qué / finalidad:**
La Fase 0 había quedado verificada ejecutando el validador a mano, sin nada que lo volviera a correr solo. Con Vitest, la conformidad entre documento y plantillas queda garantizada en cada corrida, y cuando llegue el `Funnel Metrics Standard v1.1` los tests van a decir exactamente qué plantillas quedaron desactualizadas en vez de descubrirlo en producción.

**Decisiones de diseño:**
- **El fixture no importa nada del código que testea.** Si importara los tipos o las constantes de `lib/funnels`, un error de transcripción se propagaría a ambos lados y el test pasaría igual. Al ser una copia independiente del HTML, la única forma de que pase es que coincidan de verdad.
- **Regla de dirección única:** si un test de conformidad falla, se arregla la plantilla, nunca el fixture. Documentado en el header del archivo y en la sección 11 de la arquitectura.
- **`include` acotado a `lib/`** en la config de Vitest: evita que el runner intente levantar Server Components o rutas de Next, que no son el objetivo de estos tests.
- **Casos negativos en el validador.** Un validador que nunca falla no protege nada, así que se verifican las 12 clases de error que sabe detectar.
- **Se quitó `@vitejs/plugin-react`** que se había agregado de más: el entorno es `node` y no se testean componentes.

**Riesgos / deuda técnica pendiente:**
- Los tests corren sólo cuando alguien los invoca: no hay CI que ejecute `pnpm test` en cada push. Es el siguiente paso natural — ver `[TECH-CI]` en PENDIENTES.md.
- La cobertura es sólo de `lib/funnels`. El resto de `lib/` (métricas, zernio, marketing, agente) sigue sin tests unitarios; ahora existe la infraestructura para sumarlos donde haga falta.
- `packages/*` todavía no declara script `test`; la task de turbo ya está lista para cuando alguno lo necesite.

---

### 2026-08-29 — FEAT-EMBUDOS-FASE0: schema del motor de embudos (definición, sin UI ni DB)

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `lib/funnels/` (nuevo módulo completo)

**Qué se hizo:**
Fase 0 del plan de `docs/FUNNELS_ARCHITECTURE.md` §10: normalizar el documento fuente `Funnel Metrics Standard v1.0` a un schema tipado. Sin UI, sin DB, sin resolver.

- **`lib/funnels/spine.ts`** — las 7 etapas del spine universal como `as const` inmutable (`spend → click → lead → engaged → intent → sales_conv → cash`), con helpers `getSpineStage`, `spineStageOrder`, `isSpineStageId`.
- **`lib/funnels/types.ts`** — tipos núcleo: `MetricRef` (unión de referencias medibles: step, stage, metric, reported, spend, revenue, cash_collected, contracted_value, reach, impressions, orders, customers, purchases, retention_rate), `MetricDefinition` (con `direction` y numerador/denominador explícitos), `Benchmark` (range | floor | ceiling | context_set), `FunnelStep`, `MetricPointer`, `FunnelTemplate`, `StageState` y `ResolvedMetric`.
- **`lib/funnels/templates/{webinar,vsl-call,dm}.ts`** — las 3 plantillas transcritas del documento, con los textos originales de las columnas "Funnel step", "Metric" y "Healthy range" conservados para trazabilidad.
- **`lib/funnels/templates/index.ts`** — registry + `FUNNEL_TEMPLATE_IDS` + lookups.
- **`lib/funnels/kpis.ts`** — sección 03: CAC, ROAS blended/by-source, EPL, EPC, CPL, AOV, LTV (compuesta), Cash collected vs contracted, y las dos ratios decisivas (`ltv_cac_ratio`, `epl_cpl_ratio`).
- **`lib/funnels/health-bands.ts`** — sección 04: la tabla cross-funnel con sus 6 filas y umbrales literales, precedencia de benchmark en 3 niveles (`resolveBenchmark`), y los evaluadores `applyHealthBand` / `applyCrossFunnelBand`.
- **`lib/funnels/instrumentation.ts`** — sección 05: dueño de cada etapa (8 herramientas) con `otcStatus` (`available` | `equivalent` | `missing`), cadencia de reporte diaria/semanal/mensual, y las constantes de gobernanza (`DEFAULT_REPORTING_TIMEZONE = "America/New_York"`, `ATTRIBUTION_STACK`).
- **`lib/funnels/validate-template.ts`** — validador de integridad: IDs únicos, orden 1..n consecutivo, monotonía respecto del spine, referencias resolubles, benchmarks que corresponden a métricas del mismo step, punteros resolubles.

**Verificación ejecutada:**
- `tsc --noEmit` en `apps/web` — limpio.
- `next lint --dir lib/funnels` — sin warnings ni errores.
- Validador ejecutado contra las 3 plantillas — **0 problemas**. Confirma el spine disperso: webinar y DM saltean `Spend`, el VSL saltea `Spend` y `Lead`.
- Evaluador probado en los casos límite: `null → no_data` (no `below`), `0 → below`, dirección invertida para métricas de costo (`$2` de costo/registrante da `good`, la misma cifra como tasa daría `below`), y la banda relativa de `Lead → Intent` con tolerancia del 20%.

**Por qué / finalidad:**
El documento fuente es un schema con datos semilla, no material de lectura. Normalizarlo primero elimina las ambigüedades de §3 de la arquitectura (rangos no legibles por máquina, denominadores implícitos, spine disperso) antes de escribir una sola migración, y deja probado el principio central: agregar un tipo de embudo es agregar un archivo.

**Decisiones de diseño:**
- **`MetricRef` como unión discriminada**, con `step` para conteos de plantilla y `stage` para agregados del spine. Los KPIs universales usan `stage` porque tienen que valer para cualquier embudo: EPL es `revenue ÷ leads` y "leads" es la etapa, no un step de una plantilla concreta.
- **`direction` en cada métrica.** Sin ella el evaluador marcaría como falla un costo por registrante por debajo del rango, que en realidad es lo mejor que puede pasar.
- **`benchmarkLabel` con el texto original del documento** además del benchmark normalizado. Permite mostrar el texto tal cual en la UI y diffear contra una versión futura sin depender de que la normalización haya sido correcta.
- **`BENCHMARK_TOLERANCE = 0.2` no es un número inventado:** sale de la fila "Lead → Intent" de la sección 04, donde el documento define "watch" como "−20% of bench" y lo presenta como la regla genérica para conversiones de etapa.
- **`MetricPointer` conserva la etiqueta literal** además del ID resoluble, porque no siempre coinciden: el DM declara "Reply / set rate" como leading indicator y eso no es el nombre exacto de ninguna de sus métricas.
- **`funnelMetrics` a nivel plantilla** porque el webinar declara "Cost per Sale" como north-star y esa métrica no aparece en ninguna fila de su tabla. El VSL apunta su north-star al KPI universal `cac`.
- **`otcStatus` en las herramientas de instrumentación** hace legible por máquina el track de integraciones de §7, para que la UI pueda decir "esta etapa necesita WebinarJam y no está conectado" en vez de mostrar un cero.
- **Tokens del design system en `accentToken`, no hex.** Los colores ámbar/azul/magenta del documento no existen en la paleta de OTC; se mapean a `--chart-accent`, `--chart-secondary` y `--chart-pink`. El validador rechaza un hex.

**Errata del documento fuente encontrada:**
La fila "Lead → Intent" de la sección 04 imprime `> −20%` en la columna "Below floor". Por contexto es un error de tipeo: "below floor" es estar *más* de 20% por debajo del benchmark. Se codificó la intención, no la errata, con un comentario en `health-bands.ts` que lo deja explícito.

**Riesgos / deuda técnica pendiente:**
- No hay unit test runner en el repo (sólo Playwright E2E), así que la verificación del validador y del evaluador se hizo ejecutándolos a mano contra las plantillas. Si el módulo crece, conviene sumar Vitest — hoy sería la única dependencia de testing unitario del monorepo, así que queda como decisión abierta.
- `lib/funnels/` todavía no lo consume nadie. Queda como código muerto hasta la Fase 1, que es cuando entra el resolver y la página `/funnels/[id]` con el embudo DM.
- El validador corre sólo si se lo invoca; no hay hook que lo ejecute en CI. Cuando exista el módulo en producción conviene atarlo al build.

---

### 2026-08-29 — DOC-FUNNELS-ARCHITECTURE: análisis y arquitectura de embudos intercambiables

**Rama/branch:** `Claude-New-Features`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `docs/FUNNELS_ARCHITECTURE.md` (nuevo) — sin cambios de código

**Qué se hizo:**
- Análisis a fondo del documento fuente `Funnel Metrics Standard v1.0` (HTML aportado por Santiago) y creación de `docs/FUNNELS_ARCHITECTURE.md` como referencia de implementación del futuro módulo de Embudos.
- **Lectura estructural del documento:** se identificó que no es material de lectura sino un schema con datos semilla — los tres embudos (Webinar, VSL book-a-call, DM) son instancias de un mismo tipo colapsables a las mismas 7 etapas del "spine".
- **Normalización del modelo:** se documentaron las ambigüedades que el HTML esconde y su resolución — spine disperso (el VSL no tiene etapa Lead; ninguno tiene fila de Spend), relación step→stage N:1 ordenada, la columna "Healthy range" no es legible por máquina (5 formatos distintos), el denominador es parte de la identidad de la métrica (2–6% sobre asistentes vs 1–3% sobre registrantes es el mismo evento), y precedencia de benchmark de 3 niveles (plantilla → override por oferta → baseline propio a 30 días).
- **Arquitectura de 5 capas:** definición (plantillas en TS), instancia (DB por org), resolver, evaluación, presentación. Se definieron los tipos núcleo (`SPINE_STAGES`, `FunnelTemplate`, `FunnelStep`, `MetricDefinition`, `Benchmark`, `FunnelInstance`, `ResolvedMetric`).
- **Mapeo del spine a fuentes reales de OTC:** 5 de 7 etapas están cubiertas hoy; los huecos son la etapa Engaged de Webinar (show-up/stick rate) y de VSL (play rate/watch %).
- **Resolución del switcher de vistas** (§6): segmento dinámico `/funnels/[funnelId]` como única fuente de verdad, sin cookie de estado, con índice real en `/funnels`, sidebar dinámico por instancia, switcher con indicador de salud y período persistente entre embudos.
- **Registro de las 7 decisiones cerradas** por Santiago en §1, y del track de integraciones bloqueante en §7.

**Por qué / finalidad:**
Santiago va a aportar más documentos, uno por tipo de embudo, y necesita que el software permita al usuario intercambiar entre "vistas" de embudos según su conveniencia, cada una con su estructura propia. El análisis previo evita construir N módulos acoplados: la conclusión central es un motor genérico + N definiciones declarativas, donde agregar un tipo de embudo es agregar un archivo de plantilla sin migración ni componentes nuevos.

**Decisiones de diseño relevantes:**
- **Plantillas en código, no en DB.** Agregar un embudo = archivo nuevo + typecheck, con historial de git y revisión por PR. La DB guarda solo lo específico de cada org (instancias, bindings, overrides, series). Mismo patrón que `METRIC_SOURCES` y `ADD_ON_IDS`.
- **Embudos como capa de medición, no contenedor** (Lectura A). Marketing/Ventas/Finanzas siguen operativos; el embudo los cruza, no los contiene. El resolver igual lleva `funnelInstanceId` desde el día uno para que un futuro contexto global sea extensión y no reescritura.
- **Switcher por URL y no por cookie.** La cookie del holding es correcta ahí porque la org activa sí es contexto global; el embudo activo no lo es. URL habilita deep-linking desde el diagnóstico, cache RSC granular y `revalidatePath` por instancia.
- **Varias instancias por oferta**, porque el documento prohíbe explícitamente comparar una oferta de $27 con una de $5k — `price_point` y `currency` son parte de la identidad de la instancia.
- **Fidelidad total al documento** en atribución (Hyros), timezone de reporte (EST) y etiquetado de procedencia (`[Meta]` / `[Hyros]`).

**Riesgos / deuda técnica pendiente:**
- **Riesgo principal — `null` vs `0`:** si el resolver devuelve 0 por ausencia de datos, el diagnóstico señala como "roturas" lo que son huecos de instrumentación, y el founder pierde confianza en el módulo. `ResolvedMetric.value` es `number | null` y la UI distingue 3 estados (etapa salteada / sin datos / bajo el piso).
- **Integraciones bloqueantes:** Hyros, WebinarJam/Zoom y hosting de VSL con analytics no existen en OTC. Sin ellas, 2 de los 3 embudos del documento nacen con su etapa central vacía. El track corre en paralelo y debe aterrizar antes de la Fase 3. Queda abierta la decisión de qué proveedor de video se soporta para el VSL.
- **`metrics_snapshots` no sirve tal cual:** su `CHECK (category IN ('sales','finance'))` no contempla embudos y su `UNIQUE (organization_id, category, period_start)` colisiona con varias instancias por org en el mismo período. Se necesita tabla propia `funnel_period_snapshots`.
- **Sin snapshot no hay historia de Spend:** los ads de Zernio son live fetch por convención del repo, así que el Spend histórico no es reconstruible. La tabla de snapshots tiene que existir desde la Fase 1 aunque el job llegue en la Fase 5.
- **`custom_metrics` no tiene noción de período** — `resolveSourceValue` cuenta sobre toda la historia de la org; hay que extender la firma, no duplicar.
- No existe timezone de reporte por org en OTC.
- Deriva plantilla/documento: cada `FunnelTemplate` lleva `sourceDocVersion` para detectar cuando el documento fuente avanza y la plantilla no.

---

### 2026-08-30 — NAV-NOTCH: navegación superior de islas (notch nav) detrás de flag

**Rama/branch:** `Claude-Design`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `components/navigation/notch-nav/*` (nuevo), `components/layout/platform-notch-shell.tsx` (nuevo), `lib/navigation/nav-style.ts` (nuevo), `lib/navigation/full-bleed.ts` (nuevo), `components/layout/platform-shell.tsx`, `layouts/platform-layout.tsx`, `.env.example`, `CLAUDE.md`, `DESIGN.md`

**Qué se hizo:**

- **Navegación alternativa de barra superior** con el patrón "notch nav" de tres islas (logo · items · acciones) relevado en `docs/COMPONENTES_21ST.md` §3.1 (rama `Claude-New-Features`), **reimplementado desde cero** sobre framer-motion, Lucide y los tokens del design system. No se bajó el componente de 21st.dev: su código fuente está detrás de autenticación (403 sin credenciales, `21st login` es interactivo) y de todos modos había que reescribirle clases Tailwind v4, colores zinc hardcodeados y el routing.
- **Activación por flag:** `NEXT_PUBLIC_NAV_STYLE=notch`. Sin la variable (o con otro valor) la plataforma usa el sidebar clásico, que quedó **intacto** — `PlatformShell` solo hace el branch. Revertir = borrar la env en Vercel y redeployar; también se puede borrar entero `platform-notch-shell.tsx` + `notch-nav/` sin tocar nada más.
- **Una sola fuente de verdad:** el adaptador `platform-notch-nav.tsx` deriva items, permisos, add-ons y estado activo de `buildPlatformSidebarNav()` — el mismo config del sidebar. Los módulos con hijos (Marketing, Ventas, Finanzas, Operaciones) se abren como dropdown; Configuración migra a la isla derecha como engranaje para no ensanchar la barra; la isla derecha suma búsqueda (command palette), switcher de holding y toggle de tema.
- **Shell propio** (`PlatformNotchShell`): barra arriba, franja de título de página (reemplaza al topbar clásico, que ponía el título), `MainContainerPanel` para mantener el look de panel flotante, y mobile con el `MobileNav` existente (hamburguesa + drawer). Vista holding sin negocio activo: sin items, como el sidebar.
- **`lib/navigation/full-bleed.ts`:** las rutas full-bleed (agente, inbox, producto) estaban hardcodeadas en `platform-layout.tsx`; ahora ambos shells comparten el helper.
- `CLAUDE.md` y `DESIGN.md` actualizados: la regla "la navegación es solo sidebar" ahora documenta la excepción controlada por flag, para que los docs no contradigan al código.

**Por qué / finalidad:**

Santiago quiere probar este estilo de navegación como innovación de producto, con vuelta atrás garantizada si no convence.

**Decisiones de diseño relevantes:**

- **Flag por env y no por preferencia de usuario:** la vuelta atrás es una decisión de producto, no per-user. Env = un solo estado para toda la org, sin flash de hidratación ni estados mixtos entre usuarios. Contra: cambiarla requiere redeploy (~2 min).
- **Labels solo en `xl+`:** el sidebar tiene ~10 entradas raíz; con labels siempre visibles la barra no entra en 1280px. Debajo de `xl` los items quedan como iconos con `title`.
- **Filetes de muesca** dibujados con un path SVG por lado (curva invertida `text-card`), no con imágenes.
- Las páginas **no** tienen h1 propio (lo ponía el topbar) — por eso el shell nuevo trae la franja de título; sin ella todas las pantallas quedaban sin encabezado.

**Verificación:**

`tsc`, lint y `next build` con y sin flag (128 páginas). Verificación visual con una página de preview temporal (borrada antes del commit) montando el shell con providers mockeados: islas, dropdowns de módulo, tema claro y oscuro. **No verificado en vivo:** el estado activo del pill (el preview corría en una ruta fuera del nav) y las páginas reales de plataforma, que en este entorno devuelven 500 por falta de env de Supabase — el modo demo no cubre el layout de plataforma.

**Riesgos / deuda técnica pendiente:**

- El badge de llamadas Fathom pendientes (sidebar lo muestra en Clientes vía `mapDirectModules`) no está en la notch nav.
- El botón de notificaciones ("próximamente", deshabilitado) del topbar clásico no se migró — decidir si va en la isla derecha.
- El pill activo y el comportamiento con datos reales quedan por validar en producción/preview con sesión real.
- Si el experimento se adopta como definitivo, borrar el shell del sidebar (o viceversa) para no mantener dos navegaciones para siempre.

---

### 2026-08-29 — REBRAND-LIMITLESS (fase 3): preview social y metadata

**Rama/branch:** `Claude-Design`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `apps/web/app/opengraph-image.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/apple-icon.png`, `apps/web/lib/email/trial-reels-email.ts`

**Qué se hizo:**

- **`app/opengraph-image.tsx`** — preview social 1200×630 generada con `next/og`, prerenderizada en build. Composición según el manual: fondo negro, barra de acento naranja, lockup blanco, tagline y dominio. El lockup se embebe como data URI porque Satori no resuelve rutas de `/public`.
- **`metadataBase`** en `layout.tsx`, resuelto desde `NEXT_PUBLIC_APP_URL` con fallback a `VERCEL_URL`. **Sin esto la imagen no servía para nada**: Next resolvía `og:image` contra `http://localhost:3000` y el preview no cargaba al compartir el link.
- **Bloques `openGraph` y `twitter`** en la metadata raíz (type, siteName, locale `es_AR`, card `summary_large_image`).
- **`app/apple-icon.png`** (180×180) generado desde el mismo `icon.svg`, porque Apple no acepta SVG para el touch icon.
- **Bug corregido:** `metadata.icons` seguía apuntando a `/brand/logo.png`, archivo borrado en la fase 2. Se eliminó el bloque — `app/icon.svg` y `app/apple-icon.png` ya los toma Next por convención de archivos.
- **Contraste en emails:** el email de trial-reels quedó con blanco sobre `#E15D12` (3.64:1) en la fase 2. Ahora usa negro, igual que los botones de la app.

**Por qué / finalidad:**

La app no tenía preview social — al compartir el link no aparecía imagen. Con la identidad nueva era el momento de armarla.

**Decisiones de diseño relevantes:**

- **Texto en la tipografía por defecto del renderer.** Satori no soporta WOFF2 y `next/font` sirve Inter en ese formato, así que cargar la fuente real implicaba traer un TTF aparte. La carga de marca la aporta el logotipo, que ya trae el wordmark tipografiado.
- **Sin `twitter-image` propia:** Twitter cae a `og:image` cuando no existe, y la composición sirve para ambos.

**Riesgos / deuda técnica pendiente:**

- `metadataBase` depende de `NEXT_PUBLIC_APP_URL` en Vercel. Si falta, cae a `VERCEL_URL` (la URL única del deploy, no el dominio de producción) y el preview apunta a un host que cambia en cada deploy. **Verificar que `NEXT_PUBLIC_APP_URL` esté seteada en producción.**
- La tagline de la imagen sale de `brand.tagline` y todavía menciona "infoproductos" — si el posicionamiento de Limitless es más amplio (el manual habla de holdings y consultoría), conviene reescribirla.

---

### 2026-08-29 — REBRAND-LIMITLESS (fase 2): identidad visual — paleta, logotipo y tipografía

**Rama/branch:** `Claude-Design`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `packages/ui/src/styles/tokens.css`, `packages/config/tailwind/preset.ts`, `apps/web/app/globals.css`, `apps/web/lib/brand.ts`, `apps/web/components/brand/*`, `apps/web/public/brand/*`, `apps/web/app/icon.svg`, `DESIGN.md`, + 127 archivos con color de marca

**Qué se hizo:**

- **Paleta aplicada.** Del manual de marca (sección 06), que define exactamente tres colores: Negro `#000000`, Blanco `#FFFFFF` y **Naranja Vibrant `#E15D12`** = `hsl(22 85% 48%)`. Se reemplazó el violeta `#7C3AED` en `tokens.css` (bloques `:root` y `.dark`), `globals.css` y `brandColors`.
- **Escala `brand-50…950` en el preset de Tailwind**, anclada en `brand-600 = #E15D12`, con los pasos 400/600/700 coincidiendo con `--primary-light` / `--primary` / `--primary-hover`. Reemplaza a la escala violeta de Tailwind que usaba la identidad anterior.
- **520 clases de color migradas** en 127 archivos: 462 clases `violet-*`/`purple-*`/`indigo-*` → `brand-*`, más 58 hex y `rgba()` sueltos (`#8B5CF6`, `#A78BFA`, `#6D28D9`, `rgba(124,58,237)`, `rgba(99,102,241)`, `rgba(168,85,247)`…). La auditoría de la fase 1 solo había buscado hex, por eso no las vio.
- **Contraste corregido.** Blanco sobre `#E15D12` da 3.64:1, por debajo de AA para texto normal; negro da 5.78:1. Se cambió `--primary-foreground` a `0 0% 0%` y se migraron 10 botones que tenían `text-white` sobre `bg-primary` sólido, incluido el `variant="default"` del `Button` de `@ai-coo/ui`.
- **Assets reales instalados.** `logo-{light,dark}.png` (lockup horizontal recortado, 1764×210, ~14 KB c/u) e `isotipo-{light,dark,naranja}.svg`. Se borraron `logo.png` (1.3 MB, OTC) y los dos isotipos OTC.
- **`AppLogo` y `AppBrandHeader` ahora siguen el tema:** renderizan la versión negra y la blanca y las alternan con `dark:hidden` / `hidden dark:block`, como pide el manual (logotipo monocromo). `AppBrandHeader` pasó a usar el isotipo — su slot es cuadrado de 32×32 y antes metía ahí el lockup apaisado.
- **Presets de tamaño de `AppLogo` recalibrados.** El lockup nuevo es ≈8.4:1 contra 1.4:1 del anterior: limitando por alto se desbordaba de la tarjeta de login. Ahora `login`, `sidebar` y `hero` limitan por ancho.
- **Favicon rehecho** (`app/icon.svg`): cuadrado naranja con el isotipo en blanco, generado desde el path del SVG oficial. Antes era un rect violeta con una letra "M" dibujada a mano.
- **`--font-display`** agregado como token y como utilidad `font-display` de Tailwind.

**Por qué / finalidad:**

Completar el rebranding con la identidad visual real, que en la fase 1 no estaba disponible. El material llegó por la rama `brand-source` (ver más abajo).

**Decisiones de diseño relevantes:**

- **Texto negro sobre naranja, no blanco.** Es la decisión con más impacto visual de esta fase. La alternativa era mantener blanco por consistencia con cómo se ve el logotipo sobre naranja en el manual, pero 3.64:1 no alcanza AA para un label de botón de 14px. El negro además es on-brand: la paleta es literalmente negro/blanco/naranja. Se revierte en una línea (`--primary-foreground` en `tokens.css`).
- **Escala `brand-*` propia en vez del `orange-*` de Tailwind.** El `orange-600` de Tailwind (`#EA580C`) está a ojo de `#E15D12`, pero una escala propia hace que todo el color de marca trace de vuelta al manual y evita que convivan dos naranjas casi iguales.
- **Lockup en PNG, isotipo en SVG.** Los SVG del lockup traen el wordmark como `<text>` vivo con `font-family: Manrope-Light`, sin vectorizar: en un navegador sin Manrope el logo renderiza con otra fuente. El isotipo sí es path puro.
- **Paletas categóricas sin tocar.** En 5 archivos el violeta no es acento de marca sino una categoría dentro de una paleta que ya incluye naranja (ver riesgos).
- **Colores de integraciones sin tocar.** `lib/integrations/brand-colors.ts` tiene los colores de marca de terceros (Discord `#5865F2`, Instagram, Miro `#050038`, Zernio `#6366F1`). Son violáceos pero no son nuestros.

**Verificación:**

`tsc --noEmit` y `pnpm lint` limpios en los 4 paquetes; `next build` genera las 125 páginas. Se levantó la app y se revisaron capturas de la landing y del login en tema claro y oscuro: el logotipo cambia correctamente con el tema y no quedó violeta en pantalla.

**Riesgos / deuda técnica pendiente:**

- **5 archivos conservan violeta a propósito** — `product/graph-nodes.tsx`, `lib/workboard/styles.ts`, `constants/conversation-tags.ts`, `agent/proposal-card.tsx`, `sales/zernio-side-panel.tsx` (53 clases). Ahí el violeta es **una categoría entre varias** y el archivo ya usa naranja para otra: convertirlo colapsaría dos categorías en el mismo color. Necesitan una paleta categórica diseñada para convivir con un acento naranja — es una decisión de diseño, no un find-replace.
- **Neue Haas Grotesk sin licencia.** El manual la pide para títulos; es comercial (Monotype). `--font-display` resuelve a Inter mientras tanto. Los títulos no van a coincidir con el manual hasta comprarla.
- **`--primary-foreground` negro** cambia el aspecto de todos los botones primarios. Es intencional y accesible, pero es un cambio visible que conviene que el equipo valide.
- La rama `brand-source` tiene el manual en PDF (58 MB). No mergear a `main`: se puede borrar una vez que el equipo tenga el material en otro lado.

---

### 2026-08-29 — REBRAND-LIMITLESS (fase 1): centralización de marca y renombre OTC → Limitless

**Rama/branch:** `Claude-Design`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `lib/brand.ts`, `components/brand/*`, `app/layout.tsx`, `components/landing/*`, `components/welcome/`, `app/(landing)/privacidad/`, `lib/email/*`, `lib/agent/prompt.ts`, `lib/sops/utm-setup-sop.ts`, `packages/ui/src/styles/tokens.css`, `packages/config/tailwind/preset.ts`, `DESIGN.md`

**Qué se hizo:**

- **`lib/brand.ts` pasa a ser la fuente única de verdad de la identidad.** Antes solo exportaba `brandAssets` (rutas de logo). Ahora exporta además:
  - `brand` — `name` ("Limitless"), `wordmark` ("LIMITLESS"), `legalName`, `tagline`, `domain`.
  - `brandColors` — paleta hex para los contextos que **no** pueden leer CSS vars: props de color de charts (Visx), estilos inline y HTML de emails.
- **Renombre completo OTC / "Optimiza Tu Control" → Limitless** en las 87 ocurrencias detectadas. Los strings de UI ahora referencian `brand.*` en lugar de literales; los comentarios, mocks y config se renombraron a texto plano.
  - Metadata de Next (`layout.tsx` template `"Limitless | %s"`, landing, prueba, privacidad, redesign-preview)
  - Landing completa (9 secciones + footer) y `cinematic-welcome`
  - Emails Resend: waitlist, welcome, trial-reels (subjects, HTML y texto plano)
  - System prompt del agente (`lib/agent/prompt.ts`) — antes decía "OTC (Operations & Technology Center)"
  - Política de privacidad — 17 menciones
  - Default del bot de Discord: "Asistente OTC" → "Asistente Limitless", sincronizado entre `apps/web` y `apps/discord-bot`
- **Migración de color hardcodeado a tokens.** Había 73 hex de marca sueltos en 36 archivos:
  - 40 clases Tailwind con valor arbitrario (`bg-[#7C3AED]`, `text-[#A78BFA]`, `bg-[#6D28D9]`…) → clases de la escala `primary`.
  - 28 literales en JS (charts, estilos inline, emails) → `brandColors`.
  - `packages/ui/src/components/bar-chart.tsx`: fallback `var(--chart-1, #7C3AED)` → `var(--chart-1, hsl(var(--primary)))` (packages/ui no puede importar de apps/web).
- **Token nuevo `--primary-hover`** (`263 70% 50%` = `#6D28D9`) en light y dark: el violeta de hover/pressed no tenía token y se usaba hardcodeado en 7 lugares.
- **Escala `primary` completa expuesta en el preset de Tailwind** (`light`, `hover`, `subtle`, `glow`, `border`). Antes solo había `DEFAULT` y `foreground`, y por eso el resto se escribía como valor arbitrario.

**Por qué / finalidad:**

Rebranding del software a la identidad Limitless. Esta fase cubre todo lo que **no** depende de la paleta ni de los assets visuales, que todavía no están disponibles (el manual de marca es un PDF de 61 MB sin capa de texto y el entorno no puede descargarlo). El objetivo es que la fase 2 —aplicar la identidad visual real— sea un cambio de dos archivos en lugar de un barrido por 36.

**Decisiones de diseño relevantes:**

- **Sin cambio visual en esta fase, a propósito.** Cada hex migrado se mapeó al token cuyo valor computado es idéntico (`#7C3AED` → `--primary`, `#A78BFA` → `--primary-light`, `#6D28D9` → `--primary-hover`). El render es byte a byte el mismo; lo único que cambió es de dónde sale el color.
- **`brand.*` en lugar de literales, incluso para strings estáticos.** Agrega un import en ~30 archivos, pero un cambio de nombre o de casing pasa a ser una línea. Es el punto del ejercicio.
- **Comentarios, mocks y config se renombraron a texto plano**, sin import: no son user-facing y no justifican la dependencia.
- **Namespace del monorepo intacto.** `@ai-coo/*` y `ai-coo-platform` no se tocaron — decisión explícita del usuario. No es visible para el usuario final y renombrarlo implica ~200 imports y el lockfile.
- **Dominio `optimizatucontrol.com` fuera de alcance**, también por decisión del usuario. Queda expuesto como `brand.domain` para que la migración futura sea un solo campo.

**Riesgos / deuda técnica pendiente:**

- **Assets visuales sin reemplazar.** `public/brand/logo.png` (1.3 MB), los dos isotipos OTC y `app/icon.svg` (favicon SVG dibujado a mano, rect violeta + letra "M") siguen siendo de la identidad anterior. La app dice "Limitless" pero muestra el logo de OTC.
- **Paleta sin definir.** Los valores violeta en `tokens.css` y `brandColors` son placeholder hasta tener el manual de marca.
- **Tipografía sin definir.** Sigue Inter + JetBrains Mono en `layout.tsx`.
- **Cambio de comportamiento menor:** el default del nombre del bot de Discord cambió. Las orgs que nunca lo personalizaron (`bot_name` en null) van a ver "Asistente Limitless" en lugar de "Asistente OTC".
- **`lib/email/welcome-email.ts`** tiene un fallback hardcodeado `https://otc-plaform.vercel.app` (con el typo original). Es un dominio, queda fuera de alcance, pero conviene revisarlo.
- La tabla de colores de `DESIGN.md` sigue documentando la paleta violeta; se marcó con un aviso de rebranding en curso pero hay que reescribirla en la fase 2.

### 2026-08-26 — FEAT-GHL-MULTI-CALENDAR: soporte de múltiples calendarios en integración GHL

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `lib/ghl/integration.ts`, `lib/ghl/sync-pipeline.ts`, `app/ghl/actions.ts`, `app/closing/actions.ts`, `components/integrations/ghl-connect-dialog.tsx`, `components/closing/closing-overview.tsx`, `app/(platform)/sales/closing/page.tsx`, `types/closing.ts`, `lib/closing/mapper.ts`, `supabase/migrations/20260826130621_ghl_multi_calendar.sql`

**Qué se hizo:**
- **Migración SQL:** `selected_calendar_ids text[] NOT NULL DEFAULT '{}'::text[]` agregado a `ghl_integrations`. Backfill automático desde `default_calendar_id` en filas existentes.
- **`StepSelectCalendar` en dialog GHL:** radio buttons → checkboxes multi-selección. Al menos 1 requerido. Muestra contador de seleccionados.
- **`ManagePanel` en dialog GHL:** lista de calendarios con checkboxes toggle; botón "Guardar selección" aparece solo si hay cambios pendientes.
- **`connectGHLAction`:** ahora recibe `selectedCalendarIds: string[]` (antes era un solo string). `default_calendar_id` se setea al primero (backward compat con sync legacy).
- **`updateGHLCalendarsAction`:** reemplaza `updateGHLCalendarAction` (single string) por el nuevo (array). Actualiza `selected_calendar_ids` + `default_calendar_id`.
- **`syncGHLOrganizationSafe`:** itera sobre todos los calendarios en `selected_calendar_ids` en paralelo, aplana y deduplica appointments por ID antes del upsert.
- **`syncAllGHLOrganizationsSafe`:** ya no filtra por `default_calendar_id IS NOT NULL` — ahora incluye todas las orgs con integración GHL (el sync individual decide qué calendarios procesar).
- **`listClosingCallsAction`:** usa `.in("ghl_calendar_id", selectedCalendarIds)` en vez de `.eq("ghl_calendar_id", singleId)` para mostrar todas las calls de los calendarios activos.
- **`ClosingCall` type + mapper:** nuevo campo `ghlCalendarId` para poder filtrar client-side por calendario.
- **`ClosingOverview`:** recibe `ghlCalendars` y `ghlSelectedCalendarIds` como props (fetched en page.tsx). Si hay 2+ calendarios activos, muestra `FilterPills` para alternar entre "Todos los calendarios" y cada calendario individual. El filtro afecta tanto la vista lista como la vista calendario.
- **`ClosingPage`:** pasa a ser un wrapper async que fetchea el status GHL antes de renderizar `ClosingOverview`.

**Por qué / finalidad:**
El usuario necesitaba seleccionar más de un calendario GHL (ej: uno para llamadas de discovery y otro para onboarding) y poder filtrar las citas en el panel de closing por calendario específico o ver todos juntos.

**Decisiones de diseño:**
- `default_calendar_id` se mantiene para backward compat con el cron legacy y cualquier integración que lo use directamente.
- El filtro de calendarios en closing solo aparece con 2+ calendarios seleccionados — con 1 no aporta valor.
- El filtro es puramente client-side (los datos de todos los calendarios ya están en el payload de `closingCalls`).

**Riesgos / deuda técnica pendiente:**
- Hay que aplicar la migración `20260826130621_ghl_multi_calendar.sql` en Supabase antes de que el feature funcione en producción.
- `syncAllGHLOrganizationsSafe` ahora lista todas las orgs con integración GHL (antes solo las que tenían `default_calendar_id` seteado); si hay orgs con integración sin calendarios, `syncGHLOrganizationSafe` las skipea silenciosamente (retorna `empty`).

---

### 2026-08-26 — UI-CLEANUP: eliminación del botón flotante del agente y fix de layout en integraciones

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `components/layout/platform-shell.tsx`, `app/(platform)/integrations/page.tsx`

**Qué se hizo:**
- **Eliminado `FloatingChat` de `platform-shell.tsx`:** removida la importación del componente y la prop `overlay={<FloatingChat />}` del `ThreeColumnLayout`. El botón flotante de apertura del agente (bottom-right, `fixed bottom-6 right-6 z-50`) ya no se renderiza en ninguna página del platform. El `FloatingChatProvider` en `providers/index.tsx` se dejó en su lugar (inofensivo, no causa errores y evita cambios en cascada).
- **Fix de layout en `/integrations`:** agregado `min-w-0` al contenedor `flex justify-between` del header de la página y al componente `PageHeader`, para que el flex item pueda achicarse correctamente y el botón "Importar datos históricos" no quede cortado en viewports más angostos o cuando hay contenido largo en el título.

**Por qué / finalidad:**
- El agente de negocio fue removido del sidebar en una sesión anterior, pero el botón flotante que lo abría quedó activo en todas las páginas del platform. Al no haber más acceso al agente desde el sidebar, el botón flotante quedaba huérfano y confundía.
- El layout de integraciones mostraba un corte visual en el lado derecho por un flex overflow no contenido.

**Decisiones de diseño:**
- `FloatingChat` component (`components/agent/floating-chat.tsx`) no se eliminó del codebase — solo se dejó de renderizar. Puede reactivarse si el agente vuelve a necesitar un punto de entrada flotante.
- `min-w-0` es la forma estándar de CSS de permitir que un flex item se encoja por debajo de su contenido intrínseco — aplica correctamente sin romper otras páginas.

**Riesgos / deuda técnica pendiente:**
- `FloatingChatProvider` permanece en `providers/index.tsx`. Si se decide eliminar el agente por completo, esa es la siguiente limpieza.
- Si el corte visual de integraciones era causado por algo distinto al flex overflow (ej. grid col con ancho fijo), el `min-w-0` puede no resolverlo completamente — pendiente confirmación del usuario.

---

### 2026-08-26 — FIX-IMPORT-SHEET-PICKER: selector de hoja explícito en wizard de importación

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commits:** pendiente push  
**Módulo(s) afectado(s):** `app/clients/import-actions.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- **Nuevo componente `SheetPicker`:** cuando el Excel tiene más de una hoja, el wizard muestra una pantalla dedicada de selección antes del mapeo de columnas — lista todas las hojas como radio buttons, muestra las columnas de la hoja activa como preview, y tiene un botón "Continuar con `<nombre hoja>`". El usuario no puede avanzar al mapeo de columnas sin confirmar explícitamente la hoja.
- **Estado `sheetConfirmed`:** booleano que empieza en `false` al entrar al paso mapper. Se pone en `true` al confirmar la hoja (o automáticamente si el archivo tiene una sola hoja). La navegación del wizard oculta sus botones mientras SheetPicker está activo (tiene su propio botón de avance).
- **`pickBestSheet` mejorado:** keywords de nombre de hoja ampliadas (trazabilidad, instagram, seguimiento, alumnos, miembros). Nuevo bonus por densidad de columnas CRM: cuenta cuántas columnas del header match `/^(nombre|name|apellido|email|teléfono|celular|instagram|ig|programa|plan|cc|monto|fecha)$/i` y agrega un bonus proporcional (máx 15 pts) al score total, penalizando hojas con muchas columnas irrelevantes.

**Por qué / finalidad:**
El usuario importó desde `b9d83cfe-CRM_VENTAS__AA.xlsx` que tiene 6 hojas. `pickBestSheet` elegía automáticamente "Data" (27 columnas, bonus keyword "data" → score 32) en vez de "Trazabilidad - Instagram" (15 columnas, sin keyword → score 15). La hoja "Data" contiene calls de cierre con algunos IG handles en la columna "Nombre" que se importaban como nombres de cliente. El usuario quería importar desde "Trazabilidad - Instagram" pero el selector de hoja anterior era una pequeña dropdown en el mapper que pasaba desapercibida.

**Decisiones de diseño:**
- SheetPicker es fase 1 del mapper (no un paso nuevo del wizard) — el stepper de progreso no cambia.
- La auto-mejora de `pickBestSheet` no resuelve este caso concreto (Data aún gana por más columnas) pero reduce la probabilidad en otros archivos.
- El selector compacto de hoja se mantiene en la fase 2 del mapper para correcciones posteriores a confirmar.

**Riesgos / deuda pendiente:**
- Si el archivo tiene una sola hoja, SheetPicker no aparece (flujo transparente).
- `pickBestSheet` aún puede elegir mal en archivos donde la hoja de datos tiene muchas columnas — el SheetPicker es el safety net garantizado.

---

### 2026-08-26 — FIX-IMPORT-CACHE: revalidatePath en importClientsFromExcelAction

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `e94393e`  
**Módulo(s) afectado(s):** `app/clients/import-actions.ts`

**Qué se hizo:**
- Agregado `import { revalidatePath } from "next/cache"` y llamadas a `revalidatePath("/clients")` + `revalidatePath("/dashboard")` al final de `importClientsFromExcelAction`, justo después del insert exitoso.

**Por qué / finalidad:**
Los 264 clientes se insertaban correctamente en Supabase (confirmado por logs: `inserted=264`), pero al navegar a `/clients` el módulo aparecía vacío. Causa: Next.js 15 App Router cachea los Server Components; sin `revalidatePath`, la página `/clients` se servía desde caché aunque la BD ya tuviera los datos. El patrón correcto ya lo usaban `payment-actions.ts` y `plan-duration-actions.ts` — se replicó aquí.

**Decisiones de diseño:**
Se invalidan dos rutas: `/clients` (lista principal) y `/dashboard` (muestra KPI de clientes). `router.refresh()` en el wizard solo refrescaba la página actual, no las rutas destino.

---

### 2026-08-26 — FIX-IMPORT-EMPTY-ROWS: parsers Excel ignoran filas vacías — elimina errores falsos

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `b813954`  
**Módulo(s) afectado(s):** `lib/clients/excel-parser.ts`, `lib/closing/excel-parser.ts`

**Qué se hizo:**
- Agregado check `allEmpty` al inicio del `forEach` en ambos parsers: si todos los valores de la fila son cadena vacía (después de trim), la fila se ignora silenciosamente sin generar error.

**Por qué / finalidad:**
Un Excel con 264 clientes mostraba "512 errores" porque tenía estilos/formato aplicados hasta la fila 776. SheetJS incluye todas esas filas dentro del bounding box (`!ref`) con `defval: ""` → el parser generaba un error "Nombre vacío" por cada fila vacía. El resultado era correcto (264 importados) pero el mensaje de error era confuso y alarmante.

**Decisiones de diseño:**
Solo se omite silenciosamente si la fila está 100% vacía. Si una fila tiene algún dato (ej: teléfono o email pero sin nombre), sigue generando el error para que el usuario lo vea.

---

### 2026-08-26 — FIX-IMPORT-SHEET-MISMATCH: wizard pasa sheetName al parser para evitar discrepancia de hoja

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `f427aa2`  
**Módulo(s) afectado(s):** `lib/clients/excel-parser.ts`, `app/clients/import-actions.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- `parseClientsExcel` ahora acepta `sheetName?: string` como tercer parámetro. Si se provee, usa esa hoja (con fallback a la primera si no existe). Si no, mantiene la lógica anterior ("clientes" o primera hoja).
- `importClientsFromExcelAction` acepta y reenvía `sheetName?` a `parseClientsExcel`.
- `data-import-wizard.tsx` pasa `clientsPreview.activeSheet` al action de importación.

**Por qué / finalidad:**
El wizard usaba `pickBestSheet` (score-based heuristic) para la preview, pero `parseClientsExcel` usaba su propia lógica independiente (`find("clientes") ?? first`). Cuando el archivo no tenía tab llamado "Clientes", las dos funciones elegían hojas distintas → los headers del mapping no coincidían con los del parser → `nameCol = undefined` → todos los clientes fallaban con "Nombre vacío" (41 errores).

**Decisiones de diseño:**
El caller (wizard) es quien sabe qué hoja el usuario estaba viendo. Pasarlo explícitamente es más robusto que re-ejecutar heurísticas en el servidor.

**Riesgos / deuda:**
- Si `clientsPreview` es `null` (raro: solo si el usuario saltó el mapper sin preview), el import cae al fallback (`find("clientes") ?? first`). Aceptable.

---

### 2026-08-26 — FIX-IMPORT-CLIENTES-FILA-TITULO: parseClientsExcel ahora salta filas de título/fusionadas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `6104e7e`  
**Módulo(s) afectado(s):** `lib/clients/excel-parser.ts`

**Qué se hizo:**
- Reemplazado `XLSX.utils.sheet_to_json` (sin `header: 1`) por la misma estrategia que ya usaba `getExcelPreviewAction`: `sheet_to_json({ header: 1 })` → arrays crudos, luego detectar la primera fila con ≥2 celdas no vacías como fila real de encabezados, y construir objetos keyed manualmente.
- Esto permite saltar filas de título/fusionadas antes de los encabezados reales (Nombre, Email, Teléfono…).

**Por qué / finalidad:**
El Excel del usuario tenía una fila de título fusionada como primera fila. El parser anterior la trataba como header → todos los lookups de columnas fallaban → los 37 clientes se rechazaban ("nombre vacío").

**Decisiones de diseño:**
- Umbral de ≥2 celdas no vacías para detectar el header real (consistente con `getExcelPreviewAction`).
- Sin cambios al contrato de tipos ni a los callers.

**Riesgos / deuda técnica pendiente:** Ninguno conocido.

---

### 2026-08-26 — FIX-BUILD-TEXTAREA-TYPES: corregir tipo HTMLTextAreaElement en handlers de payment-modal

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `e656620`  
**Módulo(s) afectado(s):** `components/closing/payment-modal.tsx`

**Qué se hizo:**
- Corregidos 3 handlers `onChange` en `<Textarea>` que tenían tipo `React.ChangeEvent<HTMLInputElement>` (incorrecto) → `React.ChangeEvent<HTMLTextAreaElement>` (correcto).
- Líneas afectadas: 592 (`setMainPain`), 601 (`setObjections`), 610 (`setFeedbackNotes`).
- El build de Vercel (`dpl_Hfs8Ct6FFrwHjMdkTeJ3Z1b8XuAi`) pasó con estado READY.

**Por qué / finalidad:**
Un sed masivo de la sesión anterior había reemplazado globalmente `onChange={(e) =>` por `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>` sin distinguir entre `<Input>` y `<Textarea>`. Next.js detectó la incompatibilidad de tipos al compilar `payment-modal.tsx` y el build falló.

**Riesgos / deuda técnica pendiente:**
- La migración SQL `20260825100000_plans_client_plan_delete.sql` sigue pendiente de aplicar manualmente en Supabase Dashboard.

---

### 2026-08-25 — FIX-BUILD-UNESCAPED-ENTITIES: escapar comillas en JSX de plan-manager-dialog

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `8a3eea4`  
**Módulo(s) afectado(s):** `components/clients/plan-manager-dialog.tsx`, `components/closing/payment-modal.tsx`

**Qué se hizo:**
- `plan-manager-dialog.tsx` línea 135: reemplazó comillas `"` literales en JSX por `&quot;` (ESLint `react/no-unescaped-entities` las trata como error de build).
- `payment-modal.tsx`: eliminó variable `firstInstallmentPaid` definida pero nunca usada.

**Por qué / finalidad:**
El primer build de Vercel (`dpl_54b7QhUq86K328EDWZdKXPgvW5dL`) falló por el error `react/no-unescaped-entities`. ESLint en modo Next.js trata ese rule como error, no warning.

---

### 2026-08-25 — FEAT-PLANES-CUOTAS-CLIENTES: planes con sistemas de cuotas, eliminar clientes, asignar plan, closing con cuotas manuales

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `54fb73c`  
**Módulo(s) afectado(s):** `types/plans.ts`, `types/clients.ts`, `types/closing.ts`, `app/clients/plan-actions.ts`, `app/clients/actions.ts`, `components/clients/plan-manager-dialog.tsx`, `components/clients/clients-list.tsx`, `components/closing/payment-modal.tsx`, `lib/clients/mapper.ts`, `lib/validations.ts`, `providers/platform-data-provider.tsx`, `supabase/migrations/`

**Qué se hizo:**

1. **Migración SQL** (`20260825100000_plans_client_plan_delete.sql`):
   - Nueva tabla `public.plans` con: `id`, `organization_id`, `name`, `duration_days`, `installment_systems` (JSONB array), timestamps
   - RLS policies para read/insert/update/delete por miembros de la organización
   - Columnas nuevas en `clients`: `plan_id uuid REFERENCES plans(id) ON DELETE SET NULL`, `selected_installment_system_id text`
   - Policy nueva para eliminar clientes: "Users delete org clients"

2. **Tipos nuevos** (`types/plans.ts`): `InstallmentSystem { id, name, count, amountPerInstallment }`, `Plan { id, name, durationDays?, installmentSystems[], createdAt }`

3. **Server Actions planes** (`app/clients/plan-actions.ts`): `listPlansAction`, `createPlanAction`, `updatePlanAction`, `deletePlanAction` — todos con RLS via `requireOrganizationId()`

4. **Actions clientes** (`app/clients/actions.ts`): `deleteClientAction(id)`, `assignClientPlanAction(clientId, planId?, systemId?)`

5. **PlanManagerDialog** (nuevo componente): reemplaza `PlanDurationsDialog`. Modo list/new/edit, formulario con nombre + duración + sistemas de cuotas dinámicos (agregar/eliminar). Cada sistema: nombre, cantidad de cuotas, monto por cuota.

6. **ClientsList** (reescrito):
   - Eliminado botón "Cargar clientes"
   - Reemplazado "Duraciones de planes" por "Crear planes" (abre PlanManagerDialog)
   - Icono eliminar por fila (Trash2) → confirmación → `deleteClientAction` → `refreshClients`
   - Icono asignar plan por fila (BookOpen) → `AssignPlanDialog` → `assignClientPlanAction` → `refreshClients`
   - Muestra nombre del plan asignado (del array `plans` si hay `planId`, si no de `planDurations` legacy)

7. **PaymentModal** (reescrito):
   - Carga planes al abrir con `listPlansAction()`
   - Selector opcional "Plan contratado" (pre-llena offeredProduct con el nombre del plan)
   - Para cuotas: si el plan tiene sistemas, selector de sistema → N campos individuales de monto (uno por cuota, default = `amountPerInstallment` del sistema)
   - Sin sistema: campo uniforme `installmentAmount` existente
   - Payload incluye `customInstallmentAmounts[]`, `planId`, `selectedInstallmentSystemId`

8. **Provider** (`platform-data-provider.tsx`): `buildClientFromPayment` calcula revenue con `customInstallmentAmounts` (suma de montos individuales si están definidos), mapea `planId` y `selectedInstallmentSystemId`

9. **Mapper, validaciones**: `plan_id`/`selected_installment_system_id` en `ClientRow`, `rowToClient`, `clientToInsertRow`, `patchToUpdateRow`; `planId`/`selectedInstallmentSystemId` en `clientFieldsSchema`

**Por qué / finalidad:**
- El founder necesitaba definir planes con sistemas de cuotas (ej: "2 cuotas de $1000", "3 cuotas de $700") para calcular saldo adeudado por cliente
- El closer necesitaba poder registrar montos reales por cuota al cerrar (ej: cuota 1 → $800, cuota 2 → $1200 aunque el plan diga $1000 c/u)
- Se eliminó el botón "Cargar clientes" como fue solicitado
- Se añadió la capacidad de eliminar clientes (antes no existía)

**Decisiones de diseño:**
- `installment_systems` como JSONB array en `plans` (no tabla separada) — más simple, el plan es siempre leído completo
- Montos individuales como array paralelo al contador de cuotas (`customInstallmentAmounts[i]`)
- `assignClientPlanAction` llama al `updateClientAction` existente — no duplica lógica de update

**Riesgos / deuda técnica pendiente:**
- La migración SQL debe aplicarse en Supabase (no fue aplicada automáticamente)
- El cálculo de "adeudado" (outstanding balance) usa los pagos registrados vs. total del plan; si el plan tiene cuotas custom, la lógica en `computeOutstandingBalance` puede necesitar revisión futura
- `PlanDurationsDialog` eliminado del módulo de clientes; si había referencias en otras partes del código, revisar

---

### 2026-08-25 — FIX-VENTAS-CASH-COLLECTED: panel de métricas de ventas usa gastos configurados para cash collected

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `components/sales/sales-metrics-redesign.tsx`

**Qué se hizo:**
- En la rama de snapshot fallback, `effectiveCashCollected` ahora usa `financeSummary.gastosTotales` (gastos configurados vía provider) como primera fuente en lugar de `sm["gastos"]` (que siempre es 0 en el snapshot importado).
- Formula: `max(0, sm["facturacion"] - (financeSummary.gastosTotales > 0 ? financeSummary.gastosTotales : sm["gastos"]))`

**Por qué / finalidad:**
Panel de finanzas mostraba "Cash collected: US$ 10.000" (correcto) pero panel de métricas de ventas mostraba "US$ 12.500" (= facturación sin descontar gastos). La inconsistencia surgía porque el snapshot almacena `cash_collected = facturacion - 0` al momento del import (sin gastos). El panel de ventas leía ese valor directamente en lugar de derivarlo con los gastos reales.

**Decisiones de diseño:**
- Misma prioridad que el provider: gastos configurados en módulo > campo gastos del snapshot > 0
- Consistente con `finance-data-provider.tsx` y `collect-context.ts` (fixes de sesión anterior)

**Riesgos / deuda técnica:** Ninguno adicional — el provider ya tenía `gastosTotales` correcto.

---

### 2026-08-25 — FIX-BASELINE-GASTOS: cashCollected y margenPercent usan gastos configurados del módulo (no snapshot)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `providers/finance-data-provider.tsx`, `lib/intelligence/collect-context.ts`

**Qué se hizo:**
- `finance-data-provider.tsx` (financeSummary baseline): se reemplaza `bGastos = salesBaselineMetrics["gastos"] ?? 0` (siempre 0, el snapshot de ventas no tiene campo gastos) por `effectiveGastos = live.gastosTotales > 0 ? live.gastosTotales : bGastosSnapshot`. Ahora `cashCollected` y `margenPercent` del baseline usan los gastos reales configurados en el módulo de finanzas.
- `collect-context.ts` (inteligencia): mismo fix — `effectiveGastos` para el `bMargen` del agente IA.

**Por qué / finalidad:**
El usuario tiene gastos configurados en el módulo de finanzas (gastos fijos, suscripciones, equipo). Estos gastos producen `live.gastosTotales` correcto. Pero el baseline fallback computaba `cashCollected = facturacion - bGastos` donde `bGastos = snapshot["gastos"] = null → 0`. Resultado: `cashCollected = 12500` y `margenPercent = 100%`, ignorando totalmente los gastos reales configurados. Ahora el baseline usa los gastos configurados como fuente primaria y solo cae al snapshot si no hay config.

**Decisiones de diseño:**
- Prioridad: gastos configurados (módulo finanzas) > campo gastos del snapshot > 0
- `monthlySeries` ya usaba `expensesSummary.totalMonthly` correctamente — ahora `financeSummary` es consistente con eso.
- No se cambia la lógica de facturación (sigue viniendo del snapshot cuando no hay datos live).

**Riesgos / deuda técnica pendiente:** Si el usuario importa un snapshot con campo `gastos` pero NO ha configurado gastos en el módulo, se usa el snapshot — comportamiento correcto. Si ambos están configurados, gana el módulo.

---

### 2026-08-25 — FIX-ANIMATED-NUMBER-LOCALE: parseAnimatableMetricValue soporta formato numérico europeo (es-AR)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `packages/ui/src/lib/parse-metric-value.ts`, `apps/web/lib/finance/format.ts`

**Qué se hizo:**
- `parseAnimatableMetricValue`: se agrega función `normalizeNumPart` que detecta formato europeo/es-AR antes de parsear el número animado:
  - `"12.500"` (punto como miles) → `"12500"` → 12500 ✓ (antes parseaba como 12.5)
  - `"49,6"` (coma como decimal) → `"49.6"` → 49.6 ✓ (antes stripeaba la coma → 496)
  - `"1.234,56"` (miles + decimal europeo) → `"1234.56"` → 1234.56 ✓
  - Formato inglés sin cambios (comma como miles, punto como decimal)
- `formatMoney`: agrega `minimumFractionDigits: 0` junto con `maximumFractionDigits: 0` para evitar que USD fuerce 2 decimales en algunos browsers.

**Por qué / finalidad:**
El dashboard mostraba "496%" en lugar de "49,6%" para tasa de agendamiento, y "US$ 12,50" en lugar de "US$ 12.500" para MRR. El componente `MetricAnimatedValue` parsea el string pre-formateado para animar la transición numérica. La función de parseo trataba la coma (decimal en es-AR) como separador de miles (y la eliminaba), y el punto (miles en es-AR) como decimal — produciendo valores ×10 para porcentajes e ÷1000 para montos.

**Decisiones de diseño:**
- La fix vive en el parser, no en los formatters — el formato es correcto para mostrar al usuario, el problema era la interpretación interna del parser.
- La detección de formato es por patrón regex heurístico: miles europeos = `/[0-9]{1,3}(\.[0-9]{3})+/`, decimal europeo = `/[0-9]+,[0-9]{1,2}$/`. Funciona para todos los valores actuales del sistema.
- El fallback (formato inglés) mantiene el comportamiento anterior para valores no reconocidos.

**Riesgos / deuda técnica pendiente:** Ninguno relevante. Si en el futuro se usan valores como "1,234" (inglés con miles-comma), podrían ambiguarse con "1,234" (4 dígitos después de coma), pero ese patrón no ocurre en el sistema actual.

---

### 2026-08-25 — FIX-DASHBOARD-SALES-BASELINE: Dashboard usa fallback baseline para métricas de ventas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `providers/finance-data-provider.tsx`, `components/dashboard/dashboard-page-content.tsx`

**Qué se hizo:**
- `FinanceDataProvider`: se expone `salesBaselineMetrics` en el contexto (`FinanceDataContextValue`) y se agrega al deps array del `value` useMemo.
- `DashboardPageContent`: se consume `salesBaselineMetrics` del provider; se construye `effectiveSalesMetrics` con fallback baseline cuando no hay datos live (`totalConversations === 0 && bookingRate === 0`). Se pasa `effectiveSalesMetrics` a `deriveDashboardData` en lugar de `salesMetrics`.

**Por qué / finalidad:**
El panel de métricas de ventas (`/sales/metrics`) mostraba "Tasa de agendamiento: 50%" (desde snapshot importado) pero el dashboard (`/dashboard`) mostraba 0%. La inconsistencia se debía a que ambos componentes cargaban los datos por caminos distintos: el panel de ventas recibía el snapshot como prop de Server Component, el dashboard nunca lo veía. Ahora el dashboard aplica el mismo patrón de fallback baseline-live.

**Decisiones de diseño:**
- Solo se aplica el fallback en `bookingRate` y `ghostingRate` (son tasas históricas con sentido como baseline). Las métricas de estado live (`totalConversations`, `activeConversations`, etc.) se mantienen en 0 — son estado actual, no histórico.
- La condición de fallback es `hasLiveData = totalConversations > 0 || bookingRate > 0` — si hay conversaciones live, no se toca nada.
- Misma lógica que `SalesMetricsRedesign` usa con `useSnapshotFallback`.

**Riesgos / deuda técnica pendiente:** Ninguno relevante.

---

### 2026-08-25 — FIX-FORMAT-MONEY: formatMoney cambia es-ES → es-AR para evitar confusión de separadores

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `lib/finance/format.ts`

**Qué se hizo:**
- `formatMoney` ahora usa `es-AR` en lugar de `es-ES` para formatear USD.
- Resultado antes: `"12.500 US$"` — símbolo al final. El usuario argentino lee el punto como decimal y ve "12,50 US$" (doce con cincuenta).
- Resultado ahora: `"US$ 12.500"` — símbolo al principio. Unívoco: "US$ doce mil quinientos".
- ARS también usa `Math.round` + `toLocaleString("es-AR")` para consistencia (ya no muestra " ARS" al final).

**Por qué:** El dashboard mostraba el MRR del baseline como "12,50US$" (confuso) en lugar de "US$ 12.500" (claro). El cambio de locale resuelve tanto el orden del símbolo como la legibilidad del separador de miles.

---

### 2026-08-25 — FIX-BASELINE-GAPS: Baseline en módulo Intelligence y monthlySeries

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `lib/intelligence/collect-context.ts`, `providers/finance-data-provider.tsx`

**Qué se hizo:**
- **`lib/intelligence/collect-context.ts`**: `collectIntelligenceData()` ahora incluye la query de `metrics_snapshots` en el `Promise.all` existente. Si `finance.facturacion === 0` (usuario sin integraciones activas), aplica los valores del snapshot como fallback para `facturacion` y `margenPercent` en el bloque `finance`. Esto hace que las páginas `/intelligence/insights` y `/intelligence/context` reflejen los datos reales importados, no ceros.
- **`providers/finance-data-provider.tsx`** — `monthlySeries`: cuando toda la serie de 6 meses tiene `facturacion === 0` (usuario nuevo sin eventos de cobro en vivo) y `salesBaselineMetrics` tiene datos, inyecta los valores del snapshot en el mes más reciente. Así los gráficos de área dual en `/finance` y los sparklines en `/sales/metrics` no muestran una línea plana en cero.

**Por qué / finalidad:**
- Cierre de los dos últimos vacíos de la arquitectura baseline: Intelligence y gráficos de serie temporal.
- El Intelligence module alimenta snapshots, reportes y el agente — sin baseline, los análisis IA sobre negocios nuevos no tenían datos de facturación.
- El `monthlySeries` all-zeros hacía que el gráfico de tendencia en `/finance` fuera completamente plano aunque el founder tuviera datos importados.

**Decisiones de diseño:**
- La query de baseline en `collect-context.ts` se añade al `Promise.all` existente (parallel, sin latencia extra).
- En `monthlySeries`, sólo se parchea el mes más reciente (no los 6) para no generar datos artificiales en meses pasados que el founder no declaró.
- Condición de parcheo: `series.every(m => m.facturacion === 0)` — si hay aunque sea un mes con datos reales, no se toca la serie.

**Riesgos / deuda técnica pendiente:**
- El snapshot inyectado en `monthlySeries` es el valor global del snapshot, no un desglose real mes a mes. Es un "hito de referencia" visual para el mes actual. Cuando el founder tenga datos live, desaparecerá naturalmente.
- Si el founder tiene datos de varios períodos en `metrics_snapshots`, sería más rico poblar cada mes correspondiente. Queda como mejora futura.

---

### 2026-08-25 — FEAT-BASELINE-ARCHITECTURE: Arquitectura de datos baseline escalable

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `6140f3d` — feat(metrics): arquitectura de baseline escalable — datos históricos + live  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/baseline-service.ts` (nuevo), `providers/finance-data-provider.tsx`, `lib/ai/org-context.ts`

**Qué se hizo:**
- **Nuevo `lib/metrics/baseline-service.ts`**: servicio centralizado de lectura de `metrics_snapshots`. Exports:
  - `getLatestOrgBaseline(orgId, category)` — snapshot más reciente de una categoría
  - `getAllLatestBaselines(orgId)` — un snapshot por categoría (para el agente)
  - `extractFinanceBaseline(snapshot)` — normaliza a `{facturacion, gastos, cashCollected, margenPercent}`
- **`finance-data-provider.tsx`**: el provider ahora carga baseline de ventas al montar. Si `live.facturacion === 0` y hay baseline, hace fallback a los datos importados para `facturacion`, `cashCollected`, `gastosTotales` y `margenPercent`. Cuando el software tenga datos reales integrados (clientes/pagos), éstos toman prioridad automáticamente.
- **`lib/ai/org-context.ts`**: el agente de IA ahora recibe la sección `MÉTRICAS HISTÓRICAS DE REFERENCIA` en su contexto. Puede analizar, comparar y dar recomendaciones usando los números reales del negocio desde el primer día de uso.

**Por qué / finalidad:**
- Resolver que los datos importados en "Métricas de ventas" sólo aparecían en el módulo de ventas, pero el resto del software (finanzas, agente) no los veía.
- Arquitectura de dos capas: Baseline (histórico, importado) + Live (tiempo real, integraciones). Live prevalece siempre; baseline es el fallback cuando live = 0.

**Decisiones de diseño:**
- `baseline-service.ts` es server-only (usa `createAdminClient`), no un Server Action (`"use server"`), para que sea importable desde `org-context.ts` y otras utilidades de servidor.
- El finance provider usa `getSalesMetricsSnapshotsAction` (ya existía) para cargar el baseline — reutiliza la query existente, no duplica lógica.
- La condición de fallback es `live.facturacion === 0` — si el founder tiene aunque sea un cliente con pago, los datos reales prevalecen.

**Riesgos / deuda técnica pendiente:**
- El agente invalida cache con TTL de 10 min. Si el founder importa datos y chatea inmediatamente, el agente podría no ver el baseline hasta el próximo ciclo de cache.
- `monthlySeries` (gráfico mensual en finanzas) ya tiene baseline fallback desde el commit FIX-BASELINE-GAPS.
- Si en el futuro se agregan categorías distintas a "sales", `finance-data-provider` tendría que cargar el baseline de cada categoría por separado.

---

### 2026-08-25 — FEAT-IMPORT-MANUAL-FORM: Formulario manual de métricas de ventas + eliminación de finanzas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `49c5e58` — feat(import): eliminar métricas de finanzas y convertir ventas a formulario manual  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/excel-parser.ts`, `app/clients/import-actions.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- Eliminada completamente la opción "Métricas de finanzas" del wizard de importación
- Reemplazada la carga de archivo `.xlsx` para métricas de ventas por un formulario manual inline (`ManualSalesForm`):
  - Grid con una fila por período, `<input type="month">` para el mes y texto para cada métrica
  - Auto-sugiere el mes anterior al inicializar; botón + para agregar filas, botón Trash para eliminar
  - Campos: Leads totales, Agendas totales, Show up, No show up, Cierres, Facturación
- `deriveSalesMetrics()` en `excel-parser.ts` pasó de privada a exportada para uso en la acción manual
- Nueva Server Action `importSalesMetricsManualAction(rows: ManualSalesMetricInput[])` en `import-actions.ts`:
  - Valida formato `YYYY-MM`; convierte a `period_start = YYYY-MM-01`; genera `period_label` en español
  - Llama `deriveSalesMetrics()` antes del upsert a `metrics_snapshots`
- El paso "Mapeo" solo aparece cuando se está importando un archivo Excel de clientes
- `WhatToImport` ahora es `"clients" | "salesMetrics"` (eliminado `"financeMetrics"`)

**Por qué / finalidad:**
El usuario decidió que la forma más práctica de cargar métricas de ventas históricas es un formulario directo (datos del software propios del usuario), sin necesidad de preparar un Excel. Las métricas de finanzas se manejarán de otra forma.

**Decisiones de diseño relevantes:**
- Se mantiene el flujo Excel solo para importar contactos (clientes), donde el mapeo de columnas tiene valor
- El formulario manual es más ergonómico: el usuario ingresa un mes y los valores directamente
- `<input type="month">` devuelve `YYYY-MM`; se convierte a `YYYY-MM-01` al persistir en `period_start`

**Riesgos / deuda técnica pendiente:**
- Las métricas de finanzas quedan sin UI de carga por ahora (pendiente definir cómo se cargarán)
- La tabla `metrics_snapshots` sigue teniendo soporte para `category = "finance"` en el schema

---

### 2026-08-25 — FEAT-METRICS-DERIVE: Auto-derivación de métricas combinadas al importar

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `993103b` — feat(metrics-import): auto-derivación de métricas combinadas desde primarias  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/excel-parser.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- `apps/web/lib/metrics/excel-parser.ts`:
  - Agrega `deriveSalesMetrics(metrics)`: calcula las métricas derivadas de ventas que no estén presentes:
    - `inasistencias` = `agendas_totales` − `asistencias`
    - `no_cierres` = `asistencias` − `cierres`
    - `close_rate` = `cierres` / `asistencias`
    - `show_rate` = `asistencias` / `agendas_totales`
    - `tasa_agendamiento` = `agendas_totales` / `leads_totales`
    - `tasa_fantasma` = `inasistencias` / `agendas_totales`
  - Agrega `deriveFinanceMetrics(metrics)`: calcula métricas derivadas de finanzas:
    - `margen` = `facturacion` − `gastos`
    - `pct_margen` = `margen` / `facturacion`
  - Aplica `deriveSalesMetrics` en `parseSalesMetricsTransposed` y `parseSalesMetricsExcel` (post-procesado de filas)
  - Aplica `deriveFinanceMetrics` en `parseFinanceMetricsTransposed` y `parseFinanceMetricsExcel`
  - Las métricas derivadas solo se calculan si no están ya presentes (el archivo puede tenerlas explícitamente y tienen prioridad)
- `apps/web/components/integrations/data-import-wizard.tsx`:
  - `SALES_ROW_FIELDS`: reduce de 17 a 11 campos (solo primarios). Eliminados: `closeRate`, `showRate`, `tasaAgendamiento`, `tasaFantasma`, `inasistencias`, `noCierres`
  - `FINANCE_ROW_FIELDS`: reduce de 5 a 4 campos. Eliminado: `margen` (se calcula de `facturacion − gastos`)

**Por qué / finalidad:**
El usuario quería ingresar únicamente las métricas base y que el sistema derive automáticamente las métricas combinadas (porcentajes, tasas). Simplifica el mapper de filas y evita errores de cálculo manual.

**Decisiones de diseño:**
- Las métricas derivadas no sobreescriben valores explícitos del archivo (verificación `!("campo" in m)`)
- Se aplica tanto al formato pivot (transpuesto) como al estándar (columnas)
- `inasistencias` se calcula antes de `tasa_fantasma` para que esta última pueda usarla

**Riesgos / deuda técnica:**
- Los módulos de Finanzas y Métricas de ventas en el frontend aún no consumen `metrics_snapshots` (`[FEAT-EXCEL-IMPORT-FASE3-RESTANTE]`)
- `pct_margen` es un campo nuevo en `metrics_snapshots.metrics` (JSONB) — no requiere migración, pero las consultas deben esperarlo como opcional

---

### 2026-08-25 — FEAT-EXCEL-TRANSPOSED-ROW-MAPPER: Mapeo manual de filas en formato pivot

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `cab4ed9` — feat(importacion): mapeo manual de filas para hojas transpuestas (pivot)  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos, wizard, métricas de ventas y finanzas

**Qué se hizo:**
- `apps/web/lib/metrics/excel-parser.ts`:
  - `parseTransposedMetrics`: acepta nuevo parámetro `explicitRowMapping?: Record<string, string>` (field key → etiqueta de fila). Construye `effectiveLookup` invirtiendo el mapeo del usuario; si no se provee, usa el diccionario automático como fallback
  - `parseSalesMetricsTransposed` y `parseFinanceMetricsTransposed`: firmas actualizadas con `rowMapping?: Record<string, string>` como primer argumento opcional
- `apps/web/app/clients/import-actions.ts`:
  - `importFinanceMetricsTransposedAction`: firma actualizada para aceptar `rowMapping: Record<string, string>` y pasarlo al parser
  - `importSalesMetricsTransposedAction`: ya tenía `rowMapping`; ahora ambas acciones son consistentes
- `apps/web/components/integrations/data-import-wizard.tsx`:
  - Reemplaza `TransposedBanner` (solo texto) por `TransposedRowMapper`: UI con dropdowns por campo OTC, donde el usuario selecciona qué fila del Excel corresponde a cada métrica
  - Agrega `RowField` tipo, `SALES_ROW_FIELDS` y `FINANCE_ROW_FIELDS`: 17 y 5 campos respectivamente, con labels en español
  - Agrega `autoMapTransposedRows()`: sugiere un mapeo inicial usando el diccionario de sinónimos a partir de `rowLabels` del preview
  - Agrega estado `transposedSalesRowMapping` y `transposedFinanceRowMapping`
  - `handleAdvanceFromWhat`: llama `autoMapTransposedRows` para pre-poblar el mapper al detectar formato pivot
  - `handleSalesMetricsSheetChange` y `handleFinanceMetricsSheetChange`: re-auto-mapean filas al cambiar de hoja
  - `canAdvanceFromMapper`: para tipos transpuestos, válido si al menos 1 fila está mapeada
  - `handleImport`: pasa `transposedSalesRowMapping` / `transposedFinanceRowMapping` a las acciones transpuestas
  - `StepMapper`: nuevo props `transposedSalesRowMapping`, `transposedFinanceRowMapping`, `onTransposedSalesRowMappingChange`, `onTransposedFinanceRowMappingChange`
  - Texto de confirmación corregido: aclara que métricas hacen upsert (no "no se sobreescribirán")

**Por qué / finalidad:**
El usuario reportó que al importar su archivo MAESTRO DE METRICAS en formato pivot, (1) el sistema auto-mapeaba solo ~4 filas (las que coincidían exactamente con el diccionario) sin mostrar el resto, (2) no había control manual sobre qué fila corresponde a qué métrica. Ahora el wizard muestra un mapper explícito con todos los campos OTC y todos los nombres de fila del archivo, pre-poblado con las sugerencias automáticas pero editable libremente.

**Decisiones de diseño:**
- El usuario tiene control total: puede ver/cambiar todos los mapeos antes de importar
- El auto-mapeo es solo una sugerencia de punto de partida (puede haber falsos positivos o etiquetas no reconocidas)
- `rowLabels` viene del preview del server (columna A del archivo) para evitar duplicar la lógica XLSX en el cliente
- Si `explicitRowMapping` se provee con entradas, el parser lo usa exclusivamente; si está vacío/undefined, el diccionario automático actúa como fallback (preservando compatibilidad con formato estándar)

**Riesgos / deuda técnica:**
- Si el archivo tiene muchas filas en columna A (ej. totales, subtítulos), el dropdown puede llenarse de opciones — sin filtrado por ahora
- Los datos importados van a `metrics_snapshots` pero ningún módulo UI los consume aún ([FEAT-EXCEL-IMPORT-FASE3-RESTANTE])

---

## Formato de entrada

Cada entrada debe seguir esta estructura:

```
### [FECHA] — [TÍTULO CORTO DEL CAMBIO]

**Rama/branch:** `nombre-del-branch`  
**Commit(s):** `hash_corto` — mensaje  
**Autor:** Claude / Devin / Santiago / etc.  
**Módulo(s) afectado(s):** marketing, ventas, ui, agent, etc.

**Qué se hizo:**
Descripción clara de los cambios realizados. Qué archivos se tocaron y por qué.

**Por qué / finalidad:**
El problema que resolvía, la feature que implementaba, o la deuda técnica que saldaba.

**Decisiones de diseño relevantes:**
Opciones consideradas, trade-offs, patrones usados o evitados.

**Riesgos / deuda técnica pendiente:**
Qué quedó sin hacer, qué puede romperse, qué hay que revisar luego.
```

---

## Historial de cambios

---

### 2026-08-26 — FIX-HOLDING-TEAM-ROLES: error RLS al crear rol en contexto holding

**Rama/branch:** `claude/holding-role-creation-error-lueoz6`  
**Commits:** `3dff083`, `f8d3d2c`  
**Módulo(s) afectado(s):** `apps/web/app/team/actions.ts`

**Qué se hizo:**
Reemplazado `profile.organization_id` por `requireOrganizationId()` en cinco actions de `team/actions.ts`: `createCustomRoleAction`, `deleteCustomRoleAction`, `updateMemberRoleAction`, `deactivateMemberAction`, `inviteTeamMemberAction`.

**Por qué / finalidad:**
Un usuario holding que opera un negocio hijo veía "new row violates row-level security policy for table 'team_roles'" al crear un rol. La causa raíz: `get_my_organization_id()` (migración `20260620100000_holding_jwt_claim_hook.sql`) lee `active_business_org_id` del JWT cuando el holding opera un hijo — hace que el RLS evalúe contra `child_org_id`. Los actions usaban `profile.organization_id` (= `holding_org_id`) para el INSERT, entonces `WITH CHECK (organization_id = get_my_organization_id())` fallaba: `holding_org_id ≠ child_org_id`. Los otros tres actions tenían el mismo bug con efectos silenciosos (filtros erróneos → no-ops). `inviteTeamMemberAction` usaba admin client (bypass RLS, no crasheaba) pero creaba el miembro en la org incorrecta.

**Decisiones de diseño:**
`requireManagerProfile()` sigue usando `getCurrentProfile()` para la verificación de permisos (rol real del holding = "founder"). El org_id efectivo para operaciones en DB se resuelve con `requireOrganizationId()`, que respeta el JWT del holding.

**Riesgos / deuda técnica pendiente:**
Ninguno conocido para este fix.
### 2026-08-26 — feat(clientes): barra de progreso de pagos, registro de comprobantes y círculo indicador de días restantes

**Rama/branch:** `claude/payment-progress-days-indicator-ce7wvq`  
**Commit(s):** `6cb9065`  
**Autor:** Claude  
**Módulo(s) afectado(s):** clientes

**Qué se hizo:**
- `components/clients/client-payments-section.tsx`: se agrega `PaymentProgressBar`, un componente visual que muestra el avance de cobros (pagado vs. total) con colores dinámicos (rojo/ámbar/primary/verde según el porcentaje). La barra aparece automáticamente una vez que cargan los pagos. También se agrega `AddGenericPaymentDialog` para clientes de tipo `upfront` y `upfront_fee`, con campos de monto, fecha y dropzone de comprobante, que llama a `recordClientPaymentAction` directamente.
- `components/clients/clients-list.tsx`: se agrega `RemainingDaysBadge`, un componente que renderiza un círculo de color junto al texto de días restantes. Colores: rojo (<15 días), ámbar (15–29), verde (≥30), gris (programa finalizado), sin círculo (sin datos de duración de plan).

**Por qué / finalidad:**
- El founder necesitaba una barra de progreso visual de los cobros para saber cuánto falta cobrar de cada cliente de un vistazo.
- Los clientes upfront/upfront_fee no tenían forma de registrar comprobantes de pago (el botón existente solo aparecía para clientes de cuotas). Ahora todos los tipos de pago pueden cargar comprobantes.
- La columna de días restantes en la tabla no tenía indicador visual — ahora el círculo de color permite identificar rápidamente clientes con el programa próximo a vencer o ya vencido.

**Decisiones de diseño relevantes:**
- La barra de progreso usa el total de `payments.reduce(sum, amount)` calculado en cliente, sin llamadas adicionales al server. Se actualiza en tiempo real al registrar un nuevo pago.
- Para clientes `installments` no se agrega el botón genérico, para no romper el flujo de cuotas que ya maneja numeración e impacto en el campo `installments` del cliente.
- Los umbrales del círculo de color (15/30 días) se definieron como valores razonables para alertar con anticipación; se pueden ajustar fácilmente en `RemainingDaysBadge`.

**Riesgos / deuda técnica pendiente:**
- Los umbrales de color del círculo (15/30 días) están hardcodeados; podrían hacerse configurables por organización.
- Para clientes `installments` con todas las cuotas pagadas no hay botón para registrar pagos adicionales (por diseño, pero puede que se necesite en el futuro).

---

### 2026-08-25 — Soporte para formato pivot en importación de Excel (métricas)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `1f55b9d` — feat(metrics): soporte para formato pivot en importación de Excel  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de métricas, wizard de importación de datos

**Qué se hizo:**
- `apps/web/lib/metrics/excel-parser.ts`:
  - Agrega `parseMonthLabel()`: convierte "Marzo 2025", "03/2025", "2025-03" → "YYYY-MM-01"
  - Agrega `isTransposedMetricsSheet(headers)`: detecta si ≥2 encabezados son nombres de mes
  - Agrega `SALES_ROW_LABEL_MAP` y `FINANCE_ROW_LABEL_MAP`: diccionarios con ~50 variantes en español de etiquetas de fila → field keys
  - Agrega `parseTransposedMetrics()`: parser genérico para formato pivot (meses=columnas, métricas=filas). Salta filas de título merged, encuentra la fila de encabezados real, itera columnas de período, construye `MetricsSnapshotRow` por mes
  - Agrega `parseSalesMetricsTransposed()` y `parseFinanceMetricsTransposed()` como funciones exportadas
- `apps/web/app/clients/import-actions.ts`:
  - Corrige `getExcelPreviewAction` para usar `{ header: 1 }` y encontrar la primera fila con ≥2 celdas no vacías como fila de encabezados real. Antes: archivos con título merged en A1 devolvían `__EMPTY`, `__EMPTY_1`, etc. Ahora devuelve los encabezados reales (ej. nombres de meses)
  - Corrige `pickBestSheet` con el mismo enfoque
  - Agrega `importSalesMetricsTransposedAction` e `importFinanceMetricsTransposedAction`: usan el parser transpuesto, sin necesidad de mapping manual
- `apps/web/components/integrations/data-import-wizard.tsx`:
  - Agrega helpers `looksLikeMonthHeader` e `isTransposedMetricsFormat` para detección client-side
  - Agrega estado `transposedTypes: Set<WhatToImport>`
  - En `handleAdvanceFromWhat`: detecta automáticamente el formato pivot después de cargar el preview
  - En `handleSalesMetricsSheetChange` y `handleFinanceMetricsSheetChange`: re-detecta al cambiar de hoja
  - Agrega `TransposedBanner`: muestra mensaje "Formato tabla detectado" con la lista de meses
  - Actualiza `StepMapper`: para tipos transpuestos muestra el banner en lugar del column mapper; sigue mostrando el selector de hoja
  - `canAdvanceFromMapper`: los tipos transpuestos no requieren mapeo manual
  - `handleImport`: usa acción transpuesta cuando se detectó el formato, o la acción standard con mapping si no

**Por qué / finalidad:**
El usuario tiene un archivo "MAESTRO DE METRICAS ACADEMIA APPLE" en formato pivot (métricas como filas, meses Marzo-Noviembre como columnas). El sistema devolvía `__EMPTY` como encabezados porque la primera fila es un título merged. Ahora el wizard detecta el formato automáticamente, muestra un banner de confirmación, y permite importar sin necesidad de mapear columnas manualmente.

**Decisiones de diseño:**
- Detección automática client-side + server-side con función compartida conceptualmente (implementaciones paralelas para evitar importar código de servidor en el cliente)
- El formato estándar (una fila por período) sigue funcionando con el mapper manual; el formato pivot se auto-detecta
- Diccionarios de etiquetas con variantes en español para cubrir las denominaciones que usa el usuario sin depender del usuario para mapear
- `parseNum` reutilizado: acepta porcentajes "53%", decimales con coma "1.250,50", enteros

**Riesgos / deuda técnica:**
- Los diccionarios de etiquetas (`SALES_ROW_LABEL_MAP`) cubren las métricas visibles en el screenshot; si el archivo tiene secciones adicionales (ej. "INVERSIÓN" o "RETENCIÓN") con nombres no mapeados, se ignoran silenciosamente
- `isTransposedMetricsFormat` podría dar falso positivo si un archivo estándar tiene columnas con nombres de meses; en ese caso el usuario ve el banner en lugar del mapper. Resolver: agregar botón "Cambiar a mapeo manual" en el banner (pendiente)

---

### 2026-08-25 — Importación de métricas de ventas y finanzas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `1f154a6` — feat(importacion): agregar importación de métricas de ventas y finanzas  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos, métricas, finanzas

**Qué se hizo:**
- `supabase/migrations/20260825100000_metrics_snapshots.sql`: nueva tabla `metrics_snapshots` con columnas `organization_id`, `category` (sales/finance), `period_start` (date), `period_label`, `metrics` (JSONB). Unique constraint en `(organization_id, category, period_start)` para soportar upsert. RLS con `get_my_organization_id()`. Aplicada en Supabase.
- `apps/web/lib/metrics/excel-parser.ts`: parser genérico para archivos Excel de métricas. `parseNum()` maneja porcentajes ("53%"→0.53), separador de miles europeo, decimales con coma. `parseDate()` soporta serial Excel, ISO, DD/MM/YYYY, y etiquetas de texto. Funciones exportadas: `parseSalesMetricsExcel()` y `parseFinanceMetricsExcel()` con sus tipos de mapping.
- `apps/web/app/clients/import-actions.ts`: `importSalesMetricsFromExcelAction()` e `importFinanceMetricsFromExcelAction()` usando upsert con `onConflict: "organization_id,category,period_start"`.
- `apps/web/components/integrations/excel-column-mapper.tsx`: soporte para tipos `"salesMetrics"` y `"financeMetrics"` con campos definidos (19 para ventas, 6 para finanzas). `isMappingValid` acepta los nuevos tipos (solo requiere campo `period`).
- `apps/web/components/integrations/data-import-wizard.tsx`: wizard extendido a 4 tipos. Sub-componentes `FileRow` y `CheckboxCard` reutilizables. `StepWhat` con secciones para métricas de ventas (TrendingUp) y finanzas (DollarSign). `StepMapper` con selectores de hoja para los 4 archivos. `autoMap` extendido con diccionarios `SALES_METRICS_KNOWN` y `FINANCE_METRICS_KNOWN`. `handleImport` importa los 4 tipos en secuencia.

**Por qué / finalidad:**
El usuario necesitaba importar datos históricos de KPIs de ventas (close rate, show rate, leads, agendas, cierres, etc.) y finanzas (facturación, margen, gastos) desde sus propios archivos Excel. Cada fila del Excel representa un período con sus métricas agregadas, distinto del patrón de un registro por cliente.

**Decisiones de diseño relevantes:**
- JSONB para `metrics`: evita schema rígido y permite métricas opcionales sin columnas nulas. El campo exacto depende del mapeo del usuario.
- Upsert en conflicto: reimportar el mismo período actualiza los valores en vez de generar error o duplicado.
- Mismo archivo puede ser de múltiples hojas: los selectores de hoja funcionan igual que para clientes y llamadas.
- `autoMap` extendido para pre-seleccionar columnas cuando los nombres coinciden (normalizado a lowercase).

**Riesgos / deuda técnica pendiente:**
- No hay UI para ver/editar/eliminar métricas importadas; solo se guardan.
- La tabla `metrics_snapshots` existe pero ningún módulo la consume aún (pendiente conectar con finanzas/métricas).
- Texto de confirmación aún dice "Los registros existentes no se sobreescribirán" — en realidad sí se actualizan por upsert.

---

### 2026-08-25 — Excel multi-hoja: selector de hoja en el wizard de importación

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `831cbf4` — feat(excel-import): soporte para archivos Excel multi-hoja con selector de hoja  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos

**Qué se hizo:**
- `app/clients/import-actions.ts`: `getExcelPreviewAction` ahora acepta `sheetName?: string` y devuelve `allSheets: string[]` + `activeSheet: string`. Nueva función `pickBestSheet()` que elige la hoja con más headers no vacíos + bonus si el nombre contiene palabras clave de datos (data, cliente, lead, crm, etc.).
- `components/integrations/data-import-wizard.tsx`: nuevo componente `SheetSelector` (dropdown visible solo si el archivo tiene >1 hoja). Handlers `handleClientsSheetChange` y `handleClosingSheetChange` que re-fetchan el preview al cambiar de hoja y re-aplican el auto-mapeo. `StepMapper` recibe y usa todos los props de hoja.

**Por qué / finalidad:**
Archivos Excel reales de CRM suelen tener múltiples hojas (ej. `CRM_VENTAS__AA.xlsx` con 6 hojas donde la primera es un dashboard visual sin columnas útiles y los datos están en la hoja "Data"). El sistema ahora detecta automáticamente la mejor hoja y le permite al usuario cambiarla si no es la correcta.

**Decisiones de diseño relevantes:**
- La heurística `pickBestSheet` prioriza cantidad de headers + bonus por nombre. Es simple y cubre el caso real (dashboards vacíos vs hojas de datos). No hay riesgo de false positive grave porque el usuario puede corregir con el selector.
- El selector solo aparece cuando hay >1 hoja para no agregar ruido en el caso más común.
- Al cambiar de hoja se resetea el mapping con el auto-mapeo de la nueva hoja.

**Riesgos / deuda técnica pendiente:**
- La heurística podría fallar si todas las hojas tienen la misma cantidad de headers. Poco probable en la práctica.

---

### 2026-08-25 — Excel Column Mapper UI — mapeo de columnas para archivos propios

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `4d6d06b` (fix types) / commits previos  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos, clientes, closing

**Qué se hizo:**
- `app/clients/import-actions.ts`: nueva acción `getExcelPreviewAction(fileBase64)` que extrae headers y primeras 5 filas de cualquier archivo .xlsx sin parsear el schema OTC. Importa XLSX directamente en el action.
- `components/integrations/excel-column-mapper.tsx` (nuevo): componente que muestra dropdowns para mapear cada columna del archivo del usuario a cada campo OTC (Nombre, Email, Teléfono, Estado, Producto, Monto, Fecha, Notas para clientes; Nombre prospecto, Fecha, Email, Estado, Monto cerrado, Notas para closing). Incluye auto-mapeo por nombre de columna y vista previa de filas con las columnas mapeadas.
- `components/integrations/data-import-wizard.tsx`: se agrega un paso intermedio "mapper" entre "what" y "confirm" exclusivo del flujo Excel. Al avanzar desde "what", se fetchean los headers de los archivos subidos, se pre-mapean automáticamente si los nombres coinciden, y se muestra el `ExcelColumnMapper`. El mapping resultante se pasa a `importClientsFromExcelAction` y `importClosingCallsFromExcelAction` (que ya soportaban `columnMapping?`). El paso de confirmación navega correctamente con el nuevo paso insertado. Eliminado el link a la plantilla OTC (§2.4 descartado).

**Por qué / finalidad:**
El usuario puede tener sus datos en cualquier formato de Excel, con columnas nombradas de forma arbitraria. El mapper le permite indicar qué columna de su archivo corresponde a cada campo de OTC sin necesidad de reformatear el archivo ni usar una plantilla específica.

**Decisiones de diseño relevantes:**
- Auto-mapeo: al cargar el archivo, si algún header coincide (case-insensitive) con los nombres estándar de OTC (ej. "Nombre", "Email", "Teléfono"), se pre-selecciona automáticamente el mapping para evitar trabajo manual.
- Vista previa toggle: la tabla de preview de filas mapeadas es opcional (toggle per-sección) para no sobrecargar la UI.
- El mapper se salta completamente si el origen es GHL (no aplica).
- Se valida que los campos requeridos (name para clientes; leadName + scheduledAt para closing) estén mapeados antes de permitir avanzar.

**Riesgos / deuda técnica pendiente:**
- Si el usuario sube un archivo con miles de filas, `getExcelPreviewAction` igual lee todo el workbook (solo retorna 5 filas pero parsea todo). Para archivos masivos podría optimizarse con `sheetRowsLimit`.
- El link a la plantilla OTC fue eliminado del wizard — si se quiere recuperar en el futuro, habría que volver a agregar el CTA.

---

### 2026-08-24 — GHL UTM Attribution — atribución de fuente en closing calls

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `3da5bf1`  
**Autor:** Claude  
**Módulo(s) afectado(s):** closing/ventas, GHL integration

**Qué se hizo:**
- `lib/ghl/client.ts`: nuevo tipo `GHLContactAttributionSource` + función `getGHLContact(apiKey, contactId)` que trae el contacto individual con su campo `attributionSource` (UTMs). Devuelve `null` en caso de error para no bloquear el sync.
- `lib/ghl/sync-appointments.ts`: al insertar/actualizar appointments, se fetchean en paralelo (concurrencia 5) los contactos asociados por `contactId` y se extraen los campos UTM (`utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`). También se guarda el JSON crudo de atribución en `attribution_source`.
- `lib/ghl/sync-pipeline.ts`: pasa la `apiKey` a `syncGHLAppointmentsForOrganization` para habilitar el enriquecimiento de UTMs.
- `supabase/migrations/20260824200000_closing_calls_utm.sql`: agrega `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ghl_contact_id`, `attribution_source` a `closing_calls`. Aplicada en producción.
- `lib/closing/mapper.ts` + `types/closing.ts`: nuevos campos UTM en `ClosingCallRow` y `ClosingCall`.
- `components/closing/closing-overview.tsx`: columna "Fuente UTM" en tabla de lista (muestra source + medium · campaign). Panel de detalle: sección "Atribución UTM" con grid `dt/dd` visible solo si hay datos.

**Por qué / finalidad:**
El founder necesita saber de dónde viene cada agenda de cierre (qué campaña, fuente o contenido generó el lead). GHL guarda la atribución UTM en el contacto (`attributionSource`). Ahora el sync la extrae automáticamente y la muestra en la vista de closing.

**Decisiones de diseño relevantes:**
- **Pull durante sync vs. webhook**: se eligió pull (enriquecer al momento del sync) porque reutiliza la infraestructura existente, backfill automático de appointments históricos, y la atribución UTM no requiere real-time.
- **Solo para nuevos/actualizados**: el fetch de contactos se hace solo para `toInsert` y `toUpdate`, no para todos los appointments. Minimiza requests a GHL.
- **Concurrencia 5**: fetch paralelo con límite para no saturar la API de GHL. Un contacto fallido no bloquea el sync completo (`getGHLContact` devuelve `null` en error).
- **`attribution_source` JSONB**: se guarda el objeto crudo completo además de los campos normalizados, para referencia futura sin necesidad de re-fetch.

**Riesgos / deuda técnica pendiente:**
- Si un contacto en GHL no tiene `attributionSource` (lead creado manualmente, sin UTMs), los campos quedan `null` — comportamiento correcto y esperado.
- El campo `utmSource` en GHL puede ser `null` aun cuando hay datos en `medium` — el helper `buildUtmFields` hace fallback: `utmSource ?? medium`.
- Appointments ya insertados en DB (sin UTMs) se enriquecerán en el próximo sync si su status no es `"closed"`. Los cerrados no se actualizan por diseño (no sobreescribir deals cerrados).

---

### 2026-08-24 — GHL Data Loading — Fase 2 (importación de datos históricos)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Autor:** Claude  
**Módulo(s) afectado(s):** integrations, clients, closing/ventas

**Qué se hizo:**
- **Fix timestamps GHL** (`lib/ghl/sync-pipeline.ts`): `buildSyncRange()` ahora usa Unix timestamps en ms (`getTime().toString()`) en lugar de ISO 8601 — GHL `/calendars/events` devolvía 200 + array vacío con ISO strings. Agregado log diagnóstico y fallback `data.data` en `listGHLAppointments`.
- **GHL Contacts endpoint** (`lib/ghl/client.ts`): Nuevo tipo `GHLContact` y función `listGHLContacts()` con paginación cursor (`startAfterId`, máx 2000 contactos).
- **Sync contactos → clients** (`lib/ghl/sync-contacts.ts`): Mapeo idempotente GHL Contacts → `clients`. Dedup por nombre normalizado (case-insensitive). No sobreescribe existentes. Email/teléfono se guardan en `ai_insights`.
- **Import actions GHL** (`app/ghl/import-actions.ts`): `previewGHLContactsAction` (preview 10 primeros sin importar) + `importGHLContactsAction` (importación real vía admin client).
- **Parser Excel clientes** (`lib/clients/excel-parser.ts`): Parsea `.xlsx` con plantilla OTC (tab "Clientes") o mapeo de columnas propio. Soporta fechas seriales de Excel, DD/MM/AAAA e ISO. Usa `xlsx` (SheetJS).
- **Parser Excel llamadas** (`lib/closing/excel-parser.ts`): Idem para tab "Llamadas de cierre". Parsea fechas con hora. Status: cerrado → closed, no cerrado → not_closed, etc.
- **Server actions Excel** (`app/clients/import-actions.ts`): `importClientsFromExcelAction` y `importClosingCallsFromExcelAction`. Reciben el archivo como base64 (serializable en Server Actions). Dedup clientes por nombre.
- **Wizard UI** (`components/integrations/data-import-wizard.tsx`): Wizard 3 pasos — Origen (GHL/Excel), Qué importar (clientes/llamadas con preview), Confirmación + resultados.
- **Página wizard** (`app/(platform)/integrations/import/page.tsx`): Server Component que carga estado GHL y renderiza el wizard.
- **Integrations page** (`app/(platform)/integrations/page.tsx`): Botón "Importar datos históricos" → `/integrations/import`.
- **Ruta** (`routes/paths.ts`): Agregado `integrationsImport`.

**Por qué / finalidad:**
Usuarios nuevos de OTC tienen sus datos históricos en GHL o Excel. Sin importación masiva, el onboarding es manual y lento. Esta fase permite cargar clientes y llamadas de cierre de una vez desde ambas fuentes.

**Decisiones de diseño relevantes:**
- Archivos Excel se envían como base64 al Server Action (Next.js 15 no serializa `File` en network calls).
- Dedup por nombre (no por email) porque muchos usuarios no tienen email consistente en GHL.
- Llamadas de cierre no se deduplan (se insertan todas; el usuario puede limpiar duplicados después).
- Preview GHL carga automáticamente al seleccionar esa opción (llamada síncrona al `previewGHLContactsAction`).
- GHL Appointments ya se sincronizan vía el calendario (Fase 1) — no se duplica en el wizard.

**Riesgos / deuda técnica pendiente:**
- Mapeo de columnas personalizado (para archivos con formato propio): la UI del wizard no tiene la pantalla de mapeo de columnas todavía — usa la plantilla OTC o las columnas detectadas automáticamente. Pendiente implementar `excel-column-mapper.tsx` para Fase 3.
- Plantilla `.xlsx` descargable (`public/templates/otc-importacion.xlsx`) no generada todavía — el link en el wizard existe pero el archivo no.
- Oportunidades de GHL (pipeline) → closing_calls es stretch goal Fase 3.

---

### 2026-08-24 — Integración GoHighLevel (GHL) Calendar — Fase 1

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Autor:** Claude  
**Módulo(s) afectado(s):** integrations, closing/ventas, crons

**Qué se hizo:**
- **Migración SQL** (`supabase/migrations/20260824100000_ghl_integration.sql`): crea tabla `ghl_integrations` con API key cifrada, location_id, calendarios conectados y last_sync_at. Agrega columnas `ghl_appointment_id` y `ghl_calendar_id` a `closing_calls` con índice único por org.
- **GHL API client** (`lib/ghl/client.ts`): cliente V2 (`services.leadconnectorhq.com`), auth por Private Integration Token + Version header. Funciones: `validateGHLApiKey`, `listGHLCalendars`, `listGHLAppointments` (con paginación).
- **Integration helpers** (`lib/ghl/integration.ts`): cifrado/descifrado AES-256-GCM de API keys, getters/setters de integración org, upsert y refresh de calendarios.
- **Sync logic** (`lib/ghl/sync-appointments.ts`): mapeo idempotente de citas GHL a `closing_calls`. Status mapping: showed→closed, noshow→no_show, booked/confirmed→scheduled, cancelled/invalid→skip. Ventana de 90 días pasados + 90 días futuros.
- **Sync pipeline** (`lib/ghl/sync-pipeline.ts`): funciones safe (never-throw) para cron — `syncGHLOrganizationSafe` y `syncAllGHLOrganizationsSafe`.
- **Server Actions** (`app/ghl/actions.ts`): `getGHLIntegrationStatusAction`, `validateGHLKeyAction`, `connectGHLAction`, `updateGHLCalendarAction`, `syncGHLAppointmentsAction`.
- **Cron endpoint** (`app/api/cron/ghl-sync/route.ts`): sync horario con soporte `?organizationId=` para org específica, protegido con `CRON_SECRET`.
- **Dialog UI** (`components/integrations/ghl-connect-dialog.tsx`): flujo en 3 pasos — StepCredentials (token + locationId), StepSelectCalendar, ManagePanel (sync manual, cambio de calendario activo).
- **Icono SVG** (`public/integrations/ghl.svg`): logo circular "G" en ámbar.
- **Wiring en integrations page**: mock entry, brand colors, grupo, providers real, disconnect action, count, statusMap en `listIntegrationsAction`.
- **Wiring en integration-card.tsx**: import del dialog, estado `ghlConnectOpen`, handlers para connect/manage/disconnect, `supportsCardDisconnect`, action label "Gestionar", render del dialog.
- **Tipos closing**: `ClosingCallSource = "calendly" | "ghl" | "manual"`, campo `source` en `ClosingCall`.
- **Mapper closing**: `deriveSource()` basado en presencia de `calendly_event_id` vs `ghl_appointment_id`.
- **UI closing-overview**: badges de color por origen (azul=Calendly, ámbar=GHL, neutro=manual).
- **vercel.json**: cron `/api/cron/ghl-sync` cada hora.

**Por qué / finalidad:**
Usuarios que usan GoHighLevel en lugar de Calendly para agendar llamadas de cierre no tenían forma de importar sus citas a OTC. Esta integración los habilita con el mismo flujo que Calendly pero usando Private Integration Tokens de GHL (sin necesidad de registrar la app en el Marketplace todavía).

**Decisiones de diseño relevantes:**
- Auth por Private Integration Token ahora; OAuth/Marketplace se implementará cuando GHL lo apruebe (proceso lento).
- Calendly y GHL coexisten simultáneamente; el origen se distingue visualmente en la UI.
- API key cifrada con AES-256-GCM igual que otras integraciones con secrets; sin RLS SELECT en `ghl_integrations`.
- Citas canceladas/inválidas se omiten (no se importan); citas ya cerradas/no-cerradas en OTC se actualizan campos pero se preserva el status.
- `source` derivado en la capa mapper (no guardado en DB) para no romper schema existente.

**Riesgos / deuda técnica pendiente:**
- Migración SQL pendiente de aplicar en producción (`supabase/migrations/20260824100000_ghl_integration.sql`).
- Migrar a OAuth "Connect with GHL" cuando OTC sea aprobado como app en GHL Marketplace.
- Phase 2 (carga de datos históricos desde Excel) queda para sesión futura — ver PENDIENTES.
### 2026-08-24 — fix(marketing): stories de Instagram no se mostraban en la app

**Rama/branch:** `claude/architecture-review-improvements-fdj4ae`  
**Commit(s):** `cf20aa3`  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/content, zernio/client

**Qué se hizo:**

- Nuevo método `listInstagramStories(accountId)` en `ZernioClient` que llama al endpoint documentado por Zernio: `GET /v1/accounts/{accountId}/instagram/stories`. El cliente mapea la respuesta (campos `id`, `mediaUrl`, `permalink`, `timestamp`) a `ZernioPost` con `postType: "story"` garantizado. Nuevo tipo `ZernioInstagramStory` para la respuesta.
- `fetchExternalPostsViaSync` reestructurado para recolectar historias **primero** en `allPosts`, con tres estrategias en paralelo: endpoint dedicado (principal), `POST /posts/sync-stories` (legacy, retorna 405 → vacío), `GET /posts?type=story` (fallback con forzado de `postType`).
- Al entrar primero en `allPosts`, las versiones tipeadas de las historias ganan el dedup sobre los duplicados sin tipo del listado general (`listPublishedPosts external`).

**Por qué / finalidad:**

Root cause: las historias se obtenían con `GET /posts?type=story` pero Zernio no devuelve el campo `postType` en la respuesta. `mapZernioType(undefined, undefined)` devolvía `"post"` → guardadas en `content_pieces` con `type='post'`. El filtro "Historias" de la UI nunca las encontraba.

La documentación oficial de Zernio (`docs.zernio.com/instagram/list-instagram-stories`) expone un endpoint dedicado completamente diferente: `GET /v1/accounts/{accountId}/instagram/stories`. Devuelve historias activas (ventana 24h de Meta).

**Decisiones de diseño:**

- Multi-estrategia con fallbacks para cubrir posibles gaps de la API. El endpoint dedicado es el principal; los dos fallbacks aseguran que nada se pierda.
- El reordenamiento (historias primero en `allPosts`) es suficiente para corregir el dedup sin cambiar la lógica de deduplicación.
- Los registros existentes en DB con `type='post'` se auto-corrigen al próximo sync (el UPDATE incluye el campo `type`).

**Riesgos / deuda técnica:**

- Stories tienen ventana 24h → solo aparecen mientras están activas. Una vez expiradas, ya están en DB con `type='story'` y quedan como referencia histórica.
- Métricas de stories siguen en 0 (normal, la API de Instagram limita las métricas de stories). `syncContentMetricsForOrg` no las actualizará si Zernio no expone analytics para ese ID.

---


### 2026-08-24 — Fix E2E: clearCookies() en beforeEach para garantizar refresh token virgen

**Rama/branch:** `claude/architecture-review-improvements-fdj4ae`  
**Commit(s):** `0f3adb4`  
**Autor:** Claude  
**Módulo(s) afectado(s):** e2e, holding

**Qué se hizo:**

Reemplazado el mecanismo de detección de sesión en el `beforeEach` de "Holding — navegación dentro de negocio" (`apps/web/e2e/holding.spec.ts`).

Versión anterior (PR #20): detectaba si el token expiró vía `business-switcher` visible. El problema: el access token sigue válido (~1h), por lo que el switcher SÍ aparece — el re-auth se saltea — y `enterBusinessAction` falla al llamar `refreshSession()` con el refresh token rotado.

Nueva versión: `await context.clearCookies()` antes de cada test del grupo de "navegación". Esto:
1. Elimina todas las cookies de sesión Supabase del browser
2. Garantiza que `goto("/auth/login")` llegue al formulario (sin redirect del middleware)
3. El login posterior genera un refresh token virgen (R_fresh) que `enterBusinessAction` puede rotar sin conflictos

También sincronizados archivos E2E desde `main`: `constants.ts`, `auth.setup.ts`, `playwright.config.ts` y `data-testid="business-switcher"` en el componente `HoldingBusinessSwitcher`.

**Por qué / finalidad:**

Tests 6 y 7 ("el agente de negocio es accesible" y "el módulo de clientes carga sin errores") fallaban consistentemente porque el `beforeEach` intentaba reusar la sesión que había sufrido múltiples rotaciones de token durante los tests 3 y 4. La condición de re-auth (business-switcher invisible) nunca se cumplía porque el access token seguía siendo válido.

**Decisiones de diseño relevantes:**

- `clearCookies()` vs. signOut: clearCookies es más determinista y no depende de que el endpoint de signout funcione. No genera peticiones al servidor.
- Se eligió limpiar TODAS las cookies del contexto (no solo Supabase) para evitar estado residual de cualquier integración.

**Riesgos / deuda técnica pendiente:**

- Los tests 5 y 6 ahora pagan el costo de un login adicional en cada beforeEach (~3-5s extra por test). Aceptable para E2E.
- Si Supabase cambia la estructura de cookies, los demás tests (que reusan `holding.json`) también podrían verse afectados.

---

### 2026-08-23 — fix(BUG-3): corrección patrón UTC-midnight en comparaciones de fecha

**Rama/branch:** `feat/trial-retry-variation`  
**Commit(s):** `57f0076`  
**Autor:** Claude  
**Módulo(s) afectado(s):** metrics, manychat

**Qué se hizo:**
Corregidos dos bugs de UTC-midnight identificados en la auditoría [BUG-3]:

- **`lib/metrics/enrich-team-compensation.ts`** — `isInCurrentMonth()`: reemplaza `new Date(iso).getMonth()` por comparación de string `YYYY-MM`. El campo `scheduledAt` viene como timestamp UTC; en zonas UTC-N un timestamp al inicio de un mes (e.g. Aug 1 00:00 UTC) aparece como día anterior del mes anterior en tiempo local → `.getMonth()` devolvía el mes equivocado → comisiones de deals de "principio de mes" no se contabilizaban.

- **`app/manychat/cta-actions.ts`** — `periodBounds()`: agrega `parseDateSafe()` que construye `Date` local explícito para strings date-only (`YYYY-MM-DD`). Si `to` llegaba como `"2026-08-01"`, `new Date("2026-08-01")` parsea UTC midnight → en UTC-3 era July 31 → `end.getMonth()` devolvía 6 → `start` se calculaba como July 1 en vez de Aug 1.

**Por qué / finalidad:**
`new Date("YYYY-MM-DD")` está especificado en ECMAScript como UTC midnight, no como medianoche local. En producción (Vercel en `gru1`, Uruguay/Argentina, UTC-3) esto causaba que el primer día del mes se comparara erróneamente contra el mes anterior.

**Decisiones de diseño:**
- Para timestamps ISO completos (`scheduledAt`): comparar `iso.slice(0, 7)` con `YYYY-MM` local (igual que el patrón ya establecido en `derive-dashboard-data.ts`).
- Para date-only strings en `periodBounds`: construir `new Date(y, m-1, d)` local explícito cuando el string tiene exactamente 10 caracteres (YYYY-MM-DD).

**Riesgos / deuda pendiente:**
TECH-5 (Badge `children` en ~15 archivos de `packages/ui/src/`) sigue pendiente como errores TS pre-existentes.

---

### 2026-08-23 — Refactor: split de action files grandes (agent + marketing)

**Rama/branch:** `claude/architecture-review-improvements-fdj4ae`  
**Commit(s):** `dd7f0a5`  
**Autor:** Claude  
**Módulo(s) afectado(s):** agent, marketing

**Qué se hizo:**

`app/agent/actions.ts` (1665 líneas) dividido en 3 archivos:
- **`app/agent/canvas-actions.ts`** (176 líneas): `exportCanvasAsDocxAction`, `saveCanvasToKnowledgeBaseAction` + helpers privados `extractCanvasTitle`, `chunkCanvasContent`
- **`app/agent/workboard-actions.ts`** (288 líneas): `searchWorkboardTasksAction`, `updateWorkboardTaskAction`, `createWorkboardTasksAction`, `resolveAssigneeId` (privado), tipos exportados `WorkboardTaskInput` y `WorkboardTaskUpdates`
- **`app/agent/actions.ts`** queda en 1252 líneas (solo streaming, knowledge, SOPs y funciones core del agente)

`app/marketing/actions.ts` (963 líneas) dividido en 2 archivos:
- **`app/marketing/utm-actions.ts`** (446 líneas): todo el bloque UTM — `getOrganizationWebsiteAction`, `getUtmBaseUrlAction`, `getUTMLinksAction`, `getUTMLeadsAction`, `getUTMFunnelAction`, `createUTMLinkAction`, `updateUTMLinkAction`, `deleteUTMLinkAction` + helpers privados
- **`app/marketing/actions.ts`** queda en 536 líneas

Importadores actualizados (estáticos y dinámicos):
- `components/agent/canvas-panel.tsx` → importa desde `canvas-actions`
- `components/fathom/fathom-task-proposal-modal.tsx` → importa desde `workboard-actions`
- `lib/agent/agent-tool-handler.ts` → 3 dynamic imports `await import("@/app/agent/actions")` → `workboard-actions`; reemplaza tipo local `WorkboardTaskUpdates` con import
- `components/marketing/utm-table.tsx` → importa desde `utm-actions`
- `components/marketing/utm-generator.tsx` → importa `createUTMLinkAction` desde `utm-actions`
- `app/(platform)/marketing/utms/page.tsx` → split: `listContentAssetsAction` de `actions`, UTM actions de `utm-actions`

**Por qué / finalidad:**
Reducir el tamaño de archivos de acciones grandes para mejorar legibilidad y mantenibilidad. Parte del roadmap de architecture review (P1 — breaking large action files).

**Decisiones de diseño relevantes:**
- Actualización directa de importadores en lugar de barrel re-exports (evita conflictos TypeScript entre `import X from` y `export X from` en el mismo módulo).
- Verificación con `tsc --noEmit` tras cada paso — cero errores nuevos introducidos.
- Los dynamic imports en `agent-tool-handler.ts` también actualizados (no visibles a grep estático).
- `WorkboardTaskUpdates` exportado desde `workboard-actions.ts` y re-importado en `agent/actions.ts` para el handler de `sendAgentMessageAction`.

**Riesgos / deuda técnica pendiente:**
- Sin riesgos conocidos — la separación es limpia y los tipos no generan dependencias circulares.
- `agent/actions.ts` sigue siendo grande (1252 líneas); candidato a futura subdivisión en `knowledge-actions.ts`, `sop-actions.ts` si crece.

---
### 2026-08-23 — Fan-out QStash para crons + tests Playwright E2E

**Rama/branch:** `claude/qstash-fanout-playwright`  
**Commit(s):** `56e5455`, `c5972da`  
**Autor:** Claude  
**Módulo(s) afectado(s):** crons, queue, testing

**Qué se hizo:**

**QStash fan-out para crons pesados:**
- `lib/queue/qstash-client.ts`: función `publishCronFanout(workerUrl, orgIds)` genérica + 4 getters de URL de worker
- 4 nuevos workers en `/api/queue/`:
  - `process-cron-sync-metrics` → llama `syncContentMetricsForOrg`
  - `process-cron-intelligence-snapshot` → llama `generateAndSaveIntelligenceSnapshot`
  - `process-cron-executive-report` → llama `generateAndSaveWeeklyExecutiveReport`
  - `process-cron-founder-tone` → llama `generateAndSaveFounderTone`
- 4 crons refactorizados: si `QSTASH_TOKEN` configurado → fan-out (publica 1 job/org y retorna en ~200ms); si no → fallback secuencial (backward compatible)
- `maxDuration` de crons: 300s → 60s. Workers individuales: 60-120s por org

**Playwright E2E:**
- `@playwright/test` instalado en `apps/web`
- `playwright.config.ts` con setup de auth compartido y Chromium pre-instalado
- `e2e/auth.setup.ts`: login con `E2E_HOLDING_EMAIL` / `E2E_HOLDING_PASSWORD`, guarda sesión en `e2e/.auth/holding.json`
- `e2e/holding.spec.ts`: flujo holding completo — dashboard KPIs, dropdown scrollable, switch de negocio, badge founder, volver al holding, agente y clientes dentro del negocio

**Para correr los tests:**
```bash
# Variables necesarias:
E2E_HOLDING_EMAIL=email@holding.com
E2E_HOLDING_PASSWORD=password
E2E_BASE_URL=https://tu-app.vercel.app  # o http://localhost:3000

# Correr:
cd apps/web
pnpm exec playwright test          # headless
pnpm exec playwright test --ui     # con interfaz visual
pnpm exec playwright test --headed # browser visible
```

**fix:** `hideSourceMaps` eliminado de `withSentryConfig` (no existe en esa versión de `@sentry/nextjs`)

**Por qué / finalidad:**
Con N orgs creciendo, los crons secuenciales van a tocar el límite de 300s de Vercel. El fan-out desacopla la orquestación del procesamiento: el cron termina en segundos, QStash ejecuta los workers en paralelo con retries automáticos.

**Riesgos / deuda técnica pendiente:**
- Los tests E2E requieren `E2E_HOLDING_EMAIL` / `E2E_HOLDING_PASSWORD` con una cuenta holding real — pendiente crearla junto al data setup del beta tester
- `e2e/holding.spec.ts` usa selectores de texto que pueden romperse si cambian los labels; revisar después del data setup
- El fan-out no aplica aún a `executive-report-monthly`, `calendly-sync`, `mercadopago-token-refresh` — son menos costosos, pueden esperar

---

### 2026-08-23 — Preparación beta holding: Sentry, RPC dashboard y dropdown fix

**Rama/branch:** `claude/architecture-review-improvements-fdj4ae`  
**Commit(s):** `704b566` — feat(sentry), `8bbcf8f` — perf(holding): RPC, `dbd1674` — fix(holding): dropdown  
**Autor:** Claude  
**Módulo(s) afectado(s):** holding, monitoring, infra

**Qué se hizo:**

1. **Sentry integration** (`704b566`):
   - Creados `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
   - `next.config.ts` envuelto con `withSentryConfig` (source maps y logger opcionales vía env vars)
   - `lib/holding/refresh-auth-session.ts`: `Sentry.captureException` cuando el refresh del JWT falla (path crítico del holding switch)
   - `app/api/agent/send/route.ts`: `Sentry.captureException` con `organizationId` y `conversationId` en errores de streaming
   - Filtra cookies de auth antes de enviar eventos; no envía errores de rate limit (ruido)

2. **RPC `get_holding_dashboard_stats`** (`8bbcf8f`):
   - Nueva migración `supabase/migrations/20260823023309_holding_dashboard_stats_rpc.sql`
   - Función STABLE + SECURITY DEFINER que agrega MRR, conversaciones activas, closing calls y `has_founder` en una sola query con CTEs
   - `getHoldingDashboardAction` refactorizada: `Promise.all` con `getHoldingBusinesses` + RPC → de 28 llamadas a 2 paralelas
   - Fallback silencioso a métricas en cero si la RPC no existe aún (migración no aplicada)

3. **Dropdown scrollable** (`dbd1674`):
   - `HoldingBusinessSwitcher`: `DropdownMenuContent` ahora tiene `max-h-[280px] overflow-y-auto`
   - Necesario para el beta tester con 7 negocios (sin scroll el dropdown quedaba fuera de pantalla)

**Por qué / finalidad:**
Beta tester con holding de 7 negocios entra en 2 días. Estos cambios preparan el módulo holding para soportar múltiples negocios sin degradación de performance ni UX rota.

**Decisiones de diseño relevantes:**
- RPC con CTEs en lugar de N queries en JS: más eficiente, una sola round-trip a Postgres
- SECURITY DEFINER para evitar que la anonkey falle en la lectura de `profiles` (protegida por RLS)
- `REVOKE ... FROM public; GRANT ... TO authenticated`: seguridad mínima, solo users autenticados
- Sentry `sampleRate: 1.0, tracesSampleRate: 0.05` en servidor: capturar todos los errores, 5% de trazas (lambdas son muchas)
- `beforeSend`: eliminar cookies de auth antes de enviar a Sentry (privacidad)

**Riesgos / deuda técnica pendiente:**
- **La migración SQL debe aplicarse manualmente en Supabase Dashboard antes del beta** (o con `supabase db push`)
- Sentry requiere `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` en Vercel para activarse en producción
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` son opcionales pero necesarios para subir source maps
- TECH-5 (Badge `children` en React 19): sigue pendiente — ~15 archivos con error pre-existente, Vercel lo ignora por caché Turbo

---

### 2026-08-11 — Eliminar wizard de onboarding de founder

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `acb2499` — feat(onboarding): eliminar wizard de onboarding de founder  
**Autor:** Claude  
**Módulo(s) afectado(s):** onboarding, auth, platform-data-provider, middleware, routes

**Qué se hizo:**
- Eliminados 12 archivos: `app/onboarding/{page,layout,actions}.ts`, `components/onboarding/{onboarding-wizard,option-card,other-text-field}.tsx`, `components/platform/onboarding-guard.tsx`, `lib/onboarding/{steps,onboarding-storage,onboarding-status,resolve-onboarding-path}.ts`, `types/onboarding.ts`.
- `app/auth/actions.ts`: eliminado el check `!status.completed → redirect(status.onboardingPath)` de `postAuthRedirect`. Login redirige siempre a dashboard o holding.
- `providers/platform-data-provider.tsx`: eliminados `onboardingComplete`, `onboardingData`, `refreshOnboarding` del contexto y sus estados.
- `lib/supabase/middleware.ts`: eliminado el bloque que redirigía super admins desde `/onboarding`.
- `components/auth/login-screen.tsx`: eliminado el redirect condicional al wizard en modo demo.
- `routes/paths.ts`: eliminado `paths.auth.onboarding`.
- `components/holding/holding-onboarding-wizard.tsx`: eliminada dependencia de `fetchOnboardingStatus`; el efecto de inicialización ahora solo llama a `getHoldingOnboardingStateAction()`.
- El onboarding de holding (`/onboarding/holding`) se mantiene intacto.
- `lib/onboarding/welcome-storage.ts` se mantiene (usado por `WelcomeGate`).

**Por qué / finalidad:**
El wizard de onboarding de founder en `/onboarding` fue eliminado por decisión de producto. Los usuarios ahora entran directo al dashboard después del login sin pasar por el wizard.

**Decisiones de diseño relevantes:**
- Se mantuvo `welcome-storage.ts` para no romper `WelcomeGate`; la animación de bienvenida simplemente nunca se activa ya que `markWelcomePending()` era llamada solo por el wizard.
- El onboarding de holding se preserva íntegro — es un flujo diferente para configurar negocios del portfolio.
- TypeScript limpio (0 errores) verificado antes del push.

**Riesgos / deuda técnica pendiente:**
- Los datos en tabla `onboarding_responses` de orgs founder quedan sin uso por la plataforma. La tabla puede eliminarse en una migración futura si se confirma que no hay otros consumidores.
- `WelcomeGate` y `welcome-storage.ts` son dead code efectivo — se pueden eliminar en una limpieza futura.

---


### 2026-08-11 — TECH-1: Fathom deep analysis vía QStash + TECH-2: retención real YouTube Analytics

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude  
**Módulo(s) afectado(s):** fathom, marketing (YouTube), queue

**Qué se hizo:**

**TECH-1 — Fathom async con QStash:**
- `lib/queue/qstash-client.ts`: agrega `FathomAnalysisJobPayload`, `getFathomAnalysisQueueUrl()` y `publishFathomAnalysisJob()`.
- `app/api/queue/process-fathom-analysis/route.ts`: nuevo endpoint worker con `maxDuration=300`, validación Zod, auth via `verifyQueueRequest`, y retorno 500 para que QStash reintente (hasta 2 veces).
- `lib/fathom/process-call.ts`: reemplaza `void generateDeepCallAnalysis(...)` por `await publishFathomAnalysisJob(...)` + fallback inline si QStash no está configurado.

**TECH-2 — Retención real YouTube Analytics:**
- `lib/youtube/analytics.ts`: nuevo archivo con `getRetentionAtCTA(organizationId, videoId, ctaSecond, durationSeconds)`. Lee token de `youtube_integrations`, verifica scope `yt-analytics.readonly`, refresca si hace falta, llama a YouTube Analytics API v2 (`elapsedVideoTimeRatio` / `audienceWatchRatio`), interpola el punto más cercano al segundo del CTA. Fallback gracioso a `estimateRetentionAtCTA` en cualquier error.
- `app/marketing/actions.ts`: `updateCTAMinuteAction` ahora selecciona `external_id` del asset y llama `getRetentionAtCTA` en lugar de `estimateRetentionAtCTA`. Usa el video ID real de YouTube para obtener la curva de retención real.

**SEED cleanup:**
- Ejecutados los DELETE en Supabase (prod) para la org `46cce98c-6d4c-4e4d-94a7-7cc24ae1104d`: 171 registros ficticios eliminados de `call_analyses`, `client_payments`, `closing_calls`, `conversations`, `content_pieces` y `clients`.

**Por qué / finalidad:**

TECH-1: `void asyncFn()` en Vercel es un anti-patrón — el proceso Node.js muere cuando la función serverless retorna, por lo que el análisis profundo de Fathom se perdía silenciosamente en producción. QStash garantiza ejecución con reintentos en un endpoint dedicado con `maxDuration=300`.

TECH-2: `estimateRetentionAtCTA` era un modelo sintético (curva exponencial). Con `yt-analytics.readonly` (ya en `GOOGLE_UNIFIED_SCOPES`) se obtiene la curva real del video para calcular cuántos espectadores quedan en el segundo del CTA.

**Decisiones de diseño relevantes:**
- QStash como transporte, no BullMQ — ya estaba instalado y configurado en la plataforma.
- Fallback inline si `QSTASH_TOKEN` no está seteado — cero regresión en entornos sin QStash.
- `getRetentionAtCTA` es async y silenciosa — si no hay token o la API falla, devuelve la estimación; no hay error visible para el usuario.
- Los componentes cliente (`content-platform-metrics.tsx`) siguen usando `estimateRetentionAtCTA` como display fallback, lo cual es correcto: el valor real ya viene persistido en `retention_at_cta_pct` desde el Server Action.

**Riesgos / deuda técnica pendiente:**
- Tokens de YouTube existentes sin scope `yt-analytics.readonly` seguirán usando estimación hasta que el usuario reconecte YouTube. Sin impacto en UX, solo en precisión.
- `TRIAL-1` (reintentar variante fallida) sigue pendiente.

---

### 2026-08-11 — chore: migraciones DB para FEAT-1 y FEAT-2 (solo DB, sin UI)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude  
**Módulo(s) afectado(s):** supabase/migrations

**Qué se hizo:**
- Migración `20260811140000`: tablas `story_sequences` y `story_frames` con RLS (FEAT-1 Secuencias de historias)
- Migración `20260811150000`: tablas `competitors` y `competitor_posts` con RLS (FEAT-2 Análisis de competidores)
- Ambas migraciones aplicadas en producción. Sin UI todavía — Santiago implementará cuando lo indique.

---

### 2026-08-11 — feat: add-ons por org, música Trial Reels, regenerar captions, sync stories

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `7e55341`  
**Autor:** Claude  
**Módulo(s) afectado(s):** super-admin, marketing/trial-reels, navigation/sidebar, lib/zernio, permissions

**Qué se hizo:**

**1. [TECH-3] Mecanismo de add-ons por org (sidebar dinámico):**
- `supabase/migrations/20260811130000_enabled_add_ons.sql`: columna `enabled_add_ons TEXT[] NOT NULL DEFAULT '{}'` en `organizations`.
- `lib/auth/get-current-permissions.ts`: tipos `ADD_ON_IDS` y `AddOnId`; `UserPermissions` extendido con `enabledAddOns: AddOnId[]`; lectura desde DB en `getCurrentUserPermissions`.
- `providers/permissions-provider.tsx`: hooks `useEnabledAddOns()` y `useHasAddOn(addOnId)`.
- `lib/navigation/sidebar-modules.ts`: `buildPlatformRootItems(enabledAddOns)` inyecta `operaciones` y `producto` después de `finanzas` si están activos; `buildPlatformSidebarNav()` para componentes que tienen los add-ons.
- `components/navigation/sidebar-navigation.tsx` y `components/layout/mobile-nav.tsx`: usan `buildPlatformSidebarNav(enabledAddOns)`.
- `layouts/super-admin-layout.tsx`: `SUPER_ADMIN_PERMISSIONS` incluye `enabledAddOns: []`.
- `types/super-admin.ts`: `AdminOrganizationDetail` tiene campo `enabledAddOns: string[]`.
- `lib/super-admin/queries.ts`: `loadOrganizationDetail` fetchea `enabled_add_ons` de la org.
- `app/super-admin/actions.ts`: `updateOrgAddOnsAction(orgId, addOns[])` valida contra `ADD_ON_IDS` y guarda.
- `components/super-admin/organization-detail.tsx`: sección "Módulos add-on" con botones toggle por add-on; llama `updateOrgAddOnsAction` on click.

**2. [TRIAL-3] Música personalizable por org en Trial Reels:**
- `supabase/migrations/20260811120000_reel_music_path.sql`: columna `reel_music_path TEXT` en `organizations`.
- `apps/reel-worker/src/types.ts`: `reelMusicPath?: string | null` en `ReelVariationJobPayload`; 5° parámetro `customMusicPath` en `VariantSpec.buildFfmpegArgs`.
- `apps/reel-worker/src/ffmpeg-variants.ts`: variante `music` usa `customMusicPath ?? lutsDir/background-music.mp3`.
- `apps/reel-worker/src/processor.ts`: descarga `reel_music_path` de Storage antes del loop de variantes.
- `app/marketing/content/reel-variation-actions.ts`: lee `reel_music_path` de la org y lo incluye en payload QStash.
- `app/marketing/content/reel-music-actions.ts` (nuevo): `uploadReelMusicAction`, `deleteReelMusicAction`, `getReelMusicPathAction`.
- `components/marketing/trial-reels/reel-music-upload.tsx` (nuevo): UI de upload/delete con accept MP3/M4A/WAV, muestra filename actual.
- `app/(platform)/integrations/page.tsx`: sección "Trial Reels" con `<ReelMusicUpload>`.

**3. [TRIAL-2] Regenerar captions con IA por variante:**
- `components/marketing/trial-reels/variation-card.tsx`: botón "Generar con IA" con estado `generating`, llama `regenerateCaptionAction`, actualiza estado local y propaga via `onUpdate`.

**4. [BUG-1] Sync de stories de Instagram:**
- `lib/zernio/client.ts`: `listPublishedPosts` acepta `type?: string`; nuevo método `syncExternalStories(accountId)` con fallback gracioso para 404/405/400.
- `app/marketing/content/sync-actions.ts`: paso 3 en `fetchExternalPostsViaSync` lanza `syncExternalStories` + `listPublishedPosts({type: "story"})` en paralelo por cada accountId; combina y deduplica.

**Por qué / finalidad:**

- **Add-ons**: permite a Santiago activar módulos premium (Operaciones, Producto, etc.) por cliente desde super-admin sin tocar código — negocio de módulos add-on listo para operar.
- **Música Trial Reels**: cada org puede personalizar el track de fondo de sus reels (variante music) subiendo su propio archivo desde `/integrations`.
- **Regenerar captions**: founder puede hacer varios intentos de IA para el caption/hashtags sin regenerar el video.
- **Stories**: intento de traer historias de Instagram al módulo de marketing, que históricamente solo traía posts.

**Decisiones de diseño relevantes:**

- **Add-ons como TEXT[]**: simple, sin tabla extra ni JSON, con validación en server action. Extensible.
- **Toggle inmediato en super-admin**: click → llamada server action → optimistic update en estado local → revalidate. Sin modal de confirmación para velocidad.
- **Stories dual-strategy**: llamar dos endpoints independientes de Zernio (sync dedicado + listPublishedPosts con type) aumenta probabilidad de éxito sin depender de un solo endpoint desconocido.
- **Música en Storage → path en DB**: el worker descarga el archivo antes de FFmpeg, sin transmitir binarios entre servicios.

**Riesgos / deuda técnica pendiente:**

- Stories: si Zernio no expone stories en ninguno de los dos endpoints, seguirán siendo 0. Requiere verificación en producción con una historia real publicada.
- Add-ons: los cambios de add-ons requieren re-login del usuario (sesión cacheada en `PermissionsProvider`). Agregar revalidación automática sería ideal pero no es bloqueante.
- TRIAL-4: los assets reales de LUT (`warm.cube`) y música (`background-music.mp3`) siguen sin estar en el repo del worker — Santiago debe conseguirlos.

---

### 2026-08-11 — feat: upload real de video a Zernio, email de notificación y cron de limpieza

**Rama/branch:** `feat/trial-reels-video-upload`  
**Commit(s):** `84010ef` — feat(trial-reels): upload real del video a Zernio antes de publicar; `b6b674b` — feat(trial-reels): email de notificación + cron de limpieza de Storage  
**Autor:** Claude  
**Módulo(s) afectado(s):** api/queue/publish-reel-variation, lib/zernio, lib/email, api/cron/cleanup-trial-reels, vercel.json

**Qué se hizo:**

**1. Upload real de video a Zernio (bug crítico resuelto):**
- `lib/zernio/client.ts`: agregados tipos `ZernioMediaPresignResponse` y `ZernioMediaItem`; nuevo método `getMediaPresignedUrl(filename, contentType)` que llama `POST /v1/media/presign`; `createPost()` acepta `mediaItems?: ZernioMediaItem[]` en el payload.
- `api/queue/publish-reel-variation/route.ts`: helper `uploadVideoToZernio()` implementa el flujo completo: obtener presigned URL de Zernio → descargar video de Supabase Storage (URL firmada TTL 2h) → `PUT` video buffer a Zernio → retornar `fileUrl` permanente. `createPost()` ahora incluye `mediaItems: [{ type: "video", url: videoFileUrl }]`. `maxDuration` subido de 30 → 60s.

**2. Email de notificación al admin de la org:**
- `lib/email/trial-reels-email.ts` (nuevo): template HTML con header púrpura OTC, cajas de stats verde/rojo, CTA button. Versión texto plano.
- `lib/email.ts`: `sendTrialReelsDoneEmail()` usando Resend con subject dinámico ("N Trial Reels publicados" o "N publicados, M con error").
- En `publish-reel-variation/route.ts`: cuando `allDone === true`, llama `notifyOrgAdminDone()` best-effort (fire-and-forget, nunca bloquea la respuesta).

**3. Cron de limpieza de Storage:**
- `api/cron/cleanup-trial-reels/route.ts` (nuevo): busca jobs con `status in ('done', 'failed')` y `updated_at < 30 días atrás`; elimina archivos del bucket `trial-reels` vía `admin.storage.from('trial-reels').remove(paths)`; loggea archivos eliminados y errores; idempotente.
- `vercel.json`: entrada del nuevo cron a las 03:00 UTC diariamente.

**Por qué / finalidad:**

El bug principal del feature era que `createPost` en Zernio no tenía el campo `mediaItems` — los reels se creaban en Zernio como borradores vacíos sin video adjunto. La investigación de la API de Zernio (vía repos GitHub de zernio-dev) reveló el flujo de 2 pasos: presign URL → upload binario → usar fileUrl permanente en mediaItems.

El email de notificación cierra el loop para el founder: sabe cuándo terminaron de publicar sus reels sin tener que abrir OTC manualmente. La limpieza de Storage evita acumulación de videos en el bucket trial-reels (cada job puede pesar ~50-200 MB) con retención de 30 días.

**Decisiones de diseño relevantes:**

- **Bufferar video en memoria**: `videoRes.arrayBuffer()` en el worker de Vercel — más simple y compatible con Vercel Edge/Node. Alternativa (streaming) más eficiente pero compleja y con menor compatibilidad.
- **Presigned URL TTL 2h**: el proceso completo (descarga Supabase + upload Zernio) puede tardar hasta 60s; 2h es holgado y cubre reintentos de QStash.
- **notifyOrgAdminDone best-effort**: `void fn().catch(log)` — un fallo de email nunca debe romper la respuesta del endpoint.
- **30 días de retención en Storage**: balance entre debugging (poder ver videos de jobs fallidos) y costo de Storage. Configurable via constante `RETENTION_DAYS`.

**Riesgos / deuda técnica pendiente:**

- Música personalizable por org (upload a Storage, worker descarga) pendiente.
- Re-intentar variante fallida individualmente (sin recrear el job) pendiente.
- Re-generar captions/hashtags con IA por variante pendiente.
- El cron de limpieza no limpia la carpeta raíz si quedó vacía — Supabase Storage no tiene `rmdir` automático, pero no genera costo ni error.

---

### 2026-08-11 — feat: delay real entre publicaciones de Trial Reels con QStash

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `a53ce78` — feat(trial-reels): delay real entre publicaciones con QStash  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/trial-reels, api/queue, lib/queue

**Qué se hizo:**

- `publishVariationsAction` refactorizado: en lugar de publicar sincrónicamente con `setTimeout` falso (máx 30s), ahora encola cada variante incluida en QStash con `delay = posición * delay_hours * 3600` segundos. Retorna inmediatamente con `{ ok: true, scheduled: N }`.
- Nuevo endpoint `POST /api/queue/publish-reel-variation/route.ts`: recibe `{ jobId, variationIndex, organizationId }`, verifica auth (WORKER_AUTH_SECRET triple-auth o firma QStash), genera URL firmada del video en Supabase Storage (TTL 1h), publica en Zernio como draft, actualiza la variante en DB (→ `published` o `failed`). Marca el job como `"done"` cuando todas las variantes incluidas terminan.
- Nuevo estado `"scheduled"` en `ReelVariationStatus`: las variantes pasan a este estado cuando quedan encoladas, antes de que QStash las dispare.
- `variation-card.tsx`: badge "Programada" (azul) para variantes en estado `scheduled`, con ícono `Clock`. También permite expandir preview de video en estado `scheduled`.
- `trial-reels-panel.tsx`: toast de confirmación actualizado al nuevo return type; `includedCount` ahora cuenta también variantes `scheduled`.
- `lib/queue/verify-queue-request.ts` (nuevo): helper de auth para endpoints de cola, triple-método consistente con el worker de Fly.io.
- `lib/queue/qstash-client.ts`: helper `getReelVariationPublishUrl()`.

**Por qué / finalidad:**

El delay entre publicaciones era un `setTimeout(r, Math.min(delayMs, 30_000))` dentro de un Server Action — nunca podría respetar delays de horas sin que Vercel (30s máx en funciones serverless) cortara la conexión. Con QStash se encolan N mensajes independientes, cada uno con su `delay` en segundos; QStash los re-entrega al endpoint correcto en el momento exacto, sin mantener ninguna conexión abierta.

**Decisiones de diseño relevantes:**

- **Posición vs. índice para el delay**: el delay se calcula en base a la posición entre las variantes *incluidas* (no el índice absoluto). La primera incluida siempre se publica inmediatamente (delay=0), la segunda con delay_hours de lag, etc. Esto evita gaps si el usuario excluyó variantes intermedias.
- **Idempotencia en el endpoint**: el endpoint verifica `variation.status !== "scheduled"` antes de procesar; si QStash reintenta (retries=2) y la variante ya fue procesada, responde 200 sin duplicar.
- **Return 200 siempre en el endpoint**: aunque la publicación falle, se responde 200 para que QStash no reintente infinitamente (el error se persiste en `variation.error`).
- **Sin Zernio → falla temprana**: si Zernio no está conectado, `publishVariationsAction` NO falla (sí lo haría el endpoint de publicación individual). Se optó por dejar que falle el endpoint individual para no bloquear el flujo de scheduling.

**Riesgos / deuda técnica pendiente:**

- El endpoint de publicación no adjunta el video binario a Zernio — solo envía el caption. Para que Zernio suba el video a Instagram, hace falta que la API de Zernio soporte una URL de media en el payload `createPost`. Verificar con la documentación de Zernio si el campo `mediaUrl` existe.
- Las URLs firmadas de Supabase Storage (generadas en el endpoint) tienen TTL de 1h — si el delay configurado supera 1h, la URL expirará antes de que Zernio la procese. Solución futura: generar la URL firmada en el momento de publicar (ya está implementado así — el endpoint genera la URL en el momento en que QStash lo dispara, no antes).
- Música personalizable por org (upload a Storage, worker descarga) pendiente.
- Notificación al founder cuando todas las variantes terminaron pendiente.
- Limpieza automática de Storage (trial-reels bucket) pendiente.

---

### 2026-08-10 — Fix: reel-worker crasheaba en Node.js 20 por falta de soporte nativo de WebSocket

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `257d5a1` — fix(reel-worker): Node.js 22 para soporte nativo de WebSocket  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (Dockerfile, package.json)

**Qué se hizo:**

- `apps/reel-worker/Dockerfile`: Cambiado `FROM node:20-slim` → `FROM node:22-slim` en ambas etapas (builder y runner).
- `apps/reel-worker/package.json`: Actualizado `"engines": { "node": ">=20" }` → `"engines": { "node": ">=22" }`.

**Por qué / finalidad:**

Los jobs seguían en estado `"pending"` incluso después del fix de autenticación triple. Fly.io logs revelaron el crash real al procesar el primer job:

```
error: 'Node.js 20 detected without native WebSocket support.
Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })'
```

`@supabase/supabase-js` v2.45 require WebSocket nativo (disponible en Node.js 22+) o instalar el paquete `ws` manualmente. Al llamar `createClient()` en `processor.ts`, la librería de Supabase Realtime intentaba inicializar una conexión WebSocket y crasheaba inmediatamente sin marcar el job como "failed" en DB. El job quedaba en `"pending"` para siempre.

**Decisiones de diseño relevantes:**

- Alternativa 1: agregar `ws` como dependencia y pasarla via `transport` en el `createClient()`. Más invasivo, requiere cambios en processor.ts.
- Alternativa 2: subir a Node.js 22 (WebSocket nativo desde v21.6+). Sin cambios de código, Docker multi-stage lo soporta bien. ✓ Elegida.
- Node.js 22 es LTS desde octubre 2024 — cambio sin riesgo de compatibilidad.

**Riesgos / deuda técnica pendiente:**

- Requirió que el usuario hiciera `git pull` antes de `fly deploy` — el primer intento de deploy usó el Dockerfile local con node:20 (ya que la imagen cacheada en Docker no había cambiado). El segundo intento (con `git pull` previo) compiló node:22 correctamente.
- Si en el futuro se actualiza `@supabase/supabase-js` a v3+, verificar si siguen usando WebSocket nativo o si cambian el modelo de transporte.

---

### 2026-08-10 — Fix: autenticación del worker con triple redundancia (X-Worker-Secret + Bearer + query param)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `a6a513d` — fix(trial-reels): auth robusta con X-Worker-Secret header y query param  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts), apps/web (reel-variation-actions.ts)

**Qué se hizo:**

- `apps/reel-worker/src/index.ts`: `verifySignature()` ahora intenta autenticación en este orden:
  1. **X-Worker-Secret** header (custom, nunca stripeado por proxies ni QStash)
  2. **Authorization: Bearer `<secret>`** header (método original)
  3. **`?workerSecret=<secret>`** URL query param (fallback absoluto — QStash nunca modifica query params)
  - Si ninguno coincide, log de diagnóstico mostrando cuántos chars llegaron vs esperados para detectar mismatches.
- `apps/web/app/marketing/content/reel-variation-actions.ts`: `createTrialReelsJobAction` ahora:
  - Agrega `workerSecret` en la URL como query param (`?workerSecret=<secret>`)
  - Pasa ambos headers `X-Worker-Secret` y `Authorization: Bearer` en el `publishJSON()` de QStash

**Por qué / finalidad:**

Después de confirmar que QStash entregaba el job al worker (imageId en response), los jobs seguían en `"pending"`. La hipótesis era que QStash stripeaba el header `Authorization` en tránsito (comportamiento documentado en algunos proxies). La solución: enviar el secret por tres canales distintos para máxima robustez, sin depender de que ninguno en particular llegue intacto.

**Decisiones de diseño relevantes:**

- QStash garantiza que los query params de la URL destino llegan intactos al endpoint — los headers son más propensos a ser modificados/stripeados.
- El log de diagnóstico (`got N chars, expected M`) permite detectar mismatches de WORKER_AUTH_SECRET entre Fly.io y Vercel sin exponer el secret completo en logs.
- La verificación se hace en el orden más-a-menos confiable: header custom → header estándar → query param.

**Riesgos / deuda técnica pendiente:**

- El query param expone el secret en logs de Fly.io y QStash si están habilitados. Para uso en producción de alta seguridad, idealmente usar solo el header X-Worker-Secret. Por ahora el triple-método es adecuado para el contexto.
- Si en el futuro se cambia WORKER_AUTH_SECRET, hay que actualizarlo en dos lugares: Fly.io secrets Y Vercel env vars (y hacer redeploy de ambos).

---

### 2026-08-10 — Fix: Trial Reels quedaba en "pending" por 401 del worker (signing keys QStash incorrectas)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `9726810` — fix(trial-reels): WORKER_AUTH_SECRET para evitar 401 por signing keys de QStash  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts), apps/web (reel-variation-actions.ts, [id]/page.tsx)

**Qué se hizo:**

- `apps/reel-worker/src/index.ts`: La función `verifySignature()` ahora verifica primero un `Authorization: Bearer <WORKER_AUTH_SECRET>` header. Si `WORKER_AUTH_SECRET` está configurado y el header coincide → acepta. Si no coincide → rechaza sin continuar a QStash signing. Si `WORKER_AUTH_SECRET` no está configurado → cae al flujo previo de QStash signing.
- `apps/web/app/marketing/content/reel-variation-actions.ts`: `createTrialReelsJobAction` pasa `Authorization: Bearer <WORKER_AUTH_SECRET>` como header custom en el `client.publishJSON()` de QStash (QStash reenvía el header al worker). También agrega log del `hasWorkerAuthSecret` para diagnóstico.
- `apps/web/app/(platform)/marketing/content/[id]/page.tsx`: Agrega `export const maxDuration = 300` para que la Server Action no sea cortada por el timeout de Vercel mientras descarga el video de Drive o sube a Supabase (archivos grandes pueden tardar >10s).
- Startup log del worker ahora muestra explícitamente si `WORKER_AUTH_SECRET` está configurado.

**Por qué / finalidad:**

Después del fix de procesamiento sincrónico (commit `7996341`), los jobs SEGUÍAN quedando en `"pending"` indefinidamente. El diagnóstico:
- QStash entregaba el job al worker (`https://otc-reel-worker.fly.dev/`)
- El worker verificaba la firma usando `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` — estos secrets estaban configurados en Fly.io pero probablemente con valores incorrectos o desincronizados respecto a lo que QStash usa para firmar
- El worker respondía `401 Unauthorized`
- QStash reintentaba 2 veces (retries: 2), fallaba los 3 intentos, abandonaba la entrega
- Job quedaba para siempre en `"pending"` (QStash no tiene mecanismo para marcar el job como fallido en la DB nuestra)

**Decisiones de diseño relevantes:**

- Usar `WORKER_AUTH_SECRET` como token Bearer en lugar de depender de las signing keys de QStash, que son más complejas de sincronizar y verificar (JWT con timestamp, URL, etc.). El Bearer token es más simple, más predecible y más fácil de debuggear.
- Si `WORKER_AUTH_SECRET` está seteado y el header NO coincide, rechazar inmediatamente sin caer al QStash signing. Esto previene bypass accidental por token desconfigurado.
- QStash soporta pasar headers custom en `publishJSON({ headers: {...} })` — los reenvía intactos al endpoint destino.

**Riesgos / deuda técnica pendiente:**

- **El usuario debe configurar `WORKER_AUTH_SECRET` como secret en Fly.io Y como env var en Vercel.** Sin esto, la autenticación del worker cae al flujo QStash signing previo (que sigue sin funcionar si las keys están mal).
- Pasos necesarios:
  1. Generar un string aleatorio: `openssl rand -base64 32`
  2. Configurar en Fly.io: `fly secrets set WORKER_AUTH_SECRET=<valor> --app otc-reel-worker`
  3. Configurar en Vercel: env var `WORKER_AUTH_SECRET=<mismo valor>` → redeploy
  4. Redeploy Fly.io: `fly deploy --config apps/reel-worker/fly.toml`

---

### 2026-08-10 — Fix: reel-worker procesaba en background, Fly.io mataba la máquina antes de que FFmpeg corriera

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `7996341` — fix(reel-worker): procesar sincrónicamente para evitar que Fly.io mate la máquina  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts, processor.ts)

**Qué se hizo:**

- `index.ts`: El endpoint POST del worker ahora procesa el job **sincrónicamente** (await `processReelVariationJob(payload)` antes de llamar `res.json()`). La conexión HTTP queda abierta mientras corre FFmpeg; Fly.io no puede apagar la máquina mientras haya una conexión activa.
- `processor.ts`: Agregado check de **idempotencia** al inicio de `processReelVariationJob`: si el job ya está en un estado distinto de `"pending"`, se hace return inmediato. Previene reprocesamiento si QStash reintenta una entrega mientras el worker ya está ejecutando.
- Respuesta en error: si `processReelVariationJob` lanza, se responde `200 { ok: false, status: "failed" }` en lugar de `500`, para que QStash no reintente (el processor ya marcó el job como "failed" en DB).

**Por qué / finalidad:**

El job `df1405b3` quedó en estado `"pending"` indefinidamente sin que el worker lo procesara. Diagnóstico:
- Con `auto_stop_machines = true` y `min_machines_running = 0` en fly.toml, Fly.io detiene la máquina cuando no hay conexiones HTTP activas.
- El patrón anterior era: responder `200 OK` inmediatamente → luego procesar en `setImmediate()`.
- Al cerrar la conexión HTTP (200 enviado), Fly.io consideraba la máquina idle y la apagaba antes de que `processReelVariationJob` actualizara la DB a `"processing"` y mucho antes de que FFmpeg terminara.
- El job quedaba en `"pending"` para siempre porque QStash ya no reintentaba (consideraba la entrega exitosa al recibir 200).

**Decisiones de diseño relevantes:**

- Alternativas consideradas: (a) `min_machines_running = 1` (costo constante), (b) aumentar `stop_timeout` en fly.toml (no resuelve trabajo de minutos), (c) procesar sincrónicamente ✓ (aprovecha `timeout: 900` ya configurado en QStash).
- El `timeout: 900` en QStash publishJSON permite que la conexión esté abierta hasta 15 minutos, más que suficiente para FFmpeg (estimado 2-5 min para 5 variantes de un video de reel).

**Riesgos / deuda técnica pendiente:**

- El job `df1405b3` quedó en estado `"pending"` y no puede rerecuperarse automáticamente (QStash ya no va a reintentarlo). El usuario debe crear un nuevo job desde la UI para ese reel.
- Si FFmpeg tarda más de 15 minutos (videos muy largos), QStash timeout-eará la request y reintentará. El check de idempotencia evita doble procesamiento si esto ocurre.
- La respuesta 200 con `{ ok: false }` en caso de error es no convencional; se podría cambiar a usar QStash's "callback URL" para notificaciones de fallo sin depender del HTTP response code.

---

### 2026-08-10 — Fix: errores de TypeScript/ESLint en archivos de Trial Reels para pasar build de Vercel

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `8413c0a` — fix(trial-reels): escapar comillas en JSX para ESLint  
  `939d5c9` — fix(trial-reels): corregir errores de TypeScript en archivos nuevos  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/trial-reels, packages/ui, api/queue

**Qué se hizo:**

Cuatro errores bloqueaban el build de Vercel en los archivos de Trial Reels introducidos en el commit anterior:

1. **ESLint `react/no-unescaped-entities`** (`trial-reels-panel.tsx` línea 234): Las comillas dobles en JSX literal (`"Crear Trial Reels"`) no están permitidas. Fix: `&ldquo;…&rdquo;`.

2. **TypeScript `Type 'string' is not assignable to type 'null'`** (`processor.ts` línea 134): `initialVariations` era inferido como `{ error: null }[]` en vez de `ReelVariation[]`, por lo que asignar `error: msg` (string) fallaba. Fix: agregar anotación explícita `const initialVariations: ReelVariation[]` y tipar `VariantDef.type` como `ReelVariationType`.

3. **TypeScript `Property 'marketing' does not exist on type`** (`reel-variation-actions.ts` líneas 204 y 462): Se usaba `paths.marketing.content` (inexistente en nivel raíz) en vez de `paths.platform.marketing.content`.

4. **TypeScript implicit `any`** (`variation-card.tsx` líneas 213, 225): `onChange` handlers sin tipo. Fix: `React.ChangeEvent<HTMLTextAreaElement>`.

5. **Badge `children` en React 19** (`badge.tsx`): `React.HTMLAttributes` ya no incluye `children` en React 19. Fix: declarar `children?: React.ReactNode` explícitamente en `BadgeProps`.

**Por qué / finalidad:**
Cada commit a la rama dispara un preview deployment en Vercel. Los errores en archivos nuevos (no cacheados por Turbo) fallaban el build impidiendo testear el feature completo en producción.

**Decisiones de diseño relevantes:**
- Los errores de Badge `children` son pre-existentes en muchos archivos del proyecto que ya pasan el build (se sirven desde la caché de Turbo). Solo los archivos nuevos (sin caché) se ven afectados.
- La anotación `ReelVariation[]` en `processor.ts` es la solución mínima — no restructurar la función.

**Riesgos / deuda técnica pendiente:**
- El warning de Badge `children` es cosmético en tsc local pero no falla Vercel — hay ~15 archivos pre-existentes con el mismo error que Vercel ignora por caché de Turbo. A largo plazo, migrar todos los usos.
- El fix de Badge en `packages/ui` es una mejora general pero la raíz del problema es que React 19 eliminó `children` de `HTMLAttributes` — todos los componentes con `extends React.HTMLAttributes` de la UI deben revisarse.

---

### 2026-08-10 — Feature: Trial Reels — generación automática de 5 variaciones de reels

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `1ad489d` — feat(marketing): Trial Reels — generación automática de 5 variaciones de reels  
  `b137a0f` — fix(reel-worker): crear carpeta luts vacía para Docker build  
  `2191cf5` — fix(reel-worker): escuchar en 0.0.0.0 para compatibilidad con Fly.io  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/content, reel-worker (nuevo servicio), supabase/migrations, types, components

**Qué se hizo:**

Feature completa de Trial Reels: el usuario selecciona un reel de `content_pieces` (que tenga un `drive_file_id` vinculado), OTC descarga el video desde Google Drive, lo sube a Supabase Storage y encola un job en QStash. Un worker en Fly.io procesa el video con FFmpeg generando 5 variantes automáticamente. El usuario puede previsualizar cada variante, editar el caption y hashtags, incluir/excluir variantes, y publicarlas en Zernio con delay configurable entre posts.

**Archivos creados:**
- `supabase/migrations/20260810120000_trial_reels_jobs.sql` — Tabla `reel_variation_jobs` + bucket `trial-reels` + RLS + índices + trigger
- `apps/web/types/reel-variations.ts` — Tipos TypeScript para el módulo
- `apps/web/app/marketing/content/reel-variation-actions.ts` — Server Actions: `createTrialReelsJobAction`, `getReelVariationJobAction`, `listReelVariationJobsForPieceAction`, `updateReelVariationAction`, `setReelVariationDelayAction`, `publishVariationsAction`, `refreshVariationPreviewUrlsAction`
- `apps/web/app/api/queue/process-reel-variations/route.ts` — Endpoint receptor de QStash (fallback dev / Vercel)
- `apps/web/app/api/queue/process-reel-variations/processor.ts` — Procesador FFmpeg inline (dev)
- `apps/reel-worker/` — Worker completo para Fly.io (Node.js + FFmpeg):
  - `src/types.ts`, `src/ffmpeg-variants.ts`, `src/captions.ts`, `src/processor.ts`, `src/index.ts`
  - `fly.toml`, `Dockerfile`, `package.json`, `tsconfig.json`, `README.md`
- `apps/web/components/marketing/trial-reels/trial-reels-button.tsx` — Botón CTA
- `apps/web/components/marketing/trial-reels/variation-card.tsx` — Card por variante con video player + editor de caption
- `apps/web/components/marketing/trial-reels/trial-reels-panel.tsx` — Panel completo con Supabase Realtime, selector de delay, y publicación
- `apps/web/components/marketing/trial-reels/index.ts` — Barrel export

**Archivos modificados:**
- `apps/web/components/marketing/content-piece-detail.tsx` — Nueva tab "Trial Reels" + TrialReelsButton en panel izquierdo (solo para reels con Drive vinculado)
- `apps/web/components/marketing/marketing-content-detail-page-client.tsx` — Prop `initialReelJobs`
- `apps/web/app/(platform)/marketing/content/[id]/page.tsx` — Fetcha `reel_variation_jobs` en paralelo para SSR
- `.env.example` — Agregada variable `REEL_WORKER_URL`

**Por qué / finalidad:**

Estrategia de "Trial Reels": publicar 5 variaciones de un reel que funcionó bien, cambiando velocidad, música, subtítulos y colorimetría. Usada por creadores para maximizar alcance y testear qué variante tiene mejor performance. OTC automatiza todo el proceso desde la descarga hasta la publicación.

**Decisiones de diseño relevantes:**

1. **Worker separado en Fly.io** (no Vercel lambda): FFmpeg procesar video tarda varios minutos, Vercel tiene límite de 300s y no tiene FFmpeg instalado. Fly.io con `performance-2x` (2 vCPU, 4 GB RAM) lo maneja sin límite.

2. **El video fuente se descarga desde Next.js (no el worker)**: Para la descarga de Drive se necesita el token OAuth de Google del usuario, que está en la sesión Next.js. El servidor Next.js descarga el video en la Server Action y lo sube a Supabase Storage. El worker solo accede a Storage (con service role), sin necesitar tokens de usuario.

3. **Metadatos anti-detección**: Cada variante reescribe `creation_time`, `encoder`, `make`, `model`; strip con `-map_metadata -1`; bitrate variado ±5%; crop de 1-2px. Esto rompe el fingerprint de video para que Instagram no detecte el mismo video resubido.

4. **Supabase Realtime en el panel**: El estado del job se actualiza en tiempo real sin polling — el worker actualiza DB directamente y el cliente recibe las actualizaciones vía `postgres_changes`.

5. **Captions con Haiku**: Se generan al momento de `preview_ready` con tonos diferentes por variante (energético para speed_up, contemplativo para speed_down, etc.). El usuario puede editarlos antes de publicar.

6. **Publicación como draft en Zernio**: `createPost` con `status: 'draft'` porque Zernio necesita el video subido directamente vía su UI para Instagram reels. La URL firmada de Storage se adjunta para que el usuario la use desde Zernio si la publicación directa falla.

**Riesgos / deuda técnica pendiente:**

- **Fly.io no configurado**: El worker necesita deploy en Fly.io y que `REEL_WORKER_URL` esté en las env vars de Vercel. Sin esto, QStash apunta al endpoint fallback de Next.js que en Vercel devuelve error (sin FFmpeg).
- **LUT y música**: Sin `luts/warm.cube` y `luts/background-music.mp3`, las variantes V3 y V5 usan fallbacks (silencio y eq filter). Para producción real, incluir assets de calidad.
- **Videos > 500 MB**: El límite actual es 500 MB. Videos muy pesados fallarán en descarga.
- **Delay entre publicaciones**: El delay real de horas se simula con 30s max para no bloquear el servidor en la Server Action. Para delays reales, implementar con un schedule de QStash (future work).
- **Instagram Reels vía Zernio**: La publicación directa de reels puede requerir endpoints específicos de Zernio que aún no están mapeados en el cliente. Verificar con equipo Zernio.
- **Concurrencia**: `fly.toml` limita a 2 requests concurrent y 1 soft limit. Si hay muchos jobs simultáneos, se pondrán en cola o se rechazarán.

---

### 2026-08-09 — Fix MRR=0 y Nuevos clientes=0 en Panel General

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `26dcf51` — fix(dashboard): corregir MRR=0 y Nuevos clientes=0 en Panel General  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/derive-dashboard-data.ts`, `components/dashboard/dashboard-page-content.tsx`

**Qué se hizo:**

**Bug 1 — MRR = 0 US$:**  
`deriveDashboardData` llamaba a `deriveFinanceSummary` sin el argumento `payments`. Esto hace que `collectRevenueEvents` use el fallback `collectRevenueEventsFromClients`, que genera eventos de cobro solo a partir de `client.installments[].paidAt`. Los clientes seed con `payment_type = 'upfront_fee'` y `installments = []` no producían ningún evento → MRR = 0, aunque hubiera pagos reales en `client_payments`.

**Fix:** Se agregó un parámetro opcional `payments?: ClientPayment[]` a `deriveDashboardData` y se pasa a `deriveFinanceSummary`. `DashboardPageContent` ahora extrae `clientPayments` de `useFinanceData()` (ya disponible en el provider) y lo pasa al cálculo.

**Bug 2 — Nuevos clientes = 0:**  
`new Date("2026-08-01").getMonth()` retorna `6` (julio) en entornos UTC-3 porque la cadena ISO sin hora se parsea como UTC midnight, y `getMonth()` devuelve la fecha en hora local — que en UTC-3 es `2026-07-31T21:00:00`. Este bug suprimía todo cliente cuyo `joinDate` sea el 1° del mes.

**Fix:** Se reemplaza la comparación `getMonth() / getFullYear()` por comparación de string `YYYY-MM`: `c.joinDate.slice(0, 7) === nowYearMonth`. Inmune a offsets de timezone.

**Por qué / finalidad:**
Estas dos métricas aparecían en "0" en el Panel General incluso con datos seed coherentes insertados. Afectan directamente la legibilidad del dashboard para el founder.

**Decisiones de diseño relevantes:**
- Se eligió agregar `payments?` a `deriveDashboardData` (en lugar de reestructurar para recibir un `FinanceSummary` pre-computado) para mantener la función pura y testeable sin providers.
- `clientPayments` ya estaba disponible en `FinanceDataProvider` y `FinanceDataContext` — solo faltaba consumirlo en el componente del dashboard.
- La comparación de string `YYYY-MM` es más robusta que `parseDateOnly` (de `revenue-period.ts`) porque no requiere importar otra dependencia.

**Riesgos / deuda técnica pendiente:**
- El mismo bug de UTC-midnight podría existir en otros sitios del codebase que usen `new Date("YYYY-MM-DD")` y luego llamen a `.getMonth()` / `.getFullYear()`. Buscar en el futuro: `new Date(.*joinDate|createdAt|paidAt.*).getMonth\(` o similar.
- Si `clientPayments` crece mucho (miles de pagos), el `useMemo` del dashboard se recalculará cada vez que varíe el array. No es un problema hoy pero a escala habría que memoizar mejor.

---

### 2026-08-09 — Diagnóstico de bugs de dashboards con seed data: hallazgos

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude (investigación, sin cambios de código)  
**Módulo(s) afectado(s):** análisis cross-módulo

**Qué se hizo:**
Investigación exhaustiva de tres problemas reportados tras insertar datos seed:

**Prioridad 1 — "Tasa de agendamiento: 550%" y "Tasa de fantasma: 125%":**  
No hay bug matemático. Con los datos seed: `bookingRate = 55%` (22/40 conversaciones son booked/agendado/closeado), `ghostingRate = 12.5%` (5/40). El formato "55,0%" (coma decimal española en `derive-dashboard-data.ts`) puede confundirse visualmente con "550%" en fuente pequeña. Las fórmulas en `derive-sales-metrics.ts` son correctas (siempre ≤100%).

**Prioridad 3 — "Distribución de contenido publicado: VENTA 100%":**  
No hay bug. Las 6 `content_assets` existentes son posts de Instagram del tipo "Si querés…, entrá a la waitlist" — CTA directo → correctamente etiquetados como VENTA por la IA. Los datos seed se insertaron en `content_pieces` (Zernio, tabla separada), que el gráfico de distribución no consulta. `getContentDistributionDataAction` usa `listContentAssetsAction()` que solo lee `content_assets`.

**Riesgos / deuda técnica pendiente:**
- El gráfico "Distribución de contenido publicado" no incluye `content_pieces` (Zernio). `content_pieces.analysis->>'ai_label'` usa una taxonomía diferente (texto libre: "Ventas y conversión", "Estrategia de contenido", etc.) — no se mapea directamente a AUTORIDAD/ATRACCION/NUTRICION/VENTA. Para incluir `content_pieces` en el gráfico habría que agregar una columna `content_objective TEXT` o normalizar el mapeo en la acción.

---

### 2026-08-09 — Seed data ficticio en Supabase para testing visual de dashboards

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** sin commit — operación directa en DB de Supabase (no hay cambios de código)  
**Autor:** Claude  
**Módulo(s) afectado(s):** Supabase DB (org `46cce98c-6d4c-4e4d-94a7-7cc24ae1104d` — "Optimiza tu Control")

**Qué se hizo:**
Inserción de datos ficticios de prueba en la base de datos del proyecto Supabase (`nrzlylzbmsuowzhpdnjl`) para la org de Santiago Zurbrigk, con el objetivo de testear visualmente charts y dashboards. Todos los registros están marcados con identificadores específicos para fácil eliminación posterior.

**Resumen de registros insertados:**

| Tabla | Registros | Marcador de seed |
|-------|-----------|-----------------|
| `clients` | 25 clientes | `nickname = '_seed_otc'` |
| `client_payments` | 48 pagos | `payment_received_from = '_seed_otc'` |
| `closing_calls` | 38 llamadas | `notes = '_seed_otc'` |
| `call_analyses` | 22 análisis | `fathom_call_id LIKE 'seed_%'` |
| `conversations` | 40 conversaciones | `external_ref LIKE '_seed_otc_%'` |
| `content_pieces` | 30 piezas | `drive_file_name = '_seed_otc'` |

**Detalles de cada tabla:**

- **clients**: 25 clientes ficticios (dic 2025 → ago 2026). Mezcla de `active`, `success_case`, `onboarding_done`, `pending_onboarding`. 3 productos: Mentoría 1:1 Premium ($2500), Consultoría Intensiva ($800), Membresía Comunidad Pro ($97/mes). Plataformas: mercadopago, stripe, bank_transfer. Email termina en `@seed.otc`.
- **client_payments**: 48 pagos coherentes con cada cliente. Pagos upfront, cuotas (3 meses) y membresías mensuales. Total recaudado seed: ~$39,337. Fechas spread dic 2025 → ago 2026.
- **closing_calls**: 38 llamadas de cierre. Statuses: 21 `closed` ($35,091 en revenue), 11 `not_closed`, 5 `no_show`, 1 `scheduled`. Con `outcome` JSONB, `form_answers`, `no_close_reason`, `amount`. Spread dic 2025 → ago 2026.
- **call_analyses**: 22 análisis de llamadas (Fathom-style). Score promedio 86/100. 21 sold=true. Campos completos: `section_scores`, `objections`, `power_phrases`, `weak_phrases`, `filler_words_count`, `summary`, `strengths`, `improvements`.
- **conversations**: 40 conversaciones DM. 14 `closed`, 8 `booked`, 13 `active`, 5 `ghosted`. Todos los campos IA completados: `ai_score`, `ai_label` (hot/warm/cold), `ai_funnel_stage`, `ai_detected_objections`, `ai_booking_signals`, `ai_recommended_action`, etc.
- **content_pieces**: 30 piezas publicadas feb → jul 2026 con tendencia de crecimiento clara. Views feb: 19K total → jul: 115K total. 2 reels virales: "Storytime: el día que perdí un cliente" (28.4K views, may 2026) y "Hot take: si tu mentoría no tiene sistema" (45.2K views, jul 2026). Campos: `metrics` (JSONB flat), `analysis` (JSONB con ai_label, ai_score, strengths, improvements), `format_type`, `hook_type`, `cta_type`.

**Por qué / finalidad:**
El usuario necesitaba datos reales y coherentes para testear visualmente cómo funcionan los charts de clientes, el pipeline de ventas, el scoring de leads, los análisis de llamadas y las métricas de contenido. Los datos vacíos no permiten evaluar el diseño de los dashboards.

**Script de limpieza (EJECUTAR cuando se quieran eliminar los datos seed):**
```sql
-- Ejecutar en este orden para respetar FK constraints
DELETE FROM call_analyses
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND fathom_call_id LIKE 'seed_%';

DELETE FROM client_payments
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND payment_received_from = '_seed_otc';

DELETE FROM closing_calls
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND notes = '_seed_otc';

DELETE FROM conversations
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND external_ref LIKE '_seed_otc_%';

DELETE FROM content_pieces
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND drive_file_name = '_seed_otc';

DELETE FROM clients
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND nickname = '_seed_otc';
```

**Decisiones de diseño relevantes:**
- Se eligió marcar con campos existentes en lugar de agregar una columna `is_seed` para no alterar el schema.
- `conversations.external_ref` tiene un unique constraint por `(organization_id, external_ref)`, por eso se usó `_seed_otc_001..040` en lugar del mismo valor en todos.
- Los datos son coherentes entre sí: los clientes tienen pagos que suman su `total_amount`, las llamadas de cierre coinciden con los leads de conversaciones, los análisis de llamadas referencian las mismas llamadas.
- Las métricas de `content_pieces` usan el formato "flat" que `resolvePostAnalytics` normaliza correctamente.
- Las `call_analyses` no están vinculadas a `closing_calls` por FK (la tabla no tiene constraint directo) — son análisis independientes con `fathom_call_id` de tipo texto.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **Estos datos son temporales** — recordar ejecutar el script de limpieza antes de ir a producción real o antes de demos con clientes reales.
- Los `client_payments` tienen `storage_path = '_seed_otc'` (NOT NULL) — este campo normalmente apunta a un path de Storage de Supabase. No hay archivo real asociado.
- Los `content_pieces` tienen `drive_file_name = '_seed_otc'` pero sin `drive_file_id` real — los links de Drive no funcionarán para estos registros.
- Los análisis de llamadas tienen `fathom_call_id` ficticios — no se pueden cargar transcripciones reales desde Fathom para estos registros.

---

### 2026-08-08 — Fix scrollbar vertical en modales + panel ManyChatManageSheet roto en integraciones

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `791a6fa` — fix(integrations): ocultar scrollbar vertical en modales y corregir panel de ManyChat  
**Autor:** Claude  
**Módulo(s) afectado(s):** `packages/ui`, `integrations`

**Qué se hizo:**
1. **`packages/ui/src/primitives/dialog.tsx` — `DialogContent`**: Agrega `[&::-webkit-scrollbar]:hidden` y `[scrollbar-width:none]` al conjunto de clases base. Oculta el track del scrollbar en WebKit (Chrome, Edge, Safari) y Firefox cuando el `DialogContent` tiene `overflow-y-auto` aplicado vía `className`. El contenido sigue siendo scrolleable; solo desaparece la barra visual.
2. **`apps/web/components/integrations/manychat-manage-sheet.tsx`**: Mueve `shadow-xl` al estado abierto (`open = true`). Cuando el panel está cerrado (`translate-x-full`), la clase `shadow-xl` se reemplaza por `shadow-none`. Root cause: la sombra de un elemento `fixed` no está sujeta a `overflow: clip` del ancestro → sangraba ~25px hacia el interior del viewport → aparecía como una franja/panel oscuro en el borde derecho de la página de integraciones.
3. **`apps/web/components/integrations/integration-card.tsx`**: Renderiza `ManyChatManageSheet` condicionalmente solo cuando `integration.provider === 'manychat'`. Antes se renderizaba para todas las cards de integración (N instancias de un aside fijo en el DOM), lo que multiplicaba el artefacto visual.

**Por qué / finalidad:**
- El usuario reportó que en la página de integraciones aparecía "una card a la derecha o una especie de sidebar roto que no llega a verse". Era el shadow del `ManyChatManageSheet` closed sangrando en el viewport.
- El usuario también reportó scrollbar vertical visible en el modal de Zernio (y otros modales) tras el fix de scrollbar horizontal de la sesión anterior.

**Decisiones de diseño relevantes:**
- `scrollbar-width: none` es Firefox; `::-webkit-scrollbar { display: none }` es WebKit. Ambos se necesitan para cobertura cross-browser.
- El render condicional del `ManyChatManageSheet` por provider es correcto: el estado `manychatManageOpen` y su handler están en `IntegrationCard` y solo se usan cuando `provider === 'manychat'`.
- Separar shadow del transform permite que la animación de slide-in/out siga funcionando sin artefactos.

**Riesgos / deuda técnica pendiente:**
- `ManyChatManageSheet` es un aside fijo custom (no usa Radix Sheet). Podría migrarse a un Sheet de Radix para mayor accesibilidad (focus trap, escape key handling).

---

### 2026-08-08 — Fix "Conectá tus redes" en dashboard + scrollbars en modales

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `bef3902` — fix(dashboard+ui): mostrar métricas Zernio en dashboard y eliminar scrollbars en modales  
**Autor:** Claude  
**Módulo(s) afectado(s):** `dashboard`, `packages/ui`

**Qué se hizo:**
1. **`app/integrations/zernio/actions.ts` — `getZernioAnalyticsAction`**: Reemplazada la llamada a `client.getPostsAnalytics()` (→ `/analytics/posts` de Zernio) por una query a `content_pieces` en Supabase. La función ahora suma `metrics.impressions`, `metrics.likes` y `metrics.comments` de las piezas de Zernio publicadas en los últimos 30 días. `hasData` se setea `true` en cuanto existe al menos una pieza de Zernio en la DB (aunque las métricas sean 0), mostrando el ring chart en vez del empty state "Conectá tus redes". Si no hay piezas en los últimos 30 días, hace un segundo query sin filtro de fecha para verificar si hay piezas históricas.
2. **`packages/ui/src/primitives/dialog.tsx` — `DialogContent`**: Agrega `overflow-x-hidden` al conjunto de clases base de todos los `DialogContent`. Fix global para la scrollbar horizontal que aparecía en modales con `overflow-y-auto` (especialmente visible en el modal de Zernio "Conectar Zernio").

**Por qué / finalidad:**
- El dashboard mostraba "Conectá tus redes para ver analytics / Vinculá cuentas en Zernio..." aunque Zernio estaba conectado y había contenido sincronizado. La causa: `getPostsAnalytics()` llama `/analytics/posts` de Zernio cuyo formato de respuesta (`{ posts: [...], analytics: Record<platform, metrics> }`) no matcheaba el parsing del código → todas las métricas quedaban en 0 → `hasData = false`.
- En el modal de Zernio (y otros modales con `overflow-y-auto`) aparecían tanto una scrollbar vertical como una horizontal. La scrollbar horizontal se activa porque la vertical ocupa espacio (en Windows/sistema con scrollbars siempre visibles), lo que estrecha el contenido disponible y puede disparar overflow horizontal. `overflow-x-hidden` lo previene globalmente.

**Decisiones de diseño relevantes:**
- `content_pieces` es la fuente de verdad para métricas de Zernio (ya normalizadas por `resolvePostAnalytics`). Usarla en el dashboard evita una llamada en vivo a Zernio en cada carga del dashboard (más lento y frágil).
- `overflow-x-hidden` en el base `DialogContent` es seguro: los diálogos tienen `max-w-lg` fijo y nunca necesitan scroll horizontal. La propiedad puede sobreescribirse pasando `overflow-x-auto` en `className` si algún caso especial lo requiriera.

**Riesgos / deuda técnica pendiente:**
- Si hay piezas de Zernio pero ninguna en los últimos 30 días, el dashboard mostrará el ring chart con métricas en 0 (con "Sin datos de engagement") en vez del empty state. Es el comportamiento correcto ya que Zernio está conectado y tiene datos históricos.
- La función `getZernioAnalyticsAction` ahora importa `createClient` de `@/lib/supabase/server` en el archivo `zernio/actions.ts`. Verificar que no haya conflictos con el uso existente de `createAdminClient`.

---

### 2026-08-08 — Fix React #418 (hidratación) en detalle de contenido + sync de historias Zernio

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `d724eae` — fix(marketing): hidratación React #418 y sync de historias Zernio  
**Autor:** Claude  
**Módulo(s) afectado(s):** `marketing`, `lib/marketing`

**Qué se hizo:**
1. **`content-piece-detail.tsx` — React error #418**: Añadido `suppressHydrationWarning` en todos los elementos que renderizan fechas/números con `toLocaleString("es-AR")` / `toLocaleDateString("es-AR")` (elementos `<p>` y `<span>` en líneas de fecha de publicación, métricas actualizadas, funnel de atribución de ventas, fecha de variantes IA). Para el prop `subtitle` de `ChartShell` (string interpolado — no admite `suppressHydrationWarning` directamente), se reemplazó `totalInteractions.toLocaleString("es-AR")` por `fmtNum(totalInteractions)` que evita separadores de locale para valores ≥1000.
2. **`sync-actions.ts` — `fetchExternalPostsViaSync`**: Además del `syncExternalPosts` (POST /posts/sync-external → toca Instagram /me/media, NO trae stories), ahora también llama `listPublishedPosts({ source: "external", accountId, limit: 200 })` para cada cuenta. Esto recupera todos los posts externos conocidos por Zernio, incluyendo historias si Zernio las sincroniza vía otro mecanismo. Los dos conjuntos se mergean y se deduplicam con `dedupeExternalPosts`.
3. **`sync-actions.ts` — `externalPlatformPostId`**: Fallback para historias sin `platformPostId`: si el `_id` de Zernio es un MongoDB ObjectID (24 hex chars) y el tipo es `story`, se usa `zstory_<id>` como identificador en lugar de descartar la historia.
4. **Logging**: Se añade logging detallado con `storyCount` y `types` en ambas llamadas a Zernio para diagnosticar qué tipos devuelve cada endpoint.

**Por qué / finalidad:**
- **Error #418**: El componente `ContentPieceDetail` es `"use client"` pero Next.js igual lo pre-renderiza en el servidor (SSR). `toLocaleString("es-AR")` produce resultados distintos entre Node.js (ICU limitada o de sistema) y el browser, causando mismatch en el texto hidratado → React error #418.
- **Historias**: `syncExternalPosts` (POST /posts/sync-external) solo sincroniza el feed `/me/media` de Instagram, que por diseño de la API de Meta no incluye stories (están en `/me/stories`). Las historias publicadas no aparecían en el módulo de Contenido porque nunca se obtenían. El usuario publicó una historia manualmente y al hacer sync manual no la veía.

**Decisiones de diseño relevantes:**
- `suppressHydrationWarning` es preferible a envolver en `useEffect`/`useState` porque no cambia el comportamiento de la UI (la fecha se muestra igual) y no agrega re-render.
- Para el subtitle prop de ChartShell, `fmtNum()` es locale-safe para valores ≥1000 (usa `K`/`M` con `toFixed`) y para <1000 los separadores locales son irrelevantes (no hay miles).
- `zstory_<id>` como prefijo para IDs de historias sin platformPostId evita colisiones con IDs reales de Instagram y hace el origen obvio en la DB.
- La llamada `listPublishedPosts({ source: "external" })` es complementaria a `syncExternalPosts`: la primera lista lo que Zernio ya conoce, la segunda fuerza un re-sync desde Instagram.

**Riesgos / deuda técnica pendiente:**
- No se sabe con certeza si Zernio incluye stories en `GET /posts?source=external`. Hay logging para diagnosticarlo. Si `storyCount` sigue siendo 0, el problema está en Zernio (no sincroniza stories de Instagram en `/me/stories`) y requeriría un endpoint separado en Zernio o un mecanismo diferente.
- La URL de una historia en Instagram solo existe mientras la historia está activa (24hs). Si Zernio no guarda el `thumbnailUrl` de la historia, la columna `thumbnail_url` quedaría null.

---

### 2026-08-08 — Fix errores 403 en consola del módulo Marketing por URLs CDN de Instagram expiradas

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `c432abe` — fix(marketing): eliminar errores 403 por URLs CDN de Instagram expiradas en thumbnails  
**Autor:** Claude  
**Módulo(s) afectado(s):** `marketing`, `lib/marketing`

**Qué se hizo:**
1. **Nuevo `lib/marketing/cdn-utils.ts`**: utilidad pura (sin deps de servidor, importable en Client Components) con `isInstagramCdnUrl` y `safeThumbnailUrl`. Esta última devuelve null para URLs CDN efímeras.
2. **`story-thumbnail-storage.ts`**: importa `isInstagramCdnUrl` desde `cdn-utils.ts` y lo re-exporta (evita duplicación).
3. **`sync-actions.ts` — caso `toInsert`**: cuando `persistContentThumbnail` falla, ahora guarda `null` en lugar de la URL CDN cruda. Antes se insertaba la URL CDN que expira en ~1-2hs generando 403 en el próximo page load.
4. **`sync-actions.ts` — `repairExpiredCdnThumbnails`**: nueva función que nulifica URLs CDN vencidas en filas existentes. Se llama en background cada vez que `maybeSyncZernioContentAction` se ejecuta (en el page load de marketing/content). Las URLs se restauran en el próximo sync de Zernio.
5. **Componentes UI** (`content-piece-grid.tsx`, `content-piece-detail.tsx`, `marketing-overview.tsx`, `marketing-content-library.tsx`): usan `safeThumbnailUrl()` antes de renderizar `<img>` → si la URL es CDN, muestran el fallback icon directamente sin hacer el request HTTP que causaba el 403.

**Por qué / finalidad:**
Las URLs de thumbnails de Instagram/Zernio son efímeras (expiran en ~1-2hs). El sistema tiene lógica para persistirlas en Supabase Storage (`persistContentThumbnail`), pero cuando ese proceso fallaba en inserts, la URL CDN cruda quedaba guardada en la DB. Después de expirar, cada page load del módulo marketing generaba múltiples errores `GET https://scontent-gru*.cdnins... 403 (Forbidden)` en la consola del browser.

**Decisiones de diseño relevantes:**
- **Doble defensa**: fix en sync (no guardar CDN URLs) + fix en UI (no renderizar CDN URLs). Así el comportamiento correcto se mantiene aunque fallen los dos mecanismos por separado.
- **Repair en background**: `repairExpiredCdnThumbnails` corre async sin bloquear el throttle check del sync, minimizando impacto en tiempo de carga.
- **cdn-utils.ts separado**: necesario para que el check sea importable en Client Components (que no pueden importar `story-thumbnail-storage.ts` porque ese archivo tiene `createAdminClient` como dep de servidor).
- El caso `toUpdate` ya era correcto (guardaba null cuando fallaba); solo el caso `toInsert` tenía el bug.

**Riesgos / deuda técnica pendiente:**
- Rows existentes con URLs CDN expiradas quedarán con `thumbnail_url = null` y sin imagen hasta el próximo sync de Zernio. En el sync, se intentará persistir la URL fresca a Supabase Storage.
- Si el bucket `content-thumbnails` no existe o no tiene permisos públicos, las thumbnails persistidas tampoco cargarán. Verificar en Supabase Dashboard que el bucket existe y es público.

---

### 2026-08-08 — Fix TypeScript build error: await faltante en apiRateLimit

**Rama/branch:** `main`  
**Commit(s):** `f056137` — fix(utm): agregar await faltante en apiRateLimit para evitar error de tipo TS  
**Autor:** Claude  
**Módulo(s) afectado(s):** `app/api/utm/click`, `app/api/utm/track`

**Qué se hizo:**
Agregado `await` faltante en dos route handlers de UTM al llamar `apiRateLimit(...)`:
- `apps/web/app/api/utm/click/route.ts` línea 7
- `apps/web/app/api/utm/track/route.ts` línea 7

**Por qué / finalidad:**
El build de Vercel fallaba con `Type error: Property 'allowed' does not exist on type 'Promise<RateLimitResult>'`. La función `rateLimit()` en `lib/rate-limit.ts` devuelve una función async (`Promise<RateLimitResult>`), pero los dos archivos UTM la llamaban de forma síncrona, sin `await`, intentando desestructurar `{ allowed, resetAt }` directo del Promise (que no tiene esas propiedades). TypeScript strict lo detectó como error de compilación bloqueante.

**Decisiones de diseño relevantes:**
El resto de los call sites en el codebase (agente, auth, webhooks, Fathom, etc.) ya usaban correctamente `await`. Este era un bug introducido al mergear el branch `devin/fix-monorepo` que reemplazó el rate limiter in-memory por uno distribuido en PostgreSQL.

**Riesgos / deuda técnica pendiente:**
Ninguno para este cambio. El build debería pasar limpio.

---

### 2026-08-08 — Merge a main: integración de 3 branches en producción

**Rama/branch:** `main`  
**Commit(s):**
- `46020ae` — merge(main): integrar devin/fix-monorepo
- `c59ebd4` — merge(main): integrar claude/contenido-marketing-ui-redesign
- `ba08d79` — merge(main): integrar claude/otc-codebase-exploration-43fo8w  
**Autor:** Claude  
**Módulo(s) afectado(s):** Todo el monorepo

**Qué se hizo:**
`main` estaba congelado desde julio 13 (solo tenía 1 archivo de cambios del PR #1). Todos los cambios recientes vivían en branches de preview de Vercel. Se mergearon tres branches a `main` para que Vercel auto-deploye a producción:

1. **`claude/otc-codebase-exploration-43fo8w`** (245 archivos, 19k inserciones): todo el trabajo reciente — dashboard redesign, marketing overview, sales metrics, design system, lead magnets, multi-closer, métricas personalizadas, agente con herramientas de datos, dark mode Vercel-style, bokeh ambiental, content intelligence, hardening de seguridad, etc.

2. **`claude/contenido-marketing-ui-redesign-y99q45`**: redesign de UI de biblioteca de contenido y detalle de pieza. 4 conflictos resueltos con `--theirs` (la versión del branch redesign era más nueva y completa).

3. **`devin/fix-monorepo-toolchain-y-rate-limit`**: correcciones de toolchain monorepo (lint, typecheck, build) y reemplazo de rate limiter in-memory por rate limiter distribuido en PostgreSQL (`consume_rate_limit` RPC en Supabase).

**Por qué / finalidad:**
Producción mostraba una versión vieja de OTC con módulos eliminados (Operaciones, Producto, Lanzamientos). El usuario había promovido a producción un preview que tampoco tenía los cambios nuevos. La solución correcta era hacer `main` la fuente de verdad y dejar que Vercel auto-deploye desde ahí.

**Decisiones de diseño relevantes:**
- `redesign/visual-v2` y `design/premium-glass-ui` **no se mergearon**: tienen historias de git no relacionadas (675 archivos de diferencia con main, `--allow-unrelated-histories` hubiera creado un caos). Se dejaron fuera intencionalmente.
- Conflictos en contenido resueltos con `--theirs` porque el branch de redesign tenía la versión más reciente de los 4 archivos en conflicto.

**Riesgos / deuda técnica pendiente:**
- Los branches `redesign/visual-v2` y `design/premium-glass-ui` tienen trabajo que puede contener ideas útiles pero no son mergeables en el estado actual sin revisión manual cuidadosa.
- El rate limiter distribuido requiere que la función SQL `consume_rate_limit` exista en la base de datos de Supabase (ya está en las migraciones; verificar que esté aplicada en producción).

---

### 2026-08-08 — Completar DESIGN.md con tokens reales y componentes

**Rama/branch:** `claude/otc-codebase-exploration-43fo8w` → mergeado a `main`  
**Commit(s):** `951db41` — docs(design): completar DESIGN.md con tokens reales, componentes @ai-coo/ui y correcciones dark mode  
**Autor:** Claude  
**Módulo(s) afectado(s):** `DESIGN.md`, documentación

**Qué se hizo:**
449 líneas insertadas, 69 eliminadas en `DESIGN.md`:
- Corregidos tokens dark mode: `--background: 0 0% 0%` (negro puro, no #0A0A0A), `--card: 0 0% 6%`, `--muted: 0 0% 3%`, `--border: 0 0% 11%`
- Agregada tabla de tokens light completa incluyendo `--accent`, `--popover`, `--sidebar-*`, `--ai-muted`, `--primary-border`
- Documentado sistema `--color-surface-*` en formato RGB (globals.css)
- Documentados todos los tokens de chart (`--chart-1` a `--chart-5`, `--chart-accent`, `--chart-background`, etc.)
- Documentados valores exactos de shadows multi-capa para light y dark
- Documentados tokens de glass (`--glass-bg`, `--glass-blur`, etc.) con valores reales
- Agregada API completa de `GlassPanel`, `MetricCard`, `MetricStat`, `MetricBand`, `AiCard`
- Agregada tabla de todos los componentes `@ai-coo/ui`
- Agregada quick-reference de Tailwind, snippets de patrones comunes, keyframes

**Por qué / finalidad:**
El DESIGN.md anterior tenía valores desactualizados y faltaban tokens que existen en el código real. Cualquier sesión nueva de Claude o desarrollador que lo consultara tomaba decisiones incorrectas de diseño.

**Decisiones de diseño relevantes:**
Todos los valores se verificaron contra los archivos fuente reales (`tokens.css`, `globals.css`, `packages/ui/src/`). No se usaron valores aproximados.

**Riesgos / deuda técnica pendiente:**
DESIGN.md necesita actualizarse cada vez que se agreguen nuevos tokens o componentes a `@ai-coo/ui`.

---

### 2026-07-XX — Dashboard, marketing overview, sales redesign (bloque principal)

**Rama/branch:** `claude/otc-codebase-exploration-43fo8w`  
**Commit(s):** múltiples (ver `git log --oneline` desde `054da78` hasta `c7d50a5`)  
**Autor:** Claude  
**Módulo(s) afectado(s):** dashboard, marketing, sales, finanzas, UI, nav, agente, lead magnets, closing

**Qué se hizo (resumen):**

| Area | Cambios |
|------|---------|
| **Dashboard** | Rediseño visual completo con `MetricCard`, embudo de conversión, métricas personalizables con CRUD, selector de pantalla por métrica |
| **Marketing overview** | Rediseño con estructura de v0, charts Bklit (`DualAreaChart`, funnel, heatmap), tab Métricas corregido |
| **Sales / Métricas** | Rediseño completo con variedad de charts Bklit, KPI heroes con `TrendLineChart`, Facturación y Cash Collected como heroes |
| **Closing** | Sistema multi-closer con Calendly por perfil |
| **Lead Magnets** | Módulo nuevo con atribución automática, thumbnails persistidos en Supabase Storage |
| **Content Intelligence** | Módulo de análisis estructurado y reporte de patrones de contenido |
| **Agente** | Herramientas de lectura de datos para todos los módulos |
| **UI / Nav** | Panel flotante unificado + bokeh ambiental estilo Bucket, dark mode Vercel-style, animaciones de entrada globales, sidebar simplificado (Integraciones dentro de Configuración, Base de conocimiento dentro de Agente) |
| **Finanzas** | Pagos del equipo con auto-cálculo desde datos reales |
| **Holding** | Settings de billing model, fixes de bugs en dashboard y onboarding |
| **Seguridad** | Hardening completo del surface de ataque en producción |
| **Landing** | Página /prueba con formulario de confirmación post-Calendly, endpoint /api/trial-confirm |
| **Super Admin** | Módulo Pruebas Gratis con link de sesión Calendly |

**Por qué / finalidad:**
Evolución del producto hacia una UI más premium y funcional. El sidebar fue simplificado eliminando módulos secundarios (Operaciones, Producto, Inteligencia, Reportes Ejecutivos, Tablero de Trabajo) del menú principal — estos pasaron a ser add-ons opcionales. El foco se puso en Marketing, Ventas y Finanzas como los tres pilares del dashboard diario.

**Decisiones de diseño relevantes:**
- Módulos eliminados del sidebar (Operaciones, Producto, Inteligencia, Reportes Ejecutivos, Tablero de Trabajo) siguen existiendo en el código — solo están fuera de la navegación principal. Se documentaron como add-ons en un documento HTML de contexto comercial.
- Charts: se usa la librería Bklit (`@ai-coo/ui`) para gráficos. Los charts legacy de Visx se mantienen donde funcionan.
- Lead Journey en sales combina comentarios Zernio + CTAs ManyChat.

**Riesgos / deuda técnica pendiente:**
- Tab Métricas del marketing overview tuvo varios ciclos de fix por NaN y radar distorsionado — el origen es datos de prueba vacíos. Verificar con datos reales.
- Los módulos add-on (Operaciones, etc.) no tienen ruta de acceso activa en el sidebar — necesitan un mecanismo de activación por org si se quieren vender como add-ons.

---

### 2026-07-XX — Rate limiter distribuido (Supabase PostgreSQL)

**Rama/branch:** `devin/fix-monorepo-toolchain-y-rate-limit` → mergeado a `main`  
**Commit(s):** `aefca02` — fix(monorepo): reparar lint/typecheck/build y rate limiting distribuido  
**Autor:** Devin  
**Módulo(s) afectado(s):** `lib/rate-limit.ts`, `supabase/migrations/`, toolchain monorepo

**Qué se hizo:**
- Reemplazó el rate limiter in-memory (`Map<string, RateLimitEntry>`) por un rate limiter distribuido usando RPC de Supabase (`consume_rate_limit`).
- La función SQL `consume_rate_limit` vive en las migraciones. El in-memory se usa como fallback cuando Supabase no está configurado (dev local) o cuando hay un error de infraestructura (fail-open).
- Expuso múltiples limiters preconfigurados: `aiRateLimit`, `authRateLimit`, `integrationRateLimit`, `apiRateLimit`, `webhookRateLimit`, `sopGenerateRateLimit`, etc.
- También corrigió problemas de toolchain del monorepo (lint, typecheck, build).

**Por qué / finalidad:**
El rate limiter in-memory no funcionaba en entornos serverless (cada lambda tiene su propia instancia de memoria, sin estado compartido). En producción con Vercel, el límite nunca se alcanzaba porque cada request podía caer en una lambda diferente.

**Decisiones de diseño relevantes:**
- Fail-open: si el RPC de Supabase falla, se usa el contador local de la instancia como red mínima. Esto evita que un problema de infraestructura corte tráfico legítimo.
- La tabla `rate_limits` en Supabase solo es accesible via `createAdminClient()` (service role) — RLS bloqueado para clientes normales.

**Riesgos / deuda técnica pendiente:**
- El branch introdujo un bug: dos archivos UTM (`app/api/utm/click/route.ts`, `app/api/utm/track/route.ts`) no tenían `await` al llamar al rate limiter. Fix aplicado en commit `f056137`.
- La función SQL `consume_rate_limit` debe estar aplicada en la base de datos de producción. Verificar en Supabase Dashboard si las migraciones están al día.

---

## Módulos activos en el sidebar (agosto 2026)

Para referencia rápida de qué módulos están visibles en la navegación actual:

| Módulo | Ruta | Estado |
|--------|------|--------|
| Panel General | `/dashboard` | ✅ Activo |
| Marketing | `/marketing/*` | ✅ Activo |
| Ventas / Inbox | `/sales/*` | ✅ Activo |
| Finanzas | `/finance/*` | ✅ Activo |
| Clientes | `/clients` | ✅ Activo |
| Agente de negocio | `/agent` | ✅ Activo (con Base de conocimiento adentro) |
| Configuración | `/settings`, `/integrations` | ✅ Activo (Integraciones adentro) |
| Equipo | (holding/equipo) | ✅ Activo |
| **Operaciones** | `/operations/*` | ⚠️ Add-on — código existe, sin nav |
| **Reportes Ejecutivos** | `/executive-reports` | ⚠️ Add-on — código existe, sin nav |
| **Inteligencia** | `/intelligence` | ⚠️ Add-on — código existe, sin nav |
| **Producto** | `/product/*` | ⚠️ Add-on — código existe, sin nav |
| **Tablero de trabajo** | `/workboard` | ⚠️ Add-on — código existe, sin nav |

---

*Documento creado: 2026-08-08. Actualizar con cada sesión de cambios.*
