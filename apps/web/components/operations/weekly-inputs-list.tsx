import { Mic, FileText, FormInput } from "lucide-react";
import { Panel } from "@/components/shared";
import { formatRelativeTime } from "@/lib/format";
import type { WeeklyInput } from "@/types/operations";
import { DepartmentBadge } from "./department-badge";

const TYPE_LABEL = {
  text: "Texto",
  audio: "Audio",
  form: "Formulario",
};

const TYPE_ICON = {
  text: FileText,
  audio: Mic,
  form: FormInput,
};

export function WeeklyInputsList({ inputs }: { inputs: WeeklyInput[] }) {
  return (
    <Panel title="Envíos recientes">
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
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {input.preview}
                </p>
                <p className="mt-1 text-2xs text-muted-foreground">
                  {formatRelativeTime(input.submittedAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
