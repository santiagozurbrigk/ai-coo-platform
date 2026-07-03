"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
  cn,
} from "@ai-coo/ui";
import type { AgentProjectColor } from "@/types/agent";

const COLORS: { id: AgentProjectColor; className: string }[] = [
  { id: "violet", className: "bg-violet-500" },
  { id: "blue", className: "bg-blue-500" },
  { id: "green", className: "bg-green-500" },
  { id: "amber", className: "bg-amber-500" },
  { id: "red", className: "bg-red-500" },
];

export function CreateProjectModal({
  open,
  onOpenChange,
  stageName,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageName: string | null;
  onSubmit: (input: {
    name: string;
    description?: string;
    color: AgentProjectColor;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<AgentProjectColor>("violet");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name, description, color });
      setName("");
      setDescription("");
      setColor("violet");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {stageName ? (
            <p className="text-xs text-muted-foreground">
              Se va a crear dentro de la etapa “{stageName}”.
            </p>
          ) : null}
          <Input
            placeholder="Nombre del proyecto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.id}
                onClick={() => setColor(c.id)}
                className={cn(
                  "h-6 w-6 rounded-full",
                  c.className,
                  color === c.id && "ring-2 ring-primary ring-offset-2"
                )}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void handleSubmit()} disabled={saving || !name.trim()}>
            {saving ? "Creando…" : "Crear proyecto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
