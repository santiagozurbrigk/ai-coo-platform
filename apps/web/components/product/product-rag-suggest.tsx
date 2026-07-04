"use client";

import { useState, useTransition } from "react";
import { Sparkles, Trash2 } from "lucide-react";
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
  cn,
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
  SuggestedValueProposition,
} from "@/lib/rag/extract-product-context";
import { useToast } from "@/providers/toast-provider";

const PRODUCT_TYPES = [
  "curso",
  "mentoria",
  "consultoria",
  "comunidad",
  "evento",
  "otro",
] as const;

const BILLING_TYPES = ["unico", "mensual", "anual", "personalizado"] as const;

const FRAMEWORK_TYPES = [
  "script",
  "objeciones",
  "followup",
  "onboarding",
  "otro",
] as const;

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

type EditableAvatar = {
  id: string;
  included: boolean;
  data: SuggestedAvatar;
};

type EditableProduct = {
  id: string;
  included: boolean;
  data: SuggestedProduct;
};

type EditableFramework = {
  id: string;
  included: boolean;
  data: SuggestedFramework;
};

type EditableProposition = {
  included: boolean;
  data: {
    avatar: string;
    result: string;
    painRemoved: string;
    timeframe: string;
  };
};

function toEditableProposition(
  vp: SuggestedValueProposition | null
): EditableProposition {
  return {
    included: true,
    data: {
      avatar: vp?.avatar ?? "",
      result: vp?.result ?? "",
      painRemoved: vp?.pain_removed ?? "",
      timeframe: vp?.timeframe ?? "",
    },
  };
}

