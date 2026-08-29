# FUNNELS_SOURCE_MAP.md — Mapa de fuentes del módulo de Embudos

> **Fase A del plan de integraciones.** Enumera **todos** los datos que el
> `Funnel Metrics Standard v1.0` necesita, sin saltear ninguno, y dice de dónde
> sale cada uno hoy.
>
> Es el spec contra el que se construye cada integración. Antes de arrancar
> cualquiera, mirar acá qué tiene que entregar.
>
> **Fecha:** 2026-08-29 · **Documento fuente:** v1.0 · **Arquitectura:** [`FUNNELS_ARCHITECTURE.md`](./FUNNELS_ARCHITECTURE.md)

---

## 0. Cómo leer este mapa

El documento define 20 pasos repartidos en 3 embudos, pero esos pasos no son 20
integraciones distintas: se apoyan en **34 medidas atómicas**. Muchas se comparten
— el `spend` alimenta el costo por click, por registrante, por conversación, por
llamada agendada y el CAC, todo a la vez.

Por eso el mapa está armado en dos niveles: primero las medidas atómicas (lo que
hay que traer), después qué paso consume cada una (para qué sirve).

### Vocabulario de estado

| Estado | Significa |
|---|---|
| ✅ **Disponible** | La integración existe, trae el dato y está poblado |
| 🟡 **Parcial** | El dato existe pero falta algo: no está periodizado, no se persiste, la columna no se puebla, o la integración está en 0 orgs |
| 🔴 **Falta** | No hay integración |
| ⚪ **Sin dueño** | El documento no asigna herramienta a esta medida |

### Dueños según la sección 05 del documento

El documento asigna cada etapa a una herramienta. Esa asignación se respeta al
pie de la letra; donde OTC usa un equivalente, se aclara.

| Herramienta del doc | Posee | Equivalente en OTC |
|---|---|---|
| Meta Ads | Spend, CTR, CPC, cost/lead | Meta vía **Zernio** |
| Hyros | True attribution, ROAS, EPL, journeys | — |
| Landing / VSL page | Opt-in %, play rate, watch % | — |
| WebinarJam / Zoom | Show-up, stick rate, CTA clicks | — |
| Typeform / application | Qualified rate, booking | **Typeform + Google Forms** |
| Calendly | Booked calls, show rate | Calendly + GHL |
| GHL pipeline | Stage counts, set/close, follow-up | GHL (sólo calendarios y contactos) |
| Whop / Fanbasis | AOV, cash collected, refunds | **Stripe + Mercado Pago** |

---

## 1. Las 34 medidas atómicas

### Meta Ads — etapas Spend y Click

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M01 | `spend` | Dinero invertido en el período | 🟡 | `ZernioAdMetrics.spend` ya existe. Falta **periodizar y persistir**: hoy es live-fetch y el histórico no es reconstruible |
| M02 | `impressions` | Impresiones | 🟡 | Idem M01 |
| M03 | `reach` | Alcance. La etapa 1 del spine es "$ deployed / reach" | 🟡 | Idem M01 |
| M04 | `clicks` | Tráfico al embudo (etapa 2 del spine) | 🟡 | Idem M01 |

> Las cuatro vienen en el mismo payload de `ZernioAdMetrics`, que además ya trae
> `ctr`, `cpc` y `cpm` calculados. **No es una integración nueva: es persistir por
> período lo que Zernio ya devuelve.**

### Hyros — atribución

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M05 | `attributed_revenue_by_source` | Revenue atribuido por fuente | 🔴 | Integración completa |
| M06 | `attributed_leads_by_source` | Leads atribuidos por fuente | 🔴 | Integración completa |
| M07 | `journey_touchpoints` | Recorrido del lead entre touchpoints | 🔴 | Integración completa |

> El documento es explícito: *"Report both blended (all revenue ÷ all spend) and
> by-source from Hyros. Blended is the truth; by-source is the steering wheel."*
> Sin Hyros hay ROAS blended pero no by-source, y el etiquetado `[Hyros]` que el
> doc declara no negociable no existe.

### Landing / VSL page — opt-in y consumo de video

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M08 | `landing_visitors` | Visitantes de la página | 🔴 | Analytics de página. Aproximable con M04, pero clicks ≠ visitantes |
| M09 | `optins` | Opt-ins capturados (Lead del webinar) | 🔴 | Analytics de página, o webhook del proveedor de landing |
| M10 | `vsl_plays` | Reproducciones del VSL | 🔴 | Hosting de video con analytics |
| M11 | `vsl_avg_watch_pct` | % promedio visto | 🔴 | Idem M10 |
| M12 | `vsl_reached_cta` | Llegaron al CTA del video | 🔴 | Idem M10 |

