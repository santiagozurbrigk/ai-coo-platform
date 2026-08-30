# PLAN_VERIFICACION.md — Qué probar cuando esté todo construido

> **Para Santiago:** el módulo de Embudos se está construyendo sin poder conectar
> cuentas reales ni leer las documentaciones de las APIs. Este documento acumula
> **todo lo que hay que verificar a mano**, en orden, para hacer una sola pasada
> completa al final.
>
> **Para Claude Code:** ver la regla al final. Cada unidad que construyas suma su
> bloque de verificación acá, con pasos concretos y resultado esperado.
>
> **Última actualización:** 2026-08-30 · Cubre hasta la ola 1 completa

---

## Cómo usar este documento

Cada bloque tiene **qué hacer**, **qué tendría que pasar** y **qué significa si
falla**. Los bloques están ordenados por dependencia: el 0 antes que todos, y
después cada unidad.

Marcá con ✅ lo que va pasando. Lo que falle, anotalo con el error textual — la
mayoría de las fallas esperadas son de mapeo de campos y se corrigen mirando el
dato crudo.

### Leyenda

| Símbolo | Significa |
|---|---|
| 🔑 | Necesita credenciales o una cuenta real |
| 🤖 | Se puede verificar sin cuentas, sólo con la app |
| ⚠️ | Falla probable: es de las cosas construidas a ciegas |

---

## 0. Prerrequisitos

🔑 **Antes de empezar, tener a mano:**

- [ ] Cuenta de **Whop** con permisos para crear webhooks
- [ ] Cuenta de **Fanbasis** con permisos para crear webhooks
- [ ] Cuenta de **VTurb** con al menos un video con reproducciones
- [ ] Cuenta de **Hyros** con datos de al menos 30 días
- [ ] Acceso a **GHL** con al menos un pipeline y oportunidades
- [ ] Cuenta de **WebinarJam o Zoom** con un webinar ya realizado
- [ ] `CRON_SECRET` y `NEXT_PUBLIC_APP_URL` de producción
- [ ] `ENCRYPTION_MASTER_KEY` configurada (si no, la conexión de pagos falla al cifrar)

🤖 **Estado de la app:**

- [ ] Migraciones aplicadas: `funnel_instances`, `funnel_step_bindings`, `funnel_benchmarks`, `funnel_period_snapshots`, `ad_metrics_daily`, `payment_integrations`, `payment_orders`, `payment_transactions`, `payment_webhook_events`
- [ ] Add-on `embudos` activado para la org de prueba desde super-admin
- [ ] La org de prueba tiene **Zernio conectado** (lo necesita I-1)

---

## 1. Módulo de Embudos — comportamiento base

🤖 No necesita ninguna cuenta externa.

### 1.1 El módulo aparece

| Paso | Resultado esperado |
|---|---|
| Entrar a la app con el add-on `embudos` activo | "Embudos" aparece en el sidebar con icono de filtro |
| Desactivar el add-on y recargar | Desaparece del sidebar |
| Con el add-on desactivado, ir a `/funnels` por URL | No debería mostrar datos de la org |

### 1.2 Crear un embudo

| Paso | Resultado esperado |
|---|---|
| Ir a `/funnels` sin ningún embudo creado | Empty state, no una tabla vacía |
| Crear uno de tipo **DM**, precio 5000, moneda USD | Redirige al detalle |
| Volver a `/funnels` | La tarjeta muestra nombre, tipo y precio formateado |
| Crear uno de tipo **Webinar** y otro **VSL** | Los tres conviven sin pisarse |

### 1.3 El spine y sus tres estados ⭐

Es lo más importante de verificar, porque es la regla que sostiene todo el módulo.

| Paso | Resultado esperado |
|---|---|
| Abrir el detalle de un embudo recién creado | Se ven las **7 etapas** del spine |
| Mirar la etapa **Spend** | Dice **"no aplica"** en gris — ninguna plantilla la usa |
| Mirar la etapa **Lead** en el embudo **VSL** | También **"no aplica"** — el VSL no tiene opt-in |
| Mirar las demás etapas sin datos | Dicen **"sin datos"** en ámbar, con icono de alerta |
| Verificar que **ninguna** diga `0` | ⭐ Si aparece un `0` donde no hay datos, es el bug que todo el diseño quiere evitar |
| Mirar el paso "Trigger (comment / story / ad)" del DM | Columna Origen dice **"Sin fuente"** en ámbar |
| Mirar el aviso arriba de la tabla | Lista las integraciones que faltan |

