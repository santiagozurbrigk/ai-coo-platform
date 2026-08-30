# API_DOCS_PENDIENTES.md — Documentaciones que hay que verificar

> **Para Santiago:** esta es la lista de todo lo que se implementó **sin poder leer
> la documentación oficial de la API**. Al terminar las olas de integración, pasame
> estas documentaciones y se corrige todo junto.
>
> **Para Claude Code:** ver la regla al final. Cada vez que implementes contra una
> API cuya documentación no puedas leer, **agregá una entrada acá**.

---

## Por qué existe este archivo

Ningún dominio de documentación de API es alcanzable desde el entorno de
desarrollo remoto: la política de red los bloquea a todos. Verificado el
2026-08-29 contra `docs.whop.com`, `apidocs.fan`, `vturb.gitbook.io`,
`api-docs.hyros.com`, `docs.hyros.com`, `highlevel.stoplight.io`,
`marketplace.gohighlevel.com`, `developers.zoom.us` y `help.webinarjam.com` —
**los nueve bloqueados**.

Eso no impide construir, pero cambia **cómo** hay que construir. El patrón que se
sigue en todas estas integraciones:

1. **Persistir el payload crudo antes de interpretarlo.** El primer evento real de
   cada proveedor pasa a ser la fuente de verdad.
2. **Nunca inventar un valor.** Lo que no se entiende queda marcado como no
   mapeado, con su motivo. Un cobro cuyo monto no se lee **no es un cobro de cero**.
3. **Aislar el mapeo en un solo archivo** por proveedor, con la advertencia en el
   encabezado, para que corregirlo sea puntual y no una arqueología.
4. **Dejar la entrada acá** con qué falta exactamente.

---

## Estado

| Proveedor | Unidad | Estado del código | Qué falta verificar |
|---|---|---|---|
| **Whop** | I-2 | Construido | Eventos, payloads, firma |
| **Fanbasis** | I-2 | Construido | Eventos, payloads, **esquema de firma** |
| **GHL opportunities** | I-4 | Sin empezar | Endpoints de pipelines y oportunidades |
| **VTurb** | I-6 | Sin empezar | Endpoints de analytics, nombres de métricas |
| **WebinarJam / Zoom** | I-5 | Sin empezar | Todo |
| **Hyros** | I-8 | Sin empezar | Endpoints, atribución, rate limits |

---

## 1. Whop — unidad I-2

**Documentación:** https://docs.whop.com/ · https://api-docs.hyros.com/ (bloqueadas)  
**Archivos a corregir:** `apps/web/lib/payments/normalize.ts`, `apps/web/lib/payments/verify-signature.ts`, `apps/web/app/api/webhooks/whop/route.ts`

### Qué se asumió

