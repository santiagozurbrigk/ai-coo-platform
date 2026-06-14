import { notFound } from "next/navigation";
import { AvatarDetail, ProductBackLink } from "@/components/product";
import { getProductAvatarById, getProductPageData } from "@/lib/product/queries";

export default async function ProductAvatarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ hasRealData }, avatar] = await Promise.all([
    getProductPageData(),
    getProductAvatarById(id),
  ]);

  if (!avatar) notFound();

  return (
    <div>
      <ProductBackLink />
      <h1 className="mb-6 text-xl font-semibold text-foreground">
        {avatar.name} — Avatar
      </h1>
      <AvatarDetail avatar={avatar} hasRealData={hasRealData} />
    </div>
  );
}
