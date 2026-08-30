"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Sparkles, Star, User } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import { deleteAvatarAction } from "@/app/product/actions";
import type { ProductAvatar } from "@/types/product";
import { paths } from "@/routes/paths";
import { MockPhaseBadge } from "./mock-phase-badge";
import { ProductAvatarDialog } from "./product-avatar-dialog";

export function AvatarDetail({
  avatar,
  hasRealData,
  onUpdated,
}: {
  avatar: ProductAvatar;
  hasRealData?: boolean;
  onUpdated?: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      {hasRealData ? (
        <div className="mb-4 flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteAvatarAction(avatar.id);
                onUpdated?.();
                router.push(`${paths.platform.product.root}?view=detail`);
                router.refresh();
              })
            }
          >
            Eliminar
          </Button>
        </div>
      ) : null}
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col items-center gap-4">
        <div className="glass-liquid-subtle flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-border dark:border-white/10">
          {avatar.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="p-4 text-center">
              <User className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
              <p className="text-[10px] text-muted-foreground">Foto del avatar</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {avatar.name}, {avatar.age}
          </h3>
          <p className="text-sm text-muted-foreground">{avatar.role}</p>
          <p className="mt-1 text-xs text-muted-foreground/80">{avatar.location}</p>
        </div>
        <div className="w-full space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue actual</span>
            <span>{avatar.currentRevenue}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue objetivo</span>
            <span>{avatar.targetRevenue}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tiempo en el mercado</span>
            <span>{avatar.yearsInBusiness}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-liquid-subtle rounded-xl border border-border p-4 dark:border-white/6">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Lo que se dice a sí mismo
          </p>
          <p className="text-sm italic leading-relaxed text-foreground/90">
            {avatar.innerVoice}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Dolores
          </p>
          <div className="space-y-1.5">
            {avatar.pains.map((pain) => (
              <div key={pain} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/60" />
                {pain}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Sueños
          </p>
          <div className="space-y-1.5">
            {avatar.dreams.map((dream) => (
              <div key={dream} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400/60" />
                {dream}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Objeciones principales
          </p>
          <div className="space-y-2">
            {avatar.objections.map((obj) => (
              <div
                key={obj.text}
                className="rounded-lg border border-border bg-muted/20 px-3 py-2 dark:border-white/7 dark:bg-white/3"
              >
                <p className="text-xs text-foreground/80">&quot;{obj.text}&quot;</p>
                {obj.frequency != null ? (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {obj.frequency}% de los leads
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-amber-600/80 dark:text-amber-400/70">
            Trigger de compra
          </p>
          <p className="text-xs text-foreground/80">{avatar.buyTrigger}</p>
        </div>
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
              Detectado en ventas
            </p>
            <MockPhaseBadge hasRealData={hasRealData} className="ml-auto" />
          </div>
          <div className="space-y-2">
            {avatar.aiInsights.map((insight) => (
              <p key={insight} className="text-[11px] leading-relaxed text-muted-foreground">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
      <ProductAvatarDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        avatar={avatar}
        onSaved={() => {
          onUpdated?.();
          router.refresh();
        }}
      />
    </>
  );
}

export function AvatarsSection({
  avatars,
  showListOnly,
  hasRealData = false,
  canEdit = false,
  onUpdated,
}: {
  avatars: ProductAvatar[];
  showListOnly?: boolean;
  hasRealData?: boolean;
  canEdit?: boolean;
  onUpdated?: () => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section id="avatars" className="scroll-mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Avatares del negocio</h2>
        {canEdit ? (
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
            onClick={() => setCreateOpen(true)}
          >
            + Crear avatar
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            disabled
          >
            + Nuevo
          </button>
        )}
      </div>
      <div className="rounded-xl border border-border bg-card/50 dark:border-white/8">
        {avatars.map((avatar) => (
          <Link
            key={avatar.id}
            href={paths.platform.product.avatar(avatar.id)}
            className={cn(
              "flex items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/30 dark:border-white/6",
              showListOnly && "pointer-events-auto"
            )}
          >
            {avatar.isMain ? (
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
            ) : (
              <span className="w-4 text-center text-muted-foreground">·</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {avatar.name}, {avatar.age} — {avatar.isMain ? "Avatar principal" : "Sub-avatar"}
              </p>
              <p className="text-xs text-muted-foreground">{avatar.role}</p>
            </div>
          </Link>
        ))}
      </div>
      <ProductAvatarDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => onUpdated?.()}
      />
    </section>
  );
}
