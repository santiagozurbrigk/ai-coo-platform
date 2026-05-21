"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button, FormField, Input, Textarea } from "@ai-coo/ui";
import { Panel } from "@/components/shared";
import { useToast } from "@/providers/toast-provider";
import { es } from "@/lib/locale/es";
import { paths } from "@/routes";

export function SopCreatorForm() {
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleGenerate = () => {
    if (!goal.trim()) return;
    setGenerating(true);
    push({ title: es.flow.sopGenerating, description: es.common.loading });
    window.setTimeout(() => {
      setGenerating(false);
      push({
        title: es.flow.sopReady,
        description: es.flow.sopReadyDesc,
        variant: "success",
      });
      router.push(paths.platform.sops.detail("sop4"));
    }, 1600);
  };

  return (
    <Panel title="Generar SOP" className="max-w-2xl">
      <div className="space-y-4">
        <FormField label="Objetivo" required>
          <Input
            placeholder="¿Qué debe lograr este SOP?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </FormField>
        <FormField label="Departamento" required>
          <Input placeholder="Ventas, Delivery, Operaciones..." />
        </FormField>
        <FormField label="Resultado esperado">
          <Input placeholder="Resultado medible si se sigue correctamente" />
        </FormField>
        <FormField
          label="Contexto adicional"
          description="Notas del fundador, casos borde"
        >
          <Textarea
            placeholder="Contexto que la IA debe usar de tu negocio..."
            rows={4}
          />
        </FormField>
        <FormField label="Adjuntos" description="Solo UI en prototipo">
          <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            Arrastra archivos o explora (sin conexión)
          </div>
        </FormField>
        <Button
          className="w-full sm:w-auto gap-2"
          type="button"
          disabled={!goal.trim() || generating}
          onClick={handleGenerate}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? es.flow.sopGenerating : "Generar SOP"}
        </Button>
      </div>
    </Panel>
  );
}
