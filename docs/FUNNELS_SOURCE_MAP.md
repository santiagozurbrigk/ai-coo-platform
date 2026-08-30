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
| Whop / Fanbasis | AOV, cash collected, refunds | **Whop + Fanbasis**, tal cual el documento |

---

## 1. Las 34 medidas atómicas

### Meta Ads — etapas Spend y Click

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M01 | `spend` | Dinero invertido en el período | ✅ | Nada — `ad_metrics_daily`, capturado por el cron `capture-ad-metrics` |
| M02 | `impressions` | Impresiones | ✅ | Idem M01 |
| M03 | `reach` | Alcance. La etapa 1 del spine es "$ deployed / reach" | ✅ | Idem M01 |
| M04 | `clicks` | Tráfico al embudo (etapa 2 del spine) | ✅ | Idem M01 |

> ✅ **Cerrado el 2026-08-29 (unidad I-1).** Las cuatro vienen en el mismo payload
> de `ZernioAdMetrics`. El cron diario `capture-ad-metrics` las persiste en
> `ad_metrics_daily`, y el resolver las lee de ahí. La serie histórica arranca el
> día que se activó la captura: hacia atrás no es reconstruible.

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
| M10 | `vsl_plays` | Reproducciones del VSL | 🔴 | Integración con **VTurb** |
| M11 | `vsl_avg_watch_pct` | % promedio visto (retención) | 🔴 | Idem M10 |
| M12 | `vsl_reached_cta` | Llegaron al CTA del video | 🔴 | Idem M10 — se deriva de la curva de retención en el segundo del CTA |

