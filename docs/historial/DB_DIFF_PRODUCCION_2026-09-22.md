# DB diff: repo vs producción — 2026-09-22

Comparación del esquema que arman las migraciones de `supabase/migrations`
contra la base de producción (Supabase **OTC**, `nrzlylzbmsuowzhpdnjl`).

## Cómo se hizo

No había contraseña de la base para `supabase db diff`, así que se hizo en tres
pasadas con la misma consulta de inventario en las dos bases:

1. **Repo:** todas las migraciones aplicadas en orden sobre un Postgres 16 local,
   con pgvector y los roles, schemas y default privileges de Supabase simulados.
2. **Por tabla:** un hash por categoría de las 147 tablas de producción. Se
   comparan columnas, RLS, índices, constraints, policies, triggers, grants,
   funciones y vistas. El inventario del repo viaja dentro de la consulta, y
   producción devuelve sólo las diferencias.
3. **Por objeto:** en las tablas que difieren, cada columna, índice, constraint,
   policy y trigger por separado. Las funciones se comparan por cuerpo
   normalizado (sin espacios ni comentarios).

Todas las consultas a producción fueron de sólo lectura, salvo la migración de
reconciliación.

## Resultado

**Las 144 tablas del repo existen en producción.** Producción tenía una tabla de
más (`metric_snapshots`), ya borrada. **Las 17 funciones tienen el mismo cuerpo**; sólo cambian
espacios y comentarios.

### Diferencias que importaban, ya resueltas

| # | Diferencia | Impacto | Resolución |
|---|---|---|---|
| 1 | 🔒 **`team_member_integrations`**: producción tenía la policy `members_own_integrations` = `ALL USING (auth.uid() = user_id OR org = mía)`, sin `WITH CHECK` | Cualquier miembro leía las integraciones de sus compañeros: Fathom y Calendly de cada closer, key cifrada, `webhook_secret` y `webhook_token`. Cualquier usuario podía **insertar filas en otra org** con su propio `user_id` | Reemplazada por la del repo (propia **y** de la propia org). Verificado en prod: 0 filas ajenas visibles; el insert en otra org da `42501` |
| 2 | Rol `member` en `profiles_role_check`: prod lo admite, el repo no | La app crea a los invitados con `role = 'member'`, así que en una base nueva las invitaciones fallaban | Agregado al repo |
| 3 | `zernio_conversation_analysis.suggested_next_message` y `scheduling_process_missing`: sólo en prod | El inbox de Zernio las lee y escribe, y en una base nueva fallaba | Agregadas al repo |
| 4 | 33 índices de FK y de performance sólo en prod (`rls_perf_and_fk_indexes`, aplicada a mano) | En una base nueva, joins y policies sin índice | Agregados al repo (`create index if not exists`) |
| 5 | `clients_status_idx` sólo en el repo | Producción filtraba clientes por estado sin índice | Creado en prod |
| 6 | **Tres migraciones del repo no corrían desde cero**: `20260710120000` (`organization_members` inexistente), `20260710140000` (`set_updated_at()` usada antes de crearse) y `20260720100000` (`UPDATE … FROM LATERAL` inválido) | `supabase db reset`, los preview branches y cualquier base local fallaban | Corregidas. Producción no las vuelve a correr. **Las 171 migraciones ahora arman una base desde cero sin errores**, cada una en su propia transacción como hace la CLI |

Todo esto va en `20260922120000_reconciliar_con_produccion.sql`, ya aplicada en
producción. Es idempotente, así que en una base nueva y en producción deja lo
mismo.

Aplicadas antes en la misma sesión (ver `CHANGES.md`): las de perfiles, RPCs,
secretos de integraciones y columnas editables de `organizations`.

### Diferencias que quedan, a propósito

**Sólo en producción, sin uso en el código.** Son restos de migraciones aplicadas
a mano. ✅ Las columnas y la tabla `metric_snapshots` se borraron el mismo día
(ver "Qué queda para adelante", punto 3). Las dos funciones siguen:

