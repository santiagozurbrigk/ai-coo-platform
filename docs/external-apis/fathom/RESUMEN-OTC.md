# Fathom — lo que OTC necesita

> Documentación bajada el **2026-09-01** desde `developers.fathom.ai`, en el
> formato markdown que el sitio publica en [`llms.txt`](./llms.txt). 39 archivos.
> Reproducir con `docs/external-apis/tools/fathom-urls.txt`.

**Base URL:** `https://api.fathom.ai/external/v1` · **Auth:** API key o Bearer.

---

## El hallazgo que cambia el diseño del módulo de llamadas

OTC clasifica las llamadas leyendo el **título**. El 86% de los títulos reales
son `"Impromptu Google Meet Meeting"`, así que la clasificación no tiene de dónde
agarrarse y la asociación a cliente falla en el 100% de los casos.

**La API ya devuelve lo que hace falta, y OTC lo está descartando.**
`lib/fathom/api.ts` parsea sólo título, fechas y transcript; todo lo demás de la
respuesta se tira.

### `GET /meetings` — campos que hoy no se leen

| Campo | Qué resuelve |
|---|---|
| `calendar_invitees[]` | **Identidad**. Array de invitados del calendario. Está en el `required` del schema: viene siempre. |
| `calendar_invitees[].email` | Match directo contra `closing_calls.lead_email` y contra clientes. No depende de cómo esté escrito el nombre. |
| `calendar_invitees[].is_external` | **Interna vs. externa**, dado por la API. Una reunión sin invitados externos es del equipo, sin heurística. |
| `calendar_invitees[].email_domain` | Agrupar por empresa. |
| `calendar_invitees[].name` | Desempate cuando el email no resuelve. |
| `meeting_type` | **Propósito**, configurado por la org en Fathom. Filtrable por query param. |
| `scheduled_start_time` | Match por ventana horaria contra `closing_calls.scheduled_at`. |

### `GET /meeting_types`

Lista los tipos de reunión de la organización (`active` e `inactive`). Los
valores que devuelve son los que acepta el filtro `meeting_type` de `/meetings`.

**Esto es mejor que la convención de nombres que se había pensado.** En vez de
que el closer escriba `"Llamada de venta - Mariano"` después de cada llamada, la
org mapea una vez, en configuración, qué tipo de reunión de Fathom corresponde a
venta, a entrega y a equipo. Deja de depender de que alguien escriba bien.

La convención de nombres sigue sirviendo como respaldo para las reuniones
improvisadas, que son las que no tienen tipo asignado.

### Otros filtros útiles de `/meetings`

- `calendar_invitees_domains[]` — filtra por dominio de la empresa invitada.
- `calendar_invitees_domains_type` — filtra por si la lista de invitados incluye
  dominios externos.

---

## Endpoints

| Método | Path | Uso en OTC |
|---|---|---|
| GET | `/meetings` | Sync principal. **Hoy se ignoran `calendar_invitees` y `meeting_type`.** |
| GET | `/meeting_types` | Sin usar. Base del mapeo tipo → propósito de la Fase 1. |
| GET | `/recordings/{id}/summary` | Resumen. Acepta `destination_url` para modo asíncrono. |
| GET | `/recordings/{id}/transcript` | Transcript. Mismo modo asíncrono. |
| POST | `/webhooks` | Alta de webhook. Requiere al menos uno de `include_transcript`, `include_crm_matches`, `include_summary`, `include_action_items`. |
| DELETE | `/webhooks/{id}` | Baja. |
| GET | `/teams`, `/team_members`, `/users` | Sin usar. `users` trae permisos. |
| POST | `/recordings/{id}/download` | Genera archivo descargable; se consulta con `download_id`. |

---

## Qué queda por verificar contra una cuenta real

- **Que `calendar_invitees` venga poblado en las reuniones improvisadas.** El
  schema lo marca requerido, pero una reunión sin evento de calendario podría
  traer el array vacío. Es justo el 86% del volumen actual.
- **Que las orgs tengan tipos de reunión configurados.** Si nadie los usa en
  Fathom, `meeting_type` viene `null` y el mapeo no tiene de dónde partir.
- **Si el payload del webhook trae los mismos campos que `/meetings`.** El
  markdown de `new-meeting-content-ready` no detalla el cuerpo. Si no los trae,
  el webhook sigue necesitando la consulta posterior que ya hace el pipeline.
