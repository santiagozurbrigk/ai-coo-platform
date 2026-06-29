"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilePlus, Trash2 } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { deleteDocumentAction } from "@/app/business-context/actions";
import { paths } from "@/routes";
import { useToast } from "@/providers/toast-provider";
import type { ContextDocument } from "@/types/business-context";
import { SuggestedCallTasksPanel } from "./suggested-call-tasks-panel";

export function DocumentViewerSidebar({
  document,
}: {
  document: ContextDocument;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isManual = document.sourceType === "manual";

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    startTransition(async () => {
      const res = await deleteDocumentAction(document.id);
      if (!res.success) {
        push({ title: "No se pudo eliminar", description: res.error });
        setConfirmDelete(false);
        return;
      }
      push({
        title: "Documento eliminado",
        description: "Se quitó de la base de conocimiento y del índice RAG.",
        variant: "success",
      });
      router.push(paths.platform.businessContext.documents);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <SuggestedCallTasksPanel document={document} />

      <Panel title="Acciones">
        <div className="flex flex-col gap-2">
          {isManual ? (
            <Button
              type="button"
              variant={confirmDelete ? "destructive" : "outline"}
              size="sm"
              className="justify-start gap-2"
              disabled={pending}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              {pending
                ? "Eliminando…"
                : confirmDelete
                  ? "Confirmar eliminación"
                  : "Eliminar documento"}
            </Button>
          ) : null}
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
