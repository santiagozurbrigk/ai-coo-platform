# OTC — Design System Reference

> **Fuente de verdad para agentes de IA, diseño y desarrollo UI.**  
> Extraído de `packages/ui/src/styles/tokens.css`, `packages/config/tailwind/preset.ts`, `apps/web/app/layout.tsx` y `apps/web/app/globals.css`. No inventar valores fuera de este documento.

---

## Reglas explícitas

1. **Acento primario único:** `hsl(258 84% 58%)` / `#7C3AED` — no usar azules genéricos de shadcn, verdes como primario, ni paletas “startup template”.
2. **No inventar chrome inexistente:** la app no tiene breadcrumbs globales, buscador universal en topbar, ni navegación que no esté en el sidebar actual.
3. **Modo oscuro por defecto:** el script en `layout.tsx` aplica `.dark` salvo `localStorage.theme === 'light'`.
4. **Superficies glass:** en dark mode usan `backdrop-blur` + bordes `white/8%`; en light son cards sólidas blancas.
5. **Performance:** animaciones con CSS / Framer Motion liviano. Sin WebGL en la app productiva. Respetar `prefers-reduced-motion`.
6. **Métricas:** usar clases `.metric-value` / `.metric-stat-value` y componentes `MetricCard` / `MetricStat` de `@ai-coo/ui`.
7. **IA visual:** cards de insight usan `AiCard` con `variant="insight"` o `"recommendation"` (spotlight sutil).

---

## Tokens faltantes / correcciones vs. versión anterior

> Esta sección documenta diferencias importantes entre lo que estaba en DESIGN.md y los valores reales en `tokens.css` y `globals.css`.

