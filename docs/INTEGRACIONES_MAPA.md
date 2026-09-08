# Mapa de integraciones de OTC

Qué lee OTC de afuera, por dónde entra, dónde queda y qué se rompe si falta.

**Fuente de verdad en código:** [`apps/web/lib/integrations/registry.ts`](../apps/web/lib/integrations/registry.ts).
Este documento explica el porqué; el registro es lo que la aplicación ejecuta y lo
que pinta la pantalla. Si los dos se contradicen, gana el registro y hay que
corregir este archivo.

**Revisado el 2026-09-08.**

---

## Cómo entran los datos

Son cuatro mecanismos, y la diferencia entre ellos es lo que decide qué tan
fresco está cada número:

| Mecanismo | Qué significa | Quién lo usa |
|---|---|---|
| **Webhook** | El proveedor avisa cuando pasa algo. Es lo más fresco y lo único que sirve cuando el proveedor no guarda historial. | Calendly, ManyChat, GHL (oportunidades), Fathom, Whop, Commas |
| **Cron** | OTC va a buscar cada tanto. Los horarios están en `apps/web/vercel.json`. | Fathom, Typeform, Google Forms, Calendly (respaldo), GHL (turnos), Zernio (métricas) |
| **Manual** | Lo dispara una persona desde la pantalla. Para catálogos que cambian poco. | VTurb, WebinarJam, Hyros, GHL (pipelines) |
| **En vivo** | No se persiste: se consulta al abrir la pantalla. | Inbox de Zernio, comentarios, anuncios de Meta, Drive, atribución de Hyros |

**Lo que se consulta en vivo no se duplica en la base a propósito.** Un comentario
guardado hace tres horas ya no dice lo que dice el comentario hoy.

---

## Qué alimenta cada integración

### Ventas y conversaciones

| Integración | Autenticación | Entra por | Queda en | Sin esto no hay |
|---|---|---|---|---|
| **Zernio** | API key por org | En vivo + cron | `content_pieces` | Inbox, contenido publicado, anuncios |
| **ManyChat** | API key por org | Webhook | `conversations` | DMs con scoring de IA |
| **Calendly** | OAuth | Webhook + cron | `closing_calls` | Turnos agendados |
| **GoHighLevel** | API key de sub-cuenta | Cron + webhook | `closing_calls`, `ghl_opportunities`, `ghl_stage_transitions` | Turnos y etapas del embudo DM |
| **Fathom** | API key | Cron + webhook | `fathom_calls` | Grabaciones y transcripciones de las llamadas |

**Calendly y GoHighLevel son alternativas entre sí** para el mismo dato: los turnos.
Un negocio usa uno u otro, no los dos.

**GoHighLevel no expone el historial de cambios de etapa.** OTC lo construye desde
el primer webhook que recibe, y por eso los períodos anteriores a esa fecha dicen
"sin datos" y no cero. Es la diferencia principal con los proveedores de pago, que
sí dejan traer la historia previa por API.

### Marketing y contenido

| Integración | Autenticación | Entra por | Queda en | Sin esto no hay |
|---|---|---|---|---|
| **Ecosistema Google** | OAuth (Drive + Forms) | Cron + en vivo | `forms`, `form_responses` | Formularios, carpetas de Drive |
| **YouTube** | API key | Cron | `content_assets` | Videos del canal |
| **Typeform** | OAuth | Cron | `forms`, `form_responses` | Formularios y calificación de leads |

**YouTube tiene dos caminos y son independientes.** Si el canal está en la misma
cuenta de Google, entra con el consentimiento del Ecosistema; si no, con su propia
API key. Que YouTube esté conectado **no** implica que Drive y Forms lo estén — ese
error estaba en el código y se corrigió: la pantalla daba el Ecosistema por
conectado cuando lo único conectado era un canal cargado a mano.

### Medición de embudos

| Integración | Autenticación | Entra por | Queda en | Sin esto no hay |
|---|---|---|---|---|
| **VTurb** | API key de cuenta | Manual + en vivo | `vturb_players` | Reproducciones, retención y llegadas al CTA del VSL |
| **WebinarJam** | API key (requiere aprobación) | Manual | `webinarjam_webinars`, `webinarjam_registrants` | Registrados, asistencia y permanencia hasta la oferta |
| **Hyros** | API key | Manual + en vivo | `hyros_ad_accounts` | Atribución por fuente y ROAS por fuente |

Las tres comparten un patrón que la pantalla nueva hace explícito: **hay medidas que
no se pueden calcular hasta que alguien configure algo del lado del proveedor.**

- VTurb sin `pitch_time` devuelve un número que *parece* "llegaron al CTA" y cuenta a
  casi todo el que abrió el video.