function IncludeToggle({
  included,
  onChange,
  label = "Incluir al guardar",
}: {
  included: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border"
        checked={included}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

const selectClass =
  "flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm";

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
  const [avatarRow, setAvatarRow] = useState<EditableAvatar | null>(null);
  const [productRows, setProductRows] = useState<EditableProduct[]>([]);
  const [frameworkRows, setFrameworkRows] = useState<EditableFramework[]>([]);
  const [proposition, setProposition] = useState<EditableProposition | null>(null);

  if (hasRealData || !canEdit) return null;

  const loadSuggestion = (data: ProductContextExtraction) => {
    setAvatarRow(
      data.suggestedAvatar
        ? {
            id: crypto.randomUUID(),
            included: true,
            data: data.suggestedAvatar,
          }
        : null
    );
    setProductRows(
      data.suggestedProducts.map((p) => ({
        id: crypto.randomUUID(),
        included: true,
        data: p,
      }))
    );
    setFrameworkRows(
      data.suggestedFrameworks.map((f) => ({
        id: crypto.randomUUID(),
        included: true,
        data: f,
      }))
    );
    setProposition(toEditableProposition(data.suggestedValueProposition));
  };

  const handleExtract = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const result = await extractAndSuggestProductContextAction();
        if (!result.success) {
          push({
            title: "No se pudo analizar el contexto",
            description: result.error,
          });
          return;
        }
        loadSuggestion(result.data);
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
      const avatar =
        avatarRow?.included && avatarRow.data.name?.trim() && avatarRow.data.main_pain?.trim()
          ? avatarRow.data
          : null;

      const products = productRows
        .filter((row) => row.included && row.data.name?.trim())
        .map((row) => row.data);

      const frameworks = frameworkRows
        .filter(
          (row) =>
            row.included &&
            row.data.name?.trim() &&
            row.data.content?.trim()
        )
        .map((row) => row.data);

      const propositionPayload =
        proposition?.included &&
        (proposition.data.avatar.trim() ||
          proposition.data.result.trim() ||
          proposition.data.painRemoved.trim() ||
          proposition.data.timeframe.trim())
          ? proposition.data
          : undefined;

      if (!avatar && products.length === 0 && frameworks.length === 0 && !propositionPayload) {
        push({
          title: "Nada para guardar",
          description: "Incluí al menos un avatar, producto, framework o propuesta de valor.",
        });
        return;
      }

      const result = await applySuggestedProductContextAction({
        avatar,
        products,
        frameworks,
        proposition: propositionPayload,
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
        description: "Se guardó lo que editaste en el formulario.",
        variant: "success",
      });
      setOpen(false);
      onSaved();
    });
  };

  const hasDraft =
    avatarRow != null ||
    productRows.length > 0 ||
    frameworkRows.length > 0 ||
    proposition != null;

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
        <DialogContent className="flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>Revisá y editá la propuesta</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {hasDraft ? (
              <div className="space-y-6 text-sm">
                <p className="text-muted-foreground">
                  La IA sugirió lo siguiente. Editá cualquier campo y desmarcá lo que no
                  quieras crear antes de confirmar.
                </p>

                {proposition ? (
                  <section className="space-y-3 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium">Propuesta de valor</h3>
                      <IncludeToggle
                        included={proposition.included}
                        onChange={(included) =>
                          setProposition((prev) =>
                            prev ? { ...prev, included } : prev
                          )
                        }
                      />
                    </div>
                    <FormField label="Avatar (frase)">
                      <Input
                        value={proposition.data.avatar}
                        disabled={!proposition.included}
                        onChange={(e) =>
                          setProposition((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: { ...prev.data, avatar: e.target.value },
                                }
                              : prev
                          )
                        }
                      />
                    </FormField>
                    <FormField label="Resultado">
                      <Input
                        value={proposition.data.result}
                        disabled={!proposition.included}
                        onChange={(e) =>
                          setProposition((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: { ...prev.data, result: e.target.value },
                                }
                              : prev
                          )
                        }
                      />
                    </FormField>
                    <FormField label="Sin esto… (dolor que eliminás)">
                      <Input
                        value={proposition.data.painRemoved}
                        disabled={!proposition.included}
                        onChange={(e) =>
                          setProposition((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    painRemoved: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                    </FormField>
                    <FormField label="En cuánto tiempo">
                      <Input
                        value={proposition.data.timeframe}
                        disabled={!proposition.included}
                        onChange={(e) =>
                          setProposition((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    timeframe: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                    </FormField>
                  </section>
                ) : null}

                {avatarRow ? (
                  <section
                    className={cn(
                      "space-y-3 rounded-lg border border-border p-4",
                      !avatarRow.included && "opacity-60"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium">Avatar principal</h3>
                      <IncludeToggle
                        included={avatarRow.included}
                        onChange={(included) =>
                          setAvatarRow((prev) =>
                            prev ? { ...prev, included } : prev
                          )
                        }
                      />
                    </div>
                    <FormField label="Nombre">
                      <Input
                        value={avatarRow.data.name ?? ""}
                        disabled={!avatarRow.included}
                        onChange={(e) =>
                          setAvatarRow((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: { ...prev.data, name: e.target.value },
                                }
                              : prev
                          )
                        }
                      />
                    </FormField>
                    <FormField label="Dolor principal">
                      <Textarea
                        value={avatarRow.data.main_pain ?? ""}
                        disabled={!avatarRow.included}
                        onChange={(e) =>
                          setAvatarRow((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    main_pain: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        rows={2}
                      />
                    </FormField>
                    <FormField label="Dónde está / contexto">
                      <Input
                        value={avatarRow.data.where_they_hang ?? ""}
                        disabled={!avatarRow.included}
                        onChange={(e) =>
                          setAvatarRow((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    where_they_hang: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                    </FormField>
                    <FormField label="Deseos (uno por línea)">
                      <Textarea
                        value={(avatarRow.data.desires ?? []).join("\n")}
                        disabled={!avatarRow.included}
                        onChange={(e) =>
                          setAvatarRow((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    desires: linesToArray(e.target.value),
                                  },
                                }
                              : prev
                          )
                        }
                        rows={3}
                      />
                    </FormField>
                    <FormField label="Objeciones (una por línea)">
                      <Textarea
                        value={(avatarRow.data.objections ?? []).join("\n")}
                        disabled={!avatarRow.included}
                        onChange={(e) =>
                          setAvatarRow((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  data: {
                                    ...prev.data,
                                    objections: linesToArray(e.target.value),
                                  },
                                }
                              : prev
                          )
                        }
                        rows={3}
                      />
                    </FormField>
                  </section>
                ) : null}

                {productRows.length > 0 ? (
                  <section className="space-y-3">
                    <h3 className="font-medium">Ofertas / productos</h3>
                    {productRows.map((row, i) => (
                      <div
                        key={row.id}
                        className={cn(
                          "space-y-3 rounded-lg border border-border p-4",
                          !row.included && "opacity-60"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Producto {i + 1}
                          </p>
                          <div className="flex items-center gap-3">
                            <IncludeToggle
                              included={row.included}
                              onChange={(included) => {
                                const next = [...productRows];
                                next[i] = { ...row, included };
                                setProductRows(next);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-destructive"
                              onClick={() =>
                                setProductRows((prev) =>
                                  prev.filter((p) => p.id !== row.id)
                                )
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Quitar
                            </Button>
                          </div>
                        </div>
                        <FormField label="Nombre">
                          <Input
                            value={row.data.name ?? ""}
                            disabled={!row.included}
                            onChange={(e) => {
                              const next = [...productRows];
                              next[i] = {
                                ...row,
                                data: { ...row.data, name: e.target.value },
                              };
                              setProductRows(next);
                            }}
                          />
                        </FormField>
                        <FormField label="Descripción">
                          <Textarea
                            value={row.data.description ?? ""}
                            disabled={!row.included}
                            onChange={(e) => {
                              const next = [...productRows];
                              next[i] = {
                                ...row,
                                data: {
                                  ...row.data,
                                  description: e.target.value,
                                },
                              };
                              setProductRows(next);
                            }}
                            rows={2}
                          />
                        </FormField>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <FormField label="Precio (USD)">
                            <Input
                              type="number"
                              min={0}
                              value={
                                row.data.price != null ? String(row.data.price) : ""
                              }
                              disabled={!row.included}
                              onChange={(e) => {
                                const next = [...productRows];
                                const raw = e.target.value.trim();
                                next[i] = {
                                  ...row,
                                  data: {
                                    ...row.data,
                                    price: raw ? Number(raw) : null,
                                  },
                                };
                                setProductRows(next);
                              }}
                            />
                          </FormField>
                          <FormField label="Tipo">
                            <select
                              className={selectClass}
                              value={row.data.type ?? "otro"}
                              disabled={!row.included}
                              onChange={(e) => {
                                const next = [...productRows];
                                next[i] = {
                                  ...row,
                                  data: { ...row.data, type: e.target.value },
                                };
                                setProductRows(next);
                              }}
                            >
                              {PRODUCT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label="Facturación">
                            <select
                              className={selectClass}
                              value={row.data.billing_type ?? "unico"}
                              disabled={!row.included}
                              onChange={(e) => {
                                const next = [...productRows];
                                next[i] = {
                                  ...row,
                                  data: {
                                    ...row.data,
                                    billing_type: e.target.value,
                                  },
                                };
                                setProductRows(next);
                              }}
                            >
                              {BILLING_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </FormField>
                        </div>
                      </div>
                    ))}
                  </section>
                ) : null}

                {frameworkRows.length > 0 ? (
                  <section className="space-y-3">
                    <h3 className="font-medium">Frameworks de ventas</h3>
                    {frameworkRows.map((row, i) => (
                      <div
                        key={row.id}
                        className={cn(
                          "space-y-3 rounded-lg border border-border p-4",
                          !row.included && "opacity-60"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Framework {i + 1}
                          </p>
                          <div className="flex items-center gap-3">
                            <IncludeToggle
                              included={row.included}
                              onChange={(included) => {
                                const next = [...frameworkRows];
                                next[i] = { ...row, included };
                                setFrameworkRows(next);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-destructive"
                              onClick={() =>
                                setFrameworkRows((prev) =>
                                  prev.filter((f) => f.id !== row.id)
                                )
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Quitar
                            </Button>
                          </div>
                        </div>
                        <FormField label="Nombre">
                          <Input
                            value={row.data.name ?? ""}
                            disabled={!row.included}
                            onChange={(e) => {
                              const next = [...frameworkRows];
                              next[i] = {
                                ...row,
                                data: { ...row.data, name: e.target.value },
                              };
                              setFrameworkRows(next);
                            }}
                          />
                        </FormField>
                        <FormField label="Tipo">
                          <select
                            className={selectClass}
                            value={row.data.type ?? "otro"}
                            disabled={!row.included}
                            onChange={(e) => {
                              const next = [...frameworkRows];
                              next[i] = {
                                ...row,
                                data: { ...row.data, type: e.target.value },
                              };
                              setFrameworkRows(next);
                            }}
                          >
                            {FRAMEWORK_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Contenido">
                          <Textarea
                            value={row.data.content ?? ""}
                            disabled={!row.included}
                            onChange={(e) => {
                              const next = [...frameworkRows];
                              next[i] = {
                                ...row,
                                data: { ...row.data, content: e.target.value },
                              };
                              setFrameworkRows(next);
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
          </div>

          <DialogFooter className="shrink-0 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700"
              disabled={pending || !hasDraft}
              onClick={handleConfirm}
            >
              {pending ? "Guardando…" : "Guardar lo editado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
