"use client";

import { useState } from "react";
import { Loader2, Mic, Star } from "lucide-react";
import {
  Button,
  FormField,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  cn,
} from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { useToast } from "@/providers/toast-provider";
import type { Department } from "@/types/operations";

type DepartmentField = {
  weekSummary: string;
  problems: string;
  rating: number;
};

type DepartmentConfig = {
  value: Department;
  label: string;
  weekLabel: string;
  weekPlaceholder: string;
  problemsLabel: string;
  problemsPlaceholder: string;
};

const DEPARTMENTS: DepartmentConfig[] = [
  {
    value: "sales",
    label: "Ventas",
    weekLabel: "¿Cómo fue la semana?",
    weekPlaceholder: "Volumen de leads, booking rate, victorias del equipo…",
    problemsLabel: "¿Problemas detectados?",
    problemsPlaceholder: "Leads sin responder, objeciones recurrentes, cuellos de botella…",
  },
  {
    value: "delivery",
    label: "Delivery",
    weekLabel: "¿Entregas al día?",
    weekPlaceholder: "Módulos completados, entregas a tiempo, feedback de clientes…",
    problemsLabel: "¿Clientes con problemas?",
    problemsPlaceholder: "Tickets abiertos, accesos fallidos, quejas recurrentes…",
  },
  {
    value: "operations",
    label: "Operaciones",
    weekLabel: "¿Procesos rotos?",
    weekPlaceholder: "SOPs desactualizados, tareas manuales repetitivas…",
    problemsLabel: "¿Qué se repitió?",
    problemsPlaceholder: "Patrones detectados, bloqueos del equipo, dependencias del fundador…",
  },
  {
    value: "founder",
    label: "Founder",
    weekLabel: "¿Qué decisiones tomaste?",
    weekPlaceholder: "Prioridades de la semana, cambios de estrategia, hires o cortes…",
    problemsLabel: "¿Qué priorizás?",
    problemsPlaceholder: "Foco de la próxima semana, recursos necesarios, riesgos a mitigar…",
  },
];

const EMPTY_FIELDS: DepartmentField = {
  weekSummary: "",
  problems: "",
  rating: 0,
};

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          aria-label={`Calificar semana con ${score} de 5`}
          onClick={() => onChange(score)}
          className="rounded-md p-1 transition-colors hover:bg-muted"
        >
          <Star
            className={cn(
              "h-5 w-5",
              score <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        {value > 0 ? `${value}/5` : "Sin calificar"}
      </span>
    </div>
  );
}

export function WeeklyInputForm({
  onSubmitted,
}: {
  onSubmitted?: (department: Department, preview: string) => void;
} = {}) {
  const [activeTab, setActiveTab] = useState<Department>("sales");
  const [fields, setFields] = useState<Record<Department, DepartmentField>>({
    sales: { ...EMPTY_FIELDS },
    delivery: { ...EMPTY_FIELDS },
    operations: { ...EMPTY_FIELDS },
    founder: { ...EMPTY_FIELDS },
  });
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const { push } = useToast();

  const updateField = (
    department: Department,
    key: keyof DepartmentField,
    value: string | number
  ) => {
    setFields((prev) => ({
      ...prev,
      [department]: { ...prev[department], [key]: value },
    }));
  };

  const hasContent = Object.values(fields).some(
    (f) => f.weekSummary.trim() || f.problems.trim() || f.rating > 0
  );

  const handleSubmit = () => {
    if (!hasContent) return;
    setSubmitting(true);
    const activeFields = fields[activeTab];
    const preview = [activeFields.weekSummary, activeFields.problems]
      .filter(Boolean)
      .join(" · ");
    window.setTimeout(() => {
      setSubmitting(false);
      onSubmitted?.(activeTab, preview);
      setFields({
        sales: { ...EMPTY_FIELDS },
        delivery: { ...EMPTY_FIELDS },
        operations: { ...EMPTY_FIELDS },
        founder: { ...EMPTY_FIELDS },
      });
      push({
        title: "Inputs enviados",
        description:
          "Tu contexto semanal quedó registrado. La IA lo usará en el próximo reporte ejecutivo.",
        variant: "success",
      });
    }, 900);
  };

  const handleMockRecording = () => {
    setRecording(true);
    push({
      title: "Grabación iniciada",
      description: "Mock — en producción se transcribirá automáticamente.",
    });
    window.setTimeout(() => setRecording(false), 2000);
  };

  return (
    <Panel
      title="Inputs semanales"
      subtitle="Menos de 2 minutos · un tab por departamento"
      contentClassName="space-y-4"
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Department)}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 lg:grid-cols-4">
          {DEPARTMENTS.map((dept) => (
            <TabsTrigger key={dept.value} value={dept.value} className="text-xs sm:text-sm">
              {dept.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {DEPARTMENTS.map((dept) => {
          const data = fields[dept.value];
          return (
            <TabsContent key={dept.value} value={dept.value} className="space-y-4 pt-2">
              <FormField label={dept.weekLabel}>
                <Textarea
                  placeholder={dept.weekPlaceholder}
                  value={data.weekSummary}
                  onChange={(e) =>
                    updateField(dept.value, "weekSummary", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField label={dept.problemsLabel}>
                <Textarea
                  placeholder={dept.problemsPlaceholder}
                  value={data.problems}
                  onChange={(e) =>
                    updateField(dept.value, "problems", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField label="Calificación de la semana (1–5)">
                <RatingPicker
                  value={data.rating}
                  onChange={(rating) => updateField(dept.value, "rating", rating)}
                />
              </FormField>

              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 dark:border-white/[0.08]">
                <Mic className="h-7 w-7 text-muted-foreground" />
                <p className="text-center text-xs text-muted-foreground">
                  Preferís hablar en lugar de escribir? Grabá una nota de voz.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={recording}
                  onClick={handleMockRecording}
                >
                  {recording ? "Grabando…" : "Grabar audio"}
                </Button>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Button
        type="button"
        className="w-full bg-violet-600 hover:bg-violet-700 sm:w-auto"
        disabled={!hasContent || submitting}
        onClick={handleSubmit}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          "Enviar inputs"
        )}
      </Button>
    </Panel>
  );
}
