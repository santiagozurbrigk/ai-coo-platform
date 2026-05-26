import { notFound } from "next/navigation";
import { SopStatusBadge } from "@/components/sops";
import { Panel } from "@/components/shared/panel";
import { getSopById } from "@/mocks";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sop = getSopById(id);
  if (!sop) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{sop.title}</h2>
        <SopStatusBadge status={sop.status} />
      </div>
      <Panel title="Objetivo">
        <p className="text-sm text-muted-foreground">{sop.goal}</p>
      </Panel>
      <Panel title="Contenido del SOP">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          [Cuerpo mock — en producción se muestra el SOP generado por IA desde el
          Contexto de Negocio.]
        </p>
      </Panel>
    </div>
  );
}
