# Plan de onboarding guiado — Limitless / OTC

> Documento de diseño. Estado: **propuesta, sin implementar**.
> Leer junto con `CLAUDE.md`, `PENDIENTES.md` y `docs/FUNNELS_ARCHITECTURE.md`.

---

## 0. Punto de partida — qué existe hoy

Antes de diseñar nada, esto es lo que ya está construido y hay que reusar o respetar:

| Pieza | Dónde | Qué hace |
|-------|-------|----------|
| `onboarding_responses` | `supabase/migrations/20260521400000_*.sql` | Tabla, **una fila por org**, con `data jsonb` + `completed_at`. Hoy la usa **sólo el holding**. |
| `organizations.skip_onboarding` | `20260618500000_*.sql` | Bandera booleana, hoy usada para negocios creados desde un holding. |
| `HoldingOnboardingWizard` | `components/holding/holding-onboarding-wizard.tsx` | Wizard de 2 pasos: modelo de cobro + alta de negocios. **Sólo holdings.** |
| Ruteo de onboarding | `lib/supabase/middleware.ts` → `resolveHoldingHomePath()` | Si la org es holding y no tiene `completed_at`, redirige a `/onboarding/holding`. |
| `WelcomeGate` + `CinematicWelcome` | `components/platform/welcome-gate.tsx`, `lib/onboarding/welcome-storage.ts` | Animación de bienvenida, **una sola vez**, con estado en `sessionStorage` + `localStorage`. |
| Cambio de contraseña forzado | `middleware.ts` → `isForcePasswordChangePath` | Toda cuenta nueva llega con `must_change_password`. |

**Dos correcciones al mapa mental heredado:**

1. **No existe onboarding de founder.** `CLAUDE.md` lista `app/onboarding/actions.ts` como "onboarding founder" — ese archivo **no existe**. La fila está desactualizada. Hoy un founder nuevo entra directo al dashboard vacío.
2. **El stack no es React + Vite.** Es **Next.js 15 App Router + React 19**, con Server Components y Server Actions. Cambia la evaluación de librerías: los pasos no son estado de cliente, y los elementos que un tour tiene que señalar los pinta el servidor.

**Cómo nace hoy una cuenta founder** (`app/super-admin/actions.ts` → `createFounderAccountAction`):
el super-admin crea el usuario de auth, la organización **con nombre ya cargado**, y el perfil con `role: 'founder'` y contraseña temporal. O sea: el founder llega con org existente, nombre puesto y un cambio de contraseña obligatorio por delante. **El onboarding arranca después de ese cambio de contraseña, no antes.**

---

## 1. Qué tiene que pasar sí o sí

El criterio para decidir qué es obligatorio no es "qué nos gustaría que cargue", sino:

> **¿Qué pasa si esto falta o está mal, y el usuario lo descubre en el mes 2?**

Si la respuesta es "se recalcula y listo", no es obligatorio. Si es "todo el histórico quedó mal etiquetado" o "el módulo muestra ceros sin explicar por qué", sí lo es.

La otra fuente objetiva es `lib/ai/org-context.ts` → `getOrgContext()`: es lo que el agente lee en **cada** llamada. Lo que esa función consume y no puede degradar con elegancia es, por definición, obligatorio.

### Nivel A — Gate duro (3 pasos, no se puede saltear)

Sólo entran acá las cosas cuya ausencia **contamina datos hacia adelante**.

**A1 · Identidad y unidades del negocio**
`organizations`: `name`, `industry`, `country`, `timezone`, `currency`, `language`.

Moneda y zona horaria no son cosméticos: **cada número de Finanzas, Embudos, Anuncios y los reportes ejecutivos se agrega en esa moneda y se agrupa por esa zona.** Si el founder los corrige en el mes 2, lo ya cargado quedó etiquetado con la unidad equivocada. Es el único bloque donde "después lo configuro" tiene costo retroactivo.

El nombre ya viene cargado por el super-admin — el paso lo muestra para confirmar, no para pedirlo de nuevo.

**A2 · Oferta principal**
`products` (al menos una activa) + oferta core marcada (`setCoreOfferAction`).

Sin esto: el value ladder no existe, no hay ticket ni LTV, **ningún embudo se puede medir** (el motor de embudos mide contra una oferta) y el agente no sabe qué vende el negocio. Es la pieza de la que cuelga la mitad del producto.

**A3 · Avatar principal**
`customer_avatars` con `is_primary = true`.

Es contra qué razona el agente, el etiquetado de contenido y el análisis de llamadas de Fathom. Sin avatar, esas tres cosas devuelven respuestas genéricas — que es peor que no devolver nada, porque parecen respuestas.

