"use client";

/**
 * Cambiar la contraseña desde Configuración.
 *
 * ⭐ **La contraseña actual se verifica de verdad.**
 *
 * `updateUser({ password })` de Supabase no la pide: con la sesión abierta,
 * cambia la contraseña y listo. Poner un campo "contraseña actual" que no se
 * comprueba es peor que no ponerlo — le dice al usuario que hay una barrera
 * donde no la hay, justo frente al riesgo que ese campo debería cubrir: alguien
 * que se sienta en una sesión abierta.
 *
 * Así que antes de cambiarla se reintenta el login con la actual. Se eligió
 * esto y no el "Secure password change" del panel de Supabase porque no depende
 * de un interruptor en un tablero que nadie recuerda haber tocado.
 */

import { useState, useTransition } from "react";
import { Button, FormField, Input, SectionHeader } from "@ai-coo/ui";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/providers/toast-provider";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations";

export function ChangePasswordSection({ email }: { email: string }) {
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setActual("");
    setNueva("");
    setRepetida("");
  }

  function cambiar() {
    setError(null);

    if (nueva.length < PASSWORD_MIN_LENGTH) {
      setError(`La contraseña nueva necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }
    if (nueva !== repetida) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }
    if (nueva === actual) {
      setError("La contraseña nueva es igual a la actual.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      // ⭐ La verificación real de la contraseña actual.
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: actual,
      });
      if (loginError) {
        setError("La contraseña actual no es correcta.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: nueva,
      });
      if (updateError) {
        setError("No se pudo cambiar la contraseña. Probá de nuevo.");
        return;
      }

      limpiar();
      push({ title: "Contraseña actualizada", variant: "success" });
    });
  }

  const completo = actual !== "" && nueva !== "" && repetida !== "";

  return (
    <section>
      <SectionHeader icon={KeyRound} title="Contraseña" variant="settings" />
      <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 px-4 py-4 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
        <FormField label="Contraseña actual">
          <Input
            type="password"
            autoComplete="current-password"
            value={actual}
            onChange={(event) => setActual(event.target.value)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Contraseña nueva">
            <Input
              type="password"
              autoComplete="new-password"
              value={nueva}
              onChange={(event) => setNueva(event.target.value)}
            />
          </FormField>
          <FormField label="Repetir la nueva">
            <Input
              type="password"
              autoComplete="new-password"
              value={repetida}
              onChange={(event) => setRepetida(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && completo) cambiar();
              }}
            />
          </FormField>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button size="sm" disabled={!completo || pending} onClick={cambiar}>
          {pending ? "Cambiando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </section>
  );
}
