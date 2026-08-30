# VTurb para OTC — lo que hace falta para la unidad I-6

Responde, una por una, las preguntas que
[`docs/API_DOCS_PENDIENTES.md` §4](../../API_DOCS_PENDIENTES.md) dejó abiertas.
Todo sale del [`openapi.json`](./openapi.json) y de las páginas de esta carpeta.

**Capturado el 2026-08-30.**

---

## 1. URL base y autenticación

| | |
|---|---|
| Server | `https://analytics.vturb.net` |
| `X-Api-Token` | El token de la cuenta. Se genera en `https://app.vturb.com/settings/analytics-api` |
| `X-Api-Version` | `v1` |

Los **dos** headers son obligatorios en todas las llamadas; si falta cualquiera, la
respuesta es `401` ([ref](./pt/01-autenticacao-da-api.md)).

> ⚠️ **Discrepancia de versión.** La página de autenticación dice que
> `X-Api-Version` acepta "actualmente sólo `v1`", pero el spec embebido declara
> `info.version: "v3"`. No hay ningún endpoint que reciba la versión como parámetro,
> así que la lectura razonable es que `v1` es el contrato del header y `v3` el número
> interno del servicio. **Mandar `v1`** y confirmarlo con la primera llamada real.

La autenticación es **por cuenta (company), no por video**: un token ve todos los
players de su company. Para OTC eso significa una API key por organización, guardada
cifrada como las demás integraciones.

---

## 2. Endpoints y nombres de las métricas

Los 28 endpoints están en [`ENDPOINTS.md`](./ENDPOINTS.md); el resumen por familia,
en [`INDEX.md`](./INDEX.md).

Casi todo es `POST` con el filtro en el body (`player_id`, `start_date`, `end_date`,
`timezone`). Las excepciones son `GET`: `/players/list`, `/sessions/live_users` y
`/quota/usage`.

El objeto de métricas agregadas (`Stats`, que devuelven `/sessions/stats` y sus
variantes) trae:

```
total_viewed, total_viewed_device_uniq, total_viewed_session_uniq,
total_started, total_started_device_uniq, total_started_session_uniq,
total_finished, total_finished_device_uniq, total_finished_session_uniq,
total_clicked, total_clicked_device_uniq, total_clicked_session_uniq,
total_over_pitch, total_under_pitch, over_pitch_rate,
engagement_rate, play_rate,
total_conversions, overall_conversion_rate,
total_amount_usd, total_amount_brl, total_amount_eur
```

> ⚠️ **Ninguno de esos campos tiene descripción en el spec.** Los nombres son
> transparentes, pero la semántica exacta (qué cuenta como `viewed` contra `started`,
> si `*_session_uniq` deduplica por sesión o por sesión-y-día) hay que confirmarla
> con datos reales contra el dashboard de VTurb. Es exactamente el caso de la regla 3
> de `CLAUDE.md`: persistir el payload crudo antes de interpretarlo.

---

## 3. Cómo se expresa la retención — **hay curva, no sólo promedio**

Ésta era la pregunta que podía cambiar el diseño de la unidad, y la respuesta es la
buena: **VTurb da las dos cosas**.