**Por qué exactamente estas tres y no más:** son las que `getOrgContext()` consume y no puede reemplazar. El resto de lo que esa función lee —SOPs, frameworks, script de ventas, tono del founder— **degrada bien**: el agente funciona sin ellos, sólo con menos contexto.

### Nivel B — Checklist (obligatorio en la práctica, nunca bloquea la entrada)

**B1 · Una fuente de datos conectada.**
Cuál depende del negocio — **no hardcodear Zernio**. Se cumple con cualquiera de: Zernio, GHL, un proveedor de pagos (Whop / Commas), Calendly o Fathom.

**B2 · Primer embudo creado y con los pasos vinculados a fuentes.**
`/funnels` → crear → `/funnels/[id]/configurar`. Es el módulo con el mayor costo de setup y el mayor retorno. La propia página ya muestra `boundSteps / stepCount` por embudo: **ese ratio es el ítem del checklist**, no hay que inventar una métrica nueva.

**B3 · Histórico importado.**
`/integrations/import`. Sin esto, la primera semana el producto se ve vacío aunque esté perfectamente configurado. Es la diferencia entre "esto no tiene datos" y "esto ya sabe de mi negocio".

**B4 · Equipo invitado con permisos.**
`/team/members` + `/team/roles`.

### Nivel C — Sugerido, nunca obligado

Base de conocimiento (≥1 documento indexado), SOPs activos, frameworks de venta, script de ventas, BYOK Claude, Discord.

### Lo que NO debe ser obligatorio, y es tentador que lo sea

**Conectar todas las integraciones.** Hay 20 proveedores en `constants/integrations.ts` más los paneles de pagos, GHL, VTurb, WebinarJam e Hyros. Forzar eso convierte el onboarding en un muro — y hoy varios de esos proveedores **ni siquiera están verificados contra cuentas reales** (ver `PENDIENTES.md` → `[EMBUDOS-CUENTAS-REALES]`, `[WEBINARJAM-API-KEY]`). Pedirle a un cliente que conecte algo que todavía no sabemos leer es la peor primera impresión posible.

### Los dos casos que rompen el diseño si no se contemplan

**El usuario invitado (`operator` / `viewer`).** No tiene permiso de `settings` ni de `integrations` (`lib/auth/get-current-permissions.ts`: sólo `founder` recibe `full` en todo). Un gate de Nivel A lo dejaría **encerrado en una pantalla que no puede completar**. Su onboarding es otro: un tour corto de los módulos que sí ve, derivado de sus permisos.

**El holding.** Ya tiene su onboarding y su ruteo en el middleware. El nuevo flujo **no debe pisarlo**: la bifurcación va por `account_type`, y los negocios creados desde un holding ya nacen con `skip_onboarding = true`.

---

## 2. Las alternativas — evaluación

Datos verificados contra el registry de npm (2026-08-31), no de memoria:

| Librería | Versión | Deps | Peso | Descargas/sem | React 19 |
|----------|---------|------|------|---------------|----------|
| **Driver.js** | 1.8.0 | **0** | 156 KB | 2.005.000 | agnóstico |
| **React Joyride** | 3.2.0 | 10 | 720 KB | 1.373.000 | sí (`16.8 - 19`) |
| **Shepherd.js** | 15.3.0 | 2 | 814 KB | 309.000 | agnóstico |
| **@onboardjs/core** | **1.0.0-rc.4** | 1 | — | 9.166 | sí |

**Tres cosas que cambian la conclusión respecto de la recomendación original:**

1. **`onboardjs` está despublicado de npm** (404, retirado el 2025-05-25). El paquete real es `@onboardjs/core` + `@onboardjs/react`, y está en **release candidate** con ~9K descargas semanales. Meter un RC en el camino crítico del **primer login de cada cliente** es el peor lugar posible para asumir ese riesgo.
2. **React Joyride sí soporta React 19** (peer `react: 16.8 - 19` desde la v3). Era la duda más razonable y resultó no ser un problema — pero trae 10 dependencias y 720 KB para hacer lo mismo que Driver.js hace con cero.
3. El link que circula para React Joyride (`reactour.dev`) es de **otra librería**, Reactour. Son proyectos distintos.

### Recomendación: dos piezas, no cuatro

**El flujo —wizard y checklist— se construye acá, sin librería.** No por gusto: **el estado tiene que salir de la base de datos**, y ninguna librería de onboarding puede saber si *esta* organización ya tiene una oferta cargada. Un motor de flujo del lado del cliente resolvería el problema equivocado, y encima habría que alimentarlo con los mismos datos que ya tenemos. A eso se suma que la UI es un design system propio (`@ai-coo/ui` + `DESIGN.md`, notch nav, `EmptyState`, glass): el DOM de una librería de flujos habría que pelearlo con CSS.

