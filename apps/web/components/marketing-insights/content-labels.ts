import type { ContentType } from "@/types/marketing-insights";

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  reel: "Reel",
  story: "Story",
  carousel: "Carrusel",
  webinar: "Webinar",
  vsl: "VSL",
  post: "Post",
};

export const CONTENT_FILTER_OPTIONS: { key: ContentType | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "reel", label: "Reels" },
  { key: "post", label: "Posts" },
  { key: "carousel", label: "Carruseles" },
  { key: "story", label: "Stories" },
  { key: "vsl", label: "VSLs" },
];
