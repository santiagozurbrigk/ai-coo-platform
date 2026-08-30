"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button } from "@ai-coo/ui";
import { deleteProductAction } from "@/app/product/actions";
import { paths } from "@/routes/paths";
import type { ProductData } from "@/types/product";
import { AvatarsSection } from "./avatar-detail";
import { ProductOfferDialog } from "./product-offer-dialog";
import { PropositionSection } from "./proposition-section";
import { SalesFrameworksSection } from "./sales-frameworks-section";
import { ValueLadderSection } from "./value-ladder-section";

export function ProductDetailView({
  productData,
  hasRealData,
  canEdit,
  onUpdated,
}: {
  productData: ProductData;
  hasRealData: boolean;
  canEdit: boolean;
  onUpdated: () => void;
}) {
  const router = useRouter();
  const [offerOpen, setOfferOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { avatars, valueLadder, offers, proposition } = productData;
  const editingOffer = offers.find((o) => o.id === editingOfferId) ?? null;

  const handleArchive = (productId: string) => {
    if (!canEdit || !hasRealData) return;
    startTransition(async () => {
      await deleteProductAction(productId);
      onUpdated();
    });
  };

  return (
    <div className="space-y-10">
      <AvatarsSection
        avatars={avatars}
        hasRealData={hasRealData}
        canEdit={canEdit}
        onUpdated={onUpdated}
      />

      <ValueLadderSection
        steps={valueLadder}
        canEdit={canEdit && hasRealData}
        onUpdated={onUpdated}
      />

      <SalesFrameworksSection canEdit={canEdit && hasRealData} />

      <section id="offers" className="scroll-mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Ofertas</h2>
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              className="bg-brand-600 hover:bg-brand-700"
              onClick={() => {
                setEditingOfferId(null);
                setOfferOpen(true);
              }}
            >
              Nuevo producto
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-xl border border-border bg-card/50 p-4 dark:border-white/8"
            >
              <Link
                href={paths.platform.product.offer(offer.id)}
                className="block transition-colors hover:opacity-90"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{offer.name}</p>
                  <Badge variant="outline" className="text-[10px]">
                    Producto
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
                  ${offer.price.toLocaleString()} · {offer.timeframe}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {offer.promise}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Avatar: {offer.targetAvatar}
                </p>
              </Link>
              {canEdit && hasRealData ? (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditingOfferId(offer.id);
                      setOfferOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={pending}
                    onClick={() => handleArchive(offer.id)}
                  >
                    Archivar
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <PropositionSection
        initial={proposition}
        canEdit={canEdit}
        onSaved={onUpdated}
      />

      <ProductOfferDialog
        open={offerOpen}
        onOpenChange={setOfferOpen}
        offer={editingOffer}
        avatars={avatars}
        onSaved={() => {
          onUpdated();
          router.refresh();
        }}
      />
    </div>
  );
}
