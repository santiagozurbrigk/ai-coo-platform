"use client";

import { useState } from "react";
import type { Department, WeeklyInput } from "@/types/operations";
import { PageHeader } from "@/components/shared/page-header";
import { WeeklyInputForm } from "./weekly-input-form";
import { WeeklyInputsList } from "./weekly-inputs-list";

export function WeeklyInputsPageContent() {
  const [inputs, setInputs] = useState<WeeklyInput[]>([]);

  const handleSubmitted = (department: Department, preview: string) => {
    const deptLabel: Record<Department, string> = {
      sales: "Ventas",
      delivery: "Delivery",
      operations: "Operaciones",
      founder: "Founder",
    };

    setInputs((prev) => [
      {
        id: `wi-${Date.now()}`,
        author: "Vos",
        department,
        type: "form",
        importance: "medium",
        preview: preview.slice(0, 120) || `Input de ${deptLabel[department]}`,
        submittedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-8">
      <PageHeader description="Contexto semanal por departamento para reportes ejecutivos" />
      <WeeklyInputForm onSubmitted={handleSubmitted} />
      <WeeklyInputsList inputs={inputs} showEmptyState />
    </div>
  );
}
