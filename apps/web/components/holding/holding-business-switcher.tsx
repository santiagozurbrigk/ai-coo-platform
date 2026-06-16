"use client";

import { useTransition } from "react";
import { Building2, ChevronDown, Store } from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ai-coo/ui";
import {
  resetToHoldingViewAction,
  switchActiveBusinessAction,
} from "@/app/(platform)/holding/actions";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";

export function HoldingBusinessSwitcher() {
  const { isHolding, holdingOrgId, activeOrgId, viewingBusiness, businesses } =
    useHoldingSession();
  const [pending, startTransition] = useTransition();

  if (!isHolding || !holdingOrgId) return null;

  const activeBusiness = businesses.find(
    (b) => b.business_org?.id === activeOrgId
  );
  const label = viewingBusiness
    ? activeBusiness?.business_name ??
      activeBusiness?.business_org?.name ??
      "Negocio activo"
    : "Vista general del holding";

  function selectHoldingView() {
    startTransition(() => {
      void resetToHoldingViewAction();
    });
  }

  function selectBusiness(businessOrgId: string) {
    startTransition(() => {
      void switchActiveBusinessAction(businessOrgId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 max-w-[220px] justify-between gap-2 text-xs"
            disabled={pending}
          >
            <span className="truncate">{label}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={selectHoldingView}>
            <Building2 className="mr-2 h-3.5 w-3.5" />
            Vista general del holding
          </DropdownMenuItem>
          {businesses.length > 0 && <DropdownMenuSeparator />}
          {businesses.map((b) => {
            const orgId = b.business_org?.id;
            if (!orgId) return null;
            return (
              <DropdownMenuItem
                key={b.id}
                onClick={() => selectBusiness(orgId)}
              >
                <Store className="mr-2 h-3.5 w-3.5" />
                {b.business_name ?? b.business_org?.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {viewingBusiness && (
        <Badge
          variant="ai"
          className="hidden text-[10px] sm:inline-flex"
        >
          Viendo como founder
        </Badge>
      )}
    </div>
  );
}
