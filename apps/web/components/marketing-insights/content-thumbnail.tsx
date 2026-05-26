import { Film, ImageIcon, Layers, Mic, Play, Radio } from "lucide-react";
import { Badge, cn } from "@ai-coo/ui";
import type { ContentAsset, ContentType } from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "./content-labels";

const TYPE_ICON: Record<ContentType, typeof Play> = {
  reel: Play,
  story: Radio,
  carousel: Layers,
  webinar: Mic,
  vsl: Film,
  post: ImageIcon,
};

export function ContentThumbnail({
  content,
  size = "md",
  className,
}: {
  content: Pick<ContentAsset, "title" | "type" | "thumbnailHue">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = TYPE_ICON[content.type];
  const heights = { sm: "h-28", md: "h-40", lg: "h-56" };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/60",
        heights[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${content.thumbnailHue} 60% 35% / 0.9), hsl(${content.thumbnailHue} 40% 12% / 1))`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm ring-1 ring-white/20">
          <Icon className="h-5 w-5 text-white/90" />
        </div>
      </div>
      <Badge
        variant="secondary"
        className="absolute left-2 top-2 bg-black/40 text-2xs backdrop-blur-sm"
      >
        {CONTENT_TYPE_LABEL[content.type]}
      </Badge>
      <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-2xs font-medium text-white line-clamp-2">
        {content.title}
      </p>
    </div>
  );
}
