"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, Pencil, Star } from "lucide-react";
import { Button, cn, Input, Textarea } from "@ai-coo/ui";
import {
  reorderValueLadderAction,
  setCoreOfferAction,
  updateValueLadderStepAction,
} from "@/app/product/actions";
import { useToast } from "@/providers/toast-provider";
import type { ValueLadderStep } from "@/types/product";
import { paths } from "@/routes/paths";

export function ValueLadderSection({
  steps,
  canEdit = false,
  onUpdated,
}: {
  steps: ValueLadderStep[];
  canEdit?: boolean;
  onUpdated?: () => void;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [localSteps, setLocalSteps] = useState(steps);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  const refresh = () => {
    onUpdated?.();
    router.refresh();
  };

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= localSteps.length) return;
    const reordered = [...localSteps];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item!);
    setLocalSteps(reordered);

    const ids = reordered
      .map((s) => s.productId)
      .filter((id): id is string => Boolean(id));
    if (!ids.length) return;

    startTransition(async () => {
      const result = await reorderValueLadderAction({ productIds: ids });
      if (!result.success) {
        push({ title: "No se pudo reordenar", description: result.error });
        setLocalSteps(steps);
        return;
      }
      refresh();
    });
  };

  const markCore = (productId: string) => {
    startTransition(async () => {
      const result = await setCoreOfferAction(productId);
      if (!result.success) {
        push({ title: "No se pudo marcar core", description: result.error });
        return;
      }
      setLocalSteps((prev) =>
        prev.map((s) => ({
          ...s,
          isCore: s.productId === productId,
        }))
      );
      refresh();
    });
  };

  const startEdit = (step: ValueLadderStep) => {
    setEditingId(step.id);
    setEditName(step.name);
    setEditDescription(step.description);
  };

  const saveEdit = (step: ValueLadderStep) => {
    if (!step.productId) return;
    startTransition(async () => {
      const result = await updateValueLadderStepAction({
        productId: step.productId,
        name: editName.trim(),
        description: editDescription.trim(),
      });
      if (!result.success) {
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }
      setEditingId(null);
      setLocalSteps((prev) =>
        prev.map((s) =>
          s.id === step.id
            ? { ...s, name: editName.trim(), description: editDescription.trim() }
            : s
        )
      );
      refresh();
    });
  };

  return (
    <section id="value-ladder" className="scroll-mt-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Escalera de valor</h2>
      <div className="relative pb-10">
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10"
          aria-hidden
        />
        <div className="flex items-end gap-4 overflow-x-auto pb-8">
          {localSteps.map((step, i) => {
            const offerId = step.productId ?? step.id;
            const isEditing = editingId === step.id;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex w-52 shrink-0 flex-col rounded-t-xl border transition-all duration-200",
                  step.isCore
                    ? "border-violet-500/40 bg-violet-500/8"
                    : "border-border bg-muted/20 dark:border-white/8 dark:bg-white/3"
                )}
                style={{ height: `${140 + i * 40}px` }}
              >
                <div className="flex h-full flex-col justify-between p-4 text-left">
                  <div className="space-y-2">
                    {canEdit ? (
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                            disabled={pending || i === 0}
                            onClick={() => move(i, -1)}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                            disabled={pending || i === localSteps.length - 1}
                            onClick={() => move(i, 1)}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                            onClick={() => startEdit(step)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {step.productId ? (
                            <button
                              type="button"
                              className={cn(
                                "rounded p-0.5",
                                step.isCore
                                  ? "text-violet-500"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                              title="Marcar como core offer"
                              disabled={pending}
                              onClick={() => markCore(step.productId!)}
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() =>
                        router.push(paths.platform.product.offer(offerId))
                      }
                    >
                      <p className="text-lg font-bold text-foreground">
                        {step.price === 0 ? "Gratis" : `$${step.price.toLocaleString()}`}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {step.priceModel}
                      </p>
                    </button>
                  </div>

                  <div>
                    {step.isCore ? (
                      <span className="mb-2 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] text-violet-600 dark:text-violet-400">
                        Core offer
                      </span>
                    ) : null}
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7 text-xs"
                        />
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="text-[10px]"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 w-full text-xs"
                          disabled={pending}
                          onClick={() => saveEdit(step)}
                        >
                          Guardar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-foreground/90">
                          {step.name}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                          {step.description}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Cierres/mes</span>
                      <span>{step.closesPerMonth}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Tasa cierre</span>
                      <span>
                        {step.closeRate > 0 ? `${step.closeRate}%` : "Sin datos"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
          <p className="text-[10px] text-muted-foreground/60">
            Escalera de ascenso del cliente
          </p>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>
    </section>
  );
}
