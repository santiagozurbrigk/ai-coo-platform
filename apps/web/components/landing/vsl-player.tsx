import { Play } from "lucide-react";

const VSL_URL = process.env.NEXT_PUBLIC_VSL_URL?.trim();

function embedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

export function VslPlayer() {
  if (VSL_URL) {
    return (
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10">
        <div className="relative aspect-video w-full">
          <iframe
            src={embedUrl(VSL_URL)}
            title="Cómo funciona Optimiza Tu Control"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/80 via-[#1a0a2e] to-[#0A0A0A]">
      <div className="relative flex aspect-video flex-col items-center justify-center">
        <button
          type="button"
          aria-label="Reproducir video"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition-colors hover:bg-white/20"
        >
          <Play className="h-10 w-10 translate-x-0.5 text-white" strokeWidth={2} fill="currentColor" />
        </button>
        <div className="absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/60">
          Video · 3:12
        </div>
      </div>
    </div>
  );
}
