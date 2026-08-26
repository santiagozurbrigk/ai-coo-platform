# CHANGES.md — Registro de cambios del monorepo OTC

> **Para Claude Code y cualquier asistente IA que trabaje en este repo:**
>
> **OBLIGATORIO — leer este archivo al inicio de cada sesión** que involucre cambios al código.  
> **OBLIGATORIO — actualizar este archivo al final de cada sesión** (o después de cada bloque de cambios significativo).
>
> El formato de cada entrada está documentado en la sección [Formato de entrada](#formato-de-entrada).  
> No omitir este paso aunque el cambio parezca pequeño — la continuidad del contexto depende de esto.

---

## Historial de cambios

---

### 2026-08-26 — FIX-IMPORT-EMPTY-ROWS: parsers Excel ignoran filas vacías — elimina errores falsos

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `b813954`  
**Módulo(s) afectado(s):** `lib/clients/excel-parser.ts`, `lib/closing/excel-parser.ts`

**Qué se hizo:**
- Agregado check `allEmpty` al inicio del `forEach` en ambos parsers: si todos los valores de la fila son cadena vacía (después de trim), la fila se ignora silenciosamente sin generar error.

**Por qué / finalidad:**
Un Excel con 264 clientes mostraba "512 errores" porque tenía estilos/formato aplicados hasta la fila 776. SheetJS incluye todas esas filas dentro del bounding box (`!ref`) con `defval: ""` → el parser generaba un error "Nombre vacío" por cada fila vacía. El resultado era correcto (264 importados) pero el mensaje de error era confuso y alarmante.

**Decisiones de diseño:**
Solo se omite silenciosamente si la fila está 100% vacía. Si una fila tiene algún dato (ej: teléfono o email pero sin nombre), sigue generando el error para que el usuario lo vea.

---

### 2026-08-26 — FIX-IMPORT-SHEET-MISMATCH: wizard pasa sheetName al parser para evitar discrepancia de hoja

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `f427aa2`  
**Módulo(s) afectado(s):** `lib/clients/excel-parser.ts`, `app/clients/import-actions.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- `parseClientsExcel` ahora acepta `sheetName?: string` como tercer parámetro. Si se provee, usa esa hoja (con fallback a la primera si no existe). Si no, mantiene la lógica anterior ("clientes" o primera hoja).
- `importClientsFromExcelAction` acepta y reenvía `sheetName?` a `parseClientsExcel`.
- `data-import-wizard.tsx` pasa `clientsPreview.activeSheet` al action de importación.

**Por qué / finalidad:**
El wizard usaba `pickBestSheet` (score-based heuristic) para la preview, pero `parseClientsExcel` usaba su propia lógica independiente (`find("clientes") ?? first`). Cuando el archivo no tenía tab llamado "Clientes", las dos funciones elegían hojas distintas → los headers del mapping no coincidían con los del parser → `nameCol = undefined` → todos los clientes fallaban con "Nombre vacío" (41 errores).

**Decisiones de diseño:**
El caller (wizard) es quien sabe qué hoja el usuario estaba viendo. Pasarlo explícitamente es más robusto que re-ejecutar heurísticas en el servidor.

**Riesgos / deuda:**
- Si `clientsPreview` es `null` (raro: solo si el usuario saltó el mapper sin preview), el import cae al fallback (`find("clientes") ?? first`). Aceptable.

---

### 2026-08-26 — FIX-IMPORT-CLIENTES-FILA-TITULO: parseClientsExcel ahora salta filas de título/fusionadas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `6104e7e`  
**Módulo(s) afectado(s):** `lib/clients/excel-parser.ts`

**Qué se hizo:**
- Reemplazado `XLSX.utils.sheet_to_json` (sin `header: 1`) por la misma estrategia que ya usaba `getExcelPreviewAction`: `sheet_to_json({ header: 1 })` → arrays crudos, luego detectar la primera fila con ≥2 celdas no vacías como fila real de encabezados, y construir objetos keyed manualmente.
- Esto permite saltar filas de título/fusionadas antes de los encabezados reales (Nombre, Email, Teléfono…).

**Por qué / finalidad:**
El Excel del usuario tenía una fila de título fusionada como primera fila. El parser anterior la trataba como header → todos los lookups de columnas fallaban → los 37 clientes se rechazaban ("nombre vacío").

**Decisiones de diseño:**
- Umbral de ≥2 celdas no vacías para detectar el header real (consistente con `getExcelPreviewAction`).
- Sin cambios al contrato de tipos ni a los callers.

**Riesgos / deuda técnica pendiente:** Ninguno conocido.

---

### 2026-08-26 — FIX-BUILD-TEXTAREA-TYPES: corregir tipo HTMLTextAreaElement en handlers de payment-modal

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `e656620`  
**Módulo(s) afectado(s):** `components/closing/payment-modal.tsx`

**Qué se hizo:**
- Corregidos 3 handlers `onChange` en `<Textarea>` que tenían tipo `React.ChangeEvent<HTMLInputElement>` (incorrecto) → `React.ChangeEvent<HTMLTextAreaElement>` (correcto).
- Líneas afectadas: 592 (`setMainPain`), 601 (`setObjections`), 610 (`setFeedbackNotes`).
- El build de Vercel (`dpl_Hfs8Ct6FFrwHjMdkTeJ3Z1b8XuAi`) pasó con estado READY.

**Por qué / finalidad:**
Un sed masivo de la sesión anterior había reemplazado globalmente `onChange={(e) =>` por `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>` sin distinguir entre `<Input>` y `<Textarea>`. Next.js detectó la incompatibilidad de tipos al compilar `payment-modal.tsx` y el build falló.

**Riesgos / deuda técnica pendiente:**
- La migración SQL `20260825100000_plans_client_plan_delete.sql` sigue pendiente de aplicar manualmente en Supabase Dashboard.

---

### 2026-08-25 — FIX-BUILD-UNESCAPED-ENTITIES: escapar comillas en JSX de plan-manager-dialog

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `8a3eea4`  
**Módulo(s) afectado(s):** `components/clients/plan-manager-dialog.tsx`, `components/closing/payment-modal.tsx`

**Qué se hizo:**
- `plan-manager-dialog.tsx` línea 135: reemplazó comillas `"` literales en JSX por `&quot;` (ESLint `react/no-unescaped-entities` las trata como error de build).
- `payment-modal.tsx`: eliminó variable `firstInstallmentPaid` definida pero nunca usada.

**Por qué / finalidad:**
El primer build de Vercel (`dpl_54b7QhUq86K328EDWZdKXPgvW5dL`) falló por el error `react/no-unescaped-entities`. ESLint en modo Next.js trata ese rule como error, no warning.

---

### 2026-08-25 — FEAT-PLANES-CUOTAS-CLIENTES: planes con sistemas de cuotas, eliminar clientes, asignar plan, closing con cuotas manuales

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `54fb73c`  
**Módulo(s) afectado(s):** `types/plans.ts`, `types/clients.ts`, `types/closing.ts`, `app/clients/plan-actions.ts`, `app/clients/actions.ts`, `components/clients/plan-manager-dialog.tsx`, `components/clients/clients-list.tsx`, `components/closing/payment-modal.tsx`, `lib/clients/mapper.ts`, `lib/validations.ts`, `providers/platform-data-provider.tsx`, `supabase/migrations/`

**Qué se hizo:**

1. **Migración SQL** (`20260825100000_plans_client_plan_delete.sql`):
   - Nueva tabla `public.plans` con: `id`, `organization_id`, `name`, `duration_days`, `installment_systems` (JSONB array), timestamps
   - RLS policies para read/insert/update/delete por miembros de la organización
   - Columnas nuevas en `clients`: `plan_id uuid REFERENCES plans(id) ON DELETE SET NULL`, `selected_installment_system_id text`
   - Policy nueva para eliminar clientes: "Users delete org clients"

2. **Tipos nuevos** (`types/plans.ts`): `InstallmentSystem { id, name, count, amountPerInstallment }`, `Plan { id, name, durationDays?, installmentSystems[], createdAt }`

3. **Server Actions planes** (`app/clients/plan-actions.ts`): `listPlansAction`, `createPlanAction`, `updatePlanAction`, `deletePlanAction` — todos con RLS via `requireOrganizationId()`

4. **Actions clientes** (`app/clients/actions.ts`): `deleteClientAction(id)`, `assignClientPlanAction(clientId, planId?, systemId?)`

5. **PlanManagerDialog** (nuevo componente): reemplaza `PlanDurationsDialog`. Modo list/new/edit, formulario con nombre + duración + sistemas de cuotas dinámicos (agregar/eliminar). Cada sistema: nombre, cantidad de cuotas, monto por cuota.

6. **ClientsList** (reescrito):
   - Eliminado botón "Cargar clientes"
   - Reemplazado "Duraciones de planes" por "Crear planes" (abre PlanManagerDialog)
   - Icono eliminar por fila (Trash2) → confirmación → `deleteClientAction` → `refreshClients`
   - Icono asignar plan por fila (BookOpen) → `AssignPlanDialog` → `assignClientPlanAction` → `refreshClients`
   - Muestra nombre del plan asignado (del array `plans` si hay `planId`, si no de `planDurations` legacy)

7. **PaymentModal** (reescrito):
   - Carga planes al abrir con `listPlansAction()`
   - Selector opcional "Plan contratado" (pre-llena offeredProduct con el nombre del plan)
   - Para cuotas: si el plan tiene sistemas, selector de sistema → N campos individuales de monto (uno por cuota, default = `amountPerInstallment` del sistema)
   - Sin sistema: campo uniforme `installmentAmount` existente
   - Payload incluye `customInstallmentAmounts[]`, `planId`, `selectedInstallmentSystemId`

8. **Provider** (`platform-data-provider.tsx`): `buildClientFromPayment` calcula revenue con `customInstallmentAmounts` (suma de montos individuales si están definidos), mapea `planId` y `selectedInstallmentSystemId`

9. **Mapper, validaciones**: `plan_id`/`selected_installment_system_id` en `ClientRow`, `rowToClient`, `clientToInsertRow`, `patchToUpdateRow`; `planId`/`selectedInstallmentSystemId` en `clientFieldsSchema`

**Por qué / finalidad:**
- El founder necesitaba definir planes con sistemas de cuotas (ej: "2 cuotas de $1000", "3 cuotas de $700") para calcular saldo adeudado por cliente
- El closer necesitaba poder registrar montos reales por cuota al cerrar (ej: cuota 1 → $800, cuota 2 → $1200 aunque el plan diga $1000 c/u)
- Se eliminó el botón "Cargar clientes" como fue solicitado
- Se añadió la capacidad de eliminar clientes (antes no existía)

**Decisiones de diseño:**
- `installment_systems` como JSONB array en `plans` (no tabla separada) — más simple, el plan es siempre leído completo
- Montos individuales como array paralelo al contador de cuotas (`customInstallmentAmounts[i]`)
- `assignClientPlanAction` llama al `updateClientAction` existente — no duplica lógica de update

**Riesgos / deuda técnica pendiente:**
- La migración SQL debe aplicarse en Supabase (no fue aplicada automáticamente)
- El cálculo de "adeudado" (outstanding balance) usa los pagos registrados vs. total del plan; si el plan tiene cuotas custom, la lógica en `computeOutstandingBalance` puede necesitar revisión futura
- `PlanDurationsDialog` eliminado del módulo de clientes; si había referencias en otras partes del código, revisar

---

### 2026-08-25 — FIX-VENTAS-CASH-COLLECTED: panel de métricas de ventas usa gastos configurados para cash collected

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `components/sales/sales-metrics-redesign.tsx`

**Qué se hizo:**
- En la rama de snapshot fallback, `effectiveCashCollected` ahora usa `financeSummary.gastosTotales` (gastos configurados vía provider) como primera fuente en lugar de `sm["gastos"]` (que siempre es 0 en el snapshot importado).
- Formula: `max(0, sm["facturacion"] - (financeSummary.gastosTotales > 0 ? financeSummary.gastosTotales : sm["gastos"]))`

**Por qué / finalidad:**
Panel de finanzas mostraba "Cash collected: US$ 10.000" (correcto) pero panel de métricas de ventas mostraba "US$ 12.500" (= facturación sin descontar gastos). La inconsistencia surgía porque el snapshot almacena `cash_collected = facturacion - 0` al momento del import (sin gastos). El panel de ventas leía ese valor directamente en lugar de derivarlo con los gastos reales.

**Decisiones de diseño:**
- Misma prioridad que el provider: gastos configurados en módulo > campo gastos del snapshot > 0
- Consistente con `finance-data-provider.tsx` y `collect-context.ts` (fixes de sesión anterior)

**Riesgos / deuda técnica:** Ninguno adicional — el provider ya tenía `gastosTotales` correcto.

---

### 2026-08-25 — FIX-BASELINE-GASTOS: cashCollected y margenPercent usan gastos configurados del módulo (no snapshot)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `providers/finance-data-provider.tsx`, `lib/intelligence/collect-context.ts`

**Qué se hizo:**
- `finance-data-provider.tsx` (financeSummary baseline): se reemplaza `bGastos = salesBaselineMetrics["gastos"] ?? 0` (siempre 0, el snapshot de ventas no tiene campo gastos) por `effectiveGastos = live.gastosTotales > 0 ? live.gastosTotales : bGastosSnapshot`. Ahora `cashCollected` y `margenPercent` del baseline usan los gastos reales configurados en el módulo de finanzas.
- `collect-context.ts` (inteligencia): mismo fix — `effectiveGastos` para el `bMargen` del agente IA.

**Por qué / finalidad:**
El usuario tiene gastos configurados en el módulo de finanzas (gastos fijos, suscripciones, equipo). Estos gastos producen `live.gastosTotales` correcto. Pero el baseline fallback computaba `cashCollected = facturacion - bGastos` donde `bGastos = snapshot["gastos"] = null → 0`. Resultado: `cashCollected = 12500` y `margenPercent = 100%`, ignorando totalmente los gastos reales configurados. Ahora el baseline usa los gastos configurados como fuente primaria y solo cae al snapshot si no hay config.

**Decisiones de diseño:**
- Prioridad: gastos configurados (módulo finanzas) > campo gastos del snapshot > 0
- `monthlySeries` ya usaba `expensesSummary.totalMonthly` correctamente — ahora `financeSummary` es consistente con eso.
- No se cambia la lógica de facturación (sigue viniendo del snapshot cuando no hay datos live).

**Riesgos / deuda técnica pendiente:** Si el usuario importa un snapshot con campo `gastos` pero NO ha configurado gastos en el módulo, se usa el snapshot — comportamiento correcto. Si ambos están configurados, gana el módulo.

---

### 2026-08-25 — FIX-ANIMATED-NUMBER-LOCALE: parseAnimatableMetricValue soporta formato numérico europeo (es-AR)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `packages/ui/src/lib/parse-metric-value.ts`, `apps/web/lib/finance/format.ts`

**Qué se hizo:**
- `parseAnimatableMetricValue`: se agrega función `normalizeNumPart` que detecta formato europeo/es-AR antes de parsear el número animado:
  - `"12.500"` (punto como miles) → `"12500"` → 12500 ✓ (antes parseaba como 12.5)
  - `"49,6"` (coma como decimal) → `"49.6"` → 49.6 ✓ (antes stripeaba la coma → 496)
  - `"1.234,56"` (miles + decimal europeo) → `"1234.56"` → 1234.56 ✓
  - Formato inglés sin cambios (comma como miles, punto como decimal)
- `formatMoney`: agrega `minimumFractionDigits: 0` junto con `maximumFractionDigits: 0` para evitar que USD fuerce 2 decimales en algunos browsers.

**Por qué / finalidad:**
El dashboard mostraba "496%" en lugar de "49,6%" para tasa de agendamiento, y "US$ 12,50" en lugar de "US$ 12.500" para MRR. El componente `MetricAnimatedValue` parsea el string pre-formateado para animar la transición numérica. La función de parseo trataba la coma (decimal en es-AR) como separador de miles (y la eliminaba), y el punto (miles en es-AR) como decimal — produciendo valores ×10 para porcentajes e ÷1000 para montos.

**Decisiones de diseño:**
- La fix vive en el parser, no en los formatters — el formato es correcto para mostrar al usuario, el problema era la interpretación interna del parser.
- La detección de formato es por patrón regex heurístico: miles europeos = `/[0-9]{1,3}(\.[0-9]{3})+/`, decimal europeo = `/[0-9]+,[0-9]{1,2}$/`. Funciona para todos los valores actuales del sistema.
- El fallback (formato inglés) mantiene el comportamiento anterior para valores no reconocidos.

**Riesgos / deuda técnica pendiente:** Ninguno relevante. Si en el futuro se usan valores como "1,234" (inglés con miles-comma), podrían ambiguarse con "1,234" (4 dígitos después de coma), pero ese patrón no ocurre en el sistema actual.

---

### 2026-08-25 — FIX-DASHBOARD-SALES-BASELINE: Dashboard usa fallback baseline para métricas de ventas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `providers/finance-data-provider.tsx`, `components/dashboard/dashboard-page-content.tsx`

**Qué se hizo:**
- `FinanceDataProvider`: se expone `salesBaselineMetrics` en el contexto (`FinanceDataContextValue`) y se agrega al deps array del `value` useMemo.
- `DashboardPageContent`: se consume `salesBaselineMetrics` del provider; se construye `effectiveSalesMetrics` con fallback baseline cuando no hay datos live (`totalConversations === 0 && bookingRate === 0`). Se pasa `effectiveSalesMetrics` a `deriveDashboardData` en lugar de `salesMetrics`.

**Por qué / finalidad:**
El panel de métricas de ventas (`/sales/metrics`) mostraba "Tasa de agendamiento: 50%" (desde snapshot importado) pero el dashboard (`/dashboard`) mostraba 0%. La inconsistencia se debía a que ambos componentes cargaban los datos por caminos distintos: el panel de ventas recibía el snapshot como prop de Server Component, el dashboard nunca lo veía. Ahora el dashboard aplica el mismo patrón de fallback baseline-live.

**Decisiones de diseño:**
- Solo se aplica el fallback en `bookingRate` y `ghostingRate` (son tasas históricas con sentido como baseline). Las métricas de estado live (`totalConversations`, `activeConversations`, etc.) se mantienen en 0 — son estado actual, no histórico.
- La condición de fallback es `hasLiveData = totalConversations > 0 || bookingRate > 0` — si hay conversaciones live, no se toca nada.
- Misma lógica que `SalesMetricsRedesign` usa con `useSnapshotFallback`.

**Riesgos / deuda técnica pendiente:** Ninguno relevante.

---

### 2026-08-25 — FIX-FORMAT-MONEY: formatMoney cambia es-ES → es-AR para evitar confusión de separadores

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `lib/finance/format.ts`

**Qué se hizo:**
- `formatMoney` ahora usa `es-AR` en lugar de `es-ES` para formatear USD.
- Resultado antes: `"12.500 US$"` — símbolo al final. El usuario argentino lee el punto como decimal y ve "12,50 US$" (doce con cincuenta).
- Resultado ahora: `"US$ 12.500"` — símbolo al principio. Unívoco: "US$ doce mil quinientos".
- ARS también usa `Math.round` + `toLocaleString("es-AR")` para consistencia (ya no muestra " ARS" al final).

**Por qué:** El dashboard mostraba el MRR del baseline como "12,50US$" (confuso) en lugar de "US$ 12.500" (claro). El cambio de locale resuelve tanto el orden del símbolo como la legibilidad del separador de miles.

---

### 2026-08-25 — FIX-BASELINE-GAPS: Baseline en módulo Intelligence y monthlySeries

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Módulo(s) afectado(s):** `lib/intelligence/collect-context.ts`, `providers/finance-data-provider.tsx`

**Qué se hizo:**
- **`lib/intelligence/collect-context.ts`**: `collectIntelligenceData()` ahora incluye la query de `metrics_snapshots` en el `Promise.all` existente. Si `finance.facturacion === 0` (usuario sin integraciones activas), aplica los valores del snapshot como fallback para `facturacion` y `margenPercent` en el bloque `finance`. Esto hace que las páginas `/intelligence/insights` y `/intelligence/context` reflejen los datos reales importados, no ceros.
- **`providers/finance-data-provider.tsx`** — `monthlySeries`: cuando toda la serie de 6 meses tiene `facturacion === 0` (usuario nuevo sin eventos de cobro en vivo) y `salesBaselineMetrics` tiene datos, inyecta los valores del snapshot en el mes más reciente. Así los gráficos de área dual en `/finance` y los sparklines en `/sales/metrics` no muestran una línea plana en cero.

**Por qué / finalidad:**
- Cierre de los dos últimos vacíos de la arquitectura baseline: Intelligence y gráficos de serie temporal.
- El Intelligence module alimenta snapshots, reportes y el agente — sin baseline, los análisis IA sobre negocios nuevos no tenían datos de facturación.
- El `monthlySeries` all-zeros hacía que el gráfico de tendencia en `/finance` fuera completamente plano aunque el founder tuviera datos importados.

**Decisiones de diseño:**
- La query de baseline en `collect-context.ts` se añade al `Promise.all` existente (parallel, sin latencia extra).
- En `monthlySeries`, sólo se parchea el mes más reciente (no los 6) para no generar datos artificiales en meses pasados que el founder no declaró.
- Condición de parcheo: `series.every(m => m.facturacion === 0)` — si hay aunque sea un mes con datos reales, no se toca la serie.

**Riesgos / deuda técnica pendiente:**
- El snapshot inyectado en `monthlySeries` es el valor global del snapshot, no un desglose real mes a mes. Es un "hito de referencia" visual para el mes actual. Cuando el founder tenga datos live, desaparecerá naturalmente.
- Si el founder tiene datos de varios períodos en `metrics_snapshots`, sería más rico poblar cada mes correspondiente. Queda como mejora futura.

---

### 2026-08-25 — FEAT-BASELINE-ARCHITECTURE: Arquitectura de datos baseline escalable

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `6140f3d` — feat(metrics): arquitectura de baseline escalable — datos históricos + live  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/baseline-service.ts` (nuevo), `providers/finance-data-provider.tsx`, `lib/ai/org-context.ts`

**Qué se hizo:**
- **Nuevo `lib/metrics/baseline-service.ts`**: servicio centralizado de lectura de `metrics_snapshots`. Exports:
  - `getLatestOrgBaseline(orgId, category)` — snapshot más reciente de una categoría
  - `getAllLatestBaselines(orgId)` — un snapshot por categoría (para el agente)
  - `extractFinanceBaseline(snapshot)` — normaliza a `{facturacion, gastos, cashCollected, margenPercent}`
- **`finance-data-provider.tsx`**: el provider ahora carga baseline de ventas al montar. Si `live.facturacion === 0` y hay baseline, hace fallback a los datos importados para `facturacion`, `cashCollected`, `gastosTotales` y `margenPercent`. Cuando el software tenga datos reales integrados (clientes/pagos), éstos toman prioridad automáticamente.
- **`lib/ai/org-context.ts`**: el agente de IA ahora recibe la sección `MÉTRICAS HISTÓRICAS DE REFERENCIA` en su contexto. Puede analizar, comparar y dar recomendaciones usando los números reales del negocio desde el primer día de uso.

**Por qué / finalidad:**
- Resolver que los datos importados en "Métricas de ventas" sólo aparecían en el módulo de ventas, pero el resto del software (finanzas, agente) no los veía.
- Arquitectura de dos capas: Baseline (histórico, importado) + Live (tiempo real, integraciones). Live prevalece siempre; baseline es el fallback cuando live = 0.

**Decisiones de diseño:**
- `baseline-service.ts` es server-only (usa `createAdminClient`), no un Server Action (`"use server"`), para que sea importable desde `org-context.ts` y otras utilidades de servidor.
- El finance provider usa `getSalesMetricsSnapshotsAction` (ya existía) para cargar el baseline — reutiliza la query existente, no duplica lógica.
- La condición de fallback es `live.facturacion === 0` — si el founder tiene aunque sea un cliente con pago, los datos reales prevalecen.

**Riesgos / deuda técnica pendiente:**
- El agente invalida cache con TTL de 10 min. Si el founder importa datos y chatea inmediatamente, el agente podría no ver el baseline hasta el próximo ciclo de cache.
- `monthlySeries` (gráfico mensual en finanzas) ya tiene baseline fallback desde el commit FIX-BASELINE-GAPS.
- Si en el futuro se agregan categorías distintas a "sales", `finance-data-provider` tendría que cargar el baseline de cada categoría por separado.

---

### 2026-08-25 — FEAT-IMPORT-MANUAL-FORM: Formulario manual de métricas de ventas + eliminación de finanzas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `49c5e58` — feat(import): eliminar métricas de finanzas y convertir ventas a formulario manual  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/excel-parser.ts`, `app/clients/import-actions.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- Eliminada completamente la opción "Métricas de finanzas" del wizard de importación
- Reemplazada la carga de archivo `.xlsx` para métricas de ventas por un formulario manual inline (`ManualSalesForm`):
  - Grid con una fila por período, `<input type="month">` para el mes y texto para cada métrica
  - Auto-sugiere el mes anterior al inicializar; botón + para agregar filas, botón Trash para eliminar
  - Campos: Leads totales, Agendas totales, Show up, No show up, Cierres, Facturación
- `deriveSalesMetrics()` en `excel-parser.ts` pasó de privada a exportada para uso en la acción manual
- Nueva Server Action `importSalesMetricsManualAction(rows: ManualSalesMetricInput[])` en `import-actions.ts`:
  - Valida formato `YYYY-MM`; convierte a `period_start = YYYY-MM-01`; genera `period_label` en español
  - Llama `deriveSalesMetrics()` antes del upsert a `metrics_snapshots`
- El paso "Mapeo" solo aparece cuando se está importando un archivo Excel de clientes
- `WhatToImport` ahora es `"clients" | "salesMetrics"` (eliminado `"financeMetrics"`)

**Por qué / finalidad:**
El usuario decidió que la forma más práctica de cargar métricas de ventas históricas es un formulario directo (datos del software propios del usuario), sin necesidad de preparar un Excel. Las métricas de finanzas se manejarán de otra forma.

**Decisiones de diseño relevantes:**
- Se mantiene el flujo Excel solo para importar contactos (clientes), donde el mapeo de columnas tiene valor
- El formulario manual es más ergonómico: el usuario ingresa un mes y los valores directamente
- `<input type="month">` devuelve `YYYY-MM`; se convierte a `YYYY-MM-01` al persistir en `period_start`

**Riesgos / deuda técnica pendiente:**
- Las métricas de finanzas quedan sin UI de carga por ahora (pendiente definir cómo se cargarán)
- La tabla `metrics_snapshots` sigue teniendo soporte para `category = "finance"` en el schema

---

### 2026-08-25 — FEAT-METRICS-DERIVE: Auto-derivación de métricas combinadas al importar

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `993103b` — feat(metrics-import): auto-derivación de métricas combinadas desde primarias  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/excel-parser.ts`, `components/integrations/data-import-wizard.tsx`

**Qué se hizo:**
- `apps/web/lib/metrics/excel-parser.ts`:
  - Agrega `deriveSalesMetrics(metrics)`: calcula las métricas derivadas de ventas que no estén presentes:
    - `inasistencias` = `agendas_totales` − `asistencias`
    - `no_cierres` = `asistencias` − `cierres`
    - `close_rate` = `cierres` / `asistencias`
    - `show_rate` = `asistencias` / `agendas_totales`
    - `tasa_agendamiento` = `agendas_totales` / `leads_totales`
    - `tasa_fantasma` = `inasistencias` / `agendas_totales`
  - Agrega `deriveFinanceMetrics(metrics)`: calcula métricas derivadas de finanzas:
    - `margen` = `facturacion` − `gastos`
    - `pct_margen` = `margen` / `facturacion`
  - Aplica `deriveSalesMetrics` en `parseSalesMetricsTransposed` y `parseSalesMetricsExcel` (post-procesado de filas)
  - Aplica `deriveFinanceMetrics` en `parseFinanceMetricsTransposed` y `parseFinanceMetricsExcel`
  - Las métricas derivadas solo se calculan si no están ya presentes (el archivo puede tenerlas explícitamente y tienen prioridad)
- `apps/web/components/integrations/data-import-wizard.tsx`:
  - `SALES_ROW_FIELDS`: reduce de 17 a 11 campos (solo primarios). Eliminados: `closeRate`, `showRate`, `tasaAgendamiento`, `tasaFantasma`, `inasistencias`, `noCierres`
  - `FINANCE_ROW_FIELDS`: reduce de 5 a 4 campos. Eliminado: `margen` (se calcula de `facturacion − gastos`)

**Por qué / finalidad:**
El usuario quería ingresar únicamente las métricas base y que el sistema derive automáticamente las métricas combinadas (porcentajes, tasas). Simplifica el mapper de filas y evita errores de cálculo manual.

**Decisiones de diseño:**
- Las métricas derivadas no sobreescriben valores explícitos del archivo (verificación `!("campo" in m)`)
- Se aplica tanto al formato pivot (transpuesto) como al estándar (columnas)
- `inasistencias` se calcula antes de `tasa_fantasma` para que esta última pueda usarla

**Riesgos / deuda técnica:**
- Los módulos de Finanzas y Métricas de ventas en el frontend aún no consumen `metrics_snapshots` (`[FEAT-EXCEL-IMPORT-FASE3-RESTANTE]`)
- `pct_margen` es un campo nuevo en `metrics_snapshots.metrics` (JSONB) — no requiere migración, pero las consultas deben esperarlo como opcional

---

### 2026-08-25 — FEAT-EXCEL-TRANSPOSED-ROW-MAPPER: Mapeo manual de filas en formato pivot

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `cab4ed9` — feat(importacion): mapeo manual de filas para hojas transpuestas (pivot)  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos, wizard, métricas de ventas y finanzas

**Qué se hizo:**
- `apps/web/lib/metrics/excel-parser.ts`:
  - `parseTransposedMetrics`: acepta nuevo parámetro `explicitRowMapping?: Record<string, string>` (field key → etiqueta de fila). Construye `effectiveLookup` invirtiendo el mapeo del usuario; si no se provee, usa el diccionario automático como fallback
  - `parseSalesMetricsTransposed` y `parseFinanceMetricsTransposed`: firmas actualizadas con `rowMapping?: Record<string, string>` como primer argumento opcional
- `apps/web/app/clients/import-actions.ts`:
  - `importFinanceMetricsTransposedAction`: firma actualizada para aceptar `rowMapping: Record<string, string>` y pasarlo al parser
  - `importSalesMetricsTransposedAction`: ya tenía `rowMapping`; ahora ambas acciones son consistentes
- `apps/web/components/integrations/data-import-wizard.tsx`:
  - Reemplaza `TransposedBanner` (solo texto) por `TransposedRowMapper`: UI con dropdowns por campo OTC, donde el usuario selecciona qué fila del Excel corresponde a cada métrica
  - Agrega `RowField` tipo, `SALES_ROW_FIELDS` y `FINANCE_ROW_FIELDS`: 17 y 5 campos respectivamente, con labels en español
  - Agrega `autoMapTransposedRows()`: sugiere un mapeo inicial usando el diccionario de sinónimos a partir de `rowLabels` del preview
  - Agrega estado `transposedSalesRowMapping` y `transposedFinanceRowMapping`
  - `handleAdvanceFromWhat`: llama `autoMapTransposedRows` para pre-poblar el mapper al detectar formato pivot
  - `handleSalesMetricsSheetChange` y `handleFinanceMetricsSheetChange`: re-auto-mapean filas al cambiar de hoja
  - `canAdvanceFromMapper`: para tipos transpuestos, válido si al menos 1 fila está mapeada
  - `handleImport`: pasa `transposedSalesRowMapping` / `transposedFinanceRowMapping` a las acciones transpuestas
  - `StepMapper`: nuevo props `transposedSalesRowMapping`, `transposedFinanceRowMapping`, `onTransposedSalesRowMappingChange`, `onTransposedFinanceRowMappingChange`
  - Texto de confirmación corregido: aclara que métricas hacen upsert (no "no se sobreescribirán")

**Por qué / finalidad:**
El usuario reportó que al importar su archivo MAESTRO DE METRICAS en formato pivot, (1) el sistema auto-mapeaba solo ~4 filas (las que coincidían exactamente con el diccionario) sin mostrar el resto, (2) no había control manual sobre qué fila corresponde a qué métrica. Ahora el wizard muestra un mapper explícito con todos los campos OTC y todos los nombres de fila del archivo, pre-poblado con las sugerencias automáticas pero editable libremente.

**Decisiones de diseño:**
- El usuario tiene control total: puede ver/cambiar todos los mapeos antes de importar
- El auto-mapeo es solo una sugerencia de punto de partida (puede haber falsos positivos o etiquetas no reconocidas)
- `rowLabels` viene del preview del server (columna A del archivo) para evitar duplicar la lógica XLSX en el cliente
- Si `explicitRowMapping` se provee con entradas, el parser lo usa exclusivamente; si está vacío/undefined, el diccionario automático actúa como fallback (preservando compatibilidad con formato estándar)

**Riesgos / deuda técnica:**
- Si el archivo tiene muchas filas en columna A (ej. totales, subtítulos), el dropdown puede llenarse de opciones — sin filtrado por ahora
- Los datos importados van a `metrics_snapshots` pero ningún módulo UI los consume aún ([FEAT-EXCEL-IMPORT-FASE3-RESTANTE])

---

## Formato de entrada

Cada entrada debe seguir esta estructura:

```
### [FECHA] — [TÍTULO CORTO DEL CAMBIO]

**Rama/branch:** `nombre-del-branch`  
**Commit(s):** `hash_corto` — mensaje  
**Autor:** Claude / Devin / Santiago / etc.  
**Módulo(s) afectado(s):** marketing, ventas, ui, agent, etc.

**Qué se hizo:**
Descripción clara de los cambios realizados. Qué archivos se tocaron y por qué.

**Por qué / finalidad:**
El problema que resolvía, la feature que implementaba, o la deuda técnica que saldaba.

**Decisiones de diseño relevantes:**
Opciones consideradas, trade-offs, patrones usados o evitados.

**Riesgos / deuda técnica pendiente:**
Qué quedó sin hacer, qué puede romperse, qué hay que revisar luego.
```

---

## Historial de cambios

---

### 2026-08-25 — Soporte para formato pivot en importación de Excel (métricas)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit(s):** `1f55b9d` — feat(metrics): soporte para formato pivot en importación de Excel  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de métricas, wizard de importación de datos

**Qué se hizo:**
- `apps/web/lib/metrics/excel-parser.ts`:
  - Agrega `parseMonthLabel()`: convierte "Marzo 2025", "03/2025", "2025-03" → "YYYY-MM-01"
  - Agrega `isTransposedMetricsSheet(headers)`: detecta si ≥2 encabezados son nombres de mes
  - Agrega `SALES_ROW_LABEL_MAP` y `FINANCE_ROW_LABEL_MAP`: diccionarios con ~50 variantes en español de etiquetas de fila → field keys
  - Agrega `parseTransposedMetrics()`: parser genérico para formato pivot (meses=columnas, métricas=filas). Salta filas de título merged, encuentra la fila de encabezados real, itera columnas de período, construye `MetricsSnapshotRow` por mes
  - Agrega `parseSalesMetricsTransposed()` y `parseFinanceMetricsTransposed()` como funciones exportadas
- `apps/web/app/clients/import-actions.ts`:
  - Corrige `getExcelPreviewAction` para usar `{ header: 1 }` y encontrar la primera fila con ≥2 celdas no vacías como fila de encabezados real. Antes: archivos con título merged en A1 devolvían `__EMPTY`, `__EMPTY_1`, etc. Ahora devuelve los encabezados reales (ej. nombres de meses)
  - Corrige `pickBestSheet` con el mismo enfoque
  - Agrega `importSalesMetricsTransposedAction` e `importFinanceMetricsTransposedAction`: usan el parser transpuesto, sin necesidad de mapping manual
- `apps/web/components/integrations/data-import-wizard.tsx`:
  - Agrega helpers `looksLikeMonthHeader` e `isTransposedMetricsFormat` para detección client-side
  - Agrega estado `transposedTypes: Set<WhatToImport>`
  - En `handleAdvanceFromWhat`: detecta automáticamente el formato pivot después de cargar el preview
  - En `handleSalesMetricsSheetChange` y `handleFinanceMetricsSheetChange`: re-detecta al cambiar de hoja
  - Agrega `TransposedBanner`: muestra mensaje "Formato tabla detectado" con la lista de meses
  - Actualiza `StepMapper`: para tipos transpuestos muestra el banner en lugar del column mapper; sigue mostrando el selector de hoja
  - `canAdvanceFromMapper`: los tipos transpuestos no requieren mapeo manual
  - `handleImport`: usa acción transpuesta cuando se detectó el formato, o la acción standard con mapping si no

**Por qué / finalidad:**
El usuario tiene un archivo "MAESTRO DE METRICAS ACADEMIA APPLE" en formato pivot (métricas como filas, meses Marzo-Noviembre como columnas). El sistema devolvía `__EMPTY` como encabezados porque la primera fila es un título merged. Ahora el wizard detecta el formato automáticamente, muestra un banner de confirmación, y permite importar sin necesidad de mapear columnas manualmente.

**Decisiones de diseño:**
- Detección automática client-side + server-side con función compartida conceptualmente (implementaciones paralelas para evitar importar código de servidor en el cliente)
- El formato estándar (una fila por período) sigue funcionando con el mapper manual; el formato pivot se auto-detecta
- Diccionarios de etiquetas con variantes en español para cubrir las denominaciones que usa el usuario sin depender del usuario para mapear
- `parseNum` reutilizado: acepta porcentajes "53%", decimales con coma "1.250,50", enteros

**Riesgos / deuda técnica:**
- Los diccionarios de etiquetas (`SALES_ROW_LABEL_MAP`) cubren las métricas visibles en el screenshot; si el archivo tiene secciones adicionales (ej. "INVERSIÓN" o "RETENCIÓN") con nombres no mapeados, se ignoran silenciosamente
- `isTransposedMetricsFormat` podría dar falso positivo si un archivo estándar tiene columnas con nombres de meses; en ese caso el usuario ve el banner en lugar del mapper. Resolver: agregar botón "Cambiar a mapeo manual" en el banner (pendiente)

---

### 2026-08-25 — Importación de métricas de ventas y finanzas

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `1f154a6` — feat(importacion): agregar importación de métricas de ventas y finanzas  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos, métricas, finanzas

**Qué se hizo:**
- `supabase/migrations/20260825100000_metrics_snapshots.sql`: nueva tabla `metrics_snapshots` con columnas `organization_id`, `category` (sales/finance), `period_start` (date), `period_label`, `metrics` (JSONB). Unique constraint en `(organization_id, category, period_start)` para soportar upsert. RLS con `get_my_organization_id()`. Aplicada en Supabase.
- `apps/web/lib/metrics/excel-parser.ts`: parser genérico para archivos Excel de métricas. `parseNum()` maneja porcentajes ("53%"→0.53), separador de miles europeo, decimales con coma. `parseDate()` soporta serial Excel, ISO, DD/MM/YYYY, y etiquetas de texto. Funciones exportadas: `parseSalesMetricsExcel()` y `parseFinanceMetricsExcel()` con sus tipos de mapping.
- `apps/web/app/clients/import-actions.ts`: `importSalesMetricsFromExcelAction()` e `importFinanceMetricsFromExcelAction()` usando upsert con `onConflict: "organization_id,category,period_start"`.
- `apps/web/components/integrations/excel-column-mapper.tsx`: soporte para tipos `"salesMetrics"` y `"financeMetrics"` con campos definidos (19 para ventas, 6 para finanzas). `isMappingValid` acepta los nuevos tipos (solo requiere campo `period`).
- `apps/web/components/integrations/data-import-wizard.tsx`: wizard extendido a 4 tipos. Sub-componentes `FileRow` y `CheckboxCard` reutilizables. `StepWhat` con secciones para métricas de ventas (TrendingUp) y finanzas (DollarSign). `StepMapper` con selectores de hoja para los 4 archivos. `autoMap` extendido con diccionarios `SALES_METRICS_KNOWN` y `FINANCE_METRICS_KNOWN`. `handleImport` importa los 4 tipos en secuencia.

**Por qué / finalidad:**
El usuario necesitaba importar datos históricos de KPIs de ventas (close rate, show rate, leads, agendas, cierres, etc.) y finanzas (facturación, margen, gastos) desde sus propios archivos Excel. Cada fila del Excel representa un período con sus métricas agregadas, distinto del patrón de un registro por cliente.

**Decisiones de diseño relevantes:**
- JSONB para `metrics`: evita schema rígido y permite métricas opcionales sin columnas nulas. El campo exacto depende del mapeo del usuario.
- Upsert en conflicto: reimportar el mismo período actualiza los valores en vez de generar error o duplicado.
- Mismo archivo puede ser de múltiples hojas: los selectores de hoja funcionan igual que para clientes y llamadas.
- `autoMap` extendido para pre-seleccionar columnas cuando los nombres coinciden (normalizado a lowercase).

**Riesgos / deuda técnica pendiente:**
- No hay UI para ver/editar/eliminar métricas importadas; solo se guardan.
- La tabla `metrics_snapshots` existe pero ningún módulo la consume aún (pendiente conectar con finanzas/métricas).
- Texto de confirmación aún dice "Los registros existentes no se sobreescribirán" — en realidad sí se actualizan por upsert.

---

### 2026-08-25 — Excel multi-hoja: selector de hoja en el wizard de importación

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `831cbf4` — feat(excel-import): soporte para archivos Excel multi-hoja con selector de hoja  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos

**Qué se hizo:**
- `app/clients/import-actions.ts`: `getExcelPreviewAction` ahora acepta `sheetName?: string` y devuelve `allSheets: string[]` + `activeSheet: string`. Nueva función `pickBestSheet()` que elige la hoja con más headers no vacíos + bonus si el nombre contiene palabras clave de datos (data, cliente, lead, crm, etc.).
- `components/integrations/data-import-wizard.tsx`: nuevo componente `SheetSelector` (dropdown visible solo si el archivo tiene >1 hoja). Handlers `handleClientsSheetChange` y `handleClosingSheetChange` que re-fetchan el preview al cambiar de hoja y re-aplican el auto-mapeo. `StepMapper` recibe y usa todos los props de hoja.

**Por qué / finalidad:**
Archivos Excel reales de CRM suelen tener múltiples hojas (ej. `CRM_VENTAS__AA.xlsx` con 6 hojas donde la primera es un dashboard visual sin columnas útiles y los datos están en la hoja "Data"). El sistema ahora detecta automáticamente la mejor hoja y le permite al usuario cambiarla si no es la correcta.

**Decisiones de diseño relevantes:**
- La heurística `pickBestSheet` prioriza cantidad de headers + bonus por nombre. Es simple y cubre el caso real (dashboards vacíos vs hojas de datos). No hay riesgo de false positive grave porque el usuario puede corregir con el selector.
- El selector solo aparece cuando hay >1 hoja para no agregar ruido en el caso más común.
- Al cambiar de hoja se resetea el mapping con el auto-mapeo de la nueva hoja.

**Riesgos / deuda técnica pendiente:**
- La heurística podría fallar si todas las hojas tienen la misma cantidad de headers. Poco probable en la práctica.

---

### 2026-08-25 — Excel Column Mapper UI — mapeo de columnas para archivos propios

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `4d6d06b` (fix types) / commits previos  
**Autor:** Claude  
**Módulo(s) afectado(s):** importación de datos, clientes, closing

**Qué se hizo:**
- `app/clients/import-actions.ts`: nueva acción `getExcelPreviewAction(fileBase64)` que extrae headers y primeras 5 filas de cualquier archivo .xlsx sin parsear el schema OTC. Importa XLSX directamente en el action.
- `components/integrations/excel-column-mapper.tsx` (nuevo): componente que muestra dropdowns para mapear cada columna del archivo del usuario a cada campo OTC (Nombre, Email, Teléfono, Estado, Producto, Monto, Fecha, Notas para clientes; Nombre prospecto, Fecha, Email, Estado, Monto cerrado, Notas para closing). Incluye auto-mapeo por nombre de columna y vista previa de filas con las columnas mapeadas.
- `components/integrations/data-import-wizard.tsx`: se agrega un paso intermedio "mapper" entre "what" y "confirm" exclusivo del flujo Excel. Al avanzar desde "what", se fetchean los headers de los archivos subidos, se pre-mapean automáticamente si los nombres coinciden, y se muestra el `ExcelColumnMapper`. El mapping resultante se pasa a `importClientsFromExcelAction` y `importClosingCallsFromExcelAction` (que ya soportaban `columnMapping?`). El paso de confirmación navega correctamente con el nuevo paso insertado. Eliminado el link a la plantilla OTC (§2.4 descartado).

**Por qué / finalidad:**
El usuario puede tener sus datos en cualquier formato de Excel, con columnas nombradas de forma arbitraria. El mapper le permite indicar qué columna de su archivo corresponde a cada campo de OTC sin necesidad de reformatear el archivo ni usar una plantilla específica.

**Decisiones de diseño relevantes:**
- Auto-mapeo: al cargar el archivo, si algún header coincide (case-insensitive) con los nombres estándar de OTC (ej. "Nombre", "Email", "Teléfono"), se pre-selecciona automáticamente el mapping para evitar trabajo manual.
- Vista previa toggle: la tabla de preview de filas mapeadas es opcional (toggle per-sección) para no sobrecargar la UI.
- El mapper se salta completamente si el origen es GHL (no aplica).
- Se valida que los campos requeridos (name para clientes; leadName + scheduledAt para closing) estén mapeados antes de permitir avanzar.

**Riesgos / deuda técnica pendiente:**
- Si el usuario sube un archivo con miles de filas, `getExcelPreviewAction` igual lee todo el workbook (solo retorna 5 filas pero parsea todo). Para archivos masivos podría optimizarse con `sheetRowsLimit`.
- El link a la plantilla OTC fue eliminado del wizard — si se quiere recuperar en el futuro, habría que volver a agregar el CTA.

---

### 2026-08-24 — GHL UTM Attribution — atribución de fuente en closing calls

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Commit:** `3da5bf1`  
**Autor:** Claude  
**Módulo(s) afectado(s):** closing/ventas, GHL integration

**Qué se hizo:**
- `lib/ghl/client.ts`: nuevo tipo `GHLContactAttributionSource` + función `getGHLContact(apiKey, contactId)` que trae el contacto individual con su campo `attributionSource` (UTMs). Devuelve `null` en caso de error para no bloquear el sync.
- `lib/ghl/sync-appointments.ts`: al insertar/actualizar appointments, se fetchean en paralelo (concurrencia 5) los contactos asociados por `contactId` y se extraen los campos UTM (`utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`). También se guarda el JSON crudo de atribución en `attribution_source`.
- `lib/ghl/sync-pipeline.ts`: pasa la `apiKey` a `syncGHLAppointmentsForOrganization` para habilitar el enriquecimiento de UTMs.
- `supabase/migrations/20260824200000_closing_calls_utm.sql`: agrega `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ghl_contact_id`, `attribution_source` a `closing_calls`. Aplicada en producción.
- `lib/closing/mapper.ts` + `types/closing.ts`: nuevos campos UTM en `ClosingCallRow` y `ClosingCall`.
- `components/closing/closing-overview.tsx`: columna "Fuente UTM" en tabla de lista (muestra source + medium · campaign). Panel de detalle: sección "Atribución UTM" con grid `dt/dd` visible solo si hay datos.

**Por qué / finalidad:**
El founder necesita saber de dónde viene cada agenda de cierre (qué campaña, fuente o contenido generó el lead). GHL guarda la atribución UTM en el contacto (`attributionSource`). Ahora el sync la extrae automáticamente y la muestra en la vista de closing.

**Decisiones de diseño relevantes:**
- **Pull durante sync vs. webhook**: se eligió pull (enriquecer al momento del sync) porque reutiliza la infraestructura existente, backfill automático de appointments históricos, y la atribución UTM no requiere real-time.
- **Solo para nuevos/actualizados**: el fetch de contactos se hace solo para `toInsert` y `toUpdate`, no para todos los appointments. Minimiza requests a GHL.
- **Concurrencia 5**: fetch paralelo con límite para no saturar la API de GHL. Un contacto fallido no bloquea el sync completo (`getGHLContact` devuelve `null` en error).
- **`attribution_source` JSONB**: se guarda el objeto crudo completo además de los campos normalizados, para referencia futura sin necesidad de re-fetch.

**Riesgos / deuda técnica pendiente:**
- Si un contacto en GHL no tiene `attributionSource` (lead creado manualmente, sin UTMs), los campos quedan `null` — comportamiento correcto y esperado.
- El campo `utmSource` en GHL puede ser `null` aun cuando hay datos en `medium` — el helper `buildUtmFields` hace fallback: `utmSource ?? medium`.
- Appointments ya insertados en DB (sin UTMs) se enriquecerán en el próximo sync si su status no es `"closed"`. Los cerrados no se actualizan por diseño (no sobreescribir deals cerrados).

---

### 2026-08-24 — GHL Data Loading — Fase 2 (importación de datos históricos)

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Autor:** Claude  
**Módulo(s) afectado(s):** integrations, clients, closing/ventas

**Qué se hizo:**
- **Fix timestamps GHL** (`lib/ghl/sync-pipeline.ts`): `buildSyncRange()` ahora usa Unix timestamps en ms (`getTime().toString()`) en lugar de ISO 8601 — GHL `/calendars/events` devolvía 200 + array vacío con ISO strings. Agregado log diagnóstico y fallback `data.data` en `listGHLAppointments`.
- **GHL Contacts endpoint** (`lib/ghl/client.ts`): Nuevo tipo `GHLContact` y función `listGHLContacts()` con paginación cursor (`startAfterId`, máx 2000 contactos).
- **Sync contactos → clients** (`lib/ghl/sync-contacts.ts`): Mapeo idempotente GHL Contacts → `clients`. Dedup por nombre normalizado (case-insensitive). No sobreescribe existentes. Email/teléfono se guardan en `ai_insights`.
- **Import actions GHL** (`app/ghl/import-actions.ts`): `previewGHLContactsAction` (preview 10 primeros sin importar) + `importGHLContactsAction` (importación real vía admin client).
- **Parser Excel clientes** (`lib/clients/excel-parser.ts`): Parsea `.xlsx` con plantilla OTC (tab "Clientes") o mapeo de columnas propio. Soporta fechas seriales de Excel, DD/MM/AAAA e ISO. Usa `xlsx` (SheetJS).
- **Parser Excel llamadas** (`lib/closing/excel-parser.ts`): Idem para tab "Llamadas de cierre". Parsea fechas con hora. Status: cerrado → closed, no cerrado → not_closed, etc.
- **Server actions Excel** (`app/clients/import-actions.ts`): `importClientsFromExcelAction` y `importClosingCallsFromExcelAction`. Reciben el archivo como base64 (serializable en Server Actions). Dedup clientes por nombre.
- **Wizard UI** (`components/integrations/data-import-wizard.tsx`): Wizard 3 pasos — Origen (GHL/Excel), Qué importar (clientes/llamadas con preview), Confirmación + resultados.
- **Página wizard** (`app/(platform)/integrations/import/page.tsx`): Server Component que carga estado GHL y renderiza el wizard.
- **Integrations page** (`app/(platform)/integrations/page.tsx`): Botón "Importar datos históricos" → `/integrations/import`.
- **Ruta** (`routes/paths.ts`): Agregado `integrationsImport`.

**Por qué / finalidad:**
Usuarios nuevos de OTC tienen sus datos históricos en GHL o Excel. Sin importación masiva, el onboarding es manual y lento. Esta fase permite cargar clientes y llamadas de cierre de una vez desde ambas fuentes.

**Decisiones de diseño relevantes:**
- Archivos Excel se envían como base64 al Server Action (Next.js 15 no serializa `File` en network calls).
- Dedup por nombre (no por email) porque muchos usuarios no tienen email consistente en GHL.
- Llamadas de cierre no se deduplan (se insertan todas; el usuario puede limpiar duplicados después).
- Preview GHL carga automáticamente al seleccionar esa opción (llamada síncrona al `previewGHLContactsAction`).
- GHL Appointments ya se sincronizan vía el calendario (Fase 1) — no se duplica en el wizard.

**Riesgos / deuda técnica pendiente:**
- Mapeo de columnas personalizado (para archivos con formato propio): la UI del wizard no tiene la pantalla de mapeo de columnas todavía — usa la plantilla OTC o las columnas detectadas automáticamente. Pendiente implementar `excel-column-mapper.tsx` para Fase 3.
- Plantilla `.xlsx` descargable (`public/templates/otc-importacion.xlsx`) no generada todavía — el link en el wizard existe pero el archivo no.
- Oportunidades de GHL (pipeline) → closing_calls es stretch goal Fase 3.

---

### 2026-08-24 — Integración GoHighLevel (GHL) Calendar — Fase 1

**Rama/branch:** `claude/ghl-integration-data-loading-9cd72n`  
**Autor:** Claude  
**Módulo(s) afectado(s):** integrations, closing/ventas, crons

**Qué se hizo:**
- **Migración SQL** (`supabase/migrations/20260824100000_ghl_integration.sql`): crea tabla `ghl_integrations` con API key cifrada, location_id, calendarios conectados y last_sync_at. Agrega columnas `ghl_appointment_id` y `ghl_calendar_id` a `closing_calls` con índice único por org.
- **GHL API client** (`lib/ghl/client.ts`): cliente V2 (`services.leadconnectorhq.com`), auth por Private Integration Token + Version header. Funciones: `validateGHLApiKey`, `listGHLCalendars`, `listGHLAppointments` (con paginación).
- **Integration helpers** (`lib/ghl/integration.ts`): cifrado/descifrado AES-256-GCM de API keys, getters/setters de integración org, upsert y refresh de calendarios.
- **Sync logic** (`lib/ghl/sync-appointments.ts`): mapeo idempotente de citas GHL a `closing_calls`. Status mapping: showed→closed, noshow→no_show, booked/confirmed→scheduled, cancelled/invalid→skip. Ventana de 90 días pasados + 90 días futuros.
- **Sync pipeline** (`lib/ghl/sync-pipeline.ts`): funciones safe (never-throw) para cron — `syncGHLOrganizationSafe` y `syncAllGHLOrganizationsSafe`.
- **Server Actions** (`app/ghl/actions.ts`): `getGHLIntegrationStatusAction`, `validateGHLKeyAction`, `connectGHLAction`, `updateGHLCalendarAction`, `syncGHLAppointmentsAction`.
- **Cron endpoint** (`app/api/cron/ghl-sync/route.ts`): sync horario con soporte `?organizationId=` para org específica, protegido con `CRON_SECRET`.
- **Dialog UI** (`components/integrations/ghl-connect-dialog.tsx`): flujo en 3 pasos — StepCredentials (token + locationId), StepSelectCalendar, ManagePanel (sync manual, cambio de calendario activo).
- **Icono SVG** (`public/integrations/ghl.svg`): logo circular "G" en ámbar.
- **Wiring en integrations page**: mock entry, brand colors, grupo, providers real, disconnect action, count, statusMap en `listIntegrationsAction`.
- **Wiring en integration-card.tsx**: import del dialog, estado `ghlConnectOpen`, handlers para connect/manage/disconnect, `supportsCardDisconnect`, action label "Gestionar", render del dialog.
- **Tipos closing**: `ClosingCallSource = "calendly" | "ghl" | "manual"`, campo `source` en `ClosingCall`.
- **Mapper closing**: `deriveSource()` basado en presencia de `calendly_event_id` vs `ghl_appointment_id`.
- **UI closing-overview**: badges de color por origen (azul=Calendly, ámbar=GHL, neutro=manual).
- **vercel.json**: cron `/api/cron/ghl-sync` cada hora.

**Por qué / finalidad:**
Usuarios que usan GoHighLevel en lugar de Calendly para agendar llamadas de cierre no tenían forma de importar sus citas a OTC. Esta integración los habilita con el mismo flujo que Calendly pero usando Private Integration Tokens de GHL (sin necesidad de registrar la app en el Marketplace todavía).

**Decisiones de diseño relevantes:**
- Auth por Private Integration Token ahora; OAuth/Marketplace se implementará cuando GHL lo apruebe (proceso lento).
- Calendly y GHL coexisten simultáneamente; el origen se distingue visualmente en la UI.
- API key cifrada con AES-256-GCM igual que otras integraciones con secrets; sin RLS SELECT en `ghl_integrations`.
- Citas canceladas/inválidas se omiten (no se importan); citas ya cerradas/no-cerradas en OTC se actualizan campos pero se preserva el status.
- `source` derivado en la capa mapper (no guardado en DB) para no romper schema existente.

**Riesgos / deuda técnica pendiente:**
- Migración SQL pendiente de aplicar en producción (`supabase/migrations/20260824100000_ghl_integration.sql`).
- Migrar a OAuth "Connect with GHL" cuando OTC sea aprobado como app en GHL Marketplace.
- Phase 2 (carga de datos históricos desde Excel) queda para sesión futura — ver PENDIENTES.

---

### 2026-08-11 — Eliminar wizard de onboarding de founder

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `acb2499` — feat(onboarding): eliminar wizard de onboarding de founder  
**Autor:** Claude  
**Módulo(s) afectado(s):** onboarding, auth, platform-data-provider, middleware, routes

**Qué se hizo:**
- Eliminados 12 archivos: `app/onboarding/{page,layout,actions}.ts`, `components/onboarding/{onboarding-wizard,option-card,other-text-field}.tsx`, `components/platform/onboarding-guard.tsx`, `lib/onboarding/{steps,onboarding-storage,onboarding-status,resolve-onboarding-path}.ts`, `types/onboarding.ts`.
- `app/auth/actions.ts`: eliminado el check `!status.completed → redirect(status.onboardingPath)` de `postAuthRedirect`. Login redirige siempre a dashboard o holding.
- `providers/platform-data-provider.tsx`: eliminados `onboardingComplete`, `onboardingData`, `refreshOnboarding` del contexto y sus estados.
- `lib/supabase/middleware.ts`: eliminado el bloque que redirigía super admins desde `/onboarding`.
- `components/auth/login-screen.tsx`: eliminado el redirect condicional al wizard en modo demo.
- `routes/paths.ts`: eliminado `paths.auth.onboarding`.
- `components/holding/holding-onboarding-wizard.tsx`: eliminada dependencia de `fetchOnboardingStatus`; el efecto de inicialización ahora solo llama a `getHoldingOnboardingStateAction()`.
- El onboarding de holding (`/onboarding/holding`) se mantiene intacto.
- `lib/onboarding/welcome-storage.ts` se mantiene (usado por `WelcomeGate`).

**Por qué / finalidad:**
El wizard de onboarding de founder en `/onboarding` fue eliminado por decisión de producto. Los usuarios ahora entran directo al dashboard después del login sin pasar por el wizard.

**Decisiones de diseño relevantes:**
- Se mantuvo `welcome-storage.ts` para no romper `WelcomeGate`; la animación de bienvenida simplemente nunca se activa ya que `markWelcomePending()` era llamada solo por el wizard.
- El onboarding de holding se preserva íntegro — es un flujo diferente para configurar negocios del portfolio.
- TypeScript limpio (0 errores) verificado antes del push.

**Riesgos / deuda técnica pendiente:**
- Los datos en tabla `onboarding_responses` de orgs founder quedan sin uso por la plataforma. La tabla puede eliminarse en una migración futura si se confirma que no hay otros consumidores.
- `WelcomeGate` y `welcome-storage.ts` son dead code efectivo — se pueden eliminar en una limpieza futura.

---


### 2026-08-11 — TECH-1: Fathom deep analysis vía QStash + TECH-2: retención real YouTube Analytics

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude  
**Módulo(s) afectado(s):** fathom, marketing (YouTube), queue

**Qué se hizo:**

**TECH-1 — Fathom async con QStash:**
- `lib/queue/qstash-client.ts`: agrega `FathomAnalysisJobPayload`, `getFathomAnalysisQueueUrl()` y `publishFathomAnalysisJob()`.
- `app/api/queue/process-fathom-analysis/route.ts`: nuevo endpoint worker con `maxDuration=300`, validación Zod, auth via `verifyQueueRequest`, y retorno 500 para que QStash reintente (hasta 2 veces).
- `lib/fathom/process-call.ts`: reemplaza `void generateDeepCallAnalysis(...)` por `await publishFathomAnalysisJob(...)` + fallback inline si QStash no está configurado.

**TECH-2 — Retención real YouTube Analytics:**
- `lib/youtube/analytics.ts`: nuevo archivo con `getRetentionAtCTA(organizationId, videoId, ctaSecond, durationSeconds)`. Lee token de `youtube_integrations`, verifica scope `yt-analytics.readonly`, refresca si hace falta, llama a YouTube Analytics API v2 (`elapsedVideoTimeRatio` / `audienceWatchRatio`), interpola el punto más cercano al segundo del CTA. Fallback gracioso a `estimateRetentionAtCTA` en cualquier error.
- `app/marketing/actions.ts`: `updateCTAMinuteAction` ahora selecciona `external_id` del asset y llama `getRetentionAtCTA` en lugar de `estimateRetentionAtCTA`. Usa el video ID real de YouTube para obtener la curva de retención real.

**SEED cleanup:**
- Ejecutados los DELETE en Supabase (prod) para la org `46cce98c-6d4c-4e4d-94a7-7cc24ae1104d`: 171 registros ficticios eliminados de `call_analyses`, `client_payments`, `closing_calls`, `conversations`, `content_pieces` y `clients`.

**Por qué / finalidad:**

TECH-1: `void asyncFn()` en Vercel es un anti-patrón — el proceso Node.js muere cuando la función serverless retorna, por lo que el análisis profundo de Fathom se perdía silenciosamente en producción. QStash garantiza ejecución con reintentos en un endpoint dedicado con `maxDuration=300`.

TECH-2: `estimateRetentionAtCTA` era un modelo sintético (curva exponencial). Con `yt-analytics.readonly` (ya en `GOOGLE_UNIFIED_SCOPES`) se obtiene la curva real del video para calcular cuántos espectadores quedan en el segundo del CTA.

**Decisiones de diseño relevantes:**
- QStash como transporte, no BullMQ — ya estaba instalado y configurado en la plataforma.
- Fallback inline si `QSTASH_TOKEN` no está seteado — cero regresión en entornos sin QStash.
- `getRetentionAtCTA` es async y silenciosa — si no hay token o la API falla, devuelve la estimación; no hay error visible para el usuario.
- Los componentes cliente (`content-platform-metrics.tsx`) siguen usando `estimateRetentionAtCTA` como display fallback, lo cual es correcto: el valor real ya viene persistido en `retention_at_cta_pct` desde el Server Action.

**Riesgos / deuda técnica pendiente:**
- Tokens de YouTube existentes sin scope `yt-analytics.readonly` seguirán usando estimación hasta que el usuario reconecte YouTube. Sin impacto en UX, solo en precisión.
- `TRIAL-1` (reintentar variante fallida) sigue pendiente.

---

### 2026-08-11 — chore: migraciones DB para FEAT-1 y FEAT-2 (solo DB, sin UI)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude  
**Módulo(s) afectado(s):** supabase/migrations

**Qué se hizo:**
- Migración `20260811140000`: tablas `story_sequences` y `story_frames` con RLS (FEAT-1 Secuencias de historias)
- Migración `20260811150000`: tablas `competitors` y `competitor_posts` con RLS (FEAT-2 Análisis de competidores)
- Ambas migraciones aplicadas en producción. Sin UI todavía — Santiago implementará cuando lo indique.

---

### 2026-08-11 — feat: add-ons por org, música Trial Reels, regenerar captions, sync stories

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `7e55341`  
**Autor:** Claude  
**Módulo(s) afectado(s):** super-admin, marketing/trial-reels, navigation/sidebar, lib/zernio, permissions

**Qué se hizo:**

**1. [TECH-3] Mecanismo de add-ons por org (sidebar dinámico):**
- `supabase/migrations/20260811130000_enabled_add_ons.sql`: columna `enabled_add_ons TEXT[] NOT NULL DEFAULT '{}'` en `organizations`.
- `lib/auth/get-current-permissions.ts`: tipos `ADD_ON_IDS` y `AddOnId`; `UserPermissions` extendido con `enabledAddOns: AddOnId[]`; lectura desde DB en `getCurrentUserPermissions`.
- `providers/permissions-provider.tsx`: hooks `useEnabledAddOns()` y `useHasAddOn(addOnId)`.
- `lib/navigation/sidebar-modules.ts`: `buildPlatformRootItems(enabledAddOns)` inyecta `operaciones` y `producto` después de `finanzas` si están activos; `buildPlatformSidebarNav()` para componentes que tienen los add-ons.
- `components/navigation/sidebar-navigation.tsx` y `components/layout/mobile-nav.tsx`: usan `buildPlatformSidebarNav(enabledAddOns)`.
- `layouts/super-admin-layout.tsx`: `SUPER_ADMIN_PERMISSIONS` incluye `enabledAddOns: []`.
- `types/super-admin.ts`: `AdminOrganizationDetail` tiene campo `enabledAddOns: string[]`.
- `lib/super-admin/queries.ts`: `loadOrganizationDetail` fetchea `enabled_add_ons` de la org.
- `app/super-admin/actions.ts`: `updateOrgAddOnsAction(orgId, addOns[])` valida contra `ADD_ON_IDS` y guarda.
- `components/super-admin/organization-detail.tsx`: sección "Módulos add-on" con botones toggle por add-on; llama `updateOrgAddOnsAction` on click.

**2. [TRIAL-3] Música personalizable por org en Trial Reels:**
- `supabase/migrations/20260811120000_reel_music_path.sql`: columna `reel_music_path TEXT` en `organizations`.
- `apps/reel-worker/src/types.ts`: `reelMusicPath?: string | null` en `ReelVariationJobPayload`; 5° parámetro `customMusicPath` en `VariantSpec.buildFfmpegArgs`.
- `apps/reel-worker/src/ffmpeg-variants.ts`: variante `music` usa `customMusicPath ?? lutsDir/background-music.mp3`.
- `apps/reel-worker/src/processor.ts`: descarga `reel_music_path` de Storage antes del loop de variantes.
- `app/marketing/content/reel-variation-actions.ts`: lee `reel_music_path` de la org y lo incluye en payload QStash.
- `app/marketing/content/reel-music-actions.ts` (nuevo): `uploadReelMusicAction`, `deleteReelMusicAction`, `getReelMusicPathAction`.
- `components/marketing/trial-reels/reel-music-upload.tsx` (nuevo): UI de upload/delete con accept MP3/M4A/WAV, muestra filename actual.
- `app/(platform)/integrations/page.tsx`: sección "Trial Reels" con `<ReelMusicUpload>`.

**3. [TRIAL-2] Regenerar captions con IA por variante:**
- `components/marketing/trial-reels/variation-card.tsx`: botón "Generar con IA" con estado `generating`, llama `regenerateCaptionAction`, actualiza estado local y propaga via `onUpdate`.

**4. [BUG-1] Sync de stories de Instagram:**
- `lib/zernio/client.ts`: `listPublishedPosts` acepta `type?: string`; nuevo método `syncExternalStories(accountId)` con fallback gracioso para 404/405/400.
- `app/marketing/content/sync-actions.ts`: paso 3 en `fetchExternalPostsViaSync` lanza `syncExternalStories` + `listPublishedPosts({type: "story"})` en paralelo por cada accountId; combina y deduplica.

**Por qué / finalidad:**

- **Add-ons**: permite a Santiago activar módulos premium (Operaciones, Producto, etc.) por cliente desde super-admin sin tocar código — negocio de módulos add-on listo para operar.
- **Música Trial Reels**: cada org puede personalizar el track de fondo de sus reels (variante music) subiendo su propio archivo desde `/integrations`.
- **Regenerar captions**: founder puede hacer varios intentos de IA para el caption/hashtags sin regenerar el video.
- **Stories**: intento de traer historias de Instagram al módulo de marketing, que históricamente solo traía posts.

**Decisiones de diseño relevantes:**

- **Add-ons como TEXT[]**: simple, sin tabla extra ni JSON, con validación en server action. Extensible.
- **Toggle inmediato en super-admin**: click → llamada server action → optimistic update en estado local → revalidate. Sin modal de confirmación para velocidad.
- **Stories dual-strategy**: llamar dos endpoints independientes de Zernio (sync dedicado + listPublishedPosts con type) aumenta probabilidad de éxito sin depender de un solo endpoint desconocido.
- **Música en Storage → path en DB**: el worker descarga el archivo antes de FFmpeg, sin transmitir binarios entre servicios.

**Riesgos / deuda técnica pendiente:**

- Stories: si Zernio no expone stories en ninguno de los dos endpoints, seguirán siendo 0. Requiere verificación en producción con una historia real publicada.
- Add-ons: los cambios de add-ons requieren re-login del usuario (sesión cacheada en `PermissionsProvider`). Agregar revalidación automática sería ideal pero no es bloqueante.
- TRIAL-4: los assets reales de LUT (`warm.cube`) y música (`background-music.mp3`) siguen sin estar en el repo del worker — Santiago debe conseguirlos.

---

### 2026-08-11 — feat: upload real de video a Zernio, email de notificación y cron de limpieza

**Rama/branch:** `feat/trial-reels-video-upload`  
**Commit(s):** `84010ef` — feat(trial-reels): upload real del video a Zernio antes de publicar; `b6b674b` — feat(trial-reels): email de notificación + cron de limpieza de Storage  
**Autor:** Claude  
**Módulo(s) afectado(s):** api/queue/publish-reel-variation, lib/zernio, lib/email, api/cron/cleanup-trial-reels, vercel.json

**Qué se hizo:**

**1. Upload real de video a Zernio (bug crítico resuelto):**
- `lib/zernio/client.ts`: agregados tipos `ZernioMediaPresignResponse` y `ZernioMediaItem`; nuevo método `getMediaPresignedUrl(filename, contentType)` que llama `POST /v1/media/presign`; `createPost()` acepta `mediaItems?: ZernioMediaItem[]` en el payload.
- `api/queue/publish-reel-variation/route.ts`: helper `uploadVideoToZernio()` implementa el flujo completo: obtener presigned URL de Zernio → descargar video de Supabase Storage (URL firmada TTL 2h) → `PUT` video buffer a Zernio → retornar `fileUrl` permanente. `createPost()` ahora incluye `mediaItems: [{ type: "video", url: videoFileUrl }]`. `maxDuration` subido de 30 → 60s.

**2. Email de notificación al admin de la org:**
- `lib/email/trial-reels-email.ts` (nuevo): template HTML con header púrpura OTC, cajas de stats verde/rojo, CTA button. Versión texto plano.
- `lib/email.ts`: `sendTrialReelsDoneEmail()` usando Resend con subject dinámico ("N Trial Reels publicados" o "N publicados, M con error").
- En `publish-reel-variation/route.ts`: cuando `allDone === true`, llama `notifyOrgAdminDone()` best-effort (fire-and-forget, nunca bloquea la respuesta).

**3. Cron de limpieza de Storage:**
- `api/cron/cleanup-trial-reels/route.ts` (nuevo): busca jobs con `status in ('done', 'failed')` y `updated_at < 30 días atrás`; elimina archivos del bucket `trial-reels` vía `admin.storage.from('trial-reels').remove(paths)`; loggea archivos eliminados y errores; idempotente.
- `vercel.json`: entrada del nuevo cron a las 03:00 UTC diariamente.

**Por qué / finalidad:**

El bug principal del feature era que `createPost` en Zernio no tenía el campo `mediaItems` — los reels se creaban en Zernio como borradores vacíos sin video adjunto. La investigación de la API de Zernio (vía repos GitHub de zernio-dev) reveló el flujo de 2 pasos: presign URL → upload binario → usar fileUrl permanente en mediaItems.

El email de notificación cierra el loop para el founder: sabe cuándo terminaron de publicar sus reels sin tener que abrir OTC manualmente. La limpieza de Storage evita acumulación de videos en el bucket trial-reels (cada job puede pesar ~50-200 MB) con retención de 30 días.

**Decisiones de diseño relevantes:**

- **Bufferar video en memoria**: `videoRes.arrayBuffer()` en el worker de Vercel — más simple y compatible con Vercel Edge/Node. Alternativa (streaming) más eficiente pero compleja y con menor compatibilidad.
- **Presigned URL TTL 2h**: el proceso completo (descarga Supabase + upload Zernio) puede tardar hasta 60s; 2h es holgado y cubre reintentos de QStash.
- **notifyOrgAdminDone best-effort**: `void fn().catch(log)` — un fallo de email nunca debe romper la respuesta del endpoint.
- **30 días de retención en Storage**: balance entre debugging (poder ver videos de jobs fallidos) y costo de Storage. Configurable via constante `RETENTION_DAYS`.

**Riesgos / deuda técnica pendiente:**

- Música personalizable por org (upload a Storage, worker descarga) pendiente.
- Re-intentar variante fallida individualmente (sin recrear el job) pendiente.
- Re-generar captions/hashtags con IA por variante pendiente.
- El cron de limpieza no limpia la carpeta raíz si quedó vacía — Supabase Storage no tiene `rmdir` automático, pero no genera costo ni error.

---

### 2026-08-11 — feat: delay real entre publicaciones de Trial Reels con QStash

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `a53ce78` — feat(trial-reels): delay real entre publicaciones con QStash  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/trial-reels, api/queue, lib/queue

**Qué se hizo:**

- `publishVariationsAction` refactorizado: en lugar de publicar sincrónicamente con `setTimeout` falso (máx 30s), ahora encola cada variante incluida en QStash con `delay = posición * delay_hours * 3600` segundos. Retorna inmediatamente con `{ ok: true, scheduled: N }`.
- Nuevo endpoint `POST /api/queue/publish-reel-variation/route.ts`: recibe `{ jobId, variationIndex, organizationId }`, verifica auth (WORKER_AUTH_SECRET triple-auth o firma QStash), genera URL firmada del video en Supabase Storage (TTL 1h), publica en Zernio como draft, actualiza la variante en DB (→ `published` o `failed`). Marca el job como `"done"` cuando todas las variantes incluidas terminan.
- Nuevo estado `"scheduled"` en `ReelVariationStatus`: las variantes pasan a este estado cuando quedan encoladas, antes de que QStash las dispare.
- `variation-card.tsx`: badge "Programada" (azul) para variantes en estado `scheduled`, con ícono `Clock`. También permite expandir preview de video en estado `scheduled`.
- `trial-reels-panel.tsx`: toast de confirmación actualizado al nuevo return type; `includedCount` ahora cuenta también variantes `scheduled`.
- `lib/queue/verify-queue-request.ts` (nuevo): helper de auth para endpoints de cola, triple-método consistente con el worker de Fly.io.
- `lib/queue/qstash-client.ts`: helper `getReelVariationPublishUrl()`.

**Por qué / finalidad:**

El delay entre publicaciones era un `setTimeout(r, Math.min(delayMs, 30_000))` dentro de un Server Action — nunca podría respetar delays de horas sin que Vercel (30s máx en funciones serverless) cortara la conexión. Con QStash se encolan N mensajes independientes, cada uno con su `delay` en segundos; QStash los re-entrega al endpoint correcto en el momento exacto, sin mantener ninguna conexión abierta.

**Decisiones de diseño relevantes:**

- **Posición vs. índice para el delay**: el delay se calcula en base a la posición entre las variantes *incluidas* (no el índice absoluto). La primera incluida siempre se publica inmediatamente (delay=0), la segunda con delay_hours de lag, etc. Esto evita gaps si el usuario excluyó variantes intermedias.
- **Idempotencia en el endpoint**: el endpoint verifica `variation.status !== "scheduled"` antes de procesar; si QStash reintenta (retries=2) y la variante ya fue procesada, responde 200 sin duplicar.
- **Return 200 siempre en el endpoint**: aunque la publicación falle, se responde 200 para que QStash no reintente infinitamente (el error se persiste en `variation.error`).
- **Sin Zernio → falla temprana**: si Zernio no está conectado, `publishVariationsAction` NO falla (sí lo haría el endpoint de publicación individual). Se optó por dejar que falle el endpoint individual para no bloquear el flujo de scheduling.

**Riesgos / deuda técnica pendiente:**

- El endpoint de publicación no adjunta el video binario a Zernio — solo envía el caption. Para que Zernio suba el video a Instagram, hace falta que la API de Zernio soporte una URL de media en el payload `createPost`. Verificar con la documentación de Zernio si el campo `mediaUrl` existe.
- Las URLs firmadas de Supabase Storage (generadas en el endpoint) tienen TTL de 1h — si el delay configurado supera 1h, la URL expirará antes de que Zernio la procese. Solución futura: generar la URL firmada en el momento de publicar (ya está implementado así — el endpoint genera la URL en el momento en que QStash lo dispara, no antes).
- Música personalizable por org (upload a Storage, worker descarga) pendiente.
- Notificación al founder cuando todas las variantes terminaron pendiente.
- Limpieza automática de Storage (trial-reels bucket) pendiente.

---

### 2026-08-10 — Fix: reel-worker crasheaba en Node.js 20 por falta de soporte nativo de WebSocket

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `257d5a1` — fix(reel-worker): Node.js 22 para soporte nativo de WebSocket  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (Dockerfile, package.json)

**Qué se hizo:**

- `apps/reel-worker/Dockerfile`: Cambiado `FROM node:20-slim` → `FROM node:22-slim` en ambas etapas (builder y runner).
- `apps/reel-worker/package.json`: Actualizado `"engines": { "node": ">=20" }` → `"engines": { "node": ">=22" }`.

**Por qué / finalidad:**

Los jobs seguían en estado `"pending"` incluso después del fix de autenticación triple. Fly.io logs revelaron el crash real al procesar el primer job:

```
error: 'Node.js 20 detected without native WebSocket support.
Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })'
```

`@supabase/supabase-js` v2.45 require WebSocket nativo (disponible en Node.js 22+) o instalar el paquete `ws` manualmente. Al llamar `createClient()` en `processor.ts`, la librería de Supabase Realtime intentaba inicializar una conexión WebSocket y crasheaba inmediatamente sin marcar el job como "failed" en DB. El job quedaba en `"pending"` para siempre.

**Decisiones de diseño relevantes:**

- Alternativa 1: agregar `ws` como dependencia y pasarla via `transport` en el `createClient()`. Más invasivo, requiere cambios en processor.ts.
- Alternativa 2: subir a Node.js 22 (WebSocket nativo desde v21.6+). Sin cambios de código, Docker multi-stage lo soporta bien. ✓ Elegida.
- Node.js 22 es LTS desde octubre 2024 — cambio sin riesgo de compatibilidad.

**Riesgos / deuda técnica pendiente:**

- Requirió que el usuario hiciera `git pull` antes de `fly deploy` — el primer intento de deploy usó el Dockerfile local con node:20 (ya que la imagen cacheada en Docker no había cambiado). El segundo intento (con `git pull` previo) compiló node:22 correctamente.
- Si en el futuro se actualiza `@supabase/supabase-js` a v3+, verificar si siguen usando WebSocket nativo o si cambian el modelo de transporte.

---

### 2026-08-10 — Fix: autenticación del worker con triple redundancia (X-Worker-Secret + Bearer + query param)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `a6a513d` — fix(trial-reels): auth robusta con X-Worker-Secret header y query param  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts), apps/web (reel-variation-actions.ts)

**Qué se hizo:**

- `apps/reel-worker/src/index.ts`: `verifySignature()` ahora intenta autenticación en este orden:
  1. **X-Worker-Secret** header (custom, nunca stripeado por proxies ni QStash)
  2. **Authorization: Bearer `<secret>`** header (método original)
  3. **`?workerSecret=<secret>`** URL query param (fallback absoluto — QStash nunca modifica query params)
  - Si ninguno coincide, log de diagnóstico mostrando cuántos chars llegaron vs esperados para detectar mismatches.
- `apps/web/app/marketing/content/reel-variation-actions.ts`: `createTrialReelsJobAction` ahora:
  - Agrega `workerSecret` en la URL como query param (`?workerSecret=<secret>`)
  - Pasa ambos headers `X-Worker-Secret` y `Authorization: Bearer` en el `publishJSON()` de QStash

**Por qué / finalidad:**

Después de confirmar que QStash entregaba el job al worker (imageId en response), los jobs seguían en `"pending"`. La hipótesis era que QStash stripeaba el header `Authorization` en tránsito (comportamiento documentado en algunos proxies). La solución: enviar el secret por tres canales distintos para máxima robustez, sin depender de que ninguno en particular llegue intacto.

**Decisiones de diseño relevantes:**

- QStash garantiza que los query params de la URL destino llegan intactos al endpoint — los headers son más propensos a ser modificados/stripeados.
- El log de diagnóstico (`got N chars, expected M`) permite detectar mismatches de WORKER_AUTH_SECRET entre Fly.io y Vercel sin exponer el secret completo en logs.
- La verificación se hace en el orden más-a-menos confiable: header custom → header estándar → query param.

**Riesgos / deuda técnica pendiente:**

- El query param expone el secret en logs de Fly.io y QStash si están habilitados. Para uso en producción de alta seguridad, idealmente usar solo el header X-Worker-Secret. Por ahora el triple-método es adecuado para el contexto.
- Si en el futuro se cambia WORKER_AUTH_SECRET, hay que actualizarlo en dos lugares: Fly.io secrets Y Vercel env vars (y hacer redeploy de ambos).

---

### 2026-08-10 — Fix: Trial Reels quedaba en "pending" por 401 del worker (signing keys QStash incorrectas)

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `9726810` — fix(trial-reels): WORKER_AUTH_SECRET para evitar 401 por signing keys de QStash  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts), apps/web (reel-variation-actions.ts, [id]/page.tsx)

**Qué se hizo:**

- `apps/reel-worker/src/index.ts`: La función `verifySignature()` ahora verifica primero un `Authorization: Bearer <WORKER_AUTH_SECRET>` header. Si `WORKER_AUTH_SECRET` está configurado y el header coincide → acepta. Si no coincide → rechaza sin continuar a QStash signing. Si `WORKER_AUTH_SECRET` no está configurado → cae al flujo previo de QStash signing.
- `apps/web/app/marketing/content/reel-variation-actions.ts`: `createTrialReelsJobAction` pasa `Authorization: Bearer <WORKER_AUTH_SECRET>` como header custom en el `client.publishJSON()` de QStash (QStash reenvía el header al worker). También agrega log del `hasWorkerAuthSecret` para diagnóstico.
- `apps/web/app/(platform)/marketing/content/[id]/page.tsx`: Agrega `export const maxDuration = 300` para que la Server Action no sea cortada por el timeout de Vercel mientras descarga el video de Drive o sube a Supabase (archivos grandes pueden tardar >10s).
- Startup log del worker ahora muestra explícitamente si `WORKER_AUTH_SECRET` está configurado.

**Por qué / finalidad:**

Después del fix de procesamiento sincrónico (commit `7996341`), los jobs SEGUÍAN quedando en `"pending"` indefinidamente. El diagnóstico:
- QStash entregaba el job al worker (`https://otc-reel-worker.fly.dev/`)
- El worker verificaba la firma usando `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` — estos secrets estaban configurados en Fly.io pero probablemente con valores incorrectos o desincronizados respecto a lo que QStash usa para firmar
- El worker respondía `401 Unauthorized`
- QStash reintentaba 2 veces (retries: 2), fallaba los 3 intentos, abandonaba la entrega
- Job quedaba para siempre en `"pending"` (QStash no tiene mecanismo para marcar el job como fallido en la DB nuestra)

**Decisiones de diseño relevantes:**

- Usar `WORKER_AUTH_SECRET` como token Bearer en lugar de depender de las signing keys de QStash, que son más complejas de sincronizar y verificar (JWT con timestamp, URL, etc.). El Bearer token es más simple, más predecible y más fácil de debuggear.
- Si `WORKER_AUTH_SECRET` está seteado y el header NO coincide, rechazar inmediatamente sin caer al QStash signing. Esto previene bypass accidental por token desconfigurado.
- QStash soporta pasar headers custom en `publishJSON({ headers: {...} })` — los reenvía intactos al endpoint destino.

**Riesgos / deuda técnica pendiente:**

- **El usuario debe configurar `WORKER_AUTH_SECRET` como secret en Fly.io Y como env var en Vercel.** Sin esto, la autenticación del worker cae al flujo QStash signing previo (que sigue sin funcionar si las keys están mal).
- Pasos necesarios:
  1. Generar un string aleatorio: `openssl rand -base64 32`
  2. Configurar en Fly.io: `fly secrets set WORKER_AUTH_SECRET=<valor> --app otc-reel-worker`
  3. Configurar en Vercel: env var `WORKER_AUTH_SECRET=<mismo valor>` → redeploy
  4. Redeploy Fly.io: `fly deploy --config apps/reel-worker/fly.toml`

---

### 2026-08-10 — Fix: reel-worker procesaba en background, Fly.io mataba la máquina antes de que FFmpeg corriera

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `7996341` — fix(reel-worker): procesar sincrónicamente para evitar que Fly.io mate la máquina  
**Autor:** Claude  
**Módulo(s) afectado(s):** apps/reel-worker (index.ts, processor.ts)

**Qué se hizo:**

- `index.ts`: El endpoint POST del worker ahora procesa el job **sincrónicamente** (await `processReelVariationJob(payload)` antes de llamar `res.json()`). La conexión HTTP queda abierta mientras corre FFmpeg; Fly.io no puede apagar la máquina mientras haya una conexión activa.
- `processor.ts`: Agregado check de **idempotencia** al inicio de `processReelVariationJob`: si el job ya está en un estado distinto de `"pending"`, se hace return inmediato. Previene reprocesamiento si QStash reintenta una entrega mientras el worker ya está ejecutando.
- Respuesta en error: si `processReelVariationJob` lanza, se responde `200 { ok: false, status: "failed" }` en lugar de `500`, para que QStash no reintente (el processor ya marcó el job como "failed" en DB).

**Por qué / finalidad:**

El job `df1405b3` quedó en estado `"pending"` indefinidamente sin que el worker lo procesara. Diagnóstico:
- Con `auto_stop_machines = true` y `min_machines_running = 0` en fly.toml, Fly.io detiene la máquina cuando no hay conexiones HTTP activas.
- El patrón anterior era: responder `200 OK` inmediatamente → luego procesar en `setImmediate()`.
- Al cerrar la conexión HTTP (200 enviado), Fly.io consideraba la máquina idle y la apagaba antes de que `processReelVariationJob` actualizara la DB a `"processing"` y mucho antes de que FFmpeg terminara.
- El job quedaba en `"pending"` para siempre porque QStash ya no reintentaba (consideraba la entrega exitosa al recibir 200).

**Decisiones de diseño relevantes:**

- Alternativas consideradas: (a) `min_machines_running = 1` (costo constante), (b) aumentar `stop_timeout` en fly.toml (no resuelve trabajo de minutos), (c) procesar sincrónicamente ✓ (aprovecha `timeout: 900` ya configurado en QStash).
- El `timeout: 900` en QStash publishJSON permite que la conexión esté abierta hasta 15 minutos, más que suficiente para FFmpeg (estimado 2-5 min para 5 variantes de un video de reel).

**Riesgos / deuda técnica pendiente:**

- El job `df1405b3` quedó en estado `"pending"` y no puede rerecuperarse automáticamente (QStash ya no va a reintentarlo). El usuario debe crear un nuevo job desde la UI para ese reel.
- Si FFmpeg tarda más de 15 minutos (videos muy largos), QStash timeout-eará la request y reintentará. El check de idempotencia evita doble procesamiento si esto ocurre.
- La respuesta 200 con `{ ok: false }` en caso de error es no convencional; se podría cambiar a usar QStash's "callback URL" para notificaciones de fallo sin depender del HTTP response code.

---

### 2026-08-10 — Fix: errores de TypeScript/ESLint en archivos de Trial Reels para pasar build de Vercel

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `8413c0a` — fix(trial-reels): escapar comillas en JSX para ESLint  
  `939d5c9` — fix(trial-reels): corregir errores de TypeScript en archivos nuevos  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/trial-reels, packages/ui, api/queue

**Qué se hizo:**

Cuatro errores bloqueaban el build de Vercel en los archivos de Trial Reels introducidos en el commit anterior:

1. **ESLint `react/no-unescaped-entities`** (`trial-reels-panel.tsx` línea 234): Las comillas dobles en JSX literal (`"Crear Trial Reels"`) no están permitidas. Fix: `&ldquo;…&rdquo;`.

2. **TypeScript `Type 'string' is not assignable to type 'null'`** (`processor.ts` línea 134): `initialVariations` era inferido como `{ error: null }[]` en vez de `ReelVariation[]`, por lo que asignar `error: msg` (string) fallaba. Fix: agregar anotación explícita `const initialVariations: ReelVariation[]` y tipar `VariantDef.type` como `ReelVariationType`.

3. **TypeScript `Property 'marketing' does not exist on type`** (`reel-variation-actions.ts` líneas 204 y 462): Se usaba `paths.marketing.content` (inexistente en nivel raíz) en vez de `paths.platform.marketing.content`.

4. **TypeScript implicit `any`** (`variation-card.tsx` líneas 213, 225): `onChange` handlers sin tipo. Fix: `React.ChangeEvent<HTMLTextAreaElement>`.

5. **Badge `children` en React 19** (`badge.tsx`): `React.HTMLAttributes` ya no incluye `children` en React 19. Fix: declarar `children?: React.ReactNode` explícitamente en `BadgeProps`.

**Por qué / finalidad:**
Cada commit a la rama dispara un preview deployment en Vercel. Los errores en archivos nuevos (no cacheados por Turbo) fallaban el build impidiendo testear el feature completo en producción.

**Decisiones de diseño relevantes:**
- Los errores de Badge `children` son pre-existentes en muchos archivos del proyecto que ya pasan el build (se sirven desde la caché de Turbo). Solo los archivos nuevos (sin caché) se ven afectados.
- La anotación `ReelVariation[]` en `processor.ts` es la solución mínima — no restructurar la función.

**Riesgos / deuda técnica pendiente:**
- El warning de Badge `children` es cosmético en tsc local pero no falla Vercel — hay ~15 archivos pre-existentes con el mismo error que Vercel ignora por caché de Turbo. A largo plazo, migrar todos los usos.
- El fix de Badge en `packages/ui` es una mejora general pero la raíz del problema es que React 19 eliminó `children` de `HTMLAttributes` — todos los componentes con `extends React.HTMLAttributes` de la UI deben revisarse.

---

### 2026-08-10 — Feature: Trial Reels — generación automática de 5 variaciones de reels

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `1ad489d` — feat(marketing): Trial Reels — generación automática de 5 variaciones de reels  
  `b137a0f` — fix(reel-worker): crear carpeta luts vacía para Docker build  
  `2191cf5` — fix(reel-worker): escuchar en 0.0.0.0 para compatibilidad con Fly.io  
**Autor:** Claude  
**Módulo(s) afectado(s):** marketing/content, reel-worker (nuevo servicio), supabase/migrations, types, components

**Qué se hizo:**

Feature completa de Trial Reels: el usuario selecciona un reel de `content_pieces` (que tenga un `drive_file_id` vinculado), OTC descarga el video desde Google Drive, lo sube a Supabase Storage y encola un job en QStash. Un worker en Fly.io procesa el video con FFmpeg generando 5 variantes automáticamente. El usuario puede previsualizar cada variante, editar el caption y hashtags, incluir/excluir variantes, y publicarlas en Zernio con delay configurable entre posts.

**Archivos creados:**
- `supabase/migrations/20260810120000_trial_reels_jobs.sql` — Tabla `reel_variation_jobs` + bucket `trial-reels` + RLS + índices + trigger
- `apps/web/types/reel-variations.ts` — Tipos TypeScript para el módulo
- `apps/web/app/marketing/content/reel-variation-actions.ts` — Server Actions: `createTrialReelsJobAction`, `getReelVariationJobAction`, `listReelVariationJobsForPieceAction`, `updateReelVariationAction`, `setReelVariationDelayAction`, `publishVariationsAction`, `refreshVariationPreviewUrlsAction`
- `apps/web/app/api/queue/process-reel-variations/route.ts` — Endpoint receptor de QStash (fallback dev / Vercel)
- `apps/web/app/api/queue/process-reel-variations/processor.ts` — Procesador FFmpeg inline (dev)
- `apps/reel-worker/` — Worker completo para Fly.io (Node.js + FFmpeg):
  - `src/types.ts`, `src/ffmpeg-variants.ts`, `src/captions.ts`, `src/processor.ts`, `src/index.ts`
  - `fly.toml`, `Dockerfile`, `package.json`, `tsconfig.json`, `README.md`
- `apps/web/components/marketing/trial-reels/trial-reels-button.tsx` — Botón CTA
- `apps/web/components/marketing/trial-reels/variation-card.tsx` — Card por variante con video player + editor de caption
- `apps/web/components/marketing/trial-reels/trial-reels-panel.tsx` — Panel completo con Supabase Realtime, selector de delay, y publicación
- `apps/web/components/marketing/trial-reels/index.ts` — Barrel export

**Archivos modificados:**
- `apps/web/components/marketing/content-piece-detail.tsx` — Nueva tab "Trial Reels" + TrialReelsButton en panel izquierdo (solo para reels con Drive vinculado)
- `apps/web/components/marketing/marketing-content-detail-page-client.tsx` — Prop `initialReelJobs`
- `apps/web/app/(platform)/marketing/content/[id]/page.tsx` — Fetcha `reel_variation_jobs` en paralelo para SSR
- `.env.example` — Agregada variable `REEL_WORKER_URL`

**Por qué / finalidad:**

Estrategia de "Trial Reels": publicar 5 variaciones de un reel que funcionó bien, cambiando velocidad, música, subtítulos y colorimetría. Usada por creadores para maximizar alcance y testear qué variante tiene mejor performance. OTC automatiza todo el proceso desde la descarga hasta la publicación.

**Decisiones de diseño relevantes:**

1. **Worker separado en Fly.io** (no Vercel lambda): FFmpeg procesar video tarda varios minutos, Vercel tiene límite de 300s y no tiene FFmpeg instalado. Fly.io con `performance-2x` (2 vCPU, 4 GB RAM) lo maneja sin límite.

2. **El video fuente se descarga desde Next.js (no el worker)**: Para la descarga de Drive se necesita el token OAuth de Google del usuario, que está en la sesión Next.js. El servidor Next.js descarga el video en la Server Action y lo sube a Supabase Storage. El worker solo accede a Storage (con service role), sin necesitar tokens de usuario.

3. **Metadatos anti-detección**: Cada variante reescribe `creation_time`, `encoder`, `make`, `model`; strip con `-map_metadata -1`; bitrate variado ±5%; crop de 1-2px. Esto rompe el fingerprint de video para que Instagram no detecte el mismo video resubido.

4. **Supabase Realtime en el panel**: El estado del job se actualiza en tiempo real sin polling — el worker actualiza DB directamente y el cliente recibe las actualizaciones vía `postgres_changes`.

5. **Captions con Haiku**: Se generan al momento de `preview_ready` con tonos diferentes por variante (energético para speed_up, contemplativo para speed_down, etc.). El usuario puede editarlos antes de publicar.

6. **Publicación como draft en Zernio**: `createPost` con `status: 'draft'` porque Zernio necesita el video subido directamente vía su UI para Instagram reels. La URL firmada de Storage se adjunta para que el usuario la use desde Zernio si la publicación directa falla.

**Riesgos / deuda técnica pendiente:**

- **Fly.io no configurado**: El worker necesita deploy en Fly.io y que `REEL_WORKER_URL` esté en las env vars de Vercel. Sin esto, QStash apunta al endpoint fallback de Next.js que en Vercel devuelve error (sin FFmpeg).
- **LUT y música**: Sin `luts/warm.cube` y `luts/background-music.mp3`, las variantes V3 y V5 usan fallbacks (silencio y eq filter). Para producción real, incluir assets de calidad.
- **Videos > 500 MB**: El límite actual es 500 MB. Videos muy pesados fallarán en descarga.
- **Delay entre publicaciones**: El delay real de horas se simula con 30s max para no bloquear el servidor en la Server Action. Para delays reales, implementar con un schedule de QStash (future work).
- **Instagram Reels vía Zernio**: La publicación directa de reels puede requerir endpoints específicos de Zernio que aún no están mapeados en el cliente. Verificar con equipo Zernio.
- **Concurrencia**: `fly.toml` limita a 2 requests concurrent y 1 soft limit. Si hay muchos jobs simultáneos, se pondrán en cola o se rechazarán.

---

### 2026-08-09 — Fix MRR=0 y Nuevos clientes=0 en Panel General

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `26dcf51` — fix(dashboard): corregir MRR=0 y Nuevos clientes=0 en Panel General  
**Autor:** Claude  
**Módulo(s) afectado(s):** `lib/metrics/derive-dashboard-data.ts`, `components/dashboard/dashboard-page-content.tsx`

**Qué se hizo:**

**Bug 1 — MRR = 0 US$:**  
`deriveDashboardData` llamaba a `deriveFinanceSummary` sin el argumento `payments`. Esto hace que `collectRevenueEvents` use el fallback `collectRevenueEventsFromClients`, que genera eventos de cobro solo a partir de `client.installments[].paidAt`. Los clientes seed con `payment_type = 'upfront_fee'` y `installments = []` no producían ningún evento → MRR = 0, aunque hubiera pagos reales en `client_payments`.

**Fix:** Se agregó un parámetro opcional `payments?: ClientPayment[]` a `deriveDashboardData` y se pasa a `deriveFinanceSummary`. `DashboardPageContent` ahora extrae `clientPayments` de `useFinanceData()` (ya disponible en el provider) y lo pasa al cálculo.

**Bug 2 — Nuevos clientes = 0:**  
`new Date("2026-08-01").getMonth()` retorna `6` (julio) en entornos UTC-3 porque la cadena ISO sin hora se parsea como UTC midnight, y `getMonth()` devuelve la fecha en hora local — que en UTC-3 es `2026-07-31T21:00:00`. Este bug suprimía todo cliente cuyo `joinDate` sea el 1° del mes.

**Fix:** Se reemplaza la comparación `getMonth() / getFullYear()` por comparación de string `YYYY-MM`: `c.joinDate.slice(0, 7) === nowYearMonth`. Inmune a offsets de timezone.

**Por qué / finalidad:**
Estas dos métricas aparecían en "0" en el Panel General incluso con datos seed coherentes insertados. Afectan directamente la legibilidad del dashboard para el founder.

**Decisiones de diseño relevantes:**
- Se eligió agregar `payments?` a `deriveDashboardData` (en lugar de reestructurar para recibir un `FinanceSummary` pre-computado) para mantener la función pura y testeable sin providers.
- `clientPayments` ya estaba disponible en `FinanceDataProvider` y `FinanceDataContext` — solo faltaba consumirlo en el componente del dashboard.
- La comparación de string `YYYY-MM` es más robusta que `parseDateOnly` (de `revenue-period.ts`) porque no requiere importar otra dependencia.

**Riesgos / deuda técnica pendiente:**
- El mismo bug de UTC-midnight podría existir en otros sitios del codebase que usen `new Date("YYYY-MM-DD")` y luego llamen a `.getMonth()` / `.getFullYear()`. Buscar en el futuro: `new Date(.*joinDate|createdAt|paidAt.*).getMonth\(` o similar.
- Si `clientPayments` crece mucho (miles de pagos), el `useMemo` del dashboard se recalculará cada vez que varíe el array. No es un problema hoy pero a escala habría que memoizar mejor.

---

### 2026-08-09 — Diagnóstico de bugs de dashboards con seed data: hallazgos

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Autor:** Claude (investigación, sin cambios de código)  
**Módulo(s) afectado(s):** análisis cross-módulo

**Qué se hizo:**
Investigación exhaustiva de tres problemas reportados tras insertar datos seed:

**Prioridad 1 — "Tasa de agendamiento: 550%" y "Tasa de fantasma: 125%":**  
No hay bug matemático. Con los datos seed: `bookingRate = 55%` (22/40 conversaciones son booked/agendado/closeado), `ghostingRate = 12.5%` (5/40). El formato "55,0%" (coma decimal española en `derive-dashboard-data.ts`) puede confundirse visualmente con "550%" en fuente pequeña. Las fórmulas en `derive-sales-metrics.ts` son correctas (siempre ≤100%).

**Prioridad 3 — "Distribución de contenido publicado: VENTA 100%":**  
No hay bug. Las 6 `content_assets` existentes son posts de Instagram del tipo "Si querés…, entrá a la waitlist" — CTA directo → correctamente etiquetados como VENTA por la IA. Los datos seed se insertaron en `content_pieces` (Zernio, tabla separada), que el gráfico de distribución no consulta. `getContentDistributionDataAction` usa `listContentAssetsAction()` que solo lee `content_assets`.

**Riesgos / deuda técnica pendiente:**
- El gráfico "Distribución de contenido publicado" no incluye `content_pieces` (Zernio). `content_pieces.analysis->>'ai_label'` usa una taxonomía diferente (texto libre: "Ventas y conversión", "Estrategia de contenido", etc.) — no se mapea directamente a AUTORIDAD/ATRACCION/NUTRICION/VENTA. Para incluir `content_pieces` en el gráfico habría que agregar una columna `content_objective TEXT` o normalizar el mapeo en la acción.

---

### 2026-08-09 — Seed data ficticio en Supabase para testing visual de dashboards

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** sin commit — operación directa en DB de Supabase (no hay cambios de código)  
**Autor:** Claude  
**Módulo(s) afectado(s):** Supabase DB (org `46cce98c-6d4c-4e4d-94a7-7cc24ae1104d` — "Optimiza tu Control")

**Qué se hizo:**
Inserción de datos ficticios de prueba en la base de datos del proyecto Supabase (`nrzlylzbmsuowzhpdnjl`) para la org de Santiago Zurbrigk, con el objetivo de testear visualmente charts y dashboards. Todos los registros están marcados con identificadores específicos para fácil eliminación posterior.

**Resumen de registros insertados:**

| Tabla | Registros | Marcador de seed |
|-------|-----------|-----------------|
| `clients` | 25 clientes | `nickname = '_seed_otc'` |
| `client_payments` | 48 pagos | `payment_received_from = '_seed_otc'` |
| `closing_calls` | 38 llamadas | `notes = '_seed_otc'` |
| `call_analyses` | 22 análisis | `fathom_call_id LIKE 'seed_%'` |
| `conversations` | 40 conversaciones | `external_ref LIKE '_seed_otc_%'` |
| `content_pieces` | 30 piezas | `drive_file_name = '_seed_otc'` |

**Detalles de cada tabla:**

- **clients**: 25 clientes ficticios (dic 2025 → ago 2026). Mezcla de `active`, `success_case`, `onboarding_done`, `pending_onboarding`. 3 productos: Mentoría 1:1 Premium ($2500), Consultoría Intensiva ($800), Membresía Comunidad Pro ($97/mes). Plataformas: mercadopago, stripe, bank_transfer. Email termina en `@seed.otc`.
- **client_payments**: 48 pagos coherentes con cada cliente. Pagos upfront, cuotas (3 meses) y membresías mensuales. Total recaudado seed: ~$39,337. Fechas spread dic 2025 → ago 2026.
- **closing_calls**: 38 llamadas de cierre. Statuses: 21 `closed` ($35,091 en revenue), 11 `not_closed`, 5 `no_show`, 1 `scheduled`. Con `outcome` JSONB, `form_answers`, `no_close_reason`, `amount`. Spread dic 2025 → ago 2026.
- **call_analyses**: 22 análisis de llamadas (Fathom-style). Score promedio 86/100. 21 sold=true. Campos completos: `section_scores`, `objections`, `power_phrases`, `weak_phrases`, `filler_words_count`, `summary`, `strengths`, `improvements`.
- **conversations**: 40 conversaciones DM. 14 `closed`, 8 `booked`, 13 `active`, 5 `ghosted`. Todos los campos IA completados: `ai_score`, `ai_label` (hot/warm/cold), `ai_funnel_stage`, `ai_detected_objections`, `ai_booking_signals`, `ai_recommended_action`, etc.
- **content_pieces**: 30 piezas publicadas feb → jul 2026 con tendencia de crecimiento clara. Views feb: 19K total → jul: 115K total. 2 reels virales: "Storytime: el día que perdí un cliente" (28.4K views, may 2026) y "Hot take: si tu mentoría no tiene sistema" (45.2K views, jul 2026). Campos: `metrics` (JSONB flat), `analysis` (JSONB con ai_label, ai_score, strengths, improvements), `format_type`, `hook_type`, `cta_type`.

**Por qué / finalidad:**
El usuario necesitaba datos reales y coherentes para testear visualmente cómo funcionan los charts de clientes, el pipeline de ventas, el scoring de leads, los análisis de llamadas y las métricas de contenido. Los datos vacíos no permiten evaluar el diseño de los dashboards.

**Script de limpieza (EJECUTAR cuando se quieran eliminar los datos seed):**
```sql
-- Ejecutar en este orden para respetar FK constraints
DELETE FROM call_analyses
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND fathom_call_id LIKE 'seed_%';

DELETE FROM client_payments
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND payment_received_from = '_seed_otc';

DELETE FROM closing_calls
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND notes = '_seed_otc';

DELETE FROM conversations
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND external_ref LIKE '_seed_otc_%';

DELETE FROM content_pieces
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND drive_file_name = '_seed_otc';

DELETE FROM clients
  WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND nickname = '_seed_otc';
```

**Decisiones de diseño relevantes:**
- Se eligió marcar con campos existentes en lugar de agregar una columna `is_seed` para no alterar el schema.
- `conversations.external_ref` tiene un unique constraint por `(organization_id, external_ref)`, por eso se usó `_seed_otc_001..040` en lugar del mismo valor en todos.
- Los datos son coherentes entre sí: los clientes tienen pagos que suman su `total_amount`, las llamadas de cierre coinciden con los leads de conversaciones, los análisis de llamadas referencian las mismas llamadas.
- Las métricas de `content_pieces` usan el formato "flat" que `resolvePostAnalytics` normaliza correctamente.
- Las `call_analyses` no están vinculadas a `closing_calls` por FK (la tabla no tiene constraint directo) — son análisis independientes con `fathom_call_id` de tipo texto.

**Riesgos / deuda técnica pendiente:**
- ⚠️ **Estos datos son temporales** — recordar ejecutar el script de limpieza antes de ir a producción real o antes de demos con clientes reales.
- Los `client_payments` tienen `storage_path = '_seed_otc'` (NOT NULL) — este campo normalmente apunta a un path de Storage de Supabase. No hay archivo real asociado.
- Los `content_pieces` tienen `drive_file_name = '_seed_otc'` pero sin `drive_file_id` real — los links de Drive no funcionarán para estos registros.
- Los análisis de llamadas tienen `fathom_call_id` ficticios — no se pueden cargar transcripciones reales desde Fathom para estos registros.

---

### 2026-08-08 — Fix scrollbar vertical en modales + panel ManyChatManageSheet roto en integraciones

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `791a6fa` — fix(integrations): ocultar scrollbar vertical en modales y corregir panel de ManyChat  
**Autor:** Claude  
**Módulo(s) afectado(s):** `packages/ui`, `integrations`

**Qué se hizo:**
1. **`packages/ui/src/primitives/dialog.tsx` — `DialogContent`**: Agrega `[&::-webkit-scrollbar]:hidden` y `[scrollbar-width:none]` al conjunto de clases base. Oculta el track del scrollbar en WebKit (Chrome, Edge, Safari) y Firefox cuando el `DialogContent` tiene `overflow-y-auto` aplicado vía `className`. El contenido sigue siendo scrolleable; solo desaparece la barra visual.
2. **`apps/web/components/integrations/manychat-manage-sheet.tsx`**: Mueve `shadow-xl` al estado abierto (`open = true`). Cuando el panel está cerrado (`translate-x-full`), la clase `shadow-xl` se reemplaza por `shadow-none`. Root cause: la sombra de un elemento `fixed` no está sujeta a `overflow: clip` del ancestro → sangraba ~25px hacia el interior del viewport → aparecía como una franja/panel oscuro en el borde derecho de la página de integraciones.
3. **`apps/web/components/integrations/integration-card.tsx`**: Renderiza `ManyChatManageSheet` condicionalmente solo cuando `integration.provider === 'manychat'`. Antes se renderizaba para todas las cards de integración (N instancias de un aside fijo en el DOM), lo que multiplicaba el artefacto visual.

**Por qué / finalidad:**
- El usuario reportó que en la página de integraciones aparecía "una card a la derecha o una especie de sidebar roto que no llega a verse". Era el shadow del `ManyChatManageSheet` closed sangrando en el viewport.
- El usuario también reportó scrollbar vertical visible en el modal de Zernio (y otros modales) tras el fix de scrollbar horizontal de la sesión anterior.

**Decisiones de diseño relevantes:**
- `scrollbar-width: none` es Firefox; `::-webkit-scrollbar { display: none }` es WebKit. Ambos se necesitan para cobertura cross-browser.
- El render condicional del `ManyChatManageSheet` por provider es correcto: el estado `manychatManageOpen` y su handler están en `IntegrationCard` y solo se usan cuando `provider === 'manychat'`.
- Separar shadow del transform permite que la animación de slide-in/out siga funcionando sin artefactos.

**Riesgos / deuda técnica pendiente:**
- `ManyChatManageSheet` es un aside fijo custom (no usa Radix Sheet). Podría migrarse a un Sheet de Radix para mayor accesibilidad (focus trap, escape key handling).

---

### 2026-08-08 — Fix "Conectá tus redes" en dashboard + scrollbars en modales

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `bef3902` — fix(dashboard+ui): mostrar métricas Zernio en dashboard y eliminar scrollbars en modales  
**Autor:** Claude  
**Módulo(s) afectado(s):** `dashboard`, `packages/ui`

**Qué se hizo:**
1. **`app/integrations/zernio/actions.ts` — `getZernioAnalyticsAction`**: Reemplazada la llamada a `client.getPostsAnalytics()` (→ `/analytics/posts` de Zernio) por una query a `content_pieces` en Supabase. La función ahora suma `metrics.impressions`, `metrics.likes` y `metrics.comments` de las piezas de Zernio publicadas en los últimos 30 días. `hasData` se setea `true` en cuanto existe al menos una pieza de Zernio en la DB (aunque las métricas sean 0), mostrando el ring chart en vez del empty state "Conectá tus redes". Si no hay piezas en los últimos 30 días, hace un segundo query sin filtro de fecha para verificar si hay piezas históricas.
2. **`packages/ui/src/primitives/dialog.tsx` — `DialogContent`**: Agrega `overflow-x-hidden` al conjunto de clases base de todos los `DialogContent`. Fix global para la scrollbar horizontal que aparecía en modales con `overflow-y-auto` (especialmente visible en el modal de Zernio "Conectar Zernio").

**Por qué / finalidad:**
- El dashboard mostraba "Conectá tus redes para ver analytics / Vinculá cuentas en Zernio..." aunque Zernio estaba conectado y había contenido sincronizado. La causa: `getPostsAnalytics()` llama `/analytics/posts` de Zernio cuyo formato de respuesta (`{ posts: [...], analytics: Record<platform, metrics> }`) no matcheaba el parsing del código → todas las métricas quedaban en 0 → `hasData = false`.
- En el modal de Zernio (y otros modales con `overflow-y-auto`) aparecían tanto una scrollbar vertical como una horizontal. La scrollbar horizontal se activa porque la vertical ocupa espacio (en Windows/sistema con scrollbars siempre visibles), lo que estrecha el contenido disponible y puede disparar overflow horizontal. `overflow-x-hidden` lo previene globalmente.

**Decisiones de diseño relevantes:**
- `content_pieces` es la fuente de verdad para métricas de Zernio (ya normalizadas por `resolvePostAnalytics`). Usarla en el dashboard evita una llamada en vivo a Zernio en cada carga del dashboard (más lento y frágil).
- `overflow-x-hidden` en el base `DialogContent` es seguro: los diálogos tienen `max-w-lg` fijo y nunca necesitan scroll horizontal. La propiedad puede sobreescribirse pasando `overflow-x-auto` en `className` si algún caso especial lo requiriera.

**Riesgos / deuda técnica pendiente:**
- Si hay piezas de Zernio pero ninguna en los últimos 30 días, el dashboard mostrará el ring chart con métricas en 0 (con "Sin datos de engagement") en vez del empty state. Es el comportamiento correcto ya que Zernio está conectado y tiene datos históricos.
- La función `getZernioAnalyticsAction` ahora importa `createClient` de `@/lib/supabase/server` en el archivo `zernio/actions.ts`. Verificar que no haya conflictos con el uso existente de `createAdminClient`.

---

### 2026-08-08 — Fix React #418 (hidratación) en detalle de contenido + sync de historias Zernio

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `d724eae` — fix(marketing): hidratación React #418 y sync de historias Zernio  
**Autor:** Claude  
**Módulo(s) afectado(s):** `marketing`, `lib/marketing`

**Qué se hizo:**
1. **`content-piece-detail.tsx` — React error #418**: Añadido `suppressHydrationWarning` en todos los elementos que renderizan fechas/números con `toLocaleString("es-AR")` / `toLocaleDateString("es-AR")` (elementos `<p>` y `<span>` en líneas de fecha de publicación, métricas actualizadas, funnel de atribución de ventas, fecha de variantes IA). Para el prop `subtitle` de `ChartShell` (string interpolado — no admite `suppressHydrationWarning` directamente), se reemplazó `totalInteractions.toLocaleString("es-AR")` por `fmtNum(totalInteractions)` que evita separadores de locale para valores ≥1000.
2. **`sync-actions.ts` — `fetchExternalPostsViaSync`**: Además del `syncExternalPosts` (POST /posts/sync-external → toca Instagram /me/media, NO trae stories), ahora también llama `listPublishedPosts({ source: "external", accountId, limit: 200 })` para cada cuenta. Esto recupera todos los posts externos conocidos por Zernio, incluyendo historias si Zernio las sincroniza vía otro mecanismo. Los dos conjuntos se mergean y se deduplicam con `dedupeExternalPosts`.
3. **`sync-actions.ts` — `externalPlatformPostId`**: Fallback para historias sin `platformPostId`: si el `_id` de Zernio es un MongoDB ObjectID (24 hex chars) y el tipo es `story`, se usa `zstory_<id>` como identificador en lugar de descartar la historia.
4. **Logging**: Se añade logging detallado con `storyCount` y `types` en ambas llamadas a Zernio para diagnosticar qué tipos devuelve cada endpoint.

**Por qué / finalidad:**
- **Error #418**: El componente `ContentPieceDetail` es `"use client"` pero Next.js igual lo pre-renderiza en el servidor (SSR). `toLocaleString("es-AR")` produce resultados distintos entre Node.js (ICU limitada o de sistema) y el browser, causando mismatch en el texto hidratado → React error #418.
- **Historias**: `syncExternalPosts` (POST /posts/sync-external) solo sincroniza el feed `/me/media` de Instagram, que por diseño de la API de Meta no incluye stories (están en `/me/stories`). Las historias publicadas no aparecían en el módulo de Contenido porque nunca se obtenían. El usuario publicó una historia manualmente y al hacer sync manual no la veía.

**Decisiones de diseño relevantes:**
- `suppressHydrationWarning` es preferible a envolver en `useEffect`/`useState` porque no cambia el comportamiento de la UI (la fecha se muestra igual) y no agrega re-render.
- Para el subtitle prop de ChartShell, `fmtNum()` es locale-safe para valores ≥1000 (usa `K`/`M` con `toFixed`) y para <1000 los separadores locales son irrelevantes (no hay miles).
- `zstory_<id>` como prefijo para IDs de historias sin platformPostId evita colisiones con IDs reales de Instagram y hace el origen obvio en la DB.
- La llamada `listPublishedPosts({ source: "external" })` es complementaria a `syncExternalPosts`: la primera lista lo que Zernio ya conoce, la segunda fuerza un re-sync desde Instagram.

**Riesgos / deuda técnica pendiente:**
- No se sabe con certeza si Zernio incluye stories en `GET /posts?source=external`. Hay logging para diagnosticarlo. Si `storyCount` sigue siendo 0, el problema está en Zernio (no sincroniza stories de Instagram en `/me/stories`) y requeriría un endpoint separado en Zernio o un mecanismo diferente.
- La URL de una historia en Instagram solo existe mientras la historia está activa (24hs). Si Zernio no guarda el `thumbnailUrl` de la historia, la columna `thumbnail_url` quedaría null.

---

### 2026-08-08 — Fix errores 403 en consola del módulo Marketing por URLs CDN de Instagram expiradas

**Rama/branch:** `claude/marketing-module-console-errors-g2py5w`  
**Commit(s):** `c432abe` — fix(marketing): eliminar errores 403 por URLs CDN de Instagram expiradas en thumbnails  
**Autor:** Claude  
**Módulo(s) afectado(s):** `marketing`, `lib/marketing`

**Qué se hizo:**
1. **Nuevo `lib/marketing/cdn-utils.ts`**: utilidad pura (sin deps de servidor, importable en Client Components) con `isInstagramCdnUrl` y `safeThumbnailUrl`. Esta última devuelve null para URLs CDN efímeras.
2. **`story-thumbnail-storage.ts`**: importa `isInstagramCdnUrl` desde `cdn-utils.ts` y lo re-exporta (evita duplicación).
3. **`sync-actions.ts` — caso `toInsert`**: cuando `persistContentThumbnail` falla, ahora guarda `null` en lugar de la URL CDN cruda. Antes se insertaba la URL CDN que expira en ~1-2hs generando 403 en el próximo page load.
4. **`sync-actions.ts` — `repairExpiredCdnThumbnails`**: nueva función que nulifica URLs CDN vencidas en filas existentes. Se llama en background cada vez que `maybeSyncZernioContentAction` se ejecuta (en el page load de marketing/content). Las URLs se restauran en el próximo sync de Zernio.
5. **Componentes UI** (`content-piece-grid.tsx`, `content-piece-detail.tsx`, `marketing-overview.tsx`, `marketing-content-library.tsx`): usan `safeThumbnailUrl()` antes de renderizar `<img>` → si la URL es CDN, muestran el fallback icon directamente sin hacer el request HTTP que causaba el 403.

**Por qué / finalidad:**
Las URLs de thumbnails de Instagram/Zernio son efímeras (expiran en ~1-2hs). El sistema tiene lógica para persistirlas en Supabase Storage (`persistContentThumbnail`), pero cuando ese proceso fallaba en inserts, la URL CDN cruda quedaba guardada en la DB. Después de expirar, cada page load del módulo marketing generaba múltiples errores `GET https://scontent-gru*.cdnins... 403 (Forbidden)` en la consola del browser.

**Decisiones de diseño relevantes:**
- **Doble defensa**: fix en sync (no guardar CDN URLs) + fix en UI (no renderizar CDN URLs). Así el comportamiento correcto se mantiene aunque fallen los dos mecanismos por separado.
- **Repair en background**: `repairExpiredCdnThumbnails` corre async sin bloquear el throttle check del sync, minimizando impacto en tiempo de carga.
- **cdn-utils.ts separado**: necesario para que el check sea importable en Client Components (que no pueden importar `story-thumbnail-storage.ts` porque ese archivo tiene `createAdminClient` como dep de servidor).
- El caso `toUpdate` ya era correcto (guardaba null cuando fallaba); solo el caso `toInsert` tenía el bug.

**Riesgos / deuda técnica pendiente:**
- Rows existentes con URLs CDN expiradas quedarán con `thumbnail_url = null` y sin imagen hasta el próximo sync de Zernio. En el sync, se intentará persistir la URL fresca a Supabase Storage.
- Si el bucket `content-thumbnails` no existe o no tiene permisos públicos, las thumbnails persistidas tampoco cargarán. Verificar en Supabase Dashboard que el bucket existe y es público.

---

### 2026-08-08 — Fix TypeScript build error: await faltante en apiRateLimit

**Rama/branch:** `main`  
**Commit(s):** `f056137` — fix(utm): agregar await faltante en apiRateLimit para evitar error de tipo TS  
**Autor:** Claude  
**Módulo(s) afectado(s):** `app/api/utm/click`, `app/api/utm/track`

**Qué se hizo:**
Agregado `await` faltante en dos route handlers de UTM al llamar `apiRateLimit(...)`:
- `apps/web/app/api/utm/click/route.ts` línea 7
- `apps/web/app/api/utm/track/route.ts` línea 7

**Por qué / finalidad:**
El build de Vercel fallaba con `Type error: Property 'allowed' does not exist on type 'Promise<RateLimitResult>'`. La función `rateLimit()` en `lib/rate-limit.ts` devuelve una función async (`Promise<RateLimitResult>`), pero los dos archivos UTM la llamaban de forma síncrona, sin `await`, intentando desestructurar `{ allowed, resetAt }` directo del Promise (que no tiene esas propiedades). TypeScript strict lo detectó como error de compilación bloqueante.

**Decisiones de diseño relevantes:**
El resto de los call sites en el codebase (agente, auth, webhooks, Fathom, etc.) ya usaban correctamente `await`. Este era un bug introducido al mergear el branch `devin/fix-monorepo` que reemplazó el rate limiter in-memory por uno distribuido en PostgreSQL.

**Riesgos / deuda técnica pendiente:**
Ninguno para este cambio. El build debería pasar limpio.

---

### 2026-08-08 — Merge a main: integración de 3 branches en producción

**Rama/branch:** `main`  
**Commit(s):**
- `46020ae` — merge(main): integrar devin/fix-monorepo
- `c59ebd4` — merge(main): integrar claude/contenido-marketing-ui-redesign
- `ba08d79` — merge(main): integrar claude/otc-codebase-exploration-43fo8w  
**Autor:** Claude  
**Módulo(s) afectado(s):** Todo el monorepo

**Qué se hizo:**
`main` estaba congelado desde julio 13 (solo tenía 1 archivo de cambios del PR #1). Todos los cambios recientes vivían en branches de preview de Vercel. Se mergearon tres branches a `main` para que Vercel auto-deploye a producción:

1. **`claude/otc-codebase-exploration-43fo8w`** (245 archivos, 19k inserciones): todo el trabajo reciente — dashboard redesign, marketing overview, sales metrics, design system, lead magnets, multi-closer, métricas personalizadas, agente con herramientas de datos, dark mode Vercel-style, bokeh ambiental, content intelligence, hardening de seguridad, etc.

2. **`claude/contenido-marketing-ui-redesign-y99q45`**: redesign de UI de biblioteca de contenido y detalle de pieza. 4 conflictos resueltos con `--theirs` (la versión del branch redesign era más nueva y completa).

3. **`devin/fix-monorepo-toolchain-y-rate-limit`**: correcciones de toolchain monorepo (lint, typecheck, build) y reemplazo de rate limiter in-memory por rate limiter distribuido en PostgreSQL (`consume_rate_limit` RPC en Supabase).

**Por qué / finalidad:**
Producción mostraba una versión vieja de OTC con módulos eliminados (Operaciones, Producto, Lanzamientos). El usuario había promovido a producción un preview que tampoco tenía los cambios nuevos. La solución correcta era hacer `main` la fuente de verdad y dejar que Vercel auto-deploye desde ahí.

**Decisiones de diseño relevantes:**
- `redesign/visual-v2` y `design/premium-glass-ui` **no se mergearon**: tienen historias de git no relacionadas (675 archivos de diferencia con main, `--allow-unrelated-histories` hubiera creado un caos). Se dejaron fuera intencionalmente.
- Conflictos en contenido resueltos con `--theirs` porque el branch de redesign tenía la versión más reciente de los 4 archivos en conflicto.

**Riesgos / deuda técnica pendiente:**
- Los branches `redesign/visual-v2` y `design/premium-glass-ui` tienen trabajo que puede contener ideas útiles pero no son mergeables en el estado actual sin revisión manual cuidadosa.
- El rate limiter distribuido requiere que la función SQL `consume_rate_limit` exista en la base de datos de Supabase (ya está en las migraciones; verificar que esté aplicada en producción).

---

### 2026-08-08 — Completar DESIGN.md con tokens reales y componentes

**Rama/branch:** `claude/otc-codebase-exploration-43fo8w` → mergeado a `main`  
**Commit(s):** `951db41` — docs(design): completar DESIGN.md con tokens reales, componentes @ai-coo/ui y correcciones dark mode  
**Autor:** Claude  
**Módulo(s) afectado(s):** `DESIGN.md`, documentación

**Qué se hizo:**
449 líneas insertadas, 69 eliminadas en `DESIGN.md`:
- Corregidos tokens dark mode: `--background: 0 0% 0%` (negro puro, no #0A0A0A), `--card: 0 0% 6%`, `--muted: 0 0% 3%`, `--border: 0 0% 11%`
- Agregada tabla de tokens light completa incluyendo `--accent`, `--popover`, `--sidebar-*`, `--ai-muted`, `--primary-border`
- Documentado sistema `--color-surface-*` en formato RGB (globals.css)
- Documentados todos los tokens de chart (`--chart-1` a `--chart-5`, `--chart-accent`, `--chart-background`, etc.)
- Documentados valores exactos de shadows multi-capa para light y dark
- Documentados tokens de glass (`--glass-bg`, `--glass-blur`, etc.) con valores reales
- Agregada API completa de `GlassPanel`, `MetricCard`, `MetricStat`, `MetricBand`, `AiCard`
- Agregada tabla de todos los componentes `@ai-coo/ui`
- Agregada quick-reference de Tailwind, snippets de patrones comunes, keyframes

**Por qué / finalidad:**
El DESIGN.md anterior tenía valores desactualizados y faltaban tokens que existen en el código real. Cualquier sesión nueva de Claude o desarrollador que lo consultara tomaba decisiones incorrectas de diseño.

**Decisiones de diseño relevantes:**
Todos los valores se verificaron contra los archivos fuente reales (`tokens.css`, `globals.css`, `packages/ui/src/`). No se usaron valores aproximados.

**Riesgos / deuda técnica pendiente:**
DESIGN.md necesita actualizarse cada vez que se agreguen nuevos tokens o componentes a `@ai-coo/ui`.

---

### 2026-07-XX — Dashboard, marketing overview, sales redesign (bloque principal)

**Rama/branch:** `claude/otc-codebase-exploration-43fo8w`  
**Commit(s):** múltiples (ver `git log --oneline` desde `054da78` hasta `c7d50a5`)  
**Autor:** Claude  
**Módulo(s) afectado(s):** dashboard, marketing, sales, finanzas, UI, nav, agente, lead magnets, closing

**Qué se hizo (resumen):**

| Area | Cambios |
|------|---------|
| **Dashboard** | Rediseño visual completo con `MetricCard`, embudo de conversión, métricas personalizables con CRUD, selector de pantalla por métrica |
| **Marketing overview** | Rediseño con estructura de v0, charts Bklit (`DualAreaChart`, funnel, heatmap), tab Métricas corregido |
| **Sales / Métricas** | Rediseño completo con variedad de charts Bklit, KPI heroes con `TrendLineChart`, Facturación y Cash Collected como heroes |
| **Closing** | Sistema multi-closer con Calendly por perfil |
| **Lead Magnets** | Módulo nuevo con atribución automática, thumbnails persistidos en Supabase Storage |
| **Content Intelligence** | Módulo de análisis estructurado y reporte de patrones de contenido |
| **Agente** | Herramientas de lectura de datos para todos los módulos |
| **UI / Nav** | Panel flotante unificado + bokeh ambiental estilo Bucket, dark mode Vercel-style, animaciones de entrada globales, sidebar simplificado (Integraciones dentro de Configuración, Base de conocimiento dentro de Agente) |
| **Finanzas** | Pagos del equipo con auto-cálculo desde datos reales |
| **Holding** | Settings de billing model, fixes de bugs en dashboard y onboarding |
| **Seguridad** | Hardening completo del surface de ataque en producción |
| **Landing** | Página /prueba con formulario de confirmación post-Calendly, endpoint /api/trial-confirm |
| **Super Admin** | Módulo Pruebas Gratis con link de sesión Calendly |

**Por qué / finalidad:**
Evolución del producto hacia una UI más premium y funcional. El sidebar fue simplificado eliminando módulos secundarios (Operaciones, Producto, Inteligencia, Reportes Ejecutivos, Tablero de Trabajo) del menú principal — estos pasaron a ser add-ons opcionales. El foco se puso en Marketing, Ventas y Finanzas como los tres pilares del dashboard diario.

**Decisiones de diseño relevantes:**
- Módulos eliminados del sidebar (Operaciones, Producto, Inteligencia, Reportes Ejecutivos, Tablero de Trabajo) siguen existiendo en el código — solo están fuera de la navegación principal. Se documentaron como add-ons en un documento HTML de contexto comercial.
- Charts: se usa la librería Bklit (`@ai-coo/ui`) para gráficos. Los charts legacy de Visx se mantienen donde funcionan.
- Lead Journey en sales combina comentarios Zernio + CTAs ManyChat.

**Riesgos / deuda técnica pendiente:**
- Tab Métricas del marketing overview tuvo varios ciclos de fix por NaN y radar distorsionado — el origen es datos de prueba vacíos. Verificar con datos reales.
- Los módulos add-on (Operaciones, etc.) no tienen ruta de acceso activa en el sidebar — necesitan un mecanismo de activación por org si se quieren vender como add-ons.

---

### 2026-07-XX — Rate limiter distribuido (Supabase PostgreSQL)

**Rama/branch:** `devin/fix-monorepo-toolchain-y-rate-limit` → mergeado a `main`  
**Commit(s):** `aefca02` — fix(monorepo): reparar lint/typecheck/build y rate limiting distribuido  
**Autor:** Devin  
**Módulo(s) afectado(s):** `lib/rate-limit.ts`, `supabase/migrations/`, toolchain monorepo

**Qué se hizo:**
- Reemplazó el rate limiter in-memory (`Map<string, RateLimitEntry>`) por un rate limiter distribuido usando RPC de Supabase (`consume_rate_limit`).
- La función SQL `consume_rate_limit` vive en las migraciones. El in-memory se usa como fallback cuando Supabase no está configurado (dev local) o cuando hay un error de infraestructura (fail-open).
- Expuso múltiples limiters preconfigurados: `aiRateLimit`, `authRateLimit`, `integrationRateLimit`, `apiRateLimit`, `webhookRateLimit`, `sopGenerateRateLimit`, etc.
- También corrigió problemas de toolchain del monorepo (lint, typecheck, build).

**Por qué / finalidad:**
El rate limiter in-memory no funcionaba en entornos serverless (cada lambda tiene su propia instancia de memoria, sin estado compartido). En producción con Vercel, el límite nunca se alcanzaba porque cada request podía caer en una lambda diferente.

**Decisiones de diseño relevantes:**
- Fail-open: si el RPC de Supabase falla, se usa el contador local de la instancia como red mínima. Esto evita que un problema de infraestructura corte tráfico legítimo.
- La tabla `rate_limits` en Supabase solo es accesible via `createAdminClient()` (service role) — RLS bloqueado para clientes normales.

**Riesgos / deuda técnica pendiente:**
- El branch introdujo un bug: dos archivos UTM (`app/api/utm/click/route.ts`, `app/api/utm/track/route.ts`) no tenían `await` al llamar al rate limiter. Fix aplicado en commit `f056137`.
- La función SQL `consume_rate_limit` debe estar aplicada en la base de datos de producción. Verificar en Supabase Dashboard si las migraciones están al día.

---

## Módulos activos en el sidebar (agosto 2026)

Para referencia rápida de qué módulos están visibles en la navegación actual:

| Módulo | Ruta | Estado |
|--------|------|--------|
| Panel General | `/dashboard` | ✅ Activo |
| Marketing | `/marketing/*` | ✅ Activo |
| Ventas / Inbox | `/sales/*` | ✅ Activo |
| Finanzas | `/finance/*` | ✅ Activo |
| Clientes | `/clients` | ✅ Activo |
| Agente de negocio | `/agent` | ✅ Activo (con Base de conocimiento adentro) |
| Configuración | `/settings`, `/integrations` | ✅ Activo (Integraciones adentro) |
| Equipo | (holding/equipo) | ✅ Activo |
| **Operaciones** | `/operations/*` | ⚠️ Add-on — código existe, sin nav |
| **Reportes Ejecutivos** | `/executive-reports` | ⚠️ Add-on — código existe, sin nav |
| **Inteligencia** | `/intelligence` | ⚠️ Add-on — código existe, sin nav |
| **Producto** | `/product/*` | ⚠️ Add-on — código existe, sin nav |
| **Tablero de trabajo** | `/workboard` | ⚠️ Add-on — código existe, sin nav |

---

*Documento creado: 2026-08-08. Actualizar con cada sesión de cambios.*
