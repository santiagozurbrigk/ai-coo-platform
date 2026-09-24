# Clientes — add-on `growth_partners`

> Verificado contra el código el 2026-09-23 (commit 038caca). Backlog: `PENDIENTES.md` § Clientes.
> Parte del área Clientes; la visión general está en [`clientes.md`](./clientes.md).

## Qué es

Funciones hechas para Limitless como organización cliente de su propio producto: su cliente es un **growth partner**
que trabaja con varios **infoproductores** («creadores»). El add-on agrega:

- **Clientes de clientes** (`client_sub_clients`): los creadores de cada growth partner, con sus datos de Marketing,
  Ventas, Sistemas y Onboarding.
- **Facturación del negocio del cliente** (`client_revenue_entries`): cuánto factura por mes. **No** es lo que nos paga.
- **Onboarding por link**: formulario público, uno por creador más un link general con bandeja «sin asignar».
- **Señales en la lista**: «Sin novedades Nd» y alertas de fechas próximas de los creadores (ej. próximo lanzamiento).

**Qué NO hace:** sin el add-on nada de esto se ve ni se puede escribir. No manda avisos al equipo cuando alguien
completa el formulario (`[ONBOARDING-CLIENTES-RESTO]`).

**Quién lo tiene:** la migración `20260923100000_clientes_de_clientes.sql` lo prendió sólo para la organización cuyo
perfil es `limitless@limit-less.llc`. Se prende/apaga desde Super Admin (`organizations.enabled_add_ons`).

## Pantallas y rutas

| Dónde | Archivo | Qué muestra |
|---|---|---|
| Ficha → tarjeta «Clientes» | `components/clients/client-sub-clients-card.tsx`, `section-fields-panel.tsx`, `sub-client-onboarding.tsx` | Pastillas por creador, link de Instagram, solapas Marketing/Ventas/Sistemas/Onboarding con contador `n/m`, link de onboarding (generar/copiar/desactivar) e historial de envíos. Aviso para mover valores de sección que quedaron cargados en el growth partner |
| Ficha → «Facturación del negocio» | `components/clients/client-revenue-card.tsx` | Último mes, variación contra el mes anterior registrado, mejor mes, línea de tendencia |
| `/clients` | `components/clients/clients-list.tsx`, `client-onboarding-inbox.tsx` | Columna Facturación; marcas «Sin novedades Nd» y «Próximo lanzamiento · creador · faltan N días»; pastillas de filtro; tarjeta «Onboarding para clientes nuevos» (link general + bandeja) |
| `/clients/campos` | `components/clients/custom-fields/custom-fields-page.tsx` | «Cargar plantilla» (22 campos: Marketing 7, Ventas 7, Sistemas 8), «Preguntas del onboarding» (86 campos) y el umbral de silencio |
| `/onboarding-cliente/[token]` | `app/onboarding-cliente/[token]/page.tsx`, `components/client-onboarding/onboarding-form.tsx` | Formulario público, por pasos, sin sesión y sin el layout de la landing (no carga el píxel de Meta). `robots: noindex` |

`lib/supabase/public-paths.ts` deja pasar `/onboarding-cliente/*` sin sesión.

## Modelo de datos

Aplicadas en producción: `20260921120000`, `20260923100000`, `20260923140000`.

