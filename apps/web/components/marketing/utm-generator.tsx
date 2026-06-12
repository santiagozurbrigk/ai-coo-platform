"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button, Input, Label, cn } from "@ai-coo/ui";
import { createUTMLinkAction } from "@/app/marketing/actions";
import { slugifyCampaign } from "@/lib/utm/slugify-campaign";
import type { ContentAssetView } from "@/app/marketing/actions";
import { UTM_CONTENT_OPTIONS } from "@/types/utm";
import type { UTMLinkRow } from "@/types/utm";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://www.optimizatucontrol.com";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-[#1A1A1A]";

type VideoOption =
  | { kind: "youtube"; id: string; title: string }
  | { kind: "manual"; title: string };

function buildFullUrl(campaign: string, content?: string): string {
  const params = new URLSearchParams({
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: campaign,
  });
  if (content) params.set("utm_content", content);
  return `${BASE_URL}?${params.toString()}`;
}

export function UTMGenerator({
  youtubeVideos,
  onCreated,
}: {
  youtubeVideos: ContentAssetView[];
  onCreated: (link: UTMLinkRow) => void;
}) {
  const [videoMode, setVideoMode] = useState<"select" | "manual">(
    youtubeVideos.length > 0 ? "select" : "manual"
  );
  const [selectedVideoId, setSelectedVideoId] = useState(
    youtubeVideos[0]?.id ?? ""
  );
  const [manualTitle, setManualTitle] = useState("");
  const [campaign, setCampaign] = useState("");
  const [campaignTouched, setCampaignTouched] = useState(false);
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedVideo = useMemo((): VideoOption | null => {
    if (videoMode === "manual") {
      const title = manualTitle.trim();
      return title ? { kind: "manual", title } : null;
    }
    const asset = youtubeVideos.find((v) => v.id === selectedVideoId);
    if (!asset) return null;
    return { kind: "youtube", id: asset.id, title: asset.title };
  }, [videoMode, manualTitle, selectedVideoId, youtubeVideos]);

  const videoTitle = selectedVideo?.title ?? "";

  const effectiveCampaign =
    campaign.trim() ||
    (videoTitle ? slugifyCampaign(videoTitle) : "");

  const generatedUrl = effectiveCampaign
    ? buildFullUrl(effectiveCampaign, content || undefined)
    : "";

  function handleVideoTitleChange(title: string) {
    if (videoMode === "manual") setManualTitle(title);
    if (!campaignTouched && title.trim()) {
      setCampaign(slugifyCampaign(title));
    }
  }

  function handleSelectVideo(id: string) {
    setSelectedVideoId(id);
    const asset = youtubeVideos.find((v) => v.id === id);
    if (asset && !campaignTouched) {
      setCampaign(slugifyCampaign(asset.title));
    }
  }

  async function copyUrl() {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    setError(null);
    if (!effectiveCampaign) {
      setError("Ingresá un nombre de campaña.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createUTMLinkAction({
          youtube_video_id:
            selectedVideo?.kind === "youtube" ? selectedVideo.id : undefined,
          youtube_video_title: videoTitle || undefined,
          utm_campaign: effectiveCampaign,
          utm_content: content || undefined,
        });
        if (result.success && result.data) {
          onCreated(result.data);
          setCampaign("");
          setCampaignTouched(false);
          setManualTitle("");
          setContent("");
        } else if (!result.success) {
          setError(result.error);
        }
      } catch {
        setError("No se pudo guardar el UTM.");
      }
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-border/60 bg-card/40 p-5 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
      <div>
        <h2 className="text-base font-medium text-foreground">Nuevo UTM</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generá un link trackeable para tus videos de YouTube.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Video de YouTube</Label>
        {youtubeVideos.length > 0 ? (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={videoMode === "select" ? "default" : "outline"}
              onClick={() => setVideoMode("select")}
            >
              De integración
            </Button>
            <Button
              type="button"
              size="sm"
              variant={videoMode === "manual" ? "default" : "outline"}
              onClick={() => setVideoMode("manual")}
            >
              Manual
            </Button>
          </div>
        ) : null}

        {videoMode === "select" && youtubeVideos.length > 0 ? (
          <select
            className={SELECT_CLASS}
            value={selectedVideoId}
            onChange={(e) => handleSelectVideo(e.target.value)}
          >
            {youtubeVideos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        ) : (
          <Input
            placeholder="Título del video (ej. Cómo escalé a $100k)"
            value={manualTitle}
            onChange={(e) => handleVideoTitleChange(e.target.value)}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="utm-campaign">Campaña (utm_campaign)</Label>
        <Input
          id="utm-campaign"
          placeholder="como-escale-a-100k"
          value={campaign}
          onChange={(e) => {
            setCampaignTouched(true);
            setCampaign(e.target.value);
          }}
        />
        <p className="text-xs text-muted-foreground">
          Identificador único por video. Se auto-genera del título.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="utm-content">Ubicación del link (utm_content)</Label>
        <select
          id="utm-content"
          className={cn(SELECT_CLASS)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        >
          <option value="">Sin especificar</option>
          {UTM_CONTENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>URL generada</Label>
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground dark:border-glass dark:bg-glass-elevated">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-mono">
              {generatedUrl || "Completá la campaña para ver la URL"}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!generatedUrl}
            onClick={() => void copyUrl()}
            aria-label="Copiar URL"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        disabled={pending || !effectiveCampaign}
        onClick={handleSave}
        className="w-full"
      >
        {pending ? "Guardando…" : "Guardar UTM"}
      </Button>
    </div>
  );
}
