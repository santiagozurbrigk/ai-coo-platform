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
import { GaugeTargetChart } from "@/components/charts/platform/gauge-target-chart";
import { CategoryBarChart } from "@/components/charts/platform/category-bar-chart";

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

  const likes = metrics?.likes ?? 0;
  const comments = metrics?.comments ?? 0;
  const shares = metrics?.shares ?? 0;
  const saves = metrics?.saves ?? 0;
  const views = metrics?.views ?? 0;
  const reach = metrics?.reach ?? 0;

  const interactions = likes + comments + shares;
  const engagementRate = views > 0 ? (interactions / views) * 100 : 0;
  const saveRate = views > 0 ? (saves / views) * 100 : 0;

  const hasMetrics = interactions > 0 || views > 0 || saves > 0;

  const kpiStats = (
    [
      { label: "Views", value: metrics?.views, icon: "views" as const },
      { label: "Reach", value: metrics?.reach, icon: "reach" as const },
      { label: "Impresiones", value: metrics?.impressions, icon: "impressions" as const },
      { label: "Likes", value: metrics?.likes, icon: "likes" as const },
      { label: "Comentarios", value: metrics?.comments, icon: "comments" as const },
      { label: "Compartidos", value: metrics?.shares, icon: "shares" as const },
      { label: "Guardados", value: metrics?.saves, icon: "saves" as const },
    ] as Array<{ label: string; value: number | undefined; icon: MetricIconName }>
  ).filter((s) => s.value !== undefined && s.value !== null);

  // Benchmark comparison items
  const benchmarkRows = benchmark && benchmark.totalPieces >= 2
    ? [
        { label: "Views", pieceValue: views, orgAvg: benchmark.avgViews },
        { label: "Likes", pieceValue: likes, orgAvg: benchmark.avgLikes },
        { label: "Comentarios", pieceValue: comments, orgAvg: benchmark.avgComments },
        { label: "Guardados", pieceValue: saves, orgAvg: benchmark.avgSaves },
        { label: "Reach", pieceValue: reach, orgAvg: benchmark.avgReach },
      ].filter((r) => r.pieceValue > 0 || r.orgAvg > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* KPI row */}
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

      {/* Gráficos Bklit */}
      {hasMetrics && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Distribución de interacciones — RingDistributionChart */}
          {interactions + saves > 0 && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">Distribución de interacciones</p>
                <p className="text-xs text-muted-foreground">Likes · Comentarios · Compartidos · Guardados</p>
              </div>
              <div className="flex items-center gap-4">
                <RingDistributionChart
                  slices={[
                    { label: "Likes", value: likes, color: "#E11D48" },
                    { label: "Comentarios", value: comments, color: "#7C3AED" },
                    { label: "Compartidos", value: shares, color: "#185FA5" },
                    { label: "Guardados", value: saves, color: "#0F6E56" },
                  ].filter((s) => s.value > 0)}
                  centerValue={(interactions + saves).toLocaleString("es-AR")}
                  centerLabel="total"
                  className="max-w-[150px]"
                  emptyMessage="Sin interacciones"
                />
                <div className="space-y-2 flex-1 min-w-0">
                  {[
                    { label: "Likes", value: likes, color: "#E11D48" },
                    { label: "Comentarios", value: comments, color: "#7C3AED" },
                    { label: "Compartidos", value: shares, color: "#185FA5" },
                    { label: "Guardados", value: saves, color: "#0F6E56" },
                  ].filter((s) => s.value > 0).map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{s.label}</span>
                      <span className="text-xs font-semibold tabular-nums">{s.value.toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ratios clave — GaugeTargetChart */}
          {views > 0 && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">Ratios clave</p>
                <p className="text-xs text-muted-foreground">
                  Basado en {views.toLocaleString("es-AR")} views
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-center text-[10px] text-muted-foreground">Engagement rate</p>
                  <GaugeTargetChart
                    value={Math.round(engagementRate * 10) / 10}
                    max={Math.max(20, Math.ceil(engagementRate * 1.5))}
                    target={benchmark?.avgEngagementRate}
                    label="engagement"
                    suffix="%"
                    variant="booking"
                    className="h-[120px]"
                    subtitle={
                      benchmark?.avgEngagementRate != null
                        ? `Promedio org: ${benchmark.avgEngagementRate.toFixed(1)}%`
                        : undefined
                    }
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-center text-[10px] text-muted-foreground">Save rate</p>
                  <GaugeTargetChart
                    value={Math.round(saveRate * 10) / 10}
                    max={Math.max(10, Math.ceil(saveRate * 1.5))}
                    target={benchmark?.avgSaveRate}
                    label="guardados"
                    suffix="%"
                    variant="default"
                    className="h-[120px]"
                    subtitle={
                      benchmark?.avgSaveRate != null
                        ? `Promedio org: ${benchmark.avgSaveRate.toFixed(1)}%`
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Esta pieza vs promedio org — CategoryBarChart horizontal por métrica */}
      {benchmarkRows.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold">Esta pieza vs promedio de la org</p>
            <p className="text-xs text-muted-foreground">
              Comparado con el promedio de {benchmark!.totalPieces} piezas del mismo tipo
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-primary">Esta pieza</p>
              <CategoryBarChart
                horizontal
                items={benchmarkRows.map((r) => ({
                  label: r.label,
                  value: r.pieceValue,
                  color: "var(--primary)",
                }))}
                barFill="var(--primary)"
                className="min-h-[180px]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Promedio org</p>
              <CategoryBarChart
                horizontal
                items={benchmarkRows.map((r) => ({
                  label: r.label,
                  value: r.orgAvg,
                }))}
                barFill="var(--chart-bar-mono, var(--muted-foreground))"
                className="min-h-[180px]"
              />
            </div>
          </div>
        </div>
      )}

      <SalesAttributionSection piece={piece} />
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
