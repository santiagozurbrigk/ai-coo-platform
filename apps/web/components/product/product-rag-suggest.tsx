"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Textarea,
} from "@ai-coo/ui";
import {
  applySuggestedProductContextAction,
  extractAndSuggestProductContextAction,
} from "@/app/product/actions";
import type {
  ProductContextExtraction,
  SuggestedAvatar,
  SuggestedFramework,
  SuggestedProduct,
} from "@/lib/rag/extract-product-context";
import { useToast } from "@/providers/toast-provider";

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProductRagSuggestButton({
  hasRealData,
  canEdit,
  onSaved,
}: {
  hasRealData: boolean;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<ProductContextExtraction | null>(
    null
  );
  const [avatar, setAvatar] = useState<SuggestedAvatar | null>(null);
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [frameworks, setFrameworks] = useState<SuggestedFramework[]>([]);

  if (hasRealData || !canEdit) return null;

  const handleExtract = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const result = await extractAndSuggestProductContextAction();
        setSuggestion(result);
        setAvatar(result.suggestedAvatar);
        setProducts(result.suggestedProducts);
        setFrameworks(result.suggestedFrameworks);
        setOpen(true);
      } catch (err) {
        push({
          title: "No se pudo analizar el contexto",
          description: err instanceof Error ? err.message : "Error inesperado",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await applySuggestedProductContextAction({
        avatar,
        products,
        frameworks,
      });
      if (!result.success) {
        push({
          title: "Error al guardar",
          description: result.error,
        });
        return;
      }
      push({
        title: "Contexto guardado",
        description: "Avatar, productos y frameworks creados desde el análisis RAG.",
      });
      setOpen(false);
      onSaved();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 border-violet-500/30 text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
        disabled={loading || pending}
        onClick={handleExtract}
      >
        <Sparkles className="h-4 w-4" />
        {loading ? "Analizando…" : "Auto-completar desde el contexto del negocio"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Propuesta de la IA</DialogTitle>
          </DialogHeader>

          {suggestion ? (
            <div className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                La IA analizó tus calls y documentos y propone lo siguiente. Podés editar
                antes de confirmar.
              </p>

              {avatar ? (
                <section className="space-y-3 rounded-lg border border-border p-4">
                  <h3 className="font-medium">Avatar principal</h3>
                  <FormField label="Nombre">
                    <Input
                      value={avatar.name ?? ""}
                      onChange={(e) =>
                        setAvatar({ ...avatar, name: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Dolor principal">
                    <Textarea
                      value={avatar.main_pain ?? ""}
                      onChange={(e) =>
                        setAvatar({ ...avatar, main_pain: e.target.value })
                      }
                      rows={2}
                    />
                  </FormField>
                  <FormField label="Deseos (uno por línea)">
                    <Textarea
                      value={(avatar.desires ?? []).join("\n")}
                      onChange={(e) =>
                        setAvatar({ ...avatar, desires: linesToArray(e.target.value) })
                      }
                      rows={3}
                    />
                  </FormField>
                  <FormField label="Objeciones (una por línea)">
                    <Textarea
                      value={(avatar.objections ?? []).join("\n")}
                      onChange={(e) =>
                        setAvatar({
                          ...avatar,
                          objections: linesToArray(e.target.value),
                        })
                      }
                      rows={3}
                    />
                  </FormField>
                </section>
              ) : null}

              {products.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="font-medium">Productos detectados</h3>
                  {products.map((product, i) => (
                    <div
                      key={`${product.name}-${i}`}
                      className="space-y-2 rounded-lg border border-border p-4"
                    >
                      <FormField label="Nombre">
                        <Input
                          value={product.name ?? ""}
                          onChange={(e) => {
                            const next = [...products];
                            next[i] = { ...product, name: e.target.value };
                            setProducts(next);
                          }}
                        />
                      </FormField>
                      <FormField label="Descripción">
                        <Textarea
                          value={product.description ?? ""}
                          onChange={(e) => {
                            const next = [...products];
                            next[i] = { ...product, description: e.target.value };
                            setProducts(next);
                          }}
                          rows={2}
                        />
                      </FormField>
                    </div>
                  ))}
                </section>
              ) : null}

              {frameworks.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="font-medium">Frameworks detectados</h3>
                  {frameworks.map((framework, i) => (
                    <div
                      key={`${framework.name}-${i}`}
                      className="space-y-2 rounded-lg border border-border p-4"
                    >
                      <FormField label="Nombre">
                        <Input
                          value={framework.name ?? ""}
                          onChange={(e) => {
                            const next = [...frameworks];
                            next[i] = { ...framework, name: e.target.value };
                            setFrameworks(next);
                          }}
                        />
                      </FormField>
                      <FormField label="Contenido">
                        <Textarea
                          value={framework.content ?? ""}
                          onChange={(e) => {
                            const next = [...frameworks];
                            next[i] = { ...framework, content: e.target.value };
                            setFrameworks(next);
                          }}
                          rows={4}
                        />
                      </FormField>
                    </div>
                  ))}
                </section>
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700"
              disabled={pending || !suggestion}
              onClick={handleConfirm}
            >
              {pending ? "Guardando…" : "Confirmar todo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
