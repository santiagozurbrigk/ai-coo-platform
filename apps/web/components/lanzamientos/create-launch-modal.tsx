"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@ai-coo/ui";
import {
  createLaunchAction,
  getProductsForLaunchAction,
} from "@/app/lanzamientos/actions";
import type { LaunchSummary } from "@/types/launches";

export function CreateLaunchModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (launch: LaunchSummary) => void;
}) {
  const [products, setProducts] = useState<
    { id: string; name: string; type: string | null }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    description: "",
    launchDate: "",
    endDate: "",
    goalRevenue: "",
    goalClients: "",
    productId: "",
  });

  useEffect(() => {
    if (!open) return;
    getProductsForLaunchAction().then(setProducts);
  }, [open]);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      launchDate: "",
      endDate: "",
      goalRevenue: "",
      goalClients: "",
      productId: "",
    });
    setError(null);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const launch = await createLaunchAction({
          name: form.name,
          description: form.description || undefined,
          launchDate: form.launchDate || undefined,
          endDate: form.endDate || undefined,
          goalRevenue: form.goalRevenue
            ? Number(form.goalRevenue)
            : undefined,
          goalClients: form.goalClients
            ? Number(form.goalClients)
            : undefined,
          productId: form.productId || undefined,
        });
        onCreated(launch);
        resetForm();
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo crear el lanzamiento.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo lanzamiento</DialogTitle>
          <DialogDescription>
            Definí objetivos, fechas y producto para organizar el trabajo del equipo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="launch-name">Nombre</Label>
            <Input
              id="launch-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Lanzamiento junio 2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="launch-desc">Descripción</Label>
            <Textarea
              id="launch-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="launch-start">Fecha de lanzamiento</Label>
              <Input
                id="launch-start"
                type="date"
                value={form.launchDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, launchDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="launch-end">Fecha de cierre</Label>
              <Input
                id="launch-end"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="launch-revenue">Objetivo revenue (USD)</Label>
              <Input
                id="launch-revenue"
                type="number"
                min={0}
                value={form.goalRevenue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goalRevenue: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="launch-clients">Objetivo clientes</Label>
              <Input
                id="launch-clients"
                type="number"
                min={0}
                value={form.goalClients}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goalClients: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="launch-product">Producto vinculado</Label>
            <select
              id="launch-product"
              value={form.productId}
              onChange={(e) =>
                setForm((f) => ({ ...f, productId: e.target.value }))
              }
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <option value="">Sin producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                  {product.type ? ` (${product.type})` : ""}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={handleSubmit}>
            {pending ? "Creando…" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
