# Auditoría de la documentación — 2026-09-23

Registro de la reorganización de la documentación. Ocho auditorías por área contrastaron los documentos
viejos (`PENDIENTES.md`, `FIXES_PENDIENTES.md`, `docs/PLAN_VERIFICACION.md`, `docs/TESTING_BACKLOG.md`,
`docs/historial/AUDITORIA_BACKEND_2026-09-22.md`, `OPERATIONAL_NOTES.md`, etc.) contra el código del commit `038caca`.

Acá quedan **los ítems que se sacaron del backlog por estar resueltos u obsoletos**, cada uno con su evidencia,
para que nada desaparezca sin explicación. Lo que sigue abierto está en `PENDIENTES.md` y
`docs/operacion/verificacion-manual.md`.

---

## Plataforma

> Verificado contra el código el 2026-09-23 (commit 038caca).

### PENDIENTES.md

- [PRIVACIDAD-NO-PUBLICA] — resuelto — `/privacidad` en `apps/web/lib/supabase/public-paths.ts` con caso en `__tests__/public-paths.test.ts` (commit 038caca).
- [ONBOARDING] (fases 0–4) — resuelto (construcción) — `lib/onboarding/*`, `components/onboarding/*`, `app/(super-admin)/super-admin/onboarding`; migraciones `20260831120000…150000` aplicadas. Lo que queda es verificación manual → `[ONBOARDING-VERIFICAR]`.
- [DISCORD-IDENTIDAD], [DISCORD-CLAVE], [DISCORD-SIN-F5], [DISCORD-CANALES], [DISCORD-URI-PORTAL], [E-D1-DESPLEGAR] — resueltos — ya en ✅ Completados (2026-09-08/09); código en `apps/discord-bot/src/events/ready.ts`, `lib/discord/oauth.ts`, `lib/discord/profile.ts`.
- [REBRAND-Limitless] — resuelto — ✅ 2026-09-08; lo externo sigue en `[REBRAND-EXTERNO]`.
- [INTEGRACIONES-REDISEÑO], [INTEGRACIONES-PANEL-FANTASMA] — resueltos — `lib/integrations/registry.ts`, `health.ts`, `components/integrations/integrations-board.tsx`.
- Bajas del super admin (2026-09-06) — resuelto (construcción) — `app/super-admin/delete-actions.ts`, `lib/super-admin/execute-deletion.ts`, migración `20260906110000_registro_de_bajas` aplicada. Queda `[BAJAS-SIN-PROBAR]`.
- Permisos por módulo, consolidación a 13 (2026-09-06) — resuelto — `constants/permission-modules.ts`, `20260906102000_permisos_por_modulo` aplicada; queda `[PERMISOS-SERVER-ACTIONS]`.
- Volver atrás en todas las pantallas (2026-09-06) — resuelto — `lib/navigation/page-meta.ts` + `__tests__/page-meta.test.ts`.
- [INTEGRACIONES-LOGOS] — obsoleto como pendiente — es una nota informativa: los 14 proveedores tienen logo y un test lo exige; no hay trabajo abierto.
- [TECH-4] VSL Player placeholder en landing — obsoleto — `components/landing/vsl-player.tsx` no existe; la landing de `/` se borró (redirect a `/login` en `next.config.ts`).
- [TECH-1], [TECH-2] — resueltos — tabla de completados de PENDIENTES (2026-08-11).
- [TECH-3] add-ons por org — resuelto — `organizations.enabled_add_ons` (`20260811130000`), `updateOrgAddOnsAction`, `buildPlatformRootItems`.
- Notch nav: flag `NEXT_PUBLIC_NAV_STYLE` — obsoleto — ya no existe; la notch nav es la única navegación (`components/layout/platform-shell.tsx`).
- [AUDITORIA-MIGRACIONES] — resuelto — ✅ 2026-09-22; `list_migrations` (2026-09-23) muestra aplicadas en prod las versiones del repo hasta `20260923140000` (incluidas `20260922100000_profiles_columnas_protegidas` y las de hoy).
- Bug "cualquier registrado podía volverse founder de otra org" — resuelto — trigger `protect_profile_columns` (`20260922100000`), aplicado.
- "Un usuario podía editar `enabled_add_ons`" — resuelto — `20260922110000_rpcs_y_policies_entre_organizaciones.sql` (según PENDIENTES ✅ AUDITORIA-MIGRACIONES; migración aplicada).
- "`Bearer undefined` autorizaba al bot con el secreto sin cargar" — resuelto — `lib/discord/webhook-auth.ts` fail-closed con `timingSafeEqual`.
- "El límite de intentos del login volvió a ser compartido" (2026-09-07) — resuelto — `lib/rate-limit.ts` usa RPC `consume_rate_limit`.
- [UI-21ST] ficha "Adaptive Notch Navigation Bar" — resuelta — la notch nav se reimplementó en `components/navigation/notch-nav/notch-nav.tsx`. Las otras tres fichas siguen en `[UI-21ST]`.

### FIXES_PENDIENTES.md (auditoría mayo 2026)

Todo el archivo está marcado implementado y el código actual lo confirma o lo volvió irrelevante:

- Detalle de cliente → 404 — resuelto — (área clientes; ya marcado).
- Sidebar desktop en móvil / `three-column-layout` — obsoleto — el sidebar de plataforma se eliminó el 2026-08-30; `three-column-layout` queda sólo para super admin.
- Doble título (topbar + PageHeader) — obsoleto/resuelto — el título lo pone `platform-shell.tsx` desde `page-meta.ts`; no hay topbar en plataforma.
- Orden de menú inconsistente / `platformNavigation` desincronizado — resuelto — `buildPlatformNavigation()` deriva de `sidebar-modules.ts`.
- Topbar genérico «AI COO» — resuelto — `lib/navigation/page-meta.ts` (`FALLBACK_TITLE = "Limitless"`).
- Bandeja ventas sin panel en tablet — resuelto (área ventas).
- Punto verde en perfil del sidebar — obsoleto — sidebar eliminado.
- Campana de notificaciones decorativa — obsoleto — no existe en la notch nav.
- Fondo base vs spec — resuelto — `html.dark body { background: #000 }`, `--color-surface-1` alineado.
- Super Admin etiquetas en español — resuelto — `lib/navigation/super-admin-sidebar-modules.ts`.
- `ContextPanelDrawer` montado en `platform-shell` — obsoleto — ya no existe `ContextPanelDrawer` en el código.
- `nav-group.tsx` sin uso — resuelto — no existe.
- Footer «Fase 1 · Beta» — obsoleto — el footer se fue con el sidebar; decisión abierta en `[NAV-3]`.
- Copys de Instagram / Team Inputs — resueltos.

### docs/PLAN_VERIFICACION.md

- §13.1 Aplicar la migración `onboarding_state` — resuelto — aplicada (`list_migrations`) y RLS verificada según §13.5.
- §13.2 Hechos del onboarding — resuelto (verificado 2026-08-31) salvo el filtro de desconexión, que pasa a `docs/operacion/verificacion-manual.md` § Plataforma.
- §13.7 OAuth no se prueba desde un preview — no es un bloque de verificación sino una nota de infraestructura; se conserva como advertencia en `docs/operacion/verificacion-manual.md` § Plataforma.
- "Volver atrás en todas las pantallas" — resuelto por test (`page-meta.test.ts`); el criterio de "vuelta correcta" queda como paso menor dentro de `[NAV-1]`.
- "Permisos por módulo": paso "migración aplicada, 63 roles" — resuelto (verificado 2026-09-06). El resto sigue en `docs/operacion/verificacion-manual.md` § Plataforma.

### docs/ y otros documentos viejos