- **Dark background real:** `0 0% 0%` (#000000), **no** `0 0% 4%` (#0A0A0A) — fondo es negro puro Vercel-style
- **Dark card:** `0 0% 6%` (#0F0F0F), **no** `0 0% 10%`
- **Dark muted:** `0 0% 3%` (#080808), **no** `0 0% 7%`
- **Dark border:** `0 0% 11%` (#1C1C1C), **no** `0 0% 17%`
- **Dark sidebar-foreground:** `0 0% 36%` (#5C5C5C), **no** `0 0% 50%`
- **Glass dark bg real:** `rgba(10,10,10,0.88)` / strong `rgba(14,14,14,0.92)` / nested `rgba(6,6,6,0.85)` — más oscuro que la versión previa
- **`--color-surface-*`** y **`--chart-*`** ahora están completamente documentados abajo

---

## Paleta de colores

### Light (`:root`)

| Token | HSL | Hex aprox. | Uso |
|-------|-----|------------|-----|
| `--background` | `210 40% 98%` | `#F8FAFC` | Fondo app |
| `--foreground` | `0 0% 4%` | `#0A0A0A` | Texto principal |
| `--card` | `0 0% 100%` | `#FFFFFF` | Paneles, cards |
| `--card-foreground` | `0 0% 4%` | `#0A0A0A` | Texto en cards |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Popovers |
| `--popover-foreground` | `222 47% 11%` | `#111827` | Texto en popovers |
| `--muted` | `210 40% 96%` | `#F1F5F9` | Fondos secundarios |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Texto secundario |
| `--accent` | `210 40% 96%` | `#F1F5F9` | Accent (Tailwind accent ≠ marca) |
| `--accent-foreground` | `222 47% 11%` | `#111827` | Texto accent |
| `--primary` | `258 84% 58%` | `#7C3AED` | **Acento marca** |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre primary |
| `--primary-light` | `258 91% 76%` | `#C4B5FD` | Highlights violeta |
| `--primary-subtle` | `250 100% 97%` | `#F5F3FF` | Fondos acento suaves |
| `--primary-glow` | `258 60% 45%` | `#5B21B6` | Glow / sombras violeta |
| `--primary-border` | `258 45% 75%` | `#A78BFA` | Borde con tinte violeta |
| `--success` | `142 76% 36%` | `#16A34A` | Positivo |
| `--warning` | `32 95% 44%` | `#D97706` | Alerta |
| `--destructive` | `0 72% 51%` | `#DC2626` | Error |
| `--info` | `199 89% 48%` | `#0EA5E9` | Informativo |
| `--border` | `214 32% 91%` | `#E2E8F0` | Bordes |
| `--input` | `214 32% 91%` | `#E2E8F0` | Borde inputs |
| `--ring` | `258 84% 58%` | `#7C3AED` | Focus ring |
| `--sidebar` | `0 0% 100%` | `#FFFFFF` | Fondo sidebar |
| `--sidebar-foreground` | `215 16% 47%` | `#64748B` | Texto nav |
| `--sidebar-foreground-active` | `263 70% 50%` | `#7C3AED` | Nav activo |
| `--sidebar-accent` | `250 100% 97%` | `#F5F3FF` | Hover nav item |
| `--sidebar-border` | `214 32% 91%` | `#E2E8F0` | Borde sidebar |
| `--ai` | `258 84% 58%` | `#7C3AED` | Elementos IA |
| `--ai-muted` | `258 40% 55%` | `#7C5CC7` | IA secundario |
| `--ai-glow` | `258 91% 76%` | `#C4B5FD` | Glow IA |

**Body light:** `background: rgb(241 245 249)` (`#F1F5F9`).  
**Glass light:** sin blur (blur=0px). Cards sólidas blancas, borde `#E2E8F0`.

### Dark (`.dark`) — Vercel-style: negro puro, superficies mínimas

| Token | HSL | Hex aprox. | Uso |
|-------|-----|------------|-----|
| `--background` | `0 0% 0%` | `#000000` | Fondo app — negro puro |
| `--foreground` | `0 0% 100%` | `#FFFFFF` | Texto principal |
| `--card` | `0 0% 6%` | `#0F0F0F` | Paneles, cards |
| `--card-foreground` | `0 0% 100%` | `#FFFFFF` | Texto en cards |
| `--popover` | `0 0% 6%` | `#0F0F0F` | Popovers |
| `--popover-foreground` | `0 0% 98%` | `#FAFAFA` | Texto popovers |
| `--muted` | `0 0% 3%` | `#080808` | Fondos inset |
| `--muted-foreground` | `0 0% 48%` | `#7A7A7A` | Texto secundario |
| `--accent` | `0 0% 10%` | `#1A1A1A` | Accent (hover items) |
| `--accent-foreground` | `0 0% 98%` | `#FAFAFA` | Texto accent |
| `--primary` | `258 84% 58%` | `#7C3AED` | **Acento marca** (idéntico) |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre primary |
| `--primary-light` | `258 91% 76%` | `#C4B5FD` | Highlights violeta |
| `--primary-subtle` | `258 50% 18%` | `#2D1B6E` | Fondos acento dark |
| `--primary-border` | `258 45% 35%` | `#4C2F8A` | Borde acento dark |
| `--success` | `160 84% 39%` | `#10B981` | Positivo (más saturado en dark) |
| `--warning` | `43 96% 56%` | `#F59E0B` | Alerta |
| `--destructive` | `0 84% 60%` | `#EF4444` | Error |
| `--border` | `0 0% 11%` | `#1C1C1C` | Bordes ultra-sutiles |
| `--input` | `0 0% 11%` | `#1C1C1C` | Borde inputs |
| `--ring` | `258 84% 58%` | `#7C3AED` | Focus ring |
| `--sidebar` | `0 0% 0%` | `#000000` | Fondo sidebar |
| `--sidebar-foreground` | `0 0% 36%` | `#5C5C5C` | Texto nav inactivo |
| `--sidebar-foreground-active` | `258 91% 76%` | `#C4B5FD` | Nav activo |
| `--sidebar-accent` | `258 50% 20%` | `#2D1B6E` | Hover nav item |
| `--sidebar-border` | `0 0% 11%` | `#1C1C1C` | Borde sidebar |
| `--ai` | `258 84% 58%` | `#7C3AED` | Elementos IA |
| `--ai-muted` | `258 40% 35%` | `#3D2472` | IA secundario dark |
| `--ai-glow` | `258 91% 76%` | `#C4B5FD` | Glow IA |

**Body dark:** `background: #000000` (negro puro).

### Superficies semánticas (`globals.css` — sistema RGB sin `hsl()`)

Estos tokens son en formato RGB raw (sin `hsl()`), usados con `rgb(var(--color-*) / opacity)`:

| Variable | Light (RGB) | Dark (RGB) | Hex light | Hex dark |
|----------|-------------|------------|-----------|----------|
| `--color-surface-1` | `241 245 249` | `0 0 0` | `#F1F5F9` | `#000000` |
| `--color-surface-2` | `255 255 255` | `10 10 10` | `#FFFFFF` | `#0A0A0A` |
| `--color-surface-3` | `255 255 255` | `16 16 16` | `#FFFFFF` | `#101010` |
| `--color-surface-4` | `248 250 252` | `22 22 22` | `#F8FAFC` | `#161616` |
| `--color-border` | `0 0 0` | `255 255 255` | — | — |
| `--color-border-strong` | `0 0 0` | `255 255 255` | — | — |
| `--color-accent` | `124 58 237` | `124 58 237` | `#7C3AED` | `#7C3AED` |
| `--color-accent-light` | `109 40 217` | `167 139 250` | `#6D28D9` | `#A78BFA` |
| `--color-chart-primary` | `10 10 10` | `255 255 255` | `#0A0A0A` | `#FFFFFF` |
| `--color-chart-accent` | `124 58 237` | `124 58 237` | `#7C3AED` | `#7C3AED` |

**Uso:** `rgba(var(--color-surface-2) / 0.5)` o `rgb(var(--color-accent))`

### Tailwind surface colors (preset.ts)

```ts
surface: {
  1: "#111111",  // surface oscura base
  2: "#1A1A1A",  // elevada
  3: "#222222",  // más elevada
  4: "#2A2A2A",  // máxima elevación
}
```
Clases: `bg-surface-1`, `bg-surface-2`, etc.

### Charts (`globals.css` — Bklit chart tokens)

Dos contextos: light y dark. Los valores cambian radicalmente — **líneas en negro en light, blanco en dark**, con variantes de opacidad.

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--chart-1` | `#0a0a0a` | `#ffffff` | Línea/área primaria |
| `--chart-2` | `rgba(10,10,10,0.4)` | `rgba(255,255,255,0.4)` | Secundaria |
| `--chart-3` | `rgba(10,10,10,0.2)` | `rgba(255,255,255,0.2)` | Terciaria / fill |
| `--chart-4` | `rgba(10,10,10,0.32)` | `rgba(255,255,255,0.32)` | Cuaternaria |
| `--chart-5` | `rgba(10,10,10,0.24)` | `rgba(255,255,255,0.24)` | Quinaria |
| `--chart-accent` | `#7c3aed` | `#7c3aed` | Acento violeta (siempre igual) |
| `--chart-background` | `transparent` | `transparent` | Fondo chart |
| `--chart-foreground` | `#0a0a0a` | `#ffffff` | Texto/labels |
| `--chart-foreground-muted` | `rgba(10,10,10,0.35)` | `rgba(255,255,255,0.35)` | Labels secundarios |
| `--chart-line-primary` | `var(--chart-1)` | `var(--chart-1)` | Alias línea principal |
| `--chart-line-secondary` | `var(--chart-2)` | `var(--chart-2)` | Alias línea secundaria |
| `--chart-crosshair` | `var(--chart-accent)` | `var(--chart-accent)` | Cursor violeta |
| `--chart-grid` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.06)` | Grilla sutil |
| `--chart-tooltip-background` | `#ffffff` | `#0a0a0a` | Tooltip |
| `--chart-tooltip-foreground` | `#0a0a0a` | `#ffffff` | Texto tooltip |
| `--chart-tooltip-muted` | `rgba(10,10,10,0.55)` | `rgba(255,255,255,0.55)` | Texto secundario tooltip |
| `--chart-marker-background` | `#ffffff` | `#0a0a0a` | Punto marcador |

**Tokens HSL adicionales en `tokens.css`** (series de color para Recharts/multisérie):

| Token | Valor | Hex aprox. |
|-------|-------|------------|
| `--chart-secondary` | `258 91% 76%` | `#C4B5FD` |
| `--chart-tertiary` | `280 70% 60%` | `#A855F7` |
| `--chart-lavender` | `258 45% 72%` | `#A78BFA` |
| `--chart-pink` | `330 70% 65%` | `#F472B6` |
| `--chart-bar-mono` | light: `rgba(0,0,0,0.8)` · dark: `rgba(255,255,255,0.85)` | Barras monocromo |

---

## Tipografía

### Familias (`apps/web/app/layout.tsx`)

| Rol | Fuente | Variable CSS |
|-----|--------|--------------|
| Sans | **Inter** (Google Fonts) | `--font-sans` |
| Mono | **JetBrains Mono** | `--font-mono` |

Fallback: `system-ui, sans-serif` / `monospace`.

### Escala tipográfica (`tokens.css` + `preset.ts`)

| Token / clase | Tamaño | Line-height | Uso |
|---------------|--------|-------------|-----|
| `--text-micro-size` / `text-micro` | `0.6875rem` (11px) | 1.3 | Badges, metadata |
| `--text-caption-size` / `text-caption` | `0.8125rem` (13px) | 1.45 | Labels, captions |
| `--text-body-size` / `text-body` | `0.9375rem` (15px) | 1.5 | Cuerpo (default body) |
| `--text-title-size` / `text-title` | `1.25rem` (20px) | 1.75rem | Títulos de sección |
| `--text-metric-value-size` / `text-metric-value` | `1.75rem` (28px) | 2rem | Valores de métricas |
| `--text-metric-label-size` | `0.8125rem` (13px) | — | Labels de métricas |
| `text-2xs` | `0.625rem` (10px) | 0.875rem | Sidebar labels |

**Peso sidebar items:** `font-[450]` (13.5px). Nav activo: `font-medium`.

### Utilidades de texto (`globals.css`)

- `.text-gradient` — gradiente foreground → muted
- `.text-gradient-ai` — foreground → `#a78bfa`
- `.text-primary-token` / `.text-secondary-token` / `.text-muted-token` — tokens RGB semánticos

---

## Espaciado y radios

### Espaciado de layout (`tokens.css`)

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-shell` | `12px` | Padding shell exterior |
| `--space-shell-gap` | `12px` | Gap sidebar ↔ panel |
| `--space-page-x` | `24px` | Padding horizontal página |
| `--space-page-x-lg` | `32px` | Padding horizontal ≥1024px |
| `--space-page-y` | `28px` | Padding vertical página |
| `--space-card` | `24px` | Padding interno cards |
| `--space-card-sm` | `16px` | Padding compacto |
| `--space-section` | `32px` | Separación entre secciones |
| `--space-sidebar-x` | `12px` | Padding horizontal sidebar |
| `--space-sidebar-item-y` | `8px` | Padding vertical ítems nav |

### Radios (`tokens.css` → Tailwind) — sistema Whop-style proporcional

| Token | Valor | px | Clase Tailwind | Uso |
|-------|-------|----|----------------|-----|
| `--radius-sm` | `0.375rem` | 6px | `rounded-sm` | Tags, badges pequeños |
| `--radius-md` | `0.5rem` | 8px | `rounded-md` | Inputs, botones, elementos chicos |
| `--radius` / `--radius-lg` | `0.75rem` | 12px | `rounded-lg` | **Cards (uso principal)** |
| `--radius-xl` | `1rem` | 16px | `rounded-xl` | Cards grandes, paneles |
| `--radius-2xl` | `1.25rem` | 20px | `rounded-2xl` | Paneles elevados |
| `--radius-page` | `1.25rem` | 20px | `rounded-page` | Shell container |
| `--radius-pill` | `9999px` | — | `rounded-pill` | Nav items, pills |

**Panel principal:** `--shell-panel-radius: var(--radius-page)` (20px).

### Shell

| Token | Valor |
|-------|-------|
| `--shell-sidebar-width` | `220px` |
| `--shell-sidebar-width-collapsed` | `72px` |

---

## Sombras y efectos glass

### Sombras (`tokens.css`) — valores exactos

#### Light

| Token | Valor |
|-------|-------|
| `--shadow-glow` | `0 0 32px -8px rgba(124,58,237,0.2)` |
| `--shadow-card` | `0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)` |
| `--shadow-float` | `0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.04)` |
| `--shadow-modal` | `0 20px 60px rgba(15,23,42,0.15)` |
| `--shadow-panel` | `0 1px 3px rgba(15,23,42,0.05), 0 8px 32px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.06)` |
| `--shadow-band` | `0 1px 2px rgba(15,23,42,0.03), 0 0 0 1px rgba(15,23,42,0.05)` |

#### Dark

| Token | Valor |
|-------|-------|
| `--shadow-glow` | `0 0 48px -8px rgba(124,58,237,0.35)` |
| `--shadow-card` | `0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3)` |
| `--shadow-float` | `0 0 0 1px rgba(255,255,255,0.08), 0 4px 8px rgba(0,0,0,0.25), 0 16px 48px rgba(0,0,0,0.4)` |
| `--shadow-modal` | `0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.7)` |
| `--shadow-panel` | `0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.4)` |
| `--shadow-band` | `0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2)` |

**Clases Tailwind:** `shadow-glow`, `shadow-card`, `shadow-panel`, `shadow-band`, `shadow-float` (via preset.ts)  
**Clases utilitarias:** `.glow-primary` (aplica `shadow-glow`), `.surface-card` (card semántica), `.surface-glass`

### Glass (`globals.css` + `tokens.css`) — fórmula Frosted UI real

#### Tokens glass (valores que cambian entre light y dark)

| Token | Light | Dark |
|-------|-------|------|
| `--glass-bg` | `hsl(var(--card))` = `#FFFFFF` | `rgba(10,10,10,0.88)` |
| `--glass-bg-strong` | `hsl(var(--card))` | `rgba(14,14,14,0.92)` |
| `--glass-bg-nested` | `hsl(var(--muted))` | `rgba(6,6,6,0.85)` |
| `--glass-border-color` | `hsl(var(--border))` = `#E2E8F0` | `rgba(255,255,255,0.07)` |
| `--glass-border-subtle` | `hsl(var(--border))` | `rgba(255,255,255,0.05)` |
| `--glass-blur` | `0px` (sin blur en light) | `20px` |
| `--glass-blur-md` | `0px` | `12px` |

