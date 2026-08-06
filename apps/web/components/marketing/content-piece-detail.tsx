"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  generateVariantCaptionAction,
  publishVariantAsZernioDraftAction,
} from "@/app/marketing/content/actions";
import {
  linkDriveFileToContentAction,
  unlinkDriveFileAction,
} from "@/app/marketing/content/drive-actions";
import { DriveFilePicker } from "@/components/marketing/drive-file-picker";
import {
  AnalysisDimensionIcon,
  ContentTypeIcon,
  MetricIcon,
  type MetricIconName,
} from "@/components/marketing/marketing-icons";
import { ZernioPostComments } from "@/components/marketing/zernio-post-comments";
import { ZernioPostAds } from "@/components/marketing/zernio-post-ads";
import { paths } from "@/routes";
import type { ContentPiece, ContentPieceWithVariants } from "@/types/content";
import {
  Badge,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { ArrowLeft, Check, ChevronRight, Copy, ExternalLink, Folder, Loader2, X } from "lucide-react";
import type { ContentBenchmark } from "@/app/marketing/content/actions";
import { RingDistributionChart } from "@/components/charts/platform/ring-distribution-chart";
import { RadarPerformanceChart } from "@/components/charts/platform/radar-performance-chart";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  piece: ContentPieceWithVariants;
  variants: ContentPiece[];
  benchmark?: ContentBenchmark | null;
};

type DetailTab = "metricas" | "analisis" | "comentarios" | "anuncios" | "variantes";