- `docs/ESTADO_ACTUAL.md` (mayo 2026) — obsoleto — describe Fase 1 con sidebar, módulos mock y Discord "planificado"; reemplazado por `docs/areas/*` y `docs/arquitectura/*`.
- `docs/ESTADO_PLATAFORMA.md` (mayo 2026) — obsoleto — ídem, habla de "Fase 0" y de un shell con sidebar + topbar + context panel.
- `docs/DESIGN_SYSTEM.md` — obsoleto — "dark mode only", `PlatformShell` con sidebar/topbar/context panel; fusionado en `docs/diseno/design-system.md`.
- `DESIGN.md` — reemplazado por `docs/diseno/design-system.md` (lista de diferencias al final de ese doc). Lo citan comentarios en `lib/brand.ts`, `lib/funnels/types.ts`, `lib/funnels/validate-template.ts`.
- `docs/UI_UX_SPEC.md` — obsoleto — spec de principios de la Fase 0 ("Dark Mode", "Glassmorphism"), sin referencias desde el código.
- `docs/COMPONENTES_21ST.md` — vigente sólo como relevamiento de `[UI-21ST]`; nada del código lo cita.
- `OPERATIONAL_NOTES.md` "Limitaciones por módulo" — obsoleto para esta área: "Equipo: miembros mock; roles custom no persisten" es falso (`team_roles`, `team_invitations`, `app/team/actions.ts`); "Discord: API message route es stub" sigue cierto → `[DISCORD-STUB-MESSAGE]`.
- `docs/pending-features-audit.md` § Área del fundador — sigue → `[FOUNDER-AREA]`.
- `docs/TESTING_BACKLOG.md` [T-19] — sigue → `[T-19]`; [T-13] `derive-dashboard-data` sigue, se referencia en `docs/areas/plataforma.md`.
- `docs/ONBOARDING_PLAN.md` §6 "CLAUDE.md lista `app/onboarding/actions.ts` como que no existe" — obsoleto — el archivo existe y es el gate del founder. "Acento violeta `#7C3AED` en CLAUDE.md" — resuelto, CLAUDE.md ya dice naranja.
- `docs/DISCORD_DEPLOY.md` — vigente con una corrección: las variables del bot son `LIMITLESS_API_URL` / `LIMITLESS_WEBHOOK_SECRET` (las `OTC_*` sólo por respaldo).
- `docs/historial/AUDITORIA_BACKEND_2026-09-22.md` §3 seguridad 1, 3, 7, 10 — siguen → `[PERMISOS-SERVER-ACTIONS]`, `[HOLDING-PORTFOLIO-ROL]`, `[LOGIN-RATE-LIMIT]`, `[DISCORD-VINCULAR-EMAIL-AJENO]`. §3 salud 5 "CI no chequea migraciones" — resuelto (`.github/workflows/ci.yml` corre `supabase/ci/check-migrations.sh`), no es de esta área pero conviene cerrarlo.
- CLAUDE.md "roles `operator`/`viewer`" — obsoleto — los invitados se crean con `role = 'member'`; lo que diferencia es `custom_role_id`.
- CLAUDE.md "sidebar-modules.ts: config del sidebar" — obsoleto en el nombre, vigente en el uso (alimenta la notch nav).

---

## Clientes

> Verificado el 2026-09-23 (commit 038caca). Una línea por ítem de los docs viejos.

### PENDIENTES.md

- [FICHA-V2-MIGRACION] — resuelto — `20260921120000_ficha_secciones_facturacion_y_fase_manual` aplicada en producción (`list_migrations`); probada contra el preview con datos reales (CHANGES 2026-09-21 «Dos bugs que sólo aparecieron probando contra datos reales»: upsert de facturación, plantilla de 22 campos, `show_in_table`, aislamiento entre orgs).
- [CLIENTES-F2-PROGRESO-ETAPA] — resuelto — `stageReached`/`stageTotal`/`nextCheckpointDueAt` en `lib/checkpoints/stalled.ts`, dibujados en `StageCell` de `clients-list.tsx`.
- [CLIENTES-F3-OBJETIVO] — resuelto — `20260911120000_campos_configurables_de_cliente` aplicada; `entity='client'` y `clients.custom` en uso.
- [CLIENTES-F4-TABLA-NUEVA] — obsoleto — la tabla se rehizo el 2026-09-21: «Próxima tarea» ahora es una `client_task` (no el próximo hito) y la columna «Estado» ya no existe. La verificación vieja (check inline que registra hitos) no aplica; la nueva está en `docs/operacion/verificacion-manual.md` § Clientes.
- [CLIENTES-F5-CALLS-ENTREGA] — resuelto (código) — `loadLastOneOnOneByClient` enchufado en `getClientsBoardAction`; lo que queda es de datos: `[B-SEMBRAR-IDENTIDADES]`.
- [C0-PENDIENTES] (parte «`isFieldInUse` no puede fallar») — resuelto — `client_wins`, `client_checkpoint_events` y `client_sub_clients` existen y `VALUES_TABLE` las consulta (`app/clients/custom-field-actions.ts:51-64`). La parte `journey_stages` sigue como `[C0-JOURNEY-STAGES-UI]`; la de Playwright, en `[T-18]`.
- [C1-PROBAR-PANTALLA] (nota «`clients.current_stage_id` todavía no existe») — obsoleto — la columna existe (`20260903082000`) y la escribe `recomputeCurrentStage`.
- [A-BASELINE-SIN-UI] (citado en PLAN_VERIFICACION §18) — resuelto — `components/clients/wins/client-baseline-dialog.tsx` carga nicho, baseline y objetivo desde el dashboard de wins.
- [A-ENGANCHES-W3] (mitad Discord) — resuelto — `createWinFromTestimonialAction` (`app/discord/actions.ts:1545`) + solapa Candidatos (`win-candidates.tsx`). Sigue abierta la mitad Fathom.
- [FEAT-EXCEL-IMPORT-FASE3-RESTANTE] — resuelto — marcado ✅ 2026-08-25 en el propio ítem; la deuda de parser se reabre como `[CLIENTES-IMPORT-EXCEL-MONTOS]`.

### pending-features-audit.md

- «Re-cierre puede crear cliente duplicado (`markCallClosed` siempre llama `addClient`)» — resuelto — `providers/platform-data-provider.tsx:597-606` rechaza si ya hay un cliente con ese `closingCallId` o la llamada está `closed`.

### FIXES_PENDIENTES.md

- «Detalle de cliente → 404 con Supabase» — resuelto — `[id]/page.tsx` espera `clientsLoading` antes de `notFound()`.

### docs/PLAN_VERIFICACION.md

- §14 C0, paso «⚠️ Borrar una columna con datos, cuando exista `client_wins`» — obsoleto como «no se puede probar»: la tabla existe; el paso pasa a la verificación normal.
- §14 C0, paso «Elegir `options_source='journey_stages'` — no se puede todavía» — sigue igual; es `[C0-JOURNEY-STAGES-UI]`.
- §15 C1, paso «⚠️ Borrar un checkpoint que algún cliente alcanzó — hoy no se puede probar» — obsoleto como bloqueo: `client_checkpoint_events` existe y `checkpointHasEvents` lo frena.
- §16 C2, paso «Abajo de los pagos, la sección Recorrido» — obsoleto — la ficha ya no tiene pagos (Cobros); el recorrido es la primera sección de la columna izquierda.
- §18 A, paso «⚠️ Nicho y baseline no tienen UI» — resuelto — `client-baseline-dialog.tsx`.
- §22, paso «🔴 Aplicar `20260904110000_checkpoint_proposal_sources.sql`» — resuelto — aplicada (`list_migrations`); el cron ya produjo 9 propuestas.
- «Notas del cliente y comprobante opcional — 2026-09-06», mitad de comprobantes — fuera del área (Cobros/Ventas). La mitad de notas queda en `docs/operacion/verificacion-manual.md` § Clientes.
- «Campos configurables de cliente — el objetivo general — 2026-09-11», paso «⚠️ Primero: aplicar la migración» — resuelto — aplicada.
- «La tabla nueva de Clientes — 2026-09-11» — obsoleto en su mayoría — columnas «Estado» y «Próxima tarea = próximo hito» ya no existen; el check inline de la tabla marca `client_tasks`. Lo que sigue valiendo («n de m» contra la ficha, vencimiento, trabados) pasó a `docs/operacion/verificacion-manual.md` § Clientes.
- «Llamadas de entrega y "última 1-1" — 2026-09-11» — fuera del área en su mayoría (clasificador de Fathom); la parte de siembra y columna «Última 1-1» queda en `docs/operacion/verificacion-manual.md` § Clientes.
- «Sesiones 1-1 desde un link de Fathom» — parcialmente verificado — la subida y la extracción corrieron en producción (CHANGES 2026-09-21, 288 `client_tasks`); siguen abiertos los pasos de duplicados y cuenta ajena.
- «Ficha del cliente — apartados, facturación y fase manual», bloque «Antes de empezar» y «La facturación del negocio» — verificados contra el preview con datos reales (CHANGES 2026-09-21). «Los tres apartados» — obsoleto en su forma: desde el 2026-09-23 los apartados se ven por cliente-de-cliente (add-on), no en «Información del cliente» del propio cliente.
- «Ficha del cliente», paso de fase manual «Mirar la tabla de clientes, columna Etapa: dice esa misma fase» — **falla por diseño actual** cuando el cliente tiene hitos derivados: ver `[CLIENTES-ETAPA-TABLA-VS-FICHA]`.

