"use client";

import { cn } from "@ai-coo/ui";

export type SettingsTabId =
  | "general"
  | "perfil"
  | "notificaciones"
  | "ia"
  | "seguridad"
  | "pagos";

const BASE_TABS: { id: SettingsTabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "perfil", label: "Perfil" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "ia", label: "IA" },
  { id: "seguridad", label: "Seguridad" },
];

const PAYMENTS_TAB = { id: "pagos" as const, label: "Pagos" };

export function SettingsTabNav({
  activeTab,
  onTabChange,
  showPaymentsTab = false,
}: {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
  showPaymentsTab?: boolean;
}) {
  const tabs = showPaymentsTab ? [...BASE_TABS, PAYMENTS_TAB] : BASE_TABS;
  return (
    <nav className="border-b border-border/40">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                active
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