#### Clases de superficie

| Clase | Radio | Fórmula dark blur | Hover |
|-------|-------|-------------------|-------|
| `.glass` | `rounded-lg` (12px) | `blur(20px) saturate(190%) contrast(90%) brightness(80%)` · borde-top `rgba(255,255,255,0.12)` | borde `white/12%` + `shadow-float` |
| `.glass-strong` | `rounded-xl` (16px) | mismo + borde-top `rgba(255,255,255,0.16)` | — |
| `.glass-nested` | `rounded-md` (8px) | `blur(12px)` + inset top `rgba(255,255,255,0.06)` | — |
| `.surface-glass` | `rounded-xl` | igual a `.glass` | `-translate-y-px` + `shadow-float` |
| `.surface-card` | `rounded-xl` | borde `white/8%` + `shadow-card` | `shadow-float` |

**Hover neutral en cards genéricos** (`.glass`, `.surface-glass`): `shadow-float` + borde `white/12%`. **Sin glow violeta** — el violeta es solo para IA.  
**Hover AI** (`.ai-card`): mantiene `shadow-glow` violeta. Intencional: indica elemento IA.

#### Animaciones glass (solo decorativas)

| Clase | Animación | Duración | Uso |
|-------|-----------|----------|-----|
| `.glass-liquid` | Conic-gradient rotatorio violeta (borde externo) | `8s linear infinite` | Elementos IA destacados |
| `.glass-liquid-subtle` | Radial gradients violeta (shimmer suave) | `6s ease-in-out alternate infinite` | `AiCard` |
| `.glass-liquid-border` | Borde conic rotatorio | `4s linear infinite` | Alternativa glass-liquid |

