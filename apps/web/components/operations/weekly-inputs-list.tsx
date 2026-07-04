"use client";

import { Mic, FileText, FormInput } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { formatRelativeTime } from "@/lib/format";
import type { TeamInput } from "@/types/operations";
import { DepartmentBadge } from "./department-badge";
import { WeeklyInputsEmptyState } from "./weekly-inputs-empty-state";
import { WeeklyInputRowActions } from "./weekly-input-row-actions";

const TYPE_LABEL: Record<TeamInput["type"], string> = {
  text: "Texto",
  rating: "Calificación",
  audio: "Audio",
  form: "Formulario",
};

const TYPE_ICON: Record<TeamInput["type"], typeof FileText> = {
  text: FileText,
  rating: FileText,
  audio: Mic,
  form: FormInput,
};

export function WeeklyInputsList({
  inputs,
  showEmptyState = false,
  editable = false,
  onChanged,
}: {
  inputs: TeamInput[];
  showEmptyState?: boolean;
  editable?: boolean;
  onChanged?: () => void;
}) {
  if (showEmptyState && inputs.length === 0) {
    return (
      <Panel title="Envíos recientes">
        <WeeklyInputsEmptyState />
      </Panel>
    );
  }

  if (inputs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay inputs para esta semana.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {inputs.map((input) => {
        const Icon = TYPE_ICON[input.type];
        return (
          <li
            key={input.id}
            className="flex gap-3 rounded-md border border-border/60 px-3 py-3 hover:bg-muted/20 transition-colors"
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{input.author}</span>
                <DepartmentBadge department={input.department} />
                <span className="text-2xs text-muted-foreground">
                  {TYPE_LABEL[input.type]}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                {input.preview}
              </p>
              <p className="mt-1 text-2xs text-muted-foreground">
                {formatRelativeTime(input.submittedAt)}
              </p>
              {editable ? (
                <WeeklyInputRowActions
                  inputId={input.id}
                  department={input.department}
                  content={input.preview}
                  rating={input.rating}
                  onChanged={onChanged}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
