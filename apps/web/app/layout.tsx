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

export const metadata: Metadata = {
  title: {
    template: `${brand.name} | %s`,
    default: brand.name,
  },
  description: brand.tagline,
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
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