### CLAUDE.md

- Tabla de actions: `app/clients/payment-actions.ts` — obsoleto — el archivo no existe; pagos en `app/sales/payment-actions.ts`.

---

## Ventas

> Verificado contra el código el 2026-09-23 (commit 038caca). Una línea por ítem de los docs viejos.

### PENDIENTES.md

- [LLAMADAS-FASE-2-PULIR] "Responsable del próximo paso" — resuelto — `next_action_owner_id` se edita desde `components/closing/leads-table.tsx` vía `setNextActionOwnerAction` (`app/sales/lead-actions.ts:484`). El resto del ítem sigue abierto (calificación previa, Playwright).
- [LLAMADAS-FASE-2-PULIR] "Turnos de Calendly sin lead" — reformulado — el mail ya se persiste y `sync-events.ts` resuelve el lead; el hueco real es `closer-sync.ts`, que pasa a `[CALENDLY-CLOSER-SIN-LEAD]`.
- [SEGUIMIENTO-ESCALA] "el aviso de truncado nunca se disparaba" — resuelto — `listLeadsTableAction` usa `fetchAllRows` con `maxRows: 2000` (`app/sales/lead-actions.ts:189-199`). Sigue abierto el techo en sí.
- [AUDITORIA-ABIERTOS] punto 4 y 9 (migraciones) — resuelto — `list_migrations` de prod coincide con el repo, incluidas todas las migraciones de ventas.
- [1-1-SEMBRAR-Y-MEDIR] tabla de medición del 2026-09-21 — obsoleto como dato — prod al 2026-09-23: 468 `fathom_calls`, 0 `client_identities`. El ítem sigue (fusionado con `[B-SEMBRAR-IDENTIDADES]`).
- "2026-09-15 — Fathom: qué trae la primera vez" (Completados) — resuelto — `lib/fathom/sync-window.ts` + migración `20260915120000_fathom_desde_la_conexion.sql` aplicada.
- "Fathom: el 429 lo causábamos nosotros" (CHANGES 2026-09-15) — resuelto — el cron `process` ya no sincroniza ni sondea antes de procesar (CHANGES.md línea ~2055).

### docs/historial/AUDITORIA_BACKEND_2026-09-22.md

- §1 "Unipile queda cerrado hasta configurar el secreto" — obsoleto como acción — el inbox Unipile no tiene UI ni datos (`conversations` = 0); la decisión pasa a `[LEGACY-INBOX-BORRAR]`. Fail-closed verificado en `lib/unipile/incoming-webhook.ts`.
- §1 "Fathom legacy 409" — resuelto en código — `app/api/integrations/fathom/webhook/route.ts:80-92` rechaza firmas ambiguas. Queda sólo como paso de verificación.
- §2 Fathom: doble análisis por corridas superpuestas — resuelto — toma atómica `.neq("status","processing")` en `lib/fathom/process-call.ts:128-138`.
- §2 `calendly-sync` respondía `ok: true` al fallar — resuelto según auditoría §2 (no reabierto).
- §3 Salud 6 `getConversationIdByExternalRef` exportado — sigue, fusionado en `[SALES-ACTIONS-SIN-USO]`.
- §3 Confiabilidad 7 (race de `conversations.messages`) y 9 (Instagram legacy fuera de sync) — obsoletos por separado — sin datos en esas tablas; quedan dentro de `[LEGACY-INBOX-BORRAR]`.

### docs/pending-features-audit.md (Ventas)

- Bandeja "sin composer para responder" (`conversation-thread.tsx`) — obsoleto — ese componente es del inbox legacy, sin uso; el inbox Zernio envía con `sendZernioMessageAction`.
- Bandeja "flag unread nunca se limpia" — obsoleto — inbox legacy (`upsert-inbound-conversation.ts`), sin UI.
- Bandeja "análisis pendiente hasta 3+ mensajes, sin trigger manual" — obsoleto — legacy; el panel Zernio tiene botón de análisis manual (`zernio-side-panel.tsx:55`).
- Bandeja "journey enlaza a closing genérico" — resuelto — `lead-journey-inline.tsx:210-213` enlaza a `/sales/closing?call=<closingCallId>`.
- Métricas "tendencia de agendamientos usa `lastMessageAt`" — obsoleto — `deriveSalesMetrics` sobre `conversations` vacía; subsumido en `[EMBUDO-PANEL-DMS]`.
- Métricas "objeciones frecuentes con fallback mock" — resuelto — el mock sólo se usa sin Supabase (`app/(platform)/sales/metrics/page.tsx:11-16`).
- Closing "botones de resultado sin guard de estado" — resuelto — `acceptsManualOutcome` en `closing-overview.tsx:616` y en el provider.
- Closing "re-cierre crea cliente duplicado" — resuelto — `markCallClosed` corta si hay cliente con ese `closingCallId` o si el estado no acepta resultado (`platform-data-provider.tsx:595-615`). La no-atomicidad sigue en `[CLOSING-CIERRE-ATOMICO]`.
- Closing "`closedByName` hardcodeado" — resuelto — `payment-modal.tsx:225` usa el nombre ingresado, con `"Usuario"` sólo de fallback.
- Closing "URL Fathom sin análisis vinculado" y "vista previa placeholder" — siguen, fusionados en `[CLOSING-FATHOM-PREVIEW]`.
- Métricas "ranking con `trend: stable` fijo" — sigue como `[RANKING-TREND-FIJO]`.

### docs/TESTING_BACKLOG.md

- [T-10] `lib/sales/upsert-inbound-conversation.ts` — obsoleto — alimenta sólo el inbox legacy (0 filas); se borra con `[LEGACY-INBOX-BORRAR]` en vez de testearse.
- [T-9] — sigue, recortado a la rama Zernio.

### FIXES_PENDIENTES.md

- "Bandeja ventas sin panel análisis en tablet" — resuelto (marcado `[x]`) y además obsoleto: era el inbox legacy.

### OPERATIONAL_NOTES.md (mayo 2026)

- §Unipile "mensajería transitoria (Instagram DMs + WhatsApp)" — obsoleto — integración `listed: false` en `lib/integrations/registry.ts:298-338`, reemplazada por Zernio.
- §Instagram "DMs directos (sin ManyChat)" y "Configurar webhook de Instagram DMs en Meta" — obsoleto — `listed: false` (`registry.ts:411-436`); `instagram_threads/messages` con 0 filas. Los crons siguen agendados → `[LEGACY-INBOX-BORRAR]`.
- §ManyChat y "Scoring de conversaciones ManyChat" — obsoleto funcionalmente — escribe en `conversations`, que ninguna pantalla muestra; sigue listada por error → `[LEGACY-INBOX-BORRAR]`.
- §Calendly "sync manual `/api/integrations/calendly/sync`" — obsoleto — la ruta responde 410 (`app/api/integrations/calendly/sync/route.ts`).

### Código (TODO/FIXME)

- `lib/fathom/analyze-transcript.ts:15` "BullMQ queue `fathom-analysis`" — obsoleto — el análisis profundo ya va por QStash (`/api/queue/process-fathom-analysis`).
- `lib/fathom/analyze-transcript.ts:16` "prompt caching" — resuelto parcialmente — el análisis profundo usa `cachedSystemPrompt` (`deep-call-analysis.ts:239`); el análisis básico no, sin impacto relevante.
- `components/sales/sales-performance-metrics-section.tsx:165` TODO seña — obsoleto — componente sin importadores; el TODO vivo es el de `metrics-actions.ts` (`[METRICAS-SENA]`).

