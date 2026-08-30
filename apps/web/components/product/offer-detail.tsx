"use client";

import { Check, Sparkles, User } from "lucide-react";
import type { ProductOffer } from "@/types/product";
import { MockPhaseBadge } from "./mock-phase-badge";

export function OfferDetail({
  offer,
  hasRealData,
}: {
  offer: ProductOffer;
  hasRealData?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">{offer.name}</h2>
            <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              ${offer.price.toLocaleString()}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{offer.promise}</p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">
            Para quién es
          </p>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
              <User className="h-3 w-3 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-sm text-foreground/80">{offer.targetAvatar}</p>
          </div>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-green-600/70 dark:text-green-400/70">
            Resultado prometido
          </p>
          <p className="text-sm text-foreground/80">{offer.promisedResult}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">En {offer.timeframe}</p>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            Qué incluye
          </p>
          <div className="space-y-2">
            {offer.includes.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/10 px-3 py-2.5 dark:border-white/6 dark:bg-white/2"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-500/15">
                  <Check className="h-3 w-3 text-brand-500 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/80">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70">
            Garantía
          </p>
          <p className="text-sm text-foreground/80">{offer.guarantee}</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-red-600/70 dark:text-red-400/70">
            Objeción que destruye
          </p>
          {offer.mainObjection ? (
            <>
              <p className="text-sm text-foreground/80">&quot;{offer.mainObjection}&quot;</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Cómo la manejamos: {offer.objectionHandler || "Sin datos"}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin objeción registrada por oferta. Las objeciones del avatar y de
              ventas aparecen en métricas cuando hay datos.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
              <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                Datos reales
              </p>
            </div>
            <MockPhaseBadge hasRealData={hasRealData} />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue generado (mes)</span>
              <span>{offer.stats.monthlyRevenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasa de cierre</span>
              <span>
                {offer.stats.closeRate > 0 ? `${offer.stats.closeRate}%` : "Sin datos"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Objeción más frecuente</span>
              <span>{offer.stats.topObjection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasa de completación</span>
              <span>
                {offer.stats.completionRate > 0
                  ? `${offer.stats.completionRate}%`
                  : "Sin datos"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/10 p-4 dark:border-white/6 dark:bg-white/2">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
            <p className="text-xs text-brand-600 dark:text-brand-400">Insight detectado</p>
            <MockPhaseBadge hasRealData={hasRealData} className="ml-auto" />
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {offer.aiInsight || "Sin insights de IA para esta oferta todavía."}
          </p>
        </div>
      </div>
    </div>
  );
}
