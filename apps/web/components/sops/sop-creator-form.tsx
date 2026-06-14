"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Sparkles, Upload } from "lucide-react";
import {
  Button,
  FormField,
  Textarea,
  cn,
} from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import {
  generateSOPAction,
  saveSOPAction,
  type GeneratedSOPData,
} from "@/app/sops/actions";
import { useToast } from "@/providers/toast-provider";
import { paths } from "@/routes";
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

type FormState = "idle" | "generating" | "preview" | "saving" | "error";

function toGeneratedSop(data: GeneratedSOPData): GeneratedSop {
  return {
    title: data.title,
    summary: data.summary,
    content: data.content,
    tags: data.tags,
    estimatedDurationMinutes: data.estimatedDurationMinutes,
    stepsCount: data.stepsCount,
  };
}

export function SopCreatorForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { push } = useToast();

  const [goal, setGoal] = useState("");
  const [department, setDepartment] = useState<SopDepartment>("sales");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [generated, setGenerated] = useState<GeneratedSop | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState(false);

  useEffect(() => {
    const goalParam = searchParams.get("goal")?.trim();
    const deptParam = searchParams.get("department")?.trim() as SopDepartment | null;
    const titleParam = searchParams.get("title")?.trim();

    if (goalParam) setGoal(goalParam);
    if (titleParam && !goalParam) setGoal(titleParam.replace(/^SOP:\s*/i, ""));
    if (deptParam && DEPARTMENTS.some((d) => d.value === deptParam)) {
      setDepartment(deptParam);
    }
  }, [searchParams]);

  const canGenerate =
    goal.trim().length > 0 && expectedOutcome.trim().length > 0;

  const runGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setFormState("generating");
    setGenerated(null);
    setErrorMessage(null);

    const result = await generateSOPAction({
      goal: goal.trim(),
      department,
      expectedOutcome: expectedOutcome.trim(),
      additionalContext: additionalContext.trim() || undefined,
    });

    if (!result.success) {
      setFormState("error");
      setErrorMessage(result.error);
      return;
    }

    setGenerated(toGeneratedSop(result.data));
    setFormState("preview");
    setEditingContent(false);
  }, [canGenerate, goal, department, expectedOutcome, additionalContext]);

  const handleSave = async (status: "draft" | "active") => {
    if (!generated) return;
    setFormState("saving");

    const result = await saveSOPAction({
      title: generated.title,
      goal: goal.trim(),
      department,
      expectedOutcome: expectedOutcome.trim() || undefined,
      additionalContext: additionalContext.trim() || undefined,
      content: generated.content,
      tags: generated.tags,
      estimatedDurationMinutes: generated.estimatedDurationMinutes,
      generatedByAI: true,
      status,
    });

    if (!result.success) {
      setFormState("preview");
      push({
        title: "No se pudo guardar",
        description: result.error,
      });
      return;
    }

    push({
      title: status === "active" ? "SOP publicado" : "Borrador guardado",
      description: "Ya está disponible en la biblioteca.",
      variant: "success",
    });
    router.push(paths.platform.operations.sops);
  };

  const generating = formState === "generating";
  const saving = formState === "saving";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Crear SOP" subtitle="Completá el contexto y generá con IA">
        <div className="space-y-4">
          <FormField label="Objetivo" required description="¿Qué objetivo cumple este SOP?">
            <Textarea
              placeholder="Ej: Activar al cliente en menos de 48 h post-compra…"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              disabled={generating || saving}
            />
          </FormField>

          <FormField label="Departamento" required>
            <select
              className={selectClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value as SopDepartment)}
              disabled={generating || saving}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Resultado esperado"
            required
            description="¿Qué resultado esperás?"
          >
            <Textarea
              placeholder="Resultado medible si se sigue correctamente…"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              rows={2}
              disabled={generating || saving}
            />
          </FormField>

          <FormField
            label="Contexto adicional"
            description="Contexto extra para la IA"
          >
            <Textarea
              placeholder="Casos borde, herramientas, responsables, SLAs…"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              disabled={generating || saving}
            />
          </FormField>

          <FormField label="Adjuntos" description="Próximamente">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 dark:border-white/[0.08]">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-center text-xs text-muted-foreground">
                Subida de archivos disponible en una próxima versión
              </p>
              <Button type="button" variant="outline" size="sm" disabled>
                Seleccionar archivos
              </Button>
            </div>
          </FormField>

          <Button
            type="button"
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700 sm:w-auto"
            disabled={!canGenerate || generating || saving}
            onClick={runGenerate}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generando SOP con IA…" : "Generar SOP con IA"}
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
        className={cn(!generated && formState !== "error" && !generating && "opacity-90")}
      >
        {formState === "error" ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-sm font-medium">No se pudo generar el SOP</p>
              <p className="text-xs text-muted-foreground">{errorMessage}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={runGenerate}>
              Intentar de nuevo
            </Button>
          </div>
        ) : generating ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            <p className="text-sm font-medium">Generando SOP con IA…</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Puede tardar 10–20 segundos. Estructurando pasos y criterios según tu
              organización.
            </p>
          </div>
        ) : generated ? (
          <div className="space-y-4">
            {editingContent ? (
              <Textarea
                className="min-h-[320px] font-mono text-sm"
                value={generated.content}
                onChange={(e) =>
                  setGenerated({ ...generated, content: e.target.value })
                }
                rows={16}
                disabled={saving}
              />
            ) : (
              <SopGeneratedPreview
                sop={generated}
                editingTitle
                onTitleChange={(title) => setGenerated({ ...generated, title })}
              />
            )}
            <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4 dark:border-white/[0.08]">
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => handleSave("draft")}
              >
                {saving ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Guardar como borrador
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-violet-600 hover:bg-violet-700"
                disabled={saving}
                onClick={() => handleSave("active")}
              >
                Publicar SOP
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => setEditingContent((v) => !v)}
              >
                {editingContent ? "Vista previa" : "Editar contenido"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canGenerate || saving}
                onClick={runGenerate}
              >
                Regenerar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Completá objetivo y resultado esperado, luego pulsá &quot;Generar SOP con
              IA&quot;
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
