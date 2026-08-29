"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@ai-coo/ui";
import { createFunnelInstanceAction } from "@/app/funnels/actions";
import { useToast } from "@/providers/toast-provider";
import { paths } from "@/routes/paths";

export type FunnelTemplateOption = {
  id: string;
  label: string;
  description: string;
  badge: string;
  stepCount: number;
};

/**
 * Alta de una instancia de embudo.
 *
 * El price point es obligatorio a propósito: el documento fuente prohíbe
 * comparar una oferta de $27 con una de $5k, así que forma parte de la identidad
 * del embudo y no de una configuración opcional.
 */
export function FunnelCreateForm({ templates }: { templates: FunnelTemplateOption[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();

  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [name, setName] = useState("");
  const [pricePoint, setPricePoint] = useState("");
  const [currency, setCurrency] = useState("USD");

  const selected = templates.find((t) => t.id === templateId);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      push({ title: "Poné un nombre para el embudo" });
      return;
    }

    startTransition(async () => {
      const result = await createFunnelInstanceAction({
        templateId,
        name,
        currency,
        pricePoint: Number(pricePoint) || 0,
      });

      if (!result.ok) {
        push({ title: "No se pudo crear el embudo", description: result.error });
        return;
      }

      push({ title: "Embudo creado", variant: "success" });
      router.push(paths.platform.funnels.detail(result.id));
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass"
    >
      <div className="space-y-2">
        <Label htmlFor="funnel-template">Tipo de embudo</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateId(template.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                templateId === template.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-medium">{template.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{template.badge}</p>
              <p className="mt-1 text-xs text-muted-foreground">{template.stepCount} pasos</p>
            </button>
          ))}
        </div>
        {selected ? (
          <p className="text-xs text-muted-foreground">{selected.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="funnel-name">Nombre</Label>
          <Input
            id="funnel-name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Mentoría high-ticket"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="funnel-price">Precio de la oferta</Label>
          <Input
            id="funnel-price"
            type="number"
            min="0"
            value={pricePoint}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPricePoint(e.target.value)}
            placeholder="5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="funnel-currency">Moneda</Label>
          <Input
            id="funnel-currency"
            value={currency}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value)}
            placeholder="USD"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        El precio define con qué otros embudos es comparable. No se comparan ofertas de
        rangos distintos.
      </p>

      <Button type="submit" disabled={isPending || !templateId}>
        {isPending ? "Creando…" : "Crear embudo"}
      </Button>
    </form>
  );
}
