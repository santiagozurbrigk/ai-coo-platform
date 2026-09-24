# AI COO Design System

**Phase 0.2** — Dark mode only. Package: `@ai-coo/ui`

## References

Linear · Attio · Stripe · Raycast · Vercel · Arc Browser

## Tokens

Import in app globals:

```css
@import "@ai-coo/ui/styles/tokens.css";
```

Semantic colors: `background`, `foreground`, `card`, `primary`, `ai`, `success`, `warning`, `destructive`, `sidebar-*`

Utilities: `.glass`, `.glass-strong`, `.glow-primary`, `.text-gradient-ai`, `.surface-card`

## Primitives

Button · Badge · Card · Input · Label · Textarea · Separator · Skeleton · Table · Dialog · Tabs · Tooltip · Typography (Heading, Text, Caption, Mono)

## Composite

| Component | Use |
|-----------|-----|
| `MetricCard` | Dashboard KPIs |
| `AiCard` | Insights, recommendations |
| `BarChart` | Trend visualization (CSS) |
| `DataTable` | Lists with semantic table |
| `FormField` | Label + input groups |
| `GlassPanel` | Elevated / AI surfaces |
| `SidebarShell` | App navigation chrome |
| `Topbar` | Page header + actions |

## Showcase

Run dev server and open `/design-system`.

## Build order

0.2 Design System ✓ → … → 0.7 UX flows ✓ → **0.8 Phase 0 complete** (`/demo`, `docs/PHASE_0.md`)

## Global layout (0.3)

- `PlatformShell` — sidebar + topbar + scrollable main + context panel
- Context panel visible `xl+`; sidebar `md+`; mobile drawer via hamburger
- `getPageMeta(pathname)` drives topbar titles
