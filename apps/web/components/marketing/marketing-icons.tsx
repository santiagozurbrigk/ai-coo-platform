import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clapperboard,
  DollarSign,
  Eye,
  FileText,
  Film,
  Folder,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Play,
  Presentation,
  Share2,
  Smartphone,
  Sparkles,
  Target,
  Video,
  Zap,
} from "lucide-react";
import { cn } from "@ai-coo/ui";

const FOLDER_MIME = "application/vnd.google-apps.folder";

type IconProps = {
  size?: number;
  className?: string;
};

export function DriveMimeIcon({
  mimeType,
  size = 16,
  className,
}: IconProps & { mimeType: string }) {
  const iconClass = cn("shrink-0", className);

  if (mimeType === FOLDER_MIME) {
    return (
      <Folder size={size} className={cn("text-yellow-500", iconClass)} aria-hidden />
    );
  }
  if (mimeType.startsWith("video/")) {
    return <Film size={size} className={iconClass} aria-hidden />;
  }
  if (mimeType.startsWith("image/")) {
    return <ImageIcon size={size} className={iconClass} aria-hidden />;
  }
  if (mimeType.includes("pdf")) {
    return <FileText size={size} className={iconClass} aria-hidden />;
  }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <BarChart3 size={size} className={iconClass} aria-hidden />;
  }
  if (mimeType.includes("document") || mimeType.includes("word")) {
    return <FileText size={size} className={iconClass} aria-hidden />;
  }
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    return <Presentation size={size} className={iconClass} aria-hidden />;
  }
  return <FileText size={size} className={iconClass} aria-hidden />;
}

export function ContentTypeIcon({
  type,
  size = 16,
  className,
}: IconProps & { type: string | null | undefined }) {
  const iconClass = cn("shrink-0 text-muted-foreground", className);
  const normalized = (type ?? "post").toLowerCase();

  if (normalized === "reel" || normalized === "youtube") {
    return <Film size={size} className={iconClass} aria-hidden />;
  }
  if (normalized === "story") {
    return <Smartphone size={size} className={iconClass} aria-hidden />;
  }
  if (normalized === "carousel") {
    return <ImageIcon size={size} className={iconClass} aria-hidden />;
  }
  if (normalized === "brief") {
    return <Sparkles size={size} className={iconClass} aria-hidden />;
  }
  if (normalized === "vsl") {
    return <Clapperboard size={size} className={iconClass} aria-hidden />;
  }
  return <FileText size={size} className={iconClass} aria-hidden />;
}

export type MetricIconName =
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "reach"
  | "impressions"
  | "views"
  | "leads"
  | "scheduled"
  | "closed"
  | "revenue";

const METRIC_ICONS: Record<MetricIconName, LucideIcon> = {
  likes: Heart,
  comments: MessageCircle,
  shares: Share2,
  saves: Bookmark,
  reach: Eye,
  impressions: BarChart3,
  views: Play,
  leads: MessageCircle,
  scheduled: Calendar,
  closed: CheckCircle2,
  revenue: DollarSign,
};

export function MetricIcon({
  name,
  size = 14,
  className,
}: IconProps & { name: MetricIconName }) {
  const Icon = METRIC_ICONS[name];
  return (
    <Icon size={size} className={cn("text-muted-foreground", className)} aria-hidden />
  );
}

export function AnalysisDimensionIcon({
  dimension,
  size = 14,
  className,
}: IconProps & { dimension: "formato" | "dolor" | "angulo" }) {
  const iconClass = cn("text-muted-foreground", className);
  if (dimension === "formato") {
    return <Video size={size} className={iconClass} aria-hidden />;
  }
  if (dimension === "dolor") {
    return <Zap size={size} className={iconClass} aria-hidden />;
  }
  return <Target size={size} className={iconClass} aria-hidden />;
}
