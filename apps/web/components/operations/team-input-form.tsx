"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, Textarea } from "@ai-coo/ui";
import { saveWeeklyInputAction } from "@/app/operations/actions";
import { Panel } from "@/components/shared/panel";
import { useToast } from "@/providers/toast-provider";
import type { Department } from "@/types/operations";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: "sales", label: "Ventas" },
  { value: "delivery", label: "Delivery" },
  { value: "operations", label: "Operaciones" },
  { value: "marketing", label: "Marketing" },
  { value: "founder", label: "Fundador" },
];

export function TeamInputForm() {
  const [text, setText] = useState("");
  const [department, setDepartment] = useState<Department>("operations");
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await saveWeeklyInputAction({ department, content: text.trim() });
      setText("");
      push({
        title: "Input guardado ✓",
        description:
          "Quedó registrado en el contexto semanal — la IA lo tendrá en cuenta en sus análisis.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      push({
        title: "No se pudo guardar el input",
        description:
          error instanceof Error ? error.message : "Intentá de nuevo.",
        variant: "default",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel title="Enviar input al equipo" contentClassName="space-y-4">
      <p className="text-xs text-muted-foreground">
        Información intencional que quieres que la IA y el liderazgo tengan en cuenta —
        lo que el sistema no detecta automáticamente.
      </p>
      <FormField label="Departamento">
        <select
          className={selectClass}
          value={department}
          onChange={(e) => setDepartment(e.target.value as Department)}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Contenido">
        <Textarea
          placeholder="Algo que el equipo o la IA deba saber esta semana..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
        />
      </FormField>
      <Button
        onClick={() => void handleSubmit()}
        disabled={submitting || !text.trim()}
      >
        {submitting ? "Guardando…" : "Enviar input"}
      </Button>
    </Panel>
  );
}