> **Decidido: VTurb.** Tiene [Analytics API pública](https://vturb.gitbook.io/analytics-api)
> con auth por API key y endpoints de plays, views y retención, filtrables por
> video, rango de fechas y fuente de tráfico. Eso cubre M10, M11 y M12 casi 1:1,
> así que esta unidad baja de tamaño **L a M**: no hay que inventar el modelo de
> datos ni decidir proveedor.
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
| M20 | `calls_showed` | Asistieron a la llamada | ✅ | Nada — el flujo existe y el resolver distingue "nadie asistió" de "nadie cargó el resultado" |

> ✅ **Cerrado el 2026-08-30 (unidad I-3).** El flujo de carga ya existía
> (`updateClosingCallAction`, y los syncs nunca pisan un `closed`), así que I-3
> resultó ser una verificación y no una reparación.
>
> Lo que sí faltaba, y se construyó, es la **detección de fuente vacía**: si TODAS
> las llamadas de un período siguen en `scheduled`, el resolver devuelve `null` y
> no `0`. Reportar cero diría que nadie asistió a ninguna llamada, cuando la verdad
> es que nadie cargó el resultado. Un `no_show` sí cuenta como resultado cargado:
> alguien miró la llamada y registró que el lead no vino.

### GHL pipeline — conteos por etapa

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M21 | `dm_conversations_opened` | Conversaciones abiertas | 🔴 | Sync de oportunidades de GHL |
| M22 | `dm_conversations_replied` | Respondieron al calificador | 🔴 | Idem M21 |
| M23 | `dm_offers_or_calls_set` | Oferta enviada o llamada agendada | 🔴 | Idem M21 |
| M24 | `deals_closed` | Cierres | ✅ | Idem M20 |
| M25 | `follow_ups` | Seguimientos | 🔴 | Idem M21. El doc la declara en §05 pero ninguna de sus métricas la usa |

> La integración GHL de OTC consume `/calendars` y `/contacts`. **No toca
> `/opportunities` ni `/pipelines`**, que es donde el documento pone los conteos
> por etapa del embudo DM.

### Whop / Fanbasis — dinero

| # | Medida | Qué es | Estado | Qué falta |
|---|---|---|---|---|
| M26 | `orders` | Órdenes | 🟡 | Modelo y webhooks listos; falta **conectar la primera cuenta real** y verificar el mapeo |
| M27 | `revenue` | Ingresos | 🟡 | Idem M26 |
| M28 | `cash_collected` | Efectivo cobrado | 🟡 | Idem M26 |
| M29 | `contracted_value` | Valor contratado | 🟡 | Idem M26 — `payment_orders.contract_value` |
| M30 | `refunds` | Reembolsos | 🟡 | Idem M26 — `payment_transactions.kind = 'refund'` |
| M31 | `new_customers` | Clientes nuevos | 🟡 | Idem M26 — compradores distintos con orden en el período |
| M32 | `purchases_per_customer` | Compras por cliente | 🔴 | Necesario para LTV |
| M33 | `retention_rate` | Retención | 🔴 | Necesario para LTV |

> **Unidad I-2 construida el 2026-08-29, pendiente de verificación.** Se
> implementó con **Whop y Fanbasis**, que es lo que el documento asigna a esta
> etapa — Stripe y Mercado Pago quedan para el módulo de Finanzas y la
> importación manual, pero ya no son la fuente de la etapa Cash.
>
> El modelo separa lo contratado de lo cobrado, como pide el documento:
> `payment_orders` guarda la promesa y `payment_transactions` el dinero real.
>
> ⚠️ **El mapeo de campos de los webhooks no está verificado.** Los sitios de
> documentación de ambos proveedores no son alcanzables desde el entorno de
> desarrollo. Por eso cada webhook se persiste crudo en `payment_webhook_events`
> ANTES de interpretarlo: el primer evento real de cada proveedor es la fuente de
> verdad para corregir `lib/payments/normalize.ts`. Un evento que no se sabe leer
> queda en estado `unmapped` y se puede reprocesar; nunca se inventa un número.

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
| ~~**I-1**~~ | ~~**Persistir métricas de ads por período**~~ ✅ **Hecho 2026-08-29** | M01–M04 | Etapas Spend y Click de **los 3 embudos**, CPC, CPL, EPC, ROAS blended, CAC | — |
| **I-2** | **Pagos con Whop y Fanbasis** 🔨 **Construido 2026-08-29, sin verificar** | M26–M31 | Etapa Cash de **los 3 embudos**, AOV, ROAS, CAC, EPL, cash vs contracted, refunds | Falta conectar la primera cuenta real y confirmar el mapeo con un webhook de verdad |
| ~~**I-3**~~ | ~~**Verificar asistencia y cierre de llamadas**~~ ✅ **Hecho 2026-08-30** | M20, M24 | Show rate y Close rate en VSL y DM, 2 health bands | — |
| **I-4** | **Sync de oportunidades de GHL** | M21–M23, M25 | **Embudo DM entero** (4 de 6 pasos) | **M** — GHL ya integrado con auth y cliente; es agregar endpoints |
| **I-5** | **Integración de webinar** (WebinarJam / Zoom) | M13–M16 | **Embudo Webinar entero** (4 de 7 pasos) | **L** — integración nueva desde cero |
| **I-6** | **Integración VTurb** | M10–M12 | Etapa Engaged del **VSL** | **M** — Analytics API pública con auth por API key; plays, views y retención filtrables por video y fecha |
| ~~**I-7**~~ | ~~**Analytics de landing / opt-in**~~ — **absorbida por `I-8`**, ver §8 | M08, M09 | Etapa Lead del webinar, denominador del play rate del VSL | — |
| **I-8** | **Hyros** | M05–M09 | ROAS by-source, etiquetado `[Hyros]`, **y los opt-ins de las landings** | **L** — REST API con auth por API key (leads, journeys, sales, orders). Todos los clientes ya lo pagan |
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
~~`I-1` ads por período~~ ✅ → `I-2` pagos 🔨 (falta conectar una cuenta real) → ~~`I-3` asistencia y cierres~~ ✅
    
**Ola 1 completa.** Queda pendiente sólo la verificación del mapeo de pagos con una cuenta real de Whop o Fanbasis.

Al terminarla, los tres embudos miden Spend, Click y Cash; funcionan CAC, ROAS
blended, AOV, EPL, CPL y **EPL vs CPL**, que es una de las dos ratios decisivas.
Es la ola de mejor relación valor/esfuerzo por lejos: las tres son **S** o **M** y
ninguna es una integración desde cero.

**Ola 2 — los medios, en paralelo**
`I-4` GHL opportunities · `I-6` VTurb · `I-5` webinar  *(`I-7` absorbida por `I-8`)*

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

### Orden dentro de la ola 2

Los clientes están repartidos en partes iguales entre los tres embudos y con la
misma urgencia, así que el desempate es por **costo**, de menor a mayor:

1. **I-4 GHL opportunities** — la integración ya existe con auth y cliente; es agregar endpoints
2. **I-6 VTurb** — API pública que mapea casi 1:1 a las tres medidas que faltan
3. **I-5 webinar** — integración nueva desde cero, la más cara

### Lo que queda por averiguar

1. ~~¿Por qué 0 de 282 llamadas tienen resultado?~~ ✅ Datos de prueba, sin valor
   diagnóstico. `I-3` pasa a ser una verificación, no una reparación.
2. ~~¿Qué proveedor de VSL?~~ ✅ **VTurb**, con Analytics API pública.
3. ~~¿Cuántos clientes en cada embudo?~~ ✅ Partes iguales, misma urgencia.
4. ~~¿Qué usan los clientes para sus landings?~~ ✅ **Vercel**. Ver §8: los opt-ins
   salen de Hyros, así que `I-7` se absorbe en `I-8`.
5. ~~¿Los clientes van a pagar Hyros?~~ ✅ **Todos lo pagan.** `I-8` es directa.

**No queda ninguna pregunta abierta.** El plan está listo para ejecutarse de punta
a punta.

---

---

## 7. Nota sobre Hyros

**Qué es:** software de tracking y atribución publicitaria. Instala un script en
las páginas y se integra con las plataformas de ads y el checkout. Construye la
identidad del lead (por email) y cose todos sus touchpoints —anuncio, opt-in,
email, llamada, compra— en un solo recorrido, para poder decir qué anuncio causó
realmente cada venta.

**Qué problema resuelve:** Meta y Google reportan lo que *ellos* creen haber
causado, y sobre-atribuyen. Además pierden el rastro entre dispositivos y a lo
largo del tiempo. En embudos high-ticket con una llamada en el medio y planes de
pago, entre el click y el cash pasan semanas: es justo donde el píxel de la
plataforma es menos confiable. Por eso el documento lo pone como dueño de la
atribución.

**Qué le pide el documento:**
> *"Report both blended (all revenue ÷ all spend) and by-source from Hyros.
> Blended is the truth; by-source is the steering wheel."*

Y la regla de etiquetado, que declara no negociable:
> *"label each figure with its source — [Meta] for platform-reported, [Hyros] for
> attributed. The two never match exactly, and a report that mixes them without
> labels is how bad decisions get made."*

**Lo técnico está resuelto:** tiene REST API con auth por API key. Los endpoints
de leads (con sus journeys), sales y orders cubren M05, M06 y M07.

**Lo comercial no:** Hyros es un SaaS pago, con precio por volumen de ad spend o
revenue trackeado, y **se contrata por negocio, no por agencia**. Cada org cliente
necesitaría su propia cuenta y su propia API key — el mismo patrón BYOK que OTC ya
usa para Anthropic y Zernio.

✅ **Resuelto: todos los clientes pagan Hyros.** La integración es directa y no
hace falta degradar por cliente. Se guarda una API key por org, cifrada, con el
mismo patrón BYOK que Anthropic y Zernio.

Igual se mantiene el manejo de `null` en el resolver: una org recién creada o con
la key vencida tiene que mostrar "sin datos" y no un cero.

**Consecuencia sobre las landings:** el script de Hyros ya va a estar en las
páginas de todos los clientes, y su endpoint de leads devuelve los opt-ins con su
fecha. Eso hace que **`I-7` deje de ser una integración aparte**: M08 y M09 salen
de Hyros. Ver §8.

---

---

## 8. Nota sobre las landings

Los clientes despliegan sus landings en **Vercel**. Vercel es hosting, no una
herramienta de analítica de embudo: no tiene un concepto de "opt-in" ni de
"visitante de página de registro" que OTC pueda leer por API.

Eso deja tres caminos para M08 (`landing_visitors`) y M09 (`optins`), y el
primero es claramente el mejor:

1. **Vía Hyros (recomendado).** Como todos los clientes lo pagan, su script ya
   está en esas páginas y su endpoint de leads da los opt-ins con fecha y fuente.
   **No hay integración nueva que construir**: M08 y M09 se resuelven junto con
   M05–M07 en la unidad `I-8`.
2. **Vía el tracking propio de OTC.** Ya existe `POST /api/utm/track` que escribe
   en `utm_lead_captures`. La landing en Vercel lo llamaría al enviar el
   formulario. Sirve como respaldo o para clientes sin Hyros, pero exige tocar el
   código de cada landing.
3. **Vía Vercel Web Analytics.** Da page views, no opt-ins, y sólo si el cliente
   tiene el producto habilitado. Cubre M08 a medias y M09 nada.

**Por eso `I-7` se elimina como unidad independiente** y su alcance se absorbe en
`I-8`. La ola 2 pasa de cuatro unidades a tres.

---

*Creado 2026-08-29 como Fase A del plan de integraciones. Actualizar el estado de
cada medida a medida que se cierran las unidades de trabajo de §5.*
