"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { Button, FormField, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { useToast } from "@/providers/toast-provider";
import { es } from "@/lib/locale/es";
import type { Department, InputImportance, WeeklyInputType } from "@/types/operations";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: "sales", label: "Ventas" },
  { value: "delivery", label: "Delivery" },
  { value: "operations", label: "Operaciones" },
  { value: "founder", label: "Fundador" },
];

const IMPORTANCE: { value: InputImportance; label: string }[] = [
  { value: "high", label: "🔴 Muy importante" },
  { value: "medium", label: "🟡 Poco importante" },
  { value: "low", label: "⚪ Solo para tenerlo en cuenta" },
];

export function TeamInputForm() {
  const [text, setText] = useState("");
  const [department, setDepartment] = useState<Department>("operations");
  const [importance, setImportance] = useState<InputImportance>("medium");
  const [inputType, setInputType] = useState<WeeklyInputType>("text");
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
        title: "Input enviado",
        description: "La IA tendrá en cuenta el nivel de importancia indicado.",
        variant: "success",
      });
      router.refresh();
    }, 800);
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
      <FormField label="Nivel de importancia">
        <select
          className={selectClass}
          value={importance}
          onChange={(e) => setImportance(e.target.value as InputImportance)}
        >
          {IMPORTANCE.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </FormField>
      <Tabs
        value={inputType}
        onValueChange={(v) => setInputType(v as WeeklyInputType)}
      >
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
          <FormField label="Contenido">
            <Textarea
              placeholder="Algo que el equipo o la IA deba saber esta semana..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
          </FormField>
        </TabsContent>
        <TabsContent value="audio">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10">
            <Mic className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Subir nota de voz — próximamente
            </p>
          </div>
        </TabsContent>
        <TabsContent value="form">
          <p className="text-sm text-muted-foreground">
            Plantillas de formulario — próximamente.
          </p>
        </TabsContent>
      </Tabs>
      <Button onClick={handleSubmit} disabled={submitting || !text.trim()}>
        {submitting ? "Enviando…" : "Enviar input"}
      </Button>
    </Panel>
  );
}
