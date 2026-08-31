import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * El middleware corre en todo salvo assets estáticos.
   *
   * `opengraph-image`, `twitter-image`, `icon` y `apple-icon` se listan aparte
   * porque las rutas de metadata de Next **no tienen extensión** y por lo tanto
   * el filtro de extensiones de abajo no las agarra. Sin esto el middleware las
   * trata como ruta protegida y las redirige a /login: los crawlers sociales
   * reciben un HTML de login en vez de la imagen y el preview del link no carga.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|icon|apple-icon|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
