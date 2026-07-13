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

## Paleta de colores

### Light (`:root`)

| Token | HSL | Hex aprox. | Uso |
|-------|-----|------------|-----|
| `--background` | `210 40% 98%` | `#F8FAFC` | Fondo app |
| `--foreground` | `0 0% 4%` | `#0A0A0A` | Texto principal |
| `--card` | `0 0% 100%` | `#FFFFFF` | Paneles, cards |
| `--muted` | `210 40% 96%` | `#F1F5F9` | Fondos secundarios |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Texto secundario |
| `--primary` | `258 84% 58%` | `#7C3AED` | **Acento marca** |
| `--primary-light` | `258 91% 76%` | `#C4B5FD` | Highlights |
| `--primary-subtle` | `250 100% 97%` | `#F5F3FF` | Fondos acento suaves |
| `--primary-glow` | `258 60% 45%` | `#5B21B6` | Glow / sombras violeta |
| `--success` | `142 76% 36%` | `#16A34A` | Positivo |
| `--warning` | `32 95% 44%` | `#D97706` | Alerta |
| `--destructive` | `0 72% 51%` | `#DC2626` | Error |
| `--info` | `199 89% 48%` | `#0EA5E9` | Informativo |
| `--border` | `214 32% 91%` | `#E2E8F0` | Bordes |
| `--ring` | `258 84% 58%` | `#7C3AED` | Focus ring |
| `--ai` | `258 84% 58%` | `#7C3AED` | Elementos IA |
| `--ai-glow` | `258 91% 76%` | `#C4B5FD` | Glow IA |

**Body light:** `background: rgb(241 245 249)` (`#F1F5F9`).

### Dark (`.dark`)

| Token | HSL | Hex aprox. | Uso |
|-------|-----|------------|-----|
| `--background` | `0 0% 4%` | `#0A0A0A` | Fondo app |
| `--foreground` | `0 0% 100%` | `#FFFFFF` | Texto principal |
| `--card` | `0 0% 10%` | `#1A1A1A` | Paneles |
| `--muted` | `0 0% 7%` | `#121212` | Inset |
| `--muted-foreground` | `0 0% 50%` | `#808080` | Texto secundario |
| `--primary` | `258 84% 58%` | `#7C3AED` | **Acento marca** |
| `--border` | `0 0% 17%` | `#2B2B2B` | Bordes sutiles |
| `--sidebar-foreground-active` | `258 91% 76%` | `#C4B5FD` | Nav activo |

**Body dark:** `background: #0a0a0a`.

### Superficies semánticas (`globals.css`)

| Variable | Light | Dark |
|----------|-------|------|
| `--color-surface-1` | `241 245 249` | `10 10 10` |
| `--color-surface-2` | `255 255 255` | `26 26 26` |
| `--color-surface-3` | `255 255 255` | `34 34 34` |
| `--color-accent` | `124 58 237` | `124 58 237` |

### Charts

- Acento chart: `#7c3aed` (`--chart-accent`)
- Light: líneas en negro con opacidades; dark: blanco con opacidades
- Tokens HSL chart en `tokens.css`: `--chart-secondary`, `--chart-tertiary`, `--chart-lavender`, `--chart-pink`

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

### Sombras (`tokens.css`)

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-glow` | `0 0 32px -8px rgba(124,58,237,0.2)` | `0 0 48px -8px rgba(124,58,237,0.35)` |
| `--shadow-card` | Sombra slate suave | Borde `white/6%` + sombra negra |
| `--shadow-float` | Elevación media | Borde + sombra profunda |
| `--shadow-panel` | Panel principal | Panel dark |
| `--shadow-band` | Banda métricas | Banda dark |

Clases: `.glow-primary`, `.surface-card`, `.shadow-glow`, `.shadow-card`, `.shadow-panel`, `.shadow-band`.

### Glass (`globals.css` + `tokens.css`) — fórmula Frosted UI real

| Clase | Comportamiento |
|-------|----------------|
| `.glass` | Fondo glass, borde, `shadow-card`; dark: `blur(20px) saturate(190%) contrast(90%) brightness(80%)` |
| `.glass-strong` | Elevación mayor, `rounded-xl` |
| `.glass-nested` | Superficie anidada, `blur(12px)` |
| `.surface-glass` | Card `rounded-xl`; hover: lift + `shadow-float` neutro |
| `.glass-liquid` | Borde animado conic-gradient violeta (8s) |
| `.glass-liquid-subtle` | Radial gradients violeta (6s alternate) |
| `.glass-liquid-border` | Borde rotatorio conic (4s) |

**Hover neutral en cards genéricos:** `.glass`, `.surface-glass` → `shadow-float` + borde `white/12%`. Sin glow violeta.
**Hover AI:** `.ai-card` → mantiene `shadow-glow` violeta (intencional, solo en elementos IA).

**Glass tokens dark:**
- `--glass-bg`: `rgba(26,26,26,0.82)` — panel visible (Whop: gray-2 @ 82%)
- `--glass-bg-strong`: `rgba(34,34,34,0.88)` — elevado
- `--glass-bg-nested`: `rgba(18,18,18,0.75)` — anidado
- `--glass-border-color`: `rgba(255,255,255,0.08)`
- `--glass-blur`: `20px`

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

| Nombre | Clase Tailwind | Efecto |
|--------|----------------|--------|
| `fade-in` | `animate-fade-in` | opacity 0→1, translateY 8px→0 (0.2s) |
| `shimmer` | `animate-shimmer` | background-position sweep |
| `pulse-glow` | `animate-pulse-glow` | opacity pulse |
| `btn-press` | — | scale + ring violeta en botones primarios |
| `btn-press-ghost` | — | scale + ring blanco en ghost/outline |
| `liquid-rotate` | — | rotación conic glass-liquid |
| `liquid-shimmer` | — | scale/opacity glass-liquid-subtle |
| `border-rotate` | — | rotación borde glass-liquid-border |

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

## Clases de métricas

```css
.metric-label / .metric-stat-label  → 13px, medium, muted
.metric-value / .metric-stat-value  → 28px/32px, semibold, tabular-nums
```

Usar siempre `MetricCard`, `MetricStat` o `MetricBand` de `@ai-coo/ui` — no duplicar estilos.

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
colors.primary     → hsl(var(--primary))
colors.ai.glow     → hsl(var(--ai-glow))
borderRadius.page  → var(--radius-page)
fontFamily.sans    → var(--font-sans)
fontSize.metric-value → var(--text-metric-value-size)
boxShadow.glow     → var(--shadow-glow)
```

---

*Última extracción: tokens.css, preset.ts, layout.tsx, globals.css en el repo OTC.*