### docs/PLAN_VERIFICACION.md

- §14.1–14.5 "Seguimiento en tabla, con valores propios" — sigue abierto (condensado en `docs/operacion/verificacion-manual.md` § Ventas); la parte de migración ya estaba verificada.
- §20 fila "Conectar sin `ENCRYPTION_MASTER_KEY`" — resuelto en código — `member-actions.ts` exige la clave; queda como paso de verificación.
- "Auditoría de backend" fila Unipile — obsoleto — ver arriba.

---

## Marketing

### PENDIENTES.md
- [TRIAL-1] Reintentar variante fallida — resuelto — `retryVariationAction` + botón en `variation-card.tsx` (sólo reintenta la publicación; la parte de generación sigue abierta como `[TRIAL-RETRY-GENERACION]`)
- [TRIAL-2] Regenerar captions con IA — resuelto — `regenerateCaptionAction` usado por `variation-card.tsx`
- [TRIAL-3] Música personalizable por org — **declarado resuelto pero no funciona**: sigue abierto como `[TRIAL-REELS-MUSICA]` (zod del worker descarta `reelMusicPath`)
- [TRIAL-4] LUT cálido — resuelto en parte — `apps/reel-worker/luts/warm.cube` en el repo y copiado por el Dockerfile; queda la música (sigue `[TRIAL-4]`)
- [TECH-2] Retención real de YouTube — obsoleto — `getRetentionAtCTA` existe pero su única UI (`content-platform-metrics.tsx` vía `marketing-content-detail.tsx`) quedó huérfana; va dentro de `[MKT-CODIGO-MUERTO]`
- [BUG-2] Distribución incluye `content_pieces` — resuelto — `getContentDistributionDataAction` (app/marketing/actions.ts)
- Upload real de video a Zernio en Trial Reels — resuelto — `getMediaPresignedUrl` + PUT en `publish-reel-variation/route.ts`
- Fallback `https://app.otc.com` en publish-reel-variation — resuelto — cae en `brand.domain` (PENDIENTES [BRAND-E])

### docs/pending-features-audit.md (2026-07-03) — Marketing
- Overview: métricas de conversión por asset nunca se escriben — resuelto — `recomputeContentAssetAttribution` en `lib/marketing/content-attribution.ts` (se llama en cada carga del overview; queda `[MKT-OVERVIEW-LEGACY]`)
- Overview: tendencias hardcodeadas en 0 — resuelto — `trendPct(recent, previous)` en `lib/marketing/overview-metrics.ts`
- Overview: seguidores siempre 0 — resuelto — `getSocialAudienceStats` (`lib/marketing/social-audience.ts`, migración `20260718100000_social_follower_counts.sql`)
- Overview: banda de engagement oculta con métricas reales — obsoleto — `overview/metrics-sections.tsx` (con su fallback a `mockMarketingOverview`) ya no se monta: sólo lo exporta `overview/index.ts`, que nadie importa
- Contenido: etiquetado IA sólo en YouTube — obsoleto — la biblioteca de `content_assets` ya no se muestra (`marketing-content-library.tsx` huérfano); `content_pieces` se clasifica por `analysis.hook_type`
- Contenido: sin etiqueta manual si no hay label — obsoleto — `content-label-badge.tsx` sólo lo usa un componente huérfano
- Contenido: detalle con journey demo si el ID no existe — resuelto — `content/[id]/page.tsx` hace `notFound()`
- Conexión con Ventas: bloqueada sin Instagram — resuelto — `marketing-sales-connection.tsx` ya no chequea Instagram
- Conexión con Ventas: análisis de patrones IA no empezado — resuelto — `generateContentPatternReportAction` + `content_pattern_reports`
- Conexión con Ventas: ranking sólo vía cadena UTM / journeys sin puente — reformulado como `[MKT-SALES-CONN-VACIA]`
- Formularios: ausente del subnav — obsoleto — no hay subnav; está en la notch nav
- Formularios: sin desconexión desde la pantalla — resuelto — `disconnectFormAction` + `form-disconnect-button.tsx`
- UTMs: se guarda UUID interno en vez de `external_id` — resuelto — `resolveYoutubeVideoExternalId` en `app/marketing/utm-actions.ts` + migración `20260717100001_fix_utm_youtube_video_external_ids.sql`
- UTMs: sólo crear, sin editar ni eliminar — resuelto — `updateUTMLinkAction`, `deleteUTMLinkAction`
- UTMs: ruta en subnav pero no en sidebar — obsoleto — está en `sidebar-modules.ts` (oculta)

### OPERATIONAL_NOTES.md
- "Marketing: contenido `content_assets` real; fallback `mockMarketingContentAssets`" — obsoleto — la biblioteca es `content_pieces`, sin mocks
- "Detalle contenido `[id]`: mock marketing-insights" — obsoleto — lee `content_pieces`
- "Overview charts/funnel/heatmap mock aunque haya assets" — obsoleto — se derivan de `content_assets` reales (ver `[MKT-OVERVIEW-LEGACY]`)
- "Conexión ventas: 100% mock" — obsoleto — datos reales (vacíos en prod por `[MKT-SALES-CONN-VACIA]`)
- "UTMs: leads parcialmente mock para links `utm-mock-*`" — obsoleto — sin mocks en `utm-leads-sheet.tsx`
- "YouTube: datos → `content_assets`" — obsoleto — escribe `content_pieces` (`source='google'`); "sin cron" sigue (`[YT-SIN-CRON]`)
- "Etiquetado de contenido se ejecuta al sincronizar IG/YouTube" — obsoleto para el flujo actual (Zernio no etiqueta; clasificación por análisis IA)
- TODO `lib/youtube/retention.ts:5` "retención real Phase 2" — obsoleto — existe `lib/youtube/analytics.ts` (aunque sin UI)

### CLAUDE.md §Zernio (tabla de endpoints)
- `GET /api/utm/click` — incorrecto — es `POST`
- `resolvePostAnalytics` "normaliza a `ContentMetrics`" — desactualizado — devuelve `{ metrics, lastUpdated, recognized }`
- Faltaban en la tabla: `listInstagramStories`, `syncExternalStories`, `getMediaPresignedUrl`; sobraban como "usados": `listPostAnalytics`, `getAccountAnalytics`, `getPostsAnalytics` (sin callers). Tabla verificada en `docs/areas/marketing.md` § Zernio
- "Hardcodear URLs de Zernio sin `ZERNIO_API_BASE`" — el nombre real de la constante es `ZERNIO_API_BASE` en `lib/zernio/constants.ts` (ok); la única URL fija restante es el fallback de `platformPostUrl` `https://zernio.com/posts/{id}` en `content/actions.ts`

### docs/INTEGRACIONES_MAPA.md
- "YouTube | API key | Cron | `content_assets`" — incorrecto — OAuth o API key, sin cron, escribe `content_pieces`

### docs/PLAN_VERIFICACION.md
- Ningún bloque del área quedó obsoleto. §2 (I-1 métricas de anuncios) y §9 (I-10 triggers) siguen abiertos; el paso "`GET /rest/v1/zernio_integrations` y `youtube_integrations` con JWT de viewer" de la auditoría 2026-09-22 queda en verificación.

### AUDITORÍA 2026-09-22 (ya arreglado, sólo para trazabilidad)
- Cron de métricas refrescaba siempre las mismas 50 / pisaba con ceros — resuelto — orden por `metrics_updated_at` y chequeo `recognized` en `lib/marketing/sync-content-metrics.ts`
- Sync de YouTube nunca escribía (`onConflict` contra índice parcial) — resuelto — `20260922110000` crea `content_pieces_org_platform_post_uniq`
- Secretos de `zernio_integrations`/`youtube_integrations` legibles por miembros — resuelto — policies borradas en `20260922110000`
- `increment_utm_*` confiaban en el id recibido — resuelto — revocadas a anon/authenticated
- `/api/utm/track` registraba links inexistentes — resuelto — `requireKnownLink: true`
- Server actions de lead magnets sin auth — resuelto — movidas a `lib/marketing/lead-magnets-internal.ts`
- Typeform/Google Forms: error de una org frenaba al resto — resuelto — aislamiento por org en `syncAll*`
- Zernio guardaba la key en claro sin `ENCRYPTION_MASTER_KEY` — resuelto — `storeApiKey` usa `encrypt` que falla