> **Decisión abierta:** qué proveedor de video se soporta (Wistia, Vimeo, YouTube,
> player propio). Cada uno tiene un modelo de analytics distinto y hay que
> resolverlo antes de escribir nada.
>
> Ojo con un falso amigo: `ZernioAdMetrics` trae `videoP25/50/75/95/100WatchedActions`,
> pero son del **video del anuncio**, no del VSL de la landing. No sirven para M10-M12.

### WebinarJam / Zoom — asistencia

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M13 | `webinar_registrants` | Registrados | 🔴 | Integración de webinar (o M09 desde la landing) |
| M14 | `webinar_attendees` | Asistieron, vivo + replay | 🔴 | Integración de webinar |
| M15 | `webinar_stayed_to_pitch` | Se quedaron hasta la oferta | 🔴 | Integración de webinar |
| M16 | `webinar_cta_clicks` | Clicks al CTA durante el webinar | 🔴 | Integración de webinar |

> Estas cuatro son **el embudo Webinar entero**: sin ellas sólo se pueden medir
> sus dos extremos.

### Typeform / application — calificación

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M17 | `applications_submitted` | Aplicaciones enviadas | ✅ | Nada — `form_responses`, Typeform y Google Forms integrados |
| M18 | `applications_qualified` | Aplicaciones calificadas | ✅ | Nada — `form_responses.ai_lead_qualification` (`qualified` / `highly_qualified`) |

> **La única fila del documento que OTC ya cubre entera.** Typeform está en 0 orgs
> pero Google Forms en 3, y la calificación por IA ya está construida.

### Calendly — agenda y asistencia

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M19 | `calls_booked` | Llamadas agendadas | ✅ | Nada — `closing_calls`, 282 filas en 4 orgs |
| M20 | `calls_showed` | Asistieron a la llamada | 🟡 | La columna existe pero **no se puebla**: 0 de 282 llamadas en `closed`/`not_closed`, 0 con `outcome`, 0 con `closed_by_name` |

> M20 es un caso distinto a todos los demás: **no falta integración, falta que el
> dato se cargue**. O el sync no escribe el resultado, o el equipo no lo registra.
> Hay que averiguar cuál de las dos antes de construir nada.

### GHL pipeline — conteos por etapa

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M21 | `dm_conversations_opened` | Conversaciones abiertas | 🔴 | Sync de oportunidades de GHL |
| M22 | `dm_conversations_replied` | Respondieron al calificador | 🔴 | Idem M21 |
| M23 | `dm_offers_or_calls_set` | Oferta enviada o llamada agendada | 🔴 | Idem M21 |
| M24 | `deals_closed` | Cierres | 🟡 | Mismo problema que M20: la columna existe y no se puebla |
| M25 | `follow_ups` | Seguimientos | 🔴 | Idem M21. El doc la declara en §05 pero ninguna de sus métricas la usa |

> La integración GHL de OTC consume `/calendars` y `/contacts`. **No toca
> `/opportunities` ni `/pipelines`**, que es donde el documento pone los conteos
> por etapa del embudo DM.

### Whop / Fanbasis — dinero

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M26 | `orders` | Órdenes | 🟡 | `client_payments` existe pero **Stripe y Mercado Pago están conectados en 0 orgs**; 1 sola fila en toda la base |
| M27 | `revenue` | Ingresos | 🟡 | Idem M26 |
| M28 | `cash_collected` | Efectivo cobrado | 🟡 | Idem M26 |
| M29 | `contracted_value` | Valor contratado | 🟡 | `clients.total_amount`, hoy carga manual o importación |
| M30 | `refunds` | Reembolsos | 🔴 | No hay modelo de reembolsos |
| M31 | `new_customers` | Clientes nuevos | 🟡 | `clients.join_date`, carga manual |
| M32 | `purchases_per_customer` | Compras por cliente | 🔴 | Necesario para LTV |
| M33 | `retention_rate` | Retención | 🔴 | Necesario para LTV |

> **El hueco más grande y el menos visible.** Los tres embudos terminan en Cash, y
> de acá salen CAC, ROAS, AOV, LTV y las dos ratios que el documento llama
> decisivas. Hoy no hay ninguna org con pagos conectados.

### Sin dueño explícito en el documento

| # | Medida | Qué es | Estado | Nota |
|---|---|---|---|---|
| M34 | `dm_triggers` | Comentarios, historias o ads que disparan un DM | ⚪ 🟡 | La §05 no le asigna herramienta. La parte paga la cubre Meta (M04); comentarios e historias los tiene Zernio (`listComments`, stories) pero sin periodizar |

> Es también la única fila del documento con benchmark `context-set`, o sea que el
> propio estándar reconoce que no tiene piso universal.

---

## 2. Cobertura por embudo

Qué medidas consume cada paso, y si ese paso se puede medir hoy.

### Webinar Funnel — 2 de 7 pasos medibles