**[`POST /times/user_engagement`](./ENDPOINTS.md#post-times-user-engagement)** devuelve:

| Campo | Qué es |
|---|---|
| `average_watched_time` | tiempo promedio visto, en segundos |
| `engagement_rate` | porcentaje — el spec documenta la fórmula: `average_watched_time / video_duration * 100` |
| `grouped_timed[]` | **la curva**: `{ timed, total_users }` — cuántos usuarios llegaron a cada segundo del video |

Request: `player_id` y `video_duration` requeridos, más `start_date`, `end_date` y
`timezone`.

### Cómo caen M10, M11 y M12

| Medida | De dónde sale | Confianza |
|---|---|---|
| **M10** `vsl_plays` | `total_started` de [`/sessions/stats`](./ENDPOINTS.md#post-sessions-stats), o el evento `started` de [`/events/total_by_company`](./ENDPOINTS.md#post-events-total-by-company). Para el ratio ya viene `play_rate` calculado | Alta |
| **M11** `vsl_avg_watch_pct` | `engagement_rate` de `/times/user_engagement` — con la fórmula documentada, es literalmente el % promedio visto | **Alta** |
| **M12** `vsl_reached_cta` | Dos caminos, ver abajo | Media-alta |

**M12 tiene dos caminos, y el segundo es mejor de lo esperado:**

1. *Derivarlo de la curva* — que era el plan: buscar en `grouped_timed` el
   `total_users` correspondiente al segundo del CTA.
2. *Pedirlo directo* — `/sessions/stats` ya devuelve **`total_over_pitch`,
   `total_under_pitch` y `over_pitch_rate`**, y el request de ese endpoint documenta
   `pitch_time` como *"el tiempo en segundos que hay que ver el video para
   considerarlo un pitch"*. O sea que VTurb ya modela el concepto de "llegó a la
   oferta" y lo calcula del lado de ellos.

   Además **`/players/list` devuelve el `pitch_time` configurado de cada player**
   (`0` si no tiene). Eso resuelve también la pregunta de "en qué segundo está el
   CTA": no hay que configurarlo a mano en OTC, se lee de VTurb.

Conviene calcular M12 por el camino 2 y usar la curva como verificación cruzada la
primera vez. Si un player tiene `pitch_time = 0`, `total_over_pitch` no significa
nada y hay que caer al camino 1 con un segundo de CTA configurado en OTC — o marcar
la medida como no disponible, nunca como cero.

Bonus para el mismo embudo:
[`/clicks/total_by_company_timed`](./ENDPOINTS.md#post-clicks-total-by-company-timed)
da los clicks agrupados por segundo del video, y
[`/conversions/video_timed`](./ENDPOINTS.md#post-conversions-video-timed) las
conversiones por segundo.

---

## 4. Cómo se identifica un video

Por **`player_id`** (string), que es el identificador que pide todo endpoint de
métricas.

**[`GET /players/list`](./ENDPOINTS.md#get-players-list)** lista los players de la
cuenta y devuelve por cada uno:

| Campo | Qué es |
|---|---|
| `id` | el `player_id` |
| `name` | nombre del player |
| `duration` | duración del video en segundos — es el `video_duration` que piden los endpoints de retención |
| `pitch_time` | segundo del pitch/CTA, `0` si no está configurado |
| `created_at` | fecha de creación |

Acepta filtros `start_date`/`end_date`, y **`name` + `name_match`**
(`contains` por defecto, o `starts_with` / `ends_with` / `exact`). El filtro por
nombre es case-insensitive y trata `%`, `_`, `\` y los corchetes como literales, así
que **una convención de nombres tipo `[embudo_vsl_x]` en VTurb funciona como llave
de vinculación** entre el player y la instancia de embudo en OTC. El valor buscado
tiene que tener entre 3 y 128 caracteres.

Para atar un player a una instancia de embudo, entonces: guardar el `player_id` en
la configuración de la instancia (explícito y estable), y usar el filtro por nombre
sólo como ayuda de la UI al momento de elegirlo.

---

## 5. Rate limits

**Por plan** ([ref](./pt/00-bienvenida.md)):

| Plan | Requests por minuto |
|---|---|
| Basic | 60 |
| Pro | 120 |
| Scale | 300 |
| Enterprise | 800 (con límites personalizados disponibles) |

Pero el límite real es más fino que eso, y conviene leerlo de la API:
**[`GET /quota/usage`](./ENDPOINTS.md#get-quota-usage)** devuelve el estado en vivo,
una entrada por ventana (típicamente una por minuto y una por día), con
`{ used, limit, remaining }` para dos métricas distintas:

- **`queries`** — la doc avisa que **una sola llamada HTTP puede contar como más de
  una query**, así que este contador sube más rápido que el ritmo de requests.
- **`read_bytes`** — bytes escaneados. La doc lo señala como *"la señal más confiable
  para dimensionar el uso"*.

Cuando una cuota es ilimitada, `limit` y `remaining` vienen en `null` (para no
dividir por cero). Al excederse, la respuesta es `429` con `{ error, code: 201,
details: { limit_kind, used, limit, remaining, interval_seconds, resets_at } }`.
`resets_at` dice cuándo reintentar — usarlo en vez de un backoff a ciegas.

`/quota/usage` cuenta 1 query contra el límite por minuto.

---

## Trampas conocidas, de las release notes

Las [release notes](./en/03-release-notes.md) documentan un bug que estuvo vivo hasta
**2026-05-07** y que conviene conocer:

- **`/headlines/stats_by_player`, `/turbo/stats_by_player` y
  `/smart_autoplays/stats_by_player` ignoraban `end_date`** y devolvían datos desde
  `start_date` hasta "ahora", inflando los totales de cualquier ventana histórica
  corta. Ya está corregido, pero es un recordatorio de que **`end_date` es opcional
  en varios endpoints y omitirlo cambia el significado del resultado**: OTC tiene que
  mandarlo siempre, explícito.
- El límite superior es inclusivo al final del minuto: pasar `23:59:59` captura todo
  el día.

---

## Qué queda por verificar contra una cuenta real

Van al [`PLAN_VERIFICACION.md`](../../PLAN_VERIFICACION.md) cuando se construya I-6:

1. **Que `X-Api-Version: v1` sea efectivamente el valor aceptado**, dada la
   discrepancia con el `info.version: v3` del spec.
2. **La semántica de los campos de `Stats`**, que el spec no describe — en particular
   `viewed` contra `started`, y qué deduplican los sufijos `_device_uniq` y
   `_session_uniq`. Contrastar contra el dashboard de VTurb sobre el mismo período.
3. **Que `total_over_pitch` sea "llegó al CTA"** y no otra cosa: comparar contra
   `grouped_timed` en el segundo `pitch_time` del mismo player y período. Si no
   coinciden, manda la curva.
4. **Si `/smart_autoplays/stats_by_player` existe**: aparece en las release notes pero
   **no está en la referencia de endpoints ni en el spec**. Puede ser un endpoint no
   documentado o uno que se removió.