**Los tours contextuales: Driver.js.** Vanilla, cero dependencias, el más liviano y el más usado. Al ser agnóstico no pelea con RSC ni con React 19, y no impone componentes: se le pasan selectores y él resuelve el resto en el momento del `drive()`, que es exactamente lo que hace falta cuando el DOM lo pinta el servidor.

**Descartados:**
- **Shepherd.js** — hace el mismo trabajo que Driver con 5× el peso. Sus features extra (pasos condicionales, navegación) son justamente las que en este diseño resuelve el estado derivado del servidor.
- **React Joyride** — su valor es ser React-nativo, y eso no se cobra cuando los elementos a señalar los pinta un Server Component. 10 dependencias por nada.
- **OnboardJS** — RC, adopción marginal, y resuelve el problema equivocado.

---

## 3. La decisión de diseño que hay que corregir

La propuesta heredada era una tabla `onboarding_progress` con un booleano por paso:

```
user_id · business_info_completed · products_completed · first_sale_completed · …
```

**Eso miente, y se puede demostrar con casos concretos de este repo:**

- El super-admin ya crea la org **con nombre**, así que `business_info_completed` nace desactualizado.
- Un founder puede conectar Zernio desde `/integrations` sin pasar nunca por el checklist.
- Un cliente puede importar su histórico primero y configurar la oferta después.
- Si alguien borra su única oferta, el booleano sigue en `true`.

Guardar el hecho **duplica una verdad que ya vive** en `products`, `customer_avatars`, `zernio_integrations`, `funnel_steps`. Dos fuentes para el mismo dato: una se desincroniza, siempre.

### La regla: derivar, no guardar

Una función por ítem que le pregunta a la fuente real. Se guarda **sólo lo que no es derivable**:

- qué ítem se descartó a propósito (`dismissed`),
- qué tour ya se vio,
- cuándo se completó el gate.

Esto resuelve **gratis** las tres situaciones difíciles: si el usuario saltea una sección, el ítem sigue abierto; si vuelve después, lo ve abierto; **si ya tenía datos cargados, aparece tildado sin haber pasado nunca por el wizard.**

---

## 4. Plan de desarrollo

### Fase 0 — Derivación y estado (sin UI)

- **Migración** `onboarding_state`: `organization_id` (unique, FK), `gate_completed_at`, `dismissed_items text[]`, `tours_seen text[]`, `updated_at`. RLS con el patrón estándar (`organization_id = public.get_my_organization_id()`).
  *No* se toca `onboarding_responses` — es del holding y se queda como está.
- `lib/onboarding/checklist.ts`: catálogo de ítems (id, nivel, label, href, ícono Lucide) + un resolver por ítem contra su tabla real.
- `lib/onboarding/resolve.ts`: `resolveOnboardingState(organizationId)` → una pasada con `Promise.all`, `count: 'exact', head: true` para no traer filas, y cache corto en memoria como hace `getOrgContext` (TTL ~60 s).
- **Tests** (`lib/onboarding/__tests__/`): la lógica de derivación y de precedencia es pura y se testea sin DB.

**Entregable:** el estado de onboarding de cualquier org se puede consultar. Nada visible todavía.

### Fase 1 — Gate de arranque (Nivel A)

- Ruta `app/(platform)/onboarding/page.tsx` — tres pasos, un Server Component por paso, mutaciones con las **Server Actions que ya existen** (`updateOrganizationSettingsAction`, `saveProductAction` + `setCoreOfferAction`, `saveAvatarAction`). No se escriben mutaciones nuevas.
- Ruteo en `lib/supabase/middleware.ts`, **después** del bloque de `must_change_password` y respetando la bifurcación de holding: si `role = 'founder'`, la org no es holding, no tiene `skip_onboarding` y no tiene `gate_completed_at` → redirigir a `/onboarding`.
- Al terminar: `markWelcomePending()` — **acá encaja la `CinematicWelcome` que ya existe** y hoy no la dispara nadie. Ese era su lugar.
- Escape hatch: el super-admin puede marcar `skip_onboarding` en una org (ya existe la columna).

**Entregable:** un founder nuevo no puede entrar al dashboard sin moneda, oferta y avatar.

### Fase 2 — Checklist persistente (Nivel B y C)

