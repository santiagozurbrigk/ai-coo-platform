"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { Button, FormField, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { useToast } from "@/providers/toast-provider";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";

export function WeeklyInputForm() {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setText("");
      push({
        title: es.flow.inputSubmitted,
        description: es.flow.inputSubmittedDesc,
        variant: "success",
      });
      router.push(flowLinks.executiveReportLatest);
    }, 800);
  };

  return (
    <Panel title="Enviar contexto de esta semana" contentClassName="space-y-4">
      <p className="text-xs text-muted-foreground">
        Objetivo: menos de 2 minutos. La IA usa esto para los reportes ejecutivos.
      </p>
      <Tabs defaultValue="text">
        <TabsList className="w-full">
          <TabsTrigger value="text" className="flex-1">
            Texto
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex-1">
            Audio
          </TabsTrigger>
          <TabsTrigger value="form" className="flex-1">
            Formulario
          </TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <FormField
            label="¿Qué cambió esta semana?"
            description="Operaciones, bloqueos, victorias"
          >
            <Textarea
              placeholder="Delivery se ralentizó en el Módulo 2 porque..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
          </FormField>
          <Button
            className="mt-3 w-full sm:w-auto"
            type="button"
            disabled={!text.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? es.common.loading : es.common.submit}
          </Button>
        </TabsContent>
        <TabsContent value="audio">
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-10">
            <Mic className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Toca para grabar nota de voz</p>
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                push({
                  title: es.flow.recordingStarted,
                  description: es.flow.recordingStartedDesc,
                })
              }
            >
              Iniciar grabación
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="form">
          <p className="text-sm text-muted-foreground">
            Formulario estructurado por departamento — disponible en la siguiente fase.
          </p>
          <Button
            className="mt-3"
            variant="secondary"
            type="button"
            onClick={() => router.push(flowLinks.weeklyInputs)}
          >
            Abrir formulario
          </Button>
        </TabsContent>
      </Tabs>
    </Panel>
  );
}
