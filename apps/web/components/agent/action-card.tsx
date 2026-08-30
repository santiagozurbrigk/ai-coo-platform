import Link from "next/link";
import { File, FileText } from "lucide-react";
import { paths } from "@/routes/paths";
import type { AgentMessageActionType } from "@/types/agent";

export function ActionCard({
  action,
  refId,
}: {
  action: AgentMessageActionType;
  refId: string;
}) {
  const config =
    action === "created_sop"
      ? {
          icon: <FileText className="h-4 w-4 text-green-400" />,
          label: "SOP creado",
          description: "Guardado en la biblioteca de SOPs",
          link: paths.platform.sops.detail(refId),
          linkLabel: "Ver SOP →",
        }
      : {
          icon: <File className="h-4 w-4 text-blue-400" />,
          label: "Documento creado",
          description: "Guardado en Base de conocimiento",
          link: paths.platform.businessContext.viewer(refId),
          linkLabel: "Ver documento →",
        };

  return (
    <div className="agent-action-card mt-1 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs">
      {config.icon}
      <div className="flex-1">
        <p className="font-medium text-foreground/80">{config.label}</p>
        <p className="text-muted-foreground">{config.description}</p>
      </div>
      <Link
        href={config.link}
        className="text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        {config.linkLabel}
      </Link>
    </div>
  );
}