Todas desactivadas con `prefers-reduced-motion`.

---

## Principios de motion

### Duración y easing estándar — curva spring-like (Whop)

| Contexto | Duración | Easing |
|----------|----------|--------|
| Botones / hover | `150ms` | `ease` / `ease-out` |
| **Apertura panels, dialogs, cards enter** | `300ms` | **`cubic-bezier(0.16, 1, 0.3, 1)`** — spring |
| **Cierre / exit** | `150ms` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Sidebar collapse | `200ms` | `ease` |
| Btn press animation | `300ms` | `ease-out` |
| Shimmer skeleton | `2s` | `linear infinite` |
| Pulse glow | `2.5s` | `ease-in-out infinite` |

**CSS token:** `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)` · `--duration-enter: 300ms` · `--duration-exit: 150ms`

### Keyframes existentes (`preset.ts` + `globals.css`)

| Nombre | Clase Tailwind | Efecto | Duración |
|--------|----------------|--------|----------|
| `fade-in` | `animate-fade-in` | opacity 0→1, translateY 8px→0 | `0.3s cubic-bezier(0.16,1,0.3,1)` |
| `shimmer` | `animate-shimmer` | background-position sweep | `2s linear infinite` |
| `pulse-glow` | `animate-pulse-glow` | opacity 0.4↔0.8 | `2.5s ease-in-out infinite` |
| `btn-press` | — (`:active` en `.btn-primary`) | scale 0.97 + ring violeta | `0.3s ease-out` |
| `btn-press-ghost` | — (`:active` en ghost/outline) | scale 0.97 + ring blanco | `0.3s ease-out` |
| `dialog-overlay-show` | `animate-dialog-overlay-show` | opacity 0→1 | `200ms ease-out` |
| `dialog-overlay-hide` | `animate-dialog-overlay-hide` | opacity 1→0 | `150ms ease-out` |
| `dialog-content-show` | `animate-dialog-content-show` | opacity+scale 0.95→1 + translateY | `300ms cubic-bezier(0.16,1,0.3,1)` |
| `dialog-content-hide` | `animate-dialog-content-hide` | opacity+scale inverso | `150ms` |
| `liquid-rotate` | — | conic-gradient rotación | `8s linear infinite` |
| `liquid-shimmer` | — | radial scale/opacity | `6s ease-in-out alternate infinite` |
| `border-rotate` | — | borde conic | `4s linear infinite` |

