"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  DEFAULT_WORKSPACE_ID,
  type WorkspaceContext,
} from "@/workspaces";

const defaultWorkspace: WorkspaceContext = {
  workspaceId: DEFAULT_WORKSPACE_ID,
  organizationId: "org_default",
  name: "Espacio principal",
  slug: "default",
  isDefault: true,
};

const WorkspaceCtx = createContext<WorkspaceContext>(defaultWorkspace);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  return (
    <WorkspaceCtx.Provider value={defaultWorkspace}>
      {children}
    </WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
