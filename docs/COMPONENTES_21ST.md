# Componentes 21st.dev — uso, integración y prompts

> Documento de referencia para incorporar cuatro componentes de [21st.dev](https://21st.dev) al monorepo OTC.
> Relevado el **2026-08-30** contra el repo en la rama `Claude-New-Features`.

---

## 0. Lo primero: el código fuente de estos componentes NO es público

Antes de cualquier cosa, el hecho que condiciona todo lo demás.

Las páginas de 21st.dev muestran **el demo** (el archivo `Usage.tsx`) en HTML, pero **el archivo del componente en sí está detrás de autenticación**. El registry devuelve 403 sin credenciales:

```bash
$ curl -s https://21st.dev/r/sean0205/tabs
{"error":"Authentication required","reason":"authentication_required", ...}
# HTTP 403 — igual con .json al final, e igual con un Bearer inválido
```

Por lo tanto:

- **El código de uso (demo) de las cuatro fichas de abajo es real** — está extraído del HTML de cada página, no inventado.
- **El código interno de cada componente no está en este documento** porque no se pudo leer. Hay que bajarlo con el CLI autenticado (§1).
- Las props documentadas más abajo son **las que se ven usadas en el demo**, no una API completa publicada por el autor. Donde no hay props documentadas, se dice explícitamente.

Esto sigue la regla 3 de `CLAUDE.md`: lo que no se pudo verificar queda marcado, no se rellena con una suposición.

---

## 1. Cómo funciona 21st.dev — qué hay que conectar

### 1.1 Qué es

21st.dev es un marketplace de componentes React/Tailwind construidos sobre shadcn/ui. No es una librería npm: cada componente se **copia como código fuente dentro de tu repo**, igual que shadcn. No hay dependencia en runtime con 21st.dev, y una vez bajado el archivo es tuyo y editable.

### 1.2 Las tres formas de traer un componente

| Vía | Comando | Cuándo usarla |
|-----|---------|---------------|
| **CLI (recomendada)** | `npx @21st-dev/cli@latest add <user>/<slug>` | Bajar un componente puntual. Es la que muestra cada página. |
| **shadcn directo** | `npx shadcn@latest add https://21st.dev/r/<user>/<slug>` | Lo mismo, sin el wrapper. Requiere el header de auth a mano. |
| **MCP** | endpoint `https://21st.dev/api/mcp` | Para que el agente busque y genere componentes desde el editor. |

El CLI unificado se llama **`@21st-dev/cli`** (binario `21st`, v1.16.1 al momento del relevamiento). Reemplaza a los paquetes viejos `@21st-dev/registry` y `@21st-dev/magic`.

> **`21st add` por dentro hace `npx shadcn@latest add` contra `/r/<user>/<slug>`.** Es decir: es shadcn con autenticación encima. Con `--print` imprime el comando shadcn expandido sin ejecutarlo — útil para ver exactamente qué va a correr antes de dejarlo tocar el repo.

### 1.3 Autenticación — esto sí hay que conectar

Sin credenciales, `add` falla con 403. Tres caminos, todos con una key `21st_sk_…` de https://21st.dev/settings/api-keys:

```bash
# a) sesión local (abre el browser, guarda token en ~/.config/21st)
npx @21st-dev/cli@latest login
npx @21st-dev/cli@latest whoami    # verificar
npx @21st-dev/cli@latest usage     # cuota diaria restante

# b) variable de entorno (CI / scripts)
export TWENTYFIRST_TOKEN=21st_sk_...   # también acepta API_KEY_21ST

# c) flag directo
npx @21st-dev/cli@latest add sean0205/tabs --api-key 21st_sk_...
```

**Modelo de cobro:** buscar y listar metadata es gratis. **Bajar el código de un componente es la acción medida.** Una cuenta free logueada tiene un cupo diario chico y después pide upgrade; los planes pagos no tienen tope.

### 1.4 MCP — opcional, y probablemente innecesario acá

`21st init --client claude --write` mergea la config del MCP en el archivo del editor sin pisar otros servers. Sirve para que el agente **busque y genere** UI. Para el caso de estos cuatro componentes, que ya están elegidos y tienen slug conocido, **el MCP no aporta nada: alcanza con `21st add`.** No hace falta conectar MCP para esta tarea.

### 1.5 Alternativa: registry permanente en `components.json`

`apps/web/components.json` ya tiene un mapa `registries`. Se le puede agregar 21st para no depender del CLI:

```jsonc
"registries": {
  "@bklit": "https://ui.bklit.com/r/{name}.json",
  "@motion-primitives": "https://motion-primitives.com/c/{name}.json",
  "@21st": {
    "url": "https://21st.dev/r/{name}.json",
    "headers": { "Authorization": "Bearer ${TWENTYFIRST_TOKEN}" }
  }
}
```

…y después `npx shadcn@latest add @21st/sean0205/tabs`.

> ⚠️ **Esto no está verificado.** No se pudo probar el header contra el endpoint real por falta de una key. Si falla, el camino seguro es `21st add`, que es el documentado.

### 1.6 Licencias — revisar antes de mergear

| Componente | Licencia declarada |
|---|---|
| `arunachalam/adaptive-notch-navigation-bar` | `mit` |
| `sean0205/statistics-card-1` | `mit` |
| `sean0205/tabs` | `mit` |
| `ruixen.ui/dropdown-range-date-picker` | **`""` — vacía, sin licencia declarada** |

El date picker de Ruixen UI **no declara licencia** en la metadata del registry. Los otros tres son MIT. Decisión de Santiago antes de usarlo en producción: o se confirma la licencia con el autor, o se lo trata como referencia visual y se reescribe el componente sobre nuestras primitivas (que además es lo que conviene técnicamente, ver §3.5).

---

## 2. Estado del repo — qué ya tenemos y qué falta

Antes de las fichas, el contexto que decide cuánto trabajo es cada integración.

### 2.1 Lo que ya está resuelto ✅

| Requisito | Estado |
|---|---|
| `apps/web/components.json` (config shadcn) | ✅ existe — style `new-york`, `rsc: true`, alias ui `@/components/ui`, `cssVariables: true`, baseColor `zinc` |
| Variables CSS de shadcn | ✅ **todas** definidas en `packages/ui/src/styles/tokens.css` (`--background`, `--foreground`, `--card`, `--popover`, `--muted`, `--accent`, `--primary`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`), importadas desde `apps/web/app/globals.css` |
| Mapeo a clases Tailwind | ✅ `packages/config/tailwind/preset.ts` mapea todas a `bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`, etc. |
| Dark mode | ✅ `darkMode: "class"` + bloque `.dark` en `tokens.css` |
| `framer-motion` | ✅ `^12.12.1` en `apps/web` y en `@ai-coo/ui` |
| `lucide-react` | ✅ `^0.511.0` |
| `class-variance-authority` | ✅ `^0.7.1` (en `@ai-coo/ui`) |
| `@radix-ui/react-tabs`, `@radix-ui/react-dropdown-menu` | ✅ en `@ai-coo/ui` |

**Conclusión: el theming va a funcionar sin tocar nada.** Cualquier componente que use `bg-card`, `text-foreground`, `border-border`, `text-muted-foreground`, `bg-accent`, `ring-ring` toma los colores de OTC (primary `#7C3AED`) automáticamente.

### 2.2 Lo que falta ❌

| Falta | Lo necesita |
|---|---|
| `date-fns` | Dropdown Range Date Picker |
| `react-day-picker` | Dropdown Range Date Picker (vía el Calendar de shadcn/OriginUI) |
| `@radix-ui/react-popover` | Dropdown Range Date Picker |
| `@radix-ui/react-select` | Dropdown Range Date Picker (OriginUI select) |
| `radix-ui` (paquete unificado) | Tabs de ReUI — ver §2.4 |

### 2.3 ⚠️ Tailwind v3, no v4

`apps/web/tailwind.config.ts` usa **Tailwind CSS 3.4.17**. Los componentes de 21st.dev publicados en 2026 asumen mayormente **v4**. Clases que aparecen en estos demos y **no existen en v3**:

| Clase v4 | Equivalente v3 |
|---|---|
| `shadow-xs` | `shadow-sm` |
| `h-8.5` | `h-[34px]` |
| `size-7`, `size-4`, `size-3.5` | ✅ **sí existen** en v3.4 — no tocar |

Aparecen en el demo del Notch Nav (`shadow-xs` varias veces, `h-8.5` dos veces). **Es el error más probable de la integración**: no rompe el build, simplemente la clase no genera CSS y el componente se ve sin sombra o con altura colapsada. Buscar y reemplazar antes de dar por buena la pantalla.

### 2.4 ⚠️ Colisión de arquitectura: `@/components/ui` vs `@ai-coo/ui`

Este es el punto que más criterio requiere.

- Nuestro design system vive en **`packages/ui/src/primitives/`** y se importa como **`@ai-coo/ui`**.
- `apps/web/components/ui/` casi está vacío (solo `ai-prompt-box.tsx` y `bg-pattern.tsx`).
- **shadcn y `21st add` escriben en `apps/web/components/ui/`.**

Si se corre `21st add` tal cual, el CLI resuelve las `registryDependencies` y baja **también** las primitivas del autor. Resultado: dos `Card`, dos `Badge`, dos `Tabs`, dos `DropdownMenu` conviviendo, con estilos distintos y sin los tokens glass de OTC.

**Regla para esta integración:** bajar el componente, **borrar las primitivas duplicadas que arrastre**, y reapuntar los imports a `@ai-coo/ui`. Si la primitiva de OTC no tiene la variante que el componente pide, se extiende la primitiva de OTC — no se agrega una segunda.

Diferencias concretas entre nuestras primitivas y las que asumen estos componentes:

| Lo que el componente usa | Lo que tiene `@ai-coo/ui` | Qué hacer |
|---|---|---|
| `<CardToolbar>` (ReUI) | ❌ no existe | agregar a `packages/ui/src/primitives/card.tsx` o resolver con un `div` absoluto |
| `<Button variant="dim" mode="icon">` (ReUI) | ❌ no existe ni `dim` ni `mode` | usar `variant="ghost"` + `size="icon"` de nuestro Button |
| `<Badge appearance="light" variant="success">` | `variant` sí (`success`, `destructive`, …), **`appearance` no** | borrar `appearance`; `success`/`destructive` ya existen |
| `<Badge shape="circle" size="xs">` | ❌ ni `shape` ni `size` | agregar variantes a `badge.tsx`, o `className="h-4 w-4 justify-center p-0"` |
| `<TabsList variant="button">` | ❌ nuestro `TabsList` no tiene `variant` | ver §5 — es el trabajo real de ese componente |
| `<DropdownMenuItem variant="destructive">` | ❌ no tiene `variant` | `className="text-destructive"` |
| `radix-ui` (paquete unificado) | tenemos `@radix-ui/react-*` por separado | reescribir el import: `import * as TabsPrimitive from "@radix-ui/react-tabs"` |

---

## 3. Fichas por componente

---

### 3.1 Adaptive Notch Navigation Bar

**Autor:** `arunachalam` · **Slug:** `adaptive-notch-navigation-bar` · **Licencia:** MIT · **Publicado:** 2026-08-28
**URL:** https://21st.dev/@arunachalam/components/adaptive-notch-navigation-bar

#### Qué es

Barra de navegación de "isla triple" con muescas de curva invertida: en desktop son tres islas (logo · items · acciones) unidas sin costuras de borde; en mobile colapsa a un drawer único con animaciones de resorte. Se puede anclar arriba o abajo.

#### Instalación

```bash
npx @21st-dev/cli@latest add arunachalam/adaptive-notch-navigation-bar
```

Archivo destino: `apps/web/components/ui/adaptive-notch-navigation-bar.tsx`

#### Dependencias

| Tipo | Detalle | ¿Lo tenemos? |
|---|---|---|
| npm | `lucide-react`, `framer-motion` | ✅ **las dos** |
| registry | **ninguna** (`direct_registry_dependencies: []`) | ✅ es autocontenido — no arrastra primitivas |
| CSS extra | `tailwind_config_extension: null`, `global_css_extension: null` | ✅ nada que agregar |

> **Este es el componente más limpio de los cuatro.** Cero dependencias de registry significa que no va a duplicar ninguna de nuestras primitivas. Se puede bajar tal cual.

#### API (extraída del demo)

```ts
type NotchPosition = "top" | "bottom";

interface NotchItemData {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;   // p.ej. "Live"
}
```

| Prop de `<NotchNav>` | Tipo | Para qué |
|---|---|---|
| `items` | `NotchItemData[]` | los ítems de navegación |
| `activeId` | `string` | ítem activo (componente controlado) |
| `onActiveChange` | `(id: string) => void` | callback al cambiar de ítem |
| `position` | `NotchPosition` | ancla arriba o abajo |
| `logo` | `ReactNode` | slot de la muesca izquierda |
| `rightContent` | `ReactNode` | slot de la muesca derecha |
| `showLogo` | `boolean` | muestra/oculta la muesca del logo |
| `showRightContent` | `boolean` | muestra/oculta la muesca de acciones |
| `children` | `ReactNode` | el contenido de la página, que la barra envuelve |

#### Código de uso (demo oficial, verbatim)

```tsx
"use client";

import { useState } from "react";
import {
  Activity, ArrowDownUp, BarChart2, Command, Eye, EyeOff,
  Layers, LogOut, Sparkles, User, Users,
} from "lucide-react";
import type {
  NotchItemData,
  NotchPosition,
} from "@/components/ui/adaptive-notch-navigation-bar";
import { NotchNav } from "@/components/ui/adaptive-notch-navigation-bar";

const NAV_ITEMS: NotchItemData[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "profiles", label: "Profiles", icon: Users },
  { id: "funnels", label: "Funnels", icon: Layers },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "realtime", label: "Realtime", icon: Sparkles, badge: "Live" },
];

export default function NotchNavDemo() {
  const [activeId, setActiveId] = useState<string>("dashboard");
  const [position, setPosition] = useState<NotchPosition>("top");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showRightContent, setShowRightContent] = useState<boolean>(true);

  const LogoSlot = (
    <div className="flex items-center gap-1.5 sm:gap-2 h-8.5">
      <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800 dark:bg-zinc-300">
        <Command className="size-4 text-zinc-50 dark:text-zinc-950" />
      </div>
      <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-tight">
        Acme
      </span>
    </div>
  );

  const RightContentSlot = (
    <div className="flex items-center gap-1.5 sm:gap-2 h-8.5">
      <div className="hidden sm:flex size-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 dark:bg-zinc-300 dark:text-zinc-800">
        <User className="size-4" />
      </div>
      <button
        type="button"
        onClick={() => console.log("Sign out triggered")}
        aria-label="Sign out"
        className="cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 flex dark:text-zinc-600 dark:hover:text-zinc-900 outline-none"
      >
        <span className="hidden sm:inline">Sign out</span>
        <LogOut className="size-4 sm:size-3.5" />
      </button>
    </div>
  );

  return (
    <NotchNav
      items={NAV_ITEMS}
      activeId={activeId}
      position={position}
      logo={LogoSlot}
      rightContent={RightContentSlot}
      showLogo={showLogo}
      showRightContent={showRightContent}
      onActiveChange={setActiveId}
    >
      {/* contenido de la página */}
    </NotchNav>
  );
}
```

#### Integración en OTC

⚠️ **Advertencia de producto, no técnica.** `CLAUDE.md` dice explícitamente: *"❌ Agregar `MarketingSubnav` — la navegación es solo sidebar"*. Esta barra es un patrón de navegación horizontal que **compite directamente con `lib/navigation/sidebar-modules.ts`**. Antes de integrarla hay que decidir dónde vive:

- **Opción A — reemplazar el sidebar.** Cambio de arquitectura de navegación de toda la plataforma. Fuera del alcance de "bajar un componente".
- **Opción B — navegación de sub-módulo** dentro de una pantalla (p. ej. las vistas de `/marketing/*` o `/finance/*`). Choca con la regla de arriba.
- **Opción C — vistas públicas** (`app/(landing)/`, `app/(founder)/`), donde no hay sidebar y la regla no aplica. **Es la opción más limpia.**

Ajustes técnicos, en cualquier caso:

1. **Tailwind v3:** reemplazar `shadow-xs` → `shadow-sm` y `h-8.5` → `h-[34px]`, tanto en el demo como dentro del componente bajado.
2. **Colores hardcodeados:** el demo usa `bg-zinc-800 / dark:bg-zinc-300` en los slots. Cambiar por tokens de OTC (`bg-foreground` / `text-background`) para que respete el tema.
3. **Slots como Server Components:** `logo` y `rightContent` reciben JSX. `NotchNav` es `"use client"`, así que lo que se le pase se serializa igual — está bien pasarle un `<Link>` de Next.
4. **Rutas:** los `id` de `NAV_ITEMS` deben salir de `routes/paths.ts`, no hardcodearse.
5. `onActiveChange` no navega solo: hay que enganchar `useRouter().push()`.

---

### 3.2 Dropdown Range Date Picker

**Autor:** `ruixen.ui` (Ruixen UI) · **Slug:** `dropdown-range-date-picker` · **Licencia:** ⚠️ **sin declarar** · **Publicado:** 2025-09-27
**URL:** https://21st.dev/@ruixen.ui/components/dropdown-range-date-picker

#### Qué es

Selector de rango de fechas en popover. La ganancia sobre un date-range-picker normal es que trae **dropdowns de mes y año**: se salta a cualquier punto del calendario sin navegar mes a mes. El rango elegido se muestra dentro de un botón-input, truncando rangos largos. Tiene acciones **Clear** y **Apply** — o sea, el rango no se aplica hasta confirmar.

#### Instalación

```bash
npx @21st-dev/cli@latest add ruixen.ui/dropdown-range-date-picker
```

Archivo destino: `apps/web/components/ui/dropdown-range-date-picker.tsx`

#### Dependencias

| Tipo | Detalle | ¿Lo tenemos? |
|---|---|---|
| npm | `date-fns`, `lucide-react` | ❌ falta `date-fns` |
| registry | `originui/button`, `originui/select`, `originui/calendar`, `originui/popover`, `shadcn/card` | ❌ **arrastra 5 primitivas ajenas** |
| transitivas | `react-day-picker` (vía calendar), `@radix-ui/react-popover`, `@radix-ui/react-select` | ❌ ninguna instalada |

```bash
pnpm --filter @ai-coo/web add date-fns react-day-picker @radix-ui/react-popover @radix-ui/react-select
```

#### API

**No hay props documentadas.** El demo lo instancia sin ninguna:

```tsx
"use client";

import { DropdownRangeDatePicker } from "@/components/ui/dropdown-range-date-picker";

export default function DropdownRangeDatePickerDemoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <DropdownRangeDatePicker />
    </div>
  );
}
```

⚠️ **Esto es un problema real, no una omisión del relevamiento.** Si el componente no expone `value` / `onChange`, **el estado del rango vive adentro y no sale**, lo cual lo hace inservible para filtrar datos. Lo primero al bajarlo es abrir el archivo y ver si acepta callbacks. Si no los acepta, hay que agregarlos — es una modificación obligatoria, no opcional.

#### Integración en OTC

**Es el componente con mejor encaje de producto de los cuatro.** Un filtro de rango de fechas es exactamente lo que falta en:

- `/marketing/anuncios` — `getMarketingAdsAction` ya recibe rango (`fromDate` / `toDate` van a `listAds` de Zernio)
- `/finance/*` — gastos y facturación por período
- `/executive-reports` — selección de ventana del reporte
- `/sales/closing` — llamadas de cierre por rango

Ajustes:

1. **Borrar las 5 primitivas de OriginUI/shadcn que baje** y reapuntar los imports a `@ai-coo/ui` (`Button`, `Card`). Las únicas que hay que conservar de verdad son `calendar` y `popover`, porque **no existen en `@ai-coo/ui`**. Esas dos sí conviene promoverlas a `packages/ui/src/primitives/` para que queden bajo el design system y no sueltas en `apps/web/components/ui/`.
2. **Localización es-AR:** `date-fns` necesita el locale explícito. Sin esto el picker muestra meses en inglés, que rompe la convención de UI en español.
   ```ts
   import { es } from "date-fns/locale";
   // <Calendar locale={es} /> y format(date, "d MMM yyyy", { locale: es })
   ```
3. **Zona horaria:** OTC deploya en `gru1` (São Paulo) y el negocio es argentino. Un rango elegido en el browser tiene que serializarse sin correrse un día contra las queries de Supabase. Fijar el criterio una vez (ISO `yyyy-MM-dd` sin hora, o UTC explícito) y usarlo igual en los cuatro módulos.
4. **Licencia:** resolver antes de mergear (§1.6).

---

### 3.3 Statistics Card 1

**Autor:** `sean0205` (ReUI) · **Slug:** `statistics-card-1` · **Licencia:** MIT · **Publicado:** 2025-07-21
**URL:** https://21st.dev/@sean0205/components/statistics-card-1 · **Docs:** reui.io/blocks/cards

#### Qué es

Grilla de tarjetas de KPI. Cada tarjeta: título, valor grande formateado, badge de delta con flecha arriba/abajo y color según signo, comparación contra el período anterior separada por una línea, y un menú `⋯` con acciones (Settings, Add Alert, Pin to Dashboard, Share, Remove).

#### Instalación

```bash
npx @21st-dev/cli@latest add sean0205/statistics-card-1
```

#### Dependencias

| Tipo | Detalle | ¿Lo tenemos? |
|---|---|---|
| npm | **ninguna** propia; el demo usa `lucide-react` | ✅ |
| registry | `sean0205/badge-2`, `sean0205/card`, `sean0205/dropdown-menu` | ❌ **duplica tres primitivas nuestras** |

> **Este es el que más conviene NO instalar con el CLI.** No es un componente: es un *block*, un patrón de layout de ~120 líneas cuyo único valor es la composición. Lo que aportaría el CLI son tres primitivas de ReUI que ya tenemos en `@ai-coo/ui` — y que además quedarían con otro look. **Copiar el JSX a mano y reapuntar los imports es más rápido y deja menos deuda.**

#### API (forma del dato)

No hay props: el demo define un array local. La forma de cada ítem:

| Campo | Tipo | Uso |
|---|---|---|
| `title` | `string` | etiqueta de la métrica |
| `value` | `number` | valor actual |
| `delta` | `number` | variación porcentual |
| `lastMonth` | `number` | valor del período anterior |
| `positive` | `boolean` | dirección de la tendencia (color del badge) |
| `prefix` / `suffix` | `string` | `"$"`, `"M"`, … |
| `format` / `lastFormat` | `(v: number) => string` | formateo custom, pisa prefix/suffix |

Helper incluido:

```ts
function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}
```

#### Código de uso (demo oficial, verbatim)

```tsx
import { Badge } from '@/components/ui/badge-2';
import { Button } from '@/components/ui/button-1';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDown, ArrowUp, MoreHorizontal, Pin, Settings, Share2, Trash, TriangleAlert } from 'lucide-react';

export default function StatisticCard1() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-8">
      <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="border-0">
              <CardTitle className="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
              <CardToolbar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="dim" size="sm" mode="icon" className="-me-1.5">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom">
                    <DropdownMenuItem><Settings />Settings</DropdownMenuItem>
                    <DropdownMenuItem><TriangleAlert /> Add Alert</DropdownMenuItem>
                    <DropdownMenuItem><Pin /> Pin to Dashboard</DropdownMenuItem>
                    <DropdownMenuItem><Share2 /> Share</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive"><Trash />Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardToolbar>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-medium text-foreground tracking-tight">
                  {stat.format ? stat.format(stat.value) : stat.prefix + formatNumber(stat.value) + stat.suffix}
                </span>
                <Badge variant={stat.positive ? 'success' : 'destructive'} appearance="light">
                  {stat.delta > 0 ? <ArrowUp /> : <ArrowDown />}
                  {stat.delta}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">
                Vs last month:{' '}
                <span className="font-medium text-foreground">
                  {stat.lastFormat ? stat.lastFormat(stat.lastMonth)
                    : stat.prefix + formatNumber(stat.lastMonth) + stat.suffix}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### Integración en OTC

⚠️ **Antes de integrar: ya tenemos esto.** `@ai-coo/ui` exporta **`MetricCard`**, **`MetricStat`**, **`MetricBand`** y **`AnimatedNumber`** (`packages/ui/src/components/`), y `apps/web` tiene `@number-flow/react` para valores animados. Lo único que este block agrega sobre lo nuestro es **el menú `⋯` por tarjeta**. La decisión correcta casi seguro es **portar ese menú a `MetricCard`**, no traer un cuarto componente de KPI.

Si aun así se integra, la traducción de imports es mecánica:

```tsx
import { Badge, Button, Card, CardContent, CardHeader, CardTitle,
         DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
         DropdownMenuItem, DropdownMenuSeparator } from "@ai-coo/ui";
```

Y los reemplazos de props:

| Del demo | En OTC |
|---|---|
| `<CardToolbar>` | no existe → agregar a `card.tsx`, o `<div className="ml-auto">` dentro del `CardHeader` |
| `<Button variant="dim" mode="icon">` | `<Button variant="ghost" size="icon">` |
| `<Badge appearance="light">` | borrar `appearance` — `variant="success"` y `variant="destructive"` ya existen y ya son "light" |
| `<DropdownMenuItem variant="destructive">` | `<DropdownMenuItem className="text-destructive">` |
| `"Vs last month"`, `"Settings"`, `"Remove"` | traducir todo a español (es-AR) |

Además: `min-h-screen flex items-center justify-center` es del preview aislado. En una página real solo va el `<div className="grid …">`.

---

### 3.4 Tabs — variante `button`

**Autor:** `sean0205` (ReUI) · **Slug:** `tabs` · **Licencia:** MIT · **Publicado:** 2025-07
**URL:** https://21st.dev/@sean0205/components/tabs/button · **Docs:** reui.io/docs/tabs

#### Qué es

El componente Tabs completo de ReUI. La URL apunta a **una de sus variantes**, `variant="button"` — pestañas con fondo tipo botón. El componente también trae las variantes `line`, `pill` y `badge`, tamaños (`lg` / `md` / `sm` / `xs`) y estados disabled.

#### Instalación

```bash
npx @21st-dev/cli@latest add sean0205/tabs
```

#### Dependencias

| Tipo | Detalle | ¿Lo tenemos? |
|---|---|---|
| npm | `radix-ui` (paquete unificado), `class-variance-authority` | ⚠️ tenemos `cva`, pero usamos `@radix-ui/react-tabs` por separado |
| registry | `sean0205/badge-2` (solo lo usa el demo) | ❌ duplicaría nuestro `Badge` |

⚠️ **No instalar el paquete `radix-ui`.** Tener `radix-ui` y `@radix-ui/react-tabs` a la vez mete dos copias de la misma primitiva en el bundle y puede romper el contexto de React (dos módulos distintos = dos contextos). Al bajar el archivo, cambiar el import a mano:

```ts
// bajado:  import { Tabs as TabsPrimitive } from "radix-ui";
// usar:    import * as TabsPrimitive from "@radix-ui/react-tabs";
```

#### API (del demo)

| Prop | Dónde | Valor |
|---|---|---|
| `defaultValue` | `<Tabs>` | id de la pestaña inicial |
| `value` / `onValueChange` | `<Tabs>` | modo controlado (API estándar de Radix) |
| `variant` | `<TabsList>` | `"button"` · también `line`, `pill`, `badge` |
| `size` | `<TabsList>` | `lg` / `md` / `sm` / `xs` |
| `value` | `<TabsTrigger>` / `<TabsContent>` | id que los aparea |

#### Código de uso (demo oficial, verbatim)

```tsx
import { Badge } from '@/components/ui/badge-2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, UserRound } from 'lucide-react';

export default function TabsDemo() {
  return (
    <Tabs defaultValue="profile" className="w-[375px] text-sm text-muted-foreground">
      <TabsList variant="button" className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">
          <UserRound /> Profile
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell />
          Notifications
          <Badge variant="destructive" shape="circle" size="xs">5</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">Content for Profile</TabsContent>
      <TabsContent value="notifications">Content for Notifications</TabsContent>
    </Tabs>
  );
}
```

#### Integración en OTC — la decisión importante

**Ya tenemos `Tabs` en `@ai-coo/ui`** (`packages/ui/src/primitives/tabs.tsx`, sobre `@radix-ui/react-tabs`), usado en toda la plataforma. Nuestro `TabsList` **no tiene prop `variant`** — tiene un solo look (`bg-muted` con pill activo).

Hay dos caminos y **no son equivalentes**:

- ❌ **Instalar el Tabs de ReUI en `@/components/ui/tabs`.** Queda un segundo Tabs con otro look. Cualquiera que escriba una pantalla nueva no va a saber cuál importar, y la UI se fragmenta. **No hacer esto.**
- ✅ **Portar la variante a nuestra primitiva.** Agregar `variant` con `cva` a `packages/ui/src/primitives/tabs.tsx`, con `default` = el look actual (para no romper ninguna pantalla existente) y `button` = el nuevo. `cva` ya es dependencia de `@ai-coo/ui`, así que no se agrega nada.

Esbozo del port:

```tsx
const tabsListVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      default: "h-9 rounded-lg bg-muted p-1 text-muted-foreground",
      button:  "gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});
```

Otros ajustes:

- El `Badge` del demo usa `shape="circle" size="xs"`, que no tenemos. O se agregan esas variantes a `badge.tsx`, o se resuelve con `className="h-4 min-w-4 justify-center p-0 text-[10px]"`.
- Los iconos dentro de `TabsTrigger` van sin clase de tamaño: el `TabsTrigger` de ReUI los dimensiona con un selector `[&_svg]:size-4`. Al portar, agregarlo a nuestro `TabsTrigger` o pasarle `className="size-4"` a cada icono.
- Strings a español.

---

## 4. Prompts listos para usar

Pegar tal cual en una sesión de Claude Code / Cursor sobre este repo. Están escritos para que el agente respete `CLAUDE.md`.

### 4.1 Prompt genérico — bajar cualquiera de los cuatro

```
Leé CLAUDE.md, CHANGES.md y docs/COMPONENTES_21ST.md antes de tocar nada.

Quiero integrar el componente <SLUG> de 21st.dev a apps/web.

1. Verificá que haya sesión de 21st: `npx @21st-dev/cli@latest whoami`.
   Si no hay, pará y avisame (necesito correr `21st login` yo).
2. Corré primero `npx @21st-dev/cli@latest add <SLUG> --print` y mostrame
   el comando shadcn expandido ANTES de ejecutarlo. Quiero ver qué archivos
   va a escribir.
3. Bajá el componente.
4. Borrá toda primitiva duplicada que haya arrastrado a apps/web/components/ui/
   (Card, Badge, Button, Tabs, DropdownMenu) y reapuntá esos imports a @ai-coo/ui.
   Si @ai-coo/ui no tiene una variante que el componente necesita, EXTENDÉ la
   primitiva de packages/ui/src/primitives/ — no agregues una segunda primitiva.
5. Tailwind acá es v3.4, no v4: reemplazá `shadow-xs` -> `shadow-sm` y
   `h-8.5` -> `h-[34px]`. `size-*` sí existe en v3.4, no lo toques.
6. Reemplazá cualquier color hardcodeado (zinc-800, slate-*, etc.) por tokens
   del design system: bg-card, text-foreground, text-muted-foreground,
   border-border, bg-accent, ring-ring.
7. Traducí todos los strings de UI a español (es-AR). Iconos: solo Lucide, sin emojis.
8. Corré `cd apps/web && node node_modules/typescript/bin/tsc --noEmit` y `pnpm lint`.
9. Actualizá CHANGES.md y PENDIENTES.md según las reglas de CLAUDE.md.

No crees el PR. No commitees sin que te lo pida.
```

### 4.2 Notch Navigation Bar

```
Integrá arunachalam/adaptive-notch-navigation-bar siguiendo el prompt genérico
de docs/COMPONENTES_21ST.md §4.1, con estas particularidades:

- No arrastra dependencias de registry, así que se puede bajar tal cual.
- CLAUDE.md prohíbe navegación horizontal en el área (platform) — el sidebar
  es la única navegación. Montalo SOLO en app/(landing)/ o app/(founder)/.
  Si creés que va en otro lado, preguntame antes.
- Los `id` de NAV_ITEMS tienen que salir de routes/paths.ts, no hardcodeados.
- onActiveChange tiene que navegar con useRouter().push(), no solo setear estado.
- Los slots `logo` y `rightContent` del demo usan bg-zinc-800/dark:bg-zinc-300:
  cambialos por bg-foreground / text-background.
- Buscá y arreglá `shadow-xs` y `h-8.5` (Tailwind v4) en TODO el archivo bajado.
```

### 4.3 Dropdown Range Date Picker

```
Integrá ruixen.ui/dropdown-range-date-picker siguiendo el prompt genérico
de docs/COMPONENTES_21ST.md §4.1, con estas particularidades:

- Instalá antes: pnpm --filter @ai-coo/web add date-fns react-day-picker \
  @radix-ui/react-popover @radix-ui/react-select
- Arrastra 5 primitivas (originui/button, select, calendar, popover + shadcn/card).
  Borrá button y card -> usá @ai-coo/ui. Calendar y Popover NO existen en
  @ai-coo/ui: moveelos a packages/ui/src/primitives/ y exportalos desde el index.
- CRÍTICO: abrí el archivo y verificá si el componente expone value/onChange.
  Si el rango se queda adentro del componente, agregale una API controlada:
  `value?: DateRange` + `onChange?: (r: DateRange | undefined) => void`.
  Sin eso no sirve para filtrar y no lo mergeamos.
- Localización es-AR: pasale `locale={es}` de date-fns/locale al Calendar y usá
  ese locale en todos los format().
- Definí y documentá UN criterio de serialización de fechas (propongo ISO
  yyyy-MM-dd sin hora) y dejalo escrito en el archivo, porque deployamos en gru1
  y el negocio es AR — no quiero rangos corridos un día.
- Primer consumidor: el filtro de rango de /marketing/anuncios
  (getMarketingAdsAction ya pasa fromDate/toDate a listAds de Zernio).
```

### 4.4 Statistics Card 1

```
NO bajes sean0205/statistics-card-1 con el CLI.

Es un block de layout, no un componente: sus únicas dependencias de registry
son Card, Badge y DropdownMenu de ReUI, que duplicarían las nuestras.

En vez de eso:
1. Leé packages/ui/src/components/metric-card.tsx, metric-stat.tsx y metric-band.tsx.
2. Comparalos con el JSX del demo en docs/COMPONENTES_21ST.md §3.3.
3. Lo único que ese block agrega sobre lo nuestro es el menú "⋯" por tarjeta
   (Settings / Alerta / Fijar / Compartir / Quitar).
4. Portá ESE menú a MetricCard como prop opcional `actions?: ReactNode`,
   usando DropdownMenu de @ai-coo/ui. Sin prop, MetricCard queda igual que hoy.
5. Strings en español. Iconos Lucide.

Decime primero qué encontraste comparando, antes de escribir código.
```

### 4.5 Tabs variante button

```
NO instales sean0205/tabs como componente nuevo.

Ya tenemos Tabs en packages/ui/src/primitives/tabs.tsx sobre @radix-ui/react-tabs,
usado en toda la plataforma. Un segundo Tabs fragmenta la UI.

Lo que quiero es portar la variante "button" de ReUI a NUESTRA primitiva:

1. Agregá `variant` a TabsList con cva (ya es dependencia de @ai-coo/ui):
   - default: el look actual EXACTO (h-9 rounded-lg bg-muted p-1 text-muted-foreground)
   - button: la variante nueva
   defaultVariants: { variant: "default" } — ninguna pantalla existente debe cambiar.
2. Agregá `[&_svg]:size-4 [&_svg]:shrink-0` a TabsTrigger para que los iconos
   Lucide se dimensionen solos.
3. NO instales el paquete `radix-ui` unificado: ya usamos @radix-ui/react-tabs
   y tener los dos mete dos copias del mismo contexto en el bundle.
4. Exportá el tipo de variantes desde packages/ui/src/index.ts.
5. Verificá con grep que ninguna pantalla que ya usa TabsList cambie de aspecto.
6. `cd apps/web && node node_modules/typescript/bin/tsc --noEmit` + pnpm lint.
```

---

## 5. Checklist de integración

Por cada componente que entre al repo:

- [ ] `npx @21st-dev/cli@latest whoami` devuelve una cuenta (si no: `21st login`)
- [ ] Se corrió `add --print` y se revisó la lista de archivos antes de escribir
- [ ] Licencia verificada (⚠️ el date picker no declara ninguna)
- [ ] Primitivas duplicadas en `apps/web/components/ui/` borradas; imports a `@ai-coo/ui`
- [ ] Ninguna primitiva nueva que ya exista en `@ai-coo/ui`
- [ ] `shadow-xs` y `h-8.5` reemplazados (Tailwind v3)
- [ ] Colores hardcodeados (`zinc-*`, `slate-*`) → tokens del design system
- [ ] Se probó en **light y dark** (`darkMode: "class"`)
- [ ] Strings de UI en español (es-AR)
- [ ] Iconos Lucide, cero emojis en JSX
- [ ] `"use client"` solo donde hace falta (estos cuatro son interactivos: sí lo llevan)
- [ ] Rutas nuevas en `routes/paths.ts` + `sidebar-modules.ts` si aplica
- [ ] `cd apps/web && node node_modules/typescript/bin/tsc --noEmit` pasa
- [ ] `pnpm lint` pasa
- [ ] `pnpm test` pasa
- [ ] `CHANGES.md` y `PENDIENTES.md` actualizados

---

## 6. Resumen ejecutivo — qué conviene hacer con cada uno

| Componente | Encaje en OTC | Recomendación |
|---|---|---|
| **Dropdown Range Date Picker** | 🟢 **Alto** — llena un hueco real en anuncios, finanzas y reportes | **Bajar e integrar.** Es el que más valor agrega. Resolver licencia y verificar que exponga `value`/`onChange`. |
| **Adaptive Notch Navigation Bar** | 🟡 **Condicionado** — choca con la regla de "solo sidebar" | **Bajar solo si va en landing/founder.** Técnicamente es el más limpio (cero deps de registry). |
| **Tabs variante button** | 🟡 **Como referencia** — ya tenemos Tabs | **No instalar.** Portar la variante a `packages/ui/src/primitives/tabs.tsx`. |
| **Statistics Card 1** | 🔴 **Bajo** — ya tenemos `MetricCard`, `MetricStat`, `MetricBand` | **No instalar.** Portar solo el menú `⋯` a `MetricCard`. |

**El patrón:** de los cuatro, **dos son componentes que no tenemos** (date picker, notch nav) y **dos son cosas que ya tenemos con otro look** (tabs, stat card). Para los primeros el CLI sirve; para los segundos, instalarlos duplicaría el design system. La regla 4 de `CLAUDE.md` — "no duplicar" — decide sola.

---

## 7. Pendiente de verificar

Según la regla 4 de `CLAUDE.md`, lo que no se pudo comprobar en esta sesión:

| Ítem | Por qué no se verificó | Cómo verificarlo |
|---|---|---|
| Código fuente real de los 4 componentes | registry devuelve 403 sin credenciales | `21st login` y después `add --print` + `add` |
| Si el date picker expone `value`/`onChange` | ídem | leer el archivo bajado |
| API completa del `NotchNav` (¿hay más props que las del demo?) | ídem | leer el archivo bajado |
| Registry de 21st vía `components.json` con header `Authorization` (§1.5) | no hay API key disponible | probar `npx shadcn@latest add @21st/sean0205/tabs` con `TWENTYFIRST_TOKEN` seteado |
| Si `sean0205/badge-2` sigue accesible desde reui.io | el registry público de ReUI devuelve 401 para la mayoría de los ítems (`card`, `button`, `tabs`, `dropdown-menu`); solo `badge` respondió 200 el 2026-08-30 | irrelevante si se sigue la recomendación de no instalar los de ReUI |
| Nivel de cuota de la cuenta 21st de Santiago | no hay sesión | `npx @21st-dev/cli@latest usage` |

---

## Fuentes

- Páginas de los componentes en 21st.dev (metadata y demos extraídos del HTML servido, 2026-08-30)
- README de [`@21st-dev/cli` v1.16.1](https://www.npmjs.com/package/@21st-dev/cli) — comandos y autenticación
- [help.21st.dev/cli](https://help.21st.dev/cli) — guía de `add` / `get`
- [21st.dev/blog/introducing-agents-cli](https://21st.dev/blog/introducing-agents-cli) — CLI unificado y endpoint MCP
- [github.com/21st-dev/magic-mcp](https://github.com/21st-dev/magic-mcp) — paquete legacy
- Este repo: `apps/web/components.json`, `apps/web/tailwind.config.ts`, `packages/config/tailwind/preset.ts`, `packages/ui/src/styles/tokens.css`, `packages/ui/src/primitives/*`
