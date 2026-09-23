# Design system Limitless

> Verificado contra el código el 2026-09-23 (commit 038caca). Reemplaza a `DESIGN.md` (raíz) y a
> `docs/archivo/DESIGN_SYSTEM.md`, ambos archivados en `docs/archivo/`: se partió de `DESIGN.md`, se corrigió todo lo que ya no coincidía con
> `packages/ui/src/styles/tokens.css`, `apps/web/app/globals.css`, `packages/config/tailwind/preset.ts` y
> `packages/ui/src`, y se sumó lo útil de `DESIGN_SYSTEM.md` (índice de primitivas, showcase).
> Cómo se arma la UI (shell, notch nav, patrones): [`ui-y-navegacion.md`](./ui-y-navegacion.md).
>
> Citan este archivo desde el código: `apps/web/lib/brand.ts`, `apps/web/lib/funnels/types.ts` y
> `apps/web/lib/funnels/validate-template.ts` (regla "token, nunca hex"). Si se mueve este archivo,
> actualizar esos comentarios.

**Fuentes de verdad, en orden:** `tokens.css` (variables HSL por tema) → `preset.ts` (clases Tailwind) →
`globals.css` (superficies RGB, gráficos, clases utilitarias) → `apps/web/lib/brand.ts` (hex para contextos
sin CSS vars). Si este documento y esos archivos difieren, ganan los archivos.

## Reglas

1. **Un solo acento: Naranja Vibrant `#E15D12` = `hsl(22 85% 48%)`.** Paleta de marca (manual Limitless,
   sección 06): negro `#000000`, blanco `#FFFFFF`, naranja. Se usa **siempre por token**: `bg-primary`,
   `text-primary`, `text-primary-light`, `bg-primary-hover`, `border-primary`, escala `brand-50…950`. Hex
   sólo vía `brandColors` de `lib/brand.ts` (props de gráficos Visx, estilos inline, HTML de emails).
   Hoy no hay ningún `#E15D12` hardcodeado en `components/` ni `app/`.
2. **Texto sobre naranja va en negro** (`--primary-foreground: 0 0% 0%`, 5.78:1). Blanco da 3.64:1 y no
   pasa AA para texto normal: sólo en piezas grandes (logotipo). Pendiente de validación de equipo `[BRAND-C]`.
3. **No hay violeta.** Era la identidad anterior; no quedan clases `violet-*` en la app. (Queda un selector
   `button[class*="bg-violet"]` muerto en `globals.css`.)
4. **Navegación:** la notch nav es la única navegación de plataforma. No hay sidebar ni topbar en
   `(platform)`; el título lo pone el shell. `Topbar` de `@ai-coo/ui` sólo lo usan super admin y el área del
   fundador.
5. **Modo oscuro por defecto:** `app/layout.tsx` agrega `.dark` salvo `localStorage.theme === "light"`.
6. **Íconos Lucide, nunca emojis en la UI** (hay 20 archivos que la rompen, ver `[UI-EMOJIS]`).
7. **Motion liviano:** CSS / Framer Motion, sin WebGL, respetar `prefers-reduced-motion`. Ningún wrapper de
   página con `transform`.
8. **Métricas** con `MetricCard` / `MetricStat` / `MetricBand`; **insights de IA** con `AiCard`.

## Colores

