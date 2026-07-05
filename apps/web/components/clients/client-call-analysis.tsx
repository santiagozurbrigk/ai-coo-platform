import { Badge, MetricBand, MetricStat, cn } from "@ai-coo/ui";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";
import type { DeepCallAnalysis } from "@/types/call-analysis";
import type { ObjectionCategory } from "@/types/sales";

const SECTION_LABELS: Record<string, string> = {
  apertura: "Apertura",
  presentacion: "Presentación",
  objeciones: "Objeciones",
  cta: "CTA y cierre",
};

const SECTION_ORDER = ["apertura", "presentacion", "objeciones", "cta"];

const CATEGORY_STYLE: Record<ObjectionCategory, string> = {
  closing: "bg-red-900/20 text-red-400",
  setting: "bg-amber-900/20 text-amber-400",
  marketing: "bg-blue-900/20 text-blue-400",
};

const CATEGORY_LABEL: Record<ObjectionCategory, string> = {
  closing: "Closing",
  setting: "Setting",
  marketing: "Marketing",
};

const MISSING_STEP_HINTS: Record<string, string> = {
  "No confirmó el compromiso final antes de cerrar":
    "El compromiso explícito reduce no-shows y objeciones post-llamada.",
  "No hizo el CTA — terminó la llamada sin pedir el cierre":
    "Sin CTA claro, el lead sale sin siguiente paso concreto.",
  "No presentó el precio con contexto (antes/después)":
    "El precio sin contraste de valor genera rechazo por sticker shock.",
  "No validó si el lead tenía autoridad para decidir":
    "Sin validar autoridad, el cierre se bloquea con terceros.",
  "Nunca preguntó cuál era el principal dolor del lead":
    "Sin dolor identificado, la propuesta suena genérica.",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function barColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function sectionIcon(score: number) {
  if (score >= 80) return "✓";
  if (score >= 60) return "⚠";
  return "✗";
}

function fillerPillClass(count: number): string {
  if (count < 5) return "bg-muted/40 text-muted-foreground";
  if (count <= 15) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-red-500/15 text-red-700 dark:text-red-300";
}

function parseDurationMinutes(duration: string): number | undefined {
  const match = duration.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function resultValueClass(analysis: DeepCallAnalysis): string {
  if (analysis.sold)
    return "[&_.metric-stat-value]:text-emerald-600 dark:[&_.metric-stat-value]:text-emerald-400";
  if (analysis.booked)
    return "[&_.metric-stat-value]:text-blue-600 dark:[&_.metric-stat-value]:text-blue-400";
  return "[&_.metric-stat-value]:text-red-600 dark:[&_.metric-stat-value]:text-red-400";
}

function scoreValueClass(score: number): string {
  if (score >= 80)
    return "[&_.metric-stat-value]:text-emerald-600 dark:[&_.metric-stat-value]:text-emerald-400";
  if (score >= 60)
    return "[&_.metric-stat-value]:text-amber-600 dark:[&_.metric-stat-value]:text-amber-400";
  return "[&_.metric-stat-value]:text-red-600 dark:[&_.metric-stat-value]:text-red-400";
}

function resultLabel(analysis: DeepCallAnalysis): string {
  if (analysis.sold) return "Vendió ✓";
  if (analysis.booked) return "Booking ✓";
  return "No cerró ✗";
}

function SectionScoreRow({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">{name}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", barColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={cn(
          "w-10 shrink-0 text-right text-sm font-medium tabular-nums",
          scoreColor(score)
        )}
      >
        {score}%
      </span>
      <span className="w-4 shrink-0 text-center text-xs" aria-hidden>
        {sectionIcon(score)}
      </span>
      {score < 60 ? (
        <Badge variant="destructive" className="text-2xs shrink-0">
          Necesita trabajo
        </Badge>
      ) : (
        <span className="hidden w-[88px] shrink-0 sm:block" />
      )}
    </div>
  );
}

export function ClientCallAnalysisSection({
  analysis,
  durationLabel,
}: {
  analysis: DeepCallAnalysis;
  durationLabel?: string;
}) {
  const durationMinutes =
    analysis.durationMinutes ??
    (durationLabel ? parseDurationMinutes(durationLabel) : undefined);

  const enriched: DeepCallAnalysis = {
    ...analysis,
    durationMinutes,
  };

  const sections = SECTION_ORDER.filter((k) => k in enriched.sectionScores).map(
    (key) => ({
      key,
      label: SECTION_LABELS[key] ?? key,
      score: enriched.sectionScores[key] ?? 0,
    })
  );

  return (
    <div className="mt-4 space-y-6 rounded-xl border border-border/60 bg-muted/10 p-4 dark:border-white/[0.08]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Análisis profundo de la llamada
      </p>

      <MetricBand>
        <MetricStat
          title="Score general"
          value={`${enriched.overallScore}%`}
          className={scoreValueClass(enriched.overallScore)}
        />
        <MetricStat
          title="Guión seguido"
          value={`${enriched.scriptAdherencePct}%`}
          className={scoreValueClass(enriched.scriptAdherencePct)}
          showProgressBar
          progress={enriched.scriptAdherencePct}
          progressVariant="violet"
        />
        <MetricStat
          title="Resultado"
          value={resultLabel(enriched)}
          subtitle={
            enriched.leadName && enriched.durationMinutes
              ? `${enriched.leadName} · ${enriched.durationMinutes} min`
              : enriched.leadName
          }
          className={resultValueClass(enriched)}
        />
      </MetricBand>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Score por sección del guión
          </p>
          <div className="space-y-3">
            {sections.map((s) => (
              <SectionScoreRow key={s.key} name={s.label} score={s.score} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Pasos faltantes
          </p>
          {enriched.missingSteps.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400/90">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Siguió todos los pasos del guión
            </p>
          ) : (
            <ul className="space-y-2">
              {enriched.missingSteps.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  title={
                    MISSING_STEP_HINTS[step] ??
                    "Este paso es clave para avanzar el lead en el guión de ventas."
                  }
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {enriched.objections.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Objeciones detectadas
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {enriched.objections.map((obj) => (
              <div
                key={`${obj.text}-${obj.category}`}
                className="rounded-lg border border-border/60 bg-background/50 p-3 dark:border-white/[0.06]"
              >
                <p className="text-sm italic">&ldquo;{obj.text}&rdquo;</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-2xs font-medium",
                      CATEGORY_STYLE[obj.category]
                    )}
                  >
                    {CATEGORY_LABEL[obj.category]}
                  </span>
                  <Badge variant={obj.handled ? "success" : "destructive"}>
                    {obj.handled ? "Manejada ✓" : "No manejada ✗"}
                  </Badge>
                </div>
                {obj.handled && obj.resolution ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {obj.resolution}
                  </p>
                ) : null}
                {!obj.handled ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    {obj.suggestion ??
                      "Practicar respuesta estructurada: validar → reencuadrar → CTA"}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Patrones de lenguaje
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400/90">
              Frases que funcionan
            </p>
            {enriched.powerPhrases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin frases destacadas</p>
            ) : (
              <ul className="space-y-2">
                {enriched.powerPhrases.map((phrase) => (
                  <li
                    key={phrase}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {phrase}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400/90">
              Frases a eliminar
            </p>
            {enriched.weakPhrases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin frases débiles detectadas
              </p>
            ) : (
              <ul className="space-y-2">
                {enriched.weakPhrases.map((phrase) => (
                  <li
                    key={phrase}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    {phrase}
                  </li>
                ))}
              </ul>
            )}
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                fillerPillClass(enriched.fillerWordsCount)
              )}
            >
              🗣 Muletillas: {enriched.fillerWordsCount} veces
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400/90">Fortalezas</p>
          <ul className="space-y-2">
            {enriched.strengths.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400/90">
            Puntos a mejorar
          </p>
          <ul className="space-y-2">
            {enriched.improvements.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