| Objeto | Qué es |
|---|---|
| Función `current_user_is_founder_or_admin()` | La usa la policy consolidada de `profiles` en prod |
| Función `rls_auto_enable()` | De la plataforma Supabase, no de Limitless |

**Sólo en el repo, sin aplicar en producción:**

| Objeto | Qué es |
|---|---|
| `organizations`: las 7 columnas OAuth de Claude + `claude_credential_mode` (`20260711180000`) | Nunca se aplicó. `lib/ai/credential-resolver.ts` ya evita depender de ellas |
| `team_member_integrations`: `api_key`, `created_at`, `updated_at` y la FK de `user_id` | El código no las usa (lee `encrypted_api_key`) |

**Equivalentes con distinto nombre o forma:**
- **Policies consolidadas en prod** (`consolidate_duplicate_rls_policies`). Por
  ejemplo, `Users read own or portfolio clients` reemplaza a `Users read org
  clients` + `holding_reads_portfolio_clients`. Misma lógica.
- **El índice GIN de `content_pieces.sales_attributed`** se llama distinto en
  cada lado.
- **Policies con `(select auth.uid())`** en prod, que es la forma optimizada de la
  misma condición.

**Permisos:** en producción `authenticated` tiene SELECT a nivel tabla sobre
`organizations`. En el repo es por columna y oculta `claude_api_key_encrypted`,
así que en prod un miembro puede leer el **ciphertext** de la key de Claude de su
propia org. Sin `ENCRYPTION_MASTER_KEY` no sirve de nada, y restringirlo rompe
cualquier `select("*")` con cliente de usuario. Queda para cuando se revise qué
columnas lee la app así.

## Qué queda para adelante

1. ✅ **Historial de migraciones (ordenado el 2026-09-22).**
   `supabase_migrations.schema_migrations` tiene ahora exactamente las 171
   versiones del repo, y `supabase db push` no tiene nada pendiente.
   - Las 55 migraciones que se habían aplicado a mano se marcaron como aplicadas.
   - Las 118 entradas anteriores, que tenían otros números y otros nombres, se
     reemplazaron. Quedaron respaldadas en
     `supabase_migrations.schema_migrations_backup_20260922`.
   - ⚠️ `20260711180000_org_ai_credentials` figura como aplicada **aunque sus
     columnas OAuth no existen en prod**. Es a propósito: si quedara pendiente,
     `db push` recrearía `organization_claude_status` sin el filtro por org y
     reabriría la fuga que cerró `20260922110000`. Si algún día se quiere OAuth,
     hacerlo con una migración nueva.
2. ✅ **Versiones duplicadas.** Se resolvieron sumando un segundo:
   `20260706100001_business_context_index_error`,
   `20260717100001_fix_utm_youtube_video_external_ids` y
   `20260825100001_plans_client_plan_delete`. El orden de aplicación no cambia.
   `RUN_ALL_PHASE1.sql` pasó a `supabase/scripts/` con aviso de no ejecutar.
3. ✅ **Restos legacy limpiados (2026-09-22).**
   - `20260922130000_limpiar_restos_legacy_de_produccion`: borra 15 columnas.
     Antes se midió que estaban vacías en todas las filas (las 9 de
     `closing_calls` sobre 1.443 llamadas, `fathom_calls.member_user_id` y las 3
     de `zernio_integrations`). También deja `manychat_events`, vacía, igual que
     en el repo.
   - `20260922140000_borrar_metric_snapshots`: borra la tabla vieja. Tenía 36
     valores de histórico importado de una org, que la app ya no mostraba; se
     borró por decisión del usuario.
   - Las dos son `if exists`, así que en una base nueva no hacen nada.
4. ✅ **Chequeo en CI (2026-09-22).** Job `migrations` en
   `.github/workflows/ci.yml`: Postgres 17 con pgvector y
   `supabase/ci/check-migrations.sh`. Valida los nombres y que las versiones sean
   únicas, y aplica todas las migraciones desde cero, una transacción cada una.
   Localmente tarda ~7 s con las 173.
