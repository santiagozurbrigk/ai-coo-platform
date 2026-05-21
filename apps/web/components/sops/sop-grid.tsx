import type { Sop } from "@/types/sops";
import { SopCard } from "./sop-card";

export function SopGrid({ sops }: { sops: Sop[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sops.map((sop) => (
        <SopCard key={sop.id} sop={sop} />
      ))}
    </div>
  );
}
