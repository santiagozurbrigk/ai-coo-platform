"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "./toast-provider";
import { CommandPaletteProvider } from "./command-palette-provider";
import { ToastViewport } from "@/components/shared/toast-viewport";
import { CommandPalette } from "@/components/navigation/command-palette";
import { WorkspaceProvider } from "./workspace-provider";

/** Providers de prototipo — workspace, toasts y paleta de comandos (Fase 0.7) */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CommandPaletteProvider>
        <WorkspaceProvider>
          {children}
          <ToastViewport />
          <CommandPalette />
        </WorkspaceProvider>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}
