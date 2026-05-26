import Link from "next/link";
import { Panel } from "@/components/shared/panel";
import { flowLinks } from "@/lib/navigation/flow-links";
import type { MemoryChunk } from "@/types/intelligence";

export function MemoryList({ chunks }: { chunks: MemoryChunk[] }) {
  return (
    <Panel title="Memoria organizacional">
      <ul className="divide-y divide-border">
        {chunks.map((chunk) => (
          <li key={chunk.id}>
            <Link
              href={flowLinks.memory(chunk.id)}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-colors hover:text-foreground"
            >
              <div>
                <p className="text-sm font-medium">{chunk.label}</p>
                <p className="text-2xs text-muted-foreground capitalize">{chunk.type}</p>
              </div>
              <span className="text-2xs text-muted-foreground">{chunk.lastAccessed}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