export function ContentPieceDetail({ piece, variants, benchmark }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("metricas");

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentPieceId: piece.id }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Error al analizar");
      }

      push({ title: "Análisis completado", variant: "success" });
      router.refresh();
    } catch (err) {
      push({
        title: "Error al analizar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDriveLink = async (file: {
    id: string;
    name: string;
    url: string;
  }) => {
    try {
      await linkDriveFileToContentAction(piece.id, file);
      setShowDrivePicker(false);
      push({ title: "Archivo vinculado", variant: "success" });
      router.refresh();
    } catch (err) {
      push({
        title: "No se pudo vincular",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  const handleDriveUnlink = async () => {
    try {
      await unlinkDriveFileAction(piece.id);
      push({ title: "Archivo desvinculado", variant: "success" });
      router.refresh();
    } catch (err) {
      push({
        title: "No se pudo desvincular",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  const platformLabel =
    piece.platform === "youtube"
      ? "YouTube"
      : piece.platform === "instagram"
        ? "Instagram"
        : "plataforma";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
        <Link href={paths.platform.marketing.content}>
          <ArrowLeft className="h-4 w-4" />
          Volver al contenido
        </Link>
      </Button>

      <div className="flex min-h-[640px] overflow-hidden rounded-xl border bg-card">
        <div className="flex w-72 flex-shrink-0 flex-col gap-4 border-r p-4">
          <div className="aspect-[9/16] overflow-hidden rounded-xl bg-muted">
            {piece.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={piece.thumbnail_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ContentTypeIcon type={piece.type} size={40} />
              </div>
            )}
          </div>

          <div>
            <p className="line-clamp-3 text-sm font-medium">
              {piece.caption ?? piece.title ?? "Sin descripción"}
            </p>
            {piece.published_at ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(piece.published_at).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : null}
            {piece.platform_post_id ? (
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(piece.platform_post_id!);
                  push({ title: "ID copiado", variant: "success" });
                }}
                className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Copiar platform_post_id"
              >
                <span className="truncate">{piece.platform_post_id}</span>
                <Copy className="h-3 w-3 shrink-0" />
              </button>
            ) : null}
            {piece.platform_post_url ? (
              <a
                href={piece.platform_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-xs text-primary hover:underline"
              >
                Ver en {platformLabel} →
              </a>
            ) : null}
          </div>

          <div className="rounded-lg border p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Archivo de Drive
            </p>
            {piece.drive_file_id ? (
              <div className="flex items-start gap-2">
                <Folder className="h-5 w-5 shrink-0 text-yellow-500" aria-hidden />
                <div className="min-w-0 flex-1">
                  <a
                    href={piece.drive_file_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 text-xs font-medium text-primary hover:underline"
                  >
                    {piece.drive_file_name}
                  </a>
                  <button
                    type="button"
                    onClick={() => void handleDriveUnlink()}
                    className="mt-1 text-xs text-destructive hover:underline"
                  >
                    Desvincular
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDrivePicker(true)}
                className="text-xs text-primary hover:underline"
              >
                + Vincular archivo de Drive
              </button>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={analyzing || !piece.drive_file_id}
            onClick={() => void handleAnalyze()}
          >
            {analyzing
              ? "Analizando..."
              : piece.analysis
                ? "Re-analizar con IA"
                : "Analizar con IA"}
          </Button>

          {!piece.drive_file_id ? (
            <p className="-mt-2 text-center text-xs text-muted-foreground">
              Vinculá un archivo de Drive para analizar
            </p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex gap-0 border-b px-4">
            {(
              [
                { tab: "metricas" as const, label: "Métricas" },
                {
                  tab: "analisis" as const,
                  label: "Análisis",
                  showCheck: Boolean(piece.analysis),
                },
                { tab: "comentarios" as const, label: "Comentarios" },
                { tab: "anuncios" as const, label: "Anuncios" },
                {
                  tab: "variantes" as const,
                  label: `Variantes${variants.length > 0 ? ` (${variants.length})` : ""}`,
                },
              ] as const
            ).map((item) => (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === item.tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.label}
                  {"showCheck" in item && item.showCheck ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "metricas" ? <MetricasTab piece={piece} benchmark={benchmark} /> : null}
            {activeTab === "analisis" ? <AnalisisTab piece={piece} /> : null}
            {activeTab === "comentarios" ? (
              <ComentariosTab piece={piece} />
            ) : null}
            {activeTab === "anuncios" ? <AnunciosTab piece={piece} /> : null}
            {activeTab === "variantes" ? (
              <VariantesTab variants={variants} />
            ) : null}
          </div>
        </div>
      </div>

      {showDrivePicker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Seleccionar archivo de Google Drive</h2>
              <button
                type="button"
                onClick={() => setShowDrivePicker(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <DriveFilePicker
              onSelect={handleDriveLink}
              onClose={() => setShowDrivePicker(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricasTab({ piece, benchmark }: { piece: ContentPiece; benchmark?: ContentBenchmark | null }) {
  const metrics = piece.metrics;

  const likes    = metrics?.likes    ?? 0;
  const comments = metrics?.comments ?? 0;
  const shares   = metrics?.shares   ?? 0;
  const saves    = metrics?.saves    ?? 0;
  const views    = metrics?.views    ?? 0;
  const reach    = metrics?.reach    ?? 0;

  const interactions  = likes + comments + shares;
  const engagementRate = views > 0 ? (interactions / views) * 100 : 0;
  const saveRate       = views > 0 ? (saves / views) * 100 : 0;

  const hasMetrics = interactions > 0 || views > 0 || saves > 0;

  const kpiStats = (
    [
      { label: "Views",       value: metrics?.views,       icon: "views"       as const },
      { label: "Reach",       value: metrics?.reach,       icon: "reach"       as const },
      { label: "Impresiones", value: metrics?.impressions, icon: "impressions" as const },
      { label: "Likes",       value: metrics?.likes,       icon: "likes"       as const },
      { label: "Comentarios", value: metrics?.comments,    icon: "comments"    as const },
      { label: "Compartidos", value: metrics?.shares,      icon: "shares"      as const },
      { label: "Guardados",   value: metrics?.saves,       icon: "saves"       as const },
    ] as Array<{ label: string; value: number | undefined; icon: MetricIconName }>
  ).filter((s) => s.value !== undefined && s.value !== null);

  // Distribución: slices con valor > 0
  const distributionSlices = [
    { label: "Likes",        value: likes,    color: "#E11D48" },
    { label: "Comentarios",  value: comments, color: "#7C3AED" },
    { label: "Compartidos",  value: shares,   color: "#185FA5" },
    { label: "Guardados",    value: saves,    color: "#0F6E56" },
  ].filter((s) => s.value > 0);

  // Radar benchmark: normalizar POR EJE a 0-100 (patrón del proyecto: marketing-charts.tsx, closers-ranking.tsx)
  const showBenchmark = !!(benchmark && benchmark.totalPieces >= 2);
  const radarMetrics  = ["views", "likes", "comments", "saves", "reach"] as const;

  const pieceRaw = { views, likes, comments, saves, reach };
  const orgRaw   = {
    views:    benchmark?.avgViews    ?? 0,
    likes:    benchmark?.avgLikes    ?? 0,
    comments: benchmark?.avgComments ?? 0,
    saves:    benchmark?.avgSaves    ?? 0,
    reach:    benchmark?.avgReach    ?? 0,
  };

  // Por cada eje: el mayor valor recibe 100, el menor se escala proporcionalmente
  const normalizedPiece: Record<string, number> = {};
  const normalizedOrg:   Record<string, number> = {};
  for (const key of radarMetrics) {
    const axisMax = Math.max(pieceRaw[key], orgRaw[key], 1);
    normalizedPiece[key] = Math.round((pieceRaw[key] / axisMax) * 100);
    normalizedOrg[key]   = Math.round((orgRaw[key]   / axisMax) * 100);
  }

  return (
    <div className="space-y-6">
      {/* ── KPI chips ── */}
      {kpiStats.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {kpiStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-muted/20 p-2.5">
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MetricIcon name={stat.icon} size={12} />
                {stat.label}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums leading-tight">
                {(stat.value ?? 0).toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sin métricas disponibles.</p>
      )}

      {hasMetrics && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ── Distribución: RingDistributionChart en su propio card sin constraints de flex ── */}
          {distributionSlices.length > 0 && (
            <div className="rounded-xl border bg-card p-4 space-y-3 overflow-hidden">
              <p className="text-sm font-semibold">Distribución de interacciones</p>
              {/* El chart usa internamente max-w-[220px] aspect-square min-h-[200px];
                  NO restringir el width del contenedor para evitar conflictos de aspect-ratio */}
              <RingDistributionChart
                slices={distributionSlices}
                centerValue={(interactions + saves).toLocaleString("es-AR")}
                centerLabel="total"
              />
              {/* Leyenda debajo del donut */}
              <div className="space-y-1.5 pt-1">
                {distributionSlices.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 truncate text-xs text-muted-foreground">{s.label}</span>
                    <span className="text-xs font-semibold tabular-nums">{s.value.toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Ratios clave: stat cards con delta vs org avg ── */}
          {views > 0 && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">Ratios clave</p>
                <p className="text-xs text-muted-foreground">
                  Basado en {views.toLocaleString("es-AR")} views
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <RatioCard
                  label="Engagement rate"
                  value={engagementRate}
                  suffix="%"
                  benchmarkValue={benchmark?.avgEngagementRate}
                />
                <RatioCard
                  label="Save rate"
                  value={saveRate}
                  suffix="%"
                  benchmarkValue={benchmark?.avgSaveRate}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Radar: Esta pieza vs promedio org ── */}
      {showBenchmark && (
        <div className="rounded-xl border bg-card p-4 space-y-3 overflow-hidden">
          <div>
            <p className="text-sm font-semibold">Esta pieza vs promedio org</p>
            <p className="text-xs text-muted-foreground">
              Comparado con el promedio de {benchmark!.totalPieces} piezas del mismo tipo
            </p>
          </div>
          {/* Layout igual que closers-ranking.tsx: flex centered con leyenda al costado */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-2">
            <RadarPerformanceChart
              metrics={[
                { key: "views",    label: "Views"       },
                { key: "likes",    label: "Likes"       },
                { key: "comments", label: "Comentarios" },
                { key: "saves",    label: "Guardados"   },
                { key: "reach",    label: "Reach"       },
              ]}
              series={[
                { label: "Esta pieza",   color: "#7C3AED", values: normalizedPiece },
                { label: "Promedio org", color: "#64748B", values: normalizedOrg   },
              ]}
              className="max-w-[280px]"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#7C3AED]" />
                <span className="text-xs font-medium">Esta pieza</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#64748B]" />
                <span className="text-xs font-medium text-muted-foreground">Promedio org</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <SalesAttributionSection piece={piece} />
    </div>
  );
}

function RatioCard({
  label,
  value,
  suffix = "%",
  benchmarkValue,
}: {
  label: string;
  value: number;
  suffix?: string;
  benchmarkValue?: number;
}) {
  const roundedValue     = Math.round(value * 10) / 10;
  const roundedBenchmark = benchmarkValue != null ? Math.round(benchmarkValue * 10) / 10 : null;
  const delta            = roundedBenchmark != null ? roundedValue - roundedBenchmark : null;

  let DeltaIcon  = Minus;
  let deltaColor = "text-muted-foreground";
  if (delta != null && Math.abs(delta) >= 0.1) {
    if (delta > 0) { DeltaIcon = TrendingUp;   deltaColor = "text-emerald-500"; }
    else           { DeltaIcon = TrendingDown;  deltaColor = "text-rose-500";   }
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      <p className="text-2xl font-bold tabular-nums leading-none">
        {roundedValue.toFixed(1)}{suffix}
      </p>
      {roundedBenchmark != null && (
        <div className={cn("flex items-center gap-1 text-[10px]", deltaColor)}>
          <DeltaIcon size={10} />
          <span>org avg {roundedBenchmark.toFixed(1)}{suffix}</span>
        </div>
      )}
    </div>
  );
}

function SalesAttributionSection({ piece }: { piece: ContentPiece }) {
  const attribution = piece.sales_attributed;

  const funnelSteps = attribution
    ? [
        { label: "Leads", value: attribution.lead_count, icon: "leads" as const },
        {
          label: "Agendados",
          value: attribution.scheduled_count,
          icon: "scheduled" as const,
        },
        { label: "Cerrados", value: attribution.closed_count, icon: "closed" as const },
        {
          label: "Revenue",
          value: attribution.total_revenue,
          icon: "revenue" as const,
          isCurrency: true,
        },
      ]
    : [];

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Atribución de ventas</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Leads del inbox atribuidos a esta pieza (ventana de 7 días post-publicación).
        </p>
      </div>

      {!attribution ? (
        <div className="rounded-lg bg-muted/50 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sin atribución de ventas todavía.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los leads que escriban al inbox dentro de los 7 días posteriores a la
            publicación se atribuirán automáticamente a esta pieza.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-stretch gap-2">
            {funnelSteps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="min-w-[88px] rounded-lg border bg-card p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <MetricIcon name={step.icon} size={14} />
                    {step.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {step.isCurrency
                      ? step.value.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })
                      : step.value.toLocaleString("es-AR")}
                  </p>
                </div>
                {index < funnelSteps.length - 1 ? (
                  <span className="hidden text-muted-foreground sm:inline">
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {attribution.last_attributed_at ? (
            <p className="text-xs text-muted-foreground">
              Última atribución:{" "}
              {new Date(attribution.last_attributed_at).toLocaleString("es-AR")}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function AnalisisTab({ piece }: { piece: ContentPiece }) {
  if (!piece.analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Esta pieza no tiene análisis todavía.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vinculá el archivo de Drive y presioná Analizar con IA.
        </p>
      </div>
    );
  }

  const analysis = piece.analysis;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AnalysisCard
          label="Formato"
          dimension="formato"
          name={analysis.formato.name}
          description={analysis.formato.description}
          color="blue"
        />
        <AnalysisCard
          label="Dolor"
          dimension="dolor"
          name={analysis.dolor.name}
          description={analysis.dolor.description}
          color="orange"
        />
        <AnalysisCard
          label="Ángulo"
          dimension="angulo"
          name={analysis.angulo.name}
          description={analysis.angulo.description}
          color="purple"
        />
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          ¿Por qué funcionó?
        </p>
        <p className="text-sm">{analysis.why_it_worked}</p>
      </div>

      {analysis.video_structure && analysis.video_structure.length > 0 ? (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Estructura</p>
          <div className="space-y-2">
            {analysis.video_structure.map((section, index) => (
              <div key={index} className="rounded-lg border p-3">
                <p className="text-xs font-semibold text-primary">{section.part}</p>
                <p className="mt-1 text-sm">{section.description}</p>
                {section.script_note ? (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    {section.script_note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {piece.transcript ? (
        <details className="rounded-lg border">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
            Transcripción completa
          </summary>
          <div className="px-4 pb-4">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {piece.transcript}
            </p>
          </div>
        </details>
      ) : null}
    </div>
  );
}

function AnalysisCard({
  label,
  dimension,
  name,
  description,
  color,
}: {
  label: string;
  dimension: "formato" | "dolor" | "angulo";
  name: string;
  description: string;
  color: "blue" | "orange" | "purple";
}) {
  const colorMap = {
    blue: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
    orange:
      "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40",
    purple:
      "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40",
  };

  return (
    <div className={cn("rounded-lg border p-4", colorMap[color])}>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <AnalysisDimensionIcon dimension={dimension} size={14} />
        {label}
      </p>
      <p className="text-sm font-semibold">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ComentariosTab({ piece }: { piece: ContentPiece }) {
  if (!piece.platform_post_id) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta pieza no tiene post de Zernio asociado.
      </p>
    );
  }

  return <ZernioPostComments contentPieceId={piece.id} />;
}

function AnunciosTab({ piece }: { piece: ContentPiece }) {
  return <ZernioPostAds contentPieceId={piece.id} />;
}

function VariantesTab({ variants }: { variants: ContentPiece[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [publishVariantId, setPublishVariantId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const resetPublishDialog = () => {
    setPublishVariantId(null);
    setCaptionDraft("");
  };

  const closePublishDialog = () => {
    if (generatingCaption || publishing) return;
    resetPublishDialog();
  };

  const handleOpenPublish = async (variantId: string) => {
    setPublishVariantId(variantId);
    setCaptionDraft("");
    setGeneratingCaption(true);

    try {
      const caption = await generateVariantCaptionAction(variantId);
      setCaptionDraft(caption);
    } catch (err) {
      setPublishVariantId(null);
      push({
        title: "No se pudo generar el caption",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!publishVariantId || !captionDraft.trim()) return;

    setPublishing(true);
    try {
      await publishVariantAsZernioDraftAction(publishVariantId, captionDraft);
      push({
        title: "Variante enviada a Zernio",
        description: "El draft quedó creado en Zernio.",
        variant: "success",
      });
      resetPublishDialog();
      router.refresh();
    } catch (err) {
      push({
        title: "No se pudo enviar a Zernio",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No hay variantes generadas todavía.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Podés pedirle al Agente de Negocio que cree variantes de este contenido.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {variants.map((variant) => (
          <div key={variant.id} className="rounded-xl border p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Variante IA
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(variant.created_at).toLocaleDateString("es-AR")}
              </span>
              {variant.platform_post_id ? (
                <Badge variant="secondary" className="gap-1">
                  Enviado a Zernio
                  {variant.platform_post_url ? (
                    <a
                      href={variant.platform_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center hover:text-primary"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </Badge>
              ) : null}
            </div>

            {variant.brief ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/40">
                    <p className="text-xs text-muted-foreground">Formato</p>
                    <p className="text-xs font-medium">{variant.brief.formato?.name}</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-950/40">
                    <p className="text-xs text-muted-foreground">Dolor</p>
                    <p className="text-xs font-medium">{variant.brief.dolor?.name}</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/40">
                    <p className="text-xs text-muted-foreground">Ángulo</p>
                    <p className="text-xs font-medium">{variant.brief.angulo?.name}</p>
                  </div>
                </div>

                {variant.brief.structure?.map((section, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <p className="text-xs font-semibold text-primary">{section.part}</p>
                    <p className="mt-1 text-sm">{section.description}</p>
                    {section.example_script ? (
                      <p className="mt-2 rounded bg-muted p-2 font-mono text-xs">
                        {section.example_script}
                      </p>
                    ) : null}
                  </div>
                ))}

                {!variant.platform_post_id ? (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      onClick={() => void handleOpenPublish(variant.id)}
                      disabled={!variant.brief || generatingCaption}
                    >
                      {generatingCaption && publishVariantId === variant.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando caption…
                        </>
                      ) : (
                        "Aprobar y enviar a Zernio"
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Esta variante no tiene brief todavía.
              </p>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={publishVariantId !== null}
        onOpenChange={(open) => {
          if (!open) closePublishDialog();
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar variante a Zernio</DialogTitle>
            <DialogDescription>
              Revisá y editá el caption antes de crear el draft en Zernio.
            </DialogDescription>
          </DialogHeader>

          {generatingCaption ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando caption con IA…
            </div>
          ) : (
            <Textarea
              value={captionDraft}
              onChange={(event) => setCaptionDraft(event.target.value)}
              rows={8}
              className="min-h-[180px] resize-y"
              placeholder="Caption para el post…"
            />
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closePublishDialog}
              disabled={generatingCaption || publishing}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleConfirmPublish()}
              disabled={
                generatingCaption || publishing || captionDraft.trim().length === 0
              }
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                "Confirmar envío"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
