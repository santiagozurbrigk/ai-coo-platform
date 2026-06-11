import Link from "next/link";
import { Archive, FilePlus, Pencil } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { getSopById } from "@/mocks/sops";
import { paths } from "@/routes";
import type { ContextDocument } from "@/types/business-context";

export function DocumentViewerSidebar({
  document,
}: {
  document: ContextDocument;
}) {
  const linkedSops = document.linkedSops
    .map((id) => getSopById(id))
    .filter((sop): sop is NonNullable<typeof sop> => sop != null);

  return (
    <div className="space-y-4">
      {linkedSops.length > 0 ? (
        <Panel title="SOPs vinculados">
          <ul className="space-y-2">
            {linkedSops.map((sop) => (
              <li key={sop.id}>
                <Link
                  href={paths.platform.sops.detail(sop.id)}
                  className="block rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm transition-colors hover:border-violet-500/25 hover:bg-muted/35 dark:border-white/[0.08] dark:bg-[#222222]"
                >
                  <p className="font-medium leading-snug">{sop.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {sop.lastUpdated}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <Panel title="SOPs vinculados">
          <p className="text-sm text-muted-foreground">
            Sin SOPs vinculados a este documento.
          </p>
        </Panel>
      )}

      {document.topics && document.topics.length > 0 ? (
        <Panel title="Temas detectados">
          <div className="flex flex-wrap gap-2">
            {document.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </Panel>
      ) : null}

      {document.participants && document.participants.length > 0 ? (
        <Panel title="Participantes">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {document.participants.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Acciones">
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" size="sm" className="justify-start gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button type="button" variant="outline" size="sm" className="justify-start gap-2">
            <Archive className="h-4 w-4" />
            Archivar
          </Button>
          <Button
            asChild
            size="sm"
            className="justify-start gap-2 bg-violet-600 hover:bg-violet-700"
          >
            <Link href={`${paths.platform.operations.sops}#crear`}>
              <FilePlus className="h-4 w-4" />
              Generar SOP
            </Link>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
