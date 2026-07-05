"use client";

import { Download, FileText, Sheet, File } from "lucide-react";
import type { AgentMessageAttachment } from "@/types/agent";

interface DocumentCardProps {
  attachment: AgentMessageAttachment;
}

function getFileIcon(type: string) {
  if (type.includes("word") || type.includes("docx"))
    return <FileText className="h-5 w-5 text-blue-400" />;
  if (type.includes("sheet") || type.includes("xlsx"))
    return <Sheet className="h-5 w-5 text-emerald-400" />;
  if (type.includes("pdf"))
    return <File className="h-5 w-5 text-red-400" />;
  return <FileText className="h-5 w-5 text-muted-foreground" />;
}

function getTypeLabel(type: string) {
  if (type.includes("word") || type.includes("docx")) return "Word";
  if (type.includes("sheet") || type.includes("xlsx")) return "Excel";
  if (type.includes("pdf")) return "PDF";
  if (type.includes("csv")) return "CSV";
  return "Documento";
}

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({ attachment }: DocumentCardProps) {
  const typeLabel = getTypeLabel(attachment.type);
  const sizeLabel = formatBytes(attachment.sizeBytes);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
        {getFileIcon(attachment.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">
          {typeLabel}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
      </div>
      {attachment.url ? (
        <a
          href={attachment.url}
          download={attachment.name}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Descargar"
        >
          <Download className="h-4 w-4" />
        </a>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40">
          <Download className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
