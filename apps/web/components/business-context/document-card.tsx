import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { ContextDocument } from "@/types/business-context";

const CATEGORY_LABEL: Record<ContextDocument["category"], string> = {
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Capacitación",
  sales: "Ventas",
  operations: "Operaciones",
};

export function DocumentCard({ document }: { document: ContextDocument }) {
  return (
    <Link href={paths.platform.businessContext.viewer(document.id)}>
      <Card className="h-full transition-colors hover:bg-muted/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{document.title}</CardTitle>
            <Badge variant="secondary">{CATEGORY_LABEL[document.category]}</Badge>
          </div>
          <p className="text-2xs text-muted-foreground">{document.source}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {document.thumbnailUrl && (
            <div
              className="aspect-video rounded-md bg-muted/40 bg-cover bg-center"
              style={{ backgroundImage: `url(${document.thumbnailUrl})` }}
            />
          )}
          {!document.thumbnailUrl && document.sourceType && (
            <div className="aspect-video rounded-md bg-muted/30 flex items-center justify-center text-2xs text-muted-foreground uppercase">
              {document.sourceType.replace("_", " ")}
            </div>
          )}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {document.summary}
          </p>
          {document.status && (
            <Badge variant={document.status === "indexed" ? "success" : "secondary"}>
              {document.status === "indexed" ? "Indexado" : document.status}
            </Badge>
          )}
          {document.linkedSops.length > 0 && (
            <p className="mt-2 text-2xs text-primary">
              {document.linkedSops.length} SOP(s) vinculado(s)
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
