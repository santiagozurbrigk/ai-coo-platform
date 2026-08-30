# VTurb Analytics API — índice de la documentación capturada

Copia local de `https://vturb.gitbook.io/analytics-api` (versiones **pt** y **en**),
capturada el **2026-08-30**.

## Archivos

| Archivo | Qué es |
|---|---|
| [`RESUMEN-OTC.md`](./RESUMEN-OTC.md) | **Empezar por acá.** Qué necesita OTC de VTurb para la unidad I-6, con las preguntas de `API_DOCS_PENDIENTES.md` §4 respondidas. |
| [`openapi.json`](./openapi.json) | **Fuente de verdad.** Spec OpenAPI 3.0.2 con los 28 endpoints, reconstruido uniendo los documentos que VTurb embebe uno por endpoint en su página de Analytics. Sirve para generar tipos o un cliente. |
| [`ENDPOINTS.md`](./ENDPOINTS.md) | Referencia legible generada desde ese spec: request body, parámetros y schema de respuesta de cada endpoint. |
| [`llms.txt`](./llms.txt) | Índice que la propia GitBook publica para agentes. |

### Páginas originales

| Portugués (original) | Inglés |
|---|---|
| [Bem-vindo](./pt/00-bienvenida.md) | [Welcome](./en/00-welcome.md) |
| [Autenticação da API](./pt/01-autenticacao-da-api.md) | [API Authentication](./en/01-api-authentication.md) |
| [Analytics](./pt/02-analytics.md) | [Analytics](./en/02-analytics.md) |
| [Release Notes](./pt/03-release-notes.md) | [Release Notes](./en/03-release-notes.md) |

En las páginas de Analytics, el JSON del spec viene minificado en una sola línea
desde la fuente; en esta copia está formateado para poder leerlo.

---

## Lo mínimo para arrancar

```bash
curl -X POST 'https://analytics.vturb.net/times/user_engagement' \
  -H 'X-Api-Token: <token>' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{"player_id":"<id>","video_duration":1800,"start_date":"2026-08-01","timezone":"America/Argentina/Buenos_Aires"}'
```

- **Server:** `https://analytics.vturb.net`
- **Headers obligatorios en todas las llamadas:** `X-Api-Token` y `X-Api-Version`
- **Token:** se genera en `https://app.vturb.com/settings/analytics-api`
- **Rate limit por plan:** Basic 60 · Pro 120 · Scale 300 · Enterprise 800 req/min,
  más un tope diario. [`GET /quota/usage`](./ENDPOINTS.md#get-quota-usage) devuelve
  el consumo en vivo de ambas ventanas.

---

## Los 28 endpoints por familia

| Familia | Endpoints | Para qué |
|---|---|---|
| `players` | `GET /players/list` | Listar los videos de la cuenta, con su `duration` y su `pitch_time` |
| `times` | `/times/user_engagement`, `_by_day`, `_by_field`, `_by_traffic_origin` | **Retención**: promedio, tasa de engagement y curva segundo a segundo |
| `sessions` | `/sessions/stats`, `_by_day`, `_by_field`, `_by_field_by_day`, `GET /sessions/live_users` | Métricas agregadas de sesión (plays, finished, clicks, pitch, conversiones) |
| `events` | `/events/total_by_company`, `_day`, `_players`, `/events/leaderboard` | Conteos por tipo de evento (`started`, `finished`, `viewed`, `clicked`, `paused`) |
| `clicks` | `/clicks/total_by_company_day`, `_timed` | Clicks por día y **clicks por segundo del video** |
| `conversions` | `/conversions/active_platforms`, `/conversions/stats_by_day`, `/conversions/video_timed` | Conversiones por día y por segundo del video |
| `traffic_origin` | `/traffic_origin/stats`, `_by_day`, `/traffic_origin/valid_utms` | Corte por fuente de tráfico y conteo de UTMs |
| `comparison_groups` | `/comparison_groups/list`, `/comparison_groups/stats` | Tests A/B entre players |
| `headlines` / `turbo` | `/headlines/stats_by_player`, `/turbo/stats_by_player` | Datos de los dashboards propios de VTurb |
| `custom_metrics` | `/custom_metrics/list` | Métricas personalizadas del player |
| `quota` | `GET /quota/usage` | Auto-limitarse antes de pedir algo caro |

La tabla completa con paths, métodos y descripciones está en
[`ENDPOINTS.md`](./ENDPOINTS.md#índice).
