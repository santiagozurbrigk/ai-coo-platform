"use client";

import { useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import {
  Button,
  FormField,
  Textarea,
  cn,
} from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { generateMockSop } from "@/mocks/sops";
import { useToast } from "@/providers/toast-provider";
import type { GeneratedSop, SopDepartment } from "@/types/sops";
import { SopGeneratedPreview } from "./sop-generated-preview";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-[#1A1A1A]";

const DEPARTMENTS: { value: SopDepartment; label: string }[] = [
  { value: "sales", label: "Ventas" },
  { value: "delivery", label: "Delivery" },
  { value: "operations", label: "Operaciones" },
  { value: "marketing", label: "Marketing" },
  { value: "founder", label: "Founder" },
];

export function SopCreatorForm() {
  const [goal, setGoal] = useState("");
  const [department, setDepartment] = useState<SopDepartment>("sales");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSop | null>(null);
  const [editing, setEditing] = useState(false);
  const { push } = useToast();

  const canGenerate = goal.trim().length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGenerated(null);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(
        generateMockSop({
          goal: goal.trim(),
          department,
          expectedOutcome: expectedOutcome.trim(),
          additionalContext: additionalContext.trim(),
        })
      );
      setEditing(false);
    }, 2400);
  };

  const handleSave = () => {
    push({
      title: "SOP guardado",
      description: "El borrador quedó en la biblioteca (mock).",
      variant: "success",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Crear SOP" subtitle="Completá el contexto y generá con IA">
        <div className="space-y-4">
          <FormField label="Goal" required description="¿Qué objetivo cumple este SOP?">
            <Textarea
              placeholder="Ej: Activar al cliente en menos de 48 h post-compra…"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              disabled={generating}
            />
          </FormField>

          <FormField label="Department" required>
            <select
              className={selectClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value as SopDepartment)}
              disabled={generating}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Expected Outcome"
            description="¿Qué resultado esperás?"
          >
            <Textarea
              placeholder="Resultado medible si se sigue correctamente…"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              rows={2}
              disabled={generating}
            />
          </FormField>

          <FormField
            label="Additional Context"
            description="Contexto extra para la IA"
          >
            <Textarea
              placeholder="Casos borde, herramientas, responsables, SLAs…"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              disabled={generating}
            />
          </FormField>

          <FormField label="Attachments" description="Mock — sin lógica de subida">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 dark:border-white/[0.08]">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-center text-xs text-muted-foreground">
                Arrastrá archivos o explorá (sin conexión en prototipo)
              </p>
              <Button type="button" variant="outline" size="sm" disabled>
                Seleccionar archivos
              </Button>
            </div>
          </FormField>

          <Button
            type="button"
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700 sm:w-auto"
            disabled={!canGenerate || generating}
            onClick={handleGenerate}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generando SOP…" : "Generar SOP con IA"}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Vista previa"
        subtitle={
          generated
            ? "Revisá el borrador antes de guardar"
            : "El SOP generado aparecerá aquí"
        }
        className={cn(!generated && !generating && "opacity-90")}
      >
        {generating ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            <p className="text-sm font-medium">Generando SOP con IA…</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Estructurando pasos, checklist y criterios de éxito según tu contexto.
            </p>
          </div>
        ) : generated ? (
          <div className="space-y-4">
            {editing ? (
              <Textarea
                className="min-h-[320px] font-mono text-sm"
                defaultValue={generated.sections
                  .map((s) => `## ${s.title}\n${s.items.map((i) => `- ${i}`).join("\n")}`)
                  .join("\n\n")}
                rows={16}
              />
            ) : (
              <SopGeneratedPreview sop={generated} />
            )}
            <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4 dark:border-white/[0.08]">
              <Button type="button" size="sm" onClick={handleSave}>
                Guardar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Vista previa" : "Editar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                Regenerar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Completá el formulario y pulsá &quot;Generar SOP con IA&quot;
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