| Etapa | Paso | Medidas | ¿Medible hoy? |
|---|---|---|---|
| Click | Ad → registration page | M02, M04, M01 | 🟡 Al periodizar Meta |
| Lead | Registration opt-in | M08, M09, M01, M13 | 🔴 Falta landing |
| Engaged | Showed up (live + replay) | M13, M14 | 🔴 Falta webinar |
| Engaged | Stayed to the pitch | M14, M15 | 🔴 Falta webinar |
| Intent | Clicked CTA / booked call | M14, M16 | 🔴 Falta webinar |
| Sales Conv. | Direct buy or closed on call | M14, M24, M26 | 🟡 Al poblar cierres |
| Cash | Payment collected | M13, M24, M28 | 🟡 Al conectar pagos |

### VSL Book-a-Call Funnel — 3 de 7 pasos medibles

| Etapa | Paso | Medidas | ¿Medible hoy? |
|---|---|---|---|
| Click | Ad → VSL page | M02, M04, M01 | 🟡 Al periodizar Meta |
| Engaged | Watched the VSL | M08, M10, M11, M12 | 🔴 Falta hosting de video |
| Intent | Booked / applied | M08, M19, M01 | 🟡 M19 ✅, falta M08 |
| Intent | Application quality | M17, M18 | ✅ **Ya medible** |
| Sales Conv. | Showed to the call | M19, M20 | 🟡 Al poblar asistencia |
| Sales Conv. | Call taken → closed | M20, M24 | 🟡 Al poblar cierres |
| Cash | Deposit + collected | M19, M24, M28, M29 | 🟡 Al conectar pagos |

### DM Funnel — 0 de 6 pasos medibles

| Etapa | Paso | Medidas | ¿Medible hoy? |
|---|---|---|---|
| Click | Trigger (comment / story / ad) | M34, M03, M01 | 🟡 Al periodizar Meta y Zernio |
| Lead | Conversation opened | M34, M21, M01 | 🔴 Falta GHL opportunities |
| Engaged | Two-way, replied to qualifier | M21, M22 | 🔴 Falta GHL opportunities |
| Intent | Offer sent or call set | M21, M23 | 🔴 Falta GHL opportunities |
| Sales Conv. | Showed / offer opened | M23, M20 | 🟡 Al poblar asistencia |
| Cash | Closed in thread or on call | M21, M24, M28 | 🔴 Falta GHL opportunities |

---

## 3. KPIs universales (sección 03)

Se comparan entre embudos, así que **cualquier hueco acá afecta a los tres a la vez**.

| KPI | Fórmula del doc | Medidas | Estado |
|---|---|---|---|
| CAC | total spend ÷ new customers | M01, M31 | 🟡 |
| ROAS blended | revenue ÷ ad spend | M27, M01 | 🟡 |
| ROAS by-source | revenue ÷ ad spend, atribuido | M05, M01 | 🔴 Falta Hyros |
| EPL | revenue ÷ leads | M27, etapa Lead | 🟡 |
| EPC | revenue ÷ clicks | M27, M04 | 🟡 |
| CPL | spend ÷ leads | M01, etapa Lead | 🟡 |
| AOV | revenue ÷ orders | M27, M26 | 🟡 |
| LTV | AOV × purchases × retention | AOV, M32, M33 | 🔴 Faltan M32 y M33 |
| Cash collected vs contracted | cash in ÷ total contract value | M28, M29 | 🟡 |
| **LTV : CAC** | LTV ÷ CAC | Todo lo anterior | 🔴 |
| **EPL vs CPL** | EPL ÷ CPL | M27, M01, etapa Lead | 🟡 |

> Las dos últimas son las que el documento llama decisivas: *"EPL vs CPL to know
> if it works and LTV vs CAC to know if it scales."* **EPL vs CPL se desbloquea
> sólo con Meta + pagos. LTV:CAC necesita además retención y compras repetidas.**

---

## 4. Health bands (sección 04)

| Métrica cross-funnel | Medidas | Estado |
|---|---|---|
| LTV : CAC | M01, M31, M26, M27, M32, M33 | 🔴 |
| EPL vs CPL | M01, M27, etapa Lead | 🟡 |
| Blended ROAS | M27, M01 | 🟡 |
| Lead → Intent | Conteos de etapa, por embudo | 🟡 |
| Show rate | M19, M20 | 🟡 |
| Close rate (of shows) | M20, M24 | 🟡 |

> Cinco de las seis se desbloquean con **Meta periodizado + pagos conectados +
> poblar asistencia y cierres**. Ninguna necesita webinar, VSL ni Hyros.

---

## 5. Qué hay que construir

Agrupado por unidad de trabajo, con lo que desbloquea cada una.

