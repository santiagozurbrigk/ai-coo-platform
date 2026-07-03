"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export function SidebarSection<T>({
  title,
  onAdd,
  items,
  renderItem,
}: {
  title: string;
  onAdd?: () => void;
  items: T[];
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center justify-between px-3 py-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {title}
        </p>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Añadir ${title.toLowerCase()}`}
          >
            <Plus className="h-3 w-3" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const key =
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            typeof (item as { id: unknown }).id === "string"
              ? (item as { id: string }).id
              : JSON.stringify(item);
          return <div key={key}>{renderItem(item)}</div>;
        })}
      </div>
    </div>
  );
}