### Tokens HSL (`tokens.css`) — se usan como `hsl(var(--token))` o por clase Tailwind

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | `210 40% 98%` (#F8FAFC) | `0 0% 0%` (#000) | Fondo app |
| `--foreground` | `0 0% 4%` | `0 0% 100%` | Texto principal |
| `--card` / `--popover` | `0 0% 100%` | `0 0% 6%` (#0F0F0F) | Paneles, popovers |
| `--popover-foreground` | `222 47% 11%` | `0 0% 98%` | |
| `--muted` | `210 40% 96%` | `0 0% 3%` | Fondos inset |
| `--muted-foreground` | `0 0% 40%` | `0 0% 48%` | Texto secundario |
| `--accent` | `210 40% 96%` | `0 0% 10%` | Hover neutro (≠ marca) |
| `--primary` | `22 85% 48%` | `22 85% 48%` | **Naranja de marca** |
| `--primary-foreground` | `0 0% 0%` | `0 0% 0%` | Texto sobre naranja: **negro** |
| `--primary-light` | `22 90% 62%` (#F58747) | igual | Highlights, activo en dark |
| `--primary-hover` | `22 85% 40%` (#BD4F0F) | igual | Hover/pressed |
| `--primary-subtle` | `24 100% 96%` | `22 60% 14%` | Fondos de acento suaves |
| `--primary-glow` | `22 85% 38%` | igual | Glow |
| `--primary-border` | `22 75% 72%` | `22 55% 32%` | Borde con tinte |
| `--success` | `142 76% 36%` | `160 84% 39%` | |
| `--warning` | `32 95% 44%` | `43 96% 56%` (fg `0 0% 10%`) | |
| `--destructive` | `0 72% 51%` | `0 84% 60%` | |
| `--info` | `199 89% 48%` | igual | |
| `--border` / `--input` | `214 32% 91%` | `0 0% 11%` | |
| `--ring` | `22 85% 48%` | igual | Focus ring |
| `--sidebar*` | fondo `0 0% 100%`, fg `215 16% 47%`, activo `22 85% 42%`, accent `24 100% 96%` | fondo `0 0% 0%`, fg `0 0% 36%`, activo `22 90% 62%`, accent `22 55% 16%` | Sidebar de super admin y drawer mobile |
| `--ai` / `--ai-muted` / `--ai-glow` | `22 85% 48%` / `22 45% 50%` / `22 90% 62%` | `…` / `22 45% 32%` / `…` | Elementos de IA |
| `--chart-secondary…quinary` | `22 90% 62%`, `32 80% 55%`, `22 30% 55%`, `0 0% 45%` | `22 90% 62%`, `32 80% 60%`, `22 30% 62%`, `0 0% 62%` | Series HSL heredadas |

Body: light `rgb(241 245 249)`; dark `#000000` con texto `muted-foreground` (`globals.css`).

### Escala `brand-*` (`preset.ts`)

`brand-50` `hsl(22 100% 96%)` · 100 `22 96% 92%` · 200 `22 94% 84%` · 300 `22 92% 73%` · **400 = primary-light**
· 500 `22 88% 54%` · **600 = primary** · **700 = primary-hover** · 800 `22 82% 32%` · 900 `22 78% 24%` · 950 `22 75% 14%`.

### Superficies RGB (`globals.css`) — `rgb(var(--color-*) / α)`

| Variable | Light | Dark |
|---|---|---|
| `--color-surface-1` | `241 245 249` | `0 0 0` |
| `--color-surface-2` | `255 255 255` | `10 10 10` |
| `--color-surface-3` | `255 255 255` | `16 16 16` |
| `--color-surface-4` | `248 250 252` | `22 22 22` |
| `--color-border`, `--color-border-strong` | `0 0 0` | `255 255 255` |
| `--color-accent` | `225 93 18` | `225 93 18` |
| `--color-accent-light` | `189 79 15` | `245 135 71` |
| `--color-text-*`, `--color-chart-primary/secondary` | `10 10 10` | `255 255 255` |
| `--color-chart-accent` | `225 93 18` | igual |

Además `preset.ts` define `surface-1…4` fijos (`#111111`, `#1A1A1A`, `#222222`, `#2A2A2A`), que **no**
siguen el tema: sólo para piezas siempre oscuras.

### Gráficos (`globals.css`)

| Familia | Light | Dark | Para qué |
|---|---|---|---|
| `--chart-1…5` | `#0a0a0a`, luego negro a 0.62 / 0.44 / 0.30 / 0.20 | blanco con las mismas opacidades | Rampa monocroma: magnitud de **una** serie |
| `--chart-cat-1…6` | `#e15d12`, `#2a78d6`, `#0f8f63`, `#4a3aa7`, `#d6558a`, `#0b7a37` | `#e8681b`, `#3d84dd`, `#12a273`, `#6b5bc9`, `#d9639b`, `#1f9440` | Identidad de serie. Orden fijo, nunca ciclar |
| `--chart-cat-N-ink` | pasos a 4.5:1 | ídem | Texto/badges del color de una serie |
| `--chart-ordinal-1…5` | `#f0995c` → `#5e2606` | `#94400c` → `#f9c9a5` (invertida) | Etapas de embudo, tiers |
| `--chart-accent`, `--chart-crosshair` | `#e15d12` | igual | Cursor, acento |
| `--chart-surface`, `--chart-grid`, `--chart-tooltip-*`, `--chart-marker-*`, `--chart-label`, `--chart-segment-*` | superficies claras | superficies oscuras | Chrome del gráfico |

`--chart-bar-mono` (tokens.css): `rgba(0,0,0,0.8)` / `rgba(255,255,255,0.85)`.

## Tipografía

| Rol | Fuente | Variable | Dónde |
|---|---|---|---|
| Texto | Inter (`next/font/google`) | `--font-sans` | `app/layout.tsx` |
| Títulos | Neue Haas Grotesk — **sin licencia**, resuelve a Inter | `--font-display` → clase `font-display` | `tokens.css` `[BRAND-B]` |
| Mono | JetBrains Mono | `--font-mono` | `app/layout.tsx` |
| Landing (`/prueba`, `/privacidad`) | Geist Sans | — | `app/(landing)/layout.tsx` |

Al comprar Neue Haas Grotesk: `next/font/local` y apuntar `--font-display` a su variable; ningún componente
cambia. El wordmark del logo es Manrope Light, servido como imagen.

| Clase | Tamaño / line-height |
|---|---|
| `text-2xs` | 10px / 0.875rem |
| `text-micro` | 11px / 1.3 |
| `text-caption` | 13px / 1.45 |
| `text-body` | 15px / 1.5 (default del body) |
| `text-title` | 20px / 1.75rem |
| `text-metric-value` | 28px / 2rem |

Clases de métricas (`globals.css`): `.metric-label`, `.metric-stat-label` (13px, 500), `.metric-value`
(28px, semibold, tabular-nums), `.metric-stat-value` (32px), `.metric-band`, `.metric-band-cell`.
Texto: `.text-gradient` (foreground → muted), `.text-gradient-ai` (foreground → `#f58747`).
`::selection`: `rgba(225, 93, 18, 0.35)`.

## Marca y assets (`apps/web/lib/brand.ts`)

| Export | Contenido |
|---|---|
| `brand` | `name` "Limitless", `wordmark`, `legalName`, `tagline`, `domain` (`optimizatucontrol.com`, `[BRAND-E]`) |
| `brandAssets` | `/brand/logo-{light,dark}.png` (lockup ≈8.4:1), `/brand/isotipo-{light,dark}.svg`, `/brand/isotipo-naranja.svg` |
| `brandColors` | `primary #E15D12`, `primaryLight #F58747`, `primaryLighter #F9AE81`, `primaryHover #BD4F0F`, `primaryDeep #8F3B0B`, `black`, `white` |

Favicon: `app/icon.svg`, `app/apple-icon.png`; OG: `app/opengraph-image.tsx`. `AppLogo`
(`components/brand/app-logo.tsx`) dibuja las dos versiones y alterna con `dark:hidden` / `hidden dark:block`.
No hardcodear strings de marca ni rutas de logo.

## Espaciado, radios y sombras

| Token | Valor | | Token | Valor |
|---|---|---|---|---|
| `--space-shell` / `-gap` | 12px | | `--space-card` | 24px |
| `--space-page-x` / `-x-lg` | 24px / 32px | | `--space-card-sm` | 16px |
| `--space-page-y` | 28px | | `--space-section` | 32px |
| `--space-metric-band-x/y` | 28px / 20px | | `--notch-width/height/radius` | 140px / 36px / `--radius-lg` |

Radios (`rounded-*`): `sm` 6px · `md` 8px · `lg` 12px (default, cards) · `xl` 16px · `2xl` 20px · `page` 20px ·
`pill` 9999px. Spacing extra: `4.5` (18px), `13` (52px), `18` (72px).

`--shell-sidebar-width` (220px) y `-collapsed` (72px) siguen en tokens por el sidebar de super admin.

| Sombra | Light | Dark | Clase Tailwind |
|---|---|---|---|
| `--shadow-glow` | `0 0 32px -8px rgba(225,93,18,0.2)` | `0 0 48px -8px rgba(225,93,18,0.35)` | `shadow-glow` |
| `--shadow-card` | 3 capas negras 0.04–0.06 | anillo blanco 0.06 + negras | `shadow-card` |
| `--shadow-panel` | 3 capas slate | anillo blanco 0.06 + `0 12px 40px` | `shadow-panel` |
| `--shadow-band` | 2 capas suaves | anillo + `0 4px 16px` | `shadow-band` |
| `--shadow-float` | 4 capas | 3 capas | **sin clase**: sólo `var(--shadow-float)` en CSS |
| `--shadow-modal` | `0 20px 60px` | anillo + `0 32px 80px` | sin clase |

`.glow-primary` aplica `shadow-glow`: reservado para elementos de IA.

## Superficies glass

Clases en `globals.css`: `.glass` (`rounded-lg`), `.glass-strong` (`rounded-xl`), `.glass-nested`
(`rounded-md`), `.surface-glass`, `.surface-card`. En dark aplican
`backdrop-filter: blur(20px) saturate(190%) contrast(90%) brightness(80%)` (hardcodeado en la clase).
Hover genérico: `shadow-float` y borde más visible, **sin glow de marca**. Animaciones decorativas:
`.glass-liquid`, `.glass-liquid-subtle` (la usa `AiCard`), `.glass-liquid-border`; todas se apagan con
`prefers-reduced-motion`.

⚠️ `[GLASS-TOKENS-PISADOS]` `tokens.css` define `--glass-bg` por tema (card en light, `rgba(10,10,10,0.88)`
en dark), pero `globals.css` vuelve a declarar `--glass-bg: rgba(255,255,255,0.03)` (y `--glass-border`,
`--glass-blur: blur(20px)`) en un `:root` dentro de `@layer base`, que se emite **después** y con la misma
especificidad que `.dark`. Leyendo la cascada, `.glass` termina casi transparente en **los dos** temas, no
"card blanca sólida en light". Confirmar con DevTools (computed de `--glass-bg` sobre `<html>`) antes de
tocarlo: ~97 archivos usan `glass`/`GlassPanel`.

## Motion

| Contexto | Duración | Easing |
|---|---|---|
| Hover / botones | 150ms | ease |
| Apertura de paneles, diálogos, cards | 300ms (`--duration-enter`) | `--ease-spring` = `cubic-bezier(0.16, 1, 0.3, 1)` |
| Cierre | 150ms (`--duration-exit`) | spring |

Animaciones Tailwind (`preset.ts`): `fade-in` (opacidad + translateY 8px), `page-fade-in` (sólo opacidad —
la de las transiciones de página, porque `transform` rompe los `fixed`), `pulse-glow`, `shimmer`,
`dialog-overlay-show/hide`, `dialog-content-show/hide` y sus variantes `-reduced`. En
`apps/web/tailwind.config.ts`: `btn-press` y `btn-press-ghost` (scale 0.96 + anillo).

## Componentes de `@ai-coo/ui`

Showcase vivo en `/design-system` (público), `/design-system/charts` y `/design-system/categorias`.

**Primitivas:** Button, Badge (variante `ai`), Card, Dialog, DropdownMenu, Input, Label, Separator,
Skeleton, Table, Tabs, Textarea, Tooltip, Typography (`Heading`, `Text`, `Caption`, `Mono`).

| Componente | API real (resumen) |
|---|---|
| `MetricCard` | `title`, `value`, `trend` (`up`/`down`/`neutral`), `trendValue`, `subtitle` (default "vs período anterior {trendValue}"), `badge`, `icon`, `sparklineData`, `sparklineColor`, `sparklinePreset`, `glass`, `showProgressBar`, `progress`, `progressCaption`, `progressVariant` (`"trend"` \| `"brand"` → `from-brand-600 to-brand-400`), `chartData`, `chartPreviousData`, `chartStartLabel`, `chartEndLabel`. Sin porcentaje real no dibuja barra |
| `MetricStat` | Versión compacta sin `Card`, para `MetricBand` |
| `MetricBand` | Fila de `MetricStat` con divisores; columna en mobile |
| `AiCard` | `title`, `variant` (`default`/`insight`/`recommendation` → `Spotlight`), `confidence`, `source`. Ícono `Sparkles` `text-primary dark:text-primary-light`, badge "AI", `.glass-liquid-subtle` |
| `GlassPanel` | `variant` (`default`/`strong`/`nested`), `glow` (sólo IA) |
| `DataTable` | `title`, `description`, `columns`, `data`, `keyExtractor`, `emptyMessage`. **Sin orden ni paginación** |
| `AnimatedNumber` / `MetricAnimatedValue` | Contador al montar |
| `Sparkline`, `DecorativeSparkline`, `MetricLineChart`, `BarChart` | Mini gráficos SVG |
| `StaggerFade` / `StaggerFadeItem` | Listas con entrada escalonada |
| `NotchedCard`, `SteppedAlert` | Card con muesca; alerta por pasos (`--step-alert-*`) |
| `SectionHeader`, `FormField`, `Topbar`, `SidebarShell`, `Spotlight` | `SidebarShell` sólo en el showcase |

`PageTransition` no es de `@ai-coo/ui`: es `apps/web/components/layout/page-transition.tsx`.
Respetan `usePrefersReducedMotion`: `StaggerFade`, `AnimatedNumber`, `Spotlight`, `AiCard`.

## Patrones

```tsx
// Pill de estado positivo
<span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50
  px-2.5 py-[3px] text-micro font-medium text-emerald-700 dark:border-emerald-400/25
  dark:bg-emerald-500/10 dark:text-emerald-400">
  <TrendingUp className="h-3 w-3" /> +12%
</span>

// Pill de marca
<span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-micro
  font-medium text-primary dark:text-primary-light">Nuevo</span>

// Focus visible: el ring ya es naranja
// focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

## Lo que cambió respecto de `DESIGN.md`

| `DESIGN.md` decía | Hoy |
|---|---|
| `--primary-foreground` blanco | Negro (`0 0% 0%`) en los dos temas |
| `--primary-subtle` / `--sidebar-accent` light `250 100% 97%` (violeta) | `24 100% 96%` (naranja muy claro) |
| `--shadow-glow` y `::selection` con `rgba(124,58,237,…)` | `rgba(225,93,18,…)` |
| `.text-gradient-ai` a `#a78bfa` | a `#f58747` |
| `--chart-2…5` a 0.4/0.2/0.32/0.24; `--chart-tertiary` violeta; `--chart-pink` | Rampa 0.62/0.44/0.30/0.20; paleta categórica `--chart-cat-*`, `-ink`, `--chart-ordinal-*`; sin pink |
| `progressVariant="violet"` | `"brand"` |
| `DataTable` con Tanstack, orden y paginación | Tabla simple, sin dependencias |
| `shadow-float` como clase Tailwind | Sólo variable CSS |
| Glass light "cards sólidas blancas" | Probablemente casi transparente (ver `[GLASS-TOKENS-PISADOS]`) |
| `docs/archivo/DESIGN_SYSTEM.md`: "dark mode only", `PlatformShell` con sidebar + topbar + context panel | Dos temas; shell con notch nav, sin sidebar ni context panel |

## Pendientes

`[BRAND-B]` licencia de Neue Haas Grotesk · `[BRAND-C]` validar texto negro sobre naranja ·
`[BRAND-D]` borrar la rama `brand-source` · `[BRAND-E]` dominio · `[GLASS-TOKENS-PISADOS]` ·
`[UI-EMOJIS]` · `[DIALOG-DOBLE-PADDING]` · `[UI-SIN-TESTS]` (`parse-metric-value`, `metric-trend`; un
valor "+77%" pierde el signo al animarse) · `[CHART-A]` / `[CHART-B]` · `[UI-21ST]` (Tabs variante
`button` y menú de acciones en `MetricCard`, sin decidir).
