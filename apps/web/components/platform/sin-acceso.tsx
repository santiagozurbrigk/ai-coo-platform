import { Lock } from "lucide-react";

/**
 * Lo que ve alguien que llega a una pantalla que su rol no incluye.
 *
 * Se muestra la pantalla en lugar de redirigir: un redirect a `/dashboard`
 * desde alguien que tampoco tiene `dashboard` sería un loop, y además esconde
 * lo que pasó. Acá el mensaje dice qué falta y a quién pedírselo.
 */
export function SinAcceso({ moduleLabel }: { moduleLabel: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-muted/40">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-medium text-foreground">
        No tenés acceso a {moduleLabel}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Tu rol no incluye este módulo. Si necesitás entrar, pedile a quien
        administra el equipo que te habilite {moduleLabel} desde Equipo → Roles.
      </p>
    </div>
  );
}
