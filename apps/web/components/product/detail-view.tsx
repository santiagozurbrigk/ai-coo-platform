"use client";

import Link from "next/link";
import { mockProductData } from "@/mocks/product";
import { paths } from "@/routes/paths";
import { AvatarsSection } from "./avatar-detail";
import { ValueLadderSection } from "./value-ladder-section";
import { PropositionSection } from "./proposition-section";

export function ProductDetailView() {
  const { avatars, valueLadder, offers, proposition } = mockProductData;

  return (
    <div className="space-y-10">
      <AvatarsSection avatars={avatars} />

      <ValueLadderSection steps={valueLadder} />

      <section id="offers" className="scroll-mt-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Ofertas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={paths.platform.product.offer(offer.id)}
              className="rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-violet-500/30 hover:bg-muted/30 dark:border-white/8"
            >
              <p className="font-semibold text-foreground">{offer.name}</p>
              <p className="mt-1 text-sm text-violet-600 dark:text-violet-400">
                ${offer.price.toLocaleString()}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {offer.promise}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <PropositionSection initial={proposition} />
    </div>
  );
}
