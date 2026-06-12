import { PlayCircle } from "lucide-react";

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
      <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111]">
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
    <div className="mx-auto w-full max-w-[720px]">
      {/* TODO: reemplazar src con URL del VSL cuando esté listo (NEXT_PUBLIC_VSL_URL) */}
      <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#111111] px-6">
        <PlayCircle
          className="h-16 w-16 text-[#7C3AED]"
          strokeWidth={1.25}
          aria-hidden
        />
        <p className="mt-4 text-sm text-white/50">Ver cómo funciona</p>
      </div>
    </div>
  );
}
