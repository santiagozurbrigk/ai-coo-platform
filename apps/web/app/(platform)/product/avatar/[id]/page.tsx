import { notFound } from "next/navigation";
import { AvatarDetail, ProductBackLink } from "@/components/product";
import { mockProductData } from "@/mocks/product";

export default async function ProductAvatarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const avatar = mockProductData.avatars.find((a) => a.id === id);
  if (!avatar) notFound();

  return (
    <div>
      <ProductBackLink />
      <h1 className="mb-6 text-xl font-semibold text-foreground">
        {avatar.name} — Avatar
      </h1>
      <AvatarDetail avatar={avatar} />
    </div>
  );
}
