"use client";

import { useState, useTransition } from "react";
import { Globe, MessageCircle, Pencil, Trash2, Users } from "lucide-react";
import { Button, Input, Label } from "@ai-coo/ui";
import {
  deleteUTMLinkAction,
  getUTMFunnelAction,
  updateUTMLinkAction,
} from "@/app/marketing/actions";
import type { UTMFunnelData, UTMLinkRow } from "@/types/utm";
import { UTM_CONTENT_OPTIONS } from "@/types/utm";
import { UTMLeadsSheet } from "./utm-leads-sheet";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function UTMTable({
  links,
  onLinksChange,
}: {
  links: UTMLinkRow[];
  onLinksChange?: (links: UTMLinkRow[]) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<UTMLinkRow | null>(null);
  const [funnel, setFunnel] = useState<UTMFunnelData | null>(null);
  const [loadingLeads, startLoadLeads] = useTransition();
  const [editingLink, setEditingLink] = useState<UTMLinkRow | null>(null);
  const [editCampaign, setEditCampaign] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function copyToClipboard(url: string, key: string) {
    void navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function openLeads(link: UTMLinkRow) {
    setActiveLink(link);
    setSheetOpen(true);
    setFunnel(null);

    startLoadLeads(async () => {
      const result = await getUTMFunnelAction(link.id);
      if (result.success) {
        setFunnel(result.data);
      }
    });
  }

  function openEdit(link: UTMLinkRow) {
    setEditingLink(link);
    setEditCampaign(link.utm_campaign);
    setEditContent(link.utm_content ?? "");
    setEditError(null);
  }

  function handleSaveEdit() {
    if (!editingLink) return;
    setEditError(null);
    startTransition(async () => {
      const res = await updateUTMLinkAction(editingLink.id, {
        utm_campaign: editCampaign,
        utm_content: editContent || undefined,
      });
      if (!res.success) {
        setEditError(res.error);
        return;
      }
      const updated = res.data;
      onLinksChange?.(
        links.map((l) => (l.id === updated.id ? updated : l))
      );
      setEditingLink(null);
    });
  }

  function handleDelete(link: UTMLinkRow) {
    if (
      !window.confirm(
        `¿Eliminar el UTM "${link.utm_campaign}"? Las atribuciones históricas también se borrarán.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteUTMLinkAction(link.id);
      if (res.success) {
        onLinksChange?.(links.filter((l) => l.id !== link.id));
      }
    });
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground dark:border-glass">
        Todavía no creaste UTMs. Usá el generador para el primer link.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/60 dark:border-glass">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-left text-xs text-muted-foreground dark:border-glass dark:bg-glass">
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="px-4 py-3 font-medium">Campaña</th>
                <th className="px-4 py-3 font-medium text-right">Clicks</th>
                <th className="px-4 py-3 font-medium text-right">Leads</th>
                <th className="px-4 py-3 font-medium text-right">Bookings</th>
                <th className="px-4 py-3 font-medium text-right">Ventas</th>
                <th className="px-4 py-3 font-medium text-right">Revenue</th>
                <th className="px-4 py-3 font-medium">Links</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr
                  key={link.id}
                  className="border-b border-border/40 transition-colors hover:bg-muted/15 dark:border-glass/60"
                >
                  <td className="max-w-[180px] truncate px-4 py-3 font-medium">
                    {link.youtube_video_title ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {link.utm_campaign}
                    {link.utm_content ? (
                      <span className="mt-0.5 block text-[10px] text-muted-foreground/70">
                        {link.utm_content}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {link.clicks}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {link.leads_captured}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {link.bookings_attributed}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {link.sales_attributed}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney(Number(link.revenue_attributed))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[10px]"
                        onClick={() =>
                          copyToClipboard(link.full_url, `${link.id}-landing`)
                        }
                      >
                        <Globe className="h-3 w-3" />
                        Landing
                      </Button>
                      {link.manychat_url ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-[10px]"
                          onClick={() =>
                            copyToClipboard(
                              link.manychat_url!,
                              `${link.id}-dm`
                            )
                          }
                        >
                          <MessageCircle className="h-3 w-3" />
                          DM
                        </Button>
                      ) : null}
                    </div>
                    {copiedKey === `${link.id}-landing` ||
                    copiedKey === `${link.id}-dm` ? (
                      <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        Copiado
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openLeads(link)}
                      >
                        <Users className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(link)}
                        disabled={pending}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link)}
                        disabled={pending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingLink ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg space-y-4">
            <h3 className="font-medium">Editar UTM</h3>
            <p className="text-xs text-muted-foreground truncate">
              {editingLink.youtube_video_title ?? editingLink.utm_campaign}
            </p>
            <div className="space-y-2">
              <Label htmlFor="edit-campaign">Campaña</Label>
              <Input
                id="edit-campaign"
                value={editCampaign}
                onChange={(e) => setEditCampaign(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Contenido (utm_content)</Label>
              <select
                id="edit-content"
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              >
                <option value="">—</option>
                {UTM_CONTENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {editError ? (
              <p className="text-sm text-destructive">{editError}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLink(null)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={pending || !editCampaign.trim()}
              >
                {pending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <UTMLeadsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        link={activeLink}
        funnel={funnel}
        loading={loadingLeads}
      />
    </>
  );
}
