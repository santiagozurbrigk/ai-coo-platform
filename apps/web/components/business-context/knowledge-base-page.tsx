"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  cn,
} from "@ai-coo/ui";
import {
  FileText,
  Film,
  LayoutGrid,
  Plus,
  Sheet,
  Upload,
  Video,
} from "lucide-react";
import type { ContextDocument } from "@/types/business-context";
import { DocumentGrid } from "./document-grid";

const CONTENT_TYPES = [
  { id: "document", label: "Documento", icon: FileText },
  { id: "meeting", label: "Reunión", icon: Video },
  { id: "miro", label: "Miro Board", icon: LayoutGrid },
  { id: "spreadsheet", label: "Hoja de cálculo", icon: Sheet },
  { id: "loom", label: "Loom", icon: Film },
  { id: "local", label: "Archivo local", icon: Upload },
] as const;

export function KnowledgeBasePage({
  documents: initial,
}: {
  documents: ContextDocument[];
}) {
  const [documents, setDocuments] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState<
    "pick" | "document" | "meeting" | "miro" | "loom" | "spreadsheet" | "local"
  >("pick");

  const closeAdd = () => {
    setAddOpen(false);
    setStep("pick");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Añadir contenido</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Documentos, reuniones Fathom, tableros Miro, Loom y archivos locales
          </p>
        </div>
        <Button size="lg" className="gap-2 shrink-0" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Añadir contenido
        </Button>
      </div>

      <DocumentGrid documents={documents} />

      <Dialog open={addOpen} onOpenChange={(o) => !o && closeAdd()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === "pick" ? "¿Qué quieres añadir?" : "Añadir contenido"}
            </DialogTitle>
          </DialogHeader>
          {step === "pick" && (
            <div className="grid grid-cols-2 gap-3 py-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setStep(
                      t.id as
                        | "document"
                        | "meeting"
                        | "miro"
                        | "spreadsheet"
                        | "loom"
                        | "local"
                    )
                  }
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
                >
                  <t.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          )}
          {step === "document" && (
            <AddDocumentFlow
              onBack={() => setStep("pick")}
              onDone={(doc) => {
                setDocuments((d) => [doc, ...d]);
                closeAdd();
              }}
            />
          )}
          {step === "meeting" && (
            <IntegrationFlow
              provider="Fathom"
              connected
              onBack={() => setStep("pick")}
              items={[
                { title: "Kickoff — Laura Gómez", meta: "24 may · 42 min" },
                { title: "Discovery — Martín R.", meta: "20 may · 38 min" },
              ]}
              actionLabel="Importar transcripciones"
            />
          )}
          {step === "miro" && (
            <IntegrationFlow
              provider="Miro"
              connected={false}
              onBack={() => setStep("pick")}
            />
          )}
          {step === "loom" && (
            <IntegrationFlow
              provider="Loom"
              connected={false}
              onBack={() => setStep("pick")}
            />
          )}
          {(step === "spreadsheet" || step === "local") && (
            <div className="py-4 space-y-4">
              <button
                type="button"
                className="text-sm text-primary"
                onClick={() => setStep("pick")}
              >
                ← Volver
              </button>
              <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
                Zona de arrastrar y soltar
                <br />
                <span className="text-xs">.pdf .docx .txt .md · .xlsx .csv</span>
              </div>
              <Button className="w-full" onClick={closeAdd}>
                Añadir a la base de conocimiento (mock)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddDocumentFlow({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (doc: ContextDocument) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <button type="button" className="text-sm text-primary" onClick={onBack}>
        ← Volver
      </button>
      <div className="grid grid-cols-3 gap-2">
        {["Google Drive", "Google Docs", "Archivo local"].map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-lg border border-border px-2 py-3 text-xs hover:bg-muted/40"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
        Selector de archivos con vista previa (mock)
      </div>
      <Button
        className="w-full"
        onClick={() =>
          onDone({
            id: `doc-${Date.now()}`,
            title: "Documento importado",
            category: "operations",
            source: "Google Drive",
            sourceType: "google_drive",
            summary: "Contenido indexado para la IA.",
            updatedAt: new Date().toISOString(),
            linkedSops: [],
            status: "indexed",
          })
        }
      >
        Añadir a la base de conocimiento
      </Button>
    </div>
  );
}

function IntegrationFlow({
  provider,
  connected,
  onBack,
  items = [],
  actionLabel = "Conectar en Integraciones",
}: {
  provider: string;
  connected: boolean;
  onBack: () => void;
  items?: { title: string; meta: string }[];
  actionLabel?: string;
}) {
  return (
    <div className="space-y-4 py-2">
      <button type="button" className="text-sm text-primary" onClick={onBack}>
        ← Volver
      </button>
      {!connected ? (
        <p className="text-sm text-muted-foreground">
          Conecta {provider} en Integraciones para importar contenido.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-border p-3"
            >
              <div className="h-12 w-16 rounded bg-muted/50 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.meta}</p>
              </div>
              <input type="checkbox" className="ml-auto accent-primary" />
            </li>
          ))}
        </ul>
      )}
      <Button className="w-full" disabled={!connected}>
        {actionLabel}
      </Button>
    </div>
  );
}