### 1.4 Períodos

| Paso | Resultado esperado |
|---|---|
| Cambiar entre 7d / 30d / 90d | La URL cambia a `?period=7d` y el rango de fechas mostrado también |
| Copiar la URL con período y abrirla en otra pestaña | Muestra el mismo período |
| Recargar | Mantiene el período |

### 1.5 Configurar fuentes

| Paso | Resultado esperado |
|---|---|
| Ir a "Configurar fuentes" desde el detalle | Una fila por paso, con su etapa y su métrica |
| Ver la columna "Según el estándar" | Dice qué herramienta le asigna el documento a ese paso |
| Cambiar la fuente de un paso | Se guarda solo, aparece el tilde verde |
| Poner un paso en **"Sin fuente"** | Vuelve al detalle y ese paso dice "sin datos" |
| Intentar una fuente incompatible con la etapa | El select no debería ni ofrecerla |

### 1.6 Aislamiento entre organizaciones 🔒

| Paso | Resultado esperado |
|---|---|
| Crear un embudo en la org A | — |
| Entrar con un usuario de la org B a `/funnels` | **No** ve el embudo de A |
| Con el usuario de B, abrir la URL del embudo de A | 404, no los datos |

---

## 2. I-1 — Métricas de anuncios

🔑 Necesita Zernio conectado con anuncios activos.

| Paso | Resultado esperado |
|---|---|
| Correr el cron a mano: `curl -X POST "$APP_URL/api/cron/capture-ad-metrics" -H "Authorization: Bearer $CRON_SECRET"` | JSON con `ok: true` y `captured > 0` |
| Correrlo **sin** el header de autorización | 401 |
| Consultar `ad_metrics_daily` en Supabase | Una fila por anuncio del día anterior |
| ⚠️ Comparar el `spend` de una fila contra el panel de Meta | **Deberían coincidir.** Si difiere por un factor de 100, el monto viene en centavos y hay que ajustar el mapeo |
| Verificar `impressions`, `reach` y `clicks` | Coherentes con Meta |
| Correr el cron dos veces para el mismo día | No duplica filas — hace upsert |
| Rellenar un día pasado con `?date=YYYY-MM-DD` | Captura ese día |
| Abrir un embudo Webinar o VSL | La etapa **Click** ya muestra un número |

---

## 3. I-2 — Pagos con Whop y Fanbasis ⚠️

🔑 **Es el bloque con más probabilidad de fallar**, porque el mapeo de campos se
construyó sin poder leer las documentaciones. Ver `docs/API_DOCS_PENDIENTES.md`.

### 3.1 Conectar

| Paso | Resultado esperado |
|---|---|
| Ir a `/integrations` y bajar hasta "Pagos" | Dos tarjetas: Whop y Fanbasis, ambas "Sin conectar" |
| Click en Conectar, dejar el secreto vacío y enviar | El botón está deshabilitado |
| Pegar el webhook secret de Whop y conectar | Estado pasa a "Conectado" y aparece la URL del webhook |
| Copiar la URL con el botón | Va al portapapeles |
| Verificar la fila en `payment_integrations` | `webhook_secret_encrypted` **no** está en texto plano |

### 3.2 Recibir eventos

| Paso | Resultado esperado |
|---|---|
| Registrar la URL copiada en el panel de Whop | — |
| Hacer una **compra de prueba** | — |
| Consultar `payment_webhook_events` | Una fila con el payload crudo |
| ⚠️ Mirar la columna `status` | Si dice `processed`, el mapeo acertó. Si dice `unmapped`, hay que corregirlo |
| ⚠️ Si quedó `unmapped`, leer `error_message` y el `payload` | Dice exactamente qué no se pudo leer |
| Corregir `lib/payments/normalize.ts` con los nombres reales | — |
| Actualizar `lib/payments/__tests__/normalize.test.ts` con el payload real | — |

### 3.3 Verificar los números

