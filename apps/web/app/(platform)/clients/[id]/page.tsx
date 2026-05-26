"use client";

import { notFound, useParams } from "next/navigation";
import { ClientDetail } from "@/components/clients";
import { usePlatformData } from "@/providers";

export default function ClientDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { clients } = usePlatformData();
  const client = clients.find((c) => c.id === id);
  if (!client) notFound();
  return <ClientDetail client={client} />;
}
