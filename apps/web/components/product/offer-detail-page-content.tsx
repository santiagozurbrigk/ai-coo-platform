"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@ai-coo/ui";
import { deleteProductAction } from "@/app/product/actions";
import { useToast } from "@/providers/toast-provider";
import { paths } from "@/routes/paths";
import type { ProductAvatar, ProductOffer } from "@/types/product";
import { OfferDetail } from "./offer-detail";
import { ProductOfferDialog } from "./product-offer-dialog";

export function OfferDetailPageContent({
  offer,
  avatars,
  hasRealData,
  canEdit,
}: {
  offer: ProductOffer;
  avatars: ProductAvatar[];
  hasRealData: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const result = await deleteProductAction(offer.id);
      if (!result.success) {
        push({ title: "No se pudo archivar", description: result.error });
        return;
      }
      push({ title: "Oferta archivada", variant: "success" });
      router.push(paths.platform.product.root);
      router.refresh();
    });
  };

  return (
    <>
      {canEdit && hasRealData ? (
        <div className="mb-4 flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={handleArchive}
          >
            Archivar
          </Button>
        </div>
      ) : null}
      <OfferDetail offer={offer} hasRealData={hasRealData} />
      <ProductOfferDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        offer={offer}
        avatars={avatars}
        onSaved={() => {
          router.refresh();
        }}
      />
    </>
  );
}
