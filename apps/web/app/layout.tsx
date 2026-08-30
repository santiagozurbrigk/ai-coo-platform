import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";
import { brand } from "@/lib/brand";

/**
 * Tipografía de marca (manual Limitless, sección 07):
 *   - Neue Haas Grotesk — títulos. Licencia comercial (Monotype), no disponible
 *     todavía: `--font-display` cae en Inter hasta que se compre. Para cambiarla,
 *     cargarla con `next/font/local` y asignarla a `--font-display`; ningún
 *     componente necesita tocarse.
 *   - Inter — texto corrido. Es la que ya usaba la app.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;

/**
 * Base para resolver las URLs absolutas de las imágenes sociales. Sin esto
 * Next las resuelve contra http://localhost:3000 y el preview no carga al
 * compartir el link.
 */
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

export const metadata: Metadata = {
  ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
  title: {
    template: `${brand.name} | %s`,
    default: brand.name,
  },
  description: brand.tagline,
  // El favicon sale de app/icon.svg y app/apple-icon.png (convención de Next).
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: brand.name,
    description: brand.tagline,
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