### Componentes de animación (`@ai-coo/ui`)

| Componente | Uso |
|------------|-----|
| `MetricAnimatedValue` | Números en `.metric-value` / `.metric-stat-value` |
| `StaggerFade` + `StaggerFadeItem` | Listas (inbox, clientes, documentos) |
| `Skeleton` | Shimmer en estados de carga |
| `Spotlight` | Solo `AiCard` insight/recommendation |
| `PageTransition` | Fade al cambiar ruta (layout plataforma) |

### `prefers-reduced-motion`

- `.glass-liquid*` desactiva animaciones CSS
- `StaggerFade`, `AnimatedNumber`, `Spotlight`, `AiCard` respetan `usePrefersReducedMotion`
- `.motion-safe:animate-fade-in` en transiciones de página
- Hover glow sin transform en reduced motion

---

## Componentes `@ai-coo/ui` — API de referencia

### `GlassPanel`

```tsx
import { GlassPanel } from "@ai-coo/ui";

<GlassPanel variant="default" glow={false} className="p-6">
  {/* content */}
</GlassPanel>
```

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `"default" \| "strong" \| "nested"` | `"default"` | Nivel de elevación glass |
| `glow` | `boolean` | `false` | Añade `glow-primary` (sombra violeta) — **solo para elementos IA** |

