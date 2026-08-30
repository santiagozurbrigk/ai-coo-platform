# WebinarJam / EverWebinar para OTC — lo que hace falta para la unidad I-5

Responde, una por una, las preguntas que
[`docs/API_DOCS_PENDIENTES.md` §5](../../API_DOCS_PENDIENTES.md) dejó abiertas.

**Capturado el 2026-08-30** del centro de ayuda de WebinarJam.

---

## Lo esencial

| | |
|---|---|
| Endpoint WebinarJam | `https://api.webinarjam.com/webinarjam` |
| Endpoint EverWebinar | `https://api.webinarjam.com/everwebinar` |
| Auth | `api_key` **en el body del POST**, no en un header. String de 64 caracteres |
| Método | **todo es `POST`**, incluidas las lecturas |
| TLS | obligatorio; las conexiones sin SSL se cortan |
| Rate limit | máximo **20 llamadas por segundo**; pasarse devuelve `429` |
| Aprobación | la API key **requiere aprobación previa** de WebinarJam ([cómo pedirla](./15370143-apply-for-an-api-key-for-webinarjam-or-everwebinar.md)) |

La key es **de cuenta**, no por webinar, y se saca del dashboard en
*Advanced → API custom integration*.

---

## 1. ¿Cuál de los dos usan los clientes? — **no hace falta elegir**

Son **la misma API con dos prefijos**: `/webinarjam/*` para webinars en vivo y
`/everwebinar/*` para automatizados. Los endpoints, los parámetros y los campos de
respuesta son idénticos; sólo cambia el prefijo. Los artículos de EverWebinar repiten
literalmente los de WebinarJam.

Para OTC eso significa que **la integración se construye una vez** y el prefijo es un
parámetro de configuración por instancia de embudo. No hay que averiguar cuál usa cada
cliente antes de construir; sí hay que dejarlo elegible.

---

## 2. Endpoints

| Acción | Path (agregar el prefijo) | Doc |
|---|---|---|
| Listar webinars | `/webinars` | [WJ](./15370149-retrieve-a-full-list-of-all-webinars-published-in-your-account-webinarjam-api.md) · [EW](./15370154-retrieve-a-full-list-of-all-webinars-published-in-your-account-everwebinar-api.md) |
| Detalle de un webinar | `/webinar` | [WJ](./15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api.md) · [EW](./15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api.md) |
| Registrar un usuario | `/register` | [WJ](./15370151-register-a-user-to-a-webinar-webinarjam-api.md) · [EW](./15370156-register-a-user-to-a-webinar-everwebinar-api.md) |
| **Registrantes y asistentes** | `/registrants` | [WJ](./15370152-get-a-list-of-registrants-and-attendees-webinarjam-api.md) · [EW](./15370157-get-a-list-of-registrants-and-attendees-everwebinar-api.md) |
| Dar de baja un lead | `/unsubscribe` | [WJ](./15370153-unsubscribe-leads-from-a-webinar-webinarjam-api.md) · [EW](./15370160-unsubscribe-leads-from-a-webinar-everwebinar-api.md) |

Utilidades: [países y provincias](./15370147-get-a-list-of-countries-and-states-provinces.md),
[formato de hora 12/24 h](./15370146-use-24-hour-or-12-hour-time-format.md),
[campos personalizados en el registro](./15370148-pass-custom-field-values-in-the-registration-api.md).

**`/registrants` es el endpoint que sostiene toda la unidad I-5.** Todo lo de abajo
sale de ahí.

---

## 3. ¿Distingue vivo de replay? — **sí, en columnas separadas**

El documento fuente pide explícitamente *"Showed up (live + replay)"*, y la API lo da
separado:

| Campo | Qué es |
|---|---|
| `attended_live` | estado de asistencia en vivo |
| `date_live` | cuándo vio el vivo |
| `entered_live` | a qué hora entró a la sala |
| `time_live` | **cuánto tiempo estuvo en la sala en vivo** |
| `purchased_live` | si compró en la sala en vivo |
| `revenue_live` | cuánto facturó esa compra |
| `attended_replay`, `date_replay`, `time_replay`, `purchased_replay`, `revenue_replay` | lo mismo para el replay |

Y además se puede filtrar del lado del servidor con el parámetro `attended_live`
(y su gemelo `attended_replay`):