| Paso | Resultado esperado |
|---|---|
| Consultar `payment_transactions` | Una fila con `kind='payment'` y el monto correcto |
| ⚠️ Comparar el monto contra el dashboard de Whop | Si difiere ×100, es centavos |
| Consultar `payment_orders` | ⭐ `contract_value` es el **total contratado**, no la cuota pagada |
| Hacer un **reembolso de prueba** | Fila con `kind='refund'` y monto **positivo** |
| Verificar el neto en el embudo | Cash collected = pagos − reembolsos |

### 3.4 Seguridad del webhook 🔒

| Paso | Resultado esperado |
|---|---|
| `curl -X POST "$APP_URL/api/webhooks/whop?organizationId=<uuid>" -d '{}'` sin firma | **401** |
| Enviar con una firma inventada | **401** |
| Enviar sin `organizationId` | **400** |
| ⚠️ Repetir todo con Fanbasis | Su esquema de firma es el menos confiable de todo lo construido: si rechaza un webhook legítimo, revisar el nombre de la cabecera |

### 3.5 Desconectar

| Paso | Resultado esperado |
|---|---|
| Desconectar Whop | Estado "Sin conectar", secretos borrados |
| Consultar `payment_orders` y `payment_transactions` | ⭐ **Las filas siguen ahí** — son historia del negocio |

---

## 4. I-3 — Detección de fuente vacía ⭐

🔑 Necesita una org con llamadas de cierre reales.

Es la regla que evita que el módulo confunda "no pasó nada" con "nadie lo cargó".

| Paso | Resultado esperado |
|---|---|
| Org con llamadas en el período, **todas en `scheduled`** | Show rate y Close rate dicen **"sin datos"**, no `0%` |
| Marcar **una** llamada como `no_show` | Ahora sí muestra `0%` de asistencia — hay señal, el cero es real |
| Marcar una como `closed` | Show rate y Close rate muestran números |
| Org **sin ninguna** conversación jamás | La etapa Lead dice "sin datos" |
| Org **con** conversaciones históricas pero ninguna en el período | Muestra `0`, que es un cero real |

---

## 5. Unidades pendientes

Se completa a medida que se construyen.

- [ ] **I-4** — GHL opportunities *(pendiente de la documentación: ¿hay historial de cambios de etapa?)*
- [ ] **I-6** — VTurb *(pendiente de la documentación: ¿la retención es promedio o curva?)*
- [ ] **I-5** — WebinarJam / Zoom
- [ ] **I-9** — Retención y compras repetidas
- [ ] **I-8** — Hyros *(incluye los opt-ins de landings)*
- [ ] **I-10** — Triggers de Zernio

---

## 6. Verificación final, con todo conectado

Cuando estén todas las unidades y todas las cuentas conectadas:

| Paso | Resultado esperado |
|---|---|
| Abrir el embudo **DM** con datos reales | Las 6 etapas con números, ninguna "sin datos" |
| Abrir el **Webinar** | Las 7 filas con números |
| Abrir el **VSL** | Lead sigue diciendo "no aplica"; el resto con números |
| Verificar las tasas entre etapas | Ninguna supera 100% — si pasa, hay un denominador mal atado |
| ⭐ Comparar contra los rangos del documento | Los números deberían caer cerca de las bandas de la sección 02 |
| Contrastar el cash collected contra el dashboard del proveedor | Deberían coincidir |
| Cambiar de período y verificar que todo se mueva junto | — |
| Un embudo con dos ofertas de precio muy distinto | El spend es de la org entera hasta que esté Hyros — no confundir |

---

## Regla permanente para Claude Code

> Cada vez que construyas una unidad de integración o una feature que **no puedas
> verificar en el momento** (falta una cuenta, una credencial o la documentación):
>
> 1. Sumá su bloque a este documento, con pasos concretos y resultado esperado.
> 2. Marcá con ⚠️ los pasos con probabilidad alta de fallar, y por qué.
> 3. Marcá con 🔒 los que verifican seguridad — RLS, firmas, autorización de crons.
> 4. Marcá con ⭐ los que verifican una regla de diseño central, no sólo que ande.
> 5. Registrá también en `CHANGES.md` que la unidad quedó sin verificación real.

---

*Creado 2026-08-30. Documento vivo: crece con cada unidad construida y se tacha a
medida que se verifica.*
