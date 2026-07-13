"use client";

import Link from "next/link";
import type { ContentPiece } from "@/types/content";
import { paths } from "@/routes";
import { cn } from "@ai-coo/ui";
import { Check, Folder, Heart } from "lucide-react";
import { ContentTypeIcon } from "@/components/marketing/marketing-icons";

type Props = {
  pieces: ContentPiece[];
};

const TYPE_LABEL: Record<string, string> = {
  reel: "Reel",
  story: "Historia",
  post: "Post",
  carousel: "Carrusel",
  youtube: "YouTube",
  brief: "Brief IA",
};

const SOURCE_COLOR: Record<string, string> = {
  zernio: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ai_generated: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  manual: "bg-muted text-muted-foreground",
};

export function ContentPieceGrid({ pieces }: Props) {
  if (pieces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No hay piezas de contenido todavía.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          El contenido de Instagram se sincroniza automáticamente desde Zernio.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {pieces.map((piece) => (
        <ContentPieceCard key={piece.id} piece={piece} />
      ))}
    </div>
  );
}

function ContentPieceCard({ piece }: { piece: ContentPiece }) {
  return (
    <Link
      href={paths.platform.marketing.contentDetail(piece.id)}
      className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-muted">
        {piece.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={piece.thumbnail_url}
            alt={piece.title ?? "Contenido"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ContentTypeIcon type={piece.type} size={32} />
          </div>
        )}

        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
          {TYPE_LABEL[piece.type] ?? piece.type}
        </span>

        {piece.analysis ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-green-500 px-1.5 py-0.5 text-xs text-white">
            <Check className="h-3 w-3" aria-hidden />
            Analizado
          </span>
        ) : null}

        {piece.drive_file_id ? (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-700">
            <Folder className="h-3 w-3 text-yellow-500" aria-hidden />
            Drive
          </span>
        ) : null}
      </div>

      <div className="p-3">
        <p className="mb-1 line-clamp-2 text-xs font-medium">
          {piece.title ?? piece.caption?.slice(0, 60) ?? "Sin título"}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs",
              SOURCE_COLOR[piece.source] ?? SOURCE_COLOR.manual
            )}
          >
            {piece.source === "zernio"
              ? "Instagram"
              : piece.source === "ai_generated"
                ? "IA"
                : "Manual"}
          </span>

          {piece.metrics ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" aria-hidden />
              {(piece.metrics.likes ?? 0).toLocaleString("es-AR")}
            </span>
          ) : null}
        </div>

        {piece.analysis?.angulo ? (
          <p className="mt-1.5 line-clamp-1 text-xs italic text-muted-foreground">
            {piece.analysis.angulo.name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
