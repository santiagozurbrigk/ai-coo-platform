# Assets de marca — Limitless

Next.js sirve estos archivos desde la raíz del sitio. Las rutas salen de
`apps/web/lib/brand.ts` (`brandAssets`) — **no hardcodear rutas en JSX**.

## Archivos

| Archivo | Uso |
|---------|-----|
| `logo-light.png` | Lockup horizontal negro — fondos claros |
| `logo-dark.png` | Lockup horizontal blanco — fondos oscuros |
| `isotipo-light.svg` | Isotipo negro — fondos claros |
| `isotipo-dark.svg` | Isotipo blanco — fondos oscuros |
| `isotipo-naranja.svg` | Isotipo en Naranja Vibrant `#E15D12` |

El favicon vive en `apps/web/app/icon.svg` (cuadrado naranja + marca blanca).

## Por qué hay par light/dark

El manual presenta el logotipo en monocromo: negro sobre fondos claros, blanco
sobre oscuros. `AppLogo` y `AppBrandHeader` renderizan las dos versiones y las
alternan con `dark:hidden` / `hidden dark:block`. El script de tema en
`layout.tsx` fija la clase `.dark` antes del primer paint, así que no parpadea.

## Por qué el lockup es PNG y el isotipo SVG

Los SVG originales del lockup (`PRINCIPAL`, `SECUNDARIO`, `NOMBRE`) traen el
wordmark como `<text>` vivo con `font-family: Manrope-Light` — **no está
vectorizado**. En un navegador sin Manrope cargada renderiza con otra fuente y el
logo sale mal. Por eso el lockup se sirve como PNG recortado (1764×210, ~14 KB) y
solo el isotipo, que sí es path puro, va en SVG.

Si en algún momento hace falta el lockup en vectorial, hay que convertir el texto
a curvas en el archivo original antes de usarlo.

## Proporciones

El lockup es muy apaisado (≈8.4:1). Limitarlo **por ancho**, nunca por alto, o
desborda su contenedor. Los presets de `AppLogo` ya lo contemplan.

## Fuente original

El material completo de identidad (incluido el manual de marca en PDF) está en la
rama `brand-source`, fuera de `main` para no cargar el historial con 58 MB.
