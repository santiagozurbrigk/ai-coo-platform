"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Textarea,
} from "@ai-coo/ui";
import { saveProductAction } from "@/app/product/actions";
import { useToast } from "@/providers/toast-provider";
import type { ProductAvatar, ProductOffer } from "@/types/product";

const PRODUCT_TYPES = [
  "curso",
  "mentoria",
  "consultoria",
  "comunidad",
  "evento",
  "otro",
] as const;

const BILLING_TYPES = ["unico", "mensual", "anual", "personalizado"] as const;

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProductOfferDialog({
  open,
  onOpenChange,
  offer,
  avatars,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer?: ProductOffer | null;
  avatars: ProductAvatar[];
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(offer?.name ?? "");
  const [description, setDescription] = useState(offer?.promise ?? "");
  const [type, setType] = useState<string>("curso");
  const [price, setPrice] = useState(String(offer?.price ?? ""));
  const [billingType, setBillingType] = useState<string>("unico");
  const [ladderPosition, setLadderPosition] = useState("1");
  const [guarantee, setGuarantee] = useState(offer?.guarantee ?? "");
  const [bonuses, setBonuses] = useState(
    offer?.includes.map((i) => i.title).join("\n") ?? ""
  );
  const [targetAvatarId, setTargetAvatarId] = useState("");

  const selectClass =
    "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveProductAction({
        id: offer?.id,
        name,
        description,
        type,
        price: price ? Number(price) : undefined,
        billingType,
        valueLadderPosition: Number(ladderPosition) || 1,
        guarantee: guarantee || undefined,
        bonuses: linesToArray(bonuses),
        targetAvatarId: targetAvatarId || undefined,
        isActive: true,
      });

      if (!result.success) {
        push({ title: "Error", description: result.error });
        return;
      }

      push({ title: "Producto guardado", variant: "success" });
      onOpenChange(false);
      onSaved();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Nombre" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Descripción / promesa">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </FormField>
          <FormField label="Tipo">
            <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Precio">
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </FormField>
            <FormField label="Facturación">
              <select
                className={selectClass}
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
              >
                {BILLING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Posición en value ladder">
            <Input
              type="number"
              min={1}
              value={ladderPosition}
              onChange={(e) => setLadderPosition(e.target.value)}
            />
          </FormField>
          {avatars.length > 0 ? (
            <FormField label="Avatar objetivo">
              <select
                className={selectClass}
                value={targetAvatarId}
                onChange={(e) => setTargetAvatarId(e.target.value)}
              >
                <option value="">Ninguno</option>
                {avatars.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}
          <FormField label="Bonuses (uno por línea)">
            <Textarea value={bonuses} onChange={(e) => setBonuses(e.target.value)} rows={3} />
          </FormField>
          <FormField label="Garantía">
            <Textarea value={guarantee} onChange={(e) => setGuarantee(e.target.value)} rows={2} />
          </FormField>
        </div>
        <DialogFooter>
          <Button type="button" disabled={pending || !name.trim()} onClick={handleSave}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