Aplica: `"default"` → `.glass`, `"strong"` → `.glass-strong`, `"nested"` → `.glass-nested`. Siempre `hover:-translate-y-px`.

---

### `MetricCard`

Card de métrica grande con valor animado, trend pill, sparkline opcional, gráfico de línea de fondo y barra de progreso.

```tsx
import { MetricCard } from "@ai-coo/ui";

<MetricCard
  title="Ingresos totales"
  value="$48.200"
  trend="up"
  trendValue="+12%"
  subtitle="vs mes anterior"
  sparklineData={[20, 35, 28, 45, 38, 52, 48]}
  sparklineColor="hsl(var(--primary))"
  showProgressBar={true}
  progress={72}
  progressVariant="violet"
  badge="Récord"
  glass={false}
  chartData={[10, 20, 15, 30, 25, 40, 35, 48]}
  chartPreviousData={[8, 15, 12, 22, 18, 30, 28, 38]}
  chartStartLabel="1 jun"
  chartEndLabel="Hoy"
  icon={<DollarSign />}
/>
```

| Prop | Tipo | Default |
|------|------|---------|
| `title` | `string` | — |
| `value` | `string \| number` | — |
| `trend` | `"up" \| "down" \| "neutral"` | `"neutral"` |
| `trendValue` | `string` | — |
| `subtitle` | `string` | auto desde `trendValue` |
| `badge` | `string` | — |
| `icon` | `ReactNode` | — |
| `sparklineData` | `number[]` | — |
| `sparklineColor` | `string` | `"hsl(var(--foreground))"` |
| `sparklineAnimationDelay` | `number` | `0` |
| `sparklinePreset` | `MetricSparklinePreset` | — |
| `glass` | `boolean` | `false` |
| `showProgressBar` | `boolean` | `true` |
| `progress` | `number` 0–100 | derivado del valor |
| `progressCaption` | `string` | — |
| `progressVariant` | `"trend" \| "violet"` | `"trend"` |
| `chartData` | `number[]` | — |
| `chartPreviousData` | `number[]` | — |
| `chartStartLabel` | `string` | — |
| `chartEndLabel` | `string` | `"Hoy"` |