---

## Embudos y Lanzamientos

> Verificado contra el código el 2026-09-23 (commit 038caca).

### PENDIENTES.md

- [EMBUDOS-GHL-PIPELINE] — resuelto — `lib/ghl/sync-pipelines.ts`, webhook `app/api/webhooks/ghl/route.ts`, fuentes `ghl_*` en `lib/funnels/sources.ts`; CHANGES 2026-08-30 "I-4: oportunidades de GoHighLevel". Lo que queda está en [EMBUDOS-GHL-ENTREGA] y [EMBUDOS-GHL-BACKFILL].
- [EMBUDOS-FUENTES] — obsoleto — el plan de 10 unidades está construido (todas las unidades tienen código y migración aplicada en producción). Lo que falta vive en [EMBUDOS-CUENTAS-REALES]; el mapa queda como spec en `docs/specs/FUNNELS_SOURCE_MAP.md`.
- [FEAT-EMBUDOS-INTEGRACIONES] — obsoleto — todas las integraciones de la tabla existen (Hyros, WebinarJam, VTurb como hosting de VSL, scoring de formularios vía `form_qualified`). La "decisión abierta" de hosting se cerró (VTurb). La nota "Whop/Fanbasis cubiertos por Stripe + MP" es falsa: hay integración propia y Stripe/MP no alimentan embudos (ver [EMBUDOS-INSTRUMENTATION-DESACTUALIZADA]).
- [FEAT-EMBUDOS] — obsoleto (partido) — Fases 0, 1, 3 y 4 hechas (`lib/funnels/*`, páginas `/funnels/*`, switcher, KPIs). Lo abierto se separó en [EMBUDOS-SALUD] (Fase 2), [EMBUDOS-SNAPSHOTS] (Fase 5) y [EMBUDOS-COMPARAR]. "Aplicar la migración funnels_phase1" y "activar el add-on embudos" ya no aplican: migración aplicada (list_migrations) y Embudos dejó de ser add-on (`sidebar-modules.ts`, permiso `funnels`).
- [EMBUDOS-PAGOS-CORREGIR] — resuelto — ya figura en Completados de PENDIENTES (2026-09-08); `lib/payments/normalize.ts` usa `settlement_amount`, unidad por proveedor y eventos literales.

### docs/API_DOCS_PENDIENTES.md

- Tabla "Estado" (GHL/VTurb/WebinarJam/Hyros "Sin empezar") — obsoleto — las cuatro integraciones están construidas (`lib/ghl`, `lib/vturb`, `lib/webinarjam`, `lib/hyros`).
- §1 Whop y Commas (bugs de monto, centavos, eventos, identidad, valor contratado, firmas) — resuelto — `lib/payments/normalize.ts`, `lib/payments/verify-signature.ts`. Queda sólo verificación manual ([EMBUDOS-PAGOS-VERIFICAR]).
- §1 "Backfill — la API key se guarda pero no se usa" — sigue abierto, movido a [EMBUDOS-PAGOS-BACKFILL].
- §2 Commas — obsoleto como sección: no existe en el archivo (se fusionó en §1); contenido cubierto arriba.
- §3 GHL "Lo confirmado" — resuelto (doc local). §3 a/b/c — siguen abiertos, pasados a `docs/integraciones/apis-sin-documentacion.md`; §3b parcialmente verificado el 2026-09-23 (pipeline `id`, `name`, `stages[]`; etapa con `name` y `position`).
- §4 VTurb "Lo confirmado" — resuelto. §4c `/players/list` — **verificado 2026-09-23** (array pelado en `openapi.json`). §4c `/quota/usage` — **verificado 2026-09-23**: devuelve `{ quotas: [...] }`, el cliente lee `usage` → deuda en [EMBUDOS-CODIGO-MUERTO]. §4a y §4b siguen abiertos.
- §5 WebinarJam "seis preguntas" — resuelto (doc local, `lib/webinarjam/*`). Formatos no declarados siguen abiertos (pasados al doc nuevo).
- §6 Hyros "seis preguntas" — resuelto. §6b forma de las filas — **verificado 2026-09-23** (el ejemplo devuelve los nombres pedidos en `fields`); surge la duda `revenue` vs `total_revenue`, anotada en el doc nuevo. §6a y §6c siguen abiertos.
- "Por qué existe este archivo" (dominios bloqueados) — obsoleto — el bloqueo no existe desde 2026-08-30; la regla quedó resumida en el doc nuevo.
- Fathom y Loom — siguen, movidos tal cual (fuera del área).

### docs/PLAN_VERIFICACION.md

- §0 "Add-on `embudos` activado desde super-admin" — obsoleto — Embudos no es add-on; se controla con el permiso `funnels`.
- §0 "Migraciones aplicadas" — resuelto — `list_migrations` en `nrzlylzbmsuowzhpdnjl` muestra las 10 migraciones del área.
- §1.1 "Desactivar el add-on y recargar → desaparece" — obsoleto — reescrito con el permiso `funnels` en `docs/operacion/verificacion-manual.md` § Embudos y Lanzamientos.
- §11 "Estado de las unidades" — obsoleto como bloque de verificación (es un estado, no pasos); absorbido por [EMBUDOS-CUENTAS-REALES].
- §5.2 último paso "cuando exista la app del Marketplace" — sigue, condicionado a [FEAT-GHL-OAUTH].

### docs/TESTING_BACKLOG.md §2

- [T-6] viñeta "`resolveOrgMeasures` deja `spend`, `reach` e `impressions` en `null` (no hay fuente todavía)" — obsoleto — hoy salen de `ad_metrics_daily`; son `null` sólo sin filas. El resto de [T-6]…[T-8] sigue abierto (no hay tests de IO ni e2e).
- [T-17] paso "Spend aparece como no aplica (ninguna plantilla la usa)" — sigue siendo cierto (0 steps con `stageId: "spend"`).

### docs/historial/AUDITORIA_BACKEND_2026-09-22.md §3

- C3 webhooks de Whop/Commas/GHL redirigidos a `/login` — resuelto — `lib/supabase/public-paths.ts` deja pasar `/api/webhooks/` y `/api/cron/`.
- GHL "`?organizationId=` ganaba sobre el `locationId` firmado" — resuelto — `app/api/webhooks/ghl/route.ts` exige que el `locationId` firmado resuelva a la misma org.
- "`ghl-sync` respondía `ok: true` al fallar" — parcialmente resuelto — la excepción no controlada ya da 500; los errores por org siguen tragados ([EMBUDOS-CRON-ERRORES]).
- Confiabilidad 5 (dedupe vs reintentos) y Seguridad 4 (replay GHL) — siguen abiertos, en [EMBUDOS-WEBHOOK-PERDIDA] y [EMBUDOS-GHL-WEBHOOK-HARDENING].

### OPERATIONAL_NOTES.md

- "Lanzamientos — CRUD real con métricas diarias, tareas vinculadas y post-mortem IA" y la sección "Módulo Lanzamientos" (flujo de 4 pasos) — obsoleto — las páginas son "Próximamente" y los componentes no se montan; ver [LANZAMIENTOS-DORMIDO].

### Fuera del área (para que no se pierdan)

- [EMBUDO-PANEL-DMS] — sigue abierto, pertenece al área Dashboard/Ventas (`lib/metrics/build-sales-funnel-stages.ts`). Relacionado con [EMBUDOS-DM-DEFAULTS].
- [CHART-B] — gráficos del panel, no del módulo de embudos.
- `pending-features-audit.md` ítem 2 ("funnels y top converting muestran ceros") — se refiere al embudo de Marketing, no a este módulo.

---

## Agente de negocio e IA

