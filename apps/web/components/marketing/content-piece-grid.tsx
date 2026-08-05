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
  const likes = piece.metrics?.likes ?? 0;
  const reach = piece.metrics?.reach ?? piece.metrics?.impressions ?? 0;

  return (
    <Link
      href={paths.platform.marketing.contentDetail(piece.id)}
      className={cn(
        "group block overflow-hidden rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        "dark:border-white/[0.07] dark:bg-white/[0.04] hover:dark:bg-white/[0.07]"
      )}
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

        {/* Bottom gradient overlay */}
        {piece.thumbnail_url && (
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        )}

        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {TYPE_LABEL[piece.type] ?? piece.type}
        </span>

        {piece.analysis ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
            <Check className="h-3 w-3" aria-hidden />
            IA
          </span>
        ) : null}

        {/* Metrics overlay at bottom */}
        {likes > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-white drop-shadow">
              <Heart className="h-3 w-3" aria-hidden />
              {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes.toLocaleString("es-AR")}
            </span>
            {reach > 0 && (
              <span className="text-[10px] text-white/70 drop-shadow">
                {reach > 999 ? `${(reach / 1000).toFixed(0)}k` : reach} alc.
              </span>
            )}
          </div>
        )}

        {piece.drive_file_id ? (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] text-gray-700 backdrop-blur-sm">
            <Folder className="h-3 w-3 text-yellow-500" aria-hidden />
            Drive
          </span>
        ) : null}
      </div>

      <div className="p-2.5">
        <p className="line-clamp-2 text-xs font-medium leading-snug">
          {piece.title ?? piece.caption?.slice(0, 60) ?? "Sin título"}
        </p>

        {piece.analysis?.angulo ? (
          <p className="mt-1 line-clamp-1 text-[10px] italic text-muted-foreground">
            {piece.analysis.angulo.name}
          </p>
        ) : (
          <span
            className={cn(
              "mt-1 inline-block rounded px-1 py-0.5 text-[10px]",
              SOURCE_COLOR[piece.source] ?? SOURCE_COLOR.manual
            )}
          >
            {piece.source === "zernio"
              ? "Instagram"
              : piece.source === "ai_generated"
                ? "IA generado"
                : "Manual"}
          </span>
        )}
      </div>
    </Link>
  );
}