| # | Trabajo | Medidas | Desbloquea | Tamaño |
|---|---|---|---|---|
| **I-1** | **Persistir métricas de ads por período** | M01–M04 | Etapas Spend y Click de **los 3 embudos**, CPC, CPL, EPC, ROAS blended, CAC | **S** — Zernio ya devuelve el payload; es un snapshot periódico, no una integración |
| **I-2** | **Conectar pagos (Stripe / Mercado Pago)** | M26–M29, M31 | Etapa Cash de **los 3 embudos**, AOV, ROAS, CAC, EPL, cash vs contracted | **M** — el código de integración existe, están en 0 orgs; falta conectar y mapear a `client_payments` |
| **I-3** | **Poblar asistencia y cierre de llamadas** | M20, M24 | Show rate y Close rate en VSL y DM, 2 health bands | **S–M** — primero hay que averiguar por qué 0 de 282 llamadas tienen resultado |
| **I-4** | **Sync de oportunidades de GHL** | M21–M23, M25 | **Embudo DM entero** (4 de 6 pasos) | **M** — GHL ya integrado con auth y cliente; es agregar endpoints |
| **I-5** | **Integración de webinar** (WebinarJam / Zoom) | M13–M16 | **Embudo Webinar entero** (4 de 7 pasos) | **L** — integración nueva desde cero |
| **I-6** | **Hosting de VSL con analytics** | M10–M12 | Etapa Engaged del **VSL** | **L** — decisión de proveedor pendiente + integración nueva |
| **I-7** | **Analytics de landing / opt-in** | M08, M09 | Etapa Lead del webinar, play rate del VSL | **M** — depende de qué usan los clientes para landings |
| **I-8** | **Hyros** | M05–M07 | ROAS by-source, etiquetado `[Hyros]` | **L** — requiere cuenta y contrato |
| **I-9** | **Retención y compras repetidas** | M30, M32, M33 | **LTV**, y por lo tanto **LTV:CAC** | **M** — modelo de suscripciones y reembolsos |
| **I-10** | **Periodizar triggers de Zernio** | M34 | Etapa Click del DM | **S** — `listComments` y stories ya existen |

---

## 6. Orden recomendado

Como tenés clientes corriendo los tres embudos —y algunos varios a la vez— **no
se puede priorizar por embudo**. Pero sí por estructura, y la estructura del
documento da la respuesta.

Las medidas se parten en dos grupos:

- **Compartidas por los 3 embudos:** Meta (M01–M04), pagos (M26–M33), Hyros
  (M05–M07). Son las etapas **Spend, Click y Cash** — los dos extremos de todo
  embudo — más **todos** los KPIs universales y 5 de las 6 health bands.
- **Específicas de un embudo:** webinar (M13–M16), VSL (M10–M12), DM (M21–M23).

Por eso el orden no es "un embudo a la vez", es **de afuera hacia adentro**:

**Ola 1 — los extremos (sirve a los 3 embudos a la vez)**
`I-1` ads por período → `I-2` pagos → `I-3` asistencia y cierres

Al terminarla, los tres embudos miden Spend, Click y Cash; funcionan CAC, ROAS
blended, AOV, EPL, CPL y **EPL vs CPL**, que es una de las dos ratios decisivas.
Es la ola de mejor relación valor/esfuerzo por lejos: las tres son **S** o **M** y
ninguna es una integración desde cero.

**Ola 2 — los medios, en paralelo**
`I-4` GHL opportunities · `I-5` webinar · `I-6` VSL · `I-7` landings

Cada una completa el centro de su embudo. Son independientes entre sí, así que el
orden lo puede definir cuántos clientes tenés en cada embudo. `I-4` es la más
barata de las cuatro porque GHL ya está integrado.

**Ola 3 — lo que amplía la lectura**
`I-9` retención (desbloquea LTV y LTV:CAC, la segunda ratio decisiva) · `I-8` Hyros
· `I-10` triggers de Zernio

Hyros va último a propósito: es la más cara, la que más depende de un tercero, y
lo que aporta —atribución by-source— es un refinamiento sobre números que ya
funcionan sin ella. El documento mismo lo dice: *"Blended is the truth; by-source
is the steering wheel."* El volante sirve cuando el auto ya anda.

### Lo que hay que averiguar antes de estimar

1. **¿Por qué 0 de 282 llamadas tienen resultado?** Si es que el equipo no lo
   carga, `I-3` es un problema de proceso y no de software.
2. **¿Qué usan los clientes para landings y para hostear el VSL?** Define `I-6` y `I-7`.
3. **¿Hay cuenta de Hyros, o habría que contratarla?** Define si `I-8` es viable.
4. **¿Cuántos clientes en cada embudo?** Ordena la ola 2.

---

*Creado 2026-08-29 como Fase A del plan de integraciones. Actualizar el estado de
cada medida a medida que se cierran las unidades de trabajo de §5.*