- [AUDITORIA §2 C2] `search_rag_chunks` expuesta a cualquier usuario — resuelto — `20260922110000_rpcs_y_policies_entre_organizaciones.sql` revoca a `authenticated`; aplicada en prod (`list_migrations`); `lib/rag/search.ts` usa admin client.
- [AUDITORIA §2 Alto] `processAiBrainDocument` como server action abierta — resuelto — ahora es lib (`lib/ai-brain/process-document.ts`) y la action `processAiBrainDocumentAction` exige `requireSuperAdmin()` (`app/super-admin/actions.ts:595`).
- [AUDITORIA §2 Funcional] Tools de datos del agente pedían columnas inexistentes — resuelto — entrada de la auditoría 2026-09-22; `lib/agent/data-reader-handlers.ts` usa alias (`paid_at:payment_date`, `call_summary:summary`, `weaknesses:improvements`), ver header del archivo.
- [AUDITORIA §2 Medio] `/api/agent/transcribe` sin rate limit — resuelto — `transcriptionRateLimit` (30/min por usuario) en `app/api/agent/transcribe/route.ts`.
- [AUDITORIA §2 Funcional] Reportes ejecutivos nunca se reintentaban / mensual en serie — resuelto — worker `process-cron-executive-report` devuelve 500 ante `"failed"`; los tres crons hacen fan-out por QStash.
- [Costo de Whisper invisible] — resuelto — `lib/sops/transcription-usage.ts` registra en `token_usage` (`model = whisper-1`).
- [Fallback de clave inexistente (221 fallas/día)] — resuelto — `executeWithCredentialFallback` reintenta con la global ante 401/403 (`lib/ai/anthropic.ts`); CHANGES 2026-09-21. Queda abierto sólo para el stream del agente (`[AGENTE-SIN-FALLBACK-CLAVE]`).
- [Clave vencida invisible en la UI] — resuelto en código — `marcarClaveDeOrgComoRechazada` (`lib/ai/credential-resolver.ts`); CHANGES 2026-09-21 "Una clave de IA vencida ahora se ve dentro del producto". La confirmación en prod sigue en `[1A1-CLAVE-ANTHROPIC-ROTA]`.
- [OPERATIONAL_NOTES "Agente: sin RAG/SOPs reales en contexto (Phase 2)"] — obsoleto — el agente usa RAG (`searchRAG`) y JIT con SOPs, docs y cerebro global.
- [OPERATIONAL_NOTES "Sin ANTHROPIC_API_KEY el agente responde MOCK_REPLY"] — obsoleto — `MOCK_REPLY` no existe; sin credencial devuelve error.
- [OPERATIONAL_NOTES "Inteligencia / Reportes ejecutivos 100% mock"] — obsoleto — generados por cron con Claude; 118 snapshots y 52 reportes en prod.
- [OPERATIONAL_NOTES "Base de conocimiento: documentos mock; upload real no implementado"] — obsoleto — upload, notas e import de Google en `app/business-context/actions.ts`.
- [OPERATIONAL_NOTES BYOK "cache 5 minutos"] — obsoleto — `CACHE_TTL_MS = 30 * 1000` en `lib/ai/credential-resolver.ts`.
- [OPERATIONAL_NOTES BYOK "si la key del cliente falla → global"] — parcialmente falso — sólo ante 401/403; sin créditos no cae (`[IA-CLAVE-SIN-CREDITOS]`).
- [CLAUDE.md "BYOK: API key u OAuth Claude"] — obsoleto — OAuth eliminado; `normalizeCredentialMode` ignora modos OAuth. Columnas quedan (`[IA-OAUTH-COLUMNAS]`).
- [CLAUDE.md "Eventos SSE: token, thinking, tool, done, error"] — obsoleto — eventos reales `delta`, `tool_start`, `tool_end`, `done`, `error` (`lib/agent/sse.ts`).
- [CLAUDE.md compaction ">20 msgs o ~40K tokens, últimos 6"] — vigente, verificado (`lib/agent/compact-conversation.ts`). Sin acción.
- [docs/AI_ENGINE_SPEC.md "Opus para SOP generation"] — obsoleto — `sop_generation` → Sonnet (alias 4.5); Opus no se usa.
- [docs/AI_ENGINE_SPEC.md "Booking detection AI"] — obsoleto — task `booking_detection` existe en el mapa pero sin callers.
- [pending-features-audit "Sidebar sólo enlaza reporte semanal; mensual e historial no están en nav"] — obsoleto — las páginas weekly/monthly se borraron; historial se abre desde el panel de la notch nav (`components/executive-reports/reports-panel.tsx`).
- [pending-features-audit "Sin reportes no hay botón de generación manual"] — obsoleto (decisión) — "No hay generación manual" es deliberado (`history/page.tsx`, CHANGES 2026-08-30). El botón del pipeline sigue en `[REPORTES-GENERACION-MANUAL]`.
- [pending-features-audit "Inteligencia: snapshot depende de cron; sin datos → empty state permanente"] — obsoleto — el cron corre 2×/día y hay botón de pipeline para el founder; el empty state sólo aparece si `hasMeaningfulData` es falso.
- [CHANGES 2026-08-26 "FloatingChatProvider pendiente de limpieza"] — sigue abierto como `[AGENTE-CAMINO-LEGACY]`.
- [PLAN_VERIFICACION "Auditoría de backend → search_rag_chunks con JWT → permission denied"] — migración aplicada en prod; la prueba con JWT queda en `docs/operacion/verificacion-manual.md` § Agente de negocio e IA como chequeo rápido (no hay evidencia en CHANGES de que se haya corrido).

---

## Operaciones, Finanzas y Producto

> Verificado contra el código el 2026-09-23 (commit 038caca). Una línea por ítem de los docs viejos.

### docs/pending-features-audit.md (2026-07-03)

#### Producto
- [PFA Producto · Frameworks sin UI de CRUD] — resuelto — `components/product/sales-frameworks-section.tsx` usa get/save/delete, montado en `detail-view.tsx:58`.
- [PFA Producto · Stats de oferta placeholder] — resuelto parcialmente, lo que queda pasa a `[PRODUCTO-METRICAS]` — `computeOfferStats` en `lib/product/offer-metrics.ts`, enriquecido en `lib/product/queries.ts`.
- [PFA Producto · Métricas de escalón placeholder] — resuelto — `computeLadderStepMetrics` (`lib/product/offer-metrics.ts`).
- [PFA Avatar · Insights IA sin cablear] — resuelto parcialmente — `buildAvatarInsights`; la objeción de org nunca se carga → `[PRODUCTO-METRICAS]`.
- [PFA Oferta · Detalle solo lectura] — resuelto — `offer-detail-page-content.tsx` con Editar y `deleteProductAction`.
- [PFA Oferta · Objeción principal y handler vacíos] — sigue — absorbido en `[PRODUCTO-METRICAS]`.
- [PFA Escalera · Vista read-only] — resuelto — `value-ladder-section.tsx` usa `reorderValueLadderAction`, `setCoreOfferAction`, `updateValueLadderStepAction`.
- [PFA Escalera · Métricas por step no calculadas] — resuelto — idem `computeLadderStepMetrics`.
- [PFA Propuesta · Sin persistencia (useState)] — resuelto — `proposition-section.tsx:38` llama `saveValuePropositionAction`.
- [PFA Propuesta · Promete inyección al agente sin guardar] — resuelto — la propuesta se guarda en `value_propositions` y se ingesta al RAG (`ingestProductContext`).

#### Operaciones
- [PFA Overview · Depende de reporte `ready`] — obsoleto (es el diseño) — `components/operations/operations-overview.tsx`.
- [PFA Overview · Sin generación manual] — resuelto — `GenerateWeeklyPipelineButton` en `operations-report-empty-state.tsx`; botón en Inputs (`weekly-inputs-page-content.tsx`).
- [PFA Inputs · Grabación de voz simulada] — obsoleto — no queda nada de voz en `weekly-input-form.tsx`.
- [PFA Inputs · Historial sin UI] — resuelto — `weekly-inputs-history.tsx` montado en `weekly-inputs-page-content.tsx:164`.
- [PFA Inputs · Sin editar ni eliminar] — resuelto — `updateWeeklyInputAction`/`deleteWeeklyInputAction` + `weekly-input-row-actions.tsx`.
- [PFA SOPs · Adjuntos "próximamente"] — resuelto — `sop-creator-form.tsx` sube con `prepareSopAttachmentUploadAction`/`finalizeSopAttachmentAction`; sin textos "próximamente" en `components/sops`.
- [PFA Team Inputs · Reutiliza datos, solo lectura] — resuelto — ahora es el tab "Input rápido" de `/operations/inputs` con `WeeklyInputRowActions` (queda `[OPS-INPUT-RAPIDO-PISA]`).
- [PFA Team Inputs · Sin editar/eliminar] — resuelto — idem.
- [PFA Inteligencia / Reportes / Área del fundador] — fuera de alcance (otra área).

