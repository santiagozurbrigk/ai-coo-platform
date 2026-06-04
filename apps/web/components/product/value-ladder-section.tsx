"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { ValueLadderStep } from "@/types/product";
import { paths } from "@/routes/paths";

export function ValueLadderSection({ steps }: { steps: ValueLadderStep[] }) {
  const router = useRouter();

  return (
    <section id="value-ladder" className="scroll-mt-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Escalera de valor</h2>
      <div className="relative pb-10">
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10"
          aria-hidden
        />
        <div className="flex items-end gap-4 overflow-x-auto pb-8">
          {steps.map((step, i) => (
            <motion.button
              key={step.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex w-44 shrink-0 cursor-pointer flex-col rounded-t-xl border transition-all duration-200 hover:scale-[1.02]",
                step.isCore
                  ? "border-violet-500/40 bg-violet-500/8"
                  : "border-border bg-muted/20 dark:border-white/8 dark:bg-white/3"
              )}
              style={{ height: `${140 + i * 40}px` }}
              onClick={() => router.push(paths.platform.product.offer(step.id))}
            >
              <div className="flex h-full flex-col justify-between p-4 text-left">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {step.price === 0 ? "Gratis" : `$${step.price.toLocaleString()}`}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {step.priceModel}
                  </p>
                </div>
                <div>
                  {step.isCore ? (
                    <span className="mb-2 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] text-violet-600 dark:text-violet-400">
                      Core offer
                    </span>
                  ) : null}
                  <p className="text-xs font-semibold text-foreground/90">{step.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Cierres/mes</span>
                    <span>{step.closesPerMonth}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Tasa cierre</span>
                    <span>{step.closeRate}%</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
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
