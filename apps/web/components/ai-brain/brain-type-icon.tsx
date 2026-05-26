import {
  BookOpen,
  FileText,
  Image,
  Layout,
  MessageSquareText,
  ScrollText,
} from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { BrainContentType } from "@/types/ai-brain";

const CONFIG: Record<
  BrainContentType,
  { icon: typeof FileText; label: string }
> = {
  document: { icon: FileText, label: "Documento" },
  image: { icon: Image, label: "Imagen" },
  transcript: { icon: MessageSquareText, label: "Transcripción" },
  miro: { icon: Layout, label: "Miro Board" },
  framework: { icon: ScrollText, label: "Framework" },
  playbook: { icon: BookOpen, label: "Playbook" },
};

export function BrainTypeIcon({
  type,
  showLabel = false,
  className,
}: {
  type: BrainContentType;
  showLabel?: boolean;
  className?: string;
}) {
  const { icon: Icon, label } = CONFIG[type];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
      {showLabel && <span className="text-sm">{label}</span>}
    </span>
  );
}

export function brainTypeLabel(type: BrainContentType): string {
  return CONFIG[type].label;
}