| Asunción | Confianza | Cómo se verifica |
|---|---|---|
| Firma con [Standard Webhooks](https://www.standardwebhooks.com/): cabeceras `webhook-id`, `webhook-timestamp`, `webhook-signature`, HMAC-SHA256 base64 de `{id}.{timestamp}.{body}` | **Alta** — es una spec pública y la documentación de Whop declara usarla | Un webhook real que pase la verificación |
| El secreto puede venir con prefijo `whsec_` y base64 | Media | Idem |
| Los eventos de cobro matchean `/payment.*(succe\|complet\|paid)/i` | **Baja** | Ver `event_type` en `payment_webhook_events` |
| Los eventos de orden matchean `/membership.*(went_valid\|created\|activat)/i` | **Baja** | Idem |
| El payload viene anidado bajo `data` u `object` | Media | Ver el payload crudo |
| Nombres de campo: `amount`, `currency`, `user_id`, `email`, `membership_id`, `created_at` | **Baja** | Ver el payload crudo |
| Los montos podrían venir en centavos (claves `*_cents`) | Media | Comparar un cobro real contra el dashboard de Whop |

### Qué necesito de la documentación

1. Lista completa de tipos de evento de webhook.
2. Payload exacto de: cobro exitoso, reembolso, y creación/activación de membresía.
3. Confirmación del esquema de firma y del formato del secreto.
4. Si los montos vienen en centavos o en unidades, y en qué campo.
5. Endpoints REST para hacer *backfill* histórico (hoy sólo se reciben webhooks, así que no hay historia previa a la conexión).

---

## 2. Fanbasis — unidad I-2

**Documentación:** https://apidocs.fan/ (bloqueada)  
**Archivos a corregir:** los mismos que Whop.

### Qué se asumió

| Asunción | Confianza | Cómo se verifica |
|---|---|---|
| Firma HMAC-SHA256 sobre el cuerpo crudo, en hex o base64 | **Baja** | Un webhook real |
| La cabecera de firma es una de `x-fanbasis-signature`, `x-signature`, `x-webhook-signature`, `signature` | **Baja** | Ver las cabeceras de un webhook real |
| Mismos nombres de campo y tipos de evento que Whop | **Muy baja** | Ver el payload crudo |

### Qué necesito de la documentación

1. **El esquema de firma y el nombre exacto de la cabecera.** Es lo más importante: sin esto la ruta rechaza todo.
2. Lista de eventos de webhook y sus payloads.
3. Endpoints REST de transacciones y suscripciones, para backfill.
4. Cómo modela el plan de pagos: hace falta el **valor contratado total**, no sólo cada cuota.

---

## 3. GHL — oportunidades y pipelines (unidad I-4, la siguiente)

**Documentación:** https://highlevel.stoplight.io/ · https://marketplace.gohighlevel.com/ (bloqueadas)

**Contexto:** la integración GHL de OTC ya existe y consume `/calendars` y
`/contacts` (`apps/web/lib/ghl/client.ts`), así que la autenticación con Private
Integration Token ya está resuelta y verificada en producción. Lo que falta son
los endpoints de oportunidades.

### Qué necesito

1. Endpoint para listar **pipelines** de una location y sus **etapas**.
2. Endpoint para listar **oportunidades**, con filtro por rango de fechas y por etapa.
3. Nombres de campo de una oportunidad: id, contacto, pipeline, etapa, valor monetario, fechas de creación y de cambio de etapa.
4. Si existe **historial de cambios de etapa**. Es clave: el documento pide conteos por etapa en un período, y sin historial sólo se puede saber en qué etapa está una oportunidad **hoy**, no cuántas pasaron por cada etapa durante el período.
5. Paginación y rate limits.

---

## 4. VTurb (unidad I-6)

**Documentación:** https://vturb.gitbook.io/analytics-api · https://help.vturb.com/ (bloqueadas)

**Lo que se sabe por búsqueda:** hay una Analytics API pública con autenticación
por API key, con endpoints de plays, views y retención, filtrables por video,
rango de fechas y fuente de tráfico.

### Qué necesito

1. URL base y formato exacto de la autenticación.
2. Endpoints y nombres de las métricas.
3. **Cómo se expresa la retención**: ¿un promedio, o una curva por segundo? El documento pide `avg watch %` (M11) y "llegaron al CTA" (M12); M12 sólo se puede derivar si hay curva y se sabe en qué segundo está el CTA.
4. Cómo se identifica un video, para poder atarlo a una instancia de embudo.
5. Rate limits.

---

## 5. WebinarJam / Zoom (unidad I-5)

**Documentación:** https://help.webinarjam.com/ · https://developers.zoom.us/docs/api/ (bloqueadas)

### Qué necesito

1. **Cuál de los dos usan los clientes** — puede que ni haga falta la otra.
2. Endpoints de registrantes y asistentes por webinar.
3. Si se distingue **asistencia en vivo de replay**: el documento dice explícitamente "Showed up (live + replay)".
4. Si hay dato de **hasta qué minuto se quedó cada asistente** — es lo único con lo que se puede calcular el stick rate (M15).
5. Si se registran los **clicks al CTA** durante el webinar (M16).
6. Autenticación y rate limits.

---

## 6. Hyros (unidad I-8)

**Documentación:** https://api-docs.hyros.com/ · https://docs.hyros.com/ · https://hyros.docs.apiary.io/ (bloqueadas)

**Lo que se sabe por búsqueda:** REST API con auth por API key. Endpoints de
leads (con journeys), sales, orders y subscriptions.

### Qué necesito

1. URL base y autenticación.
2. Endpoint de leads con filtro por fecha, y qué trae el **journey** de un lead.
3. Cómo se pide el **revenue atribuido por fuente** (M05) — que es el punto de toda la integración.
4. Qué identifica una "fuente": ¿campaña, anuncio, keyword?
5. Si los opt-ins de landing se pueden leer desde acá (M08 y M09 dependen de esto — ver §8 del mapa de fuentes).
6. Rate limits y si hay webhooks además de la API REST.

---

## Regla permanente para Claude Code

> Cada vez que implementes contra una API externa **cuya documentación oficial no
> puedas leer**:
>
> 1. Agregá o actualizá su sección en este archivo, con **qué asumiste**, con qué
>    confianza, y **qué necesitás de la documentación**.
> 2. Poné la advertencia en el encabezado del archivo que hace el mapeo.
> 3. Persistí el payload crudo antes de interpretarlo, para que el primer dato real
>    sea la fuente de verdad.
> 4. Nunca inventes un valor: lo que no se entiende queda marcado, no vale cero.
> 5. Registralo también en `CHANGES.md` como deuda.

---

*Creado 2026-08-29. Actualizar con cada integración construida a ciegas; borrar la
sección cuando la documentación se haya verificado y el mapeo corregido.*