#### Finanzas
- [PFA Overview · Empty state manda a Gastos para plataformas] — resuelto — `finance-overview.tsx` linkea a `settingsTab("pagos")`.
- [PFA Overview · Componentes Stripe/MP huérfanos] — resuelto — `stripe-section.tsx` y `mercadopago-section.tsx` ya no existen.
- [PFA Overview · Sin gestión de plataformas en /finance] — obsoleto — la gestión vive en Configuración (`payment-platforms-settings-section.tsx`), por diseño.
- [PFA Gastos · Compensación sin alta ni baja] — resuelto — `addTeamCompensation`/`removeTeamCompensation` en `expenses-overview.tsx` → `create/deleteTeamCompensationAction`.
- [PFA Gastos · Fallback "Gasto"/"Suscripción" en nombres vacíos] — resuelto — no hay esos literales en `expenses-overview.tsx`.

### OPERATIONAL_NOTES.md

- [ON Stripe · "balance y transacciones en tiempo real en Finanzas"] — obsoleto — no hay consumidor de `app/stripe/actions.ts`; Stripe `listed: false`.
- [ON Finanzas · "Stripe: API live en sección Stripe"] — obsoleto — sección borrada.
- [ON Operaciones Overview · "Grid de departamentos sigue usando mock"] — obsoleto — `computeDepartmentStatuses` (`lib/executive-reports/compute-departments.ts`) con datos reales.
- [ON Weekly · rutas `/operations/weekly-inputs`] — obsoleto — son redirects a `/operations/inputs`.
- [ON SOPs · "biblioteca vacía muestra mocks/sops.ts"] — obsoleto — `mockSops` sólo se exporta en `mocks/index.ts`, ninguna pantalla lo usa.
- [ON Equipo · invitación con `team_invitations` + Resend] — obsoleto — `inviteTeamMemberAction` crea usuario con contraseña temporal; nada inserta invitaciones → `[EQUIPO-INVITE-LEGADO]`.
- [ON Equipo · "Un miembro desactivado no puede iniciar sesión"] — **falso** — pasa a `[EQUIPO-DESACTIVAR-NO-BLOQUEA]` (P0).
- [ON Equipo · Permisos "full/read/none"] — obsoleto — son `none/view/full` en 13 módulos (`constants/permission-modules.ts`).
- [ON Producto · "Sin datos → mocks/product.ts + badge"] — obsoleto — `emptyProductData` + empty state.
- [ON Producto · "TODO Phase 2: mover a RAG"] — resuelto — `ingestProductContext` (`lib/rag/ingest.ts`).
- [ON Workboard · "Fallback a mock si no hay tareas con tiempo"] — obsoleto — con Supabase el reporte muestra vacío (`workboard-time-report.tsx:190-201`).
- [ON Workboard · Timer en tiempo real no implementado] — sigue como limitación de diseño, documentado en `docs/areas/operaciones.md`; no es pendiente.
- [ON Limitaciones · "Producto 100% mock"] — obsoleto.
- [ON Limitaciones · "Equipo: miembros mock; roles custom no persisten"] — obsoleto — `getTeamPageContextAction`, `team_roles` (65 filas en prod).
- [ON Limitaciones · "Operaciones: team inputs mock"] — obsoleto.
- [ON Limitaciones · "Stripe: solo lectura; sin histórico"] — obsoleto — absorbido en `[FIN-STRIPE-MP-DECIDIR]`.

### FIXES_PENDIENTES.md

- [FIX Team Inputs · copy de pestañas] — resuelto — marcado `[x]`; las pestañas actuales son "Por departamento" / "Input rápido" (`inputs-page-tabs.tsx`).

### PENDIENTES.md

- [1A1-EDITAR-DETALLE] — no es de estas áreas — es de `client_tasks` (`components/clients/client-tasks-section.tsx`), área Clientes.
- [AUDITORIA-ABIERTOS] ítem 7 (ClickUp) — sigue — separado como `[CLICKUP-MONTOS]`.
- [AUDITORIA-ABIERTOS] ítem 2 (Stripe en texto plano) — sigue — dentro de `[FIN-STRIPE-MP-DECIDIR]`.

### docs/historial/AUDITORIA_BACKEND_2026-09-22.md §3 (parte de estas áreas)

- [§3 Dinero · "Balance" de Mercado Pago] — sigue, pero es código muerto — dentro de `[FIN-STRIPE-MP-DECIDIR]`.
- [§3.5 customRoleId en invitaciones] — sigue — `[EQUIPO-CUSTOM-ROLE-ORG]`.
- [§3.8 `invite/validate` devuelve el error interno] — sigue — dentro de `[EQUIPO-INVITE-LEGADO]`.
- [§3.9 buckets `sop-attachments`, `workboard-task-attachments`] — sigue — `[OPS-STORAGE-BUCKETS]`.
- [§3 Confiabilidad.10 meses UTC en payroll] — sigue — `[FIN-MESES-UTC]`.
- [§3 Salud.6 `loadTaskLinksBundle`, `getProductContextForOrg` exportados desde `"use server"`] — sigue, inocuo por RLS (ambos usan `createClient()`); se deja en `[AUDITORIA-ABIERTOS]`.

### docs/TESTING_BACKLOG.md

- [T-1] — sigue — sin tests en `lib/metrics` salvo `match-closer` y `build-sales-funnel-stages`.
- [T-22] — sigue — absorbido en `[TESTS-OPS-FIN-PROD]`.

### docs/PLAN_VERIFICACION.md

- [§19 "Migración aplicada, cortes verificados"] — resuelto — lo dice el propio bloque; lo que sigue abierto es el flujo (ver `docs/operacion/verificacion-manual.md` § Operaciones, Finanzas y Producto (1)).
- [§19 paso "Operaciones → SOPs → Crear"] — ajustar redacción: SOPs ya no está bajo el grupo Operaciones del menú, es ítem propio (`sidebar-modules.ts`), ruta `/operations/sops#crear`.

---

## Infraestructura

> Verificado el 2026-09-23 (commit 038caca). Una línea por ítem: `[ID] — resuelto|obsoleto — evidencia`.

### PENDIENTES.md

