"use client";

/**
 * ⭐ El diálogo de baja: mostrar primero, confirmar después.
 *
 * Dos decisiones que no son estéticas:
 *
 * 1. **El alcance se calcula al abrir, no al confirmar.** Se le pregunta al
 *    servidor qué se va a llevar puesto y se muestra antes de habilitar nada.
 *    Autorizar algo sin saber su alcance es el mismo click automático que un
 *    "¿estás seguro? Sí".
 *
 * 2. **Hay que escribir el nombre exacto.** Un botón rojo se aprieta sin leer;
 *    un nombre hay que tipearlo mirándolo. Es la única fricción que funciona
 *    para algo que no tiene deshacer.
 *
 * Y cuando la baja queda a medias —un archivo que no se pudo borrar, un login
 * que sigue vivo— eso se muestra tal cual. Un "listo" verde sobre una baja
 * parcial es peor que un error.
 */

import { useEffect, useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { MutationResult } from "@/lib/server/action-result";
import type { VistaPreviaDeBaja } from "@/app/super-admin/delete-actions";
import type { ResultadoDeBaja } from "@/lib/super-admin/execute-deletion";
import { confirmacionValida } from "@/lib/super-admin/deletion-plan";

export function DeletionDialog({
  open,
  onOpenChange,
  titulo,
  cargarVistaPrevia,
  ejecutar,
  onEliminado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  cargarVistaPrevia: () => Promise<MutationResult<VistaPreviaDeBaja>>;
  ejecutar: (confirmacion: string) => Promise<MutationResult<ResultadoDeBaja>>;
  onEliminado?: (resultado: ResultadoDeBaja) => void;
}) {
  const [vistaPrevia, setVistaPrevia] = useState<VistaPreviaDeBaja | null>(null);
  const [cargando, setCargando] = useState(false);
  const [escrito, setEscrito] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parcial, setParcial] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setVistaPrevia(null);
      setEscrito("");
      setError(null);
      setParcial(null);
      return;
    }

    let vigente = true;
    setCargando(true);
    void cargarVistaPrevia().then((resultado) => {
      if (!vigente) return;
      setCargando(false);
      if (!resultado.success) {
        setError(resultado.error);
        return;
      }
      setVistaPrevia(resultado.data);
    });

    return () => {
      vigente = false;
    };
    // `cargarVistaPrevia` se recrea en cada render del padre; depender de ella
    // volvería a pedir el alcance en loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const puedeConfirmar =
    vistaPrevia !== null &&
    !vistaPrevia.bloqueada &&
    confirmacionValida(escrito, vistaPrevia.confirmacionEsperada);

  function confirmar() {
    if (!puedeConfirmar) return;
    setError(null);
    startTransition(async () => {
      const resultado = await ejecutar(escrito);
      if (!resultado.success) {
        setError(resultado.error);
        return;
      }
      if (resultado.data.problemas.length > 0) {
        // La fila se borró, pero algo quedó. Se dice, no se festeja.
        setParcial(resultado.data.problemas);
        return;
      }
      onOpenChange(false);
      onEliminado?.(resultado.data);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            {titulo}
          </DialogTitle>
          <DialogDescription>
            Esto no se puede deshacer. No hay papelera ni copia de seguridad.
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculando qué se va a borrar…
          </p>
        ) : null}

        {parcial ? (
          <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
            <p className="text-sm font-medium">La baja quedó a medias.</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {parcial.map((problema, indice) => (
                <li key={indice}>{problema}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              La fila se borró, pero eso de arriba quedó. Está registrado en el
              historial de bajas.
            </p>
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
              Entendido
            </Button>
          </div>
        ) : null}

        {vistaPrevia && !parcial ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-sm font-medium">{vistaPrevia.nombre}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {vistaPrevia.conteo.perfiles}{" "}
                {vistaPrevia.conteo.perfiles === 1 ? "persona" : "personas"} ·{" "}
                {vistaPrevia.conteo.clientes} clientes ·{" "}
                {vistaPrevia.conteo.archivos} archivos
              </p>
            </div>

            {vistaPrevia.advertencias.map((aviso) => (
              <p
                key={aviso.clave}
                className={`flex items-start gap-2 text-sm ${
                  aviso.bloquea ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {aviso.texto}
              </p>
            ))}

            {!vistaPrevia.bloqueada ? (
              <div className="space-y-2">
                <Label htmlFor="confirmacion-de-baja">
                  Escribí{" "}
                  <span className="font-mono text-foreground">
                    {vistaPrevia.confirmacionEsperada}
                  </span>{" "}
                  para confirmar
                </Label>
                <Input
                  id="confirmacion-de-baja"
                  value={escrito}
                  autoComplete="off"
                  onChange={(evento) => setEscrito(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" && puedeConfirmar) confirmar();
                  }}
                />
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!puedeConfirmar || pending}
                onClick={confirmar}
              >
                {pending ? "Dando de baja…" : "Eliminar definitivamente"}
              </Button>
            </div>
          </div>
        ) : null}

        {error && !vistaPrevia && !cargando ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