**Trend colors:**
- `up`: emerald (pill verde) · barra `from-emerald-500 to-emerald-400`
- `down`: rojo · barra `from-red-500 to-red-400`
- `neutral`: muted · barra `from-foreground/40`
- `progressVariant="violet"`: siempre `from-violet-600 to-violet-400`

---

### `MetricStat`

Versión compacta de `MetricCard`, sin `<Card>` wrapper, para uso en `MetricBand` o layouts densos.  
API idéntica a `MetricCard` con `showProgressBar={false}` por defecto. Usa clases `.metric-stat-value` (32px) y `.metric-stat-label` (13px).

---

### `MetricBand`

Fila horizontal de `MetricStat` con divisores y padding consistente.

```tsx
import { MetricBand, MetricStat } from "@ai-coo/ui";

<MetricBand glass={false}>
  <MetricStat title="Ventas" value="$12.400" trend="up" trendValue="+8%" />
  <MetricStat title="Leads" value="142" trend="neutral" />
  <MetricStat title="Conversión" value="18%" trend="up" trendValue="+2pp" />
</MetricBand>
```

Padding interno: `--space-metric-band-x` (28px) × `--space-metric-band-y` (20px).  
En mobile: flex-col con `divide-y`. En ≥sm: flex-row con `divide-x`.

---

### `AiCard`

Card de insight IA con spotlight, `glass-liquid-subtle`, badge "AI" y animación Framer Motion.

```tsx
import { AiCard } from "@ai-coo/ui";

<AiCard
  title="Oportunidad detectada"
  variant="insight"
  confidence={0.87}
  source="Análisis de conversaciones"
>
  El 68% de las objeciones en closing mencionan precio. Considera agregar un payment plan.
</AiCard>
```

| Prop | Tipo | Default |
|------|------|---------|
| `title` | `string` | `"AI Insight"` |
| `variant` | `"default" \| "insight" \| "recommendation"` | `"default"` |
| `confidence` | `number` 0–1 | — |
| `source` | `string` | — |

- `variant="insight"` y `"recommendation"`: activan `<Spotlight>` sutil
- Siempre usa `.glass-liquid-subtle` (gradientes violeta animados)
- Ícono: `<Sparkles>` violeta (`text-primary dark:text-[#A78BFA]`)
- Badge: `<Badge variant="ai">`

---

### Otros componentes `@ai-coo/ui`

| Componente | Uso principal |
|------------|---------------|
| `MetricAnimatedValue` | Número animado en `MetricCard`/`MetricStat`. Counter al montar. |
| `Sparkline` | Mini line-chart inline SVG (7 puntos). Prop `data`, `color`, `animationDelay`. |
| `DecorativeSparkline` | Sparkline decorativa de fondo en card. Prop `preset` (`"revenue"`, `"conversions"`, etc.) |
| `MetricLineChart` | Gráfico de línea full-width en la base de `MetricCard`. Línea principal + línea anterior gris. |
| `StaggerFade` + `StaggerFadeItem` | Listas con fade escalonado (inbox, clientes, docs). |
| `Skeleton` | Shimmer en estados de carga. Clases `.animate-shimmer`. |
| `Spotlight` | Efecto de luz radial sutil. Solo dentro de `AiCard`. |
| `PageTransition` | Fade al cambiar ruta en `(platform)/layout.tsx`. |
| `SidebarShell` | Shell completo sidebar + panel principal. |
| `NotchedCard` | Card con muesca decorativa superior (notch). Tokens `--notch-*`. |
| `SteppedAlert` | Barra de alerta con steps. Token `--step-alert-*`. |
| `SectionHeader` | Encabezado de sección con título, subtítulo y slot de acciones. |
| `FormField` | Wrapper de field con label, error y descripción. |
| `DataTable` | Tabla con sorting, paginación. Usa Tanstack Table internamente. |
| `BarChart` | Gráfico de barras primitivo de la UI. |

