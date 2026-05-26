import type { ReactNode } from "react";
import { Panel } from "@/components/shared/panel";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Panel title={title}>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {children}
    </Panel>
  );
}
