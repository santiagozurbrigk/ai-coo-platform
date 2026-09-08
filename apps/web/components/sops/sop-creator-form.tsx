"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Sparkles, Upload, X } from "lucide-react";
import {
  Button,
  FormField,
  Textarea,
  cn,
} from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import {
  finalizeSopAttachmentAction,
  generateSOPAction,
  prepareSopAttachmentUploadAction,
  saveSOPAction,
  type GeneratedSOPData,
} from "@/app/sops/actions";
import { SOP_ATTACHMENTS_ACCEPT } from "@/lib/sops/constants";
import { useToast } from "@/providers/toast-provider";
import { paths } from "@/routes";
import type { GeneratedSop, SopDepartment } from "@/types/sops";
import { SopGeneratedPreview } from "./sop-generated-preview";
import { SopVideoCreator } from "./sop-video-creator";

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

type UploadedAttachment = {
  id: string;
  fileName: string;
};

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
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  /** D · El modo video es un modo más: el de texto sigue igual. */
  const [mode, setMode] = useState<"text" | "video">("text");
  const draftId = useMemo(() => crypto.randomUUID(), []);

  const attachmentContext = attachments.length
    ? `\n\nArchivos adjuntos de referencia:\n${attachments.map((a) => `- ${a.fileName}`).join("\n")}`
    : "";

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const prepared = await prepareSopAttachmentUploadAction({
          draftId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
        });
        if (!prepared.success) {
          push({ title: "No se pudo subir", description: prepared.error });
          continue;
        }

        const upload = await fetch(prepared.data.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": prepared.data.contentType },
          body: file,
        });
        if (!upload.ok) {
          push({ title: "Error de subida", description: file.name });
          continue;
        }

        const finalized = await finalizeSopAttachmentAction({
          draftId,
          storagePath: prepared.data.storagePath,
          fileName: file.name,
          mimeType: prepared.data.contentType,
          fileSize: file.size,
        });
        if (finalized.success) {
          setAttachments((prev) => [
            ...prev,
            { id: finalized.data.id, fileName: file.name },
          ]);
        }
      }
    } finally {
      setUploading(false);
    }
  };

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
      additionalContext:
        (additionalContext.trim() || "") + attachmentContext || undefined,
    });

    if (!result.success) {
      setFormState("error");
      setErrorMessage(result.error);
      return;
    }

    setGenerated(toGeneratedSop(result.data));
    setFormState("preview");
    setEditingContent(false);
  }, [canGenerate, goal, department, expectedOutcome, additionalContext, attachmentContext]);

  const handleSave = async (status: "draft" | "active") => {
    if (!generated) return;
    setFormState("saving");

    const result = await saveSOPAction({
      title: generated.title,
      goal: goal.trim(),
      department,
      expectedOutcome: expectedOutcome.trim() || undefined,
      additionalContext:
        (additionalContext.trim() || "") + attachmentContext || undefined,
      content: generated.content,
      tags: generated.tags,
      estimatedDurationMinutes: generated.estimatedDurationMinutes,
      generatedByAI: true,
      status,
      draftId: attachments.length > 0 ? draftId : undefined,
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
          {/* D · Elegir de dónde sale el SOP. */}
          <div className="inline-flex rounded-lg bg-muted p-1">
            {(["text", "video"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={
                  mode === option
                    ? "rounded-md bg-background px-3 py-1 text-sm font-medium shadow-sm"
                    : "px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                }
              >
                {option === "text" ? "Desde texto" : "Desde un video"}
              </button>
            ))}
          </div>

          {mode === "video" ? (
            <SopVideoCreator
              onGenerated={(markdown, videoTitle) => {
                setGenerated({
                  title: videoTitle ?? "SOP desde video",
                  content: markdown,
                  tags: [],
                });
                setMode("text");
              }}
            />
          ) : (
          <>
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

          <FormField label="Adjuntos" description="PDF, Word, TXT, MD o imágenes (máx. 25 MB)">
            <div className="space-y-3 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-4 dark:border-white/[0.08]">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />
                {uploading ? "Subiendo…" : "Seleccionar archivos"}
                <input
                  type="file"
                  className="sr-only"
                  multiple
                  accept={SOP_ATTACHMENTS_ACCEPT}
                  disabled={generating || saving || uploading}
                  onChange={(e) => {
                    void handleUploadFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {attachments.length > 0 ? (
                <ul className="space-y-1">
                  {attachments.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
                    >
                      <span className="truncate">{file.fileName}</span>
                      <button
                        type="button"
                        className="text-destructive hover:underline"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((a) => a.id !== file.id)
                          )
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Los archivos se usan como contexto para la IA al generar el SOP.
                </p>
              )}
            </div>
          </FormField>

          <Button
            type="button"
            className="w-full gap-2 bg-brand-600 hover:bg-brand-700 sm:w-auto"
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
          </>
          )}
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
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
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
                className="bg-brand-600 hover:bg-brand-700"
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