---

## Sidebar (clases `globals.css`)

| Clase | Descripción |
|-------|-------------|
| `.sidebar` | Columna 220px, scroll oculto, transición collapse |
| `.sidebar.collapsed` | 72px, íconos centrados |
| `.sidebar-item` | Nav link 13.5px, `rounded-pill` |
| `.sidebar-item.active` | `bg-accent` (light) / `bg-white/8%` (dark) |
| `.sidebar-subitem` | Sub-nav indentado `pl-[34px]` |
| `.sidebar-section-label` | `text-2xs`, tracking wide |
| `.sidebar-divider` | `h-px bg-black/6%` (dark: `white/6%`) |

---

## Clases de métricas (`globals.css`)

```css
/* Labels */
.metric-label       → font-size: 13px, font-weight: 500, color: muted-foreground
.metric-stat-label  → font-size: 13px, font-weight: 500, color: muted-foreground

/* Valores grandes */
.metric-value       → font-size: 28px (en MetricCard se overridea a 32-36px), semibold, tabular-nums
.metric-stat-value  → font-size: 32px, semibold, tabular-nums

/* Band */
.metric-band        → container con overflow-hidden, rounded-2xl, border, bg-card, shadow-band
.metric-band-cell   → flex-1, min-w-0, padding con tokens band
```

**Regla:** Usar siempre `MetricCard`, `MetricStat` o `MetricBand` de `@ai-coo/ui`. No duplicar las clases manualmente.

---

## Selección de texto

```css
::selection {
  background: rgba(124, 58, 237, 0.35);
  color: hsl(var(--foreground));
}
```

---

## Referencia rápida Tailwind (`preset.ts`)

```ts
// Colores
bg-background / text-foreground
bg-card / text-card-foreground
bg-muted / text-muted-foreground
bg-primary / text-primary / text-primary-foreground
bg-success / bg-warning / bg-destructive / bg-info
border-border / border-input
bg-sidebar / text-sidebar-foreground / bg-sidebar-accent
text-ai / bg-ai / text-ai-glow
bg-surface-1 / bg-surface-2 / bg-surface-3 / bg-surface-4

// Radios
rounded-sm    → 6px
rounded-md    → 8px
rounded-lg    → 12px  (default)
rounded-xl    → 16px
rounded-2xl   → 20px
rounded-page  → 20px  (shell)
rounded-pill  → 9999px

// Tipografía
text-2xs      → 10px
text-caption  → 13px / lh 1.45
text-body     → 15px / lh 1.5  (default)
text-micro    → 11px / lh 1.3
text-title    → 20px / lh 1.75rem
text-metric-value → 28px / lh 2rem

// Sombras
shadow-glow   → var(--shadow-glow)
shadow-card   → var(--shadow-card)
shadow-panel  → var(--shadow-panel)
shadow-band   → var(--shadow-band)

// Spacing extra
gap-4.5 / p-4.5  → 1.125rem (18px)
w-13 / h-13      → 3.25rem  (52px)
w-18 / h-18      → 4.5rem   (72px)

// Animaciones
animate-fade-in
animate-shimmer
animate-pulse-glow
animate-dialog-content-show / animate-dialog-content-hide
animate-dialog-overlay-show / animate-dialog-overlay-hide
```

---

## Patrones de uso frecuente

### Card estándar
```tsx
// Glass panel (dark: blur, light: sólido)
<GlassPanel className="p-6 rounded-xl">...</GlassPanel>

// Card Shadcn directa
<Card className="rounded-xl shadow-card">
  <CardContent className="p-6">...</CardContent>
</Card>
```

### Badge / pill de estado
```tsx
// Éxito / positivo
<span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-[3px] text-[11px] font-medium text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-400">
  <TrendingUp className="h-3 w-3" /> +12%
</span>

// Primario/violeta
<span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-micro font-medium text-primary dark:text-[#A78BFA]">
  Nuevo
</span>
```

### Texto gradiente IA
```tsx
<h2 className="text-gradient-ai font-semibold">Análisis IA</h2>
```

### Focus-visible estándar
```tsx
// El ring usa --ring = #7C3AED
// Tailwind: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

---

*Última actualización: agosto 2026. Extraído de tokens.css, preset.ts, layout.tsx, globals.css, packages/ui/src/components.*
