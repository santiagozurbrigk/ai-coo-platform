import Link from "next/link";
import { KeyRound } from "lucide-react";
import { tryRequireOrganizationId } from "@/lib/auth/bootstrap";
import { loadOrgCredentialState } from "@/lib/ai/credential-resolver";
import { paths } from "@/routes";

/**
 * El cartel que avisa que la clave de IA de la organización dejó de funcionar.
 *
 * ⭐ Existe porque este problema era **invisible desde adentro del producto**.
 * La organización `familiayformacion` estuvo con su clave rechazada desde julio:
 * 12 llamadas fallando con `401` cada diez minutos, el análisis sin correr, y en
 * su pantalla no decía nada. La única forma de enterarse era abrir los registros
 * del servidor en Vercel — o sea, nadie.
 *
 * ⭐ No se puede cerrar, a propósito. Un aviso que se descarta desaparece para
 * siempre y el problema sigue: mientras la clave esté vencida, las funciones de
 * IA de esa cuenta están degradadas, y eso vale la molestia de la barra.
 *
 * Es un Server Component: se resuelve con la sesión de quien mira y no agrega
 * nada al bundle del navegador.
 */
export async function AvisoClaveIa({ esFounder }: { esFounder: boolean }) {
  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return null;

  let estado: Awaited<ReturnType<typeof loadOrgCredentialState>>;
  try {
    estado = await loadOrgCredentialState(organizationId);
  } catch {
    // Un aviso no puede tirar abajo la plataforma entera.
    return null;
  }

  if (estado.apiKeyStatus !== "invalid") return null;

  return (
    <div className="border-b border-destructive/25 bg-destructive/10 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1">
        <KeyRound className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-foreground">
          <span className="font-medium">
            La clave de inteligencia artificial de tu cuenta dejó de funcionar.
          </span>{" "}
          <span className="text-muted-foreground">
            Hasta que se actualice, el análisis de llamadas, los reportes y el
            agente pueden no generarse.
          </span>
        </p>

        {/*
          El link va sólo para quien puede arreglarlo. Mandar a Ajustes a alguien
          sin acceso es ofrecerle una puerta cerrada.
        */}
        {esFounder ? (
          <Link
            href={paths.platform.settingsTab("ia")}
            className="ml-auto shrink-0 text-sm font-medium text-destructive underline underline-offset-4 hover:opacity-80"
          >
            Actualizar la clave
          </Link>
        ) : (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            Avisale a quien administra la cuenta.
          </span>
        )}
      </div>
    </div>
  );
}
