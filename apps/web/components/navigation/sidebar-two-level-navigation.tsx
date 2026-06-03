"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { SidebarDirectModule, SidebarNavConfig } from "@/lib/navigation/sidebar-nav-config";
import { SidebarRootNavigation } from "./sidebar-root-navigation";
import { SidebarSubNavigation } from "./sidebar-sub-navigation";

const SLIDE_TRANSITION = {
  duration: 0.18,
  ease: [0.32, 0.72, 0, 1] as const,
};

export function SidebarTwoLevelNavigation({
  config,
  collapsed,
  mapDirectModules,
  onLinkClick,
  className,
}: {
  config: SidebarNavConfig;
  collapsed?: boolean;
  mapDirectModules?: (modules: SidebarDirectModule[]) => SidebarDirectModule[];
  onLinkClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const [activeParent, setActiveParent] = useState<string | null>(null);

  useEffect(() => {
    setActiveParent(config.getParentFromPath(pathname));
  }, [pathname, config]);

  return (
    <div className={className ?? "relative flex-1 overflow-hidden"}>
      <AnimatePresence mode="wait" initial={false}>
        {activeParent === null ? (
          <motion.div
            key="root"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={SLIDE_TRANSITION}
            className="flex flex-col gap-0.5 py-2"
          >
            <SidebarRootNavigation
              config={config}
              onEnterModule={setActiveParent}
              collapsed={collapsed}
              mapDirectModules={mapDirectModules}
              onLinkClick={onLinkClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeParent}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={SLIDE_TRANSITION}
            className="flex flex-col gap-0.5 py-2"
          >
            <SidebarSubNavigation
              config={config}
              moduleKey={activeParent}
              onBack={() => setActiveParent(null)}
              collapsed={collapsed}
              onLinkClick={onLinkClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
