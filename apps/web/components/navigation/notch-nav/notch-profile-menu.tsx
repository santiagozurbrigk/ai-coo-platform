"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@ai-coo/ui";
import { signOutAction } from "@/app/auth/actions";
import {
  getProfileAreaDataAction,
  type ProfileAreaData,
} from "@/app/profile/actions";
import { getProfileInitials } from "@/lib/profile/initials";
import { es } from "@/lib/locale/es";
import { paths } from "@/routes";

/**
 * Perfil de la isla derecha: avatar, nombre, organización y cierre de sesión.
 *
 * Reemplaza al `SidebarProfileArea`, que era el único lugar de la plataforma
 * donde se veía de qué usuario y organización es la sesión.
 */
export function NotchProfileMenu() {
  const [data, setData] = useState<ProfileAreaData | null>(null);
  const signOutForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getProfileAreaDataAction()
      .then(setData)
      .catch(() =>
        setData({
          avatarUrl: null,
          userName: "Usuario",
          orgName: "Mi organización",
        })
      );
  }, []);

  const userName = data?.userName ?? "…";
  const orgName = data?.orgName ?? "…";
  const avatarUrl = data?.avatarUrl ?? null;

  return (
    <>
      {/* El submit se dispara por ref: Radix cierra el menú al seleccionar y un
          <button type="submit"> dentro del item puede perder el submit. */}
      <form ref={signOutForm} action={signOutAction} className="hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${userName} — ${orgName}`}
          title={`${userName} · ${orgName}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL externa de auth/avatar
            <img
              src={avatarUrl}
              alt={userName}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
            />
          ) : (
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
                "border border-brand-500/30 bg-brand-600/20 text-brand-600 dark:text-brand-400"
              )}
              aria-hidden
            >
              {getProfileInitials(userName)}
            </span>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={10} className="w-56">
          <div className="px-2 py-1.5">
            <p className="truncate text-xs font-semibold leading-tight text-foreground">
              {userName}
            </p>
            <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
              {orgName}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="gap-2">
            <Link href={paths.platform.settings}>
              <Settings className="h-4 w-4" />
              Ajustes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={(event) => {
              event.preventDefault();
              signOutForm.current?.requestSubmit();
            }}
          >
            <LogOut className="h-4 w-4" />
            {es.nav.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