- `components/onboarding/setup-checklist.tsx` — progreso, ítems tildados/abiertos, link directo a la pantalla de cada uno, y "no me lo muestres más" por ítem (`dismissed_items`).
- Se monta en dos lugares: una tarjeta en `/dashboard` mientras haya ítems abiertos, y un ítem en la isla derecha de la notch nav con el contador.
- Desaparece solo cuando todos los ítems de Nivel B están cumplidos o descartados.

### Fase 3 — Tours contextuales (Driver.js)

- `pnpm add driver.js` en `apps/web`.
- `lib/onboarding/tours.ts` — un tour por módulo, definido como datos (id, pasos con selector y texto). Los selectores van como `data-tour="..."` en el JSX, **nunca clases de Tailwind**: una clase cambia con el primer refactor de estilos y el tour se rompe en silencio.
- `components/onboarding/tour-runner.tsx` (`"use client"`) — dispara el tour la primera vez que el usuario entra a un módulo, marca `tours_seen` al terminar, y **respeta los permisos**: no se ofrece un tour de un módulo que el usuario no puede ver.
- Estilos del popover alineados a los tokens de `DESIGN.md`.
- Prioridad: Embudos → Marketing/Contenido → Agente → Ventas/Bandeja. Empezar por Embudos porque es el de mayor costo de setup.

### Fase 4 — Onboarding por acción y visibilidad interna

- Los `EmptyState` que ya existen pasan a empujar la acción concreta en vez de describir el vacío ("Creá tu primer embudo" con el botón, no "Todavía no hay embudos"). Buena parte ya está así — es una pasada de revisión, no una reescritura.
- **Panel en super-admin**: en qué punto del onboarding está cada organización. Es lo que permite ver quién se trabó y en qué paso, que para un producto B2B vale más que el onboarding mismo. Encaja en `/super-admin/client-health`, que ya existe.

---

## 5. Decisiones cerradas

Las tres preguntas que gateaban la Fase 1 se resolvieron con Santiago el **2026-08-31**:

**1 · El Nivel A bloquea de verdad, con salida del super-admin.**
Nadie entra al dashboard sin moneda, oferta principal y avatar. La alternativa —todo en checklist— dejaba entrar gente operando semanas con la moneda mal configurada, y eso es lo único que no se arregla retroactivamente. La válvula de escape es `organizations.skip_onboarding`, que ya existe: el super-admin la marca para una org puntual que necesite entrar antes de tener la oferta definida.

**2 · Los invitados (`operator` / `viewer`) reciben un tour corto derivado de sus permisos, sin gate.**
No pueden completar el Nivel A —no tienen permiso de `settings` ni de `integrations`— así que el gate los dejaría encerrados. El ruteo del middleware tiene que condicionar el redirect a `role = 'founder'` **desde la Fase 1**, aunque el tour recién se construya en la Fase 3. Es una línea ahora contra rehacer el ruteo después.

**3 · Alcance de la primera tanda: Fases 0, 1 y 2.**
El gate más el checklist ya son un onboarding completo y **no agregan ninguna dependencia nueva** al proyecto. Driver.js y los tours quedan para una segunda tanda, y con ellos toda la superficie de `data-tour` en el JSX.

---

## 6. Riesgos y deuda conocida

- **El gate agrega consultas al middleware**, que corre en cada request. Mitigación: la consulta va sólo cuando hay usuario, el rol es `founder` y no es una request de Server Action; si el costo se nota, `gate_completed_at` se puede cachear en una cookie firmada. **Medirlo antes de optimizar.**
- **El escape del super-admin es la única salida del gate.** Si un cliente se traba, hoy depende de que alguien de OTC le marque la bandera. Vale la pena que el panel de la Fase 4 —quién está trabado y en qué paso— llegue antes de tener muchas cuentas nuevas a la vez.
- **Los tours se rompen callados** si un selector desaparece. Cuando llegue la Fase 3: anclajes `data-tour` en el JSX, nunca clases de Tailwind, y un test que verifique que cada selector de `tours.ts` existe en el código.
- **`CLAUDE.md` tiene dos filas desactualizadas** que conviene corregir en la misma sesión que se implemente esto: lista `app/onboarding/actions.ts` como "onboarding founder" (no existe), y menciona un acento primario violeta `#7C3AED` cuando `DESIGN.md` y los tokens definen **naranja `#E15D12`**.
- **Sin verificar contra sesión real.** Igual que el resto de lo construido en agosto, el entorno de desarrollo no puede renderizar páginas autenticadas. Suma su bloque a `docs/PLAN_VERIFICACION.md` al implementar: el gate con cuenta founder nueva, el no-gate con cuenta invitada, y el no-gate con org holding.