- WebinarJam sin el segundo de la oferta no puede medir permanencia.
- Hyros sin cuentas publicitarias sincronizadas no puede responder ninguna consulta:
  su API exige nombrarlas.

En los tres casos OTC dice "sin datos" en vez de mostrar el número equivocado, y
ahora **también lo dice en Integraciones**, que es donde se arregla.

### Cobros

| Integración | Autenticación | Entra por | Queda en | Sin esto no hay |
|---|---|---|---|---|
| **Whop** | Webhook firmado (`ws_…`) | Webhook | `payment_transactions`, `payment_orders` | Cash collected, reembolsos, AOV |
| **Commas** (ex Fanbasis) | Webhook firmado | Webhook | `payment_transactions`, `payment_orders` | Cash collected, reembolsos, valor contratado |

**Los dos usan convenciones opuestas** y el mapeo es por proveedor, nunca por
heurística de nombre de campo:

| | Whop | Commas |
|---|---|---|
| Montos | Decimales en la moneda (`10.43` = $10.43) | Enteros en centavos (`2999` = $29.99) |
| Monto cobrado al cliente | `settlement_amount` | `amount_cents` |
| Firma | Standard Webhooks (`webhook-id` · `webhook-timestamp` · `webhook-signature`) | HMAC-SHA256 hex sobre el body crudo |
| Prefijo del secreto | `ws_` — se usa **literal** como clave HMAC | Sin prefijo |
| Entrega | *At least once*, 12 reintentos en ~71 h, sin orden garantizado | Sin reintentos |

La deduplicación de Whop vive en `payment_webhook_events`, con índice único sobre
`(provider, external_event_id)`.

Verificado contra [`docs/external-apis/whop/RESUMEN-OTC.md`](./external-apis/whop/RESUMEN-OTC.md)
y [`docs/external-apis/commas/RESUMEN-OTC.md`](./external-apis/commas/RESUMEN-OTC.md).

### Operación y datos

| Integración | Autenticación | Entra por | Queda en |
|---|---|---|---|
| **ClickUp** | Token pedido en el momento | Importación puntual | `clients` |

No mantiene conexión: se pide el token, se importa y se termina. Por eso su tarjeta
nunca dice "conectada".

---

## Lo que está construido pero no se ofrece

Estas integraciones existen en el código y se pueden conectar, pero **no aparecen en
la pantalla**. El registro exige que cada una declare por qué:

| Integración | Por qué no se ofrece |
|---|---|
| Instagram (Graph) | Zernio cubre contenido y mensajes sin pedir una app de Meta propia |
| WhatsApp / Instagram DMs (Unipile) | Reemplazados por el inbox de Zernio |
| Google Forms suelto | Se conecta dentro del Ecosistema Google, que pide Drive y Forms juntos |
| Stripe · Mercado Pago | Los cobros de los clientes actuales pasan por Whop y Commas |
| Discord | El bot todavía no está publicado para instalación por cuenta |

Antes esto lo decidían **dos `Set` hardcodeados** en lugares distintos más un flag
`hidden` en el catálogo, y los tres podían discrepar sin que nada fallara.

---

## Una advertencia sobre `last_sync_at`

La pantalla muestra "últimos datos recibidos", no "última vez que se consultó", y la
diferencia importa: **varios syncs sólo escriben `last_sync_at` cuando ingestaron
algo.** Fathom lo hace explícitamente (`last_sync_at unchanged — no calls ingested`).

Por eso OTC **no deriva ninguna alarma de la antigüedad de ese campo**. Una fecha de
hace seis días puede ser una semana sin llamadas, que no es una falla. Inventar una
alarma ahí sería exactamente el tipo de número plausible y equivocado que el resto
del sistema evita.

Si en algún momento hace falta detectar un sync caído, hay que agregar un campo
aparte —"última vez que se intentó"— y no reinterpretar este.

---

## Cómo agregar una integración

1. Agregar el id en `apps/web/constants/integrations.ts`.
2. Agregar su entrada en `apps/web/lib/integrations/registry.ts` — el tipo obliga a
   completar categoría, autenticación, flujos de datos y qué alimenta.
3. Agregar su color en `apps/web/lib/integrations/brand-colors.ts`, y su SVG en
   `apps/web/public/integrations/` si lo hay (si no, se dibuja la inicial).
4. Devolver su `IntegrationHealth` en `getIntegrationsOverviewAction`.
5. Si necesita configuración propia, montarla en la página como cualquier otra.

La pantalla se arma sola con eso. Los tests de
`lib/integrations/__tests__/health.test.ts` fallan si falta alguno de los tres
primeros pasos.
