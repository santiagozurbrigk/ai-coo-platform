import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ProductBackLink({ label = "Volver a Producto" }: { label?: string }) {
  return (
    <Link
      href="/product"
      className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