| Tabla | Columnas clave | RLS / reglas |
|---|---|---|
| `client_sub_clients` | `client_id` (growth partner, cascade), `name` (1–200), `instagram_url` (≤500), `custom` jsonb (claves de `field_definitions` `entity='client'`), `created_by` | CRUD por org |
| `client_revenue_entries` | `client_id`, `amount` (≥0, `numeric(14,2)`), `currency` (`USD`/`ARS`), `period` (fecha, día 1), `note`, `recorded_by` | CRUD por org. **Único `(client_id, period)`** → guardar es upsert |
| `client_onboarding_links` | `kind` (`creator`/`general`), `client_id` + `sub_client_id` (ambos en `creator`, ninguno en `general`), `token` (32–128, único), `revoked_at` | Select/insert/update por org (sin delete). Un link activo por creador y uno general por org (índices únicos parciales) |
| `client_onboarding_submissions` | `client_id`, `sub_client_id` (ambos o ninguno), `link_id`, `respondent_name`, `creator_name`, `answers`, `replaced` (lo que había antes en los campos que cambiaron), `labels` (etiqueta de cada campo al momento del envío), `assigned_at/by`, `discarded_at` | **Sólo policy de select.** Todas las escrituras van con service role desde el servidor |
| `organizations.client_silence_days` | int 1–365, default 15 | Lo escribe `setClientSilenceDaysAction` (founder) con admin |
| RPC `client_last_activity(p_org)` | Última novedad por cliente entre 8 fuentes: alta, nota, satisfacción, timeline, llamada, Discord (sin mensajes atribuidos sólo por canal), onboarding, win | `security definer`; **execute sólo para `service_role`**. La llama `getClientSignalsAction` con la org de la sesión |
| `field_definitions.section` / `.onboarding` | Ver [`clientes-recorrido-y-wins.md`](./clientes-recorrido-y-wins.md) | |

## Cómo fluye el dato

```
Equipo (con sesión)                                   Creador (sin sesión)
sub-client-actions.ts   create/update/fields/delete   /onboarding-cliente/<token>
onboarding-link-actions createOnboardingLinkAction      loadOnboardingByToken (admin):
   token = randomBytes(24).base64url                      link vivo + org con add-on + creador existe
   (devuelve el activo si ya hay uno)                     si falla algo → "link no activo" (no dice qué)
                                                       submitClientOnboardingAction:
                                                         rate limit 10 envíos / 10 min por IP
                                                         valida contra las preguntas de la base
                                                         ├ link general → insert submission (bandeja)
                                                         └ link creador → insert submission (con replaced)
                                                                        → update client_sub_clients.custom
                                                                        → client_timeline_entries del growth partner
Bandeja: assignOnboardingSubmissionAction (crea growth partner y/o creador si hace falta, aplica igual que el link)
         discardOnboardingSubmissionAction (marca discarded_at, no borra)
Lista:   getClientSignalsAction → RPC client_last_activity + fechas con aviso de los creadores
```

| Pieza | Dónde |
|---|---|
| Qué es pregunta y en qué paso, visibilidad condicional (`showIf`), validación, aplicar respuestas, precarga | `lib/client-onboarding/form.ts`, `steps.ts` |
| Plantilla de 86 preguntas (claves `onb_*`) | `lib/client-onboarding/questions.ts` → `seedOnboardingQuestionsAction` |
| Plantilla de 22 campos de sección | `seedLimitlessClientFieldsAction` en `app/clients/custom-field-actions.ts` |
| Growth partner nuevo desde la bandeja (`pending_onboarding`, monto 0) | `lib/client-onboarding/assign.ts` |
| Silencio y alertas de fecha | `lib/clients/signals.ts`, `lib/custom-fields/date-alert.ts` |
| Facturación: resumen, variación, formato | `lib/clients/revenue.ts`, `app/clients/revenue-actions.ts` |
| Mover valores de sección del growth partner a un creador | `planLegacyMove` (`lib/clients/sub-clients.ts`) + `moveLegacySectionValuesAction` |

## Reglas de negocio y decisiones no obvias

- **El add-on se chequea dos veces.** La UI con `useHasAddOn("growth_partners")`; el servidor con `requireAddOn` en cada
  escritura y `orgHasAddOn` en las lecturas (que devuelven vacío). El formulario público también lo exige: apagar el
  add-on desactiva todos los links.
- **El token es la única protección del formulario público**, más el rate limit. Quien tiene el link de un creador ve
  precargadas sus respuestas de onboarding (`initialAnswers`) —incluido lo que el equipo corrigió— y puede pisarlas.
  Un campo que llega vacío borra el valor; lo anterior queda en `replaced`.
- **Primero el historial, después la ficha.** El envío se guarda antes de tocar `client_sub_clients`; si la segunda
  escritura falla, queda el envío registrado y no una ficha pisada sin rastro. Mismo orden en la asignación desde la bandeja.
