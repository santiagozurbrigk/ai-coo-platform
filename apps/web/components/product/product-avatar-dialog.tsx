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
import { saveAvatarAction } from "@/app/product/actions";
import { useToast } from "@/providers/toast-provider";
import type { ProductAvatar } from "@/types/product";

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProductAvatarDialog({
  open,
  onOpenChange,
  avatar,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatar?: ProductAvatar | null;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(avatar?.name ?? "");
  const [ageRange, setAgeRange] = useState(
    avatar?.age ? String(avatar.age) : ""
  );
  const [occupation, setOccupation] = useState(avatar?.role ?? "");
  const [location, setLocation] = useState(avatar?.location ?? "");
  const [mainPain, setMainPain] = useState(avatar?.pains[0] ?? "");
  const [desires, setDesires] = useState(
    avatar?.dreams.join("\n") ?? ""
  );
  const [objections, setObjections] = useState(
    avatar?.objections.map((o) => o.text).join("\n") ?? ""
  );
  const [whereTheyHang, setWhereTheyHang] = useState(avatar?.buyTrigger ?? "");
  const [languageTheyUse, setLanguageTheyUse] = useState(
    avatar?.innerVoice.replace(/^"|"$/g, "") ?? ""
  );
  const [isPrimary, setIsPrimary] = useState(avatar?.isMain ?? false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveAvatarAction({
        id: avatar?.id,
        name,
        ageRange: ageRange ? `${ageRange} años` : undefined,
        occupation,
        location,
        mainPain,
        desires: linesToArray(desires),
        objections: linesToArray(objections),
        whereTheyHang,
        languageTheyUse,
        isPrimary,
      });

      if (!result.success) {
        push({ title: "Error", description: result.error });
        return;
      }

      push({ title: "Avatar guardado", variant: "success" });
      onOpenChange(false);
      onSaved();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{avatar ? "Editar avatar" : "Crear avatar"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Nombre" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Rango de edad">
            <Input
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              placeholder="Ej: 30-40"
            />
          </FormField>
          <FormField label="Ocupación">
            <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} />
          </FormField>
          <FormField label="Ubicación">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField label="Dolor principal" required>
            <Textarea value={mainPain} onChange={(e) => setMainPain(e.target.value)} rows={2} />
          </FormField>
          <FormField label="Deseos (uno por línea)">
            <Textarea value={desires} onChange={(e) => setDesires(e.target.value)} rows={3} />
          </FormField>
          <FormField label="Objeciones (una por línea)">
            <Textarea value={objections} onChange={(e) => setObjections(e.target.value)} rows={3} />
          </FormField>
          <FormField label="Dónde pasan el tiempo">
            <Input value={whereTheyHang} onChange={(e) => setWhereTheyHang(e.target.value)} />
          </FormField>
          <FormField label="Lenguaje que usan">
            <Textarea
              value={languageTheyUse}
              onChange={(e) => setLanguageTheyUse(e.target.value)}
              rows={2}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            Avatar principal
          </label>
        </div>
        <DialogFooter>
          <Button type="button" disabled={pending || !name.trim() || !mainPain.trim()} onClick={handleSave}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
