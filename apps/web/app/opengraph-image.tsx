import { ImageResponse } from "next/og";
import { brand, brandColors } from "@/lib/brand";

export const alt = `${brand.name} — ${brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Preview social (Open Graph / Twitter). Se prerenderiza en build.
 *
 * ⭐ El logo se lee con `new URL(..., import.meta.url)` y **no** desde
 * `public/`. Antes se leía del disco con `process.cwd()`, y eso anda en
 * desarrollo pero no en producción: `public/` no viaja dentro de la función
 * serverless, así que la ruta reventaba con "no such file or directory" y las
 * vistas previas de los links compartidos quedaban rotas. Con `import.meta.url`
 * el empaquetador incluye el archivo en el bundle.
 *
 * El lockup se embebe como data URI porque Satori no resuelve rutas de /public.
 * El texto va en la tipografía por defecto del renderer: Satori no soporta WOFF2
 * y las fuentes de `next/font` se sirven en ese formato, así que la carga de
 * marca la aporta el logotipo, que ya trae el wordmark real.
 */
export default async function OpengraphImage() {
  // Si por lo que sea el logo no está, la preview sale sin él. Una imagen sin
  // logotipo es mejor que un 500 que deja el link sin ninguna preview.
  let logoSrc: string | null = null;
  try {
    const logo = await fetch(new URL("./opengraph-logo.png", import.meta.url)).then(
      (respuesta) => respuesta.arrayBuffer()
    );
    logoSrc = `data:image/png;base64,${Buffer.from(logo).toString("base64")}`;
  } catch {
    logoSrc = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: brandColors.black,
          padding: "72px 80px",
        }}
      >
        {/* Barra de acento — el naranja es el único color de marca */}
        <div
          style={{
            display: "flex",
            width: 96,
            height: 8,
            background: brandColors.primary,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- Satori solo acepta <img>
            <img src={logoSrc} alt={brand.name} width={520} height={62} />
          ) : (
            <div style={{ display: "flex", fontSize: 64, color: brandColors.white }}>
              {brand.name}
            </div>
          )}
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 46,
              lineHeight: 1.25,
              color: brandColors.white,
              maxWidth: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {brand.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: 5,
              background: brandColors.primary,
            }}
          />
          {brand.domain}
        </div>
      </div>
    ),
    size
  );
}
