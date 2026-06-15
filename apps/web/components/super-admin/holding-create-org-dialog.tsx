"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { createOrganizationFromHoldingAction } from "@/app/super-admin/actions";

type Plan = "basic" | "pro";

export function HoldingCreateOrgDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [plan, setPlan] = useState<Plan>("basic");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setFounderEmail("");
    setPlan("basic");
    setError(null);
    setSuccess(false);
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createOrganizationFromHoldingAction({
        name,
        founderEmail,
        plan,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva organización</Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva organización</DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="space-y-4 text-sm">
              <p className="font-medium text-emerald-600">
                Organización creada. Se envió el email de bienvenida al founder.
              </p>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holding-org-name">Nombre de la organización</Label>
                <Input
                  id="holding-org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Acme Coaching"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holding-founder-email">Email del founder</Label>
                <Input
                  id="holding-founder-email"
                  type="email"
                  value={founderEmail}
                  onChange={(e) => setFounderEmail(e.target.value)}
                  required
                  placeholder="founder@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holding-plan">Plan</Label>
                <select
                  id="holding-plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as Plan)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="basic">Básico</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creando…" : "Crear"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