- [AUDITORIA-ABIERTOS] — obsoleto como paraguas — se reemplaza por los ítems `AUD-SEG-*`, `AUD-CONF-*`, `AUD-DIN-*`, `AUD-SALUD-*` de `PENDIENTES.md`; sus puntos 4 y 9 ya estaban resueltos (ver abajo).
- [AUDITORIA-ABIERTOS §4] Migraciones rotas / versiones duplicadas / `RUN_ALL_PHASE1.sql` — resuelto — `supabase/ci/check-migrations.sh` en CI; sin versiones repetidas en `supabase/migrations/`; archivo movido a `supabase/scripts/legacy_RUN_ALL_PHASE1_NO_EJECUTAR.sql`.
- [AUDITORIA-ABIERTOS §9] Diff contra prod, historial ordenado, restos legacy, job de CI — resuelto — `list_migrations` de prod = 175 versiones idénticas al repo (2026-09-23); `20260922130000_limpiar_restos_legacy_de_produccion`, `20260922140000_borrar_metric_snapshots`; job `migrations` en `.github/workflows/ci.yml`.
- [AUDITORIA-MIGRACIONES] — resuelto — ya en Completados; `20260922100000` y `20260922110000` figuran aplicadas en prod.
- [PRIVACIDAD-NO-PUBLICA] — resuelto — `lib/supabase/public-paths.ts` incluye `/privacidad`; commit 038caca.
- [REPO-RENOMBRADO-DEPLOYS] (parte Vercel) — resuelto — deploys de producción de `038caca`, `6178565` y `18d57aa` con `githubRepo: limitless-system` (Vercel API). Queda Railway en pendientes.
- [INTEGRACIONES-LOGOS] — obsoleto (no es trabajo pendiente) — los 15 proveedores listados tienen asset en `apps/web/public/integrations/` y `health.test.ts` falla si falta; sólo aplica si entra uno nuevo, y eso ya lo documenta `docs/integraciones/README.md`.
- [TECH-4] VSL player placeholder — obsoleto — `components/landing/vsl-player.tsx` se borró con la landing (CHANGES 2026-09-23); `NEXT_PUBLIC_VSL_URL` ya no la lee nadie (queda su limpieza en `[ENV-LIMPIEZA]`).
- [TECH-5] `children` en Badge con React 19 — obsoleto — `React.HTMLAttributes` extiende `DOMAttributes`, que ya declara `children?: ReactNode`; el CI corre `pnpm typecheck` con `pnpm install --frozen-lockfile` en un runner limpio en cada push, así que un error de tipos no puede quedar escondido por la caché de Vercel/Turbo (estado del último run no verificado desde acá).
- [TECH-1], [TECH-2] — resuelto — PENDIENTES ya los marca completados.

### docs/historial/AUDITORIA_BACKEND_2026-09-22.md

- §1 Aplicar las dos migraciones — resuelto — aplicadas y verificadas en prod (PENDIENTES `[AUDITORIA-MIGRACIONES]`, CHANGES 2026-09-22).
- §1 Unipile cerrado hasta configurar el secreto — resuelto — `UNIPILE_WEBHOOK_SECRET` existe en Vercel (Production y Preview). Si el webhook está registrado con el header correcto queda en `docs/operacion/verificacion-manual.md` § Infraestructura.
- §2 C1–C3, Alto, Medio, Funcional — resuelto — ver commits de la auditoría; spot-check: `protect_profile_columns` en `20260922100000`, `lib/supabase/public-paths.ts` con `/api/webhooks/*` y `/api/discord/*`, `lib/storage/org-path.ts`, `lib/security/safe-equal.ts`, `instrumentation.ts`, `lib/supabase/fetch-all-rows.ts`.
- §3 🔵 Base de datos y migraciones 1–4 — resuelto — ídem §9 de arriba.
- §3 ⚪ Salud del código 5 (chequeo de migraciones en CI) — resuelto parcialmente — el job `migrations` existe; lo que falta (build, e2e) sigue como `[AUD-SALUD-5 / CI-COBERTURA]`.

### docs/security-audit-api-keys.md

- Medida 1 (sin secretos en el bundle) — resuelto y vigente — ningún `"use client"` importa `lib/supabase/admin`, `lib/security/encryption` ni `lib/ai`; `NEXT_PUBLIC_*` en uso son todos públicos por diseño. Doc reemplazado por `docs/arquitectura/seguridad.md`.
- Rate limiting en Postgres — resuelto — `lib/rate-limit.ts` + `consume_rate_limit` (`20260808100000`, fix `20260907100000`).
- Acción RLS sobre tablas de integraciones — resuelto — `20260606100000_security_hardening_rls.sql` + `20260922110000` (Zernio, YouTube).

### docs/TESTING_BACKLOG.md

- §0 "Scope de Vitest sólo incluye `lib/**`" — resuelto — `apps/web/vitest.config.ts` incluye `**/*.test.ts` (ya corren `constants/__tests__`).
- §0 "Cobertura actual: 199 tests, sólo `lib/funnels/`" — obsoleto — hoy 89 archivos y ~1.130 casos en 31 carpetas.
- §5 [T-24] parte `lib/security/` — resuelto parcialmente — `lib/security/__tests__/{encryption,safe-equal}.test.ts`; `sanitize` y el wrapper siguen abiertos.
- §6 "Sin cobertura medida", "packages sin test", "E2E no corre en CI", "sin helper de mock" — siguen abiertos (`T-INFRA-*`, `UI-SIN-TESTS`).
- §2 [T-6]…[T-8] — fuera de alcance de infra — los toma el backlog de Embudos.

### docs/PLAN_VERIFICACION.md

- "Auditoría de backend" paso 1 (antes de aplicar: `db diff`, columnas de `profiles`, índices duplicados) — resuelto — migraciones aplicadas y diff hecho el 2026-09-22.
- "Auditoría de backend" paso 2 (aplicar) — resuelto — ídem.
- "Auditoría de backend" paso 3, filas "PATCH role/organization_id → 42501", "`search_rag_chunks` permission denied", "`zernio_integrations`/`youtube_integrations` vacías con JWT de viewer" — resuelto — verificado en prod en transacciones con rollback (PENDIENTES `[AUDITORIA-MIGRACIONES]`). El resto del paso 3 sigue en `docs/operacion/verificacion-manual.md` § Infraestructura.
- §13.7 "OAuth no se puede probar desde un preview" — obsoleto como verificación — es una limitación, documentada en `docs/operacion/entorno-y-deploy.md` y `docs/arquitectura/seguridad.md`.

### OPERATIONAL_NOTES.md

- "Auth cron: si `CRON_SECRET` no está set, permite acceso" — obsoleto — `lib/integrations/cron-auth.ts` lanza si falta.
- Tabla de crons con 6 entradas — obsoleto — `vercel.json` tiene 19; ver `docs/arquitectura/jobs-webhooks-y-colas.md`.
- "Fathom: sin BullMQ async aún" / TODO `lib/fathom/process-call.ts:282` / `lib/fathom/analyze-transcript.ts:15` "BullMQ queue fathom-analysis" — obsoleto — el análisis va por QStash (`publishFathomAnalysisJob` → `/api/queue/process-fathom-analysis`); `packages/queue` (BullMQ) nunca se usó. El comentario TODO en `analyze-transcript.ts:15` quedó viejo (lo limpia el área Ventas/Fathom).
- "Discord: API message route es stub" — sigue siendo cierto (`/api/discord/message` responde `ok`), no es pendiente: el bot escribe directo.
- "Producto, Equipo, Inteligencia, Reportes: 100% mock" y "Integraciones catálogo desde `mocks/integrations.ts`" — obsoleto — el catálogo es `lib/integrations/registry.ts` y `mocks/integrations.ts` no existe; el uso residual de mocks está en `[MOCK-DATA-AUDIT]`.
- "YouTube: sin cron; sync solo al conectar" — sigue cierto; lo que está mal es el registro (`[INTEGRACIONES-REGISTRO-DESALINEADO]`).
- "`get_my_organization_id()` sólo lee profiles" (CLAUDE.md §6) — obsoleto — desde `20260620100000` prioriza el claim JWT.

- TODO `lib/youtube/retention.ts:5` "retención real desde YouTube Analytics API" — obsoleto — TECH-2 lo implementó el 2026-08-11 (PENDIENTES, tabla de completados); el comentario quedó viejo.

### docs/mock-data-audit.md (2026-07-03)

- Documento completo — obsoleto — el recuento actual es de 10 archivos de producción que importan `@/mocks` (`[MOCK-DATA-AUDIT]`); varios hallazgos del doc (catálogo de integraciones, Producto 100% mock) ya no aplican.

### docs/INTEGRACIONES_MAPA.md

- Documento completo — obsoleto — reemplazado por `docs/integraciones/README.md`. Dato incorrecto que tenía: "Discord no se ofrece" (el registro lo tiene `listed: true`).

### docs/historial/DB_DIFF_PRODUCCION_2026-09-22.md

- "Qué queda para adelante" 1–4 — resuelto — historial = repo (175/175), versiones únicas, restos legacy borrados, chequeo en CI.
- "Permisos: SELECT de tabla sobre `organizations` en prod" — sigue abierto como `[DB-ORGS-SELECT-COLUMNAS]`.

### FIXES_PENDIENTES.md

- Documento completo (auditoría de mayo 2026) — resuelto — los 18 ítems están tildados `[x]` en el propio archivo; ninguno es de infraestructura.