| Valor | Filtra |
|---|---|
| `0` | todos los registrantes |
| `1` | asistieron al vivo |
| `2` | no asistieron al vivo |
| `3` | asistieron y **se fueron antes** de `attended_live_timestamp` |
| `4` | asistieron y **se fueron después** de `attended_live_timestamp` |

**M13** (`webinar_registrants`) = todos, por `signup_date`.
**M14** (`webinar_attendees`, vivo + replay) = `attended_live=1` unido a `attended_replay=1`.

---

## 4. Stick rate (M15) — **sí, y mejor de lo esperado**

Era la pregunta con más riesgo: *"si hay dato de hasta qué minuto se quedó cada
asistente — es lo único con lo que se puede calcular el stick rate"*.

Hay **dos** formas, y conviene usar la segunda:

1. **Por registrante**: `time_live` / `time_replay` traen el tiempo que estuvo en la
   sala. Sirve para calcular la distribución completa del lado de OTC.
2. **Directo del servidor**: `attended_live=4` con
   `attended_live_timestamp = <segundo de la oferta>` devuelve exactamente
   *"los que asistieron y se fueron después de ese segundo"*. Eso **es** M15
   (`webinar_stayed_to_pitch`), sin tener que procesar la lista entera.

El segundo del pitch no lo da la API — es una configuración de la instancia de embudo
en OTC. (Contraste con VTurb, que sí publica el `pitch_time` de cada player.)

---

## 5. Clicks al CTA (M16) — **no está expuesto**

`webinar_cta_clicks` **no se puede leer de esta API**. Lo más cercano que hay es
`purchased_live` / `purchased_replay` (si compró en la sala) y `revenue_live` /
`revenue_replay` (cuánto), que son **conversión, no intención**.

Para el embudo de webinar eso significa que el paso *Intent — "Clicked CTA"* queda sin
fuente propia: se puede mostrar la compra en sala como su sustituto, **etiquetado como
tal**, o dejar M16 como no disponible. Lo que no hay que hacer es presentar
`purchased_live` como si fuera clicks al CTA.

---

## 6. Datos extra que sirven para el embudo

`/registrants` devuelve además, por registrante:

- **UTMs completos**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
  `utm_content`. Eso permite atar el registro a la fuente sin depender de Hyros para
  este paso.
- Identidad y contacto: `first_name`, `last_name`, `email`, `phone`,
  `phone_country_code`, `ip`.
- `signup_date`, `webinar`, `schedule`.
- GDPR: `gdpr_status`, `gdpr_communications`, `gdpr_status_date`, `gdpr_status_ip`,
  `twilio_consented_at`.
- Links por registrante: `live_room`, `replay_room`, `unsubscribe`.

Filtros útiles: `purchased` (0 todos / 1 compró / 2 no compró), `date_range`
(0 all-time … 8 últimos 30 días), `search`, `page`.

> ⚠️ **Los campos marcados con `*` sólo vuelven si están habilitados en la
> configuración de ese webinar.** `last_name`, `phone` y `phone_country_code` entre
> ellos. No asumir que están.

---

## Detalle de modelado: `schedule` vs sesión individual

Un `schedule_id` puede referirse a **una serie entera** de webinars, y todas las
sesiones de la serie comparten el mismo id. Para apuntar a una sesión concreta hay que
usar el parámetro `date_range` (en `/registrants`) o el campo `date` (en `/register`).

Consecuencia para OTC: **una instancia de embudo no se identifica sólo con
`schedule_id`**. Hay que guardar `webinar_id` + `schedule_id` + la fecha de la sesión.

---

## Qué queda por verificar contra una cuenta real

Va al [`PLAN_VERIFICACION.md`](../../PLAN_VERIFICACION.md):

1. **Conseguir la API key**, que requiere aprobación previa de WebinarJam — es el
   primer bloqueo y conviene pedirla antes de empezar a construir.
2. **En qué unidad viene `time_live`** (la doc lo declara `string`, sin decir si son
   segundos, `mm:ss` o `hh:mm:ss`).
3. **Qué devuelve `attended_live` como valor de respuesta** — el parámetro de filtro
   usa 0-4, pero el campo de respuesta se declara `integer` sin tabla de valores.
4. **Si `revenue_live` viene con símbolo de moneda** (se declara `string`, no `number`).
5. **Cuál de los dos productos usa cada cliente**, para configurar el prefijo.
