import { Badge } from "@ai-coo/ui";
import type { ClientCallAnalysis, ScriptAdherence } from "@/types/clients";
import type { ObjectionCategory } from "@/types/sales";

const SCRIPT_LABEL: Record<ScriptAdherence, string> = {
  yes: "Sí",
  partial: "Parcial",
  no: "No",
};

const SCRIPT_VARIANT: Record<
  ScriptAdherence,
  "success" | "warning" | "destructive"
> = {
  yes: "success",
  partial: "warning",
  no: "destructive",
};

const CATEGORY_LABEL: Record<ObjectionCategory, string> = {
  closing: "Closing",
  setting: "Setting",
  marketing: "Marketing",
};

export function ClientCallAnalysisSection({
  analysis,
}: {
  analysis: ClientCallAnalysis;
}) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-border/60 bg-muted/10 p-4 dark:border-white/[0.08]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Análisis de la llamada
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">¿Siguió el guión?</span>
          <Badge variant={SCRIPT_VARIANT[analysis.scriptFollowed]}>
            {SCRIPT_LABEL[analysis.scriptFollowed]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Score general</span>
          <Badge variant="outline" className="tabular-nums">
            {analysis.overallScore}/10
          </Badge>
        </div>
      </div>

      {analysis.objections.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Objeciones detectadas</p>
          <div className="flex flex-wrap gap-2">
            {analysis.objections.map((obj) => (
              <span
                key={`${obj.text}-${obj.category}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs dark:border-white/[0.08]"
              >
                {obj.text}
                <Badge variant="secondary" className="text-2xs">
                  {CATEGORY_LABEL[obj.category]}
                </Badge>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-emerald-400/90">
            Qué salió bien
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {analysis.wentWell.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-amber-400/90">
            Qué mejorar
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {analysis.toImprove.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
