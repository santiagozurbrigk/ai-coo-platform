"use client";

/**
 * Los tres apartados de información del cliente: Marketing, Ventas y Sistemas.
 *
 * ⭐ Los campos **no están horneados en el código**. Salen de las columnas
 * configurables que cada organización define, agrupadas por su sección. El
 * pedido traía una lista de 22 campos concretos y la tentación era escribirlos
 * acá; se cargan con un botón desde Campos personalizados, y así renombrarlos,
 * archivarlos o agregar otros no necesita a nadie que toque código.
 *
 * ⭐ Una solapa sin campos configurados no aparece. Una organización que sólo
 * usa Marketing ve una sola solapa, no tres con dos vacías.
 */

import { useState } from "react";
import { Button, cn } from "@ai-coo/ui";
import { Check, ExternalLink, Layers, Loader2, Pencil, X } from "lucide-react";
import { updateClientCustomFieldsAction } from "@/app/clients/client-custom-fields-actions";
import { ACCION_DE_FILA, FichaCard } from "@/components/clients/ficha-section";
import { FieldValueCell } from "@/components/clients/custom-fields/field-value-cell";
import { FieldValueInput } from "@/components/clients/custom-fields/field-value-input";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import {
  FIELD_SECTION_LABEL,
  FIELD_SECTIONS,
  type FieldDefinition,
  type FieldSection,
} from "@/types/custom-fields";
import type { Client } from "@/types/clients";

/**
 * ¿Lo que pegaron es un link?
 *
 * ⭐ El founder lo dijo explícito: «puede ser un link a un documento, a un
 * tablero de Miro, o texto escrito». Un link pegado como texto plano obliga a
 * copiarlo y pegarlo en otra pestaña; detectarlo cuesta una función y ahorra ese
 * viaje cada vez.
 */
function comoLink(value: unknown): { href: string; label: string } | null {
  if (typeof value !== "string") return null;
  const texto = value.trim();
  if (!/^https?:\/\/\S+$/i.test(texto)) return null;

  try {
    const url = new URL(texto);
    return {
      href: texto,
      // El dominio alcanza para reconocerlo —«miro.com», «docs.google.com»— y
      // entra en una columna angosta; la URL entera no.
      label: url.hostname.replace(/^www\./, ""),
    };
  } catch {
    return null;
  }
}

function ValorDelCampo({ field, value }: { field: FieldDefinition; value: unknown }) {
  const link = comoLink(value);

  /*
    La plantilla carga todos los campos como texto, pero nada impide configurar
    un apartado con una fecha o una lista de opciones. Ese caso lo dibuja quien
    ya sabe hacerlo, con su color y su formato.
  */
  if (!link && field.fieldType !== "text") {
    return <FieldValueCell field={field} value={value} />;
  }

  if (link) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        title={link.href}
      >
        <span className="truncate">{link.label}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    );
  }

  const texto = typeof value === "string" ? value.trim() : "";
  if (!texto) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">{texto}</p>
  );
}

export function ClientSectionsCard({
  client,
  fields,
}: {
  client: Client;
  /** Las columnas activas del cliente. Se filtran por sección acá adentro. */
  fields: FieldDefinition[];
}) {
  const { refreshClients } = usePlatformData();
  const { push } = useToast();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const porSeccion = FIELD_SECTIONS.map((section) => ({
    section,
    fields: fields.filter((field) => field.section === section),
  })).filter((grupo) => grupo.fields.length > 0);

  const [activa, setActiva] = useState<FieldSection>(
    porSeccion[0]?.section ?? "marketing"
  );

  // Sin ningún campo con sección configurado, la tarjeta no existe.
  if (porSeccion.length === 0) return null;

  const grupo = porSeccion.find((g) => g.section === activa) ?? porSeccion[0]!;

  const empezarAEditar = () => {
    setDraft({ ...(client.custom ?? {}) });
    setEditando(true);
  };

  const guardar = async () => {
    setSaving(true);
    const result = await updateClientCustomFieldsAction({
      clientId: client.id,
      values: draft,
    });
    setSaving(false);

    if (!result.success) {
      push({ title: "No se pudo guardar", description: result.error });
      return;
    }
    await refreshClients();
    setEditando(false);
    push({ title: "Información guardada", variant: "success" });
  };

  return (
    <FichaCard
      icon={Layers}
      title="Información del cliente"
      action={
        editando ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(ACCION_DE_FILA, "h-7 w-7 p-0")}
              title="Cancelar"
              onClick={() => setEditando(false)}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={guardar}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Guardar
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={empezarAEditar}
          >
            <Pencil className="h-3 w-3" />
            Editar
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {/* Las solapas. Con una sola sección configurada no hacen falta. */}
        {porSeccion.length > 1 ? (
          <div
            className="flex gap-1 rounded-lg bg-muted/50 p-1 dark:bg-white/[0.03]"
            role="tablist"
          >
            {porSeccion.map(({ section, fields: campos }) => {
              const activaEsta = section === activa;
              const cargados = campos.filter((field) => {
                const value = client.custom?.[field.key];
                return typeof value === "string" ? value.trim() !== "" : value != null;
              }).length;

              return (
                <button
                  key={section}
                  type="button"
                  role="tab"
                  aria-selected={activaEsta}
                  onClick={() => setActiva(section)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    activaEsta
                      ? "bg-background text-foreground shadow-sm dark:bg-white/[0.08]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {FIELD_SECTION_LABEL[section]}
                  {/*
                    Cuántos de sus campos están cargados. Es lo que dice de un
                    vistazo qué apartado está vacío sin tener que abrirlo.
                  */}
                  <span className="ml-1 text-[10px] tabular-nums opacity-60">
                    {cargados}/{campos.length}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <dl className="space-y-3">
          {grupo.fields.map((field) => (
            <div key={field.id} className="space-y-1">
              {editando ? (
                <FieldValueInput
                  field={field}
                  value={draft[field.key]}
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, [field.key]: value }))
                  }
                />
              ) : (
                <>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd>
                    <ValorDelCampo field={field} value={client.custom?.[field.key]} />
                  </dd>
                </>
              )}
            </div>
          ))}
        </dl>
      </div>
    </FichaCard>
  );
}