- **`labels` guarda la etiqueta del momento**: si después se renombra la pregunta, el historial sigue diciendo qué se preguntó.
- **Preguntas obligatorias en el formulario, no en la ficha.** `is_required` queda en false; la obligatoriedad vive en
  `field_definitions.onboarding.required`. La condición `showIf` y el audio se cargan con la plantilla y **no se editan
  desde la pantalla** (se preservan al guardar).
- **Un campo de onboarding respondido sólo en un creador cuenta como «en uso»**: `isFieldInUse` mira también
  `client_sub_clients.custom`, así que no se puede borrar de verdad.
- **Mover valores de sección no pisa**: lo que el creador destino ya tiene se respeta y el valor viejo queda en el growth
  partner para pasarlo a otro. Escribe primero el destino: si la segunda escritura falla, el dato queda repetido, no perdido.
- **Facturación ≠ Cobros.** `client_revenue_entries` es lo que factura el negocio del cliente; `client_payments` (área
  Ventas) es lo que nos paga. Ninguna pantalla los suma.
- **La variación no mira la moneda.** `summarizeRevenue` compara el último mes con el anterior aunque uno sea ARS y el
  otro USD, y «mejor mes» es el número más grande (`[FACTURACION-MONEDAS]`).
- **«Sin novedades» ignora cambios de datos** (nombre, fase, campos): editar no es tener noticias. Es distinto del
  silencio de la revisión semanal (30 días, sólo wins e hitos).

## Limitaciones conocidas y deuda

| ID | Resumen |
|---|---|
| `[ONBOARDING-CLIENTES-PROBAR]` | Nada probado contra la base: 0 links y 0 envíos en producción; las 86 preguntas no están cargadas (48 filas en `field_definitions` en toda la base) |
| `[CLIENTES-DE-CLIENTES-PROBAR]` | Hay 10 creadores cargados; falta el paso de pasar datos viejos (según `PENDIENTES.md`, 15 growth partners tienen valores de sección cargados en ellos mismos) |
| `[ONBOARDING-CLIENTES-RESTO]` | Sin aviso al equipo al completar; equipo del paso 9 como texto; `showIf`/audio no editables; la ficha no muestra «sin novedades» |
| `[FACTURACION-MONEDAS]` | Variación entre monedas distintas |
| `[CLIENTES-SEÑALES-DOS-SILENCIOS]` | Dos definiciones de silencio que pueden discrepar |

## Tests

| Archivo | Cubre |
|---|---|
| `lib/client-onboarding/__tests__/form.test.ts` | visibilidad, validación, aplicar respuestas, precarga (~17) |
| `lib/client-onboarding/__tests__/questions.test.ts` | integridad de la plantilla: claves únicas y válidas `onb_*`, pasos existentes, `showIf` hacia atrás (~7) |
| `lib/client-onboarding/__tests__/assign.test.ts` | growth partner nuevo desde la bandeja |
| `lib/clients/__tests__/sub-clients.test.ts` | Instagram, valores legacy, `planLegacyMove` (~11) |
| `lib/clients/__tests__/revenue.test.ts`, `signals.test.ts` | resumen de facturación, silencio |
| `lib/custom-fields/__tests__/onboarding-config.test.ts`, `date-alert.test.ts` | config de onboarding, avisos por fecha |

No cubierto: el RPC `client_last_activity`, las actions (rate limit, orden de escrituras, asignación), la página pública.

## Archivos clave

- `apps/web/app/clients/sub-client-actions.ts`
- `apps/web/app/clients/onboarding-link-actions.ts`
- `apps/web/app/onboarding-cliente/actions.ts` + `apps/web/lib/client-onboarding/public.ts`
- `apps/web/lib/client-onboarding/form.ts`, `questions.ts`, `steps.ts`
- `apps/web/app/clients/revenue-actions.ts` + `apps/web/lib/clients/revenue.ts`
- `apps/web/app/clients/signals-actions.ts` + `apps/web/lib/clients/signals.ts`
- `apps/web/components/clients/client-sub-clients-card.tsx`, `client-onboarding-inbox.tsx`
- `supabase/migrations/20260923100000_clientes_de_clientes.sql`, `20260923140000_onboarding_de_clientes.sql`
- `apps/web/lib/auth/add-ons.ts`
