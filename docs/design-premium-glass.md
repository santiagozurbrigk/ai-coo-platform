# Premium Glass UI (rama experimental)

Estética **Dark Premium Glassmorphism SaaS** inspirada en Linear, Raycast y Framer.

## Ver el nuevo diseño

```bash
git fetch origin
git checkout design/premium-glass-ui
pnpm dev   # desde apps/web o raíz del monorepo
```

## Volver al diseño actual (main)

```bash
git checkout main
```

No hace falta revertir commits: `main` queda intacto hasta que decidas mergear.

## Aprobar y mergear

Cuando estés conforme:

```bash
git checkout main
git merge design/premium-glass-ui
git push origin main
```

## Qué cambia (solo visual)

- **Tokens** (`packages/ui/src/styles/tokens.css`): paleta oscura `#0B0B0F`, sombras cinematográficas, blur 20px, radius 28px cards / 18px inputs / 16px botones.
- **Layout shell** (`apps/web/app/globals.css`): grid de fondo, glass utilities, panel principal flotante.
- **Primitivos UI** (`packages/ui/src/primitives/*`): Button, Input, Card, Dialog, Dropdown, Tabs.
- **Sin cambios de estructura**: mismos componentes, rutas y layouts.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `packages/ui/src/styles/tokens.css` | Colores, sombras, radius, glass |
| `apps/web/app/globals.css` | Shell, sidebar, utilidades glass |
| `packages/config/tailwind/preset.ts` | Radius y timing Tailwind |
| `packages/ui/src/primitives/*.tsx` | Superficies interactivas |
