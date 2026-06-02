"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "./toast-provider";
import { CommandPaletteProvider } from "./command-palette-provider";
import { ToastViewport } from "@/components/shared/toast-viewport";
import { CommandPalette } from "@/components/navigation/command-palette";
import { WorkspaceProvider } from "./workspace-provider";
import { PlatformDataProvider } from "./platform-data-provider";
import { FinanceDataProvider } from "./finance-data-provider";
import { MarketingDataProvider } from "./marketing-data-provider";
import { FloatingChatProvider } from "./floating-chat-provider";

/** Providers de prototipo — workspace, toasts y paleta de comandos (Fase 0.7) */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CommandPaletteProvider>
        <WorkspaceProvider>
          <PlatformDataProvider>
            <FinanceDataProvider>
              <MarketingDataProvider>
                <FloatingChatProvider>
                  {children}
                  <ToastViewport />
                  <CommandPalette />
                </FloatingChatProvider>
              </MarketingDataProvider>
            </FinanceDataProvider>
          </PlatformDataProvider>
        </WorkspaceProvider>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}

export { usePlatformData } from "./platform-data-provider";
export { useFinanceData } from "./finance-data-provider";
export { useMarketingData } from "./marketing-data-provider";
export { useFloatingChat, FloatingChatProvider } from "./floating-chat-provider";
export type { AgentChatMessage } from "./floating-chat-provider";
export { ThemeProvider, useTheme } from "./theme-provider";
export type { Theme } from "./theme-provider";
